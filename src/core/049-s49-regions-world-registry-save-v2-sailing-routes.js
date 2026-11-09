// ---------------------------------------------------------------- 49. Regions: world registry, save v2, sailing routes
// Hollow Island is untouched: its generator, data and save fields stay exactly as they were. New lands are
// separate regions, each a large outdoor scene with its own deterministic terrain, reached by sea routes from
// the harbor post on the Tidewatch pier. The four regions themselves are generated in section 50.
// --- registries ---
const SAVE_VERSION=2;
const WORLD_REGIONS={
 hollow:{id:'hollow',name:'Hollow Island',width:N,height:N,seed:SEED,legacy:true,generationVersion:1,biome:'Meadows, snowy peaks, desert and coast'},
 briarwood:{id:'briarwood',name:'Briarwood Isle',width:160,height:160,seed:812.4,generationVersion:1,biome:'Dense forest, lakes and overgrown ruins',lv:'15–35',dir:'west',unlock:'briarwoodRoute',hint:'A captain in Tidewatch will chart this route one day.'},
 ashfall:{id:'ashfall',name:'Ashfall Coast',width:180,height:140,seed:933.2,generationVersion:1,biome:'Black sand, lava fields and scorched woods',lv:'30–50',dir:'east',unlock:'ashfallRoute',hint:'Needs a reinforced hull and a charted route.'},
 ironcrest:{id:'ironcrest',name:'Ironcrest Highlands',width:160,height:180,seed:1247.8,generationVersion:1,biome:'Mountain walls, snowy passes and alpine woods',lv:'45–70',dir:'north',unlock:'mountainPassage',hint:'The sea cliffs here need a mountain passage.'},
 shattered:{id:'shattered',name:'Shattered Expanse',width:200,height:180,seed:1703.6,generationVersion:1,biome:'Broken islands, dark woods and crystal',lv:'65–90',dir:'south',unlock:'shatteredRoute',hint:'Only a deepwater sail can cross to it.'}};
const ROUTE_ORDER=['hollow','briarwood','ashfall','ironcrest','shattered'];
const REGION_SPAWNS={hollow:{maxEnemies:20},briarwood:{maxEnemies:24},ashfall:{maxEnemies:26},ironcrest:{maxEnemies:28},shattered:{maxEnemies:30}};
// route requirements (quests, boat upgrades) arrive with the sailing update; until then every charted region is open
const ROUTE_GATES=false;
const TRAVEL_KEYS=['briarwoodRoute','reinforcedHull','ashfallRoute','mountainPassage','deepwaterSail','shatteredRoute'];
let WORLD_STATE={hollow:{}},UNLOCKED_REGIONS=['hollow'],TRAVEL_UNLOCKS=Object.fromEntries(TRAVEL_KEYS.map(k=>[k,false])),SAVE_EXTRA={},SAVE_LOCK=false,TRAVEL49=null;
function curRegion(){const R=SCENE&&SCENE.room;return R&&R.region||'hollow'}
const regionOf=o=>o&&(o.regionId||o.region)||'hollow';   // legacy objectives and places default to Hollow
// towns and dungeons keep their real coordinates; they just learn which region they belong to
const TOWN_REG=[{id:'hollow_village',name:'Hollow Village',regionId:'hollow',x:VX,y:VY,on:true},{id:'saltmere',name:'Saltmere',regionId:'hollow',x:TX,y:TY,on:true},
 {id:'frosthollow',name:'Frosthollow',regionId:'hollow',x:FX,y:FY,on:FHON},{id:'dusthaven',name:'Dusthaven',regionId:'hollow',x:DX,y:DY,on:DHON},{id:'tidewatch',name:'Tidewatch',regionId:'hollow',x:WX,y:WY,on:TWON}];
const DUNGEON_REG=[{id:'slime_caverns',name:'Slime Caverns',regionId:'hollow',at:CAVE},{id:'sunken_tomb',name:'Sunken Tomb',regionId:'hollow',at:TOMB},
 {id:'frostfang_den',name:'Frostfang Den',regionId:'hollow',at:FHDEN},{id:'scorpion_hollow',name:'Scorpion Hollow',regionId:'hollow',at:DHRUIN},{id:'drowned_grotto',name:'Drowned Grotto',regionId:'hollow',at:GRDEN}]
 .map(d=>({id:d.id,name:d.name,regionId:d.regionId,x:d.at?d.at.x:-1,y:d.at?d.at.y:-1,on:!!d.at}));
for(const t of EXTRA_TOWNS)if(!t.regionId)t.regionId='hollow';
for(const k in EXTRA_DUNGEONS)if(!EXTRA_DUNGEONS[k].regionId)EXTRA_DUNGEONS[k].regionId='hollow';
const SQ_REGION={};for(const t in SQ_SIDE)SQ_REGION[t]='hollow';

// --- save v2: migration ---
// v stays 1 so every older build still reads the save; sv is the schema version. s.p is always a Hollow position
// (inside another region it is the pier you sailed from), so an older build simply puts you back on the pier.
function migrateSave(S){
 if(!S||typeof S!=='object'||Array.isArray(S))throw new Error('not a save');
 const sv=S.sv===undefined?1:+S.sv;if(!(sv>=1)||!isFinite(sv)){throw new Error('bad save version')}
 if(sv>SAVE_VERSION){const e=new Error('save from a newer version');e.future=sv;throw e}
 const M=JSON.parse(JSON.stringify(S));
 if(M.p&&typeof M.p==='object'){const x=+M.p.x,y=+M.p.y;if(!(isFinite(x)&&isFinite(y)&&x>=0&&y>=0&&x<N*16&&y<N*16)){M.p.x=SPX;M.p.y=SPY}
  if(M.p.f!==undefined&&!(Array.isArray(M.p.f)&&M.p.f.length===2&&M.p.f.every(v=>v===-1||v===0||v===1)&&(M.p.f[0]||M.p.f[1])))delete M.p.f}
 let r=M.region;if(!r||typeof r!=='object'||!WORLD_REGIONS[r.id]||!(RG_GEN[r.id]||r.id==='hollow'))r={id:'hollow'};
 if(r.id==='hollow')r={id:'hollow'};else{const D=WORLD_REGIONS[r.id],x=Math.floor(+r.x),y=Math.floor(+r.y);r={id:r.id};if(x>=0&&y>=0&&x<D.width&&y<D.height){r.x=x;r.y=y}}
 M.region=r;
 const ws=M.worldState&&typeof M.worldState==='object'&&!Array.isArray(M.worldState)?M.worldState:{};if(!ws.hollow||typeof ws.hollow!=='object')ws.hollow={};M.worldState=ws;
 const ur=Array.isArray(M.unlockedRegions)?M.unlockedRegions.filter((id,i,a)=>typeof id==='string'&&id!=='testcove'&&a.indexOf(id)===i):[];if(!ur.includes('hollow'))ur.unshift('hollow');M.unlockedRegions=ur;
 const tu=M.travelUnlocks&&typeof M.travelUnlocks==='object'?M.travelUnlocks:{};for(const k of TRAVEL_KEYS)tu[k]=!!tu[k];M.travelUnlocks=tu;
 M.sv=SAVE_VERSION;return M}
