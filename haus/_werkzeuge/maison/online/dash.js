/* Control panel · The Cat & Gun · Übergang Hero → Dashboard: der Hero liegt als Vorhang über dem fertigen Dashboard. */

(function () {
  'use strict';
  var k = document.querySelector('.dx-kulisse'); if (!k) return;
  var root = document.querySelector('.dx-root'), oben = document.querySelector('.m-oben'), html = document.documentElement;
  var reihe = [].slice.call(k.querySelectorAll('.m-f5__reihe li'));
  var mq = matchMedia('(min-width:861px) and (prefers-reduced-motion:no-preference)');
  var zustand = 'held', sperre = 0, uhr = 0;
  var DAUER = function () { return (Math.max(0, reihe.length - 1) * 70 + 900); };

  reihe.forEach(function (li, i) { li.style.setProperty('--ri', i); });

  var kopf = function () { if (oben) oben.classList.toggle('dx-aus', zustand !== 'held' && scrollY < 140); };

  var runter = function () {
    if (zustand !== 'held') return;
    zustand = 'zieht'; sperre = Date.now() + DAUER() + 500;
    scrollTo(0, 0);
    k.classList.add('dx-hoch'); kopf(); if (root) root.classList.add('dx-los');
    clearTimeout(uhr);
    uhr = setTimeout(function () {
      k.classList.add('dx-weg'); html.classList.remove('dx-zu'); zustand = 'unten'; kopf(); binde();

    }, DAUER());
  };
  var hoch = function () {
    if (zustand !== 'unten' || scrollY > 2) return;
    zustand = 'zieht'; sperre = Date.now() + DAUER() + 500;
    html.classList.add('dx-zu'); k.classList.remove('dx-weg');
    requestAnimationFrame(function () { k.classList.remove('dx-hoch'); });
    clearTimeout(uhr);
    uhr = setTimeout(function () { zustand = 'held'; kopf(); binde(); }, DAUER());
  };

  var an = function () { return mq.matches && k.classList.contains('dx-zieht'); };
  
  var rundgang = function () { return !!document.querySelector('.rdg-karte'); };
  var gebunden = false;
  var rad = function (e) {
    if (!an()) return;
    if (rundgang()) { e.preventDefault(); return; }
    if (zustand === 'held' || zustand === 'zieht' || Date.now() < sperre) { if (zustand !== 'unten' || scrollY <= 2) e.preventDefault(); }
    if (Date.now() < sperre) return;
    if (zustand === 'held' && e.deltaY > 4) runter();
    else if (zustand === 'unten' && scrollY <= 2 && e.deltaY < -4) { e.preventDefault(); hoch(); }
  };
  var ty = null;
  addEventListener('touchstart', function (e) { ty = e.touches[0].clientY; }, { passive: true });
  var wisch = function (e) {
    if (!an() || ty == null) return;
    if (rundgang()) { e.preventDefault(); return; }
    var d = ty - e.touches[0].clientY;
    if (zustand === 'held') { e.preventDefault(); if (d > 24 && Date.now() >= sperre) runter(); }
    else if (zustand === 'unten' && scrollY <= 2 && d < -24 && Date.now() >= sperre) { e.preventDefault(); hoch(); }
  };
  
  var binde = function () {
    var soll = an() && (zustand !== 'unten' || scrollY <= 2 || rundgang());
    if (soll === gebunden) return; gebunden = soll;
    var f = soll ? window.addEventListener : window.removeEventListener;
    f.call(window, 'wheel', rad, { passive: false }); f.call(window, 'touchmove', wisch, { passive: false });
  };
  addEventListener('keydown', function (e) {
    if (!an() || rundgang() || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    var r = ['ArrowDown', 'PageDown', ' ', 'End'].indexOf(e.key) >= 0, h = ['ArrowUp', 'PageUp', 'Home'].indexOf(e.key) >= 0;
    if (zustand === 'held' && r) { e.preventDefault(); runter(); }
    else if (zustand === 'unten' && scrollY <= 2 && h) { e.preventDefault(); hoch(); }
  });
  addEventListener('scroll', function () { kopf(); binde(); }, { passive: true });

  var richte = function () {
    var ein = mq.matches;
    k.classList.toggle('dx-zieht', ein);
    if (!ein) { html.classList.remove('dx-zu'); k.classList.remove('dx-hoch', 'dx-weg'); zustand = 'held'; if (oben) oben.classList.remove('dx-aus'); binde(); return; }
    if (zustand === 'held') { html.classList.add('dx-zu'); scrollTo(0, 0); }
    binde();
  };
  richte();
  if (location.hash && location.hash !== '#oben' && mq.matches) { zustand = 'held'; runter(); }
  if (mq.addEventListener) mq.addEventListener('change', richte);
  
  var zumHero = function () {
    if (!an() || !rundgang()) return;
    if (zustand === 'unten') { scrollTo(0, 0); hoch(); binde(); }
    else if (zustand === 'zieht') setTimeout(zumHero, 300);
  };
  if ('MutationObserver' in window) new MutationObserver(function (ms) {
    ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.classList && n.classList.contains('rdg-karte')) { zumHero(); binde(); } }); [].forEach.call(m.removedNodes, function (n) { if (n.classList && n.classList.contains('rdg-karte')) binde(); }); });
  }).observe(document.body, { childList: true });
  window.DX_DASH = { runter: runter, hoch: hoch, zustand: function () { return zustand; } };
})();

