// ---- 135. The player menu and duels ----
// Next to another player the TALK button shows their name (multiplayer/119). Tapping it opens the player menu:
// TRADE, ADD FRIEND, DUEL (and CHESS, coming later).
// Duels: ask (they get a pop-up and a chat line), then a stake window like the trade window: each side puts in items
// and gold, two rounds of accepting ("If you lose you give... If you win you get..."). When both have accepted twice,
// each side's stake is taken out of their bag (saved at once), a 3-2-1 countdown runs and the two can hit each other
// anywhere (PvP on or off; nobody else can join in). The duel ends when one of them falls: the loser gets back up right
// where they fell with full health and loses only their stake; the winner gets their own stake back plus the loser's.
// Leaving the area (or going offline for 20 s) during the fight counts as losing. After 3 minutes it's a draw and both
// stakes go back.
// Database: dreq/<to>/<from> = a duel request; duels/<a_b>/<uid> = that player's side {i, g, a, c, f, l, d, t}:
// a/c = first/second accept key, f = stake taken (ready to fight), l = I lost, d = I've collected (winner).
(()=>{const NEAR=6*16,FIGHT=180,Fm=()=>window.SQFB,Mp=()=>window.SQMP;
 const on=()=>!!(Mp()&&Mp().on&&Mp().user&&Fm()),me=()=>Mp().user.uid,ref=p=>Fm().db.ref(Fm().D,p);
 const liveR=r=>!!r&&performance.now()-r.seen<20000;
 const nameOf=u=>{const r=Mp()&&Mp().players.get(u);return(r&&r.n)||'Player'};
 const near=u=>{const r=Mp().players.get(u);if(!r||!liveR(r))return false;let L=null;try{L=mpLoc()}catch(e){}return!!L&&r.loc===L&&Math.hypot(r.tx-P.x,r.ty-P.y)<=NEAR};
 const tid=(a,b)=>a<b?a+'_'+b:b+'_'+a;
 const now=()=>Date.now()+((Mp()&&Mp().off)||0);
 const D={kind:'duel',st:'idle',foe:null,mv:[],tid:'',me:{},g:0,th:{},tg:0,my:{a:'',c:'',f:'',l:'',d:''},their:null,seen:false,unsub:null,esc:null,t0:0,cd:0,away:0,warnAt:0,lastTh:'',inbox:{},sent:{},rq:null};
 window.SQDUEL={get fighting(){return D.st==='fight'&&D.kind==='duel'},get chess(){return D.kind==='chess'&&D.st==='fight'},get kind(){return D.kind},get foe(){return D.foe},get st(){return D.st},state:D};
 // ---- the player menu ----
 const MTAB=36,DTAB=37;let MU=null;
 function menuOpenFor(u){MU=u;try{if(typeof releaseMenu==='function')releaseMenu()}catch(e){}pnOpen=true;ptab=MTAB;jx=jy=0;fromMenu=false;pn.style.display='block';rPn();sfx('talk')}
 window.SQPLAYERMENU=menuOpenFor;
 function menuHTML(){const u=MU,n=esc(nameOf(u)),fr=!!(Mp()&&Mp().friends&&Mp().friends[u]),T=window.SQTRADE,tIn=!!(T&&T.inbox&&T.inbox[u]),kIn=D.inbox[u]&&D.inbox[u].k,kS=D.sent[u]&&D.sent[u].k,dIn=kIn==='duel',dSent=kS==='duel',cIn=kIn==='chess',cSent=kS==='chess';
  let h='<div class="tl">'+n.toUpperCase()+'</div><div class="qc" style="font-size:13px;text-align:center">'+(near(u)?'Standing right next to you.':'Too far away now. Walk up to them again.')+'</div><div class="pmb">';
  h+='<button class="sb" data-pm="trade">'+(tIn?'ACCEPT TRADE':'TRADE')+'</button>';
  h+='<button class="sb" data-pm="friend"'+(fr?' disabled style="opacity:.55"':'')+'>'+(fr?'FRIENDS ✓':'ADD FRIEND')+'</button>';
  h+='<button class="sb" data-pm="duel"'+(dSent&&!dIn?' disabled style="opacity:.55"':'')+'>'+(dIn?'ACCEPT DUEL':dSent?'DUEL ASKED…':'DUEL')+'</button>';
  if(window.SQPARTY){const inP=SQPARTY.has(u),inv=SQPARTY.invited(u);h+='<button class="sb" data-pm="party"'+(inP||inv?' disabled style="opacity:.55"':'')+'>'+(inP?'IN YOUR PARTY ✓':inv?'PARTY INVITE SENT…':'INVITE TO PARTY')+'</button>'}
  h+='<button class="sb" data-pm="chess"'+(cSent&&!cIn?' disabled style="opacity:.55"':'')+'>'+(cIn?'ACCEPT CHESS':cSent?'CHESS ASKED…':'CHESS')+'</button><button class="sb" data-pm="close">CLOSE</button></div>';
  return h}
 // ---- duel requests ----
 const WHAT=k=>k==='chess'?'game of chess':'duel';
 function ask(u,kind){kind=kind==='chess'?'chess':'duel';if(!on()){say(kind==='chess'?'Sign in to play chess with other players.':'Sign in to duel other players.');return}if(D.st!=='idle'){say('Finish your current '+WHAT(D.kind)+' first.');return}if(!near(u)){say(nameOf(u)+' is too far away. Stand next to them.');sfx('swish');return}
  if(D.inbox[u]&&D.inbox[u].k===kind){answer(u,true);return}if(D.sent[u])return;const db=Fm().db,sn=Math.random().toString(36).slice(2,10);D.sent[u]={at:performance.now(),s:sn,k:kind};
  db.set(ref('dreq/'+u+'/'+me()),{n:String(pname()).slice(0,12),s:sn,k:kind,t:db.serverTimestamp()}).then(()=>{const m=kind==='chess'?'You asked '+nameOf(u)+' for a game of chess.':'You challenged '+nameOf(u)+' to a duel.';say(m);try{mpLog('game',m)}catch(e){}watchReq(u)})
   .catch(e=>{delete D.sent[u];say(/permission/i.test(String(e&&(e.code||e.message)))?'This needs the latest database rules.':'Could not send the request.')})}
 function watchReq(u){const db=Fm().db,S=D.sent[u];if(!S)return;const offs=[];S.done=()=>{offs.forEach(f=>f());delete D.sent[u];draw()};
  const t0=now()-3000;// an old side left from the last duel doesn't count as a yes
  offs.push(db.onValue(ref('duels/'+tid(u,me())+'/'+u),s=>{const v=s.val();if(v&&v.s===S.s&&D.st==='idle'&&D.sent[u]){const sn=S.s,kd=S.k;S.done();open(u,sn,kd)}}));
  setTimeout(()=>{if(D.sent[u]&&D.st==='idle'){S.done();db.remove(ref('dreq/'+u+'/'+me())).catch(()=>{});say(nameOf(u)+' did not answer.')}},60000)}
 function answer(u,yes){const sn=D.inbox[u]&&D.inbox[u].s,kd=D.inbox[u]&&D.inbox[u].k;delete D.inbox[u];popHide(u);Fm().db.remove(ref('dreq/'+me()+'/'+u)).catch(()=>{});if(!yes)return;
  if(D.st!=='idle'){say('Finish your current '+WHAT(D.kind)+' first.');return}if(!near(u)){say(nameOf(u)+' is too far away now.');sfx('swish');return}if(sn)open(u,sn,kd)}
 // request pop-up
 const st=document.createElement('style');st.textContent=`#dlpop{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 58px);z-index:31;display:none;align-items:center;gap:8px;padding:8px 10px;max-width:calc(100vw - 24px);box-sizing:border-box;font:600 14px ${PF};background:#f8f0d8;color:#404040;border:3px solid #b03828}
#dlpop span{flex:1;min-width:0}#dlpop button{font:700 13px ${PF};padding:7px 12px;border:3px solid #485870;background:#f8f8f8;color:#404040;cursor:pointer}#dlpop .ok{background:#b03828;border-color:#701810;color:#fff}
#pn .pmb{display:flex;flex-direction:column;gap:8px;margin-top:8px}#pn .pmb .sb{width:100%;margin:0}
#dlbar{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 64px);z-index:30;display:none;padding:6px 12px;font:700 14px ${PF};color:#fff;background:#b03828;border:3px solid #701810;pointer-events:none;white-space:nowrap}
#dlbig{position:fixed;left:0;right:0;top:38%;z-index:30;display:none;text-align:center;font:700 54px ${PF};color:#fff;text-shadow:0 4px 0 #701810,0 0 12px #000;pointer-events:none}`;document.head.appendChild(st);
 const pop=document.createElement('div');pop.id='dlpop';pop.innerHTML='<span></span><button class="ok">DUEL</button><button class="no">NO</button>';document.body.appendChild(pop);
 for(const ev of['touchstart','pointerdown','mousedown'])pop.addEventListener(ev,e=>e.stopPropagation());
 let popU=null,popT=0;pop.querySelector('.ok').onclick=()=>{if(popU)answer(popU,true)};pop.querySelector('.no').onclick=()=>{if(popU)answer(popU,false)};
 function popShow(u){popU=u;const ch=D.inbox[u]&&D.inbox[u].k==='chess';pop.querySelector('.ok').textContent=ch?'PLAY':'DUEL';pop.querySelector('span').textContent=ch?nameOf(u)+' wants to play chess!':nameOf(u)+' challenges you to a duel!';pop.style.display='flex';clearTimeout(popT);popT=setTimeout(()=>popHide(u),30000)}
 function popHide(u){if(u&&popU!==u)return;popU=null;pop.style.display='none';clearTimeout(popT)}
 const bar=document.createElement('div');bar.id='dlbar';document.body.appendChild(bar);const big=document.createElement('div');big.id='dlbig';document.body.appendChild(big);
 let bigT=0;const bigSay=(t,ms)=>{big.textContent=t;big.style.display='block';clearTimeout(bigT);bigT=setTimeout(()=>{big.style.display='none'},ms||900)};
 // ---- the stake window ----
 const can=k=>(inv[k]|0)-(D.me[k]|0);
 const clean=o=>{const r={};if(o&&typeof o==='object')for(const k in o){const n=Math.floor(+o[k]||0);if(n>0&&INAME[k]&&INVK.includes(k))r[k]=Math.min(n,1e6)}return r};
 function key(){const[a]=[D.tid.split('_')[0]],s=o=>Object.keys(o).sort().map(k=>k+':'+o[k]).join(','),M=[s(D.me),D.g],T=[s(D.th),D.tg];return JSON.stringify(a===me()?[D.s,M,T]:[D.s,T,M])}
 function push(){if(!D.tid||!on())return;const db=Fm().db;db.set(ref('duels/'+D.tid+'/'+me()),{i:D.me,g:D.g,s:D.s,k:D.kind,m:D.kind==='chess'?D.mv.join(' '):'',a:D.my.a,c:D.my.c,f:D.my.f,l:D.my.l,d:D.my.d,t:db.serverTimestamp()})
  .catch(e=>{end(/permission/i.test(String(e&&(e.code||e.message)))?'Duels need the latest database rules.':'Lost the connection, so the duel was cancelled.')})}
 function open(u,sn,kind){D.kind=kind==='chess'?'chess':'duel';D.mv=[];D.s=sn||'';D.st='stake';D.foe=u;D.tid=tid(u,me());D.me={};D.g=0;D.th={};D.tg=0;D.my={a:'',c:'',f:'',l:'',d:''};D.their=null;D.seen=false;D.esc=null;D.warnAt=0;D.lastTh='';
  delete D.inbox[u];popHide(u);if(D.sent[u]&&D.sent[u].done)D.sent[u].done();
  try{if(typeof releaseMenu==='function')releaseMenu()}catch(e){}push();D.unsub=Fm().db.onValue(ref('duels/'+D.tid+'/'+u),s=>theirs(s.val()));
  pnOpen=true;ptab=DTAB;jx=jy=0;fromMenu=false;pn.style.display='block';rPn();sfx('talk');try{mpLog('game','Setting up a '+WHAT(D.kind)+' with '+nameOf(u)+'.')}catch(e){}}
 function theirs(v){if(D.st==='idle')return;if(v&&v.s!==D.s)v=null;// a side left from another duel
  if(!v){if(D.seen&&D.st!=='fight'&&D.st!=='over')end(nameOf(D.foe)+' left the duel.');else if(D.seen&&D.st==='fight')win('left');return}
  if(D.kind==='chess'&&window.SQPVC)try{SQPVC.theirMoves(String(v.m||''))}catch(e){console.warn(e)}
  D.seen=true;const th=clean(v.i),tg=Math.max(0,Math.min(1e9,Math.floor(+v.g||0)));D.their={a:String(v.a||''),c:String(v.c||''),f:String(v.f||''),l:String(v.l||''),d:String(v.d||'')};
  if(D.st==='stake'||D.st==='confirm'){const k=JSON.stringify([th,tg]);if(D.lastTh&&k!==D.lastTh){const less=tg<D.tg||Object.keys(D.th).some(q=>(th[q]|0)<D.th[q]),was=D.their;if(less||D.my.a||D.st==='confirm')D.warnAt=performance.now();D.st='stake';if(D.my.a||D.my.c){D.my.a='';D.my.c='';push()}sfx('swish')}D.lastTh=k;D.th=th;D.tg=tg}
  step()}
 function step(){if(D.st==='idle'||!D.their)return;const k=key(),t=D.their;
  if(D.st==='stake'||D.st==='confirm'){if(D.my.a&&D.my.a!==k){D.my.a='';D.my.c='';push()}
   if(D.st==='stake'&&D.my.a===k&&t.a===k){D.st='confirm';sfx('talk')}if(D.st==='confirm'&&(D.my.a!==k||t.a!==k))D.st='stake';
   if(D.st==='confirm'&&D.my.c===k&&(t.c===k||t.f===k))takeStake(k)}
  if(D.st==='ready'&&t.f===D.my.f)countdown();
  if(D.st==='fight'&&t.l&&t.l===D.my.f)win('fell');
  if(D.st==='fight'&&t.d&&t.d===D.my.f&&!D.my.l)lose('left');// they were told you'd left: keep both sides the same
  draw()}
 // both accepted twice: take your stake out of your bag and get ready
 function takeStake(k){for(const q in D.me)if((inv[q]|0)<D.me[q]){end('You no longer have everything you staked, so the duel was cancelled.');return}if(GLD<D.g){end('You no longer have that much gold.');return}
  for(const q in D.me)inv[q]=(inv[q]|0)-D.me[q];GLD-=D.g;D.esc={i:Object.assign({},D.me),g:D.g,th:Object.assign({},D.th),tg:D.tg};
  try{saveLocal(true)}catch(e){}try{saveCloud(true)}catch(e){}D.my.f=k;D.st='ready';D.readyAt=performance.now();push();if(pnOpen&&ptab===DTAB)closePanel();say('Stakes are in. Get ready!');step()}
 function countdown(){if(D.kind==='chess'){D.st='fight';D.t0=performance.now();D.away=0;guard(true);try{window.SQPVC&&SQPVC.begin()}catch(e){console.warn(e)}return}D.st='count';D.t0=performance.now();let n=3;bigSay('3');sfx('talk');const tick=()=>{if(D.st!=='count')return;n--;if(n>0){bigSay(String(n));sfx('talk');setTimeout(tick,800);return}
   D.st='fight';D.t0=performance.now();D.away=0;guard(true);bigSay('FIGHT!',1100);sfx('quest');try{mpLog('game','Duel with '+nameOf(D.foe)+': fight!')}catch(e){}};setTimeout(tick,800)}
 // ---- falling: you get back up where you fell; the duel is lost ----
 let hpv=0,guarded=false;
 function guard(onn){if(onn&&!guarded){hpv=P.hp;Object.defineProperty(P,'hp',{configurable:true,enumerable:true,get(){return hpv},set(v){if(D.kind==='chess'){if(v>hpv)hpv=v;return}if(D.st==='fight'&&v<=0){hpv=maxHp();lose('fell')}else hpv=v}});guarded=true}
  else if(!onn&&guarded){const v=hpv;delete P.hp;P.hp=v;guarded=false}}
 const maxHp=()=>6;// the game's health is out of 6
 function lose(why){if(D.st!=='fight')return;try{window.SQDUELEND&&SQDUELEND(D.kind,'l',D.foe,why)}catch(x){}try{window.SQPVC&&SQPVC.over(why==='resign'?'You resigned.':'You lost.')}catch(e){}D.my.l=D.my.f;push();const n=nameOf(D.foe),lost=list(D.esc.i,D.esc.g);D.st='over';
  FLASH=.5;hurt=1.2;setTimeout(()=>guard(false),0);bigSay('DEFEAT',1500);try{sfx('hurt')}catch(e){}
  const m=(D.kind==='chess'?(why==='resign'?'You resigned. '+n+' wins the game.':why==='left'?'You left the game, so '+n+' wins.':why==='time'?'You ran out of time. '+n+' wins.':'Checkmate. '+n+' won the game.'):why==='left'?'You left the duel, so '+n+' wins.':n+' won the duel.')+(lost?' You lost '+lost+'.':'');say(m);msgT=6;try{mpLog('game',m)}catch(e){}finishLater()}
 function win(why){if(D.st!=='fight')return;try{window.SQDUELEND&&SQDUELEND(D.kind,'w',D.foe,why)}catch(x){}try{window.SQPVC&&SQPVC.over('You won!')}catch(e){}const e=D.esc;D.st='over';guard(false);
  for(const k in e.i)inv[k]=(inv[k]|0)+e.i[k];for(const k in e.th)inv[k]=(inv[k]|0)+e.th[k];GLD+=e.g+e.tg;try{saveLocal(true)}catch(x){}try{saveCloud(true)}catch(x){}
  D.my.d=D.my.f;push();try{if(D.kind==='duel'){window.SQACH&&SQACH.add('duelw');window.SQDUELWIN&&SQDUELWIN(D.foe)}else window.SQACH&&SQACH.add('chessw')}catch(x){}const got=list(e.th,e.tg);bigSay('VICTORY!',1600);sfx('quest');try{setTimeout(()=>sfx('coin'),200)}catch(x){}
  const n=nameOf(D.foe),m=(D.kind==='chess'?(why==='mate'?'Checkmate! You beat '+n+'.':why==='resign'?n+' resigned. You win!':why==='time'?n+' ran out of time. You win!':why==='fell'?n+' resigned. You win!':why==='gone'?n+' went offline. You win!':n+' left the game. You win!'):why==='left'?n+' left the duel. You win!':why==='gone'?n+' went offline. You win!':'You beat '+n+'!')+(got?' You won '+got+'.':'');say(m);msgT=6;try{mpLog('game',m)}catch(x){}finishLater()}
 function draw3(){if(D.st!=='fight')return;try{window.SQDUELEND&&SQDUELEND(D.kind,'d',D.foe,D.why||'')}catch(x){}try{window.SQPVC&&SQPVC.over('Draw.')}catch(e){}const e=D.esc;D.st='over';guard(false);for(const k in e.i)inv[k]=(inv[k]|0)+e.i[k];GLD+=e.g;try{saveLocal(true)}catch(x){}
  say(D.kind==='chess'?'The game is a draw'+(D.why?' ('+D.why+')':'')+'. Your stake is back in your bag.':'Time is up: the duel is a draw. Your stake is back in your bag.');msgT=5;bigSay('DRAW',1400);finishLater()}
 function finishLater(){const t=D.tid,u=me(),sn=D.s;setTimeout(()=>{if(on()&&!(D.tid===t&&D.s!==sn&&D.st!=='idle'))Fm().db.remove(ref('duels/'+t+'/'+u)).catch(()=>{})},8000);setTimeout(()=>end(null),300)}
 // anything ending before the fight gives your stake back
 function end(why){if(D.st==='idle')return;const was=D.st,t=D.tid;if(D.esc&&(was==='ready'||was==='count')){for(const k in D.esc.i)inv[k]=(inv[k]|0)+D.esc.i[k];GLD+=D.esc.g;try{saveLocal(true)}catch(e){}}
  if(was==='fight'){lose('left');return}
  if(D.unsub){D.unsub();D.unsub=null}if(was!=='over'&&on()&&t)Fm().db.remove(ref('duels/'+t+'/'+me())).catch(()=>{});
  guard(false);try{window.SQPVC&&SQPVC.cancel()}catch(e){}D.st='idle';D.foe=null;D.mv=[];D.tid='';D.esc=null;D.their=null;bar.style.display='none';
  if(why){say(why);sfx('swish');try{mpLog('game',why)}catch(e){}}if(pnOpen&&ptab===DTAB)closePanel();draw()}
 const list=(o,g)=>{const a=Object.keys(o||{}).map(k=>o[k]+' × '+(INAME[k]||k).toLowerCase());if(g)a.push(g.toLocaleString('en-US')+' gold');return a.join(', ')};
 function side(o,g,them){let h='';for(const k in o)h+='<div class="tri"'+(them?'':' data-dl="rm" data-k="'+k+'"')+'><span>'+esc(INAME[k]||k)+'</span><i>×'+o[k]+'</i></div>';
  if(g)h+='<div class="tri trg"'+(them?'':' data-dl="g0"')+'><span>Gold</span><i>'+g.toLocaleString('en-US')+'</i></div>';if(!Object.keys(o).length&&!g)h+='<div style="opacity:.55;font-size:12px">Nothing (just for glory)</div>';return h}
 function stakeHTML(){const n=esc(nameOf(D.foe)),k=key(),t=D.their||{a:'',c:''};const warn=performance.now()-D.warnAt<6000?'<div class="trw">'+n+' changed their stake! Check it again.</div>':'';
  if(D.st==='confirm'){return'<div class="tl">'+(D.kind==='chess'?'CHESS':'DUEL')+': ARE YOU SURE?</div>'+warn+'<div class="qc"><b>If you lose, you give '+n+':</b><p>'+esc(list(D.me,D.g)||'nothing')+'</p><b>If you win, you get:</b><p>'+esc(list(D.th,D.tg)||'nothing')+'</p><p style="font-size:12px;opacity:.8">'+(D.kind==='chess'?'The game ends with checkmate, a resignation or a draw (a draw gives both stakes back). Going offline or taking more than 3 minutes for a move loses the game. Chess against players gives no Tactics XP.':'The duel ends when one of you falls. You get back up where you fell. Leaving the area or going offline loses the duel.')+'</p></div>'+
   '<div class="trst">'+(D.my.c===k?'Waiting for '+n+'…':t.c===k?n+' is ready. Your turn.':'Check the stakes, then accept.')+'</div><div class="tra"><button class="y'+(D.my.c===k?' on':'')+'" data-dl="ok2">'+(D.my.c===k?'ACCEPTED':'ACCEPT')+'</button><button class="n" data-dl="no">DECLINE</button></div>'}
  let h='<div class="tl">'+(D.kind==='chess'?'CHESS':'DUEL')+' WITH '+n.toUpperCase()+'</div>'+warn+'<div class="trc"><div class="trs"><b>YOUR STAKE</b>'+side(D.me,D.g,false)+'</div><div class="trs them"><b>'+n.toUpperCase()+'\'S STAKE</b>'+side(D.th,D.tg,true)+'</div></div>';
  h+='<div class="trst">'+(D.my.a===k?'Waiting for '+n+'…':t.a===k?n+' has accepted. Your turn.':'The winner takes the loser\'s stake. Tap your stake to take things back.')+'</div>';
  h+='<div class="tra"><button class="y'+(D.my.a===k?' on':'')+'" data-dl="ok1">'+(D.my.a===k?'ACCEPTED':'ACCEPT')+'</button><button class="n" data-dl="no">DECLINE</button></div>';
  const left=GLD-D.g;h+='<div class="trh">GOLD (you have '+left.toLocaleString('en-US')+' left)</div><div class="trgb">';for(const v of[10,100,1000,10000])h+='<button data-dl="g" data-v="'+v+'"'+(left<v?' disabled style="opacity:.4"':'')+'>+'+v.toLocaleString('en-US')+'</button>';
  h+=(D.g?'<button data-dl="g0">Clear</button>':'')+'</div><div class="trh">YOUR BAG</div>';
  const seen=new Set();let any=false;for(const q of BAG_ORDER().concat(INVK)){if(seen.has(q)||!INAME[q])continue;seen.add(q);const c=can(q);if(c<=0)continue;any=true;
   h+='<div class="trb"><span>'+esc(INAME[q])+' <i style="font-style:normal;opacity:.65">×'+c+'</i></span><button data-dl="add" data-k="'+q+'" data-v="1">+1</button>'+(c>5?'<button data-dl="add" data-k="'+q+'" data-v="5">+5</button>':'')+(c>1?'<button data-dl="add" data-k="'+q+'" data-v="all">All</button>':'')+'</div>'}
  if(!any)h+='<div style="opacity:.6;font-size:13px;padding:6px">Nothing left to stake.</div>';return h}
 function click(b){const a=b.dataset.dl,k=b.dataset.k;if(D.st==='idle')return;if(a==='no'){end('You declined the '+WHAT(D.kind)+'.');return}
  if(a==='ok1'){if(D.my.a===key())return;D.my.a=key();push();step();rPn();return}
  if(a==='ok2'){const kk=key();if(D.my.c===kk)return;for(const q in D.me)if((inv[q]|0)<D.me[q]){end('You no longer have everything you staked.');return}D.my.c=kk;push();step();return}
  if(D.st!=='stake')return;let ch=false;
  if(a==='add'){const n=can(k),v=b.dataset.v==='all'?n:Math.min(n,+b.dataset.v);if(v>0){D.me[k]=(D.me[k]|0)+v;ch=true}}
  else if(a==='rm'){if(D.me[k]){if(--D.me[k]<=0)delete D.me[k];ch=true}}
  else if(a==='g'){const left=GLD-D.g,v=Math.min(left,+b.dataset.v);if(v>0){D.g+=v;ch=true}}else if(a==='g0'){if(D.g){D.g=0;ch=true}}
  if(ch){D.my.a='';D.my.c='';push();sfx('pickup');rPn()}}
 // ---- panel hooks ----
 function draw(){if(pnOpen&&(ptab===MTAB||ptab===DTAB))rPn()}
 const _r=rPn;rPn=function(){if(ptab===MTAB){try{panelChrome('')}catch(e){}pbd.innerHTML=menuHTML();return}if(ptab===DTAB){try{panelChrome('')}catch(e){}pbd.innerHTML=D.st==='idle'?'<div class="tl">DUEL</div>':stakeHTML();return}return _r.apply(this,arguments)};
 {const _oc=pbd.onclick;pbd.onclick=e=>{if(ptab===DTAB){const b=e.target.closest('[data-dl]');if(b&&!b.disabled)click(b);return}
   if(ptab===MTAB){const b=e.target.closest('[data-pm]');if(!b||b.disabled)return;const a=b.dataset.pm,u=MU;
    if(a==='close'){closePanel();return}if(a==='trade'){closePanel();try{SQTRREQ(u)}catch(x){}return}
    if(a==='friend'){try{SQADDFRIEND(u);say(nameOf(u)+' is now on your friends list.')}catch(x){}setTimeout(draw,600);return}
    if(a==='party'){try{SQPARTY.invite(u)}catch(x){}setTimeout(draw,400);return}
    if(a==='duel'||a==='chess'){if(D.inbox[u]&&D.inbox[u].k===a){closePanel();answer(u,true);return}ask(u,a);setTimeout(draw,300);return}return}
   return _oc(e)}}
 {const _cp=closePanel;closePanel=function(){const r=_cp.apply(this,arguments);if((D.st==='stake'||D.st==='confirm')&&ptab===DTAB)end('You declined the '+WHAT(D.kind)+'.');return r}}
 // ---- watching: requests, the other player, the clock ----
 let started=false,reqOff=null;
 function start(){started=true;D.inbox={};const db=Fm().db;reqOff=db.onValue(ref('dreq/'+me()),s=>{const v=s.val()||{},old=D.inbox;D.inbox={};
   for(const u in v){const q=v[u];if(!q||typeof q!=='object')continue;if(q.k==='party'){try{window.SQPARTYINV&&SQPARTYINV(u,q)}catch(e){}continue}if(typeof q.t==='number'&&now()-q.t>60000){db.remove(ref('dreq/'+me()+'/'+u)).catch(()=>{});continue}D.inbox[u]={t:q.t,s:typeof q.s==='string'?q.s.slice(0,12):'',k:q.k==='chess'?'chess':'duel'}}
   for(const u in D.inbox)if(!old[u]){if(D.sent[u]&&D.st==='idle'){answer(u,true);continue}try{mpLog('game',D.inbox[u].k==='chess'?nameOf(u)+' wants to play chess! Tap PLAY, or tap their name.':nameOf(u)+' challenges you to a duel! Tap DUEL, or tap their name.')}catch(e){}if(D.st==='idle')popShow(u);try{sfx('talk')}catch(e){}}
   if(popU&&!D.inbox[popU])popHide();draw()})}
 function stop(){started=false;if(reqOff){reqOff();reqOff=null}D.inbox={};popHide();if(D.st!=='idle')end('You went offline, so the '+WHAT(D.kind)+' was cancelled.')}
 const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{
   if(on()&&!started)start();else if(!on()&&started)stop();
   if(D.st==='stake'||D.st==='confirm'){if(!(pnOpen&&ptab===DTAB))end('You declined the '+WHAT(D.kind)+'.');else if(D.foe&&!near(D.foe)){const r=Mp().players.get(D.foe);if(!r||!liveR(r))end(nameOf(D.foe)+' went offline.');else if(Math.hypot(r.tx-P.x,r.ty-P.y)>NEAR*2.5||r.loc!==mpLoc())end(nameOf(D.foe)+' walked away, so the '+WHAT(D.kind)+' was cancelled.')}}
   if(D.st==='ready'&&performance.now()-D.readyAt>20000){end(nameOf(D.foe)+' did not get ready in time.')}
   if(D.st==='fight'&&D.kind==='chess'){const r=Mp().players.get(D.foe);bar.style.display='none';if(!r||!liveR(r)||performance.now()-r.seen>20000)win('gone');else try{window.SQPVC&&SQPVC.tick(dt)}catch(e){}}
   else if(D.st==='fight'){const r=Mp().players.get(D.foe),left=Math.max(0,FIGHT-(performance.now()-D.t0)/1000);
    bar.style.display=pnOpen||menuOpen?'none':'block';bar.textContent='DUEL vs '+nameOf(D.foe)+' · '+Math.floor(left/60)+':'+String(Math.floor(left%60)).padStart(2,'0');
    if(left<=0)draw3();else if(dead)lose('fell');
    else{let L=null;try{L=mpLoc()}catch(e){}if(D.loc0===undefined)D.loc0=L;if(L!==D.loc0)lose('left');
     else if(!r||!liveR(r)||performance.now()-r.seen>20000)win('gone');else if(r.loc!==L){D.away+=dt;if(D.away>5)win('left')}else D.away=0}}
   else if(D.st!=='fight'){D.loc0=undefined}}catch(e){console.warn(e)}return out};
 window.SQDUELAPI={ask,answer,open,end,lose,win,draw3,push,menuOpenFor,key,me:()=>me(),nameOf,get D(){return D},get inbox(){return D.inbox}}})();
