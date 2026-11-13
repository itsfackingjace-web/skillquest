// ---------------------------------------------------------------- 69. Seeing other players fight, and opt-in PvP
// Everyone near you sees your sword swings, arrows and spells (and you see theirs): each attack is sent as a small
// event to fx/<uid>, and the other players draw it (the arrows and spells fly, stop at walls and monsters, and do no
// damage on their screens; only the player who made them deals damage).
// PvP is opt-in: START menu > PvP. Players with PvP on get a red name and a skull, and can hurt each other with any
// attack. Players with PvP off can't hurt or be hurt by anyone. You can't turn it off until 30 seconds after your last
// fight. Hollow Village, houses and buildings are safe zones (dungeons and the wilds are not). Hits go to
// pvp/<victim>; the victim's game checks them, rolls their own block and dodge, and loses hearts as usual.
// A PvP death drops your things in a grave like any death, so whoever wins can loot it.
const PV={on:false,fight:0,fxSeq:0,seen:{},ghosts:[],unsubFx:null,unsubHit:null,lastBy:null,lastByAt:0,lastSafe:null,koSent:0};
const PVLOCK=30000,PVSAFE=14;
// hooks for sections outside this block: SQFXH[kind](player,event) for new event kinds, SQPEERFX drawers run with each
// other player (in world space), SQPVSEND(event) to send one, and SQPVQUIET (true) to keep the next attack()s from being sent as swings
const SQFXH=window.SQFXH=window.SQFXH||{},SQPEERFX=window.SQPEERFX=window.SQPEERFX||[];window.SQPVSEND=ev=>pvSend(ev);
// where fighting is allowed
function pvSafeAt(loc,x,y){if(!loc)return true;if(loc.startsWith('h:'))return true;
 if(loc.startsWith('in:')&&!(loc.startsWith('in:dun')||loc.startsWith('in:cave')||loc.startsWith('in:tomb')))return true;
 if(loc==='hollow'&&Math.hypot(x/16-VX,y/16-VY)<PVSAFE)return true;return false}
const pvMeSafe=()=>pvSafeAt(mpLoc(),P.x,P.y);
const pvDuel=u=>!!(window.SQDUEL&&SQDUEL.fighting&&u&&SQDUEL.foe===u);// a duel: the two can fight anywhere, PvP on or off
function pvTarget(r){if(r&&pvDuel(r.uid))return MP.on&&live(r)&&!dead&&r.loc===mpLoc();return PV.on&&MP.on&&r&&r.pk&&live(r)&&!dead&&r.loc===mpLoc()&&!pvMeSafe()&&!pvSafeAt(r.loc,r.tx,r.ty)}
// ---- sending what you do ----
function pvSend(ev){if(!MP.on||!MP.user)return;const L=mpLoc();if(!L)return;ev.s=++PV.fxSeq;ev.loc=L;ev.t=FB.db.serverTimestamp();FB.db.set(FB.db.ref(FB.D,'fx/'+MP.user.uid),ev).catch(()=>{})}
const r2=v=>Math.round(v*100)/100;
{const _s=shoot;shoot=function(){const n0=PROJ.length;_s();const a=PROJ.slice(n0).filter(p=>p.k==='arrow').map(p=>[Math.round(p.x),Math.round(p.y),Math.round(p.vx),Math.round(p.vy),r2(p.life),p.iron?1:0]);if(a.length)pvSend({k:'ar',a})}}
{const _c=castSpell;castSpell=function(first){const n0=SPELLS.length;const r=_c(first);const a=SPELLS.slice(n0).map(s=>[Math.round(s.x),Math.round(s.y),Math.round(s.vx),Math.round(s.vy),r2(s.life),s.el]);if(a.length)pvSend({k:'sp',a});return r}}
{const _a=attack;attack=function(){const s0=swing,p0=PROJ.length,c0=SPELLS.length;_a();
  const tool=ACTN&&(ACTN.type==='chop'||ACTN.type==='mine'||ACTN.type==='till'||ACTN.type==='water');
  if(s0<=0&&swing>0&&PROJ.length===p0&&SPELLS.length===c0&&!tool&&!FISH&&!window.SQPVQUIET){pvSend({k:'sw',d:[face[0],face[1]],w:(window.SQSLEDGE&&SQSLEDGE())?9:(TL.sword|0)});pvMelee()}}}
