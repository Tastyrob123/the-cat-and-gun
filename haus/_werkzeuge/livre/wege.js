/* Brand book · Wege zu den anderen Werkzeugen (Prüfung 23.11.2026, A1 Punkt 19: Knöpfe führten ins Leere, wenn ein anderes Werkzeug nicht lief).
   Läuft direkt nach kleid/catgun.js. Lokal zeigen die Knöpfe auf /the-cat-and-gun/haus/_werkzeuge/<werkzeug>/ dieses Servers: server.py leitet zum Prüfserver des
   Werkzeugs weiter, wenn er antwortet, sonst zeigt er eine ruhige Seite «… is not open on this computer». Online sind die Wege ohnehin relativ. */
(function () {
  var H = window.WO_HAUS;
  if (!H || !H.wegeLokal || !H.wege) return;
  Object.keys(H.wege).forEach(function (k) { H.wege[k] = String(H.wege[k]).replace(/^http:\/\/127\.0\.0\.1:\d+/, ''); });
})();
