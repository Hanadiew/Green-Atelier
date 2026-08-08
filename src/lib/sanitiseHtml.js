/* --- HTML sanitiser ----------------------------------------------------------
   Listing descriptions are authored in RichTextEditor and stored as HTML, which
   means the database now holds markup a seller wrote. Rendering that with
   v-html without filtering it first is stored XSS: any buyer opening the
   listing, and any admin opening the review page, would run it.

   An allowlist, not a blocklist. Anything not named here is unwrapped — its
   text is kept, the element is dropped — so a stripped tag never silently
   deletes a seller's words. Every attribute goes, which removes the whole
   `onerror=` / `href="javascript:"` class of problem without having to
   enumerate it.

   Parsed with DOMParser rather than regex: regex cannot parse HTML, and every
   regex-based sanitiser has been bypassed. This runs in the browser only, which
   is where these two render sites live. */

const ALLOWED = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'P', 'BR', 'DIV', 'SPAN'])

export function sanitiseHtml(input) {
  if (!input) return ''

  // No markup at all: the field predates the editor, or the seller typed plain
  // text. Escape it so a literal "<" still shows as one.
  if (!/[<>]/.test(input)) return escapeText(input)

  const doc = new DOMParser().parseFromString(`<body>${input}</body>`, 'text/html')

  const walk = (node) => {
    // Snapshot: unwrapping moves children, which would mutate a live list.
    for (const child of [...node.children]) {
      walk(child)

      if (!ALLOWED.has(child.tagName)) {
        child.replaceWith(...child.childNodes)
        continue
      }

      for (const attr of [...child.attributes]) child.removeAttribute(attr.name)
    }
  }

  walk(doc.body)
  return doc.body.innerHTML
}

function escapeText(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
