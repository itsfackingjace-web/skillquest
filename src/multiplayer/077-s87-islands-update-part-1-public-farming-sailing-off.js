// ---------------------------------------------------------------- 87. Islands update, part 1: public farming, sailing off the map, pier shops
// ---- Public farming ----
// Every tilled plot and crop belongs to everyone: anyone can till, plant, water and harvest any plot, on every island.
// Plots live in farm/<area>/<x_y> (shared, online) or in your save (offline). A plot stores {c: crop or '', g: growth
// banked at time t, w: watered until (ms), e: empty since (ms)}, so its growth can be worked out at any moment
// without anyone writing every frame: crops grow while their soil is wet, for everyone at the same pace.
// The old per-player plots (build/<uid>.f and ._f) are retired; your own old plots move into the shared fields once.
const SF={data:{},local:{},ready:false,unsub:null,lastRain:0};
const sfNow=()=>MP.on?mpNow():Date.now();
const sfOnline=()=>!!(MP.on&&MP.user&&SF.ready);
const sfArea=()=>{const R=SCENE&&SCENE.room;if(R&&R.region)return R.region;if(!SCENE)return'hollow';return null};
const sfK=(x,y)=>x+'_'+y,sfXY=k=>k.split('_').map(Number);
const sfStore=()=>sfOnline()?SF.data:SF.local;
const sfRecs=a=>sfStore()[a]||{};
function sfGrowth(r,now){if(!r||!r.c||!CROPS[r.c])return 0;const C=CROPS[r.c],max=C.max*C.st;let g=+r.g||0;const end=Math.min(now,+r.w||0);if(end>(+r.t||0))g+=(end-(+r.t||0))/1000;return Math.max(0,Math.min(max,g))}
function sfView(r,now){return{c:CROPS[r.c]?r.c:null,g:sfGrowth(r,now),w:CLK+Math.max(0,((+r.w||0)-now)/1000),e:Math.floor((+r.e||now)/1000)}}
const sfClean=r=>({c:String(r.c||'').slice(0,10),g:Math.round((+r.g||0)*10)/10,t:Math.round(+r.t||0),w:Math.round(+r.w||0),e:Math.round(+r.e||0)});
function sfWrite(area,k,r){const S=sfStore();if(!S[area])S[area]={};if(r)S[area][k]=sfClean(r);else delete S[area][k];
 if(sfOnline()){const ref=FB.db.ref(FB.D,'farm/'+(area==='hollow'?'hollow2':area)+'/'+k);(r?FB.db.set(ref,sfClean(r)):FB.db.remove(ref)).catch(e=>{try{mpErr(e)}catch(_){}})}else try{saveLocal(true)}catch(e){}}
// views: FARM (Hollow, by tile index) and rfMap(region) (by 'x,y') are rebuilt from the shared plots every frame,
// so all the existing farming, drawing and map code keeps working unchanged
function sfRebuild(){const now=sfNow(),S=sfStore();FARM.clear();const H=S.hollow||{};
 for(const k in H){const[x,y]=sfXY(k);if(!(x>0&&y>0&&x<N-1&&y<N-1))continue;const i=y*N+x;if(tile[i]===0)continue;FARM.set(i,sfView(H[k],now));if(obj[i])obj[i]=null}
 for(const id in WORLD_REGIONS){if(id==='hollow')continue;const M=rfMap(id);M.clear();const A=S[id]||{};for(const k in A){const[x,y]=sfXY(k);M.set(rbK(x,y),sfView(A[k],now))}}}
// what changed under your hands (till, plant, water, harvest, fill in): compare the plots around you before and after
function sfAround(){const area=sfArea();if(!area)return null;const px=Math.floor(P.x/16),py=Math.floor(P.y/16),m=new Map();
 for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const x=px+dx,y=py+dy,p=area==='hollow'?FARM.get(y*N+x):rfMap(area).get(rbK(x,y));m.set(sfK(x,y),p?{c:p.c,w:p.w,g:p.g,p}:null)}return{area,m}}
