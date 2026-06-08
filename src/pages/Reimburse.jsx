import { useState } from 'react'
import { Check, CreditCard, Receipt, X } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import { can } from '../config/roleConfig'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

function formatRp(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

const statusClass = {
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  approved: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

export default function Reimburse() {
  const { reimbursements, members, currentUser, updateReimbursement, addReimbursement, addAuditLog } = useAppStore()
  const role = currentUser?.role || 'riset'
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', date: new Date().toISOString().split('T')[0], receipt: '', item1: '', amount1: '', item2: '', amount2: '' })
  const rows = can(role, 'reimburse', 'viewAll') ? reimbursements : reimbursements.filter(item => item.requester === currentUser?.id)
  const total = rows.reduce((sum, item) => sum + item.total, 0)
  const saveReimbursement = () => {
    const items = [
      { name: form.item1, amount: Number(form.amount1 || 0) },
      { name: form.item2, amount: Number(form.amount2 || 0) },
    ].filter(item => item.name && item.amount > 0)
    const payload = {
      requester: currentUser.id,
      date: form.date,
      title: form.title,
      items,
      total: items.reduce((sum, item) => sum + item.amount, 0),
      receipt: form.receipt || 'receipt-upload.pdf',
      paidProof: '',
      approver: '',
    }
    addReimbursement(payload)
    addAuditLog({
      actor: currentUser.id,
      action: 'Mengajukan reimburse',
      target: form.title,
      before: '-',
      after: formatRp(payload.total),
      time: new Date().toLocaleString('id-ID'),
    })
    setShowForm(false)
    setForm({ title: '', date: new Date().toISOString().split('T')[0], receipt: '', item1: '', amount1: '', item2: '', amount2: '' })
  }
  const updateStatus = (item, status, extra = {}) => {
    updateReimbursement(item.id, { status, ...extra })
    addAuditLog({
      actor: currentUser.id,
      action: 'Mengubah status reimburse',
      target: item.title,
      before: item.status,
      after: status,
      time: new Date().toLocaleString('id-ID'),
    })
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ajukan Reimburse</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Multi-item, upload struk, approval finance, bukti pembayaran, dan akses user milik sendiri.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium">
          <Receipt className="w-4 h-4" /> Pengajuan Baru
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4"><p className="text-2xl font-bold text-gray-900 dark:text-white">{rows.length}</p><p className="text-xs text-gray-500 dark:text-gray-400">Pengajuan</p></div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4"><p className="text-2xl font-bold text-primary-600">{formatRp(total)}</p><p className="text-xs text-gray-500 dark:text-gray-400">Total Nilai</p></div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4"><p className="text-2xl font-bold text-green-600">{rows.filter(r => r.status === 'paid').length}</p><p className="text-xs text-gray-500 dark:text-gray-400">Sudah Dibayar</p></div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
        {rows.map(item => {
          const requester = members.find(m => m.id === item.requester)
          return (
            <div key={item.id} className="p-4 border-b last:border-0 border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${statusClass[item.status]}`}>{item.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{requester?.name} · {item.date} · {item.receipt}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.items.map(line => <span key={line.name} className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{line.name}: {formatRp(line.amount)}</span>)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{formatRp(item.total)}</p>
                  {can(role, 'reimburse', 'approve') && item.status === 'submitted' && (
                    <div className="flex gap-1 mt-2 justify-end">
                      <button onClick={() => updateStatus(item, 'approved', { approver: currentUser.id })} className="p-1.5 rounded-lg bg-green-100 text-green-700"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => updateStatus(item, 'rejected', { approver: currentUser.id })} className="p-1.5 rounded-lg bg-red-100 text-red-700"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                  {can(role, 'reimburse', 'pay') && item.status === 'approved' && (
                    <button onClick={() => updateStatus(item, 'paid', { paidProof: 'bukti-transfer.pdf' })} className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-600 text-white text-xs"><CreditCard className="w-3 h-3" /> Bayar</button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Pengajuan Reimburse" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Judul Pengajuan</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Tanggal</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">File Struk</label>
              <input value={form.receipt} onChange={e => setForm({ ...form, receipt: e.target.value })} placeholder="struk.pdf" className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
            </div>
          </div>
          {[1, 2].map(index => (
            <div key={index} className="grid grid-cols-[1fr_140px] gap-3">
              <input value={form[`item${index}`]} onChange={e => setForm({ ...form, [`item${index}`]: e.target.value })} placeholder={`Item ${index}`} className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
              <input type="number" value={form[`amount${index}`]} onChange={e => setForm({ ...form, [`amount${index}`]: e.target.value })} placeholder="Jumlah" className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
            </div>
          ))}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Batal</Button>
            <Button variant="primary" onClick={saveReimbursement} disabled={!form.title.trim() || !form.item1.trim() || !form.amount1} className="flex-1">Ajukan</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
