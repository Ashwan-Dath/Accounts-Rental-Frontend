import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiUser } from 'react-icons/fi'
import { useAdminAuth } from '../../context/AuthContext'
import { AdminAuthShell } from './AdminAuthShell'

export default function AdminRegister() {
  const navigate = useNavigate()
  const { setPendingEmail } = useAdminAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      console.log("registration form data:", form);
      const response = await fetch('http://localhost:5000/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.name,
          email: form.email,
          password: form.password
        }),
      })
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Unable to register admin')
      }
      const data = await response.json()
      console.log("registration response data:", data);
      setPendingEmail(form.email)
      navigate('/admin/verify-otp', { state: { email: form.email } })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminAuthShell
      title="Create Admin Account"
      subtitle="We will send a verification code to confirm your account"
      helper={
        <p>
          Already registered? <Link to="/admin/login">Back to login</Link>
        </p>
      }
    >
      <form className="admin-auth__form" onSubmit={handleSubmit}>
        <label>
          <span>Full Name</span>
          <div className="admin-auth__input">
            <FiUser />
            <input
              name="name"
              type="text"
              placeholder="Alex Rivera"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
        </label>
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
        {error && <p className="admin-auth__error">{error}</p>}
        <button type="submit" className="admin-auth__submit" disabled={submitting}>
          {submitting ? 'Registering...' : 'Register'}
        </button>
      </form>
    </AdminAuthShell>
  )
}