(function () {
  'use strict';
  var r = document.querySelector('.dx-root'); if (!r || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  r.classList.add('dx-flug');
  var teile = [].slice.call(r.querySelectorAll('.dx-unterband > .dx-sek'));
  teile.forEach(function (s) { [].slice.call(s.querySelectorAll('.dx-sinhalt .dx-p')).forEach(function (p, i) { p.style.setProperty('--fd', (Math.min(i, 6) * 0.08).toFixed(2) + 's'); }); });
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('dx-da'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
  teile.forEach(function (s) { io.observe(s); });
})();

(function () {
  'use strict';
  var lx = document.querySelector('.dx-lx'); if (!lx) return;
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s) { return [].slice.call(lx.querySelectorAll(s)); };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  
  var bilder = $$('.dx-lx-seite'), tabs = bilder.length ? $$('.dx-lx-tab') : [], strich = lx.querySelector('.dx-lx-strich'), jetzt = 0, uhr = 0, sicht = false, halt = false;
  var zeige = function (i) {
    jetzt = (i + tabs.length) % tabs.length;
    tabs.forEach(function (t, j) { t.classList.toggle('dx-an', j === jetzt); t.setAttribute('aria-selected', j === jetzt ? 'true' : 'false'); });
    bilder.forEach(function (b, j) { if (j === jetzt && b.loading === 'lazy') b.loading = 'eager'; b.classList.toggle('dx-an', j === jetzt); });
    var t = tabs[jetzt]; if (strich && t) { strich.style.width = t.offsetWidth + 'px'; strich.style.transform = 'translateX(' + t.offsetLeft + 'px)'; }
  };
  var weiter = function () { clearTimeout(uhr); if (ruhig) return; uhr = setTimeout(function () { if (sicht && !halt) zeige(jetzt + 1); weiter(); }, 3600); };
  tabs.forEach(function (t, i) { t.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); zeige(i); weiter(); }); });
  var web = lx.querySelector('.dx-lx-web');
  if (web) { web.addEventListener('pointerenter', function () { halt = true; }); web.addEventListener('pointerleave', function () { halt = false; }); }
  if (tabs.length) { zeige(0); addEventListener('resize', function () { zeige(jetzt); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { zeige(jetzt); }); }

  
  var d0 = new Date(); d0.setDate(d0.getDate() - 13);
  var t0 = lx.querySelector('.dx-lx-t0'); if (t0) t0.textContent = d0.getDate() + ' ' + MON[d0.getMonth()];
  var balken = function () { $$('.dx-lx-b').forEach(function (b) { var s = b.querySelector('span'); if (s) s.textContent = b.getAttribute('data-v') + ' visits'; }); };
  balken();

  
  var summe = lx.querySelector('.dx-lx-summe');
  var zaehle = function () {
    if (!summe) return; var ziel = +summe.getAttribute('data-ziel') || 0;
    if (ruhig) { summe.textContent = ziel.toLocaleString('en-GB'); return; }
    var a = performance.now(), D = 1600;
    (function s(t) { var x = Math.min(1, (t - a) / D); summe.textContent = Math.round(ziel * (1 - Math.pow(1 - x, 4))).toLocaleString('en-GB'); if (x < 1) requestAnimationFrame(s); })(a);
  };

  
  var liste = function (x) { return (Array.isArray(x) ? x : []).filter(function (e) { return e && Number(e.n) > 0; }).sort(function (a, b) { return b.n - a.n; }); };
  var nichts = function (el) { if (el) el.innerHTML = '<p class="dx-lx-cleer">Nothing counted yet</p>'; };
  var fuelle = function (m) {
    var tage = m.je_tag.slice(-14).map(function (x) { return Math.max(0, Number(x && x.besuche) || 0); });
    var sum = tage.reduce(function (a, b) { return a + b; }, 0); if (!sum) return;
    while (tage.length < 14) tage.unshift(0);
    var mx = Math.max.apply(null, tage) || 1;
    $$('.dx-lx-b').forEach(function (b, i) { b.style.setProperty('--h', (100 * tage[i] / mx).toFixed(1) + '%'); b.setAttribute('data-v', tage[i]); });
    balken(); if (summe) summe.setAttribute('data-ziel', sum);
    
    var zq = $$('.dx-lx-q'), zeichen = {}, neutral = '';
    zq.forEach(function (r) { var s = r.querySelector('svg'), nm = r.querySelector('.dx-lx-qn2'); if (s && nm) { zeichen[nm.textContent] = s.outerHTML; neutral = s.outerHTML; } });
    var hk = liste(m.herkunft), hg = hk.reduce(function (a, x) { return a + Number(x.n); }, 0);
    if (!hk.length) nichts(lx.querySelector('.dx-lx-qs'));
    else zq.forEach(function (r, i) {
      var x = hk[i]; if (!x) { r.parentNode.removeChild(r); return; }
      var p = Math.round(100 * x.n / hg), s = r.querySelector('svg'), nm = r.querySelector('.dx-lx-qn2'), b = r.querySelector('b');
      if (s) s.outerHTML = (x.k === 'Instagram' || x.k === 'Google' || x.k === 'Google Maps' || x.k === 'Facebook') && zeichen[x.k] ? zeichen[x.k] : neutral;
      if (nm) nm.textContent = x.k; if (b) b.textContent = p + ' %'; r.style.setProperty('--w', p + '%');
    });
    
    var ge = {}, gg = 0; (Array.isArray(m.geraete) ? m.geraete : []).forEach(function (x) { if (x && Number(x.n) > 0) { ge[x.k] = Number(x.n); gg += Number(x.n); } });
    var teil = $$('.dx-lx-split i'), leg = $$('.dx-lx-gl b');
    if (!gg) { var gt = lx.querySelector('.dx-lx-split'); if (gt) { var gl = lx.querySelector('.dx-lx-gls'); if (gl) gl.parentNode.removeChild(gl); gt.className = ''; nichts(gt); } }
    else ['handy', 'rechner', 'tablet'].forEach(function (k, i) {
      var p = Math.round(100 * (ge[k] || 0) / gg);
      if (teil[i]) teil[i].style.setProperty('--w', p + '%'); if (leg[i]) leg[i].innerHTML = p + '<small>%</small>';
    });
    
    var namen = {}; [].slice.call(document.querySelectorAll('.dx-lx-tab')).forEach(function (t) { namen[t.getAttribute('data-s') + '.html'] = t.textContent; });
    var st = liste(m.seiten), sg = st.reduce(function (a, x) { return a + Number(x.n); }, 0), rang = $$('.dx-lx-rang li');
    if (!st.length) { var ro = lx.querySelector('.dx-lx-rang'); if (ro) { var er = document.createElement('div'); ro.parentNode.replaceChild(er, ro); nichts(er); } }
    else rang.forEach(function (li, i) {
      var x = st[i]; if (!x) { li.parentNode.removeChild(li); return; }
      var b = li.querySelector('b'), rp = li.querySelector('.dx-lx-rp');
      if (b) b.textContent = namen[x.s] || String(x.s || '').replace(/\.html$/, ''); if (rp) rp.textContent = Math.round(100 * x.n / sg) + ' %';
      li.style.setProperty('--w', Math.round(100 * x.n / st[0].n) + '%');
    });
    var bsp = lx.querySelector('.dx-lx-bsp'); if (bsp) bsp.hidden = true;
    var tr = lx.querySelector('.dx-lx-trend'); if (tr) tr.textContent = 'counted by Cloudflare, without cookies';
    if (lx.classList.contains('dx-an')) zaehle();
  };
  var gefuellt = false;
  document.addEventListener('dx-reg', function (e) {
    var m = e.detail || {}; if (gefuellt || m.beispiel || !Array.isArray(m.je_tag)) return;
    if (!m.je_tag.slice(-14).some(function (x) { return Number(x && x.besuche) > 0; })) return;
    gefuellt = true;
    
    var weg = ''; try { weg = [].concat((JSON.parse(document.getElementById('maison-wege').textContent) || {}).registre || []).filter(Boolean)[0] || ''; } catch (f) {}
    var w14 = /tage=\d+/.test(weg) ? weg.replace(/tage=\d+/, 'tage=14') : '';
    if (!w14) { fuelle(m); return; }
    fetch(w14, { cache: 'no-store', credentials: 'same-origin' }).then(function (r) { return r.ok && r.status !== 204 ? r.json() : Promise.reject(r.status); })
      .then(function (d) { fuelle(d && !d.beispiel && Array.isArray(d.je_tag) ? d : m); }).catch(function () { fuelle(m); });
  });
  if (window.DX_REG) document.dispatchEvent(new CustomEvent('dx-reg', { detail: window.DX_REG }));

  
  var los = function () { if (lx.classList.contains('dx-an')) return; lx.classList.add('dx-an'); zaehle(); setTimeout(function () { lx.classList.add('dx-fertig'); }, ruhig ? 0 : 2000); };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { sicht = e.isIntersecting; if (e.isIntersecting && e.intersectionRatio > 0.15) los(); }); }, { threshold: [0, 0.15, 0.4] }).observe(lx);
  } else { sicht = true; los(); }
  if (tabs.length) weiter();
})();

