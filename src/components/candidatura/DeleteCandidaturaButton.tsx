'use client'

import { useTransition, useState } from 'react'
import { Button } from '@/components/ui/button'
import { deleteCandidatura } from '@/server/actions/candidatura'

export function DeleteCandidaturaButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)

  function handleDelete() {
    startTransition(async () => {
      await deleteCandidatura(id)
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Confirmar exclusão?</span>
        <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isPending}>
          {isPending ? 'Excluindo...' : 'Sim, excluir'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={isPending}>
          Cancelar
        </Button>
      </div>
    )
  }

  return (
    <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
      Excluir
    </Button>
  )
}
