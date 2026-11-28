/* Brand book (Le Livre) · The Cat & Gun. Kopie von livre.js der Vorlage (Culinarium Hannover _werkzeuge/livre/livre.js), umgebaut nur in Kleid, Inhalt,
   Sprache (Englisch) und Umfang (AUFTRAG.md): Fotos mit Suche und fertigen Grössen, Logo & files (Wortmarke, Zeichen, Tapete, Farben, Schriften),
   Colour check (Farben eines Entwurfs messen, ohne KI, im Browser), Style guide (buch.html).
   Alles liest aus dem Markenfundus (_werkzeuge/fundus/fundus.js, nur lesen; veröffentlichter Stand). Ändern führt in den Brand book editor.
   Keine KI (CLAUDE.md): die Urteile der Markenprüfung der Vorlage entfallen, die Farbmessung bleibt.
   Namen der Werkzeuge nur aus WO_HAUS.namen (oberflaeche/kleid/catgun.js, eine Stelle).
   Gespeichert wird nichts, ausser «Save result» legt auf Wunsch eine Datei auf diesem Rechner ab. Fehlermelder, Ladezeichen und Startfehler laufen vorher in start.js. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
const PU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v9M3.8 7 8 11.2 12.2 7M3 14h10"/></svg>';
const PO = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 12V3M3.8 7 8 2.8 12.2 7M3 14h10"/></svg>';
const ZU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 9.67 2.67 6.33 6 3M2.67 6.33h7.33a3.33 3.33 0 0 1 0 6.67h-2"/></svg>';   // Vorlage: kein «×», auch nicht zum Schliessen; der Zurück-Pfeil
const LUPE = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3.5 3.5"/></svg>';
const KOPIE = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="8.5" height="8.5" rx="1.6"/><path d="M3 10.5V3.8A1.3 1.3 0 0 1 4.3 2.5H10.5"/></svg>';
const STIFT = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.6 2.6 13.4 5.4 5.6 13.2H2.8v-2.8z"/><path d="M9.2 4l2.8 2.8"/></svg>';
const S_ = 'the-cat-and-gun';
const ZEICHEN_N = `<img src="/the-cat-and-gun/haus/_werkzeuge/livre/_ob/kleid/catgun-zeichen.svg" alt="" width="40" height="40" decoding="async">`;
const MARKE = 'buch.html';
/* Wege zu den anderen Werkzeugen: WO_HAUS.wege (kleid/catgun.js schreibt sie lokal auf 127.0.0.1:<port> um, online bleiben sie relativ) */
const WEG_ZU = (teil, pfad) => (window.WO_HAUS && WO_HAUS.wege && WO_HAUS.wege[teil]) || pfad;
const MAISON = WEG_ZU('zentrale', '/the-cat-and-gun/haus/_werkzeuge/maison/');
const EDITOR = WEG_ZU('markeneditor', '/the-cat-and-gun/haus/_werkzeuge/markenbuch-editor/');
const WEBSITE = '/';
const IMPRIMERIE = WEG_ZU('druck', '/the-cat-and-gun/haus/_werkzeuge/imprimerie/');

/* ---------------------------------------------------------------- Sprache der Oberfläche: Englisch (CLAUDE.md), eine Sprache */
const SPRACHEN = [['en', 'EN', 'English']];
const T = {
en: {
  name: '{marke}', unter: 'Brand · The Cat & Gun', start: 'Overview', arbeiten: 'Work', nachschlagen: 'Look up', bilder: 'Photos', dateien: 'Logo & files', pruefung: 'Colour check', buch: 'Style guide',
  anleitung: 'Guide', maison: '{zentrale}', website: 'View website', sprache: 'Language', rundgang: 'Short tour', bereiche: 'Sections', editor: '{markeneditor}',
  frage: 'Where do we start?',
  start_satz: 'The brand of The Cat & Gun in one place: all photos of the house in ready sizes for Instagram, the website and print, the wordmark and the ampersand as files, the colours with their values and the fonts. Everything comes from the {markeneditor}.',
  k_bilder: 'All photos of the house. Each one as a post, a story, for the website or for print.',
  k_dateien: 'The wordmark and the ampersand for light and dark grounds, the pattern, the colour values to copy and the fonts.',
  k_pruefung: 'A draft as a picture. Each colour in it is shown next to the closest colour of the house.',
  k_buch: 'Wordmark, colours, fonts, stickers, photos and the lines of the house on a few pages, ready to print.',
  oeffnen: 'Open', lesen: 'Read', aendern: 'Change', aendern_lang: 'Change in the {markeneditor}',
  z_haus: 'of the house', z_hoch: 'uploaded', z_dateien: 'Files', formate: 'Formats', z_farben: 'House colours',
  stand: '{0} photos · {1} files',
  recht_t: 'Photo source', recht: 'The photos come from the Instagram account of the house, @thecatandgun. The photo window shows the post of each photo.',
  alles_zip: 'All files (ZIP)',
  b_titel: 'All photos', b_satz: 'Click a photo to open it. There you get it in the size you need, and for post and story you choose the crop.',
  suchen: 'Search: pool, juice, bagel', bereich: 'Section', format: 'Format', herkunft: 'Source', alle: 'All',
  f_hoch: 'Portrait', f_quer: 'Landscape', f_quadrat: 'Square',
  h_haus: 'Of the house', h_hochgeladen: 'Uploaded',
  im_titel: 'Design in {druck}', im_beitrag: 'As an Instagram post', im_story: 'As a story', im_satz: 'Opens {druck} with this photo.',
  treffer: '{0} of {1} photos', keine: 'No photo fits. Try one filter less.', mehr: 'Show more', zuruecksetzen: 'Reset filters',
  hoch_lang: 'Uploaded', hoch_satz: 'Uploaded in the {markeneditor}. Use it only if you know who took it.',
  ohne_titel: 'Photo {0}', titel_fehlt: 'No description yet. It can be added in the {markeneditor}.',
  quelle: 'Source', quelle_link: 'View source', original: 'Largest version', laden: 'Get', grossen: 'Sizes', ausschnitt: 'Crop: drag the frame in the picture.',
  g_instagram: 'Instagram post', g_story: 'Story', g_web: 'Website', g_druck: 'Print',
  i_instagram: '1080 × 1350, JPG', i_story: '1080 × 1920, JPG', i_web: 'longest side 2000 px, JPG', i_druck: 'full size, {0} × {1}, JPG', i_druck_web: 'website size (no original stored), JPG',
  ohne_server: 'Without the server part the sizes are cut here in the browser from the website version.',
  d_titel: 'Logo & files', d_satz: 'What a designer or a print shop needs. SVG stays sharp at any size, PNG has a clear background. Every file comes from the brand book as it is published.',
  d_logo: 'The wordmark', d_logo_s: 'THE / CAT & / GUN in three lines, as on the sign and the stickers. In black for light grounds, in white for dark grounds. Never redrawn, never with a shadow.',
  d_wortmarke: 'The ampersand', d_wortmarke_s: 'The «&» of the wordmark on its own, where there is little room.',
  d_tapete: 'Pattern', d_tapete_s: 'The herringbone of the wooden bar front, as the website shows it: on dark and on light.',
  d_farben: 'Colours', d_farben_s: 'A click copies the value. Each group is a palette of the brand book.', d_schriften: 'Fonts',
  d_schriften_s: 'The fonts of the website and the print pieces, exactly the files of the brand book, as WOFF2. All of them in one ZIP.',
  hell: 'for light grounds', dunkel: 'for dark grounds', kopiert: 'Copied',
  v_schwarz: 'Black · on light', v_weiss: 'White · on dark', v_dunkel: 'On dark', v_hell: 'On light',
  datei_wird: 'The file is being made.',
  p_titel: 'Colour check', p_satz: 'Load a draft, for example a poster, a post or a flyer from a designer. The colours are measured and compared with the colours of the house, right here in the browser.',
  p_feld: 'Drag a draft here', p_feld2: 'or choose one · JPG, PNG or WebP, up to 30 MB', p_waehlen: 'Choose file', p_pruefen: 'Measure', p_beispiel: 'View example',
  p_beispiel_h: 'This draft was drawn for this example, the way a designer might send it. The colours are measured exactly as with your own draft.',
  p_privat: 'Nothing is saved or sent. The draft stays in this browser.',
  p_schritt1: 'Read the picture', p_schritt2: 'Measure the colours', p_schritt3: 'Compare with the house', p_dauer: 'This takes a few seconds.',
  p_farben: 'Colours in the design', p_farben_s: 'The strip shows all colours of the design by size. Photos in the design count too.',
  p_liste: 'Colour by colour', p_liste_s: 'The check finds the main colours in the design and puts each one next to the closest colour of the house.',
  p_entwurf: 'Design', p_rest: 'Plus {0} smaller colours, each a small part of the design.',
  p_gleich: 'This is the house colour {0}.', p_nah: 'Close to {0}. Switch to {0} to match the brand.', p_fremd: 'Not a house colour. Nearest is {0}.',
  a_fast_alles: 'Most of the design', a_haelfte: 'About half of the design', a_viertel: 'About a quarter of the design', a_etwas: 'Some of the design', a_klein: 'A small part of the design', a_nichts: 'Almost none of the design',
  p_rahmen: '{0} is in the colours of the house.', p_neu: 'Check a new draft', p_sichern: 'Save result', p_kopie: 'Copy as text',
  p_schwarz: '{0} is pure black. Pure black is not a house colour. The black of the house is called {1}.',
  p_fazit_gut: 'Most of the draft is in the colours of the house.', p_fazit_mittel: 'Part of the draft is in the colours of the house. The list shows which colours to change.', p_fazit_schlecht: 'Most of the draft is in colours that are not in the brand book.',
  p_gesamt: 'Result', p_fehler: 'The check did not work', p_seiten: '{0} × {1} px',
  schliessen: 'Close', fehler_json: 'The brand book data could not be read.',
  p_typ: 'This file is not a picture. Allowed are JPG, PNG and WebP. For a PDF, save the first page as a picture.', p_gross: 'The file is larger than 30 MB.',
  p_kaputt: 'The picture cannot be read. Please save it again as JPG or PNG.', p_riesig: 'The picture has {0} × {1} pixels. Please save it smaller (under 100 megapixels).',
  p_klein: 'The picture is only {0} pixels wide. The colours are measured anyway; for print it is too small.',
  fehler_code: 'The server answered with error {0}.', offline: 'No connection. Please try again when the network is back.',
  tuer_t: '{marke} does not start.', tuer_neu: 'Reload', tuer_hilfe: 'If that does not help: open the guide.',
  neu_da: 'The brand book was changed. This page now shows the new state.'
}
};
const SP = 'en';
/* Namen der Werkzeuge: eine Stelle, WO_HAUS.namen im gemeinsamen Kleid */
let NAMEN = Object.assign({}, (window.WO_HAUS && WO_HAUS.namen) || {});
const mitNamen = s => s.replace(/\{(zentrale|website|karten|gaeste|marke|markeneditor|sticker|besuche|druck)\}/g, (m, k) => NAMEN[k] || m);
const umbenannt = html => { if (!window.WO || !WO.namen) return html; let h = html; for (const k in WO.namen) if (NAMEN[k] && WO.namen[k] && WO.namen[k][1]) h = h.split(WO.namen[k][1]).join(NAMEN[k]); return h; };
const t = (k, ...a) => { let s = T[SP][k]; if (typeof s === 'string') { a.forEach((x, i) => { s = s.split('{' + i + '}').join(x); }); s = mitNamen(s); } return s; };
const zahl = n => Number(n).toLocaleString('en-GB');

/* ---------------------------------------------------------------- Zustand */
const S = { d: null, fd: null, server: null, ansicht: 'start', f: { q: '', b: 'alle', f: 'alle', h: 'alle' }, n: 48, datei: null, ergebnis: null };
const ANSICHTEN = ['start', 'bilder', 'dateien', 'pruefung'];
const FORMATE = { instagram: [1080, 1350], story: [1080, 1920] };

/* ---------------------------------------------------------------- Daten aus dem Fundus in die Form der Vorlage */
function aufbereiten(fd) {
  const adr = p => window.Fundus ? Fundus.adresse(p) : p;
  const fotos = (fd.fotos || []).map(f => {
    const q = String(f.quelle || ''), m = q.match(/https?:\/\/\S+/);
    const r = f.w && f.h ? f.w / f.h : 1;
    return { k: f.id, t: String(f.titel || '').trim(), fs: adr(f.klein || f.gross), fl: adr(f.gross || f.klein), w: f.w || 0, h: f.h || 0,
      f: r > 1.08 ? 'quer' : r < .93 ? 'hoch' : 'quadrat', art: f.herkunft === 'hochgeladen' ? 'hochgeladen' : 'haus',
      q: q.replace(/\s*·?\s*https?:\/\/\S+/, '').trim() || q, u: m ? m[0] : '' };
  });
  const farben = (fd.farben || []).map(f => { const h = String(f.wert || '#000000').toLowerCase(); return { k: f.id, n: f.name, h, r: f.notiz || '', rgb: [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) || 0), welt: f.welt }; });
  const gruppen = (fd.welten || []).map(w => ({ k: w.id, n: w.name, s: w.satz || '', farben: (w.farben || []).map(id => farben.find(f => f.k === id)).filter(Boolean) })).filter(g => g.farben.length);
  const schriften = (fd.schriften || []).map(s => {
    const rollen = (fd.rollen || []).filter(r => r.schrift === s.id).map(r => r.name);
    return { k: s.id, n: s.name, fam: s.familie || s.name, p: s.probe || s.name, r: rollen.join(' · ') || s.wo || '', e: s.wo || '', w: (s.erlaubt || s.schnitte || []).join(' · '), d: adr(s.datei), datei: String(s.datei || '').split('/').pop() };
  });
  const zeichen = (fd.elemente || []).filter(e => e.art === 'zeichen');
  const n_dat = zeichen.length * 2 * 2 + 2 * 2 + 3 + schriften.length + 1;   // wie livre.py zahl_dateien()
  return { fotos, farben, gruppen, schriften, zeichen, texte: fd.texte || [], kennung: fd.kennung || '',
    stand: { fotos: fotos.length, haus: fotos.filter(f => f.art === 'haus').length, hochgeladen: fotos.filter(f => f.art === 'hochgeladen').length, dateien: n_dat, farben: farben.length } };
}

