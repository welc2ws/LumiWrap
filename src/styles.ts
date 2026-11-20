// Sidebar follows the user's Lumiverse theme; the player has its own festive look.

export const STYLES = `
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
`
