// ---------------------------------------------------------------- 41. Frosthollow: the northern snow village
// A small lumber village in the snowy north: Pine & Plank (lumber), the Ember Lodge (inn + hearth cooking), the
// Northwind Workshop (crafting supplies), the Ranger's Cabin and four cottages around a frozen pond. A stone trail
// leads north from Hollow Village. Placement follows the town registry: try the preferred anchor, then the closest
// valid spot within 12 tiles (all snow, no water/mountain, away from other towns, dungeons and protected tiles).
const EXTRA_TOWNS=[{id:'frosthollow',name:'Frosthollow',x:43*HSC,y:19*HSC,rx:8,ry:6,biome:'snow',fw:12,fh:7}];
// fw/fh: the half-width/height the layout actually needs (8 buildings + pond + lanes don't fit in 8x6)
function canPlaceTown(cx,cy,rx,ry,biomeTile){for(let dy=-ry-2;dy<=ry+2;dy++)for(let dx=-rx-2;dx<=rx+2;dx++){if((dx/(rx+1.5))**2+(dy/(ry+1.5))**2>1)continue;
  const x=cx+dx,y=cy+dy;if(x<3||y<3||x>N-4||y>N-4)return false;const i=y*N+x;
  if(PROT.has(i)||BS.has(i)||TOWNZ.has(i)||inVillage(x,y)||tile[i]===0||tile[i]===3||(biomeTile!=null&&tile[i]!==biomeTile))return false}
 for(const d of[CAVE,TOMB,TRADER])if(d&&Math.abs(cx-d.x)<rx+6&&Math.abs(cy-d.y)<ry+6)return false;
 if(Math.abs(cx-TX)<rx+16&&Math.abs(cy-TY)<ry+12)return false;return true}
function findTownSpot(t,bt){for(let r=0;r<=30*HSC;r++){let best=null,bd=1e9;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
   const d=Math.hypot(dx,dy);if(d<bd&&canPlaceTown(t.x+dx,t.y+dy,t.fw,t.fh,bt)){bd=d;best=[t.x+dx,t.y+dy]}}if(best)return best}return null}