(function () {
  'use strict';
  var lx = document.querySelector('.dx-lx'); if (!lx) return;
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bes = lx.querySelector('.dx-lx-bes'), seg = lx.querySelector('.dx-lx-seg');
  if (bes && seg) {
    var knoepfe = [].slice.call(seg.querySelectorAll('.dx-lx-sb')), ans = [].slice.call(bes.querySelectorAll('.dx-lx-ans')), a = 0, uhr = 0, halt = false, sicht = false;
    var zeige = function (i) {
      a = (i + ans.length) % ans.length;
      seg.style.setProperty('--s', a);
      knoepfe.forEach(function (k, j) { k.classList.toggle('dx-an', j === a); k.setAttribute('aria-selected', j === a ? 'true' : 'false'); });
      ans.forEach(function (v, j) { v.classList.toggle('dx-an', j === a); });
    };
    var weiter = function () { clearTimeout(uhr); if (ruhig) return; uhr = setTimeout(function () { if (sicht && !halt && lx.classList.contains('dx-an')) zeige(a + 1); weiter(); }, 6500); };
    knoepfe.forEach(function (k, i) { k.addEventListener('click', function (e) { e.preventDefault(); zeige(i); weiter(); }); });
    bes.addEventListener('pointerenter', function () { halt = true; }); bes.addEventListener('pointerleave', function () { halt = false; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { sicht = es[0].isIntersecting; }).observe(bes); else sicht = true;
    zeige(0); weiter();
  }

  
  var chat = lx.querySelector('.dx-lx-chat'); if (!chat) return;
  var WEGE = {}; try { WEGE = JSON.parse(document.getElementById('maison-wege').textContent) || {}; } catch (e) {}
  var ueb = [].concat(WEGE.reception || []).filter(Boolean)[0];
  var feld = chat.querySelector('.dx-lx-fragen'), titel = chat.querySelector('.dx-lx-ctitel'), bsp = chat.querySelector('.dx-lx-cbsp');
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var wann = function (t) { var d = new Date(t); if (isNaN(d)) return ''; var h = d.getHours(), m = d.getMinutes(); return d.getDate() + ' ' + MON[d.getMonth()] + ', ' + ((h % 12) || 12) + ':' + (m < 10 ? '0' : '') + m + (h < 12 ? ' AM' : ' PM'); };
  var zahl = function (k, v) { var el = chat.querySelector('[data-c="' + k + '"]'); if (el) el.textContent = v == null ? '–' : String(v); };
  var leer = function (t) { if (feld) feld.innerHTML = '<p class="dx-lx-cleer">' + esc(t) + '</p>'; };
  if (!ueb) { leer('The questions show here once the chat is online.'); return; }
  var holen = function (u) { return fetch(u, { cache: 'no-store', credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); }); };
  holen(ueb).then(function (u) {
    zahl('antworten', u.antworten); zahl('offen', u.anfragen_offen); zahl('ohne', u.ohne_antwort);
    return holen(ueb.replace(/api\/ueberblick.*$/, 'api/fragen'));
  }).then(function (d) {
    var f = (d && d.fragen || []).filter(function (x) { return x && !x.erledigt && !x.belegt; });
    f.sort(function (x, y) { return String(y.zeit).localeCompare(String(x.zeit)); });
    if (!f.length) { if (titel) titel.textContent = 'Every question has an answer'; leer('No open question. New ones show here as soon as a guest asks.'); return; }
    if (titel) titel.textContent = 'What guests asked last';
    if (bsp) bsp.hidden = !f.slice(0, 3).some(function (x) { return x.beispiel; });
    feld.innerHTML = f.slice(0, 3).map(function (x, i) {
      return '<div class="dx-lx-fr" style="--i:' + i + '"><div class="dx-lx-blase dx-gast">' + esc(x.frage) + '</div><small>' + esc(x.thema || x.gruppe || '') + (x.zeit ? ' · ' + esc(wann(x.zeit)) : '') + ' · no answer yet</small></div>';
    }).join('');
  }).catch(function () { leer('The questions cannot be read right now.'); });
})();

