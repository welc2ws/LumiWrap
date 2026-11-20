// The full-screen Wrapped player and the shareable summary card.

import type { SpindleFrontendContext } from 'lumiverse-spindle-types'
import { fmt, hourLabel, MONTHS, WEEKDAYS, type RenderedSlide, type Wrap } from './shared'

export interface PlayerOptions {
  slideSeconds: number
  /** Uploaded sprite for built-in hosts (data URL). */
  sprite?: string
  onExpose: (chatId: string) => void
  onClose?: () => void
  startAt?: number
}

export interface PlayerHandle {
  close(): void
  updateWrap(wrap: Wrap, jumpTo?: number): void
  setBusy(text: string): void
  /** An in-player confirm sheet, so host modals never end up hidden under the overlay. */
  ask(message: string, okLabel: string): Promise<boolean>
}

export function esc(s: unknown) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

function initials(name: string) {
  const letters = name.replace(/[^\p{L}\p{N} ]/gu, '').trim().split(/\s+/).map(w => w[0]).join('')
  return (letters || name.trim()[0] || '?').slice(0, 2).toUpperCase()
}

function hue(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return Math.abs(h) % 360
}

export function avatar(name: string, url: string | null, cls: string) {
  const h = hue(name)
  // Initials sit underneath, so a missing picture still looks fine.
  const img = url ? `<i class="lw-av-img" style="background-image:url('${esc(url)}')"></i>` : ''
  return `<div class="${cls}" style="background-color:hsl(${h} 45% 70%);color:hsl(${h} 50% 18%)">${esc(initials(name))}${img}</div>`
}

function menuLine(wrap: Wrap) {
  if (wrap.host.kind === 'character') return 'Want me to expose you? Pick a chat. I remember everything.'
  if (wrap.host.id === 'present') return "Pick one. I've been dying to— I mean. Whatever. Pick one."
  if (wrap.host.id === 'future') return 'Choose a chat. ...I already know which one you will pick.'
  return "Ooh, want me to spill?! Pick a chat and I'll tell EVERYONE. Well, just you!"
}

/** Theme per slide: pine, cranberry, midnight, gold, new-year night. */
const THEME: Record<string, string> = {
  intro: 'pine',
  totals: 'cranberry',
  top_characters: 'gold',
  number_one: 'pine',
  longest_chat: 'midnight',
  time: 'cranberry',
  streak: 'gold',
  rerolls: 'midnight',
  personas: 'pine',
  words: 'cranberry',
  quotes: 'midnight',
  story_arcs: 'pine',
  personality: 'gold',
  expose: 'cranberry',
  outro: 'nye',
}

const CHAT_SLIDES: Record<string, (w: Wrap) => string | undefined> = {
  longest_chat: w => w.stats.longestChat?.id,
  rerolls: w => w.stats.mostRerolledChat?.id,
}

