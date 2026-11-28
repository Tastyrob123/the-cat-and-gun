/* Seitenleiste von Visitors · The Cat & Gun (Robert 27.11.2026): Aufbau und Masse genau wie bei Edit website (bureau, aside.wo-rand.dx-rail.dx-lack6),
   auf jeder Seite gleich: im Werkzeug (index.html, registre.js ruft LEISTE.setze) und im Guide (anleitung.html, <aside id="rand" data-leiste="anleitung">).
   Fährt ab 1200 px mit (mitfahren, Kopie aus sticker/neu.js, Commit a284a0fd). Tasten 1–8 öffnen die Werkzeuge. Stile: leiste.css. */
(function () {
  'use strict';
  const H = window.WO_HAUS || {}, N = H.namen || {};
  const NAME = N.besuche || 'Visitors', ZENTRALE = N.zentrale || 'Control panel';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /* lokal /the-cat-and-gun/haus/_werkzeuge/<werkzeug>/ (server.py leitet auf den Prüfserver weiter), online /<werkzeug>/ neben Visitors */
  const MAISON = /\/_werkzeuge\/registre\//.test(location.pathname) ? '../maison/' : '../../maison/';
  const WEG = w => MAISON.replace(/maison\/$/, w + '/');
  const GUIDES = 'https://tastyrob123.github.io/the-cat-and-gun/schulung/akademie/';   /* wie «Guides · 11 videos» im Control panel */
  /* Symbole wie bei Edit website und im Control panel */
  const IC = {
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
    guide: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/>'
  };
  const dxi = n => `<svg class="dx-ico" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;
  /* Die acht Werkzeuge wie in der Seitenleiste des Control panels: Taste, Werkzeug, Name, Satz, Symbol */
  const WERKZEUGE = [['1', 'bureau', 'Website', 'Texts, photos, opening hours', 'web'], ['2', 'carte', 'Menus', 'Food and drinks with prices', 'menu'],
    ['3', 'reception', 'Guests', 'Guest questions and the chat', 'chat'], ['4', 'livre', 'Brand book', 'Logo, colours, fonts, photos', 'buch'],
    ['5', 'markenbuch-editor', 'Brand editor', 'Keeping the brand book up to date', 'palette'], ['6', 'sticker', 'Stickers', 'Stickers with the logo', 'sticker'],
    ['7', 'imprimerie', 'Print & feed', 'Signs, coasters, posts', 'druck'], ['8', 'registre', NAME, 'Visits to the website', 'besuch']];
  /* hier: 'registre' im Werkzeug (Visitors-Eintrag führt zur Übersicht, Untertitel = Stand von heute), 'anleitung' im Guide */
  function html(hier, stand) {
    const imWerkzeug = hier === 'registre';
    const nav = WERKZEUGE.map(([t, w, name, satz, i]) => w === 'registre'
      ? `<a class="dx-jetzt" href="${imWerkzeug ? '#start' : './'}"${imWerkzeug ? ' data-gehe="start"' : ''} aria-current="page" data-dx-taste="${t}"><kbd>${t}</kbd>${dxi(i)}<span><b>${esc(name)}</b><i>${esc(stand || satz)}</i></span></a>`
      : `<a href="${esc(WEG(w))}" data-dx-taste="${t}"><kbd>${t}</kbd>${dxi(i)}<span><b>${esc(name)}</b><i>${esc(satz)}</i></span></a>`).join('');
    return `<div class="dx-s6rahmen"><div class="dx-marke"><a href="${esc(MAISON)}" title="${esc(ZENTRALE)}"><img src="look/wortmarke-weiss.svg" alt="The Cat &amp; Gun · ${esc(ZENTRALE)}"></a><span class="dx-mono">Catangnan, Siargao</span></div>
    <div class="dx-mono dx-rk">Tools <span>keys 1–8</span></div><nav aria-label="Tools of the house">${nav}</nav>
    <div class="dx-rhaus"><span>${dxi('uhr')}Open daily 7AM – 10PM</span><span>${dxi('tel')}+63 962 040 3853</span></div>
    <div class="dx-rfuss">
      <a href="${esc(MAISON)}">${dxi('haus')}<span><b>${esc(ZENTRALE)}</b><i>All tools of the house</i></span></a>
      <a href="anleitung.html"${imWerkzeug ? ' target="_blank" rel="noopener"' : ' aria-current="page"'}>${dxi('buch')}<span><b>Guide</b><i>How ${esc(NAME)} works</i></span></a>
      <a href="./?rundgang" data-dx-rundgang>${dxi('auge')}<span><b>Short tour</b><i>What is where in this tool</i></span></a>
      <a href="${GUIDES}" target="_blank" rel="noopener">${dxi('guide')}<span><b>Guides</b><i>11 videos</i></span></a>
    </div></div>`;
  }
  /* ---------- fährt mit (Robert 27.11.2026, Kopie von mitfahren aus sticker/neu.js, Commit a284a0fd) ----------
     Ist sie höher als das Fenster, scrollt sie mit der Seite, bis ihr unteres Ende am Fensterrand steht, und bleibt dort;
     beim Hochscrollen fährt sie mit zurück, bis ihr oberes Ende wieder oben steht. Passt sie ganz ins Fenster, steht sie oben fest. Ab 1200 px. */
  function mitfahren(rail, scroller) {
    if (!rail || rail.dataset.nlFahrt) return; rail.dataset.nlFahrt = '1';
    let y = null, letzt = 0;
    const rand = () => 22;   /* Luft oben und unten wie bei Edit website (top:22px) */
    const pos = () => scroller === window ? scrollY : scroller.scrollTop;
    function setze() {
      if (innerWidth < 1200 || !rail.offsetHeight) { rail.style.removeProperty('top'); y = null; return; }
      const m = rand(), h = rail.offsetHeight, H = innerHeight, unten = Math.min(m, H - h - m), p = pos();
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
  function setze(rail, hier, stand) {
    if (!rail) return;
    rail.innerHTML = html(hier, stand);
    rail.querySelectorAll('[data-dx-rundgang]').forEach(a => a.onclick = e => { if (window.rundgang) { e.preventDefault(); window.rundgang(); } });
    mitfahren(rail, window);
  }
  /* Tasten 1–8 wie im Control panel: öffnen das Werkzeug der Seitenleiste */
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '') || (e.target && e.target.isContentEditable)) return;
    if (document.querySelector('.rdg-karte, .gross:not([hidden])')) return;   /* nicht während der Short tour und nicht über dem grossen Bild im Guide */
    const a = document.querySelector(`#rand [data-dx-taste="${e.key}"]:not(.dx-jetzt)`); if (a) { e.preventDefault(); location.href = a.href; }
  });
  window.LEISTE = { html, setze, mitfahren, NAME, ZENTRALE, MAISON };
  /* Guide: die Leiste setzt sich selbst */
  const los = () => { const r = document.querySelector('#rand[data-leiste="anleitung"]'); if (r) setze(r, 'anleitung'); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', los) : los();
})();
