/* pruefung.js · die Kontrollinstanz des Werkzeugs «website». Eigenständig: ohne website.js, ohne Bibliothek.
   Sie prüft (1) diesen Browser und die Dateien des Werkzeugs, (2) fragt den Server nach seiner eigenen Prüfung
   (/the-cat-and-gun/haus/api/x/website/pruefung/<haus>), (3) bietet begrenzte Reparaturen an und (4) kennt im Lexikon jede bekannte Fehlerquelle.
   Jede Fehlermeldung des Werkzeugs trägt ein Stichwort und führt mit “Was tun?” zum Eintrag #lex-<stichwort>.
   Steht ein Stichwort hier nicht, ist das ein Fehler im Lexikon (pruef.js vergleicht die Stichworte von api.py mit dieser Liste). */
(() => {
'use strict';
const HAUS = new URLSearchParams(location.search).get('haus') || '';
/* Anrede (29.10.2026): Häuser, die ihr Team duzen (Culinarium, Robert). Alle anderen behalten «Sie», Wort für Wort wie bisher. */ const DU = ['culinarium'].includes(HAUS); const A = (sie, du) => DU ? du : sie;
const $ = s => document.querySelector(s);
const HAKEN = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7"/></svg>';
const KREUZ = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8"/></svg>';
function el(tag, attrs, ...kinder) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) { if (v === false || v == null) continue; if (k === 'html') e.innerHTML = v; else if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v); }
  for (const k of kinder.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(String(k)));
  return e;
}

