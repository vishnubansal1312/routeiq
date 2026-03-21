import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export default function Signup() {
  const [form,    setForm]    = useState({ name:'', email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    try {
      const res = await api.post('/api/auth/signup', form)
      login(res.data.user, res.data.token)
      navigate('/map')
    } catch(err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    }
    setLoading(false)
  }

  const handleGoogle = () => {
    window.location.href = `${API_URL}/api/auth/google`
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .form-input { width:100%; padding:12px 14px; border:1.5px solid #e5e7eb; border-radius:10px; font-size:15px; font-family:inherit; outline:none; transition:border-color 0.2s,box-shadow 0.2s; background:#fff; color:#111; box-sizing:border-box; }
        .form-input:focus { border-color:#6d28d9; box-shadow:0 0 0 3px rgba(109,40,217,0.1); }
        .btn-google { width:100%; padding:12px; border:1.5px solid #e5e7eb; border-radius:10px; font-size:15px; font-weight:500; font-family:inherit; background:#fff; color:#374151; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition:all 0.2s; }
        .btn-google:hover { background:#f9fafb; border-color:#d1d5db; }
        .btn-submit { width:100%; padding:13px; border:none; border-radius:10px; font-size:15px; font-weight:600; font-family:inherit; background:#6d28d9; color:#fff; cursor:pointer; transition:all 0.2s; }
        .btn-submit:hover { background:#5b21b6; }
        .btn-submit:disabled { opacity:0.6; cursor:not-allowed; }
      `}</style>

      {/* Left — brand */}
      <div style={{ flex:1, background:'linear-gradient(160deg,#0f0a1e,#1a0f3c)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle,rgba(109,40,217,0.12) 1px,transparent 1px)', backgroundSize:'36px 36px' }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'rgba(109,40,217,0.15)', filter:'blur(80px)', bottom:'-10%', left:'-10%' }} />

        <div style={{ position:'relative', zIndex:1 }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:8, textDecoration:'none', marginBottom:48 }}>
            <div style={{ width:36, height:36, background:'#6d28d9', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:14 }}>IQ</div>
            <span style={{ color:'#fff', fontWeight:800, fontSize:20, letterSpacing:'-0.5px' }}>RouteIQ</span>
          </Link>

          <h2 style={{ color:'#fff', fontSize:36, fontWeight:800, letterSpacing:'-1px', lineHeight:1.2, marginBottom:16, fontFamily:"'DM Serif Display',serif" }}>
            Start navigating<br />smarter for free
          </h2>
          <p style={{ color:'rgba(255,255,255,0.55)', fontSize:16, lineHeight:1.7, marginBottom:48, maxWidth:340 }}>
            Join drivers across India saving time and money every day with AI-powered navigation.
          </p>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {[
              { value:'Free',  label:'Forever plan available' },
              { value:'3',     label:'Route types compared'   },
              { value:'24hrs', label:'Departure time analysis' },
              { value:'99%',   label:'ML prediction accuracy'  },
            ].map((s,i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'14px 16px', animation:'fadeUp 0.6s ease forwards', animationDelay:`${i*0.1+0.2}s`, opacity:0 }}>
                <div style={{ fontSize:22, fontWeight:800, color:'#a78bfa', letterSpacing:'-0.5px' }}>{s.value}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — signup form */}
      <div style={{ width:'100%', maxWidth:480, display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px', background:'#fff', overflowY:'auto' }}>
        <div style={{ animation:'fadeUp 0.6s ease forwards' }}>
          <div style={{ marginBottom:32 }}>
            <h1 style={{ fontSize:28, fontWeight:800, color:'#111', letterSpacing:'-0.5px', marginBottom:8 }}>Create your account</h1>
            <p style={{ fontSize:15, color:'#6b7280' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color:'#6d28d9', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
            </p>
          </div>

          {/* Google button */}
          <button onClick={handleGoogle} className="btn-google" style={{ marginBottom:24 }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
            <span style={{ fontSize:13, color:'#9ca3af' }}>or sign up with email</span>
            <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
          </div>

          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'12px 14px', marginBottom:20, fontSize:14, color:'#dc2626' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:14, fontWeight:500, color:'#374151', marginBottom:6 }}>Full name</label>
              <input
                type="text" placeholder="Vishu Bansal"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name:e.target.value }))}
                className="form-input" required
              />
            </div>
            <div>
              <label style={{ display:'block', fontSize:14, fontWeight:500, color:'#374151', marginBottom:6 }}>Email</label>
              <input
                type="email" placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email:e.target.value }))}
                className="form-input" required
              />
            </div>
            <div>
              <label style={{ display:'block', fontSize:14, fontWeight:500, color:'#374151', marginBottom:6 }}>Password</label>
              <input
                type="password" placeholder="Min 6 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password:e.target.value }))}
                className="form-input" required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-submit" style={{ marginTop:4 }}>
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }} />
                  Creating account...
                </span>
              ) : 'Create account →'}
            </button>
          </form>

          <p style={{ marginTop:24, fontSize:13, color:'#9ca3af', textAlign:'center', lineHeight:1.6 }}>
            By signing up you agree to our{' '}
            <a href="#" style={{ color:'#6d28d9', textDecoration:'none' }}>Terms</a>
            {' '}and{' '}
            <a href="#" style={{ color:'#6d28d9', textDecoration:'none' }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}