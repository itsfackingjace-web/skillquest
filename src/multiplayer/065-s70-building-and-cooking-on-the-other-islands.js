// ---------------------------------------------------------------- 70. Building and cooking on the other islands
// Fences, walls, gates, chests, beds and stations (furnace, anvil, stove, bench, planter, dummy...) can be built on
// every island, not just Hollow. Each island keeps its own builds (saved with your game), other players see them
// (build/<uid>.r) and can't touch them. Houses, furniture and farm plots stay on Hollow Island. Gates don't block the
// way on other islands, and beds there are for show (you always wake up on Hollow).
// Campfires on other islands now cook food too.
const RB={},RBQ={draw:null};
const rbR=()=>{const R=SCENE&&SCENE.room;return R&&R.region?R:null};
const rbMap=id=>RB[id]||(RB[id]=new Map());
const rbK=(x,y)=>x+','+y,rbXY=k=>k.split(',').map(Number);
const rbIdx=(R,x,y)=>1e7+(Object.keys(WORLD_REGIONS).indexOf(R.region)+1)*1e5+y*R.w+x;   // a station's id (for daily berries and pick-up)
function rbForeign(id){const out=[];for(const o in BLDS.data){if(MP.user&&o===MP.user.uid)continue;const rec=BLDS.data[o],r=rec&&rec.r&&rec.r[id];if(!r)continue;
  const arr=Array.isArray(r)?r:Object.values(r);for(const e0 of arr){const e=Array.isArray(e0)?e0:Object.values(e0||{});const x=e[0]|0,y=e[1]|0,t=e[2];if(BK.includes(t)&&t!=='house')out.push({x,y,t,owner:o})}}return out}
const rbForeignAt=(id,x,y)=>rbForeign(id).find(f=>f.x===x&&f.y===y)||null;
function rbOpen(R,x,y){if(x<1||y<1||x>=R.w-1||y>=R.h-1)return false;const i=y*R.w+x;if(R.solid.has(i)||solid(x*16+8,y*16+8))return false;if(rgObjAt(R,x,y))return false;
 if(rbMap(R.region).has(rbK(x,y))||rbForeignAt(R.region,x,y))return false;
 for(const p of[R.spawn,R.dock])if(p&&Math.hypot(x-p[0],y-p[1])<4)return false;
 if(Math.floor(P.x/16)===x&&Math.floor(P.y/16)===y)return false;return true}
// walls block the way (gates don't); kept in step with your builds and other players'
function rbSolidSync(){const R=rbR();if(!R)return;const want=new Set(),had=R._rbS||new Set(),add=(x,y,t)=>{if(t==='door')return;const i=y*R.w+x;if(had.has(i)||!R.solid.has(i))want.add(i)};
 for(const[k,s]of rbMap(R.region)){const[x,y]=rbXY(k);add(x,y,s.t)}for(const f of rbForeign(R.region))add(f.x,f.y,f.t);
 for(const i of had)if(!want.has(i))R.solid.delete(i);for(const i of want)R.solid.add(i);R._rbS=want}
setInterval(rbSolidSync,500);
// ---- building ----
{const _sb=startBuild;startBuild=function(k){const R=rbR();if(!R)return _sb(k);if((inv[k]|0)<1)return;
  if(k==='house'){say('Houses can only be built on Hollow Island.');closePanel();return}
  if(FURN_ONLY.has(k)){say('Furniture goes inside your house on Hollow Island.');closePanel();return}
  if(typeof isSeed==='function'&&isSeed(k)){say('Farm plots are on Hollow Island.');closePanel();return}
  BUILD={k};closePanel();setActionLabels();say('Build mode: face an empty spot and press PLACE. Press DONE to stop.')}}
{const _pb=placeBuild;placeBuild=function(){const R=rbR();if(!R||!BUILD)return _pb();const k=BUILD.k;if((inv[k]|0)<1){endBuild('You have no more '+INAME[k].toLowerCase()+'s.');return}
  const[x,y]=frontTile();if(!rbOpen(R,x,y)){say('You can\'t build there.');sfx('swish');return}
  inv[k]--;const s={t:k,hp:BHP[k]||4};if(k==='chest')s.items={};rbMap(R.region).set(rbK(x,y),s);rbSolidSync();sfx(k==='swall'?'mine':'chop');saveLocal(true);saveCloud();
  if((inv[k]|0)<1)endBuild('Placed your last '+INAME[k].toLowerCase()+'.')}}
