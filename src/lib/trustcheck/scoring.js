// Green Atelier TrustCheck™ — evidence scoring.
//
// Deliberately rule-based. There is no machine learning, no training, and no
// counterfeit detection anywhere in this module. It measures how COMPLETE and
// INTERNALLY CONSISTENT the seller's uploaded evidence is, and nothing more.
//
// IMPORTANT: these weights are mirrored in the database function
// public.trustcheck_score() so the server can recompute the score instead of
// trusting whatever the browser sends. Change one, change the other.

export const EVIDENCE_WEIGHTS = Object.freeze({
  has_front: 15,
  has_back: 15,
  has_interior: 15,
  has_receipt: 20,
  has_serial: 15,
  ocr_origin_match: 10,
  has_certificate: 10,
})

export const MAX_SCORE = Object.values(EVIDENCE_WEIGHTS).reduce((a, b) => a + b, 0) // 100

export const STATUS = Object.freeze({
  LIKELY_CONSISTENT: 'likely_consistent',
  NEEDS_REVIEW: 'needs_review',
  INSUFFICIENT_EVIDENCE: 'insufficient_evidence',
})

// Wording matters here. Nothing in this system may describe an item as
// authentic, fake or counterfeit — it assesses evidence, not the item.
export const STATUS_LABELS = Object.freeze({
  [STATUS.LIKELY_CONSISTENT]: 'Likely Consistent',
  [STATUS.NEEDS_REVIEW]: 'Needs Review',
  [STATUS.INSUFFICIENT_EVIDENCE]: 'Insufficient Evidence',
})

export const STATUS_BLURBS = Object.freeze({
  [STATUS.LIKELY_CONSISTENT]:
    'The evidence provided is complete and consistent with our reference details for this model.',
  [STATUS.NEEDS_REVIEW]:
    'Some supporting evidence is missing. A specialist should review this listing before purchase.',
  [STATUS.INSUFFICIENT_EVIDENCE]:
    'Too little evidence was provided to assess this listing. Ask the seller for more documentation.',
})

export const DISCLAIMER =
  'This assessment evaluates uploaded evidence only. It is not an official ' +
  'authentication service and does not guarantee authenticity.'

/** Order and labels for the checklist shown to sellers and buyers. */
export const CHECKLIST_ITEMS = Object.freeze([
  { key: 'has_front', label: 'Front Image', required: true },
  { key: 'has_back', label: 'Back Image', required: true },
  { key: 'has_interior', label: 'Interior Image', required: true },
  { key: 'has_receipt', label: 'Receipt / Invoice', required: false },
  { key: 'has_serial', label: 'Serial Number Image', required: false },
  { key: 'ocr_origin_match', label: 'Origin Text Detected', required: false },
  { key: 'has_certificate', label: 'Authentication Certificate', required: false },
])

export function statusForScore(score) {
  if (score >= 85) return STATUS.LIKELY_CONSISTENT
  if (score >= 60) return STATUS.NEEDS_REVIEW
  return STATUS.INSUFFICIENT_EVIDENCE
}

/**
 * Turns a set of evidence flags into a score, a status and a display checklist.
 *
 * @param {Object} flags   boolean per key of EVIDENCE_WEIGHTS
 * @param {Object} [reference] the matched reference model, used for wording
 */
export function assessEvidence(flags, reference = null) {
  const score = Object.entries(EVIDENCE_WEIGHTS).reduce(
    (total, [key, points]) => (flags[key] ? total + points : total),
    0,
  )

  const status = statusForScore(score)

  const checklist = CHECKLIST_ITEMS.map((item) => ({
    key: item.key,
    label:
      item.key === 'ocr_origin_match' && reference
        ? `"Made in ${reference.country}" Detected`
        : item.label,
    points: EVIDENCE_WEIGHTS[item.key],
    required: item.required,
    present: Boolean(flags[item.key]),
  }))

  return {
    score,
    maxScore: MAX_SCORE,
    status,
    statusLabel: STATUS_LABELS[status],
    statusBlurb: STATUS_BLURBS[status],
    checklist,
    disclaimer: DISCLAIMER,
  }
}

/** True when all three required images are present. */
export function hasRequiredEvidence(flags) {
  return CHECKLIST_ITEMS.filter((i) => i.required).every((i) => Boolean(flags[i.key]))
}
