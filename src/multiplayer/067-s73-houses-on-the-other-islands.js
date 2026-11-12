// ---------------------------------------------------------------- 73. Houses on the other islands
// A house can go on any island. It works like your Hollow house: walk in through the door, decorate it, sleep in
// the bed to wake up there, and HIT it to pack it up (with everything inside). Leaving it puts you back on that
// island. Other players see it (build/<uid>.r._h) but can't damage it or go in.
const RH=[];   // {id, rg, x, y, w, furn, hp}
const rhTiles=h=>{const a=[];for(let dy=-1;dy<=0;dy++)for(let dx=-3;dx<=3;dx++)if(dx||dy)a.push([h.x+dx,h.y+dy]);return a};
const rhHere=()=>{const R=rbR();return R?RH.filter(h=>h.rg===R.region):[]};
const RHF={};   // other players' island houses, kept as the same objects so a visit isn't interrupted
function rhForeign(id){const out=[];for(const o in BLDS.data){if(MP.user&&o===MP.user.uid)continue;const rec=BLDS.data[o],L=rec&&rec.r&&rec.r._h;if(!L)continue;
  for(const e0 of (Array.isArray(L)?L:Object.values(L))){const e=Array.isArray(e0)?e0:Object.values(e0||{});if(e[0]!==id||!isFinite(e[1])||!isFinite(e[2]))continue;
   const oid=String(e[3]||(e[1]+'_'+e[2])).slice(0,12),key=o+'|'+oid,fresh=buildForeign(o,{id:oid,x:e[1],y:e[2],w:7,f:e[4]});let h=RHF[key];
   if(!h||h.x!==fresh.x||h.y!==fresh.y){h=RHF[key]=fresh;h.rg=id}else h.furn=fresh.furn;out.push(h);
   if(!HS.frUnsub[o])HS.frUnsub[o]=FB.db.onValue(FB.db.ref(FB.D,'friends/'+o),s=>{HS.fr[o]=s.val()||{}})}}return out}
const rhAt=(list,x,y)=>list.find(h=>x>=h.x-3&&x<=h.x+3&&y>=h.y-1&&y<=h.y)||null;
function rhFits(R,x,y){for(let dy=-2;dy<=1;dy++)for(let dx=-3;dx<=3;dx++){const tx=x+dx,ty=y+dy;if(dy===1&&dx)continue;if(tx<1||ty<1||tx>=R.w-1||ty>=R.h-1)return false;
  if(R.solid.has(ty*R.w+tx)||solid(tx*16+8,ty*16+8)||rgObjAt(R,tx,ty)||rbMap(R.region).has(rbK(tx,ty))||rbForeignAt(R.region,tx,ty))return false;
  if(rhAt(rhHere(),tx,ty)||rhAt(rhForeign(R.region),tx,ty))return false}
 for(const p of[R.spawn,R.dock])if(p&&Math.hypot(x-p[0],y-p[1])<6)return false;return true}
// walls of the house block the way (the door doesn't)
function rhSolidSync(){const R=rbR();if(!R)return;const want=new Set(),had=R._rhS||new Set();
 for(const h of rhHere().concat(rhForeign(R.region)))for(const[x,y]of rhTiles(h)){const i=y*R.w+x;if(had.has(i)||!R.solid.has(i))want.add(i)}
 for(const i of had)if(!want.has(i))R.solid.delete(i);for(const i of want)R.solid.add(i);R._rhS=want}
setInterval(rhSolidSync,500);
// ---- placing ----
{const _sb=startBuild;startBuild=function(k){const R=rbR();if(!R||k!=='house')return _sb(k);if((inv.house|0)<1)return;
  BUILD={k};closePanel();setActionLabels();say('Stand where the front door should go, facing up, and press PLACE. Press DONE to stop.')}}
{const _pb=placeBuild;placeBuild=function(){const R=rbR();if(!R||!BUILD||BUILD.k!=='house')return _pb();if((inv.house|0)<1){endBuild();return}
  const[x,y]=houseAnchor();if(!rhFits(R,x,y)){say('Not enough clear space for a house here.');sfx('swish');return}
  const h={id:Math.random().toString(36).slice(2,8),rg:R.region,x,y,w:7,furn:new Map(),hp:12};RH.push(h);inv.house--;rhSolidSync();P.y=Math.max(P.y,(y+1)*16+5);
  sfx('chop');setTimeout(()=>sfx('quest'),150);endBuild('Your new house on '+WORLD_REGIONS[R.region].name+' is ready! Walk in through the door.');saveLocal(true);saveCloud(true)}}