// ---- what the others do ----
function pvFx(u,v){if(!v||typeof v!=='object'||!MP.user||u===MP.user.uid)return;const s=+v.s||0;if(PV.seen[u]&&s<=PV.seen[u])return;PV.seen[u]=s;
 if(typeof v.t==='number'&&mpNow()-v.t>2500)return;if(v.loc!==mpLoc())return;const AR=x=>Array.isArray(x)?x:(x&&typeof x==='object'?Object.keys(x).sort((a,b)=>a-b).map(k=>x[k]):null);v.d=AR(v.d);v.a=AR(v.a);const r=MP.players.get(u);if(!r)return;const sc=curScene();
 if(v.k==='sw'&&Array.isArray(v.d)){r.swAt=performance.now();r.swD=[Math.sign(+v.d[0]||0),Math.sign(+v.d[1]||0)];r.swW=v.w==null?3:(+v.w|0);try{sfx('swish')}catch(e){}}
 else if((v.k==='ar'||v.k==='sp')&&Array.isArray(v.a))for(const q0 of v.a.slice(0,8)){const q=AR(q0);if(!q)continue;const[x,y,vx,vy,life,ex]=q;if(![x,y,vx,vy].every(isFinite))continue;
   const gp={k:v.k==='ar'?'arrow':'spell',x:+x,y:+y,vx:+vx,vy:+vy,t:0,life:Math.min(3,+life||1),sc,f:u,ghost:1};if(v.k==='ar')gp.iron=!!ex;else{if(!WSP[ex])continue;gp.el=ex}PV.ghosts.push(gp);
   if(v.k==='ar'){r.bowAt=performance.now();try{sfx('bow')}catch(e){}}else{r.castAt=performance.now();r.castEl=gp.el;try{sfx(WSP[gp.el].sfx)}catch(e){}}}
 else if(SQFXH[v.k])try{SQFXH[v.k](r,v)}catch(e){console.warn(e)}}
