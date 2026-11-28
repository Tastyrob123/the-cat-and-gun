/* kleid/catgun.js · Hauswerte für oberflaeche.js (The Cat & Gun, Café und Bar in Catangnan, Siargao; 22.11.2026, Kopie von kleid/culinarium.js).
   Im <head> VOR allen Stilen laden (ohne defer). Rahmen «Die Bühne»: Kopf dunkel wie die Wortmarke, Raum hell wie der weisse Putz der Rundbögen.
   Liegt im Revier von Inquiries & chat, bis das gemeinsame Kleid unter _werkzeuge/oberflaeche/ steht; server.py liefert beides unter /the-cat-and-gun/haus/_werkzeuge/reception/_ob/.
   Fotos und Schriften kommen aus der Website (/the-cat-and-gun/haus/assets/bild/bNN-<breite>.webp, /the-cat-and-gun/haus/assets/schrift/). Nummern bNN = Fotos aus _quelle/instagram/liste.json. */
window.WO_HAUS = { kurz: 'catgun', name: 'The Cat & Gun', voll: 'The Cat & Gun, Catangnan', ort: 'Catangnan, Siargao', welt: 'cafe', rahmen: 'buehne', anrede: 'du', sprache: 'en',
  /* Aussenfoto des Startbilds: Foto 08 (Paar am Holztresen am offenen Fenster); der Innenraum (24) und das Haus (30) sind Querformat oder Grafik */
  foto: '/the-cat-and-gun/haus/assets/bild/b08-1200.webp', fotoKlein: '/the-cat-and-gun/haus/assets/bild/b08-800.webp', fotoFarbe: '#6b5a48',
  /* Zeichen im Ring: das Et-Zeichen der Wortmarke (drucksachen/zeichen/et-schwarz.svg); die ganze Wortmarke unter wortmarke */
  zeichen: '/the-cat-and-gun/haus/_werkzeuge/reception/_ob/kleid/catgun-zeichen.svg', zeichenMass: 1.19, wortmarke: '/the-cat-and-gun/haus/_werkzeuge/reception/_ob/kleid/catgun-wortmarke.svg', wortmarkeMass: 1.16,
  /* Namen der Werkzeuge: die EINE Stelle (CLAUDE.md, Tabelle «Name in der Oberfläche»). Dateien, Schlüssel und Adressen bleiben (maison, bureau, carte …). */
  namen: { zentrale: 'Control panel', website: 'Edit website', karten: 'Menus & price lists', gaeste: 'Inquiries & chat', marke: 'Brand book', besuche: 'Visitors', druck: 'Print & feed' },
  saetze: { zentrale: 'All tools in one place, each with its latest state.',
    website: 'Change texts and photos on the website.',
    karten: 'Keep the menus and price lists up to date.',
    gaeste: 'Questions from the website chat. Your answers go to every guest.',
    marke: 'Logo, photos, colours and fonts in one place.',
    besuche: 'Who visits the website, from where and when.',
    druck: 'Print pieces and posts for Instagram.' },
  wege: { zentrale: '/the-cat-and-gun/haus/_werkzeuge/maison/', website: '/the-cat-and-gun/haus/_werkzeuge/bureau/', karten: '/the-cat-and-gun/haus/_werkzeuge/carte/', gaeste: '/the-cat-and-gun/haus/_werkzeuge/reception/', marke: '/the-cat-and-gun/haus/_werkzeuge/livre/', besuche: '/the-cat-and-gun/haus/_werkzeuge/registre/', druck: '/the-cat-and-gun/haus/_werkzeuge/imprimerie/' },
  /* Prüfserver je Werkzeug (AUFTRAG.md der Werkzeuge); Wege zwischen Werkzeugen immer 127.0.0.1, nie localhost (Fehlerbuch 10a) */
  ports: { zentrale: 9731, markeneditor: 9737, website: 9733, karten: 9730, gaeste: 9735, besuche: 9736, sticker: 9734, druck: 9738, marke: 9732, unterbau: 9740 } };
/* Lokal (Prüfserver je Werkzeug) zeigen die Wege zu den ANDEREN Werkzeugen auf deren eigenen Server unter 127.0.0.1, nie auf den eigenen Port
   (Fehlerbuch 10a). Online bleiben sie relativ.
   Wer selbst schon absolute Wege setzt: nur Wege umschreiben, die noch mit «/» beginnen (WO_HAUS.wegeLokal = true zeigt, dass es hier geschah). */
(function () {
  if (!/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) return;
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
  s.src = (me && me.src ? new URL('../bewegung.js', me.src).href : '/the-cat-and-gun/haus/_werkzeuge/reception/_ob/bewegung.js') + '?v=3';   /* Fassung hochzählen, wenn bewegung.js sich ändert */
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
