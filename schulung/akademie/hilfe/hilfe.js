/* Hilfe-Chat der Academy · The Cat & Gun (24.11.2026).
   Sucht im Browser in hilfe.json, ohne Server und ohne KI. Suchmaschine: suche.js, unverändert aus dem Werkzeug Inquiries & chat (CG_SUCHE).
   Hat keine hinterlegte Antwort alle Sachwörter der Frage, rät der Chat nicht: Die Frage kann an Tasty Studios geschickt werden.
   Das geht über den kostenlosen Nachrichten-Kanal ntfy.sh (wie der Besuchs-Melder); Robert abonniert den Kanal in der ntfy-App oder unter https://ntfy.sh/<KANAL>.
   Neue Antworten trägt Robert in hilfe.json ein. */
(function () {
  var KANAL = 'catgun-academy-843fdd508337';
  var MELDEN = 'https://ntfy.sh/' + KANAL;
  var KEY = 'cg-academy-hilfe';
  var daten = null, laedt = null;
  function e(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function laden() {
    if (daten || laedt) return laedt;
    laedt = fetch('hilfe.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
      daten = (d.antworten || []).map(function (a) { return { id: a.id, frage: a.frage, antwort: a.antwort, woerter: (a.andere || []).concat(a.stichwoerter || []), bereich: a.werkzeug || '', raum: a.raum, werkzeug: a.werkzeug }; });
      return daten;
    }).catch(function () { daten = []; return daten; });
    return laedt;
  }
  var RAUM = { start: 'Start here', website: 'The website', menu: 'The menu', gaeste: 'Guests', marke: 'The brand', druck: 'Print & Instagram', besuche: 'Visits', basics: 'Basics' };

  var knopf = document.createElement('button');
  knopf.type = 'button'; knopf.className = 'hilfe-knopf'; knopf.setAttribute('aria-expanded', 'false');
  knopf.innerHTML = '<span class="hilfe-knopf__punkt" aria-hidden="true"></span>Ask a question';
  var fenster = document.createElement('section');
  fenster.className = 'hilfe'; fenster.setAttribute('aria-label', 'Help'); fenster.hidden = true;
  fenster.innerHTML =
    '<div class="hilfe__kopf"><div><span class="hilfe__zeile">Academy · Help</span><b>Ask a question</b></div><button type="button" class="hilfe__zu" aria-label="Close">×</button></div>' +
    '<div class="hilfe__verlauf" aria-live="polite"><div class="hb hb--hilfe">Ask about a tool, a button or how something works. The answers come from the guides of the tools. If there is no answer yet, you can send the question to Tasty Studios.</div>' +
    '<div class="hilfe__vorschlaege"></div></div>' +
    '<form class="hilfe__form"><input type="text" name="frage" maxlength="400" autocomplete="off" placeholder="For example: How do I change the opening hours?" aria-label="Your question"><button type="submit" aria-label="Ask">↑</button></form>';
  document.body.appendChild(fenster); document.body.appendChild(knopf);
  var verlauf = fenster.querySelector('.hilfe__verlauf'), form = fenster.querySelector('form'), feld = form.querySelector('input');

  function auf(an) {
    fenster.hidden = !an; knopf.setAttribute('aria-expanded', an ? 'true' : 'false'); knopf.classList.toggle('offen', an);
    if (an) { laden().then(vorschlaege); setTimeout(function () { feld.focus(); }, 60); }
  }
  knopf.addEventListener('click', function () { auf(fenster.hidden); });
  fenster.querySelector('.hilfe__zu').addEventListener('click', function () { auf(false); knopf.focus(); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && !fenster.hidden) auf(false); });

  function vorschlaege() {
    var box = fenster.querySelector('.hilfe__vorschlaege'); if (!box || box.childNodes.length || !daten || !daten.length) return;
    var raum = (document.body.getAttribute('data-raum') || '');
    var eigene = daten.filter(function (a) { return a.raum === raum; }), rest = daten.filter(function (a) { return a.raum !== raum; });
    eigene.concat(rest).slice(0, 3).forEach(function (a) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = a.frage;
      b.addEventListener('click', function () { fragen(a.frage); }); box.appendChild(b);
    });
  }
  function blase(html, art) { var d = document.createElement('div'); d.className = 'hb hb--' + art; d.innerHTML = html; verlauf.appendChild(d); verlauf.scrollTop = verlauf.scrollHeight; return d; }

  function fragen(text) {
    text = String(text || '').trim(); if (!text) return;
    var v = fenster.querySelector('.hilfe__vorschlaege'); if (v) v.remove();
    blase(e(text), 'gast');
    laden().then(function (liste) {
      var r = window.CG_SUCHE ? window.CG_SUCHE.finde(text, liste) : { treffer: [], sicher: false };
      if (r.sicher && r.treffer.length) {
        var raum = document.body.getAttribute('data-raum') || '';
        var tr = r.treffer.slice().sort(function (x, y) { return (y.raum === raum) - (x.raum === raum); });
        tr.slice(0, 1).forEach(function (a) {
          var weg = a.raum ? '<a class="hb__weg" href="raum-' + e(a.raum) + '.html">Room · ' + e(RAUM[a.raum] || a.raum) + ' →</a>' : '';
          blase('<small>' + e(a.werkzeug || 'Academy') + '</small>' + e(a.antwort).replace(/«/g, '<em>«').replace(/»/g, '»</em>') + weg, 'hilfe');
        });
      } else melden(text);
    });
  }

  function melden(text) {
    var d = blase('<small>No answer yet</small>There is no answer to this question in the Academy yet. You can send it to Tasty Studios.' +
      '<div class="hb__melden"><input type="text" maxlength="80" placeholder="Your name (optional)" aria-label="Your name"><button type="button">Send the question</button></div>', 'hilfe');
    var b = d.querySelector('button'), n = d.querySelector('input');
    b.addEventListener('click', function () {
      b.disabled = true; b.textContent = 'Sending …';
      var titel = 'Academy The Cat & Gun: new question';
      var seite = document.title.replace(/ · Academy · The Cat & Gun$/, '');
      var body = text + '\n\nFrom: ' + (n.value.trim() || 'no name') + '\nPage: ' + seite;
      fetch(MELDEN, { method: 'POST', body: body, headers: { 'Title': titel, 'Tags': 'question' } }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        merken(text);
        d.querySelector('.hb__melden').outerHTML = '<p class="hb__ok">Sent. Tasty Studios has your question.</p>';
      }).catch(function () {
        b.disabled = false; b.textContent = 'Send again';
        if (!d.querySelector('.hb__fehler')) d.insertAdjacentHTML('beforeend', '<p class="hb__fehler">The question could not be sent. Please check the internet connection and try again.</p>');
      });
    });
  }
  function merken(text) { try { var l = JSON.parse(localStorage.getItem(KEY) || '[]'); l.push({ frage: text, am: new Date().toISOString() }); localStorage.setItem(KEY, JSON.stringify(l.slice(-50))); } catch (err) {} }

  form.addEventListener('submit', function (ev) { ev.preventDefault(); var t = feld.value; feld.value = ''; fragen(t); });
  window.ACADEMY_HILFE = { auf: auf, fragen: fragen };
})();
