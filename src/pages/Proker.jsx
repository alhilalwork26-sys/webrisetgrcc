import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Briefcase, X, Check, Edit2, Target, Calendar, DollarSign } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import { can } from '../config/roleConfig'
import ProgressBar from '../components/ui/ProgressBar'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const STATUS_OPTIONS = [
  { value: 'perencanaan', label: 'Perencanaan', class: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
  { value: 'berjalan', label: 'Berjalan', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'selesai', label: 'Selesai', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'ditunda', label: 'Ditunda', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
]

function formatRp(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

function ModalProker({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || {
    nama: '', penanggungJawab: '', tanggalMulai: format(new Date(), 'yyyy-MM-dd'),
    tanggalSelesai: '', anggaran: '', realisasi: '0', progress: '0',
    status: 'perencanaan', deskripsi: '', target: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{initial ? 'Edit Program Kerja' : 'Tambah Program Kerja'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nama Program Kerja</label>
            <input value={form.nama} onChange={e => set('nama', e.target.value)} placeholder="Nama proker..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Target / Tujuan</label>
            <input value={form.target} onChange={e => set('target', e.target.value)} placeholder="Target yang ingin dicapai..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Penanggung Jawab</label>
            <input value={form.penanggungJawab} onChange={e => set('penanggungJawab', e.target.value)} placeholder="Nama koordinator..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Tanggal Mulai</label>
              <input type="date" value={form.tanggalMulai} onChange={e => set('tanggalMulai', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Tanggal Selesai</label>
              <input type="date" value={form.tanggalSelesai} onChange={e => set('tanggalSelesai', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Anggaran (Rp)</label>
              <input type="number" value={form.anggaran} onChange={e => set('anggaran', e.target.value)} placeholder="0"
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Realisasi (Rp)</label>
              <input type="number" value={form.realisasi} onChange={e => set('realisasi', e.target.value)} placeholder="0"
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Progress (%)</label>
              <input type="number" min="0" max="100" value={form.progress} onChange={e => set('progress', e.target.value)} placeholder="0"
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200">
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Deskripsi</label>
            <textarea value={form.deskripsi} onChange={e => set('deskripsi', e.target.value)} rows={3} placeholder="Keterangan program kerja..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200 resize-none" />
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Batal</button>
          <button onClick={() => form.nama && onSave({ ...form, anggaran: Number(form.anggaran), realisasi: Number(form.realisasi), progress: Number(form.progress) })}
            disabled={!form.nama}
            className="flex-1 py-2.5 text-sm bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> Simpan
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function Proker() {
  const { proker, addProker, updateProker, currentUser } = useAppStore()
  const role = currentUser?.role || 'staff_kreatif'
  const canAdd = can(role, 'programs', 'manage')
  const canEdit = can(role, 'programs', 'manage')

  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [filterStatus, setFilterStatus] = useState('semua')

  const filtered = filterStatus === 'semua' ? proker : proker.filter(p => p.status === filterStatus)

  const handleSave = (data) => {
    if (editItem) {
      updateProker(editItem.id, data)
      setEditItem(null)
    } else {
      addProker({ ...data, id: `pk-${Date.now()}` })
    }
    setShowModal(false)
  }

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s.value] = proker.filter(p => p.status === s.value).length
    return acc
  }, {})

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Program Kerja</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Pantau realisasi program kerja GRCC</p>
        </div>
        {canAdd && (
          <button onClick={() => { setEditItem(null); setShowModal(true) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Tambah Proker
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STATUS_OPTIONS.map((s, i) => (
          <motion.div key={s.value} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{counts[s.value] || 0}</p>
            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium mt-1 ${s.class}`}>{s.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['semua', ...STATUS_OPTIONS.map(s => s.value)].map(f => (
          <button key={f} onClick={() => setFilterStatus(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${filterStatus === f
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            {f === 'semua' ? 'Semua' : STATUS_OPTIONS.find(s => s.value === f)?.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 py-16 text-center">
          <Briefcase className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-gray-600 text-sm">Belum ada program kerja</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((pk, i) => {
            const statusCfg = STATUS_OPTIONS.find(s => s.value === pk.status) || STATUS_OPTIONS[0]
            const anggaranPct = pk.anggaran > 0 ? Math.min(Math.round(pk.realisasi / pk.anggaran * 100), 100) : 0
            return (
              <motion.div key={pk.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{pk.nama}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${statusCfg.class}`}>{statusCfg.label}</span>
                    </div>
                    {pk.penanggungJawab && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">PJ: {pk.penanggungJawab}</p>
                    )}
                  </div>
                  {canEdit && (
                    <button onClick={() => { setEditItem(pk); setShowModal(true) }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {pk.target && (
                  <div className="flex items-start gap-1.5 mb-3">
                    <Target className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">{pk.target}</p>
                  </div>
                )}

                {(pk.tanggalMulai || pk.tanggalSelesai) && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {pk.tanggalMulai && format(new Date(pk.tanggalMulai), 'd MMM yyyy', { locale: id })}
                      {pk.tanggalSelesai && ` – ${format(new Date(pk.tanggalSelesai), 'd MMM yyyy', { locale: id })}`}
                    </p>
                  </div>
                )}

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{pk.progress}%</span>
                  </div>
                  <ProgressBar value={pk.progress} color="#7B2FBE" height={6} animated={false} />
                </div>

                {/* Anggaran */}
                {pk.anggaran > 0 && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Anggaran</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{anggaranPct}% terpakai</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600 dark:text-green-400 font-medium">{formatRp(pk.realisasi)}</span>
                      <span className="text-gray-400">/ {formatRp(pk.anggaran)}</span>
                    </div>
                    <ProgressBar value={anggaranPct} color={anggaranPct > 90 ? '#EF4444' : '#00D084'} height={4} animated={false} />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <ModalProker onClose={() => { setShowModal(false); setEditItem(null) }} onSave={handleSave} initial={editItem} />
        )}
      </AnimatePresence>
    </div>
  )
}