(function () {
  'use strict';
  var feld = document.querySelector('.dx-lx-tliste'); if (!feld) return;
  var WEGE = {}; try { WEGE = JSON.parse(document.getElementById('maison-wege').textContent) || {}; } catch (e) {}
  var ueb = [].concat(WEGE.reception || []).filter(Boolean)[0];
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var leer = function (t) { feld.style.setProperty('--tn', 1); feld.innerHTML = '<p class="dx-lx-cleer">' + esc(t) + '</p>'; };
  var zahl = function (k, v) { [].slice.call(document.querySelectorAll('.dx-lx-themen [data-c="' + k + '"]')).forEach(function (el) { el.textContent = v == null ? '–' : String(v); }); };
  if (!ueb) { leer('The topics show here once the chat is online.'); return; }
  var holen = function (u) { return fetch(u, { cache: 'no-store', credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); }); };
  holen(ueb).then(function (u) { zahl('antworten', u.antworten); zahl('offen', u.anfragen_offen); zahl('ohne', u.ohne_antwort); return holen(ueb.replace(/api\/ueberblick.*$/, 'api/fragen')); })
  .then(function (d) {
    var f = (d && d.fragen || []).filter(function (x) { return x && !x.erledigt && !x.belegt; });
    if (!f.length) { leer('No open question. Every guest got an answer.'); return; }
    var g = {}; f.forEach(function (x) { var t = x.thema || x.gruppe || 'Other questions'; (g[t] = g[t] || []).push(x); });
    var t = Object.keys(g).map(function (k) { g[k].sort(function (a, b) { return String(b.zeit).localeCompare(String(a.zeit)); }); return { k: k, n: g[k].length, f: g[k][0].frage }; })
      .sort(function (a, b) { return b.n - a.n; }).slice(0, 4);
    feld.style.setProperty('--tn', t.length);
    feld.innerHTML = t.map(function (x, i) { return '<div class="dx-lx-th" style="--i:' + i + '"><div><span>' + esc(x.k) + '</span><b>' + x.n + '</b></div><p>\u00ab' + esc(x.f) + '\u00bb</p></div>'; }).join('');
  }).catch(function () { leer('The topics cannot be read right now.'); });
})();

