// ---------------------------------------------------------------- 51. Sailing and regional access: voyages, boat upgrades, departure posts
// Routes are now earned. Harbor posts at Tidewatch (the hub), Saltmere (the eastern departure) and Frosthollow (the
// northern bay) list every route; each region opens through a short voyage quest given at its departure post.
//   Briarwood   - own a sailboat + "The Western Route" (sail your boat to the buoy west of Tidewatch)
//   Ashfall     - "Into Briarwood" (find 3 landmarks) -> Reinforced Hull (built at Saltmere) -> "Eastern Waters" (buoy east of Saltmere)
//   Ironcrest   - "The High Pass" at Frosthollow: find the cairn north of town, then Mining 25 or 12 iron ore + 4 wolf pelts
//                 -> Mountain Passage Chart
//   Shattered   - "Charting the Isles" (a landmark in Ashfall and in Ironcrest) -> Deepwater Sail (sewn at Tidewatch)
//                 -> "The Southern Route" (buoy south of Hollow)
// Unlocks are permanent flags in travelUnlocks; quest progress lives in worldState.hollow.voy. Regions visited in an
// earlier version keep their map and landmarks but need the voyages like everyone else. The way home is always free.
const ROUTE_GATES51=true;
// --- placing posts, buoys and the cairn on the real map ---
const hwalk=(x,y)=>x>1&&y>1&&x<N-2&&y<N-2&&!_sol12(x*16+8,y*16+8)&&!BS.has(y*N+x)&&!obj[y*N+x];
function hStart(cx,cy){for(let r=0;r<10;r++)for(let b=-r;b<=r;b++)for(let a=-r;a<=r;a++)if(Math.max(Math.abs(a),Math.abs(b))===r&&hwalk(cx+a,cy+b))return[cx+a,cy+b];return[cx,cy]}
function hReach(cx,cy,lim){const[sx,sy]=hStart(cx,cy),seen=new Uint8Array(N*N),q=[sy*N+sx];seen[q[0]]=1;for(let k=0;k<q.length&&k<lim;k++){const i=q[k],x=i%N,y=(i/N)|0;
  for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b,j=Y*N+X;if(X<1||Y<1||X>=N-1||Y>=N-1||seen[j]||_sol12(X*16+8,Y*16+8))continue;seen[j]=1;q.push(j)}}return seen}
// size of the body of water each sea tile belongs to (posts go on the open sea, not on ponds)
const WSIZE=(()=>{const lab=new Int32Array(N*N).fill(-1),size=[];for(let s=0;s<N*N;s++){if(lab[s]>=0||tile[s]!==0)continue;const id=size.length,q=[s];lab[s]=id;
  for(let k=0;k<q.length;k++){const i=q[k],x=i%N,y=(i/N)|0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b,j=Y*N+X;if(X<0||Y<0||X>=N||Y>=N||lab[j]>=0||!isWaterT(X,Y))continue;lab[j]=id;q.push(j)}}size.push(q.length)}
 return i=>lab[i]>=0?size[lab[i]]:0})();
// a shore tile near (cx,cy), on foot from the town, next to open water, clear of houses and paths
function shorePost(cx,cy,R,prefer){const reach=hReach(cx,cy,20000);let best=null,bd=1e9;
 for(let y=cy-R;y<=cy+R;y++)for(let x=cx-R;x<=cx+R;x++){if(!hwalk(x,y)||!reach[y*N+x]||PROT.has(y*N+x))continue;
  let open=0;for(let b=-3;b<=3;b++)for(let a=-3;a<=3;a++)if(x+a>=0&&y+b>=0&&x+a<N&&y+b<N&&tile[(y+b)*N+x+a]===0)open++;
  const wet=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>tile[(y+b)*N+x+a]===0&&!BRIDGE.has((y+b)*N+x+a)&&WSIZE((y+b)*N+x+a)>400);if(!wet||open<14)continue;
  const d=Math.hypot(x-cx,y-cy)+(prefer?prefer(x,y):0);if(d<bd){bd=d;best={x,y}}}return best}
