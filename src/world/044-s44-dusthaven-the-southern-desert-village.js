// ---------------------------------------------------------------- 44. Dusthaven: the southern desert village
// A sandstone mining settlement around an oasis: the Sandstone Market, the Copper Sun Forge, the Oasis Rest (inn),
// the Excavator's Hall (mining notes, an ore collection, a working furnace + anvil, and a mining yard outside),
// four cottages, a watchtower, palms and an irrigation channel. A desert trail runs south from Hollow Village.
// Placement: the spec's anchor (64,91) is the water's edge, so the registry looks for the closest spot within 10 tiles
// that is desert, keeps clear of the tomb, the trader's camp and the coast, and may flatten a small rock outcrop.
EXTRA_TOWNS.push({id:'dusthaven',name:'Dusthaven',x:64*HSC,y:91*HSC,rx:9,ry:6,biome:'desert',fw:9,fh:7});
const DHT=EXTRA_TOWNS[1];
function canPlaceDesert(cx,cy,rx,ry){let mtn=0;for(let dy=-ry-2;dy<=ry+2;dy++)for(let dx=-rx-2;dx<=rx+2;dx++){if((dx/(rx+.5))**2+(dy/(ry+.5))**2>1)continue;
  const x=cx+dx,y=cy+dy,i=y*N+x;if(x<3||y<3||x>N-4||y>N-4)return false;if(PROT.has(i)||BS.has(i)||TOWNZ.has(i)||FHZ.has(i)||inVillage(x,y)||tile[i]===0)return false;
  if(tile[i]===3){mtn++;continue}if(tile[i]!==5&&tile[i]!==1)return false}
 if(mtn>6)return false;for(const d of[CAVE,TOMB,TRADER])if(d&&Math.abs(cx-d.x)<rx+6&&Math.abs(cy-d.y)<ry+6)return false;return true}
const DHSPOT=(()=>{for(let r=0;r<=10*HSC;r++){let best=null,bd=1e9;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const d=Math.hypot(dx,dy);
  if(d<=10*HSC&&d<bd&&canPlaceDesert(DHT.x+dx,DHT.y+dy,DHT.fw,DHT.fh)){bd=d;best=[DHT.x+dx,DHT.y+dy]}}if(best)return best}return null})();
