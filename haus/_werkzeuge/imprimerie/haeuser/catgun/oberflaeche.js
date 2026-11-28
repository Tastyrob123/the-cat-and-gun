/* Print & feed · The Cat & Gun (Kopie der Hausschicht der Vorlage Culinarium Hannover, 28.10.2026, Hausschicht der Taverne zum Schäfli übernommen, dort nur gelesen; Weg der Wirtschaft am Schlössli und des Berghotel Gasterntal): Werkzeug-Oberfläche «Die Bühne».
   Gleicher Weg wie die Plakatwerkstatt des Landgasthof Ruedihus (haeuser/ruedihus/oberflaeche.js dort, nur gelesen und übernommen).
   Die Plakatwerkstatt hat ein eigenes Gerüst (Übersicht #start mit .ms-leiste/.ms-kopf, Arbeitsfläche mit header.kopf/aside.links); der Kern
   (_Drucksachen-Studio, über Carlton und Doldenhorn) bleibt unberührt. Diese Hausschicht legt nur an, was in allen Werkzeugen des Hauses gleich ist:
   die Marke im Kopf (Zeichen, Name in der Titelschrift, Unterzeile), die runden Knöpfe und «Website ansehen» als goldene Pille, die Startbilder
   (Übersicht «voll» mit dem Haus, jede Ansicht «buehne» mit ihrem Raum). Ids, Knoten und Handler bleiben: Knöpfe und Felder werden nur umgehängt.
   Geladen nach buehne.js (index.html, HAUS_STIL; _qa/culinarium_anpassen.py setzt die Zeile, Quelle _qa/haus/oberflaeche.js). Entfernen = vorheriger Stand. */
