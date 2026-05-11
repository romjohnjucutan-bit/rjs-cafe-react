import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { logActivity } from '../../lib/activity.js'

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']

export default function AdminSettings() {
  const { staff } = useAuth()
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('shop_settings').select('*')
      // Order by DAYS
      const ordered = DAYS.map(d => (data || []).find(s => s.day_of_week === d) || {
        day_of_week: d, is_open: 1, open_time: '08:00:00', close_time: '20:00:00'
      })
      setSettings(ordered)
      setLoading(false)
    }
    load()
  }, [])

  const update = (day, field, value) => {
    setSettings(settings.map(s => s.day_of_week === day ? { ...s, [field]: value } : s))
  }

  const save = async () => {
    for (const s of settings) {
      await supabase.from('shop_settings').upsert({
        day_of_week: s.day_of_week,
        is_open: s.is_open,
        open_time: s.open_time,
        close_time: s.close_time
      }, { onConflict: 'day_of_week' })
    }
    await logActivity(staff?.full_name, 'updated shop hours', 'settings')
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return <div className="loader">Loading</div>

  return (
    <>
      <div className="page-title-bar">
        <div>
          <h1>Shop Hours</h1>
          <p>Set opening and closing times</p>
        </div>
      </div>

      {saved && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>Settings saved.</div>}

      <div className="data-card">
        <div className="hours-list">
          {settings.map(s => (
            <div key={s.day_of_week} className="hour-row">
              <div className="day-label">{s.day_of_week}</div>
              <label className="check-label">
                <input type="checkbox" checked={s.is_open === 1}
                  onChange={e => update(s.day_of_week, 'is_open', e.target.checked ? 1 : 0)} />
                Open
              </label>
              <div>
                <label style={{ fontSize: '.62rem', letterSpacing: '.15em', color: 'var(--text-l)', fontFamily: 'Cinzel, serif', textTransform: 'uppercase' }}>Open</label>
                <input type="time" className="form-control" value={s.open_time?.slice(0,5) || '08:00'}
                  onChange={e => update(s.day_of_week, 'open_time', e.target.value + ':00')}
                  disabled={s.is_open !== 1} />
              </div>
              <div>
                <label style={{ fontSize: '.62rem', letterSpacing: '.15em', color: 'var(--text-l)', fontFamily: 'Cinzel, serif', textTransform: 'uppercase' }}>Close</label>
                <input type="time" className="form-control" value={s.close_time?.slice(0,5) || '20:00'}
                  onChange={e => update(s.day_of_week, 'close_time', e.target.value + ':00')}
                  disabled={s.is_open !== 1} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-l)', textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={save}>
            <i className="fas fa-save"></i> Save Hours
          </button>
        </div>
      </div>

      <style>{`
        .hours-list { padding: 1rem 1.5rem; }
        .hour-row {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1.2fr 1.2fr;
          gap: 1rem;
          align-items: end;
          padding: .8rem 0;
          border-bottom: 1px solid var(--border-l);
        }
        .hour-row:last-child { border-bottom: none; }
        .day-label {
          font-family: 'Cinzel', serif;
          font-size: .75rem;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--gold);
        }
        .check-label {
          display: flex; align-items: center; gap: .5rem;
          font-family: 'Cinzel', serif;
          font-size: .65rem;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--text);
          cursor: pointer;
        }
        .check-label input { accent-color: var(--gold); }
        @media (max-width: 700px) {
          .hour-row { grid-template-columns: 1fr 1fr; }
          .day-label { grid-column: 1 / -1; margin-bottom: .25rem; }
        }
      `}</style>
    </>
  )
}