(function () {
  'use strict';
  var lx = document.querySelector('.dx-lx'), verlauf = document.querySelector('.dx-lx-verlauf'), liste = document.querySelector('.dx-lx-tliste2');
  if (!lx || !verlauf) return;
  var WEGE = {}; try { WEGE = JSON.parse(document.getElementById('maison-wege').textContent) || {}; } catch (e) {}
  var ueb = [].concat(WEGE.reception || []).filter(Boolean)[0];
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var uhr = function (d) { var h = d.getHours(), m = d.getMinutes(); return ((h % 12) || 12) + ':' + (m < 10 ? '0' : '') + m + (h < 12 ? ' AM' : ' PM'); };
  var tag = function (d) { var h = new Date(); h.setHours(0, 0, 0, 0); var x = new Date(d); x.setHours(0, 0, 0, 0); var n = Math.round((h - x) / 864e5); return n === 0 ? 'Today' : n === 1 ? 'Yesterday' : x.getDate() + ' ' + MON[x.getMonth()]; };
  var zahl = function (k, v) { [].slice.call(document.querySelectorAll('.dx-lx-themen2 [data-c="' + k + '"]')).forEach(function (el) { el.textContent = v == null ? '–' : String(v); }); };
  var leer = function (el, t) { if (el) el.innerHTML = '<p class="dx-lx-cleer">' + esc(t) + '</p>'; };
  if (!ueb) { leer(verlauf, 'The questions show here once the chat is online.'); leer(liste, 'The topics show here once the chat is online.'); return; }
  var holen = function (u) { return fetch(u, { cache: 'no-store', credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); }); };
  holen(ueb).then(function (u) {
    zahl('antworten', u.antworten); zahl('offen', u.anfragen_offen); zahl('ohne', u.ohne_antwort);
    return holen(ueb.replace(/api\/ueberblick.*$/, 'api/fragen'));
  }).then(function (d) {
    var f = (d && d.fragen || []).filter(function (x) { return x && !x.erledigt && !x.belegt; });
    f.sort(function (a, b) { return String(a.zeit).localeCompare(String(b.zeit)); });
    if (!f.length) { leer(verlauf, 'No open question. Every guest got an answer.'); leer(liste, 'Nothing open.'); return; }
    var bsp = document.querySelector('.dx-lx-cbsp'); if (bsp) bsp.hidden = !f.some(function (x) { return x.beispiel; });
    var letzte = f.slice(-4), html = '', vorher = '';
    letzte.forEach(function (x, i) {
      var dt = new Date(x.zeit), t = isNaN(dt) ? '' : tag(dt);
      if (t && t !== vorher) { html += '<span class="dx-lx-tag">' + esc(t) + '</span>'; vorher = t; }
      var wer = (x.name || 'Guest').trim(), k = wer.charAt(0).toUpperCase();
      html += '<div class="dx-lx-msg" style="--i:' + i + '"><span class="dx-lx-gav">' + esc(k) + '</span><div class="dx-lx-mb"><p>' + esc(x.frage) + '</p><small>' +
        esc(x.thema || x.gruppe || '') + (isNaN(dt) ? '' : ' · ' + uhr(dt)) + ' · <em>no answer yet</em></small></div></div>';
    });
    if (f.length > letzte.length) html += '<div class="dx-lx-tippt">+ ' + (f.length - letzte.length) + ' more without an answer</div>';
    verlauf.innerHTML = html;
    if (liste) {
      var g = {}; f.forEach(function (x) { var t = x.thema || x.gruppe || 'Other questions'; (g[t] = g[t] || []).push(x); });
      var t = Object.keys(g).map(function (k) { g[k].sort(function (a, b) { return String(b.zeit).localeCompare(String(a.zeit)); }); return { k: k, n: g[k].length, f: g[k][0].frage }; })
        .sort(function (a, b) { return b.n - a.n; }).slice(0, 5);
      liste.innerHTML = t.map(function (x, i) { return '<div class="dx-lx-th2" style="--i:' + i + '"><span>' + esc(x.k) + '</span><b>' + x.n + '</b><p>«' + esc(x.f) + '»</p></div>'; }).join('');
    }
  }).catch(function () { leer(verlauf, 'The questions cannot be read right now.'); leer(liste, 'The topics cannot be read right now.'); });
})();