/* ---------------------------------------------------------------- Grundgerüst im Look des Control panel (Robert 26.11.2026) */
/* Bausteine aus dem Bereichs-Entwurf (_entwurf-dashboard/brandbook-bereich/bau.py: ic, knopf, st, rail, held, drei, fotos, farben, dateien, bleiste),
   Klassen mit der Vorsilbe dx- wie dash.css des Control panel (look.css, gebaut von look_bau.py). Seitenleiste wie im Control panel (Fassung 6 «Lack und Gold»),
   «Brand book» darin gold. Unter 1180 px fällt die Seitenleiste weg wie im Control panel; dann führt der Kopf mit «Control panel» zurück. */
const IC = {
  web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18"/>',
  menu: '<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 0-3 3-3 7h3v11"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>',
  buch: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.8-1.8 0-1.3-1-1.6-1-2.6 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  sticker: '<path d="M15 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6l9-9V9a6 6 0 0 0-6-6Z"/><path d="M12 21v-4a5 5 0 0 1 5-5h4"/>',
  druck: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
  besuch: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  guide: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/>',
  haus: '<path d="M3 11 12 4l9 7v9H3z"/><path d="M9 20v-6h6v6"/>',
  uhr: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  tel: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  foto: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  check: '<path d="m5 12 4 4 10-10"/>',
  stift: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  lupe: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  zurueck: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  auge: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  zip: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M10 7h1M10 10h1M10 13h1M10 16h2v3h-2z"/>',
  pipette: '<path d="m14 4 6 6M17 7l-9 9H5v-3l9-9"/>',
  rahmen: '<path d="M7 3v14h14M3 7h14v14"/>',
  kopie: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  hoch: '<rect x="7" y="3" width="10" height="18" rx="2"/>', quer: '<rect x="3" y="7" width="18" height="10" rx="2"/>',
  insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/>',
  datei: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  pfeil: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  aussen: '<path d="M7 17 17 7M8 7h9v9"/>'
};
const ic = (n, c = 'ico') => `<svg class="dx-${c}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ''}</svg>`;
/* Knopf der Vorlage (website-bereich bau.py knopf: .wk, .wk.gold); a mit href, sonst button */
function knopf(text, i, art = '', o = {}) {
  const kl = `dx-wk${art ? ' dx-' + art : ''}${o.kl ? ' ' + o.kl : ''}`, inn = `${i ? ic(i) : ''}<span>${text}</span>`;
  return o.href != null ? `<a class="${kl}" href="${esc(o.href)}"${o.neu ? ' target="_blank" rel="noopener"' : ''} ${o.attr || ''}>${inn}</a>` : `<button class="${kl}" type="button" ${o.attr || ''}>${inn}</button>`;
}
/* Abschnittstitel der Vorlage (st): Zeichen im Kreis, Titel, Zeile in Versalien */
const st = (i, titelT, s, satz = '') => `<div class="dx-stitel" data-r><span class="dx-snr">${ic(i)}</span><div><h3>${titelT}</h3><span class="dx-mono">${s}</span>${satz ? `<p class="li-stsatz">${esc(satz)}</p>` : ''}</div></div>`;
/* Fotos des Fundus in der passenden Fassung der Website (480 / 800 / 1800) */
const fotoVon = k => (S.d && (S.d.fotos.find(f => f.k === k) || null));
function fassung(f, n) {
  if (!f) return '';
  if (n <= 480) return f.fs;
  const m = /-(\d+)\.webp$/.exec(f.fl || '');
  return m && +m[1] > n ? f.fl.replace(/-\d+\.webp$/, `-${n}.webp`) : f.fl;
}
/* Liste fester Fotos des Entwurfs; fehlt eines im Fundus, rückt das nächste unbenutzte Foto nach (nie ein Loch) */
function fotoReihe(ids) {
  const alle = (S.d && S.d.fotos) || [], da = new Set(ids.filter(k => fotoVon(k)));
  const rest = alle.filter(f => !da.has(f.k));
  return ids.map(k => fotoVon(k) || rest.shift()).filter(Boolean);
}
/* Seitenleiste wie im Control panel (maison/index.html, .dx-rail.dx-lack6): acht Werkzeuge mit Tasten 1–8, Öffnungszeit und Telefon, Guides */
const RAIL = [['website', 'web', 'Website', 'Texts, photos, opening hours'], ['karten', 'menu', 'Menus', 'Food and drinks with prices'], ['gaeste', 'chat', 'Guests', 'Guest questions and the chat'],
  ['marke', 'buch', 'Brand book', ''], ['markeneditor', 'palette', 'Brand editor', 'Keeping the brand book up to date'], ['sticker', 'sticker', 'Stickers', 'Stickers with the logo'],
  ['druck', 'druck', 'Print & feed', 'Signs, coasters, posts'], ['besuche', 'besuch', 'Visitors', 'Visits to the website']];
const RAIL_WEG = {
  website: WEG_ZU('website', '/the-cat-and-gun/haus/_werkzeuge/bureau/'), karten: WEG_ZU('karten', '/the-cat-and-gun/haus/_werkzeuge/carte/'), gaeste: WEG_ZU('gaeste', '/the-cat-and-gun/haus/_werkzeuge/reception/'), marke: '#start',
  markeneditor: EDITOR, sticker: WEG_ZU('sticker', '/the-cat-and-gun/haus/_werkzeuge/sticker/'), druck: IMPRIMERIE, besuche: WEG_ZU('besuche', '/the-cat-and-gun/haus/_werkzeuge/registre/')
};
const GUIDES = 'https://tastyrob123.github.io/the-cat-and-gun/schulung/akademie/';
const standZeile = () => S.d ? t('stand', zahl(S.d.stand.fotos), zahl(S.d.stand.dateien)) : '';
function kopf() {
  /* Kopf nur ohne Seitenleiste (unter 1180 px): Wortmarke und der Weg zurück ins Control panel */
  $('#kopf').innerHTML = `<a class="li-mkopf__m" href="${esc(MAISON)}" aria-label="The Cat &amp; Gun · ${esc(t('maison'))}"><span class="li-wm" aria-hidden="true"></span></a>
    ${knopf(esc(t('maison')), 'haus', '', { href: MAISON, kl: 'li-mkopf__k' })}`;
}
function rand() {
  const nav = RAIL.map(([k, i, n, s], x) => {
    const jetzt = k === 'marke';
    return `<a class="${jetzt ? 'dx-jetzt' : ''}" href="${esc(RAIL_WEG[k])}"${jetzt ? ' data-gehe="start" aria-current="page"' : ''} data-taste="${x + 1}"><kbd>${x + 1}</kbd>${ic(i)}<span><b>${esc(n)}</b><i>${esc(jetzt ? standZeile() : s)}</i></span></a>`;
  }).join('');
  $('#rand').innerHTML = `<div class="dx-s6rahmen"><a class="dx-marke" href="${esc(MAISON)}" title="${esc(t('maison'))}"><span class="li-wm" role="img" aria-label="The Cat &amp; Gun"></span><span class="dx-mono">Catangnan, Siargao</span></a>
    <div class="dx-mono dx-rk">Tools <span>keys 1–8</span></div><nav aria-label="Tools">${nav}</nav>
    <div class="dx-rhaus"><span>${ic('uhr')}Open daily 7AM – 10PM</span><span>${ic('tel')}+63 962 040 3853</span></div>
    <div class="dx-rfuss"><a href="${esc(MAISON)}">${ic('haus')}<span><b>${esc(t('maison'))}</b><i>All tools of the house</i></span></a><a href="anleitung.html" target="_blank" rel="noopener">${ic('buch')}<span><b>${esc(t('anleitung'))}</b><i>How the ${esc(NAMEN.marke || 'Brand book')} works</i></span></a><a href="./?rundgang#start">${ic('auge')}<span><b>${esc(t('rundgang'))}</b><i>What is where in this tool</i></span></a><a href="${GUIDES}" target="_blank" rel="noopener">${ic('guide')}<span><b>Guides</b><i>11 videos</i></span></a></div></div>`;
  mitfahren($('#rand'));
  $$('#rand [data-gehe]').forEach(b => b.onclick = e => { e.preventDefault(); gehe(b.dataset.gehe); });
}
/* Mitfahren (Robert 27.11.2026, Funktion mitfahren aus sticker/neu.js, wie Edit website): ab 1200 px geht die Leiste beim Runterscrollen mit,
   bis ihr unteres Ende am Fensterrand steht, und fährt dann mit; beim Hochscrollen fährt sie zuerst hoch, bis ihr oberes Ende oben steht.
   Passt sie ganz ins Fenster, steht sie oben fest. Unter 1200 px bleibt alles wie vorher. */
function mitfahren(rail) {
  if (!rail || rail.dataset.nlFahrt) return; rail.dataset.nlFahrt = '1';
  let y = null, letzt = 0;
  const m = 22;
  function setze() {
    if (innerWidth < 1200 || !rail.offsetHeight) { rail.style.removeProperty('top'); y = null; return; }
    const h = rail.offsetHeight, H = innerHeight, unten = Math.min(m, H - h - m), p = scrollY;
    if (y === null) { y = m; letzt = p; }
    y = Math.max(unten, Math.min(m, y - (p - letzt))); letzt = p;
    rail.style.setProperty('top', y + 'px', 'important');
  }
  addEventListener('scroll', setze, { passive: true });
  addEventListener('resize', setze);
  if ('ResizeObserver' in window) new ResizeObserver(setze).observe(rail);
  setze();
}
/* Tasten 1–8 wie im Control panel: nicht beim Schreiben, nicht mit Zusatztaste */
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented || !/^[1-8]$/.test(e.key)) return;
  const z = e.target; if (z && (z.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(z.tagName))) return;
  const a = $(`#rand a[data-taste="${e.key}"]`); if (!a) return;
  e.preventDefault(); if (a.dataset.gehe) gehe(a.dataset.gehe); else location.href = a.href;
});
function leiste() { $('#leiste').innerHTML = ''; }
/* Leiste unten in jeder Ansicht (bleiste der Vorlage): wo geändert wird, Anleitung, Website, ändern, alle Dateien */
const bleiste = () => `<div class="dx-wleist dx-p li-bleiste" data-r><span class="dx-stp">${ic('check', 'ck')}${esc(mitNamen('Changes are made in the {markeneditor}'))}</span>
  <span class="dx-wr">${knopf(esc(t('anleitung')), 'guide', '', { href: 'anleitung.html', neu: true })}${knopf(esc(t('website')), 'web', '', { href: WEBSITE })}${knopf(esc(t('aendern')), 'stift', '', { href: EDITOR })}${knopf(esc(t('alles_zip')), 'zip', 'gold', { attr: 'data-zip-alle' })}</span></div>`;
/* Reiter der Ansichten im Kopf (tabs der Vorlage), der Style guide als eigene Seite */
const reiter = () => `<nav class="dx-tabs" aria-label="${esc(t('bereiche'))}">${ANSICHTEN.map(a => `<a class="dx-tab${S.ansicht === a ? ' dx-an' : ''}" href="#${a}" data-gehe="${a}"${S.ansicht === a ? ' aria-current="page"' : ''}>${esc(t(a))}</a>`).join('')}<a class="dx-tab" href="${MARKE}">${esc(t('buch'))}</a></nav>`;

function gehe(a) {
  if (S.fensterZu) { S.fensterZu(); S.fensterZu = null; }
  S.ansicht = a; S.foto = null;
  try { localStorage.setItem('cg-livre-ansicht', a); } catch (e) { /* privat */ }
  history.replaceState(null, '', location.pathname + location.search + '#' + a);
  kopf(); rand(); zeichne();
  scrollTo({ top: 0 });
}

/* Startfoto je Ansicht (Kopf rechts, wkopf der Vorlage); bereit() wartet darauf */
const SB_FOTO = { start: 'b13', bilder: 'b36', dateien: 'b35', pruefung: 'b16' };
const buehneVon = a => fassung(fotoVon(SB_FOTO[a] || 'b24') || (S.d && S.d.fotos[0]), a === 'start' ? 800 : 1800) || ((window.WO_HAUS && WO_HAUS.foto) || '');
/* Kopf einer Ansicht (wkopf klein der Vorlage, Bild rechts, Reiter unten) */
function titel(ansicht, h1, satz, kn = '', foto = '') {
  return `<header class="dx-wkopf dx-p dx-klein li-kopf" data-r><div class="dx-wkb" style="background-image:url('${esc(foto || buehneVon(ansicht))}')"></div>
    <div class="dx-wki"><div class="dx-mono">${ic('buch', 'mi')}${esc(NAMEN.marke || 'Brand book')} · ${esc(t(ansicht))}</div><h2>${esc(h1)}</h2><p>${esc(satz)}</p>
    ${kn ? `<div class="dx-wkst">${kn}</div>` : ''}</div>${reiter()}</header>`;
}

function teile(s) { const i = s.lastIndexOf(' '); return i > 0 ? [s.slice(0, i), s.slice(i + 1)] : [s]; }

