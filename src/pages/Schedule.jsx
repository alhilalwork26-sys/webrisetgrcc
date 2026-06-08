import { useState } from 'react'
import { Calendar, MapPin, User } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

const categoryStyle = {
  'Pelatihan In-House': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Pelatihan Public': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Sertifikasi: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Riset: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function Schedule() {
  const { kegiatan, members, currentUser, addKegiatan, addAuditLog } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    nama: '',
    tanggal: new Date().toISOString().split('T')[0],
    waktu: '09:00',
    lokasi: '',
    jenis: 'Pelatihan In-House',
  })
  const saveSchedule = () => {
    addKegiatan({ ...form, createdBy: currentUser.id })
    addAuditLog({
      actor: currentUser.id,
      action: 'Membuat jadwal',
      target: form.nama,
      before: '-',
      after: `${form.tanggal} ${form.waktu}`,
      time: new Date().toLocaleString('id-ID'),
    })
    setShowForm(false)
    setForm({ nama: '', tanggal: new Date().toISOString().split('T')[0], waktu: '09:00', lokasi: '', jenis: 'Pelatihan In-House' })
  }
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Jadwal Kegiatan</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Kalender lintas role dengan warna kategori dan detail pembuat jadwal.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium">
          <Calendar className="w-4 h-4" /> Buat Jadwal
        </button>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kegiatan.map(event => {
          const creator = members.find(m => m.id === event.createdBy)
          return (
            <div key={event.id} title={`${event.nama} - ${creator?.name || 'System'}`} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 hover:shadow-md transition-all">
              <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${categoryStyle[event.jenis] || 'bg-gray-100 text-gray-600'}`}>{event.jenis}</span>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-3">{event.nama}</h3>
              <div className="space-y-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {event.tanggal} · {event.waktu}</p>
                <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {event.lokasi}</p>
                <p className="flex items-center gap-2"><User className="w-3.5 h-3.5" /> {creator?.name || 'System'}</p>
              </div>
            </div>
          )
        })}
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Buat Jadwal" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nama Kegiatan</label>
            <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Tanggal</label>
              <input type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Waktu</label>
              <input type="time" value={form.waktu} onChange={e => setForm({ ...form, waktu: e.target.value })} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Kategori</label>
            <select value={form.jenis} onChange={e => setForm({ ...form, jenis: e.target.value })} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200">
              {Object.keys(categoryStyle).map(category => <option key={category}>{category}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Lokasi</label>
            <input value={form.lokasi} onChange={e => setForm({ ...form, lokasi: e.target.value })} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Batal</Button>
            <Button variant="primary" onClick={saveSchedule} disabled={!form.nama.trim()} className="flex-1">Simpan</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
