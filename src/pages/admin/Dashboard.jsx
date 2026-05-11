import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0, activeOrders: 0, todayRevenue: 0, totalRevenue: 0,
    productCount: 0, activeRes: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [recentRes, setRecentRes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0]

      const [
        { count: totalOrders },
        { count: activeOrders },
        { data: todayOrders },
        { data: allCompleted },
        { count: productCount },
        { count: activeRes },
        { data: recent },
        { data: res }
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).not('status', 'in', '("completed","cancelled")'),
        supabase.from('orders').select('total').eq('status', 'completed').gte('created_at', today).lt('created_at', today + 'T23:59:59'),
        supabase.from('orders').select('total').eq('status', 'completed'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('reservations').select('*', { count: 'exact', head: true }).in('status', ['pending','confirmed','seated']),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(6),
        supabase.from('reservations').select('*').order('created_at', { ascending: false }).limit(5)
      ])

      setStats({
        totalOrders: totalOrders || 0,
        activeOrders: activeOrders || 0,
        todayRevenue: (todayOrders || []).reduce((s, o) => s + Number(o.total || 0), 0),
        totalRevenue: (allCompleted || []).reduce((s, o) => s + Number(o.total || 0), 0),
        productCount: productCount || 0,
        activeRes: activeRes || 0
      })
      setRecentOrders(recent || [])
      setRecentRes(res || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="loader">Loading dashboard</div>

  return (
    <>
      <div className="page-title-bar">
        <div>
          <h1>Welcome <em>back</em></h1>
          <p>Here's what's happening today.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card gold">
          <div className="stat-icon"><i className="fas fa-receipt"></i></div>
          <div className="stat-info">
            <p>Total Orders</p>
            <h3>{stats.totalOrders}</h3>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon"><i className="fas fa-clock"></i></div>
          <div className="stat-info">
            <p>Active Orders</p>
            <h3>{stats.activeOrders}</h3>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon"><i className="fas fa-money-bill-wave"></i></div>
          <div className="stat-info">
            <p>Today's Revenue</p>
            <h3>₱{stats.todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-chart-line"></i></div>
          <div className="stat-info">
            <p>Total Revenue</p>
            <h3>₱{stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon"><i className="fas fa-box-open"></i></div>
          <div className="stat-info">
            <p>Products</p>
            <h3>{stats.productCount}</h3>
          </div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon"><i className="fas fa-calendar-check"></i></div>
          <div className="stat-info">
            <p>Active Reservations</p>
            <h3>{stats.activeRes}</h3>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="data-card">
          <div className="data-card-header">
            <h3><i className="fas fa-receipt"></i> Recent Orders</h3>
            <Link to="/admin/orders" className="btn btn-outline btn-sm">View all</Link>
          </div>
          <div className="table-wrap">
            {recentOrders.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-receipt"></i>
                <p>No orders yet.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Code</th><th>Customer</th><th>Total</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id}>
                      <td style={{ color: 'var(--gold)', fontFamily: 'Cinzel, serif', fontSize: '.78rem' }}>{o.order_code}</td>
                      <td>{o.customer_name}</td>
                      <td>₱{Number(o.total).toFixed(2)}</td>
                      <td><span className={`badge badge-${o.status}`}>{o.status.replace('_', ' ')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="data-card">
          <div className="data-card-header">
            <h3><i className="fas fa-calendar-check"></i> Recent Reservations</h3>
            <Link to="/admin/reservations" className="btn btn-outline btn-sm">View all</Link>
          </div>
          <div className="table-wrap">
            {recentRes.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-calendar"></i>
                <p>No reservations yet.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Guest</th><th>Date</th><th>Time</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {recentRes.map(r => (
                    <tr key={r.id}>
                      <td>{r.guest_name}</td>
                      <td>{r.reservation_date}</td>
                      <td>{r.reservation_time.slice(0,5)}</td>
                      <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .dash-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 1000px) { .dash-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  )
}
