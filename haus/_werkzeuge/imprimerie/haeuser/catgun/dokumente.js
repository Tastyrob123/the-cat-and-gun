/* Print & feed · The Cat & Gun: Satz der Dokumente des Hauses (Weg der Vorlage: haeuser/<haus>/dokumente.js ersetzt oder ergänzt einzelne Aufbauten aus vorlagen.js).
   Hier nur, was die Stücke des Hauses verlangen (drucksachen/_bau/stuecke.json, CLAUDE.md «alle Stücke»):
   - «rund» und «rundliste»: Bierdeckel Ø 107, Untersetzer Ø 95, Becher Ø 45. Alles steht im Kreis, mit einer feinen Ringlinie 3 mm innen
     wie auf den gedruckten Untersetzern (drucksachen/_bau/mehr.py brekky_vorn, dessert_hinten).
   - «etikett»: Etiketten 84 × 30 und die Becherhülse 250 × 60: Zeichen links, Name und Satz rechts (wie frisch_etikett in mehr.py).
   - Formate je Aufbau: runde Formate nur mit den runden Aufbauten, Etikett und Hülse nur mit «etikett», damit nichts über den Rand läuft.
   - Die Aufbauten der Vorlage, die nur das Culinarium hat (Plakat des Abends, Menükarte am Tisch), fallen weg. */
