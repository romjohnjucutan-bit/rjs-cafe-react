import { supabase } from './supabase.js'

export async function logActivity(staffName, action, targetType, targetId = null, details = null) {
  try {
    await supabase.from('activity_log').insert({
      staff_name: staffName,
      action,
      target_type: targetType,
      target_id: targetId,
      details
    })
  } catch (e) {
    // silent
  }
}
