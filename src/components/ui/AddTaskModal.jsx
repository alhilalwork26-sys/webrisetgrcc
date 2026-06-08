import { useState } from 'react'
import Modal from './Modal'
import Button from './Button'
import useAppStore from '../../store/useAppStore'
import { can } from '../../config/roleConfig'

export default function AddTaskModal({ open, onClose }) {
  const { addTask, projects, members, currentUser, addAuditLog } = useAppStore()
  const role = currentUser?.role || 'riset'
  const assignableMembers = can(role, 'tasks', 'viewAll') ? members : members.filter(member => member.id === currentUser?.id)
  const [form, setForm] = useState({
    title: '', description: '', priority: 'normal', status: 'todo',
    projectId: projects[0]?.id || '', dueDate: '', assignees: [currentUser?.id], tags: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const task = {
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    addTask(task)
    addAuditLog({
      actor: currentUser.id,
      action: 'Membuat task',
      target: form.title,
      before: '-',
      after: form.assignees.join(', '),
      time: new Date().toLocaleString('id-ID'),
    })
    setForm({ title: '', description: '', priority: 'normal', status: 'todo', projectId: projects[0]?.id || '', dueDate: '', assignees: [currentUser.id], tags: '' })
    onClose()
  }

  const toggleAssignee = (uid) => {
    setForm(f => ({
      ...f,
      assignees: f.assignees.includes(uid) ? f.assignees.filter(id => id !== uid) : [...f.assignees, uid]
    }))
  }

  return (
    <Modal open={open} onClose={onClose} title="Buat Tugas Baru" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nama Tugas *</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Masukkan nama tugas..." autoFocus
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200 placeholder-gray-400" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Deskripsi</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            rows={2} placeholder="Deskripsi singkat tugas..."
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200 placeholder-gray-400 resize-none" />
        </div>

        {/* Priority + Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Prioritas</label>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-700 dark:text-gray-300">
              <option value="urgent">Urgent</option>
              <option value="high">Tinggi</option>
              <option value="normal">Normal</option>
              <option value="low">Rendah</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-700 dark:text-gray-300">
              <option value="todo">Belum Mulai</option>
              <option value="inprogress">Sedang Berjalan</option>
              <option value="review">Direview</option>
              <option value="done">Selesai</option>
            </select>
          </div>
        </div>

        {/* Project + Due date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Proyek</label>
            <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-700 dark:text-gray-300">
              {projects.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Tenggat</label>
            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-700 dark:text-gray-300" />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Tag (pisahkan dengan koma)</label>
          <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
            placeholder="Contoh: Desain, Web, Penting"
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200 placeholder-gray-400" />
        </div>

        {/* Assignees */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Ditugaskan kepada</label>
          <div className="flex flex-wrap gap-2">
            {assignableMembers.map(m => (
              <button key={m.id} type="button" onClick={() => toggleAssignee(m.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${form.assignees.includes(m.id) ? 'border-transparent text-white' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}
                style={form.assignees.includes(m.id) ? { backgroundColor: m.color } : {}}>
                <span className="w-5 h-5 rounded-full text-white flex items-center justify-center text-xs font-bold" style={{ backgroundColor: m.color }}>{m.initials}</span>
                {m.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1" type="button">Batal</Button>
          <Button variant="primary" type="submit" className="flex-1">Buat Tugas</Button>
        </div>
      </form>
    </Modal>
  )
}
