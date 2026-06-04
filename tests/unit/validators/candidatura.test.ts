import { describe, it, expect } from 'vitest'
import { createCandidaturaSchema, updateCandidaturaSchema } from '@/server/validators/candidatura'

describe('createCandidaturaSchema', () => {
  it('aceita campos obrigatórios válidos', () => {
    const result = createCandidaturaSchema.safeParse({ empresa: 'Google', cargo: 'Engenheiro' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.empresa).toBe('Google')
      expect(result.data.cargo).toBe('Engenheiro')
      expect(result.data.linkVaga).toBeUndefined()
    }
  })

  it('rejeita empresa vazia', () => {
    const result = createCandidaturaSchema.safeParse({ empresa: '', cargo: 'Dev' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].message).toBe('Nome da empresa é obrigatório')
  })

  it('rejeita cargo vazio', () => {
    const result = createCandidaturaSchema.safeParse({ empresa: 'Google', cargo: '' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].message).toBe('Nome do cargo é obrigatório')
  })

  it('aceita linkVaga com URL válida', () => {
    const result = createCandidaturaSchema.safeParse({
      empresa: 'Google', cargo: 'Dev',
      linkVaga: 'https://careers.google.com/job/123',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.linkVaga).toBe('https://careers.google.com/job/123')
  })

  it('rejeita linkVaga com formato inválido', () => {
    const result = createCandidaturaSchema.safeParse({
      empresa: 'Google', cargo: 'Dev',
      linkVaga: 'nao-e-uma-url',
    })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].message).toContain('URL válida')
  })

  it('converte string vazia de linkVaga para undefined', () => {
    const result = createCandidaturaSchema.safeParse({ empresa: 'Google', cargo: 'Dev', linkVaga: '' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.linkVaga).toBeUndefined()
  })

  it('rejeita empresa com mais de 200 caracteres', () => {
    const result = createCandidaturaSchema.safeParse({ empresa: 'a'.repeat(201), cargo: 'Dev' })
    expect(result.success).toBe(false)
  })
})

describe('updateCandidaturaSchema', () => {
  it('aceita objeto vazio — todos os campos são opcionais', () => {
    const result = updateCandidaturaSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('aceita atualização parcial', () => {
    const result = updateCandidaturaSchema.safeParse({ empresa: 'Meta' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.empresa).toBe('Meta')
      expect(result.data.cargo).toBeUndefined()
    }
  })

  it('ainda valida URL quando linkVaga está presente', () => {
    const result = updateCandidaturaSchema.safeParse({ linkVaga: 'url-invalida' })
    expect(result.success).toBe(false)
  })
})