function zeichne(still = false) {
  const el = $('#ansicht');
  const a = S.ansicht;
  if (a === 'bilder' && S.foto && fotoVon(S.foto)) return detail(S.foto, still);
  S.foto = null;
  el.innerHTML = a === 'bilder' ? bilder() : a === 'dateien' ? dateien() : a === 'pruefung' ? pruefung() : start();
  if (a === 'bilder') bilderLeben(); else if (a === 'dateien') dateienLeben(); else if (a === 'pruefung') pruefungLeben(); else startLeben();
  binde(el);
  auftritte(el, still);
  ordneAlle();
}
/* Gemeinsame Knöpfe jeder Ansicht: Reiter, Foto öffnen, Farbe kopieren, Datei holen, alle Dateien */
function binde(el) {
  $$('[data-gehe]', el).forEach(b => b.onclick = e => { e.preventDefault(); gehe(b.dataset.gehe); });
  $$('[data-foto]', el).forEach(b => b.onclick = e => { e.preventDefault(); detail(b.dataset.foto); });
  $$('[data-kopie]', el).forEach(b => b.onclick = e => { const w = e.target.closest('[data-kopie-w]'); kopiere(w ? w.dataset.kopieW : b.dataset.kopie, b); });
  $$('[data-datei]', el).forEach(a => a.onclick = async e => {
    e.preventDefault(); if (a.dataset.laeuft) return; a.dataset.laeuft = '1';
    try { speichereBlob(await eineDatei(a.dataset.datei, { zeichen: a.dataset.z, v: a.dataset.v, fmt: a.dataset.fmt }), DATEINAME(a)); }
    catch (x) { melde(t('p_fehler') + ': ' + (navigator.onLine === false ? t('offline') : x.message), true); }
    finally { delete a.dataset.laeuft; }
  });
  $$('[data-zip-alle]', el).forEach(z => z.onclick = e => { e.preventDefault(); zipAlle(z); });
  zeichenEinsetzen();
}

/* Auftritte (R17): beim Ansichtswechsel federt nur, was im ersten Bild steht, der Reihe nach, höchstens 22; alles darunter steht sofort. Nur transform. */
/* Auftritte beim Scrollen (CLAUDE.md, Oberflächen-Prüfung Punkt 11, Prüfung 23.11.2026 A1/11): was unter dem ersten Bild steht, schwebt beim Hereinscrollen
   kurz an seinen Platz. Nur transform, deckend ab dem ersten Bild, ausgelöst schon kurz vor dem Rand, damit nie gewartet wird. */
/* Effekte-Standard (Robert 23.11.2026, Schlössli livre.js auftritte()): was gemeinsam hereinkommt, kommt gestaffelt, höchstens vier (--k, 90 ms) */
const SCROLL_IO = 'IntersectionObserver' in window ? new IntersectionObserver(es => { let k = 0; es.forEach(e => {
  if (!e.isIntersecting) return; const x = e.target; SCROLL_IO.unobserve(x); x.style.setProperty('--k', Math.min(k++, 3)); x.classList.remove('kommt'); x.classList.add('da', 'rein');
}); }, { rootMargin: '0px 0px 40px 0px' }) : null;
const RUHIG = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function auftritte(r, still) {
  const alle = $$('[data-r]', r).filter(x => !x.classList.contains('da'));
  if (still || RUHIG()) { alle.forEach(x => x.classList.add('da', 'steht')); return; }
  const H = innerHeight; let n = 0;
  alle.forEach(x => { const b = x.getBoundingClientRect(); if (b.top < H && b.bottom > 0 && n < 22) { x.style.setProperty('--i', Math.min(n++, 6)); requestAnimationFrame(() => requestAnimationFrame(() => x.classList.add('da'))); } else if (b.top >= H && SCROLL_IO) { x.classList.add('kommt'); SCROLL_IO.observe(x); } else x.classList.add('da', 'steht'); });
}

/* Reihen gleichmässig (Fehlerbuch 10a: keine halb leeren Reihen, die letzte Reihe mittig): je Raster die Spaltenzahl, bei der die letzte Reihe am vollsten ist */
function ordne(el) {
  const n = el.children.length; if (!n) return;
  const min = innerWidth < 600 ? parseFloat(el.dataset.minHandy || 140) : parseFloat(el.dataset.min || 180), gap = parseFloat(getComputedStyle(el).columnGap) || 16, W = el.clientWidth;
  const cmax = Math.max(1, Math.min(n, +(el.dataset.max || 4), Math.floor((W + gap) / (min + gap)))), cmin = Math.max(1, Math.min(cmax, Math.ceil(cmax * .6)));
  let best = cmax, wert = -1;
  for (let c = cmax; c >= cmin; c--) { const rest = n % c, v = rest === 0 ? 2 : rest / c; if (v > wert + 1e-9) { wert = v; best = c; } }
  el.style.setProperty('--sp', best);
  if (el.dataset.hoch) el.style.setProperty('--kh', Math.round((W - (best - 1) * gap) / best * +el.dataset.hoch) + 'px');
}
function ordneAlle() { $$('[data-ordne]').forEach(ordne); }
addEventListener('resize', () => { clearTimeout(ordneAlle.u); ordneAlle.u = setTimeout(ordneAlle, 80); });

/* ---------------------------------------------------------------- Übersicht (Fassung A des Bereichs-Entwurfs) */
const HELD_FOTOS = ['b13', 'b24', 'b09', 'b26', 'b25', 'b22'];
const MOSAIK = [['b24', 1], ['b13'], ['b09'], ['b26', 1], ['b25'], ['b22'], ['b16'], ['b19', 1], ['b36'], ['b08'], ['b23'], ['b34'], ['b28'], ['b31'], ['b27']];
function zeichenKachel(z, v, grund, name, satz, klein) {
  return `<div class="dx-dk dx-p" data-r><div class="dx-dkf dx-${grund}${klein ? ' li-dkf--et' : ''}"><span class="li-zfeld" data-zeichen="${esc(z)}" data-farbe="${v}"></span></div>
    <div class="dx-dkt"><div><b>${esc(name)}</b><i>${esc(satz)}</i></div><span class="dx-dkb">${['svg', 'png'].map(f => `<button type="button" data-datei="zeichen" data-z="${esc(z)}" data-v="${v}" data-fmt="${f}" aria-label="${esc(name)} ${f.toUpperCase()}">${f.toUpperCase()}</button>`).join('')}</span></div></div>`;
}
const farbKarte = (f, i = 0) => `<button class="dx-fk dx-p li-fk" type="button" data-r data-kopie="${esc(f.h.toUpperCase())}" style="--i:${i % 6}" aria-label="${esc(f.n)} ${esc(f.h.toUpperCase())}">
    <span class="dx-fkf" style="background:${esc(f.h)}"><span class="li-ok">${esc(t('kopiert'))}</span></span>
    <span class="dx-fkt"><b>${esc(f.n)}</b><span data-kopie-w="${esc(f.h.toUpperCase())}">${esc(f.h.toUpperCase())}</span><em data-kopie-w="rgb(${f.rgb.join(', ')})">RGB ${f.rgb.join(', ')}</em></span></button>`;
const farbHinweis = () => `<div class="dx-fhin dx-p" data-r><span class="dx-stp">${ic('kopie', 'mi')}Click a colour: the value is copied. A click on the RGB line copies the RGB values.</span>
    <span class="dx-wr">${['css', 'json', 'ase'].map(x => `<button class="dx-chip" type="button" data-datei="farben" data-fmt="${x}">${ic('download')}${x.toUpperCase()}</button>`).join('')}</span></div>`;
function start() {
  const st_ = S.d.stand;
  const col = fotoReihe(HELD_FOTOS).map(f => `<div class="dx-hcf" style="background-image:url('${esc(fassung(f, 800))}')"></div>`).join('');
  const vier = fotoReihe(['b14', 'b23', 'b19', 'b36']).map(f => `<i style="background-image:url('${esc(f.fs)}')"></i>`).join('');
  const mos = fotoReihe(MOSAIK.map(x => x[0])).map((f, i) => `<button class="dx-mf${MOSAIK[i][1] ? ' dx-hoch' : ''}" type="button" data-foto="${esc(f.k)}" aria-label="${esc(titelVon(f))}"><img src="${esc(fassung(f, 800))}" alt="" decoding="async" draggable="false"></button>`).join('');
  const sechs = ((S.d.gruppen[0] || {}).farben || S.d.farben).slice(0, 6);
  const schrift = S.d.schriften.map(s => `<span style="font-family:'${esc(s.fam).replace(/'/g, '')}'">${esc(s.n)}</span>`).join('');
  return `<div class="dx-bheld dx-p li-held" data-r><div class="dx-hcol">${col}</div>
      <div class="dx-ghi"><div class="dx-mono">${ic('buch', 'mi')}${esc(NAMEN.marke || 'Brand book')} · The Cat &amp; Gun</div><h2>${esc(NAMEN.marke || 'Brand book')}</h2>
      <p class="dx-ghs">Photos in the right size, logo files and colour values. It saves nothing and changes nothing.</p>
      <div class="dx-wkst"><span class="dx-stp"><i class="dx-pt dx-gr"></i>${esc(standZeile())}</span>${knopf(esc(t('buch')), 'buch', '', { href: MARKE })}${knopf(esc(t('alles_zip')), 'zip', 'gold', { attr: 'data-zip-alle' })}</div>
      ${reiter()}</div></div>
    ${st('buch', 'For every day', 'Three parts')}
    <div class="dx-bdrei">
      <a class="dx-bd dx-p" href="#bilder" data-gehe="bilder" data-r><div class="dx-bdm">${vier}</div>
        <div class="dx-bdt"><span class="dx-o2i">${ic('foto')}</span><b>${esc(t('bilder'))}</b><i>Search, portrait or landscape, four ready sizes</i></div></a>
      <a class="dx-bd dx-p" href="#dateien" data-gehe="dateien" data-r><div class="dx-bdl"><div class="dx-hell"><span class="li-zfeld" data-zeichen="wortmarke" data-farbe="schwarz"></span></div><div class="dx-dunkel"><span class="li-zfeld" data-zeichen="wortmarke" data-farbe="weiss"></span></div></div>
        <div class="dx-bdt"><span class="dx-o2i">${ic('datei')}</span><b>${esc(t('dateien'))}</b><i>Everything a designer or a print shop needs</i></div></a>
      <a class="dx-bd dx-p" href="#pruefung" data-gehe="pruefung" data-r><div class="dx-bdc"><div class="dx-drop" id="li-drop-start">${ic('pipette')}<span>${esc(t('p_feld'))}</span><em>JPG, PNG or WebP, up to 30 MB</em></div></div>
        <div class="dx-bdt"><span class="dx-o2i">${ic('pipette')}</span><b>${esc(t('pruefung'))}</b><i>Does a designer's draft fit the colours of the house?</i></div></a>
    </div>
    ${st('foto', t('bilder'), 'All photos of the house')}
    <div class="dx-bfotos dx-p" data-r><div class="dx-bfk"><a class="dx-such" href="#bilder" data-gehe="bilder">${ic('lupe')}<span>Search, for example</span>${['pool', 'juice', 'bagel'].map(x => `<span class="dx-chip">${x}</span>`).join('')}</a>
      <a class="dx-wk li-alle" href="#bilder" data-gehe="bilder">${ic('foto')}<span>${esc(t('b_titel'))}</span></a><span class="dx-mono">${esc(t('treffer', zahl(st_.fotos), zahl(st_.fotos)))}</span></div>
      <div class="dx-mosaik">${mos}</div></div>
    ${st('palette', 'Colours of the house', 'Name, value and RGB')}
    <div class="dx-bfarben">${sechs.map(farbKarte).join('')}</div>${farbHinweis()}
    ${st('datei', t('dateien'), 'Made from the brand book as it is published')}
    <div class="dx-bdat">
      ${zeichenKachel('wortmarke', 'schwarz', 'hell', 'Wordmark · black', 'For light grounds')}${zeichenKachel('wortmarke', 'weiss', 'dunkel', 'Wordmark · white', 'For dark grounds')}
      ${zeichenKachel('et', 'schwarz', 'hell', 'Ampersand · black', 'For light grounds', true)}${zeichenKachel('et', 'weiss', 'dunkel', 'Ampersand · white', 'For dark grounds', true)}
      <div class="dx-dk dx-p" data-r><div class="dx-dkf dx-muster"></div><div class="dx-dkt"><div><b>Herringbone</b><i>The pattern of the website as a tile</i></div><span class="dx-dkb"><button type="button" data-datei="tapete" data-v="dunkel" data-fmt="svg">SVG</button><button type="button" data-datei="tapete" data-v="dunkel" data-fmt="png">PNG</button></span></div></div>
      <div class="dx-dk dx-p" data-r><div class="dx-dkf dx-schrift">${schrift}</div><div class="dx-dkt"><div><b>${esc(t('d_schriften'))}</b><i>As WOFF2 or in the ZIP</i></div><span class="dx-dkb"><button type="button" data-datei="schriften" data-fmt="zip">ZIP</button></span></div></div>
    </div>
    ${bleiste()}`;
}
function startLeben() {
  /* Entwurf auf die Kachel «Colour check» ziehen: gleich wie im Colour check */
  const d = $('#li-drop-start'); if (!d) return;
  const k = d.closest('.dx-bd');
  ['dragenter', 'dragover'].forEach(n => k.addEventListener(n, e => { e.preventDefault(); d.classList.add('ueber'); }));
  ['dragleave', 'drop'].forEach(n => k.addEventListener(n, e => { e.preventDefault(); d.classList.remove('ueber'); }));
  k.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) { gehe('pruefung'); nimm(f); } });
}
/* ---------------------------------------------------------------- Bildarchiv */
function titelVon(f) { return f.t || t('ohne_titel', f.k.replace(/^b0?/, '')); }
function gefiltert() {
  const F = S.f, q = F.q.trim().toLowerCase();
  return S.d.fotos.filter(f => (F.f === 'alle' || f.f === F.f || (F.f === 'quer' && f.f === 'quadrat'))
    && (F.h === 'alle' || f.art === F.h) && (!q || (f.t + ' ' + f.k + ' ' + f.q).toLowerCase().includes(q)));
}
/* Umschalter der Vorlage (umsch): Format, bei hochgeladenen Fotos auch die Herkunft */
function wahl(key, werte) {
  const sym = { hoch: 'hoch', quer: 'quer' };
  return `<div class="dx-umsch li-wahl" role="group" aria-label="${esc(t(key === 'f' ? 'format' : 'herkunft'))}">
    ${[['alle', t('alle')], ...werte].map(([w, n]) => `<button type="button" data-f="${key}" data-w="${w}" aria-pressed="${S.f[key] === w}">${sym[w] ? ic(sym[w]) : ''}${esc(n)}</button>`).join('')}</div>`;
}
function bilder() {
  const herk = [['haus', t('h_haus')], ['hochgeladen', t('h_hochgeladen')]].filter(([w]) => S.d.fotos.some(f => f.art === w));
  return `${titel('bilder', t('bilder'), t('b_satz'), knopf(esc(t('aendern_lang')), 'stift', '', { href: EDITOR + '#fotos' }))}
    <div class="dx-bfotos dx-p li-filter" data-r>
      <div class="dx-bfk"><label class="dx-such li-suche">${ic('lupe')}<input type="search" id="li-q" value="${esc(S.f.q)}" placeholder="${esc(t('suchen'))}" autocomplete="off" maxlength="200" aria-label="${esc(t('suchen'))}"></label>
        ${wahl('f', [['hoch', t('f_hoch')], ['quer', t('f_quer')]])}${herk.length > 1 ? wahl('h', herk) : ''}
        <span class="li-treffer"><span class="dx-mono" id="li-n"></span><button class="li-link" type="button" id="li-reset">${esc(t('zuruecksetzen'))}</button></span></div>
      <div class="li-raster" id="li-raster" data-ordne data-min="140" data-min-handy="140" data-max="6" data-hoch="1"></div>
      <div class="li-mehr" id="li-mehr"></div>
      <p class="dx-abf li-quelle">${ic('foto', 'mi')}<span><b>${esc(t('recht_t'))}.</b> ${esc(t('recht'))}</span></p>
    </div>
    ${bleiste()}`;
}
function kachel(f, i) {
  return `<button class="li-f li-f--${f.f}" type="button" data-k="${esc(f.k)}" data-r style="--i:${i % 6}" aria-label="${esc(titelVon(f))}">
    <img src="${esc(fassung(f, 800))}" alt="" decoding="async" draggable="false">
    ${f.art === 'hochgeladen' ? `<span class="li-ki li-ki--fremd" title="${esc(t('hoch_lang'))}">${esc(t('hoch_lang'))}</span>` : ''}
    <span class="li-f__n">${esc(titelVon(f))}</span></button>`;
}
function raster(neu = false, mehr = false) {
  const L = gefiltert();
  if (neu) S.n = 48;
  $('#li-n').textContent = t('treffer', zahl(L.length), zahl(S.d.fotos.length));
  const r = $('#li-raster');
  const vor = mehr && !r.querySelector('.li-leer') ? r.children.length : 0;
  if (vor) r.insertAdjacentHTML('beforeend', L.slice(vor, S.n).map((f, i) => kachel(f, vor + i)).join(''));
  else r.innerHTML = L.length ? L.slice(0, S.n).map(kachel).join('') : `<p class="li-leer">${esc(t('keine'))}</p>`;
  r.classList.toggle('li-raster--leer', !L.length);
  $('#li-mehr').innerHTML = L.length > S.n ? knopf(esc(t('mehr')), 'download', '', { attr: 'id="li-mehr-k"' }) : '';
  if ($('#li-mehr-k')) $('#li-mehr-k').onclick = () => { S.n += 48; raster(false, true); };
  [].slice.call(r.children, vor).forEach(b => { if (b.dataset.k) b.onclick = () => detail(b.dataset.k); });
  ordne(r);
  auftritte(r);
  if (S.mehrIO) S.mehrIO.disconnect();
  if ($('#li-mehr-k') && 'IntersectionObserver' in window) { S.mehrIO = new IntersectionObserver(es => { if (es[0].isIntersecting) { S.n += 48; raster(false, true); } }, { rootMargin: '600px' }); S.mehrIO.observe($('#li-mehr-k')); }
}
function bilderLeben() {
  raster(true);
  let uhr;
  $('#li-q').oninput = e => { clearTimeout(uhr); uhr = setTimeout(() => { S.f.q = e.target.value; raster(true); }, 160); };
  $$('[data-f]').forEach(b => b.onclick = () => {
    S.f[b.dataset.f] = b.dataset.w;
    $$(`[data-f="${b.dataset.f}"]`).forEach(x => x.setAttribute('aria-pressed', x === b));
    raster(true);
  });
  $('#li-reset').onclick = () => { S.f = { q: '', b: 'alle', f: 'alle', h: 'alle' }; zeichne(true); };
  if (S.zurueckY != null) { const y = S.zurueckY; S.zurueckY = null; requestAnimationFrame(() => scrollTo({ top: y })); }
}