// ghosts fly until a wall, a monster, or (in a fight) you
function pvGhostStep(dt){const sc=curScene();for(const p of PV.ghosts){if(p.sc!==sc){p.dead=1;continue}p.t+=dt;const nx=p.x+p.vx*dt,ny=p.y+p.vy*dt;
  if(p.t>p.life||projBlocked(nx,ny+4)){p.dead=1;if(p.k==='spell')for(let k=0;k<5;k++)part(p.x,p.y,(Math.random()-.5)*80,(Math.random()-.7)*60,.3,WSP[p.el].col,60);continue}p.x=nx;p.y=ny;
  if(p.k==='spell'&&Math.random()<.5)part(p.x,p.y,(Math.random()-.5)*20,(Math.random()-.5)*20,.25,WSP[p.el][Math.random()<.5?'col':'c2'],p.el==='fire'?-40:0);
  for(const n of en){if(n.dead)continue;const big=n.type==='boss'||n.type==='bonelord'||n.big;if(Math.hypot(n.x-p.x,(n.y-(big?10:4))-p.y)<(big?18:10)){p.dead=1;break}}
  if(!p.dead&&!dead&&PV.on&&Math.hypot(P.x-p.x,P.y-2-p.y)<9){const r=MP.players.get(p.f);if(r&&r.pk)p.dead=1}
  if(!p.dead)for(const r of MP.players.values()){if(r.uid===p.f||!r.pk||r.loc!==mpLoc())continue;if(Math.hypot(r.x-p.x,r.y-4-p.y)<9){const o=MP.players.get(p.f);if(o&&o.pk){p.dead=1;break}}}}
 for(let i=PV.ghosts.length-1;i>=0;i--)if(PV.ghosts[i].dead)PV.ghosts.splice(i,1);if(PV.ghosts.length>80)PV.ghosts.splice(0,PV.ghosts.length-80)}
{const _d=drawCombatFx;drawCombatFx=function(tm){_d(tm);const sc=curScene();for(const p of PV.ghosts)if(p.sc===sc&&p.k==='arrow')drawProj(p)}}
{const _d=drawSpells;drawSpells=function(tm){const add=PV.ghosts.filter(p=>p.k==='spell');const n0=SPELLS.length;for(const p of add)SPELLS.push(p);try{_d(tm)}finally{SPELLS.splice(n0,add.length)}}}
// their sword swing (the same arc as yours), their bow and wand
{const _dp=mpDrawPeer;mpDrawPeer=function(r,tm){_dp(r,tm);for(const f of SQPEERFX)try{f(r,tm)}catch(e){}const now=performance.now(),x=Math.round(r.x),y=Math.round(r.y);
  if(r.swAt&&now-r.swAt<250&&window.SQSWING){SQSWING(x,y,r.swD[0],r.swD[1],(now-r.swAt)/250,r.swW,tm)}
  else if(r.swAt&&now-r.swAt<250){const[fx,fy]=r.swD,a=Math.atan2(fy,fx),pr=(now-r.swAt)/250,f=Math.min(2,Math.floor(pr*3)),an=a+(f-1)*1.15,hx=x+fx*5,hy=y-4+fy*5;
   for(let i=2;i<=12;i++)Rg(hx+Math.cos(an)*i-1,hy+Math.sin(an)*i-1,4,4,O);for(let i=2;i<=12;i++)Rg(hx+Math.cos(an)*i,hy+Math.sin(an)*i,2,2,i<=3?GD:SV);
   for(let k=0;k<=f;k++){const q=a+(k-1)*1.15;for(let j=-2;j<=2;j++){const w2=q+j*.18;Rg(hx+Math.cos(w2)*15,hy+Math.sin(w2)*15,2,2,'#fff');Rg(hx+Math.cos(w2)*12,hy+Math.sin(w2)*12,1,1,'#c8e8ff')}}}
  if(r.castAt&&now-r.castAt<350&&WSP[r.castEl]){const dx=r.d===2?(r.fl?-1:1):0,dy=r.d===2?0:r.d===1?-1:1,hx=x+dx*6,hy=y-5+dy*5,W2=WSP[r.castEl];for(let i=0;i<9;i++)Rg(Math.round(hx+dx*i)-1,Math.round(hy+dy*i)-1,3,3,O);
   for(let i=0;i<9;i++)Rg(Math.round(hx+dx*i),Math.round(hy+dy*i),1,1,'#7a4a20');const tx=Math.round(hx+dx*9),ty=Math.round(hy+dy*9);Rg(tx-1,ty-1,3,3,W2.col);Rg(tx,ty,1,1,'#fff')}
  if(r.bowAt&&now-r.bowAt<300){const dx=r.d===2?(r.fl?-1:1):0,dy=r.d===2?0:r.d===1?-1:1,bx=x+dx*7,by=y-3+dy*6;if(dx){for(let i=-5;i<=5;i++)Rg(bx+Math.round(Math.abs(i)*-.35*dx),by+i,1,1,'#8a5a30');Rg(bx-dx*2,by-5,1,11,'#f0f0f0')}else{for(let i=-5;i<=5;i++)Rg(bx+i,by+Math.round(Math.abs(i)*-.35*dy),1,1,'#8a5a30');Rg(bx-5,by-dy*2,11,1,'#f0f0f0')}}}}
// ---- PvP: your hits on them ----
function pvDmg(kind,p){if(kind==='sw')return TL.sword>=6?2:1;if(kind==='ar')return(p&&p.dmg>=6)?2:1;return 1}
function pvHit(r,kind,el){const n=performance.now();if(r.pvHitAt&&n-r.pvHitAt<350)return;r.pvHitAt=n;PV.fight=n;let d=pvDmg(kind);try{if(window.SQPVDMG)d=SQPVDMG(kind,el)}catch(e){}
 FB.db.push(FB.db.ref(FB.D,'pvp/'+r.uid),{f:MP.user.uid,n:myName().slice(0,12),d,k:kind,el:el||'',t:FB.db.serverTimestamp()}).catch(mpErr);
 DMGS.push({x:r.x,y:r.y-16,v:String(d),t:0,c:'#f86848',sc:curScene()});try{sfx('hit')}catch(e){}}
