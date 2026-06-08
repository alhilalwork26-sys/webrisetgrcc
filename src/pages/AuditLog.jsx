import { Download, History, Printer } from 'lucide-react'
import useAppStore from '../store/useAppStore'

export default function AuditLog() {
  const { auditLogs, members } = useAppStore()
  const exportCsv = () => {
    const rows = [['Waktu', 'Actor', 'Action', 'Target', 'Before', 'After'], ...auditLogs.map(log => {
      const actor = members.find(m => m.id === log.actor)
      return [log.time, actor?.name || log.actor, log.action, log.target, log.before, log.after]
    })]
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'audit-log.csv'
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Audit Log</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Catatan siapa melakukan apa, kapan, dan perubahan sebelum/sesudah.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400"><Download className="w-4 h-4" /> Export</button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-xl text-sm"><Printer className="w-4 h-4" /> Print</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
        {auditLogs.map(log => {
          const actor = members.find(m => m.id === log.actor)
          return (
            <div key={log.id} className="p-4 border-b last:border-0 border-gray-100 dark:border-gray-800 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0"><History className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{log.action}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{actor?.name} · {log.target} · {log.time}</p>
                <div className="grid sm:grid-cols-2 gap-2 mt-3">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3 text-xs"><span className="text-gray-400">Before</span><p className="font-medium text-gray-700 dark:text-gray-300 mt-1">{log.before}</p></div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3 text-xs"><span className="text-gray-400">After</span><p className="font-medium text-gray-700 dark:text-gray-300 mt-1">{log.after}</p></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
