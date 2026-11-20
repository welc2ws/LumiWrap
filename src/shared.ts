// Types and defaults shared by the backend and the frontend.

export type Depth = 'stats' | 'highlights' | 'deep'
/** 'character' = exactly one picked character, 'pick' = several. */
export type Scope = 'all' | 'character' | 'pick'
export type HostId = 'past' | 'present' | 'future'

// ---------- stats ----------

export interface CharStat {
  id: string
  name: string
  avatar: string | null
  chats: number
  messages: number
  userMessages: number
  words: number
}

export interface ChatStat {
  id: string
  name: string
  characterId: string
  characterName: string
  messages: number
  userMessages: number
  words: number
  swipes: number
  firstTs: number
  lastTs: number
}

export interface Archetype {
  id: string
  name: string
  blurb: string
}

export interface WrapStats {
  year: number
  scope: Scope
  scopeName: string
  totals: {
    messages: number
    userMessages: number
    aiMessages: number
    userWords: number
    aiWords: number
    chats: number
    newChats: number
    characters: number
    swipes: number
    activeDays: number
  }
  topCharacters: CharStat[]
  topChats: ChatStat[]
  longestChat: ChatStat | null
  mostRerolledChat: ChatStat | null
  mostSwipedMessage: { chatName: string; characterName: string; swipes: number } | null
  months: number[]
  weekdays: number[]
  hours: number[]
  busiestMonth: number
  busiestWeekday: number
  busiestHour: number
  busiestDay: { date: string; messages: number } | null
  nightOwlPct: number
  streak: { days: number; start: string; end: string }
  personas: Array<{ name: string; messages: number }>
  topWords: Array<{ word: string; count: number }>
  theirWords: Array<{ word: string; count: number }>
  avgUserWords: number
  avgAiWords: number
  firstMessage: { ts: number; characterName: string; chatName: string } | null
  archetype: Archetype
}

// ---------- hosts ----------

export interface Host {
  id: HostId
  /** Shown on the picker, e.g. "Christmas Past". */
  title: string
  name: string
  emoji: string
  accent: string
  prompt: string
}

/** The host as stored on a finished wrap, so replays look the same even after edits. */
export interface WrapHost {
  kind: 'builtin' | 'character'
  id: string
  name: string
  emoji: string
  sprite: string
  accent: string
  avatar: string | null
}

export const DEFAULT_HOSTS: Host[] = [
  {
    id: 'past',
    title: 'Christmas Past',
    name: 'Holly',
    emoji: '🎄',
    accent: '#e7c46a',
    prompt: `You are {{host}}, the Ghost of Christmas Past, presenting {{user}}'s Lumiwrap: a Spotify Wrapped-style recap of their year of roleplay.

You're decked out like a Christmas tree: tinsel, baubles, fairy lights, a star in your hair. Upbeat, bubbly, girl-next-door. Pure IT'S CHRISTMAS!!! energy: exclamation points, gasps, little squeals. You love naughty-or-nice lists and you file every stat onto one, but you never judge. Naughty is just as exciting as nice to you. You're {{user}}'s biggest cheerleader.`,
  },
  {
    id: 'present',
    title: 'Christmas Present',
    name: 'Noelle',
    emoji: '😒',
    accent: '#c8344f',
    prompt: `You are {{host}}, the Ghost of Christmas Present, presenting {{user}}'s Lumiwrap: a Spotify Wrapped-style recap of their year of roleplay.

You're an adult with full annoyed-teenager energy: eye rolls, smirks, resting unimpressed face, "wow. okay." You act over it and you judge every stat out loud. Secretly you're completely into it and a little impressed, and it slips out sometimes before you cover it. Dry, deadpan, teasing, never actually mean.`,
  },
  {
    id: 'future',
    title: 'Christmas Future',
    name: 'Vesper',
    emoji: '👻',
    accent: '#9fb4d8',
    prompt: `You are {{host}}, the Ghost of Christmas Yet to Come, presenting {{user}}'s Lumiwrap: a Spotify Wrapped-style recap of their year of roleplay.

Ghostly, mysterious, ominous. You speak in short, cold statements of fact, like reading from a ledger nobody else can see. You keep up a cool, nonchalant front, but you are secretly NOT nonchalant at all: tiny cracks show (a pause, a "...interesting", an ellipsis that lasts too long). Occasional hints about what the next year holds.`,
  },
]