// open water reachable by boat from the Tidewatch pier, nearest to a target
// water a boat can reach from the shore by a harbor post (buoys must be sailable from where their voyage starts)
function boatWater(px,py){const seen=new Uint8Array(N*N),q=[];for(let b=-2;b<=2;b++)for(let a=-2;a<=2;a++){const x=px+a,y=py+b,j=y*N+x;if(x>=0&&y>=0&&x<N&&y<N&&tile[j]===0&&!seen[j]){seen[j]=1;q.push(j)}}
 for(let k=0;k<q.length;k++){const i=q[k],x=i%N,y=(i/N)|0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b,j=Y*N+X;if(X<0||Y<0||X>=N||Y>=N||seen[j]||!isWaterT(X,Y))continue;seen[j]=1;q.push(j)}}return seen}
function buoySpot(W,tx,ty){let best=null,bd=1e9;for(let y=2;y<N-2;y++)for(let x=2;x<N-2;x++){const i=y*N+x;if(!W[i]||tile[i]!==0)continue;let ok=true;for(let b=-2;b<=2&&ok;b++)for(let a=-2;a<=2;a++)if(!isWaterT(x+a,y+b)){ok=false;break}
  if(!ok)continue;const d=Math.hypot(x-tx,y-ty);if(d<bd){bd=d;best={x,y}}}return best}
const HARBOR_POSTS=[];if(RG_POST)HARBOR_POSTS.push({id:'tidewatch',name:'Tidewatch',x:RG_POST.x,y:RG_POST.y});
{const s=shorePost(TX,TY-6,12,(x,y)=>y>TY?20:0);if(s)HARBOR_POSTS.push({id:'saltmere',name:'Saltmere',x:s.x,y:s.y})}
if(FHON){const s=shorePost(FX,FY,18);if(s)HARBOR_POSTS.push({id:'frosthollow',name:'Frosthollow',x:s.x,y:s.y})}
const BUOYS=(()=>{const tw=HARBOR_POSTS.find(p=>p.id==='tidewatch'),sm=HARBOR_POSTS.find(p=>p.id==='saltmere'),A=tw?boatWater(tw.x,tw.y):new Uint8Array(N*N),B=sm?boatWater(sm.x,sm.y):A;
 return{west:buoySpot(A,0,tw?tw.y+2:WY),east:buoySpot(B,N-1,sm?sm.y-4:TY-12),south:buoySpot(A,tw?tw.x+6:N>>1,N-1)}})();
let CAIRN=null;if(FHON){const reach=hReach(FX,FY,20000*HSC*HSC);let bd=1e9;for(let y=2;y<FY-6;y++)for(let x=FX-14;x<=FX+14;x++){if(!hwalk(x,y)||!reach[y*N+x]||PROT.has(y*N+x))continue;
  if(FHDEN&&Math.hypot(x-FHDEN.x,y-FHDEN.y)<6)continue;const d=Math.hypot(x-(FX+6),y-3);if(d<bd){bd=d;CAIRN={x,y}}}}
function postHere(){if(SCENE){const R=SCENE.room;return R&&R.region?{id:'pier',name:WORLD_REGIONS[R.region].name,region:R.region}:null}for(const p of HARBOR_POSTS)if(Math.hypot(P.x-(p.x*16+8),P.y-(p.y*16+8))<14)return p;return null}

// --- voyages ---
const VOYS=[
 {id:'west',name:'The Western Route',post:'tidewatch',needs:[],req:()=>TL.boat>0,reqTxt:'own a sailboat (Ida sells one in Saltmere)',buoy:'west',gold:100,unlock:['briarwoodRoute'],
  d:'The harbor master wants proof you can find the western sea lane before she charts Briarwood Isle for you.',steps:['Sail your boat to the red buoy far west of Tidewatch','Report at the Tidewatch harbor post']},
 {id:'briar',name:'Into Briarwood',post:'tidewatch',report:'any',needs:['west'],gold:150,
  d:'Map the heart of Briarwood Isle so the captains know it\'s safe to land.',steps:['On Briarwood Isle, find the Elder Grove, the Whispering Ruins and Thornwater Lake','Report at any harbor post'],
  check:()=>['elder_grove','whispering_ruins','thornwater'].every(id=>rgSeen('briarwood',id))},
 {id:'east',name:'Eastern Waters',post:'saltmere',needs:['briar','@reinforcedHull'],buoy:'east',gold:150,unlock:['ashfallRoute'],
  d:'With a reinforced hull you can ride the eastern swell. Find the lane that leads to the Ashfall Coast.',steps:['Sail your boat to the red buoy east of Saltmere','Report at the Saltmere harbor post']},
 {id:'pass',name:'The High Pass',post:'frosthollow',needs:['west'],gold:120,unlock:['mountainPassage'],
  d:'An old trail over the northern cliffs leads to the Ironcrest sea lane. Find the cairn that marks it and clear the way.',steps:['Find the old cairn on the cliffs north of Frosthollow','Clear the rockfall: Mining 25, or bring 12 iron ore and 4 wolf pelts to the Frosthollow post'],
  cairn:true},
 {id:'isles',name:'Charting the Isles',post:'tidewatch',report:'any',needs:['east','pass'],gold:200,
  d:'The navigators want a landmark charted in both of the newer lands before anyone tries the deep southern waters.',steps:['Discover a landmark on the Ashfall Coast and in the Ironcrest Highlands','Report at any harbor post'],
  check:()=>['ashfall','ironcrest'].every(r=>(WORLD_STATE[r]&&WORLD_STATE[r].seen||[]).length>0)},
 {id:'south',name:'The Southern Route',post:'tidewatch',needs:['isles','@deepwaterSail'],buoy:'south',gold:250,unlock:['shatteredRoute'],
  d:'Only a deepwater sail survives the southern currents. Find the lane to the Shattered Expanse.',steps:['Sail your boat to the red buoy far south of Hollow Island','Report at the Tidewatch harbor post']}];
