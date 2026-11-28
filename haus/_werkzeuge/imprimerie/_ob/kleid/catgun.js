/* kleid/catgun.js · Hauswerte für oberflaeche.js (The Cat & Gun, Café und Bar in Catangnan, Siargao; 22.11.2026, Sitzung «Control panel»).
   Im <head> VOR allen Stilen laden (ohne defer). Rahmen «Die Bühne»: Kopf dunkel wie das schwarze Hausschild, Raum hell wie der weisse Putz der Rundbögen.
   Liegt unter _werkzeuge/oberflaeche/ und wird von den Werkzeug-Servern unter /the-cat-and-gun/haus/_werkzeuge/imprimerie/_ob/ ausgeliefert (einziger Schreiber: Sitzung «Control panel»).
   Fotos und Schriften kommen aus der Website (/the-cat-and-gun/haus/assets/bild/<schlüssel>-<breite>.webp, /the-cat-and-gun/haus/assets/schrift/), Zeichen und Wortmarke aus diesem Ordner
   (unveränderte Kopien von drucksachen/zeichen/). Sprache der Oberfläche: Englisch. */
window.WO_HAUS = { kurz: 'catgun', name: 'The Cat & Gun', voll: 'The Cat & Gun, Catangnan', ort: 'Catangnan, Siargao', welt: 'bar', rahmen: 'buehne', anrede: 'you', sprache: 'en',
  /* Foto des Startbilds: der Raum unter den weissen Rundbögen mit Bar und Tafeln (b24, Foto 24 der Sammlung; Startfoto der Website, website/bau.py KOPFALT).
     Grössen wie in der Website (website/bilder.json → b24.g): 800 und 1200 px. */
  foto: '/the-cat-and-gun/haus/assets/bild/b24-1200.webp', fotoKlein: '/the-cat-and-gun/haus/assets/bild/b24-800.webp', fotoGroessen: [800, 1200], fotoFarbe: '#978578',
  fotoAlt: 'The bar under the white arches with the chalkboards',
  /* Zeichen im Ring: das «&» der Wortmarke (drucksachen/zeichen/et-farbe.svg, unverändert); die ganze Wortmarke «THE / CAT & / GUN» unter wortmarke */
  zeichen: '/the-cat-and-gun/haus/_werkzeuge/imprimerie/_ob/kleid/catgun-zeichen.svg', zeichenMass: 1.19, wortmarke: '/the-cat-and-gun/haus/_werkzeuge/imprimerie/_ob/kleid/catgun-wortmarke.svg', wortmarkeMass: 1.163,
  /* Namen der Werkzeuge: die EINE Stelle (CLAUDE.md, Tabelle «Was gebaut wird», Spalte «Name in der Oberfläche»). Dateien, Schlüssel und Adressen bleiben (maison, bureau, carte …). */
  namen: { zentrale: 'Control panel', website: 'Edit website', karten: 'Menus & price lists', gaeste: 'Inquiries & chat', marke: 'Brand book',
    markeneditor: 'Brand book editor', sticker: 'Sticker editor', druck: 'Print & feed', besuche: 'Visitors' },
  saetze: { zentrale: 'All tools in one place, each with what is waiting.',
    website: 'Change texts, photos, phone and opening hours on the website.',
    karten: 'Keep the menus and prices up to date, for the website and for print.',
    gaeste: 'Answer guest questions. Each answer then helps every guest in the chat.',
    marke: 'Logo, colours, fonts and photos of the house in one place.',
    markeneditor: 'Edit the brand book: colours, fonts, logo files and photos.',
    sticker: 'Design stickers with the logo and the colours of the house.',
    druck: 'Signs, coasters, table cards and posts for Instagram, ready to print.',
    besuche: 'Who visits the website: how many, from where, which pages.' },
  /* Reihe der Werkzeuge in Kopf und Control panel (Taste 1 bis 8), wie im Auftrag des Control panel genannt */
  reihe: ['website', 'karten', 'gaeste', 'marke', 'markeneditor', 'sticker', 'druck', 'besuche'],
  wege: { zentrale: '/the-cat-and-gun/haus/_werkzeuge/maison/', website: '/the-cat-and-gun/haus/_werkzeuge/bureau/', karten: '/the-cat-and-gun/haus/_werkzeuge/carte/', gaeste: '/the-cat-and-gun/haus/_werkzeuge/reception/', marke: '/the-cat-and-gun/haus/_werkzeuge/livre/',
    markeneditor: '/the-cat-and-gun/haus/_werkzeuge/markenbuch-editor/', sticker: '/the-cat-and-gun/haus/_werkzeuge/sticker/', druck: '/the-cat-and-gun/haus/_werkzeuge/imprimerie/', besuche: '/the-cat-and-gun/haus/_werkzeuge/registre/' },
  /* Eigene lokale Ports von The Cat & Gun (CLAUDE.md, Robert 23.11.2026; am Mac laufen auf 9081–9090 andere Häuser); Wege zwischen Werkzeugen immer 127.0.0.1, nie localhost (Fehlerbuch 10a) */
  ports: { zentrale: 9731, markeneditor: 9737, website: 9733, karten: 9730, gaeste: 9735, besuche: 9736, sticker: 9734, druck: 9738, marke: 9732, werkbank: 9739, unterbau: 9740 } };
