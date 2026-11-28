/* Inquiries & chat · The Cat & Gun (22.11.2026, Kopie von La Réception des Culinarium Hannover, ohne KI).
   Inbox: was Gäste aus dem Chat der Website ans Haus schicken (der Chat fand keine Antwort). Mit Kontakt ist es eine Anfrage, auf die Julie persönlich
   antworten kann (Text kopieren, hier wird nichts verschickt). Questions: alle diese Fragen nach Themen; Julie schreibt die Antwort einmal, nach «Publish»
   gilt sie für alle Gäste. What the chat knows: das belegte Grundwissen und alles, was Julie ergänzt hat; ändern, ausblenden, «Valid until».
   Entwurf, Stand, Verlauf wie Master 2.2: Änderungen liegen im Entwurf, «Publish» schreibt chat/antworten.json neu, frühere Stände lassen sich zurückholen.
   Server-Teil: server.py und reception.py (/the-cat-and-gun/haus/_werkzeuge/reception/api/…). Keine KI, kein Knopf deutet KI an. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
// Schliessen ohne «×» (Vorlage 30.10.2026: kein X auf der Seite): der Zurück-Pfeil
const ZU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 9.67 2.67 6.33 6 3M2.67 6.33h7.33a3.33 3.33 0 0 1 0 6.67h-2"/></svg>';
const ZEICHEN = '<img src="zeichen-haus.svg" width="176" height="148" alt="">';   // das Et-Zeichen der Wortmarke (drucksachen/zeichen/et-schwarz.svg)
const MARKE = '<img class="brief__marke" src="marke-haus.svg" width="621" height="534" alt="The Cat &amp; Gun">';   // die Wortmarke (drucksachen/zeichen/wortmarke-schwarz.svg)
const telNb = t => t.replace(/\+\d[\d ]{6,}\d/g, m => m.replace(/ /g, ' '));   // Telefonnummer nie mitten in der Zahl umbrechen
/* Lokal läuft jedes Werkzeug auf seinem eigenen Server (WO_HAUS.ports): Wege zu den anderen Werkzeugen mit voller Adresse 127.0.0.1:<port>, nie relativ, nie localhost (Fehlerbuch 10a). */
(() => { const H = window.WO_HAUS || {}, P = H.ports || {}, W = H.wege || {};
  if (/^(127\.0\.0\.1|localhost|\[::1\])$/.test(location.hostname)) Object.keys(W).forEach(k => { if (k !== 'gaeste' && P[k] && /^\//.test(W[k])) W[k] = 'http://127.0.0.1:' + P[k] + W[k]; }); })();
/* Lokal meldet der Server, welche anderen Werkzeuge gerade laufen (api/ueberblick → werkzeuge). Ein Knopf zu einem Werkzeug, das noch nicht läuft,
   steht ohne Link da («Not set up yet»), statt ins Leere zu führen (Oberflächen-Prüfung Punkt 19). Online fehlt die Angabe: alle Links bleiben. */
let wegeGeplant = false;
function wegeAus() {
  wegeGeplant = false;
  /* «·» zwischen zwei Angaben hängt am folgenden Wort: bricht die Zeile, steht der Punkt vorn auf der neuen Zeile, nie allein am Zeilenende
     (auch mit 13 px Schrift am Handy; PRUEFUNG.md zweite Runde, Hinweis «·») */
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) if (n.data.indexOf(' · ') >= 0 && !(n.parentElement && n.parentElement.closest('textarea,input,script,style'))) n.data = n.data.replace(/ · /g, ' ·\u00a0');
  const L = (S && S.ue && S.ue.werkzeuge) || null, W = (window.WO_HAUS || {}).wege || {};
  if (!L) return;
  Object.keys(L).forEach(k => {
    if (L[k] || !W[k]) return;
    const ziel = new URL(W[k], location.href).href;
    document.querySelectorAll('a[href]').forEach(a => { if (a.href.startsWith(ziel)) {
      a.removeAttribute('href'); a.removeAttribute('target'); a.setAttribute('aria-disabled', 'true'); a.title = 'Not set up yet'; a.classList.add('wo-fehlt'); } });
  });
}
new MutationObserver(() => { if (!wegeGeplant) { wegeGeplant = true; queueMicrotask(wegeAus); } }).observe(document.documentElement, { childList: true, subtree: true });
/* Auftritt «re-auf» (Karten, Antwort im Eingang): Was beim Zeichnen unterhalb des Bildschirms liegt, wartet mit seiner Bewegung, bis es hereingescrollt wird,
   statt sie unsichtbar schon abzuspielen (Oberflächen-Prüfung Punkt 11, 23.11.2026). Bewegung bleibt dieselbe wie in der Vorlage. */
const aufIO = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.style.animationPlayState = ''; e.target.classList.remove('re-wart'); aufIO.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' }) : null;   /* .re-wart: auch die Fotos darin warten (Effekte-Standard 23.11.2026) */
let aufGeplant = false;
const AUF_DAZU = '#ansicht .so-chat > li, #ansicht .so-chat__kn, #ansicht .wi-such, #ansicht .sb > *';
function aufWarten() {
  aufGeplant = false;
  if (!aufIO || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  document.querySelectorAll('.re-auf:not(.still):not([data-auf])').forEach(x => {
    x.setAttribute('data-auf', '');
    if (x.getBoundingClientRect().top <= innerHeight) return;
    /* Karten unter «Your answers»: die Teile der Karte schweben nacheinander herein (Frage, Antwort, Knöpfe), damit auch eine Karte knapp unter dem Rand
       etwas zeigt, das erst beim Hereinscrollen kommt (Oberflächen-Prüfung Punkt 11 mit fünf Antworten bei 1728 und 1920 px) */
    if (x.classList.contains('re-n')) {
      x.classList.remove('re-auf');
      [...x.children].forEach((t, k) => { t.setAttribute('data-auf', ''); t.classList.add('re-auf'); t.style.setProperty('--i', k); t.style.animationPlayState = 'paused'; t.classList.add('re-wart'); aufIO.observe(t); });
      return;
    }
    x.style.animationPlayState = 'paused'; x.classList.add('re-wart'); aufIO.observe(x);
  });
  /* Blöcke ohne eigene Bewegung («How the chat works»: die Schritte; «What the chat knows»: Suche und Liste) bekommen dieselbe Bewegung, aber nur,
     wenn sie unterhalb des Bildschirms liegen; was gleich zu sehen ist, steht ruhig da */
  document.querySelectorAll(AUF_DAZU).forEach(x => {
    if (x.hasAttribute('data-auf') || x.classList.contains('re-auf')) return;
    x.setAttribute('data-auf', '');
    if (x.getBoundingClientRect().top > innerHeight) { x.classList.add('re-auf', 're-wart'); x.style.animationPlayState = 'paused'; aufIO.observe(x); }
  });
}
new MutationObserver(() => { if (!aufGeplant) { aufGeplant = true; requestAnimationFrame(() => { aufWarten(); rasterFuellen(); }); } }).observe(document.documentElement, { childList: true, subtree: true });
/* Raster ohne Lücke in der letzten Reihe («Your answers» mit fünf Antworten in drei Spalten, «Last changes» unter «What the chat knows»): die letzte Karte reicht bis zum Rand (Fehlerbuch 10a, Prüfung Punkt 13) */
function rasterFuellen() {
  document.querySelectorAll('#ansicht .re-nliste:not(.re-nliste--bsp), #ansicht .sb-verlauf ol').forEach(el => {
    const k = [...el.children]; k.forEach(x => { x.style.gridColumn = ''; });
    const sp = getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length, rest = k.length % sp;
    if (sp > 1 && rest && k.length) k[k.length - 1].style.gridColumn = 'span ' + (sp - rest + 1);
  });
}
addEventListener('resize', () => rasterFuellen());
const STUBE = /\/_werkzeuge\//.test(location.pathname) && !/^(127\.0\.0\.1|localhost|\[::1\])$/.test(location.hostname) ? '../maison/' : /\/_werkzeuge\//.test(location.pathname) ? 'http://127.0.0.1:' + ((window.WO_HAUS || {}).ports || {}).zentrale + '/the-cat-and-gun/haus/_werkzeuge/maison/' : '/maison/';
const SYM = {
  buch: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 3.2c2-.8 3.8-.6 5.5.6 1.7-1.2 3.5-1.4 5.5-.6v9.6c-2-.8-3.8-.6-5.5.6-1.7-1.2-3.5-1.4-5.5-.6z"/><path d="M8 3.8v9.6"/></svg>',
  chat: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 4a1.5 1.5 0 0 1 1.5-1.5h8A1.5 1.5 0 0 1 13.5 4v5.5A1.5 1.5 0 0 1 12 11H7l-3 2.5V11a1.5 1.5 0 0 1-1.5-1.5z"/></svg>',
  korb: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5"/></svg>',
  kopie: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="8.5" height="8.5" rx="1.5"/><path d="M11 5V3.5A1 1 0 0 0 10 2.5H3.5a1 1 0 0 0-1 1V10a1 1 0 0 0 1 1H5"/></svg>',
  haken: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7"/></svg>',
  auge: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></svg>' };
const ART = { frage: 'Question from the chat' };
const S = { ue: null, ansicht: 'start', anfragen: null, fragen: null, nachgetragen: null, wahl: '', filter: 'alle', wissen: null, such: '', bereich: '', kette: null };
/* Fotos des Hauses (website/assets/bild/bNN-<breite>.webp, Nummern wie _quelle/instagram/liste.json). Kein Foto zweimal untereinander (Fehlerbuch 10a). */
/* Fotos des Hauses für Listen (ohne Plakate): Eine Liste zeigt dasselbe Foto höchstens dreimal, zwei Nachbarn nie dasselbe (Oberflächen-Prüfung Punkt 5, PRUEFUNG.md siebte Runde) */
const BILDPOOL = ['b14', 'b20', 'b31', 'b08', 'b22', 'b36', 'b11', 'b02', 'b29', 'b10', 'b19', 'b24', 'b01', 'b07', 'b09', 'b12', 'b13', 'b15', 'b16', 'b18', 'b21', 'b23',
  'b25', 'b26', 'b27', 'b28', 'b32', 'b33', 'b34', 'b04'];
const ARTBILDER = { frage: BILDPOOL };
function bilderVerteilen(wuensche) {   // je Eintrag eine Wunschliste (Fotos des Themas); Ergebnis: ein Foto je Eintrag
  const n = {}, aus = [];
  wuensche.forEach((w, i) => {   // zuerst ein Foto, das die Liste noch nicht zeigt, dann eins, das sie einmal zeigt, höchstens dreimal
    const kand = (w || []).concat(BILDPOOL); let b = null;
    for (let g = 1; g <= 3 && !b; g++) b = kand.find(x => (n[x] || 0) < g && x !== aus[i - 1]) || null;
    b = b || kand[0]; n[b] = (n[b] || 0) + 1; aus.push(b); });
  return aus;
}
const artBild = (art, id) => { const l = ARTBILDER[art] || ARTBILDER.frage, i = (S.anfragen || []).findIndex(x => x.id === id); if (i >= 0) return l[i % l.length]; let h = 0; for (const c of String(id || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0; return l[h % l.length]; };   // nach der Stelle in der Liste: zwei Nachbarn haben nie dasselbe Foto
const bild = (art, kl, id) => `<span class="${kl}" aria-hidden="true"><img src="/the-cat-and-gun/haus/assets/bild/${artBild(art, id)}-480.webp" alt="" width="480" height="640" decoding="async"></span>`;
const uhr = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); };

/* ---------- Server ---------- */
async function api(was, daten) {
  if (daten && !daten.__kette && /^(nachtragen|nachtragen_weg|wissen_fakt|wissen_eintrag|wissen_eintrag_weg|zurueckholen)$/.test(was)) {   // Fassung des Entwurfs mitschicken, nacheinander (Konflikt statt Überschreiben, E21)
    const lauf = async () => { const d = await api(was, { ...daten, __kette: 1, fassung: S.ue ? S.ue.fassung : undefined }); if (typeof d.fassung === 'number' && S.ue) S.ue.fassung = d.fassung; return d; };
    const k = (S.kette || Promise.resolve()).catch(() => {}).then(lauf); S.kette = k; return k;
  }
  if (was === 'anfrage' && daten && typeof daten.antwort_text === 'string' && !daten.__kette) {   // persönliche Antwort mit ihrer Fassung (E21)
    const a = (S.anfragen || []).find(x => x.id === daten.id);
    const lauf = async () => { const d = await api(was, { ...daten, __kette: 1, fassung: a && a.antwort ? (a.antwort.fassung || 0) : 0 }); if (a && typeof d.antwort_fassung === 'number') a.antwort = { ...(a.antwort || {}), text: daten.antwort_text, fassung: d.antwort_fassung }; return d; };
    const k = (S.kette || Promise.resolve()).catch(() => {}).then(lauf); S.kette = k; return k;
  }
  if (daten && daten.__kette) { daten = { ...daten }; delete daten.__kette; }
  let r;
  try {
    const vorab = daten === undefined && window.__vorab && window.__vorab[was]; if (vorab) delete window.__vorab[was];   // schon beim Laden der Seite geholt (index.html), nur einmal
    r = await (vorab || fetch('api/' + was, daten === undefined ? { cache: 'no-store' } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(daten) }));
  } catch (e) { throw new Error('VERBINDUNG · No connection. Your text is still here. Please try again in a moment.'); }
  let d = {};
  try { d = await r.json(); } catch (e) { throw new Error('SERVER · The answer could not be read (' + r.status + ').'); }
  if (!r.ok) throw new Error(d.fehler || ('SERVER · Error ' + r.status));
  if (daten !== undefined && !/^(nachtragen|nachtragen_weg|wissen_fakt|wissen_eintrag|wissen_eintrag_weg|zurueckholen)$/.test(was)) delete d.fassung;   // nur wer den Entwurf schreibt, bekommt eine neue Fassung; alles andere liesse ein Fenster mit altem Stand still überschreiben (E21)
  return d;
}
function fehler(e) {
  const m = String((e && e.message) || e), st = (m.match(/^([A-ZÄÖÜ-]+) · /) || [])[1] || '';
  const kn = [['What to do?', () => window.open('pruefung.html#' + (st || 'SERVER'), '_blank', 'noopener')]];
  if (st === 'KONFLIKT') kn.unshift(['Reload', () => location.reload()]);
  quit(m.replace(/^[A-ZÄÖÜ-]+ · /, ''), st ? 'Keyword ' + st : '', kn, true, 12000);
}
function quit(titel, text, knoepfe = [], fehl = false, dauer = 9000) {
  const q = document.createElement('div');
  q.className = 'quit' + (fehl ? ' fehl' : '');
  q.innerHTML = `<div><b>${esc(titel)}</b>${text ? `<span>${esc(text)}</span>` : ''}</div>`;
  knoepfe.forEach(([t, f]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.onclick = () => { f(); q.remove(); }; q.appendChild(b); });
  const x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.innerHTML = ZU; x.onclick = () => q.remove(); q.appendChild(x);
  $('#meldung').appendChild(q);
  while ($('#meldung').children.length > 3) $('#meldung').firstChild.remove();
  if (dauer) setTimeout(() => q.remove(), dauer);
}
const datum = iso => { const d = new Date(String(iso || '').length === 10 ? iso + 'T12:00:00' : iso); return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };
const zeit = iso => { const d = new Date(iso); return isNaN(d) ? '' : datum(iso) + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); };
const mal = (n, eins, viele) => n === 1 ? eins : n + ' ' + viele;

/* ---------- Rahmen: Kopf, Rand, Leiste ---------- */
const TITEL = { start: 'Overview', eingang: 'Inbox', gefragt: 'Questions', nachgetragen: 'Your answers', wissen: 'What the chat knows', chat: 'How the chat works' };
const WEGE = { anleitung: 'anleitung.html', pruefung: 'pruefung.html' };
const SB_FOTO = { eingang: 'b20-800', gefragt: 'b11-800', nachgetragen: 'b10-1200', wissen: 'b24-1200', chat: 'b31-1200' };   // Bühne je Ansicht, Fotos des Hauses
/* ---------- Neuer Look wie das Control panel (26.11.2026) ----------
   Vorlage: _entwurf-dashboard/guests-bereich (bau.py, guests.css) mit runde2/stil.css und runde3/zusatz.css; Seitenleiste wie im Panel (maison/dash.css «lack6»).
   Nur die Oberfläche: Ids, data-akt, data-gehe und alle Wege zum Server bleiben. Bausteine in neuer-look.css (Klassen «nl-»). */
const NI = {
  web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18"/>',
  menu: '<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 0-3 3-3 7h3v11"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>',
  frage: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/><path d="M10 9.5a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.2V13M12 16h.01"/>',
  buch: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.8-1.8 0-1.3-1-1.6-1-2.6 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  sticker: '<path d="M15 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6l9-9V9a6 6 0 0 0-6-6Z"/><path d="M12 21v-4a5 5 0 0 1 5-5h4"/>',
  druck: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
  besuch: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  guide: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/>',
  haus: '<path d="M3 11 12 4l9 7v9H3z"/><path d="M9 20v-6h6v6"/>',
  pfeil: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  uhr: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/>',
  auge: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  check: '<path d="m5 12 4 4 10-10"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  tel: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  verlauf: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  vergleich: '<rect x="3" y="4" width="8" height="16" rx="2"/><rect x="13" y="4" width="8" height="16" rx="2"/><path d="M6 9h2M6 13h2M16 9h2M16 13h2"/>',
  speichern: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',
  senden: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
  glas: '<path d="M6 3h12l-1.5 8a4.5 4.5 0 0 1-9 0z"/><path d="M12 15.5V21M8 21h8"/>',
  rutsche: '<path d="M4 20h16M6 20V7l4-3 4 3v13M14 7l6 9"/>',
  kugel: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.6"/>',
  kalender: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  kopie: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  eimer: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  nachricht: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
  person: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
  schritte: '<path d="M4 6h4v4H4zM10 14h4v4h-4zM16 6h4v4h-4zM8 8h8M12 10v4"/>',
  pfeilr: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  liste: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  zurueck: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>'
};
const ni = (n, c = 'nl-ico') => `<svg class="${c}" viewBox="0 0 24 24" aria-hidden="true">${NI[n] || ''}</svg>`;
const npf = () => `<span class="nl-pf">${ni('pfeil')}</span>`;
/* Knopf wie im Entwurf («wk»): Symbol, Text; art: gold oder leer */
const nk = (text, ico, art = '', attr = '') => `<button class="nl-wk${art ? ' nl-wk--' + art : ''}" type="button" ${attr}>${ico ? ni(ico) : ''}<span>${text}</span></button>`;
const zahlWort = n => ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'][n] || String(n);
function fakt(fid) { const W = S.wissen || {}; for (const b of W.steckbrief || []) for (const g of b.gruppen) for (const x of g.zeilen) if (x.fid === fid) { const t = (W.team || {})[fid]; return { ...x, angabe: t && t.angabe ? t.angabe : x.angabe }; } return null; }
function randHaus() {   // Öffnungszeit und Telefon aus «What the chat knows» (belegt), sobald die Daten da sind
  const el = $('#rand .nl-rhaus'); if (!el || !S.wissen) return;
  const z = fakt('zeiten'), tel = (S.wissen.kontakt || {}).telefon;
  el.innerHTML = (z ? `<span>${ni('uhr')}${esc(z.angabe.replace(/\.$/, ''))}</span>` : '') + (tel ? `<span>${ni('tel')}${telNb(esc(tel))}</span>` : '');
  el.hidden = !el.innerHTML;
}
/* Kopf nur am Handy und Tablet: zurück zum Control panel, Werkzeuge aufklappen (die Seitenleiste ist dort zu) */
function kopfLeiste() {
  $('#kopf').innerHTML = `<a class="nl-pill" href="${STUBE}">${ni('zurueck')}<span>${esc(WO.name('zentrale'))}</span></a>
    <span class="nl-kopf__t"><b>Guests</b><i>${esc(TITEL[S.ansicht] || '')}</i></span>
    <button class="nl-pill" type="button" data-nl-werkzeuge aria-expanded="false" aria-controls="rand">${ni('liste')}<span>Tools</span></button>`;
  const k = $('#kopf [data-nl-werkzeuge]');
  k.onclick = () => { const auf = !document.documentElement.classList.contains('nl-rand-auf'); document.documentElement.classList.toggle('nl-rand-auf', auf); k.setAttribute('aria-expanded', auf); };
}
function rand() {
  const u = S.ue;
  $('#rand').innerHTML = NL_LEISTE.html({ ue: u, wissen: S.wissen, imWerkzeug: true });   // neu/leiste.js: dieselbe Leiste wie auf Anleitung und Prüfseite, Aussehen wie Edit website
  NL_LEISTE.mitfahren($('#rand'));
  randHaus();
  $$('#rand [data-gehe]').forEach(b => b.onclick = e => { e.preventDefault(); document.documentElement.classList.remove('nl-rand-auf'); gehe(b.dataset.gehe); });
  $$('#rand [data-probe]').forEach(b => b.onclick = () => { document.documentElement.classList.remove('nl-rand-auf'); probe(); });
  kopfLeiste();
}
/* Tasten 1–8 wie im Control panel: öffnen das Werkzeug der Seitenleiste (nicht beim Schreiben, nicht bei offenem Fenster) */
document.addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey || !/^[1-8]$/.test(e.key)) return;
  const t = e.target; if (t && (t.closest('input,textarea,select,[contenteditable]') || !$('#fenster').hidden)) return;
  const a = $(`#rand a[data-taste="${e.key}"][href]`); if (a) { e.preventDefault(); location.href = a.href; }
  else if (e.key === '3') { e.preventDefault(); gehe('start'); }
});
document.addEventListener('click', e => { if (document.documentElement.classList.contains('nl-rand-auf') && !e.target.closest('#rand, [data-nl-werkzeuge]')) document.documentElement.classList.remove('nl-rand-auf'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.documentElement.classList.remove('nl-rand-auf'); });
/* Leiste unten wie im Entwurf («wleist»): Stand links, rechts «Before, after», «Earlier versions» und «Publish». Publish nur, wenn der Entwurf etwas ändert. */
function leiste() {
  const u = S.ue, n = u.entwurf;
  const titel = n ? 'Draft: ' + mal(n, 'one change waits', 'changes wait') : u.stand_zeit ? 'Everything is published' : 'Not published yet';
  const satz = n ? 'Guests see your changes after «Publish».' : u.stand_zeit ? 'The chat on the website answers with ' + mal(u.antworten, 'one answer', 'answers') + '. Last published ' + zeit(u.stand_zeit) + '.' : 'Publish once, then the chat on the website has its answers.';
  $('#leiste').innerHTML = `<div class="nl-stp${n ? ' nl-stp--entwurf' : ''}">${n ? '<i class="nl-pt"></i>' : ni('check', 'nl-ck')}<span><b>${esc(titel)}</b><small>${esc(satz)} Nothing is sent from the tool.</small></span></div>
    <div class="nl-wr">${nk('Before, after', 'vergleich', '', `id="l-vgl"${n ? '' : ' disabled'}`)}${nk('Earlier versions', 'verlauf', '', 'id="l-verlauf"')}${nk('Publish', 'senden', n || !u.stand_zeit ? 'gold' : '', `id="l-pub"${!n && u.stand_zeit ? ' disabled' : ''}`)}</div>`;
  $('#l-vgl').onclick = vorherNachher;
  $('#l-verlauf').onclick = fassungen;
  $('#l-pub').onclick = veroeffentlichenFenster;
}
/* Reiter im Kopf jeder Ansicht: die sechs Ansichten des Werkzeugs (im Entwurf «Overview · Inbox · Questions · What the chat knows»; «Your answers» und «How the chat works» gehören dazu) */
function reiter() {
  const u = S.ue, z = { eingang: u.anfragen_offen, gefragt: u.ohne_antwort, wissen: u.entwurf };
  return `<nav class="nl-tabs" aria-label="Views">${Object.keys(TITEL).map(k => `<button class="nl-tab${S.ansicht === k ? ' nl-an' : ''}" type="button" data-gehe="${k}"${S.ansicht === k ? ' aria-current="page"' : ''}>${esc(TITEL[k])}${z[k] ? `<em>${z[k]}</em>` : ''}</button>`).join('')}</nav>`;
}
/* Kopf jeder Ansicht wie «Inbox» im Entwurf (gheld klein): Zeile, grosser Name, Satz, Knöpfe, Reiter; Foto rechts */
function kopf(mono, titel, satz, knoepfe = '', foto = '') {
  const name = TITEL[S.ansicht] || mono, lang = name.length > 12 ? (name.length > 17 ? ' nl-h--lang2' : ' nl-h--lang') : '';
  return `<section class="nl-p nl-held nl-held--klein wo-sb"><img class="nl-held__b" src="${sbWeg(foto || SB_FOTO[S.ansicht] || 'b08-1200')}" alt="" decoding="sync">
    <div class="nl-held__i"><div class="nl-mono">${ni('chat', 'nl-mi')}${esc(WO.name('gaeste'))} · ${esc(mono)}</div><h1 class="nl-h${lang}">${esc(name)}</h1>
      <p class="nl-held__s">${satz}</p>${knoepfe ? `<div class="nl-wkst">${nlKn(knoepfe)}</div>` : ''}${reiter()}</div></section>`;
}
/* alte Knöpfe (kn kn--gold / kn--linie) der Ansichten im Kopf als Knöpfe des Entwurfs; Ids bleiben */
const nlKn = h => String(h || '').replace(/<button class="kn kn--(gold|linie)(?: glanz-kn)?" type="button" id="([^"]+)">([^<]+)<i>[\s\S]*?<\/i><\/button>/g,
  (m, art, id, t) => nk(t, id === 'n-neu' || id === 'w-neu' ? 'pfeilr' : id === 'w-probe-auf' ? 'chat' : '', art === 'gold' ? 'gold' : '', `id="${id}"`));