export function openPlayer(ctx: SpindleFrontendContext, initial: Wrap, opts: PlayerOptions): PlayerHandle {
  let wrap = initial
  /** The wrap's slides plus the Expose me menu at the very end. */
  const menuSlide = (): RenderedSlide => ({ id: 'expose_menu', title: 'Expose me', text: menuLine(wrap) })
  let slides: RenderedSlide[] = [...wrap.slides, menuSlide()]
  let index = Math.max(0, Math.min(opts.startAt || 0, slides.length - 1))
  if (opts.startAt === undefined) index = 0
  let paused = false
  let elapsed = 0
  let duration = 8000
  let lastTick = 0
  let raf = 0
  let typeTimer: ReturnType<typeof setInterval> | null = null
  let closed = false
  let cardUrl = ''

  // Mount: a body-level overlay when allowed, a modal otherwise.
  let mount: { root: HTMLElement; destroy(): void } | null = null
  let inModal = false
  try {
    const m = ctx.ui.mountApp({ className: 'lw-mount', position: 'end' })
    mount = { root: m.root, destroy: () => m.destroy() }
  } catch {
    const modal = ctx.ui.showModal({ title: `Lumiwrap ${wrap.year}`, width: 460, maxHeight: 900, persistent: true })
    mount = { root: modal.root, destroy: () => modal.dismiss() }
    inModal = true
    modal.onDismiss(() => {
      if (!closed) close()
    })
  }
  const root = mount.root

  const snow = Array.from({ length: 36 }, () => {
    const size = 2 + Math.random() * 5
    return `<i style="left:${Math.random() * 100}%;width:${size}px;height:${size}px;animation-duration:${6 + Math.random() * 8}s;animation-delay:-${Math.random() * 12}s;opacity:${0.35 + Math.random() * 0.6}"></i>`
  }).join('')

  root.innerHTML = `
    <div class="lw-player${inModal ? ' lw-in-modal' : ''}" tabindex="-1">
      <div class="lw-backdrop" data-p="backdrop"></div>
      <div class="lw-stage" data-p="stage">
        <div class="lw-snow" aria-hidden="true">${snow}</div>
        <div class="lw-bars" data-p="bars"></div>
        <div class="lw-topbar">
          <div class="lw-brand">✦ Lumiwrap <span data-p="year"></span></div>
          <div class="lw-spacer"></div>
          <button class="lw-x" data-p="pause" aria-label="Pause">❚❚</button>
          <button class="lw-x" data-p="close" aria-label="Close">✕</button>
        </div>
        <div class="lw-slide" data-p="slide"></div>
        <div class="lw-host" data-p="host">
          <div class="lw-sprite" data-p="sprite"></div>
          <div class="lw-bubble"><div class="lw-host-name" data-p="hname"></div><div class="lw-say" data-p="say"></div></div>
        </div>
        <div class="lw-busy" data-p="busy" hidden></div>
        <div class="lw-sheet" data-p="sheet" hidden></div>
        <button class="lw-tap lw-tap-l" data-p="prev" aria-label="Previous"></button>
        <button class="lw-tap lw-tap-r" data-p="next" aria-label="Next"></button>
      </div>
    </div>`

  const $ = (n: string) => root.querySelector(`[data-p="${n}"]`) as HTMLElement
  const el = {
    player: root.querySelector('.lw-player') as HTMLElement,
    stage: $('stage'),
    bars: $('bars'),
    year: $('year'),
    pause: $('pause'),
    close: $('close'),
    slide: $('slide'),
    host: $('host'),
    sprite: $('sprite'),
    hname: $('hname'),
    say: $('say'),
    busy: $('busy'),
    prev: $('prev'),
    next: $('next'),
    backdrop: $('backdrop'),
    sheet: $('sheet'),
  }

  function renderBars() {
    el.bars.innerHTML = slides.map((_, i) => `<span><b style="width:${i < index ? 100 : 0}%"></b></span>`).join('')
  }

  function setBar(pct: number) {
    const bars = el.bars.querySelectorAll<HTMLElement>('b')
    bars.forEach((b, i) => (b.style.width = `${i < index ? 100 : i === index ? pct : 0}%`))
  }

  function renderHost() {
    const h = wrap.host
    el.stage.style.setProperty('--lw-accent', h.accent || '#e7c46a')
    el.hname.textContent = h.name
    const sprite = h.kind === 'builtin' ? opts.sprite || '' : h.sprite
    el.sprite.classList.toggle('lw-sprite-pfp', h.kind === 'character' && !!sprite)
    el.sprite.innerHTML = sprite
      ? `<img src="${esc(sprite)}" alt="${esc(h.name)}">`
      : `<span>${esc(h.emoji || '🎄')}</span>`
    el.year.textContent = String(wrap.year)
  }

  function typeText(text: string) {
    if (typeTimer) clearInterval(typeTimer)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      el.say.textContent = text
      return
    }
    let i = 0
    el.say.textContent = ''
    typeTimer = setInterval(() => {
      if (paused) return
      i += 2
      el.say.textContent = text.slice(0, i)
      if (i >= text.length && typeTimer) {
        clearInterval(typeTimer)
        typeTimer = null
      }
    }, 22)
  }

  function countUp(node: HTMLElement) {
    const target = Number(node.dataset.count) || 0
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 1300)
      const eased = 1 - Math.pow(1 - t, 3)
      node.textContent = fmt(target * eased)
      if (t < 1 && !closed) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  function show(i: number) {
    index = Math.max(0, Math.min(i, slides.length - 1))
    const slide = slides[index]
    elapsed = 0
    const words = (slide.text || '').split(/\s+/).length
    duration = Math.max(opts.slideSeconds * 1000, (words / 3.2 + 2.5) * 1000)
    el.stage.dataset.theme = THEME[slide.id] || 'pine'
    el.stage.dataset.slide = slide.id
    el.slide.innerHTML = slideHtml(slide)
    el.slide.classList.remove('lw-enter')
    void el.slide.offsetWidth
    el.slide.classList.add('lw-enter')
    el.slide.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp)
    typeText(slide.text || '')
    renderBars()
    if (slide.id === 'outro') {
      drawCardPreview()
      runCountdown()
    }
  }

  let countdownTimers: ReturnType<typeof setTimeout>[] = []
  function runCountdown() {
    countdownTimers.forEach(clearTimeout)
    countdownTimers = []
    const node = root.querySelector<HTMLElement>('[data-p="countdown"]')
    if (!node) return
    const final = `Happy ${wrap.stats.year + 1}!`
    ;['3', '2', '1', final].forEach((txt, i) => {
      countdownTimers.push(
        setTimeout(() => {
          node.textContent = txt
          node.classList.remove('pop')
          void node.offsetWidth
          node.classList.add('pop')
          if (txt === final) el.stage.classList.add('lw-boom')
        }, i * 800),
      )
    })
    el.stage.classList.remove('lw-boom')
  }

  function slideHtml(slide: RenderedSlide): string {
    const s = wrap.stats
    const t = s.totals
    const title = `<div class="lw-kicker">${esc(slide.title)}</div>`

    switch (slide.id) {
      case 'intro':
        return `${title}
          <div class="lw-gift">🎁</div>
          <div class="lw-huge">Your ${s.year}<br><span class="lw-gold">Lumiwrap</span></div>
          <div class="lw-sub">${fmt(t.chats)} chats · ${fmt(t.characters)} characters${s.scope !== 'all' ? ` · just ${esc(s.scopeName)}` : ''}</div>`
      case 'totals':
        return `${title}
          <div class="lw-big" data-count="${t.userMessages}">0</div>
          <div class="lw-label">messages you sent</div>
          <div class="lw-row2">
            <div><div class="lw-mid" data-count="${t.userWords}">0</div><div class="lw-label">words written</div></div>
            <div><div class="lw-mid">${(t.userWords / 90000).toFixed(t.userWords >= 90000 ? 1 : 2)}</div><div class="lw-label">novels' worth</div></div>
          </div>`
      case 'top_characters': {
        const scoped = s.scope === 'character'
        const rows = scoped
          ? s.topChats.map((c, i) => `<li><span class="lw-rank">${i + 1}</span><div class="lw-li-text"><b>${esc(c.name)}</b><small>${fmt(c.messages)} messages</small></div></li>`)
          : s.topCharacters.map(
              (c, i) =>
                `<li><span class="lw-rank">${i + 1}</span>${avatar(c.name, c.avatar, 'lw-av')}<div class="lw-li-text"><b>${esc(c.name)}</b><small>${fmt(c.messages)} messages · ${c.chats} chat${c.chats === 1 ? '' : 's'}</small></div></li>`,
            )
        return `<div class="lw-kicker">${scoped ? 'Your top chats' : esc(slide.title)}</div><ol class="lw-list">${rows.join('')}</ol>`
      }
      case 'number_one': {
        const c = s.topCharacters[0]
        if (!c) return title
        const share = t.messages ? Math.round((c.messages / t.messages) * 100) : 0
        return `${title}
          ${avatar(c.name, c.avatar, 'lw-av-xl')}
          <div class="lw-huge">${esc(c.name)}</div>
          <div class="lw-chips"><span><b data-count="${c.messages}">0</b> messages</span><span><b>${c.chats}</b> chat${c.chats === 1 ? '' : 's'}</span><span><b>${share}%</b> of your year</span></div>`
      }
      case 'longest_chat': {
        const c = s.longestChat
        if (!c) return title
        return `${title}
          <div class="lw-quote-title">“${esc(c.name)}”</div>
          <div class="lw-sub">with ${esc(c.characterName)}</div>
          <div class="lw-big" data-count="${c.messages}">0</div><div class="lw-label">messages</div>`
      }
      case 'time': {
        const max = Math.max(1, ...s.months)
        const bars = s.months
          .map((n, i) => `<div class="lw-col${i === s.busiestMonth ? ' hot' : ''}"><i style="height:${Math.max(4, (n / max) * 100)}%"></i><small>${MONTHS[i][0]}</small></div>`)
          .join('')
        return `${title}
          <div class="lw-chart">${bars}</div>
          <div class="lw-chips"><span>📅 <b>${MONTHS[s.busiestMonth]}</b></span><span>🗓️ <b>${WEEKDAYS[s.busiestWeekday]}s</b></span><span>🕰️ <b>${hourLabel(s.busiestHour)}</b></span></div>
          <div class="lw-sub">🌙 ${s.nightOwlPct}% after midnight</div>`
      }
      case 'streak':
        return `${title}
          <div class="lw-candles">${'🕯️'.repeat(Math.min(7, Math.max(1, Math.ceil(s.streak.days / 5))))}</div>
          <div class="lw-big" data-count="${s.streak.days}">0</div><div class="lw-label">days in a row</div>
          <div class="lw-sub">${fmt(t.activeDays)} active days${s.busiestDay ? ` · busiest: ${esc(s.busiestDay.date)} (${s.busiestDay.messages})` : ''}</div>`
      case 'rerolls':
        return `${title}
          <div class="lw-dice">🎲</div>
          <div class="lw-big" data-count="${t.swipes}">0</div><div class="lw-label">rerolls</div>
          ${s.mostRerolledChat ? `<div class="lw-sub">most rerolled: “${esc(s.mostRerolledChat.name)}” with ${esc(s.mostRerolledChat.characterName)}</div>` : ''}
          ${s.mostSwipedMessage ? `<div class="lw-sub">one message had ${s.mostSwipedMessage.swipes} versions</div>` : ''}`
      case 'personas':
        return `${title}<ol class="lw-list">${s.personas
          .map((p, i) => `<li><span class="lw-rank">${i + 1}</span>${avatar(p.name, null, 'lw-av')}<div class="lw-li-text"><b>${esc(p.name)}</b><small>${fmt(p.messages)} messages</small></div></li>`)
          .join('')}</ol>`
      case 'words':
        return `${title}<ol class="lw-list lw-songs">${s.topWords
          .map((w, i) => `<li><span class="lw-rank">${i + 1}</span><div class="lw-li-text"><b>“${esc(w.word)}”</b><small>${fmt(w.count)} times</small></div></li>`)
          .join('')}</ol>
          ${s.theirWords[0] ? `<div class="lw-sub">they kept saying <b>“${esc(s.theirWords[0].word)}”</b></div>` : ''}`
      case 'quotes':
        return slide.quote
          ? `${title}<div class="lw-quote-mark">“</div><blockquote class="lw-quote">${esc(slide.quote)}</blockquote>${slide.quoteBy ? `<div class="lw-quote-by">— ${esc(slide.quoteBy)}</div>` : ''}`
          : `${title}<div class="lw-quote-mark">“</div>`
      case 'story_arcs':
        return `${title}<div class="lw-film">🎬</div><div class="lw-sub">previously, on your ${s.year}...</div>`
      case 'personality':
        return `${title}
          <div class="lw-star">⭐</div>
          <div class="lw-huge lw-gold">${esc(s.archetype.name)}</div>
          <div class="lw-sub">${esc(s.archetype.blurb)}</div>`
      case 'expose':
        return `<div class="lw-kicker">Exposed</div>
          <div class="lw-stamp">EXPOSED</div>
          <div class="lw-quote-title">“${esc(slide.chatName || '')}”</div>
          <div class="lw-sub">with ${esc(slide.characterName || '')}</div>`
      case 'expose_menu': {
        const done = new Set(wrap.slides.filter(x => x.id === 'expose').map(x => x.chatId || x.chatName))
        const list = wrap.chats
          .map(c => {
            const exposed = done.has(c.id) || done.has(c.name)
            const at = exposed ? wrap.slides.findIndex(x => x.id === 'expose' && (x.chatId === c.id || x.chatName === c.name)) : -1
            return `<button class="lw-menu-item${exposed ? ' done' : ''}" ${exposed ? `data-goto="${at}"` : `data-expose="${esc(c.id)}"`}>
              <span><b>“${esc(c.name)}”</b><small>${esc(c.characterName)}</small></span><i>${exposed ? 'read again' : 'expose'}</i></button>`
          })
          .join('')
        return `<div class="lw-kicker">Bonus round</div>
          <div class="lw-huge">Expose me</div>
          <div class="lw-sub">Pick a chat and get roasted for it. You'll see the cost first.</div>
          <div class="lw-menu">${list || '<div class="lw-sub">No chats to expose.</div>'}</div>`
      }
      case 'outro': {
        return `<div class="lw-fireworks" aria-hidden="true">${'<i></i>'.repeat(5)}</div>
          <div class="lw-kicker">${esc(slide.title)}</div>
          <div class="lw-countdown" data-p="countdown">Happy ${s.year + 1}!</div>
          <img class="lw-card-preview" data-p="cardimg" alt="Your Lumiwrap summary card">
          <div class="lw-actions">
            <button class="lw-btn" data-act="save">⬇ Save image</button>
            <button class="lw-btn lw-btn-ghost" data-act="replay">↺ Replay</button>
          </div>
          <button class="lw-next-hint" data-act="next">🔍 Expose me ›</button>`
      }
      default:
        return title
    }
  }

  // ---------- summary card ----------

  function drawCard(): HTMLCanvasElement {
    const W = 1080
    const H = 1920
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const g = c.getContext('2d')!
    const s = wrap.stats
    const accent = '#f3d27a'
    const font = (w: number, px: number) => `${w} ${px}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`

    const bg = g.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#0e3b2c')
    bg.addColorStop(0.55, '#0a2a20')
    bg.addColorStop(1, '#3a0d18')
    g.fillStyle = bg
    g.fillRect(0, 0, W, H)
    // snow
    for (let i = 0; i < 140; i++) {
      g.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.5})`
      g.beginPath()
      g.arc(Math.random() * W, Math.random() * H, 1.5 + Math.random() * 4, 0, Math.PI * 2)
      g.fill()
    }
    // border
    g.strokeStyle = accent
    g.lineWidth = 6
    g.strokeRect(40, 40, W - 80, H - 80)

    g.textAlign = 'center'
    g.fillStyle = accent
    g.font = font(700, 44)
    g.fillText('✦  L U M I W R A P  ✦', W / 2, 150)
    g.fillStyle = '#fff'
    g.font = font(900, 190)
    g.fillText(String(s.year), W / 2, 340)
    g.font = font(600, 40)
    g.fillStyle = 'rgba(255,255,255,.75)'
    g.fillText(clip(g, s.scope !== 'all' ? `with ${s.scopeName}` : "that's a wrap!", W - 200), W / 2, 410)

    // top list
    g.textAlign = 'left'
    g.fillStyle = accent
    g.font = font(800, 40)
    g.fillText(s.scope === 'character' ? 'TOP CHATS' : 'TOP CHARACTERS', 110, 530)
    const list = s.scope === 'character' ? s.topChats.map(x => ({ name: x.name, n: x.messages })) : s.topCharacters.map(x => ({ name: x.name, n: x.messages }))
    list.slice(0, 5).forEach((row, i) => {
      const y = 610 + i * 88
      g.fillStyle = accent
      g.font = font(900, 54)
      g.fillText(String(i + 1), 110, y)
      g.fillStyle = '#fff'
      g.font = font(700, 50)
      g.fillText(clip(g, row.name, 620), 180, y)
      g.textAlign = 'right'
      g.fillStyle = 'rgba(255,255,255,.65)'
      g.font = font(600, 36)
      g.fillText(`${fmt(row.n)} msgs`, W - 110, y)
      g.textAlign = 'left'
    })

    // stat grid
    const t = s.totals
    const cells: Array<[string, string]> = [
      ['MESSAGES', fmt(t.userMessages)],
      ['WORDS', fmt(t.userWords)],
      ['STREAK', `${s.streak.days} days`],
      ['REROLLS', fmt(t.swipes)],
      ['TOP WORD', s.topWords[0] ? `“${s.topWords[0].word}”` : '—'],
      ['PEAK HOUR', hourLabel(s.busiestHour)],
    ]
    cells.forEach(([label, value], i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = 110 + col * 440
      const y = 1130 + row * 170
      g.fillStyle = 'rgba(255,255,255,.6)'
      g.font = font(700, 32)
      g.fillText(label, x, y)
      g.fillStyle = '#fff'
      g.font = font(800, 58)
      g.fillText(clip(g, value, 400), x, y + 66)
    })

    // personality
    g.textAlign = 'center'
    g.fillStyle = 'rgba(255,255,255,.6)'
    g.font = font(700, 32)
    g.fillText('RP PERSONALITY', W / 2, 1650)
    g.fillStyle = accent
    g.font = font(900, 70)
    g.fillText(clip(g, s.archetype.name, W - 200), W / 2, 1735)
    g.fillStyle = 'rgba(255,255,255,.7)'
    g.font = font(600, 34)
    g.fillText(`wrapped by ${wrap.host.name} ${wrap.host.emoji || ''}`.trim(), W / 2, 1820)
    return c
  }

  function clip(g: CanvasRenderingContext2D, text: string, max: number) {
    if (g.measureText(text).width <= max) return text
    let t = text
    while (t.length > 1 && g.measureText(t + '…').width > max) t = t.slice(0, -1)
    return t + '…'
  }

  function drawCardPreview() {
    try {
      const canvas = drawCard()
      cardUrl = canvas.toDataURL('image/png')
      const img = root.querySelector<HTMLImageElement>('[data-p="cardimg"]')
      if (img) img.src = cardUrl
    } catch {
      /* canvas unavailable */
    }
  }

  function saveCard() {
    const canvas = drawCard()
    const name = `lumiwrap-${wrap.year}-${wrap.host.name}.png`.replace(/[^\w.-]+/g, '-')
    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 30_000)
    }, 'image/png')
  }

  // ---------- playback ----------

  function tick(now: number) {
    if (closed) return
    if (!lastTick) lastTick = now
    const dt = now - lastTick
    lastTick = now
    // Auto-advance stops at the outro; the extras after it are tap-only.
    const outroAt = slides.findIndex(x => x.id === 'outro')
    const last = index === slides.length - 1 || (outroAt >= 0 && index >= outroAt)
    if (!paused && !last) {
      elapsed += dt
      if (elapsed >= duration) next()
    }
    setBar(last ? 100 : Math.min(100, (elapsed / duration) * 100))
    raf = requestAnimationFrame(tick)
  }

  function next() {
    if (index < slides.length - 1) show(index + 1)
  }
  function prev() {
    show(index > 0 ? index - 1 : 0)
  }
  function setPaused(p: boolean) {
    paused = p
    el.pause.textContent = p ? '▶' : '❚❚'
    el.pause.setAttribute('aria-label', p ? 'Play' : 'Pause')
    el.stage.classList.toggle('lw-paused', p)
  }

  // Tap left/right; hold anywhere to pause.
  let holdTimer: ReturnType<typeof setTimeout> | null = null
  let held = false
  function bindTap(btn: HTMLElement, action: () => void) {
    btn.addEventListener('pointerdown', () => {
      held = false
      holdTimer = setTimeout(() => {
        held = true
        setPaused(true)
      }, 280)
    })
    const end = () => {
      if (holdTimer) clearTimeout(holdTimer)
      if (held) {
        held = false
        setPaused(false)
      }
    }
    btn.addEventListener('pointerup', end)
    btn.addEventListener('pointerleave', end)
    btn.addEventListener('click', () => {
      if (!held) action()
    })
  }
  bindTap(el.prev, prev)
  bindTap(el.next, next)

  el.pause.addEventListener('click', () => setPaused(!paused))
  el.close.addEventListener('click', () => close())
  el.backdrop.addEventListener('click', () => close())
  el.slide.addEventListener('click', e => {
    const t = e.target as HTMLElement
    const ex = t.closest<HTMLElement>('[data-expose]')
    const act = t.closest<HTMLElement>('[data-act]')
    if (ex) {
      setPaused(true)
      opts.onExpose(ex.dataset.expose!)
    } else if (act?.dataset.act === 'save') saveCard()
    else if (act?.dataset.act === 'replay') show(0)
    else if (act?.dataset.act === 'next') next()
    else if (t.closest('[data-goto]')) show(Number(t.closest<HTMLElement>('[data-goto]')!.dataset.goto))
  })

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') next()
    else if (e.key === 'ArrowLeft') prev()
    else if (e.key === 'Escape') close()
    else if (e.key === ' ') {
      e.preventDefault()
      setPaused(!paused)
    } else return
  }
  document.addEventListener('keydown', onKey)

  function close() {
    if (closed) return
    closed = true
    cancelAnimationFrame(raf)
    countdownTimers.forEach(clearTimeout)
    if (typeTimer) clearInterval(typeTimer)
    document.removeEventListener('keydown', onKey)
    try {
      mount?.destroy()
    } catch {
      /* already gone */
    }
    opts.onClose?.()
  }

  renderHost()
  show(index)
  raf = requestAnimationFrame(tick)
  el.player.focus()

  return {
    close,
    updateWrap(w, jumpTo) {
      wrap = w
      slides = [...wrap.slides, menuSlide()]
      renderHost()
      show(jumpTo ?? Math.min(index, slides.length - 1))
      setPaused(false)
    },
    ask(message, okLabel) {
      setPaused(true)
      el.sheet.hidden = false
      el.sheet.innerHTML = `<div class="lw-sheet-card"><p>${esc(message)}</p><div class="lw-actions"><button class="lw-btn" data-ok>${esc(okLabel)}</button><button class="lw-btn lw-btn-ghost" data-cancel>Cancel</button></div></div>`
      return new Promise(resolve => {
        const done = (v: boolean) => {
          el.sheet.hidden = true
          el.sheet.innerHTML = ''
          if (!v) setPaused(false)
          resolve(v)
        }
        el.sheet.querySelector('[data-ok]')!.addEventListener('click', () => done(true))
        el.sheet.querySelector('[data-cancel]')!.addEventListener('click', () => done(false))
      })
    },
    setBusy(text) {
      el.busy.hidden = !text
      el.busy.textContent = text
      if (text) setPaused(true)
    },
  }
}
