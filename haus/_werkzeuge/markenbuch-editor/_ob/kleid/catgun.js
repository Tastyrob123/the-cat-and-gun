/* kleid/catgun.js · Hauswerte für oberflaeche.js · The Cat & Gun, Café und Bar in Catangnan, Siargao (22.11.2026).
   Kopie des Kleids der Vorlage (Culinarium, kleid/culinarium.js), nur die Werte des Hauses getauscht. Liegt bis zum gemeinsamen Kleid
   (Revier maison/oberflaeche) im Ordner des Brand book editor; der Server liefert es unter /the-cat-and-gun/haus/_werkzeuge/markenbuch-editor/_ob/ aus.
   Im <head> VOR allen Stilen laden (ohne defer). Fotos und Schriften kommen aus der Website (/the-cat-and-gun/haus/assets/bild/<schlüssel>-<breite>.webp, /the-cat-and-gun/haus/assets/schrift/).
   Namen der Werkzeuge: CLAUDE.md, Tabelle «Was gebaut wird» (Name in der Oberfläche). */
window.WO_HAUS = { kurz: 'catgun', name: 'The Cat & Gun', voll: 'The Cat & Gun, Catangnan', ort: 'Catangnan, Siargao', welt: 'bar', rahmen: 'buehne', anrede: 'du',
  /* Foto des Startbilds: der Raum unter den weissen Rundbögen (website/bau.py, KOPFALT b24). Ein Aussenfoto ohne Schrift gibt es nicht (OFFEN.md). */
  foto: '/the-cat-and-gun/haus/assets/bild/b24-1200.webp', fotoKlein: '/the-cat-and-gun/haus/assets/bild/b24-800.webp', fotoFarbe: '#8a6a4f', fotoAlt: 'The bar under the white arches with the chalkboards',
  /* Zeichen im Ring: das Et-Zeichen der Wortmarke (drucksachen/zeichen/et-schwarz.svg, aus _quelle/logo/wortmarke.svg) */
  zeichen: '/the-cat-and-gun/haus/_werkzeuge/markenbuch-editor/_ob/kleid/catgun-zeichen.svg', zeichenMass: 1.19,
  namen: { zentrale: 'Control panel', website: 'Edit website', karten: 'Menus & price lists', gaeste: 'Inquiries & chat', marke: 'Brand book editor', besuche: 'Visitors',
    druck: 'Print & feed', sticker: 'Sticker editor', buch: 'Brand book' },
  saetze: { marke: 'Colours, fonts, photos and lines of the house in one place. A change here holds in every tool that designs.' },
  wege: { zentrale: '/the-cat-and-gun/haus/_werkzeuge/maison/', website: '/the-cat-and-gun/haus/_werkzeuge/bureau/', karten: '/the-cat-and-gun/haus/_werkzeuge/carte/', gaeste: '/the-cat-and-gun/haus/_werkzeuge/reception/', marke: '/the-cat-and-gun/haus/_werkzeuge/markenbuch-editor/',
    besuche: '/the-cat-and-gun/haus/_werkzeuge/registre/', druck: '/the-cat-and-gun/haus/_werkzeuge/imprimerie/', sticker: '/the-cat-and-gun/haus/_werkzeuge/sticker/', buch: '/the-cat-and-gun/haus/_werkzeuge/livre/' },
  /* Eigene lokale Ports von The Cat & Gun (mac-brief 23.11.2026; auf 908x/938x/947x laufen andere Häuser); Wege zwischen Werkzeugen immer 127.0.0.1, nie localhost (Fehlerbuch 10a) */
  ports: { karten: 9730, zentrale: 9731, buch: 9732, website: 9733, sticker: 9734, gaeste: 9735, besuche: 9736, marke: 9737, druck: 9738, werkbank: 9739, unterbau: 9740 } };
