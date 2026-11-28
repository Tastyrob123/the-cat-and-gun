/* Control panel · The Cat & Gun (22.11.2026). Quelle für bau.py, nicht die Ausgabe. Kopie von quelle/maison.js der Zentrale der Vorlage (Werkzeuge 2.0); */

(function () {
  'use strict';
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ganz = function (x) { var n = parseInt(x, 10); return isFinite(n) && n > 0 ? n : 0; };
  var n = function (x) { return Number(x || 0).toLocaleString('en-GB'); };
  var setze = function (key, html) { $$('[data-stand="' + key + '"]').forEach(function (el) { el.innerHTML = html; }); };
  var zahl = function (key, wert) { $$('[data-zahl="' + key + '"]').forEach(function (el) { el.textContent = wert; }); };
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;

  
  var h = new Date().getHours();
  var fest = { morgen: 8, tag: 13, abend: 20 }[(/[?&]gruss=(morgen|tag|abend)/.exec(location.search) || [])[1]]; if (fest) h = fest;
  $('#gruss').textContent = h >= 5 && h < 11 ? 'Good morning, Julie.' : h >= 11 && h < 18 ? 'Good afternoon, Julie.' : 'Good evening, Julie.';
  
  var MONATE = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var dh = new Date();
  $('#datum').textContent = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dh.getDay()] + ', ' + dh.getDate() + ' ' + MONATE[dh.getMonth()] + ' ' + dh.getFullYear();

  
  $$('.rl').forEach(function (el) {
    el.innerHTML = el.textContent.split('').map(function (z, i) { return '<b style="--n:' + i + '">' + esc(z) + '</b>'; }).join('');
  });

  
  var passt = function () {
    var o = $('.m-oben'), i = $('.m-insel'), w = $('.m-insel__wege'), r = $$('.m-oben__ecke'); if (!o || !i || !w) return;
    o.classList.remove('eng');
    var rechts = r.length ? r[r.length - 1].getBoundingClientRect().left : innerWidth;
    var links = r.length > 1 && getComputedStyle(r[0]).display !== 'none' ? r[0].getBoundingClientRect().right : 0;
    var b = i.getBoundingClientRect();
    if (i.scrollWidth > i.clientWidth + 1 || b.right > rechts - 12 || b.left < links + 12) o.classList.add('eng');
  };
  passt(); addEventListener('resize', passt); if (document.fonts && document.fonts.ready) document.fonts.ready.then(passt);
  
  var oben = $('.m-oben'), letzt = 0;
  addEventListener('scroll', function () {
    var y = scrollY; if (Math.abs(y - letzt) < 6) return;
    oben.classList.toggle('weg', y > letzt && y > 160); letzt = y;
  }, { passive: true });

  var rahmen = $('.hz-rahmen'), empfang = $('.m-empfang');

  
  (function () {
    if (!empfang) return;
    var los = function () { empfang.classList.add('bereit'); };
    var uhr = setTimeout(los, 1400), r = $$('.hz-bild--ruhe, .m-f5__k img');   
    Promise.all(r.map(function (i) { return (i.decode ? i.decode() : Promise.resolve()).catch(function () {}); })).then(function () { clearTimeout(uhr); requestAnimationFrame(los); });
  })();

  
  
  $$('.m-f5__k img').forEach(function (i) { var da = function () { i.classList.add('da'); }; if (i.complete && i.naturalWidth) da(); else { i.addEventListener('load', da, { once: true }); i.addEventListener('error', da, { once: true }); } });
  var Z = $$('.hz-z a'), B = $$('[data-vorschau]'), U = $$('.hz-unter span'), jetzt = 'ruhe', will = 'ruhe';
  var stueck = function (i) { return B.filter(function (b) { return b.getAttribute('data-vorschau') === String(i); })[0]; };
  var zeige = function (i) {
    will = i; if (i === jetzt) return;
    var el = stueck(i); if (!el) { el = stueck('ruhe'); i = 'ruhe'; }
    if (!el) { Z.forEach(function (z, j) { z.classList.toggle('an', j === will); }); jetzt = will; return; }   
    if (el.tagName === 'IMG' && el.loading === 'lazy') el.loading = 'eager';
    var fertig = function () {
      if (will !== i && !(i === 'ruhe' && will === 'ruhe')) return;
      B.forEach(function (b) { b.classList.toggle('an', b === el); });
      U.forEach(function (u) { u.classList.toggle('an', u.getAttribute('data-vorschau') === String(i)); });
      Z.forEach(function (z, j) { z.classList.toggle('an', j === i); });
      jetzt = i;
    };
    (el.tagName === 'IMG' && el.decode ? el.decode() : Promise.resolve()).then(fertig, fertig);
  };
  var tafel = $('.hz-tafel');
  if (tafel) tafel.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch') zeige('ruhe'); });
  Z.forEach(function (z, i) {
    z.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') zeige(i); });
    if (tafel && !tafel.contains(z)) z.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch') zeige('ruhe'); });   
    z.addEventListener('focus', function () { zeige(i); });
    z.addEventListener('blur', function () { setTimeout(function () { if (!tafel.contains(document.activeElement)) zeige('ruhe'); }, 0); });
  });
  
  setTimeout(function () { B.forEach(function (b) { if (b.tagName === 'IMG' && b.loading === 'lazy') { b.loading = 'eager'; b.addEventListener('load', function () { if (b.decode) b.decode().catch(function () {}); }, { once: true }); } }); }, 400);

  
  addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || document.querySelector('.rdg-karte')) return;
    var z = Z.filter(function (a) { return a.getAttribute('data-taste') === e.key; })[0]; if (z) { e.preventDefault(); zeige(Z.indexOf(z)); z.classList.add('gedrueckt'); setTimeout(function () { location.href = z.href; }, 180); }
  });

  
  var zeilen = function (el) {
    var h0 = el.offsetHeight; if (!h0) return;
    var w0 = Math.max(el.scrollWidth, el.clientWidth), roh = el.innerHTML, tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), t, ts = [];
    while ((t = tw.nextNode())) if (/\S/.test(t.data) && !t.parentNode.closest('svg')) ts.push(t);
    ts.forEach(function (t) {
      var f = document.createDocumentFragment();
      t.data.split(/(\s+)/).forEach(function (s) {
        if (!s) return;
        if (/^\s+$/.test(s)) { f.appendChild(document.createTextNode(s)); return; }
        var w = document.createElement('span'); w.className = 'wo-w'; w.textContent = s; f.appendChild(w);
      });
      t.parentNode.replaceChild(f, t);
    });
    if (el.offsetHeight !== h0 || el.scrollWidth > w0 + 1) { el.innerHTML = roh; return; }
    var z = -1, oben = -1e9, halb = parseFloat(getComputedStyle(el).fontSize) * 0.5;
    $$('.wo-w', el).forEach(function (w) { var y = w.getBoundingClientRect().top; if (y > oben + halb) { z++; oben = y; } if (z) w.style.setProperty('--z', z); });
    el.classList.add('wo-zl');
  };
  if (!ruhig) $$('.m-f5__titel, .m-saal__titel').forEach(zeilen);

  
  var ZAHL = /^\s*(\d{1,3}(?:\.\d{3})+|\d{1,7})\s*$/;
  var zaehle = function (el) {
    var roh = el.textContent, m = ZAHL.exec(roh); if (!m) return;
    var ziel = parseInt(m[1].split('.').join(''), 10); if (!(ziel >= 4)) return;   
    var hut = document.createElement('span'), zw = document.createElement('span'), z = document.createElement('span');
    hut.className = 'wo-zl-z'; zw.setAttribute('aria-hidden', 'true'); zw.textContent = roh; z.textContent = '0';
    hut.appendChild(zw); hut.appendChild(z); el.textContent = ''; el.appendChild(hut);
    var t0 = performance.now(), D = 1400;
    (function schritt(jetzt) {
      if (!z.isConnected) return;
      var x = Math.min(1, Math.max(0, (jetzt - t0) / D));
      if (x < 1) { z.textContent = n(Math.round(ziel * (1 - Math.pow(1 - x, 4)))); requestAnimationFrame(schritt); }
      else el.textContent = roh;
    })(t0);
  };
  if (!ruhig && 'IntersectionObserver' in window && 'MutationObserver' in window) {
    var zio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { zio.unobserve(e.target); zaehle(e.target); } }); }, { threshold: 0.6 });
    var zmo = new MutationObserver(function (ms) {
      ms.forEach(function (m) { var el = m.target; if (!el.hasAttribute('data-gezaehlt') && ZAHL.test(el.textContent)) { el.setAttribute('data-gezaehlt', ''); zio.observe(el); } });
    });
    $$('[data-zahl], [data-wg="besuche"], [data-wg="fenster"], [data-wg="weiter"], [data-stand="registre-heute"], [data-stand="registre-seiten"]').forEach(function (el) { zmo.observe(el, { childList: true }); });
  }

  
  var wecke = function (el) { (el.tagName === 'IMG' ? [el] : $$('img[loading="lazy"]', el)).forEach(function (i) { if (!i.complete || !i.naturalWidth) i.loading = 'eager'; }); };
  var fuenftel = function (e) { return e.isIntersecting && (e.intersectionRatio >= 0.2 || e.intersectionRect.height >= innerHeight * 0.2); };
  var alle = $$('[data-r]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (fuenftel(e)) { e.target.classList.add('da'); wecke(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '100000px 0px 0px 0px', threshold: [0, 0.05, 0.1, 0.15, 0.2] });
    alle.forEach(function (el) { io.observe(el); });
    var band = $('[data-laufband]');
    if (band) new IntersectionObserver(function (es) { band.classList.toggle('laeuft', es[0].isIntersecting && !ruhig); }).observe(band);
    var punkte = {};
    $$('.m-insel__p').forEach(function (a) { punkte[a.getAttribute('href').slice(1)] = a; });
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var a = punkte[e.target.id]; if (a) a.classList.toggle('an', e.isIntersecting); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    Object.keys(punkte).forEach(function (id) { var s = document.getElementById(id); if (s) sio.observe(s); });
  } else {
    alle.forEach(function (el) { el.classList.add('da'); });
  }

  
  if (!ruhig && 'IntersectionObserver' in window) {
    var tio = new IntersectionObserver(function (es) {
      var n = 0;
      es.filter(function (e) { return e.isIntersecting; }).forEach(function (e) {
        tio.unobserve(e.target); e.target.style.setProperty('--fd', (Math.min(n++, 7) * 0.1).toFixed(2) + 's'); wecke(e.target); e.target.classList.add('da');
      });
    }, { rootMargin: '100000px 0px -6% 0px', threshold: 0 });
    $$('.m-saal').forEach(function (s) {
      if (!$('.m-buehne', s)) return;
      s.classList.add('flug');
      $$('.m-t, .m-tx', s).forEach(function (t) { tio.observe(t); });
    });
  }

  
  var WEGE = {}; try { WEGE = JSON.parse($('#maison-wege').textContent) || {}; } catch (e) {}
  var hole = function (k) {
    var w = [].concat(WEGE[k] || []).filter(Boolean);
    var weiter = function (i) {
      return i >= w.length ? Promise.reject(new Error('kein Weg')) : fetch(w[i], { cache: 'no-store', credentials: 'same-origin' })
        .then(function (r) { return r.ok && r.status !== 204 ? r.json() : Promise.reject(new Error(r.status)); })
        .then(function (d) { return d && typeof d === 'object' ? d : Promise.reject(new Error('leer')); })
        .catch(function () { return weiter(i + 1); });
    };
    return weiter(0);
  };
  
  var ISO = /^(\d{4})-(\d{2})-(\d{2})(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;
  var tag = function (s) {
    var t = String(s == null ? '' : s).trim(), m = ISO.exec(t); if (!m) return '';
    var d = m[0].length === 10 ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(t.replace(' ', 'T'));   
    return isNaN(d) ? '' : d.getDate() + ' ' + MONATE[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear();
  };
  
  var stamm = function (d) { return d && ('kennung_live' in d || 'kennung_entwurf' in d) ? d : null; };
  var PKT = '\u00a0· ';   

  
  var ohne = function (k) { return ![].concat(WEGE[k] || []).filter(Boolean).length; };
  
  var DA = { da: [], rolle: {} }; try { DA = JSON.parse($('#maison-da').textContent) || DA; } catch (e) {}
  var da = function (k) { return (DA.da || []).indexOf(k) >= 0; };
  var bauen = function (k, lang) { setze(k + '-kurz', da(k) ? esc((DA.rolle || {})[k] || '') : 'In progress'); if (lang) setze(lang, '&nbsp;'); };   
  var plural = function (z, eins, viele) { return z + ' ' + (z === 1 ? eins : viele); };
  
  var WORT = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
  var wort = function (z) { return WORT[z] || String(z); };
  var dtitel = function (key, z, text) { $$('[data-stand="' + key + '"]').forEach(function (el) { el.innerHTML = z ? text : esc(el.getAttribute('data-ohne') || ''); }); };
  var dmarke = function (key, z) { $$('[data-stand="' + key + '"]').forEach(function (el) { if (el.hasAttribute('data-null')) { el.textContent = String(z || 0); return; } el.textContent = z ? String(z) : ''; el.hidden = !z; }); };

  
  if (ohne('bureau')) bauen('bureau', 'bureau');
  else hole('bureau').then(function (u) {
    var s = stamm(u), a = s ? (s.offen ? ganz(s.offen) || 1 : 0) : ganz(u.aenderungen), zul = !s && u.zuletzt && u.zuletzt.zeit ? tag(u.zuletzt.zeit) : '';
    if (!s && Array.isArray(u.bereiche) && u.bereiche.length) zahl('bereiche', u.bereiche.length);
    if (!s && ganz(u.seiten)) zahl('seiten', ganz(u.seiten));
    setze('bureau-kurz', a ? '<b>' + a + ' in the draft</b>' : (zul ? 'Published ' + esc(zul) : 'All published'));
    setze('bureau', (a ? '<b>' + plural(a, 'change', 'changes') + ' in the draft.</b> ' : 'Nothing open in the draft. ') + (zul ? 'Last published on ' + esc(zul) + '.' : ''));
  }).catch(function () { setze('bureau-kurz', 'Texts, photos, opening hours'); setze('bureau', 'The status cannot be read right now.'); });

  
  if (ohne('carte')) bauen('carte');
  else hole('carte').then(function (d) {
    var s = stamm(d);
    if (s) { var o = ganz(s.offen); setze('carte-kurz', o || s.offen === true ? '<b>A draft is waiting</b>' : 'All menus published'); return; }
    var k = Array.isArray(d.karten) ? d.karten : null; if (!k) throw new Error('ohne Karten');
    var e = k.filter(function (x) { return x && x.entwurf; }).length;
    zahl('karten', k.length); zahl('entwurf', e);
    
    $$('[data-karte]').forEach(function (el) {
      var x = k.filter(function (y) { return y && y.name === el.getAttribute('data-karte'); })[0]; if (!x) return;
      var st = x.entwurf ? 'Draft' : (x.live || x.pdf_zeit) ? 'Published' : 'Not published yet', ck = el.querySelector('svg'), t = el.querySelector('span');
      if (t) t.textContent = st; if (ck) ck.style.display = st === 'Published' ? '' : 'none'; el.hidden = false;
    });
    
    var p = k.filter(function (x) { return x && (x.live || x.pdf_zeit); }).length, vm = k.length === 1 ? '1 menu' : k.length + ' menus';
    if (!e && p < k.length) { setze('carte-kurz', p ? p + ' of ' + vm + ' published' : vm + ', not published yet'); return; }
    setze('carte-kurz', e ?'<b>' + e + ' in the draft</b>' : (k.length === 1 ? '1 menu, published' : k.length + ' menus, all published'));
  }).catch(function () { setze('carte-kurz', 'Food and drinks with prices'); });

  
  if (ohne('imprimerie')) bauen('imprimerie', 'imprimerie');
  else hole('imprimerie').then(function (l) {
    var liste = Array.isArray(l) ? l : Array.isArray(l.vorlagen) ? l.vorlagen : null; if (!liste || !liste.length) throw new Error('leer');
    var z = 0, arten = {}; liste.forEach(function (x) { z += ganz(x && x.zahl) || 1; var g = x && (x.gruppe || x.art); if (g) arten[String(g)] = 1; });
    var a = Object.keys(arten).length;
    var t = plural(z, 'template', 'templates') + (a ? ' in ' + plural(a, 'kind', 'kinds') : '');
    setze('imprimerie-kurz', t); setze('imprimerie', t + '.');
  }).catch(function () { setze('imprimerie-kurz', 'Templates, ready to print'); setze('imprimerie', '&nbsp;'); });

  
  if (ohne('reception')) bauen('reception', 'reception');
  else hole('reception').then(function (r) {
    var u = {}; ['anfragen_neu', 'anfragen_offen', 'ohne_antwort', 'fragen_gesamt'].forEach(function (k) { u[k] = ganz(r[k]); });
    var t = [];
    if (u.anfragen_neu) t.push('<b>' + plural(u.anfragen_neu, 'new inquiry', 'new inquiries') + '</b>');
    else if (u.anfragen_offen) t.push(plural(u.anfragen_offen, 'inquiry open', 'inquiries open'));
    
    var k2 = t.slice();
    if (u.ohne_antwort) { t.push('<b>' + plural(u.ohne_antwort, 'question without answer', 'questions without answer') + '</b>'); k2.push('<b>' + plural(u.ohne_antwort, 'open question', 'open questions') + '</b>'); }
    setze('reception-kurz', k2.length ? k2.join(PKT) : 'Nothing open');
    var gw = u.anfragen_neu || u.anfragen_offen;
    dtitel('d-anf', gw, wort(gw) + (gw === 1 ? ' guest waits' : ' guests wait') + ' for a reply');
    dtitel('d-fragen', u.ohne_antwort, wort(u.ohne_antwort) + (u.ohne_antwort === 1 ? ' question' : ' questions') + ' the chat could not answer');
    dmarke('d-reception-n', gw); dmarke('d-fragen-n', u.ohne_antwort);
    
    var wf = [].concat(WEGE.reception || []).filter(Boolean)[0];
    if (wf && (gw || u.ohne_antwort)) fetch(wf.replace(/api\/ueberblick.*$/, 'api/fragen'), { cache: 'no-store', credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) {
        var f = (d && d.fragen || []).filter(function (x) { return x && !x.erledigt && !x.belegt; }), an = f.filter(function (x) { return x.anfrage; });
        var bsp = function (l) { return l.length > 0 && l.every(function (x) { return x.beispiel; }); };
        [['d-anf', gw && bsp(an)], ['d-fragen', u.ohne_antwort && bsp(f)]].forEach(function (p) {
          $$('[data-stand="' + p[0] + '"]').forEach(function (el) {
            var k = el.closest('.dx-q18k'); if (!k || !p[1] || k.querySelector('.dx-nqbsp')) return;
            var m = document.createElement('span'); m.className = 'dx-lx-bsp dx-nqbsp'; m.textContent = 'Example'; k.appendChild(m);
          });
        });
      }).catch(function () {});
    setze('reception', t.length ? t.join(PKT) : 'Nothing open' + PKT + plural(u.fragen_gesamt, 'question', 'questions') + ' so far');
  }).catch(function () { setze('reception-kurz', 'Chat on the website'); setze('reception', '&nbsp;'); });

  
  if (ohne('livre')) bauen('livre', 'livre');
  else hole('livre').then(function (d) {
    var s = d.stand || {}, f = ganz(s.fotos), da = ganz(s.dateien);
    if (!f && !da) throw new Error('leer');
    setze('livre-kurz', plural(f, 'photo', 'photos') + PKT + plural(da, 'file', 'files'));
    setze('livre', plural(f, 'photo', 'photos') + ' in ready sizes. ' + plural(da, 'file', 'files') + ' for printers and designers.');
  }).catch(function () { setze('livre-kurz', 'Logo, colours, fonts, photos'); setze('livre', '&nbsp;'); });

  
  ['markenbuch-editor', 'sticker'].forEach(function (k) {
    if (ohne(k)) { bauen(k, k); return; }
    hole(k).then(function (d) {
      var z = d.offen === true ? 1 : ganz(d.offen) || ganz(d.wartet) || ganz(typeof d.entwurf === 'number' ? d.entwurf : 0);
      var st = d.live && Array.isArray(d.live.sticker) ? d.live.sticker.length : 0, f = ganz(d.farben), sc = ganz(d.schriften), fo = ganz(d.fotos);
      if (k === 'sticker') {
        dtitel('d-sticker', z, 'A sticker draft is waiting'); dmarke('d-sticker-n', z ? 1 : 0);
        setze(k + '-kurz', z ? '<b>A draft is waiting</b>' : st ? plural(st, 'sticker', 'stickers') + PKT + 'all saved' : 'All saved');
        setze(k, (z ? '<b>A draft is waiting.</b> ' : 'Nothing open in the draft. ') + (st ? plural(st, 'sticker', 'stickers') + ' published.' : ''));
        return;
      }
      setze(k + '-kurz', z ? '<b>' + z + ' in the draft</b>' : f || fo ? plural(f, 'colour', 'colours') + PKT + plural(fo, 'photo', 'photos') : 'All saved');
      setze(k, (z ? '<b>' + plural(z, 'change', 'changes') + ' in the draft.</b> ' : 'Nothing open in the draft. ') + (f || sc || fo ? plural(f, 'colour', 'colours') + ', ' + plural(sc, 'font', 'fonts') + ', ' + plural(fo, 'photo', 'photos') + '.' : ''));
    }).catch(function () { setze(k + '-kurz', k === 'sticker' ? 'Stickers with the logo' : 'Keeping the brand book up to date'); setze(k, '&nbsp;'); });
  });

  
  var regLeer = function (kurz, satz) { setze('registre-kurz', kurz); setze('besuche', satz); setze('registre-heute', '–'); setze('registre-seiten', '–');
    $$('[data-wg$="-satz"]').forEach(function (el) { if (el.getAttribute('data-wg') !== 'besuche-satz') el.textContent = 'Nothing counted yet'; }); };
  if (ohne('registre')) regLeer(da('registre') ? esc((DA.rolle || {}).registre || '') : 'In progress', '&nbsp;');
  else hole('registre').then(function (m) {
    try { window.DX_REG = m; document.dispatchEvent(new CustomEvent('dx-reg', { detail: m })); } catch (e) {}
    if (m.beispiel) { regLeer('No visits counted yet', 'No visits counted yet.'); return; }   
    var u = m.summe || {}, bs = ganz(u.besuche), jt = Array.isArray(m.je_tag) && m.je_tag.length ? m.je_tag[m.je_tag.length - 1] : null;
    var heute = jt && isFinite(Number(jt.besuche)) ? Number(jt.besuche) : (isFinite(Number(u.heute)) ? Number(u.heute) : null);
    var sh = jt && isFinite(Number(jt.seiten)) ? Number(jt.seiten) : null;
    setze('registre-heute', heute == null ? '–' : n(heute));
    var hw = document.querySelector('[data-wort="besuche"]'); if (hw) hw.textContent = heute === 1 ? 'visit' : 'visits';   
    setze('registre-seiten', sh == null ? '–' : n(sh));
    setze('registre-kurz', m.leer || !bs ? 'No visits counted yet' : plural(bs, 'visit', 'visits') + ' in ' + n(ganz(m.tage)) + ' days');
    zahl('reg-besuche', bs ? n(bs) : '–'); zahl('reg-seiten', ganz(u.seiten) ? n(u.seiten) : '–'); zahl('reg-laender', ganz(u.laender) ? n(u.laender) : '–');
    
    var mn = (m.seiten || []).filter(function (x) { return x && x.s === 'menu.html'; })[0], fen = Math.min(bs, ganz(mn && mn.n)), wei = Math.min(fen, ganz(u.buchung));
    var ant = function (t, g) { return g ? Math.round(100 * t / g) + ' % of these' : ''; };
    $$('[data-wg]').forEach(function (el) {
      var k = el.getAttribute('data-wg');
      if (k === 'besuche') el.textContent = bs ? n(bs) : '–';
      if (k === 'fenster') el.textContent = fen ? n(fen) : '–';
      if (k === 'weiter') el.textContent = wei ? n(wei) : '–';
      if (k === 'besuche-satz') el.textContent = 'on the website, in ' + n(ganz(m.tage) || 30) + ' days';
      if (k === 'fenster-satz') el.textContent = fen ? ant(fen, bs) : 'Nothing counted yet';
      if (k === 'weiter-satz') el.textContent = wei ? ant(wei, fen) : 'Nothing counted yet';
    });
    setze('besuche', m.leer ? 'No visits counted yet.' : 'last ' + n(ganz(m.tage)) + ' days');
  }).catch(function () { regLeer('Visits without names', 'The count cannot be read right now.'); });

  window.MAISON_BEREIT = true;   
})();
