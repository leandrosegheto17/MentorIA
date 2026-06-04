import { z } from 'zod'

export const createCandidaturaSchema = z.object({
  empresa: z.string().min(1, 'Nome da empresa é obrigatório').max(200),
  cargo: z.string().min(1, 'Nome do cargo é obrigatório').max(200),
  linkVaga: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().url('Informe uma URL válida (ex: https://...)').optional()
  ),
})

export const updateCandidaturaSchema = createCandidaturaSchema.partial()

export type CreateCandidaturaInput = z.infer<typeof createCandidaturaSchema>
export type UpdateCandidaturaInput = z.infer<typeof updateCandidaturaSchema>
