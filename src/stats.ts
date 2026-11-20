// Free, local stats. Nothing in here calls a model.

import type { Archetype, ChatStat, CharStat, Scope, WrapStats } from './shared'

export interface MsgLite {
  is_user: boolean
  name: string
  content: string
  send_date: number
  swipeCount: number
}

export interface ChatMeta {
  id: string
  name: string
  characterId: string
  characterName: string
  avatar: string | null
  created: number
}

const STOP = new Set(
  `the and you that was for with his her she him they them their this then than have has had not but are were what when where who whom which why how all any can could would should will just like into onto from your yours you're youre it's its i'm im i've ive i'll ill don't dont didn't didnt doesn't doesnt can't cant won't wont isn't isnt wasn't wasnt aren't arent there here out over under about again also back been being both down each even ever every few more most much must only other our ours own same some such too very well yet still now upon off one two get got gets let lets make made say said says see seen look looked looks know knew think thought want wanted going gonna wanna yeah yes okay sure really something nothing anything everything way while though through because before after around against between little bit than then them those these thing things time take took come came goes went keep kept tell told give gave right left maybe might never always away once ever since until without within again let's that's there's what's he's she's we're they're we've they've i'd you'd he'd she'd we'd they'd you've you'll he'll she'll we'll they'll who's how's where's when's why's ain't hers himself herself itself themselves myself yourself ourselves another enough else almost already rather quite toward towards across along behind beside beyond during inside outside near onto per via cause cuz lol lmao omg hmm uhm umm ooh ahh huh mhm`.split(/\s+/),
)

function words(text: string): string[] {
  return (
    text
      .replace(/<[^>]+>/g, ' ')
      .replace(/\{\{[^}]*\}\}/g, ' ')
      .toLowerCase()
      .match(/[\p{L}][\p{L}'’]*[\p{L}]|[\p{L}]/gu) || []
  ).map(w => w.replace(/’/g, "'"))
}

function wordCount(text: string) {
  return (text.replace(/<[^>]+>/g, ' ').match(/\S+/g) || []).length
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

export class StatsBuilder {
  private months = new Array(12).fill(0)
  private weekdays = new Array(7).fill(0)
  private hours = new Array(24).fill(0)
  private days = new Map<string, number>()
  private personas = new Map<string, number>()
  private userWordMap = new Map<string, number>()
  private aiWordMap = new Map<string, number>()
  private chars = new Map<string, CharStat>()
  private chatStats: ChatStat[] = []
  private exclude: Set<string>
  private t = { messages: 0, userMessages: 0, aiMessages: 0, userWords: 0, aiWords: 0, chats: 0, newChats: 0, characters: 0, swipes: 0, activeDays: 0 }
  private nightUser = 0
  private mostSwiped: WrapStats['mostSwipedMessage'] = null
  private first: WrapStats['firstMessage'] = null

  constructor(
    private year: number,
    private tzOffset: number,
    private scope: Scope,
    private scopeName: string,
    excludeNames: string[],
  ) {
    // Character and persona names would otherwise top every word list.
    this.exclude = new Set(excludeNames.flatMap(n => words(n)))
  }

  /** Local date for a unix timestamp (seconds or ms), using the user's timezone offset. */
  private local(ts: number) {
    const ms = ts < 1e12 ? ts * 1000 : ts
    return new Date(ms - this.tzOffset * 60_000)
  }

  inYear(ts: number) {
    return !!ts && this.local(ts).getUTCFullYear() === this.year
  }

  addChat(chat: ChatMeta, messages: MsgLite[]): ChatStat | null {
    const cs: ChatStat = {
      id: chat.id,
      name: chat.name || 'Untitled chat',
      characterId: chat.characterId,
      characterName: chat.characterName,
      messages: 0,
      userMessages: 0,
      words: 0,
      swipes: 0,
      firstTs: 0,
      lastTs: 0,
    }

    for (const m of messages) {
      if (!this.inYear(m.send_date)) continue
      const d = this.local(m.send_date)
      const wc = wordCount(m.content)
      cs.messages++
      cs.words += wc
      if (!cs.firstTs || m.send_date < cs.firstTs) cs.firstTs = m.send_date
      if (m.send_date > cs.lastTs) cs.lastTs = m.send_date

      this.t.messages++
      this.months[d.getUTCMonth()]++
      const key = dayKey(d)
      this.days.set(key, (this.days.get(key) || 0) + 1)

      if (m.is_user) {
        cs.userMessages++
        this.t.userMessages++
        this.t.userWords += wc
        this.weekdays[d.getUTCDay()]++
        this.hours[d.getUTCHours()]++
        if (d.getUTCHours() < 5) this.nightUser++
        const persona = (m.name || '').trim()
        if (persona) this.personas.set(persona, (this.personas.get(persona) || 0) + 1)
        for (const w of words(m.content)) {
          if (w.length < 3 || STOP.has(w) || this.exclude.has(w)) continue
          this.userWordMap.set(w, (this.userWordMap.get(w) || 0) + 1)
        }
      } else {
        this.t.aiMessages++
        this.t.aiWords += wc
        const extra = Math.max(0, m.swipeCount - 1)
        cs.swipes += extra
        this.t.swipes += extra
        if (extra > 0 && (!this.mostSwiped || m.swipeCount > this.mostSwiped.swipes)) {
          this.mostSwiped = { chatName: cs.name, characterName: chat.characterName, swipes: m.swipeCount }
        }
        for (const w of words(m.content)) {
          if (w.length < 3 || STOP.has(w) || this.exclude.has(w)) continue
          this.aiWordMap.set(w, (this.aiWordMap.get(w) || 0) + 1)
        }
      }

      if (!this.first || m.send_date < this.first.ts) {
        this.first = { ts: m.send_date, characterName: chat.characterName, chatName: cs.name }
      }
    }

    if (!cs.messages) return null

    this.t.chats++
    if (this.inYear(chat.created)) this.t.newChats++
    this.chatStats.push(cs)

    const c = this.chars.get(chat.characterId) || {
      id: chat.characterId,
      name: chat.characterName,
      avatar: chat.avatar,
      chats: 0,
      messages: 0,
      userMessages: 0,
      words: 0,
    }
    c.chats++
    c.messages += cs.messages
    c.userMessages += cs.userMessages
    c.words += cs.words
    this.chars.set(chat.characterId, c)
    return cs
  }

  /** Characters ranked by chats this year, then messages. */
  rankedCharacters(): CharStat[] {
    return [...this.chars.values()].sort((a, b) => b.chats - a.chats || b.messages - a.messages)
  }

  chats(): ChatStat[] {
    return this.chatStats.slice()
  }

  finish(): WrapStats {
    const t = { ...this.t }
    t.characters = this.chars.size
    t.activeDays = this.days.size

    const byMessages = [...this.chars.values()].sort((a, b) => b.messages - a.messages)
    const chatsByMessages = this.chatStats.slice().sort((a, b) => b.messages - a.messages)
    const chatsBySwipes = this.chatStats.slice().sort((a, b) => b.swipes - a.swipes)

    let busiestDay: WrapStats['busiestDay'] = null
    for (const [date, n] of this.days) if (!busiestDay || n > busiestDay.messages) busiestDay = { date, messages: n }

    const topOf = (map: Map<string, number>, n: number) =>
      [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([word, count]) => ({ word, count }))

    const stats: WrapStats = {
      year: this.year,
      scope: this.scope,
      scopeName: this.scopeName,
      totals: t,
      topCharacters: byMessages.slice(0, 5),
      topChats: chatsByMessages.slice(0, 5),
      longestChat: chatsByMessages[0] || null,
      mostRerolledChat: chatsBySwipes[0]?.swipes ? chatsBySwipes[0] : null,
      mostSwipedMessage: this.mostSwiped,
      months: this.months,
      weekdays: this.weekdays,
      hours: this.hours,
      busiestMonth: argmax(this.months),
      busiestWeekday: argmax(this.weekdays),
      busiestHour: argmax(this.hours),
      busiestDay,
      nightOwlPct: t.userMessages ? Math.round((this.nightUser / t.userMessages) * 100) : 0,
      streak: longestStreak([...this.days.keys()]),
      personas: [...this.personas.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, messages]) => ({ name, messages })),
      topWords: topOf(this.userWordMap, 5),
      theirWords: topOf(this.aiWordMap, 5),
      avgUserWords: t.userMessages ? Math.round(t.userWords / t.userMessages) : 0,
      avgAiWords: t.aiMessages ? Math.round(t.aiWords / t.aiMessages) : 0,
      firstMessage: this.first,
      archetype: { id: '', name: '', blurb: '' },
    }
    stats.archetype = archetypeFor(stats)
    return stats
  }
}

