/* website.js · das Werkzeug «website» (Le Bureau · Der Schreibtisch). Ein Bau für jedes Haus: ?haus=<kennung>.
   Aufbau und Ablauf sind aus dem ersten Le Bureau abgeleitet (dort website/studio/studio.js, siehe STAND.md): Übersicht, die Website Bereich für
   Bereich (Stellen links, Seite rechts), Zeiten und Preise, Hinweis, Sprachen, Entwurf mit Vorher/nachher, frühere Fassungen.
   Was ein Haus hat, kommt vom Server aus seiner Beschreibung (/the-cat-and-gun/haus/api/x/website/haus/<haus>). Hier steht kein Wort über ein bestimmtes Haus.

   Nichts speichert still: Eingaben warten in Z.offen (die Leiste unten zählt sie), “Speichern” legt sie in den Entwurf und antwortet mit
   einer Quittung (vorher, nachher, “Rückgängig”). Auf die Website kommt erst, was veröffentlicht wird.
   Fehler landen zusätzlich im Browser (localStorage “ws-fehler”), dort liest sie die Prüfung (pruefung.html). */
(() => {
'use strict';
const HAUS = (window.Welt && Welt.haus) || '';
const W = 'website';
/* Anrede (29.10.2026): Ein Haus, dessen Kleid WO_HAUS.anrede = 'du' setzt (Culinarium), duzt sein Team. Alle anderen Häuser behalten «Sie», Wort für Wort wie bisher. */
const DU = !!(window.WO_HAUS && window.WO_HAUS.anrede === 'du');
const A = (sie, du) => DU ? du : sie;
const X = weg => '/the-cat-and-gun/haus/api/x/' + W + '/' + weg;
/* Rahmen des Hauses (oberflaeche.js, 17.10.2026): Lädt ein Haus sein Werkzeug-Paket (kleid/<haus>.js + oberflaeche.js), zeichnet das Werkzeug Kopf, Rand,
   Startbild, Leiste und Übersicht mit WO.* wie die anderen Werkzeuge desselben Hauses; ohne Paket bleibt alles wie im Stamm (ws-…). */
const WOM = !!window.WO;
const wname = (k, w) => WOM ? ((WO.haus.namen || {})[k] || WO.name(k)) : Welt.name(k, w);   // Namen der Werkzeuge an einer Stelle: kleid/<haus>.js › namen
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
const HAKEN = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7"/></svg>';
const ZU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13"/></svg>';
const LUPE = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3.5 3.5"/></svg>';
const WINKEL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
const TAGNAME = { h1: 'Title', h2: 'Heading', h3: 'Subheading', h4: 'Subheading', p: 'Paragraph', li: 'List item', a: 'Link', button: 'Button', span: 'Text', b: 'Text', small: 'Small print',
  figcaption: 'Caption', dt: 'Term', dd: 'Detail', td: 'Cell', th: 'Column heading', label: 'Field', em: 'Text', strong: 'Text', address: 'Address', blockquote: 'Quote', q: 'Quote', i: 'Text' };

const Z = { info: null, stand: null, ansicht: 'start', seite: '', sprache: 'de', breite: 'rechner', offen: {}, vs: [], fotos: null, wahl: null, lauf: 0, zl: 0,
            auf: new Set(), gr: new Set(), filter: '', zArt: 'alle', spFilter: 'alle', vgl: { seite: '', sprache: 'de', sicht: 'nachher' }, gesp: 0 };

// ---------------------------------------------------------------- kleine Helfer
function el(tag, attrs, ...kinder) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v == null) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kinder.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(String(k)));
  return e;
}
const leere = e => { e.textContent = ''; return e; };
const kn = (text, tun, art = '', attrs = {}) => el('button', Object.assign({ class: 'kn ' + art, type: 'button', onclick: tun }, attrs), el('span', {}, text), el('i', { 'aria-hidden': 'true', html: PF }));
const taste = (text, tun, attrs = {}) => el('button', Object.assign({ class: 'ws-taste', type: 'button', onclick: tun }, attrs), text);
const link = (text, tun, attrs = {}) => el('button', Object.assign({ class: 'ws-link', type: 'button', onclick: tun }, attrs), text);
const mono = text => el('span', { class: 'ws-mono' }, text);
const mz = (n, eins, viele) => n + ' ' + (n === 1 ? eins : viele);
const kurz = (t, n = 90) => { t = String(t || ''); return t.length > n ? t.slice(0, n - 1) + '…' : t; };
const anf = t => '“' + t + '”';
const schmal = () => window.innerWidth < 1180;
const MONAT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];   // Datum wie auf der Website: 22 Nov 2026, 2:05PM
function zeit(iso) { const m = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/.exec(iso || ''); if (!m) return iso || ''; const h = +m[4]; return `${+m[3]} ${MONAT[+m[2] - 1]} ${m[1]}, ${h % 12 || 12}:${m[5]}${h < 12 ? 'AM' : 'PM'}`; }
const tag = iso => zeit(iso).split(',')[0];
function wer() { let w = ''; try { w = localStorage.getItem('ws-wer') || ''; } catch (e) { /* ohne Merken */ } return w || (fn('team_wer') ? 'Team ' + Z.info.name : ''); }   // Fehlerbuch 10a (20.10.2026): keine «Wer arbeitet hier?»-Abfrage, fester Eintrag im Protokoll
const klarText = e => e.textContent.replace(/\s+/g, ' ').trim();
const bild = adr => Z.info.basis + adr;
const fn = k => !!(Z.info && (Z.info.funktionen || []).includes(k));
/* Eigene Ansichten eines Hauses (28.10.2026, Master 4.2 L19: z. B. Termine, die die Website aus Daten zeichnet). Nur wo der Rahmen eines Hauses window.WS_EIGEN setzt,
   sonst leer und ohne Wirkung. Je Ansicht: {name, gruppe, zeichne(ort, hilfe), offen() Eingaben, speichern() → true/false, wartet() Entwurf, veroeffentlichen(notiz), zeilen() für das Fenster}. */
const EIGEN = window.WS_EIGEN || {};
const eigen = () => Object.keys(EIGEN).map(k => Object.assign({ key: k }, EIGEN[k]));
const eigenZahl = was => eigen().reduce((n, e) => n + (e[was] ? e[was]() : 0), 0);   // Funktionen, die ein Haus in seiner Beschreibung einschaltet (21.10.2026)
const kartenAdresse = () => WOM && WO.haus.wege && WO.haus.wege.karten ? WO.haus.wege.karten : '/the-cat-and-gun/haus/werkzeuge/karten/?haus=' + encodeURIComponent(HAUS);

function merke(text, stichwort) {
  try {
    const l = JSON.parse(localStorage.getItem('ws-fehler') || '[]');
    l.push({ zeit: new Date().toISOString(), text: String(text).slice(0, 400), stichwort: stichwort || '', wo: Z.ansicht, haus: HAUS });
    localStorage.setItem('ws-fehler', JSON.stringify(l.slice(-30)));
  } catch (e) { /* voller oder gesperrter Speicher: die Meldung steht trotzdem auf der Seite */ }
}
let unterwegs = 0;   // laufende Anfragen, steht als data-ws-laeuft am <html> (der Prüflauf wartet darauf)
function zaehle(n) { unterwegs += n; document.documentElement.setAttribute('data-ws-laeuft', unterwegs); }
/* Prüfung 23.11.2026: Firefox bricht beim Verlassen der Seite laufende Anfragen ab; die Seite meldete dann «server not answering» als unbehandelten Fehler.
   Beim Weggehen endet eine abgebrochene Anfrage still (es gibt niemanden mehr, dem man es zeigen könnte). */
let gehtWeg = false;
addEventListener('beforeunload', () => { gehtWeg = true; });
addEventListener('pagehide', () => { gehtWeg = true; });
addEventListener('pageshow', () => { gehtWeg = false; });
async function ruf(methode, weg, daten) {
  let r, j = null;
  zaehle(1);
  try {
    const vorab = methode === 'GET' && !daten && window.__vorab && window.__vorab[weg]; if (vorab) delete window.__vorab[weg];   /* Leistung 29.10.2026: nur wenn die Seite des Hauses die Daten schon beim Laden holt (window.__vorab, z. B. Culinarium); sonst wie bisher */
    r = await (vorab || fetch(weg, { method: methode, headers: daten ? { 'Content-Type': 'application/json' } : {}, body: daten ? JSON.stringify(daten) : undefined, cache: 'no-store' }));
    try { j = await r.json(); } catch (e) { /* keine lesbare Antwort */ }
  } catch (e) { if (gehtWeg) return new Promise(() => {}); throw { stichwort: 'keine-verbindung', fehler: 'The tool’s server is not answering.' }; } finally { zaehle(-1); }
  if (r.status === 429) throw Object.assign({ status: 429, stichwort: 'unerwartet', fehler: 'Too many saves in one minute. Wait a minute, then save again. What you typed stays here.' }, j || {});   // Prüfung 23.11.2026: verständlich statt «(429)»
  if (!r.ok || j == null) throw Object.assign({ status: r.status, stichwort: 'unerwartet', fehler: 'Unexpected answer from the server (' + r.status + ').' }, j || {});
  return j;
}

// ---------------------------------------------------------------- Meldung, Quittung, Fenster
function pruefLink(stichwort) { return '/the-cat-and-gun/haus/_werkzeuge/bureau/pruefung.html?haus=' + encodeURIComponent(HAUS) + (stichwort ? '#lex-' + stichwort : ''); }
function quit(titel, text, knoepfe = [], attrs = {}) {
  const k = el('div', Object.assign({ class: 'ws-quit', role: 'status' }, attrs),
    el('div', { class: 'ws-quit__t' }, el('b', {}, titel), text ? el('span', {}, text) : null), knoepfe,
    el('button', { class: 'ws-rund', type: 'button', 'aria-label': 'Close', html: ZU, onclick: () => k.remove() }));
  leere($('#ws-quittung')).append(k);
  return k;
}
function melde(text, opt = {}) {
  return quit(text, opt.mehr || '', opt.stichwort ? [el('a', { class: 'ws-taste', href: pruefLink(opt.stichwort) }, 'What to do?')] : [], { 'data-ws-meldung': opt.stichwort || 'hinweis', role: opt.fehler ? 'alert' : 'status' });
}
function fehler(e) {
  const text = (e && e.fehler) || (e && e.message) || String(e);
  merke(text, e && e.stichwort);
  melde(text, { fehler: true, stichwort: (e && e.stichwort) || 'unerwartet' });
}
function quittung(titel, zeilen, vorherDaten) {
  const z = zeilen[0];
  const wert = (t, adr, q) => adr ? el('span', { 'data-ws-q': q }, 'Photo') : el('span', { 'data-ws-q': q }, kurz(t, 170) || 'nothing');
  const text = el('span', {}, z.was + ' · ' + z.wo + ': “', wert(z.vorher, z.vorher_bild, 'vorher'), '” becomes “', wert(z.nachher, z.nachher_bild, 'nachher'), '”',
    zeilen.length > 1 ? ' and ' + mz(zeilen.length - 1, 'other spot', 'other spots') : '');
  const k = quit(titel, '', [
    taste('View before/after', () => { k.remove(); geh('entwurf', { seite: (z.key || '').split('|')[1] || '' }); }),
    vorherDaten ? taste('Undo', () => rueckgaengig(vorherDaten, k)) : null], { 'data-ws-quittung': zeilen.length });
  $('.ws-quit__t', k).append(text);
}
function fenster(titel, akzent, inhalt, knoepfe, opt = {}) {
  const ort = $('#ws-fenster');
  const zu = () => { leere(ort); document.removeEventListener('keydown', taste_); };
  const taste_ = ev => { if (ev.key === 'Escape') zu(); };
  const blatt = el('div', { class: 'ws-fenster__blatt', role: 'dialog', 'aria-modal': 'true', 'aria-label': titel + ' ' + akzent, 'data-ws-fenster': opt.name || '1' },
    el('h2', {}, titel + ' ', el('span', { class: 't-akzent' }, akzent)), inhalt,
    el('div', { class: 'ws-fenster__kn' }, knoepfe.filter(Boolean).map(k => k.haupt ? kn(k.text, () => k.tun(zu), 'kn--d kn--klein') : link(k.text, () => (k.tun ? k.tun(zu) : zu())))));
  leere(ort).append(el('div', { class: 'ws-fenster' }, el('button', { class: 'ws-fenster__grund', type: 'button', 'aria-label': 'Close', onclick: zu }), blatt));
  document.addEventListener('keydown', taste_);
  return zu;
}

// ---------------------------------------------------------------- Auswahl und Wahl im Stil des Hauses
function auswahl(optionen, wert, beiWahl, name, dunkel) {
  const jetzt = () => optionen.find(o => o.wert === wert) || optionen[0] || { text: '' };
  const kopf_ = el('span', {}, jetzt().text);
  const knopf = el('button', { class: 'ws-auswahl__knopf', type: 'button', 'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-label': name }, kopf_, el('span', { html: WINKEL, 'aria-hidden': 'true' }));
  const liste = el('div', { class: 'ws-auswahl__liste', role: 'listbox', hidden: true, 'aria-label': name });
  const k = el('div', { class: 'ws-auswahl' + (dunkel ? ' ws-auswahl--dunkel' : ''), 'data-ws-auswahl': name }, knopf, liste);
  let zeiger = -1;
  const zeig = i => { zeiger = Math.max(0, Math.min(optionen.length - 1, i)); [...liste.children].forEach((c, n) => c.classList.toggle('ws-zeiger', n === zeiger)); liste.children[zeiger].scrollIntoView({ block: 'nearest' }); };
  const zu = () => { liste.hidden = true; knopf.setAttribute('aria-expanded', 'false'); document.removeEventListener('click', aussen, true); };
  const aussen = ev => { if (!k.contains(ev.target)) zu(); };
  const waehle = i => { const o = optionen[i]; zu(); knopf.focus(); if (o.wert !== wert) { wert = o.wert; kopf_.textContent = o.text; beiWahl(o.wert); } };
  const auf = () => {
    leere(liste);
    optionen.forEach((o, i) => liste.append(el('div', { role: 'option', 'aria-selected': o.wert === wert ? 'true' : 'false', 'data-unter': o.unter ? '1' : null, 'data-wert': o.wert, onclick: () => waehle(i) },
      el('span', {}, o.text), o.zusatz ? mono(o.zusatz) : null)));
    liste.hidden = false; knopf.setAttribute('aria-expanded', 'true');
    zeig(Math.max(0, optionen.findIndex(o => o.wert === wert)));
    document.addEventListener('click', aussen, true);
  };
  knopf.addEventListener('click', () => (liste.hidden ? auf() : zu()));
  k.addEventListener('keydown', ev => {
    if (liste.hidden) { if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') { ev.preventDefault(); auf(); } return; }
    if (ev.key === 'Escape') { ev.stopPropagation(); zu(); knopf.focus(); }
    else if (ev.key === 'ArrowDown') { ev.preventDefault(); zeig(zeiger + 1); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); zeig(zeiger - 1); }
    else if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); waehle(zeiger); }
  });
  return k;
}
function wahl2(optionen, wert, beiWahl, name, hell) {
  const k = el('div', { class: 'ws-wahl2' + (hell ? ' ws-wahl2--hell' : ''), role: 'group', 'aria-label': name, 'data-ws-wahl': name });
  optionen.forEach(o => k.append(el('button', { type: 'button', 'aria-pressed': o.wert === wert ? 'true' : 'false', 'data-wert': o.wert, onclick: ev => {
    if (o.wert === wert) return;
    wert = o.wert;
    [...k.children].forEach(c => c.setAttribute('aria-pressed', c === ev.currentTarget ? 'true' : 'false'));
    beiWahl(o.wert);
  } }, o.text)));
  return k;
}

