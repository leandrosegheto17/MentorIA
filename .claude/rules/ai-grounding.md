# Rule: Grounding de IA

O MentorIA afirma fatos sobre empresas e vagas reais. Informações inventadas ou alucinadas destroem a confiança do candidato e podem causar dano concreto (preparação errada para uma entrevista real). Esta rule define como garantir que todo conteúdo gerado seja ancorado em evidências.

## Princípio fundamental

**Nenhuma afirmação sobre empresa, vaga ou mercado pode ser feita sem uma fonte coletada que a sustente.**

Se o dado não foi coletado, diga que não foi coletado — nunca invente.

## Estrutura obrigatória de todo prompt de geração

Todo prompt enviado à Claude API para gerar conteúdo de preparação deve incluir:

1. **Seção de fontes** com o conteúdo bruto coletado (texto da vaga, dados da empresa, currículo parseado)
2. **Instrução de grounding** explícita
3. **Instrução de aviso** para quando o dado for insuficiente

```typescript
const systemPrompt = `
Você é um assistente de preparação para processos seletivos.

REGRA CRÍTICA: Baseie TODA afirmação exclusivamente nas fontes fornecidas abaixo.
Nunca invente informações sobre a empresa, a vaga ou o candidato.
Se uma informação não estiver nas fontes, diga explicitamente que não há dados suficientes
em vez de preencher a lacuna com suposições.

FONTES DISPONÍVEIS:
${sources}
`
```

## Aviso padrão de dado insuficiente

Quando uma fonte não foi coletada ou está vazia, a geração deve incluir o aviso abaixo no conteúdo retornado:

```
⚠️ Dado insuficiente: não foi possível coletar [tipo de informação] para esta candidatura.
As orientações abaixo são baseadas apenas nas informações disponíveis.
```

Nunca omitir o aviso silenciosamente. O candidato precisa saber que a preparação pode estar incompleta.

## Referência de fontes no conteúdo gerado

Quando possível, o conteúdo gerado deve indicar a origem da informação:

```
"A empresa atua no setor de logística [fonte: site institucional coletado em {data}]."
"A vaga exige experiência com React [fonte: descrição da vaga]."
```

## Casos especiais

### Link da vaga inacessível
Se o scraping da vaga falhar (login exigido, bloqueio, timeout):
- Não gerar o tópico "Conhecer a vaga" com dados inventados
- Exibir na UI um estado de erro com instrução para o candidato colar o texto da vaga manualmente
- Processar novamente quando o texto for fornecido

### Empresa sem informações públicas suficientes
Se a coleta de dados da empresa retornar pouco conteúdo (< 500 tokens úteis):
- Gerar o tópico com o que foi coletado
- Incluir o aviso de dado insuficiente
- Sugerir ao candidato fontes adicionais que ele pode consultar (ex: LinkedIn da empresa, Glassdoor)

### LinkedIn não disponível
O LinkedIn do candidato é coletado via colagem manual (não scraping automático). Se não foi fornecido:
- Gerar a análise de aderência apenas com o currículo PDF
- Indicar no conteúdo que o perfil LinkedIn não foi incluído na análise

## Proibições explícitas

- **Nunca** usar dados de treinamento do modelo para afirmar fatos sobre uma empresa específica sem confirmar nas fontes coletadas
- **Nunca** preencher campos obrigatórios do output com dados genéricos para "completar" o formato
- **Nunca** gerar perguntas prováveis de entrevista sem âncora na descrição da vaga ou no perfil do candidato
- **Nunca** omitir o aviso de dado insuficiente para "não preocupar" o candidato — a transparência é a proposta de valor

## Implementação

As funções em `src/lib/ai/agents/` devem sempre:
1. Receber as fontes coletadas como parâmetro explícito
2. Verificar se as fontes têm conteúdo suficiente antes de chamar a API
3. Incluir a instrução de grounding no system prompt
4. Retornar metadados sobre quais fontes foram usadas junto com o conteúdo gerado
