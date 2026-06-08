import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Search, Bell, Moon, Sun, Plus, CheckCircle, Clock, MessageSquare, X, PanelLeft } from 'lucide-react'
import useAppStore from '../../store/useAppStore'
import Avatar from '../ui/Avatar'

const pageTitles = {
  dashboard: 'Dashboard Riset',
  progress: 'Progres Harian',
  schedule: 'Jadwal Riset',
  reimburse: 'Reimburse Riset',
  documents: 'Dokumen Riset',
  riset: 'Monitoring Riset',
  inbox: 'Kotak Masuk',
  tasks: 'Task Riset',
  projects: 'Proyek Riset',
  members: 'Tim Riset',
  reports: 'Laporan Riset',
  settings: 'Pengaturan',
}

const notifIcons = {
  mention: <MessageSquare className="w-4 h-4 text-blue-500" />,
  due: <Clock className="w-4 h-4 text-orange-500" />,
  assigned: <CheckCircle className="w-4 h-4 text-green-500" />,
  comment: <MessageSquare className="w-4 h-4 text-purple-500" />,
  done: <CheckCircle className="w-4 h-4 text-green-500" />,
}

export default function Header({ onMenuClick }) {
  const {
    activePage, darkMode, toggleDarkMode,
    notifications, markNotificationRead, markAllRead,
    currentUser, openModal, toggleSidebar, sidebarOpen, setActivePage
  } = useAppStore()
  const [showNotif, setShowNotif] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const notifRef = useRef(null)
  const unread = notifications.filter(n => !n.read).length
  const runSearch = () => {
    if (!searchVal.trim()) return
    setActivePage('tasks')
    setShowSearch(false)
  }

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-14 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center px-4 gap-3 shrink-0 relative z-30">
      {/* Mobile hamburger */}
      <button onClick={onMenuClick}
        aria-label="Buka menu navigasi"
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar toggle */}
      <button onClick={toggleSidebar}
        aria-label={sidebarOpen ? 'Sembunyikan sidebar' : 'Tampilkan sidebar'}
        title={sidebarOpen ? 'Sembunyikan sidebar' : 'Tampilkan sidebar'}
        className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
        <PanelLeft className="w-4 h-4" />
      </button>

      {/* Page title */}
      <h1 className="text-base font-semibold text-gray-900 dark:text-white hidden sm:block">
        {pageTitles[activePage] || 'GRCC App'}
      </h1>

      {/* Search */}
      <div className="flex-1 max-w-xs hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Cari riset, task, dokumen..."
            value={searchVal} onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runSearch()}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 transition-all"
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Mobile search */}
          <button onClick={() => setShowSearch(!showSearch)}
          aria-label={showSearch ? 'Tutup pencarian' : 'Buka pencarian'}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
          <Search className="w-4 h-4" />
        </button>

        {/* New task button */}
        <button onClick={() => openModal('addTask')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden lg:inline">Buat Task</span>
        </button>

        {/* Mobile new task */}
        <button onClick={() => openModal('addTask')}
          aria-label="Buat task riset baru"
          className="sm:hidden p-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors">
          <Plus className="w-4 h-4" />
        </button>

        {/* Dark mode toggle */}
        <button onClick={toggleDarkMode}
          aria-label={darkMode ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
          <AnimatePresence mode="wait">
            {darkMode
              ? <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><Sun className="w-4 h-4" /></motion.div>
              : <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Moon className="w-4 h-4" /></motion.div>
            }
          </AnimatePresence>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotif(!showNotif)}
            aria-label="Buka notifikasi"
            aria-expanded={showNotif}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-950" />
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    Notifikasi
                    {unread > 0 && (
                      <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">{unread}</span>
                    )}
                  </span>
                  {unread > 0 && (
                    <button onClick={markAllRead}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
                      Tandai semua dibaca
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/50">
                  {notifications.map(notif => (
                    <button key={notif.id}
                      onClick={() => { markNotificationRead(notif.id); setShowNotif(false) }}
                      className={`w-full flex gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!notif.read ? 'bg-blue-50/60 dark:bg-blue-950/20' : ''}`}>
                      <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {notifIcons[notif.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed ${notif.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200 font-medium'}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{notif.time}</p>
                      </div>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
                    </button>
                  ))}
                  {notifications.length === 0 && (
                    <div className="py-10 text-center text-gray-400 dark:text-gray-600 text-sm">
                      Tidak ada notifikasi
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar */}
        <div className="pl-1">
          <Avatar user={currentUser} size="sm" showStatus />
        </div>
      </div>

      {/* Mobile search bar overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-0 right-0 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 px-4 py-2 z-40 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input autoFocus type="text" placeholder="Cari riset, task, dokumen..."
                value={searchVal} onChange={e => setSearchVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runSearch()}
                className="w-full pl-9 pr-9 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-700 dark:text-gray-300 placeholder-gray-400" />
              <button onClick={() => setShowSearch(false)} aria-label="Tutup pencarian" className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
