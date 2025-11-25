import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUserAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useUserAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')

  function onLogin() {
    login(name || 'User')
    navigate('/')
  }

  return (
    <div>
      <h2>User Login</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={onLogin}>Login</button>
        <div style={{ textAlign: 'center', fontSize: 12 }}>
          <Link to="/signup">Don't have an account? Sign up</Link>
        </div>
      </div>
    </div>
  )
}

