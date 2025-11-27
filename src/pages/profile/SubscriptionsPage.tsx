import React from 'react'
import { ProfileShell } from './ProfileShell'

export default function SubscriptionsPage() {
  return (
    <ProfileShell>
      <div className="profile-panel">
        <h2>Memberships & subscriptions</h2>
        <div className="profile-subscription-grid">
          {['Standard', 'Pro', 'Teams'].map((tier, index) => (
            <article key={tier} className="profile-subscription-card">
              <h3>{tier} Plan</h3>
              <p>Renews in {14 - index * 3} days</p>
              <button type="button" className="profile-secondary-btn">
                Manage
              </button>
            </article>
          ))}
        </div>
      </div>
    </ProfileShell>
  )
}
