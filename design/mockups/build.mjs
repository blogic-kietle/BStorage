// Generates the Soteria mockup artboards (.dc.html) + canvas.json.
// Run: node design/mockups/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------
const FONT =
	'<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&amp;family=Geist+Mono:wght@400;500&amp;display=swap">';

const CSS = `
* { box-sizing: border-box; }
body { margin: 0; background: #F6F5F1; }
.app {
  font-family: 'Geist', -apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  font-size: 13px; line-height: 1.45; -webkit-font-smoothing: antialiased;
  --bg: #F6F5F1; --surface: #FFFFFF; --surface-2: #EFEEE9;
  --border: #E6E4DE; --border-2: #D8D5CD;
  --text: #1B1A17; --text-2: #6E6A62; --text-3: #9B978E;
  --primary: #171614; --on-primary: #FFFFFF;
  --accent: #2E64C8; --accent-soft: #E4ECFA; --accent-text: #1F4F9E;
  --ok: #3B7A45; --ok-soft: #E6F1E7;
  --warn: #956400; --warn-soft: #FBF3DB;
  --danger: #B3362F; --danger-soft: #FBE9E7; --on-danger: #FFFFFF;
  --folder-a: #DCE7F8; --folder-b: #C6D8F4; --folder-line: #3F6BB8;
  --seg-1: #9DB9EA; --seg-2: #9FCBA6; --seg-3: #E8CD82; --seg-4: #C9C6BE;
  --shadow: 0 8px 24px rgba(27, 26, 23, 0.08);
}
.app[data-theme="dark"] {
  --bg: #151412; --surface: #1C1B18; --surface-2: #252420;
  --border: #2C2B26; --border-2: #3A3832;
  --text: #ECEAE4; --text-2: #A19D94; --text-3: #726F67;
  --primary: #ECEAE4; --on-primary: #151412;
  --accent: #6F9BE8; --accent-soft: #1F2E4A; --accent-text: #A9C4F2;
  --ok: #7FC48A; --ok-soft: #1D3122;
  --warn: #E0B25A; --warn-soft: #382E16;
  --danger: #E27A72; --danger-soft: #3A201E; --on-danger: #1A0F0E;
  --folder-a: #25355A; --folder-b: #2F457A; --folder-line: #7FA3E6;
  --seg-1: #4F76BF; --seg-2: #4E8C5A; --seg-3: #A88A3A; --seg-4: #5A5850;
  --shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}
.mono { font-family: 'Geist Mono', 'SF Mono', Menlo, monospace; font-variant-numeric: tabular-nums; }
.ico { display: inline-flex; flex: none; }
.ico svg { display: block; }
.trunc { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
a { color: var(--accent-text); text-decoration: none; }
a:hover { text-decoration: underline; }
kbd { font-family: 'Geist Mono', 'SF Mono', Menlo, monospace; font-size: 11px; border: 1px solid var(--border); border-radius: 4px; padding: 1px 5px; background: var(--surface-2); color: var(--text-3); }
`;

// ---------------------------------------------------------------------------
// Icons (stroke 1.6, 24 grid)
// ---------------------------------------------------------------------------
const FOLDER_PATH =
	'M3 7.5A1.5 1.5 0 0 1 4.5 6h4.3l1.8 2h8.9A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z';
const FILE_PATH = '<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/>';

const P = {
	folder: `<path d="${FOLDER_PATH}"/>`,
	folderPlus: `<path d="${FOLDER_PATH}"/><path d="M12 11v5M9.5 13.5h5"/>`,
	folderMove: `<path d="${FOLDER_PATH}"/><path d="M9 13.5h6M13 11.5l2 2-2 2"/>`,
	file: FILE_PATH,
	doc: `${FILE_PATH}<path d="M9 13h6M9 16.5h6"/>`,
	image:
		'<rect x="4" y="5.5" width="16" height="13" rx="1.5"/><path d="M4 16l4.5-4.5 3.5 3.5 3-3 5 5"/><circle cx="15.5" cy="9.5" r="1.2" fill="currentColor" stroke="none"/>',
	video: '<rect x="3.5" y="6.5" width="12" height="11" rx="1.5"/><path d="M15.5 10.5l5-2.5v8l-5-2.5"/>',
	sheet: '<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M4 10h16M4 14.5h16M10 5v14"/>',
	archive:
		'<rect x="4" y="5" width="16" height="4" rx="1"/><path d="M5 9v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 12.5h4"/>',
	search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
	upload: '<path d="M12 16V5M7 10l5-5 5 5M4 19.5h16"/>',
	download: '<path d="M12 4v11M7 10l5 5 5-5M4 19.5h16"/>',
	plus: '<path d="M12 5v14M5 12h14"/>',
	grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
	list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none"/>',
	chevronRight: '<path d="M9 6l6 6-6 6"/>',
	chevronDown: '<path d="M6 9l6 6 6-6"/>',
	chevronLeft: '<path d="M15 6l-6 6 6 6"/>',
	arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
	arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
	dots: '<circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.3" fill="currentColor" stroke="none"/>',
	server:
		'<rect x="3.5" y="4.5" width="17" height="6" rx="1.5"/><rect x="3.5" y="13.5" width="17" height="6" rx="1.5"/><circle cx="7" cy="7.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="7" cy="16.5" r="0.9" fill="currentColor" stroke="none"/>',
	gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
	signOut: '<path d="M9.5 4H5.5a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 5.5 20h4M15.5 8l4.5 4-4.5 4M20 12H9.5"/>',
	check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
	x: '<path d="M6 6l12 12M18 6L6 18"/>',
	pause: '<path d="M8.5 5v14M15.5 5v14"/>',
	trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l.9 12h9.2l.9-12M10 11v5M14 11v5"/>',
	pencil: '<path d="M4 20l4.5-1L19 8.5 15.5 5 5 15.5 4 20z"/><path d="M13.5 7l3.5 3.5"/>',
	clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3.5 2"/>',
	transfers: '<path d="M8 20V5M4 9l4-4 4 4M16 4v15M12 15l4 4 4-4"/>',
	link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5"/>',
	info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
	eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
	copy: '<rect x="9" y="9" width="11" height="11" rx="1.5"/><path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"/>',
	shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
	open: '<path d="M14 4h6v6M20 4l-8 8"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
	refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/>'
};

const icon = (n, s = 16, style = '') =>
	`<span class="ico" style="width:${s}px;height:${s}px;${style}"><svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${P[n]}</svg></span>`;

const folderGlyph = (s) =>
	`<span class="ico" style="width:${s}px;height:${s}px"><svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="var(--folder-line)" stroke-width="1.3" stroke-linejoin="round"><path d="${FOLDER_PATH}" fill="var(--folder-a)"/><path d="M3 11h18v6.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" fill="var(--folder-b)"/></svg></span>`;

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------
const btn = (label, { kind = 'secondary', ic = null, full = false, h = 32 } = {}) => {
	const base = `height:${h}px;padding:0 ${h > 32 ? 16 : 12}px;border-radius:6px;font:inherit;font-size:13px;font-weight:500;display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap;cursor:default;${full ? 'width:100%;' : ''}`;
	const look =
		kind === 'primary'
			? 'background:var(--primary);color:var(--on-primary);border:1px solid var(--primary);'
			: kind === 'danger'
				? 'background:var(--danger);color:var(--on-danger);border:1px solid var(--danger);'
				: kind === 'ghost'
					? 'background:transparent;color:var(--text-2);border:1px solid transparent;'
					: 'background:var(--surface);color:var(--text);border:1px solid var(--border-2);';
	return `<button type="button" style="${base}${look}">${ic ? icon(ic, 15) : ''}<span>${label}</span></button>`;
};

const iconBtn = (n, { size = 32, dim = false, active = false } = {}) =>
	`<button type="button" style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;padding:0;font:inherit;cursor:default;border:1px solid ${active ? 'var(--border)' : 'transparent'};background:${active ? 'var(--surface-2)' : 'transparent'};color:${dim ? 'var(--text-3)' : 'var(--text-2)'};${dim ? 'opacity:0.6;' : ''}">${icon(n, size > 28 ? 16 : 15)}</button>`;

const field = (label, value, { mono = false, helper = '', trailing = '', placeholder = false, focus = false } = {}) => `
<div style="display:flex;flex-direction:column;gap:6px">
  <label style="font-size:12px;font-weight:500;color:var(--text-2)">${label}</label>
  <div style="display:flex;align-items:center;gap:8px;height:36px;padding:0 12px;border-radius:6px;background:var(--surface);border:1px solid ${focus ? 'var(--accent)' : 'var(--border-2)'};${focus ? 'box-shadow:0 0 0 3px var(--accent-soft);' : ''}">
    <span class="trunc ${mono ? 'mono' : ''}" style="flex:1;font-size:13px;color:${placeholder ? 'var(--text-3)' : 'var(--text)'}">${value}</span>${trailing}
  </div>
  ${helper ? `<div style="font-size:12px;color:var(--text-3)">${helper}</div>` : ''}
</div>`;

const toggle = (on) =>
	`<span style="width:32px;height:18px;border-radius:9px;position:relative;display:inline-block;flex:none;background:${on ? 'var(--primary)' : 'var(--border-2)'}"><span style="position:absolute;top:2px;left:${on ? 16 : 2}px;width:14px;height:14px;border-radius:7px;background:${on ? 'var(--on-primary)' : 'var(--surface)'}"></span></span>`;

const checkbox = (on) =>
	on
		? `<span style="width:16px;height:16px;border-radius:4px;background:var(--primary);color:var(--on-primary);display:inline-flex;align-items:center;justify-content:center;flex:none">${icon('check', 11)}</span>`
		: `<span style="width:16px;height:16px;border-radius:4px;border:1px solid var(--border-2);background:var(--surface);display:inline-block;flex:none"></span>`;

const segBar = (h) => `
<div style="display:flex;height:${h}px;border-radius:${h / 2}px;overflow:hidden;background:var(--surface-2);gap:2px">
  <div style="width:10.7%;background:var(--seg-1)"></div>
  <div style="width:7.9%;background:var(--seg-2)"></div>
  <div style="width:3.2%;background:var(--seg-3)"></div>
  <div style="width:2.4%;background:var(--seg-4)"></div>
</div>`;

const trafficLights = () => `
<div style="display:flex;gap:8px;align-items:center">
  <span style="width:12px;height:12px;border-radius:6px;background:var(--border-2)"></span>
  <span style="width:12px;height:12px;border-radius:6px;background:var(--border-2)"></span>
  <span style="width:12px;height:12px;border-radius:6px;background:var(--border-2)"></span>
</div>`;

const sectionLabel = (label, count = '') => `
<div style="display:flex;align-items:center;gap:8px;font-weight:500;font-size:13px;height:20px">
  <span>${label}</span>${count !== '' ? `<span style="color:var(--text-3);font-weight:400">${count}</span>` : ''}
</div>`;