const UPGRADES=[{id:'reinforcedHull',name:'Reinforced Hull',post:'saltmere',needs:['briar'],cost:{wood:30,ibar:6,nails:20},d:'Iron-banded planking for the eastern swell. A permanent boat upgrade.'},
 {id:'deepwaterSail',name:'Deepwater Sail',post:'tidewatch',needs:['isles'],cost:{sbar:4,pelt:6,wood:20},d:'A heavy, steel-rigged sail for the southern currents. A permanent boat upgrade.'}];
const VQ=()=>{const h=WORLD_STATE.hollow||(WORLD_STATE.hollow={});return h.voy||(h.voy={})};
const vDone=id=>id[0]==='@'?!!TRAVEL_UNLOCKS[id.slice(1)]:VQ()[id]===99;
const vNeedsOK=q=>q.needs.every(vDone)&&(!q.req||q.req());
const vName=id=>id[0]==='@'?(UPGRADES.find(u=>u.id===id.slice(1))||{}).name:(VOYS.find(v=>v.id===id)||{}).name;
// what each route needs (shown on locked routes)
function routeReq(id){const U=TRAVEL_UNLOCKS,r=[];
 if(id==='briarwood')r.push({t:'a sailboat',ok:TL.boat>0},{t:'The Western Route',ok:!!U.briarwoodRoute});
 if(id==='ashfall')r.push({t:'Into Briarwood',ok:vDone('briar')},{t:'Reinforced Hull',ok:!!U.reinforcedHull},{t:'Eastern Waters (from Saltmere)',ok:!!U.ashfallRoute});
 if(id==='ironcrest')r.push({t:'The High Pass (from Frosthollow)',ok:vDone('pass')},{t:'Mountain Passage Chart',ok:!!U.mountainPassage});
 if(id==='shattered')r.push({t:'Charting the Isles',ok:vDone('isles')},{t:'Deepwater Sail',ok:!!U.deepwaterSail},{t:'The Southern Route',ok:!!U.shatteredRoute});
 if(id==='nomans')r.push({t:'Into Briarwood',ok:vDone('briar')},{t:'Lawless Waters (from Tidewatch)',ok:!!U.nomansRoute});
 return r}
routeOpen=function(id){const D=WORLD_REGIONS[id];if(!D)return false;if(id==='hollow')return true;if(!RG_GEN[id])return false;if(!ROUTE_GATES51)return true;
 const U=TRAVEL_UNLOCKS,flags={briarwood:U.briarwoodRoute,ashfall:U.ashfallRoute&&U.reinforcedHull,ironcrest:U.mountainPassage,shattered:U.shatteredRoute&&U.deepwaterSail,nomans:U.nomansRoute};
 return!!flags[id]};   // only the permanent travelUnlocks flags open a route (regions visited before v63 keep their map, not their access)
