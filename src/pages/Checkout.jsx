import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { supabase, generateCode } from '../lib/supabase.js'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_type: 'pickup',
    delivery_address: '',
    payment_method: 'cash',
    special_requests: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const deliveryFee = form.delivery_type === 'delivery' ? 50 : 0
  const total = subtotal + deliveryFee

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
          <h2>No items to check out</h2>
          <p style={{ margin: '1rem 0 2rem' }}>Your cart is empty.</p>
          <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
        </div>
      </div>
    )
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.customer_name.trim() || !form.customer_phone.trim()) {
      setError('Name and phone are required.')
      return
    }
    if (form.delivery_type === 'delivery' && !form.delivery_address.trim()) {
      setError('Please enter a delivery address.')
      return
    }

    setSubmitting(true)
    try {
      const orderCode = generateCode('ORD')

      // Insert order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          order_code: orderCode,
          customer_name: form.customer_name.trim(),
          customer_phone: form.customer_phone.trim(),
          delivery_type: form.delivery_type,
          delivery_address: form.delivery_address.trim() || null,
          payment_method: form.payment_method,
          special_requests: form.special_requests.trim() || null,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          status: 'received'
        })
        .select()
        .single()

      if (orderErr) throw orderErr

      // Insert order items
      const orderItems = items.map(it => ({
        order_id: order.id,
        product_id: it.id,
        product_name: it.name,
        product_price: it.price,
        quantity: it.quantity,
        subtotal: it.price * it.quantity
      }))

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
      if (itemsErr) throw itemsErr

      clearCart()
      navigate(`/order-success/${orderCode}`)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not place order. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-hero" style={{ padding: '4rem 2rem 2rem' }}>
        <span className="label-text">Almost there</span>
        <h1><em>Checkout</em></h1>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="checkout-layout">
          <div className="checkout-form">
            <section className="form-section">
              <h3>Contact</h3>
              <div className="gold-rule"><i className="fas fa-circle"></i></div>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" name="customer_name" className="form-control"
                    value={form.customer_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input type="tel" name="customer_phone" className="form-control"
                    value={form.customer_phone} onChange={handleChange} required />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3>Order Type</h3>
              <div className="gold-rule"><i className="fas fa-circle"></i></div>
              <div className="radio-group">
                <label className={`radio-card ${form.delivery_type === 'pickup' ? 'active' : ''}`}>
                  <input type="radio" name="delivery_type" value="pickup"
                    checked={form.delivery_type === 'pickup'} onChange={handleChange} />
                  <i className="fas fa-shopping-bag"></i>
                  <span>Pickup</span>
                  <small>Free · Ready in 15-20 min</small>
                </label>
                <label className={`radio-card ${form.delivery_type === 'delivery' ? 'active' : ''}`}>
                  <input type="radio" name="delivery_type" value="delivery"
                    checked={form.delivery_type === 'delivery'} onChange={handleChange} />
                  <i className="fas fa-motorcycle"></i>
                  <span>Delivery</span>
                  <small>+ ₱50 · 30-45 min</small>
                </label>
              </div>

              {form.delivery_type === 'delivery' && (
                <div className="form-group" style={{ marginTop: '1.2rem' }}>
                  <label>Delivery Address *</label>
                  <textarea name="delivery_address" className="form-control" rows="3"
                    value={form.delivery_address} onChange={handleChange}
                    placeholder="House #, street, barangay, landmark..." required />
                </div>
              )}
            </section>

            <section className="form-section">
              <h3>Payment</h3>
              <div className="gold-rule"><i className="fas fa-circle"></i></div>
              <div className="radio-group radio-group-3">
                <label className={`radio-card ${form.payment_method === 'cash' ? 'active' : ''}`}>
                  <input type="radio" name="payment_method" value="cash"
                    checked={form.payment_method === 'cash'} onChange={handleChange} />
                  <i className="fas fa-money-bill-wave"></i>
                  <span>Cash</span>
                </label>
                <label className={`radio-card ${form.payment_method === 'gcash' ? 'active' : ''}`}>
                  <input type="radio" name="payment_method" value="gcash"
                    checked={form.payment_method === 'gcash'} onChange={handleChange} />
                  <i className="fas fa-mobile-alt"></i>
                  <span>GCash</span>
                </label>
                <label className={`radio-card ${form.payment_method === 'cod' ? 'active' : ''}`}>
                  <input type="radio" name="payment_method" value="cod"
                    checked={form.payment_method === 'cod'} onChange={handleChange} />
                  <i className="fas fa-hand-holding-usd"></i>
                  <span>COD</span>
                </label>
              </div>
            </section>

            <section className="form-section">
              <h3>Special Requests</h3>
              <div className="gold-rule"><i className="fas fa-circle"></i></div>
              <div className="form-group">
                <textarea name="special_requests" className="form-control" rows="3"
                  value={form.special_requests} onChange={handleChange}
                  placeholder="Any preferences, allergies, or notes for us..." />
              </div>
            </section>
          </div>

          <aside className="checkout-summary">
            <h3>Your Order</h3>
            <div className="gold-rule"><i className="fas fa-circle"></i></div>
            <ul className="summary-items">
              {items.map(it => (
                <li key={it.id}>
                  <span className="qty">×{it.quantity}</span>
                  <span className="name">{it.name}</span>
                  <span className="price">₱{(it.price * it.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? 'Free' : `₱${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Placing...' : <>Place Order <i className="fas fa-check"></i></>}
            </button>
          </aside>
        </form>
      </div>

      <style>{css}</style>
    </div>
  )
}

const css = `
.checkout-layout {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2.5rem;
  align-items: start;
}
@media (max-width: 900px) { .checkout-layout { grid-template-columns: 1fr; } }

.checkout-form { display: flex; flex-direction: column; gap: 1.8rem; }
.form-section {
  padding: 1.8rem;
  background: var(--black2);
  border: 1px solid var(--border);
}
.form-section h3 {
  font-family: 'Cinzel', serif;
  font-size: .8rem;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--gold);
}

.radio-group { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.radio-group-3 { grid-template-columns: repeat(3, 1fr); }
.radio-card {
  display: flex; flex-direction: column; align-items: center; gap: .5rem;
  padding: 1.2rem 1rem;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all .25s;
  text-align: center;
}
.radio-card input { display: none; }
.radio-card i { font-size: 1.6rem; color: var(--gold); opacity: .6; transition: opacity .25s; }
.radio-card span {
  font-family: 'Cinzel', serif;
  font-size: .68rem;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--text);
}
.radio-card small { color: var(--text-l); font-size: .72rem; }
.radio-card:hover { border-color: var(--gold); }
.radio-card.active {
  border-color: var(--gold);
  background: rgba(201,168,76,.06);
}
.radio-card.active i { opacity: 1; }

@media (max-width: 500px) {
  .radio-group, .radio-group-3 { grid-template-columns: 1fr; }
}

.checkout-summary {
  padding: 1.8rem;
  background: var(--black2);
  border: 1px solid var(--border);
  position: sticky; top: 100px;
}
.checkout-summary h3 {
  font-family: 'Cinzel', serif;
  font-size: .8rem;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--gold);
}
.summary-items {
  margin: 1rem 0;
  border-bottom: 1px solid var(--border-l);
  padding-bottom: 1rem;
}
.summary-items li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: .8rem;
  padding: .5rem 0;
  font-size: .9rem;
}
.summary-items .qty { color: var(--gold); font-family: 'Cinzel', serif; font-size: .8rem; }
.summary-items .name { color: var(--text); }
.summary-items .price { color: var(--gold); font-family: 'Cormorant Garamond', serif; font-size: 1.05rem; }

.summary-row {
  display: flex; justify-content: space-between;
  padding: .55rem 0;
  font-size: .9rem;
}
.summary-row.total {
  border-top: 1px solid var(--border);
  margin-top: .5rem; padding-top: 1rem;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.4rem;
  color: var(--gold);
}
`
