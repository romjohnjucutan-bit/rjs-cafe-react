import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('is_featured', 1)
        .eq('is_available', 1)
        .order('id', { ascending: false })
        .limit(6)
      setFeatured(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="page home-page">
      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="hero-eyebrow">
            <span></span>
            Est · 2024
            <span></span>
          </div>
          <h1>A Quiet <em>Indulgence</em></h1>
          <p className="home-sub">
            Hand-pulled espresso, slow mornings, and the kind of pastries that make you sit
            a little longer. Welcome to RJ's Café.
          </p>
          <div className="home-cta">
            <Link to="/menu" className="btn btn-primary">
              <i className="fas fa-mug-hot"></i> Explore Menu
            </Link>
            <Link to="/reservations" className="btn btn-outline">Reserve a Table</Link>
          </div>
        </div>
        <div className="deco-ring deco-ring-1"></div>
        <div className="deco-ring deco-ring-2"></div>
      </section>

      {/* FEATURED */}
      <section className="featured-section">
        <div className="container">
          <div className="section-head">
            <span className="label-text">Bestsellers</span>
            <h2>House <em>Favorites</em></h2>
            <div className="gold-rule" style={{ maxWidth: 180, margin: '.5rem auto 0' }}>
              <i className="fas fa-circle"></i>
            </div>
          </div>

          {loading ? (
            <div className="loader">Loading</div>
          ) : (
            <div className="featured-grid">
              {featured.map(p => (
                <div key={p.id} className="featured-card">
                  <div className="featured-img">
                    {p.image ? <img src={p.image} alt={p.name} /> : <i className="fas fa-mug-hot"></i>}
                  </div>
                  <div className="featured-body">
                    <span className="label-text">{p.categories?.name}</span>
                    <h3>{p.name}</h3>
                    <p>{p.description}</p>
                    <div className="featured-foot">
                      <span className="price">₱{Number(p.price).toFixed(2)}</span>
                      <Link to="/menu" className="featured-link">View →</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/menu" className="btn btn-outline">See Full Menu</Link>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section">
        <div className="container about-grid">
          <div>
            <span className="label-text">Our Story</span>
            <h2>Slow coffee.<br/><em>Sincere</em> hospitality.</h2>
            <div className="gold-rule" style={{ maxWidth: 80, margin: '.7rem 0 1.5rem' }}>
              <i className="fas fa-circle"></i>
            </div>
            <p>
              RJ's Café began as a small dream — a corner where good coffee meets good company.
              Every cup is poured with care, every pastry baked the morning of, and every
              guest treated like an old friend.
            </p>
            <p style={{ marginTop: '1rem' }}>
              We're not in a hurry. Neither should you be.
            </p>
          </div>
          <div className="about-image"></div>
        </div>
      </section>

      <style>{css}</style>
    </div>
  )
}

const css = `
.home-page { padding-top: 0; }

.home-hero {
  position: relative;
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background:
    linear-gradient(to bottom, rgba(10,9,6,.78), rgba(10,9,6,.55), rgba(10,9,6,.88)),
    url('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&q=80') center/cover no-repeat;
  padding: 6rem 1.5rem 4rem;
  overflow: hidden;
}
.home-hero-inner {
  text-align: center;
  max-width: 780px;
  position: relative;
  z-index: 2;
  animation: fadeUp .9s ease both;
}
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 1rem;
  font-family: 'Cinzel', serif;
  font-size: .68rem;
  letter-spacing: .35em;
  color: var(--gold);
  margin-bottom: 1.5rem;
}
.hero-eyebrow span {
  width: 40px; height: 1px; background: var(--gold-d);
}
.home-hero h1 {
  font-size: clamp(4rem, 10vw, 7.5rem);
  line-height: .95;
  margin-bottom: .6rem;
}
.home-hero h1 em { color: var(--gold); font-style: italic; }
.home-sub {
  font-size: clamp(1rem, 1.7vw, 1.15rem);
  margin: 1.8rem auto 2.5rem;
  max-width: 540px;
  line-height: 1.85;
}
.home-cta {
  display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
}
.deco-ring {
  position: absolute;
  border: 1px solid rgba(201,168,76,.15);
  border-radius: 50%;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  animation: spin 50s linear infinite;
  pointer-events: none;
  max-width: 100vw;
  max-height: 100vw;
}
.deco-ring-1 { width: clamp(320px, 90vw, 700px); height: clamp(320px, 90vw, 700px); }
.deco-ring-2 { width: clamp(420px, 100vw, 1000px); height: clamp(420px, 100vw, 1000px); animation-duration: 80s; animation-direction: reverse; opacity: .6; }
@keyframes spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* FEATURED */
.featured-section { padding: 6rem 0 4rem; background: var(--black); }
.section-head { text-align: center; margin-bottom: 3rem; }
.section-head h2 em { color: var(--gold); font-style: italic; }
.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1.5rem;
}
.featured-card {
  background: var(--black2);
  border: 1px solid var(--border);
  transition: border-color .3s, transform .3s;
}
.featured-card:hover { border-color: var(--gold); transform: translateY(-4px); }
.featured-img {
  height: 180px;
  background: linear-gradient(135deg, var(--black3), var(--dark));
  display: flex; align-items: center; justify-content: center;
  color: var(--gold);
  font-size: 3rem;
  opacity: .5;
  overflow: hidden;
}
.featured-img img {
  width: 100%; height: 100%; object-fit: cover;
}
.featured-card:has(img) .featured-img { opacity: 1; }
.featured-body { padding: 1.5rem; }
.featured-body h3 { margin: .4rem 0 .6rem; color: var(--cream); }
.featured-body p { font-size: .88rem; min-height: 3em; }
.featured-foot {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 1.2rem; padding-top: 1rem;
  border-top: 1px solid var(--border-l);
}
.price { color: var(--gold); font-size: 1.2rem; font-family: 'Cormorant Garamond', serif; }
.featured-link {
  font-family: 'Cinzel', serif;
  font-size: .65rem;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--gold);
  transition: color .2s;
}
.featured-link:hover { color: var(--gold-l); }
@media (max-width: 600px) {
  .featured-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: .9rem;
  }
  .featured-img { height: 140px; }
  .featured-body { padding: 1rem; }
  .featured-body h3 { font-size: 1.1rem; }
  .featured-body p { font-size: .8rem; min-height: 0; }
  .featured-foot { flex-direction: column; align-items: flex-start; gap: .4rem; }
  .price { font-size: 1.05rem; }
  .featured-link { font-size: .6rem; }
}

/* ABOUT */
.about-section { padding: 6rem 0; background: var(--black2); }
.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}
.about-grid h2 em { color: var(--gold); font-style: italic; }
.about-image {
  aspect-ratio: 4/5;
  background:
    linear-gradient(rgba(10,9,6,.5), rgba(10,9,6,.5)),
    url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80') center/cover;
  display: flex; align-items: center; justify-content: center;
  color: var(--gold);
  font-size: 4rem;
  opacity: .85;
  border: 1px solid var(--border);
}
@media (max-width: 768px) {
  .about-grid { grid-template-columns: 1fr; gap: 2.5rem; }
  .deco-ring-1 { width: 500px; height: 500px; }
  .deco-ring-2 { display: none; }
}
`