// ---------------------------------------------------------------- Kopf, Rand, Leiste
const TITEL = { start: 'Overview', zahlen: 'Times', angaben: 'Phone, address & hours', google: 'Google texts', hinweis: 'Notice for guests', sprachen: 'Languages', entwurf: 'Draft & compare', verlauf: 'Earlier versions' };
const webBereich = key => Z.info.website.find(b => b.key === key);
const bereichVon = seite => Z.info.website.find(b => b.seiten.some(s => s.datei === seite));
function ansichtName(a) {
  if (a.startsWith('b:')) return (webBereich(a.slice(2)) || {}).name || '';
  if (a.startsWith('haus:')) return (Z.info.bereiche.find(b => b.key === a.slice(5)) || {}).name || '';
  if (a.startsWith('e:')) return (EIGEN[a.slice(2)] || {}).name || '';
  return TITEL[a] || '';
}
const offenZahl = () => Object.keys(Z.offen).length + eigenZahl('offen');
const aend = () => (Z.stand && Z.stand.offen ? Z.stand.aenderungen : []);
function zeichenBild(klein) {
  const k = Z.info.kleid;
  if (!k.zeichen || (klein && k.zeichen_art === 'maske')) return null;
  return k.zeichen_art === 'maske' ? el('span', { class: 'ws-zeichen ws-zeichen--maske', style: `--ws-zeichen:url('${k.zeichen}')` }) : el('img', { src: k.zeichen, alt: '' });
}
function stilLaden() {
  /* Kleid des Hauses (Farben, Schriften, Anordnung), falls das Haus eins hat. Die Ansicht wird erst gezeichnet, wenn es da ist (höchstens 2,5 s), damit nichts in fremden Farben aufblitzt. */
  document.documentElement.setAttribute('data-haus', HAUS);
  if (WOM) return document.fonts ? document.fonts.ready : Promise.resolve();   // das Paket des Hauses bringt sein Kleid selbst mit
  const neu = (Z.info.kleid.stil || []).filter(h => !document.querySelector(`link[data-ws-stil="${h.split('?')[0]}"]`));
  return Promise.race([Promise.all(neu.map(h => new Promise(fertig => {
    const l = el('link', { rel: 'stylesheet', href: h, 'data-ws-stil': h.split('?')[0] });
    l.addEventListener('load', fertig); l.addEventListener('error', fertig);
    document.head.append(l);
  })).concat(Z.info.kleid.foto ? [new Promise(fertig => { const i = new Image(); i.onload = i.onerror = fertig; i.src = bild(Z.info.kleid.foto); })] : [])),
    new Promise(fertig => setTimeout(fertig, 2500))]).then(() => document.fonts && document.fonts.ready);
}
function kleid() {
  if (WOM) { document.title = wname(W) + ' · ' + Z.info.name; return; }   // Zeichen, Tapete und Kopf kommen aus dem Paket des Hauses
  /* Zeichen und Tapete gehören dem Haus. Die Tapete liegt nur in der Welt des Hauses auf dem Grund: in der anderen Welt passt sie nicht zu den Farben. */
  const k = Z.info.kleid, an = k.tapete && Welt.welt() === Z.info.welt;
  document.body.style.backgroundImage = an ? `url('${k.tapete}')` : '';
  document.body.style.backgroundSize = an ? k.tapete_breite + 'px auto' : '';
  const z = zeichenBild(false);
  leere($('#ws-zeichen')).className = z && Z.info.kleid.zeichen_art !== 'maske' ? 'ws-zeichen' : '';
  if (z) $('#ws-zeichen').append(z);
  $('#ws-haus').textContent = 'Website · ' + Z.info.name;
  document.title = wname(W) + ' · ' + Z.info.name;
}
function kopf() {
  const a = aend().length + eigenZahl('wartet'), z = Z.stand && Z.stand.zuletzt;   // eigene Ansichten (Termine) zählen mit
  if (WOM) {
    const k = $('#ws-kopf');
    k.innerHTML = WO.kopf({ werkzeug: W, unter: 'Website', titel: ansichtName(Z.ansicht) || wname(W), stand: a ? a + ' in the draft' : z ? 'Published ' + tag(z.zeit) : 'As built',
      pruefung: pruefLink(''), anleitung: Z.info.anleitung || '', website: Z.info.online + (Z.ansicht.startsWith('b:') ? Z.seite : Z.info.seiten[0].datei), marke: 'data-ws-marke', markeHref: '?ansicht=start' });
    const m = k.querySelector('[data-ws-marke]');
    if (m) m.addEventListener('click', ev => { ev.preventDefault(); if (Z.info) geh('start'); });
    k.querySelectorAll('.wo-wz, .wo-kopf__r a').forEach(x => { const n = Object.keys(WO.namen).find(s => x.textContent === WO.name(s) || x.title === WO.name(s)); if (n && wname(n) !== WO.name(n)) { if (x.textContent === WO.name(n)) x.textContent = wname(n); x.title = x.title && wname(n); x.setAttribute('aria-label', x.getAttribute('aria-label') ? wname(n) : ''); } });
    const b = k.querySelector('.wo-marke-w b'); if (b) b.textContent = wname(W);
    if (DX) { const kb = k.querySelector('[data-wo-rand-knopf]'); if (kb) kb.remove(); }   // neuer Look: der Knopf «Tools» steht in der Seitenleiste
    const rk = k.querySelector('[data-wo-rand-knopf]'); if (rk) rk.setAttribute('aria-expanded', document.documentElement.classList.contains('wo-rand-auf') ? 'true' : 'false');   // Kopf neu gezeichnet: Knopf sagt, ob der Rand offen ist
    return;
  }
  $('#ws-ansicht-name').textContent = ansichtName(Z.ansicht) || wname(W);
  $('#ws-lage').textContent = a ? a + ' in the draft' : z ? 'Published ' + tag(z.zeit) : 'As built';
  $('#ws-ansehen').href = Z.info.online + (Z.ansicht.startsWith('b:') ? Z.seite : Z.info.seiten[0].datei);
  $('#ws-zur-pruefung').href = pruefLink('');
}
function rand() {
  if (DX) return dxRand();
  const r = leere($('#ws-rand')), ae = aend();
  if (WOM) {
    const nw = (a, name, zahl, extra) => ({ text: name || ansichtName(a), zahl: zahl || 0, an: Z.ansicht === a, attr: `data-ws-nav="${a}"`, extra: extra ? `<em class="wo-rand__z">${WO.esc(extra)}</em>` : '' });
    const g = [{ eintraege: [nw('start')] }, { titel: 'The website', eintraege: Z.info.website.map(b => nw('b:' + b.key, b.name, ae.filter(x => b.seiten.some(s => s.datei === x.seite)).length)) }];
    const alle = [Z.info.angaben ? nw('angaben') : null, Z.info.zahlen ? nw('zahlen') : null, Z.info.google ? nw('google') : null, Z.info.hinweis ? nw('hinweis') : null, Z.info.sprachen.length ? nw('sprachen', '', 0, Z.stand && Z.stand.fehlt ? Z.stand.fehlt + ' missing' : '') : null].filter(Boolean);
    if (alle.length) g.push({ titel: 'All pages', eintraege: alle });
    if (Z.info.bereiche.length) g.push({ titel: 'The house', eintraege: Z.info.bereiche.map(b => nw('haus:' + b.key, b.name)) });
    eigen().forEach(e => { const t = e.gruppe || 'The house', z = (e.offen ? e.offen() : 0) + (e.wartet ? e.wartet() : 0); let gr = g.find(x => x.titel === t); if (!gr) g.push(gr = { titel: t, eintraege: [] }); gr.eintraege.unshift(nw('e:' + e.key, e.name, z)); });
    if (Z.info.karten) g.push({ titel: 'Menus', eintraege: [{ text: wname('karten'), href: kartenAdresse(), attr: 'data-ws-nav="karten"', extra: '<em class="wo-rand__z">own tool</em>' }] });
    g.push({ titel: 'Draft', eintraege: [nw('entwurf', '', ae.length), nw('verlauf')] });
    r.innerHTML = WO.rand(g, { website: Z.info.online + Z.info.seiten[0].datei, pruefung: pruefLink(''), anleitung: Z.info.anleitung || '' });
    r.querySelectorAll('button[data-ws-nav]').forEach(b => b.addEventListener('click', () => geh(b.getAttribute('data-ws-nav'))));
    return;
  }
  const nw = (a, name, zahl, extra) => el('button', { class: 'ws-nw', type: 'button', 'aria-current': Z.ansicht === a ? 'page' : null, 'data-ws-nav': a, onclick: () => geh(a) },
    el('span', {}, name || ansichtName(a)), zahl ? el('i', {}, zahl) : null, extra ? el('em', {}, extra) : null);
  const nav = el('nav', { class: 'ws-nav', 'aria-label': 'Sections' }, nw('start'));
  nav.append(el('p', {}, 'The website'));
  Z.info.website.forEach(b => nav.append(nw('b:' + b.key, b.name, ae.filter(x => b.seiten.some(s => s.datei === x.seite)).length)));
  nav.append(el('p', {}, 'All pages'));
  if (Z.info.zahlen) nav.append(nw('zahlen'));
  if (Z.info.hinweis) nav.append(nw('hinweis'));
  if (Z.info.sprachen.length) nav.append(nw('sprachen', '', 0, Z.stand && Z.stand.fehlt ? Z.stand.fehlt + ' missing' : ''));
  if (Z.info.bereiche.length || eigen().length) { nav.append(el('p', {}, 'The house')); eigen().forEach(e => nav.append(nw('e:' + e.key, e.name))); Z.info.bereiche.forEach(b => nav.append(nw('haus:' + b.key, b.name))); }
  if (Z.info.karten) nav.append(el('p', {}, 'Menus'), el('a', { class: 'ws-nw', href: kartenAdresse(), 'data-ws-nav': 'karten' }, el('span', {}, wname('karten')), el('em', {}, 'own tool')));
  nav.append(el('p', {}, 'Draft'), nw('entwurf', '', ae.length), nw('verlauf'));
  r.append(el('button', { class: 'ws-rand__auf', id: 'ws-menue-knopf', type: 'button', 'aria-expanded': 'false', onclick: menue }, el('span', {}, 'Sections: ' + (ansichtName(Z.ansicht) || '')), el('span', { html: WINKEL, 'aria-hidden': 'true' })), nav,
    el('div', { class: 'ws-wege' },
      el('a', { href: Z.info.online + Z.info.seiten[0].datei, target: '_blank', rel: 'noopener' }, 'View website', el('span', { html: PF })),
      el('a', { href: pruefLink(''), 'data-ws-nav': 'pruefung' }, 'Checks', el('span', { html: PF }))));
}
function menue() {
  const auf = $('#ws-rand').classList.toggle('ws-offen');
  $('#ws-menue-knopf').setAttribute('aria-expanded', auf ? 'true' : 'false');
}
function leiste() {
  const l = leere($('#ws-leiste')), s = Z.stand;
  if (!s) return;
  const n = offenZahl(), a = aend().length + eigenZahl('wartet'), z = s.zuletzt, gesp = !n && Z.gesp > Date.now();
  l.setAttribute('data-ws-offen', String(a));
  if (DX) return dxLeiste();
  if (WOM) {
    l.innerHTML = WO.leiste({
      titel: n ? mz(n, 'entry', 'entries') + ' not saved yet' : a ? 'Draft: ' + mz(a, 'change waiting', 'changes waiting') : 'Everything is published',
      satz: n ? 'Save puts them in the draft. Only what you publish appears on the website.' : a ? 'Saved. Not on the website yet.' + (s.fehlt ? ' ' + mz(s.fehlt, 'translation missing', 'translations missing') + '.' : '') :
        z ? 'Last published ' + zeit(z.zeit) + (z.notiz ? ' · ' + z.notiz : '') + '.' : 'The website is as built.',
      entwurf: !!a && !n,
      knoepfe: (fn('leiste_klar') && !(a || n) ? '' : WO.knopf('Before/After', 'auge', 'glas', { id: 'ws-vgl', klein: true, disabled: !(a || n) }))
        + WO.knopf(gesp ? 'Saved' : 'Save', gesp ? 'haken' : 'pfeil', n ? 'wartet' : gesp ? 'fertig' : 'glas', { id: 'ws-speichern', klein: true, attr: `data-ws-lage="${n ? 'offen' : gesp ? 'gespeichert' : 'ruhig'}"` })
        + (fn('leiste_klar') && !(a && !n) ? '' : WO.knopf('Publish', 'hoch', 'gold', { id: 'ws-raus', klein: true, disabled: !(a && !n), titel: n ? 'Save first' : '' }))
    });
    const sp = $('#ws-speichern'); sp.querySelector('span').id = 'ws-speichern-text';
    sp.addEventListener('click', speichern);
    if ($('#ws-vgl')) $('#ws-vgl').addEventListener('click', () => geh(vglZiel()));
    if ($('#ws-raus')) $('#ws-raus').addEventListener('click', veroeffentlichen);
    return;
  }
  l.append(el('div', { class: 'ws-leiste__t' },
    el('b', {}, a && !n ? el('span', { class: 'marke' }, 'Draft') : null,
      el('span', {}, n ? mz(n, 'entry', 'entries') + ' not saved yet' : a ? 'Draft: ' + mz(a, 'change waiting', 'changes waiting') : 'Everything is published')),
    el('span', {}, n ? 'Save puts them in the draft. Only what you publish appears on the website.' :
      a ? ['Saved. Not on the website yet.', s.fehlt ? el('span', { 'data-ws-fehlt': s.fehlt }, ' ' + mz(s.fehlt, 'translation missing', 'translations missing') + '.') : null] :
      z ? 'Last published ' + zeit(z.zeit) + (z.notiz ? ' · ' + z.notiz : '') + '.' : 'The website is as built.')));
  const sp = el('button', { class: 'kn ws-speichern' + (n ? ' ws-zu-tun' : ''), id: 'ws-speichern', type: 'button', 'data-ws-lage': n ? 'offen' : gesp ? 'gespeichert' : 'ruhig', onclick: speichern },
    el('span', { id: 'ws-speichern-text' }, gesp ? 'Saved' : 'Save'), el('i', { 'aria-hidden': 'true', html: gesp ? HAKEN : PF }));
  l.append(sp, kn('Before/After', () => geh(vglZiel()), 'kn--d', { id: 'ws-vgl', disabled: !(a || n) }),
    kn('Publish', veroeffentlichen, 'ws-kn-metall', { id: 'ws-raus', disabled: !(a && !n), title: n ? 'Save first' : null }));
}
function allesNeu() { kopf(); rand(); leiste(); }
function vglZiel() {   // «Vorher, nachher»: der Vergleich des Stamms; warten nur eigene Ansichten, deren Ansicht (dort steht vorher und nachher)
  const e = eigen().find(x => (x.offen && x.offen()) || (x.wartet && x.wartet()));
  return !Object.keys(Z.offen).length && !aend().length && e ? 'e:' + e.key : 'entwurf';
}

// ---------------------------------------------------------------- Vormerken, Speichern, Rückgängig, Konflikt
function vormerken(key, op) { Z.offen[key] = op; leiste(); }
function vergessen(key) { if (key in Z.offen) { delete Z.offen[key]; leiste(); } }
async function ladeStand() { Z.stand = await ruf('GET', X('stand/' + HAUS)); allesNeu(); dxAngNeu(); return Z.stand; }
/* Abnahme 28.11.2026: Öffnungszeit und Telefon in der Seitenleiste standen nach dem Speichern noch auf dem alten Wert, bis die Übersicht geöffnet wurde.
   Nach jedem Speichern, Zurücknehmen, Verwerfen und Zurückholen neu holen (nur wenn sie schon einmal geholt sind: beim Start holt dxRand sie selbst). */
function dxAngNeu() { if (DX && dxAng) dxAngaben(true).then(x => { if (x) dxRand(); }); }

async function sende(ops, opt = {}) {
  let a;
  try {
    a = await ruf('POST', X('aendern/' + HAUS), { ops, erwartet: Z.stand.kennung, wer: wer() });
  } catch (e) {
    if (e.status === 409) return konflikt(ops, opt);
    fehler(e); return false;
  }
  Z.stand = a.stand;
  dxAngNeu();
  if (opt.eingaben) Z.offen = {};
  if (a.nichts) { melde(a.meldung); allesNeu(); await zeichne({ halten: true }); return true; }
  Z.gesp = Date.now() + 6000;
  setTimeout(leiste, 6100);
  allesNeu();
  quittung(opt.titel || 'Saved', a.quittung, a.vorher_daten);
  await zeichne({ halten: true, neuLaden: true });
  return true;
}
async function speichern() {
  const ops = Object.values(Z.offen), eig = eigen().filter(e => e.offen && e.offen());
  if (!ops.length && !eig.length) { melde('Nothing changed, nothing saved.'); return; }
  for (const e of eig) { if (!(await e.speichern())) return; }   // eigene Ansichten speichern selbst (Quittung, Konflikt), danach der Stamm
  if (ops.length) await sende(ops, { eingaben: true }); else { Z.gesp = Date.now() + 6000; setTimeout(leiste, 6100); allesNeu(); }
}
async function rueckgaengig(vorherDaten, karte) {
  try {
    await ruf('PUT', '/the-cat-and-gun/haus/api/entwurf/' + HAUS + '/' + W, { daten: vorherDaten, erwartet: Z.stand.kennung, wer: wer() });
  } catch (e) {
    if (e.status === 409) { await ladeStand(); melde('Someone else saved in the meantime.', { mehr: 'Undo would have overwritten their change, so it was not done. You can undo single changes under “Draft & compare”.', stichwort: 'konflikt' }); return; }
    fehler(e); return;
  }
  if (karte) karte.remove();
  Z.gesp = 0;
  await ladeStand();
  melde('Undone', { mehr: 'The draft is back to how it was before this save.' });
  await zeichne({ halten: true, neuLaden: true });
}
async function konflikt(ops, opt) {
  const vorher = aend();
  try { await ladeStand(); } catch (e) { fehler(e); return false; }
  const alt = new Map(vorher.map(a => [a.key, a.nachher]));
  const fremd = aend().filter(a => alt.get(a.key) !== a.nachher);
  const meine = new Set(ops.flatMap(o => (o.orte || [{ seite: o.seite, n: o.n }]).map(x => [o.art, x.seite, o.h || o.b, x.n].join('|'))));
  const gleiche = fremd.filter(a => meine.has(a.key));
  const inhalt = el('div', { class: 'ws-form' },
    el('p', {}, 'Someone else saved in another window in the meantime. Your entry is not lost and nothing was overwritten.'),
    fremd.length ? el('div', {}, mono('New from the other window'), el('div', { class: 'ws-liste-klein' }, fremd.slice(0, 6).map(a => el('p', {}, a.wo + ': ' + anf(kurz(a.nachher, 260)))))) : null,
    gleiche.length ? el('p', { 'data-ws-gleiche': '1' }, 'Careful: this spot was also changed in the other window. It now says ' + anf(kurz(gleiche[0].nachher, 110)) + '. If you save, your entry replaces this text.') :
      el('p', {}, 'Your entry is for a different spot. You can save it on top of the new version. Both changes stay.'));
  return new Promise(fertig => {
    fenster('Two people', 'changed this at once.', inhalt, [
      { text: 'Discard my entry', tun: zu => { zu(); if (opt.eingaben) Z.offen = {}; allesNeu(); zeichne({ halten: true, neuLaden: true }); fertig(false); } },
      { text: 'Save my entry', haupt: true, tun: async zu => { zu(); fertig(await sende(ops, opt)); } }], { name: 'konflikt' });
  });
}

// ---------------------------------------------------------------- Navigation und Titel
async function geh(ansicht, opt = {}) {
  $('#ws-rand').classList.remove('ws-offen');
  if (ansicht === 'vergleich') ansicht = 'entwurf';
  Z.ansicht = ansicht;
  Z.wahl = opt.zeige || null;
  if (opt.seite) { if (ansicht === 'entwurf') Z.vgl.seite = opt.seite; else Z.seite = opt.seite; }
  try { localStorage.setItem('ws-ort-' + HAUS, JSON.stringify({ a: Z.ansicht, s: Z.seite })); } catch (e) { /* ohne Merken */ }
  allesNeu();
  await zeichne(opt);
  if (!opt.halten) window.scrollTo(0, 0);
}
function titel(klein, a, b, satz, knoepfe, knapp, foto) {
  if (DX) return dxKopf({ mono: wname(W) + ' · ' + klein, h: ansichtName(Z.ansicht) || [a, b].filter(Boolean).join(' '), satz, foto: dxFoto(null), klein: true, knoepfe: knoepfe || [] });
  if (WOM) {   // Startbild des Hauses: Übersicht «voll» mit dem Aussenfoto, jede andere Ansicht «buehne» (UMSTELLUNG.md)
    const h = el('div', { class: 'ws-titel ws-titel--wo', html: WO.startbild({ werkzeug: W, zier: WO.esc(klein), h1: WO.esc(a ? a + ' ' : '') + (b ? '<em>' + WO.esc(b) + '</em>' : ''), satz: satz ? WO.esc(satz) : '',
      knoepfe: knoepfe && knoepfe.length ? ' ' : '', art: Z.ansicht === 'start' ? 'voll' : 'buehne', foto: Z.ansicht === 'start' ? '' : titelFoto() }) });
    const kn = h.querySelector('.wo-sb__kn'); if (kn) { kn.textContent = ''; kn.append(...knoepfe); }
    return h;
  }
  const z = zeichenBild(true);
  return el('header', { class: 'ws-titel' + (knapp ? ' ws-titel--knapp' : '') + (foto ? ' ws-titel--foto' : '') },
    el('div', { class: 'ws-titel__t' }, el('span', { class: 'ws-zier' }, knapp ? null : el('i'), z, el('span', {}, klein), el('i')),
      el('h1', {}, a ? a + ' ' : '', b ? el('em', {}, b) : null), satz ? el('p', { class: 'ws-satz' }, satz) : null,
      foto && knoepfe && knoepfe.length ? el('div', { class: 'ws-titel__kn' }, knoepfe) : null),
    !foto && knoepfe && knoepfe.length ? el('div', { class: 'ws-titel__kn' }, knoepfe) : null,
    foto ? el('figure', { class: 'ws-titel__foto' }, el('img', { src: bild(foto), alt: '', decoding: 'async' })) : null);
}
function titelFoto() {   // Bühne einer Ansicht: das Foto ihres Bereichs der Website, sonst das Aussenfoto des Hauses
  const b = Z.ansicht.startsWith('b:') ? webBereich(Z.ansicht.slice(2)) : null;
  return b && b.foto_gross ? bild(b.foto_gross) : '';
}
function zweiteilig(name) { const m = /^(\S+)\s+(.*)$/.exec(name); return m ? [m[1], m[2]] : ['', name]; }

// ---------------------------------------------------------------- Neuer Look (Robert 24.11.2026): Bausteine der gewählten Fassung im Look des Control panel
/* Gewählt: _entwurf-dashboard/website-bereich/gewaehlt.html. A = Übersicht wie Fassung 1 (Kopf mit Reitern, Often used, Pages, On every page, Leiste),
   B = in einer Seite wie Fassung 17 (Seiten als Reiter, Vorschau links, Abschnitte rechts). Klassen mit Vorsilbe dx- (dash.css, gebaut aus den Bausteinen der Vorlage).
   Nur wo das Kleid des Hauses WO_HAUS.dash setzt; Ids, data-Attribute und Klick-Wege des Werkzeugs bleiben wie vorher. */
