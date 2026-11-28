/* Seitenleiste von Guests (Robert 27.11.2026): sieht aus wie die Leiste von Edit website (bureau, «dx-rail dx-lack6», 280 px) und fährt beim Scrollen mit.
   Eine Quelle für das Werkzeug (reception.js) und für Anleitung und Prüfseite. Im Werkzeug baut reception.js sie mit NL_LEISTE.html();
   auf Anleitung und Prüfseite füllt sie sich selbst (<aside id="rand" class="nl-rail" data-nl-selbst>) mit dem Stand aus api/ueberblick und api/wissen. */
(function () {
  'use strict';
  var I = {
    web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18"/>',
    menu: '<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 0-3 3-3 7h3v11"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>',
    buch: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.8-1.8 0-1.3-1-1.6-1-2.6 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    sticker: '<path d="M15 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6l9-9V9a6 6 0 0 0-6-6Z"/><path d="M12 21v-4a5 5 0 0 1 5-5h4"/>',
    druck: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
    besuch: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    guide: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/>',
    haus: '<path d="M3 11 12 4l9 7v9H3z"/><path d="M9 20v-6h6v6"/>',
    uhr: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    tel: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    auge: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    check: '<path d="m5 12 4 4 10-10"/>',
    karte: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>'
  };
  function ic(n) { return '<svg class="nl-ico" viewBox="0 0 24 24" aria-hidden="true">' + (I[n] || '') + '</svg>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function mal(n, eins, viele) { return n === 1 ? eins : n + ' ' + viele; }
  /* Die acht Werkzeuge wie in der Seitenleiste des Control panels (Reihenfolge, Namen, Zeilen darunter, Symbole aus maison/index.html) */
  var LISTE = [['website', 'Website', 'Texts, photos, opening hours', 'web', '/the-cat-and-gun/haus/_werkzeuge/bureau/'], ['karten', 'Menus', 'Food and drinks with prices', 'menu', '/the-cat-and-gun/haus/_werkzeuge/carte/'],
    ['gaeste', 'Guests', '', 'chat', ''], ['marke', 'Brand book', 'Logo, colours, fonts, photos', 'buch', '/the-cat-and-gun/haus/_werkzeuge/livre/'],
    ['markeneditor', 'Brand editor', 'Keeping the brand book up to date', 'palette', '/the-cat-and-gun/haus/_werkzeuge/markenbuch-editor/'], ['sticker', 'Stickers', 'Stickers with the logo', 'sticker', '/the-cat-and-gun/haus/_werkzeuge/sticker/'],
    ['druck', 'Print & feed', 'Signs, coasters, posts', 'druck', '/the-cat-and-gun/haus/_werkzeuge/imprimerie/'], ['besuche', 'Visitors', 'Visits to the website', 'besuch', '/the-cat-and-gun/haus/_werkzeuge/registre/']];
  var AKADEMIE = 'https://tastyrob123.github.io/the-cat-and-gun/schulung/akademie/';
  function lokal() { return /^(127\.0\.0\.1|localhost|\[::1\])$/.test(location.hostname); }
  function weg(k, pfad) {
    var H = window.WO_HAUS || {}, W = H.wege || {}, P = H.ports || {};
    if (W[k]) return W[k];
    return lokal() && P[k] ? 'http://127.0.0.1:' + P[k] + pfad : pfad;
  }
  function stube() { var P = (window.WO_HAUS || {}).ports || {}; if (/\/_werkzeuge\//.test(location.pathname) && !lokal()) return '../maison/'; return /\/_werkzeuge\//.test(location.pathname) && P.zentrale ? 'http://127.0.0.1:' + P.zentrale + '/the-cat-and-gun/haus/_werkzeuge/maison/' : '/maison/'; }
  function zname() { return window.WO && WO.name ? WO.name('zentrale') : 'Control panel'; }
  function fakt(W, fid) {
    var bs = (W && W.steckbrief) || [];
    for (var i = 0; i < bs.length; i++) for (var j = 0; j < bs[i].gruppen.length; j++) { var zs = bs[i].gruppen[j].zeilen; for (var k = 0; k < zs.length; k++) if (zs[k].fid === fid) { var t = (W.team || {})[fid]; return t && t.angabe ? t.angabe : zs[k].angabe; } }
    return '';
  }
  /* o: { ue, wissen, imWerkzeug } · im Werkzeug führt «Guests» zur Übersicht und «Try the chat» öffnet das Fenster, sonst sind beides Wege ins Werkzeug */
  function html(o) {
    var u = o.ue || {}, imW = !!o.imWerkzeug, S = stube(), n = u.anfragen_offen || 0;
    var rows = LISTE.map(function (x, i) {
      if (x[0] === 'gaeste') return '<a class="nl-jetzt" href="' + (imW ? '#start" data-gehe="start' : './') + '" aria-current="page"><kbd>' + (i + 1) + '</kbd>' + ic(x[3]) + '<span><b>Guests</b><i>' +
        (o.ue ? mal(u.anfragen_gesamt || 0, 'One inquiry', 'inquiries') + ' · ' + mal(u.fragen_gesamt || 0, 'one question', 'questions') : 'Guest questions and the chat') + '</i></span>' + (n ? '<em>' + n + '</em>' : '') + '</a>';
      return '<a href="' + esc(weg(x[0], x[4])) + '" data-taste="' + (i + 1) + '"><kbd>' + (i + 1) + '</kbd>' + ic(x[3]) + '<span><b>' + esc(x[1]) + '</b><i>' + esc(x[2]) + '</i></span></a>';
    }).join('');
    var z = fakt(o.wissen, 'zeiten'), tel = ((o.wissen || {}).kontakt || {}).telefon;
    var haus = (z ? '<span>' + ic('uhr') + esc(String(z).replace(/\.$/, '')) + '</span>' : '') + (tel ? '<span>' + ic('tel') + esc(tel).replace(/ /g, ' ') + '</span>' : '');
    var f = function (href, ico, b, i, extra) { return '<a href="' + href + '"' + (extra || '') + '>' + ic(ico) + '<span><b>' + b + '</b><i>' + i + '</i></span></a>'; };
    return '<div class="nl-s6">' +
      '<div class="nl-marke"><a href="' + S + '" title="' + esc(zname()) + '"><img src="neu/wortmarke-weiss.svg" alt="The Cat &amp; Gun · ' + esc(zname()) + '" width="118" height="101"></a><span class="nl-mono">Catangnan, Siargao</span></div>' +
      '<div class="nl-mono nl-rk">Tools <span>keys 1–8</span></div><nav aria-label="Tools of the house">' + rows + '</nav>' +
      '<div class="nl-rhaus"' + (haus ? '' : ' hidden') + '>' + haus + '</div>' +
      '<div class="nl-rfuss wo-rand__wege">' +
        f(S, 'haus', esc(zname()), 'All tools of the house') +
        (imW ? '<button type="button" data-probe>' + ic('chat') + '<span><b>Try the chat</b><i>With your draft</i></span></button>' : f('./?probe#start', 'chat', 'Try the chat', 'With your draft')) +
        f('chat/probe.html', 'web', 'The chat as on the website', 'Test page, opens a new tab', ' target="_blank" rel="noopener"') +
        f('/the-cat-and-gun/haus/index.html', 'auge', 'View website', 'Opens a new tab', ' target="_blank" rel="noopener"') +
        f('anleitung.html', 'buch', 'Guide', 'How Guests works', /anleitung\.html$/.test(location.pathname) ? ' aria-current="page"' : '') +
        f('./?rundgang#start', 'karte', 'Short tour', 'What is where in this tool', ' class="rdg-wieder"') +
        f('pruefung.html', 'check', 'Checks', 'Is everything working?', /pruefung\.html$/.test(location.pathname) ? ' aria-current="page"' : '') +
        f(AKADEMIE, 'guide', 'Guides', '11 videos', ' target="_blank" rel="noopener"') +
      '</div></div>';
  }
  /* Fährt mit (Vorlage: Sticker editor neu.js «mitfahren», Robert 27.11.2026): höher als das Fenster → scrollt mit, bis ihr unteres Ende am Fensterrand steht, und bleibt dort;
     beim Hochscrollen fährt sie mit zurück, bis ihr oberes Ende wieder oben steht. Passt sie ganz ins Fenster, steht sie oben fest. Ab 1200 px, darunter bleibt alles wie es ist. */
  function mitfahren(rail) {
    if (!rail || rail.dataset.nlFahrt) return; rail.dataset.nlFahrt = '1';
    var y = null, letzt = 0;
    var rand = function () { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nl-rand')) || 35; };
    function setze() {
      if (innerWidth < 1200 || !rail.offsetHeight) { rail.style.removeProperty('top'); y = null; return; }
      var m = rand(), h = rail.offsetHeight, H = innerHeight, unten = Math.min(m, H - h - 22), p = scrollY;   /* unten 22 px Luft wie Edit website (gemessen 27.11.2026) */
      if (y === null) { y = m; letzt = p; }
      y = Math.max(unten, Math.min(m, y - (p - letzt))); letzt = p;
      rail.style.setProperty('top', y + 'px', 'important');
    }
    addEventListener('scroll', setze, { passive: true });
    addEventListener('resize', setze);
    if (window.ResizeObserver) new ResizeObserver(setze).observe(rail);
    setze();
  }
  window.NL_LEISTE = { html: html, mitfahren: mitfahren };
  /* Anleitung und Prüfseite: selbst füllen */
  function selbst() {
    var a = document.querySelector('aside#rand[data-nl-selbst]'); if (!a) return;
    a.innerHTML = html({});
    mitfahren(a);
    var o = { cache: 'no-store' };
    Promise.all([fetch('api/ueberblick', o).then(function (r) { return r.ok ? r.json() : null; }), fetch('api/wissen', o).then(function (r) { return r.ok ? r.json() : null; })])
      .then(function (d) { if (d[0] || d[1]) a.innerHTML = html({ ue: d[0] || undefined, wissen: d[1] || undefined }); }).catch(function () { /* Leiste bleibt mit den festen Angaben */ });
    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey || !/^[1-8]$/.test(e.key) || (e.target && e.target.closest && e.target.closest('input,textarea,select,[contenteditable]'))) return;
      var l = a.querySelector('a[data-taste="' + e.key + '"][href]'); if (l) { e.preventDefault(); location.href = l.href; } else if (e.key === '3') { e.preventDefault(); location.href = './'; }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', selbst); else selbst();
})();
