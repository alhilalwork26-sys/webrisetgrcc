import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Bell, Shield, Palette, User, Save, CheckCircle, Lock, LogOut } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Avatar from '../components/ui/Avatar'

function Section({ title, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-5">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  )
}

function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0 border-gray-50 dark:border-gray-800">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ml-4 ${checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

export default function Settings() {
  const { currentUser, darkMode, toggleDarkMode, logout, updateCurrentUser } = useAppStore()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
  })
  const [notif, setNotif] = useState({
    email: true,
    push: true,
    taskDue: true,
    mentions: true,
    weeklyReport: false,
  })
  const [security, setSecurity] = useState({ twoFactor: false })
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [avatarSaved, setAvatarSaved] = useState(false)

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return
    updateCurrentUser({ name: form.name, email: form.email, role: form.role })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handlePasswordSave = () => {
    if (!passwords.current || !passwords.new || passwords.new !== passwords.confirm) return
    setPasswordSaved(true)
    setTimeout(() => {
      setPasswordSaved(false)
      setShowPasswordModal(false)
      setPasswords({ current: '', new: '', confirm: '' })
    }, 2000)
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pengaturan</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Kelola akun dan preferensi Anda</p>
      </div>

      {/* Profile */}
      <Section title="Profil Saya" icon={User} delay={0}>
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <Avatar user={{ ...currentUser, name: form.name }} size="xl" />
            <button onClick={() => { setAvatarSaved(true); setTimeout(() => setAvatarSaved(false), 1800) }} className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center text-xs transition-colors shadow-sm" title="Refresh avatar dari inisial">
              ✏️
            </button>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{form.name || currentUser.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{form.role || currentUser.role}</p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{form.email || currentUser.email}</p>
            {avatarSaved && <p className="text-xs text-green-600 dark:text-green-400 mt-1">Avatar diperbarui dari inisial nama.</p>}
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nama Lengkap</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 text-gray-800 dark:text-gray-200 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email"
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 text-gray-800 dark:text-gray-200 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Jabatan</label>
            <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 text-gray-800 dark:text-gray-200 transition-all" />
          </div>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Tampilan" icon={Palette} delay={0.05}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Mode Tampilan</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Pilih tema terang atau gelap</p>
          </div>
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
            <button onClick={() => darkMode && toggleDarkMode()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!darkMode ? 'bg-white dark:bg-gray-700 shadow text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
              <Sun className="w-3.5 h-3.5" /> Terang
            </button>
            <button onClick={() => !darkMode && toggleDarkMode()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${darkMode ? 'bg-white dark:bg-gray-700 shadow text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
              <Moon className="w-3.5 h-3.5" /> Gelap
            </button>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifikasi" icon={Bell} delay={0.1}>
        <Toggle checked={notif.email} onChange={v => setNotif({ ...notif, email: v })} label="Notifikasi Email" desc="Terima pembaruan melalui email" />
        <Toggle checked={notif.push} onChange={v => setNotif({ ...notif, push: v })} label="Notifikasi Push" desc="Notifikasi langsung di browser" />
        <Toggle checked={notif.taskDue} onChange={v => setNotif({ ...notif, taskDue: v })} label="Pengingat Tenggat Tugas" desc="Ingatkan 1 hari sebelum jatuh tempo" />
        <Toggle checked={notif.mentions} onChange={v => setNotif({ ...notif, mentions: v })} label="Sebutan &amp; Komentar" desc="Saat seseorang menyebut atau membalas" />
        <Toggle checked={notif.weeklyReport} onChange={v => setNotif({ ...notif, weeklyReport: v })} label="Laporan Mingguan" desc="Ringkasan aktivitas setiap Senin pagi" />
      </Section>

      {/* Security */}
      <Section title="Keamanan" icon={Shield} delay={0.15}>
        <div className="space-y-3">
          <button onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left group">
            <Lock className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Ubah Kata Sandi</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Perbarui kata sandi akun Anda</p>
            </div>
          </button>
          <button onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })} className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Shield className="w-4 h-4 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Autentikasi Dua Faktor</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tambahkan lapisan keamanan ekstra</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-lg ${security.twoFactor ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>{security.twoFactor ? 'Aktif' : 'Nonaktif'}</span>
          </button>
        </div>
      </Section>

      {/* Password modal inline */}
      {showPasswordModal && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Ubah Kata Sandi</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Kata Sandi Saat Ini</label>
              <input type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Kata Sandi Baru</label>
              <input type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Konfirmasi Kata Sandi Baru</label>
              <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-800 dark:text-gray-200" />
            </div>
            {passwords.new && passwords.confirm && passwords.new !== passwords.confirm && (
              <p className="text-xs text-red-500">Kata sandi baru tidak cocok</p>
            )}
            {passwordSaved && (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Kata sandi berhasil diubah!</p>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => { setShowPasswordModal(false); setPasswords({ current: '', new: '', confirm: '' }) }}
              className="flex-1 px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Batal
            </button>
            <button onClick={handlePasswordSave}
              disabled={!passwords.current || !passwords.new || passwords.new !== passwords.confirm}
              className="flex-1 px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl transition-colors font-medium">
              Simpan
            </button>
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${saved ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-primary-600 hover:bg-primary-700 text-white'}`}>
          {saved ? <><CheckCircle className="w-4 h-4" /> Tersimpan!</> : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
        </button>
        <button onClick={logout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
          <LogOut className="w-4 h-4" /> Keluar dari Akun
        </button>
      </div>
    </div>
  )
}