// keys this build reads or writes; anything else in a save (from an older or newer build) is carried along untouched
const KNOWN49=new Set(('v sv ch xp tl gold arm q inv p hunger time kills fires rm clk mute savedAt wid dev qv chess name str bsp houses home cave farm dl jobs gmd tomb plant wreck sail cls wand mp offh dun rare perks phx sideQuests xdun qdone qhold region worldState unlockedRegions travelUnlocks').split(' '));
let KNOWN49_FULL=false;
// a copy of the original save is kept before it is first migrated
const PRE_V2='sq_save_pre_v2';
function backupPre(S,key){try{if(localStorage.getItem(key)===null)localStorage.setItem(key,typeof S==='string'?S:JSON.stringify(S))}catch(e){}}
try{const raw=localStorage.getItem(LS);if(raw){const b=JSON.parse(raw);if(b&&typeof b==='object'&&!(+b.sv>=2))backupPre(raw,PRE_V2)}}catch(e){}
const _ap49=applySave;applySave=function(S){
 if(!KNOWN49_FULL){KNOWN49_FULL=true;try{for(const k of Object.keys(snap()))KNOWN49.add(k)}catch(e){}}
 let M;try{M=migrateSave(S)}catch(e){
  if(e&&e.future){SAVE_LOCK=true;say('This save is from a newer version of SkillQuest. It was left untouched; please update the game.');msgT=15;console.warn('save rejected:',e.message);return}
  console.warn('save migration failed, loading the original as it is',e);if(S&&typeof S==='object'&&!(+S.sv>=2))backupPre(S,PRE_V2+'_acct');_ap49(S);return}
 if(!(+S.sv>=2))backupPre(S,PRE_V2+'_acct');
 TRAVEL49=null;_ap49(M);
 WORLD_STATE=M.worldState;UNLOCKED_REGIONS=M.unlockedRegions.slice();TRAVEL_UNLOCKS={...M.travelUnlocks};
 SAVE_EXTRA={};for(const k in M)if(!KNOWN49.has(k))SAVE_EXTRA[k]=M[k];
 if(M.p&&M.p.f&&!SCENE)face=[M.p.f[0],M.p.f[1]];
 if(M.region.id!=='hollow'&&typeof routeOpen==='function'&&!routeOpen(M.region.id)){say('The route to '+WORLD_REGIONS[M.region.id].name+' must be charted again with the voyage quests. You are safe back on Hollow Island.');msgT=8}   // s.p is the harbor post you sailed from
 else if(M.region.id!=='hollow'){const id=M.region.id,ok=loadRegion(id,M.region.x>=0?[M.region.x,M.region.y]:null,{x:P.x,y:P.y});
  if(ok){if(M.p&&M.p.f)face=[M.p.f[0],M.p.f[1]]}else say('Could not reach '+WORLD_REGIONS[id].name+'. You are back at the harbor you sailed from.')}};
const _sn49=snap;snap=function(){const s=_sn49();for(const k in SAVE_EXTRA)if(!(k in s))s[k]=SAVE_EXTRA[k];
 s.sv=SAVE_VERSION;if(s.p)s.p.f=[face[0]|0,face[1]|0];
 const R=SCENE&&SCENE.room;s.region=R&&R.region?{id:R.region,x:Math.max(0,Math.min(R.w-1,Math.floor(P.x/16))),y:Math.max(0,Math.min(R.h-1,Math.floor(P.y/16)))}:{id:'hollow'};
 s.worldState=JSON.parse(JSON.stringify(WORLD_STATE));s.unlockedRegions=UNLOCKED_REGIONS.slice();s.travelUnlocks={...TRAVEL_UNLOCKS};return s};
// a save we refused (newer version) must never be overwritten by this build
const _sl49=saveLocal;saveLocal=function(f){if(SAVE_LOCK)return;_sl49(f)};
const _sc49=saveCloud;saveCloud=async function(f){if(SAVE_LOCK)return;return _sc49(f)};
const _cf49=cloudFlush;cloudFlush=function(){if(SAVE_LOCK)return;_cf49()};
const _sh49=saveHide;saveHide=function(){if(SAVE_LOCK)return;_sh49()};
const _ng49=newGame;newGame=function(){WORLD_STATE={hollow:{}};UNLOCKED_REGIONS=['hollow'];TRAVEL_UNLOCKS=Object.fromEntries(TRAVEL_KEYS.map(k=>[k,false]));SAVE_EXTRA={};TRAVEL49=null;_ng49()};

// --- region generation (deterministic; never Math.random) ---
function rgRand(seed){let s=(Math.floor(seed*1000)>>>0)||1;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const RG_GEN={};   // one deterministic generator per region (section 50)
const RG_CACHE={},RG_ORDER=[],RG_PRE={};   // RG_PRE: a region built in slices during the crossing, waiting to be committed
   // prepared regions, reused on visits; at most two are kept (the one you're in + the last)
function rgReach(R){const W=R.w,H=R.h,seen=new Uint8Array(W*H),s=R.spawn[1]*W+R.spawn[0],st=[s];if(R.solid.has(s))return seen;seen[s]=1;
 while(st.length){const i=st.pop(),x=i%W,y=(i/W)|0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b,j=Y*W+X;if(X<0||Y<2||X>=W||Y>=H||seen[j]||R.solid.has(j))continue;seen[j]=1;st.push(j)}}return seen}