const DX=DHSPOT?DHSPOT[0]:-99,DY=DHSPOT?DHSPOT[1]:-99,DHON=!!DHSPOT;
var DHZ=new Set(),DHPATH=new Set();const DHPOOL=new Set(),DHCH=new Set(),DHB=[],DHPALM=[],DHYARD=[];let DHTOWER=null,DHRUIN=null;
const inDH=(x,y)=>DHON&&((x-DX)/(DHT.fw+.5))**2+((y-DY)/(DHT.fh+.5))**2<=1;
const inDHBox=(x,y)=>DHON&&Math.abs(x-DX)<=DHT.fw+1&&Math.abs(y-DY)<=DHT.fh+1;
if(DHON){
 for(let y=DY-DHT.fh-1;y<=DY+DHT.fh+1;y++)for(let x=DX-DHT.fw-1;x<=DX+DHT.fw+1;x++)if(inDH(x,y)){const i=y*N+x;DHZ.add(i);tile[i]=5;obj[i]=null;TG.delete(i)}
 const dp=(x,y)=>{const i=y*N+x;if(DHCH.has(i)||(tile[i]===0&&!DHZ.has(i))){BRIDGE.add(i);ROADS.add(i);tile[i]=1}else tile[i]=5;obj[i]=null;DHPATH.add(i);PROT.add(i)};
 // the oasis and its irrigation channel (east-west through town); streets cross it on little bridges
 for(let y=DY-2;y<=DY+1;y++)for(let x=DX-3;x<=DX+3;x++)if(((x-DX)/2.8)**2+((y-DY+.4)/1.9)**2<=1){const i=y*N+x;tile[i]=0;DHPOOL.add(i);PROT.add(i)}
 for(let x=DX-DHT.fw;x<=DX+DHT.fw;x++){const i=(DY+1)*N+x;if(DHPOOL.has(i))continue;tile[i]=0;DHCH.add(i);PROT.add(i)}
 for(let x=DX-9;x<=DX+9;x++){dp(x,DY-4);dp(x,DY+5)}                         // two streets
 for(let y=DY-4;y<=DY+5;y++){dp(DX-4,y);dp(DX+4,y)}                         // lanes (bridges over the channel)
 for(const sx of[-1,1]){for(let x=DX+sx*9;x!==DX+sx*3;x-=sx)dp(x,DY)}        // paths to the middle houses
 for(let y=DY-DHT.fh-1;y<=DY-4;y++)dp(DX-4,y);                               // north entrance (trail to Hollow)
 for(let y=DY+5;y<=DY+DHT.fh+1;y++)dp(DX+4,y);                               // south exit (trail to the ruins)
 const B=(k,dx,dy,o)=>{const b=Object.assign({k,tx:DX+dx,ty:DY+dy,w:5,dh:1},o);DHB.push(b);BLD.push(b);for(let y=b.ty;y<b.ty+2;y++)for(let x=b.tx;x<b.tx+b.w;x++){const i=y*N+x;tile[i]=5;obj[i]=null;PROT.add(i);if(!(x===b.tx+2&&y===b.ty+1))BS.add(i)}};
 B('dh_market',-9,-6,{wall:'#e0b880',roof:'#c89858',aw:['#e85838','#f8e8c0'],sc:'#f0d090',ic:'coin',n:'Sandstone Market'});
 B('dh_forge',-2,-6,{wall:'#c89868',roof:'#a87848',aw:['#3a5a8a','#e8d8b8'],sc:'#e8a050',ic:'anvil',n:'Copper Sun Forge'});
 B('dh_rest',5,-6,{wall:'#e8c890',roof:'#c8a060',aw:['#2a8a7a','#f8f0d8'],sc:'#a8e0d0',ic:'mug',n:'Oasis Rest'});
 B('dh_hall',-9,-2,{wall:'#d0a470',roof:'#a8804c',sc:'#c8b8a0',ic:'pick',n:'Excavator\'s Hall'});
 B('dh1',5,-2,{wall:'#e4c08c',roof:'#c09460'});B('dh2',-9,3,{wall:'#dcb47e',roof:'#b88c58'});B('dh3',-2,3,{wall:'#e8c494',roof:'#c49c68'});B('dh4',5,3,{wall:'#d8ac74',roof:'#b08450'});
 for(const b of DHB)BS.delete((b.ty+1)*N+b.tx+2);
 for(const[dx,dy]of[[-5,-3],[5,-3],[-3,4],[3,4],[-1,6]]){const x=DX+dx,y=DY+dy,i=y*N+x;if(DHPATH.has(i)||DHPOOL.has(i)||DHCH.has(i))continue;LAMPS.push([x,y]);BS.add(i);PROT.add(i)}
 for(const[dx,dy]of[[-3,-1],[3,-1],[-2,-3],[2,0]]){const x=DX+dx,y=DY+dy,i=y*N+x;if(DHPATH.has(i)||DHPOOL.has(i)||DHCH.has(i)||BS.has(i))continue;DHPALM.push([x,y]);BS.add(i);PROT.add(i)}
 for(const[dx,dy]of[[2,-8],[-8,7],[8,7],[-1,-8]]){const x=DX+dx,y=DY+dy,i=y*N+x;if((tile[i]===5||tile[i]===1)&&!DHPATH.has(i)&&!BS.has(i)&&!PROT.has(i)&&!obj[i]){DHTOWER=[x,y];BS.add(i);PROT.add(i);break}}
 SIGNS.set((DY-DHT.fh)*N+DX-5,'DUSTHAVEN - mining village of the south. North: Hollow Village.');
 for(const i of DHZ)PROT.add(i);
 // a mining yard just outside the hall: ordinary stone and iron nodes (they regrow; not protected so they can be mined)
}
// --- trails: north to Hollow Village, south-east to the ruins of Scorpion Hollow ---
let DHTRAIL=[],RUINTRAIL=[];
if(DHON){
 DHTRAIL=trailPath(VX,VY+8,DX-4,DY-DHT.fh-1,()=>false);layTrail(DHTRAIL);
 {const st=DHTRAIL.find(i=>((i/N)|0)>=VY+10);if(st!=null){const x=st%N,y=(st/N)|0;for(const dx of[-1,1]){const i=y*N+x+dx;if(tile[i]!==0&&!DHPATH.has(i)&&!FHPATH.has(i)&&!ROADS.has(i)&&!BS.has(i)){SIGNS.set(i,'South: Dusthaven, a mining village in the desert. Skeletons roam at night.');break}}}}
 // the ruins: preferred near (76,95) (that's sea), else the closest clear patch of desert south-east of the village
 const ok=(x,y)=>{if(x<5||y<5||x>N-6||y>N-6)return false;for(let dy=-2;dy<=2;dy++)for(let dx=-3;dx<=3;dx++){const i=(y+dy)*N+x+dx;if(tile[i]===0||tile[i]===3||PROT.has(i)||BS.has(i)||inDH(x+dx,y+dy)||DHZ.has(i))return false}
  for(const d of[TOMB,TRADER])if(d&&Math.abs(x-d.x)<8&&Math.abs(y-d.y)<8)return false;return Math.hypot(x-DX,y-DY)<28*HSC&&tile[y*N+x]===5};
 let best=null,bd=1e9;for(let y=5;y<N-5;y++)for(let x=5;x<N-5;x++){if(!ok(x,y))continue;const d=Math.hypot(x-76*HSC,y-95*HSC);if(d<bd){bd=d;best=[x,y]}}
 if(best){const[x,y]=best;DHRUIN={x,y};for(let dy=-1;dy<=0;dy++)for(let dx=-2;dx<=2;dx++){const i=(y+dy)*N+x+dx;tile[i]=5;obj[i]=null;BS.add(i);PROT.add(i)}
  for(const[dx,dy]of[[0,1],[-1,1],[1,1],[0,2],[-2,1],[2,1]]){const i=(y+dy)*N+x+dx;tile[i]=5;obj[i]=null;PROT.add(i)}
  RUINTRAIL=trailPath(DX+4,DY+DHT.fh+1,x,y+1,()=>false);layTrail(RUINTRAIL);
  const nr=RUINTRAIL[Math.min(3,RUINTRAIL.length-1)];if(nr!=null){const nx=nr%N,ny=(nr/N)|0;for(const dx of[1,-1]){const i=ny*N+nx+dx;if(tile[i]!==0&&!DHPATH.has(i)&&!BS.has(i)&&!inDH(nx+dx,ny)){SIGNS.set(i,'Scorpion Hollow: the old dig site. Attack 20 and Defence 20 recommended.');break}}}}
 for(const i of SIGNS.keys()){if(tile[i]===0)tile[i]=5;obj[i]=null;BS.add(i);PROT.add(i)}
 for(const i of PROT)TG.delete(i)
 // a mining yard just outside town, nearest the hall: ordinary stone and iron nodes (not protected, so they can be mined and regrow)
 {const hx=DX-8,hy=DY-9,c=[];for(let y=DY-12;y<=DY+10;y++)for(let x=DX-14;x<=DX+14;x++){const i=y*N+x;if(DHZ.has(i)||tile[i]!==5||obj[i]||BS.has(i)||PROT.has(i)||inDH(x,y))continue;
   let bad=false;for(let ay=-1;ay<=1;ay++)for(let ax=-1;ax<=1;ax++){const j=(y+ay)*N+x+ax;if(DHPATH.has(j)||ROADS.has(j)||BRIDGE.has(j)||DHZ.has(j)||BS.has(j))bad=true}if(bad)continue;c.push([Math.hypot(x-hx,y-hy),i])}
  c.sort((a,b)=>a[0]-b[0]);const T=['rock','ore','rock','ore','rock'];const c0=c.length?c[0][1]:-1;for(const[,i]of c){if(DHYARD.length>=5)break;if(c0>=0&&Math.hypot(i%N-c0%N,((i/N)|0)-((c0/N)|0))>4.5)continue;if(DHYARD.some(j=>Math.abs(j%N-i%N)<2&&Math.abs(((j/N)|0)-((i/N)|0))<2))continue;const t=T[DHYARD.length];obj[i]={t,hp:OHP[t]||4};DHYARD.push(i)}
  const f=DHYARD[0];if(f!=null){for(const[ax,ay]of[[0,-1],[-1,0],[1,0],[0,1],[-1,-1],[1,-1],[0,-2],[-2,0],[2,0],[0,2]]){const i=f+ay*N+ax;if(tile[i]===5&&!obj[i]&&!BS.has(i)&&!PROT.has(i)&&!DHZ.has(i)){SIGNS.set(i,'Excavator\'s yard: stone and iron to practise on. Ask Doran in the hall for tips.');PROT.add(i);break}}}}}