function rbPick(R,x,y){const m=rbMap(R.region),s=m.get(rbK(x,y));if(!s)return;m.delete(rbK(x,y));rbSolidSync();inv[s.t]=(inv[s.t]|0)+1;let extra='';
 if(s.items){for(const k in s.items)inv[k]=(inv[k]|0)+s.items[k];if(Object.values(s.items).some(v=>v>0))extra=' and everything inside'}
 say('Picked up the '+INAME[s.t].toLowerCase()+extra+'.');setTimeout(()=>sfx('pickup'),90);saveLocal(true);saveCloud()}
function rbHit(R,x,y,s){const wood=s.t!=='swall';s.hp-=1+(wood?TL.axe:TL.pick);s.shake=.15;sfx(wood?'chop':'mine');if(s.hp<=0)rbPick(R,x,y)}
function rbOpenStation(R,x,y,s){openStation({t:s.t,inside:false,i:rbIdx(R,x,y),f:s})}
// picking up a station from its screen
{const _ps=pickStruct;pickStruct=function(i){if(i<1e7)return _ps(i);const R=rbR();if(!R)return;const j=i-1e7-(Object.keys(WORLD_REGIONS).indexOf(R.region)+1)*1e5;rbPick(R,j%R.w,Math.floor(j/R.w))}}
// HIT: hit what you built (stations open, the dummy wobbles); TALK: open chests and stations
const rbFront=R=>{const[x,y]=frontTile();return{x,y,s:rbMap(R.region).get(rbK(x,y))}};
{const _a=attack;attack=function(){const R=rbR();if(R&&!dead&&!menuOpen&&!pnOpen&&!BUILD&&swing<=0&&!FISH){const{x,y,s}=rbFront(R);
   if(s){swing=.25;if(s.t==='dummy'){s.wob=.3;setTimeout(()=>{s.wob=0},300);sfx('hit');if(lvOf(0)<30){addXp(0,4);addXp(7,1)}return}
    if(STN.has(s.t)){rbOpenStation(R,x,y,s);return}rbHit(R,x,y,s);return}
   const f=rbForeignAt(R.region,x,y);if(f){notYours(f.owner);return}}return _a()}}
{const _t=talk;talk=function(){const R=rbR();if(R&&!dead&&!menuOpen&&!pnOpen&&!nearNpc()){let hit=null;
   for(const[dx,dy]of[[0,0],[face[0],face[1]],[0,1],[0,-1],[1,0],[-1,0]]){const x=Math.floor(P.x/16)+dx,y=Math.floor((P.y+(face[1]>0?4:0))/16)+dy,s=rbMap(R.region).get(rbK(x,y));if(s&&(s.t==='chest'||s.t==='bed'||STN.has(s.t))){hit={x,y,s};break}}
   if(!hit){const{x,y,s}=rbFront(R);if(s)hit={x,y,s}}
   if(hit){const{x,y,s}=hit;if(s.t==='chest'){CHEST_H=s;CHEST_AT=-1;fromMenu=false;pnOpen=true;ptab=7;jx=jy=0;pn.style.display='block';rPn();sfx('talk');return}
    if(s.t==='bed'){say('A comfy bed. You always wake up on Hollow Island, though.');return}if(STN.has(s.t)){rbOpenStation(R,x,y,s);return}}}return _t()}}
