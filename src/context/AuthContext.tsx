import React, { createContext, useContext, useState, ReactNode } from 'react'

type AuthIdentity = {
  name: string
  token?: string
}

type UserAuthContextType = {
  user: AuthIdentity | null
  token: string | null
  login: (identity: AuthIdentity) => void
  logout: () => void
  pendingEmail: string | null
  setPendingEmail: (email: string | null) => void
}

type AdminAuthContextType = {
  admin: AuthIdentity | null
  token: string | null
  login: (identity: AuthIdentity) => void
  logout: () => void
  pendingEmail: string | null
  setPendingEmail: (email: string | null) => void
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined)
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

const USER_STORAGE_KEY = 'accounts:userAuth'
const USER_PENDING_EMAIL_KEY = 'accounts:userPendingEmail'
const ADMIN_STORAGE_KEY = 'accounts:adminAuth'
const ADMIN_PENDING_EMAIL_KEY = 'accounts:adminPendingEmail'

function readStoredValue<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeStoredValue<T>(key: string, value: T | null) {
  if (typeof window === 'undefined') return
  try {
    if (value === null || value === undefined) {
      window.localStorage.removeItem(key)
    } else {
      window.localStorage.setItem(key, JSON.stringify(value))
    }
  } catch {
    // swallow storage errors (e.g., quota exceeded)
  }
}

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthIdentity | null>(() =>
    readStoredValue<AuthIdentity>(USER_STORAGE_KEY)
  )
  const [pendingEmail, setPendingEmail] = useState<string | null>(() =>
    readStoredValue<string>(USER_PENDING_EMAIL_KEY)
  )

  function login(identity: AuthIdentity) {
    setUser(identity)
    writeStoredValue(USER_STORAGE_KEY, identity)
    updatePendingEmail(null)
  }

  function logout() {
    setUser(null)
    writeStoredValue(USER_STORAGE_KEY, null)
    updatePendingEmail(null)
  }

  function updatePendingEmail(email: string | null) {
    setPendingEmail(email)
    writeStoredValue(USER_PENDING_EMAIL_KEY, email)
  }

  const token = user?.token ?? null

  return (
    <UserAuthContext.Provider
      value={{ user, token, login, logout, pendingEmail, setPendingEmail: updatePendingEmail }}
    >
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
  const [admin, setAdmin] = useState<AuthIdentity | null>(() =>
    readStoredValue<AuthIdentity>(ADMIN_STORAGE_KEY)
  )
  const [pendingEmail, setPendingEmail] = useState<string | null>(() =>
    readStoredValue<string>(ADMIN_PENDING_EMAIL_KEY)
  )

  function login(identity: AuthIdentity) {
    setAdmin(identity)
    writeStoredValue(ADMIN_STORAGE_KEY, identity)
    updatePendingEmail(null)
  }

  function logout() {
    setAdmin(null)
    writeStoredValue(ADMIN_STORAGE_KEY, null)
    updatePendingEmail(null)
  }

  function updatePendingEmail(email: string | null) {
    setPendingEmail(email)
    writeStoredValue(ADMIN_PENDING_EMAIL_KEY, email)
  }

  const token = admin?.token ?? null

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        login,
        logout,
        pendingEmail,
        setPendingEmail: updatePendingEmail,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
