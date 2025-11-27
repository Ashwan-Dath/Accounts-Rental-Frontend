import React, { useCallback, useEffect, useState } from 'react'
import { useAdminAuth } from '../../context/AuthContext'

type AdminAd = {
  _id?: string
  id?: string
  title?: string
  price?: number
  platform?: string | { platform: string }
  duration?: { value?: number; unit?: string }
}

type AdsPagination = {
  total: number
  page: number
  pages: number
  pageSize: number
}

const ROWS_PER_PAGE = 10

export default function AdminAds() {
  const { token } = useAdminAuth()
  const [ads, setAds] = useState<AdminAd[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [paginationInfo, setPaginationInfo] = useState<AdsPagination | null>(null)

  const totalRecords = paginationInfo?.total ?? ads.length
  const totalPages =
    paginationInfo?.pages ?? Math.max(1, Math.ceil(Math.max(totalRecords, 1) / ROWS_PER_PAGE))
  const hasRecords = totalRecords > 0
  const effectivePage = hasRecords ? Math.min(currentPage, totalPages) : 1
  const pageLabel = hasRecords ? effectivePage : 0
  const totalPagesLabel = hasRecords ? totalPages : 0

  const fetchAds = useCallback(
    async (pageParam: number = 1) => {
      setLoading(true)
      setError(null)
      const baseUrl = 'http://localhost:5000/public/allAds'
      const authHeaders: HeadersInit = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}
      try {
        let response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          body: JSON.stringify({ page: pageParam }),
        })

        if (!response.ok && (response.status === 404 || response.status === 405)) {
          response = await fetch(`${baseUrl}?page=${pageParam}`, {
            headers: authHeaders,
          })
        }

        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'Unable to load ads')
        }

        const payload = await response.json()
        console.log('Fetched ads payload:', payload);
        if (payload?.success === false && payload?.message) {
          throw new Error(payload.message)
        }

        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.ads)
          ? payload.ads
          : []
        setAds(list as AdminAd[])

        const paginationPayload = payload?.pagination
        const derivedPagination: AdsPagination = paginationPayload
          ? {
              total:
                typeof paginationPayload.total === 'number'
                  ? paginationPayload.total
                  : list.length,
              page:
                typeof paginationPayload.page === 'number'
                  ? paginationPayload.page
                  : pageParam,
              pages:
                typeof paginationPayload.pages === 'number'
                  ? Math.max(1, paginationPayload.pages)
                  : Math.max(
                      1,
                      Math.ceil(
                        (typeof paginationPayload.total === 'number'
                          ? paginationPayload.total
                          : list.length) / ROWS_PER_PAGE,
                      ),
                    ),
              pageSize:
                typeof paginationPayload.pageSize === 'number'
                  ? paginationPayload.pageSize
                  : ROWS_PER_PAGE,
            }
          : {
              total: list.length,
              page: pageParam,
              pages: Math.max(1, Math.ceil(Math.max(list.length, 1) / ROWS_PER_PAGE)),
              pageSize: ROWS_PER_PAGE,
            }

        setPaginationInfo(derivedPagination)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load ads'
        setError(message)
        setAds([])
        setPaginationInfo(null)
      } finally {
        setLoading(false)
      }
    },
    [token],
  )

  useEffect(() => {
    fetchAds(currentPage)
  }, [currentPage, fetchAds])

  useEffect(() => {
    if (paginationInfo && paginationInfo.pages > 0 && currentPage > paginationInfo.pages) {
      setCurrentPage(paginationInfo.pages)
    }
  }, [paginationInfo, currentPage])

  // function formatPrice(value?: number) {
  //   if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  //   return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value)
  // }
  function formatPrice(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR' 
  }).format(value)
}


  function formatDuration(duration?: { value?: number; unit?: string }) {
    if (!duration || !duration.value || !duration.unit) return '—'
    return `${duration.value} ${duration.unit}${duration.value > 1 ? 's' : ''}`
  }

  function resolvePlatformName(platform?: AdminAd['platform']) {
    if (!platform) return '—'
    if (typeof platform === 'string') return platform
    return platform.platform ?? '—'
  }

  return (
    <section className="content-card admin-categories admin-ads">
      <div className="admin-categories__header">
        <div>
          <p className="admin-dashboard__eyebrow">Marketplace</p>
          <h2>Ads</h2>
          <p className="admin-categories__helper">
            Review every submission with pricing, platform, and rental duration.
          </p>
        </div>
      </div>

      <div className="admin-categories__table-wrapper">
        <table className="admin-categories__table">
          <thead>
            <tr>
              <th>Sl. No</th>
              <th>Title</th>
              <th>Price</th>
              <th>Platform</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5}>Loading ads...</td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={5}>{error}</td>
              </tr>
            )}
            {!loading && !error && ads.length === 0 && (
              <tr>
                <td colSpan={5}>No ads found.</td>
              </tr>
            )}
            {!loading &&
              !error &&
              ads.map((ad, index) => (
                <tr key={ad._id || ad.id || `${ad.title}-${index}`}>
                  <td>{(effectivePage - 1) * ROWS_PER_PAGE + index + 1}</td>
                  <td>{ad.title || '—'}</td>
                  <td>{formatPrice(ad.price)}</td>
                  <td>{resolvePlatformName(ad.platform)}</td>
                  <td>{formatDuration(ad.duration)}</td>
                </tr>
              ))}
          </tbody>
        </table>

        <div className="admin-categories__pagination">
          <button
            type="button"
            className="admin-categories__page-btn"
            disabled={!hasRecords || currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </button>
          <span>
            Page {pageLabel} of {totalPagesLabel}
          </span>
          <button
            type="button"
            className="admin-categories__page-btn"
            disabled={!hasRecords || currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
