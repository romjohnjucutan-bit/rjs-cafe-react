import { useState } from 'react'
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import logo from '../assets/logo.png'

export default function AdminLayout({ requireAdmin = false }) {
  const { session, staff, loading, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  if (loading) {
    return <div className="loader" style={{ minHeight: '100vh' }}>Loading</div>
  }

  if (!session || !staff) {
    return <Navigate to="/admin/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin" replace />
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const close = () => setOpen(false)

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div className="admin-brand">
          <img src={logo} alt="RJ's Cafe logo" className="brand-logo" />
          <div>
            <div className="brand-name">RJ's Café</div>
            <div className="brand-sub">{isAdmin ? 'Admin' : 'Staff'} Panel</div>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end onClick={close}><i className="fas fa-th-large"></i> Dashboard</NavLink>
          <NavLink to="/admin/orders" onClick={close}><i className="fas fa-receipt"></i> Orders</NavLink>
          <NavLink to="/admin/reservations" onClick={close}><i className="fas fa-calendar-check"></i> Reservations</NavLink>

          {isAdmin && (
            <>
              <div className="nav-section">Management</div>
              <NavLink to="/admin/products" onClick={close}><i className="fas fa-box-open"></i> Products</NavLink>
              <NavLink to="/admin/categories" onClick={close}><i className="fas fa-tags"></i> Categories</NavLink>
              <NavLink to="/admin/inventory" onClick={close}><i className="fas fa-warehouse"></i> Inventory</NavLink>
              <NavLink to="/admin/staff" onClick={close}><i className="fas fa-users"></i> Staff</NavLink>
              <NavLink to="/admin/reports" onClick={close}><i className="fas fa-chart-line"></i> Reports</NavLink>
              <NavLink to="/admin/settings" onClick={close}><i className="fas fa-clock"></i> Shop Hours</NavLink>
              <NavLink to="/admin/activity" onClick={close}><i className="fas fa-history"></i> Activity Log</NavLink>
            </>
          )}

          <div className="nav-section">Account</div>
          <NavLink to="/admin/profile" onClick={close}><i className="fas fa-user"></i> Profile</NavLink>
          <button onClick={handleSignOut} className="nav-signout">
            <i className="fas fa-sign-out-alt"></i> Sign Out
          </button>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-toggle" onClick={() => setOpen(!open)}>
            <i className={`fas ${open ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
          <div className="topbar-user">
            <span className="user-name">{staff.full_name}</span>
            <span className={`role-pill role-${staff.role}`}>{staff.role}</span>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      <style>{css}</style>
    </div>
  )
}

const css = `
.admin-shell {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
  background: var(--black);
}

/* Sidebar */
.admin-sidebar {
  background: var(--black2);
  border-right: 1px solid var(--border);
  position: sticky; top: 0;
  height: 100vh;
  overflow-y: auto;
  display: flex; flex-direction: column;
}
.admin-brand {
  padding: 1.5rem 1.25rem;
  display: flex; align-items: center; gap: .85rem;
  border-bottom: 1px solid var(--border-l);
}
.admin-brand .brand-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
.brand-name {
  font-family: 'Cinzel', serif;
  font-size: .95rem;
  letter-spacing: .14em;
  color: var(--gold);
}
.brand-sub {
  font-family: 'Cinzel', serif;
  font-size: .58rem;
  letter-spacing: .25em;
  color: var(--text-l);
  margin-top: .15rem;
  text-transform: uppercase;
}

.admin-nav {
  display: flex; flex-direction: column;
  padding: 1rem 0;
  flex: 1;
}
.admin-nav a, .admin-nav button {
  display: flex; align-items: center; gap: .8rem;
  padding: .75rem 1.25rem;
  color: var(--text-m);
  font-family: 'Cinzel', serif;
  font-size: .68rem;
  letter-spacing: .14em;
  text-transform: uppercase;
  border-left: 2px solid transparent;
  transition: all .2s;
  text-align: left;
  background: transparent;
  cursor: pointer;
}
.admin-nav a:hover, .admin-nav button:hover {
  color: var(--gold);
  background: rgba(201,168,76,.04);
}
.admin-nav a.active {
  color: var(--gold);
  background: rgba(201,168,76,.07);
  border-left-color: var(--gold);
}
.admin-nav a i, .admin-nav button i {
  font-size: .85rem;
  width: 16px;
  text-align: center;
  color: var(--gold);
  opacity: .7;
}
.admin-nav a.active i { opacity: 1; }
.nav-section {
  padding: 1.25rem 1.25rem .5rem;
  font-family: 'Cinzel', serif;
  font-size: .58rem;
  letter-spacing: .25em;
  text-transform: uppercase;
  color: var(--text-l);
}
.nav-signout {
  color: var(--danger) !important;
  margin-top: auto;
}
.nav-signout i { color: var(--danger) !important; }

/* Topbar */
.admin-main { display: flex; flex-direction: column; min-width: 0; }
.admin-topbar {
  background: var(--black2);
  border-bottom: 1px solid var(--border-l);
  padding: 0 1.5rem;
  height: 60px;
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0; z-index: 50;
  backdrop-filter: blur(12px);
}
.admin-toggle {
  display: none;
  color: var(--gold);
  font-size: 1.2rem;
}
.topbar-user {
  display: flex; align-items: center; gap: .75rem;
  margin-left: auto;
}
.user-name { color: var(--cream); font-size: .9rem; }
.role-pill {
  font-family: 'Cinzel', serif;
  font-size: .58rem;
  letter-spacing: .18em;
  text-transform: uppercase;
  padding: .2rem .65rem;
  border: 1px solid;
  border-radius: var(--radius);
}
.role-admin { color: var(--gold); border-color: var(--gold); background: rgba(201,168,76,.08); }
.role-staff { color: var(--info); border-color: rgba(80,144,208,.5); background: rgba(80,144,208,.08); }

.admin-content { padding: 2rem 1.75rem; }

/* MOBILE */
@media (max-width: 900px) {
  .admin-shell { grid-template-columns: 1fr; }
  .admin-sidebar {
    position: fixed; top: 0; left: 0; bottom: 0;
    width: 260px;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform .3s;
  }
  .admin-sidebar.open { transform: translateX(0); box-shadow: var(--shadow); }
  .admin-toggle { display: block; }
  .admin-content { padding: 1.25rem; }
}
`
