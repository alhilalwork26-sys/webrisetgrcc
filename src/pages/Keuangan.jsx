import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, TrendingUp, TrendingDown, Wallet, Search, X, Check, Trash2, Edit2, Download, Printer } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import { can } from '../config/roleConfig'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const KATEGORI_MASUK = ['Pemasukan Training', 'DP Client', 'Pelunasan Client', 'Lain-lain']
const KATEGORI_KELUAR = ['Makan', 'ATK', 'Rumah Tangga', 'Keperluan Prof', 'Aksara Art House', 'Uang Mingguan', 'Transportasi', 'Lain-lain']

function formatRp(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

function ModalTransaksi({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || { jenis: 'masuk', jumlah: '', keterangan: '', kategori: KATEGORI_MASUK[0], tanggal: format(new Date(), 'yyyy-MM-dd') })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const kategoriList = form.jenis === 'masuk' ? KATEGORI_MASUK : KATEGORI_KELUAR

  const handleSave = () => {
    if (!form.jumlah || !form.keterangan) return
    onSave({ ...form, jumlah: Number(form.jumlah) })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{initial ? 'Edit Transaksi' : 'Tambah Transaksi'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Jenis */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Jenis Transaksi</label>
            <div className="flex gap-2">
              {['masuk', 'keluar'].map(j => (
                <button key={j} onClick={() => { set('jenis', j); set('kategori', j === 'masuk' ? KATEGORI_MASUK[0] : KATEGORI_KELUAR[0]) }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.jenis === j
                    ? j === 'masuk' ? 'bg-green-50 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400'
                      : 'bg-red-50 border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  {j === 'masuk' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {j === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
                </button>
              ))}
            </div>
          </div>
          {/* Jumlah */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Jumlah (Rp)</label>
            <input type="number" value={form.jumlah} onChange={e => set('jumlah', e.target.value)} placeholder="0"
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
          </div>
          {/* Keterangan */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Keterangan</label>
            <input value={form.keterangan} onChange={e => set('keterangan', e.target.value)} placeholder="Deskripsi transaksi..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
          </div>
          {/* Kategori */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Kategori</label>
            <select value={form.kategori} onChange={e => set('kategori', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200">
              {kategoriList.map(k => <option key={k}>{k}</option>)}
            </select>
          </div>
          {/* Tanggal */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Tanggal</label>
            <input type="date" value={form.tanggal} onChange={e => set('tanggal', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Batal</button>
          <button onClick={handleSave} disabled={!form.jumlah || !form.keterangan}
            className="flex-1 py-2.5 text-sm bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> Simpan
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function Keuangan() {
  const { keuangan, saldoAwal, addTransaksi, updateTransaksi, deleteTransaksi, currentUser, addAuditLog } = useAppStore()
  const role = currentUser?.role || 'staff_kreatif'
  const canAdd = can(role, 'finance', 'add')
  const canEdit = can(role, 'finance', 'edit')
  const canDelete = can(role, 'finance', 'edit')

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('semua')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const totalMasuk = keuangan.filter(t => t.jenis === 'masuk').reduce((s, t) => s + t.jumlah, 0)
  const totalKeluar = keuangan.filter(t => t.jenis === 'keluar').reduce((s, t) => s + t.jumlah, 0)
  const saldo = saldoAwal + totalMasuk - totalKeluar

  const filtered = keuangan.filter(t => {
    const matchSearch = t.keterangan.toLowerCase().includes(search.toLowerCase()) || t.kategori.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'semua' || t.jenis === filter
    return matchSearch && matchFilter
  }).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))

  const handleSave = (data) => {
    if (editItem) {
      updateTransaksi(editItem.id, data)
      addAuditLog({ actor: currentUser.id, action: 'Edit transaksi finance', target: data.keterangan, before: editItem.status || '-', after: data.status || editItem.status || 'updated', time: new Date().toLocaleString('id-ID') })
      setEditItem(null)
    } else {
      addTransaksi({ ...data, id: `k-${Date.now()}` })
      addAuditLog({ actor: currentUser.id, action: 'Tambah transaksi finance', target: data.keterangan, before: '-', after: formatRp(data.jumlah), time: new Date().toLocaleString('id-ID') })
    }
    setShowModal(false)
  }
  const exportCsv = () => {
    const header = ['Tanggal', 'Keterangan', 'Kategori', 'Jenis', 'Jumlah', 'Status']
    const lines = filtered.map(t => [t.tanggal, t.keterangan, t.kategori, t.jenis, t.jumlah, t.status || 'draft'])
    const csv = [header, ...lines].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'finance-operasional.csv'
    link.click()
    URL.revokeObjectURL(url)
    addAuditLog({ actor: currentUser.id, action: 'Export CSV finance', target: 'finance-operasional.csv', before: '-', after: `${filtered.length} rows`, time: new Date().toLocaleString('id-ID') })
  }
  const printReport = () => {
    addAuditLog({ actor: currentUser.id, action: 'Print laporan finance', target: 'Finance Operasional', before: '-', after: 'print', time: new Date().toLocaleString('id-ID') })
    window.print()
  }

  const stats = [
    { label: 'Saldo Saat Ini', value: saldo, icon: Wallet, color: '#7B2FBE', bg: 'from-primary-600 to-purple-600', isMain: true },
    { label: 'Total Pemasukan', value: totalMasuk, icon: TrendingUp, color: '#00D084', dark: false },
    { label: 'Total Pengeluaran', value: totalKeluar, icon: TrendingDown, color: '#EF4444', dark: false },
  ]

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Finance Operasional</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Catat pengeluaran, invoice/nota, status draft/submitted/dibayar, export CSV dan print laporan.</p>
        </div>
        {canAdd && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportCsv} className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-xl transition-colors">
              <Download className="w-4 h-4" /> CSV
            </button>
            <button onClick={printReport} className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-xl transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={() => { setEditItem(null); setShowModal(true) }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> Tambah Transaksi
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`rounded-2xl p-5 ${s.isMain ? `bg-gradient-to-br ${s.bg} text-white` : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.isMain ? 'bg-white/20' : ''}`}
                style={!s.isMain ? { backgroundColor: s.color + '20' } : {}}>
                <Icon className="w-5 h-5" style={{ color: s.isMain ? 'white' : s.color }} />
              </div>
              <p className={`text-xs font-medium mb-1 ${s.isMain ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>{s.label}</p>
              <p className={`text-xl font-bold leading-tight ${s.isMain ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {formatRp(s.value)}
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Filter & Search */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari transaksi..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
        </div>
        <div className="flex gap-2">
          {['semua', 'masuk', 'keluar'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-medium rounded-xl transition-all capitalize ${filter === f ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              {f === 'semua' ? 'Semua' : f === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Wallet className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-gray-600 text-sm">Belum ada transaksi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Tanggal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Keterangan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Kategori</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Jumlah</th>
                  {(canEdit || canDelete) && <th className="px-4 py-3 w-16" />}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {format(new Date(t.tanggal), 'd MMM yyyy', { locale: id })}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{t.keterangan}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{t.kategori}</span>
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${t.jenis === 'masuk' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {t.jenis === 'masuk' ? '+' : '-'}{formatRp(t.jumlah)}
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <button onClick={() => { setEditItem(t); setShowModal(true) }}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => { deleteTransaksi(t.id); addAuditLog({ actor: currentUser.id, action: 'Hapus transaksi finance', target: t.keterangan, before: formatRp(t.jumlah), after: 'deleted', time: new Date().toLocaleString('id-ID') }) }}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <ModalTransaksi
            onClose={() => { setShowModal(false); setEditItem(null) }}
            onSave={handleSave}
            initial={editItem}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