/* Lokal zeigen die Wege zu den ANDEREN Werkzeugen auf deren eigenen Server unter 127.0.0.1. Der Weg zum eigenen Werkzeug bleibt relativ
   (gleich, auf welchem Port der Prüfserver läuft). Online bleiben alle Wege relativ. */
(function () {
  if (!/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) return;
  Object.keys(WO_HAUS.wege).forEach(function (k) {
    var p = WO_HAUS.ports[k], w = WO_HAUS.wege[k];
    if (!p || w.charAt(0) !== '/' || location.pathname.indexOf(w) === 0) return;
    WO_HAUS.wege[k] = 'http://127.0.0.1:' + p + w;
  });
  WO_HAUS.werkbankLokal = 'http://127.0.0.1:' + WO_HAUS.ports.werkbank + '/';
  WO_HAUS.wegeLokal = true;
})();
document.documentElement.setAttribute('data-wo-haus', WO_HAUS.kurz);
document.documentElement.setAttribute('data-wo-rahmen', WO_HAUS.rahmen);
try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
/* Bewegung der Werkzeuge: bewegung.js neben oberflaeche.js, async und mit wenig Vorrang nachgeladen */
(function () {
  var me = document.currentScript, s = document.createElement('script');
  s.src = (me && me.src ? new URL('../bewegung.js', me.src).href : '/the-cat-and-gun/haus/_werkzeuge/markenbuch-editor/_ob/bewegung.js') + '?v=3';
  s.async = true; s.setAttribute('fetchpriority', 'low'); document.head.appendChild(s);
})();
/* Titel fliegen zeilenweise hoch (wie die Vorlage): WO_ZEILEN(el) setzt jedes Wort in <span class="wo-w"> mit seiner Zeile --z */
window.WO_ZEILEN = function (el) {
  if (!el || el.hasAttribute('data-wo-zl')) return !!(el && el.classList.contains('wo-zl'));
  var h0 = el.offsetHeight; if (!h0) return false;
  el.setAttribute('data-wo-zl', '');
  var w0 = Math.max(el.scrollWidth, el.clientWidth), roh = el.innerHTML, tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), t, ts = [];
  while ((t = tw.nextNode())) if (/\S/.test(t.data) && !t.parentNode.closest('svg')) ts.push(t);
  if (!ts.length) return false;
  ts.forEach(function (t) {
    var f = document.createDocumentFragment();
    t.data.split(/(\s+)/).forEach(function (s) {
      if (!s) return;
      if (/^\s+$/.test(s)) { f.appendChild(document.createTextNode(s)); return; }
      var w = document.createElement('span'); w.className = 'wo-w'; w.textContent = s; f.appendChild(w);
    });
    t.parentNode.replaceChild(f, t);
  });
  if (el.offsetHeight !== h0 || el.scrollWidth > w0 + 1) { el.innerHTML = roh; return false; }
  var z = -1, oben = -1e9, halb = parseFloat(getComputedStyle(el).fontSize) * 0.5;
  el.querySelectorAll('.wo-w').forEach(function (w) { var y = w.getBoundingClientRect().top; if (y > oben + halb) { z++; oben = y; } if (z) w.style.setProperty('--z', z); });
  el.classList.add('wo-zl');
  return true;
};
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('MutationObserver' in window)) return;
  var plan = 0;
  function teile() {
    plan = 0;
    document.querySelectorAll('.wo-sb__h:not([data-wo-zl])').forEach(function (h) {
      if (document.documentElement.classList.contains('still')) return;
      var a = h.getAnimations ? h.getAnimations() : [];
      if (a.some(function (x) { return (x.currentTime || 0) > 120; })) { h.setAttribute('data-wo-zl', ''); return; }
      WO_ZEILEN(h);
    });
  }
  new MutationObserver(function () { if (!plan && document.querySelector('.wo-sb__h:not([data-wo-zl])')) { plan = 1; Promise.resolve().then(teile); } })
    .observe(document.documentElement, { childList: true, subtree: true });
})();