// ---------------------------------------------------------------------------
// Document wrapper
// ---------------------------------------------------------------------------
function doc(inner, { dark = false, root = 'display:flex;', w = 1280, h = 800 } = {}) {
	return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  ${FONT}
  <style>${CSS}</style>
</helmet>
<div class="app" data-theme="{{theme}}" style="width:${w}px;height:${h}px;overflow:hidden;background:var(--bg);color:var(--text);${root}">
${inner}
</div>
</x-dc>
<script data-dc-script data-props='{"dark":{"editor":"boolean","default":${dark},"section":"Theme"},"$preview":{"width":${w},"height":${h}}}'>
class Component extends DCLogic {
  renderVals() {
    var dark = this.props.dark;
    if (dark === undefined || dark === null) dark = ${dark};
    return { theme: dark ? 'dark' : 'light' };
  }
}
</script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// App shell: sidebar + header
// ---------------------------------------------------------------------------
const FOLDERS = ['Backups', 'Product Photos', 'Receipts 2026', 'Reports', 'Staff Docs'];


const accountRow = (open) => `
<div style="margin:0 12px 12px;display:flex;align-items:center;gap:10px;padding:6px 8px 6px 6px;border-radius:8px;background:${open ? 'var(--surface)' : 'transparent'};border:1px solid ${open ? 'var(--border)' : 'transparent'}">
  <span style="width:26px;height:26px;border-radius:13px;background:var(--accent-soft);color:var(--accent-text);display:inline-flex;align-items:center;justify-content:center;font-weight:600;font-size:12px">K</span>
  <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:1px">
    <span class="trunc" style="font-size:13px;font-weight:500">kietle</span>
    <span class="trunc" style="font-size:11px;color:var(--text-3)">Lab</span>
  </span>
  ${icon('chevronDown', 14, `color:var(--text-3);transform:rotate(${open ? 180 : 0}deg)`)}
</div>`;

const accountMenu = () => `
<div style="position:absolute;left:12px;bottom:64px;width:268px;background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:var(--shadow);padding:6px;z-index:5">
  <div style="display:flex;align-items:center;gap:10px;padding:8px 10px 10px">
    <span style="width:34px;height:34px;border-radius:17px;background:var(--accent-soft);color:var(--accent-text);display:inline-flex;align-items:center;justify-content:center;font-weight:600;font-size:14px">K</span>
    <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:1px">
      <span class="trunc" style="font-weight:600">kietle</span>
      <span class="trunc mono" style="font-size:11px;color:var(--text-3)">Lab · 192.168.1.194:8000</span>
    </span>
  </div>
  ${menuDivider()}
  ${menuItem('gear', 'Settings', '', { hover: true })}
  ${menuItem('server', 'Switch server…')}
  ${menuDivider()}
  ${menuItem('signOut', 'Sign out')}
</div>`;


const sidebarGlyph = (open, dot = false) => `
<span style="position:relative;display:inline-flex">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4.5" width="18" height="15" rx="3"/>
    <path d="M9.5 4.5v15"/>
    ${open ? '<rect x="3" y="4.5" width="6.5" height="15" rx="3" fill="currentColor" stroke="none" opacity="0.35"/>' : ''}
  </svg>
  ${dot ? '<span style="position:absolute;top:-2px;right:-3px;width:7px;height:7px;border-radius:4px;background:var(--accent);border:1.5px solid var(--bg)"></span>' : ''}
</span>`;

const sidebarToggle = (open, dot = false) =>
	`<button type="button" style="width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;border:0;background:transparent;color:var(--text-2);cursor:default;padding:0">${sidebarGlyph(open, dot)}</button>`;

function sidebar({ nav = null, folder = null, gear = false, account = false, menu = false, toggle = false, win = false, update = '' } = {}) {
	const item = (on, ic, label, h = 32) =>
		`<div style="display:flex;align-items:center;gap:10px;height:${h}px;padding:0 10px;border-radius:6px;font-weight:${on ? 500 : 400};color:${on ? 'var(--text)' : 'var(--text-2)'};background:${on ? 'var(--surface)' : 'transparent'};border:1px solid ${on ? 'var(--border)' : 'transparent'}">${ic}<span class="trunc" style="flex:1">${label}</span></div>`;

	return `
<aside style="width:240px;flex:none;display:flex;flex-direction:column;border-right:1px solid var(--border);background:var(--bg);position:relative">
  <div style="height:52px;flex:none;display:flex;align-items:center;justify-content:space-between;padding:0 12px 0 16px">${win ? lights() : trafficLights()}${toggle ? sidebarToggle(true) : ''}</div>
${account ? '' : `  <div style="padding:0 12px 12px">
    <button type="button" style="width:100%;display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;text-align:left;font:inherit;color:var(--text);cursor:default">
      <span style="width:28px;height:28px;border-radius:6px;background:var(--surface-2);color:var(--text-2);display:inline-flex;align-items:center;justify-content:center;flex:none">${icon('server', 15)}</span>
      <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:1px">
        <span class="trunc" style="font-size:13px;font-weight:500">Lab SFTPGo</span>
        <span class="trunc mono" style="font-size:11px;color:var(--text-3)">192.168.1.194:8081</span>
      </span>
      ${icon('chevronDown', 14, 'color:var(--text-3)')}
    </button>
  </div>`}
  <nav style="display:flex;flex-direction:column;gap:2px;padding:0 12px">
    ${item(nav === 'files', icon('folder', 16), 'Files')}
    ${item(nav === 'recent', icon('clock', 16), 'Recent')}
    ${item(nav === 'transfers', icon('transfers', 16), 'Transfers')}
    ${item(nav === 'trash', icon('trash', 16), 'Trash')}
  </nav>
  <div style="padding:20px 22px 6px;font-size:11px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-3)">Folders</div>
  <div style="display:flex;flex-direction:column;gap:1px;padding:0 12px">
    ${FOLDERS.map((f) => item(folder === f, folderGlyph(16), f, 30)).join('')}
  </div>
  <div style="flex:1"></div>${update ? updatePill(update) : ''}
  <div style="padding:12px 16px 8px;display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--border)">
    <div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:var(--text-2)">Storage</span><span class="mono" style="color:var(--text-3)">48.2 / 200 GB</span></div>
    ${segBar(6)}
  </div>
  ${account ? accountRow(menu) : `  <div style="display:flex;align-items:center;gap:10px;padding:6px 12px 14px 16px">
    <span style="width:26px;height:26px;border-radius:13px;background:var(--accent-soft);color:var(--accent-text);display:inline-flex;align-items:center;justify-content:center;font-weight:600;font-size:12px;flex:none">P</span>
    <span class="trunc" style="flex:1;font-size:13px;font-weight:500">pos</span>
    ${iconBtn('gear', { size: 28, active: gear })}
  </div>`}
  ${menu ? accountMenu() : ''}
</aside>`;
}

function header({ crumbs = null, title = null, right = '', lead = '' }) {
	let left = '';
	if (crumbs) {
		left = `
    <div style="display:flex;gap:2px">${iconBtn('arrowLeft')}${iconBtn('arrowRight', { dim: true })}</div>
    <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500">
      ${crumbs
				.map((c, i) => {
					const last = i === crumbs.length - 1;
					return `<span style="color:${last ? 'var(--text)' : 'var(--text-2)'}">${c}</span>${last ? '' : '<span style="color:var(--text-3)">/</span>'}`;
				})
				.join('')}
    </div>`;
	} else {
		left = `<div style="font-size:15px;font-weight:600;letter-spacing:-0.01em">${title}</div>`;
	}
	return `
<header style="height:52px;flex:none;display:flex;align-items:center;gap:12px;padding:0 20px ${lead ? '0 16px' : ''};border-bottom:1px solid var(--border)">
  ${lead}
  ${left}
  <div style="flex:1"></div>
  ${right}
</header>`;
}

const searchBox = () => `
<div style="display:flex;align-items:center;gap:8px;width:220px;height:32px;padding:0 10px;border:1px solid var(--border);border-radius:6px;background:var(--surface-2);color:var(--text-3)">
  ${icon('search', 15)}<span style="font-size:13px">Search</span>
</div>`;

const viewToggle = (view = 'list') => {
	const seg = (name, on) =>
		`<span style="width:28px;height:26px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;${on ? 'background:var(--surface-2);color:var(--text)' : 'color:var(--text-3)'}">${icon(name, 15)}</span>`;
	return `
<div style="display:inline-flex;padding:2px;border:1px solid var(--border);border-radius:6px;gap:2px">
  ${seg('list', view === 'list')}${seg('grid', view === 'grid')}
</div>`;
};

const sortButton = (label = 'Name') =>
	`<button type="button" style="height:32px;padding:0 10px 0 12px;border-radius:6px;font:inherit;font-size:13px;font-weight:500;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;background:var(--surface);color:var(--text);border:1px solid var(--border-2);cursor:default">${icon('transfers', 15, 'color:var(--text-2)')}<span>${label}</span>${icon('chevronDown', 13, 'color:var(--text-3)')}</button>`;

const filesHeaderRight = (view = 'list') =>
	`${searchBox()}${sortButton()}${viewToggle(view)}${btn('New folder', { ic: 'folderPlus' })}${btn('Upload', { kind: 'primary', ic: 'upload' })}`;

// ---------------------------------------------------------------------------
// Files content
// ---------------------------------------------------------------------------
const folderCard = (name, meta) => `
<div style="display:flex;flex-direction:column;gap:14px;padding:14px;border:1px solid var(--border);border-radius:8px;background:var(--surface)">
  ${folderGlyph(36)}
  <div style="display:flex;flex-direction:column;gap:2px">
    <div class="trunc" style="font-weight:500">${name}</div>
    <div style="font-size:12px;color:var(--text-3)">${meta}</div>
  </div>
</div>`;

const tableHead = (cols, kind = true) => `
<div style="display:grid;grid-template-columns:${cols};align-items:center;gap:12px;height:34px;padding:0 8px 0 12px;font-size:12px;font-weight:500;color:var(--text-3)">
  <div>Name</div>
  <div style="text-align:right">Size</div>
  <div style="display:flex;align-items:center;gap:4px;color:var(--text-2)">Modified ${icon('chevronDown', 12)}</div>
  ${kind ? '<div>Kind</div>' : ''}
  <div></div>
</div>`;

const fileRow = (f, cols, { kind = true, selected = false } = {}) => `
<div style="display:grid;grid-template-columns:${cols};align-items:center;gap:12px;height:44px;padding:0 8px 0 12px;border-top:1px solid var(--border);background:${selected ? 'var(--accent-soft)' : 'transparent'};${selected ? 'border-radius:6px;' : ''}">
  <div style="display:flex;align-items:center;gap:10px;min-width:0">${icon(f.ic, 18, 'color:var(--text-2)')}<span class="trunc">${f.name}</span></div>
  <div class="mono" style="font-size:12px;color:var(--text-2);text-align:right">${f.size}</div>
  <div style="font-size:12px;color:var(--text-2)">${f.date}</div>
  ${kind ? `<div style="font-size:12px;color:var(--text-3)">${f.kind}</div>` : ''}
  <div style="display:flex;justify-content:flex-end">${iconBtn('dots', { size: 28, dim: true })}</div>
</div>`;

const ROOT_FILES = [
	{ ic: 'archive', name: 'pos-backup-2026-09-04.tar.gz', size: '1.2 GB', date: 'Sep 4, 2026 · 02:00', kind: 'Archive' },
	{ ic: 'image', name: 'store-front.jpg', size: '3.4 MB', date: 'Sep 4, 2026 · 17:32', kind: 'JPEG image' },
	{ ic: 'sheet', name: 'sales-report-aug-2026.xlsx', size: '218 KB', date: 'Sep 1, 2026 · 09:14', kind: 'Spreadsheet' },
	{ ic: 'doc', name: 'menu-board-v3.pdf', size: '6.1 MB', date: 'Aug 28, 2026 · 11:05', kind: 'PDF document' },
	{ ic: 'video', name: 'promo-loop.mp4', size: '412 MB', date: 'Aug 26, 2026 · 15:40', kind: 'MPEG-4 video' },
	{ ic: 'archive', name: 'supplier-contracts.zip', size: '48 MB', date: 'Aug 19, 2026 · 10:22', kind: 'Archive' },
	{ ic: 'doc', name: 'README.md', size: '2 KB', date: 'Jul 3, 2026 · 08:21', kind: 'Markdown' }
];

function filesScreen({ dark = false } = {}) {
	const cols = 'minmax(0,1fr) 100px 170px 130px 36px';
	const content = `
<div style="flex:1;min-height:0;overflow:hidden;padding:20px 24px;display:flex;flex-direction:column;gap:28px">
  <section style="display:flex;flex-direction:column;gap:12px">
    ${sectionLabel('Folders', '5')}
    <div style="display:grid;grid-template-columns:repeat(5, minmax(0, 1fr));gap:12px">
      ${folderCard('Backups', '14 items · Sep 4')}
      ${folderCard('Product Photos', '128 items · Sep 4')}
      ${folderCard('Receipts 2026', '312 items · Sep 2')}
      ${folderCard('Reports', '27 items · Aug 30')}
      ${folderCard('Staff Docs', 'Empty · Aug 12')}
    </div>
  </section>
  <section style="display:flex;flex-direction:column;gap:4px">
    ${sectionLabel('Files', '7')}
    <div style="display:flex;flex-direction:column">
      ${tableHead(cols)}
      ${ROOT_FILES.map((f) => fileRow(f, cols)).join('')}
    </div>
  </section>
</div>`;
	return doc(
		`${sidebar({ nav: 'files' })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ crumbs: ['Files'], right: filesHeaderRight() })}
  ${content}
</main>`,
		{ dark }
	);
}

// ---------------------------------------------------------------------------
// File details (selected file + right panel)
// ---------------------------------------------------------------------------
const PHOTO_FILES = [
	{ ic: 'image', name: 'store-front.jpg', size: '3.4 MB', date: 'Sep 4, 2026 · 17:32' },
	{ ic: 'image', name: 'counter-display.jpg', size: '2.9 MB', date: 'Sep 4, 2026 · 17:31' },
	{ ic: 'image', name: 'latte-art.jpg', size: '4.1 MB', date: 'Sep 3, 2026 · 08:05' },
	{ ic: 'image', name: 'pastry-case.jpg', size: '3.7 MB', date: 'Sep 3, 2026 · 08:04' },
	{ ic: 'image', name: 'banner-autumn.png', size: '1.8 MB', date: 'Aug 30, 2026 · 14:12' },
	{ ic: 'video', name: 'promo-loop.mp4', size: '412 MB', date: 'Aug 26, 2026 · 15:40' }
];

const metaRow = (k, v, mono = false) => `
<div style="display:flex;justify-content:space-between;gap:16px;padding:9px 0;border-top:1px solid var(--border);font-size:12px">
  <span style="color:var(--text-3);flex:none">${k}</span>
  <span class="trunc ${mono ? 'mono' : ''}" style="color:var(--text);text-align:right">${v}</span>
</div>`;

const actionRow = (ic, label, danger = false) => `
<div style="display:flex;align-items:center;gap:10px;height:36px;padding:0 10px;border-radius:6px;color:${danger ? 'var(--danger)' : 'var(--text)'}">
  ${icon(ic, 15, `color:${danger ? 'var(--danger)' : 'var(--text-2)'}`)}<span>${label}</span>
</div>`;

function detailsScreen({ dark = false } = {}) {
	const cols = 'minmax(0,1fr) 90px 160px 36px';
	return doc(
		`${sidebar({ folder: 'Product Photos' })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ crumbs: ['Files', 'Product Photos'], right: filesHeaderRight() })}
  <div style="flex:1;min-height:0;display:flex">
    <div style="flex:1;min-width:0;padding:20px 24px;display:flex;flex-direction:column;gap:28px">
      <section style="display:flex;flex-direction:column;gap:12px">
        ${sectionLabel('Folders', '4')}
        <div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:12px">
          ${folderCard('2026-08', '41 items · Aug 31')}
          ${folderCard('2026-09', '12 items · Sep 4')}
          ${folderCard('Logos', '9 items · Jun 2')}
          ${folderCard('Menu Boards', '18 items · Aug 28')}
        </div>
      </section>
      <section style="display:flex;flex-direction:column;gap:4px">
        ${sectionLabel('Files', '6')}
        <div style="display:flex;flex-direction:column">
          ${tableHead(cols, false)}
          ${PHOTO_FILES.map((f, i) => fileRow(f, cols, { kind: false, selected: i === 0 })).join('')}
        </div>
      </section>
    </div>
    <aside style="width:320px;flex:none;border-left:1px solid var(--border);padding:20px;display:flex;flex-direction:column;gap:16px;overflow:hidden">
      <div style="height:180px;border-radius:8px;background:var(--surface-2);display:flex;align-items:center;justify-content:center;color:var(--text-3)">${icon('image', 32, 'opacity:0.7')}</div>
      <div style="display:flex;flex-direction:column;gap:4px">
        <div style="font-size:15px;font-weight:600;letter-spacing:-0.01em;word-break:break-all">store-front.jpg</div>
        <div style="font-size:12px;color:var(--text-2)">JPEG image · 4032 × 3024 · 3.4 MB</div>
      </div>
      ${btn('Download', { kind: 'primary', ic: 'download', full: true, h: 36 })}
      <div style="display:flex;flex-direction:column">
        ${metaRow('Modified', 'Sep 4, 2026 · 17:32')}
        ${metaRow('Location', '/Product Photos', true)}
        ${metaRow('Size', '3,548,112 bytes', true)}
        ${metaRow('Content-Type', 'image/jpeg', true)}
        ${metaRow('ETag', '"66d8f1a2-3626d0"', true)}
      </div>
      <div style="flex:1"></div>
      <div style="display:flex;flex-direction:column;gap:2px;margin:0 -10px">
        ${actionRow('link', 'Copy WebDAV URL')}
        ${actionRow('pencil', 'Rename')}
        ${actionRow('folderMove', 'Move to…')}
        ${actionRow('trash', 'Delete', true)}
      </div>
    </aside>
  </div>
</main>`,
		{ dark }
	);
}

// ---------------------------------------------------------------------------
// Transfers
// ---------------------------------------------------------------------------
const transferRow = ({ ic, name, sub, pct, right, done = false, queued = false, failed = false }) => {
	const progress = failed
		? `<div class="trunc" style="font-size:12px;color:var(--danger)">${right}</div>`
		: done
		? `<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-3)">${icon('check', 14, 'color:var(--ok)')}<span>${right}</span></div>`
		: queued
			? `<div style="font-size:12px;color:var(--text-3)">${right}</div>`
			: `<div style="display:flex;flex-direction:column;gap:6px">
        <div style="height:4px;border-radius:2px;background:var(--surface-2);overflow:hidden"><div style="width:${pct}%;height:100%;background:var(--accent)"></div></div>
        <div class="mono" style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-3)"><span>${pct}%</span><span>${right}</span></div>
      </div>`;
	const actions = failed
		? `<a href="#" style="font-size:12px;font-weight:500;white-space:nowrap">Retry</a>`
		: done
		? `<a href="#" style="font-size:12px;white-space:nowrap">Show in folder</a>`
		: queued
			? `${iconBtn('x', { size: 28, dim: true })}`
			: `${iconBtn('pause', { size: 28 })}${iconBtn('x', { size: 28, dim: true })}`;
	return `
<div style="display:grid;grid-template-columns:36px minmax(0,1fr) 260px 110px;align-items:center;gap:16px;padding:12px 8px 12px 0;border-top:1px solid var(--border)">
  <div style="width:36px;height:36px;border-radius:8px;background:var(--surface-2);color:var(--text-2);display:inline-flex;align-items:center;justify-content:center">${icon(ic, 16)}</div>
  <div style="display:flex;flex-direction:column;gap:2px;min-width:0">
    <div class="trunc" style="font-weight:500">${name}</div>
    <div class="trunc" style="font-size:12px;color:var(--text-3)">${sub}</div>
  </div>
  ${progress}
  <div style="display:flex;justify-content:flex-end;gap:2px">${actions}</div>
</div>`;
};

function transfersScreen({ dark = false } = {}) {
	return doc(
		`${sidebar({ nav: 'transfers' })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ title: 'Transfers', right: `${btn('Pause all', { ic: 'pause' })}${btn('Clear completed')}` })}
  <div style="flex:1;min-height:0;overflow:hidden;padding:20px 24px;display:flex;flex-direction:column;gap:28px">
    <section style="display:flex;flex-direction:column;gap:4px">
      ${sectionLabel('Active', '2')}
      ${transferRow({ ic: 'upload', name: 'promo-loop.mp4', sub: 'Uploading to /Product Photos · 256 MB of 412 MB', pct: 62, right: '8.4 MB/s · 19 s left' })}
      ${transferRow({ ic: 'download', name: 'pos-backup-2026-09-04.tar.gz', sub: 'Downloading to ~/Downloads · 221 MB of 1.2 GB', pct: 18, right: '11.2 MB/s · 1 min 30 s left' })}
    </section>
    <section style="display:flex;flex-direction:column;gap:4px">
      ${sectionLabel('Queued', '1')}
      ${transferRow({ ic: 'upload', name: 'store-walkthrough.mp4', sub: 'Uploading to /Product Photos · 1.8 GB', queued: true, right: 'Waiting for a free slot' })}
    </section>
    <section style="display:flex;flex-direction:column;gap:4px">
      ${sectionLabel('Completed today', '3')}
      ${transferRow({ ic: 'upload', name: 'menu-board-v3.pdf', sub: 'Uploaded to /Reports · 6.1 MB', done: true, right: '17:32' })}
      ${transferRow({ ic: 'upload', name: 'store-front.jpg', sub: 'Uploaded to /Product Photos · 3.4 MB', done: true, right: '17:32' })}
      ${transferRow({ ic: 'download', name: 'sales-report-aug-2026.xlsx', sub: 'Downloaded to ~/Downloads · 218 KB', done: true, right: '09:15' })}
    </section>
  </div>
</main>`,
		{ dark }
	);
}

// ---------------------------------------------------------------------------
// Empty folder
// ---------------------------------------------------------------------------
function emptyScreen({ dark = false } = {}) {
	return doc(
		`${sidebar({ folder: 'Staff Docs' })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ crumbs: ['Files', 'Staff Docs'], right: filesHeaderRight() })}
  <div style="flex:1;min-height:0;padding:24px;display:flex">
    <div style="flex:1;border:1.5px dashed var(--border-2);border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;padding:40px">
      <div style="width:56px;height:56px;border-radius:28px;background:var(--surface-2);color:var(--text-2);display:inline-flex;align-items:center;justify-content:center">${icon('upload', 24)}</div>
      <div style="display:flex;flex-direction:column;gap:6px;max-width:360px">
        <div style="font-size:15px;font-weight:600;letter-spacing:-0.01em">Nothing here yet</div>
        <div style="font-size:13px;color:var(--text-2);text-wrap:pretty">Drop files anywhere in this window to upload them to /Staff Docs on Lab SFTPGo.</div>
      </div>
      <div style="display:flex;gap:8px">${btn('Upload files', { kind: 'primary', ic: 'upload' })}${btn('New folder', { ic: 'folderPlus' })}</div>
    </div>
  </div>
</main>`,
		{ dark }
	);
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
const settingsSection = (title, sub, body) => `
<section style="display:grid;grid-template-columns:200px minmax(0,1fr);gap:32px;padding:24px 0;border-top:1px solid var(--border)">
  <div style="display:flex;flex-direction:column;gap:4px">
    <div style="font-weight:600">${title}</div>
    <div style="font-size:12px;color:var(--text-3);text-wrap:pretty">${sub}</div>
  </div>
  <div style="display:flex;flex-direction:column;gap:14px">${body}</div>
</section>`;

const settingRow = (label, helper, control) => `
<div style="display:flex;align-items:center;justify-content:space-between;gap:24px">
  <div style="display:flex;flex-direction:column;gap:2px;min-width:0">
    <div>${label}</div>
    ${helper ? `<div style="font-size:12px;color:var(--text-3)">${helper}</div>` : ''}
  </div>
  ${control}
</div>`;

const segmented = (items, active) => `
<div style="display:inline-flex;padding:2px;background:var(--surface-2);border-radius:6px;gap:2px">
  ${items
		.map(
			(it) =>
				`<span style="padding:5px 12px;border-radius:4px;font-size:12px;font-weight:500;color:${it === active ? 'var(--text)' : 'var(--text-2)'};background:${it === active ? 'var(--surface)' : 'transparent'};${it === active ? 'box-shadow:0 1px 2px rgba(0,0,0,0.08);' : ''}">${it}</span>`
		)
		.join('')}
</div>`;

const legend = (color, label, value) => `
<div style="display:flex;align-items:center;gap:8px;font-size:12px">
  <span style="width:8px;height:8px;border-radius:4px;background:${color};flex:none"></span>
  <span style="color:var(--text-2)">${label}</span>
  <span class="mono" style="color:var(--text-3)">${value}</span>
</div>`;

const accountCard = `
        <div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--border);border-radius:8px">
          <span style="width:36px;height:36px;border-radius:8px;background:var(--surface-2);color:var(--text-2);display:inline-flex;align-items:center;justify-content:center;flex:none">${icon('server', 16)}</span>
          <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">
            <div style="font-weight:500">Lab SFTPGo</div>
            <div class="trunc mono" style="font-size:12px;color:var(--text-3)">http://192.168.1.194:8081 · signed in as pos</div>
          </div>
          ${btn('Sign out', { ic: 'signOut' })}
        </div>`;

function settingsScreen({ dark = false } = {}) {
	return doc(
		`${sidebar({ gear: true })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ title: 'Settings' })}
  <div style="flex:1;min-height:0;overflow:hidden;padding:0 24px 20px">
    <div style="max-width:720px;display:flex;flex-direction:column">
      ${settingsSection(
				'Account',
				'The server this window is signed in to.',
				accountCard
			)}
      ${settingsSection('Appearance', 'Follows macOS by default.', settingRow('Theme', '', segmented(['System', 'Light', 'Dark'], 'System')))}
      ${settingsSection(
				'Downloads',
				'Where files land when you download them.',
				`${settingRow('Save to', '~/Downloads', btn('Change…'))}
         ${settingRow('Ask where to save each file', '', toggle(false))}`
			)}
      ${settingsSection(
				'Trash',
				'Deleted items are moved to a hidden .trash folder on the server instead of being removed.',
				settingRow('Deleted items', 'Kept for 30 days, then removed for good. Never shown in Files or search.', btn('Empty Trash…', { ic: 'trash' }))
			)}
      ${settingsSection(
				'Connection',
				'How this Mac talks to the server.',
				`${settingRow('Concurrent transfers', 'Uploads and downloads running at the same time.', `<div class="mono" style="width:56px;height:32px;border:1px solid var(--border-2);border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:13px">3</div>`)}
         ${settingRow('Trust self-signed certificates', 'Only for servers you run yourself, like this LAN SFTPGo.', toggle(false))}`
			)}
      ${settingsSection(
				'Storage',
				'Quota is set on the server for user pos.',
				`<div style="display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:var(--text-2)">48.2 GB of 200 GB used</span><span class="mono" style="color:var(--text-3)">151.8 GB free</span></div>
          ${segBar(8)}
          <div style="display:flex;gap:20px;flex-wrap:wrap">
            ${legend('var(--seg-1)', 'Images', '21.4 GB')}
            ${legend('var(--seg-2)', 'Videos', '15.8 GB')}
            ${legend('var(--seg-3)', 'Documents', '6.3 GB')}
            ${legend('var(--seg-4)', 'Other', '4.7 GB')}
          </div>
        </div>`
			)}
      <div class="mono" style="padding-top:20px;border-top:1px solid var(--border);font-size:11px;color:var(--text-3)">Soteria 0.1.0 · WebDAV client · Wails 3</div>
    </div>
  </div>
</main>`,
		{ dark }
	);
}

// ---------------------------------------------------------------------------
// Onboarding: servers + sign in
// ---------------------------------------------------------------------------
const onboardingChrome = () => `
<div style="height:52px;flex:none;display:flex;align-items:center;padding:0 16px">${trafficLights()}</div>`;

const serverRow = (name, addr, status, statusColor, last = false) => `
<div style="display:flex;align-items:center;gap:14px;padding:14px 16px;${last ? '' : 'border-bottom:1px solid var(--border);'}">
  <span style="width:36px;height:36px;border-radius:8px;background:var(--surface-2);color:var(--text-2);display:inline-flex;align-items:center;justify-content:center;flex:none">${icon('server', 16)}</span>
  <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">
    <div style="font-weight:500;font-size:14px">${name}</div>
    <div class="trunc mono" style="font-size:12px;color:var(--text-3)">${addr}</div>
  </div>
  <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-2);flex:none">
    <span style="width:7px;height:7px;border-radius:4px;background:${statusColor}"></span><span>${status}</span>
  </div>
  ${icon('chevronRight', 16, 'color:var(--text-3)')}
</div>`;

function serversScreen({ dark = false } = {}) {
	return doc(
		`${onboardingChrome()}
<div style="flex:1;display:flex;align-items:center;justify-content:center;padding-bottom:52px">
  <div style="width:520px;display:flex;flex-direction:column;gap:20px">
    <div style="display:flex;flex-direction:column;gap:6px">
      <h1 style="margin:0;font-size:22px;font-weight:600;letter-spacing:-0.02em;line-height:1.2">Choose a server</h1>
      <p style="margin:0;color:var(--text-2);text-wrap:pretty">Connections saved on this Mac. Passwords stay in the Keychain.</p>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px">
      ${serverRow('Lab SFTPGo', '192.168.1.194:8081 · pos', 'Reachable', 'var(--ok)')}
      ${serverRow('Home NAS', 'https://nas.home.arpa:8443/dav · kiet', 'Last used Aug 29', 'var(--border-2)', true)}
    </div>
    ${btn('Add server', { ic: 'plus', full: true, h: 36 })}
  </div>
</div>`,
		{ dark, root: 'display:flex;flex-direction:column;' }
	);
}

function signInScreen({ dark = false, error = false } = {}) {
	const banner = error
		? `<div style="display:flex;gap:10px;padding:10px 12px;border-radius:6px;background:var(--danger-soft);color:var(--danger);font-size:12px;line-height:1.5">${icon('info', 15, 'margin-top:1px')}<span>Couldn't reach 192.168.1.194:8081. Check that the WebDAV service is running and the port is open on the server.</span></div>`
		: '';
	return doc(
		`${onboardingChrome()}
<div style="flex:1;display:flex;align-items:center;justify-content:center;padding-bottom:52px">
  <div style="width:400px;display:flex;flex-direction:column;gap:24px">
    <a href="#" style="display:inline-flex;align-items:center;gap:4px;font-size:12px;color:var(--text-2)">${icon('chevronLeft', 14)}<span>Servers</span></a>
    <div style="display:flex;flex-direction:column;gap:6px">
      <h1 style="margin:0;font-size:22px;font-weight:600;letter-spacing:-0.02em;line-height:1.2">Add a server</h1>
      <p style="margin:0;color:var(--text-2);text-wrap:pretty">Any WebDAV server, such as SFTPGo or Nextcloud.</p>
    </div>
    ${banner}
    <div style="display:flex;flex-direction:column;gap:16px">
      ${field('Server address', 'http://192.168.1.194:8081', { mono: true, helper: 'Include the port. Use https:// when the server has TLS.' })}
      ${field('Username', 'pos')}
      ${field('Password', '••••••••', { trailing: icon('eye', 15, 'color:var(--text-3)') })}
      <div style="display:flex;align-items:flex-start;gap:10px">
        ${checkbox(true)}
        <div style="display:flex;flex-direction:column;gap:2px;margin-top:-2px">
          <div>Remember me</div>
          <div style="font-size:12px;color:var(--text-3)">Saved to the macOS Keychain.</div>
        </div>
      </div>
    </div>
    ${btn('Sign in', { kind: 'primary', full: true, h: 36 })}
  </div>
</div>`,
		{ dark, root: 'display:flex;flex-direction:column;' }
	);
}

// ---------------------------------------------------------------------------
// Dialogs & menus sheet
// ---------------------------------------------------------------------------
const caption = (t) =>
	`<div style="font-size:11px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-3)">${t}</div>`;

const dialog = (title, body, footer, { width = 400 } = {}) => `
<div style="width:${width}px;background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:var(--shadow);padding:20px;display:flex;flex-direction:column;gap:16px">
  <div style="font-size:15px;font-weight:600;letter-spacing:-0.01em">${title}</div>
  ${body}
  <div style="display:flex;justify-content:flex-end;gap:8px">${footer}</div>
</div>`;

const menuItem = (ic, label, kbd = '', { hover = false, danger = false } = {}) => `
<div style="display:flex;align-items:center;gap:10px;height:30px;padding:0 10px;border-radius:5px;background:${hover ? 'var(--surface-2)' : 'transparent'};color:${danger ? 'var(--danger)' : 'var(--text)'}">
  ${icon(ic, 15, `color:${danger ? 'var(--danger)' : 'var(--text-2)'}`)}<span style="flex:1">${label}</span>${kbd ? `<kbd>${kbd}</kbd>` : ''}
</div>`;

const menuDivider = () => `<div style="height:1px;background:var(--border);margin:4px 0"></div>`;

const treeRow = (name, depth, selected = false) => `
<div style="display:flex;align-items:center;gap:8px;height:30px;padding:0 10px 0 ${10 + depth * 18}px;border-radius:5px;background:${selected ? 'var(--accent-soft)' : 'transparent'};color:${selected ? 'var(--accent-text)' : 'var(--text)'}">
  ${depth === 0 ? icon('server', 15, 'color:var(--text-2)') : folderGlyph(16)}<span style="flex:1">${name}</span>${selected ? icon('check', 14) : ''}
</div>`;

const toast = (ic, color, text, link = '') => `
<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;box-shadow:var(--shadow);width:380px">
  ${icon(ic, 16, `color:${color}`)}<span style="flex:1;font-size:13px">${text}</span>${link ? `<a href="#" style="font-size:12px;font-weight:500">${link}</a>` : ''}
</div>`;

function dialogsSheet({ dark = false } = {}) {
	const col = (inner) => `<div style="display:flex;flex-direction:column;gap:28px">${inner}</div>`;
	const block = (cap, inner) => `<div style="display:flex;flex-direction:column;gap:10px">${caption(cap)}${inner}</div>`;

	const contextMenu = `
<div style="width:220px;background:var(--surface);border:1px solid var(--border);border-radius:8px;box-shadow:var(--shadow);padding:6px">
  ${menuItem('open', 'Open', '⏎')}
  ${menuItem('download', 'Download', '⌘D', { hover: true })}
  ${menuDivider()}
  ${menuItem('pencil', 'Rename')}
  ${menuItem('folderMove', 'Move to…')}
  ${menuItem('link', 'Copy WebDAV URL')}
  ${menuDivider()}
  ${menuItem('trash', 'Delete', '⌘⌫', { danger: true })}
</div>`;

	const newFolder = dialog(
		'New folder',
		`<div style="display:flex;flex-direction:column;gap:6px">${field('Name', 'Untitled folder', { focus: true })}<div style="font-size:12px;color:var(--text-3)">Created in /Product Photos</div></div>`,
		`${btn('Cancel')}${btn('Create', { kind: 'primary' })}`
	);

	const rename = dialog(
		'Rename',
		field('Name', 'store-front.jpg', { helper: 'Keep the extension so the file still opens correctly.' }),
		`${btn('Cancel')}${btn('Rename', { kind: 'primary' })}`
	);

	const del = dialog(
		'Delete “promo-loop.mp4”?',
		`<p style="margin:0;color:var(--text-2);text-wrap:pretty">It will be removed from Lab SFTPGo for everyone who uses this server. WebDAV has no trash, so this can't be undone.</p>`,
		`${btn('Cancel')}${btn('Delete', { kind: 'danger' })}`
	);

	const move = dialog(
		'Move 2 items to…',
		`<div style="display:flex;flex-direction:column;gap:2px;border:1px solid var(--border);border-radius:6px;padding:6px;max-height:230px">
      ${treeRow('Lab SFTPGo', 0)}
      ${treeRow('Backups', 1)}
      ${treeRow('Product Photos', 1)}
      ${treeRow('2026-09', 2, true)}
      ${treeRow('Receipts 2026', 1)}
      ${treeRow('Reports', 1)}
      ${treeRow('Staff Docs', 1)}
    </div>`,
		`<a href="#" style="display:inline-flex;align-items:center;gap:6px;font-size:12px;margin-right:auto;color:var(--text-2)">${icon('folderPlus', 14)}<span>New folder</span></a>${btn('Cancel')}${btn('Move here', { kind: 'primary' })}`
	);

	const conflict = dialog(
		'“store-front.jpg” already exists',
		`<p style="margin:0;color:var(--text-2);text-wrap:pretty">A file with that name is already in /Product Photos. The one on the server is 2.9 MB, modified Sep 4 at 17:31.</p>
     <div style="display:flex;align-items:center;gap:10px;font-size:12px;color:var(--text-2)">${checkbox(false)}<span>Do this for the remaining 2 files</span></div>`,
		`${btn('Skip')}${btn('Keep both')}${btn('Replace', { kind: 'primary' })}`
	);

	const toasts = `
<div style="display:flex;flex-direction:column;gap:10px">
  ${toast('check', 'var(--ok)', 'Uploaded 3 files to /Product Photos', 'Show')}
  ${toast('info', 'var(--danger)', "Couldn't rename store-front.jpg. A file with that name already exists.", 'Retry')}
</div>`;

	return doc(
		`<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:32px;padding:24px 32px;align-items:start">
  ${col(block('Context menu', contextMenu) + block('Toasts', toasts))}
  ${col(block('New folder', newFolder) + block('Rename', rename) + block('Delete', del))}
  ${col(block('Move to', move) + block('Upload conflict', conflict))}
</div>`,
		{ dark, root: 'display:block;' }
	);
}

// ---------------------------------------------------------------------------
// Preview (full-window viewer for images, PDF, video, audio, text, docx)
// ---------------------------------------------------------------------------
function previewScreen({ dark = false, name, meta, body }) {
	return doc(
		`<header style="height:52px;flex:none;display:flex;align-items:center;gap:12px;padding:0 20px 0 84px;border-bottom:1px solid var(--border);background:var(--surface)">
  <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:1px">
    <div class="trunc" style="font-weight:500">${name}</div>
    <div class="trunc" style="font-size:12px;color:var(--text-3)">${meta}</div>
  </div>
  ${btn('Download', { ic: 'download' })}
  <div style="display:flex;align-items:center;gap:6px"><kbd>Esc</kbd>${iconBtn('x')}</div>
</header>
<div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:24px">${body}</div>`,
		{ dark, root: 'display:flex;flex-direction:column;' }
	);
}

const previewImage = () =>
	previewScreen({
		name: 'store-front.jpg',
		meta: '/Product Photos · JPEG image · 4032 × 3024 · 3.4 MB',
		body: `<div style="width:1000px;height:100%;border-radius:8px;background:var(--surface-2);display:flex;align-items:center;justify-content:center;color:var(--text-3)">${icon('image', 44, 'opacity:0.6')}</div>`
	});

const th = (t) =>
	`<th style="text-align:left;padding:8px 10px;border-bottom:1px solid var(--border);font-weight:500;color:var(--text-2)">${t}</th>`;
const td = (t) => `<td style="padding:8px 10px;border-bottom:1px solid var(--border)">${t}</td>`;
const box = () =>
	`<span style="display:inline-block;width:12px;height:12px;border:1px solid var(--border-2);border-radius:3px;vertical-align:-1px"></span>`;

const previewDoc = () =>
	previewScreen({
		dark: true,
		name: 'opening-checklist.docx',
		meta: '/Staff Docs · Word document · 24 KB',
		body: `<article style="width:760px;height:100%;overflow:hidden;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:48px 56px;display:flex;flex-direction:column;gap:14px;font-size:14px;line-height:1.6">
  <h1 style="margin:0;font-size:24px;font-weight:600;letter-spacing:-0.02em">Opening checklist</h1>
  <p style="margin:0;color:var(--text-2)">Lab Coffee · Staff Docs · Updated Aug 12, 2026</p>
  <p style="margin:0;text-wrap:pretty">Complete every item before unlocking the front door. Tick the paper copy at the counter and leave it for the closing shift.</p>
  <h2 style="margin:10px 0 0;font-size:16px;font-weight:600">Before 7:00</h2>
  <ul style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:4px">
    <li>Switch on the espresso machine and let it warm up for 25 minutes.</li>
    <li>Check the milk delivery against the invoice in Receipts 2026.</li>
    <li>Start the POS and confirm the cash float is 2,000,000 ₫.</li>
  </ul>
  <h2 style="margin:10px 0 0;font-size:16px;font-weight:600">At opening</h2>
  <table style="border-collapse:collapse;width:100%;font-size:13px">
    <tr>${th('Station')}${th('Owner')}${th('Done')}</tr>
    <tr>${td('Bar')}${td('Barista on shift')}${td(box())}</tr>
    <tr>${td('Pastry case')}${td('Front of house')}${td(box())}</tr>
    <tr>${td('Tables and terrace')}${td('Front of house')}${td(box())}</tr>
  </table>
</article>`
	});

// ---------------------------------------------------------------------------
// Card view + list view with sort menu
// ---------------------------------------------------------------------------
const fileCard = (f) => `
<div style="display:flex;flex-direction:column;border:1px solid var(--border);border-radius:8px;background:var(--surface);overflow:hidden">
  <div style="height:96px;display:flex;align-items:center;justify-content:center;background:var(--surface-2);color:var(--text-3)">${icon(f.ic, 28, 'opacity:0.8')}</div>
  <div style="padding:10px 12px 12px;display:flex;flex-direction:column;gap:2px">
    <div class="trunc" style="font-weight:500">${f.name}</div>
    <div style="font-size:12px;color:var(--text-3)">${f.size} · ${f.date.split(' · ')[0]}</div>
  </div>
</div>`;

function filesGridScreen({ dark = false } = {}) {
	return doc(
		`${sidebar({ nav: 'files' })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ crumbs: ['Files'], right: filesHeaderRight('grid') })}
  <div style="flex:1;min-height:0;overflow:hidden;padding:20px 24px;display:flex;flex-direction:column;gap:28px">
    <section style="display:flex;flex-direction:column;gap:12px">
      ${sectionLabel('Folders', '5')}
      <div style="display:grid;grid-template-columns:repeat(5, minmax(0, 1fr));gap:12px">
        ${folderCard('Backups', '14 items · Sep 4')}
        ${folderCard('Product Photos', '128 items · Sep 4')}
        ${folderCard('Receipts 2026', '312 items · Sep 2')}
        ${folderCard('Reports', '27 items · Aug 30')}
        ${folderCard('Staff Docs', 'Empty · Aug 12')}
      </div>
    </section>
    <section style="display:flex;flex-direction:column;gap:12px">
      ${sectionLabel('Files', '7')}
      <div style="display:grid;grid-template-columns:repeat(5, minmax(0, 1fr));gap:12px">
        ${ROOT_FILES.map(fileCard).join('')}
      </div>
    </section>
  </div>
</main>`,
		{ dark }
	);
}

const LIST_COLS = 'minmax(0,1fr) 120px 90px 170px 170px 36px';

const listHead = () => `
<div style="display:grid;grid-template-columns:${LIST_COLS};align-items:center;gap:12px;height:34px;padding:0 8px 0 12px;font-size:12px;font-weight:500;color:var(--text-3)">
  <div style="display:flex;align-items:center;gap:4px;color:var(--text-2)">Name ${icon('chevronDown', 12)}</div>
  <div>Kind</div>
  <div style="text-align:right">Size</div>
  <div>Modified</div>
  <div>Created</div>
  <div></div>
</div>`;

const listRow = (e) => `
<div style="display:grid;grid-template-columns:${LIST_COLS};align-items:center;gap:12px;height:44px;padding:0 8px 0 12px;border-top:1px solid var(--border)">
  <div style="display:flex;align-items:center;gap:10px;min-width:0">${e.dir ? folderGlyph(18) : icon(e.ic, 18, 'color:var(--text-2)')}<span class="trunc">${e.name}</span></div>
  <div style="font-size:12px;color:var(--text-3)">${e.dir ? 'Folder' : e.kind}</div>
  <div class="mono" style="font-size:12px;color:var(--text-2);text-align:right">${e.dir ? '—' : e.size}</div>
  <div style="font-size:12px;color:var(--text-2)">${e.date}</div>
  <div style="font-size:12px;color:var(--text-2)">${e.created}</div>
  <div style="display:flex;justify-content:flex-end">${iconBtn('dots', { size: 28, dim: true })}</div>
</div>`;

const LIST_ITEMS = [
	{ dir: true, name: 'Backups', date: 'Sep 4, 2026 · 02:00', created: 'Jan 12, 2026 · 09:00' },
	{ dir: true, name: 'Product Photos', date: 'Sep 4, 2026 · 17:32', created: 'Feb 3, 2026 · 10:15' },
	{ dir: true, name: 'Receipts 2026', date: 'Sep 2, 2026 · 18:10', created: 'Jan 2, 2026 · 08:30' },
	{ dir: true, name: 'Reports', date: 'Aug 30, 2026 · 11:05', created: 'Mar 20, 2026 · 14:00' },
	{ dir: true, name: 'Staff Docs', date: 'Aug 12, 2026 · 09:41', created: 'Aug 12, 2026 · 09:41' },
	...ROOT_FILES.map((f, i) => ({ ...f, created: ['Sep 4, 2026 · 02:00', 'Sep 4, 2026 · 17:30', 'Sep 1, 2026 · 09:10', 'Aug 21, 2026 · 16:02', 'Aug 26, 2026 · 15:38', 'Aug 19, 2026 · 10:20', 'Jul 3, 2026 · 08:21'][i] }))
];

const sortItem = (label, active = false) => `
<div style="display:flex;align-items:center;gap:10px;height:30px;padding:0 10px;border-radius:5px;${active ? 'background:var(--surface-2);' : ''}">
  <span style="flex:1">${label}</span>${active ? icon('check', 14, 'color:var(--accent-text)') : ''}
</div>`;

const sortMenu = () => `
<div style="position:absolute;top:56px;right:352px;width:220px;background:var(--surface);border:1px solid var(--border);border-radius:8px;box-shadow:var(--shadow);padding:6px;z-index:2">
  <div style="padding:6px 10px 4px;font-size:11px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-3)">Sort by</div>
  ${sortItem('Name', true)}
  ${sortItem('Kind')}
  ${sortItem('Size')}
  ${sortItem('Date modified')}
  ${sortItem('Date created')}
  ${menuDivider()}
  ${sortItem('Ascending', true)}
  ${sortItem('Descending')}
</div>`;

function filesListScreen({ dark = false } = {}) {
	return doc(
		`${sidebar({ nav: 'files' })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface);position:relative">
  ${header({ crumbs: ['Files'], right: filesHeaderRight('list') })}
  ${sortMenu()}
  <div style="flex:1;min-height:0;overflow:hidden;padding:20px 24px;display:flex;flex-direction:column;gap:4px">
    ${sectionLabel('All items', '12')}
    <div style="display:flex;flex-direction:column">
      ${listHead()}
      ${LIST_ITEMS.map(listRow).join('')}
    </div>
  </div>
</main>`,
		{ dark }
	);
}

// ---------------------------------------------------------------------------
// Global search (index built from PROPFIND, searched locally)
// ---------------------------------------------------------------------------
const searchBoxActive = (q) => `
<div style="display:flex;align-items:center;gap:8px;width:220px;height:32px;padding:0 10px;border:1px solid var(--accent);box-shadow:0 0 0 3px var(--accent-soft);border-radius:6px;background:var(--surface);color:var(--text)">
  ${icon('search', 15, 'color:var(--text-3)')}<span style="flex:1;font-size:13px">${q}</span>${icon('x', 13, 'color:var(--text-3)')}
</div>`;

const seg = (items, active) =>
	`<div style="display:inline-flex;padding:2px;background:var(--surface-2);border-radius:6px;gap:2px">${items
		.map(
			(t, i) =>
				`<span style="padding:4px 12px;border-radius:4px;font-size:12px;font-weight:500;${i === active ? 'background:var(--surface);color:var(--text);box-shadow:0 1px 2px rgba(0,0,0,0.08)' : 'color:var(--text-2)'}">${t}</span>`
		)
		.join('')}</div>`;

const hl = (text, q) =>
	text.replace(
		new RegExp(`(${q})`, 'i'),
		'<mark style="background:var(--accent-soft);color:inherit;border-radius:3px;padding:0 1px">$1</mark>'
	);

const RESULTS = [
	{ ic: 'doc', name: 'invoice-2026-08.pdf', path: '/Receipts 2026/2026-08', size: '184 KB', date: 'Sep 1, 2026 · 09:14' },
	{ ic: 'doc', name: 'invoice-2026-07.pdf', path: '/Receipts 2026/2026-07', size: '176 KB', date: 'Aug 1, 2026 · 09:02' },
	{ ic: 'sheet', name: 'Invoice Log.xlsx', path: '/Reports', size: '96 KB', date: 'Aug 30, 2026 · 11:05' },
	{ ic: 'doc', name: 'invoice-template.docx', path: '/Staff Docs', size: '42 KB', date: 'Jun 12, 2026 · 15:40' },
	{ dir: true, name: 'Invoices 2025', path: '/Reports/Archive', size: '—', date: 'Dec 31, 2025 · 18:00' },
	{ ic: 'archive', name: 'supplier-invoices-2025.zip', path: '/Backups', size: '38 MB', date: 'Jan 6, 2026 · 08:12' }
];

const resultRow = (r, q) => `
<div style="display:grid;grid-template-columns:minmax(0,1fr) 90px 170px 36px;align-items:center;gap:12px;height:52px;padding:0 8px 0 12px;border-top:1px solid var(--border)">
  <div style="display:flex;align-items:center;gap:10px;min-width:0">
    ${r.dir ? folderGlyph(18) : icon(r.ic, 18, 'color:var(--text-2)')}
    <div style="min-width:0;display:flex;flex-direction:column;gap:1px">
      <span class="trunc">${hl(r.name, q)}</span>
      <span class="trunc mono" style="font-size:11px;color:var(--text-3)">${r.path}</span>
    </div>
  </div>
  <div class="mono" style="font-size:12px;color:var(--text-2);text-align:right">${r.size}</div>
  <div style="font-size:12px;color:var(--text-2)">${r.date}</div>
  <div style="display:flex;justify-content:flex-end">${iconBtn('dots', { size: 28, dim: true })}</div>
</div>`;

function searchScreen({ dark = false, indexing = false } = {}) {
	const q = 'invoice';
	const rows = indexing ? RESULTS.slice(0, 2) : RESULTS;
	const status = indexing
		? `<div style="display:flex;align-items:center;gap:10px;font-size:12px;color:var(--text-2)">
        <span>Building search index · 128 of about 600 folders</span>
        <div style="width:120px;height:4px;border-radius:2px;background:var(--surface-2);overflow:hidden"><div style="width:21%;height:100%;background:var(--accent)"></div></div>
      </div>`
		: `<span style="font-size:12px;color:var(--text-3)">Indexed 2,340 items · 2 min ago</span>
      <a href="#" style="font-size:12px;display:inline-flex;align-items:center;gap:4px">${icon('refresh', 13)}<span>Refresh</span></a>`;
	return doc(
		`${sidebar({ nav: 'files' })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ crumbs: ['Files'], right: `${searchBoxActive(q)}${sortButton()}${viewToggle('list')}${btn('New folder', { ic: 'folderPlus' })}${btn('Upload', { kind: 'primary', ic: 'upload' })}` })}
  <div style="flex:1;min-height:0;overflow:hidden;padding:20px 24px;display:flex;flex-direction:column;gap:14px">
    <div style="display:flex;align-items:center;gap:14px">
      ${seg(['This folder', 'Everywhere'], 1)}
      <span style="font-size:13px;color:var(--text-2)">${indexing ? `${rows.length} results so far for “${q}”` : `${rows.length} results for “${q}”`}</span>
      <span style="flex:1"></span>
      ${status}
    </div>
    <div style="display:flex;flex-direction:column">${rows.map((r) => resultRow(r, q)).join('')}</div>
    ${indexing ? `<p style="margin:4px 0 0 12px;font-size:12px;color:var(--text-3)">More results appear as folders are indexed. You can keep browsing meanwhile.</p>` : ''}
  </div>
</main>`,
		{ dark }
	);
}

// ---------------------------------------------------------------------------
// Multi-select, upload conflict, folder upload, recent
// ---------------------------------------------------------------------------
const SEL_COLS = 'minmax(0,1fr) 90px 170px 36px';
const selRow = (e, on = false) => `
<div style="display:grid;grid-template-columns:${SEL_COLS};align-items:center;gap:12px;height:44px;padding:0 8px 0 12px;border-top:1px solid var(--border);border-radius:${on ? '6px' : '0'};background:${on ? 'var(--accent-soft)' : 'transparent'}">
  <div style="display:flex;align-items:center;gap:10px;min-width:0">${e.dir ? folderGlyph(18) : icon(e.ic, 18, 'color:var(--text-2)')}<span class="trunc">${e.name}</span></div>
  <div class="mono" style="font-size:12px;color:var(--text-2);text-align:right">${e.dir ? '—' : e.size}</div>
  <div style="font-size:12px;color:var(--text-2)">${e.date}</div>
  <div style="display:flex;justify-content:flex-end">${iconBtn('dots', { size: 28, dim: true })}</div>
</div>`;

const PHOTOS = [
	{ dir: true, name: '2026-08', date: 'Aug 31, 2026 · 19:20' },
	{ dir: true, name: '2026-09', date: 'Sep 4, 2026 · 17:32', on: true },
	{ dir: true, name: 'Logos', date: 'Mar 3, 2026 · 10:15' },
	{ ic: 'image', name: 'banner-autumn.png', size: '2.1 MB', date: 'Sep 3, 2026 · 16:05' },
	{ ic: 'image', name: 'counter-display.jpg', size: '2.9 MB', date: 'Sep 4, 2026 · 17:31', on: true },
	{ ic: 'image', name: 'latte-art.jpg', size: '1.8 MB', date: 'Aug 22, 2026 · 14:12' },
	{ ic: 'image', name: 'pastry-case.jpg', size: '3.2 MB', date: 'Aug 22, 2026 · 14:10', on: true },
	{ ic: 'video', name: 'promo-loop.mp4', size: '412 MB', date: 'Aug 26, 2026 · 15:40' },
	{ ic: 'image', name: 'store-front.jpg', size: '3.4 MB', date: 'Sep 4, 2026 · 17:32' }
];

const selChip = (n) =>
	`<div style="display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 8px 0 10px;border-radius:14px;background:var(--accent-soft);color:var(--accent-text);font-size:12px;font-weight:500">${n} selected ${icon('x', 12)}</div>`;

function selectionScreen({ dark = false } = {}) {
	const picked = PHOTOS.filter((e) => e.on);
	return doc(
		`${sidebar({ nav: 'files', folder: 'Product Photos' })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ crumbs: ['Files', 'Product Photos'], right: `${selChip(3)}${searchBox()}${sortButton()}${viewToggle('list')}${btn('New folder', { ic: 'folderPlus' })}${btn('Upload', { kind: 'primary', ic: 'upload' })}` })}
  <div style="flex:1;min-height:0;display:flex">
    <div style="flex:1;min-width:0;overflow:hidden;padding:20px 24px;display:flex;flex-direction:column;gap:4px">
      <div style="display:grid;grid-template-columns:${SEL_COLS};align-items:center;gap:12px;height:34px;padding:0 8px 0 12px;font-size:12px;font-weight:500;color:var(--text-3)">
        <div style="display:flex;align-items:center;gap:4px;color:var(--text-2)">Name ${icon('chevronDown', 12)}</div><div style="text-align:right">Size</div><div>Modified</div><div></div>
      </div>
      ${PHOTOS.map((e) => selRow(e, e.on)).join('')}
    </div>
    <aside style="width:320px;flex:none;border-left:1px solid var(--border);padding:20px;display:flex;flex-direction:column;gap:16px">
      <div style="height:180px;border-radius:8px;background:var(--surface-2);display:flex;align-items:center;justify-content:center;gap:16px;color:var(--text-3)">
        ${folderGlyph(36)}${icon('image', 32, 'opacity:0.7')}${icon('image', 32, 'opacity:0.7')}
      </div>
      <div>
        <div style="font-size:15px;font-weight:600;letter-spacing:-0.01em">3 items selected</div>
        <div style="font-size:12px;color:var(--text-2);margin-top:4px">1 folder, 2 files · 6.1 MB</div>
      </div>
      ${btn('Download 3 items', { kind: 'primary', ic: 'download', h: 36 })}
      <div style="display:flex;flex-direction:column">
        ${picked.map((e) => `<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--border);font-size:12px">${e.dir ? folderGlyph(16) : icon(e.ic, 16, 'color:var(--text-2)')}<span class="trunc" style="flex:1">${e.name}</span><span class="mono" style="color:var(--text-3)">${e.dir ? '—' : e.size}</span></div>`).join('')}
      </div>
      <div style="flex:1"></div>
      <div style="margin:0 -10px;display:flex;flex-direction:column;gap:2px">
        ${actionRow('folderMove', 'Move 3 items to…')}
        ${actionRow('trash', 'Delete 3 items', true)}
      </div>
    </aside>
  </div>
</main>`,
		{ dark }
	);
}

const compareCard = (label, size, date) => `
<div style="flex:1;padding:10px 12px;border-radius:6px;background:var(--surface-2);display:flex;flex-direction:column;gap:3px">
  <div style="font-size:11px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-3)">${label}</div>
  <div class="mono" style="font-size:13px">${size}</div>
  <div style="font-size:12px;color:var(--text-2)">${date}</div>
</div>`;

function conflictScreen({ dark = false } = {}) {
	const modal = dialog(
		'“store-front.jpg” already exists',
		`<p style="margin:0;color:var(--text-2);text-wrap:pretty">A file with this name is already in /Product Photos. Keep both renames yours to “store-front 2.jpg”.</p>
     <div style="display:flex;gap:10px">${compareCard('On server', '2.9 MB', 'Sep 4, 2026 · 17:31')}${compareCard('Yours', '3.4 MB', 'Today · 17:32')}</div>
     <div style="display:flex;align-items:center;gap:10px;font-size:12px;color:var(--text-2)">${checkbox(false)}<span>Do this for the remaining 2 files</span></div>`,
		`${btn('Skip')}${btn('Keep both')}${btn('Replace', { kind: 'primary' })}`,
		{ width: 440 }
	);
	return doc(
		`${sidebar({ nav: 'files', folder: 'Product Photos' })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ crumbs: ['Files', 'Product Photos'], right: filesHeaderRight('list') })}
  <div style="flex:1;min-height:0;overflow:hidden;padding:20px 24px;display:flex;flex-direction:column;gap:4px">
    ${listHead()}
    ${PHOTOS.slice(0, 7).map((e) => listRow({ ...e, kind: e.ic === 'image' ? 'PNG' : 'MP4', created: e.date })).join('')}
  </div>
</main>
<div style="position:absolute;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center">${modal}</div>`,
		{ dark, root: 'display:flex;position:relative;' }
	);
}

function folderUploadScreen({ dark = false } = {}) {
	return doc(
		`${sidebar({ nav: 'transfers' })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ title: 'Transfers', right: btn('Clear finished') })}
  <div style="flex:1;min-height:0;overflow:hidden;padding:20px 24px;display:flex;flex-direction:column;gap:28px">
    <section style="display:flex;flex-direction:column;gap:4px">
      ${sectionLabel('Active', '3')}
      <div style="display:flex;align-items:center;gap:14px;padding:12px 12px 12px 14px;border:1px solid var(--border);border-radius:8px;margin:6px 0 8px">
        ${folderGlyph(28)}
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;justify-content:space-between;gap:12px"><span class="trunc" style="font-weight:500">Uploading folder “2026-09” to /Product Photos</span><span class="mono" style="font-size:12px;color:var(--text-3)">38 / 128 files</span></div>
          <div style="height:4px;border-radius:2px;background:var(--surface-2);overflow:hidden"><div style="width:30%;height:100%;background:var(--accent)"></div></div>
          <div style="font-size:12px;color:var(--text-3)">412 MB of 1.3 GB · 3 folders created</div>
        </div>
        ${btn('Cancel all')}
      </div>
      ${transferRow({ ic: 'upload', name: 'day-01/IMG_2041.jpg', sub: 'to /Product Photos/2026-09/day-01 · 3.1 MB of 4.2 MB', pct: 74, right: '6.8 MB/s' })}
      ${transferRow({ ic: 'upload', name: 'day-01/IMG_2042.jpg', sub: 'to /Product Photos/2026-09/day-01 · 1.2 MB of 3.9 MB', pct: 31, right: '5.9 MB/s' })}
      ${transferRow({ ic: 'upload', name: 'day-02/IMG_2107.jpg', sub: 'to /Product Photos/2026-09/day-02 · 4.0 MB', pct: 0, right: 'Waiting', queued: true })}
    </section>
    <section style="display:flex;flex-direction:column;gap:4px">
      ${sectionLabel('Finished', '37')}
      ${transferRow({ ic: 'upload', name: 'day-01/IMG_2040.jpg', sub: 'to /Product Photos/2026-09/day-01 · 4.4 MB', pct: 100, right: '17:41', done: true })}
      ${transferRow({ ic: 'upload', name: 'day-01/IMG_2039.jpg', sub: 'to /Product Photos/2026-09/day-01 · 4.1 MB', pct: 100, right: '17:41', done: true })}
    </section>
  </div>
