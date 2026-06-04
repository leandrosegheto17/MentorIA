# Rule: Convenções de API

## Formato de resposta padrão

Todo Route Handler deve retornar JSON neste formato:

```typescript
// Sucesso
{
  "data": <payload>,
  "meta": {           // opcional — para listas paginadas
    "total": number,
    "page": number,
    "pageSize": number
  }
}

// Erro
{
  "error": {
    "code": string,   // snake_case, ex: "candidatura_not_found"
    "message": string // mensagem legível para o usuário
  }
}
```

Nunca misturar `data` e `error` na mesma resposta. Nunca retornar o payload diretamente na raiz (sem o wrapper `data`).

## Status codes

| Situação | Status |
|---|---|
| Leitura bem-sucedida | 200 |
| Criação bem-sucedida | 201 |
| Sem conteúdo (DELETE) | 204 |
| Entrada inválida (Zod) | 400 |
| Não autenticado | 401 |
| Sem permissão | 403 |
| Recurso não encontrado | 404 |
| Conflito de estado | 409 |
| Erro interno | 500 |

## Nomenclatura de endpoints

Seguir REST com recursos em português e plural:

```
GET    /api/candidaturas              # lista
POST   /api/candidaturas              # cria
GET    /api/candidaturas/[id]         # busca por id
PATCH  /api/candidaturas/[id]         # atualiza parcialmente
DELETE /api/candidaturas/[id]         # remove

POST   /api/candidaturas/[id]/processing   # dispara reprocessamento
GET    /api/candidaturas/[id]/empresa      # busca tópico empresa
```

Usar `PATCH` para atualizações parciais e `PUT` apenas para substituição total (raro).

## Validação de entrada

Todo Route Handler valida o corpo da requisição com Zod antes de chamar qualquer service:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createCandidaturaSchema } from '@/server/validators/candidatura'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = createCandidaturaSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: parsed.error.message } },
      { status: 400 }
    )
  }

  // chamar service com parsed.data
}
```

O schema Zod fica em `src/server/validators/`. Nunca validar inline no Route Handler.

## Autenticação

Toda rota protegida verifica a sessão do Supabase antes de executar qualquer lógica:

```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return NextResponse.json(
    { error: { code: 'unauthorized', message: 'Autenticação necessária' } },
    { status: 401 }
  )
}
```

## Tratamento de erros

- Erros esperados (não encontrado, permissão negada): retornar resposta JSON com status apropriado
- Erros inesperados: logar no Sentry e retornar 500 sem expor detalhes internos
- Nunca retornar stack traces para o cliente em produção

```typescript
try {
  // lógica
} catch (error) {
  // Sentry.captureException(error) — quando Sentry estiver configurado
  return NextResponse.json(
    { error: { code: 'internal_error', message: 'Erro interno. Tente novamente.' } },
    { status: 500 }
  )
}
```
