import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Calendar, Flag, Folder, Tag, MessageSquare, Paperclip, Check, Trash2, Edit2, Send } from 'lucide-react'
import useAppStore from '../../store/useAppStore'
import Avatar from './Avatar'
import { PriorityBadge, StatusBadge, statusConfig } from './Badge'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

function formatDate(str) {
  try { return format(parseISO(str), 'd MMMM yyyy', { locale: id }) } catch { return str }
}

function MetaRow({ icon, label, children }) {
  return (
    <div>
      <p className="text-xs text-gray-400 dark:text-gray-600 mb-1 flex items-center gap-1.5 font-medium">
        {icon} {label}
      </p>
      {children}
    </div>
  )
}

export default function TaskDetailModal({ taskId, onClose }) {
  const { tasks, members, projects, moveTask, deleteTask, updateTask } = useAppStore()
  const task = tasks.find(t => t.id === taskId)
  const [comment, setComment] = useState('')
  const [editTitle, setEditTitle] = useState(false)
  const [titleVal, setTitleVal] = useState(task?.title || '')
  const [localComments, setLocalComments] = useState(() => {
    const seed = [
      { id: 'c1', author: members[0], text: 'Sudah mulai dikerjakan, perlu review dari tim.', time: '2 jam lalu' },
      { id: 'c2', author: members[1], text: 'Oke, saya review besok pagi ya.', time: '1 jam lalu' },
    ]
    return seed.slice(0, task?.comments || 0)
  })

  if (!task) return null

  const assignedMembers = members.filter(m => task.assignees?.includes(m.id))
  const project = projects.find(p => p.id === task.projectId)

  const handleStatusChange = (status) => moveTask(task.id, status)

  const handleSendComment = () => {
    if (!comment.trim()) return
    const newComment = {
      id: `c-${localComments.length + 1}`,
      author: members[0],
      text: comment,
      time: 'Baru saja',
    }
    setLocalComments(prev => [...prev, newComment])
    updateTask(task.id, { comments: task.comments + 1 })
    setComment('')
  }

  const handleSaveTitle = () => {
    if (titleVal.trim()) updateTask(task.id, { title: titleVal })
    setEditTitle(false)
  }

  const handleDelete = () => {
    deleteTask(task.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="relative w-full sm:max-w-2xl bg-white dark:bg-gray-900 sm:rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => handleStatusChange(task.status === 'done' ? 'todo' : 'done')}
            className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${task.status === 'done' ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600 hover:border-green-400'}`}>
            {task.status === 'done' && <Check className="w-3 h-3 text-white" />}
          </button>

          <div className="flex-1 min-w-0">
            {editTitle ? (
              <input autoFocus value={titleVal} onChange={e => setTitleVal(e.target.value)}
                onBlur={handleSaveTitle} onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
                className="w-full text-base font-semibold bg-transparent border-b border-primary-400 outline-none text-gray-900 dark:text-white pb-0.5" />
            ) : (
              <h2
                onClick={() => { setEditTitle(true); setTitleVal(task.title) }}
                className={`text-base font-semibold cursor-text hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                {task.title}
              </h2>
            )}
            {project && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                <span>{project.icon}</span> {project.name}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => { setEditTitle(true); setTitleVal(task.title) }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors" title="Edit">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors" title="Hapus">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Description */}
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2">Deskripsi</p>
              {task.description
                ? <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{task.description}</p>
                : <p className="text-sm italic text-gray-400 dark:text-gray-600">Belum ada deskripsi.</p>
              }
            </div>

            {/* Tags */}
            {task.tags?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2">Tag</p>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Status change */}
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2">Ubah Status</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <button key={key} onClick={() => handleStatusChange(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${task.status === key ? `${cfg.class} border-transparent ring-2 ring-offset-1 dark:ring-offset-gray-900 ring-current` : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-3">
                Komentar ({localComments.length})
              </p>
              <div className="space-y-3 mb-3">
                {localComments.map(c => (
                  <div key={c.id} className="flex gap-2.5">
                    <Avatar user={c.author} size="xs" />
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{c.author?.name}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-600">{c.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{c.text}</p>
                    </div>
                  </div>
                ))}
                {localComments.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-600 italic">Belum ada komentar. Jadilah yang pertama!</p>
                )}
              </div>
              <div className="flex gap-2">
                <input value={comment} onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                  placeholder="Tulis komentar... (Enter untuk kirim)"
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200 placeholder-gray-400" />
                <button onClick={handleSendComment}
                  className="p-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar metadata */}
          <div className="lg:w-56 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800 px-4 py-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
            <MetaRow icon={<Flag className="w-3.5 h-3.5" />} label="Prioritas">
              <PriorityBadge priority={task.priority} />
            </MetaRow>
            <MetaRow icon={<Check className="w-3.5 h-3.5" />} label="Status">
              <StatusBadge status={task.status} />
            </MetaRow>
            {task.dueDate && (
              <MetaRow icon={<Calendar className="w-3.5 h-3.5" />} label="Tenggat">
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{formatDate(task.dueDate)}</span>
              </MetaRow>
            )}
            {project && (
              <MetaRow icon={<Folder className="w-3.5 h-3.5" />} label="Proyek">
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1">
                  {project.icon} <span className="truncate">{project.name}</span>
                </span>
              </MetaRow>
            )}
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-600 mb-2 font-medium">Penanggungjawab</p>
              <div className="space-y-2">
                {assignedMembers.map(m => (
                  <div key={m.id} className="flex items-center gap-2">
                    <Avatar user={m} size="xs" showStatus />
                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{m.name}</span>
                  </div>
                ))}
                {assignedMembers.length === 0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-600 italic">Belum ditugaskan</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600 pt-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{task.comments} komentar</span>
            </div>
            {task.attachments > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600">
                <Paperclip className="w-3.5 h-3.5" />
                <span>{task.attachments} lampiran</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
