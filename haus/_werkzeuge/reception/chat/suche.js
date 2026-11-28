/* Suche des Chats · The Cat & Gun (22.11.2026, nachgebessert 23.11.2026). Läuft im Browser des Gastes, ohne Server und ohne KI (CLAUDE.md «Grundgerüst ohne KI», Master 2.0 Punkt 4).
   Dieselbe Datei nutzen der Chat auf der Website (chat/chat.js) und «Try the chat» im Werkzeug, darum antworten beide gleich.
   CG_SUCHE.finde(frage, antworten, heute) → { treffer: [antwort, …], sicher: true|false }
   - Wörter werden klein geschrieben, ohne Akzente, Satzzeichen und Emoji; einfache Endungen fallen weg (s, es, ing, ed, 's).
   - Gleichbedeutende Wörter werden auf ein Stichwort gelegt (FAMILIEN): «hours», «closing», «when» → open.
   - Tippfehler: nur in Wörtern ab sieben Zeichen, nur gegen Stichwörter einer Familie, des Titels oder aus «Other ways guests ask», mit gleichem ersten Buchstaben;
     ein falscher, fehlender oder vertauschter Buchstabe, zwei ab zehn Zeichen («breakfst», «adress», «cocktial», «resevation»).
     Ein echtes Wort ist kein Tippfehler: «catering» ist nicht «water», «waiter» nicht «water» (PRUEFUNG.md dritte Runde, Abweichung 1).
   - Gewicht: Stichwort in «Other ways guests ask», im Titel oder als Gericht in einer Zeile «On the menu» («- Chicken Gyros: 260 PHP») 3, sonst im Antworttext 1;
     eine Antwort mit Ablaufdatum («Valid until») zählt nach dem Tag nicht mehr.
   - Sicher ist eine Antwort nur, wenn sie jedes Sachwort der Frage abdeckt. Nicht abgedeckt sein müssen: Füllwörter («exactly», «tomorrow», der Name des Hauses),
     gewöhnliche Wörter (Wochentage, Zahlen, «serve», «make», «see», «take», «finish» …, Liste ALLTAG) und die allgemeinen Wörter einer Familie
     («when», «time», «kitchen», «food» …, Liste ALLTAG). Gezählt wird dabei das Wort, wie der Gast es geschrieben hat, nicht das Stichwort der Familie.
     Gewöhnliche Wörter zählen beim Ordnen weniger als Sachwörter: Bei «What time is the market?» steht der Markt vorn, nicht die Öffnungszeiten.
     Ein Sachwort, das keine gezeigte Antwort kennt («Christmas», «vegan», «halal», «happy hour», «wings», «music», «birthday», «to go», «catering»), schickt die Frage ans Haus:
     der Chat rät nie. (PRUEFUNG.md zweite Runde Abweichung 1, dritte Runde Abweichung 1 und 2) */
