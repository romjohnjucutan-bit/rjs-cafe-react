import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const STATUS_FLOW = ['received', 'preparing', 'ready', 'completed']

export default function Track() {
  const { code: paramCode } = useParams()
  const navigate = useNavigate()
  const [code, setCode] = useState(paramCode || '')
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const lookup = async (lookupCode) => {
    if (!lookupCode.trim()) {
      setError('Please enter an order code.')
      return
    }
    setLoading(true)
    setError('')
    setOrder(null)

    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('order_code', lookupCode.trim().toUpperCase())
      .maybeSingle()

    if (orderErr || !orderData) {
      setError("We couldn't find that order. Double-check the code and try again.")
      setLoading(false)
      return
    }

    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderData.id)

    setOrder(orderData)
    setItems(itemsData || [])
    setLoading(false)
  }

  useEffect(() => {
    if (paramCode) lookup(paramCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramCode])

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate(`/track/${code.trim().toUpperCase()}`)
  }

  const currentStep = order ? STATUS_FLOW.indexOf(order.status) : -1

  return (
    <div className="page">
      <div className="page-hero" style={{ padding: '4rem 2rem 2rem' }}>
        <span className="label-text">Stay Updated</span>
        <h1>Track Your <em>Order</em></h1>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem 4rem', maxWidth: 800 }}>
        <form onSubmit={handleSubmit} className="track-form">
          <input
            type="text"
            className="form-control"
            placeholder="Enter your order code (e.g. ORD-A1B2C3D4)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Looking up...' : <><i className="fas fa-search"></i> Track</>}
          </button>
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        {order && (
          <div className="track-result">
            <div className="track-header">
              <div>
                <span className="label-text">Order</span>
                <h2>{order.order_code}</h2>
              </div>
              <span className={`badge badge-${order.status}`}>{order.status.replace('_', ' ')}</span>
            </div>

            {/* Progress steps */}
            {order.status !== 'cancelled' && (
              <div className="progress-bar">
                {STATUS_FLOW.map((status, idx) => (
                  <div key={status} className={`step ${idx <= currentStep ? 'done' : ''} ${idx === currentStep ? 'current' : ''}`}>
                    <div className="step-dot">
                      <i className={`fas ${idx <= currentStep ? 'fa-check' : 'fa-circle'}`}></i>
                    </div>
                    <span className="step-label">{status.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="track-grid">
              <div className="track-box">
                <h4>Details</h4>
                <div className="gold-rule"><i className="fas fa-circle"></i></div>
                <div className="kv"><span>Name</span><span>{order.customer_name}</span></div>
                <div className="kv"><span>Phone</span><span>{order.customer_phone}</span></div>
                <div className="kv"><span>Type</span><span style={{ textTransform: 'capitalize' }}>{order.delivery_type}</span></div>
                <div className="kv"><span>Payment</span><span style={{ textTransform: 'uppercase' }}>{order.payment_method}</span></div>
                {order.delivery_address && (
                  <div className="kv"><span>Address</span><span>{order.delivery_address}</span></div>
                )}
                {order.special_requests && (
                  <div className="kv"><span>Notes</span><span>{order.special_requests}</span></div>
                )}
              </div>

              <div className="track-box">
                <h4>Items</h4>
                <div className="gold-rule"><i className="fas fa-circle"></i></div>
                {items.map(it => (
                  <div key={it.id} className="track-item">
                    <span className="qty">×{it.quantity}</span>
                    <span className="name">{it.product_name}</span>
                    <span className="price">₱{Number(it.subtotal).toFixed(2)}</span>
                  </div>
                ))}
                <div className="kv total">
                  <span>Total</span>
                  <span>₱{Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{css}</style>
    </div>
  )
}

const css = `
.track-form {
  display: flex; gap: .8rem;
  margin-bottom: 2rem;
}
.track-form .form-control { flex: 1; }
@media (max-width: 600px) {
  .track-form { flex-direction: column; }
}

.track-result {
  background: var(--black2);
  border: 1px solid var(--border);
  padding: 2rem;
}
.track-header {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-l);
  margin-bottom: 2rem;
}
.track-header h2 {
  font-size: 1.8rem;
  color: var(--gold);
  margin-top: .25rem;
}

.progress-bar {
  display: flex; justify-content: space-between;
  margin: 0 auto 2.5rem;
  max-width: 600px;
  position: relative;
}
.progress-bar::before {
  content: '';
  position: absolute;
  top: 16px; left: 5%; right: 5%;
  height: 1px;
  background: var(--border);
  z-index: 0;
}
.step {
  display: flex; flex-direction: column; align-items: center; gap: .55rem;
  position: relative; z-index: 1;
  flex: 1;
}
.step-dot {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: var(--black);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-l);
  font-size: .65rem;
  transition: all .3s;
}
.step.done .step-dot {
  border-color: var(--gold);
  background: var(--gold);
  color: var(--black);
}
.step.current .step-dot {
  box-shadow: 0 0 0 4px rgba(201,168,76,.2);
}
.step-label {
  font-family: 'Cinzel', serif;
  font-size: .58rem;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--text-l);
  text-align: center;
}
.step.done .step-label { color: var(--gold); }

.track-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
@media (max-width: 700px) { .track-grid { grid-template-columns: 1fr; } }

.track-box {
  padding: 1.5rem;
  background: var(--black);
  border: 1px solid var(--border-l);
}
.track-box h4 {
  font-family: 'Cinzel', serif;
  font-size: .72rem;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--gold);
}

.kv {
  display: flex; justify-content: space-between;
  padding: .55rem 0;
  font-size: .9rem;
  gap: 1rem;
}
.kv span:first-child {
  color: var(--text-l);
  font-family: 'Cinzel', serif;
  font-size: .65rem;
  letter-spacing: .18em;
  text-transform: uppercase;
  flex-shrink: 0;
}
.kv span:last-child { color: var(--text); text-align: right; }
.kv.total {
  border-top: 1px solid var(--border);
  margin-top: .8rem; padding-top: 1rem;
}
.kv.total span:last-child {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.3rem;
  color: var(--gold);
}

.track-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: .8rem;
  padding: .5rem 0;
  font-size: .9rem;
}
.track-item .qty { color: var(--gold); font-family: 'Cinzel', serif; font-size: .8rem; }
.track-item .name { color: var(--text); }
.track-item .price { color: var(--gold); font-family: 'Cormorant Garamond', serif; }
`
