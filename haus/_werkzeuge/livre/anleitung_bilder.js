/* Abnahme 28.11.2026: Wahlorte auf den neuen Look gestellt (Foto als Ansicht statt Fenster, Abschnitte ohne #d-…).
   Bilder für die Anleitung (anleitung.html), Brand book · The Cat & Gun (Kopie aus der Vorlage): ein Bildschirmfoto je Kapitel aus dem echten Werkzeug
   (Safari-Kern), 1512 × 900 → 1200 px breit (JPEG über Pillow statt sips).
   node anleitung_bilder.js [basis]   (Server: python3 server.py 9732) */
const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const PW = require('playwright');
const A = process.argv[2] || 'http://127.0.0.1:9732/_werkzeuge/livre/';
const AUS = path.join(__dirname, 'anleitung');
const w = (p, ms) => p.waitForTimeout(ms);
const K = [
  ['k01', 'start', null],
  ['k02', 'bilder', async p => { await p.fill('#li-q', 'pool'); await w(p, 900); await p.evaluate(() => scrollTo(0, 420)); await w(p, 600); }],
  ['k03', 'bilder', async p => { await p.locator('#li-raster .li-f[data-k="b09"]').click({ force: true }); await p.waitForSelector('#ansicht .li-det'); await w(p, 900); await p.evaluate(() => scrollTo(0, document.querySelector('.li-streifen').getBoundingClientRect().top + scrollY - 24)); await w(p, 600); await p.locator('#ansicht .li-gr').nth(0).hover(); await w(p, 700); }],
  ['k04', 'dateien', async p => { await p.evaluate(() => scrollTo(0, document.querySelector('#ansicht .dx-stitel').getBoundingClientRect().top + scrollY - 40)); await w(p, 1200); }],
  ['k05', 'dateien', async p => { await p.evaluate(() => scrollTo(0, document.querySelector('#ansicht .li-fg').getBoundingClientRect().top + scrollY - 150)); await w(p, 1200); }],
  ['k06', 'pruefung', null],
  ['k07', 'pruefung', async p => { await p.locator('#li-bsp').click(); await w(p, 1600); await p.evaluate(() => scrollTo(0, document.querySelector('.li-erg').getBoundingClientRect().top + scrollY - 40)); await w(p, 1000); }],
  ['k08', 'buch.html', null],
  ['k09', 'bilder', async p => { await p.locator('#ansicht a[href*="markenbuch-editor"]').first().hover(); await w(p, 700); }]];
(async () => {
  const b = await PW.webkit.launch(); fs.mkdirSync(AUS, { recursive: true });
  for (const [id, v, vor] of K) {
    const c = await b.newContext({ viewport: { width: 1512, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' }); const p = await c.newPage();
    await p.goto(v.endsWith('.html') ? A + v : A + '#' + v, { waitUntil: 'load' }); await w(p, 3000);
    if (vor) await vor(p);
    await p.screenshot({ path: path.join(AUS, id + '.png') });
    await c.close();
  }
  await b.close();
  for (const [id] of K) {
    const png = path.join(AUS, id + '.png');
    execFileSync('python3', ['-c', 'import sys;from PIL import Image;im=Image.open(sys.argv[1]).convert("RGB");im=im.resize((1200,round(im.size[1]*1200/im.size[0])),Image.LANCZOS);im.save(sys.argv[2],quality=82,optimize=True)', png, path.join(AUS, id + '.jpg')]);
    fs.unlinkSync(png);
  }
  console.log('Bilder:', fs.readdirSync(AUS).join(' '));
})();
