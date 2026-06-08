import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/api'

// ─── Demo accounts ───────────────────────────────────────────────────────────
export const demoAccounts = [
  { id: 'u1', name: 'Tsanya El Karima', email: 'tsanya@grcc.org', password: 'riset123', role: 'koordinator_riset', department: 'Riset GRCC', color: '#EF4444', initials: 'TE', online: true },
  { id: 'u2', name: 'Mei', email: 'mei@grcc.org', password: 'riset123', role: 'riset', department: 'Riset GRCC', color: '#F97316', initials: 'ME', online: true },
  { id: 'u3', name: 'Ayu', email: 'ayu@grcc.org', password: 'riset123', role: 'riset', department: 'Riset GRCC', color: '#14B8A6', initials: 'AY', online: true },
  { id: 'u4', name: 'Yuni Wira Yasa', email: 'yuni@grcc.org', password: 'riset123', role: 'riset', department: 'Riset GRCC', color: '#6366F1', initials: 'YW', online: true },
  { id: 'u5', name: 'Bambang Tjahjadi', email: 'bambang@grcc.org', password: 'riset123', role: 'riset', department: 'Riset GRCC', color: '#0EA5E9', initials: 'BT', online: true },
]

// ─── Tasks ────────────────────────────────────────────────────────────────────
const initialTasks = [
  { id: 't1', title: 'Validasi dataset audience Aksara Art House', status: 'inprogress', priority: 'high', projectId: 'p1', assignees: ['u1', 'u3'], dueDate: '2026-06-07', tags: ['Riset', 'Dataset', 'AAH'], description: 'Bersihkan data responden, cek duplikasi, dan tandai data yang perlu follow up.', comments: 2, attachments: 1, createdAt: '2026-06-01' },
  { id: 't2', title: 'Susun interview note training needs analysis', status: 'todo', priority: 'normal', projectId: 'p2', assignees: ['u2'], dueDate: '2026-06-08', tags: ['Riset', 'Interview', 'TNA'], description: 'Rapikan catatan wawancara menjadi insight dan rekomendasi awal.', comments: 1, attachments: 0, createdAt: '2026-06-02' },
  { id: 't3', title: 'Update timeline equity riset mingguan', status: 'review', priority: 'urgent', projectId: 'p1', assignees: ['u1', 'u4'], dueDate: '2026-06-05', tags: ['Riset', 'Timeline Equity'], description: 'Pastikan setiap riset punya status minggu ini, owner, dan bukti progres.', comments: 4, attachments: 2, createdAt: '2026-06-01' },
  { id: 't4', title: 'Draft executive summary riset operasional', status: 'todo', priority: 'normal', projectId: 'p3', assignees: ['u3', 'u5'], dueDate: '2026-06-10', tags: ['Riset', 'Summary', 'Operasional'], description: 'Buat ringkasan 1 halaman untuk temuan awal beban kerja staff harian.', comments: 0, attachments: 0, createdAt: '2026-06-03' },
]

// ─── Projects ─────────────────────────────────────────────────────────────────
const initialProjects = [
  { id: 'p1', name: 'Riset Aksara Art House', color: '#EF4444', icon: '🔬', description: 'Audience mapping, interview venue, dan timeline equity untuk Aksara Art House.', members: ['u1', 'u3', 'u4'], progress: 52, status: 'active', dueDate: '2026-08-20', category: 'Market Research' },
  { id: 'p2', name: 'Training Needs Analysis', color: '#14B8A6', icon: '📋', description: 'Riset kebutuhan training corporate dan rekomendasi program.', members: ['u1', 'u2'], progress: 46, status: 'active', dueDate: '2026-07-12', category: 'Training Research' },
  { id: 'p3', name: 'Audit Beban Kerja Harian', color: '#6366F1', icon: '📈', description: 'Riset operasional dari data progres pagi/sore dan task harian.', members: ['u3', 'u4', 'u5'], progress: 34, status: 'planning', dueDate: '2026-06-30', category: 'Operational Research' },
]

