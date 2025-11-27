import React from 'react'
import { useAdminAuth } from '../../context/AuthContext'

export default function AdminProfile() {
  const { admin } = useAdminAuth()
  return (
    <div className="content-card">
      <h2>Admin Profile</h2>
      <p>Name: {admin?.name}</p>
    </div>
  )
}
