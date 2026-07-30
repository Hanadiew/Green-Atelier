// Green Atelier TrustCheck™ — reference database.
//
// One JSON file per supported brand/model. Used purely for rule-based
// comparison: which evidence is expected, and which origin phrase to look for
// in OCR text. Nothing here detects counterfeits.
//
// To support a new model, drop a JSON file in this folder and add it below.

// The `with { type: 'json' }` attribute is required by Node's ESM loader and
// understood by Vite, so these files import identically in the browser bundle
// and in a plain `node` script.
import guccMarmontSmall from './gucci-marmont-small.json' with { type: 'json' }
import louisVuittonNeverfullMm from './louis-vuitton-neverfull-mm.json' with { type: 'json' }
import chanelClassicFlapMedium from './chanel-classic-flap-medium.json' with { type: 'json' }
import diorLadyDiorMedium from './dior-lady-dior-medium.json' with { type: 'json' }
import pradaGalleriaMedium from './prada-galleria-medium.json' with { type: 'json' }
import hermesBirkin30 from './hermes-birkin-30.json' with { type: 'json' }

export const REFERENCE_MODELS = [
  guccMarmontSmall,
  louisVuittonNeverfullMm,
  chanelClassicFlapMedium,
  diorLadyDiorMedium,
  pradaGalleriaMedium,
  hermesBirkin30,
]

/** Brand names that TrustCheck supports, in reference-file order. */
export const SUPPORTED_BRANDS = [...new Set(REFERENCE_MODELS.map((m) => m.brand))]

/** Models available for a given brand. */
export function modelsForBrand(brand) {
  if (!brand) return []
  return REFERENCE_MODELS.filter((m) => m.brand.toLowerCase() === brand.toLowerCase())
}

/** Exact brand + model lookup. Returns null when the pair is not supported. */
export function findReference(brand, model) {
  if (!brand || !model) return null
  return (
    REFERENCE_MODELS.find(
      (m) =>
        m.brand.toLowerCase() === brand.toLowerCase() &&
        m.model.toLowerCase() === model.toLowerCase(),
    ) ?? null
  )
}

export function findReferenceBySlug(slug) {
  return REFERENCE_MODELS.find((m) => m.slug === slug) ?? null
}

/**
 * Matches free-text brand input against a supported brand.
 * Lets a seller who typed "gucci" on the Sell start page be recognised.
 */
export function matchBrand(input) {
  if (!input) return null
  const needle = input.trim().toLowerCase()
  return (
    SUPPORTED_BRANDS.find(
      (b) => b.toLowerCase() === needle || b.toLowerCase().replace(/è/g, 'e') === needle,
    ) ?? null
  )
}
