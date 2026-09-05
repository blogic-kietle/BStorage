// Generates Bo, the Soteria mascot: pose SVGs, the mark, the app icon,
// the lockups and the identity sheet (sheet.html).
// Run: node design/mascot/build.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = dirname(fileURLToPath(import.meta.url));
const w = (name, s) => writeFileSync(join(OUT, name), s);

// ---------------------------------------------------------------------------
// Character palette — constant in both themes. The app themes around Bo.
// ---------------------------------------------------------------------------
const C = {
	fur: '#C9B48F',
	fur2: '#B39C74',
	fur3: '#8E7A57',
	cream: '#F1E8D8',
	ink: '#1B1A17',
	paper: '#F6F5F1',
	blue: '#2E64C8', // only used for the spec annotations on the sheet
	folderA: '#DCE7F8', // --folder-a: the panel behind
	folderB: '#C6D8F4', // --folder-b: the front pocket
	folderLine: '#3F6BB8' // --folder-line: rules and dashes on blue
};

const S = 3; // silhouette stroke on the 240 grid
const S2 = 2.4; // interior stroke
const line = (sw = S) =>
	`fill="none" stroke="${C.ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
const solid = (fill, sw = S) =>
	`fill="${fill}" stroke="${C.ink}" stroke-width="${sw}" stroke-linejoin="round"`;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
const fileCard = (x, y, cw, ch, rot = 0, tone = C.folderB) => {
	const cx = x + cw / 2;
	const cy = y + ch / 2;
	const g = rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : '';
	const l = (n) => y + ch * n;
	return `<g${g}><rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="5" fill="${tone}" stroke="${C.ink}" stroke-width="${S2}"/><path d="M${x + 8} ${l(0.3)}h${cw - 16}M${x + 8} ${l(0.5)}h${cw - 16}M${x + 8} ${l(0.7)}h${cw - 26}" fill="none" stroke="${C.folderLine}" stroke-width="2.2" stroke-linecap="round"/></g>`;
};

const dashedFolder = () =>
	`<path d="M94 188a6 6 0 0 1 6-6h16l7 8h37a6 6 0 0 1 6 6v28a6 6 0 0 1-6 6h-60a6 6 0 0 1-6-6z" fill="none" stroke="${C.folderLine}" stroke-width="${S2}" stroke-linejoin="round" stroke-dasharray="6 7"/>`;

const zzz = () =>
	`<g fill="none" stroke="${C.folderLine}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M192 46h13l-13 15h13"/>
    <path d="M208 26h10l-10 11h10" opacity=".7"/>
    <path d="M221 10h7l-7 8h7" opacity=".45"/>
  </g>`;

// ---------------------------------------------------------------------------
// Bo — one character, five states. 240 x 240 grid, 20 px units.
// The head and the cheek pouches are ONE outline: the pouches inflate the
// silhouette rather than sitting beside it. `cw` is the half-width at cheek
// level — the only number that changes between states.
// ---------------------------------------------------------------------------
const headPath = (cw) =>
	[
		'M120 48',
		'C154 48 178 64 184 90',
		`C188 104 ${120 + cw} 106 ${120 + cw} 130`,
		`C${120 + cw} 154 158 178 120 178`,
		`C82 178 ${120 - cw} 154 ${120 - cw} 130`,
		`C${120 - cw} 106 52 104 56 90`,
		'C62 64 86 48 120 48Z'
	].join('');

// A file seen through a stuffed pouch.
const cheekCard = (cw, side) => {
	const cardW = Math.round(cw * 0.3);
	const cardH = Math.round(cardW * 1.3);
	const cx = side < 0 ? 120 - cw + cardW + 4 : 120 + cw - cardW - 4;
	return `<g transform="rotate(${side * 10} ${cx} 130)"><rect x="${cx - cardW / 2}" y="${130 - cardH / 2}" width="${cardW}" height="${cardH}" rx="3" fill="${C.folderB}" stroke="${C.ink}" stroke-width="2.2"/><path d="M${cx - cardW / 2 + 5} ${130 - cardH / 4}h${cardW - 10}M${cx - cardW / 2 + 5} ${130 + cardH / 8}h${cardW - 10}" fill="none" stroke="${C.folderLine}" stroke-width="1.8" stroke-linecap="round"/></g>`;
};

// One stroke, corners lower than the middle: sulking, not smiling.
const mouth = (cx, y, w = 20, d = 7, sw = 2.4) =>
	`<path d="M${cx - w / 2} ${y}Q${cx} ${y - d} ${cx + w / 2} ${y}" fill="none" stroke="${C.ink}" stroke-width="${sw}" stroke-linecap="round"/>`;

const claws = (cx, cy, r) =>
	`<path d="M${cx - r * 0.42} ${cy + r * 0.34}v${r * 0.42}M${cx} ${cy + r * 0.46}v${r * 0.42}M${cx + r * 0.42} ${cy + r * 0.34}v${r * 0.42}" fill="none" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"/>`;

