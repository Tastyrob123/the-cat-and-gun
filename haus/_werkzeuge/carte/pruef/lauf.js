// Menus & price lists · The Cat & Gun — Bedienungsprobe (22.11.2026, nach pruef/lauf.js der Pairing-Karte im Culinarium): öffnet das Werkzeug wie ein Mensch
// und bedient jede Funktion aus dem Auftrag (AUFTRAG.md «Prüfen vor der Meldung»).
//   node _werkzeuge/carte/pruef/lauf.js [chromium|webkit|firefox] [breite] [hoehe]      (Standard chromium 1440 900)
// Eigener Server auf einem Prüfport (LAUF_PORT, Standard 9757) mit Wegwerf-Daten (CARTE_DATEN = temporärer Ordner, frisch eingelesen), danach beendet und
// gelöscht. Das Werkzeug selbst (_daten/) und die Website bleiben unberührt. Jede Zeile: «ok» oder «FEHLER». Ausgang 1, sobald etwas rot ist.
// Belege (Bildschirmbilder): pruef/aus/lauf-<browser>-<breite>/.
const path = require('path'), fs = require('fs'), os = require('os'), cp = require('child_process');
const { chromium, webkit, firefox } = require('playwright');
const HIER = path.join(__dirname, '..');
const BROWSER = ['chromium', 'webkit', 'firefox'].includes(process.argv[2]) ? process.argv[2] : 'chromium';
const W = +(process.argv[3] || 1440), H = +(process.argv[4] || 900), HANDY = W < 901;
const PORT = +(process.env.LAUF_PORT || 9757), BASIS = `http://127.0.0.1:${PORT}`;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'carte-lauf-'));
const BELEG = path.join(HIER, 'pruef', 'aus', `lauf-${BROWSER}-${W}`);
fs.mkdirSync(BELEG, { recursive: true });
let rot = 0, nr = 0, srv = null, OFFLINE = false;
const ok = (id, n, b, mehr = '') => { nr++; if (!b) rot++; console.log(`${b ? 'ok    ' : 'FEHLER'} ${id.padEnd(4)} ${n}${mehr ? ' · ' + mehr : ''}`); return b; };
const warte = ms => new Promise(r => setTimeout(r, ms));
const hdr = (rolle) => ({ 'X-Carte-Rolle': rolle, 'X-Carte-Wer': 'Probe', 'Content-Type': 'application/json', Origin: BASIS });
async function api(was, daten, rolle = 'direktion') {
  const r = await fetch(`${BASIS}/_werkzeuge/carte/api/${was}`, daten === undefined ? { headers: hdr(rolle) } : { method: 'POST', headers: hdr(rolle), body: JSON.stringify(daten) });
  return { s: r.status, j: await r.json().catch(() => ({})) };
}

