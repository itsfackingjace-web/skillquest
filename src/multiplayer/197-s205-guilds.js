// ---- 205. Guilds and guild islands ----
// A player founds a guild (COST gold, a name, a 2-4 letter tag, a colour) and the guild gets its own small island that only
// members can sail to (region `gi_<gid>`, registered on members' games only, so others never see it). The island grows from
// the guild bank: Guild Quests (one at a time, picked by the leader or an officer from three skill quests) pay ore veins,
// tree saplings, bushes/spores and bait into the bank, and leaders/officers plant those on the island, where everyone in the
// guild can gather them.
// Database (rules in database.rules.json, publish them):
//   guilds/<g>/info {n,tag,col,lead,t}       leader writes (founder creates)
//   guilds/<g>/m/<uid> {r:'l'|'o'|'m',n,j}   join with an invite, leave yourself, leader/officers manage (officers: members only)
//   guilds/<g>/q {k,goal,lv,p,c:{uid:n},t,by,done}   members add progress (transactions); leader/officers start one
//   guilds/<g>/prog {qd}                     quests done (only goes up by one, together with the reward)
//   guilds/<g>/perm {o,m}                    withdrawals a day per rank (-1 = no limit, 0 = none); leader writes
//   guilds/<g>/bank {i:{k:n},v,lid}          every change bumps v by exactly one and names its log entry (lid): the rules
//                                            refuse a stale v, so two changes at once can't both land (no duplicates)
//   guilds/<g>/isl/<cell> = node item key    what's planted where (leader/officers)
//   guilds/<g>/wd/<uid> {d,n}                what a member took out today (the game enforces the daily limit)
//   glog/<g>/<id> {u,n,w,k,d,t}              the bank log, written in the same update as the bank change; create-only;
//                                            leader and officers read it
//   gname/<lowercase name> = g, gmem/<uid> = g, ginv/<uid>/<g> {gn,tag,by,bn,t}
//   prog/<wood|mine|forage|fish> = quests done of that skill = the guild's rank in it (claim adds one to the quest's skill)
//   gchat/<g>/<id> {u,n,m,t} guild chat (members; anyone may delete lines older than a day), glb/<g> {n,tag,col,lv,m} the
//   public guild leaderboard (members keep it current), info.rn = renames done (first free, then RENAME gold)
// What a guild is FOR (perks, all in this file):
//   - skill ranks: each finished quest ranks the guild up in that skill (max RMAX): members get +10% XP and a 10% chance per
//     rank of one extra of each item they gather with that skill (outermost addXp / the upd item count);
//   - buildings by guild level (BLD): L2 horn (travel to the island from anywhere outdoors), L3 forge (furnace + anvil on the
//     island, +20% Smithing XP there), L4 shrine (a daily 20-minute blessing: wisdom + regeneration), L5 hall (+10 members,
//     +5% XP in every skill); placed at runtime by applyBuildings, their spots are kept free of planting;
//   - planted nodes on the island regrow in 60 s (240 s in the wild) and aren't shared world-wide (061 skips gi_ regions);
//   - guild chat (chat tab Guild, /g) and the guild leaderboard (screen tab Top guilds).
// Saved on the device (localStorage sq_guild): the guild id/name/colour and what's planted, so the island is registered at
// start-up and a save made on it loads back there. Presence carries `gt` (tag) and `gc` (colour index) for others' name tags.
(()=>{const Mp=()=>window.SQMP,Fm=()=>window.SQFB,on=()=>!!(Mp()&&Mp().on&&Mp().user&&Fm()),me=()=>Mp().user.uid,ref=p=>p?Fm().db.ref(Fm().D,p):Fm().db.ref(Fm().D),DB=()=>Fm().db;
 const LSG=k=>{try{return localStorage.getItem(k)}catch(e){return null}},LSS=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}};
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const myN=()=>{let n='';try{n=(typeof PNAME!=='undefined'&&PNAME)||((Mp().user&&Mp().user.displayName)||'').split(' ')[0]}catch(e){}return String(n||'Adventurer').replace(/[<>]/g,'').slice(0,12)};
 const TS=()=>{try{return DB().serverTimestamp()}catch(e){return Date.now()}};
 const now=()=>Date.now()+((Mp()&&Mp().off)||0),day=()=>Math.floor(now()/864e5);
 const COST=5000000,RENAME=1000000,GT=44,RMAX=5;
 const maxM=()=>30+(glv(G.prog&&G.prog.qd)>=5?10:0);
 const COLS=['#d83a30','#e8862a','#e8c830','#48a848','#30a0a0','#3870d8','#8048c8','#d058a0','#e8e8e8','#404048'];
 const ROLE={l:'Leader',o:'Officer',m:'Member'};
 // ---- things the guild bank holds that can be planted on the island: key -> [name, object kind, icon] ----
 const NODE={gv_rock:['Stone vein','rock','🪨'],gv_iron:['Iron vein','ore','⛏️'],gv_gold:['Gold vein','gold','⛏️'],gv_mith:['Mithril vein','mith','⛏️'],gv_adam:['Adamant vein','adam','⛏️'],
  gs_tree:['Tree sapling','tree','🌱'],gs_oak:['Oak sapling','oak','🌱'],gs_willow:['Willow sapling','willow','🌱'],gs_maple:['Maple sapling','maple','🌱'],gs_yew:['Yew sapling','yew','🌱'],gs_void:['Void sapling','tree','🌱','dark'],
  gf_bush:['Berry bush','bush','🌿'],gf_nut:['Nut bush','nutbush','🌰'],gf_cactus:['Cactus seed','cactus','🌵'],gf_shroom:['Mushroom spores','shroom','🍄']};
 const nm=k=>NODE[k]?NODE[k][0]:(INAME[k]||(typeof iname==='function'?iname(k):k));
 const ic=k=>NODE[k]?'<span class="gdgi">'+NODE[k][2]+'</span>':(typeof iconURL==='function'?'<img class="gdgi" alt="" src="'+iconURL(k)+'">':'');
 // ---- Guild Quests: one skill each; goals grow with the guild's size and level; rewards go into the bank ----
 // ---- Guild Quests: enormous shared goals (the whole guild, for weeks); when one is done the leader or an officer picks ONE
 // reward from its list, and it goes into the bank ----
 const QK={wood:{sk:'Woodcutting',n:'Woodcutting quest',verb:'Cut 100,000 trees',goal:100000,rw:[{gs_tree:50},{gs_oak:35},{gs_maple:20},{gs_yew:15},{gs_void:10}]},
  mine:{sk:'Mining',n:'Mining quest',verb:'Mine 100,000 rocks and ores',goal:100000,rw:[{gv_rock:50},{gv_iron:35},{gv_gold:20},{gv_mith:15},{gv_adam:10}]},
  forage:{sk:'Foraging',n:'Foraging quest',verb:'Forage 100,000 berries, nuts, mushrooms and cactus fruit',goal:100000,rw:[{gf_bush:50},{gf_nut:35},{gf_cactus:20},{gf_shroom:15}]},
  fish:{sk:'Fishing',n:'Fishing quest',verb:'Catch 50,000 fish',goal:50000,rw:[{bait:100000}]}};
 const glv=qd=>1+(qd|0);                                      // guild level: one per finished quest
 const rank=k=>Math.min(RMAX,(G.prog&&G.prog[k])|0);
 const BLD=[{k:'horn',lv:2,n:'Guild horn',d:'Travel to the guild island from anywhere outdoors (once every 3 minutes).'},
  {k:'forge',lv:3,n:'Guild forge',d:'A furnace and an anvil on the island. Smithing there gives +20% XP.'},
  {k:'shrine',lv:4,n:'Guild shrine',d:'Pray once a day for a 20-minute blessing: +20% XP (wisdom) and regeneration.'},
  {k:'hall',lv:5,n:'Guild hall',d:'Room for 10 more members, and +5% XP in every skill for all members, anywhere.'}];
 const has=k=>{const b=BLD.find(x=>x.k===k);return!!(b&&G.ready&&glv(G.prog&&G.prog.qd)>=b.lv)};
 const rewTxt=r=>Object.entries(r).map(([k,n])=>n.toLocaleString()+' × '+nm(k)).join(', ');
 const hash=s=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};
 const choices=()=>Object.keys(QK);
 // ---- state ----
 const G={id:'',info:null,m:{},q:null,prog:{qd:0},perm:{o:-1,m:20},bank:{i:{},v:0},isl:{},wd:{},ready:false,log:[],inv:{}};
 {try{const s=JSON.parse(LSG('sq_guild')||'null');if(s&&typeof s.id==='string'&&/^[a-z0-9]{6,16}$/.test(s.id)){G.id=s.id;G.info=s.info||null;G.isl=s.isl||{}}}catch(e){}}
 const keep=()=>LSS('sq_guild',G.id?JSON.stringify({id:G.id,info:G.info,isl:G.isl}):null);
 const role=()=>G.id&&G.m&&on()&&G.m[me()]?G.m[me()].r:'';
 const boss=()=>role()==='l'||role()==='o';
 const members=()=>Object.entries(G.m||{}).map(([u,v])=>Object.assign({u},v)).sort((a,b)=>('lom'.indexOf(a.r)-'lom'.indexOf(b.r))||((a.j||0)-(b.j||0)));
 const col=()=>COLS[(G.info&&G.info.col)|0]||COLS[0];
 // ---- the island ----
 const IW=56,IH=44,PAD=8;
 const isleId=()=>G.id?'gi_'+G.id:'';
 function islandGen(){return function*(D){const C=rgCtx(D),{W,H,T}=C,cx=W/2,cy=H/2;
   for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=(x+.5-cx)/(IW/2),dy=(y+.5-cy)/(IH/2),wob=.06*Math.sin(x*.7)+.05*Math.cos(y*.9),r=dx*dx+dy*dy;
    if(r<1-wob)T[y*W+x]=r>.78-wob?1:2}
   yield;rgDock(C,'e',1);yield;
   const bx=Math.round(cx)-1,by=Math.round(cy)-5;
   rgLm(C,'sign',bx-3,by,1,1,{use:'gboard',name:'Guild board'});
   rgLm(C,'chest',bx+3,by,1,1,{use:'gbank',name:'Guild bank'});
   rgLm(C,'gflag',bx,by-1,1,1,{name:'Guild banner'});
   rgLm(C,'firepit',bx,by+3,1,1,{});
   C.keepNear=[bx-4,by-2,bx+4,by+4];
   return rgFinish(C)}}
 let REG='';
 function register(){const id=isleId();if(REG&&REG!==id)unregister();if(!id||typeof WORLD_REGIONS==='undefined')return;
  const nmI=(G.info&&G.info.n?G.info.n:'Guild')+' Isle';
  if(!WORLD_REGIONS[id]){WORLD_REGIONS[id]={id,name:nmI,width:IW+PAD*2,height:IH+PAD*2,seed:300.5+hash(id)%9000,generationVersion:1,biome:'Your guild\'s own island',lv:'any',dir:'north-east',custom:true,guild:true};
   if(!ROUTE_ORDER.includes(id))ROUTE_ORDER.push(id);REGION_SPAWNS[id]={maxEnemies:0};RG_LMCOUNT[id]=0;try{WM_POS[id]=[318,96];WM_ROUTE[id]={from:'Tidewatch',post:'tidewatch'}}catch(e){}
   RG_GENS[id]=islandGen();RG_GEN[id]=D=>rgRunSync(RG_GENS[id](D))}
  else WORLD_REGIONS[id].name=nmI;REG=id}
 function unregister(){const id=REG;if(!id)return;let here='';try{here=curRegion()}catch(e){}if(here===id)return;
  const j=ROUTE_ORDER.indexOf(id);if(j>=0)ROUTE_ORDER.splice(j,1);delete RG_GEN[id];delete RG_GENS[id];try{delete RG_CACHE[id];if(ROOMS['reg_'+id])delete ROOMS['reg_'+id]}catch(e){}delete WORLD_REGIONS[id];REG=''}
 {const _ro=routeOpen;routeOpen=function(id){if(id&&id===REG)return true;if(/^gi_/.test(id||''))return false;return _ro.apply(this,arguments)}}
 // Houses/castles on the guild island (067's SQRH, rg 'gi_<g>'): 067's applySave drops houses on regions it doesn't know, and a
