/* Visitors (Le Registre) · The Cat & Gun, Catangnan, Siargao (Tasty Studios 22.11.2026, Werkzeuge 2.0). Kopie von registre.js der Besucherliste des
   Culinarium Hannover (abgenommen), nur Kleid, Inhalt, Sprache (Englisch) und Umfang getauscht. Das Haus sieht, wer seine Website besucht:
   woher (Land, Ort), wann (Tag, Uhrzeit, Wochentag), was (Seiten, Zeit je Seite), wie es sich entwickelt (Verlauf) und ob ein Besuch
   weiterführt (Anruf, Route in Google Maps, Instagram, TravelGO). Nie ein Name, keine Adresse der Verbindung, kein Cookie.
   Quelle: /the-cat-and-gun/haus/api/registre. Lokal server.py (registre.py, Zählung in _daten/), online der Worker aus unterbau/ mit Cloudflare Web Analytics
   (online/registre.js). Nie erfundene Zahlen in der echten Ansicht. Testschalter (?beispiel=1, Knopf «Show test data»): Testdaten, überall als Testdaten
   beschriftet. Ohne Server-Teil liest das Werkzeug beispiel/<tage>.json und schiebt die Tage auf heute. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* Prüfung 22.11.2026, Abweichung 1: Angaben aus der Quelle (Ort, Herkunft, Region, unbekannte Seitennamen) können lange Stücke ohne Leerzeichen haben
   (Verweis-Adressen, Spam). Solche Texte bekommen die Klasse «lang» (catgun.css): sie brechen dann überall um, statt aus dem Blatt zu laufen.
   Kurze Namen bleiben wie bisher ganz (nie mitten im Wort getrennt). */
const LANG_MAX = 200;   /* mehr zeigt keine Liste (eine Herkunft von 5'000 Zeichen stünde sonst über Bildschirme); ganz steht der Text im Tipp und in der Tabelle */
const tx = t => { const s = String(t == null ? '' : t); if (s.length <= LANG_MAX && !/\S{25,}/.test(s)) return esc(s);
  return `<span class="lang"${s.length > LANG_MAX ? ` title="${esc(s.slice(0, 2000))}"` : ''}>${esc(s.length > LANG_MAX ? s.slice(0, LANG_MAX) + '…' : s)}</span>`; };
const PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
const ZVB = '452 198 176 148';   /* das «&» der Wortmarke (oberflaeche/kleid/catgun-zeichen.svg = drucksachen/zeichen/et-farbe.svg, Ausschnitt der Wortmarke) */
const ZT = `<svg class="zt" viewBox="${ZVB}" aria-hidden="true"><use href="#zeichen"/></svg>`;
const SYM = {
  buch: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 3.2c2-.8 3.8-.6 5.5.6 1.7-1.2 3.5-1.4 5.5-.6v9.6c-2-.8-3.8-.6-5.5.6-1.7-1.2-3.5-1.4-5.5-.6z"/><path d="M8 3.8v9.6"/></svg>',
  haus: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 7.2 8 2.8l5.5 4.4V13a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5z"/><path d="M6.5 13.5v-4h3v4"/></svg>',
  neu: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.5-3.6M13 2.8v2.8h-2.8"/></svg>',
  auge: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.8 8S4 3.8 8 3.8 14.2 8 14.2 8 12 12.2 8 12.2 1.8 8 1.8 8z"/><circle cx="8" cy="8" r="1.9"/></svg>',
  augezu: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.8 8S4 3.8 8 3.8 14.2 8 14.2 8 12 12.2 8 12.2 1.8 8 1.8 8z"/><path d="M3 13 13 3"/></svg>',
  hoch: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 10V2.5M2.8 5.6 6 2.4l3.2 3.2"/></svg>',
  laden: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5v8M4.8 7.6 8 10.8l3.2-3.2M3 13.5h10"/></svg>',
  runter: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 2v7.5M2.8 6.4 6 9.6l3.2-3.2"/></svg>' };
const SPRACHE = { en: 'English', tl: 'Filipino', de: 'German', fr: 'French', it: 'Italian', nl: 'Dutch', es: 'Spanish', pt: 'Portuguese', zh: 'Chinese', ja: 'Japanese', ko: 'Korean', ar: 'Arabic', he: 'Hebrew', ru: 'Russian', xx: 'Other language' };
const GERAET = { handy: 'Mobile', tablet: 'Tablet', rechner: 'Computer' };
const EREIGNIS = { fenster: 'Opened a form', buchung: 'Booked', booking: 'Booked elsewhere', tisch: 'Started a form', anfrage: 'Sent a form', anruf: 'Called', mail: 'Opened Instagram', chat: 'Opened TravelGO', route: 'Opened directions' };
/* Schlüssel wie in allen Häusern (registre.py EREIGNISSE, Master G14). Bei The Cat & Gun gibt es nur die vier Wege der Website (website/bau.py):
   anruf = Telefon (tel:, Knopf «Call» auf jeder Seite), mail = Instagram @thecatandgun, chat = TravelGO, route = Google Maps.
   fenster, buchung, booking, tisch, anfrage: die Website hat kein Formular und keine Buchung, sie kommen nie vor. */
const REIHE = ['anruf', 'route', 'mail', 'chat'];
const GOLD_E = ['anruf', 'route'];
const ZUR_BUCHUNG = ['anruf', 'route'];   /* «on the way»: angerufen oder die Route geöffnet (wie registre.py ZUR_BUCHUNG) */
const BEREICHE = [
  ['start', 'Overview', ''], ['', 'The guests'], ['besuche', 'Visits', 'heute'], ['herkunft', 'Origin', ''], ['zeit', 'Time', ''],
  ['', 'The website'], ['seiten', 'Pages', ''], ['verlauf', 'Trend', ''], ['buchung', 'On the way', ''], ['', 'Good to know'], ['zaehlung', 'How we count', '']];
const TITEL = Object.fromEntries(BEREICHE.filter(x => x[0]).map(x => [x[0], x[1]]));
/* Siargao: die Orte der Insel (Gemeinden von Siargao), für «From Siargao» */
const INSEL = ['General Luna', 'Catangnan', 'Dapa', 'Del Carmen', 'Pilar', 'San Isidro', 'Santa Monica', 'Burgos', 'San Benito', 'Socorro'];
const WTAG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
/* Die Stube (La Maison): lokal liegt sie neben dem Besucherbuch (_werkzeuge/maison/), online unter /maison/ (wie im Doldenhorn; Andock-Datei der Stube: statik → maison) */
/* Lokal leitet der Server von Visitors /the-cat-and-gun/haus/_werkzeuge/maison/ auf ihren eigenen Server weiter (Mac-Prüfung 23.11.2026, Punkt 19) */
const MAISON = /\/_werkzeuge\/registre\//.test(location.pathname) ? '../maison/' : '../../maison/';
const MERK = 'catgun-nicht-zaehlen';
/* Werkzeuge 2.0: kein Vorführ-Betrieb. Die echte Ansicht zeigt nur echte Zahlen (lokal _daten/, online Cloudflare Web Analytics über den Worker);
   den Zugang regelt die Anmeldung im Worker (unterbau/), kein Schlüssel in der Adresse. Testdaten nur über den Testschalter. */
const VORFUEHRUNG = false;
const SCHL = '';
const ECHT_DA = true;
const S = { d: null, namen: {}, bilder: {}, fotos: {}, ansicht: 'start', tage: 30, beispiel: /[?&]beispiel=1/.test(location.search), wahl: 0, filter: 'alle', zeige: 40, ablage: false, raster: 'besuche' };

/* ---------- Helfer ---------- */
const n = x => Number(x || 0).toLocaleString('en-US');
const mal = (z, eins, viele) => z === 1 ? eins : n(z) + ' ' + viele;
let LAND; try { LAND = new Intl.DisplayNames(['en'], { type: 'region' }); } catch (e) { LAND = null; }
const LAND_EIGEN = { GB: 'UK', US: 'USA', KR: 'South Korea', AE: 'UAE' };
function land(code) { if (!code || code === '??') return ''; if (LAND_EIGEN[code]) return LAND_EIGEN[code]; try { return (LAND && LAND.of(code)) || code; } catch (e) { return code; } }
function ort(b) { const l = land(b.l); return b.o ? (l ? b.o + ', ' + l : b.o) : (l || 'Place not known'); }
/* Uhrzeit wie auf der Website des Hauses («7AM to 10PM»): 12 Stunden, AM/PM ohne Abstand, hier «9:33PM» (passt in die Zeitspalte der Vorlage, 46 px) */
function uhr(z) { const t = String(z || '').split(':'); if (t.length < 2) return ''; const h = +t[0]; return ((h + 11) % 12 + 1) + ':' + t[1] + (h < 12 ? 'AM' : 'PM'); }
const stunde = h => ((h + 11) % 12 + 1) + (h % 24 < 12 ? 'AM' : 'PM');
function seite(datei) { return S.namen[datei] || String(datei).replace(/\.html$/, ''); }
/* Bild je Seite (Fehlerbuch 10a, Robert 19.10.2026: jede Liste zeigt zu jedem Eintrag sein Bild): erstes eigenes Foto der Seite, kleine Fassung (seiten-bilder.json aus registre.py seiten) */
/* Mac-Prüfung 23.11.2026 (Punkt 5): in der Liste der Besuche stand dasselbe Seitenfoto bis zu 16-mal. Dort zeigt jede Zeile ein Foto DERSELBEN Seite
   (alle Fotos ihres Inhalts, seiten-fotos.json aus registre.py seiten), das in der Liste bisher am seltensten steht; nie das Kopfbild der Ansicht, kein Foto öfter als dreimal.
   ZUG zählt je Foto, wie oft es in der Liste steht; neu bei jeder Liste. */
let ZUG = {};
function fbild(datei) {
  const kopfbild = '/' + (BUEHNE[S.ansicht] || BUEHNE.start)[0] + '-', pool = (S.fotos[datei] || []).filter(f => f.indexOf(kopfbild) < 0);
  if (!pool.length) return sbild(datei);
  const wenigst = l => { let best = l[0]; l.forEach(f => { if ((ZUG[f] || 0) < (ZUG[best] || 0)) best = f; }); return best; };
  let best = wenigst(pool);
  if ((ZUG[best] || 0) >= 3) {   /* Seite mit wenigen Fotos (Visit): nie ein Foto viermal, dann ein anderes Foto des Hauses von der Website */
    const alle = [...new Set(Object.values(S.fotos).flat())].filter(f => f.indexOf(kopfbild) < 0);
    if (alle.length) best = wenigst(alle);
  }
  ZUG[best] = (ZUG[best] || 0) + 1;
  return sbild(datei, best);
}
function sbild(datei, eigen) { const b = eigen || S.bilder[datei]; return b ? `<img class="sbild" src="/${esc(b)}" alt="" width="56" height="42" loading="lazy" decoding="async">` : '<i class="sbild sbild--leer" aria-hidden="true"></i>'; }
/* Tor 30.10.2026: ein kurzer Weg liess die Besuchskarte zur Hälfte leer. Die freie Höhe zeigt die Seite, auf der der Gast ankam; bei einem langen Weg bleibt dafür kein Platz und das Bild entfällt. */
const buehne = b => { const s = b.weg && b.weg[0] && S.bilder[b.weg[0].s]; return s ? `<figure class="besuch__buehne" aria-hidden="true"><img src="/${esc(s)}" alt="" loading="lazy" decoding="async"></figure>` : ''; };
/* Tor 30.10.2026: die letzten zwei Wörter bleiben zusammen («Frankfurt am Main, Deutschland» liess «Deutschland» allein stehen) */
const zusammen = t => { if (/\S{25,}/.test(String(t)) || String(t).length > LANG_MAX) return tx(t); const w = esc(t).split(' '); return w.length < 3 ? w.join(' ') : w.slice(0, -2).join(' ') + ' <span style="white-space:nowrap">' + w.slice(-2).join(' ') + '</span>'; };
const mitBild = (datei, wechsel) => `<span class="mit-bild">${wechsel ? fbild(datei) : sbild(datei)}<span>${tx(seite(datei))}</span></span>`;
function dauer(sek, kurz) {
  if (sek == null) return '–';
  if (sek < 60) return sek + (kurz ? ' s' : (sek === 1 ? ' second' : ' seconds'));
  const m = Math.floor(sek / 60), s = sek % 60;
  if (kurz || m < 10) return m + ' min' + (s ? ' ' + s + ' s' : '');
  return m + ' minutes';
}
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function tagWort(iso, lang) {
  const d = new Date(iso + 'T12:00:00'), h = new Date(S.d.bis + 'T12:00:00'), diff = Math.round((h - d) / 864e5);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return lang ? WTAG[(d.getDay() + 6) % 7] + ', ' + d.getDate() + ' ' + d.toLocaleDateString('en-GB', { month: 'long' }) : WTAG[(d.getDay() + 6) % 7].slice(0, 3) + ' ' + d.getDate() + ' ' + MON[d.getMonth()];
}
const datum = iso => { const t = String(iso || '').split('-'); return t.length === 3 ? +t[2] + ' ' + MON[+t[1] - 1] + ' ' + t[0] : ''; };
const kurzDatum = iso => +iso.slice(8) + ' ' + MON[+iso.slice(5, 7) - 1];
function nicht() { try { return localStorage.getItem(MERK) === '1'; } catch (e) { return false; } }
function prozent(x, stellen = 1) { return Number(x).toLocaleString('en-US', { maximumFractionDigits: stellen }) + '%'; }
function quit(titel, text, fehl = false, zeit = 5000) {
  const q = document.createElement('div');
  q.className = 'quit' + (fehl ? ' fehl' : '');
  q.innerHTML = `<div><b>${esc(titel)}</b>${text ? `<span>${esc(text)}</span>` : ''}</div>`;
  const x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 9.67 2.67 6.33 6 3M2.67 6.33h7.33a3.33 3.33 0 0 1 0 6.67h-2"/></svg>'; x.onclick = () => q.remove(); q.appendChild(x);
  $('#meldung').appendChild(q);
  while ($('#meldung').children.length > 3) $('#meldung').firstChild.remove();
  if (zeit) setTimeout(() => q.remove(), zeit);
}
function heuteHannover() {   /* Tag in Siargao (Asia/Manila); Name der Vorlage behalten */
  try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}
function schiebe(iso, tage) { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + tage); return d.toISOString().slice(0, 10); }

