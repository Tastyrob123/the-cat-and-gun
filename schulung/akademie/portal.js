/* Academy · The Cat & Gun · Portal-Skript
   Muster aus der Gastronomie AI Masterclass: tsReveal (IO + Scroll + Intervall + harter Start nach 9 s), Endzustand ohne Skript sichtbar,
   One-Shot mit «Play again», Linien nur im Zwischenraum, Kachel mit Neigung/Licht/Herzschlag, Sync-Highlight mit goldener Linie. */
(function () {
  var H = document.documentElement;
  var KEY = 'cg-academy-v1';
  var A = window.ACADEMY || { guides: [], alle: 0, lessons: [], raeume: {} };
  var leise = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Fortschritt (nur in diesem Browser) ---------- */
  function lesen() { var d; try { d = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { d = {}; } d.seen = d.seen || {}; d.read = d.read || {}; return d; }
  function schreiben(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  var st = lesen();
  function alle(sel, f) { [].forEach.call(document.querySelectorAll(sel), f); }
  function zeigen() {
    var g = A.guides.filter(function (k) { return st.seen[k]; }).length, l = A.lessons.filter(function (k) { return st.read[k]; }).length;
    alle('[data-zaehler="guides"]', function (e) { e.textContent = g + ' of ' + A.alle + ' watched'; });
    alle('[data-zaehler="lessons"]', function (e) { e.textContent = l + ' of ' + A.lessons.length + ' read'; });
    alle('[data-zahl="guides"]', function (e) { e.textContent = g + ' / ' + A.alle; });
    alle('[data-zahl="lessons"]', function (e) { e.textContent = l + ' / ' + A.lessons.length; });
    alle('[data-balken="guides"]', function (e) { e.style.width = (A.alle ? 100 * g / A.alle : 0) + '%'; });
    alle('[data-balken="lessons"]', function (e) { e.style.width = (100 * l / Math.max(1, A.lessons.length)) + '%'; });
    var rf = 0, rz = 0;
    Object.keys(A.raeume || {}).forEach(function (r) {
      var it = A.raeume[r], n = it.filter(function (x) { return x.charAt(0) === 'v' ? st.seen[x.slice(2)] : st.read[x.slice(2)]; }).length;
      if (it.length && n === it.length) rf++; rz++;
      alle('[data-raum-balken="' + r + '"]', function (e) { e.style.width = (it.length ? 100 * n / it.length : 0) + '%'; });
      alle('[data-raum-zahl="' + r + '"]', function (e) { e.textContent = n + ' / ' + it.length + ' done'; });
    });
    alle('[data-zahl="raeume"]', function (e) { e.textContent = rf + ' / ' + rz; });
    alle('[data-balken="raeume"]', function (e) { e.style.width = (rz ? 100 * rf / rz : 0) + '%'; });
    alle('[data-zaehler="raeume"]', function (e) { e.textContent = rf + ' of ' + rz + ' rooms done'; });
    alle('[data-gesehen]', function (e) { e.classList.toggle('ist-gesehen', !!st.seen[e.getAttribute('data-gesehen')]); });
    alle('[data-gelesen]', function (e) { e.classList.toggle('ist-gesehen', !!st.read[e.getAttribute('data-gelesen')]); });
    alle('[data-knopf-gesehen]', function (b) { var an = !!st.seen[b.getAttribute('data-knopf-gesehen')]; b.classList.toggle('ist-gesehen', an); b.textContent = an ? 'Watched ✓' : 'Mark as watched'; });
    alle('[data-knopf-gelesen]', function (b) { var an = !!st.read[b.getAttribute('data-knopf-gelesen')]; b.classList.toggle('ist-gesehen', an); b.textContent = an ? 'Read ✓' : 'Mark as read'; });
  }
  function setze(art, id, an) { st = lesen(); if (an) st[art][id] = 1; else delete st[art][id]; schreiben(st); zeigen(); }
  addEventListener('storage', function (e) { if (e.key === KEY) { st = lesen(); zeigen(); } });
  addEventListener('pageshow', function () { st = lesen(); zeigen(); });

  /* ---------- erster Blick: Seite erst zeigen, wenn die Bilder im ersten Bild geladen sind ---------- */
  function frei() { H.classList.remove('warte'); }
  var imBild = [].filter.call(document.images, function (i) { var r = i.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && r.width > 0; });
  var offen = imBild.filter(function (i) { return !i.complete; });
  if (!offen.length) frei(); else { var n0 = offen.length; offen.forEach(function (i) { function f() { if (--n0 <= 0) frei(); } i.addEventListener('load', f, { once: true }); i.addEventListener('error', f, { once: true }); }); setTimeout(frei, 3000); }

  /* ---------- Leiste ---------- */
  var leiste = document.querySelector('.leiste');
  function lst() { if (leiste) leiste.classList.toggle('fest', scrollY > 40); }
  addEventListener('scroll', lst, { passive: true }); lst();

  /* ---------- tsReveal: nie nur ein IntersectionObserver ---------- */
  function reveal(el, fn, schwelle) {
    var done = false, io, iv, t9;
    function sicht() { var r = el.getBoundingClientRect(); return r.width > 0 && r.top < innerHeight * (1 - (schwelle || .12)); }   /* auch schon vorbeigescrollte Stücke */
    function fire() { if (done) return; done = true; clean(); fn(el); }
    function pr() { if (!done && !H.classList.contains('warte') && sicht()) fire(); }
    function clean() { if (io) io.disconnect(); removeEventListener('scroll', pr); removeEventListener('resize', pr); clearInterval(iv); clearTimeout(t9); }
    if ('IntersectionObserver' in window) { io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) pr(); }); }, { threshold: schwelle || .12 }); io.observe(el); }
    addEventListener('scroll', pr, { passive: true }); addEventListener('resize', pr);
    iv = setInterval(pr, 400); setTimeout(pr, 600); setTimeout(pr, 1600); t9 = setTimeout(fire, 9000);
  }
  alle('.auf,.stagger', function (e) { reveal(e, function () { e.classList.add('da'); }, .08); });

  /* ---------- Neigung + Licht (Bereichs-Kacheln, Empfehlungs-Kachel) ---------- */
  function neigung(el, rx, ry) {
    if (leise || !matchMedia('(hover:hover)').matches) return;
    el.addEventListener('mousemove', function (e) { var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.classList.add('tilt'); el.style.setProperty('--ry', ((px - .5) * ry) + 'deg'); el.style.setProperty('--rx', ((.5 - py) * rx) + 'deg');
      el.style.setProperty('--gx', (px * 100) + '%'); el.style.setProperty('--gy', (py * 100) + '%'); });
    el.addEventListener('mouseleave', function () { el.classList.remove('tilt'); el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg'); });
  }
  alle('.raum', function (e) { neigung(e, 5, 6); });

  /* ---------- Empfehlungs-Kachel: Aufrichten, Neigung, Sync-Highlight mit goldener Linie (2600 ms) ---------- */
  alle('.emp', function (k) {
    var ss = k.querySelectorAll('.emp-s'), ls = k.querySelectorAll('ol li'), svg = k.querySelector('.emp__linie'), i = -1, tm = null, sicht = false;
    neigung(k, 4, 5);
    function linie(a, b) {
      if (!svg || innerWidth <= 960) return; var R = k.getBoundingClientRect(), ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      var x1 = ra.right - R.left, y1 = ra.top + ra.height / 2 - R.top, x2 = rb.left - R.left + 4, y2 = rb.top + rb.height / 2 - R.top, mx = (x1 + x2) / 2;
      svg.setAttribute('viewBox', '0 0 ' + R.width + ' ' + R.height);
      var d = 'M' + x1 + ',' + y1 + ' C' + mx + ',' + y1 + ' ' + mx + ',' + y2 + ' ' + x2 + ',' + y2;
      svg.innerHTML = '<path d="' + d + '"/><circle r="3.5" cx="' + x1 + '" cy="' + y1 + '"/><circle r="3.5" cx="' + x2 + '" cy="' + y2 + '"/>';
      var p = svg.querySelector('path'), L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.getBoundingClientRect(); p.style.strokeDashoffset = 0;
    }
    function schritt() { i = (i + 1) % ss.length; [].forEach.call(ss, function (s, j) { s.classList.toggle('an', j === i); }); [].forEach.call(ls, function (s, j) { s.classList.toggle('lit', j === i); }); if (ss[i] && ls[i]) linie(ss[i], ls[i]); }
    function lauf() { if (tm || !sicht || document.hidden) return; schritt(); tm = setInterval(function () { if (!sicht || document.hidden) { clearInterval(tm); tm = null; return; } schritt(); }, 2600); }
    reveal(k, function () { k.classList.add('in'); sicht = true; setTimeout(lauf, 700); }, .3);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (x) { sicht = x.isIntersecting; if (sicht) lauf(); }); }, { threshold: .3 }).observe(k);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) lauf(); });
  });

  /* ---------- «Coming soon», Lektion gelesen ---------- */
  alle('[data-bald]', function (k) { k.addEventListener('click', function () { var d = document.getElementById('bald-' + k.getAttribute('data-bald')); if (d && d.showModal) d.showModal(); }); });
  alle('dialog.bald-d', function (d) { d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-zu]')) d.close(); }); });
  alle('[data-knopf-gelesen]', function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-knopf-gelesen'); setze('read', id, !st.read[id]); }); });
  var ende = document.querySelector('[data-ende-lektion]');
  if (ende) setTimeout(function () { reveal(ende, function () { setze('read', ende.getAttribute('data-ende-lektion'), true); }, .05); }, 1500);

  /* ---------- Szenen-Werkzeug ---------- */
  function Szene(root) {
    var self = this, timer = [], laeufe = [];
    this.root = root;
    this.svg = root.querySelector('svg.linien');
    this.zeile = root.querySelector('.zeile');
    this.nach = function (ms, f) { timer.push(setTimeout(f, ms)); };
    this.stop = function () { timer.forEach(clearTimeout); timer = []; laeufe.forEach(function (l) { l.aus = true; }); laeufe = []; if (self.svg) [].forEach.call(self.svg.querySelectorAll('circle'), function (c) { c.remove(); }); };
    var nr = root.querySelector('.erz__nr'), zahl = 0, gesamt = +root.getAttribute('data-schritte') || 0;
    this.text = function (s) { var z = self.zeile; if (!z || z.getAttribute('data-jetzt') === s) return; z.setAttribute('data-jetzt', s);
      var schluss = s === root.getAttribute('data-schluss'); if (!schluss) zahl++;
      var marke = schluss ? 'In short' : 'Step ' + zahl + (gesamt ? ' of ' + gesamt : '');
      z.classList.add('weg'); if (nr) nr.classList.add('weg');
      setTimeout(function () { z.innerHTML = s; z.classList.remove('weg'); if (nr) { nr.textContent = marke; nr.classList.remove('weg'); } }, 300); };
    this.neu = function () { zahl = 0; if (self.zeile) self.zeile.removeAttribute('data-jetzt'); };
    this.pfade = {};
    this.verbinde = function (paare) {   /* paare: [name, elA, elB, art]; art 'h' = rechts→links, 'v' = unten→oben */
      if (!self.svg) return; var R = root.getBoundingClientRect(), html = '';
      self.svg.setAttribute('viewBox', '0 0 ' + R.width + ' ' + R.height);
      paare.forEach(function (p) {
        var a = p[1].getBoundingClientRect(), b = p[2].getBoundingClientRect(), d;
        if (p[3] === 'l') { var xa = a.left - R.left, ya = a.top + a.height / 2 - R.top, xb = b.right - R.left, yb = b.top + b.height / 2 - R.top, ml = (xa + xb) / 2; d = 'M' + xa + ',' + ya + ' C' + ml + ',' + ya + ' ' + ml + ',' + yb + ' ' + xb + ',' + yb; }
        else { var x1 = a.right - R.left, y1 = (p[4] != null ? p[4] : a.top + a.height / 2 - R.top), x2 = b.left - R.left, y2 = (p[5] != null ? p[5] : b.top + b.height / 2 - R.top), m = (x1 + x2) / 2; d = 'M' + x1 + ',' + y1 + ' C' + m + ',' + y1 + ' ' + m + ',' + y2 + ' ' + x2 + ',' + y2; }
        html += '<path data-n="' + p[0] + '" d="' + d + '"/>';
      });
      self.svg.innerHTML = html; self.pfade = {};
      [].forEach.call(self.svg.querySelectorAll('path'), function (pp) { self.pfade[pp.getAttribute('data-n')] = pp; });
    };
    this.puls = function (name, dauer, rueck) {
      var p = self.pfade[name]; if (!p || leise) return;
      var L = p.getTotalLength();
      if (!p.classList.contains('an')) {   /* erst zeichnet sich die Linie, dann läuft der Impuls */
        p.style.transition = 'none'; p.style.strokeDasharray = L; p.style.strokeDashoffset = rueck ? -L : L; p.getBoundingClientRect();
        p.style.transition = 'stroke-dashoffset .55s cubic-bezier(.16,1,.3,1),stroke .5s ease,stroke-width .5s ease'; p.classList.add('an'); p.style.strokeDashoffset = 0;
      }
      var ns = 'http://www.w3.org/2000/svg', h = document.createElementNS(ns, 'circle'), c = document.createElementNS(ns, 'circle'), s1 = document.createElementNS(ns, 'circle'), s2 = document.createElementNS(ns, 'circle'), t0 = null, lauf = { aus: false };
      h.setAttribute('r', 10); h.setAttribute('class', 'halo'); c.setAttribute('r', 3.6); s1.setAttribute('r', 2.6); s1.setAttribute('class', 'schweif'); s2.setAttribute('r', 1.8); s2.setAttribute('class', 'schweif2');
      [s2, s1, h, c].forEach(function (x) { x.setAttribute('cx', -50); x.setAttribute('cy', -50); self.svg.appendChild(x); }); laeufe.push(lauf);
      function pos(k) { var e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; return p.getPointAtLength((rueck ? 1 - e : e) * L); }
      function f(ts) { if (lauf.aus) return; if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / dauer), q = pos(k), q1 = pos(Math.max(0, k - .05)), q2 = pos(Math.max(0, k - .1));
        h.setAttribute('cx', q.x); h.setAttribute('cy', q.y); c.setAttribute('cx', q.x); c.setAttribute('cy', q.y); s1.setAttribute('cx', q1.x); s1.setAttribute('cy', q1.y); s2.setAttribute('cx', q2.x); s2.setAttribute('cy', q2.y);
        if (k < 1) requestAnimationFrame(f); }
      setTimeout(function () { requestAnimationFrame(f); }, 380);
      setTimeout(function () { [h, c, s1, s2].forEach(function (x) { x.remove(); }); }, dauer + 520);   /* Endzustand unabhängig von rAF */
    };
    this.alleAus = function (sel) { [].forEach.call(root.querySelectorAll(sel), function (e) { e.classList.remove('an'); }); if (self.svg) [].forEach.call(self.svg.querySelectorAll('path'), function (p) { p.classList.remove('an'); p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; }); };
  }
  var SZENEN = {};
  function starte(root) {
    var art = root.getAttribute('data-szene'), def = SZENEN[art]; if (!def) return;
    var s = new Szene(root); root.classList.add('js');
    function lagen() { if (def.lagen) def.lagen(s); }
    def.vorbereiten && def.vorbereiten(s);
    lagen(); addEventListener('resize', function () { lagen(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(lagen);
    function spiel() { s.stop(); s.neu(); def.start(s); lagen(); def.ablauf(s); }
    var nm = root.querySelector('.nochmal'); if (nm) nm.addEventListener('click', spiel);
    if (leise) { def.ende && def.ende(s); return; }
    reveal(root, function () { setTimeout(spiel, 250); }, .25);
  }

  /* Opener: Ein Haus, neun Werkzeuge */
  SZENEN.op = {
    lagen: function (s) {
      var ws = s.root.querySelectorAll('.op-w'), zs = s.root.querySelectorAll('.op-z'), paare = [];
      [].forEach.call(ws, function (w, i) { (w.getAttribute('data-z') || '').split(',').filter(Boolean).forEach(function (z) { paare.push([i + '-' + z, w, zs[+z]]); }); });
      s.verbinde(paare);
    },
    start: function (s) { s.alleAus('.op-w,.op-z'); },
    ablauf: function (s) {
      var ws = s.root.querySelectorAll('.op-w'), zs = s.root.querySelectorAll('.op-z');
      [].forEach.call(ws, function (w, i) {
        s.nach(i * 2400, function () {
          s.alleAus('.op-w,.op-z'); w.classList.add('an'); s.text(w.getAttribute('data-text'));
          (w.getAttribute('data-z') || '').split(',').filter(Boolean).forEach(function (z, k) {
            s.nach(200 + k * 160, function () { s.puls(i + '-' + z, 1000, w.hasAttribute('data-rueck')); s.nach(w.hasAttribute('data-rueck') ? 200 : 1250, function () { zs[+z].classList.add('an'); }); });
          });
        });
      });
      s.nach(ws.length * 2400, function () { s.alleAus('.op-w,.op-z'); s.text(s.root.getAttribute('data-schluss')); });
    },
    ende: function () {}
  };

  /* Start: Save, Before / after, Publish, Earlier versions */
  SZENEN.zy = {
    lagen: function (s) { var a = s.root.querySelector('.zy-s.an'); s.root.querySelector('.zy__lauf').style.height = a ? (a.offsetTop + a.offsetHeight / 2 - 12) + 'px' : '0px'; },
    start: function (s) { s.alleAus('.zy-s'); [].forEach.call(s.root.querySelectorAll('.zy__bild img'), function (b) { b.classList.remove('an'); }); s.root.querySelector('.zy__lauf').style.height = '0px'; },
    ablauf: function (s) {
      var st2 = s.root.querySelectorAll('.zy-s'), bi = s.root.querySelectorAll('.zy__bild img');
      [].forEach.call(st2, function (x, i) {
        s.nach(i * 2800, function () { s.alleAus('.zy-s'); x.classList.add('an'); [].forEach.call(bi, function (b, j) { b.classList.toggle('an', j === i); }); SZENEN.zy.lagen(s); s.text(x.getAttribute('data-text')); });
      });
      s.nach(st2.length * 2800, function () { s.text(s.root.getAttribute('data-schluss')); });
    }
  };

  /* Website: einmal eintragen, alle sechs Seiten zeigen es */
  SZENEN.em = {
    lagen: function (s) {
      var k = s.root.querySelector('.em__karte'), g = s.root.querySelector('.em__seiten'), R = s.root.getBoundingClientRect(), ps = g.querySelectorAll('.em-p');
      var y1 = ps[0].getBoundingClientRect(), y2 = ps[3] ? ps[3].getBoundingClientRect() : y1;
      s.verbinde([['a', k, g, 'h', null, y1.top + y1.height / 2 - R.top], ['b', k, g, 'h', null, y2.top + y2.height / 2 - R.top]]);
    },
    start: function (s) { s.alleAus('.em-r,.em-p,.em__knopf'); [].forEach.call(s.root.querySelectorAll('.em-chip'), function (c) { c.classList.remove('da'); }); [].forEach.call(s.root.querySelectorAll('.em-wert'), function (w) { if (w.getAttribute('data-voll')) w.textContent = w.getAttribute('data-voll'); }); },
    ablauf: function (s) {
      var rs = s.root.querySelectorAll('.em-r'), ps = s.root.querySelectorAll('.em-p'), kn = s.root.querySelector('.em__knopf');
      function tippe(r, t0) { var w = r.querySelector('.em-wert'), voll = w.getAttribute('data-voll') || w.textContent; w.setAttribute('data-voll', voll);
        s.nach(t0 + 250, function () { w.textContent = ''; });
        for (var i = 1; i <= voll.length; i++) (function (i) { s.nach(t0 + 300 + i * 55, function () { w.textContent = voll.slice(0, i); }); })(i);
        return t0 + 300 + voll.length * 55; }
      function runde(r, t0, wert, ta, tb) {
        s.nach(t0, function () { s.alleAus('.em-r,.em-p,.em__knopf'); [].forEach.call(s.root.querySelectorAll('.em-chip'), function (c) { c.classList.remove('da'); }); r.classList.add('an'); s.text(ta); });
        var t1 = tippe(r, t0) + 500;
        if (tb) s.nach(t1, function () { kn.classList.add('an'); s.text(tb); });
        var t2 = t1 + (tb ? 1600 : 400);
        s.nach(t2, function () { s.puls('a', 1000); s.puls('b', 1000); });
        [].forEach.call(ps, function (p, i) { s.nach(t2 + 1400 + i * 170, function () { var c = p.querySelector('.em-chip'); c.textContent = wert; c.classList.add('da'); p.classList.add('an'); if (i === 0 && tb) s.text(s.root.getAttribute('data-t3')); }); });
        return t2 + 1400 + ps.length * 170 + 2600;
      }
      var ende = runde(rs[2], 0, '7AM – 10PM', s.root.getAttribute('data-t1'), s.root.getAttribute('data-t2'));
      var ende2 = runde(rs[0], ende, '+63 962 040 3853', s.root.getAttribute('data-t4'), null);
      s.nach(ende2, function () { s.text(s.root.getAttribute('data-schluss')); });
    }
  };

  /* Menü: eine Liste ergibt die gedruckte Karte und die Menu page */
  SZENEN.li = {
    lagen: function (s) { var k = s.root.querySelector('.li__karte'), z = s.root.querySelectorAll('.li-z'); s.verbinde([['l', k, z[0], 'l'], ['r', k, z[1], 'h']]); },
    start: function (s) { s.alleAus('.li-z,.li-s,.li-r,.li-p'); },
    ablauf: function (s) {
      var r = s.root.querySelectorAll('.li-r'), st = s.root.querySelectorAll('.li-s'), z = s.root.querySelectorAll('.li-z');
      var pp = z[0].querySelectorAll('.li-p'), pw = z[1].querySelectorAll('.li-p');
      s.nach(0, function () { r[1].classList.add('an'); s.text(s.root.getAttribute('data-t1')); });
      s.nach(3600, function () { s.text(s.root.getAttribute('data-t2')); });
      [].forEach.call(st, function (x, i) { s.nach(3900 + i * 620, function () { x.classList.add('an'); }); });
      var t3 = 3900 + st.length * 620 + 300;
      s.nach(t3, function () { s.text(s.root.getAttribute('data-t3')); s.puls('l', 1000); });
      s.nach(t3 + 1350, function () { z[0].classList.add('an'); pp[1].classList.add('an'); });
      s.nach(t3 + 3300, function () { s.text(s.root.getAttribute('data-t4')); s.puls('r', 1000); });
      s.nach(t3 + 4650, function () { z[1].classList.add('an'); pw[1].classList.add('an'); });
      s.nach(t3 + 7000, function () { s.text(s.root.getAttribute('data-schluss')); });
    }
  };

  /* Gäste: eine Frage ohne Antwort */
  SZENEN.ch = {
    lagen: function (s) { s.verbinde([['h', s.root.querySelector('.ch__fenster'), s.root.querySelector('.ch__haus'), 'h']]); },
    start: function (s) { [].forEach.call(s.root.querySelectorAll('.bl'), function (b) { b.classList.remove('da'); }); s.alleAus('.ch-k'); },
    ablauf: function (s) {
      var b = s.root.querySelectorAll('.bl'), k = s.root.querySelectorAll('.ch-k'), T = [0, 1300];
      s.nach(0, function () { b[0].classList.add('da'); s.text(s.root.getAttribute('data-t1')); });
      s.nach(1300, function () { b[1].classList.add('da'); });
      s.nach(3000, function () { s.puls('h', 1000); s.nach(1300, function () { k[0].classList.add('an'); s.text(s.root.getAttribute('data-t2')); }); });
      s.nach(6000, function () { k[1].classList.add('an'); s.text(s.root.getAttribute('data-t3')); });
      s.nach(8400, function () { k[2].classList.add('an'); s.puls('h', 1000, true); s.text(s.root.getAttribute('data-t4')); });
      s.nach(10400, function () { b[2].classList.add('da'); });
      s.nach(11700, function () { b[3].classList.add('da'); s.text(s.root.getAttribute('data-schluss')); });
    }
  };

  /* Marke: eine Farbe, drei Werkzeuge */
  SZENEN.mk = {
    lagen: function (s) { var e = s.root.querySelector('.mk__editor'), zs = s.root.querySelectorAll('.mk-z'); s.verbinde([].map.call(zs, function (z, i) { return [String(i), e, z, 'h']; })); },
    start: function (s) { var f = s.root.querySelectorAll('.mk__farben span'); s.alleAus('.mk__farben span,.mk__knopf,.mk-z'); f[0].classList.add('an'); [].forEach.call(s.root.querySelectorAll('.mk-z'), function (z) { z.style.setProperty('--c', f[0].getAttribute('data-c')); z.querySelector('small').textContent = 'shows: ' + f[0].getAttribute('data-n'); }); },
    ablauf: function (s) {
      var f = s.root.querySelectorAll('.mk__farben span'), kn = s.root.querySelector('.mk__knopf'), zs = s.root.querySelectorAll('.mk-z');
      function runde(i, t0, txt) {
        s.nach(t0, function () { s.alleAus('.mk__farben span,.mk__knopf,.mk-z'); f[i].classList.add('an'); s.text(txt); });
        s.nach(t0 + 1200, function () { kn.classList.add('an'); });
        [].forEach.call(zs, function (z, j) { s.nach(t0 + 1600 + j * 320, function () { s.puls(String(j), 900); s.nach(1180, function () { z.classList.add('an'); z.style.setProperty('--c', f[i].getAttribute('data-c')); z.querySelector('small').textContent = 'shows: ' + f[i].getAttribute('data-n'); }); }); });
      }
      runde(1, 0, s.root.getAttribute('data-t1'));
      runde(0, 5200, s.root.getAttribute('data-t2'));
      s.nach(10400, function () { s.alleAus('.mk__knopf,.mk-z'); s.text(s.root.getAttribute('data-schluss')); });
    }
  };

  /* Druck: von der Vorlage zur Druckerei */
  SZENEN.dr = {
    start: function (s) { s.alleAus('.dr-s'); s.root.querySelector('.dr__band i').style.width = '0'; },
    ablauf: function (s) {
      var x = s.root.querySelectorAll('.dr-s'), band = s.root.querySelector('.dr__band i');
      [].forEach.call(x, function (e, i) { s.nach(i * 1900, function () { s.alleAus('.dr-s'); e.classList.add('an'); band.style.width = (100 * (i + 1) / x.length) + '%'; s.text(e.getAttribute('data-text')); }); });
      s.nach(x.length * 1900, function () { [].forEach.call(x, function (e) { e.classList.add('an'); }); s.text(s.root.getAttribute('data-schluss')); });
    }
  };

  /* Besuche: von einem Besuch zum Anruf */
  SZENEN.bs = {
    lagen: function (s) { var p = s.root.querySelectorAll('.bs-p'), pa = []; for (var i = 0; i + 1 < p.length; i++) pa.push([String(i), p[i], p[i + 1], 'h']); s.verbinde(pa); },
    start: function (s) { s.alleAus('.bs-p'); },
    ablauf: function (s) {
      var p = s.root.querySelectorAll('.bs-p');
      [].forEach.call(p, function (e, i) { s.nach(i * 1900, function () { e.classList.add('an'); s.text(e.getAttribute('data-text')); if (i + 1 < p.length) s.nach(1100, function () { s.puls(String(i), 700); }); }); });
      s.nach(p.length * 1900 + 400, function () { s.text(s.root.getAttribute('data-schluss')); });
    }
  };

  /* Betrieb: wo alles läuft */
  SZENEN.bt = {
    start: function (s) { s.alleAus('.bt-k,.bt-t'); [].forEach.call(s.root.querySelectorAll('[data-ziel]'), function (z) { z.firstChild.nodeValue = '0'; }); },
    ablauf: function (s) {
      var k = s.root.querySelectorAll('.bt-k'), t = s.root.querySelectorAll('.bt-t');
      [].forEach.call(k, function (e, i) {
        s.nach(i * 900, function () { e.classList.add('an'); var z = e.querySelector('[data-ziel]'), ziel = +z.getAttribute('data-ziel'), t0 = Date.now();
          var iv = setInterval(function () { var q = Math.min(1, (Date.now() - t0) / 1100); z.firstChild.nodeValue = String(Math.round(ziel * (1 - Math.pow(1 - q, 3)))); if (q >= 1) clearInterval(iv); }, 38);
          setTimeout(function () { clearInterval(iv); z.firstChild.nodeValue = String(ziel); }, 1300);   /* Endwert hart, unabhängig vom Takt */
          if (i === 0) s.text(s.root.getAttribute('data-t1')); });
      });
      [].forEach.call(t, function (e, i) { s.nach(3200 + i * 1300, function () { e.classList.add('an'); s.text(e.getAttribute('data-text')); }); });
      s.nach(3200 + t.length * 1300 + 600, function () { s.text(s.root.getAttribute('data-schluss')); });
    }
  };
  alle('[data-szene]', starte);

  /* ---------- Video mit Kapitelmarken ---------- */
  var film = document.getElementById('film');
  if (film) {
    var id = film.getAttribute('data-id');
    var marken = [].map.call(document.querySelectorAll('.spur button'), function (b) { return +b.getAttribute('data-t'); });
    var dauer = +film.getAttribute('data-dauer') || 0, spur = [].slice.call(document.querySelectorAll('.spur button')), liste = [].slice.call(document.querySelectorAll('.kapitel li button')), jetzt = document.querySelector('.jetzt');
    var titel = liste.map(function (b) { return b.querySelector('b').textContent; });
    function springe(t) { try { film.currentTime = t + 0.05; } catch (e) {} var p = film.play(); if (p && p.catch) p.catch(function () {}); }
    alle('[data-t]', function (b) { b.addEventListener('click', function () { springe(+b.getAttribute('data-t')); if (b.closest('.schritte')) document.querySelector('.leinwand').scrollIntoView({ behavior: 'smooth', block: 'center' }); }); });
    var alt = -1;
    function lauf() {
      var t = film.currentTime, d = film.duration || dauer, k = 0;
      for (var i = 0; i < marken.length; i++) if (t >= marken[i] - 0.01) k = i;
      spur.forEach(function (b, i) { var a = marken[i], z = i + 1 < marken.length ? marken[i + 1] : d; var f = t >= z ? 1 : t <= a ? 0 : (t - a) / (z - a); b.firstChild.style.width = (f * 100) + '%'; });
      if (k !== alt) { alt = k; liste.forEach(function (b, i) { b.classList.toggle('ist-jetzt', i === k); });
        var li = liste[k]; if (li && !film.paused) { var ol = li.closest('ol'), r = li.getBoundingClientRect(), q = ol.getBoundingClientRect(); if (r.top < q.top || r.bottom > q.bottom) ol.scrollTop += r.top - q.top - 8; }
        if (jetzt) jetzt.textContent = 'Chapter ' + (k + 1) + ' of ' + marken.length + ' · ' + titel[k]; }
      if (d && t > d * 0.92 && !st.seen[id]) setze('seen', id, true);
    }
    var rafAn = false;
    function takt() { lauf(); if (!film.paused && !film.ended) requestAnimationFrame(takt); else rafAn = false; }
    film.addEventListener('play', function () { if (!rafAn) { rafAn = true; requestAnimationFrame(takt); } });
    film.addEventListener('timeupdate', lauf); film.addEventListener('seeked', lauf); film.addEventListener('ended', function () { setze('seen', id, true); }); lauf();
    var gk = document.querySelector('[data-knopf-gesehen]'); if (gk) gk.addEventListener('click', function () { setze('seen', id, !st.seen[id]); });
    var kap = document.querySelector('.kapitel'), box = document.querySelector('.werk__links');
    function hoehe() { if (!kap || !box) return; var h = innerWidth > 1180 ? box.getBoundingClientRect().height + 'px' : ''; kap.style.maxHeight = h; kap.style.height = h; }
    hoehe(); addEventListener('resize', hoehe);
    var olk = kap && kap.querySelector('ol');
    if (olk && 'IntersectionObserver' in window) { var io3 = new IntersectionObserver(function (es) { es.forEach(function (x) { x.target.style.visibility = x.isIntersecting ? '' : 'hidden'; }); }, { root: olk }); [].forEach.call(olk.children, function (li) { io3.observe(li); }); }
  }

  /* ---------- Schubladen: weich auf und zu (Fehlerbuch: Aufklappen als Schublade) ---------- */
  function lade(d, an) {
    var inn = d.querySelector('.lade__innen'); if (!inn) { d.open = an; return; }
    if (leise) { d.open = an; return; }
    if (an) { d.open = true; var h = inn.scrollHeight; inn.style.overflow = 'hidden'; inn.style.height = '0px'; inn.getBoundingClientRect();
      inn.style.transition = 'height .55s cubic-bezier(.16,1,.3,1)'; inn.style.height = h + 'px';
      setTimeout(function () { inn.style.height = ''; inn.style.overflow = ''; inn.style.transition = ''; }, 600); }
    else { var h2 = inn.scrollHeight; inn.style.overflow = 'hidden'; inn.style.height = h2 + 'px'; inn.getBoundingClientRect();
      inn.style.transition = 'height .4s cubic-bezier(.16,1,.3,1)'; inn.style.height = '0px';
      setTimeout(function () { d.open = false; inn.style.height = ''; inn.style.overflow = ''; inn.style.transition = ''; }, 420); }
  }
  alle('details.lade', function (d) { d.querySelector('summary').addEventListener('click', function (ev) { ev.preventDefault(); lade(d, !d.open); }); });
  alle('.kann__alle', function (b) {
    b.addEventListener('click', function () { var box = b.closest('.kann'), ls = box.querySelectorAll('details.lade'), zu = [].some.call(ls, function (d) { return !d.open; });
      [].forEach.call(ls, function (d, i) { setTimeout(function () { lade(d, zu); }, i * 60); }); b.textContent = zu ? 'Close all' : 'Open all'; });
  });

  /* ---------- Demo-Fenster in offenen Schubladen ---------- */
  function demoLauf(d) {
    var dm = d.querySelector('.demo'); if (!dm || leise) return;
    var ks = dm.querySelectorAll('.demo__k'), zg = dm.querySelector('.demo__zeiger'), lis = d.querySelectorAll('ol li'), i = -1;
    clearInterval(dm._iv); dm.classList.add('laeuft');
    [].forEach.call(ks, function (k) { k.classList.remove('an', 'war'); });
    function schritt() {
      if (!d.open) { clearInterval(dm._iv); dm.classList.remove('laeuft'); return; }
      if (ks[i]) { ks[i].classList.remove('an'); ks[i].classList.add('war'); }
      i = (i + 1) % ks.length; if (i === 0) [].forEach.call(ks, function (k) { k.classList.remove('war'); });
      var k = ks[i], R = dm.getBoundingClientRect(), r = k.getBoundingClientRect();
      var pos = 'translate(' + (r.left - R.left + r.width * .62) + 'px,' + (r.top - R.top + r.height * .55) + 'px)';
      zg.style.setProperty('--pos', pos); zg.style.transform = pos;
      setTimeout(function () { k.classList.add('an'); zg.classList.remove('klick'); zg.getBoundingClientRect(); zg.classList.add('klick');
        var ziel = k.getAttribute('data-k'); [].forEach.call(lis, function (l) { l.classList.toggle('lit', ziel !== null && l.getAttribute('data-k') === ziel); }); }, 720);
    }
    setTimeout(schritt, 350); dm._iv = setInterval(schritt, 2300);
  }
  alle('details.lade', function (d) { d.addEventListener('toggle', function () { if (d.open) demoLauf(d); else { var dm = d.querySelector('.demo'); if (dm) { clearInterval(dm._iv); dm.classList.remove('laeuft'); } [].forEach.call(d.querySelectorAll('ol li'), function (l) { l.classList.remove('lit'); }); } }); });

  /* ---------- Weg aus vier Schritten: Linie läuft, Schritte leuchten nacheinander ---------- */
  alle('.weg', function (w) {
    var ss = w.querySelectorAll('.weg-s'), li = w.querySelector('.weg__linie i');
    reveal(w, function () {
      [].forEach.call(ss, function (s, i) { setTimeout(function () { s.classList.add('an'); if (li) li.style.width = (ss.length > 1 ? 100 * i / (ss.length - 1) : 100) + '%'; }, 300 + i * 900); });
    }, .3);
  });

  /* ---------- Sprung an eine Videostelle aus einer Schublade (#t=Sekunden) ---------- */
  if (film && /[#&]t=([\d.]+)/.test(location.hash)) {
    var ziel = +RegExp.$1;
    var hin = function () { try { film.currentTime = ziel + 0.05; } catch (er) {} };
    if (film.readyState >= 1) hin(); else film.addEventListener('loadedmetadata', hin, { once: true });
    setTimeout(function () { document.querySelector('.leinwand').scrollIntoView({ block: 'center' }); }, 300);
  }

  zeigen();
})();
