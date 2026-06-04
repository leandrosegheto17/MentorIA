# PRD — MentorIA

> Assistente de preparação para processos seletivos

---

## 1. Visão do Produto

O MentorIA centraliza e acelera a preparação que hoje o candidato faz manualmente e de forma dispersa — pesquisar a empresa, reler a vaga, tentar adivinhar perguntas. O diferencial está em cruzar o perfil individual do candidato (currículo/LinkedIn) com a vaga específica, gerando preparação personalizada em vez de genérica.

**Proposta de valor:** o candidato cadastra uma candidatura (empresa, cargo, link da vaga e, opcionalmente, currículo em PDF e LinkedIn) e recebe em minutos: contexto da empresa, análise da vaga com aderência de perfil, perguntas e respostas personalizadas, FAQ navegável e simulado de entrevista com feedback.

---

## 2. Personas

| Perfil | Necessidade principal | Tom esperado |
|---|---|---|
| **Júnior / Primeiro emprego** | Orientação básica, ganho de confiança, entender o que a empresa espera | Acolhedor, didático, exemplos concretos |
| **Pleno / em recolocação** | Eficiência, verificar aderência ao cargo, preparar narrativa de carreira | Direto, prático, destaque de lacunas |
| **Sênior** | Profundidade, alinhamento cultural, antecipar perguntas estratégicas | Conciso, analítico, foco em diferenciais |

---

## 3. Fluxo Principal

```
Cadastra candidatura
       ↓
Informa dados (empresa, cargo, link da vaga, PDF, LinkedIn)
       ↓
Sistema coleta e processa fontes  ←— processamento assíncrono
       ↓
Gera os 3 tópicos + FAQ
       ↓
Candidato consome o material e faz o simulado
       ↓
Revisa desempenho → ajusta preparação
```

O candidato gerencia **múltiplas candidaturas em paralelo**, cada uma com seu próprio ciclo de preparação.

---

## 4. Requisitos Funcionais

### 4.1 Cadastro de Candidatura

- Criar, editar, listar e excluir candidaturas
- **Obrigatórios:** nome da empresa, nome do cargo
- **Opcionais:** link da vaga, upload de currículo PDF, link do LinkedIn
- Validar formato e acessibilidade de URLs; validar formato e tamanho do PDF
- Exibir status de processamento em tempo real (aguardando → processando → concluído / erro)

### 4.2 Coleta e Processamento de Dados

- Extrair conteúdo textual da descrição da vaga a partir da URL
- Extrair texto estruturado do currículo PDF (experiências, formação, habilidades, palavras-chave)
- Coletar informações públicas da empresa (área, porte, cultura, notícias recentes)
- Consolidar perfil do candidato a partir do currículo e/ou LinkedIn quando disponíveis
- Tratar links de vagas que exigem login ou bloqueiam acesso automatizado (fallback: entrada manual)
- LinkedIn: solicitar exportação/colagem manual pelo candidato (respeita ToS + reforça titularidade do dado)

### 4.3 Geração dos 3 Tópicos

| Tópico | Conteúdo |
|---|---|
| **Conhecer a empresa** | Resumo do negócio, valores/cultura, produtos, contexto de mercado, pontos que costumam aparecer em entrevistas |
| **Conhecer a vaga** | Responsabilidades, requisitos técnicos e comportamentais; quando houver currículo: análise de aderência com pontos fortes e lacunas a preparar |
| **Perguntas & Respostas** | Perguntas prováveis (técnicas, comportamentais, situacionais) com orientações de resposta personalizadas ao perfil |

Toda afirmação sobre empresa/vaga deve ser ancorada em fonte coletada. Quando não houver dado suficiente, exibir aviso explícito em vez de preencher com suposição.

### 4.4 FAQ

- Conjunto de perguntas frequentes do processo seletivo com respostas sugeridas
- Navegável e filtrável por categoria: empresa, vaga, comportamental
- Gerado automaticamente com base nos dados coletados

### 4.5 Simulado de Entrevista