/* ---------- Daten ---------- */
async function lade() {
  /* Testschalter: Testdaten aus den abgelegten Dateien, auf heute geschoben und genau auf jetzt gekürzt. Dieselbe Rechnung macht der Dienst
     (registre.py ablage_heute) für das Control panel, damit beide dieselben Zahlen zeigen. Die echte Ansicht fragt immer den Dienst. */
  if (S.beispiel) return ablageLaden();
  let r, d = {};
  try { r = await fetch('../../api/registre?tage=' + S.tage, { cache: 'no-store' }); }
  catch (e) { if (!S.beispiel) throw new Error('The server does not answer.'); return ablageLaden(); }
  try { d = await r.json(); } catch (e) { if (!S.beispiel) throw new Error('The answer could not be read (' + r.status + ').'); return ablageLaden(); }
  /* Robert 28.11.2026 (Abnahme, Frage 3): online, solange Cloudflare Web Analytics nicht angeschlossen ist (Worker 503 EINRICHTUNG), öffnet Visitors
     mit den Testdaten wie auf dem Mac, das Band sagt dazu, dass Cloudflare noch nicht angeschlossen ist. «Back to real visits» zeigt dann die Tür. */
  if (!r.ok && /^EINRICHTUNG/.test(String(d.fehler || '')) ) { ohneCf(true); if (!echtGewaehlt()) { S.beispiel = true; return ablageLaden(); } }
  if (!r.ok) { if (!S.beispiel) throw new Error(String(d.fehler || ('Error ' + r.status)).replace(/^[A-ZÄÖÜ]+ · /, '')); return ablageLaden(); }
  ohneCf(false);
  /* Solange noch kein Besuch gezählt ist, öffnet Visitors mit den Testdaten (Robert 27.11.2026: «dort bitte auch einmal Beispieldaten eintragen»),
     überall als Testdaten beschriftet. «Back to real visits» zeigt die echte, leere Ansicht und bleibt so, bis der Tab geschlossen wird. */
  if (d.leer && !d.beispiel && !echtGewaehlt()) { S.beispiel = true; return ablageLaden(); }
  S.d = d; S.ablage = false;
  if (d.beispiel) S.beispiel = true;   /* antwortet der Dienst mit Beispielwerten (Vorführung, falscher Schlüssel), steht das auch so da */
}
async function ablageLaden() {   /* abgelegte Beispielwerte (registre.py ablage), Tage auf heute geschoben */
  let r;
  try { r = await fetch('beispiel/' + S.tage + '.json', { cache: 'no-store' }); } catch (e) { throw new Error('Neither the server nor the test data can be reached.'); }
  if (!r.ok) throw new Error('The test data is missing (' + r.status + ').');
  const d = await r.json(), um = Math.round((new Date(heuteHannover() + 'T12:00:00Z') - new Date(d.bis + 'T12:00:00Z')) / 864e5);
  if (um) {
    ['von', 'bis', 'seit'].forEach(k => { if (d[k]) d[k] = schiebe(d[k], um); });
    d.vorher.von = schiebe(d.vorher.von, um); d.vorher.bis = schiebe(d.vorher.bis, um);
    d.je_tag.forEach(t => t.tag = schiebe(t.tag, um));
    d.besuche.forEach(b => b.tag = schiebe(b.tag, um));
    /* Jeder Besuch rückt um «um» Tage, also auch um «um» Wochentage: das Raster Wochentag × Stunde dreht mit (sonst stünde der Besuch von heute beim Wochentag der Ablage) */
    const r7 = d.raster.slice(); d.raster = r7.map((_, w) => r7[((w - um) % 7 + 7) % 7]);
  }
  S.uhr = jetztHannover();   /* Uhrzeit in Hannover (Europe/Berlin), auf die gekürzt wurde */
  if (d.roh && d.roh.heute_voll) kuerzen(d, S.uhr);
  d.wochen = wochenAus(d.je_tag);   /* Montag bis Sonntag nach den verschobenen Tagen */
  delete d.roh;
  S.d = d; S.ablage = true; S.beispiel = true;
}
function jetztHannover() {
  try { return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date()); }
  catch (e) { return new Date().toTimeString().slice(0, 8); }
}
/* Runden wie Python round(): genau am Dezimalwert der Zahl, bei genau halb zur geraden Ziffer (sonst wichen die Zahlen der Ablage um eins vom Dienst ab) */
function pyRund(x, st = 0) {
  if (x == null || !isFinite(x)) return x;
  const t = Math.abs(x).toFixed(st + 30), i = t.indexOf('.'), kopf = t.slice(0, i + 1 + st).replace('.', ''), rest = t.slice(i + 1 + st);
  let k = BigInt(kopf.replace(/^$/, '0'));
  if (rest[0] > '5' || (rest[0] === '5' && /[1-9]/.test(rest.slice(1))) || (rest[0] === '5' && !/[1-9]/.test(rest.slice(1)) && k % 2n === 1n)) k += 1n;
  const z = Number(k) / 10 ** st;
  return x < 0 ? -z : z;
}
const ART = { karte: ['menu.html'], abend: [], essen: ['juices.html'], erleben: ['playground.html', 'pool.html'], feste: [], weg: ['visit.html'] };   /* wie registre.py art_von */
const artVon = s => s === 'index.html' ? 'start' : Object.keys(ART).find(k => ART[k].includes(s)) || 'sonst';
const rang = (l, n) => l.filter(x => x.n > 0).sort((a, b) => b.n - a.n || (String(a.k) < String(b.k) ? -1 : String(a.k) > String(b.k) ? 1 : 0)).slice(0, n);
function wochenAus(jt) {   /* wie registre.py: Woche Montag bis Sonntag, angebrochene am Rand */
  const w = [];
  jt.forEach(t => {
    const d = new Date(t.tag + 'T12:00:00Z'), mo = schiebe(t.tag, -((d.getUTCDay() + 6) % 7)), x = w.length && w[w.length - 1].mo === mo ? w[w.length - 1] : null;
    if (x) { x.bis = t.tag; x.tage++; x.besuche += t.besuche; x.buchung += t.buchung; }
    else w.push({ mo, von: t.tag, bis: t.tag, tage: 1, besuche: t.besuche, buchung: t.buchung });
  });
  return w.map(({ mo, ...x }) => x);
}
/* Die Ablage enthält heute den ganzen Tag. Was nach der jetzigen Uhrzeit in Hannover begänne, fällt hier weg, aus jeder Zahl genau wie im Dienst
   (registre.py lässt diese Besuche aus). Die Rohsummen (d.roh) machen das ohne Schätzen möglich. */
function kuerzen(d, jetzt) {
  const R = d.roh, u = d.summe, L = d.je_tag.length - 1, heute = d.bis;
  const weg = d.besuche.filter(b => b.tag === heute && (b.zs || b.z + ':00') > jetzt);
  const minus = (liste, k, l) => { const x = liste.find(y => y.k === k && (l === undefined || y.l === l)); if (x) x.n--; };
  const SS = new Map(R.S.map(([e, a, g, z]) => [e + '|' + a + '|' + g, z]));
  const wtag = (new Date(heute + 'T12:00:00Z').getUTCDay() + 6) % 7;
  weg.forEach(b => {
    u.besuche--; u.seiten -= b.seiten; if (b.buchung) u.buchung--; if (b.anfrage) u.anfrage--; if (b.kontakt) u.kontakt--; if (b.route) u.route--; u.heute--;
    if (b.dauer > 0) { R.dauer[0] -= b.dauer; R.dauer[1]--; }
    const t = d.je_tag[L]; t.besuche--; t.seiten -= b.seiten; if (b.buchung) t.buchung--;
    const l = b.l || '??'; minus(R.laender, l); if (R.land_tag[l]) R.land_tag[l][L]--;
    if (b.o) minus(R.orte, b.o, b.l);
    minus(d.sprachen, b.sp); minus(d.geraete, b.g); minus(R.herkunft, b.h);
    const h = +b.z.slice(0, 2); d.stunden[h]--; d.raster[wtag][h]--;
    const pb = platzBis(b.weg);
    b.weg.forEach((x, i) => {
      const s = d.seiten.find(y => y.s === x.s); if (s) { s.n--; if (i <= pb) s.buchung--; }
      if (x.sek > 0 && R.seiten_sek[x.s]) { R.seiten_sek[x.s][0] -= x.sek; R.seiten_sek[x.s][1]--; }
      const a = artVon(x.s); ['seite'].concat(x.e || [], i <= pb ? ['platz'] : []).forEach(e => { const k = e + '|' + a + '|' + b.g; SS.set(k, (SS.get(k) || 0) - 1); });
    });
  });
  if (!weg.length) { d.besuche = d.besuche.slice(0, 400); return; }   /* wie registre.py _kuerzen: auch ohne Wegfallendes die neuesten 400 (Prüfung 17.10.2026: nach dem letzten Besuch des Tages standen 432 statt 400) */
  const raus = new Set(weg);
  d.besuche = d.besuche.filter(b => !raus.has(b)).slice(0, 400);
  u.dauer_mittel = R.dauer[1] ? pyRund(R.dauer[0] / R.dauer[1]) : null;
  u.seiten_je_besuch = u.besuche ? pyRund(u.seiten / u.besuche, 1) : null;
  u.laender = R.laender.filter(x => x.n > 0 && x.k !== '??' && x.k !== '').length;
  d.laender = rang(R.laender, 20); d.herkunft = rang(R.herkunft, 14); d.sprachen = rang(d.sprachen, 12); d.geraete = rang(d.geraete, 12);
  d.orte = R.orte.filter(x => x.n > 0).sort((a, b) => b.n - a.n || (a.k < b.k ? -1 : a.k > b.k ? 1 : a.l < b.l ? -1 : a.l > b.l ? 1 : 0)).slice(0, 20);
  d.seiten = d.seiten.filter(x => x.n > 0).map(x => { const q = R.seiten_sek[x.s]; return Object.assign(x, { sek: q && q[1] ? pyRund(q[0] / q[1]) : null }); })
    .sort((a, b) => b.n - a.n || (a.s < b.s ? -1 : a.s > b.s ? 1 : 0));
  const top = rang(R.laender, 5).map(x => x.k).filter(k => k !== '??').slice(0, 4);
  d.land_verlauf = top.map(k => ({ k, n: R.land_tag[k] || d.je_tag.map(() => 0) }));
  const sum = (e, a, g) => { let z = 0; SS.forEach((v, k) => { const [e2, a2, g2] = k.split('|'); if (e2 === e && (a == null || a2 === a) && (g == null || g2 === g)) z += v; }); return z; };
  d.werte = werteAus(sum);
  const mit = d.je_tag.filter(t => t.besuche); d.seit = mit.length ? mit[0].tag : null; d.leer = !u.besuche;
}

/* Stelle der Seite, auf der ein Besuch zum Platz kam, sonst -1 (wie registre.py platz_bis): jede Seite bis dahin lag auf dem Weg zum Platz */
const platzBis = weg => weg.findIndex(x => (x.e || []).some(e => ZUR_BUCHUNG.includes(e)));
/* Die neun Werte «Zum Platz», dieselbe Rechnung wie registre.py werte_aus */
function werteAus(sum) {   /* The Cat & Gun: «on the way» = angerufen oder Route geöffnet; Schlüssel der neun Werte wie in allen Häusern, Bedeutung bei registre.py werte_aus */
  const wert = (z, v, mehr) => Object.assign({ zahl: z, von: v, anteil: v ? pyRund(Math.min(100, 100 * z / v), 1) : null }, mehr || {});
  const auf = sum('seite');
  return { start: wert(sum('platz', 'start'), sum('seite', 'start')), karte: wert(sum('platz', 'karte'), sum('seite', 'karte')),
    booking: wert(sum('anruf'), sum('anruf') + sum('route'), { anfrage: sum('route') }), abbruch: wert(Math.max(0, sum('seite', 'weg') - sum('platz', 'weg')), sum('seite', 'weg')),
    tisch: wert(sum('platz', 'erleben'), sum('seite', 'erleben')),
    anfrage: wert(sum('platz', 'essen'), sum('seite', 'essen')),
    kontakt: wert(sum('anruf') + sum('mail'), auf, { anruf: sum('anruf'), mail: sum('mail') }), chat: wert(sum('chat'), auf, { dc: sum('chat', 'karte') }),
    route: wert(sum('route'), auf, { weg: sum('route', 'weg') }) };
}

