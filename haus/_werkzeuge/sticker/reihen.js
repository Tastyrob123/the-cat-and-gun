/* Sticker editor · Reihen gleichmässig verteilen (Fehlerbuch 10a, 20.10.2026: «gleich viele je Reihe, die letzte Reihe mittig: keine Reihe
   mit grosser Lücke»; CLAUDE.md «keine halb leeren Reihen»). Die Raster der Vorlage füllen von links auf; hier wird je Raster die Zahl der
   Spalten wie in der Vorlage bestimmt (Mindestbreite, höchstens so viele wie dort), dann auf die nötigen Reihen gleichmässig verteilt
   (26 → 4·6 + 2 wird 4 je Reihe mit der letzten mittig, 15 Farben → 5 · 5 · 5, 5 Formen → 3 + 2 mittig). */
(function () {
  'use strict';
  const schmal = () => innerWidth <= 900;
  /* Spalten wie in der Vorlage: [Mindestbreite, höchstens] oder feste Zahl je Breite */
  const REGELN = [
    /* Abnahme 28.11.2026: «Brand elements» am Handy. Drei Karten nebeneinander waren je 111 px breit, die Wortmarke war angeschnitten und der Text
       lief über sechs Zeilen mit ein, zwei Wörtern. Dort stehen die Karten untereinander, jede über die ganze Breite. */
    ['#elementRaster', () => schmal() ? { min: 300, max: 1 } : { min: 210, max: 4 }],
    ['#start .ms-raster', () => schmal() ? 2 : { min: 210, max: 4 }],
    ['#arten', () => innerWidth <= 640 ? 1 : innerWidth <= 1100 ? 2 : 3],
    ['#farbSeite .sk-farbfelder', () => ({ min: 150, max: 6 })],
    ['.links .sk-farbfelder', () => 2],
    ['.sk-elemente', () => 2],
    ['.sk-fotos', () => 3]
  ];
  const beob = window.ResizeObserver ? new ResizeObserver(e => e.forEach(x => verteile(x.target))) : null, gesehen = new WeakSet();
  function regel(el) { for (const [s, f] of REGELN) if (el.matches(s)) return f(); return null; }
  /* Spaltenzahl wählen (Prüfung 22.11.2026, Punkt 4: «die letzte Reihe eines Rasters ist immer voll», «keine Karte allein»):
     Kandidaten c (wie die Vorlage), c+1 (wenn die Karten dann noch mindestens 70 % der Mindestbreite haben) und c−1 (nur ab 3 Spalten).
     Gut ist eine Aufteilung, die aufgeht, oder deren kurze Reihen höchstens eine Karte weniger haben und zu mindestens drei Vierteln voll sind.
     Geht die Spaltenzahl der Vorlage gut auf, bleibt sie; sonst gewinnt unter den guten die mit den wenigsten leeren Plätzen. */
  /* Robert 23.11.2026 (Fehlerbuch 10a, «nie eine halb leere Reihe», 1280/1440/1728/1920/390): feste Spaltenzahl nach Anzahl, jede Reihe voll.
     Kandidaten nahe an der Spaltenzahl der Vorlage (c, c+1, c−1, c+2 …), solange die Karten breit genug bleiben; geht keine auf, alle in einer Reihe
     (wenige Stücke) oder untereinander. Keine kurzen, mittigen Reihen mehr. */
  function wahl(n, c, W, g, r) {
    const breit = k => k === 1 || (typeof r === 'number' ? (W - (k - 1) * g) / k >= 100 : (W - (k - 1) * g) / k >= r.min * 0.7);
    const kand = [c, c + 1, c - 1, c + 2, c - 2, c + 3].filter((k, i, a) => k >= 2 && a.indexOf(k) === i && breit(k));
    for (const k of kand) if (n % k === 0 && n >= k) return { je: k, reihen: n / k, leer: 0 };
    if (n > 1 && n <= c + 3 && breit(n)) return { je: n, reihen: 1, leer: 0 };
    return { je: 1, reihen: n, leer: 0 };
  }
  function verteile(el) {
    const r = regel(el); if (r == null) return;
    const W = el.clientWidth; if (!W) return;
    let karten = [...el.children].filter(k => !k.hidden && !k.matches('p,.sk-leerhinweis'));
    if (!el.classList.contains('sk-vert')) {   // Abstand der Vorlage übernehmen, bevor das Raster zur Reihe wird
      const cs = getComputedStyle(el); el.style.setProperty('--sk-gap', (parseFloat(cs.columnGap) || 0) + 'px'); el.classList.add('sk-vert');
    }
    const g = parseFloat(el.style.getPropertyValue('--sk-gap')) || 0;
    const c = typeof r === 'number' ? r : Math.max(1, Math.min(r.max, Math.floor((W + g) / (r.min + g))));
    /* Die Karte «New sticker» füllt nur auf: geht die Reihe ohne sie besser auf, bleibt sie in diesem Raster weg (anlegen geht immer über «New sticker» oben) */
    const neu = karten.find(k => k.classList.contains('sk-neu'));
    if (neu) { neu.classList.remove('sk-fueller-weg'); const mit = wahl(karten.length, c, W, g, r), ohne = wahl(karten.length - 1, c, W, g, r);
      const wert = x => Math.abs(x.je - c) + (x.je === 1 && c > 1 ? 10 : 0);   // nah an der Spaltenzahl der Vorlage, nie untereinander, wenn es anders aufgeht
      if (karten.length > 1 && wert(ohne) < wert(mit)) { neu.classList.add('sk-fueller-weg'); karten = karten.filter(k => k !== neu); } }
    const n = karten.length || 1, { je, reihen, leer } = wahl(n, c, W, g, r);
    if (el.style.getPropertyValue('--sk-sp') !== String(je)) el.style.setProperty('--sk-sp', je);
    /* kurze Reihen ans Ende, mittig: erste und letzte Karte je eine halbe Spalte Rand, dann bricht die Reihe genau dort um */
    karten.forEach(k => k.classList.remove('sk-kurz-a', 'sk-kurz-z'));
    if (leer > 0 && je > 1) {
      const voll = reihen - leer;
      for (let i = 0; i < leer; i++) { const a = voll * je + i * (je - 1), z = a + je - 2; if (karten[a]) karten[a].classList.add('sk-kurz-a'); if (karten[z]) karten[z].classList.add('sk-kurz-z'); }
    }
  }
  function suche() {
    REGELN.forEach(([s]) => document.querySelectorAll(s).forEach(el => { if (beob && !gesehen.has(el)) { gesehen.add(el); beob.observe(el); } verteile(el); }));
  }
  let uhr = 0;
  const bald = () => { if (uhr) return; uhr = requestAnimationFrame(() => { uhr = 0; suche(); }); };
  function los() { suche(); const mo = new MutationObserver(bald); ['#start', '.links'].forEach(s => { const e = document.querySelector(s); if (e) mo.observe(e, { childList: true, subtree: true }); }); addEventListener('resize', bald); }   // nur Übersicht und linke Platte beobachten, nicht das Blatt beim Ziehen
  window.SKReihen = { verteile, suche };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
