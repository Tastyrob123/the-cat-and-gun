document.documentElement.classList.add('js');   /* Bewegung nur mit Skript; als Datei statt eingebettet (Sicherheitsregel online) */
/* Fehlermelder (R03), vor allem anderen: Skriptfehler in den Browser (catgun_werkzeuge_fehler) und an den Server-Teil (studio/api/fehler, wenn es ihn gibt).
   Netzfehler nie melden, höchstens 20 je Seite, eigener Fehlschlag wird nicht erneut gemeldet. */
(function(){var zahl=0;function merk(t){t=String(t);window.MAISON_FEHLER=t;if(++zahl>20||/Load failed|access control|abort|NetworkError|Failed to fetch/i.test(t))return;
try{var a=JSON.parse(localStorage.getItem('catgun_werkzeuge_fehler')||'[]');a.unshift({zeit:new Date().toISOString(),art:'maison',text:('Control panel: '+t).slice(0,400),ort:location.pathname});localStorage.setItem('catgun_werkzeuge_fehler',JSON.stringify(a.slice(0,30)))}catch(e){}
try{fetch('/studio/api/fehler',{method:'POST',headers:{'Content-Type':'application/json','X-Studio':'1'},body:JSON.stringify({text:('Control panel · '+t).slice(0,600)}),keepalive:true}).catch(function(){})}catch(e){}}
window.addEventListener('error',function(e){if(e.target&&e.target.tagName==='SCRIPT'){window.MAISON_FEHLER='The file '+e.target.getAttribute('src').split('?')[0]+' could not be loaded.';return}merk((e.message||'Error')+' · '+(e.filename||'').split('/').pop()+':'+(e.lineno||''))},true);
window.addEventListener('unhandledrejection',function(e){merk('Promise: '+((e.reason&&e.reason.message)||e.reason))});
/* Startfehler-Tür (R04): ist maison.js beim Laden nicht durchgelaufen, sagt die Seite es und zeigt alles ohne Bewegung. Wache nach 12 s. */
function tuer(){if(window.MAISON_BEREIT)return;var t=document.getElementById('tuer');if(!t||!t.hidden)return;
document.documentElement.classList.remove('js');document.getElementById('tuer-t').textContent=window.MAISON_FEHLER||'The program of the page did not finish.';t.hidden=false}
window.addEventListener('load',tuer);setTimeout(tuer,12000);})();
