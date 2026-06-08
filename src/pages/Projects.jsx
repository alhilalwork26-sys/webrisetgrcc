import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, CheckSquare, MoreHorizontal, Search } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Avatar from '../components/ui/Avatar'
import ProgressBar from '../components/ui/ProgressBar'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'


function ProjectCard({ proj, tasks, members, idx, onEdit }) {
  const projTasks = tasks.filter(t => t.projectId === proj.id)
  const done = projTasks.filter(t => t.status === 'done').length
  const projMembers = members.filter(m => proj.members?.includes(m.id))

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: proj.color + '20' }}>
            {proj.icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{proj.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: proj.color + '20', color: proj.color }}>
              {proj.category}
            </span>
          </div>
        </div>
        <button onClick={(event) => { event.stopPropagation(); onEdit(proj) }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-all" title="Edit proyek">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{proj.description}</p>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{proj.progress}%</span>
        </div>
        <ProgressBar value={proj.progress} color={proj.color} height={6} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5" />{done}/{projTasks.length}</span>
          <span className={`px-2 py-0.5 rounded-full font-medium ${proj.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
            {proj.status === 'active' ? 'Aktif' : 'Perencanaan'}
          </span>
        </div>
        <div className="flex -space-x-2">
          {projMembers.slice(0, 4).map(m => <Avatar key={m.id} user={m} size="sm" />)}
          {projMembers.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 font-medium">
              +{projMembers.length - 4}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function Projects() {
  const { projects, tasks, members, addProject, updateProject } = useAppStore()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const emptyForm = { name: '', description: '', category: 'Market Research', icon: '🔬', color: '#EF4444' }
  const [form, setForm] = useState(emptyForm)

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  const handleAdd = () => {
    if (!form.name.trim()) return
    if (editingProject) {
      updateProject(editingProject.id, form)
    } else {
      addProject({ ...form, members: [], status: 'planning', dueDate: '' })
    }
    setForm(emptyForm)
    setEditingProject(null)
    setShowModal(false)
  }

  const openEdit = (project) => {
    setEditingProject(project)
    setForm({
      name: project.name,
      description: project.description,
      category: project.category,
      icon: project.icon,
      color: project.color,
    })
    setShowModal(true)
  }

  const icons = ['🔬', '📋', '📈', '📊', '🧪', '📝', '🎯', '📚', '🌐', '📁']
  const colors = ['#EF4444', '#14B8A6', '#6366F1', '#F97316', '#0EA5E9', '#7B2FBE', '#00D084', '#F59E0B']

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Proyek</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{projects.length} proyek · {projects.filter(p => p.status === 'active').length} aktif</p>
        </div>
        <button onClick={() => { setEditingProject(null); setForm(emptyForm); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Proyek Baru
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari proyek..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-700 dark:text-gray-300 placeholder-gray-400" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[['Total Proyek', projects.length, '#7B2FBE'], ['Aktif', projects.filter(p => p.status === 'active').length, '#00D084'], ['Perencanaan', projects.filter(p => p.status === 'planning').length, '#F59E0B'], ['Rata-rata Progress', Math.round(projects.reduce((a, b) => a + b.progress, 0) / (projects.length || 1)) + '%', '#2F55FF']].map(([label, val, color]) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
            <p className="text-2xl font-bold" style={{ color }}>{val}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Projects grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((proj, i) => <ProjectCard key={proj.id} proj={proj} tasks={tasks} members={members} idx={i} onEdit={openEdit} />)}
      </div>

      {/* Add Project Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditingProject(null); setForm(emptyForm) }} title={editingProject ? 'Edit Proyek Riset' : 'Buat Proyek Baru'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Proyek</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Masukkan nama proyek..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200 placeholder-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Deskripsi</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Deskripsi singkat proyek..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200 placeholder-gray-400 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kategori</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-700 dark:text-gray-300">
              {['Market Research', 'Training Research', 'Operational Research', 'Marketing Research', 'Desk Research', 'Lainnya'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ikon</label>
            <div className="flex flex-wrap gap-2">
              {icons.map(ic => (
                <button key={ic} onClick={() => setForm({ ...form, icon: ic })}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${form.icon === ic ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-950/30' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Warna</label>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button key={c} onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900 scale-110' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => { setShowModal(false); setEditingProject(null); setForm(emptyForm) }} className="flex-1">Batal</Button>
            <Button variant="primary" onClick={handleAdd} className="flex-1">{editingProject ? 'Simpan Proyek' : 'Buat Proyek'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