const FHT=EXTRA_TOWNS[0],FHSPOT=findTownSpot(FHT,4);
const FX=FHSPOT?FHSPOT[0]:-99,FY=FHSPOT?FHSPOT[1]:-99,FHON=!!FHSPOT;
const FHZ=new Set(),FHPATH=new Set(),FHPOND=new Set(),FHLAMP=[],FHB=[];let FHWELL=null,FHDEN=null;
const inFH=(x,y)=>FHON&&((x-FX)/(FHT.fw+.5))**2+((y-FY)/(FHT.fh+.5))**2<=1;
const inFHBox=(x,y)=>FHON&&Math.abs(x-FX)<=FHT.fw+1&&Math.abs(y-FY)<=FHT.fh+1;
if(FHON){
 // --- the land: snow everywhere, trees and rocks cleared inside the footprint only ---
 for(let y=FY-FHT.fh-1;y<=FY+FHT.fh+1;y++)for(let x=FX-FHT.fw-1;x<=FX+FHT.fw+1;x++)if(inFH(x,y)){const i=y*N+x;FHZ.add(i);tile[i]=4;obj[i]=null;TG.delete(i)}
 const fp=(x,y)=>{const i=y*N+x;tile[i]=4;obj[i]=null;FHPATH.add(i);PROT.add(i)};
 for(let x=FX-11;x<=FX+11;x++){fp(x,FY-4);fp(x,FY+5)}                    // two streets
 for(let y=FY-4;y<=FY+5;y++){fp(FX-6,y);fp(FX+6,y)}                       // lanes either side of the pond
 for(let y=FY-FHT.fh-1;y<=FY-4;y++)fp(FX+6,y);                            // north gap -> Frostfang trail
 for(let y=FY+5;y<=FY+FHT.fh+1;y++)fp(FX,y);                              // south entrance
 for(let y=FY-2;y<=FY+1;y++)for(let x=FX-3;x<=FX+3;x++)if(((x-FX)/3.3)**2+((y-FY+.5)/2.1)**2<=1){const i=y*N+x;tile[i]=0;FHPOND.add(i);PROT.add(i)}  // frozen pond
 // --- buildings (tx,ty = top-left; door at tx+2,ty+1) ---
 const B=(k,dx,dy,o)=>{const b=Object.assign({k,tx:FX+dx,ty:FY+dy,w:5,fh:1},o);FHB.push(b);BLD.push(b);for(let y=b.ty;y<b.ty+2;y++)for(let x=b.tx;x<b.tx+b.w;x++){const i=y*N+x;tile[i]=4;obj[i]=null;PROT.add(i);if(!(x===b.tx+2&&y===b.ty+1))BS.add(i)}};
 B('fh_pine',-11,-6,{wall:'#b07a4a',roof:'#3a5a3a',sc:'#d8c098',ic:'axe',n:'Pine & Plank'});
 B('fh_lodge',-5,-6,{wall:'#c08a58',roof:'#8a3030',sc:'#e8c060',ic:'mug',n:'Ember Lodge'});
 B('fh_work',1,-6,{wall:'#a88a6a',roof:'#3a4a6a',sc:'#c8d0d8',ic:'hammer',n:'Northwind Workshop'});
 B('fh_ranger',7,-6,{wall:'#8a6a48',roof:'#4a5a2a',sc:'#a8c088',ic:'bow',n:'Ranger\'s Cabin'});
 B('fh1',-11,3,{wall:'#c89a68',roof:'#7a3a5a'});B('fh2',-5,3,{wall:'#b88a58',roof:'#4a6a8a'});B('fh3',1,3,{wall:'#c0946a',roof:'#8a5a2a'});B('fh4',7,3,{wall:'#a87e54',roof:'#3a6a5a'});
 for(const b of FHB)BS.delete((b.ty+1)*N+b.tx+2);                       // doors are walkable entrances
 // lamps, well, signs
 for(const[dx,dy]of[[-5,-3],[5,-3],[0,2],[-3,6],[3,6],[-9,6],[9,6]]){const x=FX+dx,y=FY+dy,i=y*N+x;if(FHPATH.has(i)||FHPOND.has(i))continue;LAMPS.push([x,y]);FHLAMP.push([x,y]);BS.add(i);PROT.add(i)}
 FHWELL=[FX+4,FY-1];BS.add(FHWELL[1]*N+FHWELL[0]);PROT.add(FHWELL[1]*N+FHWELL[0]);
 SIGNS.set((FY+FHT.fh)*N+FX+1,'FROSTHOLLOW - lumber village of the north. South: Hollow Village.');
 for(const i of FHZ)PROT.add(i);
}
// --- trails: cheapest walkable route (snow-covered stone steps on snow, a dirt path elsewhere, bridges over water) ---
function trailPath(sx,sy,ex,ey,okEnd){const INF=1e9,D4=[[1,0],[0,1],[-1,0],[0,-1]];
 const blocked=i=>{const x=i%N,y=(i/N)|0;if(x<2||y<2||x>N-3||y>N-3)return true;if(BS.has(i)||TOWNZ.has(i)||(inVillage(x,y)&&!(x===sx&&y===sy)))return true;if(FHZ.has(i)&&!FHPATH.has(i)&&!okEnd(x,y))return true;if(DHZ&&DHZ.has(i)&&!DHPATH.has(i))return true;if(TWZ&&TWZ.has(i)&&!TWPATH.has(i))return true;
  for(const d of[CAVE,TOMB,TRADER])if(d&&Math.abs(x-d.x)<=2&&Math.abs(y-d.y)<=2)return true;return false};
 const cost=i=>{const t=tile[i];let c=t===0?6:t===3?40:FHPATH.has(i)||(DHPATH&&DHPATH.has(i))?.6:1;if(obj[i])c+=1.2;return c};
 const dist=new Float64Array(N*N).fill(INF),prev=new Int32Array(N*N).fill(-1),H=[];
 const push=(d,s)=>{H.push([d,s]);let k=H.length-1;while(k>0){const p=(k-1)>>1;if(H[p][0]<=H[k][0])break;[H[p],H[k]]=[H[k],H[p]];k=p}};
 const pop=()=>{const top=H[0],last=H.pop();if(H.length){H[0]=last;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<H.length&&H[l][0]<H[m][0])m=l;if(r<H.length&&H[r][0]<H[m][0])m=r;if(m===k)break;[H[m],H[k]]=[H[k],H[m]];k=m}}return top};
 const s0=sy*N+sx,g0=ey*N+ex;dist[s0]=0;push(0,s0);
 while(H.length){const[d,i]=pop();if(d>dist[i])continue;if(i===g0)break;const x=i%N,y=(i/N)|0;
  for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy,ni=ny*N+nx;if(ni!==g0&&blocked(ni))continue;const c=d+cost(ni)+(hrand(nx,ny)*.6);if(c<dist[ni]){dist[ni]=c;prev[ni]=i;push(c,ni)}}}
 const out=[];if(dist[g0]>=INF)return out;for(let i=g0;i>=0;i=prev[i])out.push(i);return out.reverse()}
function layTrail(path){for(const i of path){const x=i%N,y=(i/N)|0;if(inVillage(x,y))continue;if(tile[i]===0){BRIDGE.add(i);ROADS.add(i);tile[i]=1}else if(tile[i]===4||tile[i]===3){tile[i]=4;FHPATH.add(i)}else if(tile[i]===5&&DHPATH){DHPATH.add(i)}else{tile[i]=1;ROADS.add(i)}
 obj[i]=null;TG.delete(i);PROT.add(i)}}
