import React from 'react'
import { ProfileShell } from './ProfileShell'

export default function RentalsPage() {
  return (
    <ProfileShell>
      <div className="profile-panel">
        <h2>Rentals you are tracking</h2>
        <ul className="profile-chip-list">
          {['Camera rentals', 'Gaming consoles', 'Streaming accounts'].map((topic) => (
            <li key={topic} className="profile-chip">
              {topic}
            </li>
          ))}
        </ul>
        <p>Add new alerts to get notified when someone posts what you need.</p>
        <button type="button" className="profile-primary-btn">
          Add Alert
        </button>
      </div>
    </ProfileShell>
  )
}
