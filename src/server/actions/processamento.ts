'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { processarCore } from '@/server/actions/process-core'

async function getAuthUserId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return user.id
}

export async function processarCandidatura(id: string) {
  const userId = await getAuthUserId()

  const candidatura = await prisma.candidatura.findUnique({ where: { id, userId } })
  if (!candidatura) return { error: 'Candidatura não encontrada.' }

  await prisma.candidatura.update({ where: { id, userId }, data: { status: 'PROCESSING' } })
  revalidatePath(`/candidaturas/${id}`)

  try {
    const { avisos } = await processarCore(id, userId)
    await prisma.candidatura.update({ where: { id, userId }, data: { status: 'COMPLETED' } })
    revalidatePath(`/candidaturas/${id}`)
    return avisos.length > 0 ? { avisos } : { success: true }
  } catch {
    await prisma.candidatura.update({ where: { id, userId }, data: { status: 'ERROR' } })
    revalidatePath(`/candidaturas/${id}`)
    return { error: 'Erro inesperado durante o processamento.' }
  }
}
