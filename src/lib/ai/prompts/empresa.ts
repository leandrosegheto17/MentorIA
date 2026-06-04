import type { GenerationSources } from './system'

export function buildEmpresaPrompt(sources: GenerationSources): string {
  return `Gere o tópico **"Conhecer a Empresa"** para a preparação da entrevista.

## Estrutura obrigatória (use markdown com títulos e listas):

### 1. Sobre a Empresa
Resumo do negócio, setor de atuação, porte e posicionamento no mercado.

### 2. Missão, Valores e Cultura
O que a empresa defende, como é o ambiente de trabalho, o que valoriza nas pessoas.

### 3. Produtos e Serviços
Principais ofertas e diferenciais.

### 4. Contexto de Mercado
Tendências do setor, concorrentes relevantes, momento atual da empresa.

### 5. O que Costuma Aparecer nas Entrevistas
Com base na cultura e nos valores identificados, quais temas a empresa provavelmente abordará.

Use somente as informações das fontes. Inclua ⚠️ nos pontos onde os dados forem insuficientes.`
}
