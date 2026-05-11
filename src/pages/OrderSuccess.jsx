import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function OrderSuccess() {
  const { code } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('order_code', code)
        .single()
      setOrder(data)
      setLoading(false)
    }
    load()
  }, [code])

  if (loading) return <div className="page"><div className="loader">Loading</div></div>

  return (
    <div className="page">
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', maxWidth: 640 }}>
        <div className="success-icon">
          <i className="fas fa-check"></i>
        </div>
        <span className="label-text">Order Confirmed</span>
        <h1 style={{ margin: '.5rem 0' }}>Thank <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>You</em></h1>
        <div className="gold-rule" style={{ maxWidth: 140, margin: '.75rem auto 1.5rem' }}>
          <i className="fas fa-circle"></i>
        </div>
        <p style={{ marginBottom: '2rem' }}>
          Your order has been received and is being prepared.
          Save your order code so you can track its progress.
        </p>

        <div className="order-code-box">
          <span className="label-text">Order Code</span>
          <div className="order-code">{code}</div>
        </div>

        {order && (
          <div className="order-summary-box">
            <div className="summary-row"><span>Name</span><span>{order.customer_name}</span></div>
            <div className="summary-row"><span>Type</span><span style={{ textTransform: 'capitalize' }}>{order.delivery_type}</span></div>
            <div className="summary-row"><span>Payment</span><span style={{ textTransform: 'uppercase' }}>{order.payment_method}</span></div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₱{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
          <Link to={`/track/${code}`} className="btn btn-primary">Track Order</Link>
          <Link to="/menu" className="btn btn-outline">Order More</Link>
        </div>
      </div>

      <style>{css}</style>
    </div>
  )
}

const css = `
.success-icon {
  width: 80px; height: 80px;
  margin: 0 auto 1.5rem;
  border: 2px solid var(--gold);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--gold);
  font-size: 2rem;
  animation: scaleIn .5s ease;
}
@keyframes scaleIn {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

.order-code-box {
  padding: 1.5rem;
  margin: 2rem 0;
  background: var(--black2);
  border: 1px solid var(--gold);
}
.order-code {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.2rem;
  color: var(--gold);
  letter-spacing: .15em;
  margin-top: .35rem;
  user-select: all;
}

.order-summary-box {
  padding: 1.5rem;
  margin-top: 1.5rem;
  background: var(--black2);
  border: 1px solid var(--border);
  text-align: left;
}
.order-summary-box .summary-row {
  display: flex; justify-content: space-between;
  padding: .55rem 0;
  font-size: .95rem;
}
.order-summary-box .summary-row span:first-child {
  color: var(--text-l);
  font-family: 'Cinzel', serif;
  font-size: .68rem;
  letter-spacing: .18em;
  text-transform: uppercase;
}
.order-summary-box .summary-row.total {
  border-top: 1px solid var(--border);
  margin-top: .5rem; padding-top: 1rem;
}
.order-summary-box .summary-row.total span:last-child {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.4rem;
  color: var(--gold);
}
`
