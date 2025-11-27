import React from 'react'
import { useLocation } from 'react-router-dom'

export default function Listing() {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const query = params.get('query')?.trim()

  return (
    <div className="page-container">
      <div className="listing-page">
        <h2>Listings</h2>
        {query ? (
          <p>
            Showing results for <strong>&ldquo;{query}&rdquo;</strong>
          </p>
        ) : (
          <p>Browse rentals, bundles, and accessories.</p>
        )}
        <div className="listing-grid">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <article key={item} className="listing-card">
              <div className="listing-card__media" />
              <strong className="listing-card__title">Sample listing {item}</strong>
              <p className="listing-card__text">Filtered content will appear here.</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
