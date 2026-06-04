import { describe, it, expect, vi, beforeEach } from 'vitest'

// Deve ficar no topo — Vitest hoist vi.mock para antes de qualquer import
vi.mock('pdf-parse', () => ({ default: vi.fn() }))

const VALID_CV = `João Silva — Engenheiro de Software Sênior
10 anos de experiência em desenvolvimento backend com Node.js, TypeScript e arquiteturas distribuídas.
Experiência profissional:
  TechCorp (2018-presente): Líder técnico, responsável por equipe de 5 desenvolvedores.
  StartupX (2014-2018): Desenvolvedor fullstack, entrega de features críticas.
Formação: Ciência da Computação — USP (2010-2014).
Habilidades: Node.js, TypeScript, React, PostgreSQL, AWS, Docker, Kubernetes.`

describe('extractPdfText', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna texto extraído quando PDF tem conteúdo suficiente', async () => {
    const { default: pdfParse } = await import('pdf-parse')
    vi.mocked(pdfParse).mockResolvedValueOnce({ text: VALID_CV } as never)

    const { extractPdfText } = await import('@/lib/pdf/extract')
    const result = await extractPdfText(Buffer.from('fake-pdf-bytes'))

    expect(result).toContain('João Silva')
    expect(result).toContain('Engenheiro de Software')
    expect(result).toContain('Node.js')
  })

  it('faz trim no texto extraído', async () => {
    const { default: pdfParse } = await import('pdf-parse')
    vi.mocked(pdfParse).mockResolvedValueOnce({ text: `\n\n  ${VALID_CV}  \n\n` } as never)

    const { extractPdfText } = await import('@/lib/pdf/extract')
    const result = await extractPdfText(Buffer.from('fake-pdf'))

    expect(result.startsWith(' ')).toBe(false)
    expect(result.endsWith(' ')).toBe(false)
    expect(result.startsWith('\n')).toBe(false)
  })

  it('lança pdf_insufficient_text quando texto é muito curto', async () => {
    const { default: pdfParse } = await import('pdf-parse')
    vi.mocked(pdfParse).mockResolvedValueOnce({ text: 'Texto curto demais' } as never)

    const { extractPdfText } = await import('@/lib/pdf/extract')
    await expect(extractPdfText(Buffer.from('fake-pdf'))).rejects.toThrow('pdf_insufficient_text')
  })

  it('lança pdf_insufficient_text para texto vazio', async () => {
    const { default: pdfParse } = await import('pdf-parse')
    vi.mocked(pdfParse).mockResolvedValueOnce({ text: '' } as never)

    const { extractPdfText } = await import('@/lib/pdf/extract')
    await expect(extractPdfText(Buffer.from('fake-pdf'))).rejects.toThrow('pdf_insufficient_text')
  })

  it('propaga erros do pdf-parse (ex: PDF corrompido)', async () => {
    const { default: pdfParse } = await import('pdf-parse')
    vi.mocked(pdfParse).mockRejectedValueOnce(new Error('Invalid PDF structure'))

    const { extractPdfText } = await import('@/lib/pdf/extract')
    await expect(extractPdfText(Buffer.from('corrupt'))).rejects.toThrow('Invalid PDF structure')
  })
})