/* ---------- Rahmen: neuer Look des Control panels (26.11.2026) ----------
   Vorlage _entwurf-dashboard/visitors-bereich: Seitenleiste wie im Control panel (Marke, die acht Werkzeuge mit Tasten 1–8, Öffnungszeit und Telefon, Guides),
   Kopfkarte mit geschwungenem Foto, die acht Ansichten als Reiter darin, unten die Leiste mit Stand und Knöpfen. Ids, data-gehe und Klick-Handler bleiben. */
const STUBE = MAISON;
/* Namen der Werkzeuge: nur aus dem Kleid des Hauses (kleid/catgun.js → WO_HAUS.namen, einzige Stelle), hier nie abgetippt.
   NAME am Satzanfang («Visitors»), KLEIN im Satz (Englisch ohne Artikel: gleich). */
const NAME = WO.name('besuche'), KLEIN = NAME, STUBE_N = WO.name('zentrale');
/* Symbole aus der Vorlage (runde2/bau.py ICONS, visitors-bereich/bau.py) */
const IC = {"web": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18\"/>", "menu": "<path d=\"M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 0-3 3-3 7h3v11\"/>", "chat": "<path d=\"M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z\"/>", "buch": "<path d=\"M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z\"/><path d=\"M4 19a2 2 0 0 1 2-2h13\"/>", "palette": "<path d=\"M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.8-1.8 0-1.3-1-1.6-1-2.6 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3Z\"/><circle cx=\"7.5\" cy=\"11\" r=\"1\"/><circle cx=\"10\" cy=\"7\" r=\"1\"/><circle cx=\"15\" cy=\"7.5\" r=\"1\"/>", "sticker": "<path d=\"M15 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6l9-9V9a6 6 0 0 0-6-6Z\"/><path d=\"M12 21v-4a5 5 0 0 1 5-5h4\"/>", "druck": "<path d=\"M6 9V3h12v6\"/><rect x=\"3\" y=\"9\" width=\"18\" height=\"8\" rx=\"2\"/><path d=\"M6 14h12v7H6z\"/>", "besuch": "<path d=\"M4 20V10M10 20V4M16 20v-7M22 20H2\"/>", "uhr": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/>", "tel": "<path d=\"M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2\"/>", "guide": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"3\"/><path d=\"m10 9 5 3-5 3V9Z\"/>", "haus": "<path d=\"M3 11 12 4l9 7v9H3z\"/><path d=\"M9 20v-6h6v6\"/>", "seiten": "<rect x=\"4\" y=\"3\" width=\"12\" height=\"16\" rx=\"2\"/><path d=\"M8 21h10a2 2 0 0 0 2-2V7\"/>", "weg": "<path d=\"M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z\"/><circle cx=\"12\" cy=\"10\" r=\"2.5\"/>", "flagge": "<path d=\"M5 21V4M5 4h11l-2 4 2 4H5\"/>", "link": "<path d=\"M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1\"/><path d=\"M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1\"/>", "insta": "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/><circle cx=\"17.5\" cy=\"6.5\" r=\".8\"/>", "google": "<path d=\"M20 12.2c0-.6-.1-1.2-.2-1.7H12v3.3h4.5a4 4 0 0 1-1.7 2.6v2.2h2.8A8.6 8.6 0 0 0 20 12.2Z\"/><path d=\"M12 21c2.4 0 4.4-.8 5.6-2.2l-2.8-2.2c-.8.5-1.7.8-2.8.8a5 5 0 0 1-4.7-3.4H4.4v2.2A9 9 0 0 0 12 21Z\"/>", "pin": "<path d=\"M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z\"/><circle cx=\"12\" cy=\"10\" r=\"2.5\"/>", "fb": "<path d=\"M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8Z\"/>", "handy": "<rect x=\"7\" y=\"2.5\" width=\"10\" height=\"19\" rx=\"2.5\"/><path d=\"M11 18.5h2\"/>", "tablet": "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"/><path d=\"M11 18h2\"/>", "rechner": "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"/><path d=\"M8 20h8M12 16v4\"/>", "schloss": "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8 11V7a4 4 0 0 1 8 0v4\"/>", "auge": "<path d=\"M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "speichern": "<path d=\"M5 3h11l3 3v15H5z\"/><path d=\"M8 3v5h7V3M8 21v-7h8v7\"/>", "verlauf": "<path d=\"M3 12a9 9 0 1 0 3-6.7L3 8\"/><path d=\"M3 3v5h5M12 7v5l3 2\"/>", "play": "<path d=\"M8 5v14l11-7z\" fill=\"currentColor\" stroke=\"none\"/>", "pfeil": "<path d=\"M5 12h14M13 6l6 6-6 6\"/>", "trend": "<path d=\"M3 17l6-6 4 4 8-8M15 7h6v6\"/>", "kalender": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"3\"/><path d=\"M3 10h18M8 3v4M16 3v4\"/>", "zurueck": "<path d=\"M9 14 4 9l5-5\"/><path d=\"M4 9h11a5 5 0 0 1 0 10h-3\"/>"};
const ic = (n, k = '') => `<svg class="ico${k ? ' ' + k : ''}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || IC.pfeil}</svg>`;
const pf = () => `<span class="pf">${ic('pfeil')}</span>`;
const wk = (text, i, attr = '', art = '') => `<button type="button" class="wk${art ? ' ' + art : ''}" ${attr}>${i ? ic(i) : ''}${text}</button>`;
function heuteSeiten() { const t = S.d && S.d.je_tag && S.d.je_tag[S.d.je_tag.length - 1]; return t && t.tag === S.d.bis ? t.seiten || 0 : 0; }
function stand() {
  if (!S.d) return '';
  const u = S.d.summe, h = 'Today ' + n(u.heute || 0) + ' ' + ((u.heute || 0) === 1 ? 'visit' : 'visits') + ' · ' + n(heuteSeiten()) + ' ' + (heuteSeiten() === 1 ? 'page' : 'pages');
  if (S.beispiel) return 'Test data · t' + h.slice(1);
  return S.d.besuche_fehlen ? mal(u.besuche, 'One visit', 'visits') + ' in ' + n(S.d.tage) + ' days' : h;
}
function kopfLeiste() {   /* schmal (unter 1181 px) steht die Seitenleiste nicht: oben die Marke und der Weg zum Control panel */
  $('#kopf').innerHTML = `<a class="marke" href="${esc(STUBE)}" aria-label="${esc(STUBE_N)}"><img src="look/wortmarke-weiss.svg" alt="The Cat &amp; Gun" width="74" height="40"><span class="mono">${ic('besuch', 'mi')}${esc(NAME)}</span></a>
    <a class="wk" href="${esc(STUBE)}">${ic('haus')}${esc(STUBE_N)}</a>`;
}
/* Seitenleiste genau wie bei Edit website, auf jeder Seite gleich (leiste.js und leiste.css, Robert 27.11.2026); fährt ab 1200 px mit, Tasten 1–8 in leiste.js */
function rand() {
  LEISTE.setze($('#rand'), 'registre', stand());
  $$('#rand [data-gehe]').forEach(a => a.onclick = e => { e.preventDefault(); gehe(a.dataset.gehe); });
  kopfLeiste();
}
function leiste() {
  const d = S.d, u = d.summe;
  const satz = d.leer ? '' : 'Last ' + n(d.tage) + ' days: ' + mal(u.besuche, 'one visit', 'visits') + (u.laender ? ' from ' + mal(u.laender, 'one country', 'countries') : '') + (d.besuche_fehlen ? '.' : ', ' + (u.buchung ? n(u.buchung) : 'none') + ' on the way.');
  const titel = S.beispiel ? 'You are looking at test data' : stand();
  const kn = (S.beispiel ? wk('Back to real visits', 'zurueck', 'id="l-echt"', 'gold') : wk('Show test data', 'auge', 'id="l-bsp"'))
    + wk('Save as table', 'speichern', 'id="l-export" title="All visits of the chosen period as a table (CSV, opens in Excel, Numbers and Google Sheets)"')
    + (S.beispiel ? '' : wk('Reload', 'verlauf', 'id="l-neu"'));
  const mitte = S.beispiel ? `<span class="wsatz">Made up, so you can see how ${esc(KLEIN)} looks with visits.</span>` : satz ? `<span class="wsatz">${esc(satz)}</span>` : '<span class="mono wsatz">Here you only read</span>';
  $('#leiste').innerHTML = `<span class="stp">${ic('besuch')}${esc(titel)}</span>${mitte}<span class="wr">${kn}</span>`;
  $('#l-export').onclick = () => sichern();
  if ($('#l-neu')) $('#l-neu').onclick = () => frisch(true);
  if ($('#l-echt')) $('#l-echt').onclick = () => beispiel(false);
  if ($('#l-bsp')) $('#l-bsp').onclick = () => beispiel(true);
}
/* Je Ansicht ein eigenes Foto des Hauses in der Kopfkarte (website/assets/bild/<schlüssel>-1200.webp); Übersicht und Origin wie in der Vorlage (b19, b29).
   Nie ein Foto, das die Ansicht darunter als Seitenbild zeigt (fbild meidet das Kopfbild). */
const BUEHNE = { start: ['b19', '50% 50%'], besuche: ['b27', '50% 45%'], herkunft: ['b29', '50% 60%'], zeit: ['b22', '50% 50%'], seiten: ['b26', '50% 55%'], verlauf: ['b35', '50% 50%'], buchung: ['b31', '50% 30%'], zaehlung: ['b32', '50% 50%'] };
function kopf(mono, titel, satz, rechts = '') {
  const [bild, lage] = BUEHNE[S.ansicht] || BUEHNE.start, voll = S.ansicht === 'start';
  const tabs = BEREICHE.filter(x => x[0]).map(([k, name]) => `<a class="tab${S.ansicht === k ? ' an' : ''}" href="#${k}" data-gehe="${k}"${S.ansicht === k ? ' aria-current="page"' : ''}>${esc(name)}</a>`).join('');
  return `<section class="wkopf p${voll ? '' : ' klein'}"><img class="wkb" src="/the-cat-and-gun/haus/assets/bild/${bild}-1200.webp" alt="" style="object-position:${lage}" decoding="sync" fetchpriority="high">
    <div class="wki"><div class="mono">${ic('besuch', 'mi')}${voll ? esc(NAME + ' · ' + WO.haus.name) : esc(NAME + ' · ' + (TITEL[S.ansicht] || ''))}</div><h2>${esc(voll ? NAME : TITEL[S.ansicht] || NAME)}</h2>
      <p>${satz}</p>
      <div class="wkst"><span class="stp"><i class="pt ku"></i>${esc(stand())}</span><a class="wk" href="../../index.html" target="_blank" rel="noopener">${ic('web')}View website</a>${wk('Short tour', 'play', 'data-rundgang')}${rechts}</div></div>
    <nav class="tabs" aria-label="Views">${tabs}</nav></section>`;
}
function zeitraum() {
  const k = t => `<button type="button" data-tage="${t}" class="${S.tage === t ? 'an' : ''}" aria-pressed="${S.tage === t}">${t} days</button>`;
  return `<div class="seg zeit zeitraum" role="group" aria-label="Period">${k(7)}${k(30)}${k(90)}</div>`;
}
const st = (i, t, s) => `<div class="stitel"><span class="snr">${ic(i)}</span><div><h3>${t}</h3><span class="mono">${s}</span></div></div>`;
/* Herkunft: Symbol je Quelle (Vorlage QUELLEN), sonst das Netz */
const QSYM = { 'Instagram': 'insta', 'Google': 'google', 'Google Maps': 'pin', 'Facebook': 'fb', 'TravelGO': 'web', 'Typed in directly': 'link' };
const QUELLEN = ['Instagram', 'Google', 'Google Maps', 'Facebook', 'TravelGO', 'Typed in directly'];
/* Robert 28.11.2026: bei «Came from» die echten Logos (Simple Icons, gemeinfrei; Google-«G» in seinen vier Farben; TravelGO: Zeichen von travelgo.ph).
   Für «Typed in directly», Bing, ChatGPT und unbekannte Quellen bleibt das Zeichen des Hauses. */
const QLOGO = { 'Instagram': 'instagram.svg', 'Google': 'google.svg', 'Google Maps': 'googlemaps.svg', 'Facebook': 'facebook.svg', 'TikTok': 'tiktok.svg', 'Tripadvisor': 'tripadvisor.svg', 'TravelGO': 'travelgo.png' };
const quelleZ = (k, klasse) => QLOGO[k] ? `<span class="${klasse} qlogo"><img src="look/logo/${QLOGO[k]}" alt="" decoding="async"></span>` : `<span class="${klasse}">${ic(QSYM[k] || 'web')}</span>`;
/* Liste der Vorlage (.dl.vdl): Symbol oder Foto, Name mit Balken darunter, rechts Zahl und Anteil; leer mit grauem Balken und «–» */
function dliste(liste, kopfteil, name, ges, klein) {
  const max = Math.max(1, ...liste.map(x => x.n || 0));
  return `<ul class="dl vdl${klein ? ' vimg' : ''}">${liste.map((x, i) => `<li style="--i:${i}">${kopfteil(x)}<div><b>${name(x)}</b>${x.n == null ? '<i class="grau"></i>' : `<span class="bal"><i style="--w:${Math.max(.02, x.n / max).toFixed(3)}"></i></span>`}</div>
    <span class="dz">${x.n == null ? '–' : n(x.n) + (ges ? `<em>${Math.round(100 * x.n / ges)}%</em>` : '')}</span></li>`).join('')}</ul>`;
}
/* Prüfung 22.11.2026, Abweichung 2: feste Sätze nur, was die Quelle wirklich zählt. Einzelne Besuche (Ort, Zeit je Seite, Taps) gibt es nur in den Testdaten
   (und in einer lokalen Zählung mit Besuchen). Die echte Ansicht online kommt von Cloudflare Web Analytics: Seiten, Länder, Geräte, Herkunft, Tage und Stunden. */
