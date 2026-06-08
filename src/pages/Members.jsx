import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, UserPlus, Mail } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Avatar from '../components/ui/Avatar'
import ProgressBar from '../components/ui/ProgressBar'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { roleLabels } from '../config/roleConfig'

export default function Members() {
  const { members, tasks, addMember } = useAppStore()
  const [search, setSearch] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSent, setInviteSent] = useState(false)

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    m.department.toLowerCase().includes(search.toLowerCase())
  )

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    const name = inviteEmail.split('@')[0].split(/[._-]/).filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') || 'Anggota Riset'
    addMember({
      id: `u${Date.now()}`,
      name,
      email: inviteEmail.trim(),
      role: 'riset',
      department: 'Riset GRCC',
      initials: name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase(),
      color: '#0EA5E9',
      online: false,
      tasksCompleted: 0,
      tasksTotal: 0,
    })
    setInviteSent(true)
    setTimeout(() => {
      setInviteSent(false)
      setInviteEmail('')
      setShowInvite(false)
    }, 2000)
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Anggota Tim</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {members.length} anggota · {members.filter(m => m.online).length} sedang online
          </p>
        </div>
        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
          <UserPlus className="w-4 h-4" /> Undang Anggota
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          ['Total Anggota', members.length, '#7B2FBE'],
          ['Online Sekarang', members.filter(m => m.online).length, '#00D084'],
          ['Tugas Selesai', members.reduce((a, m) => a + m.tasksCompleted, 0), '#2F55FF'],
          ['Rata-rata Efisiensi', Math.round(members.reduce((a, m) => a + (m.tasksCompleted / (m.tasksTotal || 1) * 100), 0) / members.length) + '%', '#FF6B2F'],
        ].map(([label, value, color]) => (
          <motion.div key={label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari anggota..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-700 dark:text-gray-300 placeholder-gray-400" />
      </div>

      {/* Members grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((member, i) => {
          const memberTasks = tasks.filter(t => t.assignees?.includes(member.id))
          const completedTasks = memberTasks.filter(t => t.status === 'done').length
          const activeTasks = memberTasks.filter(t => t.status === 'inprogress').length
          const efficiency = member.tasksTotal > 0 ? Math.round(member.tasksCompleted / member.tasksTotal * 100) : 0

          return (
            <motion.div key={member.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              {/* Top */}
              <div className="flex items-start gap-3 mb-4">
                <Avatar user={member} size="lg" showStatus />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{member.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{roleLabels[member.role] || member.role}</p>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
                    {member.department}
                  </span>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${member.online ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
              </div>

              {/* Task stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  ['Tugas', memberTasks.length],
                  ['Selesai', completedTasks],
                  ['Aktif', activeTasks],
                ].map(([label, val]) => (
                  <div key={label} className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <p className="text-base font-bold text-gray-900 dark:text-white">{val}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-600">{label}</p>
                  </div>
                ))}
              </div>

              {/* Efficiency */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Efisiensi Kerja</span>
                  <span className="text-xs font-semibold" style={{ color: member.color }}>{efficiency}%</span>
                </div>
                <ProgressBar value={efficiency} color={member.color} height={5} />
              </div>

              {/* Contact */}
              <a href={`mailto:${member.email}`}
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group">
                <Mail className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span className="truncate">{member.email}</span>
              </a>
            </motion.div>
          )
        })}
      </div>

      {/* Invite Modal */}
      <Modal open={showInvite} onClose={() => { setShowInvite(false); setInviteSent(false); setInviteEmail('') }} title="Undang Anggota Baru">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Kirim undangan melalui email untuk bergabung ke tim GRCC.</p>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Alamat Email</label>
            <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInvite()}
              placeholder="anggota@grcc.org" type="email"
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200 placeholder-gray-400" />
          </div>
          {inviteSent && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400 font-medium">
              ✓ Undangan berhasil dikirim ke {inviteEmail}!
            </motion.div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowInvite(false)} className="flex-1">Batal</Button>
            <Button variant="primary" onClick={handleInvite} className="flex-1" disabled={!inviteEmail.trim()}>
              Kirim Undangan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
