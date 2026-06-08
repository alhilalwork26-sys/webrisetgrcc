import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, UserCheck, Calendar, X, Check, ChevronDown, ChevronRight } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import { can } from '../config/roleConfig'
import Avatar from '../components/ui/Avatar'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const STATUS_CONFIG = {
  hadir:  { label: 'Hadir',  class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500' },
  izin:   { label: 'Izin',   class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', dot: 'bg-yellow-500' },
  alpha:  { label: 'Alpha',  class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500' },
  belum:  { label: 'Belum',  class: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400', dot: 'bg-gray-400' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.belum
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.class}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function ModalKegiatan({ onClose, onSave }) {
  const [form, setForm] = useState({ nama: '', tanggal: format(new Date(), 'yyyy-MM-dd'), lokasi: '', deskripsi: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Tambah Kegiatan</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nama Kegiatan</label>
            <input value={form.nama} onChange={e => set('nama', e.target.value)} placeholder="Contoh: Rapat Bulanan GRCC"
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Tanggal</label>
            <input type="date" value={form.tanggal} onChange={e => set('tanggal', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Lokasi</label>
            <input value={form.lokasi} onChange={e => set('lokasi', e.target.value)} placeholder="Tempat kegiatan..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Deskripsi</label>
            <textarea value={form.deskripsi} onChange={e => set('deskripsi', e.target.value)} rows={3} placeholder="Keterangan kegiatan..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200 resize-none" />
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Batal</button>
          <button onClick={() => form.nama && onSave(form)} disabled={!form.nama}
            className="flex-1 py-2.5 text-sm bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> Simpan
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function KegiatanCard({ kegiatan, members, currentUser, canMarkOthers, canMarkSelf, onUpdateAbsensi, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const absensi = kegiatan.absensi || {}
  const hadir = Object.values(absensi).filter(s => s === 'hadir').length
  const total = members.length

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left">
        <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{kegiatan.nama}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {format(new Date(kegiatan.tanggal), 'd MMMM yyyy', { locale: id })}
            {kegiatan.lokasi && ` · ${kegiatan.lokasi}`}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{hadir}/{total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">hadir</p>
          </div>
          {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800/50">
              {members.map(m => {
                const status = absensi[m.id] || 'belum'
                const isSelf = m.id === currentUser?.id
                const canChange = canMarkOthers || (canMarkSelf && isSelf)
                return (
                  <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar user={m} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{m.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{m.department}</p>
                    </div>
                    {canChange ? (
                      <div className="flex gap-1.5">
                        {['hadir', 'izin', 'alpha'].map(s => (
                          <button key={s} onClick={() => onUpdateAbsensi(kegiatan.id, m.id, s)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${status === s
                              ? s === 'hadir' ? 'bg-green-500 text-white' : s === 'izin' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            {STATUS_CONFIG[s].label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <StatusBadge status={status} />
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Absensi() {
  const { kegiatan, members, updateAbsensi, addKegiatan, currentUser } = useAppStore()
  const role = currentUser?.role || 'staff_kreatif'
  const canMarkSelf = true
  const canMarkOthers = can(role, 'programs', 'manage')
  const canAdd = role === 'admin' || role === 'sekretaris'

  const [showModal, setShowModal] = useState(false)

  const handleSave = (data) => {
    addKegiatan({ ...data, id: `kg-${Date.now()}`, absensi: {} })
    setShowModal(false)
  }

  const totalHadir = kegiatan.reduce((sum, kg) => {
    const ab = kg.absensi || {}
    return sum + Object.values(ab).filter(s => s === 'hadir').length
  }, 0)
  const totalPossible = kegiatan.length * members.length

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Absensi Kegiatan</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Rekap kehadiran anggota GRCC</p>
        </div>
        {canAdd && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Tambah Kegiatan
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Kegiatan', value: kegiatan.length, icon: Calendar, color: '#7B2FBE' },
          { label: 'Total Kehadiran', value: totalHadir, icon: UserCheck, color: '#00D084' },
          { label: 'Tingkat Kehadiran', value: totalPossible > 0 ? `${Math.round(totalHadir / totalPossible * 100)}%` : '0%', icon: UserCheck, color: '#2F55FF' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: s.color + '20' }}>
                <Icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{s.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Kegiatan list */}
      <div className="space-y-3">
        {kegiatan.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 py-16 text-center">
            <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-gray-600 text-sm">Belum ada kegiatan</p>
          </div>
        ) : (
          kegiatan.map((kg, i) => (
            <KegiatanCard key={kg.id} kegiatan={kg} members={members} currentUser={currentUser}
              canMarkOthers={canMarkOthers} canMarkSelf={canMarkSelf}
              onUpdateAbsensi={updateAbsensi} defaultOpen={i === 0} />
          ))
        )}
      </div>

      <AnimatePresence>
        {showModal && <ModalKegiatan onClose={() => setShowModal(false)} onSave={handleSave} />}
      </AnimatePresence>
    </div>
  )
}