// ---- hitting: pack it up ----
function rhPack(h){const j=RH.indexOf(h);if(j<0)return;RH.splice(j,1);rhSolidSync();inv.house=(inv.house|0)+1;
 for(const f of h.furn.values()){inv[f.t]=(inv[f.t]|0)+1;if(f.items)for(const k in f.items)inv[k]=(inv[k]|0)+f.items[k]}if(HOMESP===h.id)HOMESP=null;
 say('You packed up your house and everything inside it.');setTimeout(()=>sfx('pickup'),90);saveLocal(true);saveCloud(true)}
{const _a=attack;attack=function(){const R=rbR();if(R&&!dead&&!menuOpen&&!pnOpen&&!BUILD&&swing<=0&&!FISH){const[x,y]=frontTile();
   const h=rhAt(rhHere(),x,y);if(h&&!(x===h.x&&y===h.y)){swing=.25;h.hp=(h.hp||12)-(1+TL.axe);sfx('chop');if(h.hp<=0)rhPack(h);else if(h.hp<=4)say('The house is about to come down...');return}
   const f=rhAt(rhForeign(R.region),x,y);if(f){notYours(f._owner);return}}return _a()}}
// ---- going in and coming out ----
{const _es=enterScene;enterScene=function(id,house,ret){const prev=SCENE&&SCENE.room&&SCENE.room.region?SCENE:null;_es(id,house,ret);if(prev&&SCENE)SCENE.prev=prev}}
{const _ls=leaveScene;leaveScene=function(){const S=SCENE;if(!S||!S.prev)return _ls();if(typeof BUILD!=='undefined'&&BUILD)endBuild();const r=S.ret;SCENE=S.prev;P.x=r.x;P.y=r.y;face=[0,1];FADE_AT=performance.now();sfx('door');rhSolidSync()}}
{const _u=upd;upd=function(dt){_u(dt);if(menuOpen||pnOpen||dead)return;const R=rbR();if(!R||face[1]>=0)return;
  for(const h of rhHere()){const cx=h.x*16+8;if(Math.abs(P.x-cx)<9&&P.y<(h.y+1)*16+6&&P.y>h.y*16-4){enterScene('home',h,{x:cx,y:(h.y+1)*16+7});return}}
  for(const h of rhForeign(R.region)){const cx=h.x*16+8;if(Math.abs(P.x-cx)<9&&P.y<(h.y+1)*16+6&&P.y>h.y*16-4){enterScene('home',h,{x:cx,y:(h.y+1)*16+7});return}}}}
// waking up in a house on another island
{const _rs=reset;reset=function(){_rs();const h=RH.find(o=>o.id===HOMESP);if(!h||dead)return;try{SCENE=null;const ok=loadRegion(h.rg,[h.x,h.y+1],{x:P.x,y:P.y});if(!ok)return;
  enterScene('home',h,{x:h.x*16+8,y:(h.y+1)*16+7});P.x=2*16+10;P.y=3*16+8;face=[0,1];say('You wake up at home on '+WORLD_REGIONS[h.rg].name+'.')}catch(e){console.warn(e)}}}
// ---- drawing ----
{const _rn=rgNear;rgNear=function(R,x0,y0,x1,y1){const out=_rn(R,x0,y0,x1,y1);if(!R||!R.region||!(SCENE&&SCENE.room===R))return out;
  for(const h of rhHere().concat(rhForeign(R.region)))if(h.x>=x0-5&&h.x<=x1+5&&h.y>=y0-3&&h.y<=y1+4)out.push({t:'_rh',h,x:h.x+.5,y:h.y},{t:'_rhs',h,x:h.x+.5,y:h.y+.02});return out}}
