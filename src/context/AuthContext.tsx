import React, { createContext, useContext, useState, ReactNode } from 'react'

type User = {
  name: string
}

type UserAuthContextType = {
  user: User | null
  login: (name: string) => void
  logout: () => void
}

type AdminAuthContextType = {
  admin: User | null
  login: (name: string) => void
  logout: () => void
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined)
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  function login(name = 'Demo User') {
    setUser({ name })
  }

  function logout() {
    setUser(null)
  }

  return (
    <UserAuthContext.Provider value={{ user, login, logout }}>
      {children}
    </UserAuthContext.Provider>
  )
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext)
  if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider')
  return ctx
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<User | null>(null)

  function login(name = 'Demo Admin') {
    setAdmin({ name })
  }

  function logout() {
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
