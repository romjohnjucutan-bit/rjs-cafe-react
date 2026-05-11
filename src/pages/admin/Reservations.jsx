import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { logActivity } from '../../lib/activity.js'

const STATUSES = ['pending','confirmed','seated','completed','cancelled']

export default function AdminReservations() {
  const { staff } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewing, setViewing] = useState(null)

  const load = async () => {
    setLoading(true)
    let q = supabase.from('reservations').select('*').order('reservation_date', { ascending: false }).order('reservation_time', { ascending: false })
    if (statusFilter) q = q.eq('status', statusFilter)
    const { data } = await q
    let result = data || []
    if (search.trim()) {
      const s = search.trim().toLowerCase()
      result = result.filter(r =>
        r.guest_name.toLowerCase().includes(s) ||
        r.reference_code.toLowerCase().includes(s) ||
        r.guest_email.toLowerCase().includes(s) ||
        r.guest_phone.toLowerCase().includes(s)
      )
    }
    setItems(result)
    setLoading(false)
  }

  useEffect(() => { load() }, [statusFilter]) // eslint-disable-line

  const updateStatus = async (id, newStatus) => {
    await supabase.from('reservations').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id)
    await logActivity(staff?.full_name, 'updated reservation status', 'reservation', id, `→ ${newStatus}`)
    if (viewing?.id === id) setViewing({ ...viewing, status: newStatus })
    load()
  }

  return (
    <>
      <div className="page-title-bar">
        <div>
          <h1>Reservations</h1>
          <p>{items.length} {items.length === 1 ? 'reservation' : 'reservations'} found</p>
        </div>
      </div>

      <div className="data-card">
        <div className="filter-bar">
          <input
            type="text" className="form-control" placeholder="Search name, code, email, phone..."
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            style={{ flex: 1, minWidth: 200 }}
          />
          <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={load}><i className="fas fa-search"></i> Filter</button>
          <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setStatusFilter(''); }}>Clear</button>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="loader">Loading</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-calendar"></i>
              <p>No reservations match your filters.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Code</th><th>Guest</th><th>Date</th><th>Time</th><th>Guests</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {items.map(r => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--gold)', fontFamily: 'Cinzel, serif', fontSize: '.78rem' }}>{r.reference_code}</td>
                    <td>
                      <div>{r.guest_name}</div>
                      <div style={{ fontSize: '.78rem', color: 'var(--text-l)' }}>{r.guest_phone}</div>
                    </td>
                    <td>{r.reservation_date}</td>
                    <td>{r.reservation_time.slice(0,5)}</td>
                    <td>{r.num_guests}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    <td>
                      <button className="action-icon" onClick={() => setViewing(r)} title="View"><i className="fas fa-eye"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {viewing && (
        <div className="modal-backdrop" onClick={() => setViewing(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3><i className="fas fa-calendar-check"></i> {viewing.reference_code}</h3>
              <button className="modal-close" onClick={() => setViewing(null)}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div><span className="label-text">Guest</span><div>{viewing.guest_name}</div></div>
                <div><span className="label-text">Phone</span><div>{viewing.guest_phone}</div></div>
                <div style={{ gridColumn: '1 / -1' }}><span className="label-text">Email</span><div>{viewing.guest_email}</div></div>
                <div><span className="label-text">Date</span><div>{viewing.reservation_date}</div></div>
                <div><span className="label-text">Time</span><div>{viewing.reservation_time.slice(0,5)}</div></div>
                <div><span className="label-text">Guests</span><div>{viewing.num_guests}</div></div>
                <div><span className="label-text">Status</span><div><span className={`badge badge-${viewing.status}`}>{viewing.status}</span></div></div>
                {viewing.notes && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span className="label-text">Notes</span><div>{viewing.notes}</div>
                  </div>
                )}
              </div>

              <h4 style={{ marginTop: '1.5rem', color: 'var(--gold)', fontFamily: 'Cinzel, serif', fontSize: '.72rem', letterSpacing: '.2em', textTransform: 'uppercase' }}>Update Status</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.5rem' }}>
                {STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(viewing.id, s)}
                    className={`btn btn-sm ${viewing.status === s ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .detail-grid > div .label-text { display: block; margin-bottom: .2rem; }
        .detail-grid > div > div:last-child { color: var(--text); font-size: .92rem; }
        @media (max-width: 500px) { .detail-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  )
}
