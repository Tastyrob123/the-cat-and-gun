/* Visitors (Le Registre) · The Cat & Gun online: /the-cat-and-gun/haus/api/registre im Worker aus unterbau/ (Cloudflare, kostenloser Plan). Ersetzt online/registre.py der
   Vorlage (Vercel-Funktion des Culinarium Hannover): Werkzeuge 2.0 laufen im Cloudflare-Konto von The Cat & Gun, die Website zählt nicht selbst
   (Werkzeug-Master 2.0), Quelle ist Cloudflare Web Analytics (ohne Cookies) über die GraphQL-Schnittstelle von Cloudflare.

   Einbau im Worker (unterbau/):  import { antwort } from '<pfad>/registre/online/registre.js';
                                  if (url.pathname === '/the-cat-and-gun/haus/api/registre') return antwort(request, env);   // nach der Anmeldung von Julie
   Werte im Worker (wrangler secret / vars, nie im Code):
     CF_API_TOKEN       Token mit dem Recht «Account Analytics: Read» (Secret)
     CF_ACCOUNT_ID      Konto von The Cat & Gun
     CF_WA_SITE_TAG     Kennung der Website in Web Analytics («site tag»)
   GET ?tage=7|30|90      dieselbe Form wie registre.py stand() (registre.js liest sie), dazu quelle: 'cloudflare' und besuche_fehlen: true.
   Cloudflare zählt Seitenaufrufe (count) und Besuche (sum.visits: Aufruf ohne Herkunft von der eigenen Website) je Land, Gerät, Herkunft, Seite und Stunde.
   Keinen einzelnen Besuch, keine Stadt, keine Sprache, keine Lesedauer, keine Klicks: diese Felder bleiben leer (null bzw. []), nie geschätzt.
   Uhrzeit und Tag in Siargao (Asia/Manila, UTC+8, ohne Sommerzeit): Cloudflare liefert UTC-Stunden, hier umgerechnet.
   ?beispiel=1 beantwortet der Worker nicht: Testdaten liest das Werkzeug als Dateien (beispiel/<tage>.json). */

const GRAPHQL = 'https://api.cloudflare.com/client/v4/graphql';
const VERSATZ = 8;   // Stunden: Asia/Manila = UTC+8
const SEITE = { '/': 'index.html', '/index': 'index.html' };
const GERAET = { mobile: 'handy', smartphone: 'handy', tablet: 'tablet', desktop: 'rechner' };
// Herkunftsnamen wie registre.py HERKUNFT (eine Liste, zwei Sprachen: bei einer Änderung beide nachziehen)
const HERKUNFT = [['maps.google.', 'Google Maps'], ['maps.app.goo.gl', 'Google Maps'], ['google.', 'Google'], ['bing.', 'Bing'], ['duckduckgo.', 'DuckDuckGo'],
  ['ecosia.', 'Ecosia'], ['yahoo.', 'Yahoo'], ['instagram.', 'Instagram'], ['facebook.', 'Facebook'], ['threads.', 'Threads'], ['tiktok.', 'TikTok'],
  ['tripadvisor.', 'Tripadvisor'], ['travelgo.', 'TravelGO'], ['chatgpt.', 'ChatGPT'], ['perplexity.', 'Perplexity']];

export function herkunft(h) {
  if (!h) return 'Typed in directly';
  for (const [stueck, name] of HERKUNFT) if (h.includes(stueck)) return name;
  return h.startsWith('www.') ? h.slice(4) : h;
}
export function seiteVon(pfad) {
  const p = String(pfad || '/').split('?')[0].replace(/\/+$/, '') || '/';
  if (SEITE[p]) return SEITE[p];
  const n = p.replace(/^\//, '');
  return /^[a-z0-9-]+(\.html)?$/.test(n) ? (n.endsWith('.html') ? n : n + '.html') : null;
}
const tagIso = d => d.toISOString().slice(0, 10);
const plus = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return tagIso(d); };
function ortszeit(utcStunde) {   // '2026-11-22T17:00:00Z' → { tag: '2026-11-23', h: 1, wt: 0 (Montag) }
  const d = new Date(new Date(utcStunde).getTime() + VERSATZ * 3600e3);
  return { tag: tagIso(d), h: d.getUTCHours(), wt: (d.getUTCDay() + 6) % 7 };
}
const rang = (m, n) => [...m.entries()].filter(x => x[1] > 0).sort((a, b) => b[1] - a[1] || (String(a[0]) < String(b[0]) ? -1 : 1)).slice(0, n).map(([k, v]) => ({ k, n: v }));

