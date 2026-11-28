/* Print & feed · Oberfläche (Kern der Vorlage): Bausteine aus dem Markenfundus, Vorlagen, Fotos, Ablage, Bearbeiten wie auf dem Papier, druckfertig speichern. Ohne KI. */
(function () {
  const DS = window.DS;
  const HAUS = new URLSearchParams(location.search).get('haus') || 'catgun';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const B = DS.B;
  const ST = { M: null, doc: null, seite: 0, sel: null, S: 3, zoom: 1, hist: [], zukunft: [], modus: null, urform: {}, seitePanel: false };
  const LS = { docs: `ds-${HAUS}-docs`, aktuell: `ds-${HAUS}-aktuell` };
  const lies = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const schreib = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const r2 = v => Math.round(v * 10) / 10;
  const PT = 72 / 25.4;

  /* ---------- Meldung, Dialog ---------- */
  let mT;
  function melde(t, ms = 3200) { const m = $('#meldung'); m.textContent = t; m.hidden = false; clearTimeout(mT); mT = setTimeout(() => m.hidden = true, ms); }
  function dialog(html, knoepfe) {
    return new Promise(ok => {
      $('#dialogKarte').innerHTML = html + `<div class="dialog__knoepfe">${knoepfe.map((k, i) => `<button class="${k.haupt ? 'knopf' : 'leicht'}" data-i="${i}">${esc(k.t)}${k.haupt ? '<i><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></i>' : ''}</button>`).join('')}</div>`;
      $('#dialog').hidden = false;
      /* R09 (Prüfung 23.11.2026): Escape schliesst das Fenster wie der erste Knopf (Keep, Cancel, Close, Back to the page: nie die Hauptaktion) */
      const zu = v => { $('#dialog').hidden = true; document.removeEventListener('keydown', esc_, true); ok(v); };
      const esc_ = e => { if (e.key === 'Escape' && !$('#dialog').hidden) { e.preventDefault(); e.stopPropagation(); zu(knoepfe[0].v); } };
      document.addEventListener('keydown', esc_, true);
      $('#dialogKarte').onclick = e => {
        const b = e.target.closest('[data-i]');
        if (b) zu(knoepfe[+b.dataset.i].v);
        const li = e.target.closest('li[data-id]');
        if (li) zu({ springe: li.dataset.id, seite: +li.dataset.seite });
      };
    });
  }

  /* Ersatzfoto, wenn ein Entwurf ein unbekanntes Foto nennt: ein Foto des Hauses (vorher fest «haus-aare», ein Foto des Grand Beau-Rivage, Prüfung 16.10.2026) */
  DS.ersatzFoto = M => (M.bildIndex[M.ersatz || 'haus-tag'] ? (M.ersatz || 'haus-tag') : ((M.bilder.find(b => !b.eigen) || M.bilder[0] || {}).key));
  /* ---------- Ablage ---------- */
  const alleDocs = () => lies(LS.docs, {});
  function speichern(beimOeffnen) {
    if (!ST.doc) return;
    if (ST.doc.platzhalter) { if (beimOeffnen) return; delete ST.doc.platzhalter; }
    if (beimOeffnen && !alleDocs()[ST.doc.id]) return;   // nur geöffnet (Vorlage, KI-Entwurf): gespeichert wird erst ab der ersten Änderung (Robert 12.10.2026)
    if (beimOeffnen) { schreib(LS.aktuell, ST.doc.id); return; }   // Öffnen ist keine Änderung: sonst meldet ein zweites Fenster, das nur öffnet, dem ersten einen Konflikt (Prüfung 16.10.2026)
    const d = alleDocs(), da = d[ST.doc.id];
    /* Zwei Fenster mit derselben Drucksache (Prüfung 16.10.2026): hat das andere Fenster inzwischen gespeichert, wird dessen Fassung nicht
       überschrieben; diese Fassung geht als Kopie in die Ablage und bleibt hier offen. */
    if (da && ST.stand && (da.geaendert || 0) > ST.stand) {
      const k = JSON.parse(JSON.stringify(ST.doc)); k.id = 'd' + Date.now().toString(36); k.name = (k.name || 'Design') + ' (second window)'; ST.doc = k;
      $('#docName').value = k.name; nameEinpassen();   // Prüfung 23.11.2026: der längere Name der Kopie bekam sonst die alte Höhe (abgeschnitten)
      setTimeout(() => melde(`This design was changed in another window. Nothing was overwritten: your version is saved as «${k.name}» in My designs.`, 12000), 0);
    }
    ST.doc.geaendert = Date.now(); ST.stand = ST.doc.geaendert;
    d[ST.doc.id] = ST.doc;
    if (!schreib(LS.docs, d)) melde('The browser storage is full. Delete older designs in My designs or save them as a work file.');
    schreib(LS.aktuell, ST.doc.id);
    const g = $('#gespeichert'); if (g) { g.classList.add('an'); clearTimeout(g._t); g._t = setTimeout(() => g.classList.remove('an'), 1600); }
  }
  function oeffne(doc) {
    ST.doc = doc; ST.stand = doc.geaendert || 0; ST.seite = 0; ST.sel = null; ST.hist = []; ST.zukunft = []; ST.modus = null; ST.urform = {}; ST.seitePanel = false;
    ST.auftritt = true;
    speichern(true); passeZoom(); zeichne(); zeichneAblage();
  }

  /* ---------- Stücke des Hauses (Mac 23.11.2026, Robert: «… ich möchte genau dieses Dokument jetzt bearbeiten in Print and Feed»):
     haeuser/<haus>/stuecke/<id>.json, gebaut von _bau/stuecke_einlesen.py aus drucksachen/_bau/satz/<id>.html. Geöffnet wird es unter der festen Kennung
     «stueck-<id>»: wer es geändert hat, findet beim nächsten Öffnen (auch über ?stueck=<id>) seine Fassung wieder. kopie: als neue Drucksache weiterarbeiten. */
  async function oeffneStueck(id, o = {}) {
    const sid = 'stueck-' + id, d = alleDocs();
    if (d[sid] && !o.original && !o.kopie) { oeffne(d[sid]); return d[sid]; }
    let doc = o.von ? JSON.parse(JSON.stringify(o.von)) : null;
    if (!doc) { const r = await fetch(ST.M.basis + 'stuecke/' + encodeURIComponent(id) + '.json', { cache: 'no-cache' }); if (!r.ok) { melde('This piece of the house was not found: ' + id, 6000); return null; } doc = await r.json(); }
    doc.id = sid; doc.stueck = id; doc.geaendert = 0;
    if (o.kopie) { doc.id = 'd' + Date.now().toString(36); doc.name = doc.name.replace(/ \(copy\)$/, '') + ' (copy)'; doc.ausStueck = id; delete doc.stueck; doc.geaendert = Date.now(); const a = alleDocs(); a[doc.id] = doc; schreib(LS.docs, a); }
    oeffne(doc); zeichneAblage();
    if (o.kopie) melde(`Copy made: «${doc.name}» is in My designs. The piece of the house stays as it was.`, 5200);
    return doc;
  }

  /* ---------- Änderungen mit Verlauf ---------- */
  const seite = () => ST.doc.seiten[ST.seite];
  const sozial = () => !!(window.DSIg && DSIg.istSozial(ST.doc));
  const elById = id => seite().el.find(e => e.id === id);
  function aendern(fn, frei = true) {
    ST.hist.push(JSON.stringify(ST.doc)); if (ST.hist.length > 100) ST.hist.shift();
    ST.zukunft = [];
    fn();
    if (frei) seite().frei = true;
    for (const el of seite().el) if (el.typ === 'text') el.h = DS.mess(el).h;
    speichern(); zeichne();
  }
  /* Verwerfen aus dem Editor (Robert 12.10.2026: «hier will ich doch nicht mitarbeiten: einfach Entwurf löschen oder verwerfen») */
  async function verwerfen() {
    if (ST.modus === 'text') textEnde();
    const d = ST.doc, gespeichert = !!alleDocs()[d.id];
    const seit = Date.now() - (parseInt(String(d.id).slice(1), 36) || Date.now());
    const lange = gespeichert && (seit > 10 * 60000 || ST.hist.length >= 10);
    const a = await dialog(`<h2>Discard this design?</h2><p class="leise">${gespeichert ? 'It will be removed from your designs.' : 'It is not saved yet and simply goes away.'}${lange ? ' You worked on it for a while. If you might still need it, keep it as a copy.' : ''}</p>`,
      [{ t: 'Keep', v: false }, ...(lange ? [{ t: 'Keep as a copy instead', v: 'kopie' }] : []), { t: 'Discard', v: true, haupt: true }]);
    if (!a) return;
    const alle = alleDocs();
    if (a === 'kopie') { const k = JSON.parse(JSON.stringify(d)); k.id = 'd' + Date.now().toString(36); k.name = d.name + ' (copy)'; k.geaendert = Date.now(); alle[k.id] = k; }
    delete alle[d.id]; schreib(LS.docs, alle);
    oeffne(leer('a5h', true)); zeichneAblage();
    if (window.DSStart) DSStart.zeige('meine');
    melde(a === 'kopie' ? 'Kept as a copy in your designs.' : 'Design discarded.');
  }
  function zurueck() { if (document.activeElement && document.activeElement.id === 'eText') document.activeElement.blur();   // erst das Tippen abschliessen (löst «change» aus), dann zurück
    if (eTextVor) { ST.hist.push(eTextVor); eTextVor = null; }   // Tippen im Feld «Inhalt» ohne Verlassen des Felds
    if (!ST.hist.length) return; const id0 = ST.doc.id; ST.zukunft.push(JSON.stringify(ST.doc)); ST.doc = JSON.parse(ST.hist.pop()); ST.doc.id = id0; ST.seite = Math.min(ST.seite, ST.doc.seiten.length - 1); if (ST.sel && !elById(ST.sel)) ST.sel = null; speichern(); zeichne(); }
  function vor() { if (!ST.zukunft.length) return; const id0 = ST.doc.id; ST.hist.push(JSON.stringify(ST.doc)); ST.doc = JSON.parse(ST.zukunft.pop()); ST.doc.id = id0; ST.seite = Math.min(ST.seite, ST.doc.seiten.length - 1); if (ST.sel && !elById(ST.sel)) ST.sel = null; speichern(); zeichne(); }

  function setzeSlot(s, slot, wert) {
    if (!s.quelle || !slot) return;
    const teile = slot.split('.'); let o = s.quelle.inhalt;
    for (let i = 0; i < teile.length - 1; i++) { if (o[teile[i]] == null) o[teile[i]] = /^\d+$/.test(teile[i + 1]) ? [] : {}; o = o[teile[i]]; }
    o[teile[teile.length - 1]] = wert;
  }

  /* ---------- Zeichnen ---------- */
  /* Einpassen (Robert 29.10.2026: «das Dokument ist trotzdem noch zu klein … man erkennt das nicht richtig»): die Seite füllt die Arbeitsfläche, die gerade frei
     ist, an Höhe oder Breite, mit ruhigem Rand (Innenabstand der Fläche, studio.css). Beim Auf- und Zugehen der rechten Leiste passt sie sich neu an
     (ResizeObserver in los). ST.zoom ist der Faktor dazu; die Anzeige unten zeigt den echten Massstab (100 % = Originalgrösse am Bildschirm). */
  const PX_MM = 96 / 25.4;
  function passeZoom() {
    const f = DS.blattF(ST.doc, ST.seite), fl = $('#flaeche'), g = getComputedStyle(fl);
    const w = fl.clientWidth - parseFloat(g.paddingLeft) - parseFloat(g.paddingRight);
    /* Handy (24.11.2026, Prüfung «Abschnitt fast leer»): die Arbeitsfläche ist so hoch wie das Blatt plus Luft, ein schmales Band liegt nicht in einer leeren Fläche;
       höchstens 78 % des Fensters, mindestens 220 px. Am Rechner unverändert. */
    const mi = fl.closest('.mitte');
    if (mi) {
      if (innerWidth <= 820) {
        const pad = parseFloat(g.paddingTop) + parseFloat(g.paddingBottom), rest = mi.clientHeight - fl.clientHeight;
        const soll = Math.round(Math.min(innerHeight * .78, Math.max(220, (f.h + 2 * B) * (w / (f.b + 2 * B)) + pad + rest)));
        if (Math.abs(mi.clientHeight - soll) > 4) mi.style.height = soll + 'px';
      } else if (mi.style.height) mi.style.height = '';
    }
    const h = fl.clientHeight - parseFloat(g.paddingTop) - parseFloat(g.paddingBottom);
    const fit = Math.min(w / (f.b + 2 * B), h / (f.h + 2 * B));
    ST.S = Math.max(.05, fit) * ST.zoom;   // Mac 23.11.2026: Untergrenze .6 schnitt Banner (2000 mm) und andere breite Formate rechts ab
  }
  function nameEinpassen() {   // eine Zeile in 23 px, sonst zwei Zeilen in 16 px, ausgewogen umbrochen
    const t = $('#docName'); if (!t || t.tagName !== 'TEXTAREA') return;
    t.classList.remove('zwei'); t.style.height = 'auto';
    if (t.scrollHeight > parseFloat(getComputedStyle(t).lineHeight) * 1.5 + 8) { t.classList.add('zwei'); t.style.height = 'auto'; }
    t.style.height = t.scrollHeight + 'px';
  }
  function zeichne() {
    const fz = DS.blattF(ST.doc, ST.seite), fzk = fz.b + 'x' + fz.h; if (ST._fz && ST._fz !== fzk) passeZoom(); ST._fz = fzk;   // Stücke des Hauses: Seiten in verschiedenen Grössen
    const M = ST.M, doc = ST.doc, fk0 = DS.blattK(doc, ST.seite), f = Object.assign({}, DS.FORMATE[fk0], fz), S = ST.S;
    const wirt = $('#wirt');
    wirt.style.width = (f.b + 2 * B) * S + 'px'; wirt.style.height = (f.h + 2 * B) * S + 'px';
    wirt.innerHTML = '';
    const blatt = DS.seiteDom(M, doc, ST.seite, S, { editor: true });
    wirt.appendChild(blatt);
    if (ST.auftritt) {
      ST.auftritt = false;
      [...blatt.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 24)));
      wirt.classList.remove('schwebt'); void wirt.offsetWidth; wirt.classList.add('schwebt');
      clearTimeout(wirt._a); wirt._a = setTimeout(() => wirt.classList.remove('schwebt'), 3200);
    }
    const ue = document.createElement('div'); ue.className = 'ueber'; ue.id = 'ueber';
    const dg = DS.FORMATE[doc.formatKey]?.digital;
    /* Robert 24.11.2026 («sehr hässliche Schatten»): ohne «Trim edge» steht das Stück so da, wie es gedruckt wird, mit Schatten an seiner Form;
       der Beschnitt und der graue Rand kommen nur mit dem Schalter */
    const sauber = dg || !$('#zeigeHilfen').checked;
    blatt.style.clipPath = sauber ? (f.rund ? `circle(${f.b * S / 2}px at 50% 50%)` : `inset(${B * S}px${f.ecke ? ' round ' + f.ecke * S + 'px' : ''})`) : '';
    wirt.classList.toggle('digital', !!dg);
    wirt.classList.toggle('sauber', sauber);
    ue.innerHTML = `<div class="schnitt" style="left:${B * S}px;top:${B * S}px;width:${f.b * S}px;height:${f.h * S}px${dg ? ';outline:0' : ''};${f.rund ? 'border-radius:50%' : f.ecke ? 'border-radius:' + f.ecke * S + 'px' : ''}"></div>` +
      (dg ? '' : `<div class="sicher" style="left:${(B + DS.SICHER) * S}px;top:${(B + DS.SICHER) * S}px;width:${(f.b - 2 * DS.SICHER) * S}px;height:${(f.h - 2 * DS.SICHER) * S}px;${f.rund ? 'border-radius:50%' : ''}"></div>`);
    wirt.appendChild(ue);
    wirt.classList.toggle('ohneHilfen', !$('#zeigeHilfen').checked);
    zeichneAuswahl();
    if ($('#docName').value !== doc.name) { $('#docName').value = doc.name; nameEinpassen(); }
    $('#formatInfo').textContent = innerWidth < 700 ? (DS.FORMATE[fk0]?.name || '') : `${DS.FORMATE[fk0]?.name || ''}\u00a0· ${(f.rund ? 'Ø ' + f.b : f.b + ' × ' + f.h).replace(/ /g, '\u00a0')}\u00a0mm${dg ? '' : '\u00a0· bleed\u00a03\u00a0mm'}`;   // Tor 1, 31.10.: am Handy nur der Name, sonst abgeschnitten
    $('#zoomWert').textContent = Math.round(S / PX_MM * 100) + ' %';
    $('#btnZurueck').disabled = !ST.hist.length; $('#btnVor').disabled = !ST.zukunft.length;
    zeichneSeitenwahl(); zeichneEigenschaften(); zeichnePruefung(); if ($('.tab[data-tab="entwerfen"].an')) zeichneBausteine();
    const zipK = $('#menueSpeichern [data-aus="zip"]'); if (zipK) zipK.hidden = !(sozial() && doc.seiten.length > 1);
  }
  function domVon(id) { return $(`#wirt .blatt .el[data-id="${id}"]`); }
  function zeichneAuswahl(live) {
    const ue = $('#ueber'); if (!ue) return;
    ue.querySelectorAll('.auswahl,.griff,.hl,.mass').forEach(n => n.remove());
    const el = ST.sel && elById(ST.sel); if (!el) return;
    const S = ST.S, b = live || { x: el.x, y: el.y, w: el.w, h: DS.elHoehe(ST.M, el) };
    const a = document.createElement('div'); a.className = 'auswahl' + (ST.modus === 'ausschnitt' ? ' ausschnitt' : '');
    Object.assign(a.style, { left: (b.x + B) * S + 'px', top: (b.y + B) * S + 'px', width: Math.max(2, b.w * S) + 'px', height: Math.max(2, b.h * S) + 'px' });
    ue.appendChild(a);
    if (ST.modus) return;
    const senk = el.typ === 'linie' && el.h > el.w;
    let gr = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    if (el.typ === 'text' || (el.typ === 'linie' && !senk)) gr = ['w', 'e'];
    if (senk) gr = ['n', 's'];
    if (el.typ === 'zeichen' || el.typ === 'fundus') gr = ['nw', 'ne', 'se', 'sw'];
    const pos = { nw: [0, 0], n: [.5, 0], ne: [1, 0], e: [1, .5], se: [1, 1], s: [.5, 1], sw: [0, 1], w: [0, .5] };
    for (const g of gr) {
      const d = document.createElement('div'); d.className = 'griff'; d.dataset.griff = g;
      d.style.left = (b.x + B + b.w * pos[g][0]) * S + 'px'; d.style.top = (b.y + B + b.h * pos[g][1]) * S + 'px';
      d.style.cursor = { nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize', n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize' }[g];
      ue.appendChild(d);
    }
  }
  function zeichneSeitenwahl() {
    const n = ST.doc.seiten.length;
    const so = sozial();
    $('#seitenwahl').innerHTML = ST.doc.seiten.map((_, i) => `<button data-seite="${i}" class="${i === ST.seite ? 'an' : ''}">${so ? 'Image ' + (i + 1) : n === 2 ? (i ? 'Back' : 'Front') : 'Page ' + (i + 1)}</button>`).join('') +
      `<button data-seite="neu" title="${so ? 'Add an image in the same style' : 'Add a page'}">+</button>`;
  }
  function zeichnePruefung() {
    const p = DS.pruefe(ST.M, ST.doc), b = $('#btnPruefen');
    $('#pruefZahl').textContent = p.length;
    b.classList.toggle('rot', p.some(x => x.stufe === 'rot')); b.classList.toggle('gut', !p.length);
    b.title = p.length ? p.map(x => x.text).join('\n') : 'Ready to print';
  }

  /* ---------- Eigenschaften ---------- */
  const farbListe = () => ST.M.fundus ? ST.M.fundus.farben.map(f => f.id) : Object.keys(ST.M.farben);

  /* Mac 23.11.2026 (Robert, Bild Chalkboard «Jetzt sehe ich hier gar nix mehr»): ein Klick auf eine Farbe für den Grund liess die Schrift in ihrer alten Farbe stehen,
     helle Schrift auf hellem Grund verschwand. Nach jedem Grundwechsel bekommt jeder Text, jede Linie, jeder Rahmen und jedes Zeichen mit zu wenig Kontrast
     die dunkelste bzw. hellste Farbe der Marke. */
  /* Mac 23.11.2026 (Prüfung): gemessen wird gegen den echten Hintergrund jedes Elements (Tafel, Band, Scheibe unter dem Text), nicht nur gegen den Seitengrund;
     sonst bekam der Titel auf der hellen Tafel des Instagram-Beitrags bei schwarzem Grund Weiss (Kontrast 1,14). Werkzeug: DS.lesbar in satz.js. */
  function kontrastNachGrund(s) { DS.lesbar(ST.M, s, ['text', 'linie', 'rahmen', 'zeichen']); }

  /* Elemente aus dem Brand kit (Mac 23.11.2026, Prüfung): wird ein Teil umgefärbt, prüfen, welche Schrift und welche Zeichen auf welchem Teil liegen.
     Hat ein Teil darauf weniger als Kontrast 3, bekommt er die lesbare Markenfarbe (dunkelste oder hellste), so wie kontrastNachGrund es für die Seite macht.
     Der Teil, den man selbst gewählt hat, bleibt; liegt er selbst als Schrift auf einem anderen Teil, wird dieser andere Teil angepasst. */
  let teilWirt = null;
  function teileLesbar(el, gewaehlt) {
    const fe = DS.fundusElement(el); if (!fe || !(fe.teile || []).length) return;
    const enden = DS.farbEnden(ST.M); if (!enden) return;
    if (!teilWirt) { teilWirt = document.createElement('div'); teilWirt.setAttribute('aria-hidden', 'true'); teilWirt.style.cssText = 'position:fixed;left:-4000px;top:0;width:400px;height:400px;visibility:hidden;pointer-events:none'; document.body.appendChild(teilWirt); }
    const farbeVon = t => DS.farbe(ST.M, (el.teile || {})[t] || (fe.teile.find(x => x.id === t) || {}).farbe);
    teilWirt.innerHTML = DS.fundusSvg(ST.M, el);
    const svg = teilWirt.querySelector('svg'); if (!svg) { teilWirt.innerHTML = ''; return; }
    // gemalte Teile in Zeichenfolge: Flächen (data-tf) mit Box; Linien (data-ts) und blasse Glanzlichter zählen nicht
    const kappe = (r, n) => { const in_ = n.parentNode && n.parentNode.closest && n.parentNode.closest('svg'); if (!in_ || in_ === svg || /visible/.test(in_.getAttribute('overflow') || in_.style.overflow || '')) return r;   // Zeichen in einem eigenen Ausschnitt (Billardkugel «T»): nur der sichtbare Teil zählt
      const m = in_.parentNode.getScreenCTM(), at = a => parseFloat(in_.getAttribute(a)) || 0, pt = (x, y) => { const q = svg.createSVGPoint(); q.x = x; q.y = y; return q.matrixTransform(m); };
      if (!m) return r;
      const p0 = pt(at('x'), at('y')), p1 = pt(at('x') + at('width'), at('y') + at('height')), k = { left: Math.min(p0.x, p1.x), top: Math.min(p0.y, p1.y), right: Math.max(p0.x, p1.x), bottom: Math.max(p0.y, p1.y) };
      const left = Math.max(r.left, k.left), top = Math.max(r.top, k.top), right = Math.min(r.right, k.right), bottom = Math.min(r.bottom, k.bottom);
      return { left, top, right, bottom, width: Math.max(0, right - left), height: Math.max(0, bottom - top) }; };
    const stuecke = [...svg.querySelectorAll('[data-tf]')].map((n, i) => {
      const r = kappe(n.getBoundingClientRect(), n), op = parseFloat(n.getAttribute('opacity') || getComputedStyle(n).opacity || 1);
      const tag = n.tagName.toLowerCase(), schrift = tag === 'text' || tag === 'g' || (tag === 'path' && n.closest('svg') !== svg);
      return { i, teil: n.getAttribute('data-tf'), r, op, schrift, flaeche: !schrift && n.getAttribute('fill') !== 'none' && op >= .5 };
    }).filter(x => x.r.width > 0 && x.r.height > 0);
    const paare = [];
    for (const v of stuecke) {
      if (!v.schrift || v.op < .7) continue;
      const cx = v.r.left + v.r.width / 2, cy = v.r.top + v.r.height / 2;
      const u = stuecke.filter(x => x.i < v.i && x.flaeche && x.teil !== v.teil && cx > x.r.left && cx < x.r.right && cy > x.r.top && cy < x.r.bottom).pop();
      if (u) paare.push({ vorn: v.teil, hinten: u.teil });
    }
    teilWirt.innerHTML = '';
    const fest = new Set([gewaehlt]), geaendert = new Set([gewaehlt]), wahl = [enden.dunkel, enden.hell];
    for (let n = 0; n < fe.teile.length; n++) {
      const schlecht = paare.filter(p => (geaendert.has(p.vorn) || geaendert.has(p.hinten)) && DS.kontrast(farbeVon(p.vorn), farbeVon(p.hinten)) < 3)
        .sort((a, b) => DS.kontrast(farbeVon(a.vorn), farbeVon(a.hinten)) - DS.kontrast(farbeVon(b.vorn), farbeVon(b.hinten)));
      const p = schlecht.find(x => !fest.has(x.vorn) || !fest.has(x.hinten)); if (!p) break;
      const t = !fest.has(p.vorn) ? p.vorn : p.hinten;
      // die Farbe, die gegen alle Nachbarn dieses Teils den kleinsten Kontrast am grössten macht
      const nachbarn = paare.filter(x => x.vorn === t || x.hinten === t).map(x => x.vorn === t ? x.hinten : x.vorn).filter(x => x !== t);
      const feste = nachbarn.filter(x => fest.has(x)), gegen = feste.length ? feste : nachbarn;   // nur gegen schon feste Nachbarn; die anderen passen sich danach an
      const guete = k => Math.min(...gegen.map(x => DS.kontrast(DS.farbe(ST.M, k), farbeVon(x))));
      const ziel = wahl.sort((a, b) => guete(b) - guete(a))[0];
      el.teile = Object.assign({}, el.teile, { [t]: ziel }); fest.add(t); geaendert.add(t);
    }
  }
  const farbGleich = (aktiv, k) => aktiv === k || (aktiv && ST.M.farben[aktiv] && ST.M.farben[aktiv].toLowerCase() === ST.M.farben[k].toLowerCase() && !farbListe().includes(aktiv));
  const farbKnoepfe = (aktiv, art, teil) => `<div class="farben">${farbListe().map(k => `<button data-farbe="${k}" data-art="${art}"${teil ? ` data-teil="${esc(teil)}"` : ''} title="${esc(ST.M.farbnamen[k] || k)}" style="background:${ST.M.farben[k]}" class="${farbGleich(aktiv, k) ? 'an' : ''}"></button>`).join('')}</div>`;
  const regler = (name, wert, min, max, schritt, anzeige) => `<div class="regler"><input type="range" data-regler="${name}" min="${min}" max="${max}" step="${schritt}" value="${wert}"><output>${anzeige}</output></div>`;
  const masse = (el, felder) => `<div class="masse">${felder.map(([k, t]) => `<label>${t}<input type="number" step="0.5" data-mass="${k}" value="${r2(el[k])}"></label>`).join('')}</div>`;
  const ROLLEN = [['titel', 'Title'], ['kapitale', 'Capitals'], ['text', 'Text'], ['kursiv', 'Stressed'], ['mono', 'Line'], ['web', 'Website title']];
  /* Gestalten (Robert 16.10.2026, für alle Werkzeuge gleich): Schriftart, Textart und Schriftgrösse getrennt wählbar */
  const SCHRIFTEN = [['titel', 'Title'], ['kapitale', 'Capitals'], ['text', 'Text'], ['mono', 'Line'], ['web', 'Website title']];
  const textart = el => el.rolle === 'kursiv' ? 'kursiv' : el.gross ? 'versal' : 'normal';
  const kursivGeht = el => (el.rolle === 'text' || el.rolle === 'kursiv') && !!ST.M.schriften.kursiv;

  let rechtsSchluessel = '', eTextVor = null, eTextT = 0;
  /* Gestalten als Seitenmenü (Entscheid 16.10.2026 für alle Werkzeuge): offen, sobald ein Element gewählt ist oder die Seite angetippt wird;
     zu mit ×, Esc oder Klick neben das Blatt. Die Grösse des Blatts bleibt dabei gleich, es rückt nur zur Seite. */
  const ZU_KNOPF = '<button class="rechts__zu" data-tu="zu" aria-label="Close (Esc)" title="Close (Esc)"><svg viewBox="0 0 24 24"><path d="M9 14.5 4 9.5l5-5M4 9.5h11a5 5 0 0 1 0 10h-3"/></svg></button>';
  function rechtsOffen(offen) {
    const st = document.querySelector('.studio'); if (!st || st.classList.contains('rechts-zu') === !offen) return;
    st.classList.toggle('rechts-zu', !offen);
  }
  function zeichneEigenschaften() {
    const R = $('#rechts'), el = ST.sel && elById(ST.sel), M = ST.M;
    rechtsOffen(!!el || !!ST.seitePanel);
    if (el && !ST.urform[el.id]) ST.urform[el.id] = JSON.stringify(el);
    const schl = (el ? el.id : 'seite' + ST.seite) + ST.doc.id;
    if (schl !== rechtsSchluessel) { rechtsSchluessel = schl; if (eTextVor) { const vor = eTextVor; eTextVor = null; ST.hist.push(vor); ST.zukunft = []; speichern(); } R.classList.remove('wechsel'); void R.offsetWidth; R.classList.add('wechsel'); }
    if (!el) {
      const s = seite(), q = s.quelle;
      R.innerHTML = `<div class="rechts__kopf"><small>Design</small>${ZU_KNOPF}</div><h2>${sozial() ? (ST.doc.seiten.length > 1 ? 'Image ' + (ST.seite + 1) + ' of ' + ST.doc.seiten.length : 'The post') : ST.doc.seiten.length > 1 ? (ST.doc.seiten.length === 2 ? (ST.seite ? 'Back' : 'Front') : 'Page ' + (ST.seite + 1)) : 'The page'}</h2>
        <p class="klein">Click a part to change it. Double-click text to write on the page, double-click a photo to move what shows.</p>
        ${window.DSIg ? DSIg.panel(ST.doc) : ''}
        ${ST.doc.stueck ? `<div class="gruppe"><label>Piece of the house</label><div class="knoepfe"><button data-tu="stueckKopie">Work on a copy</button><button data-tu="stueckOriginal">Back to the original</button></div>
          <p class="klein">Your changes are saved under «${esc(ST.doc.name)}» in My designs. The original stays as it is in the print files of the house.</p></div>` : ''}
        <div class="gruppe"><label>Size</label><select id="eFormat">${Object.entries(DS.FORMATE).filter(([k, f]) => !f.haus || k === DS.blattK(ST.doc, ST.seite)).map(([k, f]) => `<option value="${k}" ${k === DS.blattK(ST.doc, ST.seite) ? 'selected' : ''}>${f.name.replace(/ /g, '\u00a0')}\u00a0· ${f.rund ? 'Ø ' + f.b : f.b + ' × ' + f.h} mm</option>`).join('')}</select>
          <p class="klein">When you change it, every page is set again in the new size. Texts and photos stay.</p></div>
        ${q ? `<div class="gruppe"><button class="knopf knopf--voll" data-tu="neuSetzen" style="height:42px">Set the page again<i><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4"/></svg></i></button>
          <p class="klein">Sets the page again with your changed texts and photos, so the spacing is right again.</p></div>` : ''}
        <div class="gruppe"><label>Layout</label><select id="eVorlage"><option value="">${q ? '' : 'Free layout'}</option>${Object.entries(DS.VORLAGEN).filter(([k]) => DS.formatPasst(k, ST.doc.formatKey) || (q && q.vorlage === k)).map(([k, v]) => `<option value="${k}" ${q && q.vorlage === k ? 'selected' : ''}>${v.name}</option>`).join('')}</select></div>
        <div class="gruppe"><label>Ground</label><div class="segment" id="eTon">${[['dunkel', 'Black'], ['hell', 'Paper'], ['creme', 'White'], ['dc', 'Red'], ['gruen', 'Green']].map(([k, t]) => `<button data-ton="${k}" class="${(q ? q.ton === k : ST.M.toene[k] && s.grund === ST.M.toene[k].grund) ? 'an' : ''}">${t}</button>`).join('')}</div>
          <div style="margin-top:10px">${farbKnoepfe(s.grund, 'grund')}</div>
          <label style="margin:14px 0 8px">Pattern</label><div class="segment" id="eTapete">${[['', 'No pattern'], ['dunkel', 'Dark'], ['hell', 'Light']].map(([k, t]) => `<button data-tapete="${k}" class="${(s.tapete || '') === k ? 'an' : ''}">${t}</button>`).join('')}</div></div>
        <div class="gruppe"><label>Pages</label><div class="knoepfe">${sozial() ? '' : '<button data-tu="rueckseite">Add a back</button>'}<button data-tu="seiteKopie">${sozial() ? 'Copy image' : 'Copy page'}</button>
          ${ST.doc.seiten.length > 1 ? `<button data-tu="seiteWeg" class="weg">${sozial() ? 'Delete image' : 'Delete page'}</button>` : ''}</div></div>`;
      return;
    }
    let h = `<div class="rechts__kopf"><small>Design</small>${ZU_KNOPF}</div><h2>${el.typ === 'fundus' ? esc((DS.fundusElement(el) || {}).name || 'Element') : { text: 'Text', bild: 'Photo', flaeche: 'Shape', linie: 'Rule', rahmen: 'Frame', zeichen: (M.zeichennamen || {})[el.z || 1] || 'Mark' }[el.typ]}</h2>`;
    const masseZeile = (felder) => `<div class="gruppe"><label>Position in mm</label>${masse(el, felder)}</div>`;
    if (el.typ === 'text') {
      h += `<div class="gruppe gestalten"><label>Font</label><div class="segment segment--schrift">${SCHRIFTEN.filter(([k]) => M.schriften[k]).map(([k, t]) => `<button data-rolle="${k}" class="${(el.rolle === 'kursiv' ? 'text' : el.rolle) === k ? 'an' : ''}" style="font-family:'DS-${k}'">${esc(M.schriften[k].familie || t).replace(/ (\S+)$/, '\u00a0$1')}</button>`).join('')}</div></div>
        <div class="gruppe"><label>Size</label><div class="groesse"><button data-grschritt="-1" aria-label="Smaller">−</button><input type="number" min="4" max="400" step="0.5" data-grpt="1" value="${r2(el.gr * PT)}"><span>pt</span><button data-grschritt="1" aria-label="Larger">+</button></div>
          ${regler('gr', el.gr, .8, Math.max(40, el.gr), .05, r2(el.gr * PT) + ' pt')}</div>
        <div class="gruppe"><label>Style</label><div class="segment">${[['normal', 'Normal'], ['kursiv', 'Stressed'], ['versal', 'Spaced capitals']].map(([k, t]) => `<button data-textart="${k}" class="${textart(el) === k ? 'an' : ''}" ${k === 'kursiv' && !kursivGeht(el) ? 'disabled title="Stressed text exists only for Instrument Sans"' : ''}>${t}</button>`).join('')}</div></div>
        <div class="gruppe"><label>Colour</label>${farbKnoepfe(el.farbe, 'el')}</div>
        <div class="gruppe"><label>Alignment</label><div class="segment">${[['l', 'Left'], ['c', 'Centre'], ['r', 'Right']].map(([k, t]) => `<button data-ausr="${k}" class="${(el.ausr || 'l') === k ? 'an' : ''}">${t}</button>`).join('')}</div></div>
        <div class="gruppe"><label>Spacing</label><label class="unter">Letter spacing</label>${regler('sperr', el.sperr || 0, -.03, .45, .01, (el.sperr || 0).toFixed(2))}
          <label class="unter">Line spacing</label>${regler('zeile', el.zeile || 1.2, .85, 2.2, .01, (el.zeile || 1.2).toFixed(2))}
          <label class="unter">Opacity</label>${regler('deck', el.deck ?? 1, .2, 1, .01, Math.round((el.deck ?? 1) * 100) + ' %')}</div>
        <div class="gruppe"><label>Content</label><textarea class="textfeld" id="eText" rows="3">${esc(el.text)}</textarea><p class="klein">Or double-click the text and write on the page.</p></div>
        ${masseZeile([['x', 'Left'], ['y', 'Top'], ['w', 'Width']])}`;
    } else if (el.typ === 'bild') {
      const b = M.bildIndex[el.bild];
      h += `<div class="gruppe"><label>Size in mm</label>${masse(el, [['w', 'Width'], ['h', 'Height']])}<div class="knoepfe" style="margin-top:10px"><button data-tu="randlos">Full bleed</button></div></div>
        <div class="gruppe"><label>Crop</label>${regler('zoom', el.zoom || 1, 1, 3, .01, Math.round((el.zoom || 1) * 100) + ' %')}
          ${regler('fx', el.fx ?? .5, 0, 1, .01, 'left/right')}${regler('fy', el.fy ?? .5, 0, 1, .01, 'up/down')}
          <p class="klein">Or double-click the photo and move it with the mouse.</p></div>
        <div class="gruppe"><label>Photo</label><p class="klein" style="margin:0 0 8px">${esc(b ? b.alt : 'no photo')}</p><div class="knoepfe"><button data-tu="fotoWahl">Change photo</button></div></div>
        <div class="gruppe"><label>Corners</label>${regler('r', el.r || 0, 0, 20, .5, r2(el.r || 0) + ' mm')}</div>
        ${masseZeile([['x', 'Left'], ['y', 'Top']])}`;
    } else if (el.typ === 'flaeche') {
      h += `<div class="gruppe"><label>Colour</label>${farbKnoepfe(el.farbe, 'el')}
          <div class="segment" style="margin-top:10px">${[['', 'No pattern'], ['dunkel', 'Dark'], ['hell', 'Light']].map(([k, t]) => `<button data-eltapete="${k}" class="${(el.tapete || '') === k ? 'an' : ''}">${t}</button>`).join('')}</div></div>
        <div class="gruppe"><label>Opacity</label>${regler('deck', el.deck ?? 1, .1, 1, .01, Math.round((el.deck ?? 1) * 100) + ' %')}<label class="unter">Corners</label>${regler('r', el.r || 0, 0, 40, .5, r2(el.r || 0) + ' mm')}</div>
        ${masseZeile([['x', 'Left'], ['y', 'Top'], ['w', 'Width'], ['h', 'Height']])}`;
    } else if (el.typ === 'linie' || el.typ === 'rahmen') {
      const senk = el.typ === 'linie' && el.h > el.w;
      h += `<div class="gruppe"><label>Weight</label>${regler('staerke', el.staerke, .1, 2, .05, r2(el.staerke * PT * 10) / 10 + ' pt')}</div>
        <div class="gruppe"><label>${el.typ === 'rahmen' ? 'Size in mm' : 'Length in mm'}</label>${masse(el, el.typ === 'rahmen' ? [['w', 'Width'], ['h', 'Height']] : senk ? [['h', 'Length']] : [['w', 'Length']])}</div>
        <div class="gruppe"><label>Colour</label>${farbKnoepfe(el.farbe, 'el')}</div>
        <div class="gruppe"><label>Opacity</label>${regler('deck', el.deck ?? 1, .1, 1, .01, Math.round((el.deck ?? 1) * 100) + ' %')}
          ${el.typ === 'rahmen' ? `<label class="unter">Corners</label>${regler('r', el.r || 0, 0, 20, .5, r2(el.r || 0) + ' mm')}` : ''}</div>
        ${masseZeile([['x', 'Left'], ['y', 'Top']])}`;
    } else if (el.typ === 'zeichen') {
      h += `<div class="gruppe"><label>Which mark</label><div class="segment">${[1, 2, 3].filter(z => z === 1 || M['zeichen' + z]).map(z => `<button data-zz="${z}" class="${(el.z || 1) === z ? 'an' : ''}">${esc((M.zeichennamen || {})[z] || z)}</button>`).join('')}</div></div>
        <div class="gruppe"><label>Size in mm</label>${masse(el, [['w', 'Width']])}</div>
        <div class="gruppe"><label>Colour</label>${farbKnoepfe(el.farbe, 'el')}</div>
        <div class="gruppe"><label>Opacity</label>${regler('deck', el.deck ?? 1, .05, 1, .01, Math.round((el.deck ?? 1) * 100) + ' %')}</div>
        ${masseZeile([['x', 'Left'], ['y', 'Top']])}`;
    } else if (el.typ === 'fundus') {   // Werkzeuge 2.0: Element aus dem Markenfundus, jeder Teil mit eigener Farbe
      const fe = DS.fundusElement(el) || { teile: [] };
      h += `<p class="klein">${esc(fe.satz || '')}</p>
        <div class="gruppe"><label>Size in mm</label>${masse(el, [['w', 'Width']])}</div>
        ${(fe.teile || []).map(t => `<div class="gruppe"><label>${esc(t.name)}</label>${farbKnoepfe((el.teile || {})[t.id] || t.farbe, 'teil', t.id)}</div>`).join('')}
        ${Object.keys(el.teile || {}).length ? '<div class="gruppe"><div class="knoepfe"><button data-tu="teileZurueck">Colours as in the brand book</button></div></div>' : ''}
        <div class="gruppe"><label>Opacity</label>${regler('deck', el.deck ?? 1, .05, 1, .01, Math.round((el.deck ?? 1) * 100) + ' %')}</div>
        ${masseZeile([['x', 'Left'], ['y', 'Top']])}`;
    }
    h += `<div class="gruppe"><label>Arrange</label><div class="knoepfe">
      <button data-tu="mitteH" class="breit">Centre across</button><button data-tu="mitteV" class="breit">Centre up and down</button>
      <button data-tu="vorn">Forward</button><button data-tu="hinten">Backward</button>
      <button data-tu="kopie">Duplicate</button></div></div>
      <div class="gruppe rechts__fuss"><div class="knoepfe"><button data-tu="zuruecksetzen" ${ST.urform[el.id] && ST.urform[el.id] !== JSON.stringify(el) ? '' : 'disabled'}>Reset part</button><button data-tu="weg" class="weg">Remove</button></div></div>`;
    R.innerHTML = h;
  }

  /* Eigenschaften: Ereignisse */
  function rechtsEreignisse() {
    const R = $('#rechts');
    let reglerStart = null;
    R.addEventListener('input', e => {
      const t = e.target, el = ST.sel && elById(ST.sel);
      if (t.dataset.regler && el) {
        if (!reglerStart) { reglerStart = JSON.stringify(ST.doc); }
        const k = t.dataset.regler, v = +t.value;
        el[k] = v;
        if (el.typ === 'text') el.h = DS.mess(el).h;
        const alt = domVon(el.id), neu = DS.elementDom(ST.M, el, ST.S, { editor: true });
        alt.replaceWith(neu); zeichneAuswahl();
        const out = t.parentNode.querySelector('output');
        out.textContent = k === 'gr' ? r2(v * PT) + ' pt' : k === 'deck' || k === 'zoom' ? Math.round(v * 100) + ' %' : k === 'r' ? r2(v) + ' mm' : k === 'staerke' ? r2(v * PT * 10) / 10 + ' pt' : k === 'fx' ? 'left/right' : k === 'fy' ? 'up/down' : v.toFixed(2);
      }
      if (t.id === 'eText' && el) {
        if (!eTextVor) eTextVor = JSON.stringify(ST.doc);   // Stand vor dem ersten Buchstaben, damit «Rückgängig» das ganze Tippen zurücknimmt (Prüfung 16.10.2026)
        $('#btnZurueck').disabled = false;
        clearTimeout(eTextT); eTextT = setTimeout(() => { if (ST.doc) speichern(); }, 900);   // auch ohne Verlassen des Felds gesichert (Fenster zu, Akku leer)
        el.text = t.value; el.h = DS.mess(el).h;
        domVon(el.id).replaceWith(DS.elementDom(ST.M, el, ST.S, { editor: true })); zeichneAuswahl();
      }
    });
    R.addEventListener('change', e => {
      const t = e.target, el = ST.sel && elById(ST.sel);
      if (t.dataset.regler && reglerStart) {
        ST.hist.push(reglerStart); ST.zukunft = []; reglerStart = null; seite().frei = true; speichern(); zeichne(); return;
      }
      if (t.id === 'eText' && el) {
        const v = t.value, vor = eTextVor || JSON.stringify(ST.doc); eTextVor = null;
        ST.hist.push(vor); if (ST.hist.length > 100) ST.hist.shift(); ST.zukunft = [];
        el.text = v; setzeSlot(seite(), el.slot, v); for (const x of seite().el) if (x.typ === 'text') x.h = DS.mess(x).h;
        speichern(); zeichne(); return;
      }
      if (t.dataset.mass && el) { const k = t.dataset.mass, v = +t.value; aendern(() => { el[k] = v; }); return; }
      if (t.dataset.grpt && el && +t.value > 0) { const v = Math.min(400, Math.max(4, +t.value)); aendern(() => { el.gr = v / PT; el.h = DS.mess(el).h; }); return; }
      if (t.id === 'eFormat') return umsetzenFormat(t.value);
      if (t.id === 'eVorlage' && t.value) return umsetzenSeite({ vorlage: t.value });
    });
    R.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const el = ST.sel && elById(ST.sel), s = seite(), f = DS.blattF(ST.doc, ST.seite);
      if (b.dataset.ig && window.DSIg) { DSIg.klick(b.dataset.ig); return; }
      if (b.dataset.farbe) {
        const k = b.dataset.farbe;
        if (b.dataset.art === 'grund') aendern(() => { s.grund = k; kontrastNachGrund(s); }, false);
        else if (b.dataset.art === 'teil') aendern(() => { el.teile = Object.assign({}, el.teile, { [b.dataset.teil]: k }); teileLesbar(el, b.dataset.teil); });
        else aendern(() => { el.farbe = k; });
      } else if (b.dataset.rolle) aendern(() => { const versal = el.gross, sp = el.sperr; el.rolle = b.dataset.rolle; const S0 = DS.STIL[el.rolle] || {}; Object.assign(el, { zeile: S0.zeile || 1.2, sperr: S0.sperr || 0, gross: !!S0.gross }); if (versal) Object.assign(el, { gross: true, sperr: Math.max(sp || 0, el.sperr || 0) }); el.h = DS.mess(el).h; });
      else if (b.dataset.textart) aendern(() => {
        const a = b.dataset.textart;
        if (a === 'kursiv') { el.rolle = 'kursiv'; el.gross = false; }
        else { if (el.rolle === 'kursiv') el.rolle = 'text'; el.gross = a === 'versal'; el.sperr = a === 'versal' ? Math.max(el.sperr || 0, .08) : (DS.STIL[el.rolle] && !DS.STIL[el.rolle].gross ? DS.STIL[el.rolle].sperr || 0 : 0); }
        el.h = DS.mess(el).h;
      });
      else if (b.dataset.grschritt) aendern(() => { el.gr = Math.max(4 / PT, (Math.round(el.gr * PT) + +b.dataset.grschritt) / PT); el.h = DS.mess(el).h; });
      else if (b.dataset.ausr) aendern(() => { el.ausr = b.dataset.ausr; });
      else if (b.dataset.zz) aendern(() => { el.z = +b.dataset.zz === 1 ? undefined : +b.dataset.zz; });
      else if (b.dataset.gross) aendern(() => { el.gross = !el.gross; });
      else if (b.dataset.eltapete !== undefined) aendern(() => { el.tapete = b.dataset.eltapete || null; });
      else if (b.dataset.tapete !== undefined) aendern(() => { s.tapete = b.dataset.tapete || null; }, false);
      else if (b.dataset.ton) { const T = ST.M.toene[b.dataset.ton]; if (!s.quelle && T) aendern(() => { s.grund = T.grund; kontrastNachGrund(s); }, false); else umsetzenSeite({ ton: b.dataset.ton }); }   // Stück des Hauses: nur der Grund wechselt, die Seite bleibt
      else if (b.dataset.tu) {
        const tu = b.dataset.tu;
        if (tu === 'zu') { ST.sel = null; ST.seitePanel = false; zeichne(); return; }
        if (tu === 'zuruecksetzen') { const u = ST.urform[el.id]; if (u) aendern(() => { Object.keys(el).forEach(k => delete el[k]); Object.assign(el, JSON.parse(u)); }); return; }
        if (tu === 'teileZurueck') { aendern(() => { delete el.teile; }); return; }
        if (tu === 'weg') { aendern(() => { s.el = s.el.filter(x => x !== el); }); ST.sel = null; zeichne(); }
        else if (tu === 'kopie') { const k = JSON.parse(JSON.stringify(el)); k.id = DS.neueId(); k.x += 4; k.y += 4; delete k.slot; aendern(() => s.el.push(k)); ST.sel = k.id; zeichne(); }
        else if (tu === 'vorn') aendern(() => { const i = s.el.indexOf(el); if (i < s.el.length - 1) { s.el.splice(i, 1); s.el.splice(i + 1, 0, el); } });
        else if (tu === 'hinten') aendern(() => { const i = s.el.indexOf(el); if (i > 0) { s.el.splice(i, 1); s.el.splice(i - 1, 0, el); } });
        else if (tu === 'mitteH') aendern(() => { el.x = (f.b - el.w) / 2; });
        else if (tu === 'mitteV') aendern(() => { el.y = (f.h - DS.elHoehe(ST.M, el)) / 2; });
        else if (tu === 'randlos') aendern(() => Object.assign(el, { x: -B, y: -B, w: f.b + 2 * B, h: f.h + 2 * B, r: 0 }));
        else if (tu === 'fotoWahl') zeigeTab('fotos');
        else if (tu === 'neuSetzen') umsetzenSeite({});
        else if (tu === 'rueckseite') { aendern(() => ST.doc.seiten.push(DS.setze(ST.M, ST.doc.formatKey, 'rueckseite', seite().quelle?.ton || 'dunkel', DS.BEISPIEL.rueckseite)), false); ST.seite = ST.doc.seiten.length - 1; zeichne(); }
        else if (tu === 'seiteKopie') { const k = JSON.parse(JSON.stringify(s)); k.el.forEach(x => x.id = DS.neueId()); aendern(() => ST.doc.seiten.splice(ST.seite + 1, 0, k), false); ST.seite++; zeichne(); }
        else if (tu === 'stueckKopie') oeffneStueck(ST.doc.stueck, { kopie: true, von: ST.doc });
        else if (tu === 'stueckOriginal') (async () => { if (alleDocs()[ST.doc.id] && !(await frag('Your changes to this piece go away and the original of the house opens again.'))) return; const d = alleDocs(); delete d[ST.doc.id]; schreib(LS.docs, d); oeffneStueck(ST.doc.stueck, { original: true }); melde('The original of the house is open again.'); })();
        else if (tu === 'seiteWeg') { aendern(() => { ST.doc.seiten.splice(ST.seite, 1); ST.seite = Math.max(0, Math.min(ST.seite - 1, ST.doc.seiten.length - 1)); }, false); zeichne(); }
      }
    });
  }

  /* ---------- Umsetzen: Format, Aufbau, Ton ---------- */
  async function frag(text) {
    return dialog(`<h2>Set again?</h2><p>${text}</p>`, [{ t: 'Cancel', v: false }, { t: 'Set again', v: true, haupt: true }]);
  }
  async function umsetzenSeite(neu) {
    const s = seite();
    const q = s.quelle || { vorlage: 'deckel', ton: 'dunkel', inhalt: ausSeiteInhalt(s) };
    if (s.frei && !(await frag('The page is set again with the new layout. Texts and photos stay, what you moved on this page goes back.'))) return zeichne();
    ST.auftritt = true;
    aendern(() => { ST.doc.seiten[ST.seite] = DS.setze(ST.M, ST.doc.formatKey, neu.vorlage || q.wunsch || q.vorlage, neu.ton || q.ton, q.inhalt, q.stil); }, false);
    ST.sel = null; zeichne();
  }
  async function umsetzenFormat(fk) {
    const alt = ST.doc.format, nf = DS.FORMATE[fk], alteAufbauten = ST.doc.seiten.map(s => s.quelle && s.quelle.vorlage);
    if (ST.doc.seiten.some(s => s.frei && s.quelle) && !(await frag('All pages are set again in the new size. Texts and photos stay, what you moved goes back.'))) return zeichne();
    aendern(() => {
      ST.doc.seiten = ST.doc.seiten.map(s => {
        if (s.quelle) return DS.setze(ST.M, fk, s.quelle.wunsch || s.quelle.vorlage, s.quelle.ton, s.quelle.inhalt, s.quelle.stil);
        const fa = s.fmt || alt; delete s.fmt;   // Seite mit eigenem Format (Stück des Hauses): ab jetzt im Format des Dokuments
        const kx = nf.b / fa.b, ky = nf.h / fa.h, k = Math.sqrt(kx * ky);
        s.el.forEach(e => { e.x *= kx; e.y *= ky; e.w *= kx; if (e.h) e.h *= ky; if (e.gr) e.gr *= k; if (e.typ === 'text') e.h = DS.mess(e).h; });
        DS.rundeRahmen(nf, s); DS.lesbar(ST.M, s);
        return s;
      });
      ST.doc.formatKey = fk; ST.doc.format = { b: nf.b, h: nf.h };
      ST.auftritt = true;
    }, false);
    ST.sel = null; passeZoom(); zeichne();
    const neu = ST.doc.seiten.map(s => s.quelle && s.quelle.vorlage).filter((v, i) => v && alteAufbauten[i] && v !== alteAufbauten[i]);
    if (neu.length) melde(`${nf.name}: the page now uses the layout «${DS.VORLAGEN[neu[0]].name}», made for this size. The texts stay in the work file.`, 5200);
  }
  function ausSeiteInhalt(s) {
    const t = s.el.filter(e => e.typ === 'text').sort((a, b) => b.gr - a.gr);
    const bild = s.el.find(e => e.typ === 'bild');
    return { titel: t[0]?.text || 'Title', text: t[1]?.text || '', bild: bild?.bild };
  }

  /* ---------- Neue Elemente ---------- */
  function neuesElement(art, bildKey, an) {
    const f = DS.blattF(ST.doc, ST.seite), s = seite(), q = s.quelle, T = ST.M.toene[q?.ton || (s.grund === 'papier' || s.grund === 'creme' || s.grund === 'weiss' ? 'hell' : 'dunkel')];
    const k = Math.pow(Math.sqrt(f.b * f.h / (105 * 148)), .8), id = DS.neueId(), w = f.b * .7, x = (f.b - w) / 2, y = f.h * .4;
    const E = {
      titel: { typ: 'text', rolle: 'titel', text: 'New title', gr: 8 * k, farbe: T.titel, ausr: 'c', x, y, w, ...DS.STIL.titel },
      text: { typ: 'text', rolle: 'text', text: 'Your text', gr: 2.8 * k, farbe: T.text, ausr: 'c', x, y, w, ...DS.STIL.text },
      zeile: { typ: 'text', rolle: 'mono', text: 'One line', gr: 1.9 * k, farbe: T.mono, ausr: 'c', x, y, w, ...DS.STIL.mono },
      bild: (() => { const bb = ST.M.bildIndex[bildKey || DS.ersatzFoto(ST.M)] || { w: 3, h: 2 }; let w = f.b * .7, h = w * bb.h / bb.w; if (h > f.h * .7) { h = f.h * .7; w = h * bb.w / bb.h; } return { typ: 'bild', bild: bildKey || DS.ersatzFoto(ST.M), x: (f.b - w) / 2, y: (f.h - h) / 2, w, h, fx: .5, fy: .5, zoom: 1 }; })(),
      zeichen: { typ: 'zeichen', x: (f.b - 18 * k) / 2, y: f.h * .2, w: 18 * k, farbe: T.zeichen },
      linie: { typ: 'linie', x: (f.b - 14 * k) / 2, y: f.h * .5, w: 14 * k, h: 0, staerke: .3, farbe: T.linie },
      flaeche: { typ: 'flaeche', x: f.b * .2, y: f.h * .3, w: f.b * .6, h: f.h * .3, farbe: T.grund === 'navy' ? 'papier' : 'navy', tapete: null, r: 0 },
      rahmen: { typ: 'rahmen', x: 5 * k, y: 5 * k, w: f.b - 10 * k, h: f.h - 10 * k, staerke: .25, r: 2.2 * k, farbe: T.linie },
      fundus: (() => { const fe = DS.fundusElement(bildKey) || { b: 40, h: 40 }; let w = Math.min(f.b, f.h) * .45, h = w * fe.h / fe.b; if (h > f.h * .6) { h = f.h * .6; w = h * fe.b / fe.h; } return { typ: 'fundus', fid: bildKey, x: (f.b - w) / 2, y: (f.h - h) / 2, w, h }; })(),
    }[art];
    E.id = id; E.deck = 1;
    if (E.typ === 'text') E.h = DS.mess(E).h;
    if (art === 'zeichen' && an && an.z) { E.z = an.z; E.w = Math.min(f.b, f.h) * (an.z === 1 ? .2 : .4); E.x = (f.b - E.w) / 2; }
    if (art === 'bild' && bildKey && ST.M.bildIndex[bildKey]?.datei) { const bb = ST.M.bildIndex[bildKey]; E.w = f.b * (bb.w / bb.h > 3 ? .7 : .45); E.h = E.w * bb.h / bb.w; E.x = (f.b - E.w) / 2; E.y = (f.h - E.h) / 2; }   // Logo, Wortmarke
    if (an && an.x !== undefined) { E.x = an.x - E.w / 2; E.y = an.y - (E.h || E.w) / 2; }   // abgelegt an einer Stelle (Le Livre)
    if (an && an.farbe) E.farbe = an.farbe;
    aendern(() => s.el.push(E));
    ST.sel = id; zeichne();
  }

  /* ---------- Maus auf dem Blatt ---------- */
  function fang(b, el, art) {
    const f = DS.blattF(ST.doc, ST.seite), th = 7 / ST.S, gx = [0, f.b / 2, f.b, DS.SICHER, f.b - DS.SICHER, -B, f.b + B], gy = [0, f.h / 2, f.h, DS.SICHER, f.h - DS.SICHER, -B, f.h + B];
    for (const o of seite().el) {
      if (o === el) continue;
      const oh = DS.elHoehe(ST.M, o);
      gx.push(o.x, o.x + o.w / 2, o.x + o.w); gy.push(o.y, o.y + oh / 2, o.y + oh);
    }
    const linien = [];
    const best = (werte, kand) => {
      let bd = th, bv = null, bk = null;
      for (const [w, i] of werte) for (const k of kand) { const d = Math.abs(w - k); if (d < bd) { bd = d; bv = k - w; bk = k; } }
      return bv === null ? null : { d: bv, k: bk };
    };
    if (art === 'zieh') {
      const sx = best([[b.x, 0], [b.x + b.w / 2, 1], [b.x + b.w, 2]], gx); if (sx) { b.x += sx.d; linien.push({ x: sx.k }); }
      const sy = best([[b.y, 0], [b.y + b.h / 2, 1], [b.y + b.h, 2]], gy); if (sy) { b.y += sy.d; linien.push({ y: sy.k }); }
    } else {
      if (art.includes('e')) { const s = best([[b.x + b.w, 0]], gx); if (s) { b.w += s.d; linien.push({ x: s.k }); } }
      if (art.includes('w')) { const s = best([[b.x, 0]], gx); if (s) { b.x += s.d; b.w -= s.d; linien.push({ x: s.k }); } }
      if (art.includes('s')) { const s = best([[b.y + b.h, 0]], gy); if (s) { b.h += s.d; linien.push({ y: s.k }); } }
      if (art.includes('n')) { const s = best([[b.y, 0]], gy); if (s) { b.y += s.d; b.h -= s.d; linien.push({ y: s.k }); } }
    }
    return linien;
  }
  function zeigeLinien(linien, b) {
    const ue = $('#ueber'), S = ST.S, f = DS.blattF(ST.doc, ST.seite);
    ue.querySelectorAll('.hl,.mass').forEach(n => n.remove());
    for (const l of linien) {
      const d = document.createElement('div'); d.className = 'hl';
      if (l.x !== undefined) Object.assign(d.style, { left: (l.x + B) * S + 'px', top: 0, width: '1px', height: (f.h + 2 * B) * S + 'px' });
      else Object.assign(d.style, { top: (l.y + B) * S + 'px', left: 0, height: '1px', width: (f.b + 2 * B) * S + 'px' });
      ue.appendChild(d);
    }
    if (b) { const m = document.createElement('div'); m.className = 'mass'; m.style.left = (b.x + B + b.w / 2) * S + 'px'; m.style.top = (b.y + B) * S + 'px'; m.textContent = `${r2(b.x)} · ${r2(b.y)} mm  ${r2(b.w)} × ${r2(b.h)}`; ue.appendChild(m); }
  }

  /* Element unter dem Zeiger: Rahmen nur am Rand greifbar, sonst liegt ein seitengrosser Rahmen über allem */
  function elUnter(e, bevorzugt) {
    const S = ST.S, liste = [];
    for (const n of document.elementsFromPoint(e.clientX, e.clientY)) {
      const d = n.closest && n.closest('.blatt .el'); if (!d || liste.includes(d)) continue;
      if (d.classList.contains('el-rahmen')) {
        const r = d.getBoundingClientRect(), t = Math.max(6, 2 * S);
        const amRand = e.clientX - r.left < t || r.right - e.clientX < t || e.clientY - r.top < t || r.bottom - e.clientY < t;
        if (!amRand) continue;
      }
      liste.push(d);
    }
    return liste.find(n => n.dataset.id === bevorzugt) || liste[0] || null;
  }

  function blattEreignisse() {
    const wirt = $('#wirt');
    let zug = null;
    /* Doppelklick am Element festhalten (Mac 23.11.2026, Prüfung: Story und Banner): der erste Klick öffnet die rechte Leiste, das Blatt rückt zur Seite,
       der zweite Klick landete neben dem Text und schloss die Leiste wieder. Kommt der zweite Druck schnell und an derselben Stelle der Maus, gilt er dem Element
       des ersten Drucks, egal wohin das Blatt inzwischen gerückt ist (auch wenn dort jetzt die rechte Leiste liegt, Banner); der Doppelklick öffnet dann dieses Element. */
    let letzterDruck = null, doppel = null;
    const fl = document;
    fl.addEventListener('pointerdown', e => {
      const v = letzterDruck; letzterDruck = null; doppel = null;
      if (ST.modus === 'text' || e.button !== 0 || !v) return;
      if (e.timeStamp - v.t < 500 && Math.hypot(e.clientX - v.x, e.clientY - v.y) < 8 && elById(v.id)) {
        doppel = v.id; e.stopPropagation(); e.preventDefault();
        if (ST.sel !== v.id) { ST.sel = v.id; ST.modus = null; zeichneAuswahl(); zeichneEigenschaften(); }
      }
    }, true);
    fl.addEventListener('pointerdown', e => {
      /* Abnahme 28.11.2026: ein Klick in die linke Spalte, die rechte Platte, das Brand-kit-Fach oder eine Auswahlliste ist kein «Klick daneben». Vorher hob er die
         Auswahl auf, bevor er ankam: ein Foto im Reiter «Photos» wurde neu aufs Blatt gelegt statt getauscht, «Size» und «Layout» in «The page» taten mit der Maus nichts
         (die Platte wurde neu gezeichnet, die Wahl ging an die alte Liste), ein Klick neben einen Knopf der rechten Platte schloss sie. */
      if (e.__wirt || e.button !== 0 || ST.modus === 'text' || e.target.closest('#wirt, .ue, .griff, .werkzeug, button, input, select, textarea, a, label, .links, .rechts, .lf, .hwahl-liste')) return;   // Knöpfe (Seiten, Zoom, Werkzeug) nie neu zeichnen, bevor ihr Klick ankommt
      if (ST.sel || ST.seitePanel || ST.modus) { ST.sel = null; ST.seitePanel = false; ST.modus = null; zeichne(); }
    });
    fl.addEventListener('dblclick', e => {
      if (!doppel) return;
      const el = elById(doppel); doppel = null; e.stopPropagation(); if (!el) return;
      doppelAuf(el);
    }, true);
    const doppelAuf = el => {
      ST.sel = el.id;
      const alt = ST.S; passeZoom(); if (Math.abs(ST.S - alt) > .002) zeichne();   // erst neu einpassen (Leiste ist offen), dann schreiben: der Text liegt nie unter der Leiste
      if (el.typ === 'text') textStart(el);
      else if (el.typ === 'bild') { ST.modus = 'ausschnitt'; zeichneAuswahl(); melde('Move the crop: drag on the photo. Done with Esc or a click next to it.'); }
    };
    wirt.addEventListener('pointerdown', e => {
      e.__wirt = true;   // das Blatt wird gleich neu gezeichnet; der Griff an #flaeche weiss so, dass der Klick auf dem Blatt war
      if (ST.modus === 'text') { if (e.target.closest('.el') && e.target.closest('.el').dataset.id === ST.sel) return; textEnde(); }
      const griff = e.target.closest('.griff');
      const elDom = griff ? null : elUnter(e);
      if (ST.modus === 'ausschnitt') {
        const el = elById(ST.sel);
        if (elDom && elDom.dataset.id === ST.sel) { zug = { art: 'ausschnitt', el, px: e.clientX, py: e.clientY, fx: el.fx ?? .5, fy: el.fy ?? .5, vorher: JSON.stringify(ST.doc) }; wirt.setPointerCapture(e.pointerId); return; }
        ST.modus = null;
      }
      if (griff) {
        const el = elById(ST.sel);
        zug = { art: griff.dataset.griff, el, px: e.clientX, py: e.clientY, b0: { x: el.x, y: el.y, w: el.w, h: DS.elHoehe(ST.M, el) }, vorher: JSON.stringify(ST.doc), bewegt: false };
        wirt.setPointerCapture(e.pointerId); e.preventDefault(); return;
      }
      if (!elDom) { const bq = wirt.querySelector('.blatt')?.getBoundingClientRect(), aufBlatt = !!bq && e.clientX >= bq.left && e.clientX <= bq.right && e.clientY >= bq.top && e.clientY <= bq.bottom; if (ST.sel || ST.seitePanel !== aufBlatt) { ST.sel = null; ST.seitePanel = aufBlatt; zeichne(); } return; }
      const id = elDom.dataset.id, el = elById(id);
      letzterDruck = { id, t: e.timeStamp, x: e.clientX, y: e.clientY };
      if (ST.sel !== id) { ST.sel = id; zeichneAuswahl(); zeichneEigenschaften(); markiereFoto(); }
      zug = { art: 'zieh', el, px: e.clientX, py: e.clientY, b0: { x: el.x, y: el.y, w: el.w, h: DS.elHoehe(ST.M, el) }, vorher: JSON.stringify(ST.doc), bewegt: false };
      wirt.setPointerCapture(e.pointerId); e.preventDefault();
    });
    wirt.addEventListener('pointermove', e => {
      if (!zug) return;
      const S = ST.S, dx = (e.clientX - zug.px) / S, dy = (e.clientY - zug.py) / S, el = zug.el;
      if (zug.art === 'ausschnitt') {
        const b = ST.M.bildIndex[el.bild], a = DS.ausschnitt(el, b.w, b.h);
        const rx = el.w - a.bw, ry = el.h - a.bh;
        el.fx = rx ? Math.min(1, Math.max(0, zug.fx + dx / rx)) : .5; el.fy = ry ? Math.min(1, Math.max(0, zug.fy + dy / ry)) : .5;
        domVon(el.id).replaceWith(DS.elementDom(ST.M, el, S, { editor: true }));
        return;
      }
      if (!zug.bewegt && Math.hypot(e.clientX - zug.px, e.clientY - zug.py) < 3) return;
      zug.bewegt = true;
      const b = Object.assign({}, zug.b0), a = zug.art;
      let linien = [];
      if (a === 'zieh') { b.x += dx; b.y += dy; if (!e.altKey) linien = fang(b, el, 'zieh'); }
      else {
        const prop = el.typ === 'zeichen' || el.typ === 'fundus' || (el.typ === 'bild' && e.shiftKey);
        if (a.includes('e')) b.w = Math.max(2, zug.b0.w + dx);
        if (a.includes('w')) { b.w = Math.max(2, zug.b0.w - dx); b.x = zug.b0.x + zug.b0.w - b.w; }
        if (a.includes('s')) b.h = Math.max(1, zug.b0.h + dy);
        if (a.includes('n')) { b.h = Math.max(1, zug.b0.h - dy); b.y = zug.b0.y + zug.b0.h - b.h; }
        if (prop) { const r = zug.b0.h / zug.b0.w; b.h = b.w * r; if (a.includes('n')) b.y = zug.b0.y + zug.b0.h - b.h; }
        else if (!e.altKey) linien = fang(b, el, a);
      }
      el.x = b.x; el.y = b.y; el.w = b.w;
      if (el.typ === 'text') { el.h = DS.mess(el).h; b.h = el.h; }
      else if (el.typ === 'zeichen') b.h = el.w * DS.zz(ST.M, el).verh;
      else el.h = b.h;
      if (el.typ === 'linie' && !(el.h > el.w)) el.h = 0;
      domVon(el.id).replaceWith(DS.elementDom(ST.M, el, S, { editor: true }));
      zeichneAuswahl(b); zeigeLinien(linien, b);
    });
    const ende = () => {
      if (!zug) return;
      const z = zug; zug = null;
      if (z.art === 'ausschnitt' || z.bewegt) {
        ST.hist.push(z.vorher); ST.zukunft = []; if (z.art !== 'ausschnitt') seite().frei = true;
        speichern(); zeichne();
      }
    };
    wirt.addEventListener('pointerup', ende); wirt.addEventListener('pointercancel', ende);
    wirt.addEventListener('dblclick', e => {
      // Durch das Festhalten des Zeigers kommt der Doppelklick am Wirt an: Element unter dem Zeiger suchen, bevorzugt das gewählte
      const d = elUnter(e, ST.sel); if (!d) return;
      doppelAuf(elById(d.dataset.id));
    });
    wirt.addEventListener('wheel', e => {
      if (ST.modus !== 'ausschnitt') return;
      e.preventDefault();
      const el = elById(ST.sel); el.zoom = Math.min(3, Math.max(1, (el.zoom || 1) * (e.deltaY < 0 ? 1.04 : 1 / 1.04)));
      domVon(el.id).replaceWith(DS.elementDom(ST.M, el, ST.S, { editor: true }));
      clearTimeout(wirt._z); wirt._z = setTimeout(() => { speichern(); zeichneEigenschaften(); zeichnePruefung(); }, 300);
    }, { passive: false });
  }

  let textVorher = null;
  function textStart(el) {
    ST.modus = 'text'; textVorher = JSON.stringify(ST.doc);
    const d = domVon(el.id);
    d.contentEditable = 'plaintext-only';
    if (d.contentEditable !== 'plaintext-only') d.contentEditable = 'true';
    d.focus();
    const r = document.createRange(); r.selectNodeContents(d); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    zeichneAuswahl();
    d.addEventListener('input', () => { el.text = textAus(d); el.h = DS.mess(el).h; zeichneAuswahl(); });
    d.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); textEnde(); } });
  }
  function textAus(d) {
    let t = '';
    for (const n of d.childNodes) t += n.nodeType === 3 ? n.textContent : n.nodeName === 'BR' ? '\n' : (t && !t.endsWith('\n') ? '\n' : '') + n.textContent;
    return t.replace(/\n$/, '');
  }
  function textEnde() {
    if (ST.modus !== 'text') return;
    const el = elById(ST.sel), d = domVon(ST.sel);
    ST.modus = null;
    if (el && d) {
      const neu = textAus(d);
      ST.hist.push(textVorher); ST.zukunft = [];
      el.text = neu; el.h = DS.mess(el).h; setzeSlot(seite(), el.slot, neu);
      speichern();
    }
    passeZoom(); zeichne();   // während des Schreibens passt sich das Blatt nicht an (ResizeObserver wartet), danach schon
  }

  /* Safari (Prüfung 23.11.2026, R09 «alles läuft in allen drei gleich»): verlässt ein Klick das Feld «Content», setzt «change» die Seite neu,
     während die Maus noch gedrückt ist; WebKit schickt dann kein «click» (erster Klick auf «Print check» ging verloren). Kommt nach dem Loslassen
     über demselben Knopf kein «click», löst ihn das Loslassen einmal aus. Chrome und Firefox schicken «click» selbst; dann geschieht hier nichts. */
  (function klickNachFeld() {
    let wartet = null;
    document.addEventListener('pointerdown', e => {
      wartet = null; const b = e.target.closest && e.target.closest('button'), f = document.activeElement;
      if (b && e.pointerType === 'mouse' && e.button === 0 && f && /^(TEXTAREA|INPUT)$/.test(f.tagName) && !b.contains(f)) wartet = b;
    }, true);
    document.addEventListener('click', () => { wartet = null; }, true);
    document.addEventListener('pointerup', e => {
      const b = wartet; if (!b) return;
      setTimeout(() => { if (wartet !== b) return; wartet = null; const u = document.elementFromPoint(e.clientX, e.clientY); if (b.isConnected && !b.disabled && u && b.contains(u)) b.click(); }, 0);
    }, true);
  })();

  /* ---------- Tastatur ---------- */
  function tasten() {
    document.addEventListener('keydown', e => {
      const inFeld = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || ST.modus === 'text';
      const cmd = e.metaKey || e.ctrlKey;
      if (cmd && e.key.toLowerCase() === 'z' && !inFeld) { e.preventDefault(); e.shiftKey ? vor() : zurueck(); return; }
      if (cmd && e.key.toLowerCase() === 's' && ST.doc && $('#start').hidden) { e.preventDefault(); if (document.activeElement && document.activeElement.id === 'eText') document.activeElement.blur(); if (ST.modus === 'text') textEnde(); speichern(); melde('Saved. The design is in My designs.'); return; }   // ⌘S (R09): statt «Seite sichern» des Browsers
      if (inFeld) return;
      if (e.key === 'Escape') { if (ST.modus === 'ausschnitt') { ST.modus = null; zeichne(); } else if (ST.sel || ST.seitePanel) { ST.sel = null; ST.seitePanel = false; zeichne(); } }
      const el = ST.sel && elById(ST.sel); if (!el) return;
      if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); aendern(() => { seite().el = seite().el.filter(x => x !== el); }); ST.sel = null; zeichne(); }
      if (cmd && e.key.toLowerCase() === 'd') { e.preventDefault(); const k = JSON.parse(JSON.stringify(el)); k.id = DS.neueId(); k.x += 4; k.y += 4; delete k.slot; aendern(() => seite().el.push(k)); ST.sel = k.id; zeichne(); }
      const schritt = e.shiftKey ? 5 : .5;
      const pfeil = { ArrowLeft: [-schritt, 0], ArrowRight: [schritt, 0], ArrowUp: [0, -schritt], ArrowDown: [0, schritt] }[e.key];
      if (pfeil) { e.preventDefault(); aendern(() => { el.x += pfeil[0]; el.y += pfeil[1]; }); }
      if (e.key === 'Enter' && el.typ === 'text') { e.preventDefault(); textStart(el); }
    });
  }

  /* ---------- Linke Spalte ---------- */
  function gleiter() {
    const b = $('.reiter button.an'), g = $('.reiter__gleiter'); if (!b || !g) return;
    g.style.width = b.offsetWidth + 'px'; g.style.transform = `translateX(${b.offsetLeft}px)`;
  }
  function zeigeTab(t) {
    $$('.reiter button').forEach(b => b.classList.toggle('an', b.dataset.tab === t));
    gleiter();
    $$('.tab').forEach(s => s.classList.toggle('an', s.dataset.tab === t));
    if (t === 'vorlagen') zeichneVorlagen();
    if (t === 'fotos') { zeichneFotos(); markiereFoto(); }
    if (t === 'ablage') zeichneAblage();
  }
  function miniBox(doc, i, box, o) {   // o: { laden: 'lazy' | 'eager', prio: 'high' | 'low' } für die Bilder der Vorschau
    const f = DS.blattF(doc, i), S = Math.min(box / (f.b + 2 * B), box / (f.h + 2 * B));
    const p = DS.seiteDom(ST.M, doc, i, S, Object.assign({ mini: true }, o));
    p.style.width = (f.b) * S + 'px'; p.style.height = f.h * S + 'px';
    [...p.children].forEach(c => { c.style.left = parseFloat(c.style.left) - B * S + 'px'; c.style.top = parseFloat(c.style.top) - B * S + 'px'; });
    p.style.backgroundPosition = '0 0';
    return p;
  }
  function zeichneVorlagen() {
    const fk = $('#vorlageFormat').value, ton = $('#vorlageTon').value, box = $('#vorlagen');
    box.innerHTML = '';
    for (const [k, v] of Object.entries(DS.VORLAGEN)) {
      if (!DS.formatPasst(k, fk)) continue;   // nur Aufbauten, die für dieses Format gemacht sind
      const doc = { format: { b: DS.FORMATE[fk].b, h: DS.FORMATE[fk].h }, formatKey: fk, seiten: [DS.setze(ST.M, fk, k, ton, DS.BEISPIEL[k])] };
      const b = document.createElement('button'); b.className = 'vk'; b.dataset.vorlage = k; b.style.setProperty('--i', box.children.length);
      b.innerHTML = `<div class="vk__bild"></div><b>${esc(v.name).replace(/ (\S+)$/, '\u00a0$1')}</b><small>${esc(v.wofuer)}</small>`;
      b.firstChild.appendChild(miniBox(doc, 0, 132));
      box.appendChild(b);
    }
  }
  const GRUPPEN = Object.values(DS.LIVRE_TEXT.b);
  const lageVon = b => b.w > b.h * 1.1 ? 'quer' : b.h > b.w * 1.1 ? 'hoch' : 'quadrat';
  function fotoListe() {
    const q = $('#fotoSuche').value.trim().toLowerCase();
    const W = q.split(/\s+/).filter(Boolean), g = ST.fotoGruppe || 'alle', lage = ST.fotoLage || 'alle';
    const T = DS.LIVRE_TEXT, mehr = b => b.saison ? ' ' + T.s[b.saison] + ' ' + T.h[b.herkunft] + (b.ki ? ' ki' : '') : '';
    return ST.M.bilder.filter(b => (g === 'alle' ? b.bereich !== 'motive' : b.gruppe === g) && (lage === 'alle' || lageVon(b) === lage || (lage === 'hoch' && lageVon(b) === 'quadrat'))
      && (!W.length || W.every(w => (b.alt + ' ' + b.key + ' ' + (b.gruppe || '') + mehr(b)).toLowerCase().includes(w))));
  }
  function fotoHinweis(n) { return `${n} ${n === 1 ? 'photo' : 'photos'}. ` + (ST.sel && elById(ST.sel)?.typ === 'bild' ? 'A click changes the chosen photo.' : 'A click puts the photo on the page.'); }
  function zeichneFotos() {
    const zahl = {}; ST.M.bilder.forEach(b => zahl[b.gruppe] = (zahl[b.gruppe] || 0) + 1);
    const g = ST.fotoGruppe || 'alle';
    $('#fotoFilter').innerHTML = `<button data-gruppe="alle" class="${g === 'alle' ? 'an' : ''}">All photos<i>${ST.M.bilder.filter(b => b.bereich !== 'motive').length}</i></button>` +
      [DS.eigene.GRUPPE, ...GRUPPEN].filter(x => zahl[x]).map(x => `<button data-gruppe="${esc(x)}" class="${g === x ? 'an' : ''}">${esc(x)}<i>${zahl[x]}</i></button>`).join('');
    $$('#fotoLage button').forEach(b => b.classList.toggle('an', b.dataset.lage === (ST.fotoLage || 'alle')));
    const l = fotoListe();
    $('#fotoInfo').textContent = fotoHinweis(l.length);
    $('#fotos').innerHTML = l.length ? l.map((b, i) => `<div class="foto" role="button" tabindex="0" data-bild="${b.key}" title="${esc(b.alt)}" style="--i:${Math.min(i, 16)}"><img loading="lazy" src="${DS.bildUrl(ST.M, b.key, true)}" alt="${esc(b.alt)}"><span>${esc(b.alt)}</span>${b.eigen ? `<button class="foto__weg" data-weg="${b.key}" aria-label="Remove photo"><svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg></button>` : ''}</div>`).join('')
      : `<p class="fotos__leer">${g === DS.eigene.GRUPPE ? 'No photos of your own yet. Add them above or drop them on the page.' : 'No photo fits this search.'}</p>`;
  }
  async function hochladen(dateien, aufsBlatt) {
    if (!dateien || !dateien.length) return;
    try {
      const keys = await DS.eigene.hinzu(ST.M, dateien, t => melde(t, 30000));
      if (!keys.length) { melde('No image file found. Please choose JPG, PNG or HEIC.'); return; }
      melde((keys.length === 1 ? `Photo added. It is under «${DS.eigene.GRUPPE}».` : `${keys.length} photos added. They are under «${DS.eigene.GRUPPE}».`) + (keys.fluechtig ? ' This browser does not keep photos (private window?): it stays only until you close Print & feed. To keep it: save a work file.' : ''), keys.fluechtig ? 10000 : 4000);
      ST.fotoGruppe = DS.eigene.GRUPPE; ST.fotoLage = 'alle'; $('#fotoSuche').value = '';
      if (aufsBlatt) {
        const el = ST.sel && elById(ST.sel);
        if (el && el.typ === 'bild') aendern(() => { el.bild = keys[0]; el.fx = .5; el.fy = .5; setzeSlot(seite(), el.slot, keys[0]); }, false);
        else neuesElement('bild', keys[0]);
      }
      zeigeTab('fotos');
    } catch (x) { console.warn(x); melde('The upload did not work: ' + ((x && x.message) || 'reason unknown.'), 7000); }
  }
  function markiereFoto() {
    const el = ST.sel && elById(ST.sel);
    $$('.foto').forEach(f => f.classList.toggle('an', !!el && el.typ === 'bild' && el.bild === f.dataset.bild));
    if ($('.tab[data-tab="fotos"]').classList.contains('an')) $('#fotoInfo').textContent = fotoHinweis(fotoListe().length);
  }
  function zeichneAblage() {
    const d = Object.values(alleDocs()).sort((a, b) => b.geaendert - a.geaendert), box = $('#ablage');
    box.innerHTML = '';
    for (const doc of d) {
      const r = document.createElement('div'); r.className = 'ab' + (ST.doc && doc.id === ST.doc.id ? ' an' : ''); r.style.animationDelay = Math.min(box.children.length, 12) * 50 + 'ms';
      r.innerHTML = `<div class="ab__bild" data-oeffne="${doc.id}"></div><div><b data-oeffne="${doc.id}">${esc(doc.name)}</b><small>${esc(DS.FORMATE[doc.formatKey]?.name || '')} · ${doc.seiten.length} ${doc.seiten.length === 1 ? 'page' : 'pages'} · ${new Date(doc.geaendert).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small>
        <div class="ab__knoepfe"><button data-kopie="${doc.id}">Copy</button><button data-loesch="${doc.id}">Delete</button></div></div>`;
      try { r.firstChild.appendChild(miniBox(doc, 0, 70)); } catch (e) { }
      box.appendChild(r);
    }
  }
  function linksEreignisse() {
    $('.reiter').addEventListener('click', e => { const b = e.target.closest('button'); if (b) zeigeTab(b.dataset.tab); });
    $('#vorlageFormat').addEventListener('change', zeichneVorlagen); $('#vorlageTon').addEventListener('change', zeichneVorlagen);
    $('#vorlagen').addEventListener('click', e => {
      const b = e.target.closest('[data-vorlage]'); if (!b) return;
      const k = b.dataset.vorlage, fk = $('#vorlageFormat').value, ton = $('#vorlageTon').value;
      oeffne(DS.dokument(ST.M, { name: DS.VORLAGEN[k].name, format: fk, seiten: [{ vorlage: k, ton, inhalt: DS.BEISPIEL[k] }] }));
      melde('Template opened. Write over the texts on the page.');
    });
    let sT; $('#fotoSuche').addEventListener('input', () => { clearTimeout(sT); sT = setTimeout(() => { zeichneFotos(); markiereFoto(); }, 150); });
    $('#fotoFilter').addEventListener('click', e => { const b = e.target.closest('[data-gruppe]'); if (!b) return; ST.fotoGruppe = b.dataset.gruppe; zeichneFotos(); markiereFoto(); b.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); });
    $('#fotoLage').addEventListener('click', e => { const b = e.target.closest('[data-lage]'); if (!b) return; ST.fotoLage = b.dataset.lage; zeichneFotos(); markiereFoto(); });
    $('#fotoDatei').addEventListener('change', e => { hochladen(e.target.files, false); e.target.value = ''; });
    const zone = $('#hochladen');
    ['dragenter', 'dragover'].forEach(t => zone.addEventListener(t, e => { e.preventDefault(); zone.classList.add('ueber'); }));
    ['dragleave', 'drop'].forEach(t => zone.addEventListener(t, e => { e.preventDefault(); zone.classList.remove('ueber'); }));
    zone.addEventListener('drop', e => hochladen(e.dataTransfer.files, false));
    const fl = $('#flaeche');
    fl.addEventListener('dragover', e => { if ([...e.dataTransfer.types].includes('Files')) { e.preventDefault(); fl.classList.add('ablegen'); } });
    fl.addEventListener('dragleave', e => { if (!fl.contains(e.relatedTarget)) fl.classList.remove('ablegen'); });
    fl.addEventListener('drop', e => { e.preventDefault(); fl.classList.remove('ablegen'); hochladen(e.dataTransfer.files, true); });
    $('#fotos').addEventListener('keydown', e => { if (e.key === 'Enter') { const b = e.target.closest('[data-bild]'); if (b) b.click(); } });
    $('#fotos').addEventListener('click', e => {
      const w = e.target.closest('[data-weg]');
      if (w) {
        e.stopPropagation();
        const k = w.dataset.weg, benutzt = Object.values(alleDocs()).some(d => d.seiten.some(s => s.el.some(x => x.bild === k)));
        dialog(`<h2>Remove photo?</h2><p>«${esc(ST.M.bildIndex[k].alt)}» is deleted from your own photos.${benutzt ? ' It is used in at least one design, which then shows an empty space.' : ''}</p>`, [{ t: 'Keep', v: false }, { t: 'Remove', v: true, haupt: true }])
          .then(async ja => { if (!ja) return; await DS.eigene.loeschen(ST.M, k); zeichneFotos(); zeichne(); });
        return;
      }
      const b = e.target.closest('[data-bild]'); if (!b) return;
      const el = ST.sel && elById(ST.sel), key = b.dataset.bild;
      if (el && el.typ === 'bild') aendern(() => { el.bild = key; el.fx = .5; el.fy = .5; setzeSlot(seite(), el.slot, key); }, false);
      else neuesElement('bild', key);
      markiereFoto();
    });
    $('#ablage').addEventListener('click', e => {
      const t = e.target.closest('[data-oeffne],[data-kopie],[data-loesch]'); if (!t) return;
      const d = alleDocs();
      if (t.dataset.oeffne) oeffne(d[t.dataset.oeffne]);
      else if (t.dataset.kopie) { const k = JSON.parse(JSON.stringify(d[t.dataset.kopie])); k.id = 'd' + Date.now().toString(36); k.name += ' (copy)'; oeffne(k); }
      else if (t.dataset.loesch) {
        dialog(`<h2>Delete?</h2><p>«${esc(d[t.dataset.loesch].name)}» is removed from this browser.</p>`, [{ t: 'Keep', v: false }, { t: 'Delete', v: true, haupt: true }]).then(ja => {
          if (!ja) return;
          const id = t.dataset.loesch; delete d[id]; schreib(LS.docs, d);
          if (ST.doc.id === id) { const rest = Object.values(d).sort((a, b) => b.geaendert - a.geaendert); if (rest[0]) oeffne(rest[0]); else oeffne(leer()); }
          zeichneAblage();
        });
      }
    });
    /* Abnahme 28.11.2026: «Blank page» führt zur Wahl des leeren Blatts (Art «Blank page»: Grösse wählen, anfangen). Vorher kam die Übersicht der Arten, in der die
       Karte «Blank page» bei 1440 nicht steht, weil sie dort keine volle Reihe füllt. */
    $('#btnNeuLeer').addEventListener('click', () => { if (!window.DSStart) return oeffne(leer()); DSStart.zeige(); const k = document.querySelector('#arten .stueck[data-art="frei"]'); if (k) k.click(); });
    $('#dateiLaden').addEventListener('change', async e => {
      const f = e.target.files[0]; if (!f) return;
      try { const doc = JSON.parse(await f.text());
        if (doc && !doc.seiten && typeof doc === 'object' && Object.values(doc).length && Object.values(doc).every(x => x && Array.isArray(x.seiten) && x.format)) {   // Sicherung aller Drucksachen (pruefung.html)
          const d = alleDocs(); let n = 0; for (const x of Object.values(doc)) { if (!d[x.id] || (d[x.id].geaendert || 0) < (x.geaendert || 0)) { d[x.id] = x; n++; } }
          if (!schreib(LS.docs, d)) throw 0; zeichneAblage(); melde(n ? `${n} designs read from the backup. They are in My designs.` : 'All designs of the backup are already here.', 6000); e.target.value = ''; return; }
        if (!Array.isArray(doc.seiten) || !doc.format || !doc.seiten.every(s => s && Array.isArray(s.el))) throw 0; if (doc.eigeneFotos) { await DS.eigene.einlesen(ST.M, doc.eigeneFotos); delete doc.eigeneFotos; } doc.id = 'd' + Date.now().toString(36); oeffne(doc); melde('Work file opened.'); }
      catch (x) { melde('This file is not a work file of Print & feed.'); }
      e.target.value = '';
    });
  }
  function leer(fk = 'a5h', platzhalter = false) {
    const f = DS.FORMATE[fk];
    const d = { id: 'd' + Date.now().toString(36), name: 'Blank page · ' + f.name, formatKey: fk, format: { b: f.b, h: f.h }, seiten: [{ grund: 'papier', tapete: null, el: [] }], hinweise: [], geaendert: Date.now() };
    if (platzhalter) d.platzhalter = true;
    return d;
  }

  /* ---------- Bausteine aus dem Markenfundus (Werkzeuge 2.0, ersetzt «Entwerfen» der Vorlage: keine KI) ----------
     Farben je Farbwelt, Schriften je Rolle, Zeichen und Elemente des Fundus. Klick: auf das gewählte Element bzw. aufs Blatt. */
  function zeichneBausteine() {
    const M = ST.M, box = $('#bausteine'); if (!box) return;
    const FU = M.fundus;
    if (!FU) { box.innerHTML = '<p class="status fehler">The brand book does not answer right now. The house colours from the last build are used.</p>'; return; }
    const welten = FU.welten.filter(w => w.farben.length);
    const rollen = [['titel', 'Title'], ['kapitale', 'Capitals'], ['text', 'Text'], ['mono', 'Line'], ['web', 'Website title']].filter(([k]) => M.schriften[k]);
    const el = ST.sel && elById(ST.sel);
    box.innerHTML = `<h3>Colours</h3>${welten.map(w => `<div class="bs-welt"><small>${esc(w.name)}</small><div class="farben">${w.farben.map(id => `<button data-bsfarbe="${id}" title="${esc(M.farbnamen[id] || id)} ${esc(M.farben[id] || '')}" style="background:${M.farben[id]}"></button>`).join('')}</div></div>`).join('')}
      <p class="klein">${el && ['text', 'linie', 'rahmen', 'zeichen', 'flaeche'].includes(el.typ) ? 'A click colours the part you picked.' : 'A click colours the ground of the page. Pick a part first to colour it.'}</p>
      <h3>Fonts</h3><div class="bs-schriften">${rollen.map(([k, t]) => `<button data-bsschrift="${k}" style="font-family:'DS-${k}'"><b>${esc(M.schriften[k].familie)}</b><small>${t}</small></button>`).join('')}</div>
      <h3>Marks</h3><div class="bs-elemente bs-elemente--marke">${[1, 2, 3].filter(z => z === 1 || M['zeichen' + z]).map(z => `<button data-bszeichen="${z}" title="${esc((M.zeichennamen || {})[z] || '')}"><span>${DS.zeichenSvg(M, M.farben.tinte, z === 1 ? null : { z })}</span><small>${esc((M.zeichennamen || {})[z] || '')}</small></button>`).join('')}</div>
      <h3>Elements</h3><div class="bs-elemente">${FU.elemente.filter(e => e.art !== 'zeichen' && DS.zumGestalten(e)).map(e => `<button data-bselement="${esc(e.id)}" title="${esc(e.satz || e.name)}"><span>${DS.fundusSvg(M, { fid: e.id })}</span><small>${esc(e.name)}</small></button>`).join('')}</div>
      <p class="klein">Change these in the brand book editor: what Julie changes there shows up here.</p>`;
  }
  function bausteinKlick(e) {
    const b = e.target.closest('button'); if (!b) return;
    const el = ST.sel && elById(ST.sel), s = seite();
    if (b.dataset.bsfarbe) {
      const k = b.dataset.bsfarbe;
      if (el && ['text', 'linie', 'rahmen', 'zeichen', 'flaeche'].includes(el.typ)) aendern(() => { el.farbe = k; });
      else aendern(() => { s.grund = k; kontrastNachGrund(s); }, false);
    } else if (b.dataset.bsschrift) {
      if (el && el.typ === 'text') aendern(() => { el.rolle = b.dataset.bsschrift; const S0 = DS.STIL[el.rolle] || {}; Object.assign(el, { zeile: S0.zeile || el.zeile, sperr: S0.sperr ?? el.sperr, gross: !!S0.gross }); el.h = DS.mess(el).h; });
      else { neuesElement(b.dataset.bsschrift === 'titel' || b.dataset.bsschrift === 'web' ? 'titel' : b.dataset.bsschrift === 'mono' || b.dataset.bsschrift === 'kapitale' ? 'zeile' : 'text'); const n = ST.sel && elById(ST.sel); if (n && n.typ === 'text') aendern(() => { n.rolle = b.dataset.bsschrift; n.h = DS.mess(n).h; }); }
    } else if (b.dataset.bszeichen) neuesElement('zeichen', null, { z: +b.dataset.bszeichen === 1 ? undefined : +b.dataset.bszeichen });
    else if (b.dataset.bselement) { neuesElement('fundus', b.dataset.bselement); melde('Element from the brand book placed. Its colours can be changed on the right.'); }
    zeichneBausteine();
  }

  /* ---------- Speichern als Datei ---------- */
  function laden(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  const dateiname = () => (ST.doc.name || 'design').toLowerCase().replace(/[äöü]/g, c => ({ ä: 'ae', ö: 'oe', ü: 'ue' }[c])).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + ST.doc.formatKey;
  async function pruefDialog(fuer) {
    const p = DS.pruefe(ST.M, ST.doc);
    if (!p.length) { if (!fuer) melde('Ready to print: nothing open.'); return true; }
    const rot = p.some(x => x.stufe === 'rot');
    const a = await dialog(`<h2>${rot ? 'Look at this before printing' : 'Notes for printing'}</h2><p class="leise">A click on a point shows the place.</p><ul>${p.map(x => `<li class="${x.stufe}" data-id="${x.id}" data-seite="${x.seite}">${esc(x.text)}</li>`).join('')}</ul>`,
      fuer ? [{ t: 'Back to the page', v: false }, { t: 'Save anyway', v: true, haupt: true }] : [{ t: 'Close', v: false }]);
    if (a && a.springe) { ST.seite = a.seite; ST.sel = a.springe; zeichne(); return false; }
    return a;
  }
  async function ausgabe(art) {
    $('#menueSpeichern').hidden = true;
    if (art === 'zip') { if (window.DSIg) DSIg.zip().catch(x => melde('Saving did not work: ' + x.message, 8000)); return; }
    if (art === 'json') { const ef = await DS.eigene.mitnehmen(ST.M, ST.doc); laden(new Blob([JSON.stringify(Object.keys(ef).length ? Object.assign({}, ST.doc, { eigeneFotos: ef }) : ST.doc)], { type: 'application/json' }), dateiname() + '.json'); return; }
    if (ST.modus === 'text') textEnde();
    if (art !== 'png' && !(await pruefDialog(true))) return;
    const btn = $('#btnSpeichern'); btn.disabled = true;
    try {
      if (art === 'png') {
        const f = DS.FORMATE[DS.blattK(ST.doc, ST.seite)] || {}, px = f.px ? f.px[0] : Math.round(DS.blattF(ST.doc, ST.seite).b / 25.4 * 200);
        melde('Making the image …', 20000);
        laden(await DS.png(ST.M, ST.doc, ST.seite, px), dateiname() + (ST.doc.seiten.length > 1 ? '-s' + (ST.seite + 1) : '') + '.png');
        melde('Image saved.');
      } else {
        melde('Setting the PDF …', 60000);
        const { bytes, fehlend } = await DS.pdf(ST.M, ST.doc, { marken: art === 'marken', melde: t => melde(t, 60000) });
        laden(new Blob([bytes], { type: 'application/pdf' }), dateiname() + (art === 'marken' ? '-crop-marks' : '') + '.pdf');
        melde(fehlend.length ? `PDF saved. These characters are missing in the house font and were left out: ${fehlend.join(' ')}` : `PDF saved: ${ST.doc.seiten.length} ${ST.doc.seiten.length === 1 ? 'page' : 'pages'}, ${(bytes.length / 1e6).toFixed(1)} MB.`, 6000);
      }
    } catch (x) { console.error(x); melde('Saving did not work: ' + x.message, 8000); }
    finally { btn.disabled = false; }
  }

  /* ---------- Start ---------- */
  async function start() {
    const M = await DS.ladeMarke(HAUS);
    ST.M = M;
    document.title = `Print & feed · ${M.name}`;
    $('#kopfName').textContent = M.name;
    $('#kopfZeichen').innerHTML = DS.zeichenSvg(M, 'currentColor');
    $('#inselZeichen').innerHTML = DS.zeichenSvg(M, 'currentColor');
    $('#laderZeichen').innerHTML = `<span class="lader__a">${DS.zeichenSvg(M, 'currentColor')}</span><span class="lader__b">${DS.zeichenSvg(M, 'currentColor')}</span>`;   /* wie beim Buchen auf der Website: das Zeichen füllt sich von unten mit Gold */
    $('#vorlageFormat').innerHTML = Object.entries(DS.FORMATE).filter(([k]) => Object.keys(DS.VORLAGEN).some(v => DS.formatPasst(v, k))).map(([k, f]) => `<option value="${k}">${f.name.replace(/ /g, '\u00a0')}\u00a0· ${f.art}</option>`).join(''); $('#vorlageFormat').value = 'a5h';
    zeichneBausteine(); $('#bausteine').addEventListener('click', bausteinKlick);
    if (window.Fundus) Fundus.beiAenderung(async FU => { DS.fundusAnwenden(ST.M, FU); await DS.ladeFundus(); DS.fundusAnwenden(ST.M, FU); ST.M.bildIndex = Object.assign(Object.fromEntries(ST.M.bilder.concat(ST.M.belege || []).map(b => [b.key, b])), Object.fromEntries(Object.entries(ST.M.bildIndex).filter(([, b]) => b.eigen))); zeichneBausteine(); zeichne(); melde('The brand book changed. Colours, fonts and elements are up to date.'); });
    await DS.eigene.laden(M);
    const docs = alleDocs();
    const akt = docs[lies(LS.aktuell, '')] || Object.values(docs).sort((a, b) => b.geaendert - a.geaendert)[0] || leer('a5h', true);
    rechtsEreignisse(); blattEreignisse(); linksEreignisse(); tasten();
    $('#btnZurueck').addEventListener('click', zurueck); $('#btnVor').addEventListener('click', vor);
    { /* Fundliste 18: Name der Drucksache ganz lesbar, zur Not zweizeilig in kleinerer Schrift (Feld wird zur Textfläche ohne Zeilenumbruch per Enter) */
      const ni = $('#docName'); if (ni && ni.tagName === 'INPUT') { const t = document.createElement('textarea'); t.className = ni.className; t.id = 'docName'; t.rows = 1; t.spellcheck = false; t.setAttribute('autocomplete', 'off');   /* Abnahme 28.11.2026: nach «Zurück» aus einem anderen Werkzeug schrieb der Browser den Namen des Entwurfs ins Suchfeld der Übersicht */ t.setAttribute('aria-label', ni.getAttribute('aria-label') || 'Name'); t.value = ni.value; ni.replaceWith(t);
        t.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); t.blur(); } }); t.addEventListener('input', () => nameEinpassen()); let bw = 0; new ResizeObserver(() => { if (Math.abs(t.clientWidth - bw) > 1) { bw = t.clientWidth; requestAnimationFrame(nameEinpassen); } }).observe(t); } }
    $('#docName').addEventListener('change', e => { ST.doc.name = e.target.value.replace(/\s+/g, ' ').trim() || 'Design'; speichern(); zeichneAblage(); });
    $('#kopfMarke').addEventListener('click', () => $('#btnNeu').click());
    $('#btnVerwerfen').addEventListener('click', verwerfen);
    $('#btnSpeichern').addEventListener('click', e => { e.stopPropagation(); $('#menueSpeichern').hidden = !$('#menueSpeichern').hidden; });
    ['pointerenter', 'focus', 'touchstart'].forEach(t => $('#btnSpeichern').addEventListener(t, () => DS.vorladenPdf && DS.vorladenPdf(ST.M), { once: true, passive: true }));   // PDF-Werkzeug und Druckschriften erst jetzt holen (29.10.)
    $('#menueSpeichern').addEventListener('click', e => { const b = e.target.closest('[data-aus]'); if (b) ausgabe(b.dataset.aus); });
    document.addEventListener('click', e => { if (!e.target.closest('.ausgabe')) $('#menueSpeichern').hidden = true; });
    document.addEventListener('pointerdown', e => { if (ST.modus === 'text' && !e.target.closest('#wirt')) textEnde(); }, true);
    $('#btnPruefen').addEventListener('click', () => pruefDialog(false));
    $('#werkzeug').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.neu) { if (b.dataset.neu === 'bild') { zeigeTab('fotos'); ST.sel = null; zeichne(); melde('Click a photo or add one of your own, it goes on the page.'); } else neuesElement(b.dataset.neu); }
      if (b.dataset.seite !== undefined) {
        if (ST.modus === 'text') textEnde();
        if (b.dataset.seite === 'neu' && sozial()) { DSIg.bildAnfuegen(); return; }
        if (b.dataset.seite === 'neu') { aendern(() => ST.doc.seiten.push(DS.setze(ST.M, ST.doc.formatKey, 'rueckseite', seite().quelle?.ton || 'dunkel', DS.BEISPIEL.rueckseite)), false); ST.seite = ST.doc.seiten.length - 1; }
        else ST.seite = +b.dataset.seite;
        ST.sel = null; ST.seitePanel = true; ST.auftritt = true; zeichne();
      }
    });
    $('#flaeche').addEventListener('pointerdown', e => { if (e.target.id === 'flaeche' && ST.sel && ST.modus !== 'text') { ST.sel = null; ST.modus = null; zeichne(); } });
    $('#zeigeHilfen').addEventListener('change', () => { $('#wirt').classList.toggle('ohneHilfen', !$('#zeigeHilfen').checked); zeichne(); });
    $('#zoomEin').addEventListener('click', () => { ST.zoom = Math.min(4, ST.zoom * 1.25); passeZoom(); zeichne(); });
    $('#zoomAus').addEventListener('click', () => { ST.zoom = Math.max(.3, ST.zoom / 1.25); passeZoom(); zeichne(); });
    /* Klick neben das Blatt schliesst das Seitenmenü «Gestalten» (16.10.2026) */
    $('#flaeche').addEventListener('pointerdown', e => { const w = $('#wirt').getBoundingClientRect(), imBlatt = !!e.__wirt || (e.clientX >= w.left && e.clientX <= w.right && e.clientY >= w.top && e.clientY <= w.bottom);   // Ziel zuerst: öffnet derselbe Klick «Gestalten», rückt das Blatt weg (Prüfung 16.10.2026)
      if (!imBlatt && !e.target.closest('.ue, .griff, .werkzeug') && (ST.sel || ST.seitePanel)) { if (ST.modus === 'text') textEnde(); ST.sel = null; ST.seitePanel = false; ST.modus = null; zeichne(); } });
    let rT; addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { passeZoom(); zeichne(); gleiter(); }, 120); });
    let fT; if (window.ResizeObserver) new ResizeObserver(() => { clearTimeout(fT); fT = setTimeout(() => {   // rechte Leiste auf/zu: Seite neu einpassen
      if (!ST.doc || ST.modus === 'text') return; const alt = ST.S; passeZoom(); if (Math.abs(ST.S - alt) > .002) zeichne(); }, 60); }).observe($('#flaeche'));
    document.fonts.ready.then(gleiter); setTimeout(gleiter, 400);
    /* ?stueck=<id> (Drucksachen «Edit», bearbeiten.json): genau dieses Stück des Hauses öffnen, mit den eigenen Änderungen, falls es schon bearbeitet wurde */
    const stk = new URLSearchParams(location.search).get('stueck');
    if (!(stk && await oeffneStueck(stk).catch(() => null))) oeffne(akt);
    window.__ST = ST;
    window.DSStudio = { oeffne, oeffneStueck, entwerfen: async () => false, leer, alleDocs, miniBox, zeigeTab, doc: () => ST.doc,
      dialog, melde, haus: HAUS, laden, dateiname, textEnde,
      seiteNr: () => ST.seite, aendern, neues: neuesElement,
      tauscheFoto(key) { const el = ST.sel && elById(ST.sel); if (el && el.typ === 'bild') aendern(() => { el.bild = key; el.fx = .5; el.fy = .5; setzeSlot(seite(), el.slot, key); }, false); }, sel: () => ST.sel && elById(ST.sel), seite: () => seite(), massstab: () => ST.S, waehle(id) { ST.sel = id; zeichne(); }, speichern: () => speichern(),
      zeigeSeite(i) { ST.seite = Math.max(0, Math.min(i, ST.doc.seiten.length - 1)); ST.sel = null; ST.auftritt = true; zeichne(); },
      neuZeichnen: () => zeichne(),
      lader(text, zeilen) {
        const lader = $('#lader'), fl = $('#flaeche').getBoundingClientRect();
        Object.assign(lader.style, { left: fl.left + 'px', top: fl.top + 'px', width: fl.width + 'px', height: fl.height + 'px' });
        $('#laderText').textContent = text; let zi = 0; $('#laderZeile').textContent = zeilen[0]; lader.hidden = false;
        const uhr = setInterval(() => { const z = $('#laderZeile'); z.style.opacity = 0; setTimeout(() => { zi = (zi + 1) % zeilen.length; z.textContent = zeilen[zi]; z.style.opacity = 1; }, 450); }, 3000);
        return () => { clearInterval(uhr); lader.hidden = true; };
      },
      umbenennen(id, name) { const d = alleDocs(); if (!d[id]) return; d[id].name = name; schreib(LS.docs, d); if (ST.doc && ST.doc.id === id) { ST.doc.name = name; $('#docName').value = name; nameEinpassen(); } },
      kopie(id) { const d = alleDocs(); const k = JSON.parse(JSON.stringify(d[id])); k.id = 'd' + Date.now().toString(36); k.name += ' (copy)'; k.geaendert = Date.now(); d[k.id] = k; schreib(LS.docs, d); return k; },
      loeschen(id) { const d = alleDocs(); delete d[id]; schreib(LS.docs, d); if (ST.doc && ST.doc.id === id) oeffne(leer('a5h', true)); zeichneAblage(); },
      zeigeHinweise(l) { const h = $('#entwurfHinweise'); if (!h) return; if (!l || !l.length) { h.hidden = true; return; } h.hidden = false; h.innerHTML = `<b>Please look at this</b><ul>${l.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`; zeigeTab('entwerfen'); } };
    document.dispatchEvent(new Event('ds:bereit'));
  }
  start().catch(e => { console.error(e); document.body.insertAdjacentHTML('beforeend', `<div class="meldung">Print & feed could not start: ${esc(e.message)}</div>`); });
})();
