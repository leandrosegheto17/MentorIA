---
description: Audita a estrutura de pastas atual do projeto contra a rule folder-structure e lista todos os desvios encontrados.
---

Audite a estrutura de pastas do projeto MentorIA e identifique todos os desvios em relação à rule `folder-structure`.

## O que verificar

Para cada arquivo encontrado no projeto (excluindo `node_modules`, `.next`, `dist`, `.git`), verifique se ele está na pasta correta de acordo com o mapeamento da rule `folder-structure`:

| Tipo de arquivo | Pasta esperada |
|---|---|
| Página Next.js (rota auth) | `src/app/(auth)/` |
| Página Next.js (rota protegida) | `src/app/(dashboard)/` |
| API Route Handler | `src/app/api/` |
| Componente de feature | `src/components/[feature]/` |
| Componente reutilizável | `src/components/shared/` |
| Primitivo UI | `src/components/ui/` |
| Integração Claude API | `src/lib/ai/` |
| Scraping | `src/lib/scraping/` |
| PDF | `src/lib/pdf/` |
| Storage | `src/lib/storage/` |
| Fila BullMQ | `src/lib/queue/` |
| Lógica de negócio | `src/server/services/` |
| Acesso ao banco | `src/server/repositories/` |
| Validators Zod | `src/server/validators/` |
| React hooks | `src/hooks/` |
| Zustand stores | `src/stores/` |
| Tipos globais | `src/types/` |
| Funções puras | `src/utils/` |

## Verificações adicionais

Além da localização dos arquivos, verificar:

1. **Lógica de negócio em Route Handlers** — Route Handlers (`route.ts`) não devem conter lógica de negócio; apenas chamar services
2. **Acesso direto ao banco em Services** — Services não devem importar `db` ou `prisma` diretamente; usar repositories
3. **Claude API fora de `src/lib/ai/`** — Imports do `@anthropic-ai/sdk` fora de `src/lib/ai/` são proibidos
4. **Tipos locais que deveriam ser globais** — Interfaces usadas por mais de um módulo devem estar em `src/types/`
5. **Pasta `helpers/` ou `misc/` não autorizada** — Deve ser `utils/`

## Formato do relatório

Apresente o resultado em dois blocos:

### ✅ Conforme
Liste as áreas que estão corretas.

### ❌ Desvios encontrados
Para cada desvio:
- **Arquivo**: caminho atual
- **Problema**: o que está errado
- **Correção**: para onde mover ou o que refatorar

Se não houver desvios, confirmar que a estrutura está 100% conforme.
