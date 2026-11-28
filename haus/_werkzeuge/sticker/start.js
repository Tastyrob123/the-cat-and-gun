/* Sticker editor · Übersicht (#start): Aufbau wie start.js der Vorlage (Seitenleiste mit Gleiter, Kopf mit Suche ⌘K, Ansichten mit Bühne,
   Kacheln .wo, Karten .stueck). Ansichten für diesen Fall (AUFTRAG): Übersicht, Bereiche (Sticker-Arten des Hauses), Alle Sticker (Galerie:
   Favorit nach vorn, nach hinten stellen, suchen, nach Bereich filtern), Neu aus einer Form, Druckdateien, Elemente des Fundus, Farben & Schriften. */
(function () {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)], esc = SK.esc;
  const PFEIL = '<svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>', PLUS = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';
  const IA = {
    fav: '<svg viewBox="0 0 24 24"><path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>',
    hinten: '<svg viewBox="0 0 24 24"><path d="M12 5v13m-5-5 5 5 5-5"/></svg>',
    kopie: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
    pdf: '<svg viewBox="0 0 24 24"><path d="M12 4v11m-5-5 5 5 5-5"/><path d="M5 20h14"/></svg>',
    loeschen: '<svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/></svg>'
  };
  /* Foto je Ansicht und Bereich: nur Fotos des Hauses (website/assets/bild, Register im Fundus) */
  const FOTO = { msStart: 'b24', msArten: 'b09', msGalerie: 'b08', msDruck: 'b29', msElemente: 'b35', msFarben: 'b27', msNeu: 'b36' };
  const BFOTO = { haus: 'b30', pool: 'b21', karte: 'b16', juices: 'b13', rund: 'b19', kueche: 'b28', fotos: 'b14', bier: 'b27', kaffee: 'b26', flaschen: 'b36', saetze: 'b31' };   // je Bereich ein eigenes Foto (26.11.2026: sechs Bereiche zeigten dasselbe b24)
  const foto = (k, w = 800) => `/the-cat-and-gun/haus/assets/bild/${k}-${w}.webp`;
  const ANSICHTEN = { start: '#msStart', bereiche: '#msArten', detail: '#msDetail', galerie: '#msGalerie', druck: '#msDruck', elemente: '#msElemente', farben: '#msFarben', neu: '#msNeu' };
  let BEREICHE = [], ansicht = 'start', detailVon = '', filter = 'alle', neuBereich = '';

  const st = () => SKA.A.arbeit || { sticker: [], galerie: { fav: [], hinten: [] } };
  const bereichName = id => (BEREICHE.find(b => b.id === id) || {}).name || '';
  function mini(d, max, idz) {
    const f = d.form, k = Math.min(max / f.b, max / f.h), w = Math.round(f.b * k), h = Math.round(f.h * k);
    return `<span class="sk-mini" style="width:${w}px;height:${h}px">${SK.svg(d, { idz: idz || ('m' + d.id) })}</span>`;
  }
  const zeit = t => { if (!t) return 'from the house'; const s = (Date.now() - t) / 1000; return s < 90 ? 'just now' : s < 3600 ? Math.round(s / 60) + ' min ago' : s < 86400 ? Math.round(s / 3600) + ' h ago' : new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); };
  function karte(d, i, opt = {}) {
    const g = st().galerie || { fav: [], hinten: [] }, fav = g.fav.includes(d.id), hi = g.hinten.includes(d.id);
    const live = SKA.veroeffentlicht().find(x => x.id === d.id), stand = !live ? 'not published' : SKA.gleich(live, d) ? 'published' : 'changed';
    const groesse = opt.gross ? 150 : 118;
    return `<div class="stueck stueck--vorlage stueck--doc sk-karte${fav ? ' sk-fav' : ''}${hi ? ' sk-hinten' : ''}" data-doc="${esc(d.id)}" role="button" tabindex="0" style="--i:${Math.min(i, 8)};--r:${[-1.2, 1, -.6, 1.4, -1, .8][i % 6]}deg" aria-label="${esc(d.name)}">
      <span class="stueck__buehne" style="height:${groesse + 36}px"><span class="stueck__satz">${mini(d, groesse, 'k' + i + d.id)}</span>${fav ? `<span class="sk-stern" title="Favourite">${IA.fav}</span>` : ''}</span>
      <b class="zl__name">${esc(d.name || 'Sticker')}</b><em class="stueck__format">${esc(bereichName(d.bereich))} · ${esc(SK.FORMEN[d.form.art] ? SK.FORMEN[d.form.art].name.toLowerCase() : 'shape')} ${Math.round(d.form.b)}${d.form.art === 'kreis' ? ' mm' : ' × ' + Math.round(d.form.h) + ' mm'} · <span class="sk-stand sk-stand--${stand.replace(' ', '-')}">${stand}</span></em>
      ${opt.aktionen === false ? '' : `<span class="doc__aktionen sk-aktionen">${[['fav', fav ? 'Not a favourite' : 'Favourite: to the front'], ['hinten', hi ? 'Back to normal' : 'Less important: to the back'], ['kopie', 'Make a copy'], ['pdf', 'PDF for the printer'], ['loeschen', 'Delete']].map(([k, t]) => `<button data-akt="${k}" class="${(k === 'fav' && fav) || (k === 'hinten' && hi) ? 'an' : ''}" title="${t}" aria-label="${t}">${IA[k]}</button>`).join('')}</span>`}
    </div>`;
  }
  function neuKarte(i, bereich) {
    return `<button class="stueck stueck--vorlage sk-karte sk-neu" data-akt="neu"${bereich ? ` data-bereich="${esc(bereich)}"` : ''} style="--i:${Math.min(i, 8)}"><span class="stueck__buehne" style="height:154px"><span class="stueck__satz"><span class="papier papier--plus sk-plus"><span class="papier__plus">${PLUS}</span></span></span></span><b class="zl__name">New sticker</b><em class="stueck__format">Pick a shape or a template</em></button>`;
  }
  function kachel(b, i) {
    const l = st().sticker.filter(s => s.bereich === b.id);
    const art = BEREICHE.length % 3 === 2 && i < 2 ? 'wo--halb' : BEREICHE.length % 3 === 1 && i < 4 ? 'wo--halb' : 'wo--drittel';
    return `<div class="wo sk-wo ${art}" data-bereich-k="${esc(b.id)}" role="button" tabindex="0" style="--i:${i}" aria-label="${esc(b.name)}">
      <span class="wo__k"><span class="wo__bild" style="background-image:url('${foto(BFOTO[b.id] || 'b24')}')"></span><span class="wo__licht"></span><span class="sk-wo__sticker">${l.slice(0, 3).map((s, j) => mini(s, 64, 'w' + i + j)).join('')}</span></span>
      <span class="wo__n"><span><b>${esc(b.name)}</b><small>${l.length === 1 ? 'One sticker' : l.length + ' stickers'}</small></span><i>${PFEIL}</i></span></div>`;
  }

  /* ---------- Ansichten ---------- */
  function zeichneStart() {
    const l = SKA.reihe(), n = l.length, h = new Date().getHours();
    $('#msGruss').textContent = window.WO ? WO.gruss() : (h < 11 ? 'Good morning.' : h < 18 ? 'Good afternoon.' : 'Good evening.');
    $('#msSatz').textContent = `${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} · Stickers of the house, ready to change and print.`;
    $('#msAlle').querySelector('span').textContent = `See all ${n} stickers in ${BEREICHE.length} areas`;
    $('#startBereiche').innerHTML = BEREICHE.map(kachel).join('');
    const zuletzt = l.slice(0, 7);
    $('#startZuletzt').innerHTML = zuletzt.map((d, i) => karte(d, i, { aktionen: true })).join('') + neuKarte(zuletzt.length);
  }
  function zeichneBereiche() { $('#bereichListe').innerHTML = BEREICHE.map(kachel).join(''); }
  function zeichneDetail(id) {
    const b = BEREICHE.find(x => x.id === id); if (!b) return;
    const l = SKA.reihe().filter(s => s.bereich === id);
    $('#msDetail').innerHTML = `<div class="ms-titel"><h1>${esc(b.name)}</h1><span class="ms-leise">${esc(b.satz)}</span></div>
      <div class="ms-zeile"><button class="ms-lnk" data-ansicht="bereiche"><svg viewBox="0 0 24 24" style="transform:scaleX(-1)"><path d="M5 12h14m-6-6 6 6-6 6"/></svg><span>All areas</span></button><a class="ms-lnk" href="/the-cat-and-gun/haus/drucksachen/sticker/${esc(b.pdf)}" target="_blank" rel="noopener"><span>Print file as printed until now</span>${PFEIL}</a></div>
      <p class="ms-leise sk-format">${esc(b.format)} · ${esc(b.wozu)}</p>
      <div class="ms-raster">${l.map((d, i) => karte(d, i)).join('')}${neuKarte(l.length, id)}</div>`;
  }
  function zeichneGalerie() {
    const l = SKA.reihe(), g = st().galerie;
    $('#galerieSatz').textContent = `${l.length} stickers. Favourites stand in front, less important ones at the back. Tap the star or the arrow on a sticker.`;
    $('#galerieFilter').innerHTML = [['alle', 'All'], ['fav', 'Favourites'], ...BEREICHE.map(b => [b.id, b.name])].map(([k, t]) => `<button data-filter="${esc(k)}" class="${filter === k ? 'an' : ''}">${esc(t)}</button>`).join('');
    const q = ($('#startSuche').value || '').trim().toLowerCase();
    const sicht = l.filter(d => (filter === 'alle' || (filter === 'fav' ? g.fav.includes(d.id) : d.bereich === filter)) && (!q || suchText(d).includes(q)));
    $('#galerie').innerHTML = sicht.map((d, i) => karte(d, i)).join('') + (q ? '' : neuKarte(sicht.length, BEREICHE.some(b => b.id === filter) ? filter : ''));
    $('#startNichts').hidden = !!sicht.length || !q;
  }
  const suchText = d => [d.name, bereichName(d.bereich), ...(d.ebenen || []).map(e => e.text || e.name || '')].join(' ').toLowerCase();
  async function zeichneDruck() {
    const live = SKA.veroeffentlicht();
    let idx = {}; const dl = await SKA.druckListe(); if (dl) dl.sticker.forEach(x => idx[x.id] = x);
    const mit = live.filter(s => idx[s.id]);
    const arbeit = st().sticker, geaendert = id => { const a = arbeit.find(x => x.id === id), l = live.find(x => x.id === id); return !a || !SKA.gleich(a, l); };
    $('#druckListe').innerHTML = (mit.length ? `<div class="ms-zeile"><h2>Published from the Sticker editor</h2><span class="ms-leise">${mit.length} print files</span></div>
      <div class="sk-druckliste">${mit.map((s, i) => `<div class="sk-druck" style="--i:${Math.min(i, 8)}">${mini(s, 64, 'd' + i)}<span><b>${esc(s.name)}</b><small>${esc(bereichName(s.bereich))} · ${Math.round(s.form.b)}${s.form.art === 'kreis' ? ' mm' : ' × ' + Math.round(s.form.h) + ' mm'} + 3 mm bleed${geaendert(s.id) ? ' · <em>changed since, publish to update</em>' : ''}</small></span><a class="sk-l-kn sk-l-kn--leicht" href="/the-cat-and-gun/haus/drucksachen/sticker/editor/${esc(idx[s.id].pdf)}" download="${esc(SKDruck.dateiname(s))}.pdf">Download PDF</a></div>`).join('')}</div>`
      : `<p class="ms-leise sk-leerhinweis">Nothing is published from the Sticker editor yet. After «Publish», every sticker is here as a PDF for the printer. Until then, these are the print files of the house:</p>`)
      + `<div class="ms-zeile"><h2>Print files of the house until now</h2></div><div class="sk-druckliste">${BEREICHE.map((b, i) => { const s = arbeit.find(x => x.bereich === b.id); return `<div class="sk-druck" style="--i:${Math.min(i, 8)}">${s ? mini(s, 64, 'dh' + i) : ''}<span><b>${esc(b.name)}</b><small>${esc(b.format)}</small></span><a class="sk-l-kn sk-l-kn--leicht" href="/the-cat-and-gun/haus/drucksachen/sticker/${esc(b.pdf)}" download>Download PDF</a></div>`; }).join('')}</div>`;
    $('#druckZahl').textContent = mit.length;
  }
  async function zeichneElemente(ziel, klein) {
    const l = Fundus.elemente({}).filter(e => e.art === 'zeichen' || e.id === 'ball');
    const svgs = await Promise.all(l.map(e => Fundus.element(e.id).catch(() => '')));
    const alle = st().sticker;
    ziel.innerHTML = l.map((e, i) => {
      const wo = SK.woSchon('el:' + e.id, alle), s = `<img alt="" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgs[i])}">`;
      return `<button class="${klein ? 'sk-element' : 'stueck stueck--vorlage sk-karte'}" data-element="${esc(e.id)}" style="--i:${Math.min(i, 8)}">${klein ? `<span class="sk-element__bild">${s}</span><b>${esc(e.name)}</b><small>${wo.length ? 'on ' + wo.length + ' sticker' + (wo.length > 1 ? 's' : '') : 'not used yet'}</small>`
        : `<span class="stueck__buehne" style="height:150px"><span class="stueck__satz"><span class="sk-mini sk-mini--el">${s}</span></span></span><b class="zl__name">${esc(e.name)}</b><em class="stueck__format">${wo.length ? 'Already on ' + wo.slice(0, 2).map(x => esc(x.name)).join(', ') + (wo.length > 2 ? ' and ' + (wo.length - 2) + ' more' : '') : 'Not on a sticker yet'}</em>`}</button>`;
    }).join('') + (klein ? '' : `<p class="ms-leise sk-leerhinweis">Patterns are not in the brand book yet. When they are added there, they appear here.</p>`);
    $('#elementZahl').textContent = l.length;
  }
  function farbFeld(f) { return `<button class="sk-farbfeld" data-kopier="${esc(f.wert)}" title="Copy ${esc(f.wert)}"><span style="background:${esc(f.wert)}"></span><b>${esc(f.name)}</b><small>${esc(String(f.wert).toUpperCase())}</small></button>`; }
  function zeichneFarben(ziel, kurz) {
    const w = Fundus.welten().filter(x => kurz ? x.id !== 'website' : true);
    ziel.innerHTML = w.map(x => `<div class="sk-welt"><h3>${esc(x.name)}</h3>${kurz ? '' : `<p class="ms-leise">${esc(x.satz || '')}</p>`}<div class="sk-farbfelder">${Fundus.farben({ welt: x.id }).map(farbFeld).join('')}</div></div>`).join('')
      + (kurz ? '' : `<div class="sk-welt"><h3>Fonts</h3><div class="sk-schriftproben">${Fundus.schriften().map(s => `<div class="sk-probe"><span style="font-family:'${esc(s.familie || s.name)}'">${esc(s.probe || 'The Cat & Gun')}</span><small>${esc(s.name)} · ${esc(s.wo || '')}</small></div>`).join('')}</div>
        <p class="ms-leise">Colours and fonts are changed in the <a href="${esc((window.WO_HAUS && WO_HAUS.wege.markeneditor) || '/the-cat-and-gun/haus/_werkzeuge/markenbuch-editor/')}" target="_blank" rel="noopener">Brand book editor</a>. Every sticker follows.</p></div>`);
  }
  function zeichneNeu() {
    const b0 = neuBereich || (BEREICHE[0] || {}).id;
    $('#neuBereich').innerHTML = `<span class="sk-chips-titel">Area</span>` + BEREICHE.map(b => `<button data-neubereich="${esc(b.id)}" class="${b.id === b0 ? 'an' : ''}">${esc(b.name)}</button>`).join('');
    $('#arten').innerHTML = Object.entries(SK.FORMEN).map(([k, F], i) => { const d = SK.vorlage(k, { titel: 'Your words', zeile: k === 'streifen' ? '' : 'Catangnan · Siargao' }); return `<button class="stueck stueck--vorlage sk-karte" data-form="${k}" style="--i:${i}"><span class="stueck__buehne" style="height:160px"><span class="stueck__satz">${mini(d, 124, 'n' + k)}</span></span><b class="zl__name">${esc(F.name)}</b><em class="stueck__format">${F.b}${k === 'kreis' ? ' mm' : ' × ' + F.h + ' mm'}</em><small class="stueck__satztext stueck__nimm">Start</small></button>`; }).join('');
    const haus = st().sticker.filter(s => s.herkunft === 'haus' && (!neuBereich || s.bereich === neuBereich));
    $('#neuVorlagen').innerHTML = haus.map((d, i) => `<button class="stueck stueck--vorlage sk-karte" data-vorlage="${esc(d.id)}" style="--i:${Math.min(i, 8)}"><span class="stueck__buehne" style="height:150px"><span class="stueck__satz">${mini(d, 112, 'nv' + i)}</span></span><b class="zl__name">${esc(d.name)}</b><em class="stueck__format">${esc(bereichName(d.bereich))}</em><small class="stueck__satztext stueck__nimm">Copy and change</small></button>`).join('');
  }
  /* Reiter im Editor: Vorlagen und Elemente */
  function zeichneVorlagenTab() {
    const sel = $('#vorlageBereich'), b0 = sel.dataset.gewaehlt ? sel.value : (sel.value || (SKEditor.doc() && SKEditor.doc().bereich) || '');   // Abnahme 28.11.2026: «All areas» bleibt gewählt (sprang auf den Bereich des Stickers zurück)
    sel.innerHTML = `<option value="">All areas</option>` + BEREICHE.map(b => `<option value="${esc(b.id)}" ${b.id === b0 ? 'selected' : ''}>${esc(b.name)}</option>`).join('');
    const haus = st().sticker.filter(s => s.herkunft === 'haus' && (!b0 || s.bereich === b0));
    $('#vorlagen').innerHTML = Object.entries(SK.FORMEN).map(([k, F]) => `<button class="sk-vorlage" data-form="${k}">${mini(SK.vorlage(k, { titel: 'Words', zeile: '' }), 70, 'tv' + k)}<span><b>${esc(F.name)}</b><small>Empty, ${F.b}${k === 'kreis' ? ' mm' : ' × ' + F.h + ' mm'}</small></span></button>`).join('')
      + haus.map((d, i) => `<button class="sk-vorlage" data-vorlage="${esc(d.id)}">${mini(d, 70, 'th' + i)}<span><b>${esc(d.name)}</b><small>${esc(bereichName(d.bereich))}</small></span></button>`).join('');
  }
  function zeichneElementeTab() { zeichneElemente($('#elemente'), true); zeichneFarben($('#elementeFarben'), true); }

  /* ---------- Neu anlegen ---------- */
  function anlegen(d, hinweis) {
    SKA.aendere(a => { a.sticker.unshift(d); });
    zu(); SKEditor.oeffne(d.id); SKEditor.zeigeTab('einfach');
    const m = SKEditor.motivHinweis(d);
    if (hinweis || m) SKEditor.melde(hinweis || 'Some parts of this sticker are already on other stickers. The list «Also on other stickers» on the left shows where.', { ms: 9000 });
  }
  /* Neue Sticker bekommen eindeutige Namen (sonst nennt die Motiv-Meldung «New round sticker, New round sticker, …») */
  function neuerName(grund) { const da = new Set(st().sticker.map(s => s.name)); if (!da.has(grund)) return grund; let i = 2; while (da.has(grund + ' ' + i)) i++; return grund + ' ' + i; }
  function neuAusForm(k, bereich) { const d = SK.vorlage(k, { bereich: bereich || neuBereich || (BEREICHE[0] || {}).id, titel: '', zeile: '', name: neuerName('New ' + SK.FORMEN[k].name.toLowerCase() + ' sticker') }); anlegen(d); setTimeout(() => { const t = document.querySelector('[data-schnelltext]'); if (t) t.focus(); }, 80); }
  function neuAusVorlage(id, bereich) {
    const v = st().sticker.find(s => s.id === id); if (!v) return;
    const d = SKA.kopie(v); d.id = SK.neueId('s'); d.name = neuerName(v.name + ' (new)'); d.herkunft = 'neu'; d.geaendert = Date.now(); delete d.vorbild; if (bereich) d.bereich = bereich;
    d.ebenen.forEach(e => e.id = SK.neueId());
    const wo = [v, ...SK.woSchon([...SK.motive(v)][0] || '', st().sticker, v.id)].filter(Boolean);
    anlegen(d, `Started from «${v.name}». Its words and signs are already on ${wo.length} sticker${wo.length > 1 ? 's' : ''}: change them so motifs do not repeat too often.`);
  }
  function kopieAnlegen(id) { const v = st().sticker.find(s => s.id === id); if (!v) return; const d = SKA.kopie(v); d.id = SK.neueId('s'); d.name = neuerName(v.name + ' (copy)'); d.herkunft = v.herkunft === 'haus' ? 'kopie' : v.herkunft; d.geaendert = Date.now(); d.ebenen.forEach(e => e.id = SK.neueId()); SKA.aendere(a => { const i = a.sticker.findIndex(s => s.id === id); a.sticker.splice(i + 1, 0, d); }); SKEditor.melde(`Copy made: «${d.name}». Save to keep it.`); neuZeichnen(); }
  function galerieAktion(akt, id) {
    if (akt === 'fav' || akt === 'hinten') {
      SKA.aendere(a => { const g = a.galerie = a.galerie || { fav: [], hinten: [] }, l = g[akt], an = l.includes(id); g.fav = g.fav.filter(x => x !== id); g.hinten = g.hinten.filter(x => x !== id); if (!an) g[akt].unshift(id); });
      neuZeichnen(); return;
    }
    if (akt === 'kopie') return kopieAnlegen(id);
    if (akt === 'loeschen') return SKEditor.loeschen(id).then(() => neuZeichnen());
    if (akt === 'pdf') { const d = st().sticker.find(s => s.id === id); if (!d) return; SKEditor.melde('The PDF is being made …', { ms: 20000 }); SKDruck.pdf(d).then(b => { SKDruck.herunterladen(new Blob([b], { type: 'application/pdf' }), SKDruck.dateiname(d) + '.pdf'); SKEditor.melde('PDF saved: 3 mm bleed, cut line, fonts embedded.'); }, e => SKEditor.melde('PRINT · ' + e.message, { fehler: true })); }
  }

  /* ---------- Wechsel, Suche ---------- */
  function gleite() { const nav = $('#msNav'), an = nav.querySelector('button.an'), g = nav.querySelector('.ms-gleiter'); if (!an) { g.style.opacity = 0; return; } g.style.opacity = 1; g.style.height = an.offsetHeight + 'px'; g.style.transform = `translateY(${an.offsetTop}px)`; }
  function waehleAnsicht(a, arg) {
    if (!ANSICHTEN[a]) a = 'start';
    if (ansicht !== a) $('#start .ms-haupt').scrollTo({ top: 0 });
    ansicht = a; if (a === 'detail') detailVon = arg || detailVon;
    try { if (a !== 'detail') localStorage.setItem('catgun-sticker-ansicht', a); } catch (e) { }
    $$('.ms-nav [data-ansicht]').forEach(b => b.classList.toggle('an', b.dataset.ansicht === (a === 'detail' ? 'bereiche' : a)));
    requestAnimationFrame(gleite);
    Object.entries(ANSICHTEN).forEach(([k, s]) => { $(s).hidden = k !== a; });
    $('#startNichts').hidden = true;
    if (a === 'start') zeichneStart(); if (a === 'bereiche') zeichneBereiche(); if (a === 'detail') zeichneDetail(detailVon); if (a === 'galerie') zeichneGalerie();
    if (a === 'druck') zeichneDruck(); if (a === 'elemente') zeichneElemente($('#elementRaster')); if (a === 'farben') zeichneFarben($('#farbSeite')); if (a === 'neu') zeichneNeu();
    $('#start').classList.remove('leiste-auf'); $('#msBereiche').setAttribute('aria-expanded', 'false');
    zaehler();
  }
  /* Zahl der Druckdateien im Rand (R06): gleich beim Start und nach jedem Veröffentlichen, nicht erst in der Ansicht */
  async function druckZaehlen() { const live = SKA.veroeffentlicht(); let dl = null; try { dl = await SKA.druckListe(); } catch (e) { } const ids = new Set(((dl && dl.sticker) || []).map(x => x.id)); $('#druckZahl').textContent = live.filter(s => ids.has(s.id)).length; }
  function zaehler() { $('#galerieZahl').textContent = st().sticker.length; $('#bereichZahl').textContent = BEREICHE.length; try { $('#elementZahl').textContent = Fundus.elemente({}).filter(e => e.art === 'zeichen' || e.id === 'ball').length; } catch (e) { } }   // Zahl der Elemente gleich beim Start (Prüfung 22.11.2026, Punkt 3)
  function neuZeichnen() { waehleAnsicht(ansicht, detailVon); }
  function zeige(a, arg) {
    SKEditor.textFertig && SKEditor.textFertig();
    const s = $('#start'); s.hidden = false; document.body.classList.add('startoffen');
    $('#startZu').hidden = $('#startZuFach').hidden = !SKEditor.doc();
    waehleAnsicht(a || ansicht, arg);
  }
  function zu() { $('#start').hidden = true; document.body.classList.remove('startoffen'); document.documentElement.classList.remove('start-gleich'); }
  function oeffneSticker(id) { if (SKEditor.oeffne(id)) zu(); }

  function los() {
    const s = $('#start');
    $('#kapitelZeichen').innerHTML = '<img src="/the-cat-and-gun/haus/_werkzeuge/sticker/_ob/kleid/catgun-zeichen.svg" alt="">';
    $('#msKopfZeichen').innerHTML = '<img src="/the-cat-and-gun/haus/_werkzeuge/sticker/_ob/kleid/catgun-zeichen.svg" alt="">';
    if (window.WO_HAUS) { $('#zumMarkenbuch').href = WO_HAUS.wege.marke; $$('.ms-wege a[data-weg]').forEach(a => a.href = a.dataset.weg === 'website' ? (location.port ? '/website/' : '/') : WO_HAUS.wege[a.dataset.weg]); }
    s.addEventListener('click', e => {
      if (e.target.closest('a[href]') && !e.target.closest('[data-oeffne]')) return;
      const ak = e.target.closest('[data-akt]');
      if (ak && ak.dataset.akt !== 'neu') { e.stopPropagation(); const k = ak.closest('[data-doc]'); return k && galerieAktion(ak.dataset.akt, k.dataset.doc); }
      if (ak) { if (ak.dataset.bereich) neuBereich = ak.dataset.bereich; return waehleAnsicht('neu'); }
      const an = e.target.closest('[data-ansicht]'); if (an) { $('#startSuche').value = ''; return waehleAnsicht(an.dataset.ansicht); }
      const bk = e.target.closest('[data-bereich-k]'); if (bk) return waehleAnsicht('detail', bk.dataset.bereichK);
      const fi = e.target.closest('[data-filter]'); if (fi) { filter = fi.dataset.filter; return zeichneGalerie(); }
      const nb = e.target.closest('[data-neubereich]'); if (nb) { neuBereich = nb.dataset.neubereich; return zeichneNeu(); }
      const fo = e.target.closest('[data-form]'); if (fo) return neuAusForm(fo.dataset.form);
      const vo = e.target.closest('[data-vorlage]'); if (vo) return neuAusVorlage(vo.dataset.vorlage, neuBereich);
      const el = e.target.closest('[data-element]'); if (el) return elementWahl(el.dataset.element);
      const ko = e.target.closest('[data-kopier]'); if (ko) { navigator.clipboard && navigator.clipboard.writeText(ko.dataset.kopier).catch(() => { }); return SKEditor.melde('Colour value copied: ' + ko.dataset.kopier.toUpperCase()); }
      const d = e.target.closest('[data-doc]'); if (d) return oeffneSticker(d.dataset.doc);
      if (e.target.closest('#startHilfe')) return $('#btnHilfe').click();
    });
    s.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('[data-doc],[data-bereich-k]')) e.target.click(); });
    $('#startZu').addEventListener('click', zu);
    $('#startZuFach').addEventListener('click', e => { e.stopPropagation(); s.classList.remove('leiste-auf'); zu(); });
    /* Am Handy steht «Back to the sticker» im Fach (Knopf ☰), damit das Suchfeld im Kopf so breit bleibt wie in der Vorlage */
    const platz = matchMedia('(max-width:900px)'), sucheText = () => { $('#startSuche').placeholder = platz.matches ? 'Search' : 'Search stickers …'; };
    sucheText(); platz.addEventListener ? platz.addEventListener('change', sucheText) : platz.addListener(sucheText);
    $('#msBereiche').addEventListener('click', e => { e.stopPropagation(); const o = !s.classList.contains('leiste-auf'); s.classList.toggle('leiste-auf', o); $('#msBereiche').setAttribute('aria-expanded', o); });
    s.addEventListener('click', e => { if (s.classList.contains('leiste-auf') && !e.target.closest('.ms-leiste') && !e.target.closest('#msBereiche')) { s.classList.remove('leiste-auf'); $('#msBereiche').setAttribute('aria-expanded', 'false'); } }, true);
    $('#startSuche').addEventListener('input', () => { if (ansicht !== 'galerie') { filter = 'alle'; waehleAnsicht('galerie'); } else zeichneGalerie(); });
    document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if ($('#start').hidden) zeige('galerie'); $('#startSuche').focus(); } });
    $('#vorlageBereich').addEventListener('change', e => { e.target.dataset.gewaehlt = '1'; zeichneVorlagenTab(); });
    $('#vorlagen').addEventListener('click', async e => {
      const b = e.target.closest('[data-form],[data-vorlage]'); if (!b) return;
      const ok = await SKEditor.dialog('<h2>Start a new sticker?</h2><p class="leise">Your open sticker stays as it is. The new one opens next to it in the gallery.</p>', [{ t: 'Not now', v: false, abbruch: true }, { t: 'Start', v: true, haupt: true }]);
      if (!ok) return;
      const ber = $('#vorlageBereich').value || (SKEditor.doc() && SKEditor.doc().bereich);
      if (b.dataset.form) neuAusForm(b.dataset.form, ber); else neuAusVorlage(b.dataset.vorlage, ber);
    });
    $('#elemente').addEventListener('click', e => { const b = e.target.closest('[data-element]'); if (b) SKEditor.elementEinsetzen(b.dataset.element); });
    /* Abnahme 28.11.2026: die Farbfelder im Reiter «Elements» heissen «Copy #…», taten aber nichts. Sie kopieren jetzt den Wert wie in «Colours & fonts». */
    $('#elementeFarben').addEventListener('click', e => { const ko = e.target.closest('[data-kopier]'); if (!ko) return; navigator.clipboard && navigator.clipboard.writeText(ko.dataset.kopier).catch(() => { }); SKEditor.melde('Colour value copied: ' + ko.dataset.kopier.toUpperCase()); });
    SKA.beiAenderung(art => { if (art === 'veroeffentlicht' || art === 'zurueckgeholt' || art === 'verworfen' || art === 'geladen') druckZaehlen(); if (!$('#start').hidden && art !== 'arbeit') neuZeichnen(); else if (!$('#start').hidden) zaehler(); });
    addEventListener('resize', () => requestAnimationFrame(gleite));
  }
  async function elementWahl(id) {
    const offen = SKEditor.doc(), e = Fundus.elemente({}).find(x => x.id === id);
    const a = await SKEditor.dialog(`<h2>${esc(e ? e.name : id)}</h2><p class="leise">Put it on a sticker.</p>`, [{ t: 'Not now', v: false, abbruch: true }, ...(offen ? [{ t: `On «${offen.name}»`, v: 'offen' }] : []), { t: 'On a new round sticker', v: 'neu', haupt: true }]);
    if (a === 'offen') { zu(); await SKEditor.elementEinsetzen(id); }
    if (a === 'neu') { const d = SK.vorlage('kreis', { bereich: neuBereich || 'haus', titel: '', zeile: '', name: neuerName('New sticker with ' + (e ? e.name.toLowerCase() : id)) }); d.ebenen = d.ebenen.filter(x => x.typ !== 'text'); anlegen(d); await SKEditor.elementEinsetzen(id); }
  }

  /* ---------- Start des Werkzeugs ---------- */
  async function start() {
    los(); SKEditor.los();
    try {
      const [b] = await Promise.all([fetch('bereiche.json?v=4b4fecbf').then(r => r.json()), Fundus.laden()]);
      BEREICHE = b.bereiche; Fundus.schriftenLaden();
      try { await SKA.laden(BEREICHE); } catch (e1) { await new Promise(r => setTimeout(r, 900)); await SKA.laden(BEREICHE); }   // einmal neu versuchen (Server beim ersten Einlesen beschäftigt)
      await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]);
    } catch (e) {
      console.error(e);
      document.querySelector('#leisteText').textContent = 'Not loaded';
      SKEditor.melde((e.text || e.message || String(e)).replace(/^([A-Z]+) · /, '$1 · ') || 'START · The stickers did not load.', { fehler: true, ms: 60000 });
      SKStart.bereit = true; $('#start').classList.add('bereit'); return;
    }
    druckZaehlen();
    if (SKA.A.wiederhergestellt) SKEditor.melde('Your unsaved changes from last time are back. Save them, or undo with «Earlier versions».', { ms: 12000 });
    Fundus.beiAenderung(() => { SKEditor.zeichneAlles(); if (!$('#start').hidden) neuZeichnen(); });
    const q = new URLSearchParams(location.search);
    let a = 'start'; try { a = localStorage.getItem('catgun-sticker-ansicht') || 'start'; } catch (e) { }
    if (q.has('von') || q.get('ansicht') === 'start') a = 'start';
    if (q.get('ansicht') && ANSICHTEN[q.get('ansicht')]) a = q.get('ansicht');
    const offen = q.get('sticker');
    if (offen && SKEditor.oeffne(offen)) { zu(); }
    /* Von den Drucksachen hinüber (?stueck=sticker2, Robert 23.11.2026): die Sticker dieses Stücks zeigen, ein Klick öffnet den Editor */
    /* Mac 23.11.2026/24.11.2026 (bearbeiten.json, Drucksachen «Edit» je Sticker): ?stueck=<Stück>&teil=<Name> öffnet genau diesen Sticker im Editor.
       Ohne teil der erste Sticker des Stücks. Name unbekannt: der Bogen des Stücks mit allen Stickern zur Wahl. Läuft erst, wenn Stand und Fundus geladen sind,
       und fängt jeden Fehler ab (Robert 24.11.2026: «… die Seite ist abgestürzt»): im Zweifel der Bogen, nie eine leere Seite. */
    else if (q.get('stueck') && BEREICHE.some(b => b.gruppe === q.get('stueck'))) {
      const b = BEREICHE.find(x => x.gruppe === q.get('stueck'));
      try {
        const teil = String(q.get('teil') || '').trim().toLowerCase(), hid = x => 'h-' + (x.element ? x.element.replace(/^sticker-/, '') : x.id);
        const name = x => String(x.bild || '').replace(/^.*\//, '').replace(/\.webp$/, '').replace(new RegExp('^' + b.gruppe + '-'), '').toLowerCase();
        const da = id => (SKA.A.arbeit && SKA.A.arbeit.sticker || []).find(s => s.id === id);
        let ziel = null;
        if (teil) { const g = b.sticker.find(x => name(x) === teil || hid(x) === 'h-' + teil || (x.element || '') === 'sticker-' + teil || (x.element || '') === 'sticker-saft-' + teil); ziel = g ? da(hid(g)) : null; }
        else ziel = b.sticker.map(x => da(hid(x))).find(Boolean);
        if (ziel && SKEditor.oeffne(ziel.id)) zu();
        else { zeige('detail', b.id); if (teil) SKEditor.melde('This sticker was not found. Choose one of the stickers of «' + b.name + '».', { ms: 8000 }); }
      } catch (e) { console.warn('Sticker öffnen', e); try { zeige('detail', b.id); } catch (x) { zeige('start'); } }
    }
    else { const erst = SKA.reihe()[0]; if (erst) SKEditor.oeffne(erst.id); zeige(a); }
    SKStart.bereit = true;
    /* Abnahme 28.11.2026: Braucht der Start länger als 15 s (langsames Netz), stand die Tafel «The Sticker editor does not start» über dem fertig
       geladenen Werkzeug und ging nicht mehr weg. Ist der Start geschafft, wird sie ausgeblendet. */
    $$('.startfehler').forEach(x => { x.hidden = true; x.style.display = 'none'; });
    requestAnimationFrame(() => { $('#start').classList.add('bereit'); document.documentElement.classList.remove('start-gleich'); });
    SKEditor.leiste();
  }
  window.SKStart = { zeige, zu, bereiche: () => BEREICHE, neuZeichnen, zeichneVorlagenTab, zeichneElementeTab, bereit: false };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
