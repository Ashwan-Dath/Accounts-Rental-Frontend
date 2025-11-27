import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AuthContext'
import { AdminAuthShell } from './AdminAuthShell'

const OTP_LENGTH = 4

export default function AdminOtpVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, pendingEmail } = useAdminAuth()
  const emailFromState = (location.state as { email?: string })?.email ?? ''
  const email = pendingEmail || emailFromState
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('Enter the verification code we sent')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  function handleChange(index: number, value: string) {
    const next = value.replace(/\D/g, '').slice(-1)
    setOtp((prev) => {
      const copy = [...prev]
      copy[index] = next
      return copy
    })
    if (next && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return

    const code = otp.join('')
    if (code.length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit code`)
      return
    }

    setLoading(true)
    setError(null)
    setStatus('Verifying…')

    try {
      const response = await fetch('http://localhost:5000/admin/verifyOtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      })
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Invalid verification code')
      }
      const result = await response.json().catch(() => ({}))
      console.log("OTP verification response data:", result);
      const tokenFromResponse = result?.token || null
      if (!tokenFromResponse) throw new Error('Verification succeeded but token missing')
      const nameFromResponse = result?.admin?.fullName || 'Admin'
      login({ name: nameFromResponse, token: tokenFromResponse })
      setStatus('Verified! Redirecting…')
      setTimeout(() => navigate('/admin', { replace: true }), 500)
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Verification failed')
      setStatus('Enter the verification code we sent')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!email || resending || loading) return
    setResending(true)
    setError(null)
    setStatus('Sending a new code…')
    try {
      const response = await fetch('http://localhost:5000/admin/resendOtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Enter correct email')
      }
      const data = await response.json().catch(() => ({}))
      const confirmation =
        data?.message || data?.status || `OTP sent to ${email}. Please check your inbox.`
      setStatus(confirmation)
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Resend failed')
      setStatus('Enter the verification code we sent')
    } finally {
      setResending(false)
    }
  }

  if (!email) {
    return (
      <AdminAuthShell title="OTP expired" subtitle="Start from the admin login page to request a new code">
        <button type="button" className="admin-auth__submit" onClick={() => navigate('/admin/login')}>
          Back to login
        </button>
      </AdminAuthShell>
    )
  }

  return (
    <AdminAuthShell
      title="Enter verification code"
      subtitle={`We sent a ${OTP_LENGTH}-digit one-time password to ${email}`}
      helper={
        <p>
          Didn&apos;t receive it?{' '}
          <button
            type="button"
            className="admin-auth__link"
            onClick={handleResend}
            disabled={loading || resending}
          >
            Resend
          </button>
        </p>
      }
    >
      <form className="admin-auth__form" onSubmit={handleSubmit}>
        <div className="admin-auth__otp">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              inputMode="numeric"
              value={digit}
              ref={(el) => {
                inputsRef.current[index] = el
              }}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
            />
          ))}
        </div>
        {error && <p className="admin-auth__error">{error}</p>}
        {!error && status && <p className="admin-auth__status">{status}</p>}
        <button type="submit" className="admin-auth__submit" disabled={loading}>
          {loading ? 'Verifying…' : 'Verify & Continue'}
        </button>
      </form>
    </AdminAuthShell>
  )
}
