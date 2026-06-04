import type { ScrapingResult } from './types'

const MIN_CONTENT_LENGTH = 200

async function scrapeWithFirecrawl(url: string): Promise<string> {
  const FirecrawlApp = (await import('@mendable/firecrawl-js')).default
  const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! })
  const result = await app.scrapeUrl(url, { formats: ['markdown'] }) as Record<string, unknown>
  if (!result.success) throw new Error('firecrawl_failed')
  return (result.markdown as string) ?? ''
}

async function scrapeWithJina(url: string): Promise<string> {
  const response = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`, {
    headers: { Accept: 'text/plain', 'X-Return-Format': 'text' },
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new Error('jina_failed')
  return response.text()
}

export async function scrapeVaga(url: string): Promise<ScrapingResult> {
  const collectedAt = new Date()

  try {
    if (process.env.FIRECRAWL_API_KEY) {
      const content = await scrapeWithFirecrawl(url)
      if (content.length > MIN_CONTENT_LENGTH) {
        return { success: true, content, source: url, collectedAt }
      }
    }

    const content = await scrapeWithJina(url)
    if (content.length > MIN_CONTENT_LENGTH) {
      return { success: true, content, source: url, collectedAt }
    }

    return {
      success: false,
      source: url,
      collectedAt,
      error: { reason: 'blocked', message: 'Não foi possível extrair conteúdo suficiente da vaga.' },
    }
  } catch {
    return {
      success: false,
      source: url,
      collectedAt,
      error: { reason: 'timeout', message: 'Tempo esgotado ao tentar acessar o link da vaga.' },
    }
  }
}
