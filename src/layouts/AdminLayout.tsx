import React from 'react'
import { Outlet } from 'react-router-dom'
import { AdminHeader } from '../components/AdminHeader'
import { Footer } from '../components/Footer'

export default function AdminLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AdminHeader />
      <main style={{ flex: 1, padding: 16 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
