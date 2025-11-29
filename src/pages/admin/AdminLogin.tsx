import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock } from 'react-icons/fi'
import { useAdminAuth } from '../../context/AuthContext'
import { AdminAuthShell } from './AdminAuthShell'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login } = useAdminAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    if (!form.email || !form.password) {
      setError('Enter email and password')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const response = await fetch('http://localhost:5000/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      })
      let data: any = {}
      if (!response.ok) {
        try {
          data = await response.json()
        } catch {
          const message = await response.text()
          throw new Error(message || 'Unable to login')
        }
        const friendly =
          data?.message ||
          data?.error ||
          data?.reason ||
          (response.status === 401 ? 'Invalid email or password' : 'Unable to login')
        throw new Error(friendly)
      }
      data = await response.json().catch(() => ({ name: 'Admin', token: '' }))
      const tokenFromResponse =
        (data && (data.token)) ?? null
      if (!tokenFromResponse) throw new Error('Login succeeded but token is missing')
      const nameFromResponse = (data && (data.admin.fullName)) ?? 'Admin'
      login({ name: nameFromResponse || 'Admin', token: tokenFromResponse })
      navigate('/admin')
    } catch (apiError) {
      const message =
        apiError instanceof Error ? apiError.message : 'Unexpected login error'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminAuthShell
      title="Welcome Back"
      subtitle="Please enter your admin credentials to continue"
      helper={
        <p>
          No account? <Link to="/admin/register">Create one</Link>
        </p>
      }
    >
      <form className="admin-auth__form" onSubmit={handleSubmit}>
        <label>
          <span>Email Address</span>
          <div className="admin-auth__input">
            <FiMail />
            <input
              name="email"
              type="email"
              placeholder="admin@company.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
        </label>
        <label>
          <span>Password</span>
          <div className="admin-auth__input">
            <FiLock />
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
        </label>
        <div className="admin-auth__meta">
          <Link to="/admin/forgot">Forgot password?</Link>
        </div>
        {error && <p className="admin-auth__error">{error}</p>}
        <button type="submit" className="admin-auth__submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </AdminAuthShell>
  )
}
