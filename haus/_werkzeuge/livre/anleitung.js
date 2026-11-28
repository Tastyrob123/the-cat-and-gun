/* Guide · Brand book The Cat & Gun (Kopie aus der Vorlage) · Bild gross: Klick macht das Bild gross, ein zweiter Klick oder Esc schliesst (eigene Datei, keine eingebetteten Skripte, Falle 9). */
'use strict';
(function () {
  var g = document.getElementById('gross'), im = g.querySelector('img');
  function zu() { g.hidden = true; }
  document.addEventListener('click', function (e) { var b = e.target.closest('.bild'); if (b) { im.src = b.querySelector('img').src; im.alt = b.querySelector('img').alt; g.hidden = false; } else if (e.target.closest('#gross')) zu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zu(); });
})();

/* Auftritte (Effekte-Standard, Robert 23.11.2026; Vorbild Schlössli livre.js auftritte()): Inhaltskarten und Kapitel unter dem ersten Bildschirm schweben beim
   Hereinscrollen an ihren Platz, was gemeinsam kommt gestaffelt (höchstens vier). Was beim Öffnen im Bild steht, kommt gestaffelt von unten. Einmal, kein Rücksprung. */
(function () {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var teile = [].slice.call(document.querySelectorAll('.thema, .kap__t, .kap__b'));
  document.documentElement.classList.add('an');
  var H = innerHeight, n = 0;
  var io = new IntersectionObserver(function (es) { var k = 0; es.forEach(function (e) { if (!e.isIntersecting) return; io.unobserve(e.target); e.target.style.setProperty('--k', Math.min(k++, 3)); e.target.classList.remove('kommt'); e.target.classList.add('da'); }); }, { rootMargin: '0px 0px 40px 0px' });
  teile.forEach(function (x) {
    var b = x.getBoundingClientRect();
    if (b.top < H && b.bottom > 0) { x.style.setProperty('--k', Math.min(n++, 3)); x.classList.add('da'); }
    else if (b.top >= H) { x.classList.add('kommt'); io.observe(x); }
  });
})();
