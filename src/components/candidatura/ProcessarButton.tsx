'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { processarCandidatura } from '@/server/actions/processamento'
import type { ProcessingStatus } from '@/types/candidatura'

interface ProcessarButtonProps {
  id: string
  status: ProcessingStatus
}

export function ProcessarButton({ id, status }: ProcessarButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [avisos, setAvisos] = useState<string[]>([])
  const router = useRouter()

  function handleProcessar() {
    setAvisos([])
    startTransition(async () => {
      const result = await processarCandidatura(id)
      if (result?.avisos) setAvisos(result.avisos)
      router.refresh()
    })
  }

  const isProcessing = status === 'PROCESSING' || isPending

  if (status === 'COMPLETED' && !isPending) {
    return (
      <div className="mt-6 space-y-2">
        <Button variant="outline" size="sm" onClick={handleProcessar} disabled={isPending}>
          Reprocessar dados
        </Button>
        <p className="text-xs text-gray-400">Útil se a vaga foi atualizada ou você adicionou currículo.</p>
      </div>
    )
  }

  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-3">
      <div>
        <p className="text-sm text-blue-800 font-medium">
          {isProcessing ? 'Coletando e processando dados...' : 'Pronto para processar'}
        </p>
        <p className="text-xs text-blue-600 mt-0.5">
          {isProcessing
            ? 'Isso pode levar até 30 segundos.'
            : 'Clique para coletar dados da vaga, empresa e currículo.'}
        </p>
      </div>

      {avisos.length > 0 && (
        <ul className="text-xs text-amber-700 bg-amber-50 p-2 rounded space-y-1">
          {avisos.map((a, i) => <li key={i}>⚠ {a}</li>)}
        </ul>
      )}

      {status !== 'PROCESSING' && (
        <Button size="sm" onClick={handleProcessar} disabled={isProcessing}>
          {isProcessing ? 'Processando...' : status === 'ERROR' ? 'Tentar novamente' : 'Iniciar Processamento'}
        </Button>
      )}
    </div>
  )
}
