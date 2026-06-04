import { config } from "dotenv";
// .env.local tem precedência sobre .env (padrão Next.js)
config({ path: ".env.local" });
config({ path: ".env" });
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL = conexão direta (port 5432) — usada para migrations
    // DATABASE_URL = pooler (port 6543) — usado pelo PrismaClient na app
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
