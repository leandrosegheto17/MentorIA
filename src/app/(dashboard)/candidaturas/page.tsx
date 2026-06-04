import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function CandidaturasPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Candidaturas</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie suas preparações para processos seletivos</p>
        </div>
        <Link href="/candidaturas/nova" className={cn(buttonVariants())}>
          Nova Candidatura
        </Link>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-gray-900 font-medium mb-1">Nenhuma candidatura ainda</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
            Adicione sua primeira candidatura para começar a se preparar para a entrevista.
          </p>
          <Link href="/candidaturas/nova" className={cn(buttonVariants())}>
            Criar primeira candidatura
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
