import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import AdminLayout from '../layouts/AdminLayout'
import AuthLayout from '../layouts/AuthLayout'
import Home from '../pages/Home'
import Listing from '../pages/Listing'
import ProfilePage from '../pages/profile/ProfilePage'
import AdsPage from '../pages/profile/AdsPage'
import RentalsPage from '../pages/profile/RentalsPage'
import SubscriptionsPage from '../pages/profile/SubscriptionsPage'
import GiftsPage from '../pages/profile/GiftsPage'
import Settings from '../pages/Settings'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import ForgotPassword from '../pages/ForgotPassword'
import OtpVerification from '../pages/OtpVerification'
import PostAd from '../pages/PostAd'
import AdminLogin from '../pages/admin/AdminLogin'
import AdminRegister from '../pages/admin/AdminRegister'
import AdminForgotPassword from '../pages/admin/AdminForgotPassword'
import AdminOtpVerification from '../pages/admin/AdminOtpVerification'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminProfile from '../pages/admin/AdminProfile'
import AdminUsers from '../pages/admin/AdminUsers'
import AdminCategories from '../pages/admin/AdminCategories'
import AdminAds from '../pages/admin/AdminAds'
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
          <Route path="/post-ad" element={<PostAd />} />
          <Route
            path="/profile"
            element={
              <RequireUserAuth>
                <ProfilePage />
              </RequireUserAuth>
            }
          />
          <Route
            path="/ads"
            element={
              <RequireUserAuth>
                <AdsPage />
              </RequireUserAuth>
            }
          />
          <Route
            path="/rentals"
            element={
              <RequireUserAuth>
                <RentalsPage />
              </RequireUserAuth>
            }
          />
          <Route
            path="/my-subscriptions"
            element={
              <RequireUserAuth>
                <SubscriptionsPage />
              </RequireUserAuth>
            }
          />
          <Route
            path="/gifts"
            element={
              <RequireUserAuth>
                <GiftsPage />
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
          <Route path="/verify-otp" element={<OtpVerification />} />
        </Route>

        {/* Admin public auth pages */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/forgot" element={<AdminForgotPassword />} />
        <Route path="/admin/verify-otp" element={<AdminOtpVerification />} />
        
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
          <Route path="categories" element={<AdminCategories />} />
          <Route path="ads" element={<AdminAds />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
