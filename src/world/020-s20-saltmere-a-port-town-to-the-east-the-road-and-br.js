// ---------------------------------------------------------------- 20. Saltmere (a port town to the east), the road and bridge, villagers' lives
// A road leaves Hollow Village to the east and crosses a long bridge to the port of Saltmere:
// a tackle shop, an inn, a master forge (steel tools), a fishing pier and townsfolk.
// Villagers in both towns have names, things to say that change with the time of day, a small
// request each day, and they go home to bed at night.
const TX=92*HSC,TY=54*HSC,TOWN_NAME='Saltmere';
const TOWNZ=new Set(),ROADS=new Set(),BRIDGE=new Set(),PROT=new Set(),SIGNS=new Map(),LAMPS=[],BOATS=[[TX-1,TY-10],[TX-5,TY-9]];
const WELL=[TX+9,TY+3];
const inTownBox=(x,y)=>x>=TX-13&&x<=TX+12&&y>=TY-12&&y<=TY+8;
const inTownTiles=(x,y)=>TOWNZ.has(y*N+x);
// --- shape the land ---
for(let y=TY-8;y<=TY+8;y++)for(let x=TX-13;x<=TX+12;x++){if(((x-TX+.5)/12.5)**2+((y-TY)/7.6)**2<=1){const i=y*N+x;TOWNZ.add(i);tile[i]=2;obj[i]=null}}
const tpath=(x,y)=>{const i=y*N+x;tile[i]=1;obj[i]=null;PROT.add(i)};
for(let x=TX-12;x<=TX+11;x++)tpath(x,TY);                       // main street
for(const x of[TX-7,TX,TX+7])tpath(x,TY-1);                      // shop doorsteps
for(let y=TY+1;y<=TY+5;y++)tpath(TX-4,y);for(let x=TX-7;x<=TX+5;x++)tpath(x,TY+5); // lane to the cottages
for(let y=TY-7;y<=TY-1;y++)tpath(TX-3,y);                         // path to the pier
for(let y=TY-12;y<=TY-8;y++){const i=y*N+TX-3;if(tile[i]===0)BRIDGE.add(i);tpath(TX-3,y)}  // the pier
// --- buildings ---
const TBLD=[
 {k:'tackle',tx:TX-9,ty:TY-3,w:5,wall:'#dce8f0',roof:'#2878a8',sc:'#f4f4f4',ic:'fish'},
 {k:'inn',tx:TX-2,ty:TY-3,w:5,wall:'#f0d8b0',roof:'#a83838',sc:'#e8c060',ic:'mug'},
 {k:'forge',tx:TX+5,ty:TY-3,w:5,wall:'#a8a0b0',roof:'#403850',sc:'#f08830',ic:'anvil',smoke:1},
 {k:'sm1',tx:TX-9,ty:TY+3,w:5,wall:'#f0e8d8',roof:'#3a8a68'},
 {k:'sm2',tx:TX-3,ty:TY+3,w:5,wall:'#e8dcc8',roof:'#c86838'},
 {k:'sm3',tx:TX+3,ty:TY+3,w:5,wall:'#f4ecdc',roof:'#6858a8'},
 {k:'hv1',tx:VX-10,ty:VY+4,w:5,wall:'#f0e0c0',roof:'#b85838'},
 {k:'hv2',tx:VX+6,ty:VY+4,w:5,wall:'#e8e0d0',roof:'#4878b0'}];
const TBK=new Set(TBLD.map(b=>b.k));
for(const b of TBLD){BLD.push(b);for(let y=b.ty;y<b.ty+2;y++)for(let x=b.tx;x<b.tx+b.w;x++){const i=y*N+x;tile[i]=2;obj[i]=null;PROT.add(i);if(!(x===b.tx+2&&y===b.ty+1))BS.add(i)}}
// Hollow Village gets two cottages on its south side, joined to the square by a lane
for(let x=VX-8;x<=VX+8;x++)tpath(x,VY+6);for(let y=VY+5;y<=VY+6;y++)tpath(VX,y);for(const x of[VX-8,VX+8])tpath(x,VY+6);
// lamps, a well, signposts
for(const[x,y]of[[TX-4,TY-1],[TX+3,TY-1],[TX-11,TY+1],[TX+10,TY+1]]){LAMPS.push([x,y]);BS.add(y*N+x);PROT.add(y*N+x)}
BS.add(WELL[1]*N+WELL[0]);PROT.add(WELL[1]*N+WELL[0]);
// --- the road: cheapest route from the village's east gate to Saltmere's west gate ---
{const sx=VX+11,sy=VY-2,ex=TX-13,ey=TY,INF=1e9,D4=[[1,0],[0,1],[-1,0],[0,-1]];
 for(let x=VX+9;x<=VX+11;x++)tpath(x,VY-2);
 const blocked=i=>{const x=i%N,y=(i/N)|0;if(x<2||y<2||x>N-3||y>N-3)return true;if(BS.has(i)||inVillage(x,y))return true;if(TOWNZ.has(i))return true;
  if(TRADER&&Math.abs(x-TRADER.x)<=2&&Math.abs(y-TRADER.y)<=2)return true;if(CAVE&&Math.abs(x-CAVE.x)<=1&&Math.abs(y-CAVE.y)<=2)return true;return false};
 const cost=i=>{const t=tile[i];let c=t===0?3.2:t===3?40:t===4||t===5?1.3:1;if(obj[i])c+=1.5;
  for(const[dx,dy]of D4)if(tile[i+dx+dy*N]===0&&t!==0)c+=.15;return c};       // stay a little away from shorelines
 const dist=new Float64Array(N*N*4).fill(INF),prev=new Int32Array(N*N*4).fill(-1),H=[];
 const push=(d,s)=>{H.push([d,s]);let k=H.length-1;while(k>0){const p=(k-1)>>1;if(H[p][0]<=H[k][0])break;[H[p],H[k]]=[H[k],H[p]];k=p}};
 const pop=()=>{const top=H[0],last=H.pop();if(H.length){H[0]=last;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<H.length&&H[l][0]<H[m][0])m=l;if(r<H.length&&H[r][0]<H[m][0])m=r;if(m===k)break;[H[m],H[k]]=[H[k],H[m]];k=m}}return top};
 const s0=(sy*N+sx)*4;dist[s0]=0;push(0,s0);let goal=-1;
 while(H.length){const[d,s]=pop();if(d>dist[s])continue;const i=s>>2,dir=s&3,x=i%N,y=(i/N)|0;if(x===ex-0&&y===ey){goal=s;break}
  for(let nd=0;nd<4;nd++){const nx=x+D4[nd][0],ny=y+D4[nd][1],ni=ny*N+nx;if(!(nx===ex&&ny===ey)&&(blocked(ni)))continue;
   const c=d+cost(ni)+(nd!==dir&&s!==s0?2.2:0),ns=ni*4+nd;if(c<dist[ns]){dist[ns]=c;prev[ns]=s;push(c,ns)}}}
 for(let s=goal;s>=0;s=prev[s]){const i=s>>2;if(tile[i]===0)BRIDGE.add(i);ROADS.add(i);tile[i]=1;obj[i]=null;PROT.add(i)}}
