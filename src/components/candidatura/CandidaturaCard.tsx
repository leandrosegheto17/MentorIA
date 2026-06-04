import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Candidatura, ProcessingStatus } from '@/types/candidatura'

const statusConfig: Record<ProcessingStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING:    { label: 'Aguardando', variant: 'secondary' },
  PROCESSING: { label: 'Processando', variant: 'default' },
  COMPLETED:  { label: 'Pronto', variant: 'outline' },
  ERROR:      { label: 'Erro', variant: 'destructive' },
}

export function CandidaturaCard({ candidatura }: { candidatura: Candidatura }) {
  const status = statusConfig[candidatura.status]

  return (
    <Link href={`/candidaturas/${candidatura.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="flex items-center justify-between py-4">
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{candidatura.empresa}</p>
            <p className="text-sm text-gray-500 truncate mt-0.5">{candidatura.cargo}</p>
          </div>
          <Badge variant={status.variant} className="ml-4 shrink-0">
            {status.label}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  )
}
