import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCandidatura } from '@/server/services/candidatura'
import { updateCandidatura } from '@/server/actions/candidatura'
import { CandidaturaForm } from '@/components/candidatura/CandidaturaForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function EditarCandidaturaPage({ params }: { params: Promise<{ id: string }> }) {
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

  const action = updateCandidatura.bind(null, id)

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/candidaturas" className="hover:text-gray-700">Candidaturas</Link>
          <span>/</span>
          <Link href={`/candidaturas/${id}`} className="hover:text-gray-700">{candidatura.empresa}</Link>
          <span>/</span>
          <span>Editar</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Candidatura</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da vaga</CardTitle>
        </CardHeader>
        <CardContent>
          <CandidaturaForm
            action={action}
            defaultValues={candidatura}
            submitLabel="Salvar alterações"
          />
        </CardContent>
      </Card>
    </div>
  )
}