function sfCommit(before){if(!before)return;const area=before.area,now=sfNow(),A=sfRecs(area);
 for(const[k,b]of before.m){const[x,y]=sfXY(k),p=area==='hollow'?FARM.get(y*N+x):rfMap(area).get(rbK(x,y));
  if(!b&&p){sfWrite(area,k,{c:p.c||'',g:0,t:now,w:0,e:p.c?0:now});continue}
  if(b&&!p){sfWrite(area,k,null);continue}
  if(!b||!p)continue;const old=A[k]||{};
  if((b.c||null)!==(p.c||null)){if(!p.c)sfWrite(area,k,{c:'',g:0,t:now,w:0,e:now});else{const ww=Math.max(+old.w||0,p.w>CLK?now+(p.w-CLK)*1000:0);sfWrite(area,k,{c:p.c,g:0,t:now,w:ww,e:0})}continue}
  if(p.w!==b.w&&p.w>CLK){sfWrite(area,k,{c:p.c||'',g:sfGrowth(old,now),t:now,w:now+(p.w-CLK)*1000,e:p.c?0:(+old.e||now)})}}}
{const _a=attack;attack=function(){const b=sfAround();_a();try{sfCommit(b)}catch(e){console.warn(e)}}}
{const _p=placeBuild;placeBuild=function(){const b=BUILD&&isSeed(BUILD.k)?sfAround():null;_p();if(b)try{sfCommit(b)}catch(e){console.warn(e)}}}
{const _u=upd;upd=function(dt){_u(dt);try{sfRebuild()}catch(e){}}}
// nobody owns a plot any more: other players' old personal plots are no longer shown, and yours aren't published
rfForeign=function(){return new Map()};
{const _rp=rbPub;rbPub=function(){const o=_rp();if(o&&o._f)delete o._f;return o&&Object.keys(o).length?o:null}}
// empty soil turns back into grass after 10 minutes, and rain waters every crop on the island you're on
setInterval(()=>{const now=sfNow(),S=sfStore();
 for(const a in S)for(const k in S[a]){const r=S[a][k];if(!r.c&&now-(+r.e||now)>TILL_LIFE*1000)sfWrite(a,k,null)}
 const area=sfArea();if(!area||!rainingNow()||dark()>.95)return;let bm='grass';try{bm=biomeHere()}catch(e){}if(bm==='desert'||bm==='in')return;
 const A=S[area]||{};for(const k in A){const r=A[k];if(r.c&&(+r.w||0)-now<60000)sfWrite(area,k,{c:r.c,g:sfGrowth(r,now),t:now,w:now+WATER_FOR*1000,e:0})}},5000);
// online: the shared fields, plus moving your old plots in
function sfStart(){const d=FB.db;SF.unsub=d.onValue(d.ref(FB.D,'farm'),s=>{const v=Object.assign({},s.val()||{});const oldH=v.hollow;v.hollow=v.hollow2||{};delete v.hollow2;try{sfMigrateHollow(oldH,v.hollow)}catch(e){console.warn(e)}SF.data={};for(const a in v){if(!WORLD_REGIONS[a]||!v[a]||typeof v[a]!=='object')continue;SF.data[a]={};
   for(const k in v[a]){const r=v[a][k];if(r&&typeof r==='object'&&/^\d+_\d+$/.test(k))SF.data[a][k]=r}}
  const first=!SF.ready;SF.ready=true;
  if(first){let moved=0;for(const a in SF.local)for(const k in SF.local[a]){if(SF.data[a]&&SF.data[a][k])continue;sfWrite(a,k,SF.local[a][k]);moved++}SF.local={};if(moved)try{saveLocal(true)}catch(e){}}});
 MP.unsub.push(()=>{if(SF.unsub)SF.unsub();SF.unsub=null;SF.ready=false;SF.data={}})}
{const _ms=mpStart;mpStart=async function(u){await _ms(u);if(MP.on&&!SF.unsub)try{sfStart()}catch(e){mpErr(e)}}}
// saves: the offline fields; old saves' own plots become shared plots
{const _sn=snap;snap=function(){const s=_sn();s.sf=SF.local;delete s.farm;delete s.rfarm;return s}}
{const _ap=applySave;applySave=function(S){_ap(S);SF.local={};const now=Date.now();
  if(S&&S.sf&&typeof S.sf==='object'){for(const a in S.sf){if(!WORLD_REGIONS[a]||typeof S.sf[a]!=='object')continue;SF.local[a]={};for(const k in S.sf[a])if(/^\d+_\d+$/.test(k))SF.local[a][k]=sfClean(S.sf[a][k])}}
  else{const conv=(a,x,y,c,g,w)=>{(SF.local[a]||(SF.local[a]={}))[sfK(x,y)]={c:CROPS[c]?c:'',g:+g||0,t:now,w:w>CLK?now+(w-CLK)*1000:0,e:CROPS[c]?0:now}};
   if(Array.isArray(S&&S.farm))for(const e of S.farm)if(Array.isArray(e)){const i=e[0]|0;conv('hollow',i%N,(i/N)|0,e[1],e[2],+e[3]||0)}
   if(S&&S.rfarm&&typeof S.rfarm==='object')for(const a in S.rfarm)if(WORLD_REGIONS[a]&&Array.isArray(S.rfarm[a]))for(const e of S.rfarm[a])if(Array.isArray(e))conv(a,e[0]|0,e[1]|0,e[2],e[3],+e[4]||0)}
  try{sfRebuild()}catch(e){}}}
{const _ng=newGame;newGame=function(){SF.local={};_ng()}}
window.SQSF=SF;window.SQSFR=sfRebuild;

