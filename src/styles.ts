// Sidebar follows the user's Lumiverse theme; the player has its own festive look.

export const STYLES = `
/* ================= sidebar ================= */
.lw {
  --lw-pine: #1f6b4f;
  --lw-berry: #c8344f;
  --lw-gold: #d9b45a;
  --lw-radius: var(--lumiverse-radius, 10px);
  display: flex; flex-direction: column; gap: 10px;
  padding: 12px; box-sizing: border-box; height: 100%; width: 100%; max-width: 100%; overflow-y: auto; overflow-x: hidden;
  color: var(--lumiverse-text); font-size: 14px;
}
.lw *, .lw *::before, .lw *::after { box-sizing: border-box; }
.lw [hidden] { display: none !important; }
.lw section { display: flex; flex-direction: column; gap: 10px; }

.lw-head { display: flex; align-items: center; gap: 10px; }
.lw-logo { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; font-size: 20px; flex: none;
  background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--lw-berry) 45%, transparent), color-mix(in srgb, var(--lw-pine) 35%, transparent)); }
.lw-title { font-weight: 800; font-size: 17px; letter-spacing: .01em; }
.lw-tagline { font-size: 12px; color: var(--lumiverse-text-muted); font-style: italic; }

.lw-nav { display: flex; gap: 2px; border-bottom: 1px solid var(--lumiverse-border); }
.lw-nav button { flex: 1; min-width: 0; padding: 8px 2px; background: none; border: none; border-bottom: 2px solid transparent;
  color: var(--lumiverse-text-muted); font-weight: 700; cursor: pointer; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lw-nav button.active { color: var(--lumiverse-text); border-bottom-color: var(--lw-berry); }

.lw-card { display: flex; flex-direction: column; gap: 10px; padding: 12px;
  background: var(--lumiverse-fill-subtle); border: 1px solid var(--lumiverse-border); border-radius: var(--lw-radius); }
.lw-card-title { font-weight: 800; font-size: 14px; }
.lw-card-title small { font-weight: 400; color: var(--lumiverse-text-muted); }
.lw-mt { margin-top: 4px; }
.lw-hint { margin: 0; font-size: 12px; color: var(--lumiverse-text-muted); line-height: 1.45; }
.lw-hint code { font-size: 11px; padding: 1px 4px; border-radius: 4px; background: var(--lumiverse-fill); overflow-wrap: anywhere; }

.lw-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.lw-field > span { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--lumiverse-text-muted); }
.lw input[type="text"], .lw input[type="number"], .lw select, .lw textarea {
  width: 100%; max-width: 100%; min-width: 0; padding: 7px 9px; font: inherit; font-size: 13px; color: var(--lumiverse-text);
  background: var(--lumiverse-fill); border: 1px solid var(--lumiverse-border); border-radius: var(--lw-radius); }
.lw input[type="color"] { width: 100%; height: 34px; padding: 2px; border: 1px solid var(--lumiverse-border); border-radius: var(--lw-radius); background: var(--lumiverse-fill); }
.lw textarea { resize: vertical; line-height: 1.45; }
.lw input:focus, .lw select:focus, .lw textarea:focus { outline: none; border-color: var(--lw-gold); }
.lw input[type="radio"], .lw input[type="checkbox"] { accent-color: var(--lw-berry); }

.lw-radio { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; padding: 5px 0; cursor: pointer; font-weight: 700; font-size: 13px; }
.lw-radio small { flex-basis: 100%; padding-left: 22px; font-weight: 400; color: var(--lumiverse-text-muted); font-size: 12px; line-height: 1.4; }
.lw-check { display: flex; gap: 8px; align-items: center; font-size: 13px; cursor: pointer; }

.lw-grid2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
.lw-row { display: flex; gap: 8px; flex-wrap: wrap; }
.lw-grow { flex: 1; width: auto; }

.lw-primary { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
  padding: 11px 14px; border: none; border-radius: 999px; cursor: pointer; font-weight: 800; font-size: 14px; color: #fff;
  background: linear-gradient(180deg, #d84a63, var(--lw-berry)); box-shadow: 0 2px 0 #8d1f33, inset 0 1px 0 rgba(255,255,255,.25);
  transition: transform .1s, filter .15s; }
.lw-primary:hover:not(:disabled) { filter: brightness(1.06); }
.lw-primary:active:not(:disabled) { transform: translateY(2px); box-shadow: none; }
.lw-primary:disabled { opacity: .6; cursor: default; }
.lw-slim { padding: 9px 14px; font-size: 13px; }
.lw-ghost { padding: 7px 12px; border-radius: 999px; cursor: pointer; font-weight: 600; font-size: 12px;
  background: none; color: var(--lumiverse-text-muted); border: 1px solid var(--lumiverse-border); }
.lw-ghost:hover:not(:disabled) { color: var(--lumiverse-text); border-color: var(--lw-gold); }
.lw-small { padding: 4px 10px; font-size: 11px; }
.lw-ghost-danger:hover:not(:disabled) { color: var(--lumiverse-danger, #d9534f); border-color: var(--lumiverse-danger, #d9534f); }

.lw-status { font-size: 12px; line-height: 1.4; }
.lw-status:empty { display: none; }
.lw-status.info { color: var(--lumiverse-text-muted); }
.lw-status.error { padding: 8px 10px; border-radius: var(--lw-radius); color: var(--lumiverse-danger, #d9534f);
  background: color-mix(in srgb, var(--lumiverse-danger, #d9534f) 10%, transparent); }

.lw-progress { display: flex; flex-direction: column; gap: 6px; }
.lw-progress-text { font-size: 12px; color: var(--lumiverse-text-muted); }
.lw-progress-bar { height: 6px; border-radius: 999px; background: var(--lumiverse-fill); overflow: hidden; }
.lw-progress-bar i { display: block; height: 100%; border-radius: 999px; transition: width .2s;
  background: repeating-linear-gradient(-45deg, var(--lw-berry) 0 8px, #fff 8px 12px); }
.lw-progress-bar i.indeterminate { animation: lw-candy 1s linear infinite; background-size: 34px 34px; }

/* host tiles */
.lw-hosts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.lw-host-tile { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 10px 6px; cursor: pointer; text-align: center;
  background: var(--lumiverse-fill); color: var(--lumiverse-text); border: 1px solid var(--lumiverse-border); border-radius: var(--lw-radius); font: inherit; }
.lw-host-tile:hover { border-color: var(--tile); }
.lw-host-tile.on { border-color: var(--tile); background: color-mix(in srgb, var(--tile) 16%, var(--lumiverse-fill)); box-shadow: 0 0 0 1px var(--tile) inset; }
.lw-tile-art { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; font-size: 24px; overflow: hidden; flex: none;
  background: color-mix(in srgb, var(--tile, #d9b45a) 22%, transparent); }
.lw-tile-art img { width: 100%; height: 100%; object-fit: cover; }
.lw-tile-name { font-weight: 800; font-size: 13px; }
.lw-tile-sub { font-size: 11px; color: var(--lumiverse-text-muted); }

/* scan result */
.lw-found { font-size: 13px; line-height: 1.5; }
.lw-picked { display: flex; flex-direction: column; border: 1px solid var(--lumiverse-border); border-radius: 8px; max-height: 260px; overflow-y: auto; }
.lw-pick { display: flex; align-items: center; gap: 9px; padding: 7px 9px; cursor: pointer; border-bottom: 1px solid var(--lumiverse-border); }
.lw-pick:last-child { border-bottom: none; }
.lw-pick:hover { background: var(--lumiverse-fill); }
.lw-pick-text { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.3; }
.lw-pick-text b { font-size: 13px; overflow-wrap: anywhere; }
.lw-pick-text small { font-size: 11.5px; color: var(--lumiverse-text-muted); }
.lw-pick-cost { flex: none; font-size: 11.5px; font-weight: 700; color: var(--lumiverse-text-muted); }
.lw-pick-cost.free { color: var(--lw-pine); }
.lw-cost { padding: 10px; border-radius: 8px; background: var(--lumiverse-fill); }
.lw-cost-big { font-size: 22px; font-weight: 800; color: var(--lw-gold); }
.lw-cost-big small { font-size: 12px; font-weight: 600; color: var(--lumiverse-text-muted); }

/* library */
.lw-lib { display: flex; flex-direction: column; gap: 6px; }
.lw-libitem { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; padding: 9px; border-radius: 8px; background: var(--lumiverse-fill); }
.lw-lib-emoji { font-size: 22px; }
.lw-lib-text { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.3; }
.lw-lib-text b { font-size: 13px; overflow-wrap: anywhere; }
.lw-lib-text small { font-size: 11.5px; color: var(--lumiverse-text-muted); }
.lw-lib-actions { display: flex; flex-wrap: wrap; gap: 4px; width: 100%; }

/* slides editor */
.lw-slides { display: flex; flex-direction: column; gap: 6px; }
.lw-slide-row { padding: 8px; border-radius: 8px; background: var(--lumiverse-fill); border: 1px solid var(--lumiverse-border); }
.lw-slide-row.off { opacity: .55; }
.lw-slide-head { display: flex; align-items: center; gap: 6px; }
.lw .lw-slide-title { flex: 1; min-width: 0; padding: 4px 6px; font-weight: 700; background: transparent; border-color: transparent; }
.lw .lw-slide-title:hover { border-color: var(--lumiverse-border); }
.lw-badge { flex: none; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 999px; text-transform: uppercase; letter-spacing: .03em;
  background: color-mix(in srgb, var(--lw-pine) 20%, transparent); color: var(--lumiverse-text); }
.lw-badge-highlights { background: color-mix(in srgb, var(--lw-gold) 28%, transparent); }
.lw-badge-deep { background: color-mix(in srgb, var(--lw-berry) 26%, transparent); }
.lw-icon { flex: none; width: 24px; height: 24px; display: grid; place-items: center; padding: 0; cursor: pointer; font-size: 9px;
  border: 1px solid var(--lumiverse-border); border-radius: 6px; background: none; color: var(--lumiverse-text-muted); }
.lw-icon:disabled { opacity: .3; cursor: default; }
.lw-slide-row details { margin-top: 6px; }
.lw-slide-row summary { cursor: pointer; font-size: 12px; color: var(--lumiverse-text-muted); }
.lw-slide-row textarea { margin-top: 6px; }
.lw-switch { position: relative; flex: none; width: 32px; height: 18px; cursor: pointer; }
.lw-switch input { position: absolute; opacity: 0; inset: 0; margin: 0; cursor: pointer; }
.lw-switch i { position: absolute; inset: 0; border-radius: 999px; background: var(--lumiverse-border); transition: background .15s; pointer-events: none; }
.lw-switch i::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: #fff; transition: transform .15s; }
.lw-switch input:checked + i { background: var(--lw-pine); }
.lw-switch input:checked + i::after { transform: translateX(14px); }

/* host editor */
.lw [data-el="host-editors"] { display: flex; flex-direction: column; gap: 10px; }
.lw-host-ed-head { display: flex; align-items: center; gap: 10px; }

@keyframes lw-candy { to { background-position: 34px 0; } }

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
.lw-np { flex: 1; min-width: 0; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 999px; background: rgba(0,0,0,.28);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lw-topbar .lw-np[hidden] + .lw-x { margin-left: auto; }
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
.lw-stage[data-slide="quotes"] .lw-host, .lw-stage[data-slide="story_arcs"] .lw-host, .lw-stage[data-slide="expose"] .lw-host { height: 44cqh; }
.lw-stage[data-slide="quotes"] .lw-slide, .lw-stage[data-slide="story_arcs"] .lw-slide, .lw-stage[data-slide="expose"] .lw-slide { bottom: 47cqh; }
.lw-stage[data-slide="quotes"] .lw-say, .lw-stage[data-slide="story_arcs"] .lw-say, .lw-stage[data-slide="expose"] .lw-say { font-size: max(15px, 4.4cqw); }
.lw-stage[data-slide="outro"] .lw-host { height: 18cqh; }
.lw-stage[data-slide="outro"] .lw-slide { bottom: 20cqh; justify-content: flex-start; overflow-y: auto; }

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
.lw-card-preview { width: 46%; max-width: 190px; aspect-ratio: 9 / 16; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.5); background: rgba(255,255,255,.08); }
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
`