- Apresentar perguntas de forma interativa (uma por vez)
- Coletar respostas do candidato em texto (áudio na Fase 3)
- Devolver feedback estruturado por resposta: clareza, aderência à vaga, sugestões de melhoria
- Registrar histórico de tentativas para acompanhar evolução

### 4.6 Gestão e Saída

- Salvar todo o material gerado por candidatura para consulta posterior
- Reprocessar/atualizar quando o candidato editar dados ou a vaga mudar
- Exportar preparação em PDF para estudo offline

---

## 5. Requisitos Não Funcionais

| Requisito | Detalhamento |
|---|---|
| **Privacidade / LGPD** | Base legal de consentimento explícito, política de privacidade, finalidade declarada, mecanismo de exclusão de dados. Currículos armazenados com criptografia e retenção limitada. |
| **Segurança** | Criptografia em trânsito (TLS) e em repouso; controle de acesso por usuário; RLS no banco; validação de PDF contra arquivos maliciosos. |
| **Confiabilidade da IA** | Afirmações ancoradas em fontes reais; aviso explícito quando dado insuficiente; proibido preencher lacunas com suposições. |
| **Desempenho** | Coleta e geração processadas de forma assíncrona; feedback de progresso na UI; SLA: material disponível em até 3 minutos após envio. |
| **Usabilidade** | Interface simples para candidatos sob estresse; suporte a português; boas práticas de acessibilidade (WCAG 2.1 AA). |
| **Escalabilidade / Custo** | Cache de resultados por candidatura; controle de custo por usuário; arquitetura de fila para absorver picos. |
| **Disponibilidade** | Target uptime 99,5%; logs e monitoramento; tratamento gracioso de falhas externas (vaga fora do ar, scraping bloqueado). |

---

## 6. Fases de Desenvolvimento

### Fase 1 — MVP

**Objetivo:** validar o núcleo do produto com usuários reais.

- [ ] Autenticação de usuário (Supabase Auth — email/senha + Google OAuth)
- [ ] CRUD de candidaturas com todos os campos
- [ ] Scraping do conteúdo da vaga via URL
- [ ] Upload e parsing de currículo PDF
- [ ] Coleta de informações públicas da empresa
- [ ] Geração dos 3 tópicos (empresa, vaga, perguntas & respostas)
- [ ] Geração do FAQ navegável
- [ ] UI básica com indicador de progresso assíncrono
- [ ] Política de privacidade e consentimento (LGPD)

**Critério de saída:** candidato consegue cadastrar uma vaga real e consumir os 3 tópicos + FAQ em menos de 5 minutos.

---

### Fase 2 — Simulado & Refinamento

**Objetivo:** completar o ciclo de preparação e melhorar qualidade.

- [ ] Simulador de entrevista interativo (texto)
- [ ] Feedback estruturado por resposta (clareza, aderência, sugestões)
- [ ] Histórico de tentativas e evolução no simulado
- [ ] Re-processamento quando candidato edita dados
- [ ] Exportação do material em PDF
- [ ] Importação manual do perfil LinkedIn (paste/exportação)
- [ ] Tratamento de vagas com login exigido (fallback manual)
- [ ] Observabilidade: Sentry + logs estruturados

**Critério de saída:** candidato completa um ciclo completo (cadastro → estudo → simulado → revisão) sem erros críticos.

---

### Fase 3 — Escala & Premium

**Objetivo:** monetizar e preparar para crescimento.

- [ ] Respostas em áudio no simulado (speech-to-text)
- [ ] Dashboard multi-candidatura com progresso consolidado
- [ ] Planos de uso com limites (freemium / assinatura)
- [ ] Controle de custo de IA por usuário/plano
- [ ] Notificações de atualização da vaga
- [ ] Métricas de evolução do candidato
- [ ] Modelo de monetização (Stripe ou similar)

---

