import React from 'react'
import { useUserAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useUserAuth()
  return (
    <div>
      <h2>Profile</h2>
      <p>Name: {user?.name}</p>
    </div>
  )
}
