declare const spindle: import('lumiverse-spindle-types').SpindleAPI

import {
  DEFAULT_SETTINGS,
  fillMacros,
  fmt,
  hourLabel,
  MONTHS,
  normalizeSettings,
  statVars,
  WEEKDAYS,
  type ChatStat,
  type Depth,
  type Estimate,
  type Host,
  type PickedChat,
  type RenderedSlide,
  type ScanRequest,
  type Settings,
  type SlideDef,
  type Wrap,
  type WrapHost,
  type WrapStats,
  type WrapSummary,
} from './shared'
import { StatsBuilder, type MsgLite } from './stats'
import { BUILTIN_LINES } from './lines'
import { parseSlides, stripReasoning } from './parse'

// ---------- storage ----------

const SETTINGS_PATH = 'settings.json'
const wrapPath = (id: string) => `wraps/${id}.json`
const deepPath = (chatId: string) => `deep/${chatId}.json`

interface DeepCache {
  messageCount: number
  summary: string
}

async function loadSettings(userId: string): Promise<Settings> {
  const saved = await spindle.userStorage.getJson<Partial<Settings>>(SETTINGS_PATH, { fallback: {}, userId })
  return normalizeSettings(saved)
}

async function loadWrap(id: string, userId: string): Promise<Wrap | null> {
  const w = await spindle.userStorage.getJson<Wrap | null>(wrapPath(id), { fallback: null, userId }).catch(() => null)
  return w && w.id ? w : null
}

async function saveWrap(wrap: Wrap, userId: string) {
  await spindle.userStorage.setJson(wrapPath(wrap.id), wrap, { userId })
}

async function loadDeep(chatId: string, userId: string): Promise<DeepCache | null> {
  const d = await spindle.userStorage.getJson<DeepCache | null>(deepPath(chatId), { fallback: null, userId }).catch(() => null)
  return d && typeof d.summary === 'string' ? d : null
}

// ---------- helpers ----------

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function send(userId: string, payload: Record<string, unknown>) {
  spindle.sendToFrontend(payload, userId)
}

function clean(text: string, max = 500) {
  const t = (text || '').replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').trim()
  return t.length > max ? t.slice(0, max) + '…' : t
}

const DEPTH_RANK: Record<Depth, number> = { stats: 0, highlights: 1, deep: 2 }

interface FullMsg extends MsgLite {
  index: number
}

/** Lean read when the host supports it, full read otherwise. */
async function fetchMessages(chatId: string): Promise<FullMsg[]> {
  let raw: any[]
  try {
    raw = await spindle.chat.getMessages(chatId, { light: true, includeExtra: false })
  } catch {
    raw = await spindle.chat.getMessages(chatId)
  }
  return raw
    .filter(m => !m.hidden && m.role !== 'system' && typeof m.content === 'string' && m.content.trim())
    .map((m, i) => ({
      index: i,
      is_user: !!m.is_user,
      name: m.name || '',
      content: m.content,
      send_date: Number(m.send_date) || Number(m.created_at) || 0,
      swipeCount: Array.isArray(m.swipes) ? m.swipes.length : 1,
    }))
}

async function listAll<T>(fetchPage: (offset: number) => Promise<{ data: T[]; total: number }>, pageSize: number): Promise<T[]> {
  const out: T[] = []
  for (let offset = 0; offset < 20000; offset += pageSize) {
    const { data, total } = await fetchPage(offset)
    out.push(...data)
    if (!data.length || out.length >= total) break
  }
  return out
}

async function tokenOptions(settings: Settings, userId: string) {
  if (settings.connectionId) {
    const conn = await spindle.connections.get(settings.connectionId, userId).catch(() => null)
    if (conn?.model) return { model: conn.model }
  }
  return { modelSource: 'main' as const }
}

async function countText(text: string, opts: any): Promise<{ n: number; approximate: boolean; model: string }> {
  if (!text) return { n: 0, approximate: false, model: '' }
  try {
    const r = await spindle.tokens.countText(text, opts)
    return { n: r.total_tokens, approximate: r.approximate, model: r.model }
  } catch {
    return { n: Math.ceil(text.length / 4), approximate: true, model: '' }
  }
}

function samplerParams(settings: Settings, temperature: number) {
  const p: Record<string, number> = { temperature }
  const set = (key: string, v: number | null) => {
    if (v !== null && v !== undefined) p[key] = v
  }
  set('max_tokens', settings.maxTokens)
  set('top_p', settings.topP)
  set('top_k', settings.topK)
  set('min_p', settings.minP)
  set('frequency_penalty', settings.frequencyPenalty)
  set('presence_penalty', settings.presencePenalty)
  set('repetition_penalty', settings.repetitionPenalty)
  return p
}

