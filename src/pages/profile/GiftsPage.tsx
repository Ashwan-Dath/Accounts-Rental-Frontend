import React from 'react'
import { ProfileShell } from './ProfileShell'

export default function GiftsPage() {
  return (
    <ProfileShell>
      <div className="profile-panel">
        <h2>Selected gifts</h2>
        <div className="profile-gift-grid">
          {[1, 2].map((gift) => (
            <article key={gift} className="profile-gift-card">
              <h3>Gift option #{gift}</h3>
              <p>Reserved • Arriving soon</p>
              <button type="button" className="profile-secondary-btn">
                View details
              </button>
            </article>
          ))}
        </div>
      </div>
    </ProfileShell>
  )
}
