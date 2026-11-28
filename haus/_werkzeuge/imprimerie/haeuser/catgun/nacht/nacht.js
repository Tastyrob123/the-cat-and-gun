/* Print & feed · neuer Look des Control panels (Robert 26.11.2026: jedes Werkzeug komplett im Look der neuen Startseite).
   Vorlage: _entwurf-dashboard/print-bereich (Overview und geöffnete Vorlage), Bausteine runde2/stil.css + runde3/zusatz.css, Seitenleiste wie
   im echten Panel (maison, dx-rail dx-lack6). Diese Schicht hängt nur Knoten um und setzt die Seitenleiste dazu; Ids, Handler und Funktionen
   bleiben. Klicks laufen weiter über #start (start.js, Delegation). Entfernen = vorheriger Stand (nacht.css und diese Datei aus index.html nehmen). */
(function () {
  var start = document.getElementById('start'); if (!start) return;
  document.documentElement.classList.add('nacht');
  var W = (window.WO_HAUS && WO_HAUS.wege) || {};
  var MAISON = W.zentrale || '../maison/';
  var SVG = function (p, c) { return '<svg class="' + (c || 'nl-ico') + '" viewBox="0 0 24 24" aria-hidden="true">' + p + '</svg>'; };
  /* Werkzeuge und Unterzeilen wie in der Seitenleiste des Panels (maison/index.html), Adressen aus dem Kleid (WO_HAUS.wege) */
  var TOOLS = [
    ['website', 'Website', 'Texts, photos, opening hours', '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18"/>'],
    ['karten', 'Menus', 'Food and drinks with prices', '<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 0-3 3-3 7h3v11"/>'],
    ['gaeste', 'Guests', 'Guest questions and the chat', '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>'],
    ['marke', 'Brand book', 'Logo, colours, fonts, photos', '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>'],
    ['markeneditor', 'Brand editor', 'Keeping the brand book up to date', '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.8-1.8 0-1.3-1-1.6-1-2.6 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>'],
    ['sticker', 'Stickers', 'Stickers with the logo', '<path d="M15 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6l9-9V9a6 6 0 0 0-6-6Z"/><path d="M12 21v-4a5 5 0 0 1 5-5h4"/>'],
    ['druck', 'Print & feed', 'Signs, coasters, posts', '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>'],
    ['besuche', 'Visitors', 'Visits to the website', '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>']
  ];
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var PFEIL = '<span class="nl-pf">' + SVG('<path d="M5 12h14m-6-6 6 6-6 6"/>', 'nl-pfi') + '</span>';

  function rail() {
    var leiste = start.querySelector('.ms-leiste'); if (!leiste || leiste.querySelector('.nl-rahmen')) return;
        var rows = TOOLS.map(function (t, i) {
      var jetzt = t[0] === 'druck';
      return '<a class="' + (jetzt ? 'nl-jetzt' : '') + '" href="' + esc(jetzt ? location.pathname : (W[t[0]] || '#')) + '"' + (jetzt ? ' aria-current="page"' : '') + '><kbd>' + (i + 1) + '</kbd>'
        + SVG(t[3]) + '<span><b>' + esc(t[1]) + '</b><i>' + esc(t[2]) + '</i></span></a>';
    }).join('');
    var r = document.createElement('div'); r.className = 'nl-rahmen';
    r.innerHTML = '<div class="nl-marke"><a href="' + esc(MAISON) + '" title="Control panel"><img src="haeuser/catgun/nacht/wortmarke-weiss.svg" alt="The Cat &amp; Gun · Control panel" decoding="sync"></a><span class="nl-mono">Catangnan, Siargao</span></div>'
      + '<div class="nl-mono nl-rk">Tools <span>keys 1–8</span></div><nav class="nl-tools" aria-label="Tools of the house">' + rows + '</nav>'
      + '<div class="nl-rhaus"></div><div class="nl-rfuss"></div>';
    leiste.insertBefore(r, leiste.firstChild);
    /* Fussblock wie bei Edit website: Control panel, Guide, Short tour, Checks, Guides. «Short tour» ist der Knopf #startHilfe des Werkzeugs (gleicher Knoten und Handler) */
    var fuss = r.querySelector('.nl-rfuss'), hilfe = document.getElementById('startHilfe');
    var a = function (href, ico, b, i, neu) { var x = document.createElement('a'); x.href = href; if (neu) { x.target = '_blank'; x.rel = 'noopener'; } x.innerHTML = SVG(ico) + '<span><b>' + b + '</b><i>' + i + '</i></span>'; fuss.appendChild(x); };
    a(MAISON, '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>', 'Control panel', 'All tools of the house');
    a('hilfe/', '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>', 'Guide', 'How Print &amp; feed works', true);
    if (hilfe) { hilfe.innerHTML = SVG('<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6M12 17.2v.1"/>') + '<span><b>Short tour</b><i>What is where in this tool</i></span>'; fuss.appendChild(hilfe); }
    a('pruefung.html', '<path d="M12 3 5 6v5c0 4.4 3 8.3 7 10 4-1.7 7-5.6 7-10V6z"/><path d="m9 12 2 2 4-4"/>', 'Checks', 'Is everything working?', true);
    a('https://tastyrob123.github.io/the-cat-and-gun/schulung/akademie/', '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/>', 'Guides', '11 videos', true);
  }

  /* Öffnungszeiten und Telefon aus den Daten des Hauses (DS.M, marke.json), sobald sie da sind */
  function rhaus() {
    var h = start.querySelector('.nl-rhaus'), M = window.DS && DS.M; if (!h || h.__nl || !M || !(M.zeiten || M.tel)) return; h.__nl = 1;
    h.innerHTML = (M.zeiten ? '<span>' + SVG('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>') + esc(/daily/i.test(M.zeiten) ? 'Open daily ' + M.zeiten.replace(/\s*daily\s*/i, '').replace(/\s*[–-]\s*/, ' – ') : 'Open ' + M.zeiten) + '</span>' : '')
      + (M.tel ? '<span>' + SVG('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>') + esc(M.tel) + '</span>' : '');
  }

  /* Reiter: die Ansichten des Werkzeugs (#msNav) stehen unten in der Kopfkachel der offenen Ansicht (Vorlage: .tabs in .wkopf).
     Kopfkacheln sind die Startbilder der Hausschicht (section.ws-sb, oberflaeche.js), sonst die Bühnen aus buehne.js (.ms-bue). */
  function sichtbar(e) { return !!(e && e.getClientRects().length); }
  function reiter() {
    var nav = document.getElementById('msNav'); if (!nav) return;
    nav.classList.add('nl-tabs');
    var ziel = null, b = start.querySelectorAll('.ms-haupt .ws-sb, .ms-haupt .ms-bue');
    for (var i = 0; i < b.length; i++) if (sichtbar(b[i])) { ziel = b[i]; break; }
    var haupt = start.querySelector('.ms-haupt');
    if (!ziel) { if (haupt && nav.parentNode !== haupt) haupt.insertBefore(nav, haupt.firstChild); nav.classList.add('nl-tabs--frei'); return; }
    nav.classList.remove('nl-tabs--frei');
    if (nav.parentNode !== ziel) ziel.appendChild(nav);
  }

  /* Übersicht: Titel und Satz der Vorlage («Print & feed», Satz aus funktionen.json wie im Entwurf); Gruss und Datum treten zurück.
     Darunter Suchfeld, Stand («See 55 ready templates …») und «Make something new» (Vorlage .wkst) */
  var KICK = SVG('<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>', 'nl-mi');
  function koepfe() {
    var sb = start.querySelector('#msStart .wo-sb--voll') || start.querySelector('#msStart .ms-gruss');
    if (!sb || sb.__nlStart) return;
    var tx = sb.querySelector('.wo-sb__text') || sb; sb.__nlStart = 1; sb.classList.add('nl-uebersicht');
    var t = document.createElement('h2'); t.className = 'nl-titel'; t.textContent = 'Print & feed';
    var p = document.createElement('p'); p.className = 'nl-satz';
    p.textContent = 'Signs, coasters, table cards, posters and Instagram posts from templates of the house. As PDF to print or as a picture. Without AI.';
    var h = document.getElementById('msGruss'); tx.insertBefore(t, h || tx.firstChild); tx.insertBefore(p, t.nextSibling);
    var st = document.createElement('div'); st.className = 'nl-wkst';
    var alle = document.getElementById('msAlle'), neu = start.querySelector('.ms-leiste .ms-kn-gold');
    if (alle) st.appendChild(alle);
    if (neu) { neu.classList.add('nl-wk', 'nl-gold'); st.appendChild(neu); }
    tx.appendChild(st);
  }

  /* Abschnittstitel (Vorlage .stitel): Zeichen der Ansicht im Kreis vor dem Titel */
  function titel() {
    var z = start.querySelectorAll('.ms-zeile');
    for (var i = 0; i < z.length; i++) {
      var r = z[i]; if (r.__nl) continue;
      var a = r.querySelector('[data-ansicht]'), h = r.querySelector('h2'); if (!h) continue;
      var nb = a && document.querySelector('#msNav [data-ansicht="' + a.dataset.ansicht + '"] svg');
      r.__nl = 1; var s = document.createElement('span'); s.className = 'nl-snr'; s.setAttribute('aria-hidden', 'true');
      s.innerHTML = nb ? nb.outerHTML : KICK; r.insertBefore(s, h);
    }
  }

  /* Editor: schmale Leiste der Vorlage (rail schmal, 72 px) mit Control panel und den Werkzeugen des Hauses */
  function schmal() {
    if (document.querySelector('.nl-schmal')) return;
    var r = document.createElement('aside'); r.className = 'nl-schmal'; r.setAttribute('aria-label', 'Tools of the house');
    r.innerHTML = '<a class="nl-et" href="' + esc(MAISON) + '" aria-label="Back to the control panel" data-tip="Control panel"><img src="haeuser/catgun/nacht/et-weiss.svg" alt=""></a><nav>'
      + TOOLS.map(function (t) { var j = t[0] === 'druck'; return '<a class="' + (j ? 'nl-jetzt' : '') + '" href="' + esc(j ? location.pathname : (W[t[0]] || '#')) + '" aria-label="' + esc(t[1]) + '" data-tip="' + esc(t[1]) + '"' + (j ? ' aria-current="page"' : '') + '>' + SVG(t[3]) + '</a>'; }).join('')
      + '</nav><a class="nl-unten" href="' + esc(MAISON) + '" aria-label="Control panel" data-tip="Control panel">' + SVG('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>') + '</a>';
    document.body.appendChild(r);
  }

  /* Mitfahren (Kopie aus Sticker editor neu.js, Robert 27.11.2026): runter, bis das Ende der Leiste unten steht, hoch, bis ihr Anfang oben steht;
     passt sie ganz ins Fenster, steht sie oben fest. Ab 1200 px, die Übersicht scrollt in .start__in */
  function mitfahren(rail, scroller) {
    if (!rail || rail.dataset.nlFahrt) return; rail.dataset.nlFahrt = '1';
    var y = null, letzt = 0;
    var UNTEN = 28;   // Abnahme 28.11.2026: am Seitenende steht die Leiste 28 px über dem Fensterrand wie bei Edit website (vorher 35 px)
    var rand = function () { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nl-rand')) || 22; };
    var pos = function () { return scroller === window ? scrollY : scroller.scrollTop; };
    function setze() {
      if (innerWidth < 1200 || !rail.offsetHeight) { rail.style.removeProperty('top'); y = null; return; }
      var m = rand(), h = rail.offsetHeight, H = innerHeight, unten = Math.min(m, H - h - UNTEN), p = pos();
      if (y === null) { y = m; letzt = p; }
      y = Math.max(unten, Math.min(m, y - (p - letzt))); letzt = p;
      rail.style.setProperty('top', y + 'px', 'important');
    }
    (scroller === window ? window : scroller).addEventListener('scroll', setze, { passive: true });
    addEventListener('resize', setze);
    new ResizeObserver(setze).observe(rail);
    /* Abnahme 28.11.2026: in kurzen Ansichten («Released», wenige eigene Entwürfe) reicht der Scrollweg der Seite nicht bis zum Ende der Leiste; der Fussblock
       (Checks, Guides) blieb unter dem Fensterrand. Kann die Seite nicht weiter scrollen, fährt die Leiste unter dem Zeiger selbst weiter, in denselben Grenzen. */
    if (scroller !== window) rail.addEventListener('wheel', function (e) {
      if (innerWidth < 1200 || e.ctrlKey) return;
      var vor = scroller.scrollTop; scroller.scrollTop += e.deltaY; e.preventDefault();
      if (scroller.scrollTop === vor && y !== null && rail.offsetHeight) { var m = rand(), unten = Math.min(m, innerHeight - rail.offsetHeight - UNTEN); y = Math.max(unten, Math.min(m, y - e.deltaY)); rail.style.setProperty('top', y + 'px', 'important'); }
    }, { passive: false });
    setze();
  }

  /* Tasten 1–8 wie im Panel: nur auf der Übersicht, nie beim Schreiben, nie mit Zusatztaste */
  addEventListener('keydown', function (e) {
    if (start.hidden || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    var t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (!/^[1-8]$/.test(e.key) || document.querySelector('.dialog:not([hidden]), .fh:not([hidden])')) return;
    var a = start.querySelectorAll('.nl-tools a')[+e.key - 1]; if (!a || a.classList.contains('nl-jetzt')) return;
    location.href = a.href;
  });

  var lauf = 0, geplant = 0;
  function alles() { geplant = 0; if (lauf) return; lauf = 1; try { schmal(); rail(); mitfahren(start.querySelector('.ms-leiste'), start.querySelector('.start__in')); rhaus(); koepfe(); titel(); reiter(); } finally { lauf = 0; } }
  function bald() { if (!geplant) { geplant = 1; requestAnimationFrame(alles); } }
  function los() {
    alles();
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) { var t = ms[i].target; if (t.id === 'msNav' || (t.closest && t.closest('#msNav'))) continue; return bald(); }
    }).observe(start, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    document.addEventListener('ds:bereit', bald);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
