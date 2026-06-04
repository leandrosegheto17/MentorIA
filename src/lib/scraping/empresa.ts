import type { ScrapingResult } from './types'

const MIN_CONTENT_LENGTH = 200

async function searchWithFirecrawl(query: string): Promise<string> {
  const FirecrawlApp = (await import('@mendable/firecrawl-js')).default
  const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! })
  const results = await app.search(query, { limit: 3 }) as Record<string, unknown>
  const data = results.data as Array<Record<string, unknown>> | undefined
  if (!results.success || !data?.length) throw new Error('firecrawl_no_results')
  return data.map((r) => `${r.title}\n${r.description ?? r.content ?? ''}`).join('\n\n')
}

async function searchWithJina(query: string): Promise<string> {
  const searchUrl = `https://s.jina.ai/${encodeURIComponent(query)}`
  const response = await fetch(searchUrl, {
    headers: { Accept: 'text/plain' },
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new Error('jina_search_failed')
  return response.text()
}

export async function scrapeEmpresa(nomeEmpresa: string): Promise<ScrapingResult> {
  const collectedAt = new Date()
  const query = `${nomeEmpresa} empresa sobre missão valores cultura`

  try {
    if (process.env.FIRECRAWL_API_KEY) {
      const content = await searchWithFirecrawl(query)
      if (content.length > MIN_CONTENT_LENGTH) {
        return { success: true, content, source: query, collectedAt }
      }
    }

    const content = await searchWithJina(query)
    if (content.length > MIN_CONTENT_LENGTH) {
      return { success: true, content, source: query, collectedAt }
    }

    return {
      success: false,
      source: query,
      collectedAt,
      error: { reason: 'api_unavailable', message: 'Não foi possível coletar dados da empresa.' },
    }
  } catch {
    return {
      success: false,
      source: query,
      collectedAt,
      error: { reason: 'timeout', message: 'Tempo esgotado ao buscar dados da empresa.' },
    }
  }
}
