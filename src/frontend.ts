import type { SpindleFrontendContext } from 'lumiverse-spindle-types'
import {
  DEFAULT_CHARACTER_HOST_PROMPT,
  DEFAULT_HOSTS,
  DEFAULT_SLIDES,
  fmt,
  type Depth,
  type Estimate,
  type PickedChat,
  type Scope,
  type Settings,
  type SlideDef,
  type Wrap,
  type WrapStats,
  type WrapSummary,
} from './shared'
import { STYLES } from './styles'
import { esc, openPlayer, type PlayerHandle } from './player'

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="9" width="17" height="11.5" rx="1.6"/><path d="M2.5 9h19V6.8a.8.8 0 0 0-.8-.8H3.3a.8.8 0 0 0-.8.8z"/><path d="M12 6v14.5"/><path d="M12 6c-1.2-2.6-4.6-3.4-5.2-1.6C6.2 6.2 9.6 6.4 12 6zM12 6c1.2-2.6 4.6-3.4 5.2-1.6.6 1.8-2.8 2-5.2 1.6z"/></svg>`

type View = 'wrap' | 'library' | 'slides' | 'hosts' | 'settings'

const DEPTH_INFO: Record<Depth, { label: string; hint: string }> = {
  stats: { label: 'Stats', hint: 'Counts everything on your machine. 0 tokens with built-in host lines.' },
  highlights: { label: 'Highlights + stats', hint: 'Adds a small sample from your top chats so the host can quote you. One small call.' },
  deep: { label: 'Deep + everything', hint: 'Adds a summary of each picked chat. Costs the most; summaries are cached for next time.' },
}

const NEEDS_LABEL: Record<Depth, string> = { stats: 'Stats', highlights: 'Highlights+', deep: 'Deep' }

function timeAgo(ts: number) {
  const s = Math.max(0, (Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return new Date(ts).toLocaleDateString()
}

export function setup(ctx: SpindleFrontendContext) {
  const removeStyle = ctx.dom.addStyle(STYLES)

  const tab = ctx.ui.registerDrawerTab({
    id: 'lumiwrap',
    title: 'Lumiwrap',
    shortName: 'Wrap',
    description: 'Your year in Lumiverse, wrapped',
    keywords: ['wrapped', 'recap', 'year', 'stats', 'christmas', 'new year', 'spotify'],
    iconSvg: ICON,
  })

  const root = tab.root
  const thisYear = new Date().getFullYear()

  root.innerHTML = `
    <div class="lw">
      <header class="lw-head">
        <span class="lw-logo">🎁</span>
        <div>
          <div class="lw-title">Lumiwrap</div>
          <div class="lw-tagline">your year, wrapped with a bow</div>
        </div>
      </header>

      <nav class="lw-nav">
        <button data-view="wrap" class="active">Wrap</button>
        <button data-view="library">Library</button>
        <button data-view="slides">Slides</button>
        <button data-view="hosts">Hosts</button>
        <button data-view="settings">Settings</button>
      </nav>

      <section data-panel="wrap">
        <div class="lw-card">
          <div class="lw-grid2">
            <label class="lw-field"><span>Year</span><input data-el="year" type="number" min="2020" max="2100" value="${thisYear}"></label>
            <label class="lw-field"><span>Wrap</span>
              <select data-el="scope"><option value="all">Everything</option><option value="character">One character</option></select>
            </label>
          </div>
          <label class="lw-field" data-el="char-wrap" hidden><span>Character</span><select data-el="char"></select></label>
        </div>

        <div class="lw-card">
          <div class="lw-card-title">How much to read</div>
          ${(['stats', 'highlights', 'deep'] as Depth[])
            .map(
              d => `<label class="lw-radio"><input type="radio" name="lw-depth" value="${d}"${d === 'stats' ? ' checked' : ''}> ${DEPTH_INFO[d].label}<small>${DEPTH_INFO[d].hint}</small></label>`,
            )
            .join('')}
        </div>

        <div class="lw-card">
          <div class="lw-card-title">Who reads it to you</div>
          <div class="lw-hosts" data-el="hosts"></div>
          <label class="lw-field" data-el="hostchar-wrap" hidden><span>Character host</span><select data-el="hostchar"></select></label>
        </div>

        <button class="lw-primary" data-el="scan">❄️ <span>Scan my year</span></button>
        <div class="lw-progress" data-el="progress" hidden><div class="lw-progress-text" data-el="progress-text"></div><div class="lw-progress-bar"><i data-el="progress-bar"></i></div></div>
        <div class="lw-status" data-el="status"></div>

        <div class="lw-card lw-result" data-el="result" hidden>
          <div class="lw-card-title">Found</div>
          <div class="lw-found" data-el="found"></div>
          <div data-el="picked-wrap">
            <div class="lw-card-title lw-mt">Chats it will read <small data-el="picked-hint"></small></div>
            <div class="lw-picked" data-el="picked"></div>
          </div>
          <label class="lw-check" data-el="commentary-wrap"><input type="checkbox" data-el="commentary"> Let the host write her own lines (one small call)</label>
          <div class="lw-cost">
            <div class="lw-cost-big" data-el="cost-big">–</div>
            <div class="lw-hint" data-el="cost-detail"></div>
          </div>
          <button class="lw-primary" data-el="go">🎁 <span>Wrap it!</span></button>
        </div>
      </section>

      <section data-panel="library" hidden>
        <div class="lw-card">
          <div class="lw-card-title">Your Lumiwraps</div>
          <p class="lw-hint">Replays are free. Open one and use Expose me on any chat it mentions.</p>
          <div class="lw-lib" data-el="lib"></div>
        </div>
      </section>

      <section data-panel="slides" hidden>
        <div class="lw-card">
          <div class="lw-card-title">Slides</div>
          <p class="lw-hint">Turn slides on or off, reorder them, and rewrite what the host is told for each one. Prompts are only used when the host writes her own lines. Macros: <code>{{user}}</code> <code>{{year}}</code> <code>{{nextYear}}</code> <code>{{top1}}</code> <code>{{words}}</code> and more.</p>
          <div class="lw-slides" data-el="slides"></div>
          <div class="lw-row">
            <button class="lw-primary lw-slim lw-grow" data-el="slides-save">Save slides</button>
            <button class="lw-ghost" data-el="slides-reset">Reset</button>
          </div>
        </div>
      </section>

      <section data-panel="hosts" hidden>
        <div data-el="host-editors"></div>
        <div class="lw-card">
          <div class="lw-card-title">Character host add-on</div>
          <p class="lw-hint">Added when a character from your library hosts, so they stay in character. Macros: <code>{{char}}</code> <code>{{user}}</code> <code>{{year}}</code>.</p>
          <textarea data-el="charprompt" rows="7"></textarea>
        </div>
        <div class="lw-row">
          <button class="lw-primary lw-slim lw-grow" data-el="hosts-save">Save hosts</button>
          <button class="lw-ghost" data-el="hosts-reset">Reset all</button>
        </div>
      </section>

      <section data-panel="settings" hidden>
        <div class="lw-card">
          <label class="lw-field"><span>Connection</span><select data-el="s-conn"></select></label>
          <p class="lw-hint">Point this at your sidecar or a cheap model to keep costs down.</p>
          <div class="lw-grid2">
            <label class="lw-field"><span>Temperature</span><input data-el="s-temp" type="number" min="0" max="2" step="0.05"></label>
            <label class="lw-field"><span>Seconds per slide</span><input data-el="s-secs" type="number" min="3" max="30"></label>
          </div>
        </div>
        <div class="lw-card">
          <div class="lw-card-title">What gets picked</div>
          <p class="lw-hint">Highlights and Deep read the characters with the most chats, then each one's chats with the most messages.</p>
          <div class="lw-grid2">
            <label class="lw-field"><span>Top characters</span><input data-el="s-topchars" type="number" min="1" max="10"></label>
            <label class="lw-field"><span>Chats per character</span><input data-el="s-perchar" type="number" min="1" max="10"></label>
          </div>
          <label class="lw-field"><span>Messages sampled per chat (Highlights)</span><input data-el="s-sample" type="number" min="4" max="60"></label>
        </div>
        <div class="lw-card">
          <label class="lw-check"><input data-el="s-commentary" type="checkbox"> In Stats mode, let the host write her own lines</label>
          <label class="lw-check"><input data-el="s-spotify" type="checkbox"> Show what's playing on Spotify (needs Spotify Controls)</label>
        </div>
        <button class="lw-primary lw-slim" data-el="s-save">Save settings</button>
      </section>
    </div>
  `

  const $ = <T extends HTMLElement = HTMLElement>(name: string) => root.querySelector(`[data-el="${name}"]`) as T
  const el = {
    year: $<HTMLInputElement>('year'),
    scope: $<HTMLSelectElement>('scope'),
    charWrap: $('char-wrap'),
    char: $<HTMLSelectElement>('char'),
    hosts: $('hosts'),
    hostcharWrap: $('hostchar-wrap'),
    hostchar: $<HTMLSelectElement>('hostchar'),
    scan: $<HTMLButtonElement>('scan'),
    progress: $('progress'),
    progressText: $('progress-text'),
    progressBar: $('progress-bar'),
    status: $('status'),
    result: $('result'),
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
    slides: $('slides'),
    slidesSave: $<HTMLButtonElement>('slides-save'),
    slidesReset: $<HTMLButtonElement>('slides-reset'),
    hostEditors: $('host-editors'),
    charprompt: $<HTMLTextAreaElement>('charprompt'),
    hostsSave: $<HTMLButtonElement>('hosts-save'),
    hostsReset: $<HTMLButtonElement>('hosts-reset'),
    sConn: $<HTMLSelectElement>('s-conn'),
    sTemp: $<HTMLInputElement>('s-temp'),
    sSecs: $<HTMLInputElement>('s-secs'),
    sTopchars: $<HTMLInputElement>('s-topchars'),
    sPerchar: $<HTMLInputElement>('s-perchar'),
    sSample: $<HTMLInputElement>('s-sample'),
    sCommentary: $<HTMLInputElement>('s-commentary'),
    sSpotify: $<HTMLInputElement>('s-spotify'),
    sSave: $<HTMLButtonElement>('s-save'),
  }
  const depthRadios = Array.from(root.querySelectorAll<HTMLInputElement>('input[name="lw-depth"]'))

  // ---------- state ----------
  let settings: Settings | null = null
  let characters: Array<{ id: string; name: string; avatar: string | null }> = []
  let hostRef = 'past'
  let busy = ''
  let scan: { scanId: string; stats: WrapStats; picked: PickedChat[]; depth: Depth; estimate: Estimate } | null = null
  let selected = new Set<string>()
  let library: WrapSummary[] = []
  let slidesDraft: SlideDef[] = []
  let player: PlayerHandle | null = null
  let playerWrapId = ''
  let pendingExpose: { wrapId: string; chatId: string } | null = null

  const depth = (): Depth => (depthRadios.find(r => r.checked)?.value as Depth) || 'stats'

  // ---------- rendering ----------
  function setView(v: View) {
    root.querySelectorAll<HTMLButtonElement>('.lw-nav button').forEach(b => b.classList.toggle('active', b.dataset.view === v))
    root.querySelectorAll<HTMLElement>('[data-panel]').forEach(p => (p.hidden = p.dataset.panel !== v))
    if (v === 'library') ctx.sendToBackend({ type: 'list_wraps' })
  }

  function renderCharacterSelects() {
    const opts = characters.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')
    const keepChar = el.char.value
    const keepHost = el.hostchar.value
    el.char.innerHTML = opts || `<option value="">No characters yet</option>`
    el.hostchar.innerHTML = opts || `<option value="">No characters yet</option>`
    if (keepChar) el.char.value = keepChar
    if (keepHost) el.hostchar.value = keepHost
  }

  function renderHostPicker() {
    const hosts = settings?.hosts || DEFAULT_HOSTS
    el.hosts.innerHTML =
      hosts
        .map(
          h => `<button class="lw-host-tile${hostRef === h.id ? ' on' : ''}" data-host="${h.id}" style="--tile:${esc(h.accent)}">
            <span class="lw-tile-art">${h.sprite ? `<img src="${esc(h.sprite)}" alt="">` : esc(h.emoji)}</span>
            <span class="lw-tile-name">${esc(h.name)}</span><span class="lw-tile-sub">${esc(h.title)}</span></button>`,
        )
        .join('') +
      `<button class="lw-host-tile${hostRef.startsWith('char:') ? ' on' : ''}" data-host="char" style="--tile:#e7c46a">
        <span class="lw-tile-art">🎁</span><span class="lw-tile-name">A character</span><span class="lw-tile-sub">from your library</span></button>`
    el.hostcharWrap.hidden = !hostRef.startsWith('char:')
  }

  function currentHostRef() {
    if (hostRef.startsWith('char:')) return el.hostchar.value ? `char:${el.hostchar.value}` : ''
    return hostRef
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
    const t = scan.stats.totals
    el.found.innerHTML = `<b>${fmt(t.messages)}</b> messages · <b>${fmt(t.chats)}</b> chats · <b>${fmt(t.characters)}</b> characters in ${scan.stats.year}${scan.stats.scope === 'character' ? ` with ${esc(scan.stats.scopeName)}` : ''}`

    el.pickedWrap.hidden = scan.depth === 'stats'
    el.pickedHint.textContent = scan.depth === 'deep' ? '(tokens to read each one)' : '(tokens for each sample)'
    el.picked.innerHTML = scan.picked.length
      ? scan.picked
          .map(p => {
            const cost = scan!.depth === 'deep' ? (p.deepCached ? 'cached · free' : `≈ ${fmt(p.chatTokens)}`) : `≈ ${fmt(p.sampleTokens)}`
            return `<label class="lw-pick"><input type="checkbox" data-pick="${esc(p.id)}"${selected.has(p.id) ? ' checked' : ''}>
              <span class="lw-pick-text"><b>${esc(p.name)}</b><small>${esc(p.characterName)} · ${fmt(p.messages)} msgs</small></span>
              <span class="lw-pick-cost${p.deepCached && scan!.depth === 'deep' ? ' free' : ''}">${cost}</span></label>`
          })
          .join('')
      : `<div class="lw-hint">No chats to read.</div>`

    const charHost = currentHostRef().startsWith('char:')
    el.commentaryWrap.hidden = scan.depth !== 'stats' || charHost
    el.commentary.checked = !!settings?.statsCommentary
    renderEstimate()
    renderBusy()
  }

  function renderEstimate() {
    if (!scan) return
    const e = scan.estimate
    if (e.free) {
      el.costBig.innerHTML = `Free <small>0 tokens</small>`
      el.costDetail.textContent = 'Built-in host lines, nothing is sent to a model.'
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
    el.lib.innerHTML = library.length
      ? library
          .map(
            w => `<div class="lw-libitem">
              <span class="lw-lib-emoji">${esc(w.hostEmoji || '🎁')}</span>
              <div class="lw-lib-text"><b>${esc(w.title)}</b><small>${esc(DEPTH_INFO[w.depth]?.label || w.depth)} · ${esc(timeAgo(w.createdAt))}</small></div>
              <div class="lw-lib-actions">
                <button class="lw-ghost lw-small" data-play="${esc(w.id)}">▶ Play</button>
                <button class="lw-ghost lw-small" data-rename="${esc(w.id)}">Rename</button>
                <button class="lw-ghost lw-small lw-ghost-danger" data-delete="${esc(w.id)}">Delete</button>
              </div></div>`,
          )
          .join('')
      : `<div class="lw-hint">No Lumiwraps yet. Scan your year to make one.</div>`
  }

  function renderSlides() {
    el.slides.innerHTML = slidesDraft
      .map(
        (s, i) => `<div class="lw-slide-row${s.enabled ? '' : ' off'}" data-i="${i}">
          <div class="lw-slide-head">
            <label class="lw-switch"><input type="checkbox" data-toggle="${i}"${s.enabled ? ' checked' : ''}><i></i></label>
            <input type="text" class="lw-slide-title" data-title="${i}" value="${esc(s.title)}" maxlength="60">
            <span class="lw-badge lw-badge-${s.needs}">${NEEDS_LABEL[s.needs]}</span>
            <button class="lw-icon" data-up="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Move up">▲</button>
            <button class="lw-icon" data-down="${i}" ${i === slidesDraft.length - 1 ? 'disabled' : ''} aria-label="Move down">▼</button>
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
        h => `<div class="lw-card" data-host-editor="${h.id}" style="--tile:${esc(h.accent)}">
          <div class="lw-host-ed-head"><span class="lw-tile-art">${h.sprite ? `<img src="${esc(h.sprite)}" alt="">` : esc(h.emoji)}</span>
            <div><div class="lw-card-title">${esc(h.title)}</div><small class="lw-hint">${esc(h.name)}</small></div></div>
          <div class="lw-grid2">
            <label class="lw-field"><span>Name</span><input type="text" data-f="name" maxlength="40" value="${esc(h.name)}"></label>
            <label class="lw-field"><span>Placeholder emoji</span><input type="text" data-f="emoji" maxlength="8" value="${esc(h.emoji)}"></label>
          </div>
          <div class="lw-grid2">
            <label class="lw-field"><span>Sprite image URL</span><input type="text" data-f="sprite" placeholder="https://... (optional)" value="${esc(h.sprite)}"></label>
            <label class="lw-field"><span>Accent</span><input type="color" data-f="accent" value="${esc(h.accent)}"></label>
          </div>
          <label class="lw-field"><span>Personality prompt</span><textarea rows="8" data-f="prompt">${esc(h.prompt)}</textarea></label>
          <button class="lw-ghost lw-small" data-reset-host="${h.id}">Reset ${esc(h.title)}</button>
        </div>`,
      )
      .join('')
    el.charprompt.value = settings?.characterHostPrompt || DEFAULT_CHARACTER_HOST_PROMPT
  }

  function renderSettings(connections?: Array<{ id: string; name: string; provider: string; model: string; isDefault: boolean }>) {
    if (!settings) return
    if (connections) {
      el.sConn.innerHTML =
        `<option value="">Use my default connection</option>` +
        connections.map(c => `<option value="${esc(c.id)}">${esc(c.name)}${c.isDefault ? ' (default)' : ''} · ${esc(c.model || c.provider)}</option>`).join('')
    }
    el.sConn.value = settings.connectionId
    el.sTemp.value = String(settings.temperature)
    el.sSecs.value = String(settings.slideSeconds)
    el.sTopchars.value = String(settings.topCharCount)
    el.sPerchar.value = String(settings.chatsPerChar)
    el.sSample.value = String(settings.sampleCount)
    el.sCommentary.checked = settings.statsCommentary
    el.sSpotify.checked = settings.showSpotify
  }

  function collectHosts() {
    const hosts = (settings?.hosts || DEFAULT_HOSTS).map(h => {
      const card = el.hostEditors.querySelector<HTMLElement>(`[data-host-editor="${h.id}"]`)
      if (!card) return h
      const v = (f: string) => (card.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[data-f="${f}"]`)?.value || '').trim()
      return { ...h, name: v('name') || h.name, emoji: v('emoji') || h.emoji, sprite: v('sprite'), accent: v('accent') || h.accent, prompt: v('prompt') || h.prompt }
    })
    return { hosts, characterHostPrompt: el.charprompt.value.trim() || DEFAULT_CHARACTER_HOST_PROMPT }
  }

  // ---------- player ----------
  function play(wrap: Wrap, startAt = 0) {
    player?.close()
    playerWrapId = wrap.id
    player = openPlayer(ctx, wrap, {
      slideSeconds: settings?.slideSeconds || 8,
      showSpotify: settings?.showSpotify ?? true,
      startAt,
      onExpose: chatId => {
        pendingExpose = { wrapId: wrap.id, chatId }
        player?.setBusy('Checking the receipts...')
        ctx.sendToBackend({ type: 'expose_estimate', wrapId: playerWrapId, chatId })
      },
      onNowPlaying: () => ctx.sendToBackend({ type: 'now_playing' }),
      onClose: () => {
        player = null
        playerWrapId = ''
      },
    })
  }

  // ---------- events ----------
  root.querySelectorAll<HTMLButtonElement>('.lw-nav button').forEach(b => b.addEventListener('click', () => setView(b.dataset.view as View)))

  el.scope.addEventListener('change', () => {
    el.charWrap.hidden = el.scope.value !== 'character'
    invalidateScan('Scope changed. Scan again to update.')
  })
  el.char.addEventListener('change', () => invalidateScan('Character changed. Scan again to update.'))
  el.year.addEventListener('change', () => invalidateScan('Year changed. Scan again to update.'))
  depthRadios.forEach(r => r.addEventListener('change', () => invalidateScan('Scan level changed. Scan again to see what it will read.')))

  el.hosts.addEventListener('click', e => {
    const tile = (e.target as HTMLElement).closest<HTMLElement>('[data-host]')
    if (!tile) return
    hostRef = tile.dataset.host === 'char' ? `char:${el.hostchar.value}` : tile.dataset.host!
    renderHostPicker()
    refreshEstimate()
  })
  el.hostchar.addEventListener('change', () => {
    if (hostRef.startsWith('char:')) hostRef = `char:${el.hostchar.value}`
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
    if (el.scope.value === 'character' && !el.char.value) return setStatus('Pick a character to wrap.', 'error')
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
        scope: el.scope.value as Scope,
        characterId: el.char.value,
        depth: depth(),
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

  el.lib.addEventListener('click', async e => {
    const t = e.target as HTMLElement
    const playBtn = t.closest<HTMLElement>('[data-play]')
    const ren = t.closest<HTMLElement>('[data-rename]')
    const del = t.closest<HTMLElement>('[data-delete]')
    if (playBtn) ctx.sendToBackend({ type: 'get_wrap', id: playBtn.dataset.play, play: true })
    else if (ren) {
      const w = library.find(x => x.id === ren.dataset.rename)
      const title = prompt('Rename this Lumiwrap', w?.title || '')
      if (title?.trim()) ctx.sendToBackend({ type: 'rename_wrap', id: ren.dataset.rename, title })
    } else if (del) {
      const { confirmed } = await ctx.ui.showConfirm({ title: 'Delete Lumiwrap', message: 'Delete this Lumiwrap? This cannot be undone.', variant: 'danger', confirmLabel: 'Delete' })
      if (confirmed) ctx.sendToBackend({ type: 'delete_wrap', id: del.dataset.delete })
    }
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
    if (t.dataset.toggle) {
      slidesDraft[Number(t.dataset.toggle)].enabled = t.checked
      t.closest('.lw-slide-row')?.classList.toggle('off', !t.checked)
    }
  })
  el.slidesSave.addEventListener('click', () => ctx.sendToBackend({ type: 'save_settings', settings: { slides: slidesDraft } }))
  el.slidesReset.addEventListener('click', async () => {
    const { confirmed } = await ctx.ui.showConfirm({ title: 'Reset slides', message: 'Put every slide back to its default title, prompt, order and switch?', variant: 'warning', confirmLabel: 'Reset' })
    if (confirmed) ctx.sendToBackend({ type: 'reset_slides' })
  })

  // hosts editor
  el.hostEditors.addEventListener('click', e => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-reset-host]')
    if (!btn || !settings) return
    const def = DEFAULT_HOSTS.find(h => h.id === btn.dataset.resetHost)
    const card = el.hostEditors.querySelector<HTMLElement>(`[data-host-editor="${btn.dataset.resetHost}"]`)
    if (!def || !card) return
    for (const f of ['name', 'emoji', 'sprite', 'accent', 'prompt'] as const) {
      const input = card.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[data-f="${f}"]`)
      if (input) input.value = def[f]
    }
  })
  el.hostsSave.addEventListener('click', () => ctx.sendToBackend({ type: 'save_settings', settings: collectHosts() }))
  el.hostsReset.addEventListener('click', async () => {
    const { confirmed } = await ctx.ui.showConfirm({ title: 'Reset hosts', message: 'Put all three hosts and the character add-on back to their defaults?', variant: 'warning', confirmLabel: 'Reset' })
    if (confirmed) ctx.sendToBackend({ type: 'reset_hosts' })
  })

  // settings
  el.sSave.addEventListener('click', () => {
    ctx.sendToBackend({
      type: 'save_settings',
      settings: {
        connectionId: el.sConn.value,
        temperature: Number(el.sTemp.value),
        slideSeconds: Number(el.sSecs.value),
        topCharCount: Number(el.sTopchars.value),
        chatsPerChar: Number(el.sPerchar.value),
        sampleCount: Number(el.sSample.value),
        statsCommentary: el.sCommentary.checked,
        showSpotify: el.sSpotify.checked,
      },
    })
  })

  // ---------- backend messages ----------
  const unsub = ctx.onBackendMessage((msg: any) => {
    switch (msg?.type) {
      case 'init_data':
        settings = msg.settings
        characters = msg.characters || []
        slidesDraft = (settings?.slides || DEFAULT_SLIDES).map(s => ({ ...s }))
        renderCharacterSelects()
        renderHostPicker()
        renderSettings(msg.connections || [])
        renderSlides()
        renderHostEditors()
        break
      case 'settings_saved': {
        settings = msg.settings
        slidesDraft = settings!.slides.map(s => ({ ...s }))
        renderSettings()
        renderSlides()
        renderHostEditors()
        renderHostPicker()
        refreshEstimate()
        break
      }
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
      case 'now_playing':
        player?.setNowPlaying(msg.text)
        break
      case 'error':
        if (msg.where === 'expose' && player) {
          player.setBusy('')
          player.ask(msg.message || 'Something went wrong.', 'OK')
          break
        }
        setStatus(msg.message || 'Something went wrong.', 'error')
        setProgress('')
        busy = ''
        renderBusy()
        break
    }
  })

  setView('wrap')
  renderHostPicker()
  renderBusy()
  ctx.sendToBackend({ type: 'init' })

  return () => {
    player?.close()
    unsub()
    removeStyle()
    tab.destroy()
  }
}
