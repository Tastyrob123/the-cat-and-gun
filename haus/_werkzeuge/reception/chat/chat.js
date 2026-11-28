/* Chat auf der Website · The Cat & Gun (22.11.2026). Kopie des Eckfensters «Gäste-Chat» der Culinarium-Website (website/assets/anfrage.js), ohne KI:
   Die Antworten liegen als Datei neben diesem Skript (antworten.json, geschrieben von «Publish» in Inquiries & chat), gesucht wird hier im Browser
   (suche.js). Findet der Chat nichts, bietet er an, die Frage an das Haus zu schicken; Name und Kontakt sind freiwillig und so beschriftet.
   Einbau (erst in der Schlussrunde, durch den Website-Chat): <link rel="stylesheet" href="…/chat/chat.css"> und <script src="…/chat/chat.js" defer></script>
   Wahlweise am Skript: data-antworten="URL der Antwortdatei" · data-ziel="URL für Fragen an das Haus" (Standard /reception/api/formular, Weg des Werkzeugs)
   Bewegung nur über transform und opacity; keine Abdunklung, die Seite bleibt bedienbar; am Handy eine Lade von unten mit Griff.
   window.CG_CHAT stellt antwortHTML() bereit, damit «Try the chat» im Werkzeug dieselben Antworten zeigt wie die Website. */
