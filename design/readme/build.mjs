// README artwork: split light/dark scenes with Bo presenting the app. Output: design/readme/out/*.html → .github/assets/*.png
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '../..');
const bo = (pose, size) => readFileSync(join(ROOT, 'design/mascot', `bo-${pose}.svg`), 'utf8').replace('<svg ', `<svg width="${size}" height="${size}" `);
const FONT = join(ROOT, 'frontend/node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2');

const CSS = `
@font-face { font-family: 'M'; src: url('file://${FONT}') format('woff2'); font-weight: 100 900; }
html { zoom: 2; }
body { margin: 0; font-family: 'M', -apple-system, 'Helvetica Neue', sans-serif; font-size: 13px; line-height: 1.4; -webkit-font-smoothing: antialiased; }
.mono { font-family: 'SF Mono', Menlo, monospace; font-variant-numeric: tabular-nums; }
.stage { position: relative; overflow: hidden; }
.light, .dark { position: absolute; inset: 0; }
.light { background: #F6F5F1; }
.light::after { content: ''; position: absolute; inset: 0; background: radial-gradient(60% 70% at 22% 28%, rgba(46,100,200,0.10), transparent 70%); }
.dark { background: #151412; }
.dark::after { content: ''; position: absolute; inset: 0; background: radial-gradient(60% 70% at 78% 72%, rgba(111,155,232,0.18), transparent 70%); }
.grain { position: absolute; inset: 0; background-image: radial-gradient(rgba(27,26,23,0.08) 0.6px, transparent 0.6px); background-size: 6px 6px; opacity: 0.5; }
.dark .grain { background-image: radial-gradient(rgba(236,234,228,0.10) 0.6px, transparent 0.6px); }
.t { --bg:#F6F5F1; --surface:#FFFFFF; --surface-2:#EFEEE9; --border:#E6E4DE; --border-2:#D8D5CD; --text:#1B1A17; --text-2:#6E6A62; --text-3:#9B978E; --accent:#2E64C8; --accent-soft:#E4ECFA; --accent-text:#1F4F9E; --ok:#3B7A45; --fa:#DCE7F8; --fb:#C6D8F4; --fl:#3F6BB8; --primary:#171614; --on-primary:#fff; --shadow: 0 30px 80px rgba(27,26,23,0.22), 0 2px 6px rgba(27,26,23,0.08); color: var(--text); }
.dark .t { --bg:#151412; --surface:#1C1B18; --surface-2:#252420; --border:#2C2B26; --border-2:#3A3832; --text:#ECEAE4; --text-2:#A19D94; --text-3:#726F67; --accent:#6F9BE8; --accent-soft:#1F2E4A; --accent-text:#A9C4F2; --ok:#7FC48A; --fa:#25355A; --fb:#2F457A; --fl:#7FA3E6; --primary:#ECEAE4; --on-primary:#151412; --shadow: 0 30px 80px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4); }
.win { position: absolute; display: flex; overflow: hidden; border-radius: 12px; background: var(--surface); box-shadow: var(--shadow); border: 1px solid var(--border); }
.side { width: 190px; flex: none; background: var(--bg); border-right: 1px solid var(--border); display: flex; flex-direction: column; }
.row { display: flex; align-items: center; gap: 9px; height: 30px; padding: 0 9px; border-radius: 6px; color: var(--text-2); }
.row.on { background: var(--surface); border: 1px solid var(--border); color: var(--text); font-weight: 500; }
.cap { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-3); padding: 14px 18px 4px; }
.hdr { height: 48px; display: flex; align-items: center; gap: 10px; padding: 0 18px; border-bottom: 1px solid var(--border); }
.btn { height: 28px; padding: 0 11px; border-radius: 6px; border: 1px solid var(--border-2); background: var(--surface); font-size: 12px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px; color: var(--text); }
.btn.p { background: var(--primary); color: var(--on-primary); border-color: var(--primary); }
.search { height: 28px; width: 190px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface-2); display: flex; align-items: center; gap: 7px; padding: 0 9px; color: var(--text-3); font-size: 12px; }
.card { border: 1px solid var(--border); border-radius: 10px; background: var(--surface); padding: 10px; display: flex; flex-direction: column; gap: 8px; }
.card .name { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card .meta { font-size: 11px; color: var(--text-3); }
.thumb { height: 74px; border-radius: 6px; }
.bar { height: 5px; border-radius: 3px; background: var(--surface-2); overflow: hidden; }
.bar i { display: block; height: 100%; background: var(--accent); border-radius: 3px; }
.panel { position: absolute; width: 380px; border-radius: 12px; background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow); overflow: hidden; }
.prow { display: flex; align-items: center; gap: 10px; padding: 9px 14px; border-top: 1px solid var(--border); }
.menu { position: absolute; width: 250px; padding: 5px; border-radius: 9px; background: var(--surface); border: 1px solid var(--border-2); box-shadow: var(--shadow); font-size: 13px; }
.menu div { height: 24px; padding: 0 10px; display: flex; align-items: center; justify-content: space-between; border-radius: 5px; }
.menu .dis { color: var(--text-3); }
.menu .hl { background: #3478F6; color: #fff; }
.menu .sep { height: 1px; margin: 5px 10px; padding: 0; background: var(--border-2); }
.mark { display: inline-flex; align-items: center; gap: 10px; font-weight: 600; font-size: 26px; letter-spacing: -0.03em; }
.eyebrow { position: absolute; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
.tag { position: absolute; font-size: 22px; font-weight: 500; letter-spacing: -0.02em; line-height: 1.25; }
`;