function pvMelee(){if(!PV.on&&!(window.SQDUEL&&SQDUEL.fighting))return;for(const r of MP.players.values()){if(!pvTarget(r))continue;const dx=r.x-P.x,dy=r.y-P.y,al=dx*face[0]+dy*face[1],pe=Math.abs(dx*face[1]-dy*face[0]);if(al>-2&&al<24&&pe<14){pvHit(r,'sw');break}}}
function pvProjHits(){if(!PV.on&&!(window.SQDUEL&&SQDUEL.fighting))return;const ts=[...MP.players.values()].filter(pvTarget);if(!ts.length)return;const sc=curScene();
 for(const p of PROJ){if(p.dead||p.hostile||p.k!=='arrow'||p.sc!==sc)continue;for(const r of ts)if(Math.hypot(r.x-p.x,r.y-4-p.y)<10){p.dead=1;p.life=-1;pvHit(r,'ar');break}}
 for(const s of SPELLS){if(s.dead||s.ghost||s.sc!==sc)continue;for(const r of ts)if(Math.hypot(r.x-s.x,r.y-4-s.y)<10){s.dead=1;s.life=-1;pvHit(r,'sp',s.el);break}}}
{const _u=upd;upd=function(dt){_u(dt);if(menuOpen||pnOpen)return;try{pvGhostStep(dt);pvProjHits()}catch(e){console.warn(e)}}}
// ---- PvP: their hits on you ----
function pvIncoming(id,v){FB.db.remove(FB.db.ref(FB.D,'pvp/'+MP.user.uid+'/'+id)).catch(()=>{});if(!v||typeof v!=='object')return;
 const u=String(v.f||''),r=MP.players.get(u);if(typeof v.t==='number'&&mpNow()-v.t>5000)return;
 if(v.k==='ko'){mpLog('game','You defeated '+String(v.n||trName(u)).slice(0,12)+'! Their grave is where they fell.');try{sfx('quest')}catch(e){}return}
 if(pvDuel(u)){if(dead||!r||r.loc!==mpLoc()||Math.hypot(r.tx-P.x,r.ty-P.y)>260)return}
 else if(!PV.on||dead||!r||!r.pk||r.loc!==mpLoc()||pvMeSafe()||Math.hypot(r.tx-P.x,r.ty-P.y)>260)return;
 let d=Math.max(1,Math.min(3,+v.d|0));try{if(window.SQPVARM)d=SQPVARM(d)}catch(e){}const who=String(v.n||r.n).slice(0,12);PV.fight=performance.now();PV.lastBy=u;PV.lastByAt=performance.now();
 if(ROLLT>0)return;if(hurt>0)return;
 if(Math.random()<Math.min(window.SQPVBLK||1,blockCh())){hurt=.5;say('Blocked '+who+'\'s attack!');sfx('block');addXp(8,10);return}
 hurtP(d,'Hit by '+who+'!');if(window.SQPVIF&&hurt>SQPVIF)hurt=SQPVIF;DMGS.push({x:P.x,y:P.y-18,v:String(d),t:0,c:'#f86848',sc:curScene()})}
// when a player beats you, they hear about it
setInterval(()=>{if(dead&&PV.lastBy&&performance.now()-PV.lastByAt<8000&&PV.koSent!==PV.lastByAt&&MP.on){PV.koSent=PV.lastByAt;const k=PV.lastBy;
  FB.db.push(FB.db.ref(FB.D,'pvp/'+k),{f:MP.user.uid,n:myName().slice(0,12),d:0,k:'ko',el:'',t:FB.db.serverTimestamp()}).catch(()=>{});mpLog('game',trName(k)+' defeated you.')}},300);
