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

// src/styles.ts
var STYLES = `
/* ================= sidebar ================= */
.lw {
  --lw-berry: #c8344f;
  --lw-berry-deep: #8d1f33;
  --lw-pine: #2f8a63;
  --lw-gold: #d9b45a;
  --lw-gold-soft: #f3d27a;
  --lw-radius: var(--lumiverse-radius, 10px);
  display: flex; flex-direction: column; gap: 10px;
  padding: 12px; box-sizing: border-box; height: 100%; width: 100%; max-width: 100%; overflow-y: auto; overflow-x: hidden;
  color: var(--lumiverse-text); font-size: 14px;
}
.lw *, .lw *::before, .lw *::after { box-sizing: border-box; }
.lw [hidden] { display: none !important; }
.lw section { display: flex; flex-direction: column; gap: 10px; }
.lw svg { flex: none; }

/* header */
.lw-head { display: flex; align-items: center; gap: 10px; }
.lw-logo { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; flex: none; color: var(--lw-berry);
  background: radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--lw-gold) 30%, transparent), color-mix(in srgb, var(--lw-berry) 14%, transparent) 70%);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--lw-gold) 35%, transparent); }
.lw-logo svg { width: 22px; height: 22px; transform: rotate(-8deg); }
.lw-title { font-weight: 800; font-size: 17px; letter-spacing: .01em; }
.lw-tagline { font-size: 12px; color: var(--lumiverse-text-muted); font-style: italic; }

/* nav */
.lw-nav { display: flex; gap: 2px; border-bottom: 1px solid var(--lumiverse-border); }
.lw-nav button { flex: 1; min-width: 0; padding: 8px 2px; background: none; border: none; border-bottom: 2px solid transparent;
  color: var(--lumiverse-text-muted); font-weight: 700; cursor: pointer; font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lw-nav button:hover { color: var(--lumiverse-text); }
.lw-nav button.active { color: var(--lumiverse-text); border-bottom-color: var(--lw-berry); }

/* banner */
.lw-banner { padding: 10px 12px; border-radius: var(--lw-radius); font-size: 12.5px; line-height: 1.45;
  background: color-mix(in srgb, var(--lw-gold) 12%, transparent); border: 1px solid color-mix(in srgb, var(--lw-gold) 45%, transparent); }
.lw-banner p { margin: 4px 0; }
.lw-banner ul { margin: 2px 0 8px; padding-left: 18px; }

/* cards */
.lw-card { display: flex; flex-direction: column; gap: 10px; padding: 12px;
  background: var(--lumiverse-fill-subtle); border: 1px solid var(--lumiverse-border); border-radius: var(--lw-radius); }
.lw-card-title { font-weight: 800; font-size: 14px; }
.lw-card-title small { font-weight: 400; color: var(--lumiverse-text-muted); }
.lw-step { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 14px; }
.lw-ornament { position: relative; width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; flex: none;
  font-size: 11px; font-weight: 900; color: #fff; background: radial-gradient(circle at 35% 30%, #e8627a, var(--lw-berry) 60%, var(--lw-berry-deep)); margin-top: 3px; }
.lw-ornament::before { content: ''; position: absolute; top: -4px; left: 50%; width: 7px; height: 4px; transform: translateX(-50%);
  border-radius: 2px 2px 0 0; background: var(--lw-gold); }
.lw-hint { margin: 0; font-size: 12px; color: var(--lumiverse-text-muted); line-height: 1.45; }
.lw-hint code { font-size: 11px; padding: 1px 4px; border-radius: 4px; background: var(--lumiverse-fill); overflow-wrap: anywhere; }
.lw-warn { color: var(--lumiverse-danger, #d9534f) !important; }
.lw-pad { padding: 8px; }

/* inputs */
.lw-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.lw-field > span { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--lumiverse-text-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lw input[type="text"], .lw input[type="number"], .lw select, .lw textarea {
  width: 100%; max-width: 100%; min-width: 0; padding: 7px 9px; font: inherit; font-size: 13px; color: var(--lumiverse-text);
  background: var(--lumiverse-fill); border: 1px solid var(--lumiverse-border); border-radius: var(--lw-radius); }
.lw input::placeholder { color: var(--lumiverse-text-muted); opacity: .7; }
.lw input[type="color"] { width: 100%; height: 33px; padding: 3px; border: 1px solid var(--lumiverse-border); border-radius: var(--lw-radius); background: var(--lumiverse-fill); cursor: pointer; }
.lw textarea { resize: vertical; line-height: 1.45; }
.lw input:focus, .lw select:focus, .lw textarea:focus { outline: none; border-color: var(--lw-gold); }
.lw input[type="checkbox"] { accent-color: var(--lw-berry); }
.lw-check { display: flex; gap: 8px; align-items: center; font-size: 13px; cursor: pointer; line-height: 1.35; }

.lw-grid2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
.lw-grid3 { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, .8fr) minmax(0, .8fr); gap: 8px; }
.lw-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.lw-grow { flex: 1; width: auto; }

/* year + scope */
.lw-yearrow { display: flex; align-items: center; justify-content: center; gap: 10px; }
.lw input.lw-year { width: 110px; text-align: center; font-size: 22px; font-weight: 900; padding: 4px; background: transparent; border-color: transparent;
  -moz-appearance: textfield; }
.lw input.lw-year::-webkit-inner-spin-button, .lw input.lw-year::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.lw input.lw-year:hover { border-color: var(--lumiverse-border); }
.lw-round { width: 32px; height: 32px; flex: none; display: grid; place-items: center; padding: 0; cursor: pointer; border-radius: 50%; font-size: 17px; line-height: 1;
  background: var(--lumiverse-fill); color: var(--lumiverse-text); border: 1px solid var(--lumiverse-border); }
.lw-round:hover { border-color: var(--lw-gold); }
.lw-seg { display: grid; grid-template-columns: 1fr 1fr; padding: 3px; gap: 3px; border-radius: 999px; background: var(--lumiverse-fill); border: 1px solid var(--lumiverse-border); }
.lw-seg button { padding: 7px 6px; border: none; border-radius: 999px; background: none; cursor: pointer; font: inherit; font-size: 12.5px; font-weight: 700;
  color: var(--lumiverse-text-muted); }
.lw-seg button.on { color: #fff; background: linear-gradient(180deg, #d84a63, var(--lw-berry)); box-shadow: 0 1px 0 var(--lw-berry-deep); }

/* depth tiles */
.lw-depths { display: flex; flex-direction: column; gap: 6px; }
.lw-depth { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; cursor: pointer; text-align: left; font: inherit; color: var(--lumiverse-text);
  background: var(--lumiverse-fill); border: 1px solid var(--lumiverse-border); border-radius: var(--lw-radius); transition: border-color .15s, background .15s; }
.lw-depth:hover { border-color: color-mix(in srgb, var(--lw-gold) 60%, var(--lumiverse-border)); }
.lw-depth.on { border-color: var(--lw-gold); background: color-mix(in srgb, var(--lw-gold) 10%, var(--lumiverse-fill)); box-shadow: 0 0 0 1px var(--lw-gold) inset; }
.lw-depth-icon { font-size: 20px; width: 26px; text-align: center; flex: none; }
.lw-depth-text { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.3; }
.lw-depth-text b { font-size: 13px; }
.lw-depth-text small { font-size: 11.5px; color: var(--lumiverse-text-muted); }
.lw-tag { flex: none; font-size: 10px; font-weight: 800; padding: 3px 7px; border-radius: 999px; text-transform: uppercase; letter-spacing: .04em; }
.lw-tag-stats { color: #fff; background: var(--lw-pine); }
.lw-tag-highlights { color: #3b2a07; background: var(--lw-gold-soft); }
.lw-tag-deep { color: #fff; background: var(--lw-berry); }

/* buttons */
.lw-primary { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
  padding: 11px 14px; border: none; border-radius: 999px; cursor: pointer; font-weight: 800; font-size: 14px; color: #fff;
  background: linear-gradient(180deg, #dc5069, var(--lw-berry)); box-shadow: 0 2px 0 var(--lw-berry-deep), inset 0 1px 0 rgba(255,255,255,.22);
  transition: transform .1s, filter .15s; }
.lw-primary svg { width: 18px; height: 18px; color: #fff; }
.lw-primary:hover:not(:disabled) { filter: brightness(1.06); }
.lw-primary:active:not(:disabled) { transform: translateY(2px); box-shadow: none; }
.lw-primary:disabled { opacity: .6; cursor: default; }
.lw-primary.loading svg { animation: lw-spin 1.6s linear infinite; }
.lw-slim { padding: 9px 14px; font-size: 13px; }
.lw-ghost { display: inline-flex; align-items: center; gap: 5px; padding: 7px 12px; border-radius: 999px; cursor: pointer; font-weight: 600; font-size: 12px;
  background: none; color: var(--lumiverse-text-muted); border: 1px solid var(--lumiverse-border); }
.lw-ghost svg { width: 13px; height: 13px; }
.lw-ghost:hover:not(:disabled) { color: var(--lumiverse-text); border-color: var(--lw-gold); }
.lw-ghost.armed, .lw-ghost-danger:hover:not(:disabled) { color: var(--lumiverse-danger, #d9534f); border-color: var(--lumiverse-danger, #d9534f); }
.lw-small { padding: 4px 10px; font-size: 11px; }
.lw-danger { padding: 9px 12px; border-radius: var(--lw-radius); cursor: pointer; font-weight: 700; font-size: 12px;
  background: none; color: var(--lumiverse-danger, #d9534f); border: 1px solid color-mix(in srgb, var(--lumiverse-danger, #d9534f) 60%, transparent); }
.lw-danger.armed { color: #fff; background: var(--lumiverse-danger, #d9534f); }
.lw-linkbtn { align-self: flex-start; padding: 0; border: none; background: none; cursor: pointer; font-size: 11.5px; color: var(--lumiverse-text-muted); text-decoration: underline; }
.lw-linkbtn:hover { color: var(--lumiverse-text); }
.lw-iconbtn { width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; padding: 0 8px; cursor: pointer; border-radius: 999px;
  background: none; color: var(--lumiverse-text-muted); border: 1px solid transparent; font-size: 11px; font-weight: 700; }
.lw-iconbtn svg { width: 16px; height: 16px; }
.lw-iconbtn:hover { color: var(--lumiverse-text); background: var(--lumiverse-fill-subtle); }
.lw-iconbtn-danger:hover, .lw-iconbtn.armed { color: var(--lumiverse-danger, #d9534f); border-color: color-mix(in srgb, var(--lumiverse-danger, #d9534f) 50%, transparent); }
.lw-iconbtn.armed { width: auto; }

.lw-status { font-size: 12px; line-height: 1.4; }
.lw-status:empty { display: none; }
.lw-status.info { color: var(--lumiverse-text-muted); }
.lw-status.error { padding: 8px 10px; border-radius: var(--lw-radius); color: var(--lumiverse-danger, #d9534f);
  background: color-mix(in srgb, var(--lumiverse-danger, #d9534f) 10%, transparent); }

.lw-progress { display: flex; flex-direction: column; gap: 6px; }
.lw-progress-text { font-size: 12px; color: var(--lumiverse-text-muted); }
.lw-progress-bar { height: 7px; border-radius: 999px; background: var(--lumiverse-fill); overflow: hidden; border: 1px solid var(--lumiverse-border); }
.lw-progress-bar i { display: block; height: 100%; border-radius: 999px; transition: width .2s;
  background: repeating-linear-gradient(-45deg, var(--lw-berry) 0 7px, #fff 7px 12px); background-size: 34px 34px; }
.lw-progress-bar i.indeterminate { animation: lw-candy 1s linear infinite; }

/* host tiles */
.lw-hosts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.lw-host-tile { position: relative; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 12px 6px 10px; cursor: pointer; text-align: center;
  background: var(--lumiverse-fill); color: var(--lumiverse-text); border: 1px solid var(--lumiverse-border); border-radius: var(--lw-radius); font: inherit;
  transition: border-color .15s, background .15s, transform .1s; }
.lw-host-tile:hover { border-color: color-mix(in srgb, var(--tile) 70%, var(--lumiverse-border)); }
.lw-host-tile:active { transform: scale(.98); }
.lw-host-tile.on { border-color: var(--tile); background: color-mix(in srgb, var(--tile) 14%, var(--lumiverse-fill)); box-shadow: 0 0 0 1px var(--tile) inset; }
.lw-host-tile.on::after { content: '✓'; position: absolute; top: 6px; right: 8px; font-size: 11px; font-weight: 900; color: var(--tile); }
.lw-tile-art { width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; font-size: 26px; overflow: hidden; flex: none;
  background: color-mix(in srgb, var(--tile, #d9b45a) 22%, transparent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--tile, #d9b45a) 45%, transparent); }
.lw-tile-pfp { position: relative; width: 100%; height: 100%; display: grid; place-items: center; font-size: 15px; font-weight: 800; }
.lw-tile-pfp .lw-av-img { position: absolute; inset: 0; background-size: cover; background-position: center top; }
.lw-tile-art img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
.lw-tile-name { font-weight: 800; font-size: 13px; margin-top: 4px; }
.lw-tile-sub { font-size: 11px; color: var(--lumiverse-text-muted); }

/* scan result: gift tag */
.lw-tagcard { position: relative; display: flex; flex-direction: column; gap: 10px; padding: 16px 12px 12px; border-radius: var(--lw-radius);
  background: linear-gradient(180deg, color-mix(in srgb, var(--lw-gold) 9%, var(--lumiverse-fill-subtle)), var(--lumiverse-fill-subtle));
  border: 1.5px dashed color-mix(in srgb, var(--lw-gold) 60%, var(--lumiverse-border)); animation: lw-in .25s ease; }
.lw-tag-hole { position: absolute; top: -9px; left: 50%; width: 16px; height: 16px; transform: translateX(-50%); border-radius: 50%;
  background: var(--lumiverse-fill-subtle); border: 2px solid var(--lw-gold); }
.lw-tag-title { text-align: center; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: var(--lumiverse-text-muted); }
.lw-found { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.lw-found-grid { display: grid; grid-template-columns: repeat(3, 1fr); width: 100%; text-align: center; }
.lw-found-grid b { display: block; font-size: 19px; font-weight: 900; }
.lw-found-grid small { font-size: 11px; color: var(--lumiverse-text-muted); }
.lw-sublabel { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--lumiverse-text-muted); margin-bottom: 4px; }
.lw-sublabel small { text-transform: none; letter-spacing: 0; font-weight: 400; }
.lw-picked { display: flex; flex-direction: column; border: 1px solid var(--lumiverse-border); border-radius: 8px; max-height: 260px; overflow-y: auto; background: var(--lumiverse-fill); }
.lw-pick { display: flex; align-items: center; gap: 9px; padding: 8px 9px; cursor: pointer; border-bottom: 1px solid var(--lumiverse-border); }
.lw-pick:last-child { border-bottom: none; }
.lw-pick:hover { background: var(--lumiverse-fill-subtle); }
.lw-pick-text { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.3; }
.lw-pick-text b { font-size: 13px; overflow-wrap: anywhere; }
.lw-pick-text small { font-size: 11.5px; color: var(--lumiverse-text-muted); }
.lw-pick-cost { flex: none; font-size: 11.5px; font-weight: 700; color: var(--lumiverse-text-muted); }
.lw-pick-cost.free { color: var(--lw-pine); }
.lw-cost { padding: 10px; border-radius: 8px; text-align: center; background: var(--lumiverse-fill); }
.lw-cost-big { font-size: 24px; font-weight: 900; color: var(--lw-gold); }
.lw-cost-big small { font-size: 12px; font-weight: 600; color: var(--lumiverse-text-muted); }

/* library */
.lw-lib { display: flex; flex-direction: column; gap: 8px; }
.lw-libitem { display: flex; align-items: center; gap: 6px; padding: 6px 6px 6px 8px; border-radius: var(--lw-radius);
  background: var(--lumiverse-fill-subtle); border: 1px solid var(--lumiverse-border); animation: lw-in .2s ease; }
.lw-lib-main { flex: 1; min-width: 0; display: flex; align-items: center; gap: 10px; padding: 2px; cursor: pointer; text-align: left;
  background: none; border: none; color: var(--lumiverse-text); font: inherit; }
.lw-lib-art { position: relative; width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; font-size: 22px; flex: none; overflow: hidden;
  background: linear-gradient(160deg, #1f6b4f, #0f3d2e); }
.lw-lib-art img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
.lw-lib-art i { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(0,0,0,.45); color: #fff; opacity: 0; transition: opacity .15s; }
.lw-lib-art i svg { width: 18px; height: 18px; }
.lw-lib-main:hover .lw-lib-art i { opacity: 1; }
@media (hover: none) { .lw-lib-art i { opacity: .55; background: rgba(0,0,0,.25); } }
.lw-lib-text { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.3; }
.lw-lib-text b { font-size: 13px; overflow-wrap: anywhere; }
.lw-lib-text small { font-size: 11.5px; color: var(--lumiverse-text-muted); }
.lw-lib-actions { display: flex; gap: 2px; flex: none; }
.lw-rename { display: flex; gap: 6px; width: 100%; align-items: center; }
.lw-rename input { flex: 1; }
.lw-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px 12px; text-align: center; color: var(--lumiverse-text-muted); }
.lw-empty svg { width: 44px; height: 44px; color: var(--lw-berry); opacity: .8; transform: rotate(-8deg); }
.lw-empty p { margin: 0; font-size: 13px; line-height: 1.5; }

/* slides editor */
.lw-slides { display: flex; flex-direction: column; gap: 6px; }
.lw-slide-row { padding: 7px 8px; border-radius: 8px; background: var(--lumiverse-fill); border: 1px solid var(--lumiverse-border); transition: opacity .15s; }
.lw-slide-row.off { opacity: .5; }
.lw-slide-head { display: flex; align-items: center; gap: 6px; }
.lw input.lw-slide-title { flex: 1; min-width: 0; padding: 4px 6px; font-weight: 700; background: transparent; border-color: transparent; }
.lw input.lw-slide-title:hover, .lw input.lw-slide-title:focus { border-color: var(--lumiverse-border); background: var(--lumiverse-fill-subtle); }
.lw-badge { flex: none; font-size: 9.5px; font-weight: 800; padding: 2px 6px; border-radius: 999px; text-transform: uppercase; letter-spacing: .03em;
  background: color-mix(in srgb, var(--lw-pine) 22%, transparent); }
.lw-badge-highlights { background: color-mix(in srgb, var(--lw-gold) 30%, transparent); }
.lw-badge-deep { background: color-mix(in srgb, var(--lw-berry) 28%, transparent); }
.lw-move { display: flex; flex-direction: column; flex: none; }
.lw-move button { width: 22px; height: 13px; padding: 0; border: none; background: none; cursor: pointer; font-size: 8px; line-height: 1; color: var(--lumiverse-text-muted); }
.lw-move button:hover:not(:disabled) { color: var(--lumiverse-text); }
.lw-move button:disabled { opacity: .25; cursor: default; }
.lw-slide-row details, .lw-prompt-box { margin-top: 2px; }
.lw-slide-row summary, .lw-prompt-box summary { cursor: pointer; font-size: 12px; color: var(--lumiverse-text-muted); padding: 2px 0; }
.lw-slide-row summary:hover, .lw-prompt-box summary:hover { color: var(--lumiverse-text); }
.lw-slide-row textarea, .lw-prompt-box textarea { margin-top: 6px; }
.lw-switch { position: relative; flex: none; width: 32px; height: 18px; cursor: pointer; }
.lw-switch input { position: absolute; opacity: 0; inset: 0; margin: 0; cursor: pointer; z-index: 1; }
.lw-switch i { position: absolute; inset: 0; border-radius: 999px; background: var(--lumiverse-border); transition: background .15s; }
.lw-switch i::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: #fff; transition: transform .15s;
  box-shadow: 0 1px 2px rgba(0,0,0,.3); }
.lw-switch input:checked + i { background: var(--lw-pine); }
.lw-switch input:checked + i::after { transform: translateX(14px); }

/* host editor */
.lw-host-eds { display: flex; flex-direction: column; gap: 10px; }
.lw-host-ed { border-top: 3px solid var(--tile); }
.lw-host-ed-head { display: flex; align-items: center; gap: 12px; }
.lw-host-ed-meta { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.lw-sprite-box { width: 64px; height: 84px; border-radius: 12px; display: grid; place-items: center; font-size: 34px; overflow: hidden; flex: none;
  background: linear-gradient(180deg, color-mix(in srgb, var(--tile) 25%, transparent), color-mix(in srgb, var(--tile) 8%, transparent));
  border: 1px solid color-mix(in srgb, var(--tile) 45%, var(--lumiverse-border)); }
.lw-sprite-box img { width: 100%; height: 100%; object-fit: contain; object-position: bottom; }

/* character pickers */
.lw-pickwrap { display: flex; flex-direction: column; gap: 8px; }
.lw-cp { display: flex; flex-direction: column; gap: 6px; }
.lw-pill { width: 100%; min-width: 0; display: flex; align-items: center; gap: 9px; padding: 6px 10px 6px 6px; cursor: pointer; text-align: left;
  background: var(--lumiverse-fill); color: var(--lumiverse-text); border: 1px solid var(--lumiverse-border); border-radius: 999px; font: inherit; }
.lw-pill:hover, .lw-pill.open { border-color: var(--lw-gold); }
.lw-pill-av { flex: none; display: flex; }
.lw-pill-text { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.25; }
.lw-pill-main { font-weight: 800; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lw-pill-sub { font-size: 11.5px; color: var(--lumiverse-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lw-pill-chev { width: 18px; height: 18px; flex: none; color: var(--lumiverse-text-muted); transition: transform .15s; }
.lw-pill-chev svg { width: 18px; height: 18px; }
.lw-pill.open .lw-pill-chev { transform: rotate(180deg); }
.lw-mini { position: relative; width: 30px; height: 30px; border-radius: 50%; flex: none; display: grid; place-items: center; font-weight: 800; font-size: 11px; overflow: hidden; }
.lw-mini .lw-av-img { position: absolute; inset: 0; background-size: cover; background-position: center top; }
.lw-mini-empty { color: var(--lw-berry); background: color-mix(in srgb, var(--lw-gold) 18%, transparent); }
.lw-mini-empty svg { width: 17px; height: 17px; }
.lw-stack { display: flex; }
.lw-stack .lw-mini { box-shadow: 0 0 0 2px var(--lumiverse-fill); }
.lw-stack .lw-mini + .lw-mini { margin-left: -10px; }
.lw-cp-panel { display: flex; flex-direction: column; gap: 6px; padding: 8px; border: 1px solid var(--lumiverse-border); border-radius: var(--lw-radius);
  background: var(--lumiverse-fill-subtle); animation: lw-in .15s ease; }
.lw-cp-list { display: flex; flex-direction: column; max-height: 280px; overflow-y: auto; overscroll-behavior: contain; }
.lw-cp-row { display: flex; align-items: center; gap: 9px; width: 100%; padding: 6px; cursor: pointer; text-align: left; background: none; border: none;
  border-radius: 8px; color: var(--lumiverse-text); font: inherit; }
.lw-cp-row:hover { background: var(--lumiverse-fill); }
.lw-cp-row.on { background: color-mix(in srgb, var(--lw-berry) 12%, transparent); }
.lw-cp-name { flex: 1; min-width: 0; font-weight: 700; font-size: 13px; overflow-wrap: anywhere; }
.lw-cp-box { width: 20px; height: 20px; flex: none; display: grid; place-items: center; border-radius: 6px; font-size: 12px; font-weight: 900; color: #fff;
  border: 1.5px solid var(--lumiverse-border); }
.lw-cp-row.on .lw-cp-box { background: var(--lw-berry); border-color: var(--lw-berry); }
.lw-cp-tick { color: var(--lw-berry); font-weight: 900; }
.lw-cp-foot { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding-top: 4px; border-top: 1px solid var(--lumiverse-border); }
.lw-cp-count { flex: 1; font-size: 11.5px; color: var(--lumiverse-text-muted); text-align: right; }

/* settings */
.lw-conn-row { display: flex; gap: 6px; align-items: center; }
.lw-conn-row select { flex: 1; }

@keyframes lw-candy { to { background-position: 34px 0; } }
@keyframes lw-spin { to { transform: rotate(360deg); } }
@keyframes lw-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }

/* ================= player ================= */
.lw-mount { position: relative; z-index: 2147483000; }
.lw-player { position: fixed; inset: 0; z-index: 2147483000; display: grid; place-items: center; outline: none;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #fff; -webkit-tap-highlight-color: transparent; }
.lw-player *, .lw-player *::before, .lw-player *::after { box-sizing: border-box; }
.lw-player [hidden] { display: none !important; }
.lw-player.lw-in-modal { position: relative; inset: auto; height: min(82vh, 760px); }
.lw-backdrop { position: absolute; inset: 0; background: rgba(4, 10, 8, .78); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.lw-in-modal .lw-backdrop { display: none; }

.lw-stage { --lw-accent: #e7c46a; --lw-hi: #f3d27a; position: relative; overflow: hidden; container-type: size;
  width: min(100vw, calc(100dvh * 9 / 16), 460px); height: min(100dvh, calc(min(100vw, 460px) * 16 / 9));
  border-radius: 22px; box-shadow: 0 30px 80px rgba(0,0,0,.55); transition: background .6s ease;
  background: radial-gradient(120% 80% at 50% 0%, #2a7a5b 0%, #0f3d2e 55%, #08261c 100%); }
.lw-in-modal .lw-stage { width: 100%; height: 100%; border-radius: 14px; }
@media (max-width: 600px) { .lw-stage { width: 100vw; height: 100dvh; border-radius: 0; } }

.lw-stage[data-theme="cranberry"] { --lw-hi: #ffe0a3; background: radial-gradient(120% 80% at 50% 0%, #e0566e 0%, #9e1f37 55%, #4d0b19 100%); }
.lw-stage[data-theme="midnight"] { background: radial-gradient(120% 80% at 50% 0%, #3a4f86 0%, #17213f 55%, #0a0f20 100%); }
.lw-stage[data-theme="gold"] { --lw-hi: #fff8e1; background: radial-gradient(120% 80% at 50% 0%, #f2d78c 0%, #b48a2c 50%, #5b3f0d 100%); }
.lw-stage[data-theme="nye"] { background: radial-gradient(120% 80% at 50% 10%, #2b2440 0%, #0e0b18 60%, #050409 100%); }

.lw-snow { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.lw-snow i { position: absolute; top: -10px; border-radius: 50%; background: #fff; animation: lw-fall linear infinite; filter: blur(.3px); }
@keyframes lw-fall { to { transform: translate3d(30px, calc(100cqh + 20px), 0); } }

.lw-bars { position: absolute; top: 10px; left: 10px; right: 10px; display: flex; gap: 4px; z-index: 5; }
.lw-bars span { flex: 1; height: 3px; border-radius: 3px; background: rgba(255,255,255,.3); overflow: hidden; }
.lw-bars b { display: block; height: 100%; background: #fff; }

.lw-topbar { position: absolute; top: 20px; left: 12px; right: 8px; display: flex; align-items: center; gap: 6px; z-index: 6; }
.lw-brand { font-weight: 800; font-size: 13px; letter-spacing: .04em; text-shadow: 0 1px 4px rgba(0,0,0,.4); }
.lw-spacer { flex: 1; }
.lw-x { flex: none; width: 30px; height: 30px; border-radius: 50%; border: none; cursor: pointer; font-size: 13px; color: #fff; background: rgba(0,0,0,.28); }
.lw-x:hover { background: rgba(0,0,0,.45); }

.lw-slide { position: absolute; inset: 64px 20px 0 20px; bottom: 34cqh; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 1.6cqh; text-align: center; text-shadow: 0 2px 10px rgba(0,0,0,.25); }
.lw-slide.lw-enter > * { animation: lw-rise .55s cubic-bezier(.2,.8,.2,1) both; }
.lw-slide.lw-enter > *:nth-child(2) { animation-delay: .08s; }
.lw-slide.lw-enter > *:nth-child(3) { animation-delay: .16s; }
.lw-slide.lw-enter > *:nth-child(4) { animation-delay: .24s; }
.lw-slide.lw-enter > *:nth-child(5) { animation-delay: .32s; }
.lw-kicker { font-size: max(12px, 3.2cqw); font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--lw-hi); }
.lw-huge { font-size: clamp(26px, 10cqw, 52px); font-weight: 900; line-height: 1.02; letter-spacing: -.01em; overflow-wrap: anywhere; }
.lw-big { font-size: clamp(44px, 19cqw, 96px); font-weight: 900; line-height: 1; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.lw-mid { font-size: clamp(22px, 8cqw, 40px); font-weight: 900; font-variant-numeric: tabular-nums; }
.lw-label { font-size: max(12px, 3.4cqw); font-weight: 700; opacity: .85; margin-top: -.6cqh; }
.lw-sub { font-size: max(13px, 3.6cqw); opacity: .9; line-height: 1.35; max-width: 92%; }
.lw-gold { color: var(--lw-hi); }
.lw-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; width: 100%; margin-top: 1cqh; }
.lw-gift, .lw-dice, .lw-film, .lw-star { font-size: clamp(40px, 16cqw, 80px); animation: lw-bob 2.4s ease-in-out infinite; }
.lw-candles { font-size: clamp(22px, 8cqw, 38px); letter-spacing: 2px; }
.lw-quote-title { font-size: clamp(20px, 7cqw, 34px); font-weight: 800; font-style: italic; overflow-wrap: anywhere; }
.lw-quote-mark { font-size: clamp(80px, 34cqw, 170px); line-height: .7; font-weight: 900; color: var(--lw-hi); opacity: .8; font-family: Georgia, serif; }

.lw-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
.lw-chips span { padding: 6px 10px; border-radius: 999px; background: rgba(0,0,0,.25); font-size: max(12px, 3.3cqw); }

.lw-list { list-style: none; margin: 0; padding: 0; width: 100%; display: flex; flex-direction: column; gap: 1.2cqh; text-align: left; }
.lw-list li { display: flex; align-items: center; gap: 10px; padding: 1cqh 10px; border-radius: 14px; background: rgba(0,0,0,.2); animation: lw-rise .5s both; }
.lw-list li:nth-child(2) { animation-delay: .1s; } .lw-list li:nth-child(3) { animation-delay: .2s; }
.lw-list li:nth-child(4) { animation-delay: .3s; } .lw-list li:nth-child(5) { animation-delay: .4s; }
.lw-rank { width: 1.4em; font-size: clamp(18px, 7cqw, 30px); font-weight: 900; color: var(--lw-hi); text-align: center; flex: none; }
.lw-li-text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.lw-li-text b { font-size: max(14px, 4.3cqw); overflow-wrap: anywhere; line-height: 1.2; }
.lw-li-text small { font-size: max(11px, 3cqw); opacity: .8; }
.lw-av, .lw-av-xl { flex: none; border-radius: 50%; display: grid; place-items: center; font-weight: 800; overflow: hidden; }
.lw-av { width: clamp(30px, 10cqw, 44px); height: clamp(30px, 10cqw, 44px); font-size: 13px; }
.lw-av-xl { width: clamp(80px, 32cqw, 150px); height: clamp(80px, 32cqw, 150px); font-size: 34px; border: 4px solid var(--lw-hi); box-shadow: 0 10px 30px rgba(0,0,0,.35); }
.lw-img { background-size: cover; background-position: center; }
.lw-av, .lw-av-xl { position: relative; }
.lw-av-img { position: absolute; inset: 0; border-radius: inherit; background-size: cover; background-position: center top; }

/* quotes */
.lw-quote { margin: -4cqh 0 0; padding: 0 6px; font-size: clamp(18px, 6.4cqw, 30px); font-weight: 800; line-height: 1.25; font-style: italic;
  overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 7; -webkit-box-orient: vertical; overflow: hidden; }
.lw-quote-by { font-size: max(13px, 3.6cqw); font-weight: 700; color: var(--lw-hi); }

/* expose menu */
.lw-menu { width: 100%; display: flex; flex-direction: column; gap: 8px; max-height: 40cqh; overflow-y: auto; padding: 2px; }
.lw-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 14px; cursor: pointer; text-align: left;
  border: 1.5px solid rgba(255,255,255,.25); background: rgba(0,0,0,.25); color: #fff; font: inherit; }
.lw-menu-item:hover { background: rgba(0,0,0,.4); border-color: rgba(255,255,255,.6); }
.lw-menu-item span { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.lw-menu-item b { font-size: max(14px, 3.9cqw); overflow-wrap: anywhere; }
.lw-menu-item small { font-size: max(11px, 3cqw); opacity: .75; }
.lw-menu-item i { flex: none; font-style: normal; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em;
  padding: 4px 9px; border-radius: 999px; background: var(--lw-hi); color: #2b1a05; }
.lw-menu-item.done i { background: rgba(255,255,255,.2); color: #fff; }
.lw-next-hint { padding: 7px 14px; border-radius: 999px; border: none; cursor: pointer; font: inherit; font-weight: 800; font-size: 13px;
  color: #fff; background: rgba(255,255,255,.14); }
.lw-next-hint:hover { background: rgba(255,255,255,.24); }
.lw-stage[data-slide="expose_menu"] .lw-host { height: 17cqh; }
.lw-stage[data-slide="expose_menu"] .lw-slide { bottom: 19cqh; justify-content: flex-start; padding-top: 2cqh; }
.lw-sprite.lw-sprite-pfp { align-items: flex-end; }
.lw-sprite.lw-sprite-pfp img { width: 100%; max-width: 120px; aspect-ratio: 1; height: auto; max-height: none; object-fit: cover; object-position: top;
  border-radius: 50%; border: 4px solid var(--lw-accent); box-shadow: 0 8px 22px rgba(0,0,0,.45); }

.lw-chart { display: flex; align-items: flex-end; gap: 4px; width: 100%; height: 22cqh; padding: 0 4px; }
.lw-col { flex: 1; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 4px; }
.lw-col i { display: block; width: 100%; border-radius: 6px 6px 2px 2px; background: rgba(255,255,255,.35); animation: lw-grow .8s cubic-bezier(.2,.8,.2,1) both; transform-origin: bottom; }
.lw-col.hot i { background: var(--lw-hi); box-shadow: 0 0 14px var(--lw-hi); }
.lw-col small { font-size: 10px; opacity: .8; }

.lw-stamp { font-size: clamp(30px, 13cqw, 60px); font-weight: 900; letter-spacing: .08em; color: #ffe1e6; padding: 4px 16px; border: 5px solid #ffe1e6;
  border-radius: 10px; transform: rotate(-8deg); animation: lw-stamp .45s cubic-bezier(.2,1.6,.4,1) both; }
.lw-expose { margin-top: 1cqh; padding: 8px 14px; border-radius: 999px; border: 1.5px solid rgba(255,255,255,.7); background: rgba(0,0,0,.25);
  color: #fff; font-weight: 800; font-size: 13px; cursor: pointer; position: relative; z-index: 8; }
.lw-expose:hover { background: rgba(0,0,0,.4); }

/* host */
.lw-host { position: absolute; left: 12px; right: 12px; bottom: 14px; z-index: 4; display: flex; align-items: flex-end; gap: 10px; height: 31cqh; pointer-events: none; }
.lw-sprite { flex: none; width: 30cqw; max-width: 140px; height: 100%; display: flex; align-items: flex-end; justify-content: center; }
.lw-sprite img { max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 8px 16px rgba(0,0,0,.4)); animation: lw-bob 3s ease-in-out infinite; }
.lw-sprite span { font-size: clamp(44px, 18cqw, 84px); line-height: 1; animation: lw-bob 3s ease-in-out infinite; filter: drop-shadow(0 6px 12px rgba(0,0,0,.35)); }
.lw-bubble { position: relative; flex: 1; min-width: 0; max-height: 100%; overflow-y: auto; padding: 10px 12px; border-radius: 16px 16px 16px 4px;
  background: rgba(255,255,255,.95); color: #1d1a16; box-shadow: 0 8px 24px rgba(0,0,0,.3); pointer-events: auto; scrollbar-width: thin; }
.lw-host-name { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; color: color-mix(in srgb, var(--lw-accent) 75%, #000); }
.lw-say { font-size: max(13px, 3.7cqw); line-height: 1.4; white-space: pre-wrap; min-height: 1.4em; }
.lw-stage[data-slide="story_arcs"] .lw-host, .lw-stage[data-slide="expose"] .lw-host { height: 44cqh; }
.lw-stage[data-slide="story_arcs"] .lw-slide, .lw-stage[data-slide="expose"] .lw-slide { bottom: 47cqh; }
.lw-stage[data-slide="quotes"] .lw-say, .lw-stage[data-slide="story_arcs"] .lw-say, .lw-stage[data-slide="expose"] .lw-say { font-size: max(15px, 4.4cqw); }
.lw-stage[data-slide="outro"] .lw-host { height: 17cqh; }
.lw-stage[data-slide="outro"] .lw-slide { bottom: 19cqh; justify-content: flex-start; gap: 1.2cqh; }
.lw-stage[data-slide="outro"] .lw-bubble, .lw-stage[data-slide="expose_menu"] .lw-bubble { padding: 8px 11px; }

/* taps: below interactive content */
.lw-tap { position: absolute; top: 60px; bottom: 0; z-index: 1; border: none; background: transparent; cursor: pointer; padding: 0; }
.lw-tap-l { left: 0; width: 32%; }
.lw-tap-r { right: 0; width: 68%; }
.lw-slide { pointer-events: none; }
.lw-slide button, .lw-slide details, .lw-slide summary, .lw-slide a { pointer-events: auto; }
.lw-paused .lw-snow i, .lw-paused .lw-sprite > * { animation-play-state: paused; }

.lw-busy { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 9; padding: 12px 16px; border-radius: 14px;
  background: rgba(0,0,0,.65); font-weight: 700; font-size: 13px; text-align: center; max-width: 80%; }
.lw-sheet { position: absolute; inset: 0; z-index: 10; display: grid; place-items: end center; padding: 16px; background: rgba(0,0,0,.45); }
.lw-sheet-card { width: 100%; padding: 16px; border-radius: 18px; background: #fffaf2; color: #1d1a16; box-shadow: 0 -8px 30px rgba(0,0,0,.3); animation: lw-rise .3s both; }
.lw-sheet-card p { margin: 0 0 12px; font-size: 14px; line-height: 1.45; }

/* outro */
.lw-countdown { font-size: clamp(30px, 12cqw, 58px); font-weight: 900; color: var(--lw-hi); text-shadow: 0 0 24px color-mix(in srgb, var(--lw-hi) 60%, transparent); }
.lw-countdown.pop { animation: lw-pop .5s cubic-bezier(.2,1.6,.4,1) both; }
.lw-card-preview { height: 34cqh; max-width: 60%; aspect-ratio: 9 / 16; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.5); background: rgba(255,255,255,.08); }
.lw-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.lw-btn { padding: 9px 16px; border-radius: 999px; border: none; cursor: pointer; font-weight: 800; font-size: 13px; color: #1d1a16; background: var(--lw-hi); }
.lw-btn-ghost { background: transparent; color: inherit; border: 1.5px solid currentColor; }
.lw-sheet-card .lw-btn { background: #c8344f; color: #fff; }
.lw-sheet-card .lw-btn-ghost { background: transparent; color: #1d1a16; }
.lw-expose-list { width: 100%; text-align: left; }
.lw-expose-list summary { cursor: pointer; text-align: center; font-weight: 800; font-size: 13px; }
.lw-expose-list button { display: flex; width: 100%; gap: 6px; justify-content: space-between; margin-top: 6px; padding: 8px 12px; border-radius: 12px;
  border: none; background: rgba(255,255,255,.1); color: #fff; cursor: pointer; font: inherit; font-size: 13px; text-align: left; }
.lw-expose-list button small { opacity: .7; flex: none; }
.lw-fireworks { position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .4s; }
.lw-boom .lw-fireworks { opacity: 1; }
.lw-fireworks i { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: var(--lw-hi);
  box-shadow: 0 -40px 0 #fff, 28px -28px 0 #f6c, 40px 0 0 #fff, 28px 28px 0 var(--lw-hi), 0 40px 0 #6cf, -28px 28px 0 #fff, -40px 0 0 #f6c, -28px -28px 0 #6cf;
  animation: lw-burst 1.8s ease-out infinite; }
.lw-fireworks i:nth-child(1) { left: 20%; top: 18%; }
.lw-fireworks i:nth-child(2) { left: 75%; top: 12%; animation-delay: .4s; }
.lw-fireworks i:nth-child(3) { left: 55%; top: 30%; animation-delay: .9s; }
.lw-fireworks i:nth-child(4) { left: 30%; top: 40%; animation-delay: 1.2s; }
.lw-fireworks i:nth-child(5) { left: 82%; top: 38%; animation-delay: .6s; }

@keyframes lw-rise { from { opacity: 0; transform: translateY(18px) scale(.98); } to { opacity: 1; transform: none; } }
@keyframes lw-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes lw-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes lw-pop { from { transform: scale(.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes lw-stamp { from { transform: rotate(-8deg) scale(2.2); opacity: 0; } to { transform: rotate(-8deg) scale(1); opacity: 1; } }
@keyframes lw-burst { 0% { transform: scale(.1); opacity: 1; } 70% { opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .lw-player *, .lw-player *::before, .lw-player *::after { animation: none !important; transition: none !important; }
  .lw-snow { display: none; }
}
`;

