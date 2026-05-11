import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [staff, setStaff] = useState(null)  // row from staff table
  const [loading, setLoading] = useState(true)

  // Fetch staff record matching the logged-in auth user (by email)
  const loadStaff = async (sess) => {
    if (!sess?.user?.email) {
      setStaff(null)
      return
    }
    const { data } = await supabase
      .from('staff')
      .select('*')
      .eq('email', sess.user.email)
      .maybeSingle()
    setStaff(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      loadStaff(session).finally(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess)
      loadStaff(sess)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error }
    // After sign-in, verify staff exists & is active
    const { data: staffRow } = await supabase
      .from('staff')
      .select('*')
      .eq('email', email)
      .maybeSingle()
    if (!staffRow) {
      await supabase.auth.signOut()
      return { error: { message: 'No staff record found for this email.' } }
    }
    if (staffRow.is_active !== 1) {
      await supabase.auth.signOut()
      return { error: { message: 'This account is deactivated.' } }
    }
    return { data }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setStaff(null)
  }

  return (
    <AuthContext.Provider value={{ session, staff, loading, signIn, signOut, isAdmin: staff?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}
