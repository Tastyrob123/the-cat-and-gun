/* Sticker editor · The Cat & Gun: Kopie von haeuser/catgun/feder.js aus Print & feed (23.11.2026, Effekte-Standard; Kern Schlössli imprimerie), nur die Auswahl auf die Teile des Sticker editor gestellt.
   Markiert Bühnen, Kacheln, Monatszeilen und Blätter mit data-fd; sobald eines am unteren Rand auftaucht (IntersectionObserver), bekommt es .da.
   Alles, was im selben Augenblick auftaucht, ist eine Gruppe: Staffel 100 ms in Lesereihenfolge. Nach dem Auftritt .gespielt (bleibt ruhig). */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var SEL = '#startBereiche>.wo, #bereichListe>.wo, #startZuletzt>.stueck, #galerie>.stueck, #arten>.stueck, #neuVorlagen>.stueck,'
    + ' #elementRaster>.stueck, #druckListe .sk-druck, #druckListe .ms-zeile, #farbSeite>.sk-welt, #msDetail .wo, #msDetail .stueck, #startWahl .sk-leerhinweis';
  var io = new IntersectionObserver(function (es) {
    var neu = es.filter(function (e) { return e.isIntersecting; }).sort(function (a, b) { return (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left); });
    neu.forEach(function (e, n) {
      var el = e.target; io.unobserve(el);
      el.style.setProperty('--i', Math.min(n, 6));
      el.classList.add('da');
      el.addEventListener('animationend', function f(ev) { if (ev.target === el && ev.animationName === 'ce-feder') { el.classList.add('gespielt'); el.removeEventListener('animationend', f); } });
    });
  }, { rootMargin: '0px 0px 8% 0px' });
  function markiere() {
    var s = document.getElementById('start'); if (s && !s.classList.contains('bereit')) return;   // erst wenn die Startseite in einem Zug dasteht (start.js)
    document.querySelectorAll(SEL).forEach(function (el) { if (el.hasAttribute('data-fd')) return; el.setAttribute('data-fd', ''); io.observe(el); });
    /* Farbfelder füllen sich von links nach rechts, gestaffelt 90 ms (Muster Schlössli livre/buch.js), höchstens zwölf Schritte */
    document.querySelectorAll('#farbSeite .sk-farbfelder').forEach(function (g) { if (g.hasAttribute('data-fd-farben')) return; g.setAttribute('data-fd-farben', ''); [].forEach.call(g.children, function (f, i) { f.style.setProperty('--j', Math.min(i, 12)); }); });
  }
  /* Editor am Handy (Mac 23.11.2026, wie Print & feed): unter dem Sticker stehen die Platten (Quick, Templates, Elements, Photos, Design); sie schweben beim
     ersten Erscheinen herein, Farbfelder füllen sich von links. Der Sticker selbst bewegt sich nie. Neu Gezeichnetes (jede Änderung) steht sofort still. */
  var SEL_ED = '.studio .links .tab.an > *, .studio .rechts .gruppe', edStart = 0;
  function markiereEditor() {
    var st = document.getElementById('start'); if (!document.querySelector('.studio') || (st && !st.hidden)) return;
    if (!window.SKStart || !SKStart.bereit) return;   // erst wenn Stand und Sticker stehen: vorher liegt alles im ersten Bild und gälte sofort als «aufgetreten» (26.11.2026)
    var jetzt = Date.now(); if (!edStart) edStart = jetzt;
    var still = jetzt - edStart > 5000;   // seit dem neuen Look (26.11.2026) scrollt der Editor auch am Rechner: Platten schweben überall herein
    document.querySelectorAll(SEL_ED).forEach(function (el) {
      if (el.hasAttribute('data-fd') || el.closest('#flaeche')) return;
      el.setAttribute('data-fd', '');
      if (still) el.classList.add('da', 'gespielt'); else io.observe(el);
    });
  }
  var plan = 0;
  function los() {
    var ed = document.querySelector('.studio'); if (ed) new MutationObserver(function () { requestAnimationFrame(markiereEditor); }).observe(ed, { childList: true, subtree: true });
    markiereEditor(); var nb = 0, wb = setInterval(function () { if ((window.SKStart && SKStart.bereit) || ++nb > 150) { clearInterval(wb); requestAnimationFrame(markiereEditor); } }, 100); var w = document.getElementById('start') || document.body; new MutationObserver(function () { if (!plan) plan = requestAnimationFrame(function () { plan = 0; markiere(); }); }).observe(w, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] }); markiere(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
