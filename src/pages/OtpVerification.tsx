import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUserAuth } from '../context/AuthContext'

const OTP_LENGTH = 6

type LocationState = {
  email?: string
  mobile?: string
  name?: string
}

export default function OtpVerification() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login, pendingEmail } = useUserAuth()
  const locationState = (location.state as LocationState) || {}
  const { mobile = '', name = 'New user' } = locationState
  const email = pendingEmail || locationState.email || ''
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('Enter the verification code we sent')
  const [loading, setLoading] = useState(false)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    inputsRef.current[0]?.focus()
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

  const handleChange = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, '')
    if (!sanitized) {
      setOtp((prev) => {
        const next = [...prev]
        next[index] = ''
        return next
      })
      return
    }

    const nextDigit = sanitized[0]
    setOtp((prev) => {
      const next = [...prev]
      next[index] = nextDigit
      return next
    })

    if (index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return

    const code = otp.join('')
    if (code.length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit code`)
      return
    }

    setLoading(true)
    setError(null)
    setStatus('Verifying...')

    try {
      const response = await fetch('http://localhost:5000/users/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mobile, otp: code }),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Invalid code')
      }

      const result = await response.json().catch(() => ({}))
      login({
        name: result?.name || name,
        token: result?.token,
      })
      setStatus('Verified! Redirecting...')
      setTimeout(() => navigate('/', { replace: true }), 600)
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Verification failed')
      setStatus('Enter the verification code we sent')
    } finally {
      setLoading(false)
    }
  }

  function resendCode() {
    setStatus('Sending a new code…')
    setTimeout(() => {
      setStatus('We sent a new code. Check your messages.')
    }, 1000)
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
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                ref={(el) => {
                  inputsRef.current[index] = el
                }}
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
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
            <button type="button" className="profile-secondary-btn otp-resend-btn" onClick={resendCode} disabled={loading}>
              Resend code
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