// --- rooms ---
const DFL=['#d8b888','#ccac7c'],DWL='#f0dcb8';
Object.assign(ROOMS,{
 dh_market:fhRoom(9,7,DFL,DWL,'#c85838',[{t:'shelf',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'shelf',x:6,y:0,w:3},{t:'counter',x:1,y:3,w:4,solid:1},{t:'barrel',x:7,y:2,solid:1},{t:'table',x:6,y:4,w:2,solid:1,goods:1},{t:'plant',x:8,y:5,solid:1},{t:'rug',x:3,y:5,w:3}]),
 dh_forge:fhRoom(9,7,['#b8a088','#ac947c'],'#e0c8a8','#3a5a8a',[{t:'rack',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'rack',x:6,y:0,w:3},{t:'counter',x:1,y:3,w:3,solid:1},{t:'furnace',x:7,y:2,solid:1},{t:'furnace',x:8,y:2,solid:1},{t:'anvil',x:6,y:4,solid:1},{t:'barrel',x:8,y:5,solid:1}]),
 dh_rest:fhRoom(11,8,['#e0c498','#d4b88c'],'#f8ecd4','#2a8a7a',[{t:'shelf',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'window',x:7,y:0},{t:'counter',x:0,y:3,w:4,solid:1},{t:'stove',x:0,y:2,solid:1},{t:'table',x:6,y:3,w:2,solid:1},{t:'table',x:8,y:5,w:2,solid:1},{t:'table',x:2,y:6,w:2,solid:1},{t:'bed',x:10,y:2,sh:2,solid:1},{t:'plant',x:10,y:6,solid:1},{t:'rug',x:4,y:6,w:3}]),
 dh_hall:fhRoom(9,7,['#c8a878','#bc9c6c'],'#e8d4b0','#6a4820',[{t:'orecase',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'orecase',x:6,y:0,w:3},{t:'furnace',x:0,y:3,solid:1},{t:'anvil',x:1,y:4,solid:1},{t:'table',x:4,y:3,w:2,solid:1},{t:'barrel',x:8,y:3,solid:1},{t:'rug',x:3,y:5,w:3}]),
 dh1:fhRoom(8,6,DFL,DWL,'#c85838',[{t:'window',x:2,y:0},{t:'shelf',x:5,y:0,w:2},{t:'bed',x:1,y:2,sh:2,solid:1},{t:'table',x:4,y:3,w:2,solid:1},{t:'plant',x:7,y:2,solid:1},{t:'rug',x:3,y:4,w:2}]),
 dh2:fhRoom(8,6,['#d0b080','#c4a474'],DWL,'#3a5a8a',[{t:'window',x:2,y:0},{t:'rack',x:5,y:0,w:2},{t:'bed',x:1,y:2,sh:2,solid:1},{t:'table',x:4,y:3,w:2,solid:1},{t:'barrel',x:7,y:2,solid:1},{t:'rug',x:3,y:4,w:2}]),
 dh3:fhRoom(8,6,['#dcc094','#d0b488'],DWL,'#2a8a7a',[{t:'window',x:2,y:0},{t:'shelf',x:5,y:0,w:2},{t:'bed',x:1,y:2,sh:2,solid:1},{t:'table',x:4,y:3,w:2,solid:1},{t:'plant',x:7,y:2,solid:1},{t:'rug',x:3,y:4,w:2}]),
 dh4:fhRoom(8,6,['#c8a474','#bc9868'],DWL,'#6a4820',[{t:'window',x:3,y:0},{t:'orecase',x:5,y:0,w:2},{t:'bed',x:1,y:2,sh:2,solid:1},{t:'bed',x:6,y:2,sh:2,solid:1},{t:'table',x:3,y:3,w:2,solid:1},{t:'rug',x:3,y:5,w:2}])});