function rhSign(h){const nm=h._foreign?fname(h._owner):(MP.on?myName():pname());if(!nm)return;const cx=h.x*16+8,y=(h.y+1)*16-27;g.save();g.font='700 6px '+PF;const tw=Math.ceil(g.measureText(nm).width)+6,X=Math.round(cx-tw/2);
 g.fillStyle='#3a2414';g.fillRect(X-1,y-1,tw+2,10);g.fillStyle='#f4e8c8';g.fillRect(X,y,tw,8);g.fillStyle='#d8c098';g.fillRect(X,y+7,tw,1);g.fillStyle='#3a2414';g.textAlign='center';g.textBaseline='middle';g.fillText(nm,cx,y+4.5);g.restore()}
{const _df=drawFurn;drawFurn=function(it,tm){if(it&&it.t==='_rhs'){try{rhSign(it.h)}catch(e){}return}if(it&&it.t==='_rh'){try{drBld({...HOUSE_STYLE,w:7,tx:it.h.x-3,ty:it.h.y-1,castle:!!it.h.castle},tm)}catch(e){}return}return _df(it,tm)}}
// where it would go, while placing
{const _dh=drawHUD;drawHUD=function(){const R=rbR();if(R&&BUILD&&BUILD.k==='house'&&!dead&&!menuOpen){const[x,y]=houseAnchor(),ok=rhFits(R,x,y),cx=camX(),cy=camY();
   g.save();g.setTransform(Z,0,0,Z,-cx*Z,-cy*Z);g.globalAlpha=.55;try{drBld({...HOUSE_STYLE,w:7,tx:x-3,ty:y-1},performance.now()/1000)}catch(e){}g.globalAlpha=1;g.fillStyle=ok?'rgba(80,240,120,.3)':'rgba(240,60,60,.3)';g.fillRect((x-3)*16,(y-1)*16,112,32);g.restore()}_dh()}}
// ---- saving ----
{const _sn=snap;snap=function(){const s=_sn();if(RH.length)s.rh=RH.map(h=>({id:h.id,rg:h.rg,x:h.x,y:h.y,f:[...h.furn].map(([i,f])=>[i,f.t,f.items||null])}));
  if(SCENE&&SCENE.prev&&SCENE.prev.room&&SCENE.prev.room.region){const pr=SCENE.prev,R=pr.room;if(s.p&&pr.ret){s.p.x=Math.round(pr.ret.x);s.p.y=Math.round(pr.ret.y)}
   s.region={id:R.region,x:Math.max(0,Math.min(R.w-1,Math.floor(SCENE.ret.x/16))),y:Math.max(0,Math.min(R.h-1,Math.floor(SCENE.ret.y/16)))}}return s}}
{const _ap=applySave;applySave=function(S){RH.length=0;const keepHome=S&&S.home;_ap(S);const RW=14,RHt=10,items=o=>{const r={};if(o&&typeof o==='object')for(const k in o)if(INVK.includes(k))r[k]=Math.max(0,+o[k]||0);return r};
  if(S&&Array.isArray(S.rh))for(const e of S.rh){if(!e||!WORLD_REGIONS[e.rg]||!isFinite(e.x)||!isFinite(e.y))continue;const h={id:String(e.id||'').slice(0,12)||Math.random().toString(36).slice(2,8),rg:e.rg,x:e.x|0,y:e.y|0,w:7,furn:new Map(),hp:12};
   if(Array.isArray(e.f))for(const q of e.f){if(!Array.isArray(q))continue;const i=q[0]|0,t=q[1];if(i<2*RW||i>=RW*RHt||!BK.includes(t)||t==='house')continue;h.furn.set(i,t==='chest'?{t,items:items(q[2])}:{t})}RH.push(h)}
  if(keepHome&&RH.some(h=>h.id===keepHome))HOMESP=keepHome;try{rhSolidSync()}catch(e){}}}
{const _ng=newGame;newGame=function(){RH.length=0;_ng()}}
// shared: other players see where your island houses are
{const _rp=rbPub;rbPub=function(){const o=_rp()||{};if(RH.length)o._h=RH.map(h=>[h.rg,h.x,h.y,h.id,[...h.furn].map(([i,f])=>[i,f.t])]);return Object.keys(o).length?o:null}}
window.SQRH=RH;