// ---------------------------------------------------------------- Lexikon: jede bekannte Fehlerquelle, in Alltagssprache
// Felder: id (Stichwort) · titel · sehen (was Sie sehen) · grund (woran es liegt) · tun (was Sie tun) · worte (Suchbegriffe)
const LEX = [
  { id: 'keine-verbindung', titel: 'The tool does not answer',
    sehen: 'The page stays empty or says “The tool’s server does not answer”. Nothing can be saved.',
    grund: 'Your device has no internet, or the program that serves the tools (serve.py) has stopped.',
    tun: 'First open another website. If that works, the problem is the tool. Then reload this page. If the server still does not answer, tell your contact person. They will restart it. Your draft is on the server and is not lost.',
    worte: 'connection offline empty no answer server internet network loading' },
  { id: 'haus-unbekannt', titel: 'The house is missing from the address or unknown',
    sehen: '“The address does not name the house” or “There is no description for this house”.',
    grund: 'The tool is the same for every house. Which house is meant is in the address after ?haus=. If that is missing or misspelt, the tool does not know which website to show.',
    tun: 'Use the address from your bookmark or from the Control panel. It ends with ?haus= and the short name of your house.',
    worte: 'house address name unknown description missing' },
  { id: 'beschreibung', titel: 'The house description cannot be read',
    sehen: 'The tool does not start and mentions the house description.',
    grund: 'The description lists the pages, languages and sections of your house. The file is damaged or was changed in a wrong way.',
    tun: 'Tell your contact person. None of your content is lost. It is stored separately.',
    worte: 'description house file read start' },
  { id: 'probe-fehlt', titel: 'The copy of the pages is missing',
    sehen: '“The copy of the pages is missing.” The preview and the lists stay empty.',
    grund: 'The tool works on a copy of the built website. This copy is not on the server.',
    tun: 'Tell your contact person. They will make the copy again (probe.py). Your draft and the published version stay as they are and are laid over the pages again afterwards.',
    worte: 'copy pages missing preview empty' },
  { id: 'seite-fehlt', titel: 'A page is missing in the copy or in a language',
    sehen: '“The page is missing in the copy” or “This page does not exist in this language”.',
    grund: 'The description names a page that is not in the copy. Or a page was never built in this language.',
    tun: 'For a language: switch the preview back to the main language. If the main page is missing: tell your contact person.',
    worte: 'page missing language copy' },
  { id: 'seite-unbekannt', titel: 'This page is not part of the website',
    sehen: '“… is not a page of this website.”',
    grund: 'The address names a page the tool does not know for your house, for example from an old bookmark.',
    tun: 'Pick a page in the “Page” list at the top.',
    worte: 'page unknown bookmark' },
  { id: 'sprache-unbekannt', titel: 'Your house does not have this language',
    sehen: '“This house does not have the language ….”',
    grund: 'The request names a language your website is not built in.',
    tun: 'Pick one of the languages shown above the preview.',
    worte: 'language unknown' },
  { id: 'stelle-fehlt', titel: 'A change can no longer find its spot',
    sehen: '“This spot is no longer on the page”, or when publishing: “… changes can no longer find their spot. Nothing was published.”',
    grund: 'Each change belongs to one text or photo on the built page. If the website was built again and that text is now different, the spot is gone. The tool does not guess where the change belongs, and publishes nothing.',
    tun: 'Reload the page and click the spot again. If the message stays when you publish: press “Remove changes without a spot” below and enter the change again in its new spot.',
    worte: 'spot missing place publish rebuilt' },
  { id: 'gesperrt', titel: 'Another tool looks after this spot',
    sehen: 'In the preview a section has a dotted border, with “Locked” on the right.',
    grund: 'Dishes, drinks and prices have one single source: Menus & price lists. If you could change them here too, the website and the printed menu would soon differ.',
    tun: 'Use the button to Menus & price lists and change them there. Texts around the menu (heading, intro) you still change here.',
    worte: 'locked menu prices dishes drinks dotted other tool' },
  { id: 'leer', titel: 'An empty text is not saved',
    sehen: '“An empty text leaves a gap.” or “A notice without text stays invisible.”',
    grund: 'An empty field would leave a gap in the page layout.',
    tun: 'If something should go away completely, use “Hide section”. Otherwise enter a text.',
    worte: 'empty text gap hide' },
  { id: 'zu-lang', titel: 'The text is too long for one spot',
    sehen: '“This text is too long for one spot.”',
    grund: 'One spot holds at most 6000 characters. More than that usually means a whole text was pasted by mistake.',
    tun: 'Shorten the text, or spread it over the spots the page has.',
    worte: 'long text characters' },
  { id: 'foto-unbekannt', titel: 'This photo is not on the website',
    sehen: '“This photo is not on the website.”',
    grund: 'A photo can only be swapped for one that is already on the website. Only for those does the tool know all sizes.',
    tun: 'Pick a photo from the list, or upload your own photo.',
    worte: 'photo picture unknown change' },
  { id: 'link', titel: 'The address of a link is not valid',
    sehen: '“An address starts with https://, mailto: or tel: …”',
    grund: 'A link that leads nowhere would be a dead button on the website.',
    tun: 'Enter the full address, with https:// at the start. For a page of your own website, the file name, for example visit.html. For an email, mailto: and the address.',
    worte: 'link address https mailto tel invalid' },
  { id: 'datum', titel: 'A date cannot be read',
    sehen: '“Write a date like this: 24 Dec 2026”, “This date does not exist” or “Until is before From”.',
    grund: 'The notice for guests appears and disappears by date. For that the date must be clear.',
    tun: 'Write day, month and year with dots: 24.12.2026. “Until” must come after “From”. Empty means no limit.',
    worte: 'date notice from until' },
  { id: 'bereich-aus', titel: 'Your house does not have this section',
    sehen: '“The house does not have this section.”',
    grund: 'Which sections there are is set in the description of your house. A house without a section does not see it.',
    tun: 'Pick one of the sections shown on the left. If one you need is missing: tell your contact person.',
    worte: 'section missing switched off' },
  { id: 'bereich-feld', titel: 'A section cannot find its fields on the pages',
    sehen: 'A section says “Not every field could be found on the pages”. The checks report it under “Sections”.',
    grund: 'The fields of a section are read from the built pages. If the website was rebuilt, some details are now in another place, and the house description still points to the old one.',
    tun: 'Change the detail directly in the preview under “Pages”. That always works. Tell your contact person so they can update the description.',
    worte: 'section field not found' },
  { id: 'zahlen-leer', titel: '“Times” is empty',
    sehen: 'The list shows nothing.',
    grund: 'No time or measure was found on the pages. The pattern for this is in the house description.',
    tun: 'Change numbers directly in the preview under “Pages”. Tell your contact person.',
    worte: 'times empty list' },
  { id: 'nicht-gespeichert', titel: 'Changed, but not saved yet',
    sehen: 'The “Save” button at the top is dark, next to it it says “Changes not saved yet”. When you move on, the tool asks first.',
    grund: 'A change only goes into the draft when you press “Save”. What is only in the field would be lost when you switch views.',
    tun: 'Press “Save” at the top. A small receipt with “Before and after” and “Undo” appears.',
    worte: 'save dark changes lost' },
  { id: 'nicht-veroeffentlicht', titel: 'Saved, but not on the website',
    sehen: 'The change is in the tool but not on the website. At the bottom there is the red “Draft” mark.',
    grund: 'The tool works in two steps. Saved means: in the draft. Only “Publish” puts it on the website.',
    tun: 'Look at “Before and after” at the bottom, then press “Publish”.',
    worte: 'publish draft website not visible' },
  { id: 'nichts-offen', titel: 'Nothing changed, nothing published',
    sehen: '“Nothing changed, nothing published.”',
    grund: 'The draft holds nothing that differs from the published website. Maybe someone else published in the meantime or discarded the draft.',
    tun: 'Reload the page. Earlier versions show who published last.',
    worte: 'nothing changed published empty' },
  { id: 'konflikt', titel: 'Two people changed it at the same time',
    sehen: 'When saving, “Two people changed it at the same time” appears. Or when publishing: “The draft was changed somewhere else in the meantime”.',
    grund: 'Between opening and saving, someone else saved. The tool never quietly overwrites their work.',
    tun: 'Read in the window what came in from the other side. “Save my change” puts your change on top of the new version. If it touches the same spot, the window says so. Look at “Before and after” again before you publish.',
    worte: 'conflict same time two overwrite 409' },
  { id: 'uebersetzung-fehlt', titel: 'A translation is missing',
    sehen: 'At the bottom it says “… translations missing”, and a change has the mark “missing”.',
    grund: 'The text in the main language was changed, the version in another language was not. So that no old detail stays there (an old time, an old price), the tool puts the new main text in that language.',
    tun: 'Open “Languages” on the left, press “Translate” next to the change and enter the version. If only a number changed, the tool suggests the translation with the new number.',
    worte: 'translation missing language' },
  { id: 'sprache-zuordnung', titel: 'Spots in a language cannot be matched',
    sehen: 'The checks show fewer matches under “Matching” than spots in the main language. One spot says “no match”.',
    grund: 'The tool finds the spot in another language by its place in the page layout. If a page is built differently in one language, some spots have no match. The tool changes nothing there instead of guessing.',
    tun: 'Nothing, as long as those spots do not need changing. Otherwise tell your contact person. The spot will be fixed in the website build.',
    worte: 'matching match language layout' },
  { id: 'unveraendert', titel: 'An unchanged page does not come back the same',
    sehen: 'The checks show a difference under “Byte for byte the same”.',
    grund: 'Without changes, the tool must give back every page exactly as it was built. If it does not, it reads a page wrongly.',
    tun: 'Do not publish. Tell your contact person and name the page.',
    worte: 'byte same unchanged difference' },
  { id: 'ausgabe', titel: 'The pages online do not match the published version',
    sehen: 'After publishing: “… not every page could be written”. Or the checks report files that differ.',
    grund: 'The version is published, but something went wrong while writing the pages (full storage, no write permission), or a page was changed by hand.',
    tun: 'Press “Write pages again” below. It writes every page again from the built page and the published version.',
    worte: 'output pages write online difference' },
  { id: 'beschaedigt', titel: 'A saved file is damaged',
    sehen: '“… cannot be read, no backup” or “… and its backup cannot be read”.',
    grund: 'The file with the published version or the draft cannot be read and there is no backup of it. The tool then never quietly reads an empty version. It stops.',
    tun: 'Do not change anything else. Tell your contact person. Earlier versions hold every published version, and the last one is restored from there.',
    worte: 'damaged file backup read' },
  { id: 'aus-sicherung', titel: 'A version came back from the backup',
    sehen: 'The log says “Version taken from the backup”.',
    grund: 'A file was damaged. The tool used the backup: that is the version before the last change. So the last change is missing.',
    tun: 'Look in Earlier versions and in the draft to see which change is missing, and enter it again.',
    worte: 'backup back log last change missing' },
  { id: 'alte-fassung', titel: 'The browser shows an older version of the tool',
    sehen: 'Buttons are missing or do something other than described. The checks say the version of the page does not match the version of the server.',
    grund: 'The browser took files of the tool from its cache, although newer ones are on the server.',
    tun: 'Reload the tool’s page while holding the Shift key. If that does not help: clear the browser cache.',
    worte: 'old version cache reload' },
  { id: 'datei-fehlt', titel: 'A file of the tool is missing',
    sehen: 'The checks report a missing file under “Files of the tool”. The tool looks unstyled or does not react.',
    grund: 'One of the files the tool is made of is not delivered by the server.',
    tun: 'Tell your contact person and name the file.',
    worte: 'file missing unstyled not reacting' },
  { id: 'browser-speicher', titel: 'The browser remembers nothing',
    sehen: 'Your name in the log is gone after reloading, the chosen look jumps back.',
    grund: 'The browser storage for this address is switched off or full (private window, strict settings). This does not affect your content. That is on the server.',
    tun: 'Use a normal window instead of a private one, or allow storage for this address.',
    worte: 'browser storage remember name look private' },
  { id: 'anfrage', titel: 'The request was incomplete',
    sehen: '“What should be changed is missing”, “The tool does not know this kind of change”, “The request is not valid JSON” or “data is missing”.',
    grund: 'The tool sent the server something it does not understand. This happens when the browser shows an older version of the tool than the server.',
    tun: 'Reload the page while holding the Shift key and do it again. If it stays: tell your contact person.',
    worte: 'request incomplete json missing data unreadable' },
  { id: 'zu-gross', titel: 'The request is too large',
    sehen: '“Too large”.',
    grund: 'One request can be at most 20 MB.',
    tun: 'Save the change in smaller steps.',
    worte: 'large request 413' },
  { id: 'weg-unbekannt', titel: 'The server does not know this route',
    sehen: '“Unknown route”, “Not found”, “Not allowed” or “Unknown version”.',
    grund: 'The tool asks for something that is not on the server. Usually the browser shows another version of the tool than the server, or an earlier version was removed.',
    tun: 'Reload the page while holding the Shift key. If it stays: tell your contact person.',
    worte: 'route unknown not found 404 405 version' },
  { id: 'angabe-unbekannt', titel: 'The tool does not know this detail',
    sehen: '“The tool does not know this detail.”',
    grund: '“Phone, address & hours” only shows the details listed in the house description. The browser probably shows an older version.',
    tun: 'Reload the page. If it stays: tell your contact person.',
    worte: 'detail unknown phone address hours' },
  { id: 'angabe-telefon', titel: 'The phone number is not in a valid form',
    sehen: '“A phone number has only digits and spaces, with at most one ‘+’ at the start.”',
    grund: 'The number also makes the link for calling on a phone. Letters, brackets or slashes break it.',
    tun: 'Write the number the way it should appear on the website, with the country code +63 at the start, and save again.',
    worte: 'phone number digits call' },
  { id: 'angabe-mail', titel: 'The email address is not in a valid form',
    sehen: '“An email address looks like this: name@example.com”',
    grund: 'The address needs exactly one @ and an ending like .com.',
    tun: 'Check the address (no spaces, one @) and save again.',
    worte: 'mail email address @' },
  { id: 'bild-kaputt', titel: 'The photo did not arrive completely',
    sehen: '“The file did not arrive completely” or “The file could not be read”.',
    grund: 'The connection broke during the upload, or the file is damaged.',
    tun: 'Pick the photo again. If it fails again: open the photo on your computer, save it again, then upload that version.',
    worte: 'photo upload broken stopped' },
  { id: 'bild-gross', titel: 'The photo is too large',
    sehen: '“The photo is larger than 25 MB.”',
    grund: 'The tool does not take photos over 25 MB. The website needs far less. The tool makes four sizes of every photo anyway.',
    tun: 'Pick a smaller version, for example in the Photos app with “Export” at medium size, and upload that.',
    worte: 'photo large 25 mb upload 413' },
  { id: 'bild-art', titel: 'This file is not a photo',
    sehen: '“This file is not a photo.”',
    grund: 'JPG, PNG and WebP work. A PDF, a text or a video cannot go on the website as a photo.',
    tun: 'Pick a photo in JPG, PNG or WebP. Export iPhone photos (HEIC) as JPG first.',
    worte: 'photo type pdf heic jpg png file' },
  { id: 'bild-klein', titel: 'The photo is too small',
    sehen: '“The photo is only … pixels wide.”',
    grund: 'A photo under 900 pixels wide looks blurry on the website, mostly on large screens.',
    tun: 'Pick the original. A copy from an email or a chat is often smaller.',
    worte: 'photo small pixels blurry' },
  { id: 'unerwartet', titel: 'An unexpected error',
    sehen: '“Unexpected error: …” or “Unexpected answer from the server”.',
    grund: 'Something happened that the tool does not expect. The server writes the error to its output, and the tool remembers it in this browser (above, under “What the tool remembered”).',
    tun: 'Reload the page and try again. If the error comes back: send the exact message from above to your contact person. What you saved is not lost.',
    worte: 'unexpected error 500' },
];
const LEX_GLEICH = { 'anfrage-unlesbar': 'anfrage', 'anfrage-unvollstaendig': 'anfrage', 'nicht-erlaubt': 'weg-unbekannt', 'nicht-gefunden': 'weg-unbekannt', unbekannt: 'weg-unbekannt' };
window.WS_LEXIKON = LEX.map(l => l.id).concat(Object.keys(LEX_GLEICH));
const lexId = s => LEX_GLEICH[s] || (LEX.some(l => l.id === s) ? s : 'unerwartet');

