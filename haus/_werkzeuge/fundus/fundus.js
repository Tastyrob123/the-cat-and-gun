/* fundus.js · Markenfundus The Cat & Gun · Lese-Schnittstelle für alle gestaltenden Werkzeuge (Sticker editor, Print & feed, Brand book).
   Einbinden:  <script src="/the-cat-and-gun/haus/_werkzeuge/fundus/fundus.js"></script>   dann   const d = await Fundus.laden();
   Beschreibung aller Felder und Wege: FORMAT.md im selben Ordner. Nur lesen: geschrieben wird der Fundus allein vom Brand book editor.

   Fundus.laden({ entwurf, alle })   Daten holen. Standard: der veröffentlichte Stand ohne ausgeblendete Stücke.
                                     entwurf: true → was im Brand book editor gespeichert, aber noch nicht veröffentlicht ist (Vorschau).
                                     alle: true → auch Ausgeblendetes (Feld aus: true).
   Fundus.farben({ welt })           Farben, wahlweise nur einer Farbwelt (Reihenfolge der Farbwelt)
   Fundus.farbe(id) / Fundus.wert(id)  eine Farbe / nur ihr HEX-Wert
   Fundus.welten() · Fundus.schriften() · Fundus.rolle('titel'|'lauf'|'zahl'|'druck') · Fundus.elemente({ art }) · Fundus.fotos() · Fundus.texte()
   Fundus.element(id, { teile: { <teil>: '#hex' } })   Promise<SVG-Text>, jede Farbe aus dem Fundus, einzelne Teile auf Wunsch anders
   Fundus.schriftCss() / Fundus.schriftenLaden()       @font-face aller Schriften (als Text / gleich ins Dokument)
   Fundus.adresse(pfad)              Weg einer Datei des Fundus (Fotos der Website bleiben, wie sie sind)
   Fundus.beiAenderung(fn)           fn(daten) nach jeder Veröffentlichung oder jedem Speichern im Editor; gibt eine Abmelde-Funktion zurück
   Ohne Abhängigkeiten, läuft in Chrome, Safari und Firefox. */
