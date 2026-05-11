import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { logActivity } from '../../lib/activity.js'

export default function AdminCategories() {
  const { staff } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew = () => setEditing({ id: null, name: '', sort_order: items.length + 1 })

  const handleSave = async (e) => {
    e.preventDefault()
    if (!editing.name.trim()) return
    const payload = { name: editing.name.trim(), sort_order: parseInt(editing.sort_order) || 0 }
    if (editing.id) {
      await supabase.from('categories').update(payload).eq('id', editing.id)
      await logActivity(staff?.full_name, 'updated category', 'category', editing.id, payload.name)
    } else {
      const { data } = await supabase.from('categories').insert(payload).select().single()
      await logActivity(staff?.full_name, 'created category', 'category', data?.id, payload.name)
    }
    setEditing(null)
    load()
  }

  const handleDelete = async (c) => {
    if (!confirm(`Delete "${c.name}"? Products will be uncategorized.`)) return
    await supabase.from('categories').delete().eq('id', c.id)
    await logActivity(staff?.full_name, 'deleted category', 'category', c.id, c.name)
    load()
  }

  return (
    <>
      <div className="page-title-bar">
        <div>
          <h1>Categories</h1>
          <p>Organize your menu</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <i className="fas fa-plus"></i> Add Category
        </button>
      </div>

      <div className="data-card">
        <div className="table-wrap">
          {loading ? (
            <div className="loader">Loading</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-tags"></i>
              <p>No categories yet.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Order</th><th>Name</th><th></th></tr>
              </thead>
              <tbody>
                {items.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--gold)', fontFamily: 'Cinzel, serif' }}>{c.sort_order}</td>
                    <td>{c.name}</td>
                    <td>
                      <button className="action-icon" onClick={() => setEditing(c)} title="Edit"><i className="fas fa-edit"></i></button>
                      <button className="action-icon danger" onClick={() => handleDelete(c)} title="Delete"><i className="fas fa-trash"></i></button>
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
              <h3>{editing.id ? 'Edit Category' : 'New Category'}</h3>
              <button type="button" className="modal-close" onClick={() => setEditing(null)}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input type="text" className="form-control" value={editing.name}
                  onChange={e => setEditing({ ...editing, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Sort order</label>
                <input type="number" min="0" className="form-control" value={editing.sort_order}
                  onChange={e => setEditing({ ...editing, sort_order: e.target.value })} />
              </div>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
