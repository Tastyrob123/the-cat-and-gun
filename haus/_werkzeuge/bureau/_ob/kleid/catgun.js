/* kleid/catgun.js · Hauswerte für oberflaeche.js (The Cat & Gun, Café und Bar in Catangnan, Siargao; 22.11.2026). Kopie der Vorlage Culinarium (kleid/culinarium.js), umgebaut.
   Im <head> VOR allen Stilen laden (ohne defer). Rahmen «Die Bühne»: Kopf dunkel wie die Tinte der Wortmarke, Raum hell wie der weisse Putz der Rundbögen.
   Liegt bis zum gemeinsamen Kleid des Control panel (_werkzeuge/oberflaeche/) im Revier von Edit website und wird unter /the-cat-and-gun/haus/_werkzeuge/bureau/_ob/ ausgeliefert.
   Fotos und Schriften kommen aus der Website (/the-cat-and-gun/haus/assets/bild/<schlüssel>-<breite>.webp, /the-cat-and-gun/haus/assets/schrift/), Zeichen aus drucksachen/zeichen/. */
window.WO_HAUS = { kurz: 'catgun', name: 'The Cat & Gun', voll: 'The Cat & Gun', ort: 'Catangnan, Siargao', welt: 'bar', rahmen: 'buehne', anrede: 'you', sprache: 'en',
  /* Foto des Startbilds: der Raum mit den Rundbögen, Rattanstühlen und der Bar (Instagram-Foto 24, website/bilder.json › b24) */
  foto: '/the-cat-and-gun/haus/assets/bild/b24-1200.webp', fotoKlein: '/the-cat-and-gun/haus/assets/bild/b24-800.webp', fotoFarbe: '#8a7560', fotoGroessen: [800, 1200], fotoAlt: 'Inside The Cat & Gun: arches, rattan chairs and the bar',
  /* Zeichen im Ring: das Et-Zeichen der Wortmarke (drucksachen/zeichen/et-schwarz.svg, aus dem Profilbild nachgezogen) */
  zeichen: '/the-cat-and-gun/haus/_werkzeuge/bureau/_ob/kleid/catgun-zeichen.svg', zeichenMass: 1.19, wortmarke: '', wortmarkeMass: 1.16,
  /* Namen der Werkzeuge: die EINE Stelle (CLAUDE.md, Tabelle «Was gebaut wird»). Dateien, Schlüssel und Adressen bleiben (maison, bureau, carte …). */
  namen: { zentrale: 'Control panel', website: 'Edit website', karten: 'Menus & price lists', gaeste: 'Inquiries & chat', marke: 'Brand book', besuche: 'Visitors', druck: 'Print & feed' },
  saetze: { zentrale: 'All tools in one place, each with its state.',
    website: 'Change the website yourself: texts, photos, phone, hours, a notice for guests.',
    karten: 'Dishes, drinks and prices. The menu page and the price lists come from here.',
    gaeste: 'Questions from guests that the chat could not answer.',
    marke: 'Logo, photos, colours and fonts of the house in one place.',
    besuche: 'Who visits the website: from where, when, which pages.',
    druck: 'Signs, stickers and posts in the style of the house.' },
  wege: { zentrale: '/the-cat-and-gun/haus/_werkzeuge/maison/', website: '/the-cat-and-gun/haus/_werkzeuge/bureau/', karten: '/the-cat-and-gun/haus/_werkzeuge/carte/', gaeste: '/the-cat-and-gun/haus/_werkzeuge/reception/', marke: '/the-cat-and-gun/haus/_werkzeuge/livre/', besuche: '/the-cat-and-gun/haus/_werkzeuge/registre/', druck: '/the-cat-and-gun/haus/_werkzeuge/imprimerie/' },
  /* Prüfserver je Werkzeug (_werkzeuge/<schlüssel>/AUFTRAG.md); Wege zwischen Werkzeugen immer 127.0.0.1, nie localhost (Fehlerbuch 10a) */
  ports: { karten: 9730, zentrale: 9731, marke: 9732, website: 9733, sticker: 9734, gaeste: 9735, besuche: 9736, markeneditor: 9737, druck: 9738, werkbank: 9739, unterbau: 9740 } };
/* Lokal (Prüfserver je Werkzeug) zeigen die Wege zu den ANDEREN Werkzeugen auf deren eigenen Server unter 127.0.0.1, nie auf den eigenen Port
   (Fund culinarium-reception 28.10.2026: der Knopf «La Maison» öffnete /the-cat-and-gun/haus/_werkzeuge/maison/ auf einem fremden Port ohne Stand-Wege; Fehlerbuch 10a). Online bleiben sie relativ.
   Wer selbst schon absolute Wege setzt: nur Wege umschreiben, die noch mit «/» beginnen (WO_HAUS.wegeLokal = true zeigt, dass es hier geschah). */
/* Edit website (Prüfung 23.11.2026, Punkt 19): die Wege bleiben auch lokal relativ; serve.py leitet unter /the-cat-and-gun/haus/_werkzeuge/<schlüssel>/ zum Port des
   Werkzeugs weiter, wenn es läuft, sonst zeigt es eine Seite «läuft auf diesem Rechner noch nicht» mit Weg zurück. So führt kein Knopf ins Leere. */
