/* Menus & price lists · The Cat & Gun — Bedienung (22.11.2026, Kopie aus der Pairing-Karte im Culinarium Hannover, dort aus der Tafel im Schäfli,
   Schlössli, Gasterntal, Ruedihus, Doldenhorn, Carlton-Europe und mc.js des Grand Beau-Rivage). Karten des Hauses wie gedruckt (_karte-aktuell/): Drinks, Coffee & juices, Kitchen
   (die Gruppen der Menüseite). Die Karte ist ein Baum aus dem Satz (satz/satz.js, gesetzt von satz_bau.py aus den Daten der Website, karten_lesen.py);
   Einträge, Rubriken und Texte erkennt SATZ.art(), die Felder eines Eintrags SATZ.felder(). Zwei Wege «Simple» (Liste und Fenster) und «Advanced»
   (direkt in der Karte schreiben), jede Änderung zuerst als Entwurf, Veröffentlichen druckt die PDF, prüft sie gegen die Daten und baut die Menüseite
   der Website. Rahmen (Kopf, Rand, Startbild, Leiste) aus der Werkzeug-Oberfläche (/the-cat-and-gun/haus/_werkzeuge/carte/_ob/, Rahmen «Die Bühne», Kleid catgun).
   «Der nächste Abend» der Vorlage entfällt (feste Karte). Die Karte im Laden ist auf Bretter gedruckt: nie behaupten, eine Änderung gehe dorthin.
   Oberfläche englisch. Server: carte.py über serve.py. Ohne Bibliothek. Kein Auswahlfeld des Betriebssystems. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const h = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const kopie = x => JSON.parse(JSON.stringify(x));
const PF = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 11 11 3M4.5 3H11v6.5"/></svg>';
const SYM = {
  hoch: '<svg viewBox="0 0 14 14"><path d="m2.5 9 4.5-4.5L11.5 9"/></svg>', runter: '<svg viewBox="0 0 14 14"><path d="m2.5 5 4.5 4.5L11.5 5"/></svg>',
  zu: '<svg viewBox="0 0 16 16"><path d="M6 9.67 2.67 6.33 6 3M2.67 6.33h7.33a3.33 3.33 0 0 1 0 6.67h-2"/></svg>', auge: '<svg viewBox="0 0 16 14"><path d="M1 7s2.6-4.5 7-4.5S15 7 15 7s-2.6 4.5-7 4.5S1 7 1 7Z"/><circle cx="8" cy="7" r="1.9"/></svg>',
  augezu: '<svg viewBox="0 0 16 14"><path d="M1 7s2.6-4.5 7-4.5S15 7 15 7s-2.6 4.5-7 4.5S1 7 1 7Z"/><path d="m3 1 10 12"/></svg>',
  korb: '<svg viewBox="0 0 14 14"><path d="M2.5 4h9M5.5 4V2.5h3V4M3.5 4l.6 7.5h5.8L10.5 4"/></svg>', stift: '<svg viewBox="0 0 14 14"><path d="M9.5 2.5 11.5 4.5 5 11H3V9z"/></svg>',
  plus: '<svg viewBox="0 0 14 14"><path d="M7 2.5v9M2.5 7h9"/></svg>', haken: '<svg viewBox="0 0 14 14"><path d="m2.5 7.5 3 3 6-7"/></svg>',
  links: '<svg viewBox="0 0 14 14"><path d="m9 2.5-4.500 4.500L9 11.500"/></svg>', rechts: '<svg viewBox="0 0 14 14"><path d="m5 2.5 4.500 4.500L5 11.500"/></svg>',
  kopie: '<svg viewBox="0 0 14 14"><rect x="4.500" y="4.500" width="7" height="7" rx="1.200"/><path d="M9.500 4.500V3a.8.8 0 0 0-.8-.8H3A.8.8 0 0 0 2.200 3v5.700a.8.8 0 0 0 .8.8h1.500"/></svg>',
};
/* Hauswerte The Cat & Gun: Foto je Karte (Kachel im Rand und Startbild) und je Rubrik aus den Fotos der Website (website/bilder.json, ausgeliefert unter
   /the-cat-and-gun/haus/assets/bild/<schlüssel>-<breite>.webp). Die Zuordnung schreibt einlesen.py nach bilder/fotos.json (eine Stelle). Rubriken ohne eigenes Foto tragen das
   Et-Zeichen der Wortmarke (kein Foto doppelt, Fehlerbuch 10a). */
let FOTO = {};
const fotoKlein = z => `/the-cat-and-gun/haus/_werkzeuge/carte/bilder/z/${FOTO[z] || 'b16'}.webp`;   // 112 px (einlesen.py vorschaubilder)
const fotoGross = z => `/the-cat-and-gun/haus/assets/bild/${FOTO[z] || 'b16'}-1200.webp`;
const ROLLEN = { kueche: 'Kitchen', service: 'Service', direktion: 'Manager' };
/* Namen der Werkzeuge nur aus kleid/catgun.js (WO_HAUS.namen, eine Stelle) */
const NAME = (window.WO && WO.name('karten')) || 'Menus & price lists', STUBE = (window.WO && WO.name('zentrale')) || 'Control panel', SCHREIBTISCH = (window.WO && WO.name('website')) || 'Edit website';
const klein = n => n.charAt(0).toLowerCase() + n.slice(1);   // Name mitten im Satz
/* Die Website: lokal liefert dieser Server ihre Seiten nur lesend aus (serve.py), online liegt sie auf derselben Adresse. Die anderen Werkzeuge je auf
   ihrem Port (WO_HAUS.ports), immer 127.0.0.1 (Fehlerbuch 10a). Eine Werkbank mit eigenem Server gibt es hier nicht. */
const PORTE = (window.WO_HAUS && WO_HAUS.ports) || { zentrale: 9731, marke: 9732, website: 9733, karten: 9730, gaeste: 9735, besuche: 9736, druck: 9738 };
const HAUS = '/';
const PORT_WERKZEUG = PORTE;
const API = '/the-cat-and-gun/haus/_werkzeuge/carte/api/';   // lokal (serve.py) und online derselbe Weg
/* Wo die Karte auf der Website steht: alle drei auf der Menüseite (menu.html), je Karte ihr Abschnitt (id aus der Website, karten_lesen.py, web.py).
   Die anderen Seiten der Website baut das Werkzeug nicht (23.11.2026: nur die gedruckte Karte, web.py). */
const SEITE_DER_KARTE = {};
const ORT_DER_KARTE = { 'menu.html': 'Menu page' };
const WEBSEITEN = [['menu.html', 'Menu page']];
let WEBSEITE = 'menu.html';
/* 23.11.2026: die Website (website/) zeigt bis zum Online-Gang die frühere Karte; «Menu on the website» öffnet darum die Menüseite, die das Werkzeug aus der
   gedruckten Karte baut (web.py), wie sie nach dem Veröffentlichen online steht. */
const webAdresse = z => `${API}webseite?z=${encodeURIComponent(z)}&seite=menu.html${STAND && STAND.web ? '#' + STAND.web : ''}`;
/* Bildzeichen an Gerichten gibt es nicht (Marken V und R stehen als Text) */
const SYMBOLE = [];
/* Wege der Oberfläche: lokal liegen La Maison, Le Bureau und die anderen Werkzeuge je auf ihrem Prüfserver */
/* Mac-Prüfung 23.11.2026 (Punkt 19): lokal zeigt ein Knopf nur dann zu einem anderen Werkzeug, wenn es antwortet. Bis zur Antwort und für jedes Werkzeug,
   dessen Server nicht läuft, steht der Name ohne Link (oberflaeche.js: «wo-aus»). Online bleiben die Wege relativ (Unterbau). */
const WEGE_ROH = {};
const LOKAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
if (window.WO && WO.haus && WO.haus.wege && LOKAL) Object.keys(WO.haus.wege).forEach(k => { if (k === 'karten') return; WEGE_ROH[k] = (WO.haus.wege[k] || '').replace(/^https?:\/\/[^/]+/, ''); WO.haus.wege[k] = ''; });
async function wegePruefen() {
  if (!LOKAL || !Object.keys(WEGE_ROH).length) return;
  let da = null;
  try { da = await api('wege'); } catch (e) { da = null; }
  for (const k of Object.keys(WEGE_ROH)) {
    if (da) { WO.haus.wege[k] = da[k] || ''; continue; }
    /* ohne den Weg «wege» (anderer Server für das ganze Haus): liefert er das Werkzeug unter derselben Adresse? */
    try { const r = await fetch(WEGE_ROH[k], { cache: 'no-store' }); if (r.ok && !/\/_werkzeuge\/carte\//.test(r.url)) WO.haus.wege[k] = WEGE_ROH[k]; } catch (e) { /* bleibt ohne Link */ }
  }
  rand(); oben();
}

let NEU_KARTE = false, ANSICHT = 'karte';
let LISTE = [], Z = '', STAND = null, D = null, BASIS = '', MODUS = 'einfach', OFFEN = false, UNDO = [], BLITZ = null, ERWARTET = null, SCHRIFT = null;
const ZM_STD = { einfach: 0.62, frei: 0.8 };   // Doldenhorn: ab dem ersten «+» darf die Vorschau breiter werden als ihr Platz (seitlich schieben)
let WER = 'Team The Cat & Gun', ROLLE = 'direktion',   /* Robert 20.10.2026: «Entfernen diese, wer arbeitet hier? Abfrage.» Fester Eintrag im Protokoll, volle Rechte; Anmeldung erst bei der Auslieferung */
    ZM = { einfach: 0.6, frei: 0.78 }, BEREIT = false, TEXTGEAENDERT = false, TIMER = null, BERICHT = null, GESCHRIEBEN = [], EINST = {}, RECHTE = {};
/* Robert 28.11.2026: «Am Handy nur Simple». Unter 768 px gibt es nur den einfachen Modus, der Schalter zu «Advanced» erscheint dort nicht (carte-look.css). */
const HANDY = () => innerWidth < 768;
try { MODUS = localStorage.getItem('lc-modus') || 'einfach'; ZM.einfach = +(localStorage.getItem('lc-zoom-einfach') || 0.62); ZM.frei = +(localStorage.getItem('lc-zoom-frei') || 0.8); } catch (e) { /* ohne Speicher geht es auch */ }
if (HANDY()) MODUS = 'einfach';

// ---------------------------------------------------------------- Verbindung
async function api(was, daten) {
  const kopf = { 'X-Carte-Wer': encodeURIComponent(WER), 'X-Carte-Rolle': ROLLE };
  const o = daten === undefined ? { cache: 'no-store', headers: kopf } : { method: 'POST', headers: { 'Content-Type': 'application/json', ...kopf }, body: JSON.stringify(daten) };
  let r;
  try { r = await fetch(API + was, o); } catch (e) { const f = new Error('No connection. Your input is still here. Please try again in a moment.'); f.stichwort = 'VERBINDUNG'; throw f; }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(j.fehler || 'That did not work.'); e.stichwort = j.stichwort || ''; e.status = r.status; throw e; }
  return j;
}
function sag(titel, text = '', knoepfe = [], fehl = false, dauer = 0) {
  const m = document.createElement('div');
  m.className = 'quit' + (fehl ? ' fehl' : '');
  m.innerHTML = `<div style="flex:1;min-width:0"><b>${h(titel)}</b>${text ? `<span>${h(text)}</span>` : ''}</div>` + knoepfe.map((k, i) => k.href ? `<a href="${h(k.href)}" target="_blank" rel="noopener">${h(k.t)}</a>` : `<button type="button" data-i="${i}">${h(k.t)}</button>`).join('');
  m.addEventListener('click', ev => { const b = ev.target.closest('button[data-i]'); if (b) { knoepfe[+b.dataset.i].f(); m.remove(); } });
  const ort = $('#meldung');
  [...ort.children].forEach(x => { if (x.textContent === m.textContent) x.remove(); });   // dieselbe Meldung nicht doppelt (Speichern und Verlassen des Feldes zugleich, 16.10.2026)
  ort.appendChild(m);
  while (ort.children.length > 2) ort.firstElementChild.remove();
  setTimeout(() => m.remove(), dauer || (fehl ? 12000 : 6000));
}
const fehlerSagen = (titel, e) => sag(titel, e.message + (e.stichwort ? ` (${e.stichwort})` : ''), e.stichwort ? [{ t: 'What to do?', href: '/the-cat-and-gun/haus/_werkzeuge/carte/anleitung.html#' + e.stichwort }] : [], true);

// ---------------------------------------------------------------- Daten-Hilfen
const istKnoten = x => x && typeof x === 'object' && !Array.isArray(x) && x.fn;
const inhalt = d => JSON.stringify({ s: d.seiten, c: d.css });
const geaendert = () => inhalt(D) !== inhalt(STAND);
const liesPfad = (o, p) => p.split('.').reduce((x, k) => x == null ? x : x[/^\d+$/.test(k) ? +k : k], o);
function setzePfad(o, pfad, wert) {
  const kp = /^(.*)~kap(\d)$/.exec(pfad);   // Name oder Rubrik in Kapitälchen: ganzer Wortlaut, gesetzt wie die Werkbank (satz.js kapBau)
  if (kp) { const e = liesPfad(o, kp[1]); e.a = [e.a[0], e.a[1]].concat(SATZ.kapBau(String(wert), kp[2] === '1')).concat(e.a.slice(2).filter(y => y && y.fn === 'el' && /(^| )sb-mp( |$)/.test(SATZ.klasse(y)))); return; }
  const k = pfad.split('.'); let x = o;
  for (let i = 0; i < k.length - 1; i++) x = x[/^\d+$/.test(k[i]) ? +k[i] : k[i]];
  const l = k[k.length - 1]; x[/^\d+$/.test(l) ? +l : l] = wert;
}
function vater(pfad) { const k = pfad.split('.'), i = +k.pop(); return { arr: liesPfad(D, k.join('.')), idx: i, arrPfad: k.join('.') }; }
const istEl = x => istKnoten(x) && x.fn === 'el';
const nachbar = (arr, i, r) => { for (let j = i + r; j >= 0 && j < arr.length; j += r) if (istEl(arr[j]) && !arr[j].aus) return j; return -1; };
/* Preis in der Schreibweise der Karte des Hauses (website/menu.html: «260», «280 / 380», ganze Pesos, die Einheit «PHP» steht im eigenen Feld):
   «260.00» → «260», «280/380» → «280 / 380»; Vorschlag aus den Nachbarpreisen (C03) */
function nachbarPreise() {
  const aus = [];
  (D.seiten || []).forEach((s, i) => zeilenSeite(i).forEach(r => SATZ.felder(r.n, r.art).forEach(f => { if (f.preis && /\d/.test(f.wert)) aus.push(f.wert.trim()); })));
  return aus.slice(0, 120);
}
function preisForm(v) {
  const t = String(v ?? '').trim().replace(/\s*(?:php|₱)\s*$/i, '');
  const eins = x => { const m = /^(\d{1,5})(?:[.,](\d{1,2}))?$/.exec(x.trim()); if (!m) return null; return m[2] && +m[2] ? m[1] + '.' + m[2].padEnd(2, '0') : m[1]; };
  const teile = t.split('/').map(eins);
  if (teile.some(x => x === null)) return t;
  return teile.join(' / ');
}

/* Arten der Einträge (satz.js art): was die Liste zeigt und wie das Fenster heisst */
const FN = { eintrag: 'Item', rubrik: 'Section', zwischen: 'Subtitle', titel: 'Title', text: 'Text' };
const LANG = /^(Description|Add-ons|Explanation|Note|Text)/;
function artVon(pfad, d = D) { const k = pfad.split('.'), e = liesPfad(d, k.slice(0, -2).join('.')); return SATZ.art(liesPfad(d, pfad), istKnoten(e) ? e : null); }
function titelVon(n, art) {
  const f = SATZ.felder(n, art || SATZ.art(n));
  const w = f.find(x => /^(Name|Section|Title|Rubrik|Titel)/.test(x.name) && String(x.wert).trim()) || f.find(x => String(x.wert).trim() && !x.preis && !/^(Unit|Marks|Label)/.test(x.name));
  return w ? String(w.wert).replace(/\s+/g, ' ').trim() : (FN[art] || 'Item');
}
function unterVon(n, art) {
  const f = SATZ.felder(n, art || SATZ.art(n)), t = titelVon(n, art);
  return f.filter(x => /^(Description|Note|Add-ons|Explanation|Text)/.test(x.name) && String(x.wert).trim() && String(x.wert).trim() !== t).map(x => String(x.wert).trim()).join(' · ').slice(0, 160);
}
function markeVon(n, art) { const m = SATZ.felder(n, art || SATZ.art(n)).find(x => x.name === 'Marks'); return m ? String(m.wert).trim() : ''; }
function preisVon(n, art) { const f = SATZ.felder(n, art || SATZ.art(n)), p = f.filter(x => x.preis && String(x.wert).trim()).map(x => String(x.wert).trim()).join(' · '), u = f.find(x => x.name === 'Unit'); return p ? p + (u && String(u.wert).trim() ? ' ' + String(u.wert).trim() : '') : ''; }

/* Zeilen der Liste je Seite: Einträge, Rubriken und Texte; in Behälter wird hineingegangen, Rahmen (Fusszeile, Bilder) gehört nicht dazu */
function zeilenSeite(i, d = D) {
  const s = d.seiten[i], aus = [];
  if (!s) return aus;
  const geh = (x, pfad, eltern, tiefe) => {
    if (!istEl(x)) return;
    const a = SATZ.art(x, eltern);
    if (a === 'fest') return;
    if (a) { aus.push({ pfad, n: x, art: a, tiefe, arr: pfad.replace(/\.\d+$/, '') }); return; }
    x.a.slice(2).forEach((y, j) => geh(y, pfad + '.a.' + (j + 2), x, tiefe));
  };
  s.a.slice(1).forEach((y, j) => geh(y, 'seiten.' + i + '.a.' + (j + 1), s, 0));
  return aus;
}

// ---------------------------------------------------------------- Vergleich Stand ↔ Entwurf
function eintraege(d) {
  const aus = [];
  const T = x => String(x ?? '').replace(/\*\*|__|~/g, '');
  d.seiten.forEach((s, i) => {
    const ort = 'Page ' + (i + 1);
    zeilenSeite(i, d).forEach(r => {
      const x = r.n, t = titelVon(x, r.art), bi = bildVon(r);
      const ohne = JSON.parse(JSON.stringify(x)); delete ohne.lage;
      aus.push({ key: r.art + '|' + t, ort, text: `${bi ? `<span class="vgl__b" aria-hidden="true" style="background-image:${h(bi)}"></span>` : ''}<b>${h(T(t))}</b>${unterVon(x, r.art) ? `<span>${h(T(unterVon(x, r.art)))}</span>` : ''}${preisVon(x, r.art) ? `<span class="mono">${h(preisVon(x, r.art))}</span>` : ''}${x.aus ? '<i class="chip grau">hidden</i>' : ''}`, json: JSON.stringify(ohne) });
    });
    if (s.aus) aus.push({ key: 'seite|' + i, ort, text: '<i class="chip grau">Page hidden</i>' });
  });
  return aus;
}
function vergleich(a, b) {
  const A = eintraege(a), B = eintraege(b), n = A.length, m = B.length;
  const L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i].key === B[j].key ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const aus = [], wegA = [], neuB = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i].key === B[j].key) { if ((A[i].json || A[i].text) !== (B[j].json || B[j].text)) aus.push({ art: 'anders', a: A[i], b: B[j] }); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) wegA.push(A[i++]); else neuB.push(B[j++]);
  }
  while (i < n) wegA.push(A[i++]); while (j < m) neuB.push(B[j++]);
  wegA.slice().forEach(x => { const k = neuB.findIndex(y => y.key === x.key); if (k >= 0) { const y = neuB.splice(k, 1)[0]; wegA.splice(wegA.indexOf(x), 1); aus.push({ art: (x.json || x.text) === (y.json || y.text) ? 'verschoben' : 'anders', a: x, b: y }); } });
  wegA.forEach(x => aus.push({ art: 'weg', a: x })); neuB.forEach(y => aus.push({ art: 'neu', b: y }));
  const na = lageAnders(a, b); if (na) aus.push({ art: 'anordnung', n: na, b: { ort: 'On the pages' } });
  return aus;
}
function zustand() {   // je Eintrag im Entwurf: neu / anders (Schlüssel: Titel)
  const st = {};
  if (!STAND) return st;
  vergleich(STAND, D).forEach(v => { if (v.b) st[v.b.key] = v.art; });
  return st;
}