SIGNS.set((VY-3)*N+VX+10,'East: the port of Saltmere. Follow the road across the bridge.');
SIGNS.set((TY-1)*N+TX-12,'SALTMERE - port of the east. West: Hollow Village.');
for(const i of SIGNS.keys()){tile[i]=tile[i]===0?2:tile[i];obj[i]=null;BS.add(i);PROT.add(i)}
for(const i of TOWNZ)PROT.add(i);
for(const i of PROT)TG.delete(i);
// keep the road and towns clear: no regrowing trees, no tall grass, no building
function clearProt(){for(let j=REM.length-1;j>=0;j--)if(PROT.has(REM[j].i))REM.splice(j,1);for(const i of PROT){if(!SIGNS.has(i)&&!BS.has(i))obj[i]=null}
 for(const i of[...STR.keys()])if(PROT.has(i)){const s=STR.get(i);inv[s.t]=(inv[s.t]|0)+1;STR.delete(i)}
 for(const i of[...FARM.keys()])if(PROT.has(i))FARM.delete(i);
 for(const h of HOUSES){const tiles=[...houseTiles(h),h.y*N+h.x];if(!tiles.some(i=>PROT.has(i)))continue;for(const i of houseTiles(h))BS.delete(i);
  const fits=(x,y)=>{for(let dy=-2;dy<=1;dy++)for(let dx=-4;dx<=4;dx++){const tx=x+dx,ty=y+dy;if(tx<2||ty<2||tx>=N-2||ty>=N-2)return false;const i=ty*N+tx;if(tile[i]===0||obj[i]||BS.has(i)||STR.has(i)||PROT.has(i)||inVillage(tx,ty)||HOUSES.some(o=>o!==h&&houseAt(tx,ty)===o))return false}return true};
  let done=false;for(let r=1;r<40&&!done;r++)for(let dy=-r;dy<=r&&!done;dy++)for(let dx=-r;dx<=r&&!done;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;if(fits(h.x+dx,h.y+dy)){h.x+=dx;h.y+=dy;done=true}}
  addHouseBS(h)}
 if(!SCENE&&(solid(P.x-5,P.y-3)||solid(P.x+5,P.y+6))){P.x=SPX;P.y=SPY}}
const _cpl20=canPlace;canPlace=function(x,y){if(PROT.has(y*N+x)||inTownTiles(x,y))return false;return _cpl20(x,y)};
const _hf20=houseFits;houseFits=function(){const[x,y]=houseAnchor();for(let dy=-2;dy<=1;dy++)for(let dx=-3;dx<=3;dx++)if(PROT.has((y+dy)*N+x+dx))return false;return _hf20()};
const _ct20=canTill;canTill=function(x,y){return!PROT.has(y*N+x)&&_ct20(x,y)};
const _pb20=placeBuild;placeBuild=function(){if(BUILD&&!SCENE){const[x,y]=frontTile();if(BUILD.k==='house'?(()=>{const[ax,ay]=houseAnchor();for(let dy=-2;dy<=1;dy++)for(let dx=-3;dx<=3;dx++)if(PROT.has((ay+dy)*N+ax+dx))return true;return false})():PROT.has(y*N+x)){say('That\'s town land or the road. Build somewhere else.');sfx('swish');return}}_pb20()};
// --- rooms ---
const cottage=(floor,extra)=>({w:8,h:6,ex:4,floor,wall:'#f4e8d4',trim:'#8a6038',items:[{t:'window',x:2,y:0},{t:'window',x:5,y:0},{t:'rug',x:3,y:4,w:2},{t:'bed',x:1,y:2,sh:2,solid:1},...extra]});
Object.assign(ROOMS,{
 tackle:{w:9,h:7,ex:4,floor:['#c8d8e0','#bccad4'],wall:'#e8f0f4',trim:'#2878a8',items:[{t:'rack',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'shelf',x:6,y:0,w:3},{t:'rug',x:3,y:5,w:3},{t:'counter',x:1,y:3,w:4,solid:1},{t:'barrel',x:7,y:2,solid:1},{t:'barrel',x:8,y:2,solid:1},{t:'table',x:6,y:4,w:2,solid:1,goods:1},{t:'plant',x:8,y:5,solid:1}]},
 inn:{w:11,h:8,ex:5,floor:['#d8b888','#ccac7c'],wall:'#f4e4c8',trim:'#a83838',items:[{t:'shelf',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'window',x:7,y:0},{t:'counter',x:0,y:3,w:4,solid:1},{t:'barrel',x:0,y:2,solid:1},{t:'table',x:6,y:3,w:2,solid:1},{t:'table',x:8,y:5,w:2,solid:1},{t:'table',x:2,y:6,w:2,solid:1},{t:'bed',x:10,y:2,sh:2,solid:1},{t:'plant',x:10,y:6,solid:1},{t:'rug',x:4,y:6,w:3}]},
 forge:{w:9,h:7,ex:4,floor:['#a8a098','#9c948c'],wall:'#c8c0b8',trim:'#403850',items:[{t:'rack',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'rack',x:6,y:0,w:3},{t:'rug',x:3,y:5,w:3},{t:'counter',x:1,y:3,w:3,solid:1},{t:'furnace',x:7,y:2,solid:1},{t:'furnace',x:8,y:2,solid:1},{t:'anvil',x:6,y:4,solid:1},{t:'barrel',x:8,y:5,solid:1}]},
 sm1:cottage(['#d8c8a8','#ccbc9c'],[{t:'table',x:5,y:3,w:2,solid:1},{t:'barrel',x:7,y:2,solid:1}]),
 sm2:cottage(['#d0b890','#c4ac84'],[{t:'shelf',x:5,y:0,w:2},{t:'table',x:5,y:3,w:2,solid:1},{t:'plant',x:7,y:2,solid:1}]),
 sm3:cottage(['#e0d0b0','#d4c4a4'],[{t:'bed',x:6,y:2,sh:2,solid:1},{t:'table',x:3,y:2,w:2,solid:1}]),
 hv1:cottage(['#dcbc8c','#ceae7e'],[{t:'table',x:5,y:3,w:2,solid:1,goods:1},{t:'plant',x:7,y:2,solid:1}]),
 hv2:cottage(['#d8c098','#ccb48c'],[{t:'rack',x:5,y:0,w:2},{t:'table',x:5,y:3,w:2,solid:1},{t:'barrel',x:7,y:2,solid:1}])});
