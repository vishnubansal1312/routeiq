import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { io } from 'socket.io-client'

export default function Navbar() {
  const { user, logout }              = useAuth()
  const location                      = useLocation()
  const navigate                      = useNavigate()
  const [activeUsers, setActiveUsers] = useState(1)
  const [menuOpen, setMenuOpen]       = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled]     = useState(false)

  useEffect(() => {
    const socket = io('http://localhost:5001', { transports: ['websocket', 'polling'] })
    socket.on('activeUsers', (count) => setActiveUsers(count))
    return () => socket.disconnect()
  }, [])

  // Capture PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const result = await installPrompt.userChoice
    if (result.outcome === 'accepted') setInstalled(true)
    setInstallPrompt(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = [
  { to: '/map',       label: 'Map',       icon: '🗺️' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/history',   label: 'History',   icon: '🕒' },
  { to: '/fleet',     label: 'Fleet',     icon: '🚛' },
  { to: '/pricing',   label: 'Pricing',   icon: '💳' },
]

  return (
    <nav className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/map" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-black text-sm">
              IQ
            </div>
            <span className="font-black text-lg text-white">
              Route<span className="text-primary-400">IQ</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  location.pathname === link.to
                    ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-dark-700'
                }`}
              >
                <span style={{ fontSize: 14 }}>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">

            {/* Install button */}
            {installPrompt && !installed && (
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-primary-500/15 text-primary-400 border border-primary-500/30 rounded-lg hover:bg-primary-500/25 transition-all"
              >
                📲 Install App
              </button>
            )}
            {installed && (
              <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-1 rounded-lg">
                ✅ Installed
              </span>
            )}

            {/* Live users */}
            <div className="flex items-center gap-2 bg-dark-700 px-3 py-1.5 rounded-full border border-dark-600">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-slate-300 font-mono">{activeUsers} online</span>
            </div>

            {/* User avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-slate-300 font-medium">
                {user?.name?.split(' ')[0]}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-400/10"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-slate-400 hover:text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="space-y-1.5">
              <span className={`block w-5 h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-current ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-dark-700 space-y-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${
                  location.pathname === link.to
                    ? 'bg-primary-500/15 text-primary-400'
                    : 'text-slate-400 hover:bg-dark-700 hover:text-white'
                }`}
              >
                <span style={{ fontSize: 14 }}>{link.icon}</span>
                {link.label}
              </Link>
            ))}

            {installPrompt && !installed && (
              <button
                onClick={handleInstall}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-primary-500/15 text-primary-400 border border-primary-500/30"
              >
                📲 Install RouteIQ App
              </button>
            )}

            <div className="flex items-center justify-between px-4 py-3 mt-2 border-t border-dark-700">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-slate-400">{activeUsers} online</span>
              </div>
              <button onClick={handleLogout} className="text-xs text-red-400">Logout</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}