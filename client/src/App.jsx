import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar    from './components/Navbar'
import Login     from './pages/Login'
import Signup    from './pages/Signup'
import MapPage   from './pages/MapPage'
import Dashboard from './pages/Dashboard'
import History   from './pages/History'
import Fleet     from './pages/Fleet'
import Pricing   from './pages/Pricing'
import Landing   from './pages/Landing'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-dark-600 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading RouteIQ...</p>
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
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page — no navbar, no auth required */}
          <Route path="/"       element={<Landing />} />
          <Route path="/home"   element={<Landing />} />

          {/* Auth pages */}
          <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* App pages — require login */}
          <Route path="/map"       element={<PrivateRoute><Layout><MapPage /></Layout></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/history"   element={<PrivateRoute><Layout><History /></Layout></PrivateRoute>} />
          <Route path="/fleet"     element={<PrivateRoute><Layout><Fleet /></Layout></PrivateRoute>} />
          <Route path="/pricing"   element={<PrivateRoute><Layout><Pricing /></Layout></PrivateRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}