async function llm(userId: string, settings: Settings, system: string, prompt: string, temperature: number): Promise<string> {
  const input: any = {
    type: 'quiet',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
    parameters: samplerParams(settings, temperature),
    userId,
  }
  if (settings.connectionId) input.connection_id = settings.connectionId
  if (settings.noReasoning) input.reasoning = { source: 'off' }
  let full = ''
  for await (const chunk of spindle.generate.quietStream(input)) {
    const c: any = chunk
    if (c.type === 'token' && typeof c.token === 'string') full += c.token
    else if (c.type === 'done' && typeof c.content === 'string' && c.content.length >= full.length) full = c.content
  }
  return stripReasoning(full)
}

async function userDisplayName(userId: string, stats?: WrapStats) {
  const persona = await spindle.personas.getActive(userId).catch(() => null)
  return persona?.name || stats?.personas[0]?.name || 'you'
}

// ---------- scanning ----------

interface ScanSession {
  id: string
  req: ScanRequest
  stats: WrapStats
  picked: PickedChat[]
  samples: Map<string, string>
  userName: string
  host: WrapHost
  hostPrompt: string
  characterCard: string
}

const sessions = new Map<string, ScanSession>()
const busy = new Set<string>()

async function resolveHost(hostRef: string, settings: Settings, userId: string): Promise<{ host: WrapHost; prompt: string; card: string }> {
  if (hostRef.startsWith('char:')) {
    const c = await spindle.characters.get(hostRef.slice(5), userId).catch(() => null)
    if (!c) throw new Error('That host character no longer exists.')
    const card = [c.description, c.personality].filter(Boolean).map(t => clean(t, 1500)).join('\n\n')
    return {
      host: { kind: 'character', id: c.id, name: c.name, emoji: '🎁', sprite: c.avatar_url || '', accent: '#e7c46a', avatar: c.avatar_url || null },
      prompt: settings.characterHostPrompt,
      card,
    }
  }
  const h: Host = settings.hosts.find(x => x.id === hostRef) || settings.hosts[0]
  return {
    host: { kind: 'builtin', id: h.id, name: h.name, emoji: h.emoji, sprite: '', accent: h.accent, avatar: null },
    prompt: h.prompt,
    card: '',
  }
}

/** The host can change after a scan without rescanning. */
async function applyHost(session: ScanSession, hostRef: string, settings: Settings, userId: string) {
  const info = await resolveHost(hostRef, settings, userId)
  session.req.host = hostRef
  session.host = info.host
  session.hostPrompt = info.prompt
  session.characterCard = info.card
}