</main>`,
		{ dark }
	);
}

const RECENT = {
	Today: [
		{ ic: 'image', name: 'store-front.jpg', path: '/Product Photos', size: '3.4 MB', when: '17:32' },
		{ ic: 'sheet', name: 'sales-report-aug-2026.xlsx', path: '/Reports', size: '218 KB', when: '09:14' },
		{ ic: 'archive', name: 'pos-backup-2026-09-04.tar.gz', path: '/Backups', size: '1.2 GB', when: '02:00' }
	],
	Yesterday: [
		{ ic: 'image', name: 'banner-autumn.png', path: '/Product Photos/2026-09', size: '2.1 MB', when: '16:05' },
		{ ic: 'doc', name: 'opening-checklist.docx', path: '/Staff Docs', size: '24 KB', when: '09:41' }
	],
	'Earlier this week': [
		{ ic: 'doc', name: 'menu-board-v3.pdf', path: '/Reports', size: '6.1 MB', when: 'Mon 11:05' },
		{ ic: 'video', name: 'promo-loop.mp4', path: '/Product Photos', size: '412 MB', when: 'Mon 15:40' },
		{ ic: 'archive', name: 'supplier-contracts.zip', path: '/Backups', size: '48 MB', when: 'Sun 10:22' }
	]
};

const recentRow = (r) => `
<div style="display:grid;grid-template-columns:minmax(0,1fr) 90px 90px 36px;align-items:center;gap:12px;height:52px;padding:0 8px 0 12px;border-top:1px solid var(--border)">
  <div style="display:flex;align-items:center;gap:10px;min-width:0">
    ${icon(r.ic, 18, 'color:var(--text-2)')}
    <div style="min-width:0;display:flex;flex-direction:column;gap:1px"><span class="trunc">${r.name}</span><span class="trunc mono" style="font-size:11px;color:var(--text-3)">${r.path}</span></div>
  </div>
  <div class="mono" style="font-size:12px;color:var(--text-2);text-align:right">${r.size}</div>
  <div style="font-size:12px;color:var(--text-2);text-align:right">${r.when}</div>
  <div style="display:flex;justify-content:flex-end">${iconBtn('dots', { size: 28, dim: true })}</div>
</div>`;

function recentScreen({ dark = false } = {}) {
	return doc(
		`${sidebar({ nav: 'recent' })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ title: 'Recent', right: `<span style="font-size:12px;color:var(--text-3)">Recently modified on Lab SFTPGo · Indexed 2 min ago</span>${btn('Refresh', { ic: 'refresh' })}` })}
  <div style="flex:1;min-height:0;overflow:hidden;padding:20px 24px;display:flex;flex-direction:column;gap:24px">
    ${Object.entries(RECENT)
			.map(
				([label, rows]) => `
    <section style="display:flex;flex-direction:column;gap:4px">
      ${sectionLabel(label, String(rows.length))}
      <div style="display:flex;flex-direction:column">${rows.map(recentRow).join('')}</div>
    </section>`
			)
			.join('')}
  </div>
</main>`,
		{ dark }
	);
}

// ---------------------------------------------------------------------------
// Upload progress panel (bottom-right of Files) + drop overlay
// ---------------------------------------------------------------------------
const upBar = (pct, tone = 'var(--accent)') =>
	`<div style="height:3px;border-radius:2px;background:var(--surface-2);overflow:hidden"><div style="width:${pct}%;height:100%;background:${tone}"></div></div>`;

const upRow = ({ ic, name, sub, pct = null, right = '', state = 'active', hover = false, group = false }) => {
	const link = (t) => `<a href="#" style="font-size:12px;font-weight:500;white-space:nowrap">${t}</a>`;
	const trail = {
		active: iconBtn('x', { size: 24, dim: true }),
		queued: iconBtn('x', { size: 24, dim: true }),
		done: hover ? link('Show in folder') : icon('check', 14, 'color:var(--ok);margin:0 5px'),
		failed: link('Retry'),
		pending: btn('Resolve', { h: 24 })
	}[state];
	const tone = state === 'failed' ? 'var(--danger)' : state === 'pending' ? 'var(--warn)' : 'var(--text-3)';
	return `
<div style="display:flex;align-items:center;gap:10px;padding:8px 10px 8px 14px;border-top:1px solid var(--border);background:${hover ? 'var(--surface-2)' : 'transparent'}">
  <div style="width:18px;display:flex;justify-content:center">${group ? folderGlyph(18) : icon(ic, 16, `color:${state === 'failed' ? 'var(--danger)' : 'var(--text-2)'}`)}</div>
  <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px">
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline"><span class="trunc">${name}</span>${right ? `<span class="mono" style="font-size:11px;color:var(--text-3);white-space:nowrap">${right}</span>` : ''}</div>
    ${state === 'active' && pct !== null ? upBar(pct) : ''}
    <span class="trunc" style="font-size:11px;color:${tone}">${sub}</span>
  </div>
  <div style="display:flex;align-items:center;justify-content:flex-end;min-width:24px">${trail}</div>
</div>`;
};

const upPanel = ({ title, sub = '', pct = null, lead = '', rows = '', footer = '', collapsed = false, tone = 'var(--accent)' }) => `
<div style="width:380px;background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:var(--shadow);overflow:hidden;display:flex;flex-direction:column">
  <div style="display:flex;flex-direction:column;gap:8px;padding:${collapsed ? '8px 8px 8px 14px' : '12px 8px 12px 14px'}">
    <div style="display:flex;align-items:center;gap:10px">
      ${lead}
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">
        <div class="trunc" style="font-weight:600">${title}</div>
        ${sub ? `<div class="trunc" style="font-size:11px;color:var(--text-3)">${sub}</div>` : ''}
      </div>
      <span style="display:inline-flex;${collapsed ? 'transform:rotate(180deg)' : ''}">${iconBtn('chevronDown', { size: 26, dim: true })}</span>${iconBtn('x', { size: 26, dim: true })}
    </div>
    ${pct !== null ? upBar(pct, tone) : ''}
  </div>
  ${collapsed ? '' : `<div style="display:flex;flex-direction:column">${rows}</div>`}
  ${!collapsed && footer ? `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px 8px 14px;border-top:1px solid var(--border)">${footer}</div>` : ''}
</div>`;

const openTransfers = () => `<a href="#" style="font-size:12px;font-weight:500;color:var(--text-2)">Open Transfers</a>`;

const UP_ROWS = {
	group: upRow({ group: true, name: '2026-09', right: '38 / 128', pct: 30, sub: '412 MB of 1.3 GB · to /Product Photos' }),
	a1: upRow({ ic: 'image', name: 'IMG_2041.jpg', right: '74%', pct: 74, sub: '3.1 MB of 4.2 MB · 6.8 MB/s' }),
	a2: upRow({ ic: 'image', name: 'IMG_2042.jpg', right: '31%', pct: 31, sub: '1.2 MB of 3.9 MB · 5.9 MB/s' }),
	q: upRow({ ic: 'video', name: 'promo-loop-v2.mp4', right: 'Waiting', sub: '412 MB · to /Product Photos', state: 'queued' }),
	d1: upRow({ ic: 'image', name: 'counter-display.jpg', right: '17:41', sub: '2.9 MB · to /Product Photos', state: 'done', hover: true }),
	d2: upRow({ ic: 'doc', name: 'price-list.pdf', right: '17:40', sub: '1.1 MB · to /Product Photos', state: 'done' })
};

const uploadingPanel = () =>
	upPanel({
		title: 'Uploading 3 of 12 items',
		sub: '412 MB of 1.3 GB · about 2 min left',
		pct: 32,
		rows: UP_ROWS.group + UP_ROWS.a1 + UP_ROWS.a2 + UP_ROWS.q + UP_ROWS.d1 + UP_ROWS.d2,
		footer: openTransfers() + btn('Cancel all', { h: 26 })
	});

const photosMain = (overlay = '', banner = '', side = {}) => {
	const cols = 'minmax(0,1fr) 100px 170px 36px';
	return `
${sidebar({ folder: 'Product Photos', ...side })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface);position:relative">
  ${header({ crumbs: ['Files', 'Product Photos'], right: filesHeaderRight() })}
  ${banner}
  <div style="flex:1;min-height:0;overflow:hidden;padding:20px 24px;display:flex;flex-direction:column;gap:28px${banner ? ';opacity:0.55' : ''}">
    <section style="display:flex;flex-direction:column;gap:12px">
      ${sectionLabel('Folders', '2')}
      <div style="display:grid;grid-template-columns:repeat(5, minmax(0, 1fr));gap:12px">
        ${folderCard('2026-09', '38 items · uploading…')}
        ${folderCard('Archive', '64 items · Aug 2')}
      </div>
    </section>
    <section style="display:flex;flex-direction:column;gap:4px">
      ${sectionLabel('Files', '8')}
      <div style="display:flex;flex-direction:column">
        ${tableHead(cols, false)}
        ${[{ ic: 'image', name: 'counter-display.jpg', size: '2.9 MB', date: 'Sep 5, 2026 · 17:41' }, { ic: 'doc', name: 'price-list.pdf', size: '1.1 MB', date: 'Sep 5, 2026 · 17:40' }, ...PHOTO_FILES].map((f) => fileRow(f, cols, { kind: false })).join('')}
      </div>
    </section>
  </div>
  ${overlay}
</main>`;
};

const corner = (inner) => `<div style="position:absolute;right:20px;bottom:20px;z-index:2">${inner}</div>`;

const uploadPanelScreen = ({ dark = false } = {}) => doc(photosMain(corner(uploadingPanel())), { dark });

function uploadStatesSheet({ dark = false } = {}) {
	const col = (inner) => `<div style="display:flex;flex-direction:column;gap:28px">${inner}</div>`;
	const block = (cap, inner) => `<div style="display:flex;flex-direction:column;gap:10px">${caption(cap)}${inner}</div>`;
	const collapsed = upPanel({ title: 'Uploading 3 of 12 items · 42%', pct: 42, collapsed: true });
	const collapsedDone = upPanel({ title: '12 items uploaded', collapsed: true, lead: icon('check', 16, 'color:var(--ok)') });
	const done = upPanel({
		title: '12 items uploaded',
		sub: '1.3 GB to /Product Photos · 2 min 10 s',
		lead: icon('check', 16, 'color:var(--ok)'),
		rows:
			upRow({ group: true, name: '2026-09', right: '128 files', sub: '1.3 GB · to /Product Photos', state: 'done' }) +
			upRow({ ic: 'image', name: 'IMG_2041.jpg', right: '17:43', sub: '4.2 MB · to /Product Photos', state: 'done', hover: true }) +
			upRow({ ic: 'video', name: 'promo-loop-v2.mp4', right: '17:43', sub: '412 MB · to /Product Photos', state: 'done' }) +
			upRow({ ic: 'image', name: 'counter-display.jpg', right: '17:41', sub: '2.9 MB · to /Product Photos', state: 'done' }),
		footer: openTransfers()
	});
	const attention = upPanel({
		title: '9 of 12 uploaded · 1 failed',
		sub: '2 items are waiting for your decision',
		pct: 78,
		tone: 'var(--warn)',
		rows:
			upRow({ ic: 'image', name: 'store-front.jpg', sub: 'Already exists in /Product Photos', state: 'pending' }) +
			upRow({ ic: 'image', name: 'latte-art.jpg', sub: 'Already exists in /Product Photos', state: 'pending' }) +
			upRow({ ic: 'image', name: 'IMG_2050.jpg', sub: 'Couldn’t upload · connection lost', state: 'failed' }) +
			upRow({ ic: 'image', name: 'IMG_2051.jpg', right: '12%', pct: 12, sub: '0.5 MB of 4.0 MB · 6.1 MB/s' }),
		footer: openTransfers() + btn('Retry all', { h: 26 })
	});
	const cancel = dialog(
		'Cancel 9 remaining uploads?',
		`<p style="margin:0;color:var(--text-2);text-wrap:pretty">The 3 files already on the server stay there. Files that are half-way through are removed.</p>`,
		`${btn('Keep uploading')}${btn('Cancel uploads', { kind: 'danger' })}`,
		{ width: 380 }
	);
	return doc(
		`<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:32px;padding:24px 32px;align-items:start">
  ${col(block('Collapsed · in progress', collapsed) + block('Collapsed · done', collapsedDone) + block('Close while uploading', cancel))}
  ${col(block('All done', done))}
  ${col(block('Needs attention · conflicts and a failure', attention))}