(function () {
  'use strict';
  var r = document.querySelector('.dx-root'); if (!r) return;
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var teile = [].slice.call(r.querySelectorAll('.dx-lspalte .dx-rail, .dx-onl, .dx-unterband > .dx-sek > .dx-skopf, .dx-f5k, .dx-q18k, .dx-lx-web, .dx-lx-menus, .dx-lx-menus2, .dx-lx-bt, .dx-lx-breit, .dx-lx-fenster, .dx-lx-themen2, .dx-lx-cb, .dx-nu, .dx-make, .dx-brand2, .dx-acad'));
  var zoombar = '.dx-f5bogen img, .dx-q18k > img, .dx-onlb img, .dx-lx-mlb, .dx-lx-mkb, .dx-ptb img';
  teile.forEach(function (t) {
    t.classList.add('dx-tritt');
    [].slice.call(t.querySelectorAll(zoombar)).forEach(function (z) { z.classList.add('dx-zoom'); });
    var g = [].slice.call(t.parentNode.children).filter(function (x) { return teile.indexOf(x) >= 0; });
    t.style.setProperty('--td', (Math.min(g.indexOf(t), 6) * 0.12).toFixed(2) + 's');
  });
  if (ruhig || !('IntersectionObserver' in window)) { r.classList.add('dx-los'); teile.forEach(function (t) { t.classList.add('dx-da'); }); return; }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('dx-da'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -40px 0px', threshold: 0 });
  teile.forEach(function (t) { io.observe(t); });
  
  var vor = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; vor.unobserve(e.target);
    [].slice.call(e.target.querySelectorAll('img')).forEach(function (i) { if (i.loading === 'lazy') i.loading = 'eager'; if (i.decode) i.decode().catch(function () {}); }); }); }, { rootMargin: '0px 0px 900px 0px' });
  teile.forEach(function (t) { vor.observe(t); });
  
  var k = document.querySelector('.dx-kulisse');
  if (!k || !k.classList.contains('dx-zieht')) r.classList.add('dx-los');
})();


(function () {
  'use strict';
  var els = [].slice.call(document.querySelectorAll('.dx-root [data-ein]')); if (!els.length) return;
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach(function (e) { e.classList.add('dx-ein'); }); return; }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('dx-ein'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -60px 0px' });
  els.forEach(function (e) { io.observe(e); });
})();