async function scan(req: ScanRequest, userId: string) {
  if (busy.has(userId)) return
  busy.add(userId)
  const progress = (text: string, done = 0, total = 0) => send(userId, { type: 'progress', stage: 'scan', text, done, total })
  try {
    const settings = await loadSettings(userId)
    const year = Math.round(Number(req.year)) || new Date().getFullYear()
    const depth: Depth = req.depth === 'deep' || req.depth === 'highlights' ? req.depth : 'stats'
    const tz = Number(req.tzOffset) || 0
    progress('Finding your characters...')

    const allChars = await listAll(o => spindle.characters.list({ limit: 200, offset: o, userId }), 200)
    const chars = req.scope === 'character' ? allChars.filter(c => c.id === req.characterId) : allChars
    if (req.scope === 'character' && !chars.length) throw new Error('Pick a character to wrap.')
    const personas = await listAll(o => spindle.personas.list({ limit: 200, offset: o, userId }), 200).catch(() => [])
    const scopeName = req.scope === 'character' ? chars[0].name : 'Everything'

    // Every chat that could have messages in this year.
    const yearStart = Date.UTC(year, 0, 1) / 1000 - 2 * 86400
    const yearEnd = Date.UTC(year + 1, 0, 1) / 1000 + 2 * 86400
    const toSec = (n: number) => (n > 1e12 ? n / 1000 : n)
    const jobs: Array<{ chat: any; char: any }> = []
    for (const char of chars) {
      const chats = await listAll(o => spindle.chats.list({ characterId: char.id, limit: 200, offset: o, userId }), 200)
      for (const chat of chats) {
        if (toSec(chat.updated_at || 0) && toSec(chat.updated_at) < yearStart) continue
        if (toSec(chat.created_at || 0) > yearEnd) continue
        jobs.push({ chat, char })
      }
    }

    const builder = new StatsBuilder(year, tz, req.scope === 'character' ? 'character' : 'all', scopeName, [
      ...allChars.map(c => c.name),
      ...personas.map(p => p.name),
    ])
    let done = 0
    for (const { chat, char } of jobs) {
      const msgs = await fetchMessages(chat.id).catch(() => [] as FullMsg[])
      builder.addChat(
        { id: chat.id, name: chat.name, characterId: char.id, characterName: char.name, avatar: char.avatar_url || null, created: chat.created_at },
        msgs,
      )
      done++
      if (done % 3 === 0 || done === jobs.length) progress(`Counting messages in ${jobs.length} chats...`, done, jobs.length)
    }

    const stats = builder.finish()
    if (!stats.totals.messages) throw new Error(`No messages found in ${year}${req.scope === 'character' ? ` with ${scopeName}` : ''}.`)

    // Pick chats: characters with the most chats, then each one's chats with the most messages.
    const picked: PickedChat[] = []
    const samples = new Map<string, string>()
    const userName = await userDisplayName(userId, stats)
    if (depth !== 'stats') {
      const ranked = builder.rankedCharacters().slice(0, req.scope === 'character' ? 1 : settings.topCharCount)
      const perChar = req.scope === 'character' ? Math.max(settings.chatsPerChar, 3) : settings.chatsPerChar
      const all = builder.chats()
      const candidates: ChatStat[] = []
      for (const c of ranked) {
        candidates.push(...all.filter(x => x.characterId === c.id).sort((a, b) => b.messages - a.messages).slice(0, perChar))
      }
      const opts = await tokenOptions(settings, userId)
      let i = 0
      for (const cs of candidates) {
        i++
        progress(`Measuring "${cs.name}"...`, i, candidates.length)
        const msgs = await fetchMessages(cs.id).catch(() => [] as FullMsg[])
        const sample = buildSample(msgs, cs.characterName, userName, settings.sampleCount, m => builder.inYear(m.send_date))
        samples.set(cs.id, sample)
        const sampleTokens = (await countText(sample, opts)).n
        let chatTokens = 0
        try {
          chatTokens = (await spindle.tokens.countChat(cs.id, opts)).total_tokens
        } catch {
          chatTokens = Math.ceil(msgs.reduce((a, m) => a + m.content.length, 0) / 4)
        }
        const cached = await loadDeep(cs.id, userId)
        picked.push({
          id: cs.id,
          name: cs.name,
          characterId: cs.characterId,
          characterName: cs.characterName,
          messages: cs.messages,
          chatTokens,
          sampleTokens,
          deepCached: !!cached && cached.messageCount === msgs.length,
        })
      }
    }

    const hostInfo = await resolveHost(req.host || 'past', settings, userId)
    const session: ScanSession = {
      id: uid(),
      req: { ...req, year, depth },
      stats,
      picked,
      samples,
      userName,
      host: hostInfo.host,
      hostPrompt: hostInfo.prompt,
      characterCard: hostInfo.card,
    }
    sessions.set(userId, session)
    const estimate = await estimateFor(session, picked.map(p => p.id), settings, userId)
    send(userId, { type: 'scan_result', scanId: session.id, stats, picked, estimate, depth, host: session.host })
  } catch (err: any) {
    send(userId, { type: 'error', where: 'scan', message: err?.message || String(err) })
  } finally {
    busy.delete(userId)
    send(userId, { type: 'progress', stage: 'idle' })
  }
}

/** Opening, closing, longest and most-rerolled moments, clipped. */
function buildSample(msgs: FullMsg[], charName: string, userName: string, count: number, keep: (m: FullMsg) => boolean) {
  const pool = msgs.filter(keep)
  if (!pool.length) return ''
  const pick = new Set<number>()
  const add = (list: FullMsg[], n: number) => {
    for (const m of list) {
      if (n <= 0 || pick.size >= count) break
      if (!pick.has(m.index)) {
        pick.add(m.index)
        n--
      }
    }
  }
  const quarter = Math.max(1, Math.floor(count / 4))
  add(pool.slice(0, 2), 2)
  add(pool.slice(-3), 3)
  add(pool.filter(m => !m.is_user && m.swipeCount > 1).sort((a, b) => b.swipeCount - a.swipeCount), quarter)
  add(pool.filter(m => m.is_user).sort((a, b) => b.content.length - a.content.length), quarter)
  add(pool.filter(m => !m.is_user).sort((a, b) => b.content.length - a.content.length), quarter)
  // Fill the rest evenly across the chat.
  const step = Math.max(1, Math.floor(pool.length / Math.max(1, count)))
  add(pool.filter((_, i) => i % step === 0), count)

  const chosen = pool.filter(m => pick.has(m.index)).sort((a, b) => a.index - b.index)
  const lines: string[] = []
  let last = -1
  for (const m of chosen) {
    if (last >= 0 && m.index > last + 1) lines.push('[...]')
    const who = m.name || (m.is_user ? userName : charName)
    const swipes = !m.is_user && m.swipeCount > 1 ? ` (rerolled ${m.swipeCount - 1}x)` : ''
    lines.push(`${who}${swipes}: ${clean(m.content, m.is_user ? 350 : 450)}`)
    last = m.index
  }
  return lines.join('\n')
}

// ---------- prompt ----------

