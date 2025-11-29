import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUserAuth } from '../context/AuthContext'

const OTP_LENGTH = 4
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:5000'

type LocationState = {
  email?: string
  mobile?: string
  name?: string
}

export default function OtpVerification() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login, pendingEmail, setPendingEmail } = useUserAuth()
  const locationState = (location.state as LocationState) || {}
  const { mobile = '', name = 'New user' } = locationState
  const email = pendingEmail || locationState.email || ''
  const [otpValue, setOtpValue] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('Enter the verification code we sent')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  if (!email && !mobile) {
    return (
      <section className="otp-page">
        <div className="otp-card">
          <h1>Verification expired</h1>
          <p>Please start from the sign up page so we can send you a new code.</p>
          <button type="button" className="profile-primary-btn" onClick={() => navigate('/signup')}>
            Back to Sign Up
          </button>
        </div>
      </section>
    )
  }

  const handleChange = (value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, OTP_LENGTH)
    setOtpValue(sanitized)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return

    const code = otpValue
    if (code.length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit code`)
      return
    }

    setLoading(true)
    setError(null)
    setStatus('Verifying...')

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verifyOtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mobile, otp: code }),
      })

      if (!response.ok) {
        let payload: any = {}
        try {
          payload = await response.json()
        } catch {
          const message = await response.text()
          throw new Error(message || 'Enter a valid OTP')
        }
        const friendly =
          payload?.message ||
          payload?.error ||
          payload?.reason ||
          (response.status === 400 ? 'Enter a valid OTP' : 'Verification failed')
        throw new Error(friendly)
      }

      const result = await response.json().catch(() => ({}))
      login({
        name:
          result?.name ||
          result?.user?.firstName ||
          result?.data?.firstName ||
          name,
        token: result?.token,
      })
      setPendingEmail(null)
      setStatus('Verified! Redirecting...')
      setTimeout(() => navigate('/', { replace: true }), 600)
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Enter a valid OTP')
      setStatus('Enter the verification code we sent')
    } finally {
      setLoading(false)
    }
  }

  async function resendCode() {
    setLoading(true)
    setError(null)
    setStatus('Sending a new code…')
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resendOtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Unable to resend code')
      }
      setStatus('We sent a new code. Check your messages.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resend code')
      setStatus('Enter the verification code we sent')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="otp-page">
      <div className="otp-shell">
        <div>
          <p className="otp-eyebrow">Secure Sign Up</p>
          <h1>Enter the one-time passcode</h1>
          <p className="otp-subtitle">
            We sent a {OTP_LENGTH}-digit code to <strong>{email || mobile}</strong>. Enter it below to complete your
            registration.
          </p>
        </div>

        <form className="otp-form" onSubmit={handleSubmit}>
          <div className="otp-inputs otp-inputs--single">
            <input
              type="text"
              inputMode="numeric"
              maxLength={OTP_LENGTH}
              value={otpValue}
              onChange={(event) => handleChange(event.target.value)}
              ref={inputRef}
              aria-label="OTP code"
              className="otp-single-input"
              placeholder="____"
            />
          </div>

          {error && (
            <p className="otp-message otp-message--error" role="alert">
              {error}
            </p>
          )}
          {status && !error && (
            <p className="otp-message" role="status">
              {status}
            </p>
          )}

          <div className="otp-actions">
            <button type="submit" className="profile-primary-btn otp-submit" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </button>
            <button
              type="button"
              className="profile-secondary-btn otp-resend-btn"
              onClick={resendCode}
              disabled={loading}
            >
              Resend code
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