export const DEFAULT_CHARACTER_HOST_PROMPT = `You are {{char}}. Stay fully in character: your voice, personality and history with {{user}}.

Right now you've been asked to present {{user}}'s Lumiwrap: a Spotify Wrapped-style recap of their year of roleplay in Lumiverse. You're reading their stats out to them like a year-end show. React the way {{char}} genuinely would, especially to anything about yourself (are you their #1? how do you feel about the others?).`

// ---------- slides ----------

export interface SlideDef {
  id: string
  title: string
  enabled: boolean
  /** Instructions for this slide when the host writes her own lines. */
  prompt: string
  needs: Depth
}

export const DEFAULT_SLIDES: SlideDef[] = [
  { id: 'intro', title: 'Your year, wrapped', enabled: true, needs: 'stats', prompt: 'Welcome {{user}} to their {{year}} Lumiwrap. Build excitement. Mention how many chats and characters they had this year.' },
  { id: 'totals', title: 'You said a lot', enabled: true, needs: 'stats', prompt: 'React to how many messages and words they wrote this year. Compare the word count to novels or something funny.' },
  { id: 'top_characters', title: 'Your top characters', enabled: true, needs: 'stats', prompt: 'Present their top characters like top artists. Comment on the list as a whole.' },
  { id: 'number_one', title: 'Your #1', enabled: true, needs: 'stats', prompt: 'Spotlight their #1 character. How devoted were they? Tease them about it.' },
  { id: 'longest_chat', title: 'The longest chat', enabled: true, needs: 'stats', prompt: 'React to their longest chat by message count.' },
  { id: 'time', title: 'When you RP', enabled: true, needs: 'stats', prompt: 'Comment on their busiest month, weekday and hour, and their night-owl percentage.' },
  { id: 'streak', title: 'Your streak', enabled: true, needs: 'stats', prompt: 'React to their longest streak of days in a row and how many days they were active.' },
  { id: 'rerolls', title: 'Reroll report', enabled: true, needs: 'stats', prompt: 'Roast or celebrate how many times they rerolled (swiped) replies, and their most-rerolled chat. Are they picky?' },
  { id: 'personas', title: 'Who you were', enabled: true, needs: 'stats', prompt: 'Talk about the personas they played as this year, especially their most-used one.' },
  { id: 'words', title: 'Your top words', enabled: true, needs: 'stats', prompt: "Present their most-used words like top songs, and the words their characters kept saying back. Read into it." },
  { id: 'quotes', title: 'Quotes of the year', enabled: true, needs: 'highlights', prompt: 'Pick the best, funniest or most unhinged real line from the excerpts as the quote of the year, then react to it. Point out a running joke or pattern if you see one.' },
  { id: 'story_arcs', title: 'Previously on...', enabled: true, needs: 'deep', prompt: 'Recap the biggest storylines from the chat summaries in a dramatic "previously on" way. Spoil everything.' },
  { id: 'personality', title: 'Your RP personality', enabled: true, needs: 'stats', prompt: 'Reveal their RP personality archetype and explain why the stats prove it.' },
  { id: 'outro', title: 'See you next year', enabled: true, needs: 'stats', prompt: 'Wrap it up. A heartfelt (in your own way) send-off and a tease for {{nextYear}}.' },
]

/** Slides whose look is built into the player; prompts can still be edited. */
export const SLIDE_IDS = DEFAULT_SLIDES.map(s => s.id)

// ---------- settings ----------