const ABFRAGE = `query Besuche($konto: string!, $filter: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject, $jetzt: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject) {
  viewer { accounts(filter: { accountTag: $konto }) {
    stunden: rumPageloadEventsAdaptiveGroups(limit: 5000, filter: $filter) { count sum { visits } dimensions { datetimeHour } }
    laender: rumPageloadEventsAdaptiveGroups(limit: 5000, filter: $jetzt) { count sum { visits } dimensions { countryName datetimeHour } }
    herkunft: rumPageloadEventsAdaptiveGroups(limit: 500, filter: $jetzt, orderBy: [sum_visits_DESC]) { count sum { visits } dimensions { refererHost } }
    geraete: rumPageloadEventsAdaptiveGroups(limit: 50, filter: $jetzt) { count sum { visits } dimensions { deviceType } }
    seiten: rumPageloadEventsAdaptiveGroups(limit: 500, filter: $jetzt, orderBy: [count_DESC]) { count sum { visits } dimensions { requestPath } }
  } } }`;

/* Aus den Gruppen von Cloudflare dieselbe Form wie registre.py stand(). Eigene Funktion, damit sie ohne Netz geprüft werden kann (pruefung-bau/online.mjs). */
export function stand(g, tage, heute) {
  const von = plus(heute, -(tage - 1)), vorVon = plus(von, -tage);
  const liste = Array.from({ length: tage }, (_, i) => plus(von, i)), vorListe = Array.from({ length: tage }, (_, i) => plus(vorVon, i));
  const hier = new Set(liste);
  const jeTag = Object.fromEntries(liste.map(t => [t, { tag: t, besuche: 0, seiten: 0, buchung: null }]));
  const vorTag = Object.fromEntries(vorListe.map(t => [t, { besuche: 0, seiten: 0 }]));
  const stunden = Array(24).fill(0), raster = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const x of g.stunden || []) {
    const o = ortszeit(x.dimensions.datetimeHour), b = (x.sum && x.sum.visits) || 0, s = x.count || 0;
    if (hier.has(o.tag)) { jeTag[o.tag].besuche += b; jeTag[o.tag].seiten += s; stunden[o.h] += b; raster[o.wt][o.h] += b; }
    else if (vorTag[o.tag]) { vorTag[o.tag].besuche += b; vorTag[o.tag].seiten += s; }
  }
  const laender = new Map(), landTag = new Map();
  for (const x of g.laender || []) {
    const o = ortszeit(x.dimensions.datetimeHour); if (!hier.has(o.tag)) continue;
    const k = /^[A-Z]{2}$/.test(x.dimensions.countryName || '') ? x.dimensions.countryName : '??', b = (x.sum && x.sum.visits) || 0;
    laender.set(k, (laender.get(k) || 0) + b);
    if (!landTag.has(k)) landTag.set(k, new Map()); landTag.get(k).set(o.tag, (landTag.get(k).get(o.tag) || 0) + b);
  }
  const her = new Map(); for (const x of g.herkunft || []) { const k = herkunft(x.dimensions.refererHost || ''), b = (x.sum && x.sum.visits) || 0; if (b) her.set(k, (her.get(k) || 0) + b); }
  const ger = new Map(); for (const x of g.geraete || []) { const k = GERAET[String(x.dimensions.deviceType || '').toLowerCase()] || 'rechner'; ger.set(k, (ger.get(k) || 0) + ((x.sum && x.sum.visits) || 0)); }
  const sei = new Map(); for (const x of g.seiten || []) { const k = seiteVon(x.dimensions.requestPath); if (k) sei.set(k, (sei.get(k) || 0) + (x.count || 0)); }
  const summe = (L, k) => L.reduce((a, t) => a + t[k], 0);
  const B = summe(Object.values(jeTag), 'besuche'), S = summe(Object.values(jeTag), 'seiten');
  const VB = summe(Object.values(vorTag), 'besuche'), VS = summe(Object.values(vorTag), 'seiten');
  const zahlLaender = [...laender.entries()].filter(([k, v]) => v > 0 && k !== '??').length;
  const kurz = (b, s, l) => ({ besuche: b, seiten: s, buchung: null, anfrage: null, kontakt: null, route: null, dauer_mittel: null,
    seiten_je_besuch: b ? Math.round(10 * s / b) / 10 : null, laender: l });
  const wochen = [];
  for (const t of liste) {
    const d = new Date(t + 'T12:00:00Z'), mo = plus(t, -((d.getUTCDay() + 6) % 7)), w = wochen.length && wochen[wochen.length - 1]._mo === mo ? wochen[wochen.length - 1] : null;
    if (w) { w.bis = t; w.tage++; w.besuche += jeTag[t].besuche; } else wochen.push({ _mo: mo, von: t, bis: t, tage: 1, besuche: jeTag[t].besuche, buchung: null });
  }
  const mit = liste.filter(t => jeTag[t].besuche);
  const leerWert = () => ({ zahl: 0, von: 0, anteil: null });
  return {
    tage, von, bis: heute, seit: mit[0] || null, leer: !B, beispiel: false, quelle: 'cloudflare', besuche_fehlen: true,
    summe: Object.assign(kurz(B, S, zahlLaender), { heute: jeTag[heute].besuche }),
    vorher: Object.assign(kurz(VB, VS, null), { von: vorListe[0], bis: vorListe[tage - 1] }),
    je_tag: liste.map(t => jeTag[t]), vor_tag: vorListe.map(t => vorTag[t].besuche),
    wochen: wochen.map(({ _mo, ...w }) => w),
    land_verlauf: rang(laender, 5).filter(x => x.k !== '??').slice(0, 4).map(x => ({ k: x.k, n: liste.map(t => landTag.get(x.k).get(t) || 0) })),
    stunden, raster, laender: rang(laender, 20), orte: [], sprachen: [], geraete: rang(ger, 12), herkunft: rang(her, 14),
    seiten: rang(sei, 50).map(x => ({ s: x.k, n: x.n, sek: null, buchung: 0 })),
    werte: Object.fromEntries(['start', 'karte', 'booking', 'abbruch', 'tisch', 'anfrage', 'kontakt', 'chat', 'route'].map(k => [k, leerWert()])),
    besuche: [],
  };
}