function lexikon(filter) {
  const ort = $('#wsp-lexikon'), f = (filter || '').toLowerCase().trim();
  ort.textContent = '';
  let n = 0;
  LEX.forEach(l => {
    if (f && !(l.titel + ' ' + l.sehen + ' ' + l.grund + ' ' + l.tun + ' ' + l.worte).toLowerCase().includes(f)) return;
    n++;
    ort.append(el('details', { class: 'platte wsp-lex', id: 'lex-' + l.id },
      el('summary', {}, l.titel),
      el('dl', {}, el('dt', { class: 'angabe' }, 'What you see'), el('dd', {}, l.sehen), el('dt', { class: 'angabe' }, 'Why'), el('dd', {}, l.grund), el('dt', { class: 'angabe' }, 'What to do'), el('dd', {}, l.tun))));
  });
  if (!n) ort.append(el('p', { class: 'kuhle', style: 'padding:22px' }, 'There is nothing about this in the help. Send the exact message to your contact person.'));
}
function oeffne(id) {
  $('#wsp-such').value = '';
  lexikon('');
  const e = document.getElementById('lex-' + lexId(id));
  if (e) { e.open = true; e.scrollIntoView({ block: 'start' }); }
}

// ---------------------------------------------------------------- Punkte
function punkt(ort, p) {
  ort.append(el('div', { class: 'wsp-punkt', 'data-gut': p.gut ? 'ja' : 'nein', 'data-punkt': p.id },
    el('span', { class: 'wsp-punkt__z', html: p.gut ? HAKEN : KREUZ, role: 'img', 'aria-label': p.gut ? 'OK' : 'Not OK' }),
    el('span', { class: 'wsp-punkt__t' }, p.titel),
    el('span', { class: 'wsp-punkt__x' }, p.text + ' ', !p.gut && p.lex ? el('a', { href: '#lex-' + lexId(p.lex), onclick: ev => { ev.preventDefault(); oeffne(p.lex); history.replaceState(null, '', '#lex-' + lexId(p.lex)); } }, 'What to do?') : null)));
}
async function hole(weg, opt) {
  let r;
  try { r = await fetch(weg, Object.assign({ cache: 'no-store' }, opt || {})); } catch (e) { throw { stichwort: 'keine-verbindung', fehler: 'The server does not answer.' }; }
  let j = null;
  try { j = await r.json(); } catch (e) { /* keine lesbare Antwort */ }
  if (!r.ok || j == null) throw Object.assign({ stichwort: 'unerwartet', fehler: 'Unexpected answer (' + r.status + ').' }, j || {});
  return j;
}