/* Das gemeinsame Kleid (_werkzeuge/oberflaeche/) baut zu jedem Foto 800 und 1200 (WO_HAUS.fotoGroessen). Fotos, die die Website nur bis 800 hat (b20), kommen ohne diesen Satz,
   sonst lädt der Browser eine Datei, die es nicht gibt (Mac-Lauf 23.11.2026). */
function sbWeg(k) { return '/the-cat-and-gun/haus/assets/bild/' + k + '.webp' + (/-800$/.test(k) ? '?w=800' : ''); }
function gehe(ziel, wahl = '') {
  wartendesSichern();
  if (ziel === 'eingang' && S.ansicht === 'eingang' && wahl && $('#detail')) {   // im Eingang nur die Anfrage wechseln, die Liste bleibt stehen
    const a = S.anfragen.find(x => x.id === wahl);
    if (a) {
      S.wahl = wahl;
      $$('.re-a.aktiv').forEach(k => k.classList.remove('aktiv'));
      const k = $(`.re-a[data-wahl="${CSS.escape(wahl)}"]`); if (k) k.classList.add('aktiv');
      ruhigTauschen($('#detail'), detail(a)); verbindeEingang();
      if (innerWidth <= 1180) $('#detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
  }
  S.ansicht = ziel; S.wahl = wahl;
  try { localStorage.setItem('reception-ansicht', ziel); } catch (e) { /* privat */ }
  if (location.hash.slice(1) !== ziel) history.replaceState(null, '', '#' + ziel);
  rand(); zeichne(); window.scrollTo(0, 0);
  $('#rand').classList.remove('auf');
}
async function frisch(neu = false) {
  try {
    S.ue = await api('ueberblick');
    if (neu) { S.anfragen = null; S.fragen = null; S.wissen = null; }
    rand(); leiste(); await zeichne();
  } catch (e) { fehler(e); }
}

/* ---------- Ansichten ---------- */
async function zeichne() {
  const el = $('#ansicht');
  try {
    if (S.ansicht === 'start') { await ladeAlles(); el.innerHTML = start(); verbindeStart(); }
    else if (S.ansicht === 'eingang') { await ladeAlles(); el.innerHTML = eingang(); verbindeEingang(); }
    else if (S.ansicht === 'gefragt') { await ladeAlles(); el.innerHTML = gefragt(); verbindeGefragt(); }
    else if (S.ansicht === 'nachgetragen') { await ladeAlles(); el.innerHTML = nachgetragenS(); verbindeNachgetragen(); }
    else if (S.ansicht === 'wissen') { await ladeWissen(); el.innerHTML = wissenS(); verbindeWissen(); }
    else if (S.ansicht === 'chat') { await ladeWissen(); el.innerHTML = soChat(); }
    $$('#ansicht [data-gehe]').forEach(b => b.onclick = () => gehe(b.dataset.gehe, b.dataset.wahl || ''));
    $$('#ansicht .re-n').forEach((x, i) => { x.classList.add('re-auf'); x.style.setProperty('--i', Math.min(i, 12)); });
    randHaus();
  } catch (e) { fehler(e); }
}
async function ladeAlles() {
  if (!S.anfragen) { const d = await api('anfragen'); S.anfragen = d.anfragen; }
  if (!S.fragen) { const d = await api('fragen'); S.fragen = d.fragen; S.nachgetragen = d.nachgetragen; }
  if (!S.wissen) S.wissen = await api('wissen');
}

/* Übersicht wie «Overview» im Entwurf: Kopf mit Handy (der Chat, wie Gäste ihn sehen), Waiting for you, How a question travels, What the chat knows, drei Wege unten.
   Was im Entwurf graue Balken sind, kommt hier aus dem Posteingang und aus «What the chat knows». */
const WEG_SCHRITTE = [['chat', 'A guest asks', 'In the chat on the website', 'b08'], ['buch', 'The chat answers', 'Only with its lines, no AI', 'b24'],
  ['frage', 'No answer?', '«Send to the house»', 'b11'], ['nachricht', 'Your inbox', 'With contact, time and page', 'b14'], ['insta', 'You reply', 'Copy text, send by phone, message or Instagram', 'b20']];
const BER_ICO = { 'Opening hours': 'uhr', 'Finding us': 'pin', 'Breakfast': 'menu', 'Food': 'menu', 'Drinks': 'glas', 'Pool & playground': 'kugel', 'Events': 'kalender', 'The Cat & Gun': 'haus' };
function nlStatus(a) { return a.status === 'neu' ? 'New' : a.status === 'erledigt' ? 'Done' : a.antwort && a.antwort.text ? 'Reply ready' : 'Read'; }
function start() {
  const u = S.ue, offen = S.anfragen.filter(a => a.status !== 'erledigt'), luecken = S.fragen.filter(f => !f.erledigt);
  const z = fakt('zeiten');
  const satz = (u.anfragen_gesamt ? `${zahlWort(u.anfragen_gesamt)} ${u.anfragen_gesamt === 1 ? 'guest' : 'guests'} left a contact.` : 'No guest has left a contact yet.') + ' ' +
    (u.ohne_antwort ? `${zahlWort(u.ohne_antwort)} ${u.ohne_antwort === 1 ? 'question waits' : 'questions wait'} for an answer.` : 'Every question has an answer.');
  const q = luecken[0];
  const handy = `<div class="nl-ghphone"><div class="nl-hdy"><div class="nl-hdy__s nl-cph">
      <div class="nl-cphk"><img src="neu/et-weiss.svg" alt="" width="22" height="22"><b>The Cat &amp; Gun</b></div>
      ${z ? `<div class="nl-bub nl-bub--g">${esc(z.was)}</div><div class="nl-bub nl-bub--h">${esc(z.angabe)}</div>` : ''}
      ${q ? `<div class="nl-bub nl-bub--g" dir="auto">${esc(q.frage)}</div><div class="nl-bub nl-bub--h nl-bub--offen">I don’t have an answer to that yet.<span>Send to the house</span></div>` : ''}
      <div class="nl-cphf"><span>Name · optional</span><span>Phone, email or Instagram · optional</span></div></div>
      <img class="nl-hdy__g" src="neu/handy.webp" alt="" width="640" height="1122"></div>
    <a class="nl-ghlabel" href="chat/probe.html" target="_blank" rel="noopener">${ni('auge', 'nl-mi')}The chat as a guest sees it</a></div>`;
  const held = `<section class="nl-p nl-held nl-held--start wo-sb"><img class="nl-held__b" src="${sbWeg('b14-1800')}" alt="" decoding="sync">
    <div class="nl-held__i"><div class="nl-mono">${ni('chat', 'nl-mi')}${esc(WO.name('gaeste'))} · The Cat &amp; Gun</div><h1 class="nl-h">Guests</h1>
      <p class="nl-held__s">${esc(satz)}</p>
      <div class="nl-wkst">${nk('Reply now', 'nachricht', 'gold', 'data-gehe="eingang"')}${nk('Try the chat', 'chat', '', 'id="k-probe"')}${nk('Publish', 'senden', '', 'id="s-pub"')}</div>
      </div>${handy}<div class="nl-tabr">${reiter()}</div></section>`;
  const zeile = (wahl, ziel, kopf, text, chip, ico) => `<button class="nl-wz2" type="button" data-gehe="${ziel}"${wahl ? ` data-wahl="${esc(wahl)}"` : ''}><span class="nl-av">${ni(ico)}</span><span class="nl-lzt"><b dir="auto">${kopf}</b><small dir="auto">${text}</small></span><span class="nl-neu">${chip}</span></button>`;
  const ra = offen.slice(0, 3), rq = luecken.slice(0, 3);
  const karte = (foto, ico, gross, klein, rows, leer, knopf, ziel, wahl) => `<div class="nl-p nl-gwk"><div class="nl-gwf"><img src="/the-cat-and-gun/haus/assets/bild/${foto}-800.webp" alt="" width="800" height="1067" loading="lazy" decoding="async"><span class="nl-aufsym">${ni(ico)}</span></div>
    <div class="nl-gwi"><h3>${gross}</h3><p>${klein}</p>${rows || `<p class="nl-leise">${leer}</p>`}<button class="nl-knopf nl-knopf--gold" type="button" data-gehe="${ziel}"${wahl ? ` data-wahl="${wahl}"` : ''}>${knopf}${npf()}</button></div></div>`;
  const warten = `<div class="nl-gw${ra.length !== rq.length ? ' nl-gw--untereinander' : ''}">` +
    karte('b11', 'nachricht', offen.length ? `${zahlWort(offen.length)} ${offen.length === 1 ? 'guest waits' : 'guests wait'} for a reply` : 'No guest waits for a reply',
      'They left a contact on the website. Write the reply, copy it, send it yourself.',
      ra.map(a => zeile(a.id, 'eingang', `<bdi>${esc(a.name || 'Without name')}</bdi>`, esc(a.frage), nlStatus(a), 'person')).join(''),
      'When a guest leaves a phone number, email or Instagram with a question, it is here.', 'Open inbox', 'eingang', '') +
    karte('b20', 'frage', luecken.length ? `${zahlWort(luecken.length)} ${luecken.length === 1 ? 'question' : 'questions'} without answer` : 'Every question has an answer',
      'Answer once. After «Publish» the chat gives it to every guest who asks.',
      rq.map(f => zeile('luecke', 'gefragt', esc(f.frage), esc(f.gruppe || 'Other questions') + (f.beispiel ? ' · example' : ''), 'No answer', 'frage')).join(''),
      'When the chat has no answer and a guest sends the question, it is here.', 'Answer', 'gefragt', 'luecke') + '</div>';
  const weg = `<div class="nl-p nl-gweg"><div class="nl-wline" aria-hidden="true"></div>${WEG_SCHRITTE.map(([c, t, x, f], i) => `<div class="nl-ws"><div class="nl-wsf" style="background-image:url(/the-cat-and-gun/haus/assets/bild/${f}-480.webp)"><span class="nl-wsn">${i + 1}</span></div><span class="nl-wsi">${ni(c)}</span><b>${esc(t)}</b><i>${esc(x)}</i></div>`).join('')}</div>`;
  const W = S.wissen, alle = wissenZeilen();
  const ber = (W.bereiche || []).slice(0, 8);
  const wert = b => { if (b === 'Opening hours' && z) return z.angabe; const ad = fakt('adresse'); if (b === 'Finding us' && ad) return ad.angabe; const n = alle.filter(p => p.bereich === b && !p.aus).length; return mal(n, 'One line', 'lines'); };
  const wissen = `<div class="nl-gwis nl-gwis--${ber.length % 4 === 0 ? 4 : ber.length % 3 === 0 ? 3 : 2}">${ber.map(b => `<button class="nl-p nl-wk2" type="button" data-bereich="${esc(b)}"><span class="nl-wk2b" style="background-image:url(/the-cat-and-gun/haus/assets/bild/${BER_BILD[b] || 'b24'}-480.webp)"></span><span class="nl-ski">${ni(BER_ICO[b] || 'buch')}</span>
      <span class="nl-wk2t"><b>${esc(b)}</b><i>${esc(kurz(wert(b)))}</i></span></button>`).join('')}</div>`;
  const unten = `<div class="nl-gunten">
      <div class="nl-p nl-wve"><div class="nl-mono">${ni('check', 'nl-mi')}Your answers</div><h4>Answers as cards</h4><p>«Change» or «Remove» on a card. «Add an answer» gives the chat an answer before anyone asks.</p><button class="nl-link" type="button" data-gehe="nachgetragen">Your answers ${npf()}</button></div>
      <div class="nl-p nl-wve"><div class="nl-mono">${ni('verlauf', 'nl-mi')}Earlier versions</div><h4>Original state</h4><p>The answers from the website. «Put in the draft» changes nothing until you publish.</p><button class="nl-link" type="button" id="s-verlauf">Earlier versions ${npf()}</button></div>
      <div class="nl-p nl-wve"><div class="nl-mono">${ni('senden', 'nl-mi')}Publish</div><h4>«It is online.»</h4><p>«Publish now» writes the answers file of the chat again. The website pages stay as they are.</p><button class="nl-link" type="button" id="s-vgl">Before, after ${npf()}</button></div></div>`;
  const st = (i, t, s) => `<div class="nl-stitel"><span class="nl-snr">${ni(i)}</span><div><h2>${t}</h2><span class="nl-mono">${s}</span></div></div>`;
  return held + st('nachricht', 'Waiting for you', 'Guests first') + warten + st('schritte', 'How a question travels', 'From the guest to you and back') + weg +
    st('buch', 'What the chat knows', 'It answers only with these lines') + wissen + unten;
}
function verbindeStart() {
  const p = $('#k-probe'); if (p) p.onclick = probe;
  const pub = $('#s-pub'); if (pub) pub.onclick = veroeffentlichenFenster;
  const v = $('#s-verlauf'); if (v) v.onclick = fassungen;
  const g = $('#s-vgl'); if (g) g.onclick = vorherNachher;
  $$('#ansicht .nl-wk2[data-bereich]').forEach(b => b.onclick = () => { S.bereich = b.dataset.bereich; S.such = ''; gehe('wissen'); });
}
/* Themen mit Foto des Hauses (Bilder in jeder Liste, Fehlerbuch 10a); dieselben Themen wie reception.py THEMEN */
const THEMABILD = { 'Opening hours': 'b26', 'Breakfast': 'b01', 'Food & menu': 'b28', 'Coffee & juices': 'b36', 'Beer & bar': 'b07', 'Pool & playground': 'b09',
  'Events': 'b21', 'Finding us': 'b24', 'Contact & booking': 'b08', 'Delivery': 'b33', 'Wifi & payment': 'b16', 'Other questions': 'b14' };
/* je Thema drei Fotos: die ersten Fragen eines Themas zeigen verschiedene Fotos, das erste ist das Foto des Themas */
const THEMABILDER = { 'Opening hours': ['b26', 'b24', 'b18'], 'Breakfast': ['b01', 'b23', 'b16'], 'Food & menu': ['b28', 'b33', 'b23'], 'Coffee & juices': ['b36', 'b26', 'b15'],
  'Beer & bar': ['b07', 'b32', 'b22'], 'Pool & playground': ['b09', 'b25', 'b12'], 'Events': ['b21', 'b02', 'b04'], 'Finding us': ['b24', 'b19', 'b08'],
  'Contact & booking': ['b08', 'b31', 'b14'], 'Delivery': ['b33', 'b28', 'b16'], 'Wifi & payment': ['b16', 'b10', 'b20'], 'Other questions': ['b14', 'b11', 'b20'] };
const themaBilder = (liste, thema) => { const k = {}; return bilderVerteilen(liste.map(x => { const t = thema(x), l = THEMABILDER[t] || THEMABILDER['Other questions'], i = k[t] = (k[t] || 0) + 1; return l.slice(i - 1).concat(l.slice(0, i - 1)); })); };
const IMG = (n, kl) => `<span class="${kl}" aria-hidden="true"><img src="/the-cat-and-gun/haus/assets/bild/${n}-480.webp" alt="" width="480" height="640" loading="lazy" decoding="async"></span>`;
const THEMA_RE = [['Opening hours', /\b(open|opening|close|closing|closed|hours?|time|today|tonight|late)\b/i], ['Breakfast', /breakfast|brekk|brunch|eggs?\b|bagel|pancake/i],
  ['Food & menu', /\b(food|menu|eat|dish|vegan|vegetarian|gluten|allerg|burger|curry|pita|dessert|cake|kids? menu|halal|spicy)/i], ['Coffee & juices', /coffee|latte|espresso|juice|smoothie|matcha|coconut|kombucha|tea\b/i],
  ['Beer & bar', /beer|draught|draft|cocktail|martini|wine|alcohol|\bbar\b|happy hour|byo/i], ['Pool & playground', /pool|billiard|cue|playground|slide|kids|children|family|baby|high chair/i],
  ['Events', /event|market|screening|party|live|music|football|sport|game|watch/i], ['Finding us', /where|address|location|direction|map|parking|park\b|motor|scooter|tricycle|walk/i],
  ['Contact & booking', /phone|call|number|book|reserv|table for|whatsapp|contact|email/i], ['Delivery', /deliver|takeaway|take away|travelgo|grab|foodpanda|order/i],
  ['Wifi & payment', /wi-?fi|internet|password|card|cash|gcash|pay|payment|laptop|work/i]];
const themaVon = t => (THEMA_RE.find(([, re]) => re.test(t || '')) || ['Other questions'])[0];
/* Angaben im Wissen: je Zeile ein passendes Foto, sonst das Foto des Bereichs */
const ZEILENBILD = { zeiten: 'b26', 'brekky-zeit': 'b01', adresse: 'b08', telefon: 'b31', instagram: 'b21', 'brekky-combo': 'b16', eier: 'b01', 'karte-breakfast': 'b23', kueche: 'b28',
  karte: 'b28', 'karte-bagels': 'b16', 'karte-bowls': 'b20', 'karte-pita': 'b33', 'karte-burger': 'b23', 'karte-pubgrub': 'b28', 'karte-curry': 'b28', 'karte-barbites': 'b33',
  'karte-sides': 'b23', 'karte-kids': 'b25', 'karte-desserts': 'b26', 'karte-cookies': 'b26', kaffee: 'b26', 'karte-coffee': 'b26', saefte: 'b36', 'karte-juices': 'b20', kokos: 'b14',
  'karte-kombucha': 'b14', fass: 'b07', 'karte-sib': 'b27', 'karte-engkanto': 'b33', bar: 'b10', 'karte-cocktails': 'b22', 'karte-wine': 'b31', pool: 'b09', spielplatz: 'b12',
  familie: 'b34', termine: 'b21', markt: 'b19', screening: 'b24', jubilaeum: 'b21', haus: 'b24', google: 'b08', lieferung: 'b33' };
const BER_BILD = { 'Opening hours': 'b26', 'Finding us': 'b08', 'Breakfast': 'b23', 'Food': 'b28', 'Drinks': 'b22', 'Pool & playground': 'b25', 'Events': 'b21', 'The Cat & Gun': 'b24', 'Your answers': 'b10' };
const zeilenBild = p => (p.typ === 'fakt' && ZEILENBILD[p.z.fid]) || BER_BILD[p.bereich] || 'b24';
/* Antworten lesbar setzen: Zeilen mit «- » werden eine Liste, der Rest Absätze (wie der Chat auf der Website, chat/chat.js) */
function antwortHTML(t) {
  const z = String(t || '').split('\n'); let h = '', liste = [];
  const fertig = () => { if (liste.length) { h += '<ul>' + liste.map(x => { const m = x.match(/^([^:]{2,60}):\s*(.+)$/); return '<li>' + (m ? `<b>${esc(m[1])}</b> ${esc(m[2])}` : esc(x)) + '</li>'; }).join('') + '</ul>'; liste = []; } };
  z.forEach(x => { const m = x.match(/^\s*[-•]\s+(.*)$/); if (m) liste.push(m[1]); else { fertig(); if (x.trim()) h += `<p>${esc(x)}</p>`; } }); fertig(); return h;
}
const kurz = t => String(t || '').replace(/\n-\s*/g, ' · ').replace(/\s+/g, ' ');
function frageKarte(f, i, liste) {
  const fb = liste ? themaBilder(liste, x => x.gruppe)[i] : (THEMABILD[f.gruppe] || 'b14');
  const offen = !f.erledigt, d = new Date(f.zeit);
  const wann = isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `<button class="re-a re-q${offen ? ' re-q--offen' : ''}" type="button" data-gehe="gefragt"${offen ? ' data-wahl="luecke"' : ''}>
    <span class="re-a__bild" aria-hidden="true"><img src="/the-cat-and-gun/haus/assets/bild/${fb}-480.webp" alt="" width="480" height="640" decoding="async"></span>
    <span class="re-a__n"><span class="re-a__k">${f.beispiel ? '<i class="re-q__sp">Example</i>' : ''}${esc(f.gruppe || 'Other questions')}</span><b dir="auto">${esc(f.frage)}</b><small dir="auto">${offen ? 'The chat had no answer. Write it once, then the chat gives it to every guest.' : 'Answered or marked as done.'}</small></span>
    <span class="re-a__st">${offen ? 'No answer' : 'Done'}<small>${esc(wann)}</small></span></button>`;
}
/* ---------- Inbox ---------- */
function glieder(l) { return l.filter(Boolean).map(x => `<span class="re-gl">${x}</span>`).join(''); }
function karteAnfrage(a, i = 0) {   // Karte im Posteingang wie «env» im Entwurf: Zeichen, Name, Frage, Stand
  const st = nlStatus(a);
  return `<button class="nl-p nl-env re-a${a.status === 'neu' ? ' neu' : ''}${a.status === 'erledigt' ? ' erledigt' : ''}${S.wahl === a.id && S.ansicht === 'eingang' ? ' aktiv' : ''}" style="--i:${i}" type="button" data-gehe="eingang" data-wahl="${esc(a.id)}">
    <span class="nl-av nl-av--gr">${ni('person')}</span>
    <span class="nl-lzt"><span class="nl-env__k">${glieder([esc(tagVon(a.zeit)), esc(uhr(a.zeit)), esc(themaVon(a.frage)), a.beispiel ? 'Example' : ''])}</span><b><bdi>${esc(a.name || 'Without name')}</bdi></b><small dir="auto">${esc(a.frage)}</small></span>
    <span class="nl-neu">${st}</span></button>`;
}
function tagVon(iso) {   // Today, Yesterday, weekday, else Earlier
  const d = new Date(iso), h = new Date(); h.setHours(0, 0, 0, 0);
  const t = Math.round((h - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5);
  return t <= 0 ? 'Today' : t === 1 ? 'Yesterday' : t < 7 ? d.toLocaleDateString('en-GB', { weekday: 'long' }) : 'Earlier';
}
function eingang() {
  const alle = S.anfragen, f = S.filter;
  const l = f === 'neu' ? alle.filter(a => a.status === 'neu') : f === 'offen' ? alle.filter(a => a.status !== 'erledigt') : f === 'erledigt' ? alle.filter(a => a.status === 'erledigt') : alle;
  if ((!S.wahl || !l.some(a => a.id === S.wahl)) && l.length) S.wahl = (l.find(a => a.status === 'neu') || l[0]).id;
  const a = alle.find(x => x.id === S.wahl);
  const zahl = k => k === 'neu' ? alle.filter(a => a.status === 'neu').length : k === 'offen' ? alle.filter(a => a.status !== 'erledigt').length : k === 'erledigt' ? alle.filter(a => a.status === 'erledigt').length : alle.length;
  return kopf('Inbox', '', 'Guests who sent a question from the website and left a contact. Opening one marks it as read. Nothing is sent from here.') +
    (alle.length ? `<div class="re-eingang">
        <div class="nl-filter re-filter" role="group" aria-label="Filter">${[['alle', 'All'], ['neu', 'New'], ['offen', 'Open'], ['erledigt', 'Done']].map(([k, t]) => `<button class="nl-tab${f === k ? ' nl-an' : ''}" type="button" data-filter="${k}" aria-pressed="${f === k}">${t}<i>${zahl(k)}</i></button>`).join('')}</div>
        <div class="nl-envs re-liste">${l.map((x, n) => karteAnfrage(x, n)).join('') || `<div class="nl-p nl-leer"><img src="neu/et-weiss.svg" alt="" width="40" height="40"><b>Nothing here.</b><p>No inquiry has this state.</p></div>`}</div>
        <div class="re-detail" id="detail">${a && l.includes(a) ? detail(a) : ''}</div></div>`
      : `<div class="nl-p nl-leer re-leer"><img src="neu/et-weiss.svg" alt="" width="40" height="40"><b>The inbox is empty.</b><p>When a guest sends a question from the chat with a phone number, email or Instagram, it is here.</p></div>`);
}
function kontaktText(k) { return `<span class="re-mail">${esc(String(k || '').trim())}</span>`; }   // kein mailto, kein tel: (öffnet sonst ein Programm), zum Kopieren
function hausFuss() {   // Fuss der Antwort: Adresse und Telefon aus dem belegten Grundwissen
  const W = S.wissen || {}, z = fid => { for (const b of W.steckbrief || []) for (const g of b.gruppen) for (const x of g.zeilen) if (x.fid === fid) return x; return null; };
  const ad = z('adresse'), tel = (W.kontakt || {}).telefon;
  return ['The Cat & Gun', ad ? ad.angabe : '', tel || ''].filter(Boolean);
}
/* Weg der Seite, von der eine Frage kommt: bricht nach jedem «/» um, ein langer Teil auch mitten im Wort (PRUEFUNG.md neunte Runde, Punkt 37 an «Page») */
function weg(s) { return `<span class="re-weg">${esc(s).replace(/\//g, '/<wbr>')}</span>`; }
function nachgetragenZu(a) { return (S.nachgetragen || []).find(x => x.quelle === a.frage_id); }
/* Geöffnete Anfrage wie «gsp» im Entwurf: links die Frage als Blase mit Kontakt, Zeit und Seite, rechts das Blatt für die Antwort */
function detail(a) {
  const ant = a.antwort || { text: '', fassung: 0 }, mitKontakt = !!a.kontakt, nt = nachgetragenZu(a);
  const chip = (ico, k, v) => `<span class="nl-mchip">${ni(ico)}<i>${k}</i><span dir="auto">${v}</span></span>`;
  return `<section class="nl-p nl-gsp re-auf" style="--i:0">
    <div class="nl-gspk"><div><div class="nl-mono">${ni('nachricht', 'nl-mi')}<span class="nl-glr">${glieder(['Inquiry', esc(themaVon(a.frage)), a.status === 'erledigt' ? 'done' : 'opened, marked as read', a.beispiel ? 'example' : ''])}</span></div><h2><bdi>${esc(a.name || 'Without name')}</bdi></h2></div>
      <span class="nl-wr2">${nk(a.status === 'erledigt' ? 'Open again' : 'Done', a.status === 'erledigt' ? 'zurueck' : 'check', a.status === 'erledigt' ? '' : 'gold', `data-akt="${a.status === 'erledigt' ? 'offen' : 'erledigt'}"`)}${nk('Delete for good', 'eimer', '', 'data-akt="weg" aria-label="Delete inquiry"')}</span></div>
    <div class="nl-gspg">
      <div class="nl-links">
        <div class="nl-gbub"><span class="nl-av nl-av--gr">${ni('person')}</span><blockquote class="nl-gbt" dir="auto"><span>${esc(a.frage)}</span></blockquote></div>
        <div class="nl-mchips">${chip('person', 'Contact', a.kontakt ? kontaktText(a.kontakt) + (a.beispiel ? ' <small>(example)</small>' : '') : 'none')}${chip('uhr', 'Sent', esc(zeit(a.zeit)))}${chip('web', 'From page', a.seite ? weg(a.seite) : 'not known')}</div>
        <div class="nl-alle re-notiz${nt ? ' re-notiz--da' : ''}"><div class="nl-mono">${ni('chat', 'nl-mi')}For every guest${nt && S.ue.entwurf ? ' · in the draft until «Publish»' : ''}</div>
          ${nt ? `<b dir="auto">${esc(nt.frage)}</b><p dir="auto">${esc(kurz(nt.antwort))}</p><button class="nl-link" type="button" data-akt="nt-aendern">Change the answer ${npf()}</button>`
            : `<b>The chat could not answer this.</b><p>Write the answer once. After «Publish», the chat gives it to every guest who asks.</p><button class="nl-knopf nl-knopf--gold" type="button" data-akt="nachtragen">Answer for every guest${npf()}</button>`}</div>
        <div class="nl-abf">${ni('uhr', 'nl-mi')}Inquiries are kept for twelve months.</div>
      </div>
      <div class="nl-pfeilm" aria-hidden="true">${ni('pfeilr')}</div>
      <div class="nl-rechts">${mitKontakt ? `<div class="nl-blatt3 brief brief--bearb">${MARKE}
          <dl class="nl-an"><div><dt>To</dt><dd><bdi>${esc(a.name || 'Guest')}</bdi> <small>${esc(a.kontakt || '')}</small></dd></div></dl>
          <div class="nl-schreib"><textarea id="e-text" dir="auto" spellcheck="true" maxlength="5000" placeholder="Write the reply here." aria-label="Personal reply">${esc(ant.text || '')}</textarea></div>
          <div class="nl-blf">${nk('Save reply', 'speichern', '', 'data-akt="sichern"')}${nk('Copy text', 'kopie', '', 'data-akt="kopieren"')}</div>
          <p class="nl-estand re-hinweis" id="e-stand">${ant.geaendert ? 'Saved ' + esc(zeit(ant.geaendert)) + '.' : 'Not saved yet.'} Ctrl+S saves.</p></div>
        <div class="nl-kanal"><span class="nl-mono">Send it yourself</span><span>${ni('tel')}Phone</span><span>${ni('chat')}Message</span><span>${ni('insta')}Instagram</span><p>Copy the text and send it from your phone. Nothing is sent from here, and no mail program opens.</p></div>`
        : `<div class="nl-ohne re-ohne"><div class="nl-mono">${ni('person', 'nl-mi')}Only for this guest</div><p>The guest left no contact, so there is no personal reply. The answer for every guest reaches them in the chat.</p></div>`}</div>
    </div></section>`;
}
function verbindeEingang() {
  $$('.re-filter [data-filter]').forEach(b => b.onclick = () => { S.filter = b.dataset.filter; zeichne(); });
  const a = S.anfragen.find(x => x.id === S.wahl);
  if (!a) return;
  if (a.status === 'neu') {   // geöffnet heisst gelesen
    api('anfrage', { id: a.id, status: 'gelesen' }).then(d => { a.status = 'gelesen'; S.ue = { ...S.ue, ...d }; rand(); const zn = $('.re-filter [data-filter="neu"] i'); if (zn) zn.textContent = S.anfragen.filter(x => x.status === 'neu').length; const k = $(`.re-a[data-wahl="${CSS.escape(a.id)}"]`); if (k) { const c = k.className; k.outerHTML = karteAnfrage(a); const n = $(`.re-a[data-wahl="${CSS.escape(a.id)}"]`); if (n && /sw-da/.test(c)) n.classList.add('sw-da'); } $$('#ansicht [data-gehe]').forEach(b => b.onclick = () => gehe(b.dataset.gehe, b.dataset.wahl || '')); }).catch(() => {});
  }
  $$('#detail [data-akt]').forEach(b => b.onclick = () => aktion(a, b.dataset.akt));
  const t = $('#e-text');
  if (t) { const hoch = () => { t.style.height = 'auto'; t.style.height = Math.max(t.scrollHeight + 4, 220) + 'px'; }; t.oninput = () => { hoch(); const s = $('#e-stand'); if (s) s.textContent = 'Not saved. Press «Save reply» or Ctrl+S.'; }; hoch(); }
}
/* Ruhig tauschen (Vorlage 16.10.2026): Scrollstand bleibt, die Fläche schrumpft nicht unter die alte Höhe, nichts blendet neu ein. */
function ruhigTauschen(el, html) {
  const y = scrollY, h = el.offsetHeight;
  el.style.minHeight = h + 'px';
  el.innerHTML = html;
  $$('.re-auf', el).forEach(x => x.classList.add('still'));
  if (scrollY !== y) scrollTo({ top: y, behavior: 'instant' });
  requestAnimationFrame(() => { if (scrollY !== y) scrollTo({ top: y, behavior: 'instant' }); setTimeout(() => { el.style.minHeight = ''; }, 400); });
}
function neuDetail(a) { ruhigTauschen($('#detail'), detail(a)); verbindeEingang(); }
async function antwortSichern(a, still = false) {
  const t = $('#e-text'); if (!t) return true;
  const alt = (a.antwort || {}).text || '';
  if (t.value === alt) { if (!still) quit('Nothing changed, nothing saved.', '', [], false, 3000); return true; }
  try { await api('anfrage', { id: a.id, antwort_text: t.value }); a.antwort = { ...(a.antwort || {}), text: t.value, geaendert: new Date().toISOString() };
    const s = $('#e-stand'); if (s) s.textContent = 'Saved ' + zeit(a.antwort.geaendert) + '.';
    quit('Saved', 'Your reply to this guest is saved.', [], false, 3500); return true;
  } catch (e) { fehler(e); return false; }
}
async function aktion(a, akt) {
  try {
    if (akt === 'nachtragen') return nachtragenFenster({ frage: a.frage, antwort: '', quelle: a.frage_id || '' });
    if (akt === 'nt-aendern') return nachtragenFenster(nachgetragenZu(a));
    if (akt === 'sichern') return antwortSichern(a);
    if (akt === 'kopieren') {
      if (!(await antwortSichern(a, true))) return;
      const text = $('#e-text') ? $('#e-text').value : '';
      if (!text.trim()) return quit('Nothing to copy yet', 'Write your reply first.', [], true, 4000);
      try { await navigator.clipboard.writeText(text); } catch (e) { return quit('Not copied', 'The browser did not allow it. Select the text and copy it by hand.', [], true); }
      return quit('Copied', 'Your reply is on the clipboard.', [], false, 5000);
    }
    if (akt === 'erledigt' || akt === 'offen') {
      if (!(await antwortSichern(a, true))) return;
      const d = await api('anfrage', { id: a.id, status: akt === 'erledigt' ? 'erledigt' : 'gelesen' });
      a.status = akt === 'erledigt' ? 'erledigt' : 'gelesen'; S.ue = { ...S.ue, ...d }; rand(); leiste(); zeichne();
      return quit(akt === 'erledigt' ? 'Done' : 'Open again', '', [], false, 3000);
    }
    if (akt === 'weg') return fenster(`<h2>Delete this <em>inquiry?</em></h2><p>The inquiry ${a.name ? 'from ' + esc(a.name) + ' ' : ''}with its contact and your reply is deleted for good. That is right when the guest asks for it or everything is done.</p>
      <label class="re-beide"><input type="checkbox" id="f-beide" checked> <span>Also delete the question under «Questions»</span></label>
      <div class="fenster__kn"><button class="link" type="button" data-zu>Cancel</button><button class="kn kn--gefahr" type="button" id="f-los">Delete for good<i>${SYM.korb}</i></button></div>`, true, async () => {
        const beide = !!($('#f-beide') && $('#f-beide').checked);
        try { const d = await api('weg', { id: a.id, beide }); fensterZu(); S.anfragen = S.anfragen.filter(x => x.id !== a.id); if (beide) S.fragen = null; S.wahl = ''; S.ue = { ...S.ue, ...d }; rand(); leiste(); zeichne(); quit('Deleted', '', [], false, 3000); } catch (e) { fehler(e); }
      });
  } catch (e) { fehler(e); }
}

/* ---------- Questions ---------- */
function gefragt() {
  const alle = S.fragen, luecken = alle.filter(f => !f.erledigt);
  const liste = S.wahl === 'luecke' ? luecken : alle;
  const gruppen = {};
  liste.forEach(f => { (gruppen[f.gruppe] = gruppen[f.gruppe] || []).push(f); });
  const reihe = Object.keys(gruppen).sort((x, y) => gruppen[y].filter(f => !f.erledigt).length - gruppen[x].filter(f => !f.erledigt).length || gruppen[y].length - gruppen[x].length);
  const folge = [].concat(...reihe.map(g => gruppen[g])), fbild = {};
  themaBilder(folge, f => f.gruppe).forEach((b, i) => { fbild[folge[i].id] = b; });
  const frage = f => { const nt = (S.nachgetragen || []).find(x => x.quelle === f.id);
    return `<div class="re-f${!f.erledigt ? ' luecke' : ' erledigt'}" data-id="${esc(f.id)}">${IMG(fbild[f.id] || THEMABILD[f.gruppe] || 'b14', 're-f__bild')}
      <div class="re-f__k"><span class="mono">${esc(zeit(f.zeit))}${f.anfrage ? ' · with contact, in the inbox' : ''}${f.beispiel ? ' · example' : ''}</span>
        <em>${f.erledigt ? (nt ? 'answered' : 'done') : 'no answer'}</em></div>
      <p class="re-f__q" dir="auto">${esc(f.frage)}</p>
      ${nt ? `<details class="re-f__antw"><summary>Your answer</summary><div class="re-chat-antwort" dir="auto"><span class="re-chat-antwort__k mono">${ZEICHEN}The chat says</span>${antwortHTML(nt.antwort)}</div></details>` : ''}
      ${!f.erledigt ? `<div class="re-f__kn"><button class="kn kn--klein kn--gold" type="button" data-akt="nachtragen">Answer for every guest<i>${PF}</i></button><button class="link" type="button" data-akt="erledigt">Mark as done without answer</button></div>` : `<div class="re-f__kn"><button class="link" type="button" data-akt="offen">Mark as open</button></div>`}
    </div>`; };
  return kopf('Questions', 'What guests <em>want to know.</em>',
    `Every question guests sent to you from the chat, by topic. ${luecken.length ? `<b>${mal(luecken.length, 'One question has', 'questions have')} no answer yet.</b> Write the answer once; after «Publish» the chat gives it to every guest.` : 'Every question has an answer.'}`) +
    `<div class="re-zahlen platte"><div><b>${alle.length}</b><span>questions in all</span></div><div><b>${luecken.length}</b><span>without answer</span></div><div><b>${(S.nachgetragen || []).length}</b><span>answers by you</span></div><div><b>${alle.filter(f => f.anfrage).length}</b><span>with contact</span></div></div>
    <div class="filter"><div class="wahl2" role="group" aria-label="Filter"><button type="button" data-gehe="gefragt" aria-pressed="${S.wahl !== 'luecke'}">All questions</button><button type="button" data-gehe="gefragt" data-wahl="luecke" aria-pressed="${S.wahl === 'luecke'}">Without answer${luecken.length ? ' · ' + luecken.length : ''}</button></div></div>
    ${reihe.length ? reihe.map(g => `<details class="gr re-gr" open><summary><b>${esc(g)}</b><small>${mal(gruppen[g].length, 'one question', 'questions')}${gruppen[g].filter(f => !f.erledigt).length ? ' · ' + gruppen[g].filter(f => !f.erledigt).length + ' without answer' : ''}</small></summary>${gruppen[g].map(frage).join('')}</details>`).join('')
      : `<div class="re-leer platte">${ZEICHEN}<b>${S.wahl === 'luecke' ? 'No gaps.' : 'No questions yet.'}</b><p>${S.wahl === 'luecke' ? 'Every question has an answer.' : 'When the chat has no answer and a guest sends the question, it is here.'}</p></div>`}`;
}
function verbindeGefragt() {
  $$('.re-f [data-akt]').forEach(b => b.onclick = async () => {
    const f = S.fragen.find(x => x.id === b.closest('.re-f').dataset.id);
    if (b.dataset.akt === 'nachtragen') return nachtragenFenster({ frage: f.frage, antwort: '', quelle: f.id });
    try { const d = await api('frage', { id: f.id, erledigt: b.dataset.akt === 'erledigt' }); f.erledigt = b.dataset.akt === 'erledigt'; S.ue = { ...S.ue, ...d }; rand(); leiste(); zeichne();
      quit(f.erledigt ? 'Marked as done' : 'Open again', f.erledigt ? 'The question stays in the list, without the mark.' : '', [], false, 3500); } catch (e) { fehler(e); }
  });
}
/* Antwort für alle Gäste (E08): in den Entwurf; nach «Publish» antwortet der Chat damit. Mit «Other ways guests ask», «Valid until», «Hide». */
function bisFeld(id, wert) { return `<label class="feld"><span>Valid until <small>empty = no end</small></span><input type="date" id="${id}" value="${esc(wert || '')}" min="2026-01-01" max="2099-12-31"></label>`; }
function woerterFeld(id, l) { return `<label class="feld"><span>Other ways guests ask <small>words, with commas</small></span><input id="${id}" value="${esc((l || []).join(', '))}" maxlength="600" placeholder="e.g. toilet, restroom, bathroom"></label>`; }
function nachtragenFenster(x) {
  x = x || { frage: '', antwort: '' };
  fenster(`<h2>${x.nid ? 'Change the <em>answer.</em>' : 'Answer for <em>every guest.</em>'}</h2><p>Write it the way you would tell a guest. It goes into the draft; after «Publish» the chat gives it to everyone who asks.</p>
    <label class="feld"><span>Question</span><textarea id="f-frage" rows="1" maxlength="300">${esc(x.frage)}</textarea></label>
    <label class="feld"><span>Answer of the house</span><textarea id="f-antwort" rows="5" maxlength="5000" placeholder="In full sentences, as you would say it to a guest on the phone.">${esc(x.antwort)}</textarea></label>
    <div class="wi-fz">${woerterFeld('f-woerter', x.woerter)}${bisFeld('f-bis', x.bis)}</div>
    ${x.nid ? `<label class="schalter-z"><input type="checkbox" id="f-aus"${x.aus ? ' checked' : ''}> <span>Hidden: the chat does not use this answer</span></label>` : ''}
    <div class="fenster__kn sb-kn">${x.nid ? `<button class="link rot" type="button" id="f-weg">Remove</button><span></span>` : ''}<button class="link" type="button" data-zu>Cancel</button><button class="kn kn--gold" type="button" id="f-los">${x.nid ? 'Save' : 'Add to the draft'}<i>${SYM.haken}</i></button></div>`, true, async () => {
    const knopf = $('#f-los'); if (knopf.disabled) return; knopf.disabled = true;
    try {
      const d = await api('nachtragen', { nid: x.nid, frage: $('#f-frage').value, antwort: $('#f-antwort').value, woerter: $('#f-woerter').value, bis: $('#f-bis').value || null, quelle: x.quelle || '', ...($('#f-aus') ? { aus: $('#f-aus').checked } : {}) });
      fensterZu(); S.ue = { ...S.ue, ...d }; rand(); leiste(); await zeichneHalten();
      quit('Saved in the draft', 'Press «Publish» so guests see it.', [['Publish', veroeffentlichenFenster]], false, 7000);
    } catch (e) { fehler(e); if (document.body.contains(knopf)) knopf.disabled = false; }
  });
  const w = $('#f-weg'); if (w) w.onclick = () => entfernen('Remove this answer?', 'The chat no longer knows it after «Publish».', async () => { const d = await api('nachtragen_weg', { nid: x.nid }); S.ue = { ...S.ue, ...d }; });
  const fr = $('#f-frage'), wachse = () => { fr.style.height = 'auto'; fr.style.height = (fr.scrollHeight + 2) + 'px'; };
  if (fr) { wachse(); fr.addEventListener('input', wachse); fr.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); }); }
  setTimeout(() => { if (fr) wachse(); const t = $(x.frage ? '#f-antwort' : '#f-frage'); if (t) t.focus(); }, 60);
}
function entfernen(titel, satz, tun) {
  fenster(`<h2>${esc(titel)}</h2><p>${esc(satz)}</p><div class="fenster__kn"><button class="link" type="button" data-zu>Cancel</button><button class="kn kn--gefahr" type="button" id="f-los">Remove<i>${SYM.korb}</i></button></div>`, true, async () => {
    try { await tun(); fensterZu(); rand(); leiste(); await zeichneHalten(); quit('Removed from the draft', 'Press «Publish» so the chat forgets it too.', [], false, 5000); } catch (e) { fehler(e); }
  });
}

