import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCandidatura } from '@/server/services/candidatura'
import { MarkdownContent } from '@/components/shared/MarkdownContent'
import { Card, CardContent } from '@/components/ui/card'

export default async function PerguntasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let candidatura
  try { candidatura = await getCandidatura(id, user.id) }
  catch { notFound() }

  const topico = candidatura.topicos.find((t) => t.tipo === 'PERGUNTAS')

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/candidaturas" className="hover:text-gray-700">Candidaturas</Link>
        <span>/</span>
        <Link href={`/candidaturas/${id}`} className="hover:text-gray-700">{candidatura.empresa}</Link>
        <span>/</span>
        <span>Perguntas & Respostas</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Perguntas & Respostas</h1>

      {topico ? (
        <Card>
          <CardContent className="pt-6">
            <MarkdownContent content={topico.conteudo} />
            {topico.avisos.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium mb-1">Avisos de coleta:</p>
                <ul className="space-y-0.5">
                  {topico.avisos.map((a, i) => (
                    <li key={i} className="text-xs text-amber-600">⚠ {a}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-gray-500 text-sm">
            Este tópico ainda não foi gerado. Inicie o processamento na{' '}
            <Link href={`/candidaturas/${id}`} className="text-blue-600 hover:underline">
              página da candidatura
            </Link>.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
