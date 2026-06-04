const MIN_TEXT_LENGTH = 300

export async function extractPdfText(buffer: Buffer): Promise<string> {
  // Importação dinâmica com .default garante compatibilidade com mock em testes
  const { default: pdfParse } = await import('pdf-parse')
  const data = await pdfParse(buffer)

  const text = (data.text as string).trim()
  if (text.length < MIN_TEXT_LENGTH) {
    throw new Error('pdf_insufficient_text')
  }

  return text
}
