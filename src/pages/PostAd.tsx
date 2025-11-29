import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUserAuth } from '../context/AuthContext'

type PlatformOption = {
  _id?: string
  id?: string
  category?: string
  platform: string
}

const TIME_UNITS = [
  { value: 'hour', label: 'Hour(s)' },
  { value: 'day', label: 'Day(s)' },
  { value: 'week', label: 'Week(s)' },
  { value: 'month', label: 'Month(s)' },
  { value: 'year', label: 'Year(s)' },
]

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:5000'

export default function PostAd() {
  const { token } = useUserAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const adFromState = (location.state as { ad?: any } | undefined)?.ad
  const query = useMemo(() => new URLSearchParams(location.search), [location.search])
  const selectedAdId = useMemo(
    () => adFromState?._id || query.get('adId') || '',
    [adFromState?._id, query],
  )
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    platformId: '',
    durationValue: '',
    durationUnit: TIME_UNITS[0].value,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [platforms, setPlatforms] = useState<PlatformOption[]>([])
  const [platformLoading, setPlatformLoading] = useState(false)
  const [platformError, setPlatformError] = useState<string | null>(null)
  const isEditing = Boolean(selectedAdId)

  useEffect(() => {
    // Pull platforms so the user can select where the ad belongs
    async function loadPlatforms() {
      setPlatformLoading(true)
      setPlatformError(null)
      try {
        const response = await fetch(`${API_BASE_URL}/public/categories`)
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'Unable to load platforms')
        }
        const payload = await response.json()
        if (payload?.success === false && payload?.message) {
          throw new Error(payload.message)
        }
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : []
        setPlatforms(list as PlatformOption[])
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load platforms'
        setPlatformError(message)
        setPlatforms([])
      } finally {
        setPlatformLoading(false)
      }
    }

    loadPlatforms()
  }, [])

  useEffect(() => {
    if (!selectedAdId || !token) return

    let ignore = false
    // Prefill the form when editing an existing ad
    async function loadAdForEdit() {
      setError(null)
      try {
        // Use state if available to avoid extra network
        if (adFromState && !ignore) {
          const ad = adFromState
          setForm({
            title: ad.title || '',
            description: ad.description || '',
            price: ad.price != null ? String(ad.price) : '',
            platformId:
              typeof ad.platform === 'string'
                ? ad.platform
                : ad.platform?._id || ad.platform?.id || '',
            durationValue: ad.duration?.value != null ? String(ad.duration.value) : '',
            durationUnit: ad.duration?.unit || TIME_UNITS[0].value,
          })
          return
        }

        const response = await fetch(`${API_BASE_URL}/users/ads/${encodeURIComponent(selectedAdId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'Unable to load ad')
        }
        const payload = await response.json()
        const ad = payload?.data || payload?.ad || payload
        if (!ignore && ad) {
          setForm({
            title: ad.title || '',
            description: ad.description || '',
            price: ad.price != null ? String(ad.price) : '',
            platformId:
              typeof ad.platform === 'string'
                ? ad.platform
                : ad.platform?._id || ad.platform?.id || '',
            durationValue: ad.duration?.value != null ? String(ad.duration.value) : '',
            durationUnit: ad.duration?.unit || TIME_UNITS[0].value,
          })
        }
      } catch (err) {
        if (!ignore) {
          const message = err instanceof Error ? err.message : 'Unable to load ad'
          setError(message)
        }
      }
    }

    loadAdForEdit()
    return () => {
      ignore = true
    }
  }, [selectedAdId, token, adFromState])

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setError(null)
    setSuccess(null)

    if (!token) {
      setError('Login to post an ad.')
      return
    }

    if (!form.platformId) {
      setError('Select a platform')
      return
    }
    if (!form.durationValue) {
      setError('Enter a duration value')
      return
    }

    // Shape payload for both create and update
    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      platform: form.platformId,
      duration: {
        value: Number(form.durationValue),
        unit: form.durationUnit,
      },
    }

    setSubmitting(true)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const endpoint = isEditing
        ? `${API_BASE_URL}/users/ads/${encodeURIComponent(selectedAdId)}`
        : `${API_BASE_URL}/users/postAd`
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Unable to submit ad')
      }
      await response.json().catch(() => ({}))
      setSuccess(isEditing ? 'Ad updated successfully.' : 'Ad submitted! We will review it shortly.')
      if (!isEditing) {
        setForm((prev) => ({
          ...prev,
          title: '',
          description: '',
          price: '',
          durationValue: '',
          platformId: '',
        }))

      } else {
        navigate('/ads')
      }
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="post-ad-page">
      <div className="post-ad-shell">
        <header className="post-ad-hero">
          <p className="post-ad-pill">{isEditing ? 'Edit' : 'Create'}</p>
          <h1>{isEditing ? 'Edit your ad' : 'Post an ad'}</h1>
          <p>Share your latest listing with the Nextpage community in just a few clicks.</p>
        </header>

        <form className="post-ad-form" onSubmit={handleSubmit}>
          <label>
            Title
            <input
              name="title"
              type="text"
              placeholder="Give your ad a name"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              placeholder="Describe what you are offering"
              rows={4}
              value={form.description}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Price
            <input
              name="price"
              type="number"
              placeholder="Enter price"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />
          </label>
            <label>
              Platform
              <select
              className="input-select"
                name="platformId"
                value={form.platformId}
                onChange={handleChange}
                required
                disabled={platformLoading || platforms.length === 0}
            >
              <option value="">
                {platformLoading ? 'Loading platforms...' : 'Select platform'}
              </option>
              {platforms.map((platform) => (
                <option key={platform._id || platform.id || platform.platform} value={platform._id || platform.id || platform.platform}>
                  {platform.platform}
                  {platform.category ? ` (${platform.category})` : ''}
                </option>
              ))}
            </select>
          </label>
          {platformError && <p className="post-ad-error">{platformError}</p>}
          <label>
            Time
            <div className="post-ad-duration">
              <input
                name="durationValue"
                type="number"
                min="1"
                placeholder="Enter duration"
                value={form.durationValue}
                onChange={handleChange}
                required
              />
              <select
                name="durationUnit"
                value={form.durationUnit}
                onChange={handleChange}
              className="input-select"
              >
                {TIME_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </label>
          {error && <p className="post-ad-error">{error}</p>}
          {success && <p className="post-ad-success">{success}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit ad'}
          </button>
        </form>
      </div>
    </section>
  )
}
