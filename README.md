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
python3 backend/server.py
```

Backend berjalan di `http://127.0.0.1:8000` dan membuat SQLite lokal di `backend/portal.sqlite3`.

## Akun Demo

- `tsanya@grcc.org` / `riset123`
- `mei@grcc.org` / `riset123`

## Catatan Penyimpanan Dokumen

File dokumen besar sebaiknya disimpan di Google Drive, sementara portal menyimpan metadata seperti folder, judul, pemilik, status, `googleFileId`, dan link Google Docs.