async function browser() {
  const ort = $('#wsp-browser'), punkte = [];
  let speicherGeht = true;
  try { localStorage.setItem('wsp-probe', '1'); localStorage.removeItem('wsp-probe'); } catch (e) { speicherGeht = false; }
  punkte.push({ id: 'browser-speicher', titel: 'Storage of this browser', gut: speicherGeht, text: speicherGeht ? 'The browser remembers your name and the chosen look.' : 'The browser remembers nothing for this address.', lex: 'browser-speicher' });
  const fehlen = [];
  let seiteV = '';
  for (const d of ['index.html', 'website.js', 'website.css', '/the-cat-and-gun/haus/stamm/welt.css', '/the-cat-and-gun/haus/stamm/welt.js']) {
    try {
      const r = await fetch(d, { cache: 'no-store' });
      if (!r.ok) fehlen.push(d);
      else if (d === 'index.html') seiteV = (/website\.js\?v=([\w.\-]+)/.exec(await r.text()) || [])[1] || '';
      else await r.arrayBuffer();   // Antwort ganz lesen, sonst bleibt die Anfrage offen (Prüfung 23.11.2026: Seite kam nie zur Ruhe)
    } catch (e) { fehlen.push(d); }
  }
  punkte.push({ id: 'dateien', titel: 'Files of the tool', gut: !fehlen.length, text: fehlen.length ? 'Not delivered: ' + fehlen.join(', ') + '.' : 'Page, script, styles and the two looks are delivered.', lex: fehlen.length === 5 ? 'keine-verbindung' : 'datei-fehlt' });
  let gemerkt = [];
  try { gemerkt = JSON.parse(localStorage.getItem('ws-fehler') || '[]').filter(f => !HAUS || !f.haus || f.haus === HAUS); } catch (e) { gemerkt = []; }
  const letzte = gemerkt.slice(-3).reverse();
  punkte.push({ id: 'gemerkt', titel: 'What the tool remembered', gut: !gemerkt.length,
    text: gemerkt.length ? gemerkt.length + ' message(s) in this browser, last: ' + letzte.map(f => '“' + f.text + '” (' + (f.zeit || '').slice(0, 16).replace('T', ' ') + ')').join(' · ') : 'No error message remembered.',
    lex: letzte.length ? letzte[0].stichwort || 'unerwartet' : '' });
  ort.textContent = '';
  punkte.forEach(p => punkt(ort, p));
  return seiteV;
}

