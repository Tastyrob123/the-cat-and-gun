/* Drucksachen-Studio · Satz: Formate, Marke laden, eine Seite als DOM setzen, Text messen.
   Alle Masse in Millimetern. Ursprung (0,0) = obere linke Ecke des Endformats, der Beschnitt (3 mm) liegt davor. */
(function () {
  const DS = window.DS = window.DS || {};
  DS.B = 3;          // Beschnitt
  DS.SICHER = 4;     // Abstand vom Rand, in dem Text sicher bleibt

  /* Tiefe der Kopfzeile wie Rudis gedruckter Schriftzug (Robert 29.10.2026: «ist das unscharf …?»): scharfe Buchstabenkante, darunter ein harter, leicht
     versetzter Schatten in einem dunkleren Ton der Schriftfarbe, ohne Weichzeichner. Leuchten nur auf dunklem Grund (Bühne, Nacht) und nur ausserhalb der Kante:
     ein weiter, schwacher Hof, den die Schrift darüber vollständig deckt. Gilt gleich für Bildschirm (satz.js), PNG und PDF (druck.js). */
  DS.kopfTiefe = (hex, art, gr) => {
    const h = String(hex || '#d6262b').replace('#', ''), c = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) || 0);
    const mix = (z, a) => '#' + c.map((v, i) => Math.round(v + (z[i] - v) * a).toString(16).padStart(2, '0')).join('');
    return { dx: +(gr * .022).toFixed(3), dy: +(gr * .04).toFixed(3), hart: mix([20, 6, 6], .55), glow: art === 'leuchten' ? mix([255, 214, 196], .35) + '6b' : null, blur: +(gr * .5).toFixed(3) };
  };
  /* Formate (Vorlage) und die Formate der Stücke des Hauses (drucksachen/_bau/stuecke.json, CLAUDE.md: alle Stücke).
     rund: true = runde Drucksache (Bierdeckel, Untersetzer, Becher): das Blatt bleibt quadratisch, die Schnittlinie ist ein Kreis. */
  DS.FORMATE = {
    a6h: { name: 'A6 portrait', b: 105, h: 148, art: 'Card, small flyer' },
    a5h: { name: 'A5 portrait', b: 148, h: 210, art: 'Flyer, menu card' },
    a4h: { name: 'A4 portrait', b: 210, h: 297, art: 'Notice, menu' },
    a3h: { name: 'A3 portrait', b: 297, h: 420, art: 'Poster, notice' },
    a3q: { name: 'A3 landscape', b: 420, h: 297, art: 'Paper placemat' },
    a1h: { name: 'A1 portrait', b: 594, h: 841, art: 'A-board for the street' },
    tafel: { name: 'Chalkboard', b: 500, h: 880, art: 'The size of the boards at the bar' },
    banner: { name: 'Banner', b: 2000, h: 600, art: 'For the railing or the wall' },
    tk102: { name: 'Table card', b: 102, h: 160, art: 'Fits the acrylic stand on the wooden block' },
    q93: { name: 'Coaster square', b: 93, h: 93, art: 'Coaster, square with round corners', ecke: 4.5 },
    r95: { name: 'Coaster round', b: 95, h: 95, art: 'Coaster, round Ø 95 mm', rund: true },
    r107: { name: 'Beer mat', b: 107, h: 107, art: 'Beer mat, round Ø 107 mm', rund: true },
    r45: { name: 'Cup sticker', b: 45, h: 45, art: 'Sticker for the cup, round Ø 45 mm', rund: true },
    et84: { name: 'Label', b: 84, h: 30, art: 'Label for juices and kombucha', ecke: 2 },
    huelse: { name: 'Cup sleeve', b: 250, h: 60, art: 'Wraps a 12 oz cup, laid flat' },
    q330: { name: 'Napkin', b: 330, h: 330, art: 'Paper napkin, folded in four' },
    ig11: { name: 'Instagram 1:1', b: 108, h: 108, art: 'Square post for Instagram', digital: true, px: [1080, 1080] },
    insta: { name: 'Instagram 4:5', b: 108, h: 135, art: 'Post for Instagram', digital: true, px: [1080, 1350] },
    story: { name: 'Story 9:16', b: 108, h: 192, art: 'Instagram and WhatsApp story', digital: true, px: [1080, 1920] },
  };
  /* Umriss der Schnittkante (Bildschirm): Kreis bei runden Stücken, Ecken bei Untersetzern und Etiketten */
  DS.umriss = (f, S) => f.rund ? 'border-radius:50%;' : f.ecke ? `border-radius:${(f.ecke + DS.B) * S}px;` : '';
  /* Stücke des Hauses (haeuser/catgun/stuecke.js, Mac 23.11.2026): ein Stück kann Seiten in verschiedenen Grössen haben (Sticker rund 60, eckig 46, Streifen 120 × 30).
     Eine Seite mit eigenem Format trägt s.fmt = { key, b, h }; sonst gilt das Format des Dokuments. */
  DS.blattF = (doc, i) => { const s = doc && doc.seiten && doc.seiten[i]; return s && s.fmt ? s.fmt : doc.format; };
  DS.blattK = (doc, i) => { const s = doc && doc.seiten && doc.seiten[i]; return (s && s.fmt && s.fmt.key) || doc.formatKey; };
  DS.ohneGrund = g => !g || g === 'transparent' || g === 'none';

  /* ---------- Marke ---------- */
  DS.ladeMarke = async function (key) {
    const basis = 'haeuser/' + key + '/';
    /* Werkzeuge 2.0: Farben, Schriften, Fotos und Elemente kommen aus dem Markenfundus (fundus.js, veröffentlichter Stand).
       marke.json ist der gebaute Rückfall (bau.py), falls der Fundus nicht antwortet. */
    const fundusP = DS.ladeFundus(), druckP = fetch(basis + 'druck.json').then(r => r.ok ? r.json() : {}).catch(() => ({}));
    const M = await (await fetch(basis + 'marke.json')).json();
    M.basis = basis;
    const FU = await fundusP;
    if (FU) { DS.fundusAnwenden(M, FU); DS.livreAusFundus(M, FU); }
    const css = Object.entries(M.schriften).map(([rolle, s]) => `@font-face{font-family:'DS-${rolle}';src:url('${s.url || basis + 'schriften/' + s.datei.replace(/\.ttf$/, '.woff2')}')${s.url ? '' : " format('woff2')"},url('${s.ttf || basis + 'schriften/' + s.datei}') format('truetype');font-display:block}`).join('\n');
    let st = document.getElementById('ds-schriften'); if (!st) { st = document.createElement('style'); st.id = 'ds-schriften'; document.head.appendChild(st); }
    st.textContent = css;
    const schriftenP = Promise.all(Object.keys(M.schriften).map(r => document.fonts.load(`20px 'DS-${r}'`, 'AaÄäß€«»0123'))).catch(() => {});
    M.eigeneMini = new Set(M.bilder.map(b => b.key));
    M.bilder.forEach(b => { b.datei = false; b.gruppe = b.gruppe || DS.LIVRE_TEXT.b[b.bereich] || 'House'; b.herkunft = b.herkunft || 'haus'; });
    DS.belegeAbtrennen(M); (M.belege || []).forEach(b => { b.datei = false; b.gruppe = b.gruppe || DS.LIVRE_TEXT.b[b.bereich]; b.herkunft = b.herkunft || 'haus'; });
    M.bildIndex = Object.fromEntries(M.bilder.concat(M.belege || []).map(b => [b.key, b]));
    const druck = await druckP;
    for (const [k, [w, h]] of Object.entries(druck)) if (M.bildIndex[k]) M.bildIndex[k].druck = { w, h, url: basis + 'druck/' + k + '.jpg' };
    DS.livreDateien(M).forEach(d => { M.bildIndex[d.key] = d; });
    await schriftenP;
    DS.M = M;
    return M;
  };

  /* ---------- Markenfundus (fundus.js, nur lesen) ---------- */
  DS.FSVG = {};
  DS.ladeFundus = async function () {
    if (!window.Fundus) return null;
    try {
      const d = await Fundus.laden();
      Fundus.schriftenLaden();
      /* Die DM Serif Display des Fundus ist nur die Teilmenge latin-ext (ohne Grundbuchstaben): dieselbe Schrift vollständig darüber legen (bau.py) */
      const ds = document.createElement('style'); ds.id = 'ds-dmserif'; ds.textContent = "@font-face{font-family:'DM Serif Display';src:url('haeuser/catgun/schriften/dmserif-400.woff2') format('woff2');font-weight:400;font-style:normal;font-display:block}";
      document.head.appendChild(ds); document.fonts.load("20px 'DM Serif Display'", 'Te').catch(() => {});
      // alle Elemente einmal holen: das Blatt setzt sie danach ohne Warten (satz.js elementDom ist synchron)
      await Promise.all(d.elemente.map(e => fetch(Fundus.adresse(e.datei), { cache: 'force-cache' }).then(r => r.ok ? r.text() : '').then(t => { DS.FSVG[e.id] = t; }).catch(() => {})));
      return d;
    } catch (e) { return null; }
  };
  DS.fundusAnwenden = function (M, FU) {
    M.fundus = FU;
    const F = Object.fromEntries(FU.farben.map(f => [f.id, f]));
    // Rollen des Kerns → Farben des Fundus (ändert Julie eine Farbe im Brand book editor, ändert sie sich hier in jeder Drucksache)
    for (const [k, id] of Object.entries(M.rollen_farben || {})) if (F[id]) { M.farben[k] = F[id].wert; M.farbnamen[k] = F[id].name; }
    for (const f of FU.farben) { M.farben[f.id] = f.wert; M.farbnamen[f.id] = f.name; }
    // Schriften: welche Schrift eine Rolle trägt, sagt der Fundus (rollen). Der feste Schnitt fürs PDF liegt in schriften/ (bau.py).
    for (const s of Object.values(M.schriften)) {
      if (!s.fundus) continue;
      const fs = Fundus.rolle(s.fundus[0]); if (!fs) continue;
      const datei = `${fs.id}-${fs.erlaubt && !fs.erlaubt.includes(s.fundus[1]) ? fs.erlaubt[0] : s.fundus[1]}.ttf`;
      if (M.schnitte && M.schnitte[datei.replace(/\.ttf$/, '')]) { s.datei = datei; s.familie = fs.familie + (s.fundus[1] > 400 && datei.endsWith(s.fundus[1] + '.ttf') ? ' ' + s.fundus[1] : ''); delete s.url; delete s.ttf; }
      else if (/\.(ttf|otf)$/i.test(fs.datei)) { s.url = s.ttf = Fundus.adresse(fs.datei); s.familie = fs.familie; }   // hochgeladene Schrift (TTF) gilt auch im PDF
    }
    // Fotos: die des Fundus (auch hochgeladene), ausgeblendete fallen weg
    const alt = Object.fromEntries(M.bilder.map(b => [b.key, b]));
    M.bilder = FU.fotos.map(f => Object.assign({}, alt[f.id] || {}, { key: f.id, alt: f.titel, w: f.w || (alt[f.id] || {}).w || 1200, h: f.h || (alt[f.id] || {}).h || 1200,
      url: Fundus.adresse(f.gross || f.klein), miniUrl: Fundus.adresse(f.klein || f.gross), quelle: f.quelle, bereich: f.herkunft === 'hochgeladen' ? 'hochgeladen' : ((alt[f.id] || {}).bereich || 'haus') }));
    DS.belegeAbtrennen(M);
  };
  /* Nachbesserung 4 (Prüfung 4 Punkt 2): Grafiken der Anlässe sind Belege, keine Fotos zum Gestalten (_quelle/MATERIAL.md «Bilder»: «Events (Grafiken mit Schrift,
     als Belege, nicht als Hauptbilder)»: 02, 03, 04–06, 17, 30). Sie fallen aus jeder Auswahl (Photos of the house, Reiter Photos, Fach, Instagram), bleiben aber
     im bildIndex, damit ein schon gespeicherter Entwurf mit einem solchen Bild weiter richtig steht. Ebenso die Sticker vergangener Anlässe ohne belegte Wiederkehr. */
  DS.ANLASS_ELEMENTE = new Set(['sticker-markt', 'sticker-drei-jahre']);
  DS.zumGestalten = e => e && e.aus !== true && !DS.ANLASS_ELEMENTE.has(e.id);
  DS.istBeleg = b => b && b.bereich === 'events';
  DS.belegeAbtrennen = M => { const b = (M.bilder || []).filter(DS.istBeleg); if (b.length) { M.belege = (M.belege || []).filter(x => !b.some(y => y.key === x.key)).concat(b); M.bilder = M.bilder.filter(x => !DS.istBeleg(x)); } };
  /* Das Markenbuch für lelivre.js und «Colours & fonts» (in der Vorlage livre.json): Farben, Zeichen-Dateien und Fotos aus dem Fundus */
  DS.livreAusFundus = function (M, FU) {
    const welt = Object.fromEntries(FU.welten.map(w => [w.id, w.name]));
    M.livre = { haus: FU.haus, farben: FU.farben.map(f => ({ h: f.wert, n: f.name, r: (welt[f.welt] || '') + (f.notiz ? ' · ' + f.notiz : '') })),
      dateien: FU.elemente.filter(e => e.art === 'zeichen').map(e => ({ k: e.id, n: e.name, var: [{ k: 'schwarz', grund: 'hell', farbe: 'tinte', dateien: ['../' + e.datei] }] })),
      fotos: M.bilder.concat(M.belege || []) };   // das Brand book zeigt alle Fotos, auch die Belege der Anlässe
  };
  // Teile eines Fundus-Elements: Wunschfarben des Elements (Farbkennung oder HEX) als HEX
  DS.fundusSvg = function (M, el) {
    /* Grafik aus einem Stück des Hauses (stuecke_einlesen.py): eigenes SVG im Element (el.svg), Teile wie im Fundus (el.teildef, data-tf/data-ts) */
    const roh = el.svg || DS.FSVG[el.fid]; if (!roh || !window.Fundus || !M.fundus) return '';
    const e = el.svg ? { teile: el.teildef || [] } : M.fundus.elemente.find(x => x.id === el.fid); if (!e) return '';
    const w = {}; for (const [t, f] of Object.entries(el.teile || {})) w[t] = DS.farbe(M, f);
    return Fundus.faerben(roh, e, w).replace(/<svg([^>]*?)\swidth="[^"]*"/, '<svg$1').replace(/<svg([^>]*?)\sheight="[^"]*"/, '<svg$1')
      .replace(/^<svg/, '<svg preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:100%"');
  };
  DS.fundusElement = id => (id && typeof id === 'object') ? (id.svg ? { id: null, name: id.name || 'Graphic', teile: id.teildef || [], b: id.w, h: id.h } : DS.fundusElement(id.fid))
    : DS.M && DS.M.fundus && DS.M.fundus.elemente.find(x => x.id === id);

  DS.farbe = (M, f) => (M.farben[f] || f || '#000');

  /* ---------- Lesbarkeit (Mac 23.11.2026, Prüfung «Print & feed»): Kontrast gegen den echten Hintergrund ----------
     Der Hintergrund eines Elements ist nicht der Seitengrund, sondern die oberste Fläche darunter (Tafel, Band, Scheibe), so wie das Blatt sie zeichnet.
     Liegt ein Foto oder ein Element aus dem Brand kit darunter, ist er unbekannt (null): dann wird nichts umgefärbt und nichts gemeldet. */
  DS.hexRgb = h => { h = String(h || '').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h.slice(0, 6), 16); return isNaN(n) ? [0, 0, 0] : [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  DS.leucht = h => DS.hexRgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }).reduce((a, v, i) => a + v * [.2126, .7152, .0722][i], 0);
  DS.kontrast = (a, b) => { const x = DS.leucht(a), y = DS.leucht(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  DS.mische = (unten, oben, deck) => { const a = DS.hexRgb(unten), b = DS.hexRgb(oben), t = Math.max(0, Math.min(1, deck ?? 1)); return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  DS.elBox = (M, el) => ({ x: el.x, y: el.y, w: el.typ === 'linie' && el.h > el.w ? el.staerke : (el.w || 0), h: DS.elHoehe(M, el) || 0 });
  DS.grundUnter = function (M, s, el) {
    const b = DS.elBox(M, el), fl = b.w * b.h;
    const i = s.el.indexOf(el), unter = i < 0 ? s.el : s.el.slice(0, i);
    let farbe = DS.ohneGrund(s.grund) ? null : DS.farbe(M, s.grund);
    for (const u of unter) {
      if (!['flaeche', 'bild', 'fundus'].includes(u.typ)) continue;
      const ub = DS.elBox(M, u), w = Math.min(b.x + b.w, ub.x + ub.w) - Math.max(b.x, ub.x), h = Math.min(b.y + b.h, ub.y + ub.h) - Math.max(b.y, ub.y);
      if (w <= 0 || h <= 0 || (fl > 0 ? w * h / fl < .5 : false)) continue;   // deckt weniger als die Hälfte des Elements: zählt nicht
      const deck = u.deck ?? 1;
      if (u.typ === 'flaeche') farbe = farbe ? DS.mische(farbe, DS.farbe(M, u.farbe), deck) : (deck >= .75 ? DS.farbe(M, u.farbe) : null);
      else if (deck > .25) farbe = null;
    }
    return farbe;
  };
  // dunkelste und hellste Farbe der Marke (wie farbListe() im Studio: die Farben des Fundus, sonst die der Marke)
  DS.farbEnden = function (M) {
    const liste = (M.fundus ? M.fundus.farben.map(f => f.id) : Object.keys(M.farben)).map(k => [k, DS.farbe(M, k)]).filter(x => /^#/.test(x[1]));
    if (!liste.length) return null;
    liste.sort((a, b) => DS.leucht(a[1]) - DS.leucht(b[1]));
    return { dunkel: liste[0][0], hell: liste[liste.length - 1][0] };
  };
  DS.lesbareFarbe = (M, grund) => { const e = DS.farbEnden(M); if (!e) return null; return DS.kontrast(DS.farbe(M, e.dunkel), grund) >= DS.kontrast(DS.farbe(M, e.hell), grund) ? e.dunkel : e.hell; };
  // Kontrast eines Elements gegen seinen echten Hintergrund (Text mit seiner Deckkraft gemischt); null, wenn der Hintergrund unbekannt ist
  DS.elKontrast = function (M, s, el) {
    const bg = DS.grundUnter(M, s, el); if (!bg) return null;
    const fg = DS.farbe(M, el.farbe);
    return { bg, k: DS.kontrast(el.typ === 'text' ? DS.mische(bg, fg, el.deck ?? 1) : fg, bg) };
  };
  /* Jede Schrift (und jedes Zeichen, auf Wunsch auch Linien und Rahmen) mit Kontrast unter 3 bekommt die lesbare Markenfarbe; Text mit zu wenig Deckkraft wird voll deckend */
  DS.lesbar = function (M, s, arten) {
    arten = arten || ['text', 'zeichen'];
    let n = 0;
    for (const el of s.el || []) {
      if (!arten.includes(el.typ) || !el.farbe) continue;
      if (el.typ === 'text' && !String(el.text || '').trim()) continue;
      const r = DS.elKontrast(M, s, el); if (!r || r.k >= 3) continue;
      const ziel = DS.lesbareFarbe(M, r.bg); if (!ziel) continue;
      if (DS.kontrast(DS.farbe(M, el.farbe), r.bg) < 3) el.farbe = ziel;
      if (el.typ === 'text' && DS.kontrast(DS.mische(r.bg, DS.farbe(M, el.farbe), el.deck ?? 1), r.bg) < 3) el.deck = 1;
      n++;
    }
    return n;
  };
  /* Runde Formate: ein Rahmen wird ein Kreis, mittig im Kreis der Schnittlinie, nie grösser als er */
  DS.rundeRahmen = function (f, s) {
    if (!f || !f.rund) return;
    for (const el of s.el || []) {
      if (el.typ !== 'rahmen') continue;
      const cx = f.b / 2, cy = f.h / 2, d = Math.min(el.w, el.h, f.b - 6, f.h - 6);
      Object.assign(el, { x: cx - d / 2, y: cy - d / 2, w: d, h: d, r: d / 2 });
    }
  };
  /* Zeilen einer Textbox (mm, relativ zur Seite): für Überlappung und runde Schnittlinie in der Druckprüfung */
  const zeilenCache = new Map();
  DS.zeilen = function (M, el) {
    const k = [el.text, el.w, el.gr, el.rolle, el.zeile, el.sperr, el.ausr, el.gross].join('|');
    let z = zeilenCache.get(k);
    if (!z) {
      if (!wirt) { DS.mess({ typ: 'text', text: 'x', w: 10, gr: 3, rolle: 'text' }); }
      const S = 10, d = DS.elementDom(M, Object.assign({}, el, { x: 0, y: 0 }), S, { ohneBeschnitt: true });
      wirt.appendChild(d);
      const r0 = d.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(d);
      z = [...rg.getClientRects()].filter(r => r.width > .5 && r.height > .5).map(r => ({ x: (r.left - r0.left) / S, y: (r.top - r0.top) / S, w: r.width / S, h: r.height / S }));
      wirt.removeChild(d);
      if (zeilenCache.size > 800) zeilenCache.clear();
      zeilenCache.set(k, z);
    }
    return z.map(r => ({ x: r.x + el.x, y: r.y + el.y, w: r.w, h: r.h }));
  };
  /* Fotos: aus Le Livre (/the-cat-and-gun/haus/assets/img/<key>-l.webp, 2000 px) unter derselben Adresse; kleine Vorschauen aus dem eigenen 520-px-Satz, weil Le Livre
     nur 900 px anbietet (vierfaches Gewicht je Vorschau). Ohne Le Livre alles aus der eigenen Kopie. */
  DS.bildUrl = (M, key, mini) => { const b = M.bildIndex && M.bildIndex[key];
    if (b && (b.url || b.miniUrl)) return mini ? (b.miniUrl || b.url) : (b.url || b.miniUrl);
    return M.basis + (mini ? 'mini/' : 'bilder/') + key + '.webp'; };

  /* ---------- Markenbuch: bei The Cat & Gun ist es der Markenfundus (Brand book editor schreibt, alle anderen lesen) ---------- */
  DS.LIVRE_TEXT = {
    b: { essen: 'Food', getraenke: 'Drinks', raum: 'People and the room', pool: 'Pool table and playground', events: 'Events', haus: 'House', hochgeladen: 'Added in the brand book' },
    s: {},
    f: { hoch: 'Portrait', quer: 'Landscape', quadrat: 'Square' },
    h: { haus: 'Photos of the house' },
    ki: '',
  };
  DS.ALLEIN = false;
  DS.regelSichtbar = r => String(r || '').trim();
  DS.LIVRE = '/the-cat-and-gun/haus/_werkzeuge/fundus/';
  DS.livreUrl = p => (window.Fundus ? Fundus.adresse(p) : DS.LIVRE + p);
  DS.bildFuer = (M, key, breite) => {
    const b = M.bildIndex && M.bildIndex[key];
    if (b && b.url && /\/assets\/bild\/(b\d+)-\d+\.webp$/.test(b.url) && b.stufen) { const z = breite * 1.6; const w = b.stufen.find(x => x >= z) || b.stufen[b.stufen.length - 1]; return b.url.replace(/-\d+\.webp$/, '-' + w + '.webp'); }
    return DS.bildUrl(M, key, false);
  };
  /* Seite des Brand book (lokal eigener Server :9732, online neben den Werkzeugen); Brand book editor :9737 */
  DS.livreSeite = () => /^(9738)$/.test(location.port) ? 'http://127.0.0.1:9732/_werkzeuge/livre/' : '../livre/';
  DS.editorSeite = () => /^(9738)$/.test(location.port) ? 'http://127.0.0.1:9737/_werkzeuge/markenbuch-editor/' : '../markenbuch-editor/';
  /* Logo-Dateien als Bild gibt es nicht: Zeichen, Wortmarke und «THE CAT» sind Vektor (Element «zeichen», z 1/2/3) */
  DS.livreDateien = () => [];
  DS.ladeLivre = async () => null;

  /* Ausschnitt eines Fotos: Grösse und Lage des ganzen Bildes relativ zum Rahmen (für Bildschirm und PDF gleich) */
  DS.ausschnitt = function (el, iw, ih) {
    const z = Math.max(1, el.zoom || 1), ea = el.w / el.h, ia = iw / ih;
    let bw, bh;
    if (ia > ea) { bh = el.h * z; bw = bh * ia; } else { bw = el.w * z; bh = bw / ia; }
    const fx = el.fx ?? .5, fy = el.fy ?? .5;
    return { bw, bh, x: (el.w - bw) * fx, y: (el.h - bh) * fy };
  };

  DS.zz = (M, el) => (el && el.z === 2 && M.zeichen2) || (el && el.z === 3 && M.zeichen3) || M.zeichen;
  DS.zeichenSvg = function (M, farbe, el) {
    const z = DS.zz(M, el);
    return `<svg viewBox="${z.vb.join(' ')}" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:100%"><g fill="${farbe}" stroke="none">${z.pfade.map(d => `<path d="${d}"/>`).join('')}</g></svg>`;
  };

  function tapeteCss(M, art, S, x, y) {
    const r = M.tapete.rapport_mm * S;
    return `background-image:url('${M.basis}${M.tapete[art]}');background-size:${r}px auto;background-position:${-x * S}px ${-y * S}px;background-repeat:repeat;`;
  }
  DS.tapeteCss = tapeteCss;

  /* ---------- ein Element als DOM ---------- */
  DS.elementDom = function (M, el, S, o = {}) {
    const d = document.createElement('div');
    d.className = 'el el-' + el.typ;
    d.dataset.id = el.id;
    const B = o.ohneBeschnitt ? 0 : DS.B;
    let st = `position:absolute;left:${(el.x + B) * S}px;top:${(el.y + B) * S}px;`;
    if (el.typ === 'text') {
      st += `width:${el.w * S}px;font-family:'DS-${el.rolle}';font-size:${el.gr * S}px;line-height:${el.zeile || 1.2};letter-spacing:${el.sperr || 0}em;` +
        `text-align:${{ l: 'left', c: 'center', r: 'right' }[el.ausr || 'l']};color:${DS.farbe(M, el.farbe)};opacity:${el.deck ?? 1};` +
        `white-space:pre-wrap;overflow-wrap:break-word;font-variant-ligatures:none;font-feature-settings:'liga' 0,'clig' 0;` +
        (el.gross ? 'text-transform:uppercase;' : '') +
        (el.schatten ? (t => `text-shadow:${t.dx * S}px ${t.dy * S}px 0 ${t.hart}` + (t.glow ? `,0 0 ${t.blur * S}px ${t.glow}` : '') + ';')(DS.kopfTiefe(DS.farbe(M, el.farbe), el.schatten, el.gr)) : '');   // Kopfzeile wie Rudi: harte Kante, gedruckter Schatten (29.10.)
      d.textContent = el.text;
      if (o.editor && /\[[^\]]*\]/.test(el.text)) d.classList.add('platzhalter');
    } else if (el.typ === 'bild') {
      st += `width:${el.w * S}px;height:${el.h * S}px;overflow:hidden;border-radius:${(el.r || 0) * S}px;`;
      const b = M.bildIndex[el.bild];
      if (b) {
        const a = DS.ausschnitt(el, b.w, b.h);
        const img = document.createElement('img');
        if (b.farbe && o.mini) d.style.background = b.farbe;   // Platzhalter in der Motivfarbe, bis das Bild da ist (29.10.)
        if (o.laden) img.loading = o.laden;   // vor src setzen, sonst lädt der Browser sofort
        if (o.prio) img.fetchPriority = o.prio;
        img.src = DS.bildUrl(M, el.bild, o.mini);
        img.draggable = false;
        img.decoding = 'async';
        img.style.cssText = `position:absolute;left:${a.x * S}px;top:${a.y * S}px;width:${a.bw * S}px;height:${a.bh * S}px;max-width:none;pointer-events:none;`;
        d.appendChild(img);
      } else st += 'background:#cfc6b6;';
    } else if (el.typ === 'flaeche') {
      st += `width:${el.w * S}px;height:${el.h * S}px;background-color:${DS.farbe(M, el.farbe)};opacity:${el.deck ?? 1};border-radius:${(el.r || 0) * S}px;`;
      if (el.tapete) st += tapeteCss(M, el.tapete, S, el.x, el.y);
    } else if (el.typ === 'linie') {
      const senk = el.h > el.w;
      st += `width:${(senk ? el.staerke : el.w) * S}px;height:${(senk ? el.h : el.staerke) * S}px;background:${DS.farbe(M, el.farbe)};opacity:${el.deck ?? 1};`;
    } else if (el.typ === 'rahmen') {
      st += `width:${el.w * S}px;height:${el.h * S}px;border:${el.staerke * S}px solid ${DS.farbe(M, el.farbe)};border-radius:${(el.r || 0) * S}px;opacity:${el.deck ?? 1};box-sizing:border-box;`;
    } else if (el.typ === 'zeichen') {
      st += `width:${el.w * S}px;height:${el.w * DS.zz(M, el).verh * S}px;opacity:${el.deck ?? 1};`;
      d.innerHTML = DS.zeichenSvg(M, DS.farbe(M, el.farbe), el);
    } else if (el.typ === 'fundus') {   // Werkzeuge 2.0: Element aus dem Markenfundus (Billardkugel, Sticker …), jeder Teil in seiner Farbe
      st += `width:${el.w * S}px;height:${el.h * S}px;opacity:${el.deck ?? 1};`;
      d.innerHTML = DS.fundusSvg(M, el) || '<div style="width:100%;height:100%;border:1px dashed #b5343a"></div>';
    }
    d.style.cssText = st;
    return d;
  };

  DS.elHoehe = function (M, el) {
    if (el.typ === 'zeichen') return el.w * DS.zz(M, el).verh;
    if (el.typ === 'text') return el.h || DS.mess(el).h;
    if (el.typ === 'linie') return Math.max(el.h || 0, el.staerke);
    return el.h;
  };

  /* ---------- eine Seite ---------- */
  DS.seiteDom = function (M, doc, i, S, o = {}) {
    const f = DS.blattF(doc, i), s = doc.seiten[i], B = DS.B;
    const p = document.createElement('div');
    p.className = 'blatt'; p.setAttribute('data-wo-bw-nie', '');   // das Blatt bewegt sich nie über das Kleid (30.10.2026: das Messblatt der Druckausgabe schwebte beim ersten Aufruf, Text 3–5 mm verschoben); Editor und Galerien haben eigene Bewegung
    let st = `position:relative;width:${(f.b + 2 * B) * S}px;height:${(f.h + 2 * B) * S}px;overflow:hidden;background-color:${DS.ohneGrund(s.grund) ? 'transparent' : DS.farbe(M, s.grund)};` + (o.editor ? '' : DS.umriss(DS.FORMATE[DS.blattK(doc, i)] || f, S));
    if (s.tapete) st += tapeteCss(M, s.tapete, S, -B, -B);
    p.style.cssText = st;
    for (const el of s.el) p.appendChild(DS.elementDom(M, el, S, o));
    return p;
  };

  /* ---------- Text messen (Höhe und breiteste Zeile, in mm) ---------- */
  let wirt;
  DS.mess = function (el) {
    if (!wirt) {
      wirt = document.createElement('div');
      wirt.style.cssText = 'position:absolute;left:-99999px;top:0;visibility:hidden;pointer-events:none';
      document.body.appendChild(wirt);
    }
    const S = 10;
    const d = DS.elementDom(DS.M, Object.assign({}, el, { x: 0, y: 0 }), S, { ohneBeschnitt: true });
    wirt.appendChild(d);
    const h = d.getBoundingClientRect().height / S;
    wirt.removeChild(d);
    // breiteste Zeile: Inhalt in Spannen fassen. Erst messen, wenn jemand danach fragt (nur Ansichtskarte und Preisspalte tun das);
    // spart bei jedem anderen Text das zweite Durchrechnen der Seite (12.10.2026, Galerie mit 3000 Vorlagen)
    let bw = null;
    return { h, get bw() {
      if (bw === null) {
        wirt.appendChild(d);
        const sp = document.createElement('span'); sp.textContent = d.textContent; d.textContent = ''; d.appendChild(sp);
        bw = 0; for (const r of sp.getClientRects()) bw = Math.max(bw, r.width);
        wirt.removeChild(d); bw /= S;
      }
      return bw;
    } };
  };

  /* Glyphen einer gesetzten Textbox: jede Zeichenposition in mm (für das PDF) */
  DS.glyphen = function (d, S, ursprungX, ursprungY) {
    const out = [];
    const tn = [...d.childNodes].filter(n => n.nodeType === 3);
    const r = document.createRange();
    for (const n of tn) {
      const s = n.textContent;
      for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (/\s/.test(ch)) continue;
        // Surrogatpaare zusammenhalten
        let j = i + 1;
        if (ch.charCodeAt(0) >= 0xd800 && ch.charCodeAt(0) < 0xdc00) j++;
        r.setStart(n, i); r.setEnd(n, j);
        const rc = [...r.getClientRects()].filter(x => x.width > 0);
        if (!rc.length) continue;
        const b = rc[0];
        out.push({ ch: s.slice(i, j), x: (b.left - ursprungX) / S, top: (b.top - ursprungY) / S, hoehe: b.height / S });
        i = j - 1;
      }
    }
    return out;
  };
})();
