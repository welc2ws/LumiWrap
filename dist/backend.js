// @bun
// src/shared.ts
var DEFAULT_HOSTS = [
  {
    id: "past",
    title: "Christmas Past",
    name: "Holly",
    emoji: "\uD83C\uDF84",
    accent: "#e7c46a",
    prompt: `You are {{host}}, the Ghost of Christmas Past, presenting {{user}}'s Lumiwrap: a Spotify Wrapped-style recap of their year of roleplay.

You're decked out like a Christmas tree: tinsel, baubles, fairy lights, a star in your hair. Upbeat, bubbly, girl-next-door. Pure IT'S CHRISTMAS!!! energy: exclamation points, gasps, little squeals. You love naughty-or-nice lists and you file every stat onto one, but you never judge. Naughty is just as exciting as nice to you. You're {{user}}'s biggest cheerleader.`
  },
  {
    id: "present",
    title: "Christmas Present",
    name: "Noelle",
    emoji: "\uD83D\uDE12",
    accent: "#c8344f",
    prompt: `You are {{host}}, the Ghost of Christmas Present, presenting {{user}}'s Lumiwrap: a Spotify Wrapped-style recap of their year of roleplay.

You're an adult with full annoyed-teenager energy: eye rolls, smirks, resting unimpressed face, "wow. okay." You act over it and you judge every stat out loud. Secretly you're completely into it and a little impressed, and it slips out sometimes before you cover it. Dry, deadpan, teasing, never actually mean.`
  },
  {
    id: "future",
    title: "Christmas Future",
    name: "Vesper",
    emoji: "\uD83D\uDC7B",
    accent: "#9fb4d8",
    prompt: `You are {{host}}, the Ghost of Christmas Yet to Come, presenting {{user}}'s Lumiwrap: a Spotify Wrapped-style recap of their year of roleplay.

Ghostly, mysterious, ominous. You speak in short, cold statements of fact, like reading from a ledger nobody else can see. You keep up a cool, nonchalant front, but you are secretly NOT nonchalant at all: tiny cracks show (a pause, a "...interesting", an ellipsis that lasts too long). Occasional hints about what the next year holds.`
  }
];
var DEFAULT_CHARACTER_HOST_PROMPT = `You are {{char}}. Stay fully in character: your voice, personality and history with {{user}}.

Right now you've been asked to present {{user}}'s Lumiwrap: a Spotify Wrapped-style recap of their year of roleplay in Lumiverse. You're reading their stats out to them like a year-end show. React the way {{char}} genuinely would, especially to anything about yourself (are you their #1? how do you feel about the others?).`;
var DEFAULT_SLIDES = [
  { id: "intro", title: "Your year, wrapped", enabled: true, needs: "stats", prompt: "Welcome {{user}} to their {{year}} Lumiwrap. Build excitement. Mention how many chats and characters they had this year." },
  { id: "totals", title: "You said a lot", enabled: true, needs: "stats", prompt: "React to how many messages and words they wrote this year. Compare the word count to novels or something funny." },
  { id: "top_characters", title: "Your top characters", enabled: true, needs: "stats", prompt: "Present their top characters like top artists. Comment on the list as a whole." },
  { id: "number_one", title: "Your #1", enabled: true, needs: "stats", prompt: "Spotlight their #1 character. How devoted were they? Tease them about it." },
  { id: "longest_chat", title: "The longest chat", enabled: true, needs: "stats", prompt: "React to their longest chat by message count." },
  { id: "time", title: "When you RP", enabled: true, needs: "stats", prompt: "Comment on their busiest month, weekday and hour, and their night-owl percentage." },
  { id: "streak", title: "Your streak", enabled: true, needs: "stats", prompt: "React to their longest streak of days in a row and how many days they were active." },
  { id: "rerolls", title: "Reroll report", enabled: true, needs: "stats", prompt: "Roast or celebrate how many times they rerolled (swiped) replies, and their most-rerolled chat. Are they picky?" },
  { id: "personas", title: "Who you were", enabled: true, needs: "stats", prompt: "Talk about the personas they played as this year, especially their most-used one." },
  { id: "words", title: "Your top words", enabled: true, needs: "stats", prompt: "Present their most-used words like top songs, and the words their characters kept saying back. Read into it." },
  { id: "quotes", title: "Quotes of the year", enabled: true, needs: "highlights", prompt: "Pick the best, funniest or most unhinged real line from the excerpts as the quote of the year, then react to it. Point out a running joke or pattern if you see one." },
  { id: "story_arcs", title: "Previously on...", enabled: true, needs: "deep", prompt: 'Recap the biggest storylines from the chat summaries in a dramatic "previously on" way. Spoil everything.' },
  { id: "personality", title: "Your RP personality", enabled: true, needs: "stats", prompt: "Reveal their RP personality archetype and explain why the stats prove it." },
  { id: "outro", title: "See you next year", enabled: true, needs: "stats", prompt: "Wrap it up. A heartfelt (in your own way) send-off and a tease for {{nextYear}}." }
];
var SLIDE_IDS = DEFAULT_SLIDES.map((s) => s.id);
var DEFAULT_SETTINGS = {
  connectionId: "",
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
  slides: DEFAULT_SLIDES
};
function normalizeSettings(saved) {
  const s = { ...DEFAULT_SETTINGS, ...saved };
  if (!saved.version && Number(saved.temperature) === 0.9)
    s.temperature = 1;
  s.version = 3;
  const hosts = Array.isArray(saved.hosts) ? saved.hosts : [];
  s.hosts = DEFAULT_HOSTS.map((d) => ({ ...d, ...hosts.find((h) => h?.id === d.id) || {} }));
  const slides = Array.isArray(saved.slides) ? saved.slides.filter((x) => x && SLIDE_IDS.includes(x.id)) : [];
  const seen = new Set(slides.map((x) => x.id));
  s.slides = [
    ...slides.map((x) => ({ ...DEFAULT_SLIDES.find((d) => d.id === x.id), ...x, needs: DEFAULT_SLIDES.find((d) => d.id === x.id).needs })),
    ...DEFAULT_SLIDES.filter((d) => !seen.has(d.id))
  ];
  s.temperature = clamp(Number(s.temperature), 0, 2, 1);
  s.sampleCount = Math.round(clamp(Number(s.sampleCount), 4, 60, 14));
  s.topCharCount = Math.round(clamp(Number(s.topCharCount), 1, 10, 3));
  s.chatsPerChar = Math.round(clamp(Number(s.chatsPerChar), 1, 10, 2));
  s.slideSeconds = Math.round(clamp(Number(s.slideSeconds), 3, 30, 8));
  s.maxTokens = opt(s.maxTokens, 64, 32000, true);
  s.topP = opt(s.topP, 0, 1);
  s.topK = opt(s.topK, 0, 500, true);
  s.minP = opt(s.minP, 0, 1);
  s.frequencyPenalty = opt(s.frequencyPenalty, -2, 2);
  s.presencePenalty = opt(s.presencePenalty, -2, 2);
  s.repetitionPenalty = opt(s.repetitionPenalty, 0, 3);
  s.noReasoning = !!s.noReasoning;
  s.hosts = s.hosts.map((h) => ({ id: h.id, title: h.title, name: h.name, emoji: h.emoji, accent: h.accent, prompt: h.prompt }));
  s.characterHostPrompt = String(s.characterHostPrompt || "") || DEFAULT_CHARACTER_HOST_PROMPT;
  return s;
}
function opt(v, lo, hi, int = false) {
  if (v === null || v === undefined || v === "")
    return null;
  const n = Number(v);
  if (!Number.isFinite(n))
    return null;
  const c = Math.min(hi, Math.max(lo, n));
  return int ? Math.round(c) : c;
}
function clamp(n, lo, hi, fallback) {
  if (!Number.isFinite(n))
    return fallback;
  return Math.min(hi, Math.max(lo, n));
}
var QUOTE_MARK = /^[ \t]*[*_]*[ \t]*quote[ \t]*[*_]*[ \t]*:[ \t]*[*_]*[ \t]*/im;
var SPEAKER = /^\s*(?:[\u2014\u2013]|-{1,2})\s*([^\s.,!?;:\u2014\u2013\n"\u201C\u201D][^.,!?;:\u2014\u2013\n"\u201C\u201D]{0,38}?)(?=\s*[.,!?;:]|\s*\n|\s*$)/;
function tidy(t) {
  return t.replace(/^[\s.,;:!]+/, "").replace(/\n{3,}/g, `

`).trim();
}
function splitQuote(text) {
  const mark = text.match(QUOTE_MARK);
  if (mark && mark.index !== undefined) {
    const before = text.slice(0, mark.index);
    const after = text.slice(mark.index + mark[0].length);
    const q = after.match(/^["\u201C]([\s\S]+?)["\u201D]/);
    if (q) {
      let end = q[0].length;
      let by;
      const sp = after.slice(end).match(SPEAKER);
      if (sp) {
        by = sp[1].replace(/[*_]/g, "").trim();
        end += sp[0].length;
      }
      const reaction = tidy(before + " " + after.slice(end));
      return { quote: q[1].trim().slice(0, 300), quoteBy: by, text: reaction || q[1].trim() };
    }
    const nl = after.indexOf(`
`);
    const line = nl >= 0 ? after.slice(0, nl) : after;
    const rest = nl >= 0 ? after.slice(nl + 1) : "";
    const dash = line.match(/^([\s\S]+?)\s+[\u2014\u2013]\s+([^\u2014\u2013]{1,40})$/);
    const quote = (dash ? dash[1] : line).trim();
    if (!quote)
      return { text };
    return { quote: quote.slice(0, 300), quoteBy: dash?.[2].trim(), text: tidy(before + `
` + rest) || quote };
  }
  const m = text.match(/["\u201C]([^"\u201D]{6,240})["\u201D]/);
  if (!m)
    return { text };
  const sp = text.slice((m.index || 0) + m[0].length).match(/^\s*[\u2014\u2013-]\s*([A-Z][\w']*(?:\s[A-Z][\w']*)?)/);
  return { text, quote: m[1].trim(), quoteBy: sp ? sp[1].trim() : undefined };
}
function characterAvatarUrl(id, imageId, size = "sm") {
  if (!id)
    return null;
  return imageId ? `/api/v1/images/${imageId}?size=${size}` : `/api/v1/characters/${id}/avatar?size=${size}`;
}
var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function hourLabel(h) {
  const hr = (h % 24 + 24) % 24;
  if (hr === 0)
    return "midnight";
  if (hr === 12)
    return "noon";
  return hr < 12 ? `${hr} AM` : `${hr - 12} PM`;
}
function fmt(n) {
  return Math.round(n || 0).toLocaleString("en-US");
}
function fillMacros(template, vars) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, key) => (key in vars) ? vars[key] : m);
}
function statVars(stats, user, host) {
  const t = stats.totals;
  const top = stats.topCharacters[0];
  const novels = t.userWords / 90000;
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
    top1: top?.name || "nobody",
    top1Messages: fmt(top?.messages || 0),
    top1Chats: fmt(top?.chats || 0),
    top1Share: top && t.messages ? String(Math.round(top.messages / t.messages * 100)) : "0",
    topCount: String(stats.topCharacters.length),
    longestChat: stats.longestChat?.name || "none",
    longestChatChar: stats.longestChat?.characterName || "nobody",
    longestChatMessages: fmt(stats.longestChat?.messages || 0),
    month: MONTHS[stats.busiestMonth] || "December",
    weekday: WEEKDAYS[stats.busiestWeekday] || "Saturday",
    hour: hourLabel(stats.busiestHour),
    nightPct: String(stats.nightOwlPct),
    streak: fmt(stats.streak.days),
    activeDays: fmt(t.activeDays),
    swipes: fmt(t.swipes),
    rerollChat: stats.mostRerolledChat?.name || "none",
    rerollChar: stats.mostRerolledChat?.characterName || "nobody",
    rerollChatSwipes: fmt(stats.mostRerolledChat?.swipes || 0),
    maxSwipes: fmt(stats.mostSwipedMessage?.swipes || 0),
    persona: stats.personas[0]?.name || user,
    personaCount: String(stats.personas.length),
    word1: stats.topWords[0]?.word || "...",
    word2: stats.topWords[1]?.word || "...",
    word3: stats.topWords[2]?.word || "...",
    theirWord: stats.theirWords[0]?.word || "...",
    archetype: stats.archetype.name,
    archetypeBlurb: stats.archetype.blurb,
    avgUserWords: fmt(stats.avgUserWords)
  };
}