(function () {
  'use strict';
  var me = document.currentScript;
  var BASIS = (me && me.src) ? new URL('.', me.src).href : '/the-cat-and-gun/haus/_werkzeuge/fundus/';
  var KANAL = 'catgun-fundus';
  var cache = {}, letzte = null, hoerer = [], uhr = 0, bc = null;

  function holen(art) {
    var weg = art === 'entwurf' ? 'entwurf.json' : 'stand.json';
    return fetch(BASIS + weg, { cache: 'no-store' }).then(function (r) {
      if (r.ok) return r.json();
      if (art !== 'entwurf') return fetch(BASIS + 'fundus.json', { cache: 'no-store' }).then(function (r2) { if (!r2.ok) throw new Error('FUNDUS · ' + r2.status); return r2.json(); });
      return holen('stand');
    });
  }
  function sichtbar(d, alle) {
    if (alle) return d;
    var o = JSON.parse(JSON.stringify(d));
    ['farben', 'welten', 'schriften', 'elemente', 'fotos', 'texte'].forEach(function (k) { o[k] = (o[k] || []).filter(function (x) { return !x.aus; }); });
    var da = {}; o.farben.forEach(function (f) { da[f.id] = 1; });
    o.welten.forEach(function (w) { w.farben = (w.farben || []).filter(function (id) { return da[id]; }); });
    return o;
  }
  function laden(opt) {
    opt = opt || {};
    var art = opt.entwurf ? 'entwurf' : 'stand';
    return holen(art).then(function (d) {
      cache[art] = d; letzte = d;
      return sichtbar(d, opt.alle);
    });
  }
  function daten() { if (!letzte) throw new Error('FUNDUS · Erst Fundus.laden() aufrufen.'); return sichtbar(letzte, false); }
  function roh() { if (!letzte) throw new Error('FUNDUS · Erst Fundus.laden() aufrufen.'); return letzte; }

  function farben(opt) {
    var d = daten(), w = opt && opt.welt;
    if (!w) return d.farben;
    var welt = d.welten.find(function (x) { return x.id === w; });
    return welt ? welt.farben.map(function (id) { return d.farben.find(function (f) { return f.id === id; }); }).filter(Boolean) : [];
  }
  function farbe(id) { return roh().farben.find(function (f) { return f.id === id; }) || null; }
  function wert(id) { var f = farbe(id); return f ? f.wert : null; }
  function rolle(r) {
    var d = roh(), ro = (d.rollen || []).find(function (x) { return x.id === r; });
    return ro ? d.schriften.find(function (s) { return s.id === ro.schrift; }) || null : null;
  }
  function adresse(p) { return !p ? '' : /^(https?:|data:|blob:|\/)/.test(p) ? p : BASIS + p; }
  function css(s) { return String(s).replace(/[\\'"<>]/g, ''); }
  function schriftCss() {
    return roh().schriften.map(function (s) {
      var g = s.schnitte && s.schnitte.length ? (Math.min.apply(null, s.schnitte) + ' ' + Math.max.apply(null, s.schnitte)) : '400';
      return "@font-face{font-family:'" + css(s.familie || s.name) + "';src:url('" + css(adresse(s.datei)) + "');font-weight:" + g + ";font-style:normal;font-display:swap}";
    }).join('\n');
  }
  function schriftenLaden() {
    var st = document.getElementById('fundus-schriften');
    if (!st) { st = document.createElement('style'); st.id = 'fundus-schriften'; document.head.appendChild(st); }
    st.textContent = schriftCss();
  }

  /* Ein Element: SVG der Datei holen, jeden Teil mit der Farbe aus dem Fundus (oder dem eigenen Wert des Teils, oder dem Wunsch des Aufrufers) setzen,
     Schriften der Drucksachen gegen die gewählten Rollen tauschen (Titel im Druck, Lauftext) */
  var svgCache = {};
  function element(id, opt) {
    opt = opt || {};
    var d = roh(), e = d.elemente.find(function (x) { return x.id === id; });
    if (!e) return Promise.reject(new Error('FUNDUS · Element «' + id + '» gibt es nicht.'));
    var p = svgCache[e.datei] || (svgCache[e.datei] = fetch(adresse(e.datei), { cache: 'force-cache' }).then(function (r) { if (!r.ok) throw new Error('FUNDUS · ' + e.datei + ' ' + r.status); return r.text(); }));
    return p.then(function (svg) { return faerben(svg, e, opt.teile || {}); });
  }
  function teilWert(e, t, wunsch) {
    if (wunsch && wunsch[t.id]) return wunsch[t.id];
    if (t.wert) return t.wert;
    return wert(t.farbe) || '#000000';
  }
  function faerben(svg, e, wunsch) {
    var s = svg;
    (e.teile || []).forEach(function (t) {
      var w = String(teilWert(e, t, wunsch)).replace(/[^#0-9a-fA-F]/g, '');
      s = s.split('data-tf="' + t.id + '"').join('data-tf="' + t.id + '" data-neu-f="' + w + '"').split('data-ts="' + t.id + '"').join('data-ts="' + t.id + '" data-neu-s="' + w + '"');
    });
    s = s.replace(/fill="[^"]*"( data-tf="[^"]+") data-neu-f="([^"]+)"/g, 'fill="$2"$1').replace(/stroke="[^"]*"( data-ts="[^"]+") data-neu-s="([^"]+)"/g, 'stroke="$2"$1');
    var tdruck = rolle('druck'), tlauf = rolle('lauf');
    if (tdruck) s = s.split("font-family:'DM Serif Display'").join("font-family:'" + css(tdruck.familie || tdruck.name) + "'");
    if (tlauf) s = s.split("font-family:'Instrument Sans'").join("font-family:'" + css(tlauf.familie || tlauf.name) + "'");
    return s;
  }

  /* Neu laden bei Änderung: sofort im selben Browser (BroadcastChannel vom Editor), sonst alle 30 s nach der Kennung schauen */
  function melden(art) {
    laden({ entwurf: art === 'entwurf', alle: true }).then(function (d) { hoerer.forEach(function (h) { try { h.fn(h.alle ? d : sichtbar(d, false), art); } catch (x) { /* fremder Fehler */ } }); }, function () { /* Netz weg: alter Stand bleibt */ });
  }
  function beiAenderung(fn, opt) {
    var h = { fn: fn, alle: !!(opt && opt.alle) };
    hoerer.push(h);
    if (!bc && 'BroadcastChannel' in window) { try { bc = new BroadcastChannel(KANAL); bc.onmessage = function (ev) { melden(ev.data && ev.data.art); }; } catch (x) { bc = null; } }
    if (!uhr) uhr = setInterval(function () {
      if (document.hidden || !letzte) return;
      holen('stand').then(function (d) { if (d.kennung !== (cache.stand && cache.stand.kennung)) melden('stand'); }, function () { });
    }, 30000);
    return function () { hoerer = hoerer.filter(function (x) { return x !== h; }); };
  }
  /* Nur für den Brand book editor: nach Speichern/Veröffentlichen allen offenen Werkzeugen in diesem Browser Bescheid geben */
  function bescheid(art) { try { var k = new BroadcastChannel(KANAL); k.postMessage({ art: art || 'stand', zeit: Date.now() }); k.close(); } catch (x) { /* ohne Kanal: die anderen merken es nach spätestens 30 s */ } }

  window.Fundus = {
    basis: BASIS, laden: laden, farben: farben, farbe: farbe, wert: wert, welten: function () { return daten().welten; },
    schriften: function () { return daten().schriften; }, rolle: rolle, elemente: function (o) { var l = daten().elemente; return o && o.art ? l.filter(function (e) { return e.art === o.art; }) : l; },
    fotos: function () { return daten().fotos; }, texte: function () { return daten().texte; }, element: element, faerben: faerben,
    schriftCss: schriftCss, schriftenLaden: schriftenLaden, adresse: adresse, beiAenderung: beiAenderung, bescheid: bescheid
  };
})();