</div>`,
		{ dark, root: 'display:block;' }
	);
}

const dropOverlay = () => `
<div style="position:absolute;inset:52px 0 0 0;background:var(--surface);opacity:0.92;z-index:1"></div>
<div style="position:absolute;inset:64px 12px 12px 12px;border:2px dashed var(--accent);border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;z-index:1">
  <div style="width:56px;height:56px;border-radius:28px;background:var(--accent-soft);color:var(--accent-text);display:inline-flex;align-items:center;justify-content:center">${icon('upload', 24)}</div>
  <div style="display:flex;flex-direction:column;gap:6px">
    <div style="font-size:15px;font-weight:600;letter-spacing:-0.01em">Drop to upload to /Product Photos</div>
    <div style="font-size:13px;color:var(--text-2)">6 items · folders keep their structure</div>
  </div>
</div>`;

const uploadDropScreen = ({ dark = false } = {}) =>
	doc(photosMain(dropOverlay() + corner(upPanel({ title: 'Uploading 3 of 12 items · 42%', pct: 42, collapsed: true }))), { dark });

// ---------------------------------------------------------------------------
// Trash, copy/paste menus, validation, undo, offline, skeleton
// ---------------------------------------------------------------------------
const TRASH = [
	{ ic: 'image', name: 'store-front.jpg', from: '/Product Photos', when: 'Today · 17:12', size: '3.4 MB', hover: true },
	{ dir: true, name: 'Drafts', from: '/Staff Docs', when: 'Today · 09:41', size: '12 items' },
	{ ic: 'doc', name: 'menu-board-v2.pdf', from: '/Reports', when: 'Yesterday · 16:05', size: '5.8 MB' },
	{ ic: 'sheet', name: 'sales-report-jul-2026.xlsx', from: '/Reports', when: 'Sep 1, 2026 · 09:14', size: '204 KB' },
	{ ic: 'archive', name: 'old-backup.tar.gz', from: '/Backups', when: 'Aug 28, 2026 · 02:00', size: '980 MB' }
];
const TRASH_COLS = 'minmax(0,1fr) 220px 170px 90px 190px';

const trashRow = (t) => `
<div style="display:grid;grid-template-columns:${TRASH_COLS};align-items:center;gap:12px;height:44px;padding:0 8px 0 12px;border-top:1px solid var(--border);background:${t.hover ? 'var(--surface-2)' : 'transparent'}">
  <div style="display:flex;align-items:center;gap:10px;min-width:0">${t.dir ? folderGlyph(18) : icon(t.ic, 18, 'color:var(--text-2)')}<span class="trunc">${t.name}</span></div>
  <div class="trunc mono" style="font-size:12px;color:var(--text-2)">${t.from}</div>
  <div style="font-size:12px;color:var(--text-2)">${t.when}</div>
  <div class="mono" style="font-size:12px;color:var(--text-2);text-align:right">${t.size}</div>
  <div style="display:flex;justify-content:flex-end;gap:6px;${t.hover ? '' : 'visibility:hidden'}">${btn('Restore', { h: 28 })}${btn('Delete now', { h: 28, kind: 'danger' })}</div>
</div>`;

function trashScreen({ dark = false } = {}) {
	return doc(
		`${sidebar({ nav: 'trash' })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ title: 'Trash', right: `${btn('Restore all')}${btn('Empty Trash', { ic: 'trash', kind: 'danger' })}` })}
  <div style="flex:1;min-height:0;overflow:hidden;padding:20px 24px;display:flex;flex-direction:column;gap:16px">
    <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid var(--border);border-radius:8px;font-size:12px;color:var(--text-2)">
      ${icon('info', 15, 'color:var(--text-3)')}<span style="flex:1">Deleted items stay here for 30 days, then they are removed from Lab SFTPGo. They are hidden from Files and search, even with hidden files shown.</span><span class="mono" style="color:var(--text-3)">5 items · 1.0 GB</span>
    </div>
    <section style="display:flex;flex-direction:column;gap:4px">
      <div style="display:grid;grid-template-columns:${TRASH_COLS};align-items:center;gap:12px;height:34px;padding:0 8px 0 12px;font-size:12px;font-weight:500;color:var(--text-3)">
        <div>Name</div><div>Original location</div><div style="display:flex;align-items:center;gap:4px;color:var(--text-2)">Deleted ${icon('chevronDown', 12)}</div><div style="text-align:right">Size</div><div></div>
      </div>
      ${TRASH.map(trashRow).join('')}
    </section>
  </div>
</main>`,
		{ dark }
	);
}

function bitsSheet({ dark = false } = {}) {
	const col = (inner) => `<div style="display:flex;flex-direction:column;gap:28px">${inner}</div>`;
	const block = (cap, inner) => `<div style="display:flex;flex-direction:column;gap:10px">${caption(cap)}${inner}</div>`;
	const menu = (inner) => `<div style="width:240px;background:var(--surface);border:1px solid var(--border);border-radius:8px;box-shadow:var(--shadow);padding:6px">${inner}</div>`;

	const itemMenu = menu(
		menuItem('open', 'Open', '⏎') + menuItem('eye', 'Preview', 'Space') + menuItem('download', 'Download', '⌘D') + menuDivider() +
		menuItem('copy', 'Copy', '⌘C', { hover: true }) + menuItem('folderMove', 'Cut', '⌘X') + menuItem('copy', 'Duplicate') + menuItem('folderMove', 'Copy to…') + menuItem('folderMove', 'Move to…') + menuDivider() +
		menuItem('pencil', 'Rename') + menuItem('link', 'Copy WebDAV URL') + menuDivider() + menuItem('trash', 'Move to Trash', '⌘⌫', { danger: true })
	);
	const areaMenu = menu(
		menuItem('folderPlus', 'New folder', '⇧⌘N') + menuItem('upload', 'Upload files…', '⌘U') + menuItem('copy', 'Paste 2 items', '⌘V', { hover: true }) + menuDivider() +
		menuItem('check', 'Select all', '⌘A') + menuItem('refresh', 'Refresh', '⌘R')
	);
	const copyTo = dialog(
		'Copy 2 items to…',
		`<div style="display:flex;flex-direction:column;gap:2px;border:1px solid var(--border);border-radius:6px;padding:6px">
      ${treeRow('Lab SFTPGo', 0)}${treeRow('Backups', 1)}${treeRow('Product Photos', 1)}${treeRow('Reports', 1)}${treeRow('Archive', 2, true)}${treeRow('Staff Docs', 1)}
    </div><div style="font-size:12px;color:var(--text-3)">Names already in Archive get “ copy” added.</div>`,
		`${btn('Cancel')}${btn('Copy here', { kind: 'primary' })}`
	);
	const invalid = (label, value, err) => `
<div style="display:flex;flex-direction:column;gap:6px">
  <label style="font-size:12px;font-weight:500;color:var(--text-2)">${label}</label>
  <div style="display:flex;align-items:center;height:36px;padding:0 12px;border-radius:6px;background:var(--surface);border:1px solid var(--danger);box-shadow:0 0 0 3px var(--danger-soft)"><span style="flex:1;font-size:13px">${value}</span></div>
  <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--danger)">${icon('info', 13)}<span>${err}</span></div>
</div>`;
	const newFolder = dialog('New folder', invalid('Name', 'Q3/Reports', 'Names can’t contain “/”.'), `${btn('Cancel')}<span style="opacity:0.5;pointer-events:none">${btn('Create', { kind: 'primary' })}</span>`);
	const rename = dialog('Rename', invalid('Name', 'store-front.jpg', 'Something named “store-front.jpg” already exists here.'), `${btn('Cancel')}<span style="opacity:0.5">${btn('Rename', { kind: 'primary' })}</span>`);

	const undo = `<div style="display:flex;flex-direction:column;gap:10px">
  ${toast('trash', 'var(--text-2)', 'Moved “store-front.jpg” to Trash', 'Undo')}
  ${toast('check', 'var(--ok)', 'Renamed to “menu-board-v4.pdf”', 'Undo')}
  ${toast('check', 'var(--ok)', 'Moved 3 items to /Reports/Archive', 'Undo')}
</div>`;
	const errors = `<div style="display:flex;flex-direction:column;gap:10px">
  ${toast('info', 'var(--danger)', 'You don’t have permission to change /Backups.')}
  ${toast('info', 'var(--danger)', '“promo-loop.mp4” is locked by another app on the server. Try again in a moment.')}
  ${toast('info', 'var(--danger)', 'The server is out of storage. Free up space or ask your admin for more quota.')}
</div>`;
	const failedRows = `<div style="width:760px;display:flex;flex-direction:column">
  <div style="display:flex;align-items:center;gap:8px;padding:0 0 8px;font-size:12px;color:var(--text-3)">${icon('info', 13)}<span>Transfers can’t be paused. Cancel one and retry it later instead.</span></div>
  ${transferRow({ ic: 'upload', name: 'IMG_2050.jpg', sub: 'to /Product Photos/2026-09 · 4.0 MB', failed: true, right: 'Can’t reach the server' })}
  ${transferRow({ ic: 'download', name: 'pos-backup-2026-09-04.tar.gz', sub: 'to ~/Downloads · 1.2 GB', failed: true, right: 'Cancelled' })}
</div>`;
	const online = `<div style="display:flex;align-items:center;gap:10px;padding:8px 14px;border-radius:8px;background:var(--ok-soft);color:var(--text);font-size:12px">${icon('check', 15, 'color:var(--ok)')}<span style="flex:1">Back online. Product Photos was refreshed.</span></div>`;

	return doc(
		`<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:32px;padding:24px 32px;align-items:start">
  ${col(block('Item menu · copy, cut, duplicate, trash', itemMenu) + block('Empty area menu', areaMenu))}
  ${col(block('Copy to…', copyTo) + block('Name validation · New folder', newFolder) + block('Name validation · Rename', rename))}
  ${col(block('Undo toasts · 6 s', undo) + block('Friendly errors', errors) + block('Back online', online))}
  <div style="grid-column:1 / -1">${block('Transfers · failed rows', failedRows)}</div>
</div>`,
		{ dark, root: 'display:block;' }
	);
}

const bone = (w, h = 12, r = 4) => `<span style="display:inline-block;width:${w};height:${h}px;border-radius:${r}px;background:var(--surface-2);flex:none"></span>`;

function filesLoadingScreen({ dark = false } = {}) {
	const cols = 'minmax(0,1fr) 100px 170px 130px 36px';
	const card = () => `<div style="display:flex;flex-direction:column;gap:14px;padding:14px;border:1px solid var(--border);border-radius:8px">${bone('36px', 30, 6)}<div style="display:flex;flex-direction:column;gap:8px">${bone('70%')}${bone('45%', 10)}</div></div>`;
	const row = (w) => `<div style="display:grid;grid-template-columns:${cols};align-items:center;gap:12px;height:44px;padding:0 8px 0 12px;border-top:1px solid var(--border)"><div style="display:flex;align-items:center;gap:10px">${bone('18px', 18)}${bone(w)}</div><div style="display:flex;justify-content:flex-end">${bone('48px', 10)}</div>${bone('110px', 10)}${bone('70px', 10)}<div></div></div>`;
	return doc(
		`${sidebar({ folder: 'Receipts 2026' })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ crumbs: ['Files', 'Receipts 2026'], right: filesHeaderRight() })}
  <div style="flex:1;min-height:0;overflow:hidden;padding:20px 24px;display:flex;flex-direction:column;gap:28px">
    <section style="display:flex;flex-direction:column;gap:12px">
      ${sectionLabel('Folders')}
      <div style="display:grid;grid-template-columns:repeat(5, minmax(0, 1fr));gap:12px">${card()}${card()}${card()}</div>
    </section>
    <section style="display:flex;flex-direction:column;gap:4px">
      ${sectionLabel('Files')}
      <div style="display:flex;flex-direction:column">${tableHead(cols)}${['42%', '61%', '35%', '55%', '48%', '66%', '30%', '52%'].map(row).join('')}</div>
    </section>
  </div>
</main>`,
		{ dark }
	);
}

const offlineBanner = () => `
<div style="display:flex;align-items:center;gap:10px;padding:9px 24px;background:var(--warn-soft);border-bottom:1px solid var(--border);font-size:12px">
  ${icon('info', 15, 'color:var(--warn)')}
  <span style="flex:1"><b style="font-weight:600">Can’t reach Lab SFTPGo.</b> Showing what was loaded last. Retrying in 8 s…</span>
  <a href="#" style="font-size:12px;font-weight:500">Retry now</a>
</div>`;

const filesOfflineScreen = ({ dark = false } = {}) => doc(photosMain('', offlineBanner()), { dark });

// ---------------------------------------------------------------------------
// First-run intro: connect as a network drive (Finder / File Explorer)
// ---------------------------------------------------------------------------
const BO = readFileSync(join(import.meta.dirname, '../../build/appicon.icon/Assets/bo-mark.svg'), 'utf8');
const bo = (size) => BO.replace('<svg ', `<svg width="${size}" height="${size}" `);

const finderWindow = (label, win = false) => `
<div style="position:absolute;left:-30px;bottom:-40px;width:420px;height:230px;transform:rotate(-7deg);border-radius:12px;background:var(--surface);box-shadow:0 30px 60px rgba(27,26,23,0.18);border:1px solid var(--border);display:flex;overflow:hidden">
  <div style="width:150px;background:var(--bg);border-right:1px solid var(--border);padding:14px 10px;display:flex;flex-direction:column;gap:6px">
    ${win ? '' : `<div style="display:flex;gap:5px;padding:0 4px 6px">${['#ec6a5e', '#f4bf4f', '#61c554'].map((c) => `<span style="width:9px;height:9px;border-radius:5px;background:${c}"></span>`).join('')}</div>`}
    <div style="font-size:9px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-3);padding:0 6px">${win ? 'This PC' : 'Favorites'}</div>
    ${['Desktop', 'Documents', 'Downloads'].map((n) => `<div style="display:flex;align-items:center;gap:6px;padding:3px 6px;font-size:11px;color:var(--text-2)">${folderGlyph(12)}${n}</div>`).join('')}
    <div style="font-size:9px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-3);padding:8px 6px 0">${win ? 'Network locations' : 'Locations'}</div>
    <div style="display:flex;align-items:center;gap:6px;padding:4px 6px;font-size:11px;font-weight:600;border-radius:5px;background:var(--accent-soft);color:var(--accent-text)">${icon('server', 12)}${label}</div>
  </div>
  <div style="flex:1;padding:14px 16px;display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;align-content:start">
    ${['Backups', 'Product Photos', 'Reports', 'Receipts 2026', 'Staff Docs'].map((n) => `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;font-size:9px;color:var(--text-2);text-align:center">${folderGlyph(30)}<span>${n}</span></div>`).join('')}
  </div>
</div>`;

const introBanner = (win = false) => `
<div style="position:relative;height:250px;overflow:hidden;background:linear-gradient(135deg, var(--accent-soft) 0%, var(--bg) 55%, var(--surface-2) 100%)">
  <div style="position:absolute;width:360px;height:360px;border-radius:50%;background:var(--accent);opacity:0.14;filter:blur(60px);left:60px;top:-120px"></div>
  <div style="position:absolute;width:260px;height:260px;border-radius:50%;background:var(--warn);opacity:0.10;filter:blur(60px);right:-40px;bottom:-120px"></div>
  ${finderWindow('Soteria', win)}
  <div style="position:absolute;right:56px;bottom:22px;filter:drop-shadow(0 18px 30px rgba(27,26,23,0.25))">${bo(150)}</div>
</div>`;

const benefit = (ic, title, text) => `
<div style="display:flex;gap:12px;align-items:flex-start">
  <span style="width:30px;height:30px;border-radius:8px;background:var(--surface-2);color:var(--text-2);display:inline-flex;align-items:center;justify-content:center;flex:none">${icon(ic, 15)}</span>
  <div style="display:flex;flex-direction:column;gap:2px"><div style="font-weight:600">${title}</div><div style="font-size:12px;color:var(--text-2);text-wrap:pretty">${text}</div></div>
</div>`;

function introCard({ win = false } = {}) {
	const where = win ? 'File Explorer' : 'Finder';
	return `
<div style="width:560px;border-radius:16px;overflow:hidden;background:var(--surface);border:1px solid var(--border);box-shadow:0 30px 80px rgba(0,0,0,0.35)">
  ${introBanner(win)}
  <div style="padding:26px 28px 24px;display:flex;flex-direction:column;gap:20px">
    <div style="display:flex;flex-direction:column;gap:8px">
      <div style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--accent-text)">New · Network drive</div>
      <h1 style="margin:0;font-size:22px;font-weight:600;letter-spacing:-0.02em">${win ? 'Map Soteria as a network drive' : 'Open Soteria right in Finder'}</h1>
      <p style="margin:0;font-size:13px;color:var(--text-2);text-wrap:pretty">Connect Lab as a drive named <b style="font-weight:600;color:var(--text)">Soteria</b>. Your files show up next to your local folders in ${where}, without copying anything to this ${win ? 'PC' : 'Mac'}.</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">
      ${benefit('open', 'Open and save from any app', `Edit a spreadsheet or a photo in the app you already use.`)}
      ${benefit('folderMove', `Drag and drop in ${where}`, `Move files between Soteria and your ${win ? 'PC' : 'Mac'} like any other folder.`)}
      ${benefit('refresh', 'No sync, no duplicates', 'Nothing is copied to your disk. You always see the latest version of every file.')}
    </div>
    <div style="display:flex;align-items:center;gap:10px">
      ${btn(`Connect to ${where}`, { kind: 'primary', h: 36, ic: 'server' })}${btn('Not now', { h: 36 })}
    </div>
  </div>
</div>`;
}

const scrim = (inner) => `<div style="position:absolute;inset:0;background:rgba(27,26,23,0.45);display:flex;align-items:center;justify-content:center">${inner}</div>`;

const introScreen = ({ dark = false, win = false } = {}) =>
	doc(`${photosMain()}${scrim(introCard({ win }))}`, { dark, root: 'display:flex;position:relative;' });

const drivePill = (state) =>
	({
		on: `<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--text-2)"><span style="width:7px;height:7px;border-radius:4px;background:var(--ok)"></span>Connected · /Volumes/Soteria</span>`,
		off: `<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--text-3)"><span style="width:7px;height:7px;border-radius:4px;background:var(--border-2)"></span>Not connected</span>`,
		busy: `<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--text-2)"><span style="width:7px;height:7px;border-radius:4px;background:var(--warn)"></span>Connecting…</span>`,
		error: `<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--danger)"><span style="width:7px;height:7px;border-radius:4px;background:var(--danger)"></span>Couldn’t connect: Finder didn’t answer in 20 s.</span>`
	})[state];

const driveSection = (state) =>
	settingsSection(
		'Network drive',
		'Shows this server in Finder as a drive named Soteria, using the same login.',
		`${settingRow('Show Soteria in Finder', drivePill(state), toggle(state !== 'off'))}
     ${settingRow('Connect automatically', 'Mount the drive each time you sign in to this server.', toggle(state === 'on'))}
     <div style="display:flex;gap:8px">${state === 'on' ? btn('Show in Finder', { ic: 'open' }) : ''}${state === 'error' ? btn('Try again', { ic: 'refresh' }) : ''}${btn('What is this?')}</div>`
	);

function settingsDriveScreen({ dark = false } = {}) {
	return doc(
		`${sidebar({ gear: true })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ title: 'Settings' })}
  <div style="flex:1;min-height:0;overflow:hidden;padding:0 24px 20px">
    <div style="max-width:720px;display:flex;flex-direction:column">
      ${settingsSection(
				'Account',
				'The server this window is signed in to.',
				`<div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--border);border-radius:8px">
          <span style="width:36px;height:36px;border-radius:8px;background:var(--surface-2);color:var(--text-2);display:inline-flex;align-items:center;justify-content:center;flex:none">${icon('server', 16)}</span>
          <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px"><div style="font-weight:500">Lab SFTPGo</div><div class="trunc mono" style="font-size:12px;color:var(--text-3)">http://192.168.1.194:8000/dav · signed in as kietle</div></div>
          ${btn('Sign out', { ic: 'signOut' })}
        </div>`
			)}
      ${driveSection('on')}
      ${settingsSection('Appearance', 'Follows macOS by default.', settingRow('Theme', '', segmented(['System', 'Light', 'Dark'], 'System')))}
      ${settingsSection(
				'Downloads',
				'Where files land when you download them.',
				`${settingRow('Save to', '~/Downloads', btn('Change…'))}${settingRow('Ask where to save each time', '', toggle(false))}`
			)}
    </div>
  </div>
</main>`,
		{ dark }
	);
}

function driveStatesSheet({ dark = false } = {}) {
	const block = (cap, inner) => `<div style="display:flex;flex-direction:column;gap:10px">${caption(cap)}<div style="max-width:720px">${inner}</div></div>`;
	const toasts = `<div style="display:flex;flex-direction:column;gap:10px">
  ${toast('check', 'var(--ok)', 'Soteria is now in your Finder sidebar.', 'Show')}
  ${toast('info', 'var(--danger)', 'Couldn’t connect the drive. Finder didn’t answer in 20 s.', 'Retry')}
  ${toast('check', 'var(--ok)', 'Soteria was ejected from Finder.')}
</div>`;
	return doc(
		`<div style="display:flex;flex-direction:column;gap:28px;padding:24px 32px">
  ${block('Settings · Network drive · off (default)', driveSection('off'))}
  ${block('Settings · Network drive · connecting', driveSection('busy'))}
  ${block('Settings · Network drive · error', driveSection('error'))}
  ${block('Toasts', toasts)}
</div>`,
		{ dark, root: 'display:block;' }
	);
}

// ---------------------------------------------------------------------------
// Sidebar without the server button; account menu under the avatar
// ---------------------------------------------------------------------------
const sidebarScreen = ({ dark = false, menu = false } = {}) =>
	doc(
		`${sidebar({ nav: 'files', account: true, menu })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ crumbs: ['Files'], right: filesHeaderRight('list') })}
  <div style="flex:1;min-height:0;overflow:hidden;padding:20px 24px;display:flex;flex-direction:column;gap:4px">
    ${listHead()}
    ${FOLDERS.map((f) => listRow({ dir: true, name: f, date: 'Sep 4, 2026 · 15:12', created: '—' })).join('')}
    ${ROOT_FILES.slice(0, 3).map((f) => listRow({ ...f, created: '—' })).join('')}
  </div>
</main>`,
		{ dark }
	);

// ---------------------------------------------------------------------------
// Collapsible sidebar (Granola-style): toggle in the title bar, slide out, dot when hidden
// ---------------------------------------------------------------------------
const filesBodyList = (wide = false) => `
<div style="flex:1;min-height:0;overflow:hidden;padding:20px 24px;display:flex;flex-direction:column;gap:4px">
  ${listHead()}
  ${FOLDERS.map((f) => listRow({ dir: true, name: f, date: 'Sep 4, 2026 · 15:12', created: '—' })).join('')}
  ${ROOT_FILES.slice(0, wide ? 5 : 3).map((f) => listRow({ ...f, created: '—' })).join('')}
</div>`;

const sidebarOpenScreen = ({ dark = false } = {}) =>
	doc(
		`${sidebar({ nav: 'files', account: true, toggle: true })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ crumbs: ['Files'], right: filesHeaderRight('list') })}
  ${filesBodyList()}
</main>`,
		{ dark }
	);

const sidebarHiddenScreen = ({ dark = false } = {}) =>
	doc(
		`<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ crumbs: ['Files'], right: filesHeaderRight('list'), lead: `<div style="display:flex;align-items:center;gap:14px;margin-right:4px">${trafficLights()}${sidebarToggle(false, true)}</div>` })}
  ${filesBodyList(true)}
</main>`,
		{ dark }
	);

// storyboard: four moments of the collapse
const frame = (t, side, main, label) => `
<div style="display:flex;flex-direction:column;gap:10px">
  <div style="position:relative;width:360px;height:225px;border:1px solid var(--border);border-radius:8px;overflow:hidden;background:var(--surface)">
    <div style="position:absolute;top:0;bottom:0;left:0;width:68px;background:var(--bg);border-right:1px solid var(--border);transform:translateX(${side.x}px);opacity:${side.o}">
      <div style="display:flex;flex-direction:column;gap:6px;padding:16px 8px 0">${[0, 1, 2, 3].map(() => `<div style="height:8px;border-radius:4px;background:var(--border-2);opacity:${side.labels}"></div>`).join('')}</div>
    </div>
    <div style="position:absolute;top:0;bottom:0;left:${main.left}px;right:0">
      <div style="height:16px;border-bottom:1px solid var(--border)"></div>
      <div style="padding:10px;display:flex;flex-direction:column;gap:6px">${[0, 1, 2, 3, 4].map((i) => `<div style="height:8px;width:${70 - i * 8}%;border-radius:4px;background:var(--surface-2)"></div>`).join('')}</div>
    </div>
  </div>
  <div style="display:flex;justify-content:space-between;font-size:12px"><span class="mono" style="color:var(--text-3)">${t}</span><span style="color:var(--text-2)">${label}</span></div>
</div>`;

function sidebarMotionSheet({ dark = false } = {}) {
	const row = (label, value) => `<div style="display:flex;justify-content:space-between;gap:16px;padding:8px 0;border-top:1px solid var(--border);font-size:13px"><span style="color:var(--text-2)">${label}</span><span class="mono" style="text-align:right">${value}</span></div>`;
	return doc(
		`<div style="display:flex;flex-direction:column;gap:28px;padding:24px 32px">
  <div style="display:flex;flex-direction:column;gap:12px">
    ${caption('Collapse · 350 ms · power3.inOut')}
    <div style="display:flex;gap:20px">
      ${frame('0 ms', { x: 0, o: 1, labels: 1 }, { left: 68 }, 'Sidebar mở, nội dung 240px từ mép')}
      ${frame('120 ms', { x: -22, o: 1, labels: 0.4 }, { left: 46 }, 'Sidebar trượt trái, chữ tan trước')}
      ${frame('240 ms', { x: -52, o: 0.5, labels: 0 }, { left: 16 }, 'Nội dung nới theo cùng ease')}
      ${frame('350 ms', { x: -68, o: 0, labels: 0 }, { left: 0 }, 'Ẩn hẳn, toggle sang trạng thái đóng')}
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;max-width:1100px">
    <div>
      ${caption('GSAP timeline (gsap-core + Flip)')}
      ${row('Layout', 'Flip.getState([aside, main]) → toggle class → Flip.from(state)')}
      ${row('Duration / ease', '0.35 s · power3.inOut')}
      ${row('Sidebar', 'x: -240, autoAlpha: 0 (transform, không animate width)')}
      ${row('Labels & rows', 'autoAlpha 0, x: -8, stagger 0.015 (chạy trước 60 ms)')}
      ${row('Toggle icon', 'pane fill 0.35 → 0, chấm hiện khi ẩn')}
      ${row('Mở lại', 'tl.reversed(!tl.reversed()) — cùng timeline, đảo chiều')}
      ${row('Reduced motion', 'gsap.matchMedia: duration 0, không stagger')}
    </div>
    <div>
      ${caption('Hành vi')}
      ${row('Toggle', 'Chỉ bằng nút cạnh 3 nút cửa sổ · hover hiện tooltip "Hide sidebar"')}
      ${row('Khi ẩn', 'Toggle chuyển lên header chính, cạnh 3 nút cửa sổ')}
      ${row('Chấm trên toggle', 'Có transfer đang chạy hoặc offline · màu accent / warn')}
      ${row('Nhớ trạng thái', 'prefs.sidebar = open | hidden, theo máy')}
      ${row('Cửa sổ hẹp', 'Dưới 900px: tự ẩn, mở lại khi rộng ra')}
      ${row('Kéo thả & phím', 'Không đổi; Files vẫn nhận drop khi sidebar ẩn')}
    </div>
  </div>
</div>`,
		{ dark, root: 'display:block;' }
	);
}

