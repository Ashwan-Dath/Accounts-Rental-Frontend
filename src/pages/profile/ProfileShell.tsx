import React from 'react'
import { NavLink } from 'react-router-dom'
import { FiUser, FiFileText, FiEye, FiStar, FiGift, FiLogOut } from 'react-icons/fi'
import { useUserAuth } from '../../context/AuthContext'

const tabs = [
  { id: 'profile', label: 'Profile', icon: FiUser, path: '/profile' },
  { id: 'ads', label: 'Ads', icon: FiFileText, path: '/ads' },
  { id: 'rentals', label: 'Rentals', icon: FiEye, path: '/rentals' },
  { id: 'subscriptions', label: 'My Subscriptions', icon: FiStar, path: '/my-subscriptions' },
  { id: 'gifts', label: 'Selected Gifts', icon: FiGift, path: '/gifts' },
]

type ProfileShellProps = {
  children: React.ReactNode
}

export function ProfileShell({ children }: ProfileShellProps) {
  const { logout } = useUserAuth()

  return (
    <div className="profile-page">
      <div className="profile-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <NavLink
              key={tab.id}
              to={tab.path}
              end={tab.path === '/profile'}
              className={({ isActive }) => `profile-tab ${isActive ? 'profile-tab--active' : ''}`}
            >
              <Icon />
              <span>{tab.label}</span>
            </NavLink>
          )
        })}
        <button type="button" className="profile-tab profile-tab--ghost" onClick={logout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>

      <div className="profile-content">{children}</div>
    </div>
  )
}
