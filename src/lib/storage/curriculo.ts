import { createClient } from '@supabase/supabase-js'

const BUCKET = 'curriculos'
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function uploadCurriculo(userId: string, buffer: Buffer): Promise<string> {
  if (buffer.byteLength > MAX_SIZE_BYTES) {
    throw new Error('pdf_too_large')
  }

  const supabase = getServiceClient()
  // Usa crypto.randomUUID() — sem dependência extra
  const path = `${userId}/${crypto.randomUUID()}.pdf`

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: 'application/pdf',
    upsert: false,
  })

  if (error) throw new Error(`storage_upload_failed: ${error.message}`)
  return path
}

export async function deleteCurriculo(path: string): Promise<void> {
  const supabase = getServiceClient()
  await supabase.storage.from(BUCKET).remove([path])
}

export async function downloadCurriculo(path: string): Promise<Buffer> {
  const supabase = getServiceClient()
  const { data, error } = await supabase.storage.from(BUCKET).download(path)
  if (error || !data) throw new Error(`storage_download_failed: ${error?.message}`)
  return Buffer.from(await data.arrayBuffer())
}
