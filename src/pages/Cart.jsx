import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
          <i className="fas fa-shopping-bag" style={{ fontSize: '3.5rem', color: 'var(--gold)', opacity: .4, marginBottom: '1.5rem' }}></i>
          <h2>Your <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>cart</em> is empty</h2>
          <p style={{ margin: '1rem 0 2rem' }}>Looks like you haven't added anything yet. Why not start with a bestseller?</p>
          <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-hero" style={{ padding: '4rem 2rem 2rem' }}>
        <span className="label-text">Your Order</span>
        <h1><em>Cart</em></h1>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
        <div className="cart-layout">
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">
                  <i className="fas fa-mug-hot"></i>
                </div>
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <span className="cart-item-price">₱{item.price.toFixed(2)}</span>
                </div>
                <div className="cart-item-actions">
                  <div className="qty-control">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <div className="cart-item-subtotal">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button className="cart-item-remove" onClick={() => removeItem(item.id)} aria-label="Remove">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            ))}
            <button className="cart-clear" onClick={clearCart}>
              <i className="fas fa-trash"></i> Clear cart
            </button>
          </div>

          <aside className="cart-summary">
            <h3>Order Summary</h3>
            <div className="gold-rule"><i className="fas fa-circle"></i></div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row muted">
              <span>Delivery</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-block">
              Checkout <i className="fas fa-arrow-right"></i>
            </Link>
            <Link to="/menu" className="cart-continue">← Continue shopping</Link>
          </aside>
        </div>
      </div>

      <style>{css}</style>
    </div>
  )
}

const css = `
.cart-layout {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 2.5rem;
  align-items: start;
}
@media (max-width: 900px) { .cart-layout { grid-template-columns: 1fr; } }

.cart-items { display: flex; flex-direction: column; gap: 1rem; }
.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 1.25rem;
  align-items: center;
  padding: 1.2rem;
  background: var(--black2);
  border: 1px solid var(--border);
}
.cart-item-img {
  width: 80px; height: 80px;
  background: linear-gradient(135deg, var(--black3), var(--dark));
  display: flex; align-items: center; justify-content: center;
  color: var(--gold);
  font-size: 1.6rem;
  opacity: .6;
}
.cart-item-info h3 {
  font-size: 1.2rem; color: var(--cream);
  margin-bottom: .35rem;
}
.cart-item-price { color: var(--text-m); font-size: .9rem; }
.cart-item-actions { display: flex; align-items: center; gap: 1.2rem; }
.qty-control {
  display: flex; align-items: center; gap: .25rem;
  border: 1px solid var(--border);
}
.qty-control button {
  width: 32px; height: 32px;
  color: var(--gold); font-size: 1rem;
  transition: background .2s;
}
.qty-control button:hover { background: var(--black3); }
.qty-control span {
  min-width: 32px;
  text-align: center;
  font-family: 'Cinzel', serif;
  color: var(--cream);
}
.cart-item-subtotal {
  color: var(--gold);
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.3rem;
  min-width: 90px;
  text-align: right;
}
.cart-item-remove {
  color: var(--text-l);
  font-size: 1rem;
  padding: .35rem;
  transition: color .2s;
}
.cart-item-remove:hover { color: var(--danger); }

.cart-clear {
  align-self: flex-start;
  color: var(--text-l);
  font-family: 'Cinzel', serif;
  font-size: .65rem;
  letter-spacing: .18em;
  text-transform: uppercase;
  padding: .6rem 0;
  margin-top: .5rem;
  transition: color .2s;
}
.cart-clear:hover { color: var(--danger); }

.cart-summary {
  padding: 2rem;
  background: var(--black2);
  border: 1px solid var(--border);
  position: sticky; top: 100px;
}
.cart-summary h3 {
  font-family: 'Cinzel', serif;
  font-size: .8rem;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--gold);
}
.summary-row {
  display: flex; justify-content: space-between;
  padding: .85rem 0;
  font-size: .95rem;
  color: var(--text);
}
.summary-row.muted { color: var(--text-l); font-size: .85rem; }
.summary-row.total {
  border-top: 1px solid var(--border);
  margin-top: .5rem; padding-top: 1.2rem;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.4rem;
  color: var(--gold);
}
.cart-continue {
  display: block; text-align: center; margin-top: 1rem;
  font-family: 'Cinzel', serif;
  font-size: .65rem;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--text-m);
  transition: color .2s;
}
.cart-continue:hover { color: var(--gold); }

@media (max-width: 600px) {
  .cart-item { grid-template-columns: 60px 1fr; }
  .cart-item-actions { grid-column: 1 / -1; justify-content: space-between; }
}
`