let FHTRAIL=[],DENTRAIL=[];
if(FHON){
 // south: from Hollow Village's north edge up to Frosthollow's south entrance
 FHTRAIL=trailPath(VX,VY-8,FX,FY+FHT.fh+1,()=>false);layTrail(FHTRAIL);
 {const st=FHTRAIL.find(i=>{const y=(i/N)|0;return y<=VY-10});if(st!=null){const x=st%N,y=(st/N)|0;for(const dx of[-1,1]){const i=y*N+x+dx;if(tile[i]!==0&&!FHPATH.has(i)&&!ROADS.has(i)&&!BS.has(i)){SIGNS.set(i,'North: Frosthollow, a lumber village in the snow. Follow the stone trail.');break}}}}
 // the Frostfang Den: a cave in an icy outcrop north of the village (preferred ~ (46,12), else the nearest clear spot north)
 const denOk=(x,y)=>{if(y>FY-FHT.fh-5||x<4||y<4||x>N-5)return false;for(let dy=-2;dy<=2;dy++)for(let dx=-3;dx<=3;dx++){const i=(y+dy)*N+x+dx;if(tile[i]===0||PROT.has(i)||BS.has(i)||inFH(x+dx,y+dy))return false}return true};
 let best=null,bd=1e9;for(let y=4;y<FY;y++)for(let x=4;x<N-4;x++){if(!denOk(x,y))continue;const d=Math.hypot(x-46*HSC,y-12*HSC)+Math.abs(x-(FX+6))*.4;if(d<bd){bd=d;best=[x,y]}}
 if(best){const[x,y]=best;FHDEN={x,y};
  for(let dy=-2;dy<=0;dy++)for(let dx=-2;dx<=2;dx++){if(Math.abs(dx)===2&&dy===0)continue;const i=(y+dy)*N+x+dx;tile[i]=3;obj[i]=null;PROT.add(i)}
  for(const[dx,dy]of[[0,1],[-1,1],[1,1],[0,2]]){const i=(y+dy)*N+x+dx;tile[i]=4;obj[i]=null;PROT.add(i)}
  DENTRAIL=trailPath(FX+6,FY-FHT.fh-1,x,y+1,()=>false);layTrail(DENTRAIL);
  const near=DENTRAIL[Math.min(4,DENTRAIL.length-1)];if(near!=null){const nx=near%N,ny=(near/N)|0;for(const dx of[-1,1]){const i=ny*N+nx+dx;if(tile[i]!==0&&!FHPATH.has(i)&&!BS.has(i)&&!inFH(nx+dx,ny)){SIGNS.set(i,'North: Frostfang Den. Wolves! Attack 12 and Defence 10 recommended.');break}}}}
 for(const i of SIGNS.keys()){if(tile[i]===0)tile[i]=4;obj[i]=null;BS.add(i);PROT.add(i)}
 for(const i of PROT)TG.delete(i)}
// --- rooms ---
const fhRoom=(w,h,floor,wall,trim,items)=>{const R={w,h,ex:w>>1,floor,wall,trim,items};R.solid=new Set();for(const it of items)if(it.solid)for(let dy=0;dy<(it.sh||1);dy++)for(let dx=0;dx<(it.w||1);dx++)R.solid.add((it.y+dy)*w+it.x+dx);return R};
const FWOOD=['#b88a5a','#ac7e50'],FWALL='#e8dcc8';
Object.assign(ROOMS,{
 fh_pine:fhRoom(9,7,FWOOD,'#e4d4b8','#3a5a3a',[{t:'rack',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'shelf',x:6,y:0,w:3},{t:'counter',x:1,y:3,w:4,solid:1},{t:'barrel',x:7,y:2,solid:1},{t:'barrel',x:8,y:2,solid:1},{t:'table',x:6,y:4,w:2,solid:1,goods:1},{t:'rug',x:3,y:5,w:3}]),
 fh_lodge:fhRoom(11,8,['#c89868','#bc8c5c'],'#f0dcc0','#8a3030',[{t:'shelf',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'fireplace',x:6,y:0,w:2},{t:'counter',x:0,y:3,w:4,solid:1},{t:'stove',x:0,y:2,solid:1},{t:'table',x:6,y:3,w:2,solid:1},{t:'table',x:8,y:5,w:2,solid:1},{t:'table',x:2,y:6,w:2,solid:1},{t:'bed',x:10,y:2,sh:2,solid:1},{t:'plant',x:10,y:6,solid:1},{t:'rug',x:4,y:6,w:3}]),
 fh_work:fhRoom(9,7,['#a89888','#9c8c7c'],'#d8d0c4','#3a4a6a',[{t:'rack',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'shelf',x:6,y:0,w:3},{t:'counter',x:1,y:3,w:3,solid:1},{t:'anvil',x:6,y:4,solid:1},{t:'barrel',x:8,y:2,solid:1},{t:'chest',x:7,y:2,solid:1},{t:'rug',x:3,y:5,w:3}]),
 fh_ranger:fhRoom(9,7,['#a07850','#946c46'],'#d8c8a8','#4a5a2a',[{t:'rack',x:0,y:0,w:2},{t:'fireplace',x:3,y:0,w:2},{t:'rack',x:6,y:0,w:3},{t:'dummy',x:8,y:3,solid:1},{t:'table',x:3,y:3,w:2,solid:1},{t:'bed',x:0,y:2,sh:2,solid:1},{t:'barrel',x:8,y:5,solid:1},{t:'rug',x:3,y:5,w:3}]),
 fh1:fhRoom(8,6,FWOOD,FWALL,'#7a3a5a',[{t:'window',x:2,y:0},{t:'fireplace',x:5,y:0,w:2},{t:'bed',x:1,y:2,sh:2,solid:1},{t:'table',x:4,y:3,w:2,solid:1},{t:'plant',x:7,y:2,solid:1},{t:'rug',x:3,y:4,w:2}]),
 fh2:fhRoom(8,6,['#c09060','#b48454'],FWALL,'#4a6a8a',[{t:'window',x:2,y:0},{t:'rack',x:5,y:0,w:2},{t:'bed',x:1,y:2,sh:2,solid:1},{t:'table',x:4,y:3,w:2,solid:1},{t:'barrel',x:7,y:2,solid:1},{t:'rug',x:3,y:4,w:2}]),
 fh3:fhRoom(8,6,['#c89a6a','#bc8e5e'],FWALL,'#8a5a2a',[{t:'window',x:3,y:0},{t:'shelf',x:5,y:0,w:2},{t:'bed',x:1,y:2,sh:2,solid:1},{t:'bed',x:6,y:2,sh:2,solid:1},{t:'table',x:3,y:3,w:2,solid:1},{t:'rug',x:3,y:5,w:2}]),
 fh4:fhRoom(8,6,['#b08458','#a4784c'],FWALL,'#3a6a5a',[{t:'window',x:2,y:0},{t:'rack',x:5,y:0,w:2},{t:'bed',x:1,y:2,sh:2,solid:1},{t:'table',x:4,y:3,w:2,solid:1},{t:'barrel',x:7,y:2,solid:1},{t:'rug',x:3,y:4,w:2}])});
