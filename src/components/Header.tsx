import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'
import { useUserAuth } from '../context/AuthContext'
import logo from '../assets/Loogoo.png'

function HeaderInner() {
  const { user, logout } = useUserAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = search.trim()
    setMenuOpen(false)
    navigate(trimmed ? `/listing?query=${encodeURIComponent(trimmed)}` : '/listing')
  }

  const actionItems = user ? (
    <>
      <Link
        to="/profile"
        className="public-header__auth-btn public-header__auth-btn--ghost public-header__profile-btn"
        onClick={() => setMenuOpen(false)}
      >
        Profile
      </Link>
      <button
        type="button"
        onClick={() => {
          logout()
          setMenuOpen(false)
        }}
        className="public-header__auth-btn public-header__auth-btn--ghost"
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <Link
        to="/login"
        className="public-header__auth-btn public-header__auth-btn--ghost"
        onClick={() => setMenuOpen(false)}
      >
        Login
      </Link>
      <Link
        to="/signup"
        className="public-header__auth-btn public-header__auth-btn--solid"
        onClick={() => setMenuOpen(false)}
      >
        Sign up
      </Link>
    </>
  )

  const postAdLink = (
    <Link
      to="/post-ad"
      className="public-header__post-btn"
      onClick={() => setMenuOpen(false)}
    >
      Post an Ad
    </Link>
  )

  return (
    <header className={`public-header ${menuOpen ? 'public-header--open' : ''}`}>
      <nav className="public-header__nav">
        <Link to="/" className="public-header__brand" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="Account Rental Logo" className="public-header__brand-logo" />
          {/* <span className="public-header__brand-text">Nextpage</span> */}
        </Link>

        <form onSubmit={handleSubmit} className="public-header__search">
          <input
            type="text"
            placeholder="Search gear..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="public-header__input"
          />
          <button type="submit" className="public-header__submit" aria-label="Search">
            <FiSearch className="public-header__submit-icon" />
          </button>
        </form>

        <div className="public-header__actions">
          {postAdLink}
          {actionItems}
        </div>

        <button
          type="button"
          className="public-header__menu-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <aside className="public-header__drawer">
        <div className="public-header__drawer-inner">
          <div className="public-header__drawer-header">
            <span>Menu</span>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMenuOpen(false)}
              className="public-header__drawer-close"
            >
              ×
            </button>
          </div>
          <div className="public-header__drawer-body">
            {postAdLink}
            {actionItems}
          </div>
        </div>
      </aside>
    </header>
  )
}

export const Header = React.memo(HeaderInner)
