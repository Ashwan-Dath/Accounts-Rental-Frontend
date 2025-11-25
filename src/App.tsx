import React from 'react'
import { UserAuthProvider, AdminAuthProvider } from './context/AuthContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <UserAuthProvider>
      <AdminAuthProvider>
        <AppRoutes />
      </AdminAuthProvider>
    </UserAuthProvider>
  )
}