const REPLY_PER_SLIDE = 90
const SUMMARY_CHUNK = 40
const SUMMARY_OUT = 450

function needsLlm(session: ScanSession, settings: Settings) {
  return session.host.kind === 'character' || session.req.depth !== 'stats' || settings.statsCommentary
}

function activeSlides(session: ScanSession, settings: Settings, hasSamples: boolean, hasSummaries: boolean): SlideDef[] {
  const s = session.stats
  return settings.slides.filter(sl => {
    if (!sl.enabled) return false
    if (DEPTH_RANK[sl.needs] > DEPTH_RANK[session.req.depth]) return false
    if (sl.id === 'quotes' && !hasSamples) return false
    if (sl.id === 'story_arcs' && !hasSummaries) return false
    if (sl.id === 'rerolls' && !s.totals.swipes) return false
    if (sl.id === 'personas' && !s.personas.length) return false
    if (sl.id === 'words' && !s.topWords.length) return false
    if (sl.id === 'number_one' && !s.topCharacters.length) return false
    return true
  })
}

function statsBrief(s: WrapStats, user: string) {
  const t = s.totals
  const lines = [
    `Year: ${s.year}. Scope: ${s.scope === 'character' ? `only chats with ${s.scopeName}` : 'everything'}.`,
    `Messages: ${fmt(t.messages)} total (${fmt(t.userMessages)} by ${user}, ${fmt(t.aiMessages)} by characters).`,
    `Words: ${fmt(t.userWords)} written by ${user} (avg ${s.avgUserWords} per message); characters wrote ${fmt(t.aiWords)} (avg ${s.avgAiWords}).`,
    `Chats active: ${t.chats} (${t.newChats} started this year). Characters: ${t.characters}.`,
    `Top characters by messages: ${s.topCharacters.map((c, i) => `${i + 1}. ${c.name} (${fmt(c.messages)} msgs, ${c.chats} chats)`).join('; ')}.`,
    s.longestChat ? `Longest chat: "${s.longestChat.name}" with ${s.longestChat.characterName}, ${fmt(s.longestChat.messages)} messages.` : '',
    `Busiest month: ${MONTHS[s.busiestMonth]}. Busiest weekday: ${WEEKDAYS[s.busiestWeekday]}. Busiest hour: ${hourLabel(s.busiestHour)}. ${s.nightOwlPct}% of ${user}'s messages were sent between midnight and 5 AM.`,
    s.busiestDay ? `Busiest single day: ${s.busiestDay.date} (${s.busiestDay.messages} messages).` : '',
    `Longest streak: ${s.streak.days} days in a row (${s.streak.start} to ${s.streak.end}). Active on ${t.activeDays} days.`,
    `Rerolls (swipes): ${fmt(t.swipes)}.${s.mostRerolledChat ? ` Most-rerolled chat: "${s.mostRerolledChat.name}" with ${s.mostRerolledChat.characterName} (${fmt(s.mostRerolledChat.swipes)}).` : ''}${s.mostSwipedMessage ? ` One message in "${s.mostSwipedMessage.chatName}" had ${s.mostSwipedMessage.swipes} versions.` : ''}`,
    s.personas.length ? `Personas ${user} played as: ${s.personas.map(p => `${p.name} (${fmt(p.messages)} msgs)`).join(', ')}.` : '',
    s.topWords.length ? `${user}'s most-used words: ${s.topWords.map(w => `"${w.word}" (${w.count})`).join(', ')}.` : '',
    s.theirWords.length ? `Characters' most-used words: ${s.theirWords.map(w => `"${w.word}" (${w.count})`).join(', ')}.` : '',
    s.firstMessage ? `First message of the year: with ${s.firstMessage.characterName} in "${s.firstMessage.chatName}".` : '',
    `RP personality archetype (already decided): ${s.archetype.name}: ${s.archetype.blurb}`,
  ]
  return lines.filter(Boolean).join('\n')
}

const FORMAT_RULES = `FORMAT: For each slide, write a line with only "=== slide_id ===" and then the host's line underneath. Use the exact slide ids given. Each slide is 1 to 3 short sentences (under 60 words), spoken by the host directly to the user. Use the real numbers and names. No narration of actions longer than a few words, no preamble, nothing after the last slide.`

