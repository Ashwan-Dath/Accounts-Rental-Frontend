import React from 'react'
import { ProfileShell } from './ProfileShell'

export default function AdsPage() {
  return (
    <ProfileShell>
      <div className="profile-panel">
        <header className="profile-panel__header">
          <div>
            <h2>Your ads</h2>
            <p>Manage or pause your live listings.</p>
          </div>
          <button type="button" className="profile-primary-btn">
            Create Listing
          </button>
        </header>
        <div className="profile-list">
          {[1, 2, 3].map((item) => (
            <article key={item} className="profile-list-card">
              <div>
                <h3>Gear #{item}</h3>
                <p>Status: Live • 2 days old</p>
              </div>
              <div className="profile-list-card__actions">
                <button type="button" className="profile-secondary-btn">
                  Pause
                </button>
                <button type="button" className="profile-secondary-btn">
                  Edit
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </ProfileShell>
  )
}
