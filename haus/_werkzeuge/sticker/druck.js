/* Sticker editor · Druck: PDF für die Druckerei aus den Daten eines Stickers (wie druck.js der Vorlage mit pdf-lib und fontkit, Master 4.7):
   Endformat + 3 mm Beschnitt rundum, Schneidelinie als Sonderfarbe «CutContour» (überdruckend), Schriften eingebettet (Teilsatz, TTF aus bau.py),
   Fotos bis 300 dpi. Dazu das Bild des Stickers (PNG) und die Druckprüfung (Rand, Auflösung, fehlender Text). Alles im Browser, ohne Dienst. */
(function () {
  'use strict';
  const MM = 72 / 25.4, BESCHNITT = 3, RAND = 2, DPI = 300;
  const SCHRIFT = { dmserif: ['DMSerifDisplay-400.ttf'], gloock: ['Gloock-400.ttf'], dmmono: ['DMMono-400.ttf'], instrument: { 400: 'InstrumentSans-400.ttf', 500: 'InstrumentSans-500.ttf', 600: 'InstrumentSans-600.ttf' } };
  const FAMILIE = { 'DM Serif Display': 'dmserif', 'Gloock': 'gloock', 'DM Mono': 'dmmono', 'Instrument Sans': 'instrument' };
  let libs = null;
  function skript(src) { return new Promise((ok, nein) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => nein(new Error('PRINT · ' + src + ' did not load.')); document.head.appendChild(s); }); }
  function ladeLibs() { return libs || (libs = Promise.all([window.PDFLib ? 0 : skript('lib/pdf-lib.min.js?v=0fe9d555'), window.fontkit ? 0 : skript('lib/fontkit.umd.min.js?v=9f935239')])); }
  const ttfCache = {};
  function ttfDatei(e) {
    const s = SK.schrift(e.schrift), id = s.id || FAMILIE[s.familie];
    const t = SCHRIFT[id]; if (!t) return null;
    if (Array.isArray(t)) return t[0];
    const w = +e.schnitt || 400; return t[w >= 550 ? 600 : w >= 450 ? 500 : 400];
  }
  /* Zeichen, die die Schrift nicht hat (Emoji, fremde Schriften), kämen als leeres Kästchen ins PDF (Master 4.7 I16).
     abdeckung() liest die TTF-Dateien einmal mit fontkit; fehlend() nennt die Zeichen, ohneFehlende() lässt sie im PDF weg. */
  const glyphen = {}; let abdeckungP = null;
  function abdeckung() {
    return abdeckungP || (abdeckungP = ladeLibs().then(() => Promise.all(Object.values(SCHRIFT).flatMap(t => Array.isArray(t) ? t : Object.values(t)).map(d =>
      holeTtf(d).then(b => { try { glyphen[d] = fontkit.create(new Uint8Array(b)); } catch (x) { } }, () => { })))));
  }
  const UNSICHTBAR = /[\u200d\ufe0e\ufe0f\u20e3]|[\u{1f3fb}-\u{1f3ff}]/u;
  function hat(f, ch) { const cp = ch.codePointAt(0); return cp === 10 || cp === 13 || f.hasGlyphForCodePoint(cp); }
  function fehlend(e) {
    const d = ttfDatei(e), f = d && glyphen[d]; if (!f) return [];
    const weg = new Set(); for (const ch of String(SK.zeigText ? SK.zeigText(e) : e.text || '')) if (!hat(f, ch) && !UNSICHTBAR.test(ch)) weg.add(ch);
    return [...weg];
  }
  function ohneFehlende(datei, txt) { const f = glyphen[datei]; if (!f) return txt; let o = ''; for (const ch of txt) if (hat(f, ch)) o += ch; return o; }
  function holeTtf(datei) { return ttfCache[datei] || (ttfCache[datei] = fetch('schriften/' + datei).then(r => { if (!r.ok) throw new Error('PRINT · Font ' + datei + ' missing.'); return r.arrayBuffer(); })); }

  /* ---------- Matrizen ---------- */
  const mul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
  const T = (x, y) => [1, 0, 0, 1, x, y], S = (x, y) => [x, 0, 0, y ?? x, 0, 0], R = g => { const r = g * Math.PI / 180; return [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0]; };
  function svgTrafo(s) {
    let m = [1, 0, 0, 1, 0, 0]; if (!s) return m;
    String(s).replace(/(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g, (_, f, a) => {
      const v = a.split(/[\s,]+/).filter(Boolean).map(Number);
      if (f === 'matrix') m = mul(m, v);
      else if (f === 'translate') m = mul(m, T(v[0], v[1] || 0));
      else if (f === 'scale') m = mul(m, S(v[0], v[1] ?? v[0]));
      else if (f === 'rotate') m = v.length > 2 ? mul(mul(mul(m, T(v[1], v[2])), R(v[0])), T(-v[1], -v[2])) : mul(m, R(v[0]));
      else if (f === 'skewX') m = mul(m, [1, 0, Math.tan(v[0] * Math.PI / 180), 1, 0, 0]);
      else if (f === 'skewY') m = mul(m, [1, Math.tan(v[0] * Math.PI / 180), 0, 1, 0, 0]);
      return '';
    });
    return m;
  }
  function ebeneMatrix(e) {
    const tx = e.tx || 0, ty = e.ty || 0, sx = e.sx ?? 1, sy = e.sy ?? 1, d = e.dreh || 0;
    if (!tx && !ty && sx === 1 && sy === 1 && !d) return [1, 0, 0, 1, 0, 0];
    const [px, py] = SK.pivot(e);
    return mul(mul(mul(T(tx + px, ty + py), R(d)), S(sx, sy)), T(-px, -py));
  }

  /* ---------- SVG-Pfad → absolute Befehle (M, L, C, Z) ---------- */
  function pfad(d) {
    const tok = String(d || '').match(/[a-zA-Z]|-?(?:\d*\.\d+|\d+)(?:e[-+]?\d+)?/gi) || [];
    const out = []; let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0, cx = 0, cy = 0, qx = 0, qy = 0, letzt = '';
    const n = () => parseFloat(tok[i++]);
    while (i < tok.length) {
      if (/[a-zA-Z]/.test(tok[i])) cmd = tok[i++];
      const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
      if (C === 'Z') { out.push(['Z']); x = sx; y = sy; letzt = 'Z'; continue; }
      if (i >= tok.length || /[a-zA-Z]/.test(tok[i])) { if (C !== 'Z') i++; continue; }
      if (C === 'M') { x = (rel ? x : 0) + n(); y = (rel ? y : 0) + n(); out.push(['M', x, y]); sx = x; sy = y; cmd = rel ? 'l' : 'L'; letzt = 'M'; continue; }
      if (C === 'L') { x = (rel ? x : 0) + n(); y = (rel ? y : 0) + n(); out.push(['L', x, y]); }
      else if (C === 'H') { x = (rel ? x : 0) + n(); out.push(['L', x, y]); }
      else if (C === 'V') { y = (rel ? y : 0) + n(); out.push(['L', x, y]); }
      else if (C === 'C') { const a = [n(), n(), n(), n(), n(), n()]; if (rel) { a[0] += x; a[1] += y; a[2] += x; a[3] += y; a[4] += x; a[5] += y; } out.push(['C', ...a]); cx = a[2]; cy = a[3]; x = a[4]; y = a[5]; }
      else if (C === 'S') { const a = [n(), n(), n(), n()]; if (rel) { a[0] += x; a[1] += y; a[2] += x; a[3] += y; } const r1 = /[CS]/.test(letzt) ? [2 * x - cx, 2 * y - cy] : [x, y]; out.push(['C', r1[0], r1[1], a[0], a[1], a[2], a[3]]); cx = a[0]; cy = a[1]; x = a[2]; y = a[3]; }
      else if (C === 'Q') { const a = [n(), n(), n(), n()]; if (rel) { a[0] += x; a[1] += y; a[2] += x; a[3] += y; } out.push(['C', x + 2 / 3 * (a[0] - x), y + 2 / 3 * (a[1] - y), a[2] + 2 / 3 * (a[0] - a[2]), a[3] + 2 / 3 * (a[1] - a[3]), a[2], a[3]]); qx = a[0]; qy = a[1]; x = a[2]; y = a[3]; }
      else if (C === 'T') { const a = [n(), n()]; if (rel) { a[0] += x; a[1] += y; } const q = /[QT]/.test(letzt) ? [2 * x - qx, 2 * y - qy] : [x, y]; out.push(['C', x + 2 / 3 * (q[0] - x), y + 2 / 3 * (q[1] - y), a[0] + 2 / 3 * (q[0] - a[0]), a[1] + 2 / 3 * (q[1] - a[1]), a[0], a[1]]); qx = q[0]; qy = q[1]; x = a[0]; y = a[1]; }
      else if (C === 'A') { const rx = n(), ry = n(), rot = n(), fa = n(), fs = n(); let ex = n(), ey = n(); if (rel) { ex += x; ey += y; } bogen(out, x, y, rx, ry, rot, fa, fs, ex, ey); x = ex; y = ey; }
      else { i++; }
      letzt = C;
    }
    return out;
  }
  function bogen(out, x1, y1, rx, ry, phi, fa, fs, x2, y2) {   // SVG-Bogen → kubische Kurven (W3C-Umrechnung)
    if (!rx || !ry) { out.push(['L', x2, y2]); return; }
    rx = Math.abs(rx); ry = Math.abs(ry); const p = phi * Math.PI / 180, c = Math.cos(p), s = Math.sin(p);
    const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2, x1p = c * dx + s * dy, y1p = -s * dx + c * dy;
    const l = x1p * x1p / (rx * rx) + y1p * y1p / (ry * ry); if (l > 1) { rx *= Math.sqrt(l); ry *= Math.sqrt(l); }
    const sg = fa === fs ? -1 : 1, num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p, den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
    const co = sg * Math.sqrt(Math.max(0, num / den)), cxp = co * rx * y1p / ry, cyp = -co * ry * x1p / rx;
    const cx = c * cxp - s * cyp + (x1 + x2) / 2, cy = s * cxp + c * cyp + (y1 + y2) / 2;
    const ang = (ux, uy, vx, vy) => { const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy); return a; };
    let t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry), dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
    if (!fs && dt > 0) dt -= 2 * Math.PI; else if (fs && dt < 0) dt += 2 * Math.PI;
    const n = Math.ceil(Math.abs(dt) / (Math.PI / 2)), d = dt / n, k = 4 / 3 * Math.tan(d / 4);
    for (let i = 0; i < n; i++) {
      const a1 = t1 + i * d, a2 = a1 + d, c1 = Math.cos(a1), s1 = Math.sin(a1), c2 = Math.cos(a2), s2 = Math.sin(a2);
      const P = (ex, ey) => [cx + rx * ex * c - ry * ey * s, cy + rx * ex * s + ry * ey * c];
      const p1 = P(c1 - k * s1, s1 + k * c1), p2 = P(c2 + k * s2, s2 - k * c2), p3 = P(c2, s2);
      out.push(['C', p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]]);
    }
  }
  function formPfad(el) {
    const t = el.tagName.toLowerCase(), a = k => parseFloat(el.getAttribute(k)) || 0;
    if (t === 'path') return el.getAttribute('d');
    if (t === 'circle') return SK.ellipseD(a('cx'), a('cy'), a('r'), a('r'));
    if (t === 'ellipse') return SK.ellipseD(a('cx'), a('cy'), a('rx'), a('ry'));
    if (t === 'rect') return SK.rrD(a('x'), a('y'), a('width'), a('height'), a('rx') || a('ry'));
    if (t === 'line') return `M${a('x1')},${a('y1')}L${a('x2')},${a('y2')}`;
    if (t === 'polygon' || t === 'polyline') { const p = (el.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number); let d = ''; for (let i = 0; i + 1 < p.length; i += 2) d += (i ? 'L' : 'M') + p[i] + ',' + p[i + 1]; return d + (t === 'polygon' ? 'z' : ''); }
    return '';
  }
  function farbe(hex) { const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim()); if (!m) return null; const v = parseInt(m[1], 16); return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255]; }
  const f3 = v => (Math.round(v * 10000) / 10000).toString();

  /* ---------- Satz eines Stickers in Operatoren ---------- */
  function Satz(pdf, seite) { this.pdf = pdf; this.seite = seite; this.ops = []; this.gs = {}; this.n = 0; }
  Satz.prototype.op = function (s) { this.ops.push(s); };
  Satz.prototype.deckung = function (a) {
    if (a >= .999) return;
    const k = 'GSa' + Math.round(a * 1000);
    if (!this.gs[k]) { this.gs[k] = this.pdf.context.obj({ Type: 'ExtGState', ca: a, CA: a }); }
    this.op(`/${k} gs`);
  };
  Satz.prototype.pfadOps = function (befehle) {
    for (const b of befehle) {
      if (b[0] === 'M') this.op(`${f3(b[1])} ${f3(b[2])} m`); else if (b[0] === 'L') this.op(`${f3(b[1])} ${f3(b[2])} l`);
      else if (b[0] === 'C') this.op(`${b.slice(1).map(f3).join(' ')} c`); else if (b[0] === 'Z') this.op('h');
    }
  };
  Satz.prototype.cm = function (m) { if (m.some((v, i) => Math.abs(v - [1, 0, 0, 1, 0, 0][i]) > 1e-9)) this.op(m.map(f3).join(' ') + ' cm'); };
  /* Ein Knoten aus rohem SVG; erbt fill/stroke wie im Browser */
  Satz.prototype.knoten = function (el, erbe, mitBeschnitt) {
    const t = el.tagName.toLowerCase(); if (['defs', 'title', 'desc', 'text', 'style', 'script'].includes(t)) return;
    const st = Object.assign({}, erbe);
    for (const k of ['fill', 'stroke', 'stroke-width', 'opacity', 'fill-opacity', 'stroke-linecap', 'stroke-linejoin', 'fill-rule']) { const v = el.getAttribute(k); if (v != null) st[k] = v; }
    const style = el.getAttribute('style') || ''; style.replace(/(fill|stroke|stroke-width|opacity)\s*:\s*([^;]+)/g, (_, k, v) => { st[k] = v.trim(); });
    if (st.display === 'none') return;
    this.op('q');
    this.cm(svgTrafo(el.getAttribute('transform')));
    if (t === 'svg' || t === 'g') {
      if (t === 'svg') {
        const x = parseFloat(el.getAttribute('x')) || 0, y = parseFloat(el.getAttribute('y')) || 0, w = parseFloat(el.getAttribute('width')), h = parseFloat(el.getAttribute('height'));
        const vb = (el.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
        if (vb.length === 4 && w && h) {
          const sk = Math.min(w / vb[2], h / vb[3]);
          if (/overflow\s*:\s*hidden/.test(style)) { this.op(`${f3(x)} ${f3(y)} ${f3(w)} ${f3(h)} re W n`); }
          this.cm(mul(T(x + (w - vb[2] * sk) / 2, y + (h - vb[3] * sk) / 2), mul(S(sk), T(-vb[0], -vb[1]))));
        } else this.cm(T(x, y));
      }
      [...el.children].forEach(k => this.knoten(k, st, mitBeschnitt));
      this.op('Q'); return;
    }
    const d = formPfad(el); if (!d) { this.op('Q'); return; }
    const op = parseFloat(st.opacity ?? 1); this.deckung(op);
    const fill = st.fill === undefined ? '#000000' : st.fill, stroke = st.stroke;
    const fc = fill && fill !== 'none' ? farbe(fill) : null, sc = stroke && stroke !== 'none' ? farbe(stroke) : null;
    const befehle = pfad(d);
    if (fc) {
      this.op(`${fc.map(f3).join(' ')} rg`); this.pfadOps(befehle); this.op(st['fill-rule'] === 'evenodd' ? 'f*' : 'f');
      if (mitBeschnitt) {   // 3 mm Beschnitt: der Grund wird mit einer Linie seiner Farbe rundum 3 mm grösser
        this.op(`${fc.map(f3).join(' ')} RG ${f3(2 * BESCHNITT)} w 1 j 1 J`); this.pfadOps(befehle); this.op('S');
      }
    }
    if (sc) {
      this.op(`${sc.map(f3).join(' ')} RG ${f3(parseFloat(st['stroke-width'] ?? 1))} w ${st['stroke-linecap'] === 'round' ? 1 : 0} J ${st['stroke-linejoin'] === 'round' ? 1 : 0} j`);
      this.pfadOps(befehle); this.op('S');
    }
    this.op('Q');
  };

  async function schriftFuer(pdf, e, cache) {
    const datei = ttfDatei(e); if (!datei) return null;
    if (!cache[datei]) cache[datei] = holeTtf(datei).then(b => pdf.embedFont(b, { subset: true }));
    return cache[datei];
  }
  function textOps(satz, font, name, txt, gr, sperr, rgb) {
    // y nach oben gespiegelt: Text in eigener Matrix (1 0 0 -1) setzen
    const hex = font.encodeText(txt).toString();
    satz.op(`BT /${name} ${f3(gr)} Tf ${f3(sperr * gr)} Tc ${rgb.map(f3).join(' ')} rg 1 0 0 -1 0 0 Tm ${hex} Tj ET`);
  }
  function breite(font, txt, gr, sperr) { return font.widthOfTextAtSize(txt, gr) + sperr * gr * txt.length; }

  async function bildDaten(src, wmm, hmm, bb) {
    const im = new Image(); im.crossOrigin = 'anonymous'; im.src = src;
    await im.decode();
    const zielW = Math.min(im.naturalWidth, Math.round(wmm / 25.4 * DPI)), zielH = Math.round(zielW * hmm / wmm);
    const c = document.createElement('canvas'); c.width = Math.max(1, zielW); c.height = Math.max(1, zielH);
    const x = c.getContext('2d'), k = Math.max(c.width / im.naturalWidth, c.height / im.naturalHeight);   // «slice» wie im Editor
    const w = im.naturalWidth * k, h = im.naturalHeight * k; x.drawImage(im, (c.width - w) / 2, (c.height - h) / 2, w, h);
    const b = await new Promise(ok => c.toBlob(ok, 'image/jpeg', .92));
    return { bytes: new Uint8Array(await b.arrayBuffer()), px: [im.naturalWidth, im.naturalHeight] };
  }

  /* PDF eines Stickers. Antwort: Uint8Array */
  async function pdf(doc) {
    await ladeLibs(); await abdeckung();
    const { PDFDocument, PDFName, PDFOperator, PDFRawStream } = PDFLib;
    const P = await PDFDocument.create(); P.registerFontkit(fontkit);
    const b = doc.form.b, h = doc.form.h, W = (b + 2 * BESCHNITT) * MM, H = (h + 2 * BESCHNITT) * MM;
    const zeit = new Date(doc.geaendert || 0);
    P.setTitle(doc.name || 'Sticker'); P.setAuthor('The Cat & Gun'); P.setCreator('Sticker editor · The Cat & Gun'); P.setProducer('Sticker editor (pdf-lib)');
    P.setCreationDate(zeit); P.setModificationDate(zeit); P.setSubject(`${b} × ${h} mm, 3 mm bleed, cut line CutContour`);
    const seite = P.addPage([W, H]);
    seite.setTrimBox(BESCHNITT * MM, BESCHNITT * MM, b * MM, h * MM); seite.setBleedBox(0, 0, W, H);
    const satz = new Satz(P, seite), fonts = {}, fontNamen = {}, bilder = {};
    satz.op('q'); satz.cm([MM, 0, 0, -MM, BESCHNITT * MM, H - BESCHNITT * MM]);   // ab hier mm, y nach unten wie im SVG
    for (const e of doc.ebenen || []) {
      if (e.aus) continue;
      satz.op('q'); satz.cm(ebeneMatrix(e));
      if (e.typ === 'grafik') {
        const dom = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${SK.faerbeRoh(e.roh, e.teile)}</svg>`, 'image/svg+xml');
        [...dom.documentElement.children].forEach(k => satz.knoten(k, {}, !!e.grund));
      } else if (e.typ === 'text' || e.typ === 'bogen') {
        const txt = ohneFehlende(ttfDatei(e), SK.zeigText(e)); if (!txt.trim()) { satz.op('Q'); continue; }
        const font = await schriftFuer(P, e, fonts); if (!font) { satz.op('Q'); continue; }
        const nm = fontNamen[font.name] || (fontNamen[font.name] = 'F' + Object.keys(fontNamen).length);
        const rgb = farbe(SK.farbWert(e.farbe)) || [0, 0, 0], sp = e.sperr || 0;
        if (e.typ === 'text') {
          txt.split('\n').forEach((z, i) => {
            const w = breite(font, z, e.gr, sp) - (e.anker === 'middle' || e.anker === 'end' ? 0 : 0);
            const x = e.anker === 'middle' ? e.x - w / 2 : e.anker === 'end' ? e.x - w : e.x;
            satz.op('q'); satz.cm(T(x, e.y + i * e.gr * (e.zeile || 1.15))); textOps(satz, font, nm, z, e.gr, sp, rgb); satz.op('Q');
          });
        } else {
          // Bogen: jedes Zeichen auf dem Kreis, gedreht zur Tangente (wie textPath im Browser)
          const umfang = 2 * Math.PI * e.r, gesamt = breite(font, txt, e.gr, sp);
          let s = (e.start ?? 25) / 100 * umfang - gesamt / 2;
          for (const ch of txt) {
            const w = breite(font, ch, e.gr, sp), mitte = s + (w - sp * e.gr) / 2;
            const a = e.oben ? Math.PI + mitte / e.r : Math.PI - mitte / e.r;
            const px = e.cx + e.r * Math.cos(a), py = e.cy + e.r * Math.sin(a);
            const dreh = e.oben ? a + Math.PI / 2 : a - Math.PI / 2;
            satz.op('q'); satz.cm(T(px, py)); satz.cm([Math.cos(dreh), Math.sin(dreh), -Math.sin(dreh), Math.cos(dreh), 0, 0]); satz.cm(T(-(w - sp * e.gr) / 2, 0));
            textOps(satz, font, nm, ch, e.gr, 0, rgb); satz.op('Q');
            s += w;
          }
        }
      } else if (e.typ === 'bild' && e.src) {
        const bb = e.bb;
        try {
          const d = await bildDaten(e.src, bb[2], bb[3]), img = await P.embedJpg(d.bytes), nm = 'Im' + Object.keys(bilder).length; bilder[nm] = img.ref;
          satz.op('q'); satz.cm([bb[2], 0, 0, -bb[3], bb[0], bb[1] + bb[3]]); satz.op(`/${nm} Do`); satz.op('Q');
        } catch (x) { console.warn('Foto', x); }
      }
      satz.op('Q');
    }
    // Schneidelinie: Sonderfarbe CutContour (100 % Magenta als Ersatz), überdruckend, 0,25 pt
    satz.op('q /GScut gs /CutContour CS 1 SCN'); satz.op(`${f3(.25 / MM)} w 1 j`); satz.pfadOps(pfad(doc.form.d)); satz.op('S Q');
    satz.op('Q');
    // Ressourcen: Schriften, Bilder, Deckkraft, Sonderfarbe
    const ctx = P.context;
    const fn = ctx.obj({ FunctionType: 2, Domain: [0, 1], C0: [0, 0, 0, 0], C1: [0, 1, 0, 0], N: 1 });
    const cs = ctx.obj([PDFName.of('Separation'), PDFName.of('CutContour'), PDFName.of('DeviceCMYK'), fn]);
    const gsDict = Object.assign({}, satz.gs, { GScut: ctx.obj({ Type: 'ExtGState', OP: true, op: true, OPM: 1 }) });
    const fontDict = {};
    for (const p of Object.values(fonts)) { const f = await p; fontDict[fontNamen[f.name]] = f.ref; }
    const res = ctx.obj({ Font: fontDict, XObject: bilder, ExtGState: gsDict, ColorSpace: { CutContour: cs } });
    seite.node.set(PDFName.of('Resources'), res);
    const strom = ctx.flateStream(satz.ops.join('\n'));
    seite.node.set(PDFName.of('Contents'), ctx.register(strom));
    return P.save({ useObjectStreams: false });
  }

  /* ---------- Bild des Stickers (PNG) und Raster für die Pipette: SVG mit eingebetteten Schriften und Fotos ---------- */
  const schriftDaten = {};
  function alsDataUrl(url) { return schriftDaten[url] || (schriftDaten[url] = fetch(url).then(r => r.blob()).then(b => new Promise(ok => { const f = new FileReader(); f.onload = () => ok(f.result); f.readAsDataURL(b); }))); }
  async function selbststaendig(doc, opt = {}) {
    let s = SK.svg(doc, Object.assign({ mm: false }, opt));
    const fam = new Set(); (doc.ebenen || []).forEach(e => { if ((e.typ === 'text' || e.typ === 'bogen') && !e.aus) fam.add(SK.schrift(e.schrift).id); });
    let css = '';
    for (const id of fam) { const f = (Fundus.schriften() || []).find(x => x.id === id); if (!f) continue; const d = await alsDataUrl(Fundus.adresse(f.datei)); css += `@font-face{font-family:'${f.familie || f.name}';src:url(${d});font-weight:${(f.schnitte || [400]).length > 1 ? Math.min(...f.schnitte) + ' ' + Math.max(...f.schnitte) : 400}}`; }
    if (fam.has('dmserif')) { const d = await alsDataUrl('schriften/DMSerifDisplay-ganz.woff2'); css += `@font-face{font-family:'DM Serif Display Ganz';src:url(${d})}`; }
    for (const e of doc.ebenen || []) if (e.typ === 'bild' && e.src && !e.aus) { try { const d = await alsDataUrl(e.src); s = s.split(`href="${SK.esc(e.src)}"`).join(`href="${d}"`); } catch (x) { } }
    return s.replace(/^<svg([^>]*)>/, `<svg$1><style>${css}</style>`);
  }
  async function raster(doc, pxBreite, opt) {
    const s = await selbststaendig(doc, opt), b = doc.form.b, h = doc.form.h;
    const w = Math.round(pxBreite), hh = Math.round(pxBreite * h / b);
    const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s.replace(/^<svg/, `<svg width="${w}" height="${hh}"`));
    await im.decode().catch(() => new Promise(ok => { im.onload = ok; }));
    const c = document.createElement('canvas'); c.width = w; c.height = hh; c.getContext('2d').drawImage(im, 0, 0, w, hh);
    return c;
  }
  async function png(doc) { const c = await raster(doc, Math.min(3000, doc.form.b / 25.4 * DPI)); return new Promise(ok => c.toBlob(ok, 'image/png')); }

  /* ---------- Druckprüfung (Vorlage: Platzhalter, Rand unter 4 mm, Foto unter 150/220 dpi; hier Sticker: Rand 2 mm zur Schneidelinie) ---------- */
  function innen(doc, x, y, rand) {
    const f = doc.form, b = f.b, h = f.h;
    if (f.art === 'kreis' || f.art === 'oval') { const rx = b / 2 - rand, ry = h / 2 - rand; if (rx <= 0 || ry <= 0) return false; return ((x - b / 2) / rx) ** 2 + ((y - h / 2) / ry) ** 2 <= 1.0001; }
    const hh = f.art === 'blase' ? h * .762 : h;
    return x >= rand - .01 && x <= b - rand + .01 && y >= rand - .01 && y <= hh - rand + .01;
  }
  function pruefen(doc, svgEl) {
    const l = [];
    (doc.ebenen || []).forEach(e => {
      if (e.aus) return;
      if ((e.typ === 'text' || e.typ === 'bogen') && !String(e.text || '').trim()) l.push({ id: e.id, art: 'fehler', text: `«${e.name || 'Text'}» is empty.` });
      if ((e.typ === 'text' || e.typ === 'bogen') && !ttfDatei(e)) l.push({ id: e.id, art: 'fehler', text: `The font of «${e.name}» cannot go into the PDF. Choose a font of the house.` });
      if (e.typ === 'text' || e.typ === 'bogen') { const w = fehlend(e); if (w.length) l.push({ id: e.id, art: 'fehler', text: `«${e.name || 'Text'}» has ${w.length === 1 ? 'a sign' : 'signs'} the font does not have: ${w.slice(0, 8).join(' ')}. ${w.length === 1 ? 'It would be' : 'They would be'} missing in the PDF. Take ${w.length === 1 ? 'it' : 'them'} out or write ${w.length === 1 ? 'it' : 'them'} as words.` }); }
      if (e.typ === 'bild') {
        const bb = e.bb, px = e.px || [e.pw || 0, e.ph || 0], dpi = px[0] / ((bb[2] * (e.sx ?? 1)) / 25.4);
        if (dpi && dpi < 150) l.push({ id: e.id, art: 'fehler', text: `The photo «${e.name}» has only ${Math.round(dpi)} dpi at this size. It needs 300 for print.` });
        else if (dpi && dpi < 220) l.push({ id: e.id, art: 'hinweis', text: `The photo «${e.name}» has ${Math.round(dpi)} dpi. 300 is best for print.` });
      }
      if (svgEl && !e.grund && (e.typ === 'text' || e.typ === 'bogen')) {
        const g = svgEl.querySelector(`[data-ebene="${CSS.escape(e.id)}"]`);
        if (!g || !String(e.text || '').trim()) return;
        try {
          const r = g.getBBox(), m = g.getCTM && svgEl.getCTM ? svgEl.getCTM().inverse().multiply(g.getCTM()) : null;
          const pt = (x, y) => { if (!m) return [x, y]; const p = svgEl.createSVGPoint(); p.x = x; p.y = y; const q = p.matrixTransform(m); return [q.x, q.y]; };
          const ecken = [pt(r.x, r.y), pt(r.x + r.width, r.y), pt(r.x, r.y + r.height), pt(r.x + r.width, r.y + r.height)];
          if (ecken.some(([x, y]) => !innen(doc, x, y, 0))) l.push({ id: e.id, art: 'fehler', text: `«${e.name}» goes over the cut line. It would be cut off.` });
          else if (ecken.some(([x, y]) => !innen(doc, x, y, RAND))) l.push({ id: e.id, art: 'hinweis', text: `«${e.name}» is closer than 2 mm to the cut line.` });
        } catch (x) { }
      }
    });
    return l;
  }
  const dateiname = d => 'the-cat-and-gun-' + (String(d.name || 'sticker').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').slice(0, 60) || 'sticker');
  function herunterladen(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
  /* Fingerabdruck eines Stickers samt der Fundus-Werte, die er nutzt (gleich → gleiche Druckdatei, nichts hochladen) */
  function abdruck(doc) {
    const teile = new Set(); let s = JSON.stringify(doc.ebenen) + JSON.stringify(doc.form);
    s.replace(/data-t[fs]=\\?"([^"\\]+)/g, (m, k) => teiles(k)); function teiles(k) { teile.add(k); }
    s.replace(/"f":"([^"]+)"/g, (m, k) => teile.add(k));
    const werte = [...teile].sort().map(k => k + '=' + (Fundus.wert(k) || '')).join(',');
    const schr = (doc.ebenen || []).map(e => e.schrift ? SK.schrift(e.schrift).id : '').join(',');
    const t = s + '|' + werte + '|' + schr + '|' + (doc.name || '');
    let h1 = 0x811c9dc5; for (let i = 0; i < t.length; i++) { h1 ^= t.charCodeAt(i); h1 = Math.imul(h1, 0x01000193) >>> 0; }
    return h1.toString(16).padStart(8, '0') + t.length.toString(16);
  }
  window.SKDruck = { abdeckung, fehlend, pdf, png, raster, selbststaendig, pruefen, dateiname, herunterladen, abdruck, ladeLibs, BESCHNITT, pfad };
})();
