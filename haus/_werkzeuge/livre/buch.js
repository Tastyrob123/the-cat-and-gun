/* Style guide · The Cat & Gun (Kopie von buch.js der Vorlage) · «Save as PDF» öffnet das Druckfenster des Browsers (je Kapitel eine A4-Seite quer, buch.css @media print).
   Fotos laden zuerst nur im Blick (lazy); kurz nach dem Laden und vor jedem Druck werden alle geholt, damit im PDF keines fehlt. */
'use strict';
(function () {
  const alle = () => Promise.all([...document.images].map(i => { i.loading = 'eager'; return i.complete ? 0 : new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }); }));   /* addEventListener statt onload: ein zweiter Aufruf überschrieb sonst den ersten, der Druck kam nie (Demo-Check Schlössli 21.10.2026) */
  const b = document.getElementById('bu-pdf');
  /* PDF kleiner (Robert 28.11.2026: «Nacharbeiten»): mit den Fotos in 1800 px wog das PDF rund 44 MB. Für «Save as PDF» nimmt die Seite die Fassung
     mit 800 px (im PDF höchstens 13 cm breit) und stellt danach die grosse wieder ein. Fehlt die kleine Fassung, bleibt das Foto, wie es ist. */
  const druckbild = i => { const u0 = i.getAttribute('src') || ''; if (i.dataset.voll || !/-(1200|1800)\.webp$/.test(u0)) return 0;
    const u = u0.replace(/-(1200|1800)\.webp$/, '-800.webp');
    return new Promise(r => { const t = new Image(); t.onload = () => { i.dataset.voll = u0; i.src = u; r(); }; t.onerror = r; t.src = u; }); };
  const klein = () => Promise.all([...document.images].map(druckbild));
  const voll = () => [...document.images].forEach(i => { if (i.dataset.voll) { i.src = i.dataset.voll; delete i.dataset.voll; } });
  if (b) b.addEventListener('click', () => klein().then(alle).then(() => window.print()));
  addEventListener('afterprint', voll);
  addEventListener('beforeprint', () => { [...document.images].forEach(i => { i.loading = 'eager'; }); });
  addEventListener('load', () => setTimeout(alle, 1200));
})();
