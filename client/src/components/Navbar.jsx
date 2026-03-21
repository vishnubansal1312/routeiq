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
    { to:'/map',       label:'Map',       icon:'🗺️' },
    { to:'/dashboard', label:'Dashboard', icon:'📊' },
    { to:'/history',   label:'History',   icon:'🕒' },
    { to:'/fleet',     label:'Fleet',     icon:'🚛' },
    { to:'/pricing',   label:'Pricing',   icon:'💳' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      <style>{`
        @keyframes fadeDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .nav-item { transition:all 0.15s; border-radius:8px; }
        .nav-item:hover { background:rgba(109,40,217,0.06) !important; color:#6d28d9 !important; }
        .mobile-menu { animation: fadeDown 0.2s ease; }
        @media(max-width:767px){ .desktop-nav{ display:none !important; } .mobile-btn{ display:flex !important; } }
        @media(min-width:768px){ .desktop-nav{ display:flex !important; } .mobile-btn{ display:none !important; } }
      `}</style>

      <nav style={{
        background:'#fff',
        borderBottom:'1px solid #f0f0f0',
        position:'sticky', top:0, zIndex:1000,
        fontFamily:"'DM Sans','Segoe UI',sans-serif",
      }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 20px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>

          {/* ── Logo ── */}
          <Link to="/map" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <div style={{ width:30, height:30, background:'#6d28d9', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:12, flexShrink:0 }}>
              IQ
            </div>
            <span style={{ fontWeight:800, fontSize:17, letterSpacing:'-0.4px', color:'#111' }}>
              Route<span style={{ color:'#6d28d9' }}>IQ</span>
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          <div className="desktop-nav" style={{ display:'flex', alignItems:'center', gap:2 }}>
            {links.map(link => (
              <Link key={link.to} to={link.to} style={{ textDecoration:'none' }}>
                <div className="nav-item" style={{
                  display:'flex', alignItems:'center', gap:6,
                  padding:'6px 12px',
                  fontSize:13,
                  fontWeight: isActive(link.to) ? 600 : 500,
                  color:      isActive(link.to) ? '#6d28d9' : '#555',
                  background: isActive(link.to) ? 'rgba(109,40,217,0.08)' : 'transparent',
                }}>
                  <span style={{ fontSize:13 }}>{link.icon}</span>
                  {link.label}
                </div>
              </Link>
            ))}
          </div>

          {/* ── Right side ── */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>

            {/* Live users pill */}
            <div style={{ display:'flex', alignItems:'center', gap:5, background:'#f9fafb', border:'1px solid #e5e7eb', padding:'5px 10px', borderRadius:20 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />
              <span style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>{activeUsers} online</span>
            </div>

            {/* Install button */}
            {installPrompt && !installed && (
              <button onClick={handleInstall}
                style={{ fontSize:12, fontWeight:600, padding:'6px 12px', background:'#f5f3ff', color:'#6d28d9', border:'1px solid #e9d5ff', borderRadius:8, cursor:'pointer', fontFamily:'inherit' }}>
                📲 Install
              </button>
            )}
            {installed && (
              <span style={{ fontSize:11, color:'#16a34a', background:'#f0fdf4', border:'1px solid #bbf7d0', padding:'4px 10px', borderRadius:20 }}>✓ Installed</span>
            )}

            {/* User avatar */}
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:'#6d28d9', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, fontWeight:700, flexShrink:0 }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <span style={{ fontSize:13, fontWeight:500, color:'#374151' }} className="desktop-nav">
                {user?.name?.split(' ')[0]}
              </span>
            </div>

            {/* Logout */}
            <button onClick={handleLogout}
              style={{ fontSize:12, color:'#9ca3af', background:'transparent', border:'none', cursor:'pointer', padding:'6px 8px', borderRadius:6, fontFamily:'inherit', transition:'color 0.15s' }}
              onMouseOver={e => e.target.style.color='#ef4444'}
              onMouseOut={e  => e.target.style.color='#9ca3af'}
            >
              Logout
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="mobile-btn"
              style={{ width:34, height:34, borderRadius:8, border:'1px solid #e5e7eb', background:'transparent', cursor:'pointer', display:'none', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:4, padding:0 }}
            >
              <span style={{ display:'block', width:16, height:1.5, background:'#555', borderRadius:2, transition:'all 0.2s', transform: menuOpen?'rotate(45deg) translateY(5px)':'none' }} />
              <span style={{ display:'block', width:16, height:1.5, background:'#555', borderRadius:2, opacity: menuOpen?0:1, transition:'opacity 0.2s' }} />
              <span style={{ display:'block', width:16, height:1.5, background:'#555', borderRadius:2, transition:'all 0.2s', transform: menuOpen?'rotate(-45deg) translateY(-5px)':'none' }} />
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {menuOpen && (
          <div className="mobile-menu" style={{ borderTop:'1px solid #f0f0f0', background:'#fff', padding:'12px 16px 16px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:12 }}>
              {links.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} style={{ textDecoration:'none' }}>
                  <div style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                    padding:'10px 8px', borderRadius:10,
                    background:  isActive(link.to) ? '#f5f3ff' : '#f9fafb',
                    border:      `1px solid ${isActive(link.to) ? '#e9d5ff' : '#f0f0f0'}`,
                  }}>
                    <span style={{ fontSize:20 }}>{link.icon}</span>
                    <span style={{ fontSize:11, fontWeight:600, color: isActive(link.to)?'#6d28d9':'#6b7280' }}>{link.label}</span>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:12, borderTop:'1px solid #f0f0f0' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'#6d28d9', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13 }}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#111' }}>{user?.name}</div>
                  <div style={{ fontSize:11, color:'#9ca3af' }}>{user?.email}</div>
                </div>
              </div>
              <button onClick={handleLogout}
                style={{ fontSize:12, color:'#ef4444', background:'#fef2f2', border:'1px solid #fecaca', padding:'7px 14px', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}