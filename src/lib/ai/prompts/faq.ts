import type { GenerationSources } from './system'

export function buildFaqPrompt(_sources: GenerationSources): string {
  return `Gere um FAQ completo para a preparação da entrevista.

Retorne APENAS um array JSON válido, sem texto adicional antes ou depois, no formato:
[
  {
    "pergunta": "Texto da pergunta frequente",
    "resposta": "Resposta clara e objetiva",
    "categoria": "EMPRESA"
  }
]

As categorias possíveis são: "EMPRESA", "VAGA", "COMPORTAMENTAL"

Gere entre 12 e 15 itens distribuídos entre as 3 categorias.
- EMPRESA (4-5 itens): sobre a empresa, cultura, produtos, mercado
- VAGA (4-5 itens): sobre o cargo, responsabilidades, requisitos
- COMPORTAMENTAL (4-5 itens): perguntas de fit cultural e comportamento

Base-se nas fontes fornecidas. As respostas devem ser práticas e acionáveis.`
}
