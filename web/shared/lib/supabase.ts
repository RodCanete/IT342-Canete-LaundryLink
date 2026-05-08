import { createClient, SupabaseClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !anonKey) {
  console.warn(
    "Supabase env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Attachment uploads will fail."
  )
}

export const supabase: SupabaseClient = createClient(url ?? "", anonKey ?? "", {
  auth: { persistSession: false },
})

export const ATTACHMENTS_BUCKET = "Attachments"