(function (g) {
  'use strict';
  var LEER = ('a an the is are am was were be been do does did done you your yours we our ours us i me my mine can could would will shall should ' +
    'to of for in on at and or it its this that these those there here what whats which who whom how much many have has had get got please pls hi hello hey ' +
    'any anything some with about from by as if so just also too very really there theyre they them their thanks thank ok okay im ive id youre dont doesnt is isnt ' +
    'tell know want wanted like would need may might one still yet guys anyone someone something thing things kind sort maybe ' +
    'yo ur wat wats wot pls plz thx sup bro po').split(' ');
  var STOP = {}; LEER.forEach(function (w) { STOP[w] = 1; });
  /* Füllwörter: zählen beim Suchen mit, müssen aber von der Antwort nicht abgedeckt sein (der Name des Hauses, Zeit- und Höflichkeitswörter) */
  var NEBEN = {}; ('cat gun catandgun now tomorrow usually normally exactly currently right go going come coming around actually generally ' +
    'best good nice great place spot cafe here there ever even already soon siargao').split(' ').forEach(function (w) { NEBEN[w] = 1; });
  /* Alltag: Wörter, die in fast jeder Frage stehen können und nichts Eigenes fragen. Sie zählen beim Suchen mit (eine Antwort mit «Sunday» steht vorn),
     verhindern aber keine Antwort, die den Rest der Frage abdeckt. Nur Wörter ohne eigene Sache: kein Gericht, kein Angebot, kein Anlass.
     Zahlen gehören dazu («Cloud 9»), Uhrzeiten wie «6am» nicht. */
  var ALLTAG = {}; ('monday tuesday wednesday thursday friday saturday sunday mon tue tues wed thu thur thurs fri sat sun weekday weekend week day daily every ' +
    'serve served serves serving sell offer accept friendly show bring welcome allow allowed available possible ok fine buy try visit sit enjoy get open opening close closing closed ' +
    'when time today tonight late later early morning evening afternoon night noon hour start starts begin begins end ends finish finished until till ' +
    'kitchen food eat meal hungry lunch dinner menu make made see look check take took give let put use need stuff ' +
    'next last new more other also all big small little many whole people person persons pax guest guests').split(' ').forEach(function (w) { ALLTAG[stamm(w)] = 1; ALLTAG[w] = 1; });
  /* «bring» ist nur Alltag, solange nichts zu essen oder zu trinken mitgebracht wird («Can I bring my kids?» ja, «Can I bring food?» geht ans Haus) */
  var ESSEN = { menu: 1, beer: 1, cocktail: 1, coffee: 1, juice: 1, dessert: 1, wine: 1, drink: 1, snack: 1, cake: 1, bottle: 1 };
  /* Echte Wörter, die einem Stichwort nur zufällig ähnlich sehen: kein Tippfehler */
  var ECHT = {}; ('party music wing sport match game beach pasta pizza water waiter later cater catering coffee toffee desert ' +
    'smoothing smacking burner burning pocket socket docket picket sprite ' +
    /* ECHT-LISTE: häufige englische Wörter ab sieben Zeichen, die nach der Tippfehler-Regel ein Stichwort träfen. Erzeugt mit _bau/echt_bau.js */
    'alcoholics alcohols american americana americans augusta auguste augusto augustus backward backwards backyards baristas batista batteries batters battery billiards bottled bottles breakfasts brewers burgers celebrant celebrate celebrates chickens childrens chocolat chocolates classics cocktails coconuts coffees conceit conceited concepts concert concerted concerts congested contacts content contented contents contests context contexts contract contracted contracting contracts cookies crunchy crystallized delivers desserts dinners directions doubled doubles draughts drought droughts expansive express expressed expresses expressing extensive fashions fervent fingers follows gardens generale generals generated generating googled googles handout handouts hangouts happend happens heights hibiscus hungary interned internets islands kitchens liquors littler located locates locations markets martina martine martinis martino martins mobiles nuggets numbers outdoors outsider outsiders pancakes partners passwords peppers philippians philippines philistine philistines pickups pineapples playgrounds pockets portion portions potions purples rafting ranting ratings reservations reserved reserves reviews sausages scheduled scheduler schedules scheduling screenings screens skewers smoothies smoothly socials specials spirits sundays suprise takeaways tempera thrifty toddlers valleys vendors whisked whisker whiskers ' +
    /* ECHT-ENDE */
    '').split(' ').forEach(function (w) { if (w) { ECHT[w] = 1; ECHT[stamm(w)] = 1; } });
  /* Wörter in Namen von Gerichten, die selbst kein Gericht nennen («Pizza Pita Bread» ist keine Pizza, «Bells Beach Wheat» kein Strand) */
  var DEKO = {}; ('the og out balls mixed battered of day slow cooked breaded mini grilled side double imperial non alcoholic light pipe line bells beach ' +
    'pizza bread house cape heights crimes camas valley crystalline mantua long black green glow turbo purple potion tango punch tropical red ' +
    'super fresh cloud sweet spice classic bagel focaccia glass bottle beer old fashioned godfather jack dirty fizz sour sunrise').split(' ').forEach(function (w) { DEKO[w] = 1; DEKO[stamm(w)] = 1; });
  /* Wortfamilien: alle Wörter einer Zeile werden zum ersten. Nur Wege, wie Gäste auf Englisch fragen, dazu häufige Schreibfehler («adress», «expresso»); keine Angaben über das Haus. */
  var FAMILIEN = [
    'open opening opened hours hour close closing closed time times when today tonight late later early schedule until till',
    'breakfast brekky brekkie brekfast breakfest brakfast',
    'where address location located locate find directions direction map maps route near nearby adress adresse addres adres cloudnah',
    'phone call number contact reach text sms mobile',
    'reserve reservation reservations book booking booked table seat seats',
    'menu food foods eat eating dish dishes meal meals kitchen hungry lunch dinner',
    'price prices cost costs expensive cheap much php peso pesos',
    'kid kids child children family families toddler baby little',
    'playground slide climbing garden backyard yard',
    'pool billiard billiards snooker cue',
    'beer beers draught draft tap taps lager ipa ale pilsner brew brewery craft',
    'cocktail cocktails martini mojito alcohol booze liquor spirits',
    'coffee coffees latte espresso cappuccino americano flatwhite barista expresso capuccino cappucino',
    'juice juices smoothie smoothies shake shakes',
    'dessert desserts sweet sweets cake cakes tiramisu cheesecake',
    'delivery deliver delivering travelgo',
    'event events market markets screening screenings happening upcoming whatson',
    'instagram insta ig social',
    'wifi wi-fi internet password wlan',
    'review reviews rating ratings stars google'
  ];
  var KANON = {};
  FAMILIEN.forEach(function (z) { var l = z.split(' '); l.forEach(function (w) { KANON[stamm(w)] = l[0]; }); });
  /* Wörter, deren Stamm in eine Familie fiele, die aber etwas anderes meinen: «books» (zum Lesen) ist kein «book a table» */
  var EIGEN = { books: 1, findings: 1, seating: 1 };
  /* Wörter mit zwei Bedeutungen: Sie zählen nur, wenn die Frage auch ein Wort aus ihrer Sache enthält. Sonst kennt keine Antwort das Wort, und die Frage geht ans Haus.
     «Is it good for a date?» ist kein Termin, «Where is your coffee from?» keine Adresse, «Can I order at the table?» keine Lieferung,
     «Do you have water?» kein Kokoswasser, «What is the special today?» kein Brekky Special (PRUEFUNG.md fünfte Runde, Abweichung 1 und Hinweise) */
  var SACHE = {
    date: 'next event upcoming new instagram market', dates: 'next event upcoming new instagram market',
    special: 'breakfast bagel combo', specials: 'breakfast bagel combo',
    order: 'delivery online travelgo app home', orders: 'delivery online travelgo app home', ordering: 'delivery online travelgo app home',
    water: 'coconut buko', coke: 'rum cocktail', seat: 'reserve phone', seats: 'reserve phone',
    online: 'order delivery deliver travelgo', friendly: 'kid family child baby dog pet',
    /* neunte Runde: «local» steht nur bei Bier und Markt («local food» ist nicht belegt); «Cloud 9» ist nicht der Weg zum Haus, nur mit near/from oder dem Contest */
    local: 'beer brew brewery craft draught market vendor thrift',
    way: 'egg eggs breakfast brekky sourdough',
    cloud: 'contest screen screening watch show wsl live surf beer brewery island'
  };
  Object.keys(SACHE).forEach(function (w) { var m = {}; SACHE[w].split(' ').forEach(function (k) { m[k] = 1; }); SACHE[w] = m; });

  function ohneAkzent(s) { return String(s || '').normalize ? String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '') : String(s || ''); }
  function stamm(w) {
    if (w.length > 5 && /ing$/.test(w)) return w.slice(0, -3);
    if (w.length > 4 && /ies$/.test(w)) return w.slice(0, -3) + 'y';
    if (w.length > 4 && /(ches|shes|sses|xes)$/.test(w)) return w.slice(0, -2);
    if (w.length > 4 && /ed$/.test(w) && !/eed$/.test(w)) return w.slice(0, -2);
    if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1);
    return w;
  }
  /* Tippfehler erlaubt? Ab sechs Zeichen, gleicher Anfang, kein echtes Wort; ein Fehler, zwei ab zehn Zeichen */
  function tippfehler(w, k) {
    if (w.length < 7 || k.length < 6 || w.slice(0, 2) !== k.slice(0, 2) || ECHT[w]) return false;
    var max = Math.min(w.length, k.length) >= 10 ? 2 : 1;
    return abstand(w, k, max) <= max;
  }
  function woerter(s, roh, stelle, zwei) {
    if (zwei === true) zwei = []; else zwei = null;
    var t = ohneAkzent(s).toLowerCase().replace(/\bwhat\s*(['’`]?s|\s+is)\s+(going\s+)?on\b(?!\s+(the|your|a|an|my|our|it|top|menu|tap|draught)\b)/g, 'whatson')
      /* eine Show, ein Auftritt: keine Angabe nennt eins; «tonight», «today» machen daraus keine Frage nach Öffnungszeiten (PRUEFUNG.md neunte Runde) */
      .replace(/\b(a|an|any|the|some|your|live) (shows?|gigs?|concerts?|performances?|bands?)\b|\bshows? (tonight|today|this)\b/g, ' auftritt $3 ')
      .replace(/\b(anything|something)( going)? on\b(?!\s+(the|your|a|an|my|our|it|top|menu|tap|draught)\b)|\b(anything|something)(?= (tonight|today|this (weekend|week|evening|sunday|saturday|friday))\b)/g, 'whatson')
      /* «Cloud 9» zählt als Lage des Hauses nur, wenn nach dem Haus gefragt wird («Is it near Cloud 9?»); «Where is Cloud 9?» geht ans Haus */
      .replace(/\b(you|it|catandgun|cafe|place)\b(.*?)\b(near|close to|from)\s+cloud\s*9\b/g, '$1$2$3 cloudnah')
      /* woher etwas kommt, steht in keiner Angabe (ausser beim Bier: Siargao Island Brewery): «Is the coffee from Siargao?», «Where do you get your coffee?» */
      .replace(/^(?!.*\b(beers?|brew\w*|lagers?|ipas?|ales?|draught|draft|craft)\b)(.*)\bfrom (siargao|the philippines|philippines|mindanao|here)\b/, '$2origin').replace(/\bwhere do (you|they) get (your|the|their) /g, 'origin ')
      /* «by the way» fragt nichts; «the way to you», «which way» ist der Weg zum Haus; «way» sonst nur bei Eiern («Eggs your way») */
      .replace(/\bby the way\b|\b(a|any|another) way to\b/g, ' ').replace(/\b(show me )?the way( to (you|there|the cafe|catandgun))?\b|\bwhich way\b/g, ' directions ')
      .replace(/['’`]s\b/g, '').replace(/['’`]/g, '').replace(/\b(the )?cat ?(&|and|n|'?n'?) ?(the )?gun\b/g, ' catandgun ').replace(/wi-fi/g, 'wifi').replace(/flat white/g, 'flatwhite').replace(/take[ -]?away/g, 'takeaway').replace(/\bpool ?tables?\b/g, 'pool').replace(/\blater\b/g, 'late').replace(/\bnew years?\b/g, 'newyear').replace(/\bto go\b(?=\W*$)/, 'togo')
      .replace(/^\W*good (morning|afternoon|evening|day)\b\W*/, ' ').replace(/\blast (calls?|orders?)\b/g, 'lastorder').replace(/\bdate ?nights?\b/g, 'datenight')
      .replace(/\b(good|black|holy) (friday|thursday|saturday|week)\b/g, 'feiertag').replace(/\bwhat(s| is| are)? (is |are )?(there )?(to do )?(near|nearby|around)\b/g, 'umgebung')
      .replace(/\b(can|could|may) (i|we) (sell|rent)\b/g, 'verkaufen').replace(/\bhow many (tables?|seats?|people|guests?|persons?)\b/g, 'kapazitaet')
      .replace(/\bwhisky\b/g, 'whiskey').replace(/\bwhere\b(.*)\bfrom\W*$/, 'origin $1')
      .replace(/\b(when did\s+(you|it|catandgun|the cafe|the place)\s+(open|start)|since when|how long have you been (open|around|here))\b/g, 'since')
      .replace(/whats on\b(?!\s+(the|your|a|an|my|our|it|top|menu|tap|draught)\b)/g, 'whatson').replace(/\b(get there|get to you|find you)\b/g, 'directions').replace(/[^a-z0-9&]+/g, ' ').trim();
    if (!t) return [];
    var aus = [];
    t.split(' ').forEach(function (w, n) {
      if (!w || STOP[w] || w.length < 2 && !/\d/.test(w)) return;
      var st = stamm(w), k = EIGEN[w] ? '' : (KANON[st] || KANON[w] || KANON[stamm(st)]);   // «bookings» → booking → book
      if (!k && !EIGEN[w] && st.length >= 6) {   // Tippfehler in einem Wort einer Familie («adress», «resevation»)
        for (var f in KANON) if (tippfehler(st, f)) { k = KANON[f]; break; }
      }
      aus.push(roh ? st : (k || st)); if (stelle) stelle.push(n);
      if (zwei) zwei.push(SACHE[w] ? w : '');
    });
    if (zwei) zwei.forEach(function (w, i) {   // ohne Wort aus seiner Sache trägt das Wort ein Kennzeichen, das keine Antwort kennt
      if (!w) return;
      var mit = aus.some(function (x, j) { return j !== i && (SACHE[w][x] || SACHE[w][zwei[j]]); }) ||
        t.split(' ').some(function (x) { return x !== w && SACHE[w][stamm(x)]; });
      if (!mit) aus[i] = '~' + w;
    });
    return aus;
  }
  function abstand(a, b, max) {   // Abstand nach Levenshtein, ein vertauschtes Nachbarpaar zählt als ein Fehler («cocktial»)
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (j = 0; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) {
      var klein = max + 1;
      for (j = 1; j <= b.length; j++) {
        var c = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        if (d[i][j] < klein) klein = d[i][j];
      }
      if (klein > max) return max + 1;
    }
    return d[a.length][b.length];
  }
  function gerichte(text) {   // Namen der Gerichte aus den Zeilen «- Name: Preis» einer Karten-Antwort
    var aus = [];
    String(text || '').split('\n').forEach(function (z) {
      var m = z.match(/^\s*[-–•]\s*(.+?):\s*[\d.,\s\/]+(PHP|₱)?/i);
      if (!m) return;
      var art = z.slice(m[0].length).match(/^[^(]*\(([^)]*)\)\s*$/);   // Art nach dem Preis: «(Red & White)», «(Prosecco)»
      var name = m[1].replace(/\(.*?\)/g, ' ') + (art ? ' ' + art[1] : ''), roh = woerter(name, true);
      woerter(name).forEach(function (w, i) { if (!DEKO[roh[i]] && !DEKO[w]) aus.push(w); });   // «Sweet Berry Pancakes» macht kein Dessert
    });
    return aus;
  }
  function verzeichnis(a) {   // je Antwort einmal: Stichwörter mit Gewicht
    if (a.__vz) return a.__vz;
    var vz = {};
    var dazu = function (l, gw) { l.forEach(function (w) { if (!vz[w] || vz[w] < gw) vz[w] = gw; }); };
    dazu(woerter(a.antwort), 1);
    /* der Name des Bereichs hilft nur beim Ordnen, deckt aber kein Wort der Frage: «Pool & playground» macht aus «Playground» keinen Pool für Kinder (PRUEFUNG.md fünfte Runde) */
    var bz = {}; woerter(a.bereich).forEach(function (w) { bz[w] = 1; });
    dazu(gerichte(a.antwort), 3);
    dazu(woerter(a.frage), 3);
    dazu(woerter((a.woerter || []).join(' ')), 3);
    var r = {}; woerter(a.frage + ' ' + a.antwort + ' ' + (a.woerter || []).join(' '), true).forEach(function (w) { r[w] = 1; });
    var ti = {}; woerter(a.frage, true).forEach(function (w) { ti[w] = 1; });
    vz.__roh = r; vz.__bereich = bz; vz.__titel = ti;
    /* «braucht»: eine Angabe kommt nur in Frage, wenn die Frage eines ihrer Themenwörter enthält («Breakfast times» nur mit breakfast oder brekky) */
    if (a.braucht && a.braucht.length) { var br = {}; woerter(a.braucht.join(' '), true).forEach(function (w) { br[w] = 1; }); vz.__braucht = br; }
    try { Object.defineProperty(a, '__vz', { value: vz, enumerable: false }); } catch (e) { /* eingefroren */ }
    return vz;
  }
  function gilt(a, heute) { return !a.aus && (!a.bis || !heute || String(a.bis) >= heute); }
  function heuteIso() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function alltag(w) { return ALLTAG[w] || /^\d+$/.test(w); }

  function finde(frage, antworten, heute) {
    var stelle = [], q = woerter(frage, false, stelle, true), roh = woerter(frage, true, null, true), einzeln = [], sach = [], allein = {}, paare = [], vorher = null;
    var mitEssen = q.some(function (w) { return ESSEN[w]; });
    /* «cat» oder «gun» allein ist nicht der Name des Hauses, sondern ein Sachwort: «Can I play with the cats?» geht ans Haus */
    var name = (roh.indexOf('cat') >= 0) === (roh.indexOf('gun') >= 0);
    var neben = function (w) { return NEBEN[w] && (name || (w !== 'cat' && w !== 'gun')); };
    roh.forEach(function (w, i) {   // Sachwörter: woerter() liefert roh und q in gleicher Reihenfolge
      if (neben(w) || neben(q[i])) return;
      if (alltag(w) && !(w === 'bring' && mitEssen)) return;
      if (sach.indexOf(q[i]) < 0) sach.push(q[i]);
      if (vorher && vorher.n === stelle[i] - 1 && vorher.w !== q[i]) paare.push([vorher.w, q[i]]);
      vorher = { w: q[i], n: stelle[i] };
    });
    /* «where» ist nur der Rahmen der Frage, sobald sie eine Sache nennt: «Where is the restroom?» fragt nach dem Restroom, nicht nach der Adresse */
    var wo = roh.indexOf('where');
    if (wo >= 0 && sach.length > 1) sach = sach.filter(function (w) { return w !== q[wo]; });
    q.forEach(function (w) { if (einzeln.indexOf(w) < 0) einzeln.push(w); });
    var kern = einzeln.filter(function (w) { return !neben(w); });
    /* Füllwörter zählen nur, wenn die Frage aus nichts anderem besteht («The Cat & Gun?», «What kind of place is it?»);
       «cat» oder «gun» allein ist nicht der Name des Hauses: «Do you have cats?» geht ans Haus */
    if (kern.length) { einzeln = kern; roh = roh.filter(function (w) { return !neben(w); }); }
    else if (!name) einzeln = [];
    if (!einzeln.length) return { treffer: [], sicher: false, woerter: [] };
    /* nur «teuer», «billig», «wie viel» ohne Gericht oder Getränk: keine Angabe nennt das Haus teuer oder billig */
    if (sach.length && sach.every(function (w) { return w === 'price'; })) return { treffer: [], sicher: false, woerter: einzeln, offen: ['price'] };
    heute = heute === undefined ? heuteIso() : heute;
    /* Wörter, die nur als Alltag dastehen, zählen beim Ordnen weniger, sobald die Frage ein Sachwort hat */
    einzeln.forEach(function (w) { allein[w] = sach.length && sach.indexOf(w) < 0 ? 0.4 : 1; });
    var TAGE = /^(mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)(day)?$|^weekend$|^weekday$/;
    var zaehlt = sach.length ? sach : einzeln.filter(function (w) { return !TAGE.test(w); });   // «Is the kitchen open on Monday?»: der Tag allein ist keine Sache
    if (!zaehlt.length) zaehlt = einzeln;
    var liste = (antworten || []).filter(function (a) {
      if (!gilt(a, heute)) return false;
      var br = verzeichnis(a).__braucht;   // ohne Themenwort der Angabe kommt sie nicht in Frage
      return !br || q.some(function (w) { return br[w]; }) || woerter(frage, true).some(function (w) { return br[w]; });
    }).map(function (a) {
      var vz = verzeichnis(a), summe = 0, gedeckt = 0, stark = 0, deckt = {};
      einzeln.forEach(function (w) {
        var best = vz[w] || 0;
        if (!best && vz.__bereich[w]) { summe += 0.5 * allein[w]; return; }
        if (!best && w.length >= 6) {   // Tippfehler nur gegen starke Stichwörter (Titel, «Other ways guests ask», Gericht)
          Object.keys(vz).forEach(function (k) { if (k.slice(0, 2) !== '__' && vz[k] >= 3 && vz[k] * 0.8 > best && tippfehler(w, k)) best = vz[k] * 0.8; });
        }
        if (best) {
          summe += best * allein[w]; deckt[w] = 1;
          if (zaehlt.indexOf(w) >= 0) { gedeckt++; if (best >= 2.4) stark++; }
        }
      });
      roh.forEach(function (w) { if (vz.__roh[w] && !STOP[w]) summe += alltag(w) && sach.length ? 0.2 : 0.5; });
      roh.forEach(function (w) { if (vz.__titel[w] && !STOP[w] && !alltag(w)) summe += 0.3; });   // dasselbe Wort steht im Titel («families» → «Families»)   // dasselbe Wort wie gefragt («latte») zählt etwas mehr als nur dieselbe Familie
      return { a: a, punkte: summe, anteil: gedeckt / zaehlt.length, stark: stark, deckt: deckt };
    }).filter(function (x) { return x.punkte > 0; });
    liste.sort(function (x, y) { return y.punkte - x.punkte || y.anteil - x.anteil; });
    /* eine Antwort, die jedes Sachwort selbst abdeckt, steht vor einer, die nur einen Teil abdeckt */
    if (sach.length) {
      var voll = liste.filter(function (x) { return sach.every(function (w) { return x.deckt[w]; }); });
      if (voll.length) liste = voll.concat(liste.filter(function (x) { return voll.indexOf(x) < 0; }));
    }
    /* nur gewöhnliche Wörter («What is new on the menu?»): eine Antwort, die alle stark abdeckt, steht vor einer, die nur eins abdeckt */
    if (!sach.length && zaehlt.length > 1) {
      var ganz = liste.filter(function (x) { return x.anteil === 1 && x.stark >= 1; });
      if (ganz.length) liste = ganz.concat(liste.filter(function (x) { return ganz.indexOf(x) < 0; }));
    }
    var erst = liste[0];
    if (!erst) return { treffer: [], sicher: false, woerter: einzeln };
    /* sicher: ein starkes Stichwort und mehr als ein Drittel der Frage gedeckt, oder sehr viel Text gedeckt */
    var sicher = (erst.stark >= 1 && erst.anteil > 0.34) || (erst.punkte >= 3 && erst.anteil >= 0.5);
    var gezeigt = sicher ? liste.filter(function (x, i) { return i === 0 || (i < 2 && x.punkte >= erst.punkte * 0.88 && x.stark >= 1); }) : [];
    /* jedes Sachwort der Frage muss in einer gezeigten Antwort stehen; sonst ist die Frage nicht beantwortet und geht ans Haus.
       Geprüft wird das Wort, wie es dasteht («when» ist Alltag, auch wenn es zur Familie «open» gehört); abgedeckt ist es über sein Stichwort. */
    /* jede gezeigte Antwort muss alle Sachwörter selbst abdecken: «Where can I surf?» ist weder die Adresse noch die Übertragung (PRUEFUNG.md siebte Runde) */
    var offen = [];
    if (gezeigt.length) gezeigt = gezeigt.filter(function (x, i) { return i === 0 || sach.every(function (w) { return x.deckt[w]; }); });
    sach.forEach(function (w) { if (offen.indexOf(w) < 0 && !(gezeigt[0] && gezeigt[0].deckt[w])) offen.push(w); });
    /* zwei Sachwörter direkt nebeneinander («hot chocolate», «red wine») muss eine Antwort zusammen abdecken, nicht zwei verschiedene */
    paare.forEach(function (p) { if (!gezeigt.some(function (x) { return x.deckt[p[0]] && x.deckt[p[1]]; })) offen.push(p.join(' ')); });
    if (offen.length) { sicher = false; gezeigt = []; }
    var treffer = gezeigt.map(function (x) { return x.a; });
    return { treffer: treffer, sicher: sicher, woerter: einzeln, offen: offen };
  }
  g.CG_SUCHE = { finde: finde, woerter: woerter, gilt: gilt, heute: heuteIso };
  if (typeof module === 'object' && module.exports) module.exports = g.CG_SUCHE;
})(typeof window !== 'undefined' ? window : globalThis);