function rgPrepare(id){if(RG_CACHE[id])return rgApplyState(RG_CACHE[id]);const D=WORLD_REGIONS[id];if(!D)throw new Error('unknown region '+id);const gen=RG_GEN[id];if(!gen)throw new Error(D.name+' has not been charted yet');
 const G=RG_PRE[id]||gen(D),W=D.width,H=D.height;delete RG_PRE[id];if(!G||!G.tiles||G.tiles.length!==W*H)throw new Error('bad terrain for '+id);
 const R={key:'reg_'+id,region:id,gv:D.generationVersion,w:W,h:H,ex:-99,cave:1,tiles:G.tiles,items:G.items,solid:G.solid,spawn:G.spawn,dock:G.dock,pier:G.pier||[],pierH:!!G.pierH,
  lms:G.lms||[],reserved:G.reserved||[],bridges:G.bridges||[],stairs:G.stairs||[],lava:G.lava||[],platSt:G.platSt||[],plat:G.plat||null,gone:[],floor:['#58b848','#50a840'],wall:'#2662b8',trim:'#2662b8'};
 rgIndex(R);R.reach=rgReach(R);if(!R.reach[R.spawn[1]*W+R.spawn[0]])throw new Error('blocked arrival point in '+id);
 RG_CACHE[id]=R;rgTouch(id);return rgApplyState(R)}
function rgTouch(id){const j=RG_ORDER.indexOf(id);if(j>=0)RG_ORDER.splice(j,1);RG_ORDER.push(id);const cur=curRegion();
 while(RG_ORDER.length>2){const k=RG_ORDER.findIndex(r=>r!==id&&r!==cur);if(k<0)break;const old=RG_ORDER.splice(k,1)[0];delete RG_CACHE[old];if(ROOMS['reg_'+old]&&!(SCENE&&SCENE.id==='reg_'+old))delete ROOMS['reg_'+old];
  for(const ck of[...RGCK.keys()])if(ck.startsWith('reg_'+old+':'))RGCK.delete(ck)}}
// items are bucketed in 8x8-tile cells so drawing and lookups only touch what's near
const rgCellKey=(x,y)=>(x>>3)+','+(y>>3);
function rgIndex(R){R.cells=new Map();R.useItems=[];for(const it of R.items){rgCellAdd(R,it);if(it.use)R.useItems.push(it)}}
function rgCellAdd(R,it){const k=rgCellKey(it.x|0,it.y|0);let a=R.cells.get(k);if(!a)R.cells.set(k,a=[]);a.push(it)}
function rgCellDel(R,it){const a=R.cells.get(rgCellKey(it.x|0,it.y|0));if(a){const j=a.indexOf(it);if(j>=0)a.splice(j,1)}}
function rgNear(R,x0,y0,x1,y1){const out=[];for(let cy=(Math.floor(y0)>>3)-1;cy<=(Math.floor(y1)>>3);cy++)for(let cx=(Math.floor(x0)>>3)-1;cx<=(Math.floor(x1)>>3);cx++){const a=R.cells.get(cx+','+cy);if(a)for(const it of a)if(it.x>=x0-8&&it.x<=x1&&it.y>=y0-8&&it.y<=y1)out.push(it)}return out}
// persistent changes live in worldState (per region) and are laid over the generated terrain
function rgApplyState(R){return R}
// nearest safe tile reachable from the pier (saved positions are validated; never blocked terrain)
function rgSpot(R,want){const W=R.w;if(!want)return R.spawn.slice();let[x,y]=want;x=Math.max(0,Math.min(W-1,x|0));y=Math.max(0,Math.min(R.h-1,y|0));
 if(R.reach[y*W+x])return[x,y];let best=null,bd=1e9;for(let i=0;i<R.reach.length;i++)if(R.reach[i]){const a=i%W,b=(i/W)|0,d=(a-x)*(a-x)+(b-y)*(b-y);if(d<bd){bd=d;best=[a,b]}}return best||R.spawn.slice()}
function rgClear(){en=[];FISH=null;for(const L of[PROJ,GHOST,DMGS,DUST,PARTS,SPELLS])if(L&&L.length)L.length=0}
// the single entry point: prepare, validate, then commit; any failure leaves the current place untouched
function loadRegion(id,want,ret){const prev={SCENE,x:P.x,y:P.y,face:face.slice(),en,FISH,SAILING,room:ROOMS['reg_'+id]};
 try{const R=rgPrepare(id);rgTouch(id);const t=rgSpot(R,want);if(!t||R.solid.has(t[1]*R.w+t[0]))throw new Error('no safe spawn in '+id);
  const back=ret||{x:P.x,y:P.y};if(!isFinite(back.x)||!isFinite(back.y))throw new Error('bad return point');
  ROOMS[R.key]=R;SAILING=false;enterScene(R.key,null,{x:back.x,y:back.y});P.x=t[0]*16+8;P.y=t[1]*16+8;face=[0,-1];rgClear();
  if(!UNLOCKED_REGIONS.includes(id))UNLOCKED_REGIONS.push(id);if(!WORLD_STATE[id])WORLD_STATE[id]={};return true}
 catch(e){console.warn('region load failed:',e&&e.message);SCENE=prev.SCENE;P.x=prev.x;P.y=prev.y;face=prev.face;en=prev.en;FISH=prev.FISH;SAILING=prev.SAILING;
  if(prev.room)ROOMS['reg_'+id]=prev.room;else delete ROOMS['reg_'+id];return false}}
function leaveRegion(){const R=SCENE&&SCENE.room;if(!R||!R.region)return false;rgClear();leaveScene();rgClear();return true}

// --- the harbor post on the Tidewatch pier (departures) ---
let RG_POST=null;if(TWON&&TWDOCK.length){const px=TWDOCK[0]%N,col=TWDOCK.filter(i=>i%N===px),ey=Math.max(...col.map(i=>(i/N)|0));
 for(const x of[px-1,px+1,px])if(TWDOCK.includes(ey*N+x)){RG_POST={x,y:ey};break}}