// room decor: hearths, a cooking stove and the training dummy
const _df41=drawFurn;drawFurn=function(it,tm){const x0=it.x*16,y0=it.y*16;
 if(it.t==='fireplace'){const w=(it.w||2)*16;Rg(x0,y0-8,w,24,O);Rg(x0+1,y0-7,w-2,22,'#8a8890');for(let r=0;r<5;r++)for(let c=0;c<w/8;c++)Rg(x0+1+c*8+(r%2?4:0),y0-7+r*4,7,3,['#9a98a0','#86848c','#a4a2aa'][(r+c)%3]);
  Rg(x0+4,y0+2,w-8,12,O);Rg(x0+5,y0+3,w-10,11,'#1a1010');const k=tm*8+x0;for(let j=0;j<3;j++){const fx=x0+7+j*((w-14)/2),hh=5+Math.sin(k+j*2)*2;Rg(fx,y0+13-hh,4,hh,'#e86018');Rg(fx+1,y0+14-hh*.6,2,hh*.6,'#f8c040')}
  Rg(x0+5,y0+12,w-10,2,'#5a3418');Rg(x0-1,y0-10,w+2,3,O);Rg(x0,y0-9,w,1,'#b0aeb6');return}
 if(it.t==='stove'||it.t==='dummy')return drawStation(it.t,it.x,it.y,0,tm);
 _df41(it,tm)};
// --- people: shopkeepers work in their shops by day and go home at night; Pipkin plays by the pond ---
const FHN=[
 {kind:'fhfolk',id:'elowen',name:'Elowen',home:'fh_lodge',work:'fh_lodge',wx:2*16,wy:2*16+10,bed:[10,2],ch:{sk:1,hs:3,hc:3,sh:6,pn:4,ht:0,hcol:0,so:1}},
 {kind:'fhfolk',id:'bram',name:'Bram',home:'fh2',work:'fh_pine',wx:3*16,wy:2*16+10,bed:[1,2],ch:{sk:2,hs:0,hc:1,sh:4,pn:2,ht:1,hcol:2,so:2}},
 {kind:'fhfolk',id:'nessa',name:'Nessa',home:'fh3',work:'fh_work',wx:2.5*16,wy:2*16+10,bed:[6,2],ch:{sk:0,hs:2,hc:4,sh:1,pn:0,ht:0,hcol:0,so:3}},
 {kind:'fhfolk',id:'pipkin',name:'Pipkin',home:'fh3',work:null,bed:[1,2],ch:{sk:3,hs:1,hc:2,sh:3,pn:1,ht:1,hcol:4,so:1}},
 {kind:'fhfolk',id:'torren',name:'Torren',home:'fh4',work:'fh_ranger',wx:6*16+4,wy:3*16+10,bed:[1,2],ch:{sk:4,hs:0,hc:0,sh:5,pn:2,ht:2,hcol:1,so:2}}];
if(FHON){for(const n of FHN){const hb=FHB.find(b=>b.k===n.home);n.door=hb?[hb.tx+2,hb.ty+1]:[FX,FY+5];n.town='frosthollow';n.hx0=(FX+(n.id==='pipkin'?-4:0))*16+8;n.hy0=(FY+(n.id==='pipkin'?2:5))*16+8;
  if(n.work){n.scene=n.work;n.x=n.wx;n.y=n.wy;n.dir=0;n.st=0}else{n.x=n.hx0;n.y=n.hy0}}
 NPCS.push(...FHN);FOLK.push(...FHN)}
