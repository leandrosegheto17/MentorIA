# Rule: Padrões TypeScript

## Configuração do compilador

`tsconfig.json` deve ter `strict: true` habilitado. Isso inclui:
- `strictNullChecks`
- `noImplicitAny`
- `strictFunctionTypes`

Nunca desabilitar flags de strict para "passar a build mais rápido".

## Proibições

- **Nunca usar `any`** — use `unknown` e faça narrowing explícito, ou defina um tipo adequado
- **Nunca usar `// @ts-ignore`** ou `// @ts-expect-error` sem comentário explicando o motivo e um TODO para remover
- **Nunca usar `as unknown as Tipo`** como atalho para escapar do type system
- **Nunca definir tipos inline complexos** em chamadas de função — extraia para um alias em `src/types/`

## Imports

Usar paths absolutos com o alias `@/`:

```typescript
// CORRETO
import { CandidaturaService } from '@/server/services/candidatura'
import type { Candidatura } from '@/types/candidatura'

// ERRADO
import { CandidaturaService } from '../../server/services/candidatura'
```

Separar imports em grupos (ferramenta de linting cuida da ordem):
1. Módulos Node/externos
2. Imports internos com `@/`
3. Imports relativos (apenas dentro do mesmo módulo)

## Convenções de nomenclatura

| Construto | Convenção | Exemplo |
|---|---|---|
| Componente React | PascalCase | `CandidaturaCard` |
| Hook | camelCase com `use` | `useCandidatura` |
| Service / Repository | PascalCase + sufixo | `CandidaturaService` |
| Função utilitária | camelCase | `parsePdfText` |
| Constante global | SCREAMING_SNAKE_CASE | `MAX_PDF_SIZE_MB` |
| Interface | PascalCase sem prefixo `I` | `Candidatura`, `CreateCandidaturaInput` |
| Type alias | PascalCase | `ProcessingStatus` |
| Arquivo de componente | PascalCase | `CandidaturaCard.tsx` |
| Arquivo de utilitário | kebab-case | `parse-pdf.ts` |
| Arquivo de route handler | `route.ts` (obrigatório Next.js) | |

## Tipos e interfaces

- Usar `interface` para objetos que podem ser estendidos (entidades, props de componentes)
- Usar `type` para unions, intersections e aliases de tipos primitivos
- Tipos de entrada/saída da API devem ser definidos em `src/types/` e reutilizados tanto no frontend quanto no backend

```typescript
// src/types/candidatura.ts
export interface Candidatura {
  id: string
  empresa: string
  cargo: string
  linkVaga?: string
  curriculoPath?: string
  status: ProcessingStatus
  userId: string
  createdAt: Date
  updatedAt: Date
}

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'error'

export interface CreateCandidaturaInput {
  empresa: string
  cargo: string
  linkVaga?: string
}
```

## Validação com Zod

Todo dado que entra no sistema por um boundary externo (request body, params, env vars) deve ser validado com Zod. O schema Zod é a fonte da verdade — inferir os tipos TypeScript a partir dele:

```typescript
// src/server/validators/candidatura.ts
import { z } from 'zod'

export const createCandidaturaSchema = z.object({
  empresa: z.string().min(1).max(200),
  cargo: z.string().min(1).max(200),
  linkVaga: z.string().url().optional(),
})

export type CreateCandidaturaInput = z.infer<typeof createCandidaturaSchema>
```

## Async/await

- Sempre usar `async/await` em vez de `.then().catch()`
- Tratar erros com `try/catch` explícito nas camadas de serviço e Route Handler
- Nunca deixar Promises soltas sem `await` ou `.catch()`

## Exports

- Preferir exports nomeados a default exports (facilita refatoração e tree-shaking)
- Exceção: componentes de página Next.js (`page.tsx`, `layout.tsx`) usam default export por exigência do framework