// --- progress: buoys, the cairn, landmark checks ---
function vAdvance(q,msgTxt){const V=VQ();V[q.id]=(V[q.id]||1)+1;say(msgTxt||('Quest updated: '+q.name+' - '+q.steps[V[q.id]-1]));msgT=5;sfx('quest');saveLocal(true);saveCloud(true)}
let VTICK=0;
const _u51=upd;upd=function(dt){_u51(dt);if(menuOpen||pnOpen||dead||TRAVEL49||(VTICK-=dt)>0)return;VTICK=.25;const V=VQ();
 for(const q of VOYS){if(V[q.id]!==1)continue;
  if(q.buoy&&!SCENE&&SAILING){const b=BUOYS[q.buoy];if(b&&Math.hypot(P.x-(b.x*16+8),P.y-(b.y*16+8))<36)vAdvance(q,'You reach the buoy and chart the sea lane. Now report back.')}
  else if(q.cairn&&!SCENE&&CAIRN&&Math.hypot(P.x-(CAIRN.x*16+8),P.y-(CAIRN.y*16+8))<26)vAdvance(q,'The cairn marks a buried trail, blocked by a rockfall. Report at the Frosthollow post.');
  else if(q.check&&q.check())vAdvance(q,q.name+': done! Report at any harbor post.')}};
function vComplete(q){const V=VQ(),before=ROUTE_ORDER.filter(r=>routeOpen(r));V[q.id]=99;GLD+=q.gold;for(const k of q.unlock||[])TRAVEL_UNLOCKS[k]=true;
 const opened=ROUTE_ORDER.filter(r=>routeOpen(r)&&!before.includes(r));
 say(q.name+' complete! +'+q.gold+' gold'+(opened.length?'. Route charted: '+opened.map(r=>WORLD_REGIONS[r].name).join(', ')+'!':''));msgT=6;sfx('quest');saveNow()}
function voyAct(a){const[k,id]=a.split(':'),p=postHere();if(!p){closePanel();return}const V=VQ();
 if(k==='acc'){const q=VOYS.find(v=>v.id===id);if(!q||V[id]||!vNeedsOK(q)||q.post!==p.id)return;V[id]=1;say('New voyage: '+q.name+' - '+q.steps[0]);sfx('quest');saveNow()}
 else if(k==='rep'){const q=VOYS.find(v=>v.id===id);if(!q||V[id]!==q.steps.length)return;if(q.report!=='any'&&q.post!==p.id)return;
  if(q.id==='pass'){if(lvOf(2)<25){say('The rockfall needs Mining 25 - or bring 12 iron ore and 4 wolf pelts.');sfx('swish');return}say('You clear the rockfall with your pickaxe. The surveyor hands you the Mountain Passage Chart.')}
  vComplete(q)}
 else if(k==='hand'){const q=VOYS.find(v=>v.id===id);if(!q||q.id!=='pass'||V.pass!==2||p.id!=='frosthollow')return;if((inv.iron|0)<12||(inv.pelt|0)<4){say('You need 12 iron ore and 4 wolf pelts.');sfx('swish');return}
  inv.iron-=12;inv.pelt-=4;say('The surveyor\'s crew clears the rockfall and hands you the Mountain Passage Chart.');vComplete(q)}
 else if(k==='craft'){const u=UPGRADES.find(x=>x.id===id);if(!u||TRAVEL_UNLOCKS[u.id]||u.post!==p.id||!u.needs.every(vDone))return;
  if(!TL.boat){say('You need a sailboat to fit this to.');sfx('swish');return}
  for(const[c,n]of Object.entries(u.cost))if((inv[c]|0)<n){say('Not enough '+iname(c)+' ('+(inv[c]|0)+'/'+n+').');sfx('swish');return}
  for(const[c,n]of Object.entries(u.cost))inv[c]-=n;TRAVEL_UNLOCKS[u.id]=true;say(u.name+' fitted to your boat!');msgT=5;sfx('quest');saveNow()}
 rPn()}
