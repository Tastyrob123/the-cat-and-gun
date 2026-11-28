// Menus & price lists · The Cat & Gun — Nachprüfung der Abweichungen 1–5 aus vergleich/PRUEFUNG.md (23.11.2026).
//   node _werkzeuge/carte/pruef/nach.js [chromium|webkit|firefox] [breite] [hoehe]
// Eigener Server auf LAUF_PORT (Standard 9095) mit Wegwerf-Daten. Je Zeile «ok» oder «FEHLER», Bilder in pruef/aus/nach-<browser>-<breite>/.
const path = require('path'), fs = require('fs'), os = require('os'), cp = require('child_process');
const { chromium, webkit, firefox } = require('playwright');
const HIER = path.join(__dirname, '..');
const BROWSER = ['chromium', 'webkit', 'firefox'].includes(process.argv[2]) ? process.argv[2] : 'chromium';
const W = +(process.argv[3] || 1440), H = +(process.argv[4] || 900), HANDY = W < 901;
const PORT = +(process.env.LAUF_PORT || 9095), BASIS = `http://127.0.0.1:${PORT}`;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'carte-nach-'));
const BELEG = path.join(HIER, 'pruef', 'aus', `nach-${BROWSER}-${W}`);
fs.mkdirSync(BELEG, { recursive: true });
let rot = 0, srv = null;
const ok = (id, n, b, mehr = '') => { if (!b) rot++; console.log(`${b ? 'ok    ' : 'FEHLER'} ${id.padEnd(4)} ${n}${mehr ? ' · ' + mehr : ''}`); return b; };
const warte = ms => new Promise(r => setTimeout(r, ms));
const hdr = { 'X-Carte-Rolle': 'direktion', 'X-Carte-Wer': 'Probe', 'Content-Type': 'application/json', Origin: BASIS };

