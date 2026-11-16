// ---- 218. Patrons: the flame emblem, the fire cape, and the credits ----
// `patron/<uid>` {s: since, u: paid through (ms), c: fire cape earned} is written only by developers (Dev Suite > Art Room
// inbox > Patrons, and later the payment server). Everyone signed in reads the whole node (`P`, onValue), like 061's OG list.
// Active patron (u > now) = a flame emblem next to the name: over heads (outermost drawHUD, placed left of 061's name and
// OG crown using the same layout as 061's `one`), in chat lines (a MutationObserver on #mpl adds an <img> before b.nm[data-u]).
// Fire cape (c, kept forever): worn from START > Style (212's SQCAPEX; Options > PATRON links there) (`fcw` in the save, always written), sent as ch.fcp=1 through gearCH;
// 201 paints it (animated). Other players' ch.fcp is dropped every frame unless their own patron record has c (no spoofing).
// Credits (Options > ABOUT > Credits, ptab 46): `pcred/<uid>` {n,t} written by each patron's game while "Show me in the
// credits" is on (localStorage sq_pcred, default on; never for under-13, the rules check), listed alphabetically with no
// amounts; `artcred/<id>` {n,w} = approved Art Room work (written by devs).
(()=>{const PATREON='https://www.patreon.com/cw/SKILLQUESTMMO';const myNm=()=>{try{const m=window.SQMP;return String((typeof PNAME!=='undefined'&&PNAME)||((m&&m.user&&m.user.displayName)||'').split(' ')[0]||'Adventurer').replace(/[<>]/g,'').slice(0,12)}catch(e){return'Adventurer'}};const mp=()=>window.SQMP,F=()=>window.SQFB,uid=()=>{const m=mp();return m&&m.user?m.user.uid:''};
 let PR={},listening='',PCFG={};
 const rec=u=>u&&PR[u]||null,active=u=>{const r=rec(u);return!!(r&&typeof r.u==='number'&&r.u>Date.now())},cape=u=>{const r=rec(u);return!!(r&&r.c)};
 function listen(){const m=mp(),Fb=F();if(!m||!m.on||!m.user||!Fb){return}if(listening===m.user.uid)return;listening=m.user.uid;
  try{Fb.db.get(Fb.db.ref(Fb.D,'cfgpub/patreon')).then(s=>{PCFG=s.val()||{};try{if((ptab===8||ptab===PTAB)&&pnOpen)rPn()}catch(e){}}).catch(()=>{})}catch(e){}
  try{Fb.db.onValue(Fb.db.ref(Fb.D,'patron'),s=>{const v=s.val()||{};PR={};for(const k in v)if(v[k]&&typeof v[k]==='object')PR[k]=v[k];syncCred();try{if((ptab===8||ptab===PTAB)&&pnOpen)rPn()}catch(e){}},()=>{})}catch(e){}}
 setInterval(listen,1500);
 // ---- the flame emblem (our own pixel art: a 9x11 flame with a flickering tip) ----
 const FLC={K:'#2a0c06',R:'#c8300e',O:'#f07a20',Y:'#f8c838',W:'#fff2b0'};
 const ROWS=[['....K....','...KRK...','...KROK..','..KROORK.','.KRROYORK','.KROYYORK','KROYYWYOK','KROYWWYOK','KROYWWYOK','.KROYYOK.','..KKKKK..'],
  ['...K.....','..KRK....','..KROK...','..KROORK.','.KRROYORK','.KROYYORK','KROYYWYOK','KROYWWYOK','KROYWWYOK','.KROYYOK.','..KKKKK..']];
 const MAP=FLC;const FL=ROWS.map(rows=>{const c=document.createElement('canvas');c.width=9;c.height=11;const x=c.getContext('2d');rows.forEach((row,j)=>{for(let i=0;i<9;i++){const ch=row[i];if(MAP[ch]){x.fillStyle=MAP[ch];x.fillRect(i,j,1,1)}}});return c});
 const flameURL=(()=>{const c=document.createElement('canvas');c.width=18;c.height=22;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(FL[0],0,0,18,22);return c.toDataURL()})();
 const flameImg=()=>{const i=document.createElement('img');i.src=flameURL;i.alt='Patron';i.title='Patron';i.className='sqpf';return i};
 window.SQFLAMEURL=flameURL;
 {const st=document.createElement('style');st.textContent=`#pn a.sqpatlink{display:block;text-align:center;text-decoration:none;color:inherit;box-sizing:border-box}img.sqpf{width:.75em;height:.92em;image-rendering:pixelated;vertical-align:-.1em;margin-right:3px}
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
 const REDIRECT='https://us-central1-skillquest-913e2.cloudfunctions.net/patreonAuth';let LNK=null;
 const nonce=()=>{const A='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789',b=new Uint8Array(24);crypto.getRandomValues(b);return Array.from(b,x=>A[x%A.length]).join('')};
 // the click writes the one-time link before the browser leaves for Patreon (the server checks it when Patreon sends the player back)
 // the Patreon links are real links: keep their clicks away from the panel's button handlers (they ran shopAct on them)
 pbd.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.sqpatlink'))e.stopPropagation()},true);
 pbd.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('[data-plink]');if(!a)return;const u=uid(),Fb=F();let n='';try{n=(new URL(a.href).searchParams.get('state')||'').split('.').pop()}catch(x){}if(!u||!Fb||!n)return;
  try{Fb.db.set(Fb.db.ref(Fb.D,'plink/'+u),{n,t:Fb.db.serverTimestamp()}).catch(()=>{say('Couldn\'t start the link. Check your connection and try again.')})}catch(err){}
  say('Opening Patreon... Allow access there, then come back here.')},true);
 // ---- Options: Credits for everyone, PATRON settings for patrons ----
 let pcAt=-1e9;const pcLoad=()=>{const Fb=F();if(!Fb||!uid()||performance.now()-pcAt<30000)return;pcAt=performance.now();try{Fb.db.get(Fb.db.ref(Fb.D,'cfgpub/patreon')).then(s=>{const v=s.val()||{};const was=PCFG.cid;PCFG=v;if(v.cid!==was)try{if((ptab===8||ptab===PTAB)&&pnOpen)rPn()}catch(e){}}).catch(()=>{})}catch(e){}};
 // ---- the Patron screen (START > Patron, ptab 48; Options keeps a button to it): status, perks, Art Room, the Patreon buttons ----
 const PTAB=48;
 // who sees it: anyone signed in with a patron record, or signed in with a known age band that isn't under 13
 const showMenu=()=>{const u=uid();if(!u)return false;if(rec(u))return true;const A=window.SQAGE;return!!(A&&A.known&&A.known()&&!A.child())};
 const linkURL=u=>{LNK=LNK&&LNK.u===u?LNK:{u,n:nonce()};return'https://www.patreon.com/oauth2/authorize?response_type=code&client_id='+encodeURIComponent(PCFG.cid)+'&redirect_uri='+encodeURIComponent(REDIRECT)+'&scope='+encodeURIComponent('identity identity.memberships')+'&state='+encodeURIComponent(u+'.'+LNK.n)};
 function perk(t,d,btn,on){return'<div class="qc" style="display:flex;gap:10px;align-items:center;padding:8px 12px;margin:6px 0"><div style="flex:1;font-size:14px;line-height:1.35"><b>'+(on?'✓ ':'')+t+'</b><br>'+d+'</div>'+(btn||'')+'</div>'}
 function patronHTML(){const u=uid(),r=rec(u);if(u&&!PCFG.cid)pcLoad();const act=active(u),kid=window.SQAGE&&SQAGE.child(),f='<img class="sqpf" src="'+flameURL+'" alt="">';
  const capePic=(()=>{try{const X=window.SQCAPEX;return X&&X.picWith?'<div style="display:flex;gap:8px;justify-content:center">'+X.picWith({fcp:1},1)+X.picWith({fcp:1},2)+'</div>':''}catch(e){return''}})();
  let h='<div class="tl">'+f+'PATRON</div>';
  if(r)h+='<div class="qc" style="font-size:15px;line-height:1.45;padding:10px 12px;margin:6px 0">'+(act?'<b>Thank you for supporting SkillQuest!</b> Your perks are on'+(r.u<9e12?' until '+new Date(r.u).toLocaleDateString()+', and renew by themselves while your Patreon membership is active':'')+'.':'<b>Thank you for supporting SkillQuest.</b> Your membership has ended, and your fire cape is yours to keep.')+'</div>';
  else h+='<div class="qc" style="font-size:15px;line-height:1.45;padding:10px 12px;margin:6px 0"><b>Support SkillQuest on Patreon.</b> SkillQuest is made by a tiny team, and Patrons keep it running and growing. Every perk is just for looks: Patrons never get stronger than anyone else. Ask a parent first if you\'re under 18.</div>';
  h+=capePic;
  h+=perk('A flame next to your name','Over your head and in chat, while your membership is active.','',act);
  h+=perk('The fire cape','An animated cape of flames that\'s yours to keep.',cape(u)?'<button class="qb" data-pcr="style" style="flex:none;width:auto;min-width:84px;margin:0;padding:8px 12px">Wear it</button>':'',cape(u));
  h+=perk('The Art Room','Draw pictures, animations and things to wear, and send them in. Approved pictures become paintings in the Patron Art Gallery, with your name on them.',act&&!kid&&window.SQARTROOM?'<button class="qb" data-pcr="art" style="flex:none;width:auto;min-width:84px;margin:0;padding:8px 12px">Open</button>':'',act&&!kid);
  h+=perk('Your name in the Credits','Options &gt; About &gt; Credits.',r&&!kid?'<button class="qb" data-pcr="cred" style="flex:none;width:auto;min-width:84px;margin:0;padding:8px 12px">'+(credPref?'Shown':'Hidden')+'</button>':'',!!(r&&credPref&&!kid));
  const kid2=!window.SQAGE||!SQAGE.known||!SQAGE.known()||SQAGE.child();
  if(u&&!kid2&&!act)h+='<a class="sb sqpatlink" href="'+PATREON+'" target="_blank" rel="noopener" style="margin-top:10px">'+f+'Become a Patron</a>'+
   '<p style="font-size:13px;line-height:1.4;opacity:.8;margin:6px 2px">Join with the same email you sign in to SkillQuest with, and your perks switch on by themselves within a few hours.</p>';
  if(u&&!kid2&&PCFG.cid)h+='<div class="tl" style="margin-top:14px;font-size:15px">ALREADY A PATRON?</div><p style="font-size:13px;line-height:1.4;margin:4px 2px">'+(act?'Your perks are on. Linking only matters if you joined with a different Patreon account.':'If you joined with a different email, link your Patreon account and your perks switch on right away.')+'</p>'+
   '<a class="sb sqpatlink" data-plink="1" href="'+linkURL(u)+'" target="_blank" rel="noopener">Link Patreon</a>';
  if(!u)h+='<p>Sign in to see your Patron perks.</p>';
  return h}
 {const _r=rPn;rPn=function(){if(ptab===PTAB&&pnOpen){try{panelChrome('')}catch(e){}pbd.innerHTML=patronHTML();return}return _r.apply(this,arguments)}}
 // START menu item, only for players who can see it (added/removed each time the menu is drawn)
 const ITEM={id:'patron',l:()=>'Patron'};
 if(typeof rSM==='function'){const _sm=rSM;rSM=function(){try{const at=SMI.indexOf(ITEM),want=showMenu();if(want&&at<0){const o=SMI.findIndex(x=>x.id==='options');SMI.splice(o>=0?o:SMI.length,0,ITEM)}else if(!want&&at>=0)SMI.splice(at,1)}catch(e){}return _sm.apply(this,arguments)}}
 {const _ss=showScreen;showScreen=function(id){if(id!=='patron')return _ss.apply(this,arguments);pnOpen=true;ptab=PTAB;jx=jy=0;pn.style.display='block';rPn();try{sfx('talk')}catch(e){}}}
 // Options: Credits for everyone, one button to the Patron screen
 {const _o=optionsHTML;optionsHTML=function(){let h=_o();
   h=h.replace('<div class="aclinks">','<button class="sb" data-pcr="credits">Credits</button>'+(showMenu()?'<button class="sb" data-pcr="open"><img class="sqpf" src="'+flameURL+'" alt="">Patron</button>':'')+'<div class="aclinks">');
   return h}}
 pbd.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pcr]');if(!b)return;e.stopPropagation();e.preventDefault();const a=b.dataset.pcr;
  if(a==='credits'){ptab=CTAB;loadCredits();rPn()}else if(a==='back'){ptab=8;rPn()}
  else if(a==='style'){try{showScreen('style')}catch(x){}}
  else if(a==='open'){try{showScreen('patron')}catch(x){}}
  else if(a==='cape'){WEAR=!WEAR;try{saveLocal(true)}catch(x){}say(WEAR?'You put on your fire cape.':'You take off your fire cape.');rPn()}
  else if(a==='cred'){credPref=!credPref;try{localStorage.setItem('sq_pcred',credPref?'1':'0')}catch(x){}credSent='';syncCred();rPn()}
  else if(a==='art'&&window.SQARTROOM)SQARTROOM.open()},true);
 window.SQPATRON={PTAB,open:()=>showScreen('patron'),PATREON,active,cape,rec,get all(){return PR},get wearing(){return WEAR},set wearing(v){WEAR=!!v},flameURL,syncCred,loadCredits,CTAB}})();