function buildPrompt(session: ScanSession, settings: Settings, slides: SlideDef[], summaries: Map<string, string>, useSamples: Set<string>) {
  const s = session.stats
  const vars = statVars(s, session.userName, session.host.name)
  vars.char = session.host.name
  const system = `${fillMacros(session.hostPrompt, vars)}\n\n${FORMAT_RULES}`

  const parts = [
    session.host.kind === 'character' && session.characterCard ? `ABOUT ${session.host.name.toUpperCase()} (you):\n${session.characterCard}` : '',
    `${session.userName.toUpperCase()}'S ${s.year} STATS:\n${statsBrief(s, session.userName)}`,
  ]
  const excerpts = session.picked
    .filter(p => useSamples.has(p.id) && session.samples.get(p.id))
    .map(p => `--- "${p.name}" with ${p.characterName} ---\n${session.samples.get(p.id)}`)
  if (excerpts.length) parts.push(`EXCERPTS FROM THEIR TOP CHATS (real lines; quote sparingly):\n${excerpts.join('\n\n')}`)
  const sums = session.picked
    .filter(p => summaries.get(p.id))
    .map(p => `--- "${p.name}" with ${p.characterName} ---\n${summaries.get(p.id)}`)
  if (sums.length) parts.push(`WHAT HAPPENED IN THEIR TOP CHATS:\n${sums.join('\n\n')}`)
  parts.push(`SLIDES TO WRITE, in order:\n${slides.map(sl => `=== ${sl.id} === (${sl.title}): ${fillMacros(sl.prompt, vars)}`).join('\n')}`)
  return { system, user: parts.filter(Boolean).join('\n\n') }
}

async function estimateFor(session: ScanSession, selected: string[], settings: Settings, userId: string): Promise<Estimate> {
  const sel = new Set(selected)
  const depth = session.req.depth
  const picked = session.picked.filter(p => sel.has(p.id))
  if (!needsLlm(session, settings)) {
    return { base: 0, highlights: 0, deep: 0, reply: 0, total: 0, approximate: false, model: '', free: true }
  }
  const opts = await tokenOptions(settings, userId)
  const hasSamples = depth !== 'stats' && picked.length > 0
  const hasSummaries = depth === 'deep' && picked.length > 0
  const slides = activeSlides(session, settings, hasSamples, hasSummaries)
  const base = buildPrompt(session, settings, slides, new Map(), new Set())
  const baseCount = await countText(base.system + '\n' + base.user, opts)
  const highlights = depth !== 'stats' ? picked.reduce((a, p) => a + p.sampleTokens, 0) : 0
  let deep = 0
  if (depth === 'deep') {
    for (const p of picked) {
      // Summaries already cached cost nothing; they're still read in the final call.
      deep += SUMMARY_OUT
      if (p.deepCached) continue
      const chunks = Math.max(1, Math.ceil(p.messages / SUMMARY_CHUNK))
      deep += p.chatTokens + chunks * (SUMMARY_OUT + 150)
    }
  }
  const reply = slides.length * REPLY_PER_SLIDE
  return {
    base: baseCount.n,
    highlights,
    deep,
    reply,
    total: baseCount.n + highlights + deep + reply,
    approximate: true,
    model: baseCount.model,
    free: false,
  }
}

// ---------- deep summaries ----------

async function summarizeChat(chatId: string, charName: string, userName: string, settings: Settings, userId: string, onStep: (text: string) => void) {
  const msgs = await fetchMessages(chatId)
  const cached = await loadDeep(chatId, userId)
  if (cached && cached.messageCount === msgs.length && cached.summary) return { summary: cached.summary, tokens: 0 }
  let summary = ''
  let tokens = 0
  const chunks = Math.max(1, Math.ceil(msgs.length / SUMMARY_CHUNK))
  for (let i = 0; i < msgs.length; i += SUMMARY_CHUNK) {
    onStep(`chunk ${i / SUMMARY_CHUNK + 1} of ${chunks}`)
    const slice = msgs
      .slice(i, i + SUMMARY_CHUNK)
      .map(m => `${m.name || (m.is_user ? userName : charName)}: ${clean(m.content, 1200)}`)
      .join('\n\n')
    const prompt = `${summary ? `STORY SO FAR:\n${summary}\n\n` : ''}NEW EVENTS:\n${slice}\n\nRewrite the story so far to include the new events: the plot, relationship beats, big moments, running jokes and anything embarrassing or iconic ${userName} did. Under 350 words. Output only the summary.`
    const out = await llm(userId, settings, `You keep a running recap of a roleplay between ${charName} and ${userName}.`, prompt, 0.4)
    tokens += Math.ceil((prompt.length + out.length) / 4)
    if (out.trim()) summary = out.trim()
  }
  await spindle.userStorage.setJson(deepPath(chatId), { messageCount: msgs.length, summary } satisfies DeepCache, { userId })
  return { summary, tokens }
}

// ---------- making the wrap ----------

function builtinLine(hostId: string, slideId: string, vars: Record<string, string>) {
  const lines = BUILTIN_LINES[(hostId as 'past') in BUILTIN_LINES ? (hostId as 'past') : 'past']
  const t = lines[slideId] || BUILTIN_LINES.past[slideId]
  return t ? fillMacros(t, vars) : ''
}

