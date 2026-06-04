import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const OLLAMA_RESPONSE = { message: { content: 'Resposta gerada pelo Ollama' } }

describe('generateText — provedor ollama', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('AI_PROVIDER', 'ollama')
    vi.stubEnv('OLLAMA_BASE_URL', 'http://localhost:11434')
    vi.stubEnv('OLLAMA_MODEL', 'llama3.2')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('retorna o conteúdo da resposta do Ollama', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => OLLAMA_RESPONSE,
    } as Response)

    const { generateText } = await import('@/lib/ai/generate')
    const result = await generateText({ system: 'System', user: 'User' })

    expect(result).toBe('Resposta gerada pelo Ollama')
  })

  it('envia system e user como mensagens no corpo da requisição', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => OLLAMA_RESPONSE,
    } as Response)

    const { generateText } = await import('@/lib/ai/generate')
    await generateText({ system: 'Meu system prompt', user: 'Meu user prompt' })

    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toContain('localhost:11434')
    expect(url).toContain('/api/chat')

    const body = JSON.parse(init!.body as string)
    expect(body.messages[0]).toEqual({ role: 'system', content: 'Meu system prompt' })
    expect(body.messages[1]).toEqual({ role: 'user', content: 'Meu user prompt' })
    expect(body.model).toBe('llama3.2')
    expect(body.stream).toBe(false)
  })

  it('usa maxTokens personalizado quando fornecido', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => OLLAMA_RESPONSE,
    } as Response)

    const { generateText } = await import('@/lib/ai/generate')
    await generateText({ system: 'S', user: 'U', maxTokens: 512 })

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)
    expect(body.options.num_predict).toBe(512)
  })

  it('lança erro com status quando Ollama retorna falha', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: async () => 'Service Unavailable',
    } as Response)

    const { generateText } = await import('@/lib/ai/generate')
    await expect(generateText({ system: 'S', user: 'U' })).rejects.toThrow('Ollama error 503')
  })
})

describe('generateText — seleção de provedor', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('usa Ollama quando AI_PROVIDER=ollama', async () => {
    vi.stubEnv('AI_PROVIDER', 'ollama')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: { content: 'ollama ok' } }),
    } as Response))

    const { generateText } = await import('@/lib/ai/generate')
    const result = await generateText({ system: 'S', user: 'U' })

    expect(result).toBe('ollama ok')
    expect(vi.mocked(fetch)).toHaveBeenCalled()
  })
})