// ---------------------------------------------------------------- Rahmen im Look des Control panels (Robert 26.11.2026)
/* Bausteine 1:1 aus dem Bereichs-Entwurf «Menus» (_entwurf-dashboard/menus-bereich, runde2/stil.css, runde3/zusatz.css, website-bereich): Seitenleiste
   «Lack und Gold» wie im Control panel (Werkzeuge 1–8, Öffnungszeit, Telefon, Guides), Kopfkarte mit geschwungenem Foto, Reiter, Übersicht, Leiste unten.
   Texte der Seitenleiste wie im Control panel (maison/index.html). Fotos der drei Karten wie im Entwurf (b22, b26, b23). */
const IC = {
  web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18"/>',
  menu: '<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 0-3 3-3 7h3v11"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>',
  buch: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.8-1.8 0-1.3-1-1.6-1-2.6 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  sticker: '<path d="M15 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6l9-9V9a6 6 0 0 0-6-6Z"/><path d="M12 21v-4a5 5 0 0 1 5-5h4"/>',
  druck: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
  besuch: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  uhr: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  tel: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  guide: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/>',
  stift: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  preis: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.4"/>',
  verbergen: '<path d="M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3 3.6M6.6 6.6C3.9 8.3 2 12 2 12s3.6 7 10 7c1.7 0 3.2-.4 4.5-1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pdf: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  verlauf: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  vergleich: '<rect x="3" y="4" width="8" height="16" rx="2"/><rect x="13" y="4" width="8" height="16" rx="2"/><path d="M6 9h2M6 13h2M16 9h2M16 13h2"/>',
  speichern: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',
  senden: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
  zurueck: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  pfeilr: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  pfeill: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  auge: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  glas: '<path d="M6 3h12l-1.5 8a4.5 4.5 0 0 1-9 0z"/><path d="M12 15.5V21M8 21h8"/>',
  kaffee: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/>',
  teller: '<circle cx="12" cy="13" r="7"/><circle cx="12" cy="13" r="3.5"/><path d="M3 4v6M21 4v6"/>',
  tafel: '<rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 21l2-4M16 21l-2-4"/>',
  lagen: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  log: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  schild: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  daten: '<path d="M8 4H6a2 2 0 0 0-2 2v4l-2 2 2 2v4a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v4l2 2-2 2v4a2 2 0 0 1-2 2h-2"/>',
  menue: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  haus: '<path d="M3 11 12 4l9 7v9H3z"/><path d="M9 20v-6h6v6"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
};
const ic = (n, k = 'ico') => `<svg class="${k}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || IC.pfeilr}</svg>`;
const wk = (t, i, art = '', attr = '') => `<button type="button" class="wk ${art}" ${attr}>${i ? ic(i) : ''}<span>${t}</span></button>`;
const LOOK_FOTO = { drinks: 'b22', 'coffee-juices': 'b26', kitchen: 'b23' };
const LOOK_GROSS = { drinks: 'b22-1800', 'coffee-juices': 'b26-1200', kitchen: 'b23-1800' };
const LOOK_SYM = { drinks: 'glas', 'coffee-juices': 'kaffee', kitchen: 'teller' };
const LOOK_BLATT = { drinks: ['cat4'], 'coffee-juices': ['cat3'], kitchen: ['cat1', 'cat2'] };   // gedruckte Karte (_karte-aktuell, 23.11.2026)
const LOOK = '/the-cat-and-gun/haus/_werkzeuge/carte/look/';
let SICHT = 'ueber';   // 'ueber' (Overview) oder 'karte' (eine Karte bearbeiten)
function stand3() {   // Zustand aller drei Karten in einem Satz
  const n = LISTE.length, live = LISTE.filter(k => k.live || k.pdf_zeit).length, ent = LISTE.filter(k => k.entwurf || (k.ziel === Z && D && geaendert())).length;
  if (ent) return { t: `${ent} ${ent === 1 ? 'draft' : 'drafts'} waiting`, ok: false };
  if (live === n) return { t: `${n} menus, all published`, ok: true };
  if (!live) return { t: `${n} menus, not published yet`, ok: false };
  return { t: `${live} of ${n} menus published`, ok: false };
}
function zustandKarte(k) { return k.entwurf || (k.ziel === Z && D && geaendert()) ? 'Draft' : (k.live || k.pdf_zeit) ? 'Published' : 'Not published yet'; }
function weg(k) { return (WO.haus.wege || {})[k] || ''; }
function oben() {   // Handy: Kopfzeile mit Wortmarke, Weg zum Control panel und Knopf für die Seitenleiste
  const el = $('#oben'); if (!el) return;
  const z = weg('zentrale');
  el.innerHTML = `<img class="cg-wm" src="${LOOK}wortmarke-weiss.svg" alt="The Cat &amp; Gun"><span class="mono">${h(NAME)}</span>`
    + (z ? `<a class="wk cg-zentrale" href="${h(z)}">${ic('pfeill')}<span>${h(STUBE)}</span></a>` : `<span class="wk cg-zentrale wo-aus" title="Not running on this computer">${ic('pfeill')}<span>${h(STUBE)}</span></span>`)
    + `<button class="wk wk--rund wo-kopf__ber" type="button" aria-expanded="${document.documentElement.classList.contains('wo-rand-auf')}" aria-label="Tools and links">${ic('menue')}</button>`;
}
let STATUS_ROT = false, SATZ_ZEICHEN = { ZEICHEN: '', WORTMARKE: '' };
function rand() {   // Seitenleiste wie bei Edit website: look/leiste.js (eine Stelle für Werkzeug, Anleitung und Prüfseite)
  const wege = {}; ['zentrale', 'website', 'gaeste', 'marke', 'editor', 'sticker', 'druck', 'besuche'].forEach(k => { wege[k] = weg(k); });
  const el = $('#rand');
  el.innerHTML = window.CG_LEISTE ? CG_LEISTE.html({ wege, menus: stand3().t, imWerkzeug: true, rot: STATUS_ROT, name: NAME, stube: STUBE }) : '';
  oben();
  if (window.CG_LEISTE) CG_LEISTE.mitfahren(el);
}
function kopf() {
  const k = LISTE.find(x => x.ziel === Z) || {}, s3 = stand3(), el = $('#kopf');
  if (SICHT === 'ueber') {
    const t = [['ueber', 'Overview'], ...LISTE.map(x => ['z:' + x.ziel, x.name]), ['vgl', 'Before / after'], ['verlauf', 'Earlier versions']];
    const g = D && geaendert();
    el.className = 'wkopf p';
    el.innerHTML = `<div class="wkb" style="background-image:url('/the-cat-and-gun/haus/assets/bild/b23-1800.webp')"></div>
      <div class="wki"><div class="mono">${ic('menu', 'mi')}${h(NAME)} · The Cat &amp; Gun</div><h2>Menus</h2><p>${h(LISTE.map(x => x.name).join(', ').replace(/, ([^,]*)$/, ' and $1'))}. The same data makes the PDF for the printer and the menu page of the website.</p>
      <div class="wkst"><span class="stp"><i class="pt ${s3.ok ? 'gr' : 'au'}"></i>${h(s3.t)}</span>${wk('Test PDF', 'pdf', '', 'data-akt="probe"')}${g ? wk('Before / after', 'vergleich', '', 'data-akt="vgl"') : ''}${g && !OFFEN && darfVeroeffentlichen() ? wk('Publish', 'senden', 'gold', 'data-akt="veroeffentlichen"') : ''}</div></div>
      <div class="tabs" role="tablist">${t.map(([a, n], i) => `<button type="button" class="tab${i === 0 ? ' an' : ''}" ${a.startsWith('z:') ? `data-z="${a.slice(2)}"` : `data-akt="${a}"`}>${h(n)}</button>`).join('')}</div>`;
    return;
  }
  const nr = LISTE.findIndex(x => x.ziel === Z) + 1;
  const datum = k.pdf_zeit ? k.pdf_zeit.slice(0, 10) : (k.stand_zeit ? k.stand_zeit.slice(8, 10) + '.' + k.stand_zeit.slice(5, 7) + '.' + k.stand_zeit.slice(0, 4) : '');
  const fm = (D && D.format) || [210, 297], NORM = { '297x420': 'A3', '210x297': 'A4', '148x210': 'A5' }, kurz = [Math.min(fm[0], fm[1]), Math.max(fm[0], fm[1])].join('x'), format = NORM[kurz] ? NORM[kurz] + (fm[0] > fm[1] ? ' landscape' : '') : fm[0] + ' × ' + fm[1] + ' mm';   // The Cat & Gun: Getränke und Coffee 120 × 297 mm wie gedruckt
  el.className = 'wkopf p klein';
  el.innerHTML = `<div class="wkb" style="background-image:url('/the-cat-and-gun/haus/assets/bild/${LOOK_GROSS[Z] || 'b23-1800'}.webp')"></div>
    <div class="wki"><a class="mono kopf__zurueck" href="#uebersicht" data-akt="ueber">${ic('pfeill', 'mi')}<span>${h(NAME)} · Menu ${nr} of ${LISTE.length}</span></a><h2>${h(k.name || '')}</h2>
    <p>${h(SATZ_KOPF[MODUS === 'frei' ? 'frei' : 'einfach'])}</p>
    <div class="meta kopf__zahlen"><span>${ic('pdf')}${k.seiten || 0} ${k.seiten === 1 ? 'page' : 'pages'} in the PDF</span><span>${ic('lagen')}${h(format)}</span><span>${ic('uhr')}${h(k.pdf_zeit ? 'PDF of ' + datum : 'Last change ' + (datum || '–'))}</span><span>${(k.live || k.pdf_zeit) && !k.entwurf ? ic('check', 'ck') : ''}${h(zustandKarte(k))}</span></div>
    <div class="wkst">${MODUS === 'frei' ? `<div class="seg modus wo-seg kopf__modus" role="group" aria-label="Way of editing"><button type="button" data-m="einfach" aria-pressed="false">Simple</button><button type="button" data-m="frei" aria-pressed="true">Advanced</button></div>${wk('Menu data', 'daten', '', 'data-akt="daten"')}` : ''}${wk('Earlier versions', 'verlauf', '', 'data-akt="verlauf"')}</div></div>`;
}
const SATZ_KOPF = {
  einfach: 'The preview shows the menu as it will be printed. Click an item and it shows in the list and in the menu at the same height. Every change waits as a draft until you press «Publish». The boards in the café do not change.',
  frei: 'Click to pick a part of the menu. Drag to move it, use the corners to make it bigger or smaller, double-click to write. On the right you set font, colour and alignment. ⌘Z takes it back. New items are added in «Simple».',
};
function reiter() {
  $('#reiter').innerHTML = LISTE.map(k => `<button type="button" class="rt kw${k.ziel === Z ? ' an' : ''}" data-z="${k.ziel}" aria-current="${k.ziel === Z}"><img src="/the-cat-and-gun/haus/assets/bild/${LOOK_FOTO[k.ziel] || 'b16'}-480.webp" alt="" decoding="async"><span>${h(k.name)}</span>${k.entwurf || (k.ziel === Z && D && geaendert()) ? '<em class="rt__m">Draft</em>' : ''}</button>`).join('');
}
function listeKopf() {
  const k = LISTE.find(x => x.ziel === Z) || {};
  $('#liste-kopf').innerHTML = `<div><div class="mono">${ic(LOOK_SYM[Z] || 'menu', 'mi')}${h(k.name || '')} · ${k.seiten || 0} ${k.seiten === 1 ? 'page' : 'pages'}</div><h4>Double-click an item</h4></div>
    <div class="seg modus wo-seg" role="group" aria-label="Way of editing"><button type="button" data-m="einfach" aria-pressed="${MODUS === 'einfach'}">Simple</button><button type="button" data-m="frei" aria-pressed="${MODUS === 'frei'}">Advanced</button></div>`;
  const rub = [];
  (D.seiten || []).forEach((s, i) => zeilenSeite(i).forEach(r => { if (r.art === 'rubrik') rub.push([r.pfad, titelVon(r.n, 'rubrik')]); }));
  $('#sekt').innerHTML = rub.map(([p, t]) => `<button type="button" data-akt="spring" data-pfad="${h(p)}">${h(t.charAt(0) + t.slice(1).toLowerCase())}</button>`).join('');
  $('#sekt').hidden = !rub.length;
}
function seitenWahl() {   // Page 1, Page 2 unter der Vorschau (nur bei mehr als einer Seite)
  const n = D ? D.seiten.length : 0, el = $('#seitenw');
  el.innerHTML = n > 1 && ANSICHT !== 'website' ? D.seiten.map((s, i) => `<button type="button" data-seite="${i}" class="${i === 0 ? 'an' : ''}">Page ${i + 1}</button>`).join('') : '';
  const k = LISTE.find(x => x.ziel === Z) || {};
  $('#v-wege').innerHTML = (ANSICHT === 'website' ? `<a class="link" href="${h(webAdresse(Z))}" target="_blank" rel="noopener">Menu on the website ${ic('pfeilr')}</a>` : '')
    + (k.live && ANSICHT !== 'website' ? `<a class="link" href="${API}pdf?z=${Z}&q=live" target="_blank" rel="noopener">Published PDF ${ic('pfeilr')}</a>` : '');
}
function seiteZeigen(i) {
  const f = $('#vf'); let d = null; try { d = f.contentDocument; } catch (e) { return; }
  const b = d && d.querySelectorAll('#seiten > .blatt, #seiten .blatt')[i]; if (!b) return;
  const sc = d.scrollingElement || d.documentElement, top = b.getBoundingClientRect().top + sc.scrollTop - 16;
  sc.scrollTo({ top, behavior: 'smooth' });
  $$('#seitenw button').forEach(x => x.classList.toggle('an', +x.dataset.seite === i));
}
/* Übersicht (Overview): Often used, Three menus, Menu and website, Earlier versions, Draft-check-publish. Zahlen und Rubriken aus den Daten der Karten. */
const UEBER_DATEN = {};
const OFT = [['preis', 'Change a price', 'Written like on the menu', 'b23', 'sicht'], ['verbergen', 'Hide an item', 'The eye, for a while', 'b28', 'sicht'],
  ['plus', 'New item', 'At the end of a section', 'b16', 'neu-sicht'], ['web', 'Menu or website', 'Switch above the preview', 'b24', 'web-sicht'],
  ['pdf', 'Test PDF', 'Print the draft to look at', 'b26', 'probe'], ['verlauf', 'Earlier versions', 'Every published menu', 'b22', 'verlauf']];