(function () {
  'use strict';
  var box = document.querySelector('.dx-lx-echt'); if (!box) return;
  var web = box.closest('.dx-lx-web'), tabs = [].slice.call(web.querySelectorAll('.dx-lx-tab')), strich = web.querySelector('.dx-lx-strich');
  var ifs = [].slice.call(box.querySelectorAll('.dx-lx-if')), poster = box.querySelector('.dx-lx-poster');
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var jetzt = -1, vorn = -1, laedt = false, sicht = false, halt = false, uhr = 0, zuletzt = 0, wartet = -1;
  var masse = function () {
    var w = box.clientWidth, h = box.clientHeight, sk = w / 1440;
    ifs.forEach(function (f) { f.style.setProperty('--sk', sk.toFixed(4)); f.style.height = Math.ceil(h / sk) + 'px'; });
  };
  var strichZu = function (i) { var t = tabs[i]; if (strich && t) { strich.style.width = t.offsetWidth + 'px'; strich.style.transform = 'translateX(' + t.offsetLeft + 'px)'; } };
  var zeige = function (i) {
    i = (i + tabs.length) % tabs.length;
    if (i === jetzt) return;
    if (laedt) { wartet = i; return; }
    jetzt = i; laedt = true;
    tabs.forEach(function (t, j) { t.classList.toggle('dx-an', j === i); t.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
    strichZu(i);
    var neu = ifs[vorn === 0 ? 1 : 0], alt = vorn >= 0 ? ifs[vorn] : null;
    var fertig = function () {
      neu.onload = null;
      neu.classList.add('dx-an'); if (alt) alt.classList.remove('dx-an');
      vorn = ifs.indexOf(neu);
      setTimeout(function () { if (alt && !alt.classList.contains('dx-an')) alt.src = 'about:blank'; if (poster) poster.style.visibility = 'hidden'; laedt = false; if (wartet >= 0) { var w = wartet; wartet = -1; zeige(w); } }, 950);
    };
    neu.onload = function () { setTimeout(fertig, 400); };
    neu.title = 'The website, page ' + tabs[i].textContent;
    neu.src = 'ansicht/' + tabs[i].getAttribute('data-s') + '.html';
  };
  var weiter = function () {
    clearTimeout(uhr); if (ruhig) return;
    uhr = setTimeout(function () {
      if (sicht && !halt && Date.now() - zuletzt > 900) zeige(jetzt + 1);
      weiter();
    }, 7000);
  };
  tabs.forEach(function (t, i) { t.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); zeige(i); weiter(); }); });
  web.addEventListener('pointerenter', function () { halt = true; }); web.addEventListener('pointerleave', function () { halt = false; });
  addEventListener('scroll', function () { zuletzt = Date.now(); }, { passive: true });
  addEventListener('resize', function () { masse(); strichZu(Math.max(0, jetzt)); });
  masse(); strichZu(0);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { strichZu(Math.max(0, jetzt)); });
  var start = function () { if (jetzt < 0) { masse(); zeige(0); weiter(); } };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) start(); }); }, { rootMargin: '0px 0px 700px 0px' }).observe(box);
    new IntersectionObserver(function (es) { sicht = es[0].isIntersecting; }).observe(box);
  } else { sicht = true; start(); }
})();