// ─── Members (untuk tampilan) ─────────────────────────────────────────────────
const initialMembers = demoAccounts.map(a => ({
  ...a,
  tasksCompleted: [12, 8, 9, 7, 6][demoAccounts.indexOf(a)] || 0,
  tasksTotal: [15, 12, 13, 10, 9][demoAccounts.indexOf(a)] || 0,
}))

// ─── Goals ────────────────────────────────────────────────────────────────────
const initialGoals = [
  { id: 'g1', title: 'Riset aktif punya update mingguan', description: 'Semua riset minimal punya satu update per minggu', progress: 78, target: 100, current: 78, unit: '%', dueDate: '2026-06-30', status: 'on_track', color: '#EF4444', projectId: 'p1' },
  { id: 'g2', title: 'Draft siap review', description: 'Draft riset siap masuk review internal', progress: 55, target: 100, current: 55, unit: '%', dueDate: '2026-06-15', status: 'on_track', color: '#14B8A6', projectId: 'p2' },
]

// ─── Keuangan ─────────────────────────────────────────────────────────────────
const initialKeuangan = []

const saldoAwal = 0

// ─── Absensi ──────────────────────────────────────────────────────────────────
const initialKegiatan = [
  { id: 'ev1', nama: 'Interview Aksara Art House', tanggal: '2026-06-07', waktu: '15:00', lokasi: 'Aksara Art House', jenis: 'Riset', createdBy: 'u1', absensi: { u1: 'hadir' } },
  { id: 'ev2', nama: 'Review Weekly Research Board', tanggal: '2026-06-10', waktu: '10:00', lokasi: 'Ruang Riset', jenis: 'Riset', createdBy: 'u4', absensi: {} },
]

// ─── Program Kerja ────────────────────────────────────────────────────────────
const initialProker = []

// ─── Notulen & Dokumen ────────────────────────────────────────────────────────
const initialNotulen = [
  {
    id: 'd1',
    judul: 'Research Brief Aksara Art House',
    tanggal: '2026-06-01',
    jenis: 'Research Brief',
    folder: 'Brief Riset',
    visibility: 'public',
    author: 'Tsanya El Karima',
    peserta: 'Tim Riset GRCC',
    ringkasan: 'Tujuan, metodologi awal, PIC, dan daftar data yang perlu dikumpulkan.',
    keputusan: 'Isi dokumen diedit di Google Docs; portal menyimpan metadata dan status.',
    fileName: 'research-brief-aah.docx',
    storageProvider: 'metadata',
    source: 'pending_upload',
    googleDocUrl: '',
    googleFileId: '',
    mimeType: '',
    lastSyncedAt: '',
  },
  {
    id: 'd2',
    judul: 'Template Timeline Equity',
    tanggal: '2026-06-02',
    jenis: 'Template',
    folder: 'Template',
    visibility: 'public',
    author: 'Yuni Wira Yasa',
    peserta: 'Tim Riset GRCC',
    ringkasan: 'Template monitoring mingguan untuk status Draft, Review, Submitted, Published, atau Rejected.',
    keputusan: 'Template bisa dibuat sebagai Google Doc atau Google Sheet sesuai kebutuhan tim.',
    fileName: 'timeline-equity-template.xlsx',
    storageProvider: 'metadata',
    source: 'pending_upload',
    googleDocUrl: '',
    googleFileId: '',
    mimeType: '',
    lastSyncedAt: '',
  },
]

const initialDocumentFolders = [
  { id: 'df1', name: 'Brief Riset', visibility: 'public', description: 'Brief, arahan awal, dan konteks riset.', createdAt: '2026-06-01', createdBy: 'u1' },
  { id: 'df2', name: 'Template', visibility: 'public', description: 'Template dokumen, format timeline, dan panduan kerja.', createdAt: '2026-06-01', createdBy: 'u1' },
  { id: 'df3', name: 'Laporan', visibility: 'public', description: 'Laporan akhir, executive summary, dan hasil publish.', createdAt: '2026-06-01', createdBy: 'u1' },
  { id: 'df4', name: 'Dokumen Penting', visibility: 'important', description: 'Dokumen sensitif dengan lapisan akses penting.', createdAt: '2026-06-01', createdBy: 'u1' },
  { id: 'df5', name: 'Dataset Pendukung', visibility: 'public', description: 'Dokumen pendukung dataset, lampiran, dan bukti riset.', createdAt: '2026-06-01', createdBy: 'u1' },
]

