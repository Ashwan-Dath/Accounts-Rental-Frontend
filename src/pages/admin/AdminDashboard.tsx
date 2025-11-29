import React, { useEffect, useMemo, useState } from 'react'
import { useAdminAuth } from '../../context/AuthContext'

type DashboardSummary = {
  users: number | null
  platforms: number | null
  ads: number | null
  adsByPlatform: { name: string; count: number }[]
}

const API_ROOT = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:5000'

function toNumberOrNull(value: unknown): number | null {
  return typeof value === 'number' && !Number.isNaN(value) ? value : null
}

function normalizeAnalytics(payload: unknown): DashboardSummary {
  const container =
    payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {}
  const data =
    container.data && typeof container.data === 'object'
      ? (container.data as Record<string, unknown>)
      : container

  const adsByPlatformRaw = Array.isArray(data.adsByPlatform) ? data.adsByPlatform : []

  const adsByPlatform = adsByPlatformRaw
    .map((item: any) => ({
      name:
        typeof item?.name === 'string'
          ? item.name
          : typeof item?.platformName === 'string'
          ? item.platformName
          : 'Unknown platform',
      count: typeof item?.count === 'number' && !Number.isNaN(item.count) ? item.count : 0,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)

  return {
    users: toNumberOrNull(data.users),
    platforms: toNumberOrNull(data.platforms),
    ads: toNumberOrNull(data.ads),
    adsByPlatform,
  }
}

export default function AdminDashboard() {
  const { token } = useAdminAuth()
  const [summary, setSummary] = useState<DashboardSummary>({
    users: null,
    platforms: null,
    ads: null,
    adsByPlatform: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function load() {
      setLoading(true)
      setError(null)

      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      try {
        const response = await fetch(`${API_ROOT}/admin/analytics/summary`, { headers })
        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'Unable to load dashboard data')
        }
        const payload = await response.json()
        if (!ignore) {
          setSummary(normalizeAnalytics(payload))
        }
      } catch (err) {
        if (!ignore) {
          const message = err instanceof Error ? err.message : 'Unable to load dashboard data'
          setError(message)
          setSummary((prev) => ({ ...prev, adsByPlatform: [] }))
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()

    return () => {
      ignore = true
    }
  }, [token])

  const maxPlatformCount = useMemo(() => {
    if (!summary.adsByPlatform.length) return 1
    return Math.max(...summary.adsByPlatform.map((item) => item.count))
  }, [summary.adsByPlatform])

  const statCards = [
    { label: 'Users', value: summary.users, helper: 'Registered accounts' },
    { label: 'Platforms', value: summary.platforms, helper: 'Ad-ready platforms' },
    { label: 'Ads', value: summary.ads, helper: 'Listed placements' },
  ]

  return (
    <section className="admin-dashboard">
      {/* <div className="admin-dashboard__hero">
        <p className="admin-dashboard__eyebrow">Control Center</p>
        <h1>Admin Dashboard</h1>
        <p>Stay on top of users, platforms, and live ads in one glance.</p>
      </div> */}

      <div className="admin-dashboard__stats">
        {statCards.map((card) => (
          <article key={card.label} className="admin-dashboard__stat">
            <p className="admin-dashboard__stat-label">{card.label}</p>
            <p className="admin-dashboard__stat-value">
              {loading && card.value === null ? 'Loading...' : card.value ?? 'N/A'}
            </p>
            <p className="admin-dashboard__stat-helper">{card.helper}</p>
          </article>
        ))}
      </div>

      <div className="content-card admin-dashboard__analytics">
        <div className="admin-dashboard__analytics-header">
          <div>
            <p className="admin-dashboard__eyebrow">Analytics</p>
            <h2>Ads by platform</h2>
            <p className="admin-dashboard__helper">
              Distribution of ads across platforms to spot where inventory lives.
            </p>
          </div>
          {loading && <span className="admin-dashboard__pill">Refreshing</span>}
        </div>

        {error && <p className="admin-dashboard__error">{error}</p>}

        {!error && summary.adsByPlatform.length === 0 && (
          <p className="admin-dashboard__empty">No ads available to chart yet.</p>
        )}

        {!error && summary.adsByPlatform.length > 0 && (
          <div className="admin-dashboard__chart">
            {summary.adsByPlatform.map((item) => (
              <div key={item.name} className="admin-dashboard__chart-row">
                <span className="admin-dashboard__chart-label">{item.name}</span>
                <div className="admin-dashboard__chart-bar">
                  <span
                    className="admin-dashboard__chart-fill"
                    style={{ width: `${(item.count / maxPlatformCount) * 100}%` }}
                  />
                </div>
                <span className="admin-dashboard__chart-value">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