// ---- Sail off the edge of the map to an island you've unlocked ----
// Briarwood lies west of Hollow Island, Ashfall east, Ironcrest north and the Shattered Expanse south. Once a sea route
// is charted, sail your boat into that edge of Hollow's map and you cross over, arriving in your boat at the edge of
// the island that faces Hollow; sail back off that edge to come home. (Harbor posts still work too.)
const EDGE={msgAt:0};const OPP={north:'south',south:'north',east:'west',west:'east'};
const edgeRegion=side=>ROUTE_ORDER.find(id=>id!=='hollow'&&WORLD_REGIONS[id].dir===side);
function edgePush(Wt,Ht){const ix=jx+(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0),iy=jy+(K.s||K.arrowdown?1:0)-(K.w||K.arrowup?1:0),m=26;
 if(P.x<m&&ix<-.3)return'west';if(P.x>Wt*16-m&&ix>.3)return'east';if(P.y<m+4&&iy<-.3)return'north';if(P.y>Ht*16-m&&iy>.3)return'south';return null}
function edgeMsg(t){const n=performance.now();if(n-EDGE.msgAt>2500){EDGE.msgAt=n;say(t);msgT=4}}
function edgeGo(to,side,frac){if(TRAVEL49||dead)return;TRAVEL49={t:0,dur:1.3,to,done:false,job:to!=='hollow'&&!RG_CACHE[to]?rgJob(to):null,hold:0,edge:{side,frac}};sfx('splash')}
{const _u=upd;upd=function(dt){_u(dt);if(TRAVEL49||dead||menuOpen||pnOpen)return;
  if(!SCENE&&SAILING){const side=edgePush(N,N);if(!side)return;const id=edgeRegion(side);if(!id)return;
   if(!routeOpen(id)){edgeMsg('The open sea to the '+side+' leads to '+WORLD_REGIONS[id].name+', but the route isn\'t charted yet. Ask Sera, the Navigator in Tidewatch.');return}
   edgeGo(id,side,side==='west'||side==='east'?P.y/(N*16):P.x/(N*16));return}
  const R=rbR();if(R&&RSAIL.on){const side=edgePush(R.w,R.h);if(!side)return;const nb=window.SQNEIGH&&SQNEIGH[R.region]&&SQNEIGH[R.region][side];
   if(nb){if(!routeOpen(nb)){edgeMsg('The open sea to the '+side+' leads to '+WORLD_REGIONS[nb].name+', but the route isn\'t charted yet.');return}edgeGo(nb,side,side==='west'||side==='east'?P.y/(R.h*16):P.x/(R.w*16));return}
   if(R.region==='nomans'){edgeMsg('Open sea. Briarwood Isle lies north, the Shattered Expanse east. Hollow Island is a long way north-east: sail from the pier.');return}
   const home=OPP[WORLD_REGIONS[R.region].dir];
   if(side!==home){edgeMsg('Open sea. Hollow Island lies to the '+home+'.');return}
   edgeGo('hollow',WORLD_REGIONS[R.region].dir,side==='west'||side==='east'?P.y/(R.h*16):P.x/(R.w*16))}}}