(function () {
  'use strict';
  var cb = document.querySelector('.dx-lx-cb'); if (!cb) return;
  var buehne = cb.querySelector('.dx-lx-cbb'), punkte = cb.querySelector('.dx-lx-cbp'), themen = cb.querySelector('.dx-lx-cbt'), bsp = cb.querySelector('.dx-lx-cbsp');
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WEGE = {}; try { WEGE = JSON.parse(document.getElementById('maison-wege').textContent) || {}; } catch (e) {}
  var ueb = [].concat(WEGE.reception || []).filter(Boolean)[0];
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var wann = function (t) { var d = new Date(t); if (isNaN(d)) return ''; var h = d.getHours(), m = d.getMinutes(); return d.getDate() + ' ' + MON[d.getMonth()] + ', ' + ((h % 12) || 12) + ':' + (m < 10 ? '0' : '') + m + (h < 12 ? ' AM' : ' PM'); };
  var zahl = function (k, v) { var el = cb.querySelector('[data-c="' + k + '"]'); if (el) el.textContent = v == null ? '–' : String(v); };
  var leer = function (el, t) { if (el) el.innerHTML = '<p class="dx-lx-cleer">' + esc(t) + '</p>'; };
  if (!ueb) { leer(buehne, 'The questions show here once the chat is online.'); leer(themen, 'The topics show here once the chat is online.'); return; }
  var holen = function (u) { return fetch(u, { cache: 'no-store', credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); }); };
  var liste = [], a = -1, sicht = false;
  var setze = function (i) {
    if (!liste.length) return;
    a = (i + liste.length) % liste.length;
    var x = liste[a], k = 0;
    var worte = String(x.frage || '').split(/(\s+)/).map(function (w) { return /^\s+$/.test(w) ? w : '<span class="dx-w" style="--k:' + (k++) + '">' + esc(w) + '</span>'; }).join('');
    var lz = worte.lastIndexOf('</span>'); if (lz >= 0) worte = worte.slice(0, lz) + '<i class="dx-qz">»</i>' + worte.slice(lz);   
    var alt = buehne.querySelector('.dx-lx-cbf:not(.dx-geht)');
    if (alt) { alt.classList.add('dx-geht'); setTimeout(function () { if (alt.parentNode) alt.parentNode.removeChild(alt); }, ruhig ? 0 : 900); }
    var f = document.createElement('figure'); f.className = 'dx-lx-cbf';
    f.innerHTML = '<q>' + worte + '</q><small><span class="dx-t">' + esc(x.thema || x.gruppe || 'Other questions') + '</span>' + (x.zeit ? '<span>· ' + esc(wann(x.zeit)) + '</span>' : '') + '<em>· no answer yet</em></small>';
    var leerT = buehne.querySelector('.dx-lx-cleer'); if (leerT) leerT.parentNode.removeChild(leerT);
    buehne.appendChild(f);
    f.getBoundingClientRect();
    requestAnimationFrame(function () { f.classList.add('dx-da'); });
    [].slice.call(punkte.children).forEach(function (p, j) { p.classList.remove('dx-jetzt'); p.classList.toggle('dx-war', j < a); });
    var p = punkte.children[a]; if (p) { p.getBoundingClientRect(); p.classList.add('dx-jetzt'); }
  };
  var pause = function () { cb.classList.toggle('dx-halt', !sicht || cb.matches(':hover')); };
  cb.addEventListener('pointerenter', function () { cb.classList.add('dx-halt'); });
  cb.addEventListener('pointerleave', pause);
  punkte.addEventListener('animationend', function () { if (!ruhig) setze(a + 1); });
  punkte.addEventListener('click', function (e) { var j = [].indexOf.call(punkte.children, e.target); if (j >= 0) setze(j); });
  holen(ueb).then(function (u) {
    zahl('antworten', u.antworten); zahl('offen', u.anfragen_offen); zahl('ohne', u.ohne_antwort);
    return holen(ueb.replace(/api\/ueberblick.*$/, 'api/fragen'));
  }).then(function (d) {
    var f = (d && d.fragen || []).filter(function (x) { return x && !x.erledigt && !x.belegt; });
    f.sort(function (x, y) { return String(y.zeit).localeCompare(String(x.zeit)); });
    if (!f.length) { leer(buehne, 'No open question. Every guest got an answer.'); leer(themen, 'Nothing open.'); return; }
    if (bsp) bsp.hidden = !f.some(function (x) { return x.beispiel; });
    liste = f.slice(0, 6);
    punkte.innerHTML = liste.map(function (x, j) { return '<i role="button" aria-label="Question ' + (j + 1) + '"></i>'; }).join('');
    var g = {}; f.forEach(function (x) { var t = x.thema || x.gruppe || 'Other questions'; g[t] = (g[t] || 0) + 1; });
    var t = Object.keys(g).map(function (k) { return { k: k, n: g[k] }; }).sort(function (x, y) { return y.n - x.n; }).slice(0, 5), mx = t[0].n;
    themen.innerHTML = t.map(function (x, i) { return '<div class="dx-lx-cbth" style="--i:' + i + ';--w:' + Math.round(100 * x.n / mx) + '%"><span>' + esc(x.k) + '</span><b>' + x.n + '</b><i><em></em></i></div>'; }).join('');
    var los = function () { if (a < 0) setze(0); };
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { sicht = es[0].isIntersecting; pause(); if (sicht) los(); }, { threshold: 0.2 }).observe(cb);
    else { sicht = true; los(); }
  }).catch(function () { leer(buehne, 'The questions cannot be read right now.'); leer(themen, 'The topics cannot be read right now.'); });
})();

(function () {
  'use strict';
  var b = document.querySelector('.dx-fsb'); if (!b) return;
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var st = [].slice.call(b.querySelectorAll('.dx-fs')), F = { 1: -0.07, 2: 0.05, 3: 0.13 }, an = false, tk = 0;
  var treib = function () {
    tk = 0;
    if (innerWidth < 900 || ruhig) { st.forEach(function (el) { el.style.translate = ''; }); return; }
    var r = b.getBoundingClientRect(), d = Math.max(-innerHeight * 0.6, Math.min(innerHeight * 0.6, r.top + r.height / 2 - innerHeight / 2));
    st.forEach(function (el) { el.style.translate = '0 ' + (d * (F[el.getAttribute('data-ebene')] || 0)).toFixed(1) + 'px'; });
  };
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { an = es[0].isIntersecting; if (an) treib(); }, { rootMargin: '200px 0px' }).observe(b);
  else an = true;
  addEventListener('scroll', function () { if (an && !tk) tk = requestAnimationFrame(treib); }, { passive: true });
  addEventListener('resize', treib); treib();
})();
