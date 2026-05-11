import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'

export default function AdminActivity() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      setItems(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <div className="page-title-bar">
        <div>
          <h1>Activity Log</h1>
          <p>Last 100 actions performed by staff</p>
        </div>
      </div>

      <div className="data-card">
        <div className="table-wrap">
          {loading ? <div className="loader">Loading</div> :
           items.length === 0 ? (
             <div className="empty-state"><i className="fas fa-history"></i><p>No activity recorded yet.</p></div>
           ) : (
            <table className="data-table">
              <thead>
                <tr><th>When</th><th>Who</th><th>Action</th><th>Target</th><th>Details</th></tr>
              </thead>
              <tbody>
                {items.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontSize: '.82rem', color: 'var(--text-l)' }}>{new Date(a.created_at).toLocaleString()}</td>
                    <td>{a.staff_name || '—'}</td>
                    <td style={{ color: 'var(--cream)' }}>{a.action}</td>
                    <td style={{ fontSize: '.85rem' }}>{a.target_type}{a.target_id ? ` #${a.target_id}` : ''}</td>
                    <td style={{ fontSize: '.85rem', color: 'var(--text-m)' }}>{a.details || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