// the ore collection: shelves of stone, iron ore, bars and a few gems
const _df44=drawFurn;drawFurn=function(it,tm){if(it.t!=='orecase')return _df44(it,tm);const x0=it.x*16,y0=it.y*16,w=(it.w||2)*16;
 Rg(x0,y0-6,w,22,O);Rg(x0+1,y0-5,w-2,20,'#8a6038');for(const yy of[y0+1,y0+9])Rg(x0+1,yy,w-2,2,'#5a3a1a');
 const C=['#9a9aa8','#b88a6a','#d0d0e0','#e03050','#3060e0','#30b060','#f8d848','#7a7a88'];for(let r=0;r<2;r++)for(let k=0;k<w/6-1;k++){const c=C[(k*3+r*5+it.x)%C.length],xx=x0+3+k*6,yy=y0-3+r*8;Rg(xx,yy,4,4,O);Rg(xx+.5,yy+.5,3,3,c);Rg(xx+.5,yy+.5,1,1,'#ffffff')}};
// --- people ---
const DHN=[
 {kind:'dhfolk',id:'zahra',name:'Zahra',home:'dh1',work:'dh_market',wx:3*16,wy:2*16+10,bed:[1,2],ch:{sk:3,hs:3,hc:0,sh:6,pn:4,ht:0,hcol:0,so:1}},
 {kind:'dhfolk',id:'kellan',name:'Kellan',home:'dh2',work:'dh_forge',wx:2.5*16,wy:2*16+10,bed:[1,2],ch:{sk:2,hs:0,hc:4,sh:7,pn:2,ht:0,hcol:0,so:2}},
 {kind:'dhfolk',id:'mira',name:'Mira',home:'dh_rest',work:'dh_rest',wx:2*16,wy:2*16+10,bed:[10,2],ch:{sk:1,hs:2,hc:2,sh:3,pn:1,ht:0,hcol:0,so:3}},
 {kind:'dhfolk',id:'doran',name:'Doran',home:'dh4',work:'dh_hall',wx:6*16,wy:3*16+10,bed:[1,2],ch:{sk:4,hs:0,hc:6,sh:5,pn:2,ht:2,hcol:2,so:2}},
 {kind:'dhfolk',id:'tavi',name:'Tavi',home:'dh4',work:null,bed:[6,2],ch:{sk:3,hs:1,hc:1,sh:2,pn:1,ht:1,hcol:3,so:1}}];
if(DHON){for(const n of DHN){const hb=DHB.find(b=>b.k===n.home);n.door=hb?[hb.tx+2,hb.ty+1]:[DX,DY-4];n.town='dusthaven';n.hx0=(DX+(n.id==='tavi'?-6:0))*16+8;n.hy0=(DY+(n.id==='tavi'?-1:-3))*16+8;
  if(n.work){n.scene=n.work;n.x=n.wx;n.y=n.wy;n.dir=0;n.st=0}else{n.x=n.hx0;n.y=n.hy0}}
 NPCS.push(...DHN);FOLK.push(...DHN)}
const DHNAMES={dh_market:'the Sandstone Market',dh_forge:'the Copper Sun Forge',dh_rest:'the Oasis Rest',dh_hall:'the Excavator\'s Hall',dh1:'Zahra\'s cottage',dh2:'Kellan\'s cottage',dh3:'Mira\'s cottage',dh4:'Doran and Tavi\'s cottage'};
function townRoutine(list,dt,always){const night=nightNow();
 for(const n of list){const want=night&&n.id!==always?n.home+'#bed':n.work;
  if(SCENE&&n.scene===SCENE.id)continue;if(want===n.scene)continue;
  if(want===null){if(n.scene){n.scene=null;n.x=n.door[0]*16+8;n.y=(n.door[1]+1)*16+6;n.hx=n.hx0;n.hy=n.hy0;n.tx=n.hx0;n.ty=n.hy0;n.wt=0}continue}
  if(!n.scene&&want.endsWith('#bed')){const dx=n.door[0]*16+8,dy=(n.door[1]+1)*16+3;n.goT=(n.goT||0)+dt;
   if(SCENE||Math.hypot(P.x-n.x,P.y-n.y)>260||n.goT>14||Math.hypot(n.x-dx,n.y-dy)<5){n.scene=want;n.goT=0;if(!SCENE&&Math.hypot(P.x-n.x,P.y-n.y)<120)sfx('door')}else{n.hx=dx;n.hy=dy;n.tx=dx;n.ty=dy;n.wt=1}continue}
  n.scene=want;if(!want.endsWith('#bed')){n.x=n.wx;n.y=n.wy;n.dir=0;n.st=0}}}
Object.assign(LINES,{
 zahra:{d:['Everything has a price. Even shade!','The oasis keeps this village alive.'],x:['Something\'s stealing supplies from the market.']},
 kellan:{d:['Desert heat saves me a little furnace fuel.','Steel is worth the trouble.'],x:['Doran found strange tunnels beneath the dunes.']},
 mira:{d:['You look like you\'ve swallowed a sandstorm.','The best stories start with a full stomach.'],x:['Travelers have gone missing near Scorpion Hollow.'],n:['Still awake? The night wind howls out here.','Your room\'s ready. Sleep well.']},
 doran:{d:['The desert keeps its secrets underground.','I\'ve been digging here for twenty years.'],x:['There\'s something enormous beneath those ruins.']},
 tavi:{d:['I found a shiny rock! It was just a rock.','One day I\'ll own a diamond.'],x:['I heard scratching under the old mine.']}});
