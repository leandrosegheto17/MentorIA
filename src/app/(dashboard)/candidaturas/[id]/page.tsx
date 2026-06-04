import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCandidatura } from '@/server/services/candidatura'
import { DeleteCandidaturaButton } from '@/components/candidatura/DeleteCandidaturaButton'
import { ProcessarButton } from '@/components/candidatura/ProcessarButton'
import { PollingRefresher } from '@/components/shared/PollingRefresher'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ProcessingStatus } from '@/types/candidatura'

const statusConfig: Record<ProcessingStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING:    { label: 'Aguardando processamento', variant: 'secondary' },
  PROCESSING: { label: 'Processando...', variant: 'default' },
  COMPLETED:  { label: 'Pronto', variant: 'outline' },
  ERROR:      { label: 'Erro no processamento', variant: 'destructive' },
}

const topicos = [
  { tipo: 'EMPRESA',   titulo: 'Conhecer a empresa',      descricao: 'Contexto, cultura, produtos e mercado' },
  { tipo: 'VAGA',      titulo: 'Conhecer a vaga',          descricao: 'Responsabilidades, requisitos e aderência do seu perfil' },
  { tipo: 'PERGUNTAS', titulo: 'Perguntas & Respostas',    descricao: 'Perguntas prováveis com orientações personalizadas' },
  { tipo: 'FAQ',       titulo: 'FAQ',                      descricao: 'Perguntas frequentes filtráveis por categoria' },
] as const

export default async function CandidaturaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let candidatura
  try {
    candidatura = await getCandidatura(id, user.id)
  } catch {
    notFound()
  }

  const status = statusConfig[candidatura.status]

  return (
    <div>
      <PollingRefresher active={candidatura.status === 'PROCESSING'} intervalMs={3000} />
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/candidaturas" className="hover:text-gray-700">Candidaturas</Link>
            <span>/</span>
            <span>{candidatura.empresa}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{candidatura.cargo}</h1>
          <p className="text-gray-600 mt-0.5">{candidatura.empresa}</p>
          <div className="mt-2">
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Link
            href={`/candidaturas/${id}/editar`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            Editar
          </Link>
          <DeleteCandidaturaButton id={id} />
        </div>
      </div>

      {/* Info da vaga */}
      {candidatura.linkVaga && (
        <div className="mb-6 text-sm">
          <span className="text-gray-500">Link da vaga: </span>
          <a
            href={candidatura.linkVaga}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline truncate"
          >
            {candidatura.linkVaga}
          </a>
        </div>
      )}

      {/* Tópicos de preparação */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {topicos.map(({ tipo, titulo, descricao }) => {
          const topico = candidatura.topicos.find((t) => t.tipo === tipo)
          const isReady = !!topico
          const isError = candidatura.status === 'ERROR'

          return (
            <Card
              key={tipo}
              className={cn(
                'transition-shadow',
                isReady ? 'hover:shadow-md cursor-pointer' : 'opacity-60'
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 mb-3">{descricao}</p>
                {isReady ? (
                  <Link
                    href={`/candidaturas/${id}/${tipo.toLowerCase()}`}
                    className={cn(buttonVariants({ size: 'sm' }))}
                  >
                    Ver material
                  </Link>
                ) : (
                  <span className="text-xs text-gray-400">
                    {isError ? 'Falha ao gerar' : 'Aguardando processamento'}
                  </span>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Botão de processamento */}
      <ProcessarButton id={id} status={candidatura.status} />
    </div>
  )
}
