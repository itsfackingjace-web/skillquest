// ---- 111. Asset library: sprites and stats the developer edits in the Dev Suite, published from the database ----
// Published edits live at assets/live in the database (anyone can read them; only the developer's account can write).
// At startup the game applies the copy this device last downloaded (so edits show from the first frame), then fetches
// the latest copy and keeps it for the next load. Anything not in the library is drawn and set by the game's own code.
// Format: {v, at, icons:{itemKey:sprite}, worn:{itemKey:{h, f,b,s:sprite}},
//          stats:{items:{k:{n,pl,d,v}}, ib:{k:{n,hp}}, wb:{k:{n,hp,dmg,g0,g1}}}}
//   sprite: w x h pixels drawn at s x scale; p = palette "#rrggbb,..." ; d = one char per pixel ('.' = clear,
//   otherwise an index into p using PXC), or r = the same run-length packed ("A*12;" = 12 x "A").
//   pets: {petKind:{w,h,s,ox,oy,a,b}}: how a pet looks following you, a standing frame (a) and a walking frame (b) drawn
//   facing right (mirrored when it walks left); its pixels are drawn at s/2 world px each, top-left at (ox,oy) from the pet.
//   islands: {id:{n name, b description, lv, dir, w, h, t tiles (one hex digit per tile, packed), o objects (PXC index into
//   ISL_OBJ per tile, packed), lm [{k,x,y,v,n,tx,loot}] buildings/props/signs/loot chests (ISL_LM), pier n|e|s|w, mob (monsters like an existing island, or none), max, mx, my (world map)}}.
//   A custom island is a normal sailing region whose generator returns the painted map (with open water around it).
//   gear: {itemKey:{dmg,rng,blk,mp,rq}} how a weapon or armour piece works (see 111a2-s114-gear-rules.js).
//   worn: how a helmet / body / legs / weapon / shield looks on the character, one 96 x 112 layer per facing
//   (f front, b back, s side; left is side mirrored), drawn over the character. h = hide the game's own look for that slot.
var SQA=(()=>{
 const DBURL='https://skillquest-913e2-default-rtdb.firebaseio.com',LS='sq_assets_live',PXC='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-';
 const IB=window.SQIB||{},WB=window.SQWBT||{};
 const origIcon=iconURL;
 // the game's own values, captured before anything is applied, so edits can be undone and compared
 const ORIG={items:{},ib:{},wb:{}};
 const itemKeys=()=>[...new Set(INVK)].filter(k=>INAME[k]&&!/^xpb_/.test(k));
 const origItem=k=>ORIG.items[k]||(ORIG.items[k]={n:INAME[k],pl:SN[k],d:IDESC[k],v:SELLP[k]|0});
 for(const k of itemKeys())origItem(k);
 for(const k in IB)ORIG.ib[k]={n:IB[k].n,hp:IB[k].hp};
 for(const k in WB)ORIG.wb[k]={n:WB[k].n,hp:WB[k].hp,dmg:WB[k].dmg,g0:WB[k].gold[0],g1:WB[k].gold[1]};
 const TABLES={
  items:{name:'Items',fields:[['n','Name','text'],['pl','Plural','text'],['d','Description','long'],['v','Sell price','num']],keys:()=>itemKeys(),label:k=>origItem(k).n,orig:k=>origItem(k),
   set(k,o){INAME[k]=o.n;SN[k]=o.pl;IDESC[k]=o.d;SELLP[k]=o.v;SHORT[k]=String(o.n).toLowerCase();if(EQ[k]){EQ[k].n=o.n;EQ[k].v=o.v}}},
  ib:{name:'Island bosses',fields:[['n','Name','text'],['hp','HP','num']],keys:()=>Object.keys(IB),label:k=>ORIG.ib[k].n,orig:k=>ORIG.ib[k],set(k,o){IB[k].n=o.n;IB[k].hp=o.hp}},
  wb:{name:'World bosses',fields:[['n','Name','text'],['hp','HP','num'],['dmg','Damage per hit','num'],['g0','Gold (min)','num'],['g1','Gold (max)','num']],keys:()=>Object.keys(WB),label:k=>ORIG.wb[k].n,orig:k=>ORIG.wb[k],
   set(k,o){const T=WB[k];T.n=o.n;T.hp=o.hp;T.dmg=o.dmg;T.gold=[o.g0,Math.max(o.g0,o.g1)]}}};
 // a stat override only holds the fields that differ; fill the rest from the original, and keep types safe
 const merged=(t,k,o)=>{const base=TABLES[t].orig(k),r={...base};for(const[f,,ty]of TABLES[t].fields)if(o&&o[f]!=null){
   if(ty==='num'){const n=Number(o[f]);if(isFinite(n))r[f]=Math.max(0,Math.round(n))}else r[f]=String(o[f]).slice(0,ty==='long'?600:40)}return r};
 // ---- sprites ----
 const ICO={},cache={};let ver=0;
 // run-length packing for big, mostly empty layers
 const pack=d=>{let o='';for(let i=0;i<d.length;){let j=i;while(j<d.length&&d[j]===d[i])j++;const n=j-i;o+=n>3?d[i]+'*'+n+';':d[i].repeat(n);i=j}return o};
 const unpack=r=>{let o='';const re=/(.)(?:\*(\d+);)?/g;let m;while((m=re.exec(r))&&m[0])o+=m[2]?m[1].repeat(Math.min(+m[2],40000)):m[1];return o};
 const PIX=new WeakMap(),pix=sp=>{if(typeof sp.d==='string')return sp.d;if(typeof sp.r!=='string')return'';let d=PIX.get(sp);if(d==null){d=unpack(sp.r);PIX.set(sp,d)}return d};
 function render(sp){const c=document.createElement('canvas');c.width=sp.w*sp.s;c.height=sp.h*sp.s;const x=c.getContext('2d'),P=String(sp.p||'').split(','),d=pix(sp);
  for(let i=0;i<sp.w*sp.h;i++){const ch=d[i];if(!ch||ch==='.')continue;const col=P[PXC.indexOf(ch)];if(!col)continue;x.fillStyle=col;x.fillRect((i%sp.w)*sp.s,Math.floor(i/sp.w)*sp.s,sp.s,sp.s)}return c}
 const valid=sp=>sp&&sp.w>0&&sp.h>0&&sp.w<=160&&sp.h<=160&&sp.s>=1&&sp.s<=8&&pix(sp).length===sp.w*sp.h;
 iconURL=function(k,col){const sp=ICO[k];if(!sp)return origIcon(k,col);const key=k+'@'+ver;return cache[key]||(cache[key]=render(sp).toDataURL())};
 if(typeof eqIcon==='function'){const _ei=eqIcon;eqIcon=function(k){return ICO[k]?iconURL(k):_ei(k)}}
 // ---- worn looks: gear drawn on the character (you and other players) ----
 const WSLOTS=['legs','body','helm','off','main'],WDIR=['f','b','s'],WW=96,WH=112,WORN={},wcache=new Map();
 const wornKeys=()=>itemKeys().filter(k=>EQ[k]&&WSLOTS.includes(EQ[k].slot));
 const validWorn=w=>w&&typeof w==='object'&&WDIR.some(d=>w[d]&&w[d].w===WW&&w[d].h===WH&&w[d].s===1&&valid(w[d]));
 function wornCanvas(w,k,dir,fl){const key=k+'@'+ver+dir+(fl?1:0);let c=wcache.get(key);if(c!==undefined)return c;const sp=w[WDIR[dir]];c=null;
  if(sp&&valid(sp)){const r=render(sp);if(fl){c=document.createElement('canvas');c.width=WW;c.height=WH;const x=c.getContext('2d');x.translate(WW,0);x.scale(-1,1);x.drawImage(r,0,0)}else c=r}
  if(wcache.size>300)wcache.clear();wcache.set(key,c);return c}
 // draw a character's worn layers; same placement and walking bob as the character sprite (legs don't bob)
 function drawWorn(C,keys,dir,st,ox,oy,fl,lib){if(!keys||!keys.length)return;const src=lib||WORN;
  for(const sl of WSLOTS)for(const k of keys){if(!EQ[k]||EQ[k].slot!==sl||!src[k])continue;const c=lib?wornCanvasFrom(src[k],dir,fl):wornCanvas(src[k],k,dir,fl);if(!c)continue;
   C.drawImage(c,Math.round(ox)-24,Math.round(oy)-44+(st&&sl!=='legs'?-.5:0),48,56)}}
 const wornCanvasFrom=(w,dir,fl)=>{const sp=w[WDIR[dir]];if(!sp||!valid(sp))return null;const r=render(sp);if(!fl)return r;const c=document.createElement('canvas');c.width=WW;c.height=WH;const x=c.getContext('2d');x.translate(WW,0);x.scale(-1,1);x.drawImage(r,0,0);return c};
 // what you have on travels with your look (ch.wr) so other players' games draw it too
 const _gch=gearCH;gearCH=function(){const c=_gch();const wr=[];
  for(const sl of WSLOTS){let k=null;try{k=occ(sl)}catch(e){}if(!k||!WORN[k])continue;wr.push(k);
   if(WORN[k].h){if(sl==='helm'){c.ht=CH.ht;c.hcol=CH.hcol}else if(sl==='body')c.sh=CH.sh;else if(sl==='legs')c.pn=CH.pn}}
  if(wr.length)c.wr=wr;return c};
 const _cPw=cP;cP=function(ch,dir,st,ox,oy,fl){_cPw(ch,dir,st,ox,oy,fl);if(!ch||!ch.wr)return;const C=GC;if(!(C===g||C&&C.canvas&&C.canvas.hd2))return;
  try{drawWorn(C,Array.isArray(ch.wr)?ch.wr.slice(0,6):[],dir|0,st|0,ox,oy,!!fl)}catch(e){}};
 // ---- pet looks: replace how a pet is drawn following its owner (yours and other players') ----
 const PETL={},pcache=new Map();
 const validPet=L=>L&&L.w>0&&L.h>0&&L.w<=96&&L.h<=96&&L.s>=1&&L.s<=8&&isFinite(L.ox)&&isFinite(L.oy)&&['a','b'].some(f=>L[f]&&L[f].w===L.w&&L[f].h===L.h&&valid(L[f]));
 const petKinds=()=>[...new Set(INVK)].filter(k=>EQ[k]&&EQ[k].slot==='pet'&&EQ[k].pet&&EQ[k].pet!=='imp');
 function petCan(k,f){const L=PETL[k];if(!L)return null;const sp=L[f]&&valid(L[f])?L[f]:L.a&&valid(L.a)?L.a:L.b;const key=k+'@'+ver+f;let c=pcache.get(key);if(!c){c=render(sp);pcache.set(key,c)}return c}
 function drawPetLook(k,s,lib){const L=lib||PETL[k];if(!L||!s)return false;const mv=s.mv>0,f=mv&&Math.floor(s.t)%2?'b':'a';const c=lib?render(L[f]&&valid(L[f])?L[f]:L.a):petCan(k,f);if(!c)return false;
  const x=Math.round(s.x),y=Math.round(s.y),w=c.width/2,h=c.height/2;try{shd(x,y+6,Math.max(8,Math.min(18,w*.7)))}catch(e){}g.save();g.imageSmoothingEnabled=false;
  if(s.fl){g.translate(x*2,0);g.scale(-1,1)}g.drawImage(c,x+L.ox,y+L.oy,w,h);g.restore();return true}
 {const _pPL=pP;pP=function(tm){const C=window.LUX&&LUX.COS,k=C&&C.pet;if(!k||!PETL[k])return _pPL(tm);
   if(!dead&&!(typeof SAILING!=='undefined'&&SAILING)&&!(window.SQRSAIL&&SQRSAIL.on)&&typeof petFollow==='function')drawPetLook(k,petFollow('me',P.x,P.y,face));
   C.pet=null;try{return _pPL(tm)}finally{C.pet=k}}}
 if(window.LUX){const _dpp=LUX.drawPeerPet;LUX.drawPeerPet=(r,tm)=>{if(r&&PETL[r.pet]&&typeof petFollow==='function'){if(r.sl)return;drawPetLook(r.pet,petFollow(r.uid||'?',r.x,r.y,r.d===2?[r.fl?-1:1,0]:[0,r.d===1?-1:1]));return}return _dpp&&_dpp(r,tm)}}
 // the game's own look of a pet (for the editor to start from): drawn by the game onto its hidden screen canvas at 2x
 function capturePet(k){const cvs=g.canvas,OX=200,OY=Math.min(300,cvs.height-60),keep=PETL[k],id='__cap_'+k;delete PETL[k];
  try{if(!window.LUX||typeof petFollow!=='function')return null;const s=petFollow(id,0,0,[1,0]);s.fl=false;s.mv=0;
   g.save();g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cvs.width,cvs.height);g.setTransform(2,0,0,2,OX,OY);LUX.drawPeerPet({pet:k,x:0,y:0,d:2,fl:false,uid:id},0);g.restore();
   const W=Math.min(cvs.width,OX+140),H=Math.min(cvs.height,OY+100),d=g.getImageData(0,0,W,H).data;let x0=W,y0=H,x1=-1,y1=-1;
   for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>=128){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
   if(x1<x0)return null;x0-=x0%2?1:0;y0-=y0%2?1:0;const c=document.createElement('canvas');c.width=x1-x0+1+((x1-x0+1)%2);c.height=y1-y0+1+((y1-y0+1)%2);c.getContext('2d').drawImage(cvs,x0,y0,c.width,c.height,0,0,c.width,c.height);
   return{url:c.toDataURL(),ox:(x0-OX)/2-s.x,oy:(y0-OY)/2-s.y}}
  catch(e){console.warn(e);return null}finally{if(keep)PETL[k]=keep}}
 // ---- custom islands: painted in the Dev Suite, sailed to like any other island ----
 const ISL_TILES=[0,1,2,3,4,5,7,8,9,10,11,12,13,14,15],HEX='0123456789abcdef',ISL_PAD=8;
 const ISL_OBJ=['tree','tree:dark','tree:dead','pine','oak','willow','maple','yew','bush','nutbush','shroom','rock','rock:moss','ore','ore:crystal','cactus'];
 // buildings and props the game already draws (kind: [name, w, h, variant])
 const ISL_LM={sign:['Sign',1,1],chest:['Loot chest',1,1],tent:['Tent',2,1],firepit:['Campfire ring',1,1],crates:['Crates',1,1],cart:['Ore cart',1,1],bones:['Bones',2,1],
  ruinwall:['Ruined wall',1,1],'ruinwall:1':['Tall ruined wall',1,1,1],pillar:['Dark pillar',1,1],'pillar:moss':['Mossy pillar',1,1,'moss'],shrine:['Shrine',1,1],bwall:['Black wall',1,1],
  nmgrave:['Grave',1,1],nmshack:['Shack',4,2],'nmshack:1':['Shack (boarded)',4,2,1],nmsaloon:['Saloon',6,3],nmwater:['Water tower',2,2],nmmine:['Mine entrance',3,2],
  wtower:['Watchtower',2,2],btower:['Black tower',2,2],lighthouse:['Lighthouse',2,2],spire:['Crystal spire',2,2],vault:['Vault',3,2],observatory:['Observatory',4,3],temple:['Temple',7,4]};
 const ISL_DIR={n:'north',ne:'north-east',e:'east',se:'south-east',s:'south',sw:'south-west',w:'west',nw:'north-west'};
 const ISL_POS={n:[180,22],ne:[318,52],e:[338,180],se:[318,318],s:[180,342],sw:[44,330],w:[22,180],nw:[44,48]};
 const clean=(v,n)=>String(v==null?'':v).replace(/[<>&"]/g,'').slice(0,n);
 const islandValid=I=>I&&typeof I==='object'&&I.w>=20&&I.h>=20&&I.w<=220&&I.h<=220&&typeof I.t==='string'&&unpack(I.t).length===I.w*I.h&&(!I.o||unpack(I.o).length===I.w*I.h);
 const ISLC=new WeakMap(),islandGrid=I=>{let g=ISLC.get(I);if(!g){g={t:unpack(I.t),o:I.o?unpack(I.o):''};ISLC.set(I,g)}return g};
 function islandGen(I){return function*(D){const C=rgCtx(D),{W,T}=C,P=ISL_PAD,g=islandGrid(I);
   for(let y=0;y<I.h;y++)for(let x=0;x<I.w;x++){const v=HEX.indexOf(g.t[y*I.w+x]);T[(y+P)*W+x+P]=v>0&&v!==6?v:0}
   yield;rgDock(C,['n','e','s','w'].includes(I.pier)?I.pier:'e',1);yield;
   if(g.o)for(let y=0;y<I.h;y++)for(let x=0;x<I.w;x++){const ch=g.o[y*I.w+x];if(!ch||ch==='.')continue;const k=ISL_OBJ[PXC.indexOf(ch)];if(!k)continue;
    const i=(y+P)*W+x+P;if(C.keep[i]||!RG_WALK[T[i]])continue;const[t,v]=k.split(':');C.O[i]={t,hp:OHP[t]||3,v:v||undefined}}
   // buildings, props, signs and loot chests (they clear what's under them; blocked ground under them becomes paving)
   (Array.isArray(I.lm)?I.lm:Object.values(I.lm||{})).forEach((L,ci)=>{if(!L||!ISL_LM[L.k])return;const[,w,h,v]=ISL_LM[L.k],x=(L.x|0)+P,y=(L.y|0)+P;if(L.x<0||L.y<0||L.x+w>I.w||L.y+h>I.h)return;
    if(C.pier.concat([C.spawn,C.shore||C.spawn]).some(([px,py])=>px>=x-1&&px<=x+w&&py>=y-1&&py<=y+h))return;// never on (or right beside) the pier
    const ex={};if(v!==undefined)ex.v=v;if(L.k==='chest'){ex.use='loot';ex.ci=ci;ex.loot=L.loot||{};ex.name=clean(L.n,40)||'Chest'}else if(L.k==='sign'||L.tx){ex.use='look';ex.name=clean(L.n,40)||ISL_LM[L.k][0];ex.text=clean(L.tx,300)||ex.name}
    rgLm(C,L.k.split(':')[0],x,y,w,h,ex)});
   return rgFinish(C)}}
 const hashId=s=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h};
 const ISL={};// id -> the island data currently registered
 const here=()=>{try{return curRegion()}catch(e){return null}};
 function regIsland(id,I){if(here()===id)return;// never swap the island you are standing on
  const dir=ISL_DIR[I.dir]?I.dir:'e',mob=I.mob&&I.mob!==id&&typeof RG_MOBS!=='undefined'&&RG_MOBS[I.mob]?I.mob:null;
  WORLD_REGIONS[id]={id,name:clean(I.n,40)||'Unnamed Isle',width:I.w+ISL_PAD*2,height:I.h+ISL_PAD*2,seed:100.5+hashId(id)%9000,generationVersion:1,
   biome:clean(I.b,120)||'A newly charted island',lv:clean(I.lv,12)||'any',dir:ISL_DIR[dir],custom:true};
  if(!ROUTE_ORDER.includes(id))ROUTE_ORDER.push(id);
  REGION_SPAWNS[id]={maxEnemies:mob?Math.max(0,Math.min(30,I.max==null?20:I.max|0)):0};if(typeof RG_MOBS!=='undefined'){if(mob)RG_MOBS[id]=RG_MOBS[mob];else delete RG_MOBS[id]}
  RG_LMCOUNT[id]=0;const pos=ISL_POS[dir];WM_POS[id]=[isFinite(I.mx)?Math.max(10,Math.min(350,+I.mx)):pos[0],isFinite(I.my)?Math.max(10,Math.min(350,+I.my)):pos[1]];
  WM_ROUTE[id]={from:'Tidewatch',post:'tidewatch'};RG_GENS[id]=islandGen(I);RG_GEN[id]=D=>rgRunSync(RG_GENS[id](D));
  try{delete RG_CACHE[id];delete RG_PRE[id];delete RG_THUMB[id];if(ROOMS['reg_'+id])delete ROOMS['reg_'+id];const j=RG_ORDER.indexOf(id);if(j>=0)RG_ORDER.splice(j,1)}catch(e){}
  ISL[id]=I}
 function unregIsland(id){if(here()===id)return;const j=ROUTE_ORDER.indexOf(id);if(j>=0)ROUTE_ORDER.splice(j,1);delete RG_GEN[id];delete RG_GENS[id];
  try{delete RG_CACHE[id];delete RG_THUMB[id];if(ROOMS['reg_'+id])delete ROOMS['reg_'+id]}catch(e){}delete ISL[id]}// the name stays known, so old references still read well
 function applyIslands(L){const want={};for(const id of Object.keys(L||{}).sort())if(/^cu_[a-z0-9_]{1,30}$/.test(id)&&islandValid(L[id]))want[id]=L[id];
  for(const id in ISL)if(!want[id])unregIsland(id);for(const id in want)if(JSON.stringify(ISL[id])!==JSON.stringify(want[id]))regIsland(id,want[id])}
 // painted islands keep exactly what was placed (generated islands thin out trees and upgrade tiers at random)
 const _rpI=rgPrepare;rgPrepare=function(id){const R=_rpI(id);if(R&&WORLD_REGIONS[id]&&WORLD_REGIONS[id].custom)R._t64=1;return R};
 // loot chests: drawn with the game's chest; each player can take what's inside once (remembered in their save)
 const _dfI=drawFurn;drawFurn=function(it,tm){if(it&&it.t==='lm'&&it.k==='chest'){try{shd(it.x*16+8,it.y*16+15,14);hdPut(hdChestS(),it.x*16,it.y*16)}catch(e){}return}return _dfI(it,tm)};
 const _ufI=useFurn;useFurn=function(it){if(it&&it.use==='loot'){const id=here(),W=WORLD_STATE[id]=WORLD_STATE[id]||{},got=W.loot=W.loot||[];
   if(got.includes(it.ci)){say('The chest is empty. You already took what was inside.');msgT=4;sfx('swish');return}
   const parts=[];for(const k in it.loot||{}){const n=Math.max(0,Math.min(100000,it.loot[k]|0));if(!n)continue;if(k==='gold'){GLD+=n;parts.push(n+' gold')}else if(INAME[k]){inv[k]=(inv[k]|0)+n;parts.push(n+' '+(n>1?(SN[k]||INAME[k]):INAME[k]).toLowerCase())}}
   got.push(it.ci);say(parts.length?'You open the '+(it.name||'chest').toLowerCase()+': '+parts.join(', ')+'!':'The chest is empty.');msgT=6;try{sfx(parts.length?'coin':'swish');saveNow();svg()}catch(e){}return}
  return _ufI(it)};
 // custom islands are open as soon as they're published (no voyage needed)
 const _ro=routeOpen;routeOpen=function(id){const D=WORLD_REGIONS[id];if(D&&D.custom)return!!RG_GEN[id];return _ro(id)};
 // a save on an island that no longer exists comes back to Hollow Island
 const _asI=applySave;applySave=function(S){try{if(S&&S.region&&S.region.id&&S.region.id!=='hollow'&&!(WORLD_REGIONS[S.region.id]&&RG_GEN[S.region.id])&&/^cu_/.test(S.region.id)){
   S.region={id:'hollow'};setTimeout(()=>{try{say('The island you were on has gone from the charts. You are safe back on Hollow Island.');msgT=8}catch(e){}},600)}}catch(e){}return _asI.apply(this,arguments)};
 // ---- apply a whole library (undoing whatever was applied before) ----
 let applied={stats:{}};const HOOKS=[];// other sections (gear rules) apply their part of the library here
 function apply(lib){lib=lib||{};
  for(const t in applied.stats)for(const k in applied.stats[t])if(TABLES[t]&&TABLES[t].keys().includes(k))TABLES[t].set(k,TABLES[t].orig(k));
  for(const k in ICO)delete ICO[k];for(const k in WORN)delete WORN[k];ver++;wcache.clear();
  const icons=lib.icons||{};for(const k in icons)if(valid(icons[k]))ICO[k]=icons[k];
  try{applyIslands(lib.islands)}catch(e){console.warn('islands:',e)}
  for(const k in PETL)delete PETL[k];pcache.clear();const pets=lib.pets||{};for(const k in pets)if(k!=='imp'&&validPet(pets[k]))PETL[k]=pets[k];
  const worn=lib.worn||{};for(const k in worn)if(EQ[k]&&WSLOTS.includes(EQ[k].slot)&&validWorn(worn[k]))WORN[k]=worn[k];
  const st=lib.stats||{};for(const t in st){if(!TABLES[t])continue;for(const k in st[t]){if(!TABLES[t].keys().includes(k))continue;try{TABLES[t].set(k,merged(t,k,st[t][k]))}catch(e){}}}
  applied={stats:st};
  for(const f of HOOKS)try{f(lib)}catch(e){console.warn(e)}
  try{if(pnOpen)rPn()}catch(e){}}
 let live=null,preview=null;
 try{live=JSON.parse(localStorage.getItem(LS)||'null')}catch(e){}
 if(live)try{apply(live)}catch(e){console.error(e)}
 // latest published copy (no sign-in needed); used now and kept for the next load
 async function refresh(){try{const r=await fetch(DBURL+'/assets/live.json',{cache:'no-store'});if(!r.ok)return;const L=await r.json();
   if(JSON.stringify(L)===JSON.stringify(live))return;live=L;try{if(L)localStorage.setItem(LS,JSON.stringify(L));else localStorage.removeItem(LS)}catch(e){}
   if(!preview)apply(live)}catch(e){}}
 setTimeout(refresh,400);
 return{PXC,TABLES,ORIG,origIcon,render,valid,merged,itemKeys,refresh,pack,unpack,pix,WSLOTS,WDIR,WW,WH,wornKeys,validWorn,drawWorn,
  ISL_TILES,ISL_OBJ,ISL_LM,ISL_DIR,petKinds,validPet,drawPetLook,capturePet,ISL_PAD,islandValid,islandGen,get islands(){return ISL},
  get live(){return live},
  // a section that reads its own part of the library: called now with the current library and after every change
  onApply(f){HOOKS.push(f);try{f(preview||live||{})}catch(e){console.warn(e)}},
  // the Dev Suite can show unpublished edits in the developer's own game
  preview(lib){preview=lib||null;apply(preview||live)},get previewing(){return!!preview},
  setLive(L){live=L;try{if(L)localStorage.setItem(LS,JSON.stringify(L));else localStorage.removeItem(LS)}catch(e){}if(!preview)apply(live)}}})();
window.SQA=SQA;
