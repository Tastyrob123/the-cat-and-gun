/* Brand book editor · The Cat & Gun, Catangnan (22.11.2026). Umbau von Le Livre der Vorlage (Culinarium, _werkzeuge/livre/livre.js): Rahmen,
   Startbilder, Fenster, Auftritte, Startfehler-Tür und Auftakt wie dort; Leiste, Speichern, Quittung, Konflikt, Veröffentlichen und Frühere Fassungen
   nach den Bausteinen von Le Bureau (bureau/termine-ansicht.js, werkzeuge/website/website.js). Hier wird der Markenfundus gepflegt (fundus/FORMAT.md):
   Farben und Farbwelten, Schriften, Fotos, Sätze des Hauses, Elemente. Eine Änderung gilt nach «Publish» in jedem gestaltenden Werkzeug.
   Daten: api/fundus (server.py lokal, online Worker aus unterbau/). Keine KI. Fehlermelder, Ladezeichen und Startfehler laufen vorher in start.js. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
const PU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v9M3.8 7 8 11.2 12.2 7M3 14h10"/></svg>';
const PO = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 12V3M3.8 7 8 2.8 12.2 7M3 14h10"/></svg>';
const ZU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 9.67 2.67 6.33 6 3M2.67 6.33h7.33a3.33 3.33 0 0 1 0 6.67h-2"/></svg>';   // wie die Vorlage: kein «×», der Zurück-Pfeil
const LUPE = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3.5 3.5"/></svg>';
const PIPETTE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.2 2.6a1.9 1.9 0 0 1 2.7 2.7l-1.4 1.4.7.7-1 1-.7-.7-5 5H3v-2.5l5-5-.7-.7 1-1 .7.7z"/></svg>';
const PLUS = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>';
const AUGE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></svg>';
const AUS = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2l12 12M6.6 4a6.6 6.6 0 0 1 1.4-.5c4 0 6.5 4.5 6.5 4.5a11 11 0 0 1-2 2.5M4.3 5.3C2.6 6.5 1.5 8 1.5 8S4 12.5 8 12.5c1 0 1.9-.3 2.7-.7"/></svg>';
/* Zeichen des neuen Looks (Control panel, 24.–26.11.2026): Pfade aus dem Bereichs-Entwurf (_entwurf-dashboard/runde2, runde3, website- und editor-bereich) */
const DKI = {
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
  pfeil: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  uhr: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  foto: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  auge: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  check: '<path d="m5 12 4 4 10-10"/>',
  tel: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  glas: '<path d="M6 3h12l-1.5 8a4.5 4.5 0 0 1-9 0z"/><path d="M12 15.5V21M8 21h8"/>',
  zeilen: '<path d="M4 6h16M4 11h16M4 16h10"/>',
  schrift: '<path d="M5 20 11 4h2l6 16M8 14h8"/>',
  lagen: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  verlauf: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  zurueck: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  vergleich: '<rect x="3" y="4" width="8" height="16" rx="2"/><rect x="13" y="4" width="8" height="16" rx="2"/><path d="M6 9h2M6 13h2M16 9h2M16 13h2"/>',
  senden: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
  speichern: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>'
};
const dic = (n, c = 'dk-ico') => `<svg class="${c}" viewBox="0 0 24 24" aria-hidden="true">${DKI[n] || DKI.pfeil}</svg>`;
const LOOK = 'look/bild/';
const FUNDUS = '/the-cat-and-gun/haus/_werkzeuge/fundus/';
const MAISON = (window.WO_HAUS && WO_HAUS.wege && WO_HAUS.wege.zentrale) || '/the-cat-and-gun/haus/_werkzeuge/maison/';
const WEBSITE = '/';
const ANLEITUNG = 'anleitung.html';
const NAME = (window.WO_HAUS && WO_HAUS.namen && WO_HAUS.namen.marke) || 'Brand book editor';
const RUHIG = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const PICKER = 'EyeDropper' in window;   // Pipette auf dem ganzen Bildschirm (Chrome/Edge)

/* ---------------------------------------------------------------- Texte der Oberfläche (Englisch, Alltagswörter, kurze Sätze) */
const T = {
  start: 'Overview', arbeiten: 'Work', nachschlagen: 'Look up', farben: 'Colours', schriften: 'Fonts', fotos: 'Photos', texte: 'Lines', elemente: 'Logo & elements', verlauf: 'Earlier versions',
  morgen: 'Good morning.', tag: 'Good afternoon.', abend: 'Good evening.', frage: 'What shall we change?',
  start_satz: 'The colours, fonts, photos and lines of The Cat & Gun in one place. What you publish here holds in every tool that designs: Sticker editor, Print & feed and Brand book.',
  k_farben: 'Change a colour, name it, hide it or build a new palette.', k_schriften: 'Choose the font for titles, text and numbers.',
  k_fotos: 'Swap, add or hide the photos of the house.', k_texte: 'The lines of the house, word for word.', k_elemente: 'Wordmark, ampersand, pool ball and stickers, each part in its own colour.',
  k_verlauf: 'Every saved and published version. Each one can come back.',
  einfach: 'Simple', mehr: 'More options', modus: 'Mode',
  oeffnen: 'Open', speichern: 'Save', gespeichert: 'Saved', raus: 'Publish', vgl: 'Before / after', erst: 'Save first',
  l_offen: n => n === 1 ? '1 change not saved yet' : `${n} changes not saved yet`,
  l_wartet: n => n === 1 ? 'Draft: 1 change waiting' : `Draft: ${n} changes waiting`,
  l_alles: 'Everything is published',
  s_offen: 'Save puts them in the draft. The other tools see them after you publish.',
  s_wartet: 'Saved. Not yet in the other tools.',
  s_zuletzt: z => `Last published ${zeit(z.zeit)}${z.notiz ? ' · ' + z.notiz : ''}.`,
  s_nie: 'The brand collection is as it was built.',
  aus_t: 'Hidden', aus_s: 'Hidden pieces stay in the collection. Show them again at any time.',
  zeigen: 'Show again', verbergen: 'Hide', entfernen: 'Remove', neu: 'New', abbrechen: 'Cancel', uebernehmen: 'Use this colour', fertig: 'Done',
  netz: 'NETWORK · The server does not answer. Your changes are still here. Please try again.'
};
const t = k => T[k];
const zahl = n => Number(n).toLocaleString('en-GB');
const mz = (n, eins, viele) => n + ' ' + (n === 1 ? eins : viele);
function zeit(iso) {
  const m = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/.exec(iso || ''); if (!m) return iso || '';
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m[2] - 1];
  return `${+m[3]} ${mon} ${m[1]}, ${m[4]}:${m[5]}`;
}

/* ---------------------------------------------------------------- Zustand */
const S = { L: null, d: null, base: null, ansicht: 'start', gesp: 0, svg: {}, f: { q: '', s: 'alle' }, n: 48, fensterZu: null,
  modus: (() => { try { return localStorage.getItem('cg-mb-modus') === 'mehr' ? 'mehr' : 'einfach'; } catch (e) { return 'einfach'; } })() };
const ANSICHTEN = ['start', 'farben', 'schriften', 'fotos', 'texte', 'elemente', 'verlauf'];
const LISTEN = ['farben', 'welten', 'schriften', 'elemente', 'fotos', 'texte', 'rollen'];
const kopie = x => JSON.parse(JSON.stringify(x));
const nackt = d => { const o = kopie(d || {}); delete o.kennung; delete o.gebaut; return o; };
const basis = () => nackt(S.L.entwurf || S.L.stand);
const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const nach = (l, id) => (l || []).find(x => x.id === id);
function zaehle(alt, neu) {
  let n = 0;
  LISTEN.forEach(k => {
    const a = new Map((alt[k] || []).map(x => [x.id, x])), b = new Map((neu[k] || []).map(x => [x.id, x]));
    b.forEach((x, i) => { if (!gleich(a.get(i), x)) n++; });
    a.forEach((x, i) => { if (!b.has(i)) n++; });
  });
  return n;
}
const offen = () => S.d && S.base ? zaehle(S.base, S.d) : 0;
const wartet = () => S.L && S.L.wartet ? zaehle(nackt(S.L.stand), nackt(S.L.entwurf)) : 0;
/* «Remove für neu Angelegtes» (Robert 28.11.2026): Schrift, Zeile und Farbwelt, die noch nie veröffentlicht wurden, lassen sich entfernen;
   was im veröffentlichten Stand steht, bleibt beim Ausblenden */
const nieRaus = (k, id) => !!(S.L && S.L.stand) && !nach(S.L.stand[k], id);
const fname = (d, id) => (nach(d.farben, id) || {}).name || id;
const sname = (d, id) => (nach(d.schriften, id) || {}).name || id;