Object.assign(JOBS,{zahra:[{k:'berry',a:[5,5],s:3,x:8}],kellan:[{k:'ibar',a:[3,3],s:10,x:30}],mira:[{k:'bread',a:[3,3],s:4,x:40}],doran:[{k:'stone',a:[10,10],s:2,x:8}],tavi:[{k:'iron',a:[5,5],s:2,x:20}]});
const DHTHANKS={zahra:'Fresh berries sell fast in this heat. Thank you!',kellan:'Good iron. I\'ll put it to work.',mira:'Warm bread for the guests. Bless you!',doran:'Ha! That\'ll shore up a tunnel or two.',tavi:'Wow, real iron ore! Thanks!'};
const DHSHOP={
 dh_market:{who:'zahra',title:'Sandstone Market',items:[['berry','Berries',6],['bread','Bread',20],['cooked','Cooked meat',16],['bowl','Wooden bowl',12],['lantern','Iron lantern',90],['stone','Stone',8],['carrot','Carrot',12]]},
 dh_forge:{who:'kellan',title:'Copper Sun Forge',items:[['iron','Iron ore',18],['ibar','Iron bar',55],['sbar','Steel bar',115],['idag','Iron dagger',75],['sdag','Steel dagger',175],['nails','Iron nails',12],['brick','Stone brick',18]]},
 dh_rest:{who:'mira',title:'The Oasis Rest',items:[['stew','Fish stew',30],['bread','Bread',18],['jam','Berry jam',22],['cshrimp','Cooked shrimp',12]]}};
const DHSHOPQ={zahra:['Shade\'s free. Everything else costs.','Fresh from the caravans!'],kellan:['Hot work, hot steel.','Bars, blades, nails. Name it.'],mira:['Sit down before you fall down.','Water first, then stew.'],doran:['Mind the ore samples, they\'re older than you.','Pull up a crate.']};
function dhShopHTML(S){let h='<div class="tl" style="margin-top:10px">Gold: '+GLD+'</div><div class="tl" style="font-size:13px">BUY</div>';
 S.items.forEach(([k,n,c])=>{h+=row('dhb_'+k+'_1',n,c+' gold (you have '+(inv[k]|0)+')',GLD>=c);if(c<=20)h+=row('dhb_'+k+'_10','10 × '+n,c*10+' gold',GLD>=c*10)});return h}
function doranNotes(){const pk=['no pickaxe','a wooden pickaxe','a stone pickaxe','an iron pickaxe','a steel pickaxe'][Math.min(4,TL.pick|0)],t=[];
 t.push('Mining '+lvOf(2)+' with '+pk+'. '+(TL.pick<2?'Iron veins need a stone pickaxe or better.':TL.pick<3?'An iron pickaxe from the Hollow blacksmith digs twice as fast.':TL.pick<4?'Kellan can\'t make steel tools, but Brann in Saltmere can.':'A steel pick! Now you\'re a real excavator.'));
 t.push('Iron veins show up from Mining 5; ordinary rocks give iron too from Mining 15. Every rock has a small chance of a gem as your Mining grows.');
 t.push('The yard just west of the hall has stone and iron to practise on. The furnace and anvil in here are yours to use.');
 if(DHRUIN)t.push('Scorpion Hollow is the old dig south-east of town. Three levels; something big nests at the bottom. Attack 20 and Defence 20 at least.');
 return'<div class="qc" style="margin-top:10px"><b>Excavation notes</b>'+t.map(s=>'<p>'+esc(s)+'</p>').join('')+'</div>'}
function dhPanel(n){const S=n.scene&&DHSHOP[n.scene];let h=head(S?S.title:n.scene==='dh_hall'?'Excavator\'s Hall':'Dusthaven',n.name,TALKQ);h+=sideCard(n);
 if(S){h+=dhShopHTML(S);if(n.id==='mira')h+=row('dh_rest',nightNow()||dark()>.3?'Rent a bed for the night':'Rest a while',(nightNow()||dark()>.3?'30 gold · sleep until morning, wake up healed':'30 gold · heal fully and get a hot meal'),GLD>=30)}
 if(n.id==='doran'&&n.scene==='dh_hall'){h+=doranNotes();h+=forgeHTML()}
 return h+jobCard(n)}
const _r44=rPn;rPn=function(){if(ptab===2&&shop==='dhfolk'){if(!TALKN||TALKN.kind!=='dhfolk'){TALKN=nearNpc();const n=TALKN;TALKQ=n?(n.scene&&DHSHOPQ[n.id]&&Math.random()<.5?DHSHOPQ[n.id][Math.floor(Math.random()*2)]:pickLine(n)):''}
  panelChrome('');if(!TALKN){closePanel();return}pbd.innerHTML=dhPanel(TALKN);return}_r44()};
const _cp44=closePanel;closePanel=function(){_cp44();if(TALKN&&TALKN.kind==='dhfolk')TALKN=null};
const _xa44=xAct;xAct=function(a){const n=TALKN;
 if(a.startsWith('dhb_')){const m=a.match(/^dhb_(.+)_(\d+)$/);if(!m)return;const k=m[1],q=+m[2],S=n&&DHSHOP[n.scene],it=S&&S.items.find(e=>e[0]===k);if(!it)return;
  xbuy(it[2]*q,()=>{inv[k]=(inv[k]|0)+q},'Bought '+(q>1?q+' × ':'')+it[1].toLowerCase());svg();saveLocal(true);rPn();return}
 if(a==='dh_rest'){if(GLD<30){say('Not enough gold');sfx('swish');return}GLD-=30;P.hp=6;hunger=100;if(nightNow()||dark()>.3){time=(Math.floor(time/DAYLEN)+1)*DAYLEN+1;en=[];say('You slept at the Oasis Rest. Good morning!');closePanel()}else say('You rest in the shade. You feel great!');sfx('quest');saveNow();if(pnOpen)rPn();return}
 const was=n&&n.kind==='dhfolk'&&a==='job'?JOBD[n.id]:null;_xa44(a);if(n&&n.kind==='dhfolk'&&a==='job'&&JOBD[n.id]!==was){TALKQ=DHTHANKS[n.id]||'Thank you!';saveNow();rPn()}};
