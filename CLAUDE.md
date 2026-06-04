@AGENTS.md

# MentorIA — Contexto do Projeto

## O que é

Assistente de preparação para processos seletivos. O candidato cadastra uma candidatura (empresa, cargo, link da vaga, currículo PDF e LinkedIn) e recebe: contexto da empresa, análise de aderência à vaga, perguntas & respostas personalizadas, FAQ navegável e simulado de entrevista com feedback estruturado.

## Documentação

- [PRD.md](PRD.md) — Requisitos completos, fases de desenvolvimento e decisões técnicas
- [Requisitos.txt](Requisitos.txt) — Documento de requisitos original

## Fase atual

**Fase 1 — MVP.** Escopo: autenticação, CRUD de candidaturas, scraping da vaga, parsing de PDF, coleta de dados da empresa, geração dos 3 tópicos + FAQ. Ver PRD.md Seção 6 para critério de saída.

## Stack

| Camada | Tecnologia |
|---|---|
| Full-stack | Next.js 15, App Router, TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Estado servidor | TanStack Query |
| Estado cliente | Zustand |
| Banco + Auth + Storage | Supabase (PostgreSQL) |
| ORM | Prisma |
| IA | Claude API (Anthropic) com prompt caching |
| Scraping | Firecrawl (fallback: Jina AI Reader) |
| PDF | pdf-parse + Zod |
| Fila assíncrona | BullMQ + Upstash Redis |
| Deploy | Vercel |
| Monitoramento | Sentry + Vercel Analytics |
| Validação | Zod (end-to-end) |

## Rules obrigatórias

Todas as rules em `.claude/rules/` são aplicadas automaticamente em toda interação.

| Rule | Resumo |
|---|---|
| `folder-structure` | **Crítica.** Nenhum arquivo fora das pastas mapeadas. Consultar antes de criar qualquer arquivo. |
| `api-conventions` | Formato padrão de response, status codes, validação Zod obrigatória, autenticação |
| `ai-grounding` | Afirmações de IA ancoradas em fonte real; aviso quando dado insuficiente |
| `lgpd-compliance` | Dados pessoais nunca em logs; consentimento verificado; exclusão remove tudo |
| `typescript-standards` | strict mode, imports `@/`, sem `any`, Zod em boundaries |

## Agents disponíveis

| Agent | Quando usar |
|---|---|
| `data-collector` | Implementar scrapers de vagas e coleta de dados de empresa |
| `cv-parser` | Extração e estruturação de currículos PDF e LinkedIn |
| `content-generator` | Prompts e lógica de geração dos tópicos via Claude API |
| `interview-simulator` | Lógica do simulado e geração de feedback |

## Comandos disponíveis

- `/scaffold-feature [nome]` — cria boilerplate completo de nova feature nas pastas corretas
- `/verify-structure` — audita a estrutura de pastas atual contra a rule `folder-structure`

## Convenções rápidas

- Validação de entrada: sempre Zod em `src/server/validators/`
- Acesso ao banco: somente via `src/server/repositories/` (nunca diretamente nos Route Handlers)
- Lógica de negócio: em `src/server/services/` (orquestra repositories + lib/)
- Dados de usuário nunca logados (ver rule `lgpd-compliance`)
- Toda geração de IA passa por `src/lib/ai/` (nunca chamar Claude API diretamente de componentes ou services)