/* Was sich geändert hat, in Worten (Quittung, Vorher/nachher, Veröffentlichen) */
function zeilen(alt, neu) {
  const z = [];
  const liste = (k, wort, beschreibe) => {
    const a = new Map((alt[k] || []).map(x => [x.id, x]));
    (neu[k] || []).forEach(x => {
      const v = a.get(x.id);
      if (!v) { z.push(`New ${wort} «${x.name || x.titel || x.id}»`); return; }
      if (gleich(v, x)) return;
      if (v.aus !== x.aus) { z.push(`${cap(wort)} «${x.name || x.titel}» ${x.aus ? 'hidden' : 'shown again'}`); if (gleich({ ...v, aus: x.aus }, x)) return; }
      z.push(beschreibe(v, x));
    });
    a.forEach((v, id) => { if (!nach(neu[k], id)) z.push(`${cap(wort)} «${v.name || v.titel}» removed`); });
  };
  liste('farben', 'colour', (v, x) => v.wert !== x.wert ? `Colour «${x.name}»: ${v.wert} becomes ${x.wert}` : v.name !== x.name ? `Colour «${v.name}» is now called «${x.name}»` : `Colour «${x.name}» changed`);
  liste('welten', 'palette', (v, x) => v.name !== x.name ? `Palette «${v.name}» is now called «${x.name}»` : `Palette «${x.name}»: ${mz(x.farben.length, 'colour', 'colours')}`);
  liste('schriften', 'font', (v, x) => v.name !== x.name ? `Font «${v.name}» is now called «${x.name}»` : `Font «${x.name}»: weights ${x.erlaubt.join(', ')}`);
  liste('elemente', 'element', (v, x) => {
    const t2 = x.teile.find((tt, i) => !gleich(tt, v.teile[i]));
    return t2 ? `«${x.name}»: part ${t2.name} becomes ${t2.wert || fname(neu, t2.farbe)}` : v.name !== x.name ? `Element «${v.name}» is now called «${x.name}»` : `Element «${x.name}» changed`;
  });
  liste('fotos', 'photo', (v, x) => `Photo «${x.titel || x.id}»: new title`);
  liste('texte', 'line', (v, x) => v.text !== x.text ? `Line «${x.titel}»: «${kurz(v.text, 40)}» becomes «${kurz(x.text, 40)}»` : `Line «${v.titel}» is now called «${x.titel}»`);
  (neu.rollen || []).forEach(r => { const v = nach(alt.rollen, r.id); if (v && v.schrift !== r.schrift) z.push(`${r.name}: ${sname(alt, v.schrift)} becomes ${sname(neu, r.schrift)}`); });
  return z;
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const kurz = (s, n) => { s = String(s || '').replace(/\s+/g, ' '); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

/* Zusammenführen nach einem Konflikt: was ich geändert habe, kommt auf den neuen Stand; was der andere geändert hat, bleibt (nichts wird überschrieben) */
function zusammen(alt, neu, meins) {
  const o = kopie(neu), gleiche = [];
  LISTEN.forEach(k => {
    const a = new Map((alt[k] || []).map(x => [x.id, x]));
    (meins[k] || []).forEach(x => {
      const v = a.get(x.id), n2 = nach(o[k], x.id);
      if (v && gleich(v, x)) return;                                   // ich habe es nicht angefasst
      if (n2 && v && !gleich(v, n2) && !gleich(n2, x)) gleiche.push(x.name || x.titel || x.id);
      if (n2) o[k][o[k].indexOf(n2)] = kopie(x); else o[k].push(kopie(x));
    });
  });
  return { d: o, gleiche };
}

/* ---------------------------------------------------------------- Server */
let unterwegs = 0;
async function ruf(methode, weg, daten) {
  let r, j = null;
  unterwegs++; document.documentElement.setAttribute('data-mb-laeuft', unterwegs);
  try {
    r = await fetch('api/' + weg, { method: methode, headers: daten ? { 'Content-Type': 'application/json' } : {}, body: daten ? JSON.stringify(daten) : undefined, cache: 'no-store' });
    try { j = await r.json(); } catch (e) { /* keine lesbare Antwort */ }
  } catch (e) { throw { fehler: t('netz'), stichwort: 'netz' }; } finally { unterwegs--; document.documentElement.setAttribute('data-mb-laeuft', unterwegs); }
  if (!r.ok || !j) throw Object.assign({ status: r.status, fehler: (j && j.fehler) || `SERVER · Unexpected answer (${r.status}).`, stichwort: (j && j.stichwort) || 'server' }, j || {});
  return j;
}
function uebernehmen(L, eingabenBehalten) {
  S.L = L;
  const b = basis();
  if (!eingabenBehalten) S.d = kopie(b);
  S.base = b;
  schriftenLaden();
}

/* ---------------------------------------------------------------- Grundgerüst (Paket «Die Bühne»: WO.kopf, WO.rand, WO.leiste, WO.startbild) */
function kopf() {
  const titel = t(S.ansicht);
  const n = offen(), a = wartet();
  const st = n ? t('l_offen')(n) : a ? t('l_wartet')(a) : t('l_alles');
  $('#kopf').innerHTML = WO.kopf({ werkzeug: 'marke', unter: 'Brand', titel, stand: st, anleitung: ANLEITUNG, website: WEBSITE, marke: 'data-gehe="start"', markeHref: '#start' });
  $$('#kopf [data-gehe]').forEach(x => x.onclick = e => { e.preventDefault(); gehe(x.dataset.gehe); });
}
/* Seitenleiste wie im Control panel (maison/index.html, .dx-rail.dx-lack6): Wortmarke, die acht Werkzeuge mit Tasten 1–8, Öffnungszeit, Telefon, Guides.
   Unter «Brand editor» stehen die Bereiche dieses Werkzeugs (data-gehe wie vorher, auch für den Rundgang und die Prüfläufe). */
const WZ = () => { const w = (window.WO_HAUS && WO_HAUS.wege) || {}; return [
  ['1', w.website, 'web', 'Website', 'Texts, photos, opening hours'], ['2', w.karten, 'menu', 'Menus', 'Food and drinks with prices'],
  ['3', w.gaeste, 'chat', 'Guests', 'Guest questions and the chat'], ['4', w.buch, 'buch', 'Brand book', 'Logo, colours, fonts, photos'],
  ['5', '', 'palette', 'Brand editor', ''], ['6', w.sticker, 'sticker', 'Stickers', 'Stickers with the logo'],
  ['7', w.druck, 'druck', 'Print & feed', 'Signs, coasters, posts'], ['8', w.besuche, 'besuch', 'Visitors', 'Visits to the website']]; };
/* Seitenleiste fährt mit (Robert 27.11.2026, wie sticker/neu.js › mitfahren, Commit a284a0fd): ist sie höher als das Fenster, scrollt sie mit der Seite,
   bis ihr unteres Ende am Fensterrand steht, und bleibt dort; beim Hochscrollen fährt sie mit zurück, bis ihr oberes Ende wieder oben steht.
   Passt sie ganz ins Fenster, steht sie oben fest. Ab 1200 px; am Handy bleibt alles, wie es ist. */
function mitfahren(rail) {
  if (!rail || rail.dataset.nlFahrt) return; rail.dataset.nlFahrt = '1';
  let y = null, letzt = 0;
  const rand_ = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nl-rand')) || 22;
  function setze() {
    if (innerWidth < 1200 || !rail.offsetHeight) { rail.style.removeProperty('top'); y = null; return; }
    const m = rand_(), h = rail.offsetHeight, H = innerHeight, unten = Math.min(m, H - h - m), p = scrollY;
    if (y === null) { y = m; letzt = p; }
    y = Math.max(unten, Math.min(m, y - (p - letzt))); letzt = p;
    rail.style.setProperty('top', y + 'px', 'important');
  }
  addEventListener('scroll', setze, { passive: true });
  addEventListener('resize', setze);
  if ('ResizeObserver' in window) new ResizeObserver(setze).observe(rail);
  setze();
}
/* Die Leiste wird nach jeder Eingabe neu gezeichnet. bewegung.js liess die sieben Bereiche danach jedes Mal von unten einfliegen (nach jedem Klick,
   1,25 s), der letzte lag dabei über «Stickers» (Abnahme 28.11.2026). Sie fliegen nur beim ersten Zeichnen ein, danach stehen sie (data-wo-bw-nie). */
let RAND_DA = false;
function rand() {
  const d = S.d, sicht = k => d ? d[k].filter(x => !x.aus).length : 0, ruhig = RAND_DA ? ' data-wo-bw-nie' : '';
  const e = (key, text, z = '') => `<li><button type="button" class="wo-re dk-ur${S.ansicht === key ? ' wo-an' : ''}"${S.ansicht === key ? ' aria-current="true"' : ''}${ruhig} data-gehe="${key}"><span>${esc(text)}</span>${z !== '' ? `<b class="wo-zahl">${zahl(z)}</b>` : ''}</button></li>`;
  const unter = `<ul class="dk-unter" aria-label="${esc(NAME)}">${e('start', t('start'))}${e('farben', t('farben'), sicht('farben'))}${e('schriften', t('schriften'), sicht('schriften'))}${e('fotos', t('fotos'), sicht('fotos'))}${e('texte', t('texte'), sicht('texte'))}${e('elemente', t('elemente'), sicht('elemente'))}${e('verlauf', t('verlauf'), S.L ? S.L.verlauf.filter(v => v.art === 'veroeffentlicht').length : '')}</ul>`;
  const eigen = d ? `${mz(sicht('farben'), 'colour', 'colours')} · ${mz(sicht('fotos'), 'photo', 'photos')}` : '';
  /* Markup und Klassen wie die Seitenleiste von Edit website (aside.wo-rand.dx-rail.dx-lack6, Robert 27.11.2026); Regeln in look/leiste-dx.css */
  const di = n => dic(n, 'dx-ico');
  const nav = WZ().map(([k, href, i, n, sub]) => k === '5'
    ? `<a class="dx-jetzt" href="#start" data-gehe="start" aria-current="page"><kbd>${k}</kbd>${di(i)}<span><b>${esc(n)}</b><i>${esc(eigen)}</i></span></a>${unter}`
    : `<a href="${esc(href || '#')}"><kbd>${k}</kbd>${di(i)}<span><b>${esc(n)}</b><i>${esc(sub)}</i></span></a>`).join('');
  const r = $('#rand'); r.classList.add('dx-rail', 'dx-lack6');
  r.innerHTML = `<div class="dx-s6rahmen"><div class="dx-marke"><a href="${esc(MAISON)}" title="${esc(WO.name('zentrale'))}"><img src="${LOOK}wortmarke-weiss.svg" alt="The Cat &amp; Gun · ${esc(WO.name('zentrale'))}" width="118" height="78"></a><span class="dx-mono">Catangnan, Siargao</span></div>
    <div class="dx-mono dx-rk">Tools <span>keys 1–8</span></div><nav aria-label="Tools of the house">${nav}</nav>
    <div class="dx-rhaus"><span>${di('uhr')}Open daily 7AM – 10PM</span><span>${di('tel')}+63 962 040 3853</span></div>
    <div class="dx-rfuss wo-rand__wege"><a href="${esc(MAISON)}">${di('haus')}<span><b>${esc(WO.name('zentrale'))}</b><i>All tools of the house</i></span></a><a href="${ANLEITUNG}" target="_blank" rel="noopener">${di('buch')}<span><b>Guide</b><i>How the Brand book editor works</i></span></a><a href="${WEBSITE}" target="_blank" rel="noopener">${di('web')}<span><b>View website</b><i>As guests see it</i></span></a><a href="https://tastyrob123.github.io/the-cat-and-gun/schulung/akademie/" target="_blank" rel="noopener">${di('guide')}<span><b>Guides</b><i>11 videos</i></span></a></div>
  </div>`;
  mitfahren(r); RAND_DA = true;
  $$('#rand [data-gehe]').forEach(x => x.onclick = ev => { ev.preventDefault(); gehe(x.dataset.gehe); });
}
function leiste() {
  if (!S.L) return;
  const n = offen(), a = wartet(), gesp = !n && S.gesp > Date.now(), z = S.L.zuletzt;
  const l = $('#leiste');
  l.setAttribute('data-mb-offen', String(n)); l.setAttribute('data-mb-wartet', String(a));
  l.innerHTML = WO.leiste({
    titel: n ? t('l_offen')(n) : a ? t('l_wartet')(a) : t('l_alles'),
    satz: n ? t('s_offen') : a ? t('s_wartet') : z ? t('s_zuletzt')(z) : t('s_nie'),
    entwurf: !!a && !n,
    knoepfe: WO.knopf(t('vgl'), 'auge', 'glas', { id: 'mb-vgl', klein: true, disabled: !(a || n) })
      + WO.knopf(gesp ? t('gespeichert') : t('speichern'), gesp ? 'haken' : 'pfeil', n ? 'wartet' : gesp ? 'fertig' : 'glas', { id: 'mb-speichern', klein: true, attr: `data-lage="${n ? 'offen' : gesp ? 'gespeichert' : 'ruhig'}"` })
      + WO.knopf(t('raus'), 'hoch', 'gold', { id: 'mb-raus', klein: true, disabled: !(a && !n), titel: n ? t('erst') : '' })
  });
  $('#mb-speichern').onclick = speichern;
  $('#mb-vgl').onclick = vorherNachher;
  $('#mb-raus').onclick = veroeffentlichen;
  wieLeiste();
}
/* Nach jeder Eingabe: Leiste, Kopf und Zahlen im Rand nachziehen (nichts speichert still, R10) */
function geaendert() { leiste(); kopf(); rand(); }

function gehe(a) {
  S.ansicht = a;
  try { localStorage.setItem('cg-mb-ansicht', a); } catch (e) { /* privat */ }
  history.replaceState(null, '', location.pathname + location.search + '#' + a);
  kopf(); rand(); zeichne();
  scrollTo({ top: 0 });
}

/* Startbild einer Ansicht: WO.startbild als Bühne mit dem Foto der Ansicht (Fotos der Website mit 800/1200 px) */
/* Foto im Bogen des Kopfs: Overview und Colours wie der Bereichs-Entwurf (b09, Pooltisch), die übrigen Ansichten Raum- und Tischfotos (Prüfung 23.11.2026, 7) */
const SB_FOTO = { start: 'b09', farben: 'b09', schriften: 'b16', fotos: 'b36', texte: 'b19', elemente: 'b27', verlauf: 'b22' };
const buehneVon = a => `/the-cat-and-gun/haus/assets/bild/${SB_FOTO[a] || 'b24'}-1200.webp`;
const TABS = ['start', 'farben', 'schriften', 'fotos', 'texte', 'elemente'];
/* Kopf einer Ansicht (Entwurf: .wkopf.p.eheld2, klein ohne Reiter): Foto im Bogen rechts, Kennzeile, grosser Titel, Satz, Stand und Knöpfe */
function held(o) {
  const tabs = o.tabs ? `<nav class="dk-tabs" aria-label="${esc(NAME)}">${TABS.map(a => `<button type="button" class="dk-tab${S.ansicht === a ? ' dk-an' : ''}" data-gehe="${a}"${S.ansicht === a ? ' aria-current="page"' : ''}>${esc(t(a))}</button>`).join('')}</nav>` : '';
  return `<section class="dk-wkopf dk-p dk-eheld2${o.tabs ? '' : ' dk-klein'}" aria-label="Start" data-r>
    <div class="dk-wkb" style="background-image:url(${buehneVon(S.ansicht)})" role="img" aria-label="${esc((window.WO_HAUS && WO_HAUS.fotoAlt) || '')}"></div>
    <div class="dk-wki"><div class="dk-mono">${dic('palette', 'dk-mi')}${esc(o.kenn)}</div><h1 class="dk-h">${o.h1}</h1>${o.satz ? `<p>${o.satz}</p>` : ''}${o.mitte || ''}
      ${o.stand || o.knoepfe ? `<div class="dk-wkst">${o.stand ? `<span class="dk-stp"><i class="dk-pt dk-gr"></i>${o.stand}</span>` : ''}${o.knoepfe || ''}</div>` : ''}</div>${tabs}</section>`;
}
/* Knopf des Entwurfs (.wk): Zeichen vorn, Text; gold für die Hauptsache */
const wk = (text, i, art = '', attr = '') => `<button type="button" class="dk-wk${art ? ' dk-' + art : ''}" ${attr}>${dic(i)}<span>${text}</span></button>`;
const wkA = (text, i, href, art = '', neu = false) => `<a class="dk-wk${art ? ' dk-' + art : ''}" href="${href}"${neu ? ' target="_blank" rel="noopener"' : ''}>${dic(i)}<span>${text}</span></a>`;
function titel(ansicht, h1, satz, kn = '', stats = []) {
  return held({ kenn: `${NAME} · ${t(ansicht)}`, h1: esc(t(ansicht)), satz: esc(satz), stand: stats.map(([a, b]) => `${esc(a)} ${esc(b)}`).join(' · '), knoepfe: kn });
}
/* Zwischentitel des Entwurfs (st(): runder Zeichenkreis, Titel, Kennzeile) */
const stitel = (i, h, k, id = '') => `<div class="dk-stitel"${id ? ` id="${id}"` : ''} data-r><span class="dk-snr">${dic(i)}</span><div><h2>${esc(h)}</h2><span class="dk-mono">${esc(k)}</span></div></div>`;
function modusWahl() {
  return `<div class="mb-modus" role="group" aria-label="${esc(t('modus'))}"><span class="mono">${esc(t('modus'))}</span><div class="wo-seg">
    <button type="button" data-modus="einfach" aria-pressed="${S.modus === 'einfach'}">${esc(t('einfach'))}</button><button type="button" data-modus="mehr" aria-pressed="${S.modus === 'mehr'}">${esc(t('mehr'))}</button></div></div>`;
}
function modusLeben() {
  $$('[data-modus]').forEach(b => b.onclick = () => {
    S.modus = b.dataset.modus; try { localStorage.setItem('cg-mb-modus', S.modus); } catch (e) { /* privat */ }
    zeichne(true);
  });
}

function zeichne(still = false) {
  const el = $('#ansicht'), a = S.ansicht, y = scrollY;
  el.innerHTML = ({ farben, schriften, fotos, texte, elemente, verlauf }[a] || start)();
  ({ farben: farbenLeben, schriften: schriftenLeben, fotos: fotosLeben, texte: texteLeben, elemente: elementeLeben, verlauf: verlaufLeben }[a] || startLeben)();
  modusLeben();
  reihen();
  auftritte(el, still);
  if (still) scrollTo({ top: y });
}

/* Volle Reihen (Fehlerbuch 10a, Prüfung 23.11.2026 Abweichung 4): Farbkarten und Tafeln stehen in Reihen gleicher Länge, auf jeder Breite.
   So viele Spalten, wie Karten in ihrer Mindestbreite Platz haben; die Reihen werden gleichmässig gefüllt (14 Karten bei 6 Plätzen: 5 + 5 + 4),
   jede Reihe reicht über die ganze Breite (Raster mit gemeinsamem Vielfachen, eine Karte spannt so viele Spalten, wie ihre Reihe braucht). */
const REIHEN = [['.li-farben', 160], ['.li-tafeln--breit', 280], ['.mb-tafeln', 210], ['.li-raster', 210]];
function reihen(wo = $('#ansicht')) {
  if (!wo) return;
  $$('.li-farben, .mb-tafeln, .li-raster', wo).forEach(c => {
    const kids = [...c.children].filter(k => !k.matches('.mb-leer, .li-leer, .mb-zeilen'));
    c.classList.toggle('mb-reihen', kids.length > 0);
    const w = c.clientWidth; if (!kids.length || !w) return;
    const min = REIHEN.find(([sel]) => c.matches(sel))[1];
    const gap = parseFloat(getComputedStyle(c).columnGap) || 14;
    const n = kids.length, platz = Math.max(1, Math.floor((w + gap) / (min + gap)));
    const r = Math.ceil(n / Math.min(n, platz)), q = Math.floor(n / r), rest = n % r;   /* rest Reihen mit q+1 Karten, danach r-rest Reihen mit q */
    const L = rest ? q * (q + 1) : q;
    c.style.setProperty('--sp', L);
    let i = 0;
    for (let z = 0; z < r; z++) { const k = z < rest ? q + 1 : q; for (let j = 0; j < k; j++) kids[i++].style.gridColumn = 'span ' + (L / k); }
  });
}
let reihenUhr;
addEventListener('resize', () => { cancelAnimationFrame(reihenUhr); reihenUhr = requestAnimationFrame(() => reihen()); });

/* Auftritte (R17, wie die Vorlage): was im ersten Bild steht, federt der Reihe nach herein (höchstens 22), alles darunter steht sofort. Nur transform. */
function auftritte(r, still) {
  const alle = $$('[data-r]', r).filter(x => !x.classList.contains('da'));
  if (still || RUHIG()) { alle.forEach(x => x.classList.add('da', 'steht')); return; }
  const H = innerHeight; let n = 0;
  /* was unterhalb des ersten Bilds steht, federt beim Hereinscrollen an seinen Platz (oberflaeche_pruefen.js Punkt 11), auch nur über transform */
  if (!auftritte.io && 'IntersectionObserver' in window) auftritte.io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.style.setProperty('--i', 0); e.target.classList.add('da'); auftritte.io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
  alle.forEach(x => { const b = x.getBoundingClientRect(); if (b.top < H && b.bottom > 0 && n < 22) { x.style.setProperty('--i', Math.min(n++, 6)); requestAnimationFrame(() => requestAnimationFrame(() => x.classList.add('da'))); } else if (b.top >= H && auftritte.io) auftritte.io.observe(x); else x.classList.add('da', 'steht'); });
}

/* ---------------------------------------------------------------- Bilder und Elemente */
const adr = p => !p ? '' : /^(https?:|data:|blob:|\/)/.test(p) ? p : FUNDUS + p;
function schriftenLaden() {
  let st = $('#mb-schriften'); if (!st) { st = document.createElement('style'); st.id = 'mb-schriften'; document.head.appendChild(st); }
  const d = S.d || basis();
  st.textContent = d.schriften.map(s => {
    const g = s.schnitte && s.schnitte.length ? Math.min(...s.schnitte) + ' ' + Math.max(...s.schnitte) : '400';
    return `@font-face{font-family:'${String(s.familie || s.name).replace(/['"\\<>]/g, '')}';src:url('${adr(s.datei).replace(/['"\\<>]/g, '')}');font-weight:${g};font-style:normal;font-display:swap}`;
  }).join('\n');
}
const familie = (d, rolle) => { const r = nach(d.rollen, rolle); const s = r && nach(d.schriften, r.schrift); return s ? `'${String(s.familie || s.name).replace(/['"\\<>]/g, '')}'` : 'serif'; };
async function svgVon(e) {
  if (!S.svg[e.datei]) S.svg[e.datei] = fetch(FUNDUS + e.datei).then(r => r.ok ? r.text() : '');
  return S.svg[e.datei];
}
/* gleiche Färbung wie fundus.js (Fundus.faerben), aber aus dem Entwurf im Editor, damit jede Eingabe sofort zu sehen ist */
function faerben(svg, e, d) {
  let s = svg;
  e.teile.forEach(tt => {
    const w = (tt.wert || (nach(d.farben, tt.farbe) || {}).wert || '#000000').replace(/[^#0-9a-fA-F]/g, '');
    s = s.replace(new RegExp(`fill="[^"]*" data-tf="${tt.id}"`, 'g'), `fill="${w}" data-tf="${tt.id}"`).replace(new RegExp(`stroke="[^"]*"( data-tf="[^"]*")? data-ts="${tt.id}"`, 'g'), (m, f) => `stroke="${w}"${f || ''} data-ts="${tt.id}"`);
  });
  return s.split("font-family:'DM Serif Display'").join('font-family:' + familie(d, 'druck')).split("font-family:'Instrument Sans'").join('font-family:' + familie(d, 'lauf'));
}
async function elementeMalen(root = document) {
  for (const ort of $$('[data-svg]', root)) {
    const e = nach(S.d.elemente, ort.dataset.svg); if (!e) continue;
    const s = await svgVon(e);
    ort.innerHTML = faerben(s, e, S.d).replace(/ width="[^"]*" height="[^"]*"/, '');
  }
}

/* ---------------------------------------------------------------- Farben: Rechnen */
const hex2rgb = h => { const m = /^#?([0-9a-f]{6})$/i.exec(String(h).trim()); if (!m) return null; const n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const rgb2hex = (r, g, b) => '#' + [r, g, b].map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
function leucht(h) { const c = hex2rgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
function kontrast(a, b) { const x = leucht(a), y = leucht(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
const urteil = k => k >= 7 ? 'AAA · all text' : k >= 4.5 ? 'AA · all text' : k >= 3 ? 'AA · large text only' : 'Too weak for text';
const dunkelGenug = h => leucht(h) < .4;
function stufen(h) {   // Abstufungen: vier heller, die Farbe, vier dunkler
  const c = hex2rgb(h), aus = [];
  [.8, .6, .4, .2].forEach(f => aus.push(rgb2hex(...c.map(v => v + (255 - v) * f))));
  aus.push(h);
  [.2, .4, .6, .8].forEach(f => aus.push(rgb2hex(...c.map(v => v * (1 - f)))));
  return aus;
}
/* Bestimmende Farben eines Bildes: k-Mittel über bis zu 12 000 Punkte, sechs Farben nach Fläche, keine zwei fast gleichen */
function bestimmende(img, k = 6) {
  const c = document.createElement('canvas'), m = 160 / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height);
  c.width = Math.max(1, Math.round((img.naturalWidth || img.width) * Math.min(1, m))); c.height = Math.max(1, Math.round((img.naturalHeight || img.height) * Math.min(1, m)));
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, c.width, c.height);
  const p = x.getImageData(0, 0, c.width, c.height).data, pts = [];
  for (let i = 0; i < p.length; i += 4) if (p[i + 3] > 200) pts.push([p[i], p[i + 1], p[i + 2]]);
  if (!pts.length) return [];
  let mitte = []; for (let i = 0; i < k * 3; i++) mitte.push(pts[Math.floor((i + .5) * pts.length / (k * 3))]);
  let grp = [];
  for (let r = 0; r < 10; r++) {
    grp = mitte.map(() => [0, 0, 0, 0]);
    pts.forEach(q => { let b = 0, bd = 1e9; mitte.forEach((m2, j) => { const dd = (q[0] - m2[0]) ** 2 + (q[1] - m2[1]) ** 2 + (q[2] - m2[2]) ** 2; if (dd < bd) { bd = dd; b = j; } }); const g = grp[b]; g[0] += q[0]; g[1] += q[1]; g[2] += q[2]; g[3]++; });
    mitte = grp.map((g, j) => g[3] ? [g[0] / g[3], g[1] / g[3], g[2] / g[3]] : mitte[j]);
  }
  const l = mitte.map((m2, j) => ({ hex: rgb2hex(...m2), n: grp[j][3], c: m2 })).filter(x => x.n).sort((a, b) => b.n - a.n), aus = [];
  l.forEach(x => { if (aus.length < k && !aus.some(y => Math.hypot(y.c[0] - x.c[0], y.c[1] - x.c[1], y.c[2] - x.c[2]) < 38)) aus.push(x); });
  return aus.map(x => ({ hex: x.hex, anteil: x.n / pts.length }));
}
/* Schlüssel für Neues. Mehrere Stücke im selben Augenblick (neun Abstufungen, sechs Farben eines Fotos) dürfen nie denselben bekommen,
   sonst weist der Server das Speichern ab («Two colours have the same key», Abnahme 28.11.2026): die Zählnummer macht jeden eindeutig. */
let NEU_NR = Math.floor(Math.random() * 1296);
const neueId = p => p + Date.now().toString(36).slice(-6) + (NEU_NR++ % 1296).toString(36);

/* ---------------------------------------------------------------- Übersicht */
function start() {
  const d = S.d, sicht = k => d[k].filter(x => !x.aus);
  const fs = sicht('fotos'), farbenS = sicht('farben');
  const welt0 = sicht('welten')[0], vorn = welt0 ? welt0.farben.map(i => nach(d.farben, i)).filter(f => f && !f.aus) : farbenS;
  const chips = (l, gross) => `<div class="dk-echips${gross ? ' dk-gross' : ''}">${l.map(f => `<span><i style="--c:${esc(f.wert)}"></i><em>${esc(f.wert.toUpperCase())}</em></span>`).join('')}</div>`;
  const z = S.L.zuletzt, wl = S.L.verlauf.filter(v => v.art === 'veroeffentlicht').length;
  const teil = (ziel, i, n, sub, bild) => `<button type="button" class="dk-et2 dk-p" data-gehe="${ziel}" data-r><span class="dk-etv">${bild}</span><span class="dk-bdt"><span class="dk-o2i">${dic(i)}</span><b>${esc(n)}</b><i>${esc(sub)}</i></span></button>`;
  const rolle = id => { const r = nach(d.rollen, id); const sch = r && nach(d.schriften, r.schrift); return { r, sch }; };
  const tz = id => (nach(d.texte, id) || {});
  const wege = (window.WO_HAUS && WO_HAUS.wege) || {};
  const wohin = [['sticker', 'Sticker editor', wege.sticker, 'st-sticker2-juices.webp', 'Stickers in the house colours'], ['druck', 'Print & feed', wege.druck, 'st-bierdeckel-vorn.webp', 'Signs, coasters, posts'], ['buch', 'Brand book', wege.buch, 'st-plakate-pool.webp', 'Photos, logo files, colour values']];
  const zeilenL = ['name', 'ort', 'zeiten'].map(tz).filter(x => x.id && !x.aus);
  return `${held({ tabs: true, kenn: `${NAME} · The Cat & Gun`, h1: 'Brand editor', satz: 'Colours, fonts, photos, lines and elements of the house. Sticker editor, Print &amp; feed and the Brand book take them from here.',
      mitte: chips(vorn.slice(0, 7)), stand: `${mz(farbenS.length, 'colour', 'colours')} · ${mz(fs.length, 'photo', 'photos')}`,
      knoepfe: wk(esc(t('vgl')), 'vergleich', '', 'data-wie="mb-vgl"') + wk(esc(t('raus')), 'senden', 'gold', 'data-wie="mb-raus"') })}
    ${stitel('palette', 'Five parts and earlier versions', 'What the editor holds')}
    <div class="dk-eteile">
      ${teil('farben', 'palette', t('farben'), `In ${mz(sicht('welten').length, 'palette', 'palettes')}: ${sicht('welten').map(w => w.name).join(', ')}`, chips(farbenS.filter(f => !welt0 || welt0.farben.includes(f.id)).slice(0, 5), true))}
      ${teil('schriften', 'schrift', t('schriften'), `${mz(sicht('rollen').length, 'use', 'uses')}, each with one font`, `<span class="dk-tschrift2"><b style="font-family:${familie(d, 'titel')}">Aa</b><span>${sicht('schriften').slice(0, 3).map(x => esc(x.name)).join(' · ')}</span></span>`)}
      ${teil('fotos', 'foto', t('fotos'), 'The photos of the website, each with its title', `<span class="dk-tfoto">${fs.slice(0, 4).map(f => `<i style="background-image:url('${esc(adr(f.klein))}')"></i>`).join('')}</span>`)}
      ${teil('texte', 'zeilen', t('texte'), 'Name, place, opening hours and the sentences of the house', `<span class="dk-tzeil"><b style="font-family:${familie(d, 'titel')}">${esc(tz('name').text || '')}</b><span>${esc(tz('ort').text || '')}</span><span>${esc(tz('zeiten').text || '')}</span></span>`)}
      ${teil('elemente', 'sticker', t('elemente'), 'Wordmark, ampersand, pool ball and stickers', `<span class="dk-telem"><img src="${LOOK}wortmarke-weiss.svg" alt="" width="84" height="56"><span data-svg="sticker-pool"></span><span data-svg="sticker-juices"></span></span>`)}
      ${teil('verlauf', 'verlauf', t('verlauf'), z ? `Last published ${zeit(z.zeit)}` : '«Original version» is the brand collection as built', `<span class="dk-tver"><span>${dic('lagen')}${wl ? mz(wl, 'published version', 'published versions') : 'Original version'}</span><span>${dic('zurueck')}Bring into draft</span></span>`)}
    </div>
    ${stitel('lagen', 'Where the brand goes', 'Publishing puts the changes into every tool')}
    <div class="dk-ezs2">${wohin.map(([i, n, href, b, x]) => `<a class="dk-ez2 dk-p" href="${esc(href || '#')}" data-r><span class="dk-ezb2"><img src="${LOOK}${b}" alt="" decoding="async"></span><span class="dk-ezt"><span class="dk-dsym">${dic(i)}</span><span><b>${esc(n)}</b><i>${esc(x)}</i></span></span></a>`).join('')}</div>
    ${stitel('schrift', 'Which font for what', mz(sicht('rollen').length, 'use', 'uses'))}
    <div class="dk-eschr">${sicht('rollen').map(r => { const sch = nach(d.schriften, r.schrift); return `<button type="button" class="dk-es dk-p" data-gehe="schriften" data-r><span class="dk-mono">${esc(r.name)}</span><b style="font-family:${familie(d, r.id)}">${esc(tz('name').text || 'The Cat & Gun')}</b><i>${esc(sch ? sch.name : '')}</i></button>`; }).join('')}</div>
    <section class="dk-wdt dk-p" data-r><div class="dk-kopf"><div><div class="dk-mono">${dic('zeilen', 'dk-mi')}${esc(t('texte'))}</div><h4>The lines the design tools use</h4></div>${wk(esc(t('oeffnen')), 'pfeil', '', 'data-gehe="texte"')}</div>
      <ul class="dk-dl">${zeilenL.map(x => `<li><span class="dk-dsym">${dic('zeilen')}</span><div><i>${esc(x.titel)}</i><b>${esc(x.text)}</b></div><span class="dk-mono dk-quelle">${esc(String(x.quelle || '').split(' · ')[0].replace(/^_quelle\/MATERIAL\.md$/, 'From the material of the house').replace(/^drucksachen\/.*$/, 'From the print pieces'))}</span></li>`).join('')}</ul>
      <p class="dk-hin">Under each line stands where it comes from. A line may not stay empty.</p></section>`;
}
function startLeben() { $$('#ansicht [data-gehe]').forEach(b => b.onclick = e => { e.preventDefault(); gehe(b.dataset.gehe); }); wieLeiste(); elementeMalen($('#ansicht')); }
/* Knöpfe im Kopf mit data-wie lösen den gleichnamigen Knopf der Leiste aus und tragen dessen Zustand (gesperrt, Hinweis) */
function wieLeiste() { $$('#ansicht [data-wie]').forEach(b => { const z = document.getElementById(b.dataset.wie); if (!z) return; b.disabled = z.disabled; b.title = z.title || ''; b.onclick = () => z.click(); }); }

/* ---------------------------------------------------------------- Farben */
function farbKarte(f, i) {
  const rgb = hex2rgb(f.wert) || [0, 0, 0], b = nach(S.base.farben, f.id), neu = !b, ge = b && !gleich(b, f);
  return `<button class="li-farbe${f.aus ? ' mb-aus' : ''}${neu || ge ? ' mb-offen' : ''}" type="button" data-farbe="${esc(f.id)}" style="--c:${esc(f.wert)}" data-r>
    <span class="li-farbe__f">${neu ? '<em class="mb-marke">New</em>' : ge ? '<em class="mb-marke">Changed</em>' : ''}${f.aus ? `<em class="mb-marke mb-marke--aus">${esc(t('aus_t'))}</em>` : ''}</span>
    <span class="li-farbe__n"><b>${esc(f.name)}</b><small>${esc(f.notiz || '')}</small></span>
    <span class="li-farbe__w"><span>${esc(f.wert.toUpperCase())}</span><span class="li-farbe__rgb">RGB <i>${rgb.join(' · ')}</i></span></span></button>`;
}
function farben() {
  const d = S.d, mehr = S.modus === 'mehr';
  const welten = d.welten.filter(w => !w.aus);
  const inWelt = new Set(welten.flatMap(w => w.farben));
  const gruppen = welten.map(w => {
    const fs = w.farben.map(id => nach(d.farben, id)).filter(f => f && !f.aus);
    return `<div class="li-fg mb-welt" data-welt="${esc(w.id)}" data-r><div class="mb-welt__k"><div><h3>${esc(w.name)}</h3><p class="leise">${esc(w.satz || '')}</p></div>
      <div class="mb-welt__kn">${mehr ? `<button class="kn kn--klein kn--linie" type="button" data-welt-bearb="${esc(w.id)}">Edit palette<i>${PF}</i></button>` : ''}<button class="kn kn--klein" type="button" data-neue-farbe="${esc(w.id)}">New colour<i>${PLUS}</i></button></div></div>
      <div class="li-farben">${fs.length ? fs.map(farbKarte).join('') : '<p class="mb-leer">No colour in this palette yet. Use «New colour».</p>'}</div></div>`;
  }).join('');
  const lose = d.farben.filter(f => !f.aus && !inWelt.has(f.id));
  const versteckt = d.farben.filter(f => f.aus), wAus = d.welten.filter(w => w.aus);
  const kv = mehr ? kontrastBlock() : '';
  return `${titel('farben', ['The colours', 'of the house'], 'Tap a colour to change it. Choose from the palette, type a value, pick it with the pipette or take it from a photo.',
      WO.knopf('New colour', 'plus', 'gold', { attr: 'data-neue-farbe=""' }) + (mehr ? WO.knopf('New palette', 'plus', 'glas', { attr: 'data-neue-welt' }) : ''),
      [[zahl(d.farben.filter(f => !f.aus).length), 'colours'], [zahl(welten.length), 'palettes'], [zahl(versteckt.length), 'hidden']])}
    <nav class="dk-reiter dk-p" style="--n:${welten.length}" aria-label="Palettes" data-r>${welten.map((w, i) => `<button type="button" class="dk-rt${i === 0 ? ' dk-an' : ''}" data-zu-welt="${esc(w.id)}"><span class="dk-rti">${dic({ druck: 'druck', saft: 'glas', website: 'web' }[w.id] || 'palette')}</span>${esc(w.name)}</button>`).join('')}</nav>
    <div class="platte mb-leiste-o" data-r>${modusWahl()}<p class="leise">${mehr ? 'More options: build palettes, tints and shades, contrast with its value.' : 'Simple: change, name and hide colours.'}</p></div>
    ${kv}
    ${gruppen}
    ${lose.length ? `<div class="li-fg mb-welt" data-r><div class="mb-welt__k"><div><h3>Without a palette</h3><p class="leise">Colours that belong to no palette yet.</p></div></div><div class="li-farben">${lose.map(farbKarte).join('')}</div></div>` : ''}
    ${versteckt.length || wAus.length ? `<div class="li-fg mb-welt mb-welt--aus" data-r><div class="mb-welt__k"><div><h3>${esc(t('aus_t'))}</h3><p class="leise">${esc(t('aus_s'))}</p></div></div>
      ${wAus.length ? `<div class="mb-zeilen">${wAus.map(w => `<p class="mb-zeile"><b>Palette «${esc(w.name)}»</b><button class="kn kn--klein kn--linie" type="button" data-welt-zeigen="${esc(w.id)}">${esc(t('zeigen'))}<i>${AUGE}</i></button></p>`).join('')}</div>` : ''}
      ${versteckt.length ? `<div class="li-farben">${versteckt.map(farbKarte).join('')}</div>` : ''}</div>` : ''}`;
}
function kontrastBlock() {
  const d = S.d, fs = d.farben.filter(f => !f.aus);
  const a = S.kv && nach(fs, S.kv.a) ? S.kv.a : (nach(fs, 'schwarz') || fs[0] || {}).id, b = S.kv && nach(fs, S.kv.b) ? S.kv.b : (nach(fs, 'papier') || fs[1] || {}).id;
  S.kv = { a, b };
  const fa = nach(fs, a), fb = nach(fs, b); if (!fa || !fb) return '';
  const k = kontrast(fa.wert, fb.wert);
  const wahl = (wer, wert) => `<div class="mb-kvwahl" data-kv-wahl="${wer}"></div>`;
  return `<section class="platte mb-kv" data-r><div class="mb-kv__t"><h3>Contrast check</h3><p class="leise">Can text in one colour be read on the other? The value follows the web rule WCAG: 4.5 for normal text, 3 for large titles.</p>
      <div class="mb-kv__w">${wahl('a', a)}${wahl('b', b)}</div></div>
    <div class="mb-kv__probe" style="background:${esc(fb.wert)};color:${esc(fa.wert)}"><b style="font-family:${familie(d, 'titel')}">See you at The Cat &amp; Gun!</b><span style="font-family:${familie(d, 'lauf')}">Good mornings start here. 7AM–10PM daily.</span></div>
    <div class="mb-kv__z"><b data-kv-wert>${k.toFixed(2).replace(/\.?0+$/, '')}&thinsp;:&thinsp;1</b><span>${esc(urteil(k))}</span></div></section>`;
}
function farbAuswahl(wert, beiWahl, name) {   // Auswahl im Hausstil (R21): Farbfeld + Name, nie die Liste des Betriebssystems
  const fs = S.d.farben.filter(f => !f.aus);
  return auswahl(fs.map(f => ({ wert: f.id, text: f.name, farbe: f.wert })), wert, beiWahl, name);
}
function farbenLeben() {
  $$('[data-farbe]').forEach(b => b.onclick = () => farbFenster(b.dataset.farbe));
  $$('[data-zu-welt]').forEach(b => b.onclick = () => { $$('[data-zu-welt]').forEach(x => x.classList.toggle('dk-an', x === b)); const g = $(`.mb-welt[data-welt="${b.dataset.zuWelt}"]`); if (g) g.scrollIntoView({ block: 'start', behavior: RUHIG() ? 'auto' : 'smooth' }); });
  $$('[data-neue-farbe]').forEach(b => b.onclick = () => farbFenster(null, b.dataset.neueFarbe || (S.d.welten.find(w => !w.aus) || {}).id));
  $$('[data-neue-welt]').forEach(b => b.onclick = () => weltFenster(null));
  $$('[data-welt-bearb]').forEach(b => b.onclick = () => weltFenster(b.dataset.weltBearb));
  $$('[data-welt-zeigen]').forEach(b => b.onclick = () => { nach(S.d.welten, b.dataset.weltZeigen).aus = false; geaendert(); zeichne(true); });
  const kv = $('.mb-kv');
  if (kv) {
    $$('[data-kv-wahl]', kv).forEach(o => o.replaceWith(farbAuswahl(S.kv[o.dataset.kvWahl], w => { S.kv[o.dataset.kvWahl] = w; const neu = document.createElement('div'); neu.innerHTML = kontrastBlock(); kv.replaceWith(neu.firstElementChild); neu.firstElementChild && auftritte(document, true); farbenLeben(); }, o.dataset.kvWahl === 'a' ? 'Text colour' : 'Ground colour')));
  }
}

/* Fenster «Farbe wählen»: Palette, HEX/RGB, Pipette (Bildschirm oder Bild), Farbprofil aus einem Bild; mehr: Abstufungen und Kontrast */
function farbFenster(id, weltNeu) {
  const d = S.d, f0 = id ? nach(d.farben, id) : null, mehr = S.modus === 'mehr';
  const z = { wert: f0 ? f0.wert : '#a8232a', name: f0 ? f0.name : '', bild: null };
  const papier = (nach(d.farben, 'papier') || { wert: '#f5f0e7' }).wert, schwarz = (nach(d.farben, 'schwarz') || { wert: '#141210' }).wert;
  const palette = d.welten.filter(w => !w.aus).map(w => `<div class="mb-pal"><span class="mono">${esc(w.name)}</span>${(fs => `<div style="--n:${fs.length};--m:${fs.length > 9 ? Math.ceil(fs.length / 2) : fs.length}">`)(w.farben.map(i => nach(d.farben, i)).filter(f => f && !f.aus))}${w.farben.map(i => nach(d.farben, i)).filter(f => f && !f.aus).map(f => `<button type="button" class="mb-pal__f" data-nimm="${esc(f.wert)}" style="--c:${esc(f.wert)}" title="${esc(f.name)} ${esc(f.wert)}" aria-label="${esc(f.name)}"></button>`).join('')}</div></div>`).join('');
  fenster(`<div class="mb-ff" data-mb-fenster="farbe">
    <div class="mb-ff__l">
      <div class="mb-ff__probe" id="mb-probe"><span id="mb-probe-w"></span></div>
      <label class="wo-feld"><span>Name</span><input type="text" id="mb-fname" maxlength="80" value="${esc(z.name)}" placeholder="For example: Pool table red" autocomplete="off"></label>
      <div class="mb-ff__werte">
        <label class="wo-feld mb-hex"><span>HEX</span><input type="text" id="mb-hex" maxlength="7" autocomplete="off" spellcheck="false" inputmode="text"></label>
        <label class="wo-feld"><span>R</span><input type="text" inputmode="numeric" maxlength="3" id="mb-r" autocomplete="off"></label>
        <label class="wo-feld"><span>G</span><input type="text" inputmode="numeric" maxlength="3" id="mb-g" autocomplete="off"></label>
        <label class="wo-feld"><span>B</span><input type="text" inputmode="numeric" maxlength="3" id="mb-b" autocomplete="off"></label>
      </div>
      <p class="mb-fehler" id="mb-ffehler" role="alert" hidden></p>
      <div class="mb-ff__kv" id="mb-ffkv"></div>
    </div>
    <div class="mb-ff__r">
      <h2>${f0 ? 'Change <em>' + esc(f0.name) + '</em>' : 'New <em>colour</em>'}</h2>
      <p class="mono">From the palette of the house</p>
      <div class="mb-pals">${palette}</div>
      <div class="mb-ff__wege">
        <button class="kn kn--klein kn--linie" type="button" id="mb-pipette">Pipette<i>${PIPETTE}</i></button>
        <label class="kn kn--klein kn--linie mb-datei">Colours from a photo<i>${PO}</i><input type="file" id="mb-bild" accept="image/jpeg,image/png,image/webp,image/gif"></label>
      </div>
      ${PICKER ? '' : '<p class="leise mb-hinweis-pip" id="mb-pip-hinweis">In Safari and Firefox the pipette picks colours from the photos of the house and from your own photo. Choose the pipette, then tap a spot.</p>'}
      <div class="mb-pipflaeche" id="mb-pipflaeche" hidden></div>
      <div class="mb-profil" id="mb-profil" hidden></div>
      ${mehr ? `<p class="mono mb-abst">Tints and shades</p><div class="mb-stufen" id="mb-stufen"></div>` : ''}
    </div>
    <div class="mb-ff__fuss">
      ${f0 ? `<button class="link" type="button" id="mb-ausbl">${f0.aus ? esc(t('zeigen')) : esc(t('verbergen'))}</button>${!nach(S.base.farben, f0.id) ? `<button class="link" type="button" id="mb-weg">${esc(t('entfernen'))}</button>` : ''}` : ''}
      <span class="mb-ff__frei"></span>
      <button class="kn kn--klein kn--linie" type="button" data-zu>${esc(t('abbrechen'))}<i>${ZU}</i></button>
      <button class="kn kn--klein kn--gold" type="button" id="mb-nimm">${esc(t('uebernehmen'))}<i>${PF}</i></button>
    </div></div>`, 'mb-fk--farbe');
  const fehler = $('#mb-ffehler');
  function zeige(quelle) {
    const rgb = hex2rgb(z.wert);
    $('#mb-probe').style.background = z.wert;
    $('#mb-probe-w').textContent = z.wert.toUpperCase();
    $('#mb-probe-w').style.color = dunkelGenug(z.wert) ? '#fff' : '#141210';
    if (quelle !== 'hex') $('#mb-hex').value = z.wert.toUpperCase();
    if (quelle !== 'rgb') ['r', 'g', 'b'].forEach((k, i) => { $('#mb-' + k).value = rgb[i]; });
    $$('.mb-pal__f').forEach(b => b.setAttribute('aria-pressed', b.dataset.nimm === z.wert));
    const k1 = kontrast(z.wert, papier), k2 = kontrast(z.wert, schwarz);
    $('#mb-ffkv').innerHTML = `<span><i style="background:${papier}"></i>on Paper <b>${k1.toFixed(1)}&thinsp;:&thinsp;1</b></span><span><i style="background:${schwarz}"></i>on Black <b>${k2.toFixed(1)}&thinsp;:&thinsp;1</b></span>`;
    if ($('#mb-stufen')) $('#mb-stufen').innerHTML = stufen(z.wert).map((h, i) => `<button type="button" class="mb-stufe${i === 4 ? ' an' : ''}" data-nimm="${h}" style="--c:${h}" title="${h}"><span>${h.toUpperCase()}</span></button>`).join('') + `<button class="link mb-stufen__alle" type="button" id="mb-stufen-welt">Add all nine as a palette</button>`;
    fehler.hidden = true;
    bindeNimm();
  }
  function bindeNimm() {
    $$('[data-nimm]', $('#fenster')).forEach(b => b.onclick = () => { z.wert = b.dataset.nimm.toLowerCase(); zeige(); });
    const sw = $('#mb-stufen-welt'); if (sw) sw.onclick = () => neueWelt('Tints of ' + (z.name || z.wert.toUpperCase()), stufen(z.wert).map((h, i) => ({ name: (z.name || 'Colour') + ' ' + (i < 4 ? 'light ' + (4 - i) : i === 4 ? '' : 'dark ' + (i - 4)), wert: h })));
  }
  $('#mb-hex').oninput = e => {
    let v = e.target.value.trim(); if (v && v[0] !== '#') v = '#' + v;
    if (/^#[0-9a-f]{3}$/i.test(v)) v = '#' + v.slice(1).split('').map(c => c + c).join('');
    if (/^#[0-9a-f]{6}$/i.test(v)) { z.wert = v.toLowerCase(); zeige('hex'); } else { fehler.textContent = 'Use six signs after the #, like #A8232A.'; fehler.hidden = !e.target.value.trim(); }
  };
  ['r', 'g', 'b'].forEach(k => { $('#mb-' + k).oninput = () => {
    const v = ['r', 'g', 'b'].map(x => $('#mb-' + x).value.trim());
    if (v.every(x => /^\d{1,3}$/.test(x) && +x <= 255)) { z.wert = rgb2hex(...v.map(Number)); zeige('rgb'); } else { fehler.textContent = 'R, G and B each take a number from 0 to 255.'; fehler.hidden = false; }
  }; });
  /* Pipette: in Chrome/Edge der ganze Bildschirm, sonst die Fotos des Hauses und das eigene Bild */
  $('#mb-pipette').onclick = async () => {
    if (PICKER) {
      try { const r = await new window.EyeDropper().open(); z.wert = r.sRGBHex.length === 7 ? r.sRGBHex.toLowerCase() : rgbText(r.sRGBHex); zeige(); } catch (e) { /* abgebrochen */ }
      return;
    }
    const fl = $('#mb-pipflaeche'); fl.hidden = !fl.hidden;
    if (!fl.hidden) pipFlaeche(fl, z.bild, w => { z.wert = w; zeige(); });
  };
  $('#mb-bild').onchange = e => {
    const datei = e.target.files && e.target.files[0]; e.target.value = '';
    if (!datei) return;
    if (!/^image\//.test(datei.type) || /svg/.test(datei.type)) { fehler.textContent = 'This file is not a photo. JPG, PNG, WebP and GIF work.'; fehler.hidden = false; return; }
    if (datei.size > 30 * 1048576) { fehler.textContent = `The photo has ${Math.round(datei.size / 1048576)} MB. For colours, 30 MB is the most.`; fehler.hidden = false; return; }
    const url = URL.createObjectURL(datei), img = new Image();
    img.onload = () => {
      z.bild = img;
      const l = bestimmende(img);
      const pr = $('#mb-profil'); pr.hidden = false;
      pr.innerHTML = `<p class="mono">Colour profile of «${esc(kurz(datei.name, 40))}»</p><div class="mb-profil__b"><img src="${url}" alt=""><div class="mb-profil__f">${l.map(x => `<button type="button" data-nimm="${x.hex}" style="--c:${x.hex}" title="${x.hex}"><span>${x.hex.toUpperCase()}</span><small>${Math.round(x.anteil * 100)} %</small></button>`).join('')}</div></div>
        <button class="kn kn--klein" type="button" id="mb-profil-welt">Offer as a new palette<i>${PLUS}</i></button>`;
      $('#mb-profil-welt').onclick = () => neueWelt('From ' + kurz(datei.name.replace(/\.[a-z0-9]+$/i, ''), 40), l.map((x, i) => ({ name: 'Photo colour ' + (i + 1), wert: x.hex })));
      bindeNimm();
      const fl = $('#mb-pipflaeche'); if (!fl.hidden) pipFlaeche(fl, z.bild, w => { z.wert = w; zeige(); });
    };
    img.onerror = () => { fehler.textContent = 'This file is not a photo the browser can read.'; fehler.hidden = false; URL.revokeObjectURL(url); };
    img.src = url;
  };
  $('#mb-nimm').onclick = () => {
    const name = $('#mb-fname').value.replace(/\s+/g, ' ').trim();
    if (!name) { fehler.textContent = 'Every colour needs a name.'; fehler.hidden = false; $('#mb-fname').focus(); return; }
    if (!/^#[0-9a-f]{6}$/.test(z.wert)) { fehler.textContent = 'The value is not a colour.'; fehler.hidden = false; return; }
    if (f0) { f0.name = name; f0.wert = z.wert; }
    else {
      const nf = { id: neueId('f'), name, wert: z.wert, welt: weltNeu || 'eigene', quelle: 'Brand book editor', notiz: '', aus: false };
      d.farben.push(nf);
      const w = nach(d.welten, weltNeu); if (w) w.farben.push(nf.id);
    }
    fensterZu(); geaendert(); zeichne(true);
  };
  if ($('#mb-ausbl')) $('#mb-ausbl').onclick = () => { f0.aus = !f0.aus; fensterZu(); geaendert(); zeichne(true); };
  if ($('#mb-weg')) $('#mb-weg').onclick = () => { d.farben.splice(d.farben.indexOf(f0), 1); d.welten.forEach(w => { w.farben = w.farben.filter(x => x !== f0.id); }); fensterZu(); geaendert(); zeichne(true); };
  zeige();
  setTimeout(() => { const n = $('#mb-fname'); if (n && !f0) n.focus({ preventScroll: true }); }, 60);
}
const rgbText = s => { const m = String(s).match(/\d+/g); return m ? rgb2hex(+m[0], +m[1], +m[2]) : '#000000'; };
/* Pipette im Bild (Safari, Firefox): die Fotos des Hauses aus dem Entwurf und das eigene Bild, ein Tipp nimmt die Farbe an dieser Stelle */
function pipFlaeche(fl, eigenes, nimm) {
  const fotos = S.d.fotos.filter(f => !f.aus).slice(0, 8);
  fl.innerHTML = `<p class="mono">Tap a spot to take its colour</p><div class="mb-pip__l">${eigenes ? '<canvas data-eigen></canvas>' : ''}${fotos.map(f => `<canvas data-src="${esc(adr(f.klein))}" title="${esc(f.titel)}"></canvas>`).join('')}</div>`;
  const male = (c, img) => { const m = 220 / img.naturalHeight; c.width = Math.round(img.naturalWidth * m); c.height = 220; c.getContext('2d', { willReadFrequently: true }).drawImage(img, 0, 0, c.width, c.height); };
  $$('canvas', fl).forEach(c => {
    if (c.hasAttribute('data-eigen')) male(c, eigenes);
    else { const i = new Image(); i.onload = () => male(c, i); i.src = c.dataset.src; }
    c.onclick = e => {
      const r = c.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) * c.width / r.width), y = Math.floor((e.clientY - r.top) * c.height / r.height);
      const p = c.getContext('2d', { willReadFrequently: true }).getImageData(x, y, 1, 1).data; nimm(rgb2hex(p[0], p[1], p[2]));
    };
  });
}
/* Neue Farbwelt aus Farben (Farbprofil eines Bildes, Abstufungen): Farben anlegen, Welt anlegen, Ansicht neu */
function neueWelt(name, farben) {
  const w = { id: neueId('w'), name: kurz(name, 80), satz: '', farben: [], quelle: 'Brand book editor', aus: false };
  farben.forEach(x => { const f = { id: neueId('f'), name: kurz(x.name, 80), wert: x.wert, welt: w.id, quelle: 'Brand book editor', notiz: '', aus: false }; S.d.farben.push(f); w.farben.push(f.id); });
  S.d.welten.push(w);
  fensterZu(); geaendert(); gehe('farben');
  melde(`New palette «${w.name}» with ${mz(w.farben.length, 'colour', 'colours')}. Save to keep it.`);
}
/* Farbwelt bauen (erweitert): Name, Satz, welche Farben in welcher Reihenfolge, ausblenden */
function weltFenster(id) {
  const d = S.d, w0 = id ? nach(d.welten, id) : null;
  const gewaehlt = new Set(w0 ? w0.farben : []);
  const fs = d.farben.filter(f => !f.aus);
  fenster(`<div class="mb-wf" data-mb-fenster="welt"><h2>${w0 ? 'Palette <em>' + esc(w0.name) + '</em>' : 'New <em>palette</em>'}</h2>
    <div class="mb-wf__felder"><label class="wo-feld"><span>Name</span><input type="text" id="mb-wname" maxlength="80" value="${esc(w0 ? w0.name : '')}" placeholder="For example: Breakfast" autocomplete="off"></label>
    <label class="wo-feld"><span>One line about it</span><input type="text" id="mb-wsatz" maxlength="400" value="${esc(w0 ? w0.satz : '')}" autocomplete="off"></label></div>
    <p class="mono">Colours in this palette</p>
    <div class="mb-wf__l">${fs.map(f => `<label class="mb-wahlf"><input type="checkbox" value="${esc(f.id)}" ${gewaehlt.has(f.id) ? 'checked' : ''}><i style="background:${esc(f.wert)}"></i><span>${esc(f.name)}<small>${esc(f.wert.toUpperCase())}</small></span></label>`).join('')}</div>
    <p class="mb-fehler" id="mb-wfehler" role="alert" hidden></p>
    <div class="mb-ff__fuss">${w0 ? `<button class="link" type="button" id="mb-waus">Hide palette</button>` : ''}${w0 && nieRaus('welten', w0.id) ? `<button class="link" type="button" id="mb-wweg">Remove palette</button>` : ''}<span class="mb-ff__frei"></span>
      <button class="kn kn--klein kn--linie" type="button" data-zu>${esc(t('abbrechen'))}<i>${ZU}</i></button><button class="kn kn--klein kn--gold" type="button" id="mb-wok">${esc(t('fertig'))}<i>${PF}</i></button></div></div>`, 'mb-fk--welt');
  $('#mb-wok').onclick = () => {
    const name = $('#mb-wname').value.replace(/\s+/g, ' ').trim();
    if (!name) { $('#mb-wfehler').textContent = 'Every palette needs a name.'; $('#mb-wfehler').hidden = false; return; }
    const neu = $$('.mb-wf__l input:checked').map(i => i.value);
    const alt = w0 ? w0.farben.filter(x => neu.includes(x)) : [];
    const liste = alt.concat(neu.filter(x => !alt.includes(x)));
    if (w0) { w0.name = name; w0.satz = $('#mb-wsatz').value.trim(); w0.farben = liste.concat(w0.farben.filter(x => !fs.some(f => f.id === x) && d.farben.some(f => f.id === x))); }
    else d.welten.push({ id: neueId('w'), name, satz: $('#mb-wsatz').value.trim(), farben: liste, quelle: 'Brand book editor', aus: false });
    fensterZu(); geaendert(); zeichne(true);
  };
  if ($('#mb-waus')) $('#mb-waus').onclick = () => { w0.aus = true; fensterZu(); geaendert(); zeichne(true); };
  /* die Farben der Farbwelt bleiben; sie stehen danach unter «Without a palette» und lassen sich dort einzeln entfernen */
  if ($('#mb-wweg')) $('#mb-wweg').onclick = () => { d.welten.splice(d.welten.indexOf(w0), 1); fensterZu(); geaendert(); zeichne(true); };
}

/* ---------------------------------------------------------------- Schriften */
function schriften() {
  const d = S.d, mehr = S.modus === 'mehr';
  const sicht = d.schriften.filter(s => !s.aus), aus = d.schriften.filter(s => s.aus);
  const rollen = d.rollen.map(r => `<div class="mb-rolle" data-rolle="${esc(r.id)}"><span class="mono">${esc(r.name)}</span><div class="mb-rolle__w" data-rolle-wahl="${esc(r.id)}"></div>
      <p class="mb-rolle__p" style="font-family:${familie(d, r.id)}">${esc(r.id === 'zahl' ? '7AM–10PM · CATANGNAN, SIARGAO' : r.id === 'lauf' ? 'Good food for grown-ups, fun times for the little ones.' : r.id === 'druck' ? 'See you at The Cat & Gun!' : 'Your neighbourhood hangout')}</p></div>`).join('');
  const karte = s => {
    const b = nach(S.base.schriften, s.id), ge = !b || !gleich(b, s), in_ = d.rollen.filter(r => r.schrift === s.id).map(r => r.name);
    return `<li class="li-schrift mb-schrift${s.aus ? ' mb-aus' : ''}${ge ? ' mb-offen' : ''}" data-r>
      <span class="li-schrift__p" style="font-family:'${esc(String(s.familie || s.name).replace(/['"\\<>]/g, ''))}';font-weight:${s.erlaubt[0] || 400}">${esc(s.probe || 'The Cat & Gun')}</span>
      <span class="li-schrift__t"><label class="wo-feld mb-name"><span>Name</span><input type="text" maxlength="60" value="${esc(s.name)}" data-sname="${esc(s.id)}" autocomplete="off"></label>
        <small>${esc(s.wo || '')}${in_.length ? ' · Used for: ' + esc(in_.join(', ')) : ''}</small>
        ${mehr ? `<span class="mb-schnitte"><span class="mono">Weights</span>${s.schnitte.map(g => `<label class="mb-schnitt"><input type="checkbox" data-schnitt="${esc(s.id)}" value="${g}" ${s.erlaubt.includes(g) ? 'checked' : ''}><span style="font-family:'${esc(String(s.familie || s.name).replace(/['"\\<>]/g, ''))}';font-weight:${g}">Aa ${g}</span></label>`).join('')}</span>` : ''}</span>
      <span class="mb-schrift__kn">${s.aus ? `<button class="kn kn--klein kn--linie" type="button" data-szeigen="${esc(s.id)}">${esc(t('zeigen'))}<i>${AUGE}</i></button>` : in_.length ? '' : `<button class="kn kn--klein kn--linie" type="button" data-saus="${esc(s.id)}">${esc(t('verbergen'))}<i>${AUS}</i></button>`}${nieRaus('schriften', s.id) && !in_.length ? `<button class="link" type="button" data-sweg="${esc(s.id)}">${esc(t('entfernen'))}</button>` : ''}</span></li>`;
  };
  return `${titel('schriften', ['Fonts', 'of the house'], 'Choose which font sets the titles, the text and the numbers. Every tool that designs takes the same.',
      `<label class="wo-kn wo-kn--gold mb-datei"><span>Add a font</span><i>${WO.ic('plus')}</i><input type="file" id="mb-schrift-datei" accept=".woff2,.woff,.ttf,.otf,font/woff2,font/ttf,font/otf"></label>`,
      [[zahl(sicht.length), 'fonts'], [zahl(d.rollen.length), 'uses'], [zahl(aus.length), 'hidden']])}
    <div class="platte mb-leiste-o" data-r>${modusWahl()}<p class="leise">${mehr ? 'More options: choose which weights of a font may be used.' : 'Simple: swap the font for each use.'}</p></div>
    <section class="platte mb-rollen" data-r><h3>Which font for what</h3>${rollen}</section>
    <p class="mb-fehler" id="mb-sfehler" role="alert" hidden></p>
    <h2 class="wo-zw">All <em>fonts</em></h2>
    <ul class="li-schriften">${sicht.map(karte).join('')}</ul>
    ${aus.length ? `<h2 class="wo-zw">${esc(t('aus_t'))}</h2><p class="leise">${esc(t('aus_s'))}</p><ul class="li-schriften">${aus.map(karte).join('')}</ul>` : ''}`;
}
function schriftenLeben() {
  const d = S.d;
  $$('[data-rolle-wahl]').forEach(o => {
    const r = nach(d.rollen, o.dataset.rolleWahl);
    o.replaceWith(auswahl(d.schriften.filter(s => !s.aus).map(s => ({ wert: s.id, text: s.name, schrift: s.familie || s.name })), r.schrift, w => { r.schrift = w; geaendert(); zeichne(true); }, r.name));
  });
  $$('[data-sname]').forEach(i => i.oninput = () => { nach(d.schriften, i.dataset.sname).name = i.value.replace(/\s+/g, ' ').trimStart(); geaendert(); });
  $$('[data-saus]').forEach(b => b.onclick = () => { nach(d.schriften, b.dataset.saus).aus = true; geaendert(); zeichne(true); });
  $$('[data-szeigen]').forEach(b => b.onclick = () => { nach(d.schriften, b.dataset.szeigen).aus = false; geaendert(); zeichne(true); });
  $$('[data-sweg]').forEach(b => b.onclick = () => { d.schriften.splice(d.schriften.indexOf(nach(d.schriften, b.dataset.sweg)), 1); geaendert(); zeichne(true); });
  $$('[data-schnitt]').forEach(c => c.onchange = () => {
    const s = nach(d.schriften, c.dataset.schnitt), g = +c.value;
    const neu = c.checked ? [...new Set([...s.erlaubt, g])].sort((a, b) => a - b) : s.erlaubt.filter(x => x !== g);
    if (!neu.length) { c.checked = true; melde('A font keeps at least one weight.'); return; }
    s.erlaubt = neu; geaendert();
  });
  $('#mb-schrift-datei').onchange = async e => {
    const datei = e.target.files && e.target.files[0]; e.target.value = '';
    if (!datei) return;
    const fe = $('#mb-sfehler');
    if (!/\.(woff2?|ttf|otf)$/i.test(datei.name)) { fe.textContent = 'This file is not a font. WOFF2, WOFF, TTF and OTF work.'; fe.hidden = false; return; }
    if (datei.size > 6 * 1048576) { fe.textContent = 'The font file is larger than 6 MB.'; fe.hidden = false; return; }
    try {
      const j = await ruf('POST', 'hochladen', { art: 'schrift', name: datei.name, daten: await alsBase64(datei) });
      const id = j.id + Date.now().toString(36).slice(-3);
      d.schriften.push({ id, name: kurz(datei.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' '), 60), datei: j.datei, familie: 'Own ' + id, schnitte: [400], erlaubt: [400], rolle: '', probe: 'The Cat & Gun', wo: 'Uploaded', quelle: '', aus: false });
      schriftenLaden(); geaendert(); zeichne(true);
      melde('Font added. Save to keep it.');
    } catch (x) { fe.textContent = textVon(x); fe.hidden = false; }
  };
}
const alsBase64 = datei => new Promise((ok, nein) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1] || ''); r.onerror = () => nein({ fehler: 'FILE · The file could not be read.' }); r.readAsDataURL(datei); });
const textVon = x => String((x && x.fehler) || (x && x.message) || x).replace(/^[A-ZÄÖÜ ]+ · /, '');

/* ---------------------------------------------------------------- Fotos (Bildarchiv der Vorlage: Raster, Suche, Fenster) */
function gefiltert() {
  const q = S.f.q.trim().toLowerCase();
  return S.d.fotos.filter(f => (S.f.s === 'alle' ? !f.aus : S.f.s === 'aus' ? f.aus : f.herkunft === 'hochgeladen' && !f.aus) && (!q || (f.titel + ' ' + f.id).toLowerCase().includes(q)));
}
function fotos() {
  const d = S.d, sicht = d.fotos.filter(f => !f.aus).length;
  const w = (wert, text) => `<button type="button" data-fs="${wert}" aria-pressed="${S.f.s === wert}">${esc(text)}</button>`;
  return `${titel('fotos', ['Photos', 'of the house'], 'Tap a photo to give it a title, swap it or hide it. A new photo needs at least 900 pixels on the long side.',
      `<label class="wo-kn wo-kn--gold mb-datei"><span>Add a photo</span><i>${WO.ic('plus')}</i><input type="file" id="mb-foto-datei" accept="image/jpeg,image/png,image/webp"></label>`,
      [[zahl(sicht), 'shown'], [zahl(d.fotos.filter(f => f.herkunft === 'hochgeladen').length), 'added'], [zahl(d.fotos.filter(f => f.aus).length), 'hidden']])}
    <div class="platte li-filter" data-r>
      <label class="suche li-suche">${LUPE}<input type="search" id="li-q" value="${esc(S.f.q)}" placeholder="Search: pool, juice, garden" autocomplete="off" maxlength="200"></label>
      <div class="li-wahl"><span class="mono">Show</span><div class="wahl2" role="group">${w('alle', 'In use')}${w('neu', 'Added')}${w('aus', 'Hidden')}</div></div>
      <p class="li-treffer"><span id="li-n"></span></p>
      <p class="mb-fehler" id="mb-ffoto" role="alert" hidden></p>
    </div>
    <div class="li-raster" id="li-raster"></div>
    <div class="li-mehr" id="li-mehr"></div>`;
}
function kachel(f, i) {
  const b = nach(S.base.fotos, f.id), ge = !b || !gleich(b, f);
  return `<button class="li-f li-f--${f.h > f.w * 1.1 ? 'hoch' : 'quer'}${ge ? ' mb-offen' : ''}" type="button" data-k="${esc(f.id)}" data-r style="--i:${i % 6}" aria-label="${esc(f.titel || 'Photo without title')}">
    <img src="${esc(adr(f.klein))}" alt="" loading="lazy" decoding="async" draggable="false">
    ${f.aus ? `<span class="li-ki">${esc(t('aus_t'))}</span>` : !b ? '<span class="li-ki">New</span>' : ge ? '<span class="li-ki">Changed</span>' : ''}
    <span class="li-f__n">${esc(f.titel || 'Without title')}</span></button>`;
}
function raster(neu = false) {
  const L = gefiltert(); if (neu) S.n = 48;
  $('#li-n').textContent = `${zahl(L.length)} of ${zahl(S.d.fotos.length)} photos`;
  const r = $('#li-raster');
  /* Ausgeblendete Fotos stehen als schmale Zeile mit kleinem Vorschaubild und «Show again», egal wie viele (Robert 28.11.2026: «Schmale Zeile») */
  r.innerHTML = L.length && S.f.s === 'aus' ? `<div class="mb-zeilen">${L.slice(0, S.n).map(f => ausZeile('foto', f.id, `<img src="${esc(adr(f.klein))}" alt="" decoding="async" draggable="false">`, f.titel || 'Without title', `${zahl(f.w)} by ${zahl(f.h)} px`)).join('')}</div>`
    : L.length ? L.slice(0, S.n).map(kachel).join('') : `<p class="li-leer">${S.f.s === 'aus' ? 'No photo is hidden.' : S.f.s === 'neu' ? 'No photo added yet. «Add a photo» puts your own photo next to the ones of the house.' : 'No photo fits. Try another word.'}</p>`;
  $('#li-mehr').innerHTML = L.length > S.n ? `<button class="kn kn--linie" type="button" id="li-mehr-k">Show more<i>${PU}</i></button>` : '';
  if ($('#li-mehr-k')) $('#li-mehr-k').onclick = () => { S.n += 48; raster(); };
  $$('[data-k]', r).forEach(b => b.onclick = () => fotoFenster(b.dataset.k));
  $$('[data-zeigen-foto]', r).forEach(b => b.onclick = () => { nach(S.d.fotos, b.dataset.zeigenFoto).aus = false; geaendert(); zeichne(true); });
  reihen(r.parentElement);
  auftritte(r);
}
async function fotoHoch(datei, fe) {
  if (!/^image\/(jpeg|png|webp)$/.test(datei.type)) { fe.textContent = 'This file is not a photo. JPG, PNG and WebP work.'; fe.hidden = false; return null; }
  if (datei.size > 25 * 1048576) { fe.textContent = `The photo has ${Math.round(datei.size / 1048576)} MB. 25 MB is the most.`; fe.hidden = false; return null; }
  fe.hidden = true;
  const q = melde('Photo is uploading …');   /* geht weg, sobald der Server antwortet: nie «uploading» neben einer Abweisung (Prüfung 23.11.2026, 2) */
  try { return await ruf('POST', 'hochladen', { art: 'foto', name: datei.name, daten: await alsBase64(datei) }); }
  catch (x) { fe.textContent = textVon(x); fe.hidden = false; return null; }
  finally { q.remove(); }
}
function fotosLeben() {
  raster(true);
  let uhr;
  $('#li-q').oninput = e => { clearTimeout(uhr); uhr = setTimeout(() => { S.f.q = e.target.value; raster(true); }, 160); };
  $$('[data-fs]').forEach(b => b.onclick = () => { S.f.s = b.dataset.fs; $$('[data-fs]').forEach(x => x.setAttribute('aria-pressed', x === b)); raster(true); });
  $('#mb-foto-datei').onchange = async e => {
    const datei = e.target.files && e.target.files[0]; e.target.value = '';
    if (!datei) return;
    const j = await fotoHoch(datei, $('#mb-ffoto')); if (!j) return;
    S.d.fotos.unshift({ id: j.id + Date.now().toString(36).slice(-3), titel: kurz(datei.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' '), 200), klein: j.klein, gross: j.gross, w: j.w, h: j.h, quelle: '', herkunft: 'hochgeladen', aus: false });
    geaendert(); S.f.s = 'alle'; zeichne(true); melde('Photo added. Save to keep it.');
  };
}
function fotoFenster(id) {
  const d = S.d, f = nach(d.fotos, id); if (!f) return;
  fenster(`<div class="li-det" data-mb-fenster="foto">
    <div class="li-det__b"><div class="li-det__bild"><img src="${esc(adr(f.gross))}" alt="${esc(f.titel)}" decoding="async" draggable="false"></div></div>
    <div class="li-det__t">
      <p class="mono">${f.herkunft === 'hochgeladen' ? 'Added in the Brand book editor' : 'Photo of the house'}</p>
      <label class="wo-feld"><span>Title</span><input type="text" id="mb-ftitel" maxlength="200" value="${esc(f.titel)}" placeholder="What the photo shows" autocomplete="off"></label>
      <dl class="li-meta">${f.quelle ? `<dt>Source</dt><dd>${esc(quelleText(f.quelle))}</dd>` : ''}<dt>Size</dt><dd>${zahl(f.w)} by ${zahl(f.h)} px</dd></dl>
      <p class="mb-fehler" id="mb-fdfehler" role="alert" hidden></p>
      <div class="mb-det__kn">
        <label class="kn kn--klein mb-datei">Swap for another photo<i>${PO}</i><input type="file" id="mb-tausch" accept="image/jpeg,image/png,image/webp"></label>
        <button class="kn kn--klein kn--linie" type="button" id="mb-faus">${f.aus ? esc(t('zeigen')) : esc(t('verbergen'))}<i>${f.aus ? AUGE : AUS}</i></button>
        <a class="kn kn--klein kn--linie" href="${esc(adr(f.gross))}" target="_blank" rel="noopener">Full size<i>${PF}</i></a>
      </div>
      <p class="leise">Swapping puts the new photo in this place and hides this one. It stays under «Hidden».</p>
      <div class="mb-ff__fuss"><span class="mb-ff__frei"></span><button class="kn kn--klein kn--linie" type="button" data-zu>${esc(t('abbrechen'))}<i>${ZU}</i></button><button class="kn kn--klein kn--gold" type="button" id="mb-fok">${esc(t('fertig'))}<i>${PF}</i></button></div>
    </div></div>`, 'li-fk');
  /* «Cancel wie bei Farben» (Robert 28.11.2026): der Titel gilt erst mit «Done»; «Cancel», Escape, Rundknopf und Klick daneben verwerfen ihn.
     «Hide» und «Swap» wirken sofort, wie «Hide» im Farbfenster. */
  $('#mb-faus').onclick = () => { f.aus = !f.aus; fensterZu(); geaendert(); zeichne(true); };
  $('#mb-fok').onclick = () => { f.titel = $('#mb-ftitel').value.replace(/\s+/g, ' ').trim(); fensterZu(); geaendert(); zeichne(true); };
  $('#mb-tausch').onchange = async e => {
    const datei = e.target.files && e.target.files[0]; e.target.value = '';
    if (!datei) return;
    const j = await fotoHoch(datei, $('#mb-fdfehler')); if (!j) return;
    const neu = { id: j.id + Date.now().toString(36).slice(-3), titel: f.titel, klein: j.klein, gross: j.gross, w: j.w, h: j.h, quelle: '', herkunft: 'hochgeladen', aus: false };
    d.fotos.splice(d.fotos.indexOf(f), 0, neu); f.aus = true;
    fensterZu(); geaendert(); zeichne(true); melde('Photo swapped. Save to keep it.');
  };
}

/* ---------------------------------------------------------------- Sätze des Hauses */
function texte() {
  const d = S.d, sicht = d.texte.filter(x => !x.aus), aus = d.texte.filter(x => x.aus);
  const karte = x => {
    const b = nach(S.base.texte, x.id), ge = !b || !gleich(b, x);
    return `<article class="platte mb-text${x.aus ? ' mb-aus' : ''}${ge ? ' mb-offen' : ''}" data-text="${esc(x.id)}" data-r>
      <div class="mb-text__k"><label class="wo-feld"><span>Title</span><input type="text" maxlength="80" value="${esc(x.titel)}" data-ttitel autocomplete="off"></label>
        <button class="kn kn--klein kn--linie" type="button" data-taus>${x.aus ? esc(t('zeigen')) : esc(t('verbergen'))}<i>${x.aus ? AUGE : AUS}</i></button>${nieRaus('texte', x.id) ? `<button class="link" type="button" data-tweg>${esc(t('entfernen'))}</button>` : ''}</div>
      <label class="wo-feld"><span>Line</span><textarea rows="${Math.min(8, Math.max(2, Math.ceil(x.text.length / 70)))}" maxlength="5000" data-ttext>${esc(x.text)}</textarea></label>
      <p class="mb-text__f"><small>${esc(x.quelle ? 'Source: ' + quelleText(x.quelle) : '')}</small><small data-tzahl>${zahl(x.text.length)} / 5,000</small></p>
      <p class="mb-fehler" data-tfehler role="alert" hidden></p></article>`;
  };
  return `${titel('texte', ['Lines', 'of the house'], 'Name, place, opening hours and the sentences the house writes on Instagram. The design tools take them from here, word for word.',
      WO.knopf('New line', 'plus', 'gold', { attr: 'data-neuer-text' }), [[zahl(sicht.length), 'lines'], [zahl(aus.length), 'hidden']])}
    <div class="mb-texte">${sicht.map(karte).join('')}</div>
    ${aus.length ? `<h2 class="wo-zw">${esc(t('aus_t'))}</h2><p class="leise">${esc(t('aus_s'))}</p><div class="mb-texte">${aus.map(karte).join('')}</div>` : ''}`;
}
/* Höhe eines Textfelds nach seinem Inhalt: die Schätzung über die Zeichenzahl (rows) schnitt am Handy die letzte Zeile ab
   (Abnahme 28.11.2026, drei von 18 Zeilen bei 390 px). Ab 460 px scrollt das Feld. */
const feldHoch = ta => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight + 2, 460) + 'px'; };
addEventListener('resize', () => { if (S.ansicht === 'texte') $$('[data-ttext]').forEach(feldHoch); });
function texteLeben() {
  $$('[data-text]').forEach(k => {
    const x = nach(S.d.texte, k.dataset.text);
    feldHoch($('[data-ttext]', k));
    $('[data-ttitel]', k).oninput = e => { x.titel = e.target.value.replace(/\s+/g, ' ').trimStart(); pruefeText(k, x); geaendert(); };
    $('[data-ttext]', k).oninput = e => { x.text = e.target.value; feldHoch(e.target); $('[data-tzahl]', k).textContent = `${zahl(x.text.length)} / 5,000`; pruefeText(k, x); geaendert(); };
    $('[data-taus]', k).onclick = () => { x.aus = !x.aus; geaendert(); zeichne(true); };
    if ($('[data-tweg]', k)) $('[data-tweg]', k).onclick = () => { S.d.texte.splice(S.d.texte.indexOf(x), 1); geaendert(); zeichne(true); };
  });
  $$('[data-neuer-text]').forEach(b => b.onclick = () => {
    const x = { id: neueId('t'), titel: 'Line of the house', text: '', quelle: '', aus: false };
    S.d.texte.unshift(x); geaendert(); zeichne(true);
    const k = $(`[data-text="${x.id}"] textarea`); if (k) { k.focus(); k.scrollIntoView({ block: 'center' }); }
  });
}
function pruefeText(k, x) {
  const f = $('[data-tfehler]', k), m = !x.titel.trim() ? 'Every line needs a title.' : !x.text.trim() && !x.aus ? 'This line is empty. Write something or hide it.' : '';
  f.textContent = m; f.hidden = !m;
}

/* Herkunft lesbar (Fehlerbuch 10a: kein roher Code): die Quelle im Fundus nennt Datei und Stelle für uns, Julie sieht, woher es kommt */
function quelleText(q) {
  q = String(q || '');
  let m;
  if ((m = /^_quelle\/MATERIAL\.md · Instagram (D[\w-]{6,})$/.exec(q))) return 'Instagram post ' + m[1];
  if ((m = /^Instagram @thecatandgun · https:\/\/www\.instagram\.com\/thecatandgun\/(p|reel)\/([\w-]{6,})\/?$/.exec(q))) return (m[1] === 'reel' ? 'Instagram reel ' : 'Instagram post ') + m[2];
  if (/^_quelle\/MATERIAL\.md · (Instagram Bio|Ort \(Instagram-Bio\))$/.test(q)) return 'Instagram bio';
  if (/^_quelle\/MATERIAL\.md · Instagram Abschluss/.test(q)) return 'Instagram, the end of many posts';
  if (/^_quelle\/MATERIAL\.md/.test(q)) return 'Instagram @thecatandgun';
  if (/^drucksachen\/(_bau|zeichen)\//.test(q)) return 'The print pieces (stickers, coasters, signs)';
  if (/^drucksachen\/schrift\//.test(q)) return 'The fonts of the print pieces';
  if (/^website\//.test(q)) return 'The website';
  return q;
}
/* ---------------------------------------------------------------- Logo & Elemente */
function elemente() {
  const d = S.d, sicht = d.elemente.filter(e => !e.aus), aus = d.elemente.filter(e => e.aus);
  const tafel = e => {
    const b = nach(S.base.elemente, e.id), ge = b && !gleich(b, e);
    return `<button class="li-tafel mb-el${e.aus ? ' mb-aus' : ''}${ge ? ' mb-offen' : ''}" type="button" data-el="${esc(e.id)}" data-r>
      <span class="li-tafel__f mb-el__f${e.art === 'zeichen' ? ' mb-el__f--zeichen' : ''}"><span data-svg="${esc(e.id)}"></span></span>
      <span class="mb-el__t"><b>${esc(e.name)}</b><small>${esc(e.satz || '')}</small><span class="mb-el__teile">${e.teile.map(tt => `<i style="background:${esc(tt.wert || (nach(d.farben, tt.farbe) || {}).wert || '#000')}" title="${esc(tt.name)}"></i>`).join('')}</span></span></button>`;
  };
  const z = sicht.filter(e => e.art === 'zeichen'), st = sicht.filter(e => e.art !== 'zeichen');
  return `${titel('elemente', ['Logo', '& elements'], 'The wordmark, the ampersand, the pool ball and the stickers of the house. Every colour in them is its own part and can change on its own.',
      '', [[zahl(z.length), 'signs'], [zahl(st.length), 'stickers'], [zahl(aus.length), 'hidden']])}
    <h2 class="wo-zw">Wordmark <em>and signs</em></h2>
    <div class="li-tafeln li-tafeln--breit mb-tafeln">${z.map(tafel).join('')}</div>
    <h2 class="wo-zw">Stickers <em>and pieces</em></h2>
    <div class="li-tafeln mb-tafeln">${st.map(tafel).join('')}</div>
    ${aus.length ? `<h2 class="wo-zw">${esc(t('aus_t'))}</h2><p class="leise">${esc(t('aus_s'))}</p><div class="mb-zeilen">${aus.map(e => ausZeile('element', e.id, `<span data-svg="${esc(e.id)}"></span>`, e.name, e.satz || '')).join('')}</div>` : ''}`;
}
/* Schmale Zeile für ein ausgeblendetes Stück (Robert 28.11.2026: «Schmale Zeile»): kleines Vorschaubild, Name, eine Zeile dazu, «Show again».
   Bild und Name öffnen das Fenster des Stücks wie die Kachel. Aufbau wie die Zeile einer ausgeblendeten Farbwelt (.mb-zeile). */
function ausZeile(art, id, bild, name, zeile) {
  const oeffnen = art === 'foto' ? `data-k="${esc(id)}"` : `data-el="${esc(id)}"`;
  return `<div class="mb-zeile mb-zeile--aus"><button type="button" class="mb-zeile__k" ${oeffnen}><span class="mb-zeile__b${art === 'element' ? ' mb-zeile__b--el' : ''}">${bild}</span><span class="mb-zeile__t"><b>${esc(name)}</b>${zeile ? `<small>${esc(zeile)}</small>` : ''}</span></button>
    <button class="kn kn--klein kn--linie" type="button" data-zeigen-${art}="${esc(id)}">${esc(t('zeigen'))}<i>${AUGE}</i></button></div>`;
}
function elementeLeben() {
  $$('[data-el]').forEach(b => b.onclick = () => elementFenster(b.dataset.el));
  $$('[data-zeigen-element]').forEach(b => b.onclick = () => { nach(S.d.elemente, b.dataset.zeigenElement).aus = false; geaendert(); zeichne(true); });
  elementeMalen($('#ansicht'));
}
/* «Cancel wie bei Farben» (Robert 28.11.2026): das Fenster arbeitet an einer Kopie des Elements (a). Name und Farben der Teile gelten erst
   mit «Done»; «Cancel», Escape, Rundknopf und Klick daneben verwerfen sie. «Hide» wirkt sofort, wie «Hide» im Farbfenster. */
function elementFenster(id, a) {
  const d = S.d, e0 = nach(d.elemente, id); if (!e0) return;
  const e = a || kopie(e0);
  const mehr = S.modus === 'mehr';
  const teil = tt => `<li class="mb-teil" data-teil="${esc(tt.id)}"><span class="mb-teil__n"><i style="background:${esc(tt.wert || (nach(d.farben, tt.farbe) || {}).wert)}"></i><b>${esc(tt.name)}</b>${tt.wert ? `<small>own value ${esc(tt.wert.toUpperCase())}</small>` : ''}</span>
      <span class="mb-teil__w" data-teil-wahl="${esc(tt.id)}"></span>${mehr ? `<button class="link" type="button" data-teil-eigen="${esc(tt.id)}">Own value</button>` : ''}${tt.wert ? `<button class="link" type="button" data-teil-zurueck="${esc(tt.id)}">Back to the house colour</button>` : ''}</li>`;
  fenster(`<div class="mb-ef" data-mb-fenster="element">
    <div class="mb-ef__bild${e.art === 'zeichen' ? ' mb-ef__bild--zeichen' : ''}" data-svg="${esc(e.id)}"></div>
    <div class="mb-ef__t"><p class="mono">${e.art === 'zeichen' ? 'Sign' : 'Sticker'} · ${esc(quelleText(e.quelle))}</p>
      <label class="wo-feld"><span>Name</span><input type="text" id="mb-ename" maxlength="80" value="${esc(e.name)}" autocomplete="off"></label>
      <p class="mono mb-ef__h">Parts and their colours</p>
      <ul class="mb-teile">${e.teile.map(teil).join('')}</ul>
      <p class="leise">${mehr ? 'A part follows its house colour. «Own value» gives it a colour only here.' : 'Each part follows a colour of the house. Change the house colour and every element with it changes too.'}</p>
      <div class="mb-ff__fuss"><button class="link" type="button" id="mb-eaus">${e.aus ? esc(t('zeigen')) : esc(t('verbergen'))}</button><span class="mb-ff__frei"></span>
        <button class="kn kn--klein kn--linie" type="button" data-zu>${esc(t('abbrechen'))}<i>${ZU}</i></button>
        <button class="kn kn--klein kn--gold" type="button" id="mb-eok">${esc(t('fertig'))}<i>${PF}</i></button></div></div></div>`, 'mb-fk--element');
  /* neu zeichnen mit derselben Kopie; der Name im Feld geht dabei nicht verloren */
  const neu = () => { e.name = $('#mb-ename').value; elementFenster(id, e); };
  $$('[data-teil-wahl]').forEach(o => {
    const tt = e.teile.find(x => x.id === o.dataset.teilWahl);
    o.replaceWith(farbAuswahl(tt.farbe, w => { tt.farbe = w; delete tt.wert; neu(); }, tt.name));
  });
  $$('[data-teil-eigen]').forEach(b => b.onclick = () => {
    const tt = e.teile.find(x => x.id === b.dataset.teilEigen);
    e.name = $('#mb-ename').value;
    eigenerWert(tt.wert || (nach(d.farben, tt.farbe) || {}).wert, w => { tt.wert = w; elementFenster(id, e); }, () => elementFenster(id, e));
  });
  $$('[data-teil-zurueck]').forEach(b => b.onclick = () => { delete e.teile.find(x => x.id === b.dataset.teilZurueck).wert; neu(); });
  $('#mb-eaus').onclick = () => { e0.aus = !e0.aus; fensterZu(); geaendert(); zeichne(true); };
  $('#mb-eok').onclick = () => {
    const name = $('#mb-ename').value.replace(/\s+/g, ' ').trim();
    d.elemente[d.elemente.indexOf(e0)] = { ...e, name, aus: e0.aus };
    fensterZu(); geaendert(); zeichne(true);
  };
  /* Zeichnung im Fenster aus der Kopie, damit jede Wahl sofort zu sehen ist, bevor sie gilt */
  const ort = $('#fenster [data-svg]');
  if (ort) svgVon(e).then(s => { if (ort.isConnected) ort.innerHTML = faerben(s, e, d).replace(/ width="[^"]*" height="[^"]*"/, ''); });
}
/* Eigener Wert eines Teils (erweitert): kleines Fenster mit HEX, Pipette und Palette */
function eigenerWert(start, nimm, abbruch) {
  const z = { wert: start || '#000000' };
  const alt = $('#fenster').innerHTML;
  let genommen = false;
  const zurueck = () => { genommen = true; fensterZu(); };
  fenster(`<div class="mb-ew" data-mb-fenster="eigen"><h2>Own <em>value</em></h2><div class="mb-ff__probe" id="mb-ewp"></div>
    <label class="wo-feld mb-hex"><span>HEX</span><input type="text" id="mb-ewhex" maxlength="7" value="${esc(z.wert.toUpperCase())}" autocomplete="off" spellcheck="false"></label>
    <p class="mb-fehler" id="mb-ewf" role="alert" hidden></p>
    <div class="mb-ff__fuss">${PICKER ? `<button class="kn kn--klein kn--linie" type="button" id="mb-ewpip">Pipette<i>${PIPETTE}</i></button>` : ''}<span class="mb-ff__frei"></span><button class="kn kn--klein kn--linie" type="button" data-zu>${esc(t('abbrechen'))}<i>${ZU}</i></button><button class="kn kn--klein kn--gold" type="button" id="mb-ewok">${esc(t('uebernehmen'))}<i>${PF}</i></button></div></div>`, 'mb-fk--eigen');
  /* «Cancel», Escape, Rundknopf, Klick daneben: zurück ins Fenster des Elements, aus dem «Own value» kam (vorher ging alles zu
     und man stand auf dem Raster, Abnahme 28.11.2026) */
  S.fensterZu = () => { if (!genommen && abbruch) setTimeout(abbruch); };
  const zeig = () => { $('#mb-ewp').style.background = z.wert; };
  $('#mb-ewhex').oninput = ev => { let v = ev.target.value.trim(); if (v && v[0] !== '#') v = '#' + v; if (/^#[0-9a-f]{6}$/i.test(v)) { z.wert = v.toLowerCase(); zeig(); $('#mb-ewf').hidden = true; } else { $('#mb-ewf').textContent = 'Use six signs after the #, like #A8232A.'; $('#mb-ewf').hidden = false; } };
  if ($('#mb-ewpip')) $('#mb-ewpip').onclick = async () => { try { const r = await new window.EyeDropper().open(); z.wert = r.sRGBHex.length === 7 ? r.sRGBHex.toLowerCase() : rgbText(r.sRGBHex); $('#mb-ewhex').value = z.wert.toUpperCase(); zeig(); } catch (x) { /* abgebrochen */ } };
  $('#mb-ewok').onclick = () => { zurueck(); nimm(z.wert); };
  zeig();
  return alt;
}

/* ---------------------------------------------------------------- Frühere Fassungen (R14) */
const ART = { gespeichert: 'Saved in the draft', veroeffentlicht: 'Published', verworfen: 'Draft discarded', zurueckgeholt: 'Earlier version brought back' };
function verlauf() {
  const L = S.L, a = wartet();
  const zeile = v => `<div class="mb-vl__z${v.art === 'veroeffentlicht' ? ' mb-vl__z--raus' : ''}" data-vl="${v.nr}" data-r><b>${esc(zeit(v.zeit))}</b><span>${esc(ART[v.art] || v.art)}${v.zahl ? ' · ' + mz(v.zahl, 'change', 'changes') : ''}${v.notiz ? ' · Note «' + esc(v.notiz) + '»' : ''}</span>
    <button class="kn kn--klein kn--linie" type="button" data-holen="${v.nr}">Bring into draft<i>${ZU}</i></button></div>`;
  return `${titel('verlauf', ['Earlier', 'versions'], 'Every save and every publication is kept. An earlier version first comes back into the draft. You look at it, then you publish.',
      '', [[zahl(L.verlauf.filter(v => v.art === 'veroeffentlicht').length), 'published'], [zahl(L.verlauf.length), 'kept in all'], [a ? zahl(a) : '0', 'waiting in draft']])}
    ${a ? `<section class="platte mb-entwurf" data-r><div><h3>Draft waiting</h3><p class="leise">${esc(mz(a, 'change is', 'changes are'))} saved and not yet published.</p></div>
      <div class="mb-det__kn"><button class="kn kn--klein kn--linie" type="button" id="mb-zeigen-vgl">${esc(t('vgl'))}<i>${AUGE}</i></button><button class="kn kn--klein kn--linie" type="button" id="mb-verwerfen">Discard draft<i>${ZU}</i></button></div></section>` : ''}
    <h2 class="wo-zw">Kept <em>versions</em></h2>
    <div class="mb-vl">
      ${L.verlauf.length ? L.verlauf.map(zeile).join('') : `<div class="mb-vl__z mb-vl__z--beispiel" data-r><span class="mb-marke">Example</span><b>22 Nov 2026, 18:30</b><span>Published · 3 changes · Note «New juice colours»</span></div>`}
      <div class="mb-vl__z mb-vl__z--ur" data-r><b>Original version</b><span>As the brand collection was built from the website and the print pieces</span><button class="kn kn--klein kn--linie" type="button" data-holen="ursprung">Bring into draft<i>${ZU}</i></button></div>
    </div>`;
}
function verlaufLeben() {
  $$('[data-holen]').forEach(b => b.onclick = async () => {
    if (offen()) { melde('Please save or undo your changes first.', true); return; }
    try {
      uebernehmen(await ruf('POST', 'fundus/zurueckholen', { nr: b.dataset.holen === 'ursprung' ? 'ursprung' : +b.dataset.holen, erwartet: S.L.kennung }), false);
      window.Fundus && Fundus.bescheid('entwurf');
      geaendert(); zeichne(true);
      /* gleicht die geholte Fassung dem veröffentlichten Stand, wartet nichts; die Meldung sagte trotzdem «reaches the other tools when you publish» (Abnahme 28.11.2026) */
      if (!S.L.wartet) { melde(b.dataset.holen === 'ursprung' ? 'The original version is the published one. Nothing is waiting.' : 'This version is the published one. Nothing is waiting.'); return; }
      melde(b.dataset.holen === 'ursprung' ? 'The original version is in the draft. It reaches the other tools when you publish.' : 'This version is in the draft. It reaches the other tools when you publish.');
    } catch (x) { if (x.status === 409) { await neuLaden(true); melde('Someone saved in the meantime. Please try again.', true); } else fehler(x); }
  });
  if ($('#mb-zeigen-vgl')) $('#mb-zeigen-vgl').onclick = vorherNachher;
  if ($('#mb-verwerfen')) $('#mb-verwerfen').onclick = () => {
    const n = wartet();
    fenster(`<div class="mb-frage" data-mb-fenster="verwerfen"><h2>Discard <em>the draft?</em></h2><p>${esc(mz(n, 'change goes', 'changes go'))}. The other tools keep what is published.</p>
      <div class="mb-ff__fuss"><span class="mb-ff__frei"></span><button class="kn kn--klein kn--linie" type="button" data-zu>${esc(t('abbrechen'))}<i>${ZU}</i></button><button class="kn kn--klein kn--gold" type="button" id="mb-ja">Yes, discard<i>${PF}</i></button></div></div>`, 'mb-fk--frage');
    $('#mb-ja').onclick = async () => {
      fensterZu();
      try { const a = await ruf('POST', 'fundus/verwerfen', { erwartet: S.L.kennung }); uebernehmen(a, false); geaendert(); zeichne(true); melde('Draft discarded. Everything is as published.'); }
      catch (x) { if (x.status === 409) { await neuLaden(true); melde('Someone saved in the meantime. Please try again.', true); } else fehler(x); }
    };
  };
}

/* ---------------------------------------------------------------- Speichern, Rückgängig, Konflikt, Vorher/nachher, Veröffentlichen */
function pruefeAlles() {
  const d = S.d;
  if (d.farben.some(f => !f.name.trim())) return 'Every colour needs a name.';
  if (d.welten.some(w => !w.name.trim())) return 'Every palette needs a name.';
  if (d.schriften.some(s => !s.name.trim())) return 'Every font needs a name.';
  if (d.elemente.some(e => !e.name.trim())) return 'Every element needs a name.';
  if (d.texte.some(x => !x.titel.trim())) return 'Every line needs a title.';
  /* eine ausgeblendete Zeile darf leer sein: die Meldung nennt «hide it» als Ausweg, also muss er gehen (Abnahme 28.11.2026: eine versehentlich
     angelegte Zeile liess sich sonst nie mehr speichern). fundus.js lässt Ausgeblendetes weg, kein Werkzeug bekommt eine leere Zeile. */
  if (d.texte.some(x => !x.aus && !x.text.trim())) return 'A line is empty. Write something or hide it.';
  return '';
}
async function speichern() {
  if (!S.L) return false;
  if (!offen()) { melde('Nothing changed, nothing saved.'); return true; }
  const p = pruefeAlles();
  if (p) {
    melde(p, true);
    /* die betroffene Zeile zeigen: Hinweis am Feld, dorthin scrollen */
    const leer = S.d.texte.find(x => !x.titel.trim() || (!x.aus && !x.text.trim())), k = leer && $(`[data-text="${leer.id}"]`);
    if (k && /line/.test(p)) { pruefeText(k, leer); k.scrollIntoView({ block: 'center', behavior: RUHIG() ? 'auto' : 'smooth' }); }
    return false;
  }
  const vorher = kopie(S.base);
  try {
    const a = await ruf('POST', 'fundus/speichern', { daten: S.d, erwartet: S.L.kennung });
    uebernehmen(a, false);
    if (a.nichts) { melde('Nothing changed, nothing saved.'); geaendert(); return true; }
    S.gesp = Date.now() + 2600; setTimeout(leiste, 2700);
    geaendert(); zeichne(true);
    window.Fundus && Fundus.bescheid('entwurf');
    const z = zeilen(a.vorher || vorher, basis());
    quittung('Saved', z, [['Before / after', vorherNachher], ['Undo', () => rueckgaengig(a.vorher || vorher)]]);
    return true;
  } catch (x) {
    if (x.status === 409) return konflikt();
    fehler(x); return false;
  }
}
async function rueckgaengig(vorher) {
  try {
    uebernehmen(await ruf('POST', 'fundus/speichern', { daten: vorher, erwartet: S.L.kennung }), false);
    geaendert(); zeichne(true); melde('Undone. The draft is as before this save.');
    window.Fundus && Fundus.bescheid('entwurf');
  } catch (x) { if (x.status === 409) { await neuLaden(true); melde('Someone saved in the meantime. Undo would overwrite it, so nothing was done.', true); } else fehler(x); }
}
async function neuLaden(behalten) {
  const alt = S.base, meins = S.d, L = await ruf('GET', 'fundus');
  uebernehmen(L, true);
  if (behalten && alt && meins) { const m = zusammen(alt, basis(), meins); S.d = m.d; return m.gleiche; }
  S.d = kopie(basis()); return [];
}
async function konflikt() {
  const altBasis = S.base;
  let gleiche = [];
  try { gleiche = await neuLaden(true); } catch (x) { fehler(x); return false; }
  const fremd = zeilen(altBasis, basis());
  geaendert(); zeichne(true);
  return new Promise(fertig => {
    fenster(`<div class="mb-frage" data-mb-fenster="konflikt"><h2>Two people changed <em>at the same time.</em></h2>
      <p>Someone saved in another window in the meantime. Your changes are still here and nothing was overwritten.</p>
      ${fremd.length ? `<p class="mono">Saved in the other window</p><ul class="mb-liste">${fremd.slice(0, 6).map(z => `<li>${esc(z)}</li>`).join('')}</ul>` : ''}
      <p>${gleiche.length ? `Careful: «${esc(gleiche[0])}» was changed in both windows. If you save, your version counts there.` : 'Your changes touch other pieces. If you save, both stay.'}</p>
      <div class="mb-ff__fuss"><span class="mb-ff__frei"></span><button class="kn kn--klein kn--linie" type="button" id="mb-k-weg">Discard my changes<i>${ZU}</i></button><button class="kn kn--klein kn--gold" type="button" id="mb-k-ja">Save my changes<i>${PF}</i></button></div></div>`, 'mb-fk--frage');
    $('#mb-k-weg').onclick = () => { fensterZu(); S.d = kopie(basis()); geaendert(); zeichne(true); fertig(false); };
    $('#mb-k-ja').onclick = async () => { fensterZu(); fertig(await speichern()); };
  });
}
function vorherNachher() {
  const n = offen(), a = wartet();
  const ungesp = n ? zeilen(S.base, S.d) : [], entw = a ? zeilen(nackt(S.L.stand), nackt(S.L.entwurf)) : [];
  const liste = (titel_, l) => l.length ? `<p class="mono">${esc(titel_)}</p><ul class="mb-liste">${l.map(z => `<li>${vorNach(z)}</li>`).join('')}</ul>` : '';
  fenster(`<div class="mb-frage mb-vn" data-mb-fenster="vorher-nachher"><h2>Before <em>/ after</em></h2>
    ${!n && !a ? '<p>Nothing is waiting. Everything is published.</p>' : ''}
    ${liste('Not saved yet', ungesp)}${liste('Saved in the draft, not yet published', entw)}
    <div class="mb-ff__fuss"><span class="mb-ff__frei"></span><button class="kn kn--klein kn--gold" type="button" data-zu>${esc(t('fertig'))}<i>${PF}</i></button></div></div>`, 'mb-fk--frage');
}
const vorNach = z => esc(z).replace(/(#[0-9a-f]{6}) becomes (#[0-9a-f]{6})/g, '<s><i style="background:$1"></i>$1</s> becomes <mark><i style="background:$2"></i>$2</mark>');
function veroeffentlichen() {
  if (offen()) { melde('Save first.', true); return; }
  const a = wartet(); if (!a) { melde('Nothing changed, nothing published.'); return; }
  const z = zeilen(nackt(S.L.stand), nackt(S.L.entwurf));
  fenster(`<div class="mb-frage mb-raus" data-mb-fenster="veroeffentlichen"><h2>Publish <em>${esc(mz(a, 'change', 'changes'))}?</em></h2>
    <p>After this, Sticker editor, Print & feed and Brand book work with the new version. The version before stays under «Earlier versions».</p>
    <ul class="mb-liste">${z.slice(0, 12).map(x => `<li>${vorNach(x)}</li>`).join('')}${z.length > 12 ? `<li>and ${z.length - 12} more</li>` : ''}</ul>
    <label class="wo-feld"><span>Note (optional)</span><input type="text" id="mb-notiz" maxlength="200" placeholder="For example: new juice colours" autocomplete="off"></label>
    <ol class="li-schritte" id="mb-schritte" hidden><li data-s="1"><i></i>Check the new version</li><li data-s="2"><i></i>Write the files</li><li data-s="3"><i></i>Check again</li></ol>
    <p class="mb-fehler" id="mb-rfehler" role="alert" hidden></p>
    <div class="mb-ff__fuss"><span class="mb-ff__frei"></span><button class="kn kn--klein kn--linie" type="button" data-zu>${esc(t('abbrechen'))}<i>${ZU}</i></button><button class="kn kn--klein kn--gold" type="button" id="mb-raus-ja">${esc(t('raus'))}<i>${PO}</i></button></div></div>`, 'mb-fk--frage');
  $('#mb-raus-ja').onclick = async () => {
    const kn = $('#mb-raus-ja'), sch = $('#mb-schritte'); kn.disabled = true; sch.hidden = false;
    const schritt = n => $$('li', sch).forEach(li => { const s = +li.dataset.s; li.className = s < n ? 'fertig' : s === n ? 'an' : ''; });
    schritt(1);
    try {
      await new Promise(r => setTimeout(r, 250)); schritt(2);
      const j = await ruf('POST', 'fundus/veroeffentlichen', { erwartet: S.L.kennung, notiz: $('#mb-notiz').value.trim() });
      schritt(3);
      const kontrolle = await fetch(FUNDUS + 'stand.json', { cache: 'no-store' }).then(r => r.json());
      if (!j.stand || kontrolle.kennung !== j.stand.kennung) throw { fehler: 'CHECK · The published file does not match. Please check «Earlier versions».' };
      schritt(4);
      uebernehmen(j, false);
      window.Fundus && Fundus.bescheid('stand');
      fensterZu(); geaendert(); zeichne(true);
      quittung('Is published', [`${mz(j.zahl || a, 'change', 'changes')} now hold in every tool that designs.`, `Files written: ${(j.geschrieben || []).join(', ')}`], [['Earlier versions', () => gehe('verlauf')]]);
    } catch (x) {
      kn.disabled = false; sch.hidden = true;
      if (x.status === 409) { fensterZu(); await neuLaden(true); geaendert(); zeichne(true); melde('Someone saved in the meantime. Please look again and publish.', true); return; }
      $('#mb-rfehler').textContent = 'Not published. ' + textVon(x); $('#mb-rfehler').hidden = false;
    }
  };
}

/* ---------------------------------------------------------------- Auswahl im Hausstil (R21), Fenster, Meldung, Quittung */
function auswahl(optionen, wert, beiWahl, name) {
  const jetzt = () => optionen.find(o => o.wert === wert) || optionen[0] || { text: '' };
  const k = document.createElement('div'); k.className = 'mb-auswahl'; k.setAttribute('data-auswahl', name);
  const zeile = o => `${o.farbe ? `<i style="background:${esc(o.farbe)}"></i>` : ''}<span${o.schrift ? ` style="font-family:'${esc(String(o.schrift).replace(/['"\\<>]/g, ''))}'"` : ''}>${esc(o.text)}</span>`;
  k.innerHTML = `<button type="button" class="mb-auswahl__k" aria-haspopup="listbox" aria-expanded="false" aria-label="${esc(name)}">${zeile(jetzt())}<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5"/></svg></button>
    <ul class="mb-auswahl__l" role="listbox" aria-label="${esc(name)}" hidden>${optionen.map((o, i) => `<li role="option" data-i="${i}" aria-selected="${o.wert === wert}" tabindex="-1">${zeile(o)}</li>`).join('')}</ul>`;
  const knopf = $('.mb-auswahl__k', k), liste = $('.mb-auswahl__l', k);
  const zu = () => { liste.hidden = true; knopf.setAttribute('aria-expanded', 'false'); document.removeEventListener('click', aussen, true); };
  const aussen = ev => { if (!k.contains(ev.target)) zu(); };
  const waehle = i => { const o = optionen[i]; zu(); knopf.focus(); if (o && o.wert !== wert) { wert = o.wert; knopf.innerHTML = zeile(o) + knopf.innerHTML.slice(knopf.innerHTML.indexOf('<svg')); beiWahl(o.wert); } };
  knopf.onclick = () => {
    if (!liste.hidden) return zu();
    liste.hidden = false; knopf.setAttribute('aria-expanded', 'true');
    /* Platz nach unten ohne die feste Leiste (in einem Fenster zählt sie nicht, das Fenster liegt über ihr): sonst rutscht das Ende der Liste unter die Leiste (Abnahme 28.11.2026) */
    const r = knopf.getBoundingClientRect(), le = $('#leiste'), fuss = le && !$('#fenster').contains(k) ? Math.max(0, innerHeight - le.getBoundingClientRect().top) : 0;
    k.classList.toggle('mb-auswahl--oben', innerHeight - fuss - r.bottom < 290 && r.top > 290);
    const an = liste.querySelector('[aria-selected="true"]') || liste.firstElementChild; if (an) { an.focus({ preventScroll: true }); an.scrollIntoView({ block: 'nearest' }); }
    setTimeout(() => document.addEventListener('click', aussen, true));
  };
  liste.onclick = ev => { const li = ev.target.closest('[data-i]'); if (li) waehle(+li.dataset.i); };
  liste.onkeydown = ev => {
    const li = document.activeElement.closest && document.activeElement.closest('[data-i]'); const i = li ? +li.dataset.i : 0;
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') { ev.preventDefault(); const n = liste.children[Math.max(0, Math.min(optionen.length - 1, i + (ev.key === 'ArrowDown' ? 1 : -1)))]; n.focus(); }
    else if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); waehle(i); }
    else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); zu(); knopf.focus(); }
  };
  return k;
}
let VORHER_FOKUS = null;
function fenster(html, klasse = '') {
  const f = $('#fenster');
  /* Meldungen von vorher (Quittung «Saved», 9 s) lagen über dem Fuss des nächsten Fensters, bei 1440×790 auf dem Knopf «Cancel»
     (Abnahme 28.11.2026): mit einem neuen Fenster gehen sie weg. Was das Fenster selbst meldet («Photo is uploading …»), kommt danach. */
  $('#meldung').innerHTML = '';
  VORHER_FOKUS = document.activeElement;
  f.innerHTML = `<div class="fenster__k ${klasse}" role="dialog" aria-modal="true"><button class="rund fenster__zu" type="button" data-zu aria-label="Close">${ZU}</button>${html}</div>`;
  f.hidden = false; document.body.classList.add('li-zu');
  $$('[data-zu]', f).forEach(b => b.onclick = fensterZu);
  f.onclick = e => { if (e.target === f) fensterZu(); };
  const zu = $('.fenster__zu', f); if (zu) zu.focus({ preventScroll: true });
}
function fensterZu() {
  if (S.fensterZu) { S.fensterZu(); S.fensterZu = null; }
  $('#fenster').hidden = true; $('#fenster').innerHTML = ''; document.body.classList.remove('li-zu');
  if (VORHER_FOKUS && VORHER_FOKUS.focus && VORHER_FOKUS.isConnected) VORHER_FOKUS.focus({ preventScroll: true });
}
/* Quittung (R11): was, bis drei Stellen und «und n weitere», Knöpfe, höchstens drei übereinander, 9 s, Schliessen */
function quittung(titel_, zeilen_, knoepfe = [], fehl = false) {
  const m = $('#meldung'); while (m.children.length >= 3) m.firstChild.remove();
  const q = document.createElement('div');
  q.className = 'quit mb-quit' + (fehl ? ' fehl' : ''); q.setAttribute('role', fehl ? 'alert' : 'status');
  const text = zeilen_.slice(0, 3).map(esc).join(' · ') + (zeilen_.length > 3 ? ` and ${zeilen_.length - 3} more` : '');
  q.innerHTML = `<div><b>${esc(titel_)}</b>${text ? `<span>${text}</span>` : ''}</div><span class="mb-quit__kn"></span><button type="button" class="mb-quit__zu" aria-label="Close">${ZU}</button>`;
  knoepfe.forEach(([l, fn]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'mb-quit__t'; b.textContent = l; b.onclick = () => { q.remove(); fn(); }; $('.mb-quit__kn', q).appendChild(b); });
  $('.mb-quit__zu', q).onclick = () => q.remove();
  m.appendChild(q);
  setTimeout(() => q.remove(), 9000);
  return q;
}
function melde(text, fehl = false) { return quittung(String(text).replace(/^[A-ZÄÖÜ ]+ · /, ''), [], fehl ? [['What to do?', () => window.open(ANLEITUNG + '#hilfe', '_blank', 'noopener')]] : [], fehl); }
function fehler(x) {
  const text = (x && x.fehler) || String(x);
  try { const l = JSON.parse(localStorage.getItem('cg-mb-meldungen') || '[]'); l.push({ zeit: new Date().toISOString(), text: text.slice(0, 300) }); localStorage.setItem('cg-mb-meldungen', JSON.stringify(l.slice(-30))); } catch (e) { /* privat */ }
  const q = quittung(textVon(text), [], [['What to do?', () => window.open(ANLEITUNG + '#lex-' + ((x && x.stichwort) || 'server'), '_blank', 'noopener')]], true);
  q.setAttribute('data-stichwort', (x && x.stichwort) || '');
}

