/* Hereinschweben nach der Uhr für Print & feed (Kern aus der Vorlage) (16.10.2026), gehört zu feder.css. Ersetzt schweben.js (Scroll-Zeitachse).
   Markiert Bühnen, Kacheln, Monatszeilen und Blätter mit data-fd; sobald eines am unteren Rand auftaucht (IntersectionObserver), bekommt es .da.
   Alles, was im selben Augenblick auftaucht, ist eine Gruppe: Staffel 100 ms in Lesereihenfolge. Nach dem Auftritt .gespielt (bleibt ruhig). */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var SEL = '#start .ms-bue, #startWochen>.wo, #startAbteilungen>.wo, #abListe>.wo, .ev-monat__kopf, .ev-raster>.wo, #msNewsletter .ms-wochen>.wo,'
    + ' #startZuletzt>.stueck, #bibliothek>.stueck, .fg-abt__kopf, .fg-abt .stueck, #arten>.stueck, .mit-foto'
    /* Effekte-Standard 23.11.2026 (Print & feed): auch die Teile, die noch stillstanden */
    + ', #hiRaster>.stueck, #nlRaster>.stueck, #fotoRaster>.fo, #msMarke .mb>.mb__p, #msMarke .mb-livre'
    + ', #hsListe>.hs-zeile, #hsListe .hs-raster>.stueck';   // Stücke des Hauses (Mac 23.11.2026)
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
    document.querySelectorAll('.mb__farben').forEach(function (g) { if (g.hasAttribute('data-fd-farben')) return; g.setAttribute('data-fd-farben', ''); [].forEach.call(g.children, function (f, i) { f.style.setProperty('--j', Math.min(i, 12)); }); });
  }
  /* Editor am Handy (Mac 23.11.2026, Robert öffnet «Edit» auch am Handy): unter dem Blatt stehen die Platten (Brand kit, Vorlagen, Fotos, Gestalten).
     Sie schweben beim ersten Erscheinen herein, Farbfelder füllen sich von links; das Blatt selbst bewegt sich nie. Was später neu gezeichnet wird
     (jede Änderung zeichnet die Platte neu), steht sofort still: keine Bewegung bei jedem Speichern. Am Rechner steht alles im ersten Bild, also still. */
  /* 24.11.2026: die einzelnen Teile schweben, nicht die ganze Platte (bei flachen Stücken steht die Platte schon im ersten Bild, ihre Teile weiter unten nicht) */
  var SEL_ED = '.studio .links .tab.an > :not(#bausteine):not(.vorlagen):not(.fotos):not(.ablage), .studio .links #bausteine > :not(.bs-elemente):not(.bs-schriften),'
    + ' .studio .links .bs-elemente > *, .studio .links .bs-schriften > *, .studio .links .vorlagen > *, .studio .links .fotos > *, .studio .links .ablage > *, .studio .rechts .gruppe', edStart = 0;
  function markiereEditor() {
    var st = document.getElementById('start'); if (!document.querySelector('.studio') || (st && !st.hidden)) return;
    var jetzt = Date.now(); if (!edStart) edStart = jetzt;
    var still = innerWidth > 900 || jetzt - edStart > 5000;
    document.querySelectorAll(SEL_ED).forEach(function (el) {
      if (el.hasAttribute('data-fd') || el.closest('#flaeche')) return;
      el.setAttribute('data-fd', '');
      el.querySelectorAll('.farben').forEach(function (g) { g.setAttribute('data-fd-farben', ''); [].forEach.call(g.children, function (f, i) { f.style.setProperty('--j', Math.min(i, 12)); }); });
      if (still) el.classList.add('da', 'gespielt'); else io.observe(el);
    });
  }
  var plan = 0;
  function los() {
    var ed = document.querySelector('.studio'); if (ed) new MutationObserver(function () { requestAnimationFrame(markiereEditor); }).observe(ed, { childList: true, subtree: true });
    markiereEditor(); var w = document.getElementById('start') || document.body; new MutationObserver(function () { if (!plan) plan = requestAnimationFrame(function () { plan = 0; markiere(); }); }).observe(w, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] }); markiere(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
