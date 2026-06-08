import { motion } from 'framer-motion'
import { BarChart2, Users, CheckSquare, Clock, Target, Download, Printer } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import ProgressBar from '../components/ui/ProgressBar'
import Avatar from '../components/ui/Avatar'
import { downloadTextFile, toCsv } from '../lib/fileActions'

function SimpleBarChart({ data, color = '#7B2FBE', height = 140 }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const barHeight = height - 40
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.value}</span>
          <motion.div
            initial={{ height: 0 }} animate={{ height: `${Math.max((item.value / max) * barHeight, item.value > 0 ? 4 : 0)}px` }}
            transition={{ delay: i * 0.06, duration: 0.6, ease: 'easeOut' }}
            className="w-full rounded-t-lg cursor-default"
            style={{ backgroundColor: color }}
            title={`${item.label}: ${item.value}`}
          />
          <span className="text-xs text-gray-400 dark:text-gray-600 truncate w-full text-center leading-tight">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function Reports() {
  const { tasks, projects, members, goals } = useAppStore()
  const exportCsv = () => {
    downloadTextFile('laporan-riset-grcc.csv', toCsv([
      ['Metrik', 'Nilai'],
      ['Total task', tasks.length],
      ['Task selesai', tasks.filter(t => t.status === 'done').length],
      ['Task berjalan', tasks.filter(t => t.status === 'inprogress').length],
      ['Proyek aktif', projects.filter(p => p.status === 'active').length],
      ['Anggota tim', members.length],
      ['Total target', goals.length],
    ]), 'text/csv;charset=utf-8')
  }

  const statusData = [
    { label: 'Belum Mulai', value: tasks.filter(t => t.status === 'todo').length },
    { label: 'Berjalan', value: tasks.filter(t => t.status === 'inprogress').length },
    { label: 'Review', value: tasks.filter(t => t.status === 'review').length },
    { label: 'Selesai', value: tasks.filter(t => t.status === 'done').length },
  ]

  const priorityData = [
    { label: 'Urgent', value: tasks.filter(t => t.priority === 'urgent').length },
    { label: 'Tinggi', value: tasks.filter(t => t.priority === 'high').length },
    { label: 'Normal', value: tasks.filter(t => t.priority === 'normal').length },
    { label: 'Rendah', value: tasks.filter(t => t.priority === 'low').length },
  ]

  const memberPerf = members.map(m => ({
    ...m,
    myTasks: tasks.filter(t => t.assignees?.includes(m.id)),
    efficiency: Math.round(m.tasksCompleted / (m.tasksTotal || 1) * 100),
  })).sort((a, b) => b.efficiency - a.efficiency)

  const overallProgress = tasks.length > 0
    ? Math.round(tasks.filter(t => t.status === 'done').length / tasks.length * 100)
    : 0

  const keyMetrics = [
    { label: 'Total Tugas', value: tasks.length, icon: CheckSquare, color: '#7B2FBE' },
    { label: 'Selesai', value: tasks.filter(t => t.status === 'done').length, icon: CheckSquare, color: '#00D084' },
    { label: 'Sedang Berjalan', value: tasks.filter(t => t.status === 'inprogress').length, icon: Clock, color: '#2F55FF' },
    { label: 'Proyek Aktif', value: projects.filter(p => p.status === 'active').length, icon: BarChart2, color: '#FF6B2F' },
    { label: 'Anggota Tim', value: members.length, icon: Users, color: '#FF2F7A' },
    { label: 'Total Target', value: goals.length, icon: Target, color: '#F59E0B' },
  ]

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Laporan &amp; Analitik</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Pantau kinerja riset GRCC secara menyeluruh</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400"><Download className="w-4 h-4" /> CSV</button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-xl text-sm"><Printer className="w-4 h-4" /> Print</button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {keyMetrics.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div key={item.label}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: item.color + '20' }}>
                <Icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{item.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Overall progress banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="font-semibold text-lg">Progres Keseluruhan GRCC</h3>
            <p className="text-white/70 text-sm">{tasks.filter(t => t.status === 'done').length} dari {tasks.length} tugas selesai</p>
          </div>
          <span className="text-5xl font-bold">{overallProgress}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full overflow-hidden" style={{ height: 10 }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
            className="h-full bg-white rounded-full" />
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">Tugas Berdasarkan Status</h3>
          <SimpleBarChart data={statusData} color="#2F55FF" height={160} />
        </motion.div>

        {/* Priority chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">Tugas Berdasarkan Prioritas</h3>
          <SimpleBarChart data={priorityData} color="#7B2FBE" height={160} />
        </motion.div>

        {/* Member performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Peringkat Kinerja Anggota</h3>
          <div className="space-y-4">
            {memberPerf.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className={`text-xs font-bold w-5 text-center ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-400 dark:text-gray-600'}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <Avatar user={m} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{m.name}</p>
                    <span className="text-xs font-semibold ml-2 shrink-0" style={{ color: m.color }}>{m.efficiency}%</span>
                  </div>
                  <ProgressBar value={m.efficiency} color={m.color} height={5} animated={false} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Project progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Progress per Proyek</h3>
          <div className="space-y-4">
            {projects.map((proj) => {
              const projTasks = tasks.filter(t => t.projectId === proj.id)
              const doneCount = projTasks.filter(t => t.status === 'done').length
              return (
                <div key={proj.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-base shrink-0">{proj.icon}</span>
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{proj.name}</p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 shrink-0">
                      {doneCount}/{projTasks.length} tugas
                    </span>
                  </div>
                  <ProgressBar value={proj.progress} color={proj.color} height={6} animated={false} />
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
