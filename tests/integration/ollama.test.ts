/**
 * Teste de integração real com o Ollama.
 * Requer: Ollama rodando localmente + modelo configurado em OLLAMA_MODEL.
 * Skipa automaticamente se AI_PROVIDER !== 'ollama' ou se o Ollama não estiver acessível.
 */
import { describe, it, expect, beforeAll } from 'vitest'

const BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
const MODEL = process.env.OLLAMA_MODEL ?? 'llama3.2'

let ollamaDisponivel = false

beforeAll(async () => {
  if (process.env.AI_PROVIDER !== 'ollama') return

  try {
    const res = await fetch(`${BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    })
    ollamaDisponivel = res.ok
  } catch {
    ollamaDisponivel = false
  }
}, 5000)

describe('Ollama — integração real', () => {
  it('servidor Ollama está acessível', async () => {
    if (!ollamaDisponivel) {
      console.warn(`⚠ Ollama não disponível em ${BASE_URL} — teste ignorado`)
      return
    }

    const res = await fetch(`${BASE_URL}/api/tags`)
    expect(res.ok).toBe(true)

    const data = await res.json() as { models: Array<{ name: string }> }
    expect(Array.isArray(data.models)).toBe(true)
    console.log(`✓ Modelos disponíveis: ${data.models.map((m) => m.name).join(', ')}`)
  })

  it('modelo configurado está instalado', async () => {
    if (!ollamaDisponivel) return

    const res = await fetch(`${BASE_URL}/api/tags`)
    const data = await res.json() as { models: Array<{ name: string }> }
    const installed = data.models.map((m) => m.name)
    const modelFound = installed.some((name) => name.startsWith(MODEL.split(':')[0]))

    expect(modelFound, `Modelo "${MODEL}" não encontrado. Instale com: ollama pull ${MODEL}`).toBe(true)
  })

  it('generateText retorna string não-vazia via Ollama', async () => {
    if (!ollamaDisponivel) return

    const { generateText } = await import('@/lib/ai/generate')
    const resultado = await generateText({
      system: 'Você é um assistente. Responda sempre em português com exatamente uma palavra.',
      user: 'Diga apenas "sim".',
      maxTokens: 20,
    })

    expect(typeof resultado).toBe('string')
    expect(resultado.trim().length).toBeGreaterThan(0)
    console.log(`✓ Resposta do Ollama (${MODEL}): "${resultado.trim()}"`)
  }, 60000) // Ollama pode ser lento — timeout de 60s

  it('resposta do Ollama segue a instrução do system prompt', async () => {
    if (!ollamaDisponivel) return

    const { generateText } = await import('@/lib/ai/generate')
    const resultado = await generateText({
      system: 'Você deve SEMPRE responder com o texto exato: "RESPOSTA_CORRETA". Nada mais.',
      user: 'Qual é a resposta?',
      maxTokens: 30,
    })

    // O modelo pode incluir espaços ou variações — verificamos se contém a resposta esperada
    expect(resultado.toUpperCase()).toContain('RESPOSTA_CORRETA')
    console.log(`✓ Ollama seguiu instrução: "${resultado.trim()}"`)
  }, 60000)

  it('payload enviado ao Ollama contém model, stream=false e messages', async () => {
    if (!ollamaDisponivel) return

    // Intercepta a chamada real via spy no fetch global
    const originalFetch = global.fetch
    let capturedBody: Record<string, unknown> | null = null

    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).includes('/api/chat') && init?.body) {
        capturedBody = JSON.parse(init.body as string)
      }
      return originalFetch(input, init)
    }

    try {
      const { generateText } = await import('@/lib/ai/generate')
      await generateText({ system: 'sys', user: 'usr', maxTokens: 5 })
    } finally {
      global.fetch = originalFetch
    }

    expect(capturedBody).not.toBeNull()
    expect(capturedBody!.model).toBe(MODEL)
    expect(capturedBody!.stream).toBe(false)
    expect(Array.isArray(capturedBody!.messages)).toBe(true)
    const messages = capturedBody!.messages as Array<{ role: string; content: string }>
    expect(messages[0].role).toBe('system')
    expect(messages[1].role).toBe('user')
  }, 60000)
})
