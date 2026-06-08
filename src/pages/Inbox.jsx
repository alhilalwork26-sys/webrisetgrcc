import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, CheckCircle, Clock, Check, Trash2 } from 'lucide-react'
import useAppStore from '../store/useAppStore'

const notifIcons = {
  mention: { icon: MessageSquare, color: '#2F55FF', bg: '#2F55FF20' },
  due: { icon: Clock, color: '#FF6B2F', bg: '#FF6B2F20' },
  assigned: { icon: CheckCircle, color: '#00D084', bg: '#00D08420' },
  comment: { icon: MessageSquare, color: '#7B2FBE', bg: '#7B2FBE20' },
  done: { icon: CheckCircle, color: '#00D084', bg: '#00D08420' },
}

export default function Inbox() {
  const { notifications, markNotificationRead, markAllRead, clearNotifications } = useAppStore()
  const [filter, setFilter] = useState('semua')
  const unread = notifications.filter(n => !n.read).length
  const filtered = notifications.filter(notif => {
    if (filter === 'semua') return true
    if (filter === 'unread') return !notif.read
    if (filter === 'hari_ini') return notif.category === 'today' || notif.time === 'Hari ini'
    return notif.category === filter
  })

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kotak Masuk</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{unread} belum dibaca</p>
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-xl transition-colors">
              <Check className="w-4 h-4" /> Tandai semua dibaca
            </button>
          )}
          <button onClick={clearNotifications}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors">
            <Trash2 className="w-4 h-4" /> Bersihkan
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          ['semua', 'Semua'],
          ['unread', 'Unread'],
          ['warning', 'Warning'],
          ['success', 'Success'],
          ['hari_ini', 'Hari ini'],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium ${filter === id ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((notif, i) => {
          const cfg = notifIcons[notif.type] || notifIcons.comment
          const Icon = cfg.icon
          return (
            <motion.div key={notif.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              onClick={() => markNotificationRead(notif.id)}
              className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-sm ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.bg }}>
                <Icon className="w-4 h-4" style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notif.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'}`}>{notif.message}</p>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{notif.time}</p>
              </div>
              {!notif.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />}
            </motion.div>
          )
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-600">Tidak ada notifikasi pada filter ini.</div>
        )}
      </div>
    </div>
  )
}
