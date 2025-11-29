import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import heroImg from '../assets/home-hero.svg'
import type { PublicAd } from '../types/ad'
import {
  formatDuration,
  formatPlatform,
  formatPrice,
  resolvePlatformImage,
  WHITE_PLACEHOLDER,
} from '../utils/adPresentation'

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:5000'

type AdSectionKey = 'day' | 'week' | 'month' | 'year'

type AdSectionConfig = {
  key: AdSectionKey
  heading: string
  endpoint: string
  responseKey?: string
  emptyMessage: string
}

type AdSectionState = Record<
  AdSectionKey,
  {
    ads: PublicAd[]
    loading: boolean
    error: string | null
  }
>

const AD_SECTIONS: AdSectionConfig[] = [
  {
    key: 'day',
    heading: 'Day wise Ads',
    endpoint: '/public/dayAds',
    responseKey: 'dayAds',
    emptyMessage: 'No ads posted for day wise ads.',
  },
  {
    key: 'week',
    heading: 'Week wise Ads',
    endpoint: '/public/weekAds',
    responseKey: 'weekAds',
    emptyMessage: 'No ads posted for week wise ads.',
  },
  {
    key: 'month',
    heading: 'Month wise Ads',
    endpoint: '/public/monthAds',
    responseKey: 'monthAds',
    emptyMessage: 'No ads posted for month wise ads.',
  },
  {
    key: 'year',
    heading: 'Year wise Ads',
    endpoint: '/public/yearAds',
    responseKey: 'yearAds',
    emptyMessage: 'No ads posted for year wise ads.',
  },
]

function createInitialState(): AdSectionState {
  return AD_SECTIONS.reduce((acc, section) => {
    acc[section.key] = {
      ads: [],
      loading: true,
      error: null,
    }
    return acc
  }, {} as AdSectionState)
}

function pickAdsFromPayload(payload: unknown, responseKey?: string): PublicAd[] {
  if (Array.isArray(payload)) {
    return payload as PublicAd[]
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    const candidates = [
      responseKey,
      'data',
      'ads',
      'items',
      'results',
      'list',
      ...(responseKey ? [`${responseKey}List`] : []),
    ].filter(Boolean) as string[]

    for (const key of candidates) {
      const value = record[key]
      if (Array.isArray(value)) {
        return value as PublicAd[]
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const nested = value as Record<string, unknown>
        if (Array.isArray(nested.data)) {
          return nested.data as PublicAd[]
        }
      }
    }
  }

  return []
}


