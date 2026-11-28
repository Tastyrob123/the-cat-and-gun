/* reihen.js · Nachbesserung 23.11.2026 (Prüfung Punkt 5, Fehlerbuch 10a «keine halb leeren Reihen»):
   Die Raster im Editor (Brand kit → Marks/Elements, Fach «Brand» → Marks & elements, Colours) bekommen ihre Stücke aus dem Fundus,
   die Zahl kann sich jederzeit ändern. Bleibt die letzte Reihe unvollständig, zieht sich das letzte Stück über die freie Breite.
   Spaltenzahl kommt aus dem Raster selbst, also stimmt es bei jeder Breite und jeder Zahl. */
(function () {
  /* Feste Spaltenzahl nach Anzahl (Robert 23.11.2026, Fehlerbuch 10a «nie eine halb leere Reihe», auf 1280/1440/1728/1920/390): statt die letzte Karte über
     die freie Breite zu ziehen, bekommt jedes Raster so viele Spalten, dass jede Reihe voll ist (6 = 3 + 3, 4 = 4 oder 2 + 2, 9 = 3 × 3). c0 ist die Spaltenzahl,
     die das Raster bei dieser Breite sonst hätte; gesucht wird die nächste Zahl, die aufgeht. o.leer: eine Karte «Blank page» darf dazukommen, wenn es dann aufgeht.
     Geht nichts auf, steht alles in einer Reihe (bis zu sieben am Rechner) oder untereinander. */
  var DS = window.DS = window.DS || {};
  DS.spaltenWahl = function (n, c0, o) {
    o = o || {}; var max = o.max || (c0 >= 3 ? 7 : c0 === 2 ? 5 : 1), leer = !!o.leer;
    if (c0 <= 1) return { c: 1, leer: leer && n === 0 };
    if (n <= 0) return { c: Math.min(c0, 1 + (leer ? 0 : 0)), leer: leer };
    var reihe = [c0, c0 + 1, c0 + 2, c0 - 1, c0 + 3, c0 - 2]   /* eher mehr Spalten: zwei Spalten machen grosse Formate (A1, Kreidetafel) riesig */.filter(function (c, i, a) { return c >= 2 && c <= max && a.indexOf(c) === i; });
    for (var i = 0; i < reihe.length; i++) { var c = reihe[i]; if (n % c === 0 && n >= c) return { c: c, leer: false }; if (leer && (n + 1) % c === 0) return { c: c, leer: true }; }
    if (n === 1) return { c: 1, leer: false };
    if (c0 >= 3 && n <= max) return { c: n, leer: false };
    return { c: 1, leer: false };
  };
  DS.spaltenSetzen = function (g, c) { g.style.gridTemplateColumns = 'repeat(' + c + ',minmax(0,1fr))'; g.dataset.spalten = c; return c; };
  var SEL = '.bs-elemente, .lf__marke, .lf__farben, #fotos.fotos, .lf__fotos';   // Fotos dazu (Prüfung 4: 29 Fotos ohne die Grafiken der Anlässe)
  function fuelle(g) {
    if (getComputedStyle(g).display.indexOf('grid') < 0) return;
    var k = [].filter.call(g.children, function (x) { var s = getComputedStyle(x); return s.display !== 'none' && s.position !== 'absolute' && s.position !== 'fixed'; });
    k.forEach(function (x) { if (x.dataset.reihe) { x.style.gridColumn = ''; x.style.aspectRatio = ''; x.style.height = ''; delete x.dataset.reihe; } });
    g.style.gridTemplateColumns = '';
    var cols = getComputedStyle(g).gridTemplateColumns.split(' ').filter(function (t) { return t && t !== 'none'; }).length;
    if (cols > 1 && k.length) DS.spaltenSetzen(g, DS.spaltenWahl(k.length, cols, { max: cols + 2 }).c);
  }
  var wartet = 0, ro = window.ResizeObserver ? new ResizeObserver(function () { bald(); }) : null, gesehen = new WeakSet();
  function alle() { wartet = 0; document.querySelectorAll(SEL).forEach(function (g) { if (ro && !gesehen.has(g)) { gesehen.add(g); ro.observe(g); } fuelle(g); }); }
  function bald() { if (!wartet) wartet = requestAnimationFrame(alle); }
  new MutationObserver(function (ms) { for (var i = 0; i < ms.length; i++) if (ms[i].type === 'childList') return bald(); }).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('resize', bald);
  bald();
})();
