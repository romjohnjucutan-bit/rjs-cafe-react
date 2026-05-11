import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page">
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <span className="label-text">404</span>
        <h1>Page Not <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Found</em></h1>
        <div className="gold-rule" style={{ maxWidth: 120, margin: '.75rem auto 1.5rem' }}>
          <i className="fas fa-circle"></i>
        </div>
        <p style={{ marginBottom: '2rem' }}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    </div>
  )
}