const einzeln = () => !!(S.d && !S.d.besuche_fehlen && !S.d.leer);
function hinweisBeispiel() {
  if (S.beispiel) return `<p class="bsp-band"><b>Test data.</b> These numbers are made up. They show how ${KLEIN} looks with visits. The real numbers come from Cloudflare Web Analytics once the website is online: pages, countries, devices and where guests came from. Single visits are not part of it.${ohneCf() ? ' Cloudflare Web Analytics is not connected yet.' : ''}</p>`;
  /* Cloudflare Web Analytics zählt Seiten, Länder, Geräte und Herkunft, aber keinen einzelnen Besuch (kein Cookie): das steht offen da, statt leerer Felder */
  return S.d && S.d.besuche_fehlen ? `<p class="bsp-band bsp-band--cf"><b>From Cloudflare.</b> Cloudflare counts pages, countries, devices and where guests came from. It does not link pages to one visit, so town, language, time on a page and the taps on Call, Directions, Instagram and TravelGO are not counted.</p>` : '';
}
function gehe(ziel, wahl) {
  if (!TITEL[ziel]) ziel = 'start';
  /* Besuch in der Liste wählen: nur die Karte rechts wechselt, die Seite bleibt, wo sie ist (Vorlage Grand Beau-Rivage, Robert 15.10.2026: «springe immer wieder nach oben») */
  const fach = $('#ansicht .detail');
  if (ziel === 'besuche' && S.ansicht === 'besuche' && wahl !== undefined && fach && S.d.besuche[+wahl]) {
    S.wahl = +wahl;
    $$('#ansicht .liste .besuch').forEach(a => { const an = +a.dataset.wahl === S.wahl; a.classList.toggle('aktiv', an); a.setAttribute('aria-pressed', an); });
    fach.innerHTML = detail(S.d.besuche[S.wahl]);
    $('#rand').classList.remove('auf');
    if (matchMedia('(max-width:1180px)').matches && fach.getBoundingClientRect().top < 0) window.scrollBy({ top: fach.getBoundingClientRect().top - 90, behavior: 'instant' });   /* schmal steht die Karte über der Liste */
    return;
  }
  const neu = ziel !== S.ansicht;
  S.ansicht = ziel;
  if (wahl !== undefined) S.wahl = +wahl || 0;
  if (location.hash.slice(1) !== ziel) history.replaceState(null, '', location.pathname + location.search + '#' + ziel);
  rand(); zeichne();
  if (neu) window.scrollTo(0, 0);
  $('#rand').classList.remove('auf');
}
async function frisch(sagen = false) {
  try {
    await lade();
    if (S.wahl >= S.d.besuche.length) S.wahl = 0;
    rand(); leiste(); zeichne();
    if (sagen) quit('Reloaded', '', false, 2500);
  } catch (e) { quit(NAME + ' cannot be loaded right now', e.message, true, 0); }
}
/* gemerkt, solange der Tab offen ist: Cloudflare ist noch nicht angeschlossen (der Testschalter fragt den Dienst nicht, das Band soll es trotzdem sagen) */
function ohneCf(an) { try { if (an === true) sessionStorage.setItem('catgun-registre-ohne-cf', '1'); else if (an === false) sessionStorage.removeItem('catgun-registre-ohne-cf'); return sessionStorage.getItem('catgun-registre-ohne-cf') === '1'; } catch (e) { return false; } }
function echtGewaehlt() { try { return sessionStorage.getItem('catgun-registre-echt') === '1'; } catch (e) { return false; } }
function beispiel(an) {
  try { if (an) sessionStorage.removeItem('catgun-registre-echt'); else sessionStorage.setItem('catgun-registre-echt', '1'); } catch (e) { /* privat */ }
  if (!an && ohneCf()) { history.replaceState(null, '', location.pathname + '#' + S.ansicht); location.reload(); return; }   /* Cloudflare noch nicht angeschlossen: die echte Ansicht ist die Tür, neu geöffnet */
  S.beispiel = an; S.wahl = 0; S.zeige = 40;
  history.replaceState(null, '', location.pathname + (an ? '?beispiel=1' : '') + '#' + S.ansicht);
  frisch();
}

/* ---------- Datenexport (Website-Bau-Master 9d Punkt 21, Prüfung 16.10.2026): alle Besuche des Zeitraums als Tabelle, ohne uns ----------
   Echte Werte: der Dienst gibt alle Besuche des Zeitraums heraus (?export=1), nicht nur die neuesten 400; online (Cloudflare) die Seiten und Ranglisten.
   Testdaten: was die Liste zeigt, im Dateinamen und in der ersten Spalte als Testdaten gekennzeichnet. Nur Angaben, die das Besucherbuch ohnehin zeigt: kein Name, keine Adresse, kein Kürzel. */
