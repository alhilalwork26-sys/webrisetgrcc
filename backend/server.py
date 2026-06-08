from __future__ import annotations

import json
import secrets
import sqlite3
import tempfile
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

import cgi

from drive_client import source_mime_type, upload_to_drive
from init_db import DB_PATH, init_db, verify_password

HOST = "127.0.0.1"
PORT = 8000
SESSION_DAYS = 7


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def user_payload(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "role": row["role_id"],
        "department": row["department"],
        "initials": row["initials"],
        "color": row["color"],
        "online": True,
    }


def all_users(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute(
        """
        SELECT id, name, email, role_id, department, initials, color
        FROM users
        WHERE active = 1
        ORDER BY name
        """
    ).fetchall()
    return [user_payload(row) for row in rows]


class PortalHandler(BaseHTTPRequestHandler):
    server_version = "GRCCPortalAPI/0.1"

    def end_headers(self) -> None:
        origin = self.headers.get("Origin", "http://127.0.0.1:5173")
        allowed_origins = {"http://127.0.0.1:5173", "http://localhost:5173"}
        self.send_header("Access-Control-Allow-Origin", origin if origin in allowed_origins else "http://127.0.0.1:5173")
        self.send_header("Access-Control-Allow-Credentials", "true")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.end_headers()

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/api/health":
            self.write_json({"ok": True, "database": str(DB_PATH), "time": now_iso()})
            return
        if path == "/api/auth/me":
            user = self.require_user()
            if not user:
                return
            self.write_json({"user": user})
            return
        if path == "/api/state":
            user = self.require_user()
            if not user:
                return
            with connect() as conn:
                state = self.read_state(conn)
                self.write_json({"state": state, "users": all_users(conn)})
            return
        self.write_error(404, "Endpoint tidak ditemukan.")

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        if path == "/api/auth/login":
            self.login()
            return
        if path == "/api/auth/logout":
            token = self.bearer_token()
            if token:
                with connect() as conn:
                    conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
                    conn.commit()
            self.write_json({"ok": True})
            return
        if path == "/api/documents/upload":
            self.upload_document()
            return
        self.write_error(404, "Endpoint tidak ditemukan.")

    def do_PUT(self) -> None:
        path = urlparse(self.path).path
        if path == "/api/state":
            user = self.require_user()
            if not user:
                return
            body = self.read_body()
            state = body.get("state")
            if not isinstance(state, dict):
                self.write_error(400, "Payload state wajib berupa object.")
                return
            with connect() as conn:
                conn.execute(
                    """
                    UPDATE app_state
                    SET payload_json = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = 1
                    """,
                    (json.dumps(state, ensure_ascii=False),),
                )
                conn.execute(
                    """
                    INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, after_json)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        f"al{int(datetime.now().timestamp() * 1000)}",
                        user["id"],
                        "Sinkronisasi state portal",
                        "app_state",
                        "1",
                        json.dumps({"updatedAt": now_iso()}, ensure_ascii=False),
                    ),
                )
                conn.commit()
            self.write_json({"ok": True, "updatedAt": now_iso()})
            return
        self.write_error(404, "Endpoint tidak ditemukan.")

    def login(self) -> None:
        body = self.read_body()
        email = str(body.get("email", "")).strip().lower()
        password = str(body.get("password", "")).strip()
        if not email or not password:
            self.write_error(400, "Email dan kata sandi wajib diisi.")
            return

        with connect() as conn:
            row = conn.execute(
                """
                SELECT id, name, email, password_hash, role_id, department, initials, color
                FROM users
                WHERE lower(email) = ? AND active = 1
                """,
                (email,),
            ).fetchone()
            if not row or not verify_password(password, row["password_hash"]):
                self.write_error(401, "Email atau kata sandi salah.")
                return

            token = secrets.token_urlsafe(32)
            expires_at = (datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)).isoformat()
            conn.execute(
                "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
                (token, row["id"], expires_at),
            )
            conn.commit()

            state = self.read_state(conn)
            self.write_json(
                {
                    "token": token,
                    "expiresAt": expires_at,
                    "user": user_payload(row),
                    "users": all_users(conn),
                    "state": state,
                }
            )

    def require_user(self) -> dict | None:
        token = self.bearer_token()
        if not token:
            self.write_error(401, "Session tidak ditemukan. Silakan login ulang.")
            return None

        with connect() as conn:
            row = conn.execute(
                """
                SELECT u.id, u.name, u.email, u.role_id, u.department, u.initials, u.color
                FROM sessions s
                JOIN users u ON u.id = s.user_id
                WHERE s.token = ? AND s.expires_at > ?
                """,
                (token, now_iso()),
            ).fetchone()
            if not row:
                self.write_error(401, "Session kedaluwarsa. Silakan login ulang.")
                return None
            return user_payload(row)

    def bearer_token(self) -> str:
        header = self.headers.get("Authorization", "")
        if header.startswith("Bearer "):
            return header.removeprefix("Bearer ").strip()
        return ""

    def read_body(self) -> dict:
        length = int(self.headers.get("Content-Length", "0") or "0")
        if length <= 0:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {}

    def upload_document(self) -> None:
        user = self.require_user()
        if not user:
            return

        content_type = self.headers.get("Content-Type", "")
        if not content_type.startswith("multipart/form-data"):
            self.write_error(400, "Upload wajib memakai multipart/form-data.")
            return

        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={
                "REQUEST_METHOD": "POST",
                "CONTENT_TYPE": content_type,
            },
        )
        file_item = form["file"] if "file" in form else None
        if file_item is None or not getattr(file_item, "filename", ""):
            self.write_error(400, "File upload tidak ditemukan.")
            return

        filename = Path(file_item.filename).name
        folder = str(form.getfirst("folder", "")).strip()
        source_mime = source_mime_type(filename, str(form.getfirst("mimeType", "")).strip())
        temp_path: Path | None = None

        try:
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                temp_path = Path(temp_file.name)
                while True:
                    chunk = file_item.file.read(1024 * 1024)
                    if not chunk:
                        break
                    temp_file.write(chunk)

            drive_payload = upload_to_drive(temp_path, filename, source_mime, folder)
            drive_payload.update(
                {
                    "ok": True,
                    "fileName": filename,
                    "folder": folder,
                    "uploadedBy": user["id"],
                    "uploadedAt": now_iso(),
                }
            )
            self.write_json(drive_payload)
        except RuntimeError as error:
            self.write_error(503, str(error))
        except Exception as error:
            self.write_error(500, f"Upload ke Google Drive gagal: {error}")
        finally:
            if temp_path and temp_path.exists():
                temp_path.unlink()

    def read_state(self, conn: sqlite3.Connection) -> dict:
        row = conn.execute("SELECT payload_json FROM app_state WHERE id = 1").fetchone()
        return json.loads(row["payload_json"]) if row else {}

    def write_json(self, payload: dict, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def write_error(self, status: int, message: str) -> None:
        self.write_json({"ok": False, "error": message}, status)

    def log_message(self, fmt: str, *args: object) -> None:
        print(f"[{self.log_date_time_string()}] {fmt % args}")


def main() -> None:
    init_db()
    server = ThreadingHTTPServer((HOST, PORT), PortalHandler)
    print(f"GRCC Portal API running at http://{HOST}:{PORT}")
    print(f"SQLite database: {Path(DB_PATH)}")
    server.serve_forever()


if __name__ == "__main__":
    main()
