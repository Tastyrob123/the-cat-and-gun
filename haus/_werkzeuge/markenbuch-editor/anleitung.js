/* Guide · Brand book editor · Bild gross: Klick macht das Bild gross, ein zweiter Klick oder Esc schliesst (eigene Datei, keine eingebetteten Skripte, wie die Vorlage).
   Dazu: führt «What to do?» auf eine Meldung ohne eigenen Absatz (#lex-…), springt die Seite zu «Help». */
'use strict';
(function () {
  var g = document.getElementById('gross'), im = g.querySelector('img');
  function zu() { g.hidden = true; }
  document.addEventListener('click', function (e) { var b = e.target.closest('.bild'); if (b) { im.src = b.querySelector('img').src; im.alt = b.querySelector('img').alt; g.hidden = false; } else if (e.target.closest('#gross')) zu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zu(); });
  function ziel() { var h = location.hash.slice(1); if (/^lex-/.test(h) && !document.getElementById(h)) location.replace('#hilfe'); }
  ziel(); addEventListener('hashchange', ziel);
})();
