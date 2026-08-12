// Green Atelier TrustCheck™ — verification suite
//
// Checks the things that are easy to get subtly wrong and hard to notice by
// eye: JS/SQL scoring parity across every evidence combination, the status
// thresholds, OCR origin matching, and that no "authentic/fake/counterfeit"
// vocabulary leaked into the schema or UI copy.
//
// Run: node scripts/verify.mjs  (from anywhere; paths resolve off this file)

import {
  EVIDENCE_WEIGHTS,
  MAX_SCORE,
  STATUS,
  statusForScore,
  assessEvidence,
  hasRequiredEvidence,
} from '../src/lib/trustcheck/scoring.js'
import { matchesOrigin } from '../src/lib/trustcheck/ocr.js'
import { REFERENCE_MODELS, findReference, matchBrand } from '../src/lib/trustcheck/reference/index.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Resolved from this file rather than the working directory, so the suite runs
// the same from the repo root as from inside scripts/.
const repoRoot = fileURLToPath(new URL('..', import.meta.url))

let failures = 0
let checks = 0

function check(label, condition) {
  checks++
  if (!condition) {
    failures++
    console.error(`✗ ${label}`)
  } else {
    console.log(`✓ ${label}`)
  }
}

// -----------------------------------------------------------------------
// 1. Weights sum to 100, and match the SQL function's constants exactly.
// -----------------------------------------------------------------------
console.log('\n--- Weights ---')
check('MAX_SCORE is 100', MAX_SCORE === 100)

const sqlPath = path.join(repoRoot, 'supabase/migrations/20260730090800_trustcheck.sql')
const sql = fs.readFileSync(sqlPath, 'utf8')