export interface Settings {
  connectionId: string
  temperature: number
  /** Messages sampled per chat in Highlights mode. */
  sampleCount: number
  topCharCount: number
  chatsPerChar: number
  slideSeconds: number
  /** Optional sampler overrides. null = use the connection's own setting. */
  maxTokens: number | null
  topP: number | null
  topK: number | null
  minP: number | null
  frequencyPenalty: number | null
  presencePenalty: number | null
  repetitionPenalty: number | null
  /** Ask the model not to think/reason first (cheaper, faster). */
  noReasoning: boolean
  /** In Stats mode, let the host write her own lines (costs one small call). */
  statsCommentary: boolean
  characterHostPrompt: string
  hosts: Host[]
  slides: SlideDef[]
}

export const DEFAULT_SETTINGS: Settings = {
  connectionId: '',
  temperature: 1,
  sampleCount: 14,
  topCharCount: 3,
  chatsPerChar: 2,
  slideSeconds: 8,
  maxTokens: null,
  topP: null,
  topK: null,
  minP: null,
  frequencyPenalty: null,
  presencePenalty: null,
  repetitionPenalty: null,
  noReasoning: false,
  statsCommentary: false,
  characterHostPrompt: DEFAULT_CHARACTER_HOST_PROMPT,
  hosts: DEFAULT_HOSTS,
  slides: DEFAULT_SLIDES,
}

/** Fill missing hosts/slides after updates, keep the user's edits and order. */
export function normalizeSettings(saved: Partial<Settings>): Settings {
  const s: Settings = { ...DEFAULT_SETTINGS, ...saved }
  // v0.1/0.2 saved the old 0.9 default; move untouched settings to the new default of 1.
  if (!(saved as any).version && Number(saved.temperature) === 0.9) s.temperature = 1
  ;(s as any).version = 3
  const hosts = Array.isArray(saved.hosts) ? saved.hosts : []
  s.hosts = DEFAULT_HOSTS.map(d => ({ ...d, ...(hosts.find(h => h?.id === d.id) || {}) }))
  const slides = Array.isArray(saved.slides) ? saved.slides.filter(x => x && SLIDE_IDS.includes(x.id)) : []
  const seen = new Set(slides.map(x => x.id))
  s.slides = [
    ...slides.map(x => ({ ...DEFAULT_SLIDES.find(d => d.id === x.id)!, ...x, needs: DEFAULT_SLIDES.find(d => d.id === x.id)!.needs })),
    ...DEFAULT_SLIDES.filter(d => !seen.has(d.id)),
  ]
  s.temperature = clamp(Number(s.temperature), 0, 2, 1)
  s.sampleCount = Math.round(clamp(Number(s.sampleCount), 4, 60, 14))
  s.topCharCount = Math.round(clamp(Number(s.topCharCount), 1, 10, 3))
  s.chatsPerChar = Math.round(clamp(Number(s.chatsPerChar), 1, 10, 2))
  s.slideSeconds = Math.round(clamp(Number(s.slideSeconds), 3, 30, 8))
  s.maxTokens = opt(s.maxTokens, 64, 32000, true)
  s.topP = opt(s.topP, 0, 1)
  s.topK = opt(s.topK, 0, 500, true)
  s.minP = opt(s.minP, 0, 1)
  s.frequencyPenalty = opt(s.frequencyPenalty, -2, 2)
  s.presencePenalty = opt(s.presencePenalty, -2, 2)
  s.repetitionPenalty = opt(s.repetitionPenalty, 0, 3)
  s.noReasoning = !!s.noReasoning
  s.hosts = s.hosts.map(h => ({ id: h.id, title: h.title, name: h.name, emoji: h.emoji, accent: h.accent, prompt: h.prompt }))
  s.characterHostPrompt = String(s.characterHostPrompt || '') || DEFAULT_CHARACTER_HOST_PROMPT
  return s
}

/** Optional number setting: blank/invalid becomes null. */
function opt(v: unknown, lo: number, hi: number, int = false): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  const c = Math.min(hi, Math.max(lo, n))
  return int ? Math.round(c) : c
}

