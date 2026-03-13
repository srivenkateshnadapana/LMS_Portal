"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import Cookies from 'js-cookie'

const BACKEND_URL = 'http://localhost:8080'

interface User {
  id: string
  phone: string
  email?: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (phone: string, password: string) => Promise<void>
  register: (phone: string, password: string, email?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('auth-token')
    if (token) {
      fetchUser(token)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async (token: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/protected/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (res.ok) {
        const userData = await res.json()
        setUser(userData)
      } else {
        Cookies.remove('auth-token')
      }
    } catch {
      Cookies.remove('auth-token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (phone: string, password: string) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    })
    if (!res.ok) throw new Error('Login failed')
    const data = await res.json()
    Cookies.set('auth-token', data.token, { expires: 1, secure: false, sameSite: 'strict' })
    const userData = await (await fetch(`${BACKEND_URL}/api/protected/user`, {
      headers: { Authorization: `Bearer ${data.token}` }
    })).json()
    setUser(userData)
  }

  const register = async (phone: string, password: string, email?: string) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, email })
    })
    if (!res.ok) throw new Error('Register failed')
    const data = await res.json()
    Cookies.set('auth-token', data.token, { expires: 1, secure: false, sameSite: 'strict' })
    const userData = await (await fetch(`${BACKEND_URL}/api/protected/user`, {
      headers: { Authorization: `Bearer ${data.token}` }
    })).json()
    setUser(userData)
  }

  const logout = () => {
    Cookies.remove('auth-token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

