import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function fetchEntries(days = 90) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceStr = since.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('sales_diary')
    .select('*')
    .gte('date', sinceStr)
    .order('date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function upsertEntry(entry) {
  const { data, error } = await supabase
    .from('sales_diary')
    .upsert(
      { ...entry, updated_at: new Date().toISOString() },
      { onConflict: 'date' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}
