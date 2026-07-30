// Green Atelier TrustCheck™ — text extraction.
//
// Runs Tesseract.js entirely in the browser. OCR is used ONLY to read text off
// an uploaded document. It makes no judgement about whether that document is
// genuine — a convincing forgery and a real receipt read identically here.
//
// Notes:
// - The worker and English language data are fetched on first use (a few MB)
//   and then cached by the browser, so the first analysis is the slow one.
// - PDFs cannot be read in the browser. A PDF still counts as uploaded
//   evidence; it just contributes no OCR text.

const OCR_LANGUAGE = 'eng'

let workerPromise = null

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import('tesseract.js')
      return createWorker(OCR_LANGUAGE)
    })()
  }
  try {
    return await workerPromise
  } catch (error) {
    // Let a later attempt retry rather than caching the failure forever.
    workerPromise = null
    throw error
  }
}

export function isOcrReadable(file) {
  return Boolean(file) && file.type.startsWith('image/')
}

/**
 * Reads text from one image file.
 * Returns '' rather than throwing, so a failed read degrades the score by
 * 10 points instead of breaking the seller's listing flow.
 */
export async function extractText(file, onProgress) {
  if (!isOcrReadable(file)) return ''
  try {
    const worker = await getWorker()
    if (onProgress) onProgress(`Reading ${file.name}…`)
    const { data } = await worker.recognize(file)
    return data?.text ?? ''
  } catch (error) {
    console.warn(`OCR failed for ${file.name}:`, error.message)
    return ''
  }
}

/** Reads several files and returns their combined text. */
export async function extractTextFromFiles(files, onProgress) {
  const readable = files.filter(isOcrReadable)
  const chunks = []
  for (const file of readable) {
    const text = await extractText(file, onProgress)
    if (text.trim()) chunks.push(`--- ${file.name} ---\n${text.trim()}`)
  }
  return chunks.join('\n\n')
}

/**
 * Looks for any of the reference model's origin phrases in the OCR text.
 *
 * Tolerant of the noise OCR produces on textured leather and thermal receipts:
 * case is ignored and runs of non-letters are treated as single gaps, so
 * "MADE  IN   ITALY" and "Made-in-Italy" both match.
 */
export function matchesOrigin(text, reference) {
  if (!text || !reference?.originPhrases?.length) return { matched: false, phrase: null }

  const haystack = text.toLowerCase().replace(/[^a-z]+/g, ' ')
  for (const phrase of reference.originPhrases) {
    const needle = phrase.toLowerCase().replace(/[^a-z]+/g, ' ').trim()
    if (haystack.includes(needle)) return { matched: true, phrase }
  }
  return { matched: false, phrase: null }
}

/** Pulls a few useful fields out of receipt text, for the seller's own review. */
export function summariseText(text, reference) {
  if (!text) return {}

  const summary = {}

  const origin = matchesOrigin(text, reference)
  if (origin.matched) summary.origin = origin.phrase

  // dd/mm/yyyy, yyyy-mm-dd, and "12 March 2024" style dates
  const date = text.match(
    /\b(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}|\d{4}-\d{2}-\d{2}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})\b/,
  )
  if (date) summary.purchaseDate = date[1]

  if (reference?.brand) {
    const brandNeedle = reference.brand.toLowerCase().replace(/[^a-z]+/g, '')
    const haystack = text.toLowerCase().replace(/[^a-z]+/g, '')
    if (haystack.includes(brandNeedle)) summary.brandMentioned = reference.brand
  }

  // A long alphanumeric run is a plausible serial or date code.
  const serial = text.match(/\b(?=[A-Z0-9-]{6,20}\b)(?=.*\d)[A-Z0-9-]{6,20}\b/)
  if (serial) summary.possibleSerial = serial[0]

  return summary
}

/** Frees the worker. Called when the seller leaves the wizard. */
export async function terminateOcr() {
  if (!workerPromise) return
  try {
    const worker = await workerPromise
    await worker.terminate()
  } catch {
    // Nothing useful to do if teardown fails.
  } finally {
    workerPromise = null
  }
}
