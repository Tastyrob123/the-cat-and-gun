/* Bilder für die Anleitung (anleitung.html): ein Bildschirmfoto je Kapitel aus dem echten Werkzeug, Testdaten (?beispiel=1), 1512×900 → 1200 px breit.
   Kopie von anleitung_bilder.js der Besucherliste des Culinarium Hannover; in der Cloud mit dem vorinstallierten Playwright und Python (PIL) statt sips.
   node anleitung_bilder.js [basis]   (Server von Visitors muss laufen, eigener Port 9736) */
const path = require('path'), fs = require('fs');
const PW = require('playwright');
const A = process.argv[2] || 'http://127.0.0.1:9736/_werkzeuge/registre/';
const AUS = path.join(__dirname, 'anleitung');
const K = [
  /* Abnahme 28.11.2026: Bilder im neuen Look (26.11.2026); die Kopfkarte ist höher als das frühere Startbild, darum neue Scroll-Stellen */
  ['k01', 'start', 0, null], ['k02', 'start', 610, null], ['k03', 'besuche', 610, null], ['k04', 'besuche', 610, async p => { await p.click('[data-filter="buchung"]'); await p.waitForTimeout(900); }],
  ['k05', 'herkunft', 600, null], ['k06', 'zeit', 610, null], ['k07', 'seiten', 560, null], ['k08', 'verlauf', 610, null], ['k09', 'buchung', 610, null],
  ['k10', 'zaehlung', 420, null]];
(async () => {
  const b = await PW.webkit.launch(); fs.mkdirSync(AUS, { recursive: true });
  for (const [id, v, y, vor] of K) {
    const c = await b.newContext({ viewport: { width: 1512, height: 900 }, deviceScaleFactor: 1 }); await c.addInitScript(() => { try { localStorage.setItem('rundgang-catgun-registre', '1'); } catch (e) {} }); const p = await c.newPage();
    await p.goto(A + '?beispiel=1&gruss=tag#' + v); await p.waitForFunction(() => window.BG_REGISTRE === 1 && document.documentElement.classList.contains('auftakt-da')); await p.waitForTimeout(7000);   /* WebKit braucht für Einflug und Zähler länger (23.11.2026) */
    if (y) { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(3600); }
    if (vor) await vor(p);
    await p.screenshot({ path: path.join(AUS, id + '.png') });
    await c.close();
  }
  await b.close();
  // PNG → JPEG 1200 px (Qualität 82)
  const { execFileSync } = require('child_process');
  execFileSync('python3', ['-c', 'import sys\nfrom PIL import Image\nfor p in sys.argv[1:]:\n im=Image.open(p).convert("RGB"); im=im.resize((1200, round(im.height*1200/im.width)), Image.LANCZOS); im.save(p[:-4]+".jpg", quality=82)',
    ...K.map(([id]) => path.join(AUS, id + '.png'))]);
  for (const [id] of K) fs.unlinkSync(path.join(AUS, id + '.png'));
  console.log('Bilder:', fs.readdirSync(AUS).join(' '));
})();