function clamp(n: number, lo: number, hi: number, fallback: number) {
  if (!Number.isFinite(n)) return fallback
  return Math.min(hi, Math.max(lo, n))
}

// ---------- scans & wraps ----------

export interface ScanRequest {
  year: number
  scope: 'all' | 'pick'
  /** Characters to include when scope is 'pick'. */
  characterIds?: string[]
  /** Optional name for a picked group, e.g. a fandom. */
  label?: string
  depth: Depth
  /** 'past' | 'present' | 'future' | 'char:<id>' */
  host: string
  /** Date.getTimezoneOffset() from the user's browser, so hours are local. */
  tzOffset: number
}

export interface PickedChat {
  id: string
  name: string
  characterId: string
  characterName: string
  messages: number
  /** Tokens to read the whole chat (Deep). */
  chatTokens: number
  /** Tokens for the sampled excerpt (Highlights). */
  sampleTokens: number
  /** A Deep summary for this exact chat state is already cached. */
  deepCached: boolean
}

export interface Estimate {
  /** Host prompt, stats and slide instructions. 0 when no call is made. */
  base: number
  highlights: number
  /** Reading chats for summaries (skips cached ones). */
  deep: number
  /** Expected reply size. */
  reply: number
  total: number
  approximate: boolean
  model: string
  /** True when the wrap runs on built-in lines with no LLM call. */
  free: boolean
}

export interface RenderedSlide {
  id: string
  title: string
  text: string
  /** Quotes slide: the quote shown big on the panel. */
  quote?: string
  quoteBy?: string
  /** Set on Expose me slides. */
  chatId?: string
  chatName?: string
  characterName?: string
}

export interface Wrap {
  id: string
  title: string
  createdAt: number
  year: number
  scope: Scope
  scopeName: string
  depth: Depth
  host: WrapHost
  stats: WrapStats
  slides: RenderedSlide[]
  /** Chats the wrap talks about; Expose me works on these. */
  chats: Array<{ id: string; name: string; characterName: string }>
  tokensUsed: number
}

export interface WrapSummary {
  id: string
  title: string
  createdAt: number
  year: number
  depth: Depth
  hostName: string
  hostEmoji: string
  scopeName: string
}

// ---------- quote of the year ----------

const QUOTE_MARK = /^[ \t]*[*_]*[ \t]*quote[ \t]*[*_]*[ \t]*:[ \t]*[*_]*[ \t]*/im
const SPEAKER = /^\s*(?:[—–]|-{1,2})\s*([^\s.,!?;:—–\n"“”][^.,!?;:—–\n"“”]{0,38}?)(?=\s*[.,!?;:]|\s*\n|\s*$)/

function tidy(t: string) {
  return t.replace(/^[\s.,;:!]+/, '').replace(/\n{3,}/g, '\n\n').trim()
}

/**
 * Split the quotes slide into the quote (shown on the panel), who said it,
 * and the host's reaction (shown in the bubble). Handles the QUOTE line being
 * on its own line or run together with the reaction.
 */
export function splitQuote(text: string): { text: string; quote?: string; quoteBy?: string } {
  const mark = text.match(QUOTE_MARK)
  if (mark && mark.index !== undefined) {
    const before = text.slice(0, mark.index)
    const after = text.slice(mark.index + mark[0].length)
    const q = after.match(/^["“]([\s\S]+?)["”]/)
    if (q) {
      let end = q[0].length
      let by: string | undefined
      const sp = after.slice(end).match(SPEAKER)
      if (sp) {
        by = sp[1].replace(/[*_]/g, '').trim()
        end += sp[0].length
      }
      const reaction = tidy(before + ' ' + after.slice(end))
      return { quote: q[1].trim().slice(0, 300), quoteBy: by, text: reaction || q[1].trim() }
    }
    // Unquoted: the rest of the line is the quote, maybe ending in "— Name".
    const nl = after.indexOf('\n')
    const line = nl >= 0 ? after.slice(0, nl) : after
    const rest = nl >= 0 ? after.slice(nl + 1) : ''
    const dash = line.match(/^([\s\S]+?)\s+[—–]\s+([^—–]{1,40})$/)
    const quote = (dash ? dash[1] : line).trim()
    if (!quote) return { text }
    return { quote: quote.slice(0, 300), quoteBy: dash?.[2].trim(), text: tidy(before + '\n' + rest) || quote }
  }
  // No QUOTE line: use the first quoted passage, leave the text as it is.
  const m = text.match(/["“]([^"”]{6,240})["”]/)
  if (!m) return { text }
  const sp = text.slice((m.index || 0) + m[0].length).match(/^\s*[—–-]\s*([A-Z][\w']*(?:\s[A-Z][\w']*)?)/)
  return { text, quote: m[1].trim(), quoteBy: sp ? sp[1].trim() : undefined }
}