const ICON = {
	folder: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
	clock: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
	transfers: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4v16M7 4l-3 3M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3"/></svg>',
	trash: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
	search: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
	upload: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6M12 6l-5 5M12 6l5 5"/></svg>',
	plus: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
	image: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-9 8"/></svg>',
	check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>'
};
const folderGlyph = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="var(--fa)" stroke="var(--fl)" stroke-width="1.1" stroke-linejoin="round"/><path d="M3 10h18v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="var(--fb)" stroke="var(--fl)" stroke-width="1.1" stroke-linejoin="round"/></svg>`;
const lights = () => `<div style="display:flex;gap:8px;align-items:center">${['#FF5F57', '#FEBC2E', '#28C840'].map((c) => `<span style="width:12px;height:12px;border-radius:6px;background:${c}"></span>`).join('')}</div>`;
const mark = (s) => readFileSync(join(ROOT, 'design/mascot/mark.svg'), 'utf8').replace('<svg ', `<svg width="${s}" height="${s}" `);

// the app window (Files, card view) — one markup, themed by the surrounding layer
const appWindow = (x, y, w, h) => `
<div class="t win" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">
  <aside class="side">
    <div style="height:48px;display:flex;align-items:center;padding:0 16px">${lights()}</div>
    <nav style="display:flex;flex-direction:column;gap:2px;padding:0 10px">
      <div class="row on">${ICON.folder}Files</div><div class="row">${ICON.clock}Recent</div><div class="row">${ICON.transfers}Transfers</div><div class="row">${ICON.trash}Trash</div>
    </nav>
    <div class="cap">Folders</div>
    <div style="display:flex;flex-direction:column;gap:1px;padding:0 10px">${['Backups', 'Product Photos', 'Reports', 'Staff Docs'].map((n) => `<div class="row" style="height:27px">${folderGlyph(15)}${n}</div>`).join('')}</div>
    <div style="flex:1"></div>
    <div style="padding:10px 16px 8px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:7px;font-size:11px"><div style="display:flex;justify-content:space-between"><span style="color:var(--text-2)">Storage</span><span class="mono" style="color:var(--text-3)">48.2 / 200 GB</span></div><div class="bar" style="height:4px"><i style="width:24%"></i></div></div>
    <div style="display:flex;align-items:center;gap:9px;padding:6px 12px 12px 14px"><span style="width:26px;height:26px;border-radius:13px;background:var(--accent-soft);color:var(--accent-text);display:inline-flex;align-items:center;justify-content:center;font-weight:600;font-size:12px">K</span><span style="font-size:12px;font-weight:500">kietle</span></div>
  </aside>
  <main style="flex:1;min-width:0;display:flex;flex-direction:column">
    <div class="hdr"><span style="font-weight:600;font-size:14px">Files</span><span style="flex:1"></span><span class="search">${ICON.search}Search</span><span class="btn">${ICON.plus}New folder</span><span class="btn p">${ICON.upload}Upload</span></div>
    <div style="padding:16px 18px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
      ${['Backups', 'Product Photos', 'Reports', 'Staff Docs'].map((n) => `<div class="card" style="flex-direction:row;align-items:center;gap:9px;padding:9px 10px">${folderGlyph(22)}<span class="name">${n}</span></div>`).join('')}
      ${[['store-front.jpg', '3.4 MB', 'linear-gradient(135deg,#C9B48F,#8E7A57)'], ['latte-art.jpg', '4.1 MB', 'linear-gradient(135deg,#F1E8D8,#C9B48F)'], ['menu-board-v3.pdf', '6.1 MB', 'var(--surface-2)'], ['promo-loop.mp4', '412 MB', 'linear-gradient(135deg,#25355A,#3F6BB8)']].map(([n, s, bg]) => `<div class="card"><div class="thumb" style="background:${bg}"></div><span class="name">${n}</span><span class="meta">${s}</span></div>`).join('')}
    </div>
  </main>
</div>`;