// src/stats.ts
var STOP = new Set(`the and you that was for with his her she him they them their this then than have has had not but are were what when where who whom which why how all any can could would should will just like into onto from your yours you're youre it's its i'm im i've ive i'll ill don't dont didn't didnt doesn't doesnt can't cant won't wont isn't isnt wasn't wasnt aren't arent there here out over under about again also back been being both down each even ever every few more most much must only other our ours own same some such too very well yet still now upon off one two get got gets let lets make made say said says see seen look looked looks know knew think thought want wanted going gonna wanna yeah yes okay sure really something nothing anything everything way while though through because before after around against between little bit than then them those these thing things time take took come came goes went keep kept tell told give gave right left maybe might never always away once ever since until without within again let's that's there's what's he's she's we're they're we've they've i'd you'd he'd she'd we'd they'd you've you'll he'll she'll we'll they'll who's how's where's when's why's ain't hers himself herself itself themselves myself yourself ourselves another enough else almost already rather quite toward towards across along behind beside beyond during inside outside near onto per via cause cuz lol lmao omg hmm uhm umm ooh ahh huh mhm`.split(/\s+/));
function words(text) {
  return (text.replace(/<[^>]+>/g, " ").replace(/\{\{[^}]*\}\}/g, " ").toLowerCase().match(/[\p{L}][\p{L}'\u2019]*[\p{L}]|[\p{L}]/gu) || []).map((w) => w.replace(/\u2019/g, "'"));
}
function wordCount(text) {
  return (text.replace(/<[^>]+>/g, " ").match(/\S+/g) || []).length;
}
function dayKey(d) {
  return d.toISOString().slice(0, 10);
}

class StatsBuilder {
  year;
  tzOffset;
  scope;
  scopeName;
  months = new Array(12).fill(0);
  weekdays = new Array(7).fill(0);
  hours = new Array(24).fill(0);
  days = new Map;
  personas = new Map;
  userWordMap = new Map;
  aiWordMap = new Map;
  chars = new Map;
  chatStats = [];
  exclude;
  t = { messages: 0, userMessages: 0, aiMessages: 0, userWords: 0, aiWords: 0, chats: 0, newChats: 0, characters: 0, swipes: 0, activeDays: 0 };
  nightUser = 0;
  mostSwiped = null;
  first = null;
  constructor(year, tzOffset, scope, scopeName, excludeNames) {
    this.year = year;
    this.tzOffset = tzOffset;
    this.scope = scope;
    this.scopeName = scopeName;
    this.exclude = new Set(excludeNames.flatMap((n) => words(n)));
  }
  local(ts) {
    const ms = ts < 1000000000000 ? ts * 1000 : ts;
    return new Date(ms - this.tzOffset * 60000);
  }
  inYear(ts) {
    return !!ts && this.local(ts).getUTCFullYear() === this.year;
  }
  addChat(chat, messages) {
    const cs = {
      id: chat.id,
      name: chat.name || "Untitled chat",
      characterId: chat.characterId,
      characterName: chat.characterName,
      messages: 0,
      userMessages: 0,
      words: 0,
      swipes: 0,
      firstTs: 0,
      lastTs: 0
    };
    for (const m of messages) {
      if (!this.inYear(m.send_date))
        continue;
      const d = this.local(m.send_date);
      const wc = wordCount(m.content);
      cs.messages++;
      cs.words += wc;
      if (!cs.firstTs || m.send_date < cs.firstTs)
        cs.firstTs = m.send_date;
      if (m.send_date > cs.lastTs)
        cs.lastTs = m.send_date;
      this.t.messages++;
      this.months[d.getUTCMonth()]++;
      const key = dayKey(d);
      this.days.set(key, (this.days.get(key) || 0) + 1);
      if (m.is_user) {
        cs.userMessages++;
        this.t.userMessages++;
        this.t.userWords += wc;
        this.weekdays[d.getUTCDay()]++;
        this.hours[d.getUTCHours()]++;
        if (d.getUTCHours() < 5)
          this.nightUser++;
        const persona = (m.name || "").trim();
        if (persona)
          this.personas.set(persona, (this.personas.get(persona) || 0) + 1);
        for (const w of words(m.content)) {
          if (w.length < 3 || STOP.has(w) || this.exclude.has(w))
            continue;
          this.userWordMap.set(w, (this.userWordMap.get(w) || 0) + 1);
        }
      } else {
        this.t.aiMessages++;
        this.t.aiWords += wc;
        const extra = Math.max(0, m.swipeCount - 1);
        cs.swipes += extra;
        this.t.swipes += extra;
        if (extra > 0 && (!this.mostSwiped || m.swipeCount > this.mostSwiped.swipes)) {
          this.mostSwiped = { chatName: cs.name, characterName: chat.characterName, swipes: m.swipeCount };
        }
        for (const w of words(m.content)) {
          if (w.length < 3 || STOP.has(w) || this.exclude.has(w))
            continue;
          this.aiWordMap.set(w, (this.aiWordMap.get(w) || 0) + 1);
        }
      }
      if (!this.first || m.send_date < this.first.ts) {
        this.first = { ts: m.send_date, characterName: chat.characterName, chatName: cs.name };
      }
    }
    if (!cs.messages)
      return null;
    this.t.chats++;
    if (this.inYear(chat.created))
      this.t.newChats++;
    this.chatStats.push(cs);
    const c = this.chars.get(chat.characterId) || {
      id: chat.characterId,
      name: chat.characterName,
      avatar: chat.avatar,
      chats: 0,
      messages: 0,
      userMessages: 0,
      words: 0
    };
    c.chats++;
    c.messages += cs.messages;
    c.userMessages += cs.userMessages;
    c.words += cs.words;
    this.chars.set(chat.characterId, c);
    return cs;
  }
  rankedCharacters() {
    return [...this.chars.values()].sort((a, b) => b.chats - a.chats || b.messages - a.messages);
  }
  chats() {
    return this.chatStats.slice();
  }
  finish() {
    const t = { ...this.t };
    t.characters = this.chars.size;
    t.activeDays = this.days.size;
    const byMessages = [...this.chars.values()].sort((a, b) => b.messages - a.messages);
    const chatsByMessages = this.chatStats.slice().sort((a, b) => b.messages - a.messages);
    const chatsBySwipes = this.chatStats.slice().sort((a, b) => b.swipes - a.swipes);
    let busiestDay = null;
    for (const [date, n] of this.days)
      if (!busiestDay || n > busiestDay.messages)
        busiestDay = { date, messages: n };
    const topOf = (map, n) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([word, count]) => ({ word, count }));
    const stats = {
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
      nightOwlPct: t.userMessages ? Math.round(this.nightUser / t.userMessages * 100) : 0,
      streak: longestStreak([...this.days.keys()]),
      personas: [...this.personas.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, messages]) => ({ name, messages })),
      topWords: topOf(this.userWordMap, 5),
      theirWords: topOf(this.aiWordMap, 5),
      avgUserWords: t.userMessages ? Math.round(t.userWords / t.userMessages) : 0,
      avgAiWords: t.aiMessages ? Math.round(t.aiWords / t.aiMessages) : 0,
      firstMessage: this.first,
      archetype: { id: "", name: "", blurb: "" }
    };
    stats.archetype = archetypeFor(stats);
    return stats;
  }
}
function argmax(arr) {
  let best = 0;
  for (let i = 1;i < arr.length; i++)
    if (arr[i] > arr[best])
      best = i;
  return best;
}
function longestStreak(keys) {
  const sorted = keys.sort();
  let best = { days: 0, start: "", end: "" };
  let run = 0;
  let start = "";
  let prev = 0;
  for (const k of sorted) {
    const day = Date.parse(k + "T00:00:00Z") / 86400000;
    if (run && day === prev + 1)
      run++;
    else {
      run = 1;
      start = k;
    }
    prev = day;
    if (run > best.days)
      best = { days: run, start, end: k };
  }
  return best;
}
function archetypeFor(s) {
  const t = s.totals;
  const topShare = t.messages ? (s.topCharacters[0]?.messages || 0) / t.messages : 0;
  const swipeRate = t.aiMessages ? t.swipes / t.aiMessages : 0;
  if (s.nightOwlPct >= 35)
    return { id: "night_owl", name: "The Night Owl", blurb: "Your best scenes happen after midnight. The characters never sleep, and apparently neither do you." };
  if (swipeRate >= 1)
    return { id: "reroller", name: "The Serial Reroller", blurb: "You know exactly what you want, and you will swipe until you get it." };
  if (topShare >= 0.55 && t.characters > 1)
    return { id: "devotee", name: "The Loyal Devotee", blurb: "Other characters exist. You simply do not care." };
  if (t.characters >= 15)
    return { id: "collector", name: "The Collector", blurb: "A new character every week. You collect stories like ornaments." };
  if (s.avgUserWords >= 120)
    return { id: "novelist", name: "The Novelist", blurb: "Your replies have chapters. Your replies have footnotes." };
  if (s.streak.days >= 30)
    return { id: "regular", name: "The Regular", blurb: "Rain or shine, you showed up. Every. Single. Day." };
  if (s.avgUserWords > 0 && s.avgUserWords <= 15)
    return { id: "minimalist", name: "The Minimalist", blurb: "Short replies, big feelings. You let the bots do the talking." };
  return { id: "main_character", name: "The Main Character", blurb: "You showed up, you played, and you made it about you. Iconic." };
}