const stitel = (i, t, s) => `<div class="stitel"><span class="snr">${ic(i)}</span><div><h3>${t}</h3><span class="mono">${s}</span></div></div>`;
async function ueberDaten() {
  await Promise.all(LISTE.map(async k => {
    if (UEBER_DATEN[k.ziel] && UEBER_DATEN[k.ziel].zeit === (k.entwurf_zeit || k.stand_zeit)) return;
    try {
      const r = await api('karte?z=' + encodeURIComponent(k.ziel)), d = r.entwurf || r.stand, rub = [];
      d.seiten.forEach((s, i) => zeilenSeite(i, d).forEach(x => { if (x.art === 'rubrik') rub.push(titelVon(x.n, 'rubrik')); }));
      UEBER_DATEN[k.ziel] = { zeit: k.entwurf_zeit || k.stand_zeit, rub };
    } catch (e) { /* ohne Rubriken */ }
  }));
}
function ueberblick() {
  const el = $('#ueber');
  const karten = LISTE.map(k => {
    const u = UEBER_DATEN[k.ziel] || { rub: [] }, bl = LOOK_BLATT[k.ziel] || [], zs = zustandKarte(k);
    return `<button type="button" class="mkarte p" data-z="${k.ziel}"><div class="mkfoto" style="background-image:url('/the-cat-and-gun/haus/assets/bild/${LOOK_FOTO[k.ziel] || 'b16'}-800.webp')"></div>
      <div class="mkbl n${bl.length}">${bl.map((b, j) => `<img class="blatt b${j}" src="${LOOK}${b}.webp" alt="" decoding="async">`).join('')}</div>
      <div class="mkt"><div class="mkkopf"><span class="ski">${ic(LOOK_SYM[k.ziel] || 'menu')}</span><span class="pill2">${zs === 'Published' ? ic('check', 'ck') : ''}${h(zs)}</span></div>
      <b>${h(k.name)}</b><i>${k.seiten} printed ${k.seiten === 1 ? 'page' : 'pages'}${u.rub.length ? ` · ${u.rub.length} sections` : ''}</i>
      <div class="mkchips">${u.rub.slice(0, 3).map(x => `<span>${h(x.charAt(0) + x.slice(1).toLowerCase())}</span>`).join('')}</div></div></button>`;
  }).join('');
  el.innerHTML = `${stitel('stift', 'Often used', 'The jobs that come up most often')}
    <div class="wof c6">${OFT.map(([i, t, s, f, a]) => `<button type="button" class="o2 p" data-akt="${a}"><div class="o2b" style="background-image:url('/the-cat-and-gun/haus/assets/bild/${f}-480.webp')"></div><span class="o2i">${ic(i)}</span><b>${t}</b><i>${s}</i></button>`).join('')}</div>
    ${stitel('menu', 'Three menus', 'As they are printed')}<div class="mkarten">${karten}</div>
    ${stitel('web', 'Menu and website', 'Where a change shows')}
    <div class="rr r2"><div class="mow p"><div class="vk"><div><div class="mono">${ic('web', 'mi')}Menu or website</div><h4>The menu page comes from the same data</h4></div>
      <div class="umsch"><button type="button" class="an" data-akt="sicht">${ic('menu')}Menu</button><button type="button" data-akt="web-sicht">${ic('web')}Website</button></div></div>
      <div class="mowb"><div class="papier"><img src="${LOOK}cat3.webp" alt="" decoding="async"></div><span class="mowp">${ic('pfeilr')}</span>
      <div class="hdy"><div class="hdy__s"><img src="${LOOK}menu-h-0.webp" alt="" decoding="async"></div><img class="hdy__g" src="${LOOK}handy.webp" alt="" width="640" height="1122" decoding="async"></div></div>
      <p>«Website» shows the menu page with your draft, the way a guest will see it after publishing.</p>
      <button type="button" class="link mow__l" data-akt="einst">Website link <span class="pf">${ic('pfeilr')}</span></button></div>
    <div class="mtf p"><div class="mono">${ic('tafel', 'mi')}In the café</div><h4>The boards stay as they are</h4>
      <p>The menu in the café is printed on boards. A change here is for the next printed menu and for the website.</p>
      <div class="mtfb" style="background-image:url('/the-cat-and-gun/haus/assets/bild/b18-800.webp')"></div></div></div>
    <div class="rr r2"><div class="wve p"><div class="mono">${ic('verlauf', 'mi')}Earlier versions</div><h4>Every published menu is kept</h4>
      <div class="ver"><span class="dsym">${ic('lagen')}</span><div><b>Original menu</b><i>The menu as it was built</i></div>${wk('Put in the draft', 'zurueck', '', 'data-akt="verlauf"')}</div>
      <p>«Put in the draft» brings a version back. It goes to PDF and website when you publish again.</p></div>
    <div class="wab2 p"><div class="mono">${ic('senden', 'mi')}Draft, check, publish</div><h4>PDF and website change on «Publish»</h4>
      <div class="flow">${[['speichern', 'Save'], ['vergleich', 'Before / after'], ['pdf', 'Test PDF'], ['senden', 'Publish']].map(([i, x], n) => `${n ? `<span class="fl-p">${ic('pfeilr')}</span>` : ''}<span class="fl-s"><span class="fl-i">${ic(i)}</span>${x}</span>`).join('')}</div>
      <p>«Publish» prints the PDF, compares it word for word with the data, builds the menu page of the website and only then replaces the old version.</p></div></div>`;
}
function sichtFlags() { document.body.classList.toggle('sicht-ueber', SICHT === 'ueber'); $('#ueber').hidden = SICHT !== 'ueber'; $('#reiter').hidden = SICHT === 'ueber'; $('#arbeit').hidden = SICHT === 'ueber'; }
function randZu() { document.documentElement.classList.remove('wo-rand-auf'); const b = $('.wo-kopf__ber'); if (b) b.setAttribute('aria-expanded', 'false'); }
/* Auftritte in der Übersicht: nur beim ersten Zeichnen, danach still (wie zeilen-auftritt.js) */
let UEBER_IO = null, UEBER_ERST = true;
function ueberAuftritt() {
  if (!UEBER_ERST || SICHT !== 'ueber' || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  UEBER_ERST = false;
  const H = innerHeight, w = $$('#ueber .stitel, #ueber .o2, #ueber .mkarte, #ueber .rr > .p').filter(e => e.getBoundingClientRect().top > H);
  if (!w.length) return;
  w.forEach(e => e.classList.add('cg-wart'));
  const fertig = x => { x.classList.remove('cg-wart', 'cg-da'); x.style.removeProperty('--cg-i'); };
  UEBER_IO = new IntersectionObserver(es => { let k = 0; es.forEach(e => { if (!e.isIntersecting) return; const x = e.target; UEBER_IO.unobserve(x); x.style.setProperty('--cg-i', Math.min(k++, 4)); x.classList.add('cg-da'); setTimeout(() => fertig(x), 2000); }); }, { rootMargin: '0px 0px -8% 0px' });
  w.forEach(e => UEBER_IO.observe(e));
}
function sicht(s, still) {   // Overview ↔ eine Karte
  SICHT = s; sichtFlags();
  if (s === 'ueber') { history.replaceState(null, '', '#uebersicht'); ueberblick(); ueberDaten().then(() => { if (SICHT === 'ueber') { ueberblick(); ueberAuftritt(); } }); }
  else history.replaceState(null, '', '#' + Z);
  kopf(); rand(); leiste();
  if (s === 'karte') { reiter(); if (!still) { if (ANSICHT === 'website') website(); else vorschau(); } }
  if (!still) window.scrollTo({ top: 0, behavior: 'instant' });
}
function buehneFoto() {}

// ---------------------------------------------------------------- Liste (Einfach)
function reiheHTML(r, st, bild) {
  const n = r.n, a = r.art, t = titelVon(n, a), u = unterVon(n, a), p = preisVon(n, a);
  const k0 = a + '|' + t;
  const chip = st[k0] === 'neu' ? '<i class="chip">New</i>' : st[k0] === 'anders' ? '<i class="chip">Changed</i>' : st[k0] === 'verschoben' ? '<i class="chip grau">Moved</i>' : '';
  const aus = n.aus ? '<i class="chip grau">Hidden</i>' : '';
  const k = `<div class="r__k">${a === 'rubrik' ? WO.knopf('Add item', 'plus', 'gold', { klein: true, attr: 'data-akt="neu-hier"' }) : ''}<button class="rund" type="button" data-akt="edit" title="Edit" aria-label="Edit">${SYM.stift}</button><button class="rund" type="button" data-akt="kopie" title="Copy" aria-label="Copy">${SYM.kopie}</button><button class="rund" type="button" data-akt="hoch" title="Move up" aria-label="Move up">${SYM.hoch}</button><button class="rund" type="button" data-akt="runter" title="Move down" aria-label="Move down">${SYM.runter}</button><button class="rund" type="button" data-akt="aus" title="${n.aus ? 'Show again' : 'Hide'}" aria-label="${n.aus ? 'Show again' : 'Hide'}">${n.aus ? SYM.augezu : SYM.auge}</button><button class="rund gefahr" type="button" data-akt="weg" title="Remove" aria-label="Remove">${SYM.korb}</button></div>`;
  const kl = ['r', n.aus ? 'aus' : '', a === 'rubrik' ? 'r--rubrik' : '', ['zwischen', 'titel'].includes(a) ? 'r--klein' : '', a === 'text' ? 'r--text' : ''].filter(Boolean).join(' ');
  return `<div class="${kl}${bild ? ' r--bild' : ''}" data-pfad="${h(r.pfad)}">${bild ? `<span class="r__b" aria-hidden="true" data-bild="${h(bild)}"></span>` : ''}<div class="r__t" data-akt="waehle"><b>${h(t)}</b>${markeVon(n, a) ? markeVon(n, a).split(/[\s,]+/).filter(Boolean).map(x => `<i class="r__mk mark">${h(x)}</i>`).join('') : ''}${a !== 'eintrag' && a !== 'rubrik' ? `<small>${h(FN[a])}</small>` : ''}${chip}${aus}${a !== 'rubrik' && u ? `<span>${h(u)}</span>` : ''}</div><span class="r__p">${h(p)}</span>${k}</div>`;
}
/* Bild je Zeile (Fehlerbuch 10a, Robert 19.10.2026: «in allen Tools Bilder dazu»): nur Fotos des Hauses von der Website. Ein Gericht zeigt nur ein Foto,
   das wirklich es zeigt; die Fotos des Hauses zeigen Rubriken (Bagels, Curry, Super Juices …), darum trägt die Rubrik ihr Bild, nie jede Zeile dasselbe.
   Rubriken ohne eigenes Foto tragen das Et-Zeichen der Wortmarke; der Titel der Karte ihr Foto. */
const imgUrl = n => `url('/the-cat-and-gun/haus/_werkzeuge/carte/bilder/z/${n}.webp')`;   // 112 px (einlesen.py vorschaubilder)
const ET_BILD = "url('/the-cat-and-gun/haus/_werkzeuge/carte/bilder/et.svg')";
function rubrikBild(t) { const f = (FOTO.rubriken || {})[t]; return f ? imgUrl(f) : ET_BILD; }
function bildVon(r) {
  if (r.art === 'titel') return imgUrl(FOTO[Z] || 'b16');
  if (r.art === 'rubrik') return rubrikBild(titelVon(r.n, 'rubrik'));
  return '';
}
function liste() {
  const el = $('#liste');
  const st = zustand();
  el.innerHTML = D.seiten.map((s, i) => {
    const zl = zeilenSeite(i), rub = zl.some(r => r.art === 'rubrik'), ein = zl.some(r => r.art === 'eintrag');
    const inn = zl.map(r => reiheHTML(r, st, bildVon(r))).join('') + `<div class="neu-zeile pzf">${ein ? wk('Item at the end', 'plus', '', `data-akt="neu-ende" data-i="${i}"`) : ''}${rub ? wk('New section', 'lagen', '', `data-akt="rubrik-neu" data-i="${i}"`) : ''}</div>`;
    return `<div class="teil${s.aus ? ' aus' : ''}" data-teil="${i}" style="--i:${Math.min(i, 6)}"><div class="teil__k"><b class="mono">Page ${i + 1}</b><span class="mono">${zl.filter(r => r.art === 'eintrag').length} ${zl.filter(r => r.art === 'eintrag').length === 1 ? 'item' : 'items'}</span><div style="display:flex;gap:6px"><button class="rund" type="button" data-akt="s-hoch" data-i="${i}" aria-label="Page forward">${SYM.hoch}</button><button class="rund" type="button" data-akt="s-runter" data-i="${i}" aria-label="Page back">${SYM.runter}</button><button class="rund" type="button" data-akt="s-aus" data-i="${i}" aria-label="Hide page">${s.aus ? SYM.augezu : SYM.auge}</button></div></div>${inn}</div>`;
  }).join('');
  if (BLITZ) { const r = $(`.r[data-pfad="${BLITZ}"]`); if (r) { r.classList.add('blitz', 'gewaehlt'); r.scrollIntoView({ block: 'nearest' }); } BLITZ = null; }   // Abnahme 28.11.2026: die geänderte oder verschobene Zeile bleibt gewählt, ihre Werkzeuge bleiben da (mehrmals verschieben ohne neu zu wählen)
  bilderZeigen(); listeKopf();
}
/* Zeilenbilder erst laden, wenn die Zeile ins Bild kommt (Weinkarte: 172 Flaschen; gedrosselt stand die Karte sonst erst nach 6,2 s) */
let BILD_BEOB = null;
function bilderZeigen() {
  const alle = $$('#liste .r__b[data-bild]');
  const zeig = el => { el.style.backgroundImage = el.dataset.bild; el.removeAttribute('data-bild'); };
  if (!('IntersectionObserver' in window)) return alle.forEach(zeig);
  if (BILD_BEOB) BILD_BEOB.disconnect();
  BILD_BEOB = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { zeig(e.target); BILD_BEOB.unobserve(e.target); } }), { rootMargin: '400px 0px' });
  alle.forEach(el => BILD_BEOB.observe(el));
}

