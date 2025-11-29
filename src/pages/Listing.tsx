import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { PublicAd } from '../types/ad'
import {
  formatDuration,
  formatPlatform,
  formatPrice,
  resolvePlatformImage,
  WHITE_PLACEHOLDER,
} from '../utils/adPresentation'

export default function Listing() {
  const { search } = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(search)
  const query = params.get('query')?.trim()
  const [ads, setAds] = useState<PublicAd[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let ignore = false
    async function loadAds() {
      setLoading(true)
      setError(null)
      try {
        const url = query
          ? `http://localhost:5000/public/allAds?query=${encodeURIComponent(query)}`
          : 'http://localhost:5000/public/allAds'
        const response = await fetch(url)
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'Unable to load ads')
        }
        const payload = await response.json()
        if (!ignore) {
          const list = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
            ? payload.data
            : []
          setAds(list as PublicAd[])
        }
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
  }, [query])
  
  const filteredAds = useMemo(() => {
    if (!query) return ads
    const lower = query.toLowerCase()
    return ads.filter((ad) => {
      const haystack = `${ad.title ?? ''} ${ad.description ?? ''}`.toLowerCase()
      return haystack.includes(lower)
    })
  }, [ads, query])

  return (
    <section className="listing-page-surface">
      <div className="page-container listing-page-container">
        <div className="listing-page">
          <h2>Listings</h2>
        {query ? (
          <p>
            Showing results for <strong>&ldquo;{query}&rdquo;</strong>
          </p>
        ) : (
          <p>Browse rentals, bundles, and accessories.</p>
        )}
        {loading && <p>Loading ads...</p>}
        {error && !loading && <p className="listing-error">{error}</p>}
        {!loading && !error && filteredAds.length === 0 && (
          <p>No ads found. Check back soon for new listings.</p>
        )}
        {!loading && !error && filteredAds.length > 0 && (
          <div className="listing-grid">
            {filteredAds.map((ad) => {
              const platformImage = resolvePlatformImage(ad.platform)
              return (
                <article key={ad._id} className="listing-card">
                  <div
                    className={`listing-card__media${
                      platformImage ? ' listing-card__media--logo' : ''
                    }`}
                  >
                    {platformImage && (
                      <img
                        src={platformImage}
                        alt={`${formatPlatform(ad.platform)} logo`}
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = WHITE_PLACEHOLDER
                        }}
                      />
                    )}
                  </div>
                  <p className="listing-card__eyebrow">{formatPlatform(ad.platform)}</p>
                  <h3 className="listing-card__title">{ad.title || 'Untitled ad'}</h3>
                  <p className="listing-card__text">
                    {ad.description || 'No description provided.'}
                  </p>
                  <p className="listing-card__meta">Duration: {formatDuration(ad.duration)}</p>
                  <div className="listing-card__footer">
                    <span className="listing-card__price">{formatPrice(ad.price)}</span>
                    <button
                      type="button"
                      className="listing-card__cta"
                      onClick={() => navigate(`/viewAd/${encodeURIComponent(ad._id)}`)}
                    >
                      View ad
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
        </div>
      </div>
    </section>
  )
}