// ---- drawing ----
{const _fn=fenceNb;fenceNb=function(x,y){const D=RBQ.draw;if(!D)return _fn(x,y);const rx=x-1+D.x,ry=y-1+D.y,s=rbMap(D.R.region).get(rbK(rx,ry));if(s)return WALLISH.has(s.t);const f=rbForeignAt(D.R.region,rx,ry);return!!f&&WALLISH.has(f.t)}}
function rbDraw(R,x,y,s,tm){if(STN.has(s.t)){if(s.t==='planter')s.ready=PLANTD[plantKey(false,rbIdx(R,x,y))]!==today();drawStation(s.t,x,y,s,tm);return}
 RBQ.draw={R,x,y};g.save();g.translate((x-1)*16,(y-1)*16);try{if(WALLISH.has(s.t))drawFence(N+1,s,false);else drawStruct(N+1,s,false)}finally{g.restore();RBQ.draw=null}}
{const _rn=rgNear;rgNear=function(R,x0,y0,x1,y1){const out=_rn(R,x0,y0,x1,y1);if(!R||!R.region||!(SCENE&&SCENE.room===R))return out;const inV=(x,y)=>x>=x0-2&&x<=x1+2&&y>=y0-2&&y<=y1+2;
  for(const[k,s]of rbMap(R.region)){const[x,y]=rbXY(k);if(inV(x,y))out.push({t:'_rb',s,tx:x,ty:y,x:x+.5,y:y})}
  for(const f of rbForeign(R.region))if(inV(f.x,f.y))out.push({t:'_rb',s:{t:f.t,hp:9,_foreign:f.owner},tx:f.x,ty:f.y,x:f.x+.5,y:f.y});return out}}
{const _df=drawFurn;drawFurn=function(it,tm){if(it&&it.t==='_rb'){const R=rbR();if(R)try{rbDraw(R,it.tx,it.ty,it.s,tm)}catch(e){}return}return _df(it,tm)}}
{const _u=upd;upd=function(dt){_u(dt);const R=rbR();if(R)for(const s of rbMap(R.region).values())if(s.shake>0)s.shake-=dt}}
// ---- saving ----
{const _sn=snap;snap=function(){const s=_sn();const o={};for(const id in RB){const a=[];for(const[k,v]of RB[id]){const[x,y]=rbXY(k);a.push(v.items?[x,y,v.t,v.items]:[x,y,v.t])}if(a.length)o[id]=a}if(Object.keys(o).length)s.rb=o;return s}}
{const _ap=applySave;applySave=function(S){_ap(S);for(const id in RB)delete RB[id];const o=S&&S.rb;if(o&&typeof o==='object')for(const id in o){if(!WORLD_REGIONS[id])continue;const m=rbMap(id);
   for(const e of (Array.isArray(o[id])?o[id]:[])){if(!Array.isArray(e)||!BK.includes(e[2]))continue;const s={t:e[2],hp:BHP[e[2]]||4};if(e[2]==='chest')s.items=(e[3]&&typeof e[3]==='object')?{...e[3]}:{};m.set(rbK(e[0]|0,e[1]|0),s)}}
  try{rbSolidSync()}catch(e){}}}
{const _ng=newGame;newGame=function(){for(const id in RB)delete RB[id];_ng()}}
// shared with other players alongside your Hollow builds
function rbPub(){const o={};for(const id in RB){const a=[];for(const[k,v]of RB[id]){const[x,y]=rbXY(k);a.push([x,y,v.t])}if(a.length)o[id]=a}return Object.keys(o).length?o:null}
// cooking: a campfire on another island is a real fire
{const _nf=nearFire;nearFire=function(x,y,r){if(curRegion()==='hollow')return _nf(x,y,r);const rr=r===50&&typeof NF50!=='undefined'?NF50:r===70&&typeof NF70!=='undefined'?NF70:r;
  return fires.some(f=>(f.life===undefined||f.life>0)&&Math.hypot(f.x-x,f.y-y)<rr)}}
window.SQRB=RB;
