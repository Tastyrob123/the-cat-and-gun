/* Sticker editor · Hausschicht The Cat & Gun: aus der Vorlage übernommen (Culinarium Hannover imprimerie/haeuser/culinarium/oberflaeche.js
   und buehne.js, zusammengelegt). Legt an, was in allen Werkzeugen des Hauses gleich ist (gemeinsames Kleid _werkzeuge/oberflaeche):
   Marke im Kopf (Zeichen «&», Name in der Titelschrift, Unterzeile), runder Knopf zurück zum Control panel, «View website» als Pille,
   Startbild der Übersicht («voll», Foto des Hauses im Rundbogen) und jeder Ansicht («buehne»). Ids und Handler bleiben, Knoten werden nur umgehängt.
   Dazu der Grund der Arbeitsfläche nach dem Sticker (dunkler Sticker → helle Fläche, sonst dunkel; Vorlage grundPruefen). */
(function () {
  if (!window.WO) return;
  var FOTO = { msArten: 'b09', msGalerie: 'b08', msDruck: 'b29', msElemente: 'b35', msFarben: 'b27', msDetail: 'b19' };
  var WEBSITE = /^(127\.0\.0\.1|localhost)$/.test(location.hostname) ? '/website/' : '/';   // lokal liefert der eigene Server (:9734) die Website des Hauses unter /website/ aus, online liegt sie in der Wurzel
  var ZENTRALE = (WO_HAUS.wege && WO_HAUS.wege.zentrale) || '/the-cat-and-gun/haus/_werkzeuge/maison/';
  var HAUS = '<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>';
  var MARKE = function () { return WO.zeichen() + '<span><b>' + WO.esc(WO.name('sticker')) + '</b><small>Stickers · ' + WO.esc(WO.haus.name) + '</small></span>'; };

  function koepfe() {
    var mk = document.getElementById('kopfMarke');
    if (mk && !mk.__wo) {
      mk.__wo = 1; mk.classList.add('wo-marke-w');
      var alt = document.createElement('span'); alt.className = 'ws-alt'; alt.hidden = true;
      while (mk.firstChild) alt.appendChild(mk.firstChild);
      mk.innerHTML = MARKE(); mk.appendChild(alt);
    }
    var ms = document.querySelector('.ms-kopf');
    if (ms && !ms.__wo) {
      var z = ms.querySelector('#msKopfZeichen'), n = ms.querySelector('.ms-kopf-name');
      if (z && n) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'wo-marke-w ws-marke'; b.setAttribute('data-ansicht', 'start'); b.setAttribute('aria-label', WO.name('sticker') + ', overview');
        b.innerHTML = MARKE(); ms.insertBefore(b, z); z.hidden = true; n.hidden = true; ms.__wo = 1;
      }
      var neu = ms.querySelector('.ms-kn-neu');
      var zk = document.createElement('a'); zk.className = 'rund ms-rund zur-maison ws-rund'; zk.href = ZENTRALE; zk.setAttribute('aria-label', 'Back to the ' + WO.name('zentrale')); zk.setAttribute('data-tip', WO.name('zentrale')); zk.innerHTML = HAUS;
      ms.insertBefore(zk, ms.querySelector('.ms-pruef'));
      var pille = document.createElement('span'); pille.innerHTML = WO.knopf('View website', 'welt', 'gold', { href: WEBSITE, neu: true, klein: true, klasse: 'ws-web' });
      ms.insertBefore(pille.firstChild, neu ? neu.nextSibling : null);
    }
    var e = document.querySelector('.kopf__werk');
    if (e && !e.querySelector('.zur-maison')) {
      var a = document.createElement('a'); a.className = 'rund zur-maison'; a.href = ZENTRALE; a.setAttribute('aria-label', 'Back to the ' + WO.name('zentrale')); a.setAttribute('data-tip', WO.name('zentrale')); a.innerHTML = HAUS;
      e.insertBefore(a, document.getElementById('btnNeu'));
    }
    [].forEach.call(document.querySelectorAll('.ms-kopf .rund, .kopf__werk .rund'), function (r) { r.classList.add('ws-rund'); });
  }
  /* Startbild der Übersicht: WO.startbild «voll»; Gruss, Satz und Knöpfe bleiben dieselben Knoten (start.js schreibt sie) */
  function startbild() {
    var g = document.querySelector('#msStart .ms-gruss');
    if (!g || g.__wo) return; g.__wo = 1;
    var h = document.getElementById('msGruss'), s = document.getElementById('msSatz');
    var hilf = document.createElement('div');
    hilf.innerHTML = WO.startbild({ werkzeug: 'sticker', art: 'voll', h1: ' ', satz: ' ', knoepfe: ' ' });
    var sb = hilf.firstChild; sb.classList.add('ws-sb');
    if (h) { h.classList.add('wo-sb__h'); sb.querySelector('.wo-sb__h').replaceWith(h); }
    if (s) { s.classList.add('wo-sb__satz'); sb.querySelector('.wo-sb__satz').replaceWith(s); }
    var kn = sb.querySelector('.wo-sb__kn'); kn.textContent = '';
    [].slice.call(g.querySelectorAll(':scope>.sk-startknoepfe, :scope>#msAlle')).forEach(function (x) { kn.appendChild(x); });
    g.replaceWith(sb);
  }
  /* Bühne jeder Ansicht: die Titelzeile (.ms-titel) wird WO.startbild «buehne» mit einem Foto des Hauses */
  function buehnen() {
    [].forEach.call(document.querySelectorAll('#start .ms-titel'), function (t) {
      if (t.__wo) return; t.__wo = 1;
      var v = t.closest('[id^="ms"]'), h1 = t.querySelector('h1'), satz = t.querySelector('.ms-leise');
      var hilf = document.createElement('div'), fn = FOTO[v && v.id] || 'b24';
      hilf.innerHTML = WO.startbild({ werkzeug: 'sticker', art: 'buehne', h1: ' ', satz: satz ? ' ' : '', foto: '/the-cat-and-gun/haus/assets/bild/' + fn + '-800.webp' });
      var sb = hilf.firstChild; sb.classList.add('ws-sb');
      [].forEach.call(sb.querySelectorAll('img'), function (i) { i.loading = 'eager'; });   /* Bilder sofort da (Fehlerbuch 10a) */
      if (h1) { h1.classList.add('wo-sb__h'); sb.querySelector('.wo-sb__h').replaceWith(h1); }
      if (satz) { satz.classList.add('wo-sb__satz'); sb.querySelector('.wo-sb__satz').replaceWith(satz); }
      [].slice.call(t.children).forEach(function (x) { sb.querySelector('.wo-sb__text').appendChild(x); });
      t.textContent = ''; t.appendChild(sb); t.classList.add('ws-titel');
    });
    var neu = document.getElementById('msNeu');
    if (neu && !neu.__wo) {
      neu.__wo = 1;
      var h1 = neu.querySelector(':scope>h1'), sz = neu.querySelector(':scope>.start__satz'), hilf = document.createElement('div');
      hilf.innerHTML = WO.startbild({ werkzeug: 'sticker', art: 'buehne', h1: ' ', satz: ' ', foto: '/the-cat-and-gun/haus/assets/bild/b36-800.webp' });
      var sb = hilf.firstChild; sb.classList.add('ws-sb');
      h1.classList.add('wo-sb__h'); sb.querySelector('.wo-sb__h').replaceWith(h1);
      sz.classList.add('wo-sb__satz'); sb.querySelector('.wo-sb__satz').replaceWith(sz);
      var t = document.createElement('div'); t.className = 'ms-titel ws-titel'; t.__wo = 1; t.appendChild(sb); neu.insertBefore(t, neu.firstChild);
    }
  }
  /* Grund der Arbeitsfläche: dunkler Sticker → helle Fläche */
  var prueft = 0;
  function grundPruefen() {
    prueft = 0;
    var fl = document.getElementById('flaeche'), d = window.SKEditor && SKEditor.doc(); if (!fl || !d) return;
    var g = d.ebenen.find(function (e) { return e.grund; }), k = g && SK.teileVon(g.roh)[0];
    var w = k ? SK.farbWert((g.teile && g.teile[k.k]) || { f: k.k }) : '#ffffff', n = parseInt(w.slice(1), 16);
    var l = (0.2126 * (n >> 16) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255)) / 255;
    fl.classList.toggle('flaeche--hell', l < 0.4);
  }
  function grundBald() { if (!prueft) prueft = setTimeout(grundPruefen, 120); }
  function alles() { koepfe(); }   /* Startbild und Bühnen baut seit dem neuen Look (26.11.2026) neu.js als Kopfkarten der Vorlage */
  function los() {
    /* helle Farbwelt entfällt mit dem neuen Look (26.11.2026) */
    alles();
    var lauf = 0, st = document.getElementById('start');
    new MutationObserver(function () { if (lauf) return; lauf = 1; try { alles(); } finally { lauf = 0; } }).observe(st || document.body, { childList: true, subtree: true });
    var w = document.getElementById('wirt'); if (w) new MutationObserver(grundBald).observe(w, { childList: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
