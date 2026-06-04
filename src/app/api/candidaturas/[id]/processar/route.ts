import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { processarCore } from '@/server/actions/process-core'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const candidatura = await prisma.candidatura.findUnique({ where: { id, userId: user.id } })
  if (!candidatura) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  if (candidatura.status === 'PROCESSING') {
    return NextResponse.json({ error: 'already_processing' }, { status: 409 })
  }

  // Marca como PROCESSING e retorna imediatamente
  await prisma.candidatura.update({ where: { id }, data: { status: 'PROCESSING' } })

  // Dispara em background sem bloquear a resposta
  const userId = user.id
  processarCore(id, userId)
    .then(() =>
      prisma.candidatura.update({ where: { id }, data: { status: 'COMPLETED' } })
    )
    .catch(() =>
      prisma.candidatura.update({ where: { id }, data: { status: 'ERROR' } }).catch(() => null)
    )

  return NextResponse.json({ status: 'started' })
}
