import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { login }  = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token  = params.get('token')
    const userStr = params.get('user')

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr))
        localStorage.setItem('routeiq_token', token)
        localStorage.setItem('routeiq_user',  JSON.stringify(user))
        login(user, token)
        navigate('/map', { replace: true })
      } catch {
        navigate('/login?error=parse_failed', { replace: true })
      }
    } else {
      navigate('/login?error=no_token', { replace: true })
    }
  }, [])

  return (
    <div style={{ minHeight:'100vh', background:'#0f0a1e', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, border:'4px solid rgba(109,40,217,0.3)', borderTopColor:'#6d28d9', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }} />
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14 }}>Signing you in with Google...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )
}