const _es44=enterScene;enterScene=function(id,house,ret){_es44(id,house,ret);if(!DHNAMES[id])return;
 const k=DHN.find(n=>n.work===id);if(k&&k.scene!==id&&k.id!=='mira'){say(DHNAMES[id][0].toUpperCase()+DHNAMES[id].slice(1)+' is closed for the night. '+k.name+' has gone home.');return}
 say({dh_market:'The Sandstone Market. Spices and dust in the air.',dh_forge:'The Copper Sun Forge. Two furnaces glow orange.',dh_rest:'The Oasis Rest. Cool shade at last.',dh_hall:'The Excavator\'s Hall: ore samples on every shelf, a furnace and an anvil.'}[id]||('This is '+DHNAMES[id]+'.'))};
let dhPrev=false;
const _u44=upd;upd=function(dt){_u44(dt);if(menuOpen||!DHON)return;townRoutine(DHN,dt,'mira');if(pnOpen||SCENE)return;const x=Math.floor(P.x/16),y=Math.floor(P.y/16),inT=inDHBox(x,y);
 if(inT&&!dhPrev&&!dead){say('Welcome to Dusthaven! The oasis shimmers in the heat.');msgT=3}dhPrev=inT;
 en=en.filter(n=>!inDHBox(Math.floor(n.x/16),Math.floor(n.y/16)))};
// --- drawing: sandstone flagstones, flat-roofed clay buildings with awnings, palms, the watchtower, the ruins ---
let DHPAV=null;
function dhPavers(){if(DHPAV)return DHPAV;DHPAV=[];const SP=hdP(['#9a7848','#b89060','#d0aa78','#e2c290','#f0d8a8']);
 for(let v=0;v<4;v++){const b=hdBuf(32,32);hdSeed=917+v*61;for(let r=0;r<3;r++){const h=9+Math.floor(hdR()*3),y0=1+r*11;let x=-Math.floor(hdR()*8);while(x<32){const w=9+Math.floor(hdR()*7);
   for(let y=y0;y<Math.min(32,y0+h-1);y++)for(let xx=Math.max(0,x+1);xx<Math.min(32,x+w-1);xx++){const sh=(y-y0)/h;hdSet(b,xx,y,SP[hdQ(.75-sh*.45+(hdH(xx+v*30,y)-.5)*.2,5,xx,y)],1)}x+=w}}
  hdOutline(b,{1:hdC('#6a4c28')});DHPAV.push(hdCan(b))}return DHPAV}
const _hb44=hdBake;hdBake=function(kx,ky){const c=_hb44(kx,ky);if(!DHON)return c;const x0=kx*HDCS,y0=ky*HDCS;let ctx=null;
 for(let ty=y0;ty<y0+HDCS;ty++)for(let tx=x0;tx<x0+HDCS;tx++){const i=ty*N+tx;if(DHPATH.has(i)&&!BRIDGE.has(i)){ctx=ctx||c.getContext('2d');ctx.drawImage(dhPavers()[Math.floor(hrand(tx,ty)*4)%4],(tx-x0)*32,(ty-y0)*32)}}
 return c};