function pvStart(){const d=FB.db;PV.unsubFx=d.onValue(d.ref(FB.D,'fx'),s=>{const v=s.val()||{};for(const u in v)pvFx(u,v[u])});
 PV.unsubHit=d.onChildAdded(d.ref(FB.D,'pvp/'+MP.user.uid),s=>pvIncoming(s.key,s.val()));
 MP.unsub.push(()=>{if(PV.unsubFx)PV.unsubFx();if(PV.unsubHit)PV.unsubHit();PV.unsubFx=PV.unsubHit=null;PV.on=false;PV.ghosts.length=0;PV.seen={}})}
{const _ms=mpStart;mpStart=async function(u){await _ms(u);if(MP.on&&MP.user&&!PV.unsubFx)try{pvStart()}catch(e){mpErr(e)}}}
// ---- turning it on and off ----
const pvLock=()=>Math.max(0,PVLOCK-(performance.now()-PV.fight));
function pvToggle(){if(!MP.on){say('Sign in to fight other players.');return}if(dead)return;
 if(PV.on){const l=pvLock();if(PV.fight&&l>0){say('You were just in a fight. PvP stays on for '+Math.ceil(l/1000)+' more seconds.');sfx('swish');return}PV.on=false;say('PvP is off. Nobody can hurt you.');sfx('talk')}
 else{PV.on=true;PV.fight=0;say('PvP is ON. Other PvP players can attack you!');sfx('quest')}
 MP.last='';if(pnOpen&&ptab===PTAB)rPn()}
const PTAB=34;
function pvpHTML(){const l=pvLock(),on=PV.on;let h='<div class="tl">PLAYER VS PLAYER</div><div class="qc"><p><b>PvP is '+(on?'ON':'OFF')+'.</b> '+(on?'Players with PvP on can attack you, and you can attack them.':'Nobody can hurt you, and you can\'t hurt anyone.')+'</p>'+
 '<p>Players with PvP on have a <b style="color:#d03828">red name and a skull</b>. Only they can fight each other.</p><p>Falling in a fight drops your things in a grave, like any fall. The winner can loot it.</p>'+
 '<p>Safe zones: Hollow Village, houses and buildings. The wilds, other islands and dungeons are not safe.</p><p>After a fight, PvP stays on for 30 seconds.</p></div>';
 if(!MP.on)return h+'<div class="qc"><p>Sign in on the title screen to use PvP.</p></div>';
 h+='<div class="tra"><button class="'+(on?'n':'y')+'" data-pv="t"'+(on&&PV.fight&&l>0?' disabled style="opacity:.5"':'')+'>'+(on?(PV.fight&&l>0?'LOCKED ('+Math.ceil(l/1000)+'s)':'TURN PVP OFF'):'TURN PVP ON')+'</button></div>';if(on&&pvMeSafe())h+='<div class="trst">You\'re in a safe zone right now.</div>';return h}
SMI.splice(SMI.findIndex(x=>x.id==='options'),0,{id:'pvp',l:()=>'PvP: '+(PV.on?'ON':'OFF')});
{const _ss=showScreen;showScreen=function(id){if(id!=='pvp')return _ss(id);pnOpen=true;ptab=PTAB;jx=jy=0;pn.style.display='block';rPn();sfx('talk')}}
{const _r=rPn;rPn=function(){if(ptab===PTAB){panelChrome('');pbd.innerHTML=pvpHTML();return}_r()}}
{const _oc=pbd.onclick;pbd.onclick=e=>{const b=e.target.closest('[data-pv]');if(b&&ptab===PTAB){if(!b.disabled)pvToggle();return}_oc(e)}}
setInterval(()=>{if(pnOpen&&ptab===PTAB&&PV.on&&PV.fight)rPn()},1000);
// a small badge while PvP is on
{const st=document.createElement('style');st.textContent=`#pvb{position:fixed;left:14px;top:calc(env(safe-area-inset-top,0px) + 236px);z-index:9;display:none;padding:4px 9px;font:700 12px ${PF};pointer-events:none;color:#f8f8f8;background:#b03828!important;border-color:#702018!important;box-shadow:inset 0 0 0 2px #e87060!important}`;document.head.appendChild(st)}
const pvB=el('div','pvb','g3','');document.body.appendChild(pvB);
setInterval(()=>{const show=PV.on&&MP.on&&!dead&&!pnOpen&&!menuOpen&&!TS.open;pvB.style.display=show?'block':'none';if(show){const l=pvLock();pvB.textContent='☠ PvP ON'+(pvMeSafe()?' · safe zone':PV.fight&&l>0?' · in a fight '+Math.ceil(l/1000)+'s':'')}},250);
window.SQPVP=PV;window.SQMPON=()=>!!(MP.on&&MP.user);