const nearPost49=()=>!SCENE&&!SAILING&&!!postHere();   // any harbor post (section 51)
function routeOpen(id){const D=WORLD_REGIONS[id];if(!D)return false;if(id==='hollow')return true;return!!(RG_GEN[id]&&(!ROUTE_GATES||D.unlock&&TRAVEL_UNLOCKS[D.unlock]))}
function routesHTML(){const here=curRegion(),row=(id,label,sub,ok)=>'<button class="sb rt49" data-r="'+id+'" style="opacity:'+(ok?1:.45)+';width:100%;text-align:left">'+label+'<br><small>'+sub+'</small></button>';
 let h='<div class="tl">Sailing routes</div><div class="qc"><p>'+(here==='hollow'?'The harbor post lists every sea route out of Tidewatch. The harbor master lets anyone sail for now, and return trips are always free.':'Your boat waits at the pier. The way home is always open.')+'</p></div>';
 for(const id of ROUTE_ORDER){const D=WORLD_REGIONS[id];
  if(id===here)h+=row(id,D.name,'You are here',false);
  else if(id==='hollow')h+=row(id,'⛵ Hollow Island','Sail home to the Tidewatch pier · free',true);
  else if(routeOpen(id))h+=row(id,'⛵ '+D.name,D.biome+' · lies '+D.dir+' · suggested combat '+D.lv,true);
  else h+=row(id,'🔒 '+D.name+' [LOCKED]',D.hint||'Uncharted',false)}
 return h}
function openRoutes(){if(pnOpen||menuOpen||dead||TRAVEL49)return;shop='routes49';pnOpen=true;ptab=2;jx=jy=0;pn.style.display='block';rPn();sfx('talk')}
const _r49=rPn;rPn=function(){if(ptab===2&&shop==='routes49'){document.getElementById('t0').style.display='none';document.getElementById('t1').style.display='none';ptt.textContent='';pbd.innerHTML=routesHTML();return}_r49()};
const _oc49=pbd.onclick;pbd.onclick=e=>{const b=e.target.closest('.rt49');if(b){routeGo(b.dataset.r);return}_oc49(e)};
// a trip: check the route, prepare the destination first, then a short crossing hides the switch
function routeGo(id){if(TRAVEL49||dead)return;const here=curRegion();if(id===here)return;if(!routeOpen(id)){say('That route is not charted yet.');sfx('swish');return}
 if(id!=='hollow'&&!RG_GEN[id]){say('The route to '+WORLD_REGIONS[id].name+' is blocked right now.');return}
 closePanel();   // the region itself is generated during the crossing, under the sailing screen
TRAVEL49={t:0,dur:1.3,to:id,done:false,job:id!=='hollow'&&!RG_CACHE[id]?rgJob(id):null,hold:0};sfx('splash')}
function travelCommit(T){const id=T.to;let ok;
 if(id==='hollow'){ok=leaveRegion();if(ok)say('Home again, back at the '+((postHere()||{name:'Tidewatch'}).name)+' harbor post.')}
 else{const R=SCENE&&SCENE.room,ret=R&&R.region?SCENE.ret:{x:P.x,y:P.y};
  if(R&&R.region){rgClear();SCENE=null;P.x=ret.x;P.y=ret.y}   // region to region: hop via home waters
  ok=loadRegion(id,null,ret);if(ok){say('You arrive at '+WORLD_REGIONS[id].name+'. The pier post sails you home.')}}
 if(!ok)say('The crossing failed; you are still where you were.');else saveNow()}
if(typeof SFX!=='undefined'&&!SFX.splash)SFX.splash=()=>{noise(.35,.06,500)};

// --- input: TALK / T / X at the post, or at the region pier ---
const _tk49=talk;talk=function(){if(!pnOpen&&!menuOpen&&!dead&&!TRAVEL49&&nearPost49()&&!nearNpc()){openRoutes();return}_tk49()};
tk.addEventListener('touchstart',e=>{if(!pnOpen&&!menuOpen&&!dead&&nearPost49()&&!nearNpc()){e.preventDefault();openRoutes()}},{passive:false});
const _fn49=facingNpc;facingNpc=function(){const n=_fn49();if(n)return n;return nearPost49()&&!en.some(e=>!e.dead&&Math.hypot(e.x-P.x,e.y-P.y)<40)?{routes49:1}:null};   // monsters next to you still get hit
const _cb49=canBoard;canBoard=function(){return nearPost49()?false:_cb49()};
// things you can USE in a region (the pier post, landmarks): measured to the edge of their footprint
const _nfu49=nearFurn;nearFurn=function(){const R=SCENE&&SCENE.room;if(R&&R.region){let best=null,bd=14;for(const it of R.useItems){const x0=it.x*16,y0=it.y*16,x1=x0+(it.w||1)*16,y1=y0+(it.h||1)*16,
  d=Math.hypot(Math.max(x0-P.x,0,P.x-x1),Math.max(y0-P.y,0,P.y-y1));if(d<bd){bd=d;best=it}}return best}return _nfu49()};
const _uf49=useFurn;useFurn=function(it){if(it&&it.use==='regdock'){openRoutes();return}if(it&&it.use==='look'){rgLook(it);return}_uf49(it)};
const _nf49=nearFire;nearFire=function(x,y,r){return curRegion()!=='hollow'?false:_nf49(x,y,r)};   // Hollow campfires don't burn in other lands
const _fi49=fire;fire=function(){if(curRegion()!=='hollow'){say('Too windy out here for a campfire.');return}_fi49()};

