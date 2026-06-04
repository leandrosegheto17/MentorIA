'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { ProcessingStatus } from '@/types/candidatura'

interface ProcessarButtonProps {
  id: string
  status: ProcessingStatus
}

export function ProcessarButton({ id, status: initialStatus }: ProcessarButtonProps) {
  const [localStatus, setLocalStatus] = useState<ProcessingStatus>(initialStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isProcessing = localStatus === 'PROCESSING' || loading

  async function handleProcessar() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/candidaturas/${id}/processar`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Erro ao iniciar processamento.')
        setLoading(false)
        return
      }
      setLocalStatus('PROCESSING')
    } catch {
      setError('Não foi possível conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  if (isProcessing) {
    return (
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-blue-800 font-medium">Processando em background...</p>
        </div>
        <p className="text-xs text-blue-600">
          A página atualiza automaticamente quando o material estiver pronto.
        </p>
      </div>
    )
  }

  if (localStatus === 'COMPLETED') {
    return (
      <div className="mt-6 space-y-2">
        <Button variant="outline" size="sm" onClick={handleProcessar} disabled={loading}>
          Reprocessar dados
        </Button>
        <p className="text-xs text-gray-400">Útil se a vaga foi atualizada ou você adicionou currículo.</p>
      </div>
    )
  }

  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-3">
      <div>
        <p className="text-sm text-blue-800 font-medium">Pronto para processar</p>
        <p className="text-xs text-blue-600 mt-0.5">
          Clique para coletar dados da vaga, empresa e currículo em background.
        </p>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button size="sm" onClick={handleProcessar} disabled={loading}>
        {localStatus === 'ERROR' ? 'Tentar novamente' : 'Iniciar Processamento'}
      </Button>
    </div>
  )
}