(function () {
  'use strict';
  const DS = window.DS;
  if (!DS || !DS.VORLAGEN) return;
  const V = DS.VORLAGEN, STIL = DS.STIL || {};
  const TEXTSTIL = { titel: { zeile: 1.06, sperr: 0 }, mono: { zeile: 1.6, sperr: .08, gross: true }, kapitale: { zeile: 1.3, sperr: .08, gross: true }, text: { zeile: 1.5, sperr: 0 }, kursiv: { zeile: 1.5, sperr: 0 } };
  const id = () => DS.neueId();
  ['plakat', 'plakathoch', 'plakatrueck', 'plakatganz', 'menue'].forEach(k => { delete V[k]; });

  function ctx(M, fk, ton) {
    const f = DS.FORMATE[fk], w = f.b, h = f.h, s = Math.sqrt(w * h / (105 * 148)), s8 = Math.pow(s, .8);
    return { M, w, h, s, s8, T: M.toene[ton] || M.toene.dunkel, el: [] };
  }
  function tx(c, rolle, text, w, gr, farbe, o = {}) {
    const el = Object.assign({ id: id(), typ: 'text', rolle, text: String(text), x: (c.w - w) / 2, y: 0, w, gr: +gr.toFixed(2), farbe, ausr: 'c', deck: 1 }, TEXTSTIL[rolle] || STIL[rolle] || {}, o);
    wortPasst(el);
    return el;
  }
  // das längste Wort muss in die Zeile passen (nie mitten im Wort umbrechen); auch nach jeder Änderung der Breite (Sehne im Kreis, Prüfung 23.11.2026)
  function wortPasst(el) {
    const breit = x => DS.mess(Object.assign({}, el, { text: x, w: 100000 })).bw;
    const lw = Math.max(...String(el.text).split(/\s+/).filter(Boolean).map(breit), 0);
    if (lw > el.w - .2) el.gr = Math.floor(el.gr * (el.w - .2) / lw * 100) / 100;
    el.h = DS.mess(el).h;
  }
  const hoehe = (c, el) => el.typ === 'zeichen' ? el.w * DS.zz(c.M, el).verh : el.typ === 'linie' ? el.staerke : el.h;
  const sauber = items => { const out = []; for (const it of items) { if (it == null || it === false || it === '') { if (typeof out[out.length - 1] === 'number') out.pop(); continue; } out.push(it); } while (typeof out[0] === 'number') out.shift(); while (typeof out[out.length - 1] === 'number') out.pop(); return out; };
  function stapelMitte(c, items, y0, y1, breiteBei) {
    const H = () => items.reduce((a, it) => a + (typeof it === 'number' ? it : hoehe(c, it)), 0);
    for (let n = 0; n < 8 && H() > y1 - y0; n++) {
      const f = Math.max(.8, (y1 - y0) / H());
      items = items.map(it => { if (typeof it === 'number') return it * f; if (it.typ === 'text') { it.gr = +(it.gr * f).toFixed(2); it.h = DS.mess(it).h; } else if (it.typ === 'zeichen') { const w0 = it.w; it.w *= f; it.x += (w0 - it.w) / 2; } return it; });
    }
    let y = y0 + Math.max(0, (y1 - y0 - H()) / 2);
    for (const it of items) {
      if (typeof it === 'number') { y += it; continue; }
      it.y = +y.toFixed(2);
      if (breiteBei && it.typ === 'text') {   // im Kreis: Breite nach der Sehne auf dieser Höhe
        const w = breiteBei(y, y + it.h); if (w && w < it.w) { const x0 = it.x + it.w / 2; it.w = w; it.x = x0 - w / 2; wortPasst(it); }
      }
      y += hoehe(c, it); c.el.push(it);
    }
  }
  const zeichen = (c, w, o = {}) => Object.assign({ id: id(), typ: 'zeichen', x: (c.w - w) / 2, y: 0, w, farbe: c.T.zeichen, deck: 1 }, o);
  const linie = (c, L, o = {}) => Object.assign({ id: id(), typ: 'linie', x: (c.w - L) / 2, y: 0, w: L, h: 0, staerke: .3, farbe: c.T.linie, deck: 1 }, o);
  function grund(seite, c) { seite.grund = c.T.grund; seite.tapete = c.T.tapete || null; }
  // Sehne eines Kreises (Mittelpunkt Blattmitte, Radius r) zwischen zwei Höhen: die schmalere Stelle zählt
  const sehne = (c, r) => (ya, yb) => { const cy = c.h / 2, d = Math.max(Math.abs(ya - cy), Math.abs(yb - cy)); return d >= r ? 0 : 2 * Math.sqrt(r * r - d * d); };

  V.rund = {
    name: 'Round mat', wofuer: 'Beer mat, round coaster or cup sticker: a short line in the circle, the ampersand below',
    slots: ['ueber', 'titel*', 'unter', 'fuss'],
    formate: ['r107', 'r95', 'r45'],
    bau(c0, i, seite) {
      const c = Object.assign(c0, { el: c0.el }); grund(seite, c);
      const R = c.w / 2, klein = c.w < 60;
      if (!klein) c.el.push({ id: id(), typ: 'rahmen', x: 3, y: 3, w: c.w - 6, h: c.h - 6, staerke: .3, r: (c.w - 6) / 2, farbe: c.T.linie, deck: .75 });
      const innen = R - (klein ? 4 : 9), bw = innen * 2;
      const items = sauber([
        i.ueber && tx(c, 'kapitale', i.ueber, bw * .8, c.w * .032, c.T.mono, { slot: 'ueber' }), i.ueber && c.w * .03,
        tx(c, 'titel', i.titel || '', bw * .92, c.w * (klein ? .14 : .1), c.T.titel, { slot: 'titel', zeile: 1.1 }),
        i.unter && c.w * .035, i.unter && tx(c, 'mono', i.unter, bw * .8, c.w * .032, c.T.mono, { slot: 'unter' }),
        // eigener Abstand vor dem Zeichen, auch ohne Unterzeile (sauber() nahm ihn sonst mit; Prüfung 23.11.2026: «&» in der Unterlänge)
        i.fuss !== '' && c.w * .045, i.fuss !== '' && zeichen(c, c.w * (klein ? .2 : .095)),
      ]);
      stapelMitte(c, items, R - innen + (klein ? 2 : 4), R + innen - (klein ? 2 : 4), sehne(c, innen));
    },
  };

  V.rundliste = {
    name: 'Round mat with list', wofuer: 'Back of a beer mat or coaster: a heading and a short list from the menu',
    slots: ['ueber', 'titel*', 'liste*', 'unter'],
    formate: ['r107', 'r95'],
    bau(c, i, seite) {
      grund(seite, c);
      const R = c.w / 2;
      c.el.push({ id: id(), typ: 'rahmen', x: 3, y: 3, w: c.w - 6, h: c.h - 6, staerke: .3, r: (c.w - 6) / 2, farbe: c.T.linie, deck: .75 });
      const innen = R - 8, bw = innen * 2, liste = (i.liste || []).filter(e => e && e.name);
      const items = sauber([
        i.ueber && tx(c, 'kapitale', i.ueber, bw * .7, c.w * .028, c.T.mono, { slot: 'ueber' }), i.ueber && c.w * .025,
        i.titel && tx(c, 'titel', i.titel, bw * .8, c.w * .058, c.T.titel, { slot: 'titel' }), i.titel && c.w * .03,
        ...liste.flatMap((e, n) => [
          tx(c, 'titel', e.name, bw * .86, c.w * .044, c.T.titel, { slot: `liste.${n}.name` }),
          e.detail ? tx(c, 'text', e.detail, bw * .78, c.w * .024, c.T.text, { slot: `liste.${n}.detail`, deck: .8, zeile: 1.3 }) : null,
          c.w * .02,
        ].filter(x => x !== null)),
        i.unter && c.w * .01, i.unter && tx(c, 'mono', i.unter, bw * .7, c.w * .026, c.T.mono, { slot: 'unter' }),
      ]);
      stapelMitte(c, items, R - innen + 3, R + innen - 3, sehne(c, innen));
    },
  };

  V.etikett = {
    name: 'Label', wofuer: 'Label for a bottle or a cup sleeve: the ampersand on the left, name and one line on the right',
    slots: ['titel*', 'text', 'unter'],
    formate: ['et84', 'huelse'],
    bau(c, i, seite) {
      grund(seite, c);
      const m = Math.min(c.h * .16, 6), zh = c.h - 2 * m, z = zeichen(c, zh / DS.zz(c.M, {}).verh * .8, { x: m * 1.4 });
      z.y = (c.h - hoehe(c, z)) / 2; c.el.push(z);
      c.el.push(linie(c, 0, { x: z.x + z.w + m, y: m, w: 0, h: c.h - 2 * m, staerke: .25, deck: .7 }));
      const x0 = z.x + z.w + 2 * m, w = c.w - x0 - m * 1.4;
      const items = sauber([
        tx(c, 'titel', i.titel || '', w, c.h * .2, c.T.titel, { slot: 'titel', ausr: 'l', x: x0 }), c.h * .04,
        i.text && tx(c, 'text', i.text, w, c.h * .085, c.T.text, { slot: 'text', ausr: 'l', x: x0, deck: .85, zeile: 1.3 }), i.text && c.h * .05,
        i.unter && tx(c, 'mono', i.unter, w, c.h * .07, c.T.mono, { slot: 'unter', ausr: 'l', x: x0 }),
      ]);
      stapelMitte(c, items, m, c.h - m);
    },
  };

  /* Formate je Aufbau: was die Vorlage für alle Formate setzt, gilt hier nur für eckige Blätter ohne Etikett und Hülse */
  const ECKIG = Object.keys(DS.FORMATE).filter(k => !DS.FORMATE[k].rund && !['et84', 'huelse'].includes(k));
  for (const [k, v] of Object.entries(V)) if (!v.formate) V[k] = Object.assign({}, v, { formate: ECKIG });
  // Beispielinhalte der Hausaufbauten (aus katalog.js, dort geprüft gegen die Quellen)
  if (window.DSKATALOG && DSKATALOG.BEISPIEL) Object.assign(DS.BEISPIEL, DSKATALOG.BEISPIEL);
})();
