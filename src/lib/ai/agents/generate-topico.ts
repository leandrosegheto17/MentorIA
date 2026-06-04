import { generateText } from '@/lib/ai/generate'
import { buildSystemPrompt, type GenerationSources } from '@/lib/ai/prompts/system'
import { buildEmpresaPrompt } from '@/lib/ai/prompts/empresa'
import { buildVagaPrompt } from '@/lib/ai/prompts/vaga'
import { buildPerguntasPrompt } from '@/lib/ai/prompts/perguntas'
import type { TopicoTipo } from '@/generated/prisma/enums'

function getUserPrompt(tipo: TopicoTipo, sources: GenerationSources): string {
  switch (tipo) {
    case 'EMPRESA':   return buildEmpresaPrompt(sources)
    case 'VAGA':      return buildVagaPrompt(sources)
    case 'PERGUNTAS': return buildPerguntasPrompt(sources)
  }
}

export interface TopicoGerado {
  tipo: TopicoTipo
  titulo: string
  conteudo: string
}

const TITULOS: Record<TopicoTipo, string> = {
  EMPRESA:   'Conhecer a Empresa',
  VAGA:      'Conhecer a Vaga',
  PERGUNTAS: 'Perguntas & Respostas',
}

export async function generateTopico(
  tipo: TopicoTipo,
  sources: GenerationSources
): Promise<TopicoGerado> {
  const conteudo = await generateText({
    system: buildSystemPrompt(sources),
    user: getUserPrompt(tipo, sources),
  })

  return { tipo, titulo: TITULOS[tipo], conteudo }
}
