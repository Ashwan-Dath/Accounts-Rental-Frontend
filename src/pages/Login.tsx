import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUserAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useUserAuth()
  const navigate = useNavigate()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return

    setError(null)
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userId, password }),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Login failed')
      }

      const data = await response.json().catch(() => ({}))
      const tokenFromResponse = (data && (data.token || data.accessToken)) || ''
      if (!tokenFromResponse) {
        throw new Error('Login succeeded but token was not returned')
      }

      const resolvedName =
        (data &&
          ((data.user && (data.user.firstName || data.user.name)) || data.name)) ||
        userId ||
        'User'

      login({ name: resolvedName, token: tokenFromResponse })
      navigate('/')
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-panel login-info">
          <div className="login-pill">Welcome back</div>
          <h1>Log in to Nextpage</h1>
          <p>
            Access your workspace with your email and password. Need help? Use the password
            reset flow.
          </p>
          <div>
            New here?{' '}
            <Link to="/signup" className="login-highlight-link">
              Create an account
            </Link>
          </div>
        </section>

        <section className="login-panel login-form-card">
          <form className="login-form" onSubmit={onLogin}>
            <label className="login-label" htmlFor="userId">
              User ID (Email)
            </label>
            <input
              id="userId"
              className="login-input"
              type="email"
              placeholder="you@company.com"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />

            <label className="login-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="login-actions">
              <button type="submit" className="login-primary-btn" disabled={loading}>
                {loading ? 'Checking…' : 'Login'}
              </button>
              <Link to="/forgot" className="login-secondary-link">
                Forgot password
              </Link>
            </div>
            {error && (
              <div className="alert alert-danger mt-3 mb-0" role="alert">
                {error}
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  )
}
