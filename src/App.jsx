import { useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import AdminLayout from './components/AdminLayout.jsx'

// Public pages
import Home from './pages/Home.jsx'
import Menu from './pages/Menu.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderSuccess from './pages/OrderSuccess.jsx'
import Track from './pages/Track.jsx'
import Reservations from './pages/Reservations.jsx'
import NotFound from './pages/NotFound.jsx'

// Admin pages
import AdminLogin from './pages/admin/Login.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminOrders from './pages/admin/Orders.jsx'
import AdminReservations from './pages/admin/Reservations.jsx'
import AdminProducts from './pages/admin/Products.jsx'
import AdminCategories from './pages/admin/Categories.jsx'
import AdminInventory from './pages/admin/Inventory.jsx'
import AdminStaff from './pages/admin/Staff.jsx'
import AdminReports from './pages/admin/Reports.jsx'
import AdminSettings from './pages/admin/Settings.jsx'
import AdminActivity from './pages/admin/Activity.jsx'
import AdminProfile from './pages/admin/Profile.jsx'

export default function App() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    if (isAdmin) return

    const swipeRoutes = ['/', '/menu', '/reservations', '/track', '/cart']
    const normalizePath = (path) => (path.startsWith('/track/') ? '/track' : path)
    const currentIndex = swipeRoutes.indexOf(normalizePath(pathname))

    if (currentIndex === -1) return

    let startX = 0
    let startY = 0

    const shouldIgnoreTarget = (target) => {
      if (!target || !(target instanceof Element)) return false
      return Boolean(
        target.closest('input, textarea, select, button, a, [contenteditable="true"]')
      )
    }

    const onTouchStart = (event) => {
      if (shouldIgnoreTarget(event.target)) return
      const touch = event.touches[0]
      startX = touch.clientX
      startY = touch.clientY
    }

    const onTouchEnd = (event) => {
      if (shouldIgnoreTarget(event.target)) return
      const touch = event.changedTouches[0]
      const dx = touch.clientX - startX
      const dy = touch.clientY - startY
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      if (absDx < 60 || absDx < absDy * 1.2) return

      if (dx < 0 && currentIndex < swipeRoutes.length - 1) {
        navigate(swipeRoutes[currentIndex + 1])
      }
      if (dx > 0 && currentIndex > 0) {
        navigate(swipeRoutes[currentIndex - 1])
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [isAdmin, pathname, navigate])

  return (
    <>
      {!isAdmin && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:code" element={<OrderSuccess />} />
        <Route path="/track" element={<Track />} />
        <Route path="/track/:code" element={<Track />} />
        <Route path="/reservations" element={<Reservations />} />

        {/* Admin login (no layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin: staff + admin allowed */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Admin-only routes */}
        <Route path="/admin" element={<AdminLayout requireAdmin />}>
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="activity" element={<AdminActivity />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && <Footer />}
    </>
  )
}