// ─── Notifications ────────────────────────────────────────────────────────────
const initialNotifications = [
  { id: 'nt1', type: 'due', category: 'warning', message: 'Timeline equity minggu ini perlu dilengkapi', time: 'Hari ini', read: false, taskId: 't3' },
  { id: 'nt2', type: 'assigned', category: 'unread', message: 'Mei menerima task interview note TNA', time: '1 jam lalu', read: false, taskId: 't2' },
]

// ─── Research Notes ───────────────────────────────────────────────────────────
const initialResearchNotes = [
  { id: 'rs1', code: 'AAH-001', title: 'Audience Mapping Aksara Art House', type: 'Market Research', owner: 'u1', pic: 'Tsanya El Karima', status: 'Review', equity: [true, true, true, false, false, false], updatedAt: '2026-06-03', evidence: 'Segmentasi awal selesai, menunggu validasi interview venue.', background: 'Aksara Art House membutuhkan pemetaan audience untuk menentukan arah program dan komunikasi.', objective: 'Mengidentifikasi segmen audience, motivasi kunjungan, dan peluang aktivasi komunitas.', method: 'Interview venue, observasi, dan desk research.', dataSource: 'Interview internal, data pengunjung, observasi venue.', expectedOutput: 'Audience persona dan rekomendasi aktivasi.', deadline: '2026-08-20', reviewNotes: 'Lengkapi validasi interview sebelum masuk Ready to submit.', comments: [] },
  { id: 'rs2', code: 'TRN-014', title: 'Training Needs Analysis Corporate', type: 'Training Research', owner: 'u2', pic: 'Mei', status: 'Draft', equity: [true, true, false, false, false, false], updatedAt: '2026-06-02', evidence: 'Interview note sedang dirapikan menjadi insight awal.', background: 'GRCC perlu membaca kebutuhan training corporate dari temuan lapangan.', objective: 'Menentukan kebutuhan kompetensi dan bentuk program training yang relevan.', method: 'Interview dan coding insight.', dataSource: 'Catatan interview calon klien dan peserta training.', expectedOutput: 'Insight TNA dan rekomendasi topik training.', deadline: '2026-07-12', reviewNotes: '', comments: [] },
  { id: 'rs3', code: 'OPS-008', title: 'Audit Beban Kerja Staff Harian', type: 'Operational Research', owner: 'u3', pic: 'Ayu', status: 'Submitted', equity: [true, true, true, true, true, false], updatedAt: '2026-06-01', evidence: 'Analisis progres pagi/sore sudah dikirim untuk review.', background: 'Data progres harian perlu dibaca untuk melihat pola beban kerja dan bottleneck.', objective: 'Mengukur beban kerja, kepatuhan progres, dan area perbaikan ritme kerja.', method: 'Analisis data progres dan task harian.', dataSource: 'Log progres pagi/sore dan task aktif.', expectedOutput: 'Executive summary dan rekomendasi operasional.', deadline: '2026-06-30', reviewNotes: 'Menunggu keputusan koordinator untuk publish internal.', comments: [] },
  { id: 'rs4', code: 'MKT-031', title: 'Lead Source Effectiveness', type: 'Marketing Research', owner: 'u4', pic: 'Yuni Wira Yasa', status: 'Ready to submit', equity: [true, true, true, true, false, false], updatedAt: '2026-06-03', evidence: 'Dataset leads sudah bersih dan siap final check.', background: 'Tim perlu memahami kanal lead yang paling efektif untuk program GRCC.', objective: 'Membandingkan kualitas lead berdasarkan sumber dan potensi konversi.', method: 'Analisis dataset leads dan klasifikasi source.', dataSource: 'Dataset leads campaign dan follow up.', expectedOutput: 'Ranking source, insight efektivitas, dan rekomendasi kanal.', deadline: '2026-06-24', reviewNotes: 'Siap final check sebelum Submitted.', comments: [] },
]