(function () {
  'use strict';
  var D = document, ich = D.currentScript;
  var BASIS = ich && ich.src ? ich.src.replace(/[^\/]*(\?.*)?$/, '') : '';
  var ANTWORTEN = (ich && ich.getAttribute('data-antworten')) || BASIS + 'antworten.json';
  var ZIEL = (ich && ich.getAttribute('data-ziel')) || '/reception/api/formular';
  var NUR_WERKZEUG = !!(ich && ich.hasAttribute('data-nur-werkzeug'));
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var ZURUECK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 9.67 2.67 6.33 6 3M2.67 6.33h7.33a3.33 3.33 0 0 1 0 6.67h-2"/></svg>';
  var PFEIL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
  var NEU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8a5.5 5.5 0 1 0 1.7-4M2.5 2.5V5H5"/></svg>';
  var BLASE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>';
  /* Vorschläge zum Antippen: Wege, wie Gäste fragen, keine Angaben über das Haus */
  var KARTEN = [['Opening hours', 'Every day', 'When are you open?'], ['Find us', 'Catangnan', 'Where are you?'],
    ['Breakfast', 'Brekky', 'Do you have breakfast?'], ['Pool table', 'And the playground', 'Do you have a pool table?']];

  /* Antworttext lesbar setzen wie im Werkzeug (antwortHTML der Vorlage): Zeilen mit «- » werden eine Liste, «Name: Wert» mit dem Namen hervorgehoben
     Teile mit « · » stehen je auf einer eigenen Zeile, damit kein «·» am Rand einer Zeile hängen bleibt (wie «From» in der persönlichen Antwort). */
  function textHTML(t) {
    var z = String(t || '').split('\n'), h = '', liste = [];
    var fertig = function () { if (liste.length) { h += '<ul>' + liste.map(function (x) { var m = x.match(/^(.{2,60}?):\s*(.+)$/); return '<li>' + (m ? '<b>' + esc(m[1]) + '</b> <span>' + esc(m[2]) + '</span>' : esc(x)) + '</li>'; }).join('') + '</ul>'; liste = []; } };
    z.forEach(function (x) { var m = x.match(/^\s*[-•]\s+(.*)$/); if (m) liste.push(m[1]); else { fertig(); if (x.trim()) h += '<p>' + x.split(/\s+·\s+/).map(esc).join('<br>') + '</p>'; } });
    fertig(); return h;
  }
  function sichererLink(h) { h = String(h || ''); return /^(https:\/\/|\/[^\/])/.test(h) ? h : ''; }
  function antwortHTML(a, bilderBasis) {
    var l = a.link && sichererLink(a.link.href), b = a.bild ? (bilderBasis == null ? BASIS : bilderBasis) + a.bild : '';
    return '<div class="cc__a"><span class="cc__a-k">' + esc(a.frage) + '</span>' + (b ? '<img class="cc__a-bild" src="' + esc(b) + '" alt="" loading="lazy" decoding="async">' : '') +
      textHTML(a.antwort) + (l ? '<a class="cc__a-link" href="' + esc(l) + '"' + (/^https/.test(l) ? ' target="_blank" rel="noopener"' : '') + '>' + esc(a.link.text || 'Open') + PFEIL + '</a>' : '') + '</div>';
  }
  window.CG_CHAT = { antwortHTML: antwortHTML, textHTML: textHTML, KARTEN: KARTEN };
  if (NUR_WERKZEUG) return;

  var daten = null, laden = null, cc, ccLog, ccKnopf;
  function suche() {
    if (window.CG_SUCHE) return Promise.resolve();
    return new Promise(function (ok, nein) { var s = D.createElement('script'); s.src = BASIS + 'suche.js'; s.onload = ok; s.onerror = nein; D.head.appendChild(s); });
  }
  function holeAntworten() {
    if (daten) return Promise.resolve(daten);
    if (!laden) laden = Promise.all([suche(), fetch(ANTWORTEN, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })])
      .then(function (x) { daten = x[1]; return daten; }).catch(function (e) { laden = null; throw e; });
    return laden;
  }
  function bauen() {
    ccKnopf = D.createElement('button'); ccKnopf.type = 'button'; ccKnopf.className = 'cc-knopf'; ccKnopf.setAttribute('aria-expanded', 'false'); ccKnopf.setAttribute('aria-controls', 'cc');
    ccKnopf.innerHTML = '<span class="cc-knopf__t"><b class="cc-knopf__auf">Ask us</b><b class="cc-knopf__zu" aria-hidden="true">Close</b></span>' +
      '<i><span class="cc-knopf__c">' + BLASE + '</span><span class="cc-knopf__x" aria-hidden="true">' + ZURUECK + '</span></i>';
    cc = D.createElement('section'); cc.className = 'cc'; cc.id = 'cc'; cc.setAttribute('aria-label', 'Ask The Cat & Gun'); cc.hidden = true;
    cc.innerHTML = '<button class="cc__griff" type="button" aria-label="Close"><i></i></button>' +
      '<header class="cc__kopf"><span class="cc__c" aria-hidden="true"></span><div><b>Ask us</b><span>The Cat & Gun</span></div>' +
      '<button class="cc__neu" type="button" aria-label="Start again" title="Start again">' + NEU + '</button>' +
      '<button class="cc__zu" type="button" aria-label="Close" title="Close">' + ZURUECK + '</button></header>' +
      '<div class="cc__log" aria-live="polite"></div>' +
      '<form class="cc__feld" novalidate><label><span class="cc-vh">Your question</span><textarea name="frage" rows="1" maxlength="600" placeholder="Your question" enterkeyhint="send"></textarea></label>' +
      '<button class="cc__send" type="submit" aria-label="Ask">' + PFEIL + '</button></form>' +
      '<p class="cc__fuss">Answers come from The Cat & Gun. A question you send goes to the house only.</p>';
    D.body.appendChild(cc); D.body.appendChild(ccKnopf);
    ccLog = cc.querySelector('.cc__log');
    ccKnopf.addEventListener('click', function () { cc.hidden ? auf() : zu(); });
    cc.querySelector('.cc__zu').addEventListener('click', zu);
    cc.querySelector('.cc__griff').addEventListener('click', zu);
    cc.querySelector('.cc__neu').addEventListener('click', start);
    var feld = cc.querySelector('textarea');
    feld.addEventListener('input', function () { feld.style.height = 'auto'; feld.style.height = Math.min(feld.scrollHeight, 120) + 'px'; });
    feld.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); fragen(feld.value); } });
    cc.querySelector('.cc__feld').addEventListener('submit', function (e) { e.preventDefault(); fragen(feld.value); });
    cc.addEventListener('click', function (e) {
      var v = e.target.closest('[data-frage]'); if (v) { fragen(v.getAttribute('data-frage')); return; }
      var w = e.target.closest('[data-weiter]'); if (w) { weitergeben(w.closest('.cc__b'), w.getAttribute('data-weiter')); w.remove(); }
    });
    D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && cc && !cc.hidden) zu(); });
    var y0 = null;   // Lade am Handy: am Griff nach unten ziehen schliesst
    cc.querySelector('.cc__griff').addEventListener('pointerdown', function (e) { y0 = e.clientY; });
    addEventListener('pointerup', function (e) { if (y0 !== null && e.clientY - y0 > 60) zu(); y0 = null; });
    start();
  }
  function start() {
    ccLog.innerHTML = '<div class="cc__start"><h3>What would you like to know?</h3><p>Opening hours, food, the pool table, how to find us. If I don’t know, you can send your question to the house.</p>' +
      '<div class="cc__karten">' + KARTEN.map(function (k) { return '<button type="button" data-frage="' + esc(k[2]) + '"><b>' + esc(k[0]) + '</b><span>' + esc(k[1]) + '</span></button>'; }).join('') + '</div></div>';
  }
  function auf() {
    if (!cc) bauen();
    cc.hidden = false; void cc.offsetWidth; D.documentElement.classList.add('cc-offen'); ccKnopf.setAttribute('aria-expanded', 'true');
    holeAntworten().catch(function () {});
    if (matchMedia('(min-width:861px)').matches) setTimeout(function () { cc.querySelector('.cc__feld textarea').focus({ preventScroll: true }); }, 350);
  }
  function zu() {
    if (!cc || cc.hidden) return;
    D.documentElement.classList.remove('cc-offen'); ccKnopf.setAttribute('aria-expanded', 'false');
    setTimeout(function () { if (!D.documentElement.classList.contains('cc-offen')) cc.hidden = true; }, 560);
    ccKnopf.focus({ preventScroll: true });
  }
  function blase(wer, html) { var p = D.createElement('div'); p.className = 'cc__b cc__b--' + wer; p.innerHTML = html; ccLog.appendChild(p); return p; }
  function telefon() { return daten && daten.kontakt && daten.kontakt.telefon ? ' or call ' + esc(daten.kontakt.telefon) : ''; }
  function fragen(q) {
    q = String(q || '').trim(); var feld = cc.querySelector('.cc__feld textarea');   // nicht das Feld von «Send to the house», das davor im Verlauf steht
    if (!q) return;
    var s = ccLog.querySelector('.cc__start'); if (s) s.remove();
    blase('gast', '<p>' + esc(q) + '</p>'); feld.value = ''; feld.style.height = '';
    holeAntworten().then(function (d) {
      var r = window.CG_SUCHE.finde(q, d.antworten || []);
      if (r.treffer.length) {
        var b = blase('haus', r.treffer.map(function (a) { return antwortHTML(a); }).join(''));
        b.insertAdjacentHTML('beforeend', '<button type="button" class="cc__klein" data-weiter="' + esc(q) + '">Not what you asked? Send it to the house</button>');
      } else {
        var b2 = blase('haus', '<p>I don’t have an answer to that yet. Do you want to send your question to the house? Once the answer is added, the chat knows it too.</p>');
        weitergeben(b2, q);
      }
    }).catch(function () {
      blase('haus', '<p>The chat can’t load its answers right now. Please try again in a moment' + telefon() + '.</p>');
    }).then(function () { ccLog.scrollTop = ccLog.scrollHeight; });
  }
  function weitergeben(nach, q) {   // die Frage an das Haus: Name und Kontakt freiwillig
    [].forEach.call(ccLog.querySelectorAll('.cc__weiter'), function (x) { x.remove(); });   // nur die jüngste Frage bietet das an
    var f = D.createElement('form'); f.className = 'cc__weiter'; f.noValidate = true;
    f.innerHTML = '<p class="cc__weiter-k">Send to the house</p>' +
      '<label><span>Your question</span><textarea name="frage" rows="2" maxlength="1200">' + esc(q) + '</textarea></label>' +
      '<label><span>Name <em>optional</em></span><input name="name" autocomplete="name" maxlength="120"></label>' +
      '<label><span>Phone, email or Instagram <em>optional</em></span><input name="kontakt" autocomplete="email" maxlength="160"></label>' +
      '<p class="cc__weiter-t">Leave a contact only if you want a personal reply. Without it, your question goes to the house without your name.</p>' +
      '<input class="cc-falle" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<button class="cc__schritt" type="submit">Send to the house</button><p class="cc__fehler" role="alert" hidden></p>';
    nach.after(f);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var fe = f.querySelector('.cc__fehler'), kn = f.querySelector('[type=submit]');
      var wert = function (n) { return String(f.elements.namedItem(n).value || '').trim(); };
      if (wert('frage').length < 2) { fe.hidden = false; fe.textContent = 'Please write your question.'; return; }
      fe.hidden = true; kn.disabled = true; kn.textContent = 'Sending …';
      fetch(ZIEL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ frage: wert('frage'), name: wert('name'), kontakt: wert('kontakt'), website: wert('website'), seite: location.pathname }) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.ok) throw new Error(String(j.fehler || '').replace(/^[A-ZÄÖÜ-]+ · /, '')); return j; }); })
        .then(function () {
          var kontakt = !!wert('kontakt');
          var p = D.createElement('div'); p.className = 'cc__b cc__b--haus';
          p.innerHTML = '<p>Thank you. Your question is with the house.' + (kontakt ? ' You may get a personal reply.' : '') + ' Once the answer is added, it will be here in the chat.</p>';
          f.replaceWith(p);
        })
        .catch(function (x) { fe.hidden = false; fe.textContent = (x && x.message ? x.message + ' ' : 'Not sent. ') + 'Your text is still here. Please try again' + telefon() + '.'; kn.disabled = false; kn.textContent = 'Send to the house'; })
        .then(function () { ccLog.scrollTop = ccLog.scrollHeight; });
    });
    ccLog.scrollTop = ccLog.scrollHeight;
  }
  /* Öffnen auch über Links: href="#chat" oder data-chat */
  D.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="#chat"], [data-chat]');
    if (!a) return; e.preventDefault(); auf();
  });
  function los() { if (!ccKnopf) bauen(); if (location.hash === '#chat') auf(); }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', los); else los();
})();
