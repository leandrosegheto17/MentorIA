import { z } from 'zod'
import { anthropic, AI_MODEL } from '@/lib/ai/client'
import { buildSystemPrompt, type GenerationSources } from '@/lib/ai/prompts/system'
import { buildFaqPrompt } from '@/lib/ai/prompts/faq'

const faqItemSchema = z.object({
  pergunta: z.string().min(1),
  resposta: z.string().min(1),
  categoria: z.enum(['EMPRESA', 'VAGA', 'COMPORTAMENTAL']),
})

export type FaqItemGerado = z.infer<typeof faqItemSchema>

function extractJson(text: string): string {
  const match = text.match(/\[[\s\S]*\]/)
  return match ? match[0] : text
}

export async function generateFaq(sources: GenerationSources): Promise<FaqItemGerado[]> {
  const systemText = buildSystemPrompt(sources)
  const userPrompt = buildFaqPrompt(sources)

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 4096,
    system: [
      {
        type: 'text',
        text: systemText,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userPrompt }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('unexpected_response_type')

  const jsonText = extractJson(block.text)
  const parsed = z.array(faqItemSchema).safeParse(JSON.parse(jsonText))
  if (!parsed.success) throw new Error('invalid_faq_format')

  return parsed.data
}
