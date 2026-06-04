import { config } from 'dotenv'
config({ path: '.env.local' })

import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const result = await pool.query(
  `UPDATE "Candidatura" SET status = 'PENDING' WHERE status = 'PROCESSING' RETURNING id, empresa, cargo`
)

if (result.rowCount) {
  console.log(`✓ ${result.rowCount} candidatura(s) resetada(s) para PENDING:`)
  result.rows.forEach(r => console.log(`  · ${r.empresa} / ${r.cargo} (${r.id})`))
} else {
  console.log('Nenhuma candidatura presa em PROCESSING.')
}

await pool.end()
