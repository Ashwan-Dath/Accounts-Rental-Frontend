import React from 'react'
import { FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { useUserAuth } from '../../context/AuthContext'
import { ProfileShell } from './ProfileShell'

export default function ProfilePage() {
  const { user } = useUserAuth()
  const userName = user?.name ?? 'Guest'

  return (
    <ProfileShell>
      <div className="profile-grid">
        <section className="profile-card profile-card--main">
          <header className="profile-card__header">
            <div>
              <h2>Profile Details</h2>
              <p>Keep these up to date so buyers can reach you.</p>
            </div>
            <button type="button" className="profile-upload-btn">
              Upload
            </button>
          </header>

          <div className="profile-avatar">
            <img src="https://i.pravatar.cc/100" alt="Profile avatar" />
            <div>
              <h3>{userName}</h3>
              <p>Max file size: 2 MB</p>
            </div>
          </div>

          <div className="profile-form-grid">
            <ProfileField icon={<FiUser />} label="Your Full Name" placeholder="Full name" defaultValue={userName} />
            <ProfileField icon={<FiMail />} label="Email Address" placeholder="Email" defaultValue="user@email.com" />
            <ProfileField
              icon={<FiPhone />}
              label="Phone Number"
              placeholder="+1 000 000 0000"
              defaultValue="+1 234 567 8901"
            />
            <ProfileField icon={<FiPhone />} label="Alternative Phone" placeholder="Optional" />
            <ProfileField icon={<FiMapPin />} label="Address" placeholder="Street, City" />
            <ProfileField icon={<FiMapPin />} label="Pincode" placeholder="12345" />
            <ProfileField icon={<FiMapPin />} label="State" placeholder="Select state" />
            <ProfileField icon={<FiMapPin />} label="District" placeholder="Select district" />
          </div>

          <div className="profile-actions">
            <button type="button" className="profile-primary-btn">
              Save Changes
            </button>
            <button type="button" className="profile-secondary-btn">
              Reset
            </button>
          </div>
        </section>

        <aside className="profile-card profile-card--side">
          <h3>Change Password</h3>
          <p>Update your credentials regularly for better security.</p>
          <ProfileField label="Current Password" type="password" placeholder="Password" />
          <ProfileField label="New Password" type="password" placeholder="Password" />
          <ProfileField label="Confirm Password" type="password" placeholder="Password" />
          <button type="button" className="profile-primary-btn profile-primary-btn--full">
            Change Password
          </button>
        </aside>
      </div>
    </ProfileShell>
  )
}

function ProfileField({
  label,
  placeholder,
  defaultValue,
  icon,
  type = 'text',
}: {
  label: string
  placeholder?: string
  defaultValue?: string
  icon?: React.ReactNode
  type?: string
}) {
  return (
    <label className="profile-field">
      <span>{label}</span>
      <div className="profile-field__input">
        {icon && <span className="profile-field__icon">{icon}</span>}
        <input type={type} placeholder={placeholder} defaultValue={defaultValue} />
      </div>
    </label>
  )
}
