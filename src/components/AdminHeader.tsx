import React from 'react'
import { Link } from 'react-router-dom'
import { useAdminAuth } from '../context/AuthContext'

function AdminHeaderInner() {
  const { admin, logout } = useAdminAuth()

  return (
    <header style={{ padding: 12, borderBottom: '1px solid #e6e6e6', background: '#f0f0f0' }}>
      <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <strong>Admin Panel</strong>
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/profile">Profile</Link>
        <Link to="/admin/users">Users</Link>
        <div style={{ marginLeft: 'auto' }}>
          {admin ? (
            <>
              <span style={{ marginRight: 8 }}>Hi, {admin.name}</span>
              <button onClick={() => logout()}>Logout</button>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  )
}

export const AdminHeader = React.memo(AdminHeaderInner)
