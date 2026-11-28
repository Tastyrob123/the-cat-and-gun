/* Menus & price lists · The Cat & Gun — Seitenleiste wie bei Edit website (Robert 27.11.2026), eine Stelle für das Werkzeug, die Anleitung und die Prüfseite.
   Aufbau wie maison/dash.css .dx-rail.dx-lack6 und bureau (dash-eigen.css): Wortmarke, Werkzeuge 1–8 mit Nummernkasten, Zeichen, Titel und Untertitel,
   Öffnungszeit und Telefon, Fussblock mit fünf Einträgen. Texte der Werkzeuge wie im Control panel (maison/index.html), Wege aus dem Kleid (WO_HAUS).
   mitfahren(): wie Sticker editor neu.js › mitfahren (runter bis das Ende unten steht, hoch bis der Anfang oben steht; passt sie, steht sie oben fest), ab 1200 px. */
(function () {
  'use strict';
  var IC = {
    web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18"/>',
    menu: '<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 0-3 3-3 7h3v11"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>',
    buch: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.8-1.8 0-1.3-1-1.6-1-2.6 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    sticker: '<path d="M15 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6l9-9V9a6 6 0 0 0-6-6Z"/><path d="M12 21v-4a5 5 0 0 1 5-5h4"/>',
    druck: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
    besuch: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    uhr: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    tel: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    haus: '<path d="M3 11 12 4l9 7v9H3z"/><path d="M9 20v-6h6v6"/>',
    auge: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    schild: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4"/>',
    guide: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/>'
  };
  var ic = function (n) { return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + (IC[n] || '') + '</svg>'; };
  var h = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var RAIL = [['website', 'Website', 'Texts, photos, opening hours', 'web'], ['karten', 'Menus', 'Food and drinks with prices', 'menu'], ['gaeste', 'Guests', 'Guest questions and the chat', 'chat'],
    ['marke', 'Brand book', 'Logo, colours, fonts, photos', 'buch'], ['editor', 'Brand editor', 'Keeping the brand book up to date', 'palette'], ['sticker', 'Stickers', 'Stickers with the logo', 'sticker'],
    ['druck', 'Print & feed', 'Signs, coasters, posts', 'druck'], ['besuche', 'Visitors', 'Visits to the website', 'besuch']];
  var GUIDES = 'https://tastyrob123.github.io/the-cat-and-gun/schulung/akademie/';
  var LOOK = '/the-cat-and-gun/haus/_werkzeuge/carte/look/';
  /* o: { wege: {schlüssel: url|''}, menus: Untertitel von Menus, imWerkzeug: true im Werkzeug selbst, rot: Prüfung meldet etwas, name, stube } */
  function html(o) {
    var w = o.wege || {}, name = o.name || 'Menus & price lists', stube = o.stube || 'Control panel', z = w.zentrale || '';
    var zeile = function (r, n) {
      var k = r[0], eigen = k === 'karten', inn = '<kbd>' + (n + 1) + '</kbd>' + ic(r[3]) + '<span><b>' + h(r[1]) + '</b><i>' + h(eigen && o.menus ? o.menus : r[2]) + '</i></span>';
      if (eigen) return o.imWerkzeug ? '<a class="jetzt" href="#uebersicht" data-akt="ueber" data-taste="' + (n + 1) + '" aria-current="page">' + inn + '</a>'
        : '<a class="jetzt" href="/the-cat-and-gun/haus/_werkzeuge/carte/" data-taste="' + (n + 1) + '">' + inn + '</a>';
      return w[k] ? '<a href="' + h(w[k]) + '" data-taste="' + (n + 1) + '">' + inn + '</a>' : '<span class="wo-aus" title="Not running on this computer" data-taste="' + (n + 1) + '">' + inn + '</span>';
    };
    var tour = o.imWerkzeug ? '<a href="?rundgang" data-akt="rundgang">' : '<a href="/the-cat-and-gun/haus/_werkzeuge/carte/?rundgang">';
    var check = o.imWerkzeug ? '<a href="/the-cat-and-gun/haus/_werkzeuge/carte/pruefung.html" data-akt="gesund" class="zustand' + (o.rot ? ' rot' : '') + '">' : '<a href="/the-cat-and-gun/haus/_werkzeuge/carte/pruefung.html" class="zustand' + (o.rot ? ' rot' : '') + '">';
    return '<div class="s6rahmen"><div class="marke"><a ' + (z ? 'href="' + h(z) + '"' : '') + ' title="' + h(stube) + '"><img src="' + LOOK + 'wortmarke-weiss.svg" alt="The Cat &amp; Gun · ' + h(stube) + '"></a><span class="mono">Catangnan, Siargao</span></div>'
      + '<div class="mono rk">Tools <span>keys 1–8</span></div><nav aria-label="Tools of the house">' + RAIL.map(zeile).join('') + '</nav>'
      + '<div class="rhaus"><span>' + ic('uhr') + 'Open daily 7AM – 10PM</span><span>' + ic('tel') + '+63 962 040 3853</span></div>'
      + '<div class="rfuss">'
      + (z ? '<a href="' + h(z) + '">' : '<span class="wo-aus" title="Not running on this computer">') + ic('haus') + '<span><b>' + h(stube) + '</b><i>All tools of the house</i></span>' + (z ? '</a>' : '</span>')
      + '<a href="/the-cat-and-gun/haus/_werkzeuge/carte/anleitung.html"' + (o.imWerkzeug ? ' target="_blank" rel="noopener"' : '') + '>' + ic('buch') + '<span><b>Guide</b><i>How ' + h(name) + ' works</i></span></a>'
      + tour + ic('auge') + '<span><b>Short tour</b><i>What is where in this tool</i></span></a>'
      + check + ic('schild') + '<span><b>Checks</b><i>' + (o.rot ? 'Something needs a look' : 'Is everything working?') + '</i></span></a>'
      + '<a href="' + GUIDES + '" target="_blank" rel="noopener">' + ic('guide') + '<span><b>Guides</b><i>11 videos</i></span></a>'
      + '</div></div>';
  }
  function mitfahren(rail) {
    if (!rail || rail.dataset.nlFahrt) return; rail.dataset.nlFahrt = '1';
    var y = null, letzt = 0, RAND = 22;
    function setze() {
      if (innerWidth < 1200 || !rail.offsetHeight) { rail.style.removeProperty('top'); y = null; return; }
      var m = RAND, hh = rail.offsetHeight, H = innerHeight, unten = Math.min(m, H - hh - m), p = scrollY;
      if (y === null) { y = m; letzt = p; }
      y = Math.max(unten, Math.min(m, y - (p - letzt))); letzt = p;
      rail.style.setProperty('top', y + 'px', 'important');
    }
    addEventListener('scroll', setze, { passive: true });
    addEventListener('resize', setze);
    if ('ResizeObserver' in window) new ResizeObserver(setze).observe(rail);
    setze();
  }
  /* Anleitung und Prüfseite: Leiste selbst zeichnen (Wege: lokal nur zu Werkzeugen, die antworten, wie im Werkzeug; Menus mit dem Stand der drei Karten) */
  function seite() {
    var el = document.getElementById('rand'); if (!el) return;
    var H = window.WO_HAUS || {}, N = H.namen || {}, wege = {}, lokal = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
    Object.keys(H.wege || {}).forEach(function (k) { if (k !== 'karten') wege[k] = lokal ? '' : (H.wege[k] || ''); });
    var o = { wege: wege, name: N.karten, stube: N.zentrale };
    var zeichne = function () { el.innerHTML = html(o); mitfahren(el); };
    zeichne();
    var api = function (w) { return fetch('/the-cat-and-gun/haus/_werkzeuge/carte/api/' + w, { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); };
    Promise.all([lokal ? api('wege') : Promise.resolve(null), api('status'), api('gesund')]).then(function (a) {
      if (a[0]) Object.keys(a[0]).forEach(function (k) { wege[k] = a[0][k] || ''; });
      var l = a[1] && a[1].karten;
      if (l && l.length) { var live = l.filter(function (k) { return k.live || k.pdf_zeit; }).length, ent = l.filter(function (k) { return k.entwurf; }).length;
        o.menus = ent ? ent + (ent === 1 ? ' draft' : ' drafts') + ' waiting' : live === l.length ? l.length + ' menus, all published' : !live ? l.length + ' menus, not published yet' : live + ' of ' + l.length + ' menus published'; }
      if (a[2]) o.rot = !a[2].ok;
      zeichne();
    });
  }
  window.CG_LEISTE = { html: html, mitfahren: mitfahren };
  if (document.body && document.body.classList.contains('anl')) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', seite); else seite(); }
})();