// --- update: travel, quest regions, spawns ---
const RG_OWN=new WeakSet();let RG_SPT=0;
const _u49=upd;upd=function(dt){
 if(TRAVEL49){const T=TRAVEL49;T.t+=dt;if(T.job&&!T.job.done)rgJobStep(T.job,7);
  if(!T.done&&T.t>=T.dur*.55){if(T.job&&!T.job.done&&T.hold<6){T.t=T.dur*.55;T.hold+=dt}
   else{T.done=true;if(T.job&&T.job.err){console.warn(T.job.err);say('The crossing failed; you are still where you were.')}else{if(T.job&&T.job.G)RG_PRE[T.to]=T.job.G;try{travelCommit(T)}catch(e){console.warn(e)}}T.job=null}}
  // keep the sea on screen until the land in view is painted (one terrain piece per frame)
  else if(T.done&&T.t>=T.dur*.72&&T.hold<6&&SCENE&&SCENE.room&&SCENE.room.region&&rgMissing(SCENE.room)>0){T.t=T.dur*.72;T.hold+=dt}
  if(T.t>=T.dur)TRAVEL49=null;return}
 const q=QS[Q.i],guard=Q.on&&q&&q.type==='kill'&&curRegion()!==regionOf(q),qk=Q.k;
 _u49(dt);if(guard)Q.k=qk;
 const R=SCENE&&SCENE.room;
 if(R&&R.region&&!menuOpen&&!pnOpen&&!dead)rgUpd(R,dt);
 if(!SCENE&&!menuOpen&&!pnOpen&&!dead&&nearPost49()&&!nearNpc()){tk.style.display='flex';const lab='ROUTES'+(isPC?'<small>T</small>':'');if(!tk.innerHTML.startsWith('ROUTES'))tk.innerHTML=lab;tkLab=''}};
function rgUpd(R,dt){rgTick(R,dt);const cap=(REGION_SPAWNS[R.region]||{maxEnemies:10}).maxEnemies,dkx=(R.dock[0]+.5)*16,dky=(R.dock[1]+.5)*16;
 // enemies that appeared on their own must stand on reachable ground and away from the pier
 for(const n of en)if(!RG_OWN.has(n)){RG_OWN.add(n);const tx=Math.floor(n.x/16),ty=Math.floor(n.y/16),i=ty*R.w+tx;if(!(R.reach[i])||Math.hypot(n.x-dkx,n.y-dky)<80||Math.hypot(n.x-P.x,n.y-P.y)<60||rgQuiet(R,tx,ty))n.dead=1;
  else if(n.type!=='boss'){const m=rgMob(R.region,n.x,n.y);for(const k of Object.keys(n))if(!(k in m))delete n[k];Object.assign(n,m)}}   // the night spawner's slimes become this region's creatures
 let alive=en.filter(n=>!n.dead);if(alive.length>cap){for(const n of alive.slice(cap))n.dead=1;alive=alive.slice(0,cap)}
 if((RG_SPT-=dt)>0||dark()<=.3||alive.length>=cap)return;RG_SPT=1.2;
 for(let k=0;k<12;k++){const a=Math.random()*6.283,d=175+Math.random()*70,x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d,tx=Math.floor(x/16),ty=Math.floor(y/16);
  if(tx<0||ty<0||tx>=R.w||ty>=R.h||!R.reach[ty*R.w+tx]||Math.hypot(x-dkx,y-dky)<96)continue;
  if(rgQuiet(R,tx,ty))continue;const n=rgMob(R.region,tx*16+8,ty*16+8);RG_OWN.add(n);en.push(n);break}}

// --- outdoor light and music inside a region ---
const _dk49=dark;dark=function(){const R=SCENE&&SCENE.room;if(R&&R.region){const s=SCENE;SCENE=null;try{return _dk49()}finally{SCENE=s}}return _dk49()};
const _ws49=wantSong;wantSong=function(){const R=SCENE&&SCENE.room;if(R&&R.region)return dark()>.4?'night':'day';return _ws49()};
const _drw49=draw;draw=function(){const R=SCENE&&SCENE.room;if(R&&R.region){const f=fires;fires=rgGlows(R).map(o=>Object.assign({},o,{_glow:1})).concat(f);try{_drw49()}finally{fires=f}}else _drw49()};   // (your campfires glow too)   // lava glows at night like campfires