const HDDB=new Map();
function hdDesertCan(b,w){const W2=(w+10)*2,H2=57*2,B=hdBuf(W2,H2),ox=5,oy=55;
 const F=(x,y,ww,hh,col,id)=>{const c=typeof col==='number'?col:hdC(col);for(let v=Math.round((y+oy)*2);v<Math.round((y+hh+oy)*2);v++)for(let u=Math.round((x+ox)*2);u<Math.round((x+ww+ox)*2);u++)hdSet(B,u,v,c,id||1)};
 const wl=b.wall,rf=b.roof,WP=[hdMix(wl,'#000000',.3),hdMix(wl,'#000000',.16),hdMix(wl,'#000000',.06),wl,hdMix(wl,'#ffffff',.28)],RP=[hdMix(rf,'#000000',.35),hdMix(rf,'#000000',.18),rf,hdMix(rf,'#ffffff',.25)];
 // clay walls: big sandstone blocks
 F(0,-32,w,32,WP[3],1);for(let r=0;r<6;r++){const y=-32+r*5.5,off=r%2?6:0;F(0,y,w,.5,WP[1],1);for(let x=off;x<w;x+=12)F(x,y,.5,5.5,WP[1],1);for(let x=off+1;x<w;x+=12)F(x,y+.5,5,1,WP[4],1)}
 for(let k=0;k<14;k++){const x=hdH(k,w)*(w-4),y=-30+hdH(k*7,w)*26;F(x,y,1.5,.5,WP[2],1)}
 F(0,-4,w,4,WP[1],1);F(0,-4,w,.5,WP[2],1);F(0,-.5,w,.5,WP[0],1);
 // flat roof slab, parapet with crenels, and wooden beam ends (vigas)
 F(-2,-38,w+4,6,RP[2],4);F(-2,-38,w+4,1,RP[3],4);F(-2,-33,w+4,1,RP[0],4);
 for(let x=-2;x<w+2;x+=8){F(x,-42,5,4,RP[2],4);F(x,-42,5,.5,RP[3],4)}
 for(let x=5;x<w-3;x+=10){F(x,-31,3,2.5,'#6a4424',2);F(x,-31,3,.5,'#8a5c34',2)}
 // windows: arched openings with teal shutters
 for(const wx of[7,w-18]){F(wx,-24,11,11,'#3a2818',3);F(wx+1,-23,9,10,'#1e140c',3);F(wx+2,-25,7,1.5,'#3a2818',3);F(wx-2,-24,2,11,'#2a8a7a',3);F(wx+11,-24,2,11,'#2a8a7a',3);F(wx-1,-13,13,1.5,WP[4],3)}
 // door: arched wooden door with studs
 const dx=(w>>1)-6;F(dx-1.5,-20,15,20,'#4a2a14',2);F(dx-1,-19.5,14,19.5,'#8a5428',2);F(dx+.5,-21.5,11,2,'#4a2a14',2);for(let k=0;k<4;k++)F(dx+k*3,-18,.5,18,'#5a3418',2);
 for(const yy of[-14,-6])for(let k=0;k<4;k++)F(dx+1.5+k*3,yy,1,1,'#d8b048',2);F(dx-2,-.5,16,1.5,'#b89060',2);
 // market awning over the door
 if(b.aw){for(let k=0;k<8;k++)F(dx-8+k*3.5,-26,3.5,5,k%2?b.aw[1]:b.aw[0],5);for(let k=0;k<8;k++)F(dx-7+k*3.5,-21,2,1.5,k%2?b.aw[1]:b.aw[0],5);F(dx-9,-26.5,30,1,'#5a3418',5);F(dx-9,-26,1,7,'#5a3418',5);F(dx+20,-26,1,7,'#5a3418',5)}
 hdOutline(B,{1:hdC(hdMix(wl,'#181018',.7)),2:hdC('#2a1a10'),3:hdC('#2a1a10'),4:hdC(hdMix(rf,'#181018',.7)),5:hdC('#3a1a10')});
 for(let u=8;u<W2-8;u++)for(let v=H2-3;v<H2;v++){const i=v*W2+u;if(!B.d[i])B.d[i]=0x38000000}
 return hdCan(B)}
const _bh44=BLDHD;BLDHD=function(b,X0,w,base){if(!b.dh)return _bh44(b,X0,w,base);const key=b.k+'|'+w;let c=HDDB.get(key);if(!c){c=hdDesertCan(b,w);HDDB.set(key,c)}g.drawImage(c,X0-5,base-55,c.width/2,c.height/2);return true};
const _drb44=drBld;drBld=function(b,tm){_drb44(b,tm);if(!b.dh||!b.sc)return;const X0=b.tx*16,w=b.w*16,base=(b.ty+2)*16,dx=X0+(w>>1)-10;
 Rg(dx,base-49,20,8,O);Rg(dx+1,base-48,18,6,b.sc);const ix=dx+6,iy=base-47;
 if(b.ic==='coin'){Rg(ix+1,iy,6,4,'#c89820');Rg(ix+2,iy+1,4,2,'#f8d848')}else if(b.ic==='anvil'){Rg(ix,iy+1,8,2,'#404050');Rg(ix+2,iy+3,4,1,'#404050')}
 else if(b.ic==='mug'){Rg(ix+1,iy,5,4,'#f8f0e0');Rg(ix+6,iy+1,2,2,'#a87850')}else{Rg(ix+3,iy,1,4,'#7a4a20');Rg(ix,iy,7,1,'#808898');Rg(ix,iy+1,1,1,'#808898');Rg(ix+6,iy+1,1,1,'#808898')}};
function drawPalm(x,y,tm){const px=x*16+8,py=y*16+14;shd(px,py,14);const sw=Math.sin(tm*1.2+x)*1.2;
 for(let k=0;k<8;k++){const yy=py-k*4,xx=px+Math.round(Math.sin(k*.35)*3);Rg(xx-2,yy-4,5,5,O);Rg(xx-1,yy-3,3,4,k%2?'#8a6038':'#a87848')}
 const tx=px+3,ty=py-34;g.fillStyle='#2a6a28';for(let a=0;a<6;a++){const an=a/6*6.283+.3,ex=tx+Math.cos(an)*13+sw,ey=ty+Math.sin(an)*6+4;g.strokeStyle=O;g.lineWidth=4;g.beginPath();g.moveTo(tx,ty);g.quadraticCurveTo((tx+ex)/2,ty-5,ex,ey);g.stroke();g.strokeStyle=a%2?'#3c9a38':'#56b04a';g.lineWidth=2.4;g.beginPath();g.moveTo(tx,ty);g.quadraticCurveTo((tx+ex)/2,ty-5,ex,ey);g.stroke()}
 Rg(tx-2,ty-1,2,2,'#7a4a20');Rg(tx+1,ty,2,2,'#7a4a20')}
function drawTower(x,y){const px=x*16,py=y*16;shd(px+8,py+15,20);Rg(px-1,py-36,18,52,O);Rg(px,py-35,16,50,'#d4a870');for(let r=0;r<10;r++)Rg(px,py-35+r*5,16,.5,'#b08850');
 Rg(px+5,py-26,6,9,O);Rg(px+6,py-25,4,7,'#1e140c');Rg(px-3,py-41,22,6,O);Rg(px-2,py-40,20,4,'#c09460');for(let k=0;k<4;k++)Rg(px-2+k*6,py-45,4,5,O),Rg(px-1+k*6,py-44,2,4,'#d4a870');
 Rg(px+7,py-60,1.5,16,'#5a3418');Rg(px+8.5,py-60,8,5,'#e85838')}
