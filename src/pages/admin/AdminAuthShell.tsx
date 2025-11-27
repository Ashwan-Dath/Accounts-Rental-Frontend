import React from 'react'

type AdminAuthShellProps = {
  title: string
  subtitle: string
  children: React.ReactNode
  helper?: React.ReactNode
}

export function AdminAuthShell({ title, subtitle, children, helper }: AdminAuthShellProps) {
  return (
    <section className="admin-auth">
      <div className="admin-auth__hero">
        <div className="admin-auth__overlay" />
      </div>
      <div className="admin-auth__panel">
        <div className="admin-auth__card">
          <header className="admin-auth__header">
            <p className="admin-auth__eyebrow">Account Rentals</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </header>
          {children}
          {helper && <div className="admin-auth__helper">{helper}</div>}
        </div>
      </div>
    </section>
  )
}
