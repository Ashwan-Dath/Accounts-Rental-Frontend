import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserAuth } from '../context/AuthContext'

export default function Signup() {
  const navigate = useNavigate()
  const { setPendingEmail } = useUserAuth()
  const [formData, setFormData] = useState({
    first: '',
    last: '',
    email: '',
    mobile: '',
    password: '',
    confirm: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleReset = () => {
    setFormData({ first: '', last: '', email: '', mobile: '', password: '', confirm: '' })
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return

    if (formData.password !== formData.confirm) {
      setError('Passwords do not match')
      setSuccess(null)
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log('Submitting registration for:', formData);
      const response = await fetch('http://localhost:5000/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.first,
          lastName: formData.last,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
          confirmPassword: formData.confirm,
        }),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Registration failed')
      }

      await response.json().catch(() => ({}))
      setSuccess('Account created. Verify the OTP sent to your device.')
      setPendingEmail(formData.email)
      setTimeout(() => {
        navigate('/verify-otp', {
          state: {
            email: formData.email,
            mobile: formData.mobile,
            name: `${formData.first} ${formData.last}`.trim(),
          },
        })
      }, 600)
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="signup-page">
      <div className="signup-glow" aria-hidden="true" />
      <div
        className="signup-glow signup-glow--orange"
        aria-hidden="true"
      />

      <div className="signup-shell">
        <div className="signup-card signup-card--hero">
          <span className="signup-badge">Create your account</span>
          <h1>Start using the Accounts Rental</h1>
          <p>
            Join the team with a quick sign up. Keep your contact details
            current so you never miss a notification.
          </p>
          <p className="signup-login-cta">
            Already registered?{' '}
            <a href="/login" className="signup-login-link">
              Go to Login
            </a>
          </p>
        </div>

        <div className="signup-card">
          <form className="signup-form" onSubmit={handleSubmit} onReset={handleReset}>
            <div>
              <label htmlFor="signup-first">First name</label>
              <input
                id="signup-first"
                name="first"
                type="text"
                placeholder="Alex"
                className="signup-field"
                value={formData.first}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="signup-last">Last name</label>
              <input
                id="signup-last"
                name="last"
                type="text"
                placeholder="Rivera"
                className="signup-field"
                value={formData.last}
                onChange={handleChange}
                required
              />
            </div>
            <div className="signup-full">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                placeholder="you@company.com"
                className="signup-field"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="signup-full">
              <label htmlFor="signup-mobile">Mobile</label>
              <input
                id="signup-mobile"
                name="mobile"
                type="tel"
                placeholder="+1 202 555 0148"
                className="signup-field"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="signup-field"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="signup-confirm">Re-enter password</label>
              <input
                id="signup-confirm"
                name="confirm"
                type="password"
                placeholder="••••••••"
                className="signup-field"
                value={formData.confirm}
                onChange={handleChange}
                required
              />
            </div>
            <div className="signup-actions">
              <button className="signup-btn" type="submit" disabled={loading}>
                {loading ? 'Submitting…' : 'Sign up'}
              </button>
              <button className="signup-btn signup-btn--ghost" type="reset">
                Clear form
              </button>
            </div>
            {error && (
              <p className="signup-message signup-message--error" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="signup-message signup-message--success" role="status">
                {success}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
