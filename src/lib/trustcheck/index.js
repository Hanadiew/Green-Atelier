// Green Atelier TrustCheck™ — public module surface.

import { supabase } from '../../lib/supabase.js'
import { uploadAuthenticityDoc } from '../listings.js'
import { assessEvidence, CHECKLIST_ITEMS, EVIDENCE_WEIGHTS, MAX_SCORE, STATUS, STATUS_BLURBS, STATUS_LABELS, DISCLAIMER } from './scoring.js'
import { extractTextFromFiles, matchesOrigin, summariseText, terminateOcr } from './ocr.js'
import { findReference, findReferenceBySlug, matchBrand, modelsForBrand, SUPPORTED_BRANDS } from './reference/index.js'

export {
  // reference database
  SUPPORTED_BRANDS,
  modelsForBrand,
  findReference,
  findReferenceBySlug,
  matchBrand,
  // scoring
  assessEvidence,
  EVIDENCE_WEIGHTS,
  MAX_SCORE,
  STATUS,
  STATUS_LABELS,
  STATUS_BLURBS,
  CHECKLIST_ITEMS,
  DISCLAIMER,
  // ocr
  extractTextFromFiles,
  matchesOrigin,
  summariseText,
  terminateOcr,
}

const OCR_ENGINE = 'tesseract.js'

/**
 * Runs an assessment in the browser, before the listing exists.
 *
 * @param {Object}   input
 * @param {Object}   input.reference    matched reference model
 * @param {File[]}   input.listingImages the listing photos (front, back, interior)
 * @param {File|null} input.receipt
 * @param {File|null} input.serialImage
 * @param {File|null} input.certificate
 * @param {Function} [input.onProgress] status text callback for the UI
 */
export async function runAssessment({
  reference,
  listingImages = [],
  receipt = null,
  serialImage = null,
  certificate = null,
  serialNumber = '',
  onProgress = null,
}) {
  if (!reference) throw new Error('TrustCheck is not available for this brand and model.')

  const documents = [receipt, serialImage, certificate].filter(Boolean)

  onProgress?.(documents.length ? 'Reading uploaded documents…' : 'Checking uploaded evidence…')
  const ocrText = documents.length ? await extractTextFromFiles(documents, onProgress) : ''

  const origin = matchesOrigin(ocrText, reference)

  const flags = {
    has_front: Boolean(listingImages[0]),
    has_back: Boolean(listingImages[1]),
    has_interior: Boolean(listingImages[2]),
    has_receipt: Boolean(receipt),
    // A typed serial counts the same as a photo of one. serialImage stays
    // supported so assessments stored before the slot was removed still score.
    has_serial: Boolean(serialImage) || Boolean(serialNumber?.trim()),
    has_certificate: Boolean(certificate),
    ocr_origin_match: origin.matched,
  }

  onProgress?.('Comparing against reference details…')
  const result = assessEvidence(flags, reference)

  return {
    ...result,
    flags,
    reference,
    ocrText,
    ocrEngine: OCR_ENGINE,
    ocrSummary: summariseText(ocrText, reference),
    originPhrase: origin.phrase,
    // Documents were only read, never uploaded yet — the wizard uploads them
    // together with the listing so a cancelled draft leaves nothing behind.
    files: { receipt, serialImage, certificate },
  }
}

/**
 * Persists an assessment once the listing row exists.
 *
 * The score and status columns are recomputed by a database trigger, so what is
 * sent here is only a claim about which evidence exists. Private material — the
 * OCR text and the document paths — goes to listing_verification instead.
 */
/**
 * Stores the seller's evidence against the listing.
 *
 * Split out of saveAssessment, which is only reached when an assessment was
 * actually produced. A seller can attach a receipt to a brand TrustCheck has no
 * reference for, or attach one and never press Run — in both cases the files
 * used to be dropped on the floor while the listing saved as normal, so the
 * moderator opened it to "No receipt, certificate or serial photo was
 * uploaded." Persisting evidence is not conditional on scoring it.
 *
 * Only the columns with a file are written, so a later call cannot blank a path
 * an earlier one stored.
 */
export async function saveVerificationDocs(listingId, files = {}, meta = {}, sellerId) {
  if (!listingId) throw new Error('A listing id is required to store evidence.')

  const { receipt, serialImage, certificate } = files
  if (!receipt && !serialImage && !certificate && !meta.ocrText) return true

  const [receiptPath, serialPath, certificatePath] = await Promise.all([
    receipt ? uploadAuthenticityDoc(receipt, sellerId) : null,
    serialImage ? uploadAuthenticityDoc(serialImage, sellerId) : null,
    certificate ? uploadAuthenticityDoc(certificate, sellerId) : null,
  ])

  const row = { listing_id: listingId }
  if (receiptPath) row.receipt_path = receiptPath
  if (serialPath) row.serial_image_path = serialPath
  if (certificatePath) row.certificate_path = certificatePath
  if (meta.ocrText) row.ocr_text = meta.ocrText
  if (meta.ocrEngine) row.ocr_engine = meta.ocrEngine

  const { error } = await supabase
    .from('listing_verification')
    .upsert(row, { onConflict: 'listing_id' })

  if (error) {
    console.error('Could not store authenticity documents:', error.message)
    return false
  }
  return true
}

export async function saveAssessment(listingId, assessment, sellerId) {
  if (!listingId) throw new Error('A listing id is required to save an assessment.')

  // The documents travel with the assessment when there is one; storing them is
  // the same operation either way.
  await saveVerificationDocs(
    listingId,
    assessment.files ?? {},
    { ocrText: assessment.ocrText, ocrEngine: assessment.ocrEngine },
    sellerId,
  )

  const { data, error } = await supabase
    .from('trustcheck_assessments')
    .upsert(
      {
        listing_id: listingId,
        reference_slug: assessment.reference.slug,
        brand: assessment.reference.brand,
        model: assessment.reference.model,
        reference_country: assessment.reference.country,
        ...assessment.flags,
        ocr_engine: assessment.ocrEngine,
        assessed_at: new Date().toISOString(),
      },
      { onConflict: 'listing_id' },
    )
    .select('evidence_score, status')
    .single()

  if (error) throw error
  return data
}

/** Reads a listing's assessment for the buyer-facing card. Null when none. */
export async function fetchAssessment(listingId) {
  const { data, error } = await supabase
    .from('trustcheck_assessments')
    .select('*')
    .eq('listing_id', listingId)
    .maybeSingle()

  if (error) {
    console.error('Could not load TrustCheck assessment:', error.message)
    return null
  }
  if (!data) return null

  const reference = findReferenceBySlug(data.reference_slug)

  // Rebuilt from the stored flags rather than the stored score, so the
  // checklist and the headline number can never disagree.
  const result = assessEvidence(data, reference)

  return {
    ...result,
    // The database score is authoritative; assessEvidence should agree.
    score: data.evidence_score,
    status: data.status,
    statusLabel: STATUS_LABELS[data.status],
    statusBlurb: STATUS_BLURBS[data.status],
    brand: data.brand,
    model: data.model,
    country: data.reference_country,
    assessedAt: data.assessed_at,
  }
}
