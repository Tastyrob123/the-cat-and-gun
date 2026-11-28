/* Drucksachen-Studio · Start wie bei Canva (Robert 11.10.2026: «erst gefragt werden, was möchtest du erstellen»).
   Schritt 1: Was möchten Sie erstellen? (Arten mit lebendiger Vorschau im Hausstil, zuletzt bearbeitet)
   Schritt 2: Wie möchten Sie beginnen? Beschreiben (die KI entwirft) · eine Vorlage dieser Art · leeres Blatt. Format wählbar. */
(function () {
  const DS = window.DS;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PFEIL = '<i><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></i>';

  /* Arten, Gruppen und Beispielinhalte des Hauses: katalog.js (geschrieben von _bau/vorlagen.py, jeder Satz gegen die Quellen geprüft) */
  const KAT = window.DSKATALOG || {};
  const INHALT = KAT.INHALT || {};
  const ARTEN = (KAT.ARTEN || []).concat([{ key: 'frei', name: 'Blank page', satz: 'Design it yourself, in any size', format: 'a4h', formate: Object.keys(DS.FORMATE).filter(k => !DS.FORMATE[k].haus), vorlagen: [], leer: true }]);
  const GRUPPE = {}, GRUPPE_NAME = {};
  const IN_GRUPPE = new Set(Object.values(GRUPPE).flat());
  const ARTEN_SICHT = ARTEN.filter(a => !IN_GRUPPE.has(a.key));
  const mitGruppe = a => a;
  const zus = t => esc(t).replace(/ (\S+)$/, '\u00a0$1');   // K7 (Tor 2, 30.10.2026): nie ein Wort allein in der letzten Zeile
  const inhalt = (art, v) => (INHALT[art.key] && INHALT[art.key][v]) || DS.BEISPIEL[v];

  let wahl = null, fk = null;
  const st = () => window.DSStudio;

  /* «Daraus gestalten» (Robert 16.10.2026): Arten und Vorlagen mit dem gewählten Foto schon an jeder Bildstelle.
     Solange mitFoto gesetzt ist, setzt jede Seite, die hier entsteht (Vorschau, Galerie, Öffnen), das Foto in ihre Bildstellen;
     der Ausschnitt richtet sich nach der Bildstelle (zentriert, füllend). Gelöst mit ×, beim Öffnen einer Drucksache oder beim Wechsel der Ansicht. */
  let mitFoto = null;
  /* Abnahme 28.11.2026 (Übergabe aus dem Brand book): der dort gewählte Ausschnitt (x, y von 0 bis 1) gilt für dieses Foto, bis ein anderes gewählt wird */
  let mitAusschnitt = null;
  const ausschnitt = () => (mitAusschnitt && mitAusschnitt.foto === mitFoto ? mitAusschnitt : { fx: .5, fy: .5 });
  const fotoSchl = () => (mitFoto ? mitFoto + (mitAusschnitt && mitAusschnitt.foto === mitFoto ? '@' + mitAusschnitt.fx + ',' + mitAusschnitt.fy : '') : '');   // Schlüssel der Vorschau: anderer Ausschnitt, anderes Bild
  const setzeOhneFoto = DS.setze;
  DS.setze = function () {
    const s = setzeOhneFoto.apply(this, arguments);
    if (mitFoto && s && s.el) s.el.forEach(el => {
      if (el.typ !== 'bild') return;
      const a = ausschnitt(); el.bild = mitFoto; el.fx = a.fx; el.fy = a.fy; el.zoom = 1;
      if (el.slot && s.quelle && s.quelle.inhalt) { const w = el.slot.split('.'); let o = s.quelle.inhalt; for (let i = 0; i < w.length - 1 && o; i++) o = o[w[i]]; if (o) o[w[w.length - 1]] = mitFoto; }
    });
    return s;
  };
  /* Mit Foto: die erste Vorlage der Art mit Bildstelle zeigen; hat keine eine, bleibt die Art aus der Auswahl */
  const artMitFoto = art => art.vorlagen.find(([v]) => hatFotoStelle({ inhalt: inhalt(art, v) }));
  const vorlageFuerVorschau = art => (mitFoto && artMitFoto(art)) || art.vorlagen[0];
  const hatFotoStelle = x => !!(x && x.inhalt && Object.values(x.inhalt).some(v => typeof v === 'string' && DS.M.bildIndex && DS.M.bildIndex[v]));
  function mitFotoKopf() {
    if (!mitFoto) return '';
    const b = DS.M.bilder.find(x => x.key === mitFoto) || { alt: mitFoto };
    return `<div class="mit-foto"><span class="mit-foto__bild" style="background-image:url('${DS.bildUrl(DS.M, mitFoto, true)}')"></span><div><small>With this photo</small><b>${esc(b.alt || '')}</b></div><button class="mit-foto__zu" data-st="ohneFoto" aria-label="Remove photo" title="Remove photo"><svg viewBox="0 0 24 24"><path d="M9 14.5 4 9.5l5-5M4 9.5h11a5 5 0 0 1 0 10h-3"/></svg></button></div>`;
  }
  function zeigeMitFotoKopf() {
    const alt = document.querySelector('#msNeu > .mit-foto'); if (alt) alt.remove();
    if (mitFoto) { const f = document.querySelector('#msNeu > .start__filter'); if (f) f.insertAdjacentHTML('beforebegin', mitFotoKopf()); }
  }

  function vorschau(fkey, vorlage, ton, inh, box) {   // fertiges Vorschaubild, sonst einmal live (vorschaubild.js, 29.10.)
    const live = () => { const f = DS.FORMATE[fkey], doc = { format: { b: f.b, h: f.h }, formatKey: fkey, seiten: [DS.setze(DS.M, fkey, vorlage, ton, inh)] }; return { el: st().miniBox(doc, 0, box), doc }; };
    return DS.VB ? DS.VB.blatt(fkey, { vorlage, ton, inhalt: inh, foto: fotoSchl() }, live) : live().el;
  }

  /* Ein Papierstück im Atelier: Grösse aus dem echten Format (gestaucht, damit A6 und A3 beide lesbar bleiben), frei stehend mit Schatten */
  const hoeheVon = (f, basis) => basis * Math.pow(f.h / 148, .6);
  /* Drei Blätter je Reihe am Rechner, zwei am Tablet, eins am Handy; das Blatt füllt seine Spalte (Robert 12.10.2026) */
  const spalten = () => innerWidth <= 640 ? 1 : innerWidth <= 1100 ? 2 : 3;
  function spalte(c) { const h = document.querySelector('#start .ms-haupt'), w = (h && h.clientWidth > 200 ? h.clientWidth : innerWidth - 300) - (innerWidth <= 640 ? 64 : 150), n = c || spalten(); return Math.max(c ? 70 : 150, (w - (n - 1) * 26) / n); }
  const GROSS = c => Math.min(300, spalte(c) * .74);          // Grundmass eines Blatts (A6 hoch = so hoch); c: Spalten des Rasters (feste Spaltenzahl nach Anzahl, reihen.js)
  const BREIT = c => spalte(c) * .9;                           // breiteste Stücke höchstens so breit
  function blatt(fkey, vorlage, ton, inh, basis, kl) {
    const f = DS.FORMATE[fkey], maxW = Math.min(basis * 1.18, BREIT());   // Robert 24.11.2026: breite Etiketten lagen übereinander; nie breiter als ihre Spalte (GROSS = Spalte × .74)
    let H = hoeheVon(f, basis), W = H * f.b / f.h;
    if (W > maxW) { W = maxW; H = W * f.h / f.b; }   // breite Formate (DL quer) nicht über die Nachbarn
    const box = Math.max(W, H) * (Math.max(f.b, f.h) + 2 * DS.B) / Math.max(f.b, f.h);
    const el = document.createElement('span'); el.className = 'papier ' + (kl || '') + (ton === 'hell' || ton === 'creme' ? ' papier--hell' : '');
    el.style.width = W + 'px'; el.style.height = H + 'px';
    if (vorlage) el.appendChild(vorschau(fkey, vorlage, ton, inh, box));
    return el;
  }
  /* Ein ganzes Handy: Rahmen, Seitentasten, Insel, Statusleiste, der Beitrag im Feed mit Profilzeile, Aktionen und Bildtext */
  const IC = {
    herz: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    sprech: '<svg viewBox="0 0 24 24"><path d="M20 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.1A8 8 0 1 1 20 11.5z"/></svg>',
    senden: '<svg viewBox="0 0 24 24"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/></svg>',
    merken: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
    mehr: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>',
  };
  function handy(fkey, v, t, inh, H) {
    const W = Math.round(H * .485), rand = Math.round(W * .045), sw = W - 2 * rand;
    const h = document.createElement('span'); h.className = 'handy handy--ganz'; h.setAttribute('aria-hidden', 'true');   /* Nachbesserung 23.11.2026: Handy-Miniatur ist Bild (Name der Art steht darunter), nicht Text */ h.style.width = W + 'px'; h.style.height = H + 'px'; h.style.setProperty('--rand', rand + 'px');
    const f = DS.FORMATE[fkey], ph = sw * f.h / f.b;
    const post = document.createElement('span'); post.className = 'papier papier--schirm'; post.style.width = sw + 'px'; post.style.height = ph + 'px';
    post.appendChild(vorschau(fkey, v, t, inh, sw * (Math.max(f.b, f.h) + 2 * DS.B) / f.b * (f.b >= f.h ? 1 : f.h / f.h)));
    const text = (((inh && (inh.text || inh.titel)) || '').match(/^[^.!?]*[.!?]?/) || [''])[0];   // im Handy nur der erste Satz, ganz (Tor 30.10.2026, K2)
    h.innerHTML = `<i class="handy__taste handy__taste--l1"></i><i class="handy__taste handy__taste--l2"></i><i class="handy__taste handy__taste--r"></i>
      <span class="handy__schirm">
        <span class="handy__status"><b>9:41</b><i class="handy__insel"></i><span class="handy__sym"><svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx=".8"/><rect x="5" y="5.5" width="3" height="6.5" rx=".8"/><rect x="10" y="3" width="3" height="9" rx=".8"/><rect x="15" y="0" width="3" height="12" rx=".8"/></svg><svg viewBox="0 0 16 12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0z"/><path d="M3.4 6.8a6.5 6.5 0 0 1 9.2 0l-1.5 1.5a4.4 4.4 0 0 0-6.2 0z"/><path d="M1.1 4.5a9.7 9.7 0 0 1 13.8 0l-1.5 1.5a7.6 7.6 0 0 0-10.8 0z"/></svg><svg viewBox="0 0 27 12"><rect x=".5" y=".5" width="23" height="11" rx="3" fill="none" stroke="currentColor" stroke-opacity=".4"/><rect x="2.2" y="2.2" width="17" height="7.6" rx="1.6"/><path d="M25 4v4a2 2 0 0 0 0-4z" fill-opacity=".45"/></svg></span></span>
        <span class="handy__kopf"><span class="handy__bild">${DS.zeichenSvg(DS.M, 'currentColor')}</span><span class="handy__wer"><b>${esc(DS.M.name)}</b><small>${esc(DS.M.ort)}</small></span><span class="handy__ic">${IC.mehr}</span></span>
        <span class="handy__post"></span>
        <span class="handy__aktionen"><span>${IC.herz}${IC.sprech}${IC.senden}</span>${IC.merken}</span>
        <span class="handy__text"><b>${esc(DS.M.name)}</b> ${esc(text)}</span>
        <i class="handy__strich"></i>
      </span>`;
    h.querySelector('.handy__post').appendChild(post);
    return h;
  }

  /* Das Stück einer Art: Vorderseite, je nach Art Rückseite, Umschlag, Deckblatt oder Handy */
  function stueck(art, fkey, basis, nr) {
    const b = document.createElement('button'); b.className = 'stueck'; b.style.setProperty('--i', nr);
    b.style.setProperty('--r', ([-1.6, 1.2, -.8, 1.8, -1.2, .9][nr % 6]) + 'deg');
    const f = DS.FORMATE[fkey];
    const buehne = document.createElement('span'); buehne.className = 'stueck__buehne';
    const satz = document.createElement('span'); satz.className = 'stueck__satz';
    if (art.leer) {
      const p = blatt('a5h', null, 'hell', null, basis, 'papier--neu'); p.innerHTML = '<span class="papier__neu"><img src="/the-cat-and-gun/haus/_werkzeuge/imprimerie/_ob/kleid/catgun-zeichen.svg" alt=""><b>Blank page</b><span class="papier__plus"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span></span>';
      satz.appendChild(p);
    } else if (fkey === 'insta') {
      const [v, t] = vorlageFuerVorschau(art);
      satz.appendChild(handy(fkey, v, t, inhalt(art, v), basis * 2.05));
    } else {
      const [v, t] = vorlageFuerVorschau(art);
      let hinten = null;
      if (art.rueck) hinten = blatt(fkey, art.rueck, art.rueck === 'rundliste' || art.rueck === 'karte' ? 'hell' : t, inhalt(art, art.rueck), basis);
      if (hinten) { hinten.classList.add('papier--hinten'); satz.appendChild(hinten); }
      const vorn = blatt(fkey, v, t, inhalt(art, v), basis, 'papier--vorn' + (art.key === 'aufsteller' ? ' papier--steht' : '') + (f.rund ? ' papier--rund' : ''));
      satz.appendChild(vorn);
    }
    buehne.appendChild(satz);
    b.appendChild(buehne);
    b.insertAdjacentHTML('beforeend', `<b class="stueck__name">${zus(art.name)}</b><em class="stueck__format">${art.leer ? 'Any size' : `${esc(f.name)} · ${f.rund ? 'Ø ' + f.b : f.b + ' × ' + f.h} mm`}</em><small class="stueck__satztext">${esc(art.satz)}</small>`);
    return b;
  }

  /* Jede Reihe so hoch wie ihr grösstes Stück: keine leere Wand über kleinen Karten */
  /* «Blank page» nur, wenn sie eine Reihe füllt (Fehlerbuch 10a, Prüfung 23.11.2026): 15 Arten gehen in drei Spalten auf, mit dem leeren Blatt 16 in zwei
     und vier. Sonst fehlt die Karte; ein leeres Blatt gibt es weiter am Anfang jeder Art und in jeder Grösse über «Size» im Editor. */
  function leeresBlatt(box) {
    const l = box.querySelector(':scope > .stueck[data-art="frei"]'); if (!box.offsetParent) return;
    const n = [...box.querySelectorAll(':scope > .stueck:not([data-art="frei"])')].filter(x => !x.hidden).length;
    const w = DS.spaltenWahl(n, spalten(), { leer: !!(l && l.dataset.leerOk === '1') });
    if (l) l.hidden = !w.leer;
    DS.spaltenSetzen(box, w.c);
  }
  function reihen(box) {
    if (box && box.id === 'arten') leeresBlatt(box);
    else if (box && box.isConnected && getComputedStyle(box).display.includes('grid')) {   // feste Spaltenzahl nach Anzahl (reihen.js DS.spaltenWahl), nie eine halb leere Reihe
      const k = [...box.children].filter(x => !x.hidden && getComputedStyle(x).display !== 'none');
      if (k.length) DS.spaltenSetzen(box, DS.spaltenWahl(k.length, spalten()).c);
    }
    const st = [...box.querySelectorAll(':scope > .stueck')].filter(x => x.offsetParent); if (!st.length) return;
    st.forEach(s => { s.querySelector('.stueck__buehne').style.height = ''; s.querySelector('.stueck__satz').style.removeProperty('--s'); });
    const zeilen = {};
    st.forEach(s => { const y = Math.round(s.offsetTop / 10); (zeilen[y] = zeilen[y] || []).push(s); });
    Object.values(zeilen).forEach(z => {
      /* Hochformate einer Reihe gleich hoch (Robert 29.10.2026: «Karten jeder Reihe auf einer Grundlinie und gleich gross»): ein A5 neben DL wird so hoch
         wie die DL-Karten, höchstens so breit wie 90 % der Spalte; Querformate bleiben */
      const vorn = s => s.querySelector('.stueck__satz > .papier--vorn'), hoch = s => { const v = vorn(s); return v && v.offsetHeight >= v.offsetWidth ? v : null; };
      const ziel = Math.max(0, ...z.map(s => hoch(s)?.offsetHeight || 0));
      z.forEach(s => { const v = hoch(s); if (v && ziel) s.querySelector('.stueck__satz').style.setProperty('--s', Math.min(ziel / v.offsetHeight, s.clientWidth * .9 / v.offsetWidth).toFixed(4)); });
      const h = Math.max(...z.map(s => { const sa = s.querySelector('.stueck__satz'); return sa.scrollHeight * (+sa.style.getPropertyValue('--s') || 1); }));
      z.forEach(s => s.querySelector('.stueck__buehne').style.height = Math.ceil(h + 36) + 'px');
      z.forEach((s, i) => s.classList.toggle('stueck--rand-l', i === 0) || s.classList.toggle('stueck--rand-r', i === z.length - 1));
      z[z.length - 1].classList.add('stueck--rand-r');
    });
  }
  let spaltenVorher = spalten();
  addEventListener('resize', () => { clearTimeout(window.__dsSp); window.__dsSp = setTimeout(() => {
    if (spalten() === spaltenVorher || document.getElementById('start').hidden) return; spaltenVorher = spalten();
    katalogGezeichnet = {};
    if (!document.getElementById('startWeg').hidden && wahl && document.getElementById('startVorlagen')) zeichneVorlagen();
    else if (document.getElementById('startWeg').hidden) { zeigeArten(); waehleAnsicht(ansicht); }
  }, 250); });
  let reihenUhr; addEventListener('resize', () => { clearTimeout(reihenUhr); reihenUhr = setTimeout(() => { const a = document.getElementById('arten'); if (a && !document.getElementById('start').hidden) { reihen(a); const v = document.getElementById('startVorlagen'); if (v) reihen(v); } }, 150); });

  /* Suchen und filtern im Atelier */
  const GRUPPEN = KAT.GRUPPEN || [['alle', 'All']];
  const IN = Object.assign({ frei: [] }, KAT.IN || {});
  const WORTE = Object.assign({ frei: 'blank empty page free own size' }, KAT.WORTE || {});
  let gruppe = 'alle';
  function zeichneGruppen() {
    $('#startGruppen').innerHTML = GRUPPEN.map(([k, t]) => `<button data-gruppe="${k}" class="${gruppe === k ? 'an' : ''}">${esc(t)}</button>`).join('');
    zeichneAlleKnopf();
  }
  /* Einstieg in die Galerie über alle Arten (12.10.2026), mit der Zahl aus vorlagen/index.json */
  function zeichneAlleKnopf() {
    const f = document.querySelector('#msNeu .start__filter'); if (!f) return;
    let z = $('#vbAlle');
    if (!z) {
      z = document.createElement('div'); z.id = 'vbAlle'; z.className = 'vb__alle'; f.parentNode.insertBefore(z, f);
      z.innerHTML = `<button class="kn kn--mehr" data-st="alle"><span>Search all templates of the house</span><i><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></i></button>`;
      fetch(DS.M.basis + 'vorlagen/index.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : []).then(ix => { const n = ix.reduce((m, x) => m + (x.zahl || 0), 0); if (n) z.querySelector('span').textContent = `Search all ${n.toLocaleString('en-GB')} templates of the house`; }).catch(() => { });
    }
  }
  /* Die Gesamtzahl der fertigen Vorlagen sichtbar machen (Robert 12.10.2026: «Ich müsste doch hier 3000 Vorlagen drin haben»): in der Leiste
     neben «Arten und Vorlagen» und als Verweis unter dem Eingabefeld der Übersicht. Zahl aus vorlagen/index.json, vorher steht die Zahl der Arten. */
  let IX = null;
  function zaehleVorlagen() {
    { const hz = document.getElementById('hsZahl'); if (hz) hz.textContent = Object.keys(HSD().index).length; }
    const em = document.querySelector('.ms-nav [data-ansicht="neu"] em') || document.querySelector('[data-ansicht="neu"] em'); if (em) em.textContent = ARTEN_SICHT.length;
    /* 15.10.2026 (Robert: «hakelig beim Ankommen»): Zahlen nur beim ersten Öffnen holen; vorher kam jedes Mal ein zweites Zeichnen der Kacheln nach */
    (IX ? Promise.resolve(IX) : fetch(DS.M.basis + 'vorlagen/index.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : [])).then(ix => {
      IX = ix;
      const n = ix.reduce((m, x) => m + (x.zahl || 0), 0); if (!n) return;
      const z = n.toLocaleString('en-GB');
      if (em) em.textContent = z;
      const k = $('#msAlle'); if (k) { k.querySelector('span').textContent = `See ${z} ready templates in ${new Set(ix.map(x => x.gruppe || x.art)).size} kinds`; k.hidden = false; }
    }).catch(() => { });
    ladeAnlaesse();
    if (false) fetch(DS.M.basis + 'vorlagen/zahlen.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(z => {
      if (!z || !z.abteilung) return; Z = z; zeichneWochen();
      if (ansicht === 'abteilungen') zeichneAbteilungen(); if (ansicht === 'events') zeichneEvents();
    }).catch(() => { });
  }
  function filtern() {
    const q = ($('#startSuche').value || '').trim().toLowerCase(), W = q.split(/\s+/).filter(Boolean);
    if (ansicht === 'fotos' || ansicht === 'livre') { $('#startNichts').hidden = filterFotos(q) > 0; return; }
    if (ansicht === 'stuecke') { $('#startNichts').hidden = true; zeichneStuecke(); return; }
    if (!['meine', 'neu'].includes(ansicht)) { $('#startNichts').hidden = true; return; }
    if (ansicht === 'meine') {
      const docs = st().alleDocs(); let m = 0;
      document.querySelectorAll('#bibliothek [data-doc]').forEach(k => { const d = docs[k.dataset.doc]; const t = (d.name + ' ' + (d.auftrag || '') + ' ' + (DS.FORMATE[d.formatKey]?.name || '')).toLowerCase(); const p = W.every(w => t.includes(w)); k.hidden = !p; if (p) m++; });
      const ml = mailsLesen();
      document.querySelectorAll('#bibliothek [data-mail]').forEach(k => { const x = ml.find(y => y.id === k.dataset.mail) || {}; const t = ((x.name || '') + ' e-mail newsletter mail ' + ((x.doc || {}).betreff || '')).toLowerCase(); const p = W.every(w => t.includes(w)); k.hidden = !p; if (p) m++; });
      $('#startNichts').hidden = !(W.length && !m);
      return;
    }
    let n = 0;
    document.querySelectorAll('#arten .stueck').forEach(s => {
      const a = ARTEN.find(x => x.key === s.dataset.art), text = (a.name + ' ' + a.satz + ' ' + WORTE[a.key]).toLowerCase();
      const passt = (a.leer && !mitFoto) || (!a.leer && !(mitFoto && s.dataset.ohneFoto) && (gruppe === 'alle' || IN[a.key].includes(gruppe)) && W.every(w => text.includes(w)));
      s.hidden = !passt; if (a.leer) s.dataset.leerOk = passt ? '1' : ''; if (passt && !a.leer) n++;
    });
    $('#startNichts').hidden = n > 0;
    leeresBlatt($('#arten'));
    requestAnimationFrame(() => reihen($('#arten')));
  }

  function zeigeArten() {
    wahl = null;
    $('#start .ms-haupt').scrollTo({ top: 0 });
    $('#startWeg').hidden = true; $('#startWahl').hidden = false;
    const box = $('#arten'); box.innerHTML = '';
    const g = GROSS(); ARTEN_SICHT.forEach((a, i) => { const s = stueck(mitGruppe(a), a.format, g, i); s.dataset.art = a.key; s.style.setProperty('--i', Math.min(i, 8)); box.appendChild(s); });   // Auftritt gestaffelt nur für die ersten neun (27 Arten seit 12.10.2026)
    if (mitFoto) box.querySelectorAll('.stueck').forEach(s => { const a = ARTEN.find(x => x.key === s.dataset.art); if (a && !a.leer && !artMitFoto(a)) s.dataset.ohneFoto = '1'; });
    zeigeMitFotoKopf();
    zeichneGruppen();
    beispieleAnlegen(); zeichneBibliothek(); zeichneWochen(); gruss(); zaehleVorlagen(); if ($('#fotoZahl')) $('#fotoZahl').textContent = fotoZahlen(DS.M.bilder || []).fotos; void (DS.M.bilder || []).length; zeichneFreigegeben();
    waehleAnsicht(ansicht);
  }

  /* ---------- Meine Drucksachen (Robert 12.10.2026: «wie in meiner Canva-Bibliothek alle Dokumente sehen, bearbeiten, speichern») ---------- */
  let ansicht = 'start';
  const vorZeit = t => { const m = Math.round((Date.now() - t) / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m} min ago`; const h = Math.round(m / 60); if (h < 24) return `${h} h ago`; return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }); };
  const IA = {
    umbenennen: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/></svg>',
    kopie: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
    pdf: '<svg viewBox="0 0 24 24"><path d="M12 4v11m-5-5 5 5 5-5"/><path d="M5 20h14"/></svg>',
    loeschen: '<svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/></svg>',
    freigeben: '<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="6"/><path d="m9.5 10 1.8 1.8 3.4-3.6M8.5 15 7 21l5-2.5 5 2.5-1.5-6"/></svg>',
  };
  /* Vorschau einer Drucksache, eingepasst in eine Fläche (Karten der Startseite) */
  function passDoc(doc, bw, bh, kl, seite = 0) {
    const f = doc.format, k = Math.min(bw / f.b, bh / f.h), W = f.b * k, H = f.h * k;
    const el = document.createElement('span'); el.className = 'papier ' + (kl || ''); el.style.width = W + 'px'; el.style.height = H + 'px';
    const live = () => ({ el: st().miniBox(doc, seite, Math.max(W, H) * (Math.max(f.b, f.h) + 2 * DS.B) / Math.max(f.b, f.h)), doc, i: seite });
    el.appendChild(DS.VB ? DS.VB.blatt(doc.formatKey, { seite: doc.seiten[seite] }, live) : live().el);   // Meine Medien: fertiges Bild, wenn das Blatt so schon einmal gezeigt wurde
    return el;
  }
  const PLUS = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';
  function karte(d, i) {
    const b = document.createElement('div'); b.className = 'mk'; b.dataset.doc = d.id; b.tabIndex = 0; b.setAttribute('role', 'button'); b.style.setProperty('--i', i);
    const k = document.createElement('span'); k.className = 'mk__k';
    const bu = document.createElement('span'); bu.className = 'mk__buehne';
    try { bu.appendChild(passDoc(d, 150, 146, 'papier--vorn', 0)); } catch (e) { }
    k.appendChild(bu);
    k.insertAdjacentHTML('beforeend', `<span class="mk__licht"></span><span class="doc__aktionen">${Object.entries({ umbenennen: 'Rename', kopie: 'Make a copy', pdf: 'Save PDF', loeschen: 'Delete' }).map(([x, t]) => `<button data-akt="${x}" title="${t}" aria-label="${t}">${IA[x]}</button>`).join('')}</span>`);
    b.appendChild(k);
    b.insertAdjacentHTML('beforeend', `<b class="mk__name" data-name>${esc(d.name)}</b><em class="mk__info">${esc(DS.FORMATE[d.formatKey]?.name || '')} · ${d.seiten.length} ${d.seiten.length === 1 ? 'page' : 'pages'} · ${vorZeit(d.geaendert)}</em>`);
    return b;
  }
  function neuKarte(i) {
    const n = document.createElement('button'); n.className = 'mk mk--neu'; n.dataset.akt = 'neu'; n.style.setProperty('--i', i);
    n.innerHTML = `<span class="mk__k"><span class="mk__plus">${PLUS}</span></span><b class="mk__name">New design</b><em class="mk__info">Pick a template</em>`;
    return n;
  }
  /* E-Mails aus dem Newsletter-Baukasten (mail.html, localStorage «ds-mails») stehen mit in Meine Medien (Robert 12.10.2026) */
  const mailsLesen = () => { try { return JSON.parse(localStorage.getItem('ds-mails') || '[]'); } catch (e) { return []; } };
  const mailsSchreiben = l => { try { localStorage.setItem('ds-mails', JSON.stringify(l)); } catch (e) { } };
  /* Meine Medien und Zuletzt bearbeitet: Blätter frei auf Blau wie alle Listen (Robert 12.10.2026, 04:10 «überall»), mit Umbenennen, Kopie, PDF, Löschen darunter */
  function medienStueck(attr, i, blaetter, H, name, info, aktionen) {
    const b = stueckKarte(attr, i, blaetter, H, name, info, null, 'stueck--doc');
    const d = document.createElement('div'); d.className = b.className; d.style.cssText = b.style.cssText; Object.assign(d.dataset, b.dataset); d.tabIndex = 0; d.setAttribute('role', 'button');
    while (b.firstChild) d.appendChild(b.firstChild);
    d.querySelector('.zl__name').setAttribute('data-name', '');
    if (aktionen) d.insertAdjacentHTML('beforeend', `<span class="doc__aktionen">${aktionen}</span>`);
    return d;
  }
  function mailKarte(m, i) {
    const d = m.doc || {}, t = (d.bloecke || []).find(x => x.typ === 'titel'), foto = (d.kopf || {}).foto, n = (d.bloecke || []).length;
    const el = document.createElement('span'); el.className = 'mkm';
    el.innerHTML = `<span class="mkm__kopf">${DS.zeichenSvg(DS.M, 'currentColor')}</span>${foto ? `<span class="mkm__bild" style="background-image:url('${DS.bildUrl(DS.M, foto, true)}')"></span>` : ''}<span class="mkm__text"><b>${esc((t && t.titel) || m.name || 'E-Mail')}</b><i></i><i></i><i></i><u></u></span>`;
    const ak = Object.entries({ umbenennen: 'Rename', kopie: 'Make a copy', loeschen: 'Delete' }).map(([x, tt]) => `<button data-makt="${x}" title="${tt}" aria-label="${tt}">${IA[x]}</button>`).join('');
    const k = GROSS() / 150; el.style.setProperty('--k', k.toFixed(3));
    return medienStueck({ mail: m.id }, i, [el], Math.round(176 * k), m.name || 'E-Mail', `E-Mail · ${n} ${n === 1 ? 'block' : 'blocks'} · ${vorZeit(m.geaendert)}`, ak);
  }
  function docStueck(d, i) {
    const g = GROSS(); let bl = [], H = g;
    try { const v = blattDoc(d, g, 'papier--vorn', 0); H = parseFloat(v.style.height) || g; bl = [d.seiten.length > 1 ? blattDoc(d, g, 'papier--hinten', 1) : null, v]; } catch (e) { }
    const ak = Object.entries({ freigeben: 'Release for areas', umbenennen: 'Rename', kopie: 'Make a copy', pdf: 'Save PDF', loeschen: 'Delete' }).map(([x, t]) => `<button data-akt="${x}" title="${t}" aria-label="${t}">${IA[x]}</button>`).join('');
    const fg = freigabe(d), k = medienStueck({ doc: d.id }, i, bl, H, d.name, fg ? `Released for ${fg.abteilungen.map(abtName).join(', ')}` : `${DS.FORMATE[d.formatKey]?.name || ''} · ${d.seiten.length} ${d.seiten.length === 1 ? 'page' : 'pages'} · ${vorZeit(d.geaendert)}`, ak);
    const bu = k.querySelector('.stueck__buehne');
    if (fg && bu) bu.insertAdjacentHTML('beforeend', `<span class="schild-frei" title="Released by ${esc(fg.wer)} on ${esc(fg.datum)} for ${esc(fg.abteilungen.map(abtName).join(', '))}">Released</span>`);
    if (fg && bu && SIEGEL_WORT) bu.insertAdjacentHTML('beforeend', `<span class="siegel" title="Released by ${esc(fg.wer)} on ${esc(fg.datum)}">${window.DSSiegel ? DSSiegel(DS.M.zeichen, { wort: SIEGEL_WORT, groesse: 78, seed: 7 + (d.id.length % 5) }) : ''}</span>`);
    return k;
  }
  /* ---------- Freigabe (Robert 16.10.2026: «freigegeben zur Verwendung für andere Abteilungen, damit man sieht, welche Vorlagen man im Notfall
     verwenden kann, wenn niemand zur Hand ist»). Die Freigabe steht im Dokument selbst (doc.freigabe = { abteilungen, wer, datum }) und wird
     mit ihm in diesem Browser gespeichert, wie alle Medien der Imprimerie. ---------- */
  const SIEGEL_WORT = null;   // Wachssiegel abgelehnt (16.10.2026); gewählt ist das Messingschild (Nr. 24 aus _qa/freigabe-30.html)
  const freigabe = d => d && d.freigabe && d.freigabe.abteilungen && d.freigabe.abteilungen.length ? d.freigabe : null;
  const abtName = k => ((K.ABTEILUNGEN.find(a => a.k === k) || {}).t || k);
  const docsLesen = () => { try { return JSON.parse(localStorage.getItem(`ds-${st().haus}-docs`) || '{}'); } catch (e) { return {}; } };
  const docsSchreiben = d => { try { localStorage.setItem(`ds-${st().haus}-docs`, JSON.stringify(d)); return true; } catch (e) { return false; } };
  async function freigabeDialog(id) {
    const S = st(), alle = docsLesen(), d = alle[id]; if (!d) return;
    const fg = d.freigabe || {}, wahl = new Set(fg.abteilungen || []);
    let wer = fg.wer && fg.wer !== 'Example' ? fg.wer : (localStorage.getItem('ds-freigabe-wer') || '');
    const p = S.dialog(`<h2>Release</h2><p>«${esc(d.name)}» may be used without asking by:</p>
      <div class="fg-wahl">${K.ABTEILUNGEN.map(a => `<button type="button" data-fgabt="${a.k}" class="${wahl.has(a.k) ? 'an' : ''}">${esc(a.t)}</button>`).join('')}</div>
      <label class="fg-wer">Released by<input id="fgWer" value="${esc(wer)}" placeholder="Name"></label>`,
      [{ t: 'Cancel', v: 'ab' }, ...(freigabe(d) ? [{ t: 'Take back the release', v: 'weg' }] : []), { t: 'Release', v: 'ok', haupt: true }]);
    const box = $('#dialogKarte');
    box.querySelectorAll('[data-fgabt]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.fgabt; wahl.has(k) ? wahl.delete(k) : wahl.add(k); b.classList.toggle('an', wahl.has(k)); }));
    const wf = box.querySelector('#fgWer'); wf.addEventListener('input', () => { wer = wf.value.trim(); });
    const v = await p;
    if (v === 'ab') return;
    const neu = docsLesen(), x = neu[id]; if (!x) return;
    if (v === 'weg' || !wahl.size) { delete x.freigabe; S.melde('Release taken back.'); }
    else {
      x.freigabe = { abteilungen: [...wahl], wer: wer || 'no name', datum: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) };
      try { if (wer) localStorage.setItem('ds-freigabe-wer', wer); } catch (e) { }
      S.melde('Released for ' + x.freigabe.abteilungen.map(abtName).join(', ') + '.');
    }
    docsSchreiben(neu); zeichneBibliothek(); zeichneFreigegeben(); waehleAnsicht(ansicht);
  }
  function zeichneFreigegeben() {
    const ic = document.querySelector('.ms-nav [data-ansicht="freigegeben"] svg:not(.schild-frei__ic)'); if (ic) ic.outerHTML = '<svg class="schild-frei__ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="7" width="20" height="10" rx="1.6"/><circle cx="5" cy="12" r=".9"/><circle cx="19" cy="12" r=".9"/></svg>';
    if (SIEGEL_WORT && ic && window.DSSiegel && DS.M.zeichen) ic.outerHTML = DSSiegel(DS.M.zeichen, { ohneWort: true, groesse: 20, seed: 5 });
    const box = $('#fgListe'); if (!box) return;
    const docs = sichtbareDocs().filter(freigabe).sort((a, b) => b.geaendert - a.geaendert);
    const z = $('#fgZahl'); if (z) z.textContent = docs.length;
    box.innerHTML = '';
    if (!docs.length) { box.innerHTML = '<div class="fg-leer"><p>Nothing released yet. In «My designs», point at a design, tap the seal and choose the areas.</p><div class="fg-bsp" aria-hidden="true"><span class="fg-bsp__blatt"><i></i><i></i><i></i></span><span><b>Example of a release</b><small>Table card · Desserts · released for Café and kitchen</small><em>Each named area prints it without asking.</em></span></div></div>'; return; }
    K.ABTEILUNGEN.forEach(a => {
      const l = docs.filter(d => d.freigabe.abteilungen.includes(a.k)); if (!l.length) return;
      const sek = document.createElement('section'); sek.className = 'fg-abt';
      sek.innerHTML = `<div class="fg-abt__kopf"><span class="fg-abt__foto" style="background-image:url('${DS.bildUrl(DS.M, a.foto, true)}')"></span><div><b>${esc(a.t)}</b><small>${l.length} ${l.length === 1 ? 'design' : 'designs'} ready to use</small></div></div>`;
      const r = document.createElement('div'); r.className = 'atelier wv ms-buehne kv-buehne'; l.forEach((d, i) => r.appendChild(docStueck(d, i))); sek.appendChild(r); box.appendChild(sek);
      requestAnimationFrame(() => reihen(r));
    });
  }
  /* Beispiele (Robert 16.10.2026: «6 Stück als Beispiel, damit man sieht, wie das aussieht»): mit «New design» sechs Karten, also fünf Drucksachen (wie die Vorlage; volle Reihen) aus echten Vorlagen des Hauses,
     gemischt in Art und Format, deutlich als Beispiel markiert. Sie stehen in «Zuletzt bearbeitet» und «Meine Medien», solange das Haus nichts Eigenes
     gespeichert hat; danach verschwinden sie aus den Listen. Einmal je Browser angelegt (Merker ds-<haus>-beispiele2). */
  const istBeispiel = d => !!(d && d.beispiel);
  const eigeneDocs = () => Object.values(st().alleDocs()).filter(d => !istBeispiel(d));
  const sichtbareDocs = () => { const alle = Object.values(st().alleDocs()); return alle.some(d => !istBeispiel(d)) ? alle.filter(d => !istBeispiel(d)) : alle; };
  function beispieleAnlegen() {
    const schl = `ds-${st().haus}-beispiele5`; try { if (localStorage.getItem(schl)) return; } catch (e) { return; }
    const abt = k => (K.ABTEILUNGEN.find(a => a.k === k) || { vorlagen: [] }).vorlagen, H = K.HINWEISE.find(x => /Opening hours/.test(x.n));
    const B = [
      { x: abt('pool').find(v => /^Poster · Pool table$/.test(v.n)) },   // Prüfung 4 Punkt 2: kein Markt ohne belegte Wiederkehr
      { x: abt('bar').find(v => /^Beer mat · Ten on draught$/.test(v.n)) },
      { x: abt('cafe').find(v => /^Table card · Desserts$/.test(v.n)), fg: ['cafe'] },
      { x: abt('saefte').find(v => /^Post · Super Juices$/.test(v.n)) },
      H && { x: H },
    ].filter(b => b && b.x);
    const alle = docsLesen(), heute = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    Object.keys(alle).forEach(k => { if (alle[k].beispiel && !freigabe(alle[k]) || (alle[k].beispiel && alle[k].freigabe && alle[k].freigabe.wer === 'Example')) delete alle[k]; });   // die drei vom Morgen
    B.forEach((b, i) => {
      const x = JSON.parse(JSON.stringify(b.x)); if (b.fill) b.fill(x);
      const d = kvDoc(x, b.kontext || ''); d.id = 'dbsp' + i + Date.now().toString(36); d.beispiel = true; d.geaendert = Date.now() - i * 60000;
      if (b.fg) d.freigabe = { abteilungen: b.fg.filter(k => K.ABTEILUNGEN.some(a => a.k === k)), wer: 'Example', datum: heute };
      alle[d.id] = d;
    });
    if (docsSchreiben(alle)) try { localStorage.setItem(schl, '1'); } catch (e) { }
  }
  function neuStueck() {
    const f = DS.FORMATE.a5h, [W, H] = groesse(f, GROSS());
    const p = document.createElement('span'); p.className = 'papier papier--vorn papier--neu'; p.style.width = W + 'px'; p.style.height = H + 'px';
    p.innerHTML = `<span class="papier__neu"><img src="/the-cat-and-gun/haus/_werkzeuge/imprimerie/_ob/kleid/catgun-zeichen.svg" alt=""><b>New design</b><span class="papier__plus">${PLUS}</span></span>`;
    return stueckKarte({ akt: 'neu' }, 0, [p], H, 'New design', 'Pick a template or a blank page', null);
  }
  async function mailAktion(akt, id, karte) {
    const S = st(), l = mailsLesen(), m = l.find(x => x.id === id); if (!m) return;
    if (akt === 'umbenennen') {
      const n = karte.querySelector('[data-name]');
      const f = document.createElement('input'); f.className = 'doc__umbenennen'; f.value = m.name || ''; n.replaceWith(f); f.focus(); f.select();
      let fertigT = false;
      const fertig = ok => { if (fertigT) return; fertigT = true; const v = f.value.trim(); if (ok && v) { m.name = v; if (m.doc) m.doc.name = v; m.geaendert = Date.now(); mailsSchreiben(l); } zeichneBibliothek(); filtern(); };
      f.addEventListener('keydown', e => { if (e.key === 'Enter') fertig(true); if (e.key === 'Escape') fertig(false); e.stopPropagation(); });
      f.addEventListener('blur', () => fertig(true)); f.addEventListener('click', e => e.stopPropagation());
    } else if (akt === 'kopie') {
      const k = JSON.parse(JSON.stringify(m)); k.id = 'm' + Date.now().toString(36); k.name = (m.name || 'E-mail') + ' (copy)'; if (k.doc) k.doc.name = k.name; k.geaendert = Date.now();
      l.unshift(k); mailsSchreiben(l); zeichneBibliothek(); filtern(); S.melde('Copy made.');
    } else if (akt === 'loeschen') {
      const ja = await S.dialog(`<h2>Delete?</h2><p>«${esc(m.name || 'E-mail')}» is removed.</p>`, [{ t: 'Keep', v: false }, { t: 'Delete', v: true, haupt: true }]);
      if (ja === true) { karte.classList.add('weg'); setTimeout(() => { mailsSchreiben(mailsLesen().filter(x => x.id !== id)); zeichneBibliothek(); waehleAnsicht(ansicht); }, 420); }
    }
  }
  function zeichneBibliothek() {
    const docs = sichtbareDocs().sort((a, b) => b.geaendert - a.geaendert), nurBeispiele = docs.length && docs.every(istBeispiel);
    const alle = docs.map(d => ({ t: d.geaendert, el: i => docStueck(d, i) })).concat(mailsLesen().map(m => ({ t: m.geaendert, el: i => mailKarte(m, i) }))).sort((a, b) => b.t - a.t);
    $('#meineZahl').textContent = alle.length;
    $('#meineSatz').textContent = nurBeispiele ? `${alle.length} examples from the templates of the house. As soon as you save something yourself, they make room.` : alle.length ? `${alle.length} ${alle.length === 1 ? 'design' : 'designs'}, saved in this browser` : 'No designs yet';
    const box = $('#bibliothek'); box.innerHTML = ''; box.className = 'atelier wv ms-buehne kv-buehne';
    box.appendChild(neuStueck());
    alle.forEach((x, i) => box.appendChild(x.el(i + 1)));
    if ($('#startZuletztSatz')) $('#startZuletztSatz').hidden = !nurBeispiele;
    const zl = $('#startZuletzt'); zl.innerHTML = ''; zl.className = 'atelier wv ms-buehne kv-buehne';
    if (!alle.length || nurBeispiele) zl.appendChild(neuStueck());
    alle.slice(0, nurBeispiele ? 5 : 6).forEach((x, i) => zl.appendChild(x.el(i + (nurBeispiele ? 1 : 0))));
    requestAnimationFrame(() => { reihen(box); reihen(zl); });
    $('#startZu').hidden = !(st().doc() && !st().doc().platzhalter);
  }

  /* ---------- Katalog des Hauses: Abteilungen, Anlässe & Events, Hinweise, Newsletter (Daten in katalog.js) ---------- */
  const K = window.DSKATALOG || { ABTEILUNGEN: [], HINWEISE: [], ANLAESSE: [], motive: () => [], NEWSLETTER: [] };
  const PFEIL_SVG = '<svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
  const WO = { haus: 'At the house', stadt: 'On the island', region: 'On the island' };
  const heute0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const vorbei = a => new Date(a.bis + 'T00:00') < heute0();
  /* Fehlerbuch 10a (19.11.2026): ein vergangener Anlass kommt nicht auf die Startseite und nicht unter «Events». Der Bau sortiert aus (_bau/vorlagen.py),
     hier noch einmal gegen den Tag im Browser, falls der Bau älter ist. Steht keiner bevor, fallen Abschnitt und Punkt «Events» weg (keine leere Fläche; Termine fehlen, OFFEN.md). */
  K.ANLAESSE = K.ANLAESSE.filter(a => !vorbei(a));
  const kommend = () => K.ANLAESSE.slice().sort((x, y) => (new Date(x.von + 'T00:00') < heute0()) - (new Date(y.von + 'T00:00') < heute0()) || x.von.localeCompare(y.von));
  /* Fundliste 23: heissen zwei Anlässe gleich («Culinarium»), nennt der Titel den Monat («Culinarium im November») */
  const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function anlassTitel(a) { const l = (typeof K !== 'undefined' && K.anlaesse) ? K.anlaesse : null; const gleich = (l || []).filter(x => x.t === a.t).length > 1 ; return gleich && a.von ? `${a.t} in ${MON[+a.von.slice(5, 7) - 1]}` : a.t; }
  function kachel(a, i, typ) {
    const ev = typ === 'event', laeuft = ev && new Date(a.von + 'T00:00') <= heute0();
    const foto = ev ? a.fotos[0] : a.foto, dazu = Z ? ((ev ? Z.anlass[a.k] : Z.abteilung[a.k]) || {}).n || 0 : 0, zahl = zahlDE((ev ? anlassListe(a).length : a.vorlagen.length) + dazu);
    return `<div class="wo" data-${typ}="${a.k}" role="button" tabindex="0" style="--i:${i}" aria-label="${esc(ev ? anlassTitel(a) : a.t)}">
      <span class="wo__k"><span class="wo__bild" data-bg="${DS.bildUrl(DS.M, foto, true)}"></span><span class="wo__licht"></span>${ev ? `<span class="wo__datum">${vorbei(a) ? 'Last time · ' : laeuft ? 'On now · ' : ''}${esc(a.z)}</span>` : ''}</span>
      <span class="wo__n"><span><b>${zus(ev ? anlassTitel(a) : a.t)}</b><small>${ev ? WO[a.wo] + ' · ' : ''}${zahl == 1 ? 'One template' : zahl + ' templates'}</small></span><i>${PFEIL_SVG}</i></span></div>`;
  }
  /* Eine fertige Vorlage als Karte: echte Vorschau, Klick öffnet sie im Studio (ohne KI, ohne Kosten) */
  let kvListe = [];
  function kvDoc(x, kontext) {
    const seiten = [{ vorlage: x.vorlage, ton: x.ton, inhalt: x.inhalt }];
    if (x.rueck) seiten.push({ vorlage: x.rueck.vorlage, ton: x.ton, inhalt: x.rueck.inhalt });
    return DS.dokument(DS.M, { name: (kontext ? kontext + ' · ' : '') + x.n, format: x.format, seiten });
  }
  function kvRaster(box, liste, kontext) {
    box.innerHTML = ''; box.className = 'atelier wv ms-buehne kv-buehne';
    /* Robert 24.11.2026 («… sich alles komplett überlappt»): Grösse aus der echten Spaltenzahl des Rasters, breite Etiketten nie breiter als ihre Spalte */
    const c = DS.spaltenWahl(liste.length, spalten(), {}).c, g = GROSS(c);
    liste.forEach((x, i) => {
      const nr = kvListe.push({ x, kontext }) - 1, doc = kvDoc(x, kontext), f = DS.FORMATE[x.format] || DS.FORMATE.a5h, [, H] = groesse(f, g, c);
      let bl = []; try { bl = [doc.seiten.length > 1 ? blattDoc(doc, g, 'papier--hinten', 1, c) : null, blattDoc(doc, g, 'papier--vorn', 0, c)]; } catch (e) { console.warn(x.n, e); }
      box.appendChild(stueckKarte({ kv: nr }, i, bl, H, x.n, `${f ? f.name : ''} · ${x.wo || ''}`, 'Use this'));
    });
    DS.spaltenSetzen(box, c);
    requestAnimationFrame(() => { reihen(box); });   // feste Spaltenzahl nach Anzahl: keine halb leere Reihe
  }
  /* Ein Blatt frei auf Blau für jede Liste (Robert 12.10.2026, 04:10: «alles so machen, wie die mit dem blauen Hintergrund vorher waren»):
     dieselbe Form wie «Arten und Vorlagen». Grösse aus dem echten Format (gestaucht), Name in Serif, Format in Versalien, beim Überfahren der Knopftext. */
  const groesse = (f, basis, c) => { let H = hoeheVon(f, basis), W = H * f.b / f.h; const m = Math.min(basis * 1.18, BREIT(c)); if (W > m) { W = m; H = W * f.h / f.b; } return [W, H]; };
  function stueckKarte(attr, i, blaetter, H, name, info, nimm, kl) {
    const b = document.createElement('button'); b.className = 'stueck stueck--vorlage' + (kl ? ' ' + kl : ''); b.style.setProperty('--i', Math.min(i, 8));
    b.style.setProperty('--r', ([-1.2, 1, -.6, 1.4, -1, .8][i % 6]) + 'deg');
    Object.entries(attr).forEach(([k, v]) => b.dataset[k] = v);
    const bu = document.createElement('span'); bu.className = 'stueck__buehne'; bu.style.height = Math.ceil(H + 36) + 'px';
    const sa = document.createElement('span'); sa.className = 'stueck__satz'; blaetter.forEach(x => x && sa.appendChild(x)); bu.appendChild(sa); b.appendChild(bu);
    b.insertAdjacentHTML('beforeend', `<b class="zl__name">${esc(name)}</b><em class="stueck__format">${esc(info)}</em>${nimm ? `<small class="stueck__satztext stueck__nimm">${esc(nimm)}</small>` : ''}`);
    return b;
  }
  function leerStueck(attr, f, basis, info, c) {
    const [W, H] = groesse(f, basis, c);
    const p = document.createElement('span'); p.className = 'papier papier--vorn papier--neu'; p.style.width = W + 'px'; p.style.height = H + 'px';
    /* Nachbesserung 5 (Prüfung 5 Punkt 2): sehr breite Blätter (Banner, Cup sleeve, Label) setzen Zeichen, Schrift und Plus in eine Zeile,
       in der Höhe des Blatts, damit nichts über den Rand geht */
    const breit = W / H > 1.6, hz = Math.max(13, Math.min(15, H * .2)), kn = Math.min(34, Math.round(H * .46));
    p.innerHTML = `<span class="papier__neu${breit ? ' papier__neu--breit' : ''}"${breit ? ` style="--hz:${hz.toFixed(1)}px;--kn:${kn}px"` : ''}><img src="/the-cat-and-gun/haus/_werkzeuge/imprimerie/_ob/kleid/catgun-zeichen.svg" alt=""><b>Blank page</b><span class="papier__plus">${PLUS}</span></span>`;
    return stueckKarte(attr, 0, [p], H, 'Blank page', info, 'Open');
  }
  function nimmVorlageKv(nr) { const { x, kontext } = kvListe[nr]; st().oeffne(kvDoc(x, kontext)); zu(); }

  function zeichneWochen() {
    const wo = $('#startWochen'), ev = kommend().slice(0, 4), keine = !ev.length;
    setzeKacheln(wo, ev.map((a, i) => kachel(a, i, 'event')).join(''));
    wo.dataset.n = ev.length;   // 1–3 Anlässe: Raster ohne versetzt endende Spalten (studio.css #startWochen[data-n])
    wo.hidden = keine; if (wo.previousElementSibling) wo.previousElementSibling.hidden = keine;
    document.querySelectorAll('.ms-nav [data-ansicht="events"]').forEach(b => b.hidden = keine);
    setzeKacheln($('#startAbteilungen'), K.ABTEILUNGEN.map((a, i) => kachel(a, i, 'abteilung')).join('')); $('#startAbteilungen').dataset.n = K.ABTEILUNGEN.length;
    vorholen();
    /* Grosse Kacheln (Hauptanlass, Mosaik gross) bekommen das grosse Foto, aber erst wenn es fertig dekodiert ist; bis dahin steht das kleine da */
    nachBereit(() => ['#startWochen>.wo:first-child', '#startAbteilungen>.wo:nth-child(1)', '#startAbteilungen>.wo:nth-child(7)'].forEach(sel => {   // erst wenn die Übersicht steht (30.10.2026: das grosse Foto nahm dem ersten Bildschirm die Leitung)
      const w = document.querySelector(sel), b = w && w.querySelector('.wo__bild'); if (!b || b.dataset.gross) return;
      const u = grossFoto(w.dataset.event ? 'event' : 'abteilung', w.dataset.event || w.dataset.abteilung); if (!u) return;
      b.dataset.gross = 1; hole(u).then(() => { bgSetzen(b); b.style.backgroundImage = `url('${u}')`; });
    }));
    /* Leiste: wie viele Vorlagen hinter jedem Punkt liegen (fertig gesetzte des Katalogs + passende der Bibliothek); ohne zahlen.json die alte Zählung */
    $('#evZahl').textContent = zahlDE(K.ANLAESSE.reduce((m, a) => m + anlassListe(a).length, 0) + (Z ? Z.anlaesse.n : 0));
    $('#abZahl').textContent = zahlDE(K.ABTEILUNGEN.reduce((m, a) => m + a.vorlagen.length, 0) + (Z ? Z.gesamt : 0));
    $('#hiZahl').textContent = zahlDE(K.HINWEISE.length + (Z ? Z.hinweise.n : 0)); const nl = $('#nlZahl'); if (nl) nl.textContent = K.NEWSLETTER.length;
    zeichneUmfangKnoepfe();
  }
  /* 15.10.2026: Kacheln bleiben stehen, wenn sich nur die Zahlen ändern (kein zweites Aufbauen, kein Flackern der Fotos) */
  function setzeKacheln(box, html) {
    if (box.__html === html) return;
    const neu = document.createElement('div'); neu.innerHTML = html;
    const alt = [...box.children], nk = [...neu.children], schl = e => e.outerHTML.replace(/<small>[^<]*<\/small>/g, '').replace(/ data-gross="1"/g, '').replace(/background-image:[^;"]*;?/g, '').replace(/ style=""/g, '').replace(/ data-bg="[^"]*"/g, '');
    if (alt.length && alt.length === nk.length && alt.every((e, i) => schl(e) === schl(nk[i]))) {
      alt.forEach((e, i) => { const a = e.querySelector('.wo__n small'), b = nk[i].querySelector('.wo__n small'); if (a && b && a.textContent !== b.textContent) a.textContent = b.textContent; });
    } else box.innerHTML = html;
    box.__html = html;
  }
  /* 15.10.2026: grosse Fotos der Kacheln vorab holen, damit die Ansicht eines Anlasses oder einer Abteilung mit fertigem Bild ankommt */
  const geholt = {};
  function hole(url) {
    if (!geholt[url]) { const im = new Image(); im.decoding = 'async'; im.src = url; geholt[url] = (im.decode ? im.decode() : Promise.resolve()).catch(() => { }).then(() => im); }
    return geholt[url];
  }
  /* Grosses Bild der Ansicht eines Anlasses: rund doppelte Anzeigebreite (30.10.2026; vorher die 2400er-Fassung, bis 733 KB je Foto) */
  const kdBreite = () => (innerWidth > 900 ? Math.min(660, innerWidth * .46) : innerWidth) * Math.max(1.5, Math.min(2, devicePixelRatio || 1)) / 1.6;
  const grossFoto = (typ, key) => { const a = (typ === 'event' ? K.ANLAESSE : K.ABTEILUNGEN).find(x => x.k === key); return a ? DS.bildFuer(DS.M, typ === 'event' ? a.fotos[0] : a.foto, kdBreite()) : null; };
  /* Vorholen erst, wenn die Übersicht steht, und nur für Kacheln nahe am Bildschirm; beim Zeigen auf eine Kachel sofort (30.10.2026, Start gedrosselt) */
  let vorIO = null;
  function vorholen() {
    const u = e => grossFoto(e.dataset.event ? 'event' : 'abteilung', e.dataset.event || e.dataset.abteilung);
    const los = () => { if (!vorIO && window.IntersectionObserver) vorIO = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { vorIO.unobserve(x.target); const v = u(x.target); if (v) hole(v); } }), { rootMargin: '200px 0px' });
      document.querySelectorAll('#start [data-event], #start [data-abteilung]').forEach(e => { if (vorIO) vorIO.observe(e); else { const v = u(e); if (v) hole(v); } }); };
    nachBereit(() => (window.requestIdleCallback || (f => setTimeout(f, 300)))(los));
  }
  function nachBereit(f) {
    const s = $('#start'); if (s.classList.contains('bereit')) return f();
    new MutationObserver((_, mo) => { if (s.classList.contains('bereit')) { mo.disconnect(); f(); } }).observe(s, { attributes: true, attributeFilter: ['class'] });
  }
  /* Fotos der Kacheln (data-bg) erst nahe am Bildschirm setzen (30.10.2026): beim Start lädt nur, was man sieht */
  let bgIO = null;
  function bgSetzen(e) { if (e.dataset.bg) { e.style.backgroundImage = `url('${e.dataset.bg}')`; delete e.dataset.bg; } }
  function bgBeobachten(root) {
    const l = (root || document).querySelectorAll('#start [data-bg]'); if (!l.length) return;
    if (!window.IntersectionObserver) return l.forEach(bgSetzen);
    const h = innerHeight + 600; l.forEach(e => { if (e.closest('[hidden]')) return; const q = e.getBoundingClientRect(); if (q.width && q.bottom > -600 && q.top < h) bgSetzen(e); });   // Sichtbares gleich, ohne einen leeren Moment
    if (!bgIO) bgIO = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { bgIO.unobserve(x.target); bgSetzen(x.target); } }), { root: $('#start .ms-haupt'), rootMargin: '600px 0px' });
    l.forEach(e => { if (e.dataset.bg) bgIO.observe(e); });
  }
  let bgMO = null;
  function bgWache() { if (bgMO) return; const s = $('#start'); bgBeobachten(s); bgMO = new MutationObserver(() => bgBeobachten(s)); bgMO.observe(s, { childList: true, subtree: true });
    /* Tor 2 (30.10.2026, K4): steht die Übersicht, kommen die übrigen kleinen Kachelfotos im Leerlauf nach; keine Kachel bleibt leer, auch ohne Scrollen */
    nachBereit(() => setTimeout(() => (window.requestIdleCallback || (f => f()))(() => s.querySelectorAll('[data-bg]').forEach(e => { if (!e.closest('[hidden]')) bgSetzen(e); })), 1200)); }
  let evFilter = 'alle', katalogGezeichnet = {};
  /* Verbindung zur Bibliothek (12.10.2026): Z = vorlagen/zahlen.json (aus _qa/vorlagen_zahlen.py), vUmfang = Ausschnitt der Galerie (Abteilung, Anlass, Hinweise) */
  let Z = null, vUmfang = null;
  /* Anlass ↔ Bibliothek (29.10.2026): Vorlagen mit Feld «anlass» (dirty-chicken, abend-…) zählen und erscheinen beim Anlass, neben den Motiven des Katalogs */
  let AB = {};
  const anlassListe = a => [...K.motive(a), ...(AB[a.k] || [])];
  function ladeAnlaesse() { ladeAlle().then(l => { const neu = {}; l.forEach(({ v, a }) => { if (v.anlass) (neu[v.anlass] = neu[v.anlass] || []).push({ n: v.titel, art: a.name, wo: a.name + (v.bereich ? ' · ' + v.bereich : ''), format: DS.FORMATE[v.format] ? v.format : a.format, vorlage: v.vorlage, ton: v.ton, inhalt: v.inhalt, stil: v.stil, rueck: v.rueck || null }); });
    AB = neu; zeichneWochen(); if (ansicht === 'events') zeichneEvents(); }).catch(() => { }); }
  const zahlDE = n => n.toLocaleString('en-GB');
  function zeichneEvents() {
    const l = K.ANLAESSE.filter(a => evFilter === 'alle' || (evFilter === 'haus' ? a.wo === 'haus' : a.wo !== 'haus'));
    const monate = {};
    l.forEach(a => { const d = new Date(a.von + 'T00:00'), laeuft = d < heute0() && !vorbei(a), key = laeuft ? '0000' : a.von.slice(0, 7); (monate[key] = monate[key] || []).push(a); });
    let n = 0;
    /* Je Monat eine Zeile: Monat gross links, rechts die Anlässe über die volle Breite (Robert 16.10.2026: «kein leerer Raum, luxuriöser»).
       Raster mit sechs Spalten: 1 Anlass = breite Kachel mit Text daneben, 2 und 4 = halb/halb, sonst Drittel; ein Rest von eins wird breit, von zwei halb. */
    const art = (i, z) => { if (z === 1) return 'breit'; if (z === 2 || z === 4) return 'halb'; const rest = z % 3, ab = z - rest; return i < ab ? 'drittel' : rest === 1 ? 'breit' : 'halb'; };
    const kommt = m => m === '0000' || m >= heute0().toISOString().slice(0, 7);
    $('#evListe').innerHTML = Object.keys(monate).sort((x, y) => (kommt(y) - kommt(x)) || (kommt(x) ? x.localeCompare(y) : y.localeCompare(x))).map(m => {
      const d = new Date((m === '0000' ? heute0().toISOString().slice(0, 7) : m) + '-01T00:00'), z = monate[m].length;
      const kopf = m === '0000' ? `<b>Now</b><small>On now · ${z} ${z === 1 ? 'event' : 'events'}</small>`
        : `<b>${d.toLocaleDateString('en-GB', { month: 'long' })}</b><small>${d.getFullYear()} · ${z} ${z === 1 ? 'event' : 'events'}</small>`;
      return `<section class="ev-monat"><div class="ev-monat__kopf">${kopf}</div><div class="ms-wochen ev-raster">${monate[m].map((a, i) => {
        const k = art(i, z); let h = kachel(a, n++, 'event').replace('class="wo"', `class="wo wo--${k}"`);
        if (k === 'breit' && a.satz) h = h.replace('</small></span><i>', `</small><span class="wo__satz">${esc(a.satz)}</span></span><i>`);
        return h;
      }).join('')}</div></section>`;
    }).join('');
  }
  function zeichneAbteilungen() { $('#abListe').innerHTML = K.ABTEILUNGEN.map((a, i) => kachel(a, i, 'abteilung')).join(''); }
  function zeichneListe(was) {
    if (katalogGezeichnet[was]) return; katalogGezeichnet[was] = 1;
    if (was === 'hinweise') kvRaster($('#hiRaster'), K.HINWEISE, '');
    if (was === 'newsletter') kvRaster($('#nlRaster'), K.NEWSLETTER, '');
  }
  /* Von Abteilung, Anlass oder Hinweisen in die Bibliothek: derselbe Galerie-Aufbau wie «Alle Vorlagen», nur auf den Ausschnitt begrenzt */
  function zeigeUmfang(code) {
    if (!Z) return zeigeWeg('alle');
    const [was, k] = code.split(':'); let u = null;
    if (was === 'abteilung') { const a = K.ABTEILUNGEN.find(x => x.k === k), z = Z.abteilung[k]; if (a && z) u = { titel: a.t, bereiche: z.bereiche, satz: `All templates for ${a.t}. Search for a word or narrow it down by kind and ground.` }; }
    if (was === 'anlass') { const a = K.ANLAESSE.find(x => x.k === k), z = Z.anlass[k]; if (a && z) u = { titel: a.t, q: z.q, satz: `Templates from the library that contain «${z.q}». You can change the search word.` }; }
    if (was === 'hinweise') u = { titel: 'Notices in the house', arten: Z.hinweise.arten, satz: 'Out-of-order signs, notices, info cards and door hangers for every area of the house.' };
    if (was === 'anlaesse') u = { titel: 'Holidays and trips', bereiche: Z.anlaesse.bereiche, satz: 'Templates for holidays at the house and for trips around the island.' };
    zeigeWeg('alle', u);
  }
  const lnk = (umfang, text) => `<button class="kn kn--mehr" data-umfang="${umfang}"><span>${text}</span><i><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></i></button>`;
  function zeichneUmfangKnoepfe() {
    if (!Z) return;
    const h = $('#hiAlle'); if (h) h.innerHTML = lnk('hinweise', `See ${zahlDE(Z.hinweise.n)} more notices for every area`);
    const e = $('#evAlle'); if (e) e.innerHTML = lnk('anlaesse', `See ${zahlDE(Z.anlaesse.n)} templates for holidays and trips`);
    const a = $('#abAlle'); if (a) a.innerHTML = `<button class="kn kn--mehr" data-st="alle"><span>Search all ${zahlDE(Z.gesamt)} templates by area</span><i><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></i></button>`;
  }
  /* Anlass oder Abteilung im Detail: alle fertigen Vorlagen dazu */
  let offen = null, detailVon = 'events';
  function zeigeDetailBereit(typ, key) {
    const u = grossFoto(typ, key); if (!u) return zeigeDetail(typ, key);
    const t = zeigeDetail.__t = {}; let fertig = false;
    const weiter = () => { if (!fertig && zeigeDetail.__t === t) { fertig = true; zeigeDetail(typ, key); } };
    hole(u).then(weiter); setTimeout(weiter, 450);
  }
  /* Robert 24.11.2026 («Warum ist da immer so wenig überall? … bei Pooltable alles komplett rot»): jeder Bereich zeigt zuerst die echten Stücke des Hauses,
     die dorthin gehören (Zuordnung nach dem Zweck jedes Stücks in drucksachen/_bau/stuecke.json), danach die Vorlagen */
  const HAUS_BEREICH = {
    cafe: ['aufsteller', 'aufsteller2', 'aufsteller4', 'tischset', 'serviette', 'servietten', 'becher', 'becherhuelse', 'untersetzer-kaffee', 'untersetzer-brekky', 'untersetzer-dessert', 'bewertung', 'teller', 'brett', 'glocke', 'box', 'tueten', 'sauce', 'bon', 'rechnung', 'stempel', 'kreidetafel3', 'plakate2'],
    saefte: ['saft-etiketten', 'etiketten2', 'anhaenger', 'anhaenger2', 'untersetzer-saft', 'untersetzer-kombucha', 'sticker4'],
    bar: ['bierdeckel', 'bierdeckel-markt', 'aufsteller3', 'kreidetafel2', 'glaeser', 'untersetzer-drei', 'emaille'],
    pool: ['tafel-pool', 'kugeln', 'kreide', 'queue', 'untersetzer-pool', 'kundenstopper2', 'schluessel'],
    spielplatz: ['malblatt', 'sticker5', 'kundenstopper'],
    strasse: ['banner', 'kundenstopper', 'kundenstopper3', 'kreidetafel', 'markt', 'plakate', 'flyer', 'postkarten', 'aushang', 'kaertchen'],
  };
  function hausImBereich(key) { const I = HSD().index; return (HAUS_BEREICH[key] || []).filter(id => I[id]); }
  function zeigeDetail(typ, key) {
    const a = (typ === 'event' ? K.ANLAESSE : K.ABTEILUNGEN).find(x => x.k === key); if (!a) return;
    offen = { typ, a }; detailVon = typ === 'event' ? (ansicht === 'start' ? 'start' : 'events') : (ansicht === 'start' ? 'start' : 'abteilungen');
    const ev = typ === 'event', liste = ev ? anlassListe(a) : a.vorlagen, foto = ev ? a.fotos[0] : a.foto;
    const bib = Z ? (ev ? Z.anlass[a.k] : Z.abteilung[a.k]) : null, mehr = bib ? bib.n : 0;
    const zurueck = { start: 'Overview', events: 'Events', abteilungen: 'Areas of the house' }[detailVon];
    $('#msDetail').innerHTML = `<button class="ms-lnk ms-lnk--zurueck" data-ansicht="${detailVon}"><svg viewBox="0 0 24 24"><path d="M19 12H5m6-6-6 6 6 6"/></svg><span>${zurueck}</span></button>
      <div class="kd">
        <div class="wo kd__bild"><span class="wo__k"><span class="wo__bild" style="background-image:url('${DS.bildFuer(DS.M, foto, kdBreite())}')"></span><span class="wo__licht"></span>${ev ? `<span class="wo__datum">${esc(a.z)}</span>` : ''}</span></div>
        <div class="kd__text">${ev ? `<em class="kd__wo">${WO[a.wo]} · ${esc(a.ort)}</em>` : ''}<h1>${esc(ev ? anlassTitel(a) : a.t)}</h1><p>${esc(a.satz)}</p>
          <div class="kd__zahl"><b>${zahlDE(liste.length + mehr + (ev ? 0 : hausImBereich(a.k).length))}</b><span>${ev ? `${liste.length === 1 ? 'design' : 'designs'}, ready in the style of the house` : `pieces of the house and templates for this area`}</span></div>
          <div class="ms-feld ms-feld--klein"><span class="ms-feld__ic"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg></span><textarea id="kampFrei" rows="1" placeholder="Something else? Type a word …"></textarea><button class="kn knopf--voll glanz-kn" data-st="kfrei"><span>Find templates</span><i>${PFEIL_SVG}</i></button></div></div>
      </div>
      ${!ev && hausImBereich(a.k).length ? `<div class="ms-zeile"><h2>Pieces of the house</h2><span class="ms-leise">Tap to open the piece in the editor</span></div><div class="atelier wv ms-buehne kv-buehne hs-raster" id="detailHaus"></div>` : ''}
      <div class="ms-zeile"><h2>${ev ? 'The designs' : 'The templates'}</h2><span class="ms-leise">Tap to open the template in the editor</span></div>
      <div class="ms-raster" id="detailRaster"></div>
      ${mehr ? `<div class="vb__alle"><button class="kn kn--mehr" data-umfang="${ev ? 'anlass' : 'abteilung'}:${a.k}"><span>See ${zahlDE(mehr)} more templates for ${esc(a.t)}</span><i><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></i></button></div>` : ''}`;
    waehleAnsicht('detail');
    passeFeld($('#kampFrei'));
    kvRaster($('#detailRaster'), liste, a.t);
    const hb = $('#detailHaus');
    if (hb) { const ids = hausImBereich(a.k), w = DS.spaltenWahl(ids.length, spalten(), {}), c = w.c, g = GROSS(c); ids.forEach((id, i) => hb.appendChild(hsKarte(id, i, g, c))); DS.spaltenSetzen(hb, c); requestAnimationFrame(() => reihen(hb)); }
  }
  /* Feld «Etwas anderes für …» wächst mit dem Satz (Robert 29.10.2026: «Sowas kann man halt auch nicht wirklich erkennen und lesen»): so viele Zeilen,
     wie Platzhalter oder Eingabe brauchen, gemessen an der echten Breite; neu beim Tippen und bei anderer Fensterbreite */
  function passeFeld(t) {
    if (!t) return;
    const g = getComputedStyle(t), lh = parseFloat(g.lineHeight) || parseFloat(g.fontSize) * 1.25, pad = parseFloat(g.paddingTop) + parseFloat(g.paddingBottom);
    let zeilen = 1;
    if (t.value) { t.style.height = 'auto'; zeilen = Math.max(1, Math.round((t.scrollHeight - pad) / lh)); }
    else { const c = (passeFeld.c = passeFeld.c || document.createElement('canvas').getContext('2d')); c.font = `${g.fontWeight} ${g.fontSize} ${g.fontFamily}`; zeilen = Math.max(1, Math.ceil(c.measureText(t.placeholder).width / Math.max(40, t.clientWidth - 2))); }
    t.style.height = Math.ceil(zeilen * lh + pad) + 'px';
    if (!t.dataset.feld) {
      t.dataset.feld = 1; t.addEventListener('input', () => passeFeld(t));
      if (window.ResizeObserver) { let b = 0; new ResizeObserver(() => { if (Math.abs(t.clientWidth - b) > 1) { b = t.clientWidth; passeFeld(t); } }).observe(t); }   // Breite erst nach dem Aufbau endgültig
    }
  }
  addEventListener('resize', () => { clearTimeout(passeFeld.r); passeFeld.r = setTimeout(() => passeFeld(document.getElementById('kampFrei')), 120); });
  /* Fundliste 29.10., 03: der Platzhalter der grossen Felder steht einzeilig; wird das Feld zu schmal, gilt die kurze Fassung «Zum Beispiel: Plakat» */
  function kurzPlatz(t) {
    if (!t) return; t.dataset.lang = t.dataset.lang || t.placeholder;
    const g = getComputedStyle(t), c = (kurzPlatz.c = kurzPlatz.c || document.createElement('canvas').getContext('2d')); c.font = `${g.fontWeight} ${g.fontSize} ${g.fontFamily}`;
    t.placeholder = [t.dataset.lang, 'E.g. poster', 'Type a word …'].find(x => c.measureText(x).width <= t.clientWidth - 4) || 'Type a word …';   // Tor 2: nie zweizeilig
  }
  ['startFrei', 'startDirekt'].forEach(id => { const t = document.getElementById(id); if (!t) return; kurzPlatz(t); if (window.ResizeObserver) new ResizeObserver(() => kurzPlatz(t)).observe(t); if (document.fonts) document.fonts.ready.then(() => kurzPlatz(t)); });
  /* Schnell anlegen: Arten mit echten Proportionen */
  function zeichneSchnell() {
    $('#startSchnell').innerHTML = ARTEN.filter(a => !a.leer).slice(0, 8).map((a, i) => { const f = DS.FORMATE[a.format], k = 46 / Math.max(f.b, f.h);
      return `<button class="sf" data-art="${a.key}" style="--i:${i}"><span class="sf__f"><span style="width:${Math.round(f.b * k)}px;height:${Math.round(f.h * k)}px"></span></span><b>${esc(a.name)}</b><small>${esc(f.name)}</small></button>`; }).join('');
  }
  /* Fotos des Hauses */
  const fotoZahlen = B => { const haus = B.filter(b => !b.eigen).length; return { haus, weitere: 0, fotos: haus, motive: 0 }; };
  let fotoGruppe = 'All', fotoF = { s: 'alle', f: 'alle', h: 'alle' };
  function zeichneFotos() {
    const M = DS.M, B = M.bilder || [], T = DS.LIVRE_TEXT, L = !!M.livre;
    const gr = ['All', ...Object.values(T.b).filter(g => B.some(b => b.gruppe === g))];
    /* Fundliste 15: eine Zahl je Sache, überall dieselbe (Leiste, dieser Satz, Editor «Alle Fotos»): Fotos = vom Haus + weitere der Website; Plakat-Motive = Rudis 13 */
    const fz = fotoZahlen(B);
    $('#fotoZahl').textContent = fz.fotos;
    $('#fotoSatz').textContent = `${fz.fotos} photos of the house, from the brand book. Pick a photo and see every kind of design with it.`;
    const reihe = (art, titel, werte) => `<div class="fo-reihe"><span class="fo-reihe__t">${titel}</span>${[['alle', 'All'], ...werte].map(([k, t]) => `<button data-f${art}="${k}" class="${fotoF[art] === k ? 'an' : ''}">${esc(t)}</button>`).join('')}</div>`;
    $('#fotoGruppen').innerHTML = `<div class="fo-reihe"><span class="fo-reihe__t">Topic</span>${gr.map(g => `<button data-fgruppe="${esc(g)}" class="${g === fotoGruppe ? 'an' : ''}">${esc(g)}</button>`).join('')}</div>`;
    const box = $('#fotoRaster');
    if (!box.children.length) box.innerHTML = B.map(b => `<figure class="fo" data-foto="${b.key}" data-gruppe="${esc(b.gruppe)}" data-s="${b.saison || ''}" data-f="${b.format || ''}" data-h="${b.herkunft || ''}" data-alt="${esc((b.alt + ' ' + (b.saison ? T.s[b.saison] + ' ' + T.h[b.herkunft] : '')).toLowerCase())}"><img decoding="async" src="${DS.bildUrl(DS.M, b.key, true)}" alt="${esc(b.alt)}"><figcaption><span>${esc(b.alt)}</span><button class="kn kn--klein ms-kn-anlegen" data-ausfoto="${b.key}"><span>Design with it</span><i>${PFEIL_SVG}</i></button></figcaption></figure>`).join('');
  }
  function filterFotos(q) {
    const W = (q || '').trim().toLowerCase().split(/\s+/).filter(Boolean); let n = 0;
    document.querySelectorAll('#fotoRaster .fo').forEach(f => { const p = (fotoGruppe === 'All' || f.dataset.gruppe === fotoGruppe) && ['s', 'f', 'h'].every(k => fotoF[k] === 'alle' || f.dataset[k] === fotoF[k]) && W.every(w => f.dataset.alt.includes(w)); f.hidden = !p; if (p) n++; });
    fotoReihe();
    return n;
  }
  /* Prüfung 4 (Punkt 2 und 4): ohne die Grafiken der Anlässe sind es 29 Fotos; bleibt die letzte Reihe unvollständig, zieht sich das letzte Foto über die freie Breite,
     so hoch wie die anderen (Spalten aus dem Raster gelesen, gilt auch für jedes Thema und jede Suche) */
  function fotoReihe() {
    const box = $('#fotoRaster'); if (!box || !box.offsetParent) return;
    const k = [...box.querySelectorAll('.fo')]; k.forEach(f => { f.style.gridColumn = ''; f.style.aspectRatio = ''; f.style.height = ''; });
    const v = k.filter(f => !f.hidden), sp = getComputedStyle(box).gridTemplateColumns.split(' ').filter(t => t && t !== 'none').length, r = sp > 1 ? v.length % sp : 0;
    if (r && v.length > 1) { const l = v[v.length - 1], h = v[0].getBoundingClientRect().height; l.style.gridColumn = 'span ' + (sp - r + 1); l.style.aspectRatio = 'auto'; l.style.height = h + 'px'; }
  }
  addEventListener('resize', () => { clearTimeout(window.__dsFR); window.__dsFR = setTimeout(fotoReihe, 200); });
  /* Farben & Schriften: was das Studio weiss */
  function zeichneMarke() {
    const M = DS.M, F = M.farben || {}, N = M.farbnamen || {}, S = M.schriften || {};
    const rolle = { titel: 'DS-titel', kapitale: 'DS-kapitale', text: 'DS-text', kursiv: 'DS-kursiv', mono: 'DS-mono' };
    const L = M.livre, LS = DS.livreSeite();
    const farbenEinmal = L ? L.farben.filter((c, i, l) => l.findIndex(x => x.h.toLowerCase() === c.h.toLowerCase()) === i) : [];   // Fundliste 16: «Orange» = «Kerze» #EF7649
    const kurzName = n => String(n || '').replace(/^Dirty-Chicken-/, '');   // «Dirty-Chicken-Violett» → «Violett»
    const livreFarben = L ? `<div class="mb__p mb__p--farben"><h3>Colours</h3><div class="mb__farben">${farbenEinmal.map(c => `<span title="${esc(c.r || '')}"><i style="background:${c.h}"></i><b>${esc(kurzName(c.n))}</b><small>${esc(c.h)}</small></span>`).join('')}</div></div>` : '';
    const livreDateien = L ? `<div class="mb__p mb__p--dateien"><h3>Wordmark and marks</h3><div class="mb__dateien">${L.dateien.filter(d => d.var && d.var.length && d.var[0].dateien.some(x => /\.(svg|png|webp|jpe?g)$/i.test(x))).map(d => { const v = d.var[0], datei = v.dateien.find(x => x.endsWith('.svg')) || v.dateien[0]; return `<a class="mb__datei ${v.grund === 'dunkel' ? 'mb__datei--d' : ''}" href="${DS.livreUrl('dateien/')}${encodeURIComponent(v.dateien[v.dateien.length - 1])}" download><span${d.k === 'tapete' ? ` style="background-image:url('${DS.livreUrl('dateien/')}${encodeURIComponent(datei)}')"` : ''}>${d.k === 'tapete' ? '' : `<img src="${DS.livreUrl('dateien/')}${encodeURIComponent(datei)}" alt="" loading="lazy">`}</span><b>${esc(d.n || d.k)}</b><small>SVG</small></a>`; }).join('')}</div></div>` : '';
    $('#msMarke').innerHTML = `<div class="ms-titel"><h1>Colours &amp; fonts</h1><span class="ms-leise">${L ? 'From the brand book of the house. ' : ''}Every design is made from these colours, fonts, marks and photos. Print &amp; feed sticks to them.</span></div>
      <a class="mb-livre" href="${LS}" target="_blank" rel="noopener"><span class="mb-livre__z">${DS.zeichenSvg(M, 'currentColor')}</span><span><b>Open the brand book</b><small>All ${L ? L.fotos.length : (M.bilder || []).length} photos, the wordmark, colours and elements of The Cat &amp; Gun</small></span><i>${PFEIL_SVG}</i></a>
      <div class="mb">
        <div class="mb__p mb__p--zeichen"><span class="mb__z">${DS.zeichenSvg(M, 'currentColor')}</span><b>${esc(M.voll || M.name)}</b><small>${esc(M.zeile || '')}</small></div>
        ${L ? livreFarben : `<div class="mb__p mb__p--farben"><h3>Colours</h3><div class="mb__farben">${Object.entries(F).map(([k, c]) => `<span><i style="background:${c}"></i><b>${esc(N[k] || k)}</b><small>${c}</small></span>`).join('')}</div></div>`}
        <div class="mb__p mb__p--tapete"><h3>Pattern</h3><div class="mb__tapeten">
          <figure class="mb__tw"><span class="mb__tw-flaeche mb__tw-flaeche--nacht" style="background-image:url('${M.basis}${M.tapete.dunkel}')"><span class="mb__tw-doc" data-ton="dunkel"></span></span><figcaption><b>Black</b>Dark grounds can carry the herringbone of the wooden bar front, very faint. In the editor under Design → Pattern.</figcaption></figure>
          <figure class="mb__tw"><span class="mb__tw-flaeche mb__tw-flaeche--tag" style="background-image:url('${M.basis}${M.tapete.hell}')"><span class="mb__tw-doc" data-ton="creme"></span></span><figcaption><b>White</b>On white the light herringbone sits underneath. In the editor under Design → Pattern: none, dark or light.</figcaption></figure>
        </div></div>
        <div class="mb__p mb__p--schriften"><h3>Fonts</h3>${Object.entries(S).map(([k, s]) => `<div class="mb__s"><span style="font-family:'${rolle[k] || 'DS-text'}',serif${k === 'kursiv' ? ';font-style:italic' : ''}">Aa</span><b>${esc(s.familie)}</b><small>${esc(s.wofuer || '')}</small></div>`).join('')}</div>
        <div class="mb__p mb__p--regeln"><h3>Rules of the house</h3><ul>${(M.regeln || []).map(r => DS.regelSichtbar(r)).filter(Boolean).map(r => `<li>${esc(r)}</li>`).join('')}</ul></div>
        ${livreDateien}
        <div class="mb__p mb__p--angaben"><h3>Details</h3><dl>${[['Place', M.adr], ['Phone', M.tel], ['Opening hours', M.zeiten], ['Instagram', M.ig]].filter(x => x[1]).map(([l, v]) => `<dt>${l}</dt><dd>${esc(v)}</dd>`).join('')}</dl><button class="ms-lnk" data-ansicht="fotos"><span>See ${(M.bilder || []).length} photos</span>${PFEIL_SVG}</button></div>
      </div>`;
    const dat = $('#msMarke .mb__dateien'); if (dat) dat.style.setProperty('--n', Math.max(1, Math.min(6, dat.children.length)));
    requestAnimationFrame(markeAusgleich);
    /* Safari setzt Schriften und Farbtafel später: bei jeder Grössenänderung der Farbtafel oder des Rasters neu ausgleichen (ein Mal je Bild) */
    if (window.ResizeObserver) { if (window.__dsMARO) window.__dsMARO.disconnect(); let g = 0; const ro = window.__dsMARO = new ResizeObserver(() => { if (!g) g = requestAnimationFrame(() => { g = 0; markeAusgleich(); }); });
      ['.mb', '.mb__p--farben .mb__farben', '.mb__p--angaben'].forEach(q => { const e = $('#msMarke ' + q); if (e) ro.observe(e); }); }
    /* Tapete erlebbar (Robert 29.10.2026: «sieht auch einfach scheiße leer aus»): auf jeder Fläche ein echtes Blatt des Hauses im passenden Ton */
    document.querySelectorAll('#msMarke .mb__tw-doc').forEach(t => { try { const d = DS.dokument(M, { name: 'Example', format: 'a6h', seiten: [{ vorlage: 'deckel', ton: t.dataset.ton, inhalt: { titel: M.name } }] }); t.appendChild(window.DSStudio.miniBox(d, 0, 190)); } catch (e) { console.warn(e); } });
  }
  /* Nachbesserung 5 (Prüfung 5 Punkt 3): «Colours & fonts» ohne halb leere Reihen und ohne leere Tafelflächen. Die letzte Farbe zieht sich über die freie Breite
     ihrer Reihe; stehen Zeichen und Angaben neben der Farbtafel, nimmt die Zeichen-Tafel (Inhalt mittig) die Höhe, die neben den Farben frei bliebe. */
  function markeAusgleich() {
    const m = $('#msMarke'); if (!m || !m.offsetParent) return;
    const fa = m.querySelector('.mb__farben'), z = m.querySelector('.mb__p--zeichen'), a = m.querySelector('.mb__p--angaben'), f = m.querySelector('.mb__p--farben');
    if (fa) { const k = [...fa.children]; k.forEach(x => x.style.gridColumn = ''); const sp = getComputedStyle(fa).gridTemplateColumns.split(' ').filter(t => t && t !== 'none').length, r = sp > 1 ? k.length % sp : 0; if (r) k[k.length - 1].style.gridColumn = 'span ' + (sp - r + 1); }
    if (z && a && f) {
      z.style.minHeight = '';
      /* Abnahme 28.11.2026: Lage ohne Bewegung messen (offset statt getBoundingClientRect). Die Tafeln schweben beim Öffnen gestaffelt ein; mitten in der Bewegung
         standen sie nicht auf einer Höhe, der Ausgleich griff nicht und «Details» blieb zur Hälfte leer. */
      const nebeneinander = Math.abs(z.offsetTop - f.offsetTop) < 2 && z.offsetLeft + z.offsetWidth <= f.offsetLeft + 1;
      if (nebeneinander) {
        [z, a, f].forEach(x => x.style.alignSelf = 'start');
        const gap = parseFloat(getComputedStyle(m.querySelector('.mb')).rowGap) || 0, frei = f.offsetHeight - a.offsetHeight - gap;
        [z, a, f].forEach(x => x.style.alignSelf = '');
        if (frei > z.offsetHeight) z.style.minHeight = Math.ceil(frei) + 'px';
      }
    }
  }
  addEventListener('resize', () => { clearTimeout(window.__dsMA); window.__dsMA = setTimeout(markeAusgleich, 200); });
  document.fonts && document.fonts.ready.then(() => markeAusgleich());
  /* Begrüssung nach Tageszeit */
  function gruss() {
    const d = new Date(), h = d.getHours();
    $('#msGruss').textContent = window.WO && WO.gruss ? WO.gruss().replace(/\.$/, '') : h >= 5 && h < 12 ? 'Good morning' : h >= 12 && h < 18 ? 'Good afternoon' : 'Good evening';   // persönlich und warm, ohne Ausrufezeichen (Robert 29.10.); Stunden wie der Tresen (WO.gruss), nachts Abend (30.10.)
    $('#msSatz').textContent = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) + ' · What do you want to make today?';
  }
  /* gleitende Platte in der Leiste */
  function gleite() {
    const nav = $('#msNav'), an = nav.querySelector('button.an'), g = nav.querySelector('.ms-gleiter');
    if (!an) { g.style.opacity = 0; return; }
    g.style.opacity = 1; g.style.height = an.offsetHeight + 'px'; g.style.transform = `translateY(${an.offsetTop}px)`;
  }
  /* 3D beim Überfahren wie die Kacheln der Website: neigt sich zur Maus, Licht wandert mit */
  let kippt = null;
  function loese(k) { k.classList.remove('kipp'); ['--rx', '--ry', '--gx', '--gy'].forEach(v => k.style.removeProperty(v)); }
  function kippen(e) {
    if (e.pointerType !== 'mouse') return;
    const k = e.target.closest('.wo,.mk:not(.mk--neu)');
    if (kippt && kippt !== k) loese(kippt);
    kippt = k; if (!k) return;
    const r = k.firstElementChild.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    if (r.width > 420) { kippt = null; return; }   // grosse Kacheln (Mosaik, Hauptanlass) bleiben ruhig (16.10.2026)
    k.classList.add('kipp');
    k.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg'); k.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
    k.style.setProperty('--gx', (x * 70).toFixed(1) + '%'); k.style.setProperty('--gy', (y * 70).toFixed(1) + '%');
  }
  /* ---------- Stücke des Hauses (Robert 23.11.2026: «… ich möchte genau dieses Dokument jetzt bearbeiten in Print and Feed»): die Drucksachen des Hauses als
     Dokumente (haeuser/catgun/stuecke.js + stuecke/<id>.json, _bau/stuecke_einlesen.py). Eigene Ansicht nach Gruppen wie auf den Seiten der Drucksachen, und bei
     jeder Art ganz vorn. Klick öffnet das Stück im Editor, «Make a copy» legt eine Kopie unter My designs an, «Save PDF» lädt die Druckdatei. ---------- */
  const HSD = () => window.DSHaus || { gruppen: [], index: {} };
  function hsFuerWahl(W) {
    if (!wahl || wahl.alle || wahl.leer || mitFoto || vFilter.bereich !== 'alle' || vFilter.ton !== 'alle') return [];
    const I = HSD().index;
    return HSD().gruppen.flatMap(g => g[2]).filter(id => I[id] && I[id].a === wahl.key && (W || []).every(w => (I[id].t + ' ' + I[id].f).toLowerCase().includes(w)));
  }
  function hsKarte(id, i, g, c, mitHaus) {
    const x = HSD().index[id], gesp = st().alleDocs()['stueck-' + id];
    const fV = k => DS.FORMATE[x.fk[k]] || DS.FORMATE[x.fk[0]] || { b: 100, h: 100 }, [, H] = groesse(fV(0), g, c);
    const bild = (k, kl) => {
      const [w2, h2] = groesse(fV(k), g, c), p = document.createElement('span');
      p.className = 'papier hs-papier ' + kl + (x.frei && x.frei[k] ? ' hs-papier--frei' : ''); p.style.width = w2 + 'px'; p.style.height = h2 + 'px';
      const im = new Image(); im.alt = ''; im.decoding = 'async'; if (i > 5) im.loading = 'lazy'; im.src = DS.M.basis + x.v[k]; p.appendChild(im); return p;
    };
    let bl = null;
    if (gesp) try { bl = [gesp.seiten.length > 1 ? blattDoc(gesp, g, 'papier--hinten', 1, c) : null, blattDoc(gesp, g, 'papier--vorn', 0, c)]; } catch (e) { bl = null; }
    if (!bl) bl = [x.n > 1 ? bild(1, 'papier--hinten') : null, bild(0, 'papier--vorn')];
    const ak = Object.entries({ kopie: 'Make a copy', pdf: 'Save PDF' }).map(([k, t]) => `<button data-hsakt="${k}" title="${t}" aria-label="${t}">${IA[k]}</button>`).join('');
    const k = medienStueck({ stueck: id }, i, bl, H, x.t, `${mitHaus ? 'From the house · ' : ''}${x.n} ${x.n === 1 ? 'page' : 'pages'}${gesp ? ' · changed ' + vorZeit(gesp.geaendert) : ''}`, ak);
    k.classList.add('stueck--haus'); k._H = H;
    return k;
  }
  function zeichneStuecke() {
    const box = $('#hsListe'); if (!box) return;
    const D = HSD(), W = ($('#startSuche').value || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    box.innerHTML = ''; let nr = 0, zahl = 0;
    D.gruppen.forEach(([k, name, ids]) => {
      const l = ids.filter(id => D.index[id] && W.every(w => (D.index[id].t + ' ' + D.index[id].f + ' ' + name).toLowerCase().includes(w)));
      if (!l.length) return;
      zahl += l.length;
      /* Sticker: der Weg in den Sticker editor als eigene Karte, wenn sie die Reihe füllt (7 Stücke + 1 = 2 × 4) */
      const weg = k === 'sticker' ? { t: 'Sticker editor', info: 'All stickers with cut lines', url: location.port === '9738' ? 'http://127.0.0.1:9734/_werkzeuge/sticker/' : '../sticker/' } : null;
      const w = DS.spaltenWahl(l.length, spalten(), { leer: !!weg }), c = w.c, g = GROSS(c);
      box.insertAdjacentHTML('beforeend', `<div class="ms-zeile hs-zeile"><h2>${esc(name)}</h2><span class="ms-leise">${l.length === 1 ? 'One piece' : l.length + ' pieces'}</span></div>`);
      const r = document.createElement('div'); r.className = 'atelier wv ms-buehne kv-buehne hs-raster'; r.dataset.gruppe = k;
      l.forEach(id => r.appendChild(hsKarte(id, nr++, g, c)));
      if (weg && w.leer) {
        const f0 = DS.FORMATE.a6h, [W0, H0] = groesse(f0, g, c), p = document.createElement('span');
        p.className = 'papier papier--vorn papier--neu'; p.style.width = W0 + 'px'; p.style.height = H0 + 'px';
        p.innerHTML = `<span class="papier__neu"><img src="/the-cat-and-gun/haus/_werkzeuge/imprimerie/_ob/kleid/catgun-zeichen.svg" alt=""><b>${esc(weg.t)}</b><span class="papier__plus">${PFEIL_SVG}</span></span>`;
        const a = stueckKarte({}, nr++, [p], H0, weg.t, weg.info, 'Open');
        const lnk = document.createElement('a'); lnk.className = a.className + ' stueck--weg'; lnk.href = weg.url; lnk.style.cssText = a.style.cssText; while (a.firstChild) lnk.appendChild(a.firstChild);
        r.appendChild(lnk);
      }
      box.appendChild(r); DS.spaltenSetzen(r, c);
      requestAnimationFrame(() => reihen(r));
    });
    $('#hsNichts').hidden = zahl > 0;
  }
  async function hsAktion(akt, id) {
    const S = st();
    if (akt === 'kopie') { await S.oeffneStueck(id, { kopie: true }); zu(); return; }
    if (akt === 'pdf') {
      const gesp = S.alleDocs()['stueck-' + id];
      let doc = gesp; if (!doc) { const r = await fetch(DS.M.basis + 'stuecke/' + encodeURIComponent(id) + '.json', { cache: 'no-cache' }); if (!r.ok) return S.melde('This piece was not found.'); doc = await r.json(); }
      S.melde('Setting the PDF …', 60000);
      try { const { bytes } = await DS.pdf(DS.M, doc, { melde: t => S.melde(t, 60000) }); S.laden(new Blob([bytes], { type: 'application/pdf' }), 'the-cat-and-gun-' + id + '.pdf'); S.melde(`PDF saved: ${doc.seiten.length} ${doc.seiten.length === 1 ? 'page' : 'pages'}.`); }
      catch (e) { S.melde('Saving did not work: ' + e.message, 8000); }
    }
  }
  const ANSICHTEN = { stuecke: '#msStuecke', start: '#msStart', events: '#msEvents', abteilungen: '#msAbteilungen', hinweise: '#msHinweise', newsletter: '#msNewsletter', detail: '#msDetail', meine: '#msMeine', freigegeben: '#msFreigegeben', neu: '#msNeu', fotos: '#msFotos', marke: '#msMarke', livre: '#msLivre' };
  function waehleAnsicht(a) {
    if (a !== 'neu' && mitFoto) { mitFoto = null; zeigeMitFotoKopf(); }
    const zahl = sichtbareDocs().length + mailsLesen().length;   // Prüfung 4 Punkt 6: nur was «My designs» zeigt (Beispiele treten nach dem ersten Eigenen zurück)
    if (ansicht !== a) $('#start .ms-haupt').scrollTo({ top: 0 });
    ansicht = a;
    const nav = a === 'detail' ? detailVon : a;
    document.querySelectorAll('.ms-nav [data-ansicht]').forEach(b => b.classList.toggle('an', b.dataset.ansicht === nav));
    requestAnimationFrame(gleite);
    Object.entries(ANSICHTEN).forEach(([k, sel]) => { $(sel).hidden = k !== a; });
    if (a === 'fotos' || a === 'livre') zeichneFotos();
    if (a === 'fotos' && window.DSLivre) DSLivre.bilderZurueck();
    if (a === 'livre' && window.DSLivre) DSLivre.ansicht();
    if (a === 'events') zeichneEvents();
    if (a === 'abteilungen') zeichneAbteilungen();
    if (a === 'hinweise' || a === 'newsletter') zeichneListe(a);
    if (a === 'marke') zeichneMarke();
    if (a === 'freigegeben') zeichneFreigegeben();
    if (a === 'stuecke') zeichneStuecke();
    $('#startSuche').placeholder = innerWidth < 700 ? 'Search' : innerWidth < 1100 ? (a === 'neu' ? 'Search kinds …' : a === 'fotos' || a === 'livre' ? 'Search photos …' : 'Search designs …') : a === 'neu' ? 'Search kinds: beer mat, poster, story …' : a === 'fotos' || a === 'livre' ? 'Search photos: coffee, pool, juice …' : `Search your ${zahl} ${zahl === 1 ? 'design' : 'designs'} …`;
    filtern();
  }
  async function bibliothekAktion(akt, id, karte) {
    const S = st(), d = S.alleDocs()[id];
    if (akt === 'umbenennen') {
      const n = karte.querySelector('[data-name]');
      const f = document.createElement('input'); f.className = 'doc__umbenennen'; f.value = d.name; n.replaceWith(f); f.focus(); f.select();
      /* Abnahme 28.11.2026: Escape übernahm den getippten Namen doch, weil das Neuzeichnen das Feld entfernt und der Browser dabei «blur» meldet (speichert). Nur der erste Abschluss zählt. */
      let erledigt = false;
      const fertig = ok => { if (erledigt) return; erledigt = true; const v = f.value.trim(); if (ok && v) S.umbenennen(id, v); zeichneBibliothek(); filtern(); };
      f.addEventListener('keydown', e => { if (e.key === 'Enter') fertig(true); if (e.key === 'Escape') fertig(false); e.stopPropagation(); });
      f.addEventListener('blur', () => fertig(true)); f.addEventListener('click', e => e.stopPropagation());
    } else if (akt === 'kopie') { S.kopie(id); zeichneBibliothek(); filtern(); S.melde('Copy made.'); }
    else if (akt === 'freigeben') return freigabeDialog(id);
    else if (akt === 'loeschen') {
      const ja = await S.dialog(`<h2>Delete?</h2><p>«${esc(d.name)}» is removed from your designs.</p>`, [{ t: 'Keep', v: false }, { t: 'Delete', v: true, haupt: true }]);
      if (ja === true) { karte.classList.add('weg'); setTimeout(() => { S.loeschen(id); zeichneBibliothek(); waehleAnsicht(ansicht); }, 420); }
    } else if (akt === 'pdf') {
      S.melde('Setting the PDF …', 60000);
      try {
        const { bytes } = await DS.pdf(DS.M, d, {});
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
        a.download = (d.name || 'design').toLowerCase().replace(/[äöü]/g, c => ({ ä: 'ae', ö: 'oe', ü: 'ue' }[c])).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.pdf';
        document.body.appendChild(a); a.click(); a.remove(); S.melde('PDF saved.');
      } catch (e) { S.melde('The PDF did not work: ' + e.message, 6000); }
    }
  }

  /* ---------- Zweiter Schritt: Art gewählt. Oben beschreiben (fünf Entwürfe), darunter die 100 Vorlagen dieser Art ---------- */
  const BIB = {}; let IDX = null;   // geladene Vorlagen je Art
  async function ladeBibliothek(art) {
    if (BIB[art] !== undefined) return BIB[art];
    try { IDX = IDX || fetch(DS.M.basis + 'vorlagen/index.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : []).catch(() => []);
      const ein = (await IDX).find(x => x.art === art); if (!ein || ein.eingebaut) return (BIB[art] = null);   // Art ohne Bibliothek: keine Anfrage (404)
      const r = await fetch(DS.M.basis + 'vorlagen/' + art + '.json', { cache: 'no-cache' }); const v = r.ok ? (await r.json()).vorlagen : null; BIB[art] = v && v.length ? v : null; }
    catch (e) { BIB[art] = null; }
    return BIB[art];
  }
  /* Galerie (12.10.2026, rund 3000 Vorlagen im Haus): eine Art oder «Alle Vorlagen» über alle Arten, mit Suche und den Filtern Bereich, Grund, Art.
     Gezeichnet wird in Blöcken: nur die Treffer, zwölf Blätter je Block, der nächste Block kurz bevor man ihn erreicht. Die Vorschau eines Blatts wird erst
     gesetzt, wenn es ins Bild kommt und nicht mehr schnell gescrollt wird; Blöcke weit ausserhalb des Bilds werden geleert und halten nur ihre Höhe. */
  const ALLE = { key: 'alle', name: 'All templates', alle: true, format: 'a5h', formate: [], vorlagen: [] };
  const BEREICHE = KAT.BEREICHE || [];
  const PORTION = 12, TON = { dunkel: 'Black', hell: 'Paper', creme: 'White', dc: 'Red', gruen: 'Green' };
  let vFilter = { bereich: 'alle', ton: 'alle', art: 'alle', q: '' }, beobachter = null, fern = null, waechter = null, vAlle = [], vTreffer = [], vDa = 0, vLauf = 0;
  async function ladeAlle() {
    const arten = ARTEN.filter(a => !a.leer), listen = await Promise.all(arten.map(a => ladeBibliothek(a.key)));
    const ix = await IDX; arten.forEach((a, k) => { if (!listen[k] && (ix || []).some(x => x.art === a.key && x.eingebaut)) listen[k] = a.vorlagen.map(([v, t], i) => ({ id: a.key + i, titel: DS.VORLAGEN[v].name, bereich: '', vorlage: v, ton: t, inhalt: inhalt(a, v) })); });   // eingebaute Vorlagen zählen mit wie in index.json (127)
    const out = [], laengste = Math.max(0, ...listen.map(l => (l || []).length));
    for (let i = 0; i < laengste; i++) arten.forEach((a, k) => { const v = (listen[k] || [])[i]; if (v) out.push({ v, a }); });   // reihum, damit die erste Seite alle Arten zeigt
    return out;
  }
  const suchtext = x => {
    if (x.v._t) return x.v._t;
    const i = x.v.inhalt || {}, teile = [x.v.titel, x.v.bereich || '', x.a.name || '', TON[x.v.ton] || ''];
    Object.values(i).forEach(w => { if (typeof w === 'string') teile.push(w); else if (Array.isArray(w)) w.forEach(e => Object.values(e || {}).forEach(y => typeof y === 'string' && teile.push(y))); });
    return x.v._t = teile.join(' ').toLowerCase();
  };
  function zeigeWeg(key, umfang) {
    vUmfang = key === 'alle' && umfang ? umfang : null;
    wahl = key === 'alle' ? (vUmfang ? Object.assign({}, ALLE, { name: vUmfang.titel, satz: vUmfang.satz }) : ALLE) : mitGruppe(ARTEN.find(a => a.key === key)); fk = wahl.format; vFilter = { bereich: 'alle', ton: 'alle', art: 'alle', q: (vUmfang && vUmfang.q) || '' };
    $('#startWahl').hidden = true;
    const w = $('#startWeg'); w.hidden = false;
    const fOpt = wahl.formate.map(k => `<option value="${k}" ${k === fk ? 'selected' : ''}>${DS.FORMATE[k].name.replace(/ /g, '\u00a0')}\u00a0· ${DS.FORMATE[k].rund ? 'Ø ' + DS.FORMATE[k].b : DS.FORMATE[k].b + ' × ' + DS.FORMATE[k].h} mm</option>`).join('');
    w.innerHTML = `<button class="start__zurueck" data-st="zurueck"><svg viewBox="0 0 24 24"><path d="M19 12H5m6-6-6 6 6 6"/></svg>Back</button>${mitFotoKopf()}
      <div class="weg__kopf"><div><h1>${zus(wahl.name)}</h1><p class="start__satz">${wahl.satz ? esc(wahl.satz) : wahl.alle ? 'All templates of the house in one place. Search for a word or narrow it down by area, kind and ground.' : wahl.leer ? 'Choose a size, then start.' : 'Type a word to narrow the templates, or pick one below.'}</p></div>
        ${wahl.alle ? '' : `<label class="start__format">Size<select id="startFormat">${fOpt}</select></label>`}</div>
      ${wahl.leer || wahl.alle ? '' : `<div class="start__direkt start__direkt--weg">
        <span class="start__direkt-ic"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg></span>
        <textarea id="startAuftrag" rows="1" placeholder="${innerWidth < 1100 ? 'Type a word …' : 'For example: ' + esc(wahl.beispiel)}"></textarea>
        <button class="kn knopf--voll glanz-kn" data-st="entwerfen"><span>Find templates</span>${PFEIL}</button>
      </div><p class="start__fehler" id="startFehler" hidden></p>`}
      <div class="vb__kopf" id="vbKopf"></div>
      <div class="vb__liste" id="startVorlagen"></div>
      <p class="start__nichts" id="vbNichts" hidden>No template fits yet. Take back a filter or try another word.</p>`;
    zeichneVorlagen();
    $('#start .ms-haupt').scrollTo({ top: 0 });
    const sf = w.querySelector('#startFormat'); if (sf) sf.addEventListener('change', e => { fk = e.target.value; zeichneVorlagen(); });
    const ta = w.querySelector('#startAuftrag');
    if (ta) ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); entwirf(); } });
  }

  async function zeichneVorlagen() {
    const lauf = ++vLauf, box = $('#startVorlagen'), kopf = $('#vbKopf'); box.innerHTML = '';
    let liste;
    if (wahl.alle) { liste = await ladeAlle(); if (vUmfang) liste = liste.filter(x => (!vUmfang.bereiche || vUmfang.bereiche.includes(x.v.bereich)) && (!vUmfang.arten || vUmfang.arten.includes(x.a.key))); }
    else {
      const bib = wahl.leer ? null : await ladeBibliothek(wahl.key);
      liste = (bib ? bib : wahl.vorlagen.map(([v, t], i) => ({ id: 'v' + i, titel: DS.VORLAGEN[v].name, bereich: '', vorlage: v, ton: t, inhalt: inhalt(wahl, v) }))).map(v => ({ v, a: wahl }));
      for (const g of wahl.gruppe || []) { const ga = ARTEN.find(a => a.key === g), gb = await ladeBibliothek(g); if (ga) liste = liste.concat((gb || ga.vorlagen.map(([v, t], i) => ({ id: g + i, titel: DS.VORLAGEN[v].name, bereich: '', vorlage: v, ton: t, inhalt: inhalt(ga, v) }))).map(v => ({ v, a: ga }))); }   // K18: Nachbar-Arten dazu
    }
    if (lauf !== vLauf || !box.isConnected) return;
    if (mitFoto) liste = liste.filter(x => hatFotoStelle(x.v));
    vAlle = liste; vAlle.forEach(x => { x.fk = !wahl.alle && x.a.key !== wahl.key ? (DS.FORMATE[x.v.format] ? x.v.format : x.a.format) : !wahl.alle && fk !== wahl.format ? fk : (DS.FORMATE[x.v.format] ? x.v.format : wahl.alle ? x.a.format : fk); suchtext(x); });   // jede Vorlage in ihrem eigenen Format (29.10.)
    // Kopf: Zahl, Suche, dann Art (nur über alle Arten), Bereich, Grund
    const arten = {}; vAlle.forEach(x => arten[x.a.key] = (arten[x.a.key] || 0) + 1);
    kopf.innerHTML = wahl.leer ? '' : `<div class="vb__zeile"><h2><span id="vbHaus"></span>${vAlle.length === 1 ? 'One template' : vAlle.length.toLocaleString('en-GB') + ' templates'}</h2><span id="vbZahl"></span>
        <label class="start__suche vb__suche"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg><input type="search" id="vbSuche" placeholder="Search the templates …" value="${esc(vFilter.q)}"></label></div>
      <div class="vb__wahl">${wahl.alle ? `<label class="start__format vb__feld">Kind<select id="vbArt"><option value="alle">All kinds</option>${ARTEN.filter(a => arten[a.key]).map(a => `<option value="${a.key}">${esc(a.name)} · ${arten[a.key]}</option>`).join('')}</select></label>` : ''}
        <label class="start__format vb__feld">Area of the house<select id="vbBereich"></select></label>
        <div class="vb__toene">${[['alle', 'Any ground'], ['dunkel', 'Black'], ['hell', 'Paper'], ['creme', 'White'], ['dc', 'Red'], ['gruen', 'Green']].map(([k, t]) => `<button data-ton="${k}" class="${vFilter.ton === k ? 'an' : ''}">${t}</button>`).join('')}</div></div>`;
    zeichneBereiche();
    const su = kopf.querySelector('#vbSuche'); if (su) { let t; su.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { vFilter.q = su.value; filterVorlagen(); }, 140); }); }
    const sa = kopf.querySelector('#vbArt'); if (sa) sa.addEventListener('change', () => { vFilter.art = sa.value; zeichneBereiche(); filterVorlagen(); });
    const sb = kopf.querySelector('#vbBereich'); if (sb) sb.addEventListener('change', () => { vFilter.bereich = sb.value; filterVorlagen(); });
    filterVorlagen();
  }
  /* Liste der Bereiche mit Zahl, passend zur gewählten Art */
  function zeichneBereiche() {
    const sb = $('#vbBereich'); if (!sb) return;
    const z = {}; vAlle.forEach(x => { if (x.v.bereich && (vFilter.art === 'alle' || x.a.key === vFilter.art)) z[x.v.bereich] = (z[x.v.bereich] || 0) + 1; });
    const namen = [...BEREICHE.filter(b => z[b]), ...Object.keys(z).filter(b => !BEREICHE.includes(b))];
    if (vFilter.bereich !== 'alle' && !z[vFilter.bereich]) vFilter.bereich = 'alle';
    sb.innerHTML = `<option value="alle">All areas</option>` + namen.map(b => `<option value="${esc(b)}" ${vFilter.bereich === b ? 'selected' : ''}>${esc(b)} · ${z[b]}</option>`).join('');
    sb.closest('.vb__feld').hidden = !namen.length;
    if (sb._gw) sb._gw.k.querySelector('.hwahl-wert').textContent = sb.options[sb.selectedIndex].textContent;   // Liste im Hausstil (lib/auswahl.js) nachziehen
  }
  /* Treffer neu bestimmen und die Galerie von vorn zeichnen */
  function filterVorlagen() {
    const box = $('#startVorlagen'); if (!box) return;
    const W = vFilter.q.trim().toLowerCase().split(/\s+/).filter(Boolean), f = vFilter;
    vTreffer = vAlle.filter(x => (f.art === 'alle' || x.a.key === f.art) && (f.bereich === 'alle' || x.v.bereich === f.bereich) && (f.ton === 'alle' || x.v.ton === f.ton) && W.every(w => x.v._t.includes(w)));
    if (beobachter) beobachter.disconnect(); if (fern) fern.disconnect(); if (waechter) waechter.disconnect();
    box.innerHTML = ''; vDa = 0;
    /* Stücke des Hauses dieser Art ganz vorn (Robert 23.11.2026), dann «Blank page», wenn sie eine Reihe füllt, dann die Vorlagen; Spalten so, dass jede Reihe voll ist */
    const HS = hsFuerWahl(W), wsp = DS.spaltenWahl(HS.length + vTreffer.length, spalten(), { leer: !wahl.alle }), n = wsp.c, PORTION = n * Math.max(1, Math.round(12 / n));
    box.dataset.sp = n;
    const g = GROSS(n), haupt = $('#start .ms-haupt'), lauf = vLauf, fmt = fk;
    const platzhalter = (x, W2, H2) => { const p = document.createElement('span'); p.className = 'papier papier--vorn papier--warten' + (x.v.ton === 'dunkel' ? ' papier--marine' : ''); p.style.width = W2 + 'px'; p.style.height = H2 + 'px'; return p; };
    // Vorschau setzen: nur was gerade nah am Bild ist, das Neueste zuerst, in kleinen Portionen je Bild (höchstens ~6 ms) und nicht, solange schnell gescrollt wird
    const warte = [], vorrat = []; let pumpt = false, yZuletzt = haupt.scrollTop, tZuletzt = performance.now(), schnellBis = 0, stehtSeit = 0, tempoMittel = 0;
    /* Ein Schritt je Aufruf: erst der Satz (misst Text, das Teure), beim nächsten Mal der Aufbau. So teilt sich ein schweres Blatt auf zwei Bilder. */
    const setze = (b, auchFern) => {
      const x = b._x, platz = b.querySelector('.papier--warten'); if (!platz || !(b._nah || auchFern) || !b.isConnected) return false;
      const tz = window.__vbZeit && performance.now();
      try {
        const F = DS.FORMATE[x.fk], [W2, H2] = groesse(F, g, n);
        const vs = { vorlage: x.v.vorlage, ton: x.v.ton, inhalt: x.v.inhalt, stil: x.v.stil, foto: fotoSchl() }, fm = fotoSchl();
        const mach = () => ({ doc: { format: { b: F.b, h: F.h }, formatKey: x.fk, seiten: [x._s && x._sf === x.fk + '|' + (fm || '') ? x._s : DS.setze(DS.M, x.fk, x.v.vorlage, x.v.ton, x.v.inhalt, x.v.stil)] }, i: 0 });
        const fb = DS.VB && DS.VB.fertig(x.fk, vs, mach);
        if (fb) {   // fertiges Vorschaubild: kein Satz beim Scrollen (vorschaubild.js, 29.10.)
          const p = document.createElement('span'); p.className = 'papier papier--vorn'; p.style.width = W2 + 'px'; p.style.height = H2 + 'px';
          p.appendChild(fb); platz.replaceWith(p); b.classList.add('da'); return true;
        }
        if (!x._s || x._sf !== x.fk + '|' + fotoSchl()) {   // gesetzte Seite merken: beim Zurückscrollen wird nicht neu gemessen (je Format und Foto)
          x._s = DS.setze(DS.M, x.fk, x.v.vorlage, x.v.ton, x.v.inhalt, x.v.stil); x._sf = x.fk + '|' + fotoSchl();
          if (tz) window.__vbZeit.push(['satz', +(performance.now() - tz).toFixed(1)]);
          return b;   // Aufbau folgt im nächsten Schritt
        }
        const p = document.createElement('span'); p.className = 'papier papier--vorn'; p.style.width = W2 + 'px'; p.style.height = H2 + 'px';
        const doc = { format: { b: F.b, h: F.h }, formatKey: x.fk, seiten: [x._s] };
        p.appendChild(st().miniBox(doc, 0, Math.max(W2, H2) * (Math.max(F.b, F.h) + 2 * DS.B) / Math.max(F.b, F.h)));
        platz.replaceWith(p); b.classList.add('da'); if (DS.VB) DS.VB.spaeter(DS.VB.schluessel(x.fk, vs), () => ({ doc, i: 0 }), DS.VB.inhalt(x.fk, vs));
      } catch (e) { console.warn(e); }
      if (tz) window.__vbZeit.push(['aufbau', +(performance.now() - tz).toFixed(1)]);
      return true;
    };
    const pumpe = () => {
      if (lauf !== vLauf || fk !== fmt) { pumpt = false; return; }
      const jetzt = performance.now(), y = haupt.scrollTop, tempo = Math.abs(y - yZuletzt) / Math.max(1, jetzt - tZuletzt); yZuletzt = y; tZuletzt = jetzt;
      tempoMittel = tempoMittel * .8 + tempo * .2;   // geglättet: ein Mausrad scrollt in Stufen, einzelne Bilder springen weit
      if (tempoMittel > 2) schnellBis = jetzt + 140;   // schneller als rund 2000 px je Sekunde: die Blätter fliegen vorbei, Vorschauen kommen, sobald es ruhiger wird
      if (tempo > .02) stehtSeit = jetzt;
      if (jetzt > schnellBis) {
        // in Bewegung höchstens ein Schritt je Bild, im Stand bis ~6 ms
        do { const b = warte.pop(); if (!b) break; const r = setze(b); if (r === b) warte.push(b); } while (tempo <= .02 && performance.now() - jetzt < 6);
        // steht die Seite seit einem Moment, die Blätter der Blöcke davor und danach vorbereiten (ein Schritt je Bild), damit beim Weiterscrollen nichts mehr zu rechnen ist
        if (!warte.length && jetzt - stehtSeit > 260) { let b; while ((b = vorrat.pop()) && !(b.isConnected && !b.classList.contains('da'))); if (b) { const r = setze(b, true); if (r === b) vorrat.push(b); } }
      }
      if (warte.length || vorrat.length) requestAnimationFrame(pumpe); else pumpt = false;
    };
    const anwerfen = () => { if (!pumpt) { pumpt = true; requestAnimationFrame(pumpe); } };
    beobachter = new IntersectionObserver(es => {
      es.forEach(e => { e.target._nah = e.isIntersecting; if (e.isIntersecting && !e.target.classList.contains('da')) warte.push(e.target); });
      if (warte.length > 90) warte.splice(0, warte.length - 90);
      if (warte.length) anwerfen();
    }, { root: haupt, rootMargin: '500px 0px' });
    // Blöcke zu zwölf Blättern: jeder Block ist ein eigenes Raster; ist er weit weg, wird er geleert und hält nur seine Höhe (so bleibt die Seite auch bei 3000 Vorlagen leicht)
    const bloecke = new Map(), uhr = (name, fn) => (...a) => { if (!window.__vbZeit) return fn(...a); const t = performance.now(), r = fn(...a); window.__vbZeit.push([name, +(performance.now() - t).toFixed(1)]); return r; };
    const fuelle = uhr('fuellen', (el, wieder) => {
      const bl = bloecke.get(el); if (!bl || bl.voll) return;
      const teil = document.createDocumentFragment(), karten = [];
      if (bl.hs) bl.hs.forEach((id, k) => { const c = hsKarte(id, k, g, n, true); karten.push(c); });
      if (bl.leer) { const f0 = DS.FORMATE[fk], l = leerStueck({ leer: '1' }, f0, g, f0.name, n); l._H = groesse(f0, g, n)[1]; karten.push(l); }
      vTreffer.slice(bl.ab, bl.bis).forEach((x, k) => {
        const F = DS.FORMATE[x.fk], [W2, H2] = groesse(F, g, n);
        const b = stueckKarte({ vid: x.v.id }, bl.ab + k + 1, [platzhalter(x, W2, H2)], H2, x.v.titel, wahl.alle ? x.a.name + (x.v.bereich ? ' · ' + x.v.bereich : '') : (x.v.bereich ? x.v.bereich + ' · ' : '') + (TON[x.v.ton] || ''), 'Use', 'stueck--lazy');
        b._x = x; b._v = x.v; b._H = H2; karten.push(b); beobachter.observe(b);
      });
      // Reihen gleich hoch (über alle Arten stehen verschiedene Formate nebeneinander), ohne das Layout zu lesen
      for (let r = 0; r < karten.length; r += n) { const z = karten.slice(r, r + n), h = Math.max(...z.map(c => c._H || 0)); z.forEach(c => { c.querySelector('.stueck__buehne').style.height = Math.ceil(h + 36) + 'px'; teil.appendChild(c); }); }
      el.classList.toggle('vb__block--wieder', !!wieder); el.style.height = ''; el.appendChild(teil); bl.voll = true; if (el.isConnected) letzteReihe(el);
      for (let k = karten.length - 1; k >= 0; k--) if (karten[k]._x) vorrat.push(karten[k]);   // das oberste Blatt des Blocks kommt zuerst dran
      if (vorrat.length > 160) vorrat.splice(0, vorrat.length - 160);
      anwerfen();
    });
    const leere = uhr('leeren', el => {
      const bl = bloecke.get(el); if (!bl || !bl.voll) return;
      const h = el.offsetHeight; el.querySelectorAll('.stueck--lazy').forEach(k => beobachter.unobserve(k));
      el.textContent = ''; el.style.height = h + 'px'; bl.voll = false;
    });
    // Füllen und Leeren nie im Schwung: je Bild höchstens ein Block, der zuletzt gemeldete zuerst (wer nur vorbeifliegt, wird gar nicht erst gefüllt)
    const offen = []; let werkelt = false;
    const werk = () => {
      if (lauf !== vLauf) { werkelt = false; return; }
      let el; while ((el = offen.pop())) { const bl = bloecke.get(el); if (bl && bl.nah !== bl.voll) { bl.nah ? fuelle(el, true) : leere(el); break; } }
      if (offen.length) requestAnimationFrame(werk); else werkelt = false;
    };
    fern = new IntersectionObserver(es => {
      es.forEach(e => { const bl = bloecke.get(e.target); if (!bl) return; bl.nah = e.isIntersecting; if (bl.nah !== bl.voll) offen.push(e.target); });
      if (offen.length && !werkelt) { werkelt = true; requestAnimationFrame(werk); }
    }, { root: haupt, rootMargin: '2400px 0px' });
    const ende = document.createElement('i'); ende.className = 'vb__ende'; ende.setAttribute('aria-hidden', 'true');
    const mehr = () => {
      if (lauf !== vLauf || (vDa >= vTreffer.length && bloecke.size)) return;
      /* Prüfung 4 Punkt 4 (Fehlerbuch 10a, keine halb leeren Reihen): «Blank page» am Anfang einer Art nur, wenn die Vorlagen allein keine volle Reihe ergeben */
      const erster = !bloecke.size, leer = erster && wsp.leer, zahl = Math.max(0, PORTION - (leer ? 1 : 0) - (erster ? HS.length : 0));
      const el = document.createElement('div'); el.className = 'atelier wv vb__block';
      bloecke.set(el, { ab: vDa, bis: Math.min(vTreffer.length, vDa + zahl), leer, hs: erster && HS.length ? HS : null, voll: false, nah: true });
      vDa = Math.min(vTreffer.length, vDa + zahl);
      fuelle(el, false); box.insertBefore(el, ende.isConnected ? ende : null); if (!ende.isConnected) box.appendChild(ende); letzteReihe(el);
      fern.observe(el);
      if (vDa >= vTreffer.length) { waechter.disconnect(); ende.remove(); }
    };
    waechter = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { mehr(); if (vDa < vTreffer.length) { waechter.unobserve(ende); waechter.observe(ende); } } }, { root: haupt, rootMargin: '1600px 0px' });
    mehr(); if (ende.isConnected) waechter.observe(ende);
    const z = $('#vbZahl'); if (z) z.textContent = vTreffer.length === vAlle.length ? '' : `${vTreffer.length.toLocaleString('en-GB')} match`;
    const nix = $('#vbNichts'); if (nix) nix.hidden = vTreffer.length + HS.length > 0 || wahl.leer;
    const hz = $('#vbHaus'); if (hz) hz.textContent = HS.length ? (HS.length === 1 ? 'One piece of the house · ' : HS.length + ' pieces of the house · ') : '';
  }

  /* Bleibt die letzte Reihe eines Blocks trotzdem unvollständig (Suche, Filter, wenige Vorlagen), zieht sich die letzte Karte über die freie Breite.
     Spalten aus dem Raster selbst gelesen (Firefox mit Rollbalken kann anders umbrechen als die Schätzung). */
  function letzteReihe(el) {   // Robert 23.11.2026 («Table card» 3 + 2): keine gestreckte letzte Karte mehr, sondern eine Spaltenzahl, bei der jede Reihe voll ist
    const k = [...el.querySelectorAll(':scope > .stueck')]; k.forEach(x => { x.style.gridColumn = ''; x.classList.remove('stueck--breit'); });
    if (el.classList.contains('vb__block')) { const c = +(el.parentNode && el.parentNode.dataset.sp) || 0; if (c) DS.spaltenSetzen(el, c); return; }
    if (k.length) DS.spaltenSetzen(el, DS.spaltenWahl(k.length, spalten()).c);
  }
  addEventListener('resize', () => { clearTimeout(window.__dsLR); window.__dsLR = setTimeout(() => document.querySelectorAll('#startVorlagen .vb__block, #start .kv-buehne').forEach(b => { letzteReihe(b); if (b.classList.contains('kv-buehne')) reihen(b); }), 200); });

  function nimmVorlage(v, t) {
    const seiten = [{ vorlage: v, ton: t, inhalt: inhalt(wahl, v) }];
    if (wahl.rueck) seiten.push({ vorlage: wahl.rueck, ton: t, inhalt: DS.BEISPIEL[wahl.rueck] });
    st().oeffne(DS.dokument(DS.M, { name: wahl.name + ' · ' + DS.VORLAGEN[v].name, format: fk, seiten }));
    zu();
  }

  /* Ohne KI (CLAUDE.md «Grundgerüst ohne KI»): die Felder der Vorlage, in denen man beschrieb, was entstehen soll, suchen jetzt in den fertigen Vorlagen des Hauses */
  function entwirf() {
    const ta = $('#startAuftrag'), text = ta.value.trim();
    vFilter.q = text; const su = $('#vbSuche'); if (su) su.value = text;
    filterVorlagen();
  }
  async function entwirfFrei(text, umfang) {
    text = (text || $('#startDirekt').value).trim();
    if (!text) { const f = $('#startDirekt'); f.focus(); f.closest('.start__direkt').classList.add('wackel'); setTimeout(() => f.closest('.start__direkt').classList.remove('wackel'), 600); return; }
    const W = text.toLowerCase().split(/\s+/).filter(Boolean), l = await ladeAlle();
    const treffer = l.filter(x => W.every(w => (suchtext(x) + ' ' + (WORTE[x.a.key] || '')).includes(w)));
    // ein Wort, das eine Art nennt («beer mat», «chalkboard»): alle Vorlagen dieser Art
    const art = ARTEN.find(a => !a.leer && W.every(w => (a.name + ' ' + WORTE[a.key]).toLowerCase().includes(w)));
    if (!treffer.length && !art) { waehleAnsicht('neu'); $('#startDirekt').value = text; const f = $('#startDirektFehler'); f.hidden = false; return; }
    $('#startDirektFehler').hidden = true;
    if (!treffer.length && art) return zeigeWeg(art.key);
    zeigeWeg('alle', Object.assign({ titel: umfang ? umfang.titel : 'Templates for «' + text + '»', satz: 'Templates of the house with these words. Change the search below to look for something else.', q: '' }, umfang || {}));
    vFilter.q = text; const su = $('#vbSuche'); if (su) su.value = text; filterVorlagen();
  }

  /* Fünf Entwürfe zur Wahl (Robert 11.10.2026: «fünf verschiedene Entwürfe vom selben Plakat, dann wählt man und arbeitet darin»)
     Jeder Entwurf frei im Atelier, Vorder- und Rückseite gefächert; ein Klick öffnet ihn zum Bearbeiten. */
  let letzterText = '', entwuerfe = [];
  function blattDoc(doc, basis, kl, seite = 0, c) {
    const f = DS.blattF(doc, seite), maxW = Math.min(basis * 1.32, BREIT(c));
    let H = basis * Math.pow(f.h / 148, .6), W = H * f.b / f.h;
    if (W > maxW) { W = maxW; H = W * f.h / f.b; }
    const el = document.createElement('span'); el.className = 'papier ' + (kl || ''); el.style.width = W + 'px'; el.style.height = H + 'px';
    el.appendChild(st().miniBox(doc, seite, Math.max(W, H) * (Math.max(f.b, f.h) + 2 * DS.B) / Math.max(f.b, f.h)));
    return el;
  }
  let kontext = null;
  function zeigeEntwuerfe(r, text, k) {
    entwuerfe = r.docs; kontext = k;
    $('#startWahl').hidden = true;
    const w = $('#startWeg'); w.hidden = false;
    const f = DS.FORMATE[r.docs[0].formatKey] || DS.FORMATE.a5h;
    w.innerHTML = `<button class="start__zurueck" data-st="zurueckWeg"><svg viewBox="0 0 24 24"><path d="M19 12H5m6-6-6 6 6 6"/></svg>${esc(k.titel)}</button>
      <h1>${r.docs.length === 1 ? 'Your design' : r.docs.length + ' designs'}</h1>
      <p class="start__satz">«${esc(text)}» · ${esc(f.name)}. Pick the design you like best. Then you can change every text, photo and colour in it.</p>
      ${r.hinweise.length ? `<div class="start__hinweise"><b>Please check</b><ul>${r.hinweise.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
      <div class="atelier atelier--entwuerfe" id="startEntwuerfe"></div>
      <div class="start__nochmal"><button class="kn kn--klein kn--ohne" data-st="nochmal"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4"/></svg><span>New designs</span></button></div>`;
    const box = w.querySelector('#startEntwuerfe');
    r.docs.forEach((d, i) => {
      const b = document.createElement('button'); b.className = 'stueck stueck--entwurf'; b.dataset.entwurf = i;
      b.style.setProperty('--i', i); b.style.setProperty('--r', ([-1.4, 1.1, -.7, 1.6, -1, .8][i % 6]) + 'deg');
      const bu = document.createElement('span'); bu.className = 'stueck__buehne'; const sa = document.createElement('span'); sa.className = 'stueck__satz';
      if (d.seiten.length > 1) sa.appendChild(blattDoc(d, GROSS(), 'papier--hinten', 1));
      sa.appendChild(blattDoc(d, GROSS(), 'papier--vorn', 0)); bu.appendChild(sa); b.appendChild(bu);
      const q = d.seiten[0].quelle || {};
      b.insertAdjacentHTML('beforeend', `<b class="stueck__name">${esc(d.variante || 'Design ' + (i + 1))}</b><em class="stueck__format">${esc(DS.VORLAGEN[q.vorlage]?.name || '')} · ${{ dunkel: 'Black', hell: 'Paper', creme: 'White' }[q.ton] || ''}${d.seiten.length > 1 ? ' · ' + d.seiten.length + (DS.FORMATE[d.formatKey]?.digital ? ' images' : ' pages') : ''}</em><small class="stueck__satztext">Take this one</small>`);
      box.appendChild(b);
    });
    $('#start .ms-haupt').scrollTo({ top: 0 });
    requestAnimationFrame(() => reihen(box));
  }

  function zeige(a) {
    ansicht = a || 'start';
    const s = $('#start'); s.hidden = false; document.body.classList.add('startoffen');
    if (s.__gezeigt) s.classList.add('wieder'); else { s.__gezeigt = 1; s.classList.remove('an'); void s.offsetWidth; s.classList.add('an'); }
    $('#startZu').hidden = !(st().doc() && !st().doc().platzhalter);
    zeigeArten();
    if (!s.classList.contains('bereit')) bereitMachen(s);
  }
  /* In einem Zug (Robert 16.10.2026: «sieht erst kurz leer aus und lädt dann in zwei Stufen, die Bilder»): die Arbeitsfläche bleibt beim ersten Öffnen
     verborgen, bis alle Kacheln gesetzt und die Fotos der ersten Bildschirmhöhe geladen und dekodiert sind (höchstens 1,6 s), dann steht alles auf einmal da. */
  function bereitMachen(s) {
    const fertig = () => s.classList.add('bereit');
    Promise.resolve().then(() => new Promise(r => requestAnimationFrame(r))).then(() => {
      const h = innerHeight, urls = new Set();   // nur der erste Bildschirm (30.10.2026: mit 1,15 wartete der Start auf Kacheln, die danach unter den Rand rutschen)
      s.querySelectorAll('.ms-haupt .wo__bild, .ms-haupt img').forEach(e => {
        const q = e.getBoundingClientRect(); if (q.top > h || q.bottom < 0 || e.closest('[hidden]')) return;
        if (e.dataset.bg) { urls.add(e.dataset.bg); bgSetzen(e); return; }
        const m = e.tagName === 'IMG' ? [0, e.currentSrc || e.src] : /url\(["']?([^"')]+)/.exec(e.style.backgroundImage || '');
        if (m && m[1]) urls.add(m[1]);
      });
      return Promise.race([Promise.all([...urls].map(hole)), new Promise(r => setTimeout(r, 1600))]);
    }).then(fertig, fertig);
  }
  function zu() { $('#start').hidden = true; document.body.classList.remove('startoffen'); mitFoto = null; document.querySelectorAll('#start .mit-foto').forEach(x => x.remove()); }

  function frei() {
    const f = $('#startFrei'), t = f.value.trim();
    if (!t) { f.focus(); const w = f.closest('.ms-feld'); w.classList.add('wackel'); setTimeout(() => w.classList.remove('wackel'), 600); return; }
    f.value = ''; entwirfFrei(t);
  }
  function los() {
    const s = $('#start'); bgWache();
    $('#kapitelZeichen').innerHTML = DS.zeichenSvg(DS.M, 'currentColor');
    s.addEventListener('click', e => {
      const a = e.target.closest('[data-art]'); if (a) return zeigeWeg(a.dataset.art);
      const an = e.target.closest('[data-ansicht]'); if (an) { $('#startSuche').value = ''; if ($('#startWahl').hidden) zeigeArten(); return waehleAnsicht(an.dataset.ansicht); }
      const ak = e.target.closest('[data-akt]');
      if (ak && ak.dataset.akt === 'neu') { $('#startSuche').value = ''; if (!$('#startWahl').hidden) waehleAnsicht('neu'); else { zeigeArten(); waehleAnsicht('neu'); } return $('#startDirekt').focus(); }
      const um = e.target.closest('[data-umfang]'); if (um) return zeigeUmfang(um.dataset.umfang);
      const ev = e.target.closest('[data-event]'); if (ev) return zeigeDetailBereit('event', ev.dataset.event);
      const abt = e.target.closest('[data-abteilung]'); if (abt) return zeigeDetailBereit('abteilung', abt.dataset.abteilung);
      const kv = e.target.closest('[data-kv]'); if (kv) return nimmVorlageKv(+kv.dataset.kv);
      const hs = e.target.closest('[data-stueck]');
      if (hs) { const ha = e.target.closest('[data-hsakt]'); if (ha) { e.stopPropagation(); hsAktion(ha.dataset.hsakt, hs.dataset.stueck); return; } st().oeffneStueck(hs.dataset.stueck).then(d => { if (d) zu(); }); return; }
      const ef = e.target.closest('[data-efilter]');
      if (ef) { evFilter = ef.dataset.efilter; document.querySelectorAll('[data-efilter]').forEach(x => x.classList.toggle('an', x === ef)); return zeichneEvents(); }
      const fg = e.target.closest('[data-fgruppe]');
      if (fg) { fotoGruppe = fg.dataset.fgruppe; document.querySelectorAll('#fotoGruppen [data-fgruppe]').forEach(x => x.classList.toggle('an', x === fg)); return filtern(); }
      const fx = e.target.closest('[data-fs],[data-ff],[data-fh]');
      if (fx) { const k = fx.dataset.fs !== undefined ? 's' : fx.dataset.ff !== undefined ? 'f' : 'h'; fotoF[k] = fx.dataset['f' + k]; document.querySelectorAll(`#fotoGruppen [data-f${k}]`).forEach(x => x.classList.toggle('an', x === fx)); return filtern(); }
      const af = e.target.closest('[data-ausfoto]');
      if (af) { mitFoto = af.dataset.ausfoto; mitAusschnitt = null; ansicht = 'neu'; $('#startSuche').value = ''; gruppe = 'alle'; zeigeArten(); $('#start .ms-haupt').scrollTo({ top: 0 }); return; }
      if (e.target.closest('#startHilfe')) return $('#btnHilfe').click();
      const mak = e.target.closest('[data-makt]'); if (mak) { e.stopPropagation(); const k = mak.closest('[data-mail]'); return mailAktion(mak.dataset.makt, k.dataset.mail, k); }
      if (ak) { e.stopPropagation(); const k = ak.closest('[data-doc]'); return bibliothekAktion(ak.dataset.akt, k.dataset.doc, k); }
      if (e.target.closest('.doc__umbenennen')) return;
      const d = e.target.closest('[data-doc]'); if (d) {
        let doc = st().alleDocs()[d.dataset.doc];
        if (istBeispiel(doc)) { doc = JSON.parse(JSON.stringify(doc)); delete doc.beispiel; delete doc.freigabe; doc.id = 'd' + Date.now().toString(36); doc.name = doc.name.replace(/^(Beispiel|Example) · /, ''); doc.geaendert = Date.now(); }
        st().oeffne(doc); return zu();
      }
      const ma = e.target.closest('[data-mail]'); if (ma) { location.href = 'mail.html?mail=' + encodeURIComponent(ma.dataset.mail); return; }
      const b = e.target.closest('[data-st]');
      if (b && b.dataset.st === 'ohneFoto') { mitFoto = null; if (!$('#startWeg').hidden && wahl) { const m = document.querySelector('#startWeg > .mit-foto'); if (m) m.remove(); return zeichneVorlagen(); } return zeigeArten(); }
      if (b && b.dataset.st === 'zurueck') return zeigeArten();
      if (b && b.dataset.st === 'alle') return zeigeWeg('alle');
      if (b && b.dataset.st === 'entwerfen') return entwirf();
      if (b && b.dataset.st === 'zurueckWeg') return kontext && kontext.zurueck();
      if (b && b.dataset.st === 'nochmal') return kontext && kontext.nochmal();
      if (b && b.dataset.st === 'direkt') return entwirfFrei();
      if (b && b.dataset.st === 'frei') return frei();
      if (b && b.dataset.st === 'kfrei') { const t = $('#kampFrei').value.trim(); if (!t) { $('#kampFrei').focus(); return; } return entwirfFrei(t); }
      const en = e.target.closest('[data-entwurf]');
      if (en) { const d = entwuerfe[+en.dataset.entwurf]; d.name = d.name + (d.variante ? ' · ' + d.variante : ''); st().oeffne(d); st().zeigeHinweise(d.hinweise); zu(); return; }
      const ft = e.target.closest('.vb__toene [data-ton]'); if (ft) { vFilter.ton = ft.dataset.ton; document.querySelectorAll('.vb__toene [data-ton]').forEach(x => x.classList.toggle('an', x === ft)); return filterVorlagen(); }
      const v = e.target.closest('#startVorlagen [data-vid],#startVorlagen [data-leer]');
      if (v) {
        if (v.dataset.leer) { st().oeffne(st().leer(fk)); return zu(); }
        const x = v._v, art = (v._x && v._x.a) || wahl, seiten = [{ vorlage: x.vorlage, ton: x.ton, inhalt: x.inhalt, stil: x.stil }];
        const rueck = x.rueck || (art.rueck ? { vorlage: art.rueck, inhalt: DS.BEISPIEL[art.rueck] } : null);
        if (rueck) seiten.push({ vorlage: rueck.vorlage, ton: x.ton, inhalt: rueck.inhalt, stil: x.stil });
        st().oeffne(DS.dokument(DS.M, { name: x.titel.startsWith(art.name + ' · ') ? x.titel : art.name + ' · ' + x.titel, format: (v._x && v._x.fk) || fk, seiten })); return zu();
      }
    });
    $('#startZu').addEventListener('click', zu);
    let su; $('#startSuche').addEventListener('input', () => {
      if ($('#startWahl').hidden) zeigeArten();
      if (!['meine', 'neu', 'fotos', 'livre', 'stuecke'].includes(ansicht)) { const v = $('#startSuche').value; waehleAnsicht('meine'); $('#startSuche').value = v; }
      clearTimeout(su); su = setTimeout(filtern, 120); });
    addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && !$('#start').hidden) { e.preventDefault(); $('#startSuche').focus(); } });
    $('#startGruppen').addEventListener('click', e => { const b = e.target.closest('[data-gruppe]'); if (!b) return; gruppe = b.dataset.gruppe; zeichneGruppen(); filtern(); });
    $('#btnNeu').addEventListener('click', () => zeige());
    $('#start').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('[data-doc],[data-mail]')) e.target.click(); });
    const q = new URLSearchParams(location.search);
    $('#startDirekt').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); entwirfFrei(); } });
    $('#startFrei').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); frei(); } });
    $('#start').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('[data-event],[data-abteilung],[data-kv],[data-art],[data-vid],[data-leer],[data-entwurf],[data-stueck]')) e.target.click(); });
    s.addEventListener('pointermove', kippen);
    /* Beim Scrollen reagiert keine Kachel auf die Maus (Robert 16.10.2026: «hakelig»): sonst wechseln Licht, Schatten und Neigung bei jeder
       Kachel, die unter dem stehenden Zeiger vorbeizieht. Die Kinder der Fläche lassen Zeiger durch, die Fläche selbst scrollt weiter. */
    const haupt = s.querySelector('.ms-haupt'); let scT = 0;
    if (haupt) haupt.addEventListener('scroll', () => { if (!s.classList.contains('scrollt')) { s.classList.add('scrollt'); if (kippt) { loese(kippt); kippt = null; } } clearTimeout(scT); scT = setTimeout(() => s.classList.remove('scrollt'), 180); }, { passive: true });
    s.addEventListener('pointerleave', () => { if (kippt) loese(kippt); kippt = null; });
    $('#msKopfZeichen').innerHTML = DS.zeichenSvg(DS.M, 'currentColor');
    addEventListener('resize', () => { if (!s.hidden) gleite(); });
    const stk = q.get('stueck'), stkOffen = stk && st().doc() && (st().doc().stueck === stk);   // ?stueck=<id>: das Stück steht schon im Editor (studio.js), keine Startseite davor
    if (stkOffen) zu();
    else if (!q.has('demo') && q.get('hilfe') !== 'fuehrung') { zeige();   /* Nachbesserung 23.11.2026 (Prüfung Punkt 3): die Hilfe (?hilfe=video) liegt über der Startseite, nicht über einem leeren Editor */ if (q.has('foto')) ausLivre(q);
      /* Von den Drucksachen hinüber (?art=<Art>, Robert 23.11.2026): gleich die Vorlagen dieser Art zeigen, dort öffnet ein Klick den Editor */
      else if (q.get('art') && ARTEN.some(a => a.key === q.get('art') && !a.leer)) { zeigeWeg(q.get('art')); history.replaceState(null, '', location.pathname); }
      else if (q.get('bereich') && K.ABTEILUNGEN.some(a => a.k === q.get('bereich'))) { zeigeDetail('abteilung', q.get('bereich')); }   /* ?bereich=pool: ein Bereich direkt (Prüfung Punkt 40 über alle Bereiche) */ }   // jedes Öffnen beginnt auf der Startseite mit der Bibliothek (Robert 12.10.2026); aus Le Livre mit dem Foto

    document.documentElement.classList.remove('start-gleich');
  }
  /* Aus Le Livre hinüber (?foto=<key>&art=insta|story&x=&y=): fünf Gestaltungen mit diesem Foto und dem Ausschnitt aus Le Livre,
     sofort und ohne KI; «Fünf neue Entwürfe» lässt danach die KI Texte dazu schreiben. */
  /* Aus dem Brand book hinüber (?foto=<key>&art=insta|story&x=&y=): «Post in Print & feed» zeigt die Vorlagen für einen Instagram-Beitrag, «Story in Print & feed»
     die für eine Story, jeweils mit diesem Foto und dem im Brand book gewählten Ausschnitt (Abnahme 28.11.2026: vorher nur das Foto, beide Knöpfe landeten in
     «Kinds and templates», der Ausschnitt stand auf Mitte). Ohne «art» wie bisher alle Arten mit diesem Foto. */
  function ausLivre(q) {
    const k = q.get('foto'); if (!DS.M.bildIndex[k]) return false;
    window.__dsAusLivre = true;   // fuehrung.js: keine Begrüssung über einer Übergabe
    const zahl = v => { const n = parseFloat(v); return isFinite(n) ? Math.min(1, Math.max(0, n)) : .5; };
    mitFoto = k; mitAusschnitt = { foto: k, fx: zahl(q.get('x')), fy: zahl(q.get('y')) };
    const art = { insta: 'instagram', post: 'instagram', instagram: 'instagram', story: 'story' }[q.get('art')];
    history.replaceState(null, '', location.pathname);
    waehleAnsicht('neu'); zeigeArten();
    if (art && ARTEN.some(a => a.key === art && !a.leer)) zeigeWeg(art);
    return true;
  }
  /* Auswahl aus fünf Entwürfen auch vom Studio aus (Feld «Entwerfen» links) */
  function auswahl(r, text, nochmal) { zeige(); zeigeEntwuerfe(r, text, { titel: 'Back to Print & feed', zurueck: () => zu(), nochmal }); $('#startZu').hidden = false; }
  window.DSStart = { zeige, zu, auswahl, offen: () => !$('#start').hidden, entwuerfe: () => entwuerfe };
  if (window.DSStudio) los(); else document.addEventListener('ds:bereit', los, { once: true });
})();