for(const id of TBK){const R=ROOMS[id];R.solid=new Set();for(const it of R.items)if(it.solid)for(let dy=0;dy<(it.sh||1);dy++)for(let dx=0;dx<(it.w||1);dx++)R.solid.add((it.y+dy)*R.w+it.x+dx)}
const _es20=enterScene;enterScene=function(id,house,ret){_es20(id,house,ret);const m={tackle:'Saltmere Tackle. It smells like the sea in here.',inn:'Welcome to the Gull\'s Rest inn!',forge:'The Saltmere Forge. Two furnaces roar.'}[id];
 if(m)say(m);else if(TBK.has(id)){const who=FOLK.filter(n=>n.room===id).map(n=>n.name);say(who.length?'This is '+who.join(' and ')+'\'s house.':'A cozy little house.')}};
// --- people ---
const mk=(o)=>Object.assign({x:o.hx0,y:o.hy0},o);
const FOLK=[
 mk({kind:'folk',id:'bea',name:'Farmer Bea',room:'hv1',door:[VX-8,VY+5],bed:[1,2],hx0:(VX-8)*16+8,hy0:(VY+7)*16+4,ch:{sk:1,hs:3,hc:2,sh:2,pn:2,ht:1,hcol:5,so:3}}),
 mk({kind:'folk',id:'finn',name:'Finn',room:'hv2',door:[VX+8,VY+5],bed:[1,2],hx0:(VX+8)*16+8,hy0:(VY+7)*16+4,ch:{sk:2,hs:1,hc:0,sh:0,pn:1,ht:0,hcol:0,so:2}}),
 mk({kind:'folk',id:'marina',name:'Marina',room:'sm1',door:[TX-7,TY+4],bed:[1,2],hx0:(TX-7)*16+8,hy0:(TY+1)*16+8,ch:{sk:3,hs:2,hc:0,sh:1,pn:0,ht:0,hcol:0,so:4}}),
 mk({kind:'folk',id:'tom',name:'Old Tom',room:'sm2',door:[TX-1,TY+4],bed:[1,2],hx0:(TX-1)*16+8,hy0:(TY+1)*16+8,ch:{sk:0,hs:0,hc:6,sh:7,pn:0,ht:2,hcol:2,so:2}}),
 mk({kind:'folk',id:'pip',name:'Pip',room:'sm3',door:[TX+5,TY+4],bed:[1,2],hx0:(TX+7)*16+8,hy0:(TY+1)*16+8,ch:{sk:4,hs:1,hc:4,sh:3,pn:1,ht:1,hcol:1,so:1}}),
 mk({kind:'folk',id:'nell',name:'Nell',room:'sm3',door:[TX+5,TY+4],bed:[6,2],hx0:(TX+3)*16+8,hy0:(TY+1)*16+8,ch:{sk:4,hs:3,hc:0,sh:4,pn:1,ht:0,hcol:0,so:3}}),
 mk({kind:'harbor',id:'ida',name:'Captain Ida',hx0:(TX-3)*16+8,hy0:(TY-6)*16+8,ch:{sk:2,hs:3,hc:6,sh:7,pn:0,ht:1,hcol:4,so:2}})];
NPCS.push(...FOLK);
NPCS.push({kind:'tackle',name:'Gil',scene:'tackle',x:3*16,y:2*16+10,ch:{sk:1,hs:0,hc:1,sh:1,pn:3,ht:2,hcol:3,so:3}},
 {kind:'inn',name:'Rosa',scene:'inn',x:2*16,y:2*16+10,ch:{sk:3,hs:3,hc:4,sh:6,pn:4,ht:0,hcol:0,so:1}},
 {kind:'forge',name:'Brann',scene:'forge',x:2.5*16,y:2*16+10,ch:{sk:3,hs:0,hc:0,sh:7,pn:2,ht:0,hcol:0,so:2}});
const nightNow=()=>{const p=time%DAYLEN;return p>DAYLIGHT+20&&p<DAYLEN-25};
const tod=()=>{const p=time%DAYLEN;return p<110?'m':p<DAYLIGHT-50?'d':p<=DAYLIGHT+20?'e':'n'};
// daily routine: walk home at nightfall and sleep; come back out in the morning
function goInside(n){n.scene=n.room+'#bed';n.goT=0;if(!SCENE&&Math.hypot(P.x-n.x,P.y-n.y)<120)sfx('door')}
function comeOut(n){n.scene=null;n.x=n.door[0]*16+8;n.y=(n.door[1]+1)*16+6;n.hx=n.hx0;n.hy=n.hy0;n.tx=n.hx0;n.ty=n.hy0;n.wt=0;n.goT=0}
const _roam20=roamNPCs;roamNPCs=function(dt){const night=nightNow();
 for(const n of FOLK){if(!n.room)continue;
  if(night){if(n.scene)continue;const dx=n.door[0]*16+8,dy=(n.door[1]+1)*16+3;n.goT=(n.goT||0)+dt;
   if(SCENE||Math.hypot(P.x-n.x,P.y-n.y)>260||n.goT>14||Math.hypot(n.x-dx,n.y-dy)<5)goInside(n);else{n.hx=dx;n.hy=dy;n.tx=dx;n.ty=dy;n.wt=1}}
  else if(n.scene===n.room+'#bed')comeOut(n)}
 _roam20(dt)};