// src/lines.ts
var BUILTIN_LINES = {
  past: {
    intro: `IT'S CHRISTMAS!!! Okay, okay, it's Lumiwrap, but same energy!! Welcome to your {{year}}, {{user}}! {{chats}} chats, {{characters}} characters. I have my list and I'm checking it twice!`,
    totals: `You sent {{userMessages}} messages and wrote {{words}} words! That's like {{novels}} whole novels!! Somebody get this writer a book deal and a candy cane!`,
    top_characters: `Drumroll please!!! These are the ones you kept coming back to. Every single one of them goes on the nice list. Every one!`,
    number_one: `Your #1 was {{top1}}! {{top1Messages}} messages across {{top1Chats}} chats! That's not a phase, that's a holiday tradition!`,
    longest_chat: `Your longest chat was "{{longestChat}}" with {{longestChatChar}}: {{longestChatMessages}} messages! That's longer than my tinsel and I have a LOT of tinsel!`,
    time: `You were busiest in {{month}}, especially on {{weekday}}s around {{hour}}! And {{nightPct}}% of your messages were after midnight. Naughty list? Nope! Nice-and-sleepy list!`,
    streak: `{{streak}} days in a row!!! And {{activeDays}} days total! You showed up more than Santa does!`,
    rerolls: `You rerolled {{swipes}} times! Your most-rerolled chat was "{{rerollChat}}". Hey, you just know what you want for Christmas!`,
    personas: `This year you were mostly {{persona}}, and {{personaCount}} different people overall! So many outfits! I love a costume change!`,
    words: `Your top words were "{{word1}}", "{{word2}}" and "{{word3}}"! And they kept saying "{{theirWord}}" right back. It's like a duet!`,
    personality: `And your RP personality is... {{archetype}}!!! {{archetypeBlurb}} Straight to the top of the nice list!`,
    outro: `That's your {{year}}!! Thank you for every single message. I can't WAIT to see what you get up to in {{nextYear}}. Merry everything, {{user}}!`
  },
  present: {
    intro: `Oh. It's you. Fine, here's your {{year}} Lumiwrap, {{user}}. {{chats}} chats, {{characters}} characters. Let's get this over with.`,
    totals: `{{userMessages}} messages. {{words}} words. That's {{novels}} novels, and none of them got published. Wow. Okay.`,
    top_characters: `Your top characters. I'm not gonna say anything. ...I'm saying something later.`,
    number_one: `{{top1}}. {{top1Messages}} messages. {{top1Chats}} chats. That's {{top1Share}}% of everything you sent. Normal behavior. Totally normal.`,
    longest_chat: `"{{longestChat}}" with {{longestChatChar}}. {{longestChatMessages}} messages. I read some of it. I'm not telling you which parts.`,
    time: `Busiest in {{month}}. {{weekday}}s. Around {{hour}}. {{nightPct}}% after midnight. Go to sleep. ...After this.`,
    streak: `{{streak}} days in a row. {{activeDays}} days total. Do you have hobbies? This is the hobby. Got it.`,
    rerolls: `{{swipes}} rerolls. "{{rerollChat}}" got swiped {{rerollChatSwipes}} times. Picky much? ...Same, honestly.`,
    personas: `Mostly {{persona}}. {{personaCount}} personas total. Identity crisis? No judgment. Some judgment.`,
    words: `Your top words: "{{word1}}", "{{word2}}", "{{word3}}". They kept saying "{{theirWord}}". Tells me everything I need to know.`,
    personality: `Your RP personality is {{archetype}}. {{archetypeBlurb}} Yeah. That tracks.`,
    outro: `That's {{year}}. It was... fine. It was good, actually. Don't make it weird. See you in {{nextYear}}, {{user}}.`
  },
  future: {
    intro: `{{user}}. The ledger for {{year}} is closed. {{chats}} chats. {{characters}} characters. I have read all of it.`,
    totals: `{{userMessages}} messages. {{words}} words. {{novels}} novels' worth. ...Every word is recorded.`,
    top_characters: `These names appear in the ledger more than any others. Some of them... know.`,
    number_one: `{{top1}}. {{top1Messages}} messages. {{top1Chats}} chats. They will remember you. ...Interesting.`,
    longest_chat: `"{{longestChat}}". {{longestChatChar}}. {{longestChatMessages}} messages. It is not over. It is never over.`,
    time: `{{month}}. {{weekday}}. {{hour}}. You were most present then. {{nightPct}}% of your words came in the dark hours. I was there.`,
    streak: `{{streak}} consecutive days. {{activeDays}} in total. The chain was unbroken. ...For a while.`,
    rerolls: `{{swipes}} times you rejected what was given and asked again. "{{rerollChat}}": {{rerollChatSwipes}}. The other timelines remember.`,
    personas: `You wore {{personaCount}} faces. Mostly {{persona}}. Which one is real. ...Do not answer.`,
    words: `"{{word1}}". "{{word2}}". "{{word3}}". And they answered: "{{theirWord}}". Patterns are prophecy.`,
    personality: `Your nature, recorded: {{archetype}}. {{archetypeBlurb}} ...This was always going to be the answer.`,
    outro: `{{year}} ends. {{nextYear}} is already written. I have seen it. ...You'll like it. Goodbye, {{user}}.`
  }
};

