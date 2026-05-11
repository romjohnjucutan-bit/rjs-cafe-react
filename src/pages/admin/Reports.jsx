import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'

export default function AdminReports() {
  const [period, setPeriod] = useState('7') // days
  const [data, setData] = useState({
    revenue: 0, orderCount: 0, avgOrder: 0,
    byDay: [], topProducts: [], byPayment: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const days = parseInt(period)
      const start = new Date()
      start.setDate(start.getDate() - days)
      const startStr = start.toISOString()

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'completed')
        .gte('created_at', startStr)
        .order('created_at')

      const safeOrders = orders || []
      const revenue = safeOrders.reduce((s, o) => s + Number(o.total || 0), 0)
      const orderCount = safeOrders.length
      const avgOrder = orderCount ? revenue / orderCount : 0

      // Group by day
      const dayMap = {}
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const k = d.toISOString().split('T')[0]
        dayMap[k] = 0
      }
      safeOrders.forEach(o => {
        const k = o.created_at.split('T')[0]
        if (dayMap[k] !== undefined) dayMap[k] += Number(o.total || 0)
      })
      const byDay = Object.entries(dayMap).map(([d, v]) => ({ day: d, total: v }))

      // Top products
      const orderIds = safeOrders.map(o => o.id)
      let topProducts = []
      if (orderIds.length) {
        const { data: items } = await supabase.from('order_items').select('*').in('order_id', orderIds)
        const productMap = {}
        ;(items || []).forEach(it => {
          if (!productMap[it.product_name]) {
            productMap[it.product_name] = { name: it.product_name, qty: 0, revenue: 0 }
          }
          productMap[it.product_name].qty += it.quantity
          productMap[it.product_name].revenue += Number(it.subtotal)
        })
        topProducts = Object.values(productMap).sort((a, b) => b.qty - a.qty).slice(0, 8)
      }

      // By payment
      const payMap = {}
      safeOrders.forEach(o => {
        const k = o.payment_method
        if (!payMap[k]) payMap[k] = { method: k, count: 0, total: 0 }
        payMap[k].count++
        payMap[k].total += Number(o.total || 0)
      })
      const byPayment = Object.values(payMap)

      setData({ revenue, orderCount, avgOrder, byDay, topProducts, byPayment })
      setLoading(false)
    }
    load()
  }, [period])

  if (loading) return <div className="loader">Loading reports</div>

  const maxDay = Math.max(...data.byDay.map(d => d.total), 1)
  const maxProd = Math.max(...data.topProducts.map(p => p.qty), 1)

  return (
    <>
      <div className="page-title-bar">
        <div>
          <h1>Reports</h1>
          <p>Revenue & sales analytics</p>
        </div>
        <select className="form-control" value={period} onChange={e => setPeriod(e.target.value)} style={{ width: 'auto' }}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-icon"><i className="fas fa-money-bill-wave"></i></div>
          <div className="stat-info">
            <p>Revenue</p>
            <h3>₱{data.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon"><i className="fas fa-receipt"></i></div>
          <div className="stat-info">
            <p>Completed Orders</p>
            <h3>{data.orderCount}</h3>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon"><i className="fas fa-calculator"></i></div>
          <div className="stat-info">
            <p>Avg Order Value</p>
            <h3>₱{data.avgOrder.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      <div className="data-card">
        <div className="data-card-header">
          <h3><i className="fas fa-chart-bar"></i> Revenue by Day</h3>
        </div>
        <div className="chart-wrap">
          {data.byDay.length === 0 ? (
            <div className="empty-state"><i className="fas fa-chart-bar"></i><p>No completed orders in this period.</p></div>
          ) : (
            <div className="bar-chart">
              {data.byDay.map(d => (
                <div key={d.day} className="bar-col">
                  <div className="bar-value">₱{d.total.toFixed(0)}</div>
                  <div className="bar" style={{ height: `${(d.total / maxDay) * 100}%` }}></div>
                  <div className="bar-label">{d.day.slice(5)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="reports-grid">
        <div className="data-card">
          <div className="data-card-header">
            <h3><i className="fas fa-trophy"></i> Top Products</h3>
          </div>
          <div style={{ padding: '1rem 1.5rem 1.5rem' }}>
            {data.topProducts.length === 0 ? (
              <div className="empty-state"><i className="fas fa-trophy"></i><p>No sales data yet.</p></div>
            ) : (
              data.topProducts.map(p => (
                <div key={p.name} className="rank-row">
                  <div className="rank-row-label">{p.name}</div>
                  <div className="rank-bar">
                    <div className="rank-bar-fill" style={{ width: `${(p.qty / maxProd) * 100}%` }}></div>
                  </div>
                  <div className="rank-row-value">×{p.qty}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="data-card">
          <div className="data-card-header">
            <h3><i className="fas fa-credit-card"></i> By Payment Method</h3>
          </div>
          <div className="table-wrap">
            {data.byPayment.length === 0 ? (
              <div className="empty-state"><i className="fas fa-credit-card"></i><p>No data.</p></div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Method</th><th>Orders</th><th>Total</th></tr></thead>
                <tbody>
                  {data.byPayment.map(p => (
                    <tr key={p.method}>
                      <td style={{ textTransform: 'uppercase' }}>{p.method}</td>
                      <td>{p.count}</td>
                      <td style={{ color: 'var(--gold)' }}>₱{p.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .chart-wrap { padding: 1.5rem; }
        .bar-chart {
          display: flex; align-items: flex-end; gap: .4rem;
          height: 240px;
          padding: 0 .5rem;
        }
        .bar-col {
          flex: 1;
          display: flex; flex-direction: column; align-items: center;
          height: 100%;
          justify-content: flex-end;
          gap: .4rem;
          min-width: 0;
        }
        .bar-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: .8rem;
          color: var(--gold);
          opacity: .8;
        }
        .bar {
          width: 100%;
          background: linear-gradient(to top, var(--gold-d), var(--gold));
          min-height: 2px;
          transition: opacity .2s;
        }
        .bar:hover { opacity: .8; }
        .bar-label {
          font-family: 'Cinzel', serif;
          font-size: .55rem;
          letter-spacing: .12em;
          color: var(--text-l);
        }
        .reports-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 900px) { .reports-grid { grid-template-columns: 1fr; } }
        .rank-row {
          display: grid;
          grid-template-columns: 1fr 2fr auto;
          gap: 1rem;
          align-items: center;
          padding: .5rem 0;
          font-size: .88rem;
        }
        .rank-row-label { color: var(--text); }
        .rank-row-value { color: var(--gold); font-family: 'Cinzel', serif; font-size: .8rem; }
        .rank-bar {
          height: 6px;
          background: var(--black3);
          overflow: hidden;
        }
        .rank-bar-fill {
          height: 100%;
          background: linear-gradient(to right, var(--gold-d), var(--gold));
        }
      `}</style>
    </>
  )
}
