import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProfileShell } from './ProfileShell'
import { useUserAuth } from '../../context/AuthContext'

type UserAd = {
  _id: string
  title: string
  description?: string
  price?: number
  isActive?: boolean
  platform?: string | { platform?: string }
  duration?: { value?: number; unit?: string }
}

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:5000'

export default function AdsPage() {
  const { token } = useUserAuth()
  const navigate = useNavigate()
  const [ads, setAds] = useState<UserAd[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    // Load the current user's ads from the API so they can manage them
    async function loadAds() {
      if (!token) {
        setError('Please log in to view your ads.')
        return
      }

      setLoading(true)
      setError(null)
      setActionMessage(null)

      try {
        const response = await fetch(`${API_BASE_URL}/users/ads/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'Unable to load ads')
        }
        const payload = await response.json()
        const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
        if (!ignore) setAds(list as UserAd[])
      } catch (err) {
        if (!ignore) {
          const message = err instanceof Error ? err.message : 'Unable to load ads'
          setError(message)
          setAds([])
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadAds()
    return () => {
      ignore = true
    }
  }, [token])

  async function handleDelete(ad: UserAd) {
    if (!token) return
    // Soft-delete by turning the ad inactive after confirmation
    const confirmDelete = window.confirm(`Do you want to delete "${ad.title}"?`)
    if (!confirmDelete) return

    try {
      const response = await fetch(`${API_BASE_URL}/users/ads/${encodeURIComponent(ad._id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Unable to delete ad')
      }
      setAds((prev) =>
        prev.map((item) => (item._id === ad._id ? { ...item, isActive: false } : item)),
      )
      setActionMessage(`"${ad.title}" was deactivated`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete ad'
      setError(message)
    }
  }

  function handleEdit(ad: UserAd) {
    if (ad.isActive === false) return
    // Send the user to the form with the ad prefilled for editing
    navigate(`/post-ad?adId=${encodeURIComponent(ad._id)}`, { state: { ad } })
  }

  return (
    <ProfileShell>
      <div className="profile-panel">
        <header className="profile-panel__header">
          <div>
            <h2>Your ads</h2>
            <p>Manage or pause your live listings.</p>
          </div>
          <button type="button" className="profile-primary-btn" onClick={() => navigate('/post-ad')}>
            Create Listing
          </button>
        </header>

        {loading && <p className="profile-status">Loading ads...</p>}
        {error && !loading && <p className="profile-status profile-status--error">{error}</p>}
        {actionMessage && !loading && !error && (
          <p className="profile-status profile-status--success">{actionMessage}</p>
        )}

        {!loading && !error && ads.length === 0 && (
          <p className="profile-status">You have not posted any ads yet.</p>
        )}

        {!loading && !error && ads.length > 0 && (
          <div className="profile-list">
            {ads.map((ad) => {
              const isInactive = ad.isActive === false
              const platformLabel =
                typeof ad.platform === 'string'
                  ? ad.platform
                  : ad.platform?.platform || 'Platform'
              return (
                <article
                  key={ad._id}
                  className={`profile-list-card${isInactive ? ' profile-list-card--disabled' : ''}`}
                  aria-disabled={isInactive}
                  style={isInactive ? { pointerEvents: 'none', opacity: 0.6 } : undefined}
                >
                  <div>
                    <h3>{ad.title || 'Untitled ad'}</h3>
                    <p>
                      {platformLabel} • {ad.price !== undefined ? `$${ad.price}` : 'Price not set'} •{' '}
                      {isInactive ? 'Inactive' : 'Active'}
                    </p>
                  </div>
                  <div className="profile-list-card__actions">
                    <button
                      type="button"
                      className="profile-secondary-btn"
                      onClick={() => handleEdit(ad)}
                      disabled={isInactive}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="profile-secondary-btn"
                      onClick={() => handleDelete(ad)}
                      disabled={isInactive}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </ProfileShell>
  )
}
