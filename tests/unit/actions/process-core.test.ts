import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/lib/prisma', () => ({
  prisma: {
    candidatura: {
      findUnique: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
    },
    topicoPreparacao: {
      upsert: vi.fn().mockResolvedValue({}),
    },
    faqItem: {
      deleteMany: vi.fn().mockResolvedValue({}),
      createMany: vi.fn().mockResolvedValue({}),
    },
  },
}))

vi.mock('@/lib/scraping/vaga', () => ({
  scrapeVaga: vi.fn(),
}))

vi.mock('@/lib/scraping/empresa', () => ({
  scrapeEmpresa: vi.fn(),
}))

vi.mock('@/lib/pdf/extract', () => ({
  extractPdfText: vi.fn(),
}))

vi.mock('@/lib/storage/curriculo', () => ({
  downloadCurriculo: vi.fn(),
}))

vi.mock('@/lib/ai/agents/generate-topico', () => ({
  generateTopico: vi.fn(),
}))

vi.mock('@/lib/ai/agents/generate-faq', () => ({
  generateFaq: vi.fn(),
}))

// ── helpers ───────────────────────────────────────────────────────────────────

function makeCandidatura(overrides = {}) {
  return {
    id: 'cand-1',
    userId: 'user-1',
    empresa: 'SoftPlan',
    cargo: 'Gerente de Dev',
    linkVaga: 'https://softplan.com.br/vaga',
    curriculoPath: null,
    vagaTexto: null,
    empresaTexto: null,
    curriculoTexto: null,
    linkedinText: null,
    status: 'PENDING',
    ...overrides,
  }
}

function makeTopico(tipo: string) {
  return { tipo, titulo: `Título ${tipo}`, conteudo: `Conteúdo de ${tipo}` }
}

// ── testes ────────────────────────────────────────────────────────────────────

