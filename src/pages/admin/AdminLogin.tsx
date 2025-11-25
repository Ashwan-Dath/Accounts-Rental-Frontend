import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAdminAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const { login } = useAdminAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')

  function onLogin() {
    login(name || 'Admin')
    navigate('/admin')
  }

  return (
    <div>
      <h2>Admin Login</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="text"
          placeholder="Enter admin name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={onLogin}>Login as Admin</button>
        <div style={{ textAlign: 'center', fontSize: 12 }}>
          <Link to="/">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