// ---------------------------------------------------------------- Vorschau (Rahmen blatt.html)
/* Ansicht «Website» (wie GBR): die Menüseite mit allen Entwürfen (web.py);
   auf der Menüseite springt sie zum Abschnitt dieser Karte. */
function website() {
  const an = ANSICHT === 'website';
  $('#vf').hidden = an; $('#web').hidden = !an; $('#webwahl').hidden = !an; $('.vorschau__z').hidden = an;   // Zoom gilt nur für die Karte
  $$('.ansicht button').forEach(b => b.setAttribute('aria-pressed', b.dataset.ansicht === ANSICHT));
  $$('#webwahl button').forEach(b => b.setAttribute('aria-pressed', b.dataset.webseite === WEBSEITE));
  if (!an) return vorschau();
  const seite = WEBSEITE, f = $('#web-f');
  $('#v-zahl').textContent = 'Website'; $('#v-warn').hidden = true; vTitel(); seitenWahl();
  f.onload = () => {
    try {
      const d = f.contentDocument; d.documentElement.classList.add('offen'); d.querySelectorAll('[data-r]').forEach(x => x.classList.add('da'));
      WEB_ENTWURF = !!d.documentElement.dataset.carteEntwurf;
      const ziel = seite === 'menu.html' && STAND && STAND.web ? d.getElementById(STAND.web) : null;
      if (ziel) ziel.scrollIntoView({ block: 'start' });
      $('#v-zahl').textContent = (ORT_DER_KARTE[seite] || 'Website') + (WEB_ENTWURF ? (geaendert() || LISTE.some(k => k.entwurf) ? ' · with your draft' : ' · as it will be after publishing') : ' · as it is today');
    } catch (e) { /* gleiche Herkunft, sollte gehen */ }
  };
  const src = `${API}webseite?z=${Z}&seite=${seite}&t=${Date.now()}`;
  const schl = Z + seite + inhalt(D).length;
  if (f.dataset.z !== schl) { f.dataset.z = schl; f.src = src; } else f.onload();
}
let WEB_ENTWURF = false;
function vTitel() { const k = LISTE.find(x => x.ziel === Z) || {}; $('#v-titel').innerHTML = `${ic('auge', 'mi')}${h(k.name || '')} · ${ANSICHT === 'website' ? 'on the menu page' : 'as it will be printed'}`; }
function vorschau() {
  if (ANSICHT === 'website') return;
  const f = $('#vf');
  /* Abnahme 28.11.2026: in der Overview ist die Vorschau unsichtbar und hat kein Mass. Dort gesetzt, rechnete sie das Schriftmass zu «NaN», und die
     zuletzt geöffnete Karte stand danach als leeres Blatt da (Schrift 0 px). Gesetzt wird erst, wenn die Karte offen ist (sicht('karte') ruft vorschau()). */
  if (!BEREIT || !f.contentWindow || !D || SICHT !== 'karte') return;
  f.contentWindow.postMessage({ carte: 'setze', daten: D, modus: MODUS, zoom: ZM[MODUS], eigen: ZM[MODUS] > ZM_STD[MODUS], geschrieben: GESCHRIEBEN, wahl: MODUS === 'frei' ? WAHLID : null, neu: NEU_KARTE }, location.origin);
  NEU_KARTE = false;
}
/* Schlössli 19.10.2026: unter Last schickte die Vorschau ihr «bereit», bevor dieses Skript zuhörte, und blieb grau. Darum fragt das Werkzeug nach,
   bis die Antwort da ist (beim Laden des Rahmens und alle 700 ms, höchstens 40 Mal). */
const halloVorschau = () => { const f = $('#vf'); try { if (f && f.contentWindow) f.contentWindow.postMessage({ carte: 'hallo' }, location.origin); } catch (e) { /* noch nicht da */ } };
{ const f = $('#vf'); if (f) f.addEventListener('load', () => { if (!BEREIT) halloVorschau(); }); let n = 0; const t = setInterval(() => { if (BEREIT || ++n > 40) return clearInterval(t); halloVorschau(); }, 700); }
window.addEventListener('message', ev => {
  if (ev.origin !== location.origin || !ev.data || !ev.data.carte) return;
  const m = ev.data;
  if (m.carte === 'bereit') { BEREIT = true; vorschau(); }
  if (m.carte === 'gesetzt') {
    buehneFoto();
    BERICHT = m.bericht;
    const n = m.bericht.seiten;
    $('#v-zahl').textContent = `${n} ${n === 1 ? 'page' : 'pages'}, as in the PDF`; vTitel(); seitenWahl();
    const w = $('#v-warn'), t = m.bericht.fehler.concat(m.bericht.warn);
    w.hidden = !t.length; w.textContent = t.length ? '⚠ ' + t[0] : ''; w.title = t.join('\n');
  }
  if (m.carte === 'fehler') sag('Preview', m.text, [], true);
  if (m.carte === 'klick' && MODUS === 'einfach') waehleAusVorschau(m.pfad);
  if (m.carte === 'doppel' && MODUS === 'einfach') oeffneAusVorschau(m.pfad);
  if (m.carte === 'text' && MODUS === 'frei') { setzePfad(D, m.pfad, m.wert); GESCHRIEBEN.push(m.pfad); TEXTGEAENDERT = true; OFFEN = inhalt(D) !== BASIS; clearTimeout(TIMER); leiste(); oben(); }
  if (m.carte === 'speichern' && OFFEN) speichern('Saved in the draft');
  if (m.carte === 'wahl' && MODUS === 'frei') { WAHLINFO = m.info; WAHLID = m.info ? m.info.id : null; if (!m.still) GST_OFFEN = !!m.info; seitenleiste(); }
  if (m.carte === 'lage' && MODUS === 'frei') { merken(stand()); setz(m.id, m.v); geaendertAnzeigen(); if (m.id === WAHLID) seitenleiste(); }
  if (m.carte === 'entf' && MODUS === 'frei') entf(m.id);
  if (m.carte === 'taste' && MODUS === 'frei') { if (m.was === 'zurueck') zurueckNehmen(); else if (m.was === 'vor') wiederholen(); else if (m.was === 'esc') abwaehlen(); }
  if (m.carte === 'taste' && m.was === 'speichern') { if (OFFEN) speichern('Saved in the draft'); }
  if (m.carte === 'seite-zurueck' && MODUS === 'frei') { const vor = stand(); m.ids.forEach(id => setz(id, { x: 0, y: 0, s: 1 })); if (stand() !== vor) { merken(vor); WAHLID = null; neuSetzen(); sag('Layout reset', `Page ${m.seite} is back as set. ⌘Z brings it back.`); } }
  if (m.carte === 'schreibt') SCHREIB_VOR = stand();
  if (m.carte === 'fertig-geschrieben' && SCHREIB_VOR != null) { if (stand() !== SCHREIB_VOR) merken(SCHREIB_VOR); SCHREIB_VOR = null; }
  if (m.carte === 'fertig-geschrieben' && TEXTGEAENDERT) { clearTimeout(TIMER); TIMER = setTimeout(() => { TEXTGEAENDERT = false; vorschau(); }, 200); }
});
/* Klick links oder rechts: die andere Seite springt auf dieselbe Stelle und blinkt kurz (Robert 15.10.2026) */
function eintragPfad(pfad) {   // Pfad eines Textes in der Karte → Pfad des Eintrags, den die Liste zeigt
  const m = /^seiten\.(\d+)/.exec(pfad); if (!m) return null;
  const r = zeilenSeite(+m[1]).find(z => pfad === z.pfad || pfad.startsWith(z.pfad + '.'));
  return r ? r.pfad : null;
}
function markiere(pfad) {
  const r = $(`#liste .r[data-pfad="${pfad}"]`), vor = r ? r.getBoundingClientRect().top : 0;
  $$('#liste .r.gewaehlt').forEach(x => { if (x !== r) x.classList.remove('gewaehlt'); });
  if (!r) return null;
  /* Schlössli 20.10.2026: die Knöpfe stehen unter dem gewählten Eintrag; schliessen sie sich weiter oben, bleibt die angeklickte Zeile trotzdem an ihrem Platz
     (sonst springt die Liste und ein Doppelklick trifft die Nachbarzeile) */
  const nach = r.getBoundingClientRect().top; if (Math.abs(nach - vor) > 1) window.scrollBy(0, nach - vor);
  r.classList.add('gewaehlt'); r.classList.remove('blitz'); void r.offsetWidth; r.classList.add('blitz');
  return r;
}
function blitzRechts(pfad, y) {   // y: Höhe im Fenster, auf der die Zeile links steht (oder stehen wird); die Karte zieht auf dieselbe Höhe
  if (ANSICHT === 'website') return;
  const f = $('#vf'); f.contentWindow.postMessage({ carte: 'blitz', pfad, y: y == null ? null : y - f.getBoundingClientRect().top }, location.origin);
}
function linksMitte(r) {           // Zeile links mittig ins Fenster; liefert die Höhe, auf der sie danach steht
  const rr = r.getBoundingClientRect(), max = document.documentElement.scrollHeight - innerHeight;
  const ziel = Math.min(max, Math.max(0, scrollY + rr.top + rr.height / 2 - innerHeight / 2));
  window.scrollTo({ top: ziel, behavior: 'smooth' });
  return rr.top + rr.height / 2 - (ziel - scrollY);
}
function waehle(pfad) {       // aus der Liste: Karte rechts springt auf dieselbe Höhe
  const r = markiere(pfad); if (!r) return;
  const rr = r.getBoundingClientRect(); blitzRechts(pfad, rr.top + rr.height / 2);
}
function waehleAusVorschau(pfad) {   // aus der Karte: Liste links springt hin, Karte zieht auf dieselbe Höhe nach
  const np = eintragPfad(pfad); if (!np) return;
  const r = markiere(np); if (!r) return;
  blitzRechts(np, linksMitte(r));
}
/* ---------------------------------------------------------------- Freie Anordnung und Gestalten (Fortgeschritten), 1:1 nach La Carte des Grand Beau-Rivage
   (anordnen.js, 15./16.10.2026). Gewählt, gezogen und gezeigt wird in der Vorschau (blatt.js, ANR); hier liegen die Daten, der Verlauf für ⌘Z / ⌘⇧Z
   und die Seitenleiste «Gestalten» rechts (öffnet beim Wählen, × oder Esc schliesst, nie über der Karte).
   Wo die lage steht: Eintrag (Pfad «seiten.…») → n.lage, seine Linie («…:lin») → n.lage.lin; Bankett-Zeile → u.lage; Teile der Seite
   «b:» Band, «l:» Logo, «k:» Kopfzeile, «z:» Zeichen, «f:» Fusszeile, «s:» Titel der Seite → seite.lage[…]. */
const HIST = [], ZUK = [];
let WAHLID = null, WAHLINFO = null, GST_OFFEN = false, SCHREIB_VOR = null;
const RUND = (x, n) => Math.round(x * n) / n;
const SEITENTEIL = { b: 'band', l: 'logo', k: 'kopf', z: 'zeichen', f: 'fuss', s: 'titel' };
function stand() { return JSON.stringify({ s: D.seiten, c: D.css }); }
function merken(vor) { HIST.push(vor); if (HIST.length > 200) HIST.shift(); ZUK.length = 0; }
function zurueckHolen(x) { const j = JSON.parse(x); D.seiten = j.s; D.css = j.c; OFFEN = inhalt(D) !== BASIS; leiste(); oben(); vorschau(); if (MODUS === 'einfach') liste(); }
function zurueckNehmen() { if (!HIST.length) return sag('Nothing to undo'); ZUK.push(stand()); zurueckHolen(HIST.pop()); }
function wiederholen() { if (!ZUK.length) return sag('Nothing to redo'); HIST.push(stand()); zurueckHolen(ZUK.pop()); }
function ort(id) {
  if (!id || !D) return null;
  const m = id.match(/^([blkzfs]):(\d+)$/);
  if (m) {
    const name = SEITENTEIL[m[1]];
    const s = D.seiten[+m[2]]; if (!s) return null;
    return { get: () => (s.lage || {})[name], set: v => { if (v) { s.lage = s.lage || {}; s.lage[name] = v; } else if (s.lage) { delete s.lage[name]; if (!Object.keys(s.lage).length) delete s.lage; } } };
  }
  const lin = /:lin$/.test(id), pf = id.replace(/:lin$/, '');
  const u = liesPfad(D, pf); if (!u || typeof u !== 'object') return null;
  if (lin) return { u, get: () => (u.lage || {}).lin, set: v => { if (v) { u.lage = u.lage || {}; u.lage.lin = v; } else if (u.lage) { delete u.lage.lin; if (!Object.keys(u.lage).length) delete u.lage; } } };
  return { u, get: () => { const x = Object.assign({}, u.lage || {}); delete x.lin; return x; }, set: v => { const l0 = (u.lage || {}).lin, x = Object.assign({}, v || {}); if (l0) x.lin = l0; if (Object.keys(x).length) u.lage = x; else delete u.lage; } };
}
function roh(id) { const o = ort(id); return Object.assign({}, (o && o.get()) || {}); }
function liesLage(id) { const v = roh(id); return Object.assign(v, { x: +v.x || 0, y: +v.y || 0, s: +v.s || 1 }); }
function setz(id, patch) {   // Felder ändern, alles Neutrale fällt weg (null/leer = wie in der Vorlage), wie GBR anordnen.js setz()
  const o = ort(id); if (!o) return;
  if (/^b:/.test(id)) { const n = Object.assign(roh(id), patch); if (n.h != null) n.h = RUND(+n.h, 10); Object.keys(n).forEach(k => { if (n[k] == null || n[k] === '') delete n[k]; }); return o.set(Object.keys(n).length ? n : null); }
  const n = Object.assign(roh(id), patch);
  if (n.x != null) n.x = RUND(+n.x, 10); if (n.y != null) n.y = RUND(+n.y, 10);
  if (n.s != null) n.s = RUND(+n.s, 100); if (n.t != null) n.t = RUND(+n.t, 1000);
  [['b', 10], ['d', 100], ['z', 100], ['mt', 10], ['mb', 10]].forEach(([f, r]) => { if (n[f] != null && n[f] !== '') n[f] = RUND(+n[f], r); });
  if (Math.abs(n.x || 0) < 0.05) delete n.x; if (Math.abs(n.y || 0) < 0.05) delete n.y;
  if (n.s != null && Math.abs(n.s - 1) < 0.005) delete n.s; if (n.t != null && Math.abs(n.t - 1) < 0.002) delete n.t;
  Object.keys(n).forEach(k => { if (n[k] == null || n[k] === '' || n[k] === false) delete n[k]; });
  o.set(Object.keys(n).length ? n : null);
}
function geaendertAnzeigen() { OFFEN = inhalt(D) !== BASIS; leiste(); oben(); }
function neuSetzen() { geaendertAnzeigen(); vorschau(); }
function entf(id) {   // Entf: Einträge gehen von der Karte (wie «Ausblenden» im Modus Einfach), Linien, Zeichen und Teile der Seite werden unsichtbar
  const o = ort(id); if (!o) return;
  merken(stand());
  const eintrag = !/:lin$/.test(id) && !/^[blkzfs]:/.test(id);
  if (eintrag && o.u) o.u.aus = true; else setz(id, { aus: true });
  WAHLID = null; GST_OFFEN = false; seitenleiste(); neuSetzen(); sag('Hidden', '⌘Z brings it back.');
}
function abwaehlen() { WAHLID = null; WAHLINFO = null; GST_OFFEN = false; seitenleiste(); const f = $('#vf'); if (f && f.contentWindow) f.contentWindow.postMessage({ carte: 'abwaehlen' }, location.origin); }

