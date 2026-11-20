import type { SpindleFrontendContext } from 'lumiverse-spindle-types'
import {
  DEFAULT_CHARACTER_HOST_PROMPT,
  DEFAULT_HOSTS,
  DEFAULT_SLIDES,
  fmt,
  type Depth,
  type Estimate,
  type Host,
  type PickedChat,
  type Settings,
  type SlideDef,
  type Wrap,
  type WrapStats,
  type WrapSummary,
} from './shared'
import { STYLES } from './styles'
import { avatar, esc, openPlayer, type PlayerHandle } from './player'

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="9" width="17" height="11.5" rx="1.6"/><path d="M2.5 9h19V6.8a.8.8 0 0 0-.8-.8H3.3a.8.8 0 0 0-.8.8z"/><path d="M12 6v14.5"/><path d="M12 6c-1.2-2.6-4.6-3.4-5.2-1.6C6.2 6.2 9.6 6.4 12 6zM12 6c1.2-2.6 4.6-3.4 5.2-1.6.6 1.8-2.8 2-5.2 1.6z"/></svg>`

const GIFT = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="9.5" width="17" height="11" rx="1.6" fill="currentColor"/><rect x="2.5" y="6.5" width="19" height="3.6" rx=".9" fill="currentColor" opacity=".85"/><rect x="10.6" y="6.5" width="2.8" height="14" fill="#f3d27a"/><path d="M12 6.6c-1.3-2.7-4.8-3.5-5.4-1.6-.6 1.9 3 2.1 5.4 1.6zM12 6.6c1.3-2.7 4.8-3.5 5.4-1.6.6 1.9-3 2.1-5.4 1.6z" fill="#f3d27a"/></svg>`

const SNOWFLAKE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7"/><path d="m9.5 3.5 2.5 2 2.5-2M9.5 20.5l2.5-2 2.5 2M4 10.2l3-.6-1-2.9M20 13.8l-3 .6 1 2.9M4 13.8l3 .6-1 2.9M20 10.2l-3-.6 1-2.9"/></svg>`
const CHEVRON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`
const PLAY = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>`
const TRASH = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.8h6V7M6.5 7l.9 12.2a1.5 1.5 0 0 0 1.5 1.3h6.2a1.5 1.5 0 0 0 1.5-1.3L17.5 7"/></svg>`
const PENCIL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>`
const UPLOAD = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4.5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V15"/></svg>`

type View = 'wrap' | 'library' | 'slides' | 'hosts' | 'settings'

const DEPTHS: Array<{ id: Depth; icon: string; label: string; hint: string; cost: string }> = [
  { id: 'stats', icon: '❄️', label: 'Stats', hint: 'Counts everything on your machine. Nothing is sent to a model.', cost: 'Free' },
  { id: 'highlights', icon: '✨', label: 'Highlights + stats', hint: 'A small sample from your top chats, so the host can quote you.', cost: 'Small' },
  { id: 'deep', icon: '🔍', label: 'Deep + everything', hint: 'Summarizes each picked chat. Summaries are cached for next time.', cost: 'Most' },
]

const NEEDS_LABEL: Record<Depth, string> = { stats: 'Stats', highlights: 'Highlights+', deep: 'Deep' }
const DEPTH_LABEL: Record<Depth, string> = { stats: 'Stats', highlights: 'Highlights', deep: 'Deep' }

const PERMISSION_LABEL: Record<string, string> = {
  generation: 'Generation (connections and host lines)',
  characters: 'Characters',
  chats: 'Chats',
  chat_mutation: 'Chat mutation (reading messages; Lumiwrap never edits them)',
  personas: 'Personas',
}