// find open water along an edge, as close as possible to where you crossed
function edgeSpot(Wt,Ht,side,frac,ok){const along=side==='west'||side==='east'?Ht:Wt,c=Math.round(frac*along);
 for(let d=0;d<along;d++)for(const s of[1,-1]){const a=c+s*d;if(a<2||a>=along-2)continue;for(let inset=2;inset<10;inset++){const x=side==='west'?inset:side==='east'?Wt-1-inset:a,y=side==='north'?inset:side==='south'?Ht-1-inset:a;
   const px=x*16+8,py=y*16+6;if(ok(px,py))return[px,py]}}return null}
{const _tc=travelCommit;travelCommit=function(T){const E=T.edge;if(!E)return _tc(T);
  const tw=HARBOR_POSTS.find(p=>p.id==='tidewatch')||HARBOR_POSTS[0];
  const fromR=curRegion();if(T.to!=='hollow'&&fromR==='hollow'){P.x=tw.x*16+8;P.y=tw.y*16+8;SAILING=false}   // if you later sail home from the pier, you land at Tidewatch
  _tc(T);
  if(T.to!=='hollow'){const R=rbR();if(!R)return;const side=OPP[E.side],sp=edgeSpot(R.w,R.h,side,E.frac,(x,y)=>rsBoatOK(R,x,y));
   if(sp){P.x=sp[0];P.y=sp[1];RSAIL.on=true;RSAIL.lx=(R.dock[0])*16+8;RSAIL.ly=(R.dock[1]-1)*16+8;face=side==='west'?[1,0]:side==='east'?[-1,0]:side==='north'?[0,1]:[0,-1]}
   say('You sail into '+WORLD_REGIONS[T.to].name+'.'+(fromR==='hollow'?' Sail back off the '+side+' edge to go home.':''));msgT=4}
  else if(!SCENE){const side=E.side,sp=edgeSpot(N,N,side,E.frac,(x,y)=>boatOK(x,y));
   if(sp){P.x=sp[0];P.y=sp[1];SAILING=true;face=side==='west'?[1,0]:side==='east'?[-1,0]:side==='north'?[0,1]:[0,-1]}say('Home waters: Hollow Island.');msgT=3}
  try{saveNow()}catch(e){}}}

// ---- A small trading post at every island's pier: sell what you gather there ----
{const _rh=routesHTML;routesHTML=function(){let h=_rh();if(curRegion()==='hollow')return h;
  h+='<div class="tl" style="margin-top:12px">Pier trader</div><div class="qc"><p>"Fish, logs, ore, pelts... I\'ll buy anything you can carry back to the ship."</p><small>Gold: '+GLD+'</small></div>';let any=0;
  for(const k in SELLP){const n=inv[k]|0;if(n<=0||(typeof EQK!=='undefined'&&EQK.includes(k)&&!(inv[k]>0)))continue;any=1;h+='<button class="sb" data-a="s'+k+'">Sell all '+(SN[k]||INAME[k]||k)+' ('+n+')<br><small>+'+n*SELLP[k]+' gold</small></button>'}
  if(!any)h+='<div class="tl" style="font-weight:400;opacity:.6">Nothing to sell</div>';return h}}

// ---- ✕ on a controller opens chests (and beds, stations) you built on the other islands ----
{const _pu=window.SQPADUSE;window.SQPADUSE=()=>{if(_pu&&_pu())return true;try{const R=rbR();if(!R)return false;
  for(const[dx,dy]of[[0,0],[face[0],face[1]],[0,1],[0,-1],[1,0],[-1,0]]){const x=Math.floor(P.x/16)+dx,y=Math.floor((P.y+(face[1]>0?4:0))/16)+dy,s=rbMap(R.region).get(rbK(x,y));if(s&&(s.t==='chest'||s.t==='bed'||STN.has(s.t)))return true}
  const f=rbFront(R);return!!(f&&f.s&&(f.s.t==='chest'||f.s.t==='bed'))}catch(e){return false}}}