// ---------------------------------------------------------------------------
// Windows: frameless window, macOS-style lights drawn by the app
// ---------------------------------------------------------------------------
const LIGHTS = [
	{ bg: '#FF5F57', ring: '#E0443E', ink: '#4D0000', glyph: '<path d="M3.6 3.6l4.8 4.8M8.4 3.6l-4.8 4.8"/>' },
	{ bg: '#FEBC2E', ring: '#DEA123', ink: '#995700', glyph: '<path d="M2.8 6h6.4"/>' },
	{ bg: '#28C840', ring: '#1AAB29', ink: '#006500', glyph: '<path d="M2.8 2.8h3.4L2.8 6.2zM9.2 9.2H5.8L9.2 5.8z" fill="currentColor" stroke="none"/>' }
];
const RESTORE = '<path d="M2.4 6.2h3.8V2.4zM9.6 5.8H5.8v3.8z" fill="currentColor" stroke="none"/>';

const light = (i, { hover = false, dim = false, restore = false } = {}) => {
	const l = LIGHTS[i];
	const g = i === 2 && restore ? RESTORE : l.glyph;
	return `<span style="width:12px;height:12px;border-radius:6px;flex:none;display:inline-flex;align-items:center;justify-content:center;background:${dim ? 'var(--border-2)' : l.bg};box-shadow:${dim ? 'none' : `inset 0 0 0 0.5px ${l.ring}`};color:${l.ink}">${hover ? `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">${g}</svg>` : ''}</span>`;
};
const lights = (o = {}) => `<div style="display:flex;gap:8px;align-items:center">${[0, 1, 2].map((i) => light(i, o)).join('')}</div>`;

const WALL = 'radial-gradient(110% 90% at 18% 8%, #3C6EA8 0%, #223B63 40%, #121A2C 100%)';

const taskbar = ({ badge = '', tray = false } = {}) => {
	const tb = (inner, on = false) =>
		`<span style="position:relative;width:40px;height:40px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;background:${on ? 'rgba(255,255,255,0.10)' : 'transparent'}">${inner}${on ? '<span style="position:absolute;left:14px;right:14px;bottom:2px;height:3px;border-radius:2px;background:#9CC4F5"></span>' : ''}</span>`;
	const start = `<span style="display:grid;grid-template-columns:1fr 1fr;gap:2px;width:16px;height:16px">${[0, 1, 2, 3].map(() => '<span style="background:#5BA7F0;border-radius:1px"></span>').join('')}</span>`;
	const search = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8E8E8" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>';
	const explorer = '<span style="width:18px;height:14px;border-radius:2px;background:linear-gradient(#F6D46A,#E4B93B)"></span>';
	const app = `<span style="position:relative;width:20px;height:20px;border-radius:5px;background:#F6F5F1;display:inline-flex;align-items:center;justify-content:center">${bo(16)}${badge ? `<span style="position:absolute;right:-7px;bottom:-6px;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#E5484D;color:#fff;font-size:10px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;border:1.5px solid rgba(28,28,30,0.9)">${badge}</span>` : ''}</span>`;
	const sys = (svg) => `<span style="width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;color:#E8E8E8">${svg}</span>`;
	const trayArea = tray
		? `<div style="position:absolute;right:120px;top:0;bottom:0;display:flex;align-items:center;gap:2px">
    ${sys('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 15l6-6 6 6"/></svg>')}
    <span style="width:28px;height:28px;border-radius:4px;background:rgba(255,255,255,0.12);display:inline-flex;align-items:center;justify-content:center;color:#fff">${boGlyph(17)}</span>
    ${sys('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 9a15 15 0 0 1 20 0M6 13a9 9 0 0 1 12 0M10 17a3 3 0 0 1 4 0"/><circle cx="12" cy="20" r="0.5" fill="currentColor"/></svg>')}
    ${sys('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6"/></svg>')}
    ${sys('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 11v2"/><rect x="4" y="9" width="11" height="6" fill="currentColor" stroke="none"/></svg>')}
  </div>`
		: '';
	return `
<div style="position:absolute;left:0;right:0;bottom:0;height:48px;background:rgba(28,28,30,0.86);border-top:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;gap:4px">
  ${tb(start)}${tb(search)}${tb(explorer)}${tb(app, true)}
  ${trayArea}
  <div class="mono" style="position:absolute;right:18px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;font-size:11px;line-height:1.35;color:#E8E8E8;text-align:right">17:42<br>9/6/2026</div>
</div>`;
};

// monochrome Bo for menu bar / tray: folder outline, ears and eyes in one colour
const boGlyph = (s, color = 'currentColor') => `<svg width="${s}" height="${s}" viewBox="14 36 212 200" fill="none" stroke="${color}" stroke-width="15" stroke-linejoin="round">
  <path d="M30 66a14 14 0 0 1 14-14h38l14 18h100a14 14 0 0 1 14 14v114a14 14 0 0 1-14 14H44a14 14 0 0 1-14-14z"/>
  <circle cx="72" cy="102" r="20" fill="${color}" stroke="none"/><circle cx="168" cy="102" r="20" fill="${color}" stroke="none"/>
  <ellipse cx="90" cy="150" rx="11" ry="13" fill="${color}" stroke="none"/><ellipse cx="150" cy="150" rx="11" ry="13" fill="${color}" stroke="none"/>
</svg>`;

// 1440 × 900 Windows desktop; put whatever floats on it in `extra`
const winDesktop = (extra, { dark = false, badge = '', tray = false } = {}) =>
	doc(
		`<div style="position:absolute;inset:0;background:${WALL}"></div>
${extra}
${taskbar({ badge, tray })}`,
		{ dark, w: 1440, h: 900, root: 'display:block;position:relative;' }
	);

// 1440 × 900 desktop with the 1280 × 800 window on it, taskbar below
const winScene = (inner, { dark = false } = {}) =>
	winDesktop(
		`<div style="position:absolute;left:80px;top:26px;width:1280px;height:800px;display:flex;border-radius:8px;overflow:hidden;background:var(--bg);box-shadow:0 0 0 1px rgba(0,0,0,0.35),0 32px 80px rgba(0,0,0,0.5)">${inner}</div>`,
		{ dark }
	);

const winMain = (wide, lead = '') => `
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ crumbs: ['Files'], right: filesHeaderRight('list'), lead })}
  ${filesBodyList(wide)}
</main>`;

const winOpenScreen = ({ dark = true } = {}) =>
	winScene(`${sidebar({ nav: 'files', account: true, toggle: true, win: true })}${winMain(false)}`, { dark });
const winHiddenScreen = ({ dark = false } = {}) =>
	winScene(winMain(true, `<div style="display:flex;align-items:center;gap:14px;margin-right:4px">${lights()}${sidebarToggle(false, true)}</div>`), { dark });

function winBitsSheet({ dark = true } = {}) {
	const block = (cap, inner) => `<div style="display:flex;flex-direction:column;gap:10px">${caption(cap)}${inner}</div>`;
	const note = (label, text) => `<div style="font-size:12px;font-weight:500">${label}</div><div style="font-size:12px;color:var(--text-3);line-height:1.4">${text}</div>`;

	const row = (o, label, text) => `
<div style="display:flex;flex-direction:column;gap:8px">
  <div style="width:240px;height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 12px 0 16px;border:1px solid var(--border);border-radius:8px 8px 0 0;background:var(--bg)">${lights(o)}${sidebarToggle(true)}</div>
  <div style="height:64px;display:flex;align-items:center;padding-left:16px"><div style="transform:scale(3);transform-origin:left center">${lights(o)}</div></div>
  ${note(label, text)}
</div>`;
	const states = `<div style="display:grid;grid-template-columns:repeat(4, 240px);gap:24px">
  ${row({}, 'Idle', 'Plain dots, like macOS. The whole 52 px row drags the window.')}
  ${row({ hover: true }, 'Hover', 'Glyphs appear on all three while the pointer is over any of them.')}
  ${row({ hover: true, restore: true }, 'Maximized · hover', 'Green shows the restore glyph instead of zoom.')}
  ${row({ dim: true }, 'Window inactive', 'All three go grey when another window has focus.')}
</div>`;

	const miniDots = () => `<span style="display:flex;gap:3px">${LIGHTS.map((l) => `<span style="width:5px;height:5px;border-radius:3px;background:${l.bg}"></span>`).join('')}</span>`;
	const miniBar = `<div style="height:22px;flex:none;display:flex;align-items:center;justify-content:space-between;padding:0 6px 0 8px">${miniDots()}<span style="width:10px;height:8px;border-radius:2px;border:1px solid var(--border-2)"></span></div>`;
	const wasted = '<div style="height:22px;flex:none;margin:3px 4px 0;border:1px dashed var(--danger);border-radius:3px"></div>';
	const bones = (top) => `
<div style="flex:1;display:flex;min-height:0;background:var(--surface)">
  <div style="width:96px;flex:none;background:var(--bg);border-right:1px solid var(--border);display:flex;flex-direction:column">
    ${top}
    <div style="display:flex;flex-direction:column;gap:5px;padding:6px 8px 0">${[0, 1, 2, 3].map(() => '<div style="height:6px;border-radius:3px;background:var(--border-2)"></div>').join('')}</div>
  </div>
  <div style="flex:1;display:flex;flex-direction:column">
    <div style="height:22px;border-bottom:1px solid var(--border)"></div>
    <div style="padding:8px;display:flex;flex-direction:column;gap:5px">${[0, 1, 2, 3, 4].map((i) => `<div style="height:6px;width:${70 - i * 8}%;border-radius:3px;background:var(--surface-2)"></div>`).join('')}</div>
  </div>
</div>`;
	const nativeBar = `
<div style="height:24px;flex:none;display:flex;align-items:center;gap:6px;padding:0 8px;background:#F3F3F3;color:#1B1B1B;font-size:10px;font-family:'Segoe UI Variable','Segoe UI',system-ui,sans-serif">
  <span style="width:12px;height:12px;border-radius:3px;background:#1B1A17;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:8px">b</span>
  <span>Soteria</span><span style="flex:1"></span>
  <svg width="90" height="10" viewBox="0 0 90 10" fill="none" stroke="#1B1B1B" stroke-width="1"><path d="M10 5h10"/><rect x="40.5" y="0.5" width="9" height="9"/><path d="M71 1l8 8M79 1l-8 8"/></svg>
</div>`;
	const mini = (win, label, text, max = false) => `
<div style="display:flex;flex-direction:column;gap:8px;width:380px">
  <div style="position:relative;width:380px;height:240px;border-radius:8px;overflow:hidden;background:${WALL}">
    <div style="position:absolute;${max ? 'inset:0 0 18px 0;border-radius:0' : 'left:26px;top:18px;right:26px;bottom:34px;border-radius:5px'};display:flex;flex-direction:column;overflow:hidden;background:var(--bg);box-shadow:0 0 0 1px rgba(0,0,0,0.35),0 14px 32px rgba(0,0,0,0.45)">${win}</div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:18px;background:rgba(28,28,30,0.86)"></div>
  </div>
  ${note(label, text)}
</div>`;
	const frames = `<div style="display:flex;gap:24px">
  ${mini(nativeBar + bones(wasted), 'Before · native caption', 'Windows paints the bar in its own theme, not the app’s. The 52 px row under it sits empty.')}
  ${mini(bones(miniBar), 'After · frameless', 'No caption. The row the sidebar already has becomes the title bar, lights at top-left like macOS.')}
  ${mini(bones(miniBar), 'Maximized', 'Fills the work area with square corners. Green restores; double-clicking the row does the same.', true)}
</div>`;

	const rule = (k, v) => `<div style="display:flex;gap:10px;font-size:12px;line-height:1.45"><span style="flex:none;width:84px;font-weight:500;color:var(--text-2)">${k}</span><span>${v}</span></div>`;
	const rules = `<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:10px 40px">
  ${rule('Buttons', 'Red closes, yellow minimizes, green maximizes and restores. Alt+F4 and Alt+Space keep working.')}
  ${rule('Drag', 'The whole 52 px row moves the window. Double-click toggles maximize.')}
  ${rule('Resize', '8 px edge handles. Drag to a screen edge or press Win+Z to snap. The Snap Layouts flyout on hover is gone.')}
  ${rule('Frame', 'Windows 11 draws the rounded corners and shadow. Windows 10 shows square corners.')}
  ${rule('Geometry', 'Same as macOS: 12 px dots, 8 px apart, 20 px hit targets. Content starts at 76 px when the sidebar is hidden.')}
  ${rule('Elsewhere', 'Taskbar and Alt-Tab title becomes “Soteria”. macOS keeps its native buttons; nothing changes there.')}
</div>`;

	return doc(
		`<div style="display:flex;flex-direction:column;gap:28px;padding:24px 32px">
  ${block('Window controls · Windows only', states)}
  ${block('Frame', frames)}
  ${block('Behaviour', rules)}
</div>`,
		{ dark, root: 'display:block;' }
	);
}

// ---------------------------------------------------------------------------
// Background mode: menu bar / tray icon, dock badge, notifications
// ---------------------------------------------------------------------------
const SF = "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif";
const SEGOE = "'Segoe UI Variable','Segoe UI',system-ui,sans-serif";
const glass = (pct) => `color-mix(in srgb, var(--surface) ${pct}%, transparent)`;

// one menu spec, two native looks
const trayRows = (state, win = false, update = '') => {
	const where = win ? 'File Explorer' : 'Finder';
	const drive = state === 'nodrive' ? [{ k: 'item', t: 'Connect Drive' }] : [{ k: 'item', t: `Show in ${where}` }, { k: 'item', t: 'Disconnect Drive' }];
	const xfer = { idle: 'No transfers', busy: 'Uploading 3 of 12 · 42%', nodrive: 'No transfers', offline: '2 transfers waiting' }[state];
	return [
		{ k: 'head', t: 'Soteria', s: state === 'offline' ? 'Offline' : 'Connected', ok: state !== 'offline' },
		{ k: 'sub', t: 'kietle · 192.168.1.194' },
		{ k: 'sep' },
		{ k: 'item', t: 'Open Soteria', hl: true },
		...(update ? [{ k: 'item', t: update }] : []),
		{ k: 'sep' },
		{ k: 'info', t: xfer },
		{ k: 'item', t: 'Open Transfers' },
		{ k: 'sep' },
		...drive,
		{ k: 'sep' },
		{ k: 'item', t: win ? 'Exit' : 'Quit Soteria', kbd: win ? '' : '⌘Q' }
	];
};

const dot = (ok) => `<span style="width:7px;height:7px;border-radius:4px;background:${ok ? 'var(--ok)' : 'var(--warn)'};display:inline-block;margin-right:5px"></span>`;

const macMenu = (rows, { hover = false } = {}) => {
	const row = (r) => {
		if (r.k === 'sep') return '<div style="height:1px;margin:5px 10px;background:var(--border-2)"></div>';
		if (r.k === 'head') return `<div style="display:flex;align-items:center;justify-content:space-between;padding:3px 10px 0"><span style="font-weight:600">${r.t}</span><span style="font-size:11px;color:var(--text-3)">${dot(r.ok)}${r.s}</span></div>`;
		if (r.k === 'sub') return `<div style="padding:0 10px 3px;font-size:11px;color:var(--text-3)">${r.t}</div>`;
		const on = hover && r.hl;
		return `<div style="height:22px;padding:0 10px;border-radius:5px;display:flex;align-items:center;justify-content:space-between;background:${on ? '#3478F6' : 'transparent'};color:${on ? '#fff' : r.k === 'info' ? 'var(--text-3)' : 'var(--text)'}"><span>${r.t}</span>${r.kbd ? `<span style="font-size:12px;color:${on ? 'rgba(255,255,255,0.8)' : 'var(--text-3)'}">${r.kbd}</span>` : ''}</div>`;
	};
	return `<div style="width:264px;padding:5px;border-radius:9px;background:${glass(90)};backdrop-filter:blur(30px);border:1px solid var(--border-2);box-shadow:0 12px 40px rgba(0,0,0,0.4);font-family:${SF};font-size:13px;line-height:1.3">${rows.map(row).join('')}</div>`;
};

const winMenu = (rows, { hover = false } = {}) => {
	const row = (r) => {
		if (r.k === 'sep') return '<div style="height:1px;margin:4px 0;background:var(--border)"></div>';
		if (r.k === 'head') return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px 0"><span style="font-weight:600">${r.t}</span><span style="font-size:12px;color:var(--text-3)">${dot(r.ok)}${r.s}</span></div>`;
		if (r.k === 'sub') return `<div style="padding:0 12px 6px;font-size:12px;color:var(--text-3)">${r.t}</div>`;
		const on = hover && r.hl;
		return `<div style="height:36px;padding:0 12px;border-radius:4px;display:flex;align-items:center;background:${on ? 'var(--surface-2)' : 'transparent'};color:${r.k === 'info' ? 'var(--text-3)' : 'var(--text)'}">${r.t}</div>`;
	};
	return `<div style="width:272px;padding:4px;border-radius:8px;background:${glass(96)};border:1px solid var(--border);box-shadow:0 8px 32px rgba(0,0,0,0.4);font-family:${SEGOE};font-size:14px">${rows.map(row).join('')}</div>`;
};

// macOS desktop: menu bar with the status item open, Dock with a badge
const MAC_WALL = 'radial-gradient(120% 100% at 80% 100%, #6B4E9B 0%, #2E3F7A 45%, #141B33 100%)';
const appTile = (size, badge = '') => `
<span style="position:relative;width:${size}px;height:${size}px;border-radius:${size * 0.24}px;background:#F6F5F1;display:inline-flex;align-items:center;justify-content:center;flex:none">${bo(size * 0.78)}${badge ? `<span style="position:absolute;top:-6px;right:-8px;min-width:22px;height:22px;padding:0 6px;border-radius:11px;background:#FF3B30;color:#fff;font-size:13px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;font-family:${SF}">${badge}</span>` : ''}</span>`;

const macBar = () => `
<div style="position:absolute;left:0;right:0;top:0;height:24px;background:rgba(20,20,24,0.5);backdrop-filter:blur(20px);display:flex;align-items:center;gap:18px;padding:0 16px;font-family:${SF};font-size:13px;color:#fff">
  <span style="font-size:15px;line-height:1"></span><span style="font-weight:600">Finder</span><span>File</span><span>Edit</span><span>View</span><span>Go</span><span>Window</span><span>Help</span>
  <span style="flex:1"></span>
  <span style="height:22px;padding:0 5px;border-radius:5px;background:rgba(255,255,255,0.22);display:inline-flex;align-items:center">${boGlyph(17, '#fff')}</span>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M2 9a15 15 0 0 1 20 0M6 13a9 9 0 0 1 12 0M10 17a3 3 0 0 1 4 0"/></svg>
  <svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="#fff" stroke-width="1.5"><rect x="0.75" y="0.75" width="21" height="12.5" rx="3"/><path d="M24 5v4"/><rect x="2.5" y="2.5" width="14" height="9" rx="1.5" fill="#fff" stroke="none"/></svg>
  <span>Sat 6 Sep&nbsp;&nbsp;17:42</span>
</div>`;

const dock = (badge) => `
<div style="position:absolute;left:50%;bottom:8px;transform:translateX(-50%);height:68px;padding:0 10px;border-radius:20px;background:rgba(40,40,44,0.5);backdrop-filter:blur(30px);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;gap:10px">
  ${['#4FA3FF,#1B63D6', '#F4F4F6,#CFCFD6', '#FFB340,#E0740A', '#5DDC7A,#1E9E3F'].map((g) => `<span style="width:50px;height:50px;border-radius:12px;background:linear-gradient(160deg,${g})"></span>`).join('')}
  <span style="width:1px;height:46px;background:rgba(255,255,255,0.2);margin:0 2px"></span>
  <span style="position:relative;display:inline-flex">${appTile(50, badge)}<span style="position:absolute;left:50%;bottom:-9px;width:4px;height:4px;border-radius:2px;background:rgba(255,255,255,0.75);transform:translateX(-50%)"></span></span>
</div>`;

const trayMacScreen = ({ dark = true } = {}) =>
	doc(
		`<div style="position:absolute;inset:0;background:${MAC_WALL}"></div>
${macBar()}
<div style="position:absolute;top:30px;right:10px">${macMenu(trayRows('busy'), { hover: true })}</div>
${dock('3')}`,
		{ dark, w: 1440, h: 900, root: 'display:block;position:relative;' }
	);

const trayWinScreen = ({ dark = true } = {}) =>
	winDesktop(`<div style="position:absolute;right:120px;bottom:60px">${winMenu(trayRows('busy', true), { hover: true })}</div>`, { dark, badge: '3', tray: true });

// detail sheet
const macNotif = (title, body, action = '') => `
<div style="width:356px;display:flex;gap:12px;align-items:center;padding:11px 12px;border-radius:14px;background:${glass(92)};border:1px solid var(--border);box-shadow:0 10px 30px rgba(0,0,0,0.3);font-family:${SF}">
  ${appTile(36)}
  <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">${title}</div><div class="trunc" style="font-size:12px;color:var(--text-2)">${body}</div></div>
  ${action ? `<span style="font-size:12px;padding:5px 10px;border-radius:7px;background:var(--surface-2);flex:none">${action}</span>` : ''}
</div>`;
const winNotif = (title, body, action = '') => `
<div style="width:340px;padding:14px 16px 12px;border-radius:8px;background:${glass(96)};border:1px solid var(--border);box-shadow:0 8px 32px rgba(0,0,0,0.35);font-family:${SEGOE};display:flex;flex-direction:column;gap:10px">
  <div style="display:flex;gap:12px;align-items:flex-start">${appTile(40)}<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:600">${title}</div><div style="font-size:13px;color:var(--text-2)">${body}</div><div style="font-size:12px;color:var(--text-3);margin-top:4px">Soteria</div></div></div>
  ${action ? `<div style="display:flex;justify-content:flex-end">${btn(action, { h: 30 })}</div>` : ''}
</div>`;

function backgroundBitsSheet({ dark = true } = {}) {
	const block = (cap, inner) => `<div style="display:flex;flex-direction:column;gap:10px">${caption(cap)}${inner}</div>`;
	const labeled = (inner, label) => `<div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">${inner}<div style="font-size:12px;color:var(--text-3)">${label}</div></div>`;
	const menus = `<div style="display:flex;gap:20px;align-items:flex-start">
  ${labeled(macMenu(trayRows('idle')), 'Idle · drive connected')}
  ${labeled(macMenu(trayRows('busy')), 'Transferring')}
  ${labeled(macMenu(trayRows('nodrive')), 'Drive not connected')}
  ${labeled(macMenu(trayRows('offline')), 'Offline · header turns amber')}
</div>`;
	const glyph = (extra = '', op = 1) => `<span style="position:relative;display:inline-flex;width:54px;height:54px;align-items:center;justify-content:center;border-radius:12px;background:var(--surface-2);color:var(--text);opacity:${op}">${boGlyph(34)}${extra}</span>`;
	const icons = `<div style="display:flex;gap:20px">
  ${labeled(glyph(), 'Idle')}
  ${labeled(glyph('<span style="position:absolute;top:8px;right:8px;width:9px;height:9px;border-radius:5px;background:var(--accent);border:2px solid var(--surface-2)"></span>'), 'Transferring · dot')}
  ${labeled(glyph('', 0.45), 'Offline · dimmed')}
</div>`;
	const notifs = `<div style="display:flex;flex-direction:column;gap:10px">
  ${macNotif('12 files uploaded', 'to Product Photos · 1.3 GB', 'Show')}
  ${macNotif('2 files couldn’t be uploaded', 'Connection lost. Open Transfers to retry.', 'Retry')}
  ${macNotif('Soteria is still running', 'Find it in the menu bar. Change this in Settings.')}
</div>`;
	const settings = `<div style="width:440px">${settingsSection(
		'Background',
		'What happens when you close the window.',
		settingRow('Keep running in the background', 'Shows an icon in the menu bar so the network drive stays connected.', toggle(true)) +
			settingRow('Notify when transfers finish', 'Only while Soteria is in the background.', toggle(true))
	)}</div>`;
	const quit = dialog(
		'Quit Soteria?',
		'<div style="font-size:13px;color:var(--text-2);line-height:1.5">3 transfers are still running and will be cancelled. The network drive will be disconnected.</div>',
		`${btn('Cancel')}${btn('Quit anyway', { kind: 'danger' })}`,
		{ width: 340 }
	);
	const rule = (k, v) => `<div style="display:flex;gap:10px;font-size:12px;line-height:1.45"><span style="flex:none;width:96px;font-weight:500;color:var(--text-2)">${k}</span><span>${v}</span></div>`;
	const rules = `<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:10px 40px">
  ${rule('Close', 'Red button hides the window; the app stays in the menu bar or tray. Quit via the menu, ⌘Q or Exit.')}
  ${rule('First hide', 'One “Soteria is still running” notification the first time the window is hidden, never again.')}
  ${rule('Badge', 'Dock and taskbar badge = running transfers, cleared when the queue is empty.')}
  ${rule('Notify', 'One per finished queue, only while the window is hidden or another app is in front. Failures offer Retry.')}
  ${rule('Setting off', 'Closing the window quits and ejects the drive, like today. The icon disappears.')}
  ${rule('Icon', 'Bo outline as a template icon: dot while transferring, dimmed when offline.')}
</div>`;
	return doc(
		`<div style="display:flex;flex-direction:column;gap:26px;padding:24px 32px">
  ${block('Menu · four states', menus)}
  <div style="display:grid;grid-template-columns:356px 440px 1fr;gap:40px;align-items:start">
    <div style="display:flex;flex-direction:column;gap:26px">${block('Notifications · macOS', notifs)}${block('Menu bar icon', icons)}</div>
    ${block('Settings · Background', settings)}
    <div style="display:flex;flex-direction:column;gap:26px">${block('Quit with transfers running', quit)}${block('Notification · Windows', winNotif('12 files uploaded', 'to Product Photos · 1.3 GB', 'Show in folder'))}</div>
  </div>
  ${block('Behaviour', rules)}
</div>`,
		{ dark, root: 'display:block;', h: 960 }
	);
}

// ---------------------------------------------------------------------------
// Self-update: dialog states, Settings › Updates, sidebar pill, tray row
// ---------------------------------------------------------------------------
const boTile = (size, badge = '') => {
	const mark = {
		ok: ['var(--ok)', '<path d="M5 12.5l4.5 4.5L19 7"/>'],
		danger: ['var(--danger)', '<path d="M12 6v8M12 18h.01"/>'],
		warn: ['var(--warn)', '<path d="M12 6v8M12 18h.01"/>']
	}[badge];
	return `<span style="position:relative;width:${size}px;height:${size}px;border-radius:${Math.round(size * 0.24)}px;background:var(--surface-2);display:inline-flex;align-items:center;justify-content:center;flex:none">${bo(Math.round(size * 0.74))}${
		mark
			? `<span style="position:absolute;right:-5px;bottom:-5px;width:18px;height:18px;border-radius:9px;background:${mark[0]};border:2px solid var(--surface);display:inline-flex;align-items:center;justify-content:center"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${mark[1]}</svg></span>`
			: ''
	}</span>`;
};

const RELEASE_NOTES = [
	'Soteria now updates itself from GitHub Releases',
	'Windows: frameless window with macOS-style controls',
	'A warning when storage passes 90%',
	'Refresh shows progress instead of doing nothing'
];