/* Ein Foto geöffnet (Fassung B des Bereichs-Entwurfs): Kopf, Streifen mit den Nachbarn, grosses Bild mit Rahmen, vier fertige Grössen, Print & feed */
const zusammen = s => { const w = esc(s).split(' '); if (w.length < 2) return w.join(' '); const n = w.length < 3 ? 1 : 2;
  return w.slice(0, -n).join(' ') + ' <span class="li-zus">' + w.slice(-n).join('&nbsp;').replace(/-/g, '&#8209;') + '</span>'; };
const GR_SYM = { instagram: 'insta', story: 'hoch', web: 'web', druck: 'druck' };
function zurueckZuFotos() {
  if (S.fensterZu) { S.fensterZu(); S.fensterZu = null; }
  S.foto = null; history.replaceState(null, '', location.pathname + location.search + '#bilder');
  zeichne(true);
}
function detail(k, still = false) {
  const f = S.d.fotos.find(x => x.k === k); if (!f) return;
  if (S.fensterZu) { S.fensterZu(); S.fensterZu = null; }
  if (!S.foto && S.ansicht === 'bilder') S.zurueckY = scrollY;
  S.ansicht = 'bilder'; S.foto = k;
  history.replaceState(null, '', location.pathname + location.search + '#bilder/' + encodeURIComponent(k));
  const fx = { instagram: { x: .5, y: .5 }, story: { x: .5, y: .5 } };
  let aktiv = 'instagram';
  const imp = g => `${IMPRIMERIE}?foto=${encodeURIComponent(k)}&art=${g === 'story' ? 'story' : 'insta'}&x=${fx[g].x.toFixed(3)}&y=${fx[g].y.toFixed(3)}`;
  const link = g => S.server ? `api/bild?k=${encodeURIComponent(k)}&f=${g}${fx[g] ? `&x=${fx[g].x.toFixed(3)}&y=${fx[g].y.toFixed(3)}` : ''}` : '#';
  const nurWeb = !S.server || (S.nurWeb && S.nurWeb.has(k));
  const zeile = g => `<div class="dx-gz li-gr" data-g="${g}" tabindex="0"><span class="dx-dsym">${ic(GR_SYM[g])}</span><div><b>${esc(t('g_' + g))}</b><i>${esc(g === 'druck' ? (nurWeb ? t('i_druck_web') : t('i_druck', zahl(f.w), zahl(f.h))) : t('i_' + g))}</i></div>
    <a class="dx-wk" href="${esc(link(g))}" download data-laden="${g}">${ic('download')}<span>${esc(t('laden'))}</span></a></div>`;
  const art = f.art === 'hochgeladen' ? `<p class="li-hinweis"><b>${esc(t('hoch_lang'))}.</b> ${esc(t('hoch_satz'))}</p>` : !f.t ? `<p class="li-hinweis">${esc(t('titel_fehlt'))}</p>` : '';
  /* Streifen: acht Fotos der gefilterten Reihe rund um das offene Foto, das offene hervorgehoben */
  const L = gefiltert().some(x => x.k === k) ? gefiltert() : S.d.fotos, i0 = L.findIndex(x => x.k === k), n = Math.min(8, L.length);
  const ab = Math.max(0, Math.min(i0 - 1, L.length - n)), streifen = L.slice(ab, ab + n);
  $('#ansicht').innerHTML = `${titel('bilder', t('bilder'), 'A click on a photo opens it large, with four ready sizes. Drag the frame to the part that should show.', knopf(esc(t('b_titel')), 'zurueck', '', { attr: 'data-zurueck' }), fassung(f, 1800))}
    <div class="dx-reiter dx-p li-streifen" style="--n:${n}" data-r>${streifen.map(x => `<button class="dx-rt${x.k === k ? ' dx-an' : ''}" type="button" data-foto="${esc(x.k)}" aria-label="${esc(titelVon(x))}"${x.k === k ? ' aria-current="true"' : ''}><img src="${esc(x.fs)}" alt="" decoding="async"></button>`).join('')}</div>
    <div class="dx-r dx-r-bb li-det">
      <div class="dx-wfl dx-p dx-bgross" data-r><div class="dx-vsk"><div class="dx-mono" id="li-gross-t">${ic('rahmen', 'mi')}<span>${esc(t('g_instagram'))} · 1080 × 1350</span></div><span class="dx-mono li-zieh">Drag the frame</span></div>
        <div class="li-bildfeld"><div class="dx-bbild li-det__bild" id="li-bild" tabindex="-1"><img src="${esc(f.fl)}" alt="${esc(titelVon(f))}" decoding="async" draggable="false"><span class="li-rahmen" id="li-rahmen" hidden><i></i><i></i><i></i><i></i></span></div></div></div>
      <div class="dx-wab dx-p" data-r><div class="dx-kopf"><div><div class="dx-mono">${ic('foto', 'mi')}Four ready sizes</div><h4>Choose a size</h4></div></div>
        ${['instagram', 'story', 'web', 'druck'].map(zeile).join('')}
        <div class="dx-pzf">${knopf(mitNamen('Post in {druck}').replace(/&/g, '&amp;'), 'druck', '', { href: imp('instagram'), neu: true, attr: 'data-imp="instagram"' })}${knopf(mitNamen('Story in {druck}').replace(/&/g, '&amp;'), 'druck', '', { href: imp('story'), neu: true, attr: 'data-imp="story"' })}</div>
        <div class="li-fotot"><div><p class="dx-mono">${esc(t(f.art === 'hochgeladen' ? 'h_hochgeladen' : 'h_haus'))} · ${esc(t('f_' + f.f))}</p><h3>${zusammen(titelVon(f))}</h3>${art}</div>
          <dl class="li-meta"><dt>${esc(t('quelle'))}</dt><dd>${esc(f.q)}${f.u ? ` <a class="li-link" href="${esc(f.u)}" target="_blank" rel="noopener noreferrer">${esc(t('quelle_link'))}</a>` : ''}</dd><dt>${esc(t('original'))}</dt><dd>${zahl(f.w)} × ${zahl(f.h)} px</dd></dl></div>
        ${S.server ? '' : `<div class="dx-abf li-abf">${ic('web', 'mi')}<span>${esc(t('ohne_server'))}</span></div>`}
        <div class="dx-abf">${ic('foto', 'mi')}<span>For an Instagram post choose «Portrait»: then the least is cut away.</span></div></div>
    </div>
    ${bleiste()}`;
  const el = $('#ansicht');
  binde(el);
  $('[data-zurueck]', el).onclick = zurueckZuFotos;
  auftritte(el, still);
  if (!still) scrollTo({ top: 0 });
  const bildEl = $('#li-bild'), rahmen = $('#li-rahmen'), img = $('img', bildEl);
  function setze() {
    const g = FORMATE[aktiv];
    if (!img.naturalWidth || !document.body.contains(bildEl)) { rahmen.hidden = true; return; }
    const W = bildEl.clientWidth, H = bildEl.clientHeight, ziel = g ? g[0] / g[1] : W / H;
    let w = W, h = H;
    if (W / H > ziel) w = H * ziel; else h = W / ziel;
    const p = fx[aktiv] || { x: .5, y: .5 };
    rahmen.classList.toggle('li-rahmen--ganz', !g);
    let tx = (W - w) * p.x, ty = (H - h) * p.y;
    rahmen.style.transform = `translate(${tx}px,${ty}px)`;
    const sk = Math.min(1, 2000 / Math.max(f.w, f.h)), masse = g ? `${g[0]} × ${g[1]}` : aktiv === 'web' ? `${zahl(Math.round(f.w * sk))} × ${zahl(Math.round(f.h * sk))}` : `${zahl(f.w)} × ${zahl(f.h)}`;
    if (w > W - 6 && h > H - 6) { w -= 12; h -= 12; tx = ty = 6; rahmen.style.transform = 'translate(6px,6px)'; }
    rahmen.style.width = w + 'px'; rahmen.style.height = h + 'px';
    const lt = $('#li-gross-t span'); if (lt) lt.textContent = `${t('g_' + aktiv)} · ${masse}`;
    const zh = $('.li-zieh'); if (zh) zh.style.visibility = g ? '' : 'hidden';
    rahmen.classList.remove('blitz'); void rahmen.offsetWidth; rahmen.classList.add('blitz');
    rahmen.hidden = false;
    $$('[data-laden]').forEach(a => a.href = link(a.dataset.laden));
    $$('[data-imp]').forEach(a => a.href = imp(a.dataset.imp));
  }
  img.complete ? setze() : img.addEventListener('load', setze);
  $$('.li-gr').forEach(li => {
    const an = () => { aktiv = li.dataset.g; $$('.li-gr').forEach(x => x.classList.toggle('dx-an', x === li)); setze(); };
    li.addEventListener('mouseenter', an); li.addEventListener('focusin', an); li.addEventListener('touchstart', an, { passive: true }); li.addEventListener('click', an);
  });
  $('.li-gr').classList.add('dx-an');
  /* Ohne Server-Teil (online): die Grösse schneidet der Browser aus der Website-Fassung (unterbau/WEGE.md 2.6) */
  $$('[data-laden]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); if (!S.server) return browserBild(f, a.dataset.laden, fx[a.dataset.laden]); serverBild(a); }));
  let zug = null;
  rahmen.addEventListener('pointerdown', e => { e.preventDefault(); zug = { x: e.clientX, y: e.clientY, p: { ...(fx[aktiv] || { x: .5, y: .5 }) } }; rahmen.setPointerCapture(e.pointerId); rahmen.classList.add('zieht'); });
  rahmen.addEventListener('pointermove', e => {
    if (!zug || !fx[aktiv]) return;
    const W = bildEl.clientWidth, H = bildEl.clientHeight, w = rahmen.offsetWidth, h = rahmen.offsetHeight;
    fx[aktiv] = { x: W - w > 1 ? Math.min(1, Math.max(0, zug.p.x + (e.clientX - zug.x) / (W - w))) : .5, y: H - h > 1 ? Math.min(1, Math.max(0, zug.p.y + (e.clientY - zug.y) / (H - h))) : .5 };
    setze();
  });
  const los = () => { zug = null; rahmen.classList.remove('zieht'); };
  rahmen.addEventListener('pointerup', los); rahmen.addEventListener('pointercancel', los);
  bildEl.addEventListener('dragstart', e => e.preventDefault());
  addEventListener('resize', setze);
  S.fensterZu = () => removeEventListener('resize', setze);
}
/* Fertige Grösse im Browser (Canvas): gleiche Masse und Namen wie livre.py bild() */
function browserBild(f, g, p) {
  const i = new Image(); i.crossOrigin = 'anonymous';
  i.onload = () => {
    let sx = 0, sy = 0, sw = i.naturalWidth, sh = i.naturalHeight, W, H;
    if (FORMATE[g]) { [W, H] = FORMATE[g]; p = p || { x: .5, y: .5 }; if (sw / sh > W / H) { const nw = Math.round(sh * W / H); sx = Math.round((sw - nw) * p.x); sw = nw; } else { const nh = Math.round(sw * H / W); sy = Math.round((sh - nh) * p.y); sh = nh; } }
    else { const sk = g === 'web' ? Math.min(1, 2000 / Math.max(sw, sh)) : 1; W = Math.round(sw * sk); H = Math.round(sh * sk); }
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'); x.fillStyle = '#f5f0e7'; x.fillRect(0, 0, W, H); x.imageSmoothingQuality = 'high'; x.drawImage(i, sx, sy, sw, sh, 0, 0, W, H);
    c.toBlob(b => { if (!b) return melde(t('p_fehler'), true); speichereBlob(b, `${S_}-${f.k}-${g === 'druck' ? 'website-size-print' : g}-${W}x${H}.jpg`); }, 'image/jpeg', .9);
  };
  i.onerror = () => melde(navigator.onLine === false ? t('offline') : t('p_fehler'), true);
  i.src = f.fl;
}
/* Fertige Grösse vom Server: erst holen, dann speichern. So meldet jeder Browser ein fehlendes Netz (Firefox liess einen toten Download sonst still fallen, Prüfung A4) */
async function serverBild(a) {
  if (a.dataset.holt) return; a.dataset.holt = '1'; a.setAttribute('aria-busy', 'true');
  try {
    const r = await fetch(a.href, { cache: 'no-store' });
    if (!r.ok) { let m = ''; try { m = (await r.json()).fehler || ''; } catch (x) { /* kein JSON */ } return melde(m ? m.replace(/^[A-Z]+ · /, '') : t('fehler_code', r.status), true); }
    const n = /filename="([^"]+)"/.exec(r.headers.get('Content-Disposition') || '');
    speichereBlob(await r.blob(), n ? n[1] : `${S_}-${a.dataset.laden}.jpg`);
  } catch (x) { melde(t('offline'), true); }
  finally { delete a.dataset.holt; a.removeAttribute('aria-busy'); }
}
function speichereBlob(b, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}