async function makeWrap(scanId: string, selected: string[], userId: string) {
  if (busy.has(userId)) return
  const session = sessions.get(userId)
  if (!session || session.id !== scanId) {
    send(userId, { type: 'error', where: 'wrap', message: 'That scan expired. Scan again first.' })
    return
  }
  busy.add(userId)
  const progress = (text: string) => send(userId, { type: 'progress', stage: 'wrap', text })
  try {
    const settings = await loadSettings(userId)
    const sel = new Set(selected)
    const picked = session.picked.filter(p => sel.has(p.id))
    const depth = session.req.depth
    let tokensUsed = 0

    const summaries = new Map<string, string>()
    if (depth === 'deep') {
      let i = 0
      for (const p of picked) {
        i++
        const r = await summarizeChat(p.id, p.characterName, session.userName, settings, userId, step =>
          progress(`Reading "${p.name}" (${i}/${picked.length}, ${step})...`),
        )
        tokensUsed += r.tokens
        if (r.summary) summaries.set(p.id, r.summary)
      }
    }

    const useSamples = new Set(depth !== 'stats' ? picked.map(p => p.id) : [])
    const slides = activeSlides(session, settings, useSamples.size > 0, summaries.size > 0)
    const vars = statVars(session.stats, session.userName, session.host.name)

    let written: Record<string, string> = {}
    if (needsLlm(session, settings)) {
      progress(`${session.host.name} is writing your Lumiwrap...`)
      const prompt = buildPrompt(session, settings, slides, summaries, useSamples)
      const raw = await llm(userId, settings, prompt.system, prompt.user, settings.temperature)
      tokensUsed += Math.ceil((prompt.system.length + prompt.user.length + raw.length) / 4)
      written = parseSlides(raw, slides.map(s => s.id))
      if (!Object.keys(written).length) {
        spindle.log.warn(`Lumiwrap: could not parse slides from: ${raw.slice(0, 400)}`)
        throw new Error('The host mumbled something unreadable. Try again, or check that your model follows instructions.')
      }
    }

    const rendered: RenderedSlide[] = slides.map(sl => ({
      id: sl.id,
      title: sl.title,
      text: written[sl.id] || builtinLine(session.host.kind === 'builtin' ? session.host.id : 'past', sl.id, vars),
    }))

    const s = session.stats
    const chatsMentioned = new Map<string, { id: string; name: string; characterName: string }>()
    for (const c of [s.longestChat, s.mostRerolledChat, ...s.topChats]) if (c) chatsMentioned.set(c.id, { id: c.id, name: c.name, characterName: c.characterName })
    for (const p of picked) chatsMentioned.set(p.id, { id: p.id, name: p.name, characterName: p.characterName })

    const wrap: Wrap = {
      id: uid(),
      title: `${s.year}${s.scope === 'character' ? ` · ${s.scopeName}` : ''} with ${session.host.name}`,
      createdAt: Date.now(),
      year: s.year,
      scope: s.scope,
      scopeName: s.scopeName,
      depth,
      host: session.host,
      stats: s,
      slides: rendered,
      chats: [...chatsMentioned.values()],
      tokensUsed,
    }
    await saveWrap(wrap, userId)
    send(userId, { type: 'wrap_ready', wrap })
    await sendLibrary(userId)
  } catch (err: any) {
    send(userId, { type: 'error', where: 'wrap', message: err?.message || String(err) })
  } finally {
    busy.delete(userId)
    send(userId, { type: 'progress', stage: 'idle' })
  }
}

// ---------- expose me ----------

async function exposeEstimate(wrapId: string, chatId: string, userId: string) {
  const settings = await loadSettings(userId)
  const opts = await tokenOptions(settings, userId)
  const msgs = await fetchMessages(chatId).catch(() => [] as FullMsg[])
  const cached = await loadDeep(chatId, userId)
  const isCached = !!cached && cached.messageCount === msgs.length
  let chatTokens = 0
  if (!isCached) {
    try {
      chatTokens = (await spindle.tokens.countChat(chatId, opts)).total_tokens
    } catch {
      chatTokens = Math.ceil(msgs.reduce((a, m) => a + m.content.length, 0) / 4)
    }
    chatTokens += Math.ceil(msgs.length / SUMMARY_CHUNK) * (SUMMARY_OUT + 150)
  }
  send(userId, { type: 'expose_estimate', wrapId, chatId, tokens: chatTokens + 1500, cached: isCached })
}

