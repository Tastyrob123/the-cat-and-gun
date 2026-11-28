/* Menus & price lists · Prüfseite (16.10.2026, R23): läuft ohne carte.js. Liest /the-cat-and-gun/haus/_werkzeuge/carte/api/pruefung, zeigt Browser, Server, Karten, Druck,
   Sicherungen und Fehler; Reparaturen (nur Direktion) mit zwei Klicks. */
(function () {
  'use strict';
  var API = '/the-cat-and-gun/haus/_werkzeuge/carte/api/';
  var $ = function (s) { return document.querySelector(s); };
  var h = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var zeile = function (t, wert, ok) { return '<div><span>' + h(t) + '</span><b class="' + (ok === true ? 'ja' : ok === false ? 'nein' : '') + '">' + h(wert) + '</b></div>'; };
  var NAME = {};   // Namen der Karten kommen vom Server
  var W = { node: 'Printing the PDF', playwright: 'Print program', pdftotext: 'Checking the PDF', speicher: 'Storage', druck: 'Printing the PDF', pdfpruefung: 'Checking the PDF' };
  var wer = 'Team The Cat & Gun', rolle = 'direktion', lokal = [];   // Robert 20.10.2026: keine Abfrage «Wer arbeitet hier?», fester Eintrag bis zur Auslieferung
  try { lokal = JSON.parse(localStorage.getItem('lc-fehler') || '[]'); } catch (e) { /* ohne Speicher */ }

  var sp = true; try { localStorage.setItem('lc-probe', '1'); localStorage.removeItem('lc-probe'); } catch (e) { sp = false; }
  $('#p-browser').innerHTML = zeile('Connections (fetch)', typeof fetch === 'function' ? 'there' : 'missing', typeof fetch === 'function') +
    zeile('Browser storage (view)', sp ? 'fine' : 'blocked, the tool remembers nothing', sp) +
    zeile('Name in the log', 'Team The Cat & Gun · Manager (no login until handover)', true) +
    zeile('Window', innerWidth + ' × ' + innerHeight + ' px', true);

  function lade() {
    var t0 = performance.now();
    /* Abnahme 28.11.2026: «published» stand auch bei Karten, die noch nie veröffentlicht wurden. Ob es ein veröffentlichtes PDF gibt, sagt der Weg «status». */
    var live = {};
    return fetch(API + 'status', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { ((j && j.karten) || []).forEach(function (k) { live[k.ziel] = !!(k.live || k.pdf_zeit); }); }).catch(function () { }).then(function () { return fetch(API + 'pruefung', { cache: 'no-store' }); }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.fehler || ('Answer ' + r.status)); return j; }); }).then(function (g) {
      $('#p-server').innerHTML = zeile('Server answer', Math.round(performance.now() - t0) + ' ms', true) + zeile('Running for', Math.round(g.seit / 60) + ' minutes', true) +
        zeile('Running', g.online ? (g.vorfuehrung ? 'online, demo (nothing lasts)' : 'online with storage') : 'on the local computer', !g.vorfuehrung) +
        zeile('Data of the tool', g.speicher_mb + ' MB', true) +
        zeile('Publishing', g.bau && g.bau.laeuft ? 'running (' + (g.bau.schritt || '') + ')' : (g.bau && g.bau.fehler ? 'last stopped: ' + g.bau.fehler.slice(0, 120) : 'ready'), !(g.bau && g.bau.fehler));
      $('#p-karten').innerHTML = (g.kartenliste || []).map(function (k) {
        return zeile(NAME[k.ziel] || k.name, k.lesbar ? (k.entwurf ? 'draft waiting' : live[k.ziel] === false ? 'not published yet' : 'published') + (k.stand ? ' · version ' + k.stand : '') + ' · ' + k.verlauf + ' earlier version' + (k.verlauf === 1 ? '' : 's') + (k.grundstand ? '' : ' · original missing') : 'not readable', k.lesbar && k.grundstand);
      }).join('');
      $('#p-druck').innerHTML = Object.keys(g.werkzeug || {}).map(function (k) { return zeile(W[k] || k, g.werkzeug[k] ? 'fine' : 'missing', !!g.werkzeug[k]); }).join('') + (g.online ? '' : zeile('Printed tests', g.probe_pdfs + ' PDF', true));
      var s = g.sicherungen || [];
      $('#p-sich').innerHTML = g.online ? zeile('Backup', 'Storage online; every publication stays under «Earlier versions»', true)
        : zeile('Last daily backup', s.length ? s[0].datei.replace('.tar.gz', '') + ' · ' + s[0].mb + ' MB' : 'none', s.length > 0) + zeile('Kept', s.length + ' of at most 14 days', s.length > 0) + zeile('Copy outside this computer', 'not set up', false);
      var f = (g.fehler || []).slice().reverse().map(function (x) { return zeile('Server', x.slice(0, 220), false); })
        .concat((g.browserfehler || []).map(function (x) { return zeile('Browser · ' + x.zeit + (x.seite ? ' · ' + x.seite : ''), x.text, false); }))
        .concat(lokal.slice(-5).reverse().map(function (x) { return zeile('This browser · ' + String(x.zeit).slice(0, 19).replace('T', ' '), x.text, false); }));
      $('#p-fehler').innerHTML = f.join('') || zeile('Errors', 'none logged', true);
    }).catch(function (e) {
      $('#p-server').innerHTML = zeile('Server answer', 'none: ' + e.message, false);
      $('#p-fehler').innerHTML = lokal.slice(-5).reverse().map(function (x) { return zeile('This browser · ' + String(x.zeit).slice(0, 19).replace('T', ' '), x.text, false); }).join('') || zeile('Errors', 'none in the browser', true);
    });
  }
  lade();

  var scharf = null, uhr = 0;
  $('#p-rep').addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-rep]'); if (!b) return;
    if (scharf !== b) {
      if (scharf) { scharf.removeAttribute('data-scharf'); scharf.textContent = scharf.dataset.t; }
      scharf = b; b.dataset.t = b.dataset.t || b.textContent; b.setAttribute('data-scharf', ''); b.textContent = 'Click again';
      clearTimeout(uhr); uhr = setTimeout(function () { if (scharf) { scharf.removeAttribute('data-scharf'); scharf.textContent = scharf.dataset.t; scharf = null; } }, 5000);
      return;
    }
    clearTimeout(uhr); b.removeAttribute('data-scharf'); b.textContent = b.dataset.t; scharf = null;
    fetch(API + 'reparatur', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Carte-Wer': encodeURIComponent(wer), 'X-Carte-Rolle': rolle }, body: JSON.stringify({ art: b.dataset.rep }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.fehler || 'Answer ' + r.status); return j; }); })
      .then(function (j) { $('#p-quit').textContent = j.text || 'Done.'; if (b.dataset.rep === 'fehler') { try { localStorage.removeItem('lc-fehler'); lokal = []; } catch (e) { /* egal */ } } lade(); })
      .catch(function (e) { $('#p-quit').textContent = 'Not done: ' + e.message; });
  });
})();
