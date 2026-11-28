/* pruefung-haus.js · Prüfseite im Rahmen von The Cat & Gun (22.11.2026, Kopie der Vorlage Culinarium): Name des Werkzeugs aus der einen Stelle, «Zum Werkzeug» führt in dieses Werkzeug, nicht in den Stamm. */
(function () {
  var z = document.getElementById('wsp-zurueck'); if (z) z.href = '/the-cat-and-gun/haus/_werkzeuge/bureau/';
  var n = window.WO_HAUS && WO_HAUS.namen && WO_HAUS.namen.website;
  if (n) { document.querySelectorAll('[data-werkzeug]').forEach(function (e) { e.textContent = n; }); document.title = 'Checks · ' + n + ' · ' + WO_HAUS.name; }
})();
/* Der Prüfteil «Termine» der Vorlage entfällt: The Cat & Gun hat keine Termine als Daten auf der Website (UEBERGABE-LIMIT.md, Entscheidungen). */
/* Neuer Look (26.11.2026): dieselbe Glasfläche wie das Werkzeug (dash.css über pruefung-haus.css) */
(function () {
  document.body.classList.add('dx-root', 'dx-t-glas');
  if (!document.querySelector('.dx-bg')) { var g = document.createElement('div'); g.className = 'dx-bg'; g.setAttribute('aria-hidden', 'true'); document.body.prepend(g); }
})();
