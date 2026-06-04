# Rule: Estrutura de Pastas

Esta rule é **crítica e inegociável**. Antes de criar qualquer arquivo, consulte o mapeamento abaixo e coloque o arquivo na pasta correta. Nunca crie pastas novas fora da estrutura definida sem atualizar esta rule e o PRD.md.

## Mapeamento obrigatório

| Tipo de arquivo | Pasta obrigatória |
|---|---|
| Página Next.js (rota pública) | `src/app/(auth)/[rota]/page.tsx` |
| Página Next.js (rota protegida) | `src/app/(dashboard)/[feature]/page.tsx` |
| Layout de grupo de rotas | `src/app/(grupo)/layout.tsx` |
| API Route Handler | `src/app/api/[recurso]/route.ts` |
| Componente de feature específica | `src/components/[feature]/` |
| Componente reutilizável entre features | `src/components/shared/` |
| Primitivo shadcn/ui | `src/components/ui/` — **não editar** |
| Integração Claude API (chamadas, streaming) | `src/lib/ai/agents/` ou `src/lib/ai/prompts/` |
| Scraping (Firecrawl, parsers de HTML) | `src/lib/scraping/` |
| Parsing de PDF | `src/lib/pdf/` |
| Operações de Storage (upload/download) | `src/lib/storage/` |
| Definições de jobs BullMQ | `src/lib/queue/` |
| Lógica de negócio (orquestra lib/ + repositories) | `src/server/services/` |
| Acesso ao banco via Prisma | `src/server/repositories/` |
| Schemas Zod de validação de entrada/saída | `src/server/validators/` |
| React hooks customizados | `src/hooks/` |
| Zustand stores | `src/stores/` |
| Interfaces e tipos TypeScript globais | `src/types/` |
| Funções puras sem efeitos colaterais | `src/utils/` |
| Schema Prisma | `prisma/schema.prisma` |
| Testes unitários | `tests/unit/` |
| Testes de integração | `tests/integration/` |
| Testes E2E | `tests/e2e/` |
| Assets estáticos | `public/` |

## Estrutura completa de referência

```
mentoria/
├── .claude/
│   ├── agents/
│   ├── rules/
│   └── commands/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   └── candidaturas/
│   │   │       ├── page.tsx
│   │   │       └── [id]/
│   │   │           ├── empresa/
│   │   │           ├── vaga/
│   │   │           ├── perguntas/
│   │   │           ├── faq/
│   │   │           └── simulado/
│   │   └── api/
│   │       ├── candidaturas/
│   │       ├── processing/
│   │       └── webhooks/
│   ├── components/
│   │   ├── ui/
│   │   ├── candidatura/
│   │   ├── simulado/
│   │   └── shared/
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── agents/
│   │   │   └── prompts/
│   │   ├── scraping/
│   │   ├── pdf/
│   │   ├── storage/
│   │   └── queue/
│   ├── server/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── validators/
│   ├── hooks/
│   ├── stores/
│   ├── types/
│   └── utils/
├── prisma/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── public/
```

## Proibições explícitas

- **Nunca** colocar lógica de negócio diretamente em Route Handlers — use `services/`
- **Nunca** acessar o banco diretamente de `services/` sem passar por `repositories/`
- **Nunca** chamar a Claude API de componentes React, hooks ou Route Handlers — use `src/lib/ai/`
- **Nunca** criar uma pasta `helpers/` ou `misc/` — use `utils/` para funções puras
- **Nunca** criar componentes diretamente em `src/components/` (raiz) — sempre em uma subpasta de feature ou `shared/`
- **Nunca** misturar tipos locais com tipos globais: tipos usados por mais de uma feature vão em `src/types/`

## Ao criar uma nova feature

1. Criar a página em `src/app/(dashboard)/[feature]/`
2. Criar componentes em `src/components/[feature]/`
3. Criar o Route Handler em `src/app/api/[feature]/`
4. Criar o validator em `src/server/validators/[feature].ts`
5. Criar o service em `src/server/services/[feature].ts`
6. Criar o repository em `src/server/repositories/[feature].ts`
7. Adicionar tipos em `src/types/[feature].ts` se compartilhados

Use o comando `/scaffold-feature [nome]` para gerar este boilerplate automaticamente.
