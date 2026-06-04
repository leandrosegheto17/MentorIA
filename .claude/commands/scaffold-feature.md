---
description: Cria o boilerplate completo de uma nova feature respeitando a estrutura de pastas do projeto. Uso: /scaffold-feature [nome-da-feature]
---

Crie o boilerplate completo para a feature `$ARGUMENTS` no projeto MentorIA, seguindo **rigorosamente** a rule `folder-structure`.

## O que criar

Para a feature `$ARGUMENTS`, gere os seguintes arquivos com conteúdo inicial funcional (não vazio):

### 1. Página Next.js
`src/app/(dashboard)/$ARGUMENTS/page.tsx`
- Componente de página com layout básico
- Título da feature
- Placeholder para o conteúdo principal
- Default export (exigência do Next.js)

### 2. Componente principal da feature
`src/components/$ARGUMENTS/$ARGUMENTS-list.tsx` (ou nome mais adequado)
- Componente React com TypeScript
- Props tipadas com interface
- Named export

### 3. API Route Handler
`src/app/api/$ARGUMENTS/route.ts`
- GET e POST handlers básicos
- Autenticação via Supabase no início de cada handler
- Validação com Zod antes de chamar o service
- Formato de resposta seguindo a rule `api-conventions`

### 4. Validator Zod
`src/server/validators/$ARGUMENTS.ts`
- Schema de criação (`create${Feature}Schema`)
- Schema de atualização (`update${Feature}Schema`) com `.partial()`
- Tipos inferidos exportados

### 5. Service de negócio
`src/server/services/$ARGUMENTS.ts`
- Classe ou módulo com as operações principais (list, getById, create, update, delete)
- Recebe `userId` como parâmetro em todas as operações
- Chama os repositories — nunca acessa o banco diretamente

### 6. Repository
`src/server/repositories/$ARGUMENTS.ts`
- Funções de acesso ao banco via Prisma
- Todas as queries incluem `where: { userId }` para isolamento
- Tipos de retorno explícitos

### 7. Tipos TypeScript
`src/types/$ARGUMENTS.ts`
- Interface principal da entidade
- Tipos de input/output usados pelo service e pela API

## Verificação após criação

Após criar os arquivos, execute mentalmente a rule `folder-structure` para confirmar que nenhum arquivo foi criado fora do lugar. Liste os arquivos criados com seus caminhos completos para o usuário revisar.

## Nota

Não criar testes agora — o usuário cria os testes quando a implementação estiver completa. Não adicionar funcionalidades além do boilerplate básico — o objetivo é ter a estrutura pronta para o usuário implementar a lógica de negócio.