// --- drawing the region: baked terrain chunks (same painter as Hollow), culled objects ---
// the same chunk painter Hollow uses, with the tile lookup passed in
function hdBakeR(kx,ky,hdTT){const S=HDCS*32,M=14,B=S+2*M,typ=new Uint8Array(B*B),ox=kx*S-M,oy=ky*S-M;
 for(let v=0;v<B;v++)for(let u=0;u<B;u++){const U=ox+u,V=oy+v,wx=U/2,wy=V/2,tx=Math.floor(wx/16),ty=Math.floor(wy/16),real=hdTT(tx,ty),ly=wy-ty*16;
  let t=ly>=ED_FY?edFace(hdTT,U,V,wx,wy,tx,ty,real,ly):-1;if(t<0){const px=(hdVN(U/13,V/13)-.5)*7+(hdVN(U/5,V/5)-.5)*2,py=(hdVN(U/13+40,V/13+9)-.5)*7+(hdVN(U/5+3,V/5+70)-.5)*2;
   t=hdTT(Math.floor((wx+px)/16),Math.floor((wy+py)/16));if(t===3&&real!==3&&hdTT(tx,ty-1)===3)t=real}
  if(real===11)t=11;else if(t===11)t=real;
  typ[v*B+u]=t}
 // distance (in texels, x3) to the nearest water / land texel
 const dw=new Uint16Array(B*B),dl=new Uint16Array(B*B),BIG=60000;
 for(let i=0;i<B*B;i++){const w=typ[i]===0;dw[i]=w?BIG:0;dl[i]=w?0:BIG}
 const cham=d=>{for(let y=0;y<B;y++)for(let x=0;x<B;x++){const i=y*B+x;let m=d[i];if(!m)continue;if(x>0)m=Math.min(m,d[i-1]+3);if(y>0){m=Math.min(m,d[i-B]+3);if(x>0)m=Math.min(m,d[i-B-1]+4);if(x<B-1)m=Math.min(m,d[i-B+1]+4)}d[i]=m}
  for(let y=B-1;y>=0;y--)for(let x=B-1;x>=0;x--){const i=y*B+x;let m=d[i];if(!m)continue;if(x<B-1)m=Math.min(m,d[i+1]+3);if(y<B-1){m=Math.min(m,d[i+B]+3);if(x<B-1)m=Math.min(m,d[i+B+1]+4);if(x>0)m=Math.min(m,d[i+B-1]+4)}d[i]=m}};
 cham(dw);cham(dl);
 const b=hdBuf(S,S),WT=HDT.water;
 for(let y=0;y<S;y++)for(let x=0;x<S;x++){const u=x+M,v=y+M,i=v*B+u,t=typ[i],U=ox+u,V=oy+v,wx=U/2,wy=V/2,f=hdVN(U/70,V/70)*.6+hdVN(U/22,V/22)*.4,r=hdH(U,V);let c;
  if(t===0){const d=dw[i]/3;if(d<1.7+hdVN(U/6,V/6)*1.6)c=WT[r<.12?8:9];else if(d<4.5)c=WT[hdQ(.75+(4.5-d)*.06,10,U,V)];else{const k=Math.min(1,d/34);c=WT[hdQ((1-k)*.62+f*.2+.04,10,U,V)]}}
  else if(t===1){const dd=dl[i]/3;if(dd<7+hdVN(U/8,V/8)*5)c=HDT.wet[hdQ(f*.8+.1+(dd/14),3,U,V)];else c=HDT.sand[hdQ(f*.85+.08+(r-.5)*.1,4,U,V)];if(r>.996)c=HDT.wet[0]}
  else if(t===2)c=HDT.grass[hdQ(f*.95+.03+(r-.5)*.14,5,U,V)];
  else if(t===3){const cr=Math.abs(hdVN(U/16,V/16)-.5);c=cr<.009?HDT.rock[0]:HDT.rock[hdQ(f*.8+.12+(r-.5)*.12,5,U,V)];if(cr>=.009&&cr<.02)c=HDT.rock[4]}
  else if(t===4){c=HDT.snow[hdQ(f*.9+.08+(r-.5)*.1,4,U,V)];if(r>.997)c=hdC('#ffffff')}
  else if(t===5){const rip=Math.sin(wx*.42+wy*.95+hdVN(U/40,V/40)*14)*.5+.5;c=HDT.dune[hdQ(f*.45+rip*.4+.06,5,U,V)]}
  else if(t>=7)c=RGPAL(t,U,V,f,r,wx,wy);
  else{const ly=(wy-Math.floor(wy/16)*16-ED_FY)*2;const col=hdH(U>>2,7)>.72;c=ly<1.2?hdC('#dccdb4'):ly<2.2?HDT.cliff[3]:HDT.cliff[hdQ(.8-ly/19+(col?-.3:0)+(r-.5)*.15,4,U,V)]}
  b.d[y*S+x]=c;b.id[y*S+x]=t+1}
 // stamps: grass tufts and flowers, snow drifts, desert pebbles
 const st=(x,y,pts,ok)=>{for(const[a,c,col]of pts){const X=x+a,Y=y+c;if(X<0||Y<0||X>=S||Y>=S)continue;if(ok&&b.id[Y*S+X]!==ok)continue;b.d[Y*S+X]=col}};
 const GT=[hdC('#2f7a2e'),hdC('#3c8836'),hdC('#8edb6a')],FL=[['#ffffff','#f8d030'],['#f8e048','#e86030'],['#f8a0c8','#f8e060'],['#a8c8ff','#ffffff']].map(p=>p.map(hdC));
 for(let ty=-1;ty<=HDCS;ty++)for(let tx=-1;tx<=HDCS;tx++){const TX=kx*HDCS+tx,TY=ky*HDCS+ty,t=hdTT(TX,TY),bx=tx*32,by=ty*32;
  if(t===2){const n=4+Math.floor(hdH(TX,TY)*5);for(let k=0;k<n;k++){const x=bx+2+Math.floor(hdH(TX*7+k,TY)*27),y=by+4+Math.floor(hdH(TX,TY*7+k)*26);st(x,y,[[0,0,GT[0]],[1,-1,GT[1]],[1,-2,GT[2]],[2,0,GT[0]],[3,-1,GT[1]],[3,-2,GT[2]],[4,0,GT[0]],[-1,-1,GT[1]]],3)}
   const fv=hdH(TX*3,TY*5);if(fv<.42){const p=FL[Math.floor(hdH(TX,TY*3)*4)],m=1+Math.floor(hdH(TX*5,TY)*3);for(let k=0;k<m;k++){const x=bx+4+Math.floor(hdH(TX+k*11,TY*2)*22),y=by+4+Math.floor(hdH(TX*2,TY+k*13)*22);
    st(x,y,[[0,2,GT[0]],[0,-1,p[0]],[-1,0,p[0]],[1,0,p[0]],[0,1,p[0]],[0,0,p[1]]],3)}}}
  else if(t===4){if(hdH(TX,TY*9)<.5){const x=bx+4+Math.floor(hdH(TX*9,TY)*20),y=by+6+Math.floor(hdH(TX,TY*11)*20);st(x,y,[[0,0,HDT.snow[0]],[1,0,HDT.snow[0]],[2,0,HDT.snow[0]],[3,0,HDT.snow[0]],[1,-1,hdC('#ffffff')],[2,-1,hdC('#ffffff')]],5)}}
  else if(t===5||t===1){if(hdH(TX*4,TY*9)<.35){const x=bx+4+Math.floor(hdH(TX*9,TY*2)*22),y=by+6+Math.floor(hdH(TX*2,TY*11)*20),dk=t===5?hdC('#a87a40'):hdC('#b89a60'),lt=hdC('#fff2cc');st(x,y,[[0,0,dk],[1,0,dk],[0,-1,lt],[1,-1,dk]],t+1)}}}
 hdEdge(b,typ,B,M,S,HDELR);
 return hdCan(b)}
const RGCK=new Map();
function rgChunk(R,kx,ky){const k=R.key+':'+kx+','+ky;let c=RGCK.get(k);if(c){RGCK.delete(k);RGCK.set(k,c);return c}
 const W=R.w,H=R.h,T=R.tiles;c=hdBakeR(kx,ky,(x,y)=>x<0||y<0||x>=W||y>=H?0:T[y*W+x]);RGCK.set(k,c);if(RGCK.size>64)RGCK.delete(RGCK.keys().next().value);return c}
