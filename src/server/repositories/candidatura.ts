import { prisma } from '@/lib/prisma'
import type { CreateCandidaturaInput, UpdateCandidaturaInput } from '@/server/validators/candidatura'

export function listCandidaturas(userId: string) {
  return prisma.candidatura.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export function getCandidatura(id: string, userId: string) {
  return prisma.candidatura.findUnique({
    where: { id, userId },
    include: { topicos: true, faqItems: true },
  })
}

export function createCandidatura(userId: string, data: CreateCandidaturaInput) {
  return prisma.candidatura.create({
    data: { ...data, userId },
  })
}

export function updateCandidatura(id: string, userId: string, data: UpdateCandidaturaInput) {
  return prisma.candidatura.update({
    where: { id, userId },
    data,
  })
}

export function deleteCandidatura(id: string, userId: string) {
  return prisma.candidatura.delete({
    where: { id, userId },
  })
}
