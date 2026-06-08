import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useAppStore from './store/useAppStore'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Progress from './pages/Progress'
import Schedule from './pages/Schedule'
import Riset from './pages/Riset'
import Tasks from './pages/Tasks'
import Projects from './pages/Projects'
import Goals from './pages/Goals'
import Members from './pages/Members'
import Reports from './pages/Reports'
import Inbox from './pages/Inbox'
import Settings from './pages/Settings'
import Reimburse from './pages/Reimburse'
import Documents from './pages/Documents'
import AddTaskModal from './components/ui/AddTaskModal'
import { canAccess } from './config/roleConfig'

const pages = {
  dashboard: Dashboard, progress: Progress, schedule: Schedule, tasks: Tasks,
  reimburse: Reimburse, documents: Documents, riset: Riset,
  projects: Projects, goals: Goals, members: Members, reports: Reports, inbox: Inbox, settings: Settings,
}

function PageRenderer() {
  const { activePage, currentUser, setActivePage } = useAppStore()
  const role = currentUser?.role || 'riset'
  const allowed = canAccess(role, activePage)
  const Page = allowed ? (pages[activePage] || Dashboard) : Dashboard

  useEffect(() => {
    if (!allowed) setActivePage('dashboard')
  }, [activePage, allowed, setActivePage])

  return (
    <AnimatePresence mode="wait">
      <motion.div key={activePage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="h-full">
        <Page />
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const { isLoggedIn, darkMode, modal, closeModal } = useAppStore()

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  if (!isLoggedIn) return <Login />

  return (
    <>
      <AppLayout>
        <PageRenderer />
      </AppLayout>
      <AddTaskModal open={modal === 'addTask'} onClose={closeModal} />
    </>
  )
}
