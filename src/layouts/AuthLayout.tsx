import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'

// Auth pages (login/signup/forgot) should not show header/footer
export default function AuthLayout() {
  const { pathname } = useLocation()
  const fullScreenRoutes = ['/login', '/signup', '/verify-otp']
  const isFullScreen = fullScreenRoutes.includes(pathname)

  if (isFullScreen) {
    return <Outlet />
  }

  return (
    <div className="auth-layout">
      <div className="auth-layout__panel">
        <Outlet />
      </div>
    </div>
  )
}