/* ---------- Your answers (Vom Team nachgetragen) ---------- */
const zusammen = t => t.replace(/ (\S+)$/, ' $1');
const paar = t => t.replace(/ (\S+) (\S+)$/, (m, a, b) => (a.length + b.length < 14 ? ' ' + a + ' ' + b : m));
function nachgetragenS() {
  const l = S.nachgetragen;
  return kopf('Your answers', 'What the chat <em>knows from you.</em>',
    'Answers you wrote to questions the chat could not answer. After «Publish» the chat uses them like everything else it knows. Change or remove them here when something changes.',
    `<button class="kn kn--linie" type="button" id="n-neu">Add an answer<i>${PF}</i></button>`) +
    (l.length ? `<div class="re-nliste">${((rl, nb) => rl.map((x, i) => {
      return `<article class="re-n${x.aus ? ' aus' : ''}" data-nid="${esc(x.nid)}">${IMG(nb[i], 're-n__bild')}
        <header class="re-n__kopf"><span>Added ${esc(datum(x.zeit))}${x.bis ? ' · valid until ' + esc(datum(x.bis)) : ''}${x.aus ? ' · hidden' : ''}</span></header>
        <span class="re-n__l">Question of guests</span>
        <h3 class="re-n__q" dir="auto">${zusammen(esc(x.frage))}</h3>
        <div class="re-n__zier" aria-hidden="true"><i></i>${ZEICHEN}<i></i></div>
        <span class="re-n__l">Answer of the house</span>
        <p class="re-n__a" dir="auto">${esc(x.antwort).replace(/\n/g, '<br>')}</p>
        <footer class="re-n__kn"><button class="re-n__k" type="button" data-akt="aendern"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.5 3.5l2 2L6 12H4v-2z"/></svg>Change</button><button class="re-n__k re-n__k--weg" type="button" data-akt="weg"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5"/></svg>Remove</button></footer>
      </article>`; }).join(''))(l.slice().reverse(), themaBilder(l.slice().reverse(), x => themaVon(x.frage)))}</div>`
      /* R20: nie leer, Beispiele stehen da. Erfunden ist nur die Frage, die Antwort bleibt die Leerstelle des Hauses */
      : `<div class="re-nliste re-nliste--bsp">${['Is there wifi?', 'Can we bring our dog?', 'Is there parking for scooters?'].map(q => `<article class="re-n re-n--beispiel">${IMG(THEMABILD[themaVon(q)] || 'b14', 're-n__bild')}
        <header class="re-n__kopf"><span>Example of an answer</span></header>
        <span class="re-n__l">Question of guests</span>
        <h3 class="re-n__q" dir="auto">${zusammen(esc(q))}</h3>
        <div class="re-n__zier" aria-hidden="true"><i></i>${ZEICHEN}<i></i></div>
        <span class="re-n__l">Answer of the house</span>
        <p class="re-n__a">[Your answer goes here, as you would say it to a guest on the phone.]</p>
      </article>`).join('')}</div><p class="leise re-nliste__bsp">Examples. The chat does not know them. When the chat has no answer to a question, it is under «Questions» with the button «Answer for every guest». Then it is here as a card.</p>`);
}
function verbindeNachgetragen() {
  $('#n-neu').onclick = () => nachtragenFenster({ frage: '', antwort: '' });
  $$('.re-n [data-akt]').forEach(b => b.onclick = () => {
    const x = S.nachgetragen.find(y => y.nid === b.closest('.re-n').dataset.nid);
    if (b.dataset.akt === 'aendern') return nachtragenFenster(x);
    entfernen('Remove this answer?', 'The chat no longer knows it after «Publish». When a guest asks again, the question comes back to you.', async () => { const d = await api('nachtragen_weg', { nid: x.nid }); S.ue = { ...S.ue, ...d }; });
  });
}