const FHNAMES={fh_pine:'Pine & Plank',fh_lodge:'the Ember Lodge',fh_work:'the Northwind Workshop',fh_ranger:'the Ranger\'s Cabin',fh1:'Elowen\'s cottage',fh2:'Bram\'s cottage',fh3:'Nessa and Pipkin\'s cottage',fh4:'Torren\'s cottage'};
function fhRoutine(dt){if(!FHON)return;const night=nightNow();
 for(const n of FHN){const want=night&&n.id!=='elowen'?n.home+'#bed':n.work;
  if(SCENE&&n.scene===SCENE.id)continue;// don't vanish while you're in the room with them
  if(want===n.scene)continue;
  if(want===null){if(n.scene){n.scene=null;n.x=n.door[0]*16+8;n.y=(n.door[1]+1)*16+6;n.hx=n.hx0;n.hy=n.hy0;n.tx=n.hx0;n.ty=n.hy0;n.wt=0}continue}
  if(!n.scene&&want.endsWith('#bed')){const dx=n.door[0]*16+8,dy=(n.door[1]+1)*16+3;n.goT=(n.goT||0)+dt;
   if(SCENE||Math.hypot(P.x-n.x,P.y-n.y)>260||n.goT>14||Math.hypot(n.x-dx,n.y-dy)<5){n.scene=want;n.goT=0;if(!SCENE&&Math.hypot(P.x-n.x,P.y-n.y)<120)sfx('door')}else{n.hx=dx;n.hy=dy;n.tx=dx;n.ty=dy;n.wt=1}continue}
  n.scene=want;if(!want.endsWith('#bed')){n.x=n.wx;n.y=n.wy;n.dir=0;n.st=0}}}
Object.assign(LINES,{
 elowen:{d:['Come inside! Your nose looks frozen.','A warm meal makes any journey shorter.'],x:['Something\'s been howling beyond Frostfang Trail.'],n:['Can\'t sleep? The fire\'s still warm.','Rooms are ready whenever you are.']},
 bram:{d:['Good timber grows slowly up here.','I\'ve chopped wood through worse winters.'],x:['Torren says the wolves have grown restless.']},
 nessa:{d:['A good hammer can fix nearly anything.','The cold makes iron stubborn.'],x:['I could use help repairing the old trail markers.']},
 pipkin:{d:['I found a footprint bigger than my head!','Mum says I\'m not allowed past the pond.'],x:['There\'s a cave where the snow never melts!']},
 torren:{d:['Keep your fire close after sunset.','Wolves hunt differently when they\'re hungry.'],x:['The Frostfang Alpha has returned to the mountain.']}});
Object.assign(JOBS,{elowen:[{k:'cooked',a:[3,3],s:4,x:20}],bram:[{k:'wood',a:[10,10],s:1,x:6}],nessa:[{k:'stone',a:[5,5],s:2,x:8}],pipkin:[{k:'berry',a:[5,5],s:3,x:8}],torren:[{k:'pelt',a:[3,3],s:0,x:40}]});
const FHTHANKS={elowen:'Lovely! The pot will be full tonight.',bram:'Good, dry wood. That\'ll see us through.',nessa:'Perfect. Now I can fix that wall.',pipkin:'Berries! You\'re the best!',torren:'Fine pelts. These will keep the little ones warm.'};
// --- shops ---
const FHSHOP={
 fh_pine:{who:'bram',title:'Pine & Plank',items:[['wood','Wood',5],['stone','Stone',7],['firekit','Fire kit (3 wood + 1 stone)',25],['iron','Iron ore',18],['nails','Iron nails',12],['wwall','Wooden wall',20],['door','Door',35]]},
 fh_lodge:{who:'elowen',title:'The Ember Lodge',items:[['berry','Berries',5],['cooked','Cooked meat',14],['bread','Bread',18],['stew','Fish stew',28],['jam','Berry jam',20]]},
 fh_work:{who:'nessa',title:'Northwind Workshop',items:[['stone','Stone',7],['iron','Iron ore',18],['ibar','Iron bar',55],['nails','Iron nails',12],['brick','Stone brick',18],['lantern','Iron lantern',85],['chest','Wooden chest',75]]}};
const FHSHOPQ={bram:['Fresh-cut pine, dry as a bone.','Need timber? You\'ve come to the right place.'],elowen:['Sit by the fire and thaw out.','Hot food and a soft bed. What more is there?'],nessa:['Nails, bars, bricks. Whatever you\'re building.','Mind the anvil, it bites.'],torren:['Shut the door, you\'re letting the cold in.','Sit. Warm up. Then we talk wolves.']};
function fhShopHTML(S){let h='<div class="tl" style="margin-top:10px">Gold: '+GLD+'</div><div class="tl" style="font-size:13px">BUY</div>';
 S.items.forEach(([k,n,c])=>{const have=k==='firekit'?'':' (you have '+(inv[k]|0)+')';h+=row('fhb_'+k+'_1',n,c+' gold'+have,GLD>=c);if(c<=20)h+=row('fhb_'+k+'_10','10 × '+n,c*10+' gold',GLD>=c*10)});return h}
function torrenNotes(){const tips=[];const ax=['no axe','a wooden axe','a stone axe','an iron axe','a steel axe','a steel axe','a mithril axe','an adamant axe'][Math.min(7,TL.axe|0)];
 tips.push('Woodcutting '+lvOf(1)+' with '+ax+'. '+(TL.axe<3?'An iron axe from the Hollow blacksmith fells pines twice as fast.':TL.axe<4?'Brann in Saltmere turns an iron axe into steel.':'That steel axe will outlast us both.'));
 tips.push('Wolves come out on the snow at night. They crouch before they lunge: when you see the red eyes, roll aside.');
 tips.push(FHDEN?'Frostfang Den is up the trail north of the village. Three floors deep; the Alpha waits at the bottom. Attack 12, Defence 10 and a little Magic would help.':'');
 return'<div class="qc" style="margin-top:10px"><b>Ranger\'s notes</b>'+tips.filter(Boolean).map(t=>'<p>'+esc(t)+'</p>').join('')+'</div>'}
