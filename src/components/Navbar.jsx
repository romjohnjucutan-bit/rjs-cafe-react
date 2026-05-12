import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import logo from '../assets/logo.png'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { itemCount } = useCart()
  const close = () => setOpen(false)

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand" onClick={close}>
        <img src={logo} alt="RJ's Cafe logo" className="brand-logo" />
        RJ's CAFÉ
      </Link>

      <ul className={`nav-links ${open ? 'open' : ''}`}>
        <li><NavLink to="/" end onClick={close}>Home</NavLink></li>
        <li><NavLink to="/menu" onClick={close}>Menu</NavLink></li>
        <li><NavLink to="/reservations" onClick={close}>Reserve</NavLink></li>
        <li><NavLink to="/track" onClick={close}>Track Order</NavLink></li>
      </ul>

      <div className="nav-actions">
        <Link to="/cart" className="nav-cart" aria-label="Cart">
          <i className="fas fa-shopping-bag"></i>
          {itemCount > 0 && <span className="nav-cart-count">{itemCount}</span>}
        </Link>
        <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
          <i className={`fas ${open ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>
    </nav>
  )
}