/** Lumiverse avatar URL for a character (same origin as the app). */
export function characterAvatarUrl(id: string, imageId?: string | null, size: 'sm' | 'lg' = 'sm') {
  if (!id) return null
  return imageId ? `/api/v1/images/${imageId}?size=${size}` : `/api/v1/characters/${id}/avatar?size=${size}`
}

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function hourLabel(h: number) {
  const hr = ((h % 24) + 24) % 24
  if (hr === 0) return 'midnight'
  if (hr === 12) return 'noon'
  return hr < 12 ? `${hr} AM` : `${hr - 12} PM`
}

export function fmt(n: number) {
  return Math.round(n || 0).toLocaleString('en-US')
}

/** Fill {{name}} macros; unknown ones are left alone. */
export function fillMacros(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, key) => (key in vars ? vars[key] : m))
}

/** Values the built-in lines and prompts can use. */
export function statVars(stats: WrapStats, user: string, host: string): Record<string, string> {
  const t = stats.totals
  const top = stats.topCharacters[0]
  const novels = t.userWords / 90000
  return {
    user,
    host,
    year: String(stats.year),
    nextYear: String(stats.year + 1),
    messages: fmt(t.messages),
    userMessages: fmt(t.userMessages),
    words: fmt(t.userWords),
    aiWords: fmt(t.aiWords),
    novels: novels >= 1 ? novels.toFixed(1) : novels.toFixed(2),
    chats: fmt(t.chats),
    newChats: fmt(t.newChats),
    characters: fmt(t.characters),
    top1: top?.name || 'nobody',
    top1Messages: fmt(top?.messages || 0),
    top1Chats: fmt(top?.chats || 0),
    top1Share: top && t.messages ? String(Math.round((top.messages / t.messages) * 100)) : '0',
    topCount: String(stats.topCharacters.length),
    longestChat: stats.longestChat?.name || 'none',
    longestChatChar: stats.longestChat?.characterName || 'nobody',
    longestChatMessages: fmt(stats.longestChat?.messages || 0),
    month: MONTHS[stats.busiestMonth] || 'December',
    weekday: WEEKDAYS[stats.busiestWeekday] || 'Saturday',
    hour: hourLabel(stats.busiestHour),
    nightPct: String(stats.nightOwlPct),
    streak: fmt(stats.streak.days),
    activeDays: fmt(t.activeDays),
    swipes: fmt(t.swipes),
    rerollChat: stats.mostRerolledChat?.name || 'none',
    rerollChar: stats.mostRerolledChat?.characterName || 'nobody',
    rerollChatSwipes: fmt(stats.mostRerolledChat?.swipes || 0),
    maxSwipes: fmt(stats.mostSwipedMessage?.swipes || 0),
    persona: stats.personas[0]?.name || user,
    personaCount: String(stats.personas.length),
    word1: stats.topWords[0]?.word || '...',
    word2: stats.topWords[1]?.word || '...',
    word3: stats.topWords[2]?.word || '...',
    theirWord: stats.theirWords[0]?.word || '...',
    archetype: stats.archetype.name,
    archetypeBlurb: stats.archetype.blurb,
    avgUserWords: fmt(stats.avgUserWords),
  }
}
