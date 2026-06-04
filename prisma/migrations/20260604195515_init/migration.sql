-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'ERROR');

-- CreateEnum
CREATE TYPE "TopicoTipo" AS ENUM ('EMPRESA', 'VAGA', 'PERGUNTAS');

-- CreateEnum
CREATE TYPE "FaqCategoria" AS ENUM ('EMPRESA', 'VAGA', 'COMPORTAMENTAL');

-- CreateTable
CREATE TABLE "Candidatura" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "linkVaga" TEXT,
    "curriculoPath" TEXT,
    "linkedinText" TEXT,
    "status" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicoPreparacao" (
    "id" TEXT NOT NULL,
    "candidaturaId" TEXT NOT NULL,
    "tipo" "TopicoTipo" NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "fontesUsadas" TEXT[],
    "avisos" TEXT[],
    "geradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicoPreparacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqItem" (
    "id" TEXT NOT NULL,
    "candidaturaId" TEXT NOT NULL,
    "pergunta" TEXT NOT NULL,
    "resposta" TEXT NOT NULL,
    "categoria" "FaqCategoria" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentimentoLGPD" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aceitoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "versaoPrivacidade" TEXT NOT NULL,
    "ipAddress" TEXT,

    CONSTRAINT "ConsentimentoLGPD_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Candidatura_userId_idx" ON "Candidatura"("userId");

-- CreateIndex
CREATE INDEX "TopicoPreparacao_candidaturaId_idx" ON "TopicoPreparacao"("candidaturaId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicoPreparacao_candidaturaId_tipo_key" ON "TopicoPreparacao"("candidaturaId", "tipo");

-- CreateIndex
CREATE INDEX "FaqItem_candidaturaId_idx" ON "FaqItem"("candidaturaId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsentimentoLGPD_userId_key" ON "ConsentimentoLGPD"("userId");

-- AddForeignKey
ALTER TABLE "TopicoPreparacao" ADD CONSTRAINT "TopicoPreparacao_candidaturaId_fkey" FOREIGN KEY ("candidaturaId") REFERENCES "Candidatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaqItem" ADD CONSTRAINT "FaqItem_candidaturaId_fkey" FOREIGN KEY ("candidaturaId") REFERENCES "Candidatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;