// --- dialogue ---
const LINES={
 bea:{m:['Up with the sun! Crops don\'t water themselves.','Morning! Dew on the wheat means a good harvest.'],d:['If you till soil, water it every day. Plants grow only while the ground is wet.','A hoe and a watering can are all you need to start a farm. Make them yourself, or buy them at the general store.'],e:['The light\'s going. Time to check the fields one last time.','Supper soon. Fresh bread, if I\'m lucky.'],x:['Pumpkins take a skilled hand. Farming 15, if you ask me.']},
 finn:{m:['Morning! I\'m trying to be a woodcutter like my dad.','Did you know an iron axe chops trees much faster?'],d:['The road to Saltmere is new. The Elder had it built so we could trade with the port.','I tried to fish off the big bridge once. Caught my own boot.'],e:['Wolves come out at night in the snow up north. I stay home.','Campfires keep slimes away. That\'s what Mom says.'],x:['Someone says there\'s a cave in the northern mountains with a giant slime in it!']},
 marina:{m:['Fish bite best early. Or late. Or whenever, honestly.','Morning! The tide is in.'],d:['Out on the pier you can fish both sides. Bait from Gil\'s shop makes them bite faster.','Trout show up once you reach Fishing 10, salmon at 20. Swordfish? Only the best.'],e:['The sea turns gold in the evening. Prettiest thing there is.','Heading home soon. Nets don\'t mend themselves.'],x:['Gil pays more for fish than anyone in Hollow Village.']},
 tom:{m:['Arr, morning. These old bones creak like a ship\'s deck.','Sailed every sea there is, once. Now I sail this bench.'],d:['Brann at the forge makes steel tools. Bring steel bars and coin.','Rosa\'s fish stew at the inn will put meat back on your bones.'],e:['Red sky at night, sailor\'s delight.','The gulls are heading in. So am I.'],x:['Back in my day the Slime King was just a Slime Prince.']},
 pip:{m:['Hi! I\'m Pip! Wanna see my rock? ...It\'s a rock.','Mom says I can play on the pier if I don\'t fall in.'],d:['I\'m building a fossil collection! Skeletons in the desert drop bones, you know.','Captain Ida has a REAL ship. I\'m gonna be a captain too!'],e:['Is it bedtime already? No fair.','Fireflies come out at night. I\'m not allowed to stay up.'],x:['Want to race? Hold Shift to sprint! ...You win.']},
 nell:{m:['Morning. I\'m Nell. I build things around here.','Pip! Not too close to the water!'],d:['Half these houses I put up myself. Bricks, nails and good timber.','Lanterns keep the streets lit at night. I made every one.'],e:['Long day. Time to rest my hammer arm.','Did you see Pip? It\'s nearly dark.'],x:['If you\'ve got Crafting skills, I always need stone bricks and iron nails.']},
 ida:{m:['Morning, traveler. Saltmere harbor, at your service.','The tide is good today.'],d:['Saltmere trades with Hollow Village now that the bridge is done.','My ship needs work. Iron bars, nails, a lantern or two. I pay well.'],e:['Evening\'s the best time on the water. Calm as glass.','The lamps on the pier keep boats off the rocks.'],n:['I keep watch at night. Someone has to.','Stars are clear tonight. Good sailing tomorrow.'],x:['Best fishing on the island is off the end of this pier.']}};
function pickLine(n){const L=LINES[n.id]||{},seg=tod(),pool=[...(L[seg]||L.d||[]),...(Math.random()<.35?(L.x||[]):[])];return pool[Math.floor(Math.random()*pool.length)]||'Hello!'}
// --- daily requests ---
const val=k=>SELLP[k]||4;
const JOBS={
 bea:[{k:'berry',a:[6,12],s:3,x:8},{k:'wheat',a:[3,6],s:11,x:20,r:()=>!!TL.hoe},{k:'carrot',a:[3,5],s:11,x:30,r:()=>lvOf(11)>=5},{k:'pumpkin',a:[2,3],s:11,x:60,r:()=>lvOf(11)>=15}],
 finn:[{k:'wood',a:[10,20],s:1,x:6},{k:'stone',a:[8,15],s:2,x:8,r:()=>TL.pick>=1},{k:'cooked',a:[2,4],s:4,x:20}],
 marina:[{k:'berry',a:[5,8],s:3,x:8},{k:'shrimp',a:[4,8],s:9,x:12,r:()=>!!TL.rod},{k:'trout',a:[3,5],s:9,x:30,r:()=>lvOf(9)>=10},{k:'salmon',a:[2,4],s:9,x:50,r:()=>lvOf(9)>=20}],
 tom:[{k:'cooked',a:[2,4],s:4,x:20},{k:'cshrimp',a:[3,6],s:4,x:18,r:()=>!!TL.rod},{k:'ctrout',a:[2,4],s:4,x:35,r:()=>lvOf(4)>=10&&lvOf(9)>=10}],
 pip:[{k:'berry',a:[5,10],s:3,x:8},{k:'bone',a:[2,4],s:0,x:25,r:()=>(inv.bone|0)>0||lvOf(0)>=10},{k:'pelt',a:[1,2],s:0,x:40,r:()=>(inv.pelt|0)>0||lvOf(0)>=15},{k:'bowl',a:[2,3],s:6,x:20}],
 nell:[{k:'wood',a:[15,25],s:1,x:6},{k:'brick',a:[2,4],s:6,x:30,r:()=>lvOf(6)>=5},{k:'nails',a:[3,5],s:6,x:40,r:()=>lvOf(6)>=15}],
 ida:[{k:'wood',a:[12,20],s:1,x:6},{k:'ibar',a:[2,4],s:10,x:30,r:()=>(inv.ibar|0)>0||lvOf(10)>=5},{k:'nails',a:[2,4],s:6,x:40,r:()=>lvOf(6)>=15},{k:'lantern',a:[1,1],s:6,x:120,r:()=>lvOf(6)>=20}]};
let JOBD={};
const hsh=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return(h^(h>>>16))>>>0};
const today=()=>Math.floor(time/DAYLEN);
function jobFor(n){const pool=(JOBS[n.id]||[]).filter(j=>!j.r||j.r());if(!pool.length)return null;const d=today(),id=[...n.id].reduce((s,c)=>s+c.charCodeAt(0),0),h=hsh(d,id),j=pool[h%pool.length],amt=j.a[0]+(hsh(id,d)%(j.a[1]-j.a[0]+1));
 return{k:j.k,amt,s:j.s,xp:j.x*amt,g:Math.round(amt*val(j.k)*1.8)+10,done:JOBD[n.id]===d}}
const iname=(k,one)=>String((one?(SHORT[k]||INAME[k]):(SN[k]||INAME[k]))||k).toLowerCase();
// --- shops ---
const fishKeys=()=>FISH_T.flatMap(f=>[f.k,'c'+f.k]);
const TACKLE_P=k=>Math.round(val(k)*1.5),FORGE_P={ibar:30,sbar:75,idag:48,sdag:128};
TIT[4]='Steel';
const STEELC={g:120,b:3};
INVK.push('stew','bait');EXTRA_BAG.push('stew','bait');Object.assign(INAME,{stew:'Fish stew',bait:'Bait'});
Object.assign(IDESC,{stew:'Rosa\'s famous fish stew from the Gull\'s Rest. Fills you up and heals.',bait:'Fish bite much faster while you have bait. One is used each time you cast or catch.'});
Object.assign(SELLP,{stew:6,bait:1});Object.assign(SN,{stew:'Fish stews',bait:'Bait'});
FOODS.push({k:'stew',n:'fish stew',heal:3,hun:70});FOODS.sort((a,b)=>b.heal-a.heal||b.hun-a.hun);