function rgView(){const vw=W/Z,vh=H/Z;return{x0:P.x-vw/2,y0:P.y-vh/2,x1:P.x+vw/2,y1:P.y+vh/2}}
// a tile-colour sketch of the region, shown for a frame or two where the detailed terrain isn't painted yet
function rgSketch(R){if(R.sk)return R.sk;const c=document.createElement('canvas');c.width=R.w;c.height=R.h;const x=c.getContext('2d'),im=x.createImageData(R.w,R.h);new Uint32Array(im.data.buffer).set(rgTerrainU(R));x.putImageData(im,0,0);return R.sk=c}
function rgMissing(R){const v=rgView(),C=HDCS*16;let n=0;for(let ky=Math.floor(v.y0/C);ky<=Math.floor(v.y1/C);ky++)for(let kx=Math.floor(v.x0/C);kx<=Math.floor(v.x1/C);kx++)if(!RGCK.has(R.key+':'+kx+','+ky))n++;return n}
function rgPrebake(R){const v=rgView(),C=HDCS*16;for(let ky=Math.floor(v.y0/C)-1;ky<=Math.floor(v.y1/C)+1;ky++)for(let kx=Math.floor(v.x0/C)-1;kx<=Math.floor(v.x1/C)+1;kx++)rgChunk(R,kx,ky)}
const _rbg49=ROOMBG;ROOMBG=(R,W2,H2)=>{if(!R.region)return _rbg49(R,W2,H2);const v=rgView(),C=HDCS*16;
 g.fillStyle='#2662b8';g.fillRect(v.x0-8,v.y0-8,v.x1-v.x0+16,v.y1-v.y0+16);
 const k0=Math.floor(v.x0/C),k1=Math.floor(v.x1/C),j0=Math.floor(v.y0/C),j1=Math.floor(v.y1/C);
 let baked=false;for(let ky=j0;ky<=j1;ky++)for(let kx=k0;kx<=k1;kx++){const key=R.key+':'+kx+','+ky;let c=RGCK.get(key);
  if(!c&&!baked){c=rgChunk(R,kx,ky);baked=true}
  if(c){RGCK.delete(key);RGCK.set(key,c);g.drawImage(c,kx*C,ky*C,C,C)}else{const s=rgSketch(R);g.imageSmoothingEnabled=false;g.drawImage(s,kx*HDCS,ky*HDCS,HDCS,HDCS,kx*C,ky*C,C,C)}}
 if(!baked)outer:for(let ky=j0-1;ky<=j1+1;ky++)for(let kx=k0-1;kx<=k1+1;kx++)if(!RGCK.has(R.key+':'+kx+','+ky)){rgChunk(R,kx,ky);break outer}
 rgOverlay(R,v);
 // pier planks
 for(const[x,y]of R.pier){const x0=x*16,y0=y*16;Rg(x0-1,y0,18,16,'#4a3020');Rg(x0,y0,16,16,'#a87850');for(let k=0;k<4;k++)if(R.pierH)Rg(x0+k*4+3,y0,1,16,'#7a5434');else Rg(x0,y0+k*4+3,16,1,'#7a5434');Rg(x0+1,y0,1,16,'#c89868');Rg(x0-1,y0+15,2,5,'#3a2618');Rg(x0+15,y0+15,2,5,'#3a2618')}};
function drawPost49(x,y,tm){shd(x,y+5,10);Rg(x-2,y-20,4,26,O);Rg(x-1,y-19,2,24,'#8a6038');Rg(x-9,y-18,18,9,O);Rg(x-8,y-17,16,7,'#c89868');Rg(x-6,y-15,12,1,'#7a5434');Rg(x-6,y-13,9,1,'#7a5434');
 const w=Math.sin(tm*4)*1.5;g.fillStyle='#3888d6';g.beginPath();g.moveTo(x+1,y-27);g.lineTo(x+10+w,y-24);g.lineTo(x+1,y-21);g.fill();Rg(x,y-28,2,9,O)}
const _df49=drawFurn;drawFurn=function(it,tm){
 if(it.t==='_obj'){const o=it.o,bx=it.x*16+8,by=it.y*16+14;if(!(OBJHD&&OBJHD(o,it.x,it.y,bx,by,0,tm))){shd(bx,by-1,14);Rg(bx-6,by-12,12,12,o.t==='rock'?'#988a78':'#2e7048')}return}
 if(it.t==='_en'){pS(it.n,tm);return}
 if(it.t==='rgpost'){drawPost49(it.x*16+3,it.y*16+8,tm);return}
 _df49(it,tm)};
const _drm49=drawRoom;drawRoom=function(tm){const R=SCENE&&SCENE.room;if(!R||!R.region)return _drm49(tm);
 const v=rgView(),all=R.items,vis=rgNear(R,v.x0/16-2,v.y0/16-1,v.x1/16+2,v.y1/16+8);
 for(const n of en)if(!n.dead)vis.push({t:'_en',n,x:n.x/16,y:(n.y+6)/16-1});
 R.items=vis;try{_drm49(tm)}finally{R.items=all}};
const _lh49=LHOOK;LHOOK=(L,x0,y0,x1,y1,tm)=>{_lh49(L,x0,y0,x1,y1,tm);if(RG_POST&&RG_POST.x>=x0-2&&RG_POST.x<=x1+2&&RG_POST.y>=y0-2&&RG_POST.y<=y1+3)L.push([RG_POST.y*16+13,4,()=>drawPost49(RG_POST.x*16+(RG_POST.x<TWDOCK[0]%N?3:13),RG_POST.y*16+8,tm)])};

