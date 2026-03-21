import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const FEATURES = [
  { icon: '🗺️', title: 'Compare 3 routes', desc: 'Fastest, shortest and eco routes shown simultaneously. Pick what suits you.' },
  { icon: '🤖', title: 'AI congestion prediction', desc: 'XGBoost ML model predicts traffic jams before you leave home.' },
  { icon: '🕐', title: 'Best departure time', desc: 'AI analyses all 24 hours and tells you exactly when to leave.' },
  { icon: '🌤️', title: 'Live weather alerts', desc: 'Rain, fog and storm warnings at your destination in real time.' },
  { icon: '⚠️', title: 'Accident hotspots', desc: '20+ known danger zones across India marked on your route.' },
  { icon: '🚛', title: 'Fleet management', desc: 'Track multiple vehicles live. Built for logistics and transport companies.' },
  { icon: '⛽', title: 'Toll + fuel calculator', desc: 'Exact trip cost breakdown before you start driving.' },
  { icon: '📍', title: 'Live GPS navigation', desc: 'Voice turn-by-turn directions with real-time location tracking.' },
]

const STATS = [
  { value: '3', label: 'Route types compared', suffix: '' },
  { value: '20', label: 'Accident hotspots mapped', suffix: '+' },
  { value: '99', label: 'ML prediction accuracy', suffix: '%' },
  { value: '24', label: 'Hourly departure analysis', suffix: 'hrs' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Enter your route', desc: 'Type origin and destination. Use your live GPS location for origin with one tap.' },
  { step: '02', title: 'AI analyses everything', desc: 'ML model predicts congestion, fetches weather, calculates costs and finds all 3 routes simultaneously.' },
  { step: '03', title: 'Drive smarter', desc: 'Follow voice navigation, track your trip live and compare routes to save time and money.' },
]

function AnimatedCounter({ target, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(eased * parseInt(target)))
          if (progress < 1) requestAnimationFrame(tick)
          else setCount(parseInt(target))
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: '#fff', color: '#111', overflowX: 'hidden' }}>

      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
        @keyframes dash { to { stroke-dashoffset: 0; } }
        @keyframes slide-right { from{width:0} to{width:100%} }
        .fade-up { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.25s; }
        .fade-up-3 { animation-delay: 0.4s; }
        .fade-up-4 { animation-delay: 0.55s; }
        .feature-card:hover { transform:translateY(-4px); box-shadow: 0 20px 60px rgba(109,40,217,0.12); }
        .feature-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .btn-primary { background:#6d28d9; color:#fff; border:none; padding:14px 32px; border-radius:12px; font-size:15px; font-weight:600; cursor:pointer; transition:all 0.2s; letter-spacing:-0.2px; }
        .btn-primary:hover { background:#5b21b6; transform:translateY(-1px); }
        .btn-secondary { background:transparent; color:#6d28d9; border:1.5px solid #6d28d9; padding:13px 28px; border-radius:12px; font-size:15px; font-weight:600; cursor:pointer; transition:all 0.2s; }
        .btn-secondary:hover { background:#f5f3ff; }
        .nav-link { color:#555; text-decoration:none; font-size:14px; font-weight:500; transition:color 0.2s; }
        .nav-link:hover { color:#6d28d9; }
        .route-line { stroke-dasharray: 200; stroke-dashoffset: 200; animation: dash 2s cubic-bezier(0.4,0,0.2,1) 0.8s forwards; }
        .float-card { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, background: '#6d28d9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 13 }}>IQ</div>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>Route<span style={{ color: '#6d28d9' }}>IQ</span></span>
          </div>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
            {[['Features', '#features'], ['How it works', '#how'], ['Fleet', '#fleet'], ['Pricing', '#pricing']].map(([label, href]) => (
              <a key={label} href={href} className="nav-link">{label}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/login" style={{ color: '#555', textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '8px 16px' }}>Sign in</Link>
            <Link to="/signup">
              <button className="btn-primary" style={{ padding: '10px 22px', fontSize: 14 }}>Get started free</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0f0a1e 0%, #1a0f3c 40%, #0d1426 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '100px 24px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background dots */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(109,40,217,0.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Glow orbs */}
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'rgba(109,40,217,0.15)', filter: 'blur(80px)', top: '-10%', right: '-10%' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(14,165,233,0.1)', filter: 'blur(60px)', bottom: '10%', left: '-5%' }} />

        <div style={{ maxWidth: 1200, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', position: 'relative', zIndex: 1 }}>

          {/* Left — text */}
          <div>
            <div className="fade-up fade-up-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(109,40,217,0.2)', border: '1px solid rgba(109,40,217,0.4)', borderRadius: 100, padding: '6px 16px', marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
              <span style={{ color: '#a78bfa', fontSize: 13, fontWeight: 500 }}>AI-powered for Indian roads</span>
            </div>

            <h1 className="fade-up fade-up-2" style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 24, fontFamily: "'DM Serif Display', serif" }}>
              Navigate India<br />
              <span style={{ color: '#a78bfa' }}>smarter</span> than<br />
              ever before
            </h1>

            <p className="fade-up fade-up-3" style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 40, maxWidth: 440 }}>
              Real-time traffic prediction, AI route assistant, live GPS navigation and fleet management — all in one app built for India.
            </p>

            <div className="fade-up fade-up-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/signup">
                <button className="btn-primary" style={{ fontSize: 16, padding: '16px 36px' }}>
                  Start for free →
                </button>
              </Link>
              <a href="#features">
                <button className="btn-secondary" style={{ fontSize: 16, padding: '15px 28px', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }}>
                  See features
                </button>
              </a>
            </div>

            {/* Social proof */}
            <div className="fade-up fade-up-4" style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex' }}>
                {['V', 'R', 'A', 'P'].map((l, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${260 + i * 20},60%,60%)`, border: '2px solid #1a0f3c', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700 }}>{l}</div>
                ))}
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Join early users</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>already navigating smarter</div>
              </div>
            </div>
          </div>

          {/* Right — map visual */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 480 }}>
            {/* Map card */}
            <div style={{ width: '100%', maxWidth: 440, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 24, backdropFilter: 'blur(20px)' }} className="float-card">

              {/* Mini map */}
              <svg width="100%" viewBox="0 0 380 260" style={{ borderRadius: 16, overflow: 'hidden' }}>
                <rect width="380" height="260" fill="#0d1117" rx="12" />
                {/* Road grid */}
                {[40,80,120,160,200,240,280,320,360].map(x => <line key={x} x1={x} y1="0" x2={x} y2="260" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />)}
                {[40,80,120,160,200,240].map(y => <line key={y} x1="0" y1={y} x2="380" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />)}
                {/* Roads */}
                <path d="M 30 200 Q 100 180 190 130 Q 280 80 350 60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" strokeLinecap="round" />
                <path d="M 30 200 Q 80 160 140 120 Q 200 80 350 60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" strokeLinecap="round" />
                {/* Route lines */}
                <path d="M 50 190 Q 110 165 190 125 Q 270 85 340 68" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" className="route-line" />
                <path d="M 50 190 Q 90 155 150 115 Q 210 75 340 68" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeDasharray="200" strokeDashoffset="200" style={{ animation: 'dash 2s cubic-bezier(0.4,0,0.2,1) 1.2s forwards' }} />
                <path d="M 50 190 Q 120 170 200 135 Q 280 100 340 68" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeDasharray="200" strokeDashoffset="200" style={{ animation: 'dash 2s cubic-bezier(0.4,0,0.2,1) 1.6s forwards' }} />
                {/* Origin */}
                <circle cx="50" cy="190" r="8" fill="#22c55e" />
                <circle cx="50" cy="190" r="14" fill="rgba(34,197,94,0.2)" />
                {/* Destination */}
                <circle cx="340" cy="68" r="8" fill="#ef4444" />
                <circle cx="340" cy="68" r="14" fill="rgba(239,68,68,0.2)" />
                {/* GPS dot */}
                <circle cx="190" cy="125" r="6" fill="#3b82f6" />
                <circle cx="190" cy="125" r="12" fill="rgba(59,130,246,0.2)" style={{ animation: 'pulse-ring 1.5s ease-out infinite' }} />
                {/* Labels */}
                <text x="65" y="194" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="sans-serif">New Delhi</text>
                <text x="270" y="62" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="sans-serif">Mumbai</text>
              </svg>

              {/* Route cards below map */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 16 }}>
                {[
                  { label: 'Fastest', color: '#0ea5e9', time: '18h 20m', dist: '1,420 km' },
                  { label: 'Shortest', color: '#a855f7', time: '19h 05m', dist: '1,380 km' },
                  { label: 'Eco', color: '#22c55e', time: '20h 10m', dist: '1,395 km' },
                ].map(r => (
                  <div key={r.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 10px', border: `1px solid ${r.color}30` }}>
                    <div style={{ fontSize: 10, color: r.color, fontWeight: 600, marginBottom: 4 }}>{r.label}</div>
                    <div style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>{r.time}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{r.dist}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badges */}
            <div style={{ position: 'absolute', top: 20, left: -20, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '10px 14px', backdropFilter: 'blur(20px)' }}>
              <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 600 }}>CONGESTION</div>
              <div style={{ fontSize: 18, color: '#fff', fontWeight: 800 }}>Low</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Score 2.3/10</div>
            </div>

            <div style={{ position: 'absolute', bottom: 40, right: -20, background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 12, padding: '10px 14px', backdropFilter: 'blur(20px)' }}>
              <div style={{ fontSize: 10, color: '#0ea5e9', fontWeight: 600 }}>WEATHER</div>
              <div style={{ fontSize: 18, color: '#fff', fontWeight: 800 }}>26°C</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Clear skies</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Scroll to explore</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }} />
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section style={{ background: '#6d28d9', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ padding: '100px 24px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', background: '#f5f3ff', color: '#6d28d9', fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: 100, marginBottom: 16, border: '1px solid #e9d5ff' }}>
              Everything you need
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-1px', color: '#111', marginBottom: 16 }}>
              Built for Indian roads
            </h2>
            <p style={{ fontSize: 18, color: '#666', maxWidth: 520, margin: '0 auto' }}>
              Every feature designed around the unique challenges of navigating India's roads.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card" style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 8, letterSpacing: '-0.3px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" style={{ padding: '100px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', background: '#f5f3ff', color: '#6d28d9', fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: 100, marginBottom: 16, border: '1px solid #e9d5ff' }}>
              Simple to use
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-1px', color: '#111' }}>
              Ready in 3 steps
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0 20px' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: '#f5f3ff', border: '2px solid #e9d5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 22, fontWeight: 800, color: '#6d28d9', fontFamily: "'DM Serif Display', serif" }}>
                  {s.step}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 12, letterSpacing: '-0.3px' }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FLEET SECTION ─── */}
      <section id="fleet" style={{ padding: '100px 24px', background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0f3c 100%)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(167,139,250,0.2)', color: '#a78bfa', fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: 100, marginBottom: 24, border: '1px solid rgba(167,139,250,0.3)' }}>
              For businesses
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-1px', color: '#fff', marginBottom: 20, lineHeight: 1.2 }}>
              Fleet management<br />
              <span style={{ color: '#a78bfa' }}>built for India</span>
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 32 }}>
              Track your entire fleet in real time. Monitor speed, fuel levels, route progress and driver performance — all from one dashboard.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
              {['Live GPS tracking for up to 50 vehicles', 'Fuel level monitoring with low-fuel alerts', 'Route progress and ETA for every vehicle', 'Driver performance analytics'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#a78bfa', fontSize: 11 }}>✓</span>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>{item}</span>
                </div>
              ))}
            </div>
            <Link to="/fleet">
              <button className="btn-primary" style={{ background: '#a78bfa', fontSize: 15 }}>
                Try fleet demo →
              </button>
            </Link>
          </div>

          {/* Fleet visual */}
          <div style={{ position: 'relative' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Fleet Dashboard</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ color: '#22c55e', fontSize: 12 }}>Live</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[['5', 'Total vehicles', '#0ea5e9'], ['3', 'Moving', '#22c55e'], ['1', 'Stopped', '#ef4444'], ['1', 'Low fuel', '#f59e0b']].map(([val, label, color]) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>

              {[
                { name: 'Truck 01', driver: 'Rajesh Kumar', route: 'Delhi → Agra', status: 'moving', fuel: 75, speed: 68 },
                { name: 'Van 02', driver: 'Suresh Sharma', route: 'Mumbai → Pune', status: 'stopped', fuel: 45, speed: 0 },
                { name: 'Truck 03', driver: 'Mohan Reddy', route: 'Bangalore → Chennai', status: 'moving', fuel: 30, speed: 82 },
              ].map((v, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{v.status === 'moving' ? '🚛' : '🚐'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{v.name}</span>
                      <span style={{ fontSize: 10, color: v.status === 'moving' ? '#22c55e' : '#ef4444', background: v.status === 'moving' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                        {v.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{v.route} · {v.speed} km/h</div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 8 }}>
                      <div style={{ height: 3, width: `${v.fuel}%`, background: v.fuel < 35 ? '#ef4444' : '#22c55e', borderRadius: 2 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING PREVIEW ─── */}
      <section id="pricing" style={{ padding: '100px 24px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', background: '#f5f3ff', color: '#6d28d9', fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: 100, marginBottom: 16, border: '1px solid #e9d5ff' }}>
              Simple pricing
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-1px', color: '#111', marginBottom: 16 }}>
              Start free, grow as you need
            </h2>
            <p style={{ fontSize: 17, color: '#666' }}>No credit card required to get started</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 960, margin: '0 auto' }}>
            {[
              { name: 'Free', price: '₹0', period: 'forever', color: '#666', features: ['5 route searches/day', 'Basic congestion prediction', 'Weather at destination', '7-day trip history'], cta: 'Get started', highlight: false },
              { name: 'Pro', price: '₹499', period: '/month', color: '#6d28d9', features: ['Unlimited searches', 'AI Route Assistant', 'All 3 routes + comparison', 'Best departure time AI', 'Accident hotspot map', 'Carbon footprint score'], cta: 'Start Pro', highlight: true },
              { name: 'Business', price: '₹1,499', period: '/month', color: '#0ea5e9', features: ['Everything in Pro', 'Fleet management', '50 vehicles tracking', '5 team accounts', 'Priority support', 'API access'], cta: 'Contact us', highlight: false },
            ].map((plan, i) => (
              <div key={i} style={{ background: plan.highlight ? '#6d28d9' : '#fff', borderRadius: 24, padding: 32, border: plan.highlight ? 'none' : '1px solid rgba(0,0,0,0.08)', position: 'relative' }}>
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#a78bfa', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 16px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                    Most popular
                  </div>
                )}
                <div style={{ fontSize: 14, fontWeight: 600, color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#666', marginBottom: 8 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: plan.highlight ? '#fff' : '#111', letterSpacing: '-1px' }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#666' }}>{plan.period}</span>
                </div>
                <div style={{ height: 1, background: plan.highlight ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)', margin: '20px 0' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: plan.highlight ? '#a78bfa' : '#6d28d9', fontSize: 14 }}>✓</span>
                      <span style={{ fontSize: 14, color: plan.highlight ? 'rgba(255,255,255,0.8)' : '#444' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link to={i === 2 ? '/pricing' : '/signup'}>
                  <button style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', border: plan.highlight ? 'none' : '1.5px solid #6d28d9', background: plan.highlight ? 'rgba(255,255,255,0.15)' : 'transparent', color: plan.highlight ? '#fff' : '#6d28d9', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.target.style.background = plan.highlight ? 'rgba(255,255,255,0.25)' : '#f5f3ff' }}
                    onMouseOut={e => { e.target.style.background = plan.highlight ? 'rgba(255,255,255,0.15)' : 'transparent' }}
                  >
                    {plan.cta} →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section style={{ padding: '80px 24px', background: '#6d28d9' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: 20, fontFamily: "'DM Serif Display', serif" }}>
            Ready to navigate smarter?
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', marginBottom: 36, lineHeight: 1.6 }}>
            Join thousands of Indian drivers saving time and money with AI-powered navigation.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup">
              <button style={{ background: '#fff', color: '#6d28d9', border: 'none', padding: '16px 36px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => e.target.style.transform = 'translateY(-1px)'}
                onMouseOut={e => e.target.style.transform = 'none'}
              >
                Start for free →
              </button>
            </Link>
            <Link to="/map">
              <button style={{ background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', padding: '15px 28px', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                Try the map
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: '#0f0a1e', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, background: '#6d28d9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 11 }}>IQ</div>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.5px' }}>RouteIQ</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
                AI-powered traffic intelligence for Indian roads.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Map', 'Dashboard', 'Fleet', 'Pricing'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] },
            ].map(section => (
              <div key={section.title}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>{section.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {section.links.map(link => (
                    <a key={link} href="#" style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseOver={e => e.target.style.color = '#fff'}
                      onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                    >{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>© 2026 RouteIQ. Built with React, Node.js & Python.</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Made in India 🇮🇳</span>
          </div>
        </div>
      </footer>
    </div>
  )
}