async function exposeRun(wrapId: string, chatId: string, userId: string) {
  if (busy.has(userId)) return
  busy.add(userId)
  const progress = (text: string) => send(userId, { type: 'progress', stage: 'expose', text })
  try {
    const wrap = await loadWrap(wrapId, userId)
    if (!wrap) throw new Error('That Lumiwrap no longer exists.')
    const chatInfo = wrap.chats.find(c => c.id === chatId)
    const chat = await spindle.chats.get(chatId, userId)
    if (!chat || !chatInfo) throw new Error('That chat no longer exists.')
    const settings = await loadSettings(userId)
    const userName = await userDisplayName(userId, wrap.stats)
    const r = await summarizeChat(chatId, chatInfo.characterName, userName, settings, userId, step => progress(`Reading "${chatInfo.name}" (${step})...`))

    const hostInfo = await resolveHost(wrap.host.kind === 'character' ? `char:${wrap.host.id}` : wrap.host.id, settings, userId).catch(() => null)
    const vars = statVars(wrap.stats, userName, wrap.host.name)
    vars.char = wrap.host.name
    const system = `${fillMacros(hostInfo?.prompt || settings.hosts[0].prompt, vars)}\n\nWrite 3 to 5 short sentences (under 110 words) spoken by you directly to ${userName}. No preamble.`
    const msgs = await fetchMessages(chatId).catch(() => [] as FullMsg[])
    const sample = buildSample(msgs, chatInfo.characterName, userName, 10, () => true)
    const user = [
      hostInfo?.card ? `ABOUT ${wrap.host.name.toUpperCase()} (you):\n${hostInfo.card}` : '',
      `${userName} asked you to EXPOSE them for this chat: "${chatInfo.name}" with ${chatInfo.characterName}.`,
      `WHAT HAPPENED:\n${r.summary || '(no summary)'}`,
      sample ? `SOME REAL LINES:\n${sample}` : '',
      `Expose them: call out the most embarrassing, unhinged or iconic things they did in this chat, with specifics. Affectionate roast, in your voice.`,
    ]
      .filter(Boolean)
      .join('\n\n')
    progress(`${wrap.host.name} is preparing the receipts...`)
    const text = (await llm(userId, settings, system, user, settings.temperature)).trim()
    if (!text) throw new Error('The host had nothing to say. Try again.')

    // The outro stays last.
    const slide: RenderedSlide = { id: 'expose', title: 'Exposed', text: text.slice(0, 1200), chatName: chatInfo.name, characterName: chatInfo.characterName }
    const outroAt = wrap.slides.findIndex(s => s.id === 'outro')
    if (outroAt >= 0) wrap.slides.splice(outroAt, 0, slide)
    else wrap.slides.push(slide)
    wrap.tokensUsed += r.tokens + Math.ceil((system.length + user.length + text.length) / 4)
    await saveWrap(wrap, userId)
    send(userId, { type: 'expose_done', wrap, slideIndex: outroAt >= 0 ? outroAt : wrap.slides.length - 1 })
  } catch (err: any) {
    send(userId, { type: 'error', where: 'expose', message: err?.message || String(err) })
  } finally {
    busy.delete(userId)
    send(userId, { type: 'progress', stage: 'idle' })
  }
}

// ---------- library ----------

async function sendLibrary(userId: string) {
  const paths = await spindle.userStorage.list('wraps/', userId).catch(() => [] as string[])
  const out: WrapSummary[] = []
  for (const p of paths) {
    const id = String(p).match(/([^/]+)\.json$/)?.[1]
    if (!id) continue
    const w = await loadWrap(id, userId)
    if (!w) continue
    out.push({ id: w.id, title: w.title, createdAt: w.createdAt, year: w.year, depth: w.depth, hostName: w.host.name, hostEmoji: w.host.emoji, scopeName: w.scopeName })
  }
  out.sort((a, b) => b.createdAt - a.createdAt)
  send(userId, { type: 'library', wraps: out })
}

// ---------- sprites ----------

const SPRITES_PATH = 'sprites.json'
const REQUIRED = ['generation', 'characters', 'chats', 'chat_mutation', 'personas']

async function loadSprites(userId: string): Promise<Record<string, string>> {
  return spindle.userStorage.getJson<Record<string, string>>(SPRITES_PATH, { fallback: {}, userId }).catch(() => ({}))
}

async function missingPermissions(): Promise<string[]> {
  try {
    const granted = new Set(await spindle.permissions.getGranted())
    return REQUIRED.filter(p => !granted.has(p))
  } catch {
    return REQUIRED.filter(p => !spindle.permissions.has(p))
  }
}

// ---------- frontend messages ----------

