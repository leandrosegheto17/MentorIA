import type { GenerationSources } from './system'

export function buildPerguntasPrompt(sources: GenerationSources): string {
  const temPerfil = !!(sources.curriculoTexto || sources.linkedinText)

  return `Gere o tópico **"Perguntas & Respostas"** para a preparação da entrevista de ${sources.cargo}.

## Estrutura obrigatória (use markdown):

### Perguntas Técnicas (5 a 7 perguntas)
Para cada pergunta:
- **Pergunta:** [texto da pergunta]
- **Como responder:** [orientação específica${temPerfil ? ', personalizada ao perfil do candidato' : ''}]

### Perguntas Comportamentais (5 a 7 perguntas)
Baseadas no método STAR (Situação, Tarefa, Ação, Resultado).
Para cada pergunta:
- **Pergunta:** [texto da pergunta]
- **Estrutura STAR sugerida:** [o que incluir em cada etapa${temPerfil ? ', com base nas experiências do candidato' : ''}]

### Perguntas Situacionais (3 a 5 perguntas)
Para cada pergunta:
- **Pergunta:** [texto da pergunta]
- **Framework de resposta:** [como estruturar a resposta]

As perguntas devem ser baseadas nos requisitos da vaga e na cultura da empresa identificados nas fontes.
${temPerfil ? 'As orientações de resposta devem ser personalizadas ao perfil do candidato.' : ''}
Inclua ⚠️ onde os dados forem insuficientes para personalizar.`
}
