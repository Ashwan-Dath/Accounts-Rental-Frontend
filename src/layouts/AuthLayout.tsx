import React from 'react'
import { Outlet } from 'react-router-dom'

// Auth pages (login/signup/forgot) should not show header/footer
export default function AuthLayout() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: 420, padding: 24, border: '1px solid #eaeaea', borderRadius: 8 }}>
        <Outlet />
      </div>
    </div>
  )
}