function zelle(x) {
  let t = String(x == null ? '' : x);
  if (/^[=+\-@\t\r]/.test(t)) t = "'" + t;   /* keine Formeln in Excel (CSV-Einschleusung) */
  return /[";\r\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
}
function tabelle(liste, bsp) {
  const kopf = ['Kind', 'Day', 'Time', 'Country', 'Town', 'Region', 'Device', 'Browser language', 'Came from', 'Stayed (seconds)', 'Pages', 'Path through the website']
    .concat(REIHE.map(k => EREIGNIS[k]));
  const hat = (b, e) => b.weg.some(x => (x.e || []).includes(e)) ? 'yes' : 'no';
  const zeilen = liste.map(b => [bsp ? 'Test data' : 'Visit', b.tag, b.z, land(b.l), b.o, b.r, GERAET[b.g] || b.g, SPRACHE[b.sp] || b.sp, b.h, b.dauer, b.seiten,
    b.weg.map(x => seite(x.s) + ' (' + x.sek + ' s)').join(' > ')].concat(REIHE.map(k => hat(b, k))));
  return '\ufeff' + [kopf].concat(zeilen).map(z => z.map(zelle).join(';')).join('\r\n') + '\r\n';
}
/* Online (Cloudflare): keine einzelnen Besuche, also die Zahlen je Tag, je Seite und die Ranglisten, so wie sie das Werkzeug zeigt */
function tabelleSummen(d) {
  const z = [['Kind', 'Day or name', 'Visits', 'Page views']];
  d.je_tag.forEach(t => z.push(['Day', t.tag, t.besuche, t.seiten]));
  d.seiten.forEach(x => z.push(['Page', seite(x.s), '', x.n]));
  d.laender.forEach(x => z.push(['Country', land(x.k) || 'Not known', x.n, '']));
  d.herkunft.forEach(x => z.push(['Came from', x.k, x.n, '']));
  d.geraete.forEach(x => z.push(['Device', GERAET[x.k] || x.k, x.n, '']));
  return '\ufeff' + z.map(r => r.map(zelle).join(';')).join('\r\n') + '\r\n';
}
async function sichern() {
  const d = S.d, bsp = S.beispiel;
  try {
    let liste = d.besuche;
    if (!bsp && !d.besuche_fehlen) {
      const r = await fetch('../../api/registre?export=1&tage=' + S.tage, { cache: 'no-store' });
      const x = await r.json().catch(() => ({}));
      if (!r.ok || !Array.isArray(x.besuche)) throw new Error(String(x.fehler || 'The server did not hand out the visits (' + r.status + ').').replace(/^[A-ZÄÖÜ]+ · /, ''));
      liste = x.besuche;
    }
    const name = 'visitors-catgun-' + d.von + '-to-' + d.bis + (bsp ? '-test-data' : '') + '.csv';
    const url = URL.createObjectURL(new Blob([!bsp && d.besuche_fehlen ? tabelleSummen(d) : tabelle(liste, bsp)], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    quit('Saved as table', name + ' · ' + (!bsp && d.besuche_fehlen ? 'days, pages and lists' : mal(liste.length, 'one visit', 'visits')) + (bsp ? ' · test data' : '') + (bsp && d.summe.besuche > liste.length ? ' (the newest of the list)' : ''));
  } catch (e) { quit('The table could not be saved', e.message, true, 0); }
}

/* ---------- Bausteine ---------- */
function balken(liste, name, klein, gesamt) {   /* Rangliste: Name, Balken, Zahl, Anteil. Der Balken wächst nur über transform. */
  if (!liste.length) return '<p class="nichts">Nothing counted yet.</p>';
  /* Anteil an allen Besuchen (bzw. allen Aufrufen), nicht nur an den gezeigten Plätzen (Prüfung 16.10.2026: «Schweiz 57 %» neben «Aus der Schweiz 47 %») */
  const max = Math.max(...liste.map(x => x.n)), ges = gesamt || liste.reduce((a, x) => a + x.n, 0);
  return `<ol class="rang">${liste.map((x, i) => `<li style="--i:${i}"><span class="rang__n">${name(x)}${klein ? `<small>${klein(x)}</small>` : ''}</span>
    <span class="rang__b"><i style="--w:${Math.max(.02, x.n / max).toFixed(3)}"></i></span><b>${n(x.n)}</b><em>${Math.round(100 * x.n / ges)}%</em></li>`).join('')}</ol>`;
}
function vergleich(jetzt, vorher, umgekehrt) {
  if (jetzt == null || !vorher) return '<small class="vgl">&nbsp;</small>';
  const p = Math.round(100 * (jetzt - vorher) / vorher);
  if (!p) return '<small class="vgl">same as before</small>';
  const gut = umgekehrt ? p < 0 : p > 0;
  return `<small class="vgl ${gut ? 'gut' : 'weniger'}">${p > 0 ? SYM.hoch : SYM.runter}${p > 0 ? '+' : '−'}${Math.abs(p)}% on before</small>`;
}
function saeulen(werte, beschrift, tip, klasse = '', vorher) {
  const max = Math.max(1, ...werte, ...(vorher || []));
  /* Prüfung 5, Abweichung 1: am Handy lagen «18 Nov» und «23 Nov» übereinander. Jede zweite Marke, vom heutigen Tag aus gezählt, trägt .zw;
     registre.css blendet sie am Handy aus, die heutige Marke bleibt immer stehen. */
  const marken = werte.map((z, i) => beschrift(i)), nr = [];
  for (let i = marken.length - 1, k = 0; i >= 0; i--) if (marken[i]) nr[i] = k++;
  return `<div class="saeulen ${klasse}" style="--n:${werte.length}" role="img" aria-label="${esc(tip.label)}">
    ${werte.map((z, i) => `<div class="s" style="--i:${Math.round(i * 30 / werte.length)}" data-t="${esc(tip(i, z))}">${vorher ? `<u style="--h:${(vorher[i] / max).toFixed(3)}"></u>` : ''}<i style="--h:${z ? Math.max(.025, z / max).toFixed(3) : 0}"></i>${marken[i] ? `<span${nr[i] % 2 ? ' class="zw"' : ''}>${marken[i]}</span>` : ''}</div>`).join('')}
  </div>`;
}
/* Robert 28.11.2026: die Karte eines Besuchs zeigt den Ort, aus dem der Gast kam (look/ort/), sonst sein Land (look/land/), nicht ein Foto des Hauses */
function besuchBild(b) {
  const s = slug(b.o) + '-' + String(b.l || '').toLowerCase(), l = String(b.l || '');
  /* Orte mit vielen Gästen haben mehrere Bilder (ORT_VAR), die sich in einer Liste abwechseln, damit kein Bild öfter als dreimal steht (ZUG zählt je Liste) */
  let src = b.o && ORT_BILD.has(s) ? 'look/ort/' + s + '.webp' : LAND_BILD.has(l) ? 'look/land/' + l.toLowerCase() + '.webp' : '';
  if (src && ORT_VAR[s] && b.o) { const k = 'ort:' + s, z = ZUG[k] || 0; ZUG[k] = z + 1; const v = z % ORT_VAR[s]; if (v) src = 'look/ort/' + s + '-' + (v + 1) + '.webp'; }
  return src ? `<img class="sbild" src="${src}" alt="" width="56" height="42" loading="lazy" decoding="async">` : fbild(b.weg && b.weg[0] ? b.weg[0].s : '');
}
function karteBesuch(b, i, aktiv) {
  const hat = e => b.weg.some(x => (x.e || []).includes(e));
  const marke = b.buchung ? (hat('anruf') ? 'Called' : 'Directions') : b.anfrage ? (hat('mail') && hat('chat') ? '<span class="besuch__m">Instagram</span><span class="besuch__m">TravelGO</span>' : hat('mail') ? 'Instagram' : 'TravelGO') : tx(GERAET[b.g] || b.g || '');
  /* Tor 6 Fund 31 (30.10.2026): Seiten und Dauer sind zwei Teile; der Trenner «·» gehört zum zweiten und wird am Zeilenanfang abgeschnitten (culinarium.css),
     steht also nie am Anfang oder Ende einer Zeile. Das Etikett «Bar · Dirty Chicken» steht in schmalen Karten zweizeilig. */
  /* Demo-Check 21.10.2026: die Zeile unter dem Ort bricht nur zwischen Uhrzeit, Seiten und Dauer um, nie mitten in «5 Min. 28 Sek.» (culinarium.css lässt sie umbrechen statt kürzen) */
  return `<button class="besuch rg-a${b.buchung ? ' gold' : ''}${aktiv ? ' aktiv' : ''}" type="button" data-gehe="besuche" data-wahl="${i}" aria-pressed="${aktiv}">
    <span class="besuch__b">${besuchBild(b)}<span class="besuch__l">${esc(/^[A-Za-z]{2,3}$/.test(b.l || '') ? b.l : '–')}</span></span>
    <span class="besuch__n"><b>${zusammen(ort(b))}</b><small><i class="besuch__w">${esc(tagWort(b.tag) + ', ' + uhr(b.z)).replace(/ /g, '\u00a0')}</i><i class="besuch__t"> · </i><i class="besuch__r">${[mal(b.seiten, 'one page', 'pages')].concat(b.dauer ? [dauer(b.dauer, true)] : []).map(x => `<i class="besuch__s">${esc(x).replace(/ /g, '\u00a0')}</i>`).join('')}</i></small></span>
    <span class="besuch__z">${marke}<small>${tx(SPRACHE[b.sp] || b.sp)}</small></span></button>`;
}
function leer() {   /* leere Ansicht: das Foto mit dem Satz wie die Länderkarte der Vorlage, darunter die Erklärung und «Show test data» */
  const [bild] = BUEHNE[S.ansicht] || BUEHNE.start, foto = bild === 'b19' ? 'b24' : 'b19';
  return `<section class="wdt p vleer leer-blatt"><div class="mono">${ic('besuch', 'mi')}${esc(NAME + ' · ' + (TITEL[S.ansicht] || ''))}</div>
    <div class="karte"><img src="/the-cat-and-gun/haus/assets/bild/${foto}-800.webp" alt="" decoding="sync"><span>No visits counted yet</span></div>
    <p>The numbers come from Cloudflare Web Analytics once the website is online: which pages are opened, from which country, on which device and from which website. Until then nothing is counted here.</p>
    <div class="wr">${wk('Show test data', 'auge', 'data-bsp')}</div></section>`;
}


/* ---------- Ansichten ---------- */
function zeichne(ruhig) {
  const el = $('#ansicht');
  const f = { besuche, herkunft, zeit, seiten, verlauf, buchung, zaehlung }[S.ansicht] || start;
  el.innerHTML = f();
  $$('[data-gehe]', el).forEach(b => b.onclick = e => { e.preventDefault(); gehe(b.dataset.gehe, b.dataset.wahl); });
  $$('[data-tage]', el).forEach(b => b.onclick = () => { if (S.tage === +b.dataset.tage) return; S.tage = +b.dataset.tage; S.wahl = 0; S.zeige = 40; try { localStorage.setItem('catgun-registre-tage', S.tage); } catch (e) { /* privat */ } frisch(); });
  $$('[data-bsp]', el).forEach(b => b.onclick = () => beispiel(true));
  $$('[data-rundgang]', el).forEach(b => b.onclick = () => { if (window.rundgang) window.rundgang(); });
  $$('[data-sichern]', el).forEach(b => b.onclick = () => sichern());
  $$('[data-filter]', el).forEach(b => b.onclick = () => { S.filter = b.dataset.filter; S.wahl = -1; S.zeige = 40; zeichne(true); });
  $$('[data-mehr]', el).forEach(b => b.onclick = () => { S.zeige += 60; zeichne(true); });
  $$('[data-raster]', el).forEach(b => b.onclick = () => { S.raster = b.dataset.raster; zeichne(); });
  document.title = (TITEL[S.ansicht] || NAME) + ' · ' + NAME + ' · ' + WO.haus.name;
  schweben(el, ruhig);
}
/* Schweben (Gefühl der Carlton-Seiten, Rezeptur des Le Registre im Grand Beau-Rivage, Robert 16.10.2026: «darf nicht an den Scroll geknüpft sein, muss luxuriös
   reingeschwebt kommen»): Sobald ein Blatt am unteren Rand auftaucht, schwebt es nach der Uhr an seinen Platz (.rg-da). Balken und Säulen wachsen erst, wenn ihr Blatt
   gut zur Hälfte im Bild ist (.rg-los). */
let IO = null, IO_LOS = null;
function schweben(el, still) {
  if (IO) IO.disconnect();
  if (IO_LOS) IO_LOS.disconnect();
  const ziele = [];
  const nimm = (sel, reihe) => $$(sel, el).forEach(x => { if (x.dataset.r) return; x.dataset.r = '1'; x.style.setProperty('--i', reihe ? Math.min([...x.parentNode.children].indexOf(x), 3) : 0);   /* Staffel höchstens vier Schritte (Werkzeug-Master R17) */ ziele.push(x); });
  /* die Leiste unten (letzte Reihe wie in der Vorlage) schwebt einmal herein; solange sie noch nicht da war, wird sie in jeder Ansicht wieder beobachtet */
  const lst = $('#leiste'); if (lst && !lst.classList.contains('rg-da')) { lst.dataset.r = '1'; lst.style.setProperty('--i', 0); ziele.push(lst); }
  nimm('.bsp-band, .wahl3--filter, .band, .tabelle, .leer, h2.zw, .mehr, .wenig, #ansicht > .blatt, #ansicht > .tafel, #ansicht > .wdt, #ansicht > .vhin', false);   /* Abschnittstitel (.stitel) stehen still: im Einflug kreuzten sie die Kacheln darunter (Prüfpunkt 21, 27.11.2026) */
  nimm('.kkr > .kk, .zahlen > .blatt, .zwei > .blatt, .stapel > .blatt, .werte > .wert, .liste .besuch, .tabelle > .zeile:not(.zeile--kopf), .v4 > .v4k, .r2 > .wdt, .vq > .qk, .vg > .gk', true);   /* Zeilen langer Tabellen schweben einzeln herein (Mac-Prüfung 23.11.2026, Punkt 11) */
  const ruhig = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (still) { ziele.forEach(x => x.classList.add('rg-da', 'rg-los', 'rg-ruhig')); return; }   /* Neuzeichnen in derselben Ansicht (Filter, Weitere zeigen): nichts schwebt neu herein */
  if (ruhig || !('IntersectionObserver' in window)) { ziele.forEach(x => x.classList.add('rg-da', 'rg-los')); return; }
  const root = null;   /* die Seite scrollt als Ganzes (Oberfläche der Häuser: keine eigene Scrollfläche) */
  IO = new IntersectionObserver(es => { let k = 0; es.forEach(e => { if (e.isIntersecting) { e.target.style.setProperty('--i', Math.min(k++, 3)); e.target.classList.add('rg-da'); IO.unobserve(e.target); } }); }, { root, rootMargin: '0px 0px 8% 0px' });   /* Staffel nur unter denen, die gemeinsam auftauchen (wie schweben.js, Effekte-Standard 23.11.2026) */
  IO_LOS = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('rg-los'); IO_LOS.unobserve(e.target); } }), { root, threshold: .45 });
  ziele.filter(x => x.querySelector('.saeulen .s i,.rang__b i,.trichter li i,.vdl .bal i') || x.matches('.kk, .gk--bild')).forEach(x => IO_LOS.observe(x));
  ziele.filter(x => !x.querySelector('.saeulen .s i,.rang__b i,.trichter li i,.vdl .bal i') && !x.matches('.kk, .gk--bild')).forEach(x => x.classList.add('rg-los'));
  ziele.forEach(x => IO.observe(x));
}

function start() {
  const d = S.d, u = d.summe, v = d.vorher;
  const satzS = einzeln() ? 'Who visited your website: where guests come from, which pages they look at, how long they stay and who calls or looks up the way. No cookies are set and no names are stored.'
    : 'Who visited your website: from which country, from which website, on which device, and which pages they look at. No cookies are set and no names are stored.';
  let aus = kopf('', '', satzS, zeitraum()) + hinweisBeispiel();
  const zeitraumWort = 'Last ' + n(d.tage) + ' days';
  /* Vier Zahlen mit Foto (Vorlage .v4). Fotos des Hauses, die in dieser Ansicht sonst nirgends stehen (die Liste der Seiten meidet sie, ZUG unten). */
  const vgl = vergleich(u.besuche, v.besuche);
  const K = [['besuch', 'Visits', n(u.besuche), /&nbsp;/.test(vgl) ? `<i>${zeitraumWort}</i>` : vgl, 'b24'],
    ['seiten', 'Pages viewed', n(u.seiten), `<i>${u.seiten_je_besuch != null ? n(u.seiten_je_besuch) + ' per visit' : zeitraumWort}</i>`, 'b16'],
    ['uhr', 'Time per visit', u.dauer_mittel != null ? Math.floor(u.dauer_mittel / 60) + ':' + String(u.dauer_mittel % 60).padStart(2, '0') : '–', `<i>${u.dauer_mittel != null ? 'minutes on average' : 'not counted by Cloudflare'}</i>`, 'b12'],
    ['weg', 'On the way', u.buchung == null ? '–' : n(u.buchung), `<i>${u.buchung == null ? 'not counted by Cloudflare' : u.besuche ? prozent(100 * u.buchung / u.besuche) + ' of visits' : 'Called or opened directions'}</i>`, 'b33']];
  aus += st('besuch', 'Four numbers', zeitraumWort) + `<div class="v4 zahlen">${K.map(([i, name, z, s, f]) => `<div class="v4k p"><img class="v4b" src="/the-cat-and-gun/haus/assets/bild/${f}-480.webp" alt="" decoding="sync"><span class="ski">${ic(i)}</span>
      <div class="v4t"><b>${z}</b><span>${name}</span>${s}</div></div>`).join('')}</div>`;
  const viele = d.je_tag.length, schritt = viele <= 7 ? 1 : viele <= 31 ? 5 : 15;
  aus += `<section class="wdt p vkurve tafel"><div class="kopf"><div><div class="mono">${ic('besuch', 'mi')}Visits per day</div><h4>${d.leer ? 'No visits counted yet' : esc(datum(d.von)) + ' to ' + esc(datum(d.bis))}</h4></div>${zeitraum()}</div>
      ${saeulen(d.je_tag.map(t => t.besuche), i => (viele - 1 - i) % schritt === 0 ? kurzDatum(d.je_tag[i].tag) : '', Object.assign((i, z) => tagWort(d.je_tag[i].tag) + ': ' + mal(z, 'one visit', 'visits'), { label: 'Visits per day' }))}
      <p class="hin">${d.leer ? 'The numbers come from Cloudflare Web Analytics once the website is online: which pages are opened, from which country, on which device and from which website. Until then nothing is counted here.'
        : 'Move the mouse over a column: day and number of visits appear.'} <button class="link" type="button" data-gehe="verlauf">Trend${pf()}</button></p></section>`;
  /* Herkunft und Seiten (Vorlage: «Came from» und «Pages of the website»). Leer: die Quellen und Seiten der Website mit grauem Balken und «–». */
  ZUG = {}; ['b24', 'b16', 'b12', 'b33'].forEach(f => { ZUG['assets/bild/' + f + '-480.webp'] = 3; });
  const herk = d.leer ? QUELLEN.map(k => ({ k, n: null })) : d.herkunft.slice(0, 6);
  const seitenL = d.leer ? Object.keys(S.namen).map(s => ({ s, n: null })) : d.seiten.slice(0, 6);
  aus += st('flagge', 'Origin and pages', 'The first places') + `<div class="r r2 zwei">
      <section class="wdt p"><div class="kopf"><div><div class="mono">${ic('flagge', 'mi')}Where guests come from</div><h4>Came from</h4></div><button class="link" type="button" data-gehe="herkunft">Whole list${pf()}</button></div>
        ${herk.length ? dliste(herk, x => quelleZ(x.k, 'dsym'), x => tx(x.k), u.besuche) : '<p class="nichts">Nothing counted yet.</p>'}</section>
      <section class="wdt p"><div class="kopf"><div><div class="mono">${ic('seiten', 'mi')}Viewed most</div><h4>Pages of the website</h4></div><button class="link" type="button" data-gehe="seiten">Pages${pf()}</button></div>
        ${seitenL.length ? dliste(seitenL, x => fbild(x.s), x => tx(seite(x.s)) + (x.sek != null ? `<small>${dauer(x.sek, true).replace(/ /g, ' ')} on average</small>` : ''), u.seiten, true) : '<p class="nichts">Nothing counted yet.</p>'}</section>
    </div>`;
  if (einzeln()) aus += st('uhr', 'Last visits', 'The newest five') + `<div class="liste liste--start">${(ZUG = {}, d.besuche.slice(0, 5)).map((b, i) => karteBesuch(b, i, false)).join('')}</div>
    <p class="mehr">${wk('All visits', 'pfeil', 'data-gehe="besuche"')}</p>`;
  /* So wird gezählt (Vorlage .vzaehl), Inhalt aus der Ansicht «How we count» */
  const ja = [['seiten', 'Page'], ['uhr', 'Time'], ['flagge', 'Country'], ['handy', 'Device'], ['link', 'Website the guest came from']].map(([i, t]) => `<span class="chip">${ic(i)}${t}</span>`).join('');
  const nie = ['Names', 'Emails', 'Anything a guest types', 'Cookies'].map(t => `<span class="chip nie">${t}</span>`).join('');
  aus += `<section class="wdt p vzaehl"><div class="vzt"><span class="eqi">${ic('schloss')}</span><div><div class="mono">How we count</div><h4>Cloudflare Web Analytics</h4>
      <p class="hin">No cookies are set. The address of the connection is not used to follow a guest.</p><p class="hin"><button class="link" type="button" data-gehe="zaehlung">How we count${pf()}</button></p></div></div>
      <div class="vzr"><div><span class="mono">Counted</span><div class="chips2">${ja}</div></div><div><span class="mono">Never counted</span><div class="chips2">${nie}</div></div></div></section>`;
  if (!S.beispiel && u.besuche < 8) aus += `<p class="wenig">Not much to see yet? <button class="link" type="button" data-bsp>Show test data${pf()}</button></p>`;
  return aus;
}

