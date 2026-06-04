import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/ai/generate', () => ({
  generateText: vi.fn(),
}))

const baseSources = { empresa: 'X', cargo: 'Dev' }

describe('generateFaq', () => {
  beforeEach(() => vi.resetModules())

  it('parseia array JSON retornado diretamente pela IA', async () => {
    const { generateText } = await import('@/lib/ai/generate')
    vi.mocked(generateText).mockResolvedValueOnce(JSON.stringify([
      { pergunta: 'Como você lida com prazos?', resposta: 'Priorizo tarefas...', categoria: 'COMPORTAMENTAL' },
      { pergunta: 'O que faz a empresa X?', resposta: 'É uma startup...', categoria: 'EMPRESA' },
      { pergunta: 'Quais skills são exigidas?', resposta: 'React e TypeScript', categoria: 'VAGA' },
    ]))

    const { generateFaq } = await import('@/lib/ai/agents/generate-faq')
    const result = await generateFaq(baseSources)

    expect(result).toHaveLength(3)
    expect(result[0].categoria).toBe('COMPORTAMENTAL')
    expect(result[1].categoria).toBe('EMPRESA')
    expect(result[2].categoria).toBe('VAGA')
  })

  it('extrai JSON de resposta com texto adicional da IA', async () => {
    const { generateText } = await import('@/lib/ai/generate')
    vi.mocked(generateText).mockResolvedValueOnce(
      'Aqui está o FAQ gerado:\n\n[{"pergunta":"P1?","resposta":"R1.","categoria":"VAGA"}]\n\nEspero que ajude!'
    )

    const { generateFaq } = await import('@/lib/ai/agents/generate-faq')
    const result = await generateFaq(baseSources)

    expect(result).toHaveLength(1)
    expect(result[0].pergunta).toBe('P1?')
    expect(result[0].resposta).toBe('R1.')
  })

  it('lança invalid_faq_format quando categoria é inválida', async () => {
    const { generateText } = await import('@/lib/ai/generate')
    vi.mocked(generateText).mockResolvedValueOnce(
      JSON.stringify([{ pergunta: 'P?', resposta: 'R.', categoria: 'INVALIDA' }])
    )

    const { generateFaq } = await import('@/lib/ai/agents/generate-faq')
    await expect(generateFaq(baseSources)).rejects.toThrow('invalid_faq_format')
  })

  it('lança erro quando resposta não contém JSON', async () => {
    const { generateText } = await import('@/lib/ai/generate')
    vi.mocked(generateText).mockResolvedValueOnce('Sem JSON aqui, apenas texto simples.')

    const { generateFaq } = await import('@/lib/ai/agents/generate-faq')
    await expect(generateFaq(baseSources)).rejects.toThrow()
  })

  it('lança erro quando item de FAQ não tem campo obrigatório', async () => {
    const { generateText } = await import('@/lib/ai/generate')
    vi.mocked(generateText).mockResolvedValueOnce(
      JSON.stringify([{ pergunta: 'P?', categoria: 'VAGA' }]) // sem resposta
    )

    const { generateFaq } = await import('@/lib/ai/agents/generate-faq')
    await expect(generateFaq(baseSources)).rejects.toThrow('invalid_faq_format')
  })
})