const DX = WOM && !!(window.WO_HAUS && WO_HAUS.dash);
const DXC = DX ? WO_HAUS.dash : {};
const DI = {
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
  megafon: '<path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1Z"/><path d="M17 8a5 5 0 0 1 0 8"/>',
  uhr: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  foto: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  auge: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  check: '<path d="m5 12 4 4 10-10"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  tel: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  stift: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
  kalender: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  verlauf: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  vergleich: '<rect x="3" y="4" width="8" height="16" rx="2"/><rect x="13" y="4" width="8" height="16" rx="2"/><path d="M6 9h2M6 13h2M16 9h2M16 13h2"/>',
  speichern: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',
  senden: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
  preis: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.4"/>',
  glas: '<path d="M6 3h12l-1.5 8a4.5 4.5 0 0 1-9 0z"/><path d="M12 15.5V21M8 21h8"/>',
  rutsche: '<path d="M4 20h16M6 20V7l4-3 4 3v13M14 7l6 9"/>',
  kugel: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.6"/>',
  zurueck: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  lupe: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  verbergen: '<path d="M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3 3.6M6.6 6.6C3.9 8.3 2 12 2 12s3.6 7 10 7c1.7 0 3.2-.4 4.5-1"/>',
  schild: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4"/>',
  menue: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  winkel: '<path d="m6 9 6 6 6-6"/>'
};
const E_ = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dic = (n, c) => `<svg class="${c || 'dx-ico'}" viewBox="0 0 24 24" aria-hidden="true">${DI[n] || DI.pfeil}</svg>`;
const dpf = () => `<span class="dx-pf">${dic('pfeil')}</span>`;
const dxWk = (text, ic, art, attrs = {}) => el(attrs.href ? 'a' : 'button', Object.assign(attrs.href ? {} : { type: 'button' }, { class: 'dx-wk' + (art ? ' dx-' + art : '') }, attrs), el('span', { html: dic(ic), 'aria-hidden': 'true', class: 'dx-wk__i' }), el('span', {}, text));
const dxSt = (ic, t, s) => el('div', { class: 'dx-stitel' }, el('span', { class: 'dx-snr', html: dic(ic) }), el('div', {}, el('h3', {}, t), el('span', { class: 'dx-mono' }, s)));
let dxAng = null;   // Angaben (Telefon, Adresse, Zeiten) für Rand und Übersicht, einmal geholt und nach jedem Speichern neu
async function dxAngaben(neu) {
  if (!DX || !Z.info.angaben) return null;
  if (dxAng && !neu) return dxAng;
  try { const d = await ruf('GET', X('angaben/' + HAUS)); dxAng = Object.fromEntries(d.angaben.map(a => [a.key, a])); } catch (e) { /* ohne Angaben: Rand ohne diese Zeilen */ }
  return dxAng;
}
const dxStunden = a => a && a.auf && a.zu ? a.auf.wert + ' – ' + a.zu.wert : '';
function dxRand() {
  const r = leere($('#ws-rand')), ae = aend(), z = Z.stand && Z.stand.zuletzt, n = ae.length + eigenZahl('wartet');
  r.className = 'wo-rand dx-rail dx-lack6';
  const eigenStand = n ? mz(n, 'change', 'changes') + ' in the draft' : z ? 'Published ' + tag(z.zeit) : 'As built';
  const reihen = (DXC.werkzeuge || []).map((w, i) => {
    const hier = w[0] === 'bureau';
    return `<a class="${hier ? 'dx-jetzt' : ''}" href="${hier ? '?ansicht=start' : '/the-cat-and-gun/haus/_werkzeuge/' + w[0] + '/'}"${hier ? ' aria-current="page" data-dx-hier="1"' : ''} data-dx-taste="${i + 1}"><kbd>${i + 1}</kbd>${dic(w[2])}<span><b>${E_(w[1])}</b><i>${E_(hier ? eigenStand : w[3])}</i></span>${hier && n ? `<em>${n}</em>` : ''}</a>`;
  }).join('');
  const a = dxAng, std = dxStunden(a);
  r.innerHTML = `<div class="dx-s6rahmen"><div class="dx-marke"><a href="/the-cat-and-gun/haus/_werkzeuge/maison/" title="Control panel" data-dx-zentrale="1"><img src="${E_(DXC.marke)}" alt="The Cat &amp; Gun · Control panel"></a><span class="dx-mono">${E_(DXC.ort || '')}</span>
      <button class="dx-rmenue" type="button" aria-expanded="false" data-wo-rand-knopf>${dic('menue')}<span>Tools</span></button></div>
    <div class="dx-mono dx-rk">Tools <span>keys 1–8</span></div><nav aria-label="Tools of the house">${reihen}</nav>
    ${std || (a && a.telefon) ? `<div class="dx-rhaus">${std ? `<span>${dic('uhr')}Open daily ${E_(std)}</span>` : ''}${a && a.telefon ? `<span>${dic('tel')}${E_(a.telefon.wert)}</span>` : ''}</div>` : ''}
    <div class="dx-rfuss">
      <a href="/the-cat-and-gun/haus/_werkzeuge/maison/" data-dx-zentrale="1">${dic('haus')}<span><b>Control panel</b><i>All tools of the house</i></span></a>
      ${Z.info.anleitung ? `<a href="${E_(Z.info.anleitung)}" target="_blank" rel="noopener" data-ws-anleitung="1">${dic('buch')}<span><b>Guide</b><i>How Edit website works</i></span></a>` : ''}
      <a href="?rundgang" class="rdg-wieder" data-dx-rundgang="1">${dic('auge')}<span><b>Short tour</b><i>What is where in this tool</i></span></a>
      <a href="${E_(pruefLink(''))}" data-ws-nav="pruefung">${dic('schild')}<span><b>Checks</b><i>Is everything working?</i></span></a>
      ${DXC.guides ? `<a href="${E_(DXC.guides)}" target="_blank" rel="noopener">${dic('guide')}<span><b>Guides</b><i>${E_(DXC.guidesZahl || '')}</i></span></a>` : ''}
    </div></div>`;
  const rdg = r.querySelector('[data-dx-rundgang]');
  if (rdg) rdg.addEventListener('click', ev => { if (!window.rundgang) return; ev.preventDefault(); document.documentElement.classList.remove('wo-rand-auf'); window.rundgang(); });
  const hier = r.querySelector('[data-dx-hier]');
  if (hier) hier.addEventListener('click', ev => { ev.preventDefault(); geh('start'); });
  if (!dxAng && Z.info.angaben) dxAngaben().then(x => { if (x) dxRand(); });
  mitfahren(r, window);   // einmal je Seite (merkt sich data-nl-fahrt), die Leiste selbst bleibt dasselbe Element
}
/* Seitenleiste fährt mit (Robert 27.11.2026), übernommen aus dem Sticker editor (sticker/neu.js › mitfahren, a284a0fd), gleiche Werte: Rand 22 px, ab 1200 px Breite.
   Ist sie höher als das Fenster, scrollt sie mit der Seite, bis ihr unteres Ende am Fensterrand steht, und bleibt dort;
   beim Hochscrollen fährt sie mit zurück, bis ihr oberes Ende wieder oben steht. Passt sie ganz ins Fenster, steht sie oben fest. Darunter (Handy) wie bisher. */
