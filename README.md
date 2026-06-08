# GRCC Riset Portal

Website internal untuk monitoring riset GRCC: dashboard riset, task, progres harian, dokumen riset, reimburse, laporan, dan metadata Google Docs.

## Jalankan Frontend

```bash
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

## Jalankan Backend Lokal

```bash
pip install -r backend/requirements.txt
python3 backend/server.py
```

Backend berjalan di `http://127.0.0.1:8000` dan membuat SQLite lokal di `backend/portal.sqlite3`.

## Upload Google Drive

Aktifkan Google Drive API di Google Cloud, lalu siapkan service account. Folder Drive tujuan perlu dibagikan ke email service account tersebut.

Environment variable yang dipakai backend:

```bash
export GOOGLE_SERVICE_ACCOUNT_FILE="/path/ke/service-account.json"
export GOOGLE_DRIVE_FOLDER_ID="id_folder_drive_grcc_riset"
python3 backend/server.py
```

Alternatif untuk deployment:

```bash
export GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account", "...": "..."}'
export GOOGLE_DRIVE_FOLDER_ID="id_folder_drive_grcc_riset"
```

File `.docx` akan dicoba convert menjadi Google Docs, `.xlsx/.csv` menjadi Google Sheets, dan file lain tetap disimpan sebagai file Drive biasa.

## Akun Demo

- `tsanya@grcc.org` / `riset123`
- `mei@grcc.org` / `riset123`

## Catatan Penyimpanan Dokumen

File dokumen besar sebaiknya disimpan di Google Drive, sementara portal menyimpan metadata seperti folder, judul, pemilik, status, `googleFileId`, dan link Google Docs.