// ---- Castles (a rare drop from the Stone Giant) ----
// A castle goes down like a house (same footprint, on any island) and works like one: walk in, decorate, sleep, pack it
// up with HIT. Inside is a great hall. Two torches burn by the gate, and like a big campfire it keeps monsters away and
// heals you, in a much wider circle. Other players see it (and its aura works for them too).
const CASTLE_W=22,CASTLE_H=14;
BK.push('castle');BHP.castle=20;INVK.push('castle');INAME.castle='Castle';SELLP.castle=4000;SN.castle='Castles';if(typeof SHORT!=='undefined')SHORT.castle='castle';
IDESC.castle='A royal castle! Place it like a house, on any island: inside is a great hall to decorate. Its torches keep monsters away and heal you, like a giant campfire.';
if(typeof EXTRA_BAG!=='undefined')EXTRA_BAG.push('castle');
// the gate is in the middle of the 22-wide hall: ex 10.5 puts you (and the way out) on the centre line between tiles 10
// and 11; the width stays 22 because furniture is saved by tile number (y*w+x)
ROOMS.castle={w:CASTLE_W,h:CASTLE_H,ex:10.5,castle:1,floor:['#8a8478','#7e786c'],wall:'#9a9284',trim:'#4a443c',items:[
 {t:'c_banner',x:3,y:0},{t:'c_torch',x:6,y:0},{t:'c_window',x:9,y:0},{t:'c_window',x:12,y:0},{t:'c_torch',x:15,y:0},{t:'c_banner',x:18,y:0},
 {t:'c_pillar',x:4,y:4,sh:1,solid:1},{t:'c_pillar',x:17,y:4,sh:1,solid:1},{t:'c_pillar',x:4,y:9,sh:1,solid:1},{t:'c_pillar',x:17,y:9,sh:1,solid:1},
 {t:'c_throne',x:10,y:2,w:2,solid:1}],solid:new Set()};
{const R=ROOMS.castle;for(const it of R.items)if(it.solid)for(let dy=0;dy<(it.sh||1);dy++)for(let dx=0;dx<(it.w||1);dx++)R.solid.add((it.y+dy)*R.w+it.x+dx)}
// going in: the castle hall instead of the house room (it is still "home", so furniture and beds work the same)
{const _es=enterScene;enterScene=function(id,house,ret){if(id==='home'&&house&&house.castle){_es('castle',house,ret);if(SCENE&&SCENE.room===ROOMS.castle)SCENE.id='home';return}return _es(id,house,ret)}}
{const _cp=canPlaceIn;canPlaceIn=function(x,y){const R=SCENE&&SCENE.room;if(R&&R.castle&&(R.solid.has(y*R.w+x)||(y>=R.h-1&&Math.abs(x+.5-(R.ex+.5))<1.01)))return false;return _cp(x,y)}}
// placing
const castleIn=()=>{const R=rbR();return R?rhHere().concat(rhForeign(R.region)):(!SCENE?HOUSES:[])};
{const _sb=startBuild;startBuild=function(k){if(k!=='castle')return _sb(k);if((inv.castle|0)<1)return;if(SCENE&&!rbR()){say('Go outside to build.');closePanel();return}
  BUILD={k};closePanel();setActionLabels();say('Stand where the castle gate should go, facing up, and press PLACE. Press DONE to stop.')}}
{const _pb=placeBuild;placeBuild=function(){if(!BUILD||BUILD.k!=='castle')return _pb();if((inv.castle|0)<1){endBuild();return}const R=rbR(),[x,y]=houseAnchor();
  if(R){if(!rhFits(R,x,y)){say('Not enough clear space for a castle here.');sfx('swish');return}
   const h={id:Math.random().toString(36).slice(2,8),rg:R.region,x,y,w:7,furn:new Map(),hp:24,castle:1};RH.push(h);rhSolidSync()}
  else{if(SCENE){say('You can only build outside.');return}if(!houseFits()){say(inVillage(x,y)?'You can\'t build inside the village.':'Not enough clear space for a castle here.');sfx('swish');return}
   const h={id:Math.random().toString(36).slice(2,8),x,y,w:7,furn:new Map(),hp:24,castle:1};HOUSES.push(h);addHouseBS(h)}
  inv.castle--;P.y=Math.max(P.y,(y+1)*16+5);sfx('mine');setTimeout(()=>sfx('quest'),150);endBuild('Your castle stands! Walk in through the gate.');saveLocal(true);saveCloud(true)}}
{const _cp=canPlace;canPlace=function(x,y){if(BUILD&&BUILD.k==='castle'){const R=rbR();return R?rhFits(R,...houseAnchor()):houseFits()}return _cp(x,y)}}
// packing a castle gives the castle back (not a house)
{const _hh=hitHouse;hitHouse=function(h){if(!h||!h.castle)return _hh(h);const n0=inv.house|0;_hh(h);if((inv.house|0)>n0){inv.house=n0;inv.castle=(inv.castle|0)+1;say('You packed up your castle and everything inside it.')}}}
rhPack=(_rp=>function(h){if(!h||!h.castle)return _rp(h);const n0=inv.house|0;_rp(h);if((inv.house|0)>n0){inv.house=n0;inv.castle=(inv.castle|0)+1;say('You packed up your castle and everything inside it.')}})(rhPack);
// shared with other players: the castle flag rides along with the house
{const _md=myHousesData;myHousesData=function(){const a=_md();for(const e of a){const h=HOUSES.find(o=>!o._foreign&&o.id===e.id);if(h&&h.castle)e.c=1}return a}}
{const _bf=buildForeign;buildForeign=function(owner,e){const h=_bf(owner,e);if(e&&e.c){h.castle=1;const arr=v=>Array.isArray(v)?v:(v&&typeof v==='object'?Object.values(v):null),fl=arr(e.f);h.furn=new Map();
   if(fl)for(const q0 of fl){const q=arr(q0);if(!q)continue;const i=q[0]|0,t=q[1];if(i<2*CASTLE_W||i>=CASTLE_W*CASTLE_H||!BK.includes(t)||t==='house'||t==='castle')continue;h.furn.set(i,t==='chest'?{t,items:{}}:{t})}}return h}}
{const _rp=rbPub;rbPub=function(){const o=_rp();if(o&&Array.isArray(o._h))for(const e of o._h){const h=RH.find(q=>q.id===e[3]);if(h&&h.castle)e[5]=1}return o}}
rhForeign=(_rf=>function(id){const out=_rf(id);try{for(const o in BLDS.data){const L=BLDS.data[o]&&BLDS.data[o].r&&BLDS.data[o].r._h;if(!L)continue;for(const e0 of(Array.isArray(L)?L:Object.values(L))){const e=Array.isArray(e0)?e0:Object.values(e0||{});
   if(e[0]!==id||!e[5])continue;const h=out.find(q=>q._owner===o&&q.x===(e[1]|0)&&q.y===(e[2]|0));if(h&&!h.castle){const fresh=buildForeign(o,{id:e[3],x:e[1],y:e[2],w:7,f:e[4],c:1});h.castle=1;h.furn=fresh.furn}}}}catch(err){}return out})(rhForeign);