function bo({ cw = 68, eyes = 'open', paws = [78, 162], cards = false, prop = '', extra = '' }) {
	const [lp, rp] = paws;
	const eye = (x) =>
		eyes === 'shut'
			? `<path d="M${x - 9} 102q9 8 18 0" ${line(3)}/>`
			: `<ellipse cx="${x}" cy="102" rx="7.5" ry="9.5" fill="${C.ink}"/><circle cx="${x + 3}" cy="98" r="3" fill="#FFFFFF"/>`;

	return `
  <!-- hind feet -->
  <ellipse cx="98" cy="229" rx="19" ry="9.5" ${solid(C.fur3)}/>
  <ellipse cx="142" cy="229" rx="19" ry="9.5" ${solid(C.fur3)}/>
  <!-- body -->
  <path d="M120 150c-38 0-56 28-56 48 0 16 25 26 56 26s56-10 56-26c0-20-18-48-56-48z" ${solid(C.fur2)}/>
  <ellipse cx="120" cy="202" rx="38" ry="22" fill="${C.cream}"/>
  <!-- ears: small, set on the side of the skull -->
  <circle cx="62" cy="76" r="15" ${solid(C.fur3)}/>
  <circle cx="62" cy="76" r="6.5" fill="${C.fur}"/>
  <circle cx="178" cy="76" r="15" ${solid(C.fur3)}/>
  <circle cx="178" cy="76" r="6.5" fill="${C.fur}"/>
  <!-- head + pouches, one outline -->
  <path d="${headPath(cw)}" ${solid(C.fur)}/>
  ${cards ? cheekCard(cw, -1) + cheekCard(cw, 1) : ''}
  <ellipse cx="120" cy="136" rx="30" ry="19" fill="${C.cream}" stroke="${C.ink}" stroke-width="${S2}"/>
  ${eye(100)}
  ${eye(140)}
  <path d="M120 124c7.2 0 11 3.4 11 7.4 0 4.4-5 8-11 8s-11-3.6-11-8c0-4 3.8-7.4 11-7.4z" fill="${C.ink}"/>
  <path d="M120 137v7" ${line(2.4)}/>
  ${mouth(120, 151, 20, 7)}
  ${prop}
  <!-- forepaws + digging claws -->
  <circle cx="${lp}" cy="200" r="15" ${solid(C.fur3)}/>
  ${claws(lp, 200, 15)}
  <circle cx="${rp}" cy="200" r="15" ${solid(C.fur3)}/>
  ${claws(rp, 200, 15)}
  ${extra}`;
}

const POSES = {
	idle: bo({ cw: 68 }),
	carry: bo({
		cw: 82,
		cards: true,
		paws: [92, 148],
		prop: fileCard(94, 186, 52, 40)
	}),
	full: bo({ cw: 98, cards: true, paws: [74, 166] }),
	empty: bo({ cw: 58, paws: [88, 152], prop: dashedFolder() }),
	offline: bo({ cw: 60, eyes: 'shut', extra: zzz() })
};

// ---------------------------------------------------------------------------
// The mark — the app's folder glyph, given ears and a face.
// ---------------------------------------------------------------------------
// The app's own left-tab folder. The front pocket carries the face; the ears
// peek over its top edge, which runs straight across, so they stay symmetric
// even though the tab does not.
const FOLDER_BACK =
	'M30 66a14 14 0 0 1 14-14h38l14 18h100a14 14 0 0 1 14 14v114a14 14 0 0 1-14 14H44a14 14 0 0 1-14-14z';
const FOLDER_FRONT = 'M30 104h180v94a14 14 0 0 1-14 14H44a14 14 0 0 1-14-14z';

