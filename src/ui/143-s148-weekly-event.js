// ---- 148. Weekly event: one goal that everyone online works on together ----
// Each week (Monday 00:00 UTC to the next) has one community goal, taking turns through `EV` by week number: chop logs,
// mine ore, catch fish, cook meals, beat monsters, light fires, harvest crops. What you gather counts the same way as the
// daily challenges (120): items arriving in a frame where that skill gained XP, fires by Firemaking XP gains, monsters by
// the game's kill counter. Only while signed in.
// Three tiers (a third, two thirds, the whole goal). When the shared total reaches a tier, everyone who has chipped in at
// least `min` (2% of the goal) gets that tier's gold and XP, once. A tier reached while you were away is paid the next
// time you play (also for last week's event, read once when the week turns).
// Database: wev/<week>/t = the shared total (only goes up, at most 500 a write), wev/<week>/p/<uid> = {n, c} your own
// count. The client sends what it gathered every 10 s. Rules in database.rules.json (publish them).
// HUD: a pill left of the players-online pill (139) with the event's icon and %, tap = quest log, where a card shows the
// goal, the bar, your part, the top helpers and the rewards (below the daily challenges).
// Saved as `wev` = {w: week, c: your count, got: tiers paid, q: not yet sent}.
(()=>{const SK=n=>SKN.indexOf(n);
 const EV=[
  {id:'logs',ic:'🪓',n:'Lumber Week',w:n=>'Chop '+n.toLocaleString('en-US')+' logs together',s:'Woodcutting',goal:3000,col:'#58b048'},
  {id:'ore',ic:'⛏',n:'Deep Mining Week',w:n=>'Mine '+n.toLocaleString('en-US')+' ore and stone together',s:'Mining',goal:2000,col:'#90a8d0'},
  {id:'fish',ic:'🎣',n:'Big Catch Week',w:n=>'Catch '+n.toLocaleString('en-US')+' fish together',s:'Fishing',goal:1000,col:'#48a8e0'},
  {id:'kill',ic:'⚔',n:'Monster Hunt Week',w:n=>'Beat '+n.toLocaleString('en-US')+' monsters together',s:'Attack',goal:1500,kill:1,col:'#e04040'},
  {id:'cook',ic:'🍳',n:'Feast Week',w:n=>'Cook '+n.toLocaleString('en-US')+' meals together',s:'Cooking',goal:800,min1:1,col:'#f0a840'},
  {id:'fire',ic:'🔥',n:'Bonfire Week',w:n=>'Light '+n.toLocaleString('en-US')+' fires together',s:'Firemaking',goal:300,xpc:1,col:'#f87830'},
  {id:'crop',ic:'🌾',n:'Harvest Week',w:n=>'Harvest '+n.toLocaleString('en-US')+' crops together',s:'Farming',goal:600,col:'#c8a838'}];
 const TIERS=[1/3,2/3,1],REW=[{g:250,x:400},{g:600,x:1000},{g:1500,x:2500}];
 const mins=e=>Math.max(1,Math.ceil(e.goal/50));
 const now=()=>{try{return window.SQMP&&SQMP.on&&typeof mpNow==='function'?mpNow():Date.now()}catch(e){return Date.now()}};
 const weekOf=t=>Math.floor((Math.floor(t/864e5)-4)/7);// day 4 of 1970 was a Monday
 const evOf=w=>EV[((w%EV.length)+EV.length)%EV.length];
 const endsAt=w=>(w*7+4+7)*864e5;
 const fb=()=>window.SQFB,on=()=>!!(window.SQMP&&SQMP.on&&SQMP.user&&fb()),me=()=>SQMP.user.uid;
 const ref=p=>fb().db.ref(fb().D,p);
 let W={w:weekOf(Date.now()),c:0,got:0,q:0},TOT=0,TOP=[],NP=0,unsub=null,subW=-1,sendAt=0,sending=false,LASTINV=null,LASTK=0,XPF=new Set(),XPN={},PAYING=false,lastChecked=-1;
 const E=()=>evOf(W.w);
 const tierOf=(tot,e)=>TIERS.filter(f=>tot>=Math.ceil(e.goal*f)).length;
 // ---- paying out tiers ----
 function pay(e,upTo,why){if(W.c<mins(e)||upTo<=W.got)return;let g=0,x=0;for(let i=W.got;i<upTo;i++){g+=REW[i].g;x+=REW[i].x}W.got=upTo;
  PAYING=true;try{GLD+=g;const si=SK(e.s);if(si>=0)addXp(si,x)}catch(er){}finally{PAYING=false}
  const m=(why||'')+e.n+': tier '+upTo+' reached! +'+g+' gold, +'+x+' '+e.s+' XP for helping.';
  setTimeout(()=>{try{say(m);msgT=6;sfx('quest');mpLog('game',m)}catch(er){}},600);try{saveLocal(true)}catch(er){}}
 // ---- the shared total ----
 function watch(){if(!on()){if(unsub){try{unsub()}catch(e){}unsub=null;subW=-1}return}if(subW===W.w&&unsub)return;if(unsub)try{unsub()}catch(e){}subW=W.w;const w=W.w;
  unsub=fb().db.onValue(ref('wev/'+w),s=>{if(w!==W.w)return;const v=s.val()||{};TOT=Math.max(0,+v.t||0);const p=v.p&&typeof v.p==='object'?v.p:{};
    const L=[];for(const u in p){const r=p[u];if(r&&typeof r==='object'&&typeof r.n==='string')L.push({u,n:r.n.replace(/[<>]/g,'').slice(0,12),c:Math.max(0,+r.c||0)})}
    NP=L.filter(r=>r.c>0).length;TOP=L.sort((a,b)=>b.c-a.c).slice(0,3);
    const mine=p[me()];if(mine&&+mine.c>W.c)W.c=Math.floor(+mine.c);// played on another device
    pay(E(),tierOf(TOT,E()));if(pnOpen&&ptab===6)rPn()},()=>{});
  try{(window.SQMP.unsub||[]).push(()=>{if(unsub){try{unsub()}catch(e){}unsub=null;subW=-1}})}catch(e){}}
 async function send(){if(sending||!on()||W.q<=0)return;sending=true;const w=W.w,d=Math.min(500,W.q),db=fb().db,r=ref('wev/'+w+'/t');
  try{let ok=false;if(db.runTransaction){const res=await db.runTransaction(r,cur=>(+cur||0)+d);ok=!!(res&&res.committed)}else{const s=await db.get(r);await db.set(r,(+s.val()||0)+d);ok=true}
   if(ok&&w===W.w){W.q-=d;await db.set(ref('wev/'+w+'/p/'+me()),{n:String(pname()).slice(0,12),c:W.c})}}catch(e){sendAt=performance.now()+20000}finally{sending=false}}
 // last week's tiers, when the week turns (or the game starts in a new week)
 function rollover(){const w=weekOf(now());if(w===W.w)return;const old=W;W={w,c:0,got:0,q:0};TOT=0;TOP=[];NP=0;
  if(old&&old.w===w-1&&old.c>=mins(evOf(old.w))&&old.got<3&&on()){fb().db.get(ref('wev/'+old.w+'/t')).then(s=>{const t=+s.val()||0,e=evOf(old.w),k=tierOf(t,e);if(k>old.got){
    let g=0,x=0;for(let i=old.got;i<k;i++){g+=REW[i].g;x+=REW[i].x}PAYING=true;try{GLD+=g;const si=SK(e.s);if(si>=0)addXp(si,x)}catch(er){}finally{PAYING=false}
    const m='Last week\'s '+e.n+' reached tier '+k+'. Your reward: +'+g+' gold, +'+x+' '+e.s+' XP.';setTimeout(()=>{try{say(m);msgT=6;sfx('quest');mpLog('game',m)}catch(er){}},1500);try{saveLocal(true)}catch(er){}}}).catch(()=>{})}
  setTimeout(()=>{try{if(!dead&&on()){const e=E();mpLog('game','New weekly event: '+e.n+'! '+e.w(e.goal)+'. See your quest log.')}}catch(er){}},3000)}
 function add(k){if(!(k>0)||!on())return;const was=W.c;W.c+=k;W.q+=k;if(was<mins(E())&&W.c>=mins(E()))pay(E(),tierOf(TOT,E()));if(pnOpen&&ptab===6)rPn()}
 // ---- counting ----
 {const _ax=addXp;addXp=function(i,x){const out=_ax.apply(this,arguments);if(!PAYING&&x>0){XPF.add(i);if(x<=200)XPN[i]=(XPN[i]|0)+1}return out}}// (big gains are rewards, not fires)
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{if(dead)return out;rollover();watch();const e=E(),si=SK(e.s);
   if(LASTINV&&!e.kill&&XPF.has(si)){if(e.xpc)add(XPN[si]|0);else{let tot=0;for(const k in inv){const v=(inv[k]|0)-(LASTINV[k]|0);if(v>0)tot+=v}add(e.min1?Math.max(1,tot):tot)}}
   if(typeof kills==='number'){if(e.kill&&kills>LASTK&&LASTINV)add(kills-LASTK);LASTK=kills}
   XPF.clear();XPN={};LASTINV=Object.assign({},inv);
   const t=performance.now();if(W.q>0&&t-sendAt>10000){sendAt=t;send()}}catch(er){}return out}}
 // ---- the quest log card ----
 const left=()=>{const ms=Math.max(0,endsAt(W.w)-now()),d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5);return d>0?d+'d '+h+'h left':h>0?h+'h left':Math.max(1,Math.ceil(ms/6e4))+' min left'};
 function html(){const e=E(),pc=Math.min(100,TOT/e.goal*100),k=tierOf(TOT,e),mn=mins(e);
  let h='<div class="sqwe-h"><b>'+e.ic+' WEEKLY EVENT: '+esc(e.n.toUpperCase())+'</b><span>'+left()+'</span></div><div class="sqwe-g">'+esc(e.w(e.goal))+'</div>';
  if(!on())return h+'<small>Sign in to play online and join the weekly event.</small>';
  h+='<div class="sqwe-b">'+TIERS.map(f=>'<i style="left:'+(f*100)+'%"></i>').join('')+'<div style="width:'+pc.toFixed(1)+'%;background:'+e.col+'"></div></div>';
  h+='<div class="sqwe-t"><span>'+Math.min(TOT,e.goal*10).toLocaleString('en-US')+' / '+e.goal.toLocaleString('en-US')+'</span><span>'+NP+' helper'+(NP===1?'':'s')+'</span></div>';
  h+='<div class="sqwe-r">'+REW.map((r,i)=>'<span class="'+(i<k?'on':'')+'">Tier '+(i+1)+': '+r.g+' gold + '+r.x+' XP'+(i<W.got?' ✔':'')+'</span>').join('')+'</div>';
  h+='<small>Your part: <b>'+W.c.toLocaleString('en-US')+'</b>'+(W.c<mn?' · gather '+(mn-W.c)+' more to earn the rewards':' · you\'ll get every tier the community reaches')+'</small>';
  if(TOP.length)h+='<small class="sqwe-top">Top helpers: '+TOP.map((r,i)=>(i+1)+'. '+esc(r.n)+' ('+r.c.toLocaleString('en-US')+')').join(' · ')+'</small>';
  return h}
 {const _rp=rPn;rPn=function(){const out=_rp.apply(this,arguments);try{if(pnOpen&&ptab===6){const d=document.createElement('div');d.className='sqwe';d.innerHTML=html();
    const dl=pbd.querySelector('.sqdl')||pbd.querySelector('.sqgd');if(dl)dl.after(d);else pbd.prepend(d)}}catch(e){}return out}}
 {const st=document.createElement('style');st.textContent=`#pn .sqwe{background:#fdf6e4;border:2px solid #c09040;border-radius:8px;padding:8px 10px;margin:0 0 10px;font-size:13px;color:#404040;text-align:left}
#pn .sqwe-h{display:flex;justify-content:space-between;align-items:center;gap:6px}#pn .sqwe-h b{letter-spacing:1px;color:#805010;font-size:13px}#pn .sqwe-h span{font-size:11px;color:#906030;white-space:nowrap}
#pn .sqwe-g{font-weight:700;margin:4px 0 6px}#pn .sqwe-b{position:relative;height:10px;background:#e8dcc0;border:1px solid #a88850}#pn .sqwe-b div{height:100%}
#pn .sqwe-b i{position:absolute;top:-2px;bottom:-2px;width:2px;margin-left:-1px;background:#806030}#pn .sqwe-b i:last-of-type{display:none}
#pn .sqwe-t{display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin:3px 0 5px}#pn .sqwe-r{display:flex;flex-direction:column;gap:1px;font-size:11px;margin-bottom:5px}
#pn .sqwe-r span{opacity:.6}#pn .sqwe-r span.on{opacity:1;color:#287818;font-weight:700}#pn .sqwe small{display:block;font-size:11px;opacity:.9}#pn .sqwe-top{margin-top:3px}`;document.head.appendChild(st)}
 // ---- the HUD pill (left of the players-online pill), tap = quest log ----
 let RECT=null;
 {const _dh=drawHUD;drawHUD=function(){const out=_dh.apply(this,arguments);RECT=null;try{if(menuOpen||!on()||(window.SQTS&&SQTS.open))return out;const L=hudLayout(),U=L.U,e=E(),pc=Math.min(100,Math.floor(TOT/e.goal*100));
   g.save();g.setTransform(1,0,0,1,0,0);g.font='700 '+10*U+'px '+PF;const txt=pc+'%',tw=g.measureText(txt).width,bw=34*U,h=16*U,w=bw+tw+30*U;
   let ow=0;{g.font='700 '+11*U+'px '+PF;ow=g.measureText(String(window.SQONLINE?SQONLINE():1)).width+20*U;g.font='700 '+10*U+'px '+PF}
   const x=Math.round(L.dx+L.dw-ow-6*U-w),y=Math.round(L.top-h-4*U);RECT={x,y,w,h};
   g.fillStyle='rgba(16,24,40,.72)';g.beginPath();g.roundRect(x,y,w,h,h/2);g.fill();
   g.font=(11*U)+'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(e.ic,x+10*U,y+h/2+.5*U);
   const bx=x+20*U,by=y+h/2-2.5*U;g.fillStyle='rgba(255,255,255,.22)';g.fillRect(bx,by,bw,5*U);g.fillStyle=e.col;g.fillRect(bx,by,Math.round(bw*pc/100),5*U);
   g.font='700 '+10*U+'px '+PF;g.fillStyle='#fff4d8';g.textAlign='left';g.fillText(txt,bx+bw+4*U,y+h/2+.5*U);g.restore()}catch(er){}return out}}
 cv.addEventListener('pointerdown',ev=>{if(!RECT||menuOpen||pnOpen)return;const r=cv.getBoundingClientRect(),sx=(ev.clientX-r.left)*(cv.width/r.width),sy=(ev.clientY-r.top)*(cv.height/r.height);
  if(sx>=RECT.x-4&&sx<=RECT.x+RECT.w+4&&sy>=RECT.y-4&&sy<=RECT.y+RECT.h+4){ev.stopImmediatePropagation();ev.preventDefault();try{openPanel(6)}catch(x){}}},true);
 // ---- saves ----
 {const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);try{if(W.c||W.got)s.wev={w:W.w,c:W.c,got:W.got,q:W.q}}catch(e){}return s}}
 {const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);try{const v=S&&S.wev;W=v&&typeof v==='object'&&isFinite(+v.w)?{w:+v.w|0,c:Math.max(0,v.c|0),got:Math.max(0,Math.min(3,v.got|0)),q:Math.max(0,v.q|0)}:{w:weekOf(now()),c:0,got:0,q:0};
   TOT=0;TOP=[];NP=0;subW=-1;if(unsub){try{unsub()}catch(e){}unsub=null}LASTINV=null;LASTK=typeof kills==='number'?kills:0}catch(e){}return out}}
 {const _ng=newGame;newGame=function(){const out=_ng.apply(this,arguments);W={w:weekOf(now()),c:0,got:0,q:0};LASTINV=null;LASTK=0;return out}}
 window.SQWEEK={EV,TIERS,REW,weekOf,evOf,get state(){return W},set state(v){W=v},get total(){return TOT},html,mins,send,tierOf}})();