function besuche() {
  const d = S.d;
  let aus = (einzeln() ? kopf('Visits', 'Every visit, <em>step by step.</em>', 'When someone came, from where, what they looked at and for how long. No names are stored: each visit shows a place, a time and the pages in order.', zeitraum())
    : kopf('Visits', 'Visits <em>in this period.</em>', 'How many visits came in this period. Cloudflare counts every page that is opened. It does not follow one guest from page to page.', zeitraum())) + hinweisBeispiel();
  if (d.leer) return aus + leer();
  if (d.besuche_fehlen) return aus + `<div class="leer blatt">${ZT}<b>${mal(d.summe.besuche, 'One visit', 'visits')} in ${n(d.tage)} days.</b>
    <p>Cloudflare counts every page that is opened. It does not link the pages of one guest together, so there is no list of single visits here. Pages, countries, devices and where guests came from are under Overview, Origin and Pages.</p>
    <p class="mehr sichern">${wk('See the pages', 'seiten', 'data-gehe="seiten"')} ${wk('Save days and pages as a table', 'speichern', 'data-sichern')}</p></div>`;
  const alle = d.besuche.map((b, i) => [b, i]);
  const nach = { alle: alle, buchung: alle.filter(x => x[0].buchung), anfrage: alle.filter(x => x[0].anfrage), kontakt: alle.filter(x => x[0].kontakt), handy: alle.filter(x => x[0].g === 'handy') };
  const l = nach[S.filter] || alle;
  if (!l.some(x => x[1] === S.wahl)) S.wahl = l.length ? l[0][1] : -1;
  const b = d.besuche[S.wahl];
  const f = (k, name) => `<button type="button" data-filter="${k}" class="${S.filter === k ? 'an' : ''}" aria-pressed="${S.filter === k}">${name} · ${n(nach[k].length)}</button>`;
  aus += `<div class="wahl3 wo-seg wahl3--filter" role="group" aria-label="Choice">${f('alle', 'All')}${f('buchung', 'On the way')}${f('anfrage', 'Instagram or TravelGO')}${f('kontakt', 'Called')}${f('handy', 'On mobile')}</div>`;
  if (!l.length) return aus + `<div class="leer-hinweis"><b>No visit in this choice.</b> Nobody went this way in this period.</div>`;
  let letzter = '';
  ZUG = {};
  const liste = l.slice(0, S.zeige).map(([x, i]) => { const k = x.tag !== letzter ? `<p class="tagzeile">${esc(tagWort(x.tag, true))}</p>` : ''; letzter = x.tag; return k + karteBesuch(x, i, i === S.wahl); }).join('');
  aus += `<div class="eingang">
    <div class="liste">${liste}${l.length > S.zeige ? `<button class="link weitere" type="button" data-mehr>Show ${n(Math.min(60, l.length - S.zeige))} more</button>` : ''}
      ${d.summe.besuche > d.besuche.length ? `<p class="tagzeile">Showing the newest ${n(d.besuche.length)} visits.</p>` : ''}</div>
    <div class="detail rg-detail">${b ? detail(b) : ''}</div></div>
    <p class="mehr sichern">${wk('Save all visits as a table', 'speichern', 'data-sichern')}</p>`;
  return aus;
}
function detail(b) {
  const schritte = b.weg.map((x, i) => {
    const e = REIHE.filter(k => x.e.indexOf(k) > -1);
    return `<li style="--i:${Math.min(i, 12)}"><time>${esc(uhr(x.z))}</time><div><b>${mitBild(x.s, true)}</b>${x.sp !== b.sp ? `<small>${tx(SPRACHE[x.sp] || x.sp)}</small>` : ''}
      ${e.length ? `<p>${e.map(k => `<span class="ereignis${GOLD_E.includes(k) ? ' gold' : ''}">${esc(EREIGNIS[k])}</span>`).join('')}</p>` : ''}</div><em>${x.sek ? dauer(x.sek, true) : '–'}</em></li>`;
  }).join('');
  const hat = e => b.weg.some(x => (x.e || []).includes(e));
  return `<article class="blatt besuchsblatt">
    <div class="besuchsblatt__kopf"><div><span class="mono">Visit · ${esc(tagWort(b.tag, true))}</span><h2>${tx(ort(b))}</h2></div>
      ${b.buchung ? `<span class="siegel">${hat('anruf') ? 'Called' : 'Opened directions'}</span>` : b.anfrage ? `<span class="siegel">${hat('mail') ? 'Opened Instagram' : 'Opened TravelGO'}</span>` : ''}</div>
    <dl class="angaben">
      <div><dt>Arrived</dt><dd>${esc(uhr(b.z))}</dd></div>
      <div><dt>Stayed</dt><dd>${b.dauer ? dauer(b.dauer, true) : '–'}</dd></div>
      <div><dt>Pages</dt><dd>${n(b.seiten)}</dd></div>
      <div><dt>Device</dt><dd>${tx(GERAET[b.g] || b.g)}</dd></div>
      <div><dt>Language</dt><dd>${tx(SPRACHE[b.sp] || b.sp)}</dd></div>
      <div><dt>Came from</dt><dd>${tx(b.h)}</dd></div>
    </dl>
    <h3 class="wegtitel">The path through the website</h3>
    <ol class="weg">${schritte}</ol>
    ${buehne(b)}
    <p class="fein">Time only counts while the page was in front. The time is Siargao time. Language: the one set in the browser.${b.r ? ' Region: ' + tx(b.r) + '.' : ''}</p>
  </article>`;
}

/* Miniaturbilder in Origin (Robert 28.11.2026): je Land und je Ort ein Bild, je Browsersprache die Flagge, im feinen Rahmen. Die Bilder sind Stimmungsbilder
   (erzeugt mit Higgsfield Soul Cinema, look/land/, look/ort/), keine Fotos des Hauses. Fehlt ein Bild, steht das Zeichen wie bisher. */
const LAND_BILD = new Set(["PH", "AU", "US", "CA", "GB", "DE", "CH", "NL", "FR", "ES", "RU", "KR", "JP", "IL", "SG", "CN", "HK", "TW", "IN", "ID", "MY", "TH", "VN", "NZ", "IT", "SE", "NO", "DK", "BE", "AT", "IE", "PT", "BR", "AE", "MX"]);
const ORT_BILD = new Set(["general-luna-ph", "dapa-ph", "del-carmen-ph", "pilar-ph", "san-isidro-ph", "surigao-city-ph", "manila-ph", "makati-ph", "quezon-city-ph", "taguig-ph", "cebu-city-ph", "davao-city-ph", "cagayan-de-oro-ph", "sydney-au", "melbourne-au", "brisbane-au", "gold-coast-au", "los-angeles-us", "new-york-us", "san-francisco-us", "vancouver-ca", "london-gb", "berlin-de", "munich-de", "zurich-ch", "amsterdam-nl", "paris-fr", "barcelona-es", "moscow-ru", "seoul-kr", "tokyo-jp", "tel-aviv-il", "singapore-sg"]);
const ORT_VAR = { 'general-luna-ph': 7 };   /* general-luna-ph.webp und -2 bis -7 */
const FLAGGE = new Set(['de', 'en', 'es', 'fr', 'he', 'it', 'ja', 'ko', 'nl', 'ru', 'tl']);
const slug = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const rahmen = (src, klasse) => `<span class="vrahmen ${klasse}"><img src="${src}" alt="" decoding="async"></span>`;
const landBild = k => LAND_BILD.has(k) ? rahmen('look/land/' + k.toLowerCase() + '.webp', 'vmini') : `<span class="dsym vmini-ers">${ic('flagge')}</span>`;
const ortBild = (o, l) => { const s = slug(o) + '-' + String(l || '').toLowerCase(); return ORT_BILD.has(s) ? rahmen('look/ort/' + s + '.webp', 'vmini') : `<span class="dsym vmini-ers">${ic('weg')}</span>`; };
const flagge = k => FLAGGE.has(k) ? rahmen('look/flagge/' + k + '.svg', 'vflag') : `<span class="dsym vflag-ers">${ic('chat')}</span>`;

/* Robert 28.11.2026 («überall so viel Leerraum … Linien so schmal, Zahlen so klein»): Länder, Orte und Sprachen als volle Kartenraster.
   Jede Karte: Bild (Land, Ort) oder Flagge (Sprache), Rangnummer, Name, grosse Zahl, Anteil und ein kräftiger Balken im Vergleich zum ersten Platz.
   Feste Spaltenzahl nach Anzahl (nie auto-fit): 12 = 4×3, 10 = 5×2, 8 = 4×2, 6 = 3×2, 4, 3, 2, 1. Was danach kommt, steht als eine Zeile Text darunter. */
const KN = [12, 10, 8, 6, 4, 3, 2, 1], KSP = { 12: 4, 10: 5, 8: 4, 6: 3, 4: 4, 3: 3, 2: 2, 1: 1 };
const landSrc = k => LAND_BILD.has(k) ? 'look/land/' + String(k).toLowerCase() + '.webp' : '';
const ortSrc = (o, l) => { const s = slug(o) + '-' + String(l || '').toLowerCase(); return ORT_BILD.has(s) ? 'look/ort/' + s + '.webp' : landSrc(l); };
function kartenRaster(liste, art, ges, hoechstens) {
  if (!liste.length) return '<p class="nichts">Nothing counted yet.</p>';
  const zahl = KN.find(k => k <= Math.min(liste.length, hoechstens || 12)), oben = liste.slice(0, zahl), rest = liste.slice(zahl);
  const max = Math.max(1, ...liste.map(x => x.n));
  const name = x => art === 'land' ? land(x.k) || 'Place not known' : art === 'ort' ? x.k : SPRACHE[x.k] || x.k;
  const karte = (x, i) => {
    const src = art === 'land' ? landSrc(x.k) : art === 'ort' ? ortSrc(x.k, x.l) : '';
    const kopf = art === 'sprache' ? (FLAGGE.has(x.k) ? `<span class="kk__fl"><img src="look/flagge/${x.k}.svg" alt="" decoding="async"></span>` : `<span class="kk__fl kk__fl--ers">${ic('chat')}</span>`)
      : src ? `<img class="kk__b" src="${src}" alt="" decoding="async">` : `<span class="kk__ers">${ic(art === 'land' ? 'flagge' : 'weg')}</span>`;
    return `<div class="kk kk--${art}" style="--w:${Math.max(.02, x.n / max).toFixed(3)}">${kopf}<span class="kk__nr">${String(i + 1).padStart(2, '0')}</span>
      <div class="kk__t"><b>${tx(name(x))}</b>${art === 'ort' ? `<small>${tx(land(x.l))}</small>` : ''}</div>
      <div class="kk__z"><strong>${n(x.n)}</strong><em>${ges ? Math.round(100 * x.n / ges) + '%' : ''}</em></div><span class="kk__bal"><i></i></span></div>`;
  };
  return `<div class="kkr n${zahl}">${oben.map(karte).join('')}</div>`
    + (rest.length ? `<p class="hin kkmehr">Also: ${rest.map(x => `${tx(name(x))} <b>${n(x.n)}</b>`).join(' · ')}</p>` : '');
}