/* ---------------------------------------------------------------- Tasten, Verlassen */
addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#fenster').hidden && !e.defaultPrevented) fensterZu();
  if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); if ($('#fenster').hidden) speichern(); }
});
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented || !/^[1-8]$/.test(e.key) || !$('#fenster').hidden) return;
  const f = document.activeElement; if (f && (/^(INPUT|TEXTAREA|SELECT)$/.test(f.tagName) || f.isContentEditable)) return;
  if (document.querySelector('.rdg-karte, [role="dialog"][aria-modal="true"]:not([hidden])')) return;
  const w = WZ().find(x => x[0] === e.key); if (!w) return;
  e.preventDefault();
  if (e.key === '5') gehe('start'); else if (w[1]) location.href = w[1];
});
addEventListener('beforeunload', e => { if (offen()) { e.preventDefault(); e.returnValue = ''; } });

/* ---------------------------------------------------------------- Start */
function startfehler(grund) {
  window.MB_BEREIT = true; clearTimeout(window.MB_LADE);
  $('#ansicht').innerHTML = `<div class="platte li-tuer" role="alert"><h1>${esc(NAME)} does not start.</h1>
    <p class="li-tuer__g">${esc(grund)}</p><p>If «Reload» does not help: open the guide.</p>
    <div class="titel__kn"><button class="kn" type="button" data-neu>Reload<i>${PF}</i></button><a class="kn kn--linie" href="${ANLEITUNG}" target="_blank" rel="noopener">Guide<i>${PF}</i></a></div></div>`;
  const b = $('#ansicht [data-neu]'); if (b) b.onclick = () => location.reload();
}
function beigabe(src, daten) {
  const s = document.createElement('script'); s.src = src + '?v=' + ((($('script[src*="markenbuch.js"]') || {}).src || '').split('v=')[1] || 1); s.defer = true;
  Object.entries(daten || {}).forEach(([k, v]) => s.setAttribute('data-' + k, v));
  document.body.appendChild(s);
}
/* Auftakt (R02): ruhig warten, bis Schriften und das Foto der ersten Bühne da sind, höchstens 2,5 s */
function bereit(ansicht) {
  const bild = new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = buehneVon(ansicht); if (i.decode) i.decode().then(r, r); });
  return Promise.race([Promise.all([document.fonts ? document.fonts.ready : 0, bild]), new Promise(r => setTimeout(r, 2500))]);
}
(async function () {
  document.documentElement.lang = 'en';
  try {
    try {
      const L = await ruf('GET', 'fundus');
      if (!L || !L.stand || !Array.isArray(L.stand.farben)) throw new Error('Form');
      uebernehmen(L, false);
    } catch (e) { return startfehler('The brand collection could not be loaded (' + (e.stichwort === 'netz' ? 'no connection to the server' : textVon(e)) + ').'); }
    document.title = `${NAME} · The Cat & Gun`;
    const h = location.hash.slice(1);
    try {
      const ausMaison = /\/maison\/?(index\.html)?([?#].*)?$/.test(document.referrer) && ((performance.getEntriesByType('navigation')[0] || {}).type !== 'reload');
      S.ansicht = ANSICHTEN.includes(h) ? h : ausMaison ? (localStorage.removeItem('cg-mb-ansicht'), 'start') : (ANSICHTEN.includes(localStorage.getItem('cg-mb-ansicht')) ? localStorage.getItem('cg-mb-ansicht') : 'start');
    } catch (e) { S.ansicht = 'start'; }
    await bereit(S.ansicht);
    clearTimeout(window.MB_LADE);
    kopf(); rand(); leiste(); zeichne();
    document.body.classList.add('li-bereit'); window.MB_BEREIT = true;
  } catch (e) { return startfehler(String(e && e.message || e).slice(0, 200)); }
  addEventListener('hashchange', () => { const a = location.hash.slice(1); if (ANSICHTEN.includes(a) && a !== S.ansicht) gehe(a); });
  beigabe('zur-werkbank.js', { zw: '', neben: '#rand', ueber: '#leiste' });
  beigabe('rundgang.js', { werkzeug: 'markenbuch' });
})();
