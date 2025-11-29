import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { PublicAd } from '../types/ad'
import {
  formatDuration,
  formatPlatform,
  formatPrice,
  resolvePlatformImage,
  WHITE_PLACEHOLDER,
} from '../utils/adPresentation'
import { useUserAuth } from '../context/AuthContext'

type SellerDetails = {
  name?: string
  email?: string
  mobile?: string
}

function pickAdFromPayload(payload: unknown): PublicAd | null {
  if (!payload || typeof payload !== 'object') return null
  const container = payload as Record<string, unknown>

  const dataValue =
    'data' in container && typeof container['data'] === 'object' && !Array.isArray(container['data'])
      ? container['data']
      : null
  const adValue =
    'ad' in container && typeof container['ad'] === 'object' && !Array.isArray(container['ad'])
      ? container['ad']
      : null

  const candidate =
    dataValue ?? adValue ?? (!Array.isArray(payload) ? (payload as Record<string, unknown>) : null)

  return candidate && typeof candidate === 'object' && !Array.isArray(candidate)
    ? (candidate as PublicAd)
    : null
}

function toRecord(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null
  return payload as Record<string, unknown>
}

function pickSellerDetails(payload: unknown): SellerDetails | null {
  const container = toRecord(payload)
  if (!container) return null

  const dataRecord = 'data' in container ? toRecord(container['data']) : null
  const posterRecord = dataRecord && 'poster' in dataRecord ? toRecord(dataRecord['poster']) : null
  const nestedPoster = 'poster' in container ? toRecord(container['poster']) : null
  const userRecord = 'user' in container ? toRecord(container['user']) : null
  const detailsRecord = 'details' in container ? toRecord(container['details']) : null

  const candidates = [
    posterRecord,
    nestedPoster,
    detailsRecord,
    userRecord,
    dataRecord,
    container,
  ].filter(Boolean) as Record<string, unknown>[]

  for (const candidate of candidates) {
    const name =
      typeof candidate.name === 'string'
        ? candidate.name
        : typeof candidate.fullName === 'string'
        ? candidate.fullName
        : (() => {
            const first =
              typeof candidate.firstName === 'string' ? candidate.firstName.trim() : ''
            const last = typeof candidate.lastName === 'string' ? candidate.lastName.trim() : ''
            const full = `${first} ${last}`.trim()
            return full || undefined
          })()

    const email =
      typeof candidate.email === 'string'
        ? candidate.email
        : typeof candidate.mail === 'string'
        ? candidate.mail
        : undefined

    const mobile =
      typeof candidate.mobile === 'string'
        ? candidate.mobile
        : typeof candidate.phone === 'string'
        ? candidate.phone
        : typeof candidate.phoneNumber === 'string'
        ? candidate.phoneNumber
        : typeof candidate.contactNumber === 'string'
        ? candidate.contactNumber
        : undefined

    if (name || email || mobile) {
      return { name, email, mobile }
    }
  }

  return null
}

