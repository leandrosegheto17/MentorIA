import * as repo from '@/server/repositories/candidatura'
import type { CreateCandidaturaInput, UpdateCandidaturaInput } from '@/server/validators/candidatura'

export function listCandidaturas(userId: string) {
  return repo.listCandidaturas(userId)
}

export async function getCandidatura(id: string, userId: string) {
  const candidatura = await repo.getCandidatura(id, userId)
  if (!candidatura) throw new Error('not_found')
  return candidatura
}

export function createCandidatura(userId: string, data: CreateCandidaturaInput) {
  return repo.createCandidatura(userId, data)
}

export async function updateCandidatura(id: string, userId: string, data: UpdateCandidaturaInput) {
  await getCandidatura(id, userId)
  return repo.updateCandidatura(id, userId, data)
}

export async function deleteCandidatura(id: string, userId: string) {
  await getCandidatura(id, userId)
  return repo.deleteCandidatura(id, userId)
}