(async () => {
  cp.execFileSync('python3', [path.join(HIER, 'einlesen.py')], { env: { ...process.env, CARTE_DATEN: TMP }, stdio: 'ignore' });
  srv = cp.spawn('python3', [path.join(HIER, 'serve.py'), String(PORT)], { env: { ...process.env, CARTE_DATEN: TMP }, stdio: 'ignore' });
  for (let i = 0; i < 80; i++) { try { await fetch(BASIS + '/the-cat-and-gun/haus/_werkzeuge/carte/api/gesund'); break; } catch (e) { await warte(150); } }
  const br = await { chromium, webkit, firefox }[BROWSER].launch();
  const ctx = await br.newContext({ viewport: { width: W, height: H } });
  await ctx.addInitScript(() => { try { localStorage.setItem('lc-modus', 'einfach'); } catch (e) { /* egal */ } });
  const p = await ctx.newPage();
  const fehler = []; p.on('pageerror', e => fehler.push(String(e).slice(0, 160)));
  const gesetzt = () => p.waitForFunction(() => /as in the PDF/.test(document.querySelector('#v-zahl')?.textContent || ''), null, { timeout: 40000 });
  const bild = n => p.screenshot({ path: path.join(BELEG, n + '.png') }).catch(() => {});
  const rand = async () => { if (HANDY && !(await p.evaluate(() => document.documentElement.classList.contains('wo-rand-auf')))) { await p.click('.wo-kopf__ber'); await warte(350); } };
  await p.goto(BASIS + '/the-cat-and-gun/haus/_werkzeuge/carte/'); await gesetzt(); await warte(600);

  // 1 Earlier versions: im Bildschirm (vorher eine veröffentlichte Fassung anlegen, damit Zeilen mit Knopf da sind)
  await rand(); await p.click('[data-akt="verlauf"]'); await warte(900);
  const m1 = await p.evaluate(() => {
    const k = document.querySelector('#fenster:not([hidden]) .fenster__k'), r = k.getBoundingClientRect(), vw = document.documentElement.clientWidth;
    const raus = [...k.querySelectorAll('*')].filter(e => { const q = e.getBoundingClientRect(); return q.width && (q.right > vw + 0.5 || q.left < -0.5); }).length;
    const ab = [...k.querySelectorAll('p,button,small,b,span')].filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').length;
    return { l: Math.round(r.left), r: Math.round(r.right), vw, raus, ab, seite: document.documentElement.scrollWidth - window.innerWidth, zeilen: k.querySelectorAll('[data-d]').length };
  });
  ok('1', 'Earlier versions bleibt im Bildschirm', m1.l >= 0 && m1.r <= m1.vw && !m1.raus && !m1.ab && m1.seite <= 0, `Fenster ${m1.l}–${m1.r} px bei ${m1.vw}, ${m1.raus} Teile draussen, ${m1.zeilen} Fassungen`);
  await bild('01-fassungen');
  if (HANDY) {   // auch 320
    await p.setViewportSize({ width: 320, height: H }); await warte(500);
    const m = await p.evaluate(() => { const k = document.querySelector('#fenster:not([hidden]) .fenster__k'), r = k.getBoundingClientRect(), vw = document.documentElement.clientWidth; return { l: Math.round(r.left), r: Math.round(r.right), vw, raus: [...k.querySelectorAll('*')].filter(e => { const q = e.getBoundingClientRect(); return q.width && q.right > vw + 0.5; }).length }; });
    ok('1b', 'Earlier versions bei 320', m.l >= 0 && m.r <= m.vw && !m.raus, `${m.l}–${m.r} px bei ${m.vw}`);
    await bild('01b-fassungen-320');
    await p.setViewportSize({ width: W, height: H }); await warte(500);
  }
  await p.keyboard.press('Escape'); await warte(400);

  // 3 Vorschau im Fenster lesbar
  if (HANDY && await p.evaluate(() => document.documentElement.classList.contains('wo-rand-auf'))) { await p.click('.wo-kopf__ber'); await warte(350); }
  await p.locator('#liste .r', { hasText: 'BLT' }).first().locator('.r__t').dblclick(); await warte(2500);
  const mf = p.frames().find(f => /satz\/blatt\.html\?mini/.test(f.url()));
  let px = 0, pxT = 0;
  if (mf) {
    for (let i = 0; i < 30 && !px; i++) {
      const g = await mf.evaluate(() => {
        const n = document.querySelector('.sb-pn'), t = document.querySelector('.sb-t'), b = document.querySelector('#seiten .blatt') || document.body;
        const m = (getComputedStyle(b).transform.match(/matrix\(([^,]+)/) || [0, 1])[1];
        const fr = window.frameElement ? 1 : 1;
        return { n: n ? n.getBoundingClientRect().height : 0, nf: n ? parseFloat(getComputedStyle(n).fontSize) * m : 0, tf: t ? parseFloat(getComputedStyle(t).fontSize) * m : 0, tr: b.style.transform };
      }).catch(() => ({}));
      if (g.tr) { px = g.nf; pxT = g.tf; } else await warte(250);
    }
  }
  const sicht = await p.evaluate(() => { const f = document.querySelector('#fenster iframe'); if (!f) return {}; const r = f.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; });
  ok('3', 'Vorschau im Fenster in Lesegrösse (Name ≥ 11 px, Beschreibung ≥ 9 px)', px >= 11 && pxT >= 9, `Name ${px.toFixed(1)} px, Beschreibung ${pxT.toFixed(1)} px, Rahmen ${sicht.w}×${sicht.h}`);
  await bild('03-vorschau-fenster');
  await p.keyboard.press('Escape'); await warte(400);

  // 2 Meldung mit «Page» statt «Seite»
  const st = await (await fetch(`${BASIS}/_werkzeuge/carte/api/karte?z=kitchen`, { headers: hdr })).json();
  const d = st.entwurf || st.stand;
  const json = JSON.stringify(d);
  const lang = JSON.parse(json.replace(/"BLT"/, `"${'x'.repeat(5000)}"`));
  const r2 = await fetch(`${BASIS}/_werkzeuge/carte/api/entwurf`, { method: 'POST', headers: hdr, body: JSON.stringify({ z: 'kitchen', d: lang, daten: lang }) });
  const t2 = await r2.text();
  const skr = JSON.parse(json.replace(/"BLT"/, '"<script>alert(1)</script>"'));
  const t2b = await (await fetch(`${BASIS}/_werkzeuge/carte/api/entwurf`, { method: 'POST', headers: hdr, body: JSON.stringify({ z: 'kitchen', d: skr, daten: skr }) })).text();
  ok('2', 'Meldungen englisch («Page 1», kein «Seite»)', /Page 1/.test(t2) && /Page 1/.test(t2b) && !/Seite/.test(t2 + t2b), (t2 + ' | ' + t2b).replace(/\s+/g, ' ').slice(0, 220));

  // 5 Before/after ohne Gegensatz-Pointe
  await p.locator('#liste .r', { hasText: 'BLT' }).first().locator('.r__t').dblclick(); await warte(900);
  await p.locator('#fenster .felder .feld:has(> span:text-is("Price")) :is(input,textarea)').first().fill('275');
  await p.click('#f-ok'); await warte(1500);
  await p.click('#l-raus'); await warte(900);
  const s5 = await p.textContent('#fenster .satz');
  ok('5', 'Before/after: «The boards in the café stay as they are.», kein «not the boards»', /The boards in the café stay as they are\./.test(s5) && !/not the boards/.test(s5), s5.trim());
  await bild('05-vorher-nachher');
  ok('S', 'keine Skriptfehler', !fehler.length, fehler.join(' | '));
  await br.close();
  console.log(rot ? `${rot} rot` : 'alles grün');
  srv.kill(); fs.rmSync(TMP, { recursive: true, force: true });
  process.exit(rot ? 1 : 0);
})().catch(e => { console.log('FEHLER Abbruch: ' + e.message); if (srv) srv.kill(); process.exit(2); });
