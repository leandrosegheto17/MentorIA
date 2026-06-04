import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Conteúdo > 200 chars para passar a validação mínima de conteúdo
const MOCK_COMPANY = `SoftPlan é uma empresa de tecnologia especializada em ERP para o setor público.
Fundada em 1990, possui mais de 1.000 colaboradores e está presente em 3 países da América Latina.
Seus produtos atendem tribunais, câmaras municipais e prefeituras em todo o Brasil.
Cultura organizacional com foco em inovação e desenvolvimento contínuo dos colaboradores.`

describe('scrapeEmpresa', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('retorna sucesso com dados da empresa via Jina search', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, text: async () => MOCK_COMPANY } as Response)

    const { scrapeEmpresa } = await import('@/lib/scraping/empresa')
    const result = await scrapeEmpresa('SoftPlan')

    expect(result.success).toBe(true)
    expect(result.content).toBe(MOCK_COMPANY)
    expect(result.source).toContain('SoftPlan')
  })

  it('inclui nome da empresa na URL de busca', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, text: async () => MOCK_COMPANY } as Response)

    const { scrapeEmpresa } = await import('@/lib/scraping/empresa')
    await scrapeEmpresa('SoftPlan')

    const [url] = vi.mocked(fetch).mock.calls[0]
    expect(decodeURIComponent(url as string)).toContain('SoftPlan')
  })

  it('retorna error quando conteúdo retornado é muito curto', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, text: async () => 'Nada encontrado' } as Response)

    const { scrapeEmpresa } = await import('@/lib/scraping/empresa')
    const result = await scrapeEmpresa('EmpresaDesconhecida')

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('retorna error quando fetch falha', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('timeout'))

    const { scrapeEmpresa } = await import('@/lib/scraping/empresa')
    const result = await scrapeEmpresa('SoftPlan')

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
