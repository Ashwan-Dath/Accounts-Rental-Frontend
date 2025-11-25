import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import AdminLayout from '../layouts/AdminLayout'
import AuthLayout from '../layouts/AuthLayout'
import Home from '../pages/Home'
import Listing from '../pages/Listing'
import Profile from '../pages/Profile'
import Settings from '../pages/Settings'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import ForgotPassword from '../pages/ForgotPassword'
import AdminLogin from '../pages/admin/AdminLogin'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminProfile from '../pages/admin/AdminProfile'
import AdminUsers from '../pages/admin/AdminUsers'
import { useUserAuth } from '../context/AuthContext'
import { useAdminAuth } from '../context/AuthContext'

function RequireUserAuth({ children }: { children: JSX.Element }) {
  const { user } = useUserAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function RequireAdminAuth({ children }: { children: JSX.Element }) {
  const { admin } = useAdminAuth()
  if (!admin) return <Navigate to="/admin/login" replace />
  return children
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes with user header/footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/listing" element={<Listing />} />
          <Route
            path="/profile"
            element={
              <RequireUserAuth>
                <Profile />
              </RequireUserAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireUserAuth>
                <Settings />
              </RequireUserAuth>
            }
          />
        </Route>

        {/* User auth pages (no header/footer) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<ForgotPassword />} />
        </Route>

        {/* Admin auth page (no header/footer) */}
        <Route element={<AuthLayout />}>
          <Route path="/admin/login" element={<AdminLogin />} />
        </Route>
        
        <Route
          path="/admin"
          element={
            <RequireAdminAuth>
              <AdminLayout />
            </RequireAdminAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
