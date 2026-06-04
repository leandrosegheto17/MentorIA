'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
type Action = (formData: FormData) => Promise<{ error: string } | void>

interface DefaultValues {
  empresa?: string | null
  cargo?: string | null
  linkVaga?: string | null
  linkedinText?: string | null
  curriculoPath?: string | null
}

interface CandidaturaFormProps {
  action: Action
  defaultValues?: DefaultValues
  submitLabel?: string
}

export function CandidaturaForm({ action, defaultValues, submitLabel = 'Salvar' }: CandidaturaFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await action(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="empresa">Empresa <span className="text-red-500">*</span></Label>
          <Input
            id="empresa"
            name="empresa"
            placeholder="Ex: Google"
            defaultValue={defaultValues?.empresa ?? ''}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cargo">Cargo <span className="text-red-500">*</span></Label>
          <Input
            id="cargo"
            name="cargo"
            placeholder="Ex: Engenheiro de Software"
            defaultValue={defaultValues?.cargo ?? ''}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="linkVaga">Link da vaga <span className="text-gray-400 font-normal">(opcional)</span></Label>
        <Input
          id="linkVaga"
          name="linkVaga"
          type="url"
          placeholder="https://..."
          defaultValue={defaultValues?.linkVaga ?? ''}
        />
        <p className="text-xs text-gray-400">Usado para extrair a descrição da vaga automaticamente</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="linkedinText">Perfil LinkedIn <span className="text-gray-400 font-normal">(opcional)</span></Label>
        <Textarea
          id="linkedinText"
          name="linkedinText"
          placeholder="Cole aqui o texto exportado do seu perfil LinkedIn..."
          rows={5}
          defaultValue={defaultValues?.linkedinText ?? ''}
        />
        <p className="text-xs text-gray-400">
          No LinkedIn: perfil → Mais → Salvar como PDF → cole o texto aqui.
          Isso permite personalizar as perguntas ao seu perfil.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="curriculo">
          Currículo PDF <span className="text-gray-400 font-normal">(opcional, máx. 10 MB)</span>
        </Label>
        <Input
          id="curriculo"
          name="curriculo"
          type="file"
          accept="application/pdf"
          className="cursor-pointer"
        />
        {defaultValues?.curriculoPath && (
          <p className="text-xs text-green-600">✓ Currículo já enviado. Selecione um novo para substituir.</p>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