/* Seitenleiste «Gestalten» (GBR: «Schriftarten, Schriftgrösse und Textart ändern … so ein kleines Side-Menü»), Begriffe wie in L’Imprimerie */
const SCHRIFTEN = [['titel', 'Gloock'], ['instrument', 'Instrument Sans'], ['mono', 'DM Mono']];
const TEXTART = [['normal', 'Normal'], ['versal', 'Capitals']];   // nie fett, nie kursiv (Kleid von The Cat & Gun)
const AUSR = [['links', 'Left'], ['mitte', 'Centre'], ['rechts', 'Right']];
const FARBNAME = { tinte: 'Ink', text: 'Text', grau: 'Grey', holz: 'Wood', holzt: 'Dark wood', holzh: 'Light wood', filz: 'Felt red', putz: 'Plaster', weiss: 'White' };
const segment = (feld, liste, an, kl = '') => `<div class="gst-seg ${kl}">${liste.map(([k, t]) => `<button type="button" data-feld="${feld}" data-wert="${k}" class="${an === k ? 'an' : ''}"${feld === 'f' ? ` style="font-family:${SATZ.SCHRIFT[k].replace(/"/g, "'")}"` : ''}>${t}</button>`).join('')}</div>`;
const groesse = (feld, wert, einheit) => `<div class="gst-gr"><button type="button" data-schritt="${feld}" data-r="-1" aria-label="Smaller">−</button><input type="text" inputmode="decimal" data-zahl="${feld}" value="${wert}"><span>${einheit}</span><button type="button" data-schritt="${feld}" data-r="1" aria-label="Bigger">+</button></div>`;
const farben = an => `<div class="gst-farben">${Object.entries(SATZ.FARBE).map(([k, v]) => `<button type="button" data-feld="c" data-wert="${k}" title="${FARBNAME[k] || k}" aria-label="${FARBNAME[k] || k}" style="background:${v}" class="${an === k ? 'an' : ''}"></button>`).join('')}</div>`;
const gruppe = (titel, html) => `<div class="gst-gruppe"><label>${titel}</label>${html}</div>`;
function seitenleiste() {
  let g = $('#gst');
  if (!g) {
    g = document.createElement('aside'); g.id = 'gst'; g.className = 'gst'; g.setAttribute('aria-label', 'Design'); document.body.appendChild(g);
    g.addEventListener('click', klickLeiste); g.addEventListener('change', zahlLeiste);
    g.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.matches('[data-zahl]')) { ev.preventDefault(); ev.target.blur(); } });
  }
  const an = MODUS === 'frei' && GST_OFFEN;
  document.body.classList.toggle('gst-offen', an);
  g.hidden = !an;
  if (!an) return;
  const kopf = `<div class="gst-kopf"><b>Design</b><button type="button" class="gst-zu" data-tu="zu" aria-label="Close panel"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3"/></svg></button></div>`;
  const i = WAHLINFO;
  if (!i) { g.innerHTML = kopf + '<p class="gst-leer">Click a part of the menu: title, section, dish, price, description, logo or footer.</p>'; return; }
  const v = liesLage(WAHLID);
  let html = kopf + `<p class="gst-name">${h(i.name)}</p>`;
  if (i.art === 'linie') html += gruppe('Weight', groesse('d', i.dicke.toFixed(2), 'mm')) + gruppe('Length', groesse('b', i.laenge.toFixed(1), 'mm')) + gruppe('Colour', farben(v.c));
  else if (i.art === 'zeichen') html += gruppe('Size', groesse('s', Math.round(v.s * 100), '%')) + gruppe('Colour', farben(v.c));
  else if (i.art === 'band') html += gruppe('Height', groesse('h', (+roh(WAHLID).h || i.hoehe).toFixed(1), 'mm'));
  else {
    html += gruppe('Font', segment('f', SCHRIFTEN, v.f, 'gst-seg--schrift')) + gruppe('Font size', groesse('pt', i.pt.toFixed(1), 'pt'))
      + gruppe('Text style', segment('a', TEXTART, v.a)) + gruppe('Colour', farben(v.c)) + gruppe('Alignment', segment('al', AUSR, v.al))
      + gruppe('Line spacing', groesse('z', (v.z || i.lh).toFixed(2), '×'));
    if (i.art === 'eintrag') html += gruppe('Space before', groesse('mt', i.mt.toFixed(1), 'mm')) + gruppe('Space after', groesse('mb', i.mb.toFixed(1), 'mm'));
  }
  html += `<div class="gst-fuss">${i.art === 'band' ? '' : '<button type="button" class="gst-kn" data-tu="aus">Remove</button>'}<button type="button" class="gst-kn" data-tu="vorlage">Reset part</button></div><p class="gst-tipp">${i.art === 'band' ? 'Height with − and +, or type a number.' : `Drag to move, the corners change the size${i.art === 'linie' ? ', the ends the length' : ''}. Delete removes, Esc closes, ⌘Z takes it back.`}</p>`;
  g.innerHTML = html;
}
function aendern(patch, schrift) {   // eine Änderung aus der Leiste: merken, setzen, neu setzen (Schriftgrösse und Abstände verteilen die Seiten neu)
  if (!WAHLID) return;
  merken(stand()); setz(WAHLID, patch);
  if (schrift) document.fonts.load('16px ' + SATZ.SCHRIFT[schrift]).then(neuSetzen, neuSetzen); else neuSetzen();
}
function wertNeu(feld, zahl) {
  const i = WAHLINFO; if (!i || !isFinite(zahl)) return;
  const v = liesLage(WAHLID);
  if (feld === 'pt') { const alt = i.pt, nz = Math.max(4, Math.min(80, zahl)); if (Math.abs(nz - alt) < 0.05) return; return aendern(i.art === 'eintrag' ? { t: (+v.t || 1) * nz / alt } : { s: Math.max(0.4, Math.min(3, v.s * nz / alt)) }); }
  if (feld === 's') return aendern({ s: Math.max(0.4, Math.min(3, zahl / 100)) });
  if (feld === 'z') return aendern({ z: Math.max(0.8, Math.min(3, zahl)) });
  if (feld === 'mt' || feld === 'mb') return aendern({ [feld]: Math.max(-20, Math.min(60, zahl)) });
  if (feld === 'b') return aendern({ b: Math.max(2, Math.min(i.blattB, zahl)) });
  if (feld === 'd') return aendern({ d: Math.max(0.1, Math.min(3, zahl)) });
  if (feld === 'h') return aendern({ h: Math.max(4, Math.min(120, zahl)) });
}
const SCHRITT = { pt: 0.5, s: 10, z: 0.05, mt: 0.5, mb: 0.5, b: 1, d: 0.1, h: 1 };
function klickLeiste(ev) {
  const b = ev.target.closest('button'); if (!b) return;
  if (b.dataset.tu === 'zu') return abwaehlen();
  if (b.dataset.tu === 'aus') return entf(WAHLID);
  if (b.dataset.tu === 'vorlage') { const o = WAHLID && ort(WAHLID); if (!o) return; merken(stand()); o.set(null); neuSetzen(); return sag('Back as set', '⌘Z brings the design back.'); }
  if (b.dataset.feld) { const f = b.dataset.feld, w = b.dataset.wert, an = liesLage(WAHLID)[f] === w; return aendern({ [f]: an ? null : w }, f === 'f' && !an ? w : ''); }
  if (b.dataset.schritt) { const f = b.dataset.schritt, i = $(`#gst [data-zahl="${f}"]`); return wertNeu(f, parseFloat(String(i.value).replace(',', '.')) + (+b.dataset.r) * SCHRITT[f]); }
}
function zahlLeiste(ev) { const i = ev.target.closest('[data-zahl]'); if (i) wertNeu(i.dataset.zahl, parseFloat(String(i.value).replace(',', '.'))); }
/* Tasten im Werkzeug (der Zeiger ist nicht in der Vorschau): Pfeile, Entf, Esc, ⌘Z wie in der Karte */
document.addEventListener('keydown', ev => {
  if (MODUS !== 'frei' || !D || !$('#fenster').hidden) return;
  if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) return;
  const cmd = ev.metaKey || ev.ctrlKey, k = ev.key.toLowerCase();
  if (cmd && k === 'z') { ev.preventDefault(); return ev.shiftKey ? wiederholen() : zurueckNehmen(); }
  if (cmd && k === 'y') { ev.preventDefault(); return wiederholen(); }
  if (!WAHLID) return;
  if (ev.key === 'Escape') return abwaehlen();
  if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); return entf(WAHLID); }
  if (/^Arrow/.test(ev.key)) { ev.preventDefault(); $('#vf').contentWindow.postMessage({ carte: 'pfeil', key: ev.key, shift: ev.shiftKey }, location.origin); }
});
/* Anordnung je Element, für «Vorher / nachher» (GBR lagen()): Schlüssel wie im Vergleich, gleiche Namen durchgezählt */
function lagen(d) {
  const m = {}, n = {};
  const nimm = (k, l) => { n[k] = (n[k] || 0) + 1; if (l && Object.keys(l).length) m[k + '#' + n[k]] = JSON.stringify(l); };
  (d.seiten || []).forEach((s, i) => {
    Object.entries(s.lage || {}).forEach(([k, l]) => nimm('seite' + i + '|' + k, l));
    const geh = (x, k) => { if (!istEl(x) && !(istKnoten(x) && x.fn === 'seite')) return; if (x.lage) nimm(k + '|' + SATZ.textVon(x).replace(/\s+/g, ' ').trim().slice(0, 60), x.lage); x.a.slice(x.fn === 'seite' ? 1 : 2).forEach((y, j) => geh(y, k + '.' + j)); };
    geh(s, 's' + i);
  });
  return m;
}
function lageAnders(a, b) { const A = lagen(a), B = lagen(b); return new Set([...Object.keys(A), ...Object.keys(B)].filter(k => A[k] !== B[k])).size; }

function oeffneAusVorschau(pfad) { const p = eintragPfad(pfad); if (p) eintragFenster(p); }

// ---------------------------------------------------------------- Leiste
function darfVeroeffentlichen() { return !!(RECHTE.veroeffentlichen && RECHTE.veroeffentlichen.includes(ROLLE)); }
function leiste() {
  oben();
  const g = geaendert(), n = g ? vergleich(STAND, D).length : 0;
  const sp = OFFEN ? 'wartet' : (leiste.gruen ? 'fertig' : 'glas');
  const darf = darfVeroeffentlichen(), k = LISTE.find(x => x.ziel === Z) || {};
  /* Robert 20.10.2026: Zustand stimmt mit dem Kopf überein, der Satz ist kurz und ganz, und es stehen nur Knöpfe da, die gerade etwas tun (keine
     ausgegrauten). Speichern zeigt immer seinen Zustand (R09). Look: Leiste unten aus dem Bereichs-Entwurf (.wleist). */
  const titel = OFFEN ? 'Not saved yet' : g ? `Draft: ${n} ${n === 1 ? 'change' : 'changes'}` : (k.live || k.pdf_zeit) ? 'All published' : 'Not published yet';
  const satz = OFFEN ? 'Save puts your input in the draft.' : g ? 'Not in the PDF and website yet.' : (k.live || k.pdf_zeit) ? 'PDF and website are up to date.' : 'The menu is ready for its first PDF.';
  const ok = !OFFEN && !g && (SICHT === 'ueber' ? stand3().ok : (k.live || k.pdf_zeit));
  const ueber = SICHT === 'ueber', s3 = stand3();
  const kn = (g ? wk('Discard', 'zurueck', '', 'data-akt="verwerfen" title="Discard draft"') : '')
    + (g ? wk('Before / after', 'vergleich', '', 'data-akt="vgl"') : '')
    + (ueber ? '' : wk('Test PDF', 'pdf', '', 'data-akt="probe"'))
    + (ueber && !OFFEN ? '' : wk(OFFEN ? 'Save' : sp === 'fertig' ? 'Saved' : 'All saved', OFFEN ? 'speichern' : 'check', sp === 'wartet' ? 'warten' : sp === 'fertig' ? 'fertig' : '', 'id="l-sp" data-akt="speichern"'))
    + (g && !OFFEN && darf ? wk('Publish', 'senden', 'gold', 'id="l-raus" data-akt="veroeffentlichen"') : '');
  $('#leiste').classList.toggle('entwurf', g && !OFFEN);
  $('#leiste').innerHTML = `<span class="stp wleist__t">${ok ? ic('check', 'ck') : `<i class="pt ${OFFEN ? 'rt' : 'au'}"></i>`}<span><b>${h(ueber && !g && !OFFEN ? s3.t : (k.name ? k.name + ' · ' + titel : titel))}</b><small>${h(ueber && !g && !OFFEN ? 'Open a menu to change it.' : satz)}</small></span></span>
    <span class="mono wleist__m">⌘S saves${MODUS === 'frei' ? ' · ⌘Z undoes' : ''}</span><span class="wr">${kn}</span>`;
  leistePasst();
}
/* Robert 20.10.2026, 01:24 (Bild: «Entwurf: 1 Änderung» läuft in «Verwerfen»): reicht der Platz nicht, zeigen die Knöpfe nur ihr Zeichen, dann fällt der Satz weg.
   Der Titel bleibt ganz und überdeckt nie einen Knopf. */
function leistePasst() {
  const l = $('#leiste'), t = l && l.querySelector('.wleist__t b'); if (!t) return;
  l.classList.remove('eng', 'enger');
  const zu = () => t.scrollWidth > t.parentElement.clientWidth + 1 || l.scrollWidth > l.clientWidth + 1;
  if (zu()) l.classList.add('eng');
  if (zu()) l.classList.add('enger');
}
window.addEventListener('resize', () => { leistePasst(); if (HANDY() && MODUS === 'frei' && !OFFEN && D) { MODUS = 'einfach'; alles(); } });
function alles() {
  if (MODUS !== 'frei') { WAHLID = null; WAHLINFO = null; GST_OFFEN = false; }
  if (MODUS === 'frei' && ANSICHT === 'website') { ANSICHT = 'karte'; }   // gestaltet wird in der Karte (GBR: an() nur in der Ansicht Karte)
  $('#vf').hidden = ANSICHT === 'website'; $('#web').hidden = ANSICHT !== 'website'; $('#webwahl').hidden = ANSICHT !== 'website'; $('.vorschau__z').hidden = ANSICHT === 'website'; $$('.ansicht button').forEach(b => b.setAttribute('aria-pressed', b.dataset.ansicht === ANSICHT));
  seitenleiste();
  document.body.classList.toggle('frei', MODUS === 'frei');
  rand(); kopf(); reiter(); vTitel(); seitenWahl(); liste(); if (ANSICHT === 'website') website(); else vorschau(); leiste();
  if (SICHT === 'ueber') ueberblick();
}

