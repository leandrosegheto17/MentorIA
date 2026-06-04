import type { GenerationSources } from './system'

export function buildVagaPrompt(sources: GenerationSources): string {
  const temPerfil = !!sources.curriculoTexto

  return `Gere o tópico **"Conhecer a Vaga"** para a preparação da entrevista para ${sources.cargo}.

## Estrutura obrigatória (use markdown com títulos e listas):

### 1. Responsabilidades Principais
O que o profissional fará no dia a dia.

### 2. Requisitos Técnicos
Competências técnicas exigidas ou desejadas.

### 3. Requisitos Comportamentais
Perfil comportamental e soft skills valorizados.

${temPerfil ? `### 4. Análise de Aderência do Candidato
Com base no perfil fornecido, analise:

**Pontos fortes do candidato para esta vaga:**
Liste as experiências e competências do candidato que se alinham com os requisitos.

**Lacunas a preparar:**
Identifique os requisitos da vaga que não estão claramente evidenciados no perfil e sugira como abordar cada um.` : ''}

Use somente as informações das fontes. Inclua ⚠️ onde os dados forem insuficientes.`
}
