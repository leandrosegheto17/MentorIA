/**
 * Núcleo de processamento de candidatura — sem autenticação nem redirect.
 * Pode ser chamado tanto de Server Actions quanto de Route Handlers.
 *
 * Estratégia de paralelismo:
 *   Fase 1 — coleta (vaga + PDF + empresa) em paralelo
 *   Fase 2 — geração de IA (3 tópicos + FAQ) em paralelo,
 *             cada um persiste no banco assim que termina
 *             → o PollingRefresher entrega cada card para o usuário conforme fica pronto
 */
import { prisma } from '@/lib/prisma'
import { scrapeVaga } from '@/lib/scraping/vaga'
import { scrapeEmpresa } from '@/lib/scraping/empresa'
import { extractPdfText } from '@/lib/pdf/extract'
import { downloadCurriculo } from '@/lib/storage/curriculo'
import { generateTopico } from '@/lib/ai/agents/generate-topico'
import { generateFaq } from '@/lib/ai/agents/generate-faq'
import type { GenerationSources } from '@/lib/ai/prompts/system'
import type { TopicoTipo } from '@/generated/prisma/enums'

// ── helpers ──────────────────────────────────────────────────────────────────

async function saveTopico(
  candidaturaId: string,
  tipo: TopicoTipo,
  titulo: string,
  conteudo: string,
  fontesUsadas: string[],
  avisos: string[]
) {
  await prisma.topicoPreparacao.upsert({
    where: { candidaturaId_tipo: { candidaturaId, tipo } },
    create: { candidaturaId, tipo, titulo, conteudo, fontesUsadas, avisos },
    update: { titulo, conteudo, fontesUsadas, avisos, geradoEm: new Date() },
  })
}

async function saveFaq(
  candidaturaId: string,
  items: Array<{ pergunta: string; resposta: string; categoria: 'EMPRESA' | 'VAGA' | 'COMPORTAMENTAL' }>
) {
  await prisma.faqItem.deleteMany({ where: { candidaturaId } })
  await prisma.faqItem.createMany({
    data: items.map((item) => ({ candidaturaId, ...item })),
  })
}

// ── core ─────────────────────────────────────────────────────────────────────

export async function processarCore(id: string, userId: string): Promise<{ avisos: string[] }> {
  const candidatura = await prisma.candidatura.findUnique({ where: { id, userId } })
  if (!candidatura) throw new Error('not_found')

  const avisos: string[] = []

  // ── Fase 1: coleta em paralelo ────────────────────────────────────────────

  const [vagaResult, curriculoResult, empresaResult] = await Promise.allSettled([
    candidatura.linkVaga
      ? scrapeVaga(candidatura.linkVaga)
      : Promise.resolve(null),

    candidatura.curriculoPath
      ? downloadCurriculo(candidatura.curriculoPath).then((buf) => extractPdfText(buf))
      : Promise.resolve(null),

    scrapeEmpresa(candidatura.empresa),
  ])

  const updates: Record<string, string> = {}

  if (vagaResult.status === 'fulfilled' && vagaResult.value?.success && vagaResult.value.content) {
    updates.vagaTexto = vagaResult.value.content
  } else if (candidatura.linkVaga) {
    const msg = vagaResult.status === 'rejected'
      ? String(vagaResult.reason)
      : vagaResult.value?.error?.message ?? 'não foi possível coletar'
    avisos.push(`Vaga: ${msg}`)
  }

  if (curriculoResult.status === 'fulfilled' && curriculoResult.value) {
    updates.curriculoTexto = curriculoResult.value
  } else if (candidatura.curriculoPath) {
    avisos.push('Currículo: não foi possível extrair o texto do PDF.')
  }

  if (empresaResult.status === 'fulfilled' && empresaResult.value?.success && empresaResult.value.content) {
    updates.empresaTexto = empresaResult.value.content
  } else {
    const msg = empresaResult.status === 'rejected'
      ? String(empresaResult.reason)
      : empresaResult.value?.error?.message ?? 'não foi possível coletar'
    avisos.push(`Empresa: ${msg}`)
  }

  if (Object.keys(updates).length > 0) {
    await prisma.candidatura.update({ where: { id, userId }, data: updates })
  }

  // ── Fase 2: geração de IA em paralelo, persiste cada um ao terminar ───────

  const sources: GenerationSources = {
    empresa: candidatura.empresa,
    cargo: candidatura.cargo,
    vagaTexto:      updates.vagaTexto      ?? candidatura.vagaTexto,
    empresaTexto:   updates.empresaTexto   ?? candidatura.empresaTexto,
    curriculoTexto: updates.curriculoTexto ?? candidatura.curriculoTexto,
  }

  const fontesUsadas = Object.keys(updates)

  const geracaoTasks = [
    generateTopico('EMPRESA', sources)
      .then((t) => saveTopico(id, t.tipo, t.titulo, t.conteudo, fontesUsadas, avisos)),

    generateTopico('VAGA', sources)
      .then((t) => saveTopico(id, t.tipo, t.titulo, t.conteudo, fontesUsadas, avisos)),

    generateTopico('PERGUNTAS', sources)
      .then((t) => saveTopico(id, t.tipo, t.titulo, t.conteudo, fontesUsadas, avisos)),

    generateFaq(sources)
      .then((items) => saveFaq(id, items)),
  ]

  const resultados = await Promise.allSettled(geracaoTasks)
  const labels = ['Empresa', 'Vaga', 'Perguntas', 'FAQ']

  resultados.forEach((r, i) => {
    if (r.status === 'rejected') {
      avisos.push(`${labels[i]}: ${r.reason instanceof Error ? r.reason.message : 'erro inesperado'}`)
    }
  })

  return { avisos }
}
