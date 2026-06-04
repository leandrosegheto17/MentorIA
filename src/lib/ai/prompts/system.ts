const MAX_SOURCE_CHARS = 12000

function truncate(text: string | null | undefined): string {
  if (!text) return ''
  return text.length > MAX_SOURCE_CHARS ? text.slice(0, MAX_SOURCE_CHARS) + '\n[conteúdo truncado]' : text
}

export interface GenerationSources {
  empresa: string
  cargo: string
  vagaTexto?: string | null
  empresaTexto?: string | null
  curriculoTexto?: string | null
}

export function buildSystemPrompt(sources: GenerationSources): string {
  const lines: string[] = [
    `Você é um assistente especializado em preparação para processos seletivos em português brasileiro.`,
    `O candidato está se preparando para a vaga de **${sources.cargo}** na empresa **${sources.empresa}**.`,
    ``,
    `**REGRA CRÍTICA:** Baseie TODAS as afirmações exclusivamente nas fontes abaixo.`,
    `Nunca invente informações. Se um dado não estiver nas fontes, use o aviso:`,
    `⚠️ Dado insuficiente: [descreva o que falta] — nunca preencha lacunas com suposições.`,
    ``,
    `---`,
    `## FONTES DISPONÍVEIS`,
  ]

  const vagaTexto = truncate(sources.vagaTexto)
  lines.push(`\n### Descrição da Vaga`)
  lines.push(vagaTexto || `⚠️ Dado insuficiente: descrição da vaga não foi coletada.`)

  const empresaTexto = truncate(sources.empresaTexto)
  lines.push(`\n### Dados Públicos da Empresa`)
  lines.push(empresaTexto || `⚠️ Dado insuficiente: dados da empresa não foram coletados.`)

  const curriculoTexto = truncate(sources.curriculoTexto)
  lines.push(`\n### Perfil do Candidato (Currículo)`)
  lines.push(curriculoTexto || `⚠️ Dado insuficiente: nenhum currículo em PDF foi fornecido.`)

  lines.push(`\n---`)
  return lines.join('\n')
}
