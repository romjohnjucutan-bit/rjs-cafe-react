import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { logActivity } from '../../lib/activity.js'

const BLANK = {
  id: null, name: '', description: '', price: '', stock: 0,
  category_id: '', is_available: 1, is_featured: 0, image: ''
}

export default function AdminProducts() {
  const { staff } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*, categories(name)').order('id', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order')
    ])
    setProducts(prods || [])
    setCategories(cats || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = search.trim()
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products

  const openNew = () => setEditing({ ...BLANK, category_id: categories[0]?.id || '' })
  const openEdit = (p) => setEditing({ ...p, price: p.price.toString() })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setEditing({ ...editing, [name]: checked ? 1 : 0 })
    } else {
      setEditing({ ...editing, [name]: value })
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`
      const { error } = await supabase.storage.from('product-images').upload(path, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
      setEditing({ ...editing, image: publicUrl })
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!editing.name.trim() || !editing.price || !editing.category_id) {
      alert('Name, price, and category are required.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: editing.name.trim(),
        description: editing.description.trim() || null,
        price: parseFloat(editing.price),
        stock: parseInt(editing.stock) || 0,
        category_id: parseInt(editing.category_id),
        is_available: editing.is_available ? 1 : 0,
        is_featured: editing.is_featured ? 1 : 0,
        image: editing.image || null
      }
      if (editing.id) {
        await supabase.from('products').update(payload).eq('id', editing.id)
        await logActivity(staff?.full_name, 'updated product', 'product', editing.id, payload.name)
      } else {
        const { data } = await supabase.from('products').insert(payload).select().single()
        await logActivity(staff?.full_name, 'created product', 'product', data?.id, payload.name)
      }
      setEditing(null)
      load()
    } catch (err) {
      alert('Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (p) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    await supabase.from('products').delete().eq('id', p.id)
    await logActivity(staff?.full_name, 'deleted product', 'product', p.id, p.name)
    load()
  }

  return (
    <>
      <div className="page-title-bar">
        <div>
          <h1>Products</h1>
          <p>{products.length} total · manage menu items</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <i className="fas fa-plus"></i> Add Product
        </button>
      </div>

      <div className="data-card">
        <div className="filter-bar">
          <input type="text" className="form-control" placeholder="Search products..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }} />
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="loader">Loading</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-box-open"></i>
              <p>No products yet. Click "Add Product" to create one.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="prod-thumb">
                        {p.image ? <img src={p.image} alt={p.name} /> : <i className="fas fa-mug-hot"></i>}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--cream)' }}>{p.name}</div>
                      {p.is_featured === 1 && <span className="badge badge-completed" style={{ marginTop: 4 }}>Featured</span>}
                    </td>
                    <td>{p.categories?.name || '—'}</td>
                    <td>₱{Number(p.price).toFixed(2)}</td>
                    <td>{p.stock}</td>
                    <td>
                      <span className={`badge ${p.is_available ? 'badge-completed' : 'badge-cancelled'}`}>
                        {p.is_available ? 'Available' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <button className="action-icon" onClick={() => openEdit(p)} title="Edit"><i className="fas fa-edit"></i></button>
                      <button className="action-icon danger" onClick={() => handleDelete(p)} title="Delete"><i className="fas fa-trash"></i></button>
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
              <h3><i className="fas fa-box-open"></i> {editing.id ? 'Edit Product' : 'New Product'}</h3>
              <button type="button" className="modal-close" onClick={() => setEditing(null)}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input name="name" type="text" className="form-control" value={editing.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows="2" className="form-control" value={editing.description || ''} onChange={handleChange} />
              </div>
              <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="form-group">
                  <label>Price *</label>
                  <input name="price" type="number" step="0.01" min="0" className="form-control" value={editing.price} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input name="stock" type="number" min="0" className="form-control" value={editing.stock} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select name="category_id" className="form-control" value={editing.category_id} onChange={handleChange} required>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Image</label>
                {editing.image && (
                  <div className="image-preview">
                    <img src={editing.image} alt="" />
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => setEditing({ ...editing, image: '' })}>Remove</button>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="form-control" />
                {uploading && <small style={{ color: 'var(--gold)' }}>Uploading...</small>}
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '.5rem' }}>
                <label className="check-label">
                  <input type="checkbox" name="is_available" checked={!!editing.is_available} onChange={handleChange} />
                  Available
                </label>
                <label className="check-label">
                  <input type="checkbox" name="is_featured" checked={!!editing.is_featured} onChange={handleChange} />
                  Featured
                </label>
              </div>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .prod-thumb {
          width: 48px; height: 48px;
          background: var(--black3);
          display: flex; align-items: center; justify-content: center;
          color: var(--gold); opacity: .8;
          overflow: hidden;
        }
        .prod-thumb img { width: 100%; height: 100%; object-fit: cover; }
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
        .image-preview {
          display: flex; align-items: center; gap: .8rem;
          padding: .6rem;
          background: var(--black3);
          border: 1px solid var(--border-l);
          margin-bottom: .6rem;
        }
        .image-preview img { width: 60px; height: 60px; object-fit: cover; }
      `}</style>
    </>
  )
}