const MARK = `
  <path d="${FOLDER_BACK}" ${solid(C.folderA)}/>
  <circle cx="72" cy="102" r="21" ${solid(C.fur3)}/>
  <circle cx="72" cy="102" r="9" fill="${C.fur}"/>
  <circle cx="168" cy="102" r="21" ${solid(C.fur3)}/>
  <circle cx="168" cy="102" r="9" fill="${C.fur}"/>
  <path d="${FOLDER_FRONT}" ${solid(C.folderB)}/>
  <ellipse cx="120" cy="180" rx="28" ry="17" fill="${C.cream}" stroke="${C.ink}" stroke-width="${S2}"/>
  <ellipse cx="88" cy="146" rx="10" ry="12" fill="${C.ink}"/>
  <circle cx="91.6" cy="141.4" r="3.6" fill="#FFFFFF"/>
  <ellipse cx="152" cy="146" rx="10" ry="12" fill="${C.ink}"/>
  <circle cx="155.6" cy="141.4" r="3.6" fill="#FFFFFF"/>
  <path d="M120 165c6.6 0 10 3.2 10 7 0 4.2-4.6 7.4-10 7.4s-10-3.2-10-7.4c0-3.8 3.4-7 10-7z" fill="${C.ink}"/>
  ${mouth(120, 190, 22, 7, 2.6)}`;

// The ≤24 px cut: no highlights, no muzzle, heavier eyes.
const MARK_MICRO = `
  <path d="${FOLDER_BACK}" fill="${C.folderA}"/>
  <circle cx="72" cy="100" r="22" fill="${C.fur3}"/>
  <circle cx="168" cy="100" r="22" fill="${C.fur3}"/>
  <path d="${FOLDER_FRONT}" fill="${C.folderB}"/>
  <circle cx="88" cy="148" r="13" fill="${C.ink}"/>
  <circle cx="152" cy="148" r="13" fill="${C.ink}"/>
`;

