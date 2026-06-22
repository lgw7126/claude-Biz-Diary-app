import { supabase } from './supabase'

export async function analyzeEntry(todayEntry, historyEntries, businessType) {
  const { data, error } = await supabase.functions.invoke('analyze-sales', {
    body: {
      today: todayEntry,
      history: historyEntries.slice(0, 7),
      businessType: businessType || '식당',
    },
  })

  if (error) throw error
  return data
}
