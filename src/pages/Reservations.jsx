import { useState } from 'react'
import { supabase, generateCode } from '../lib/supabase.js'

export default function Reservations() {
  const [mode, setMode] = useState('create') // 'create' or 'manage'
  const [form, setForm] = useState({
    guest_name: '', guest_phone: '', guest_email: '',
    reservation_date: '', reservation_time: '',
    num_guests: 2, notes: ''
  })
  const [lookupCode, setLookupCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)  // { type, message, data }
  const [foundReservation, setFoundReservation] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setResult(null)

    if (!form.guest_name || !form.guest_phone || !form.guest_email ||
        !form.reservation_date || !form.reservation_time) {
      setResult({ type: 'error', message: 'Please fill in all required fields.' })
      return
    }

    setSubmitting(true)
    try {
      const refCode = generateCode('RES')
      const { error } = await supabase.from('reservations').insert({
        reference_code: refCode,
        guest_name: form.guest_name.trim(),
        guest_phone: form.guest_phone.trim(),
        guest_email: form.guest_email.trim(),
        reservation_date: form.reservation_date,
        reservation_time: form.reservation_time,
        num_guests: parseInt(form.num_guests),
        notes: form.notes.trim() || null,
        status: 'pending'
      })

      if (error) throw error

      setResult({ type: 'success', code: refCode })
      setForm({
        guest_name: '', guest_phone: '', guest_email: '',
        reservation_date: '', reservation_time: '',
        num_guests: 2, notes: ''
      })
    } catch (err) {
      setResult({ type: 'error', message: err.message || 'Could not save reservation.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleLookup = async (e) => {
    e.preventDefault()
    setResult(null)
    setFoundReservation(null)
    if (!lookupCode.trim()) return

    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('reference_code', lookupCode.trim().toUpperCase())
      .maybeSingle()

    if (error || !data) {
      setResult({ type: 'error', message: "We couldn't find a reservation with that code." })
      return
    }
    setFoundReservation(data)
  }

  const handleCancel = async () => {
    if (!foundReservation) return
    if (!confirm('Cancel this reservation? This cannot be undone.')) return

    const { error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', foundReservation.id)

    if (!error) {
      setFoundReservation({ ...foundReservation, status: 'cancelled' })
    }
  }

  // Min date = today
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="page">
      <div className="page-hero" style={{ padding: '4rem 2rem 2rem' }}>
        <span className="label-text">Save Your Seat</span>
        <h1><em>Reservations</em></h1>
        <p>Book a table — or look up an existing reservation.</p>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem 4rem', maxWidth: 820 }}>
        <div className="mode-tabs">
          <button
            className={`mode-tab ${mode === 'create' ? 'active' : ''}`}
            onClick={() => { setMode('create'); setResult(null); setFoundReservation(null) }}
          >
            <i className="fas fa-plus"></i> New Reservation
          </button>
          <button
            className={`mode-tab ${mode === 'manage' ? 'active' : ''}`}
            onClick={() => { setMode('manage'); setResult(null) }}
          >
            <i className="fas fa-search"></i> Manage Existing
          </button>
        </div>

        {mode === 'create' && (
          <>
            {result?.type === 'success' && (
              <div className="alert alert-success">
                <strong>Reservation submitted!</strong> Your reference code is{' '}
                <strong style={{ color: 'var(--gold)', letterSpacing: '.1em' }}>{result.code}</strong>.
                Save it to look up or cancel your booking later.
              </div>
            )}
            {result?.type === 'error' && (
              <div className="alert alert-error">{result.message}</div>
            )}

            <form onSubmit={handleCreate} className="reservation-form">
              <div className="form-section">
                <h3>Guest Information</h3>
                <div className="gold-rule"><i className="fas fa-circle"></i></div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" name="guest_name" className="form-control"
                      value={form.guest_name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input type="tel" name="guest_phone" className="form-control"
                      value={form.guest_phone} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="guest_email" className="form-control"
                    value={form.guest_email} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-section">
                <h3>Reservation Details</h3>
                <div className="gold-rule"><i className="fas fa-circle"></i></div>
                <div className="form-row reservation-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input type="date" name="reservation_date" className="form-control"
                      min={today} value={form.reservation_date} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Time *</label>
                    <input type="time" name="reservation_time" className="form-control"
                      value={form.reservation_time} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Guests</label>
                    <select name="num_guests" className="form-control"
                      value={form.num_guests} onChange={handleChange}>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes (optional)</label>
                  <textarea name="notes" className="form-control" rows="3"
                    value={form.notes} onChange={handleChange}
                    placeholder="Special occasion, dietary needs, seating preferences..." />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Submitting...' : <>Reserve Now <i className="fas fa-calendar-check"></i></>}
              </button>
            </form>
          </>
        )}

        {mode === 'manage' && (
          <div className="form-section">
            <h3>Find Your Reservation</h3>
            <div className="gold-rule"><i className="fas fa-circle"></i></div>
            <form onSubmit={handleLookup} className="track-form">
              <input type="text" className="form-control"
                placeholder="Enter your reference code (e.g. RES-XXXXXXXX)"
                value={lookupCode}
                onChange={(e) => setLookupCode(e.target.value)} />
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-search"></i> Look Up
              </button>
            </form>

            {result?.type === 'error' && (
              <div className="alert alert-error" style={{ marginTop: '1rem' }}>{result.message}</div>
            )}

            {foundReservation && (
              <div className="reservation-detail">
                <div className="reservation-detail-head">
                  <div>
                    <span className="label-text">Reference</span>
                    <h3 style={{ color: 'var(--gold)' }}>{foundReservation.reference_code}</h3>
                  </div>
                  <span className={`badge badge-${foundReservation.status}`}>{foundReservation.status}</span>
                </div>
                <div className="kv"><span>Name</span><span>{foundReservation.guest_name}</span></div>
                <div className="kv"><span>Email</span><span>{foundReservation.guest_email}</span></div>
                <div className="kv"><span>Phone</span><span>{foundReservation.guest_phone}</span></div>
                <div className="kv"><span>Date</span><span>{foundReservation.reservation_date}</span></div>
                <div className="kv"><span>Time</span><span>{foundReservation.reservation_time}</span></div>
                <div className="kv"><span>Guests</span><span>{foundReservation.num_guests}</span></div>
                {foundReservation.notes && (
                  <div className="kv"><span>Notes</span><span>{foundReservation.notes}</span></div>
                )}

                {!['cancelled','completed'].includes(foundReservation.status) && (
                  <button onClick={handleCancel} className="btn btn-outline" style={{ marginTop: '1.5rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                    <i className="fas fa-times"></i> Cancel Reservation
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{css}</style>
    </div>
  )
}

const css = `
.mode-tabs {
  display: flex; gap: .8rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0;
}
.mode-tab {
  flex: 1;
  padding: 1rem;
  font-family: 'Cinzel', serif;
  font-size: .7rem;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--text-m);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all .25s;
}
.mode-tab:hover { color: var(--gold); }
.mode-tab.active {
  color: var(--gold);
  border-bottom-color: var(--gold);
}

.reservation-form { display: flex; flex-direction: column; gap: 1.5rem; }
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

.track-form {
  display: flex; gap: .8rem;
  margin-top: 1rem;
}
.track-form .form-control { flex: 1; }
@media (max-width: 600px) { .track-form { flex-direction: column; } }

.reservation-detail {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-l);
}
.reservation-detail-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap; gap: 1rem;
}

.kv {
  display: flex; justify-content: space-between;
  padding: .55rem 0;
  font-size: .9rem;
  border-bottom: 1px solid var(--border-l);
  gap: 1rem;
}
.kv span:first-child {
  color: var(--text-l);
  font-family: 'Cinzel', serif;
  font-size: .65rem;
  letter-spacing: .18em;
  text-transform: uppercase;
}
.kv span:last-child { color: var(--text); text-align: right; }
@media (max-width: 600px) {
  .reservation-detail-head { align-items: flex-start; }
  .kv { flex-direction: column; align-items: flex-start; }
  .kv span:last-child { text-align: left; }
}
@media (max-width: 700px) {
  .reservation-row { grid-template-columns: 1fr; }
}
`
