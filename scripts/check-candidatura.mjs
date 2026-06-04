import { config } from 'dotenv'
config({ path: '.env.local' })

import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const { rows: candidaturas } = await pool.query(`
  SELECT c.id, c.empresa, c.cargo, c.status,
    c."linkVaga",
    LEFT(c."vagaTexto", 100) as "vagaTexto",
    LEFT(c."empresaTexto", 100) as "empresaTexto",
    LEFT(c."curriculoTexto", 80) as "curriculoTexto",
    (SELECT COUNT(*) FROM "TopicoPreparacao" t WHERE t."candidaturaId" = c.id) as topicos,
    (SELECT COUNT(*) FROM "FaqItem" f WHERE f."candidaturaId" = c.id) as faq
  FROM "Candidatura" c
  ORDER BY c."createdAt" DESC
  LIMIT 5
`)

for (const c of candidaturas) {
  console.log(`\n── ${c.empresa} / ${c.cargo}`)
  console.log(`   Status : ${c.status}`)
  console.log(`   Tópicos: ${c.topicos} | FAQ: ${c.faq} itens`)
  console.log(`   Vaga   : ${c.vagaTexto ?? '(vazio)'}`)
  console.log(`   Empresa: ${c.empresaTexto ?? '(vazio)'}`)
  console.log(`   CV     : ${c.curriculoTexto ?? '(vazio)'}`)
}

await pool.end()