// ---------------------------------------------------------------- Speichern
let KETTE = Promise.resolve();   // Speichern nacheinander: zwei schnelle Eingaben dürfen sich nicht selbst in die Quere kommen (WebKit, 15.10.2026: Konflikt mit der eigenen Eingabe)
function speichern(was, text, ohneUndo) { const r = KETTE.then(() => speichernEcht(was, text, ohneUndo)); KETTE = r.catch(() => {}); return r; }
async function speichernEcht(was, text, ohneUndo) {
  const vorher = BASIS;
  let r;
  try { r = await api('entwurf', { z: Z, daten: D, was, erwartet: ERWARTET || '' }); } catch (e) { fehlerSagen('Not saved', e); OFFEN = inhalt(D) !== BASIS; leiste();  return false; }   // Doldenhorn 17.10.2026: abgewiesene Eingaben bleiben und warten gelb (R10), statt «Alles gespeichert»
  OFFEN = false; GESCHRIEBEN = [];
  if (!r.geaendert) { sag('Nothing changed, nothing saved.'); leiste(); return true; }
  ERWARTET = r.zeit;
  if (!ohneUndo) UNDO.push(vorher);
  BASIS = inhalt(D);
  leiste.gruen = true; setTimeout(() => { leiste.gruen = false; if (!OFFEN) leiste(); }, 2600);
  const k = LISTE.find(x => x.ziel === Z); if (k) k.entwurf = geaendert();
  rand(); reiter(); kopf(); leiste();
  if (MODUS === 'einfach') liste();
  sag(was || 'Saved in the draft', text || 'PDF and website change only when you publish.', [{ t: 'Undo', f: rueckgaengig }, { t: 'Before, after', f: vglFenster }]);
  return true;
}
async function rueckgaengig() {
  if (!UNDO.length) return sag('Nothing to undo.');
  const x = UNDO.pop(); const j = JSON.parse(x);
  D.seiten = j.s; D.css = j.c;
  if (await speichern('Undone', 'The draft is back as before the last change.', true)) alles();
}
async function tun(fn, was, text, blitz) {
  const alt = inhalt(D);
  fn();
  if (inhalt(D) === alt) return sag('Nothing changed, nothing saved.');
  BLITZ = blitz || null;
  if (MODUS === 'einfach') liste();
  vorschau();
  await speichern(was, text);
}

// ---------------------------------------------------------------- Fenster
function fenster(html, breit) {
  const f = $('#fenster');
  f.innerHTML = `<div class="fenster__k${breit ? ' breit' : ''}" role="dialog" aria-modal="true"><button class="rund fenster__zu" type="button" data-zu aria-label="Close">${SYM.zu}</button>${html}</div>`;
  f.hidden = false;
  f.onclick = ev => { if (ev.target === f || ev.target.closest('[data-zu]')) zu(); };
  const erst = $('input:not([type=hidden]),textarea', f); if (erst) setTimeout(() => erst.focus(), 30);
}
let BEIM_ZU = null;
function zu() { const f = $('#fenster'); f.hidden = true; f.innerHTML = ''; f.oninput = null; f.onclick = null; if (BEIM_ZU) { const b = BEIM_ZU; BEIM_ZU = null; b(); } }
function frage(titel, text, ja, f) {
  fenster(`<h2>${titel}</h2><p class="satz">${h(text)}</p><div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Cancel</button><button class="kn" type="button" id="ja">${h(ja)}<i>${PF}</i></button></div>`);
  $('#ja').addEventListener('click', () => { BEIM_ZU = null; zu(); f(); });
}
function chips(id, wahl, art) { return `<div class="chips" id="${id}">${wahl.map(([v, t]) => `<button type="button" data-v="${h(v)}" aria-pressed="${v === art}">${h(t)}</button>`).join('')}</div>`; }

/* Wer arbeitet hier? (kein Passwort, Master 7a und Robert 15.10.2026: vorerst keines; bei der Auslieferung kommt die Anmeldung davor) */

/* ---------- Eintrag bearbeiten: jedes Feld ist ein Text des Eintrags (SATZ.felder), dazu die Zeichen des Hauses ---------- */
const NB_AT = ' class="dh-nb"', BILD_AT = t => ` class="dh-z" src="${t}" alt=""`;
function symbole() { return (D.teile || []).map((t, i) => { const s = SYMBOLE.find(([k]) => String(t).slice(22, 22 + k.length) === k); return s ? [i, s[1]] : null; }).filter(Boolean); }
function eltern(pfad) { const k = pfad.split('.'); return liesPfad(D, k.slice(0, -2).join('.')); }
function kette(pfad) {   // Behälter zwischen Seite und Eintrag (für die Vorschau im Fenster)
  const k = pfad.split('.'), aus = [];
  for (let x = 4; x < k.length; x += 2) { const n = liesPfad(D, k.slice(0, x).join('.')); if (istEl(n)) aus.push({ tag: n.a[0], at: n.a[1] }); }
  return aus;
}
function ohneIds(x) { if (Array.isArray(x)) x.forEach(ohneIds); else if (x && typeof x === 'object') { delete x.id; Object.values(x).forEach(ohneIds); } return x; }
function eintragFenster(pfad, neu) {
  const n = liesPfad(D, pfad); if (!istEl(n)) return;
  const art = artVon(pfad), fe = SATZ.felder(n, art);
  const sy = symbole(), zeichenOk = sy.length && SATZ.hatZeichenOrt(n), zAlt = zeichenOk ? SATZ.zeichenVon(n) : [];
  let zWahl = zAlt.slice();
  const rub = (() => { const r = zeilenSeite(+pfad.split('.')[1]); let t = ''; for (const z of r) { if (z.pfad === pfad) break; if (z.art === 'rubrik') t = titelVon(z.n, 'rubrik'); } return t; })();
  const feld = (f, i) => { const lang = LANG.test(f.name) || String(f.wert).length > 64; return `<label class="feld"><span>${h(f.name)}</span>${lang ? `<textarea id="f-${i}" rows="${Math.min(6, Math.max(2, Math.ceil(String(f.wert).length / (innerWidth < 600 ? 32 : 70))))}">${h(f.wert)}</textarea>` : `<input id="f-${i}" value="${h(f.wert)}"${f.preis ? ' inputmode="decimal"' : ''}>`}</label>`; };
  fenster(`<h2>${neu ? 'New <em>item.</em>' : `Edit <em>${h((FN[art] || 'item').toLowerCase())}.</em>`}</h2>
    <p class="satz">${rub ? `Section «${h(rub)}». ` : ''}${neu ? 'This item is a copy, so it has the same format as the others. Change what should be different.' : 'You see the item on the right as soon as you save.'} An empty field takes the line out of the item.</p>
    <div class="zwei"><div class="felder">${fe.map(feld).join('') || '<p class="satz">This item has no text.</p>'}
    ${zeichenOk ? `<div class="feld"><span>Signs of the house</span><div class="chips" id="f-z">${sy.map(([t, nm]) => `<button type="button" data-t="${t}" aria-pressed="${zWahl.includes(t)}">${h(nm)}</button>`).join('')}</div></div>` : ''}
    ${neu ? '' : `<div class="feld"><span class="schalter" role="switch" tabindex="0" aria-checked="${!n.aus}" id="f-zeigen"><b></b>Show on the menu</span></div>`}</div>
    ${miniHTML()}</div>
    <p class="fehler" id="f-fehler" role="alert"></p>
    <div class="fenster__kn">${neu ? '' : '<button class="textknopf" type="button" id="f-weg" style="margin-right:auto">Take off the menu</button>'}<button class="kn kn--hell" type="button" data-zu>Cancel</button><button class="kn" type="button" id="f-ok">${neu ? 'Put on the menu' : 'Save'}<i>${PF}</i></button></div>`, true);
  if (neu) BEIM_ZU = () => { const v = vater(pfad); v.arr.splice(v.idx, 1); liste(); vorschau(); };
  const cz = $('#f-z'); if (cz) cz.addEventListener('click', ev => { const b = ev.target.closest('[data-t]'); if (!b) return; const t = +b.dataset.t; zWahl = zWahl.includes(t) ? zWahl.filter(x => x !== t) : sy.map(([x]) => x).filter(x => x === t || zWahl.includes(x)); b.setAttribute('aria-pressed', zWahl.includes(t)); miniNeu(); });
  const zs = $('#f-zeigen'); if (zs) { const umsch = () => zs.setAttribute('aria-checked', zs.getAttribute('aria-checked') !== 'true'); zs.addEventListener('click', umsch); zs.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); umsch(); } }); }
  const weg = $('#f-weg'); if (weg) weg.addEventListener('click', () => { BEIM_ZU = null; entfernen(pfad); });
  const bauen = (fertig) => {
    const x = kopie(n);
    fe.forEach((f, i) => { /* Schlössli 20.10.2026: geschützte Leerzeichen des Satzes (vor «–») bleiben */ let w = $('#f-' + i).value.replace(/[ \t\r\n]+/g, ' ').replace(/^ +| +$/g, ''); if (f.preis && fertig) w = preisForm(w); SATZ.setzeFeld(x, f, w); });
    if (zeichenOk && JSON.stringify(zWahl) !== JSON.stringify(zAlt)) SATZ.setzeZeichen(x, zWahl, BILD_AT, NB_AT);
    delete x.aus;
    return x;
  };
  const sende = () => { try { miniSenden({ knoten: bauen(false), kette: kette(pfad), seite: D.seiten[+pfad.split('.')[1]].a[0] }); } catch (e) { /* unfertige Eingabe */ } };
  function miniNeu() { setTimeout(sende, 0); }
  miniLos(() => ({ knoten: bauen(false), kette: kette(pfad), seite: D.seiten[+pfad.split('.')[1]].a[0] }));
  $('#fenster').oninput = sende;
  $('#f-ok').addEventListener('click', async () => {
    const x = bauen(true);
    if (zs) { if (zs.getAttribute('aria-checked') !== 'true') x.aus = true; else delete x.aus; }
    const fn = SATZ.felder(x, art), nm = fn.find(f => /^Name/.test(f.name));
    if (art === 'eintrag' && fe.some(f => /^Name/.test(f.name)) && !(nm && String(nm.wert).trim())) { $('#f-fehler').textContent = 'Please enter a name.'; return; }
    if (art !== 'eintrag' && fe.length && !fn.some(f => String(f.wert).trim())) { $('#f-fehler').textContent = 'Please enter a text.'; return; }
    const t = titelVon(x, art);
    if (!neu && JSON.stringify(x) === JSON.stringify(n)) { BEIM_ZU = null; zu(); return sag('Nothing changed, nothing saved.'); }
    BEIM_ZU = null; zu();
    const v = vater(pfad);
    if (neu) { v.arr[v.idx] = x; await speichern(`${FN[art] || 'Item'} on the menu`, `«${t}» is now in the draft.`); BLITZ = pfad; liste(); vorschau(); }
    else await tun(() => { v.arr[v.idx] = x; }, `${FN[art] || 'Item'} saved`, `«${t}»`, pfad);
  });
}
/* «So steht es auf der Karte» (GBR mini()): der Eintrag allein, gesetzt wie in der PDF, im kleinen Rahmen rechts im Fenster */
function miniHTML() { return `<div><p class="mono" style="margin:0 0 8px">How it looks on the menu</p><div class="mini"><iframe id="f-mini" title="The item as it is in the PDF" src="/the-cat-and-gun/haus/_werkzeuge/carte/satz/blatt.html?mini=1"></iframe></div></div>`; }
let MINI_LETZT = null;
function miniSenden(x) {
  MINI_LETZT = x;
  const f = $('#f-mini'); if (!f || !f.contentWindow) return;
  f.contentWindow.postMessage(Object.assign({ carte: 'mini', karte: { art: D.art, format: D.format, teile: D.teile } }, x), location.origin);
}
function miniLos(f) { const fr = $('#f-mini'); if (!fr) return; fr.addEventListener('load', () => { try { miniSenden(f()); } catch (e) { /* egal */ } }); }
window.addEventListener('message', ev => { if (ev.origin === location.origin && ev.data && ev.data.carte === 'mini-hoehe') { const f = $('#f-mini'); if (f) f.style.height = Math.min(420, Math.max(60, ev.data.h)) + 'px'; } });
const istRub = (arr, j, el) => istEl(arr[j]) && SATZ.art(arr[j], el) === 'rubrik';
function entfernen(pfad) {
  const v = vater(pfad), el = eltern(pfad), n = v.arr[v.idx], t = titelVon(n, artVon(pfad));
  const rubrik = istRub(v.arr, v.idx, el);
  let bis = v.idx + 1;
  if (rubrik) while (bis < v.arr.length && !istRub(v.arr, bis, el)) bis++;
  const anz = rubrik ? v.arr.slice(v.idx + 1, bis).filter(istEl).length : 0;
  frage(rubrik ? 'Remove <em>section?</em>' : 'Take off <em>the menu?</em>', rubrik && anz ? `«${t}» and the ${anz} items under it leave the menu. Until you publish, «Undo» or «Discard» brings everything back.` : `«${t}» leaves the menu. If it is only for a while, better hide it (eye). Until you publish, it can be brought back.`, 'Take off the menu',
    () => tun(() => { v.arr.splice(v.idx, rubrik ? bis - v.idx : 1); }, rubrik ? 'Section removed' : 'Taken off the menu', t));
}
function schiebe(pfad, r) {
  const v = vater(pfad), el = eltern(pfad), n = v.arr[v.idx];
  if (istRub(v.arr, v.idx, el)) {   // ganze Rubrik mit ihren Einträgen gegen die Nachbar-Rubrik tauschen
    const st = []; v.arr.forEach((x, i) => { if (istRub(v.arr, i, el)) st.push(i); });
    const k = st.indexOf(v.idx), nach = st[k + r];
    if (nach === undefined && el && /(^| )sb-r( |$)/.test(SATZ.klasse(el))) {   // Schlössli 20.10.2026: Werkbank-Satz, jede Rubrik in ihrem Abschnitt (section.sb-r): den ganzen Abschnitt tauschen
      const kp = pfad.split('.'), ep = kp.slice(0, -2).join('.'), w = vater(ep);
      let j = w.idx + r; while (j >= 0 && j < w.arr.length && !(istEl(w.arr[j]) && /(^| )sb-r( |$)/.test(SATZ.klasse(w.arr[j])))) j += r;
      if (j >= 0 && j < w.arr.length) return tun(() => { [w.arr[w.idx], w.arr[j]] = [w.arr[j], w.arr[w.idx]]; }, 'Order saved', `«${titelVon(n, 'rubrik')}» is now further ${r < 0 ? 'up' : 'down'}`, w.arrPfad + '.' + j + '.' + kp.slice(-2).join('.'));
    }
    if (nach === undefined) return sag(r < 0 ? 'This section is already at the top.' : 'This section is already at the bottom.', 'Sections move within their page.');
    const ende = i => (st[st.indexOf(i) + 1] ?? v.arr.length);
    const [a, c] = r < 0 ? [nach, v.idx] : [v.idx, nach];
    return tun(() => { const vorn = v.arr.slice(a, ende(a)), hinten = v.arr.slice(c, ende(c)); v.arr.splice(a, ende(c) - a, ...hinten, ...vorn); }, 'Order saved', `«${titelVon(n, 'rubrik')}» is now further ${r < 0 ? 'up' : 'down'}`, v.arrPfad + '.' + (r < 0 ? a : a + (ende(c) - c)));
  }
  const j = nachbar(v.arr, v.idx, r); if (j < 0) return sag(r < 0 ? 'Already at the top.' : 'Already at the bottom.', 'An item stays on its page. To another page it goes with copy and remove.');
  /* Abnahme 28.11.2026: über die erste Rubrik hinaus geht es nicht weiter nach oben (der Posten stand sonst ohne Rubrik am Kopf der Seite) */
  if (r < 0 && istRub(v.arr, j, el) && !v.arr.slice(0, j).some((x, i) => istRub(v.arr, i, el))) return sag('Already at the top.', 'An item stays on its page. To another page it goes with copy and remove.');
  tun(() => { [v.arr[v.idx], v.arr[j]] = [v.arr[j], v.arr[v.idx]]; }, 'Order saved', `«${titelVon(n, artVon(pfad))}» is now further ${r < 0 ? 'up' : 'down'}`, v.arrPfad + '.' + j);
}
function kopieren(pfad) {
  const v = vater(pfad), n = ohneIds(kopie(v.arr[v.idx])); delete n.aus;
  v.arr.splice(v.idx + 1, 0, n);
  liste(); vorschau();
  eintragFenster(v.arrPfad + '.' + (v.idx + 1), true);
}
function neuAmEnde(i) {
  const zl = zeilenSeite(i).filter(r => r.art === 'eintrag');
  const letzte = zl[zl.length - 1];
  if (!letzte) return sag('This page has no item to copy from yet.', 'First copy an item from another page.', [], true);
  kopieren(letzte.pfad);
}
function rubrikBlock(pfad) {   // Rubrik → letzter Eintrag ihres Blocks (bis zur nächsten Rubrik, im selben Behälter; in Behälter darunter hinein)
  const v = vater(pfad), el = eltern(pfad); let letzt = null;
  const tiefster = (x, p) => { let r = null; (function geh(y, q, e) { if (!istEl(y)) return; const a = SATZ.art(y, e); if (a === 'eintrag') { r = q; return; } if (a === null) y.a.slice(2).forEach((z, k) => geh(z, q + '.a.' + (k + 2), y)); })(x, p, el); return r; };
  for (let j = v.idx + 1; j < v.arr.length; j++) {
    if (istRub(v.arr, j, el)) break;
    const x = v.arr[j]; if (!istEl(x)) continue;
    const a = SATZ.art(x, el);
    if (a === 'eintrag') letzt = v.arrPfad + '.' + j;
    else if (a === null) { const t = tiefster(x, v.arrPfad + '.' + j); if (t) letzt = t; }
  }
  return letzt;
}
function neuHier(pfad) {
  const l = rubrikBlock(pfad);
  if (!l) return sag('This section has no item to copy from yet.', 'Copy an item from another section and move it here.', [], true);
  kopieren(l);
}
function neuGlobal() {
  const opts = [];
  D.seiten.forEach((s, i) => zeilenSeite(i).forEach(r => { if (r.art === 'rubrik' && rubrikBlock(r.pfad)) opts.push([r.pfad, titelVon(r.n, 'rubrik')]); }));
  if (!opts.length) { const e = D.seiten.map((s, i) => zeilenSeite(i).filter(r => r.art === 'eintrag').pop()).filter(Boolean).pop(); return e ? kopieren(e.pfad) : sag('This menu has no item to copy from.', '', [], true); }
  fenster(`<h2>New <em>item.</em></h2><p class="satz">Where? The new item goes to the end of the section, as a copy of its last item, so it has the same format. You can move it with the arrows afterwards.</p>
    <div class="chips g-wahl" id="g-r" style="margin-bottom:6px">${opts.map(([p, t], k) => `<button type="button" data-k="${k}" aria-pressed="false"><span class="g-b" aria-hidden="true" style="background-image:${rubrikBild(t)}"></span>${h(t)}</button>`).join('')}</div>`);
  $('#g-r').addEventListener('click', ev => { const b = ev.target.closest('[data-k]'); if (!b) return; zu(); neuHier(opts[+b.dataset.k][0]); });
}
function rubrikNeu(i) {
  const rr = zeilenSeite(i).filter(r => r.art === 'rubrik'); if (!rr.length) return;
  const letzte = rr[rr.length - 1], v = vater(letzte.pfad), x = ohneIds(kopie(letzte.n)); delete x.aus;
  const f = SATZ.felder(x, 'rubrik'); f.forEach((ff, k) => SATZ.setzeFeld(x, ff, k ? '' : 'New section'));
  v.arr.push(x); liste(); vorschau();
  eintragFenster(v.arrPfad + '.' + (v.arr.length - 1), true);
}

