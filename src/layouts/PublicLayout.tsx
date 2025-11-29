import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <Header />
          <main className="public-layout__main">
            <Outlet />
          </main>
      {/* <Footer /> */}
    </div>
  )
}
