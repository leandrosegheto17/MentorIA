'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createCandidaturaSchema, updateCandidaturaSchema } from '@/server/validators/candidatura'
import * as candidaturaService from '@/server/services/candidatura'
import { uploadCurriculo, deleteCurriculo } from '@/lib/storage/curriculo'

async function getAuthUserId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return user.id
}

async function handlePdfUpload(file: File | null, userId: string): Promise<string | null> {
  if (!file || file.size === 0) return null
  if (file.type !== 'application/pdf') return null

  const buffer = Buffer.from(await file.arrayBuffer())
  return uploadCurriculo(userId, buffer)
}

export async function createCandidatura(formData: FormData) {
  const userId = await getAuthUserId()

  const parsed = createCandidaturaSchema.safeParse({
    empresa: formData.get('empresa'),
    cargo: formData.get('cargo'),
    linkVaga: formData.get('linkVaga'),
    linkedinText: formData.get('linkedinText'),
  })

  if (!parsed.success) return { error: parsed.error.issues[0].message }

  let curriculoPath: string | null = null
  try {
    const file = formData.get('curriculo') as File | null
    curriculoPath = await handlePdfUpload(file, userId)
  } catch {
    // Upload falhou — candidatura é criada sem currículo
  }

  let id: string
  try {
    const candidatura = await candidaturaService.createCandidatura(userId, {
      ...parsed.data,
      curriculoPath: curriculoPath ?? undefined,
    })
    id = candidatura.id
    revalidatePath('/candidaturas')
  } catch {
    return { error: 'Erro ao criar candidatura. Tente novamente.' }
  }

  redirect(`/candidaturas/${id}`)
}

export async function updateCandidatura(id: string, formData: FormData) {
  const userId = await getAuthUserId()

  const parsed = updateCandidaturaSchema.safeParse({
    empresa: formData.get('empresa'),
    cargo: formData.get('cargo'),
    linkVaga: formData.get('linkVaga'),
    linkedinText: formData.get('linkedinText'),
  })

  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const updates: Record<string, unknown> = { ...parsed.data }

  try {
    const file = formData.get('curriculo') as File | null
    if (file && file.size > 0) {
      // Remove PDF antigo se existir
      const existing = await candidaturaService.getCandidatura(id, userId)
      if (existing.curriculoPath) {
        await deleteCurriculo(existing.curriculoPath).catch(() => null)
      }
      updates.curriculoPath = await handlePdfUpload(file, userId)
    }
  } catch {
    // Falha de upload — segue sem atualizar o PDF
  }

  try {
    await candidaturaService.updateCandidatura(id, userId, updates)
    revalidatePath('/candidaturas')
    revalidatePath(`/candidaturas/${id}`)
  } catch {
    return { error: 'Erro ao atualizar candidatura.' }
  }

  redirect(`/candidaturas/${id}`)
}

export async function deleteCandidatura(id: string) {
  const userId = await getAuthUserId()

  try {
    const candidatura = await candidaturaService.getCandidatura(id, userId)
    if (candidatura.curriculoPath) {
      await deleteCurriculo(candidatura.curriculoPath).catch(() => null)
    }
    await candidaturaService.deleteCandidatura(id, userId)
    revalidatePath('/candidaturas')
  } catch {
    return { error: 'Erro ao excluir candidatura.' }
  }

  redirect('/candidaturas')
}