// --- the crossing, the region minimap ---
const _dh49=drawHUD;drawHUD=function(){_dh49();
 if(TRAVEL49){const T=TRAVEL49,k=T.t/T.dur,a=k<.45?k/.45:k>.7?Math.max(0,(1-k)/.3):1,now=performance.now()/1000;g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=a;
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#0e2a58');gr.addColorStop(1,'#1d5aa8');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.strokeStyle='rgba(200,236,255,.45)';g.lineWidth=2;for(let r=0;r<6;r++){const yy=H*.45+r*H*.07;g.beginPath();for(let x=0;x<=W;x+=16){const y=yy+Math.sin(x*.025+now*3+r)*5;x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
  const bx=W/2+Math.sin(now*1.3)*10,by=H*.45+Math.sin(now*3)*4,u=Math.max(2,Math.min(W,H)/160);g.fillStyle='#5a3a20';g.fillRect(bx-12*u,by-2*u,24*u,5*u);g.fillStyle='#8a6038';g.fillRect(bx-10*u,by-3*u,20*u,2*u);g.fillStyle='#3a2618';g.fillRect(bx-u/2,by-20*u,u,18*u);
  g.fillStyle='#f4ecd8';g.beginPath();g.moveTo(bx+u,by-19*u);g.lineTo(bx+11*u,by-5*u);g.lineTo(bx+u,by-5*u);g.fill();
  g.fillStyle='#fff';g.textAlign='center';g.font='700 '+Math.round(9*u)+'px "Pixelify Sans",monospace';g.fillText('Sailing to '+WORLD_REGIONS[T.to].name+'…',W/2,H*.3);g.textAlign='left';g.restore()}};
function rgMiniCanvas(R){if(R.mm)return R.mm;const c=document.createElement('canvas');c.width=R.w;c.height=R.h;const x=c.getContext('2d'),im=x.createImageData(R.w,R.h),u=new Uint32Array(im.data.buffer),COL=RG_MAPCOL.map(hdC);
 for(let i=0;i<R.w*R.h;i++)u[i]=COL[R.tiles[i]]||COL[2];for(const it of R.items){if(it.t==='_obj')u[it.y*R.w+it.x]=hdC(RG_OBJCOL[it.o.v||it.o.t]||'#2c7c30');else if(it.t==='lm')for(let b=0;b<(it.h||1);b++)for(let a=0;a<(it.w||1);a++)u[(it.y+b)*R.w+it.x+a]=hdC('#d8d0c0')}
 for(const[a,b]of R.pier)u[b*R.w+a]=hdC('#a87850');
 x.putImageData(im,0,0);R.mm=c;return c}
function rgMini(R){const L=HUDL||hudLayout(),U=L.U,w=L.dw,hh=w*R.h/R.w,x0=L.dx,y0=L.top+L.dh+46*U;g.save();g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;
 g.fillStyle='rgba(10,8,16,.72)';g.fillRect(x0-3*U,y0-3*U,w+6*U,hh+6*U);g.drawImage(rgMiniCanvas(R),x0,y0,w,hh);
 const m=(tx,ty,c,s)=>{g.fillStyle=c;g.fillRect(x0+(tx+.5)/R.w*w-s*U/2,y0+(ty+.5)/R.h*hh-s*U/2,s*U,s*U)};m(R.dock[0],R.dock[1],'#f8d848',3);
 for(const l of R.lms)if(rgSeen(R.region,l.id))m(l.x,l.y,'#f8f8f8',2);
 m(P.x/16-.5,P.y/16-.5,(performance.now()/300|0)%2?'#ff4060':'#ffffff',3);g.restore()}

// --- the map: the region you are in, plus a world list ---
function worldHTML(){const here=curRegion();let h='<div class="tl" style="margin-top:10px">WORLD</div>';
 for(const id of ROUTE_ORDER){const D=WORLD_REGIONS[id],known=UNLOCKED_REGIONS.includes(id);
  if(!known){h+='<div class="qrow" style="opacity:.55">▒▒▒ Uncharted waters <small>(undiscovered)</small></div>';continue}
  const towns=TOWN_REG.filter(t=>t.on&&t.regionId===id).map(t=>t.name),duns=DUNGEON_REG.filter(d=>d.on&&d.regionId===id).map(d=>d.name);
  h+='<details class="qrow"'+(id===here?' open':'')+'><summary>'+(id===here?'📍 ':'')+D.name+'</summary><small>'+D.biome+(towns.length?'<br>Towns: '+towns.join(', '):'')+(duns.length?'<br>Dungeons: '+duns.join(', '):'')+
   (id!=='hollow'?'<br>Landmarks found: '+((WORLD_STATE[id]&&WORLD_STATE[id].seen||[]).length)+' / '+(RG_LMCOUNT[id]||0)+'<br>Suggested combat: '+D.lv:'')+'<br>Routes: '+(id==='hollow'?(RG_POST?'harbor post on the Tidewatch pier':'none'):'pier post, home to Hollow Island (free)')+'</small></details>'}
 return h}
const _mh49=mapHTML;mapHTML=function(){const R=SCENE&&SCENE.room;if(R&&R.region){const D=WORLD_REGIONS[R.region];
  return'<div class="tl" style="font-size:17px">'+D.name.toUpperCase()+'</div><canvas id="mpc" width="'+R.w+'" height="'+R.h+'" style="height:calc(min(84vw,52vh,380px)*'+(R.h/R.w).toFixed(4)+')"></canvas><div class="lg"><span><i style="background:#f83030"></i>You</span><span><i style="background:#f8d848"></i>Pier</span><span><i style="background:#f8f8f8"></i>Landmark (found)</span></div>'+rgLmList(R)+worldHTML()}
 return _mh49()+worldHTML()};
const _dmap49=drawMap;drawMap=function(){const R=SCENE&&SCENE.room;if(!R||!R.region)return _dmap49();const c=document.getElementById('mpc');if(!c||c.width!==R.w)return;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(rgFogCanvas(R),0,0);   // fogged (section 52)
 x.fillStyle='#f8d848';x.fillRect(R.dock[0]-1,R.dock[1]-1,3,3);x.fillStyle='#f8f8f8';for(const l of R.lms)if(rgSeen(R.region,l.id))x.fillRect(l.x-1,l.y-1,3,3);
 const px=Math.floor(P.x/16),py=Math.floor(P.y/16);if(Math.floor(performance.now()/350)%2){x.fillStyle='#f83030';x.fillRect(px-1,py-1,3,3)}x.fillStyle='#fff';x.fillRect(px,py,1,1)};
// side quests from Hollow towns only count in Hollow (the region-aware check; old objectives default to Hollow)
const _sqe49=sqEvent;sqEvent=function(type,item,test){const r=curRegion();return _sqe49(type,item,t=>(SQ_REGION[t]||'hollow')===r&&(!test||test(t)))};
