#!/usr/bin/env node
/* Ausschnitte der Werkzeuge für die Säle · Control panel The Cat & Gun (Robert 24.11.2026). Liste in ausschnitte.json.
   Chromium, @2x, ohne Bewegung; jede Anfrage ausser GET/HEAD wird abgewiesen (nichts wird geschrieben).
   node _werkzeuge/maison/ausschnitte.js [name …]  → roh/aus-<name>.png (nicht eingecheckt), danach python3 bau.py. */
const path = require('path'), fs = require('fs');
const pw = require(process.env.PLAYWRIGHT || '/Users/robertreff/Desktop/Website-Projekte/_Befund-Vorschlaege/node_modules/playwright');
const HIER = __dirname, A = JSON.parse(fs.readFileSync(path.join(HIER, 'ausschnitte.json'), 'utf8')), nur = process.argv.slice(2);
(async () => {
  fs.mkdirSync(path.join(HIER, 'roh'), { recursive: true });
  const b = await pw.chromium.launch(); let rot = 0;
  for (const [name, a] of Object.entries(A)) {
    if (name.startsWith('_') || (nur.length && !nur.includes(name))) continue;
    const c = await b.newContext({ viewport: { width: a.w || 1440, height: 930 }, deviceScaleFactor: 2, reducedMotion: 'reduce', locale: 'en-GB' });
    await c.addInitScript(() => { try { Object.keys(localStorage).forEach(k => { if (/rundgang/.test(k)) localStorage.setItem(k, '1'); }); localStorage.setItem('rundgang-catgun-gesehen', '1'); } catch (e) {} });
    const p = await c.newPage(), f = [];
    await p.route('**/*', r => ['GET', 'HEAD'].includes(r.request().method()) ? r.continue() : r.abort());
    try { await p.goto(a.u, { waitUntil: 'load', timeout: 45000 }); } catch (e) { f.push('lädt nicht'); }
    await p.waitForTimeout(1500); await p.keyboard.press('Escape');
    for (const s of a.s || []) { try { await p.getByText(s[0], { exact: !!s[1] }).filter({ visible: true }).first().click({ timeout: 6000 }); } catch (e) { f.push('Klick ' + s[0]); } await p.waitForTimeout(1300); }
    await p.evaluate(() => document.querySelectorAll('.rdg-kegel,.rdg-karte,.rdg-sperre').forEach(x => x.remove()));
    const el = p.locator(a.el[0], { has: p.getByText(a.el[1], { exact: true }) }).filter({ visible: true }).first();
    try {
      await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
      const q = await el.boundingBox();
      /* feste Leisten (Kopf, Fuss des Werkzeugs) aus dem Bild nehmen */
      await p.evaluate(() => document.querySelectorAll('body *').forEach(x => { const s = getComputedStyle(x); if (s.position === 'fixed' || s.position === 'sticky') x.style.visibility = 'hidden'; }));
      await p.screenshot({ path: path.join(HIER, 'roh', 'aus-' + name + '.png'), clip: { x: q.x, y: q.y, width: q.width, height: Math.min(q.height, a.h || 1e5) } });
    } catch (e) { f.push('Block: ' + e.message.split('\n')[0]); }
    if (f.length) rot++;
    console.log(name.padEnd(18), f.length ? f.join(' | ') : 'ok');
    await c.close();
  }
  await b.close(); process.exit(rot ? 1 : 0);
})().catch(e => { console.error(String(e)); process.exit(1); });