// saving your castles
{const _sn=snap;snap=function(){const s=_sn();if(Array.isArray(s.houses))for(const e of s.houses){const h=HOUSES.find(o=>o.id===e.id);if(h&&h.castle)e.c=1}
  if(Array.isArray(s.rh))for(const e of s.rh){const h=RH.find(o=>o.id===e.id);if(h&&h.castle)e.c=1}return s}}
{const _ap=applySave;applySave=function(S){_ap(S);const items=o=>{const r={};if(o&&typeof o==='object')for(const k in o)if(INVK.includes(k))r[k]=Math.max(0,+o[k]||0);return r},
   fill=(h,f)=>{h.castle=1;h.hp=24;h.furn=new Map();if(Array.isArray(f))for(const q of f){if(!Array.isArray(q))continue;const i=q[0]|0,t=q[1];if(i<2*CASTLE_W||i>=CASTLE_W*CASTLE_H||!BK.includes(t)||t==='house'||t==='castle')continue;h.furn.set(i,t==='chest'?{t,items:items(q[2])}:{t})}};
  if(S&&Array.isArray(S.houses))for(const e of S.houses){if(!e||!e.c)continue;const h=HOUSES.find(o=>!o._foreign&&o.id===String(e.id).slice(0,12));if(h)fill(h,e.f)}
  if(S&&Array.isArray(S.rh))for(const e of S.rh){if(!e||!e.c)continue;const h=RH.find(o=>o.id===String(e.id||'').slice(0,12));if(h)fill(h,e.f)}}}
// the aura: monsters keep away and you heal, like a campfire but in a much wider circle
const CASTLE_R=2.6;
function castlesHere(){try{return castleIn().filter(h=>h.castle)}catch(e){return[]}}
{const _nf=nearFire;nearFire=function(x,y,r){if(_nf(x,y,r))return true;if(SCENE&&!rbR())return false;for(const h of castlesHere()){const cx=h.x*16+8,cy=h.y*16;if(Math.hypot(cx-x,cy-y)<r*CASTLE_R)return true}return false}}
window.SQCASTLE={castlesHere,ROOM:ROOMS.castle};

