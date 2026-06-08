from __future__ import annotations

import os
from pathlib import Path


ROOT = Path(__file__).resolve().parent
ENV_PATH = ROOT / ".env"


def load_env_file(path: Path = ENV_PATH) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def drive_config_status() -> dict:
    service_account_file = os.environ.get("GOOGLE_SERVICE_ACCOUNT_FILE", "").strip()
    service_account_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
    folder_id = os.environ.get("GOOGLE_DRIVE_FOLDER_ID", "").strip()
    delegated_user = os.environ.get("GOOGLE_WORKSPACE_DELEGATED_USER", "").strip()

    return {
        "configured": bool((service_account_file or service_account_json) and folder_id),
        "hasServiceAccountFile": bool(service_account_file),
        "hasServiceAccountJson": bool(service_account_json),
        "hasDriveFolderId": bool(folder_id),
        "hasDelegatedUser": bool(delegated_user),
        "serviceAccountFileExists": Path(service_account_file).exists() if service_account_file else False,
    }
