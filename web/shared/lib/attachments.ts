import { ATTACHMENTS_BUCKET, supabase } from "./supabase"

export const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"] as const
export const MAX_BYTES = 5 * 1024 * 1024

export type UploadResult = { path: string; publicUrl: string }

export function validateAttachment(file: File): string | null {
  if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
    return "Only PDF, JPG, or PNG files are accepted."
  }
  if (file.size > MAX_BYTES) {
    return "File exceeds the 5 MB size limit."
  }
  return null
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_")
}

export async function uploadAttachment(file: File, userId: string): Promise<UploadResult> {
  const error = validateAttachment(file)
  if (error) {
    throw new Error(error)
  }

  const safeName = sanitizeFilename(file.name)
  const path = `bookings/${userId}/${Date.now()}-${safeName}`

  const { error: uploadError } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message || "Upload failed")
  }

  const { data } = supabase.storage.from(ATTACHMENTS_BUCKET).getPublicUrl(path)

  return { path, publicUrl: data.publicUrl }
}