const notesBox = () => `
<div style="display:flex;flex-direction:column;gap:8px;padding:12px 14px;border:1px solid var(--border);border-radius:8px;background:var(--bg)">
  <div style="font-size:12px;font-weight:600">What’s new in 0.2.0</div>
  <ul style="margin:0;padding:0 0 0 16px;display:flex;flex-direction:column;gap:3px;font-size:12.5px;color:var(--text-2);line-height:1.5">${RELEASE_NOTES.map((n) => `<li>${n}</li>`).join('')}</ul>
  <a href="#" style="font-size:12px;display:inline-flex;align-items:center;gap:4px">Full release notes${icon('open', 12)}</a>
</div>`;

const callout = (tone, text) =>
	`<div style="display:flex;gap:10px;padding:10px 12px;border-radius:6px;background:var(--${tone}-soft);color:var(--${tone});font-size:12px;line-height:1.5">${icon('info', 15, 'margin-top:1px')}<span>${text}</span></div>`;

const dlProgress = (pct, text, right) => `
<div style="display:flex;flex-direction:column;gap:8px">
  <div style="height:6px;border-radius:3px;background:var(--surface-2);overflow:hidden"><div style="width:${pct}%;height:100%;border-radius:3px;background:var(--accent)"></div></div>
  <div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:var(--text-2)">${text}</span><span class="mono" style="color:var(--text-3)">${right}</span></div>
</div>`;

const para = (t) => `<p style="margin:0;font-size:13px;color:var(--text-2);text-wrap:pretty">${t}</p>`;

function updateCard(state, { xfers = 0, win = false } = {}) {
	const left = (t) => `<span style="margin-right:auto">${btn(t, { kind: 'ghost' })}</span>`;
	const s = {
		available: {
			title: 'Soteria 0.2.0 is available',
			sub: 'You have 0.1.0 · 6.5 MB · Released Sep 6',
			body: notesBox(),
			foot: `${left('Skip this version')}${btn('Later')}${btn('Update now', { kind: 'primary' })}`
		},
		downloading: {
			title: 'Downloading Soteria 0.2.0',
			sub: 'You can keep working. Nothing changes until you restart.',
			body: notesBox() + dlProgress(34, 'Downloading · 2.2 MB of 6.5 MB', '3.1 MB/s · 2 s left'),
			foot: `${left('Cancel')}${btn('Hide')}`
		},
		ready: {
			badge: 'ok',
			title: 'Ready to update to 0.2.0',
			sub: 'Downloaded and verified',
			body: `${para('Soteria quits and reopens as 0.2.0. It takes a few seconds.')}${xfers ? callout('warn', `${xfers} transfers are still running. They stop when Soteria quits and can be retried from Transfers.`) : ''}`,
			foot: `${btn('Later')}${btn('Restart & update', { kind: 'primary' })}`
		},
		error: {
			badge: 'danger',
			title: 'Couldn’t update to 0.2.0',
			sub: 'Download failed',
			body: callout('danger', 'The file didn’t match the checksum published with the release. Nothing on this Mac was changed.'),
			foot: `${btn('Download from GitHub', { ic: 'open' })}${btn('Try again', { kind: 'primary' })}`
		},
		blocked: {
			badge: 'warn',
			title: 'Can’t update automatically here',
			sub: 'Soteria 0.2.0 is available',
			body: para(
				win
					? 'Soteria is installed in Program Files, which needs administrator rights to change. Download the new installer instead; future installs go to your user folder and update in place.'
					: 'Soteria is running from the disk image, so it can’t replace itself. Drag it to Applications, open it from there and check again.'
			),
			foot: `${btn('Later')}${btn('Download 0.2.0', { kind: 'primary', ic: 'open' })}`
		}
	}[state];
	return `
<div style="width:440px;background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:var(--shadow);padding:20px;display:flex;flex-direction:column;gap:16px">
  <div style="display:flex;gap:14px;align-items:center">
    ${boTile(44, s.badge)}
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">
      <div style="font-size:15px;font-weight:600;letter-spacing:-0.01em">${s.title}</div>
      <div style="font-size:12px;color:var(--text-2)">${s.sub}</div>
    </div>
  </div>
  ${s.body}
  <div style="display:flex;align-items:center;justify-content:flex-end;gap:8px">${s.foot}</div>
</div>`;
}

const updatePill = (v) => `
<div style="margin:0 12px 6px;display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;background:var(--surface);border:1px solid var(--border);font-size:12px">
  <span style="width:7px;height:7px;border-radius:4px;background:var(--ok);flex:none"></span>
  <span class="trunc" style="flex:1;color:var(--text-2)">Soteria ${v} is ready</span>
  <a href="#" style="font-weight:500">Restart</a>
</div>`;

const updateScreen = ({ dark = false, state = 'available', xfers = 0 } = {}) =>
	doc(`${photosMain('', '', state === 'ready' ? { update: '0.2.0' } : {})}${scrim(updateCard(state, { xfers }))}`, {
		dark,
		root: 'display:flex;position:relative;'
	});

const updateStatus = (state) => {
	const s = {
		uptodate: ['var(--ok)', 'Up to date · checked 5 minutes ago', btn('Check for updates', { ic: 'refresh' })],
		checking: ['var(--warn)', 'Checking…', `<span style="opacity:0.5">${btn('Check for updates', { ic: 'refresh' })}</span>`],
		available: ['var(--accent)', '0.2.0 available · 6.5 MB', btn('Update…', { kind: 'primary' })],
		ready: ['var(--ok)', '0.2.0 downloaded · restart to finish', btn('Restart & update', { kind: 'primary' })],
		error: ['var(--danger)', 'Couldn’t check: api.github.com didn’t answer', btn('Try again', { ic: 'refresh' })],
		dev: ['var(--border-2)', 'Development build · updates are off', '']
	}[state];
	const color = state === 'error' ? 'var(--danger)' : state === 'dev' ? 'var(--text-3)' : 'var(--text-2)';
	return `
<div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--border);border-radius:8px">
  ${boTile(36)}
  <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">
    <div style="font-weight:500">Soteria 0.1.0</div>
    <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:${color}"><span style="width:7px;height:7px;border-radius:4px;background:${s[0]};flex:none"></span><span class="trunc">${s[1]}</span></div>
  </div>
  ${s[2]}
</div>`;
};

const updatesSection = (state) =>
	settingsSection(
		'Updates',
		'New versions come from GitHub Releases and install in place.',
		`${updateStatus(state)}
     ${settingRow('Check for updates automatically', 'At launch and every 6 hours. Nothing installs without asking you.', toggle(true))}`
	);

function settingsUpdatesScreen({ dark = false, state = 'available' } = {}) {
	return doc(
		`${sidebar({ gear: true })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ title: 'Settings' })}
  <div style="flex:1;min-height:0;overflow:hidden;padding:0 24px 20px">
    <div style="max-width:720px;display:flex;flex-direction:column">
      ${settingsSection('Account', 'The server this window is signed in to.', accountCard)}
      ${driveSection('on')}
      ${settingsSection(
				'Background',
				'What happens when you close the window.',
				settingRow('Keep running in the background', 'Shows an icon in the menu bar so the network drive stays connected.', toggle(true)) +
					settingRow('Notify when transfers finish', 'Only while Soteria is in the background.', toggle(true))
			)}
      ${updatesSection(state)}
    </div>
  </div>
</main>`,
		{ dark }
	);
}

function updateStatesSheet({ dark = true } = {}) {
	const block = (cap, inner) => `<div style="display:flex;flex-direction:column;gap:10px">${caption(cap)}${inner}</div>`;
	return doc(
		`<div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:32px;padding:28px;align-items:start">
  ${block('1 · Update available', updateCard('available'))}
  ${block('2 · Downloading · Hide keeps it going', updateCard('downloading'))}
  ${block('3 · Ready · transfers still running', updateCard('ready', { xfers: 3 }))}
  ${block('Checksum mismatch', updateCard('error'))}
  ${block('macOS · running from the DMG', updateCard('blocked'))}
  ${block('Windows · old Program Files install', updateCard('blocked', { win: true }))}
</div>`,
		{ dark, w: 1440, h: 800, root: 'display:block;' }
	);
}

function updateBitsSheet({ dark = true } = {}) {
	const block = (cap, inner) => `<div style="display:flex;flex-direction:column;gap:10px">${caption(cap)}${inner}</div>`;
	const labeled = (inner, label) => `<div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">${inner}<div style="font-size:12px;color:var(--text-3)">${label}</div></div>`;
	const states = `<div style="display:flex;flex-direction:column;gap:10px">${['uptodate', 'checking', 'available', 'ready', 'error', 'dev'].map(updateStatus).join('')}</div>`;
	const rule = (k, v) => `<div style="display:flex;gap:10px;font-size:12px;line-height:1.45"><span style="flex:none;width:96px;font-weight:500;color:var(--text-2)">${k}</span><span>${v}</span></div>`;
	const rules = `<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:10px 40px">
  ${rule('Check', 'At launch and every 6 hours while running, plus “Check for updates” in Settings and in the app menu. Never on development builds.')}
  ${rule('Source', 'GitHub Releases of this repo. One zip per platform: Soteria-&lt;v&gt;-darwin-arm64 / darwin-amd64 / windows-amd64, verified against SHA256SUMS.txt before anything is touched.')}
  ${rule('Dialog', 'Appears once per new version while the window is open. Later = not again this launch. Skip this version = not until an even newer one.')}
  ${rule('Download', 'Runs in the background; Hide keeps it going and the dialog comes back when it is ready. Nothing is installed until you choose Restart.')}
  ${rule('Restart', 'Soteria quits, a helper swaps Soteria.app / Soteria.exe and reopens it. Running transfers stop after a warning; the drive is ejected like on any quit.')}
  ${rule('Background', 'Window hidden: a system notification with Restart, and a “Restart to update” row in the menu bar or tray menu.')}
  ${rule('Can’t update', 'Running from the DMG or an old Program Files install → link to the GitHub release instead. The Windows installer moves to per-user (no UAC) so in-place updates work.')}
</div>`;
	return doc(
		`<div style="display:flex;flex-direction:column;gap:26px;padding:24px 32px">
  <div style="display:grid;grid-template-columns:500px minmax(0,1fr);gap:40px;align-items:start">
    ${block('Settings · Updates · six states', states)}
    <div style="display:flex;flex-direction:column;gap:26px">
      ${block('Menu bar · update ready', labeled(macMenu(trayRows('idle', false, 'Restart to update · 0.2.0')), 'Row appears only while an update is downloaded'))}
      ${block('Notification · window hidden', macNotif('Soteria 0.2.0 is ready', 'Restart to finish updating.', 'Restart'))}
      ${block('Sidebar · after “Later” on Ready', `<div style="width:240px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding-top:10px">${updatePill('0.2.0')}<div style="padding:12px 16px 12px;display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--border)"><div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:var(--text-2)">Storage</span><span class="mono" style="color:var(--text-3)">48.2 / 200 GB</span></div>${segBar(6)}</div></div>`)}
    </div>
  </div>
  ${block('Behaviour', rules)}
</div>`,
		{ dark, root: 'display:block;', h: 900 }
	);
}

// ---------------------------------------------------------------------------
// Drag to move, folder totals, launch at login
// ---------------------------------------------------------------------------

// A folder card or row under the pointer during an internal drag.
const dropRing = 'box-shadow:0 0 0 2px var(--accent) inset;background:var(--accent-soft);border-color:var(--accent)';

const folderCardDrop = (name, meta, { over = false, dim = false, sel = false } = {}) => `
<div style="display:flex;flex-direction:column;gap:14px;padding:14px;border:1px solid var(--border);border-radius:8px;background:var(--surface);${over ? dropRing : ''}${sel ? ';border-color:var(--accent);background:var(--accent-soft)' : ''};${dim ? 'opacity:0.4' : ''}">
  ${folderGlyph(36)}
  <div style="display:flex;flex-direction:column;gap:2px">
    <div class="trunc" style="font-weight:500">${name}</div>
    <div style="font-size:12px;color:${over ? 'var(--accent-text)' : 'var(--text-3)'}">${over ? 'Move here' : meta}</div>
  </div>
</div>`;

const folderRowDrop = (name, meta, cols, { over = false, blocked = false } = {}) => `
<div style="display:grid;grid-template-columns:${cols};align-items:center;gap:12px;height:44px;padding:0 8px 0 12px;border-top:1px solid var(--border);border-radius:6px;${over ? dropRing : 'border-color:var(--border)'}">
  <div style="display:flex;align-items:center;gap:10px;min-width:0">${folderGlyph(18)}<span class="trunc">${name}</span></div>
  <div style="font-size:12px;color:var(--text-2);text-align:right">—</div>
  <div style="font-size:12px;color:${over ? 'var(--accent-text)' : blocked ? 'var(--text-3)' : 'var(--text-2)'}">${over ? 'Move here' : blocked ? 'Already here' : meta}</div>
  <div style="display:flex;justify-content:flex-end">${blocked ? icon('x', 15, 'color:var(--text-3)') : ''}</div>
</div>`;

// The item that follows the pointer: one row for a single item, a count badge for many.
const dragGhost = (label, count = 0, { ic = null } = {}) => `
<div style="display:inline-flex;align-items:center;gap:9px;padding:7px 11px;border-radius:8px;background:var(--surface);border:1px solid var(--border-2);box-shadow:var(--shadow);font-size:13px">
  ${ic ? icon(ic, 16, 'color:var(--text-2)') : folderGlyph(18)}
  <span class="trunc" style="max-width:180px">${label}</span>
  ${count ? `<span class="mono" style="min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:var(--accent);color:#fff;font-size:11px;font-weight:600;display:inline-flex;align-items:center;justify-content:center">${count}</span>` : ''}
</div>`;

const crumbDrop = (over = false) => `
<div style="display:flex;align-items:center;gap:8px;font-size:13px">
  <span style="padding:3px 7px;border-radius:5px;${over ? 'background:var(--accent-soft);box-shadow:0 0 0 2px var(--accent) inset;color:var(--accent-text);font-weight:500' : 'color:var(--text-2)'}">Files</span>
  <span style="color:var(--text-3)">/</span>
  <span style="color:var(--text)">Product Photos</span>
</div>`;

// Files screen mid-drag: the Logos folder is being dragged onto 2026-09.
function dragMoveScreen({ dark = false } = {}) {
	const cols = 'minmax(0,1fr) 90px 170px 36px';
	return doc(
		`${sidebar({ folder: 'Product Photos' })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface);position:relative">
  <header style="height:52px;flex:none;display:flex;align-items:center;gap:12px;padding:0 20px;border-bottom:1px solid var(--border)">
    ${crumbDrop()}
    <div style="flex:1"></div>
    ${filesHeaderRight()}
  </header>
  <div style="flex:1;min-height:0;overflow:hidden;padding:20px 24px;display:flex;flex-direction:column;gap:28px">
    <section style="display:flex;flex-direction:column;gap:12px">
      ${sectionLabel('Folders', '4')}
      <div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:12px">
        ${folderCardDrop('2026-08', '41 items · Aug 31')}
        ${folderCardDrop('2026-09', '12 items · Sep 4', { over: true })}
        ${folderCardDrop('Logos', '9 items · Jun 2', { dim: true })}
        ${folderCardDrop('Menu Boards', '18 items · Aug 28')}
      </div>
    </section>
    <section style="display:flex;flex-direction:column;gap:4px">
      ${sectionLabel('Files', '6')}
      <div style="display:flex;flex-direction:column">
        ${tableHead(cols, false)}
        ${PHOTO_FILES.map((f) => fileRow(f, cols, { kind: false })).join('')}
      </div>
    </section>
  </div>
  <div style="position:absolute;left:436px;top:196px">${dragGhost('Logos')}</div>
</main>`,
		{ dark, root: 'display:flex;position:relative;' }
	);
}

function dragMoveBitsSheet({ dark = true } = {}) {
	const block = (cap, inner) => `<div style="display:flex;flex-direction:column;gap:10px">${caption(cap)}${inner}</div>`;
	const labeled = (inner, label) => `<div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">${inner}<div style="font-size:12px;color:var(--text-3)">${label}</div></div>`;
	const cols = 'minmax(0,1fr) 90px 170px 36px';

	const targets = `<div style="display:flex;flex-direction:column;gap:14px;width:520px">
  ${labeled(`<div style="width:100%">${folderRowDrop('2026-09', '12 items · Sep 4', cols, { over: true })}</div>`, 'Row under the pointer · accent ring, “Move here”')}
  ${labeled(`<div style="width:100%">${folderRowDrop('Product Photos', 'The folder you are in', cols, { blocked: true })}</div>`, 'Refused · the items already live here (no ring, no drop)')}
  ${labeled(`<div style="display:flex;gap:12px;width:340px">${folderCardDrop('2026-09', '12 items', { over: true })}${folderCardDrop('Logos', 'Being dragged', { dim: true })}</div>`, 'Card view · same ring; the dragged folder dims')}
  ${labeled(crumbDrop(true), 'Breadcrumb · drop to move up a level')}
</div>`;

	const ghosts = `<div style="display:flex;flex-direction:column;gap:14px">
  ${labeled(dragGhost('Logos'), 'One folder')}
  ${labeled(dragGhost('store-front.jpg', 0, { ic: 'image' }), 'One file · Windows only')}
  ${labeled(dragGhost('store-front.jpg', 3, { ic: 'image' }), 'Whole selection · count badge')}
</div>`;

	const toasts = `<div style="display:flex;flex-direction:column;gap:10px">
  ${toast('check', 'var(--ok)', 'Moved 3 items to /2026-09', 'Undo')}
  ${toast('info', 'var(--danger)', 'Moved 2 items · “latte-art.jpg” already exists there', 'Show')}
  ${toast('info', 'var(--warn)', 'Dragging files to Explorer isn’t supported yet. Use Download, or open the network drive.', 'Download')}
</div>`;

	const cell = (t, tone = 'var(--text)') => `<div style="padding:9px 12px;border-top:1px solid var(--border);color:${tone};font-size:12px">${t}</div>`;
	const matrix = `<div style="display:grid;grid-template-columns:120px minmax(0,1fr) minmax(0,1fr);width:640px;border:1px solid var(--border);border-radius:8px;overflow:hidden">
  <div style="padding:9px 12px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-3)">Drag</div>
  <div style="padding:9px 12px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-3)">macOS</div>
  <div style="padding:9px 12px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-3)">Windows</div>
  ${cell('A folder')}${cell('Move inside Soteria', 'var(--accent-text)')}${cell('Move inside Soteria', 'var(--accent-text)')}
  ${cell('A file')}${cell('Out to Finder · unchanged')}${cell('Move inside Soteria', 'var(--accent-text)')}
  ${cell('Out to the OS')}${cell('Drag the file · works today')}${cell('Not yet · Download or the drive', 'var(--warn)')}
</div>`;

	const rule = (k, v) => `<div style="display:flex;gap:10px;font-size:12px;line-height:1.45"><span style="flex:none;width:104px;font-weight:500;color:var(--text-2)">${k}</span><span>${v}</span></div>`;
	const rules = `<div style="display:flex;flex-direction:column;gap:10px">
  ${rule('Targets', 'Folder rows, folder cards and the breadcrumbs. Not files, not the empty area, not the sidebar.')}
  ${rule('Refused', 'A folder onto itself, into its own subfolder, or anything onto the folder it already sits in. No ring appears and the drop does nothing.')}
  ${rule('Selection', 'Dragging a selected row takes the whole selection; dragging an unselected row takes just that one.')}
  ${rule('Collision', 'MOVE never overwrites. The items that fit are moved, the rest are named in one toast.')}
  ${rule('Undo', 'Every move gets the same Undo toast that Trash already uses, for 6 seconds.')}
  ${rule('Uploads', 'Dropping files from Finder or Explorer still uploads; that path is untouched.')}
  ${rule('macOS files', 'A native file drag can only go one way, so a file keeps going out to Finder. Move it with ⌘X ⌘V or “Move to…”.')}
  ${rule('Windows out', 'Today’s Windows drag-out never lands anything. It becomes an internal move, and the toast points at what works.')}
</div>`;

	return doc(
		`<div style="display:flex;flex-direction:column;gap:26px;padding:24px 32px">
  <div style="display:grid;grid-template-columns:520px 250px minmax(0,1fr);gap:32px;align-items:start">
    ${block('Drop targets', targets)}
    ${block('What follows the pointer', ghosts)}
    ${block('Toasts', toasts)}
  </div>
  <div style="display:grid;grid-template-columns:640px minmax(0,1fr);gap:32px;align-items:start">
    ${block('What a drag does', matrix)}
    ${block('Behaviour', rules)}
  </div>
</div>`,
		{ dark, root: 'display:block;', h: 830 }
	);
}

// Details panel for a folder: the size and item count come from the search index.
function folderDetailsScreen({ dark = false } = {}) {
	const cols = 'minmax(0,1fr) 90px 160px 36px';
	const panel = (known = true) => `
<aside style="width:320px;flex:none;border-left:1px solid var(--border);padding:20px;display:flex;flex-direction:column;gap:16px;overflow:hidden">
  <div style="height:180px;border-radius:8px;background:var(--surface-2);display:flex;align-items:center;justify-content:center">${folderGlyph(56)}</div>
  <div style="display:flex;flex-direction:column;gap:4px">
    <div style="font-size:15px;font-weight:600;letter-spacing:-0.01em;word-break:break-all">2026-09</div>
    <div style="font-size:12px;color:var(--text-2)">Folder · ${known ? '128 items · 1.4 GB' : '—'}</div>
  </div>
  ${btn('Download', { kind: 'primary', ic: 'download', full: true, h: 36 })}
  <div style="display:flex;flex-direction:column">
    ${metaRow('Modified', 'Sep 4, 2026 · 17:32')}
    ${metaRow('Location', '/Product Photos', true)}
    ${metaRow('Contains', known ? '116 files, 12 folders' : 'Not indexed yet')}
  </div>
  <div style="flex:1"></div>
  <div style="display:flex;flex-direction:column;gap:2px;margin:0 -10px">
    ${actionRow('link', 'Copy WebDAV URL')}
    ${actionRow('pencil', 'Rename')}
    ${actionRow('folderMove', 'Move to…')}
    ${actionRow('trash', 'Move to Trash', true)}
  </div>
</aside>`;
	return doc(
		`${sidebar({ folder: 'Product Photos' })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ crumbs: ['Files', 'Product Photos'], right: filesHeaderRight() })}
  <div style="flex:1;min-height:0;display:flex">
    <div style="flex:1;min-width:0;padding:20px 24px;display:flex;flex-direction:column;gap:28px">
      <section style="display:flex;flex-direction:column;gap:12px">
        ${sectionLabel('Folders', '4')}
        <div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:12px">
          ${folderCardDrop('2026-08', '41 items · Aug 31')}
          ${folderCardDrop('2026-09', '12 items · Sep 4', { sel: true })}
          ${folderCardDrop('Logos', '9 items · Jun 2')}
          ${folderCardDrop('Menu Boards', '18 items · Aug 28')}
        </div>
      </section>
      <section style="display:flex;flex-direction:column;gap:4px">
        ${sectionLabel('Files', '6')}
        <div style="display:flex;flex-direction:column">
          ${tableHead(cols, false)}
          ${PHOTO_FILES.map((f) => fileRow(f, cols, { kind: false })).join('')}
        </div>
      </section>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">
        ${caption('Before the first crawl lands')}
        <div style="display:flex;flex-direction:column;gap:4px;width:300px;padding:12px 14px;border:1px dashed var(--border-2);border-radius:8px">
          <div style="font-weight:500">2026-09</div>
          <div style="font-size:12px;color:var(--text-2)">Folder · —</div>
          <div style="font-size:12px;color:var(--text-3)">Contains · Not indexed yet</div>
        </div>
      </div>
    </div>
    ${panel()}
  </div>
</main>`,
		{ dark }
	);
}

const startupStatus = (state) => {
	const s = {
		off: ['var(--text-3)', 'The window still opens; macOS gives no way to start hidden.'],
		on: ['var(--text-3)', 'The window still opens; macOS gives no way to start hidden.'],
		error: ['var(--danger)', 'SMAppService register: the operation couldn’t be completed'],
		dev: ['var(--danger)', 'launch at login needs an installed build']
	}[state];
	return `<div style="font-size:12px;color:${s[0]};text-wrap:pretty">${s[1]}</div>`;
};

const startupSection = (state = 'on') =>
	settingsSection(
		'Startup',
		'What happens when you log in.',
		settingRow('Open Soteria when you log in', startupStatus(state), toggle(state === 'on')) +
			settingRow('Reconnect to the last server', 'Sign in again with the password in the Keychain, so the drive comes back on its own.', toggle(state === 'on'))
	);

function settingsStartupScreen({ dark = false } = {}) {
	const block = (cap, inner) => `<div style="display:flex;flex-direction:column;gap:8px">${caption(cap)}${inner}</div>`;
	return doc(
		`${sidebar({ gear: true })}
<main style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--surface)">
  ${header({ title: 'Settings' })}
  <div style="flex:1;min-height:0;overflow:hidden;padding:0 24px 20px">
    <div style="max-width:720px;display:flex;flex-direction:column">
      ${startupSection('on')}
      ${settingsSection(
				'Background',
				'What happens when you close the window.',
				settingRow('Keep running in the background', 'Shows an icon in the menu bar so the network drive stays connected.', toggle(true)) +
					settingRow('Notify when transfers finish', 'Only while Soteria is in the background.', toggle(true))
			)}
      <div style="display:flex;gap:28px;padding:24px 0;border-top:1px solid var(--border)">
        ${block('macOS refuses the login item', `<div style="width:330px">${startupStatus('error')}</div>`)}
        ${block('wails3 dev', `<div style="width:300px">${startupStatus('dev')}</div>`)}
      </div>
    </div>
  </div>
</main>`,
		{ dark }
	);
}

// ---------------------------------------------------------------------------
// Mobile (390 × 844): status-bar area left empty, tab bar with home-indicator inset
// ---------------------------------------------------------------------------
const MW = 390;
const MH = 844;
const mdoc = (inner, { dark = false } = {}) =>
	doc(inner, { dark, w: MW, h: MH, root: 'display:flex;flex-direction:column;position:relative;' });

const statusPad = () => `<div style="height:54px;flex:none"></div>`;

const mIcon = (n, color = 'var(--text-2)') =>
	`<div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;color:${color}">${icon(n, 22)}</div>`;

const mhead = ({ title, back = null, right = '', sub = '' }) => `
<div style="height:52px;flex:none;display:flex;align-items:center;padding:0 8px 0 ${back ? 4 : 20}px">
  ${back ? `<div style="display:flex;align-items:center;height:44px;padding:0 10px 0 6px;color:var(--accent-text)">${icon('chevronLeft', 22)}<span style="font-size:15px">${back}</span></div>` : ''}
  <div style="flex:1;min-width:0;display:flex;flex-direction:column">
    <div class="trunc" style="font-size:17px;font-weight:600;letter-spacing:-0.01em">${title}</div>
    ${sub ? `<div class="trunc mono" style="font-size:11px;color:var(--text-3)">${sub}</div>` : ''}
  </div>
  <div style="display:flex">${right}</div>
</div>`;

const tabbar = (active) =>
	`<div style="flex:none;height:84px;border-top:1px solid var(--border);background:var(--surface);display:flex;padding:6px 8px 34px">${[
		['files', 'folder', 'Files'],
		['recent', 'clock', 'Recent'],
		['transfers', 'transfers', 'Transfers'],
		['settings', 'gear', 'Settings']
	]
		.map(
			([k, ic, label]) =>
				`<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:${k === active ? 'var(--text)' : 'var(--text-3)'}">${icon(ic, 22)}<span style="font-size:10px;font-weight:500">${label}</span></div>`
		)
		.join('')}</div>`;

const check = (on) =>
	on
		? `<span style="width:22px;height:22px;border-radius:11px;background:var(--primary);color:var(--on-primary);display:inline-flex;align-items:center;justify-content:center;flex:none">${icon('check', 13)}</span>`
		: `<span style="width:22px;height:22px;border-radius:11px;border:1.5px solid var(--border-2);flex:none"></span>`;

const mrow = (e, { pick = null } = {}) => `
<div style="display:flex;align-items:center;gap:12px;height:60px;padding:0 4px 0 16px;border-bottom:1px solid var(--border);${pick ? 'background:var(--accent-soft);' : ''}">
  ${pick === null ? '' : check(pick)}
  ${e.dir ? folderGlyph(26) : icon(e.ic, 24, 'color:var(--text-2)')}
  <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">
    <span class="trunc" style="font-size:15px">${e.name}</span>
    <span class="trunc" style="font-size:12px;color:var(--text-3)">${e.dir ? `${e.count} items · ${e.date}` : `${e.size} · ${e.date}`}</span>
  </div>
  ${e.dir ? `<div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;color:var(--text-3)">${icon('chevronRight', 18)}</div>` : mIcon('dots', 'var(--text-3)')}