const scene = (w, h, clip, inner, { wordmark = false, tagline = '' } = {}) => `<!doctype html><meta charset="utf-8"><style>${CSS}</style>
<div class="stage" style="width:${w}px;height:${h}px">
  <div class="light"><div class="grain"></div>${wordmark ? `<div class="t mark" style="position:absolute;left:56px;top:44px">${mark(38)}Soteria</div>` : ''}${inner('light')}</div>
  <div class="dark" style="clip-path:polygon(${clip})"><div class="grain"></div>${tagline ? `<div class="tag" style="right:60px;top:52px;width:360px;text-align:right;color:#ECEAE4">${tagline}</div>` : ''}${inner('dark')}</div>
  ${inner('bo')}
</div>`;

// ---------------------------------------------------------------- hero
const hero = scene(1200, 600, '57% 0, 100% 0, 100% 100%, 43% 100%', (layer) => layer === 'bo'
	? `<div style="position:absolute;left:36px;top:300px">${bo('carry', 310)}</div>`
	: appWindow(300, 122, 720, 440), { wordmark: true, tagline: 'Self-hosted files, at home on your desktop.' });

// ---------------------------------------------------------------- drive: Finder (light) and File Explorer (dark)
const finder = (x, y) => `
<div class="t win" style="left:${x}px;top:${y}px;width:440px;height:290px;border-radius:10px">
  <aside class="side" style="width:150px;padding:0 8px">
    <div style="height:44px;display:flex;align-items:center;padding:0 8px">${lights()}</div>
    <div class="cap" style="padding:6px 10px 4px">Favorites</div>
    ${['Desktop', 'Documents', 'Downloads'].map((n) => `<div class="row" style="height:26px;font-size:12px">${folderGlyph(14)}${n}</div>`).join('')}
    <div class="cap" style="padding:12px 10px 4px">Locations</div>
    <div class="row on" style="height:26px;font-size:12px;background:var(--accent-soft);border-color:transparent;color:var(--accent-text)">${mark(15)}Soteria</div>
  </aside>
  <main style="flex:1;display:flex;flex-direction:column">
    <div class="hdr" style="height:44px;gap:8px"><span style="font-weight:600;font-size:13px">Soteria</span><span style="flex:1"></span><span class="search" style="width:120px;height:24px">${ICON.search}</span></div>
    <div style="padding:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px;align-content:start">
      ${['Backups', 'Product Photos', 'Reports', 'Receipts 2026', 'Staff Docs', 'store-front.jpg'].map((n) => `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11px;color:var(--text-2);text-align:center">${n.includes('.') ? '<span style="width:38px;height:44px;border-radius:4px;background:linear-gradient(135deg,#C9B48F,#8E7A57)"></span>' : folderGlyph(46)}<span>${n}</span></div>`).join('')}
    </div>
  </main>
</div>`;
const explorer = (x, y) => `
<div class="t win" style="left:${x}px;top:${y}px;width:440px;height:290px;border-radius:8px;flex-direction:column">
  <div style="height:36px;display:flex;align-items:center;gap:10px;padding:0 12px;border-bottom:1px solid var(--border);font-size:12px"><span style="display:inline-flex;gap:4px">${folderGlyph(16)}</span><span style="font-weight:500">Soteria (Z:)</span><span style="flex:1"></span><span class="mono" style="color:var(--text-3);font-size:12px">— &nbsp; ▢ &nbsp; ✕</span></div>
  <div style="height:34px;display:flex;align-items:center;gap:8px;padding:0 12px;border-bottom:1px solid var(--border);font-size:12px;color:var(--text-2)"><span>‹</span><span>›</span><span>↑</span><span class="search" style="flex:1;height:24px;width:auto;color:var(--text-2);background:var(--surface)">This PC &nbsp;›&nbsp; Soteria (Z:)</span></div>
  <div style="flex:1;display:flex">
    <aside style="width:140px;border-right:1px solid var(--border);padding:10px 8px;display:flex;flex-direction:column;gap:2px;font-size:12px">
      <div class="cap" style="padding:4px 8px 4px">This PC</div>
      <div class="row" style="height:24px">${folderGlyph(13)}Local Disk (C:)</div>
      <div class="row on" style="height:24px;background:var(--accent-soft);border-color:transparent;color:var(--accent-text)">${mark(13)}Soteria (Z:)</div>
      <div class="cap" style="padding:10px 8px 4px">Quick access</div>
      ${['Desktop', 'Documents', 'Downloads'].map((n) => `<div class="row" style="height:24px">${folderGlyph(13)}${n}</div>`).join('')}
    </aside>
    <div style="flex:1;padding:12px 14px;display:flex;flex-direction:column;gap:6px;font-size:12px">
      ${['Backups', 'Product Photos', 'Reports', 'Receipts 2026', 'Staff Docs'].map((n) => `<div style="display:flex;align-items:center;gap:8px;color:var(--text)">${folderGlyph(16)}<span>${n}</span><span style="flex:1"></span><span class="mono" style="color:var(--text-3);font-size:11px">File folder</span></div>`).join('')}
    </div>
  </div>
</div>`;
const drive = scene(900, 560, '52% 0, 100% 0, 100% 100%, 48% 100%', (layer) => layer === 'bo'
	? `<div style="position:absolute;left:330px;top:330px">${bo('idle', 230)}</div><div class="eyebrow" style="left:48px;top:44px;color:#6E6A62">Finder · macOS</div><div class="eyebrow" style="right:48px;top:44px;color:#A19D94">File Explorer · Windows</div>`
	: finder(40, 76) + explorer(430, 140));

// ---------------------------------------------------------------- transfers: upload panel split down the middle, Bo with full pouches
const uploadPanel = (x, y) => `
<div class="t panel" style="left:${x}px;top:${y}px;width:420px">
  <div style="padding:14px 16px 12px;display:flex;flex-direction:column;gap:8px">
    <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:600;font-size:13px">Uploading 3 of 12 items</span><span class="mono" style="color:var(--text-3);font-size:12px">42% · 1 min left</span></div>
    <div class="bar"><i style="width:42%"></i></div>
  </div>
  ${[['IMG_2041.jpg', '3.1 MB of 4.2 MB · 6.8 MB/s', 74], ['IMG_2042.jpg', '1.2 MB of 3.9 MB · 5.9 MB/s', 31], ['promo-loop-v2.mp4', '412 MB · Waiting', 0], ['counter-display.jpg', '2.9 MB · Done 17:41', 100]].map(([n, s, p]) => `
  <div class="prow"><span style="width:28px;height:28px;border-radius:6px;background:var(--surface-2);display:inline-flex;align-items:center;justify-content:center;color:var(--text-2)">${ICON.image}</span><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:5px"><div style="display:flex;justify-content:space-between;font-size:12px"><span style="font-weight:500">${n}</span><span class="mono" style="color:${p === 100 ? 'var(--ok)' : 'var(--text-3)'}">${p === 100 ? ICON.check : p ? p + '%' : ''}</span></div><span style="font-size:11px;color:var(--text-3)">${s}</span>${p && p < 100 ? `<div class="bar" style="height:4px"><i style="width:${p}%"></i></div>` : ''}</div></div>`).join('')}
</div>`;
const transfers = scene(900, 560, '50% 0, 100% 0, 100% 100%, 50% 100%', (layer) => layer === 'bo'
	? `<div style="position:absolute;left:560px;top:270px">${bo('full', 280)}</div><div class="eyebrow" style="left:48px;top:44px;color:#6E6A62">Transfers</div>`
	: uploadPanel(120, 100));

// ---------------------------------------------------------------- trash: undo toast + trash list, Bo with empty pouches
const trashWin = (x, y) => `
<div class="t win" style="left:${x}px;top:${y}px;width:560px;height:250px;flex-direction:column;border-radius:10px">
  <div class="hdr" style="height:44px"><span style="font-weight:600;font-size:14px">Trash</span><span style="font-size:12px;color:var(--text-3)">Items are deleted for good after 30 days</span><span style="flex:1"></span><span class="btn" style="height:26px">Empty Trash</span></div>
  ${[['store-front.jpg', '/Product Photos', 'Today · 17:12'], ['sales-report-jul.xlsx', '/Reports', 'Yesterday · 09:40'], ['banner-old.png', '/Product Photos/2026-08', 'Aug 30 · 14:12'], ['Invoices 2024', '/Reports/Archive', 'Aug 19 · 10:22']].map(([n, p, d], i) => `
  <div style="display:flex;align-items:center;gap:12px;padding:0 18px;height:40px;border-bottom:1px solid var(--border);font-size:12px">${i === 3 ? folderGlyph(16) : `<span style="color:var(--text-2)">${ICON.image}</span>`}<span style="font-weight:500;width:160px">${n}</span><span class="mono" style="color:var(--text-3);flex:1">${p}</span><span style="color:var(--text-3)">${d}</span><span class="btn" style="height:24px;padding:0 9px">Restore</span></div>`).join('')}
</div>`;
const toast = (x, y) => `<div class="t" style="position:absolute;left:${x}px;top:${y}px;display:flex;align-items:center;gap:12px;padding:10px 12px 10px 14px;border-radius:10px;background:var(--surface);border:1px solid var(--border);box-shadow:var(--shadow);font-size:12px"><span style="color:var(--text-2)">${ICON.trash}</span><span>Moved “store-front.jpg” to Trash</span><span style="font-weight:600;color:var(--accent-text);padding-left:6px">Undo</span></div>`;
const trash = scene(900, 560, '46% 0, 100% 0, 100% 100%, 54% 100%', (layer) => layer === 'bo'
	? `<div style="position:absolute;left:40px;top:290px">${bo('empty', 260)}</div><div class="eyebrow" style="left:48px;top:44px;color:#6E6A62">Trash &amp; undo</div>`
	: trashWin(300, 140) + toast(560, 430));

// ---------------------------------------------------------------- background: menu bar item (light) and tray flyout (dark), Bo dozing
const menu = (x, y, win) => `
<div class="t menu" style="left:${x}px;top:${y}px">
  <div class="dis" style="font-weight:600;color:var(--text)">kietle · 192.168.1.194</div>
  <div class="sep"></div><div class="hl">Open Soteria</div><div class="sep"></div>
  <div class="dis">3 transfers running</div><div>Open Transfers</div><div class="sep"></div>
  <div>Show in ${win ? 'File Explorer' : 'Finder'}</div><div>Disconnect Drive</div><div class="sep"></div>
  <div>${win ? 'Exit' : 'Quit Soteria'}<span class="mono" style="color:var(--text-3);font-size:12px">${win ? '' : '⌘Q'}</span></div>
</div>`;
const macBar = () => `<div style="position:absolute;left:0;top:0;width:450px;height:26px;background:rgba(255,255,255,0.55);backdrop-filter:blur(20px);border-bottom:1px solid rgba(27,26,23,0.08);display:flex;align-items:center;gap:16px;padding:0 16px;font-size:13px;color:#1B1A17;font-family:-apple-system,'SF Pro Text',sans-serif"><span style="font-weight:600"></span><span style="font-weight:600">Finder</span><span>File</span><span>Edit</span><span>View</span><span style="flex:1"></span><span style="height:22px;padding:0 6px;border-radius:5px;background:rgba(27,26,23,0.12);display:inline-flex;align-items:center">${mark(16)}</span><span>17:42</span></div>`;
const taskbar = () => `<div style="position:absolute;left:0;bottom:0;width:900px;height:44px;background:rgba(28,28,30,0.9);border-top:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:flex-start;padding-left:560px;gap:6px"><span style="width:16px;height:16px;display:grid;grid-template-columns:1fr 1fr;gap:2px">${'<span style="background:#5BA7F0;border-radius:1px"></span>'.repeat(4)}</span><span style="position:relative;width:36px;height:36px;border-radius:5px;background:rgba(255,255,255,0.1);display:inline-flex;align-items:center;justify-content:center">${mark(20)}<span style="position:absolute;right:2px;bottom:2px;min-width:15px;height:15px;padding:0 4px;border-radius:8px;background:#E5484D;color:#fff;font-size:10px;font-weight:600;display:inline-flex;align-items:center;justify-content:center">3</span></span><span style="position:absolute;right:16px;color:#E8E8E8;font-size:11px" class="mono">17:42</span><span style="position:absolute;right:70px;width:26px;height:26px;border-radius:4px;background:rgba(255,255,255,0.12);display:inline-flex;align-items:center;justify-content:center">${mark(15)}</span></div>`;
const background = scene(900, 560, '50% 0, 100% 0, 100% 100%, 50% 100%', (layer) => layer === 'bo'
	? `<div style="position:absolute;left:320px;top:250px">${bo('offline', 260)}</div><div class="eyebrow" style="left:48px;top:48px;color:#6E6A62">Runs in the background</div>`
	: (layer === 'light' ? macBar() : taskbar()) + menu(60, 104, false) + menu(590, 250, true));

for (const [name, html] of Object.entries({ hero, drive, transfers, trash, background })) writeFileSync(join(HERE, 'out', `${name}.html`), html);
console.log('wrote 5 scenes to design/readme/out');