/* ---------- What the chat knows (Das weiss der Chat) ---------- */
const W_ART = { neu: 'Added', geaendert: 'Changed', aus: 'Hidden', an: 'Shown again', zurueck: 'Back as on the website', entfernt: 'Removed', nachgetragen: 'Answer added' };
const LUPE = '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg>';
async function ladeWissen(neu = false) {
  if (!S.wissen || neu) S.wissen = await api('wissen');
  if (!S.fragen) { const d = await api('fragen'); S.fragen = d.fragen; S.nachgetragen = d.nachgetragen; }
}
function wissenZeilen() {   // alle Zeilen flach, für Suche, Zähler und Fenster
  const W = S.wissen, l = []; if (!W) return l; const heute = W.heute;
  (W.steckbrief || []).forEach(b => b.gruppen.forEach(g => g.zeilen.forEach(z => {
    const t = W.team[z.fid] || null, bis = t && t.bis || '';
    l.push({ id: 'f:' + z.fid, typ: 'fakt', z, bereich: b.bereich, gruppe: g.gruppe, was: z.was, angabe: t && t.angabe ? t.angabe : z.angabe, orig: z.angabe,
      geaendert: !!(t && t.angabe), aus: !!(t && t.aus) || (!!bis && bis < heute), abgelaufen: !!bis && bis < heute, bis, zeit: t ? t.zeit : '', quelle: z.quelle });
  })));
  W.eintraege.forEach(e => l.push({ id: 'e:' + e.wid, typ: 'eintrag', e, bereich: e.bereich, gruppe: 'Added by you', was: e.titel, angabe: e.text, bis: e.bis || '',
    quelle: 'Added ' + datum(e.geaendert || e.zeit), aus: !!e.aus || e.abgelaufen, abgelaufen: e.abgelaufen, zeit: e.geaendert || e.zeit, lang: true }));
  (W.nachgetragen || []).forEach(x => l.push({ id: 'n:' + x.nid, typ: 'antwort', x, bereich: 'Your answers', gruppe: 'Answers to guests', was: x.frage, angabe: x.antwort, bis: x.bis || '',
    quelle: 'Added ' + datum(x.zeit), aus: !!x.aus || (!!x.bis && x.bis < heute), abgelaufen: !!x.bis && x.bis < heute, zeit: x.zeit, lang: true }));
  return l;
}
function wissenS() {
  const W = S.wissen, alle = wissenZeilen(), q = S.such.trim().toLowerCase();
  const passt = p => !q || (p.was + ' ' + p.angabe + ' ' + p.gruppe + ' ' + p.bereich).toLowerCase().includes(q);
  const liste = alle.filter(passt);
  const eigen = alle.filter(p => (p.typ === 'fakt' && (p.geaendert || p.aus || p.bis)) || p.typ !== 'fakt').length;
  const zeile = p => {
    const marke = p.aus ? (p.abgelaufen ? 'expired' : 'hidden') : p.bis ? 'until ' + datum(p.bis) : p.geaendert ? 'changed' : '';
    return `<button class="sb-z${p.aus ? ' aus' : ''}${p.geaendert || p.typ !== 'fakt' ? ' team' : ''}${p.lang || /\n/.test(p.angabe) ? ' lang' : ''}" type="button" data-id="${esc(p.id)}">${p.typ === 'eintrag' && p.e.bild ? `<span class="sb-z__bild" aria-hidden="true"><img src="api/bild?id=${esc(p.e.bild)}" alt="" width="480" height="360" loading="lazy" decoding="async"></span>` : IMG(zeilenBild(p), 'sb-z__bild')}
      <span class="sb-z__was" dir="auto">${esc(p.was)}</span><span class="sb-z__angabe" dir="auto">${esc(kurz(p.angabe))}${p.quelle ? `<small>${esc(p.quelle)}</small>` : ''}</span>
      ${marke ? `<em>${esc(marke)}</em>` : ''}</button>`;
  };
  const tafel = b => {
    const l = liste.filter(p => p.bereich === b);
    if (!l.length && (q || b !== 'Your answers')) return '';
    const gruppen = []; l.forEach(p => { let g = gruppen.find(x => x.n === p.gruppe); if (!g) gruppen.push(g = { n: p.gruppe, l: [] }); g.l.push(p); });
    return `<section class="platte sb-t" data-bereich="${esc(b)}">
      <header class="sb-t__k">${BER_BILD[b] ? `<span class="sb-t__bild" aria-hidden="true"><img src="/the-cat-and-gun/haus/assets/bild/${BER_BILD[b]}-480.webp" alt="" width="480" height="640" loading="lazy" decoding="async"></span>` : ''}
        <h2>${paar(esc(b))}</h2><small>${l.length ? mal(l.length, 'one line', 'lines') : 'empty so far'}</small>
        <button class="rund sb-t__neu" type="button" data-neu="${esc(b)}" data-tip="Add" aria-label="Add to ${esc(b)}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg></button></header>
      ${gruppen.length ? gruppen.map(g => `<div class="sb-g"><p class="sb-g__n mono">${esc(g.n)}</p>${g.l.map(zeile).join('')}</div>`).join('') : `<p class="wi__leer">No answer by you yet. Questions without answer are under «Questions».</p>`}
    </section>`;
  };
  const verlauf = (W.verlauf || []).slice(0, 6);
  const bereiche = (W.bereiche || []).concat(['Your answers']);
  return kopf('What the chat knows', 'Everything the chat <em>knows about the house.</em>',
    `The chat only answers with what is here: what the website says, and what you added. Tap a line to change it, hide it or give it an end date. Changes wait in the draft until «Publish»; the website itself stays as it is.${eigen ? ` <b>${mal(eigen, 'One line is', 'lines are')} yours or changed by you.</b>` : ''}`,
    `<button class="kn kn--gold glanz-kn" type="button" id="w-neu">Add a line<i>${PF}</i></button><button class="kn kn--linie" type="button" id="w-probe-auf">Test a question<i>${PF}</i></button>`, 'b24-1200') +
    `<div class="wi-oben">
      <section class="platte wi-neu" id="w-ein">
        <span class="mono">Something new</span>
        <h2>What should the chat <em>also know?</em></h2>
        <p>A new event, a holiday closing, a special. Write it in, pick the area, add a photo if you like. It goes into the draft.</p>
        <div class="wi-neu__feld" id="w-feld">
          <input class="wi-neu__titel" id="w-titel" maxlength="200" placeholder="Title, the way a guest would ask: Sunday market in December?" value="${esc(S.neuTitel || '')}">
          <textarea id="w-text" rows="3" maxlength="5000" placeholder="What the chat should say, with date, time and price if known.">${esc(S.neuText || '')}</textarea>
          <div class="wi-neu__dateien" id="w-dateien">${dateiS()}</div>
          <div class="wi-neu__leiste">
            <button class="rund" type="button" id="w-bild" data-tip="Add a photo" aria-label="Add a photo">${FOTO}</button>
            <input type="file" id="w-datei-bild" accept="image/*" hidden>
            <select class="sel wi-neu__ber" id="w-ber" aria-label="Area">${(W.bereiche || []).map(b => `<option value="${esc(b)}"${(S.neuBer || 'Events') === b ? ' selected' : ''}>Area: ${esc(b)}</option>`).join('')}</select>
            <span></span>
            <button class="kn kn--gold" type="button" id="w-los">Add to the draft<i>${PF}</i></button>
          </div>
          <div class="wi-neu__ziehen" aria-hidden="true">Drop the photo here</div>
        </div>
        <p class="wi-neu__hinweis">Photos as JPG, PNG or WebP. Large photos are made smaller in your browser before they are saved.</p>
      </section>
      <section class="platte wi-probe">
        <span class="mono">Test the chat</span>
        <h2>Ask, <em>like a guest.</em></h2>
        <p>The answer comes from the draft, as it would be after «Publish». This question is not saved.</p>
        <form class="wi-ein__f" id="w-probe-f" autocomplete="off"><label class="suche wi-ein__feld">${SYM.chat.replace('<svg', '<svg fill="none" stroke="currentColor" stroke-width="1.4"')}<input type="text" id="w-probe" placeholder="Is there parking?" maxlength="600"></label>
          <button class="kn kn--linie" type="submit">Ask<i>${SYM.chat}</i></button></form>
        <div class="wi-antwort" id="w-antwort" hidden></div>
      </section>
    </div>
    ${verlauf.length ? `<section class="platte sb-verlauf"><span class="mono">Last changes</span><ol>${((vb) => verlauf.map((v, i) => `<li>${IMG(vb[i], 'sb-verlauf__bild')}<span class="mono">${esc(datum(v.zeit))}</span><b>${esc(W_ART[v.art] || v.art)}</b><p dir="auto">${esc(v.titel)}</p></li>`).join(''))(bilderVerteilen(verlauf.map(v => [BER_BILD[v.bereich] || THEMABILD[themaVon(v.titel)] || 'b24'].concat(THEMABILDER[themaVon(v.titel)] || []))))}</ol></section>` : ''}
    <label class="suche wi-such">${LUPE}<input type="search" id="w-such" placeholder="Search: hours, beer, playground …" value="${esc(S.such)}" autocomplete="off"></label>
    <div id="w-ergebnis"${q ? ' class="sucht"' : ''}>${q && !liste.length ? fehltS(S.such.trim()) : ''}
    ${q && !liste.length ? '' : (() => {   /* links die Bereiche als Inhaltsverzeichnis, rechts der gewählte Bereich; beim Suchen rechts alle Treffer */
      const da = bereiche.filter(b => liste.some(p => p.bereich === b) || (!q && b === 'Your answers'));
      if (!da.includes(S.bereich)) S.bereich = da[0] || '';
      const idx = da.map(b => { const n = liste.filter(p => p.bereich === b).length, t = liste.filter(p => p.bereich === b && (p.geaendert || p.aus || p.bis || p.typ !== 'fakt')).length;
        return `<button class="sb-i" type="button" data-bereich="${esc(b)}"${!q && S.bereich === b ? ' aria-current="true"' : ''}>${BER_BILD[b] ? `<span class="sb-i__bild" aria-hidden="true"><img src="/the-cat-and-gun/haus/assets/bild/${BER_BILD[b]}-480.webp" alt="" width="480" height="640" decoding="async"></span>` : ''}
          <span class="sb-i__n"><b>${paar(esc(b))}</b><small>${n ? mal(n, 'one line', 'lines') : 'empty so far'}${t ? ' · ' + t + ' by you' : ''}</small></span></button>`; }).join('');
      return `<div class="sb"><nav class="platte sb-idx" aria-label="Areas">${idx}</nav><div class="sb-rechts">${q ? da.map(tafel).join('') : tafel(S.bereich)}</div></div>`;
    })()}</div>`;
}
/* Steht zu einem Suchwort nichts im Wissen: zur Antwort führen statt abweisen (Vorlage 16.10.2026). Eine Abteilung zum Fragen gibt es hier nicht: Julie trägt selbst ein. */
function fehltS(wort) {
  const thema = wort.charAt(0).toUpperCase() + wort.slice(1), ber = S.wissen.bereiche;
  return `<section class="platte sb-fehlt" data-thema="${esc(thema)}">
    <span class="mono">Not in the answers yet</span>
    <h2>Nothing about «${esc(thema)}» yet. <em>What should the chat say?</em></h2>
    <p>When a guest asks, the chat offers to send the question to you. Or write the answer now.</p>
    <div class="sb-fehlt__wege">
      <div class="sb-fehlt__w"><b>Write it now</b>
        <label class="feld"><span>Area</span><select class="sel" id="fe-ber">${ber.map(b => `<option>${esc(b)}</option>`).join('')}</select></label>
        <label class="feld"><span>What the chat should say about «${esc(thema)}»</span><textarea id="fe-text" rows="4" maxlength="5000" placeholder="In full sentences, as you would tell a guest."></textarea></label>
        <button class="kn kn--gold" type="button" id="fe-los">Add to the draft<i>${SYM.haken}</i></button></div>
    </div></section>`;
}
function verbindeFehlt() {
  const f = $('.sb-fehlt'); if (!f) return;
  const thema = f.dataset.thema;
  $('#fe-los').onclick = async () => {
    const text = $('#fe-text').value.trim(); if (text.length < 2) { $('#fe-text').focus(); return quit('Please write the answer', '', [], true, 3500); }
    try { const b = $('#fe-ber').value; const d = await api('wissen_eintrag', { bereich: b, titel: thema, text, woerter: thema, bis: null }); S.ue = { ...S.ue, ...d };
      S.such = ''; S.bereich = b; await wissenNeu(); quit('Saved in the draft', `After «Publish» the chat answers questions about «${thema}» with it.`, [['Publish', veroeffentlichenFenster]], false, 6000); } catch (e) { fehler(e); }
  };
}
function nurErgebnis() {   // beim Suchen nur die Treffer neu setzen: Suchfeld und Seite bleiben stehen
  const tmp = document.createElement('div'); tmp.innerHTML = wissenS();
  $('#w-ergebnis').replaceWith(tmp.querySelector('#w-ergebnis')); verbindeErgebnis();
}
/* Foto zu einem Eintrag: im Browser auf höchstens 1600 px verkleinert (JPEG), dann hochgeladen; zu klein (unter 600 px) wird gesagt, nicht verweigert */
const FOTO = '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1.8" y="3" width="12.4" height="10" rx="1.5"/><circle cx="5.6" cy="6.6" r="1.2"/><path d="m2.5 12 4-4 3 3 2-2 2.5 2.5"/></svg>';
function dateiS() {
  const f = S.neuBild; if (!f) return '';
  return `<span class="wi-d"><img src="${f.vorschau}" alt="" width="40" height="40"><span><b>${esc(f.name)}</b><small>${f.breite} × ${f.hoehe} px${f.klein ? ' · small photo' : ''}</small></span><button type="button" data-weg aria-label="Remove ${esc(f.name)}">${ZU}</button></span>`;
}
function verkleinere(datei) {
  return new Promise((ok, nein) => {
    if (!/^image\/(jpeg|png|webp|gif|heic|heif|avif)$/.test(datei.type || '') && !/\.(jpe?g|png|webp|gif|heic|avif)$/i.test(datei.name || '')) return nein(new Error('BILD · «' + datei.name + '» is not a photo. Please choose a JPG, PNG or WebP photo.'));
    const u = URL.createObjectURL(datei), im = new Image();
    im.onload = () => { const m = Math.min(1, 1600 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
      c.width = Math.round(im.naturalWidth * m); c.height = Math.round(im.naturalHeight * m); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
      const d = c.toDataURL('image/jpeg', 0.86); ok({ daten: d, vorschau: d, breite: c.width, hoehe: c.height, klein: Math.max(im.naturalWidth, im.naturalHeight) < 600 }); };
    im.onerror = () => { URL.revokeObjectURL(u); nein(new Error('BILD · «' + datei.name + '» cannot be opened as a photo. Please choose a JPG, PNG or WebP photo.')); };
    im.src = u;
  });
}
async function fotoDazu(datei, wo) {
  try {
    const v = await verkleinere(datei);
    const d = await api('bild', { daten: v.daten });
    const f = { name: datei.name.replace(/\.\w+$/, '') + '.jpg', id: d.bild, ...v };
    if (v.klein) quit('Small photo', `It is only ${v.breite} px wide. It works, but it may look soft in the chat.`, [], false, 6000);
    return f;
  } catch (e) { fehler(e); return null; }
  finally { if (wo) wo.value = ''; }
}
function verbindeNeu() {
  const feld = $('#w-feld'), t = $('#w-text'), ti = $('#w-titel');
  const hoehe = () => { t.style.height = 'auto'; t.style.height = Math.min(Math.max(t.scrollHeight, 96), 320) + 'px'; };
  t.oninput = () => { S.neuText = t.value; hoehe(); }; hoehe();
  ti.oninput = () => { S.neuTitel = ti.value; };
  $('#w-ber').onchange = e => { S.neuBer = e.target.value; };
  const zeige = () => { $('#w-dateien').innerHTML = dateiS(); const x = $('#w-dateien [data-weg]'); if (x) x.onclick = () => { S.neuBild = null; zeige(); }; };
  zeige();
  $('#w-bild').onclick = () => $('#w-datei-bild').click();
  $('#w-datei-bild').onchange = async e => { const d = e.target.files[0]; if (!d) return; const f = await fotoDazu(d, e.target); if (f) { S.neuBild = f; zeige(); } };
  feld.ondragover = e => { e.preventDefault(); feld.classList.add('zieht'); };
  feld.ondragleave = e => { if (!feld.contains(e.relatedTarget)) feld.classList.remove('zieht'); };
  feld.ondrop = async e => { e.preventDefault(); feld.classList.remove('zieht'); const d = e.dataTransfer.files[0]; if (d) { const f = await fotoDazu(d); if (f) { S.neuBild = f; zeige(); } } };
  $('#w-los').onclick = async () => {
    const titel = ti.value.trim(), text = t.value.trim();
    if (titel.length < 2) { ti.focus(); return quit('Please write a title', 'The way a guest would ask.', [], true, 3500); }
    if (text.length < 2) { t.focus(); return quit('Please write what the chat should know', '', [], true, 3500); }
    const k = $('#w-los'); k.disabled = true;
    try { const b = $('#w-ber').value; const d = await api('wissen_eintrag', { bereich: b, titel, text, bild: S.neuBild ? S.neuBild.id : null, bis: null }); S.ue = { ...S.ue, ...d };
      S.neuTitel = ''; S.neuText = ''; S.neuBild = null; S.bereich = b; await wissenNeu(); quit('Saved in the draft', `It is under «${b}». Press «Publish» so guests see it.`, [['Publish', veroeffentlichenFenster]], false, 6000);
    } catch (e) { fehler(e); } finally { if (document.body.contains(k)) k.disabled = false; }
  };
}
function wissenNeu(d) { if (d) S.ue = { ...S.ue, ...d }; return zeichneHalten(); }
async function zeichneHalten() {   // erst alles frisch holen, dann tauschen (nie ein leerer Zwischenstand, in dem ein Klick ins Leere greift), an derselben Stelle bleiben
  const y = scrollY;
  try {
    const [u, w, f, a] = await Promise.all([api('ueberblick'), api('wissen'), api('fragen'), api('anfragen')]);
    const f0 = S.ue && S.ue.fassung, offen = !$('#fenster').hidden;
    S.ue = { ...S.ue, ...u }; if (offen && typeof f0 === 'number') S.ue.fassung = f0;   // ein Fenster ist offen (mit dem Stand von vorher): seine Fassung bleibt, sonst überschreibt es still (E21)
    S.wissen = w; S.fragen = f.fragen; S.nachgetragen = f.nachgetragen; S.anfragen = a.anfragen;
  } catch (e) { fehler(e); }
  rand(); leiste();
  if (S.ansicht === 'wissen' && S.wissen) { $('#ansicht').innerHTML = wissenS(); verbindeWissen(); } else await zeichne();
  window.scrollTo(0, y);
}
function posten(id) { return wissenZeilen().find(p => p.id === id); }
async function entwurfAntworten() { const d = await api('entwurf_antworten'); return d.antworten || []; }
function verbindeWissen() {
  /* Die Reiter im Kopf stehen seit dem neuen Look in der Ansicht selbst. Diese Ansicht wird auch ohne zeichne() neu gesetzt (Bereich links gewählt, nach dem Speichern):
     ohne diese Zeile reagierte danach kein Reiter mehr (Abnahme 28.11.2026). */
  $$('#ansicht [data-gehe]').forEach(b => b.onclick = () => gehe(b.dataset.gehe, b.dataset.wahl || ''));
  $('#w-neu').onclick = () => eintragFenster({ bereich: S.bereich && S.bereich !== 'Your answers' ? S.bereich : '' });
  $('#w-probe-auf').onclick = () => { $('#w-probe').scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => $('#w-probe').focus(), 350); };
  verbindeNeu();
  $('#w-probe-f').onsubmit = async e => {
    e.preventDefault(); const f = $('#w-probe').value.trim(); if (!f) return $('#w-probe').focus();
    const a = $('#w-antwort'); a.hidden = false;
    try { const r = window.CG_SUCHE.finde(f, await entwurfAntworten());
      a.className = 'wi-antwort' + (r.treffer.length ? '' : ' luecke');
      a.innerHTML = `<span class="mono">${r.treffer.length ? 'The chat answers' : 'The chat has no answer'}</span>${r.treffer.length ? r.treffer.map(x => window.CG_CHAT.antwortHTML(x, 'api/bild?id=')).join('').replace(/api\/bild\?id=bilder\/([0-9a-f]{16})\.jpg/g, 'api/bild?id=$1') : '<p>It would offer to send the question to you.</p>'}${r.treffer.length ? '' : `<button class="kn kn--klein kn--gold" type="button" id="w-probe-luecke">Answer for every guest<i>${PF}</i></button>`}`;
      if (!r.treffer.length) $('#w-probe-luecke').onclick = () => nachtragenFenster({ frage: f, antwort: '' });
    } catch (err) { a.hidden = true; fehler(err); }
  };
  let t = 0;
  $('#w-such').oninput = e => { clearTimeout(t); t = setTimeout(() => { S.such = e.target.value; nurErgebnis(); }, 200); };
  verbindeErgebnis();
}
function verbindeErgebnis() {
  verbindeFehlt();
  $$('[data-neu]').forEach(b => b.onclick = () => b.dataset.neu === 'Your answers' ? nachtragenFenster({ frage: '', antwort: '' }) : eintragFenster({ bereich: b.dataset.neu }));
  $$('.sb-z').forEach(b => b.onclick = () => zeileFenster(posten(b.dataset.id)));
  $$('.sb-i').forEach(b => b.onclick = () => { S.bereich = b.dataset.bereich; if (S.such) S.such = '';
    $('#ansicht').innerHTML = wissenS(); verbindeWissen(); const r = $('.sb').getBoundingClientRect().top; if (r < 120) window.scrollTo(0, scrollY + r - 120); });
}
/* Eine Zeile öffnen: lesen, ändern, ausblenden, «Valid until» */
function zeileFenster(p) {
  if (p.typ === 'antwort') return nachtragenFenster(p.x);
  if (p.typ === 'eintrag') return eintragFenster(p.e);
  const f = p.z, t = S.wissen.team[f.fid] || {};
  fenster(`<span class="mono sb-fk re-gl-r">${glieder([esc(p.bereich), esc(p.gruppe)])}</span><h2>${paar(esc(p.was))}</h2>
    <label class="feld"><span>The chat says</span><textarea id="f-angabe" rows="3" maxlength="5000">${esc(p.angabe)}</textarea></label>
    <div class="sb-beleg"><span class="mono">As it is written in ${esc(f.quelle)}</span><p>«${esc(f.beleg)}»</p>${(f.mehr || []).map(m => `<p>«${esc(m)}»</p>`).join('')}</div>
    <div class="wi-fz">${bisFeld('f-bis', t.bis)}<label class="schalter-z schalter-z--feld"><input type="checkbox" id="f-aus"${t.aus ? ' checked' : ''}> <span>Hidden: the chat does not say this</span></label></div>
    ${p.geaendert ? `<p class="sb-hinweis">Changed ${esc(datum(p.zeit))}. Before: «${esc(kurz(p.orig))}»</p>` : ''}${p.abgelaufen ? `<p class="sb-hinweis">Expired on ${esc(datum(p.bis))}: the chat no longer says this.</p>` : ''}
    <div class="fenster__kn sb-kn">${p.geaendert || t.aus || t.bis ? '<button class="link" type="button" id="f-zurueck">As on the website</button>' : ''}
      <span></span><button class="link" type="button" data-zu>Cancel</button><button class="kn kn--gold" type="button" id="f-los">Save<i>${SYM.haken}</i></button></div>`, true,
  async () => fakt({ angabe: $('#f-angabe').value, bis: $('#f-bis').value || null, aus: $('#f-aus').checked }, 'Saved in the draft'));
  const z = $('#f-zurueck'); if (z) z.onclick = () => fakt({ zurueck: true }, 'Back as on the website');
  async function fakt(d, titel) {
    const k = $('#f-los'); if (k) k.disabled = true;
    try { const r = await api('wissen_fakt', { fid: f.fid, ...d }); S.ue = { ...S.ue, ...r }; fensterZu(); await wissenNeu(); quit(titel, 'Press «Publish» so guests see it.', [['Publish', veroeffentlichenFenster]], false, 6000); }
    catch (e) { fehler(e); if (k && document.body.contains(k)) k.disabled = false; }
  }
  const wachse = () => { const t = $('#f-angabe'); if (!t) return; t.style.height = 'auto'; t.style.height = (t.scrollHeight + 2) + 'px'; };
  wachse(); const ta = $('#f-angabe'); if (ta) ta.addEventListener('input', wachse);
  setTimeout(() => { wachse(); const t = $('#f-angabe'); if (t) { t.focus(); t.setSelectionRange(0, 0); t.scrollTop = 0; } }, 60);
}
function eintragFenster(e) {
  const bereiche = S.wissen.bereiche;
  let bildNeu = e.bild ? { id: e.bild, vorschau: 'api/bild?id=' + e.bild, name: 'Photo', breite: '', hoehe: '' } : null;
  fenster(`<h2>${e.wid ? 'Change the <em>line.</em>' : 'Add a <em>line.</em>'}</h2>
    <p>What the chat should know: a new opening time, a special, an event. It goes into the draft; after «Publish» the chat answers with it.</p>
    <div class="wi-fz"><label class="feld"><span>Area</span><select class="sel" id="f-ber">${bereiche.map(b => `<option${(e.bereich || 'Events') === b ? ' selected' : ''}>${esc(b)}</option>`).join('')}</select></label>
      ${bisFeld('f-bis', e.bis)}</div>
    <label class="feld"><span>Title</span><input id="f-titel" value="${esc(e.titel || '')}" maxlength="200" placeholder="The way a guest would ask"></label>
    <label class="feld"><span>What the chat should know</span><textarea id="f-text" rows="6" maxlength="5000" placeholder="In full sentences, with date, time, place and price if known.">${esc(e.text || '')}</textarea></label>
    ${woerterFeld('f-woerter', e.woerter)}
    <div class="feld"><span>Photo <small>optional</small></span><div class="wi-foto" id="f-foto"></div><input type="file" id="f-datei" accept="image/*" hidden></div>
    ${e.wid ? `<label class="schalter-z"><input type="checkbox" id="f-aus"${e.aus ? ' checked' : ''}> <span>Hidden: the chat does not use this line</span></label>` : ''}
    <div class="fenster__kn sb-kn">${e.wid ? '<button class="link rot" type="button" id="f-weg">Remove</button><span></span>' : ''}<button class="link" type="button" data-zu>Cancel</button><button class="kn kn--gold" type="button" id="f-los">${e.wid ? 'Save' : 'Add to the draft'}<i>${SYM.haken}</i></button></div>`, true, async () => {
    const k = $('#f-los'); if (k.disabled) return; k.disabled = true;
    try { const b = $('#f-ber').value;
      const d = await api('wissen_eintrag', { wid: e.wid || '', bereich: b, titel: $('#f-titel').value, text: $('#f-text').value, woerter: $('#f-woerter').value, bis: $('#f-bis').value || null, bild: bildNeu ? bildNeu.id : null, ...($('#f-aus') ? { aus: $('#f-aus').checked } : {}) });
      S.ue = { ...S.ue, ...d }; fensterZu(); S.bereich = b; await wissenNeu(); quit(e.wid ? 'Saved in the draft' : 'Added to the draft', 'Press «Publish» so guests see it.', [['Publish', veroeffentlichenFenster]], false, 6000);
    } catch (err) { fehler(err); if (document.body.contains(k)) k.disabled = false; }
  });
  const zeigeFoto = () => { $('#f-foto').innerHTML = bildNeu ? `<span class="wi-d"><img src="${esc(bildNeu.vorschau)}" alt="" width="40" height="40"><span><b>${esc(bildNeu.name)}</b><small>${bildNeu.breite ? bildNeu.breite + ' × ' + bildNeu.hoehe + ' px' : 'saved'}</small></span><button type="button" id="f-foto-weg" aria-label="Remove photo">${ZU}</button></span>`
    : `<button class="kn kn--linie kn--klein" type="button" id="f-foto-dazu">Add a photo<i>${FOTO}</i></button>`;
    const w = $('#f-foto-weg'); if (w) w.onclick = () => { bildNeu = null; zeigeFoto(); };
    const dz = $('#f-foto-dazu'); if (dz) dz.onclick = () => $('#f-datei').click(); };
  zeigeFoto();
  $('#f-datei').onchange = async ev => { const d = ev.target.files[0]; if (!d) return; const f = await fotoDazu(d, ev.target); if (f) { bildNeu = f; zeigeFoto(); } };
  const w = $('#f-weg'); if (w) w.onclick = () => entfernen('Remove this line?', 'The chat no longer knows it after «Publish».', async () => { const d = await api('wissen_eintrag_weg', { wid: e.wid }); S.ue = { ...S.ue, ...d }; });
  setTimeout(() => { const t = $(e.wid ? '#f-text' : '#f-titel'); if (t) t.focus(); }, 60);
}