export function heuteSiargao(jetzt = new Date()) { return tagIso(new Date(jetzt.getTime() + VERSATZ * 3600e3)); }

export async function abfragen(env, tage, heute, holen = fetch) {
  const vonUtc = new Date(plus(heute, -(2 * tage - 1)) + 'T00:00:00Z').getTime() - VERSATZ * 3600e3;   // Mitternacht in Siargao, Beginn des Zeitraums davor
  const jetztVon = new Date(plus(heute, -(tage - 1)) + 'T00:00:00Z').getTime() - VERSATZ * 3600e3;
  const bis = new Date(new Date(heute + 'T00:00:00Z').getTime() - VERSATZ * 3600e3 + 24 * 3600e3).toISOString();
  const f = start => ({ AND: [{ datetime_geq: new Date(start).toISOString(), datetime_lt: bis }, { siteTag: env.CF_WA_SITE_TAG }] });
  const r = await holen(GRAPHQL, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.CF_API_TOKEN },
    body: JSON.stringify({ query: ABFRAGE, variables: { konto: env.CF_ACCOUNT_ID, filter: f(vonUtc), jetzt: f(jetztVon) } }) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || (d.errors && d.errors.length)) throw new Error('CLOUDFLARE · ' + ((d.errors && d.errors[0] && d.errors[0].message) || ('HTTP ' + r.status)));
  const a = d.data && d.data.viewer && d.data.viewer.accounts && d.data.viewer.accounts[0];
  if (!a) throw new Error('CLOUDFLARE · No account in the answer.');
  return a;
}

const json = (code, d) => new Response(JSON.stringify(d), { status: code, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export async function antwort(request, env, holen = fetch) {
  const url = new URL(request.url);
  if (request.method !== 'GET') return json(404, { fehler: 'WEG · The website does not count by itself (Cloudflare Web Analytics).' });
  if (url.searchParams.get('beispiel')) return json(404, { fehler: 'WEG · Test data is read from beispiel/<days>.json.' });
  const tage = [7, 30, 90].includes(+url.searchParams.get('tage')) ? +url.searchParams.get('tage') : 30;
  if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID || !env.CF_WA_SITE_TAG) return json(503, { fehler: 'EINRICHTUNG · Cloudflare Web Analytics is not connected yet.' });
  try {
    const heute = heuteSiargao();
    return json(200, stand(await abfragen(env, tage, heute, holen), tage, heute));
  } catch (e) {
    return json(502, { fehler: String(e.message || 'CLOUDFLARE · No answer.').slice(0, 200) });
  }
}
