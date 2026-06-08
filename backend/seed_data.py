from __future__ import annotations

import json

ROLES = ["koordinator_riset", "riset"]

USERS = [
    {"id": "u1", "name": "Tsanya El Karima", "email": "tsanya@grcc.org", "password": "riset123", "role": "koordinator_riset", "department": "Riset GRCC", "color": "#EF4444", "initials": "TE", "online": True},
    {"id": "u2", "name": "Mei", "email": "mei@grcc.org", "password": "riset123", "role": "riset", "department": "Riset GRCC", "color": "#F97316", "initials": "ME", "online": True},
    {"id": "u3", "name": "Ayu", "email": "ayu@grcc.org", "password": "riset123", "role": "riset", "department": "Riset GRCC", "color": "#14B8A6", "initials": "AY", "online": True},
    {"id": "u4", "name": "Yuni Wira Yasa", "email": "yuni@grcc.org", "password": "riset123", "role": "riset", "department": "Riset GRCC", "color": "#6366F1", "initials": "YW", "online": True},
    {"id": "u5", "name": "Bambang Tjahjadi", "email": "bambang@grcc.org", "password": "riset123", "role": "riset", "department": "Riset GRCC", "color": "#0EA5E9", "initials": "BT", "online": True},
]

STATE = {
    "tasks": [
        {"id": "t1", "title": "Validasi dataset audience Aksara Art House", "status": "inprogress", "priority": "high", "projectId": "p1", "assignees": ["u1", "u3"], "dueDate": "2026-06-07", "tags": ["Riset", "Dataset", "AAH"], "description": "Bersihkan data responden, cek duplikasi, dan tandai data yang perlu follow up.", "comments": 2, "attachments": 1, "createdAt": "2026-06-01"},
        {"id": "t2", "title": "Susun interview note training needs analysis", "status": "todo", "priority": "normal", "projectId": "p2", "assignees": ["u2"], "dueDate": "2026-06-08", "tags": ["Riset", "Interview", "TNA"], "description": "Rapikan catatan wawancara menjadi insight dan rekomendasi awal.", "comments": 1, "attachments": 0, "createdAt": "2026-06-02"},
        {"id": "t3", "title": "Update timeline equity riset mingguan", "status": "review", "priority": "urgent", "projectId": "p1", "assignees": ["u1", "u4"], "dueDate": "2026-06-05", "tags": ["Riset", "Timeline Equity"], "description": "Pastikan setiap riset punya status minggu ini, owner, dan bukti progres.", "comments": 4, "attachments": 2, "createdAt": "2026-06-01"},
        {"id": "t4", "title": "Draft executive summary riset operasional", "status": "todo", "priority": "normal", "projectId": "p3", "assignees": ["u3", "u5"], "dueDate": "2026-06-10", "tags": ["Riset", "Summary", "Operasional"], "description": "Buat ringkasan 1 halaman untuk temuan awal beban kerja staff harian.", "comments": 0, "attachments": 0, "createdAt": "2026-06-03"},
    ],
    "projects": [
        {"id": "p1", "name": "Riset Aksara Art House", "color": "#EF4444", "icon": "🔬", "description": "Audience mapping, interview venue, dan timeline equity untuk Aksara Art House.", "members": ["u1", "u3", "u4"], "progress": 52, "status": "active", "dueDate": "2026-08-20", "category": "Market Research"},
        {"id": "p2", "name": "Training Needs Analysis", "color": "#14B8A6", "icon": "📋", "description": "Riset kebutuhan training corporate dan rekomendasi program.", "members": ["u1", "u2"], "progress": 46, "status": "active", "dueDate": "2026-07-12", "category": "Training Research"},
        {"id": "p3", "name": "Audit Beban Kerja Harian", "color": "#6366F1", "icon": "📈", "description": "Riset operasional dari data progres pagi/sore dan task harian.", "members": ["u3", "u4", "u5"], "progress": 34, "status": "planning", "dueDate": "2026-06-30", "category": "Operational Research"},
    ],
    "goals": [
        {"id": "g1", "title": "Riset aktif punya update mingguan", "description": "Semua riset minimal punya satu update per minggu", "progress": 78, "target": 100, "current": 78, "unit": "%", "dueDate": "2026-06-30", "status": "on_track", "color": "#EF4444", "projectId": "p1"},
        {"id": "g2", "title": "Draft siap review", "description": "Draft riset siap masuk review internal", "progress": 55, "target": 100, "current": 55, "unit": "%", "dueDate": "2026-06-15", "status": "on_track", "color": "#14B8A6", "projectId": "p2"},
    ],
    "keuangan": [],
    "saldoAwal": 0,
    "kegiatan": [
        {"id": "ev1", "nama": "Interview Aksara Art House", "tanggal": "2026-06-07", "waktu": "15:00", "lokasi": "Aksara Art House", "jenis": "Riset", "createdBy": "u1", "absensi": {"u1": "hadir"}},
        {"id": "ev2", "nama": "Review Weekly Research Board", "tanggal": "2026-06-10", "waktu": "10:00", "lokasi": "Ruang Riset", "jenis": "Riset", "createdBy": "u4", "absensi": {}},
    ],
    "proker": [],
    "notulen": [
        {"id": "d1", "judul": "Research Brief Aksara Art House", "tanggal": "2026-06-01", "jenis": "Research Brief", "folder": "Brief Riset", "visibility": "public", "author": "Tsanya El Karima", "peserta": "Tim Riset GRCC", "ringkasan": "Tujuan, metodologi awal, PIC, dan daftar data yang perlu dikumpulkan.", "keputusan": "Dipakai sebagai baseline monitoring riset AAH.", "fileName": "research-brief-aah.pdf"},
        {"id": "d2", "judul": "Template Timeline Equity", "tanggal": "2026-06-02", "jenis": "Template", "folder": "Timeline", "visibility": "public", "author": "Yuni Wira Yasa", "peserta": "Tim Riset GRCC", "ringkasan": "Template monitoring mingguan untuk status Draft, Review, Submitted, Published, atau Rejected.", "keputusan": "Setiap riset wajib update per minggu.", "fileName": "timeline-equity-template.xlsx"},
    ],
    "documentFolders": [
        {"id": "df1", "name": "Brief Riset", "visibility": "public", "description": "Brief, arahan awal, dan konteks riset.", "createdAt": "2026-06-01", "createdBy": "u1"},
        {"id": "df2", "name": "Template", "visibility": "public", "description": "Template dokumen, format timeline, dan panduan kerja.", "createdAt": "2026-06-01", "createdBy": "u1"},
        {"id": "df3", "name": "Laporan", "visibility": "public", "description": "Laporan akhir, executive summary, dan hasil publish.", "createdAt": "2026-06-01", "createdBy": "u1"},
        {"id": "df4", "name": "Dokumen Penting", "visibility": "important", "description": "Dokumen sensitif dengan lapisan akses penting.", "createdAt": "2026-06-01", "createdBy": "u1"},
        {"id": "df5", "name": "Dataset Pendukung", "visibility": "public", "description": "Dokumen pendukung dataset, lampiran, dan bukti riset.", "createdAt": "2026-06-01", "createdBy": "u1"},
    ],
    "notifications": [
        {"id": "nt1", "type": "due", "category": "warning", "message": "Timeline equity minggu ini perlu dilengkapi", "time": "Hari ini", "read": False, "taskId": "t3"},
        {"id": "nt2", "type": "assigned", "category": "unread", "message": "Mei menerima task interview note TNA", "time": "1 jam lalu", "read": False, "taskId": "t2"},
    ],
    "researchNotes": [
        {"id": "rs1", "code": "AAH-001", "title": "Audience Mapping Aksara Art House", "type": "Market Research", "owner": "u1", "pic": "Tsanya El Karima", "status": "Review", "equity": [True, True, True, False, False, False], "updatedAt": "2026-06-03", "evidence": "Segmentasi awal selesai, menunggu validasi interview venue.", "background": "Aksara Art House membutuhkan pemetaan audience untuk menentukan arah program dan komunikasi.", "objective": "Mengidentifikasi segmen audience, motivasi kunjungan, dan peluang aktivasi komunitas.", "method": "Interview venue, observasi, dan desk research.", "dataSource": "Interview internal, data pengunjung, observasi venue.", "expectedOutput": "Audience persona dan rekomendasi aktivasi.", "deadline": "2026-08-20", "reviewNotes": "Lengkapi validasi interview sebelum masuk Ready to submit.", "comments": []},
        {"id": "rs2", "code": "TRN-014", "title": "Training Needs Analysis Corporate", "type": "Training Research", "owner": "u2", "pic": "Mei", "status": "Draft", "equity": [True, True, False, False, False, False], "updatedAt": "2026-06-02", "evidence": "Interview note sedang dirapikan menjadi insight awal.", "background": "GRCC perlu membaca kebutuhan training corporate dari temuan lapangan.", "objective": "Menentukan kebutuhan kompetensi dan bentuk program training yang relevan.", "method": "Interview dan coding insight.", "dataSource": "Catatan interview calon klien dan peserta training.", "expectedOutput": "Insight TNA dan rekomendasi topik training.", "deadline": "2026-07-12", "reviewNotes": "", "comments": []},
        {"id": "rs3", "code": "OPS-008", "title": "Audit Beban Kerja Staff Harian", "type": "Operational Research", "owner": "u3", "pic": "Ayu", "status": "Submitted", "equity": [True, True, True, True, True, False], "updatedAt": "2026-06-01", "evidence": "Analisis progres pagi/sore sudah dikirim untuk review.", "background": "Data progres harian perlu dibaca untuk melihat pola beban kerja dan bottleneck.", "objective": "Mengukur beban kerja, kepatuhan progres, dan area perbaikan ritme kerja.", "method": "Analisis data progres dan task harian.", "dataSource": "Log progres pagi/sore dan task aktif.", "expectedOutput": "Executive summary dan rekomendasi operasional.", "deadline": "2026-06-30", "reviewNotes": "Menunggu keputusan koordinator untuk publish internal.", "comments": []},
        {"id": "rs4", "code": "MKT-031", "title": "Lead Source Effectiveness", "type": "Marketing Research", "owner": "u4", "pic": "Yuni Wira Yasa", "status": "Ready to submit", "equity": [True, True, True, True, False, False], "updatedAt": "2026-06-03", "evidence": "Dataset leads sudah bersih dan siap final check.", "background": "Tim perlu memahami kanal lead yang paling efektif untuk program GRCC.", "objective": "Membandingkan kualitas lead berdasarkan sumber dan potensi konversi.", "method": "Analisis dataset leads dan klasifikasi source.", "dataSource": "Dataset leads campaign dan follow up.", "expectedOutput": "Ranking source, insight efektivitas, dan rekomendasi kanal.", "deadline": "2026-06-24", "reviewNotes": "Siap final check sebelum Submitted.", "comments": []},
    ],
    "excelConnection": {"status": "disconnected", "fileName": "", "sheetName": "", "importedRows": 0, "lastImportedAt": "", "lastExportedAt": ""},
    "dailyProgress": [
        {"id": "pg1", "userId": "u1", "date": "2026-06-03", "morning": "Validasi struktur dataset AAH.", "evening": "Menandai data yang perlu follow up interview.", "morningAt": "09:05", "eveningAt": "16:40", "proof": "dataset-aah-check.xlsx", "status": "complete"},
        {"id": "pg2", "userId": "u2", "date": "2026-06-03", "morning": "Merapikan interview note TNA.", "evening": "", "morningAt": "09:15", "eveningAt": "", "proof": "", "status": "missing_evening"},
        {"id": "pg3", "userId": "u3", "date": "2026-06-03", "morning": "Draft executive summary operasional.", "evening": "Outline 1 halaman sudah siap.", "morningAt": "08:58", "eveningAt": "16:35", "proof": "summary-ops-draft.docx", "status": "complete"},
        {"id": "pg4", "userId": "u4", "date": "2026-06-03", "morning": "Update weekly research board.", "evening": "Status MKT-031 siap submit.", "morningAt": "09:20", "eveningAt": "17:00", "proof": "weekly-board.png", "status": "complete"},
    ],
    "reimbursements": [
        {"id": "rb1", "requester": "u1", "date": "2026-06-02", "title": "Transport interview venue AAH", "items": [{"name": "Transport online", "amount": 92000}], "total": 92000, "status": "submitted", "receipt": "transport-aah.jpg", "paidProof": "", "approver": ""},
    ],
    "rab": {"income": {"participants": 0, "investment": 0, "dpp": 0, "ppn": 0, "institutionalFee": 0}, "expenses": {"personnel": [], "committee": [], "nonPersonnel": []}},
    "auditLogs": [],
}


def state_json() -> str:
    return json.dumps(STATE, ensure_ascii=False)
