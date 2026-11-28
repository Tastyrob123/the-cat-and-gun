#!/usr/bin/env node
/* Bildschirme der Werkzeuge für die Geräte der Säle · Control panel The Cat & Gun (Robert 23.11.2026: «viel mehr geile Mockups … pro Abschnitt»).
   Liste in geraete.json. Chromium, @2x, ohne Bewegung; jede Anfrage ausser GET/HEAD wird abgewiesen (nichts wird geschrieben).
   node _werkzeuge/maison/geraete.js [name …]  → roh/<name>.png (nicht eingecheckt), danach python3 bau.py (webp in img/). */
const path = require('path'), fs = require('fs');
const pw = require(process.env.PLAYWRIGHT || '/Users/robertreff/Desktop/Website-Projekte/_Befund-Vorschlaege/node_modules/playwright');
const HIER = __dirname;
const G = { lap: [1440, 930], ipad: [1180, 885], tel: [390, 848] };   /* Seitenverhältnis wie das Loch im Gerät (Laptop 1,548, iPad 1,333, Handy 0,46) */
const A = JSON.parse(fs.readFileSync(path.join(HIER, 'geraete.json'), 'utf8'));
const nur = process.argv.slice(2);
(async () => {
  fs.mkdirSync(path.join(HIER, 'roh'), { recursive: true });
  const b = await pw.chromium.launch();
  let rot = 0;
  for (const [name, a] of Object.entries(A)) {
    if (name.startsWith('_') || (nur.length && !nur.includes(name))) continue;
    const [w, h] = G[a.g];
    const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, reducedMotion: 'reduce', locale: 'en-GB', hasTouch: a.g === 'tel', isMobile: a.g === 'tel' });
    await c.addInitScript(() => { try { Object.keys(localStorage).forEach(k => { if (/rundgang/.test(k)) localStorage.setItem(k, '1'); }); localStorage.setItem('rundgang-catgun-gesehen', '1'); } catch (e) {} });
    const p = await c.newPage(); const f = [];
    p.on('pageerror', e => f.push(String(e).slice(0, 120)));
    await p.route('**/*', r => ['GET', 'HEAD'].includes(r.request().method()) ? r.continue() : r.abort());
    try { await p.goto(a.u, { waitUntil: 'load', timeout: 45000 }); } catch (e) { f.push('lädt nicht: ' + e.message.split('\n')[0]); }
    await p.waitForTimeout(1800);
    for (let n = 0; n < 2; n++) { const d = await p.$('dialog[open], [role="dialog"]:not([hidden])'); if (!d || !(await d.isVisible())) break; await p.keyboard.press('Escape'); await p.waitForTimeout(400); }
    await p.evaluate(() => document.querySelectorAll('.rdg-kegel,.rdg-karte,.rdg-sperre').forEach(x => x.remove()));
    for (const s of a.s || []) {
      try {
        if (s[0] === 'klick') await (s[3] ? p.locator(s[3]) : p).getByText(s[1], { exact: !!s[2] }).filter({ visible: true }).first().click({ timeout: 6000 });   /* s[3]: nur in diesem Bereich (z. B. aside) */
        if (s[0] === 'css') await p.locator(s[1]).filter({ visible: true }).first().click({ timeout: 6000 });
        if (s[0] === 'roll') await p.evaluate(y => scrollBy(0, y), s[1]);
      } catch (e) { f.push(s.join(' ') + ': ' + e.message.split('\n')[0]); }
      await p.waitForTimeout(s[0] === 'roll' ? 700 : 1300);
    }
    await p.evaluate(() => document.querySelectorAll('.rdg-kegel,.rdg-karte,.rdg-sperre').forEach(x => x.remove()));
    await p.screenshot({ path: path.join(HIER, 'roh', name + '.png') });
    if (f.length) rot++;
    console.log(name.padEnd(16), f.length ? f.join(' | ') : 'ok');
    await c.close();
  }
  await b.close();
  process.exit(rot ? 1 : 0);
})().catch(e => { console.error(String(e)); process.exit(1); });
