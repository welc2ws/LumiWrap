// Turns the model's raw text into slide lines. Tolerant of format drift.

export function stripReasoning(raw: string): string {
  return raw
    .replace(/<(think|thinking|reasoning)>[\s\S]*?<\/\1>/gi, '')
    .replace(/^[\s\S]*?<\/(think|thinking|reasoning)>/i, '')
    .replace(/```[a-z]*\n?/gi, '')
    .trim()
}

/**
 * Expects blocks like:
 *   === intro ===
 *   text...
 * Also accepts "## intro", "[intro]" or "**intro**" headers.
 */
export function parseSlides(raw: string, ids: string[]): Record<string, string> {
  const text = stripReasoning(raw)
  const known = new Set(ids)
  const header = /^\s*(?:={2,}\s*|#{1,4}\s*|\[\s*|\*\*\s*)([a-z_]+)(?:\s*={2,}|\s*\]|\s*\*\*)?\s*:?\s*$/i
  const out: Record<string, string> = {}
  let current = ''
  let buf: string[] = []
  const flush = () => {
    if (current && buf.join('').trim()) out[current] = clean(buf.join('\n'))
    buf = []
  }
  for (const line of text.split('\n')) {
    const m = line.match(header)
    if (m && known.has(m[1].toLowerCase())) {
      flush()
      current = m[1].toLowerCase()
    } else if (/^\s*={2,}\s*[\w -]+\s*={2,}\s*$/.test(line)) {
      // An "=== something ===" header we didn't ask for ends the current slide.
      flush()
      current = ''
    } else if (current) {
      buf.push(line)
    }
  }
  flush()
  return out
}

function clean(s: string) {
  return s
    .trim()
    .replace(/^["“]([\s\S]*)["”]$/, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, 900)
}
