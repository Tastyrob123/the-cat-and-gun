/* Style guide · The Cat & Gun · Inhalt aus dem Markenfundus (veröffentlichter Stand, fundus.js), gesetzt in die Klassen des Markenbuchs der Vorlage
   (Culinarium Hannover buch.html, buch/marke.css, Fehlerbuch 10a 13.11.2026: gleiche Klassen). Jeder Satz und jeder Wert kommt aus dem Fundus
   (Farben mit Notiz, Schriften mit Rolle, Zeichen, Sticker, Fotos mit Titel, Sätze des Hauses); hier stehen nur die Kapiteltitel und Beschriftungen.
   Danach lädt buch/marke.js (Auftritte, Kopieren) wie in der Vorlage. Ändert sich der Fundus, baut die Seite neu (Fundus.beiAenderung). */
/* Datum wie in der Vorlage («Oktober 2026»): Monat und Jahr, englisch */
function monat(d) { const m = /^(\d{4})-(\d{2})/.exec(d || ''); return m ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][+m[2] - 1] + ' ' + m[1] : ''; }
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var kw = function (s) { return '<span class="kw">' + esc(String(s).toUpperCase()) + '</span>'; };
  var PU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v9M3.8 7 8 11.2 12.2 7M3 14h10"/></svg>';
  var PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
  var D, SVG = {};
  /* Schrift auf der Farbe: die der beiden Hausfarben (#1d1915, #fbf8f3), die den grösseren Kontrast gibt (WCAG). Bei Rot und Holz war Weiss zu schwach (Prüfung 23.11.2026) */
  var lum = function (h) { return [1, 3, 5].map(function (i) { var x = parseInt(h.slice(i, i + 2), 16) / 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }).reduce(function (a, x, i) { return a + x * [.2126, .7152, .0722][i]; }, 0); };
  var hell = function (h) { var L = lum(h); return (L + .05) / (lum('#1d1915') + .05) > (lum('#fbf8f3') + .05) / (L + .05); };
  var rgb = function (h) { return [1, 3, 5].map(function (i) { return parseInt(h.slice(i, i + 2), 16); }); };
  var foto = function (id) { return D.fotos.filter(function (f) { return f.id === id; })[0] || null; };
  var text = function (id) { var t = D.texte.filter(function (x) { return x.id === id; })[0]; return t ? t.text : ''; };
  var titel2 = function (a, b) { return '<h2 class="mk__t"><span class="z"><span>' + esc(a) + '</span></span><span class="z"><span><em>' + esc(b) + '</em></span></span></h2>'; };
  var kopf = function (kap, a, b, lead) { return '<header class="mk" data-r="kopf"><div><p class="mk__kap"><b>' + kw(kap) + '</b><i></i></p>' + titel2(a, b) + '</div>' + (lead ? '<p class="mk__lead">' + esc(lead) + '</p>' : '') + '</header>'; };
  var svgOhneMass = function (s) { return String(s).replace(/<svg([^>]*?)\swidth="[^"]*"/, '<svg$1').replace(/<svg([^>]*?)\sheight="[^"]*"/, '<svg$1').replace('<svg', '<svg aria-hidden="true" focusable="false"'); };
  var KAP = [['haus', 'The house'], ['zeichen', 'Wordmark'], ['farben', 'Colours'], ['schrift', 'Fonts'], ['sticker', 'Stickers'], ['bilder', 'Photos'], ['saetze', 'Lines'], ['mitnehmen', 'Files']];

  function zeichen(id, farbe) {
    var e = D.elemente.filter(function (x) { return x.id === id; })[0]; if (!e) return Promise.resolve('');
    var teile = {}; if (farbe) (e.teile || []).forEach(function (p) { teile[p.id] = farbe; });
    return Fundus.element(id, { teile: teile }).then(svgOhneMass, function () { return ''; });
  }
  function vorbereiten() {
    var w = Fundus.wert('weiss') || '#ffffff', s = Fundus.wert('schwarz') || '#141210';
    var jobs = [['wm-w', 'wortmarke', w], ['wm-s', 'wortmarke', s], ['et-g', 'et', '#c99d70'], ['et-s', 'et', s], ['wm-g', 'wortmarke', '#c99d70']]
      .map(function (j) { return zeichen(j[1], j[2]).then(function (x) { SVG[j[0]] = x; }); });
    D.elemente.filter(function (e) { return e.art === 'sticker'; }).forEach(function (e) { jobs.push(zeichen(e.id).then(function (x) { SVG['st-' + e.id] = x; })); });
    return Promise.all(jobs);
  }

  function titel() {
    var ort = text('ort'), zeit = text('zeiten');
    return '<section class="titel tapete" id="oben"><div class="titel__in">' +
      '<p class="titel__kap" data-r="hero" style="--i:0"><i></i><b>' + kw('Style guide' + (monat(D.gebaut) ? ' · ' + monat(D.gebaut) : '')) + '</b><i></i></p>' +
      '<h1 class="titel__w" data-r="maske"><span class="z"><span class="bu-wm">' + SVG['wm-w'] + '</span></span><span class="vh">The Cat &amp; Gun</span></h1>' +
      '<p class="titel__ort" data-r="hero" style="--i:2">' + [ort, zeit].filter(Boolean).map(kw).join(' <span class="raute"></span> ') + '</p>' +
      '<p class="titel__lead" data-r="hero" style="--i:3">Everything that makes The Cat &amp; Gun recognisable, in one place: the wordmark, the colours, the fonts, the stickers, the photos and the lines of the house. Every page shows the brand book as it is published.</p>' +
      '<div class="knr knr--mitte" data-r="hero" style="--i:4"><a class="kn " href="#haus">' + kw('Read') + '<i>' + PU + '</i></a></div></div>' +
      '<nav class="index" aria-label="Contents" data-g>' + KAP.map(function (k, i) { return '<a href="#' + k[0] + '" data-r style="--i:' + i + '"><span>' + esc(k[1]) + '</span></a>'; }).join('') + '</nav></section>';
  }
  function haus() {
    var karten = [['b23', 'satz-4-1'], ['b09', 'satz-11'], ['b36', 'satz-8-1']].map(function (k, i) {
      var f = foto(k[0]), t = text(k[1]); if (!f || !t) return '';
      return '<article class="k3 k3--karte" data-r="feder" style="--i:' + i + '"><div class="k3__b"><img src="' + esc(Fundus.adresse(f.gross)) + '" alt="' + esc(f.titel) + '" decoding="async"></div>' +
        '<div class="k3__n"><small>' + kw(f.titel || '') + '</small><b>' + esc(t) + '</b></div></article>';
    }).join('');
    var bio = text('satz-1').split(' '), a = bio.slice(0, -1).join(' '), b = bio.slice(-1).join(' ') + '.';
    return '<section class="ab blatt papier tapete-h" id="haus"><div class="in">' + kopf('The house', a, b, [text('satz-2'), text('satz-3-2')].filter(Boolean).join(' ')) +
      '<div class="drei" data-g>' + karten + '</div></div></section>';
  }
  /* Zeichen als Bild (Prüfung 23.11.2026, A2): ein <img> zeigt nur die viewBox. */
  function alsBild(svg) {
    if (!svg) return '';
    var m = svg.match(/viewBox="([\d.\s-]+)"/), vb = m ? m[1].trim().split(/\s+/) : ['0', '0', '1000', '1000'];
    var s = svg.replace('<svg', '<svg width="' + vb[2] + '" height="' + vb[3] + '"');
    if (!/xmlns=/.test(s.slice(0, 400))) s = s.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    return '<img src="' + URL.createObjectURL(new Blob([s], { type: 'image/svg+xml' })) + '" width="' + vb[2] + '" height="' + vb[3] + '" alt="" data-fundus>';
  }
  function zeichenBlatt() {
    var e = function (id) { return D.elemente.filter(function (x) { return x.id === id; })[0] || {}; };
    var st = e('sticker-wortmarke');
    return '<section class="ab blatt creme tapete-h" id="zeichen"><div class="in">' + kopf('Wordmark and sign', 'One wordmark,', 'never redrawn.', e('wortmarke').satz || '') +
      '<div class="lockups" data-g>' +
      '<figure class="lock lock--marine tapete" data-r="flug" style="--i:0;--fx:-14vw;--fy:22vh;--fw:-6deg"><div>' + SVG['wm-w'] + '</div><figcaption class="kerbe">' + kw('White on dark') + '</figcaption></figure>' +
      '<figure class="lock lock--hell" data-r="flug" style="--i:1;--fx:0;--fy:30vh;--fw:4deg"><div>' + SVG['wm-s'] + '</div><figcaption class="kerbe">' + kw('Black on light') + '</figcaption></figure>' +
      '<figure class="lock lock--marine tapete" data-r="flug" style="--i:2;--fx:12vw;--fy:30vh;--fw:-5deg"><div class="bu-et">' + SVG['et-g'] + '</div><figcaption class="kerbe">' + kw('The ampersand') + '</figcaption></figure></div>' +
      '<div class="reihe5" data-g>' +
      '<div class="zei" data-r="feder" style="--i:0"><span class="bu-zei">' + alsBild(SVG['et-s']) + '</span><b>' + esc(e('et').name || 'Ampersand') + '</b><small>' + esc(e('et').satz || '') + '</small></div>' +
      '<div class="zei" data-r="feder" style="--i:1"><span class="bu-zei">' + alsBild(SVG['st-sticker-wortmarke']) + '</span><b>' + esc(st.name || '') + '</b><small>' + esc(st.satz || '') + '</small></div></div></div></section>';
  }
  function farben() {
    var druck = D.welten.filter(function (w) { return w.id === 'druck'; })[0] || D.welten[0];
    var fz = function (id) { return D.farben.filter(function (f) { return f.id === id; })[0]; };
    var n = D.welten[0] ? druck.farben.length : 0;
    var faecher = '<div class="faecher" data-r="faecher"><div class="faecher__in">' + druck.farben.map(fz).filter(Boolean).map(function (f, j) {
      var w = ((j - (n - 1) / 2) * 4.2).toFixed(1);
      return '<button class="fa" type="button" data-hex="' + esc(f.wert.toUpperCase()) + '" style="--c:' + esc(f.wert) + ';--t:' + (hell(f.wert) ? '#1d1915' : '#fbf8f3') + ';--j:' + j + ';--w:' + w + 'deg" aria-label="' + esc(f.name) + ' ' + esc(f.wert.toUpperCase()) + ' copy">' +
        '<span class="fa__n"><b>' + esc(f.name) + '</b><small>' + esc(f.wert.toUpperCase()) + '</small></span><span class="fa__ok">copied</span></button>';
    }).join('') + '</div></div>';
    var gruppen = D.welten.map(function (w) {
      var fs = w.farben.map(fz).filter(Boolean);
      return '<div class="gr" data-g><div class="gr__k" data-r style="--i:0"><p class="mk__kap"><b>' + kw(w.name) + '</b><i></i></p><p class="gr__s">' + esc(w.satz || '') + '</p></div>' +
        '<div class="gr__l gr__l--4 bu-voll" style="--sp:' + spalten(fs.length) + '">' + fs.map(function (f, i) {
          var c = rgb(f.wert);
          return '<button class="fk" type="button" data-r="feder" data-hex="' + esc(f.wert.toUpperCase()) + '" style="--i:' + (i % 4) + ';--c:' + esc(f.wert) + ';--t:' + (hell(f.wert) ? '#1d1915' : '#fbf8f3') + '" aria-label="' + esc(f.name) + ' ' + esc(f.wert.toUpperCase()) + ' copy">' +
            '<span class="fk__f"><span class="fk__hex">' + esc(f.wert.toUpperCase()) + '</span><span class="fk__ok">copied</span></span><span class="fk__n">' + esc(f.name) + '</span><span class="fk__r">' + esc(f.notiz || '') + '</span>' +
            '<span class="fk__w"><span>HEX</span>' + esc(f.wert.toUpperCase()) + '<span>RGB</span><span class="wo">' + c.join(' · ') + '</span></span></button>';
        }).join('') + '</div></div>';
    }).join('');
    return '<section class="ab blatt papier" id="farben"><div class="in">' + kopf('Colours', D.farben.length + ' colours,', 'each with its source.', 'Three palettes: the print pieces, the six Super Juices and the website. A click copies the value.') + faecher + gruppen + '</div></section>';
  }
  function schrift() {
    var rollen = function (s) { return D.rollen.filter(function (r) { return r.schrift === s.id; }).map(function (r) { return r.name; }).join(' · '); };
    return '<section class="ab blatt papier" id="schrift"><div class="in">' + kopf('Fonts', D.schriften.length + ' fonts,', 'one job each.', 'The fonts of the website and the print pieces. Each one has its role.') +
      '<div class="schs">' + D.schriften.map(function (s, i) {
        var fam = "font-family:'" + String(s.familie || s.name).replace(/['"<>]/g, '') + "',serif";
        return '<article class="sch" data-g><div class="sch__k" data-r style="--i:0"><p class="mk__kap"><b>' + kw(rollen(s) || s.wo || '') + '</b><i></i></p><h3 class="sch__n" style="' + fam + '">' + esc(s.name) + '</h3>' +
          '<dl><dt>Weights</dt><dd>' + esc((s.erlaubt || s.schnitte || [400]).join(', ')) + '</dd><dt>Where</dt><dd>' + esc(s.wo || '') + '</dd></dl></div>' +
          '<div class="sch__aa" data-r="maske" aria-hidden="true" style="' + fam + '"><span class="z"><span>Aa</span></span></div>' +
          '<div class="sch__r" data-r style="--i:2"><p class="sch__satz" style="' + fam + '">' + esc(s.probe || s.name) + '</p><p class="sch__abc" style="' + fam + '">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789 · &amp; · 7AM–10PM</p></div></article>';
      }).join('') + '</div></div></section>';
  }
  function sticker() {
    var st = D.elemente.filter(function (e) { return e.art === 'sticker'; });
    return '<section class="ab blatt marine tapete" id="sticker"><div class="in">' + kopf('Stickers', 'The stickers', 'of the house.', st.length + ' stickers with the wordmark, the colours and the lines of the house. They are made in the ' + ((window.WO_HAUS && WO_HAUS.namen && WO_HAUS.namen.sticker) || 'Sticker editor') + '.') +
      '<div class="bu-sticker" data-g style="--sp:' + spalten(st.length) + '">' + st.map(function (e, i) {
        return '<figure class="zei bu-st" data-r="feder" style="--i:' + (i % 4) + '"><span class="bu-st__b">' + (SVG['st-' + e.id] || '') + '</span><b>' + esc(e.name) + '</b><small>' + esc(e.satz || '') + '</small></figure>';
      }).join('') + '</div></div></section>';
  }
  function bilder() {
    var ids = ['b24', 'b09', 'b13', 'b22', 'b19', 'b16', 'b35'];
    var fs = ids.map(foto).filter(Boolean);
    return '<section class="ab blatt papier" id="bilder"><div class="in">' + kopf('Photos', 'What a guest', 'sees here.', 'The photos of the house: the bar under the white arches, the pool table, the Super Juices, the garden and the team. All photos are in the Brand book under «Photos».') +
      '<div class="collage" data-g>' + fs.map(function (f, i) {
        return '<figure class="bi b' + (i + 1) + ' k3" data-r="feder" style="--i:' + (i % 3) + '"><div class="k3__b"><img src="' + esc(Fundus.adresse(f.gross)) + '" alt="' + esc(f.titel) + '" decoding="async"><figcaption class="kerbe">' + kw(f.titel || '') + '</figcaption></div></figure>';
      }).join('') + '</div></div></section>';
  }
  function saetze() {
    var l = D.texte.filter(function (t) { return /^satz-/.test(t.id) && t.id !== 'satz-1'; });   /* die Bio steht schon als Titel des Hauses */
    return '<section class="ab blatt creme tapete-h" id="saetze"><div class="in">' + kopf('Lines', 'Lines', 'of the house.', 'How the house speaks on Instagram and on the website. Short, friendly, in plain words.') +
      /* Robert 23.11.2026: «die Sätze nochmal irgendwie so in Kästen abheben». Jeder Satz eine Papierkarte wie die Zeichen-Karten, zwei Spalten, jede Karte schwebt einzeln herein */
      '<div class="satz3 bu-saetze">' + l.map(function (t, i) { return '<div class="bu-satz" data-r="feder" style="--i:' + (i % 2) + '"><h3>' + esc(t.text) + '</h3><p>' + esc(t.titel) + '</p></div>'; }).join('') + '</div></div></section>';
  }
  function mitnehmen() {
    var z = [['wm-s', 'Wordmark', 'SVG, black, for light grounds', 'the-cat-and-gun-wordmark-black.svg'], ['wm-w', 'Wordmark light', 'SVG, white, for dark grounds', 'the-cat-and-gun-wordmark-white.svg'],
      ['et-s', 'The ampersand', 'SVG, black', 'the-cat-and-gun-ampersand-black.svg']];
    var li = z.map(function (x, i) { return '<li data-r style="--i:' + i + '"><span><b>' + esc(x[1]) + '</b><small>' + esc(x[2]) + '</small></span><a class="kn " href="#" data-svg="' + x[0] + '" data-name="' + x[3] + '">' + kw('Get') + '<i>' + PU + '</i></a></li>'; }).join('') +
      '<li data-r style="--i:3"><span><b>Colours</b><small>all ' + D.farben.length + ' colours as a CSS file</small></span><a class="kn " href="#" data-css="1">' + kw('Get') + '<i>' + PU + '</i></a></li>' +
      '<li data-r style="--i:4"><span><b>Everything else</b><small>PNG, colour swatches, fonts, photos in ready sizes</small></span><a class="kn " href="./#dateien">' + kw('Open') + '<i>' + PF + '</i></a></li>';
    return '<section class="ab blatt marine tapete schluss" id="mitnehmen"><div class="in">' + kopf('Files', 'Everything for', 'the next piece.', 'The wordmark and the ampersand as vectors and the colours as a file. More in the Brand book under «Logo & files».') +
      '<ul class="laden" data-g>' + li + '</ul><div class="ende" data-r="ende"><p class="ende__w bu-ende">' + alsBild(SVG['wm-g']) + '</p>' +
      '<p class="ende__s">Style guide · The Cat &amp; Gun · ' + esc(text('ort')) + ' · as published in the brand book. Changes are made in the ' + esc((window.WO_HAUS && WO_HAUS.namen && WO_HAUS.namen.markeneditor) || 'Brand book editor') + '.</p></div></div></section>';
  }
  /* Spalten nach Menge (Fehlerbuch 10a 28.10.2026): vier oder drei je Reihe, je nachdem, wo die letzte Reihe voller ist */
  function spalten(n) { var b = 4, w = -1; [4, 3].forEach(function (c) { var r = n % c, v = r ? r / c : 2; if (v > w) { w = v; b = c; } }); return b; }
  /* Farbdatei wie im Brand book (livre.js farbDateien): Namen englisch aus Palette und Farbname, nicht aus den deutschen Kennungen (Robert 28.11.2026) */
  function farbCss() {
    var kurz = function (x) { return String(x).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }, frei = {}, z = [];
    D.welten.forEach(function (w) { (w.farben || []).forEach(function (id) { var f = D.farben.filter(function (x) { return x.id === id; })[0]; if (!f) return;
      var n = kurz(w.name) + '-' + kurz(f.name); while (frei[n]) n += '-2'; frei[n] = 1;
      z.push('  --cg-' + n + ': ' + String(f.wert).toLowerCase() + '; /* ' + String(f.name).replace(/\*\//g, '') + ' · ' + String(w.name).replace(/\*\//g, '') + ' */'); }); });
    return ':root{\n' + z.join('\n') + '\n}\n';
  }
  function laden(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }

  function bauen() {
    return vorbereiten().then(function () {
      var m = $('#bu-inhalt');
      m.innerHTML = titel() + haus() + zeichenBlatt() + farben() + schrift() + sticker() + bilder() + saetze() + mitnehmen();
      m.removeAttribute('aria-busy');
      $('#bu-kapitel').innerHTML = KAP.map(function (k) { return '<a href="#' + k[0] + '">' + kw(k[1]) + '</a>'; }).join('');
      [].forEach.call(m.querySelectorAll('[data-svg]'), function (a) { a.onclick = function (e) { e.preventDefault(); laden(new Blob([SVG[a.dataset.svg].replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"').replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"(\s+xmlns="http:\/\/www\.w3\.org\/2000\/svg")+/, 'xmlns="http://www.w3.org/2000/svg"')], { type: 'image/svg+xml' }), a.dataset.name); }; });
      [].forEach.call(m.querySelectorAll('[data-css]'), function (a) { a.onclick = function (e) { e.preventDefault(); laden(new Blob([farbCss()], { type: 'text/css' }), 'the-cat-and-gun-colours.css'); }; });
    });
  }
  function marke() { if (window.__marke) return; window.__marke = 1; var s = document.createElement('script'); s.src = 'buch/marke.js?v=' + (($('script[src*="inhalt.js"]') || {}).src || '').split('v=')[1]; document.body.appendChild(s); }
  function fehler(e) { $('#bu-inhalt').innerHTML = '<section class="ab papier"><div class="in"><h2 class="mk__t">The style guide cannot be shown.</h2><p class="mk__lead" style="opacity:1;transform:none">The brand book data could not be read (' + esc(e && e.message || e) + '). Please reload the page.</p></div></section>'; }
  if (!window.Fundus) return fehler('fundus.js');
  Fundus.laden().then(function (d) {
    D = d; Fundus.schriftenLaden();
    return bauen().then(function () { marke(); window.BUCH_BEREIT = true; if (location.hash) { var z = document.getElementById(location.hash.slice(1)); if (z) z.scrollIntoView(); } });
  }).then(function () {
    var neu = function (d) { if (d.kennung === D.kennung) return; D = d; bauen().then(function () { [].forEach.call(document.querySelectorAll('[data-r],[data-g]'), function (x) { x.classList.add('da'); }); }); };
    Fundus.beiAenderung(neu);
    /* Veröffentlichung im Brand book editor innert Sekunden (Prüfung 23.11.2026, A5): der Editor läuft auf einer anderen Adresse, sein Bescheid im Browser
       kommt hier nicht an. Alle 4 s nach der Kennung schauen, solange die Seite sichtbar ist, und sofort beim Zurückwechseln in dieses Fenster. */
    var laeuft = false, schau = function () {
      if (document.hidden || laeuft) return; laeuft = true;
      fetch(Fundus.basis + 'stand.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : r.text().then(function () { return null; }); })
        .then(function (d) { if (d && d.kennung && d.kennung !== D.kennung) return Fundus.laden().then(neu); }).catch(function () { /* Netz weg: alter Stand bleibt */ })
        .then(function () { laeuft = false; });
    };
    setInterval(schau, 4000);
    window.addEventListener('focus', schau); window.addEventListener('pageshow', schau); document.addEventListener('visibilitychange', schau);
  }, fehler);
})();