WO_HAUS.wegeLokal = true;
/* Neuer Look (Robert 24.11.2026, gewählt: _entwurf-dashboard/website-bereich/gewaehlt.html): Seitenleiste wie im Control panel (maison/index.html › dx-rail),
   Kurzsätze der Werkzeuge wie dort vor dem Laden ihrer Stände, Aufgaben und Seiten-Symbole wie in website-bereich/bau.py (OFT, PAGES). */
WO_HAUS.dash = {
  marke: '/the-cat-and-gun/haus/_werkzeuge/bureau/dash/wortmarke-weiss.svg', ort: 'Catangnan, Siargao',
  guides: 'https://tastyrob123.github.io/the-cat-and-gun/schulung/akademie/', guidesZahl: '11 videos',
  werkzeuge: [['bureau', 'Website', 'web', ''], ['carte', 'Menus', 'menu', 'Food and drinks with prices'], ['reception', 'Guests', 'chat', 'Guest questions and the chat'],
    ['livre', 'Brand book', 'buch', 'Logo, colours, fonts, photos'], ['markenbuch-editor', 'Brand editor', 'palette', 'Keeping the brand book up to date'],
    ['sticker', 'Stickers', 'sticker', 'Stickers with the logo'], ['imprimerie', 'Print & feed', 'druck', 'Signs, coasters, posts'], ['registre', 'Visitors', 'besuch', 'Visits to the website']],
  oft: [['text', 'Change a text', 'Click it on the page', 'b14', 'text'], ['foto', 'Change a photo', 'Choose or upload', 'b16', 'foto'],
    ['uhr', 'Phone, address & hours', 'On all six pages', 'b24', 'angaben'], ['megafon', 'Notice for guests', 'Top of every page, with dates', 'b30', 'hinweis'],
    ['preis', 'Times', 'Times, sizes, durations', 'b22', 'zahlen'], ['verlauf', 'Earlier versions', 'Every publish is kept', 'b19', 'verlauf']],
  seiten: { start: ['haus'], menu: ['menu', 'Dishes & prices in Menus & price lists'], juices: ['glas'], playground: ['rutsche'], pool: ['kugel'], visit: ['pin'] }
};
(function () {
  if (WO_HAUS.wegeLokal || !/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) return;
  Object.keys(WO_HAUS.wege).forEach(function (k) {
    var p = WO_HAUS.ports[k], w = WO_HAUS.wege[k];
    if (p && String(p) !== location.port && w.charAt(0) === '/') WO_HAUS.wege[k] = 'http://127.0.0.1:' + p + w;
  });
  WO_HAUS.wegeLokal = true;
})();
document.documentElement.setAttribute('data-wo-haus', WO_HAUS.kurz);
document.documentElement.setAttribute('data-wo-rahmen', WO_HAUS.rahmen);
try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
/* Bewegung der Werkzeuge (29.10.2026): bewegung.js neben oberflaeche.js, async und mit wenig Vorrang nachgeladen, damit es nie vor dem ersten Knopf steht */
(function () {
  var me = document.currentScript, s = document.createElement('script');
  s.src = (me && me.src ? new URL('../bewegung.js', me.src).href : '/the-cat-and-gun/haus/_werkzeuge/bureau/_ob/bewegung.js') + '?v=3';   /* Fassung hochzählen, wenn bewegung.js sich ändert */
  s.async = true; s.setAttribute('fetchpriority', 'low'); document.head.appendChild(s);
})();
/* Titel fliegen zeilenweise hoch (Kriterium 37, 30.10.2026). WO_ZEILEN(el) setzt jedes Wort eines Titels in <span class="wo-w"> und schreibt die Zeile als --z daran;
   die Wörter einer Zeile steigen zusammen, Zeile für Zeile gestaffelt. Ändert sich dabei der Umbruch (Silbentrennung, sehr lange Wörter), bleibt der Titel unberührt.
   Hier im Kleid (ohne defer), damit der Titel des Startbilds schon vor dem ersten Bild geteilt ist; bewegung.js nutzt dieselbe Funktion für die Zwischentitel. */
window.WO_ZEILEN = function (el) {
  if (!el || el.hasAttribute('data-wo-zl')) return !!(el && el.classList.contains('wo-zl'));
  var h0 = el.offsetHeight; if (!h0) return false;   /* verborgen: später, wenn er zu sehen ist */
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
/* Der Titel des Startbilds: geteilt, sobald er im Dokument steht (vor dem ersten Bild, der Auftritt beginnt erst nach 0,18 s) */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('MutationObserver' in window)) return;
  var plan = 0;
  function teile() {
    plan = 0;
    document.querySelectorAll('.wo-sb__h:not([data-wo-zl])').forEach(function (h) {
      if (document.documentElement.classList.contains('still')) return;
      var a = h.getAnimations ? h.getAnimations() : [];
      if (a.some(function (x) { return (x.currentTime || 0) > 120; })) { h.setAttribute('data-wo-zl', ''); return; }   /* läuft schon: bleibt ein Block, nie zurückspringen */
      WO_ZEILEN(h);
    });
  }
  new MutationObserver(function () { if (!plan && document.querySelector('.wo-sb__h:not([data-wo-zl])')) { plan = 1; Promise.resolve().then(teile); } })
    .observe(document.documentElement, { childList: true, subtree: true });
})();
