import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { logActivity } from '../../lib/activity.js'

const BLANK = { id: null, full_name: '', email: '', phone: '', role: 'staff', is_active: 1 }

export default function AdminStaff() {
  const { staff: me } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('staff').select('*').order('id')
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setMsg('')
    if (!editing.full_name.trim() || !editing.email.trim()) return

    const payload = {
      full_name: editing.full_name.trim(),
      email: editing.email.trim(),
      phone: editing.phone.trim() || null,
      role: editing.role,
      is_active: editing.is_active ? 1 : 0
    }

    if (editing.id) {
      await supabase.from('staff').update(payload).eq('id', editing.id)
      await logActivity(me?.full_name, 'updated staff', 'staff', editing.id, payload.full_name)
      setEditing(null)
      load()
    } else {
      // Create new — need to add as Auth user AND staff row
      // For school project: signal that admin must create the Auth user manually
      const { error } = await supabase.from('staff').insert(payload)
      if (error) {
        setMsg(error.message)
        return
      }
      await logActivity(me?.full_name, 'created staff', 'staff', null, payload.full_name)
      setMsg(`Staff row created. IMPORTANT: also create the login in Supabase → Authentication → Users with email "${payload.email}" so this person can sign in.`)
      load()
    }
  }

  const toggleActive = async (s) => {
    if (s.id === me?.id) {
      alert("You can't deactivate your own account.")
      return
    }
    await supabase.from('staff').update({ is_active: s.is_active === 1 ? 0 : 1 }).eq('id', s.id)
    await logActivity(me?.full_name, s.is_active === 1 ? 'deactivated staff' : 'activated staff', 'staff', s.id, s.full_name)
    load()
  }

  const handleDelete = async (s) => {
    if (s.id === me?.id) {
      alert("You can't delete your own account.")
      return
    }
    if (!confirm(`Delete "${s.full_name}"?\n\nNote: This only removes the staff row. To fully revoke access, also delete the Auth user in Supabase → Authentication → Users.`)) return
    await supabase.from('staff').delete().eq('id', s.id)
    await logActivity(me?.full_name, 'deleted staff', 'staff', s.id, s.full_name)
    load()
  }

  return (
    <>
      <div className="page-title-bar">
        <div>
          <h1>Staff Management</h1>
          <p>Manage admin and staff accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(BLANK); setMsg('') }}>
          <i className="fas fa-user-plus"></i> Add Staff
        </button>
      </div>

      {msg && <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>{msg}</div>}

      <div className="data-card">
        <div className="table-wrap">
          {loading ? <div className="loader">Loading</div> : (
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {items.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ color: 'var(--cream)' }}>
                        {s.full_name} {s.id === me?.id && <span style={{ color: 'var(--gold)', fontSize: '.75rem' }}>(you)</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: '.88rem' }}>{s.email}</td>
                    <td style={{ fontSize: '.88rem' }}>{s.phone || '—'}</td>
                    <td><span className={`role-pill role-${s.role}`}>{s.role}</span></td>
                    <td>
                      <span className={`badge ${s.is_active ? 'badge-completed' : 'badge-cancelled'}`}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="action-icon" onClick={() => setEditing(s)} title="Edit"><i className="fas fa-edit"></i></button>
                      <button className="action-icon" onClick={() => toggleActive(s)} title="Toggle"><i className="fas fa-power-off"></i></button>
                      <button className="action-icon danger" onClick={() => handleDelete(s)} title="Delete"><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <form className="modal-card" onClick={e => e.stopPropagation()} onSubmit={handleSave}>
            <div className="modal-head">
              <h3>{editing.id ? 'Edit Staff' : 'New Staff'}</h3>
              <button type="button" className="modal-close" onClick={() => setEditing(null)}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
              {!editing.id && (
                <div className="alert alert-info" style={{ marginBottom: '1rem', fontSize: '.85rem' }}>
                  <strong>Heads up:</strong> creating staff here adds a database row only.
                  You'll also need to create their login in Supabase → <strong>Authentication → Users</strong> with the same email.
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" className="form-control" value={editing.full_name}
                    onChange={e => setEditing({ ...editing, full_name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" className="form-control" value={editing.phone}
                    onChange={e => setEditing({ ...editing, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" className="form-control" value={editing.email}
                  onChange={e => setEditing({ ...editing, email: e.target.value })} required
                  disabled={!!editing.id} />
                {editing.id && <small style={{ color: 'var(--text-l)' }}>Email can't be changed here. Update it in Supabase Authentication instead.</small>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role *</label>
                  <select className="form-control" value={editing.role}
                    onChange={e => setEditing({ ...editing, role: e.target.value })}>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <label className="check-label" style={{ marginBottom: '.8rem' }}>
                    <input type="checkbox" checked={!!editing.is_active}
                      onChange={e => setEditing({ ...editing, is_active: e.target.checked ? 1 : 0 })} />
                    Active
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .check-label {
          display: flex; align-items: center; gap: .5rem;
          font-family: 'Cinzel', serif;
          font-size: .65rem;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--text);
          cursor: pointer;
        }
        .check-label input { accent-color: var(--gold); }
      `}</style>
    </>
  )
}
