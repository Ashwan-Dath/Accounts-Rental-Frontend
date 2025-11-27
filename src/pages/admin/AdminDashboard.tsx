import React from 'react'
import { useAdminAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
    const { admin, token, pendingEmail } = useAdminAuth()

    console.log("Admin Dashboard - Admin:", admin);
    console.log("Admin Dashboard - Token:", token);
    console.log("Admin Dashboard - Pending Email:", pendingEmail);
    
  return (
    <section className="admin-dashboard">
      <div className="admin-dashboard__hero">
        <p className="admin-dashboard__eyebrow">Control Center</p>
        <h1>Admin Dashboard</h1>
        <p>Overview and admin controls.</p>
      </div>
    </section>
  )
}
