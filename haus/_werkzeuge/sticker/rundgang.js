/* Sticker editor · Rundgang (Werkzeug-Master R18, Vorlage fuehrung.js ohne Kurzfilme): beim ersten Öffnen ein Lichtkegel auf echte Stücke,
   fünf Schritte, erklärt was und wozu, nie die Bedienung. Wieder über den Knopf «Guide» oder ?rundgang. Nicht für Prüfprogramme. */
(function () {
  'use strict';
  const LS = 'catgun-sticker-rundgang', $ = s => document.querySelector(s);
  /* Abnahme 28.11.2026 (G2, wie die Vorlage in Inquiries & chat): ?rundgang gilt einmal und wird gleich aus der Adresse genommen.
     Sonst startet der Rundgang bei jedem Neuladen wieder. */
  const ERZWINGEN = /[?&]rundgang/.test(location.search);
  if (ERZWINGEN) { try { const q = new URLSearchParams(location.search); q.delete('rundgang'); const r = q.toString(); history.replaceState(history.state, '', location.pathname + (r ? '?' + r : '') + location.hash); } catch (e) { } }
  function merk() { try { localStorage.setItem(LS, '1'); } catch (e) { } }
  const SCHRITTE = [
    { ziel: '#startBereiche', vor: () => SKStart.zeige('start'), t: 'Areas', s: 'Every kind of sticker of the house has its own area: from the house, pool and juices, from the menu, the Super Juices and around the house.' },
    { ziel: '#msNav [data-ansicht="galerie"]', vor: () => SKStart.zeige('start'), t: 'All stickers', s: 'The gallery with every sticker. Favourites stand in front, less important ones at the back.' },
    { ziel: '#wirt', vor: () => { SKStart.zu(); }, t: 'The sticker', s: 'Words, colours and each part of the sticker on its own. Colours come from the brand book, so they stay the colours of the house.' },
    { ziel: '#leiste', vor: () => { }, t: 'Save and publish', s: 'Save keeps your work for the house. Publish makes the print files that Print & feed takes.' },
    { ziel: '.ausgabe', vor: () => { }, t: 'Print file', s: 'Every sticker as a PDF for the printer: 3 mm bleed, the cut line and the fonts inside.' }
  ];
  let i = 0, el = null;
  function zeige() {
    const sc = SCHRITTE[i]; sc.vor();
    setTimeout(() => {
      const z = $(sc.ziel); if (!z) return weiter();
      z.scrollIntoView({ block: 'nearest' });
      const r = z.getBoundingClientRect(), pad = 8;
      if (!el) { el = document.createElement('div'); el.className = 'sk-rundgang'; document.body.appendChild(el); el.addEventListener('click', e => { if (e.target.closest('[data-rg="weiter"]')) weiter(); if (e.target.closest('[data-rg="zu"]')) zu(); }); }
      const unten = r.bottom + 200 < innerHeight, links = Math.max(16, Math.min(innerWidth - 336, r.left));
      el.innerHTML = `<div class="sk-rundgang__kegel" style="left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + 2 * pad}px;height:${r.height + 2 * pad}px"></div>
        <div class="sk-rundgang__karte" role="dialog" aria-label="Guide" style="left:${links}px;${unten ? `top:${Math.min(innerHeight - 190, r.bottom + 16)}px` : `top:${Math.max(16, r.top - 196)}px`}">
        <small>${i + 1} of ${SCHRITTE.length}</small><b>${sc.t}</b><p>${sc.s}</p><div><button data-rg="zu">Close</button><button data-rg="weiter" class="an">${i + 1 < SCHRITTE.length ? 'Next' : 'Done'}</button></div></div>`;
    }, 450);
  }
  function weiter() { i++; if (i >= SCHRITTE.length) return zu(); zeige(); }
  function zu() { if (el) el.remove(); el = null; merk(); }
  function start() { i = 0; merk(); zeige(); }   /* gilt als gesehen, sobald er läuft: kommt nach Neuladen, Wegklicken oder Ende nicht von selbst wieder */
  function los() {
    ['#btnHilfe', '#startHilfe'].forEach(s => { const b = $(s); if (b) b.addEventListener('click', e => { e.stopImmediatePropagation(); start(); }, true); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && el) zu(); });
    const t = setInterval(() => {
      if (!window.SKStart || !SKStart.bereit) return; clearInterval(t);
      let gesehen = false; try { gesehen = localStorage.getItem(LS) === '1'; } catch (e) { }
      const roboter = navigator.webdriver || window.top !== window;
      if (ERZWINGEN || (!gesehen && !roboter)) setTimeout(start, 600);
    }, 200);
  }
  window.SKRundgang = { start };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