function fhPanel(n){const S=n.scene&&FHSHOP[n.scene];let h=head(S?S.title:n.scene==='fh_ranger'?'Ranger\'s Cabin':'Frosthollow',n.name,TALKQ);
 h+=sideCard(n);
 if(S){h+=fhShopHTML(S);if(n.id==='elowen'){h+=row('fh_rest',nightNow()||dark()>.3?'Rent a bed for the night':'Rest a while',(nightNow()||dark()>.3?'25 gold · sleep until morning, wake up healed':'25 gold · heal fully and get a hot meal'),GLD>=25);
   let ck='';for(const c of COOKS){const q=inv[c.raw]|0;if(!q)continue;const ok=lvOf(4)>=c.lv;ck+=row('fhck_'+c.raw,'Cook all '+esc(iname(c.raw))+' ('+q+')',ok?'at the lodge hearth · '+c.xp+' Cooking XP each':'Needs Cooking '+c.lv,ok)}
   if(ck)h+='<div class="tl" style="font-size:13px;margin-top:10px">THE HEARTH</div>'+ck}}
 if(n.id==='torren'){h+=torrenNotes();if(SQ_SIDE.frosthollow.completed)h+=row('fh_tbed','Sleep in the cabin','Free for a friend of Frosthollow · '+(nightNow()||dark()>.3?'sleep until morning':'rest and heal'),true)}
 return h+jobCard(n)}
const _r41=rPn;rPn=function(){if(ptab===2&&shop==='fhfolk'){if(!TALKN||TALKN.kind!=='fhfolk'){TALKN=nearNpc();const n=TALKN;TALKQ=n?(n.scene&&FHSHOPQ[n.id]&&Math.random()<.5?FHSHOPQ[n.id][Math.floor(Math.random()*2)]:pickLine(n)):''}
  panelChrome('');if(!TALKN){closePanel();return}pbd.innerHTML=fhPanel(TALKN);return}_r41()};
function fhSleep(paid){if(paid&&GLD<25){say('Not enough gold');sfx('swish');return}if(paid)GLD-=25;P.hp=6;hunger=100;
 if(nightNow()||dark()>.3){time=(Math.floor(time/DAYLEN)+1)*DAYLEN+1;en=[];say(paid?'You slept at the Ember Lodge. Good morning!':'You slept by Torren\'s fire. Good morning!');closePanel()}else say('You rest by the fire. You feel great!');sfx('quest');saveNow()}
const _xa41=xAct;xAct=function(a){const n=TALKN;
 if(a.startsWith('fhb_')){const m=a.match(/^fhb_(.+)_(\d+)$/);if(!m)return;const k=m[1],q=+m[2],S=n&&FHSHOP[n.scene],it=S&&S.items.find(e=>e[0]===k);if(!it)return;const c=it[2]*q;
  xbuy(c,()=>{if(k==='firekit'){inv.wood=(inv.wood|0)+3*q;inv.stone=(inv.stone|0)+q}else inv[k]=(inv[k]|0)+q},'Bought '+(q>1?q+' × ':'')+it[1].replace(/ \(.*/,'').toLowerCase());svg();saveLocal(true);rPn();return}
 if(a==='fh_rest'){fhSleep(true);if(pnOpen)rPn();return}
 if(a==='fh_tbed'){if(SQ_SIDE.frosthollow.completed)fhSleep(false);if(pnOpen)rPn();return}
 if(a.startsWith('fhck_')){const raw=a.slice(5),c=COOKS.find(q=>q.raw===raw);if(!c||lvOf(4)<c.lv)return;const st=STATION;STATION={t:'stove',i:-1,inside:true,lodge:1};try{stationAct('ck_'+raw)}finally{STATION=st}return}
 if(a.startsWith('sq_')){sideAct(a.slice(3),n);saveNow();rPn();return}
 const was=n&&n.kind==='fhfolk'&&a==='job'?JOBD[n.id]:null;_xa41(a);if(n&&n.kind==='fhfolk'&&a==='job'&&JOBD[n.id]!==was){TALKQ=FHTHANKS[n.id]||'Thank you!';saveNow();rPn()}};
// --- entering rooms ---
const _es41=enterScene;enterScene=function(id,house,ret){_es41(id,house,ret);if(!FHNAMES[id])return;
 const k=FHN.find(n=>n.work===id);if(k&&k.scene!==id&&k.id!=='elowen'){say(FHNAMES[id][0].toUpperCase()+FHNAMES[id].slice(1)+' is closed for the night. '+k.name+' has gone home.');return}
 say({fh_pine:'Pine & Plank. It smells of fresh sawdust.',fh_lodge:'The Ember Lodge. A fire crackles in the hearth.',fh_work:'The Northwind Workshop. Tools hang on every wall.',fh_ranger:'The Ranger\'s Cabin. Maps, shields and a well-hit training dummy.'}[id]||('This is '+FHNAMES[id]+'.'))};
// --- update: routines, safe streets, welcome ---
let fhPrev=false;
const _u41=upd;upd=function(dt){_u41(dt);if(menuOpen||!FHON)return;fhRoutine(dt);if(pnOpen||SCENE)return;const x=Math.floor(P.x/16),y=Math.floor(P.y/16),inT=inFHBox(x,y);
 if(inT&&!fhPrev&&!dead){say('Welcome to Frosthollow! Smoke curls from every chimney.');msgT=3}fhPrev=inT;
 en=en.filter(n=>!inFHBox(Math.floor(n.x/16),Math.floor(n.y/16)))};
// --- drawing: stone steps in the snow and an iced-over pond (baked into the terrain chunks) ---
let FHPAV=null;
function fhPavers(){if(FHPAV)return FHPAV;FHPAV=[];const SP=hdP(['#5a6070','#727a8a','#8a92a2','#a2aaba','#bcc4d2']);
 for(let v=0;v<4;v++){const b=hdBuf(32,32);hdSeed=311+v*97;const stones=[];for(let k=0;k<5;k++)stones.push([4+hdR()*24,4+hdR()*24,4+hdR()*3.5,3+hdR()*3]);
  for(const[cx,cy,rx,ry]of stones)for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){if(x<0||y<0||x>31||y>31)continue;const d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(d>1)continue;
   const sh=(cy-y)/ry*.35-(x-cx)/rx*.1;hdSet(b,x,y,d>.75&&y<cy?hdC('#f4f8fc'):SP[hdQ(.45+sh+(hdH(x+v*40,y)-.5)*.2,5,x,y)],1)}
  hdOutline(b,{1:hdC('#3a4050')});FHPAV.push(hdCan(b))}return FHPAV}
