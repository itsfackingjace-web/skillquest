// ---- 218. Patrons: the flame emblem, the fire cape, and the credits ----
// `patron/<uid>` {s: since, u: paid through (ms), c: fire cape earned} is written only by developers (Dev Suite > Art Room
// inbox > Patrons, and later the payment server). Everyone signed in reads the whole node (`P`, onValue), like 061's OG list.
// Active patron (u > now) = a flame emblem next to the name: over heads (outermost drawHUD, placed left of 061's name and
// OG crown using the same layout as 061's `one`), in chat lines (a MutationObserver on #mpl adds an <img> before b.nm[data-u]).
// Fire cape (c, kept forever): worn from Options > PATRON (`fcw` in the save, always written), sent as ch.fcp=1 through gearCH;
// 201 paints it (animated). Other players' ch.fcp is dropped every frame unless their own patron record has c (no spoofing).
// Credits (Options > ABOUT > Credits, ptab 46): `pcred/<uid>` {n,t} written by each patron's game while "Show me in the
// credits" is on (localStorage sq_pcred, default on; never for under-13, the rules check), listed alphabetically with no
// amounts; `artcred/<id>` {n,w} = approved Art Room work (written by devs).
(()=>{const myNm=()=>{try{const m=window.SQMP;return String((typeof PNAME!=='undefined'&&PNAME)||((m&&m.user&&m.user.displayName)||'').split(' ')[0]||'Adventurer').replace(/[<>]/g,'').slice(0,12)}catch(e){return'Adventurer'}};const mp=()=>window.SQMP,F=()=>window.SQFB,uid=()=>{const m=mp();return m&&m.user?m.user.uid:''};
 let PR={},listening='';
 const rec=u=>u&&PR[u]||null,active=u=>{const r=rec(u);return!!(r&&typeof r.u==='number'&&r.u>Date.now())},cape=u=>{const r=rec(u);return!!(r&&r.c)};
 function listen(){const m=mp(),Fb=F();if(!m||!m.on||!m.user||!Fb){return}if(listening===m.user.uid)return;listening=m.user.uid;
  try{Fb.db.onValue(Fb.db.ref(Fb.D,'patron'),s=>{const v=s.val()||{};PR={};for(const k in v)if(v[k]&&typeof v[k]==='object')PR[k]=v[k];syncCred();try{if(ptab===8&&pnOpen)rPn()}catch(e){}},()=>{})}catch(e){}}
 setInterval(listen,1500);
 // ---- the flame emblem (our own pixel art: a 9x11 flame with a flickering tip) ----
 const FLC={K:'#2a0c06',R:'#c8300e',O:'#f07a20',Y:'#f8c838',W:'#fff2b0'};
 const ROWS=[['....K....','...KRK...','...KROK..','..KROORK.','.KRROYORK','.KROYYORK','KROYYWYOK','KROYWWYOK','KROYWWYOK','.KROYYOK.','..KKKKK..'],
  ['...K.....','..KRK....','..KROK...','..KROORK.','.KRROYORK','.KROYYORK','KROYYWYOK','KROYWWYOK','KROYWWYOK','.KROYYOK.','..KKKKK..']];
 const MAP=FLC;const FL=ROWS.map(rows=>{const c=document.createElement('canvas');c.width=9;c.height=11;const x=c.getContext('2d');rows.forEach((row,j)=>{for(let i=0;i<9;i++){const ch=row[i];if(MAP[ch]){x.fillStyle=MAP[ch];x.fillRect(i,j,1,1)}}});return c});
 const flameURL=(()=>{const c=document.createElement('canvas');c.width=18;c.height=22;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(FL[0],0,0,18,22);return c.toDataURL()})();
 const flameImg=()=>{const i=document.createElement('img');i.src=flameURL;i.alt='Patron';i.title='Patron';i.className='sqpf';return i};
 window.SQFLAMEURL=flameURL;
 {const st=document.createElement('style');st.textContent=`img.sqpf{width:.75em;height:.92em;image-rendering:pixelated;vertical-align:-.1em;margin-right:3px}
#pn .pcr{font:500 15px/1.5 ${PF}}#pn .pcr h3{font:700 17px ${PF};margin:16px 0 6px}#pn .pcr ul{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:4px 14px}
#pn .pcr li{display:flex;align-items:center;gap:4px}#pn .pcr .muted{opacity:.7;font-size:13px}`;document.head.appendChild(st)}
 // over heads: left of the name (and left of the OG crown when there is one)
 {const _dh=drawHUD;drawHUD=function(){const out=_dh.apply(this,arguments);try{const m=mp();if(!m||!m.on||!m.T||performance.now()-m.Tat>120||pnOpen||menuOpen||typeof mpVis!=='function')return out;
    const u=Math.max(2,Math.round(Math.min(W,H)/160)),sz=Math.round(5*u),cs=Math.max(1,Math.round(u*.7)),fc=Math.max(1,Math.round(cs*.85)),T=m.T,fr=FL[Math.floor(performance.now()/260)%2];
    g.save();g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;g.font='700 '+sz+'px '+PF;
    const one=(x,y,name,uidx)=>{if(!name||!active(uidx))return;const p=T.transformPoint({x,y:y-27});const tw=g.measureText(name).width;const og=!!(m.og&&m.og[uidx]);
     const left=p.x-tw/2-u-(og?9*cs+u:0)-9*fc;g.drawImage(fr,Math.round(left),Math.round(p.y-sz*.75-(11*fc-7*cs)),9*fc,11*fc)};
    for(const r of mpVis())one(r.x,r.y,r.n,r.uid);
    if(m.selfName&&!dead&&m.user)one(P.x,P.y,myNm(),m.user.uid);
    g.restore()}catch(e){window.__pfErr=String(e&&e.stack||e)}return out}}
 // chat lines
 {const lst=document.getElementById('mpl');if(lst)new MutationObserver(ms=>{for(const mu of ms)for(const n of mu.addedNodes){if(!(n instanceof HTMLElement))continue;
   for(const b of n.matches&&n.matches('b.nm[data-u]')?[n]:n.querySelectorAll?n.querySelectorAll('b.nm[data-u]'):[]){const u2=b.dataset.u;if(u2&&active(u2)&&!(b.previousSibling&&b.previousSibling.className==='sqpf'))b.before(flameImg())}}}).observe(lst,{childList:true,subtree:true})}
 // ---- the fire cape ----
 let WEAR=false;
 {const _s=snap;snap=function(){const o=_s.apply(this,arguments);try{o.fcw=WEAR?1:0}catch(e){}return o}}
 {const _a=applySave;applySave=function(s){const r=_a.apply(this,arguments);try{WEAR=!!(s&&s.fcw)}catch(e){}return r}}
 {const _g=gearCH;gearCH=function(){const c=_g.apply(this,arguments);if(WEAR&&cape(uid()))c.fcp=1;else delete c.fcp;return c}}
 {const _u=upd;upd=function(){try{const m=mp();if(m&&m.players)for(const [u2,r] of m.players){if(r&&r.ch&&r.ch.fcp&&!cape(u2||r.uid))delete r.ch.fcp}}catch(e){}return _u.apply(this,arguments)}}
 // ---- credits ----
 let credPref=true;try{credPref=localStorage.getItem('sq_pcred')!=='0'}catch(e){}
 let credSent='';
 function syncCred(){const u=uid(),Fb=F();if(!u||!Fb||!rec(u))return;const kid=window.SQAGE&&SQAGE.child();const n=myNm().slice(0,12);
  const want=credPref&&!kid&&n?n:'';if(credSent===u+'|'+want)return;credSent=u+'|'+want;const r=Fb.db.ref(Fb.D,'pcred/'+u);
  (want?Fb.db.set(r,{n:want,t:Date.now()}):Fb.db.remove(r)).catch(()=>{credSent=''})}
 setInterval(syncCred,20000);
 const CTAB=46;let CR={p:[],a:[],at:0};
 async function loadCredits(){const Fb=F();if(!Fb||!uid())return;try{const[p,a]=await Promise.all([Fb.db.get(Fb.db.ref(Fb.D,'pcred')),Fb.db.get(Fb.db.ref(Fb.D,'artcred'))]);
   CR.p=Object.values(p.val()||{}).map(x=>x&&x.n).filter(Boolean).sort((x,y)=>x.localeCompare(y,undefined,{sensitivity:'base'}));
   CR.a=Object.values(a.val()||{}).filter(x=>x&&x.n&&x.w).sort((x,y)=>x.n.localeCompare(y.n));CR.at=Date.now()}catch(e){}if(ptab===CTAB&&pnOpen)rPn()}
 const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 function creditsHTML(){const f='<img class="sqpf" src="'+flameURL+'" alt="">';
  return '<div class="tl">CREDITS</div><div class="pcr"><h3>Head Developer</h3><p>Jace Holman</p><h3>Lead Administrator</h3><p>Heather Holman</p>'+
   '<h3>Special thanks</h3><p>To my kids and nephews, for inspiring me to make SkillQuest into something they would love. And to every player who tests the game, reports bugs and shares ideas.</p>'+
   '<h3>Patrons</h3>'+(!uid()?'<p class="muted">Sign in to see the Patrons.</p>':CR.at?(CR.p.length?'<p class="muted">Listed alphabetically. Thank you for keeping the game going.</p><ul>'+CR.p.map(n=>'<li>'+f+E(n)+'</li>').join('')+'</ul>':'<p class="muted">No Patrons yet.</p>'):'<p class="muted">Loading...</p>')+
   (CR.a.length?'<h3>Player art</h3><ul>'+CR.a.map(a=>'<li>'+E(a.w)+' by '+E(a.n)+'</li>').join('')+'</ul>':'')+
   '<h3>Music</h3><p>Instrument samples from the FluidR3_GM SoundFont by Frank Wen (CC BY 3.0).</p>'+
   '<h3>Lettering</h3><p>Pixelify Sans by Stefie Justprince (SIL Open Font License).</p></div><button class="sb" data-pcr="back">Back</button>'}
 {const _r=rPn;rPn=function(){if(ptab===CTAB&&pnOpen){try{panelChrome('')}catch(e){}pbd.innerHTML=creditsHTML();return}return _r.apply(this,arguments)}}
 // ---- Options: Credits for everyone, PATRON settings for patrons ----
 {const _o=optionsHTML;optionsHTML=function(){let h=_o();const u=uid(),r=rec(u);
   h=h.replace('<div class="aclinks">','<button class="sb" data-pcr="credits">Credits</button><div class="aclinks">');
   if(r){const act=active(u),kid=window.SQAGE&&SQAGE.child(),art=act&&!kid&&window.SQARTROOM;
    h+='<div class="tl" style="margin-top:16px"><img class="sqpf" src="'+flameURL+'" alt="">PATRON</div>'+
     '<div class="qc" style="font-size:14px;line-height:1.4;padding:8px 12px;margin:6px 0">'+(act?'Thank you for supporting SkillQuest! Your flame shows next to your name.':'Thank you for supporting SkillQuest. Your fire cape is yours to keep.')+'</div>'+
     (cape(u)?'<button class="sb" data-pcr="cape">Fire cape: '+(WEAR?'WEARING':'OFF')+'</button>':'')+
     (!kid?'<button class="sb" data-pcr="cred">Show me in the credits: '+(credPref?'ON':'OFF')+'</button>':'')+
     (art?'<button class="sb" data-pcr="art">Open the Art Room</button>':'')}
   return h}}
 pbd.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pcr]');if(!b)return;e.stopPropagation();e.preventDefault();const a=b.dataset.pcr;
  if(a==='credits'){ptab=CTAB;loadCredits();rPn()}else if(a==='back'){ptab=8;rPn()}
  else if(a==='cape'){WEAR=!WEAR;try{saveLocal(true)}catch(x){}say(WEAR?'You put on your fire cape.':'You take off your fire cape.');rPn()}
  else if(a==='cred'){credPref=!credPref;try{localStorage.setItem('sq_pcred',credPref?'1':'0')}catch(x){}credSent='';syncCred();rPn()}
  else if(a==='art'&&window.SQARTROOM)SQARTROOM.open()},true);
 window.SQPATRON={active,cape,rec,get all(){return PR},get wearing(){return WEAR},set wearing(v){WEAR=!!v},flameURL,syncCred,loadCredits,CTAB}})();
