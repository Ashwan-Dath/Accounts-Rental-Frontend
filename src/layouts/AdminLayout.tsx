import React from 'react'
import { Outlet } from 'react-router-dom'
import { AdminHeader } from '../components/AdminHeader'
import { Footer } from '../components/Footer'

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminHeader />
      <main className="admin-layout__main">
        <div className="admin-layout__content page-container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