/* ---------- How the chat works (AUFTRAG: Liste «so arbeitet der Chat») ---------- */
function soChat() {
  const u = S.ue, n = wissenZeilen().filter(p => !p.aus).length;
  const SCHRITTE = [
    ['A guest asks on the website', 'The chat sits in the corner of every page. The guest types a question or taps one of the suggestions.'],
    ['The chat looks in the answers file', 'The answers are a file on the website. The search runs in the guest’s own browser, without a server and without AI. Nothing is saved.'],
    ['It knows other words and typos', 'It reads «hours», «closing» or «when» as a question about opening times, and finds «adress» or «breakfst» too. You can add more words to any line under «Other ways guests ask».'],
    ['It answers with what is written', 'The chat only says what is in «What the chat knows»: lines from the website and lines you added. It never makes up a price, a time or a name. If a question has a word no line knows, such as «Christmas» or «vegan», the chat does not guess.'],
    ['No answer: the guest can send the question to you', 'Name and contact are optional and marked that way. Without a contact the question still reaches you, without a name.'],
    ['You see it here', 'Every sent question is under «Questions». With a contact it is also in the «Inbox», where you can write a personal reply and copy it.'],
    ['You write the answer once', '«Answer for every guest» puts it into the draft. You can give it an end date («Valid until») or hide it later.'],
    ['«Publish» writes the answers file again', 'Only the answers file changes. From then on the chat gives your answer to every guest who asks. Earlier versions stay under «Earlier versions» and can come back into the draft.']];
  return kopf('How the chat works', 'From a question <em>to an answer for everyone.</em>',
    'What happens between a guest’s question and your answer, step by step. The chat on the website has no AI and costs nothing per question.') +
    `<div class="re-zahlen platte"><div><b>${u.stand_zeit ? u.antworten : 0}</b><span>answers on the website</span></div><div><b>${n}</b><span>answers in the draft</span></div><div><b>${u.entwurf}</b><span>changes wait for «Publish»</span></div><div><b>${u.ohne_antwort}</b><span>questions without answer</span></div></div>
    <ol class="platte so-chat">${SCHRITTE.map(([t, s], i) => `<li><span class="so-chat__n mono">${String(i + 1).padStart(2, '0')}</span><div><b>${esc(t)}</b><p>${esc(s)}</p></div></li>`).join('')}</ol>
    <div class="so-chat__kn"><button class="kn kn--gold" type="button" id="so-probe">Try the chat<i>${SYM.chat}</i></button><a class="kn kn--linie" href="chat/probe.html" target="_blank" rel="noopener">The chat as on the website<i>${PF}</i></a></div>`;
}

