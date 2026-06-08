import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sun, Moon, ChevronDown } from 'lucide-react'
import useAppStore, { demoAccounts } from '../store/useAppStore'
import { roleLabels } from '../config/roleConfig'

const DEMO_CREDENTIALS = demoAccounts.map(a => ({
  name: a.name,
  role: roleLabels[a.role] || a.role,
  email: a.email,
  password: a.password,
  color: a.color,
}))

function DemoTable({ onPick }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
      id="demo-accounts"
      className="mt-5 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Akun Demo</p>
      </div>
      {DEMO_CREDENTIALS.map((c) => (
        <button key={c.email} type="button" onClick={() => onPick(c.email, c.password)}
          aria-label={`Gunakan akun demo ${c.role}`}
          className="w-full flex items-center gap-3 px-4 py-3 border-b last:border-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{c.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-600 truncate">{c.email} · {c.password}</p>
          </div>
          <ArrowRight className="w-3 h-3 text-gray-300 dark:text-gray-600 shrink-0" />
        </button>
      ))}
    </motion.div>
  )
}

export default function Login() {
  const { login, darkMode, toggleDarkMode } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showDemo, setShowDemo] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hint, setHint] = useState('')

  const handlePickDemo = (e, p) => { setEmail(e); setPassword(p); setShowDemo(false) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Isi email dan kata sandi terlebih dahulu.'); return }
    setLoading(true); setError(''); setHint('')
    await new Promise(r => setTimeout(r, 1000))
    const ok = await login(email, password)
    if (!ok) { setError('Email atau kata sandi salah.'); setLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8 }}
              className="absolute rounded-full opacity-10 bg-white"
              style={{ width: 80 + i * 60, height: 80 + i * 60, left: `${10 + i * 15}%`, top: `${5 + i * 12}%` }} />
          ))}
        </div>
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg">G</div>
            <div>
              <p className="text-white font-bold text-lg leading-none">GRCC Riset</p>
              <p className="text-white/60 text-sm">Research Portal</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Portal Riset GRCC</h2>
            <p className="text-white/70 text-lg leading-relaxed">Pantau riset, task, timeline equity, dokumen, jadwal, reimburse, dan progres harian tim riset dalam satu tempat.</p>
          </motion.div>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[['5', 'Peneliti'], ['6', 'Modul Riset'], ['Sync', 'Database']].map(([num, label]) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="text-center p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{num}</p>
                <p className="text-white/60 text-xs mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <button type="button" onClick={toggleDarkMode} aria-label={darkMode ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'} className="absolute top-6 right-6 p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:scale-105 transition-transform">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #7B2FBE, #2F55FF)' }}>G</div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">GRCC Riset</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Selamat Datang!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Masuk ke akun Tim Riset GRCC</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input id="login-email" name="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                  placeholder="nama@grcc.org" />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input id="login-password" name="password" type={showPass ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                {error}
              </motion.div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                <span className="text-gray-600 dark:text-gray-400">Ingat saya</span>
              </label>
              <button type="button" onClick={() => setHint('Untuk sementara gunakan password default riset123, lalu ubah di Pengaturan setelah login.')} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">Lupa kata sandi?</button>
            </div>
            {hint && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}

            <motion.button type="submit" disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-all disabled:opacity-70">
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <>Masuk <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          <div className="mt-6">
            <button type="button" onClick={() => setShowDemo(!showDemo)}
              aria-expanded={showDemo}
              aria-controls="demo-accounts"
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <span className="font-medium">Lihat akun demo</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDemo ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showDemo && <DemoTable onPick={handlePickDemo} />}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
