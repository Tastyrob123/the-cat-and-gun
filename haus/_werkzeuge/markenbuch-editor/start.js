/* Brand book editor · The Cat & Gun · läuft vor allem anderen (Master R03, R04, R15). Kopie aus Le Livre der Vorlage.
   Fehlermelder: Skriptfehler nach localStorage «cg-mb-fehler» (letzte 20) und an api/fehler; Netzfehler und fehlende Dateien nie, höchstens 20 je Seite,
   ein eigener Fehlschlag schaltet ab (Safari-Schleife 15.10.2026). Ladezeichen erst nach 280 ms. Kommt livre.js nach 12 s nicht hoch: ein Satz statt leerer Fläche. */
'use strict';
(function () {
  let n = 0, aus = false;
  const melde = (art, text, wo) => {
    if (aus || n >= 20) return; n++;
    const e = { zeit: new Date().toISOString(), art, text: String(text || '').slice(0, 300), wo: String(wo || '').slice(0, 200), seite: location.pathname + location.hash, browser: navigator.userAgent.slice(0, 160) };
    try { const l = JSON.parse(localStorage.getItem('cg-mb-fehler') || '[]'); l.push(e); localStorage.setItem('cg-mb-fehler', JSON.stringify(l.slice(-20))); } catch (x) { /* privat */ }
    try { fetch('api/fehler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(e), keepalive: true }).then(r => { if (!r.ok) aus = true; }, () => { aus = true; }); } catch (x) { aus = true; }
  };
  window.MB_MELDE = melde;
  addEventListener('error', ev => { if (ev.target && ev.target !== window) return; melde('fehler', ev.message, (ev.filename || '').split('/').pop() + ':' + (ev.lineno || 0)); }, true);
  addEventListener('unhandledrejection', ev => { const r = ev.reason; if (r && /Failed to fetch|NetworkError|Load failed|network|abort/i.test(String(r.message || r))) return; melde('versprechen', r && (r.message || r), r && r.stack && r.stack.split('\n')[1]); });
  /* Ladezeichen erst nach 280 ms (R15): kurze Wege zeigen nie ein Zucken */
  window.MB_LADE = setTimeout(() => { const a = document.getElementById('ansicht'); if (a && !a.firstChild) a.innerHTML = '<div class="lade" role="status" aria-label="Loading"><span class="lade__r"></span></div>'; }, 280);
  /* Startfehler, wenn das Werkzeug gar nicht hochkommt (R04): nach 12 s ein Satz mit Weg zur Anleitung */
  window.MB_TUER = setTimeout(() => {
    if (window.MB_BEREIT) return;
    const a = document.getElementById('ansicht'); if (!a) return;
    const n = (window.WO_HAUS && WO_HAUS.namen && WO_HAUS.namen.marke) || 'Brand book editor';
    a.innerHTML = '<div class="platte li-tuer" role="alert"><h1>' + n.replace(/[<>&]/g, '') + ' does not start.</h1><p class="li-tuer__g">The program of the page did not load (network or a blocked script).</p><p>If «Reload» does not help: open the guide.</p><div class="titel__kn"><a class="kn" href="./">Reload<i></i></a><a class="kn kn--linie" href="anleitung.html" target="_blank" rel="noopener">Guide<i></i></a></div></div>';
  }, 12000);
})();
