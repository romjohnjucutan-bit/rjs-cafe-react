import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AdminProfile() {
  const { staff, session } = useAuth()
  const [name, setName] = useState(staff?.full_name || '')
  const [phone, setPhone] = useState(staff?.phone || '')
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [saving, setSaving] = useState(false)

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      const { error } = await supabase.from('staff').update({
        full_name: name.trim(),
        phone: phone.trim() || null
      }).eq('id', staff.id)
      if (error) throw error
      setMsg({ type: 'success', text: 'Profile updated.' })
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      setMsg({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    setSaving(true)
    setMsg(null)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setMsg({ type: 'success', text: 'Password changed.' })
      setNewPassword('')
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (!staff) return null

  return (
    <>
      <div className="page-title-bar">
        <div>
          <h1>My Profile</h1>
          <p>Update your information</p>
        </div>
      </div>

      {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1.5rem' }}>{msg.text}</div>}

      <div className="profile-grid">
        <form onSubmit={saveProfile} className="data-card" style={{ padding: '1.8rem' }}>
          <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '.8rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>
            <i className="fas fa-user"></i> Personal Info
          </h3>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" value={session?.user?.email || ''} disabled />
            <small style={{ color: 'var(--text-l)' }}>Email is managed in Supabase Authentication.</small>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input type="text" className="form-control" value={staff.role} disabled style={{ textTransform: 'capitalize' }} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        <form onSubmit={changePassword} className="data-card" style={{ padding: '1.8rem' }}>
          <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '.8rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>
            <i className="fas fa-key"></i> Change Password
          </h3>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" className="form-control" value={newPassword}
              onChange={e => setNewPassword(e.target.value)} required minLength={6} />
            <small style={{ color: 'var(--text-l)' }}>Minimum 6 characters.</small>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={saving || !newPassword}>
            {saving ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>

      <style>{`
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 900px) { .profile-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  )
}