export default function Home() {
  const navigate = useNavigate()
  const [sections, setSections] = useState<AdSectionState>(createInitialState)

  useEffect(() => {
    let cancelled = false

    AD_SECTIONS.forEach((section) => {
      const run = async () => {
        setSections((prev) => ({
          ...prev,
          [section.key]: {
            ...prev[section.key],
            loading: true,
            error: null,
          },
        }))
        try {
          const url = section.endpoint.startsWith('http')
            ? section.endpoint
            : `${API_BASE_URL}${section.endpoint}`
          const response = await fetch(url)
          if (!response.ok) {
            const message = await response.text()
            throw new Error(message || 'Unable to load ads')
          }
          const payload = await response.json()
          const ads = pickAdsFromPayload(payload, section.responseKey)
          if (!cancelled) {
            setSections((prev) => ({
              ...prev,
              [section.key]: {
                ads,
                loading: false,
                error: null,
              },
            }))
          }
        } catch (err) {
          if (!cancelled) {
            const message = err instanceof Error ? err.message : 'Unable to load ads'
            setSections((prev) => ({
              ...prev,
              [section.key]: {
                ads: [],
                loading: false,
                error: message,
              },
            }))
          }
        }
      }

      run()
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="home-page">
      <div className="page-container">
        <div className="home-inner">
          <section className="home-hero">
            <div className="home-hero-copy">
              <span>Ad placements</span>
              <h1>Curated ad slots across the platforms that matter.</h1>
              <p>
                Find vetted inventory on YouTube, Netflix, Hotstar, and more. Compare formats,
                durations, and rates, then book your campaign in a few clicks with everything synced
                to your account.
              </p>
              <div className="hero-actions">
                <Link to="/signup" className="hero-btn primary">
                  Sign up free
                </Link>
                <Link to="/listing" className="hero-btn secondary">
                  Browse catalog
                </Link>
              </div>
            </div>
            <div className="home-carousel">
              <img src={heroImg} alt="Workspace inspiration" />
              <div className="hero-dots">
                <div className="hero-dot active" />
                <div className="hero-dot" />
                <div className="hero-dot" />
                <div className="hero-dot" />
              </div>
            </div>
          </section>

          {/* <section className="home-categories">
            <div className="home-categories-header">
              <strong>Explore by category</strong>
              <span>Pick a lane to filter faster</span>
            </div>
            <div className="category-grid">
              {categories.map((category) => (
                <article key={category.title} className="category-pill">
                  <h4>{category.title}</h4>
                  <p>{category.description}</p>
                </article>
              ))}
            </div>
          </section> */}

          {AD_SECTIONS.map((section) => {
            const sectionState = sections[section.key]
            return (
              <section key={section.key} className="home-section ads-section">
                <div className="section-header">
                  <h3>{section.heading}</h3>
                  <Link to="/listing" className="view-link">
                    View all
                  </Link>
                </div>
                {sectionState.loading && (
                  <p className="ads-section__status">Loading {section.heading.toLowerCase()}...</p>
                )}
                {!sectionState.loading && sectionState.error && (
                  <p className="ads-section__status ads-section__status--error">
                    {sectionState.error}
                  </p>
                )}
                {!sectionState.loading && !sectionState.error && sectionState.ads.length === 0 && (
                  <p className="ads-section__empty">{section.emptyMessage}</p>
                )}
                {!sectionState.loading && !sectionState.error && sectionState.ads.length > 0 && (
                  <div className="ads-grid">
                    {sectionState.ads.map((ad) => {
                      const logo = resolvePlatformImage(ad.platform)
                      const platformLabel = formatPlatform(ad.platform)
                      return (
                        <article key={ad._id ?? `${section.key}-${ad.title}`} className="ad-card">
                          <div
                            className={`ad-card__logo${
                              logo ? ' ad-card__logo--image' : ' ad-card__logo--placeholder'
                            }`}
                          >
                            {logo ? (
                              <img
                                src={logo}
                                alt={`${platformLabel} logo`}
                                onError={(e) => {
                                  e.currentTarget.onerror = null
                                  e.currentTarget.src = WHITE_PLACEHOLDER
                                }}
                              />
                            ) : (
                              <span>{platformLabel.slice(0, 1) || '?'}</span>
                            )}
                          </div>
                          <p className="ad-card__eyebrow">{platformLabel}</p>
                          <h4 className="ad-card__title">{ad.title || 'Untitled ad'}</h4>
                          <p className="ad-card__text">
                            {ad.description || 'No description provided.'}
                          </p>
                          <p className="ad-card__meta">
                            Duration: {formatDuration(ad.duration)}
                          </p>
                          <div className="ad-card__footer">
                            <span className="ad-card__price">{formatPrice(ad.price)}</span>
                            <button
                              type="button"
                              className="ad-card__cta"
                              disabled={!ad._id}
                              onClick={() => ad._id && navigate(`/viewAd/${encodeURIComponent(ad._id)}`)}
                            >
                              View ad
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>
            )
          })}

          <section className="home-cta">
            <div className="cta-content">
              <h3>Ready to Rent an Account?</h3>
              <p>
                Want to rent an account? Log in or create an account — the option is right next to you.
              </p>
              {/* <p>
                Login or create an account to sync carts across devices and unlock concierge support
                for office moves.
              </p> */}
            </div>
            <div className="cta-actions">
              <Link to="/signup" className="hero-btn primary">
                Sign up free
              </Link>
              <Link to="/login" className="hero-btn secondary">
                Login
              </Link>
            </div>
          </section>

          {/* <section className="home-footer">
            <div>
              <h5>Nextpage</h5>
              <p>Gear that keeps up with your ambition.</p>
              <p>Built with the same crisp feel as our login and signup flows.</p>
            </div>
            <div>
              <h5>Support</h5>
              <a href="#account">Account</a>
              <br />
              <a href="#membership">Membership</a>
              <br />
              <a href="#help">Help center</a>
            </div>
            <div>
              <h5>Company</h5>
              <a href="#about">About</a>
              <br />
              <a href="#careers">Careers</a>
              <br />
              <a href="#press">Press</a>
            </div>
            <div>
              <h5>Stay in touch</h5>
              <p>support@nextpage.com</p>
              <p>+1 202 555 0148</p>
              <p>Live chat</p>
            </div>
          </section> */}
        </div>
      </div>
    </div>
  )
}