(async () => {
  { let belegt = false; try { await fetch(BASIS + '/the-cat-and-gun/haus/_werkzeuge/carte/api/gesund').then(r => r.arrayBuffer()); belegt = true; } catch (e) { /* frei */ } if (belegt) { console.log(`FEHLER Port ${PORT} ist belegt (alter Prüfserver?). Erst diesen eigenen Prozess beenden.`); process.exit(3); } }
  cp.execFileSync('python3', [path.join(HIER, 'einlesen.py')], { env: { ...process.env, CARTE_DATEN: TMP }, stdio: 'ignore' });
  srv = cp.spawn('python3', [path.join(HIER, 'serve.py'), String(PORT)], { env: { ...process.env, CARTE_DATEN: TMP }, stdio: 'ignore' });
  for (let i = 0; i < 80; i++) { try { await fetch(BASIS + '/the-cat-and-gun/haus/_werkzeuge/carte/api/gesund'); break; } catch (e) { await warte(150); } }
  const br = await { chromium, webkit, firefox }[BROWSER].launch();
  const fehler = [];
  const ctx = await br.newContext({ viewport: { width: W, height: H } });
  await ctx.addInitScript(() => { try { localStorage.setItem('lc-modus', 'einfach'); } catch (e) { /* egal */ } });
  const horch = pg => {
    pg.on('pageerror', e => fehler.push('Skript: ' + String(e).slice(0, 200)));
    pg.on('console', m => { if (m.type() === 'error' && !OFFLINE && !/status of (4\d\d)|Failed to load resource|NetworkError|Load failed|ERR_/.test(m.text())) fehler.push('Konsole: ' + m.text().slice(0, 200)); });
  };
  const p = await ctx.newPage(); horch(p);
  if (process.env.DBG) p.on('console', m => console.log('   KONSOLE', m.text().slice(0, 200)));
  if (process.env.DBG) p.on('response', async r => { if (/api\/(entwurf|verwerfen)/.test(r.url())) console.log('   RES', r.url().split('/the-cat-and-gun/haus/api/')[1], (await r.text()).slice(0, 160)); });
  const rahmen = () => p.frame({ url: /satz\/blatt\.html(?!\?mini)/ });
  const gesetzt = async () => { await p.waitForFunction(() => /as in the PDF/.test(document.querySelector('#v-zahl')?.textContent || ''), null, { timeout: 40000 }); await warte(400); };
  const offen = () => p.$('#fenster:not([hidden]) .fenster__k');
  const quit = async (re, t = 10000) => { try { await p.waitForFunction(r => [...document.querySelectorAll('#meldung .quit')].some(q => new RegExp(r).test(q.textContent)), re.source, { timeout: t }); return true; } catch (e) { return false; } };
  const zeile = text => p.locator('#liste .r', { hasText: text }).first();
  const imRahmen = async text => (await rahmen().evaluate(() => document.getElementById('seiten').textContent)).includes(text);
  const bisImRahmen = async (text, soll = true) => { for (let i = 0; i < 40; i++) { if ((await imRahmen(text)) === soll) return true; await warte(250); } return false; };   // WebKit und Firefox setzen langsamer neu
  const knopf = async (r, akt) => { await r.scrollIntoViewIfNeeded(); if (!(await r.evaluate(e => e.classList.contains('gewaehlt')))) { await r.locator('.r__t').click({ position: { x: 14, y: 10 } }); await warte(450); } const k = r.locator(`[data-akt="${akt}"]`); await k.scrollIntoViewIfNeeded(); await k.click(); await warte(350); };
  const feld = n => p.locator(`#fenster .felder .feld:has(> span:text-is("${n}")) :is(input,textarea)`).first();
  const breit = () => p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const bild = async n => { try { await p.screenshot({ path: path.join(BELEG, n + '.png') }); } catch (e) { /* egal */ } };
  const karte = async z => {
    await p.evaluate(() => { const v = document.querySelector('#v-zahl'); if (v) v.textContent = '…'; });
    await p.click(`.kw[data-z="${z}"]`); await gesetzt();
  };
  const leiste = () => p.textContent('#leiste');

  // ---------------------------------------------------------------- A Laden und Rahmen
  for (const url of ['/the-cat-and-gun/haus/_werkzeuge/carte/', '/the-cat-and-gun/haus/_werkzeuge/carte/anleitung.html', '/the-cat-and-gun/haus/_werkzeuge/carte/pruefung.html', '/the-cat-and-gun/haus/_werkzeuge/carte/satz/blatt.html']) {
    const r = await p.goto(BASIS + url, { waitUntil: 'load' }); await warte(600);
    ok('A1', `Laden ${url}`, [200, 304].includes(r.status()), String(r.status()));
    ok('A2', `kein seitliches Verrutschen ${url}`, (await breit()) <= 1, (await breit()) + ' px');
  }
  ok('A3', 'Anleitung englisch, Lexikon mit Stichwörtern', await p.goto(BASIS + '/the-cat-and-gun/haus/_werkzeuge/carte/anleitung.html').then(() => p.evaluate(() => document.documentElement.lang === 'en' && !!document.getElementById('KONFLIKT') && !!document.getElementById('WEBSITE') && /boards stay as they are/.test(document.body.textContent))));
  await p.goto(BASIS + '/the-cat-and-gun/haus/_werkzeuge/carte/#kitchen'); await gesetzt();
  ok('A4', 'Rahmen: Kleid catgun, Bühne, Kopf, Rand, Leiste, Fenster, Quittung', await p.evaluate(() => document.documentElement.dataset.woHaus === 'catgun' && ['#oben', '#rand.rail.lack6', '#kopf.wkopf', '#reiter .kw', '#leiste.wleist', '#fenster', '#meldung[aria-live]'].every(s => document.querySelector(s))));
  ok('A5', 'Name aus dem Kleid «Menus & price lists», Seitentitel', await p.evaluate(() => document.title.startsWith('Menus & price lists') && document.querySelector('#oben').textContent.includes('Menus & price lists')));
  ok('A6', 'Drei Karten im Rand wie gedruckt (Drinks, Coffee & juices, Kitchen), je mit Foto', (await p.$$eval('.kw', e => e.map(x => x.dataset.z + ((x.querySelector('img') && x.querySelector('img').getAttribute('src') ? '' : '!'))).join(','))) === 'drinks,coffee-juices,kitchen');
  ok('A7', 'Satz rechts: Kitchen mit Wortmarke, erstem und letztem Posten der gedruckten Karte', await imRahmen('FISH & CHIPS') && await imRahmen('PIZZA PITA BREAD') && await rahmen().evaluate(() => !!document.querySelector('.cg-wm')));
  ok('A8', 'Nirgends ein deutscher Knopf oder Satz in der Oberfläche', await p.evaluate(() => !/\b(Speichern|Veröffentlichen|Entwurf|Karte|Seite|Eintrag|Rubrik|Abend)\b/.test(document.body.innerText)));
  ok('A9', 'Hinweis: Bretter im Laden ändern sich nicht', /boards in the café do not change/.test(await p.textContent('#kopf')));
  ok('A10', 'Rubriken in der Liste mit Bild (Foto oder Et-Zeichen)', await p.evaluate(() => [...document.querySelectorAll('#liste .r--rubrik')].every(r => { const b = r.querySelector('.r__b'); return b && (b.dataset.bild || b.style.backgroundImage); })));
  await bild('01-start');

  // ---------------------------------------------------------------- B Einfach: wählen, ändern, speichern, neu laden
  const blt = zeile('BLT');
  await blt.locator('.r__t').click({ position: { x: 14, y: 10 } }); await warte(700);
  ok('B1', 'Klick links: Zeile gewählt, Karte rechts blinkt', await blt.evaluate(e => e.classList.contains('gewaehlt')) && await rahmen().evaluate(() => !!document.querySelector('.blitz')));
  await blt.locator('.r__t').dblclick(); await warte(800);
  ok('B2', 'Doppelklick öffnet «Edit item» mit Name, Marks, Price, Description', !!(await offen()) && await feld('Name').count() && await feld('Marks').count() && await feld('Price').count() && await feld('Description').count());
  await feld('Price').fill('275.00');
  await bild('02-fenster');
  if (process.env.DBG) console.log('   WERT', await feld('Price').inputValue(), await p.evaluate(() => [...document.querySelectorAll('#fenster [id^=f-]')].map(e => e.id + '=' + (e.value || '')).join(' ')));
  await p.click('#f-ok'); await quit(/saved|Item/);
  ok('B3', 'Preis «275.00» wird «275» (Schreibweise der Karte), rechts sofort', await bisImRahmen('275') && !(await imRahmen('275.00')));
  ok('B4', 'Leiste: Entwurf mit 1 Änderung, Knopf Publish', /Draft: 1 change/.test(await leiste()) && !!(await p.$('#l-raus')), (await leiste()).replace(/\s+/g, ' ') + ' · ' + (await p.textContent('#meldung')).replace(/\s+/g, ' ').slice(0, 200));
  await p.reload(); await gesetzt();
  ok('B5', 'Neu laden: Entwurf noch da (275)', await imRahmen('275') && /Draft/.test(await leiste()));
  // Kopieren, neuer Name mit Emoji und Umlauten
  await knopf(zeile('BLT'), 'kopie'); await warte(600);
  await feld('Name').fill('Pancake Ümlaut ✓ 🍹'); await feld('Price').fill('199');
  await p.click('#f-ok'); await quit(/on the menu|draft/);
  ok('B6', 'Kopieren: neuer Posten mit Emoji und Umlauten auf der Karte', await bisImRahmen('Pancake Ümlaut ✓ 🍹'));
  // Ausblenden, verschieben
  await knopf(zeile('TUNA MAYO'), 'aus'); await quit(/Hidden/);
  ok('B7', 'Ausblenden: TUNA MAYO nicht mehr auf der Karte, in der Liste grau', await bisImRahmen('TUNA MAYO', false) && await zeile('TUNA MAYO').evaluate(e => e.classList.contains('aus')));
  await knopf(zeile('TUNA MAYO'), 'aus'); await quit(/Back on the menu/);
  ok('B8', 'Wieder zeigen', await bisImRahmen('TUNA MAYO'));
  const vorher = await p.$$eval('#liste .r__t b', e => e.map(x => x.textContent).join('|'));
  await knopf(zeile('SWEET & SPICE'), 'hoch'); await quit(/Order saved/);
  const nachher = await p.$$eval('#liste .r__t b', e => e.map(x => x.textContent).join('|'));
  ok('B9', 'Verschieben: Sweet & Spice eine Zeile höher', vorher !== nachher && nachher.indexOf('SWEET & SPICE') < nachher.indexOf('TUNA MAYO'));
  // leeres Feld, 5000 Zeichen, <script>
  await zeile('SAUSAGE & EGG').locator('.r__t').dblclick(); await warte(700);
  await feld('Name').fill(''); await p.click('#f-ok'); await warte(400);
  ok('B10', 'Leerer Name: «Please enter a name.», Fenster bleibt', /Please enter a name/.test(await p.textContent('#f-fehler')) && !!(await offen()));
  await feld('Name').fill('SAUSAGE & EGG'); await feld('Description').fill('x'.repeat(5000)); await p.click('#f-ok');
  ok('B11', '5000 Zeichen: abgewiesen mit Stichwort PRUEF, Eingabe wartet gelb', await quit(/too long/) && /Not saved yet/.test(await leiste()));
  await p.click('[data-akt="verwerfen"]').catch(() => {}); await warte(300); if (await offen()) await p.click('#ja'); await warte(1500); await gesetzt();
  ok('B12', 'Verwerfen: alles wie vorher (260), Entwurf verworfen', !(await imRahmen('275')) && /All published|Not published yet/.test(await leiste()));
  await zeile('BLT').locator('.r__t').dblclick(); await warte(700);
  await feld('Name').fill('<script>alert(1)</script>'); await p.click('#f-ok');
  ok('B13', '<script> im Namen: abgewiesen («program code»)', await quit(/program code/));
  await p.click('[data-akt="verwerfen"]').catch(() => {}); await warte(300); if (await offen()) await p.click('#ja'); await warte(1500); await gesetzt();
  // neue Rubrik
  await p.locator('[data-akt="rubrik-neu"]').first().click(); await warte(700);
  await feld('Section').fill('Specials'); await p.click('#f-ok'); await quit(/on the menu|draft/);
  ok('B14', 'Neue Rubrik «Specials» auf der Karte', await bisImRahmen('Specials'));
  await p.click('[data-akt="vgl"]'); await warte(600);
  ok('B15', 'Vorher, nachher: Fenster mit der neuen Rubrik', !!(await offen()) && /Specials/.test(await p.textContent('#fenster')));
  await bild('03-vorher-nachher'); await p.keyboard.press('Escape'); await warte(300);
  await p.click('[data-akt="verwerfen"]'); await warte(300); await p.click('#ja'); await warte(1500); await gesetzt();

  // ---------------------------------------------------------------- C Probe-PDF, Veröffentlichen, Website, zurückholen
  await zeile('BLT').locator('.r__t').dblclick(); await warte(700); await feld('Price').fill('275'); await p.click('#f-ok'); await quit(/saved/);
  const pr = await api('probe', { z: 'kitchen' });
  ok('C1', 'Probe-PDF aus dem Entwurf', pr.s === 200 && pr.j.art === 'entwurf' && pr.j.seiten >= 1, `${pr.j.seiten} Seiten`);
  const pdfR = await fetch(BASIS + pr.j.url); const pdfB = Buffer.from(await pdfR.arrayBuffer());
  ok('C2', 'Probe-PDF lässt sich öffnen (application/pdf)', pdfR.status === 200 && pdfB.slice(0, 4).toString() === '%PDF');
  await p.click('#l-raus'); await warte(700);
  ok('C3', 'Publish öffnet «Before and after» mit Knopf Publish', !!(await p.$('#v-ok')));
  await p.click('#v-ok');
  await p.waitForFunction(() => /Published\./.test(document.querySelector('#fenster')?.textContent || '') || /Not published/.test(document.querySelector('#meldung')?.textContent || ''), null, { timeout: 180000 });
  const ft = await p.textContent('#fenster');
  ok('C4', 'Veröffentlicht: PDF geprüft, Website-Seiten gebaut, Bretter bleiben', /Published\./.test(ft) && /words checked/.test(ft) && /menu\.html/.test(ft) && /boards in the café stay/.test(ft), ft.replace(/\s+/g, ' ').slice(0, 160));
  await bild('04-veroeffentlicht');
  await p.keyboard.press('Escape'); await warte(400);
  ok('C5', 'Leiste: alles veröffentlicht, Kopf mit PDF-Datum', /All published/.test(await leiste()) && /PDF of/.test(await p.textContent('#kopf')));
  const webSeite = fs.existsSync(path.join(TMP, 'website', 'menu.html')) ? fs.readFileSync(path.join(TMP, 'website', 'menu.html'), 'utf8') : '';
  ok('C6', 'Fertige Menüseite der Website mit dem neuen Preis liegt bereit (_daten/website/menu.html), website/ unberührt', /BLT<\/span><span class="pp">275<\/span>/.test(webSeite) && !/Dessert|TravelGO|Combo/.test(webSeite) && /BLT<\/span><span class="pp">260 PHP/.test(fs.readFileSync(path.join(HIER, '..', '..', 'website', 'menu.html'), 'utf8')));
  const live = await fetch(`${BASIS}/_werkzeuge/carte/api/pdf?z=kitchen&q=live`); await live.arrayBuffer();
  ok('C7', 'Veröffentlichte PDF abrufbar', live.status === 200);
  await p.click('[data-ansicht="website"]');
  await p.waitForFunction(() => /Menu page/.test(document.querySelector('#v-zahl')?.textContent || ''), null, { timeout: 30000 }).catch(() => {}); await warte(800);
  const wf = p.frame({ url: /api\/webseite/ });
  const wtext = (await p.evaluate(() => { try { return (document.getElementById('web-f').contentDocument.getElementById('kueche') || {}).textContent || ''; } catch (e) { return ''; } })).replace(/\s+/g, '');   // über das Dokument des Rahmens (Firefox führt den Rahmen nicht immer in page.frames())
  ok('C8', 'Ansicht Website: Menüseite mit 275 bei BLT, springt zu Kitchen', /BLT275/.test(wtext) && /Menu page/.test(await p.textContent('#v-zahl')), (wf ? wf.url().slice(-60) : 'kein Rahmen') + ' · ' + (await p.textContent('#v-zahl')) + ' · ' + (wtext.match(/BLT\d+/) || ['?'])[0]);
  await bild('05-website');
  const wganz = await p.evaluate(() => { try { return document.getElementById('web-f').contentDocument.body.textContent; } catch (e) { return ''; } });
  ok('C9', 'Ansicht Website: nur die Menüseite, nichts von der früheren Karte (Desserts, Cookies, TravelGO, Combo)', (await p.$$('#webwahl button')).length === 1 && !/Dessert|Cookie|Chilled|TravelGO|Combo/.test(wganz) && /PIZZA PITA BREAD/.test(wganz) && /JAGERMEISTER/.test(wganz));
  await p.click('[data-ansicht="karte"]'); await gesetzt();
  // zurückholen
  await p.click('[data-akt="verlauf"]'); await warte(800);
  ok('C10', 'Frühere Fassungen: «Original menu» und die veröffentlichte Fassung', /Original menu/.test(await p.textContent('#fenster')) && (await p.$$('#fenster [data-d]')).length >= 2);
  await bild('06-fassungen');
  await p.click('#fenster [data-d]:not([data-d="grundstand"])'); await quit(/Version in the draft/); await gesetzt();
  ok('C11', 'Zurückholen legt die alte Fassung in den Entwurf (260), nie direkt online', !(await imRahmen('275')) && /Draft/.test(await leiste()));
  await p.click('#l-raus'); await warte(600); await p.click('#v-ok');
  await p.waitForFunction(() => /Published\./.test(document.querySelector('#fenster')?.textContent || ''), null, { timeout: 180000 });
  await p.keyboard.press('Escape'); await warte(300);
  const web2 = fs.existsSync(path.join(TMP, 'website', 'menu.html')) ? fs.readFileSync(path.join(TMP, 'website', 'menu.html'), 'utf8') : '';
  ok('C12', 'Wieder veröffentlicht: Menüseite wieder mit 260 bei BLT', /BLT<\/span><span class="pp">260<\/span>/.test(web2));

  // ---------------------------------------------------------------- D Zwei Fenster, Netz weg
  const p2 = await ctx.newPage(); horch(p2);
  await p2.goto(BASIS + '/the-cat-and-gun/haus/_werkzeuge/carte/#drinks'); await p2.waitForFunction(() => /as in the PDF/.test(document.querySelector('#v-zahl')?.textContent || ''), null, { timeout: 40000 });
  await karte('drinks');
  const z2 = p2.locator('#liste .r', { hasText: 'CORONA' }).first(); await z2.locator('.r__t').dblclick(); await warte(700);
  await p2.locator('#fenster .feld:has(> span:text-is("Price")) input').fill('185'); await p2.click('#f-ok'); await warte(1500);
  await zeile('RED HORSE').locator('.r__t').dblclick(); await warte(700); await feld('Price').fill('105'); await p.click('#f-ok');
  ok('D1', 'Zwei Fenster: das zweite Speichern meldet KONFLIKT, nichts überschrieben', await quit(/changed this menu in the meantime/) && /185/.test(JSON.stringify((await api('karte?z=drinks')).j.entwurf)) && !/"105"/.test(JSON.stringify((await api('karte?z=drinks')).j.entwurf)));
  ok('D2', 'Nach KONFLIKT bleibt die Eingabe (105 wartet gelb)', /Not saved yet/.test(await leiste()) && await imRahmen('105'));
  await p2.close();
  await p.reload(); await gesetzt();
  OFFLINE = true; await ctx.setOffline(true);
  await zeile('RED HORSE').locator('.r__t').dblclick(); await warte(700); await feld('Price').fill('110'); await p.click('#f-ok');
  ok('D3', 'Netz weg beim Speichern: Meldung «No connection», Eingabe bleibt', await quit(/No connection/) && /Not saved yet/.test(await leiste()));
  await ctx.setOffline(false); OFFLINE = false; await warte(500);
  await p.click('#l-sp');
  ok('D4', 'Netz wieder da: Speichern klappt', await quit(/Saved in the draft/) && /110/.test(JSON.stringify((await api('karte?z=drinks')).j.entwurf)));
  await p.click('[data-akt="verwerfen"]'); await warte(300); await p.click('#ja'); await warte(1500); await gesetzt();

  // ---------------------------------------------------------------- E Fortgeschritten
  await p.click('[data-m="frei"]'); await gesetzt(); await warte(800);
  ok('E1', 'Fortgeschritten: Satz und Knopf «Menu data»', /Click to pick a part/.test(await p.textContent('#kopf')) && !!(await p.$('[data-akt="daten"]')));
  const ziel = rahmen().locator('h2.sb-h').first(); await ziel.scrollIntoViewIfNeeded(); await ziel.click(); await warte(900);
  ok('E2', 'Element wählen öffnet «Design» mit Font, Font size, Colour', await p.evaluate(() => { const g = document.querySelector('#gst'); return !!g && !g.hidden && /Font size/.test(g.textContent) && /Colour/.test(g.textContent); }));
  await bild('07-fortgeschritten');
  await p.click('#gst [data-schritt="pt"][data-r="1"]'); await warte(800);
  ok('E3', 'Schrift grösser: Änderung wartet', /Not saved yet/.test(await leiste()));
  await p.keyboard.press(BROWSER === 'webkit' ? 'Meta+z' : 'Control+z'); await warte(800);
  await p.click('[data-akt="daten"]'); await warte(500);
  ok('E4', 'Menu data: Seiten als Text', /"fn": "seite"/.test(await p.inputValue('#j-t')));
  await p.keyboard.press('Escape'); await warte(300);
  await p.click('[data-m="einfach"]'); await warte(500); if (await offen()) { await p.click('#ja'); await warte(800); }
  await gesetzt();

  // ---------------------------------------------------------------- F Wege, Handy, Rundgang, Prüfseite
  if (HANDY) {
    await p.click('.wo-kopf__ber'); await warte(700);
    const auf = await p.evaluate(() => document.documentElement.classList.contains('wo-rand-auf') && document.querySelector('#rand').getBoundingClientRect().left >= 0);
    await p.keyboard.press('Escape'); await warte(700);
    await p.click('.kw[data-z="coffee-juices"]'); await gesetzt();
    ok('F1', 'Handy: Knopf oben klappt die Seitenleiste auf, Esc klappt sie zu, Reiter wählt die Karte', auf && !(await p.evaluate(() => document.documentElement.classList.contains('wo-rand-auf'))));
  }
  const links = await p.$$eval('#rand a[href], #oben a[href]', (e, port) => e.map(a => a.href).filter(h => h.startsWith('http://127.0.0.1:' + port + '/')), PORT);
  let tote = [];
  for (const h of [...new Set(links)]) { const r = await fetch(h); await r.arrayBuffer().catch(() => {}); if (r.status >= 400) tote.push(r.status + ' ' + h); }
  ok('F2', 'Alle eigenen Links in Kopf und Rand antworten', !tote.length, tote.join(' · '));
  ok('F3', 'Wege zu anderen Werkzeugen immer 127.0.0.1, nie localhost', await p.evaluate(() => ![...document.querySelectorAll('a[href]')].some(a => /localhost/.test(a.href))));
  const br3 = BROWSER === 'firefox' ? await firefox.launch() : br;   // Firefox (Playwright) lädt nach setOffline im selben Browser keine neue Seite mehr; einzeln geöffnet läuft der Rundgang (pruef von Hand geprüft)
  const ctx3 = await br3.newContext({ viewport: { width: W, height: H } });
  const p3 = await ctx3.newPage(); horch(p3);
  if (process.env.DBG) { p3.on('request', r => console.log('   P3 REQ', r.url().slice(-70))); p3.on('requestfinished', r => console.log('   P3 FIN', r.url().slice(-70))); p3.on('requestfailed', r => console.log('   P3 FAIL', r.url().slice(-70))); } await p3.goto(BASIS + '/the-cat-and-gun/haus/_werkzeuge/carte/?rundgang#kitchen', { waitUntil: 'domcontentloaded', timeout: 60000 }); await p3.waitForFunction(() => /This is menus/.test(document.body.textContent), null, { timeout: 15000 }).catch(() => {});
  ok('F4', 'Rundgang (?rundgang): erster Schritt englisch', /This is menus & price lists/.test(await p3.textContent('body')));
  await p3.goto(BASIS + '/the-cat-and-gun/haus/_werkzeuge/carte/pruefung.html', { waitUntil: 'domcontentloaded', timeout: 60000 }); await p3.waitForFunction(() => /published|draft/.test(document.querySelector('#p-karten')?.textContent || ''), null, { timeout: 20000 }).catch(() => {});
  ok('F5', 'Prüfseite: Server, drei Karten lesbar, Druck in Ordnung', await p3.evaluate(() => (document.querySelector('#p-karten').textContent.match(/published|draft waiting/g) || []).length === 3 && !/missing/.test(document.querySelector('#p-druck').textContent)));
  await p3.close(); await ctx3.close(); if (br3 !== br) await br3.close();
  ok('F6', 'Rollen: Service darf nicht veröffentlichen (RECHT 403)', (await api('veroeffentlichen', { z: 'kitchen' }, 'service')).s === 403);
  const fr = await fetch(BASIS + '/the-cat-and-gun/haus/_werkzeuge/carte/api/entwurf', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://evil.example' }, body: '{}' }); await fr.arrayBuffer();
  ok('F7', 'Fremde Herkunft abgewiesen (403)', fr.status === 403);
  ok('F8', 'Demo-Sperre: Website-Anschluss lässt sich nicht einschalten (409)', (await api('einstellungen', { anschluss_pdf: true })).s === 409);
  ok('F9', 'Kein seitliches Verrutschen am Ende', (await breit()) <= 1);
  ok('F10', 'Keine Skript- oder Konsolenfehler', !fehler.length, fehler.slice(0, 3).join(' | '));
  await bild('08-ende');
  await br.close();
  console.log(`\n${BROWSER} ${W}: ${nr - rot}/${nr} grün`);
})().catch(e => { console.log('FEHLER Abbruch: ' + String(e && e.stack || e).slice(0, 600)); rot++; }).finally(() => {
  try { srv && srv.kill(); } catch (e) { /* egal */ }
  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) { /* egal */ }
  process.exit(rot ? 1 : 0);
});
