import { z } from 'zod'
import { generateText } from '@/lib/ai/generate'
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
  const text = await generateText({
    system: buildSystemPrompt(sources),
    user: buildFaqPrompt(sources),
  })

  const jsonText = extractJson(text)
  const parsed = z.array(faqItemSchema).safeParse(JSON.parse(jsonText))
  if (!parsed.success) throw new Error('invalid_faq_format')

  return parsed.data
}
