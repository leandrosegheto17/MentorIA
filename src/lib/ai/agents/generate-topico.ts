import { anthropic, AI_MODEL, AI_MAX_TOKENS } from '@/lib/ai/client'
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
  const systemText = buildSystemPrompt(sources)
  const userPrompt = getUserPrompt(tipo, sources)

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: AI_MAX_TOKENS,
    system: [
      {
        type: 'text',
        text: systemText,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userPrompt }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('unexpected_response_type')

  return { tipo, titulo: TITULOS[tipo], conteudo: block.text }
}
