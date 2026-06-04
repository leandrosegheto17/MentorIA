'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createCandidaturaSchema, updateCandidaturaSchema } from '@/server/validators/candidatura'
import * as candidaturaService from '@/server/services/candidatura'

async function getAuthUserId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return user.id
}

export async function createCandidatura(formData: FormData) {
  const userId = await getAuthUserId()

  const parsed = createCandidaturaSchema.safeParse({
    empresa: formData.get('empresa'),
    cargo: formData.get('cargo'),
    linkVaga: formData.get('linkVaga'),
    linkedinText: formData.get('linkedinText'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  let id: string
  try {
    const candidatura = await candidaturaService.createCandidatura(userId, parsed.data)
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

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await candidaturaService.updateCandidatura(id, userId, parsed.data)
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
    await candidaturaService.deleteCandidatura(id, userId)
    revalidatePath('/candidaturas')
  } catch {
    return { error: 'Erro ao excluir candidatura.' }
  }

  redirect('/candidaturas')
}