function herkunft() {
  const d = S.d, u = d.summe, ges = u.besuche;
  let aus = kopf('Origin', '', einzeln() ? 'Country and town come from the connection, the language is the one set in the browser (the website is in English). «Came from» shows which website brought the guest to you.'
    : 'The country comes from the connection. «Came from» shows which website brought the guest to you, «Device» tells mobile, tablet and computer apart.', zeitraum()) + hinweisBeispiel();
  const ph = d.laender.find(x => x.k === 'PH');
  const insel = (d.orte || []).filter(x => x.l === 'PH' && INSEL.includes(x.k)).reduce((a, x) => a + x.n, 0);
  const ausland = ph ? ges - ph.n : null, anteil = z => ges && z != null ? prozent(100 * z / ges, 0) : '–';
  const mobil = ((d.geraete.find(x => x.k === 'handy') || {}).n) || 0;
  const kacheln = d.leer ? [['From the Philippines', '–'], ['From abroad', '–']]
    : d.besuche_fehlen ? [['From the Philippines', ph ? anteil(ph.n) : '–'], ['From abroad', anteil(ausland)], ['Countries', n(u.laender)], ['On mobile', anteil(mobil)]]
      : [['From Siargao', anteil(insel)], ['From the Philippines', ph ? anteil(ph.n) : '–'], ['From abroad', anteil(ausland)], ['Countries', n(u.laender)]];
  const fein = d.leer ? '' : d.besuche_fehlen ? 'Cloudflare tells the country. Town and browser language are not counted.'
    : 'Siargao: the towns of the island (' + esc(INSEL.join(', ')) + '); counted from the 20 most frequent places.';
  aus += `<section class="wdt p"><div class="kopf"><div><div class="mono">${ic('flagge', 'mi')}Countries · ${einzeln() ? 'from the connection' : 'Cloudflare tells the country'}</div><h4>Philippines and abroad</h4></div>${zeitraum()}</div>
      <div class="ph2${kacheln.length === 4 ? ' n4' : ''}">${kacheln.map(([t, z]) => `<div class="phk"><span class="mono">${t}</span><b>${z}</b></div>`).join('')}</div>
      ${d.leer ? `<div class="karte"><img src="/the-cat-and-gun/haus/assets/bild/b19-800.webp" alt="" decoding="sync"><span>No visits counted yet</span></div>`
        : kartenRaster(d.laender, 'land', ges, 10)}
      ${fein ? `<p class="hin">${fein}</p>` : ''}</section>`;
  const q = d.leer ? QUELLEN.map(k => ({ k, n: null })) : d.herkunft.slice(0, 6);
  aus += st('link', 'Came from', 'The website that brought the guest') + (q.length ? `<div class="vq n${q.length}">${q.map(x => `<div class="qk p">${quelleZ(x.k, 'o2i')}<b>${tx(x.k)}</b><i>${x.n == null ? '–' : n(x.n)}</i>${x.n == null ? '' : `<small>${anteil(x.n)} of visits</small>`}</div>`).join('')}</div>`
    : '<p class="nichts">Nothing counted yet.</p>');
  const g = ['handy', 'tablet', 'rechner'].map(k => ({ k, n: d.leer ? null : (((d.geraete.find(x => x.k === k) || {}).n) || 0) }));
  /* Robert 28.11.2026: je Gerät ein Blender-Gerät mit einem anderen Abschnitt der Startseite (Handy: Startbild, Tablet: Super Juices, Rechner: Pool & Bar);
     Handy und Laptop aus der Werkbank von The Cat & Gun, Tablet gerendert mit look/geraet/tablet_render.py. Darunter grosse Zahl, Anteil und Balken. */
  const gmax = Math.max(1, ...g.map(x => x.n || 0));
  aus += st('handy', 'Device', 'Mobile, tablet and computer') + `<div class="vg vg--bild">${g.map(x => `<div class="gk gk--bild p" style="--w:${x.n ? Math.max(.02, x.n / gmax).toFixed(3) : 0}"><div class="gk__buehne"><img src="look/geraet/${x.k}.webp" alt="" decoding="async"></div>
      <div class="gk__t"><b>${GERAET[x.k]}</b><span class="gk__z"><strong>${x.n == null ? '–' : n(x.n)}</strong><em>${x.n == null ? '' : anteil(x.n)}</em></span></div><span class="kk__bal"><i></i></span></div>`).join('')}</div>`;
  if (einzeln()) aus += `<section class="wdt p"><div class="kopf"><div><div class="mono">${ic('weg', 'mi')}Town · from the connection</div><h4>Places</h4></div></div>${kartenRaster(d.orte, 'ort', ges, 12)}</section>
    <section class="wdt p"><div class="kopf"><div><div class="mono">${ic('chat', 'mi')}Set in the browser</div><h4>Browser language</h4></div></div>${kartenRaster(d.sprachen, 'sprache', ges, 12)}</section>`;
  aus += `<p class="hin vhin">«Typed in directly» means the address was typed in, a bookmark or a link from a message.</p>`;
  return aus;
}

function zeit() {
  const d = S.d;
  let aus = kopf('Time', 'When guests <em>drop by.</em>', 'At which hour and on which weekday visits start. Siargao time. So you see when a post about a screening, a market or the menu reaches the most people.', zeitraum()) + hinweisBeispiel();
  if (d.leer) return aus + leer();
  const st = d.stunden, wt = d.raster.map(r => r.reduce((a, x) => a + x, 0));
  const spitze = st.indexOf(Math.max(...st)), wspitze = wt.indexOf(Math.max(...wt));
  const abend = st.slice(18).reduce((a, x) => a + x, 0), ges = st.reduce((a, x) => a + x, 0) || 1;
  aus += `<div class="band blatt"><div><span class="mono">Most visits</span><b>${stunde(spitze)}–${stunde(spitze + 1)}</b></div>
      <div><span class="mono">Busiest day</span><b>${WTAG[wspitze]}</b></div>
      <div><span class="mono">From 6 PM</span><b>${prozent(100 * abend / ges, 0)}</b></div>
      <div><span class="mono">On weekends</span><b>${prozent(100 * (wt[5] + wt[6]) / ges, 0)}</b></div></div>
    <section class="blatt tafel">
      <header><h3>At what time</h3><p>Start of the visit</p></header>
      ${saeulen(st, i => i % 3 === 0 ? stunde(i) : '', Object.assign((i, z) => stunde(i) + ' to ' + stunde(i + 1) + ': ' + mal(z, 'one visit', 'visits'), { label: 'Visits by hour' }), 'saeulen--uhr')}
    </section>
    <section class="blatt tafel">
      <header><h3>Weekday and hour</h3><p>The brighter, the more visits</p></header>
      ${raster(d.raster)}
    </section>
    <section class="blatt tafel">
      <header><h3>By weekday</h3></header>
      ${balken(wt.map((z, i) => ({ k: i, n: z })), x => WTAG[x.k])}
    </section>`;
  return aus;
}
function raster(r) {
  const max = Math.max(1, ...r.flat());
  const kopfzeile = '<span></span>' + Array.from({ length: 24 }, (_, h) => `<span class="raster__h">${h % 3 === 0 ? h : ''}</span>`).join('');
  return `<div class="raster" role="img" aria-label="Visits by weekday and hour">${kopfzeile}
    ${r.map((zeile, w) => `<span class="raster__w">${WTAG[w].slice(0, 2)}</span>` + zeile.map((z, h) => `<i style="--a:${(z / max).toFixed(3)}" data-t="${WTAG[w]}, ${stunde(h)}–${stunde(h + 1)}: ${mal(z, 'one visit', 'visits')}"></i>`).join('')).join('')}</div>`;
}

function seiten() {
  const d = S.d;
  let aus = kopf('Pages', 'What guests <em>look at.</em>', einzeln() ? 'Every page of the website with the number of views, the time guests stay on it on average, and how often it lay on the path of a guest who then called or opened the directions.'
    : 'Every page of the website with the number of views. Time on a page and the taps on Call and Directions are not counted by Cloudflare.', zeitraum()) + hinweisBeispiel();
  if (d.leer) return aus + leer();
  const max = Math.max(1, ...d.seiten.map(x => x.n));
  aus += `<section class="blatt tabelle">
    <div class="zeile zeile--kopf"><span>Page</span><span>Views</span><span aria-hidden="true"></span><span>Average time</span><span>On the way</span></div>
    ${d.seiten.map((x, i) => `<div class="zeile" style="--i:${Math.min(i, 20)}"><span class="zeile__n"><b>${mitBild(x.s)}</b></span><span class="zeile__z">${n(x.n)}</span>
      <span class="rang__b"><i style="--w:${Math.max(.02, x.n / max).toFixed(3)}"></i></span><span>${x.sek != null ? dauer(x.sek, true) : '–'}</span><span>${x.buchung ? n(x.buchung) : '–'}</span></div>`).join('')}
  </section>
  <p class="fein">Pages not listed were not opened in this period. The language the browser is set to is under «Origin».</p>`;
  return aus;
}

function verlauf() {
  const d = S.d, u = d.summe, v = d.vorher;
  let aus = kopf('Trend', 'How visits <em>develop.</em>', `The last ${n(d.tage)} days next to the ${n(d.tage)} days before (${esc(datum(v.von))} to ${esc(datum(v.bis))}). Light in the background: the same day in the period before.`, zeitraum()) + hinweisBeispiel();
  if (d.leer) return aus + leer();
  const viele = d.je_tag.length, schritt = viele <= 7 ? 1 : viele <= 31 ? 5 : 15;
  const zeile = (name, a, b, fmt = n, umgekehrt) => a == null && b == null && d.besuche_fehlen ? '' : `<div class="vz"><span>${name}</span><b>${a == null ? '–' : fmt(a)}</b><em>${b == null ? '–' : fmt(b)}</em>${vergleich(a, b, umgekehrt)}</div>`;
  const zeitFmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') + ' min';
  aus += `<section class="blatt tafel">
      <header><h3>Visits per day</h3><p><span class="punkt"></span>this period <span class="punkt punkt--hell"></span>before</p></header>
      ${saeulen(d.je_tag.map(t => t.besuche), i => (viele - 1 - i) % schritt === 0 ? kurzDatum(d.je_tag[i].tag) : '', Object.assign((i, z) => tagWort(d.je_tag[i].tag) + ': ' + mal(z, 'one visit', 'visits') + ' · before ' + n(d.vor_tag[i]), { label: 'Visits per day next to the period before' }), 'saeulen--vgl', d.vor_tag)}
    </section>
    <div class="zwei zwei--fuell">
      <section class="blatt vergleich"><header><h3>Next to the period before</h3></header>
        <div class="vz vz--kopf"><span></span><b>Now</b><em>Before</em><small></small></div>
        ${zeile('Visits', u.besuche, v.besuche)}${zeile('Pages viewed', u.seiten, v.seiten)}
        ${zeile('Pages per visit', u.seiten_je_besuch, v.seiten_je_besuch, x => Number(x).toLocaleString('en-US'))}
        ${zeile('Time per visit', u.dauer_mittel, v.dauer_mittel, zeitFmt)}${zeile('On the way', u.buchung, v.buchung)}${zeile('Instagram or TravelGO', u.anfrage, v.anfrage)}${zeile('Called', u.kontakt, v.kontakt)}${zeile('Opened directions', u.route, v.route)}
      </section>
      <section class="blatt"><header><h3>Week by week</h3></header>
        ${wochen(d.wochen)}
      </section>
    </div>
    <section class="blatt tafel"><header><h3>Main countries over time</h3><p>Visits per day</p></header>
      <div class="laenderverlauf">${d.land_verlauf.map(x => `<div class="lv"><span>${tx(land(x.k))}<b>${n(x.n.reduce((a, z) => a + z, 0))}</b></span>${linie(x.n)}</div>`).join('')}</div>
    </section>`;
  return aus;
}
function wochen(w) {
  const max = Math.max(1, ...w.map(x => x.besuche / x.tage));
  return `<ol class="wochen">${w.map((x, i) => `<li style="--i:${i}"><span>${kurzDatum(x.von)}–${kurzDatum(x.bis)}${x.tage < 7 ? `<small>${x.tage} ${x.tage === 1 ? 'day' : 'days'}</small>` : ''}</span>
    <span class="rang__b"><i style="--w:${Math.max(.02, (x.besuche / x.tage) / max).toFixed(3)}"></i></span><b>${n(x.besuche)}</b><em>${x.buchung == null ? n(x.besuche ? Math.round(x.besuche / x.tage) : 0) + ' a day' : n(x.buchung) + ' on the way'}</em></li>`).join('')}</ol>
    <p class="fein">Monday to Sunday. Weeks cut at the edge: the bar shows the average per day.</p>`;
}
function linie(werte) {   /* kleine Verlaufslinie als SVG, Fläche darunter in Kerzenlicht */
  const b = 300, h = 54, max = Math.max(1, ...werte), st = werte.length > 1 ? b / (werte.length - 1) : b;
  const p = werte.map((z, i) => (i * st).toFixed(1) + ',' + (h - 4 - (h - 10) * z / max).toFixed(1));
  return `<svg viewBox="0 0 ${b} ${h}" preserveAspectRatio="none" aria-hidden="true"><path class="lv__f" d="M0,${h} L${p.join(' L')} L${b},${h}Z"/><path class="lv__l" d="M${p.join(' L')}"/></svg>`;
}