let TALKN=null,TALKQ='';
const row=(act,label,sub,ok)=>'<button class="sb xb" data-a="'+act+'" style="opacity:'+(ok?1:.45)+'">'+label+'<br><small>'+sub+'</small></button>';
const head=(title,who,q)=>'<div class="tl">'+title+'</div><div class="qc"><b>'+esc(who)+'</b><p>"'+esc(q)+'"</p></div>';
function jobCard(n){const j=jobFor(n);if(!j)return'';const have=inv[j.k]|0;
 if(j.done)return'<div class="qc" style="margin-top:10px"><b>Today\'s request</b><p>Done. "Thanks again! Come back tomorrow."</p></div>';
 return'<div class="qc" style="margin-top:10px"><b>Today\'s request</b><p>Bring '+j.amt+' '+esc(iname(j.k,j.amt===1))+'. (You have '+have+')</p><p class="qr">Reward: '+j.g+' gold · '+j.xp+' '+SKN[j.s]+' XP</p>'+(have>=j.amt?'<button class="qb xb" data-a="job">Hand them over</button>':'<p style="opacity:.7">A new request every day.</p>')+'</div>'}
function folkHTML(n){let h=head(n.kind==='harbor'?'Saltmere Harbor':n.room&&n.room.startsWith('hv')?'Hollow Village':TOWN_NAME,n.name,TALKQ);
 const q=QS[Q.i];if(n.kind==='harbor'&&Q.on&&q&&q.type==='talk')h+='<div class="qc" style="margin-top:10px"><b>'+q.n+'</b><p>"Elder Rowan sent you? Welcome to Saltmere! Tell him the harbor is open for trade."</p></div>';
 return h+jobCard(n)}
function tackleHTML(){let h=head('Saltmere Tackle','Gil',TALKQ)+'<div class="tl" style="margin-top:8px">Gold: '+GLD+'</div><div class="tl" style="font-size:13px">BUY</div>';
 h+=row('bait10','10 bait','15 gold · fish bite much faster (you have '+(inv.bait|0)+')',GLD>=15)+row('bait50','50 bait','65 gold',GLD>=65);if(!TL.rod)h+=row('rod','Fishing rod','10 gold',GLD>=10);
 h+='<div class="tl" style="font-size:13px;margin-top:10px">SELL (Gil pays extra for fish)</div>';let any=0;
 for(const k of fishKeys()){const c=inv[k]|0;if(c>0){any=1;h+=row('sf_'+k,'Sell all '+esc(iname(k))+' ('+c+')','+'+c*TACKLE_P(k)+' gold',true)}}
 if(!any)h+='<div class="tl" style="font-weight:400;opacity:.6">No fish to sell</div>';return h}
function innHTML(){let h=head('The Gull\'s Rest','Rosa',TALKQ)+'<div class="tl" style="margin-top:8px">Gold: '+GLD+'</div>';
 h+=row('stew','Fish stew','12 gold · heals 3 and fills you up (you have '+(inv.stew|0)+')',GLD>=12)+row('stew5','5 fish stews','55 gold',GLD>=55);
 h+=row('rest',nightNow()||dark()>.3?'Rent a bed for the night':'Rest a while',(nightNow()||dark()>.3?'15 gold · sleep until morning, wake up healed':'15 gold · heal fully and get a hot meal'),GLD>=15);return h}
function saltForgeHTML(){let h=head('Saltmere Forge','Brann',TALKQ)+'<div class="tl" style="margin-top:8px">Gold: '+GLD+' · Steel bars: '+(inv.sbar|0)+'</div><div class="tl" style="font-size:13px">STEEL TOOLS</div>';
 const TN2={axe:'axe',pick:'pickaxe',sword:'sword'};
 for(const k of['axe','pick','sword']){const t=TL[k];if(t>=4)h+='<div class="qc" style="margin:6px 0"><b>✓ Steel '+TN2[k]+'</b></div>';
  else if(t<3)h+=row('st_'+k,'Steel '+TN2[k],'Bring me an iron '+TN2[k]+' first (from the Hollow blacksmith)',false);
  else h+=row('st_'+k,'Steel '+TN2[k],STEELC.b+' steel bars + '+STEELC.g+' gold · the best there is',(inv.sbar|0)>=STEELC.b&&GLD>=STEELC.g)}
 h+='<div class="tl" style="font-size:13px;margin-top:10px">BUY</div>'+row('bibar','Iron bar','30 gold',GLD>=30)+row('bsbar','Steel bar','90 gold',GLD>=90);
 h+='<div class="tl" style="font-size:13px;margin-top:10px">SELL (Brann pays extra for metalwork)</div>';let any=0;
 for(const k in FORGE_P){const c=inv[k]|0;if(c>0){any=1;h+=row('sm_'+k,'Sell all '+esc(iname(k))+' ('+c+')','+'+c*FORGE_P[k]+' gold',true)}}
 if(!any)h+='<div class="tl" style="font-weight:400;opacity:.6">No metalwork to sell</div>';return h}
const SHOPQ={tackle:['Bait makes all the difference. Ask any fisher.','Fresh off the boat? I\'ll buy it.','Fish, fish, fish. Never gets old.'],inn:['Welcome, traveler! Stew\'s hot and the beds are soft.','Sit, sit! You look half starved.','The Gull\'s Rest never turns anyone away.'],forge:['Steel. Stronger than iron, harder to work. Worth it.','Bring me steel bars and I\'ll make you tools that last a lifetime.','Hollow\'s smith is good. I\'m better.']};
const _r20=rPn;rPn=function(){if(ptab===2&&['folk','harbor','tackle','inn','forge'].includes(shop)){
  if(!TALKN||TALKN.kind!==shop){TALKN=nearNpc();TALKQ=TALKN?(SHOPQ[shop]?SHOPQ[shop][Math.floor(Math.random()*3)]:pickLine(TALKN)):''}
  panelChrome('');const n=TALKN;if(!n){closePanel();return}
  if(shop==='harbor'){const q=QS[Q.i];if(Q.on&&q&&q.type==='talk'&&Q.k<1){Q.k=1;say('Quest updated: return to Elder Rowan.');sfx('quest');saveLocal(true)}}
  pbd.innerHTML=shop==='tackle'?tackleHTML():shop==='inn'?innHTML():shop==='forge'?saltForgeHTML():folkHTML(n);return}_r20()};
