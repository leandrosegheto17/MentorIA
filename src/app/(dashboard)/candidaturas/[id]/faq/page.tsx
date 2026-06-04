import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCandidatura } from '@/server/services/candidatura'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { FaqCategoria } from '@/generated/prisma/enums'

const categoriaConfig: Record<FaqCategoria, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  EMPRESA:        { label: 'Empresa', variant: 'secondary' },
  VAGA:           { label: 'Vaga', variant: 'outline' },
  COMPORTAMENTAL: { label: 'Comportamental', variant: 'default' },
}

export default async function FaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let candidatura
  try { candidatura = await getCandidatura(id, user.id) }
  catch { notFound() }

  const faqItems = candidatura.faqItems
  const categorias: FaqCategoria[] = ['EMPRESA', 'VAGA', 'COMPORTAMENTAL']

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/candidaturas" className="hover:text-gray-700">Candidaturas</Link>
        <span>/</span>
        <Link href={`/candidaturas/${id}`} className="hover:text-gray-700">{candidatura.empresa}</Link>
        <span>/</span>
        <span>FAQ</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">FAQ — Perguntas Frequentes</h1>

      {faqItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500 text-sm">
            O FAQ ainda não foi gerado. Inicie o processamento na{' '}
            <Link href={`/candidaturas/${id}`} className="text-blue-600 hover:underline">
              página da candidatura
            </Link>.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {categorias.map((categoria) => {
            const items = faqItems.filter((f) => f.categoria === categoria)
            if (!items.length) return null
            const config = categoriaConfig[categoria]

            return (
              <section key={categoria}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={config.variant}>{config.label}</Badge>
                  <span className="text-xs text-gray-400">{items.length} perguntas</span>
                </div>
                <div className="space-y-3">
                  {items.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="pt-4 pb-4">
                        <p className="text-sm font-medium text-gray-900 mb-2">{item.pergunta}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{item.resposta}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