async function server(seiteV) {
  const ort = $('#wsp-server');
  ort.textContent = '';
  if (!HAUS) { punkt(ort, { id: 'haus', titel: 'Which house?', gut: false, text: 'The address does not name the house (?haus=…). Only this browser was checked.', lex: 'haus-unbekannt' }); return; }
  let d;
  try {
    const h = await hole('/the-cat-and-gun/haus/api/haus/' + encodeURIComponent(HAUS));
    $('#wsp-haus').textContent = h.name || HAUS;
    punkt(ort, { id: 'verbindung', titel: 'The server answers', gut: true, text: 'Connected.' });
  } catch (e) {
    punkt(ort, { id: 'verbindung', titel: 'The server answers', gut: false, text: e.fehler || 'No answer.', lex: e.stichwort });
    if (e.stichwort === 'keine-verbindung') return;
  }
  try { d = await hole('/the-cat-and-gun/haus/api/x/website/pruefung/' + encodeURIComponent(HAUS)); } catch (e) {
    punkt(ort, { id: 'pruefung', titel: 'Checks on the server', gut: false, text: e.fehler || 'The checks could not run.', lex: e.stichwort });
    return;
  }
  punkt(ort, { id: 'fassung', titel: 'Version of the tool', gut: !seiteV || seiteV === d.version, text: 'Server ' + d.version + (seiteV ? ', page ' + seiteV : '') + '.', lex: 'alte-fassung' });
  d.punkte.forEach(p => punkt(ort, p));
  ort.setAttribute('data-fertig', d.punkte.filter(p => !p.gut).length);
}

