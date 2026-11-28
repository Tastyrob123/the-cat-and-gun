/* Menus & price lists · The Cat & Gun (Mac-Prüfung 23.11.2026, Punkt 11: «Nichts schwebt beim Scrollen herein»; Effekte-Standard 23.11.2026, Vorbild Schlössli).
   Nur beim ersten Zeichnen der Liste: Zeilen und Seitenköpfe unterhalb des Bildschirms warten 40 px tiefer und schweben beim Hinscrollen an ihren Platz
   (Staffel höchstens vier Schritte, wie auftritte.js). Danach wird die Zeile wieder ganz in Ruhe gelassen (Klasse weg, kein Beobachter mehr). Ein Kartenwechsel
   links gilt als neue Ansicht; jede andere neu gezeichnete Liste (Bearbeiten, Speichern) bleibt unberührt, damit beim Bearbeiten nichts flackert und ein Doppelklick immer seine Zeile trifft.
   Gehört zu den Regeln am Ende von carte.css (.za-wart, Empfang). */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window) || !('MutationObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var liste = document.getElementById('liste'); if (!liste) return;
  var erst = true, bis = 0, io = null;
  /* Kartenwechsel links (Drinks, Coffee & juices, Kitchen) ist eine neue Ansicht: die nächste neu gezeichnete Liste kommt wie beim Öffnen */
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#reiter [data-z], #ueber [data-z]')) bis = performance.now() + 1500; }, true);
  function warte() {
    var rows = liste.querySelectorAll('.r, .teil__k'); if (!rows.length) return false;
    var H = window.innerHeight, warten = [];
    rows.forEach(function (r) { if (r.getBoundingClientRect().top > H) { r.classList.add('za-wart'); warten.push(r); } });
    if (!warten.length) return true;
    if (!io) io = new IntersectionObserver(function (es) {
      var k = 0;
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var r = e.target; io.unobserve(r);
        r.style.setProperty('--za-i', Math.min(k++, 4));
        r.classList.add('za-da');
        setTimeout(function () { r.classList.remove('za-wart', 'za-da'); r.style.removeProperty('--za-i'); }, 1500);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    warten.forEach(function (r) { io.observe(r); });
    return true;
  }
  new MutationObserver(function () {
    if (erst) { if (!liste.querySelector('.r')) return; erst = false; if (performance.now() > 6000) return; warte(); return; }   /* Liste kam spät (langsame Leitung): ohne Auftritt */
    if (performance.now() > bis) return;   /* Bearbeiten, Speichern, Rückgängig: die Liste steht ruhig */
    if (io) io.disconnect(), io = null;
    if (warte()) bis = 0;
  }).observe(liste, { childList: true });
})();

/* Empfang (carte.css): die Karten links und ihr Foto bewegen sich nur beim ersten Erscheinen. Ist der Auftakt durch (html.auftakt-da), läuft der
   Empfang knapp 2 s; danach html.cg-ruhig, damit ein Kartenwechsel die Leiste ruhig neu zeichnet. Das Farbfeld im Design-Fenster füllt sich nur
   beim ersten Öffnen von links (html.cg-farben-erst für 2 s), bei jedem weiteren Klick steht es still. */
(function () {
  'use strict';
  var H = document.documentElement;
  var ruhe = function () { setTimeout(function () { H.classList.add('cg-ruhig'); }, 2400); };
  if (H.classList.contains('auftakt-da') || !H.classList.contains('auftakt')) ruhe();
  else new MutationObserver(function (m, o) { if (H.classList.contains('auftakt-da')) { o.disconnect(); ruhe(); } }).observe(H, { attributes: true, attributeFilter: ['class'] });
  var farbe = false;
  new MutationObserver(function (m, o) {
    if (farbe || !document.querySelector('#gst:not([hidden]) .gst-farben')) return;
    farbe = true; o.disconnect();
    H.classList.add('cg-farben-erst');
    setTimeout(function () { H.classList.remove('cg-farben-erst'); }, 2000);
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
})();
