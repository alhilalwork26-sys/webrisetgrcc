import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CheckSquare, Users, BarChart2,
  Settings, ChevronRight, Plus, Star, Clock, Inbox,
  ChevronDown, X, FileText, Microscope,
  Calendar, Receipt, Activity
} from 'lucide-react'
import useAppStore from '../../store/useAppStore'
import Avatar from '../ui/Avatar'
import { canAccess, roleLabels } from '../../config/roleConfig'

const allNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'riset', label: 'Monitoring Riset', icon: Microscope },
  { id: 'tasks', label: 'Task Riset', icon: CheckSquare },
  { id: 'progress', label: 'Progres Harian', icon: Activity },
  { id: 'schedule', label: 'Jadwal Riset', icon: Calendar },
  { id: 'documents', label: 'Dokumen Riset', icon: FileText },
  { id: 'reimburse', label: 'Reimburse Riset', icon: Receipt },
  { id: 'goals', label: 'Target Riset', icon: BarChart2 },
  { id: 'members', label: 'Tim Riset', icon: Users },
  { id: 'reports', label: 'Laporan Riset', icon: BarChart2 },
  { id: 'inbox', label: 'Notifikasi', icon: Inbox, badgeKey: 'unreadCount' },
]

export default function Sidebar({ mobile, onClose }) {
  const { activePage, setActivePage, setTaskFilter, sidebarOpen, projects, currentUser, notifications } = useAppStore()
  const unreadCount = notifications.filter(n => !n.read).length
  const role = currentUser?.role || 'riset'
  const navItems = allNavItems.filter(item => canAccess(role, item.id))
  const mainNavItems = navItems.filter(item => !item.group)

  const handleNav = (id) => {
    setActivePage(id)
    if (mobile && onClose) onClose()
  }

  const handleStarred = () => {
    setTaskFilter({ priority: 'urgent' })
    setActivePage('tasks')
    if (mobile && onClose) onClose()
  }

  const handleRecent = () => {
    setTaskFilter({ status: 'all', priority: 'all', projectId: 'all' })
    setActivePage('tasks')
    if (mobile && onClose) onClose()
  }

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #7B2FBE, #2F55FF)' }}>
            G
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">GRCC Riset</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-none mt-0.5">Research Portal</p>
          </div>
        </div>
        {mobile && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <span className="sr-only">Tutup menu navigasi</span>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors">
          <Avatar user={currentUser} size="sm" showStatus />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{roleLabels[currentUser.role] || currentUser.role}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {mainNavItems.map((item) => {
          const Icon = item.icon
          const active = activePage === item.id
          const badge = item.badgeKey === 'unreadCount' ? unreadCount : null
          return (
            <button key={item.id} onClick={() => handleNav(item.id)}
              className={`sidebar-item w-full ${active ? 'active' : ''}`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {badge > 0 && (
                <span className="ml-auto text-xs bg-primary-600 text-white rounded-full min-w-[1rem] h-4 flex items-center justify-center font-medium px-1">
                  {badge}
                </span>
              )}
            </button>
          )
        })}

        {/* Quick Links */}
        <div className="pt-3 pb-1">
          <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-1.5">Akses Cepat</p>
          <button onClick={handleStarred} className="sidebar-item w-full">
            <Star className="w-4 h-4 shrink-0" />
            Riset Urgent
          </button>
          <button onClick={handleRecent} className="sidebar-item w-full">
            <Clock className="w-4 h-4 shrink-0" />
            Semua Task Riset
          </button>
        </div>

        {/* Projects */}
        <div className="pt-3">
          <div className="flex items-center justify-between px-3 mb-1.5">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider">Proyek</p>
            <button onClick={() => handleNav('projects')} aria-label="Buka halaman proyek" className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {projects.map((proj) => (
            <button key={proj.id} onClick={() => handleNav('projects')}
              className="sidebar-item w-full group">
              <span className="text-base shrink-0">{proj.icon}</span>
              <span className="flex-1 text-left truncate text-xs">{proj.name}</span>
              <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-3">
        <button onClick={() => handleNav('settings')} className="sidebar-item w-full">
          <Settings className="w-4 h-4" />
          Pengaturan
        </button>
      </div>
    </div>
  )

  if (mobile) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-72 h-full">
            {content}
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }

  return (
    <motion.div initial={false} animate={{ width: sidebarOpen ? 256 : 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="hidden lg:block shrink-0 overflow-hidden">
      <div className="w-64 h-full">{content}</div>
    </motion.div>
  )
}
