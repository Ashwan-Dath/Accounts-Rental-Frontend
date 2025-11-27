import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail } from 'react-icons/fi'
import { AdminAuthShell } from './AdminAuthShell'

export default function AdminForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate('/admin/verify-otp', { state: { email } })
  }

  return (
    <AdminAuthShell
      title="Forgot Password?"
      subtitle="Enter the email tied to your admin account and we will send a verification code"
      helper={
        <p>
          Remembered it? <Link to="/admin/login">Back to login</Link>
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
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </label>
        <button type="submit" className="admin-auth__submit">
          Send Code
        </button>
      </form>
    </AdminAuthShell>
  )
}
