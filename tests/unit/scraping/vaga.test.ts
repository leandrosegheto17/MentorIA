import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Conteúdo > 200 chars (MIN_CONTENT_LENGTH) para passar a validação mínima
const MOCK_JOB = `Desenvolvedor Senior React — Vaga Remota.
Requisitos obrigatórios: 5 anos de experiência, TypeScript, Node.js, testes automatizados.
Responsabilidades: desenvolvimento de features, code review, mentoria de devs júnior e documentação técnica.
Benefícios: plano de saúde, VR, VA, PLR e stock options.`

describe('scrapeVaga', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('retorna sucesso com conteúdo via Jina quando sem Firecrawl', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, text: async () => MOCK_JOB } as Response)

    const { scrapeVaga } = await import('@/lib/scraping/vaga')
    const result = await scrapeVaga('https://empresa.com/vaga/123')

    expect(result.success).toBe(true)
    expect(result.content).toBe(MOCK_JOB)
    expect(result.source).toBe('https://empresa.com/vaga/123')
    expect(result.error).toBeUndefined()
  })

  it('inclui timestamp válido em collectedAt', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, text: async () => MOCK_JOB } as Response)

    const before = new Date()
    const { scrapeVaga } = await import('@/lib/scraping/vaga')
    const result = await scrapeVaga('https://empresa.com/vaga/123')
    const after = new Date()

    expect(result.collectedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(result.collectedAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('retorna reason=blocked quando conteúdo é muito curto', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, text: async () => 'Vaga indisponível' } as Response)

    const { scrapeVaga } = await import('@/lib/scraping/vaga')
    const result = await scrapeVaga('https://empresa.com/vaga/123')

    expect(result.success).toBe(false)
    expect(result.error?.reason).toBe('blocked')
    expect(result.content).toBeUndefined()
  })

  it('retorna error quando fetch lança exceção', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const { scrapeVaga } = await import('@/lib/scraping/vaga')
    const result = await scrapeVaga('https://empresa.com/vaga/123')

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('retorna error quando response não é ok (ex: 403 Forbidden)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 403, text: async () => 'Forbidden' } as Response)

    const { scrapeVaga } = await import('@/lib/scraping/vaga')
    const result = await scrapeVaga('https://empresa.com/vaga/123')

    expect(result.success).toBe(false)
  })
})
