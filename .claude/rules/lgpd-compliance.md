# Rule: Conformidade LGPD

Currículo, e-mail, LinkedIn e qualquer dado que identifique o candidato são **dados pessoais sob a LGPD**. Esta rule define as obrigações que todo código do MentorIA deve respeitar.

## Princípios inegociáveis

1. **Finalidade**: dados coletados são usados exclusivamente para gerar material de preparação da candidatura específica — nunca para outros fins
2. **Necessidade**: coletar apenas o mínimo necessário para a finalidade declarada
3. **Transparência**: o candidato sabe o que é coletado, por quê e por quanto tempo
4. **Segurança**: dados pessoais protegidos em trânsito e em repouso
5. **Direito de exclusão**: o candidato pode excluir seus dados a qualquer momento, com efeito imediato e completo

## Logs — proibições absolutas

**Nunca** incluir nos logs (console, Sentry, qualquer observabilidade):

- Conteúdo do currículo PDF
- E-mail do usuário (usar apenas o `user_id` como identificador)
- Conteúdo colado do LinkedIn
- Nome completo do candidato
- Qualquer campo de formulário que possa identificar o usuário

```typescript
// ERRADO
console.log(`Processando candidatura de ${user.email}`)
logger.info({ curriculo: pdfText, userId: user.id })

// CORRETO
logger.info({ userId: user.id, action: 'candidatura.processing.started' })
```

## Consentimento

- O consentimento deve ser obtido de forma explícita (checkbox opt-in, nunca pré-marcado) antes do primeiro upload de currículo ou coleta de dados pessoais
- O consentimento é registrado no banco com timestamp e versão da política de privacidade aceita
- Sem consentimento registrado, o sistema não processa dados pessoais — bloquear no service, não apenas na UI

```typescript
// em CandidaturaService.create()
const consent = await consentRepository.getActive(userId)
if (!consent) {
  throw new Error('consent_required')
}
```

## Armazenamento de currículos

- PDFs armazenados no Supabase Storage com Row Level Security (RLS): cada usuário acessa apenas seus próprios arquivos
- Nome do arquivo no Storage: `{userId}/{randomUUID}.pdf` — nunca o nome original do arquivo
- Retenção: definir política de expiração (ex: 90 dias após exclusão da candidatura)
- Criptografia em repouso garantida pelo Supabase

## Exclusão de dados

A exclusão de conta ou candidatura deve remover **todos** os dados do usuário:

```typescript
// Ordem obrigatória ao excluir candidatura
async function deleteCandidatura(id: string, userId: string) {
  // 1. Remover arquivo PDF do Storage
  await storageService.deleteCurriculo(userId, candidatura.curriculoPath)
  // 2. Remover conteúdo gerado (tópicos, FAQ, simulado)
  await topicosRepository.deleteByCandidatura(id)
  // 3. Remover a candidatura
  await candidaturaRepository.delete(id)
}

// Ao excluir conta: encadear exclusão de todas as candidaturas primeiro
```

Nunca fazer soft-delete de dados pessoais — hard delete com verificação de completude.

## Isolamento entre usuários

- Toda query ao banco deve incluir `WHERE user_id = $userId` — nunca confiar apenas no ID da candidatura
- RLS no Supabase como segunda camada de defesa
- Nunca retornar dados de outro usuário mesmo que o ID seja válido

```typescript
// ERRADO — vulnerável a IDOR
const candidatura = await db.candidatura.findUnique({ where: { id } })

// CORRETO
const candidatura = await db.candidatura.findUnique({
  where: { id, userId } // userId vem da sessão autenticada
})
if (!candidatura) throw new NotFoundError()
```

## Upload de PDF

- Validar tipo MIME antes de processar (`application/pdf` apenas)
- Validar tamanho máximo (ex: 10 MB)
- Escanear contra conteúdo malicioso antes de salvar no Storage
- Nunca executar o PDF — apenas extrair texto

## Variáveis de ambiente

Chaves de API (Supabase, Anthropic, Firecrawl) nunca no código-fonte. Sempre via variáveis de ambiente. O arquivo `.env` nunca é commitado — apenas `.env.example` com as chaves sem valores.