(function () {
  if (!window.WO) return;
  var BASIS = '/the-cat-and-gun/haus/assets/bild/';   /* The Cat & Gun: die Fotos der Website (website/assets/bild/, 1200 und 800 px) */
  /* Kopf-Fotos mit 800er-Fassung (kopf/<name>-800.webp) und Breite des Originals: das Foto steht bei 1440 rund 660, bei 1000 rund 385, am Handy rund 265 px breit,
     die 800er reicht dort; ab rund 1700 px Fensterbreite oder bei doppelter Dichte nimmt der Browser das Original (30.10.2026, Oberchef) */
  var B800 = { b07: 1200, b08: 1200, b09: 1200, b16: 1200, b19: 1200, b22: 1200, b24: 1200, b25: 1200, b26: 1200, b31: 1200, b35: 1200, b36: 1200 };
  var FOTO = { msEvents: 'b31', msAbteilungen: 'b24', msHinweise: 'b08', msNewsletter: 'b22', msFotos: 'b19', msMarke: 'b35',
    msLivre: 'b35', msMeine: 'b16', msFreigegeben: 'b26', msNeu: 'b36', msStuecke: 'b09' };
  var WEBSITE = location.port === '9738' ? '/website/' : '/';
  var MARKE = function () { return WO.zeichen() + '<span><b>' + WO.esc(WO.name('druck')) + '</b><small>Print and Instagram · ' + WO.esc(WO.haus.name) + '</small></span>'; };

  /* Marke, runde Knöpfe und Website-Pille in beiden Köpfen */
  function koepfe() {
    var mk = document.getElementById('kopfMarke');
    if (mk && !mk.__wo) {   // die alten Knoten (#kopfZeichen, #kopfName) bleiben verborgen darin, studio.js schreibt sie beim Start
      mk.__wo = 1; mk.classList.add('wo-marke-w');
      var alt = document.createElement('span'); alt.className = 'ws-alt'; alt.hidden = true;
      while (mk.firstChild) alt.appendChild(mk.firstChild);
      mk.innerHTML = MARKE(); mk.appendChild(alt);
    }
    var ms = document.querySelector('.ms-kopf');
    if (ms && !ms.__wo) {
      var z = ms.querySelector('#msKopfZeichen'), n = ms.querySelector('.ms-kopf-name');
      if (z && n) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'wo-marke-w ws-marke'; b.setAttribute('data-ansicht', 'start'); b.setAttribute('aria-label', WO.name('druck') + ', overview');
        b.innerHTML = MARKE(); ms.insertBefore(b, z); z.hidden = true; n.hidden = true; ms.__wo = 1;
      }
    }
    [].forEach.call(document.querySelectorAll('.ms-kopf .rund, .kopf__werk .rund'), function (r) { r.classList.add('ws-rund'); /* eigene Klasse: .wo-kn des Pakets würde die Anzeige der Plakatwerkstatt (verborgene Knöpfe am Handy) überstimmen */ });
    var web = document.querySelector('.ms-kopf .zur-website');
    if (web && !web.__wo) {
      web.__wo = 1;
      var pille = document.createElement('span'); pille.innerHTML = WO.knopf('View website', 'welt', 'gold', { href: WEBSITE, neu: true, klein: true, klasse: 'ws-web' });
      var p = pille.firstChild, neu = document.querySelector('.ms-kopf .ms-kn-neu');
      web.hidden = true; web.parentNode.insertBefore(p, neu ? neu.nextSibling : null);
    }
  }

  /* Startbild der Übersicht: WO.startbild «voll», Gruss und Satz bleiben dieselben Knoten (start.js schreibt sie), das Feld steht darunter */
  function startbild() {
    var g = document.querySelector('#msStart .ms-gruss');
    if (!g || g.__wo) return; g.__wo = 1; g.__b = 1;
    var h = document.getElementById('msGruss'), s = document.getElementById('msSatz');
    var hilf = document.createElement('div');
    hilf.innerHTML = WO.startbild({ werkzeug: 'druck', art: 'voll', h1: ' ', satz: ' ', knoepfe: ' ' });
    var sb = hilf.firstChild; sb.classList.add('ws-sb');
    if (h) { h.classList.add('wo-sb__h'); sb.querySelector('.wo-sb__h').replaceWith(h); }
    if (s) { s.classList.add('wo-sb__satz'); sb.querySelector('.wo-sb__satz').replaceWith(s); }
    var kn = sb.querySelector('.wo-sb__kn'); kn.textContent = '';
    [].slice.call(g.querySelectorAll(':scope>.ms-feld, :scope>#msAlle')).forEach(function (x) { kn.appendChild(x); });
    g.replaceWith(sb);
  }
  /* Startbild jeder Ansicht: die Titelzeile (.ms-titel) wird WO.startbild «buehne» mit dem Raum der Ansicht; h1 und Satz bleiben dieselben Knoten */
  function buehnen() {
    [].forEach.call(document.querySelectorAll('#start .ms-titel'), function (t) {
      if (t.__wo) return; t.__wo = 1; t.__b = 1;   // __b: buehne.js legt hier keine eigene Bühne mehr an
      [].forEach.call(t.querySelectorAll(':scope>.ms-bue__foto'), function (x) { x.remove(); });
      var v = t.closest('[id^="ms"]'), h1 = t.querySelector('h1'), satz = t.querySelector('.ms-leise');
      var hilf = document.createElement('div');
      var fn = FOTO[v && v.id] || 'start', gr = B800[fn];
      hilf.innerHTML = WO.startbild({ werkzeug: 'druck', art: 'buehne', h1: ' ', satz: satz ? ' ' : '', foto: BASIS + fn + '-1200.webp',
        srcset: gr ? BASIS + fn + '-800.webp 800w, ' + BASIS + fn + '-1200.webp ' + gr + 'w' : '', sizes: '(max-width:700px) 70vw, (max-width:1100px) 39vw, 50vw' });
      var sb = hilf.firstChild; sb.classList.add('ws-sb');
      if (h1) { h1.classList.add('wo-sb__h'); sb.querySelector('.wo-sb__h').replaceWith(h1); }
      if (satz) { satz.classList.add('wo-sb__satz'); sb.querySelector('.wo-sb__satz').replaceWith(satz); }
      [].slice.call(t.children).forEach(function (x) { sb.querySelector('.wo-sb__text').appendChild(x); });   // was sonst in der Titelzeile steht (Knöpfe, Wahl), bleibt dabei
      t.classList.remove('ms-bue', 'ms-bue--knapp'); t.textContent = ''; t.appendChild(sb); t.classList.add('ws-titel');
    });
  }
  function alles() { koepfe(); startbild(); buehnen(); }
  function los() {
    alles();
    var lauf = 0, st = document.getElementById('start');
    new MutationObserver(function () { if (lauf) return; lauf = 1; try { alles(); } finally { lauf = 0; } }).observe(st || document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