// src/player.ts
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function initials(name) {
  const letters = name.replace(/[^\p{L}\p{N} ]/gu, "").trim().split(/\s+/).map((w) => w[0]).join("");
  return (letters || name.trim()[0] || "?").slice(0, 2).toUpperCase();
}
function hue(seed) {
  let h = 0;
  for (let i = 0;i < seed.length; i++)
    h = h * 31 + seed.charCodeAt(i) | 0;
  return Math.abs(h) % 360;
}
function avatar(name, url, cls) {
  const h = hue(name);
  const img = url ? `<i class="lw-av-img" style="background-image:url('${esc(url)}')"></i>` : "";
  return `<div class="${cls}" style="background-color:hsl(${h} 45% 70%);color:hsl(${h} 50% 18%)">${esc(initials(name))}${img}</div>`;
}
function menuLine(wrap) {
  if (wrap.host.kind === "character")
    return "Want me to expose you? Pick a chat. I remember everything.";
  if (wrap.host.id === "present")
    return "Pick one. I've been dying to— I mean. Whatever. Pick one.";
  if (wrap.host.id === "future")
    return "Choose a chat. ...I already know which one you will pick.";
  return "Ooh, want me to spill?! Pick a chat and I'll tell EVERYONE. Well, just you!";
}
var THEME = {
  intro: "pine",
  totals: "cranberry",
  top_characters: "gold",
  number_one: "pine",
  longest_chat: "midnight",
  time: "cranberry",
  streak: "gold",
  rerolls: "midnight",
  personas: "pine",
  words: "cranberry",
  quotes: "midnight",
  story_arcs: "pine",
  personality: "gold",
  expose: "cranberry",
  outro: "nye"
};
function openPlayer(ctx, initial, opts) {
  let wrap = initial;
  const menuSlide = () => ({ id: "expose_menu", title: "Expose me", text: menuLine(wrap) });
  let slides = [...wrap.slides, menuSlide()];
  let index = Math.max(0, Math.min(opts.startAt || 0, slides.length - 1));
  if (opts.startAt === undefined)
    index = 0;
  let paused = false;
  let elapsed = 0;
  let duration = 8000;
  let lastTick = 0;
  let raf = 0;
  let typeTimer = null;
  let closed = false;
  let cardUrl = "";
  let mount = null;
  let inModal = false;
  try {
    const m = ctx.ui.mountApp({ className: "lw-mount", position: "end" });
    mount = { root: m.root, destroy: () => m.destroy() };
  } catch {
    const modal = ctx.ui.showModal({ title: `Lumiwrap ${wrap.year}`, width: 460, maxHeight: 900, persistent: true });
    mount = { root: modal.root, destroy: () => modal.dismiss() };
    inModal = true;
    modal.onDismiss(() => {
      if (!closed)
        close();
    });
  }
  const root = mount.root;
  const snow = Array.from({ length: 36 }, () => {
    const size = 2 + Math.random() * 5;
    return `<i style="left:${Math.random() * 100}%;width:${size}px;height:${size}px;animation-duration:${6 + Math.random() * 8}s;animation-delay:-${Math.random() * 12}s;opacity:${0.35 + Math.random() * 0.6}"></i>`;
  }).join("");
  root.innerHTML = `
    <div class="lw-player${inModal ? " lw-in-modal" : ""}" tabindex="-1">
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
    </div>`;
  const $ = (n) => root.querySelector(`[data-p="${n}"]`);
  const el = {
    player: root.querySelector(".lw-player"),
    stage: $("stage"),
    bars: $("bars"),
    year: $("year"),
    pause: $("pause"),
    close: $("close"),
    slide: $("slide"),
    host: $("host"),
    sprite: $("sprite"),
    hname: $("hname"),
    say: $("say"),
    busy: $("busy"),
    prev: $("prev"),
    next: $("next"),
    backdrop: $("backdrop"),
    sheet: $("sheet")
  };
  function renderBars() {
    el.bars.innerHTML = slides.map((_, i) => `<span><b style="width:${i < index ? 100 : 0}%"></b></span>`).join("");
  }
  function setBar(pct) {
    const bars = el.bars.querySelectorAll("b");
    bars.forEach((b, i) => b.style.width = `${i < index ? 100 : i === index ? pct : 0}%`);
  }
  function renderHost() {
    const h = wrap.host;
    el.stage.style.setProperty("--lw-accent", h.accent || "#e7c46a");
    el.hname.textContent = h.name;
    const sprite = h.kind === "builtin" ? opts.sprite || "" : h.sprite;
    el.sprite.classList.toggle("lw-sprite-pfp", h.kind === "character" && !!sprite);
    el.sprite.innerHTML = sprite ? `<img src="${esc(sprite)}" alt="${esc(h.name)}">` : `<span>${esc(h.emoji || "\uD83C\uDF84")}</span>`;
    el.year.textContent = String(wrap.year);
  }
  function typeText(text) {
    if (typeTimer)
      clearInterval(typeTimer);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.say.textContent = text;
      return;
    }
    let i = 0;
    el.say.textContent = "";
    typeTimer = setInterval(() => {
      if (paused)
        return;
      i += 2;
      el.say.textContent = text.slice(0, i);
      if (i >= text.length && typeTimer) {
        clearInterval(typeTimer);
        typeTimer = null;
      }
    }, 22);
  }
  function countUp(node) {
    const target = Number(node.dataset.count) || 0;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 1300);
      const eased = 1 - Math.pow(1 - t, 3);
      node.textContent = fmt(target * eased);
      if (t < 1 && !closed)
        requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function show(i) {
    index = Math.max(0, Math.min(i, slides.length - 1));
    const slide = slides[index];
    elapsed = 0;
    const words = (slide.text || "").split(/\s+/).length;
    duration = Math.max(opts.slideSeconds * 1000, (words / 3.2 + 2.5) * 1000);
    el.stage.dataset.theme = THEME[slide.id] || "pine";
    el.stage.dataset.slide = slide.id;
    el.slide.innerHTML = slideHtml(slide);
    el.slide.classList.remove("lw-enter");
    el.slide.offsetWidth;
    el.slide.classList.add("lw-enter");
    el.slide.querySelectorAll("[data-count]").forEach(countUp);
    typeText(slide.text || "");
    renderBars();
    if (slide.id === "outro") {
      drawCardPreview();
      runCountdown();
    }
  }
  let countdownTimers = [];
  function runCountdown() {
    countdownTimers.forEach(clearTimeout);
    countdownTimers = [];
    const node = root.querySelector('[data-p="countdown"]');
    if (!node)
      return;
    const final = `Happy ${wrap.stats.year + 1}!`;
    ["3", "2", "1", final].forEach((txt, i) => {
      countdownTimers.push(setTimeout(() => {
        node.textContent = txt;
        node.classList.remove("pop");
        node.offsetWidth;
        node.classList.add("pop");
        if (txt === final)
          el.stage.classList.add("lw-boom");
      }, i * 800));
    });
    el.stage.classList.remove("lw-boom");
  }
  function slideHtml(slide) {
    const s = wrap.stats;
    const t = s.totals;
    const title = `<div class="lw-kicker">${esc(slide.title)}</div>`;
    switch (slide.id) {
      case "intro":
        return `${title}
          <div class="lw-gift">\uD83C\uDF81</div>
          <div class="lw-huge">Your ${s.year}<br><span class="lw-gold">Lumiwrap</span></div>
          <div class="lw-sub">${fmt(t.chats)} chats · ${fmt(t.characters)} characters${s.scope !== "all" ? ` · just ${esc(s.scopeName)}` : ""}</div>`;
      case "totals":
        return `${title}
          <div class="lw-big" data-count="${t.userMessages}">0</div>
          <div class="lw-label">messages you sent</div>
          <div class="lw-row2">
            <div><div class="lw-mid" data-count="${t.userWords}">0</div><div class="lw-label">words written</div></div>
            <div><div class="lw-mid">${(t.userWords / 90000).toFixed(t.userWords >= 90000 ? 1 : 2)}</div><div class="lw-label">novels' worth</div></div>
          </div>`;
      case "top_characters": {
        const scoped = s.scope === "character";
        const rows = scoped ? s.topChats.map((c, i) => `<li><span class="lw-rank">${i + 1}</span><div class="lw-li-text"><b>${esc(c.name)}</b><small>${fmt(c.messages)} messages</small></div></li>`) : s.topCharacters.map((c, i) => `<li><span class="lw-rank">${i + 1}</span>${avatar(c.name, c.avatar, "lw-av")}<div class="lw-li-text"><b>${esc(c.name)}</b><small>${fmt(c.messages)} messages · ${c.chats} chat${c.chats === 1 ? "" : "s"}</small></div></li>`);
        return `<div class="lw-kicker">${scoped ? "Your top chats" : esc(slide.title)}</div><ol class="lw-list">${rows.join("")}</ol>`;
      }
      case "number_one": {
        const c = s.topCharacters[0];
        if (!c)
          return title;
        const share = t.messages ? Math.round(c.messages / t.messages * 100) : 0;
        return `${title}
          ${avatar(c.name, c.avatar, "lw-av-xl")}
          <div class="lw-huge">${esc(c.name)}</div>
          <div class="lw-chips"><span><b data-count="${c.messages}">0</b> messages</span><span><b>${c.chats}</b> chat${c.chats === 1 ? "" : "s"}</span><span><b>${share}%</b> of your year</span></div>`;
      }
      case "longest_chat": {
        const c = s.longestChat;
        if (!c)
          return title;
        return `${title}
          <div class="lw-quote-title">“${esc(c.name)}”</div>
          <div class="lw-sub">with ${esc(c.characterName)}</div>
          <div class="lw-big" data-count="${c.messages}">0</div><div class="lw-label">messages</div>`;
      }
      case "time": {
        const max = Math.max(1, ...s.months);
        const bars = s.months.map((n, i) => `<div class="lw-col${i === s.busiestMonth ? " hot" : ""}"><i style="height:${Math.max(4, n / max * 100)}%"></i><small>${MONTHS[i][0]}</small></div>`).join("");
        return `${title}
          <div class="lw-chart">${bars}</div>
          <div class="lw-chips"><span>\uD83D\uDCC5 <b>${MONTHS[s.busiestMonth]}</b></span><span>\uD83D\uDDD3️ <b>${WEEKDAYS[s.busiestWeekday]}s</b></span><span>\uD83D\uDD70️ <b>${hourLabel(s.busiestHour)}</b></span></div>
          <div class="lw-sub">\uD83C\uDF19 ${s.nightOwlPct}% after midnight</div>`;
      }
      case "streak":
        return `${title}
          <div class="lw-candles">${"\uD83D\uDD6F️".repeat(Math.min(7, Math.max(1, Math.ceil(s.streak.days / 5))))}</div>
          <div class="lw-big" data-count="${s.streak.days}">0</div><div class="lw-label">days in a row</div>
          <div class="lw-sub">${fmt(t.activeDays)} active days${s.busiestDay ? ` · busiest: ${esc(s.busiestDay.date)} (${s.busiestDay.messages})` : ""}</div>`;
      case "rerolls":
        return `${title}
          <div class="lw-dice">\uD83C\uDFB2</div>
          <div class="lw-big" data-count="${t.swipes}">0</div><div class="lw-label">rerolls</div>
          ${s.mostRerolledChat ? `<div class="lw-sub">most rerolled: “${esc(s.mostRerolledChat.name)}” with ${esc(s.mostRerolledChat.characterName)}</div>` : ""}
          ${s.mostSwipedMessage ? `<div class="lw-sub">one message had ${s.mostSwipedMessage.swipes} versions</div>` : ""}`;
      case "personas":
        return `${title}<ol class="lw-list">${s.personas.map((p, i) => `<li><span class="lw-rank">${i + 1}</span>${avatar(p.name, null, "lw-av")}<div class="lw-li-text"><b>${esc(p.name)}</b><small>${fmt(p.messages)} messages</small></div></li>`).join("")}</ol>`;
      case "words":
        return `${title}<ol class="lw-list lw-songs">${s.topWords.map((w, i) => `<li><span class="lw-rank">${i + 1}</span><div class="lw-li-text"><b>“${esc(w.word)}”</b><small>${fmt(w.count)} times</small></div></li>`).join("")}</ol>
          ${s.theirWords[0] ? `<div class="lw-sub">they kept saying <b>“${esc(s.theirWords[0].word)}”</b></div>` : ""}`;
      case "quotes":
        return slide.quote ? `${title}<div class="lw-quote-mark">“</div><blockquote class="lw-quote">${esc(slide.quote)}</blockquote>${slide.quoteBy ? `<div class="lw-quote-by">— ${esc(slide.quoteBy)}</div>` : ""}` : `${title}<div class="lw-quote-mark">“</div>`;
      case "story_arcs":
        return `${title}<div class="lw-film">\uD83C\uDFAC</div><div class="lw-sub">previously, on your ${s.year}...</div>`;
      case "personality":
        return `${title}
          <div class="lw-star">⭐</div>
          <div class="lw-huge lw-gold">${esc(s.archetype.name)}</div>
          <div class="lw-sub">${esc(s.archetype.blurb)}</div>`;
      case "expose":
        return `<div class="lw-kicker">Exposed</div>
          <div class="lw-stamp">EXPOSED</div>
          <div class="lw-quote-title">“${esc(slide.chatName || "")}”</div>
          <div class="lw-sub">with ${esc(slide.characterName || "")}</div>`;
      case "expose_menu": {
        const done = new Set(wrap.slides.filter((x) => x.id === "expose").map((x) => x.chatId || x.chatName));
        const list = wrap.chats.map((c) => {
          const exposed = done.has(c.id) || done.has(c.name);
          const at = exposed ? wrap.slides.findIndex((x) => x.id === "expose" && (x.chatId === c.id || x.chatName === c.name)) : -1;
          return `<button class="lw-menu-item${exposed ? " done" : ""}" ${exposed ? `data-goto="${at}"` : `data-expose="${esc(c.id)}"`}>
              <span><b>“${esc(c.name)}”</b><small>${esc(c.characterName)}</small></span><i>${exposed ? "read again" : "expose"}</i></button>`;
        }).join("");
        return `<div class="lw-kicker">Bonus round</div>
          <div class="lw-huge">Expose me</div>
          <div class="lw-sub">Pick a chat and get roasted for it. You'll see the cost first.</div>
          <div class="lw-menu">${list || '<div class="lw-sub">No chats to expose.</div>'}</div>`;
      }
      case "outro": {
        return `<div class="lw-fireworks" aria-hidden="true">${"<i></i>".repeat(5)}</div>
          <div class="lw-kicker">${esc(slide.title)}</div>
          <div class="lw-countdown" data-p="countdown">Happy ${s.year + 1}!</div>
          <img class="lw-card-preview" data-p="cardimg" alt="Your Lumiwrap summary card">
          <div class="lw-actions">
            <button class="lw-btn" data-act="save">⬇ Save image</button>
            <button class="lw-btn lw-btn-ghost" data-act="replay">↺ Replay</button>
          </div>
          <button class="lw-next-hint" data-act="next">\uD83D\uDD0D Expose me ›</button>`;
      }
      default:
        return title;
    }
  }
  function drawCard() {
    const W = 1080;
    const H = 1920;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d");
    const s = wrap.stats;
    const accent = "#f3d27a";
    const font = (w, px) => `${w} ${px}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
    const bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0e3b2c");
    bg.addColorStop(0.55, "#0a2a20");
    bg.addColorStop(1, "#3a0d18");
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    for (let i = 0;i < 140; i++) {
      g.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.5})`;
      g.beginPath();
      g.arc(Math.random() * W, Math.random() * H, 1.5 + Math.random() * 4, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = accent;
    g.lineWidth = 6;
    g.strokeRect(40, 40, W - 80, H - 80);
    g.textAlign = "center";
    g.fillStyle = accent;
    g.font = font(700, 44);
    g.fillText("✦  L U M I W R A P  ✦", W / 2, 150);
    g.fillStyle = "#fff";
    g.font = font(900, 190);
    g.fillText(String(s.year), W / 2, 340);
    g.font = font(600, 40);
    g.fillStyle = "rgba(255,255,255,.75)";
    g.fillText(clip(g, s.scope !== "all" ? `with ${s.scopeName}` : "that's a wrap!", W - 200), W / 2, 410);
    g.textAlign = "left";
    g.fillStyle = accent;
    g.font = font(800, 40);
    g.fillText(s.scope === "character" ? "TOP CHATS" : "TOP CHARACTERS", 110, 530);
    const list = s.scope === "character" ? s.topChats.map((x) => ({ name: x.name, n: x.messages })) : s.topCharacters.map((x) => ({ name: x.name, n: x.messages }));
    list.slice(0, 5).forEach((row, i) => {
      const y = 610 + i * 88;
      g.fillStyle = accent;
      g.font = font(900, 54);
      g.fillText(String(i + 1), 110, y);
      g.fillStyle = "#fff";
      g.font = font(700, 50);
      g.fillText(clip(g, row.name, 620), 180, y);
      g.textAlign = "right";
      g.fillStyle = "rgba(255,255,255,.65)";
      g.font = font(600, 36);
      g.fillText(`${fmt(row.n)} msgs`, W - 110, y);
      g.textAlign = "left";
    });
    const t = s.totals;
    const cells = [
      ["MESSAGES", fmt(t.userMessages)],
      ["WORDS", fmt(t.userWords)],
      ["STREAK", `${s.streak.days} days`],
      ["REROLLS", fmt(t.swipes)],
      ["TOP WORD", s.topWords[0] ? `“${s.topWords[0].word}”` : "—"],
      ["PEAK HOUR", hourLabel(s.busiestHour)]
    ];
    cells.forEach(([label, value], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 110 + col * 440;
      const y = 1130 + row * 170;
      g.fillStyle = "rgba(255,255,255,.6)";
      g.font = font(700, 32);
      g.fillText(label, x, y);
      g.fillStyle = "#fff";
      g.font = font(800, 58);
      g.fillText(clip(g, value, 400), x, y + 66);
    });
    g.textAlign = "center";
    g.fillStyle = "rgba(255,255,255,.6)";
    g.font = font(700, 32);
    g.fillText("RP PERSONALITY", W / 2, 1650);
    g.fillStyle = accent;
    g.font = font(900, 70);
    g.fillText(clip(g, s.archetype.name, W - 200), W / 2, 1735);
    g.fillStyle = "rgba(255,255,255,.7)";
    g.font = font(600, 34);
    g.fillText(`wrapped by ${wrap.host.name} ${wrap.host.emoji || ""}`.trim(), W / 2, 1820);
    return c;
  }
  function clip(g, text, max) {
    if (g.measureText(text).width <= max)
      return text;
    let t = text;
    while (t.length > 1 && g.measureText(t + "…").width > max)
      t = t.slice(0, -1);
    return t + "…";
  }
  function drawCardPreview() {
    try {
      const canvas = drawCard();
      cardUrl = canvas.toDataURL("image/png");
      const img = root.querySelector('[data-p="cardimg"]');
      if (img)
        img.src = cardUrl;
    } catch {}
  }
  function saveCard() {
    const canvas = drawCard();
    const name = `lumiwrap-${wrap.year}-${wrap.host.name}.png`.replace(/[^\w.-]+/g, "-");
    canvas.toBlob((blob) => {
      if (!blob)
        return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    }, "image/png");
  }
  function tick(now) {
    if (closed)
      return;
    if (!lastTick)
      lastTick = now;
    const dt = now - lastTick;
    lastTick = now;
    const outroAt = slides.findIndex((x) => x.id === "outro");
    const last = index === slides.length - 1 || outroAt >= 0 && index >= outroAt;
    if (!paused && !last) {
      elapsed += dt;
      if (elapsed >= duration)
        next();
    }
    setBar(last ? 100 : Math.min(100, elapsed / duration * 100));
    raf = requestAnimationFrame(tick);
  }
  function next() {
    if (index < slides.length - 1)
      show(index + 1);
  }
  function prev() {
    show(index > 0 ? index - 1 : 0);
  }
  function setPaused(p) {
    paused = p;
    el.pause.textContent = p ? "▶" : "❚❚";
    el.pause.setAttribute("aria-label", p ? "Play" : "Pause");
    el.stage.classList.toggle("lw-paused", p);
  }
  let holdTimer = null;
  let held = false;
  function bindTap(btn, action) {
    btn.addEventListener("pointerdown", () => {
      held = false;
      holdTimer = setTimeout(() => {
        held = true;
        setPaused(true);
      }, 280);
    });
    const end = () => {
      if (holdTimer)
        clearTimeout(holdTimer);
      if (held) {
        held = false;
        setPaused(false);
      }
    };
    btn.addEventListener("pointerup", end);
    btn.addEventListener("pointerleave", end);
    btn.addEventListener("click", () => {
      if (!held)
        action();
    });
  }
  bindTap(el.prev, prev);
  bindTap(el.next, next);
  el.pause.addEventListener("click", () => setPaused(!paused));
  el.close.addEventListener("click", () => close());
  el.backdrop.addEventListener("click", () => close());
  el.slide.addEventListener("click", (e) => {
    const t = e.target;
    const ex = t.closest("[data-expose]");
    const act = t.closest("[data-act]");
    if (ex) {
      setPaused(true);
      opts.onExpose(ex.dataset.expose);
    } else if (act?.dataset.act === "save")
      saveCard();
    else if (act?.dataset.act === "replay")
      show(0);
    else if (act?.dataset.act === "next")
      next();
    else if (t.closest("[data-goto]"))
      show(Number(t.closest("[data-goto]").dataset.goto));
  });
  const onKey = (e) => {
    if (e.key === "ArrowRight")
      next();
    else if (e.key === "ArrowLeft")
      prev();
    else if (e.key === "Escape")
      close();
    else if (e.key === " ") {
      e.preventDefault();
      setPaused(!paused);
    } else
      return;
  };
  document.addEventListener("keydown", onKey);
  function close() {
    if (closed)
      return;
    closed = true;
    cancelAnimationFrame(raf);
    countdownTimers.forEach(clearTimeout);
    if (typeTimer)
      clearInterval(typeTimer);
    document.removeEventListener("keydown", onKey);
    try {
      mount?.destroy();
    } catch {}
    opts.onClose?.();
  }
  renderHost();
  show(index);
  raf = requestAnimationFrame(tick);
  el.player.focus();
  return {
    close,
    updateWrap(w, jumpTo) {
      wrap = w;
      slides = [...wrap.slides, menuSlide()];
      renderHost();
      show(jumpTo ?? Math.min(index, slides.length - 1));
      setPaused(false);
    },
    ask(message, okLabel) {
      setPaused(true);
      el.sheet.hidden = false;
      el.sheet.innerHTML = `<div class="lw-sheet-card"><p>${esc(message)}</p><div class="lw-actions"><button class="lw-btn" data-ok>${esc(okLabel)}</button><button class="lw-btn lw-btn-ghost" data-cancel>Cancel</button></div></div>`;
      return new Promise((resolve) => {
        const done = (v) => {
          el.sheet.hidden = true;
          el.sheet.innerHTML = "";
          if (!v)
            setPaused(false);
          resolve(v);
        };
        el.sheet.querySelector("[data-ok]").addEventListener("click", () => done(true));
        el.sheet.querySelector("[data-cancel]").addEventListener("click", () => done(false));
      });
    },
    setBusy(text) {
      el.busy.hidden = !text;
      el.busy.textContent = text;
      if (text)
        setPaused(true);
    }
  };
}