function drawRuins(tm){if(!DHRUIN)return;const x0=DHRUIN.x*16-32,y0=DHRUIN.y*16-16,S='#d0a870',D='#a07840';
 shd(x0+40,y0+30,72);e54Put(e54Ruin(),x0-8,y0-28);
 if(Math.sin(tm*1.4)>.7){Rg(x0+35,y0+12,1.5,1,'#ffa040');Rg(x0+42,y0+12,1.5,1,'#ffa040')}}
const _lh44=LHOOK;LHOOK=(L,x0,y0,x1,y1,tm)=>{_lh44(L,x0,y0,x1,y1,tm);if(!DHON)return;const inV=(x,y)=>x>=x0-3&&x<=x1+3&&y>=y0-3&&y<=y1+5;
 for(const[x,y]of DHPALM)if(inV(x,y))L.push([(y+1)*16-2,4,()=>drawPalm(x,y,tm)]);
 if(DHTOWER&&inV(...DHTOWER))L.push([(DHTOWER[1]+1)*16-2,4,()=>drawTower(...DHTOWER)]);
 if(DHRUIN&&inV(DHRUIN.x,DHRUIN.y))L.push([(DHRUIN.y+1)*16,4,()=>drawRuins(tm)])};
// map, music
const _dmap44=drawMap;drawMap=function(){_dmap44();if(!DHON)return;const c=document.getElementById('mpc');if(!c)return;const x=c.getContext('2d');
 x.fillStyle='#c8a068';for(const i of DHPATH)x.fillRect(i%N,(i/N)|0,1,1);x.fillStyle='#101010';x.fillRect(DX-2,DY-2,5,5);x.fillStyle='#f0a848';x.fillRect(DX-1,DY-1,3,3);
 if(DHRUIN){x.fillStyle='#101010';x.fillRect(DHRUIN.x-1,DHRUIN.y-1,3,3);x.fillStyle='#ff7830';x.fillRect(DHRUIN.x,DHRUIN.y,1,1)}};
const _mh44=mapHTML;mapHTML=function(){const h=_mh44();return DHON?h.replace('</span>','</span><span><i style="background:#f0a848"></i>Dusthaven</span><span><i style="background:#ff7830"></i>Scorpion Hollow</span>'):h};
SONGS.desert={bpm:108,lead:'D5 - F5 E5 D5 - A4 - C5 D5 - - E5 F5 E5 C5 D5 - - - A4 - D5 F5 G5 - F5 E5 D5 C5 A4 - D5 - - -',
 bass:'D2 - A2 - D2 - A2 - C2 - G2 - C2 - G2 - D2 - A2 - D2 - A2 - A1 - E2 - D2 - - -'};
PARSED.desert={bpm:SONGS.desert.bpm,lead:parseTrack(SONGS.desert.lead),bass:parseTrack(SONGS.desert.bass)};
const _ws44=wantSong;wantSong=function(){const w=_ws44();if(!DHON)return w;if(!SCENE&&w==='day'&&inDHBox(Math.floor(P.x/16),Math.floor(P.y/16)))return'desert';if(SCENE&&DHNAMES[SCENE.id])return'desert';return w};
const _ng44=newGame;newGame=function(){_ng44();for(const n of DHN){n.scene=n.work;if(n.work){n.x=n.wx;n.y=n.wy}else{n.x=n.hx0;n.y=n.hy0}}};
// --- Dusthaven's quest line ---
SIDE_QS.dusthaven.push(
 {n:'Tools of the Trade',d:'Bring Doran 8 iron ore.',type:'give',item:'iron',amt:8,r:{g:160,xp:[2,400]},giver:'doran',start:'We need more iron for the excavation.',finish:'Perfect. These should keep the tools working.'},
 {n:'Market Trouble',d:'Defeat 8 skeletons around the desert (near Dusthaven or in Scorpion Hollow).',type:'kill',item:'skel',amt:8,r:{g:200,xp:[0,500]},giver:'zahra',start:'Skeletons have been wandering into the market.',finish:'Perhaps they\'ll shop somewhere else now.'},
 {n:'Steel for the Expedition',d:'Bring 3 steel bars to Kellan.',type:'give',item:'sbar',amt:3,r:{g:300,xp:[10,650]},giver:'kellan',req:[10,20],start:'The expedition needs proper steel equipment.',finish:'Beautiful bars. They\'ll make excellent tools.'},
 {n:'Beneath the Dunes',d:'Defeat the Sandclaw Matriarch.',type:'dungeonboss',item:'scorpion',amt:1,r:{g:450,xp:[8,1100]},giver:'doran',start:'We\'ve uncovered a nest beneath the ruins.',finish:'The tunnels are safe again. Mostly.',note:'Attack 20 and Defence 20 recommended.'});
// skeletons count for Market Trouble near Dusthaven or inside Scorpion Hollow
const _ed44=enemyDrop;enemyDrop=function(n){_ed44(n);if(n.type!=='skel')return;const R=SCENE&&SCENE.room,inHollow=!!(R&&R.dun&&R.dun.kind==='scorpion');
 sqEvent('kill','skel',t=>t!=='dusthaven'||inHollow||(!SCENE&&DHON&&Math.hypot(n.x/16-DX,n.y/16-DY)<40));saveLocal(true)};
