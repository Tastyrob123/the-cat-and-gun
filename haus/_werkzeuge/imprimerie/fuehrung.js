/* Drucksachen-Studio · Hilfe: Begrüssung beim ersten Besuch, Führung Schritt für Schritt am echten Studio,
   Demo-Video mit Kapiteln, Tastenkürzel. Alles jederzeit über «Hilfe» oben wieder aufrufbar. */
(function () {
  const $ = s => document.querySelector(s);
  const HAUS = new URLSearchParams(location.search).get('haus') || 'catgun';
  const GESEHEN = `ds-${HAUS}-willkommen`;
  const merk = () => { try { localStorage.setItem(GESEHEN, '1'); } catch (e) { } };
  const gesehen = () => { try { return localStorage.getItem(GESEHEN) === '1'; } catch (e) { return true; } };
  const tab = t => { const b = document.querySelector(`.reiter [data-tab="${t}"]`); if (b) b.click(); };
  const PFEIL = '<i><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></i>';
  const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/></svg>';

  /* ---------- Schritte der Führung ---------- */
  const SCHRITTE = [
    { ziel: '#btnNeu', film: null, titel: 'Overview and new design',
      text: '«Overview» takes you to the start page. All your designs are there: open, rename, copy or save them as PDF. To start a new design, pick a template there.' },
    { ziel: '.reiter [data-tab="vorlagen"]', film: 'schritt-1', vor: () => tab('vorlagen'), titel: 'Start from a template',
      text: 'Under «Templates» you find ready layouts in the size of this design. On the start page, type a word like «beer mat» or «poster» to find the ready designs of the house.' },
    { ziel: '#bausteine', film: 'schritt-2', vor: () => tab('entwerfen'), titel: 'The brand kit',
      text: 'Under «Brand kit» you find the colours, fonts and elements from the brand book, like the pool ball or the Super Juices oval. Click one, and it goes onto your design. What Julie changes in the brand book editor shows up here.' },
    { ziel: '#wirt', film: 'schritt-3', titel: 'The page',
      text: 'This is your design. Click once to select a part. Drag to move it. Double-click a text to type right into it. The dark edge is the bleed: the printer cuts off what lies there.' },
    { ziel: '#rechts', film: 'schritt-4', titel: 'Adjust',
      text: 'On the right you change what you selected: font, size, colour or the photo. With nothing selected, you change the format and layout of the whole page here. Only the colours and fonts of the house are offered, so everything stays in style.' },
    { ziel: '#werkzeug', film: 'schritt-5', titel: 'Add something',
      text: 'A new title, a text, a photo, the house mark or a rule: one click puts it on the page. At the top right of this bar you switch between front and back.' },
    { ziel: '.reiter', film: 'schritt-6', titel: 'Templates, photos and saved',
      text: 'Under «Photos» are all photos of the house, sorted by topic, plus your own: upload them or drag them onto the page. Under «Templates» you find ready layouts. «Saved» holds everything you made. Saving happens by itself.' },
    { ziel: '#btnZurueck', film: 'schritt-7', titel: 'One step back',
      text: 'Moved or deleted something by mistake? This arrow undoes the last step. The one next to it brings it back. On the keyboard, use ⌘ Z.' },
    { ziel: '#btnPruefen', film: 'schritt-8', titel: 'The print check',
      text: 'Print & feed checks if everything is ready for print: open gaps like [Price], text too close to the edge, photos that would print blurry. A zero here means all is fine. Click to see what is still missing.' },
    { ziel: '#btnSpeichern', film: 'schritt-9', titel: 'Save for print',
      text: 'At the end you save the design as a PDF for the printer. Bleed, fonts and photos are already set up, so you just pass the file on. For Instagram you can save an image here too.' },
  ];

  /* ---------- Begrüssung ---------- */
  function willkommen() {
    const M = window.DS && DS.M;
    schicht(`<div class="hk hk--gross hk--ecke" role="dialog" aria-label="Welcome">
      <div class="hk__zeichen">${M ? DS.zeichenSvg(M, 'currentColor') : ''}</div>
      <h2>Welcome to Print & feed</h2>
      <p class="hk__unter">Flyers, cards, signs, vouchers and posts in the style of ${M ? M.name : 'the house'}.</p>
      <div class="hk__drei">
        <div><span class="hk__bild"><svg viewBox="0 0 48 48"><path d="M10 34h28M10 26h20M10 18h28"/><path d="m33 30 7-7 3 3-7 7-4 1z"/></svg></span><b>Find</b><p>Type a word to find a template.</p></div>
        <div><span class="hk__bild"><svg viewBox="0 0 48 48"><rect x="6" y="14" width="10" height="14" rx="1.5"/><rect x="19" y="10" width="10" height="14" rx="1.5"/><rect x="32" y="14" width="10" height="14" rx="1.5"/><path d="m20 33 4 4 7-8"/></svg></span><b>Choose</b><p>Pick the template you like best.</p></div>
        <div><span class="hk__bild"><svg viewBox="0 0 48 48"><rect x="11" y="8" width="26" height="34" rx="2"/><path d="M17 16h14M17 22h10"/><path d="m27 30 9 3-4 1.5-1.5 4z"/></svg></span><b>Adjust</b><p>Change text, photos and format right on the page.</p></div>
        <div><span class="hk__bild"><svg viewBox="0 0 48 48"><path d="M14 18V8h20v10"/><rect x="8" y="18" width="32" height="14" rx="3"/><path d="M14 28h20v12H14z"/><path d="M19 33h10M19 37h6"/></svg></span><b>Print</b><p>Save as PDF and give it to the printer.</p></div>
      </div>
      <div class="hk__knoepfe">
        <button class="knopf knopf--voll" data-hk="fuehrung">Start a short tour${PFEIL}</button>
        <button class="hk__video" data-hk="video">${PLAY}<span>Watch the demo video</span></button>
      </div>
      <button class="hk__leise" data-hk="los">Start right away</button>
    </div>`, false);   /* K33 (Tor 30.10.2026): als ruhige Karte an der Ecke wie beim Rivage, die Seite bleibt hell und bedienbar */
    merk();
  }

  /* ---------- Schicht (Hintergrund + Karte) ---------- */
  let ebene;
  function schicht(html, dunkel) {
    zu();
    ebene = document.createElement('div');
    ebene.className = 'hs' + (dunkel ? ' hs--dunkel' : '');
    ebene.innerHTML = html;
    document.body.appendChild(ebene);
    ebene.addEventListener('click', klick);
    requestAnimationFrame(() => ebene && ebene.classList.add('an'));
    return ebene;
  }
  function zu() {
    if (ebene) { ebene.remove(); ebene = null; }
    removeEventListener('resize', setze); document.removeEventListener('keydown', taste);
  }
  function klick(e) {
    const b = e.target.closest('[data-hk]'); if (!b) return;
    const a = b.dataset.hk;
    if (a === 'fuehrung') { if (window.DSStart) DSStart.zu(); starte(0); }
    else if (a === 'video') video();
    else if (a === 'los' || a === 'zu') {
      zu(); tab('entwerfen');
      if (window.DSStart && !DSStart.offen() && window.DSStudio && DSStudio.doc().platzhalter) DSStart.zeige();   // noch nichts begonnen: zur Auswahl
    }
    else if (a === 'weiter') starte(nr + 1);
    else if (a === 'zurueck') starte(nr - 1);
    else if (a === 'extra') { SCHRITTE[nr].extra.tu(); b.textContent = 'Done'; b.disabled = true; }
    else if (a === 'kapitel') { const v = ebene.querySelector('video'); v.currentTime = +b.dataset.t; v.play(); }
  }

  /* ---------- Führung ---------- */
  let nr = 0;
  function starte(i) {
    if (i >= SCHRITTE.length) return ende();
    nr = Math.max(0, i);
    const s = SCHRITTE[nr];
    if (s.vor) s.vor();
    if (!ebene || !ebene.classList.contains('hs--tour')) {
      schicht(`<div class="hs__loch"></div><div class="hk hk--tour" role="dialog" aria-live="polite"></div>`);
      ebene.classList.add('hs--tour');
      addEventListener('resize', setze); document.addEventListener('keydown', taste);
    }
    const k = ebene.querySelector('.hk--tour');
    const film = s.film ? `hilfe/${s.film}` : '';   // Schritt ohne Film zeigt keinen (Fundliste 22: schritt-neu fehlte, 404)
    k.innerHTML = `${film ? `<div class="hk__film"><video src="${film}.mp4" poster="${film}.jpg" width="1200" height="750" autoplay muted loop playsinline preload="auto"></video></div>` : ''}
      <div class="hk__fort"><span style="width:${(nr + 1) / SCHRITTE.length * 100}%"></span></div>
      <small>Step ${nr + 1} of ${SCHRITTE.length}</small>
      <h3>${s.titel}</h3><p>${s.text}</p>
      ${s.extra ? `<button class="leicht hk__extra" data-hk="extra">${s.extra.t}</button>` : ''}
      <div class="hk__nav">
        <button class="hk__leise" data-hk="zu">End tour</button>
        <span></span>
        ${nr ? '<button class="leicht" data-hk="zurueck">Back</button>' : ''}
        <button class="knopf" data-hk="weiter">${nr === SCHRITTE.length - 1 ? 'Done' : 'Next'}${PFEIL}</button>
      </div>`;
    const v = k.querySelector('video') || document.createElement('video');
    v.addEventListener('error', () => k.querySelector('.hk__film')?.remove());
    v.addEventListener('loadedmetadata', setze);
    v.play().catch(() => { });
    k.querySelector('.hk__film')?.addEventListener('click', () => v.paused ? v.play() : v.pause());
    setze();
    k.querySelector('[data-hk="weiter"]').focus({ preventScroll: true });
  }
  function setze() {
    if (!ebene || !ebene.classList.contains('hs--tour')) return;
    const s = SCHRITTE[nr], z = document.querySelector(s.ziel);
    const loch = ebene.querySelector('.hs__loch'), k = ebene.querySelector('.hk--tour');
    if (!z) { loch.style.cssText = 'left:50%;top:50%;width:0;height:0'; return; }
    z.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const r = z.getBoundingClientRect(), p = 8, vw = innerWidth, vh = innerHeight;
    const L = Math.max(4, r.left - p), T = Math.max(4, r.top - p), W = Math.min(vw - 8, r.width + 2 * p), H = Math.min(vh - 8, r.height + 2 * p);
    Object.assign(loch.style, { left: L + 'px', top: T + 'px', width: W + 'px', height: H + 'px' });
    const kw = Math.min(460, vw - 32), kh = k.offsetHeight, g = 18;
    let x, y;
    if (r.top < 90 && vh - (T + H) > kh + g + 16) { x = L + W - kw; y = T + H + g; }   // Knöpfe oben: darunter
    else if (vw - (L + W) > kw + g + 16) { x = L + W + g; y = T; }         // rechts daneben
    else if (L > kw + g + 16) { x = L - kw - g; y = T; }                  // links daneben
    else if (vh - (T + H) > kh + g + 16) { x = L; y = T + H + g; }        // darunter
    else { x = L; y = T - kh - g; }                                       // darüber
    x = Math.min(Math.max(16, x), vw - kw - 16); y = Math.min(Math.max(16, y), vh - kh - 16);
    Object.assign(k.style, { left: x + 'px', top: y + 'px', width: kw + 'px' });
  }
  function taste(e) {
    if (e.key === 'Escape') { zu(); return; }
    if (!ebene || !ebene.classList.contains('hs--tour')) return;
    if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); starte(nr + 1); }
    if (e.key === 'ArrowLeft') starte(nr - 1);
  }
  function ende() {
    schicht(`<div class="hk hk--gross" role="dialog" aria-modal="true">
      <div class="hk__zeichen">${DS.zeichenSvg(DS.M, 'currentColor')}</div>
      <h2>That is all</h2>
      <p class="hk__unter">Find, choose, adjust, print. All your designs are under «Overview» at the top. The tour and the video are always under «Help».</p>
      <div class="hk__knoepfe">
        <button class="knopf knopf--voll" data-hk="los">Get started${PFEIL}</button>
        <button class="hk__video" data-hk="video">${PLAY}<span>Watch the demo video</span></button>
      </div>
    </div>`, true);
  }

  /* ---------- Video ---------- */
  async function video() {
    let kapitel = [];
    try { kapitel = await (await fetch('hilfe/kapitel.json', { cache: 'no-store' })).json(); } catch (e) { }
    const fmt = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    schicht(`<div class="hk hk--video" role="dialog" aria-modal="true" aria-label="Demo video">
      <div class="hk__kopf"><h2>How Print & feed works</h2><button class="hk__x" data-hk="los" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M9 14.5 4 9.5l5-5M4 9.5h11a5 5 0 0 1 0 10h-3"/></svg></button></div>
      <video src="hilfe/demo.mp4" poster="hilfe/demo-poster.jpg" controls playsinline preload="metadata"></video>
      ${kapitel.length ? `<div class="hk__kapitel">${kapitel.map(k => `<button data-hk="kapitel" data-t="${k.t}"><b>${k.titel}</b><span>${fmt(k.t)}</span></button>`).join('')}</div>` : ''}
      <div class="hk__knoepfe hk__knoepfe--zeile"><button class="leicht" data-hk="fuehrung">Start the tour</button><button class="knopf" data-hk="los">Try it yourself${PFEIL}</button></div>
    </div>`, true);
    const v = ebene.querySelector('video');
    v.addEventListener('error', () => { v.replaceWith(Object.assign(document.createElement('p'), { className: 'hk__unter', textContent: 'The video could not be loaded. The tour shows the same, step by step.' })); });
    v.play().catch(() => { });
    document.addEventListener('keydown', taste);
  }

  /* ---------- Hilfe-Menü ---------- */
  function hilfeMenue() {
    schicht(`<div class="hk hk--menue" role="dialog" aria-modal="true" aria-label="Help">
      <div class="hk__kopf"><h2>Help</h2><button class="hk__x" data-hk="los" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M9 14.5 4 9.5l5-5M4 9.5h11a5 5 0 0 1 0 10h-3"/></svg></button></div>
      <button class="hk__zeile" data-hk="video"><span class="hk__ic">${PLAY}</span><span><b>Watch the demo video</b><small>About one minute: a beer mat from start to PDF</small></span></button>
      <button class="hk__zeile" data-hk="fuehrung"><span class="hk__ic"><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span><span><b>Tour</b><small>Ten short steps, right at the buttons</small></span></button>
      <h3>On the keyboard</h3>
      <dl class="hk__tasten">
        <dt>Double-click</dt><dd>Type text or move the photo crop</dd>
        <dt>Arrow keys</dt><dd>Move the selection by half a millimetre, with ⇧ by five</dd>
        <dt>⌘ Z · ⇧ ⌘ Z</dt><dd>Undo · Redo</dd>
        <dt>⌘ D</dt><dd>Duplicate the selection</dd>
        <dt>⌫</dt><dd>Delete the selection</dd>
        <dt>Esc</dt><dd>Clear the selection, stop typing</dd>
        <dt>Alt while dragging</dt><dd>No snapping to edges and centre</dd>
      </dl>
    </div>`, true);
    document.addEventListener('keydown', taste);
  }

  function los() {
    $('#btnHilfe').addEventListener('click', hilfeMenue);
    const q = new URLSearchParams(location.search);
    if (q.get('hilfe') === 'video') video();
    else if (q.get('hilfe') === 'fuehrung') starte(0);
    /* Abnahme 28.11.2026 (G2): «?hilfe=…» nach dem Start aus der Adresse nehmen, sonst öffnet jedes Neuladen Video oder Tour wieder. Erst nach start.js, das die Adresse beim Start liest. */
    if (q.has('hilfe')) setTimeout(() => { const u = new URLSearchParams(location.search); u.delete('hilfe'); history.replaceState(history.state, '', location.pathname + (u.toString() ? '?' + u : '') + location.hash); }, 0);
    else if (!gesehen() && !q.has('demo') && !q.has('stueck') && !q.has('foto') && !window.__dsAusLivre && window.self === window.top) willkommen();   // Abnahme 28.11.2026: nie über einer Übergabe aus dem Brand book   // in der Werkbank (im Laptop-Bildschirm) keine Begrüssung
  }
  if (window.__ST) los(); else document.addEventListener('ds:bereit', los, { once: true });
  window.DSHilfe = { willkommen, starte, video, hilfeMenue, zu };
})();
