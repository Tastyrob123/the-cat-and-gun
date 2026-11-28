/* Prüfseite von Inquiries & chat (pruefung.html, Kopie von La Réception des Culinarium): eigenes Skript, weil die Website online keine eingebetteten Skripte zulässt (CSP). */
(function () {
  var LEX = {
    ANFRAGE: ['«This inquiry no longer exists.»', 'It was deleted in another window, or it was older than twelve months.', 'Press «Reload». The list then shows what is there now.'],
    FORMULAR: ['A guest cannot send a question from the chat.', 'The question was empty, or the contact has a form that cannot be a phone number, email or Instagram name. The guest sees the message in the chat.', 'Nothing to do: the guest corrects it. If many guests see it, look at the chat on the website.'],
    EINGABE: ['An entry was refused.', 'A field was empty, too long or in the wrong form.', 'Read the hint in the message and change the field. Your text stays in the window.'],
    DATUM: ['«Please pick a date from the calendar.»', '«Valid until» had a date that does not exist.', 'Pick the date in the calendar, or leave the field empty for no end.'],
    BILD: ['A photo could not be added.', 'The file is not a photo (only JPG, PNG or WebP), cannot be opened, or is too large even after it was made smaller.', 'Choose another photo. Small photos (under 600 px) work, but look soft.'],
    KONFLIKT: ['«Someone changed the answers in another window.»', 'Two windows had the tool open; the other one saved first. Nothing was overwritten.', 'Copy your text, press «Reload», look at what the other window changed, and add your text again.'],
    NICHTS: ['«Nothing changed, nothing published.»', 'The draft is the same as the answers file on the website.', 'Nothing to do.'],
    LAEUFT: ['«Publishing is already running.»', 'Someone pressed «Publish» a moment ago, maybe in another window.', 'Wait a few seconds and look at the bar at the bottom.'],
    PRUEFUNG: ['«The answers file did not check out. The website is unchanged.»', 'After writing, the file was read back and was not exactly what was checked. The old file is back.', 'Press «Publish» again. If it happens again: write down the time and the message.'],
    VERLAUF: ['«This version does not exist.»', 'The earlier version was removed or never published.', 'Open «Earlier versions» again and pick another one.'],
    VEROEFFENTLICHEN: ['Changes wait, or nothing is published yet.', 'Answers you saved are in the draft. The chat on the website only knows what was published.', 'Press «Publish» in the bar at the bottom.'],
    WISSEN: ['The base answers are missing.', 'steckbrief.json is missing or damaged.', 'Build it again: python3 _bau/steckbrief_bau.py (needs the folder _quelle).'],
    DATEI: ['A file is damaged.', 'A stored file cannot be read and has no good backup.', 'Look under «Data» above. Write down the time and the message.'],
    GROESSE: ['«This is too large.»', 'More than 200 kB in one request (9 MB for a photo, 12 kB for a chat question).', 'Make the text shorter or choose a smaller photo.'],
    GRENZE: ['«Too many requests in a short time.»', 'Protection against mistakes and attacks: at most 900 calls, 120 changes and 6 chat questions per minute and sender.', 'Wait a minute.'],
    HOST: ['«Wrong address.»', 'The tool was opened through a foreign name.', 'Open it through 127.0.0.1.'],
    HERKUNFT: ['«Not allowed.»', 'The request did not come from the tool itself (another page, another device).', 'Open the tool directly, not inside another page.'],
    VERBINDUNG: ['«No connection.»', 'The server is not running, or the network was gone for a moment. Your text is still there.', 'Start the server (python3 "_werkzeuge/reception/server.py" 9735) and try again.'],
    SERVER: ['Error in the server part.', 'Something unexpected; the exact reason is in the message.', 'Reload. If it happens again: write down the time and the message.'],
    FRAGE: ['A question no longer exists.', 'It was deleted, or it was older than twelve months.', 'Reload.'],
    ANMELDUNG: ['No sign-in before the tool.', 'As planned until the tool is handed over (Master R22). Online, the Worker in _werkzeuge/unterbau/ asks for the password.', 'Nothing to do now.']
  };
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  $('#lex').innerHTML = Object.keys(LEX).map(function (k) { var e = LEX[k]; return '<article id="' + k + '"><h3>' + k + '</h3><p><b>See</b> ' + esc(e[0]) + '</p><p><b>Why</b> ' + esc(e[1]) + '</p><p><b>Do</b> ' + esc(e[2]) + '</p></article>'; }).join('');
  if (location.hash) { var z = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (z) z.scrollIntoView(); }

  function browser() {
    var p = [], ls = true;
    try { localStorage.setItem('__p', '1'); localStorage.removeItem('__p'); } catch (e) { ls = false; }
    p.push({ gruppe: 'Browser', was: 'Storage in the browser', stand: ls ? 'gut' : 'gelb', text: ls ? 'available (last view)' : 'blocked (private window?): the last view is not remembered' });
    var mod = !!(window.fetch && window.Promise && window.CSS && CSS.supports && CSS.supports('display', 'grid'));
    p.push({ gruppe: 'Browser', was: 'Browser can run the tool', stand: mod ? 'gut' : 'rot', text: mod ? navigator.userAgent.replace(/^Mozilla\/5\.0 /, '').slice(0, 90) : 'too old: please use a new Safari, Chrome, Edge or Firefox', stichwort: mod ? '' : 'SERVER' });
    return p;
  }
  function zeichne(p) {
    var gr = '', h = '';
    p.forEach(function (x) {
      if (x.gruppe !== gr) { gr = x.gruppe; h += '<div class="gr">' + esc(gr) + '</div>'; }
      h += '<div class="z ' + esc(x.stand) + '"><i></i><b>' + esc(x.was) + '</b><span>' + esc(x.text) + '</span>' + (x.stichwort ? '<a href="#' + esc(x.stichwort) + '">' + esc(x.stichwort) + '</a>' : '<span></span>') + '</div>';
    });
    $('#punkte').innerHTML = h;
    var rot = p.filter(function (x) { return x.stand === 'rot'; }).length;
    $('#satz').textContent = rot ? rot + (rot === 1 ? ' point needs' : ' points need') + ' attention. The keyword on the right leads to the explanation.' : 'Everything is all right. Yellow means: on purpose, not an error.';
  }
  function fehlerListe(server) {
    var lokal = [];
    try { lokal = JSON.parse(localStorage.getItem('reception-fehler') || '[]').reverse(); } catch (e) { }
    var alle = lokal.map(function (x) { return { zeit: x.zeit, text: x.text, wo: 'this browser' }; }).concat((server || []).map(function (x) { return { zeit: x.zeit, text: x.text, wo: 'server log' }; }));
    $('#fehler').innerHTML = alle.length ? alle.slice(0, 40).map(function (x) { return '<li><time>' + esc(new Date(x.zeit).toLocaleString('en-GB')) + '</time>' + esc(x.text) + ' <small>(' + esc(x.wo) + ')</small></li>'; }).join('') : '<li>No errors noted.</li>';
  }
  function pruefe() {
    var p = browser();
    fetch('api/zustand', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { zeichne(p.concat(d.punkte)); fehlerListe(d.fehler); })
      .catch(function () { p.push({ gruppe: 'Server', was: 'Server part is running', stand: 'rot', text: 'does not answer', stichwort: 'VERBINDUNG' }); zeichne(p); fehlerListe([]); });
  }
  $('#neu').onclick = pruefe;
  document.querySelectorAll('[data-rep]').forEach(function (b) {
    var text = b.textContent, t = 0;
    b.onclick = function () {
      if (!b.classList.contains('scharf')) { b.classList.add('scharf'); b.textContent = 'Sure? Click again'; clearTimeout(t); t = setTimeout(function () { b.classList.remove('scharf'); b.textContent = text; }, 4000); return; }
      clearTimeout(t); b.classList.remove('scharf');
      if (b.dataset.rep === 'fehler') {
        try { localStorage.removeItem('reception-fehler'); } catch (e) { }
        fetch('api/fehler_leeren', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).finally(function () { b.textContent = 'Cleared'; setTimeout(function () { b.textContent = text; }, 2000); pruefe(); });
      } else {
        try { Object.keys(localStorage).forEach(function (k) { if (/^reception-|^rundgang-/.test(k)) localStorage.removeItem(k); }); sessionStorage.clear(); } catch (e) { }
        b.textContent = 'Reset'; setTimeout(function () { b.textContent = text; }, 2000);
      }
    };
  });
  /* Auftritte beim Scrollen (wie «re-auf» im Werkzeug): was beim Zeichnen unterhalb des Bildschirms liegt, wartet mit seiner Bewegung, bis es hereingescrollt wird */
  var aufIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.style.animationPlayState = ''; aufIO.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function auf() {
    if (!aufIO || (window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches)) return;
    var spalte = 0;
    document.querySelectorAll('main > h2, main > .satz, main > .blatt, main > .rep, .lex article').forEach(function (x) {
      if (x.hasAttribute('data-auf')) return;
      x.setAttribute('data-auf', '');
      if (x.getBoundingClientRect().top <= innerHeight) return;
      x.classList.add('re-auf'); x.style.setProperty('--i', x.tagName === 'ARTICLE' ? spalte++ % 3 : 0);
      x.style.animationPlayState = 'paused'; aufIO.observe(x);
    });
  }
  var zeichne0 = zeichne; zeichne = function (p) { zeichne0(p); auf(); };
  pruefe();
})();