function xbuy(c,f,msg){if(GLD<c){say('Not enough gold');sfx('swish');return}GLD-=c;f();say(msg);sfx('coin')}
function xAct(a){const n=TALKN;
 if(a==='job'&&n){const j=jobFor(n);if(j&&!j.done&&(inv[j.k]|0)>=j.amt){inv[j.k]-=j.amt;GLD+=j.g;addXp(j.s,j.xp);JOBD[n.id]=today();if(Q.on&&QS[Q.i]&&QS[Q.i].type==='jobs')Q.k++;
   TALKQ={bea:'Bless you! My fields thank you.',finn:'Wow, thanks! Dad will be so impressed.',marina:'Perfect! These will sell in no time.',tom:'Arr, a feast! You\'re a good sort.',pip:'WOW! Thank you thank you!',nell:'Just what I needed. Much obliged.',ida:'Fine work. My ship thanks you.'}[n.id]||'Thank you!';
   say('Request done! +'+j.g+' gold');sfx('quest');saveLocal(true);saveCloud()}}
 else if(a==='bait10')xbuy(15,()=>inv.bait=(inv.bait|0)+10,'Bought 10 bait');
 else if(a==='bait50')xbuy(65,()=>inv.bait=(inv.bait|0)+50,'Bought 50 bait');
 else if(a==='rod')xbuy(10,()=>TL.rod=1,'Got a fishing rod!');
 else if(a.startsWith('sf_')||a.startsWith('sm_')){const k=a.slice(3),c=inv[k]|0;if(!c)return;const v=c*(a[1]==='f'?TACKLE_P(k):FORGE_P[k]);GLD+=v;inv[k]=0;say('Sold for '+v+' gold');sfx('coin');drops.push({x:P.x,y:P.y-16,t:0,tx:'+'+v+' gold',c:'#f8d848'})}
 else if(a==='stew')xbuy(12,()=>inv.stew=(inv.stew|0)+1,'Bought a fish stew');
 else if(a==='stew5')xbuy(55,()=>inv.stew=(inv.stew|0)+5,'Bought 5 fish stews');
 else if(a==='rest'){if(GLD<15){say('Not enough gold');sfx('swish');return}GLD-=15;P.hp=6;hunger=100;
  if(nightNow()||dark()>.3){time=(Math.floor(time/DAYLEN)+1)*DAYLEN+1;say('You slept at the Gull\'s Rest. Good morning!');closePanel()}else say('You rest and eat. You feel great!');sfx('quest')}
 else if(a.startsWith('st_')){const k=a.slice(3);if(TL[k]!==3){say('Brann needs an iron '+(k==='pick'?'pickaxe':k)+' to work from.');return}
  if((inv.sbar|0)<STEELC.b||GLD<STEELC.g){say('You need '+STEELC.b+' steel bars and '+STEELC.g+' gold.');sfx('swish');return}
  inv.sbar-=STEELC.b;GLD-=STEELC.g;TL[k]=4;addXp(10,300);say('Brann forged you a steel '+(k==='pick'?'pickaxe':k)+'!');sfx('anvil');setTimeout(()=>sfx('quest'),300)}
 else if(a==='bibar')xbuy(30,()=>inv.ibar=(inv.ibar|0)+1,'Bought an iron bar');
 else if(a==='bsbar')xbuy(90,()=>inv.sbar=(inv.sbar|0)+1,'Bought a steel bar');
 svg();saveLocal(true);rPn()}
const _oc20=pbd.onclick;pbd.onclick=e=>{const b=e.target.closest('.xb');if(b){xAct(b.dataset.a);return}_oc20(e)};
// bait: faster bites, and sometimes a bonus fish
const _atk20=attack;attack=function(){
 if(!dead&&!menuOpen&&!pnOpen&&!SCENE&&!BUILD&&swing<=0&&!FISH&&!facingNpc()){const[x,y]=frontTile(),s=SIGNS.get(y*N+x);if(s){say(s);sfx('talk');swing=.2;return}}
 const had=!!FISH;_atk20();if(!had&&FISH&&(inv.bait|0)>0){inv.bait--;FISH.wait*=.4;FISH.bait=1;say('You cast your line with bait...')}};
const _cf20=catchFish;catchFish=function(){const bait=FISH&&FISH.bait,before=fishKeys().map(k=>inv[k]|0);_cf20();
 if(bait){const i=fishKeys().findIndex((k,j)=>(inv[k]|0)>before[j]);if(i>=0&&Math.random()<.3){const k=fishKeys()[i];inv[k]++;say('A double catch! Two '+iname(k)+'!')}}
 if(FISH){if((inv.bait|0)>0){inv.bait--;FISH.wait*=.4;FISH.bait=1}else FISH.bait=0}};
// --- quests ---
const GI=QS.findIndex(q=>q.n==='Grandmaster');
QS.splice(GI,0,{n:'The Road East',d:'A road and bridge now lead east from the village to the port of Saltmere. Travel there and greet Captain Ida at the harbor.',type:'talk',amt:1,r:{g:100,xp:[9,300]}},
 {n:'Good Neighbor',d:'Townsfolk in Hollow Village and Saltmere each have a small request every day. Complete 5 of them.',type:'jobs',amt:5,r:{g:200,xp:[3,600]}},
 {n:'Steel Yourself',d:'Brann at the Saltmere forge turns iron tools into steel. Get any steel tool.',type:'steel',amt:1,r:{g:300,xp:[10,800]}});
const _qv20=qVal;qVal=function(q){return q.type==='talk'||q.type==='jobs'?Q.k:q.type==='steel'?['axe','pick','sword'].filter(k=>TL[k]>=4).length:_qv20(q)};
// older saves: if you were on Grandmaster you get the new quests first; if you had finished everything,
// you get the new quests and Grandmaster is skipped afterwards (you already earned it)
let GMDONE=false;const remap20=(qv,gmd)=>{if(qv>=6){GMDONE=!!gmd;return}if(Q.i===GI){Q.on=false;Q.k=0}else if(Q.i>GI){Q.i=GI;Q.on=false;Q.k=0;GMDONE=true}};

const _qa20=questAct;questAct=function(a){_qa20(a);if(GMDONE&&QS[Q.i]&&QS[Q.i].n==='Grandmaster'){Q.i++;GMDONE=false;saveLocal(true);rPn()}};
const _sn20=snap;snap=function(){const s=_sn20();s.qv=6;s.jobs={...JOBD};s.gmd=GMDONE?1:0;return s};
const _ap20=applySave;applySave=function(S){_ap20(S);GMDONE=false;if(S.q)remap20(S.qv||0,S.gmd);JOBD={};if(S.jobs&&typeof S.jobs==='object')for(const k in S.jobs)if(JOBS[k])JOBD[k]=+S.jobs[k]||0;
 if(S.tl)for(const k of['axe','pick','sword'])TL[k]=Math.max(0,Math.min(4,+S.tl[k]||0));if(S.inv){inv.stew=Math.max(0,+S.inv.stew||0);inv.bait=Math.max(0,+S.inv.bait||0)}clearProt()};

