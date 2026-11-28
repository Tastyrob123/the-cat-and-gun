/* Sticker editor · Kern: das Sticker-Modell, Einlesen der Sticker des Hauses aus dem Markenfundus, Zeichnen als SVG.
   Die Sticker des Hauses sind SVG (drucksachen/_bau → fundus/elemente/*.svg, jede Farbe ein benannter Teil data-tf/data-ts).
   Ein Sticker ist hier Daten, nie ein fertiges Bild (Werkzeug-Master 2.5): { id, name, bereich, form:{art,b,h,d}, ebenen:[…] }.
   Farben stehen als Fundus-Kennung ({f:'rot'}) oder als eigener Wert ({w:'#a8232a'}); ändert Julie im Brand book editor eine Farbe,
   ändert sie sich in jedem Sticker, der sie trägt. Farben, Schriften und Elemente nur über fundus.js (AUFTRAG). Ohne KI. */
(function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const r3 = v => Math.round(v * 1000) / 1000;
  let nId = 0;
  const neueId = (p = 'e') => p + Date.now().toString(36) + (nId++).toString(36) + Math.random().toString(36).slice(2, 5);

  /* ---------- Farben ---------- */
  const HEX = /^#[0-9a-f]{6}$/i;
  function farbWert(f, ersatz) {
    if (!f) return ersatz || '#000000';
    if (typeof f === 'string') return HEX.test(f) ? f : (window.Fundus && Fundus.wert(f)) || ersatz || '#000000';
    if (f.w && HEX.test(f.w)) return f.w.toLowerCase();
    if (f.f) { const w = window.Fundus && Fundus.wert(f.f); if (w) return w; }
    return ersatz || '#000000';
  }
  function farbName(f) {
    if (!f) return '';
    if (f.f && window.Fundus) { const x = Fundus.farbe(f.f); if (x) return x.name; }
    return (f.w || '').toUpperCase();
  }

  /* ---------- Schriften (nur aus dem Fundus: Rolle oder Kennung) ---------- */
  function schrift(s) {
    if (!window.Fundus) return { familie: 'serif', id: '' };
    let x = null;
    if (s && s.rolle) x = Fundus.rolle(s.rolle);
    if (!x && s && s.id) x = (Fundus.schriften() || []).find(f => f.id === s.id);
    if (!x) x = Fundus.rolle('druck') || (Fundus.schriften() || [])[0];
    return x ? { familie: x.familie || x.name, id: x.id, name: x.name, schnitte: x.erlaubt || x.schnitte || [400] } : { familie: 'serif', id: '' };
  }
  const css = s => String(s).replace(/[\\'"<>;{}]/g, '');
  /* Ergänzung, wo die Datei im Fundus Buchstaben nicht hat (DM Serif Display: nur latin-ext; bau.py → schriften/DMSerifDisplay-ganz.woff2) */
  const ERSATZ = { dmserif: 'DM Serif Display Ganz' };
  const familien = s => `'${css(s.familie)}'` + (ERSATZ[s.id] ? `,'${ERSATZ[s.id]}'` : '') + ',serif';

  /* ---------- Formen (Umriss = Schneidelinie) ---------- */
  const FORMEN = {
    kreis: { name: 'Round', b: 50, h: 50 }, oval: { name: 'Oval', b: 70, h: 44 }, eckig: { name: 'Square', b: 46, h: 46 },
    streifen: { name: 'Strip', b: 112, h: 26 }, blase: { name: 'Bubble', b: 72, h: 42 }
  };
  function ellipseD(cx, cy, rx, ry) { return `M${r3(cx - rx)},${r3(cy)}a${r3(rx)},${r3(ry)} 0 1,0 ${r3(2 * rx)},0a${r3(rx)},${r3(ry)} 0 1,0 ${r3(-2 * rx)},0z`; }
  function rrD(x, y, b, h, r) {
    r = Math.max(0, Math.min(r, b / 2, h / 2));
    if (!r) return `M${r3(x)},${r3(y)}h${r3(b)}v${r3(h)}h${r3(-b)}z`;
    return `M${r3(x + r)},${r3(y)}h${r3(b - 2 * r)}a${r3(r)},${r3(r)} 0 0 1 ${r3(r)},${r3(r)}v${r3(h - 2 * r)}a${r3(r)},${r3(r)} 0 0 1 ${r3(-r)},${r3(r)}h${r3(-(b - 2 * r))}a${r3(r)},${r3(r)} 0 0 1 ${r3(-r)},${r3(-r)}v${r3(-(h - 2 * r))}a${r3(r)},${r3(r)} 0 0 1 ${r3(r)},${r3(-r)}z`;
  }
  /* Blase wie «See you at The Cat & Gun!» (fundus/elemente/sticker-see-you.svg): Körper mit runden Ecken, Spitze unten links */
  function blaseD(b, h) {
    const k = h * 0.762, r = Math.min(6, k / 4), s1 = b / 3, s2 = s1 - 8 * b / 72;
    return `M${r},0h${r3(b - 2 * r)}a${r},${r} 0 0 1 ${r},${r}v${r3(k - 2 * r)}a${r},${r} 0 0 1 ${-r},${r}h${r3(-(b - r - s1))}l${r3(-(s1 - s2))},${r3(h - k)}l${r3(1.2 * b / 72)},${r3(-(h - k))}h${r3(-(s2 + 1.2 * b / 72 - r))}a${r},${r} 0 0 1 ${-r},${-r}v${r3(-(k - 2 * r))}a${r},${r} 0 0 1 ${r},${-r}z`;
  }
  function formD(art, b, h, rx) {
    if (art === 'kreis' || art === 'oval') return ellipseD(b / 2, h / 2, b / 2, h / 2);
    if (art === 'streifen') return rrD(0, 0, b, h, rx != null ? rx : h / 2);
    if (art === 'blase') return blaseD(b, h);
    return rrD(0, 0, b, h, rx != null ? rx : Math.min(b, h) * 0.18);
  }

  /* ---------- Ebenen ---------- */
  function pivot(e) {
    if (e.typ === 'grafik' || e.typ === 'bild') { const bb = e.bb || [0, 0, 0, 0]; return [bb[0] + bb[2] / 2, bb[1] + bb[3] / 2]; }
    if (e.typ === 'bogen') return [e.cx, e.cy];
    const w = e._w || (String(e.text || '').length * e.gr * 0.5);
    const dx = e.anker === 'middle' ? 0 : e.anker === 'end' ? -w / 2 : w / 2;
    return [e.x + dx, e.y - e.gr * 0.34];
  }
  function trafo(e) {
    const tx = e.tx || 0, ty = e.ty || 0, sx = e.sx ?? 1, sy = e.sy ?? 1, d = e.dreh || 0;
    if (!tx && !ty && sx === 1 && sy === 1 && !d) return '';
    const [px, py] = pivot(e);
    return `translate(${r3(tx + px)} ${r3(ty + py)})${d ? ` rotate(${r3(d)})` : ''}${sx !== 1 || sy !== 1 ? ` scale(${r3(sx)} ${r3(sy)})` : ''} translate(${r3(-px)} ${r3(-py)})`;
  }
  /* Rohes SVG einer Grafik-Ebene: nur Formen, nie Skript (aus dem Speicher gelesen, also wie fremde Eingabe behandelt) */
  function reinRoh(s) {
    return String(s || '').replace(/<\s*(script|foreignObject|iframe|style)[\s\S]*?<\s*\/\s*\1\s*>/gi, '').replace(/<\s*(script|foreignObject|iframe)[^>]*>/gi, '')
      .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '').replace(/(href\s*=\s*["'])\s*javascript:[^"']*/gi, '$1#');
  }
  function teileVon(roh) {
    const t = []; String(roh || '').replace(/data-t([fs])="([^"]+)"/g, (m, a, k) => { if (!t.some(x => x.k === k)) t.push({ k, a }); return m; });
    return t;
  }
  function faerbeRoh(roh, teile) {
    let s = reinRoh(roh);
    s = s.replace(/<([a-zA-Z]+)([^>]*?)(\/?)>/g, (m, tag, attr, zu) => {
      const tf = /data-tf="([^"]+)"/.exec(attr), ts = /data-ts="([^"]+)"/.exec(attr);
      if (tf) { const w = farbWert(teile && teile[tf[1]] || { f: tf[1] }, (/fill="([^"]+)"/.exec(attr) || [])[1]); attr = /fill="/.test(attr) ? attr.replace(/fill="[^"]*"/, `fill="${w}"`) : attr + ` fill="${w}"`; }
      if (ts) { const w = farbWert(teile && teile[ts[1]] || { f: ts[1] }, (/stroke="([^"]+)"/.exec(attr) || [])[1]); attr = /stroke="/.test(attr) ? attr.replace(/stroke="[^"]*"/, `stroke="${w}"`) : attr + ` stroke="${w}"`; }
      return `<${tag}${attr}${zu}>`;
    });
    return s;
  }
  function textAttr(e) {
    const s = schrift(e.schrift), w = e.schnitt && e.schnitt !== 400 ? `;font-weight:${+e.schnitt}` : '';
    return `font-size="${r3(e.gr)}" fill="${farbWert(e.farbe)}" style="font-family:${familien(s)}${w};letter-spacing:${r3(e.sperr || 0)}em"`;
  }
  const zeigText = e => { const t = String(e.text ?? ''); return e.gross ? t.toUpperCase() : t; };
  function ebeneSvg(e, opt) {
    if (e.aus && !opt.alle) return '';
    const tr = trafo(e), a = `data-ebene="${esc(e.id)}"${tr ? ` transform="${tr}"` : ''}`;
    let innen = '';
    if (e.typ === 'grafik') innen = faerbeRoh(e.roh, e.teile);
    else if (e.typ === 'text') {
      const zeilen = zeigText(e).split('\n'), lh = e.gr * (e.zeile || 1.15);
      innen = `<text x="${r3(e.x)}" y="${r3(e.y)}" ${textAttr(e)} text-anchor="${['start', 'middle', 'end'].includes(e.anker) ? e.anker : 'middle'}">${zeilen.map((z, i) => i ? `<tspan x="${r3(e.x)}" dy="${r3(lh)}">${esc(z) || ' '}</tspan>` : esc(z)).join('')}</text>`;
    } else if (e.typ === 'bogen') {
      const id = 'p' + String(e.id).replace(/[^a-z0-9]/gi, ''), r = e.r, cx = e.cx, cy = e.cy;
      const d = e.oben ? `M${r3(cx - r)},${r3(cy)}a${r3(r)},${r3(r)} 0 1,1 ${r3(2 * r)},0a${r3(r)},${r3(r)} 0 1,1 ${r3(-2 * r)},0` : `M${r3(cx - r)},${r3(cy)}a${r3(r)},${r3(r)} 0 1,0 ${r3(2 * r)},0a${r3(r)},${r3(r)} 0 1,0 ${r3(-2 * r)},0`;
      innen = `<defs><path id="${id}${opt.idz || ''}" d="${d}"/></defs><text ${textAttr(e)}><textPath href="#${id}${opt.idz || ''}" startOffset="${r3(e.start ?? 25)}%" text-anchor="middle">${esc(zeigText(e))}</textPath></text>`;
    } else if (e.typ === 'bild') {
      const bb = e.bb || [0, 0, 20, 20], src = opt.bildSrc ? opt.bildSrc(e) : e.src;
      innen = `<image href="${esc(src)}" x="${r3(bb[0])}" y="${r3(bb[1])}" width="${r3(bb[2])}" height="${r3(bb[3])}" preserveAspectRatio="xMidYMid slice"${opt.formClip && !tr ? ` clip-path="url(#${opt.formClip})"` : ''}/>`;   // Foto nur so weit, wie der Sticker geschnitten wird
    }
    return `<g ${a}>${innen}</g>`;
  }
  /* Ein Sticker als SVG. opt: { schnitt (Schneidelinie zeigen), raster, beschnitt (mm rundum), klasse, idz (Zusatz für eindeutige Kennungen), alle } */
  function svg(doc, opt = {}) {
    const f = doc.form, b = f.b, h = f.h, rand = opt.beschnitt || 0, idz = opt.idz || ('s' + (++nId));
    const o = Object.assign({}, opt, { idz });
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r3(-rand)} ${r3(-rand)} ${r3(b + 2 * rand)} ${r3(h + 2 * rand)}"${opt.mm ? ` width="${r3(b + 2 * rand)}mm" height="${r3(h + 2 * rand)}mm"` : ''}${opt.klasse ? ` class="${opt.klasse}"` : ''} data-sticker="${esc(doc.id)}">`;
    if ((doc.ebenen || []).some(e => e.typ === 'bild' && !e.aus) && f.d) { o.formClip = 'fc' + String(idz).replace(/[^a-z0-9]/gi, ''); s += `<defs><clipPath id="${o.formClip}"><path d="${esc(f.d)}"/></clipPath></defs>`; }
    s += (doc.ebenen || []).map(e => ebeneSvg(e, o)).join('');
    if (opt.raster) { s += `<g class="sk-raster" stroke="#8a5634" stroke-opacity=".35" stroke-width=".1" pointer-events="none">${Array.from({ length: Math.floor((b - .01) / 5) }, (_, i) => `<path d="M${(i + 1) * 5},0V${h}"/>`).join('')}${Array.from({ length: Math.floor((h - .01) / 5) }, (_, i) => `<path d="M0,${(i + 1) * 5}H${b}"/>`).join('')}</g>`; }
    if (opt.schnitt) s += `<path class="sk-schnitt" d="${esc(f.d)}" fill="none" stroke="#c0398b" stroke-width="${opt.schnittBreite || 1.3}" stroke-dasharray="5 4" pointer-events="none" vector-effect="non-scaling-stroke"/>`;
    return s + '</svg>';
  }

  /* ---------- Einlesen: ein Sticker des Hauses aus dem Fundus wird ein bearbeitbarer Entwurf ---------- */
  const MASS = { '0 0 621 534': ['wortmarke', 'Wordmark'], '452 198 176 148': ['et', 'Ampersand'], '0 0 621 345': ['the-cat', 'THE CAT'] };
  let messer = null;
  function messSvg() {
    if (messer && messer.isConnected) return messer;
    messer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    messer.setAttribute('style', 'position:absolute;left:-9999px;top:0;width:200px;height:200px;visibility:hidden');
    document.body.appendChild(messer); return messer;
  }
  function bbVon(knoten) {
    if (knoten.tagName.toLowerCase() === 'svg') return ['x', 'y', 'width', 'height'].map(a => parseFloat(knoten.getAttribute(a)) || 0);
    const m = messSvg(), k = knoten.cloneNode(true); k.removeAttribute('transform'); m.appendChild(k);
    let q; try { const r = k.getBBox(); q = [r.x, r.y, r.width, r.height]; } catch (x) { q = [0, 0, 0, 0]; }
    m.removeChild(k); return q.map(r3);
  }
  function grafikName(k, teile) {
    const t = k.tagName.toLowerCase(), vb = k.getAttribute('viewBox');
    if (t === 'svg' && MASS[vb]) return MASS[vb][1];
    const fill = k.getAttribute('fill'), tf = teile[0] && window.Fundus && Fundus.farbe(teile[0].k);
    const ring = fill === 'none' && k.getAttribute('stroke');
    const art = ring ? 'Ring' : t === 'circle' ? (parseFloat(k.getAttribute('r')) < 3 ? 'Dot' : 'Circle') : t === 'ellipse' ? 'Oval' : t === 'rect' ? 'Rectangle' : t === 'svg' ? 'Sign' : 'Shape';
    return art + (tf ? ' · ' + tf.name : '');
  }
  function textVon(k) {
    const st = k.getAttribute('style') || '', fam = (/font-family:\s*'?([^;']+)/.exec(st) || [])[1] || '';
    const rolle = /Instrument Sans/i.test(fam) ? 'lauf' : /DM Mono/i.test(fam) ? 'zahl' : /Gloock/i.test(fam) ? 'titel' : 'druck';
    const tf = k.getAttribute('data-tf') || (k.querySelector('[data-tf]') || { getAttribute: () => null }).getAttribute('data-tf');
    return {
      schrift: { rolle }, schnitt: parseInt((/font-weight:\s*(\d+)/.exec(st) || [])[1] || 400, 10), sperr: parseFloat((/letter-spacing:\s*([\d.-]+)em/.exec(st) || [])[1] || 0),
      gr: parseFloat(k.getAttribute('font-size')) || 4, farbe: tf ? { f: tf } : { w: (k.getAttribute('fill') || '#141210').toLowerCase() }
    };
  }
  function ausSvg(svgText, kopf) {
    const dom = new DOMParser().parseFromString(svgText, 'image/svg+xml'), wurzel = dom.documentElement;
    const vb = (wurzel.getAttribute('viewBox') || '0 0 50 50').split(/[\s,]+/).map(Number), b = vb[2], h = vb[3];
    const pfade = {}; wurzel.querySelectorAll('defs path[id]').forEach(p => pfade[p.id] = p.getAttribute('d'));
    const ser = new XMLSerializer(), ebenen = [];
    let form = null;
    [...wurzel.children].forEach(k => {
      const t = k.tagName.toLowerCase();
      if (t === 'defs' || t === 'title' || t === 'desc') return;
      if (t === 'image') {   // Foto-Sticker (Mac 23.11.2026): das Foto wird eine Foto-Ebene, im Editor auf die Form beschnitten, im PDF schneidet die Linie
        const src = k.getAttribute('href') || k.getAttribute('xlink:href') || '', bb = ['x', 'y', 'width', 'height'].map(a => r3(parseFloat(k.getAttribute(a)) || 0)), fb = (/\/(b\d+)-/.exec(src) || [])[1] || '';
        const fo = fb && window.Fundus ? (Fundus.fotos() || []).find(f => f.id === fb) : null;
        ebenen.push({ id: neueId(), typ: 'bild', name: (fo && fo.titel) || 'Photo', b: fb, src, px: fo ? [fo.w, fo.h] : undefined, bb, motiv: fb || src });
        return;
      }
      if (t === 'text') {
        const tp = k.querySelector('textPath'), basis = textVon(k);
        if (tp) {
          const d = pfade[(tp.getAttribute('href') || tp.getAttribute('xlink:href') || '').slice(1)] || '';
          const m = /M\s*([\d.-]+)[ ,]([\d.-]+)\s*a\s*([\d.]+)[ ,]([\d.]+)\s+0\s+1[ ,](\d)/.exec(d);
          if (!m) return;
          const r = parseFloat(m[3]);
          const tx = tp.textContent;
          ebenen.push(Object.assign({ id: neueId(), typ: 'bogen', name: tx.slice(0, 40), text: tx, cx: r3(parseFloat(m[1]) + r), cy: r3(parseFloat(m[2])), r, oben: m[5] === '1', start: parseFloat(tp.getAttribute('startOffset')) || 25, motiv: tx.toLowerCase().trim() }, basis));
        } else {
          const tx = k.textContent;
          ebenen.push(Object.assign({ id: neueId(), typ: 'text', name: tx.slice(0, 40), text: tx, x: parseFloat(k.getAttribute('x')) || 0, y: parseFloat(k.getAttribute('y')) || 0, anker: k.getAttribute('text-anchor') || 'start', motiv: tx.toLowerCase().trim() }, basis));
        }
        return;
      }
      const roh = ser.serializeToString(k).replace(/\sxmlns(:\w+)?="[^"]*"/g, '');
      const teile = teileVon(roh), bb = bbVon(k), e = { id: neueId(), typ: 'grafik', name: grafikName(k, teile), roh, bb };
      if (t === 'svg' && MASS[k.getAttribute('viewBox')]) e.motiv = MASS[k.getAttribute('viewBox')][0];
      if (!form && Math.abs(bb[2] - b) < .6 && Math.abs(bb[3] - h) < .6 && k.getAttribute('fill') !== 'none') {
        let art = 'eckig', d = '';
        if (t === 'circle') { art = 'kreis'; d = ellipseD(b / 2, h / 2, b / 2, h / 2); }
        else if (t === 'ellipse') { art = 'oval'; d = ellipseD(b / 2, h / 2, b / 2, h / 2); }
        else if (t === 'rect') { const rx = parseFloat(k.getAttribute('rx')) || 0; art = b / h > 2.4 ? 'streifen' : 'eckig'; d = rrD(0, 0, b, h, rx); }
        else if (t === 'path') { art = /l[\d.-]/.test(k.getAttribute('d')) ? 'blase' : 'frei'; d = k.getAttribute('d'); }
        form = { art, b, h, d }; e.grund = true; e.name = 'Sticker shape';
      }
      ebenen.push(e);
    });
    if (!form) form = { art: 'eckig', b, h, d: rrD(0, 0, b, h, 0) };
    return Object.assign({ id: neueId('s'), name: '', bereich: '', herkunft: 'neu', form, ebenen, geaendert: Date.now() }, kopf || {});
  }
  function holeSvg(e) { return fetch(Fundus.adresse(e.datei), { cache: 'force-cache' }).then(r => { if (!r.ok) throw new Error('BRAND · ' + e.datei + ' ' + r.status); return r.text(); }); }
  function ausFundus(id, kopf) {
    const e = (Fundus.elemente({}) || []).find(x => x.id === id);
    if (!e) return Promise.reject(new Error('BRAND · Element «' + id + '» is not in the brand book.'));
    return holeSvg(e).then(t => {
      const d = ausSvg(t, Object.assign({ name: e.name, quelle: id }, kopf || {}));
      // ganze Elemente (ball) tragen ihr Motiv
      d.ebenen.forEach(x => { if (!x.motiv && x.typ === 'grafik' && !x.grund && id === 'ball') x.motiv = 'ball'; });
      return d;
    });
  }
  /* Ein Zeichen des Fundus (Wortmarke, &, THE CAT) als eine Ebene, eingepasst in eine Breite */
  function zeichenEbene(id, x, y, breite) {
    const e = (Fundus.elemente({}) || []).find(z => z.id === id);
    if (!e) return Promise.reject(new Error('BRAND · Element «' + id + '» is not in the brand book.'));
    return holeSvg(e).then(t => {
      const dom = new DOMParser().parseFromString(t, 'image/svg+xml'), w = dom.documentElement, vb = w.getAttribute('viewBox') || `0 0 ${e.b} ${e.h}`;
      const v = vb.split(/[\s,]+/).map(Number), hoehe = breite * v[3] / v[2];
      const innen = [...w.children].map(k => new XMLSerializer().serializeToString(k).replace(/\sxmlns(:\w+)?="[^"]*"/g, '')).join('');
      const roh = `<svg x="${r3(x)}" y="${r3(y)}" width="${r3(breite)}" height="${r3(hoehe)}" viewBox="${vb}" overflow="visible">${innen}</svg>`;
      return { id: neueId(), typ: 'grafik', name: e.name, roh, bb: [r3(x), r3(y), r3(breite), r3(hoehe)], motiv: id };
    });
  }
  /* Neue Form als Ebene oder als Grund eines neuen Stickers */
  function formEbene(art, x, y, b, h, farbe, grund) {
    const d = formD(art, b, h);
    const k = (farbe && farbe.f) || 'papier';
    return { id: neueId(), typ: 'grafik', name: grund ? 'Sticker shape' : FORMEN[art].name, roh: `<path d="${d}" transform="translate(${r3(x)} ${r3(y)})" fill="${farbWert(farbe)}" data-tf="${esc(k)}"/>`, bb: [r3(x), r3(y), r3(b), r3(h)], teile: farbe && farbe.w ? { [k]: farbe } : undefined, grund: !!grund };
  }
  function linieEbene(x, y, b, farbe) {
    const k = (farbe && farbe.f) || 'schwarz';
    return { id: neueId(), typ: 'grafik', name: 'Line', roh: `<path d="M${r3(x)},${r3(y)}h${r3(b)}" fill="none" stroke="${farbWert(farbe)}" data-ts="${esc(k)}" stroke-width=".4" stroke-linecap="round"/>`, bb: [r3(x), r3(y - .2), r3(b), .4] };
  }
  function ringEbene(art, b, h, abstand, farbe) {
    const k = (farbe && farbe.f) || 'schwarz', d = art === 'kreis' || art === 'oval' ? ellipseD(b / 2, h / 2, b / 2 - abstand, h / 2 - abstand) : rrD(abstand, abstand, b - 2 * abstand, h - 2 * abstand, Math.max(0, (art === 'streifen' ? h / 2 : Math.min(b, h) * .18) - abstand));
    return { id: neueId(), typ: 'grafik', name: 'Ring', roh: `<path d="${d}" fill="none" stroke="${farbWert(farbe)}" data-ts="${esc(k)}" stroke-width=".35"/>`, bb: [abstand, abstand, r3(b - 2 * abstand), r3(h - 2 * abstand)] };
  }
  /* Vorlage für einen neuen Sticker ab null (einfache Fassung): Form, Grund, Ring, zwei Zeilen */
  function vorlage(art, opt = {}) {
    const F = FORMEN[art] || FORMEN.kreis, b = opt.b || F.b, h = opt.h || F.h;
    const grund = opt.grund || { f: 'schwarz' }, schrift = opt.schriftFarbe || { f: 'papier' };
    const ebenen = [formEbene(art, 0, 0, b, h, grund, true)];
    if (art !== 'blase') ebenen.push(ringEbene(art, b, h, Math.min(b, h) * .045, schrift));
    const k = art === 'blase' ? h * .762 : h, gr = Math.min(h * (art === 'streifen' ? .3 : .17), b * .14);
    ebenen.push({ id: neueId(), typ: 'text', name: 'Title', text: opt.titel ?? '', x: b / 2, y: k / 2 + gr * .1, gr: r3(gr), anker: 'middle', schrift: { rolle: 'druck' }, schnitt: 400, sperr: 0, farbe: schrift });
    if (art !== 'streifen') ebenen.push({ id: neueId(), typ: 'text', name: 'Small line', text: opt.zeile ?? '', x: b / 2, y: k / 2 + gr * .1 + gr * .9, gr: r3(gr * .38), anker: 'middle', schrift: { rolle: 'lauf' }, schnitt: 500, sperr: .16, gross: true, farbe: schrift });
    return { id: neueId('s'), name: opt.name || ('New ' + F.name.toLowerCase() + ' sticker'), bereich: opt.bereich || '', herkunft: 'neu', form: { art, b, h, d: formD(art, b, h) }, ebenen, geaendert: Date.now() };
  }

  /* ---------- Motive: wo ein Motiv schon vorkommt (AUFTRAG: Motive sollen sich nicht allzu oft wiederholen) ---------- */
  function motive(doc) {
    const m = new Set();
    (doc.ebenen || []).forEach(e => {
      if (e.aus) return;
      if (e.motiv && (e.typ === 'grafik' || e.typ === 'bild')) m.add('el:' + e.motiv);
      if ((e.typ === 'text' || e.typ === 'bogen') && String(e.text || '').trim().length > 2) m.add('tx:' + String(e.text).toLowerCase().replace(/\s+/g, ' ').trim());
    });
    return m;
  }
  function woSchon(motivSchluessel, alle, ohneId) {
    return (alle || []).filter(d => d.id !== ohneId && motive(d).has(motivSchluessel));
  }

  window.SK = { esc, r3, neueId, farbWert, farbName, schrift, FORMEN, formD, ellipseD, rrD, blaseD, pivot, trafo, teileVon, faerbeRoh, ebeneSvg, svg, zeigText,
    ERSATZ, ausSvg, ausFundus, zeichenEbene, formEbene, linieEbene, ringEbene, vorlage, motive, woSchon, reinRoh, bbVon };
})();