/* ---------- Before, after · Earlier versions · Publish (R08, R12, R14) ---------- */
async function vorherNachher() {
  try {
    const d = await api('unterschiede');
    const ART_T = { neu: 'New', geaendert: 'Changed', weg: 'Removed or hidden' };
    fenster(`<span class="mono">Draft</span><h2>Before, <em>after.</em></h2><p>${d.liste.length ? mal(d.liste.length, 'One answer changes', 'answers change') + ' when you publish.' : 'The draft is the same as the website.'}</p>
      <div class="ae-liste">${d.liste.map(x => `<div class="ae"><span class="mono">${esc(ART_T[x.art] || x.art)}</span><div class="vor"><small>Before · ${esc(x.frage)}</small>${x.vorher ? esc(kurz(x.vorher)) : '–'}</div><div class="nach"><small>After</small>${x.nachher ? esc(kurz(x.nachher)) : '–'}</div><div class="ae__kn"></div></div>`).join('')}</div>
      <div class="fenster__kn"><button class="link" type="button" data-zu>Close</button>${d.liste.length ? `<button class="kn kn--gold" type="button" id="f-los">Publish<i>${PF}</i></button>` : ''}</div>`, false, () => { fensterZu(); veroeffentlichenFenster(); });
  } catch (e) { fehler(e); }
}
async function fassungen() {
  try {
    const d = await api('verlauf');
    const vl = (vid, b, s, kl = '') => `<div class="vl${kl}"><div><b>${b}</b><span>${s}</span></div><button class="kn kn--klein kn--linie" type="button" data-vid="${esc(vid)}">Put in the draft<i>${PF}</i></button></div>`;
    fenster(`<span class="mono">Earlier versions</span><h2>What was <em>published before.</em></h2><p>Putting a version in the draft changes nothing on the website. Check it, then press «Publish».</p>
      <div class="vl-liste">${d.stand ? vl('stand', 'Now on the website · ' + esc(zeit(d.stand.zeit)), mal(d.stand.zahl, 'one answer', 'answers') + (d.stand.notiz ? ' · ' + esc(d.stand.notiz) : '')) : ''}
      ${d.verlauf.map(v => vl(v.vid, esc(zeit(v.zeit)), mal(v.zahl, 'one answer', 'answers') + (v.notiz ? ' · ' + esc(v.notiz) : ''))).join('')}
      ${!d.stand && !d.verlauf.length ? '<p class="leise">Nothing published yet.</p>' : ''}
      ${vl('ursprung', 'Original state', mal(d.ursprung, 'one answer', 'answers') + ' from the website, without your changes', ' vl--ursprung')}</div>
      <div class="fenster__kn"><button class="link" type="button" data-zu>Close</button></div>`);
    $$('#fenster [data-vid]').forEach(b => b.onclick = async () => {
      try { const r = await api('zurueckholen', { vid: b.dataset.vid }); S.ue = { ...S.ue, ...r }; fensterZu(); rand(); leiste(); await zeichneHalten();
        quit('In the draft', 'The website is unchanged until you press «Publish».', [['Before, after', vorherNachher]], false, 8000); } catch (e) { fehler(e); }
    });
  } catch (e) { fehler(e); }
}
async function veroeffentlichenFenster() {
  if (nurTextOffen()) return quit('Save first', 'Your personal reply has changes that are not saved.', [], true, 5000);
  let d; try { d = await api('unterschiede'); } catch (e) { return fehler(e); }
  if (!d.liste.length && S.ue.stand_zeit) return quit('Nothing changed, nothing published.', '', [], false, 4000);
  fenster(`<span class="mono">Publish</span><h2>Give the chat <em>its new answers.</em></h2>
    <p>${d.liste.length ? mal(d.liste.length, 'One answer changes', 'answers change') : 'The first publishing'}. Only the answers file of the chat is written; the website pages stay as they are.</p>
    ${d.liste.length ? `<ul class="pub-liste">${d.liste.slice(0, 8).map(x => `<li><span class="mono">${{ neu: 'New', geaendert: 'Changed', weg: 'Removed' }[x.art]}</span>${esc(x.frage)}</li>`).join('')}${d.liste.length > 8 ? `<li class="leise">and ${d.liste.length - 8} more</li>` : ''}</ul>` : ''}
    <label class="feld"><span>Note <small>optional, for «Earlier versions»</small></span><input id="f-notiz" maxlength="300" placeholder="e.g. New answer about wifi"></label>
    <ol class="schritte" id="f-schritte" hidden><li>Check the answers</li><li>Write the answers file</li><li>Check it byte for byte</li><li>Keep the old version</li></ol>
    <div class="fenster__kn"><button class="link" type="button" data-zu>Cancel</button><button class="kn kn--gold" type="button" id="f-los">Publish now<i>${PF}</i></button></div>`, true, async () => {
    const k = $('#f-los'); if (k.disabled) return; k.disabled = true;
    const sl = $('#f-schritte'); sl.hidden = false; const li = $$('li', sl);
    li.forEach((x, i) => setTimeout(() => { li.forEach((y, j) => { y.classList.toggle('fertig', j < i); y.classList.toggle('jetzt', j === i); }); }, i * 220));
    try {
      const r = await api('veroeffentlichen', { notiz: $('#f-notiz').value });
      await new Promise(ok => setTimeout(ok, li.length * 220));
      li.forEach(y => { y.classList.add('fertig'); y.classList.remove('jetzt'); });
      S.ue = { ...S.ue, ...r }; rand(); leiste();
      setTimeout(() => { fensterZu(); quit('It is online.', 'The chat now answers with ' + mal(r.zahl, 'one answer.', 'answers.'), [['Try the chat', probe]], false, 8000); if (S.ansicht === 'wissen' || S.ansicht === 'chat' || S.ansicht === 'start') zeichneHalten(); }, 500);
    } catch (e) { li.forEach(y => y.classList.remove('jetzt')); k.disabled = false; fehler(new Error(String(e.message || e).replace(/^([A-ZÄÖÜ-]+ · )?/, (m, a) => (a || 'SERVER · ')) + (/unchanged/.test(e.message) ? '' : ' Not published. The website is unchanged.'))); }
  });
}