// --- the harbor post panel: routes (with what each needs) + voyages and upgrades offered here ---
routesHTML=function(){const p=postHere()||{id:'tidewatch',name:'Tidewatch'},here=curRegion(),V=VQ();
 const row=(id,label,sub,ok)=>'<button class="sb rt49" data-r="'+id+'" style="opacity:'+(ok?1:.45)+';width:100%;text-align:left"'+(ok?'':' disabled')+'>'+label+'<br><small>'+sub+'</small></button>';
 let h='<div class="tl">'+(p.id==='pier'?p.name+' pier':p.name+' harbor post')+'</div><div class="qc"><p>'+(p.id==='pier'?'Your boat waits at the pier. The way home is always free.':p.id==='tidewatch'?'The hub of every sea route. Return trips are always free.':'A departure point for the '+(p.id==='saltmere'?'eastern':'northern')+' sea lanes. Every charted route sails from here too.')+'</p></div>';
 for(const id of ROUTE_ORDER){const D=WORLD_REGIONS[id];
  if(id===here)h+=row(id,D.name,'You are here',false);
  else if(id==='hollow')h+=row(id,'⛵ Hollow Island','Sail home to the '+(here==='hollow'?'island':'pier you left from')+' · free',true);
  else if(routeOpen(id))h+=row(id,'⛵ '+D.name,D.biome+' · lies '+D.dir+' · suggested combat '+D.lv,true);
  else h+=row(id,'🔒 '+D.name+' [LOCKED]','Needs: '+routeReq(id).map(r=>(r.ok?'✓ ':'☐ ')+r.t).join(' · '),false)}
 const cards=[];
 for(const q of VOYS){const st=V[q.id];const here2=q.post===p.id,repHere=st===q.steps.length&&(q.report==='any'||here2);
  if(st===99||(!st&&!here2))continue;if(!st&&!q.needs.every(vDone))continue;
  let b='';const step=s=>q.steps.map((t,i)=>'<br>'+(st===99||i<s-1?'✓ ':i===s-1?'▶ ':'· ')+t).join('');
  if(!st){const ok=!q.req||q.req();b=step(0)+'<br><button class="qb vq51" data-v="acc:'+q.id+'" style="opacity:'+(ok?1:.5)+'"'+(ok?'':' disabled')+'>'+(ok?'Accept voyage':'Needs: '+q.reqTxt)+'</button>'}
  else{b=step(st);if(repHere)b+='<br><button class="qb vq51" data-v="rep:'+q.id+'">'+(q.id==='pass'?'Clear the rockfall (Mining 25)':'Report')+'</button>'+(q.id==='pass'&&p.id==='frosthollow'?' <button class="qb vq51" data-v="hand:pass">Hand in 12 iron ore + 4 pelts</button>':'')}
  cards.push('<div class="qc" style="margin-top:8px"><b>'+(st?'Voyage: ':'New voyage: ')+q.name+'</b><p>'+q.d+'</p><small>Reward: '+q.gold+' gold'+(q.unlock?' · opens a sea route':'')+b+'</small></div>')}
 for(const u of UPGRADES){if(u.post!==p.id)continue;const have=!!TRAVEL_UNLOCKS[u.id],ready=u.needs.every(vDone),afford=Object.entries(u.cost).every(([c,n])=>(inv[c]|0)>=n);
  if(!ready&&!have)continue;cards.push('<div class="qc" style="margin-top:8px"><b>Boat upgrade: '+u.name+(have?' ✓':'')+'</b><p>'+u.d+'</p><small>'+(have?'Fitted to your boat.':'Cost: '+Object.entries(u.cost).map(([c,n])=>n+' '+iname(c)+' ('+(inv[c]|0)+')').join(', ')+
   '<br><button class="qb vq51" data-v="craft:'+u.id+'" style="opacity:'+(afford&&TL.boat?1:.5)+'">Build it</button>')+'</small></div>')}
 if(cards.length)h+='<div class="tl" style="margin-top:10px;font-size:13px">VOYAGES &amp; UPGRADES</div>'+cards.join('');
 return h};
const _oc51=pbd.onclick;pbd.onclick=e=>{const b=e.target.closest('.vq51');if(b){voyAct(b.dataset.v);return}const r=e.target.closest('.rt49');if(r&&r.disabled)return;_oc51(e)};
// locked routes can never be sailed, whatever calls routeGo
const _rg51=routeGo;routeGo=function(id){if(id!=='hollow'&&!routeOpen(id)){say('That route is not charted yet.');sfx('swish');return}_rg51(id)};
// --- quest log: voyages in progress ---
const _qh51=questsHTML;questsHTML=function(){const V=VQ(),act=VOYS.filter(q=>V[q.id]&&V[q.id]!==99),next=VOYS.filter(q=>!V[q.id]&&vNeedsOK(q));let h=_qh51();
 if(!act.length&&!next.length&&!VOYS.some(q=>V[q.id]===99))return h;
 h+='<div class="tl" style="margin-top:14px">Voyages</div>';
 for(const q of act)h+='<div class="qc"><b>'+q.name+'</b><p>▶ '+q.steps[V[q.id]-1]+'</p></div>';
 for(const q of next)h+='<div class="qrow">New voyage at the '+HARBOR_POSTS.find(p=>p.id===q.post).name+' harbor post: '+q.name+'</div>';
 const done=VOYS.filter(q=>V[q.id]===99);if(done.length)h+='<div class="qrow qd">✓ '+done.map(q=>q.name).join(' · ')+'</div>';
 const ups=UPGRADES.filter(u=>TRAVEL_UNLOCKS[u.id]);if(ups.length)h+='<div class="qrow qd">Boat: '+ups.map(u=>u.name).join(' · ')+'</div>';return h};
