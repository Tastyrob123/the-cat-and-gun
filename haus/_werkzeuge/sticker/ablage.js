/* Sticker editor · Ablage: Entwurf, Stand, Verlauf über die gemeinsamen Wege (unterbau/WEGE.md, Speicher «sticker»).
   Lokal antwortet server.py, online der Worker; dieselben Wege. In der Vorlage lag alles nur im Browser (localStorage); der Auftrag verlangt
   speichern → neu laden → noch da, veröffentlichen, zurückholen (Werkzeug-Master 2.2/2.3, R08–R14).
   Ungespeicherte Eingaben warten gelb und liegen zur Sicherheit im Browser (Netz weg: nichts geht verloren). Konflikt: nichts wird
   überschrieben, die eigene Fassung bleibt als Kopie «… (second window)» (Vorlage I01). */
(function () {
  'use strict';
  const HAUS = 'catgun', W = 'sticker', LS = 'catgun-sticker-arbeit';
  const kopie = o => JSON.parse(JSON.stringify(o));
  const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const A = { stand: null, basis: null, arbeit: null, kennung: null, offenEntwurf: false, hoerer: [], online: true };

  class WegFehler extends Error { constructor(status, stichwort, text, offline) { super(text); this.status = status; this.stichwort = stichwort; this.text = text; this.offline = !!offline; } }
  async function hole(pfad, opt = {}) {
    let r;
    try {
      r = await fetch(pfad, { method: opt.methode || 'GET', cache: 'no-store', headers: opt.daten !== undefined ? { 'Content-Type': 'application/json' } : {}, body: opt.daten !== undefined ? JSON.stringify(opt.daten) : undefined });
    } catch (e) { throw new WegFehler(0, 'netz', 'OFFLINE · No connection. Your changes are kept in this browser.', true); }
    let o = null; try { o = await r.json(); } catch (e) { o = null; }
    if (!r.ok) throw new WegFehler(r.status, (o && o.stichwort) || 'fehler', (o && o.fehler) || ('Error ' + r.status));
    return o;
  }
  const weg = (was, rest = '') => `/the-cat-and-gun/haus/api/${was}/${HAUS}/${W}${rest}`;

  function lokalLesen() { try { const v = JSON.parse(localStorage.getItem(LS) || 'null'); return v && v.daten ? v : null; } catch (e) { return null; } }
  function lokalSchreiben() { try { if (A.arbeit && ungespeichert()) localStorage.setItem(LS, JSON.stringify({ basis: A.kennung, daten: A.arbeit, zeit: Date.now() })); else localStorage.removeItem(LS); } catch (e) { } }
  function melden(art) { A.hoerer.forEach(f => { try { f(art); } catch (e) { console.error(e); } }); }
  function setzeStand(s) {
    A.stand = s; A.kennung = s.kennung_entwurf || s.kennung_live; A.offenEntwurf = !!s.offen;
    A.basis = kopie(s.entwurf || s.live);
  }

  /* Erster Stand: alle Sticker des Hauses aus dem Fundus einlesen (fundus/elemente, Gruppen aus bereiche.json) */
  /* Kennung eines Stickers des Hauses: h-<element ohne «sticker-»>, bei Foto-Stickern (sticker7, nicht im Fundus) h-<id> */
  const hausId = g => 'h-' + (g.element ? g.element.replace(/^sticker-/, '') : g.id);
  async function hausSticker(b, g) {
    const kopf = { bereich: b.id, herkunft: 'haus', id: hausId(g), geaendert: 0 };
    const d = g.element ? await SK.ausFundus(g.element, kopf)
      : await fetch(g.svg, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error('STICKER · ' + g.svg + ' ' + r.status); return r.text(); }).then(t => SK.ausSvg(t, Object.assign({ name: g.name || '' }, kopf)));
    d.vorbild = '/the-cat-and-gun/haus/drucksachen/sticker/' + g.bild;
    return d;
  }
  async function grundstandBauen(bereiche) {
    const sticker = [];
    for (const b of bereiche) for (const g of b.sticker) {
      try { sticker.push(await hausSticker(b, g)); }
      catch (e) { console.warn('Einlesen', g.element || g.svg, e); }
    }
    return { format: 1, sticker, galerie: { fav: [], hinten: [] }, eingelesen: sticker.map(x => x.id) };
  }
  /* Neue Sticker des Hauses (Mac 23.11.2026: Küchen- und Foto-Sticker aus den Drucksachen): was es im gespeicherten Stand noch nicht gibt und nie
     eingelesen war, kommt einmal dazu und wird als Entwurf gespeichert. Einen gelöschten Sticker des Hauses holt das nicht zurück (Liste «eingelesen»). */
  async function neueHausSticker(bereiche) {
    const basis = A.basis || { sticker: [] }, bekannt = new Set(basis.eingelesen || (basis.sticker || []).map(x => x.id)), dazu = [];
    for (const b of bereiche) for (const g of b.sticker) {
      if (bekannt.has(hausId(g)) || (basis.sticker || []).some(x => x.id === hausId(g))) continue;
      try { dazu.push(await hausSticker(b, g)); } catch (e) { console.warn('Einlesen', g.element || g.svg, e); }
    }
    if (!dazu.length) return false;
    const daten = kopie(basis); daten.sticker = (daten.sticker || []).concat(dazu);
    daten.eingelesen = [...new Set([...(basis.eingelesen || (basis.sticker || []).map(x => x.id)), ...dazu.map(x => x.id)])];
    try { setzeStand(await hole(weg('entwurf'), { methode: 'PUT', daten: { daten, erwartet: A.kennung, wer: 'Sticker editor (new stickers of the house)' } })); return dazu.length; }
    catch (e) { console.warn('Neue Sticker des Hauses', e); return false; }
  }

  async function laden(bereiche) {
    let s = await hole(weg('stand'));
    if (!s.live && !s.entwurf) {
      const g = await grundstandBauen(bereiche);
      try { s = await hole(weg('grundstand'), { methode: 'POST', daten: { daten: g, wer: 'Sticker editor' } }); }
      catch (e) { if (e.status === 409) s = await hole(weg('stand')); else throw e; }
    }
    setzeStand(s);
    A.neuImHaus = await neueHausSticker(bereiche);
    /* Robert 24.11.2026 («stell das wieder her»): ?gespeichert=1 verwirft die nicht gespeicherten Änderungen dieses Browsers und öffnet den gespeicherten Stand */
    try { if (new URLSearchParams(location.search).get('gespeichert') === '1') localStorage.removeItem(LS); } catch (e) { }
    const l = lokalLesen();
    A.arbeit = kopie(A.basis);
    if (l && !gleich(l.daten, A.basis)) { A.arbeit = l.daten; A.wiederhergestellt = true; A.lokalBasis = l.basis; }
    melden('geladen');
    return A;
  }
  async function neuLaden() { setzeStand(await hole(weg('stand'))); A.arbeit = kopie(A.basis); lokalSchreiben(); melden('geladen'); }

  function aendere(fn) { fn(A.arbeit); A.arbeit.geaendert = Date.now(); lokalSchreiben(); melden('arbeit'); }
  /* Abnahme 28.11.2026: der Zeitstempel der Arbeitsfassung zählt nicht als Änderung. Sonst stand nach vollständigem Rückgängig
     (oder Stern an und wieder aus) weiter «1 change not saved», und «Publish» blieb gesperrt, obwohl nichts anders war. */
  const ohneZeit = o => o ? Object.assign({}, o, { geaendert: undefined }) : o;
  const ungespeichert = () => !!A.arbeit && !gleich(ohneZeit(A.arbeit), ohneZeit(A.basis));

  /* Was hat sich gegenüber dem Gespeicherten geändert (Liste der Quittung) */
  function unterschiede(alt, neu) {
    const a = {}, n = {}, l = [];
    (alt && alt.sticker || []).forEach(s => a[s.id] = s); (neu && neu.sticker || []).forEach(s => n[s.id] = s);
    Object.keys(n).forEach(id => { if (!a[id]) l.push({ id, was: 'new', name: n[id].name }); else if (!gleich(a[id], n[id])) l.push({ id, was: 'changed', name: n[id].name }); });
    Object.keys(a).forEach(id => { if (!n[id]) l.push({ id, was: 'deleted', name: a[id].name }); });
    if (alt && neu && !gleich(alt.galerie, neu.galerie)) l.push({ id: '', was: 'order', name: 'Order of the gallery' });
    return l;
  }

  async function speichern() {
    if (!ungespeichert()) return { nichts: true };
    const vorher = kopie(A.basis), daten = kopie(A.arbeit), liste = unterschiede(vorher, daten);
    try {
      const s = await hole(weg('entwurf'), { methode: 'PUT', daten: { daten, erwartet: A.kennung, wer: 'Julie' } });
      setzeStand(s);
      // was der Server bereinigt hat, gilt (die Antwort enthält den gespeicherten Stand)
      A.arbeit = kopie(A.basis); lokalSchreiben(); melden('gespeichert');
      return { liste, vorher };
    } catch (e) {
      if (e.stichwort === 'konflikt') {
        /* Zwei Fenster: das andere hat zuerst gespeichert. Nichts überschreiben; den neuen Stand holen und jede hier geänderte
           Fassung als Kopie «(second window)» daneben legen. */
        const frisch = await hole(weg('stand')); setzeStand(frisch);
        const neu = kopie(A.basis), meine = {}; (vorher.sticker || []).forEach(x => meine[x.id] = x);
        const kopien = [];
        (daten.sticker || []).forEach(x => {
          if (meine[x.id] && gleich(meine[x.id], x)) return;   // hier nicht geändert
          const k = kopie(x); k.id = SK.neueId('s'); k.name = (x.name || 'Sticker') + ' (second window)'; k.herkunft = x.herkunft === 'haus' ? 'kopie' : x.herkunft; k.geaendert = Date.now();
          neu.sticker.push(k); kopien.push(k);
        });
        A.arbeit = neu; lokalSchreiben(); melden('konflikt');
        e.kopien = kopien;
      }
      throw e;
    }
  }

  async function veroeffentlichen(notiz, dateien) {
    if (ungespeichert()) throw new WegFehler(409, 'erst-speichern', 'Save first, then publish.');
    const s = await hole(weg('veroeffentlichen'), { methode: 'POST', daten: { notiz: notiz || '', erwartet: A.kennung, dateien: dateien || [], wer: 'Julie' } });
    setzeStand(s); A.arbeit = kopie(A.basis); lokalSchreiben(); melden('veroeffentlicht');
    return s;
  }
  const verlauf = () => hole(weg('verlauf'));
  const fassung = f => hole(`/the-cat-and-gun/haus/api/fassung/${HAUS}/${W}/${encodeURIComponent(f)}`);
  const protokoll = () => hole(weg('protokoll'));
  async function zurueckholen(f) { const s = await hole(weg('zurueckholen'), { methode: 'POST', daten: { fassung: f, wer: 'Julie' } }); setzeStand(s); A.arbeit = kopie(A.basis); lokalSchreiben(); melden('zurueckgeholt'); return s; }
  async function verwerfen() { const s = await hole(weg('entwurf'), { methode: 'DELETE', daten: { wer: 'Julie' } }); setzeStand(s); A.arbeit = kopie(A.basis); lokalSchreiben(); melden('verworfen'); return s; }
  function zuruecksetzen() { A.arbeit = kopie(A.basis); lokalSchreiben(); melden('arbeit'); }
  /* «Rückgängig» der Quittung: die Fassung vor dem Speichern wieder als Eingabe (wartet gelb, bis gespeichert) */
  function zurueckAuf(daten) { A.arbeit = kopie(daten); lokalSchreiben(); melden('arbeit'); }

  /* Galerie-Reihenfolge: Favoriten vorn, «nach hinten» gestellte hinten, dazwischen nach letzter Änderung */
  function reihe(daten) {
    const g = (daten || A.arbeit).galerie || { fav: [], hinten: [] }, l = ((daten || A.arbeit).sticker || []).slice();
    const rang = s => g.fav.includes(s.id) ? 0 : g.hinten.includes(s.id) ? 2 : 1;
    return l.sort((a, b) => rang(a) - rang(b) || (rang(a) === 0 ? g.fav.indexOf(a.id) - g.fav.indexOf(b.id) : 0) || (b.geaendert || 0) - (a.geaendert || 0));
  }
  /* Liste der veröffentlichten Druckdateien; nur abfragen, wenn das Protokoll eine Veröffentlichung kennt (sonst gibt es die Datei noch nicht) */
  async function druckListe() {
    try { const pr = await protokoll(); if (!pr.some(x => x.was === 'veroeffentlicht')) return null; const r = await fetch('/the-cat-and-gun/haus/drucksachen/sticker/editor/index.json', { cache: 'no-store' }); return r.ok ? r.json() : null; } catch (e) { return null; }
  }
  const veroeffentlicht = () => (A.stand && A.stand.live && A.stand.live.sticker) || [];

  window.SKA = { A, hole, laden, neuLaden, aendere, ungespeichert, unterschiede, speichern, veroeffentlichen, verlauf, fassung, protokoll, zurueckholen, verwerfen,
    zuruecksetzen, zurueckAuf, reihe, veroeffentlicht, druckListe, kopie, gleich, beiAenderung: f => A.hoerer.push(f), WegFehler };
})();