## 7. Stack Técnica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Full-stack** | Next.js 15 (App Router, TypeScript) | SSR, RSC, API routes co-locadas, deploy simples |
| **UI** | Tailwind CSS + shadcn/ui | Acessível, customizável, sem lock-in |
| **Estado servidor** | TanStack Query | Cache, sync, loading/error states |
| **Estado cliente** | Zustand | Simples, sem boilerplate |
| **Banco de dados** | Supabase (PostgreSQL) | Auth + DB + Storage + RLS em um só serviço |
| **ORM** | Prisma | Type-safe, migrations, excelente DX |
| **IA** | Claude API (Anthropic) + prompt caching | LLM principal; caching reduz custo em chamadas repetidas |
| **Scraping** | Firecrawl (fallback: Jina AI Reader) | Output LLM-friendly, lida com páginas JS-rendered |
| **PDF** | pdf-parse + Zod para estruturação | Extração de texto + validação tipada |
| **Fila assíncrona** | BullMQ + Upstash Redis | Jobs pesados sem bloquear a UI; serverless-friendly |
| **Storage** | Supabase Storage + RLS | Isolamento por usuário, conformidade LGPD |
| **Deploy** | Vercel | Integração nativa Next.js, edge functions, preview deploys |
| **Monitoramento** | Sentry + Vercel Analytics | Erros, performance e usage |
| **Validação** | Zod | Schema validation end-to-end (API ↔ DB ↔ UI) |

---

## 8. Configuração Claude Code

### 8.1 Agents (`.claude/agents/`)

Agents são sub-agentes especializados que Claude Code pode invocar para tarefas de desenvolvimento específicas do domínio.

| Arquivo | Responsabilidade |
|---|---|
| `data-collector.md` | Implementar e depurar scrapers de vagas e informações de empresas; lidar com bloqueios e fallbacks |
| `cv-parser.md` | Extração e estruturação de currículos PDF e perfis LinkedIn; mapeamento para schema Zod |
| `content-generator.md` | Prompts e lógica de geração dos 3 tópicos, FAQ e perguntas personalizadas via Claude API |
| `interview-simulator.md` | Lógica do simulado interativo, avaliação de respostas e geração de feedback estruturado |

### 8.2 Rules (`.claude/rules/`)

Rules são aplicadas automaticamente pelo Claude Code em toda interação para garantir consistência.

| Arquivo | O que impõe |
|---|---|
| `folder-structure.md` | Nenhum arquivo criado fora das pastas definidas na Seção 9; mapeamento de tipos de arquivo para diretório correto |
| `api-conventions.md` | Formato padrão de response (`{ data, error, meta }`), status codes, nomenclatura de endpoints REST |
| `ai-grounding.md` | Toda afirmação gerada por IA deve referenciar fonte coletada; proibir suposições sem evidência; usar aviso padrão quando dado insuficiente |
| `lgpd-compliance.md` | Dados pessoais (currículo, e-mail) nunca em logs; consentimento verificado antes de processar; exclusão remove todos os dados do usuário |
| `typescript-standards.md` | `strict: true`, imports absolutos via `@/`, sem `any`, Zod para validação de boundary, convenção de nomenclatura (PascalCase componentes, camelCase funções) |

### 8.3 Skills (`.claude/skills/`)

Skills são comandos slash reutilizáveis para tarefas recorrentes do projeto.

| Arquivo | O que faz |
|---|---|
| `scaffold-feature.md` | Cria boilerplate completo de nova feature: page, componentes, API route, service, repository e types — todos nas pastas corretas |
| `verify-structure.md` | Audita se a estrutura de pastas atual está em conformidade com a rule `folder-structure`; lista desvios encontrados |

---

## 9. Estrutura de Pastas

A estrutura abaixo é **normativa** — a rule `folder-structure` impede criação de arquivos fora dessas localizações.