/* Lokal (Prüfserver je Werkzeug) zeigen die Wege zu den ANDEREN Werkzeugen auf deren eigenen Server unter 127.0.0.1, nie auf den eigenen Port. Online bleiben sie relativ.
   Wer selbst schon absolute Wege setzt: nur Wege umschreiben, die noch mit «/» beginnen (WO_HAUS.wegeLokal = true zeigt, dass es hier geschah). */
(function () {
  if (!/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) return;
  /* Nur auf einem der Prüfserver des Hauses (Ports oben). Ein Server, der das ganze Haus ausliefert (am Mac z. B. 9720), führt alle Wege selbst:
     dort bleiben sie relativ, sonst landete ein Klick auf einem fremden Server desselben Ports (mac-pruefung/maison.txt, 23.11.2026). */
  var eigene = Object.keys(WO_HAUS.ports).map(function (k) { return String(WO_HAUS.ports[k]); });
  if (eigene.indexOf(location.port) < 0) return;
  Object.keys(WO_HAUS.wege).forEach(function (k) {
    var p = WO_HAUS.ports[k], w = WO_HAUS.wege[k];
    if (p && String(p) !== location.port && w.charAt(0) === '/') WO_HAUS.wege[k] = 'http://127.0.0.1:' + p + w;
  });
  WO_HAUS.wegeLokal = true;
})();
document.documentElement.setAttribute('data-wo-haus', WO_HAUS.kurz);
document.documentElement.setAttribute('data-wo-rahmen', WO_HAUS.rahmen);
try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
/* Bewegung der Werkzeuge: bewegung.js neben oberflaeche.js, async und mit wenig Vorrang nachgeladen, damit es nie vor dem ersten Knopf steht */
(function () {
  var me = document.currentScript, s = document.createElement('script');
  s.src = (me && me.src ? new URL('../bewegung.js', me.src).href : '/the-cat-and-gun/haus/_werkzeuge/imprimerie/_ob/bewegung.js') + '?v=3';   /* Fassung hochzählen, wenn bewegung.js sich ändert */
  s.async = true; s.setAttribute('fetchpriority', 'low'); document.head.appendChild(s);
})();
/* Titel fliegen zeilenweise hoch. WO_ZEILEN(el) setzt jedes Wort eines Titels in <span class="wo-w"> und schreibt die Zeile als --z daran;
   die Wörter einer Zeile steigen zusammen, Zeile für Zeile gestaffelt. Ändert sich dabei der Umbruch, bleibt der Titel unberührt. */
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