// src/frontend.ts
var ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="9" width="17" height="11.5" rx="1.6"/><path d="M2.5 9h19V6.8a.8.8 0 0 0-.8-.8H3.3a.8.8 0 0 0-.8.8z"/><path d="M12 6v14.5"/><path d="M12 6c-1.2-2.6-4.6-3.4-5.2-1.6C6.2 6.2 9.6 6.4 12 6zM12 6c1.2-2.6 4.6-3.4 5.2-1.6.6 1.8-2.8 2-5.2 1.6z"/></svg>`;
var GIFT = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="9.5" width="17" height="11" rx="1.6" fill="currentColor"/><rect x="2.5" y="6.5" width="19" height="3.6" rx=".9" fill="currentColor" opacity=".85"/><rect x="10.6" y="6.5" width="2.8" height="14" fill="#f3d27a"/><path d="M12 6.6c-1.3-2.7-4.8-3.5-5.4-1.6-.6 1.9 3 2.1 5.4 1.6zM12 6.6c1.3-2.7 4.8-3.5 5.4-1.6.6 1.9-3 2.1-5.4 1.6z" fill="#f3d27a"/></svg>`;
var SNOWFLAKE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7"/><path d="m9.5 3.5 2.5 2 2.5-2M9.5 20.5l2.5-2 2.5 2M4 10.2l3-.6-1-2.9M20 13.8l-3 .6 1 2.9M4 13.8l3 .6-1 2.9M20 10.2l-3-.6 1-2.9"/></svg>`;
var CHEVRON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
var PLAY = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>`;
var TRASH = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.8h6V7M6.5 7l.9 12.2a1.5 1.5 0 0 0 1.5 1.3h6.2a1.5 1.5 0 0 0 1.5-1.3L17.5 7"/></svg>`;
var PENCIL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>`;
var UPLOAD = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4.5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V15"/></svg>`;
var DEPTHS = [
  { id: "stats", icon: "❄️", label: "Stats", hint: "Counts everything on your machine. Nothing is sent to a model.", cost: "Free" },
  { id: "highlights", icon: "✨", label: "Highlights + stats", hint: "A small sample from your top chats, so the host can quote you.", cost: "Small" },
  { id: "deep", icon: "\uD83D\uDD0D", label: "Deep + everything", hint: "Summarizes each picked chat. Summaries are cached for next time.", cost: "Most" }
];
var NEEDS_LABEL = { stats: "Stats", highlights: "Highlights+", deep: "Deep" };
var DEPTH_LABEL = { stats: "Stats", highlights: "Highlights", deep: "Deep" };
var PERMISSION_LABEL = {
  generation: "Generation (connections and host lines)",
  characters: "Characters",
  chats: "Chats",
  chat_mutation: "Chat mutation (reading messages; Lumiwrap never edits them)",
  personas: "Personas"
};
function timeAgo(ts) {
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 60)
    return "just now";
  if (s < 3600)
    return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)
    return `${Math.floor(s / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}
function readImage(file, maxSide = 720) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/"))
      return reject(new Error("Pick an image file."));
    const reader = new FileReader;
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const img = new Image;
      img.onerror = () => reject(new Error("Couldn't open that image."));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        let url = canvas.toDataURL("image/webp", 0.88);
        if (!url.startsWith("data:image/webp"))
          url = canvas.toDataURL("image/png");
        resolve(url);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
function setup(ctx) {
  const removeStyle = ctx.dom.addStyle(STYLES);
  const tab = ctx.ui.registerDrawerTab({
    id: "lumiwrap",
    title: "Lumiwrap",
    shortName: "Wrap",
    description: "Your year in Lumiverse, wrapped",
    keywords: ["wrapped", "recap", "year", "stats", "christmas", "new year"],
    iconSvg: ICON
  });
  const root = tab.root;
  const thisYear = new Date().getFullYear();
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
            ${DEPTHS.map((d) => `<button class="lw-depth${d.id === "stats" ? " on" : ""}" data-depth="${d.id}">
                <span class="lw-depth-icon">${d.icon}</span>
                <span class="lw-depth-text"><b>${d.label}</b><small>${d.hint}</small></span>
                <span class="lw-tag lw-tag-${d.id}">${d.cost}</span>
              </button>`).join("")}
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
  `;
  const $ = (name) => root.querySelector(`[data-el="${name}"]`);
  const el = {
    banner: $("banner"),
    year: $("year"),
    yearDown: $("year-down"),
    yearUp: $("year-up"),
    scope: $("scope"),
    charWrap: $("char-wrap"),
    charPicker: $("char-picker"),
    label: $("label"),
    depths: $("depths"),
    hosts: $("hosts"),
    hostPicker: $("host-picker"),
    scan: $("scan"),
    progress: $("progress"),
    progressText: $("progress-text"),
    progressBar: $("progress-bar"),
    status: $("status"),
    result: $("result"),
    from: $("from"),
    found: $("found"),
    pickedWrap: $("picked-wrap"),
    pickedHint: $("picked-hint"),
    picked: $("picked"),
    commentaryWrap: $("commentary-wrap"),
    commentary: $("commentary"),
    costBig: $("cost-big"),
    costDetail: $("cost-detail"),
    go: $("go"),
    lib: $("lib"),
    deleteAll: $("delete-all"),
    slides: $("slides"),
    slidesSave: $("slides-save"),
    slidesReset: $("slides-reset"),
    hostEditors: $("host-editors"),
    charprompt: $("charprompt"),
    hostsSave: $("hosts-save"),
    hostsReset: $("hosts-reset"),
    file: $("file"),
    hostsStatus: $("hosts-status"),
    sConn: $("s-conn"),
    sRefresh: $("s-refresh"),
    sConnHint: $("s-conn-hint"),
    sNoReason: $("s-noreason"),
    sTemp: $("s-temp"),
    sMax: $("s-max"),
    sTopP: $("s-topp"),
    sTopK: $("s-topk"),
    sMinP: $("s-minp"),
    sRep: $("s-rep"),
    sFreq: $("s-freq"),
    sPres: $("s-pres"),
    sTopchars: $("s-topchars"),
    sPerchar: $("s-perchar"),
    sSample: $("s-sample"),
    sSecs: $("s-secs"),
    sCommentary: $("s-commentary"),
    sSave: $("s-save")
  };
  let settings = null;
  let characters = [];
  let connections = [];
  let sprites = {};
  let initErrors = [];
  let missing = [];
  let scope = "all";
  let pickedChars = new Set;
  let hostCharId = "";
  let depth = "stats";
  let hostRef = "past";
  let busy = "";
  let scan = null;
  let selected = new Set;
  let library = [];
  let slidesDraft = [];
  let player = null;
  let playerWrapId = "";
  let pendingExpose = null;
  let uploadFor = "";
  let view = "wrap";
  const armed = new Map;
  const hostArt = (h) => sprites[h.id] ? `<img src="${esc(sprites[h.id])}" alt="">` : `<span>${esc(h.emoji)}</span>`;
  function twoTap(btn, key, armedLabel, action) {
    if (armed.has(key)) {
      clearTimeout(armed.get(key));
      armed.delete(key);
      action();
      return;
    }
    const original = btn.innerHTML;
    btn.classList.add("armed");
    btn.innerHTML = armedLabel;
    armed.set(key, setTimeout(() => {
      armed.delete(key);
      btn.classList.remove("armed");
      btn.innerHTML = original;
    }, 3000));
  }
  function hostsStatus(text) {
    el.hostsStatus.textContent = text;
    el.hostsStatus.className = `lw-status ${text ? "error" : ""}`;
  }
  function setView(v) {
    view = v;
    root.querySelectorAll(".lw-nav button").forEach((b) => b.classList.toggle("active", b.dataset.view === v));
    root.querySelectorAll("[data-panel]").forEach((p) => p.hidden = p.dataset.panel !== v);
    if (v === "library")
      ctx.sendToBackend({ type: "list_wraps" });
  }
  function renderBanner() {
    if (!missing.length && !initErrors.length) {
      el.banner.hidden = true;
      return;
    }
    el.banner.hidden = false;
    el.banner.innerHTML = missing.length ? `<b>Lumiwrap is missing some permissions.</b>
         <p>Open <b>Extensions</b>, find Lumiwrap and grant:</p>
         <ul>${missing.map((p) => `<li>${esc(PERMISSION_LABEL[p] || p)}</li>`).join("")}</ul>
         <button class="lw-ghost lw-small" data-retry>I granted them, try again</button>` : `<b>Something didn't load.</b><p>${initErrors.map(esc).join("<br>")}</p><button class="lw-ghost lw-small" data-retry>Try again</button>`;
  }
  function makePicker(host, multi, getSel, setSel) {
    let open = false;
    host.innerHTML = `
      <button class="lw-pill" data-pill aria-expanded="false"><span class="lw-pill-av" data-av></span>
        <span class="lw-pill-text"><span class="lw-pill-main" data-main></span><span class="lw-pill-sub" data-sub></span></span>
        <span class="lw-pill-chev">${CHEVRON}</span></button>
      <div class="lw-cp-panel" data-panel hidden>
        <input type="text" data-search placeholder="Search characters...">
        <div class="lw-cp-list" data-list></div>
        ${multi ? `<div class="lw-cp-foot"><button class="lw-ghost lw-small" data-all>Select shown</button><button class="lw-ghost lw-small" data-none>Clear</button><span class="lw-cp-count" data-count></span><button class="lw-ghost lw-small" data-done>Done</button></div>` : ""}
      </div>`;
    const q = (sel) => host.querySelector(sel);
    const pill = q("[data-pill]");
    const panel = q("[data-panel]");
    const search = q("[data-search]");
    const list = q("[data-list]");
    const shown = () => {
      const term = search.value.trim().toLowerCase();
      return characters.filter((c) => !term || c.name.toLowerCase().includes(term));
    };
    function renderPill() {
      const sel = getSel().map((id) => characters.find((c) => c.id === id)).filter(Boolean);
      const av = q("[data-av]");
      const main = q("[data-main]");
      const sub = q("[data-sub]");
      if (!sel.length) {
        av.innerHTML = `<div class="lw-mini lw-mini-empty">${GIFT}</div>`;
        main.textContent = multi ? "Pick characters" : "Pick a character";
        sub.textContent = characters.length ? `${characters.length} in your library` : missing.includes("characters") ? "Grant the Characters permission first" : "No characters found";
      } else if (!multi || sel.length === 1) {
        av.innerHTML = avatar(sel[0].name, sel[0].avatar, "lw-mini");
        main.textContent = sel[0].name;
        sub.textContent = multi ? "1 character" : "Hosting your Lumiwrap";
      } else {
        av.innerHTML = `<span class="lw-stack">${sel.slice(0, 3).map((c) => avatar(c.name, c.avatar, "lw-mini")).join("")}</span>`;
        main.textContent = `${sel.length} characters`;
        sub.textContent = sel.map((c) => c.name).join(", ");
      }
      pill.setAttribute("aria-expanded", String(open));
      pill.classList.toggle("open", open);
    }
    function renderList() {
      panel.hidden = !open;
      if (!open)
        return;
      const sel = new Set(getSel());
      const rows = shown();
      list.innerHTML = rows.length ? rows.map((c) => `<button class="lw-cp-row${sel.has(c.id) ? " on" : ""}" data-id="${esc(c.id)}">
                ${avatar(c.name, c.avatar, "lw-mini")}<span class="lw-cp-name">${esc(c.name)}</span>
                ${multi ? `<span class="lw-cp-box">${sel.has(c.id) ? "✓" : ""}</span>` : sel.has(c.id) ? '<span class="lw-cp-tick">✓</span>' : ""}</button>`).join("") : `<div class="lw-hint lw-pad">${characters.length ? "No characters match." : "No characters found."}</div>`;
      const count = host.querySelector("[data-count]");
      if (count)
        count.textContent = `${sel.size} picked`;
    }
    pill.addEventListener("click", () => {
      open = !open;
      if (open) {
        search.value = "";
        if (!characters.length)
          ctx.sendToBackend({ type: "init" });
      }
      renderPill();
      renderList();
      if (open)
        search.focus();
    });
    search.addEventListener("input", renderList);
    list.addEventListener("click", (e) => {
      const row = e.target.closest("[data-id]");
      if (!row)
        return;
      const id = row.dataset.id;
      if (multi) {
        const sel = new Set(getSel());
        if (sel.has(id))
          sel.delete(id);
        else
          sel.add(id);
        setSel([...sel]);
      } else {
        setSel([id]);
        open = false;
      }
      renderPill();
      renderList();
    });
    host.querySelector("[data-all]")?.addEventListener("click", () => {
      setSel([...new Set([...getSel(), ...shown().map((c) => c.id)])]);
      renderPill();
      renderList();
    });
    host.querySelector("[data-none]")?.addEventListener("click", () => {
      setSel([]);
      renderPill();
      renderList();
    });
    host.querySelector("[data-done]")?.addEventListener("click", () => {
      open = false;
      renderPill();
      renderList();
    });
    return {
      render() {
        renderPill();
        renderList();
      },
      close() {
        open = false;
        renderPill();
        renderList();
      }
    };
  }
  const charPicker = makePicker(el.charPicker, true, () => [...pickedChars], (ids) => {
    pickedChars = new Set(ids);
    invalidateScan("Characters changed. Scan again to update.");
  });
  const hostPicker = makePicker(el.hostPicker, false, () => hostCharId ? [hostCharId] : [], (ids) => {
    hostCharId = ids[0] || "";
    hostRef = `char:${hostCharId}`;
    renderHostPicker();
    refreshEstimate();
  });
  function renderCharacterSelects() {
    const ids = new Set(characters.map((c) => c.id));
    pickedChars = new Set([...pickedChars].filter((id) => ids.has(id)));
    if (hostCharId && !ids.has(hostCharId))
      hostCharId = "";
    charPicker.render();
    hostPicker.render();
  }
  function renderScope() {
    el.scope.querySelectorAll("[data-scope]").forEach((b) => b.classList.toggle("on", b.dataset.scope === scope));
    el.charWrap.hidden = scope !== "pick";
  }
  function renderDepth() {
    el.depths.querySelectorAll("[data-depth]").forEach((b) => b.classList.toggle("on", b.dataset.depth === depth));
  }
  function renderHostPicker() {
    const hosts = settings?.hosts || DEFAULT_HOSTS;
    el.hosts.innerHTML = hosts.map((h) => `<button class="lw-host-tile${hostRef === h.id ? " on" : ""}" data-host="${h.id}" style="--tile:${esc(h.accent)}">
            <span class="lw-tile-art">${hostArt(h)}</span>
            <span class="lw-tile-name">${esc(h.name)}</span><span class="lw-tile-sub">${esc(h.title)}</span></button>`).join("") + (() => {
      const c = characters.find((x) => x.id === hostCharId);
      const art = c ? avatar(c.name, c.avatar, "lw-tile-pfp") : "<span>\uD83C\uDF81</span>";
      return `<button class="lw-host-tile${hostRef.startsWith("char:") ? " on" : ""}" data-host="char" style="--tile:#d9b45a">
          <span class="lw-tile-art">${art}</span><span class="lw-tile-name">${esc(c ? c.name : "A character")}</span><span class="lw-tile-sub">${c ? "from your library" : "from your library"}</span></button>`;
    })();
    el.hostPicker.hidden = !hostRef.startsWith("char:");
  }
  function currentHostRef() {
    if (hostRef.startsWith("char:"))
      return hostCharId ? `char:${hostCharId}` : "";
    return hostRef;
  }
  function hostName() {
    const ref = currentHostRef();
    if (ref.startsWith("char:"))
      return characters.find((c) => `char:${c.id}` === ref)?.name || "a character";
    return (settings?.hosts || DEFAULT_HOSTS).find((h) => h.id === ref)?.name || "Holly";
  }
  function setProgress(text, done = 0, total = 0) {
    el.progress.hidden = !text;
    el.progressText.textContent = text;
    el.progressBar.style.width = total ? `${Math.round(done / total * 100)}%` : "100%";
    el.progressBar.classList.toggle("indeterminate", !total);
  }
  function setStatus(text, kind = "info") {
    el.status.textContent = text;
    el.status.className = `lw-status ${text ? kind : ""}`;
  }
  function renderBusy() {
    el.scan.disabled = !!busy;
    el.go.disabled = !!busy || !scan;
    el.scan.querySelector("span").textContent = busy === "scan" ? "Scanning..." : scan ? "Scan again" : "Scan my year";
    el.go.querySelector("span").textContent = busy === "wrap" ? "Wrapping..." : "Wrap it!";
    el.scan.classList.toggle("loading", busy === "scan");
    el.go.classList.toggle("loading", busy === "wrap");
  }
  function invalidateScan(reason) {
    if (!scan)
      return;
    scan = null;
    el.result.hidden = true;
    renderBusy();
    if (reason)
      setStatus(reason);
  }
  function renderResult() {
    if (!scan) {
      el.result.hidden = true;
      return;
    }
    el.result.hidden = false;
    el.from.textContent = hostName();
    const t = scan.stats.totals;
    el.found.innerHTML = `
      <div class="lw-found-grid">
        <div><b>${fmt(t.messages)}</b><small>messages</small></div>
        <div><b>${fmt(t.chats)}</b><small>chats</small></div>
        <div><b>${fmt(t.characters)}</b><small>characters</small></div>
      </div>
      <div class="lw-hint">in ${scan.stats.year}${scan.stats.scope !== "all" ? ` with ${esc(scan.stats.scopeName)}` : ""}</div>`;
    el.pickedWrap.hidden = scan.depth === "stats";
    el.pickedHint.textContent = scan.depth === "deep" ? "(tokens to read each)" : "(tokens per sample)";
    el.picked.innerHTML = scan.picked.length ? scan.picked.map((p) => {
      const free = p.deepCached && scan.depth === "deep";
      const cost = scan.depth === "deep" ? free ? "cached" : `≈ ${fmt(p.chatTokens)}` : `≈ ${fmt(p.sampleTokens)}`;
      return `<label class="lw-pick"><input type="checkbox" data-pick="${esc(p.id)}"${selected.has(p.id) ? " checked" : ""}>
              <span class="lw-pick-text"><b>${esc(p.name)}</b><small>${esc(p.characterName)} · ${fmt(p.messages)} msgs</small></span>
              <span class="lw-pick-cost${free ? " free" : ""}">${cost}</span></label>`;
    }).join("") : `<div class="lw-hint lw-pad">No chats to read.</div>`;
    el.commentaryWrap.hidden = scan.depth !== "stats" || currentHostRef().startsWith("char:");
    el.commentary.checked = !!settings?.statsCommentary;
    renderEstimate();
    renderBusy();
  }
  function renderEstimate() {
    if (!scan)
      return;
    const e = scan.estimate;
    if (e.free) {
      el.costBig.innerHTML = `Free <small>0 tokens</small>`;
      el.costDetail.textContent = "Built-in host lines. Nothing is sent to a model.";
      return;
    }
    el.costBig.innerHTML = `≈ ${fmt(e.total)} <small>tokens</small>`;
    const parts = [`${fmt(e.base)} for stats and instructions`];
    if (e.highlights)
      parts.push(`${fmt(e.highlights)} for samples`);
    if (e.deep)
      parts.push(`${fmt(e.deep)} for reading chats`);
    parts.push(`about ${fmt(e.reply)} back`);
    el.costDetail.textContent = parts.join(" + ") + (e.model ? ` (counted for ${e.model})` : "") + ".";
  }
  function renderLibrary() {
    el.deleteAll.hidden = library.length < 2;
    if (!library.length) {
      el.lib.innerHTML = `<div class="lw-empty">${GIFT}<p>No Lumiwraps yet.<br>Scan your year to make one.</p></div>`;
      return;
    }
    const hosts = settings?.hosts || DEFAULT_HOSTS;
    el.lib.innerHTML = library.map((w) => {
      const builtin = hosts.find((h) => h.name === w.hostName);
      const art = builtin && sprites[builtin.id] ? `<img src="${esc(sprites[builtin.id])}" alt="">` : `<span>${esc(w.hostEmoji || "\uD83C\uDF81")}</span>`;
      return `<div class="lw-libitem">
          <button class="lw-lib-main" data-play="${esc(w.id)}" title="Play">
            <span class="lw-lib-art">${art}<i>${PLAY}</i></span>
            <span class="lw-lib-text"><b>${esc(w.title)}</b><small>${esc(DEPTH_LABEL[w.depth] || w.depth)} · ${esc(timeAgo(w.createdAt))}</small></span>
          </button>
          <div class="lw-lib-actions">
            <button class="lw-iconbtn" data-rename="${esc(w.id)}" title="Rename" aria-label="Rename">${PENCIL}</button>
            <button class="lw-iconbtn lw-iconbtn-danger" data-delete="${esc(w.id)}" title="Delete" aria-label="Delete">${TRASH}</button>
          </div>
        </div>`;
    }).join("");
  }
  function renderSlides() {
    el.slides.innerHTML = slidesDraft.map((s, i) => `<div class="lw-slide-row${s.enabled ? "" : " off"}">
          <div class="lw-slide-head">
            <label class="lw-switch" title="Show this slide"><input type="checkbox" data-toggle="${i}"${s.enabled ? " checked" : ""}><i></i></label>
            <input type="text" class="lw-slide-title" data-title="${i}" value="${esc(s.title)}" maxlength="60" aria-label="Slide title">
            <span class="lw-badge lw-badge-${s.needs}">${NEEDS_LABEL[s.needs]}</span>
            <span class="lw-move">
              <button data-up="${i}" ${i === 0 ? "disabled" : ""} aria-label="Move up">▲</button>
              <button data-down="${i}" ${i === slidesDraft.length - 1 ? "disabled" : ""} aria-label="Move down">▼</button>
            </span>
          </div>
          <details><summary>Prompt</summary><textarea rows="3" data-prompt="${i}">${esc(s.prompt)}</textarea></details>
        </div>`).join("");
  }
  function renderHostEditors() {
    const hosts = settings?.hosts || DEFAULT_HOSTS;
    el.hostEditors.innerHTML = hosts.map((h) => `<div class="lw-card lw-host-ed" data-host-editor="${h.id}" style="--tile:${esc(h.accent)}">
          <div class="lw-host-ed-head">
            <span class="lw-sprite-box">${hostArt(h)}</span>
            <div class="lw-host-ed-meta">
              <div class="lw-card-title">${esc(h.title)}</div>
              <div class="lw-row">
                <button class="lw-ghost lw-small" data-upload="${h.id}">${UPLOAD}<span>${sprites[h.id] ? "Change image" : "Upload image"}</span></button>
                ${sprites[h.id] ? `<button class="lw-ghost lw-small lw-ghost-danger" data-unsprite="${h.id}">Remove</button>` : ""}
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
        </div>`).join("");
    el.charprompt.value = settings?.characterHostPrompt || DEFAULT_CHARACTER_HOST_PROMPT;
  }
  function renderConnections() {
    el.sConn.innerHTML = `<option value="">Use my default connection</option>` + connections.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}${c.isDefault ? " (default)" : ""}${c.model ? ` · ${esc(c.model)}` : ""}</option>`).join("");
    if (settings) {
      if (settings.connectionId && !connections.some((c) => c.id === settings.connectionId)) {
        el.sConn.insertAdjacentHTML("beforeend", `<option value="${esc(settings.connectionId)}">(saved connection not found)</option>`);
      }
      el.sConn.value = settings.connectionId;
    }
    const err = initErrors.find((e) => e.startsWith("Connections"));
    el.sConnHint.textContent = err ? `Couldn't load your connections: ${err.replace(/^Connections:\s*/, "")}` : connections.length ? "Point this at your sidecar or a cheap model to keep costs down." : "No connection profiles found. Make one in Lumiverse, then tap ↻.";
    el.sConnHint.classList.toggle("lw-warn", !!err);
  }
  function renderSettings() {
    if (!settings)
      return;
    renderConnections();
    const num = (v) => v === null || v === undefined ? "" : String(v);
    el.sNoReason.checked = settings.noReasoning;
    el.sTemp.value = String(settings.temperature);
    el.sMax.value = num(settings.maxTokens);
    el.sTopP.value = num(settings.topP);
    el.sTopK.value = num(settings.topK);
    el.sMinP.value = num(settings.minP);
    el.sRep.value = num(settings.repetitionPenalty);
    el.sFreq.value = num(settings.frequencyPenalty);
    el.sPres.value = num(settings.presencePenalty);
    el.sTopchars.value = String(settings.topCharCount);
    el.sPerchar.value = String(settings.chatsPerChar);
    el.sSample.value = String(settings.sampleCount);
    el.sSecs.value = String(settings.slideSeconds);
    el.sCommentary.checked = settings.statsCommentary;
  }
  function collectHosts() {
    const hosts = (settings?.hosts || DEFAULT_HOSTS).map((h) => {
      const card = el.hostEditors.querySelector(`[data-host-editor="${h.id}"]`);
      if (!card)
        return h;
      const v = (f) => (card.querySelector(`[data-f="${f}"]`)?.value || "").trim();
      return { ...h, name: v("name") || h.name, emoji: v("emoji") || h.emoji, accent: v("accent") || h.accent, prompt: v("prompt") || h.prompt };
    });
    return { hosts, characterHostPrompt: el.charprompt.value.trim() || DEFAULT_CHARACTER_HOST_PROMPT };
  }
  function renderAll() {
    renderBanner();
    renderCharacterSelects();
    renderScope();
    renderDepth();
    renderHostPicker();
    renderSettings();
    renderSlides();
    renderHostEditors();
    renderLibrary();
    renderBusy();
  }
  function play(wrap, startAt = 0) {
    player?.close();
    playerWrapId = wrap.id;
    player = openPlayer(ctx, wrap, {
      slideSeconds: settings?.slideSeconds || 8,
      sprite: wrap.host.kind === "builtin" ? sprites[wrap.host.id] : undefined,
      startAt,
      onExpose: (chatId) => {
        pendingExpose = { wrapId: wrap.id, chatId };
        player?.setBusy("Checking the receipts...");
        ctx.sendToBackend({ type: "expose_estimate", wrapId: playerWrapId, chatId });
      },
      onClose: () => {
        player = null;
        playerWrapId = "";
      }
    });
  }
  root.querySelectorAll(".lw-nav button").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
  el.banner.addEventListener("click", (e) => {
    if (e.target.closest("[data-retry]"))
      ctx.sendToBackend({ type: "init" });
  });
  const bumpYear = (d) => {
    el.year.value = String((Number(el.year.value) || thisYear) + d);
    invalidateScan("Year changed. Scan again to update.");
  };
  el.yearDown.addEventListener("click", () => bumpYear(-1));
  el.yearUp.addEventListener("click", () => bumpYear(1));
  el.year.addEventListener("change", () => invalidateScan("Year changed. Scan again to update."));
  el.scope.addEventListener("click", (e) => {
    const b = e.target.closest("[data-scope]");
    if (!b || b.dataset.scope === scope)
      return;
    scope = b.dataset.scope;
    renderScope();
    invalidateScan("Scope changed. Scan again to update.");
  });
  el.label.addEventListener("change", () => invalidateScan());
  el.depths.addEventListener("click", (e) => {
    const b = e.target.closest("[data-depth]");
    if (!b || b.dataset.depth === depth)
      return;
    depth = b.dataset.depth;
    renderDepth();
    invalidateScan("Scan level changed. Scan again to see what it will read.");
  });
  el.hosts.addEventListener("click", (e) => {
    const tile = e.target.closest("[data-host]");
    if (!tile)
      return;
    hostRef = tile.dataset.host === "char" ? `char:${hostCharId}` : tile.dataset.host;
    if (tile.dataset.host === "char" && !characters.length)
      ctx.sendToBackend({ type: "init" });
    renderHostPicker();
    hostPicker.render();
    refreshEstimate();
  });
  function refreshEstimate() {
    if (!scan)
      return;
    renderResult();
    ctx.sendToBackend({ type: "estimate", scanId: scan.scanId, selected: [...selected], host: currentHostRef() });
  }
  el.scan.addEventListener("click", () => {
    if (busy)
      return;
    const host = currentHostRef();
    if (!host)
      return setStatus("Pick a character to host, or choose one of the girls.", "error");
    hostPicker.close();
    if (scope === "pick" && !pickedChars.size)
      return setStatus("Pick at least one character to wrap.", "error");
    charPicker.close();
    setStatus("");
    scan = null;
    el.result.hidden = true;
    busy = "scan";
    renderBusy();
    setProgress("Starting...");
    ctx.sendToBackend({
      type: "scan",
      request: {
        year: Number(el.year.value) || thisYear,
        scope,
        characterIds: [...pickedChars],
        label: el.label.value.trim(),
        depth,
        host,
        tzOffset: new Date().getTimezoneOffset()
      }
    });
  });
  el.picked.addEventListener("change", (e) => {
    const box = e.target;
    if (!box.dataset.pick)
      return;
    if (box.checked)
      selected.add(box.dataset.pick);
    else
      selected.delete(box.dataset.pick);
    refreshEstimate();
  });
  el.commentary.addEventListener("change", () => {
    if (!settings)
      return;
    settings.statsCommentary = el.commentary.checked;
    el.sCommentary.checked = el.commentary.checked;
    ctx.sendToBackend({ type: "save_settings", settings: { statsCommentary: el.commentary.checked }, quiet: true });
  });
  el.go.addEventListener("click", () => {
    if (!scan || busy)
      return;
    if (scan.depth !== "stats" && !selected.size)
      return setStatus("Tick at least one chat, or switch to Stats.", "error");
    setStatus("");
    busy = "wrap";
    renderBusy();
    setProgress("Wrapping...");
    ctx.sendToBackend({ type: "wrap", scanId: scan.scanId, selected: [...selected], host: currentHostRef() });
  });
  el.lib.addEventListener("click", (e) => {
    const t = e.target;
    const playBtn = t.closest("[data-play]");
    const ren = t.closest("[data-rename]");
    const del = t.closest("[data-delete]");
    if (del) {
      const id = del.dataset.delete;
      twoTap(del, `del:${id}`, `${TRASH}<span>Sure?</span>`, () => ctx.sendToBackend({ type: "delete_wrap", id }));
    } else if (ren) {
      const id = ren.dataset.rename;
      const item = ren.closest(".lw-libitem");
      const w = library.find((x) => x.id === id);
      item.innerHTML = `<form class="lw-rename"><input type="text" maxlength="80" value="${esc(w?.title || "")}"><button class="lw-ghost lw-small" type="submit">Save</button><button class="lw-ghost lw-small" type="button" data-cancel>Cancel</button></form>`;
      const input = item.querySelector("input");
      input.focus();
      input.select();
      item.querySelector("form").addEventListener("submit", (ev) => {
        ev.preventDefault();
        if (input.value.trim())
          ctx.sendToBackend({ type: "rename_wrap", id, title: input.value });
        else
          renderLibrary();
      });
      item.querySelector("[data-cancel]").addEventListener("click", renderLibrary);
    } else if (playBtn) {
      ctx.sendToBackend({ type: "get_wrap", id: playBtn.dataset.play, play: true });
    }
  });
  el.deleteAll.addEventListener("click", () => {
    twoTap(el.deleteAll, "del:all", `Tap again to delete all ${library.length}`, () => ctx.sendToBackend({ type: "delete_all_wraps" }));
  });
  el.slides.addEventListener("click", (e) => {
    const t = e.target;
    const up = t.closest("[data-up]");
    const down = t.closest("[data-down]");
    const i = Number(up?.dataset.up ?? down?.dataset.down);
    if (!Number.isInteger(i))
      return;
    const j = up ? i - 1 : i + 1;
    if (j < 0 || j >= slidesDraft.length)
      return;
    [slidesDraft[i], slidesDraft[j]] = [slidesDraft[j], slidesDraft[i]];
    renderSlides();
  });
  el.slides.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.title)
      slidesDraft[Number(t.dataset.title)].title = t.value;
    if (t.dataset.prompt)
      slidesDraft[Number(t.dataset.prompt)].prompt = t.value;
  });
  el.slides.addEventListener("change", (e) => {
    const t = e.target;
    if (!t.dataset.toggle)
      return;
    slidesDraft[Number(t.dataset.toggle)].enabled = t.checked;
    t.closest(".lw-slide-row")?.classList.toggle("off", !t.checked);
  });
  el.slidesSave.addEventListener("click", () => ctx.sendToBackend({ type: "save_settings", settings: { slides: slidesDraft } }));
  el.slidesReset.addEventListener("click", () => twoTap(el.slidesReset, "reset:slides", "Sure?", () => ctx.sendToBackend({ type: "reset_slides" })));
  el.hostEditors.addEventListener("click", (e) => {
    const t = e.target;
    const up = t.closest("[data-upload]");
    const rm = t.closest("[data-unsprite]");
    const reset = t.closest("[data-reset-host]");
    if (up) {
      uploadFor = up.dataset.upload;
      el.file.value = "";
      el.file.click();
    } else if (rm) {
      ctx.sendToBackend({ type: "save_sprite", hostId: rm.dataset.unsprite, dataUrl: "" });
    } else if (reset) {
      const def = DEFAULT_HOSTS.find((h) => h.id === reset.dataset.resetHost);
      const card = el.hostEditors.querySelector(`[data-host-editor="${reset.dataset.resetHost}"]`);
      if (!def || !card)
        return;
      for (const f of ["name", "emoji", "accent", "prompt"]) {
        const input = card.querySelector(`[data-f="${f}"]`);
        if (input)
          input.value = def[f];
      }
    }
  });
  el.file.addEventListener("change", async () => {
    const file = el.file.files?.[0];
    if (!file || !uploadFor)
      return;
    try {
      const dataUrl = await readImage(file);
      ctx.sendToBackend({ type: "save_sprite", hostId: uploadFor, dataUrl });
    } catch (err) {
      hostsStatus(err?.message || "That image did not work.");
    }
  });
  el.hostsSave.addEventListener("click", () => ctx.sendToBackend({ type: "save_settings", settings: collectHosts() }));
  el.hostsReset.addEventListener("click", () => twoTap(el.hostsReset, "reset:hosts", "Sure?", () => ctx.sendToBackend({ type: "reset_hosts" })));
  el.sRefresh.addEventListener("click", () => ctx.sendToBackend({ type: "init" }));
  el.sSave.addEventListener("click", () => {
    const optNum = (i) => i.value.trim() === "" ? null : Number(i.value);
    ctx.sendToBackend({
      type: "save_settings",
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
        statsCommentary: el.sCommentary.checked
      }
    });
  });
  const offPerm = ctx.events.on("SPINDLE_PERMISSION_CHANGED", (payload) => {
    const d = payload;
    if (!d?.extensionId || d.extensionId === ctx.manifest?.identifier)
      ctx.sendToBackend({ type: "init" });
  });
  const offActivate = tab.onActivate(() => {
    if (!characters.length || missing.length)
      ctx.sendToBackend({ type: "init" });
  });
  const unsub = ctx.onBackendMessage((msg) => {
    switch (msg?.type) {
      case "init_data":
        settings = msg.settings;
        characters = msg.characters || [];
        connections = msg.connections || [];
        sprites = msg.sprites || {};
        missing = msg.missing || [];
        initErrors = msg.errors || [];
        slidesDraft = (settings?.slides || DEFAULT_SLIDES).map((s) => ({ ...s }));
        renderAll();
        break;
      case "settings_saved":
        settings = msg.settings;
        slidesDraft = settings.slides.map((s) => ({ ...s }));
        renderSettings();
        renderSlides();
        renderHostEditors();
        renderHostPicker();
        refreshEstimate();
        break;
      case "sprites":
        sprites = msg.sprites || {};
        hostsStatus("");
        renderHostEditors();
        renderHostPicker();
        renderLibrary();
        break;
      case "progress":
        if (msg.stage === "idle") {
          player?.setBusy("");
          busy = "";
          setProgress("");
          renderBusy();
        } else if (msg.stage === "expose") {
          player?.setBusy(msg.text);
        } else {
          setProgress(msg.text, msg.done, msg.total);
        }
        break;
      case "scan_result":
        scan = { scanId: msg.scanId, stats: msg.stats, picked: msg.picked || [], depth: msg.depth, estimate: msg.estimate };
        selected = new Set(scan.picked.map((p) => p.id));
        busy = "";
        setProgress("");
        renderResult();
        break;
      case "estimate":
        if (scan && msg.scanId === scan.scanId) {
          scan.estimate = msg.estimate;
          renderEstimate();
        }
        break;
      case "wrap_ready":
        busy = "";
        setProgress("");
        renderBusy();
        play(msg.wrap);
        break;
      case "wrap_data":
        if (msg.play)
          play(msg.wrap);
        break;
      case "library":
        library = msg.wraps || [];
        renderLibrary();
        break;
      case "wrap_deleted":
        if (player && playerWrapId === msg.id)
          player.close();
        break;
      case "expose_estimate": {
        if (!player || !pendingExpose || msg.chatId !== pendingExpose.chatId)
          break;
        player.setBusy("");
        const ex = pendingExpose;
        const cost = msg.cached ? `about ${fmt(msg.tokens)} tokens (this chat's summary is already cached)` : `about ${fmt(msg.tokens)} tokens to read the whole chat`;
        player.ask(`Expose this chat? That's ${cost}.`, "Expose me").then((ok) => {
          if (ok)
            ctx.sendToBackend({ type: "expose_run", wrapId: ex.wrapId, chatId: ex.chatId });
          pendingExpose = null;
        });
        break;
      }
      case "expose_done":
        if (player && msg.wrap?.id === playerWrapId)
          player.updateWrap(msg.wrap, msg.slideIndex);
        break;
      case "error":
        if (msg.where === "expose" && player) {
          player.setBusy("");
          player.ask(msg.message || "Something went wrong.", "OK");
          break;
        }
        if (view === "hosts")
          hostsStatus(msg.message || "Something went wrong.");
        else
          setStatus(msg.message || "Something went wrong.", "error");
        setProgress("");
        busy = "";
        renderBusy();
        break;
    }
  });
  setView("wrap");
  renderAll();
  ctx.sendToBackend({ type: "init" });
  return () => {
    player?.close();
    armed.forEach((t) => clearTimeout(t));
    offPerm();
    offActivate();
    unsub();
    removeStyle();
    tab.destroy();
  };
}
export {
  setup
};