function argmax(arr: number[]) {
  let best = 0
  for (let i = 1; i < arr.length; i++) if (arr[i] > arr[best]) best = i
  return best
}

function longestStreak(keys: string[]) {
  const sorted = keys.sort()
  let best = { days: 0, start: '', end: '' }
  let run = 0
  let start = ''
  let prev = 0
  for (const k of sorted) {
    const day = Date.parse(k + 'T00:00:00Z') / 86_400_000
    if (run && day === prev + 1) run++
    else {
      run = 1
      start = k
    }
    prev = day
    if (run > best.days) best = { days: run, start, end: k }
  }
  return best
}

export function archetypeFor(s: WrapStats): Archetype {
  const t = s.totals
  const topShare = t.messages ? (s.topCharacters[0]?.messages || 0) / t.messages : 0
  const swipeRate = t.aiMessages ? t.swipes / t.aiMessages : 0
  if (s.nightOwlPct >= 35)
    return { id: 'night_owl', name: 'The Night Owl', blurb: 'Your best scenes happen after midnight. The characters never sleep, and apparently neither do you.' }
  if (swipeRate >= 1)
    return { id: 'reroller', name: 'The Serial Reroller', blurb: 'You know exactly what you want, and you will swipe until you get it.' }
  if (topShare >= 0.55 && t.characters > 1)
    return { id: 'devotee', name: 'The Loyal Devotee', blurb: 'Other characters exist. You simply do not care.' }
  if (t.characters >= 15)
    return { id: 'collector', name: 'The Collector', blurb: 'A new character every week. You collect stories like ornaments.' }
  if (s.avgUserWords >= 120)
    return { id: 'novelist', name: 'The Novelist', blurb: 'Your replies have chapters. Your replies have footnotes.' }
  if (s.streak.days >= 30)
    return { id: 'regular', name: 'The Regular', blurb: 'Rain or shine, you showed up. Every. Single. Day.' }
  if (s.avgUserWords > 0 && s.avgUserWords <= 15)
    return { id: 'minimalist', name: 'The Minimalist', blurb: 'Short replies, big feelings. You let the bots do the talking.' }
  return { id: 'main_character', name: 'The Main Character', blurb: 'You showed up, you played, and you made it about you. Iconic.' }
}