/* ---------------------------------------------------------------- Dateien: alles im Browser aus dem Fundus gemacht (Farben und Zeichen wie veröffentlicht) */
const VARIANTEN = [{ k: 'schwarz', grund: 'hell', farbe: () => (window.Fundus && Fundus.wert('schwarz')) || '#141210' }, { k: 'weiss', grund: 'dunkel', farbe: () => (window.Fundus && Fundus.wert('weiss')) || '#ffffff' }];
const TAPETEN = [{ k: 'dunkel', grund: 'dunkel', svg: '/the-cat-and-gun/haus/_werkzeuge/livre/_ob/kleid/tapete-dunkel.svg', boden: '#15120f' }, { k: 'hell', grund: 'hell', svg: '/the-cat-and-gun/haus/_werkzeuge/livre/_ob/kleid/tapete-hell.svg', boden: '#f5f1ea' }];
function zeichenSvg(id, farbe) {
  const e = Fundus.elemente({ art: 'zeichen' }).find(x => x.id === id); if (!e) return Promise.reject(new Error('FUNDUS · ' + id));
  const teile = {}; (e.teile || []).forEach(p => { teile[p.id] = farbe; });
  return Fundus.element(id, { teile });
}
/* Zeichen als Bild (Prüfung 23.11.2026, A2 und A1/3): als <img> zeigt der Browser nur die viewBox. Pfade unterhalb der viewBox (bei «THE CAT» die Zeile «GUN»)
   bleiben verborgen wie in der PNG, keine Seitenregel legt eine Kontur auf das Zeichen, und die Tafel trägt sichtbar ein Bild. */
const ZB = new Map();
function zeichenBild(svg) {
  if (!ZB.has(svg)) {
    const m = svg.match(/viewBox="([\d.\s-]+)"/), vb = m ? m[1].trim().split(/\s+/).map(Number) : [0, 0, 1000, 1000];
    let s = svg.replace(/<svg([^>]*?)\swidth="[^"]*"/, '<svg$1').replace(/<svg([^>]*?)\sheight="[^"]*"/, '<svg$1').replace('<svg', `<svg width="${vb[2]}" height="${vb[3]}"`);
    if (!/xmlns=/.test(s.slice(0, 400))) s = s.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    ZB.set(svg, { u: URL.createObjectURL(new Blob([s], { type: 'image/svg+xml' })), w: vb[2], h: vb[3] });
  }
  const b = ZB.get(svg);
  return `<img src="${b.u}" width="${b.w}" height="${b.h}" alt="" data-fundus decoding="sync">`;
}
function svgZuPng(svg, breite) {
  return new Promise((ok, nein) => {
    const m = svg.match(/viewBox="([\d.\s-]+)"/), vb = m ? m[1].trim().split(/\s+/).map(Number) : [0, 0, 1000, 1000];
    const W = breite, H = Math.round(breite * vb[3] / vb[2]);
    const s = svg.replace(/<svg([^>]*?)\swidth="[^"]*"/, '<svg$1').replace(/<svg([^>]*?)\sheight="[^"]*"/, '<svg$1').replace('<svg', `<svg width="${W}" height="${H}"`);
    const i = new Image(), u = URL.createObjectURL(new Blob([s], { type: 'image/svg+xml' }));
    i.onload = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(i, 0, 0, W, H); URL.revokeObjectURL(u); c.toBlob(b => b ? ok(b) : nein(new Error('PNG')), 'image/png'); };
    i.onerror = () => { URL.revokeObjectURL(u); nein(new Error('SVG')); };
    i.src = u;
  });
}
/* Kachel der Tapete (SVG des Kleids) als 46er-Feld; PNG in 1200 × 1200 gekachelt */
function tapetePng(v) {
  return fetch(v.svg).then(r => r.text()).then(svg => new Promise((ok, nein) => {
    const i = new Image(), u = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    i.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 1196; const x = c.getContext('2d'); x.fillStyle = v.boden; x.fillRect(0, 0, 1196, 1196);
      for (let a = 0; a < 1196; a += 92) for (let b = 0; b < 1196; b += 92) x.drawImage(i, a, b, 92, 92); URL.revokeObjectURL(u); c.toBlob(bb => bb ? ok(bb) : nein(new Error('PNG')), 'image/png'); };
    i.onerror = () => { URL.revokeObjectURL(u); nein(new Error('SVG')); }; i.src = u;
  }));
}
/* Muster als SVG zum Mitnehmen (Abnahme 28.11.2026): die Kachel der Website hat keinen Grund, nur Striche mit 5 % Deckung. Allein geöffnet war die Datei
   leer. Die Datei bekommt deshalb denselben Grund wie die PNG. */
const tapeteSvg = v => fetch(v.svg).then(r => r.ok ? r.text() : Promise.reject(new Error(r.status)))
  .then(s => new Blob([s.replace(/(<svg[^>]*>)/, `$1<rect width="100%" height="100%" fill="${v.boden}"/>`)], { type: 'image/svg+xml' }));
/* Namen in den Dateien englisch (Robert 28.11.2026): die Kennungen des Fundus sind deutsch (wortmarke, et, schwarz, rot-hell). Dateinamen und die Namen
   in der Farbdatei kommen deshalb aus den englischen Namen, die das Brand book zeigt. */
const EN = { wortmarke: 'wordmark', et: 'ampersand', schwarz: 'black', weiss: 'white', dunkel: 'dark', hell: 'light' };
const en = k => EN[k] || k;
const kurz = x => String(x).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function farbDateien() {
  const fs = S.d.gruppen.flatMap(g => g.farben.map(f => ({ ...f, gruppe: g.n })));
  const frei = new Set(), nm = f => { let n = `${kurz(f.gruppe)}-${kurz(f.n)}`; while (frei.has(n)) n += '-2'; frei.add(n); return n; };
  const css = ':root{\n' + fs.map(f => `  --cg-${nm(f)}: ${f.h}; /* ${f.n.replace(/\*\//g, '')} · ${f.gruppe.replace(/\*\//g, '')} */`).join('\n') + '\n}\n';
  const json = JSON.stringify({ house: 'The Cat & Gun', version: S.d.kennung, groups: S.d.gruppen.map(g => ({ name: g.n, colours: g.farben.map(f => ({ name: f.n, hex: f.h, rgb: f.rgb })) })) }, null, 2);
  return { css: new Blob([css], { type: 'text/css' }), json: new Blob([json], { type: 'application/json' }), ase: new Blob([ase(S.d.gruppen)], { type: 'application/octet-stream' }) };
}
/* Adobe Swatch Exchange (ASE 1.0): Gruppen mit RGB-Farben */
function ase(gruppen) {
  const teile = [];
  const u16 = n => [n >> 8 & 255, n & 255], u32 = n => [n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255];
  const f32 = x => { const b = new DataView(new ArrayBuffer(4)); b.setFloat32(0, x); return [0, 1, 2, 3].map(i => b.getUint8(i)); };
  const name = s => { const z = [...String(s)].slice(0, 60).join(''), o = [...u16(z.length + 1)]; for (const ch of z) { const c = ch.charCodeAt(0); o.push(...u16(c)); } o.push(0, 0); return o; };
  let n = 0;
  gruppen.forEach(g => {
    const nm = name(g.n); teile.push(...u16(0xC001), ...u32(nm.length), ...nm); n++;
    g.farben.forEach(f => { const nm2 = name(f.n), d = [...nm2, ...[82, 71, 66, 32], ...f32(f.rgb[0] / 255), ...f32(f.rgb[1] / 255), ...f32(f.rgb[2] / 255), ...u16(2)]; teile.push(...u16(1), ...u32(d.length), ...d); n++; });
    teile.push(...u16(0xC002), ...u32(0)); n++;
  });
  return new Uint8Array([65, 83, 69, 70, ...u16(1), ...u16(0), ...u32(n), ...teile]);
}
/* ZIP ohne Packen (STORE), mit CRC-32 */
const CRC = (() => { const tb = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; tb[n] = c >>> 0; } return tb; })();
function crc32(u) { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = CRC[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
async function zip(dateien) {
  const enc = new TextEncoder(), lokal = [], zentral = []; let pos = 0;
  const u16 = n => [n & 255, n >> 8 & 255], u32 = n => [n & 255, n >>> 8 & 255, n >>> 16 & 255, n >>> 24 & 255];
  for (const [nm, blob] of dateien) {
    const d = new Uint8Array(await blob.arrayBuffer()), n = enc.encode(nm), c = crc32(d);
    const kopf = [...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(c), ...u32(d.length), ...u32(d.length), ...u16(n.length), ...u16(0)];
    lokal.push(new Uint8Array(kopf), n, d);
    zentral.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(c), ...u32(d.length), ...u32(d.length), ...u16(n.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(pos)]), n);
    pos += kopf.length + n.length + d.length;
  }
  const zl = zentral.reduce((a, x) => a + x.length, 0);
  return new Blob([...lokal, ...zentral, new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(dateien.length), ...u16(dateien.length), ...u32(zl), ...u32(pos), ...u16(0)])], { type: 'application/zip' });
}
async function schriftDateien() {
  const l = [];
  for (const s of S.d.schriften) { const r = await fetch(s.d); if (!r.ok) throw new Error(s.datei); l.push([`fonts/${s.datei}`, await r.blob()]); }
  l.push(['fonts/README.txt', new Blob([`Fonts of The Cat & Gun\n\n${S.d.schriften.map(s => `${s.n}: ${s.r}${s.e && s.e !== s.r ? ' · ' + s.e : ''} (${s.datei})`).join('\n')}\n`], { type: 'text/plain' })]);
  /* Copyright und Lizenz je Schrift (Robert 28.11.2026), wörtlich aus den Schriftdateien gelesen (lizenz_bau.js → schriften-lizenz.json). Ein voller
     Lizenztext liegt im Projekt nicht vor; fehlt die Angabe zu einer Schrift, steht sie hier nicht. */
  try {
    const lz = await (await fetch('schriften-lizenz.json', { cache: 'no-store' })).json();
    const z = S.d.schriften.filter(s => lz[s.datei] && (lz[s.datei].copyright || lz[s.datei].lizenz_adresse)).map(s => { const a = lz[s.datei];
      return [`${s.n} (${s.datei})`, a.copyright, a.lizenz, a.lizenz_adresse ? 'Licence: ' + a.lizenz_adresse : ''].filter(Boolean).join('\n'); });
    if (z.length) l.push(['fonts/LICENCE.txt', new Blob([`Fonts of The Cat & Gun · copyright and licence\nAs stored in the font files.\n\n${z.join('\n\n')}\n`], { type: 'text/plain' })]);
  } catch (e) { /* ohne die Datei bleibt der ZIP wie vorher */ }
  /* Text der SIL Open Font License 1.1, unverändert von openfontlicense.org/documents/OFL.txt (Robert 28.11.2026: «Ja, Lizenztext beilegen»).
     Alle vier Schriften nennen in ihrer Datei diese Lizenz. Die Kopfzeilen mit <dates> sind Teil der Vorlage; die echten Copyright-Zeilen stehen in LICENCE.txt. */
  /* Der Server liefert keine .txt-Dateien aus (server.py, gesperrte Endungen); der Text liegt deshalb wörtlich in schriften-ofl.json (Quelle OFL.txt daneben). */
  try { const r = await fetch('schriften-ofl.json', { cache: 'no-store' }); if (r.ok) { const o = await r.json(); if (o.text) l.push(['fonts/OFL.txt', new Blob([o.text], { type: 'text/plain' })]); } } catch (e) { /* ohne Netz bleibt der ZIP ohne den Text */ }
  return l;
}
/* Alle Dateien der Ansicht als Liste [name, Blob] */
async function alleDateien() {
  const l = [];
  for (const e of S.d.zeichen) for (const v of VARIANTEN) { const svg = await zeichenSvg(e.id, v.farbe()); l.push([`${S_}-${en(e.id)}-${en(v.k)}.svg`, new Blob([svg], { type: 'image/svg+xml' })], [`${S_}-${en(e.id)}-${en(v.k)}.png`, await svgZuPng(svg, 2000)]); }
  for (const v of TAPETEN) l.push([`${S_}-pattern-${en(v.k)}.svg`, await tapeteSvg(v)], [`${S_}-pattern-${en(v.k)}.png`, await tapetePng(v)]);
  const fd = farbDateien(); l.push([`${S_}-colours.css`, fd.css], [`${S_}-colours.json`, fd.json], [`${S_}-colours.ase`, fd.ase]);
  l.push(...await schriftDateien());
  return l;
}
async function zipAlle(knopf) {
  if (knopf.dataset.laeuft) return; knopf.dataset.laeuft = '1'; melde(t('datei_wird'));
  try { speichereBlob(await zip(await alleDateien()), `${S_}-brand.zip`); }
  catch (e) { melde(t('p_fehler') + ': ' + (navigator.onLine === false ? t('offline') : esc(e.message)), true); }
  finally { delete knopf.dataset.laeuft; }
}
/* Ein Knopf einer Datei: erst beim Klick gemacht (immer aus dem aktuellen Stand) */
async function eineDatei(art, a) {
  if (art === 'zeichen') { const svg = await zeichenSvg(a.zeichen, VARIANTEN.find(v => v.k === a.v).farbe()); return a.fmt === 'svg' ? new Blob([svg], { type: 'image/svg+xml' }) : svgZuPng(svg, 2000); }
  if (art === 'tapete') { const v = TAPETEN.find(x => x.k === a.v); return a.fmt === 'svg' ? tapeteSvg(v) : tapetePng(v); }
  if (art === 'farben') return farbDateien()[a.fmt];
  if (art === 'schriften') return zip(await schriftDateien());
  throw new Error('?');
}
/* Muster als Bild (Prüfung 23.11.2026): dieselben 46-px-Kacheln wie der Hintergrund, aber als <img>, damit die Tafel sichtbar ein Bild trägt.
   Ein grosses SVG mit dem Muster als Füllung, ungestreckt (object-fit:none) oben links angesetzt. */
