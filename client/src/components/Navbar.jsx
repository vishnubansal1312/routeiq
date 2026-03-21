import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { io } from 'socket.io-client'

export default function Navbar() {
  const { user, logout }              = useAuth()
  const location                      = useLocation()
  const navigate                      = useNavigate()
  const [activeUsers, setActiveUsers] = useState(1)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed,   setInstalled]   = useState(false)

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
      transports: ['websocket', 'polling']
    })
    socket.on('activeUsers', (count) => setActiveUsers(count))
    return () => socket.disconnect()
  }, [])

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e) }
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

  const handleLogout = () => { logout(); navigate('/login') }

  const links = [
    { to: '/map',       label: 'Map',       icon: '🗺️' },
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/history',   label: 'History',   icon: '🕒' },
    { to: '/fleet',     label: 'Fleet',     icon: '🚛' },
    { to: '/pricing',   label: 'Pricing',   icon: '💳' },
  ]

  return (
    <nav className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
      <div className="px-4">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/map" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center text-white font-black text-xs">
              IQ
            </div>
            <span className="font-black text-base text-white">
              Route<span className="text-primary-400">IQ</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.to} to={link.to}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  location.pathname === link.to
                    ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-dark-700'
                }`}
              >
                <span style={{ fontSize: 12 }}>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side desktop */}
          <div className="hidden md:flex items-center gap-2">
            {installPrompt && !installed && (
              <button onClick={handleInstall}
                className="text-xs font-semibold px-3 py-1.5 bg-primary-500/15 text-primary-400 border border-primary-500/30 rounded-lg hover:bg-primary-500/25 transition-all">
                📲 Install
              </button>
            )}
            {installed && (
              <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-1 rounded-lg">
                ✅ Installed
              </span>
            )}
            <div className="flex items-center gap-1.5 bg-dark-700 px-2.5 py-1.5 rounded-full border border-dark-600">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-slate-300 font-mono">{activeUsers} online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-slate-300 font-medium">
                {user?.name?.split(' ')[0]}
              </span>
            </div>
            <button onClick={handleLogout}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-400/10">
              Logout
            </button>
          </div>

          {/* Mobile right side */}
          <div className="md:hidden flex items-center gap-2">
            <div className="flex items-center gap-1 bg-dark-700 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-slate-300">{activeUsers}</span>
            </div>
            <button
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-dark-700"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div className="w-5 flex flex-col gap-1">
                <span className={`block h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 bg-current ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-3 border-t border-dark-700 mt-1">
            {/* User info */}
            <div className="flex items-center gap-2 px-2 py-3 border-b border-dark-700 mb-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{user?.name}</div>
                <div className="text-xs text-slate-500">{user?.email}</div>
              </div>
            </div>

            {/* Nav links */}
            <div className="grid grid-cols-3 gap-1 mb-2">
              {links.map((link) => (
                <Link key={link.to} to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    location.pathname === link.to
                      ? 'bg-primary-500/15 text-primary-400'
                      : 'text-slate-400 hover:bg-dark-700 hover:text-white'
                  }`}
                >
                  <span style={{ fontSize: 18 }}>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Bottom actions */}
            <div className="flex items-center gap-2 px-1 pt-2 border-t border-dark-700">
              {installPrompt && !installed && (
                <button onClick={handleInstall}
                  className="flex-1 py-2 text-xs font-semibold bg-primary-500/15 text-primary-400 border border-primary-500/30 rounded-xl">
                  📲 Install App
                </button>
              )}
              <button onClick={handleLogout}
                className="flex-1 py-2 text-xs font-semibold text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}