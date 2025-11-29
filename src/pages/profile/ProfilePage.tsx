import React, { useEffect, useMemo, useState } from 'react'
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock } from 'react-icons/fi'
import { useUserAuth } from '../../context/AuthContext'
import { ProfileShell } from './ProfileShell'

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:5000'

type ProfileForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const EMPTY_FORM: ProfileForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

function normalizeProfile(payload: unknown): ProfileForm {
  const source =
    payload && typeof payload === 'object'
      ? ((payload as Record<string, unknown>).data as Record<string, unknown> | undefined) ||
        ((payload as Record<string, unknown>).user as Record<string, unknown> | undefined) ||
        (payload as Record<string, unknown>)
      : {}

  return {
    ...EMPTY_FORM,
    firstName: typeof source.firstName === 'string' ? source.firstName : '',
    lastName: typeof source.lastName === 'string' ? source.lastName : '',
    email: typeof source.email === 'string' ? source.email : '',
    phone: typeof source.phone === 'string' ? source.phone : '',
    address: typeof source.address === 'string' ? source.address : '',
    city: typeof source.city === 'string' ? source.city : '',
    state: typeof source.state === 'string' ? source.state : '',
    zipCode: typeof source.zipCode === 'string' ? source.zipCode : '',
  }
}

export default function ProfilePage() {
  const { token } = useUserAuth()
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM)
  const [loadedProfile, setLoadedProfile] = useState<ProfileForm | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    // Fetch current user profile so the form starts with saved data
    async function loadProfile() {
      if (!token) {
        setError('Please log in to view your profile.')
        setForm(EMPTY_FORM)
        return
      }

      setLoading(true)
      setError(null)
      setSuccess(null)

      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'Unable to load profile')
        }

        const payload = await response.json()
        const profile = normalizeProfile(payload)
        if (!ignore) {
          setForm(profile)
          setLoadedProfile(profile)
        }
      } catch (err) {
        if (!ignore) {
          const message = err instanceof Error ? err.message : 'Unable to load profile'
          setError(message)
          setForm(EMPTY_FORM)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadProfile()
    return () => {
      ignore = true
    }
  }, [token])

  const displayName = useMemo(() => {
    const fullName = `${form.firstName} ${form.lastName}`.trim()
    return fullName || form.email || 'User'
  }, [form.firstName, form.lastName, form.email])

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleReset() {
    if (loadedProfile) {
      setForm({ ...loadedProfile, currentPassword: '', newPassword: '', confirmPassword: '' })
      setError(null)
      setSuccess(null)
    } else {
      setForm(EMPTY_FORM)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!token) {
      setError('Please log in to update your profile.')
      return
    }

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('New password and confirm password do not match')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    const payload: Record<string, unknown> = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zipCode: form.zipCode.trim(),
    }

    if (form.newPassword) {
      payload.currentPassword = form.currentPassword
      payload.newPassword = form.newPassword
    }

    // Remove empty values so we don't overwrite with blanks
    Object.keys(payload).forEach((key) => {
      const value = payload[key]
      if (typeof value === 'string' && value.trim() === '') {
        delete payload[key]
      }
    })

    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Unable to update profile')
      }

      const body = await response.json()
      const updated = normalizeProfile(body?.user || body?.data || body)

      setForm({ ...updated, currentPassword: '', newPassword: '', confirmPassword: '' })
      setLoadedProfile(updated)
      setSuccess('Profile updated successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update profile'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProfileShell>
      <form className="profile-card profile-card--main" onSubmit={handleSubmit}>
        <header className="profile-card__header">
          <div>
            <h2>Profile Details</h2>
            <p>Keep these up to date so buyers can reach you.</p>
          </div>
          <div className="profile-summary">
            <div className="profile-summary__avatar">{displayName.slice(0, 1).toUpperCase()}</div>
            <div>
              <h3>{displayName}</h3>
              {form.email && <p>{form.email}</p>}
            </div>
          </div>
        </header>

        {loading && <p className="profile-status">Loading profile...</p>}
        {error && !loading && <p className="profile-status profile-status--error">{error}</p>}
        {success && !loading && <p className="profile-status profile-status--success">{success}</p>}

        <div className="profile-form-grid">
          <ProfileField
            name="firstName"
            icon={<FiUser />}
            label="First Name"
            placeholder="First name"
            value={form.firstName}
            onChange={handleChange}
            disabled={loading || saving}
            required
          />
          <ProfileField
            name="lastName"
            icon={<FiUser />}
            label="Last Name"
            placeholder="Last name"
            value={form.lastName}
            onChange={handleChange}
            disabled={loading || saving}
            required
          />
          <ProfileField
            name="email"
            icon={<FiMail />}
            label="Email Address"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            disabled={loading || saving}
            required
          />
          <ProfileField
            name="phone"
            icon={<FiPhone />}
            label="Phone Number"
            placeholder="+1 000 000 0000"
            value={form.phone}
            onChange={handleChange}
            disabled={loading || saving}
          />
          <ProfileField
            name="address"
            icon={<FiMapPin />}
            label="Address"
            placeholder="Street, area"
            value={form.address}
            onChange={handleChange}
            disabled={loading || saving}
          />
          <ProfileField
            name="city"
            icon={<FiMapPin />}
            label="City"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            disabled={loading || saving}
          />
          <ProfileField
            name="state"
            icon={<FiMapPin />}
            label="State"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
            disabled={loading || saving}
          />
          <ProfileField
            name="zipCode"
            icon={<FiMapPin />}
            label="ZIP / Postal Code"
            placeholder="12345"
            value={form.zipCode}
            onChange={handleChange}
            disabled={loading || saving}
          />
          <ProfileField
            name="currentPassword"
            icon={<FiLock />}
            label="Current Password"
            placeholder="Required to change password"
            type="password"
            value={form.currentPassword}
            onChange={handleChange}
            disabled={loading || saving}
          />
          <ProfileField
            name="newPassword"
            icon={<FiLock />}
            label="New Password"
            placeholder="New password"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            disabled={loading || saving}
          />
          <ProfileField
            name="confirmPassword"
            icon={<FiLock />}
            label="Confirm Password"
            placeholder="Confirm new password"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            disabled={loading || saving}
          />
        </div>

        <div className="profile-actions">
          <button type="submit" className="profile-primary-btn" disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" className="profile-secondary-btn" onClick={handleReset} disabled={saving || loading}>
            Reset
          </button>
        </div>
      </form>
    </ProfileShell>
  )
}

type ProfileFieldProps = {
  name: string
  label: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  placeholder?: string
  icon?: React.ReactNode
  type?: string
  disabled?: boolean
  required?: boolean
}

function ProfileField({
  name,
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = 'text',
  disabled,
  required,
}: ProfileFieldProps) {
  return (
    <label className="profile-field">
      <span>{label}</span>
      <div className="profile-field__input">
        {icon && <span className="profile-field__icon">{icon}</span>}
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoComplete="off"
        />
      </div>
    </label>
  )
}
