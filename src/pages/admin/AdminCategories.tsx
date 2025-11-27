import React, { useCallback, useEffect, useState } from 'react'
import { useAdminAuth } from '../../context/AuthContext'

type CategoryFormState = {
  category: string
  platform: string
}

type Category = {
  _id?: string
  id?: string
  category: string
  platform: string
}

type CategoryPagination = {
  total: number
  page: number
  pages: number
  pageSize: number
}

const ROWS_PER_PAGE = 10

export default function AdminCategories() {
  const { token } = useAdminAuth()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CategoryFormState>({ category: '', platform: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [paginationInfo, setPaginationInfo] = useState<CategoryPagination | null>(null)
  const totalRecords = paginationInfo?.total ?? categories.length
  const totalPages =
    paginationInfo?.pages ?? Math.max(1, Math.ceil(Math.max(totalRecords, 1) / ROWS_PER_PAGE))
  const hasRecords = totalRecords > 0
  const effectivePage = hasRecords ? Math.min(currentPage, totalPages) : 1
  const pageLabel = hasRecords ? effectivePage : 0
  const totalPagesLabel = hasRecords ? totalPages : 0

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const fetchCategories = useCallback(
    async (pageParam: number = 1) => {
      setCategoriesLoading(true)
      setCategoriesError(null)
      const baseUrl = 'http://localhost:5000/category/all'
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
          throw new Error(message || 'Unable to load categories')
        }

        const payload = await response.json()
        if (payload?.success === false && payload?.message) {
          throw new Error(payload.message)
        }

        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.categories)
          ? payload.categories
          : []

        setCategories(list as Category[])

        const paginationPayload = payload?.pagination
        const derivedPagination: CategoryPagination = paginationPayload
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
        const message = err instanceof Error ? err.message : 'Unable to load categories'
        setCategoriesError(message)
        setCategories([])
        setPaginationInfo(null)
      } finally {
        setCategoriesLoading(false)
      }
    },
    [token],
  )

  useEffect(() => {
    fetchCategories(currentPage)
  }, [currentPage, fetchCategories])

  useEffect(() => {
    if (paginationInfo && paginationInfo.pages > 0 && currentPage > paginationInfo.pages) {
      setCurrentPage(paginationInfo.pages)
    }
  }, [paginationInfo, currentPage])

  async function refreshFirstPage() {
    if (currentPage === 1) {
      await fetchCategories(1)
    } else {
      setCurrentPage(1)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    if (!token) {
      setError('Unable to submit without an admin session.')
      return
    }
    setSubmitting(true)
    try {
      const response = await fetch('http://localhost:5000/category/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: form.category,
          platform: form.platform,
        }),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Unable to add category')
      }

      setSuccess('Category added successfully.')
      setForm({ category: '', platform: '' })
      setShowForm(false)
      await refreshFirstPage()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="content-card admin-categories">
      <div className="admin-categories__header">
        <div>
          <p className="admin-dashboard__eyebrow">Library</p>
          <h2>Categories</h2>
        </div>
        <button
          type="button"
          className="admin-categories__toggle"
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? 'Close' : 'Add Category'}
        </button>
      </div>

      {success && <p className="admin-categories__success">{success}</p>}
      {error && <p className="admin-categories__error">{error}</p>}

      {showForm && (
        <form className="admin-categories__form" onSubmit={handleSubmit}>
          <label>
            <span>Category</span>
            <input
              type="text"
              name="category"
              placeholder="Social media"
              value={form.category}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            <span>Platform</span>
            <input
              type="text"
              name="platform"
              placeholder="Facebook, Instagram..."
              value={form.platform}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit" className="admin-categories__submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      )}

      {!showForm && (
        <p className="admin-categories__helper">
          Use the Add Category button to create new groups like Social Media platforms.
        </p>
      )}

      <div className="admin-categories__table-wrapper">
        <table className="admin-categories__table">
          <thead>
            <tr>
              <th>Sl. No</th>
              <th>Category</th>
              <th>Platform</th>
            </tr>
          </thead>
          <tbody>
            {categoriesLoading && (
              <tr>
                <td colSpan={3}>Loading categories...</td>
              </tr>
            )}
            {!categoriesLoading && categoriesError && (
              <tr>
                <td colSpan={3}>{categoriesError}</td>
              </tr>
            )}
            {!categoriesLoading && !categoriesError && categories.length === 0 && (
              <tr>
                <td colSpan={3}>No categories found.</td>
              </tr>
            )}
            {!categoriesLoading &&
              !categoriesError &&
              categories.map((item, index) => (
                <tr key={item._id || item.id || `${item.category}-${index}`}>
                  <td>{(effectivePage - 1) * ROWS_PER_PAGE + index + 1}</td>
                  <td>{item.category}</td>
                  <td>{item.platform}</td>
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
