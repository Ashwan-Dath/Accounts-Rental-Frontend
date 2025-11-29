import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAdminAuth } from '../context/AuthContext'
import logo from '../assets/Loogoo.png'

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/ads', label: 'Ads' },
  // { to: '/admin/profile', label: 'Profile' },
]

function AdminHeaderInner() {
  const { admin, logout } = useAdminAuth()

  return (
    <header className="admin-header">
      <div className="admin-header__shell page-container">
        <div className="admin-header__brand">
          <Link to="/admin" className="public-header__brand">
            <img src={logo} alt="Account Rental admin-header__logoLogo" className="admin-header__logo" />
          {/* <span className="public-header__brand-text">Nextpage</span> */}
          </Link>

          {/* <Link to="/admin" className="admin-header__logo">
            Admin Panel
          </Link>
          <p className="admin-header__tagline">White theme overview</p> */}
        </div>

        <nav className="admin-header__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `admin-header__link${isActive ? ' admin-header__link--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-header__actions">
          {admin && (
            <>
              <span className="admin-header__greeting">Hi, {admin.name}</span>
              <button type="button" onClick={() => logout()} className="admin-header__logout">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export const AdminHeader = React.memo(AdminHeaderInner)