const _hb41=hdBake;hdBake=function(kx,ky){const c=_hb41(kx,ky);if(!FHON)return c;const S=HDCS*32,x0=kx*HDCS,y0=ky*HDCS;let ctx=null;
 for(let ty=y0;ty<y0+HDCS;ty++)for(let tx=x0;tx<x0+HDCS;tx++){const i=ty*N+tx;
  if(FHPATH.has(i)){ctx=ctx||c.getContext('2d');const P2=fhPavers();ctx.drawImage(P2[Math.floor(hrand(tx,ty)*4)%4],(tx-x0)*32,(ty-y0)*32)}
  else if(FHPOND.has(i)){ctx=ctx||c.getContext('2d');const px=(tx-x0)*32,py=(ty-y0)*32,sx=Math.max(0,px-6),sy=Math.max(0,py-6),sw=Math.min(S,px+38)-sx,sh=Math.min(S,py+38)-sy,im=ctx.getImageData(sx,sy,sw,sh);const d=im.data,W2=sw;
   for(let q=0;q<d.length;q+=4){const r=d[q],gg=d[q+1],bb=d[q+2];if(bb>r+40&&bb>=gg){const X=(q/4)%W2,Y=(q/4/W2)|0,wx=sx+X+kx*S,wy=sy+Y+ky*S,n2=hdVN(wx/9,wy/9),cr=Math.abs(hdVN(wx/14+7,wy/14)-.5)<.012;
     const col=cr?[226,240,250]:n2>.62?[214,234,248]:n2>.38?[190,220,240]:[168,204,232];d[q]=col[0];d[q+1]=col[1];d[q+2]=col[2]}}
   ctx.putImageData(im,sx,sy)}}
 if(ctx&&FHPOND.size){const mid=[...FHPOND].find(i=>i%N===FX-1&&((i/N)|0)===FY);if(mid!=null){const tx=mid%N,ty=(mid/N)|0;if(tx>=x0&&tx<x0+HDCS&&ty>=y0&&ty<y0+HDCS){const px=(tx-x0)*32+10,py=(ty-y0)*32+10;
   ctx.fillStyle='#1c3c6c';ctx.beginPath();ctx.ellipse(px+6,py+5,7,5,0,0,6.283);ctx.fill();ctx.fillStyle='#2a5a98';ctx.beginPath();ctx.ellipse(px+6,py+6,5,3,0,0,6.283);ctx.fill();ctx.fillStyle='#f4f8fc';ctx.fillRect(px,py+9,12,1)}}}
 return c};