const TB = new Map();
function tapetenEinsetzen() {
  $$('[data-tapete]').forEach(el => {
    const v = TAPETEN.find(x => x.k === el.dataset.tapete); if (!v || el.querySelector('img')) return;
    if (!TB.has(v.k)) TB.set(v.k, fetch(v.svg).then(r => r.ok ? r.text() : Promise.reject(new Error(r.status))).then(svg => {
      const innen = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
      const gross = `<svg xmlns="http://www.w3.org/2000/svg" width="2024" height="1380" viewBox="0 0 2024 1380"><defs><pattern id="m" width="46" height="46" patternUnits="userSpaceOnUse">${innen}</pattern></defs><rect width="2024" height="1380" fill="${v.boden}"/><rect width="2024" height="1380" fill="url(#m)"/></svg>`;
      return URL.createObjectURL(new Blob([gross], { type: 'image/svg+xml' }));
    }));
    TB.get(v.k).then(u => { if (!el.querySelector('img')) el.insertAdjacentHTML('afterbegin', `<img src="${u}" width="2024" height="1380" alt="" decoding="sync">`); }, () => { /* fehlt: der Hintergrund zeigt das Muster */ });
  });
}
function zeichenEinsetzen() {
  tapetenEinsetzen();
  $$('[data-zeichen]').forEach(el => {
    const v = VARIANTEN.find(x => x.k === el.dataset.farbe) || VARIANTEN[0];
    zeichenSvg(el.dataset.zeichen, v.farbe()).then(svg => { el.innerHTML = zeichenBild(svg); }, () => { /* fehlt im Fundus: Feld bleibt leer */ });
  });
}
const NAME_E = { wortmarke: 'logo', et: 'wortmarke' };   // Blöcke der Vorlage: Wortmarke · Ampersand (THE CAT ohne GUN raus, Robert 23.11.2026)
function dateien() {
  const tafeln = e => { const b = NAME_E[e.id]; const n = b ? t('d_' + b) : e.name;
    return VARIANTEN.map(v => zeichenKachel(e.id, v.k, v.grund, `${(x => x[0].toUpperCase() + x.slice(1))(n.replace(/^The /, ''))} · ${v.k === 'schwarz' ? 'black' : 'white'}`, (x => x[0].toUpperCase() + x.slice(1))(t(v.grund)) + ' · SVG, PNG 2000 px', e.id === 'et')).join(''); };
  const zeichenBloecke = S.d.zeichen.map(e => { const b = NAME_E[e.id];
    return `${st(e.id === 'et' ? 'kopie' : 'datei', esc(b ? t('d_' + b) : e.name), e.id === 'et' ? 'Where there is little room' : 'Black for light grounds, white for dark grounds', b ? t('d_' + b + '_s') : (e.satz || ''))}<div class="dx-bdat li-zwei">${tafeln(e)}</div>`; }).join('');
  const muster = TAPETEN.map(v => `<div class="dx-dk dx-p" data-r><div class="dx-dkf li-tapete li-tapete--${v.grund}" data-tapete="${v.k}" style="background-image:url(${v.svg});background-color:${v.boden}"></div>
      <div class="dx-dkt"><div><b>${esc(t('v_' + v.k))}</b><i>SVG · PNG 1196 px</i></div><span class="dx-dkb">${['svg', 'png'].map(f => `<button type="button" data-datei="tapete" data-v="${v.k}" data-fmt="${f}" aria-label="${esc(t('d_tapete'))} ${esc(t('v_' + v.k))} ${f.toUpperCase()}">${f.toUpperCase()}</button>`).join('')}</span></div></div>`).join('');
  const gruppen = S.d.gruppen.map(g => `<div class="li-fg"><div class="li-fg__t" data-r><h4>${esc(g.n)}</h4><p>${esc(g.s)}</p></div>
      <div class="li-farben" data-ordne data-min="150" data-min-handy="140" data-max="6">${g.farben.map(farbKarte).join('')}</div></div>`).join('');
  const schriften = S.d.schriften.map(s => { const fam = esc(s.fam).replace(/'/g, '');
    return `<div class="dx-dk dx-p li-schrift" data-r><div class="dx-dkf dx-schrift"><em style="font-family:'${fam}',serif">Aa</em><span style="font-family:'${fam}',serif">${esc(s.p)}</span></div>
      <div class="dx-dkt"><div><b>${esc(s.n)}</b><i>${esc(s.r)}${s.w ? ' · ' + esc(s.w) : ''}</i></div><span class="dx-dkb"><a href="${esc(s.d)}" download="${esc(s.datei)}">WOFF2</a></span></div></div>`; }).join('');
  return `${titel('dateien', t('d_titel'), t('d_satz'), knopf(esc(t('alles_zip')), 'zip', 'gold', { attr: 'data-zip-alle' }) + knopf(esc(t('buch')), 'buch', '', { href: MARKE }))}
    ${zeichenBloecke}
    ${st('rahmen', esc(t('d_tapete')), 'On dark and on light', t('d_tapete_s'))}<div class="dx-bdat li-zwei">${muster}</div>
    ${st('palette', esc(t('d_farben')), `${zahl(S.d.stand.farben)} colours in ${zahl(S.d.gruppen.length)} groups`, t('d_farben_s'))}${gruppen}${farbHinweis()}
    ${st('buch', esc(t('d_schriften')), 'WOFF2, all of them in one ZIP', t('d_schriften_s'))}<div class="dx-bdat li-schriften" style="--n:${Math.min(4, S.d.schriften.length)}">${schriften}</div>
    <div class="dx-fhin dx-p" data-r><span class="dx-stp">${ic('zip', 'mi')}${esc(t('d_schriften'))}: ${S.d.schriften.map(s => esc(s.n)).join(', ')}</span><span class="dx-wr"><button class="dx-chip" type="button" data-datei="schriften" data-fmt="zip">${ic('download')}ZIP</button></span></div>
    ${bleiste()}`;
}
function zwei(s) { const i = s.lastIndexOf(' '); return i > 0 ? `${esc(s.slice(0, i))} <em>${esc(s.slice(i + 1))}</em>` : esc(s); }
function kopiere(w, el) {
  const ok = () => { if (el) { el.classList.add('kopiert'); setTimeout(() => el.classList.remove('kopiert'), 1400); } melde(t('kopiert') + ' · ' + w); };
  if (navigator.clipboard && isSecureContext) navigator.clipboard.writeText(w).then(ok, () => alt());
  else alt();
  function alt() { const x = document.createElement('textarea'); x.value = w; x.setAttribute('readonly', ''); x.style.position = 'fixed'; x.style.opacity = '0'; document.body.appendChild(x); x.select(); try { document.execCommand('copy'); ok(); } catch (e) { /* nichts */ } x.remove(); }
}
const DATEINAME = a => a.dataset.datei === 'zeichen' ? `${S_}-${en(a.dataset.z)}-${en(a.dataset.v)}.${a.dataset.fmt}` : a.dataset.datei === 'tapete' ? `${S_}-pattern-${en(a.dataset.v)}.${a.dataset.fmt}`
  : a.dataset.datei === 'farben' ? `${S_}-colours.${a.dataset.fmt}` : `${S_}-fonts.zip`;
function dateienLeben() { /* Knöpfe bindet binde() für jede Ansicht */ }

/* ---------------------------------------------------------------- Colour check (Farbmessung der Vorlage ohne KI, im Browser gerechnet) */
function pruefung() {
  return `${titel('pruefung', t('p_titel'), t('p_satz'))}<div id="li-pr"></div><div id="li-bsp-erg"></div>${bleiste()}`;
}
function pruefungLeben() { S.ergebnis ? ergebnis(S.ergebnis) : feld(); if (!S.ergebnis && /[?&]beispiel=1/.test(location.search)) beispielPruefung(); }
/* Beispiel: ein eigens gezeichneter Entwurf (beispiel/entwurf.png), gemessen mit derselben Messung, als Beispiel beschriftet */
async function beispielMessung() {
  if (S.bspJ) return S.bspJ;
  const r = await fetch('beispiel/entwurf.png'); if (!r.ok) throw new Error(r.status);
  const b = await r.blob(), url = await new Promise(ok => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(b); });
  const j = await messe({ name: 'example-post.png', daten: url }); j.beispiel = true; S.bspJ = j; return j;
}
async function beispielPruefung() {
  try { const j = await beispielMessung(); S.ergebnis = j; if (S.ansicht === 'pruefung') ergebnis(j); } catch (e) { melde(t('p_fehler'), true); }
}
function feld() {
  const d = S.datei;
  $('#li-pr').innerHTML = `<div class="dx-p li-feld" id="li-feld" data-r>
      <input type="file" id="li-datei" accept="image/jpeg,image/png,image/webp" hidden>
      <div class="dx-drop li-feld__in">
        ${d ? `<div class="li-feld__vor"><img src="${d.bild}" alt=""></div><p class="li-feld__name"><b>${esc(d.name)}</b><small>${(d.groesse / 1e6).toFixed(1)} MB</small></p>`
          : `${ic('pipette')}<span>${esc(t('p_feld'))}</span><em>${esc(t('p_feld2'))}</em>`}
        <div class="li-feld__kn">${knopf(esc(t('p_waehlen')), 'upload', d ? '' : 'gold', { attr: 'id="li-waehle"' })}${d ? knopf(esc(t('p_pruefen')), 'pipette', 'gold', { attr: 'id="li-los"' }) : ''}</div>
        ${d ? '' : `<p class="li-bsp"><button class="li-link" type="button" id="li-bsp">${esc(t('p_beispiel'))}</button></p>`}
      </div>
      <p class="dx-abf li-privat">${ic('check', 'ck')}<span>${esc(t('p_privat'))}</span></p>
    </div>`;
  const inp = $('#li-datei'), fl = $('#li-feld');
  $('#li-waehle').onclick = () => inp.click();
  inp.onchange = () => inp.files[0] && nimm(inp.files[0]);
  ['dragenter', 'dragover'].forEach(n => fl.addEventListener(n, e => { e.preventDefault(); fl.classList.add('ueber'); }));
  ['dragleave', 'drop'].forEach(n => fl.addEventListener(n, e => { e.preventDefault(); fl.classList.remove('ueber'); }));
  fl.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) nimm(f); });
  if ($('#li-los')) $('#li-los').onclick = pruefe;
  if ($('#li-bsp')) $('#li-bsp').onclick = () => { const u = $('#li-bsp-erg'); if (u && u.firstChild) u.scrollIntoView({ behavior: RUHIG() ? 'auto' : 'smooth', block: 'start' }); else beispielPruefung(); };
  auftritte($('#li-pr'), true);
  beispielUnten(!d);
}
/* R20: unter dem leeren Feld steht immer eine fertige Beispiel-Messung, deutlich als Beispiel beschriftet */
async function beispielUnten(an) {
  const u = $('#li-bsp-erg'); if (!u) return;
  if (!an) { u.innerHTML = ''; return; }
  try {
    const j = await beispielMessung();
    if (S.datei || S.ergebnis || S.ansicht !== 'pruefung' || !$('#li-bsp-erg')) return;
    $('#li-bsp-erg').innerHTML = '<div class="li-bsp-unten"></div>'; ergebnis(j, $('#li-bsp-erg .li-bsp-unten'));
  } catch (e) { /* ohne Beispiel bleibt das Feld */ }
}
function nimm(f) {
  if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { melde(t('p_typ'), true); return; }
  if (f.size > 30 * 1024 * 1024) { melde(t('p_gross'), true); return; }
  const r = new FileReader();
  r.onload = () => { S.datei = { name: f.name, typ: f.type, groesse: f.size, daten: r.result, bild: r.result }; feld(); };
  r.onerror = () => melde(t('p_kaputt'), true);
  r.readAsDataURL(f);
}
async function pruefe() {
  const d = S.datei; if (!d) return;
  const schritte = [t('p_schritt1'), t('p_schritt2'), t('p_schritt3')];
  $('#li-pr').innerHTML = `<div class="dx-p li-lauf" data-r><div class="li-lauf__b"><img src="${d.bild}" alt=""><span class="li-scan"></span></div>
    <div><p class="dx-mono">${ic('pipette', 'mi')}${esc(t('pruefung'))}</p><ol class="li-schritte">${schritte.map((s, i) => `<li data-i="${i}"><i></i><span>${esc(s)}</span></li>`).join('')}</ol><p class="leise">${esc(t('p_dauer'))}</p></div></div>`;
  auftritte($('#li-pr'), true);
  const li = $$('.li-schritte li');
  let n = 0; li[0].classList.add('an');
  const uhr = setInterval(() => { if (n < 2) { li[n].classList.replace('an', 'fertig'); n++; li[n].classList.add('an'); } }, 700);
  try {
    const [j] = await Promise.all([messe(d), new Promise(r => setTimeout(r, 1500))]);
    clearInterval(uhr); li.forEach(x => { x.classList.remove('an'); x.classList.add('fertig'); });
    S.ergebnis = j;
    setTimeout(() => ergebnis(j), 380);
  } catch (e) {
    clearInterval(uhr);
    melde(t('p_fehler') + ': ' + e.message, true);
    feld();
  }
}
/* Messung (Umbau von livre.py farben() der Vorlage): Bild auf 600 px, unruhige Stellen (Kanten, Schrift) weglassen, Töne nach Median-Schnitt,
   je Ton Anteil, nächste Farbe des Hauses und Abstand ΔE 2000 (unter 5 gleich, bis 12 nah, darüber fremd); dazu reines Schwarz gesondert. */
