import React from 'react'
import { Link } from 'react-router-dom'
import heroImg from '../assets/home-hero.svg'
import card1 from '../assets/home-card-1.svg'
import card2 from '../assets/home-card-2.svg'
import card3 from '../assets/home-card-3.svg'

const categories = [
  { title: 'Desks & setups', description: 'Standing, corner, modular' },
  { title: 'Audio & calls', description: 'Headsets, mics, speakers' },
  { title: 'Charging', description: 'USB-C PD, hubs, docks' },
  { title: 'Lighting', description: 'Ambient, task, strips' },
  { title: 'Travel', description: 'Stands, sleeves, chargers' },
  { title: 'Ergo', description: 'Chairs, footrests, arms' },
  { title: 'Decor', description: 'Plants, shelves, rugs' },
  { title: 'Cables & power', description: 'USB-C, HDMI, surge' },
]

const featured = [
  {
    title: 'Midnight Standing Desk',
    description: 'Silent lift, cable tray, scratch-resistant matte surface.',
    price: '$649',
    button: 'Add to cart',
    image: card1,
  },
  {
    title: 'Pulse ANC Headphones',
    description: '60-hour battery, dual mics, adaptive noise cancellation.',
    price: '$299',
    button: 'Add to cart',
    image: card2,
  },
  {
    title: 'Flux Wireless Dock',
    description: '15W Mag-charge pad, dual USB-C PD, HDMI 2.1 passthrough.',
    price: '$189',
    button: 'Add to cart',
    image: card3,
  },
  {
    title: 'Glow Ambient Kit',
    description: 'Magnetic light bars with adaptive color temperatures.',
    price: '$129',
    button: 'Add to cart',
    image: card1,
  },
  {
    title: 'Clarity 4K Webcam',
    description: 'Glass lens, fast focus, and auto light balance.',
    price: '$179',
    button: 'Add to cart',
    image: card2,
  },
]

const exclusives = [
  {
    title: 'Bundle: Desk + Chair',
    description: 'Save 12% on ergonomic bundles with same-day assembly.',
    price: '$1,049',
    button: 'Grab offer',
    tone: 'secondary',
    image: card3,
  },
  {
    title: 'Accessories Trio',
    description: 'Pick any 3 organizers or chargers & unlock free express.',
    price: '$249',
    button: 'Grab offer',
    tone: 'accent',
    image: card1,
  },
  {
    title: 'Lighting Duo',
    description: 'Desk lamp + ambient strip synced to app control.',
    price: '$199',
    button: 'Grab offer',
    tone: 'secondary',
    image: card2,
  },
  {
    title: 'Remote Starter Kit',
    description: 'Laptop stand, webcam, ANC earbuds bundled for new hires.',
    price: '$279',
    button: 'Grab offer',
    tone: 'accent',
    image: card3,
  },
]

export default function Home() {
  return (
    <div className="home-page">
      <div className="page-container">
        <div className="home-inner">
          <section className="home-hero">
            <div className="home-hero-copy">
              <span>Workspace rentals</span>
              <h1>Curated gear for teams on the move.</h1>
              <p>
                Outfit hybrid teams with premium desks, lighting, and accessories. Deliveries happen
                same week, swaps are on-demand, and everything stays synced to your account.
              </p>
              <div className="hero-actions">
                <Link to="/signup" className="hero-btn primary">
                  Sign up free
                </Link>
                <Link to="/listing" className="hero-btn secondary">
                  Browse catalog
                </Link>
              </div>
            </div>
            <div className="home-carousel">
              <img src={heroImg} alt="Workspace inspiration" />
              <div className="hero-dots">
                <div className="hero-dot active" />
                <div className="hero-dot" />
                <div className="hero-dot" />
                <div className="hero-dot" />
              </div>
            </div>
          </section>

          <section className="home-categories">
            <div className="home-categories-header">
              <strong>Explore by category</strong>
              <span>Pick a lane to filter faster</span>
            </div>
            <div className="category-grid">
              {categories.map((category) => (
                <article key={category.title} className="category-pill">
                  <h4>{category.title}</h4>
                  <p>{category.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="home-section">
            <div className="section-header">
              <h3>Featured picks</h3>
              <Link to="/listing" className="view-link">
                View all
              </Link>
            </div>
            <div className="card-grid">
              {featured.map((product) => (
                <article key={product.title} className="product-card">
                  <img src={product.image} alt={product.title} />
                  <h4>{product.title}</h4>
                  <p>{product.description}</p>
                  <div className="product-meta">
                    <span className="product-price">{product.price}</span>
                    <button>{product.button}</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="home-section">
            <div className="section-header">
              <h3>Member exclusives</h3>
              <Link to="/signup" className="view-link">
                Join membership
              </Link>
            </div>
            <div className="card-grid">
              {exclusives.map((product) => (
                <article key={product.title} className="product-card">
                  <img src={product.image} alt={product.title} />
                  <h4>{product.title}</h4>
                  <p>{product.description}</p>
                  <div className="product-meta">
                    <span className="product-price">{product.price}</span>
                    <button className={product.tone}>{product.button}</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="home-cta">
            <div className="cta-content">
              <h3>Ready to build your cart?</h3>
              <p>
                Login or create an account to sync carts across devices and unlock concierge support
                for office moves.
              </p>
            </div>
            <div className="cta-actions">
              <Link to="/signup" className="hero-btn primary">
                Sign up free
              </Link>
              <Link to="/login" className="hero-btn secondary">
                Login
              </Link>
            </div>
          </section>

          <section className="home-footer">
            <div>
              <h5>Nextpage</h5>
              <p>Gear that keeps up with your ambition.</p>
              <p>Built with the same crisp feel as our login and signup flows.</p>
            </div>
            <div>
              <h5>Support</h5>
              <a href="#account">Account</a>
              <br />
              <a href="#membership">Membership</a>
              <br />
              <a href="#help">Help center</a>
            </div>
            <div>
              <h5>Company</h5>
              <a href="#about">About</a>
              <br />
              <a href="#careers">Careers</a>
              <br />
              <a href="#press">Press</a>
            </div>
            <div>
              <h5>Stay in touch</h5>
              <p>support@nextpage.com</p>
              <p>+1 202 555 0148</p>
              <p>Live chat</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
