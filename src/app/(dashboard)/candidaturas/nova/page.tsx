import { createCandidatura } from '@/server/actions/candidatura'
import { CandidaturaForm } from '@/components/candidatura/CandidaturaForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NovaCandidaturaPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nova Candidatura</h1>
        <p className="text-gray-500 text-sm mt-1">
          Preencha os dados da vaga para gerar seu material de preparação.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da vaga</CardTitle>
        </CardHeader>
        <CardContent>
          <CandidaturaForm action={createCandidatura} submitLabel="Criar candidatura" />
        </CardContent>
      </Card>
    </div>
  )
}
