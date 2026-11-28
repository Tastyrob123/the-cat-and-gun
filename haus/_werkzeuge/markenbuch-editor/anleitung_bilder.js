/* Bilder für die Anleitung (anleitung.html), Brand book editor · The Cat & Gun: ein Bildschirmfoto je Kapitel aus dem echten Werkzeug (WebKit), 1512 × 900 → 1200 px breit.
   Umbau von anleitung_bilder.js aus Le Livre der Vorlage.   node anleitung_bilder.js [basis]   (Server: python3 server.py 9737, am besten mit MARKENBUCH_DATEN=<leerer Ordner>) */
const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const PW = require('playwright');
const A = process.argv[2] || 'http://127.0.0.1:9737/_werkzeuge/markenbuch-editor/';
const AUS = path.join(__dirname, 'anleitung');
const w = (p, ms) => p.waitForTimeout(ms);
const mehr = async p => { await p.locator('[data-modus="mehr"]').first().click(); await w(p, 500); };
const K = [
  ['k01', 'start', null],
  ['k02', 'farben', async p => { await p.locator('[data-farbe="rot"]').click(); await p.waitForSelector('[data-mb-fenster="farbe"]'); await w(p, 900); }],
  ['k03', 'farben', async p => { await p.locator('[data-farbe="saft-melonberry"]').click(); await p.waitForSelector('[data-mb-fenster="farbe"]'); await w(p, 500);
    await p.setInputFiles('#mb-bild', path.join(__dirname, '..', '..', 'website', 'assets', 'bild', 'b36-800.webp')); await p.waitForSelector('#mb-profil:not([hidden]) button'); await w(p, 600);
    await p.evaluate(() => document.querySelector('#mb-profil').scrollIntoView({ block: 'center' })); await w(p, 600); }],
  ['k04', 'farben', async p => { await mehr(p); await p.evaluate(() => document.querySelector('.mb-kv').scrollIntoView({ block: 'start' })); await p.evaluate(() => scrollBy(0, -90)); await w(p, 900); }],
  ['k05', 'schriften', async p => { await p.evaluate(() => document.querySelector('.mb-rollen').scrollIntoView({ block: 'start' })); await p.evaluate(() => scrollBy(0, -90)); await w(p, 600); await p.locator('.mb-rollen .mb-auswahl__k').first().click(); await w(p, 600); }],
  ['k06', 'fotos', async p => { await p.locator('#li-raster [data-k]').nth(1).click({ force: true }); await p.waitForSelector('[data-mb-fenster="foto"]'); await w(p, 1200); }],
  ['k07', 'texte', async p => { await p.evaluate(() => document.querySelector('.mb-texte').scrollIntoView({ block: 'start' })); await p.evaluate(() => scrollBy(0, -90)); await w(p, 700); }],
  ['k08', 'elemente', async p => { await p.locator('[data-el="sticker-juices"]').click(); await p.waitForSelector('[data-mb-fenster="element"]'); await w(p, 1200); }],
  ['k09', 'farben', async p => { await p.locator('[data-farbe="saft-mango-tango"]').click(); await p.waitForSelector('[data-mb-fenster="farbe"]'); await p.fill('#mb-hex', '#F2A23A'); await p.locator('#mb-nimm').click(); await w(p, 500);
    await p.locator('#mb-vgl').click(); await p.waitForSelector('[data-mb-fenster="vorher-nachher"]'); await w(p, 900); }],
  ['k10', 'verlauf', null]];
(async () => {
  const b = await PW.webkit.launch(); fs.mkdirSync(AUS, { recursive: true });
  for (const [id, v, vor] of K) {
    const c = await b.newContext({ viewport: { width: 1512, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' }); const p = await c.newPage();
    await p.goto(A + '#' + v, { waitUntil: 'load' }); await w(p, 2500);
    if (vor) await vor(p);
    await p.screenshot({ path: path.join(AUS, id + '.png') });
    await c.close();
  }
  await b.close();
  for (const [id] of K) execFileSync('python3', ['-c', 'import sys;from PIL import Image;im=Image.open(sys.argv[1]).convert("RGB");im=im.resize((1200,round(im.height*1200/im.width)),Image.LANCZOS);im.save(sys.argv[2],quality=82)', path.join(AUS, id + '.png'), path.join(AUS, id + '.jpg')]), fs.unlinkSync(path.join(AUS, id + '.png'));
  console.log('Bilder:', fs.readdirSync(AUS).join(' '));
})();