function mitfahren(rail, scroller) {
  if (!rail || rail.dataset.nlFahrt) return; rail.dataset.nlFahrt = '1';
  let y = null, letzt = 0;
  const rand = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nl-rand')) || 22;
  const pos = () => scroller === window ? scrollY : scroller.scrollTop;
  function setze() {
    if (innerWidth < 1200 || !rail.offsetHeight) { rail.style.removeProperty('top'); y = null; return; }
    const m = rand(), h = rail.offsetHeight, H = innerHeight, unten = Math.min(m, H - h - m), p = pos();
    if (y === null) { y = m; letzt = p; }
    y = Math.max(unten, Math.min(m, y - (p - letzt))); letzt = p;
    rail.style.setProperty('top', y + 'px', 'important');
  }
  (scroller === window ? window : scroller).addEventListener('scroll', setze, { passive: true });
  addEventListener('resize', setze);
  new ResizeObserver(setze).observe(rail);
  if (scroller !== window) rail.addEventListener('wheel', e => { if (innerWidth >= 1200 && !e.ctrlKey) { scroller.scrollTop += e.deltaY; e.preventDefault(); } }, { passive: false });
  setze();
}
document.addEventListener('keydown', ev => {   // «keys 1–8» wie im Control panel: Ziffer ohne Umschalttaste, nie beim Schreiben
  if (!DX || ev.metaKey || ev.ctrlKey || ev.altKey || !/^[1-8]$/.test(ev.key)) return;
  const t = ev.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) || $('#ws-fenster').childElementCount) return;
  const a = $(`#ws-rand [data-dx-taste="${ev.key}"]`); if (a) { ev.preventDefault(); a.click(); }
});
function dxReiter() {
  const ziel = [['start', 'Overview'], ['b:' + Z.info.website[0].key, 'Pages'], Z.info.angaben ? ['angaben', TITEL.angaben] : null, Z.info.zahlen ? ['zahlen', TITEL.zahlen] : null,
    Z.info.hinweis ? ['hinweis', TITEL.hinweis] : null, ['verlauf', TITEL.verlauf]].filter(Boolean);
  return el('nav', { class: 'dx-tabs', 'aria-label': 'Sections of Edit website' }, ziel.map(([a, t]) => {
    const an = a.startsWith('b:') ? Z.ansicht.startsWith('b:') : Z.ansicht === a;
    return el('button', { type: 'button', class: 'dx-tab' + (an ? ' dx-an' : ''), 'aria-current': an ? 'page' : null, 'data-ws-nav': a, onclick: () => geh(a) }, t);
  }));
}
function dxStand() {
  const n = offenZahl(), a = aend().length + eigenZahl('wartet'), z = Z.stand && Z.stand.zuletzt;
  return n ? { t: mz(n, 'entry', 'entries') + ' not saved yet', p: 'dx-gold' } : a ? { t: 'Draft: ' + mz(a, 'change waiting', 'changes waiting'), p: 'dx-gold' } : { t: z ? 'Last published ' + tag(z.zeit) : 'As built', p: 'dx-gr' };
}
function dxKopf(o) {   // Kopfkarte mit geschwungenem Foto (Vorlage kopf() / seitenkopf())
  const s = dxStand();
  const kn = o.knoepfe === undefined ? [
    dxWk('View website', 'auge', '', { href: Z.info.online + (Z.ansicht.startsWith('b:') ? Z.seite : Z.info.seiten[0].datei), target: '_blank', rel: 'noopener' }),
    dxWk('Draft & compare', 'vergleich', '', { 'data-dx-spiegel': 'vgl', onclick: () => geh(vglZiel()) }),
    dxWk('Publish', 'senden', 'gold', { 'data-dx-spiegel': 'raus', onclick: veroeffentlichen })] : o.knoepfe;
  const h = el('header', { class: 'dx-wkopf dx-p' + (o.klein ? ' dx-klein' : ''), 'data-ws-kopfkarte': Z.ansicht },
    el('div', { class: 'dx-wkb', style: `background-image:url('${o.foto}')` }),
    el('div', { class: 'dx-wki' }, el('div', { class: 'dx-mono', html: dic('web', 'dx-mi') + E_(o.mono) }),
      el('h1', { class: 'dx-h' + (o.h.length > 10 ? ' dx-lang' : '') }, o.h), o.satz ? el('p', {}, o.satz) : null,
      o.status !== false || (kn && kn.length) ? el('div', { class: 'dx-wkst' }, o.status !== false ? el('span', { class: 'dx-stp', 'data-dx-stand': '1' }, el('i', { class: 'dx-pt ' + s.p }), el('span', {}, s.t)) : null, kn || []) : null),
    dxReiter());
  return h;
}
function dxSpiegel() {   // Knöpfe der Kopfkarte folgen den Knöpfen der Leiste (gleiche Sperre), Stand-Zeile ebenso
  const vgl = $('#ws-vgl'), raus = $('#ws-raus'), s = dxStand();
  $$('[data-dx-spiegel="vgl"]').forEach(k => { k.hidden = !vgl; k.disabled = !!(vgl && vgl.disabled); });
  $$('[data-dx-spiegel="raus"]').forEach(k => { k.hidden = !raus; k.disabled = !!(raus && raus.disabled); k.title = raus ? raus.title : ''; });
  $$('[data-dx-stand]').forEach(k => { k.firstChild.className = 'dx-pt ' + s.p; k.lastChild.textContent = s.t; });
}
function dxLeiste() {
  const l = leere($('#ws-leiste')), s = Z.stand, n = offenZahl(), a = aend().length + eigenZahl('wartet'), gesp = !n && Z.gesp > Date.now(), st = dxStand();
  l.classList.add('dx-wleist', 'dx-p');
  const sp = dxWk(gesp ? 'Saved' : 'Save', gesp ? 'check' : 'speichern', n ? 'wartet' : '', { id: 'ws-speichern', 'data-ws-lage': n ? 'offen' : gesp ? 'gespeichert' : 'ruhig', onclick: speichern });
  sp.lastChild.id = 'ws-speichern-text';
  l.append(el('div', { class: 'dx-wleist__t' }, el('span', { class: 'dx-stp' }, el('i', { class: 'dx-pt ' + st.p }), el('b', {}, st.t)),
      el('small', {}, n ? 'Save puts them in the draft. Only what you publish appears on the website.' : a ? 'Saved. Not on the website yet.' + (s.fehlt ? ' ' + mz(s.fehlt, 'translation missing', 'translations missing') + '.' : '') : (s.zuletzt && s.zuletzt.notiz ? 'Note: ' + s.zuletzt.notiz + ' · ' : '') + 'Cmd + S saves')),
    el('div', { class: 'dx-wr' }, sp,
      fn('leiste_klar') && !(a || n) ? null : dxWk('Draft & compare', 'vergleich', '', { id: 'ws-vgl', disabled: !(a || n), onclick: () => geh(vglZiel()) }),   // Fehlerbuch: ohne Entwurf keine ausgegrauten Knöpfe
      fn('leiste_klar') && !(a && !n) ? null : dxWk('Publish', 'senden', 'gold', { id: 'ws-raus', disabled: !(a && !n), title: n ? 'Save first' : null, onclick: veroeffentlichen })));
  dxSpiegel();
}
function dxFoto(b) { return bild(b && b.foto_gross ? b.foto_gross : 'assets/bild/b24-1200.webp'); }   // 1200 gibt es von jedem Foto (1800 nicht, z. B. b09)
function dxStart() {
  const m = leere($('#ws-mitte')), i = Z.info, ae = aend(), erster = 'b:' + i.website[0].key;
  const ZIEL = { text: erster, foto: erster, angaben: 'angaben', hinweis: 'hinweis', zahlen: 'zahlen', verlauf: 'verlauf' };
  const namen = i.website.map(b => b.name);
  m.append(dxKopf({ mono: wname(W) + ' · ' + i.name, h: 'Website', foto: bild('assets/bild/b24-1800.webp'),
    satz: mz(namen.length, 'page', 'pages').replace(/^\d+/, x => ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'][+x] || x) + ': ' + namen.slice(0, -1).join(', ') + ' and ' + namen[namen.length - 1] + '. Click a text or a photo on a page to change it.' }));
  const oft = el('div', { class: 'dx-wof dx-c6' }, (DXC.oft || []).filter(o => ZIEL[o[4]] && (ZIEL[o[4]].startsWith('b:') || ansichtName(ZIEL[o[4]]))).map(o =>
    el('button', { type: 'button', class: 'dx-o2 dx-p', 'data-gehe': ZIEL[o[4]], onclick: () => geh(ZIEL[o[4]]) },
      el('span', { class: 'dx-o2b', style: `background-image:url('${bild('assets/bild/' + o[3] + '-480.webp')}')` }), el('span', { class: 'dx-o2i', html: dic(o[0]) }), el('b', {}, o[1]), el('i', {}, o[2]))));
  const seiten = el('div', { class: 'dx-wsk dx-c3' }, i.website.map(b => {
    const c = (DXC.seiten || {})[b.key] || ['web'], wart = ae.filter(x => b.seiten.some(s => s.datei === x.seite)).length;
    return el('button', { type: 'button', class: 'dx-sk dx-p', title: b.satz, 'data-ws-bk': b.key, 'data-gehe': 'b:' + b.key, onclick: () => geh('b:' + b.key) },
      el('span', { class: 'dx-skb', style: `background-image:url('${bild(b.foto_gross || b.foto).replace(/-1200\.webp$/, '-800.webp')}')` }),
      el('span', { class: 'dx-ski', html: dic(c[0]) }),
      el('span', { class: 'dx-skt' }, el('b', {}, b.name), el('i', { 'data-dx-abschn': b.seiten[0].datei }, wart ? mz(wart, 'change', 'changes') + ' waiting' : mz(b.seiten.length, 'page', 'pages')),
        el('em', { class: 'dx-mlink', html: c[1] ? dic('menu', 'dx-mi') + E_(c[1]) : dic('stift', 'dx-mi') + 'Texts &amp; photos' })),
      el('span', { class: 'dx-skp', html: dpf() }));
  }));
  m.append(dxSt('stift', 'Often used', 'The jobs that come up most often'), oft, dxSt('web', 'Pages', 'Each page with its photo'), seiten);
  // Abschnitte je Seite zählen (Fassung 1: «12 sections»): echte Abschnitte der Seite, ohne Kopf, Fuss und übrige Texte
  i.website.forEach(b => ruf('GET', X('seite/' + HAUS + '/' + encodeURIComponent(b.seiten[0].datei))).then(v => {
    const n = v.gruppen.filter(g => g.h && !g.fest).length, ort = $(`[data-dx-abschn="${b.seiten[0].datei}"]`, m);
    const wart = ae.filter(x => b.seiten.some(s => s.datei === x.seite)).length;
    if (ort && n) ort.textContent = mz(n, 'section', 'sections') + (wart ? ' · ' + wart + ' waiting' : '');
  }).catch(() => { /* Zahl bleibt bei «1 page» */ }));
  const reihe1 = el('div', { class: 'dx-r dx-r2' }), reihe2 = el('div', { class: 'dx-r dx-r2' });
  if (i.angaben) {
    const det = el('section', { class: 'dx-wdt dx-p', 'data-dx-karte': 'angaben' }, el('div', { class: 'dx-kopf' }, el('div', {}, el('div', { class: 'dx-mono', html: dic('uhr', 'dx-mi') + 'Phone, address &amp; hours' }), el('h4', {}, 'Changed once, shown on all ' + (['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'][i.seiten.length] || i.seiten.length) + ' pages'))),
      el('ul', { class: 'dx-dl', 'data-dx-angaben': '1' }, el('li', {}, el('span', { class: 'dx-mono' }, 'Loading …'))),
      el('div', { class: 'dx-dfuss' }, el('button', { type: 'button', class: 'dx-link', html: 'Where exactly? ' + dpf(), onclick: () => geh('angaben') }), el('button', { type: 'button', class: 'dx-link', html: 'Edit ' + dpf(), onclick: () => geh('angaben') })));
    reihe1.append(det);
    dxAngaben(true).then(a => {
      const ul = $('[data-dx-angaben]', det); if (!ul) return; leere(ul);
      if (!a) { ul.append(el('li', {}, el('span', {}, 'Phone, address and hours are under “Phone, address & hours”.'))); return; }
      const zeile = (ic, l, v, alle) => el('li', {}, el('span', { class: 'dx-dsym', html: dic(ic) }), el('div', {}, el('i', {}, l), el('b', {}, v || ' ')), el('span', { class: 'dx-mono' }, alle));
      if (a.telefon) ul.append(zeile('tel', 'Phone · also the call link', a.telefon.wert, 'All ' + a.telefon.seiten + ' pages'));
      if (a.adresse) ul.append(zeile('pin', 'Address', a.adresse.wert, 'All ' + a.adresse.seiten + ' pages'));
      if (a.auf && a.zu) ul.append(zeile('uhr', 'Opening hours', 'Open daily ' + dxStunden(a), 'All ' + Math.max(a.auf.seiten, a.zu.seiten) + ' pages'));
    });
  }
  if (i.hinweis) {
    const h = (Z.offen.hinweis || Z.stand.daten.hinweis || {}), an = !!h.an;
    const feld = (ic, wert, platz, gross) => el('div', { class: 'dx-feld2' + (gross ? ' dx-gross' : '') + (wert ? ' dx-voll' : '') }, ic ? el('span', { html: dic(ic, 'dx-mi') }) : null, el('span', {}, wert || platz));
    reihe1.append(el('section', { class: 'dx-wno dx-p', 'data-dx-karte': 'hinweis' },
      el('div', { class: 'dx-kopf' }, el('div', {}, el('div', { class: 'dx-mono', html: dic('megafon', 'dx-mi') + 'Notice for guests' }), el('h4', {}, 'A line on top of every page')),
        el('div', { class: 'dx-seg', 'aria-label': 'The notice is ' + (an ? 'on' : 'off') }, el('span', { class: an ? 'dx-an' : '' }, 'On'), el('span', { class: an ? '' : 'dx-an' }, 'Off'))),
      feld(null, h.text, 'One or two sentences, for example when you are closed for a day.', true), feld('web', h.link, 'Link (optional)'),
      el('div', { class: 'dx-dat' }, feld('kalender', datumZeigen(h.von), 'Start date'), feld('kalender', datumZeigen(h.bis), 'End date')),
      el('p', { class: 'dx-hin' }, 'With both dates it shows and goes away by itself. Without dates it shows until you switch it off.'),
      el('div', { class: 'dx-dfuss' }, el('span'), el('button', { type: 'button', class: 'dx-link', html: 'Edit ' + dpf(), onclick: () => geh('hinweis') }))));
  }
  const z = Z.stand.zuletzt;
  reihe2.append(el('section', { class: 'dx-wve dx-p', 'data-dx-karte': 'verlauf' }, el('div', { class: 'dx-mono', html: dic('verlauf', 'dx-mi') + 'Earlier versions' }), el('h4', {}, 'Every publish is kept'),
      el('div', { class: 'dx-ver' }, el('span', { class: 'dx-dsym', html: dic('check') }), el('div', {}, el('b', {}, z ? tag(z.zeit) : 'As built'), el('i', {}, z ? 'Published · on the website now' : 'The website as it was built')),
        dxWk('Restore', 'zurueck', '', { onclick: () => geh('verlauf') })),
      el('p', {}, '«Restore» puts a version in the draft. It goes on the website when you publish again.')),
    el('section', { class: 'dx-wab2 dx-p', 'data-dx-karte': 'ablauf' }, el('div', { class: 'dx-mono', html: dic('senden', 'dx-mi') + 'Save, compare, publish' }), el('h4', {}, 'Nothing goes online by itself'),
      el('div', { class: 'dx-flow', html: [['speichern', 'Save'], ['vergleich', 'Draft &amp; compare'], ['senden', 'Publish']].map(([ic, t], n) => (n ? `<span class="dx-fl-p">${dic('pfeil')}</span>` : '') + `<span class="dx-fl-s"><span class="dx-fl-i">${dic(ic)}</span>${t}</span>`).join('') }),
      el('p', {}, '«Draft & compare» shows every change with the old and the new wording. Each one can be undone by itself.')));
  m.append(dxSt('uhr', 'On every page', 'Details kept in one place'), reihe1, reihe2);
}
function dxSeitenReiter() {   // Fassung 17: alle Seiten der Website als Reiter mit ihrem Foto
  return el('nav', { class: 'dx-reiter dx-p', 'aria-label': 'Pages of the website' }, Z.info.website.map(b => {
    const an = Z.ansicht === 'b:' + b.key;
    return el('button', { type: 'button', class: 'dx-rt' + (an ? ' dx-an' : ''), 'aria-current': an ? 'page' : null, 'data-ws-seite-reiter': b.key, onclick: () => geh('b:' + b.key) },
      el('img', { src: bild(b.foto), alt: '', decoding: 'async' }), el('span', {}, b.name));
  }));
}

// ---------------------------------------------------------------- Vorschau: die Seite des Hauses im Rahmen
function vorschau(zustand, seite, sprache, kopfzeile) {
  const frame = el('iframe', { title: (zustand === 'vorher' ? 'Published: ' : zustand === 'nachher' ? 'Draft: ' : 'Preview: ') + seite, 'data-ws-frame': zustand });
  const lage = el('div', { class: 'ws-vorschau__lage' }, el('span', { class: 'ws-mono' }, 'Loading page …'));
  const rahmen = el('div', { class: 'ws-rahmen' }, frame, lage);
  const k = el('section', { class: 'ws-vorschau' + (DX ? ' dx-wfl dx-p' : ''), 'aria-label': 'Page preview' }, kopfzeile || null,
    DX ? el('div', { class: 'dx-flbar' }, el('i'), el('i'), el('i'), el('span', {}, (Z.info.seiten.find(x => x.datei === seite) || {}).name || seite),
      el('a', { href: Z.info.online + seite, target: '_blank', rel: 'noopener', html: 'Open full size ' + dic('pfeil', 'dx-mi') })) : null, rahmen);
  const v = { k, frame, zustand, seite, sprache, bereit: false, nach: null, lauf_: 0 };
  v.passe = () => {
    const handy = schmal() || Z.breite === 'handy';
    rahmen.classList.toggle('ws-rahmen--handy', handy && !schmal());
    const b = rahmen.clientWidth, h = rahmen.clientHeight;
    if (!b || !h) return;
    const m = handy ? 1 : Math.min(1, b / 1440);
    frame.style.width = (handy ? b : 1440) + 'px';
    frame.style.height = Math.round(h / m) + 'px';
    frame.style.transform = m === 1 ? 'none' : 'scale(' + m + ')';
  };
  v.sende = d => { if (frame.contentWindow) frame.contentWindow.postMessage(d, '*'); };
  v.farben = () => { const c = getComputedStyle(document.documentElement); v.sende({ ws: 'farben', a: c.getPropertyValue('--strich').trim(), p: c.getPropertyValue('--punkt').trim() }); };
  v.lade = async halten => {
    const y = halten && frame.contentWindow ? frame.contentWindow.scrollY : 0;
    const lauf = ++v.lauf_;
    lage.hidden = false;
    let a;
    try { a = await ruf('GET', X(['vorschau', HAUS, v.zustand, v.sprache, v.seite].map(encodeURIComponent).join('/'))); } catch (e) { lage.firstChild.textContent = e.fehler || 'The page cannot be loaded.'; fehler(e); return; }
    if (lauf !== v.lauf_) return;
    v.bereit = false;
    await new Promise(fertig => { v.geladen = () => { v.bereit = true; lage.hidden = true; v.farben(); if (y) v.sende({ ws: 'oben', y }); fertig(); }; frame.srcdoc = a.html; setTimeout(fertig, 9000); });
    if (v.nach) { const f = v.nach; v.nach = null; f(); }
  };
  requestAnimationFrame(() => { v.passe(); v.lade(false); });
  return v;
}
window.addEventListener('message', ev => {
  const d = ev.data || {}, v = Z.vs.find(x => x.frame.contentWindow === ev.source);
  if (!v || !d.ws) return;
  if (d.ws === 'geladen') { if (v.geladen) v.geladen(); }
  else if (d.ws === 'text') zeileOeffnen(d.h, d.n);
  else if (d.ws === 'bild') bildFenster({ seite: v.seite, b: d.b, n: d.n });
  else if (d.ws === 'zu') gesperrt(d.werkzeug);
  else if (d.ws === 'gehe' && Z.ansicht.startsWith('b:')) { const b = bereichVon(d.seite); if (b) geh('b:' + b.key, { seite: d.seite }); }
});
window.addEventListener('resize', () => Z.vs.forEach(v => v.passe()));
function gesperrt(werkzeug) {
  const karten = werkzeug === 'karten';
  quit(karten ? 'This menu is kept in the tool ' + anf(wname('karten')) : 'This spot cannot be changed here',
    karten ? 'Change dishes, drinks and prices there. Then the website and the PDF match.' : '',
    karten ? [el('a', { class: 'ws-taste', href: kartenAdresse() }, 'Open ' + wname('karten'))] : [], { 'data-ws-gesperrt': werkzeug });
}

// ---------------------------------------------------------------- Die Stelle zum Ändern (Text), direkt unter ihrer Zeile
const ZT = /\d+(?:[.,:’']\d+)*/g;
function vorschlag(altDe, neuDe, altSpHtml) {
  /* Hat sich im Deutschen nur eine Zahl geändert, steht in der anderen Sprache dieselbe Zahl: Vorschlag mit der neuen Zahl. */
  const a = altDe.match(ZT) || [], b = neuDe.match(ZT) || [];
  if (!a.length || a.length !== b.length || altDe.replace(ZT, '#') !== neuDe.replace(ZT, '#') || a.every((x, i) => x === b[i])) return '';
  const kiste = el('div', { html: altSpHtml });
  const s = kiste.textContent.match(ZT) || [];
  if (s.length !== a.length || s.some((x, i) => x !== a[i])) return '';
  let i = 0;
  const gang = k => k.childNodes.forEach(c => { if (c.nodeType === 3) c.nodeValue = c.nodeValue.replace(ZT, () => b[i++]); else gang(c); });
  gang(kiste);
  return kiste.innerHTML;
}
function textFeld(html, name, opt = {}) {
  const f = el('div', { class: 'ws-text', contenteditable: 'true', role: 'textbox', 'aria-multiline': 'true', 'aria-label': name, 'data-ws-feld': opt.id || name, 'data-zahl': opt.zahl ? '1' : null, spellcheck: 'true', lang: opt.lang || 'de', html });
  f.addEventListener('paste', ev => {   // eingefügt wird nur Text, nie fremde Gestaltung
    ev.preventDefault();
    const t = (ev.clipboardData || window.clipboardData).getData('text/plain'), s = getSelection();
    if (!s.rangeCount) return;
    const b = s.getRangeAt(0);
    b.deleteContents(); b.insertNode(document.createTextNode(t)); b.collapse(false);
    f.dispatchEvent(new Event('input', { bubbles: true }));
  });
  return f;
}
function edZu() { $$('.ws-ed').forEach(x => x.remove()); $$('[aria-pressed="true"].ws-st,[aria-pressed="true"].ws-zl__wert').forEach(x => x.setAttribute('aria-pressed', 'false')); }

async function oeffne(w, knopf, ort, opt = {}) {
  /* w: {seite, h, n, orte?}. knopf: die Zeile, zu der die Stelle gehört. ort: wohin das Formular kommt (sonst direkt unter die Zeile). */
  const lauf = ++Z.lauf;
  let d;
  try { d = await ruf('GET', X(['stelle', HAUS, w.seite, w.h, w.n].map(encodeURIComponent).join('/'))); } catch (e) { return fehler(e); }
  if (lauf !== Z.lauf) return;
  if (d.zu) return gesperrt(d.zu);
  edZu();
  Z.wahl = { art: 'text', seite: w.seite, h: w.h, n: w.n, orte: w.orte || null };
  const key = ['text', w.seite, w.h, w.n].join('|'), p = Z.offen[key];
  const orteFest = w.orte || null, viele = (orteFest || d.gleiche).length;
  let alle = p ? !!(p.orte && !orteFest) : false;
  const de = textFeld(p ? p.neu : d.wert, Z.info.sprachen.length ? 'English' : 'Text', { zahl: d.zahl && d.original_text.length < 40, id: 'de' });
  const hinweis = el('p', { class: 'ws-klein', hidden: true });
  const sp = {};
  const ed = el('div', { class: 'ws-ed', 'data-ws-form': 'text', 'data-ws-wahl': key });
  const bei = [d.ober, d.vor].filter(x => x && x !== d.abschnitt).join(' · ');
  ed.append(mono((TAGNAME[d.tag] || 'Text') + (Z.ansicht.startsWith('b:') ? '' : ' · ' + d.seite_name) + (bei ? ' · near ' + bei : '') + (/<(em|i)\b/.test(d.original) ? ' · Italic stays italic' : '')), de, hinweis);
  const zeile_ = el('div', { class: 'ws-ed__z' });
  const schalter = !orteFest && viele > 1 ? el('button', { class: 'ws-schalter', type: 'button', role: 'switch', 'aria-checked': alle ? 'true' : 'false', 'data-ws-alle': viele,
    onclick: () => { alle = !alle; schalter.setAttribute('aria-checked', alle ? 'true' : 'false'); merk(); } }, 'Change it in all ' + viele + ' spots with exactly this text') : null;
  if (orteFest) ed.append(el('p', { class: 'ws-klein', 'data-ws-orte': viele }, viele > 1 ? 'This detail is in ' + viele + ' spots on the website. They all change together.' : 'This detail is in one spot.'));
  /* Abnahme 28.11.2026: «Back to original» steht da, sobald getippt ist (vorher erst nach Schliessen und erneutem Öffnen der Zeile: eine frische Eingabe liess sich
     im Feld nicht verwerfen). Ohne gespeicherte Änderung nimmt der Knopf nur die Eingabe zurück, die Vorschau zeigt wieder den Text von vorher. */
  const zurueck = link('Back to original', () => { vergessen(key); if (d.geaendert) sende((orteFest || [{ seite: d.seite, n: d.n }]).map(o => ({ art: 'weg', key: ['text', o.seite, d.h, o.n].join('|') })), { titel: 'Undone' });
    else { if (Z.ansicht.startsWith('b:') && Z.vs[0] && Z.seite === d.seite) Z.vs[0].sende({ ws: 'tippe', h: d.h, n: d.n, html: d.wert }); zeichne({ halten: true }); } });
  if (!(d.geaendert || p)) zurueck.style.display = 'none';
  zeile_.append(...[schalter, zurueck,
    !Z.ansicht.startsWith('b:') ? link('Show on page', () => inDerSeite(d.seite, { art: 'text', seite: d.seite, h: d.h, n: d.n })) : null,
    link('Close', () => { edZu(); Z.wahl = null; Z.vs.forEach(v => v.sende({ ws: 'zeige', h: '', n: -1, still: true })); })].filter(Boolean));
  ed.append(zeile_);
  if (d.geaendert && !d.nur) ed.append(el('p', { class: 'ws-vorher' }, el('b', {}, 'Original: '), d.original_text));
  if (d.stand !== d.original && d.stand !== d.wert) ed.append(el('p', { class: 'ws-vorher' }, el('b', {}, 'Published: '), el('span', { html: d.stand })));

  const mitSeite = d.sprachen.filter(x => x.seite_da);
  if (mitSeite.length) {
    const kiste = el('details', { class: 'ws-sprachen', open: !!(mitSeite.some(x => x.wert) || (p && Object.values(p.sprachen || {}).some(Boolean)) || opt.sprachen) });
    const zahl = el('span', {});
    kiste.append(el('summary', {}, 'In the other languages ', zahl));
    mitSeite.forEach(x => {
      const f = textFeld(p && p.sprachen ? (p.sprachen[x.code] || '') : x.wert, x.name, { id: x.code, lang: x.code });
      const marke = el('span', { class: 'ws-fehlt', hidden: true }, 'missing');
      const lage = el('p', { class: 'ws-klein' });
      sp[x.code] = { f, x, marke, lage, eigen: !!(p && p.sprachen && p.sprachen[x.code] && p.sprachen[x.code] !== x.wert) };
      f.addEventListener('input', () => { sp[x.code].eigen = true; lage.textContent = ''; merk(); });
      kiste.append(el('div', { class: 'ws-sprache' },
        el('div', { class: 'ws-sprache__kopf' }, mono(x.name), marke),
        x.da ? el('p', { class: 'ws-klein' }, 'On the page now: ' + anf(kurz(x.bisher, 220))) : el('p', { class: 'ws-klein' }, 'This spot has no match on the page in this language. Nothing changes there.'),
        x.da ? f : null, x.da ? lage : null,
        x.da ? el('div', {}, link('Use current text', () => { f.innerHTML = x.bisher_html; f.dispatchEvent(new Event('input', { bubbles: true })); })) : null));
    });
    kiste.append(el('p', { class: 'ws-klein' }, 'If you change the English text, each language without a translation shows the new English text. If you change only one translation, everything else stays as it is.'));
    kiste._zahl = zahl;
    ed.append(kiste);
  }
  if (d.bloecke.length) ed.append(el('div', { class: 'ws-bloecke' }, el('span', { class: 'ws-klein' }, 'Instead of changing the text, take something off the page:'),
    d.bloecke.slice(0, 3).map(b => link((b.aus ? 'Show again: ' : 'Hide: ') + anf(kurz(b.t, 60)), () => sende([{ art: 'aus', seite: d.seite, h: b.h, n: b.n, an: !b.aus }], { titel: b.aus ? 'Visible again' : 'Hidden' }), { 'data-ws-blk': b.h }))));

  /* Vergleichsstand so, wie der Browser ihn schreibt: nur dann zählt eine Eingabe als geändert, wenn wirklich etwas anders ist */
  const norm = h => el('div', { html: h }).innerHTML;
  const grundDe = norm(d.wert), grundSp = Object.fromEntries(mitSeite.map(x => [x.code, norm(x.wert)]));
  function lage() {   // «fehlt» je Sprache und die Zahl dazu
    const neu = klarText(de);
    Object.values(sp).forEach(s => { if (s.x.da) s.marke.hidden = !!klarText(s.f) || neu === d.original_text; });
    const fehlen = Object.values(sp).filter(s => s.x.da && !s.marke.hidden).length;
    const kiste = $('.ws-sprachen', ed);
    if (kiste) { kiste._zahl.textContent = fehlen ? '· ' + fehlen + ' missing' : '(' + mitSeite.length + ')'; if (fehlen || Object.values(sp).some(s => s.lage.textContent)) kiste.open = true; }
  }
  function merk(ev) {
    const neu = klarText(de);
    if (d.zahl) {   // Schreibweise des Hauses: Punkt oder Komma, wie es auf der Seite steht
      const alt = (d.original_text.match(/\d([.,])\d\d/) || [])[1], jetzt = (neu.match(/\d([.,])\d\d/) || [])[1];
      hinweis.hidden = !(alt && jetzt && alt !== jetzt);
      hinweis.textContent = 'On the website this is written as: ' + anf(d.original_text);
    }
    if (ev && ev.target === de) Object.values(sp).forEach(s => {   // nur wenn im Deutschen getippt wird
      if (!s.x.da || s.eigen) return;
      const v = vorschlag(d.original_text, neu, s.x.bisher_html);
      if (v) { s.f.innerHTML = v; s.lage.textContent = 'Suggestion: only the number is changed. Please read it. It is saved too.'; }
      else if (s.lage.textContent) { s.f.innerHTML = s.x.wert; s.lage.textContent = ''; }
    });
    lage();
    const gleich = de.innerHTML === grundDe && !alle && Object.entries(sp).every(([c, s]) => !s.x.da || s.f.innerHTML === grundSp[c]);
    zurueck.style.display = gleich && !d.geaendert ? 'none' : '';
    if (gleich) vergessen(key);
    else vormerken(key, { art: 'text', seite: d.seite, h: d.h, n: d.n, neu: de.innerHTML, orte: orteFest || (alle ? d.gleiche : null),
      sprachen: Object.fromEntries(Object.entries(sp).filter(([, s]) => s.x.da).map(([c, s]) => [c, s.f.innerHTML])) });
    if (knopf) { knopf.classList.toggle('ws-offen', !gleich); const t = $('[data-ws-zeigt]', knopf); if (t) t.textContent = neu; const s = $('small', knopf); if (s) s.textContent = s.textContent.replace(' · not saved', '') + (gleich ? '' : ' · not saved'); }
    if (Z.ansicht.startsWith('b:') && Z.vs[0] && Z.sprache === 'de' && Z.seite === d.seite) Z.vs[0].sende({ ws: 'tippe', h: d.h, n: d.n, html: de.innerHTML });
  }
  de.addEventListener('input', merk);
  if (ort) ort.append(ed); else if (knopf) knopf.after(ed);
  if (knopf) knopf.setAttribute('aria-pressed', 'true');
  lage();
  if (Z.ansicht.startsWith('b:') && Z.vs[0]) Z.vs[0].sende({ ws: 'zeige', h: d.h, n: d.n, still: !opt.rollen });
  if (opt.zeigen || opt.rollen) hochholen(knopf || ed, ed);
  return ed;
}
function hochholen(zeile, ed) {
  /* Robert 19.10.2026 (Bildschirmfoto): «wenn ich was anklicke zum Verändern, dass es links ein bisschen besser angezeigt wird und ein bisschen
     kurz aufleuchtet, dass ich weiss, wo ich hingucken muss. Und ein bisschen höher sitzt auch gerne in der linken Leiste.”
     Die Zeile rückt oben in die Liste (unter die Suche), Zeile und Feld leuchten einmal kurz auf (nur opacity, Schicht darüber). */
  const liste = zeile.closest('.ws-stellen'), still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fahrt = still ? 'auto' : 'smooth';
  if (liste && liste.scrollHeight > liste.clientHeight + 2) {
    const such = $('.ws-suche', liste), luft = (such ? such.offsetHeight : 0) + 26;
    liste.scrollTo({ top: Math.max(0, zeile.getBoundingClientRect().top - liste.getBoundingClientRect().top + liste.scrollTop - luft), behavior: fahrt });
  } else {
    const kopf = $('#ws-kopf'), luft = (kopf ? kopf.getBoundingClientRect().bottom : 0) + 24;
    window.scrollTo({ top: Math.max(0, zeile.getBoundingClientRect().top + window.scrollY - luft), behavior: fahrt });
  }
  [zeile, ed].forEach(x => { if (!x) return; x.classList.remove('ws-leuchtet'); void x.offsetWidth; x.classList.add('ws-leuchtet'); setTimeout(() => x.classList.remove('ws-leuchtet'), 1700); });
}
function inDerSeite(seite, zeige) { const b = bereichVon(seite); if (b) geh('b:' + b.key, { seite, zeige }); }

// ---------------------------------------------------------------- Foto: Fenster mit den Fotos der Website
async function bildFenster(w) {
  let d;
  try {
    d = await ruf('GET', X(['foto', HAUS, w.seite, w.b, w.n].map(encodeURIComponent).join('/')));
    if (!Z.fotos) Z.fotos = await ruf('GET', X('fotos/' + HAUS));
  } catch (e) { return fehler(e); }
  if (d.zu) return gesperrt(d.zu);
  let ziel = d.wert;
  const gross = el('img', { src: bild(d.klein), alt: d.alt });
  const alt = el('input', { type: 'text', value: d.alt, autocomplete: 'off', id: 'ws-alt', 'data-ws-feld': 'alt' });
  const sp = {};
  const fundus = el('div', { class: 'kuhle ws-fundus' });
  Z.fotos.fotos.forEach(f => fundus.append(el('button', { class: 'ws-fwahl', type: 'button', 'aria-pressed': f.b === ziel ? 'true' : 'false', title: f.alt, 'data-ws-foto': f.b, onclick: ev => {
    ziel = f.b;
    [...fundus.children].forEach(c => c.setAttribute('aria-pressed', c === ev.currentTarget ? 'true' : 'false'));
    gross.src = bild(f.klein);
    if (alt.value === d.alt || !alt.value) alt.value = f.alt;
  } }, el('span', { class: 'ws-fwahl__b' }, el('img', { src: bild(f.klein), alt: '', loading: 'lazy', decoding: 'async' })), el('span', { class: 'ws-fwahl__t' }, (f.eigen ? 'Own photo · ' : '') + kurz(f.alt || f.b, 48)))));
  let hoch = null;
  if (Z.info.hochladen) {   // eigenes Foto (Master Werkzeug-Bau 4.2 D): mindestens 900 Pixel, höchstens 25 MB, wird neu gesetzt in vier Grössen
    const datei = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', id: 'ws-hoch', class: 'ws-vh', 'data-ws-feld': 'hochladen' });
    const lage = el('span', { class: 'ws-klein', 'aria-live': 'polite' });
    datei.addEventListener('change', () => {
      const f = datei.files && datei.files[0];
      datei.value = '';
      if (!f) return;
      if (f.size > 25 * 1024 * 1024) { lage.textContent = ''; return melde('The photo is larger than 25 MB.', { mehr: 'Please choose a smaller version, for example with “Export” in the Photos app.', stichwort: 'bild-gross', fehler: true }); }
      if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return melde('This file is not a photo.', { mehr: 'JPG, PNG and WebP work.', stichwort: 'bild-art', fehler: true });
      lage.textContent = 'Adding …';
      const r = new FileReader();
      r.onerror = () => { lage.textContent = ''; melde('The file could not be read.', { stichwort: 'bild-kaputt', fehler: true }); };
      r.onload = async () => {
        let a;
        try { a = await ruf('POST', X('hochladen/' + HAUS), { name: f.name, daten: r.result, alt: alt.value === d.alt ? '' : alt.value }); }
        catch (e) { lage.textContent = ''; return fehler(e); }
        try { Z.fotos = await ruf('GET', X('fotos/' + HAUS)); } catch (e) { /* die Liste kommt beim nächsten Öffnen */ }
        ziel = a.b; gross.src = bild(a.klein); lage.textContent = a.meldung;
        const neuK = el('button', { class: 'ws-fwahl', type: 'button', 'aria-pressed': 'true', title: a.alt || f.name, 'data-ws-foto': a.b, onclick: ev => {
          ziel = a.b; [...fundus.children].forEach(c => c.setAttribute('aria-pressed', c === ev.currentTarget ? 'true' : 'false')); gross.src = bild(a.klein); } },
          el('span', { class: 'ws-fwahl__b' }, el('img', { src: bild(a.klein), alt: '', decoding: 'async' })), el('span', { class: 'ws-fwahl__t' }, 'Own photo · ' + kurz(f.name, 30)));
        [...fundus.children].forEach(c => c.setAttribute('aria-pressed', 'false'));
        fundus.prepend(neuK);
      };
      r.readAsDataURL(f);
    });
    hoch = el('div', { class: 'ws-hoch' }, el('label', { class: 'ws-taste', for: 'ws-hoch' }, 'Upload your own photo'), datei, lage);
  }
  const inhalt = el('div', { class: 'ws-form', 'data-ws-form': 'bild' },
    el('p', { class: 'ws-klein' }, d.seite_name + '. You can choose from the photos on the website' + (Z.info.hochladen ? ' and your own. Your own photo must be at least 900 pixels wide and at most 25 MB.' : '. New photos come from your contact person.')),
    el('div', { class: 'ws-bild-gross' }, gross), hoch, fundus,
    el('div', { class: 'feld' }, el('label', { for: 'ws-alt' }, 'Photo description (for screen readers and search engines)'), alt),
    d.sprachen.filter(x => x.da).map(x => { const f = el('input', { type: 'text', value: x.wert, placeholder: x.bisher, autocomplete: 'off', lang: x.code, id: 'ws-alt-' + x.code }); sp[x.code] = f; return el('div', { class: 'feld' }, el('label', { for: 'ws-alt-' + x.code }, 'Photo description ' + x.name), f); }));
  fenster('Change', 'photo.', inhalt, [
    { text: 'Cancel' },
    d.geaendert ? { text: 'Back to original', tun: zu => { zu(); sende([{ art: 'weg', key: ['bild', d.seite, d.b, d.n].join('|') }], { titel: 'Undone' }); } } : null,
    { text: 'Save', haupt: true, tun: zu => { zu(); sende([{ art: 'bild', seite: d.seite, b: d.b, n: d.n, neu: ziel, alt: alt.value, alt_sprachen: Object.fromEntries(Object.entries(sp).map(([c, f]) => [c, f.value])) }]); } }], { name: 'bild' });
}

// ---------------------------------------------------------------- Übersicht
function zeichneStart() {
  if (DX) return dxStart();
  const m = leere($('#ws-mitte')), i = Z.info, ae = aend(), h = new Date().getHours(), z = Z.stand.zuletzt;
  const gruss = h >= 5 && h < 11 ? 'Good morning.' : h >= 11 && h < 18 ? 'Good afternoon.' : 'Good evening.';
  const hat = k => i.bereiche.some(b => b.key === k);
  const erster = 'b:' + i.website[0].key;
  const aeN = ae.length + eigenZahl('wartet');   // Entwurf samt eigener Ansichten (Termine)
  const AUFG = [
    ...eigen().filter(e => e.aufgabe).map(e => ['e:' + e.key, e.aufgabe[0], e.aufgabe[1]]),   // eigene Ansichten des Hauses zuerst (Master 4.2 L19)
    [erster, 'Change a text', 'Click it on the page, write the new text beside it.'],
    i.zahlen ? ['zahlen', 'Opening time', 'All times on the website in one place.'] : null,
    i.angaben ? ['angaben', 'Phone or address', 'Change it once, right on every page.'] : null,
    hat('anlaesse') ? ['haus:anlaesse', 'Hide an event', 'Take what is over off the page.'] : null,
    hat('packages') ? ['haus:packages', 'Hide an offer', 'Take an offer that has ended off the page.'] : null,
    [erster, 'Change photo', 'Click a photo and pick one of your photos.'],
    i.karten ? [null, 'Dish or price on a menu', 'Menus are kept in the tool ' + anf(wname('karten')) + ', with the PDF.'] : null,
    i.hinweis ? ['hinweis', 'Notice for guests', 'One sentence at the top of every page, with dates.'] : null,
    i.google ? ['google', 'Google texts', 'How each page shows on Google.'] : null,
    hat('stellen') ? ['haus:stellen', 'Job filled', 'Hide the job or describe it again.'] : null,
    hat('zimmer') ? ['haus:zimmer', 'Update rooms', 'Name, text, details and photos of each room type.'] : null,
    i.sprachen.length ? ['sprachen', 'Add a translation', 'What changed in English, in the other languages.'] : null].filter(Boolean);
  const sprachen = i.sprachen.length ? ', each in ' + (i.sprachen.length + 1) + ' languages' : '';
  if (WOM) {   // Übersicht mit den Bausteinen des Hauses (wo-lage, wo-aufg, wo-ber), wie in den anderen Werkzeugen
    const E = WO.esc, fotos = i.website.map(b => b.foto).filter(Boolean), ZK = { zahlen: 'uhr', hinweis: 'glocke', sprachen: 'welt', angaben: 'tel', google: 'suche' };
    m.append(titel(wname(W) + ' · ' + i.name, gruss, 'What would you like to change today?',
      'Here you look after the website: every text, every photo, every detail. Everything waits in the draft first. It goes on the website only when you publish, and you can restore any earlier version.',
      [i.anleitung ? el('a', { class: 'wo-kn wo-kn--gold', href: i.anleitung, target: '_blank', rel: 'noopener', 'data-ws-anleitung': '1', html: '<span>Guide</span><i>' + WO.ic('buch') + '</i>' }) : null,
       el('a', { class: 'wo-kn' + (i.anleitung ? '' : ' wo-kn--gold'), href: pruefLink(''), html: '<span>Checks</span><i>' + WO.ic('schild') + '</i>' })].filter(Boolean)));
    const rest = el('div', { class: 'ws-wo-start', html:
      `<div class="wo-lage">
        <div class="wo-lg"><i class="wo-lg__z">${WO.ic('stift')}</i><span class="wo-mk">Draft</span><b>${aeN ? E(mz(aeN, 'change waiting', 'changes waiting')) : 'Nothing waiting'}</b><p>${aeN ? 'Saved. Not on the website yet.' : 'What you save collects here.'}</p>${aeN ? `<button class="wo-lk" type="button" data-gehe="${E(vglZiel())}">View and publish</button>` : ''}</div>
        <div class="wo-lg"><i class="wo-lg__z">${WO.ic('welt')}</i><span class="wo-mk">Website</span><b>${z ? 'Published ' + E(tag(z.zeit)) : 'As built'}</b><p>${E(mz(i.seiten.length, 'page', 'pages') + sprachen + '.' + (z && z.notiz ? ' Last: ' + z.notiz : ''))}</p><a class="wo-lk" href="${E(i.online + i.seiten[0].datei)}" target="_blank" rel="noopener">Open website</a></div>
        ${i.karten ? `<div class="wo-lg"><i class="wo-lg__z">${WO.ic('karte')}</i><span class="wo-mk">Menus</span><b>${E(wname('karten'))}</b><p>Dishes, drinks and prices. Website and PDF come from one source.</p><a class="wo-lk" href="${E(kartenAdresse())}">Open ${E(wname('karten'))}</a></div>` : ''}
      </div>
      <h2 class="wo-zw">Often <em>used</em></h2>
      <div class="wo-aufg ws-aufgaben">${AUFG.map(([ziel, tt, s], n) => `${ziel ? `<button class="wo-ag ws-ag" type="button" data-gehe="${E(ziel)}">` : `<a class="wo-ag ws-ag" href="${E(kartenAdresse())}">`}<span class="wo-ag__b">${fotos.length ? `<img src="${E(bild(fotos[n % fotos.length]))}" alt="" loading="lazy" decoding="async">` : ''}</span><span class="wo-ag__t"><i class="wo-ag__z">${WO.ic(ZK[ziel] || (ziel ? 'stift' : 'karte'))}</i><b>${E(tt)}</b><span>${E(s)}</span></span>${ziel ? '</button>' : '</a>'}`).join('')}</div>
      <h2 class="wo-zw">The website, <em>section by section</em></h2>
      <div class="wo-ber ws-bereiche">${i.website.map(b => { const o = ae.filter(x => b.seiten.some(s => s.datei === x.seite)).length;
        return `<button class="wo-bk ws-bk" type="button" title="${E(b.satz)}" data-ws-bk="${E(b.key)}" data-gehe="b:${E(b.key)}"><span class="wo-bk__b">${b.foto ? `<img src="${E(bild(b.foto))}" alt="" loading="lazy" decoding="async">` : ''}</span><span class="wo-bk__t"><b>${E(b.name)}</b><small>${E(mz(b.seiten.length, 'page', 'pages'))}${o ? ' · ' + o + ' waiting' : ''}</small><span>${E(b.satz)}</span></span><i class="wo-bk__p">${WO.ic('pfeil')}</i></button>`; }).join('')}</div>` });
    rest.querySelectorAll('[data-gehe]').forEach(b => b.addEventListener('click', () => geh(b.getAttribute('data-gehe'))));
    m.append(rest);
    return;
  }
  m.append(titel(wname(W) + ' · ' + i.name, gruss, 'What would you like to change today?',
      'Here you look after the website: every text, every photo, every detail. Everything waits in the draft first. It goes on the website only when you publish, and you can restore any earlier version.',
      [el('a', { class: 'kn kn--klein', href: pruefLink('') }, el('span', {}, 'Checks'), el('i', { 'aria-hidden': 'true', html: PF }))], false, i.kleid.foto),
    el('div', { class: 'ws-lage platte' },
      el('div', { class: 'ws-lg' }, mono('Draft'), el('b', {}, ae.length ? mz(ae.length, 'change waiting', 'changes waiting') : 'Nothing waiting'),
        el('span', {}, ae.length ? 'Saved. Not on the website yet.' : 'What you save collects here.'), ae.length ? link('View and publish', () => geh('entwurf')) : null),
      el('div', { class: 'ws-lg' }, mono('Website'), el('b', {}, z ? 'Published ' + tag(z.zeit) : 'As built'),
        el('span', {}, mz(i.seiten.length, 'page', 'pages') + sprachen + '.' + (z && z.notiz ? ' Last: ' + z.notiz : '')), el('a', { class: 'ws-link', href: i.online + i.seiten[0].datei, target: '_blank', rel: 'noopener' }, 'Open website')),
      i.karten ? el('div', { class: 'ws-lg' }, mono('Menus'), el('b', {}, wname('karten')), el('span', {}, 'Dishes, drinks and prices. Website and PDF come from one source.'), el('a', { class: 'ws-link', href: kartenAdresse() }, 'Open ' + wname('karten'))) : null),
    el('h2', { class: 'ws-zw' }, 'Often ', el('em', {}, 'used')),
    el('div', { class: 'ws-aufgaben' }, AUFG.map(([ziel, t, s]) => el(ziel ? 'button' : 'a', ziel ? { class: 'ws-ag', type: 'button', onclick: () => geh(ziel) } : { class: 'ws-ag', href: kartenAdresse() }, el('b', {}, t), el('span', {}, s), el('em', { html: PF })))),
    el('h2', { class: 'ws-zw' }, 'The website, ', el('em', {}, 'section by section')),
    el('div', { class: 'ws-bereiche' }, i.website.map(b => {
      const offen = ae.filter(x => b.seiten.some(s => s.datei === x.seite)).length;
      return el('button', { class: 'ws-bk', type: 'button', title: b.satz, 'data-ws-bk': b.key, onclick: () => geh('b:' + b.key) },
        el('span', { class: 'ws-bk__b' }, b.foto ? el('img', { src: bild(b.foto), alt: '', loading: 'lazy', decoding: 'async' }) : null),
        offen ? el('span', { class: 'ws-bk__o' }, offen + ' waiting') : null,
        el('span', { class: 'ws-bk__n' }, el('b', {}, b.name), el('small', {}, mz(b.seiten.length, 'page', 'pages')), el('i', { html: PF })));
    })));
}

// ---------------------------------------------------------------- Bereich der Website: Stellen links, Seite rechts
function stZeile(s, seite) {
  const p = Z.offen[['text', seite, s.h, s.n].join('|')];
  const text = p ? el('span', { html: p.neu }).textContent : s.neu != null ? s.neu : s.t;
  return el('button', { type: 'button', class: 'ws-st' + (s.neu != null ? ' ws-geaendert' : '') + (p ? ' ws-offen' : ''), 'data-h': s.h, 'data-n': s.n, 'aria-pressed': 'false', disabled: !!s.zu,
    onclick: ev => oeffne({ seite, h: s.h, n: s.n }, ev.currentTarget, null, { rollen: true }) },
    el('small', {}, (TAGNAME[s.tag] || 'Text') + (s.gleich > 1 ? ' · ' + s.gleich + '× on the page' : '') + (s.neu != null ? (s.nur ? ' · translation changed' : ' · changed') : '') + (p ? ' · not saved' : '')),
    el('span', { 'data-ws-zeigt': '1' }, text));
}
let dxFotos = new Set();   // Fotos, die in der Abschnittsliste schon stehen (je Zeichnen neu)
function dxSummary(g, v, zusatz) {   // Abschnitt wie in Fassung 17: Foto, Titel, «Section 2 of 12 · shown»
  const echte = v.gruppen.filter(x => x.h && !x.fest), nr = echte.indexOf(g) + 1, f = g.fotos.find(x => x.klein && !dxFotos.has(x.klein));
  if (f) dxFotos.add(f.klein);
  const wo = nr ? 'Section ' + nr + ' of ' + echte.length + ' · ' + (g.aus ? 'hidden' : 'shown') : g.fest ? 'On every page' : 'Other texts';
  return el('summary', { class: 'dx-abz' }, f ? el('img', { src: bild(f.klein), alt: '', loading: 'lazy', decoding: 'async' }) : el('span', { class: 'dx-abz__o', html: dic(g.fest ? 'web' : 'text') }),
    el('div', {}, el('b', {}, g.titel || (g.zu ? 'Menu' : 'Section')), el('small', {}, zusatz ? wo + ' · ' + zusatz : wo + ' · ' + mz(g.stellen.length, 'text', 'texts') + (g.fotos.length ? ' · ' + mz(g.fotos.length, 'photo', 'photos') : ''))),
    el('span', { class: 'dx-aug', html: dic(g.aus ? 'verbergen' : g.zu ? 'menu' : 'auge') }), el('span', { class: 'dx-pr', html: dic('winkel') }));
}
function gruppen(v) {
  const ort = $('#ws-gruppen'), seite = v.seite || Z.seite;
  if (DX) { const b = bereichVon(seite); dxFotos = new Set(b && b.foto ? [b.foto] : []); }   // die Seite dieser Liste, nicht die gerade gewählte: beim Wechseln steht die alte Liste noch kurz da (Aussen-Prüfung 23.10.2026, 404 foto/wein.html/kopf-wein)
  leere(ort);
  v.gruppen.forEach((g, gi) => {
    if (g.zu) {
      ort.append(el('details', { class: 'ws-gr ws-gr--zu', 'data-g': gi }, DX ? dxSummary(g, v, g.zu === 'karten' ? 'In ' + wname('karten') : 'Locked') : el('summary', {}, el('b', {}, g.titel || 'Menu'), el('small', {}, g.zu === 'karten' ? wname('karten') : 'locked')),
        el('div', { class: 'ws-gr__text' }, el('p', {}, g.zu === 'karten' ? 'Dishes, drinks and prices on this menu come from the tool ' + anf(wname('karten')) + ', together with the PDF. Change them there, then everything matches.' : 'This section cannot be changed here.'),
          g.zu === 'karten' ? el('a', { class: 'ws-taste', href: kartenAdresse() }, 'Open ' + wname('karten')) : null)));
      return;
    }
    const geaendert = g.stellen.some(s => s.neu != null) || g.fotos.some(f => f.neu);
    const d = el('details', { class: 'ws-gr' + (g.aus ? ' ws-ist-aus' : ''), 'data-g': gi, open: gi < 2 || geaendert || Z.gr.has(Z.seite + '|' + gi) },
      DX ? dxSummary(g, v) : el('summary', {}, el('b', {}, g.titel || 'Section'), el('small', {}, mz(g.stellen.length, 'text', 'texts') + (g.fotos.length ? ' · ' + mz(g.fotos.length, 'photo', 'photos') : ''))),
      g.stellen.map(s => stZeile(s, seite)),
      g.fotos.length ? el('div', { class: 'ws-fotos' }, g.fotos.map(f => el('button', { type: 'button', class: 'ws-foto' + (f.neu ? ' ws-geaendert' : ''), title: f.alt, disabled: !!f.zu, 'data-ws-foto-st': f.b + '|' + f.n, onclick: () => bildFenster({ seite, b: f.b, n: f.n }) },
        f.klein ? el('img', { src: bild(f.klein), alt: '', loading: 'lazy' }) : null))) : null,   // ohne Adresse kein <img> (sonst fragt der Browser den Ordner an)
      g.stellen.some(s => s.zu === 'karten') ? el('div', { class: 'ws-gr__fuss', 'data-ws-zu': 'karten' }, 'The menu in this section is kept in the tool ', el('a', { class: 'ws-link', href: kartenAdresse() }, anf(wname('karten'))), '.') : null,
      g.h && !g.fest ? el('div', { class: 'ws-gr__fuss' }, link(g.aus ? 'Show section again' : 'Hide whole section', () => sende([{ art: 'aus', seite, h: g.h, n: g.n, an: !g.aus }], { titel: g.aus ? 'Visible again' : 'Hidden' }))) : null);
    d.addEventListener('toggle', () => { const k = Z.seite + '|' + gi; if (d.open) Z.gr.add(k); else Z.gr.delete(k); });
    ort.append(d);
  });
  const alt = $('.ws-ausgeblendet'); if (alt) alt.remove();
  if (v.ausgeblendet.length) ort.before(el('div', { class: 'ws-ausgeblendet' }, el('b', {}, 'Hidden on this page'),
    v.ausgeblendet.map(a => el('div', {}, el('span', {}, kurz(a.t, 70) || 'Section'), link('Show again', () => sende([{ art: 'aus', seite, h: a.h, n: a.n, an: false }], { titel: 'Visible again' }))))));
}
function suche(q) {
  q = q.trim().toLowerCase();
  $$('#ws-gruppen .ws-gr').forEach(g => {
    let treffer = 0;
    $$('.ws-st', g).forEach(x => { const ja = !q || x.textContent.toLowerCase().includes(q); x.hidden = !ja; if (ja) treffer++; });
    g.hidden = !!q && !treffer;
    if (q && treffer) g.open = true;
  });
}
function zeileOeffnen(h, n) {
  const z = $(`#ws-gruppen .ws-st[data-h="${h}"][data-n="${n}"]`);
  if (!z) return;
  const such = $('#ws-such'); if (such && such.value) { such.value = ''; suche(''); }
  z.closest('details').open = true;
  oeffne({ seite: Z.seite, h, n }, z, null, { zeigen: true });
}
async function zeichneWeb(opt) {
  const b = webBereich(Z.ansicht.slice(2)) || Z.info.website[0];
  if (!b.seiten.some(s => s.datei === Z.seite)) Z.seite = b.seiten[0].datei;
  let v;
  try { v = await ruf('GET', X('seite/' + HAUS + '/' + encodeURIComponent(Z.seite))); } catch (e) { return fehler(e); }
  if (!opt.gilt()) return;
  const key = [b.key, Z.seite].join('|'), m = $('#ws-mitte');
  if (opt.halten && m.getAttribute('data-ws-web') === key && $('#ws-gruppen') && Z.vs[0]) {   // nach dem Speichern: Liste erneuern, die Seite bleibt an ihrer Stelle stehen
    const liste = $('.ws-stellen'), oben = liste.scrollTop, w = Z.wahl;
    gruppen(v);
    suche($('#ws-such').value);
    liste.scrollTop = oben;
    if (opt.neuLaden) await Z.vs[0].lade(true);
    /* Abnahme 28.11.2026: nur wieder öffnen, wenn in der Zwischenzeit nichts anderes gewählt wurde. Wer gleich nach «Save» die nächste Zeile anklickt,
       während die Vorschau neu lädt, behält deren Feld (vorher sprang es auf die gespeicherte Zeile zurück). */
    if (w && Z.wahl === w && w.art === 'text' && w.seite === Z.seite) { const z = $(`#ws-gruppen .ws-st[data-h="${w.h}"][data-n="${w.n}"]`); if (z) await oeffne(w, z, null, {}); }
    return;
  }
  m.setAttribute('data-ws-web', key);
  const name = el('span', { class: 'ws-mono' }, DX ? v.name + ' · as guests see it' : v.name);
  const vs = vorschau('entwurf', Z.seite, Z.sprache, el('div', { class: 'ws-vorschau__k' }, name,
    schmal() ? null : wahl2([{ wert: 'rechner', text: 'Computer' }, { wert: 'handy', text: 'Phone' }], Z.breite, x => { Z.breite = x; vs.passe(); }, 'Preview width'),
    Z.info.sprachen.length ? auswahl([{ wert: 'de', text: 'English' }].concat(Z.info.sprachen.map(s => ({ wert: s.code, text: s.name }))), Z.sprache, x => { Z.sprache = x; vs.sprache = x; vs.lade(true); }, 'Preview language', true) : null,
    DX ? null : el('a', { href: Z.info.online + Z.seite, target: '_blank', rel: 'noopener' }, 'Open full size')));
  Z.vs = [vs];
  const [a1, a2] = zweiteilig(b.name);
  const reiter = b.seiten.length > 1 ? el('div', { class: 'ws-reiter' },
    b.seiten.length > 5 ? auswahl(b.seiten.map(s => ({ wert: s.datei, text: s.name })), Z.seite, s => geh(Z.ansicht, { seite: s }), 'Page') :
      wahl2(b.seiten.map(s => ({ wert: s.datei, text: s.name })), Z.seite, s => geh(Z.ansicht, { seite: s }), 'Page'),
    el('span', { class: 'ws-leise' }, b.seiten.length + ' pages')) : null;
  if (DX) {   // Fassung 17 (Robert 24.11.2026): Kopfkarte der Seite, alle Seiten als Reiter, Vorschau links, Abschnitte rechts
    const nr = Z.info.website.indexOf(b) + 1, echte = v.gruppen.some(g => g.h && !g.fest && !g.zu);
    leere(m).append(dxKopf({ mono: wname(W) + ' · Page ' + nr + ' of ' + Z.info.website.length, h: b.name, foto: dxFoto(b), klein: true, status: false,
        satz: 'On the ' + (schmal() ? 'top' : 'left') + ' is the page the way guests see it. Click a text or a photo to change it, or pick a section ' + (schmal() ? 'below' : 'on the right') + '.',
        knoepfe: v.gruppen.some(g => g.zu === 'karten') ? [dxWk('Open ' + wname('karten'), 'menu', '', { href: kartenAdresse() })] : [] }),
      dxSeitenReiter(), reiter || '',
      el('div', { class: 'ws-arbeit dx-arbeit' }, vs.k,
        el('div', { class: 'platte ws-stellen dx-wab dx-p' },
          el('div', { class: 'dx-kopf' }, el('div', {}, el('div', { class: 'dx-mono', html: dic('text', 'dx-mi') + E_(b.name) + ' · sections' }), el('h4', {}, 'Click to change'))),
          el('label', { class: 'ws-suche dx-suchfeld' }, el('span', { html: dic('lupe') }), el('input', { type: 'text', id: 'ws-such', placeholder: 'Search the lines on this page', autocomplete: 'off', 'aria-label': 'Search the lines on this page', oninput: ev => suche(ev.target.value) })),
          el('div', { id: 'ws-gruppen' }),
          echte ? el('div', { class: 'dx-abf', html: dic('verbergen', 'dx-mi') + 'A section can be hidden and shown again later.' }) : null)));
  } else leere(m).append(titel('Section · ' + b.name, a1, a2, (b.satz ? b.satz + ' ' : '') + 'Click a text or a photo on the page, or pick one ' + (schmal() ? 'below' : 'on the left') + '.',
      v.gruppen.some(g => g.zu === 'karten') ? [el('a', { class: 'kn kn--klein', href: kartenAdresse() }, el('span', {}, 'Open ' + wname('karten')), el('i', { 'aria-hidden': 'true', html: PF }))] : null, true),
    reiter || '',   // ein Bereich mit nur einer Seite hat keine Reiter (append(null) schriebe «null» in die Ansicht)
    el('div', { class: 'ws-arbeit' },
      el('div', { class: 'platte ws-stellen' },
        el('label', { class: 'ws-suche' }, el('span', { html: LUPE }), el('input', { type: 'text', id: 'ws-such', placeholder: 'Search text on this page', autocomplete: 'off', 'aria-label': 'Search text on this page', oninput: ev => suche(ev.target.value) })),
        el('div', { id: 'ws-gruppen' })),
      vs.k));
  gruppen(v);
  if (Z.wahl && Z.wahl.seite === Z.seite) {
    const w = Z.wahl;
    vs.nach = () => { if (w.art === 'bild') bildFenster(w); else zeileOeffnen(w.h, w.n); };
  }
}

// ---------------------------------------------------------------- Zeiten und Preise
const ZART = { preise: /CHF|Fr\.|€|\bEUR\b|\bPHP\b|₱/, zeiten: /\d{1,2}[.:]\d{2}|\bUhr\b|\b\d{1,2}\s?(?:AM|PM)\b/ };   // The Cat & Gun: Preise in PHP/₱, Zeiten als 7AM
function zArt(t) { return ZART.preise.test(t) ? 'preise' : ZART.zeiten.test(t) ? 'zeiten' : 'masse'; }
async function zeichneZahlen(opt) {
  const m = $('#ws-mitte');
  let d;
  try { d = await ruf('GET', X('zahlen/' + HAUS)); } catch (e) { return fehler(e); }
  if (!opt.gilt()) return;
  const oben = window.scrollY;
  const ort = el('div', {});
  const such = el('input', { type: 'text', value: Z.filter, placeholder: 'Type a word or a number', autocomplete: 'off', id: 'ws-suche', 'aria-label': 'Search times' });
  /* Abnahme 28.11.2026: nur die Arten zur Wahl, die es auf dieser Website gibt («Prices» und «Sizes and durations» zeigten bei The Cat & Gun immer «Nothing found.»:
     die Preise pflegt «Menus & price lists»). Gibt es nur eine Art, entfällt die Wahl (sie wäre dasselbe wie «All»). */
  const artDa = new Set([].concat(...d.gruppen.map(g => g.zeilen.map(z => zArt(z.t)))));
  const arten = [{ wert: 'alle', text: 'All' }, { wert: 'preise', text: 'Prices' }, { wert: 'zeiten', text: 'Times' }, { wert: 'masse', text: 'Sizes and durations' }].filter(o => o.wert === 'alle' || artDa.has(o.wert));
  if (!arten.some(o => o.wert === Z.zArt) || arten.length < 3) Z.zArt = 'alle';
  leere(m).append(titel('All pages', '', 'Times.', 'Every spot on the website with a time, a duration or a size, read from the pages. If the same detail is on several pages, you change it here once. ' + d.zahl + ' details.'),
    el('div', { class: 'ws-mitte-reihe' },
      arten.length > 2 ? wahl2(arten, Z.zArt, x => { Z.zArt = x; baue(); }, 'Kind of detail') : null,
      el('label', { class: 'ws-suche', style: 'margin:0;width:min(320px,100%)' }, el('span', { html: LUPE }), such)), ort);
  function baue() {
    leere(ort);
    const f = Z.filter.toLowerCase();
    let n = 0;
    d.gruppen.forEach(g => {
      const zz = g.zeilen.filter(z => (Z.zArt === 'alle' || zArt(z.t) === Z.zArt) && (!f || (z.t + ' ' + z.vor + ' ' + z.ober + ' ' + z.abschnitt + ' ' + (z.neu || '')).toLowerCase().includes(f)));
      if (!zz.length) return;
      const karte = el('section', { class: 'platte ws-karte' }, el('div', { class: 'ws-karte__kopf' }, el('h2', {}, g.name), mono(mz(zz.length, 'spot', 'spots'))));
      zz.forEach(z => {
        n++;
        const w = { seite: z.orte[0].seite, h: z.h, n: z.orte[0].n, orte: z.orte };
        const p = Z.offen[['text', w.seite, w.h, w.n].join('|')];
        const etikett = [z.fest ? '' : kurz(z.abschnitt, 46), z.ober, z.vor, z.orte.length > 1 ? z.orte.length + ' spots' : '', z.neu || z.teils ? 'changed' : ''].filter(Boolean).join(' · ');
        const reihe = el('div', { class: 'ws-zl', 'data-ws-zahl': z.h, 'data-ws-orte': z.orte.length, 'data-ws-ort': w.seite + '|' + w.n });
        const wert = el('button', { class: 'ws-zl__wert', type: 'button', 'aria-pressed': 'false', onclick: () => oeffne(w, wert, reihe) }, el('span', { 'data-ws-zeigt': '1' }, p ? el('span', { html: p.neu }).textContent : z.neu || z.t));
        reihe.append(mono(etikett), wert, link('Show on page', () => inDerSeite(w.seite, { art: 'text', seite: w.seite, h: w.h, n: w.n })));
        karte.append(reihe);
      });
      ort.append(karte);
    });
    if (!n) ort.append(el('p', { class: 'kuhle ws-leer' }, 'Nothing found.'));
  }
  such.addEventListener('input', () => { Z.filter = such.value; baue(); });
  baue();
  if (opt.halten) window.scrollTo(0, oben);
  const w = Z.wahl;
  if (opt.halten && w && w.art === 'text' && w.orte) {
    const treffer = $(`.ws-zl[data-ws-zahl="${w.h}"][data-ws-ort="${w.seite}|${w.n}"]`, ort);
    if (treffer) await oeffne(w, $('.ws-zl__wert', treffer), treffer);
  }
}

// ---------------------------------------------------------------- Angaben des Hauses (Telefon, E-Mail, Adresse, Links): einmal ändern, überall richtig
const ANG_PRUEF = {
  telefon: v => /^\+?[\d ]{8,20}$/.test(v) ? '' : 'A phone number has only digits and spaces, with at most one “+” at the start.',
  mail: v => /^[^@\s<>"]+@[^@\s<>"]+\.[a-z]{2,}$/i.test(v) ? '' : 'An email address looks like this: name@example.com',
  link: v => /^https:\/\/[^\s"<>]+$/.test(v) ? '' : 'A web address starts with https://',
  text: v => v ? '' : 'A detail with no value leaves a gap on the website.' };
async function zeichneAngaben(opt) {
  const m = $('#ws-mitte');
  let d;
  try { d = await ruf('GET', X('angaben/' + HAUS)); } catch (e) { return fehler(e); }
  if (!opt.gilt()) return;
  const karte = el('section', { class: 'platte ws-karte ws-form ws-ang', 'data-ws-form': 'angaben' });
  d.angaben.forEach(a => {
    const key = 'angabe|' + a.key, p = Z.offen[key];
    const f = el('input', { type: a.art === 'mail' ? 'email' : a.art === 'telefon' ? 'tel' : a.art === 'link' ? 'url' : 'text', id: 'ws-ang-' + a.key, value: p ? p.neu : a.wert,
      autocomplete: 'off', spellcheck: 'false', 'data-ws-angabe': a.key });
    const lage = el('p', { class: 'ws-klein ws-ang__lage' }, (a.art === 'link' ? 'Target of ' + mz(a.links, 'link', 'links') : 'Appears ' + a.stellen + '×' + (a.links ? ' and as ' + mz(a.links, 'link', 'links') : '')) + ' on ' + mz(a.seiten, 'page', 'pages') + '.' + (a.geaendert ? ' Original: ' + anf(a.original) + '.' : ''));
    const warn = el('p', { class: 'ws-ang__warn', role: 'alert', hidden: true });
    f.addEventListener('input', () => {
      const v = f.value.trim(), w = (ANG_PRUEF[a.art] || ANG_PRUEF.text)(v);
      warn.hidden = !w || !v && a.art !== 'text'; warn.textContent = w;
      f.setAttribute('aria-invalid', w ? 'true' : 'false');
      if (v === a.wert) vergessen(key); else vormerken(key, { art: 'angabe', key: a.key, neu: v });
    });
    const zurueck = a.geaendert ? link('Back to original: ' + anf(a.original), () => { f.value = a.original; f.dispatchEvent(new Event('input', { bubbles: true })); }, { 'data-ws-ang-zurueck': a.key }) : null;
    karte.append(el('div', { class: 'ws-ang__zeile feld' }, el('label', { for: f.id }, a.label), f, warn, lage, zurueck,
      a.beispiel.length ? el('details', { class: 'ws-ang__wo' }, el('summary', {}, 'Where exactly?'), a.beispiel.map(b => el('p', { class: 'ws-klein' }, b.name + ': ' + anf(b.t)))) : null));
  });
  leere(m).append(titel('All pages', 'Phone, address', '& hours.', 'Phone, address and opening hours. What you change here changes in every spot on the website where it appears, also in the links for calling.'), karte);
}

// ---------------------------------------------------------------- Google-Texte: Titel und Beschreibung je Seite, mit Vorschau wie in der Trefferliste
async function zeichneGoogle(opt) {
  const m = $('#ws-mitte');
  let d;
  try { d = await ruf('GET', X('google/' + HAUS)); } catch (e) { return fehler(e); }
  if (!opt.gilt()) return;
  const RT = d.richtwert.titel, RB = d.richtwert.beschreibung;
  const liste = el('div', { class: 'ws-gt' });
  d.seiten.forEach(g => {
    const key = 'seo|' + g.seite, p = Z.offen[key];
    const t = el('input', { type: 'text', id: 'ws-gt-t-' + g.seite, value: p ? p.titel : g.titel, autocomplete: 'off', 'data-ws-gt': 'titel' });
    const b = el('textarea', { id: 'ws-gt-b-' + g.seite, rows: 3, 'data-ws-gt': 'beschreibung', disabled: !g.hat_beschreibung });
    b.value = p ? p.beschreibung : g.beschreibung;
    const zt = el('span', { class: 'ws-gt__zahl' }), zb = el('span', { class: 'ws-gt__zahl' });
    const vt = el('b', { class: 'ws-gt__vt' }), vb = el('span', { class: 'ws-gt__vb' });
    const zaehle = () => {
      zt.textContent = t.value.length + ' / ' + RT; zt.classList.toggle('ws-gt__zahl--lang', t.value.length > RT);
      zb.textContent = b.value.length + ' / ' + RB; zb.classList.toggle('ws-gt__zahl--lang', b.value.length > RB);
      vt.textContent = kurz(t.value || g.original_titel, RT + 1); vb.textContent = kurz(b.value, RB + 1);
    };
    const merk = () => {
      zaehle();
      if (t.value.trim() === g.titel && b.value.trim() === g.beschreibung) vergessen(key);
      else vormerken(key, { art: 'seo', seite: g.seite, titel: t.value, beschreibung: b.value });
    };
    t.addEventListener('input', merk); b.addEventListener('input', merk);
    zaehle();
    liste.append(el('section', { class: 'platte ws-karte ws-gt__karte', 'data-ws-seo': g.seite },
      el('div', { class: 'ws-gt__kopf' }, g.foto ? el('span', { class: 'ws-gt__bild' }, el('img', { src: bild(g.foto), alt: '', decoding: 'async' })) : null,
        el('div', {}, el('h2', {}, g.name), mono(g.seite + (g.geaendert ? ' · changed' : '')))),
      el('div', { class: 'ws-gt__vorschau', 'aria-label': 'How the page shows on Google' }, el('span', { class: 'ws-gt__adr' }, Z.info.name + ' › ' + g.seite), vt, vb),
      el('div', { class: 'feld' }, el('label', { for: t.id }, 'Title ', zt), t),
      el('div', { class: 'feld' }, el('label', { for: b.id }, 'Description ', zb), g.hat_beschreibung ? b : el('p', { class: 'ws-klein' }, 'This page has no description for Google.'))));
  });
  leere(m).append(titel('All pages', 'Google texts', 'per page.', 'This is how each page shows in Google results: the title is the line to click, the description is below it. Google shows about ' + RT + ' characters of title and ' + RB + ' characters of description. It cuts longer texts.'), liste);
}

// ---------------------------------------------------------------- Das Haus: Zimmer, Säle, Packages … (Felder aus der Beschreibung)
function edLink(t, e, knopf, ort) {
  edZu();
  const key = ['link', e.seite, t.h, t.n].join('|'), p = Z.offen[key];
  const f = el('input', { type: 'text', value: p ? p.neu : t.wert, autocomplete: 'off', inputmode: 'url', id: 'ws-link', 'data-ws-feld': 'link' });
  f.addEventListener('input', () => { if (f.value.trim() === t.wert) vergessen(key); else vormerken(key, { art: 'link', seite: e.seite, h: t.h, n: t.n, neu: f.value.trim() }); });
  ort.append(el('div', { class: 'ws-ed', 'data-ws-form': 'link' }, mono('Link · ' + (kurz(t.t, 50) || e.seite_name)),
    el('div', { class: 'feld' }, el('label', { for: 'ws-link' }, 'Where the link goes'), f),
    el('p', { class: 'ws-klein' }, 'An address starts with https://, mailto: or tel:, or it names a page or a PDF on the website.'),
    t.neu ? el('p', { class: 'ws-vorher' }, el('b', {}, 'Original: '), t.original) : null,
    el('div', { class: 'ws-ed__z' }, [t.neu ? link('Back to original', () => sende([{ art: 'weg', key }], { titel: 'Undone' })) : null, link('Close', edZu)].filter(Boolean))));
  knopf.setAttribute('aria-pressed', 'true');
}
/* Jeder Eintrag einer Liste zeigt sein Bild (Robert 19.10.2026: «in allen Tools Bilder dazu»): das erste Foto des Eintrags von der Website,
   ohne Foto ein ruhiges Feld mit den Anfangsbuchstaben, nie ein fremdes oder erfundenes Bild. Darunter die zweite Angabe (Datum, Aufgabe). */
function kopfBild(e) {
  const f = e.felder.find(x => (x.art === 'bild' || x.art === 'bilder') && x.teile.length && x.teile[0].klein);
  if (f) return el('span', { class: 'ws-eintrag__b' }, el('img', { src: bild(f.teile[0].klein), alt: '', decoding: 'async' }));
  if (e.bild_ersatz) return el('span', { class: 'ws-eintrag__b', title: 'Photo of the same person from another page of the website' }, el('img', { src: bild(e.bild_ersatz), alt: '', decoding: 'async' }));
  const k = (e.titel || '').split(/\s+/).filter(w => /^[A-ZÄÖÜ0-9]/.test(w)).slice(0, 2).map(w => w[0]).join('');
  return el('span', { class: 'ws-eintrag__b ws-eintrag__b--ohne', title: 'There is no photo here on the website' }, k || '·');
}
function unterZeile(e) {
  const f = e.felder.filter(x => x.art !== 'bild' && x.art !== 'bilder' && x.art !== 'link' && x.teile[0] && x.teile[0].t && x.teile[0].t !== e.titel)[0];
  return f ? kurz(f.teile[0].t, 80) : '';
}
async function zeichneHaus(opt) {
  const m = $('#ws-mitte'), key = Z.ansicht.slice(5);
  let d;
  try { d = await ruf('GET', X('bereich/' + HAUS + '/' + encodeURIComponent(key))); } catch (e) { return fehler(e); }
  if (!opt.gilt()) return;
  const oben = window.scrollY;
  const [a1, a2] = zweiteilig(d.name);
  leere(m).append(titel('The house · ' + d.name, a1, a2, d.satz + ' Everything here is read from the pages: ' + mz(d.eintraege.length, 'entry', 'entries') + '.', null, true));
  if (d.fehlt.length) m.append(el('p', { class: 'platte ws-karte' }, 'Some fields could not be found on the pages: ' + d.fehlt.slice(0, 3).join('; ') + '. ', el('a', { class: 'ws-link', href: pruefLink('bereich-feld') }, 'What to do?')));
  /* Freistehende Bildkarten, Text darunter (Robert 20.10.2026). Reihen gleichmässig verteilt, keine Karte allein, keine Reihe mit grosser Lücke
     (“wenn das nur so paar sind, dann mach 3 oben und 2 unten”): höchstens vier je Reihe, so viele Reihen wie nötig, dann gleich viele je Reihe, die letzte mittig */
  const n = d.eintraege.length, reihen = Math.ceil(n / 4) || 1;
  const raster = el('div', { class: 'ws-eintraege', style: '--ws-pro:' + Math.ceil(n / reihen) });
  if (d.eintraege.length) m.append(raster);
  d.eintraege.forEach((e, i) => {
    const id = key + ':' + i;
    const innen = el('div', { class: 'ws-eintrag__innen' });
    e.felder.forEach(f => {
      if (f.art === 'bild' || f.art === 'bilder') {
        innen.append(el('div', { style: 'padding-top:12px' }, mono(f.label)), el('div', { class: 'ws-fotos' }, f.teile.map(t => el('button', { class: 'ws-foto' + (t.neu ? ' ws-geaendert' : ''), type: 'button', disabled: !!t.zu, title: t.alt, onclick: () => bildFenster({ seite: e.seite, b: t.b, n: t.n }) },
          el('img', { src: bild(t.klein), alt: t.alt, loading: 'lazy' })))));
        return;
      }
      f.teile.forEach((t, ti) => {
        const reihe = el('div', { class: 'ws-zl' });
        const p = Z.offen[[f.art === 'link' ? 'link' : 'text', e.seite, t.h, t.n].join('|')];
        const wert = el('button', { class: 'ws-zl__wert', type: 'button', disabled: !!t.zu, 'aria-pressed': 'false', 'data-ws-teil': t.h,
          onclick: () => (f.art === 'link' ? edLink(t, e, wert, reihe) : oeffne({ seite: e.seite, h: t.h, n: t.n }, wert, reihe)) },
          el('span', { 'data-ws-zeigt': '1' }, f.art === 'link' ? (p ? p.neu : t.wert) : (p ? el('span', { html: p.neu }).textContent : t.t)));
        reihe.append(mono(f.label + (f.teile.length > 1 ? ' ' + (ti + 1) : '') + (t.neu ? ' · changed' : '')), wert);
        innen.append(reihe);
      });
    });
    const erste = (e.felder.find(f => f.teile[0] && f.teile[0].h && f.art !== 'link') || { teile: [] }).teile[0];
    innen.append(el('div', { class: 'ws-reihe', style: 'padding-top:14px' },
      erste ? taste('Show on page', () => inDerSeite(e.seite, { art: 'text', seite: e.seite, h: erste.h, n: erste.n })) : null,
      e.blk ? taste(e.aus ? 'Show again' : 'Hide', () => sende([{ art: 'aus', seite: e.seite, h: e.blk.h, n: e.blk.n, an: !e.aus }], { titel: e.aus ? 'Visible again' : 'Hidden' })) : null));
    const karte = el('details', { class: 'platte ws-eintrag', open: Z.auf.has(id), 'data-ws-eintrag': i },
      el('summary', {}, kopfBild(e), el('span', { class: 'ws-eintrag__t' }, mono((unterZeile(e) || e.seite_name) + (e.aus ? ' · hidden' : '')), el('b', {}, e.titel || 'Entry ' + (i + 1)),
        el('span', { class: 'ws-eintrag__auf' }, 'Edit'))), innen);
    karte.addEventListener('toggle', () => { if (karte.open) Z.auf.add(id); else Z.auf.delete(id); });
    raster.append(karte);
  });
  if (!d.eintraege.length) m.append(el('p', { class: 'kuhle ws-leer' }, 'The pages say nothing about this.'));
  if (opt.halten) window.scrollTo(0, oben);
}

// ---------------------------------------------------------------- Hinweis für Gäste
function datumZeigen(iso) { const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(iso || ''); return m ? `${+m[3]} ${MONAT[+m[2] - 1]} ${m[1]}` : (iso || ''); }   // Robert 28.11.2026 (Abnahme, Frage 5 a): «24 Dec 2026» wie überall im Werkzeug, der Server liest diese Schreibweise
function zeichneHinweis() {
  const m = leere($('#ws-mitte')), h = (Z.offen.hinweis ? Object.assign({}, Z.offen.hinweis, { von: Z.offen.hinweis.von, bis: Z.offen.hinweis.bis }) : null) || Z.stand.daten.hinweis || {};
  const grund = Z.stand.daten.hinweis || {};
  let an = !!h.an;
  const feld = (id, name, wert, opt = {}) => {
    const f = opt.lang_ ? el('textarea', { id, rows: 3 }) : el('input', { type: 'text', id, autocomplete: 'off', placeholder: opt.platz || null, inputmode: opt.modus || null, lang: opt.lang || null });
    f.value = wert || '';
    f.addEventListener('input', merk);
    return { f, k: el('div', { class: 'feld' }, el('label', { for: id }, name), f) };
  };
  const text = feld('ws-h-text', 'The notice (one or two sentences)', h.text, { lang_: true });
  const von = feld('ws-h-von', 'Show from (empty: right away)', datumZeigen(h.von), { platz: 'for example 24 Dec 2026' });
  const bis = feld('ws-h-bis', 'Show until (empty: until you turn it off)', datumZeigen(h.bis), { platz: 'for example 24 Dec 2026' });
  const lnk = feld('ws-h-link', 'Link (can stay empty)', h.link, { platz: 'https://… or page.html', modus: 'url' });
  const linktext = feld('ws-h-linktext', 'Link text', h.linktext, { platz: 'Read more' });
  const sp = Z.info.sprachen.map(s => {
    const alt = (h.sprachen || {})[s.code] || {};
    return { s, text: feld('ws-h-text-' + s.code, 'Notice ' + s.name, alt.text, { lang_: true, lang: s.code }), linktext: feld('ws-h-lt-' + s.code, 'Link text ' + s.name, alt.linktext, { lang: s.code }) };
  });
  const sammle = () => ({ art: 'hinweis', an, text: text.f.value, von: von.f.value, bis: bis.f.value, link: lnk.f.value, linktext: linktext.f.value,
                          sprachen: Object.fromEntries(sp.map(x => [x.s.code, { text: x.text.f.value, linktext: x.linktext.f.value }])) });
  const vergleich = o => JSON.stringify([!!o.an, o.text || '', datumZeigen(o.von), datumZeigen(o.bis), o.link || '', o.linktext || '', Z.info.sprachen.map(s => [((o.sprachen || {})[s.code] || {}).text || '', ((o.sprachen || {})[s.code] || {}).linktext || ''])]);
  function merk() { const o = sammle(); if (vergleich(o) === vergleich(grund)) vergessen('hinweis'); else vormerken('hinweis', o); }
  m.append(titel('All pages', 'Notice', 'for guests.', 'One sentence at the top of every page' + (Z.info.sprachen.length ? ', in all languages' : '') + ': a holiday closure, a closed area, a special evening. With dates set, it appears and goes away by itself.'),
    el('div', { class: 'platte ws-karte ws-form', style: 'max-width:760px', 'data-ws-form': 'hinweis' },
      el('div', { class: 'feld' }, el('span', {}, 'The notice is'), wahl2([{ wert: 'an', text: 'On' }, { wert: 'aus', text: 'Off' }], an ? 'an' : 'aus', x => { an = x === 'an'; merk(); }, 'Notice on or off', true)),
      text.k, el('div', { class: 'ws-zwei-werte' }, von.k, bis.k), el('div', { class: 'ws-zwei-werte' }, lnk.k, linktext.k),
      sp.length ? el('p', { class: 'ws-klein' }, 'A language without a translation shows the English notice.') : null,
      sp.map(x => el('div', { class: 'ws-sprachen' }, mono(x.s.name), x.text.k, x.linktext.k))));
}

// ---------------------------------------------------------------- Sprachen
async function zeichneSprachen(opt) {
  const m = $('#ws-mitte');
  let d;
  try { d = await ruf('GET', X('sprachen/' + HAUS)); } catch (e) { return fehler(e); }
  if (!opt.gilt()) return;
  leere(m).append(titel('All pages', '', 'Languages.', 'The website is in English, ' + d.sprachen.map(s => s.name).join(', ') + '. A text you change in English shows in English in the other languages until it is translated here. Nothing is guessed.'),
    el('div', { class: 'ws-mitte-reihe' }, wahl2([{ wert: 'alle', text: 'All changes' }, { wert: 'fehlt', text: 'Only what is missing' }], Z.spFilter, x => { Z.spFilter = x; zeichne({}); }, 'Which changes')));
  const zeilen = d.zeilen.filter(z => Z.spFilter === 'alle' || (!z.nur && Object.values(z.sp).some(x => x.da && !x.wert)));
  if (!zeilen.length) m.append(el('p', { class: 'kuhle ws-leer' }, d.zeilen.length ? 'No translation is missing.' : 'There is no changed text in the draft.'));
  zeilen.forEach(z => {
    const karte = el('section', { class: 'platte ws-karte', 'data-ws-sp': z.key },
      el('div', { class: 'ws-karte__kopf' }, el('b', {}, z.art === 'hinweis' ? 'Notice for guests' : z.nur ? 'Translation' : 'Text'), mono(z.wo)), werte(z),
      d.sprachen.map(s => {
        const x = z.sp[s.code];
        return el('div', { class: 'ws-sp-zeile' }, mono(s.name),
          !x.da ? el('span', { class: 'ws-klein' }, 'No match on the page in this language.') :
          x.wert ? el('span', {}, x.wert) : z.nur ? el('span', { class: 'ws-klein' }, 'stays: ' + anf(kurz(x.bisher, 140))) :
          el('span', {}, el('span', { class: 'ws-fehlt' }, 'missing'), x.bisher ? ' now: ' + anf(kurz(x.bisher, 140)) : ''));
      }));
    const fuss = el('div', { class: 'ws-reihe', style: 'padding-top:12px' });
    fuss.append(z.art === 'hinweis' ? taste('Translate', () => geh('hinweis')) : taste('Translate', () => oeffne({ seite: z.seite, h: z.h, n: z.n }, null, karte, { sprachen: true, zeigen: true })));
    karte.append(fuss);
    m.append(karte);
  });
}

// ---------------------------------------------------------------- Entwurf: jede Änderung, darunter Seite für Seite vorher und nachher
function werte(a) {
  const b = adr => el('img', { src: bild(adr), alt: '', loading: 'lazy' });
  return el('div', { class: 'ws-zwei-werte' },
    el('div', {}, mono('Before'), el('div', { class: 'ws-wert', 'data-ws-vorher': '1' }, a.vorher_bild ? b(a.vorher_bild) : (a.vorher || '(nothing)'))),
    el('div', {}, mono('After'), el('div', { class: 'ws-wert ws-wert--neu', 'data-ws-nachher': '1' }, a.nachher_bild ? b(a.nachher_bild) : (a.nachher || '(nothing)'))));
}
async function beispielEntwurf(m) {
  /* In der Vorführung nie leer (Master Werkzeug-Bau R20/M27): drei Stellen der Website, wie sie heute dort stehen, als beschriftetes Beispiel.
     Nur Ansicht, nichts davon liegt im Entwurf. “Nachher” ist kein erfundener Wert, sondern der Platz für die neue Angabe. */
  const ort = el('div', { class: 'ws-beispiele', 'data-ws-beispiel': 'entwurf' });
  m.append(el('p', { class: 'ws-satz ws-beispiel-satz' }, 'This is how a change shows here once you save something. The values under “Before” are on the website today.'), ort);
  let z;
  try { z = await ruf('GET', X('zahlen/' + HAUS)); } catch (e) { return; }
  if (Z.ansicht !== 'entwurf' || !ort.isConnected) return;
  const zeilen = [].concat(...(z.gruppen || []).map(g => g.zeilen || [])).filter(x => x.t && !x.zu).slice(0, 3);
  zeilen.forEach(x => ort.append(el('section', { class: 'platte ws-karte ws-karte--beispiel' },
    el('div', { class: 'ws-karte__kopf' }, el('b', {}, (x.vor || x.abschnitt || 'Detail')), mono('Example · ' + (x.orte && x.orte.length > 1 ? mz(x.orte.length, 'page', 'pages') : x.seite_name || ''))),
    werte({ vorher: x.t, nachher: 'Your new detail' }))));
}
function zeichneEntwurf() {
  const m = leere($('#ws-mitte')), ae = aend(), ew = eigen().filter(e => e.wartet && e.wartet()), nA = ae.length + eigenZahl('wartet');
  Z.vs = [];
  m.append(titel('Draft', 'Before', '& after.', nA ? mz(nA, 'change waiting', 'changes waiting') + '. Undo any of them, compare page by page below, then publish.' : 'The draft is the same as the website.',
    nA ? [kn('Publish', veroeffentlichen, 'kn--klein ws-kn-metall', { disabled: !!offenZahl() }), ae.length ? taste('Discard draft', verwerfen) : null].filter(Boolean) : null, true));
  ew.forEach(e => m.append(el('section', { class: 'platte ws-karte', 'data-ws-eigen-entwurf': e.key },   // eigene Ansichten (Termine): was wartet, Vergleich und Zurücknehmen in ihrer Ansicht
    el('div', { class: 'ws-karte__kopf' }, el('b', {}, e.name), mono(mz(e.wartet(), 'change', 'changes'))),
    el('div', { class: 'ws-liste-klein' }, (e.zeilen ? e.zeilen() : []).map(t => el('p', {}, t))),
    el('div', { class: 'ws-reihe', style: 'padding-top:12px' }, taste('View before/after', () => geh('e:' + e.key))))));
  if (!ae.length) return ew.length ? null : beispielEntwurf(m);
  /* Robert 28.11.2026 (Abnahme, Frage 3 a): Telefon, Adresse und Zeiten je als EINE Karte («Phone: alt → neu, 40 spots»), nicht eine Karte je Stelle.
     Der Server nennt die Angaben (stand.angaben_neu) und markiert ihre Stellen (aenderung.angabe). «Undo» stellt die Angabe auf den veröffentlichten Wert zurück. */
  (Z.stand.angaben_neu || []).forEach(g => m.append(el('section', { class: 'platte ws-karte', 'data-ws-aenderung': 'angabe|' + g.key, 'data-ws-angabe-karte': g.key },
    el('div', { class: 'ws-karte__kopf' }, el('b', {}, g.label), mono(mz(g.stellen, 'spot', 'spots') + ' on ' + mz(g.seiten, 'page', 'pages'))), werte(g),
    el('div', { class: 'ws-reihe', style: 'padding-top:12px' }, taste('Show', () => geh('angaben')), taste('Undo', () => sende([{ art: 'angabe', key: g.key, neu: g.vorher }], { titel: 'Undone' }))))));
  ae.filter(a => !(a.angabe && a.angabe.length)).forEach(a => {
    const fehlt = Object.entries(a.sprachen || {}).filter(([, ok]) => !ok).map(([c]) => c.toUpperCase());
    m.append(el('section', { class: 'platte ws-karte', 'data-ws-aenderung': a.key },
      el('div', { class: 'ws-karte__kopf' }, el('b', {}, a.was), mono(a.wo)), werte(a),
      fehlt.length ? el('p', { class: 'ws-klein', style: 'padding-top:10px' }, el('span', { class: 'ws-fehlt' }, 'Translation missing'), ' ' + fehlt.join(', ') + ': the English text shows there.') : null,
      el('div', { class: 'ws-reihe', style: 'padding-top:12px' },
        a.art === 'hinweis' ? taste('Show', () => geh('hinweis')) : a.seite ? taste('Show on page', () => inDerSeite(a.seite, a.art === 'text' ? { art: 'text', seite: a.seite, h: a.h, n: a.n } : a.art === 'bild' ? { art: 'bild', seite: a.seite, b: a.b, n: a.n } : null)) : null,
        taste('Undo', () => sende([{ art: 'weg', key: a.key }], { titel: 'Undone' })))));
  });
  // Seite für Seite
  const mit = new Set(ae.filter(a => a.seite).map(a => a.seite));
  if (!mit.size) mit.add(Z.info.seiten[0].datei);
  if (!mit.has(Z.vgl.seite)) Z.vgl.seite = [...mit][0];
  const hier = ae.filter(a => a.seite === Z.vgl.seite || !a.seite);
  const vor = vorschau('vorher', Z.vgl.seite, Z.vgl.sprache), nach = vorschau('nachher', Z.vgl.seite, Z.vgl.sprache);
  Z.vs = [vor, nach];
  const spVor = el('div', { 'data-ws-spalte': 'vorher' }, el('span', { class: 'ws-mono ws-leise' }, 'Before · published'), vor.k);
  const spNach = el('div', { 'data-ws-spalte': 'nachher' }, el('span', { class: 'ws-mono ws-leise' }, 'After · draft'), nach.k);
  const zeigeSicht = () => { if (schmal()) { spVor.hidden = Z.vgl.sicht !== 'vorher'; spNach.hidden = Z.vgl.sicht !== 'nachher'; requestAnimationFrame(() => Z.vs.forEach(v => v.passe())); } };
  const zeigeAenderung = (a, knopf) => {
    $$('[data-ws-vgl][aria-pressed="true"]').forEach(x => x.setAttribute('aria-pressed', 'false'));
    if (knopf) knopf.setAttribute('aria-pressed', 'true');
    const d = a.art === 'bild' ? { b: a.b, n: a.n } : a.art === 'aus' ? { blk: a.h, n: a.n } : { h: a.h, n: a.n };
    Z.vs.forEach(v => v.sende(Object.assign({ ws: 'zeige', key: a.key }, d)));
  };
  const alleSeiten = Z.info.seiten.filter(s => mit.has(s.datei));
  m.append(el('h2', { class: 'ws-zw', id: 'ws-vergleich' }, 'Compare ', el('em', {}, 'page by page')),
    el('div', { class: 'ws-reiter', style: 'margin-top:0' },
      auswahl(alleSeiten.map(s => ({ wert: s.datei, text: s.name, zusatz: String(ae.filter(a => a.seite === s.datei).length) })), Z.vgl.seite, x => { Z.vgl.seite = x; zeichne({ halten: true }); }, 'Page'),
      Z.info.sprachen.length ? auswahl([{ wert: 'de', text: 'English' }].concat(Z.info.sprachen.map(s => ({ wert: s.code, text: s.name }))), Z.vgl.sprache, x => { Z.vgl.sprache = x; Z.vs.forEach(v => { v.sprache = x; v.lade(true); }); }, 'Preview language', true) : null,
      schmal() ? wahl2([{ wert: 'vorher', text: 'Before' }, { wert: 'nachher', text: 'After' }], Z.vgl.sicht, x => { Z.vgl.sicht = x; zeigeSicht(); }, 'Before or after') : null,
      el('span', { class: 'ws-leise', 'data-ws-vgl-zahl': hier.length }, mz(hier.length, 'change', 'changes') + ' on this page, outlined')),
    el('div', { class: 'platte ws-karte', style: 'padding-top:10px;padding-bottom:10px', 'data-ws-vgl-liste': '1' }, hier.map(a => {
      const reihe = el('div', { class: 'ws-zl', style: 'grid-template-columns:minmax(0,1fr)' });
      const kl = adr => el('img', { src: bild(adr), alt: '', style: 'display:block;height:24px;width:auto;border-radius:4px' });   // Abnahme 28.11.2026: Foto als zwei kleine Bilder statt «b24 → b08»
      const knopf = el('button', { class: 'ws-zl__wert', type: 'button', 'aria-pressed': 'false', 'data-ws-vgl': a.key, onclick: () => zeigeAenderung(a, knopf) },
        a.vorher_bild && a.nachher_bild ? el('span', { style: 'display:inline-flex;align-items:center;gap:10px;vertical-align:middle' }, kl(a.vorher_bild), '→', kl(a.nachher_bild)) : (kurz(a.vorher, 80) || '(nothing)') + '  →  ' + (kurz(a.nachher, 80) || '(nothing)'));
      reihe.append(mono(a.was + (a.seite ? '' : ' · all pages')), knopf);
      return reihe;
    })),
    el('div', { class: 'ws-zwei' }, spVor, spNach));
  zeigeSicht();
  const erste = () => { if (hier.length && vor.bereit && nach.bereit) zeigeAenderung(hier[0], $('[data-ws-vgl]')); };
  vor.nach = erste; nach.nach = erste;
}
function verwerfen() {
  fenster('Discard the', 'whole draft?', el('p', {}, mz(aend().length, 'change', 'changes') + ' will be lost. The published website stays as it is.'), [
    { text: 'Cancel' },
    { text: 'Yes, discard', haupt: true, tun: async zu => {
      zu();
      try { await ruf('DELETE', '/the-cat-and-gun/haus/api/entwurf/' + HAUS + '/' + W, { wer: wer() }); } catch (e) { return fehler(e); }
      Z.offen = {};
      await ladeStand(); melde('The draft is discarded', { mehr: 'The website stays as it was published.' }); zeichne({});
    } }], { name: 'verwerfen' });
}

// ---------------------------------------------------------------- Veröffentlichen
function veroeffentlichen() {
  const s = Z.stand, ae = aend(), ew = eigen().filter(e => e.wartet && e.wartet()), nE = eigenZahl('wartet');
  if (offenZahl()) { melde('Save first', { mehr: 'Entries that are not saved yet would be left out.' }); return; }
  if (!ae.length && !ew.length) { melde('Nothing changed, nothing published.'); return; }
  const notiz = el('input', { type: 'text', id: 'ws-notiz', autocomplete: 'off', maxlength: '200', placeholder: 'for example: new opening hours' });
  const seiten_ = new Set(ae.map(a => a.seite).filter(Boolean));
  const inhalt = el('div', { class: 'ws-form' },
    el('p', {}, mz(ae.length + nE, 'change goes', 'changes go') + ' on the website' + (seiten_.size ? ', on ' + mz(seiten_.size, 'page', 'pages') : '') + (Z.info.sprachen.length ? ', in all languages' : '') + '.'),
    ew.length ? el('div', { class: 'ws-liste-klein', 'data-ws-eigen': ew.map(e => e.key).join(' ') }, ew.flatMap(e => (e.zeilen ? e.zeilen() : []).slice(0, 5).map(t => el('p', {}, e.name + ': ' + t)))) : null,
    el('div', { class: 'ws-liste-klein' }, ae.slice(0, 5).map(a => el('p', {}, a.art === 'bild' ? a.wo + ': ' + a.was : a.wo + ': ' + anf(kurz(a.vorher, 60) || 'nothing') + ' becomes ' + anf(kurz(a.nachher, 60) || 'nothing'))),   // Abnahme 28.11.2026: ein Foto heisst «Photo», nicht nach dem Dateischlüssel («b24» becomes «b08»)
      ae.length > 5 ? el('p', { class: 'ws-klein' }, '+ ' + (ae.length - 5) + ' more, see “Draft & compare”') : null),
    s.fehlt ? el('p', { 'data-ws-fehlt-hinweis': s.fehlt }, el('span', { class: 'ws-fehlt' }, 'Translation missing'), ' ' + mz(s.fehlt, 'translation missing', 'translations missing') + '. After publishing, the English text shows there.') : null,
    el('div', { class: 'feld' }, el('label', { for: 'ws-notiz' }, 'Note for earlier versions (can stay empty)'), notiz),
    el('p', { class: 'ws-klein' }, 'Today’s version is kept. You can restore it at any time.'));
  fenster('Put it on', 'the website.', inhalt, [
    { text: 'Cancel' },
    s.fehlt ? { text: 'Translate first', tun: zu => { zu(); geh('sprachen'); } } : null,
    { text: 'Publish now', haupt: true, tun: async zu => {
      let a = { stand: Z.stand, aenderungen: 0, geschrieben: [], online: Z.info.online };
      if (ae.length) try { a = await ruf('POST', X('veroeffentlichen/' + HAUS), { erwartet: s.kennung, wer: wer(), notiz: notiz.value }); } catch (e) {
        zu();
        if (e.status === 409 && e.stichwort === 'konflikt') { await ladeStand(); melde('Someone else changed the draft in another window', { mehr: 'Please look at “Before/After” again, then publish.', stichwort: 'konflikt' }); return zeichne({}); }
        return fehler(e);
      }
      let nEig = 0;
      for (const e of ew) { try { nEig += await e.veroeffentlichen(notiz.value); } catch (x) { zu(); Z.stand = a.stand; allesNeu(); return fehler(x); } }
      zu();
      Z.stand = a.stand; allesNeu();
      quit('It is online', mz(a.aenderungen + nEig, 'change is', 'changes are') + ' on the website' + (a.geschrieben.length ? ', ' + mz(a.geschrieben.length, 'file', 'files') + ' written' : '') + '. The previous version is kept.', [
        el('a', { class: 'ws-taste', href: a.online + (Z.seite || Z.info.seiten[0].datei), target: '_blank', rel: 'noopener' }, 'View website'), taste('Earlier versions', () => geh('verlauf'))], { 'data-ws-veroeffentlicht': a.geschrieben.length });
      if (Z.ansicht === 'entwurf') geh('verlauf'); else zeichne({ halten: true, neuLaden: true });
    } }], { name: 'veroeffentlichen' });
}

// ---------------------------------------------------------------- Frühere Fassungen
const VERMERK = { grundstand: 'First version read in', entwurf: 'Saved in the draft', verworfen: 'Draft discarded', veroeffentlicht: 'Published', zurueckgeholt: 'Earlier version restored as draft', 'aus-sicherung': 'Version restored from backup' };
async function zeichneVerlauf(opt) {
  const m = $('#ws-mitte');
  let d;
  try { d = await ruf('GET', X('verlauf/' + HAUS)); } catch (e) { return fehler(e); }
  if (!opt.gilt()) return;
  const name = el('input', { type: 'text', id: 'ws-wer', value: wer(), autocomplete: 'off', maxlength: '60', placeholder: 'for example: Julie' });
  name.addEventListener('change', () => { try { localStorage.setItem('ws-wer', name.value.trim()); } catch (e) { /* ohne Merken */ } melde('Your name now appears in the log.'); });
  leere(m).append(titel('Draft', 'Earlier', 'versions.', 'Every publish is kept. An earlier version goes into the draft first: you see before and after, then you publish.'));
  if (!d.verlauf.length) m.append(el('p', { class: 'kuhle ws-leer' }, 'Nothing has been published yet. The first version is the website as it was built.'),
    el('section', { class: 'platte ws-karte ws-karte--beispiel', 'data-ws-beispiel': 'verlauf' },   // R20/M27: beschriftetes Beispiel statt Leere, ohne Datum und ohne Zahl, die es nicht gibt
      el('div', { class: 'ws-karte__kopf' }, el('b', {}, 'Version until …'), mono('Example · this is how an earlier version shows here')),
      el('p', {}, 'After each publish, the previous version is kept here: with the date, who replaced it, how many spots differ, and your note.'),
      el('div', { class: 'ws-reihe', style: 'padding-top:12px' }, taste('View differences', null, { disabled: true }), taste('Restore', null, { disabled: true }))));
  d.verlauf.forEach(v => {
    const ort = el('div', { hidden: true, class: 'ws-liste-klein', style: 'padding-top:8px' });
    m.append(el('section', { class: 'platte ws-karte', 'data-ws-fassung': v.fassung },
      el('div', { class: 'ws-karte__kopf' }, el('b', {}, v.ursprung ? 'Original version' : 'Version until ' + zeit(v.abgeloest)), mono((v.ursprung ? 'the website as built · ' : '') + (v.wer ? 'replaced by ' + v.wer + ' · ' : '') + mz(v.unterschiede, 'difference', 'differences') + ' from today')),
      v.notiz ? el('p', {}, 'Note: ' + v.notiz) : null, ort,
      el('div', { class: 'ws-reihe', style: 'padding-top:12px' },
        taste('View differences', async () => {
          if (!ort.hidden) { ort.hidden = true; return; }
          let f;
          try { f = await ruf('GET', X('fassung/' + HAUS + '/' + v.fassung)); } catch (e) { return fehler(e); }
          leere(ort);
          if (!f.aenderungen.length) ort.append(el('p', {}, 'This version is the same as today’s.'));
          f.aenderungen.forEach(a => ort.append(el('p', {}, a.art === 'bild' ? a.wo + ' · ' + a.was : a.wo + ' · ' + a.was + ': today ' + anf(kurz(a.vorher, 90) || 'nothing') + ', then ' + anf(kurz(a.nachher, 90) || 'nothing'))));
          ort.hidden = false;
        }),
        taste('Restore', () => zurueckholen(v)))));
  });
  const prot = el('div', { class: 'ws-liste-klein', 'data-ws-protokoll': '1' });
  d.protokoll.forEach(p => prot.append(el('p', {}, zeit(p.zeit) + ' · ' + (VERMERK[p.was] || p.was) + (p.wer && p.wer !== 'werkzeug' ? ' · ' + p.wer : '') + (p.notiz ? ' · ' + p.notiz : ''))));   // Abnahme 28.11.2026: den ersten Stand liest das Werkzeug selbst ein («werkzeug»), das deutsche Wort steht nicht im Log
  m.append(el('section', { class: 'platte ws-karte' }, el('div', { class: 'ws-karte__kopf' }, el('h2', {}, 'Log'), mono('who, when, what')),
    fn('team_wer') ? null : el('div', { class: 'feld', style: 'max-width:420px;margin:10px 0 14px' }, el('label', { for: 'ws-wer' }, 'Your name in the log'), name), prot));
}
function zurueckholen(v) {
  const a = aend().length;
  fenster('Restore', 'this version?', el('div', { class: 'ws-form' },
    el('p', {}, 'The version until ' + zeit(v.abgeloest) + ' becomes the draft. Nothing changes online yet: you see it first under “Before/After”, then you publish.'),
    a ? el('p', { 'data-ws-ersetzt': '1' }, 'Careful: your open draft with ' + mz(a, 'change', 'changes') + ' will be replaced.') : null), [
    { text: 'Cancel' },
    { text: 'Restore as draft', haupt: true, tun: async zu => {
      zu();
      try { await ruf('POST', '/the-cat-and-gun/haus/api/zurueckholen/' + HAUS + '/' + W, { fassung: v.fassung, wer: wer() }); } catch (e) { return fehler(e); }
      Z.offen = {};
      await ladeStand();
      if (!Z.stand.offen) { melde('This version is the same as today’s', { mehr: 'There is nothing to publish.' }); return zeichne({}); }
      melde('The earlier version is ready as a draft', { mehr: 'It goes online only when you publish.' });
      geh('entwurf');
    } }], { name: 'zurueckholen' });
}

// ---------------------------------------------------------------- Zeichnen und Start
function eigenHilfe(opt) {   // was eine eigene Ansicht vom Werkzeug braucht: Bausteine, Meldungen, Fenster, Leiste und Rand neu zeichnen
  return { el, titel, mono, kn, taste, link, mz, kurz, anf, zeit, melde, fehler, quit, fenster, auswahl, wahl2, wer, geh, opt, neu: allesNeu, leiste, wom: WOM, haus: HAUS, info: Z.info, ansicht: () => Z.ansicht };
}
async function zeichne(opt = {}) {
  /* Jede Ansicht holt erst ihre Daten und zeichnet dann. Wer inzwischen weitergegangen ist, darf nicht mehr zeichnen:
     opt.gilt() sagt jeder Ansicht nach dem Holen, ob sie noch die aktuelle ist. */
  const lauf = ++Z.zl, a = Z.ansicht, m = $('#ws-mitte');
  opt = Object.assign({}, opt, { gilt: () => lauf === Z.zl });
  m.removeAttribute('data-ws-bereit');
  m.setAttribute('data-ws-ansicht', a);
  if (!a.startsWith('b:')) { m.removeAttribute('data-ws-web'); if (a !== 'entwurf') Z.vs = []; }
  try {
    if (a === 'start') zeichneStart();
    else if (a.startsWith('b:')) await zeichneWeb(opt);
    else if (a === 'zahlen') await zeichneZahlen(opt);
    else if (a === 'angaben') await zeichneAngaben(opt);
    else if (a === 'google') await zeichneGoogle(opt);
    else if (a.startsWith('haus:')) await zeichneHaus(opt);
    else if (a.startsWith('e:') && EIGEN[a.slice(2)]) await EIGEN[a.slice(2)].zeichne(leere(m), eigenHilfe(opt));
    else if (a === 'hinweis') zeichneHinweis();
    else if (a === 'sprachen') await zeichneSprachen(opt);
    else if (a === 'entwurf') zeichneEntwurf();
    else if (a === 'verlauf') await zeichneVerlauf(opt);
  } catch (e) { fehler(e); }   // ein Fehler beim Zeichnen steht auf der Seite, nie nur in der Konsole
  if (DX) dxSpiegel();
  if (opt.gilt()) m.setAttribute('data-ws-bereit', a);
}
function startFehler(e) {
  const text = (e && e.fehler) || (e && e.message) || String(e);
  merke('Start: ' + text, e && e.stichwort);
  $('#ws-rand').hidden = true;
  if ($('#ws-ansicht-name')) $('#ws-ansicht-name').textContent = 'Does not start';
  if (WOM) $('#ws-kopf').innerHTML = WO.kopf({ werkzeug: W, unter: 'Website', titel: 'Does not start', stand: 'Open checks', pruefung: pruefLink(e && e.stichwort), website: '/' });   // R04: Tür im Kopf des Hauses
  leere($('#ws-leiste')).append(el('div', { class: 'ws-leiste__t' }, el('b', {}, el('span', {}, 'The tool does not start')), el('span', {}, 'Nothing is lost: the draft and the published version are on the server.')),
    el('button', { class: 'kn ws-speichern', id: 'ws-speichern', type: 'button', disabled: true }, el('span', {}, 'Save'), el('i', { 'aria-hidden': 'true', html: PF })));
  leere($('#ws-mitte')).append(el('div', { class: 'platte ws-karte ws-form', style: 'max-width:640px;margin-top:40px', 'data-ws-startfehler': (e && e.stichwort) || 'unerwartet' },
    mono('The tool does not start'), el('h2', {}, text),
    el('p', {}, 'The checks run separately from the tool and show what is wrong.'),
    el('div', { class: 'ws-reihe' }, el('a', { class: 'kn kn--d kn--klein', href: pruefLink(e && e.stichwort) }, el('span', {}, 'Open checks'), el('i', { 'aria-hidden': 'true', html: PF })), taste('Try again', () => location.reload()))));
  if (WOM) return;   // der Rahmen des Hauses ordnet Raum und Leiste selbst
  $('#ws-mitte').style.paddingLeft = 'clamp(22px,2.6vw,46px)';
  $('#ws-leiste').style.left = 'clamp(22px,2.6vw,46px)';
}
async function start() {
  window.addEventListener('beforeunload', ev => { if (offenZahl()) { ev.preventDefault(); ev.returnValue = ''; } });
  window.addEventListener('error', ev => merke(ev.message || 'Error in the tool', 'unerwartet'));
  window.addEventListener('unhandledrejection', ev => merke((ev.reason && (ev.reason.fehler || ev.reason.message)) || 'Error in the tool', (ev.reason && ev.reason.stichwort) || 'unerwartet'));
  document.addEventListener('keydown', ev => { if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 's' && Z.info) { ev.preventDefault(); speichern(); } });
  if ($('#ws-marke')) $('#ws-marke').addEventListener('click', () => { if (Z.info) geh('start'); });
  if (!HAUS) return startFehler({ stichwort: 'haus-unbekannt', fehler: 'The address is missing the house. It must end with ?haus= and your house code.' });
  try {
    Z.info = await ruf('GET', X('haus/' + HAUS));
    Z.info.basis = Z.info.online.replace(/online\/$/, 'grundlage/');
    await stilLaden();
    await Promise.all(eigen().map(e => e.bereit && e.bereit().catch(x => merke('Own view ' + e.key + ': ' + ((x && x.fehler) || x), x && x.stichwort))));   // Daten der eigenen Ansichten vor dem ersten Zeichnen (Leiste und Rand zählen sie mit)
    kleid();
    Welt.bei(() => { if (!Z.stand) return;   /* Weltwechsel vor dem ersten Stand (unter Last, Demo-Check Schäfli 21.10.2026): gezeichnet wird nach ladeStand ohnehin */ kleid(); allesNeu(); Z.vs.forEach(v => v.farben()); if (!$('.ws-ed') && !$('#ws-fenster').childElementCount) zeichne({ halten: true }); });
    await ladeStand();
    const q = new URLSearchParams(location.search);
    let a = q.get('ansicht');
    if (!a && !q.get('seite')) {   // dort weitermachen, wo man zuletzt war
      try { const o = JSON.parse(localStorage.getItem('ws-ort-' + HAUS) || 'null'); if (o && ansichtName(o.a)) { a = o.a; if (Z.info.seiten.some(s => s.datei === o.s)) Z.seite = o.s; } } catch (e) { /* ohne Merken */ }
    }
    if (a && (ansichtName(a) || a === 'start')) Z.ansicht = a;
    const sp = SPRUNG[location.hash];   // Sprungwege aus dem Control panel (Oberchat 28.11.2026): #notice, #hours
    if (sp) Z.ansicht = sp;
    if (q.get('seite') && Z.info.seiten.some(s => s.datei === q.get('seite'))) { Z.seite = q.get('seite'); const b = bereichVon(Z.seite); if (b && !a) Z.ansicht = 'b:' + b.key; }
    allesNeu();
    await zeichne({});
    if (sp) sprungFokus(sp);
    addEventListener('hashchange', () => { const z = SPRUNG[location.hash]; if (z) geh(z).then(() => sprungFokus(z)); });
  } catch (e) { startFehler(e); }
}
/* Sprungwege für die Kacheln im Control panel (Oberchat 28.11.2026): /the-cat-and-gun/haus/_werkzeuge/bureau/#notice öffnet den Hinweis für Gäste, gleich zum Schreiben;
   /the-cat-and-gun/haus/_werkzeuge/bureau/#hours öffnet Telefon, Adresse und Öffnungszeiten. */
const SPRUNG = { '#notice': 'hinweis', '#hours': 'angaben' };
function sprungFokus(a) {
  const f = a === 'hinweis' ? $('#ws-h-text') : $('[data-ws-angabe]');
  if (f) { f.focus({ preventScroll: true }); f.scrollIntoView({ block: 'center' }); }
}
start();
})();
