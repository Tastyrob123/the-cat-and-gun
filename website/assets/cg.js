/* The Cat & Gun · Laden, erster Blick, Auftritte, Fenster, Leiste, Menü, Küche, Zähler, «heute».
   Vorlagen: Uncle Hung uh.js (Lader, erster Blick, Leiste), Bareiss bareiss.js Teil 2 und 3 (Schlitz, jedes Stück einzeln), Tasty fen.js (Fenster).
   Nur transform und opacity, nativer Scroll, nichts fängt das Scrollen ab. */
(function () {
  'use strict';
  var D = document, H = D.documentElement;
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IO = 'IntersectionObserver' in window;

  /* ---------- Fassungen zum Durchklicken: ‹ Nummer · Name ›, Pfeiltasten, Wahl bleibt in der Adresse */
  D.querySelectorAll('.wahlleiste[data-wahl]').forEach(function (bar) {
    var g = bar.dataset.wahl, ziel = D.querySelector('[data-wahl-ziel="' + g + '"]');
    var vl = [].slice.call(D.querySelectorAll('template[data-wahl="' + g + '"]'));
    if (!ziel || !vl.length) return;
    var jetzt = 0, sicht = false;
    function zeige(n, still) {
      n = (n + vl.length) % vl.length; var t = vl[n];
      ziel.className = t.dataset.cls; if (t.dataset.stil) ziel.setAttribute('style', t.dataset.stil); else ziel.removeAttribute('style');
      ziel.innerHTML = t.innerHTML; jetzt = n;
      ziel.querySelectorAll('img[loading="lazy"]').forEach(function (i) { i.loading = 'eager'; });
      bar.querySelector('b').textContent = n; bar.querySelector('em').textContent = t.dataset.name;
      if (still) return;
      try { var u = new URL(location.href); u.searchParams.set(g, n); history.replaceState(null, '', u); } catch (e) {}
      var ims = [].slice.call(ziel.querySelectorAll('img'));
      Promise.all(ims.map(function (b) { return new Promise(function (ok) { if (b.complete && b.naturalWidth) ok(); else { b.addEventListener('load', ok, { once: true }); b.addEventListener('error', ok, { once: true }); } }); }))
        .then(function () { if (g === 'held') { void ziel.offsetWidth; requestAnimationFrame(function () { ziel.classList.add('da'); }); } });
      if (g === 'held') setTimeout(function () { ziel.classList.add('da'); }, 2500);
    }
    var st = parseInt(new URLSearchParams(location.search).get(g), 10);
    if (st > 0 && st < vl.length) zeige(st, true);
    bar.querySelectorAll('[data-w]').forEach(function (b) { b.addEventListener('click', function () { zeige(jetzt + (+b.dataset.w)); }); });
    addEventListener('keydown', function (e) { if (!sicht || /INPUT|TEXTAREA/.test(D.activeElement.tagName)) return; if (e.key === 'ArrowRight') zeige(jetzt + 1); else if (e.key === 'ArrowLeft') zeige(jetzt - 1); });
    if (IO) new IntersectionObserver(function (es) { es.forEach(function (e) { sicht = e.isIntersecting; bar.classList.toggle('weg', !sicht); }); }, { threshold: g === 'fuss' ? .15 : .3 }).observe(ziel);
    if (st > 0 && location.hash === '') setTimeout(function () { if (g !== 'held') ziel.scrollIntoView(); }, 50);
  });

  /* ---------- Bilder: drei Bildschirme voraus, danach alles Übrige im Leerlauf */
  function laden(img) {
    if (!img.dataset.srcset) return;
    img.sizes = img.dataset.sizes || '100vw'; img.srcset = img.dataset.srcset; img.removeAttribute('data-srcset');
  }
  var lader = IO ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { laden(e.target); lader.unobserve(e.target); } });
  }, { rootMargin: '300% 0px 300% 0px' }) : null;
  /* Bilder anderthalb Bildschirme vorher holen (loading=lazy reicht dem Browser sonst zu knapp) */
  var vor = IO ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.loading = 'eager'; vor.unobserve(e.target); } });
  }, { rootMargin: '150% 0px 150% 0px' }) : null;
  D.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
    if (img.closest('.k-buehne')) { img.loading = 'eager'; return; }
    vor ? vor.observe(img) : (img.loading = 'eager');
  });
  D.querySelectorAll('img[data-srcset]').forEach(function (img) { lader ? lader.observe(img) : laden(img); });
  addEventListener('load', function () {
    var rest = [].slice.call(D.querySelectorAll('img[data-srcset]')).concat([].slice.call(D.querySelectorAll('img[loading="lazy"]')));
    var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 200); };
    (function weiter() { if (!rest.length) return; idle(function () { for (var n = 0; n < 3 && rest.length; n++) { var r = rest.shift(); laden(r); r.loading = 'eager'; } weiter(); }); })();
  });

  /* ---------- Erster Blick komplett: zeigen, wenn alle Bilder im ersten Bild und die Schriften geladen sind (nur load, nie decode) */
  function imBild(el) { var r = el.getBoundingClientRect(); return r.width > 2 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; }
  var an = false;
  function los() {
    if (an) return; an = true;
    H.classList.add('offen');
    var at = D.querySelector('.auftakt'); if (at) at.classList.add('da');
    D.dispatchEvent(new Event('cg:offen'));
  }
  var erste = [].slice.call(D.querySelectorAll('img')).filter(function (b) { return imBild(b) && !b.closest('.fen'); });
  erste.forEach(function (b) { b.decoding = 'sync'; b.loading = 'eager'; laden(b); });
  var schrift = D.fonts && D.fonts.load ? Promise.all([D.fonts.load('400 1em Gloock'), D.fonts.load('400 1em "Instrument Sans"'), D.fonts.load('400 1em "DM Mono"')]).catch(function () {}) : Promise.resolve();
  Promise.all(erste.map(function (b) {
    return new Promise(function (ok) { if (b.complete && b.naturalWidth) ok(); else { b.addEventListener('load', ok, { once: true }); b.addEventListener('error', ok, { once: true }); } });
  }).concat([schrift])).then(function () { requestAnimationFrame(los); });
  setTimeout(los, 6000);
  addEventListener('pageshow', function (e) { if (e.persisted) los(); });

  /* ---------- Überschriften in Zeilen für den Schlitz (Bareiss Teil 2) */
  function zeilen(h) {
    if (h.dataset.z) return; h.dataset.z = '1';
    var woerter = [];
    (function lauf(k, ak) {
      k.childNodes.forEach(function (n) {
        if (n.nodeType === 3) n.textContent.split(/\s+/).forEach(function (w) { if (w) woerter.push({ t: w, ak: ak }); });
        else if (n.nodeName === 'BR') woerter.push({ br: 1 });
        else lauf(n, ak || (n.classList && n.classList.contains('ak')));
      });
    })(h, false);
    h.textContent = '';
    var spans = [];
    woerter.forEach(function (w) {
      if (w.br) { h.appendChild(D.createElement('br')); return; }
      var s = D.createElement('span'); s.textContent = w.t; s.style.whiteSpace = 'nowrap'; s._w = w;
      h.appendChild(s); h.appendChild(D.createTextNode(' ')); spans.push(s);
    });
    var rows = [], top = null;
    spans.forEach(function (s) { var t = s.offsetTop; if (top === null || Math.abs(t - top) > 4) { top = t; rows.push([]); } rows[rows.length - 1].push(s._w); });
    h.textContent = '';
    rows.forEach(function (r, i) {
      var z = D.createElement('span'); z.className = 'zl';
      var inn = D.createElement('span'); inn.className = 'zi'; inn.style.setProperty('--z', i);
      r.forEach(function (w, k) {
        var t = w.t + (k < r.length - 1 ? ' ' : '');
        if (w.ak) { var s = D.createElement('span'); s.className = 'ak'; s.textContent = t; inn.appendChild(s); } else inn.appendChild(D.createTextNode(t));
      });
      inn.normalize(); z.appendChild(inn); h.appendChild(z);
    });
  }

  /* ---------- Auftritte (Bareiss Teil 3): jedes Stück eines Abschnitts einzeln, sobald es selbst an den Rand kommt */
  var STUECK = '.rahmen, figure, h3, p, ul, ol, dl, .knoepfe, .karte, .tafel, .zeit, .drei, .plakat, .aufsteller, .k-buehne, .saft-streifen, .g-drei, .p-bilder, .a-bilder, .b-bilder, .buehne, .g-band, .karte-box, .heute';
  var EIGEN = '[data-r], .auftakt, .skopf, .fen, .fuss, .rubriknav, .k-buehne .kb, .mvoll';
  var GRUPPE = '.saft-streifen, .g-drei, .p-bilder, .a-bilder, .b-bilder, .buehne, .g-band, .morgen-buehne';
  function sichtbar(e) { return !!(e.offsetParent || e.getClientRects().length); }
  function markieren() {
    D.querySelectorAll('main section:not(.fen):not(.auftakt):not(.skopf)').forEach(function (sek) {
      sek.querySelectorAll('h2,.zitat,.t-gross').forEach(function (h) { if (!h.closest(EIGEN.replace('[data-r], ', '')) && sichtbar(h)) { h.setAttribute('data-schlitz', ''); zeilen(h); } });
      sek.querySelectorAll(STUECK).forEach(function (e) {
        if (e.closest('[data-schlitz]') || e.closest(EIGEN)) return;
        if (e.closest('.rubriken')) return;   /* Karte: im Spaltensatz bewegt sich nichts (Safari legt verschobene Stücke in Spalten übereinander oder zeigt sie nicht) */
        if (!sichtbar(e)) return;
        /* Gruppen aus Fotos Wand an Wand: jedes Foto fliegt einzeln, die Gruppe selbst bleibt stehen */
        if (e.matches(GRUPPE)) return;
        if (e.closest('.k-liste') && e.tagName !== 'UL') return;
        e.setAttribute('data-r', (e.matches('.rahmen, figure') || (e.querySelector('img') && !e.matches('.karte,.tafel'))) ? 'b' : 't');
        var p = e.parentElement, i = 0;
        if (p && p.matches(GRUPPE)) i = [].indexOf.call(p.children, e);
        else { var v = e.previousElementSibling; while (v && i < 5) { if (v.hasAttribute('data-r')) i++; v = v.previousElementSibling; } }
        if (i) e.style.setProperty('--i', Math.min(i, 5));
      });
    });
  }
  function bereit(el, dann) {
    var ims = [].filter.call(el.tagName === 'IMG' ? [el] : el.querySelectorAll('img'), function (im) { return im.offsetParent !== null; });
    var n = ims.length, fertig = false, f = function () { if (!fertig) { fertig = true; dann(); } };
    if (!n) return f();
    ims.forEach(function (im) {
      laden(im);
      im.loading = 'eager';
      if (im.complete && im.naturalWidth > 1) { if (--n <= 0) f(); return; }
      var e1 = function () { if (--n <= 0) f(); };
      im.addEventListener('load', e1, { once: true }); im.addEventListener('error', e1, { once: true });
    });
    setTimeout(f, 2200);
  }
  function auftritte() {
    if (ruhig || !IO) { D.querySelectorAll('[data-r],[data-schlitz]').forEach(function (e) { e.classList.add('da'); }); return; }
    markieren();
    function beob(rand) {
      var o = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting && e.boundingClientRect.bottom >= 0) return;
          o.unobserve(e.target);
          bereit(e.target, function () { e.target.classList.add('da'); });
        });
      }, { rootMargin: rand, threshold: 0 });
      return o;
    }
    /* Fotos: der Weg hängt am Scrollen (CSS view()), der Zoom startet, wenn das Foto am Rand erscheint, damit man ihn sieht.
       Texte und Knöpfe: kurz vor dem Rand, damit sie schon steigen, wenn sie sichtbar werden, statt erst im Abschnitt hochzuspringen. */
    var ioB = beob('0px 0px 0px 0px'), ioT = beob('0px 0px 10% 0px');
    D.querySelectorAll('[data-r],[data-schlitz]').forEach(function (e) { if (e.classList.contains('da')) return; (e.getAttribute('data-r') === 'b' ? ioB : ioT).observe(e); });
  }
  if (ruhig) H.classList.add('ruhig');
  D.addEventListener('cg:offen', function () {
    D.querySelectorAll('.auftakt .at-unten>*,.skopf .sk-rest>*').forEach(function (e, i) { e.style.setProperty('--i', i); });
    (D.fonts ? D.fonts.ready : Promise.resolve()).then(auftritte);
  });

  /* ---------- Fenster: der Satz rollt, wenn die Oberkante des Fensters ihn freigibt (Vorlage fen.js) */
  if (IO) {
    H.classList.add('fenjs');
    D.querySelectorAll('.fen').forEach(function (f) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { f.classList.toggle('nah', e.isIntersecting); }); }, { rootMargin: '2% 0px 2% 0px' }).observe(f);
      var t = f.querySelector('.fen__satz'); if (!t) return;
      D.addEventListener('cg:offen', function () { zeilen(t); });
      var o = null;
      function lausche() {
        if (o) o.disconnect();
        var hh = t.offsetHeight || 80, linie = innerHeight / 2 - hh / 2 + hh * .68;
        o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { o.disconnect(); f.classList.add('los'); removeEventListener('resize', lausche); } }); },
          { rootMargin: '0px 0px -' + Math.max(0, Math.round(innerHeight - linie)) + 'px 0px', threshold: 0 });
        o.observe(f);
      }
      lausche(); addEventListener('resize', lausche, { passive: true });
    });
  }

  /* ---------- Leiste: weg beim Hinunterscrollen, zurück beim Hinaufscrollen; das Schild erscheint auf der Startseite erst nach dem Auftakt */
  var leiste = D.getElementById('leiste'), auftakt = D.querySelector('.auftakt');
  if (leiste) {
    var y0 = scrollY, tick = false;
    function rechnen() {
      var y = scrollY, d = y - y0;
      if (y < 80) leiste.classList.remove('weg');
      else if (d > 6) leiste.classList.add('weg');
      else if (d < -6) leiste.classList.remove('weg');
      if (auftakt) leiste.classList.toggle('unten', y > auftakt.offsetHeight * .72);
      H.classList.toggle('leiste-da', !leiste.classList.contains('weg') && y > 80);
      y0 = y; tick = false;
    }
    addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(rechnen); } }, { passive: true });
    rechnen();
  }
  var mv = D.getElementById('mvoll');
  D.querySelectorAll('[data-menue]').forEach(function (b) { b.addEventListener('click', function () { mv.classList.add('auf-m'); b.setAttribute('aria-expanded', 'true'); }); });
  if (mv) mv.querySelectorAll('a,.zu').forEach(function (a) { a.addEventListener('click', function () { mv.classList.remove('auf-m'); }); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && mv) mv.classList.remove('auf-m'); });

  /* ---------- Küche: Zeigen oder Tippen tauscht das Foto; das neue fährt von unten über das alte, nichts blendet über */
  D.querySelectorAll('[data-kueche]').forEach(function (box) {
    var zeilen2 = [].slice.call(box.querySelectorAll('.k-liste li')), bilder = [].slice.call(box.querySelectorAll('.kb')), jetzt = 0;
    function waehle(i) {
      if (i === jetzt) return;
      zeilen2[jetzt].classList.remove('an'); zeilen2[i].classList.add('an');
      bilder.forEach(function (b) { b.classList.remove('alt'); });
      bilder[jetzt].classList.remove('an'); bilder[jetzt].classList.add('alt');
      var neu = bilder[i]; neu.classList.remove('an'); void neu.offsetWidth; neu.classList.add('an');
      jetzt = i;
    }
    zeilen2.forEach(function (z, i) {
      var b = z.querySelector('a');
      b.addEventListener('mouseenter', function () { if (matchMedia('(hover:hover)').matches) waehle(i); });
      b.addEventListener('focus', function () { waehle(i); });
    });
  });

  /* ---------- Säfte: Zeigen oder Tippen auf einen Namen nennt seine Zutaten in der festen Tafel (auch nach dem Wechsel einer Fassung) */
  function saft(e) {
    var b = e.target.closest && e.target.closest('[data-saftnamen] [data-zutat]'); if (!b) return;
    var box = b.closest('[data-saftnamen]');
    box.querySelectorAll('[data-zutat]').forEach(function (x) { x.classList.toggle('an', x === b); });
    box.querySelector('.sv-zutat .z').textContent = b.dataset.zutat; box.querySelector('.sv-zutat .p').textContent = b.dataset.preis;
  }
  D.addEventListener('click', saft);
  D.addEventListener('mouseover', function (e) { if (matchMedia('(hover:hover)').matches) saft(e); });

  /* ---------- Grosse Zahl zählt hoch (Google-Note) */
  var zo = IO && !ruhig ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; zo.unobserve(e.target);
      var el = e.target, ziel = parseFloat(el.dataset.zahl), ab = parseFloat(el.dataset.ab || 0), t0 = null, nk = (el.dataset.zahl.split('.')[1] || '').length;
      function s(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1700), k = 1 - Math.pow(1 - p, 4); el.textContent = (ab + (ziel - ab) * k).toFixed(nk); if (p < 1) requestAnimationFrame(s); }
      el.textContent = ab.toFixed(nk); requestAnimationFrame(s);
    });
  }, { rootMargin: '0px 0px -12% 0px' }) : null;
  D.querySelectorAll('[data-zahl]').forEach(function (el) { if (zo) zo.observe(el); });

  /* ---------- Heute: offen oder geschlossen, nach der Uhr in Siargao (täglich 7 bis 22 Uhr, Asia/Manila) */
  function heute() {
    var std, min;
    try {
      var teile = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      teile.forEach(function (p) { if (p.type === 'hour') std = +p.value; if (p.type === 'minute') min = +p.value; });
    } catch (e) { var d = new Date(); std = (d.getUTCHours() + 8) % 24; min = d.getUTCMinutes(); }
    var m = (std % 24) * 60 + min, offen = m >= 420 && m < 1320;
    var satz = offen ? 'Open now · until 10PM' : (m < 420 ? 'Opens today at 7AM' : 'Opens tomorrow at 7AM');
    D.querySelectorAll('[data-heute]').forEach(function (el) { el.querySelector('span').textContent = satz; el.classList.toggle('zu', !offen); });
  }
  heute(); setInterval(heute, 60000);

  /* ---------- Karte: Rubrik in der Leiste markieren */
  var rn = D.querySelector('.rubriknav');
  if (rn && IO) {
    var links = {}; rn.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var box = rn.querySelector('.rn');
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        rn.querySelectorAll('a').forEach(function (a) { a.classList.remove('an'); });
        var a = links[e.target.id]; if (a) { a.classList.add('an'); box.scrollTo({ left: a.offsetLeft - (box.clientWidth - a.offsetWidth) / 2, behavior: 'auto' }); }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    D.querySelectorAll('.rubrik[id]').forEach(function (r) { ro.observe(r); });
  }
})();