// ---------------------------------------------------------------- Vorher / nachher, Verlauf, Daten, Protokoll, Zustand, Anschluss
function vglFenster() {
  const v = vergleich(STAND, D), W = { neu: 'New', weg: 'Removed', anders: 'Changed', verschoben: 'Moved', anordnung: 'Layout' };
  const darf = darfVeroeffentlichen();
  const markiere = (a, b) => { const wa = new Set(a.replace(/<[^>]+>/g, ' ').split(/\s+/)); return b.replace(/>([^<]+)</g, (m, t) => '>' + t.split(/(\s+)/).map(w => w.trim() && !wa.has(w) ? `<mark>${w}</mark>` : w).join('') + '<'); };
  fenster(`<h2>Before <em>and after.</em></h2><p class="satz">${v.length ? `${v.length} ${v.length === 1 ? 'place' : 'places'} in the draft. On the left what is in the PDF today, on the right the draft. New words are marked. Publishing changes the PDF for the next printed menu and the website. The boards in the café stay as they are.` : 'The draft is the same as the PDF.'}</p>
    <div class="vgl__k"><span></span><span class="mono">In the PDF today</span><span class="mono">In the draft</span></div>
    <div class="vgl">${v.map(x => { if (x.art === 'anordnung') return `<div class="vgl__z"><span class="mono">${W[x.art]}<br><small style="text-transform:none;letter-spacing:0;color:var(--leise)">${h(x.b.ort)}</small></span><div>As set</div><div>${x.n} ${x.n === 1 ? 'part moved, resized or restyled' : 'parts moved, resized or restyled'}</div></div>`; const a = x.a ? x.a.text : '', b = x.b ? x.b.text : ''; return `<div class="vgl__z"><span class="mono">${W[x.art]}<br><small style="text-transform:none;letter-spacing:0;color:var(--leise)">${h((x.b || x.a).ort || '')}</small></span><div class="${a ? '' : 'leer'}">${a ? (x.art === 'weg' ? `<del>${a}</del>` : a) : 'was not there yet'}</div><div class="${b ? '' : 'leer'}">${b ? (x.art === 'anders' ? markiere(a, b) : b) : 'no longer on the menu'}</div></div>`; }).join('')}</div>
    <div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Close</button>${v.length && darf ? `<button class="kn kn--gold" type="button" id="v-ok">Publish<i>${PF}</i></button>` : ''}</div>`, true);
  const ok = $('#v-ok'); if (ok) ok.addEventListener('click', veroeffentlichen);
}
async function verlaufFenster() {
  let l = [];
  try { l = (await api('verlauf?z=' + Z)).liste; } catch (e) { return fehlerSagen('Versions cannot be read', e); }
  fenster(`<h2>Earlier <em>versions.</em></h2><p class="satz">Every published version is kept, every discarded draft too, and the menu as the tool started with it. Bringing a version back puts it in the draft. PDF and website change only when you publish. The manager can bring versions back.</p>
    <div class="verlauf"><div class="verlauf__z"><span class="verlauf__b" aria-hidden="true" style="background-image:url('${fotoKlein(Z)}')"></span><div><b>Original menu</b><br><span class="mono">as the tool started with it</span></div><div>${WO.knopf('Put in the draft', 'pfeil', 'hell', { klein: true, attr: 'data-d="grundstand"' })}</div></div>
    ${l.map(x => `<div class="verlauf__z"><span class="verlauf__b" aria-hidden="true" style="background-image:url('${fotoKlein(Z)}')"></span><div><b>${x.art === 'verworfen' ? 'Discarded draft' : 'Published'}</b><br><span class="mono">${h(x.zeit)}${x.wer ? ' · ' + h(x.wer) : ''}</span></div><div>${WO.knopf('Put in the draft', 'pfeil', 'hell', { klein: true, attr: `data-d="${h(x.datei)}"` })}</div></div>`).join('') || [   /* M27 (Robert 18.10.2026): nie leer, solange nichts veröffentlicht ist, stehen beschriftete Beispiele da */
      ['Published', '16.10.2026 17:20 · Manager'], ['Discarded draft', '12.10.2026 10:45 · Kitchen'], ['Published', '05.10.2026 09:10 · Manager']]
      .map(([t, z]) => `<div class="verlauf__z verlauf__z--bsp"><span class="verlauf__b" aria-hidden="true" style="background-image:url('${fotoKlein(Z)}')"></span><div><b>${t}</b><br><span class="mono">Example · ${z}</span></div><div><span class="kn kn--klein kn--hell" aria-disabled="true">Put in the draft</span></div></div>`).join('')
      + '<p class="verlauf__bsp">Examples. Every version shows here like this once the first PDF is published.</p>'}</div>
    <div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Close</button></div>`);
  $('#fenster').addEventListener('click', async ev => {
    const b = ev.target.closest('[data-d]'); if (!b) return;
    try { await api('zurueckholen', { z: Z, datei: b.dataset.d }); } catch (e) { return fehlerSagen('Not brought back', e); }
    zu(); await lade(Z); sag('Version in the draft', 'Check before and after, then publish.', [{ t: 'Before, after', f: vglFenster }]);
  });
}
function datenFenster() {
  fenster(`<h2>Menu <em>data.</em></h2><p class="satz">For advanced use: the pages of the menu as text. Every item is a building block (fn) with its fields (a). «aus»: true hides an item. After «Apply» the menu shows on the right. Save with the button below. The server checks every input.</p>
    <textarea class="daten" id="j-t" spellcheck="false">${h(JSON.stringify(D.seiten, null, 1))}</textarea><p class="fehler" id="j-f"></p>
    <div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Cancel</button><button class="kn" type="button" id="j-ok">Apply<i>${PF}</i></button></div>`, true);
  $('#j-ok').addEventListener('click', () => {
    let x; try { x = JSON.parse($('#j-t').value); } catch (e) { const m = /line (\d+)/.exec(e.message || ''); $('#j-f').textContent = 'The text is not in a valid format' + (m ? ' (line ' + m[1] + ')' : '') + '. Check commas, quotes and brackets. Nothing was saved.'; return; }
    if (!Array.isArray(x) || !x.length) { $('#j-f').textContent = 'The pages of the menu are missing.'; return; }
    D.seiten = x; OFFEN = inhalt(D) !== BASIS; zu(); vorschau(); leiste();
    sag('Applied', 'Not saved yet. «Save» below puts it in the draft.');
  });
}
async function protokollFenster() {
  let l = [];
  try { l = (await api('protokoll?z=' + Z)).liste; } catch (e) { return fehlerSagen('Log cannot be read', e); }
  const T = { entwurf: 'saved', verworfen: 'discarded the draft', probe: 'printed a test PDF', veroeffentlicht: 'published', 'veroeffentlichen-abgebrochen': 'publishing stopped', einstellungen: 'changed the website link', 'aus-sicherung': 'file taken from the backup', zurueckholen: 'brought a version back' };
  fenster(`<h2>Who did <em>what?</em></h2><p class="satz">The latest entries for this menu, newest first.</p><div class="prot">${l.map(x => `<div><span class="mono">${h(x.zeit)}</span><span><b style="font-weight:600">${h(x.wer)}</b> ${h(ROLLEN[x.rolle] ? '(' + ROLLEN[x.rolle] + ')' : '')} ${h(T[x.was] || x.was)}${x.text ? `<small>${h(x.text)}</small>` : ''}${x.grund ? `<small>${h(x.grund)}</small>` : ''}</span></div>`).join('') || '<div><span></span><span>Nothing logged yet.</span></div>'}</div>
    <div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Close</button></div>`, true);
}
async function gesundFenster() {
  let g; try { g = await api('gesund'); } catch (e) { return fehlerSagen('State cannot be read', e); }
  STATUS_ROT = !g.ok; rand();
  const z = (t, ok) => `<div><span>${h(t)}</span><b class="${ok ? 'ja' : 'nein'}">${ok ? 'fine' : 'missing'}</b></div>`;
  const W = { node: 'Printing the PDF', playwright: 'Print program', pdftotext: 'Checking the PDF', speicher: 'Storage', druck: 'Printing the PDF', pdfpruefung: 'Checking the PDF' };
  const bf = (g.browserfehler || [])[0];
  fenster(`<h2>Is everything <em>fine?</em></h2><p class="satz">The state of the tool, read straight from the server.${g.vorfuehrung ? ' Demo mode: saved data does not last.' : ''}</p><div class="gesund">${Object.entries(g.karten).map(([k, ok]) => z('Data ' + ((LISTE.find(x => x.ziel === k) || {}).name || k), ok)).join('')}${Object.entries(g.werkzeug).map(([k, ok]) => z(W[k] || k, ok)).join('')}
    <div><span>Storage of the tool</span><b>${g.speicher_mb} MB</b></div><div><span>Running for</span><b>${Math.round(g.seit / 60)} min</b></div>${g.fehler.length ? `<div><span>Last error in the server</span><b class="nein">${h(g.fehler[g.fehler.length - 1].slice(0, 160))}</b></div>` : ''}${bf ? `<div><span>Last error in the browser</span><b class="nein">${h(bf.zeit + ' · ' + bf.text.slice(0, 120))}</b></div>` : ''}</div>
    <div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Close</button><button class="kn kn--hell" type="button" id="g-log">Log</button><a class="kn" href="/the-cat-and-gun/haus/_werkzeuge/carte/pruefung.html" target="_blank" rel="noopener">Open check<i>${PF}</i></a></div>`);
  $('#g-log').addEventListener('click', () => { zu(); protokollFenster(); });   // «Log» stand früher im Kopf; jetzt hier (Fussblock der Seitenleiste wie Edit website)
}
async function einstFenster() {
  const st = await api('status'), s = st.einstellungen; EINST = s;
  const bereit = (st.website || []).length ? `Ready to go online: ${st.website.map(h).join(', ')}.` : 'No website page differs from the website today.';
  if (s.demo) return fenster(`<h2>Website <em>link.</em></h2><p class="satz">The website is not online yet. «Publish» makes the PDF for the printer and builds the website pages with the new menu. They wait here until the website goes online. ${bereit}</p>
    <div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Close</button><a class="kn" href="${HAUS}menu.html" target="_blank" rel="noopener">Menu page today<i>${PF}</i></a></div>`);   // Demo-Check 21.10.2026
  fenster(`<h2>Website <em>link.</em></h2><p class="satz">With the link on, «Publish» also puts the changed website pages in place. The old pages are kept first. ${bereit} Only the manager can change this.</p>
    <div class="felder" style="margin-top:20px"><div class="feld"><span class="schalter" role="switch" tabindex="0" aria-checked="${!!s.anschluss_pdf}" id="e-a"><b></b>Put published pages on the website</span></div></div>
    <div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Close</button><button class="kn" type="button" id="e-ok">Save<i>${PF}</i></button></div>`);
  const sw = $('#e-a'); const um = () => sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') !== 'true'); sw.addEventListener('click', um); sw.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); um(); } });
  $('#e-ok').addEventListener('click', async () => { try { await api('einstellungen', { anschluss_pdf: sw.getAttribute('aria-checked') === 'true' }); zu(); sag('Saved', sw.getAttribute('aria-checked') === 'true' ? 'Published pages now go on the website too.' : 'The website stays as it is.'); } catch (e) { fehlerSagen('Not saved', e); } });
}

