import { useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/authApi.js'
import { getAccessToken } from '../api/apiClient.js'
import { AuthContext } from './AuthContext.js'

function normalizeUser(user) {
  if (!user) return null
  return {
    ...user,
    id: Number(user.id),
    name: user.nickname || user.name || '',
    nickname: user.nickname || user.name || '',
    email: user.email || '',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function restoreSession() {
      if (!getAccessToken()) {
        if (active) setIsLoading(false)
        return
      }
      try {
        const currentUser = await authApi.me()
        if (active) setUser(normalizeUser(currentUser))
      } catch {
        authApi.logout()
        if (active) setUser(null)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    restoreSession()

    const handleUnauthorized = () => setUser(null)
    window.addEventListener('campusconnect:unauthorized', handleUnauthorized)
    return () => {
      active = false
      window.removeEventListener('campusconnect:unauthorized', handleUnauthorized)
    }
  }, [])

  async function register(userData) {
    return authApi.signup(userData)
  }

  async function login(email, password) {
    const currentUser = await authApi.login(email, password)
    const normalized = normalizeUser(currentUser)
    setUser(normalized)
    return normalized
  }

  function logout() {
    authApi.logout()
    setUser(null)
  }

  const value = useMemo(() => ({
    user,
    isLoading,
    isLoggedIn: Boolean(user),
    register,
    login,
    logout,
  }), [user, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

