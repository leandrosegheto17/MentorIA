export interface GenerateOptions {
  system: string
  user: string
  maxTokens?: number
}

// ── Anthropic ────────────────────────────────────────────────────────────────

async function generateWithAnthropic(opts: GenerateOptions): Promise<string> {
  const { anthropic, AI_MODEL, AI_MAX_TOKENS } = await import('@/lib/ai/client')

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: opts.maxTokens ?? AI_MAX_TOKENS,
    system: [
      {
        type: 'text',
        text: opts.system,
        cache_control: { type: 'ephemeral' }, // reduz custo em chamadas paralelas
      },
    ],
    messages: [{ role: 'user', content: opts.user }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('unexpected_response_type')
  return block.text
}

// ── Ollama ───────────────────────────────────────────────────────────────────

async function generateWithOllama(opts: GenerateOptions): Promise<string> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
  const model = process.env.OLLAMA_MODEL ?? 'llama3.2'

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
      options: {
        num_predict: opts.maxTokens ?? 4096,
      },
    }),
    signal: AbortSignal.timeout(120000), // modelos locais podem ser mais lentos
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Ollama error ${response.status}: ${err}`)
  }

  const data = await response.json() as { message: { content: string } }
  return data.message.content
}

// ── Exportação unificada ──────────────────────────────────────────────────────

export async function generateText(opts: GenerateOptions): Promise<string> {
  const provider = process.env.AI_PROVIDER ?? 'anthropic'

  if (provider === 'ollama') return generateWithOllama(opts)
  return generateWithAnthropic(opts)
}