/* ---------- Try the chat: das Chatfenster wie auf dem Handy, mit dem Entwurf (chat/suche.js, wie die Website) ---------- */
function probe() {
  let o = $('#probe');
  if (!o) { o = document.createElement('div'); o.id = 'probe'; o.className = 'probe'; document.body.appendChild(o); }
  const K = (window.CG_CHAT && window.CG_CHAT.KARTEN) || [];
  o.innerHTML = `<div class="probe__k" role="dialog" aria-modal="true" aria-label="Try the chat">
      <aside class="probe__links">
        <button class="rund probe__zu" type="button" aria-label="Close">${ZU}</button>
        <span class="mono">Try the chat</span>
        <h2>How a guest <em>asks.</em></h2>
        <p>The chat as guests see it on their phone, with your draft: what you saved shows here before «Publish». Tap a question or write your own.</p>
        <div class="probe__fragen">${K.map(k => `<button type="button" data-frage="${esc(k[2])}"><i>${SYM.chat}</i><span>${esc(k[2])}</span></button>`).join('')}</div>
        <p class="probe__klein">When the chat has no answer, it offers to send the question to you. Sent from here, it lands in the inbox as an example.</p>
        <div class="probe__kn"><button class="kn kn--gold" type="button" id="probe-eingang">Back to the inbox<i>${PF}</i></button></div>
      </aside>
      <div class="probe__rechts"><div class="ws-handy" aria-label="Chat of The Cat &amp; Gun">
        <header class="ws-handy__kopf">${ZEICHEN}<div><b>Ask us</b><small>The Cat &amp; Gun</small></div></header>
        <div class="ws-handy__l" id="probe-l" aria-live="polite"><p class="ws-bl ws-bl--haus">Hi. What would you like to know?</p></div>
        <form class="ws-handy__feld" id="probe-form"><textarea id="probe-t" rows="1" maxlength="600" placeholder="Your question" aria-label="Your question"></textarea><button class="rund" type="submit" aria-label="Send">${PF}</button></form>
      </div></div>
    </div>`;
  o.hidden = false; document.documentElement.classList.add('probe-offen');
  const liste = $('#probe-l', o), feld = $('#probe-t', o);
  let antworten = null;
  const blase = (html, wer) => { const p = document.createElement('div'); p.className = 'ws-bl ws-bl--' + wer; p.setAttribute('dir', 'auto'); p.innerHTML = html; liste.appendChild(p); liste.scrollTop = liste.scrollHeight; return p; };
  const weiter = (nach, q) => {
    $$('.ws-weiter', liste).forEach(x => x.remove());
    const f = document.createElement('form'); f.className = 'ws-weiter'; f.noValidate = true;
    f.innerHTML = `<b>Send to the house</b><label><span>Name <em>optional</em></span><input name="name" maxlength="120"></label><label><span>Phone, email or Instagram <em>optional</em></span><input name="kontakt" maxlength="160"></label><button class="kn kn--klein kn--gold" type="submit">Send to the house<i>${PF}</i></button><p class="ws-fehler" hidden></p>`;
    nach.after(f); liste.scrollTop = liste.scrollHeight;
    f.onsubmit = async e => { e.preventDefault(); const kn = $('button', f); kn.disabled = true;
      try { await api('formular', { frage: q, name: f.elements.name.value, kontakt: f.elements.kontakt.value, seite: '/the-cat-and-gun/haus/index.html', probe: true });
        const p = document.createElement('p'); p.className = 'ws-bl ws-bl--haus'; p.textContent = 'Thank you. Your question is with the house. (Example: it is in the inbox, marked as example.)'; f.replaceWith(p); S.anfragen = null; S.fragen = null;
      } catch (x) { const fe = $('.ws-fehler', f); fe.hidden = false; fe.textContent = String(x.message || x).replace(/^[A-ZÄÖÜ-]+ · /, ''); kn.disabled = false; liste.scrollTop = liste.scrollHeight;   /* der Hinweis steht unter dem Knopf: ganz ins Bild (Abnahme 28.11.2026) */ } };
  };
  const frage = async t => {
    t = String(t || '').trim(); if (!t) return;
    blase('<p>' + esc(t) + '</p>', 'gast'); feld.value = '';
    try {
      if (!antworten) antworten = await entwurfAntworten();
      const r = window.CG_SUCHE.finde(t, antworten);
      if (r.treffer.length) blase(r.treffer.map(x => window.CG_CHAT.antwortHTML(x, 'api/bild?id=')).join('').replace(/api\/bild\?id=bilder\/([0-9a-f]{16})\.jpg/g, 'api/bild?id=$1'), 'haus ws-bl--antw');
      else weiter(blase('<p>I don’t have an answer to that yet. Do you want to send your question to the house?</p>', 'haus'), t);
    } catch (e) { blase('<p>No connection to the answers.</p>', 'haus'); }
    liste.scrollTop = liste.scrollHeight;
  };
  $('#probe-form', o).onsubmit = e => { e.preventDefault(); frage(feld.value); };
  feld.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); frage(feld.value); } };
  $$('.probe__fragen [data-frage]', o).forEach(b => b.onclick = () => frage(b.dataset.frage));
  const zu = () => { o.hidden = true; o.innerHTML = ''; document.documentElement.classList.remove('probe-offen'); document.removeEventListener('keydown', taste); };
  const taste = e => { if (e.key === 'Escape' && !o.hidden && !(e.target && e.target.id === 'probe-t')) zu(); };
  $('.probe__zu', o).onclick = zu;
  o.onclick = e => { if (e.target === o) zu(); };
  $('#probe-eingang').onclick = () => { zu(); S.anfragen = null; S.fragen = null; frisch(); gehe('eingang'); };
  document.addEventListener('keydown', taste);
  setTimeout(() => feld.focus({ preventScroll: true }), 300);
}