// ---------------------------------------------------------------- Reparaturen: erster Druck sagt, was geschieht, der zweite führt aus
const REPARATUREN = [
  { id: 'ausgeben', titel: 'Write pages again', satz: 'Writes every online page again from the built page and the published version. The content does not change.',
    tun: () => hole('/the-cat-and-gun/haus/api/x/website/reparieren/' + HAUS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ was: 'ausgeben', wer: 'pruefung' }) }) },
  { id: 'ohne-platz', titel: 'Remove changes without a spot', satz: 'Takes out of the draft what can no longer find its spot on the website. The published version stays as it is.',
    tun: () => hole('/the-cat-and-gun/haus/api/x/website/reparieren/' + HAUS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ was: 'ohne-platz', wer: 'pruefung' }) }) },
  { id: 'entwurf', titel: 'Discard draft', satz: 'Deletes everything that is saved but not published yet. The website stays as it is.',
    tun: async () => { await hole('/the-cat-and-gun/haus/api/entwurf/' + HAUS + '/website', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wer: 'pruefung' }) }); return { meldung: 'The draft is discarded.' }; } },
  { id: 'notizen', titel: 'Clear the errors this browser remembered', satz: 'Deletes the list above under “What the tool remembered”. Nothing changes on the server.',
    tun: async () => { try { localStorage.removeItem('ws-fehler'); } catch (e) { /* nichts zu leeren */ } return { meldung: 'The list is empty.' }; } },
];
function reparaturen() {
  const ort = $('#wsp-reparaturen');
  ort.textContent = '';
  REPARATUREN.forEach(r => {
    if (!HAUS && r.id !== 'notizen') return;
    const b = el('button', { class: 'wsp-taste', type: 'button', 'data-reparatur': r.id }, r.titel);
    let scharf = 0;
    b.addEventListener('click', async () => {
      if (!scharf) {
        scharf = setTimeout(() => { scharf = 0; b.removeAttribute('data-scharf'); b.textContent = r.titel; }, 6000);
        b.setAttribute('data-scharf', '1'); b.textContent = 'Press again to confirm';
        return;
      }
      clearTimeout(scharf); scharf = 0; b.removeAttribute('data-scharf'); b.textContent = r.titel;
      const m = $('#wsp-meldung');
      m.hidden = false;
      try { const a = await r.tun(); m.textContent = a.meldung || 'Done.'; m.setAttribute('data-ergebnis', 'gut'); } catch (e) {
        m.textContent = (e.fehler || 'That did not work.') + ' '; m.setAttribute('data-ergebnis', 'fehler');
        m.append(el('a', { href: '#lex-' + lexId(e.stichwort), onclick: () => oeffne(e.stichwort) }, 'What to do?'));
      }
      lauf();
    });
    ort.append(el('div', { class: 'platte wsp-rep' }, el('p', { class: 't-zwischen' }, r.titel), el('p', {}, r.satz), b));
  });
}

async function lauf() {
  let v = '';
  try { v = await browser(); } catch (e) { $('#wsp-browser').textContent = 'The browser check failed: ' + (e.message || e); }
  try { await server(v); } catch (e) { $('#wsp-server').textContent = 'The server check failed: ' + (e.message || e); }
  document.body.setAttribute('data-wsp-fertig', '1');
}

if (DU) document.querySelectorAll('[data-du]').forEach(e => e.textContent = e.dataset.du);
if (HAUS) $('#wsp-zurueck').href = './?haus=' + encodeURIComponent(HAUS);
$('#wsp-such').addEventListener('input', ev => lexikon(ev.target.value));
window.addEventListener('hashchange', () => { if (location.hash.startsWith('#lex-')) oeffne(location.hash.slice(5)); });
lexikon('');
reparaturen();
if (location.hash.startsWith('#lex-')) oeffne(location.hash.slice(5));
lauf();
})();
