import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FileText, Download, Trash2, X, Check, Search, Eye } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import { can } from '../config/roleConfig'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const JENIS_OPTIONS = ['Rapat Bulanan', 'Rapat Darurat', 'Rapat Koordinasi', 'Seminar', 'Workshop', 'Kegiatan Lapangan', 'Lain-lain']

function ModalNotulen({ onClose, onSave }) {
  const [form, setForm] = useState({
    judul: '', tanggal: format(new Date(), 'yyyy-MM-dd'),
    jenis: JENIS_OPTIONS[0], peserta: '', ringkasan: '', keputusan: '',
    fileName: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const [fileChosen, setFileChosen] = useState('')

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileChosen(file.name)
      set('fileName', file.name)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Tambah Notulen</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Judul Notulen</label>
            <input value={form.judul} onChange={e => set('judul', e.target.value)} placeholder="Judul notulen rapat..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Tanggal</label>
              <input type="date" value={form.tanggal} onChange={e => set('tanggal', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Jenis Kegiatan</label>
              <select value={form.jenis} onChange={e => set('jenis', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200">
                {JENIS_OPTIONS.map(j => <option key={j}>{j}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Peserta (pisahkan dengan koma)</label>
            <input value={form.peserta} onChange={e => set('peserta', e.target.value)} placeholder="Ahmad, Budi, Siti, ..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Ringkasan Pembahasan</label>
            <textarea value={form.ringkasan} onChange={e => set('ringkasan', e.target.value)} rows={4}
              placeholder="Tulis ringkasan hasil pembahasan..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Keputusan / Tindak Lanjut</label>
            <textarea value={form.keputusan} onChange={e => set('keputusan', e.target.value)} rows={3}
              placeholder="Keputusan yang diambil dan tindak lanjut..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Upload Dokumen (opsional)</label>
            <label className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-primary-400 dark:hover:border-primary-600 transition-colors">
              <FileText className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{fileChosen || 'Pilih file...'}</p>
                <p className="text-xs text-gray-400 dark:text-gray-600">PDF, DOC, DOCX, JPG, PNG</p>
              </div>
              <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFile} className="hidden" />
            </label>
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Batal</button>
          <button onClick={() => form.judul && onSave(form)} disabled={!form.judul}
            className="flex-1 py-2.5 text-sm bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> Simpan
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function DetailModal({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{item.judul}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs px-2.5 py-1 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-lg font-medium">{item.jenis}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(item.tanggal), 'd MMMM yyyy', { locale: id })}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Oleh: {item.author}</span>
          </div>
          {item.peserta && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Peserta</p>
              <div className="flex flex-wrap gap-1.5">
                {item.peserta.split(',').map((p, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">{p.trim()}</span>
                ))}
              </div>
            </div>
          )}
          {item.ringkasan && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Ringkasan Pembahasan</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{item.ringkasan}</p>
            </div>
          )}
          {item.keputusan && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Keputusan / Tindak Lanjut</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{item.keputusan}</p>
            </div>
          )}
          {item.fileName && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{item.fileName}</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors">
                <Download className="w-3 h-3" /> Unduh
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function Notulen() {
  const { notulen, addNotulen, deleteNotulen, currentUser } = useAppStore()
  const role = currentUser?.role || 'staff_kreatif'
  const canAdd = can(role, 'documents', 'upload')
  const canDelete = can(role, 'documents', 'viewImportant')

  const [showModal, setShowModal] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = notulen.filter(n =>
    n.judul.toLowerCase().includes(search.toLowerCase()) ||
    n.jenis?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))

  const handleSave = (data) => {
    addNotulen({
      ...data,
      id: `nt-${Date.now()}`,
      author: currentUser?.name || 'Unknown',
    })
    setShowModal(false)
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notulen &amp; Dokumen</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Arsip notulen rapat dan dokumen GRCC</p>
        </div>
        {canAdd && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Tambah Notulen
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[...new Set(notulen.map(n => n.jenis))].slice(0, 4).map((jenis, i) => (
          <motion.div key={jenis} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{notulen.filter(n => n.jenis === jenis).length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{jenis}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari notulen..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 py-16 text-center">
          <FileText className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-gray-600 text-sm">Belum ada notulen</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{n.judul}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs px-2 py-0.5 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-md font-medium">{n.jenis}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(n.tanggal), 'd MMM yyyy', { locale: id })}
                        </span>
                        {n.author && <span className="text-xs text-gray-400 dark:text-gray-600">· {n.author}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => setDetailItem(n)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Lihat detail">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {n.fileName && (
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" title="Unduh dokumen">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => deleteNotulen(n.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors" title="Hapus">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {n.ringkasan && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{n.ringkasan}</p>
                  )}
                  {n.peserta && (
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-1.5">
                      Peserta: {n.peserta}
                    </p>
                  )}
                  {n.fileName && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <FileText className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400 dark:text-gray-600">{n.fileName}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && <ModalNotulen onClose={() => setShowModal(false)} onSave={handleSave} />}
        {detailItem && <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />}
      </AnimatePresence>
    </div>
  )
}
