/**
 * Núcleo de processamento de candidatura — sem autenticação nem redirect.
 * Pode ser chamado tanto de Server Actions quanto de Route Handlers.
 */
import { prisma } from '@/lib/prisma'
import { scrapeVaga } from '@/lib/scraping/vaga'
import { scrapeEmpresa } from '@/lib/scraping/empresa'
import { extractPdfText } from '@/lib/pdf/extract'
import { downloadCurriculo } from '@/lib/storage/curriculo'
import { generateTopico } from '@/lib/ai/agents/generate-topico'
import { generateFaq } from '@/lib/ai/agents/generate-faq'
import type { GenerationSources } from '@/lib/ai/prompts/system'

export async function processarCore(id: string, userId: string): Promise<{ avisos: string[] }> {
  const candidatura = await prisma.candidatura.findUnique({ where: { id, userId } })
  if (!candidatura) throw new Error('not_found')

  const updates: Record<string, string> = {}
  const avisos: string[] = []

  // ── 1. Coleta de dados ─────────────────────────────────────────────────

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

  await prisma.candidatura.update({ where: { id, userId }, data: updates })

  // ── 2. Geração dos tópicos via IA ──────────────────────────────────────

  const sources: GenerationSources = {
    empresa: candidatura.empresa,
    cargo: candidatura.cargo,
    vagaTexto: updates.vagaTexto ?? candidatura.vagaTexto,
    empresaTexto: updates.empresaTexto ?? candidatura.empresaTexto,
    curriculoTexto: updates.curriculoTexto ?? candidatura.curriculoTexto,
    linkedinText: candidatura.linkedinText,
  }

  try {
    const [empresa, vaga, perguntas] = await Promise.all([
      generateTopico('EMPRESA', sources),
      generateTopico('VAGA', sources),
      generateTopico('PERGUNTAS', sources),
    ])

    for (const topico of [empresa, vaga, perguntas]) {
      await prisma.topicoPreparacao.upsert({
        where: { candidaturaId_tipo: { candidaturaId: id, tipo: topico.tipo } },
        create: { candidaturaId: id, tipo: topico.tipo, titulo: topico.titulo, conteudo: topico.conteudo, fontesUsadas: Object.keys(updates), avisos },
        update: { titulo: topico.titulo, conteudo: topico.conteudo, fontesUsadas: Object.keys(updates), avisos, geradoEm: new Date() },
      })
    }
  } catch (err) {
    avisos.push(`Tópicos: ${err instanceof Error ? err.message : 'erro inesperado'}`)
  }

  // ── 3. Geração do FAQ ──────────────────────────────────────────────────

  try {
    const faqItems = await generateFaq(sources)
    await prisma.faqItem.deleteMany({ where: { candidaturaId: id } })
    await prisma.faqItem.createMany({
      data: faqItems.map((item) => ({ candidaturaId: id, pergunta: item.pergunta, resposta: item.resposta, categoria: item.categoria })),
    })
  } catch (err) {
    avisos.push(`FAQ: ${err instanceof Error ? err.message : 'erro inesperado'}`)
  }

  return { avisos }
}