function timeAgo(ts: number) {
  const s = Math.max(0, (Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return new Date(ts).toLocaleDateString()
}

/** Shrink an uploaded image so it stores comfortably. */
function readImage(file: File, maxSide = 720): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Pick an image file.'))
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Couldn't read that file."))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error("Couldn't open that image."))
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        let url = canvas.toDataURL('image/webp', 0.88)
        if (!url.startsWith('data:image/webp')) url = canvas.toDataURL('image/png')
        resolve(url)
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

export function setup(ctx: SpindleFrontendContext) {
  const removeStyle = ctx.dom.addStyle(STYLES)

  const tab = ctx.ui.registerDrawerTab({
    id: 'lumiwrap',
    title: 'Lumiwrap',
    shortName: 'Wrap',
    description: 'Your year in Lumiverse, wrapped',
    keywords: ['wrapped', 'recap', 'year', 'stats', 'christmas', 'new year'],
    iconSvg: ICON,
  })

  const root = tab.root
  const thisYear = new Date().getFullYear()

  root.innerHTML = `
    <div class="lw">
      <header class="lw-head">
        <span class="lw-logo">${GIFT}</span>
        <div class="lw-head-text">
          <div class="lw-title">Lumiwrap</div>
          <div class="lw-tagline">That's a wrap!</div>
        </div>
      </header>

      <nav class="lw-nav">
        <button data-view="wrap" class="active">Wrap</button>
        <button data-view="library">Library</button>
        <button data-view="slides">Slides</button>
        <button data-view="hosts">Hosts</button>
        <button data-view="settings">Settings</button>
      </nav>

      <div class="lw-banner" data-el="banner" hidden></div>

      <section data-panel="wrap">
        <div class="lw-card">
          <div class="lw-step"><span class="lw-ornament">1</span>Your year</div>
          <div class="lw-yearrow">
            <button class="lw-round" data-el="year-down" aria-label="Previous year">‹</button>
            <input data-el="year" class="lw-year" type="number" min="2020" max="2100" value="${thisYear}" aria-label="Year">
            <button class="lw-round" data-el="year-up" aria-label="Next year">›</button>
          </div>
          <div class="lw-seg" data-el="scope">
            <button data-scope="all" class="on">Everything</button>
            <button data-scope="pick">Pick characters</button>
          </div>
          <div class="lw-pickwrap" data-el="char-wrap" hidden>
            <div class="lw-cp" data-el="char-picker"></div>
            <label class="lw-field"><span>Name this Wrapped (optional)</span><input type="text" data-el="label" maxlength="60" placeholder="e.g. Dream SMP"></label>
          </div>
        </div>

        <div class="lw-card">
          <div class="lw-step"><span class="lw-ornament">2</span>How much to read</div>
          <div class="lw-depths" data-el="depths">
            ${DEPTHS.map(
              d => `<button class="lw-depth${d.id === 'stats' ? ' on' : ''}" data-depth="${d.id}">
                <span class="lw-depth-icon">${d.icon}</span>
                <span class="lw-depth-text"><b>${d.label}</b><small>${d.hint}</small></span>
                <span class="lw-tag lw-tag-${d.id}">${d.cost}</span>
              </button>`,
            ).join('')}
          </div>
        </div>

        <div class="lw-card">
          <div class="lw-step"><span class="lw-ornament">3</span>Who reads it to you</div>
          <div class="lw-hosts" data-el="hosts"></div>
          <div class="lw-cp" data-el="host-picker" hidden></div>
        </div>

        <button class="lw-primary" data-el="scan">${SNOWFLAKE}<span>Scan my year</span></button>
        <div class="lw-progress" data-el="progress" hidden><div class="lw-progress-text" data-el="progress-text"></div><div class="lw-progress-bar"><i data-el="progress-bar"></i></div></div>
        <div class="lw-status" data-el="status"></div>

        <div class="lw-tagcard" data-el="result" hidden>
          <div class="lw-tag-hole"></div>
          <div class="lw-tag-title">To: you · From: ${'<span data-el="from"></span>'}</div>
          <div class="lw-found" data-el="found"></div>
          <div data-el="picked-wrap">
            <div class="lw-sublabel">Chats it will read <small data-el="picked-hint"></small></div>
            <div class="lw-picked" data-el="picked"></div>
          </div>
          <label class="lw-check" data-el="commentary-wrap"><input type="checkbox" data-el="commentary"> Let the host write her own lines (one small call)</label>
          <div class="lw-cost">
            <div class="lw-cost-big" data-el="cost-big">–</div>
            <div class="lw-hint" data-el="cost-detail"></div>
          </div>
          <button class="lw-primary" data-el="go">${GIFT}<span>Wrap it!</span></button>
        </div>
      </section>

      <section data-panel="library" hidden>
        <div class="lw-lib" data-el="lib"></div>
        <button class="lw-danger" data-el="delete-all" hidden>Delete every Lumiwrap</button>
      </section>

      <section data-panel="slides" hidden>
        <div class="lw-card">
          <div class="lw-card-title">Slides</div>
          <p class="lw-hint">Switch slides on or off, reorder them, and rewrite what the host is told for each one. Prompts are only used when the host writes her own lines. Macros: <code>{{user}}</code> <code>{{year}}</code> <code>{{nextYear}}</code> <code>{{top1}}</code> <code>{{words}}</code> and more.</p>
          <div class="lw-slides" data-el="slides"></div>
        </div>
        <div class="lw-row">
          <button class="lw-primary lw-slim lw-grow" data-el="slides-save">Save slides</button>
          <button class="lw-ghost" data-el="slides-reset">Reset</button>
        </div>
      </section>

      <section data-panel="hosts" hidden>
        <div class="lw-host-eds" data-el="host-editors"></div>
        <div class="lw-card">
          <div class="lw-card-title">Character host add-on</div>
          <p class="lw-hint">Added when a character from your library hosts, so they stay in character. Macros: <code>{{char}}</code> <code>{{user}}</code> <code>{{year}}</code>.</p>
          <textarea data-el="charprompt" rows="7"></textarea>
        </div>
        <div class="lw-row">
          <button class="lw-primary lw-slim lw-grow" data-el="hosts-save">Save hosts</button>
          <button class="lw-ghost" data-el="hosts-reset">Reset all</button>
        </div>
        <div class="lw-status" data-el="hosts-status"></div>
        <input type="file" accept="image/*" data-el="file" hidden>
      </section>

      <section data-panel="settings" hidden>
        <div class="lw-card">
          <div class="lw-card-title">Connection</div>
          <div class="lw-conn-row">
            <select data-el="s-conn"></select>
            <button class="lw-round" data-el="s-refresh" title="Reload connections" aria-label="Reload connections">↻</button>
          </div>
          <p class="lw-hint" data-el="s-conn-hint">Point this at your sidecar or a cheap model to keep costs down.</p>
          <label class="lw-check"><input data-el="s-noreason" type="checkbox"> Turn off thinking for Lumiwrap calls (cheaper and faster)</label>
        </div>

        <div class="lw-card">
          <div class="lw-card-title">Samplers</div>
          <p class="lw-hint">Leave a box empty to use your connection's own setting.</p>
          <div class="lw-grid2">
            <label class="lw-field"><span>Temperature</span><input data-el="s-temp" type="number" min="0" max="2" step="0.05"></label>
            <label class="lw-field"><span>Max tokens</span><input data-el="s-max" type="number" min="64" max="32000" step="1" placeholder="default"></label>
            <label class="lw-field"><span>Top P</span><input data-el="s-topp" type="number" min="0" max="1" step="0.01" placeholder="default"></label>
            <label class="lw-field"><span>Top K</span><input data-el="s-topk" type="number" min="0" max="500" step="1" placeholder="default"></label>
            <label class="lw-field"><span>Min P</span><input data-el="s-minp" type="number" min="0" max="1" step="0.01" placeholder="default"></label>
            <label class="lw-field"><span>Repetition penalty</span><input data-el="s-rep" type="number" min="0" max="3" step="0.01" placeholder="default"></label>
            <label class="lw-field"><span>Frequency penalty</span><input data-el="s-freq" type="number" min="-2" max="2" step="0.01" placeholder="default"></label>
            <label class="lw-field"><span>Presence penalty</span><input data-el="s-pres" type="number" min="-2" max="2" step="0.01" placeholder="default"></label>
          </div>
        </div>

        <div class="lw-card">
          <div class="lw-card-title">What gets picked</div>
          <p class="lw-hint">Highlights and Deep read the characters with the most chats, then each one's chats with the most messages.</p>
          <div class="lw-grid2">
            <label class="lw-field"><span>Top characters</span><input data-el="s-topchars" type="number" min="1" max="10"></label>
            <label class="lw-field"><span>Chats per character</span><input data-el="s-perchar" type="number" min="1" max="10"></label>
            <label class="lw-field"><span>Messages per sample</span><input data-el="s-sample" type="number" min="4" max="60"></label>
            <label class="lw-field"><span>Seconds per slide</span><input data-el="s-secs" type="number" min="3" max="30"></label>
          </div>
          <label class="lw-check"><input data-el="s-commentary" type="checkbox"> In Stats mode, let the host write her own lines</label>
        </div>
        <button class="lw-primary lw-slim" data-el="s-save">Save settings</button>
      </section>
    </div>
  `

  const $ = <T extends HTMLElement = HTMLElement>(name: string) => root.querySelector(`[data-el="${name}"]`) as T
  const el = {
    banner: $('banner'),
    year: $<HTMLInputElement>('year'),
    yearDown: $<HTMLButtonElement>('year-down'),
    yearUp: $<HTMLButtonElement>('year-up'),
    scope: $('scope'),
    charWrap: $('char-wrap'),
    charPicker: $('char-picker'),
    label: $<HTMLInputElement>('label'),
    depths: $('depths'),
    hosts: $('hosts'),
    hostPicker: $('host-picker'),
    scan: $<HTMLButtonElement>('scan'),
    progress: $('progress'),
    progressText: $('progress-text'),
    progressBar: $('progress-bar'),
    status: $('status'),
    result: $('result'),
    from: $('from'),
    found: $('found'),
    pickedWrap: $('picked-wrap'),
    pickedHint: $('picked-hint'),
    picked: $('picked'),
    commentaryWrap: $('commentary-wrap'),
    commentary: $<HTMLInputElement>('commentary'),
    costBig: $('cost-big'),
    costDetail: $('cost-detail'),
    go: $<HTMLButtonElement>('go'),
    lib: $('lib'),
    deleteAll: $<HTMLButtonElement>('delete-all'),
    slides: $('slides'),
    slidesSave: $<HTMLButtonElement>('slides-save'),
    slidesReset: $<HTMLButtonElement>('slides-reset'),
    hostEditors: $('host-editors'),
    charprompt: $<HTMLTextAreaElement>('charprompt'),
    hostsSave: $<HTMLButtonElement>('hosts-save'),
    hostsReset: $<HTMLButtonElement>('hosts-reset'),
    file: $<HTMLInputElement>('file'),
    hostsStatus: $('hosts-status'),
    sConn: $<HTMLSelectElement>('s-conn'),
    sRefresh: $<HTMLButtonElement>('s-refresh'),
    sConnHint: $('s-conn-hint'),
    sNoReason: $<HTMLInputElement>('s-noreason'),
    sTemp: $<HTMLInputElement>('s-temp'),
    sMax: $<HTMLInputElement>('s-max'),
    sTopP: $<HTMLInputElement>('s-topp'),
    sTopK: $<HTMLInputElement>('s-topk'),
    sMinP: $<HTMLInputElement>('s-minp'),
    sRep: $<HTMLInputElement>('s-rep'),
    sFreq: $<HTMLInputElement>('s-freq'),
    sPres: $<HTMLInputElement>('s-pres'),
    sTopchars: $<HTMLInputElement>('s-topchars'),
    sPerchar: $<HTMLInputElement>('s-perchar'),
    sSample: $<HTMLInputElement>('s-sample'),
    sSecs: $<HTMLInputElement>('s-secs'),
    sCommentary: $<HTMLInputElement>('s-commentary'),
    sSave: $<HTMLButtonElement>('s-save'),
  }

  // ---------- state ----------
  let settings: Settings | null = null
  let characters: Array<{ id: string; name: string; avatar: string | null }> = []
  let connections: Array<{ id: string; name: string; provider: string; model: string; isDefault: boolean }> = []
  let sprites: Record<string, string> = {}
  let initErrors: string[] = []
  let missing: string[] = []
  let scope: 'all' | 'pick' = 'all'
  let pickedChars = new Set<string>()
  let hostCharId = ''
  let depth: Depth = 'stats'
  let hostRef = 'past'
  let busy = ''
  let scan: { scanId: string; stats: WrapStats; picked: PickedChat[]; depth: Depth; estimate: Estimate } | null = null
  let selected = new Set<string>()
  let library: WrapSummary[] = []
  let slidesDraft: SlideDef[] = []
  let player: PlayerHandle | null = null
  let playerWrapId = ''
  let pendingExpose: { wrapId: string; chatId: string } | null = null
  let uploadFor = ''
  let view: View = 'wrap'
  const armed = new Map<string, ReturnType<typeof setTimeout>>() // two-tap delete

  // ---------- helpers ----------
  const hostArt = (h: Host) => (sprites[h.id] ? `<img src="${esc(sprites[h.id])}" alt="">` : `<span>${esc(h.emoji)}</span>`)

  /** First tap arms the button, second tap within 3s confirms. */
  function twoTap(btn: HTMLElement, key: string, armedLabel: string, action: () => void) {
    if (armed.has(key)) {
      clearTimeout(armed.get(key)!)
      armed.delete(key)
      action()
      return
    }
    const original = btn.innerHTML
    btn.classList.add('armed')
    btn.innerHTML = armedLabel
    armed.set(
      key,
      setTimeout(() => {
        armed.delete(key)
        btn.classList.remove('armed')
        btn.innerHTML = original
      }, 3000),
    )
  }

  function hostsStatus(text: string) {
    el.hostsStatus.textContent = text
    el.hostsStatus.className = `lw-status ${text ? 'error' : ''}`
  }

  // ---------- rendering ----------
  function setView(v: View) {
    view = v
    root.querySelectorAll<HTMLButtonElement>('.lw-nav button').forEach(b => b.classList.toggle('active', b.dataset.view === v))
    root.querySelectorAll<HTMLElement>('[data-panel]').forEach(p => (p.hidden = p.dataset.panel !== v))
    if (v === 'library') ctx.sendToBackend({ type: 'list_wraps' })
  }

  function renderBanner() {
    if (!missing.length && !initErrors.length) {
      el.banner.hidden = true
      return
    }
    el.banner.hidden = false
    el.banner.innerHTML = missing.length
      ? `<b>Lumiwrap is missing some permissions.</b>
         <p>Open <b>Extensions</b>, find Lumiwrap and grant:</p>
         <ul>${missing.map(p => `<li>${esc(PERMISSION_LABEL[p] || p)}</li>`).join('')}</ul>
         <button class="lw-ghost lw-small" data-retry>I granted them, try again</button>`
      : `<b>Something didn't load.</b><p>${initErrors.map(esc).join('<br>')}</p><button class="lw-ghost lw-small" data-retry>Try again</button>`
  }

  // ---------- character pickers (Peanut Gallery style) ----------
  interface Picker {
    render(): void
    close(): void
  }

  function makePicker(host: HTMLElement, multi: boolean, getSel: () => string[], setSel: (ids: string[]) => void): Picker {
    let open = false
    host.innerHTML = `
      <button class="lw-pill" data-pill aria-expanded="false"><span class="lw-pill-av" data-av></span>
        <span class="lw-pill-text"><span class="lw-pill-main" data-main></span><span class="lw-pill-sub" data-sub></span></span>
        <span class="lw-pill-chev">${CHEVRON}</span></button>
      <div class="lw-cp-panel" data-panel hidden>
        <input type="text" data-search placeholder="Search characters...">
        <div class="lw-cp-list" data-list></div>
        ${multi ? `<div class="lw-cp-foot"><button class="lw-ghost lw-small" data-all>Select shown</button><button class="lw-ghost lw-small" data-none>Clear</button><span class="lw-cp-count" data-count></span><button class="lw-ghost lw-small" data-done>Done</button></div>` : ''}
      </div>`
    const q = (sel: string) => host.querySelector(sel) as HTMLElement
    const pill = q('[data-pill]')
    const panel = q('[data-panel]')
    const search = q('[data-search]') as HTMLInputElement
    const list = q('[data-list]')

    const shown = () => {
      const term = search.value.trim().toLowerCase()
      return characters.filter(c => !term || c.name.toLowerCase().includes(term))
    }

    function renderPill() {
      const sel = getSel().map(id => characters.find(c => c.id === id)).filter(Boolean) as typeof characters
      const av = q('[data-av]')
      const main = q('[data-main]')
      const sub = q('[data-sub]')
      if (!sel.length) {
        av.innerHTML = `<div class="lw-mini lw-mini-empty">${GIFT}</div>`
        main.textContent = multi ? 'Pick characters' : 'Pick a character'
        sub.textContent = characters.length ? `${characters.length} in your library` : missing.includes('characters') ? 'Grant the Characters permission first' : 'No characters found'
      } else if (!multi || sel.length === 1) {
        av.innerHTML = avatar(sel[0].name, sel[0].avatar, 'lw-mini')
        main.textContent = sel[0].name
        sub.textContent = multi ? '1 character' : 'Hosting your Lumiwrap'
      } else {
        av.innerHTML = `<span class="lw-stack">${sel.slice(0, 3).map(c => avatar(c.name, c.avatar, 'lw-mini')).join('')}</span>`
        main.textContent = `${sel.length} characters`
        sub.textContent = sel.map(c => c.name).join(', ')
      }
      pill.setAttribute('aria-expanded', String(open))
      pill.classList.toggle('open', open)
    }

    function renderList() {
      panel.hidden = !open
      if (!open) return
      const sel = new Set(getSel())
      const rows = shown()
      list.innerHTML = rows.length
        ? rows
            .map(
              c => `<button class="lw-cp-row${sel.has(c.id) ? ' on' : ''}" data-id="${esc(c.id)}">
                ${avatar(c.name, c.avatar, 'lw-mini')}<span class="lw-cp-name">${esc(c.name)}</span>
                ${multi ? `<span class="lw-cp-box">${sel.has(c.id) ? '✓' : ''}</span>` : sel.has(c.id) ? '<span class="lw-cp-tick">✓</span>' : ''}</button>`,
            )
            .join('')
        : `<div class="lw-hint lw-pad">${characters.length ? 'No characters match.' : 'No characters found.'}</div>`
      const count = host.querySelector('[data-count]')
      if (count) count.textContent = `${sel.size} picked`
    }

    pill.addEventListener('click', () => {
      open = !open
      if (open) {
        search.value = ''
        if (!characters.length) ctx.sendToBackend({ type: 'init' })
      }
      renderPill()
      renderList()
      if (open) search.focus()
    })
    search.addEventListener('input', renderList)
    list.addEventListener('click', e => {
      const row = (e.target as HTMLElement).closest<HTMLElement>('[data-id]')
      if (!row) return
      const id = row.dataset.id!
      if (multi) {
        const sel = new Set(getSel())
        if (sel.has(id)) sel.delete(id)
        else sel.add(id)
        setSel([...sel])
      } else {
        setSel([id])
        open = false
      }
      renderPill()
      renderList()
    })
    host.querySelector('[data-all]')?.addEventListener('click', () => {
      setSel([...new Set([...getSel(), ...shown().map(c => c.id)])])
      renderPill()
      renderList()
    })
    host.querySelector('[data-none]')?.addEventListener('click', () => {
      setSel([])
      renderPill()
      renderList()
    })
    host.querySelector('[data-done]')?.addEventListener('click', () => {
      open = false
      renderPill()
      renderList()
    })
    return {
      render() {
        renderPill()
        renderList()
      },
      close() {
        open = false
        renderPill()
        renderList()
      },
    }
  }

  const charPicker = makePicker(
    el.charPicker,
    true,
    () => [...pickedChars],
    ids => {
      pickedChars = new Set(ids)
      invalidateScan('Characters changed. Scan again to update.')
    },
  )
  const hostPicker = makePicker(
    el.hostPicker,
    false,
    () => (hostCharId ? [hostCharId] : []),
    ids => {
      hostCharId = ids[0] || ''
      hostRef = `char:${hostCharId}`
      renderHostPicker()
      refreshEstimate()
    },
  )

  function renderCharacterSelects() {
    const ids = new Set(characters.map(c => c.id))
    pickedChars = new Set([...pickedChars].filter(id => ids.has(id)))
    if (hostCharId && !ids.has(hostCharId)) hostCharId = ''
    charPicker.render()
    hostPicker.render()
  }

  function renderScope() {
    el.scope.querySelectorAll<HTMLButtonElement>('[data-scope]').forEach(b => b.classList.toggle('on', b.dataset.scope === scope))
    el.charWrap.hidden = scope !== 'pick'
  }

  function renderDepth() {
    el.depths.querySelectorAll<HTMLButtonElement>('[data-depth]').forEach(b => b.classList.toggle('on', b.dataset.depth === depth))
  }

  function renderHostPicker() {
    const hosts = settings?.hosts || DEFAULT_HOSTS
    el.hosts.innerHTML =
      hosts
        .map(
          h => `<button class="lw-host-tile${hostRef === h.id ? ' on' : ''}" data-host="${h.id}" style="--tile:${esc(h.accent)}">
            <span class="lw-tile-art">${hostArt(h)}</span>
            <span class="lw-tile-name">${esc(h.name)}</span><span class="lw-tile-sub">${esc(h.title)}</span></button>`,
        )
        .join('') +
      (() => {
        const c = characters.find(x => x.id === hostCharId)
        const art = c ? avatar(c.name, c.avatar, 'lw-tile-pfp') : '<span>🎁</span>'
        return `<button class="lw-host-tile${hostRef.startsWith('char:') ? ' on' : ''}" data-host="char" style="--tile:#d9b45a">
          <span class="lw-tile-art">${art}</span><span class="lw-tile-name">${esc(c ? c.name : 'A character')}</span><span class="lw-tile-sub">${c ? 'from your library' : 'from your library'}</span></button>`
      })()
    el.hostPicker.hidden = !hostRef.startsWith('char:')
  }

  function currentHostRef() {
    if (hostRef.startsWith('char:')) return hostCharId ? `char:${hostCharId}` : ''
    return hostRef
  }

  function hostName() {
    const ref = currentHostRef()
    if (ref.startsWith('char:')) return characters.find(c => `char:${c.id}` === ref)?.name || 'a character'
    return (settings?.hosts || DEFAULT_HOSTS).find(h => h.id === ref)?.name || 'Holly'
  }

  function setProgress(text: string, done = 0, total = 0) {
    el.progress.hidden = !text
    el.progressText.textContent = text
    el.progressBar.style.width = total ? `${Math.round((done / total) * 100)}%` : '100%'
    el.progressBar.classList.toggle('indeterminate', !total)
  }

  function setStatus(text: string, kind: 'error' | 'info' = 'info') {
    el.status.textContent = text
    el.status.className = `lw-status ${text ? kind : ''}`
  }

  function renderBusy() {
    el.scan.disabled = !!busy
    el.go.disabled = !!busy || !scan
    el.scan.querySelector('span')!.textContent = busy === 'scan' ? 'Scanning...' : scan ? 'Scan again' : 'Scan my year'
    el.go.querySelector('span')!.textContent = busy === 'wrap' ? 'Wrapping...' : 'Wrap it!'
    el.scan.classList.toggle('loading', busy === 'scan')
    el.go.classList.toggle('loading', busy === 'wrap')
  }

  function invalidateScan(reason?: string) {
    if (!scan) return
    scan = null
    el.result.hidden = true
    renderBusy()
    if (reason) setStatus(reason)
  }

  function renderResult() {
    if (!scan) {
      el.result.hidden = true
      return
    }
    el.result.hidden = false
    el.from.textContent = hostName()
    const t = scan.stats.totals
    el.found.innerHTML = `
      <div class="lw-found-grid">
        <div><b>${fmt(t.messages)}</b><small>messages</small></div>
        <div><b>${fmt(t.chats)}</b><small>chats</small></div>
        <div><b>${fmt(t.characters)}</b><small>characters</small></div>
      </div>
      <div class="lw-hint">in ${scan.stats.year}${scan.stats.scope !== 'all' ? ` with ${esc(scan.stats.scopeName)}` : ''}</div>`

    el.pickedWrap.hidden = scan.depth === 'stats'
    el.pickedHint.textContent = scan.depth === 'deep' ? '(tokens to read each)' : '(tokens per sample)'
    el.picked.innerHTML = scan.picked.length
      ? scan.picked
          .map(p => {
            const free = p.deepCached && scan!.depth === 'deep'
            const cost = scan!.depth === 'deep' ? (free ? 'cached' : `≈ ${fmt(p.chatTokens)}`) : `≈ ${fmt(p.sampleTokens)}`
            return `<label class="lw-pick"><input type="checkbox" data-pick="${esc(p.id)}"${selected.has(p.id) ? ' checked' : ''}>
              <span class="lw-pick-text"><b>${esc(p.name)}</b><small>${esc(p.characterName)} · ${fmt(p.messages)} msgs</small></span>
              <span class="lw-pick-cost${free ? ' free' : ''}">${cost}</span></label>`
          })
          .join('')
      : `<div class="lw-hint lw-pad">No chats to read.</div>`

    el.commentaryWrap.hidden = scan.depth !== 'stats' || currentHostRef().startsWith('char:')
    el.commentary.checked = !!settings?.statsCommentary
    renderEstimate()
    renderBusy()
  }

  function renderEstimate() {
    if (!scan) return
    const e = scan.estimate
    if (e.free) {
      el.costBig.innerHTML = `Free <small>0 tokens</small>`
      el.costDetail.textContent = 'Built-in host lines. Nothing is sent to a model.'
      return
    }
    el.costBig.innerHTML = `≈ ${fmt(e.total)} <small>tokens</small>`
    const parts = [`${fmt(e.base)} for stats and instructions`]
    if (e.highlights) parts.push(`${fmt(e.highlights)} for samples`)
    if (e.deep) parts.push(`${fmt(e.deep)} for reading chats`)
    parts.push(`about ${fmt(e.reply)} back`)
    el.costDetail.textContent = parts.join(' + ') + (e.model ? ` (counted for ${e.model})` : '') + '.'
  }

  function renderLibrary() {
    el.deleteAll.hidden = library.length < 2
    if (!library.length) {
      el.lib.innerHTML = `<div class="lw-empty">${GIFT}<p>No Lumiwraps yet.<br>Scan your year to make one.</p></div>`
      return
    }
    const hosts = settings?.hosts || DEFAULT_HOSTS
    el.lib.innerHTML = library
      .map(w => {
        const builtin = hosts.find(h => h.name === w.hostName)
        const art = builtin && sprites[builtin.id] ? `<img src="${esc(sprites[builtin.id])}" alt="">` : `<span>${esc(w.hostEmoji || '🎁')}</span>`
        return `<div class="lw-libitem">
          <button class="lw-lib-main" data-play="${esc(w.id)}" title="Play">
            <span class="lw-lib-art">${art}<i>${PLAY}</i></span>
            <span class="lw-lib-text"><b>${esc(w.title)}</b><small>${esc(DEPTH_LABEL[w.depth] || w.depth)} · ${esc(timeAgo(w.createdAt))}</small></span>
          </button>
          <div class="lw-lib-actions">
            <button class="lw-iconbtn" data-rename="${esc(w.id)}" title="Rename" aria-label="Rename">${PENCIL}</button>
            <button class="lw-iconbtn lw-iconbtn-danger" data-delete="${esc(w.id)}" title="Delete" aria-label="Delete">${TRASH}</button>
          </div>
        </div>`
      })
      .join('')
  }

  function renderSlides() {
    el.slides.innerHTML = slidesDraft
      .map(
        (s, i) => `<div class="lw-slide-row${s.enabled ? '' : ' off'}">
          <div class="lw-slide-head">
            <label class="lw-switch" title="Show this slide"><input type="checkbox" data-toggle="${i}"${s.enabled ? ' checked' : ''}><i></i></label>
            <input type="text" class="lw-slide-title" data-title="${i}" value="${esc(s.title)}" maxlength="60" aria-label="Slide title">
            <span class="lw-badge lw-badge-${s.needs}">${NEEDS_LABEL[s.needs]}</span>
            <span class="lw-move">
              <button data-up="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Move up">▲</button>
              <button data-down="${i}" ${i === slidesDraft.length - 1 ? 'disabled' : ''} aria-label="Move down">▼</button>
            </span>
          </div>
          <details><summary>Prompt</summary><textarea rows="3" data-prompt="${i}">${esc(s.prompt)}</textarea></details>
        </div>`,
      )
      .join('')
  }

  function renderHostEditors() {
    const hosts = settings?.hosts || DEFAULT_HOSTS
    el.hostEditors.innerHTML = hosts
      .map(
        h => `<div class="lw-card lw-host-ed" data-host-editor="${h.id}" style="--tile:${esc(h.accent)}">
          <div class="lw-host-ed-head">
            <span class="lw-sprite-box">${hostArt(h)}</span>
            <div class="lw-host-ed-meta">
              <div class="lw-card-title">${esc(h.title)}</div>
              <div class="lw-row">
                <button class="lw-ghost lw-small" data-upload="${h.id}">${UPLOAD}<span>${sprites[h.id] ? 'Change image' : 'Upload image'}</span></button>
                ${sprites[h.id] ? `<button class="lw-ghost lw-small lw-ghost-danger" data-unsprite="${h.id}">Remove</button>` : ''}
              </div>
            </div>
          </div>
          <div class="lw-grid3">
            <label class="lw-field"><span>Name</span><input type="text" data-f="name" maxlength="40" value="${esc(h.name)}"></label>
            <label class="lw-field"><span>Emoji</span><input type="text" data-f="emoji" maxlength="8" value="${esc(h.emoji)}"></label>
            <label class="lw-field"><span>Accent</span><input type="color" data-f="accent" value="${esc(h.accent)}"></label>
          </div>
          <details class="lw-prompt-box"><summary>Personality prompt</summary><textarea rows="9" data-f="prompt">${esc(h.prompt)}</textarea></details>
          <button class="lw-linkbtn" data-reset-host="${h.id}">Reset ${esc(h.title)} to default</button>
        </div>`,
      )
      .join('')
    el.charprompt.value = settings?.characterHostPrompt || DEFAULT_CHARACTER_HOST_PROMPT
  }

  function renderConnections() {
    el.sConn.innerHTML =
      `<option value="">Use my default connection</option>` +
      connections.map(c => `<option value="${esc(c.id)}">${esc(c.name)}${c.isDefault ? ' (default)' : ''}${c.model ? ` · ${esc(c.model)}` : ''}</option>`).join('')
    if (settings) {
      if (settings.connectionId && !connections.some(c => c.id === settings!.connectionId)) {
        el.sConn.insertAdjacentHTML('beforeend', `<option value="${esc(settings.connectionId)}">(saved connection not found)</option>`)
      }
      el.sConn.value = settings.connectionId
    }
    const err = initErrors.find(e => e.startsWith('Connections'))
    el.sConnHint.textContent = err
      ? `Couldn't load your connections: ${err.replace(/^Connections:\s*/, '')}`
      : connections.length
        ? 'Point this at your sidecar or a cheap model to keep costs down.'
        : 'No connection profiles found. Make one in Lumiverse, then tap ↻.'
    el.sConnHint.classList.toggle('lw-warn', !!err)
  }

  function renderSettings() {
    if (!settings) return
    renderConnections()
    const num = (v: number | null) => (v === null || v === undefined ? '' : String(v))
    el.sNoReason.checked = settings.noReasoning
    el.sTemp.value = String(settings.temperature)
    el.sMax.value = num(settings.maxTokens)
    el.sTopP.value = num(settings.topP)
    el.sTopK.value = num(settings.topK)
    el.sMinP.value = num(settings.minP)
    el.sRep.value = num(settings.repetitionPenalty)
    el.sFreq.value = num(settings.frequencyPenalty)
    el.sPres.value = num(settings.presencePenalty)
    el.sTopchars.value = String(settings.topCharCount)
    el.sPerchar.value = String(settings.chatsPerChar)
    el.sSample.value = String(settings.sampleCount)
    el.sSecs.value = String(settings.slideSeconds)
    el.sCommentary.checked = settings.statsCommentary
  }

  function collectHosts() {
    const hosts = (settings?.hosts || DEFAULT_HOSTS).map(h => {
      const card = el.hostEditors.querySelector<HTMLElement>(`[data-host-editor="${h.id}"]`)
      if (!card) return h
      const v = (f: string) => (card.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[data-f="${f}"]`)?.value || '').trim()
      return { ...h, name: v('name') || h.name, emoji: v('emoji') || h.emoji, accent: v('accent') || h.accent, prompt: v('prompt') || h.prompt }
    })
    return { hosts, characterHostPrompt: el.charprompt.value.trim() || DEFAULT_CHARACTER_HOST_PROMPT }
  }

  function renderAll() {
    renderBanner()
    renderCharacterSelects()
    renderScope()
    renderDepth()
    renderHostPicker()
    renderSettings()
    renderSlides()
    renderHostEditors()
    renderLibrary()
    renderBusy()
  }

  // ---------- player ----------
  function play(wrap: Wrap, startAt = 0) {
    player?.close()
    playerWrapId = wrap.id
    player = openPlayer(ctx, wrap, {
      slideSeconds: settings?.slideSeconds || 8,
      sprite: wrap.host.kind === 'builtin' ? sprites[wrap.host.id] : undefined,
      startAt,
      onExpose: chatId => {
        pendingExpose = { wrapId: wrap.id, chatId }
        player?.setBusy('Checking the receipts...')
        ctx.sendToBackend({ type: 'expose_estimate', wrapId: playerWrapId, chatId })
      },
      onClose: () => {
        player = null
        playerWrapId = ''
      },
    })
  }

  // ---------- events ----------
  root.querySelectorAll<HTMLButtonElement>('.lw-nav button').forEach(b => b.addEventListener('click', () => setView(b.dataset.view as View)))

  el.banner.addEventListener('click', e => {
    if ((e.target as HTMLElement).closest('[data-retry]')) ctx.sendToBackend({ type: 'init' })
  })

  const bumpYear = (d: number) => {
    el.year.value = String((Number(el.year.value) || thisYear) + d)
    invalidateScan('Year changed. Scan again to update.')
  }
  el.yearDown.addEventListener('click', () => bumpYear(-1))
  el.yearUp.addEventListener('click', () => bumpYear(1))
  el.year.addEventListener('change', () => invalidateScan('Year changed. Scan again to update.'))

  el.scope.addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-scope]')
    if (!b || b.dataset.scope === scope) return
    scope = b.dataset.scope as 'all' | 'pick'
    renderScope()
    invalidateScan('Scope changed. Scan again to update.')
  })
  el.label.addEventListener('change', () => invalidateScan())

  el.depths.addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-depth]')
    if (!b || b.dataset.depth === depth) return
    depth = b.dataset.depth as Depth
    renderDepth()
    invalidateScan('Scan level changed. Scan again to see what it will read.')
  })

  el.hosts.addEventListener('click', e => {
    const tile = (e.target as HTMLElement).closest<HTMLElement>('[data-host]')
    if (!tile) return
    hostRef = tile.dataset.host === 'char' ? `char:${hostCharId}` : tile.dataset.host!
    if (tile.dataset.host === 'char' && !characters.length) ctx.sendToBackend({ type: 'init' })
    renderHostPicker()
    hostPicker.render()
    refreshEstimate()
  })
  function refreshEstimate() {
    if (!scan) return
    renderResult()
    ctx.sendToBackend({ type: 'estimate', scanId: scan.scanId, selected: [...selected], host: currentHostRef() })
  }

  el.scan.addEventListener('click', () => {
    if (busy) return
    const host = currentHostRef()
    if (!host) return setStatus('Pick a character to host, or choose one of the girls.', 'error')
    hostPicker.close()
    if (scope === 'pick' && !pickedChars.size) return setStatus('Pick at least one character to wrap.', 'error')
    charPicker.close()
    setStatus('')
    scan = null
    el.result.hidden = true
    busy = 'scan'
    renderBusy()
    setProgress('Starting...')
    ctx.sendToBackend({
      type: 'scan',
      request: {
        year: Number(el.year.value) || thisYear,
        scope,
        characterIds: [...pickedChars],
        label: el.label.value.trim(),
        depth,
        host,
        tzOffset: new Date().getTimezoneOffset(),
      },
    })
  })

  el.picked.addEventListener('change', e => {
    const box = e.target as HTMLInputElement
    if (!box.dataset.pick) return
    if (box.checked) selected.add(box.dataset.pick)
    else selected.delete(box.dataset.pick)
    refreshEstimate()
  })

  el.commentary.addEventListener('change', () => {
    if (!settings) return
    settings.statsCommentary = el.commentary.checked
    el.sCommentary.checked = el.commentary.checked
    ctx.sendToBackend({ type: 'save_settings', settings: { statsCommentary: el.commentary.checked }, quiet: true })
  })

  el.go.addEventListener('click', () => {
    if (!scan || busy) return
    if (scan.depth !== 'stats' && !selected.size) return setStatus('Tick at least one chat, or switch to Stats.', 'error')
    setStatus('')
    busy = 'wrap'
    renderBusy()
    setProgress('Wrapping...')
    ctx.sendToBackend({ type: 'wrap', scanId: scan.scanId, selected: [...selected], host: currentHostRef() })
  })

  // library
  el.lib.addEventListener('click', e => {
    const t = e.target as HTMLElement
    const playBtn = t.closest<HTMLElement>('[data-play]')
    const ren = t.closest<HTMLElement>('[data-rename]')
    const del = t.closest<HTMLElement>('[data-delete]')
    if (del) {
      const id = del.dataset.delete!
      twoTap(del, `del:${id}`, `${TRASH}<span>Sure?</span>`, () => ctx.sendToBackend({ type: 'delete_wrap', id }))
    } else if (ren) {
      const id = ren.dataset.rename!
      const item = ren.closest('.lw-libitem')!
      const w = library.find(x => x.id === id)
      item.innerHTML = `<form class="lw-rename"><input type="text" maxlength="80" value="${esc(w?.title || '')}"><button class="lw-ghost lw-small" type="submit">Save</button><button class="lw-ghost lw-small" type="button" data-cancel>Cancel</button></form>`
      const input = item.querySelector('input')!
      input.focus()
      input.select()
      item.querySelector('form')!.addEventListener('submit', ev => {
        ev.preventDefault()
        if (input.value.trim()) ctx.sendToBackend({ type: 'rename_wrap', id, title: input.value })
        else renderLibrary()
      })
      item.querySelector('[data-cancel]')!.addEventListener('click', renderLibrary)
    } else if (playBtn) {
      ctx.sendToBackend({ type: 'get_wrap', id: playBtn.dataset.play, play: true })
    }
  })
  el.deleteAll.addEventListener('click', () => {
    twoTap(el.deleteAll, 'del:all', `Tap again to delete all ${library.length}`, () => ctx.sendToBackend({ type: 'delete_all_wraps' }))
  })

  // slides editor
  el.slides.addEventListener('click', e => {
    const t = e.target as HTMLElement
    const up = t.closest<HTMLElement>('[data-up]')
    const down = t.closest<HTMLElement>('[data-down]')
    const i = Number(up?.dataset.up ?? down?.dataset.down)
    if (!Number.isInteger(i)) return
    const j = up ? i - 1 : i + 1
    if (j < 0 || j >= slidesDraft.length) return
    ;[slidesDraft[i], slidesDraft[j]] = [slidesDraft[j], slidesDraft[i]]
    renderSlides()
  })
  el.slides.addEventListener('input', e => {
    const t = e.target as HTMLInputElement
    if (t.dataset.title) slidesDraft[Number(t.dataset.title)].title = t.value
    if (t.dataset.prompt) slidesDraft[Number(t.dataset.prompt)].prompt = t.value
  })
  el.slides.addEventListener('change', e => {
    const t = e.target as HTMLInputElement
    if (!t.dataset.toggle) return
    slidesDraft[Number(t.dataset.toggle)].enabled = t.checked
    t.closest('.lw-slide-row')?.classList.toggle('off', !t.checked)
  })
  el.slidesSave.addEventListener('click', () => ctx.sendToBackend({ type: 'save_settings', settings: { slides: slidesDraft } }))
  el.slidesReset.addEventListener('click', () => twoTap(el.slidesReset, 'reset:slides', 'Sure?', () => ctx.sendToBackend({ type: 'reset_slides' })))

  // hosts editor
  el.hostEditors.addEventListener('click', e => {
    const t = e.target as HTMLElement
    const up = t.closest<HTMLElement>('[data-upload]')
    const rm = t.closest<HTMLElement>('[data-unsprite]')
    const reset = t.closest<HTMLElement>('[data-reset-host]')
    if (up) {
      uploadFor = up.dataset.upload!
      el.file.value = ''
      el.file.click()
    } else if (rm) {
      ctx.sendToBackend({ type: 'save_sprite', hostId: rm.dataset.unsprite, dataUrl: '' })
    } else if (reset) {
      const def = DEFAULT_HOSTS.find(h => h.id === reset.dataset.resetHost)
      const card = el.hostEditors.querySelector<HTMLElement>(`[data-host-editor="${reset.dataset.resetHost}"]`)
      if (!def || !card) return
      for (const f of ['name', 'emoji', 'accent', 'prompt'] as const) {
        const input = card.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[data-f="${f}"]`)
        if (input) input.value = def[f]
      }
    }
  })
  el.file.addEventListener('change', async () => {
    const file = el.file.files?.[0]
    if (!file || !uploadFor) return
    try {
      const dataUrl = await readImage(file)
      ctx.sendToBackend({ type: 'save_sprite', hostId: uploadFor, dataUrl })
    } catch (err: any) {
      hostsStatus(err?.message || 'That image did not work.')
    }
  })
  el.hostsSave.addEventListener('click', () => ctx.sendToBackend({ type: 'save_settings', settings: collectHosts() }))
  el.hostsReset.addEventListener('click', () => twoTap(el.hostsReset, 'reset:hosts', 'Sure?', () => ctx.sendToBackend({ type: 'reset_hosts' })))

  // settings
  el.sRefresh.addEventListener('click', () => ctx.sendToBackend({ type: 'init' }))
  el.sSave.addEventListener('click', () => {
    const optNum = (i: HTMLInputElement) => (i.value.trim() === '' ? null : Number(i.value))
    ctx.sendToBackend({
      type: 'save_settings',
      settings: {
        connectionId: el.sConn.value,
        noReasoning: el.sNoReason.checked,
        temperature: Number(el.sTemp.value),
        maxTokens: optNum(el.sMax),
        topP: optNum(el.sTopP),
        topK: optNum(el.sTopK),
        minP: optNum(el.sMinP),
        repetitionPenalty: optNum(el.sRep),
        frequencyPenalty: optNum(el.sFreq),
        presencePenalty: optNum(el.sPres),
        topCharCount: Number(el.sTopchars.value),
        chatsPerChar: Number(el.sPerchar.value),
        sampleCount: Number(el.sSample.value),
        slideSeconds: Number(el.sSecs.value),
        statsCommentary: el.sCommentary.checked,
      },
    })
  })

  // Reload when Lumiwrap's permissions change (e.g. granted after install).
  const offPerm = ctx.events.on('SPINDLE_PERMISSION_CHANGED', (payload: unknown) => {
    const d = payload as { extensionId?: string }
    if (!d?.extensionId || d.extensionId === ctx.manifest?.identifier) ctx.sendToBackend({ type: 'init' })
  })
  const offActivate = tab.onActivate(() => {
    if (!characters.length || missing.length) ctx.sendToBackend({ type: 'init' })
  })

  // ---------- backend messages ----------
  const unsub = ctx.onBackendMessage((msg: any) => {
    switch (msg?.type) {
      case 'init_data':
        settings = msg.settings
        characters = msg.characters || []
        connections = msg.connections || []
        sprites = msg.sprites || {}
        missing = msg.missing || []
        initErrors = msg.errors || []
        slidesDraft = (settings?.slides || DEFAULT_SLIDES).map(s => ({ ...s }))
        renderAll()
        break
      case 'settings_saved':
        settings = msg.settings
        slidesDraft = settings!.slides.map(s => ({ ...s }))
        renderSettings()
        renderSlides()
        renderHostEditors()
        renderHostPicker()
        refreshEstimate()
        break
      case 'sprites':
        sprites = msg.sprites || {}
        hostsStatus('')
        renderHostEditors()
        renderHostPicker()
        renderLibrary()
        break
      case 'progress':
        if (msg.stage === 'idle') {
          player?.setBusy('')
          busy = ''
          setProgress('')
          renderBusy()
        } else if (msg.stage === 'expose') {
          player?.setBusy(msg.text)
        } else {
          setProgress(msg.text, msg.done, msg.total)
        }
        break
      case 'scan_result':
        scan = { scanId: msg.scanId, stats: msg.stats, picked: msg.picked || [], depth: msg.depth, estimate: msg.estimate }
        selected = new Set(scan.picked.map(p => p.id))
        busy = ''
        setProgress('')
        renderResult()
        break
      case 'estimate':
        if (scan && msg.scanId === scan.scanId) {
          scan.estimate = msg.estimate
          renderEstimate()
        }
        break
      case 'wrap_ready':
        busy = ''
        setProgress('')
        renderBusy()
        play(msg.wrap as Wrap)
        break
      case 'wrap_data':
        if (msg.play) play(msg.wrap as Wrap)
        break
      case 'library':
        library = msg.wraps || []
        renderLibrary()
        break
      case 'wrap_deleted':
        if (player && playerWrapId === msg.id) player.close()
        break
      case 'expose_estimate': {
        if (!player || !pendingExpose || msg.chatId !== pendingExpose.chatId) break
        player.setBusy('')
        const ex = pendingExpose
        const cost = msg.cached ? `about ${fmt(msg.tokens)} tokens (this chat's summary is already cached)` : `about ${fmt(msg.tokens)} tokens to read the whole chat`
        player.ask(`Expose this chat? That's ${cost}.`, 'Expose me').then(ok => {
          if (ok) ctx.sendToBackend({ type: 'expose_run', wrapId: ex.wrapId, chatId: ex.chatId })
          pendingExpose = null
        })
        break
      }
      case 'expose_done':
        if (player && msg.wrap?.id === playerWrapId) player.updateWrap(msg.wrap, msg.slideIndex)
        break
      case 'error':
        if (msg.where === 'expose' && player) {
          player.setBusy('')
          player.ask(msg.message || 'Something went wrong.', 'OK')
          break
        }
        if (view === 'hosts') hostsStatus(msg.message || 'Something went wrong.')
        else setStatus(msg.message || 'Something went wrong.', 'error')
        setProgress('')
        busy = ''
        renderBusy()
        break
    }
  })

  setView('wrap')
  renderAll()
  ctx.sendToBackend({ type: 'init' })

  return () => {
    player?.close()
    armed.forEach(t => clearTimeout(t))
    offPerm()
    offActivate()
    unsub()
    removeStyle()
    tab.destroy()
  }
}