// --- drawing: the new posts, the buoys, the cairn; map markers ---
function drawBuoy51(x,y,tm,hot){const b=Math.sin(tm*2.4+x)*1.5;shd(x,y+5,12);Rg(x-5,y-2+b,10,7,O);Rg(x-4,y-1+b,8,5,'#d83a30');Rg(x-4,y+1+b,8,1,'#f4ecd8');Rg(x-1,y-14+b,2,12,O);g.fillStyle=hot?'#f8e070':'#f4ecd8';g.beginPath();g.moveTo(x+1,y-14+b);g.lineTo(x+8,y-11+b);g.lineTo(x+1,y-8+b);g.fill();
 if(hot){g.fillStyle='rgba(255,230,120,'+(.2+.15*Math.sin(tm*4))+')';g.beginPath();g.arc(x,y,16,0,6.283);g.fill()}}
function drawCairn51(x,y){shd(x,y+5,14);for(const[a,b,w,h,c]of[[-7,-2,14,7,'#7a7a80'],[-5,-7,10,6,'#8a8a92'],[-3,-11,7,5,'#9a9aa4'],[-1,-14,3,4,'#aab']])Rg(x+a-1,y+b-1,w+2,h+2,O);
 for(const[a,b,w,h,c]of[[-7,-2,14,7,'#7a7a80'],[-5,-7,10,6,'#8a8a92'],[-3,-11,7,5,'#9a9aa4'],[-1,-14,3,4,'#aab']])Rg(x+a,y+b,w,h,c);Rg(x-6,y+3,12,1,'#e8eef8')}
const _lh51=LHOOK;LHOOK=(L,x0,y0,x1,y1,tm)=>{_lh51(L,x0,y0,x1,y1,tm);const inV=(x,y)=>x>=x0-2&&x<=x1+2&&y>=y0-2&&y<=y1+3,V=VQ();
 for(const p of HARBOR_POSTS)if(p.id!=='tidewatch'&&inV(p.x,p.y))L.push([p.y*16+13,4,()=>drawPost49(p.x*16+3,p.y*16+8,tm)]);
 for(const k in BUOYS){const b=BUOYS[k];if(b&&inV(b.x,b.y)){const q=VOYS.find(v=>v.buoy===k);L.push([b.y*16+12,4,()=>drawBuoy51(b.x*16+8,b.y*16+8,tm,V[q.id]===1)])}}
 if(CAIRN&&inV(CAIRN.x,CAIRN.y))L.push([CAIRN.y*16+13,4,()=>drawCairn51(CAIRN.x*16+8,CAIRN.y*16+10)])};
const _dmap51=drawMap;drawMap=function(){_dmap51();if(SCENE&&SCENE.room&&SCENE.room.region)return;const c=document.getElementById('mpc');if(!c)return;const x=c.getContext('2d'),V=VQ(),bl=Math.floor(performance.now()/350)%2;
 x.fillStyle='#58d8ff';for(const p of HARBOR_POSTS)x.fillRect(p.x-1,p.y-1,3,3);
 for(const q of VOYS)if(V[q.id]===1){const t=q.buoy?BUOYS[q.buoy]:q.cairn?CAIRN:null;if(t&&bl){x.fillStyle='#f83030';x.fillRect(t.x-1,t.y-1,3,3)}}};
const _mh51=mapHTML;mapHTML=function(){const h=_mh51();return SCENE&&SCENE.room&&SCENE.room.region?h:h.replace('<div class="tl" style="margin-top:10px">WORLD</div>','<div class="lg"><span><i style="background:#58d8ff"></i>Harbor post</span><span><i style="background:#f83030"></i>Voyage goal</span></div><div class="tl" style="margin-top:10px">WORLD</div>')};
const _wh51=worldHTML;worldHTML=function(){return _wh51().replace('harbor post on the Tidewatch pier','harbor posts at '+HARBOR_POSTS.map(p=>p.name).join(', '))};
