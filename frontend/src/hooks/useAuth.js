import { useState } from 'react'

export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ccr_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = (userData) => {
    localStorage.setItem('ccr_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('ccr_user')
    setUser(null)
  }

  return { user, login, logout }
}
