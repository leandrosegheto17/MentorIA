const MIN_TEXT_LENGTH = 300

export async function extractPdfText(buffer: Buffer): Promise<string> {
  // require evita problema de bundling com a versão ESM do pdf-parse
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse')
  const data = await pdfParse(buffer)

  const text = (data.text as string).trim()
  if (text.length < MIN_TEXT_LENGTH) {
    throw new Error('pdf_insufficient_text')
  }

  return text
}