function lab(r, g, b) {
  const lin = c => { c /= 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; };
  const R = lin(r), G = lin(g), B = lin(b);
  const X = (R * .4124 + G * .3576 + B * .1805) / .95047, Y = R * .2126 + G * .7152 + B * .0722, Z = (R * .0193 + G * .1192 + B * .9505) / 1.08883;
  const f = v => v > .008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116;
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
function de2000([L1, a1, b1], [L2, a2, b2]) {
  const rad = Math.PI / 180, C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cm = (C1 + C2) / 2, G = .5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2, C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const h1p = (Math.atan2(b1, a1p) / rad + 360) % 360, h2p = (Math.atan2(b2, a2p) / rad + 360) % 360;
  const dL = L2 - L1, dC = C2p - C1p;
  const dh = C1p * C2p === 0 ? 0 : Math.abs(h2p - h1p) <= 180 ? h2p - h1p : h2p > h1p ? h2p - h1p - 360 : h2p - h1p + 360;
  const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin(dh / 2 * rad), Lm = (L1 + L2) / 2, Cmp = (C1p + C2p) / 2;
  const hm = C1p * C2p === 0 ? h1p + h2p : Math.abs(h1p - h2p) <= 180 ? (h1p + h2p) / 2 : h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2;
  const T2 = 1 - .17 * Math.cos((hm - 30) * rad) + .24 * Math.cos(2 * hm * rad) + .32 * Math.cos((3 * hm + 6) * rad) - .2 * Math.cos((4 * hm - 63) * rad);
  const SL = 1 + .015 * (Lm - 50) ** 2 / Math.sqrt(20 + (Lm - 50) ** 2), SC = 1 + .045 * Cmp, SH = 1 + .015 * Cmp * T2;
  const RT = -2 * Math.sqrt(Cmp ** 7 / (Cmp ** 7 + 25 ** 7)) * Math.sin(60 * Math.exp(-(((hm - 275) / 25) ** 2)) * rad);
  return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH));
}
function medianSchnitt(px, n) {
  let kisten = [px];
  while (kisten.length < n) {
    let bi = -1, bw = 0, bk = 0;
    kisten.forEach((k, i) => { if (k.length < 2) return; for (let c = 0; c < 3; c++) { let lo = 255, hi = 0; for (const p of k) { if (p[c] < lo) lo = p[c]; if (p[c] > hi) hi = p[c]; } if ((hi - lo) * Math.sqrt(k.length) > bw) { bw = (hi - lo) * Math.sqrt(k.length); bi = i; bk = c; } } });
    if (bi < 0) break;
    const k = kisten[bi].sort((a, b) => a[bk] - b[bk]), m = k.length >> 1;
    kisten.splice(bi, 1, k.slice(0, m), k.slice(m));
  }
  return kisten.map(k => { const s = [0, 0, 0]; k.forEach(p => { s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; }); return { rgb: s.map(v => Math.round(v / k.length)), n: k.length }; });
}
function messe(d) {
  return new Promise((ok, nein) => {
    const i = new Image();
    i.onload = () => {
      const W0 = i.naturalWidth, H0 = i.naturalHeight;
      if (!W0 || !H0) return nein(new Error(t('p_kaputt')));
      if (W0 * H0 > 100e6) return nein(new Error(t('p_riesig', zahl(W0), zahl(H0))));
      const sk = Math.min(1, 600 / Math.max(W0, H0)), W = Math.max(1, Math.round(W0 * sk)), H = Math.max(1, Math.round(H0 * sk));
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H); x.drawImage(i, 0, 0, W, H);
      const px = x.getImageData(0, 0, W, H).data, flach = [], alle = [];
      const at = (a, b) => (b * W + a) * 4;
      for (let b = 0; b < H; b++) for (let a = 0; a < W; a++) {
        const o = at(a, b), p = [px[o], px[o + 1], px[o + 2]]; alle.push(p);
        let lo = 255, hi = 0;
        for (let yy = Math.max(0, b - 1); yy <= Math.min(H - 1, b + 1); yy++) for (let xx = Math.max(0, a - 1); xx <= Math.min(W - 1, a + 1); xx++) { const q = at(xx, yy), v = (px[q] + px[q + 1] + px[q + 2]) / 3; if (v < lo) lo = v; if (v > hi) hi = v; }
        if (hi - lo <= 26) flach.push(p);
      }
      const basis = flach.length > alle.length * .05 ? flach : alle;
      const PAL = S.d.farben.map(f => ({ k: f.k, n: f.n, h: f.h, lab: lab(...f.rgb) }));
      /* Abnahme 28.11.2026: «reines Schwarz» hiess alles unter Helligkeit 7. Das Schwarz des Hauses (#141210) hat 5,6 und wurde selbst als
         «pure black, not a house colour» gemeldet. Die Grenze liegt deshalb höchstens auf halber Helligkeit der dunkelsten Hausfarbe. */
      const SW_L = Math.min(7, Math.min(...PAL.map(p => p.lab[0])) / 2);
      const ges = basis.length || 1;
      let toene = medianSchnitt(basis.slice(), 28).map(k => {
        const l = lab(...k.rgb); let best = PAL[0], dbest = 1e9;
        PAL.forEach(p => { const dd = de2000(l, p.lab); if (dd < dbest) { dbest = dd; best = p; } });
        return { hex: '#' + k.rgb.map(v => v.toString(16).padStart(2, '0')).join(''), anteil: k.n / ges, naechste: best.k, name: best.n, palette: best.h, de: Math.round(dbest * 10) / 10, urteil: dbest < 5 ? 'gleich' : dbest < 12 ? 'nah' : 'fremd', _lab: l };
      }).sort((a, b) => b.anteil - a.anteil);
      const zus = [];
      toene.forEach(tt => { const z = zus.find(z2 => (tt.urteil === 'gleich' && z2.urteil === 'gleich' && z2.naechste === tt.naechste) || (tt.urteil !== 'gleich' && z2.urteil === tt.urteil && de2000(tt._lab, z2._lab) < 6)); if (z) z.anteil += tt.anteil; else zus.push({ ...tt }); });
      /* Fehlerbuch 10a 21.10.2026 (Farbprüfung ohne KI): reines Schwarz zählt nicht als Hausfarbe; grelle fremde Töne (Buntheit über 85, ab 6 %) heissen fremd */
      zus.forEach(z => { const C = Math.hypot(z._lab[1], z._lab[2]); if ((z._lab[0] < SW_L && C < 6) || (C > 85 && z.anteil >= .06 && z.de >= 5)) z.urteil = 'fremd'; });
      toene = zus.filter(z => z.anteil >= .004).sort((a, b) => b.anteil - a.anteil).map(({ _lab, ...r }) => ({ ...r, anteil: Math.round(r.anteil * 1e4) / 1e4 }));
      let schwarz = 0; alle.forEach(p => { const [L, a, b] = lab(...p); if (L < SW_L && Math.hypot(a, b) < 6) schwarz++; });
      const im_rahmen = toene.reduce((s, z) => s + (z.urteil !== 'fremd' ? z.anteil : 0), 0);
      const v = document.createElement('canvas'), vs = Math.min(1, 900 / Math.max(W0, H0)); v.width = Math.round(W0 * vs); v.height = Math.round(H0 * vs);
      const vx = v.getContext('2d'); vx.fillStyle = '#fff'; vx.fillRect(0, 0, v.width, v.height); vx.drawImage(i, 0, 0, v.width, v.height);
      ok({ name: d.name, groesse: [W0, H0], messung: { toene, im_rahmen: Math.round(im_rahmen * 1000) / 1000, schwarz: Math.round(schwarz / (alle.length || 1) * 1000) / 1000 }, vorschau: v.toDataURL('image/jpeg', .82) });
    };
    i.onerror = () => nein(new Error(t('p_kaputt')));
    i.src = d.daten;
  });
}
/* Anteil und Satz in Alltagswörtern (Robert 23.11.2026: «sowas versteht keiner»): keine Codes, kein ΔE, keine Prozentspalte */
function anteilWort(x, rahmen) { return t(rahmen && x < .01 ? 'a_nichts' : x >= .65 ? 'a_fast_alles' : x >= .35 ? 'a_haelfte' : x >= .18 ? 'a_viertel' : x >= .06 ? 'a_etwas' : 'a_klein'); }
const tonSatz = x => t('p_' + x.urteil, x.name);
function ergebnis(j, ziel) {
  const Z = ziel || $('#li-pr');
  const m = j.messung;
  const band = `<p class="li-fband" aria-hidden="true">${m.toene.map(x => `<i style="flex:${Math.max(.004, x.anteil)};background:${x.hex}"></i>`).join('')}</p>`;
  const HAUPT = m.toene.slice(0, 8), REST = m.toene.slice(8);
  const schwarzName = (S.d.farben.find(f => f.k === 'schwarz') || {}).n || 'Black';
  const sonder = [m.schwarz > .01 ? t('p_schwarz', anteilWort(m.schwarz), schwarzName) : '', j.groesse && j.groesse[0] < 900 ? t('p_klein', zahl(j.groesse[0])) : ''].filter(Boolean);
  const fazit = m.im_rahmen >= .75 ? t('p_fazit_gut') : m.im_rahmen >= .4 ? t('p_fazit_mittel') : t('p_fazit_schlecht');
  /* Farbe für Farbe: links die Farbe aus dem Entwurf, daneben die nächste Farbe des Hauses mit Namen; was nicht passt, zuerst */
  const reihe = { fremd: 0, nah: 1, gleich: 2 };
  const punkte = HAUPT.slice().sort((a, b) => reihe[a.urteil] - reihe[b.urteil] || b.anteil - a.anteil).map((p, i) => `<li class="li-pk li-pk--${p.urteil === 'fremd' ? 'passt_nicht' : p.urteil === 'nah' ? 'achten' : 'passt'}" data-r style="--i:${i}">
      <span class="li-pk__m"><span class="li-pk__f"><i style="background:${p.hex}"></i><small>${esc(t('p_entwurf'))}</small></span><span class="li-pk__f"><i style="background:${esc(p.palette)}"></i><small>${esc(p.name)}</small></span></span>
      <span class="li-pk__t"><b>${esc(tonSatz(p))}</b><span>${esc(anteilWort(p.anteil))}</span></span></li>`).join('');
  if (!ziel) { const u = $('#li-bsp-erg'); if (u) u.innerHTML = ''; }
  Z.innerHTML = `<div class="li-erg">
    <aside class="li-erg__l">
      <figure class="dx-p li-erg__bild" data-r><img src="${j.vorschau}" alt="${esc(j.name)}"><figcaption><b>${esc(j.name)}</b>${j.groesse ? `<small>${esc(t('p_seiten', zahl(j.groesse[0]), zahl(j.groesse[1])))}</small>` : ''}</figcaption></figure>
    </aside>
    <div class="li-erg__r">
      ${j.beispiel ? `<p class="dx-p li-hinweis li-hinweis--bsp" data-r><b class="dx-mono">Example</b>${esc(t('p_beispiel_h'))}</p>` : ''}
      <section class="dx-p li-gesamt" data-r><p class="dx-mono">${esc(t('p_gesamt'))}</p><p class="li-gesamt__s">${esc(fazit)}</p></section>
      <section class="dx-p li-erg__farben" data-r><h3>${esc(t('p_farben'))}</h3><p class="leise">${esc(t('p_farben_s'))}</p>
        ${band}<p class="li-rahmen-s">${esc(t('p_rahmen', anteilWort(m.im_rahmen, true)))}</p>
        ${sonder.length ? `<ul class="li-sonder">${sonder.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}</section>
    </div></div>
    <div class="li-erg-liste">
      ${st('pipette', esc(t('p_liste')), j.beispiel ? 'Example' : esc(j.name), t('p_liste_s'))}
      <ol class="li-punkte li-punkte--zwei">${punkte}</ol>${REST.length ? `<p class="leise li-rest">${esc(t('p_rest', REST.length))}</p>` : ''}
      <div class="dx-wleist dx-p li-erg__kn"><span class="dx-stp">${ic('check', 'ck')}${esc(t('p_privat'))}</span><span class="dx-wr">${knopf(esc(t('p_neu')), 'upload', 'gold', { attr: 'data-neu' })}${knopf(esc(t('p_kopie')), 'kopie', '', { attr: 'data-kopie-erg' })}${knopf(esc(t('p_sichern')), 'download', '', { attr: 'data-sichern' })}</span></div>
    </div>`;
  auftritte(Z);
  ausgleich(Z);
  const kn = x => Z.querySelector(x);
  kn('[data-neu]').onclick = () => { S.ergebnis = null; S.datei = null; feld(); scrollTo({ top: 0, behavior: RUHIG() ? 'auto' : 'smooth' }); };
  kn('[data-kopie-erg]').onclick = () => kopiere(alsText(j));
  kn('[data-sichern]').onclick = () => sichere(j);
}
/* Beide Spalten des Ergebnisses enden auf einer Linie (Fehlerbuch «Karten nie versetzt enden», Prüfung 23.11.2026 A1/35): die Bildfläche des Entwurfs
   nimmt den Unterschied auf, das Bild steht darin ganz und mittig. Nur nebeneinander; untereinander bleibt das Bild in seiner Grösse. */
function ausgleich(Z) {
  const l = Z.querySelector('.li-erg__l'), r = Z.querySelector('.li-erg__r'), img = Z.querySelector('.li-erg__bild img');
  if (!l || !r || !img) return;
  const los = () => {
    if (!img.isConnected) { if (ro) ro.disconnect(); return removeEventListener('resize', los); }
    const lb = l.getBoundingClientRect(), rb = r.getBoundingClientRect(), ib = { width: img.offsetWidth, height: img.offsetHeight };   // Bild ohne die laufende Auftritts-Bewegung messen
    if (Math.abs(lb.top - rb.top) > 2 || rb.left < lb.right) { if (img.style.height) { img.style.height = ''; img.classList.remove('li-erg__fest'); } return; }   // untereinander
    const nat = img.naturalWidth ? ib.width * img.naturalHeight / img.naturalWidth : 0, d = rb.height - lb.height;
    if (!nat || Math.abs(d) < 1) return;
    const neu = Math.round(Math.min(Math.max(220, ib.height + d), nat * 1.9));
    if (Math.abs(neu - ib.height) >= 1) { img.style.height = neu + 'px'; img.classList.add('li-erg__fest'); }
  };
  const ro = 'ResizeObserver' in window ? new ResizeObserver(() => requestAnimationFrame(los)) : null;
  if (ro) { ro.observe(l); ro.observe(r); }
  if (img.complete) los(); else img.addEventListener('load', los, { once: true });
  addEventListener('resize', los);
}
function alsText(j) {
  const m = j.messung;
  const z = [`${t('name')} · ${t('pruefung')} · ${j.name}`, ''];
  if (j.beispiel) z.push(t('p_beispiel_h'), '');
  z.push(t('p_rahmen', anteilWort(m.im_rahmen, true)), '', t('p_liste') + ':');
  m.toene.slice(0, 8).forEach(x => z.push(`  ${anteilWort(x.anteil)}: ${tonSatz(x)}`));
  if (m.toene.length > 8) z.push('  ' + t('p_rest', m.toene.length - 8));
  return z.join('\n');
}
function sichere(j) {
  // nur auf ausdrücklichen Wunsch: eine Datei auf diesem Rechner, nichts auf dem Server
  const html = `<!doctype html><meta charset="utf-8"><title>${esc(t('name'))} · ${esc(j.name)}</title><body style="font:15px/1.6 system-ui;max-width:820px;margin:40px auto;color:#1d1915;background:#f5f1ea;padding:0 20px">
    <h1 style="font:400 30px/1.15 Georgia,serif;color:#15120f">${esc(t('pruefung'))}: ${esc(j.name)}</h1><img src="${j.vorschau}" style="max-width:360px;border-radius:12px"><pre style="white-space:pre-wrap;font:14px/1.6 system-ui">${esc(alsText(j))}</pre>
    <p style="color:#8a5634;font-size:12px">${esc(t('name'))} · The Cat &amp; Gun · ${new Date().toLocaleString('en-GB')}</p></body>`;
  speichereBlob(new Blob([html], { type: 'text/html' }), 'colour-check-' + (j.name.replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase().slice(0, 60) || 'draft') + '.html');
}

/* ---------------------------------------------------------------- Fenster, Meldung */
let VORHER_FOKUS = null;
function fenster(html, name) {
  const f = $('#fenster');
  VORHER_FOKUS = document.activeElement;
  f.innerHTML = `<div class="fenster__k li-fk" role="dialog" aria-modal="true" aria-label="${esc(name || t('bilder'))}"><button class="rund fenster__zu" type="button" data-zu aria-label="${esc(t('schliessen'))}">${ZU}</button>${html}</div>`;
  f.hidden = false; document.body.classList.add('li-zu');
  $$('[data-zu]', f).forEach(b => b.onclick = fensterZu);
  f.onclick = e => { if (e.target === f) fensterZu(); };
  const zu = $('[data-zu]', f); if (zu) zu.focus({ preventScroll: true });
}
function fensterZu() {
  if (S.fensterZu) { S.fensterZu(); S.fensterZu = null; }
  $('#fenster').hidden = true; $('#fenster').innerHTML = ''; document.body.classList.remove('li-zu');
  if (VORHER_FOKUS && VORHER_FOKUS.focus) VORHER_FOKUS.focus({ preventScroll: true });
}
addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#fenster').hidden) fensterZu(); });
const OK_Z = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 6.6 11.5 12.5 4.8"/></svg>';
const FEHL_Z = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3.5v5.5M8 11.6v.4"/></svg>';
function melde(text, fehl = false) {
  const m = $('#meldung'); while (m.children.length >= 3) m.firstChild.remove();
  const q = document.createElement('div');
  q.className = 'quit' + (fehl ? ' fehl' : '');
  q.setAttribute('role', fehl ? 'alert' : 'status');
  q.innerHTML = `<i class="quit__z">${fehl ? FEHL_Z : OK_Z}</i><div><b>${esc(text)}</b></div><button type="button" aria-label="${esc(t('schliessen'))}">${ZU}</button>`;
  q.querySelector('button').onclick = () => q.remove();
  m.appendChild(q);
  setTimeout(() => q.remove(), fehl ? 9000 : 2600);
}

/* ---------------------------------------------------------------- Start */
/* Startfehler-Tür (R04): statt einer leeren Fläche sagt das Werkzeug, dass und warum es nicht startet */
function startfehler(grund) {
  window.LIVRE_BEREIT = true; clearTimeout(window.LIVRE_LADE);
  $('#ansicht').innerHTML = `<div class="dx-p li-tuer" role="alert"><span class="li-tuer__z">${ZEICHEN_N}</span><h1>${esc(t('tuer_t'))}</h1>
    <p class="li-tuer__g">${esc(grund)}</p><p>${esc(t('tuer_hilfe'))}</p>
    <div class="dx-wkst">${knopf(esc(t('tuer_neu')), 'zurueck', 'gold', { attr: 'data-neu' })}${knopf(esc(t('anleitung')), 'guide', '', { href: 'anleitung.html', neu: true })}${knopf(esc(t('maison')), 'haus', '', { href: MAISON })}</div></div>`;
  const b = $('#ansicht [data-neu]'); if (b) b.onclick = () => location.reload();
}
/* Beigaben wie in den anderen Werkzeugen: «Zur Werkbank» (R19, nur aus der Werkbank geöffnet) und der kurze Rundgang (R18), Fassung wie livre.js */
function beigabe(src, daten) {
  const s = document.createElement('script'); s.src = src + '?v=' + ((($('script[src*="livre.js"]') || {}).src || '').split('v=')[1] || 1); s.defer = true;
  Object.entries(daten || {}).forEach(([k, v]) => s.setAttribute('data-' + k, v));
  document.body.appendChild(s);
}
/* Auftakt (R02): ruhig warten, bis Schriften und das Foto der ersten Bühne da sind, höchstens 2,5 s, dann alles auf einmal */
function bereit(ansicht) {
  const bild = new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = buehneVon(ansicht); if (i.decode) i.decode().then(r, r); });
  return Promise.race([Promise.all([document.fonts ? document.fonts.ready : 0, bild]), new Promise(r => setTimeout(r, 2500))]);
}
/* Veröffentlichung im Brand book editor innert Sekunden zeigen (Prüfung 23.11.2026, A5: Abnahme verlangt 5 s). Der Editor läuft auf einer anderen Adresse,
   sein Bescheid im Browser (BroadcastChannel) kommt hier nicht an. Deshalb alle 4 s nach der Kennung des veröffentlichten Stands schauen, nur solange die
   Seite sichtbar ist, und sofort, wenn Julie aus dem Editor zurück in dieses Fenster wechselt. Online ist stand.json eine fertige Datei der Website. */
function nachsehen(jetzt, neu) {
  let laeuft = false;
  const schau = () => {
    if (document.hidden || laeuft || !jetzt()) return; laeuft = true;
    fetch(Fundus.basis + 'stand.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : r.text().then(() => null))
      .then(d => { if (d && d.kennung && d.kennung !== jetzt()) return neu(); }).catch(() => { /* Netz weg: alter Stand bleibt */ }).finally(() => { laeuft = false; });
  };
  setInterval(schau, 4000);
  addEventListener('focus', schau); addEventListener('pageshow', schau); document.addEventListener('visibilitychange', schau);
}
/* Änderung im Brand book editor (veröffentlicht): neu zeichnen, ohne die Ansicht zu verlassen */
function neuerStand(fd) {
  if (!fd || fd.kennung === (S.d && S.d.kennung)) return;
  S.fd = fd; S.d = aufbereiten(fd); S.bspJ = null;
  Fundus.schriftenLaden();
  kopf(); rand(); zeichne(true);
  melde(t('neu_da'));
}
(async function () {
  document.documentElement.lang = SP;
  try {
    try {
      if (!window.Fundus) throw new Error('fundus.js');
      S.fd = await Fundus.laden();
      if (!S.fd || !Array.isArray(S.fd.fotos) || !Array.isArray(S.fd.farben)) throw new Error('Form');
      S.d = aufbereiten(S.fd);
      Fundus.schriftenLaden();
      document.title = `${NAMEN.marke || 'Brand book'} · The Cat & Gun`;
    } catch (e) { return startfehler(t('fehler_json') + ' (' + (/Failed to fetch|Load failed|NetworkError/.test(e.message) ? 'offline' : e.message) + ')'); }
    const h0 = location.hash.slice(1), fm = /^bilder\/([\w-]+)$/.exec(h0), h = fm ? 'bilder' : h0;
    if (fm && fotoVon(fm[1])) S.foto = fm[1];
    try {
      const ausMaison = /\/maison\/?(index\.html)?([?#].*)?$/.test(document.referrer) && ((performance.getEntriesByType('navigation')[0] || {}).type !== 'reload');
      S.ansicht = ANSICHTEN.includes(h) ? h : ausMaison ? (localStorage.removeItem('cg-livre-ansicht'), 'start') : (ANSICHTEN.includes(localStorage.getItem('cg-livre-ansicht')) ? localStorage.getItem('cg-livre-ansicht') : 'start');
    } catch (e) { S.ansicht = 'start'; }
    /* Abnahme 28.11.2026: ein Foto, das direkt über die Adresse offen ist (#bilder/<foto>, neu laden), wurde gezeichnet, bevor der Server geantwortet hat.
       Die Print-Zeile sagte dann «website size (no original stored)» und der Hinweis «Without the server part …» stand da, obwohl das Original da ist.
       Deshalb wartet nur diese Ansicht kurz (höchstens 1,5 s) auf die Antwort; kommt sie später, wird das Foto einmal neu gezeichnet. */
    const standDa = fetch('api/stand', { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject()).then(j => { S.server = true; S.nurWeb = new Set(j.ohne_original || []); }).catch(() => { S.server = false; });
    await Promise.all([bereit(S.ansicht), S.foto ? Promise.race([standDa, new Promise(r => setTimeout(r, 1500))]) : 0]);
    const ohneAntwort = S.server == null;
    standDa.then(() => { if (ohneAntwort && S.server && S.ansicht === 'bilder' && S.foto) zeichne(true); });
    clearTimeout(window.LIVRE_LADE);
    kopf(); rand(); leiste(); zeichne();
    document.body.classList.add('li-bereit'); window.LIVRE_BEREIT = true;
  } catch (e) { return startfehler(String(e && e.message || e).slice(0, 200)); }
  addEventListener('hashchange', () => { const a = location.hash.slice(1), fm = /^bilder\/([\w-]+)$/.exec(a);
    if (fm && fotoVon(fm[1])) { if (fm[1] !== S.foto) detail(fm[1]); return; }
    if (ANSICHTEN.includes(a) && (a !== S.ansicht || S.foto)) gehe(a); });
  Fundus.beiAenderung(neuerStand);
  nachsehen(() => S.d && S.d.kennung, () => Fundus.laden().then(neuerStand));
  beigabe('zur-werkbank.js', { zw: '', neben: '#rand', ueber: '#leiste' });
  beigabe('rundgang.js', { werkzeug: 'livre' });
})();
