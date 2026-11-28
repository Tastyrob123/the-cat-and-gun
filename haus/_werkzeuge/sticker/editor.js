/* Sticker editor · Editor: Bedienung wie in der Vorlage (studio.js der Plakatwerkstatt: ziehen mit Einrasten, Griffe, Doppelklick schreibt,
   Pfeiltasten, ⌘Z/⇧⌘Z/⌘D, Gestalten-Platte rechts, Reiter links), Blatt als SVG, weil die Sticker des Hauses SVG sind.
   Einfache Fassung als Standard (Reiter «Quick»: Wörter und Farben), erweiterte auf Knopfdruck («More tools»: Formen, Ebenen, Ausrichten, Raster).
   Pipette: EyeDropper in Chrome/Edge auf dem ganzen Bildschirm; sonst im Entwurf und in hochgeladenen Fotos (Hinweis nur dort am Knopf). */
(function () {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = SK.esc, r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100, PT = 72 / 25.4;
  const LSM = 'catgun-sticker-modus';
  const ED = { doc: null, sel: null, hist: [], zukunft: [], S: 4, zoom: 1, erweitert: false, raster: false, schnitt: true, pipette: null, profil: [], tab: 'einfach' };
  try { ED.erweitert = localStorage.getItem(LSM) === '1'; } catch (e) { }
  const kopie = o => JSON.parse(JSON.stringify(o));

  /* ---------- Meldung (Quittung, R11) ---------- */
  let mT;
  function melde(t, opt = {}) {
    const m = $('#meldung'); clearTimeout(mT);
    const stich = /^([A-ZÄÖÜ-]{3,}) · /.exec(t), text = stich ? t.slice(stich[0].length) : t;
    m.innerHTML = `<span class="sk-q__t">${esc(text)}</span>${(opt.knoepfe || []).map((k, i) => `<button class="sk-q__k" data-qi="${i}">${esc(k.t)}</button>`).join('')}${stich ? `<a class="sk-q__k" href="pruefung.html#${esc(stich[1].toLowerCase())}" target="_blank" rel="noopener">What to do?</a>` : ''}<button class="sk-q__zu" aria-label="Close">×</button>`;
    m.classList.toggle('sk-q--fehler', !!opt.fehler || !!stich);
    m.hidden = false;
    m.onclick = e => { const b = e.target.closest('[data-qi]'); if (b) { m.hidden = true; opt.knoepfe[+b.dataset.qi].f(); } if (e.target.closest('.sk-q__zu')) m.hidden = true; };
    mT = setTimeout(() => m.hidden = true, opt.ms || 9000);
  }
  function dialog(html, knoepfe) {
    return new Promise(ok => {
      $('#dialogKarte').innerHTML = html + `<div class="dialog__knoepfe">${knoepfe.map((k, i) => `<button class="${k.haupt ? 'knopf' : 'leicht'}" data-i="${i}">${esc(k.t)}${k.haupt ? '<i><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></i>' : ''}</button>`).join('')}</div>`;
      $('#dialog').hidden = false;
      const fertig = v => { $('#dialog').hidden = true; document.removeEventListener('keydown', taste, true); ok(v); };
      const taste = e => { if (e.key === 'Escape') { e.stopPropagation(); fertig(knoepfe.find(k => k.abbruch)?.v ?? false); } };
      document.addEventListener('keydown', taste, true);
      $('#dialogKarte').onclick = e => { const b = e.target.closest('[data-i]'); if (b) fertig(typeof knoepfe[+b.dataset.i].v === 'function' ? knoepfe[+b.dataset.i].v() : knoepfe[+b.dataset.i].v); };
      setTimeout(() => ($('#dialogKarte input, #dialogKarte textarea') || $('#dialogKarte .knopf') || {}).focus?.(), 50);
    });
  }

  /* ---------- Öffnen, Ändern, Rückgängig ---------- */
  const alle = () => (SKA.A.arbeit && SKA.A.arbeit.sticker) || [];
  function oeffne(id) {
    const d = alle().find(s => s.id === id); if (!d) return false;
    ED.doc = kopie(d); ED.sel = null; ED.hist = []; ED.zukunft = []; ED.zoom = 1;
    try { localStorage.setItem('catgun-sticker-offen', id); } catch (e) { }
    $('#docName').value = ED.doc.name || '';
    zeichneAlles(); return true;
  }
  function zurueckSchreiben() { const d = ED.doc; SKA.aendere(a => { const i = a.sticker.findIndex(s => s.id === d.id); if (i >= 0) a.sticker[i] = kopie(d); else a.sticker.unshift(kopie(d)); }); }
  function aendern(fn, opt = {}) {
    if (!ED.doc) return;
    ED.hist.push(JSON.stringify(ED.doc)); if (ED.hist.length > 80) ED.hist.shift(); ED.zukunft = [];
    fn(ED.doc); ED.doc.geaendert = Date.now();
    zurueckSchreiben();
    zeichneBlatt();
    if (!opt.leise) { zeichneRechts(); zeichneLinks(); }
  }
  function zurueck() { if (!ED.hist.length) return; ED.zukunft.push(JSON.stringify(ED.doc)); ED.doc = JSON.parse(ED.hist.pop()); if (ED.sel && !ebene(ED.sel)) ED.sel = null; zurueckSchreiben(); zeichneAlles(); }
  function vor() { if (!ED.zukunft.length) return; ED.hist.push(JSON.stringify(ED.doc)); ED.doc = JSON.parse(ED.zukunft.pop()); if (ED.sel && !ebene(ED.sel)) ED.sel = null; zurueckSchreiben(); zeichneAlles(); }
  const ebene = id => ED.doc && ED.doc.ebenen.find(e => e.id === id);

  /* ---------- Zeichnen ---------- */
  function passeZoom() {
    const fl = $('#flaeche'), g = getComputedStyle(fl), f = ED.doc.form;
    const w = fl.clientWidth - parseFloat(g.paddingLeft) - parseFloat(g.paddingRight) - 40, h = fl.clientHeight - parseFloat(g.paddingTop) - parseFloat(g.paddingBottom) - 40;
    const fit = Math.max(1, Math.min(w / f.b, h / f.h));
    ED.S = fit * ED.zoom;
  }
  function zeichneAlles() { if (!ED.doc) return; zeichneBlatt(); zeichneRechts(); zeichneLinks(); modusSetzen(); }
  function zeichneBlatt() {
    if (!ED.doc) return;
    passeZoom();
    const f = ED.doc.form, S = ED.S, w = $('#wirt');
    w.style.width = f.b * S + 'px'; w.style.height = f.h * S + 'px';
    w.classList.toggle('ohneHilfen', !ED.schnitt);
    w.innerHTML = `<div class="blatt sk-blatt" style="width:${f.b * S}px;height:${f.h * S}px">${SK.svg(ED.doc, { schnitt: ED.schnitt, raster: ED.raster && ED.erweitert, idz: 'ed', klasse: 'sk-svg' })}</div><div class="ueber" id="ueber"></div>`;
    const svg = w.querySelector('svg'); svg.setAttribute('width', f.b * S); svg.setAttribute('height', f.h * S);
    /* am Handy nur die Masse (Rest ausgeblendet), damit nichts abgeschnitten wird */
    $('#formatInfo').innerHTML = `<span class="sk-fi-art">${esc(SK.FORMEN[f.art] ? SK.FORMEN[f.art].name : 'Shape')} · </span>${r1(f.b)} × ${r1(f.h)} mm<span class="sk-fi-rest"> · bleed 3 mm</span>`;
    $('#zoomWert').textContent = Math.round(ED.S / (96 / 25.4) * 100) + ' %';
    $('#docName').value = ED.doc.name || '';
    zeichneAuswahl(); pruefZahl();
  }
  function rahmenVon(id) {
    const g = $('#wirt svg') && $('#wirt svg').querySelector(`[data-ebene="${CSS.escape(id)}"]`), w = $('#wirt');
    if (!g || !w) return null;
    const b = w.getBoundingClientRect();
    /* Robert 24.11.2026 («das macht ja gar keinen sinn»): Zeichen als eingebettetes svg mit Ausschnitt (das & auf dem Streifen) massen mit der ganzen,
       abgeschnittenen Zeichnung, der Rahmen lag riesig daneben. Solche Teile werden aus ihrem sichtbaren Ausschnitt (bb) gemessen. */
    const el = ebene(id), inner = el && el.typ === 'grafik' && el.bb && g.querySelector(':scope svg[viewBox]');
    if (inner && g.getScreenCTM) {
      try {
        const m = g.getScreenCTM(), [x0, y0, bw, bh] = el.bb, pt = (x, y) => new DOMPoint(x, y).matrixTransform(m);
        const ps = [pt(x0, y0), pt(x0 + bw, y0), pt(x0, y0 + bh), pt(x0 + bw, y0 + bh)], xs = ps.map(p => p.x), ys = ps.map(p => p.y);
        const l = Math.min(...xs), t = Math.min(...ys);
        if (isFinite(l) && isFinite(t)) return { x: l - b.left, y: t - b.top, w: Math.max(...xs) - l, h: Math.max(...ys) - t };
      } catch (x) { }
    }
    const a = g.getBoundingClientRect();
    if (!a.width && !a.height) return null;
    return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
  }
  function zeichneAuswahl(hilfen) {
    const u = $('#ueber'); if (!u) return;
    let h = '';
    if (hilfen) h += hilfen.map(l => l.v != null ? `<i class="hl" style="left:${l.v}px;top:0;bottom:0;width:1px"></i>` : `<i class="hl" style="top:${l.h}px;left:0;right:0;height:1px"></i>`).join('');
    const e = ED.sel && ebene(ED.sel), r = e && rahmenVon(e.id);
    if (r) {
      h += `<div class="auswahl" style="left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px"></div>`;
      if (!e.fest) {
        [['nw', r.x, r.y], ['ne', r.x + r.w, r.y], ['sw', r.x, r.y + r.h], ['se', r.x + r.w, r.y + r.h]].forEach(([k, x, y]) => h += `<span class="griff" data-griff="${k}" style="left:${x}px;top:${y}px" title="Size"></span>`);
        h += `<span class="griff sk-dreh" data-griff="dreh" style="left:${r.x + r.w / 2}px;top:${r.y - 26}px" title="Turn"></span><i class="sk-dreh-stiel" style="left:${r.x + r.w / 2}px;top:${r.y - 20}px"></i>`;
      }
    }
    u.innerHTML = h;
  }

  /* ---------- Farbwahl: Palette des Hauses, Farben aus dem Foto, Wert, Pipette ---------- */
  const PIP = '<svg viewBox="0 0 24 24"><path d="m14.5 5.5 4 4M5 19l1-4 8.5-8.5 3 3L9 18z"/><path d="M16 4a2.1 2.1 0 0 1 3 3l-1 1-3-3z"/></svg>';
  function palette() {
    const d = Fundus.farben({ welt: 'druck' }), s = Fundus.farben({ welt: 'saft' }), ids = new Set(), l = [];
    [...d, ...s].forEach(f => { if (f && !ids.has(f.id)) { ids.add(f.id); l.push(f); } });
    return l;
  }
  function farbWahl(aktuell, schluessel) {
    const w = SK.farbWert(aktuell), pal = palette();
    const hinweis = window.EyeDropper ? '' : '<p class="klein sk-pip-hinweis">In Safari and Firefox the pipette picks colours in the sticker and in uploaded photos.</p>';
    return `<div class="sk-farbwahl" data-farbe="${esc(schluessel)}">
      <div class="farben">${pal.map(f => `<button data-fw="${esc(f.id)}" class="${aktuell && aktuell.f === f.id && !aktuell.w ? 'an' : ''}" style="background:${f.wert}" title="${esc(f.name)}" aria-label="${esc(f.name)}"></button>`).join('')}</div>
      ${ED.profil.length ? `<label class="unter">From the photo</label><div class="farben">${ED.profil.map(h => `<button data-fwert="${h}" class="${w === h ? 'an' : ''}" style="background:${h}" title="${h}" aria-label="${h}"></button>`).join('')}</div>` : ''}
      <div class="sk-wert"><span class="sk-wert__probe" style="background:${w}"></span><input type="text" data-hex value="${w.toUpperCase()}" maxlength="7" aria-label="Colour value" spellcheck="false"><button class="sk-pip" data-pipette title="Pipette" aria-label="Pipette">${PIP}</button></div>
      <small class="sk-farbname">${esc(SK.farbName(aktuell))}</small>${hinweis}</div>`;
  }
  /* Eine Farbe setzen: Ziel ist «el:<id>:farbe» (Text), «teil:<id>:<teil>» (Teil einer Grafik) oder «alle:<schlüssel>» (Schnellfarbe im ganzen Sticker) */
  function setzeFarbe(ziel, f) {
    const [art, id, teil] = ziel.split(':');
    const vorher = ED.doc ? JSON.parse(JSON.stringify(ED.doc)) : null, gesetzt = new Set();   // was Julie gerade selbst gefärbt hat
    aendern(d => {
      if (art === 'el') { const e = d.ebenen.find(x => x.id === id); if (e) e.farbe = f; }
      else if (art === 'teil') { const e = d.ebenen.find(x => x.id === id); if (e) { e.teile = e.teile || {}; if (f.f === teil && !f.w) delete e.teile[teil]; else e.teile[teil] = f; } }
      else if (art === 'alle') {
        ED.offenFarbe = 'alle:' + farbSchluessel(f);   // Abnahme 28.11.2026: die Schublade dieser Farbe bleibt nach der Wahl offen (ihr Schlüssel wechselt mit der Farbe)
        d.ebenen.forEach(e => {
          if ((e.typ === 'text' || e.typ === 'bogen') && farbSchluessel(e.farbe) === id) { e.farbe = f; gesetzt.add(e.id); }
          if (e.typ === 'grafik') SK.teileVon(e.roh).forEach(t => { if (farbSchluessel(e.teile && e.teile[t.k] || { f: t.k }) === id) { e.teile = e.teile || {}; if (f.f === t.k && !f.w) delete e.teile[t.k]; else e.teile[t.k] = f; gesetzt.add(e.id + ':' + t.k); } });
        });
      }
      kontrastNachziehen(d, vorher, art === 'el' ? id : null, art === 'teil' ? id + ':' + teil : null, gesetzt);
    });
  }
  /* Kontrast nachziehen (Fehlerart aus Print & feed: Schrift verschwindet nach dem Wechsel der Grundfarbe). Nach jeder Farbänderung liegt jede
     Schrift mit Kontrast ≥ 3 auf ihrem Grund (die oberste gefüllte Fläche unter ihr, sonst die Stickerform). Schrift darunter bekommt Schwarz
     oder Paper, je nachdem was besser liest. Teile von Zeichen und Formen, die in der neuen Grundfarbe verschwinden würden, ebenso.
     Das eben gewählte Element selbst bleibt, wie gewählt. */
  const lum = w => { const n = parseInt(String(w).slice(1), 16), c = [n >> 16, n >> 8 & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
  const kontrastWert = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const besser = grund => kontrastWert(SK.farbWert({ f: 'schwarz' }), grund) >= kontrastWert(SK.farbWert({ f: 'papier' }), grund) ? { f: 'schwarz' } : { f: 'papier' };
  function grundUnter(d, i, x, y) {
    for (let j = i - 1; j >= 0; j--) {
      const g = d.ebenen[j]; if (g.typ !== 'grafik' || g.aus) continue;
      const bb = g.bb || [0, 0, 0, 0]; if (!g.grund && !(x >= bb[0] && x <= bb[0] + bb[2] && y >= bb[1] && y <= bb[1] + bb[3])) continue;
      const t = SK.teileVon(g.roh).find(k => k.a === 'f'); if (!t) continue;
      if (/^<svg/.test(String(g.roh).trim()) || (!g.grund && (bb[2] < 4 || bb[3] < 4))) continue;   // Zeichen und kleine Punkte sind kein Grund
      return SK.farbWert((g.teile && g.teile[t.k]) || { f: t.k });
    }
    return '#ffffff';
  }
  /* Robert 24.11.2026 («hier kann ich bestimmte farben nicht anwählen»): eine Farbe, die Julie selbst wählt, wird nie wieder ersetzt.
     Lesbar nachgezogen wird nur, was sie nicht angefasst hat (z. B. die Schrift, wenn sie den Grund umfärbt). */
  function kontrastNachziehen(d, vorher, elZiel, teilZiel, gesetzt) {
    gesetzt = gesetzt || new Set();
    const gi = d.ebenen.findIndex(e => e.grund), gAlt = vorher && vorher.ebenen.find(e => e.grund);
    d.ebenen.forEach((e, i) => {
      if (e.aus) return;
      if (e.typ === 'text' || e.typ === 'bogen') {
        if (e.id === elZiel || gesetzt.has(e.id)) return;
        const x = e.typ === 'bogen' ? e.cx : e.x, y = e.typ === 'bogen' ? e.cy + (e.oben === false ? e.r : -e.r) : e.y - e.gr * .35;
        const grund = grundUnter(d, i, x, y);
        if (kontrastWert(SK.farbWert(e.farbe), grund) < 3) e.farbe = besser(grund);
      } else if (e.typ === 'grafik' && i !== gi && gi >= 0) {
        const bb = e.bb || [0, 0, 0, 0], mx = bb[0] + bb[2] / 2, my = bb[1] + bb[3] / 2, grund = grundUnter(d, i, mx, my);
        const alt = gAlt ? vorher.ebenen[i] : null;
        SK.teileVon(e.roh).forEach(t => {
          if (teilZiel === e.id + ':' + t.k || gesetzt.has(e.id + ':' + t.k)) return;
          const w = SK.farbWert((e.teile && e.teile[t.k]) || { f: t.k });
          if (kontrastWert(w, grund) >= 1.3) return;
          const wAlt = alt && alt.id === e.id ? SK.farbWert((alt.teile && alt.teile[t.k]) || { f: t.k }) : null, gAltW = alt ? grundUnter(vorher, i, mx, my) : null;
          if (wAlt && gAltW && kontrastWert(wAlt, gAltW) < 1.3) return;   // war schon vorher so (gewollt), bleibt
          e.teile = e.teile || {}; e.teile[t.k] = besser(grund);
        });
      }
    });
  }
  const farbSchluessel = f => f ? (f.w ? 'w' + f.w.toLowerCase() : 'f' + f.f) : '';
  function farbEreignisse(wurzel) {
    wurzel.addEventListener('click', e => {
      const fw = e.target.closest('[data-fw],[data-fwert]'); const box = e.target.closest('[data-farbe]');
      if (fw && box) return setzeFarbe(box.dataset.farbe, fw.dataset.fw ? { f: fw.dataset.fw } : { w: fw.dataset.fwert });
      const p = e.target.closest('[data-pipette]'); if (p && box) return pipette(box.dataset.farbe);
    });
    wurzel.addEventListener('change', e => {
      const i = e.target.closest('[data-hex]'), box = e.target.closest('[data-farbe]'); if (!i || !box) return;
      let v = i.value.trim(); if (/^[0-9a-f]{6}$/i.test(v)) v = '#' + v; if (/^#[0-9a-f]{3}$/i.test(v)) v = '#' + v.slice(1).split('').map(c => c + c).join('');
      if (!/^#[0-9a-f]{6}$/i.test(v)) { melde('That is not a colour value. Example: #A8232A'); i.value = ''; return; }
      setzeFarbe(box.dataset.farbe, { w: v.toLowerCase() });
    });
  }
  async function pipette(ziel) {
    if (window.EyeDropper) {
      try { const r = await new EyeDropper().open(); if (r && r.sRGBHex) setzeFarbe(ziel, { w: hexAus(r.sRGBHex) }); } catch (e) { /* abgebrochen */ }
      return;
    }
    // Safari, Firefox: im Entwurf und in hochgeladenen Fotos
    const c = await SKDruck.raster(ED.doc, Math.min(1600, ED.doc.form.b * ED.S * (devicePixelRatio || 1)));
    ED.pipette = { ziel, c };
    document.body.classList.add('sk-pipette-an');
    if (ED.tab !== 'fotos') { const w = $('#wirt'), r = w.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight) w.scrollIntoView({ block: 'center' }); }
    melde('Pipette: tap a colour in the sticker or in a photo. Esc stops.', { ms: 6000 });
  }
  function hexAus(s) { s = String(s); if (s[0] === '#') return s.slice(0, 7).toLowerCase(); const m = /(\d+)\D+(\d+)\D+(\d+)/.exec(s); return m ? '#' + [m[1], m[2], m[3]].map(v => (+v).toString(16).padStart(2, '0')).join('') : '#000000'; }
  function pipetteAus() { ED.pipette = null; document.body.classList.remove('sk-pipette-an'); }
  function pixel(c, x, y) { const d = c.getContext('2d').getImageData(Math.max(0, Math.min(c.width - 1, x)), Math.max(0, Math.min(c.height - 1, y)), 1, 1).data; return '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join(''); }
  function pipetteKlick(e) {
    if (!ED.pipette) return false;
    const bl = e.target.closest('.sk-blatt'), im = e.target.closest('img[data-pipette-bild]');
    let w = null;
    if (bl) { const r = bl.getBoundingClientRect(), c = ED.pipette.c; w = pixel(c, Math.floor((e.clientX - r.left) / r.width * c.width), Math.floor((e.clientY - r.top) / r.height * c.height)); }
    else if (im) { const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext('2d').drawImage(im, 0, 0); const r = im.getBoundingClientRect(); w = pixel(c, Math.floor((e.clientX - r.left) / r.width * c.width), Math.floor((e.clientY - r.top) / r.height * c.height)); }
    if (!w) return false;
    e.preventDefault(); e.stopPropagation();
    const z = ED.pipette.ziel; pipetteAus(); setzeFarbe(z, { w }); melde('Colour taken: ' + w.toUpperCase());
    return true;
  }

  /* ---------- Farbprofil eines Fotos (die häufigsten Farben, k-Mittel auf 64×64 Punkten) ---------- */
  function farbprofil(bild, n = 6) {
    const c = document.createElement('canvas'), k = 64; c.width = k; c.height = k; const x = c.getContext('2d'); x.drawImage(bild, 0, 0, k, k);
    const d = x.getImageData(0, 0, k, k).data, p = [];
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) p.push([d[i], d[i + 1], d[i + 2]]);
    if (!p.length) return [];
    let m = Array.from({ length: n }, (_, i) => p[Math.floor((i + .5) * p.length / n)].slice());
    for (let it = 0; it < 12; it++) {
      const s = m.map(() => [0, 0, 0, 0]);
      p.forEach(q => { let b = 0, bd = 1e9; m.forEach((c2, j) => { const dd = (q[0] - c2[0]) ** 2 + (q[1] - c2[1]) ** 2 + (q[2] - c2[2]) ** 2; if (dd < bd) { bd = dd; b = j; } }); s[b][0] += q[0]; s[b][1] += q[1]; s[b][2] += q[2]; s[b][3]++; });
      m = m.map((c2, j) => s[j][3] ? [s[j][0] / s[j][3], s[j][1] / s[j][3], s[j][2] / s[j][3], s[j][3]] : c2);
    }
    return m.sort((a, b) => (b[3] || 0) - (a[3] || 0)).map(c2 => '#' + c2.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join(''))
      .filter((h, i, l) => l.indexOf(h) === i);
  }

  /* ---------- Rechte Platte «Design» ---------- */
  const ZU_KNOPF = '<button class="rechts__zu" data-tu="zu" aria-label="Close (Esc)" title="Close (Esc)"><svg viewBox="0 0 24 24"><path d="M9 14.5 4 9.5l5-5M4 9.5h11a5 5 0 0 1 0 10h-3"/></svg></button>';
  function regler(k, v, min, max, schritt, anzeige) { return `<div class="regler"><input type="range" data-r="${k}" min="${min}" max="${max}" step="${schritt}" value="${v}" aria-label="${esc(k)}"><output>${esc(anzeige)}</output></div>`; }
  function rechtsOffen(offen) { const st = $('.studio'); if (st) st.classList.toggle('rechts-zu', !offen); }
  function zeichneRechts() {
    const R = $('#rechts'), e = ED.sel && ebene(ED.sel);
    rechtsOffen(!!e || ED.erweitert);
    if (!ED.doc) { R.innerHTML = ''; return; }
    if (!e) { R.innerHTML = stickerPlatte(); return; }
    const art = { text: 'Text', bogen: 'Text along the edge', grafik: e.grund ? 'Sticker shape' : 'Shape', bild: 'Photo' }[e.typ];
    let h = `<div class="rechts__kopf"><small>Design</small>${ZU_KNOPF}</div><h2>${esc(art)}</h2><p class="klein sk-ebenenname">${esc(e.name || '')}</p>`;
    if (e.typ === 'text' || e.typ === 'bogen') {
      const s = SK.schrift(e.schrift), schriften = Fundus.schriften() || [];
      h += `<div class="gruppe"><label>Words</label><textarea class="textfeld" id="eText" rows="${e.typ === 'text' ? 3 : 2}" maxlength="5000">${esc(e.text)}</textarea><p class="klein">Or tap the words twice on the sticker.</p></div>
        <div class="gruppe"><label>Font</label><div class="segment segment--schrift sk-schriften">${schriften.map(f => `<button data-schrift="${esc(f.id)}" class="${s.id === f.id ? 'an' : ''}" style="font-family:'${esc(f.familie || f.name)}'">${esc(f.name)}</button>`).join('')}</div>
          ${(s.schnitte || []).length > 1 ? `<div class="segment" style="margin-top:8px">${[[400, 'Regular'], [500, 'Medium'], [600, 'Semibold']].filter(([w]) => w >= Math.min(...s.schnitte) && w <= Math.max(...s.schnitte)).map(([w, t]) => `<button data-schnitt="${w}" class="${(+e.schnitt || 400) === w ? 'an' : ''}">${t}</button>`).join('')}</div>` : ''}</div>
        <div class="gruppe"><label>Size</label><div class="groesse"><button data-grschritt="-1" aria-label="Smaller">−</button><input type="number" min="2" max="300" step="0.5" data-grpt value="${r1(e.gr * (e.sx ?? 1) * PT)}"><span>pt</span><button data-grschritt="1" aria-label="Bigger">+</button></div></div>
        <div class="gruppe"><label>Style</label><div class="segment">${[[0, 'Normal'], [1, 'Capitals']].map(([k, t]) => `<button data-gross="${k}" class="${!!e.gross === !!k ? 'an' : ''}">${t}</button>`).join('')}</div>
          <label class="unter">Letter spacing</label>${regler('sperr', e.sperr || 0, -.05, .5, .01, (e.sperr || 0).toFixed(2))}</div>
        <div class="gruppe"><label>Colour</label>${farbWahl(e.farbe, 'el:' + e.id + ':farbe')}</div>`;
      if (e.typ === 'text') h += `<div class="gruppe"><label>Alignment</label><div class="segment">${[['start', 'Left'], ['middle', 'Centre'], ['end', 'Right']].map(([k, t]) => `<button data-anker="${k}" class="${e.anker === k ? 'an' : ''}">${t}</button>`).join('')}</div></div>`;
      else h += `<div class="gruppe"><label>Edge</label><div class="segment">${[[1, 'Top'], [0, 'Bottom']].map(([k, t]) => `<button data-oben="${k}" class="${!!e.oben === !!k ? 'an' : ''}">${t}</button>`).join('')}</div>
          <label class="unter">Distance from the centre</label>${regler('r', e.r, 3, Math.max(e.r + 5, ED.doc.form.b / 2), .1, r1(e.r) + ' mm')}
          <label class="unter">Position on the edge</label>${regler('start', e.start ?? 25, 0, 50, .5, Math.round(e.start ?? 25) + ' %')}</div>`;
    } else if (e.typ === 'grafik') {
      const teile = SK.teileVon(e.roh);
      h += `<div class="gruppe"><label>${teile.length > 1 ? 'Colours, each on its own' : 'Colour'}</label>${teile.map(t => `<div class="sk-teil"><span class="unter">${esc((Fundus.farbe(t.k) || {}).name || t.k)}${t.a === 's' ? ' · line' : ''}</span>${farbWahl(e.teile && e.teile[t.k] || { f: t.k }, 'teil:' + e.id + ':' + t.k)}</div>`).join('') || '<p class="klein">This part has no colour of its own.</p>'}</div>`;
      if (e.grund) h += `<div class="gruppe"><p class="klein">The shape of the sticker. Its outline is the cut line. Size and shape: tap the sticker background, then «Sticker».</p></div>`;
    } else if (e.typ === 'bild') {
      h += `<div class="gruppe"><label>Photo</label><p class="klein" style="margin:0 0 8px">${esc(e.name || '')} · ${e.px ? e.px[0] + ' × ' + e.px[1] + ' px' : ''}</p><div class="knoepfe"><button data-tu="fotoTausch">Change photo</button></div></div>`;
    }
    if (!e.grund) {
      const sk = Math.round((e.sx ?? 1) * 100);
      if (e.typ !== 'text' && e.typ !== 'bogen') h += `<div class="gruppe"><label>Size</label>${regler('skala', sk, 10, 400, 1, sk + ' %')}</div>`;
      h += `<div class="gruppe"><label>Turn</label>${regler('dreh', e.dreh || 0, -180, 180, 1, Math.round(e.dreh || 0) + '°')}</div>`;
    }
    if (ED.erweitert) {
      h += `<div class="gruppe sk-erw-g"><label>Position in mm</label><div class="masse"><label>Across<input type="number" step=".5" data-pos="x" value="${r1(e.tx || 0)}"></label><label>Down<input type="number" step=".5" data-pos="y" value="${r1(e.ty || 0)}"></label></div></div>
        <div class="gruppe sk-erw-g"><label>Line up on the sticker</label><div class="segment sk-ausrichten">${[['l', 'Left'], ['c', 'Centre'], ['r', 'Right']].map(([k, t]) => `<button data-ausr="${k}">${t}</button>`).join('')}</div><div class="segment sk-ausrichten" style="margin-top:6px">${[['o', 'Top'], ['m', 'Middle'], ['u', 'Bottom']].map(([k, t]) => `<button data-ausr="${k}">${t}</button>`).join('')}</div></div>
        <div class="gruppe sk-erw-g"><label>Layer</label><div class="knoepfe"><button data-tu="hoch">Forward</button><button data-tu="runter">Backward</button><button data-tu="ganzhoch">To the front</button><button data-tu="ganzrunter">To the back</button></div></div>`;
    }
    h += `<div class="gruppe"><div class="knoepfe">${e.grund ? '' : `<button data-tu="kopie">Copy</button>`}${ED.erweitert ? `<button data-tu="aus">${e.aus ? 'Show' : 'Hide'}</button><button data-tu="fest">${e.fest ? 'Unlock' : 'Lock'}</button>` : ''}${e.grund ? '' : '<button data-tu="weg" class="weg">Delete</button>'}</div></div>`;
    R.innerHTML = h;
  }
  function stickerPlatte() {
    const d = ED.doc, f = d.form, ber = (window.SKStart && SKStart.bereiche()) || [];
    let h = `<div class="rechts__kopf"><small>Design</small>${ZU_KNOPF}</div><h2>Sticker</h2>
      <div class="gruppe"><label>Area</label><select id="eBereich">${ber.map(b => `<option value="${b.id}" ${b.id === d.bereich ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select></div>
      <div class="gruppe"><label>Size in mm</label><div class="masse"><label>Width<input type="number" min="15" max="300" step="1" data-form="b" value="${r1(f.b)}"></label><label>Height<input type="number" min="10" max="300" step="1" data-form="h" value="${r1(f.h)}" ${f.art === 'kreis' ? 'disabled' : ''}></label></div>
        <p class="klein">${f.art === 'kreis' ? 'Round: width and height stay the same.' : 'The words and parts stay where they are.'}</p></div>`;
    if (ED.erweitert) {
      h += `<div class="gruppe"><label>Shape</label><div class="segment sk-formwahl">${Object.entries(SK.FORMEN).map(([k, F]) => `<button data-formart="${k}" class="${f.art === k ? 'an' : ''}">${F.name}</button>`).join('')}</div><p class="klein">The outline of the sticker is the cut line.</p></div>
      <div class="gruppe"><label>Layers</label><ol class="sk-ebenen">${d.ebenen.slice().reverse().map(e => `<li data-wahl="${esc(e.id)}" class="${e.aus ? 'aus' : ''}"><span class="sk-ebenen__mini">${e.typ === 'text' || e.typ === 'bogen' ? 'T' : e.typ === 'bild' ? '▣' : '●'}</span><b>${esc(e.name || e.typ)}</b><button data-ebaus="${esc(e.id)}" title="${e.aus ? 'Show' : 'Hide'}" aria-label="${e.aus ? 'Show' : 'Hide'}">${e.aus ? '○' : '◉'}</button></li>`).join('')}</ol></div>`;
    }
    const m = motivHinweis(d); if (m) h += `<div class="gruppe">${m}</div>`;
    return h;
  }
  /* Wo kommt ein Motiv dieses Stickers schon vor (Hinweis, nie Sperre) */
  function motivHinweis(d, nurSchluessel) {
    return '';   // Robert 24.11.2026 («Du kannst … die ganze Kachel da unten wegmachen … interessiert doch keinen»): der Hinweis erscheint nirgends mehr
    const andere = alle().filter(x => x.id !== d.id), l = [];
    const ms = nurSchluessel ? [nurSchluessel] : [...SK.motive(d)];
    ms.forEach(k => { const wo = SK.woSchon(k, andere); if (wo.length) l.push({ k, wo }); });
    if (!l.length) return '';
    const ber = (window.SKStart && SKStart.bereiche()) || [], bn = id => (ber.find(b => b.id === id) || {}).name || '';
    /* Robert 24.11.2026 («und was soll das heißen already used»): sagt jetzt, welches Teil auf welchen anderen Stickern schon vorkommt und dass ein Klick sie öffnet */
    const teilName = k => { if (!k.startsWith('el:')) return '«' + k.slice(3) + '»'; const n = (Fundus.elemente({}).find(e => e.id === k.slice(3)) || {}).name || k.slice(3); return 'The ' + n.charAt(0).toLowerCase() + n.slice(1); };
    return `<div class="sk-motiv"><b>Also on other stickers</b>${l.slice(0, 4).map(x => `<p><span>${esc(teilName(x.k))}</span> is also on ${x.wo.slice(0, 3).map(s => `<a href="#" data-oeffne="${esc(s.id)}">${esc(s.name)}</a>${bn(s.bereich) ? ' <small>(' + esc(bn(s.bereich)) + ')</small>' : ''}`).join(', ')}${x.wo.length > 3 ? ` and ${x.wo.length - 3} other ${x.wo.length - 3 === 1 ? 'sticker' : 'stickers'}` : ''}.</p>`).join('')}<p><small>Click a name to open that sticker.</small></p></div>`;
  }

  /* ---------- Linke Platte ---------- */
  function zeichneLinks() {
    if (!ED.doc) return;
    const d = ED.doc, texte = d.ebenen.filter(e => (e.typ === 'text' || e.typ === 'bogen'));
    $('#einfachTexte').innerHTML = texte.length ? texte.map(e => `<label class="sk-feld">${esc(e.name || 'Words')}<textarea rows="${e.typ === 'text' && String(e.text).includes('\n') ? 2 : 1}" data-schnelltext="${esc(e.id)}" maxlength="5000">${esc(e.text)}</textarea></label>`).join('') : '<p class="klein">This sticker has no words. Add some with «Text» above the sticker.</p>';
    // Farben des Stickers: jede benutzte Farbe einmal, Ändern färbt alle Teile mit dieser Farbe um
    const farben = new Map();
    d.ebenen.forEach(e => {
      if (e.aus) return;
      if (e.typ === 'text' || e.typ === 'bogen') farben.set(farbSchluessel(e.farbe), e.farbe);
      if (e.typ === 'grafik') SK.teileVon(e.roh).forEach(t => { const f = e.teile && e.teile[t.k] || { f: t.k }; farben.set(farbSchluessel(f), f); });
    });
    const fokus = document.activeElement && document.activeElement.closest('#einfachFarben') ? document.activeElement.closest('[data-farbe]')?.dataset.farbe : null;
    const offen = new Set([...document.querySelectorAll('#einfachFarben details[open] [data-farbe]')].map(x => x.dataset.farbe)); if (ED.offenFarbe) offen.add(ED.offenFarbe); ED.offenFarbe = null;
    $('#einfachFarben').innerHTML = [...farben.entries()].map(([k, f]) => `<details class="wo-schublade sk-schnellfarbe"${fokus === 'alle:' + k || offen.has('alle:' + k) ? ' open' : ''}><summary><span class="sk-wert__probe" style="background:${SK.farbWert(f)}"></span>${esc(SK.farbName(f))}</summary><div>${farbWahl(f, 'alle:' + k)}</div></details>`).join('');
    const m = motivHinweis(d); $('#einfachMotiv').hidden = !m; $('#einfachMotiv').innerHTML = m;
    const ber = (window.SKStart && SKStart.bereiche()) || [], b = ber.find(x => x.id === d.bereich);
    $('#dna').innerHTML = `<p class="klein">${esc(b ? b.name : '')}${d.herkunft === 'haus' ? ' · a sticker of the house, read from the brand book' : ''}</p>${d.vorbild ? `<p class="klein">As printed until now:</p><img class="sk-vorbild" src="${esc(d.vorbild)}" alt="">` : ''}`;
  }

  /* ---------- Ziehen, Griffe ---------- */
  let zug = null;
  function blattPunkt(e) { const r = $('#wirt').getBoundingClientRect(); return [(e.clientX - r.left) / ED.S, (e.clientY - r.top) / ED.S]; }
  function anfassen(e) {
    if (pipetteKlick(e)) return;
    const gr = e.target.closest('[data-griff]');
    if (gr && ED.sel) {
      const el = ebene(ED.sel), r = rahmenVon(el.id);
      zug = { art: gr.dataset.griff, id: el.id, start: blattPunkt(e), vorher: JSON.stringify(ED.doc), el0: kopie(el), mitte: [(r.x + r.w / 2) / ED.S, (r.y + r.h / 2) / ED.S] };
      e.preventDefault(); gr.setPointerCapture?.(e.pointerId); return;
    }
    let g = treffer(e);
    /* Zweiter Klick eines Doppelklicks: bleibt beim Element des ersten, auch wenn sich das Blatt dazwischen verschoben hat (die Platte rechts
       geht beim Wählen auf und das Blatt wird kleiner). Sonst trifft der Doppelklick auf Text die Fläche darunter. */
    const vor = ED.klick; ED.klick = null;
    if (vor && Date.now() - vor.t < 500 && Math.hypot(e.clientX - vor.x, e.clientY - vor.y) < 12 && ebene(vor.id)) { const g0 = $('#wirt svg') && $('#wirt svg').querySelector(`[data-ebene="${CSS.escape(vor.id)}"]`); if (g0) g = g0; }
    if (g) ED.klick = { id: g.dataset.ebene, t: Date.now(), x: e.clientX, y: e.clientY };
    if (!g) { if (e.target.closest('#wirt')) { waehle(null); } return; }
    let id = g.dataset.ebene, el = ebene(id);
    if (el && el.fest && !ED.erweitert) return;
    if (ED.sel !== id) waehle(id);
    if (el.fest) return;
    zug = { art: 'zieh', id, start: blattPunkt(e), vorher: JSON.stringify(ED.doc), el0: kopie(el), bewegt: false };
    e.preventDefault();
  }
  /* Welche Ebene liegt unter dem Finger: von oben nach unten; Text gilt im ganzen Rahmen als getroffen (WebKit trifft sonst nur die Buchstaben) */
  function treffer(e) {
    const svg = $('#wirt svg'); if (!svg || !e.target.closest('#wirt')) return null;
    const direkt = e.target.closest('[data-ebene]');
    for (const el of ED.doc.ebenen.slice().reverse()) {
      if (el.aus) continue;
      const g = svg.querySelector(`[data-ebene="${CSS.escape(el.id)}"]`); if (!g) continue;
      if (g === direkt) return g;
      if (el.typ === 'text' || el.typ === 'bogen') {
        const r = g.getBoundingClientRect(), drin = e.clientX >= r.left - 2 && e.clientX <= r.right + 2 && e.clientY >= r.top - 2 && e.clientY <= r.bottom + 2;
        if (drin && el.typ === 'text') return g;
        /* Bogentext: auch zwischen den Buchstaben trifft ein Klick, solange er im Band der Schrift liegt (Fehlerart: Doppelklick auf Text trifft nicht) */
        if (drin && el.typ === 'bogen' && g.getScreenCTM) { try { const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(g.getScreenCTM().inverse()), d = Math.hypot(p.x - el.cx, p.y - el.cy); if (Math.abs(d - el.r) <= Math.max(el.gr, 1.5) * 1.1) return g; } catch (x) { } }
      }
    }
    return direkt;
  }
  function ziehen(e) {
    if (!zug) return;
    const p = blattPunkt(e), dx = p[0] - zug.start[0], dy = p[1] - zug.start[1], el = ebene(zug.id), f = ED.doc.form;
    if (!el) return;
    const hilfen = [];
    if (zug.art === 'zieh') {
      if (!zug.bewegt && Math.hypot(dx, dy) * ED.S < 3) return;
      zug.bewegt = true;
      let nx = (zug.el0.tx || 0) + dx, ny = (zug.el0.ty || 0) + dy;
      // Einrasten an der Mitte des Stickers (und am Raster, wenn an)
      el.tx = nx; el.ty = ny; zeichneEbeneNeu(el);
      const r = rahmenVon(el.id);
      if (r && !e.altKey) {
        const cx = (r.x + r.w / 2) / ED.S, cy = (r.y + r.h / 2) / ED.S, fang = 6 / ED.S;
        if (Math.abs(cx - f.b / 2) < fang) { nx += f.b / 2 - cx; hilfen.push({ v: f.b / 2 * ED.S }); }
        if (Math.abs(cy - f.h / 2) < fang) { ny += f.h / 2 - cy; hilfen.push({ h: f.h / 2 * ED.S }); }
        if (ED.raster && ED.erweitert) { if (!hilfen.some(x => x.v != null)) nx = Math.round(nx); if (!hilfen.some(x => x.h != null)) ny = Math.round(ny); }
      }
      el.tx = r2(nx); el.ty = r2(ny);
    } else if (zug.art === 'dreh') {
      const a = Math.atan2(p[1] - zug.mitte[1], p[0] - zug.mitte[0]) * 180 / Math.PI + 90;
      let d = Math.round(a); if (!e.shiftKey) { const z = Math.round(d / 15) * 15; if (Math.abs(z - d) < 4) d = z; }
      el.dreh = ((d + 540) % 360) - 180;
    } else {
      const d0 = Math.hypot(zug.start[0] - zug.mitte[0], zug.start[1] - zug.mitte[1]), d1 = Math.hypot(p[0] - zug.mitte[0], p[1] - zug.mitte[1]);
      const k = Math.max(.1, Math.min(10, d0 ? d1 / d0 : 1));
      el.sx = r2((zug.el0.sx ?? 1) * k); el.sy = r2((zug.el0.sy ?? 1) * k);
    }
    zeichneEbeneNeu(el); zeichneAuswahl(hilfen);
  }
  function loslassen() {
    if (!zug) return;
    const z = zug; zug = null;
    if (z.art === 'zieh' && !z.bewegt) return;
    const el = ebene(z.id);
    // Text: Grösse in die Schriftgrösse übernehmen (Schrift bleibt scharf und die Grösse in pt stimmt)
    if (el && (el.typ === 'text' || el.typ === 'bogen') && z.art !== 'zieh' && z.art !== 'dreh') {
      const k = (el.sx ?? 1) / (z.el0.sx ?? 1); el.sx = z.el0.sx ?? 1; el.sy = z.el0.sy ?? 1;
      el.gr = r2(z.el0.gr * k); if (el.typ === 'bogen') el.r = r2(z.el0.r * k);
    }
    ED.hist.push(z.vorher); ED.zukunft = []; ED.doc.geaendert = Date.now();
    zurueckSchreiben(); zeichneBlatt(); zeichneRechts();
  }
  function zeichneEbeneNeu(el) {
    const g = $('#wirt svg') && $('#wirt svg').querySelector(`[data-ebene="${CSS.escape(el.id)}"]`); if (!g) return;
    const t = SK.trafo(el); if (t) g.setAttribute('transform', t); else g.removeAttribute('transform');
  }
  function waehle(id) {
    if (ED.pipette) return;
    ED.sel = id; zeichneAuswahl(); zeichneRechts();
  }

  /* ---------- Neue Ebenen ---------- */
  async function neuesElement(art) {
    if (!ED.doc) return;
    const f = ED.doc.form;
    if (art === 'bild') { zeigeTab('fotos'); $('#fotoDatei').click(); return; }
    if (art === 'zeichen') { zeigeTab('elemente'); melde('Tap a sign or the pool ball to put it on the sticker.'); return; }
    let e;
    if (art === 'text') e = { id: SK.neueId(), typ: 'text', name: 'Words', text: 'Your words', x: f.b / 2, y: f.h / 2, gr: r2(Math.min(f.h * .16, f.b * .1)), anker: 'middle', schrift: { rolle: 'druck' }, schnitt: 400, sperr: 0, farbe: { f: kontrast() } };
    else if (art === 'bogen') { const r = Math.min(f.b, f.h) / 2 * .8; e = { id: SK.neueId(), typ: 'bogen', name: 'Words on the edge', text: 'THE CAT & GUN', cx: f.b / 2, cy: f.h / 2, r: r2(r), oben: true, start: 25, gr: r2(r * .13), schrift: { rolle: 'lauf' }, schnitt: 500, sperr: .18, farbe: { f: kontrast() } }; }
    else if (art === 'linie') e = SK.linieEbene(f.b * .3, f.h * .7, f.b * .4, { f: kontrast() });
    else if (SK.FORMEN[art]) { const F = SK.FORMEN[art], k = Math.min(f.b * .4 / F.b, f.h * .4 / F.h); e = SK.formEbene(art, f.b / 2 - F.b * k / 2, f.h / 2 - F.h * k / 2, F.b * k, F.h * k, { f: 'rot' }); }
    if (!e) return;
    aendern(d => d.ebenen.push(e)); ED.sel = e.id; zeichneAuswahl(); zeichneRechts();
    if (e.typ === 'text' || e.typ === 'bogen') setTimeout(() => { const t = $('#eText'); if (t) { t.focus(); t.select(); } }, 50);
  }
  function kontrast() { const g = ED.doc.ebenen.find(e => e.grund); const k = g && SK.teileVon(g.roh)[0]; const w = k ? SK.farbWert(g.teile && g.teile[k.k] || { f: k.k }) : '#ffffff'; const n = parseInt(w.slice(1), 16); const l = (0.2126 * (n >> 16) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255)) / 255; return l < .5 ? 'papier' : 'schwarz'; }
  /* Element aus dem Fundus einsetzen: Zeichen als eine Ebene, Sticker (Billardkugel) in seinen Teilen, eingepasst */
  async function elementEinsetzen(id) {
    if (!ED.doc) return;
    const f = ED.doc.form, el = Fundus.elemente({}).find(x => x.id === id); if (!el) return;
    const vorher = SK.woSchon('el:' + id, alle(), ED.doc.id);
    if (el.art === 'zeichen') {
      const b = Math.min(f.b * .5, f.h * .5 * el.b / el.h), e = await SK.zeichenEbene(id, f.b / 2 - b / 2, f.h / 2 - b * el.h / el.b / 2, b);
      e.teile = { [SK.teileVon(e.roh)[0]?.k || 'schwarz']: { f: kontrast() } };
      aendern(d => d.ebenen.push(e)); ED.sel = e.id;
    } else {
      const quelle = await SK.ausFundus(id), k = Math.min(f.b * .5 / quelle.form.b, f.h * .5 / quelle.form.h), ox = f.b / 2 - quelle.form.b * k / 2, oy = f.h / 2 - quelle.form.h * k / 2;
      const neu = quelle.ebenen.map(e => { const [px, py] = SK.pivot(e); e.sx = k; e.sy = k; e.tx = r2(ox - px + k * px); e.ty = r2(oy - py + k * py); delete e.grund; e.motiv = e.motiv || id; if (e.name === 'Sticker shape') e.name = el.name; return e; });
      aendern(d => d.ebenen.push(...neu)); ED.sel = neu[0].id;
    }
    zeichneAuswahl(); zeichneRechts();
    if (vorher.length) melde(`${el.name} is already on ${vorher.length} other sticker${vorher.length > 1 ? 's' : ''}: ${vorher.slice(0, 3).map(s => s.name).join(', ')}.`, { ms: 9000 });
  }

  /* ---------- Fotos ---------- */
  async function fotoDatei(datei) {
    if (!datei) return;
    if (!/^image\//.test(datei.type) && !/\.(jpe?g|png|webp|heic|gif)$/i.test(datei.name)) { melde('PHOTO · That is not a photo (JPG, PNG or WebP).', { fehler: true }); return; }
    let bild;
    try { bild = await createImageBitmap(datei); } catch (e) { melde('PHOTO · This photo cannot be read. Please save it as JPG or PNG.', { fehler: true }); return; }
    ED.profil = farbprofil(bild); zeigeProfil(URL.createObjectURL(datei), bild.width, bild.height);
    $('#fotoInfo').textContent = `${datei.name} · ${bild.width} × ${bild.height} px`;
    if (Math.max(bild.width, bild.height) < 900) { melde(`PHOTO · The photo is only ${Math.max(bild.width, bild.height)} pixels wide. It needs at least 900 for print. Its colours are shown below.`, { fehler: true }); zeichneRechts(); return; }
    // im Browser verkleinern (längste Seite 2400 px) und neu kodieren, dann hochladen (Vertrag: weg.foto)
    const k = Math.min(1, 2400 / Math.max(bild.width, bild.height)), c = document.createElement('canvas');
    c.width = Math.round(bild.width * k); c.height = Math.round(bild.height * k); c.getContext('2d').drawImage(bild, 0, 0, c.width, c.height);
    const typ = datei.type === 'image/png' ? 'image/png' : 'image/jpeg', daten = c.toDataURL(typ, .9);
    melde('The photo is uploading …', { ms: 30000 });
    try {
      const r = await SKA.hole('/the-cat-and-gun/haus/api/x/sticker/hochladen/catgun', { methode: 'POST', daten: { name: datei.name.slice(0, 120), daten, alt: datei.name.slice(0, 120) } });
      SKA.aendere(a => { a.fotos = a.fotos || []; if (!a.fotos.some(f => f.b === r.b)) a.fotos.unshift({ b: r.b, w: r.w, h: r.h, adresse: r.adresse, name: datei.name.slice(0, 120) }); });
      fotoEinsetzen({ b: r.b, w: r.w, h: r.h, adresse: r.adresse, name: datei.name.slice(0, 120) });
      zeigeFotos(); melde('Photo is on the sticker. Its colours are in the colour fields.');
    } catch (e) { melde(e.text || e.message, { fehler: true }); }
  }
  function fotoEinsetzen(f) {
    if (!ED.doc) return;
    const s = ED.doc.form, b = s.b * .6, h = Math.min(s.h * .6, b * f.h / f.w), bb = [r2(s.b / 2 - b / 2), r2(s.h / 2 - h / 2), r2(b), r2(h)];
    const e = { id: SK.neueId(), typ: 'bild', name: f.name || 'Photo', b: f.b, src: f.adresse, px: [f.w, f.h], bb, motiv: f.b };
    aendern(d => { const g = d.ebenen.findIndex(x => x.grund); d.ebenen.splice(g + 1, 0, e); }); ED.sel = e.id; zeichneAuswahl(); zeichneRechts();
  }
  function zeigeProfil(src, w, h) {
    $('#profil').innerHTML = `<div class="sk-profil"><img src="${esc(src)}" alt="" data-pipette-bild><div><b>Colours of this photo</b><div class="farben">${ED.profil.map(x => `<button data-profil="${x}" style="background:${x}" title="${x}" aria-label="${x}"></button>`).join('')}</div><p class="klein">These colours are in every colour field of the sticker, under «From the photo».</p></div></div>`;
  }
  function zeigeFotos() {
    const l = (SKA.A.arbeit && SKA.A.arbeit.fotos) || [];
    $('#fotos').innerHTML = l.length ? l.map(f => `<button class="sk-foto" data-foto="${esc(f.b)}" title="${esc(f.name || '')}"><img src="${esc(f.adresse)}" alt="${esc(f.name || '')}" loading="lazy" data-pipette-bild></button>`).join('') : '<p class="klein">Photos you upload show here.</p>';
  }

  /* ---------- Druckprüfung, Ausgabe ---------- */
  function pruefZahl() { const l = SKDruck.pruefen(ED.doc, $('#wirt svg')); const n = l.filter(x => x.art === 'fehler').length; $('#pruefZahl').textContent = n; $('#btnPruefen').classList.toggle('gut', !n); return l; }
  async function druckpruefung() {
    await SKDruck.abdeckung().catch(() => { });
    const l = pruefZahl();
    const a = await dialog(`<h2>Print check</h2>${l.length ? `<ul class="sk-pruefliste">${l.map(x => `<li class="${x.art}" data-id="${esc(x.id)}"><b>${x.art === 'fehler' ? 'Fix' : 'Note'}</b> ${esc(x.text)}</li>`).join('')}</ul>` : '<p class="leise">Everything is in order: no empty words, every sign is in the font, nothing over the cut line, photos sharp enough. The PDF gets 3 mm bleed and the cut line.</p>'}`,
      [{ t: 'Close', v: false, abbruch: true }, { t: 'PDF for the printer', v: 'pdf', haupt: true }]);
    if (a === 'pdf') ausgabe('pdf');
  }
  async function ausgabe(art) {
    if (!ED.doc) return;
    try {
      if (art === 'pdf') { melde('The PDF is being made …', { ms: 20000 }); const b = await SKDruck.pdf(ED.doc); SKDruck.herunterladen(new Blob([b], { type: 'application/pdf' }), SKDruck.dateiname(ED.doc) + '.pdf'); melde('PDF saved: 3 mm bleed, cut line «CutContour», fonts embedded.'); }
      else if (art === 'png') { const b = await SKDruck.png(ED.doc); SKDruck.herunterladen(b, SKDruck.dateiname(ED.doc) + '.png'); melde('Picture saved.'); }
      else if (art === 'json') { SKDruck.herunterladen(new Blob([JSON.stringify({ art: 'catgun-sticker', format: 1, sticker: ED.doc }, null, 1)], { type: 'application/json' }), SKDruck.dateiname(ED.doc) + '.json'); melde('Working file saved.'); }
    } catch (e) { console.error(e); melde('PRINT · The file could not be made: ' + (e.message || e), { fehler: true }); }
  }

  /* ---------- Reiter, Modus ---------- */
  function zeigeTab(t) {
    ED.tab = t;
    $$('.reiter [data-tab]').forEach(b => b.classList.toggle('an', b.dataset.tab === t));
    $$('.links .tab').forEach(s => s.classList.toggle('an', s.dataset.tab === t));
    gleiter();
    if (t === 'vorlagen' && window.SKStart) SKStart.zeichneVorlagenTab();
    if (t === 'elemente' && window.SKStart) SKStart.zeichneElementeTab();
    if (t === 'fotos') zeigeFotos();
  }
  function gleiter() { const a = $('.reiter button.an'), g = $('.reiter__gleiter'); if (!a || !g) return; g.style.width = a.offsetWidth + 'px'; g.style.transform = `translateX(${a.offsetLeft - 3}px)`; }
  function modusSetzen() {
    document.body.classList.toggle('sk-erweitert', ED.erweitert);
    $('#btnModus').setAttribute('aria-pressed', ED.erweitert); $('#btnModus span').textContent = ED.erweitert ? 'Simple' : 'More tools';
  }
  function umschalten() { ED.erweitert = !ED.erweitert; try { localStorage.setItem(LSM, ED.erweitert ? '1' : '0'); } catch (e) { } modusSetzen(); zeichneAlles(); }

  /* ---------- Rechte Platte: Eingaben ---------- */
  let textVor = null, textUhr = 0;
  function rechtsEreignisse() {
    const R = $('#rechts');
    farbEreignisse(R); farbEreignisse($('.links'));
    R.addEventListener('click', e => {
      const el = ED.sel && ebene(ED.sel), b = e.target.closest('button,[data-wahl],a[data-oeffne]'); if (!b) return;
      if (b.dataset.oeffne) { e.preventDefault(); return oeffne(b.dataset.oeffne); }
      if (b.dataset.wahl && !e.target.closest('[data-ebaus]')) return waehle(b.dataset.wahl);
      if (b.dataset.ebaus) return aendern(d => { const x = d.ebenen.find(y => y.id === b.dataset.ebaus); if (x) x.aus = !x.aus; });
      if (b.dataset.formart) return formAendern(b.dataset.formart, ED.doc.form.b, ED.doc.form.h);
      const tu = b.dataset.tu;
      if (tu === 'zu') { ED.sel = null; zeichneAuswahl(); zeichneRechts(); return; }
      if (!el) return;
      if (b.dataset.schrift) return aendern(d => { const x = d.ebenen.find(y => y.id === el.id); const f = (Fundus.schriften() || []).find(s => s.id === b.dataset.schrift); x.schrift = { id: b.dataset.schrift }; if (f && !(f.erlaubt || f.schnitte || [400]).includes(+x.schnitt)) x.schnitt = (f.erlaubt || f.schnitte || [400])[0]; });
      if (b.dataset.schnitt) return aendern(d => { d.ebenen.find(y => y.id === el.id).schnitt = +b.dataset.schnitt; });
      if (b.dataset.gross != null) return aendern(d => { d.ebenen.find(y => y.id === el.id).gross = b.dataset.gross === '1'; });
      if (b.dataset.anker) return aendern(d => { const x = d.ebenen.find(y => y.id === el.id), r = rahmenVon(x.id); x.anker = b.dataset.anker; if (r) { const l = (r.x) / ED.S - (x.tx || 0), rr = (r.x + r.w) / ED.S - (x.tx || 0); x.x = r2(x.anker === 'start' ? l : x.anker === 'end' ? rr : (l + rr) / 2); } });
      if (b.dataset.oben != null) return aendern(d => { d.ebenen.find(y => y.id === el.id).oben = b.dataset.oben === '1'; });
      if (b.dataset.grschritt) return aendern(d => { const x = d.ebenen.find(y => y.id === el.id); x.gr = r2(Math.max(.7, x.gr + (+b.dataset.grschritt) * .5 / PT)); });
      if (b.dataset.ausr) return ausrichten(el, b.dataset.ausr);
      if (tu === 'weg') { aendern(d => { d.ebenen = d.ebenen.filter(y => y.id !== el.id); }); ED.sel = null; zeichneAuswahl(); zeichneRechts(); return; }
      if (tu === 'kopie') { const k = kopie(el); k.id = SK.neueId(); k.tx = (k.tx || 0) + 2; k.ty = (k.ty || 0) + 2; delete k.grund; aendern(d => d.ebenen.push(k)); ED.sel = k.id; zeichneAuswahl(); zeichneRechts(); return; }
      if (tu === 'aus' || tu === 'fest') return aendern(d => { const x = d.ebenen.find(y => y.id === el.id); x[tu] = !x[tu]; });
      if (['hoch', 'runter', 'ganzhoch', 'ganzrunter'].includes(tu)) return aendern(d => {
        const i = d.ebenen.findIndex(y => y.id === el.id), x = d.ebenen.splice(i, 1)[0], min = d.ebenen.findIndex(y => y.grund) + 1;
        const ziel = tu === 'hoch' ? i + 1 : tu === 'runter' ? i - 1 : tu === 'ganzhoch' ? d.ebenen.length : min;
        d.ebenen.splice(Math.max(min, Math.min(d.ebenen.length, ziel)), 0, x);
      });
      if (tu === 'fotoTausch') { zeigeTab('fotos'); melde('Tap one of your photos, or upload a new one.'); }
    });
    R.addEventListener('input', e => {
      const el = ED.sel && ebene(ED.sel);
      if (e.target.id === 'eText' && el) { schnellText(el.id, e.target.value); return; }
      const r = e.target.dataset.r; if (!r || !el) return;
      const v = parseFloat(e.target.value), out = e.target.parentNode.querySelector('output');
      if (!zugRegler) { zugRegler = JSON.stringify(ED.doc); }
      if (r === 'skala') { el.sx = el.sy = v / 100; out.textContent = v + ' %'; }
      else if (r === 'dreh') { el.dreh = v; out.textContent = v + '°'; }
      else if (r === 'sperr') { el.sperr = v; out.textContent = v.toFixed(2); }
      else if (r === 'r') { el.r = v; out.textContent = r1(v) + ' mm'; }
      else if (r === 'start') { el.start = v; out.textContent = Math.round(v) + ' %'; }
      const svg = $('#wirt svg'); const neu = SK.ebeneSvg(el, { idz: 'ed' }); const g = svg && svg.querySelector(`[data-ebene="${CSS.escape(el.id)}"]`); if (g) g.outerHTML = neu;
      zeichneAuswahl();
    });
    R.addEventListener('change', e => {
      const el = ED.sel && ebene(ED.sel);
      if (e.target.dataset.r && zugRegler) { ED.hist.push(zugRegler); zugRegler = null; ED.zukunft = []; zurueckSchreiben(); zeichneBlatt(); return; }
      if (e.target.id === 'eBereich') return aendern(d => { d.bereich = e.target.value; });
      if (e.target.dataset.form) { const v = Math.max(10, Math.min(300, parseFloat(e.target.value) || 0)), f = ED.doc.form; return formAendern(f.art, e.target.dataset.form === 'b' ? v : f.b, e.target.dataset.form === 'h' ? v : f.h); }
      if (!el) return;
      if (e.target.dataset.grpt != null) { const v = parseFloat(e.target.value); if (v > 0) aendern(d => { const x = d.ebenen.find(y => y.id === el.id); x.gr = r2(v / PT / (x.sx ?? 1)); }); }
      if (e.target.dataset.pos) { const v = parseFloat(e.target.value) || 0; aendern(d => { d.ebenen.find(y => y.id === el.id)['t' + e.target.dataset.pos] = v; }); }
    });
  }
  let zugRegler = null;
  /* Tippen: ein Schritt für das ganze Tippen (Vorlage I10), gesichert 0,9 s nach dem letzten Buchstaben */
  function schnellText(id, wert) {
    const el = ebene(id); if (!el) return;
    if (!textVor) textVor = JSON.stringify(ED.doc);
    el.text = wert; if (el.name === 'Words' || el.name === 'Title' || el.name === 'Small line' || el.name === 'Words on the edge' || !el.name) { /* Name bleibt */ }
    const svg = $('#wirt svg'), g = svg && svg.querySelector(`[data-ebene="${CSS.escape(id)}"]`); if (g) g.outerHTML = SK.ebeneSvg(el, { idz: 'ed' });
    zeichneAuswahl();
    $$(`[data-schnelltext="${CSS.escape(id)}"]`).forEach(t => { if (t !== document.activeElement) t.value = wert; });
    if ($('#eText') && $('#eText') !== document.activeElement && ED.sel === id) $('#eText').value = wert;
    clearTimeout(textUhr); textUhr = setTimeout(textFertig, 900);
  }
  function textFertig() { clearTimeout(textUhr); if (!textVor) return; ED.hist.push(textVor); textVor = null; ED.zukunft = []; ED.doc.geaendert = Date.now(); zurueckSchreiben(); pruefZahl(); }
  function ausrichten(el, k) {
    const r = rahmenVon(el.id); if (!r) return; const f = ED.doc.form, S = ED.S;
    aendern(d => { const x = d.ebenen.find(y => y.id === el.id);
      if (k === 'l') x.tx = r2((x.tx || 0) + (2 - r.x / S)); if (k === 'r') x.tx = r2((x.tx || 0) + (f.b - 2 - (r.x + r.w) / S)); if (k === 'c') x.tx = r2((x.tx || 0) + (f.b / 2 - (r.x + r.w / 2) / S));
      if (k === 'o') x.ty = r2((x.ty || 0) + (2 - r.y / S)); if (k === 'u') x.ty = r2((x.ty || 0) + (f.h - 2 - (r.y + r.h) / S)); if (k === 'm') x.ty = r2((x.ty || 0) + (f.h / 2 - (r.y + r.h / 2) / S)); });
  }
  /* Form oder Grösse des Stickers ändern: Grund und Schneidelinie neu, alles andere bleibt in der Mitte */
  function formAendern(art, b, h) {
    if (art === 'kreis') h = b;
    aendern(d => {
      const f = d.form, dx = (b - f.b) / 2, dy = (h - f.h) / 2;
      const g = d.ebenen.find(e => e.grund), farbe = g ? (() => { const t = SK.teileVon(g.roh)[0]; return t ? (g.teile && g.teile[t.k]) || { f: t.k } : { f: 'papier' }; })() : { f: 'papier' };
      d.ebenen.forEach(e => { if (!e.grund) { e.tx = r2((e.tx || 0) + dx); e.ty = r2((e.ty || 0) + dy); } });
      const neu = SK.formEbene(art, 0, 0, b, h, farbe, true);
      if (g) Object.assign(g, { roh: neu.roh, bb: neu.bb, teile: neu.teile }); else d.ebenen.unshift(neu);
      d.form = { art, b, h, d: SK.formD(art, b, h) };
    });
  }

  /* ---------- Leiste unten: Speichern, Veröffentlichen, Verlauf (R08–R14) ---------- */
  function leiste() {
    const u = SKA.ungespeichert(), A = SKA.A, offen = A.offenEntwurf;
    const nU = u ? SKA.unterschiede(A.basis, A.arbeit).length : 0, nE = offen ? SKA.unterschiede(A.stand.live, A.stand.entwurf).length : 0;
    $('#leisteText').textContent = u ? `${nU || 1} ${(nU || 1) === 1 ? 'change' : 'changes'} not saved` : offen ? `Draft: ${nE} ${nE === 1 ? 'change waits' : 'changes wait'} to be published` : 'Everything is published';
    $('#leiste').dataset.z = u ? 'gelb' : offen ? 'entwurf' : 'gut';
    const s = $('#btnSichern'); if (!s.classList.contains('ok')) s.dataset.z = u ? 'gelb' : 'grau';
    $('#btnVeroeff').disabled = !offen || u; $('#btnVeroeff').title = u ? 'Save first' : offen ? '' : 'Nothing to publish';
    $('#btnVorher').disabled = !u && !offen;
  }
  async function sichern() {
    textFertig();
    if (!SKA.ungespeichert()) { melde('Nothing changed, nothing saved.'); return; }
    const s = $('#btnSichern');
    try {
      const r = await SKA.speichern();
      s.classList.add('ok'); s.dataset.z = 'gruen'; s.querySelector('span').textContent = 'Saved'; setTimeout(() => { s.classList.remove('ok'); s.querySelector('span').textContent = 'Save'; leiste(); }, 2600);
      const l = r.liste || [], namen = l.slice(0, 3).map(x => x.name).join(', ') + (l.length > 3 ? ` and ${l.length - 3} more` : '');
      melde(`Saved in the draft: ${(namen || 'changes').replace(/[.!?…]+$/, '')}.`, { knoepfe: [{ t: 'Before, after', f: vorherNachher }, { t: 'Undo', f: () => { SKA.zurueckAuf(r.vorher); if (ED.doc) oeffneNeu(); melde('The changes are back as unsaved input. Save to keep it this way.'); } }] });
      if (ED.doc) oeffneNeu(true);
    } catch (e) {
      if (e.stichwort === 'konflikt') { melde(`CONFLICT · This was changed in another window. Nothing is overwritten. Your version is kept as ${(e.kopien || []).map(k => '«' + k.name + '»').join(', ') || 'a copy'}. Save to keep it.`, { fehler: true, ms: 16000 }); if (e.kopien && e.kopien[0] && ED.doc) oeffne(e.kopien[0].id); }
      else if (e.offline) melde('OFFLINE · No connection. Nothing is lost: your changes stay here. Save again when the connection is back.', { fehler: true, ms: 14000 });
      else melde(e.text || e.message, { fehler: true });
      leiste();
    }
  }
  function oeffneNeu(still) { if (!ED.doc) return; const d = alle().find(s => s.id === ED.doc.id); if (!d) { ED.doc = null; window.SKStart && SKStart.zeige('galerie'); return; } const hist = ED.hist, zuk = ED.zukunft, sel = ED.sel; ED.doc = kopie(d); ED.hist = hist; ED.zukunft = zuk; ED.sel = ebene(sel) ? sel : null; zeichneAlles(); }
  async function veroeffentlichen() {
    if (SKA.ungespeichert()) { melde('Save first, then publish.'); return; }
    const A = SKA.A; if (!A.offenEntwurf) { melde('Nothing changed, nothing published.'); return; }
    const l = SKA.unterschiede(A.stand.live, A.stand.entwurf);
    await SKDruck.abdeckung().catch(() => { });
    const ohne = (A.stand.entwurf.sticker || []).filter(s => l.some(x => x.id === s.id)).map(s => ({ s, w: [...new Set((s.ebenen || []).filter(e => !e.aus && (e.typ === 'text' || e.typ === 'bogen')).flatMap(e => SKDruck.fehlend(e)))] })).filter(x => x.w.length);
    const notiz = await dialog(`<h2>Publish the stickers?</h2><p class="leise">The print files of the changed stickers are made again and go to Print &amp; feed. ${l.length} ${l.length === 1 ? 'change' : 'changes'}:</p><ul class="sk-liste">${l.slice(0, 12).map(x => `<li><b>${{ new: 'New', changed: 'Changed', deleted: 'Deleted', order: 'Order' }[x.was]}</b> ${esc(x.name)}</li>`).join('')}${l.length > 12 ? `<li>and ${l.length - 12} more</li>` : ''}</ul>${ohne.length ? `<ul class="sk-pruefliste">${ohne.map(x => `<li class="fehler"><b>Fix</b> «${esc(x.s.name)}» has signs the font does not have: ${esc(x.w.slice(0, 8).join(' '))}. They are left out of the print file.</li>`).join('')}</ul>` : ''}<label class="sk-feld">Note (optional)<input id="vNotiz" maxlength="300" placeholder="For example: new juice colours"></label>`,
      [{ t: 'Not now', v: null, abbruch: true }, { t: 'Publish', v: () => $('#vNotiz').value, haupt: true }]);
    if (notiz === null || notiz === false) return;
    const schritte = ['Making the print files', 'Checking', 'Publishing'];
    const zeige = (i, t) => { $('#dialogKarte').innerHTML = `<h2>Publishing</h2><ol class="sk-schritte">${schritte.map((s, j) => `<li class="${j < i ? 'fertig' : j === i ? 'jetzt' : ''}">${s}</li>`).join('')}</ol><p class="leise">${esc(t || '')}</p>`; $('#dialog').hidden = false; };
    zeige(0);
    try {
      const daten = A.stand.entwurf, dateien = [], liste = [], alt = await altesVerzeichnis();
      let n = 0;
      for (const s of daten.sticker) {
        const abd = SKDruck.abdruck(s), pdfName = s.id.replace(/[^a-z0-9-]/gi, '').toLowerCase() + '.pdf';
        liste.push({ id: s.id, name: s.name, bereich: s.bereich, pdf: pdfName, abdruck: abd, b: s.form.b, h: s.form.h, form: s.form.art });
        if (alt[s.id] && alt[s.id].abdruck === abd) continue;   // gleich wie veröffentlicht: nichts hochladen
        n++; zeige(0, `${n}: ${s.name}`);
        const b = await SKDruck.pdf(s);
        dateien.push({ pfad: 'drucksachen/sticker/editor/' + pdfName, inhalt: b64(b), kodierung: 'base64' });
      }
      dateien.push({ pfad: 'drucksachen/sticker/editor/index.json', inhalt: JSON.stringify({ haus: 'The Cat & Gun', werkzeug: 'Sticker editor', stand: new Date().toISOString(), sticker: liste }, null, 1), kodierung: 'text' });
      zeige(1, `${n} print ${n === 1 ? 'file' : 'files'} changed.`);
      zeige(2);
      const s = await SKA.veroeffentlichen(notiz, dateien);
      $('#dialogKarte').innerHTML = `<h2>Is online.</h2><p class="leise">${(() => { const g = s.website ? s.website.geschrieben.filter(p => p.endsWith('.pdf') && dateien.some(d => d.pfad === p)).length : 0; return `${g} print ${g === 1 ? 'file' : 'files'} written, ${liste.length - g} unchanged.`; })()} Print &amp; feed now takes the new files.</p><div class="dialog__knoepfe"><button class="leicht" data-ansicht-dialog="druck">See print files</button><button class="knopf" data-zu>Close</button></div>`;
      $('#dialogKarte').onclick = e => { if (e.target.closest('[data-zu]')) ergebnisZu(); if (e.target.closest('[data-ansicht-dialog]')) { ergebnisZu(); SKStart.zeige('druck'); } };
      ergebnisFenster();
    } catch (e) {
      console.error(e);
      $('#dialogKarte').innerHTML = `<h2>Not published.</h2><p class="leise">${esc(e.text || e.message)} The print files and stickers stay as they were.</p><div class="dialog__knoepfe"><a class="leicht" href="pruefung.html#veroeffentlichen" target="_blank" rel="noopener">What to do?</a><button class="knopf" data-zu>Close</button></div>`;
      $('#dialogKarte').onclick = ev => { if (ev.target.closest('[data-zu]')) ergebnisZu(); };
      ergebnisFenster();
    }
  }
  /* Ergebnisfenster nach «Publish» (R09): Escape schliesst es wie jedes andere Fenster, Fokus auf «Close» */
  let ergebnisTaste = null;
  function ergebnisZu() { $('#dialog').hidden = true; if (ergebnisTaste) { document.removeEventListener('keydown', ergebnisTaste, true); ergebnisTaste = null; } }
  function ergebnisFenster() {
    if (ergebnisTaste) document.removeEventListener('keydown', ergebnisTaste, true);
    ergebnisTaste = e => { if (e.key === 'Escape' && !$('#dialog').hidden) { e.stopPropagation(); e.preventDefault(); ergebnisZu(); } };
    document.addEventListener('keydown', ergebnisTaste, true);
    setTimeout(() => { const k = $('#dialogKarte [data-zu]'); if (k) k.focus(); }, 50);
  }
  async function altesVerzeichnis() { const j = await SKA.druckListe(); const o = {}; ((j && j.sticker) || []).forEach(x => o[x.id] = x); return o; }
  function b64(bytes) { let s = ''; const k = 0x8000; for (let i = 0; i < bytes.length; i += k) s += String.fromCharCode.apply(null, bytes.subarray(i, i + k)); return btoa(s); }
  async function verlauf() {
    let l = []; try { l = await SKA.verlauf(); } catch (e) { melde(e.text || e.message, { fehler: true }); return; }
    const fmt = z => { try { return new Date(z).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { return z; } };
    const ur = l[l.length - 1];
    const a = await dialog(`<h2>Earlier versions</h2><p class="leise">Taking a version back puts it into the draft. Print files change only when you publish.</p>
      <ul class="sk-verlauf">${l.length ? l.map(v => `<li><span><b>${esc(fmt(v.abgeloest))}</b><small>${esc(v.notiz || 'Published version')}</small></span><button class="leicht" data-fassung="${esc(v.fassung)}">Put into draft</button></li>`).join('') : '<li><span><small>No earlier published version yet.</small></span></li>'}
      <li class="sk-verlauf__ur"><span><b>Original state</b><small>${ur ? 'The stickers as read from the house at the start' : 'The published stickers; a saved draft is dropped'}</small></span><button class="leicht" data-fassung="${ur ? esc(ur.fassung) : '__verwerfen'}">Put into draft</button></li></ul>`,
      [{ t: 'Close', v: false, abbruch: true }]);
    void a;
  }
  async function fassungHolen(f) {
    if (SKA.ungespeichert()) { const ok = await dialog('<h2>Unsaved changes</h2><p class="leise">Your unsaved changes are replaced by the earlier version.</p>', [{ t: 'Keep my changes', v: false, abbruch: true }, { t: 'Take the earlier version', v: true, haupt: true }]); if (!ok) return; }
    try { if (f === '__verwerfen') await SKA.verwerfen(); else await SKA.zurueckholen(f); $('#dialog').hidden = true; oeffneNeu(); melde('The earlier version is in the draft. Publish to make it the print files.'); }
    catch (e) { melde(e.text || e.message, { fehler: true }); }
  }
  async function vorherNachher() {
    const A = SKA.A, live = A.stand.live || { sticker: [] };
    if (ED.doc && !$('#start').hidden === false) {
      const alt = live.sticker.find(s => s.id === ED.doc.id);
      await dialog(`<h2>Before, after</h2><div class="sk-vn"><figure><figcaption>Published</figcaption>${alt ? SK.svg(alt, { idz: 'vn1' }) : '<p class="leise">Not published yet.</p>'}</figure><figure><figcaption>Now</figcaption>${SK.svg(ED.doc, { idz: 'vn2' })}</figure></div>`, [{ t: 'Close', v: false, abbruch: true }]);
      return;
    }
    const l = SKA.unterschiede(live, A.arbeit);
    await dialog(`<h2>Before, after</h2>${l.length ? `<div class="sk-vn-liste">${l.slice(0, 8).map(x => { const a = live.sticker.find(s => s.id === x.id), n = A.arbeit.sticker.find(s => s.id === x.id); return `<div class="sk-vn"><figure><figcaption>Published</figcaption>${a ? SK.svg(a, { idz: 'va' + x.id }) : '<p class="leise">—</p>'}</figure><figure><figcaption>${esc(x.name)}</figcaption>${n ? SK.svg(n, { idz: 'vb' + x.id }) : '<p class="leise">Deleted</p>'}</figure></div>`; }).join('')}</div>` : '<p class="leise">No difference to the published stickers.</p>'}`, [{ t: 'Close', v: false, abbruch: true }]);
  }

  /* ---------- Verwerfen (Sticker löschen) ---------- */
  async function loeschen(id) {
    const d = alle().find(s => s.id === id); if (!d) return;
    const a = await dialog(`<h2>Delete «${esc(d.name)}»?</h2><p class="leise">It goes after you save. Until you publish, the print file stays. Earlier versions keep it.</p>`, [{ t: 'Keep', v: false, abbruch: true }, { t: 'Delete', v: true, haupt: true }]);
    if (!a) return false;
    SKA.aendere(x => { x.sticker = x.sticker.filter(s => s.id !== id); x.galerie.fav = x.galerie.fav.filter(i => i !== id); x.galerie.hinten = x.galerie.hinten.filter(i => i !== id); });
    if (ED.doc && ED.doc.id === id) { ED.doc = null; window.SKStart && SKStart.zeige('galerie'); }
    melde(`«${d.name}» deleted. Save to keep it this way.`, { knoepfe: [{ t: 'Undo', f: () => { SKA.aendere(x => x.sticker.unshift(d)); window.SKStart && SKStart.neuZeichnen(); } }] });
    return true;
  }

  /* ---------- Start ---------- */
  function los() {
    const z = document.createElement('span'); z.innerHTML = '<img src="/the-cat-and-gun/haus/_werkzeuge/sticker/_ob/kleid/catgun-zeichen.svg" alt="">';
    $('#kopfZeichen').innerHTML = z.innerHTML; $('#inselZeichen').innerHTML = z.innerHTML;
    const w = $('#flaeche');
    w.addEventListener('pointerdown', anfassen);
    addEventListener('pointermove', ziehen); addEventListener('pointerup', loslassen); addEventListener('pointercancel', loslassen);
    document.addEventListener('click', e => { if (ED.pipette && pipetteKlick(e)) return; const pr = e.target.closest('[data-profil]'); if (pr && ED.doc) { if (ED.sel) { const el = ebene(ED.sel); const ziel = el.typ === 'grafik' ? 'teil:' + el.id + ':' + (SK.teileVon(el.roh)[0] || {}).k : 'el:' + el.id + ':farbe'; setzeFarbe(ziel, { w: pr.dataset.profil }); } else melde('First tap a part of the sticker, then the colour.'); } }, true);
    w.addEventListener('dblclick', e => { const k = ED.klick, g = (k && Date.now() - k.t < 700 && Math.hypot(e.clientX - k.x, e.clientY - k.y) < 12 && $('#wirt svg') && $('#wirt svg').querySelector(`[data-ebene="${CSS.escape(k.id)}"]`)) || treffer(e); if (!g) return; const el = ebene(g.dataset.ebene); if (el && (el.typ === 'text' || el.typ === 'bogen')) { waehle(el.id); setTimeout(() => { const t = $('#eText'); if (t) { t.focus(); t.setSelectionRange(t.value.length, t.value.length); } }, 30); } });
    $$('.reiter [data-tab]').forEach(b => b.addEventListener('click', () => zeigeTab(b.dataset.tab)));
    $$('[data-tab-auf]').forEach(b => b.addEventListener('click', () => zeigeTab(b.dataset.tabAuf)));
    $('#werkzeug').addEventListener('click', e => { const b = e.target.closest('[data-neu]'); if (b) neuesElement(b.dataset.neu); });
    $('#btnModus').addEventListener('click', umschalten);
    $('#zeigeHilfen').addEventListener('change', e => { ED.schnitt = e.target.checked; zeichneBlatt(); });
    $('#zeigeRaster').addEventListener('change', e => { ED.raster = e.target.checked; zeichneBlatt(); });
    $('#zoomEin').addEventListener('click', () => { ED.zoom = Math.min(4, ED.zoom * 1.25); zeichneBlatt(); });
    $('#zoomAus').addEventListener('click', () => { ED.zoom = Math.max(.4, ED.zoom / 1.25); zeichneBlatt(); });
    $('#btnZurueck').addEventListener('click', zurueck); $('#btnVor').addEventListener('click', vor);
    $('#btnVerwerfen').addEventListener('click', () => ED.doc && loeschen(ED.doc.id));
    $('#btnNeu').addEventListener('click', () => { textFertig(); SKStart.zeige('galerie'); });
    $('#kopfMarke').addEventListener('click', () => { textFertig(); SKStart.zeige('start'); });
    $('#btnPruefen').addEventListener('click', druckpruefung);
    $('#btnSpeichern').addEventListener('click', e => { e.stopPropagation(); $('#menueSpeichern').hidden = !$('#menueSpeichern').hidden; });
    $('#menueSpeichern').addEventListener('click', e => { const b = e.target.closest('[data-aus]'); if (b) { $('#menueSpeichern').hidden = true; b.dataset.aus === 'pruefung' ? druckpruefung() : ausgabe(b.dataset.aus); } });
    document.addEventListener('click', e => { if (!e.target.closest('.ausgabe')) $('#menueSpeichern').hidden = true; });
    $('#docName').addEventListener('change', e => { const v = e.target.value.trim().slice(0, 120); if (!v) { e.target.value = ED.doc.name; return; } aendern(d => { d.name = v; }); });
    $('#einfachTexte').addEventListener('input', e => { const t = e.target.closest('[data-schnelltext]'); if (t) schnellText(t.dataset.schnelltext, t.value); });
    $('#einfachTexte').addEventListener('focusout', () => setTimeout(textFertig, 0));
    $('#einfachMotiv').addEventListener('click', e => { const a = e.target.closest('[data-oeffne]'); if (a) { e.preventDefault(); oeffne(a.dataset.oeffne); } });
    $('#btnFertig').addEventListener('click', async () => { textFertig(); if (SKA.ungespeichert()) await sichern(); SKStart.zeige('galerie'); });
    $('#fotoDatei').addEventListener('change', e => { fotoDatei(e.target.files[0]); e.target.value = ''; });
    const hl = $('#hochladen');
    ['dragover', 'dragenter'].forEach(t => hl.addEventListener(t, e => { e.preventDefault(); hl.classList.add('ueber'); }));
    ['dragleave', 'drop'].forEach(t => hl.addEventListener(t, e => { e.preventDefault(); hl.classList.remove('ueber'); }));
    hl.addEventListener('drop', e => fotoDatei(e.dataTransfer.files[0]));
    $('#fotos').addEventListener('click', e => { if (ED.pipette) return; const b = e.target.closest('[data-foto]'); if (!b) return; const f = (SKA.A.arbeit.fotos || []).find(x => x.b === b.dataset.foto); if (!f) return; const el = ED.sel && ebene(ED.sel); if (el && el.typ === 'bild') aendern(d => { const x = d.ebenen.find(y => y.id === el.id); x.src = f.adresse; x.b = f.b; x.px = [f.w, f.h]; x.name = f.name; }); else fotoEinsetzen(f); });
    $('#btnSichern').addEventListener('click', sichern);
    $('#btnVeroeff').addEventListener('click', veroeffentlichen);
    $('#btnVerlauf').addEventListener('click', verlauf);
    $('#btnVorher').addEventListener('click', vorherNachher);
    $('#dialogKarte').addEventListener('click', e => { const f = e.target.closest('[data-fassung]'); if (f) fassungHolen(f.dataset.fassung); });
    rechtsEreignisse();
    addEventListener('beforeunload', e => { textFertig(); if (SKA.ungespeichert()) { e.preventDefault(); e.returnValue = ''; } });
    document.addEventListener('keydown', e => {
      const cmd = e.metaKey || e.ctrlKey, k = e.key.toLowerCase();
      if (cmd && k === 's') { e.preventDefault(); sichern(); return; }
      if (e.key === 'Escape') { if (ED.pipette) { pipetteAus(); return; } if (!$('#dialog').hidden) return; if (ED.sel) { ED.sel = null; zeichneAuswahl(); zeichneRechts(); } return; }
      if (!$('#start').hidden || !ED.doc) return;
      const imFeld = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
      if (cmd && k === 'z' && !imFeld) { e.preventDefault(); e.shiftKey ? vor() : zurueck(); return; }
      if (cmd && k === 'y' && !imFeld) { e.preventDefault(); vor(); return; }
      if (imFeld) return;
      const el = ED.sel && ebene(ED.sel); if (!el) return;
      if ((e.key === 'Backspace' || e.key === 'Delete') && !el.grund) { e.preventDefault(); aendern(d => { d.ebenen = d.ebenen.filter(y => y.id !== el.id); }); ED.sel = null; zeichneAuswahl(); zeichneRechts(); return; }
      if (cmd && k === 'd' && !el.grund) { e.preventDefault(); const c = kopie(el); c.id = SK.neueId(); c.tx = (c.tx || 0) + 2; c.ty = (c.ty || 0) + 2; aendern(d => d.ebenen.push(c)); ED.sel = c.id; zeichneAuswahl(); zeichneRechts(); return; }
      const sch = e.shiftKey ? 5 : .5, mv = { ArrowLeft: [-sch, 0], ArrowRight: [sch, 0], ArrowUp: [0, -sch], ArrowDown: [0, sch] }[e.key];
      if (mv && !el.fest && !el.grund) { e.preventDefault(); aendern(d => { const x = d.ebenen.find(y => y.id === el.id); x.tx = r2((x.tx || 0) + mv[0]); x.ty = r2((x.ty || 0) + mv[1]); }, { leise: true }); }
    });
    let rT; addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { if (ED.doc && $('#start').hidden) zeichneBlatt(); gleiter(); }, 120); });
    if (window.ResizeObserver) { let fT; new ResizeObserver(() => { clearTimeout(fT); fT = setTimeout(() => { if (ED.doc && $('#start').hidden) zeichneBlatt(); }, 60); }).observe($('#flaeche')); }
    SKA.beiAenderung(art => { leiste(); if (art === 'geladen' || art === 'zurueckgeholt' || art === 'verworfen') { if (ED.doc) oeffneNeu(); } });
    modusSetzen(); gleiter(); leiste();
    setTimeout(() => SKDruck.abdeckung().then(() => { if (ED.doc) pruefZahl(); }, () => { }), 2500);   // Zeichen der Schriften für die Druckprüfung, nach dem Start
  }
  window.SKEditor = { los, oeffne, doc: () => ED.doc, ED, melde, dialog, sichern, veroeffentlichen, loeschen, elementEinsetzen, fotoEinsetzen, ausgabe, zeichneAlles, zeigeTab, leiste, motivHinweis, palette, farbprofil, waehle: id => waehle(id), textFertig };
})();