const mal_ = z => z === 1 ? 'once' : n(z) + ' times';
function buchung() {
  const d = S.d, w = d.werte;
  let aus = kopf('On the way', 'How often guests <em>call or look up the way.</em>', einzeln() ? 'A guest is on the way when they tap Call or open the directions in Google Maps. Here you see how often that happens, which pages the guest looked at before, and the taps on Instagram and TravelGO.'
    : 'A guest is on the way when they tap Call or open the directions in Google Maps. Cloudflare does not count these taps. It counts how often the Visit page with the map is opened.', zeitraum()) + hinweisBeispiel();
  if (d.leer) return aus + leer();
  /* Cloudflare zählt keine Klicks: statt neun leerer Kacheln ein Blatt, das es sagt, und was es gibt (Aufrufe der Seite Visit) */
  if (d.besuche_fehlen) { const vis = (d.seiten.find(x => x.s === 'visit.html') || {}).n || 0;
    return aus + `<div class="leer blatt">${ZT}<b>Taps are not counted.</b>
    <p>Cloudflare counts pages. Taps on Call, Directions, Instagram and TravelGO are not counted. What it counts: the Visit page with the map was opened ${mal_(vis)} in ${n(d.tage)} days.</p>
    ${wk('See the pages', 'seiten', 'data-gehe="seiten"')}</div>`; }
  const ohneCf = 'Not counted by Cloudflare.';
  const k = (key, name, text, ohne) => { const x = w[key] || {}, da = x.von > 0;
    return `<div class="wert blatt"><span class="mono">${name}</span><b>${da ? prozent(x.anteil) : '–'}</b><p>${da ? text(x) : d.besuche_fehlen ? ohneCf : ohne}</p></div>`; };
  const auf = z => z === 1 ? 'view' : 'views';
  aus += `<div class="werte">
    ${k('start', 'From Home', x => n(x.zahl) + ' of ' + n(x.von) + ' ' + auf(x.von) + ' of Home were in visits that then called or opened the directions', 'Home was not opened yet.')}
    ${k('karte', 'From the Menu', x => n(x.zahl) + ' of ' + n(x.von) + ' ' + auf(x.von) + ' of the Menu were in visits that then called or opened the directions', 'The Menu was not opened yet.')}
    ${k('booking', 'By phone', x => n(x.zahl) + ' of ' + n(x.von) + ' steps were a call, ' + mal(x.anfrage, 'one guest', 'guests') + ' opened the directions', 'Nobody called or opened the directions yet.')}
    ${k('abbruch', 'Visit page without a next step', x => n(x.zahl) + ' of ' + n(x.von) + ' views of Visit ended without a call or the directions', 'Visit was not opened yet.')}
    ${k('tisch', 'From Playground or Pool & Bar', x => n(x.zahl) + ' of ' + n(x.von) + ' ' + auf(x.von) + ' were in visits that then called or opened the directions', 'These pages were not opened yet.')}
    ${k('anfrage', 'From Super Juices', x => n(x.zahl) + ' of ' + n(x.von) + ' ' + auf(x.von) + ' were in visits that then called or opened the directions', 'Super Juices was not opened yet.')}
    ${k('kontakt', 'Call or Instagram', x => 'Phone number ' + mal_(x.anruf) + ', Instagram ' + mal_(x.mail) + ', in ' + n(x.von) + ' ' + auf(x.von), 'No page view yet.')}
    ${k('chat', 'TravelGO opened', x => mal_(x.zahl) + ' tapped, in ' + n(x.von) + ' ' + auf(x.von) + ', ' + n(x.dc) + ' of them on the Menu', 'No page view yet.')}
    ${k('route', 'Directions opened', x => mal_(x.zahl) + ' tapped, in ' + n(x.von) + ' ' + auf(x.von) + ', ' + n(x.weg) + ' of them on Visit', 'No page view yet.')}
  </div>
  <div class="zwei zwei--fuell">
    <section class="blatt"><header><h3>Pages before the next step</h3></header>
      ${d.besuche_fehlen ? '<p class="nichts">Not counted by Cloudflare.</p>' : balken(d.seiten.filter(x => x.buchung).sort((a, b) => b.buchung - a.buchung).slice(0, 8).map(x => ({ k: x.s, n: x.buchung })), x => mitBild(x.k), null, d.seiten.reduce((a, x) => a + (x.buchung || 0), 0))}</section>
    <div class="stapel">
      <section class="blatt"><header><h3>From visit to call or directions</h3></header>${trichter(w)}</section>
      <section class="blatt"><header><h3>Week by week</h3></header>${d.besuche_fehlen ? '<p class="nichts">Not counted by Cloudflare.</p>' : balken(d.wochen.map(x => ({ k: x, n: x.buchung })), x => kurzDatum(x.k.von) + '–' + kurzDatum(x.k.bis), x => x.k.tage < 7 ? x.k.tage + (x.k.tage === 1 ? ' day' : ' days') : '', d.summe.buchung)}</section>
    </div>
  </div>`;
  return aus;
}
/* Weg zur Tür: dieselben Stufen und Namen liest das Control panel (Fehlerbuch 10a: nie eine eigene Ableitung, kein Anteil über 100 %).
   Besuche → Seite «Visit» geöffnet (Aufrufe der Seite) → danach angerufen oder die Route geöffnet (Aufrufe von «Visit» auf dem Weg dahin, nie mehr als die Stufe davor). */
function trichter(w) {
  const s = S.d.summe.besuche || 1, besuch = (S.d.seiten.find(x => x.s === 'visit.html') || {}), auf = Math.min(s, besuch.n || 0);
  const stufen = [['Visits', s], ['Visit page opened', auf], ['Then called or opened directions', S.d.besuche_fehlen ? null : Math.min(auf, besuch.buchung || 0)]];
  return `<ol class="trichter">${stufen.map(([name, z], i) => `<li style="--i:${i};--w:${Math.max(.04, (z || 0) / s).toFixed(3)}"><i></i><span>${name}</span><b>${z == null ? '–' : n(z)}</b>${i && z != null ? `<em>${prozent(100 * z / (stufen[i - 1][1] || 1), 0)} of these</em>` : '<em>&nbsp;</em>'}</li>`).join('')}</ol>
    <p class="fein">«Visit» counts every view of the page; a guest who opens it twice counts twice.${S.d.besuche_fehlen ? ' Cloudflare does not count taps, so the last step stays empty.' : ''}</p>`;
}

function zaehlung() {
  return kopf('How we count', `What ${KLEIN} <em>knows and what not.</em>`, 'Cloudflare Web Analytics counts the visits in the account of The Cat\u00a0&\u00a0Gun. Below: what it counts and what it never counts.') + `
  <div class="zwei">
    <section class="blatt liste-txt"><h3>What is counted</h3><ul>
      <li>Which page was opened and when</li>
      <li>The country, as Cloudflare reads it from the connection</li>
      <li>Whether it was a mobile phone, a tablet or a computer</li>
      <li>Which website the guest came from (only the name, like google.com or instagram.com)</li>
      <li>How often a page was opened and how many visits started on the website</li></ul></section>
    <section class="blatt liste-txt"><h3>What is never counted</h3><ul>
      <li>No name, no email, nothing a guest types</li>
      <li>No cookie and nothing stored on the guest’s device</li>
      <li>The address of the connection is not used to follow a guest from page to page or from day to day</li>
      <li>No ads and no sharing: the numbers stay in the Cloudflare account of the house</li>
      <li>Most robots, like search engines, do not show up, because they do not run the counting</li></ul></section>
  </div>
  <section class="blatt liste-txt"><h3>Good to know</h3><ul>
    <li><b>Limits:</b> Guests with an ad blocker may not be counted, so the real number of visits can be higher.</li>
    <li><b>Single visits:</b> Cloudflare does not link the pages of one guest. Town, language, time on a page and taps on Call, Directions, Instagram and TravelGO are therefore not counted.</li>
    <li><b>Time:</b> All times are Siargao time (Philippine time).</li>
    <li><b>Test data:</b> The button «Show test data» shows made-up visits, marked as test data on every view. They never mix with the real numbers.</li>
    <li><b>Access:</b> Only Julie opens ${KLEIN}, with her own login.</li></ul></section>`;
}

/* ---------- Start ---------- */
async function zeichenLaden() {   /* das «&» der Wortmarke aus dem Kleid (WO_HAUS.zeichen), einmal geladen, überall per <use>; Füllung aus der Schriftfarbe */
  try { const r = await fetch(WO_HAUS.zeichen); const t = await r.text(); const m = t.match(/<svg[^>]*>([\s\S]*)<\/svg>/); if (m) $('#zeichen').innerHTML = m[1].replace(/<!--[\s\S]*?-->/g, '').replace(/\sfill="[^"]*"/g, ''); } catch (e) { /* ohne Zeichen geht alles weiter */ }
}
(async function () {
  $('#tuer h1').textContent = NAME + ' does not start.'; document.title = NAME + ' · ' + WO.haus.name; $('#rand').setAttribute('aria-label', 'Tools of ' + WO.haus.name);   /* Name nur aus dem Kleid */
  try { const t = +localStorage.getItem('catgun-registre-tage'); if (t === 7 || t === 30 || t === 90) S.tage = t; } catch (e) { /* privat */ }
  const h = location.hash.slice(1); if (TITEL[h]) S.ansicht = h;
  const zeichen = zeichenLaden();
  try { const r = await fetch('seiten.json', { cache: 'no-store' }); if (r.ok) S.namen = await r.json(); } catch (e) { /* dann stehen die Dateinamen da */ }
  try { const r = await fetch('seiten-bilder.json', { cache: 'no-store' }); if (r.ok) S.bilder = await r.json(); } catch (e) { /* dann ohne Bild */ }
  try { const r = await fetch('seiten-fotos.json', { cache: 'no-store' }); if (r.ok) S.fotos = await r.json(); } catch (e) { /* dann das Seitenbild */ }
  try { await lade(); }
  catch (e) {
    $('#tuer').hidden = false; $('#tuer-t').textContent = e.message; $('#ansicht').innerHTML = ''; rand(); $('#rand .dx-jetzt i').textContent = 'Does not start';
    if (!$('#tuer [data-neu]')) { $('#tuer').insertAdjacentHTML('beforeend', `<p class="tuer-zu__kn">${wk('Reload', 'verlauf', 'data-neu', 'gold')}${ohneCf() ? wk('Show test data', 'auge', 'data-tuer-bsp') : ''}<a class="wk" href="${esc(STUBE)}">${ic('haus')}${esc(STUBE_N)}</a></p>`); $('#tuer [data-neu]').onclick = () => location.reload();
      if ($('#tuer [data-tuer-bsp]')) $('#tuer [data-tuer-bsp]').onclick = () => { try { sessionStorage.removeItem('catgun-registre-echt'); } catch (x) { } location.replace(location.pathname + '?beispiel=1#' + S.ansicht); }; }   /* Cloudflare noch nicht angeschlossen: zurück zu den Testdaten (derselbe Knopf wie in der Leiste) */
    return;
  }
  await zeichen;
  rand(); leiste(); zeichne();
  /* Tor 30.10.2026: in niedrigen Fenstern kommt die Leiste erst nach dem ersten Scrollen (culinarium.css, Punkt 22) */
  const gerollt = () => document.body.classList.toggle('rg-gerollt', scrollY > 40); addEventListener('scroll', gerollt, { passive: true }); gerollt();
  window.addEventListener('hashchange', () => { const z = location.hash.slice(1); if (TITEL[z] && z !== S.ansicht) gehe(z); });
  window.BG_REGISTRE = 1;
  window.BG_REGISTRE_STAND = () => JSON.parse(JSON.stringify(Object.assign({ _ablage: S.ablage, _uhr: S.uhr }, S.d)));   /* nur lesen: was gerade angezeigt wird (Prüfläufe) */
})();

/* Lange Besuche: Robert 28.11.2026 (Abnahme, Frage 2): «Kopf mit Ort im Bild». Die Karte des gewählten Besuchs steht nach jeder Wahl mit ihrem Kopf
   24 px unter dem Fensterrand. Ist sie höher als das Fenster, fährt sie beim Scrollen mit, bis ihr Ende 24 px über dem unteren Rand steht, und beim
   Hochscrollen wieder zurück, bis der Kopf oben steht (wie die Seitenleiste, leiste.js › mitfahren). Vorher klebte immer das Ende im Bild und der Ort lag
   über dem Rand (Vorlage Schäfli 21.10.2026). Nur am Rechner (ab 1181 px), nur über top. */
(function () {
  const RAND = 24;
  let y = null, letzt = 0, karte = null, w = 0, neu = false;
  function setze() {
    w = 0; const f = $('#ansicht .detail'); if (!f) { karte = null; return; }
    if (!matchMedia('(min-width:1181px)').matches) { f.style.top = ''; y = null; return; }
    const h = f.offsetHeight, unten = Math.min(RAND, innerHeight - RAND - h), p = scrollY;
    let erst = false;
    if (neu || y === null || f !== karte) { y = RAND; karte = f; erst = neu; neu = false; }
    else y = Math.max(unten, Math.min(RAND, y - (p - letzt)));
    letzt = p;
    f.style.top = y + 'px';
    /* weit unten in der Liste stösst die Karte an das Ende der Liste und wird hochgeschoben: dann rückt die Seite so weit, dass der Kopf mit dem Ort zu sehen ist */
    if (erst) { const t = f.getBoundingClientRect().top; if (t < RAND - 1) window.scrollBy({ top: t - RAND, behavior: 'instant' }); }
  }
  const bald = () => { if (!w) w = requestAnimationFrame(setze); };
  /* eine neue Karte (Wahl eines Besuchs, neue Ansicht): wieder mit dem Kopf oben */
  new MutationObserver(ms => { if (ms.some(m => m.target.closest && (m.target.closest('.detail') || m.target.querySelector && m.target.querySelector('.detail')))) neu = true; bald(); })
    .observe($('#ansicht'), { childList: true, subtree: true });
  addEventListener('scroll', setze, { passive: true });
  addEventListener('resize', bald);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(bald);
})();