</div>`;

const mcard = (e) => `
<div style="display:flex;flex-direction:column;border:1px solid var(--border);border-radius:12px;background:var(--surface);overflow:hidden">
  <div style="height:110px;display:flex;align-items:center;justify-content:center;background:var(--surface-2);color:var(--text-3)">${e.dir ? folderGlyph(44) : icon(e.ic, 32, 'opacity:0.8')}</div>
  <div style="padding:10px 12px 12px;display:flex;flex-direction:column;gap:2px">
    <span class="trunc" style="font-size:14px;font-weight:500">${e.name}</span>
    <span style="font-size:12px;color:var(--text-3)">${e.dir ? `${e.count} items` : e.size}</span>
  </div>
</div>`;

const fab = () =>
	`<div style="position:absolute;right:20px;bottom:104px;width:56px;height:56px;border-radius:28px;background:var(--primary);color:var(--on-primary);display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow)">${icon('plus', 24)}</div>`;

const mbtn = (label, { kind = 'secondary', ic = null } = {}) => {
	const look =
		kind === 'primary'
			? 'background:var(--primary);color:var(--on-primary);border:1px solid var(--primary)'
			: kind === 'danger'
				? 'background:var(--danger);color:var(--on-danger);border:1px solid var(--danger)'
				: 'background:var(--surface);color:var(--text);border:1px solid var(--border-2)';
	return `<button type="button" style="height:48px;width:100%;border-radius:10px;font:inherit;font-size:15px;font-weight:500;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:default;${look}">${ic ? icon(ic, 18) : ''}<span>${label}</span></button>`;
};

const mfield = (label, value, { mono = false, placeholder = false, trailing = '' } = {}) => `
<div style="display:flex;flex-direction:column;gap:6px">
  <label style="font-size:13px;font-weight:500;color:var(--text-2)">${label}</label>
  <div style="display:flex;align-items:center;gap:8px;height:48px;padding:0 14px;border:1px solid var(--border-2);border-radius:10px;background:var(--surface)"><span class="${mono ? 'mono' : ''}" style="flex:1;font-size:15px;color:${placeholder ? 'var(--text-3)' : 'var(--text)'}">${value}</span>${trailing}</div>
</div>`;

const sheet = (inner) => `
<div style="position:absolute;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:flex-end">
  <div style="width:100%;background:var(--surface);border-radius:16px 16px 0 0;padding:6px 16px 34px;display:flex;flex-direction:column">
    <div style="width:36px;height:4px;border-radius:2px;background:var(--border-2);margin:4px auto 10px"></div>
    ${inner}
  </div>
</div>`;

const sheetRow = (ic, label, danger = false) =>
	`<div style="display:flex;align-items:center;gap:14px;height:52px;padding:0 8px;font-size:15px;color:${danger ? 'var(--danger)' : 'var(--text)'}">${icon(ic, 20, `color:${danger ? 'var(--danger)' : 'var(--text-2)'}`)}<span>${label}</span></div>`;

const short = (d) => d.replace(', 2026', '');
const M_FOLDERS = [
	{ dir: true, name: 'Backups', count: 14, date: 'Sep 4' },
	{ dir: true, name: 'Product Photos', count: 128, date: 'Sep 4' },
	{ dir: true, name: 'Receipts 2026', count: 312, date: 'Sep 2' }
];
const M_FILES = ROOT_FILES.map((f) => ({ ...f, date: short(f.date).split(' · ')[0] }));
const M_ITEMS = [...M_FOLDERS, ...M_FILES];

const filesBody = (items, view = 'list') =>
	view === 'list'
		? `<div style="flex:1;min-height:0;overflow:hidden;background:var(--surface)">${items.map((e) => mrow(e)).join('')}</div>`
		: `<div style="flex:1;min-height:0;overflow:hidden;padding:12px 16px;display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:12px;align-content:start">${items.map(mcard).join('')}</div>`;

const filesHead = (view = 'list') =>
	mhead({ title: 'Files', sub: 'Lab SFTPGo · 192.168.1.194:8081', right: `${mIcon('search')}${mIcon(view === 'list' ? 'grid' : 'list')}${mIcon('dots')}` });

function mServers({ dark = false } = {}) {
	return mdoc(
		`${statusPad()}
<div style="flex:1;padding:28px 20px 0;display:flex;flex-direction:column;gap:20px">
  <div><h1 style="margin:0;font-size:26px;font-weight:600;letter-spacing:-0.02em">Choose a server</h1><p style="margin:6px 0 0;font-size:15px;color:var(--text-2)">Connections saved on this device.</p></div>
  <div style="border:1px solid var(--border);border-radius:12px;background:var(--surface)">
    ${[
			['Lab SFTPGo', '192.168.1.194:8081 · pos', true],
			['Home NAS', 'nas.home.arpa:8443/dav · kiet', false]
		]
			.map(
				([name, addr, on], i, arr) => `
    <div style="display:flex;align-items:center;gap:14px;height:68px;padding:0 12px 0 16px;${i < arr.length - 1 ? 'border-bottom:1px solid var(--border)' : ''}">
      <span style="width:40px;height:40px;border-radius:10px;background:var(--surface-2);display:inline-flex;align-items:center;justify-content:center;color:var(--text-2)">${icon('server', 20)}</span>
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px"><span style="font-size:15px;font-weight:500">${name}</span><span class="trunc mono" style="font-size:12px;color:var(--text-3)">${addr}</span></div>
      <span style="width:8px;height:8px;border-radius:4px;background:${on ? 'var(--ok)' : 'var(--border-2)'}"></span>
      ${icon('chevronRight', 18, 'color:var(--text-3)')}
    </div>`
			)
			.join('')}
  </div>
</div>
<div style="padding:16px 20px 34px">${mbtn('Add server', { ic: 'plus' })}</div>`,
		{ dark }
	);
}

function mSignIn({ dark = false } = {}) {
	return mdoc(
		`${statusPad()}${mhead({ back: 'Servers', title: '' })}
<div style="flex:1;padding:8px 20px 0;display:flex;flex-direction:column;gap:22px">
  <div><h1 style="margin:0;font-size:26px;font-weight:600;letter-spacing:-0.02em">Add a server</h1><p style="margin:6px 0 0;font-size:15px;color:var(--text-2)">Any WebDAV server, such as SFTPGo or Nextcloud.</p></div>
  <div style="display:flex;flex-direction:column;gap:16px">
    ${mfield('Server address', 'http://192.168.1.194:8081', { mono: true })}
    ${mfield('Username', 'pos')}
    ${mfield('Password', '••••••••', { trailing: icon('eye', 18, 'color:var(--text-3)') })}
    <div style="display:flex;align-items:center;gap:12px;padding:4px 0;font-size:15px">${check(true)}<span style="flex:1">Remember me</span></div>
    <div style="display:flex;align-items:center;gap:12px;padding:4px 0;font-size:15px">${check(false)}<span style="flex:1">Trust self-signed certificate</span></div>
  </div>
</div>
<div style="padding:16px 20px 34px">${mbtn('Sign in', { kind: 'primary' })}</div>`,
		{ dark }
	);
}

const mFiles = ({ dark = false, view = 'list' } = {}) =>
	mdoc(`${statusPad()}${filesHead(view)}${filesBody(M_ITEMS, view)}${fab()}${tabbar('files')}`, { dark });

function mActions({ dark = false } = {}) {
	const f = M_FILES[1];
	return mdoc(
		`${statusPad()}${filesHead()}${filesBody(M_ITEMS)}${tabbar('files')}
${sheet(`
  <div style="display:flex;align-items:center;gap:14px;padding:6px 8px 14px;border-bottom:1px solid var(--border)">
    ${icon(f.ic, 28, 'color:var(--text-2)')}
    <div style="min-width:0;display:flex;flex-direction:column;gap:2px"><span class="trunc" style="font-size:15px;font-weight:500">${f.name}</span><span style="font-size:12px;color:var(--text-3)">${f.kind} · ${f.size} · ${f.date}</span></div>
  </div>
  <div style="padding-top:6px">
    ${sheetRow('eye', 'Preview')}${sheetRow('download', 'Download')}${sheetRow('pencil', 'Rename')}${sheetRow('folderMove', 'Move to…')}${sheetRow('link', 'Copy WebDAV URL')}${sheetRow('trash', 'Delete', true)}
  </div>`)}`,
		{ dark }
	);
}

function mSelect({ dark = false } = {}) {
	const on = new Set(['Product Photos', 'store-front.jpg', 'menu-board-v3.pdf']);
	return mdoc(
		`${statusPad()}
<div style="height:52px;flex:none;display:flex;align-items:center;padding:0 8px">
  ${mIcon('x', 'var(--text)')}
  <div style="flex:1;font-size:17px;font-weight:600;letter-spacing:-0.01em">3 selected</div>
  <div style="padding:0 12px;font-size:15px;color:var(--accent-text)">Select all</div>
</div>
<div style="flex:1;min-height:0;overflow:hidden;background:var(--surface)">${M_ITEMS.map((e) => mrow(e, { pick: on.has(e.name) })).join('')}</div>
<div style="flex:none;height:84px;border-top:1px solid var(--border);background:var(--surface);display:flex;padding:6px 8px 34px">
  ${[
		['download', 'Download', 'var(--text)'],
		['folderMove', 'Move', 'var(--text)'],
		['trash', 'Delete', 'var(--danger)']
	]
		.map(
			([ic, l, c]) =>
				`<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:${c}">${icon(ic, 22)}<span style="font-size:10px;font-weight:500">${l}</span></div>`
		)
		.join('')}
</div>`,
		{ dark }
	);
}

function mSearch({ dark = false } = {}) {
	const q = 'invoice';
	return mdoc(
		`${statusPad()}
<div style="height:52px;flex:none;display:flex;align-items:center;gap:10px;padding:0 16px">
  <div style="flex:1;display:flex;align-items:center;gap:8px;height:40px;padding:0 12px;border-radius:10px;background:var(--surface-2);border:1px solid var(--accent)">${icon('search', 18, 'color:var(--text-3)')}<span style="flex:1;font-size:15px">${q}</span>${icon('x', 16, 'color:var(--text-3)')}</div>
  <span style="font-size:15px;color:var(--accent-text)">Cancel</span>
</div>
<div style="padding:8px 16px 12px;display:flex;align-items:center;justify-content:space-between">
  ${seg(['This folder', 'Everywhere'], 1)}
  <span style="font-size:12px;color:var(--text-3)">${RESULTS.length} results</span>
</div>
<div style="flex:1;min-height:0;overflow:hidden;background:var(--surface)">
  ${RESULTS.map(
		(r) => `
  <div style="display:flex;align-items:center;gap:12px;height:64px;padding:0 16px;border-bottom:1px solid var(--border)">
    ${r.dir ? folderGlyph(26) : icon(r.ic, 24, 'color:var(--text-2)')}
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px"><span class="trunc" style="font-size:15px">${hl(r.name, q)}</span><span class="trunc mono" style="font-size:11px;color:var(--text-3)">${r.path}</span></div>
    <span class="mono" style="font-size:12px;color:var(--text-3)">${r.size}</span>
  </div>`
	).join('')}
</div>
<div style="padding:10px 16px;font-size:12px;color:var(--text-3);text-align:center;border-top:1px solid var(--border)">Indexed 2,340 items · 2 min ago</div>
${tabbar('files')}`,
		{ dark }
	);
}

function mPreview({ dark = true } = {}) {
	return mdoc(
		`${statusPad()}
<div style="height:52px;flex:none;display:flex;align-items:center;padding:0 8px 0 4px">
  <div style="display:flex;align-items:center;height:44px;padding:0 10px 0 6px;color:var(--accent-text)">${icon('chevronLeft', 22)}</div>
  <div style="flex:1;min-width:0;display:flex;flex-direction:column"><span class="trunc" style="font-size:15px;font-weight:600">store-front.jpg</span><span style="font-size:11px;color:var(--text-3)">JPEG · 3.4 MB · 2 of 6</span></div>
  ${mIcon('download')}${mIcon('dots')}
</div>
<div style="flex:1;display:flex;align-items:center;justify-content:center;padding:0 16px">
  <div style="width:100%;height:268px;border-radius:12px;background:var(--surface-2);display:flex;align-items:center;justify-content:center;color:var(--text-3)">${icon('image', 44, 'opacity:0.6')}</div>
</div>
<div style="display:flex;justify-content:center;gap:6px;padding:0 0 40px">
  ${[0, 1, 2, 3, 4, 5].map((i) => `<span style="width:6px;height:6px;border-radius:3px;background:${i === 1 ? 'var(--text)' : 'var(--border-2)'}"></span>`).join('')}
</div>`,
		{ dark }
	);
}

const mtransfer = (t) => `
<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border)">
  <span style="width:40px;height:40px;border-radius:10px;background:var(--surface-2);display:inline-flex;align-items:center;justify-content:center;color:var(--text-2)">${icon(t.ic, 20)}</span>
  <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px">
    <div style="display:flex;justify-content:space-between;gap:8px"><span class="trunc" style="font-size:15px">${t.name}</span><span class="mono" style="font-size:12px;color:var(--text-3)">${t.right}</span></div>
    ${t.pct < 100 ? `<div style="height:3px;border-radius:2px;background:var(--surface-2);overflow:hidden"><div style="width:${t.pct}%;height:100%;background:var(--accent)"></div></div>` : ''}
    <span class="trunc" style="font-size:12px;color:var(--text-3)">${t.sub}</span>
  </div>
  ${t.pct < 100 ? mIcon('x', 'var(--text-3)') : icon('check', 18, 'color:var(--ok);margin-right:13px')}
</div>`;

function mTransfers({ dark = false } = {}) {
	return mdoc(
		`${statusPad()}${mhead({ title: 'Transfers', right: `<div style="padding:0 12px;font-size:15px;color:var(--accent-text)">Clear</div>` })}
<div style="flex:1;min-height:0;overflow:hidden;background:var(--surface)">
  <div style="margin:8px 16px;display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--border);border-radius:12px">
    ${folderGlyph(28)}
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px">
      <div style="display:flex;justify-content:space-between;gap:8px"><span class="trunc" style="font-size:15px;font-weight:500">Uploading “2026-09”</span><span class="mono" style="font-size:12px;color:var(--text-3)">38 / 128</span></div>
      <div style="height:3px;border-radius:2px;background:var(--surface-2);overflow:hidden"><div style="width:30%;height:100%;background:var(--accent)"></div></div>
      <span style="font-size:12px;color:var(--text-3)">412 MB of 1.3 GB · to /Product Photos</span>
    </div>
  </div>
  ${mtransfer({ ic: 'upload', name: 'IMG_2041.jpg', sub: 'to /Product Photos/2026-09/day-01', pct: 74, right: '74%' })}
  ${mtransfer({ ic: 'download', name: 'pos-backup-2026-09-04.tar.gz', sub: 'to Files · 221 MB of 1.2 GB', pct: 18, right: '18%' })}
  ${mtransfer({ ic: 'upload', name: 'IMG_2040.jpg', sub: 'to /Product Photos/2026-09/day-01 · 4.4 MB', pct: 100, right: '17:41' })}
  ${mtransfer({ ic: 'download', name: 'menu-board-v3.pdf', sub: 'to Files · 6.1 MB', pct: 100, right: '17:12' })}
</div>
${tabbar('transfers')}`,
		{ dark }
	);
}

function mRecent({ dark = false } = {}) {
	return mdoc(
		`${statusPad()}${mhead({ title: 'Recent', sub: 'Recently modified · indexed 2 min ago', right: mIcon('refresh') })}
<div style="flex:1;min-height:0;overflow:hidden;background:var(--surface)">
  ${Object.entries(RECENT)
		.map(
			([label, rows]) => `
  <div style="padding:14px 16px 6px;font-size:12px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-3)">${label}</div>
  ${rows
		.map(
			(r) => `
  <div style="display:flex;align-items:center;gap:12px;height:60px;padding:0 16px;border-bottom:1px solid var(--border)">
    ${icon(r.ic, 24, 'color:var(--text-2)')}
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px"><span class="trunc" style="font-size:15px">${r.name}</span><span class="trunc mono" style="font-size:11px;color:var(--text-3)">${r.path}</span></div>
    <span style="font-size:12px;color:var(--text-3)">${r.when}</span>
  </div>`
		)
		.join('')}`
		)
		.join('')}
</div>
${tabbar('recent')}`,
		{ dark }
	);
}

const mgroup = (title, inner) => `
<div style="display:flex;flex-direction:column;gap:8px">
  <div style="padding:0 4px;font-size:12px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-3)">${title}</div>
  <div style="border:1px solid var(--border);border-radius:12px;background:var(--surface);padding:4px 16px">${inner}</div>
</div>`;

const mline = (label, value = '', last = false) =>
	`<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px;font-size:15px;${last ? '' : 'border-bottom:1px solid var(--border)'}"><span>${label}</span><span style="color:var(--text-3);display:inline-flex;align-items:center;gap:6px">${value}</span></div>`;

function mSettings({ dark = false } = {}) {
	return mdoc(
		`${statusPad()}${mhead({ title: 'Settings' })}
<div style="flex:1;min-height:0;overflow:hidden;padding:8px 16px;display:flex;flex-direction:column;gap:20px">
  ${mgroup(
		'Account',
		`<div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border)">
      <span style="width:40px;height:40px;border-radius:10px;background:var(--surface-2);display:inline-flex;align-items:center;justify-content:center;color:var(--text-2)">${icon('server', 20)}</span>
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px"><span style="font-size:15px;font-weight:500">Lab SFTPGo</span><span class="trunc mono" style="font-size:12px;color:var(--text-3)">192.168.1.194:8081 · pos</span></div>
    </div>
    <div style="display:flex;align-items:center;justify-content:center;height:48px;font-size:15px;color:var(--danger)">Sign out</div>`
	)}
  ${mgroup('Appearance', mline('Theme', segmented(['System', 'Light', 'Dark'], 0), true))}
  ${mgroup('Storage', `<div style="padding:12px 0;display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:var(--text-2)">48.2 GB of 200 GB used</span><span class="mono" style="color:var(--text-3)">151.8 GB free</span></div>${segBar(6)}</div>`)}
  <div style="text-align:center;font-size:11px;color:var(--text-3)" class="mono">Soteria 0.0.1 - Powered by ZenSoftware</div>
</div>
${tabbar('settings')}`,
		{ dark }
	);
}

function mUpload({ dark = false } = {}) {
	return mdoc(
		`${statusPad()}${filesHead()}${filesBody(M_ITEMS)}${tabbar('files')}
${sheet(`${sheetRow('image', 'Upload photos or videos')}${sheetRow('file', 'Upload files')}${sheetRow('folderPlus', 'New folder')}<div style="padding-top:10px">${mbtn('Cancel')}</div>`)}`,
		{ dark }
	);
}

function mConflict({ dark = false } = {}) {
	return mdoc(
		`${statusPad()}${filesHead()}${filesBody(M_ITEMS)}${tabbar('files')}
<div style="position:absolute;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;padding:0 24px">
  <div style="width:100%;background:var(--surface);border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:14px">
    <div style="font-size:17px;font-weight:600;letter-spacing:-0.01em;text-wrap:pretty">“store-front.jpg” already exists</div>
    <p style="margin:0;font-size:14px;color:var(--text-2);text-wrap:pretty">A file with this name is already in Product Photos.</p>
    <div style="display:flex;gap:10px">${compareCard('On server', '2.9 MB', 'Sep 4 · 17:31')}${compareCard('Yours', '3.4 MB', 'Today · 17:32')}</div>
    <div style="display:flex;align-items:center;gap:12px;font-size:14px;color:var(--text-2)">${check(false)}<span>Apply to the remaining 2 files</span></div>
    <div style="display:flex;flex-direction:column;gap:8px;padding-top:4px">${mbtn('Replace', { kind: 'primary' })}${mbtn('Keep both')}${mbtn('Skip')}</div>
  </div>
</div>`,
		{ dark }
	);
}

function mEmpty({ dark = false } = {}) {
	return mdoc(
		`${statusPad()}${mhead({ back: 'Files', title: 'Staff Docs', right: `${mIcon('search')}${mIcon('dots')}` })}
<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:0 40px;text-align:center;background:var(--surface)">
  <span style="width:64px;height:64px;border-radius:32px;background:var(--surface-2);display:inline-flex;align-items:center;justify-content:center;color:var(--text-2)">${icon('upload', 28)}</span>
  <div><div style="font-size:17px;font-weight:600;letter-spacing:-0.01em">Nothing here yet</div><p style="margin:6px 0 0;font-size:14px;color:var(--text-2);text-wrap:pretty">Tap + to upload photos or files, or create a folder.</p></div>
</div>
${fab()}${tabbar('files')}`,
		{ dark }
	);
}

// ---------------------------------------------------------------------------
// Write everything
// ---------------------------------------------------------------------------
const files = {
	'Servers.dc.html': serversScreen(),
	'SignIn.dc.html': signInScreen(),
	'SignInDark.dc.html': signInScreen({ dark: true, error: true }),
	'Main.dc.html': filesScreen(),
	'FilesDark.dc.html': filesScreen({ dark: true }),
	'Details.dc.html': detailsScreen(),
	'Transfers.dc.html': transfersScreen(),
	'EmptyFolder.dc.html': emptyScreen(),
	'Settings.dc.html': settingsScreen(),
	'Dialogs.dc.html': dialogsSheet(),
	'PreviewImage.dc.html': previewImage(),
	'PreviewDoc.dc.html': previewDoc(),
	'FilesGrid.dc.html': filesGridScreen(),
	'FilesList.dc.html': filesListScreen({ dark: true }),
	'Search.dc.html': searchScreen(),
	'SearchIndexing.dc.html': searchScreen({ dark: true, indexing: true }),
	'Selection.dc.html': selectionScreen(),
	'UploadConflict.dc.html': conflictScreen({ dark: true }),
	'FolderUpload.dc.html': folderUploadScreen(),
	'Recent.dc.html': recentScreen({ dark: true }),
	'UploadPanel.dc.html': uploadPanelScreen(),
	'UploadStates.dc.html': uploadStatesSheet({ dark: true }),
	'UploadDrop.dc.html': uploadDropScreen({ dark: true }),
	'Trash.dc.html': trashScreen(),
	'Bits.dc.html': bitsSheet({ dark: true }),
	'FilesLoading.dc.html': filesLoadingScreen(),
	'FilesOffline.dc.html': filesOfflineScreen({ dark: true }),
	'Intro.dc.html': introScreen(),
	'IntroWin.dc.html': introScreen({ dark: true, win: true }),
	'SettingsDrive.dc.html': settingsDriveScreen(),
	'DriveStates.dc.html': driveStatesSheet({ dark: true }),
	'SidebarMenu.dc.html': sidebarScreen({ dark: true, menu: true }),
	'SidebarClean.dc.html': sidebarScreen(),
	'SidebarOpen.dc.html': sidebarOpenScreen(),
	'SidebarHidden.dc.html': sidebarHiddenScreen({ dark: true }),
	'SidebarMotion.dc.html': sidebarMotionSheet(),
	'WinOpen.dc.html': winOpenScreen(),
	'WinHidden.dc.html': winHiddenScreen(),
	'WinBits.dc.html': winBitsSheet(),
	'TrayMac.dc.html': trayMacScreen(),
	'TrayWin.dc.html': trayWinScreen(),
	'BackgroundBits.dc.html': backgroundBitsSheet(),
	'UpdateDialog.dc.html': updateScreen(),
	'UpdateReady.dc.html': updateScreen({ dark: true, state: 'ready', xfers: 3 }),
	'SettingsUpdates.dc.html': settingsUpdatesScreen(),
	'UpdateStates.dc.html': updateStatesSheet(),
	'UpdateBits.dc.html': updateBitsSheet(),
	'DragMove.dc.html': dragMoveScreen(),
	'DragMoveBits.dc.html': dragMoveBitsSheet(),
	'FolderDetails.dc.html': folderDetailsScreen(),
	'SettingsStartup.dc.html': settingsStartupScreen(),
	'MServers.dc.html': mServers(),
	'MSignIn.dc.html': mSignIn(),
	'MFiles.dc.html': mFiles(),
	'MFilesCard.dc.html': mFiles({ view: 'card', dark: true }),
	'MActions.dc.html': mActions(),
	'MSelect.dc.html': mSelect(),
	'MSearch.dc.html': mSearch({ dark: true }),
	'MPreview.dc.html': mPreview(),
	'MTransfers.dc.html': mTransfers(),
	'MRecent.dc.html': mRecent({ dark: true }),
	'MSettings.dc.html': mSettings(),
	'MUpload.dc.html': mUpload(),
	'MConflict.dc.html': mConflict({ dark: true }),
	'MEmpty.dc.html': mEmpty()
};

for (const [name, html] of Object.entries(files)) writeFileSync(join(OUT, name), html);

const W = 1280;
const H = 800;
const GX = 100;
const GY = 160;
const X = (c) => c * (W + GX);
const Y = (r) => r * (H + GY);
const MX = (c) => c * (MW + 70);
const MY = (r) => r * (MH + 180);
const mobile = (file, title, c, r) => ({ file, title, x: MX(c), y: MY(r), w: MW, h: MH, page: 'mobile' });

