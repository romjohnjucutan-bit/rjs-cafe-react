import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { logActivity } from '../../lib/activity.js'

export default function AdminInventory() {
  const { staff } = useAuth()
  const [products, setProducts] = useState([])
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [adjusting, setAdjusting] = useState(null)
  const [changeQty, setChangeQty] = useState('')
  const [reason, setReason] = useState('')

  const load = async () => {
    setLoading(true)
    const [{ data: prods }, { data: logs }] = await Promise.all([
      supabase.from('products').select('id, name, stock, is_available, categories(name)').order('name'),
      supabase.from('inventory_log').select('*').order('created_at', { ascending: false }).limit(30)
    ])
    setProducts(prods || [])
    setLog(logs || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdjust = (p) => {
    setAdjusting(p)
    setChangeQty('')
    setReason('')
  }

  const handleAdjust = async (e) => {
    e.preventDefault()
    const qty = parseInt(changeQty)
    if (!qty || qty === 0) {
      alert('Enter a non-zero adjustment.')
      return
    }
    const newStock = Math.max(0, adjusting.stock + qty)
    await supabase.from('products').update({ stock: newStock }).eq('id', adjusting.id)
    await supabase.from('inventory_log').insert({
      product_id: adjusting.id,
      product_name: adjusting.name,
      change_qty: qty,
      reason: reason.trim() || null,
      staff_name: staff?.full_name
    })
    await logActivity(staff?.full_name, 'adjusted stock', 'product', adjusting.id,
      `${adjusting.name}: ${qty > 0 ? '+' : ''}${qty}`)
    setAdjusting(null)
    load()
  }

  return (
    <>
      <div className="page-title-bar">
        <div>
          <h1>Inventory</h1>
          <p>Track stock and adjustments</p>
        </div>
      </div>

      <div className="data-card">
        <div className="data-card-header">
          <h3><i className="fas fa-warehouse"></i> Stock Levels</h3>
        </div>
        <div className="table-wrap">
          {loading ? <div className="loader">Loading</div> : (
            <table className="data-table">
              <thead>
                <tr><th>Product</th><th>Category</th><th>Stock</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.categories?.name || '—'}</td>
                    <td style={{ color: p.stock < 10 ? 'var(--danger)' : 'var(--cream)' }}>
                      {p.stock}
                    </td>
                    <td>
                      {p.stock === 0 ? <span className="badge badge-cancelled">Out</span> :
                       p.stock < 10 ? <span className="badge badge-pending">Low</span> :
                       <span className="badge badge-completed">OK</span>}
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => openAdjust(p)}>
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="data-card">
        <div className="data-card-header">
          <h3><i className="fas fa-history"></i> Recent Adjustments</h3>
        </div>
        <div className="table-wrap">
          {log.length === 0 ? (
            <div className="empty-state"><i className="fas fa-history"></i><p>No adjustments yet.</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>When</th><th>Product</th><th>Change</th><th>Reason</th><th>By</th></tr>
              </thead>
              <tbody>
                {log.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontSize: '.82rem', color: 'var(--text-l)' }}>{new Date(l.created_at).toLocaleString()}</td>
                    <td>{l.product_name}</td>
                    <td style={{ color: l.change_qty > 0 ? 'var(--success)' : 'var(--danger)', fontFamily: 'Cinzel, serif' }}>
                      {l.change_qty > 0 ? '+' : ''}{l.change_qty}
                    </td>
                    <td style={{ fontSize: '.88rem' }}>{l.reason || '—'}</td>
                    <td style={{ fontSize: '.88rem' }}>{l.staff_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {adjusting && (
        <div className="modal-backdrop" onClick={() => setAdjusting(null)}>
          <form className="modal-card" onClick={e => e.stopPropagation()} onSubmit={handleAdjust}>
            <div className="modal-head">
              <h3>Adjust Stock — {adjusting.name}</h3>
              <button type="button" className="modal-close" onClick={() => setAdjusting(null)}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1rem', color: 'var(--text-m)' }}>
                Current stock: <strong style={{ color: 'var(--gold)' }}>{adjusting.stock}</strong>
              </p>
              <div className="form-group">
                <label>Adjustment (use negative to subtract) *</label>
                <input type="number" className="form-control" value={changeQty}
                  onChange={e => setChangeQty(e.target.value)} required
                  placeholder="e.g. +50 or -10" />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <input type="text" className="form-control" value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="New shipment, spoilage, sale..." />
              </div>
              {changeQty && (
                <p style={{ color: 'var(--gold)', fontFamily: 'Cinzel, serif', fontSize: '.75rem', letterSpacing: '.15em' }}>
                  → New stock: {Math.max(0, adjusting.stock + (parseInt(changeQty) || 0))}
                </p>
              )}
            </div>
            <div className="modal-foot">
              <button type="button" className="btn btn-outline" onClick={() => setAdjusting(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Apply</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