const initialExcelConnection = {
  status: 'disconnected',
  fileName: '',
  sheetName: '',
  importedRows: 0,
  lastImportedAt: '',
  lastExportedAt: '',
}

const initialDailyProgress = [
  { id: 'pg1', userId: 'u1', date: '2026-06-03', morning: 'Validasi struktur dataset AAH.', evening: 'Menandai data yang perlu follow up interview.', morningAt: '09:05', eveningAt: '16:40', proof: 'dataset-aah-check.xlsx', status: 'complete' },
  { id: 'pg2', userId: 'u2', date: '2026-06-03', morning: 'Merapikan interview note TNA.', evening: '', morningAt: '09:15', eveningAt: '', proof: '', status: 'missing_evening' },
  { id: 'pg3', userId: 'u3', date: '2026-06-03', morning: 'Draft executive summary operasional.', evening: 'Outline 1 halaman sudah siap.', morningAt: '08:58', eveningAt: '16:35', proof: 'summary-ops-draft.docx', status: 'complete' },
  { id: 'pg4', userId: 'u4', date: '2026-06-03', morning: 'Update weekly research board.', evening: 'Status MKT-031 siap submit.', morningAt: '09:20', eveningAt: '17:00', proof: 'weekly-board.png', status: 'complete' },
]

const initialReimbursements = [
  { id: 'rb1', requester: 'u1', date: '2026-06-02', title: 'Transport interview venue AAH', items: [{ name: 'Transport online', amount: 92000 }], total: 92000, status: 'submitted', receipt: 'transport-aah.jpg', paidProof: '', approver: '' },
]

const initialRab = {
  income: { participants: 0, investment: 0, dpp: 0, ppn: 0, institutionalFee: 0 },
  expenses: { personnel: [], committee: [], nonPersonnel: [] },
}

const initialAuditLogs = []

const syncedStateKeys = [
  'tasks',
  'projects',
  'goals',
  'notifications',
  'keuangan',
  'saldoAwal',
  'kegiatan',
  'proker',
  'notulen',
  'documentFolders',
  'researchNotes',
  'excelConnection',
  'dailyProgress',
  'reimbursements',
  'rab',
  'auditLogs',
]

function membersFromUsers(users = []) {
  return users.map((user, index) => ({
    ...user,
    tasksCompleted: [12, 8, 9, 7, 6][index] || 0,
    tasksTotal: [15, 12, 13, 10, 9][index] || 0,
  }))
}

function pickStateSnapshot(state) {
  return syncedStateKeys.reduce((snapshot, key) => {
    snapshot[key] = state[key]
    return snapshot
  }, {})
}

function backendStatePatch(payload = {}) {
  const patch = syncedStateKeys.reduce((next, key) => {
    if (payload.state && Object.prototype.hasOwnProperty.call(payload.state, key)) {
      next[key] = payload.state[key]
    }
    return next
  }, {})
  if (payload.users) {
    patch.members = membersFromUsers(payload.users)
  }
  return patch
}

