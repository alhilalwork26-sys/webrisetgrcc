from __future__ import annotations

import json
import mimetypes
import os
from pathlib import Path


DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
PPTX_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation"

GOOGLE_DOC_MIME = "application/vnd.google-apps.document"
GOOGLE_SHEET_MIME = "application/vnd.google-apps.spreadsheet"
GOOGLE_SLIDE_MIME = "application/vnd.google-apps.presentation"


def target_workspace_mime(source_mime: str, filename: str) -> str | None:
    suffix = Path(filename).suffix.lower()
    if source_mime == DOCX_MIME or suffix in {".doc", ".docx"}:
        return GOOGLE_DOC_MIME
    if source_mime == XLSX_MIME or suffix in {".xls", ".xlsx", ".csv"}:
        return GOOGLE_SHEET_MIME
    if source_mime == PPTX_MIME or suffix in {".ppt", ".pptx"}:
        return GOOGLE_SLIDE_MIME
    return None


def source_mime_type(filename: str, fallback: str = "") -> str:
    guessed, _ = mimetypes.guess_type(filename)
    return fallback or guessed or "application/octet-stream"


def build_drive_service():
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
    except ImportError as exc:
        raise RuntimeError(
            "Library Google Drive belum terpasang. Jalankan: pip install -r backend/requirements.txt"
        ) from exc

    scopes = ["https://www.googleapis.com/auth/drive.file"]
    service_account_file = os.environ.get("GOOGLE_SERVICE_ACCOUNT_FILE", "").strip()
    service_account_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()

    if service_account_file:
        credentials = service_account.Credentials.from_service_account_file(
            service_account_file,
            scopes=scopes,
        )
    elif service_account_json:
        credentials = service_account.Credentials.from_service_account_info(
            json.loads(service_account_json),
            scopes=scopes,
        )
    else:
        raise RuntimeError(
            "Google Drive belum dikonfigurasi. Isi GOOGLE_SERVICE_ACCOUNT_FILE atau GOOGLE_SERVICE_ACCOUNT_JSON."
        )

    delegated_user = os.environ.get("GOOGLE_WORKSPACE_DELEGATED_USER", "").strip()
    if delegated_user:
        credentials = credentials.with_subject(delegated_user)

    return build("drive", "v3", credentials=credentials, cache_discovery=False)


def upload_to_drive(temp_path: Path, filename: str, source_mime: str, folder: str) -> dict:
    from googleapiclient.http import MediaFileUpload

    drive = build_drive_service()
    parent_folder_id = os.environ.get("GOOGLE_DRIVE_FOLDER_ID", "").strip()
    target_mime = target_workspace_mime(source_mime, filename)
    metadata = {
        "name": Path(filename).stem if target_mime else filename,
    }
    if parent_folder_id:
        metadata["parents"] = [parent_folder_id]
    if target_mime:
        metadata["mimeType"] = target_mime
    if folder:
        metadata["description"] = f"GRCC Riset folder portal: {folder}"

    media = MediaFileUpload(
        str(temp_path),
        mimetype=source_mime,
        resumable=False,
    )
    created = drive.files().create(
        body=metadata,
        media_body=media,
        fields="id,name,mimeType,webViewLink,webContentLink,size,createdTime,modifiedTime",
    ).execute()

    return {
        "googleFileId": created.get("id", ""),
        "googleDocUrl": created.get("webViewLink", ""),
        "webContentLink": created.get("webContentLink", ""),
        "name": created.get("name", filename),
        "mimeType": created.get("mimeType", target_mime or source_mime),
        "sourceMimeType": source_mime,
        "size": int(created.get("size") or temp_path.stat().st_size),
        "createdTime": created.get("createdTime", ""),
        "modifiedTime": created.get("modifiedTime", ""),
        "converted": bool(target_mime),
        "storageProvider": "google_drive",
    }