const canvas = {
	artboards: [
		{ file: 'Servers.dc.html', title: 'Servers', x: X(0), y: Y(0), w: W, h: H },
		{ file: 'SignIn.dc.html', title: 'Sign in', x: X(1), y: Y(0), w: W, h: H },
		{ file: 'SignInDark.dc.html', title: 'Sign in · dark · error', x: X(2), y: Y(0), w: W, h: H },
		{ file: 'Main.dc.html', title: 'Files', x: X(0), y: Y(1), w: W, h: H },
		{ file: 'FilesDark.dc.html', title: 'Files · dark', x: X(1), y: Y(1), w: W, h: H },
		{ file: 'Details.dc.html', title: 'File details', x: X(2), y: Y(1), w: W, h: H },
		{ file: 'Transfers.dc.html', title: 'Transfers', x: X(0), y: Y(2), w: W, h: H },
		{ file: 'EmptyFolder.dc.html', title: 'Empty folder', x: X(1), y: Y(2), w: W, h: H },
		{ file: 'Settings.dc.html', title: 'Settings', x: X(2), y: Y(2), w: W, h: H },
		{ file: 'Dialogs.dc.html', title: 'Dialogs & menus', x: X(0), y: Y(3), w: W, h: H },
		{ file: 'PreviewImage.dc.html', title: 'Preview · image', x: X(1), y: Y(3), w: W, h: H },
		{ file: 'PreviewDoc.dc.html', title: 'Preview · document · dark', x: X(2), y: Y(3), w: W, h: H },
		{ file: 'FilesGrid.dc.html', title: 'Files · card view', x: X(0), y: Y(4), w: W, h: H },
		{ file: 'FilesList.dc.html', title: 'Files · list view · sort menu · dark', x: X(1), y: Y(4), w: W, h: H },
		{ file: 'Search.dc.html', title: 'Search · everywhere', x: X(2), y: Y(4), w: W, h: H },
		{ file: 'SearchIndexing.dc.html', title: 'Search · first index · dark', x: X(0), y: Y(5), w: W, h: H },
		{ file: 'Selection.dc.html', title: 'Multi-select · bulk actions', x: X(1), y: Y(5), w: W, h: H },
		{ file: 'UploadConflict.dc.html', title: 'Upload conflict · dark', x: X(2), y: Y(5), w: W, h: H },
		{ file: 'FolderUpload.dc.html', title: 'Folder upload · Transfers', x: X(0), y: Y(6), w: W, h: H },
		{ file: 'Recent.dc.html', title: 'Recent · dark', x: X(1), y: Y(6), w: W, h: H },
		{ file: 'UploadPanel.dc.html', title: 'Upload panel · in progress', x: X(2), y: Y(6), w: W, h: H },
		{ file: 'UploadStates.dc.html', title: 'Upload panel · states · dark', x: X(0), y: Y(7), w: W, h: H },
		{ file: 'UploadDrop.dc.html', title: 'Drop overlay + collapsed panel · dark', x: X(1), y: Y(7), w: W, h: H },
		{ file: 'Trash.dc.html', title: 'Trash', x: X(2), y: Y(7), w: W, h: H },
		{ file: 'Bits.dc.html', title: 'Menus, validation, undo, errors, retry · dark', x: X(0), y: Y(8), w: W, h: H },
		{ file: 'FilesLoading.dc.html', title: 'Files · loading skeleton', x: X(1), y: Y(8), w: W, h: H },
		{ file: 'FilesOffline.dc.html', title: 'Files · offline banner · dark', x: X(2), y: Y(8), w: W, h: H },
		{ file: 'Intro.dc.html', title: 'First sign-in · network drive intro', x: X(0), y: Y(9), w: W, h: H },
		{ file: 'IntroWin.dc.html', title: 'Intro · Windows wording · dark', x: X(1), y: Y(9), w: W, h: H },
		{ file: 'SettingsDrive.dc.html', title: 'Settings · Network drive · connected', x: X(2), y: Y(9), w: W, h: H },
		{ file: 'DriveStates.dc.html', title: 'Network drive · states & toasts · dark', x: X(0), y: Y(10), w: W, h: H },
		{ file: 'SidebarMenu.dc.html', title: 'Sidebar · account menu open · dark', x: X(1), y: Y(10), w: W, h: H },
		{ file: 'SidebarClean.dc.html', title: 'Sidebar · no server button', x: X(2), y: Y(10), w: W, h: H },
		{ file: 'SidebarOpen.dc.html', title: 'Collapsible sidebar · open · toggle in title bar', x: X(0), y: Y(11), w: W, h: H },
		{ file: 'SidebarHidden.dc.html', title: 'Collapsible sidebar · hidden · dot on toggle · dark', x: X(1), y: Y(11), w: W, h: H },
		{ file: 'SidebarMotion.dc.html', title: 'Collapsible sidebar · motion storyboard', x: X(2), y: Y(11), w: W, h: H },
		{ file: 'WinOpen.dc.html', title: 'Windows · frameless · lights in the sidebar row · dark', x: 0, y: Y(12), w: 1440, h: 900 },
		{ file: 'WinHidden.dc.html', title: 'Windows · frameless · sidebar hidden', x: 1540, y: Y(12), w: 1440, h: 900 },
		{ file: 'WinBits.dc.html', title: 'Windows · controls, before/after, behaviour · dark', x: 3080, y: Y(12), w: W, h: H },
		{ file: 'TrayMac.dc.html', title: 'Background · macOS menu bar + Dock badge · dark', x: 0, y: Y(13), w: 1440, h: 900 },
		{ file: 'TrayWin.dc.html', title: 'Background · Windows tray + taskbar badge · dark', x: 1540, y: Y(13), w: 1440, h: 900 },
		{ file: 'BackgroundBits.dc.html', title: 'Background · menu states, notifications, settings, quit · dark', x: 3080, y: Y(13), w: W, h: 960 },
		{ file: 'UpdateDialog.dc.html', title: 'Self-update · new version dialog', x: X(0), y: Y(14), w: W, h: H },
		{ file: 'UpdateReady.dc.html', title: 'Self-update · ready to restart · sidebar pill · dark', x: X(1), y: Y(14), w: W, h: H },
		{ file: 'SettingsUpdates.dc.html', title: 'Settings · Updates section', x: X(2), y: Y(14), w: W, h: H },
		{ file: 'UpdateStates.dc.html', title: 'Self-update · six dialog states · dark', x: 0, y: Y(15), w: 1440, h: 800 },
		{ file: 'UpdateBits.dc.html', title: 'Self-update · settings states, menu bar, notification, behaviour · dark', x: 1540, y: Y(15), w: W, h: 900 },
		{ file: 'DragMove.dc.html', title: 'Drag to move · folder onto folder', x: X(0), y: Y(16), w: W, h: H },
		{ file: 'FolderDetails.dc.html', title: 'Folder details · size and item count', x: X(1), y: Y(16), w: W, h: H },
		{ file: 'SettingsStartup.dc.html', title: 'Settings · Startup', x: X(2), y: Y(16), w: W, h: H },
		{ file: 'DragMoveBits.dc.html', title: 'Drag to move · targets, ghosts, toasts, platform matrix · dark', x: 0, y: Y(17), w: W, h: 830 },
		mobile('MServers.dc.html', 'Servers', 0, 0),
		mobile('MSignIn.dc.html', 'Add server', 1, 0),
		mobile('MFiles.dc.html', 'Files · list', 2, 0),
		mobile('MFilesCard.dc.html', 'Files · card · dark', 3, 0),
		mobile('MEmpty.dc.html', 'Empty folder', 4, 0),
		mobile('MActions.dc.html', 'File actions sheet', 0, 1),
		mobile('MSelect.dc.html', 'Multi-select', 1, 1),
		mobile('MUpload.dc.html', 'Upload sheet', 2, 1),
		mobile('MConflict.dc.html', 'Upload conflict · dark', 3, 1),
		mobile('MSearch.dc.html', 'Search · everywhere · dark', 4, 1),
		mobile('MPreview.dc.html', 'Preview · dark', 0, 2),
		mobile('MTransfers.dc.html', 'Transfers', 1, 2),
		mobile('MRecent.dc.html', 'Recent · dark', 2, 2),
		mobile('MSettings.dc.html', 'Settings', 3, 2)
	],
	pages: [
		{ id: 'desktop', name: 'Desktop' },
		{ id: 'mobile', name: 'Mobile' }
	],
	annotations: [
		{
			id: 'intro',
			x: 0,
			y: -300,
			w: 640,
			text: 'Soteria — mockup UI cho app WebDAV (Wails 3 · Svelte 5 · Tailwind · GSAP).\nMỗi artboard có công tắc Dark ở thanh tweak phía trên khung: bật để xem bản tối của bất kỳ màn nào.\nHàng 1: chọn server & đăng nhập · Hàng 2: duyệt tệp · Hàng 3: transfers, thư mục rỗng, settings · Hàng 4: dialog & menu.'
		},
		{
			id: 'row-onboarding',
			x: 0,
			y: Y(0) - 130,
			w: 560,
			text: 'Đăng nhập: chọn server đã lưu, hoặc Add server để tới form. Nếu chưa lưu mật khẩu, server đã lưu cũng mở form này với địa chỉ điền sẵn. Bản dark bên phải minh hoạ trạng thái lỗi kết nối.'
		},
		{
			id: 'row-files',
			x: 0,
			y: Y(1) - 130,
			w: 560,
			text: 'Duyệt tệp: sidebar đổi server, Files / Recent / Transfers, cây thư mục gốc, quota lấy từ server. Click một tệp mở panel chi tiết bên phải (metadata WebDAV: Content-Type, ETag). Recent dùng lại bảng này, sắp theo Modified.'
		},
		{
			id: 'row-tools',
			x: 0,
			y: Y(2) - 130,
			w: 560,
			text: 'Transfers: hàng đợi upload/download với tốc độ, pause, huỷ. Thư mục rỗng: vùng kéo-thả. Settings: đăng xuất, theme, thư mục tải về, số luồng, chứng chỉ tự ký, dung lượng.'
		},
		{
			id: 'row-dialogs',
			x: 0,
			y: Y(3) - 130,
			w: 560,
			text: 'Dialog & menu: menu chuột phải, tạo thư mục, đổi tên, xoá (WebDAV không có thùng rác), di chuyển, trùng tên khi upload, toast.'
		},
		{
			id: 'row-preview',
			x: X(1),
			y: Y(3) - 130,
			w: 620,
			text: 'Preview: click một tệp xem được (ảnh, PDF, video, audio, text/markdown/code, docx) mở chế độ xem toàn cửa sổ; Esc hoặc nút X để đóng, Download ngay trên header. Ảnh, PDF, video, audio, text do webview tự render; docx chuyển sang HTML bằng mammoth. Tệp không xem được (zip, apk, xlsx, dmg…) vẫn mở panel chi tiết như cũ. Trong panel chi tiết, ô thumbnail hiển thị ảnh thật và click vào cũng mở preview.'
		},
		{
			id: 'row-views',
			x: 0,
			y: Y(4) - 130,
			w: 640,
			text: 'Hai chế độ xem + sắp xếp. Header thêm nút Sort (menu: Name, Kind, Size, Date modified, Date created; Ascending/Descending) và công tắc List/Card. Card view: thư mục và tệp đều là card, tệp ảnh hiện thumbnail thật. List view: một bảng chung, thư mục luôn nằm trên, có cột Created; click tiêu đề cột cũng đổi sắp xếp. Lựa chọn view và sort được nhớ giữa các lần mở.'
		},
		{
			id: 'row-search',
			x: X(2),
			y: Y(4) - 130,
			w: 600,
			text: 'Tìm toàn server: gõ vào ô Search vẫn lọc thư mục hiện tại như cũ; chuyển sang "Everywhere" (hoặc nhấn Enter) để tìm trong toàn bộ cây. Backend lấy cả cây bằng một PROPFIND Depth: infinity (SFTPGo hỗ trợ), cache trong bộ nhớ, tìm ngay tại máy; có nút Refresh và thời điểm lập chỉ mục. Kết quả hiện tên (tô đoạn khớp) và đường dẫn; click vào mở đúng thư mục và chọn tệp. Lần đầu (artboard dark) chỉ mục xây dần, kết quả hiện dần, vẫn duyệt được trong lúc chờ. Tôn trọng công tắc Show hidden files.'
		},
		{
			id: 'row-batch',
			x: X(1),
			y: Y(5) - 130,
			w: 640,
			text: 'Chọn nhiều: Cmd-click thêm/bớt, Shift-click chọn dải, Cmd-A chọn hết, Esc hoặc click nền bỏ chọn; header hiện chip "3 selected". Panel phải thành bản tóm tắt: số mục, tổng dung lượng, danh sách, và các thao tác hàng loạt Download / Move / Delete; menu chuột phải và kéo ra Finder cũng áp dụng cho cả nhóm. Upload trùng tên: dialog so sánh bản trên server và bản của bạn, Skip / Keep both (đổi tên thành "name 2.ext") / Replace, có ô "Do this for the remaining N files". Với thư mục trùng tên: Merge / Keep both / Skip.'
		},
		{
			id: 'row-upload',
			x: X(2),
			y: Y(6) - 130,
			w: 620,
			text: 'Upload panel: thẻ 380px nổi ở góc dưới phải vùng Files, xuất hiện ngay khi bắt đầu upload (thả tệp, nút Upload, upload thư mục) và nằm ở shell nên vẫn còn khi đổi thư mục hay sang Recent; ẩn trên trang Transfers vì trùng. Header: tiêu đề "Uploading 3 of 12 items", dòng phụ dung lượng + thời gian còn lại, thanh tiến độ tổng; nút ▾ thu gọn, nút × đóng. Mỗi dòng là một mục: thư mục là một dòng tổng (38 / 128 tệp), tệp đang chạy có thanh tiến độ + tốc độ + × huỷ, tệp chờ ghi "Waiting", tệp xong có dấu ✓ và khi rê chuột hiện "Show in folder" (mở đúng thư mục, chọn tệp). Thứ tự: đang chạy → chờ → xong. Footer: "Open Transfers" và "Cancel all". Toast "Uploaded 3 files" bỏ, panel thay thế; toast chỉ còn cho lỗi ngoài upload.'
		},
		{
			id: 'row-upload-2',
			x: 0,
			y: Y(7) - 130,
			w: 640,
			text: 'Trạng thái panel: thu gọn còn một dòng "Uploading 3 of 12 items · 42%" với thanh tiến độ mảnh; xong hết đổi thành "12 items uploaded" (dấu ✓, không tự đóng, giữ tới khi bấm × hoặc bắt đầu đợt upload mới thì gộp vào). Bấm × khi đang chạy hỏi "Cancel 9 remaining uploads?". Tệp trùng tên xếp vào "waiting for your decision" với nút Resolve mở dialog trùng tên hiện có, các tệp khác vẫn tiếp tục; tệp lỗi có Retry từng dòng và "Retry all" ở footer, thanh tổng chuyển màu vàng. Kéo tệp vào cửa sổ: vùng nội dung phủ lớp mờ + viền đứt màu accent, ghi rõ thư mục đích và số mục; panel thu gọn vẫn hiện ở góc. Chỉ áp dụng cho upload; download (kéo ra Finder) vẫn xem ở Transfers.'
		},
		{
			id: 'row-trash',
			x: X(2),
			y: Y(7) - 130,
			w: 620,
			text: 'Thùng rác: Delete không xoá thật mà MOVE vào /.trash/<mốc thời gian>/<tên> trên server, kèm một tệp .origin ghi thư mục gốc để Restore trả về đúng chỗ (tạo lại thư mục cha nếu thiếu, trùng tên thì thêm " 2"). Không còn dialog xác nhận khi xoá; thay bằng toast "Moved … to Trash · Undo" 6 giây. Thư mục .trash bị ẩn ở mọi nơi (Files, search, Recent, index) kể cả khi bật Show hidden files; chỉ mục Trash ở sidebar mới xem được. Trang Trash: tên, vị trí gốc, thời điểm xoá, dung lượng; rê chuột hiện Restore / Delete now; header có Restore all và Empty Trash (hỏi xác nhận vì không hoàn tác được). Mục quá 30 ngày được dọn tự động lúc kết nối. Lưu ý .trash vẫn tính vào quota trên server.'
		},
		{
			id: 'row-bits',
			x: 0,
			y: Y(8) - 130,
			w: 700,
			text: 'Menu item thêm Copy ⌘C / Cut ⌘X / Duplicate / Copy to…; Delete đổi thành Move to Trash ⌘⌫. Chuột phải vùng trống: New folder, Upload files…, Paste N items (mờ khi clipboard rỗng), Select all, Refresh ⌘R. Copy dùng WebDAV COPY, trùng tên thì thêm " copy". Kiểm tra tên ngay trong dialog: rỗng, chứa "/", chỉ toàn khoảng trắng, "." hoặc "..", trùng tên trong thư mục → báo đỏ dưới ô và khoá nút. Lỗi từ server đổi sang câu dễ hiểu theo mã HTTP (403 quyền, 404 không còn tồn tại, 409 thư mục đích không có, 412 trùng tên, 423 bị khoá, 507 hết dung lượng, 5xx lỗi server, lỗi mạng "Can’t reach the server"). Transfers: dòng lỗi/huỷ có Retry, ghi rõ không thể tạm dừng. Skeleton: khối mờ nhấp nháy nhẹ thay màn trắng, chỉ hiện nếu tải quá 150 ms. Offline: banner vàng dưới header, giữ danh sách cũ (làm mờ), tự thử lại 2→4→8→30 s, có Retry now; khi nối lại hiện banner xanh 3 s và tải lại thư mục hiện tại.'
		},
		{
			id: 'row-intro',
			x: 0,
			y: Y(9) - 130,
			w: 720,
			text: 'Giới thiệu lần đầu (theo mẫu ChatGPT Atlas): thẻ 560px giữa màn, nền tối mờ phía sau; nửa trên là banner với linh vật Bo và cửa sổ Finder nghiêng có mục "Soteria" trong Locations; nửa dưới là nhãn "New · Network drive", tiêu đề, một đoạn giải thích, 3 lợi ích (mở và lưu từ mọi app, kéo thả trong Finder, không sync không trùng lặp), một dòng lưu ý thật (cùng mạng mới nhanh, truyền lớn vẫn nhanh hơn trong app), nút "Connect to Finder" và "Not now", ghi chú đổi được trong Settings. Thẻ chỉ hiện một lần cho mỗi server sau lần đăng nhập đầu; "Not now" ghi nhớ và không hỏi lại. Windows đổi chữ thành File Explorer / Map as network drive, lưu ý cần HTTPS và giới hạn 4 GB. Settings thêm mục Network drive: công tắc "Show Soteria in Finder" kèm trạng thái Connected · /Volumes/Soteria, công tắc "Connect automatically", nút Show in Finder và What is this? (mở lại thẻ giới thiệu). Bốn trạng thái: off (mặc định), connecting, connected, error có Try again. Toast khi nối xong, khi lỗi, khi eject.'
		},
		{
			id: 'row-sidebar',
			x: X(1),
			y: Y(10) - 130,
			w: 640,
			text: 'Sidebar mới: bỏ hẳn nút server ở trên (tên và địa chỉ lặp nhau), điều hướng Files / Recent / Transfers / Trash nằm ngay dưới thanh tiêu đề. Hàng avatar ở đáy thành nút menu: dòng chính là tên đăng nhập, dòng phụ là tên server, mũi tên gợi ý bấm. Popover mở lên phía trên gồm: header có tên và địa chỉ server, Settings, Switch server… (thay cho nút server cũ), Sign out. Nút bánh răng bỏ; kết nối Finder chỉ điều khiển trong Settings. Thanh Storage giữ nguyên ở trên hàng avatar. Theme chỉ để trong Settings để không lặp.'
		},
		{
			id: 'row-collapse',
			x: 0,
			y: Y(11) - 130,
			w: 700,
			text: 'Sidebar thu gọn theo mẫu Granola: một nút toggle nằm ngay cạnh ba nút cửa sổ ở đầu sidebar. Bấm nút thì sidebar trượt sang trái và biến mất, vùng nội dung nới ra chiếm toàn bề rộng; khi ẩn, nút toggle chuyển lên header chính và mang chấm màu nếu có transfer đang chạy hoặc đang offline, để không mất thông tin từ sidebar. Bấm lại thì trượt về đúng chỗ cũ. Không có thanh icon thu gọn, không có hover-peek. Storyboard bên phải ghi timeline GSAP: dùng Flip cho phần layout (nới nội dung) để không animate width, sidebar dịch bằng transform x + autoAlpha, chữ tan trước 60 ms với stagger nhẹ, cùng một timeline đảo chiều khi mở lại, reduced-motion thì tắt animation qua gsap.matchMedia.'
		},
		{
			id: 'row-win',
			x: 0,
			y: Y(12) - 130,
			w: 760,
			text: 'Windows: bỏ thanh caption native (frameless), app tự vẽ ba nút theo macOS ở đúng chỗ traffic lights: đỏ đóng, vàng thu nhỏ, xanh phóng to (đang phóng to thì thành khôi phục). Hàng 52px đầu sidebar trở thành title bar thật: kéo để di chuyển, double-click để phóng to. Ẩn sidebar thì ba nút và nút mở sidebar dời lên đầu header trang, nội dung bắt đầu từ 76px như trên Mac. Mất focus ba nút chuyển xám, rê chuột mới hiện glyph. Chỉ mất flyout Snap Layouts khi rê lên nút phóng to; Win+Z, kéo vào mép, Alt+F4, Alt+Space giữ nguyên. Windows 11 vẽ bo góc và bóng. macOS không đổi gì.'
		},
		{
			id: 'row-bg',
			x: 0,
			y: Y(13) - 130,
			w: 760,
			text: 'Gói chạy nền: đóng cửa sổ không thoát app nữa, app sống trong menu bar (Mac) hoặc tray (Windows) để network drive không bị eject. Icon là Bo dạng nét đơn sắc, có chấm khi đang truyền, mờ khi offline. Menu native: header tên app + trạng thái kết nối + tài khoản, Open Soteria, dòng tiến độ transfers + Open Transfers, Show in Finder/File Explorer + Disconnect Drive (hoặc Connect Drive), Quit/Exit. Badge trên Dock và taskbar = số transfer đang chạy. Thông báo hệ thống một lần cho mỗi hàng đợi xong, chỉ khi cửa sổ đang ẩn hoặc app khác ở trước; lỗi thì báo số file và nút Retry; lần đầu ẩn cửa sổ có một thông báo nhắc app vẫn chạy. Settings thêm mục Background với hai công tắc; tắt thì đóng cửa sổ là thoát như hiện tại. Quit khi còn transfer hỏi xác nhận.'
		},
		{
			id: 'row-update',
			x: 0,
			y: Y(14) - 130,
			w: 760,
			text: 'Tự cập nhật: dùng khung updater có sẵn của Wails (pkg/updater + provider GitHub Releases), UI tự vẽ trong cửa sổ chính thay cho cửa sổ mặc định của Wails. Kiểm tra lúc mở app (sau 10 s) và mỗi 6 giờ, hoặc bấm Check for updates trong Settings / menu app; bản dev không kiểm tra. Có bản mới thì hiện dialog: phiên bản, dung lượng, ngày phát hành, ghi chú phát hành lấy từ GitHub, ba nút Skip this version / Later / Update now. Update now tải nền (thanh tiến độ, Hide để tiếp tục ngầm), xác minh SHA-256 theo SHA256SUMS.txt, rồi chuyển sang Ready: Restart & update thoát app, helper thay Soteria.app / Soteria.exe và mở lại; còn transfer đang chạy thì cảnh báo vàng. Later ở bước Ready để lại pill “Soteria 0.2.0 is ready · Restart” ở đáy sidebar và một dòng trong menu bar/tray; cửa sổ đang ẩn thì có thông báo hệ thống. Lỗi tải hay sai checksum: Try again hoặc Download from GitHub. Chạy từ DMG hoặc bản cài Program Files cũ không thay tại chỗ được → dẫn tới trang release. Settings thêm mục Updates: thẻ phiên bản + trạng thái và công tắc kiểm tra tự động. CI đổi tên asset thành Soteria-<v>-darwin-arm64 / darwin-amd64 / windows-amd64 (.zip) và cài Windows theo per-user để tự cập nhật không cần UAC.'
		},
		{
			id: 'row-dnd',
			x: 0,
			y: Y(16) - 130,
			w: 760,
			text: 'Gói kéo-thả và khởi động: (1) Kéo để di chuyển trong app — thư mục giờ kéo được ở cả hai nền tảng, thả lên thư mục khác (hàng, thẻ, hoặc breadcrumb) là MOVE, có ring accent và chữ "Move here"; từ chối thả lên chính nó, vào thư mục con của nó, hoặc lên thư mục nó đang nằm trong. Kéo hàng đang chọn thì lấy cả nhóm. Trùng tên: MOVE không ghi đè nên phần nào được thì chuyển, phần còn lại nêu tên trong một toast. Mỗi lần chuyển có toast Undo dùng lại cơ chế của Trash. Trên macOS tệp vẫn kéo ra Finder như cũ (một cử chỉ kéo native chỉ đi được một hướng), muốn chuyển tệp thì dùng ⌘X ⌘V hoặc "Move to…". (2) Kéo ra Explorer trên Windows: đường DownloadURL hiện tại không bao giờ tải được gì (asset server của Wails trên Windows không có socket thật, và DownloadURL chỉ mang một tệp), nên đổi thành di chuyển nội bộ + một toast trung thực chỉ sang Download hoặc network drive; toast chỉ hiện một lần mỗi phiên và chỉ khi kéo tệp (không phải thư mục) ra khỏi cửa sổ rồi thả không trúng gì; drop source OLE thật để lại đến khi có máy Windows. (3) Panel chi tiết: chọn thư mục giờ hiện panel, dòng phụ đọc "Folder · 128 items · 1.4 GB" và một dòng Contains, số liệu lấy từ chỉ mục tìm kiếm, chưa crawl thì ghi "Not indexed yet". (4) Settings thêm mục Startup: "Open Soteria when you log in" (Wails AutostartManager: SMAppService trên macOS 13+, HKCU Run trên Windows) và "Reconnect to the last server" — mục thứ hai là điều kiện để mở lúc đăng nhập có ý nghĩa, vì hiện tại mở app lên là về màn hình chọn server nên drive không tự nối lại. Tự nối lại chỉ chạy một lần mỗi lần mở app, nên "Switch server…" vẫn dùng được; lỗi kết nối có toast, chỉ trường hợp không có mật khẩu trong Keychain là im lặng.'
		},
		{
			id: 'm-intro',
			page: 'mobile',
			x: 0,
			y: -260,
			w: 720,
			text: 'Mobile (Android / iOS) — cùng token, font và ngôn ngữ với bản desktop, bố cục lại cho một tay cầm. Khung 390×844; vùng status bar để trống 54px, tab bar chừa 34px cho home indicator. Điều hướng chính bằng tab bar dưới: Files · Recent · Transfers · Settings (Settings thay cho nút server ở sidebar). Mọi hàng cao ≥ 44pt; menu chuột phải → nhấn giữ hoặc nút ⋯ mở action sheet từ đáy; hover/tooltips không dùng.'
		},
		{
			id: 'm-row-1',
			page: 'mobile',
			x: 0,
			y: MY(0) - 120,
			w: 720,
			text: 'Hàng 1 — Đăng nhập và duyệt tệp. Danh sách server là thẻ lớn, chấm xanh = đang kết nối. Form Add server: input cao 48, mắt hiện mật khẩu, checkbox tròn. Files có 2 view (List / Card, 2 cột) đổi bằng nút ở header, nút ⋯ mở sheet Sort + Show hidden files; nút + (FAB) là điểm upload duy nhất. Thư mục: chạm vào là vào thẳng (không có bước chọn như desktop); tệp: chạm mở preview nếu xem được, ngược lại mở sheet chi tiết.'
		},
		{
			id: 'm-row-2',
			page: 'mobile',
			x: 0,
			y: MY(1) - 120,
			w: 720,
			text: 'Hàng 2 — Thao tác. Sheet tệp: Preview, Download, Rename, Move, Copy URL, Delete. Chọn nhiều: nhấn giữ một hàng vào chế độ chọn; header đổi thành X · "3 selected" · Select all; tab bar thay bằng thanh Download / Move / Delete. Upload sheet: ảnh & video (photo picker), tệp (document picker), New folder — kéo-thả và upload thư mục không có trên mobile. Trùng tên: dialog giữa màn với 3 nút xếp dọc. Search chiếm cả header, phạm vi This folder / Everywhere, kết quả kèm đường dẫn.'
		},
		{
			id: 'm-row-3',
			page: 'mobile',
			x: 0,
			y: MY(2) - 120,
			w: 720,
			text: 'Hàng 3 — Preview toàn màn (nền tối, vuốt ngang qua tệp kế, chấm chỉ vị trí), Download và ⋯ ở header. Transfers: thẻ nhóm thư mục ở trên, hàng tệp có progress mảnh, X huỷ; Clear ở header. Recent: nhóm Today / Yesterday / Earlier; chạm mở đúng thư mục. Settings: tài khoản + Sign out, Theme (System / Light / Dark), dung lượng, phiên bản — không có mục thư mục tải về (dùng thư mục app / Files) và số luồng.'
		},
		{
			id: 'row-recent',
			x: 0,
			y: Y(6) - 130,
			w: 640,
			text: 'Upload thư mục: thả thư mục vào là tạo cây thư mục trên server (MKCOL) rồi đưa từng tệp vào hàng đợi; Transfers có thẻ tóm tắt cho cả thư mục (số tệp, dung lượng, Cancel all) phía trên các dòng tệp. Recent: mục mới ở sidebar, liệt kê tệp mới sửa trên toàn server lấy từ chỉ mục tìm kiếm, nhóm theo Hôm nay / Hôm qua / Tuần này; click mở đúng thư mục. Ghi nhớ thư mục cuối: mở lại app vào đúng server thì vào thẳng thư mục lần trước, không có UI riêng.'
		}
	],
	launch: { view: 'canvas', page: 'desktop' }
};

writeFileSync(join(OUT, 'canvas.json'), JSON.stringify(canvas, null, 2) + '\n');
console.log(`wrote ${Object.keys(files).length} artboards + canvas.json to ${OUT}`);