// Pull the SQL scoring function body and extract "when p_has_x then N" pairs.
const sqlFnMatch = sql.match(/create or replace function public\.trustcheck_score\([\s\S]*?\$\$;/)
check('trustcheck_score() found in migration', Boolean(sqlFnMatch))
const sqlFnBody = sqlFnMatch ? sqlFnMatch[0] : ''

const sqlParamToJsKey = {
  p_has_front: 'has_front',
  p_has_back: 'has_back',
  p_has_interior: 'has_interior',
  p_has_receipt: 'has_receipt',
  p_has_serial: 'has_serial',
  p_ocr_origin_match: 'ocr_origin_match',
  p_has_certificate: 'has_certificate',
}

for (const [sqlParam, jsKey] of Object.entries(sqlParamToJsKey)) {
  const re = new RegExp(`when\\s+${sqlParam}\\s+then\\s+(\\d+)`, 'i')
  const m = sqlFnBody.match(re)
  const sqlWeight = m ? Number(m[1]) : null
  check(`${jsKey}: JS weight (${EVIDENCE_WEIGHTS[jsKey]}) matches SQL (${sqlWeight})`, sqlWeight === EVIDENCE_WEIGHTS[jsKey])
}

// Status thresholds: JS statusForScore() vs SQL trustcheck_status()
const sqlStatusMatch = sql.match(/create or replace function public\.trustcheck_status[\s\S]*?\$\$;/)
const sqlStatusBody = sqlStatusMatch ? sqlStatusMatch[0] : ''
const sqlLikelyThreshold = Number((sqlStatusBody.match(/p_score\s*>=\s*(\d+)\s*then\s*'likely_consistent'/) || [])[1])
const sqlReviewThreshold = Number((sqlStatusBody.match(/p_score\s*>=\s*(\d+)\s*then\s*'needs_review'/) || [])[1])
check('SQL likely_consistent threshold is 85', sqlLikelyThreshold === 85)
check('SQL needs_review threshold is 60', sqlReviewThreshold === 60)

// -----------------------------------------------------------------------
// 2. JS/SQL parity across all 128 evidence combinations (2^7 flags).
// -----------------------------------------------------------------------
console.log('\n--- Full 128-combination parity (JS statusForScore vs SQL thresholds) ---')
const keys = Object.keys(EVIDENCE_WEIGHTS)
let parityFailures = 0
for (let mask = 0; mask < 1 << keys.length; mask++) {
  const flags = {}
  keys.forEach((k, i) => { flags[k] = Boolean(mask & (1 << i)) })
  const score = keys.reduce((sum, k) => sum + (flags[k] ? EVIDENCE_WEIGHTS[k] : 0), 0)
  const jsStatus = statusForScore(score)
  const sqlStatus = score >= sqlLikelyThreshold ? 'likely_consistent'
    : score >= sqlReviewThreshold ? 'needs_review'
    : 'insufficient_evidence'
  if (jsStatus !== sqlStatus) {
    parityFailures++
    console.error(`  mismatch at mask=${mask} score=${score}: js=${jsStatus} sql=${sqlStatus}`)
  }
}
check('All 128 combinations agree between JS and SQL status logic', parityFailures === 0)

// -----------------------------------------------------------------------
// 3. assessEvidence() sanity: score sums correctly, checklist reflects flags.
// -----------------------------------------------------------------------
console.log('\n--- assessEvidence() ---')
const allTrue = Object.fromEntries(keys.map((k) => [k, true]))
const allFalse = Object.fromEntries(keys.map((k) => [k, false]))
check('All evidence present -> score 100, Likely Consistent', assessEvidence(allTrue).score === 100 && assessEvidence(allTrue).status === STATUS.LIKELY_CONSISTENT)
check('No evidence -> score 0, Insufficient Evidence', assessEvidence(allFalse).score === 0 && assessEvidence(allFalse).status === STATUS.INSUFFICIENT_EVIDENCE)

const photosOnly = { has_front: true, has_back: true, has_interior: true }
const photosOnlyResult = assessEvidence(photosOnly)
check('3 photos only -> score 45', photosOnlyResult.score === 45)
check('3 photos only -> Insufficient Evidence (< 60)', photosOnlyResult.status === STATUS.INSUFFICIENT_EVIDENCE)

const photosPlusReceipt = { ...photosOnly, has_receipt: true }
const pprResult = assessEvidence(photosPlusReceipt)
check('3 photos + receipt -> score 65', pprResult.score === 65)
check('3 photos + receipt -> Needs Review (60-84)', pprResult.status === STATUS.NEEDS_REVIEW)

const strong = { ...photosPlusReceipt, has_serial: true, ocr_origin_match: true }
const strongResult = assessEvidence(strong)
check('photos + receipt + serial + origin match -> score 90', strongResult.score === 90)
check('that combination -> Likely Consistent (>= 85)', strongResult.status === STATUS.LIKELY_CONSISTENT)

check('hasRequiredEvidence() true only when all 3 required photos present', hasRequiredEvidence(photosOnly) === true && hasRequiredEvidence({ has_front: true }) === false)

// -----------------------------------------------------------------------
// 4. Reference database: 6 models, each with the fields the UI depends on.
// -----------------------------------------------------------------------
console.log('\n--- Reference database ---')
check('Exactly 6 reference models', REFERENCE_MODELS.length === 6)
for (const m of REFERENCE_MODELS) {
  check(`${m.brand} ${m.model}: has slug/country/originPhrases/requiredEvidence`,
    Boolean(m.slug && m.country && Array.isArray(m.originPhrases) && m.originPhrases.length > 0 && Array.isArray(m.requiredEvidence)))
}
check('findReference matches case-insensitively', Boolean(findReference('gucci', 'marmont small')))
check('matchBrand recognizes free-text brand input', matchBrand('gucci ') === 'Gucci')
check('matchBrand returns null for unsupported brand', matchBrand('Random Unsupported Brand') === null)

// -----------------------------------------------------------------------
// 5. OCR origin matching: tolerant of noisy text, case, punctuation.
// -----------------------------------------------------------------------
console.log('\n--- OCR origin matching ---')
const gucci = findReference('Gucci', 'Marmont Small')
check('Exact phrase matches', matchesOrigin('This bag is Made in Italy, purchased 2022', gucci).matched)
check('Case-insensitive match', matchesOrigin('MADE IN ITALY', gucci).matched)
check('Tolerant of OCR noise (dashes/extra spaces)', matchesOrigin('Made-in--Italy', gucci).matched)
check('No false positive on unrelated text', !matchesOrigin('Made in France, receipt #4471', gucci).matched)
check('Empty text does not match', !matchesOrigin('', gucci).matched)
check('Null reference does not throw', matchesOrigin('Made in Italy', null).matched === false)

// -----------------------------------------------------------------------
// 6. Forbidden vocabulary: "authentic/fake/counterfeit" must never appear as
//    a verdict about the ITEM. (Note: "Authenticity" as a generic UI/section
//    label, "authentication team/service", and "TrustCheck" itself are fine —
//    what's checked is that no code path labels an item authentic or fake.)
// -----------------------------------------------------------------------
console.log('\n--- Forbidden vocabulary (verdict-on-item wording) ---')
const filesToScan = [
  'src/lib/trustcheck/scoring.js',
  'src/lib/trustcheck/ocr.js',
  'src/lib/trustcheck/index.js',
  'src/components/TrustCheckPanel.vue',
  'src/components/TrustCheckCard.vue',
  'supabase/migrations/20260730090800_trustcheck.sql',
]
// Only these exact banned phrases are checked — narrow enough to avoid
// flagging legitimate uses of "authentication"/"authenticity" as a process.
const bannedPhrases = [
  'is authentic', 'is fake', 'is a fake', 'is counterfeit',
  'genuine item', 'this item is genuine', 'verified authentic', 'confirmed fake',
]
// Checked separately with a word boundary so it doesn't false-positive on the
// files' own "NOT authentication" disclaimer comments.
const notAuthenticRe = /\bnot authentic\b(?!ation)/
for (const rel of filesToScan) {
  const full = path.join(repoRoot, rel)
  if (!fs.existsSync(full)) { check(`${rel} exists`, false); continue }
  const text = fs.readFileSync(full, 'utf8').toLowerCase()
  const hits = bannedPhrases.filter((p) => text.includes(p))
  if (notAuthenticRe.test(text)) hits.push('not authentic')
  check(`${rel}: no verdict-on-item phrases (${hits.length ? hits.join(', ') : 'clean'})`, hits.length === 0)
}

// -----------------------------------------------------------------------
console.log(`\n${checks - failures}/${checks} checks passed.`)
if (failures > 0) {
  console.error(`\n${failures} FAILURE(S).`)
  process.exit(1)
} else {
  console.log('\nAll checks passed.')
}