const _ng20=newGame;newGame=function(){JOBD={};GMDONE=false;_ng20();for(const n of FOLK)if(n.room&&n.scene)comeOut(n)};
clearProt();
// --- update: safe streets, welcome message ---
let inTownPrev=false,protT=0;
const _u20=upd;upd=function(dt){_u20(dt);if(!pnOpen)TALKN=null;if(menuOpen||pnOpen||SCENE)return;const x=Math.floor(P.x/16),y=Math.floor(P.y/16),inT=inTownBox(x,y);
 if(inT&&!inTownPrev&&!dead){say('Welcome to Saltmere, the port of the east!');msgT=3}inTownPrev=inT;
 en=en.filter(n=>!inTownBox(Math.floor(n.x/16),Math.floor(n.y/16)));
 if((protT+=dt)>1){protT=0;for(let j=REM.length-1;j>=0;j--)if(PROT.has(REM[j].i))REM.splice(j,1)}};
// --- drawing ---
function drawBridge(i,tm){const x=i%N,y=(i/N)|0,px=x*16,py=y*16,horiz=ROADS.has(i-1)||ROADS.has(i+1)||(tile[i-1]>0&&!BRIDGE.has(i-1)&&tile[i-1]!==undefined&&!BRIDGE.has(i+N)&&!BRIDGE.has(i-N));
 Rg(px,py,16,16,'#2860c0');const fr=Math.floor(tm*2)%2;Rg(px+((x*5+fr*3)%12),py+((y*7)%12)+2,3,1,'#5898f0');
 if(horiz){Rg(px,py+2,16,13,O);Rg(px,py+3,16,11,'#b88850');for(let k=0;k<16;k+=4)Rg(px+k+((y&1)*2),py+3,1,11,'#8a5a30');Rg(px,py+3,16,1,'#d8a868');Rg(px,py+13,16,1,'#7a4a20');
  for(const yy of[py+1,py+13]){Rg(px,yy,16,2,'#6a3a18');}for(const xx of[px+2,px+10])if((x+xx)%2===0){Rg(xx,py,2,4,O);Rg(xx,py+12,2,4,O)}}
 else{Rg(px+2,py,13,16,O);Rg(px+3,py,11,16,'#b88850');for(let k=0;k<16;k+=4)Rg(px+3,py+k+((x&1)*2),11,1,'#8a5a30');Rg(px+3,py,1,16,'#d8a868');Rg(px+13,py,1,16,'#7a4a20');
  Rg(px+1,py,2,16,'#6a3a18');Rg(px+13,py,2,16,'#6a3a18');if(y%2===0){Rg(px,py+6,3,4,O);Rg(px+13,py+6,3,4,O)}}}
function drawBoat(x,y,tm){const px=x*16-4,py=y*16+2+Math.round(Math.sin(tm*1.6+x)*1);
 Rg(px,py+6,24,9,O);Rg(px+1,py+7,22,4,'#a86830');Rg(px+3,py+11,18,3,'#7a4a20');Rg(px+1,py+7,22,1,'#d8a060');Rg(px+11,py-10,2,17,O);Rg(px+12,py-9,1,15,'#7a4a20');Rg(px+13,py-8,7,10,O);Rg(px+13,py-7,6,8,'#f4f0e0');Rg(px+13,py-7,6,2,'#e05040')}
const _gh20=GROUNDHOOK;GROUNDHOOK=function(x0,y0,x1,y1,tm){if(!SCENE){for(const i of BRIDGE){const x=i%N,y=(i/N)|0;if(x>=x0-1&&x<=x1+1&&y>=y0-1&&y<=y1+1)drawBridge(i,tm)}for(const[x,y]of BOATS)if(x>=x0-2&&x<=x1+2&&y>=y0-2&&y<=y1+2)drawBoat(x,y,tm)}if(_gh20)_gh20(x0,y0,x1,y1,tm)};
function drawLamp(x,y,tm){const px=x*16,py=y*16;shd(px+8,py+13,10);Rg(px+6,py-10,4,25,O);Rg(px+7,py-9,2,23,'#404858');Rg(px+3,py-18,10,10,O);Rg(px+4,py-17,8,8,'#303840');
 const lit=dark()>.15;Rg(px+5,py-16,6,6,lit?'#f8e078':'#c8d0d8');Rg(px+5,py-16,6,1,lit?'#fff8c0':'#e8eef4');Rg(px+5,py-20,6,2,O);Rg(px+5,py+13,6,2,O)}
function drawWell(x,y){const px=x*16,py=y*16;shd(px+8,py+14,16);Rg(px,py-2,16,17,O);Rg(px+1,py-1,14,15,'#a0a0b0');for(const yy of[py+3,py+8])Rg(px+1,yy,14,1,'#787888');Rg(px+3,py,10,4,'#2850a0');
 Rg(px,py-16,2,16,O);Rg(px+14,py-16,2,16,O);Rg(px-2,py-20,20,5,O);Rg(px-1,py-19,18,3,'#a83838');Rg(px+7,py-15,2,8,'#7a4a20')}
function drawSign(i){const px=(i%N)*16,py=((i/N)|0)*16;shd(px+8,py+14,10);Rg(px+7,py+2,3,13,O);Rg(px+8,py+3,1,12,'#7a4a20');Rg(px+1,py-6,14,10,O);Rg(px+2,py-5,12,8,'#c89858');Rg(px+2,py-5,12,1,'#e8c088');Rg(px+4,py-3,8,1,'#7a4a20');Rg(px+4,py-1,6,1,'#7a4a20')}
const _nd20=NEWDRAW;NEWDRAW=function(...a){_nd20(...a);if(SCENE)return;const tm=a[8],vx=(x,y)=>Math.abs(x*16-P.x)<W/Z+40&&Math.abs(y*16-P.y)<H/Z+40;let rd=false;
 const front=(x,y,hw)=>{if(Math.abs(P.x-(x*16+8))<hw&&P.y+6>(y+1)*16-2&&P.y-18<(y+1)*16)rd=true};
 if(!SORTALL){for(const[x,y]of LAMPS)if(vx(x,y)){drawLamp(x,y,tm);front(x,y,10)}
 if(vx(...WELL)){drawWell(...WELL);front(WELL[0],WELL[1],14)}
 for(const i of SIGNS.keys()){const x=i%N,y=(i/N)|0;if(vx(x,y)){drawSign(i);front(x,y,10)}}
 if(rd&&!dead)pP(tm)}
 // quest marker over Captain Ida
 const q=QS[Q.i];if(Q.on&&q&&q.type==='talk'&&Q.k<1){const n=FOLK.find(o=>o.id==='ida');if(n&&!n.scene){const bx=Math.round(n.x),by=Math.round(n.y-30+Math.sin(tm*4)*1.5);g.save();g.font='700 11px "SQ Digits","Pixelify Sans",monospace';g.textAlign='center';g.lineWidth=3;g.lineJoin='round';g.strokeStyle=O;g.strokeText('!',bx,by);g.fillStyle='#f8d848';g.fillText('!',bx,by);g.restore()}}};
