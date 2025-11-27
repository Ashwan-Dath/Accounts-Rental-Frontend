import React from 'react'

function FooterInner() {
  return (
    <footer className="public-footer">
      <div className="public-footer__text">© {new Date().getFullYear()} Accounts Frontend</div>
    </footer>
  )
}

export const Footer = React.memo(FooterInner)