export default function ViewAd() {
  const { adId } = useParams<{ adId: string }>()
  const navigate = useNavigate()
  const { token } = useUserAuth()
  const [ad, setAd] = useState<PublicAd | null>(null)
  const [loading, setLoading] = useState(Boolean(adId))
  const [error, setError] = useState<string | null>(
    adId ? null : 'Missing ad identifier. Please return to the listings page.'
  )
  const [contactDetails, setContactDetails] = useState<SellerDetails | null>(null)
  const [contactError, setContactError] = useState<string | null>(null)
  const [contactLoading, setContactLoading] = useState(false)

  useEffect(() => {
    setContactDetails(null)
    setContactError(null)
    setContactLoading(false)
    if (!adId) return
    let ignore = false
    async function fetchAd() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('http://localhost:5000/ads/getAdbyId', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ adId }),
        })
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'Unable to load ad')
        }
        const payload = await response.json()
        const record = pickAdFromPayload(payload)

        if (!ignore) {
          if (record) {
            setAd(record)
          } else {
            setError('Ad not found. It may have been removed.')
          }
        }
      } catch (err) {
        if (!ignore) {
          const message = err instanceof Error ? err.message : 'Unable to load ad'
          setError(message)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchAd()
    return () => {
      ignore = true
    }
  }, [adId])

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/listing')
    }
  }

  async function handleContactSeller() {
    if (!adId) {
      setContactError('Missing ad identifier. Please return to the listings page.')
      setContactDetails(null)
      return
    }
    if (!token) {
      setContactError('Login to see the details')
      setContactDetails(null)
      return
    }
    setContactLoading(true)
    setContactError(null)
    setContactDetails(null)
    try {
      const response = await fetch('http://localhost:5000/ads/getDetailsById', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adId }),
      })
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Unable to load seller details')
      }
      const payload = await response.json()
      const details = pickSellerDetails(payload)
      if (details) {
        setContactDetails(details)
      } else {
        setContactError('Seller contact details are unavailable.')
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load seller contact details'
      setContactError(message)
      setContactDetails(null)
    } finally {
      setContactLoading(false)
    }
  }

  const platformImage = ad ? resolvePlatformImage(ad.platform) : undefined

  return (
    <section className="view-ad-surface">
      <div className="page-container view-ad-container">
        <button type="button" className="view-ad-back" onClick={handleBack}>
          ← Back to listings
        </button>

        {loading && <p className="view-ad-status">Loading ad details…</p>}

        {!loading && error && (
          <div className="view-ad-status view-ad-status--error">
            <p>{error}</p>
            <button
              type="button"
              className="view-ad-status__action"
              onClick={() => navigate('/listing')}
            >
              Browse listings
            </button>
          </div>
        )}

        {!loading && !error && ad && (
          <article className="view-ad-card">
            <div
              className={`view-ad-card__media${platformImage ? ' view-ad-card__media--logo' : ''}`}
            >
              {platformImage ? (
                <img
                  src={platformImage}
                  alt={`${formatPlatform(ad.platform)} logo`}
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = WHITE_PLACEHOLDER
                  }}
                />
              ) : (
                <span className="view-ad-card__media-text">{formatPlatform(ad.platform)}</span>
              )}
            </div>
            <div className="view-ad-card__content">
              <p className="view-ad-card__platform">{formatPlatform(ad.platform)}</p>
              <h1 className="view-ad-card__title">{ad.title || 'Untitled ad'}</h1>
              <p className="view-ad-card__description">
                {ad.description || 'This ad does not include a description yet.'}
              </p>
              <dl className="view-ad-card__details">
                <div className="view-ad-card__detail">
                  <dt>Price</dt>
                  <dd>{formatPrice(ad.price)}</dd>
                </div>
                <div className="view-ad-card__detail">
                  <dt>Duration</dt>
                  <dd>{formatDuration(ad.duration)}</dd>
                </div>
                <div className="view-ad-card__detail">
                  <dt>Platform</dt>
                  <dd>{formatPlatform(ad.platform)}</dd>
                </div>
              </dl>
              <div className="view-ad-card__actions">
                <button type="button" className="view-ad-card__cta" onClick={handleContactSeller}>
                  Contact seller
                </button>
                <button
                  type="button"
                  className="view-ad-card__secondary"
                  onClick={() => navigate('/listing')}
                >
                  Explore more ads
                </button>
              </div>
              {(contactLoading || contactError || contactDetails) && (
                <div className="view-ad-contact">
                  {contactLoading && (
                    <p className="view-ad-contact__status">Fetching seller details…</p>
                  )}
                  {contactError && <p className="view-ad-contact__error">{contactError}</p>}
                  {contactDetails && (
                    <dl className="view-ad-contact__details">
                      {contactDetails.name && (
                        <div className="view-ad-contact__details-row">
                          <dt>Name</dt>
                          <dd>{contactDetails.name}</dd>
                        </div>
                      )}
                      {contactDetails.email && (
                        <div className="view-ad-contact__details-row">
                          <dt>Email</dt>
                          <dd>{contactDetails.email}</dd>
                        </div>
                      )}
                      {contactDetails.mobile && (
                        <div className="view-ad-contact__details-row">
                          <dt>Mobile</dt>
                          <dd>{contactDetails.mobile}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                </div>
              )}
            </div>
          </article>
        )}
      </div>
    </section>
  )
}
