import React from 'react'

function FooterInner() {
  return (
    <footer style={{ padding: 12, borderTop: '1px solid #e6e6e6', marginTop: 24 }}>
      <div style={{ textAlign: 'center', color: '#666' }}>
        © {new Date().getFullYear()} Accounts Frontend
      </div>
    </footer>
  )
}

export const Footer = React.memo(FooterInner)
