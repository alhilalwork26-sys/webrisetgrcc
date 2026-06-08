import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Clock, TrendingUp, Users, Plus, ArrowRight, ChevronRight, AlertCircle } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Avatar from '../components/ui/Avatar'
import { PriorityBadge } from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import TaskDetailModal from '../components/ui/TaskDetailModal'
import { format, isAfter, parseISO, isToday, isTomorrow } from 'date-fns'
import { id } from 'date-fns/locale'
import { can, roleLabels } from '../config/roleConfig'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35, ease: 'easeOut' } }),
}

function StatCard({ icon: Icon, label, value, color, change, idx }) {
  return (
    <motion.div custom={idx} variants={cardVariants} initial="hidden" animate="visible"
      className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {change != null && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${change > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </motion.div>
  )
}

function getDueLabel(dateStr) {
  try {
    const d = parseISO(dateStr)
    if (isToday(d)) return { label: 'Hari ini', color: 'text-orange-500' }
    if (isTomorrow(d)) return { label: 'Besok', color: 'text-yellow-500' }
    if (!isAfter(d, new Date())) return { label: 'Terlambat!', color: 'text-red-500 font-semibold' }
    return { label: format(d, 'd MMM', { locale: id }), color: 'text-gray-400 dark:text-gray-500' }
  } catch {
    return { label: dateStr, color: 'text-gray-400' }
  }
}

export default function Dashboard() {
  const {
    tasks, projects, members, goals, currentUser, setActivePage, openModal,
    reimbursements, keuangan, dailyProgress, notulen, auditLogs, syncStatus, lastSyncedAt, markSynced,
  } = useAppStore()
  const [openTaskId, setOpenTaskId] = useState(null)
  const role = currentUser?.role || 'riset'
  const visibleTasks = can(role, 'tasks', 'viewAll') ? tasks : tasks.filter(t => t.assignees?.includes(currentUser?.id))
  const visibleReimbursements = can(role, 'reimburse', 'viewAll') ? reimbursements : reimbursements.filter(item => item.requester === currentUser?.id)
  const visibleProgress = can(role, 'progress', 'viewAll') ? dailyProgress : dailyProgress.filter(item => item.userId === currentUser?.id)
  const visibleDocs = notulen.filter(doc => doc.visibility !== 'important' || can(role, 'documents', 'viewImportant'))
  const financePending = keuangan.filter(item => ['draft', 'submitted'].includes(item.status)).length
  const reimbursePending = visibleReimbursements.filter(item => ['submitted', 'approved'].includes(item.status)).length

  const doneTasks = visibleTasks.filter(t => t.status === 'done').length
  const inProgressTasks = visibleTasks.filter(t => t.status === 'inprogress').length
  const urgentTasks = visibleTasks.filter(t => t.priority === 'urgent' && t.status !== 'done')
  const recentTasks = [...visibleTasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  const stats = [
    { icon: CheckSquare, label: 'Tugas Selesai', value: doneTasks, color: '#00D084', change: 12 },
    { icon: Clock, label: 'Sedang Berjalan', value: inProgressTasks, color: '#2F55FF', change: 5 },
    { icon: TrendingUp, label: can(role, 'finance', 'view') ? 'Finance Pending' : 'Reimburse Pending', value: can(role, 'finance', 'view') ? financePending : reimbursePending, color: '#7B2FBE', change: null },
    { icon: Users, label: can(role, 'progress', 'viewAll') ? 'Staff Online' : 'Log Progres', value: can(role, 'progress', 'viewAll') ? members.filter(m => m.online).length : visibleProgress.length, color: '#FF6B2F', change: null },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Halo, {currentUser.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: id })}
            {urgentTasks.length > 0
              ? <span className="text-red-500 font-medium"> · {urgentTasks.length} tugas mendesak</span>
              : <span className="text-green-500"> · Semua berjalan lancar ✓</span>}
            <span className="text-gray-400 dark:text-gray-600"> · Sync {syncStatus} ({lastSyncedAt})</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={markSynced}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-xl transition-colors">
            Sync
          </button>
          <button onClick={() => openModal('addTask')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-primary-500/25">
            <Plus className="w-4 h-4" /> Buat Tugas
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.label} {...s} idx={i} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Tugas Terbaru</h3>
            <button onClick={() => setActivePage('tasks')}
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium">
              Lihat semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentTasks.map((task, i) => {
              const due = getDueLabel(task.dueDate)
              const assignedMembers = members.filter(m => task.assignees?.includes(m.id))
              return (
                <motion.button key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }}
                  onClick={() => setOpenTaskId(task.id)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group text-left">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${task.status === 'done' ? 'bg-green-400' : task.status === 'inprogress' ? 'bg-blue-400' : task.status === 'review' ? 'bg-purple-400' : 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <PriorityBadge priority={task.priority} />
                      <span className={`text-xs ${due.color}`}>{due.label}</span>
                    </div>
                  </div>
                  <div className="flex -space-x-1.5 shrink-0">
                    {assignedMembers.slice(0, 3).map(m => <Avatar key={m.id} user={m} size="xs" />)}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
                </motion.button>
              )
            })}
            {recentTasks.length === 0 && (
              <div className="py-12 text-center text-gray-400 dark:text-gray-600">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-sm">Belum ada tugas. Buat tugas pertamamu!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Active Projects */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Proyek Aktif</h3>
              <button onClick={() => setActivePage('projects')}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium">
                Semua <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {projects.filter(p => p.status === 'active').slice(0, 3).map((proj, i) => (
                <motion.div key={proj.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.1 }}
                  className="cursor-pointer" onClick={() => setActivePage('projects')}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">{proj.icon}</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1 truncate">{proj.name}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{proj.progress}%</span>
                  </div>
                  <ProgressBar value={proj.progress} color={proj.color} height={5} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Goals */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Target Utama</h3>
              <button onClick={() => setActivePage('goals')}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium">
                Semua <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: goal.color }}>
                    {goal.progress}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate mb-1">{goal.title}</p>
                    <ProgressBar value={goal.progress} color={goal.color} height={4} animated={false} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Reminder Role</h3>
            </div>
            <div className="p-4 space-y-2">
              <button onClick={() => setActivePage('progress')} className="w-full text-left p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Progres belum lengkap</p>
                <p className="text-xs text-gray-400 dark:text-gray-600">{visibleProgress.filter(item => item.status !== 'complete').length} log butuh follow up</p>
              </button>
              <button onClick={() => setActivePage('reimburse')} className="w-full text-left p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Reimburse pending</p>
                <p className="text-xs text-gray-400 dark:text-gray-600">{reimbursePending} pengajuan perlu aksi</p>
              </button>
              <button onClick={() => setActivePage('documents')} className="w-full text-left p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Dokumen tersedia</p>
                <p className="text-xs text-gray-400 dark:text-gray-600">{visibleDocs.length} dokumen sesuai permission</p>
              </button>
              {can(role, 'audit', 'view') && (
                <button onClick={() => setActivePage('audit')} className="w-full text-left p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Audit terbaru</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600">{auditLogs[0]?.action} · {auditLogs[0]?.time}</p>
                </button>
              )}
            </div>
          </motion.div>

          {/* Team online */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Tim Aktif Sekarang</h3>
            <div className="space-y-2.5">
              {members.filter(m => m.online).map(m => (
                <div key={m.id} className="flex items-center gap-2.5">
                  <Avatar user={m} size="sm" showStatus />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{m.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 truncate">{roleLabels[m.role] || m.role}</p>
                  </div>
                </div>
              ))}
              {members.filter(m => m.online).length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-600 italic">Tidak ada yang online</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Urgent alert */}
      {urgentTasks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">{urgentTasks.length} Tugas Mendesak Perlu Perhatian</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {urgentTasks.map(t => (
                <button key={t.id} onClick={() => setOpenTaskId(t.id)}
                  className="text-xs px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors font-medium">
                  {t.title}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setActivePage('tasks')}
            className="text-xs text-red-600 dark:text-red-400 hover:underline whitespace-nowrap font-medium">
            Lihat semua
          </button>
        </motion.div>
      )}

      {/* Task Detail Modal */}
      <AnimatePresence>
        {openTaskId && (
          <TaskDetailModal key={openTaskId} taskId={openTaskId} onClose={() => setOpenTaskId(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
