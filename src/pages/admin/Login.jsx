import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AdminLogin() {
  const { session, staff, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (session && staff) return <Navigate to="/admin" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error } = await signIn(email.trim(), password)
    if (error) {
      setError(error.message || 'Invalid credentials.')
      setSubmitting(false)
      return
    }
    navigate('/admin')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img src="/logo.png" alt="RJ's Cafe logo" className="brand-logo" />
          <h1>RJ's <em>Café</em></h1>
          <span className="label-text">Staff Portal</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email" className="form-control" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@rjscafe.ph"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password" className="form-control" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Signing in...' : <>Sign In <i className="fas fa-arrow-right"></i></>}
          </button>
        </form>

        <Link to="/" className="login-back">← Back to site</Link>
      </div>

      <style>{css}</style>
    </div>
  )
}

const css = `
.login-page {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 2rem 1rem;
  background:
    linear-gradient(rgba(10,9,6,.85), rgba(10,9,6,.92)),
    url('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&q=80') center/cover no-repeat fixed;
}
.login-card {
  width: 100%; max-width: 420px;
  padding: 2.5rem 2rem;
  background: var(--black2);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.login-brand {
  text-align: center;
  margin-bottom: 2rem;
}
.login-brand .brand-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin: 0 auto .8rem;
}
.login-brand h1 {
  font-size: 2.2rem;
  margin: 0;
}
.login-brand h1 em { color: var(--gold); font-style: italic; }
.login-brand .label-text { display: block; margin-top: .25rem; }
.login-form { display: flex; flex-direction: column; gap: 1rem; }
.login-back {
  display: block;
  text-align: center;
  margin-top: 1.5rem;
  font-family: 'Cinzel', serif;
  font-size: .65rem;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--text-m);
  transition: color .2s;
}
.login-back:hover { color: var(--gold); }
`
