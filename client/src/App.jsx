import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar       from './components/Navbar'
import Login        from './pages/Login'
import Signup       from './pages/Signup'
import MapPage      from './pages/MapPage'
import Dashboard    from './pages/Dashboard'
import History      from './pages/History'
import Fleet        from './pages/Fleet'
import Pricing      from './pages/Pricing'
import Landing      from './pages/Landing'
import AuthCallback from './pages/AuthCallback'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f9fafb', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:'3px solid #e9d5ff', borderTopColor:'#6d28d9', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
        <p style={{ color:'#6b7280', fontSize:14, fontFamily:'sans-serif' }}>Loading RouteIQ...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? children : <Navigate to="/map" replace />
}

function Layout({ children }) {
  return (
    <div style={{ minHeight:'100vh', background:'#f9fafb', display:'flex', flexDirection:'column' }}>
      <Navbar />
      <main style={{ flex:1 }}>{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"              element={<Landing />} />
          <Route path="/home"          element={<Landing />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/login"         element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup"        element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/map"           element={<PrivateRoute><Layout><MapPage /></Layout></PrivateRoute>} />
          <Route path="/dashboard"     element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/history"       element={<PrivateRoute><Layout><History /></Layout></PrivateRoute>} />
          <Route path="/fleet"         element={<PrivateRoute><Layout><Fleet /></Layout></PrivateRoute>} />
          <Route path="/pricing"       element={<PrivateRoute><Layout><Pricing /></Layout></PrivateRoute>} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}