describe('processarCore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lança not_found quando candidatura não existe', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.candidatura.findUnique).mockResolvedValueOnce(null)

    const { processarCore } = await import('@/server/actions/process-core')
    await expect(processarCore('id-inexistente', 'user-1')).rejects.toThrow('not_found')
  })

  it('executa coleta e geração completa no caminho feliz', async () => {
    const { prisma } = await import('@/lib/prisma')
    const { scrapeVaga } = await import('@/lib/scraping/vaga')
    const { scrapeEmpresa } = await import('@/lib/scraping/empresa')
    const { generateTopico } = await import('@/lib/ai/agents/generate-topico')
    const { generateFaq } = await import('@/lib/ai/agents/generate-faq')

    vi.mocked(prisma.candidatura.findUnique).mockResolvedValueOnce(makeCandidatura() as never)
    vi.mocked(scrapeVaga).mockResolvedValue({ success: true, content: 'Descrição da vaga', source: '', collectedAt: new Date() })
    vi.mocked(scrapeEmpresa).mockResolvedValue({ success: true, content: 'Dados da empresa', source: '', collectedAt: new Date() })
    vi.mocked(generateTopico).mockImplementation(async (tipo) => makeTopico(tipo) as never)
    vi.mocked(generateFaq).mockResolvedValue([
      { pergunta: 'P?', resposta: 'R.', categoria: 'EMPRESA' },
    ])

    const { processarCore } = await import('@/server/actions/process-core')
    const result = await processarCore('cand-1', 'user-1')

    expect(result.avisos).toHaveLength(0)

    // Os 3 tópicos devem ser upsertados
    expect(prisma.topicoPreparacao.upsert).toHaveBeenCalledTimes(3)
    expect(prisma.topicoPreparacao.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ tipo: 'EMPRESA' }) })
    )
    expect(prisma.topicoPreparacao.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ tipo: 'VAGA' }) })
    )
    expect(prisma.topicoPreparacao.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ tipo: 'PERGUNTAS' }) })
    )

    // O FAQ deve ser salvo
    expect(prisma.faqItem.deleteMany).toHaveBeenCalledWith({ where: { candidaturaId: 'cand-1' } })
    expect(prisma.faqItem.createMany).toHaveBeenCalledOnce()
  })

  it('dispara todos os 4 geradores de IA', async () => {
    const { prisma } = await import('@/lib/prisma')
    const { scrapeVaga } = await import('@/lib/scraping/vaga')
    const { scrapeEmpresa } = await import('@/lib/scraping/empresa')
    const { generateTopico } = await import('@/lib/ai/agents/generate-topico')
    const { generateFaq } = await import('@/lib/ai/agents/generate-faq')

    vi.mocked(prisma.candidatura.findUnique).mockResolvedValueOnce(makeCandidatura() as never)
    vi.mocked(scrapeVaga).mockResolvedValue({ success: true, content: 'vaga ok', source: '', collectedAt: new Date() })
    vi.mocked(scrapeEmpresa).mockResolvedValue({ success: true, content: 'empresa ok', source: '', collectedAt: new Date() })
    vi.mocked(generateTopico).mockImplementation(async (tipo) => makeTopico(tipo) as never)
    vi.mocked(generateFaq).mockResolvedValue([])

    const { processarCore } = await import('@/server/actions/process-core')
    await processarCore('cand-1', 'user-1')

    // generateTopico chamado 3 vezes (EMPRESA, VAGA, PERGUNTAS)
    expect(generateTopico).toHaveBeenCalledTimes(3)
    expect(generateTopico).toHaveBeenCalledWith('EMPRESA', expect.any(Object))
    expect(generateTopico).toHaveBeenCalledWith('VAGA', expect.any(Object))
    expect(generateTopico).toHaveBeenCalledWith('PERGUNTAS', expect.any(Object))

    // generateFaq chamado 1 vez
    expect(generateFaq).toHaveBeenCalledTimes(1)
  })

  it('adiciona aviso quando scraping da vaga falha e continua o processamento', async () => {
    const { prisma } = await import('@/lib/prisma')
    const { scrapeVaga } = await import('@/lib/scraping/vaga')
    const { scrapeEmpresa } = await import('@/lib/scraping/empresa')
    const { generateTopico } = await import('@/lib/ai/agents/generate-topico')
    const { generateFaq } = await import('@/lib/ai/agents/generate-faq')

    vi.mocked(prisma.candidatura.findUnique).mockResolvedValueOnce(makeCandidatura() as never)
    vi.mocked(scrapeVaga).mockResolvedValue({
      success: false,
      source: '',
      collectedAt: new Date(),
      error: { reason: 'blocked', message: 'Acesso bloqueado' },
    })
    vi.mocked(scrapeEmpresa).mockResolvedValue({ success: true, content: 'empresa ok', source: '', collectedAt: new Date() })
    vi.mocked(generateTopico).mockImplementation(async (tipo) => makeTopico(tipo) as never)
    vi.mocked(generateFaq).mockResolvedValue([])

    const { processarCore } = await import('@/server/actions/process-core')
    const result = await processarCore('cand-1', 'user-1')

    // Deve ter aviso da vaga
    expect(result.avisos).toEqual(expect.arrayContaining([expect.stringContaining('Vaga')]))

    // Mas a geração de IA deve prosseguir
    expect(generateTopico).toHaveBeenCalledTimes(3)
  })

  it('adiciona aviso quando uma geração de IA falha e salva as demais', async () => {
    const { prisma } = await import('@/lib/prisma')
    const { scrapeVaga } = await import('@/lib/scraping/vaga')
    const { scrapeEmpresa } = await import('@/lib/scraping/empresa')
    const { generateTopico } = await import('@/lib/ai/agents/generate-topico')
    const { generateFaq } = await import('@/lib/ai/agents/generate-faq')

    vi.mocked(prisma.candidatura.findUnique).mockResolvedValueOnce(makeCandidatura() as never)
    vi.mocked(scrapeVaga).mockResolvedValue({ success: true, content: 'vaga ok', source: '', collectedAt: new Date() })
    vi.mocked(scrapeEmpresa).mockResolvedValue({ success: true, content: 'empresa ok', source: '', collectedAt: new Date() })

    // Apenas PERGUNTAS falha
    vi.mocked(generateTopico).mockImplementation(async (tipo) => {
      if (tipo === 'PERGUNTAS') throw new Error('context_length_exceeded')
      return makeTopico(tipo) as never
    })
    vi.mocked(generateFaq).mockResolvedValue([])

    const { processarCore } = await import('@/server/actions/process-core')
    const result = await processarCore('cand-1', 'user-1')

    // Deve ter aviso de Perguntas
    expect(result.avisos).toEqual(expect.arrayContaining([expect.stringContaining('Perguntas')]))

    // EMPRESA e VAGA devem ter sido salvos mesmo assim
    expect(prisma.topicoPreparacao.upsert).toHaveBeenCalledTimes(2)
  })

  it('não tenta scraping da vaga quando linkVaga não foi fornecido', async () => {
    const { prisma } = await import('@/lib/prisma')
    const { scrapeVaga } = await import('@/lib/scraping/vaga')
    const { scrapeEmpresa } = await import('@/lib/scraping/empresa')
    const { generateTopico } = await import('@/lib/ai/agents/generate-topico')
    const { generateFaq } = await import('@/lib/ai/agents/generate-faq')

    vi.mocked(prisma.candidatura.findUnique).mockResolvedValueOnce(
      makeCandidatura({ linkVaga: null }) as never
    )
    vi.mocked(scrapeEmpresa).mockResolvedValue({ success: true, content: 'empresa ok', source: '', collectedAt: new Date() })
    vi.mocked(generateTopico).mockImplementation(async (tipo) => makeTopico(tipo) as never)
    vi.mocked(generateFaq).mockResolvedValue([])

    const { processarCore } = await import('@/server/actions/process-core')
    await processarCore('cand-1', 'user-1')

    expect(scrapeVaga).not.toHaveBeenCalled()
  })

  it('passa os textos coletados como sources para a geração de IA', async () => {
    const { prisma } = await import('@/lib/prisma')
    const { scrapeVaga } = await import('@/lib/scraping/vaga')
    const { scrapeEmpresa } = await import('@/lib/scraping/empresa')
    const { generateTopico } = await import('@/lib/ai/agents/generate-topico')
    const { generateFaq } = await import('@/lib/ai/agents/generate-faq')

    vi.mocked(prisma.candidatura.findUnique).mockResolvedValueOnce(makeCandidatura() as never)
    vi.mocked(scrapeVaga).mockResolvedValue({ success: true, content: 'CONTEUDO_VAGA', source: '', collectedAt: new Date() })
    vi.mocked(scrapeEmpresa).mockResolvedValue({ success: true, content: 'CONTEUDO_EMPRESA', source: '', collectedAt: new Date() })
    vi.mocked(generateTopico).mockImplementation(async (tipo) => makeTopico(tipo) as never)
    vi.mocked(generateFaq).mockResolvedValue([])

    const { processarCore } = await import('@/server/actions/process-core')
    await processarCore('cand-1', 'user-1')

    // As sources passadas para generateTopico devem conter os textos coletados
    const [, sources] = vi.mocked(generateTopico).mock.calls[0]
    expect(sources.vagaTexto).toBe('CONTEUDO_VAGA')
    expect(sources.empresaTexto).toBe('CONTEUDO_EMPRESA')
    expect(sources.empresa).toBe('SoftPlan')
    expect(sources.cargo).toBe('Gerente de Dev')
  })
})