// ─── Store ────────────────────────────────────────────────────────────────────
const useAppStore = create(
  persist(
    (set, get) => ({
      // Auth
      currentUser: null,
      isLoggedIn: false,
      login: async (email, password) => {
        try {
          const payload = await api.login(email, password)
          set({
            ...backendStatePatch(payload),
            isLoggedIn: true,
            currentUser: payload.user,
            activePage: 'dashboard',
            syncStatus: 'synced',
            lastSyncedAt: new Date().toLocaleString('id-ID'),
          })
          return true
        } catch (error) {
          console.warn('Backend login gagal, memakai fallback demo:', error)
        }

        const account = demoAccounts.find(
          a => a.email.toLowerCase() === email.toLowerCase().trim() && a.password === password.trim()
        )
        if (!account) return false
        set({ isLoggedIn: true, currentUser: account, activePage: 'dashboard', syncStatus: 'local' })
        return true
      },
      logout: async () => {
        await api.logout().catch(() => {})
        set({ isLoggedIn: false, currentUser: null, activePage: 'dashboard' })
      },
      updateCurrentUser: (updates) => set((s) => ({ currentUser: { ...s.currentUser, ...updates } })),

      // Theme
      darkMode: false,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      // Sidebar
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      activePage: 'dashboard',
      setActivePage: (page) => set({ activePage: page }),

      // Tasks
      tasks: initialTasks,
      taskView: 'list',
      setTaskView: (view) => set({ taskView: view }),
      taskFilter: { status: 'all', priority: 'all', projectId: 'all' },
      setTaskFilter: (filter) => set((s) => ({ taskFilter: { ...s.taskFilter, ...filter } })),
      addTask: (task) => set((s) => ({ tasks: [...s.tasks, { ...task, id: `t${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], comments: 0, attachments: 0 }] })),
      updateTask: (id, updates) => set((s) => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter(t => t.id !== id) })),
      moveTask: (id, status) => set((s) => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, status } : t) })),

      // Projects
      projects: initialProjects,
      addProject: (project) => set((s) => ({ projects: [...s.projects, { ...project, id: `p${Date.now()}`, progress: 0 }] })),
      updateProject: (id, updates) => set((s) => ({ projects: s.projects.map(p => p.id === id ? { ...p, ...updates } : p) })),

      // Members
      members: initialMembers,
      addMember: (member) => set((s) => ({ members: [...s.members, member] })),

      // Goals
      goals: initialGoals,
      addGoal: (goal) => set((s) => ({ goals: [...s.goals, { ...goal, id: `g${Date.now()}` }] })),
      updateGoal: (id, updates) => set((s) => ({ goals: s.goals.map(g => g.id === id ? { ...g, ...updates } : g) })),

      // Notifications
      notifications: initialNotifications,
      markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
      markAllRead: () => set((s) => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),
      clearNotifications: () => set({ notifications: [] }),

      // Keuangan
      keuangan: initialKeuangan,
      saldoAwal,
      addTransaksi: (trx) => set((s) => ({ keuangan: [...s.keuangan, { ...trx, id: `k${Date.now()}`, status: trx.status || 'draft' }] })),
      updateTransaksi: (id, updates) => set((s) => ({ keuangan: s.keuangan.map(k => k.id === id ? { ...k, ...updates } : k) })),
      deleteTransaksi: (id) => set((s) => ({ keuangan: s.keuangan.filter(k => k.id !== id) })),

      // Absensi / Kegiatan
      kegiatan: initialKegiatan,
      addKegiatan: (ev) => set((s) => ({ kegiatan: [...s.kegiatan, { ...ev, id: `ev${Date.now()}`, absensi: ev.absensi || {} }] })),
      updateAbsensi: (kegiatanId, userId, status) => set((s) => ({
        kegiatan: s.kegiatan.map(ev => ev.id === kegiatanId
          ? { ...ev, absensi: { ...ev.absensi, [userId]: status } }
          : ev
        )
      })),

      // Program Kerja
      proker: initialProker,
      addProker: (pk) => set((s) => ({ proker: [...s.proker, { ...pk, id: `pk${Date.now()}`, progress: 0 }] })),
      updateProker: (id, updates) => set((s) => ({ proker: s.proker.map(p => p.id === id ? { ...p, ...updates } : p) })),

      // Notulen & Dokumen
      notulen: initialNotulen,
      documentFolders: initialDocumentFolders,
      addNotulen: (doc) => set((s) => ({ notulen: [{ ...doc, id: `n${Date.now()}` }, ...s.notulen] })),
      deleteNotulen: (id) => set((s) => ({ notulen: s.notulen.filter(n => n.id !== id) })),
      addDocumentFolder: (folder) => set((s) => {
        const name = folder.name.trim()
        const exists = s.documentFolders.some(item => item.name.toLowerCase() === name.toLowerCase())
        if (!name || exists) return {}
        return {
          documentFolders: [
            {
              ...folder,
              name,
              id: `df${Date.now()}`,
              createdAt: new Date().toISOString().split('T')[0],
            },
            ...s.documentFolders,
          ],
        }
      }),

      // Research
      researchNotes: initialResearchNotes,
      excelConnection: initialExcelConnection,
      addResearchNote: (note) => set((s) => ({
        researchNotes: [{
          ...note,
          id: `r${Date.now()}`,
          updatedAt: new Date().toISOString().split('T')[0],
        }, ...s.researchNotes],
      })),
      updateResearchNote: (id, updates) => set((s) => ({
        researchNotes: s.researchNotes.map(note => note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : note),
      })),
      mergeResearchNotesFromExcel: ({ rows, fileName, sheetName }) => set((s) => {
        const now = new Date().toLocaleString('id-ID')
        const existingByCode = new Map(s.researchNotes.map(note => [note.code, note]))
        const importedCodes = new Set(rows.map(row => row.code))
        const importedNotes = rows.map(row => {
          const existing = existingByCode.get(row.code)
          return {
            ...(existing || {}),
            ...row,
            id: existing?.id || `rx${Date.now()}${row.code.replace(/[^A-Z0-9]/gi, '')}`,
            comments: existing?.comments || row.comments || [],
            updatedAt: new Date().toISOString().split('T')[0],
          }
        })
        const untouchedNotes = s.researchNotes.filter(note => !importedCodes.has(note.code))

        return {
          researchNotes: [...importedNotes, ...untouchedNotes],
          excelConnection: {
            status: 'connected',
            fileName,
            sheetName,
            importedRows: rows.length,
            lastImportedAt: now,
            lastExportedAt: s.excelConnection.lastExportedAt,
          },
        }
      }),
      markResearchExcelExported: (fileName) => set((s) => ({
        excelConnection: {
          ...s.excelConnection,
          status: 'connected',
          fileName,
          lastExportedAt: new Date().toLocaleString('id-ID'),
        },
      })),

      // Daily progress
      dailyProgress: initialDailyProgress,
      addDailyProgress: (entry) => set((s) => ({
        dailyProgress: [{ ...entry, id: `pg${Date.now()}` }, ...s.dailyProgress],
      })),

      // Reimbursements
      reimbursements: initialReimbursements,
      addReimbursement: (item) => set((s) => ({
        reimbursements: [{ ...item, id: `rb${Date.now()}`, status: 'submitted' }, ...s.reimbursements],
      })),
      updateReimbursement: (id, updates) => set((s) => ({
        reimbursements: s.reimbursements.map(item => item.id === id ? { ...item, ...updates } : item),
      })),

      // RAB and audit
      rab: initialRab,
      updateRab: (updates) => set((s) => ({ rab: { ...s.rab, ...updates } })),
      auditLogs: initialAuditLogs,
      addAuditLog: (log) => set((s) => ({ auditLogs: [{ ...log, id: `al${Date.now()}` }, ...s.auditLogs] })),
      syncStatus: 'local',
      lastSyncedAt: 'Belum tersinkron',
      syncFromBackend: async () => {
        set({ syncStatus: 'syncing' })
        const payload = await api.getState()
        set({
          ...backendStatePatch(payload),
          syncStatus: 'synced',
          lastSyncedAt: new Date().toLocaleString('id-ID'),
        })
      },
      markSynced: async () => {
        set({ syncStatus: 'syncing' })
        try {
          await api.saveState(pickStateSnapshot(get()))
          set({
            syncStatus: 'synced',
            lastSyncedAt: new Date().toLocaleString('id-ID'),
          })
        } catch (error) {
          console.warn('Sinkronisasi backend gagal:', error)
          set({
            syncStatus: 'local',
            lastSyncedAt: 'Backend belum aktif',
          })
        }
      },

      // Modal
      modal: null,
      openModal: (modal) => set({ modal }),
      closeModal: () => set({ modal: null }),
    }),
    {
      name: 'grcc-app-store',
      partialize: (s) => ({
        darkMode: s.darkMode,
        notulen: s.notulen,
        documentFolders: s.documentFolders,
        researchNotes: s.researchNotes,
        excelConnection: s.excelConnection,
        auditLogs: s.auditLogs,
      }),
    }
  )
)

export default useAppStore
