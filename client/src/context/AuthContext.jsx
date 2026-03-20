import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser  = localStorage.getItem('routeiq_user')
    const storedToken = localStorage.getItem('routeiq_token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('routeiq_token', res.data.token)
    localStorage.setItem('routeiq_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data
  }

  const signup = async (name, email, password) => {
    const res = await api.post('/api/auth/signup', { name, email, password })
    localStorage.setItem('routeiq_token', res.data.token)
    localStorage.setItem('routeiq_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('routeiq_token')
    localStorage.removeItem('routeiq_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)