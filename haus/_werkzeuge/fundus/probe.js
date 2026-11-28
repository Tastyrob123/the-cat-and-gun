/* probe.js · Musterseite des Markenfundus: liest über fundus.js, zeichnet Farben, Schriften, Elemente und Sätze, zeichnet neu bei jeder Änderung im Editor. */
'use strict';
(function () {
  var ENTWURF = /[?&]entwurf\b/.test(location.search);
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function zeichne(d) {
    $('#art').textContent = ENTWURF ? 'Draft (saved, not yet published)' : 'Published version';
    $('#kennung').textContent = 'Version ' + (d.kennung || 'as built');
    document.body.setAttribute('data-kennung', d.kennung || '');
    $('#welten').innerHTML = Fundus.welten().map(function (w) {
      return '<div class="welt" data-welt="' + esc(w.id) + '"><h3>' + esc(w.name) + '</h3><ul>' + Fundus.farben({ welt: w.id }).map(function (f) {
        return '<li data-farbe="' + esc(f.id) + '" data-wert="' + esc(f.wert) + '"><i style="background:' + esc(f.wert) + '"></i><b>' + esc(f.name) + '</b><span>' + esc(f.wert.toUpperCase()) + '</span></li>';
      }).join('') + '</ul></div>';
    }).join('');
    Fundus.schriftenLaden();
    $('#schriften').innerHTML = (d.rollen || []).map(function (r) {
      var s = Fundus.rolle(r.id); if (!s) return '';
      return '<div class="schrift" data-rolle="' + esc(r.id) + '" data-schrift="' + esc(s.id) + '"><span class="mono">' + esc(r.name) + ' · ' + esc(s.name) + '</span><p style="font-family:\'' + esc(String(s.familie || s.name).replace(/['"\\<>]/g, '')) + '\'">' + esc(s.probe || 'The Cat & Gun') + '</p></div>';
    }).join('');
    var el = $('#elemente'); el.innerHTML = '';
    Fundus.elemente().forEach(function (e) {
      var f = document.createElement('figure'); f.setAttribute('data-element', e.id);
      f.innerHTML = '<div class="bild"></div><figcaption>' + esc(e.name) + '</figcaption>'; el.appendChild(f);
      Fundus.element(e.id).then(function (svg) { f.querySelector('.bild').innerHTML = svg.replace(/ width="[^"]*" height="[^"]*"/, ''); }, function () { f.querySelector('.bild').textContent = e.name; });
    });
    $('#texte').innerHTML = Fundus.texte().map(function (x) { return '<div data-text="' + esc(x.id) + '"><dt>' + esc(x.titel) + '</dt><dd>' + esc(x.text) + '</dd></div>'; }).join('');
    reihen(); auftritte();
  }
  /* volle Reihen wie im Brand book editor: so viele Spalten, wie Karten Platz haben, Reihen gleichmässig gefüllt, jede über die ganze Breite */
  function reihen() {
    [].forEach.call(document.querySelectorAll('.welt ul, .elemente'), function (c) {
      var kids = [].slice.call(c.children), w = c.clientWidth; if (!kids.length || !w) return;
      c.classList.add('voll');
      var n = kids.length, platz = Math.max(1, Math.floor((w + 10) / 160)), r = Math.ceil(n / Math.min(n, platz)), q = Math.floor(n / r), rest = n % r, L = rest ? q * (q + 1) : q, i = 0;
      c.style.setProperty('--sp', L);
      for (var z = 0; z < r; z++) { var k = z < rest ? q + 1 : q; for (var j = 0; j < k; j++) kids[i++].style.gridColumn = 'span ' + (L / k); }
    });
  }
  /* was unter dem ersten Bild steht, federt beim Hereinscrollen an seinen Platz (nur transform) */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('da'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px' }) : null;
  function auftritte() {
    if (!io) return;
    [].forEach.call(document.querySelectorAll('.welt, .schrift, .elemente figure, .texte>div'), function (x) {
      if (x.classList.contains('auf')) return;
      if (x.getBoundingClientRect().top > innerHeight) { x.classList.add('auf'); io.observe(x); }
    });
  }
  var uhr; addEventListener('resize', function () { clearTimeout(uhr); uhr = setTimeout(reihen, 120); });
  Fundus.laden({ entwurf: ENTWURF }).then(zeichne, function (e) { document.querySelector('main').innerHTML = '<p>The brand collection could not be loaded (' + esc(e.message) + ').</p>'; });
  Fundus.beiAenderung(function (d, art) { if (ENTWURF || art !== 'entwurf') zeichne(d); });
})();
