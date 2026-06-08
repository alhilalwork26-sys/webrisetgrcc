from __future__ import annotations

import base64
import hashlib
import hmac
import os
import sqlite3
from pathlib import Path

from seed_data import ROLES, USERS, state_json

ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "portal.sqlite3"
SCHEMA_PATH = ROOT / "schema.sql"


def hash_password(password: str, salt: bytes | None = None, iterations: int = 260_000) -> str:
    salt = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return "pbkdf2_sha256${}${}${}".format(
        iterations,
        base64.b64encode(salt).decode("ascii"),
        base64.b64encode(digest).decode("ascii"),
    )


def init_db(reset: bool = False) -> Path:
    ROOT.mkdir(parents=True, exist_ok=True)
    if reset and DB_PATH.exists():
        DB_PATH.unlink()

    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.executescript(SCHEMA_PATH.read_text())

        for role in ROLES:
            conn.execute(
                """
                INSERT OR IGNORE INTO roles (id, name, permissions_json)
                VALUES (?, ?, '{}')
                """,
                (role, role),
            )

        for user in USERS:
            password_hash = hash_password(user["password"])
            conn.execute(
                """
                INSERT OR IGNORE INTO users
                (id, name, email, password_hash, role_id, department, initials, color, active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
                """,
                (
                    user["id"],
                    user["name"],
                    user["email"],
                    password_hash,
                    user["role"],
                    user["department"],
                    user["initials"],
                    user["color"],
                ),
            )

        existing_state = conn.execute("SELECT id FROM app_state WHERE id = 1").fetchone()
        if not existing_state:
            conn.execute(
                "INSERT INTO app_state (id, payload_json) VALUES (1, ?)",
                (state_json(),),
            )

        conn.commit()

    return DB_PATH


def verify_password(password: str, stored: str) -> bool:
    try:
        alg, iter_raw, salt_raw, hash_raw = stored.split("$")
        if alg != "pbkdf2_sha256":
            return False
        actual = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            base64.b64decode(salt_raw),
            int(iter_raw),
        )
        return hmac.compare_digest(actual, base64.b64decode(hash_raw))
    except Exception:
        return False


if __name__ == "__main__":
    print(init_db(reset="--reset" in os.sys.argv))
