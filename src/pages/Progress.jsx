import { useState } from 'react'
import { Clock, Upload, AlertTriangle, CheckCircle } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Avatar from '../components/ui/Avatar'
import { can } from '../config/roleConfig'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

export default function Progress() {
  const { dailyProgress, members, currentUser, addDailyProgress, addAuditLog } = useAppStore()
  const role = currentUser?.role || 'riset'
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    morning: '',
    evening: '',
    morningAt: '09:00',
    eveningAt: '17:00',
    proof: '',
  })
  const canViewAll = can(role, 'progress', 'viewAll')
  const rows = canViewAll ? dailyProgress : dailyProgress.filter(item => item.userId === currentUser?.id)
  const complete = rows.filter(item => item.status === 'complete').length
  const missing = rows.length - complete
  const saveProgress = () => {
    const entry = {
      ...form,
      userId: currentUser.id,
      status: form.morning && form.evening ? 'complete' : form.morning ? 'missing_evening' : 'missing_morning',
    }
    addDailyProgress(entry)
    addAuditLog({
      actor: currentUser.id,
      action: 'Input progres harian',
      target: form.date,
      before: '-',
      after: entry.status,
      time: new Date().toLocaleString('id-ID'),
    })
    setShowForm(false)
    setForm({ date: new Date().toISOString().split('T')[0], morning: '', evening: '', morningAt: '09:00', eveningAt: '17:00', proof: '' })
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Progres Harian</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Input pagi dan sore hanya untuk hari kerja. Sabtu dan Minggu tidak dihitung reminder.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium">
          <Upload className="w-4 h-4" /> Input Progres
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{rows.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Log Hari Ini</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
          <p className="text-2xl font-bold text-green-600">{complete}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Lengkap Pagi & Sore</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
          <p className="text-2xl font-bold text-orange-500">{missing}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Butuh Reminder</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
        {rows.map(item => {
          const member = members.find(m => m.id === item.userId)
          return (
            <div key={item.id} className="p-4 border-b last:border-0 border-gray-100 dark:border-gray-800">
              <div className="flex items-start gap-3">
                <Avatar user={member} size="sm" showStatus />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{member?.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-600">{item.date}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${item.status === 'complete' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                      {item.status === 'complete' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {item.status === 'complete' ? 'Lengkap' : 'Belum lengkap'}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Pagi {item.morningAt}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{item.morning || '-'}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Sore {item.eveningAt || '-'}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{item.evening || 'Belum input progres sore'}</p>
                    </div>
                  </div>
                  {item.proof && <p className="text-xs text-primary-600 dark:text-primary-400 mt-2">Bukti kerja: {item.proof}</p>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Input Progres Harian" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Tanggal</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Jam Pagi</label>
              <input type="time" value={form.morningAt} onChange={e => setForm({ ...form, morningAt: e.target.value })} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Jam Sore</label>
              <input type="time" value={form.eveningAt} onChange={e => setForm({ ...form, eveningAt: e.target.value })} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Progres Pagi</label>
            <textarea value={form.morning} onChange={e => setForm({ ...form, morning: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Progres Sore</label>
            <textarea value={form.evening} onChange={e => setForm({ ...form, evening: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nama File Bukti Kerja</label>
            <input value={form.proof} onChange={e => setForm({ ...form, proof: e.target.value })} placeholder="contoh: bukti-kerja.pdf" className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Batal</Button>
            <Button variant="primary" onClick={saveProgress} disabled={!form.morning.trim()} className="flex-1">Simpan</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
