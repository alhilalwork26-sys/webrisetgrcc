import { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, TrendingUp, AlertTriangle, CheckCircle, Plus } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import ProgressBar from '../components/ui/ProgressBar'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

const statusCfg = {
  on_track: { label: 'On Track', icon: TrendingUp, class: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
  at_risk: { label: 'Berisiko', icon: AlertTriangle, class: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  behind: { label: 'Terlambat', icon: AlertTriangle, class: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  done: { label: 'Selesai', icon: CheckCircle, class: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
}

export default function Goals() {
  const { goals, addGoal } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', target: 100, current: 0, unit: '%', dueDate: '', color: '#EF4444' })
  const saveGoal = () => {
    const target = Number(form.target) || 1
    const current = Number(form.current) || 0
    const progress = Math.min(100, Math.round((current / target) * 100))
    addGoal({ ...form, target, current, progress, status: progress >= 100 ? 'done' : progress < 40 ? 'behind' : 'on_track', projectId: 'p1' })
    setForm({ title: '', description: '', target: 100, current: 0, unit: '%', dueDate: '', color: '#EF4444' })
    setShowForm(false)
  }

  const summary = [
    { label: 'Total Target', value: goals.length, color: '#7B2FBE' },
    { label: 'On Track', value: goals.filter(g => g.status === 'on_track').length, color: '#00D084' },
    { label: 'Berisiko', value: goals.filter(g => g.status === 'at_risk').length, color: '#FF6B2F' },
    { label: 'Terlambat', value: goals.filter(g => g.status === 'behind').length, color: '#EF4444' },
  ]

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Target &amp; Tujuan</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Pantau pencapaian target organisasi GRCC</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Target
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {summary.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Goals */}
      <div className="space-y-4">
        {goals.map((goal, i) => {
          const cfg = statusCfg[goal.status] || statusCfg.on_track
          const Icon = cfg.icon
          return (
            <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: goal.color + '20' }}>
                    <Target className="w-5 h-5" style={{ color: goal.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{goal.description}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.class} shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />{cfg.label}
                </span>
              </div>

              <div className="flex items-end gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Progress: {goal.current} / {goal.target} {goal.unit}</span>
                    <span className="text-sm font-bold" style={{ color: goal.color }}>{goal.progress}%</span>
                  </div>
                  <ProgressBar value={goal.progress} color={goal.color} height={8} />
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400 dark:text-gray-600">Tenggat</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{goal.dueDate}</p>
                </div>
              </div>

              {/* Milestones visual */}
              <div className="mt-4 flex items-center gap-1">
                {[25, 50, 75, 100].map(milestone => (
                  <div key={milestone} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`w-3 h-3 rounded-full border-2 transition-colors ${goal.progress >= milestone ? 'border-transparent' : 'border-gray-200 dark:border-gray-700'}`}
                      style={{ backgroundColor: goal.progress >= milestone ? goal.color : 'transparent' }} />
                    <span className="text-xs text-gray-400 dark:text-gray-600">{milestone}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Tambah Target Riset" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Judul Target</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Deskripsi</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input type="number" value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} placeholder="Current" className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
            <input type="number" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} placeholder="Target" className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
            <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="Unit" className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Tenggat</label>
            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Batal</Button>
            <Button variant="primary" onClick={saveGoal} disabled={!form.title.trim()} className="flex-1">Simpan Target</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
