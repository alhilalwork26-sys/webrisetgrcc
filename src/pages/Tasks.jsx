import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List, LayoutGrid, Calendar, Plus, Search, MoreHorizontal, Trash2, Check, MessageSquare, Paperclip } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Avatar from '../components/ui/Avatar'
import { PriorityBadge, StatusBadge, statusConfig } from '../components/ui/Badge'
import TaskDetailModal from '../components/ui/TaskDetailModal'
import { can } from '../config/roleConfig'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

const statusOrder = ['todo', 'inprogress', 'review', 'done']

function TaskRow({ task, members, onMove, onDelete, onClick }) {
  const assignedMembers = members.filter(m => task.assignees?.includes(m.id))
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group border-b border-gray-50 dark:border-gray-800/50 cursor-pointer"
      onClick={onClick}>
      {/* Status dot */}
      <div className="w-6 flex justify-center shrink-0">
        <div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-green-400' : task.status === 'inprogress' ? 'bg-blue-400' : task.status === 'review' ? 'bg-purple-400' : 'bg-gray-300'}`} />
      </div>

      {/* Checkbox */}
      <button
        onClick={e => { e.stopPropagation(); onMove(task.id, task.status === 'done' ? 'todo' : 'done') }}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mr-3 transition-colors ${task.status === 'done' ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600 hover:border-green-400'}`}>
        {task.status === 'done' && <Check className="w-3 h-3 text-white" />}
      </button>

      {/* Name + tags */}
      <div className="flex-1 min-w-0 mr-3">
        <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{task.title}</p>
        {task.tags?.length > 0 && (
          <div className="flex gap-1 mt-0.5 overflow-hidden">
            {task.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs px-1.5 py-0 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded whitespace-nowrap">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Right columns — fixed widths matching header */}
      <div className="hidden sm:flex items-center shrink-0">
        <div className="w-24 flex justify-center">
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="w-32 flex justify-center">
          <StatusBadge status={task.status} />
        </div>
        <div className="w-20 flex items-center justify-center gap-2.5 text-xs text-gray-400 dark:text-gray-600">
          <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" />{task.comments}</span>
          {task.attachments > 0 && <span className="flex items-center gap-0.5"><Paperclip className="w-3 h-3" />{task.attachments}</span>}
        </div>
        <div className="w-16 flex justify-center">
          {task.dueDate && (
            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
              {format(parseISO(task.dueDate), 'd MMM', { locale: id })}
            </span>
          )}
        </div>
        <div className="w-16 flex justify-center">
          <div className="flex -space-x-1.5">
            {assignedMembers.slice(0, 3).map(m => <Avatar key={m.id} user={m} size="xs" />)}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="w-8 flex justify-center shrink-0" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-all">
          <MoreHorizontal className="w-4 h-4" />
        </button>
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-4 mt-8 w-40 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 z-10 overflow-hidden py-1">
              {statusOrder.filter(s => s !== task.status).map(s => (
                <button key={s}
                  onClick={() => { onMove(task.id, s); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: s === 'done' ? '#22c55e' : s === 'inprogress' ? '#3b82f6' : s === 'review' ? '#a855f7' : '#9ca3af' }} />
                  {statusConfig[s]?.label}
                </button>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
              <button
                onClick={() => { onDelete(task.id); setShowMenu(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                <Trash2 className="w-3 h-3" /> Hapus Tugas
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function KanbanCard({ task, members, onClick }) {
  const assignedMembers = members.filter(m => task.assignees?.includes(m.id))
  return (
    <motion.div
      layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3.5 hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className={`text-sm font-medium flex-1 ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{task.title}</p>
        <PriorityBadge priority={task.priority} />
      </div>
      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {task.tags.map(t => (
            <span key={t} className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">{t}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600">
          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{task.comments}</span>
          {task.attachments > 0 && (
            <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" />{task.attachments}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {format(parseISO(task.dueDate), 'd MMM', { locale: id })}
            </span>
          )}
          <div className="flex -space-x-1.5">
            {assignedMembers.slice(0, 2).map(m => <Avatar key={m.id} user={m} size="xs" />)}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Tasks() {
  const { tasks, taskView, setTaskView, taskFilter, setTaskFilter, members, moveTask, deleteTask, openModal, currentUser, addAuditLog } = useAppStore()
  const [search, setSearch] = useState('')
  const [openTaskId, setOpenTaskId] = useState(null)
  const role = currentUser?.role || 'riset'
  const visibleTasks = can(role, 'tasks', 'viewAll') ? tasks : tasks.filter(t => t.assignees?.includes(currentUser?.id))

  const handleMove = (id, status) => {
    const task = tasks.find(t => t.id === id)
    moveTask(id, status)
    addAuditLog({
      actor: currentUser.id,
      action: 'Mengubah status task',
      target: task?.title || id,
      before: task?.status || '-',
      after: status,
      time: new Date().toLocaleString('id-ID'),
    })
  }

  const handleDelete = (id) => {
    const task = tasks.find(t => t.id === id)
    deleteTask(id)
    addAuditLog({
      actor: currentUser.id,
      action: 'Menghapus task',
      target: task?.title || id,
      before: task?.status || '-',
      after: 'deleted',
      time: new Date().toLocaleString('id-ID'),
    })
  }

  const filtered = visibleTasks.filter(t => {
    if (taskFilter.status !== 'all' && t.status !== taskFilter.status) return false
    if (taskFilter.priority !== 'all' && t.priority !== taskFilter.priority) return false
    if (taskFilter.projectId !== 'all' && t.projectId !== taskFilter.projectId) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const columns = statusOrder.map(s => ({
    status: s,
    label: statusConfig[s]?.label,
    tasks: filtered.filter(t => t.status === s),
  }))

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 px-4 md:px-6 py-3 flex flex-wrap items-center gap-3 shrink-0">
        {/* View switcher */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-0.5 gap-0.5">
          {[
            { id: 'list', icon: List, label: 'List' },
            { id: 'board', icon: LayoutGrid, label: 'Board' },
            { id: 'calendar', icon: Calendar, label: 'Kalender' },
          ].map(v => {
            const Icon = v.icon
            return (
              <button key={v.id} onClick={() => setTaskView(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${taskView === v.id ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari tugas..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-700 dark:text-gray-300 placeholder-gray-400" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select value={taskFilter.status} onChange={e => setTaskFilter({ status: e.target.value })}
            className="text-xs px-2 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer">
            <option value="all">Semua Status</option>
            <option value="todo">Belum Mulai</option>
            <option value="inprogress">Sedang Berjalan</option>
            <option value="review">Direview</option>
            <option value="done">Selesai</option>
          </select>
          <select value={taskFilter.priority} onChange={e => setTaskFilter({ priority: e.target.value })}
            className="text-xs px-2 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer">
            <option value="all">Semua Prioritas</option>
            <option value="urgent">Urgent</option>
            <option value="high">Tinggi</option>
            <option value="normal">Normal</option>
            <option value="low">Rendah</option>
          </select>
        </div>

        <button onClick={() => openModal('addTask')}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5" /> Buat Tugas
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <AnimatePresence mode="wait">
          {/* LIST VIEW */}
          {taskView === 'list' && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="hidden sm:flex items-center px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80">
                <div className="w-6 shrink-0" /><div className="w-5 shrink-0 mr-3" />
                <span className="flex-1 text-xs font-semibold text-gray-500 dark:text-gray-400 mr-3">Nama Tugas</span>
                <div className="flex items-center shrink-0">
                  <span className="w-24 text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">Prioritas</span>
                  <span className="w-32 text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">Status</span>
                  <span className="w-20 text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">Aktivitas</span>
                  <span className="w-16 text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">Tenggat</span>
                  <span className="w-16 text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">Tim</span>
                </div>
                <div className="w-8 shrink-0" />
              </div>
              {filtered.length === 0 ? (
                <div className="py-16 text-center text-gray-400 dark:text-gray-600">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="text-sm font-medium">Tidak ada tugas ditemukan</p>
                  <p className="text-xs mt-1">Coba ubah filter atau buat tugas baru</p>
                </div>
              ) : (
                filtered.map(task => (
                  <TaskRow key={task.id} task={task} members={members}
                    onMove={handleMove} onDelete={handleDelete}
                    onClick={() => setOpenTaskId(task.id)} />
                ))
              )}
            </motion.div>
          )}

          {/* BOARD VIEW */}
          {taskView === 'board' && (
            <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex gap-4 overflow-x-auto pb-4 min-h-96">
              {columns.map(col => (
                <div key={col.status} className="flex-shrink-0 w-72">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.status === 'done' ? 'bg-green-400' : col.status === 'inprogress' ? 'bg-blue-400' : col.status === 'review' ? 'bg-purple-400' : 'bg-gray-300'}`} />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{col.label}</span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full px-2 py-0.5 font-medium">{col.tasks.length}</span>
                    </div>
                    <button onClick={() => openModal('addTask')}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {col.tasks.map(task => (
                      <KanbanCard key={task.id} task={task} members={members} onClick={() => setOpenTaskId(task.id)} />
                    ))}
                    {col.tasks.length === 0 && (
                      <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center text-xs text-gray-400 dark:text-gray-600">
                        Tidak ada tugas
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* CALENDAR VIEW */}
          {taskView === 'calendar' && (
            <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <CalendarView tasks={filtered} onTaskClick={setOpenTaskId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {openTaskId && (
          <TaskDetailModal key={openTaskId} taskId={openTaskId} onClose={() => setOpenTaskId(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function CalendarView({ tasks, onTaskClick }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1))
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const getTasksForDay = (day) => {
    if (!day) return []
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return tasks.filter(t => t.dueDate === dateStr)
  }

  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
  const dayNames = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']
  const today = new Date()

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-900 dark:text-white text-base">{monthNames[month]} {year}</h3>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors font-medium">‹</button>
          <button onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors font-medium">Hari ini</button>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors font-medium">›</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-600 py-1.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const dayTasks = getTasksForDay(day)
          const isToday = day && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
          return (
            <div key={i}
              className={`min-h-[4.5rem] p-1.5 rounded-xl border transition-colors ${day ? 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50' : 'border-transparent'} ${isToday ? 'border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-950/20' : ''}`}>
              {day && (
                <>
                  <span className={`text-xs font-semibold block mb-1 ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>{day}</span>
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 2).map(t => (
                      <button key={t.id} onClick={() => onTaskClick(t.id)}
                        className={`w-full text-left text-xs px-1 py-0.5 rounded truncate transition-opacity hover:opacity-80 ${t.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : t.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {t.title}
                      </button>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-xs text-gray-400 dark:text-gray-600 pl-1">+{dayTasks.length - 2} lagi</span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