```
mentoria/
├── .claude/
│   ├── agents/
│   │   ├── data-collector.md
│   │   ├── cv-parser.md
│   │   ├── content-generator.md
│   │   └── interview-simulator.md
│   ├── rules/
│   │   ├── folder-structure.md       ← aplicada sempre
│   │   ├── api-conventions.md
│   │   ├── ai-grounding.md
│   │   ├── lgpd-compliance.md
│   │   └── typescript-standards.md
│   └── skills/
│       ├── scaffold-feature.md
│       └── verify-structure.md
│
├── src/
│   ├── app/                              # Next.js App Router (páginas e API)
│   │   ├── (auth)/                       # Rotas públicas
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/                  # Rotas protegidas (requer auth)
│   │   │   ├── layout.tsx
│   │   │   └── candidaturas/
│   │   │       ├── page.tsx              # Lista de candidaturas
│   │   │       └── [id]/
│   │   │           ├── empresa/          # Tópico: Conhecer a empresa
│   │   │           ├── vaga/             # Tópico: Conhecer a vaga
│   │   │           ├── perguntas/        # Tópico: Perguntas & Respostas
│   │   │           ├── faq/              # FAQ navegável
│   │   │           └── simulado/         # Simulador de entrevista
│   │   └── api/                          # Route Handlers (backend)
│   │       ├── candidaturas/
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── processing/               # Jobs de coleta e geração
│   │       │   └── route.ts
│   │       └── webhooks/                 # Callbacks de serviços externos
│   │
│   ├── components/
│   │   ├── ui/                           # Primitivos shadcn/ui (não editar)
│   │   ├── candidatura/                  # Componentes da feature candidatura
│   │   ├── simulado/                     # Componentes do simulador
│   │   └── shared/                       # Componentes reutilizáveis entre features
│   │
│   ├── lib/
│   │   ├── ai/                           # Integração Claude API
│   │   │   ├── agents/                   # Implementações dos 4 agents
│   │   │   └── prompts/                  # Templates de prompt por tópico
│   │   ├── scraping/                     # Firecrawl + fallbacks
│   │   ├── pdf/                          # pdf-parse + estruturação Zod
│   │   ├── storage/                      # Supabase Storage (upload/download)
│   │   └── queue/                        # BullMQ job definitions
│   │
│   ├── server/
│   │   ├── services/                     # Lógica de negócio (orquestra lib/)
│   │   ├── repositories/                 # Acesso ao banco via Prisma
│   │   └── validators/                   # Schemas Zod de entrada/saída da API
│   │
│   ├── hooks/                            # React hooks (useQuery wrappers, etc.)
│   ├── stores/                           # Zustand stores (estado cliente)
│   ├── types/                            # Interfaces e tipos TypeScript globais
│   └── utils/                            # Funções puras sem efeitos colaterais
│
├── prisma/
│   └── schema.prisma                     # Schema do banco de dados
│
├── tests/
│   ├── unit/                             # Testes de funções isoladas
│   ├── integration/                      # Testes de API + banco
│   └── e2e/                              # Testes end-to-end (Playwright)
│
├── public/                               # Assets estáticos
├── .env.example                          # Variáveis de ambiente (sem valores reais)
├── CLAUDE.md                             # Contexto do projeto para Claude Code
├── Requisitos.txt                        # Documento de requisitos original
└── PRD.md                                # Este arquivo
```

### Regra de mapeamento de tipos de arquivo

| Tipo de arquivo | Pasta correta |
|---|---|
| Página Next.js | `src/app/(dashboard)/[feature]/` |
| API Route Handler | `src/app/api/[recurso]/` |
| Componente React de feature | `src/components/[feature]/` |
| Componente reutilizável | `src/components/shared/` |
| Lógica de negócio | `src/server/services/` |
| Acesso ao banco | `src/server/repositories/` |
| Integração Claude API | `src/lib/ai/` |
| Integração de scraping | `src/lib/scraping/` |
| Tipo/Interface global | `src/types/` |
| Função utilitária pura | `src/utils/` |
| Hook React | `src/hooks/` |

---

## 10. Verificação

Após cada fase de desenvolvimento, validar:

| Critério | Como verificar |
|---|---|
| Cobertura dos requisitos | Cada item da Seção 4 tem implementação rastreável |
| Conformidade de pastas | Rodar skill `/verify-structure` |
| Grounding de IA | Toda resposta gerada inclui referência à fonte ou aviso de dado insuficiente |
| LGPD | Exclusão de conta remove currículo e todos os dados pessoais do banco e storage |
| Performance | Material disponível em ≤ 3 min após envio da candidatura |
| Acessibilidade | Lighthouse accessibility score ≥ 90 |
| Segurança | RLS no Supabase impede acesso cross-user; PDF validado antes de processar |
