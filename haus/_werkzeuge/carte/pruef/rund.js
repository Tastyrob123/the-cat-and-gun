// Menus & price lists · The Cat & Gun · Rundlauf (Vorlage: Pairing-Karte im Culinarium): setzt jede Karte aus ihren Daten mit satz.js und vergleicht
// die ganze Datei mit dem Satz satz/u-<karte>.html (satz_bau.py).
// node _werkzeuge/carte/pruef/rund.js [daten-ordner]   (Standard: _daten/grundstand) → je Karte «gleich» oder die erste Abweichung
const fs = require('fs'), path = require('path');
const HIER = path.join(__dirname, '..');
const SATZ = require(path.join(HIER, 'satz', 'satz.js'));
SATZ.zeichen(JSON.parse(fs.readFileSync(path.join(HIER, 'satz', 'zeichen.json'), 'utf8')));
const ordner = process.argv[2] || path.join(HIER, '_daten', 'grundstand');
const esc = t => SATZ.esc(t);
let rot = 0;
for (const f of fs.readdirSync(ordner).filter(f => f.endsWith('.json')).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(ordner, f), 'utf8'));
  const soll = fs.readFileSync(path.join(HIER, 'satz', 'u-' + d.ziel + '.html'), 'utf8');
  const ist = SATZ.dokument(d);
  let erste = '';
  if (soll !== ist) { let k = 0; while (soll[k] === ist[k]) k++; erste = `Zeichen ${k}:\n   soll …${soll.slice(Math.max(0, k - 100), k + 120)}\n   ist  …${ist.slice(Math.max(0, k - 100), k + 120)}`; }
  console.log(`${d.ziel}: ${erste ? 'ANDERS · ' + erste : `gleich (${d.seiten.length} Seiten, ${ist.length} Zeichen)`}`);
  if (erste) rot++;
}
process.exit(rot ? 1 : 0);
