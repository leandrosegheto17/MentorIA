'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { scrapeVaga } from '@/lib/scraping/vaga'
import { scrapeEmpresa } from '@/lib/scraping/empresa'
import { extractPdfText } from '@/lib/pdf/extract'
import { downloadCurriculo } from '@/lib/storage/curriculo'

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

  // Marcar como processando
  await prisma.candidatura.update({
    where: { id, userId },
    data: { status: 'PROCESSING' },
  })
  revalidatePath(`/candidaturas/${id}`)

  const updates: Record<string, string> = {}
  const avisos: string[] = []

  try {
    // 1. Scraping da vaga
    if (candidatura.linkVaga) {
      const result = await scrapeVaga(candidatura.linkVaga)
      if (result.success && result.content) {
        updates.vagaTexto = result.content
      } else {
        avisos.push(`Vaga: ${result.error?.message ?? 'não foi possível coletar'}`)
      }
    }

    // 2. Parsing do currículo PDF
    if (candidatura.curriculoPath) {
      try {
        const buffer = await downloadCurriculo(candidatura.curriculoPath)
        const texto = await extractPdfText(buffer)
        updates.curriculoTexto = texto
      } catch {
        avisos.push('Currículo: não foi possível extrair o texto do PDF.')
      }
    }

    // 3. Coleta de dados da empresa
    const empresaResult = await scrapeEmpresa(candidatura.empresa)
    if (empresaResult.success && empresaResult.content) {
      updates.empresaTexto = empresaResult.content
    } else {
      avisos.push(`Empresa: ${empresaResult.error?.message ?? 'não foi possível coletar'}`)
    }

    await prisma.candidatura.update({
      where: { id, userId },
      data: { ...updates, status: 'COMPLETED' },
    })
  } catch {
    await prisma.candidatura.update({
      where: { id, userId },
      data: { status: 'ERROR' },
    })
    revalidatePath(`/candidaturas/${id}`)
    return { error: 'Erro inesperado durante o processamento.' }
  }

  revalidatePath(`/candidaturas/${id}`)
  return avisos.length > 0 ? { avisos } : { success: true }
}
