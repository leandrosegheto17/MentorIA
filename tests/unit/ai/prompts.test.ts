import { describe, it, expect } from 'vitest'
import { buildSystemPrompt } from '@/lib/ai/prompts/system'
import { buildEmpresaPrompt } from '@/lib/ai/prompts/empresa'
import { buildVagaPrompt } from '@/lib/ai/prompts/vaga'
import { buildPerguntasPrompt } from '@/lib/ai/prompts/perguntas'
import { buildFaqPrompt } from '@/lib/ai/prompts/faq'

const baseSources = { empresa: 'SoftPlan', cargo: 'Gerente de Desenvolvimento' }

describe('buildSystemPrompt', () => {
  it('inclui empresa e cargo no prompt', () => {
    const prompt = buildSystemPrompt(baseSources)
    expect(prompt).toContain('SoftPlan')
    expect(prompt).toContain('Gerente de Desenvolvimento')
  })

  it('inclui regra crítica de grounding', () => {
    const prompt = buildSystemPrompt(baseSources)
    expect(prompt).toContain('REGRA CRÍTICA')
    expect(prompt).toContain('Nunca invente informações')
  })

  it('exibe aviso quando vaga não foi coletada', () => {
    const prompt = buildSystemPrompt(baseSources)
    expect(prompt).toContain('descrição da vaga não foi coletada')
  })

  it('inclui texto da vaga quando fornecido', () => {
    const prompt = buildSystemPrompt({ ...baseSources, vagaTexto: 'Requisitos: React, Node.js' })
    expect(prompt).toContain('Requisitos: React, Node.js')
    expect(prompt).not.toContain('descrição da vaga não foi coletada')
  })

  it('exibe aviso quando currículo não fornecido', () => {
    const prompt = buildSystemPrompt(baseSources)
    expect(prompt).toContain('nenhum currículo em PDF foi fornecido')
  })

  it('inclui texto do currículo quando fornecido', () => {
    const prompt = buildSystemPrompt({ ...baseSources, curriculoTexto: 'João Silva - 10 anos backend' })
    expect(prompt).toContain('João Silva - 10 anos backend')
    expect(prompt).not.toContain('nenhum currículo em PDF foi fornecido')
  })

  it('trunca fontes muito longas e adiciona marcador', () => {
    const longText = 'x'.repeat(15000)
    const prompt = buildSystemPrompt({ ...baseSources, vagaTexto: longText })
    expect(prompt).toContain('[conteúdo truncado]')
  })

  it('inclui dados da empresa quando fornecidos', () => {
    const prompt = buildSystemPrompt({ ...baseSources, empresaTexto: 'Empresa líder em ERP' })
    expect(prompt).toContain('Empresa líder em ERP')
    expect(prompt).not.toContain('dados da empresa não foram coletados')
  })
})

describe('buildEmpresaPrompt', () => {
  it('solicita a estrutura dos 5 tópicos obrigatórios', () => {
    const prompt = buildEmpresaPrompt(baseSources)
    expect(prompt).toContain('Sobre a Empresa')
    expect(prompt).toContain('Missão, Valores e Cultura')
    expect(prompt).toContain('Produtos e Serviços')
    expect(prompt).toContain('Contexto de Mercado')
    expect(prompt).toContain('Entrevistas')
  })
})

describe('buildVagaPrompt', () => {
  it('não inclui análise de aderência sem currículo', () => {
    const prompt = buildVagaPrompt(baseSources)
    expect(prompt).not.toContain('Análise de Aderência')
  })

  it('inclui análise de aderência quando currículo está disponível', () => {
    const prompt = buildVagaPrompt({ ...baseSources, curriculoTexto: 'João Silva - Dev' })
    expect(prompt).toContain('Análise de Aderência')
    expect(prompt).toContain('Pontos fortes')
    expect(prompt).toContain('Lacunas a preparar')
  })
})

describe('buildPerguntasPrompt', () => {
  it('inclui os 3 tipos de pergunta', () => {
    const prompt = buildPerguntasPrompt(baseSources)
    expect(prompt).toContain('Técnicas')
    expect(prompt).toContain('Comportamentais')
    expect(prompt).toContain('Situacionais')
    expect(prompt).toContain('STAR')
  })

  it('menciona personalização quando currículo disponível', () => {
    const prompt = buildPerguntasPrompt({ ...baseSources, curriculoTexto: 'perfil do candidato' })
    expect(prompt).toContain('perfil do candidato')
  })
})

describe('buildFaqPrompt', () => {
  it('instrui retorno em JSON', () => {
    const prompt = buildFaqPrompt(baseSources)
    expect(prompt).toContain('JSON')
    expect(prompt).toContain('pergunta')
    expect(prompt).toContain('resposta')
    expect(prompt).toContain('categoria')
  })

  it('especifica as 3 categorias válidas', () => {
    const prompt = buildFaqPrompt(baseSources)
    expect(prompt).toContain('EMPRESA')
    expect(prompt).toContain('VAGA')
    expect(prompt).toContain('COMPORTAMENTAL')
  })
})