async function handle(payload: any, userId: string) {
  switch (payload?.type) {
    case 'init': {
      const errors: string[] = []
      const [settings, connections, characters, sprites, missing] = await Promise.all([
        loadSettings(userId),
        spindle.connections.list(userId).catch((e: any) => {
          errors.push(`Connections: ${e?.message || e}`)
          return []
        }),
        listAll(o => spindle.characters.list({ limit: 200, offset: o, userId }), 200).catch((e: any) => {
          errors.push(`Characters: ${e?.message || e}`)
          return []
        }),
        loadSprites(userId),
        missingPermissions(),
      ])
      if (errors.length) spindle.log.warn(`Lumiwrap init: ${errors.join(' | ')}`)
      send(userId, {
        type: 'init_data',
        settings,
        sprites,
        missing,
        errors,
        connections: connections.map(c => ({ id: c.id, name: c.name || c.id, provider: c.provider, model: c.model, isDefault: c.is_default })),
        characters: characters.map(c => ({ id: c.id, name: c.name, avatar: c.avatar_url || null })).sort((a, b) => a.name.localeCompare(b.name)),
      })
      return sendLibrary(userId)
    }
    case 'scan':
      return scan(payload.request as ScanRequest, userId)
    case 'estimate': {
      const session = sessions.get(userId)
      if (!session || session.id !== payload.scanId) return
      const settings = await loadSettings(userId)
      if (payload.host) await applyHost(session, payload.host, settings, userId)
      const estimate = await estimateFor(session, payload.selected || [], settings, userId)
      send(userId, { type: 'estimate', scanId: session.id, estimate })
      return
    }
    case 'wrap': {
      const session = sessions.get(userId)
      if (session && session.id === payload.scanId && payload.host) {
        await applyHost(session, payload.host, await loadSettings(userId), userId)
      }
      return makeWrap(payload.scanId, payload.selected || [], userId)
    }
    case 'save_settings': {
      const merged = normalizeSettings({ ...(await loadSettings(userId)), ...(payload.settings || {}) })
      await spindle.userStorage.setJson(SETTINGS_PATH, merged, { userId })
      send(userId, { type: 'settings_saved', settings: merged })
      if (!payload.quiet) spindle.toast.success('Lumiwrap settings saved.')
      return
    }
    case 'reset_hosts': {
      const s = await loadSettings(userId)
      s.hosts = DEFAULT_SETTINGS.hosts
      s.characterHostPrompt = DEFAULT_SETTINGS.characterHostPrompt
      await spindle.userStorage.setJson(SETTINGS_PATH, s, { userId })
      send(userId, { type: 'settings_saved', settings: s })
      return
    }
    case 'reset_slides': {
      const s = await loadSettings(userId)
      s.slides = DEFAULT_SETTINGS.slides
      await spindle.userStorage.setJson(SETTINGS_PATH, s, { userId })
      send(userId, { type: 'settings_saved', settings: s })
      return
    }
    case 'list_wraps':
      return sendLibrary(userId)
    case 'get_wrap': {
      const wrap = await loadWrap(payload.id, userId)
      if (!wrap) throw new Error('That Lumiwrap no longer exists.')
      send(userId, { type: 'wrap_data', wrap, play: !!payload.play })
      return
    }
    case 'rename_wrap': {
      const wrap = await loadWrap(payload.id, userId)
      if (!wrap) return
      wrap.title = String(payload.title || '').trim().slice(0, 80) || wrap.title
      await saveWrap(wrap, userId)
      return sendLibrary(userId)
    }
    case 'delete_all_wraps': {
      const paths = await spindle.userStorage.list('wraps/', userId).catch(() => [] as string[])
      for (const p of paths) await spindle.userStorage.delete(String(p).startsWith('wraps/') ? String(p) : `wraps/${p}`, userId).catch(() => {})
      spindle.toast.success('All Lumiwraps deleted.')
      return sendLibrary(userId)
    }
    case 'delete_wrap': {
      await spindle.userStorage.delete(wrapPath(payload.id), userId).catch(() => {})
      spindle.toast.success('Lumiwrap deleted.')
      send(userId, { type: 'wrap_deleted', id: payload.id })
      return sendLibrary(userId)
    }
    case 'expose_estimate':
      return exposeEstimate(payload.wrapId, payload.chatId, userId)
    case 'expose_run':
      return exposeRun(payload.wrapId, payload.chatId, userId)
    case 'save_sprite': {
      const sprites = await loadSprites(userId)
      const id = String(payload.hostId || '')
      if (!['past', 'present', 'future'].includes(id)) return
      const data = typeof payload.dataUrl === 'string' ? payload.dataUrl : ''
      if (data && (!data.startsWith('data:image/') || data.length > 3_000_000)) throw new Error('That image is too big. Try one under 2 MB.')
      if (data) sprites[id] = data
      else delete sprites[id]
      await spindle.userStorage.setJson(SPRITES_PATH, sprites, { userId })
      send(userId, { type: 'sprites', sprites })
      return
    }
  }
}

spindle.onFrontendMessage((payload: any, userId: string) => {
  // An unhandled rejection kills the extension worker, so always catch.
  handle(payload, userId).catch((err: any) => {
    const message = err?.message || String(err)
    spindle.log.error(`Lumiwrap: ${message}`)
    send(userId, { type: 'error', message })
  })
})

spindle.log.info('Lumiwrap backend loaded. ❄️')
