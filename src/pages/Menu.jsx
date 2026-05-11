import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useCart } from '../context/CartContext.jsx'

export default function Menu() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [activeCat, setActiveCat] = useState('all')
  const [loading, setLoading] = useState(true)
  const [addedId, setAddedId] = useState(null)
  const { addItem } = useCart()

  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('products')
          .select('*, categories(name, sort_order)')
          .eq('is_available', 1)
      ])
      setCategories(cats || [])
      setProducts(prods || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    if (activeCat === 'all') return products
    return products.filter(p => p.category_id === activeCat)
  }, [products, activeCat])

  const handleAdd = (product) => {
    addItem(product)
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1200)
  }

  return (
    <div className="page">
      <div className="page-hero">
        <span className="label-text">Our Offerings</span>
        <h1>The <em>Menu</em></h1>
        <div className="gold-rule" style={{ maxWidth: 160, margin: '.75rem auto' }}>
          <i className="fas fa-circle"></i>
        </div>
        <p>Crafted with care — something for every craving and every occasion.</p>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        {/* Category tabs */}
        <div className="cat-tabs">
          <button
            className={`tab-btn ${activeCat === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCat('all')}
          >
            All Items
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              className={`tab-btn ${activeCat === c.id ? 'active' : ''}`}
              onClick={() => setActiveCat(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loader">Loading menu</div>
        ) : filtered.length === 0 ? (
          <div className="menu-empty">
            <i className="fas fa-mug-hot"></i>
            <p>No items in this category right now.</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filtered.map(p => (
              <article key={p.id} className="menu-card">
                <div className="menu-card-img">
                  {p.image ? <img src={p.image} alt={p.name} /> : <i className="fas fa-mug-hot"></i>}
                  {p.is_featured === 1 && <span className="featured-tag">Featured</span>}
                </div>
                <div className="menu-card-body">
                  <span className="label-text">{p.categories?.name}</span>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <div className="menu-card-foot">
                    <span className="price">₱{Number(p.price).toFixed(2)}</span>
                    <button
                      className={`btn btn-primary btn-add ${addedId === p.id ? 'added' : ''}`}
                      onClick={() => handleAdd(p)}
                      disabled={p.stock === 0}
                    >
                      {addedId === p.id ? (
                        <><i className="fas fa-check"></i> Added</>
                      ) : p.stock === 0 ? 'Sold Out' : (
                        <><i className="fas fa-plus"></i> Add</>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <style>{css}</style>
    </div>
  )
}

const css = `
.cat-tabs {
  display: flex; flex-wrap: wrap; gap: .6rem;
  justify-content: center;
  margin-bottom: 3rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-l);
}
.tab-btn {
  font-family: 'Cinzel', serif;
  font-size: .68rem;
  letter-spacing: .18em;
  text-transform: uppercase;
  padding: .65rem 1.4rem;
  color: var(--text-m);
  border: 1px solid var(--border);
  background: transparent;
  transition: all .25s;
}
.tab-btn:hover { color: var(--gold); border-color: var(--gold); }
.tab-btn.active { background: var(--gold); color: var(--black); border-color: var(--gold); }

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
.menu-card {
  background: var(--black2);
  border: 1px solid var(--border);
  display: flex; flex-direction: column;
  transition: all .3s;
}
.menu-card:hover {
  border-color: var(--gold);
  transform: translateY(-4px);
  box-shadow: var(--shadow-sm);
}
.menu-card-img {
  position: relative;
  height: 170px;
  background: linear-gradient(135deg, var(--black3), var(--dark));
  display: flex; align-items: center; justify-content: center;
  color: var(--gold);
  font-size: 2.6rem;
  opacity: .55;
  overflow: hidden;
}
.menu-card-img img {
  width: 100%; height: 100%; object-fit: cover;
  opacity: 1;
}
.menu-card-img:has(img) { opacity: 1; }
.featured-tag {
  position: absolute; top: 12px; right: 12px;
  background: var(--gold);
  color: var(--black);
  font-family: 'Cinzel', serif;
  font-size: .58rem;
  letter-spacing: .15em;
  text-transform: uppercase;
  padding: .25rem .65rem;
  opacity: 1;
}
.menu-card-body { padding: 1.4rem; flex: 1; display: flex; flex-direction: column; }
.menu-card-body h3 { margin: .35rem 0 .55rem; color: var(--cream); font-size: 1.4rem; }
.menu-card-body p {
  font-size: .87rem; line-height: 1.6;
  flex: 1;
}
.menu-card-foot {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 1.2rem; padding-top: 1rem;
  border-top: 1px solid var(--border-l);
}
.menu-card-foot .price {
  color: var(--gold);
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.4rem;
}
.btn-add {
  padding: .55rem 1.1rem;
  font-size: .6rem;
}
.btn-add.added { background: var(--success); border-color: var(--success); color: var(--white); }

.menu-empty {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-l);
}
.menu-empty i { font-size: 3rem; color: var(--gold); opacity: .4; margin-bottom: 1rem; }
`