// snowy roofs, chimneys and shop signs
const _drb41=drBld;drBld=function(b,tm){_drb41(b,tm);if(!b.fh)return;const X0=b.tx*16,w=b.w*16,base=(b.ty+2)*16;
 // chimney with smoke
 const cx=X0+w-16;Rg(cx,base-62,9,13,O);Rg(cx+1,base-61,7,12,'#8a8890');Rg(cx+1,base-61,7,2,'#f4f8fc');for(let i=0;i<3;i++){const k=(tm*10+i*7+b.tx)%22;g.fillStyle='rgba(225,228,236,'+(.75-k/30)+')';g.fillRect(cx+3+Math.sin(tm*1.6+i*2)*2.5,base-66-k,2.5+k/8,2.5+k/8)}
 // snow on the roof
 g.fillStyle='#f4f8fc';g.fillRect(X0-4,base-54,w+8,4);g.fillStyle='#dce6f2';g.fillRect(X0-4,base-50.5,w+8,1);for(let x=X0-3;x<X0+w+3;x+=5){const h=1+((x*7+b.ty)%3);g.fillStyle='#f4f8fc';g.fillRect(x,base-50.5,2.5,h);g.fillStyle='#e4ecf6';g.fillRect(x,base-29.5,2,1+((x*3)%2))}
 if(!b.sc)return;const dx=X0+(w>>1)-6;Rg(dx-4,base-27,20,8,O);Rg(dx-3,base-26,18,6,b.sc);
 if(b.ic==='axe'){Rg(dx+2,base-25,1,5,'#7a4a20');Rg(dx+3,base-25,4,3,'#a0a8b8');Rg(dx+8,base-25,5,3,'#6a8a5a')}
 else if(b.ic==='mug'){Rg(dx+2,base-25,6,4,'#f8f0e0');Rg(dx+8,base-24,2,2,'#a87850');Rg(dx+3,base-23,4,2,'#d08830')}
 else if(b.ic==='hammer'){Rg(dx+5,base-25,1,5,'#7a4a20');Rg(dx+2,base-25,7,2,'#6a7080');Rg(dx+8,base-24,3,1,'#6a7080')}
 else{Rg(dx+3,base-26,1,6,'#7a4a20');Rg(dx+4,base-26,1,1,'#7a4a20');Rg(dx+4,base-21,1,1,'#7a4a20');Rg(dx+5,base-25,1,4,'#e8e0c8');Rg(dx+5,base-23,6,1,'#5a3a1a')}};
// the well and the den's cave mouth are depth-sorted with everything else
function drawDenMouth(tm){if(!FHDEN)return;const x0=FHDEN.x*16,y0=FHDEN.y*16;
 e54DrawCave('ice',x0,y0);if(Math.sin(tm*1.7)>.75){Rg(x0+5,y0+6,1.5,1,'#58c8ff');Rg(x0+10,y0+6,1.5,1,'#58c8ff')}}
const _lh41=LHOOK;LHOOK=(L,x0,y0,x1,y1,tm)=>{_lh41(L,x0,y0,x1,y1,tm);if(!FHON)return;
 if(FHWELL&&FHWELL[0]>=x0-3&&FHWELL[0]<=x1+3&&FHWELL[1]>=y0-3&&FHWELL[1]<=y1+4)L.push([(FHWELL[1]+1)*16-2,4,()=>drawWell(FHWELL[0],FHWELL[1])]);
 if(FHDEN&&FHDEN.x>=x0-3&&FHDEN.x<=x1+3&&FHDEN.y>=y0-3&&FHDEN.y<=y1+4)L.push([(FHDEN.y+1)*16-6,4,()=>drawDenMouth(tm)])};
// map
const _dmap41=drawMap;drawMap=function(){_dmap41();if(!FHON)return;const c=document.getElementById('mpc');if(!c)return;const x=c.getContext('2d');
 x.fillStyle='#8a92a2';for(const i of FHPATH)x.fillRect(i%N,(i/N)|0,1,1);
 x.fillStyle='#101010';x.fillRect(FX-2,FY-2,5,5);x.fillStyle='#a8e0ff';x.fillRect(FX-1,FY-1,3,3);
 if(FHDEN){x.fillStyle='#101010';x.fillRect(FHDEN.x-1,FHDEN.y-1,3,3);x.fillStyle='#58c8ff';x.fillRect(FHDEN.x,FHDEN.y,1,1)}};
const _mh41=mapHTML;mapHTML=function(){const h=_mh41();return FHON?h.replace('</span>','</span><span><i style="background:#a8e0ff"></i>Frosthollow</span><span><i style="background:#58c8ff"></i>Frostfang Den</span>'):h};
// music: quiet bells over soft strings
SONGS.frost={bpm:84,lead:'E5 - B4 - G4 - B4 - E5 - F#5 - G5 - - - F#5 - D5 - A4 - D5 - F#5 - E5 - - - - E5 - B4 - C5 - D5 - E5 - B4 - G4 - - - A4 - B4 - E4 - - - - - - -',
 bass:'E2 - - - B2 - - - E2 - - - B2 - - - D2 - - - A2 - - - D2 - - - A2 - - - C2 - - - G2 - - - G2 - - - D2 - - - E2 - - - B2 - - - E2 - - - - - - -'};
PARSED.frost={bpm:SONGS.frost.bpm,lead:parseTrack(SONGS.frost.lead),bass:parseTrack(SONGS.frost.bass)};
const _ws41=wantSong;wantSong=function(){const w=_ws41();if(!FHON)return w;if(!SCENE&&w==='day'&&inFHBox(Math.floor(P.x/16),Math.floor(P.y/16)))return'frost';if(SCENE&&FHNAMES[SCENE.id])return'frost';return w};
const _cp41=closePanel;closePanel=function(){_cp41();if(TALKN&&TALKN.kind==='fhfolk')TALKN=null};
const _ng41=newGame;newGame=function(){_ng41();for(const n of FHN){n.scene=n.work;if(n.work){n.x=n.wx;n.y=n.wy}else{n.x=n.hx0;n.y=n.hy0}}};