// building signs and the forge chimney
const _drb20=drBld;drBld=function(b,tm){if(!TBK.has(b.k))return _drb20(b,tm);_drb20({...b,sc:null},tm);if(!b.sc&&!b.smoke)return;
 const X0=b.tx*16,w=b.w*16,base=(b.ty+2)*16,dx=X0+(w>>1)-6;
 if(b.sc){Rg(dx-4,base-27,20,8,O);Rg(dx-3,base-26,18,6,b.sc);
  if(b.ic==='fish'){Rg(dx+1,base-25,8,4,'#4890d0');Rg(dx+9,base-26,2,2,'#4890d0');Rg(dx+9,base-23,2,2,'#4890d0');Rg(dx+2,base-24,1,1,O)}
  else if(b.ic==='mug'){Rg(dx+2,base-25,6,4,'#f8f0e0');Rg(dx+2,base-25,6,1,'#fff');Rg(dx+8,base-24,2,2,'#a87850');Rg(dx+3,base-23,4,2,'#d08830')}
  else{Rg(dx+1,base-24,10,2,'#303040');Rg(dx+4,base-22,4,2,'#303040')}}
 if(b.smoke){Rg(X0+w-15,base-64,10,16,O);Rg(X0+w-14,base-63,8,15,'#887870');for(let i=0;i<3;i++)Rg(X0+w-11+Math.sin(tm*2+i*2)*2,base-67-((tm*12+i*7)%20),2,2,'rgba(220,220,230,.7)')}};
// sleepers: heads on the pillows and little z's
const _dr20=drawRoom;drawRoom=function(tm){_dr20(tm);if(!SCENE)return;
 for(const n of FOLK){if(n.scene!==SCENE.id+'#bed')continue;const x0=n.bed[0]*16,y0=n.bed[1]*16,sk=OPT.skin[n.ch.sk][0],hr=OPT.hair[n.ch.hc];
  Rg(x0+4,y0,8,8,O);Rg(x0+5,y0+1,6,6,sk);Rg(x0+5,y0+1,6,2,hr);Rg(x0+4,y0+2,1,3,hr);Rg(x0+11,y0+2,1,3,hr);Rg(x0+6,y0+5,2,1,O);Rg(x0+9,y0+5,2,1,O);
  const k=(tm*.8+n.bed[0]*.3)%1;g.save();g.globalAlpha=1-k;g.font='700 8px "Pixelify Sans",monospace';g.fillStyle='#ffffff';g.strokeStyle=O;g.lineWidth=2;g.strokeText('z',x0+12+k*6,y0-2-k*12);g.fillText('z',x0+12+k*6,y0-2-k*12);g.restore()}};
// lamp glow at night
const _dh20=drawHUD;drawHUD=function(){const dk=SCENE?0:dark();if(dk>.15){const cx=Math.round(P.x-(W/Z)/2),cy=Math.round(P.y-(H/Z)/2);g.save();g.setTransform(Z,0,0,Z,-cx*Z,-cy*Z);g.globalCompositeOperation='lighter';
  for(const[x,y]of LAMPS){if(Math.abs(x*16-P.x)>W/Z||Math.abs(y*16-P.y)>H/Z)continue;const gr=g.createRadialGradient(x*16+8,y*16-12,2,x*16+8,y*16-12,40);gr.addColorStop(0,'rgba(255,210,120,'+(.5*dk)+')');gr.addColorStop(1,'rgba(255,200,100,0)');g.fillStyle=gr;g.fillRect(x*16-34,y*16-54,84,84)}g.restore()}_dh20()};
// map: towns, road, bridge
const _dmap20=drawMap;drawMap=function(){_dmap20();const c=document.getElementById('mpc');if(!c)return;const x=c.getContext('2d');x.fillStyle='#a86830';for(const i of BRIDGE)x.fillRect(i%N,(i/N)|0,1,1);
 x.fillStyle='#101010';for(const[a,b]of[[VX,VY-6],[TX,TY-6]])x.fillRect(a-2,b-2,5,5);x.fillStyle='#f8d848';for(const[a,b]of[[VX,VY-6],[TX,TY-6]])x.fillRect(a-1,b-1,3,3)};
const _mh20=mapHTML;mapHTML=function(){return _mh20().replace('<span><i style="background:#c85040"></i>Hollow Village</span>','<span><i style="background:#f8d848"></i>Hollow Village · Saltmere</span><span><i style="background:#a86830"></i>Bridge</span><span><i style="background:#68d8f8"></i>Islets</span>')};
// icons
const _icon20=iconURL;iconURL=function(k,col){if(k!=='stew'&&k!=='bait')return _icon20(k,col);const key='g20'+k;if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
 if(k==='stew'){r(1,6,12,6,O);r(2,7,10,4,'#c88848');r(2,7,10,1,'#e8a868');r(2,5,10,2,'#f0d070');r(4,5,2,1,'#e87830');r(8,5,2,1,'#78b848');r(4,1,1,3,'#e8eef4');r(8,2,1,2,'#e8eef4')}
 else{r(3,2,8,10,O);r(4,3,6,8,'#a07850');r(4,3,6,2,'#c09868');r(5,6,1,1,'#e86080');r(7,8,1,1,'#e86080');r(8,5,1,1,'#e86080')}
 return ICONC[key]=c.toDataURL()};
// music: a sea shanty in Saltmere
SONGS.port={bpm:132,lead:'G4 B4 D5 - B4 D5 G5 - F#5 E5 D5 - B4 C5 D5 - E5 - C5 E5 G5 E5 D5 - B4 G4 A4 B4 G4 - - -',bass:'G2 D3 G2 D3 G2 D3 G2 D3 D2 A2 D2 A2 G2 D3 G2 D3 C3 G3 C3 G3 G2 D3 G2 D3 D2 A2 D2 A2 G2 D3 G2 -'};
PARSED.port={bpm:SONGS.port.bpm,lead:parseTrack(SONGS.port.lead),bass:parseTrack(SONGS.port.bass)};
const _ws20=wantSong;wantSong=function(){const w=_ws20();if(w==='day'&&!SCENE&&inTownBox(Math.floor(P.x/16),Math.floor(P.y/16)))return'port';if(SCENE&&(SCENE.id==='inn'||SCENE.id==='tackle'))return'port';return w};
