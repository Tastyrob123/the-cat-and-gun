/* L’Imprimerie · Le Livre im Haus (Robert 12.10.2026: «von L’Imprimerie aus auf Le Livre zugreifen, ich arbeite ja mit meinen Visuals in L’Imprimerie»).
   1. Startseite: eigener Punkt «Le Livre» (und runde Taste oben) mit Bildarchiv, Logo und Dateien, Farben zum Kopieren.
   2. Editor: Fach «Le Livre» neben den Werkzeugen. Foto, Logo, Wortmarke, Zeichen, Tapete per Klick einsetzen oder aufs Blatt ziehen;
      Farbe per Klick auf das gewählte Element (sonst auf den Grund der Seite).
   3. «Mit dem Markenbuch prüfen»: die Seite als Bild an die Markenprüfung von Le Livre (../livre/api/pruefen), Ergebnis neben dem Blatt.
   Daten: DS.M.livre (satz.js lädt ../livre/livre.json). Ohne Le Livre bleibt alles verborgen. */
(function () {
  const DS = window.DS;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const S = () => window.DSStudio;
  const T = () => DS.LIVRE_TEXT;
  const TYP = 'application/x-ds-livre';
  const IC = {
    buch: '<svg viewBox="0 0 24 24"><path d="M4 5.5c2.6-1 5.2-.8 8 1 2.8-1.8 5.4-2 8-1v13c-2.6-1-5.2-.8-8 1-2.8-1.8-5.4-2-8-1z"/><path d="M12 6.5v13"/></svg>',
    zu: '<svg viewBox="0 0 24 24"><path d="M9 14.5 4 9.5l5-5M4 9.5h11a5 5 0 0 1 0 10h-3"/></svg>',
    pruef: '<svg viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 4.4 3 8.3 7 10 4-1.7 7-5.6 7-10V6z"/><path d="m9 12 2.2 2.2L15.5 10"/></svg>',
    kopie: '<svg viewBox="0 0 24 24"><rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/></svg>',
    ab: '<svg viewBox="0 0 24 24"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>',
    pfeil: '<svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
  };
  const ZEICHEN_N = { gold: 'Gold', taupe: 'Taupe', tinte: 'Ink', weiss: 'White' };
  const NAME = { zeichen: 'Mark', wortmarke: 'Wordmark', logo: 'Logo', quer: 'Logo, landscape', tapete: 'Pattern' };
  const L = () => DS.M && DS.M.livre;
  async function kopiere(t) { try { await navigator.clipboard.writeText(t); } catch (e) { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); } }
  const melde = (t, ms) => S() && S().melde(t, ms);

  /* ================= Startseite: Le Livre als eigene Ansicht ================= */
  let reiter = 'bilder';
  function ansicht() {
    const box = $('#msLivre'); if (!box || !L()) return;
    if (!box.dataset.gebaut) {
      box.dataset.gebaut = 1;
      box.innerHTML = `<div class="ms-titel"><h1>Brand book</h1><span class="ms-leise">The brand book of the house, here in Print &amp; feed: photos, the wordmark and colours. It is the same source the brand book editor keeps.</span></div>
        <div class="ll-kopf"><div class="ms-chips ll-reiter">${[['bilder', 'Photos'], ['dateien', 'Wordmark and files'], ['farben', 'Colours']].map(([k, t]) => `<button data-llreiter="${k}">${t}</button>`).join('')}</div>
          <a class="ms-lnk" href="${DS.livreSeite()}" target="_blank" rel="noopener"><span>Open the brand book</span>${IC.pfeil}</a></div>
        <div class="ll-fach" data-llfach="bilder"><div id="llBilderPlatz"></div></div>
        <div class="ll-fach" data-llfach="dateien">${dateienHtml()}</div>
        <div class="ll-fach" data-llfach="farben"><p class="ms-leise ll-satz">A click copies the colour value. In the editor, the brand kit puts the colour straight on the part you picked.</p><div class="ll-farben">${L().farben.map((c, i) => `<button class="ll-farbe" data-hex="${c.h}" style="--i:${i}"><i style="background:${c.h}"></i><b>${esc(c.n)}</b><code>${esc(c.h)}</code><small>${esc(c.r || '')}</small><span class="ll-kopiert">Copied</span></button>`).join('')}</div></div>`;
      box.addEventListener('click', klickAnsicht);
    }
    zeigeReiter(reiter);
  }
  function dateienHtml() {
    return `<p class="ms-leise ll-satz">To download as SVG, for the printer. In the editor, the brand kit puts the wordmark and the marks straight on the page.</p>
      <div class="ll-dateien">${L().dateien.filter(d => d.var && d.var.length).map(d => d.var.map(v => {
        const svg = v.dateien.find(x => x.endsWith('.svg')), png = v.dateien.find(x => x.endsWith('.png')), webp = v.dateien.find(x => x.endsWith('.webp'));
        const bild = !(svg || png || webp) ? `<span class="ll-d__f ll-d__f--${v.grund}"><em class="ll-d__art">${esc(v.dateien[0].split('.').pop().toUpperCase())}</em></span>` : d.k === 'tapete' ? `<span class="ll-d__f ll-d__f--${v.grund}" style="background-image:url('${DS.livreUrl('dateien/')}${webp || png}')"></span>` : `<span class="ll-d__f ll-d__f--${v.grund}"><img src="${DS.livreUrl('dateien/')}${svg || png}" alt="" loading="lazy" decoding="async"></span>`;
        return `<figure class="ll-d">${bild}<figcaption><b>${esc(d.n || NAME[d.k] || d.k)}</b><small>SVG</small>
          <span class="ll-d__l">${v.dateien.map(x => `<a href="${DS.livreUrl('dateien/' + x)}" download>${x.split('.').pop().toUpperCase()}${IC.ab}</a>`).join('')}</span></figcaption></figure>`;
      }).join('')).join('')}</div>`;
  }
  function zeigeReiter(k) {
    reiter = k;
    $$('#msLivre [data-llreiter]').forEach(b => b.classList.toggle('an', b.dataset.llreiter === k));
    $$('#msLivre [data-llfach]').forEach(f => f.hidden = f.dataset.llfach !== k);
    const platz = $('#llBilderPlatz');
    if (k === 'bilder' && platz && !platz.contains($('#fotoRaster'))) { platz.appendChild($('#fotoGruppen')); platz.appendChild($('#fotoRaster')); }
  }
  // Das Bildarchiv ist dasselbe Raster wie «Fotos des Hauses»: es wird nur hin- und hergereicht, nie doppelt gebaut
  function bilderZurueck() { const z = $('#msFotos'); if (z && !z.contains($('#fotoRaster'))) { z.appendChild($('#fotoGruppen')); z.appendChild($('#fotoRaster')); } }
  async function klickAnsicht(e) {
    const r = e.target.closest('[data-llreiter]'); if (r) return zeigeReiter(r.dataset.llreiter);
    const f = e.target.closest('[data-hex]');
    if (f) { await kopiere(f.dataset.hex); f.classList.add('kopiert'); setTimeout(() => f.classList.remove('kopiert'), 1400); melde(`${f.querySelector('b').textContent} ${f.dataset.hex} copied.`); }
  }

  /* ================= Editor: Fach «Le Livre» neben den Werkzeugen ================= */
  let fach = null, fachReiter = 'fotos', fGruppe = 'alle', fHerkunft = 'alle';
  function fachAuf(an) {
    if (!L()) return;
    if (an === undefined) an = !fach || fach.hidden;
    if (!fach) baueFach();
    fach.hidden = !an;
    $$('[data-livre]').forEach(b => b.classList.toggle('an', an));
    if (an) { requestAnimationFrame(() => fach.classList.add('auf')); zeichneFach(); } else fach.classList.remove('auf');
  }
  function baueFach() {
    fach = document.createElement('aside'); fach.className = 'lf'; fach.hidden = true; fach.setAttribute('aria-label', 'Brand kit');
    fach.innerHTML = `<div class="lf__kopf"><span class="lf__z">${DS.zeichenSvg(DS.M, 'currentColor')}</span><div><b>Brand kit</b><small>Click to place, drag to drop</small></div><button class="rund rund--klein" data-lf="zu" aria-label="Close the brand kit">${IC.zu}</button></div>
      <div class="segment segment--klein lf__reiter">${[['fotos', 'Photos'], ['marke', 'Marks & elements'], ['farben', 'Colours']].map(([k, t]) => `<button data-lfreiter="${k}">${t}</button>`).join('')}</div>
      <div class="lf__in" id="lfIn"></div>
`;
    $('.studio').appendChild(fach);   // liegt über der linken Spalte, das Blatt bleibt frei
    fach.addEventListener('click', klickFach);
    fach.addEventListener('input', e => { if (e.target.id === 'lfSuche') { clearTimeout(fach._t); fach._t = setTimeout(zeichneFotos, 140); } });
    fach.addEventListener('dragstart', e => {
      const q = e.target.closest('[data-zieh]'); if (!q) return;
      e.dataTransfer.setData(TYP, q.dataset.zieh); e.dataTransfer.effectAllowed = 'copy';
      const img = q.querySelector('img'); if (img) e.dataTransfer.setDragImage(img, img.width / 2, img.height / 2);
    });
  }
  function zeichneFach() {
    $$('.lf [data-lfreiter]').forEach(b => b.classList.toggle('an', b.dataset.lfreiter === fachReiter));
    const box = $('#lfIn'), M = DS.M;
    if (fachReiter === 'fotos') {
      const B = M.bilder.filter(b => !b.eigen), gr = Object.entries(T().b).filter(([, g]) => B.some(b => b.gruppe === g));
      box.innerHTML = `<input type="search" id="lfSuche" placeholder="Search: coffee, pool, juice …" autocomplete="off">
        <div class="lf__chips">${[['alle', 'All'], ...gr.map(([, g]) => [g, g])].map(([k, t]) => `<button data-lfgruppe="${esc(k)}" class="${fGruppe === k ? 'an' : ''}">${esc(t)}</button>`).join('')}</div>
        
        <div class="lf__fotos" id="lfFotos"></div>`;
      zeichneFotos();
    } else if (fachReiter === 'marke') {
      /* The Cat & Gun: Zeichen als Vektor (z 1–3), Elemente des Markenfundus, Fischgrät als Muster */
      const FE = (M.fundus ? M.fundus.elemente : []).filter(e => e.art !== 'zeichen' && DS.zumGestalten(e)), ZN = M.zeichennamen || {};
      box.innerHTML = `<h4>Marks</h4><div class="lf__marke lf__marke--breit">${[1, 2, 3].filter(z => z === 1 || M['zeichen' + z]).map(z => `<button class="lf__m lf__m--hell" data-lfzeichen="${z}" draggable="true" data-zieh='${JSON.stringify({ art: 'zeichen', z })}' title="${esc(ZN[z] || '')}"><span class="lf__svg">${DS.zeichenSvg(M, M.farben.tinte, z === 1 ? null : { z })}</span><small>${esc(ZN[z] || '')}</small></button>`).join('')}</div>
        <h4>Elements</h4><div class="lf__marke">${FE.map(e => `<button class="lf__m lf__m--hell" data-lfelement="${esc(e.id)}" draggable="true" data-zieh='${JSON.stringify({ art: 'fundus', id: e.id })}' title="${esc(e.satz || e.name)}"><span class="lf__svg">${DS.fundusSvg(M, { fid: e.id })}</span><small>${esc(e.name)}</small></button>`).join('')}</div>
        <h4>Pattern</h4><div class="lf__marke">${['dunkel', 'hell'].map(k => `<button class="lf__m lf__m--${k} lf__m--tapete" data-lftapete="${k}" draggable="true" data-zieh='${JSON.stringify({ art: 'tapete', tapete: k })}' style="--t:url('${M.basis}${M.tapete[k]}')"><span></span><small>${k === 'dunkel' ? 'Dark' : 'Light'}</small></button>`).join('')}</div>
        <p class="lf__satz">The pattern goes on the shape you picked, otherwise on the ground of the page.</p>`;
    } else {
      box.innerHTML = `<p class="lf__satz">A click puts the colour on the part you picked: text, rule, frame, mark or shape. With nothing picked, it becomes the ground of the page.</p>
        <div class="lf__farben">${L().farben.map(c => `<button class="lf__farbe" data-lffarbe="${c.h}" title="${esc(c.r || '')}"><i style="background:${c.h}"></i><b>${esc(c.n)}</b><code>${esc(c.h)}</code><span class="lf__kopie" data-lfkopie="${c.h}" role="button" aria-label="Copy colour value">${IC.kopie}</span></button>`).join('')}</div>`;
    }
  }
  function zeichneFotos() {
    const box = $('#lfFotos'); if (!box) return;
    const q = (($('#lfSuche') || {}).value || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    const l = DS.M.bilder.filter(b => !b.eigen && (fGruppe === 'alle' || b.gruppe === fGruppe) && (fHerkunft === 'alle' || b.herkunft === fHerkunft)
      && q.every(w => (b.alt + ' ' + b.key + ' ' + b.gruppe + ' ' + (T().s[b.saison] || '')).toLowerCase().includes(w)));
    box.innerHTML = l.length ? l.map(b => `<button class="lf__foto" data-lfbild="${b.key}" draggable="true" data-zieh='${JSON.stringify({ art: 'bild', key: b.key })}' title="${esc(b.alt)}"><img src="${DS.bildUrl(DS.M, b.key, true)}" alt="${esc(b.alt)}" loading="lazy" decoding="async" draggable="false"></button>`).join('')
      : '<p class="lf__satz">No photo fits.</p>';
  }
  async function einsetzen(d, an) {
    const bb = d.art === 'bild' && DS.M.bildIndex[d.key];
    if (bb && bb.datei && !bb.gemessen) { try { const im = new Image(); im.src = bb.url; await im.decode(); if (im.naturalWidth && im.naturalHeight) { bb.w = im.naturalWidth; bb.h = im.naturalHeight; } bb.gemessen = 1; } catch (e) {} }   // Tor 1, 31.10.: Logo nie gestaucht (Markenbuch nennt kein Seitenverhältnis)
    const st = S(), el = st.sel(), s = st.seite();
    if (d.art === 'bild') {
      if (!an && el && el.typ === 'bild' && !DS.M.bildIndex[d.key]?.datei && !DS.M.bildIndex[el.bild]?.datei) { st.tauscheFoto(d.key); melde('Photo changed.'); }
      else st.neues('bild', d.key, an);
    } else if (d.art === 'zeichen') {
      st.neues('zeichen', null, Object.assign({}, an || {}, { z: d.z === 1 ? undefined : d.z }));
    } else if (d.art === 'fundus') {
      st.neues('fundus', d.id, an); melde('Element from the brand book placed. Its colours can be changed on the right.');
    } else if (d.art === 'tapete') {
      if (el && el.typ === 'flaeche' && !an) { st.aendern(() => { el.tapete = d.tapete; }); melde('Pattern put on the shape.'); }
      else { st.aendern(() => { s.tapete = d.tapete; }, false); melde(`${d.tapete === 'dunkel' ? 'Dark' : 'Light'} pattern on the page.`); }
    }
  }
  function farbeLegen(hex) {
    const st = S(), el = st.sel(), c = L().farben.find(x => x.h === hex), n = c ? c.n : hex;
    if (el && ['text', 'linie', 'rahmen', 'zeichen', 'flaeche'].includes(el.typ)) { st.aendern(() => { el.farbe = hex; }); melde(`${n} is on ${el.typ === 'text' ? '«' + el.text.slice(0, 24) + (el.text.length > 24 ? '…' : '') + '»' : { linie: 'the rule', rahmen: 'the frame', zeichen: 'the mark', flaeche: 'the shape' }[el.typ]}.`); }
    else if (el && el.typ === 'bild') melde('A photo has no colour. Please pick text, a rule, a frame, a mark or a shape.');
    else { st.aendern(() => { st.seite().grund = hex; }, false); melde(`${n} is now the ground of the page.`); }
  }
  async function klickFach(e) {
    const b = e.target.closest('button,[data-lfkopie]'); if (!b) return;
    if (b.dataset.lf === 'zu') return fachAuf(false);
    if (b.dataset.lfreiter) { fachReiter = b.dataset.lfreiter; return zeichneFach(); }
    if (b.dataset.lfgruppe) { fGruppe = b.dataset.lfgruppe; $$('.lf [data-lfgruppe]').forEach(x => x.classList.toggle('an', x === b)); return zeichneFotos(); }
    if (b.dataset.lfherkunft) { fHerkunft = b.dataset.lfherkunft; $$('.lf [data-lfherkunft]').forEach(x => x.classList.toggle('an', x === b)); return zeichneFotos(); }
    if (b.dataset.lfkopie) { e.stopPropagation(); await kopiere(b.dataset.lfkopie); return melde(b.dataset.lfkopie + ' copied.'); }
    if (b.dataset.lffarbe) return farbeLegen(b.dataset.lffarbe);
    if (b.dataset.lfbild) return einsetzen({ art: 'bild', key: b.dataset.lfbild });
    if (b.dataset.lfzeichen) return einsetzen({ art: 'zeichen', z: +b.dataset.lfzeichen });
    if (b.dataset.lfelement) return einsetzen({ art: 'fundus', id: b.dataset.lfelement });
    if (b.dataset.lftapete) return einsetzen({ art: 'tapete', tapete: b.dataset.lftapete });
  }
  // Ablegen auf dem Blatt: Stelle in mm aus der Mausposition
  function ablage() {
    const fl = $('#flaeche');
    fl.addEventListener('dragover', e => { if ([...e.dataTransfer.types].includes(TYP)) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; fl.classList.add('ablegen'); } });
    fl.addEventListener('drop', e => {
      if (![...e.dataTransfer.types].includes(TYP)) return;
      e.preventDefault(); e.stopImmediatePropagation(); fl.classList.remove('ablegen');
      let d; try { d = JSON.parse(e.dataTransfer.getData(TYP)); } catch (x) { return; }
      const r = $('#wirt').getBoundingClientRect(), Sk = S().massstab(), f = S().doc().format;
      const an = { x: Math.max(0, Math.min(f.b, (e.clientX - r.left) / Sk - DS.B)), y: Math.max(0, Math.min(f.h, (e.clientY - r.top) / Sk - DS.B)) };
      einsetzen(d, an);
    }, true);
  }

  /* ================= Start ================= */
  function los() {
    if (!L()) { $$('[data-livre],[data-ansicht="livre"]').forEach(b => b.hidden = true); return; }
    document.addEventListener('click', e => { const b = e.target.closest('#werkzeug [data-livre], .kopf [data-livre]'); if (b) fachAuf(); });
    /* Abnahme 28.11.2026: Escape schliesst das Fach wie die übrigen Fenster und Platten (nicht beim Schreiben, nicht über einem offenen Fenster) */
    document.addEventListener('keydown', e => { if (e.key !== 'Escape' || !fach || fach.hidden) return; const a = document.activeElement; if (a && (a.isContentEditable || (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && !fach.contains(a)))) return; if (!document.getElementById('dialog').hidden || document.querySelector('.hk')) return; fachAuf(false); });
    ablage();
  }
  window.DSLivre = { ansicht, bilderZurueck, fachAuf };
  if (window.DSStudio) los(); else document.addEventListener('ds:bereit', los, { once: true });
})();