// save loads before the database says which guild you're in (on another device there's no sq_guild yet), so a house on the
// guild island vanished on load and the next save lost it for good. Now the island in the save is registered before the
// save is read. A house on the island of a guild you're no longer in is packed into the bag (house/castle, furniture, chest
// and yard contents), here on load and when you leave.
const GIRX=/^gi_([a-z0-9]{6,16})$/;
function packRaw(e){const add=(k,n)=>{if(k&&INAME[k])inv[k]=(inv[k]|0)+(n|0)};add(e.c?'castle':'house',1);
 for(const L of[e.f,e.yf])if(Array.isArray(L))for(const q of L){if(!Array.isArray(q)||typeof q[1]!=='string'||q[1]==='house'||q[1]==='castle')continue;add(q[1],1);
  if(q[2]&&typeof q[2]==='object')for(const k in q[2])if(INVK.includes(k))add(k,Math.max(0,Math.min(1e6,+q[2][k]||0)))}}
function packLeft(rg){const L=window.SQRH;if(!L)return 0;let n=0;for(let j=L.length-1;j>=0;j--){const h=L[j];if(h._foreign||h.rg!==rg)continue;
  const f=[...h.furn].map(([i,v])=>[i,v.t,v.items||null]),yf=[...(h.yf||new Map())].map(([i,v])=>[i,v.t,v.items||null]);L.splice(j,1);h.yf=new Map();h.yp=new Map();packRaw({c:h.castle?1:0,f,yf});n++}
 if(n){try{rhSolidSync()}catch(e){}}return n}
{const _ap=applySave;applySave=function(S){let orphan=[];try{const want=new Set();if(S&&Array.isArray(S.rh))for(const e of S.rh){const m=e&&GIRX.exec(String(e.rg||''));if(m)want.add(m[1])}
   const m2=S&&S.region&&GIRX.exec(String(S.region.id||''));if(m2)want.add(m2[1]);
   for(const gid of want){if(!G.id){G.id=gid;G.isl={};keep()}if(G.id===gid)register()}
   if(S&&Array.isArray(S.rh))orphan=S.rh.filter(e=>{const m=e&&GIRX.exec(String(e.rg||''));return m&&m[1]!==G.id})}catch(e){console.warn('guild load',e)}
  const out=_ap.apply(this,arguments);
  try{if(orphan.length){for(const e of orphan)packRaw(e);const m='Your '+(orphan.length>1?'homes':(orphan[0].c?'castle':'house'))+' on the island of a guild you left '+(orphan.length>1?'were':'was')+' packed into your bag with everything inside.';
    setTimeout(()=>{try{say(m);msgT=8;saveLocal(true);saveCloud(true)}catch(e){}},2500)}}catch(e){console.warn('guild pack',e)}return out}}