/* ---------- Fenster ---------- */
function fenster(html, schmal = false, los = null) {
  const f = $('#fenster');
  f.innerHTML = `<div class="fenster__k${schmal ? ' schmal' : ''}" role="dialog" aria-modal="true"><button class="rund fenster__zu" type="button" data-zu aria-label="Close">${ZU}</button>${html}</div>`;
  f.hidden = false;
  $$('[data-zu]', f).forEach(b => b.onclick = fensterZu);
  f.onclick = e => { if (e.target === f) fensterZu(); };
  if (los && $('#f-los')) $('#f-los').onclick = los;
}
function fensterZu() { $('#fenster').hidden = true; $('#fenster').innerHTML = ''; }
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#fenster').hidden) fensterZu();
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {   // Cmd/Ctrl+S speichert (R09): im Fenster «Save», sonst die persönliche Antwort
    e.preventDefault();
    if (!$('#fenster').hidden && $('#f-los')) return $('#f-los').click();
    const a = S.anfragen && S.anfragen.find(x => x.id === S.wahl); if (a && $('#e-text')) antwortSichern(a);
  }
});

/* ---------- Start ---------- */
(async function () {
  /* Nach 12 s ohne Antwort zeigt sich die Tafel «does not start». Kommt die Antwort danach doch, startet das Werkzeug und die Tafel geht weg
     (Abnahme 28.11.2026, wie Sticker editor c9b45579; vorher blieb das Werkzeug dann stehen). */
  const tuerZeit = setTimeout(() => { $('#tuer').hidden = false; $('#tuer-t').textContent = 'The server part does not answer.'; }, 12000);
  try { S.ue = await api('ueberblick'); }
  catch (e) { clearTimeout(tuerZeit); $('#tuer').hidden = false; $('#tuer-t').textContent = /^VERBINDUNG · /.test(e.message || '') ? 'No connection to the server part. Please reload in a moment.' : String(e.message || e).replace(/^[A-ZÄÖÜ]+ · /, ''); return; }
  clearTimeout(tuerZeit); $('#tuer').hidden = true;
  const h = location.hash.slice(1);
  try { S.ansicht = TITEL[h] ? h : ((/\/maison\/?(index\.html)?([?#].*)?$/.test(document.referrer) && ((performance.getEntriesByType('navigation')[0] || {}).type !== 'reload')) ? (localStorage.removeItem('reception-ansicht'), 'start') : localStorage.getItem('reception-ansicht') || 'start'); }   /* Aus dem Control panel geöffnet: immer die Übersicht (R15) */ catch (e) { S.ansicht = 'start'; }
  if (!TITEL[S.ansicht]) S.ansicht = 'start';
  rand(); leiste(); await zeichne();
  if (new URLSearchParams(location.search).has('probe')) { history.replaceState(null, '', location.pathname + location.hash); probe(); }   /* «Try the chat» in der Leiste von Anleitung und Prüfseite */
  window.addEventListener('hashchange', () => { const z = location.hash.slice(1); if (TITEL[z] && z !== S.ansicht) gehe(z); });
  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#so-probe')) probe(); });
  setInterval(async () => {   // alle zwei Minuten nachsehen, ob etwas Neues da ist (E14), ohne die Ansicht zu stören
    try {
      const u = await api('ueberblick');
      if (u.anfragen_gesamt !== S.ue.anfragen_gesamt || u.fragen_gesamt !== S.ue.fragen_gesamt || u.anfragen_neu !== S.ue.anfragen_neu || u.fassung !== S.ue.fassung) {
        S.ue = { ...u, fassung: S.ue.fassung };   // die Fassung des Entwurfs gilt erst, wenn neu gezeichnet ist: ein offenes Fenster schickt sonst die neue Fassung mit seinem alten Inhalt und überschreibt still (E21)
        rand(); leiste();
        if (!$('#e-text') && $('#fenster').hidden && !($('#w-text') && ($('#w-text').value || $('#w-titel').value))) zeichneHalten();
      }
    } catch (e) { /* still */ }
  }, 120000);
})();

/* Nichts geht beim Wechseln oder Verlassen verloren (E17): die persönliche Antwort wird vor jedem Wechsel gesichert, beim Verlassen fragt der Browser nach (R13). */
function nurTextOffen() {
  const tx = $('#e-text'), a = S.anfragen && S.anfragen.find(x => x.id === S.wahl);
  return tx && a && tx.value !== ((a.antwort || {}).text || '') ? { a, text: tx.value } : null;
}
function wartendesSichern() { const o = nurTextOffen(); if (o) antwortSichern(o.a, true); }
addEventListener('beforeunload', ev => {
  const offen = nurTextOffen() || $$('#fenster:not([hidden]) textarea, #fenster:not([hidden]) input[type=text], #fenster:not([hidden]) input:not([type]), #w-text, #w-titel').some(x => x.value.trim() && x.value !== x.defaultValue);
  if (offen) { ev.preventDefault(); ev.returnValue = ''; }
});