// ---------------------------------------------------------------------------
// Docs
// ---------------------------------------------------------------------------
const svg = (vb, inner, size = null) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${size ? ` width="${size[0]}" height="${size[1]}"` : ''}>${inner}\n</svg>\n`;

const iconArt = (mark) => `
  <rect width="1024" height="1024" rx="228" fill="${C.paper}"/>
  <g transform="translate(56 -9) scale(3.8)">${mark}</g>`;

const ICON = iconArt(MARK);
const ICON_MICRO = iconArt(MARK_MICRO);

const LOCKUP = `
  <g transform="translate(0 4) scale(0.3)">${MARK}</g>
  <text x="92" y="55" font-family="Geist, -apple-system, 'Helvetica Neue', sans-serif" font-size="46" font-weight="600" letter-spacing="-1.8" fill="${C.ink}">Soteria</text>`;

const LOCKUP_STACK = `
  <g transform="translate(58 0) scale(0.42)">${MARK}</g>
  <text x="100" y="146" text-anchor="middle" font-family="Geist, -apple-system, 'Helvetica Neue', sans-serif" font-size="34" font-weight="600" letter-spacing="-1.3" fill="${C.ink}">Soteria</text>`;

for (const [name, inner] of Object.entries(POSES)) w(`bo-${name}.svg`, svg('0 0 240 240', inner));
w('mark.svg', svg('0 0 240 240', MARK));
w('mark-micro.svg', svg('0 0 240 240', MARK_MICRO));
w('icon-1024.svg', svg('0 0 1024 1024', ICON, [1024, 1024]));
w('icon-micro.svg', svg('0 0 1024 1024', ICON_MICRO, [1024, 1024])); // 16 / 32 px rungs
// Icon Composer layer: the mark alone, cropped square to its own bounds.
// Icon Composer supplies the ground, the mask and the shadow.
w('icon-layer.svg', svg('20 32 200 200', MARK));
w('lockup.svg', svg('0 0 300 76', LOCKUP));
w('lockup-stacked.svg', svg('0 0 200 160', LOCKUP_STACK));

// ---------------------------------------------------------------------------
// Identity sheet
// ---------------------------------------------------------------------------
const plate = (inner, vb = '0 0 240 240', max = 240) =>
	`<div class="canvas"><svg viewBox="${vb}" style="max-width:${max}px" aria-hidden="true">${inner}</svg></div>`;

const GRID = `
  <g stroke="${C.blue}" stroke-width=".5" opacity=".35">
    ${Array.from({ length: 11 }, (_, i) => `<path d="M${(i + 1) * 20} 0v240M0 ${(i + 1) * 20}h240"/>`).join('')}
  </g>`;

const CONSTRUCTION = `
  ${GRID}
  ${POSES.idle}
  <g stroke="${C.blue}" stroke-width="1.4" fill="none">
    <path d="M52 34h136M52 30v8M188 30v8"/>
    <path d="M34 48v190M30 48h8M30 238h8"/>
    <path d="M190 130h34"/>
  </g>
  <g font-family="'Geist Mono', monospace" font-size="9.5" fill="${C.blue}">
    <text x="120" y="26" text-anchor="middle">6.8u across the cheeks</text>
    <text x="24" y="143" text-anchor="middle" transform="rotate(-90 24 143)">9.5u tall</text>
    <text x="226" y="126" text-anchor="end">pouch</text>
  </g>`;

const sizeChip = (px, inner, radius) =>
	`<span class="chip" style="width:${px}px;height:${px}px;border-radius:${radius}px"><svg viewBox="0 0 240 240" width="${px - 2}" height="${px - 2}">${inner}</svg></span>`;

const STATES = [
	['idle', 'Idle', 'Files, connected', 'Pouches at rest. The default Bo.'],
	['carry', 'Carrying', 'Upload / download running', 'Pouches loaded, one more in his arms.'],
	['full', 'Stuffed', 'Queue backed up', 'Four in the cheeks. Comic, not alarming.'],
	['empty', 'Empty-handed', 'Empty folder', 'Deflated pouches, a folder with nothing in it.'],
	['offline', 'Asleep', 'Offline / reconnecting', 'Eyes shut until Ping() comes back.']
];

const EXPORTS = [
	['bo-idle.svg', '240×240', 'Sign-in, About, sidebar footer'],
	['bo-carry.svg', '240×240', 'Transfers panel while a job runs'],
	['bo-full.svg', '240×240', 'Transfers panel, 4+ queued'],
	['bo-empty.svg', '240×240', 'Empty folder, empty Trash, no search results'],
	['bo-offline.svg', '240×240', 'Offline banner, failed connect'],
	['mark.svg', '240×240', 'Titlebar, About, README'],
	['mark-micro.svg', '240×240', '≤24 px — favicon, tab bar, Finder sidebar'],
	['icon-1024.svg', '1024×1024', 'build/appicon.png → icons.icns, icon.ico'],
	['icon-micro.svg', '1024×1024', 'the 16 and 32 px rungs of icons.icns'],
	['icon-layer.svg', '200×200', 'build/appicon.icon/Assets — Icon Composer layer'],
	['lockup.svg', '300×76', 'Sign-in header, docs, GitHub social preview'],
	['lockup-stacked.svg', '200×160', 'Splash, DMG background']
];

const SHEET = `<title>Bo, the Soteria Gopher</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap">
<style>
  :root{
    --paper:#F6F5F1;--surface:#FFFFFF;--surface-2:#EFEEE9;--border:#E6E4DE;--border-2:#D8D5CD;
    --ink:#1B1A17;--ink-2:#6E6A62;--ink-3:#9B978E;--accent:#2E64C8;--accent-soft:#E4ECFA;--accent-text:#1F4F9E;--rule:#E6E4DE;
  }
  @media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
    --paper:#151412;--surface:#1C1B18;--surface-2:#252420;--border:#2C2B26;--border-2:#3A3832;
    --ink:#ECEAE4;--ink-2:#A19D94;--ink-3:#726F67;--accent:#6F9BE8;--accent-soft:#1F2E4A;--accent-text:#A9C4F2;--rule:#2C2B26;
  }}
  :root[data-theme="dark"]{
    --paper:#151412;--surface:#1C1B18;--surface-2:#252420;--border:#2C2B26;--border-2:#3A3832;
    --ink:#ECEAE4;--ink-2:#A19D94;--ink-3:#726F67;--accent:#6F9BE8;--accent-soft:#1F2E4A;--accent-text:#A9C4F2;--rule:#2C2B26;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--paper);color:var(--ink);font-family:'Geist',-apple-system,'SF Pro Text','Helvetica Neue',sans-serif;font-size:14px;line-height:1.55;-webkit-font-smoothing:antialiased}
  .mono{font-family:'Geist Mono','SF Mono',Menlo,monospace;font-variant-numeric:tabular-nums}
  .wrap{max-width:1060px;margin:0 auto;padding:56px 28px 96px}
  svg{display:block}

  .eyebrow{font-family:'Geist Mono','SF Mono',Menlo,monospace;font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-3)}
  h1{margin:0;font-size:clamp(40px,6vw,68px);font-weight:600;letter-spacing:-.035em;line-height:.98;text-wrap:balance}
  .lede{margin:0;max-width:56ch;color:var(--ink-2);font-size:15px}
  .lede b{color:var(--ink);font-weight:500}

  .hero{display:grid;grid-template-columns:300px 1fr;gap:36px;align-items:center;margin-top:8px}
  @media(max-width:760px){.hero{grid-template-columns:1fr}}
  .hero .canvas{padding:22px}
  .hero-copy{display:flex;flex-direction:column;gap:16px}

  .canvas{background:#ECEAE3;border:1px solid #DCD8CE;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:16px}
  .canvas svg{width:100%;height:auto}

  .sec{margin-top:64px}
  .sec-head{display:flex;align-items:baseline;gap:14px;margin-bottom:6px}
  .sec-head h2{margin:0;font-size:19px;font-weight:600;letter-spacing:-.015em}
  .sec-head .n{font-family:'Geist Mono','SF Mono',Menlo,monospace;font-size:11px;color:var(--ink-3)}
  .sec-note{margin:0 0 24px;color:var(--ink-2);max-width:68ch;font-size:13.5px}
  .sec-note b{color:var(--ink);font-weight:500}

  .states{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
  @media(max-width:900px){.states{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:480px){.states{grid-template-columns:1fr}}
  .state{display:flex;flex-direction:column;gap:10px}
  .state .canvas{padding:8px}
  .state h3{margin:0;font-size:14px;font-weight:600;letter-spacing:-.01em}
  .state .when{font-family:'Geist Mono','SF Mono',Menlo,monospace;font-size:10.5px;color:var(--accent-text);letter-spacing:.02em}
  .state p{margin:0;font-size:12.5px;color:var(--ink-2)}

  .two{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
  @media(max-width:760px){.two{grid-template-columns:1fr}}
  .card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:18px;display:flex;flex-direction:column;gap:14px}
  .card h3{margin:0;font-size:15px;font-weight:600;letter-spacing:-.01em}
  .card p{margin:0;font-size:13px;color:var(--ink-2)}

  .ladder{display:flex;align-items:flex-end;gap:20px;flex-wrap:wrap}
  .rung{display:flex;flex-direction:column;align-items:center;gap:8px}
  .rung .mono{font-size:10.5px;color:var(--ink-3)}
  .chip{background:#ECEAE3;border:1px solid #DCD8CE;display:grid;place-items:center;overflow:hidden}

  .dockrow{display:flex;align-items:center;gap:18px;padding:14px 18px;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;width:fit-content}

  .lockups{display:flex;gap:32px;align-items:center;flex-wrap:wrap}
  .lockups .canvas{padding:22px 26px}

  .pal{display:flex;flex-wrap:wrap;gap:10px}
  .sw{display:flex;flex-direction:column;gap:7px;width:100px}
  .sw .chipc{height:52px;border-radius:8px;border:1px solid var(--border-2)}
  .sw .lbl{font-family:'Geist Mono','SF Mono',Menlo,monospace;font-size:10.5px;color:var(--ink-2)}
  .sw .hex{font-family:'Geist Mono','SF Mono',Menlo,monospace;font-size:10.5px;color:var(--ink-3)}

  .rules{list-style:none;margin:0;padding:0;display:grid;gap:9px}
  .rules li{display:grid;grid-template-columns:16px 1fr;gap:10px;font-size:13px;color:var(--ink-2)}
  .rules .y{color:#3B7A45;font-weight:600}
  .rules .n2{color:#B3362F;font-weight:600}

  table{border-collapse:collapse;width:100%;min-width:520px}
  .tbl{border:1px solid var(--border);border-radius:10px;background:var(--surface);overflow-x:auto}
  th,td{text-align:left;padding:11px 16px;border-bottom:1px solid var(--rule);font-size:13px}
  tr:last-child td{border-bottom:0}
  th{font-family:'Geist Mono','SF Mono',Menlo,monospace;font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3);font-weight:400}
  td.f{font-family:'Geist Mono','SF Mono',Menlo,monospace;font-size:12px;color:var(--accent-text);white-space:nowrap}
  td.d{font-family:'Geist Mono','SF Mono',Menlo,monospace;font-size:11.5px;color:var(--ink-3);white-space:nowrap}
  td.u{color:var(--ink-2)}
  footer{margin-top:56px;padding-top:18px;border-top:1px solid var(--rule);color:var(--ink-3);font-size:11.5px}
</style>

<div class="wrap">
  <div class="eyebrow">Soteria · identity · round two — final</div>
  <div class="hero">
    ${plate(POSES.idle)}
    <div class="hero-copy">
      <h1>Bo</h1>
      <p class="lede">A gopher who keeps things in his cheeks. He is the face of <b>Soteria</b> — a Go desktop client that talks WebDAV to a server you run yourself — and he does two jobs: at 200 px he is a character, at 16 px he is a folder with ears.</p>
      <p class="lede">The name is the <b>b</b> in Soteria. It is also, in Vietnamese, <b>ôm bo bo</b> — to hold onto something and refuse to let go. That is the whole product in two syllables.</p>
    </div>
  </div>

  <section class="sec">
    <div class="sec-head"><span class="n">01</span><h2>Construction</h2></div>
    <p class="sec-note">Built on a <b>12 × 12 grid of 20 px units</b>. The head and the pouches are <b>one outline</b>, not a head with two circles stuck to it — the pouches inflate the silhouette, and that changing silhouette is the whole recognition cue. Everything is one weight: <b>3 units at 240</b>, dropping to 2.4 for interior lines, so he sits beside the app's 1.6-stroke icon set without shouting.</p>
    <div class="two">
      ${plate(CONSTRUCTION)}
      <div class="card">
        <h3>Rules of the drawing</h3>
        <ul class="rules">
          <li><span class="y">✓</span><span>Flat fills, one ink outline, no gradients and no shadow — same discipline as the UI.</span></li>
          <li><span class="y">✓</span><span>Almond eyes, never white ovals. Pupil only, with one highlight up and to the right.</span></li>
          <li><span class="y">✓</span><span>One stroke for the mouth, corners below the middle. Bo sulks; he never grins, and he has no teeth.</span></li>
          <li><span class="n2">✕</span><span>Ears stay small and sit on the side of the skull. Big round ears on top make him a bear.</span></li>
          <li><span class="n2">✕</span><span>No extra colours on the fur. If Bo needs to say something, the thing he holds says it.</span></li>
          <li><span class="n2">✕</span><span>Never rotate or shear him. He stands square; the props move.</span></li>
        </ul>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="sec-head"><span class="n">02</span><h2>Five states, five screens</h2></div>
    <p class="sec-note">The pouches are the transfer queue, so Bo is not decoration — he is a status indicator you can read across a room. Each pose is tied to a real state the app already emits.</p>
    <div class="states">
      ${STATES.map(
				([k, name, when, note]) => `<div class="state">
        ${plate(POSES[k])}
        <h3>${name}</h3>
        <div class="when">${when}</div>
        <p>${note}</p>
      </div>`
			).join('')}
    </div>
  </section>

  <section class="sec">
    <div class="sec-head"><span class="n">03</span><h2>The mark</h2></div>
    <p class="sec-note">The app's own left-tab folder with Bo behind it. The face sits on the <b>front pocket</b> and the ears peek over its top edge — that edge runs straight across, so the ears stay symmetric even though the tab does not. Nothing here is invented: it is the folder from the file list, at icon scale. Below 24 px it swaps to a reduced cut with the muzzle and the highlights removed and the eyes carrying the whole face.</p>
    <div class="two">
      ${plate(MARK)}
      <div class="card">
        <h3>Size ladder</h3>
        <p>Full cut down to 32 px, micro cut at 24 px and below.</p>
        <div class="ladder">
          <div class="rung">${sizeChip(96, MARK, 22)}<span class="mono">96</span></div>
          <div class="rung">${sizeChip(64, MARK, 15)}<span class="mono">64</span></div>
          <div class="rung">${sizeChip(32, MARK, 8)}<span class="mono">32</span></div>
          <div class="rung">${sizeChip(24, MARK_MICRO, 6)}<span class="mono">24 ▾</span></div>
          <div class="rung">${sizeChip(16, MARK_MICRO, 4)}<span class="mono">16 ▾</span></div>
        </div>
        <h3 style="margin-top:6px">In the Dock</h3>
        <div class="dockrow">
          <svg viewBox="0 0 1024 1024" width="72" height="72">${ICON}</svg>
          <svg viewBox="0 0 1024 1024" width="48" height="48">${ICON}</svg>
          <span class="mono" style="font-size:11px;color:var(--ink-3)">warm paper ground,<br>228 / 1024 corner</span>
        </div>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="sec-head"><span class="n">04</span><h2>Lockups</h2></div>
    <p class="sec-note">Geist 600 at −1.8 tracking, set in ink. Clear space on every side is <b>one ear</b> — the radius of the ear circle at whatever size the mark is drawn. The wordmark is always lowercase.</p>
    <div class="lockups">
      <div class="canvas" style="flex:1;min-width:280px"><svg viewBox="0 0 300 76" style="max-width:300px">${LOCKUP}</svg></div>
      <div class="canvas"><svg viewBox="0 0 200 160" style="max-width:160px">${LOCKUP_STACK}</svg></div>
    </div>
  </section>

  <section class="sec">
    <div class="sec-head"><span class="n">05</span><h2>Palette</h2></div>
    <p class="sec-note">Bo does not theme. Five constant colours for the animal himself, and everything he carries — file cards, the empty folder, the sleep marks — is drawn in the app's own <span class="mono">--folder-*</span> tokens rather than a colour of its own. In dark mode the app goes dark around him and he stays the same animal.</p>
    <div class="pal">
      <div class="sw"><div class="chipc" style="background:${C.fur}"></div><span class="lbl">fur</span><span class="hex">${C.fur}</span></div>
      <div class="sw"><div class="chipc" style="background:${C.fur2}"></div><span class="lbl">body</span><span class="hex">${C.fur2}</span></div>
      <div class="sw"><div class="chipc" style="background:${C.fur3}"></div><span class="lbl">ears · paws</span><span class="hex">${C.fur3}</span></div>
      <div class="sw"><div class="chipc" style="background:${C.cream}"></div><span class="lbl">belly · muzzle</span><span class="hex">${C.cream}</span></div>
      <div class="sw"><div class="chipc" style="background:${C.ink}"></div><span class="lbl">outline</span><span class="hex">${C.ink}</span></div>
      <div class="sw"><div class="chipc" style="background:${C.folderA}"></div><span class="lbl">folder back</span><span class="hex">${C.folderA}</span></div>
      <div class="sw"><div class="chipc" style="background:${C.folderB}"></div><span class="lbl">folder front</span><span class="hex">${C.folderB}</span></div>
      <div class="sw"><div class="chipc" style="background:${C.folderLine}"></div><span class="lbl">folder line</span><span class="hex">${C.folderLine}</span></div>
    </div>
  </section>

  <section class="sec">
    <div class="sec-head"><span class="n">06</span><h2>What ships</h2></div>
    <p class="sec-note">All ten files are plain SVG in <span class="mono">design/mascot/</span>, generated from one source — <span class="mono">build.mjs</span> — so the character has a single definition. Edit the script, re-run <span class="mono">node design/mascot/build.mjs</span>, and every pose, the mark and the icon change together.</p>
    <div class="tbl">
      <table>
        <tr><th>File</th><th>Size</th><th>Where it goes</th></tr>
        ${EXPORTS.map(([f, d, u]) => `<tr><td class="f">${f}</td><td class="d">${d}</td><td class="u">${u}</td></tr>`).join('')}
      </table>
    </div>
  </section>

  <footer class="mono">Soteria identity · round two · Bo — 5 poses, 2 mark cuts, 1 app icon, 2 lockups · generated by design/mascot/build.mjs</footer>
</div>
`;

w('sheet.html', SHEET);
console.log('wrote 10 assets + sheet.html to design/mascot/');