const onIsle=()=>{try{const R=SCENE&&SCENE.room;return!!(R&&R.region&&R.region===REG&&REG)}catch(e){return false}};
 // planted things in the room you stand in (and on every load of the island)
 function applyNodes(R){if(!R||!R.region||R.region!==REG)return;const W=R.w;
  for(let j=R.items.length-1;j>=0;j--){const it=R.items[j];if(it.t==='_obj'&&!it._gn){try{rgCellDel(R,it)}catch(e){}R.solid.delete(it.y*W+it.x);R.items.splice(j,1)}}// only what the guild planted grows here
  const want=G.isl||{},have=new Map();for(const it of R.items)if(it._gn)have.set(it.y*W+it.x,it);
  for(const[i,it]of have)if(want[i]!==it._gn){try{rgCellDel(R,it)}catch(e){}R.solid.delete(i);R.items.splice(R.items.indexOf(it),1);if(R.gone){const g=R.gone.findIndex(q=>q.it===it);if(g>=0)R.gone.splice(g,1)}}
  for(const k in want){const i=+k,key=want[k];if(!NODE[key]||have.get(i)&&have.get(i)._gn===key)continue;const x=i%W,y=(i/W)|0,t=NODE[key][1];
   const o={t,hp:OHP[t]||3};if(NODE[key][3])o.v=NODE[key][3];const it={t:'_obj',o,x,y,solid:true,_gn:key};R.items.push(it);R.solid.add(i);try{rgCellAdd(R,it)}catch(e){}}}
 // buildings: added at runtime by guild level (their spots are kept free of planting)
 function spots(R){const bx=Math.round(R.w/2)-1,by=Math.round(R.h/2)-5;
  return{forge:[{x:bx-6,y:by+3,st:'furnace'},{x:bx-5,y:by+3,st:'anvil'}],shrine:[{x:bx+6,y:by+3}],hall:[{x:bx-1,y:by-6,w:3,h:2}]}}
 function reserved(R,tx,ty){const S=spots(R);for(const k in S)for(const b of S[k])if(tx>=b.x-1&&tx<=b.x+(b.w||1)&&ty>=b.y-1&&ty<=b.y+(b.h||1))return true;return false}
 function applyBuildings(R){if(!R||!R.region||R.region!==REG)return;const W=R.w;
  for(let j=R.items.length-1;j>=0;j--){const it=R.items[j];if(!it._gb)continue;for(let b=0;b<(it.h||1);b++)for(let a=0;a<(it.w||1);a++)R.solid.delete((it.y+b)*W+it.x+a);
   try{rgCellDel(R,it)}catch(e){}R.items.splice(j,1);const u=(R.useItems||[]).indexOf(it);if(u>=0)R.useItems.splice(u,1)}
  const S=spots(R),add=it=>{it._gb=1;it.sh=it.h;R.items.push(it);(R.useItems=R.useItems||[]).push(it);for(let b=0;b<it.h;b++)for(let a=0;a<it.w;a++)R.solid.add((it.y+b)*W+it.x+a);try{rgCellAdd(R,it)}catch(e){}};
  if(has('forge'))for(const f of S.forge)add({t:'lm',k:'gstation',st:f.st,x:f.x,y:f.y,w:1,h:1,use:'gstation',name:f.st==='furnace'?'Guild furnace':'Guild anvil'});
  if(has('shrine'))add({t:'lm',k:'shrine',x:S.shrine[0].x,y:S.shrine[0].y,w:1,h:1,use:'gshrine',name:'Guild shrine'});
  if(has('hall'))add({t:'lm',k:'vault',x:S.hall[0].x,y:S.hall[0].y,w:3,h:2,use:'ghall',name:'Guild hall'});
  // guild boss portals (199/200), while this week's summoned boss is still standing
  if(window.SQGBOSS)for(const p of SQGBOSS.portals(R))add(p)}
 let BLV='';const bkey=()=>glv(G.prog&&G.prog.qd)+':'+(window.SQGBOSS?SQGBOSS.key():'');
 {const _lr=loadRegion;loadRegion=function(id,want,ret){const ok=_lr.apply(this,arguments);try{const R=SCENE&&SCENE.room;if(R&&R.region===REG&&REG){R._t64=1;applyNodes(R);applyBuildings(R);BLV=bkey()}}catch(e){console.warn('guild isle',e)}return ok}}
 // the banner: a pole and a flag in the guild's colour
 {const _df=drawFurn;drawFurn=function(it,tm){if(it&&it.t==='lm'&&it.k==='gflag'){const x=it.x*16+8,y=it.y*16+16,w=Math.sin((tm||0)*3)*1.2,c=col();
   Rg(x-1,y-30,2,30,'#5a4028');Rg(x-2,y-2,4,2,'#3a2818');g.beginPath();g.moveTo(x+1,y-30);g.lineTo(x+17+w,y-29);g.lineTo(x+14+w,y-24.5);g.lineTo(x+17+w,y-19);g.lineTo(x+1,y-19);g.closePath();g.fillStyle=c;g.fill();g.lineWidth=1;g.strokeStyle='#202020';g.stroke();
   const tag=G.info&&G.info.tag||'';if(tag){g.save();g.font='700 4px '+PF;g.fillStyle=c==='#e8e8e8'?'#202020':'#fff';g.textAlign='center';g.fillText(tag,x+8+w/2,y-23);g.restore()}return}
  if(it&&it.t==='lm'&&it.k==='gstation'){try{drawStation(it.st,it.x,it.y,{},tm)}catch(e){}return}
  if(it&&it.t==='lm'&&it.k==='gportal'){try{SQGBOSS.drawPortal(it,tm)}catch(e){}return}
  return _df.apply(this,arguments)}}
 // ---- database ----
 let OFF=[];const stopAll=()=>{for(const f of OFF)try{f()}catch(e){}OFF=[]};
 let started=false,meOff=null,invOff=null;
 function listen(gid){stopAll();G.ready=false;if(!gid)return;const d=DB();
  OFF.push(d.onValue(ref('guilds/'+gid),s=>{const v=s.val();
   if(!v||!v.m||!v.m[me()]){if(G.id===gid){const was=G.info&&G.info.n;leftGuild(was?'You are no longer in '+was+'.':'')}return}
   G.info=v.info||G.info;G.m=v.m||{};G.q=v.q||null;G.prog=v.prog||{qd:0};G.perm=Object.assign({o:-1,m:20},v.perm||{});G.bank=Object.assign({i:{},v:0},v.bank||{});G.bank.i=G.bank.i||{};G.isl=v.isl||{};G.wd=v.wd||{};G.boss=v.boss||null;G.turt=v.turt||null;G.ready=true;keep();register();
   try{const R=SCENE&&SCENE.room;if(R&&R.region===REG){applyNodes(R);if(BLV!==bkey()){BLV=bkey();applyBuildings(R)}}}catch(e){}
   pubLB();
   claimCheck();redraw()},e=>{}));
  OFF.push(d.onValue(ref('glog/'+gid),s=>{const v=s.val()||{};G.log=Object.entries(v).map(([id,o])=>Object.assign({id},o)).sort((a,b)=>(b.t||0)-(a.t||0)).slice(0,200);if(tab==='log')redraw()},()=>{G.log=null}))}
 function startDB(){if(started||!on())return;started=true;const d=DB();
  meOff=d.onValue(ref('gmem/'+me()),s=>{const gid=typeof s.val()==='string'?s.val():'';if(gid!==G.id||!G.ready){if(gid&&gid!==G.id){G.id=gid;G.isl={};keep()}if(!gid&&G.id){leftGuild('');return}if(gid)listen(gid)}redraw()});
  invOff=d.onValue(ref('ginv/'+me()),s=>{G.inv=s.val()||{};const ids=Object.keys(G.inv);if(ids.length&&!G.id)popInv(ids[0]);redraw()})}
 function stopDB(){started=false;stopAll();if(meOff){meOff();meOff=null}if(invOff){invOff();invOff=null}}
 function leftGuild(msg){const id=G.id;try{if(id&&packLeft('gi_'+id)){msg=(msg?msg+' ':'')+'Your home on the guild island was packed into your bag with everything inside.';setTimeout(()=>{try{saveLocal(true);saveCloud(true)}catch(e){}},1500)}}catch(e){}stopAll();G.id='';G.info=null;G.m={};G.q=null;G.isl={};G.bank={i:{},v:0};G.ready=false;keep();
  if(onIsle()){try{routeGo('hollow')}catch(e){}}setTimeout(unregister,1500);try{if(on())DB().set(ref('gmem/'+me()),null).catch(()=>{})}catch(e){}if(msg){say(msg);msgT=5}redraw()}
 let NOTE=null;const tell=t=>{say(t);NOTE={t,at:performance.now()};redraw()};
 const fail=e=>{try{console.warn('guild',e)}catch(x){}const m=String(e&&(e.code||e.message)||e);tell(/permission/i.test(m)?'Someone else in the guild changed this at the same moment. Try again.':'Could not reach the server. Try again.');sfx('swish')};
 const uid8=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
 // every bank change: the new counts, v+1 and a log entry, in one update (the rules refuse it if v moved meanwhile)
 function bankUpdate(changes,entry,extra){const B=G.bank||{i:{},v:0},i=Object.assign({},B.i||{}),up={},lid=uid8();
  for(const k in changes){const n=(i[k]|0)+changes[k];if(n<0)return Promise.reject(new Error('Not enough in the bank'));up['guilds/'+G.id+'/bank/i/'+k]=n>0?n:null;i[k]=n}
  up['guilds/'+G.id+'/bank/v']=(B.v|0)+1;up['guilds/'+G.id+'/bank/lid']=lid;up['glog/'+G.id+'/'+lid]=Object.assign({u:me(),n:myN(),t:TS()},entry);Object.assign(up,extra||{});
  return DB().update(ref(''),up)}
 // ---- actions ----
 function create(n,tag,c){n=String(n||'').replace(/\s+/g,' ').trim();tag=String(tag||'').toUpperCase().replace(/[^A-Z0-9]/g,'');c=Math.max(0,Math.min(COLS.length-1,c|0));
  if(!on()){tell('Sign in to found a guild.');return}if(G.id){tell('You are already in a guild.');return}
  if(!/^[A-Za-z0-9' ]{3,20}$/.test(n)){tell('Guild names are 3-20 letters, numbers or spaces.');sfx('swish');return}if(tag.length<2||tag.length>4){tell('The tag is 2-4 letters or numbers.');sfx('swish');return}
  if(GLD<COST){tell('Founding a guild costs '+COST.toLocaleString()+' gold.');sfx('swish');return}
  const low=n.toLowerCase().replace(/[^a-z0-9]/g,'_'),gid=Math.random().toString(36).slice(2,12).replace(/[^a-z0-9]/g,'x');const d=DB();
  d.get(ref('gname/'+low)).then(s=>{if(s.val()){tell('A guild with that name already exists.');sfx('swish');return}
   const up={};up['guilds/'+gid+'/info']={n,tag,col:c,lead:me(),t:TS()};up['guilds/'+gid+'/m/'+me()]={r:'l',n:myN(),j:TS()};up['guilds/'+gid+'/perm']={o:-1,m:20};up['guilds/'+gid+'/prog']={qd:0};
   up['gname/'+low]=gid;up['gmem/'+me()]=gid;
   return d.update(ref(''),up).then(()=>{GLD-=COST;G.id=gid;G.info={n,tag,col:c,lead:me()};G.isl={};keep();register();listen(gid);tell('You founded '+n+' ['+tag+']! Your guild island is charted: sail there from any harbor post.');msgT=7;sfx('quest');try{saveNow()}catch(e){}redraw()})}).catch(fail)}
 function invite(u){if(!boss()){tell('Only the leader and officers can invite.');return}if(G.m[u]){tell('They are already in your guild.');return}if(Object.keys(G.m).length>=maxM()){tell('Your guild is full ('+maxM()+').');return}
  DB().set(ref('ginv/'+u+'/'+G.id),{gn:G.info.n,tag:G.info.tag,by:me(),bn:myN(),t:TS()}).then(()=>{tell('Guild invite sent.');sfx('talk')}).catch(fail)}
 function accept(gid){if(G.id){tell('Leave your guild first.');return}const v=G.inv&&G.inv[gid];if(!v)return;const up={};up['guilds/'+gid+'/m/'+me()]={r:'m',n:myN(),j:TS()};up['gmem/'+me()]=gid;up['ginv/'+me()+'/'+gid]=null;
  DB().update(ref(''),up).then(()=>{G.id=gid;G.info={n:v.gn,tag:v.tag,col:0};keep();listen(gid);tell('You joined '+v.gn+' ['+v.tag+']! Sail to your guild island from any harbor post.');msgT=6;sfx('quest');redraw()}).catch(fail)}
 function decline(gid){DB().set(ref('ginv/'+me()+'/'+gid),null).catch(()=>{});hidePop()}
 function leave(){if(!G.id)return;const L=members(),others=L.filter(x=>x.u!==me()),up={};
  if(role()==='l'&&others.length){const nx=others.find(x=>x.r==='o')||others[0];up['guilds/'+G.id+'/info/lead']=nx.u;up['guilds/'+G.id+'/m/'+nx.u+'/r']='l'}
  if(!others.length){up['guilds/'+G.id]=null;up['glog/'+G.id]=null;up['gchat/'+G.id]=null;up['glb/'+G.id]=null;up['gname/'+G.info.n.toLowerCase().replace(/[^a-z0-9]/g,'_')]=null}else up['guilds/'+G.id+'/m/'+me()]=null;
  up['gmem/'+me()]=null;const n=G.info&&G.info.n;DB().update(ref(''),up).then(()=>leftGuild(others.length?'You left '+n+'.':'You left, and '+n+' was disbanded.')).catch(fail)}
 function setRole(u,r){const L=G.m[u];if(!L||u===me())return;const rr=role();if(rr!=='l'&&!(rr==='o'&&L.r==='m'&&r==='kick'))return;
  if(r==='kick'){DB().set(ref('guilds/'+G.id+'/m/'+u),null).then(()=>tell((L.n||'They')+' was removed from the guild.')).catch(fail);return}
  if(r==='lead'){const up={};up['guilds/'+G.id+'/info/lead']=u;up['guilds/'+G.id+'/m/'+u+'/r']='l';up['guilds/'+G.id+'/m/'+me()+'/r']='o';DB().update(ref(''),up).then(()=>tell((L.n||'They')+' leads the guild now.')).catch(fail);return}
  DB().set(ref('guilds/'+G.id+'/m/'+u+'/r'),r).catch(fail)}
 function setPerm(rk,v){if(role()!=='l')return;DB().set(ref('guilds/'+G.id+'/perm/'+rk),v).catch(fail)}
 function setInfo(k,v){if(role()!=='l')return;DB().set(ref('guilds/'+G.id+'/info/'+k),v).catch(fail)}
 // quests
 function pick(k){if(!boss()||G.q||!QK[k])return;const goal=QK[k].goal;
  DB().set(ref('guilds/'+G.id+'/q'),{k,goal,p:0,t:TS(),by:me()}).then(()=>{tell('New Guild Quest: '+QK[k].verb+'! Everyone in the guild helps, anywhere you play.');msgT=5;sfx('quest')}).catch(fail)}
 function cancelQ(){if(role()!=='l'||!G.q)return;DB().set(ref('guilds/'+G.id+'/q'),null).catch(fail)}
 let PEND=0,PK='',flushT=0,claiming=false;
 function flush(){if(!PEND||!G.q||G.q.done||!on())return;const n=PEND,k=PK;PEND=0;
  DB().runTransaction(ref('guilds/'+G.id+'/q'),cur=>{if(!cur)return cur;if(cur.k!==k||cur.done)return cur;cur.p=(cur.p|0)+n;cur.c=cur.c||{};cur.c[me()]=(cur.c[me()]|0)+n;if(cur.p>=cur.goal){cur.p=cur.goal;cur.done=1}return cur}).catch(()=>{PEND+=n})}
 let doneSaid='';
 function claimCheck(){const q=G.q;if(!q||!q.done||!G.ready)return;const key=G.id+':'+(q.t||0);if(doneSaid!==key){doneSaid=key;tell('Guild Quest complete! '+(boss()?'Pick the guild\'s reward in START > Guild.':'The leader or an officer picks the reward.'));msgT=6;try{sfx('quest')}catch(e){}}}
 function claim(i){const q=G.q;if(!boss()||!q||!q.done||claiming||!on()||!QK[q.k])return;const r=QK[q.k].rw[i|0];if(!r)return;claiming=true;const qd=(G.prog.qd|0)+1,up={};
  up['guilds/'+G.id+'/q']=null;up['guilds/'+G.id+'/prog/qd']=qd;up['guilds/'+G.id+'/prog/'+q.k]=((G.prog[q.k])|0)+1;
  bankUpdate(r,{w:'quest',k:q.k,d:rewTxt(r)},up).then(()=>{const nb=BLD.find(b=>b.lv===glv(qd));tell('The guild bank received '+rewTxt(r)+'. The guild is now level '+glv(qd)+' and '+QK[q.k].sk+' rank '+Math.min(RMAX,((G.prog[q.k])|0)+1)+'!'+(nb?' New: '+nb.n+'.':''));msgT=7;sfx('quest')}).catch(fail).finally(()=>{claiming=false})}
 // what members gather counts toward the quest: items arriving in a frame where the quest's skill gained XP (like 120's dailies)
 let LASTINV=null,XPF=new Set(),BONUSSAID=0;
 {const _ax=addXp;addXp=function(i,x){if(x>0&&G.id&&G.ready){let m=1;const k=Object.keys(QK).find(q=>SKN.indexOf(QK[q].sk)===i);if(k)m+=.1*rank(k);if(has('hall'))m+=.05;
   if(has('forge')&&onIsle()&&SKN[i]==='Smithing')m+=.2;if(m>1){arguments[1]=Math.round(x*m*100)/100}}const out=_ax.apply(this,arguments);if(x>0)XPF.add(i);return out}}
 // bank
 const wdToday=()=>{const w=G.wd&&G.wd[me()];return w&&w.d===day()?w.n|0:0};
 const wdLimit=()=>{const r=role();return r==='l'?-1:r==='o'?(G.perm.o==null?-1:G.perm.o):(G.perm.m==null?20:G.perm.m)};
 // deposit many kinds at once: one bank change, one log line
const bagFor=()=>Object.keys(inv).filter(k=>(inv[k]|0)>0&&INAME[k]&&!/^pet_|^eq_/.test(k)&&!NODE[k]).sort((a,b)=>String(INAME[a]).localeCompare(INAME[b]));
const GRP=[{k:'void',n:'void logs',f:k=>k==='voidlog'},{k:'fish',n:'raw fish',f:k=>window.SQTURT?SQTURT.RAW.includes(k):false},{k:'logs',n:'logs',f:k=>k==='wood'||/log$/.test(k)&&k!=='voidlog'},{k:'ore',n:'ores and bars',f:k=>/ore$|bar$/.test(k)||k==='iron'||k==='stone'}];
function depositMany(keys,what){if(!G.ready||!nearChest()){tell('Use the guild bank chest on your guild island.');return}const ch={};let n=0;for(const k of keys){const c=inv[k]|0;if(c>0){ch[k]=c;n+=c}}if(!n){tell('Nothing to put in.');return}
 for(const k in ch)inv[k]-=ch[k];const kinds=Object.keys(ch).length;
 bankUpdate(ch,{w:'dep',k:'*',d:n.toLocaleString()+' '+what+(kinds>1?' ('+kinds+' kinds)':'')}).then(()=>{tell('Put '+n.toLocaleString()+' '+what+' in the guild bank.');sfx('pickup');try{saveLocal(true)}catch(e){}})
  .catch(e=>{for(const k in ch)inv[k]=(inv[k]|0)+ch[k];fail(e)})}
function deposit(k,n){if(!G.ready||!nearChest()){tell('Use the guild bank chest on your guild island.');return}n=Math.min(n,inv[k]|0);if(n<=0||NODE[k])return;
  if(typeof EQK!=='undefined'&&EQK.includes(k)&&TLEQ(k)){tell('Take it off first.');return}
  inv[k]-=n;bankUpdate({[k]:n},{w:'dep',k,d:n}).then(()=>{tell('Deposited '+n+' '+nm(k)+'.');sfx('pickup');try{saveLocal(true)}catch(e){}}).catch(e=>{inv[k]=(inv[k]|0)+n;fail(e)})}
 const TLEQ=k=>false;
 function withdraw(k,n){if(!G.ready||!nearChest()){tell('Use the guild bank chest on your guild island.');return}if(NODE[k]){tell('Leaders and officers plant these on the island.');return}
  const lim=wdLimit(),used=wdToday();if(lim===0){tell('Your rank can\'t take things out of the guild bank.');sfx('swish');return}
  n=Math.min(n,(G.bank.i[k]|0),lim<0?1e9:lim-used);if(n<=0){tell(lim>0&&used>=lim?'You\'ve taken your '+lim+' for today.':'Nothing to take.');sfx('swish');return}
  const extra={};extra['guilds/'+G.id+'/wd/'+me()]={d:day(),n:used+n};
  bankUpdate({[k]:-n},{w:'wd',k,d:n},extra).then(()=>{inv[k]=(inv[k]|0)+n;tell('Took '+n+' '+nm(k)+'.');sfx('pickup');try{saveLocal(true)}catch(e){}}).catch(fail)}
 // planting: the tile in front of you on the guild island
 function frontCell(){const R=SCENE&&SCENE.room;if(!R)return null;const fx=P.x+face[0]*14,fy=P.y+face[1]*14+(face[1]>0?2:0),tx=Math.floor(fx/16),ty=Math.floor(fy/16);return{R,tx,ty,i:ty*R.w+tx}}
 function canPlant(){if(!onIsle())return'Stand on your guild island, facing where it should grow.';const c=frontCell();if(!c)return'Nowhere to plant.';const{R,tx,ty,i}=c;
  if(tx<1||ty<1||tx>=R.w-1||ty>=R.h-1)return'Too close to the edge.';const t=R.tiles[i];if(!RG_WALK[t]||t===0)return'It needs open ground.';
  if(R.solid.has(i)||rgObjAt(R,tx,ty))return'Something is already there.';if(G.isl&&G.isl[i])return'Something is already planted there.';
  for(const it of R.items)if(it.t==='lm'&&tx>=it.x-1&&tx<=it.x+(it.w||1)&&ty>=it.y-1&&ty<=it.y+(it.h||1))return'Too close to the guild\'s things.';
  if(reserved(R,tx,ty))return'That spot is kept free for guild buildings.';
  for(const[px,py]of R.pier||[])if(Math.abs(px-tx)<=2&&Math.abs(py-ty)<=2)return'Keep the pier clear.';
  if(Math.hypot(tx*16+8-P.x,ty*16+8-P.y)<6)return'Step back a little.';return''}
 function plant(k){if(!boss()){tell('Only the leader and officers can plant.');return}if(!NODE[k]||(G.bank.i[k]|0)<1)return;const why=canPlant();if(why){tell(why);sfx('swish');return}
  const{i}=frontCell(),extra={};extra['guilds/'+G.id+'/isl/'+i]=k;
  bankUpdate({[k]:-1},{w:'plant',k,d:1},extra).then(()=>{tell('You planted the '+nm(k).toLowerCase()+'. Everyone in the guild can gather it.');sfx('quest');closePanel()}).catch(fail)}
 function dig(){if(!boss()||!onIsle())return;const c=frontCell();const k=c&&G.isl&&G.isl[c.i];if(!k){tell('Face something the guild planted.');sfx('swish');return}
  const extra={};extra['guilds/'+G.id+'/isl/'+c.i]=null;bankUpdate({[k]:1},{w:'dig',k,d:1},extra).then(()=>{tell('Dug up the '+nm(k).toLowerCase()+'. It\'s back in the guild bank.');sfx('pickup')}).catch(fail)}
 // ---- guild horn, shrine, rename ----
 const LSN=(k,v)=>{if(v===undefined){const x=+LSG(k);return isFinite(x)?x:0}LSS(k,String(v))};
 function horn(){if(!has('horn')){tell('The guild horn comes with guild level 2.');return}if(onIsle()){tell('You are already on the guild island.');return}
  const left=180000-(Date.now()-LSN('sq_ghorn'));if(left>0){tell('The guild horn needs '+Math.ceil(left/1000)+' s to recharge.');return}
  if(dead||(typeof TRAVEL49!=='undefined'&&TRAVEL49)||(typeof SAILING!=='undefined'&&SAILING)||window.SQRSAIL&&SQRSAIL.on){tell('Not right now.');return}
  if(SCENE&&!(SCENE.room&&SCENE.room.region)){tell('Go outside first, then blow the horn.');return}
  register();LSN('sq_ghorn',Date.now());closePanel();say('You blow the guild horn...');try{sfx('quest')}catch(e){}routeGo(REG)}
 function pray(){if(!has('shrine'))return;const d=day();if(LSN('sq_gshrine')===d){tell('The shrine has blessed you today. Come back tomorrow.');return}
  LSN('sq_gshrine',d);const B=window.LUX&&LUX.BUFF;if(B){const t=performance.now()+20*60000;B.wis=Math.max(B.wis||0,t);B.regen=Math.max(B.regen||0,t)}
  say('The guild shrine blesses you: wisdom and regeneration for 20 minutes.');msgT=6;try{sfx('quest')}catch(e){}
  for(let k=0;k<24;k++){const a=k/24*6.283;try{part(P.x,P.y-8,Math.cos(a)*60,Math.sin(a)*40,.8,'#f8e070',-30,2)}catch(e){}}}
 function rename(n){if(role()!=='l')return;n=String(n||'').replace(/\s+/g,' ').trim();if(!/^[A-Za-z0-9' ]{3,20}$/.test(n)){tell('Guild names are 3-20 letters, numbers or spaces.');return}
  const I=G.info||{},cost=(I.rn|0)>0?RENAME:0;if(n===I.n){tell('That is already the name.');return}if(GLD<cost){tell('Renaming costs '+cost.toLocaleString()+' gold.');return}
  const low=n.toLowerCase().replace(/[^a-z0-9]/g,'_'),old=String(I.n||'').toLowerCase().replace(/[^a-z0-9]/g,'_'),d=DB();
  d.get(ref('gname/'+low)).then(sn=>{const cur=sn.val();if(cur&&cur!==G.id){tell('A guild with that name already exists.');return}
   const up={};up['guilds/'+G.id+'/info/n']=n;up['guilds/'+G.id+'/info/rn']=(I.rn|0)+1;if(!cur)up['gname/'+low]=G.id;if(old!==low)up['gname/'+old]=null;
   return d.update(ref(''),up).then(()=>{GLD-=cost;try{saveNow()}catch(e){}tell('Your guild is now called '+n+'.'+(cost?' ('+cost.toLocaleString()+' gold)':''));register();sfx('quest')})}).catch(fail)}
 // ---- guild chat ----
 const SEEN=new Set();let CHOFF=null,CHGID='';
 function chatListen(){const gid=G.ready?G.id:'';if(gid===CHGID)return;if(CHOFF){try{CHOFF()}catch(e){}CHOFF=null}CHGID=gid;SEEN.clear();if(!gid||!on())return;let first=true;
  CHOFF=DB().onValue(ref('gchat/'+gid),sn=>{const v=sn.val()||{},L=Object.entries(v).filter(([,o])=>o&&typeof o.m==='string').sort((a,b)=>(a[1].t||0)-(b[1].t||0));
   for(const[id,o]of L){if(SEEN.has(id))continue;SEEN.add(id);try{window.SQMPLOG&&SQMPLOG('gd',String(o.m).slice(0,80),{n:String(o.n||'?').slice(0,12),uid:o.u,t:o.t||0,me:o.u===me()});
     if(first){const lg=Mp().log;if(lg&&lg.length)lg[lg.length-1].at=-1e9}}catch(e){}}
   first=false;if(boss()){const cut=now()-864e5;for(const[id,o]of L)if((o.t||0)<cut)DB().set(ref('gchat/'+gid+'/'+id),null).catch(()=>{})}},()=>{})}
 window.SQGUILDSAY=t=>{t=String(t||'').trim().slice(0,80);if(!t)return;if(!G.id||!G.ready){try{SQMPLOG('game','You are not in a guild. Found or join one in START > Guild.')}catch(e){}return}
  if(window.SQMOD&&SQMOD.blockChat&&SQMOD.blockChat())return;
  DB().set(ref('gchat/'+G.id+'/'+uid8()),{u:me(),n:myN(),m:t,t:TS()}).catch(e=>{try{SQMPLOG('game','Guild message not sent. Try again.')}catch(x){}})};
 // ---- the guild leaderboard ----
 let LBK='';function pubLB(){if(!G.ready||!G.info||!on())return;const o={n:G.info.n,tag:G.info.tag,col:G.info.col|0,lv:glv(G.prog.qd),m:Object.keys(G.m).length},k=JSON.stringify(o);
  if(k===LBK)return;LBK=k;DB().set(ref('glb/'+G.id),o).catch(()=>{LBK=''})}
 let TOP=null,TOPAT=0;function loadTop(){if(!on()||performance.now()-TOPAT<15000&&TOP)return;TOPAT=performance.now();DB().get(ref('glb')).then(sn=>{const v=sn.val()||{};
   TOP=Object.entries(v).map(([id,o])=>Object.assign({id},o)).filter(o=>o&&o.n).sort((a,b)=>(b.lv|0)-(a.lv|0)||(b.m|0)-(a.m|0)).slice(0,50);redraw()}).catch(()=>{TOP=[];redraw()})}
 // ---- the island's board and bank chest ----
 let atChest=false;
 const nearChest=()=>{if(!onIsle())return false;const R=SCENE.room;return R.items.some(it=>it.use==='gbank'&&Math.hypot(it.x*16+8-P.x,it.y*16+8-P.y)<40)};
 {const _uf=useFurn;useFurn=function(it){if(it&&it.use==='gboard'){open('quest');return}if(it&&it.use==='gbank'){open('bank');return}if(it&&it.use==='ghall'){open('perks');return}
  if(it&&it.use==='gshrine'){pray();return}if(it&&it.use==='gtreant'){try{SQGBOSS.enter(it)}catch(e){console.warn(e)}return}if(it&&it.use==='gstation'){try{openStation({t:it.st,f:{}})}catch(e){}return}return _uf.apply(this,arguments)}}
 // ---- panel ----
 let tab='home',sel=-1;
 function open(t){tab=t||(G.id?'home':'home');pnOpen=true;ptab=GT;jx=jy=0;pn.style.display='block';rPn();sfx('talk');startDB()}
 const redraw=()=>{if(pnOpen&&ptab===GT)rPn()};
 SMI.splice(SMI.findIndex(x=>x.id==='options'),0,{id:'guild',l:()=>G.id&&G.info?'Guild ['+(G.info.tag||'')+']':'Guild'});
 {const _ss=showScreen;showScreen=function(id){if(id==='guild'){open(G.id?'home':'home');return}return _ss.apply(this,arguments)}}
 const st=document.createElement('style');st.textContent=`#pn .gdgtb{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 10px}#pn .gdgtb button{flex:1 1 auto;font:700 13px ${PF};padding:7px 8px;border:3px solid #485870;background:#f8f8f8;color:#404040;cursor:pointer}#pn .gdgtb button.on{background:#485870;color:#fff}
#pn .gdgh{display:flex;align-items:center;gap:10px;padding:10px;border:3px solid #485870;background:#fff;margin-bottom:6px}#pn .gdgh .gdfl{width:26px;height:34px;flex:none;clip-path:polygon(0 0,100% 0,100% 100%,50% 78%,0 100%)}
#pn .gdgh b{font-size:17px;color:#283c68}#pn .gdgr{display:flex;align-items:center;gap:8px;padding:7px 6px;border-bottom:1px solid #d8e0f0;color:#404040}#pn .gdgr .gdtx{flex:1;min-width:0;text-align:left}#pn .gdgr b{color:#283c68}#pn .gdgr .gdgi{flex:none}#pn .gdgr{text-align:left;justify-content:flex-start}#pn .gdgr small{display:block;font-size:12px;opacity:.75}
#pn .gdgr button{font:700 12px ${PF};padding:5px 8px;border:2px solid #485870;background:#f8f8f8;color:#404040;cursor:pointer}#pn .gdgr button:disabled{opacity:.45}
#pn .gdgbar{height:12px;border:2px solid #485870;background:#d8e0f0;margin:6px 0}#pn .gdgbar i{display:block;height:100%;background:#48b868}
#pn .gdgi{display:inline-block;width:20px;height:20px;text-align:center;font-size:16px;line-height:20px;image-rendering:pixelated;vertical-align:middle}
#pn .gdgcl{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}#pn .gdgcl button{width:30px;height:30px;border:3px solid #485870;cursor:pointer}#pn .gdgcl button.on{outline:3px solid #f8a020}
#pn .gdgf input{font:600 15px ${PF};padding:6px;border:3px solid #485870;width:100%;box-sizing:border-box;margin:4px 0 8px}
#gipop{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 150px);z-index:31;display:none;align-items:center;gap:8px;padding:8px 10px;max-width:calc(100vw - 24px);box-sizing:border-box;font:600 14px ${PF};background:#f8f0d8;color:#404040;border:4px solid #485870}
#gipop span{flex:1;min-width:0}#gipop button{font:700 13px ${PF};padding:7px 12px;border:3px solid #485870;background:#f8f8f8;color:#404040;cursor:pointer}#gipop .ok{background:#38a050;border-color:#185828;color:#fff}`;document.head.appendChild(st);
 let newCol=5;
 function html(){if(!on())return'<div class="tl">GUILD</div><div class="qc"><p>Sign in to play online, then you can found a guild or join one.</p></div>';
  if(!G.id){let h='<div class="tl">GUILD</div>';const inv=Object.entries(G.inv||{});
   for(const[gid,v]of inv)h+='<div class="qc"><b>Invite: '+esc(v.gn)+' ['+esc(v.tag)+']</b><p>'+esc(v.bn||'Someone')+' invited you to their guild.</p><button class="qb" data-g="acc:'+gid+'">Join</button> <button class="qb" data-g="dec:'+gid+'">No thanks</button></div>';
   h+='<div class="qc"><b>Found a guild</b><p>Your guild gets its own island that only members can sail to. Do Guild Quests together to fill the guild bank with ore veins, saplings, bushes and bait, then plant them to grow your island.</p>'+
    '<div class="gdgf"><small>Name (3-20 letters)</small><input id="gfn" maxlength="20" placeholder="The Hollow Wardens"><small>Tag (2-4 letters, shown next to your names)</small><input id="gft" maxlength="4" placeholder="HOLW" style="text-transform:uppercase"><small>Colour</small><div class="gdgcl">'+
    COLS.map((c,i)=>'<button data-g="col:'+i+'" class="'+(i===newCol?'on':'')+'" style="background:'+c+'" aria-label="Colour '+(i+1)+'"></button>').join('')+'</div></div>'+
    '<button class="qb" data-g="create"'+(GLD<COST?' disabled style="opacity:.5"':'')+'>Found it for '+COST.toLocaleString()+' gold</button>'+(GLD<COST?' <small>(you have '+GLD.toLocaleString()+')</small>':'')+'</div>'+
    '<div class="qc"><p>Or ask a guild\'s leader or an officer to invite you: walk up to them and they can pick INVITE TO GUILD.</p></div>';return h}
  if(!G.ready)return'<div class="tl">GUILD</div><div class="qc"><p>Loading your guild…</p></div>';
  const I=G.info||{},L=members(),lv=glv(G.prog.qd),r=role();
  let h='<div class="tl">GUILD</div><div class="gdgh"><div class="gdfl" style="background:'+col()+'"></div><div style="flex:1"><b>'+esc(I.n)+' ['+esc(I.tag)+']</b><br><small>Level '+lv+' · '+L.length+' member'+(L.length===1?'':'s')+' · you are '+ROLE[r]+'</small></div></div>';
  if(NOTE&&performance.now()-NOTE.at<8000)h+='<div class="qc" style="border-color:#c89020;background:#fff8e0"><b>'+esc(NOTE.t)+'</b></div>';
  const T=[['home','Members'],['quest','Quest'],['perks','Perks'],['bank','Bank']].concat(window.SQGBOSS?[['boss','Bosses']]:[]).concat(boss()?[['log','Log']]:[]).concat([['top','Top guilds']]).concat(r==='l'?[['set','Settings']]:[]);
  h+='<div class="gdgtb">'+T.map(([k,n])=>'<button data-g="tab:'+k+'" class="'+(tab===k?'on':'')+'">'+n+'</button>').join('')+'</div>';
  if(tab==='home'&&has('horn'))h+='<div class="qc"><b>Guild horn</b><p style="font-size:13px">Travel to the guild island from anywhere outdoors.</p><button class="qb" data-g="horn">Blow the horn</button></div>';
  if(tab==='home'){const P=Mp()&&Mp().players;
   for(const m of L){const rr=P&&P.get(m.u),onl=m.u===me()||(rr&&performance.now()-rr.seen<20000),where=m.u===me()?'You':onl?(rr.ar&&WORLD_REGIONS[rr.ar]?WORLD_REGIONS[rr.ar].name:'Online'):'Offline';
    let b='';if(m.u!==me()){if(r==='l'){b+=m.r==='m'?'<button data-g="role:'+m.u+':o">Make officer</button>':m.r==='o'?'<button data-g="role:'+m.u+':m">Make member</button>':'';b+=' <button data-g="role:'+m.u+':lead">Make leader</button>'}
     if(r==='l'||(r==='o'&&m.r==='m'))b+=' <button data-g="role:'+m.u+':kick">Remove</button>'}
    h+='<div class="gdgr"><span style="color:'+(onl?'#38a050':'#a0a8b8')+'">●</span><div class="gdtx"><b>'+esc(m.n||'Player')+'</b><small>'+ROLE[m.r]+' · '+esc(where)+'</small></div>'+b+'</div>'}
   h+='<p style="font-size:13px;opacity:.85">'+(boss()?'Invite players by walking up to them and choosing INVITE TO GUILD.':'Leaders and officers can invite new members.')+' Your guild island: sail there from any harbor post.</p><button class="qb" data-g="leave">Leave guild</button>'}
  else if(tab==='quest'){const q=G.q;
   if(q&&QK[q.k]){const K=QK[q.k],c=q.c||{},top=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,8),p=q.p|0;
    h+='<div class="qc"><b>'+K.n+(q.done?' ✓':'')+'</b><p>'+K.verb+'. Everyone in the guild counts, anywhere you play.</p><div class="gdgbar"><i style="width:'+Math.min(100,100*p/q.goal)+'%"></i></div><small>'+p.toLocaleString()+' / '+q.goal.toLocaleString()+' · you: '+((c[me()]|0)+PEND).toLocaleString()+'</small>'+
     (top.length?'<p><small>Top helpers: '+top.map(([u,n])=>esc((G.m[u]&&G.m[u].n)||'Player')+' '+n.toLocaleString()).join(' · ')+'</small></p>':'');
    if(q.done){h+='<p><b>Done! '+(boss()?'Pick one reward for the guild bank:':'The leader or an officer picks one of these rewards:')+'</b></p>';K.rw.forEach((r,i)=>{h+='<div class="gdgr">'+ic(Object.keys(r)[0])+'<div class="gdtx"><b>'+esc(rewTxt(r))+'</b></div>'+(boss()?'<button data-g="claim:'+i+'">Take this</button>':'')+'</div>'})}
    else h+='<p><small>When it\'s done, the leader or an officer picks one reward: '+esc(K.rw.map(rewTxt).join(' or '))+'.</small></p>'+(r==='l'?'<button class="qb" data-g="cancelq" style="margin-top:8px">Give up this quest</button>':'');
    h+='</div>'}
   else{h+='<div class="qc"><p>'+(boss()?'Pick the next Guild Quest. They are huge: the whole guild works on one together, and finishing it lets you pick a reward to plant on your island.':'Waiting for the leader or an officer to pick the next Guild Quest.')+'</p></div>';
    for(const k of choices()){const K=QK[k];
     h+='<div class="qc"><b>'+K.n+'</b><p>'+K.verb+' together.</p><small>Pick one reward when done: '+esc(K.rw.map(rewTxt).join(' or '))+'</small>'+(boss()?'<br><button class="qb" data-g="pick:'+k+'">Start this quest</button>':'')+'</div>'}}
   h+='<p style="font-size:12px;opacity:.75">Quests done: '+(G.prog.qd|0)+' · guild level '+glv(G.prog.qd)+'.</p>'}
  else if(tab==='bank'){const B=G.bank.i||{},keys=Object.keys(B).filter(k=>B[k]>0),nodes=keys.filter(k=>NODE[k]),items=keys.filter(k=>!NODE[k]),chest=nearChest(),lim=wdLimit();
   h+='<div class="qc"><b>To plant</b>'+(nodes.length?'':'<p>Nothing yet. Finish Guild Quests to get ore veins, saplings and bushes.</p>');
   for(const k of nodes)h+='<div class="gdgr">'+ic(k)+'<div class="gdtx"><b>'+nm(k)+' × '+B[k]+'</b><small>Grows into: '+NODE[k][1].replace('nutbush','nut bush')+'</small></div>'+(boss()?'<button data-g="plant:'+k+'">Plant in front of me</button>':'')+'</div>';
   h+=(boss()?'<p style="font-size:12px;opacity:.8">Stand on your guild island facing open ground, then tap Plant. <button class="qb" data-g="dig">Dig up what I\'m facing</button></p>':'<p style="font-size:12px;opacity:.8">The leader and officers plant these on the island.</p>')+'</div>';
   h+='<div class="qc"><b>Items</b>'+(chest?'':'<p style="font-size:12px;opacity:.8">Use the bank chest on your guild island to put things in or take them out.</p>')+
    (chest?'<p style="font-size:12px;opacity:.8">You can take out '+(lim<0?'any amount':lim===0?'nothing (your rank)':(Math.max(0,lim-wdToday()))+' more today')+'.</p>':'');
   for(const k of items)h+='<div class="gdgr">'+ic(k)+'<div class="gdtx"><b>'+esc(nm(k))+' × '+B[k]+'</b></div>'+(chest&&lim!==0?'<button data-g="wd:'+k+':1">Take 1</button><button data-g="wd:'+k+':10">10</button>':'')+'</div>';
   if(!items.length)h+='<p>Empty.</p>';
   if(chest){const bag=bagFor(),grp=GRP.map(g=>[g,bagFor().filter(g.f)]).filter(x=>x[1].length);
    h+='<b style="display:block;margin-top:10px">Your bag</b>'+(bag.length?'<div class="gdgtb" style="margin:6px 0">'+grp.map(([g2,L])=>'<button data-g="depg:'+g2.k+'">Put in all '+g2.n+' ('+L.reduce((n,k)=>n+(inv[k]|0),0).toLocaleString()+')</button>').join('')+
     '<button data-g="depall">Put in everything</button></div>':'');
    for(const k of bag)h+='<div class="gdgr">'+ic(k)+'<div class="gdtx"><b>'+esc(nm(k))+' × '+inv[k]+'</b></div><button data-g="dep:'+k+':1">Put in 1</button><button data-g="dep:'+k+':all">All</button></div>'}
   h+='</div>'}
  else if(tab==='perks'){h+='<div class="qc"><b>Skill ranks</b><p style="font-size:13px">Every finished Guild Quest ranks the guild up in that skill (up to '+RMAX+'). Each rank gives every member <b>+10% XP</b> and a <b>10% chance of an extra item</b> each time they gather with that skill, anywhere.</p>';
   for(const k in QK){const rk=rank(k);h+='<div class="gdgr"><div class="gdtx"><b>'+QK[k].sk+' rank '+rk+' / '+RMAX+'</b><small>'+(rk?'+'+rk*10+'% XP · '+rk*10+'% chance of an extra item':'Finish a '+QK[k].sk.toLowerCase()+' quest to start ranking up')+'</small></div><div class="gdgbar" style="width:90px;flex:none"><i style="width:'+rk/RMAX*100+'%"></i></div></div>'}
   h+='</div><div class="qc"><b>Buildings</b><p style="font-size:13px">The guild gains a level with every finished quest. Buildings appear on your guild island:</p>';
   for(const b of BLD){const ok=has(b.k);h+='<div class="gdgr"><span style="font-size:18px">'+(ok?'✅':'🔒')+'</span><div class="gdtx"><b>'+b.n+'</b> <small>'+(ok?'Built':'Guild level '+b.lv)+' · '+b.d+'</small></div></div>'}
   h+='</div><div class="qc"><b>Your island</b><p style="font-size:13px">Everything planted on the guild island grows back in a minute (four in the wild), and only your guild can use it.</p></div>'}
  else if(tab==='boss'&&window.SQGBOSS){h+=SQGBOSS.html()}
  else if(tab==='top'){loadTop();h+='<div class="qc"><b>Top guilds</b>';if(!TOP)h+='<p>Loading…</p>';else if(!TOP.length)h+='<p>No guilds yet.</p>';
   (TOP||[]).forEach((o,i)=>{h+='<div class="gdgr"'+(o.id===G.id?' style="background:#fff8e0"':'')+'><b style="width:26px">'+(i+1)+'</b><div class="gdfl" style="width:14px;height:18px;background:'+(COLS[o.col|0]||COLS[0])+';clip-path:polygon(0 0,100% 0,100% 100%,50% 78%,0 100%)"></div><div class="gdtx"><b>'+esc(o.n)+' ['+esc(o.tag)+']</b><small>Level '+(o.lv|0)+' · '+(o.m|0)+' member'+((o.m|0)===1?'':'s')+'</small></div></div>'});h+='</div>'}
  else if(tab==='log'&&boss()){h+='<div class="qc"><b>Bank log</b><p style="font-size:12px;opacity:.8">Every deposit, withdrawal, planting and quest reward. Only the leader and officers see this.</p>';
   if(G.log===null)h+='<p>The log needs the latest database rules.</p>';else if(!G.log.length)h+='<p>Nothing yet.</p>';
   for(const e of (G.log||[]).slice(0,120)){const W={dep:'put in',wd:'took',plant:'planted',dig:'dug up',quest:'quest reward:',boss:'woke a guild boss with'}[e.w]||e.w;const when=e.t?new Date(e.t).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'';
    h+='<div class="gdgr"><div class="gdtx"><b>'+esc(e.n||'Player')+'</b> '+W+' '+(e.w==='quest'||typeof e.d==='string'?esc(e.d):esc(e.d)+' × '+esc(nm(e.k)))+'<small>'+esc(when)+'</small></div></div>'}h+='</div>'}
  else if(tab==='set'&&r==='l'){const opt=(rk,vals)=>vals.map(v=>'<button data-g="perm:'+rk+':'+v+'" class="'+((G.perm[rk]==null?(rk==='o'?-1:20):G.perm[rk])===v?'on':'')+'">'+(v<0?'No limit':v===0?'None':v+' a day')+'</button>').join('');
   h+='<div class="qc"><b>Taking from the bank</b><p style="font-size:13px">How many items each rank can take out of the guild bank per day. Everything is in the log.</p><small>Officers</small><div class="gdgtb">'+opt('o',[-1,100,20,0])+'</div><small>Members</small><div class="gdgtb">'+opt('m',[50,20,5,0])+'</div></div>'+
    '<div class="qc"><b>Name</b><p style="font-size:13px">'+((I.rn|0)>0?'Renaming costs '+RENAME.toLocaleString()+' gold.':'Your first rename is free.')+'</p><div class="gdgf"><input id="grn" maxlength="20" value="'+esc(I.n)+'"></div><button class="qb" data-g="rename">'+((I.rn|0)>0?'Rename for '+RENAME.toLocaleString()+' gold':'Rename (free)')+'</button></div>'+
    '<div class="qc"><b>Colour</b><div class="gdgcl">'+COLS.map((c,i)=>'<button data-g="scol:'+i+'" class="'+(i===(I.col|0)?'on':'')+'" style="background:'+c+'" aria-label="Colour '+(i+1)+'"></button>').join('')+'</div></div>'}
  return h}
 {const _r=rPn;rPn=function(){if(ptab===GT){try{panelChrome('')}catch(e){}pbd.innerHTML=html();return}return _r.apply(this,arguments)}}
 {const _oc=pbd.onclick;pbd.onclick=e=>{if(ptab!==GT)return _oc(e);const b=e.target.closest('[data-g]');if(!b||b.disabled)return;const[a,x,y]=b.dataset.g.split(':');
   if(a==='tab'){tab=x;rPn();return}if(a==='col'){newCol=+x;const n=document.getElementById('gfn').value,t=document.getElementById('gft').value;rPn();document.getElementById('gfn').value=n;document.getElementById('gft').value=t;return}
   if(a==='create'){create(document.getElementById('gfn').value,document.getElementById('gft').value,newCol);return}
   if(a==='acc')return accept(x);if(a==='dec'){decline(x);return}if(a==='leave'){if(b.dataset.sure){leave();return}b.dataset.sure=1;b.textContent=role()==='l'&&members().length>1?'Sure? An officer will lead':'Tap again to leave';return}
   if(a==='role')return setRole(x,y);if(a==='pick')return pick(x);if(a==='claim')return claim(+x);if(a==='cancelq'){if(b.dataset.sure){cancelQ();return}b.dataset.sure=1;b.textContent='Tap again to give up';return}
   if(a==='depg'){const g2=GRP.find(q=>q.k===x);if(g2)depositMany(bagFor().filter(g2.f),g2.n);return}if(a==='depall'){if(b.dataset.sure){depositMany(bagFor(),'items');return}b.dataset.sure=1;b.textContent='Tap again: put in EVERYTHING';return}
   if(a==='plant')return plant(x);if(a==='dig')return dig();if(a==='dep')return deposit(x,y==='all'?(inv[x]|0):+y);if(a==='wd')return withdraw(x,+y);
   if(a==='horn')return horn();if(a==='rename'){const v=document.getElementById('grn').value;if(b.dataset.sure||((G.info.rn|0)===0)){rename(v);return}b.dataset.sure=1;b.textContent='Tap again: '+RENAME.toLocaleString()+' gold';return}
   if(a==='gtb'&&window.SQGBOSS)return SQGBOSS.act(x,y,b);
   if(a==='perm')return setPerm(x,+y);if(a==='scol')return setInfo('col',+x)}}
 // ---- invites: the player menu button and the pop-up ----
 window.SQGUILDPM=u=>{if(!G.id||!boss())return'';const inG=!!G.m[u];return'<button class="sb" data-pm="guild"'+(inG?' disabled style="opacity:.55"':'')+'>'+(inG?'IN YOUR GUILD ✓':'INVITE TO GUILD')+'</button>'};
 window.SQGUILDINVITE=u=>invite(u);
 const pop=document.createElement('div');pop.id='gipop';pop.innerHTML='<span></span><button class="ok">JOIN</button><button class="no">NO</button>';document.body.appendChild(pop);
 for(const ev of['touchstart','pointerdown','mousedown'])pop.addEventListener(ev,e=>e.stopPropagation());
 let popG='',popT=0;const hidePop=()=>{popG='';pop.style.display='none';clearTimeout(popT)};
 function popInv(gid){const v=G.inv[gid];if(!v||popG===gid)return;popG=gid;pop.querySelector('span').textContent=(v.bn||'Someone')+' invites you to the guild '+v.gn+' ['+v.tag+']!';pop.style.display='flex';clearTimeout(popT);popT=setTimeout(hidePop,45000);try{sfx('talk')}catch(e){}}
 pop.querySelector('.ok').onclick=()=>{const g2=popG;hidePop();if(g2)accept(g2)};pop.querySelector('.no').onclick=()=>{const g2=popG;hidePop();if(g2)decline(g2)};
 // ---- others' tags: [TAG] over their heads in their guild colour (presence gt/gc) ----
 (window.SQPEERFX=window.SQPEERFX||[]).push(r=>{if(!r||!r.gt)return;g.save();g.font='700 4px '+PF;g.textAlign='center';g.lineWidth=1.5;g.lineJoin='round';g.strokeStyle='#101418';const t='['+r.gt+']';
  g.strokeText(t,Math.round(r.x),Math.round(r.y-39));g.fillStyle=COLS[r.gc|0]||'#fff';g.fillText(t,Math.round(r.x),Math.round(r.y-39));g.restore()});
 window.SQGUILD={api:{on,bankUpdate,tell,fail,boss,role,redraw,onIsle,me,TS,now,ref,DB,applyBuildings:()=>{try{const R=SCENE&&SCENE.room;if(R&&R.region===REG&&REG){applyBuildings(R);BLV=bkey()}}catch(e){}},get rec(){return G.boss||null},get ready(){return G.ready}},pres:()=>G.id&&G.info&&G.ready?{t:String(G.info.tag||'').slice(0,4),c:(G.info.col|0)}:null,get id(){return G.id},get state(){return G},open,isle:isleId,NODE,QK,glv,COLS,
  test:{depositMany,bagFor,horn,pray,rename,pubLB,loadTop,applyBuildings,has,rank,create,invite,accept,leave,pick,flush,deposit,withdraw,plant,dig,setRole,setPerm,claimCheck,claim,applyNodes,listen,startDB,stopDB,frontCell,canPlant}};
 // ---- every frame: start/stop with the connection, count quest progress, flush it, keep the island registered ----
 if(G.id)try{register()}catch(e){}
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{
   if(on()&&!started)startDB();else if(!on()&&started)stopDB();
   const q=G.q;if(q&&!q.done&&QK[q.k]&&LASTINV){const si=SKN.indexOf(QK[q.k].sk);if(XPF.has(si)){let n=0;for(const k in inv){const v=(inv[k]|0)-(LASTINV[k]|0);if(v>0&&!NODE[k])n+=v}if(n>0){PEND+=n;PK=q.k}}}
   if(G.id&&G.ready&&LASTINV)for(const k in QK){const rk=rank(k);if(!rk||!XPF.has(SKN.indexOf(QK[k].sk)))continue;   // rank bonus: extra items
    for(const it in inv){const v=(inv[it]|0)-(LASTINV[it]|0);if(v<=0||NODE[it]||/^eq_|^pet_/.test(it))continue;let ex=0;for(let j=0;j<Math.min(v,50);j++)if(Math.random()<.1*rk)ex++;
     if(ex){inv[it]+=ex;if(!BONUSSAID||performance.now()-BONUSSAID>20000){BONUSSAID=performance.now();say('Guild bonus: +'+ex+' '+nm(it)+'!')}}}}
   XPF.clear();LASTINV=Object.assign({},inv);
   if(onIsle()){const R=SCENE.room;for(const g2 of R.gone||[])if(g2.it&&g2.it._gn&&!g2._gf){g2._gf=1;g2.at-=180}}
   if(PEND&&(flushT-=dt)<=0){flushT=8;flush()}
   if(G.id&&!REG)register();chatListen();if(NOTE&&performance.now()-NOTE.at>8000&&NOTE.t){NOTE=null;redraw()}}catch(e){console.warn('guild',e)}return out}}
 // the guild pill on the HUD isn't needed: the tag sits over your name for others; the START menu shows Guild [TAG]
})();
