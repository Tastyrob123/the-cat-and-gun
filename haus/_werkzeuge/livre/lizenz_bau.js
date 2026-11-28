/* Brand book · The Cat & Gun · Angaben zu Copyright und Lizenz der Schriften (Robert 28.11.2026: Lizenztexte in den Schriften-ZIP, nur was im Projekt belegt ist).
   Im Projekt liegt kein Lizenztext als Datei. Jede Schriftdatei des Fundus trägt aber in ihrer Namenstafel die Copyright-Zeile (Eintrag 0) und die Adresse
   der Lizenz (Eintrag 14). Dieses Skript liest sie aus den WOFF2-Dateien (_werkzeuge/fundus/schrift/) und schreibt schriften-lizenz.json; livre.js legt
   daraus fonts/LICENCE.txt in den ZIP. Nichts wird aus dem Netz geholt, nichts formuliert.   node lizenz_bau.js */
const fs = require('fs'), zlib = require('zlib');
const TAGS = ['cmap','head','hhea','hmtx','maxp','name','OS/2','post','cvt ','fpgm','glyf','loca','prep','CFF ','VORG','EBDT','EBLC','gasp','hdmx','kern','LTSH','PCLT','VDMX','vhea','vmtx','BASE','GDEF','GPOS','GSUB','EBSC','JSTF','MATH','CBDT','CBLC','COLR','CPAL','SVG ','sbix','acnt','avar','bdat','bloc','bsln','cvar','fdsc','feat','fmtx','fvar','gvar','hsty','just','lcar','mort','morx','opbd','prop','trak','Zapf','Silf','Glat','Gloc','Feat','Sill'];
function lies(f) {
  const b = fs.readFileSync(f); if (b.toString('latin1', 0, 4) !== 'wOF2') throw new Error('kein WOFF2');
  const n = b.readUInt16BE(12), comp = b.readUInt32BE(20); let p = 48; const tab = [];
  const u128 = () => { let v = 0; for (let i = 0; i < 5; i++) { const c = b[p++]; v = (v << 7) | (c & 127); if (!(c & 128)) return v >>> 0; } throw new Error('u128'); };
  for (let i = 0; i < n; i++) { const fl = b[p++]; let tag; if ((fl & 63) === 63) { tag = b.toString('latin1', p, p + 4); p += 4; } else tag = TAGS[fl & 63]; const ver = fl >> 6; const orig = u128(); let len = orig;
    const trans = (tag === 'glyf' || tag === 'loca') ? ver === 0 : ver !== 0; if (trans) len = u128(); tab.push({ tag, len }); }
  const d = zlib.brotliDecompressSync(b.subarray(p, p + comp)); let o = 0, name = null; for (const t of tab) { if (t.tag === 'name') name = d.subarray(o, o + t.len); o += t.len; }
  if (!name) return {}; const cnt = name.readUInt16BE(2), so = name.readUInt16BE(4), out = {};
  for (let i = 0; i < cnt; i++) { const r = 6 + i * 12, pl = name.readUInt16BE(r), id = name.readUInt16BE(r + 6), l = name.readUInt16BE(r + 8), off = name.readUInt16BE(r + 10); const raw = name.subarray(so + off, so + off + l);
    let s; if (pl === 3 || pl === 0) { const sw = Buffer.from(raw); sw.swap16(); s = sw.toString('utf16le'); } else s = raw.toString('latin1'); if (!out[id] || pl === 3) out[id] = s; }
  return out;
}
const path = require('path'), DIR = path.join(__dirname, '..', 'fundus', 'schrift'), aus = {};
for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.woff2')).sort()) {
  try { const n = lies(path.join(DIR, f)); aus[f] = { familie: n[1] || '', copyright: n[0] || '', lizenz: n[13] || '', lizenz_adresse: n[14] || '' }; } catch (e) { console.log(f, 'nicht lesbar:', e.message); }
}
fs.writeFileSync(path.join(__dirname, 'schriften-lizenz.json'), JSON.stringify(aus, null, 1) + '\n');
console.log('schriften-lizenz.json:', Object.keys(aus).length, 'Schriften;', Object.entries(aus).filter(([, v]) => !v.copyright || !v.lizenz_adresse).map(([k]) => k).join(', ') || 'jede mit Copyright und Lizenz-Adresse');
