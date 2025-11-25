import React from 'react'
import { Link } from 'react-router-dom'
import { useUserAuth } from '../context/AuthContext'

function HeaderInner() {
  const { user, logout, login } = useUserAuth()

  return (
    <header style={{ padding: 12, borderBottom: '1px solid #e6e6e6' }}>
      <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link to="/">Home</Link>
        <Link to="/listing">Listing</Link>
        {user && <Link to="/profile">Profile</Link>}
        {user && <Link to="/settings">Settings</Link>}
        <div style={{ marginLeft: 'auto' }}>
          {user ? (
            <>
              <span style={{ marginRight: 8 }}>Hi, {user.name}</span>
              <button onClick={() => logout()}>Logout</button>
            </>
          ) : (
            <Link to="/login">
              <button>Login</button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

export const Header = React.memo(HeaderInner)
