'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { scrapeVaga } from '@/lib/scraping/vaga'
import { scrapeEmpresa } from '@/lib/scraping/empresa'
import { extractPdfText } from '@/lib/pdf/extract'
import { downloadCurriculo } from '@/lib/storage/curriculo'
import { generateTopico } from '@/lib/ai/agents/generate-topico'
import { generateFaq } from '@/lib/ai/agents/generate-faq'
import type { GenerationSources } from '@/lib/ai/prompts/system'

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

  await prisma.candidatura.update({
    where: { id, userId },
    data: { status: 'PROCESSING' },
  })
  revalidatePath(`/candidaturas/${id}`)

  const updates: Record<string, string> = {}
  const avisos: string[] = []

  // ── 1. Coleta de dados ───────────────────────────────────────────────────

  if (candidatura.linkVaga) {
    const result = await scrapeVaga(candidatura.linkVaga)
    if (result.success && result.content) updates.vagaTexto = result.content
    else avisos.push(`Vaga: ${result.error?.message ?? 'não foi possível coletar'}`)
  }

  if (candidatura.curriculoPath) {
    try {
      const buffer = await downloadCurriculo(candidatura.curriculoPath)
      updates.curriculoTexto = await extractPdfText(buffer)
    } catch {
      avisos.push('Currículo: não foi possível extrair o texto do PDF.')
    }
  }

  const empresaResult = await scrapeEmpresa(candidatura.empresa)
  if (empresaResult.success && empresaResult.content) updates.empresaTexto = empresaResult.content
  else avisos.push(`Empresa: ${empresaResult.error?.message ?? 'não foi possível coletar'}`)

  // Persiste os textos coletados
  await prisma.candidatura.update({ where: { id, userId }, data: updates })

  // ── 2. Geração dos tópicos via IA ────────────────────────────────────────

  const sources: GenerationSources = {
    empresa: candidatura.empresa,
    cargo: candidatura.cargo,
    vagaTexto: updates.vagaTexto ?? candidatura.vagaTexto,
    empresaTexto: updates.empresaTexto ?? candidatura.empresaTexto,
    curriculoTexto: updates.curriculoTexto ?? candidatura.curriculoTexto,
    linkedinText: candidatura.linkedinText,
  }

  try {
    // Gera os 3 tópicos em paralelo (cache_control reutiliza o system prompt)
    const [empresa, vaga, perguntas] = await Promise.all([
      generateTopico('EMPRESA', sources),
      generateTopico('VAGA', sources),
      generateTopico('PERGUNTAS', sources),
    ])

    // Upsert para permitir reprocessamento
    for (const topico of [empresa, vaga, perguntas]) {
      await prisma.topicoPreparacao.upsert({
        where: { candidaturaId_tipo: { candidaturaId: id, tipo: topico.tipo } },
        create: {
          candidaturaId: id,
          tipo: topico.tipo,
          titulo: topico.titulo,
          conteudo: topico.conteudo,
          fontesUsadas: Object.keys(updates),
          avisos,
        },
        update: {
          titulo: topico.titulo,
          conteudo: topico.conteudo,
          fontesUsadas: Object.keys(updates),
          avisos,
          geradoEm: new Date(),
        },
      })
    }
  } catch (err) {
    avisos.push(`Geração de tópicos: ${err instanceof Error ? err.message : 'erro inesperado'}`)
  }

  // ── 3. Geração do FAQ ────────────────────────────────────────────────────

  try {
    const faqItems = await generateFaq(sources)

    // Substitui o FAQ anterior para evitar duplicatas
    await prisma.faqItem.deleteMany({ where: { candidaturaId: id } })
    await prisma.faqItem.createMany({
      data: faqItems.map((item) => ({
        candidaturaId: id,
        pergunta: item.pergunta,
        resposta: item.resposta,
        categoria: item.categoria,
      })),
    })
  } catch (err) {
    avisos.push(`FAQ: ${err instanceof Error ? err.message : 'erro inesperado'}`)
  }

  // ── 4. Finaliza ──────────────────────────────────────────────────────────

  await prisma.candidatura.update({
    where: { id, userId },
    data: { status: 'COMPLETED' },
  })
  revalidatePath(`/candidaturas/${id}`)

  return avisos.length > 0 ? { avisos } : { success: true }
}