// ---------------------------------------------------------------- Probe, Veröffentlichen, Verwerfen
async function probe() {
  if (OFFEN && !(await speichern('Saved in the draft', 'Saved before the test PDF.'))) return;
  /* Endprüfung 19.10.2026: die Probe öffnet sich im neuen Tab, sobald sie fertig ist (der Tab wird beim Klick geöffnet, sonst blockt Safari ihn);
     dazu bleibt die Meldung mit «Probe öffnen» 30 s stehen */
  let tab = null; try { tab = window.open('', '_blank'); if (tab) tab.document.write('<title>Test PDF</title><p style="font:16px system-ui;padding:40px;color:#15120f">The test PDF is being printed …</p>'); } catch (x) { tab = null; }
  sag('Printing the test PDF', 'One moment, it opens in a new tab.', [], false, 30000);
  try {
    const r = await api('probe', { z: Z });
    const url = new URL(r.url, location.href).href;
    if (tab && !tab.closed) tab.location.href = url;
    sag('Test PDF ready', `${r.seiten} ${r.seiten === 1 ? 'page' : 'pages'}, ${r.art === 'entwurf' ? 'from the draft' : 'as published'}.${r.warn && r.warn.length ? ' ' + r.warn[0] : ''} The real PDF stays as it is.`, [{ t: 'Open test PDF', href: url }], false, 30000);
  } catch (e) { if (tab && !tab.closed) tab.close(); fehlerSagen('No test PDF', e); }
}
async function veroeffentlichen() {
  if (OFFEN && !(await speichern('Saved in the draft', 'Saved before publishing.'))) return;
  if (!geaendert()) { zu(); return sag('Nothing changed, nothing published.'); }
  const SCHRITTE = ['Checking the draft', 'Setting and printing the menu', 'Comparing PDF and data', 'Building the menu page of the website', 'Switching to the new version'];
  fenster(`<div class="lade"><div class="lade__r"></div><h2>The menu <em>is being made.</em></h2><p class="satz" style="margin:0">The PDF is printed and checked word for word against the data, then the website pages are built. Only when everything is right does it replace the old version. Otherwise everything stays as it is. This takes about half a minute.</p><ol id="l-s">${SCHRITTE.map(s => `<li>${h(s)}</li>`).join('')}</ol></div>`);
  $('#fenster').onclick = null;
  { const x = $('#fenster .fenster__zu'); if (x) x.remove(); }   // Abnahme 28.11.2026: solange Publish läuft, schliesst auch Escape das Fenster nicht (der Pfeil oben rechts tat schon nichts)
  try { const r0 = await api('veroeffentlichen', { z: Z }); if (r0.geaendert === false) { zu(); await lade(Z, true); return sag('Nothing changed, nothing published.'); } } catch (e) { zu(); return fehlerSagen('Not published', e); }
  const t0 = Date.now();
  for (;;) {
    await new Promise(r => setTimeout(r, 700));
    let s; try { s = (await api('status')).bau; } catch (e) { continue; }
    const k = s.schritte.indexOf(s.schritt);
    $$('#l-s li').forEach((li, i) => { li.className = s.laeuft ? (i < k ? 'fertig' : i === k ? 'jetzt' : '') : (s.fehler ? '' : 'fertig'); });
    if (!s.laeuft) {
      if (s.fehler) { zu(); await lade(Z); return sag('Not published', 'The PDF is unchanged, your draft is still here. ' + s.fehler.slice(0, 220), [], true); }
      await lade(Z, true);
      const b = s.bericht || {}, web = (/website: ([^·]*)/.exec(b.anschluss || '') || [])[1] || '';
      const webSatz = /not built/.test(b.anschluss || '') ? 'The website pages could not be built; it is in the error log.' : /no page changes/.test(web) ? 'No website page changes.' : `Website pages with the new menu: ${h(web.trim())}. ${/^(demo|aus)/.test(b.anschluss || '') ? 'They are ready and go online with the website.' : 'They are now on the website.'}`;
      return fenster(`<h2>Published. <em>The new version is set.</em></h2><p class="satz">${h(s.fertig)}. ${b.mass ? `Type size ${Math.min(...b.mass)} to ${Math.max(...b.mass)} %. ` : ''}The PDF is ready for the next printed menu. ${webSatz} The boards in the café stay as they are. The last version is under «Earlier versions».</p>
        <div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Close</button><button class="kn kn--hell" type="button" data-ansicht="website" data-zu>View website</button><a class="kn kn--gold" href="${API}pdf?z=${Z}&q=live" target="_blank" rel="noopener">Open PDF<i>${PF}</i></a></div>`);
    }
    if (Date.now() - t0 > 300000) { zu(); return sag('This takes unusually long', 'Please reload the page later.', [], true); }
  }
}
function verwerfen() {
  frage('Discard <em>draft?</em>', 'All changes since the last PDF are dropped. The discarded draft is kept under «Earlier versions».', 'Discard', async () => {
    try { await api('verwerfen', { z: Z }); } catch (e) { return fehlerSagen('Not discarded', e); }
    await lade(Z); sag('Draft discarded', 'The menu is back as in the PDF.');
  });
}

// ---------------------------------------------------------------- Laden
async function lade(z, still) {
  const r = await api('karte?z=' + encodeURIComponent(z));
  if (z !== Z) { WAHLID = null; WAHLINFO = null; GST_OFFEN = false; NEU_KARTE = true; WEBSEITE = SEITE_DER_KARTE[z] || 'menu.html'; }   // Demo-Check 21.10.2026: Ansicht «Website» zeigt die Seite dieser Karte, nicht die zuletzt gewählte
  HIST.length = 0; ZUK.length = 0;
  Z = z; STAND = r.stand; D = kopie(r.entwurf || r.stand); BASIS = inhalt(D); OFFEN = false; UNDO = []; GESCHRIEBEN = [];
  ERWARTET = r.entwurf_zeit || STAND.veroeffentlicht;   // auch ein Entwurf, der dem Stand gleicht (nach «Rückgängig»), hat seine eigene Zeit
  try { const st = await api('status'); LISTE = st.karten; RECHTE = st.rechte; EINST = st.einstellungen; } catch (e) { /* Liste bleibt */ }
  try { localStorage.setItem('lc-karte', z); } catch (e) { /* egal */ }
  if (SICHT === 'karte') history.replaceState(null, '', '#' + z);
  alles();
  if (!still && r.entwurf) sag('Draft opened', `Saved on ${r.entwurf_zeit}${r.entwurf_wer ? ' by ' + r.entwurf_wer : ''}, not in the PDF yet.`);
}
async function wechsel(z) {
  document.documentElement.classList.remove('wo-rand-auf');   // R07: am Handy schliesst sich der Rand nach der Wahl (oberflaeche.js tut es auch)
  if (z === Z) return SICHT === 'karte' ? undefined : sicht('karte');
  if (SICHT === 'ueber' && !OFFEN) { await KETTE; await lade(z); return sicht('karte'); }
  await KETTE;   // läuft gerade ein Speichern, erst abwarten: dann ist nichts mehr offen
  if (OFFEN) return frage('Not <em>saved.</em>', 'This menu has changes that are not saved yet.', 'Discard and switch', async () => { await lade(z); if (SICHT !== 'karte') sicht('karte'); });
  await lade(z);
}

// ---------------------------------------------------------------- Ereignisse
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-akt],[data-z],[data-m],[data-zoom],[data-ansicht],[data-webseite],[data-seite]');
  if (!b || (b.closest('#fenster') && !b.dataset.ansicht) || !D) return;
  if (b.dataset.ansicht) { if (b.closest('#fenster')) zu(); ANSICHT = b.dataset.ansicht; if (SICHT !== 'karte') sicht('karte', true); return website(); }
  if (b.dataset.seite) return seiteZeigen(+b.dataset.seite);
  if (b.dataset.webseite) { WEBSEITE = b.dataset.webseite; return website(); }
  if (b.dataset.z) return wechsel(b.dataset.z);
  if (b.dataset.m === 'frei' && HANDY()) return;
  if (b.dataset.m) { if (OFFEN && b.dataset.m === 'einfach') return frage('Not <em>saved.</em>', 'Save first, then switch?', 'Save', async () => { if (await speichern('Saved in the draft')) { MODUS = 'einfach'; alles(); } }); MODUS = b.dataset.m; try { localStorage.setItem('lc-modus', MODUS); } catch (e) { /* egal */ } return alles(); }
  if (b.dataset.zoom) { ZM[MODUS] = Math.min(1.3, Math.max(.35, +(ZM[MODUS] + (+b.dataset.zoom) * .1).toFixed(2))); try { localStorage.setItem('lc-zoom-' + MODUS, ZM[MODUS]); } catch (e) { /* egal */ } return $('#vf').contentWindow.postMessage({ carte: 'zoom', zoom: ZM[MODUS], eigen: ZM[MODUS] > ZM_STD[MODUS], wahl: MODUS === 'frei' ? WAHLID : null }, location.origin); }
  const a = b.dataset.akt, r = b.closest('.r'), pfad = r ? r.dataset.pfad : '';
  if (b.tagName === 'A' && b.dataset.akt) ev.preventDefault();   // Links mit eigener Handlung (Overview, Short tour, Checks)
  if (a === 'ueber') { randZu(); return sicht('ueber'); }
  if (a === 'sicht') { if (b.closest('.umsch')) { ANSICHT = 'karte'; sicht('karte', true); return website(); } return sicht('karte'); }   // Abnahme 28.11.2026: der Schalter «Menu» der Overview öffnet die Karte, auch wenn zuletzt «Website» gewählt war
  if (a === 'web-sicht') { ANSICHT = 'website'; sicht('karte', true); return website(); }
  if (a === 'neu-sicht') { if (MODUS !== 'einfach') { MODUS = 'einfach'; try { localStorage.setItem('lc-modus', MODUS); } catch (e) { /* egal */ } alles(); } sicht('karte'); return neuGlobal(); }
  if (a === 'spring') { const p2 = b.dataset.pfad, r2 = $(`#liste .r[data-pfad="${p2}"]`); if (r2) { r2.scrollIntoView({ block: 'center', behavior: 'smooth' }); markiere(p2); setTimeout(() => { const rr = r2.getBoundingClientRect(); blitzRechts(p2, rr.top + rr.height / 2); }, 450); } $$('#sekt button').forEach(x => x.classList.toggle('an', x === b)); return; }
  if (a === 'speichern') return OFFEN ? speichern('Saved in the draft') : sag(leiste.gruen ? 'Saved.' : 'Everything is saved.', 'There is no open input right now.');
  if (a === 'veroeffentlichen') return OFFEN || geaendert() ? (OFFEN ? speichern('Saved in the draft').then(ok => ok && vglFenster()) : vglFenster()) : null;
  if (a === 'vgl') return vglFenster();
  if (a === 'probe') return probe();
  if (a === 'verwerfen') return verwerfen();
  if (a === 'verlauf') return verlaufFenster();
  if (a === 'daten') return datenFenster();
  if (a === 'protokoll') return protokollFenster();
  if (a === 'gesund') return gesundFenster();
  if (a === 'einst') return einstFenster();
  if (a === 'rundgang') return window.rundgang && window.rundgang();
  if (a === 'neu') return neuGlobal();
  if (a === 'neu-hier') return neuHier(pfad);
  if (a === 'edit') return eintragFenster(pfad);
  if (a === 'waehle') return waehle(pfad);
  if (a === 'kopie') return kopieren(pfad);
  if (a === 'neu-ende') return neuAmEnde(+b.dataset.i);
  if (a === 'rubrik-neu') return rubrikNeu(+b.dataset.i);
  if (a === 'hoch') return schiebe(pfad, -1);
  if (a === 'runter') return schiebe(pfad, 1);
  if (a === 'weg') return entfernen(pfad);
  if (a === 'aus') { const v = vater(pfad), u = v.arr[v.idx], wird = !u.aus; return tun(() => { if (wird) u.aus = true; else delete u.aus; }, wird ? 'Hidden' : 'Back on the menu', `«${istKnoten(u) ? titelVon(u) : u.text}»`, pfad); }
  const si = +b.dataset.i;
  if (a === 's-aus' && !D.seiten[si].aus && D.seiten.filter(x => !x.aus).length === 1) return sag('The only page stays.', 'Otherwise no page is left on the menu. Hide single items with the eye.');
  if (a === 's-aus') return tun(() => { const s = D.seiten[si]; if (s.aus) delete s.aus; else s.aus = true; }, D.seiten[si].aus ? 'Page back on the menu' : 'Page hidden', 'Page ' + (si + 1));   // Abnahme 28.11.2026: die beiden Meldungen waren vertauscht (der Text wird vor dem Umschalten gelesen)
  if (a === 's-hoch' || a === 's-runter') { const j = si + (a === 's-hoch' ? -1 : 1); if (j < 0 || j >= D.seiten.length) return; return tun(() => { [D.seiten[si], D.seiten[j]] = [D.seiten[j], D.seiten[si]]; }, 'Page moved', `Page ${si + 1} is now page ${j + 1}`); }
});
document.addEventListener('keydown', ev => {
  if (/^[1-8]$/.test(ev.key) && !ev.metaKey && !ev.ctrlKey && !ev.altKey && $('#fenster').hidden && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '') && !(document.activeElement || {}).isContentEditable) {
    const t = $(`#rand [data-taste="${ev.key}"]`); if (t && t.tagName === 'A') { ev.preventDefault(); t.click(); } return;
  }
  if (ev.key === 'Escape' && document.documentElement.classList.contains('wo-rand-auf')) return randZu();
  if (ev.key === 'Escape' && !$('#fenster').hidden && $('#fenster [data-zu]')) zu();
  if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 's') { ev.preventDefault(); if (OFFEN) speichern('Saved in the draft'); }
  const sw = ev.target.closest && ev.target.closest('.schalter[data-akt]'); if (sw && (ev.key === ' ' || ev.key === 'Enter')) { ev.preventDefault(); sw.click(); }
});
document.addEventListener('click', ev => {   // Handy: Seitenleiste als Schublade
  const b = ev.target.closest('.wo-kopf__ber');
  if (b) { const auf = document.documentElement.classList.toggle('wo-rand-auf'); b.setAttribute('aria-expanded', auf); return; }
  if (document.documentElement.classList.contains('wo-rand-auf') && !ev.target.closest('#rand')) randZu();
});
window.addEventListener('hashchange', () => { let z = location.hash.slice(1); if (z === 'prices') { try { z = localStorage.getItem('lc-karte') || ''; } catch (e) { z = ''; } if (!LISTE.some(k => k.ziel === z)) z = LISTE[0].ziel; if (MODUS !== 'einfach' && !OFFEN) { MODUS = 'einfach'; alles(); } if (z === Z && SICHT !== 'karte') return sicht('karte'); if (z === Z) return history.replaceState(null, '', '#' + z); } if (z === 'uebersicht' && SICHT !== 'ueber') sicht('ueber'); else if (LISTE.some(k => k.ziel === z) && (z !== Z || SICHT !== 'karte')) wechsel(z); });
$('#liste').addEventListener('dblclick', ev => { const t = ev.target.closest('.r__t'); const r = t && t.closest('.r'); if (r && r.dataset.pfad && !/\.titel$/.test(r.dataset.pfad)) eintragFenster(r.dataset.pfad); });
window.addEventListener('beforeunload', ev => { if (OFFEN) { ev.preventDefault(); ev.returnValue = ''; } });

// ---------------------------------------------------------------- Start
(async () => {
  /* Langsame oder belegte Leitung (Robert 18.10.2026 23:54): der Start wird still bis zu dreimal versucht, erst danach steht die Meldung */
  for (let versuch = 0; ; versuch++) {
  try {
    const z0 = await (await fetch('/the-cat-and-gun/haus/_werkzeuge/carte/satz/zeichen.json', { cache: versuch ? 'reload' : 'no-store' })).json();
    SATZ.zeichen(z0); SATZ_ZEICHEN = z0;
    try { FOTO = await (await fetch('/the-cat-and-gun/haus/_werkzeuge/carte/bilder/fotos.json', { cache: 'no-store' })).json(); } catch (e) { FOTO = {}; }   // Fotos je Karte (einlesen.py)
    const st0 = await api('status'); LISTE = st0.karten; RECHTE = st0.rechte; EINST = st0.einstellungen;
    /* Ohne Karte in der Adresse öffnet die Übersicht (Overview, wie im Entwurf); #drinks, #coffee-juices, #kitchen öffnen die Karte */
    /* Control panel, Kachel «Change a price» (28.11.2026): #prices öffnet die zuletzt bearbeitete Karte (sonst Drinks) mit den Preisen zum Ändern, im Modus Simple */
    const preise = location.hash === '#prices';
    if (preise) MODUS = 'einfach';
    let z = location.hash.slice(1); const direkt = preise || LISTE.some(k => k.ziel === z);
    if (!direkt || preise) { try { z = localStorage.getItem('lc-karte'); } catch (e) { z = ''; } }
    if (!LISTE.some(k => k.ziel === z)) z = LISTE[0].ziel;
    SICHT = direkt ? 'karte' : 'ueber'; sichtFlags();
    await lade(z);
    if (SICHT === 'ueber') { history.replaceState(null, '', '#uebersicht'); ueberDaten().then(() => { if (SICHT === 'ueber') { ueberblick(); ueberAuftritt(); } }); }
    api('gesund').then(g => { STATUS_ROT = !g.ok; rand(); }).catch(() => { STATUS_ROT = true; rand(); });
    wegePruefen();
    break;
  } catch (e) {
    if (versuch < 2) { await new Promise(z => setTimeout(z, versuch ? 3000 : 1200)); continue; }
    document.body.innerHTML = `<div style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#15120f;color:#f4efe7;font-family:system-ui,sans-serif;text-align:center"><div><p style="font-size:1.4rem;margin:0 0 10px">${h(NAME)} does not start.</p><p style="margin:0 0 22px;color:rgba(244,239,231,.7)">${h(e.message)}</p><a href="/the-cat-and-gun/haus/_werkzeuge/carte/pruefung.html" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#f4efe7;color:#15120f;text-decoration:none">Open check</a></div></div>`;
    if (window.carteMerk) window.carteMerk('Start: ' + e.message);
    break;
  }
  }
})();
})();