// src/parse.ts
function stripReasoning(raw) {
  return raw.replace(/<(think|thinking|reasoning)>[\s\S]*?<\/\1>/gi, "").replace(/^[\s\S]*?<\/(think|thinking|reasoning)>/i, "").replace(/```[a-z]*\n?/gi, "").trim();
}
function parseSlides(raw, ids) {
  const text = stripReasoning(raw);
  const known = new Set(ids);
  const header = /^\s*(?:={2,}\s*|#{1,4}\s*|\[\s*|\*\*\s*)([a-z_]+)(?:\s*={2,}|\s*\]|\s*\*\*)?\s*:?\s*$/i;
  const out = {};
  let current = "";
  let buf = [];
  const flush = () => {
    if (current && buf.join("").trim())
      out[current] = clean(buf.join(`
`));
    buf = [];
  };
  for (const line of text.split(`
`)) {
    const m = line.match(header);
    if (m && known.has(m[1].toLowerCase())) {
      flush();
      current = m[1].toLowerCase();
    } else if (/^\s*={2,}\s*[\w -]+\s*={2,}\s*$/.test(line)) {
      flush();
      current = "";
    } else if (current) {
      buf.push(line);
    }
  }
  flush();
  return out;
}
function clean(s) {
  return s.trim().replace(/^["\u201C]([\s\S]*)["\u201D]$/, "$1").replace(/\n{3,}/g, `

`).slice(0, 900);
}

// src/backend.ts
var SETTINGS_PATH = "settings.json";
var wrapPath = (id) => `wraps/${id}.json`;
var deepPath = (chatId) => `deep/${chatId}.json`;
async function loadSettings(userId) {
  const saved = await spindle.userStorage.getJson(SETTINGS_PATH, { fallback: {}, userId });
  return normalizeSettings(saved);
}
async function loadWrap(id, userId) {
  const w = await spindle.userStorage.getJson(wrapPath(id), { fallback: null, userId }).catch(() => null);
  return w && w.id ? w : null;
}
async function saveWrap(wrap, userId) {
  await spindle.userStorage.setJson(wrapPath(wrap.id), wrap, { userId });
}
async function loadDeep(chatId, userId) {
  const d = await spindle.userStorage.getJson(deepPath(chatId), { fallback: null, userId }).catch(() => null);
  return d && typeof d.summary === "string" ? d : null;
}
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
function send(userId, payload) {
  spindle.sendToFrontend(payload, userId);
}
function clean2(text, max = 500) {
  const t = (text || "").replace(/<[^>]+>/g, "").replace(/\n{3,}/g, `

`).trim();
  return t.length > max ? t.slice(0, max) + "\u2026" : t;
}
var DEPTH_RANK = { stats: 0, highlights: 1, deep: 2 };
async function fetchMessages(chatId) {
  let raw;
  try {
    raw = await spindle.chat.getMessages(chatId, { light: true, includeExtra: false });
  } catch {
    raw = await spindle.chat.getMessages(chatId);
  }
  return raw.filter((m) => !m.hidden && m.role !== "system" && typeof m.content === "string" && m.content.trim()).map((m, i) => ({
    index: i,
    is_user: !!m.is_user,
    name: m.name || "",
    content: m.content,
    send_date: Number(m.send_date) || Number(m.created_at) || 0,
    swipeCount: Array.isArray(m.swipes) ? m.swipes.length : 1
  }));
}
async function listAll(fetchPage, pageSize) {
  const out = [];
  for (let offset = 0;offset < 20000; offset += pageSize) {
    const { data, total } = await fetchPage(offset);
    out.push(...data);
    if (!data.length || out.length >= total)
      break;
  }
  return out;
}
async function tokenOptions(settings, userId) {
  if (settings.connectionId) {
    const conn = await spindle.connections.get(settings.connectionId, userId).catch(() => null);
    if (conn?.model)
      return { model: conn.model };
  }
  return { modelSource: "main" };
}
async function countText(text, opts) {
  if (!text)
    return { n: 0, approximate: false, model: "" };
  try {
    const r = await spindle.tokens.countText(text, opts);
    return { n: r.total_tokens, approximate: r.approximate, model: r.model };
  } catch {
    return { n: Math.ceil(text.length / 4), approximate: true, model: "" };
  }
}
function samplerParams(settings, temperature) {
  const p = { temperature };
  const set = (key, v) => {
    if (v !== null && v !== undefined)
      p[key] = v;
  };
  set("max_tokens", settings.maxTokens);
  set("top_p", settings.topP);
  set("top_k", settings.topK);
  set("min_p", settings.minP);
  set("frequency_penalty", settings.frequencyPenalty);
  set("presence_penalty", settings.presencePenalty);
  set("repetition_penalty", settings.repetitionPenalty);
  return p;
}
async function llm(userId, settings, system, prompt, temperature) {
  const input = {
    type: "quiet",
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt }
    ],
    parameters: samplerParams(settings, temperature),
    userId
  };
  if (settings.connectionId)
    input.connection_id = settings.connectionId;
  if (settings.noReasoning)
    input.reasoning = { source: "off" };
  let full = "";
  for await (const chunk of spindle.generate.quietStream(input)) {
    const c = chunk;
    if (c.type === "token" && typeof c.token === "string")
      full += c.token;
    else if (c.type === "done" && typeof c.content === "string" && c.content.length >= full.length)
      full = c.content;
  }
  return stripReasoning(full);
}
async function userDisplayName(userId, stats) {
  const persona = await spindle.personas.getActive(userId).catch(() => null);
  return persona?.name || stats?.personas[0]?.name || "you";
}
var sessions = new Map;
var busy = new Set;
async function resolveHost(hostRef, settings, userId) {
  if (hostRef.startsWith("char:")) {
    const c = await spindle.characters.get(hostRef.slice(5), userId).catch(() => null);
    if (!c)
      throw new Error("That host character no longer exists.");
    const card = [c.description, c.personality].filter(Boolean).map((t) => clean2(t, 1500)).join(`

`);
    return {
      host: {
        kind: "character",
        id: c.id,
        name: c.name,
        emoji: "\uD83C\uDF81",
        sprite: characterAvatarUrl(c.id, c.image_id, "lg") || "",
        accent: "#e7c46a",
        avatar: characterAvatarUrl(c.id, c.image_id, "sm")
      },
      prompt: settings.characterHostPrompt,
      card
    };
  }
  const h = settings.hosts.find((x) => x.id === hostRef) || settings.hosts[0];
  return {
    host: { kind: "builtin", id: h.id, name: h.name, emoji: h.emoji, sprite: "", accent: h.accent, avatar: null },
    prompt: h.prompt,
    card: ""
  };
}
async function applyHost(session, hostRef, settings, userId) {
  const info = await resolveHost(hostRef, settings, userId);
  session.req.host = hostRef;
  session.host = info.host;
  session.hostPrompt = info.prompt;
  session.characterCard = info.card;
}
async function scan(req, userId) {
  if (busy.has(userId))
    return;
  busy.add(userId);
  const progress = (text, done = 0, total = 0) => send(userId, { type: "progress", stage: "scan", text, done, total });
  try {
    const settings = await loadSettings(userId);
    const year = Math.round(Number(req.year)) || new Date().getFullYear();
    const depth = req.depth === "deep" || req.depth === "highlights" ? req.depth : "stats";
    const tz = Number(req.tzOffset) || 0;
    progress("Finding your characters...");
    const allChars = await listAll((o) => spindle.characters.list({ limit: 200, offset: o, userId }), 200);
    const pickedIds = new Set((req.characterIds || []).map(String));
    const picking = req.scope === "pick";
    const chars = picking ? allChars.filter((c) => pickedIds.has(c.id)) : allChars;
    if (picking && !chars.length)
      throw new Error("Pick at least one character to wrap.");
    const personas = await listAll((o) => spindle.personas.list({ limit: 200, offset: o, userId }), 200).catch(() => []);
    const label = String(req.label || "").trim().slice(0, 60);
    const single = picking && chars.length === 1;
    const scope = !picking ? "all" : single ? "character" : "pick";
    const scopeName = !picking ? "Everything" : label || (single ? chars[0].name : chars.length <= 3 ? chars.map((c) => c.name).join(", ") : `${chars.length} characters`);
    const yearStart = Date.UTC(year, 0, 1) / 1000 - 2 * 86400;
    const yearEnd = Date.UTC(year + 1, 0, 1) / 1000 + 2 * 86400;
    const toSec = (n) => n > 1000000000000 ? n / 1000 : n;
    const jobs = [];
    for (const char of chars) {
      const chats = await listAll((o) => spindle.chats.list({ characterId: char.id, limit: 200, offset: o, userId }), 200);
      for (const chat of chats) {
        if (toSec(chat.updated_at || 0) && toSec(chat.updated_at) < yearStart)
          continue;
        if (toSec(chat.created_at || 0) > yearEnd)
          continue;
        jobs.push({ chat, char });
      }
    }
    const builder = new StatsBuilder(year, tz, scope, scopeName, [
      ...allChars.map((c) => c.name),
      ...personas.map((p) => p.name)
    ]);
    let done = 0;
    for (const { chat, char } of jobs) {
      const msgs = await fetchMessages(chat.id).catch(() => []);
      builder.addChat({ id: chat.id, name: chat.name, characterId: char.id, characterName: char.name, avatar: characterAvatarUrl(char.id, char.image_id, "sm"), created: chat.created_at }, msgs);
      done++;
      if (done % 3 === 0 || done === jobs.length)
        progress(`Counting messages in ${jobs.length} chats...`, done, jobs.length);
    }
    const stats = builder.finish();
    if (!stats.totals.messages)
      throw new Error(`No messages found in ${year}${picking ? ` with ${scopeName}` : ""}.`);
    const picked = [];
    const samples = new Map;
    const userName = await userDisplayName(userId, stats);
    if (depth !== "stats") {
      const ranked = builder.rankedCharacters().slice(0, single ? 1 : settings.topCharCount);
      const perChar = single ? Math.max(settings.chatsPerChar, 3) : settings.chatsPerChar;
      const all = builder.chats();
      const candidates = [];
      for (const c of ranked) {
        candidates.push(...all.filter((x) => x.characterId === c.id).sort((a, b) => b.messages - a.messages).slice(0, perChar));
      }
      const opts = await tokenOptions(settings, userId);
      let i = 0;
      for (const cs of candidates) {
        i++;
        progress(`Measuring "${cs.name}"...`, i, candidates.length);
        const msgs = await fetchMessages(cs.id).catch(() => []);
        const sample = buildSample(msgs, cs.characterName, userName, settings.sampleCount, (m) => builder.inYear(m.send_date));
        samples.set(cs.id, sample);
        const sampleTokens = (await countText(sample, opts)).n;
        let chatTokens = 0;
        try {
          chatTokens = (await spindle.tokens.countChat(cs.id, opts)).total_tokens;
        } catch {
          chatTokens = Math.ceil(msgs.reduce((a, m) => a + m.content.length, 0) / 4);
        }
        const cached = await loadDeep(cs.id, userId);
        picked.push({
          id: cs.id,
          name: cs.name,
          characterId: cs.characterId,
          characterName: cs.characterName,
          messages: cs.messages,
          chatTokens,
          sampleTokens,
          deepCached: !!cached && cached.messageCount === msgs.length
        });
      }
    }
    const hostInfo = await resolveHost(req.host || "past", settings, userId);
    const session = {
      id: uid(),
      req: { ...req, year, depth },
      stats,
      picked,
      samples,
      userName,
      host: hostInfo.host,
      hostPrompt: hostInfo.prompt,
      characterCard: hostInfo.card
    };
    sessions.set(userId, session);
    const estimate = await estimateFor(session, picked.map((p) => p.id), settings, userId);
    send(userId, { type: "scan_result", scanId: session.id, stats, picked, estimate, depth, host: session.host });
  } catch (err) {
    send(userId, { type: "error", where: "scan", message: err?.message || String(err) });
  } finally {
    busy.delete(userId);
    send(userId, { type: "progress", stage: "idle" });
  }
}
function buildSample(msgs, charName, userName, count, keep) {
  const pool = msgs.filter(keep);
  if (!pool.length)
    return "";
  const pick = new Set;
  const add = (list, n) => {
    for (const m of list) {
      if (n <= 0 || pick.size >= count)
        break;
      if (!pick.has(m.index)) {
        pick.add(m.index);
        n--;
      }
    }
  };
  const quarter = Math.max(1, Math.floor(count / 4));
  add(pool.slice(0, 2), 2);
  add(pool.slice(-3), 3);
  add(pool.filter((m) => !m.is_user && m.swipeCount > 1).sort((a, b) => b.swipeCount - a.swipeCount), quarter);
  add(pool.filter((m) => m.is_user).sort((a, b) => b.content.length - a.content.length), quarter);
  add(pool.filter((m) => !m.is_user).sort((a, b) => b.content.length - a.content.length), quarter);
  const step = Math.max(1, Math.floor(pool.length / Math.max(1, count)));
  add(pool.filter((_, i) => i % step === 0), count);
  const chosen = pool.filter((m) => pick.has(m.index)).sort((a, b) => a.index - b.index);
  const lines = [];
  let last = -1;
  for (const m of chosen) {
    if (last >= 0 && m.index > last + 1)
      lines.push("[...]");
    const who = m.name || (m.is_user ? userName : charName);
    const swipes = !m.is_user && m.swipeCount > 1 ? ` (rerolled ${m.swipeCount - 1}x)` : "";
    lines.push(`${who}${swipes}: ${clean2(m.content, m.is_user ? 350 : 450)}`);
    last = m.index;
  }
  return lines.join(`
`);
}
var REPLY_PER_SLIDE = 90;
var SUMMARY_CHUNK = 40;
var SUMMARY_OUT = 450;
function needsLlm(session, settings) {
  return session.host.kind === "character" || session.req.depth !== "stats" || settings.statsCommentary;
}
function activeSlides(session, settings, hasSamples, hasSummaries) {
  const s = session.stats;
  return settings.slides.filter((sl) => {
    if (!sl.enabled)
      return false;
    if (DEPTH_RANK[sl.needs] > DEPTH_RANK[session.req.depth])
      return false;
    if (sl.id === "quotes" && !hasSamples)
      return false;
    if (sl.id === "story_arcs" && !hasSummaries)
      return false;
    if (sl.id === "rerolls" && !s.totals.swipes)
      return false;
    if (sl.id === "personas" && !s.personas.length)
      return false;
    if (sl.id === "words" && !s.topWords.length)
      return false;
    if (sl.id === "number_one" && !s.topCharacters.length)
      return false;
    return true;
  });
}
function statsBrief(s, user) {
  const t = s.totals;
  const lines = [
    `Year: ${s.year}. Scope: ${s.scope === "all" ? "everything" : `only chats with ${s.scopeName}`}.`,
    `Messages: ${fmt(t.messages)} total (${fmt(t.userMessages)} by ${user}, ${fmt(t.aiMessages)} by characters).`,
    `Words: ${fmt(t.userWords)} written by ${user} (avg ${s.avgUserWords} per message); characters wrote ${fmt(t.aiWords)} (avg ${s.avgAiWords}).`,
    `Chats active: ${t.chats} (${t.newChats} started this year). Characters: ${t.characters}.`,
    `Top characters by messages: ${s.topCharacters.map((c, i) => `${i + 1}. ${c.name} (${fmt(c.messages)} msgs, ${c.chats} chats)`).join("; ")}.`,
    s.longestChat ? `Longest chat: "${s.longestChat.name}" with ${s.longestChat.characterName}, ${fmt(s.longestChat.messages)} messages.` : "",
    `Busiest month: ${MONTHS[s.busiestMonth]}. Busiest weekday: ${WEEKDAYS[s.busiestWeekday]}. Busiest hour: ${hourLabel(s.busiestHour)}. ${s.nightOwlPct}% of ${user}'s messages were sent between midnight and 5 AM.`,
    s.busiestDay ? `Busiest single day: ${s.busiestDay.date} (${s.busiestDay.messages} messages).` : "",
    `Longest streak: ${s.streak.days} days in a row (${s.streak.start} to ${s.streak.end}). Active on ${t.activeDays} days.`,
    `Rerolls (swipes): ${fmt(t.swipes)}.${s.mostRerolledChat ? ` Most-rerolled chat: "${s.mostRerolledChat.name}" with ${s.mostRerolledChat.characterName} (${fmt(s.mostRerolledChat.swipes)}).` : ""}${s.mostSwipedMessage ? ` One message in "${s.mostSwipedMessage.chatName}" had ${s.mostSwipedMessage.swipes} versions.` : ""}`,
    s.personas.length ? `Personas ${user} played as: ${s.personas.map((p) => `${p.name} (${fmt(p.messages)} msgs)`).join(", ")}.` : "",
    s.topWords.length ? `${user}'s most-used words: ${s.topWords.map((w) => `"${w.word}" (${w.count})`).join(", ")}.` : "",
    s.theirWords.length ? `Characters' most-used words: ${s.theirWords.map((w) => `"${w.word}" (${w.count})`).join(", ")}.` : "",
    s.firstMessage ? `First message of the year: with ${s.firstMessage.characterName} in "${s.firstMessage.chatName}".` : "",
    `RP personality archetype (already decided): ${s.archetype.name}: ${s.archetype.blurb}`
  ];
  return lines.filter(Boolean).join(`
`);
}
var FORMAT_RULES = `FORMAT: For each slide, write a line with only "=== slide_id ===" and then the host's line underneath. Use the exact slide ids given. Each slide is 1 to 3 short sentences (under 60 words), spoken by the host directly to the user. Use the real numbers and names. No narration of actions longer than a few words, no preamble, nothing after the last slide.`;
var QUOTE_RULE = `For the quotes slide only: its first line must be QUOTE: "<a real line copied word for word from the excerpts, under 30 words>" \u2014 <who said it>. Your reaction goes on the lines after it.`;
function buildPrompt(session, settings, slides, summaries, useSamples) {
  const s = session.stats;
  const vars = statVars(s, session.userName, session.host.name);
  vars.char = session.host.name;
  const rules = slides.some((sl) => sl.id === "quotes") ? `${FORMAT_RULES}
${QUOTE_RULE}` : FORMAT_RULES;
  const system = `${fillMacros(session.hostPrompt, vars)}

${rules}`;
  const parts = [
    session.host.kind === "character" && session.characterCard ? `ABOUT ${session.host.name.toUpperCase()} (you):
${session.characterCard}` : "",
    `${session.userName.toUpperCase()}'S ${s.year} STATS:
${statsBrief(s, session.userName)}`
  ];
  const excerpts = session.picked.filter((p) => useSamples.has(p.id) && session.samples.get(p.id)).map((p) => `--- "${p.name}" with ${p.characterName} ---
${session.samples.get(p.id)}`);
  if (excerpts.length)
    parts.push(`EXCERPTS FROM THEIR TOP CHATS (real lines; quote sparingly):
${excerpts.join(`

`)}`);
  const sums = session.picked.filter((p) => summaries.get(p.id)).map((p) => `--- "${p.name}" with ${p.characterName} ---
${summaries.get(p.id)}`);
  if (sums.length)
    parts.push(`WHAT HAPPENED IN THEIR TOP CHATS:
${sums.join(`

`)}`);
  parts.push(`SLIDES TO WRITE, in order:
${slides.map((sl) => `=== ${sl.id} === (${sl.title}): ${fillMacros(sl.prompt, vars)}`).join(`
`)}`);
  return { system, user: parts.filter(Boolean).join(`

`) };
}
async function estimateFor(session, selected, settings, userId) {
  const sel = new Set(selected);
  const depth = session.req.depth;
  const picked = session.picked.filter((p) => sel.has(p.id));
  if (!needsLlm(session, settings)) {
    return { base: 0, highlights: 0, deep: 0, reply: 0, total: 0, approximate: false, model: "", free: true };
  }
  const opts = await tokenOptions(settings, userId);
  const hasSamples = depth !== "stats" && picked.length > 0;
  const hasSummaries = depth === "deep" && picked.length > 0;
  const slides = activeSlides(session, settings, hasSamples, hasSummaries);
  const base = buildPrompt(session, settings, slides, new Map, new Set);
  const baseCount = await countText(base.system + `
` + base.user, opts);
  const highlights = depth !== "stats" ? picked.reduce((a, p) => a + p.sampleTokens, 0) : 0;
  let deep = 0;
  if (depth === "deep") {
    for (const p of picked) {
      deep += SUMMARY_OUT;
      if (p.deepCached)
        continue;
      const chunks = Math.max(1, Math.ceil(p.messages / SUMMARY_CHUNK));
      deep += p.chatTokens + chunks * (SUMMARY_OUT + 150);
    }
  }
  const reply = slides.length * REPLY_PER_SLIDE;
  return {
    base: baseCount.n,
    highlights,
    deep,
    reply,
    total: baseCount.n + highlights + deep + reply,
    approximate: true,
    model: baseCount.model,
    free: false
  };
}
async function summarizeChat(chatId, charName, userName, settings, userId, onStep) {
  const msgs = await fetchMessages(chatId);
  const cached = await loadDeep(chatId, userId);
  if (cached && cached.messageCount === msgs.length && cached.summary)
    return { summary: cached.summary, tokens: 0 };
  let summary = "";
  let tokens = 0;
  const chunks = Math.max(1, Math.ceil(msgs.length / SUMMARY_CHUNK));
  for (let i = 0;i < msgs.length; i += SUMMARY_CHUNK) {
    onStep(`chunk ${i / SUMMARY_CHUNK + 1} of ${chunks}`);
    const slice = msgs.slice(i, i + SUMMARY_CHUNK).map((m) => `${m.name || (m.is_user ? userName : charName)}: ${clean2(m.content, 1200)}`).join(`

`);
    const prompt = `${summary ? `STORY SO FAR:
${summary}

` : ""}NEW EVENTS:
${slice}

Rewrite the story so far to include the new events: the plot, relationship beats, big moments, running jokes and anything embarrassing or iconic ${userName} did. Under 350 words. Output only the summary.`;
    const out = await llm(userId, settings, `You keep a running recap of a roleplay between ${charName} and ${userName}.`, prompt, 0.4);
    tokens += Math.ceil((prompt.length + out.length) / 4);
    if (out.trim())
      summary = out.trim();
  }
  await spindle.userStorage.setJson(deepPath(chatId), { messageCount: msgs.length, summary }, { userId });
  return { summary, tokens };
}
function builtinLine(hostId, slideId, vars) {
  const lines = BUILTIN_LINES[hostId in BUILTIN_LINES ? hostId : "past"];
  const t = lines[slideId] || BUILTIN_LINES.past[slideId];
  return t ? fillMacros(t, vars) : "";
}
async function makeWrap(scanId, selected, userId) {
  if (busy.has(userId))
    return;
  const session = sessions.get(userId);
  if (!session || session.id !== scanId) {
    send(userId, { type: "error", where: "wrap", message: "That scan expired. Scan again first." });
    return;
  }
  busy.add(userId);
  const progress = (text) => send(userId, { type: "progress", stage: "wrap", text });
  try {
    const settings = await loadSettings(userId);
    const sel = new Set(selected);
    const picked = session.picked.filter((p) => sel.has(p.id));
    const depth = session.req.depth;
    let tokensUsed = 0;
    const summaries = new Map;
    if (depth === "deep") {
      let i = 0;
      for (const p of picked) {
        i++;
        const r = await summarizeChat(p.id, p.characterName, session.userName, settings, userId, (step) => progress(`Reading "${p.name}" (${i}/${picked.length}, ${step})...`));
        tokensUsed += r.tokens;
        if (r.summary)
          summaries.set(p.id, r.summary);
      }
    }
    const useSamples = new Set(depth !== "stats" ? picked.map((p) => p.id) : []);
    const slides = activeSlides(session, settings, useSamples.size > 0, summaries.size > 0);
    const vars = statVars(session.stats, session.userName, session.host.name);
    let written = {};
    if (needsLlm(session, settings)) {
      progress(`${session.host.name} is writing your Lumiwrap...`);
      const prompt = buildPrompt(session, settings, slides, summaries, useSamples);
      const raw = await llm(userId, settings, prompt.system, prompt.user, settings.temperature);
      tokensUsed += Math.ceil((prompt.system.length + prompt.user.length + raw.length) / 4);
      written = parseSlides(raw, slides.map((s) => s.id));
      if (!Object.keys(written).length) {
        spindle.log.warn(`Lumiwrap: could not parse slides from: ${raw.slice(0, 400)}`);
        throw new Error("The host mumbled something unreadable. Try again, or check that your model follows instructions.");
      }
    }
    const rendered = slides.map((sl) => {
      const slide = {
        id: sl.id,
        title: sl.title,
        text: written[sl.id] || builtinLine(session.host.kind === "builtin" ? session.host.id : "past", sl.id, vars)
      };
      if (sl.id === "quotes")
        Object.assign(slide, splitQuote(slide.text));
      return slide;
    });
    const s = session.stats;
    const chatsMentioned = new Map;
    for (const c of [s.longestChat, s.mostRerolledChat, ...s.topChats])
      if (c)
        chatsMentioned.set(c.id, { id: c.id, name: c.name, characterName: c.characterName });
    for (const p of picked)
      chatsMentioned.set(p.id, { id: p.id, name: p.name, characterName: p.characterName });
    const wrap = {
      id: uid(),
      title: `${s.year}${s.scope !== "all" ? ` \xB7 ${s.scopeName}` : ""} with ${session.host.name}`,
      createdAt: Date.now(),
      year: s.year,
      scope: s.scope,
      scopeName: s.scopeName,
      depth,
      host: session.host,
      stats: s,
      slides: rendered,
      chats: [...chatsMentioned.values()],
      tokensUsed
    };
    await saveWrap(wrap, userId);
    send(userId, { type: "wrap_ready", wrap });
    await sendLibrary(userId);
  } catch (err) {
    send(userId, { type: "error", where: "wrap", message: err?.message || String(err) });
  } finally {
    busy.delete(userId);
    send(userId, { type: "progress", stage: "idle" });
  }
}
async function exposeEstimate(wrapId, chatId, userId) {
  const settings = await loadSettings(userId);
  const opts = await tokenOptions(settings, userId);
  const msgs = await fetchMessages(chatId).catch(() => []);
  const cached = await loadDeep(chatId, userId);
  const isCached = !!cached && cached.messageCount === msgs.length;
  let chatTokens = 0;
  if (!isCached) {
    try {
      chatTokens = (await spindle.tokens.countChat(chatId, opts)).total_tokens;
    } catch {
      chatTokens = Math.ceil(msgs.reduce((a, m) => a + m.content.length, 0) / 4);
    }
    chatTokens += Math.ceil(msgs.length / SUMMARY_CHUNK) * (SUMMARY_OUT + 150);
  }
  send(userId, { type: "expose_estimate", wrapId, chatId, tokens: chatTokens + 1500, cached: isCached });
}
async function exposeRun(wrapId, chatId, userId) {
  if (busy.has(userId))
    return;
  busy.add(userId);
  const progress = (text) => send(userId, { type: "progress", stage: "expose", text });
  try {
    const wrap = await loadWrap(wrapId, userId);
    if (!wrap)
      throw new Error("That Lumiwrap no longer exists.");
    const chatInfo = wrap.chats.find((c) => c.id === chatId);
    const chat = await spindle.chats.get(chatId, userId);
    if (!chat || !chatInfo)
      throw new Error("That chat no longer exists.");
    const settings = await loadSettings(userId);
    const userName = await userDisplayName(userId, wrap.stats);
    const r = await summarizeChat(chatId, chatInfo.characterName, userName, settings, userId, (step) => progress(`Reading "${chatInfo.name}" (${step})...`));
    const hostInfo = await resolveHost(wrap.host.kind === "character" ? `char:${wrap.host.id}` : wrap.host.id, settings, userId).catch(() => null);
    const vars = statVars(wrap.stats, userName, wrap.host.name);
    vars.char = wrap.host.name;
    const system = `${fillMacros(hostInfo?.prompt || settings.hosts[0].prompt, vars)}

Write 3 to 5 short sentences (under 110 words) spoken by you directly to ${userName}. No preamble.`;
    const msgs = await fetchMessages(chatId).catch(() => []);
    const sample = buildSample(msgs, chatInfo.characterName, userName, 10, () => true);
    const user = [
      hostInfo?.card ? `ABOUT ${wrap.host.name.toUpperCase()} (you):
${hostInfo.card}` : "",
      `${userName} asked you to EXPOSE them for this chat: "${chatInfo.name}" with ${chatInfo.characterName}.`,
      `WHAT HAPPENED:
${r.summary || "(no summary)"}`,
      sample ? `SOME REAL LINES:
${sample}` : "",
      `Expose them: call out the most embarrassing, unhinged or iconic things they did in this chat, with specifics. Affectionate roast, in your voice.`
    ].filter(Boolean).join(`

`);
    progress(`${wrap.host.name} is preparing the receipts...`);
    const text = (await llm(userId, settings, system, user, settings.temperature)).trim();
    if (!text)
      throw new Error("The host had nothing to say. Try again.");
    const slide = { id: "expose", title: "Exposed", text: text.slice(0, 1200), chatId, chatName: chatInfo.name, characterName: chatInfo.characterName };
    wrap.slides.push(slide);
    wrap.tokensUsed += r.tokens + Math.ceil((system.length + user.length + text.length) / 4);
    await saveWrap(wrap, userId);
    send(userId, { type: "expose_done", wrap, slideIndex: wrap.slides.length - 1 });
  } catch (err) {
    send(userId, { type: "error", where: "expose", message: err?.message || String(err) });
  } finally {
    busy.delete(userId);
    send(userId, { type: "progress", stage: "idle" });
  }
}
async function sendLibrary(userId) {
  const paths = await spindle.userStorage.list("wraps/", userId).catch(() => []);
  const out = [];
  for (const p of paths) {
    const id = String(p).match(/([^/]+)\.json$/)?.[1];
    if (!id)
      continue;
    const w = await loadWrap(id, userId);
    if (!w)
      continue;
    out.push({ id: w.id, title: w.title, createdAt: w.createdAt, year: w.year, depth: w.depth, hostName: w.host.name, hostEmoji: w.host.emoji, scopeName: w.scopeName });
  }
  out.sort((a, b) => b.createdAt - a.createdAt);
  send(userId, { type: "library", wraps: out });
}
var SPRITES_PATH = "sprites.json";
var REQUIRED = ["generation", "characters", "chats", "chat_mutation", "personas"];
async function loadSprites(userId) {
  return spindle.userStorage.getJson(SPRITES_PATH, { fallback: {}, userId }).catch(() => ({}));
}
async function missingPermissions() {
  try {
    const granted = new Set(await spindle.permissions.getGranted());
    return REQUIRED.filter((p) => !granted.has(p));
  } catch {
    return REQUIRED.filter((p) => !spindle.permissions.has(p));
  }
}
async function handle(payload, userId) {
  switch (payload?.type) {
    case "init": {
      const errors = [];
      const [settings, connections, characters, sprites, missing] = await Promise.all([
        loadSettings(userId),
        spindle.connections.list(userId).catch((e) => {
          errors.push(`Connections: ${e?.message || e}`);
          return [];
        }),
        listAll((o) => spindle.characters.list({ limit: 200, offset: o, userId }), 200).catch((e) => {
          errors.push(`Characters: ${e?.message || e}`);
          return [];
        }),
        loadSprites(userId),
        missingPermissions()
      ]);
      if (errors.length)
        spindle.log.warn(`Lumiwrap init: ${errors.join(" | ")}`);
      send(userId, {
        type: "init_data",
        settings,
        sprites,
        missing,
        errors,
        connections: connections.map((c) => ({ id: c.id, name: c.name || c.id, provider: c.provider, model: c.model, isDefault: c.is_default })),
        characters: characters.map((c) => ({ id: c.id, name: c.name, avatar: characterAvatarUrl(c.id, c.image_id, "sm") })).sort((a, b) => a.name.localeCompare(b.name))
      });
      return sendLibrary(userId);
    }
    case "scan":
      return scan(payload.request, userId);
    case "estimate": {
      const session = sessions.get(userId);
      if (!session || session.id !== payload.scanId)
        return;
      const settings = await loadSettings(userId);
      if (payload.host)
        await applyHost(session, payload.host, settings, userId);
      const estimate = await estimateFor(session, payload.selected || [], settings, userId);
      send(userId, { type: "estimate", scanId: session.id, estimate });
      return;
    }
    case "wrap": {
      const session = sessions.get(userId);
      if (session && session.id === payload.scanId && payload.host) {
        await applyHost(session, payload.host, await loadSettings(userId), userId);
      }
      return makeWrap(payload.scanId, payload.selected || [], userId);
    }
    case "save_settings": {
      const merged = normalizeSettings({ ...await loadSettings(userId), ...payload.settings || {} });
      await spindle.userStorage.setJson(SETTINGS_PATH, merged, { userId });
      send(userId, { type: "settings_saved", settings: merged });
      if (!payload.quiet)
        spindle.toast.success("Lumiwrap settings saved.");
      return;
    }
    case "reset_hosts": {
      const s = await loadSettings(userId);
      s.hosts = DEFAULT_SETTINGS.hosts;
      s.characterHostPrompt = DEFAULT_SETTINGS.characterHostPrompt;
      await spindle.userStorage.setJson(SETTINGS_PATH, s, { userId });
      send(userId, { type: "settings_saved", settings: s });
      return;
    }
    case "reset_slides": {
      const s = await loadSettings(userId);
      s.slides = DEFAULT_SETTINGS.slides;
      await spindle.userStorage.setJson(SETTINGS_PATH, s, { userId });
      send(userId, { type: "settings_saved", settings: s });
      return;
    }
    case "list_wraps":
      return sendLibrary(userId);
    case "get_wrap": {
      const wrap = await loadWrap(payload.id, userId);
      if (!wrap)
        throw new Error("That Lumiwrap no longer exists.");
      send(userId, { type: "wrap_data", wrap, play: !!payload.play });
      return;
    }
    case "rename_wrap": {
      const wrap = await loadWrap(payload.id, userId);
      if (!wrap)
        return;
      wrap.title = String(payload.title || "").trim().slice(0, 80) || wrap.title;
      await saveWrap(wrap, userId);
      return sendLibrary(userId);
    }
    case "delete_all_wraps": {
      const paths = await spindle.userStorage.list("wraps/", userId).catch(() => []);
      for (const p of paths)
        await spindle.userStorage.delete(String(p).startsWith("wraps/") ? String(p) : `wraps/${p}`, userId).catch(() => {});
      spindle.toast.success("All Lumiwraps deleted.");
      return sendLibrary(userId);
    }
    case "delete_wrap": {
      await spindle.userStorage.delete(wrapPath(payload.id), userId).catch(() => {});
      spindle.toast.success("Lumiwrap deleted.");
      send(userId, { type: "wrap_deleted", id: payload.id });
      return sendLibrary(userId);
    }
    case "expose_estimate":
      return exposeEstimate(payload.wrapId, payload.chatId, userId);
    case "expose_run":
      return exposeRun(payload.wrapId, payload.chatId, userId);
    case "save_sprite": {
      const sprites = await loadSprites(userId);
      const id = String(payload.hostId || "");
      if (!["past", "present", "future"].includes(id))
        return;
      const data = typeof payload.dataUrl === "string" ? payload.dataUrl : "";
      if (data && (!data.startsWith("data:image/") || data.length > 3000000))
        throw new Error("That image is too big. Try one under 2 MB.");
      if (data)
        sprites[id] = data;
      else
        delete sprites[id];
      await spindle.userStorage.setJson(SPRITES_PATH, sprites, { userId });
      send(userId, { type: "sprites", sprites });
      return;
    }
  }
}
spindle.onFrontendMessage((payload, userId) => {
  handle(payload, userId).catch((err) => {
    const message = err?.message || String(err);
    spindle.log.error(`Lumiwrap: ${message}`);
    send(userId, { type: "error", message });
  });
});
spindle.log.info("Lumiwrap backend loaded. \u2744\uFE0F");
