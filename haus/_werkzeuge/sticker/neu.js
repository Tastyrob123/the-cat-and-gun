/* Sticker editor · neuer Look wie das Control panel (Robert 26.11.2026).
   Vorlage: _entwurf-dashboard/stickers-bereich (index.html, bau.py, stickers.css, szenen.html) mit runde2/stil.css und runde3/zusatz.css.
   Diese Schicht legt nur Oberfläche an: Seitenleiste «Lack und Gold» mit den acht Werkzeugen (Tasten 1–8), Kopfkarten mit Foto,
   Reiter in der Kopfkarte, Tafel «A sticker draft is waiting», Abschnitte der Übersicht, im Editor Reiter Quick · Design · More tools.
   Ids, Knoten und Handler der Werkzeug-Skripte bleiben; Knoten werden nur umgehängt, Knöpfe lösen die vorhandenen Knöpfe aus.
   Inhalte nur belegt: Werkzeugnamen aus dem Kleid (WO_HAUS), Telefon und Zeiten aus der Website (rahmen.json), Sätze aus der Vorlage. */
(function () {
  'use strict';
  const $ = (s, w) => (w || document).querySelector(s), $$ = (s, w) => [].slice.call((w || document).querySelectorAll(s));
  const I = {
    web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18"/>',
    menu: '<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 0-3 3-3 7h3v11"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>',
    buch: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.8-1.8 0-1.3-1-1.6-1-2.6 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    sticker: '<path d="M15 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6l9-9V9a6 6 0 0 0-6-6Z"/><path d="M12 21v-4a5 5 0 0 1 5-5h4"/>',
    druck: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
    besuch: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    auge: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    guide: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/>',
    haus: '<path d="M3 11 12 4l9 7v9H3z"/><path d="M9 20v-6h6v6"/>',
    uhr: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    tel: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', pfeil: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    stift: '<path d="m14 4 6 6M17 7l-9 9H5v-3l9-9"/>',
    werkzeug: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5z"/>',
    senden: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
    vergleich: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M12 3v18M7 10.5 5.5 12 7 13.5M17 10.5l1.5 1.5-1.5 1.5"/>',
    pruef: '<path d="M9 12l2 2 4-4"/><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    foto: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    schrift: '<path d="M5 20 11 4h2l6 16M8 14h8"/>', pdf: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    lagen: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>', stern: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    raster: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>'
  };
  const ic = (n, c) => `<svg class="${c || 'nl-ico'}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const H = window.WO_HAUS || { wege: {}, namen: {} };
  const ZENTRALE = (H.wege && H.wege.zentrale) || '/the-cat-and-gun/haus/_werkzeuge/maison/';
  const NAME = k => (H.namen && H.namen[k]) || k;
  /* Taste, Schlüssel im Kleid, kurzer Name (Vorlage runde2/bau.py TOOLS), Symbol */
  const TOOLS = [['1', 'website', 'Website', 'web'], ['2', 'karten', 'Menus', 'menu'], ['3', 'gaeste', 'Guests', 'chat'], ['4', 'marke', 'Brand book', 'buch'],
    ['5', 'markeneditor', 'Brand editor', 'palette'], ['6', 'sticker', 'Stickers', 'sticker'], ['7', 'druck', 'Print & feed', 'druck'], ['8', 'besuche', 'Visitors', 'besuch']];
  const FOTO = { msArten: 'b09', msGalerie: 'b08', msDruck: 'b29', msElemente: 'b35', msFarben: 'b27', msDetail: 'b19', msNeu: 'b36' };
  let R = { telefon: '', tel_link: '', zeiten: '' };

  /* ---------- Stand des Entwurfs aus der Leiste unten (editor.js leiste()) ---------- */
  function stand() {
    const t = ($('#leisteText') || {}).textContent || '';
    return { entwurf: /^Draft:/.test(t), ungesichert: /not saved/.test(t), text: t };
  }

  /* ---------- Seitenleiste ----------
     Aufbau und Klassen wie bei Edit website (bureau: aside.wo-rand.dx-rail.dx-lack6, Regeln in leiste.css, Robert 27.11.2026).
     Untertitel der Werkzeuge wie dort (bureau oberflaeche/kleid/catgun.js › WO_HAUS.dash.werkzeuge); «Website» zeigt wie im Control panel
     den Tag der letzten Veröffentlichung (api/website), der eigene Eintrag den Stand des Entwurfs. Fussblock: nur Wege, die es im Sticker editor gibt. */
  const UNTER = { karten: 'Food and drinks with prices', gaeste: 'Guest questions and the chat', marke: 'Logo, colours, fonts, photos',
    markeneditor: 'Keeping the brand book up to date', sticker: 'Stickers with the logo', druck: 'Signs, coasters, posts', besuche: 'Visits to the website' };
  const GUIDES = 'https://tastyrob123.github.io/the-cat-and-gun/schulung/akademie/';
  let webTag = '';
  const eigenUnter = s => s.entwurf ? 'A draft is waiting' : s.ungesichert ? 'Changes not saved' : UNTER.sticker;
  function railHtml() {
    const s = stand();
    const nav = TOOLS.map(([k, key, kurz, sym]) => {
      const jetzt = key === 'sticker';
      const sub = jetzt ? eigenUnter(s) : key === 'website' ? (webTag || NAME('website')) : UNTER[key];
      return `<a class="${jetzt ? 'dx-jetzt' : ''}" href="${jetzt ? '?ansicht=start' : esc(H.wege[key] || '#')}" data-nl-tool="${key}"${jetzt ? ' aria-current="page"' : ''}><kbd>${k}</kbd>${ic(sym, 'dx-ico')}<span><b>${esc(kurz)}</b><i data-nl-sub="${key}">${esc(sub)}</i></span></a>`;
    }).join('');
    const haus = [R.zeiten ? `<span>${ic('uhr', 'dx-ico')}Open daily ${esc(R.zeiten)}</span>` : '', R.telefon ? `<a href="${esc(R.tel_link)}">${ic('tel', 'dx-ico')}${esc(R.telefon)}</a>` : ''].join('');
    return `<div class="dx-s6rahmen"><div class="dx-marke"><a href="${esc(ZENTRALE)}" title="${esc(NAME('zentrale'))}"><img src="look/wortmarke-weiss.svg" alt="The Cat &amp; Gun · ${esc(NAME('zentrale'))}"></a><span class="dx-mono">Catangnan, Siargao</span></div>
      <div class="dx-mono dx-rk">Tools <span>keys 1–8</span></div><nav aria-label="Tools of the house">${nav}</nav>
      ${haus ? `<div class="dx-rhaus">${haus}</div>` : ''}
      <div class="dx-rfuss">
        <a href="${esc(ZENTRALE)}" class="nl-zentrale">${ic('haus', 'dx-ico')}<span><b>${esc(NAME('zentrale'))}</b><i>All tools of the house</i></span></a>
        <a href="?rundgang" class="nl-guide">${ic('auge', 'dx-ico')}<span><b>Short tour</b><i>What is where in this tool</i></span></a>
        <a href="pruefung.html" target="_blank" rel="noopener">${ic('pruef', 'dx-ico')}<span><b>Checks</b><i>Is everything working?</i></span></a>
        <a href="${GUIDES}" target="_blank" rel="noopener">${ic('guide', 'dx-ico')}<span><b>Guides</b><i>11 videos</i></span></a>
      </div></div>`;
  }
  async function webStand() {
    for (const u of ['api/website', '/the-cat-and-gun/haus/_werkzeuge/bureau/api/ueberblick']) {
      try {
        const r = await fetch(u, { cache: 'no-cache' }); if (!r.ok) continue;
        const j = await r.json(), z = j.zuletzt && (j.zuletzt.zeit || j.zuletzt);
        if (z && typeof z === 'string') { const d = new Date(z); if (!isNaN(d)) { webTag = 'Published ' + d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); $$('[data-nl-sub="website"]').forEach(i => { i.textContent = webTag; }); return; } }
      } catch (e) { }
    }
  }
  function railAuffrischen() {
    const s = stand();
    $$('[data-nl-sub="sticker"]').forEach(i => { i.textContent = eigenUnter(s); });
  }
  function railEreignisse(w) {
    w.addEventListener('click', e => {
      const a = e.target.closest('a.dx-jetzt'); if (a) { e.preventDefault(); if (window.SKStart) SKStart.zeige('start'); return; }
      if (e.target.closest('.nl-guide')) { e.preventDefault(); if (!$('#start').hidden && $('#startHilfe')) $('#startHilfe').click(); else if ($('#btnHilfe')) $('#btnHilfe').click(); }
    });
  }
  function rails() {
    /* Übersicht: in die Seitenleiste der Vorlage (ms-leiste), die alte Seitennavigation wandert als Reiter in die Kopfkarte */
    const ms = $('.start.ms .ms-leiste');
    if (ms && !ms.querySelector('.dx-s6rahmen')) { ms.classList.add('nl-rail', 'dx-rail', 'dx-lack6'); ms.insertAdjacentHTML('afterbegin', railHtml()); railEreignisse(ms); }
    /* Editor: eigene Seitenleiste links */
    if (!$('.nl-rail--ed')) { const a = document.createElement('aside'); a.className = 'nl-rail nl-rail--ed dx-rail dx-lack6'; a.innerHTML = railHtml(); document.body.appendChild(a); railEreignisse(a); }
    mitfahren($('.nl-rail--ed'), window);
    if (ms) mitfahren(ms, $('.start.ms .start__in'));
  }

  /* ---------- Seitenleiste fährt mit (Robert 27.11.2026) ----------
     Ist sie höher als das Fenster, scrollt sie mit der Seite, bis ihr unteres Ende am Fensterrand steht, und bleibt dort;
     beim Hochscrollen fährt sie mit zurück, bis ihr oberes Ende wieder oben steht. Passt sie ganz ins Fenster, steht sie oben fest.
     Übersicht: gescrollt wird .start__in (Mausrad über der Leiste scrollt dort mit), Editor: das Fenster. */
  function mitfahren(rail, scroller) {
    if (!rail || rail.dataset.nlFahrt) return; rail.dataset.nlFahrt = '1';
    let y = null, letzt = 0;
    const rand = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nl-rail-rand')) || 35;
    const pos = () => scroller === window ? scrollY : scroller.scrollTop;
    function setze() {
      if (innerWidth < 1200 || !rail.offsetHeight) { rail.style.removeProperty('top'); y = null; return; }
      const m = rand(), h = rail.offsetHeight, H = innerHeight, unten = Math.min(m, H - h - 28), p = pos();   // Abnahme 28.11.2026: am Seitenende 28 px über dem Fensterrand wie in Edit website und Menus (stand bei 35)
      if (y === null) { y = m; letzt = p; }
      y = Math.max(unten, Math.min(m, y - (p - letzt))); letzt = p;
      rail.style.setProperty('top', y + 'px', 'important');
    }
    (scroller === window ? window : scroller).addEventListener('scroll', setze, { passive: true });
    addEventListener('resize', setze);
    new ResizeObserver(setze).observe(rail);
    if (scroller !== window) rail.addEventListener('wheel', e => { if (innerWidth >= 1200 && !e.ctrlKey) { scroller.scrollTop += e.deltaY; e.preventDefault(); } }, { passive: false });
    setze();
  }

  /* ---------- Grund: Foto des Hauses, weich und dunkel (Vorlage t-glas, b16) ---------- */
  function grund() {
    if (!$('body > .nl-grund')) document.body.insertAdjacentHTML('afterbegin', '<div class="nl-grund" aria-hidden="true"></div>');
    const st = $('#start'); if (st && !st.querySelector(':scope > .nl-grund')) st.insertAdjacentHTML('afterbegin', '<div class="nl-grund" aria-hidden="true"></div>');
  }

  /* ---------- Kopfkarte der Übersicht (Vorlage A: «Stickers») ---------- */
  function heldStart() {
    const ms = $('#msStart'); if (!ms || ms.querySelector('.nl-held')) return;
    const g = ms.querySelector('.ms-gruss'); if (g) g.classList.add('nl-weg');
    const d = document.createElement('div'); d.className = 'nl-held nl-p';
    d.innerHTML = `<div class="nl-hfoto" aria-hidden="true"><img src="look/held-sticker.webp" alt="" decoding="sync" fetchpriority="high"></div>
      <div class="nl-hi"><div class="nl-mono">${ic('sticker', 'nl-mi')}${esc(NAME('sticker'))} · The Cat &amp; Gun</div><h1>Stickers</h1>
      <p>Change the stickers of the house, design new ones and get the print files. It works without AI.</p>
      <div class="nl-hst"><span class="nl-stp" data-nl-stand hidden><i class="nl-pt"></i><span>A draft is waiting</span></span>
        <button type="button" class="nl-wk gold" data-nl-zum-sticker hidden>${ic('stift')}<span>Open draft</span></button>
        <button type="button" class="nl-wk" data-akt="neu">${ic('plus')}<span>New sticker</span></button>
        <button type="button" class="nl-wk" data-nl-klick="#btnVeroeff">${ic('senden')}<span>Publish</span></button></div></div>
      <div class="nl-tabs-platz"></div>`;
    ms.insertBefore(d, ms.firstChild);
    /* Tafel «A sticker draft is waiting» (Vorlage A, .sent) */
    const s = document.createElement('div'); s.className = 'nl-sent nl-p'; s.hidden = true;
    s.innerHTML = `<div class="nl-sentl"><span class="nl-aufsym">${ic('sticker')}</span><div><div class="nl-mono">Draft</div><h3>A sticker draft is waiting</h3>
      <p>«Publish» makes the print files of the changed stickers. Print &amp; feed reads them from there.</p></div></div>
      <span class="nl-wr"><button type="button" class="nl-wk" data-nl-klick="#btnVerlauf">${ic('uhr')}<span>Earlier versions</span></button><button type="button" class="nl-wk gold" data-nl-klick="#btnVeroeff">${ic('senden')}<span>Publish</span></button></span>`;
    d.after(s);
    /* Abschnitte am Ende der Übersicht (Vorlage A: Druckprüfung und Druckdateien, ein neuer Sticker) */
    const z = document.createElement('div'); z.className = 'nl-start-ende';
    const li = (sym, b, i, extra) => `<li${extra || ''}><span class="nl-dsym">${ic(sym)}</span><div><b>${b}</b><i>${i}</i></div></li>`;
    z.innerHTML = `<div class="nl-stitel"><span class="nl-snr">${ic('druck')}</span><div><h2>Print check and print files</h2><span class="nl-mono">For the printer</span></div></div>
      <div class="nl-r2"><div class="nl-wdt nl-p"><div class="nl-mono">${ic('pruef', 'nl-mi')}Print check</div><h4>Before printing, the tool checks the sticker</h4>
        <ul class="nl-dl">${li('pruef', 'Margin', 'What to fix before printing')}${li('foto', 'Resolution', 'What to fix before printing')}${li('schrift', 'Missing text', 'Characters the font does not have, such as emoji')}</ul></div>
      <div class="nl-wdt nl-p"><div class="nl-mono">${ic('pdf', 'nl-mi')}Print files</div><h4>Ready to download after «Publish»</h4>
        <ul class="nl-dl nl-dl--wahl">${li('pdf', 'PDF for the printer', '3 mm bleed, a cut line, fonts embedded', ' data-ansicht="druck" role="button" tabindex="0"')}${li('foto', 'Picture', 'To look at or to send', ' data-nl-ausgabe="png" role="button" tabindex="0"')}${li('lagen', 'Working file', 'To go on later', ' data-nl-ausgabe="json" role="button" tabindex="0"')}</ul></div></div>
      <div class="nl-stitel"><span class="nl-snr">${ic('plus')}</span><div><h2>A new sticker</h2><span class="nl-mono">From a shape or a sticker of the house</span></div></div>
      <div class="nl-sneu nl-p"><div><div class="nl-mono">${ic('plus', 'nl-mi')}New sticker</div><h4>Start from a shape</h4><div class="nl-formen" id="nlFormen"></div></div>
        <div><div class="nl-mono">${ic('stern', 'nl-mi')}Brand elements</div><h4>Or add an element</h4><div class="nl-formen" id="nlElemente"></div></div>
        <p class="nl-hin">Or copy a sticker of the house and change it. «Already used» shows when a motif is already on a sticker.</p></div>`;
    ms.appendChild(z);
    formenZeichnen();
  }
  function formenZeichnen() {
    const f = $('#nlFormen'), el = $('#nlElemente'); if (!f || !window.SK) return;
    const KL = { kreis: 'f-rund', oval: 'f-oval', eckig: 'f-quad', streifen: 'f-streifen', blase: 'f-blase' };
    f.innerHTML = Object.entries(SK.FORMEN).map(([k, F]) => `<button type="button" class="nl-fo" data-form="${esc(k)}"><i class="nl-form ${KL[k] || 'f-quad'}"></i><span>${esc(F.name)}</span></button>`).join('');
    /* Elemente wie in «Brand elements» (start.js zeichneElemente): Bild aus dem Fundus, Klick setzt es ein */
    if (el.dataset.nl || !window.Fundus) return;
    let l = []; try { l = Fundus.elemente({}).filter(e => e.art === 'zeichen' || e.id === 'ball').slice(0, 3); } catch (e) { return; }
    if (!l.length) return; el.dataset.nl = '1';
    Promise.all(l.map(e => Fundus.element(e.id).catch(() => ''))).then(svgs => {
      el.innerHTML = l.map((e, i) => `<button type="button" class="nl-fo" data-element="${esc(e.id)}"><span class="nl-fo-bild">${svgs[i] ? `<img alt="" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgs[i])}">` : ''}</span><span>${esc(e.name)}</span></button>`).join('');
    });
  }

  /* ---------- Kopfkarten der übrigen Ansichten (dieselbe Bauart, kleiner) ---------- */
  function heldAnsichten() {
    $$('#start .ms-titel').forEach(t => {
      if (t.dataset.nl) return; t.dataset.nl = '1';
      const v = t.closest('[id^="ms"]'), fn = FOTO[v && v.id] || 'b24';
      t.classList.add('nl-held', 'nl-held--klein', 'nl-p');
      const h1 = t.querySelector('h1'), sz = t.querySelector('.ms-leise');
      const hi = document.createElement('div'); hi.className = 'nl-hi';
      hi.innerHTML = `<div class="nl-mono">${ic('sticker', 'nl-mi')}${esc(NAME('sticker'))} · The Cat &amp; Gun</div>`;
      if (h1) hi.appendChild(h1); if (sz) { hi.appendChild(sz); }
      t.textContent = '';
      t.insertAdjacentHTML('afterbegin', `<div class="nl-hfoto" aria-hidden="true"><img src="/the-cat-and-gun/haus/assets/bild/${fn}-800.webp" alt="" decoding="sync"></div>`);
      t.appendChild(hi); t.insertAdjacentHTML('beforeend', '<div class="nl-tabs-platz"></div>');
    });
    const neu = $('#msNeu');
    if (neu && !neu.dataset.nl) {
      neu.dataset.nl = '1';
      const h1 = neu.querySelector(':scope>h1'), sz = neu.querySelector(':scope>.start__satz');
      const t = document.createElement('div'); t.className = 'ms-titel nl-held nl-held--klein nl-p'; t.dataset.nl = '1';
      t.innerHTML = `<div class="nl-hfoto" aria-hidden="true"><img src="/the-cat-and-gun/haus/assets/bild/${FOTO.msNeu}-800.webp" alt="" decoding="sync"></div><div class="nl-hi"><div class="nl-mono">${ic('sticker', 'nl-mi')}${esc(NAME('sticker'))} · The Cat &amp; Gun</div></div><div class="nl-tabs-platz"></div>`;
      if (h1) t.querySelector('.nl-hi').appendChild(h1); if (sz) t.querySelector('.nl-hi').appendChild(sz);
      neu.insertBefore(t, neu.firstChild);
    }
  }
  /* Reiter (die Seitennavigation des Werkzeugs) in die Kopfkarte der sichtbaren Ansicht */
  function reiterSetzen() {
    const nav = $('#msNav'); if (!nav) return;
    nav.classList.add('nl-tabs');
    const v = $$('#startWahl > [id^="ms"]').find(x => !x.hidden), p = v && v.querySelector('.nl-tabs-platz');
    if (p && nav.parentNode !== p) p.appendChild(nav);
  }

  /* ---------- Zwischentitel der Übersicht (Vorlage .stitel) ---------- */
  function zwischentitel() {
    const SYM = { Areas: 'raster', 'Favourites and last changed': 'stern', 'Start from a sticker of the house': 'sticker' };
    $$('#start .ms-zeile').forEach(z => {
      if (z.dataset.nl) return; const h = z.querySelector('h2'); if (!h) return; z.dataset.nl = '1';
      z.classList.add('nl-stitel');
      h.insertAdjacentHTML('beforebegin', `<span class="nl-snr">${ic(SYM[h.textContent.trim()] || 'sticker')}</span>`);
    });
  }

  /* ---------- Übersicht: Stand in Kopfkarte und Tafel ---------- */
  function standZeigen() {
    const s = stand(), offen = !!(window.SKEditor && SKEditor.doc());
    $$('[data-nl-stand]').forEach(x => { x.hidden = !s.entwurf; });
    $$('.nl-sent').forEach(x => { x.hidden = !s.entwurf; });
    $$('[data-nl-zum-sticker]').forEach(x => { x.hidden = !offen; x.querySelector('span').textContent = s.entwurf || s.ungesichert ? 'Open draft' : 'Back to the sticker'; });
    railAuffrischen();
    editorTexte();
  }

  /* ---------- Editor: Kopfkarte, Reiter Quick · Design · More tools, Tafel um die Fläche ---------- */
  const SATZ = {
    quick: 'The tab «Quick» changes words and colours, without opening the parts one by one.',
    design: 'Click a part of the sticker to change it. Every part can take its own colour.',
    mehr: '«More tools» opens arc text, shapes and lines, position in millimetres, lining up, a grid and the layers.'
  };
  function editor() {
    const k = $('.kopf'); if (!k || k.dataset.nl) return; k.dataset.nl = '1';
    k.classList.add('nl-p');
    k.insertAdjacentHTML('afterbegin', `<div class="nl-hfoto" aria-hidden="true"><img src="look/held-sticker.webp" alt="" decoding="sync"></div>`);
    const mitte = $('.kopf__mitte');
    mitte.insertAdjacentHTML('afterbegin', `<div class="nl-mono nl-ed-kicker">${ic('sticker', 'nl-mi')}<span>${esc(NAME('sticker'))}</span><span>·</span><span data-nl-name></span></div>`);
    mitte.insertAdjacentHTML('beforeend', `<p class="nl-ed-satz" data-nl-satz></p>`);
    /* Reiter */
    const r = document.createElement('nav'); r.className = 'nl-reiter3 nl-p'; r.setAttribute('aria-label', 'Ways to change the sticker');
    r.innerHTML = `<button type="button" data-nl-seite="quick">${ic('stift')}<span>Quick</span></button><button type="button" data-nl-seite="design">${ic('palette')}<span>Design</span></button><button type="button" data-nl-seite="mehr" aria-pressed="false">${ic('werkzeug')}<span data-nl-mehr>More tools</span></button>`;
    k.after(r);
    r.addEventListener('click', e => {
      const b = e.target.closest('[data-nl-seite]'); if (!b) return;
      const w = b.dataset.nlSeite;
      if (w === 'mehr') { $('#btnModus').click(); return; }
      seite(w, true);
    });
    /* Kopf der Fläche (Vorlage B: «Super Juices · Oval», «Drag · resize · turn») */
    const m = $('.mitte');
    m.insertAdjacentHTML('afterbegin', `<div class="nl-kk"><span class="nl-mono">${ic('sticker', 'nl-mi')}<span data-nl-name></span><span data-nl-form></span></span><span class="nl-mono nl-kk-r">Drag · resize · turn</span></div>`);
    /* Leiste unten: Haken und Tasten (Vorlage .wleist) */
    const l = $('#leiste');
    if (l && !l.querySelector('.nl-tasten')) {
      l.insertAdjacentHTML('afterbegin', `<svg class="nl-ck" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4 10-10"/></svg>`);
      $('#leisteText').insertAdjacentHTML('afterend', '<span class="nl-mono nl-tasten">⌘Z · ⇧⌘Z · ⌘D</span>');
    }
    /* Seite folgt der Auswahl: Teil gewählt → Design, Platte zu → Quick */
    const st = $('.studio');
    new MutationObserver(() => { if (zwingt) return; seite(st.classList.contains('rechts-zu') ? 'quick' : 'design'); }).observe(st, { attributes: true, attributeFilter: ['class'] });
    const gewaehlt = () => !!(window.SKEditor && SKEditor.ED && SKEditor.ED.sel);
    $('#wirt').addEventListener('pointerup', () => setTimeout(() => { if (gewaehlt() || !st.classList.contains('rechts-zu')) seite('design'); }, 30));
    /* «More tools»: die Platte rechts bleibt offen, also zeigt erst die Auswahl (neues oder angeklicktes Teil) den Reiter Design */
    let letzte = null;
    new MutationObserver(() => { const s = window.SKEditor && SKEditor.ED && SKEditor.ED.sel; if (s && s !== letzte) seite('design'); letzte = s; }).observe($('#rechts'), { childList: true });
    new MutationObserver(editorTexte).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    const fi = $('#formatInfo'); if (fi) new MutationObserver(editorTexte).observe(fi, { childList: true, subtree: true, characterData: true });
    $('#docName').addEventListener('input', editorTexte);
    /* Abnahme 28.11.2026: «Sign», «Photo», «Change photo» und «Brand elements» öffnen einen Reiter der linken Platte (Elements, Photos). Ist gerade
       die Seite Design zu sehen (Teil gewählt oder «More tools»), war die linke Platte ausgeblendet: die Meldung sagte «Tap one of your photos»,
       zu sehen war keins. Diese Knöpfe zeigen jetzt die linke Platte; die Auswahl bleibt, ein Klick auf ein Foto ersetzt also das gewählte. */
    document.addEventListener('click', e => {
      if (!e.target.closest || !e.target.closest('#werkzeug [data-neu="zeichen"],#werkzeug [data-neu="bild"],#rechts [data-tu="fotoTausch"],.kopf [data-tab-auf]')) return;
      setTimeout(() => { seite('quick'); if (innerWidth <= 1100) { const z = $('.links'); if (z) z.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, 0);
    });
    seite(st.classList.contains('rechts-zu') ? 'quick' : 'design');
  }
  let zwingt = 0;
  function seite(w, vonHand) {
    const st = $('.studio'); if (!st) return;
    if (w === 'design' && vonHand && st.classList.contains('rechts-zu')) { zwingt = 1; st.classList.remove('rechts-zu'); setTimeout(() => { zwingt = 0; }, 0); }
    if (w === 'quick' && vonHand) { const a = $('.links .reiter button[data-tab="einfach"]'); if (a && !a.classList.contains('an') && st.dataset.nlSeite === 'quick') a.click(); }
    st.dataset.nlSeite = w;
    $$('.nl-reiter3 [data-nl-seite]').forEach(b => { if (b.dataset.nlSeite !== 'mehr') b.classList.toggle('an', b.dataset.nlSeite === w); });
    editorTexte();
    if (vonHand && innerWidth <= 1100) { const z = w === 'design' ? $('#rechts') : $('.links'); if (z) z.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
  function editorTexte() {
    const n = ($('#docName') || {}).value || '';
    $$('[data-nl-name]').forEach(x => { x.textContent = n; });
    nameEinpassen();
    const fi = $('#formatInfo'), art = fi ? (fi.querySelector('.sk-fi-art') || {}).textContent || fi.textContent.split('·')[0] : '';
    const a2 = String(art || '').replace(/·/g, ' ').trim();
    $$('[data-nl-form]').forEach(x => { x.textContent = a2 ? '· ' + a2 : ''; });
    const erw = document.body.classList.contains('sk-erweitert'), st = $('.studio');
    const mb = $('.nl-reiter3 [data-nl-seite="mehr"]'); if (mb) { mb.classList.toggle('an', erw); mb.setAttribute('aria-pressed', erw); const t = $('#btnModus span'); mb.querySelector('[data-nl-mehr]').textContent = t ? t.textContent : 'More tools'; }
    const s = $('[data-nl-satz]'); if (s && st) s.textContent = erw && st.dataset.nlSeite !== 'quick' ? SATZ.mehr : SATZ[st.dataset.nlSeite || 'quick'];
  }

  /* Name des Stickers als Titel: so gross wie möglich, ganz lesbar (das Feld kann nicht umbrechen) */
  function nameEinpassen() {
    const i = $('#docName'); if (!i || !i.offsetWidth) return;
    const gross = innerWidth <= 820 ? 46 : innerWidth < 1440 ? 84 : 100, klein = innerWidth <= 820 ? 26 : 44;
    /* Abnahme 28.11.2026: der Titel ist eine Textfläche. Erst wird die Schrift kleiner, bis der Name in eine Zeile passt; passt er auch in der
       kleinsten Grösse nicht, bricht er um und die Fläche wächst mit (vorher endete er mit «…», bei 1440 px bei 21 von 68 Stickern). */
    const zeilen = () => { i.style.setProperty('height', 'auto', 'important'); return Math.round(i.scrollHeight / (parseFloat(getComputedStyle(i).lineHeight) || f)); };
    let f = gross; i.style.setProperty('font-size', f + 'px', 'important');
    while (f > klein && (zeilen() > 1 || i.scrollWidth > i.clientWidth + 1)) { f -= 2; i.style.setProperty('font-size', f + 'px', 'important'); }
    i.style.setProperty('height', 'auto', 'important'); i.style.setProperty('height', i.scrollHeight + 'px', 'important');
  }
  /* Eingabetaste im Titel schliesst die Eingabe ab (kein Zeilenumbruch im Namen) */
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target && e.target.id === 'docName') { e.preventDefault(); e.target.blur(); } });
  document.addEventListener('input', e => { if (e.target && e.target.id === 'docName' && /[\r\n]/.test(e.target.value)) e.target.value = e.target.value.replace(/\s*[\r\n]+\s*/g, ' '); });
  addEventListener('resize', () => nameEinpassen());

  /* ---------- Tasten 1–8 (Vorlage «keys 1–8») ---------- */
  function tasten() {
    document.addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || !/^[1-8]$/.test(e.key)) return;
      const a = document.activeElement; if (a && (/INPUT|TEXTAREA|SELECT/.test(a.tagName) || a.isContentEditable)) return;
      if (!$('#dialog').hidden) return;
      const t = TOOLS.find(x => x[0] === e.key); if (!t) return;
      e.preventDefault();
      if (t[1] === 'sticker') { if (window.SKStart) SKStart.zeige('start'); return; }
      if (H.wege[t[1]]) location.href = H.wege[t[1]];
    });
  }

  /* ---------- Knöpfe, die vorhandene Knöpfe auslösen ---------- */
  function klicks() {
    document.addEventListener('click', e => {
      const k = e.target.closest('[data-nl-klick]'); if (k) { e.preventDefault(); e.stopPropagation(); const z = $(k.dataset.nlKlick); if (z && !z.disabled) z.click();
        /* Abnahme 28.11.2026: «Publish» in der Kopfkarte blieb stumm, wenn der Knopf unten gesperrt ist (nichts gespeichert oder nichts zu veröffentlichen). Jetzt sagt die Meldung den Grund. */
        else if (z && z.id === 'btnVeroeff' && window.SKEditor) SKEditor.veroeffentlichen();
        return; }
      const z = e.target.closest('[data-nl-zum-sticker]'); if (z) { e.preventDefault(); e.stopPropagation(); if (window.SKStart) SKStart.zu(); return; }
      /* Abnahme 28.11.2026: «Picture» und «Working file» der Übersicht führten zur Liste der PDF, dort gibt es beides nicht.
         Sie öffnen jetzt den offenen Sticker mit dem Menü «Print file», in dem beide Ausgaben stehen. */
      const a = e.target.closest('[data-nl-ausgabe]'); if (a) { e.preventDefault(); e.stopPropagation(); if (window.SKStart && window.SKEditor && SKEditor.doc()) { SKStart.zu(); scrollTo(0, 0); const m = $('#menueSpeichern'); if (m) m.hidden = false; } return; }
    }, true);
    document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('li[data-ansicht],li[data-nl-ausgabe]')) { e.preventDefault(); e.target.click(); } });
  }

  function alles() { grund(); rails(); heldStart(); heldAnsichten(); zwischentitel(); reiterSetzen(); }
  async function los() {
    try { const r = await fetch('rahmen.json', { cache: 'no-cache' }); if (r.ok) R = await r.json(); } catch (e) { }
    document.documentElement.classList.add('nl');
    alles(); editor(); tasten(); klicks(); webStand();
    let lauf = 0;
    const st = $('#start');
    if (st) new MutationObserver(() => { if (lauf) return; lauf = 1; try { alles(); } finally { lauf = 0; } }).observe(st, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    const lt = $('#leisteText'); if (lt) new MutationObserver(standZeigen).observe(lt, { childList: true, characterData: true, subtree: true });
    if (st) new MutationObserver(standZeigen).observe(st, { attributes: true, attributeFilter: ['hidden'] });
    /* Formen und Elemente, sobald Stand und Fundus da sind */
    let n = 0; const warte = setInterval(() => { n++; if ((window.SKStart && SKStart.bereit) || n > 100) { clearInterval(warte); formenZeichnen(); standZeigen(); } }, 100);
    standZeigen();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
