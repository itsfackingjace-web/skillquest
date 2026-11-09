// ---------------------------------------------------------------- 46. Tidewatch: the western fishing village
// Blue-and-white cottages above the south-west shore: Silverhook Tackle, the Seabreeze Kitchen (food + beds), the
// Driftwood Trading Post, the Navigator's House (island notes, fishing advice and a telescope), four cottages, a plaza of
// drying nets, a fishing pier with a boat dock, and a lighthouse on the shore. A road runs west from Hollow Village.
// Placement: the anchor (15,56) is inland grass; the registry takes the closest spot with land for the whole village and
// a 4+ tile shoreline just south of it (2 tiles away), flattening a small rocky knoll.
EXTRA_TOWNS.push({id:'tidewatch',name:'Tidewatch',x:15*HSC,y:56*HSC,rx:7,ry:7,biome:'coast',fw:9,fh:7});
const TWT=EXTRA_TOWNS[2];
function canPlaceCoast(cx,cy,rx,ry){let mtn=0;for(let dy=-ry-2;dy<=ry+2;dy++)for(let dx=-rx-2;dx<=rx+2;dx++){if((dx/(rx+.5))**2+(dy/(ry+.5))**2>1)continue;const x=cx+dx,y=cy+dy,i=y*N+x;if(x<3||y<3||x>N-4||y>N-4)return null;
  if(PROT.has(i)||BS.has(i)||TOWNZ.has(i)||FHZ.has(i)||DHZ.has(i)||inVillage(x,y)||tile[i]===0)return null;if(tile[i]===3){mtn++;continue}if(tile[i]!==2&&tile[i]!==1)return null}
 if(mtn>10)return null;for(const d of[CAVE,TOMB,TRADER])if(d&&Math.abs(cx-d.x)<rx+6&&Math.abs(cy-d.y)<ry+6)return null;
 for(let y=cy+ry+1;y<=cy+ry+4;y++){let run=0;for(let x=cx-7;x<=cx+7;x++){run=tile[y*N+x]===0?run+1:0;if(run>=4)return{px:x-1,py:y}}}return null}
let TWPIER=null;
const TWSPOT=(()=>{let best=null,bd=1e9;for(let y=30*HSC;y<85*HSC;y++)for(let x=3;x<60*HSC;x++){const d=Math.hypot(x-TWT.x,y-TWT.y);if(d>=bd||d>14*HSC)continue;const s=canPlaceCoast(x,y,TWT.fw,TWT.fh);if(s){bd=d;best=[x,y,s]}}if(best)TWPIER=best[2];return best})();
const WX=TWSPOT?TWSPOT[0]:-99,WY=TWSPOT?TWSPOT[1]:-99,TWON=!!TWSPOT;
var TWZ=new Set(),TWPATH=new Set();const TWB=[],TWNET=[];let TWLIGHT=null,TWDOCK=[];
const inTW=(x,y)=>TWON&&((x-WX)/(TWT.fw+.5))**2+((y-WY)/(TWT.fh+.5))**2<=1;
const inTWBox=(x,y)=>TWON&&Math.abs(x-WX)<=TWT.fw+1&&Math.abs(y-WY)<=TWT.fh+1;
if(TWON){
 for(let y=WY-TWT.fh-1;y<=WY+TWT.fh+1;y++)for(let x=WX-TWT.fw-1;x<=WX+TWT.fw+1;x++)if(inTW(x,y)){const i=y*N+x;TWZ.add(i);tile[i]=2;obj[i]=null;TG.delete(i)}
 const tp=(x,y)=>{const i=y*N+x;if(tile[i]===0){BRIDGE.add(i);ROADS.add(i);tile[i]=1}else if(tile[i]!==1)tile[i]=2;obj[i]=null;TG.delete(i);TWPATH.add(i);PROT.add(i)};
 for(let x=WX-9;x<=WX+9;x++){tp(x,WY-4);tp(x,WY+5)}
 for(let y=WY-4;y<=WY+5;y++){tp(WX-4,y);tp(WX+4,y)}
 for(const sx of[-1,1])for(let x=WX+sx*9;x!==WX+sx*3;x-=sx)tp(x,WY);
 for(let x=WX+4;x<=WX+TWT.fw+1;x++)tp(x,WY);                                 // east road out
 // the pier: from the south street straight down to the shore, then out over the water, with a short dock
 if(TWPIER){const px=Math.max(WX-3,Math.min(WX+3,TWPIER.px));let y=WY+5;while(y<N-3&&tile[y*N+px]!==0){tp(px,y);y++}const y0=y;for(let k=0;k<5;k++){const i=(y0+k)*N+px;if(tile[i]!==0)break;BRIDGE.add(i);tile[i]=1;TWPATH.add(i);PROT.add(i);TWDOCK.push(i)}
  const end=y0+Math.max(0,TWDOCK.length-1);for(const dx of[-1,1,-2,2]){const i=end*N+px+dx;if(tile[i]===0){BRIDGE.add(i);tile[i]=1;TWPATH.add(i);PROT.add(i);TWDOCK.push(i)}}
  for(const[dx,dy]of[[-1,1],[1,2],[2,0]]){const bx=px+dx,by=y0+dy;if(tile[by*N+bx]===0&&!BRIDGE.has(by*N+bx))BOATS.push([bx,by])}
  // the lighthouse: on the shore beside the pier
  let best=null,bd=1e9;for(let yy=y0-3;yy<=y0+1;yy++)for(let xx=px-7;xx<=px+7;xx++){const i=yy*N+xx;if(tile[i]===0||tile[i]===3||TWPATH.has(i)||BS.has(i)||PROT.has(i)&&!TWZ.has(i))continue;if(TWZ.has(i)&&inTW(xx,yy)&&yy<WY+6)continue;
   if(![[1,0],[-1,0],[0,1]].some(([a,b])=>tile[(yy+b)*N+xx+a]===0))continue;const d=Math.abs(xx-px)+(Math.abs(xx-px)<2?9:0);if(d<bd){bd=d;best=[xx,yy]}}
  if(best){TWLIGHT=best;const i=best[1]*N+best[0];obj[i]=null;BS.add(i);PROT.add(i)}}
 const B=(k,dx,dy,o)=>{const b=Object.assign({k,tx:WX+dx,ty:WY+dy,w:5,tw:1},o);TWB.push(b);BLD.push(b);for(let y=b.ty;y<b.ty+2;y++)for(let x=b.tx;x<b.tx+b.w;x++){const i=y*N+x;tile[i]=2;obj[i]=null;PROT.add(i);if(!(x===b.tx+2&&y===b.ty+1))BS.add(i)}};
 B('tw_tackle',-9,-6,{wall:'#f4f6f8',roof:'#2a6ab0',sc:'#d8ecf8',ic:'fish',n:'Silverhook Tackle'});
 B('tw_kitchen',-2,-6,{wall:'#f8f4ec',roof:'#3a7ac0',sc:'#f8e8c8',ic:'mug',n:'Seabreeze Kitchen'});
 B('tw_post',5,-6,{wall:'#eef2f6',roof:'#2a5a8a',sc:'#d8c8a8',ic:'crate',n:'Driftwood Trading Post'});
 B('tw_nav',-9,-2,{wall:'#f0f4fa',roof:'#1a4a7a',sc:'#c8d8f0',ic:'star',n:'Navigator\'s House'});
 B('tw1',5,-2,{wall:'#f4f8fc',roof:'#4a8ad0'});B('tw2',-9,3,{wall:'#eef4fa',roof:'#3a6ab0'});B('tw3',-2,3,{wall:'#f8f8f4',roof:'#5a9ad8'});B('tw4',5,3,{wall:'#f0f6fc',roof:'#2a5a9a'});
 for(const b of TWB)BS.delete((b.ty+1)*N+b.tx+2);
 for(const[dx,dy]of[[-2,-1],[0,-1],[2,-1]]){const x=WX+dx,y=WY+dy,i=y*N+x;if(TWPATH.has(i))continue;TWNET.push([x,y]);BS.add(i);PROT.add(i)}
 for(const[dx,dy]of[[-5,-3],[5,-3],[0,1],[-3,6],[3,6]]){const x=WX+dx,y=WY+dy,i=y*N+x;if(TWPATH.has(i)||BS.has(i))continue;LAMPS.push([x,y]);BS.add(i);PROT.add(i)}
 SIGNS.set((WY-1)*N+WX+9,'TIDEWATCH - fishing village of the west. East: Hollow Village.');
 for(const i of TWZ)PROT.add(i)}
let TWTRAIL=[];
if(TWON){
 TWTRAIL=trailPath(VX-11,VY,WX+TWT.fw+1,WY,()=>false);layTrail(TWTRAIL);
 {const st=TWTRAIL.find(i=>(i%N)<=VX-13);if(st!=null){const x=st%N,y=(st/N)|0;for(const dy of[-1,1]){const i=(y+dy)*N+x;if(tile[i]!==0&&!TWPATH.has(i)&&!ROADS.has(i)&&!BS.has(i)&&!FHPATH.has(i)&&!DHPATH.has(i)){SIGNS.set(i,'West: Tidewatch, a fishing village by the sea.');break}}}}
 for(const i of SIGNS.keys()){if(tile[i]===0)tile[i]=2;obj[i]=null;BS.add(i);PROT.add(i)}
 for(const i of PROT)TG.delete(i)}
// --- rooms ---
const TFL=['#c8b898','#bcac8c'],TWL='#eef4f8';
Object.assign(ROOMS,{
 tw_tackle:fhRoom(9,7,['#b8c8d0','#acbcc4'],'#e8f0f4','#2a6ab0',[{t:'rack',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'shelf',x:6,y:0,w:3},{t:'counter',x:1,y:3,w:4,solid:1},{t:'barrel',x:7,y:2,solid:1},{t:'barrel',x:8,y:2,solid:1},{t:'table',x:6,y:4,w:2,solid:1,goods:1},{t:'rug',x:3,y:5,w:3}]),
 tw_kitchen:fhRoom(11,8,['#d8c8a8','#ccbc9c'],'#f4f0e8','#3a7ac0',[{t:'shelf',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'window',x:7,y:0},{t:'counter',x:0,y:3,w:4,solid:1},{t:'stove',x:0,y:2,solid:1},{t:'table',x:6,y:3,w:2,solid:1},{t:'table',x:8,y:5,w:2,solid:1},{t:'table',x:2,y:6,w:2,solid:1},{t:'bed',x:10,y:2,sh:2,solid:1},{t:'plant',x:10,y:6,solid:1},{t:'rug',x:4,y:6,w:3}]),
 tw_post:fhRoom(9,7,TFL,'#e8e4dc','#2a5a8a',[{t:'shelf',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'rack',x:6,y:0,w:3},{t:'counter',x:1,y:3,w:4,solid:1},{t:'barrel',x:7,y:2,solid:1},{t:'chest',x:8,y:2,solid:1},{t:'table',x:6,y:4,w:2,solid:1,goods:1},{t:'rug',x:3,y:5,w:3}]),
 tw_nav:fhRoom(9,7,['#a8b8c8','#9cacbc'],'#e0e8f0','#1a4a7a',[{t:'mapboard',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'shelf',x:6,y:0,w:2},{t:'telescope',x:8,y:1,solid:1},{t:'table',x:3,y:3,w:2,solid:1},{t:'barrel',x:0,y:4,solid:1},{t:'rug',x:3,y:5,w:3}]),
 tw1:fhRoom(8,6,TFL,TWL,'#4a8ad0',[{t:'window',x:2,y:0},{t:'rack',x:5,y:0,w:2},{t:'bed',x:1,y:2,sh:2,solid:1},{t:'table',x:4,y:3,w:2,solid:1},{t:'barrel',x:7,y:2,solid:1},{t:'rug',x:3,y:4,w:2}]),
 tw2:fhRoom(8,6,['#d0c0a0','#c4b494'],TWL,'#3a6ab0',[{t:'window',x:2,y:0},{t:'shelf',x:5,y:0,w:2},{t:'bed',x:1,y:2,sh:2,solid:1},{t:'table',x:4,y:3,w:2,solid:1},{t:'plant',x:7,y:2,solid:1},{t:'rug',x:3,y:4,w:2}]),
 tw3:fhRoom(8,6,TFL,TWL,'#5a9ad8',[{t:'window',x:2,y:0},{t:'rack',x:5,y:0,w:2},{t:'bed',x:1,y:2,sh:2,solid:1},{t:'table',x:4,y:3,w:2,solid:1},{t:'chest',x:7,y:2,solid:1},{t:'rug',x:3,y:4,w:2}]),
 tw4:fhRoom(8,6,['#c8b898','#bcac8c'],TWL,'#2a5a9a',[{t:'window',x:3,y:0},{t:'shelf',x:5,y:0,w:2},{t:'bed',x:1,y:2,sh:2,solid:1},{t:'bed',x:6,y:2,sh:2,solid:1},{t:'table',x:3,y:3,w:2,solid:1},{t:'rug',x:3,y:5,w:2}])});
const _df46=drawFurn;drawFurn=function(it,tm){const x0=it.x*16,y0=it.y*16;
 if(it.t==='mapboard'){const w=(it.w||3)*16;Rg(x0+2,y0-6,w-4,20,O);Rg(x0+3,y0-5,w-6,18,'#e8dcb8');Rg(x0+5,y0-3,w-10,14,'#4a90d0');
  for(const[a,b,c,d]of[[8,-1,10,6],[22,1,8,5],[12,6,9,4],[30,5,6,4]])if(a+c<w-5)Rg(x0+a,y0+b,c,d,'#78b858');Rg(x0+18,y0+1,2,2,'#e04040');Rg(x0+w-12,y0+8,3,3,'#f8d848');return}
 if(it.t==='telescope'){shd(x0+8,y0+15,12);Rg(x0+7,y0+2,2,12,'#5a3418');Rg(x0+4,y0+12,8,2,'#5a3418');Rg(x0+1,y0-6,14,5,O);Rg(x0+2,y0-5,12,3,'#c89830');Rg(x0+2,y0-5,12,1,'#f0d070');Rg(x0+12,y0-6,3,5,'#3a3020');return}
 _df46(it,tm)};
// --- people ---
const TWN=[
 {kind:'twfolk',id:'corin',name:'Corin',home:'tw1',work:'tw_tackle',wx:3*16,wy:2*16+10,bed:[1,2],ch:{sk:2,hs:0,hc:1,sh:2,pn:2,ht:2,hcol:4,so:2}},
 {kind:'twfolk',id:'luma',name:'Luma',home:'tw2',work:'tw_kitchen',wx:2*16,wy:2*16+10,bed:[1,2],ch:{sk:1,hs:3,hc:4,sh:5,pn:4,ht:0,hcol:0,so:1}},
 {kind:'twfolk',id:'fen',name:'Fen',home:'tw3',work:'tw_post',wx:3*16,wy:2*16+10,bed:[1,2],ch:{sk:3,hs:1,hc:0,sh:3,pn:1,ht:1,hcol:2,so:3}},
 {kind:'twfolk',id:'ollo',name:'Ollo',home:'tw4',work:null,bed:[1,2],ch:{sk:0,hs:0,hc:6,sh:7,pn:2,ht:2,hcol:3,so:2}},
 {kind:'twfolk',id:'sera',name:'Sera',home:'tw4',work:'tw_nav',wx:5*16+8,wy:3*16+12,bed:[6,2],ch:{sk:2,hs:2,hc:2,sh:4,pn:0,ht:0,hcol:0,so:3}}];
if(TWON){for(const n of TWN){const hb=TWB.find(b=>b.k===n.home);n.door=hb?[hb.tx+2,hb.ty+1]:[WX,WY+5];n.town='tidewatch';
  n.hx0=(TWLIGHT&&n.id==='ollo'?TWLIGHT[0]:WX)*16+8;n.hy0=((TWLIGHT&&n.id==='ollo'?TWLIGHT[1]+1:WY+1))*16+8;if(n.id==='ollo'&&tile[Math.floor(n.hy0/16)*N+Math.floor(n.hx0/16)]===0){n.hx0=WX*16+8;n.hy0=(WY+6)*16+8}
  if(n.work){n.scene=n.work;n.x=n.wx;n.y=n.wy;n.dir=0;n.st=0}else{n.x=n.hx0;n.y=n.hy0}}
 NPCS.push(...TWN);FOLK.push(...TWN)}
const TWNAMES={tw_tackle:'Silverhook Tackle',tw_kitchen:'the Seabreeze Kitchen',tw_post:'the Driftwood Trading Post',tw_nav:'the Navigator\'s House',tw1:'Corin\'s cottage',tw2:'Luma\'s cottage',tw3:'Fen\'s cottage',tw4:'Ollo and Sera\'s cottage'};
Object.assign(LINES,{
 corin:{d:['Fish don\'t care how important you are.','The sea gives plenty, if you\'re patient.'],x:['Something keeps snapping my fishing lines.']},
 luma:{d:['Fresh fish tastes better by the sea.','My grandmother taught me every recipe.'],x:['I need ingredients for the harbor feast.'],n:['Late supper? There\'s always stew on.','Beds upstairs are made. Sleep well.']},
 fen:{d:['Everything washes ashore eventually.','Found a perfectly good boot yesterday.'],x:['Strange crates have been drifting in from the west.']},
 ollo:{d:['The lighthouse never sleeps.','Storms make the sea look angry.'],x:['A green light shines beneath the western cliffs.']},
 sera:{d:['Every island has a story.','Gull Rock isn\'t the only interesting place offshore.'],x:['There\'s an underwater cavern beyond the western reef.']}});
Object.assign(JOBS,{corin:[{k:'shrimp',a:[5,5],s:9,x:12}],luma:[{k:'ctrout',a:[3,3],s:4,x:35}],fen:[{k:'wood',a:[5,5],s:1,x:6}],ollo:[{k:'lantern',a:[3,3],s:6,x:120}],sera:[{k:'trout',a:[3,3],s:9,x:30}]});
const TWTHANKS={corin:'Good bait shrimp. Much obliged.',luma:'Perfect for tonight\'s pot!',fen:'Dry wood! Rare as treasure out here.',ollo:'Three lanterns! The lighthouse will shine for weeks.',sera:'Lovely trout. I\'ll trade you a story for them sometime.'};
const TWSHOP={
 tw_tackle:{who:'corin',title:'Silverhook Tackle',items:[['bait10','10 bait',15],['bait50','50 bait',65],['shrimp','Raw shrimp',8],['trout','Raw trout',20],['salmon','Raw salmon',35]]},
 tw_kitchen:{who:'luma',title:'Seabreeze Kitchen',items:[['cshrimp','Cooked shrimp',12],['ctrout','Cooked trout',28],['csalmon','Cooked salmon',45],['stew','Fish stew',30],['bread','Bread',18]]},
 tw_post:{who:'fen',title:'Driftwood Trading Post',items:[['wood','Wood',5],['stone','Stone',7],['lantern','Iron lantern',85],['nails','Iron nails',12],['chest','Wooden chest',75]]}};
const TWSHOPQ={corin:['Hooks, lines, bait. Everything but patience.','Fresh off the boat this morning.'],luma:['Sit! Eat! You\'re all bones.','Something\'s always simmering.'],fen:['If it floats, I sell it.','Driftwood, iron, oddments.'],sera:['Mind the charts, they\'re older than me.','Have a look through the telescope.']};
function twShopHTML(S){let h='<div class="tl" style="margin-top:10px">Gold: '+GLD+'</div><div class="tl" style="font-size:13px">BUY</div>';
 if(S.who==='corin'&&!TL.rod)h+=row('twrod','Fishing rod','10 gold · you need one to fish',GLD>=10);
 S.items.forEach(([k,n,c])=>{const bait=k.startsWith('bait');h+=row('twb_'+k+'_1',n,c+' gold'+(bait?' · fish bite much faster (you have '+(inv.bait|0)+')':' (you have '+(inv[k]|0)+')'),GLD>=c);if(!bait&&c<=20)h+=row('twb_'+k+'_10','10 × '+n,c*10+' gold',GLD>=c*10)});return h}
function seraNotes(){const t=[];t.push('Fishing '+lvOf(9)+'. '+(lvOf(9)<10?'Trout start biting at Fishing 10, salmon at 20. Bait from Corin makes everything bite faster.':lvOf(9)<20?'Salmon bite from Fishing 20. Fish off the end of our pier.':lvOf(9)<35?'Swordfish need Fishing 35, and deep water.':'You fish like a local now.'));
 t.push('Gull Rock lies far to the north-east: seabirds and good rocks. Wreck Isle is in the south-east: an old wreck worth searching once a day. Both need a sailboat; Captain Ida in Saltmere sells them.');
 if(GRDEN)t.push('The Drowned Grotto opens in a rock just off our south-west shore. Only reachable by boat. Attack 18, Defence 15 and some Magic recommended.');
 return'<div class="qc" style="margin-top:10px"><b>Navigator\'s notes</b>'+t.map(s=>'<p>'+esc(s)+'</p>').join('')+'</div>'}
function twPanel(n){const S=n.scene&&TWSHOP[n.scene];let h=head(S?S.title:n.scene==='tw_nav'?'Navigator\'s House':'Tidewatch',n.name,TALKQ);h+=sideCard(n);
 if(S){h+=twShopHTML(S);if(n.id==='luma')h+=row('tw_rest',nightNow()||dark()>.3?'Rent a bed for the night':'Rest a while',(nightNow()||dark()>.3?'25 gold · sleep until morning, wake up healed':'25 gold · heal fully and get a hot meal'),GLD>=25)}
 if(n.id==='sera'&&n.scene==='tw_nav'){h+=seraNotes();h+=row('tw_scope','Look through the telescope','See the whole island and its seas on the map',true)}
 return h+jobCard(n)}
const _r46=rPn;rPn=function(){if(ptab===2&&shop==='twfolk'){if(!TALKN||TALKN.kind!=='twfolk'){TALKN=nearNpc();const n=TALKN;TALKQ=n?(n.scene&&TWSHOPQ[n.id]&&Math.random()<.5?TWSHOPQ[n.id][Math.floor(Math.random()*2)]:pickLine(n)):''}
  panelChrome('');if(!TALKN){closePanel();return}pbd.innerHTML=twPanel(TALKN);return}_r46()};
const _cp46=closePanel;closePanel=function(){_cp46();if(TALKN&&TALKN.kind==='twfolk')TALKN=null};
const _xa46=xAct;xAct=function(a){const n=TALKN;
 if(a.startsWith('twb_')){const m=a.match(/^twb_(.+)_(\d+)$/);if(!m)return;const k=m[1],q=+m[2],S=n&&TWSHOP[n.scene],it=S&&S.items.find(e=>e[0]===k);if(!it)return;
  xbuy(it[2]*q,()=>{if(k==='bait10')inv.bait=(inv.bait|0)+10;else if(k==='bait50')inv.bait=(inv.bait|0)+50;else inv[k]=(inv[k]|0)+q},'Bought '+(q>1?q+' × ':'')+it[1].toLowerCase());svg();saveLocal(true);rPn();return}
 if(a==='twrod'){if(!TL.rod)xbuy(10,()=>TL.rod=1,'Got a fishing rod!');saveNow();rPn();return}
 if(a==='tw_rest'){if(GLD<25){say('Not enough gold');sfx('swish');return}GLD-=25;P.hp=6;hunger=100;if(nightNow()||dark()>.3){time=(Math.floor(time/DAYLEN)+1)*DAYLEN+1;en=[];say('You slept to the sound of the waves. Good morning!');closePanel()}else say('You rest and eat. You feel great!');sfx('quest');saveNow();if(pnOpen)rPn();return}
 if(a==='tw_scope'){TALKN=null;shop=null;ptab=5;rPn();say('Through the telescope you can see the whole island.');return}
 const was=n&&n.kind==='twfolk'&&a==='job'?JOBD[n.id]:null;_xa46(a);if(n&&n.kind==='twfolk'&&a==='job'&&JOBD[n.id]!==was){TALKQ=TWTHANKS[n.id]||'Thank you!';saveNow();rPn()}};
const _es46=enterScene;enterScene=function(id,house,ret){_es46(id,house,ret);if(!TWNAMES[id])return;
 const k=TWN.find(n=>n.work===id);if(k&&k.scene!==id&&k.id!=='luma'){say(TWNAMES[id][0].toUpperCase()+TWNAMES[id].slice(1)+' is closed for the night. '+k.name+' has gone home.');return}
 say({tw_tackle:'Silverhook Tackle. Nets, rods and the smell of the sea.',tw_kitchen:'The Seabreeze Kitchen. Something delicious is bubbling.',tw_post:'The Driftwood Trading Post. Half of it washed ashore.',tw_nav:'The Navigator\'s House: charts on every wall and a brass telescope by the window.'}[id]||('This is '+TWNAMES[id]+'.'))};
let twPrev=false;
const _u46=upd;upd=function(dt){_u46(dt);if(menuOpen||!TWON)return;townRoutine(TWN,dt,'luma');if(pnOpen||SCENE)return;const x=Math.floor(P.x/16),y=Math.floor(P.y/16),inT=inTWBox(x,y);
 if(inT&&!twPrev&&!dead){say('Welcome to Tidewatch! Gulls cry over the harbor.');msgT=3}twPrev=inT;
 en=en.filter(n=>!inTWBox(Math.floor(n.x/16),Math.floor(n.y/16)))};
// --- drawing: blue-and-white houses (the normal HD house with crisp white walls), drying nets, the lighthouse ---
const _drb46=drBld;drBld=function(b,tm){_drb46(b,tm);if(!b.tw)return;const X0=b.tx*16,w=b.w*16,base=(b.ty+2)*16;
 // a blue stripe along the wall and blue shutters
 g.fillStyle='#3a7ac0';g.fillRect(X0,base-6,w,2);for(const wx of[8,w-20]){g.fillRect(X0+wx-3,base-23,2,12);g.fillRect(X0+wx+13,base-23,2,12)}
 if(!b.sc)return;const dx=X0+(w>>1)-6;Rg(dx-4,base-27,20,8,O);Rg(dx-3,base-26,18,6,b.sc);
 if(b.ic==='fish'){Rg(dx+1,base-25,8,4,'#4890d0');Rg(dx+9,base-26,2,2,'#4890d0');Rg(dx+9,base-23,2,2,'#4890d0')}else if(b.ic==='mug'){Rg(dx+2,base-25,6,4,'#f8f0e0');Rg(dx+8,base-24,2,2,'#a87850')}
 else if(b.ic==='crate'){Rg(dx+2,base-25,8,4,'#a87840');Rg(dx+2,base-24,8,1,'#7a5228');Rg(dx+5,base-25,1,4,'#7a5228')}else{Rg(dx+5,base-26,1,6,'#f8d848');Rg(dx+2,base-24,7,1,'#f8d848');Rg(dx+3,base-25,1,1,'#f8d848');Rg(dx+7,base-23,1,1,'#f8d848')}};
function drawNetRack(x,y,tm){const px=x*16,py=y*16;shd(px+8,py+15,16);for(const xx of[px+1,px+13]){Rg(xx,py-8,2,23,O);Rg(xx+.5,py-7,1,22,'#8a5a30')}Rg(px,py-9,16,2,O);Rg(px+1,py-8.5,14,1,'#a87040');
 g.strokeStyle='#5a6a5a';g.lineWidth=.6;for(let k=0;k<5;k++){const sw=Math.sin(tm*1.5+x+k)*.5;g.beginPath();g.moveTo(px+2+k*3,py-7);g.lineTo(px+2+k*3+sw,py+6);g.stroke()}for(let r=0;r<4;r++){g.beginPath();g.moveTo(px+2,py-5+r*3.5);g.lineTo(px+14,py-5+r*3.5+Math.sin(tm+r)*.4);g.stroke()}
 Rg(px+4,py+1,3,2,'#e8e0c0');Rg(px+10,py-2,2,2,'#e86040')}
function drawLighthouse(x,y,tm){const px=x*16,py=y*16;shd(px+8,py+15,22);Rg(px-1,py-52,18,67,O);for(let k=0;k<6;k++)Rg(px,py-51+k*11,16,11,k%2?'#e04040':'#f4f4f4');
 Rg(px+1,py-51,3,65,'rgba(255,255,255,.25)');Rg(px-3,py-56,22,5,O);Rg(px-2,py-55,20,3,'#3a3a48');Rg(px+1,py-68,14,13,O);const lit=dark()>.15;Rg(px+2,py-67,12,11,lit?'#fff4b0':'#c8e8f8');Rg(px+5,py-67,6,11,lit?'#ffe070':'#a8d8f0');
 Rg(px,py-73,16,6,O);Rg(px+1,py-72,14,4,'#2a3a5a');Rg(px+6,py-6,4,8,O);Rg(px+7,py-5,2,7,'#5a3418');
 if(lit){const a=tm*.9,dk=dark();g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,240,170,'+(.18*dk)+')';g.beginPath();g.moveTo(px+8,py-62);g.arc(px+8,py-62,150,a-.18,a+.18);g.closePath();g.fill();g.beginPath();g.moveTo(px+8,py-62);g.arc(px+8,py-62,150,a+Math.PI-.18,a+Math.PI+.18);g.closePath();g.fill();g.restore()}}
const _lh46=LHOOK;LHOOK=(L,x0,y0,x1,y1,tm)=>{_lh46(L,x0,y0,x1,y1,tm);if(!TWON)return;const inV=(x,y)=>x>=x0-3&&x<=x1+3&&y>=y0-3&&y<=y1+6;
 for(const[x,y]of TWNET)if(inV(x,y))L.push([(y+1)*16-2,4,()=>drawNetRack(x,y,tm)]);
 if(TWLIGHT&&inV(TWLIGHT[0],TWLIGHT[1]))L.push([(TWLIGHT[1]+1)*16-2,4,()=>drawLighthouse(TWLIGHT[0],TWLIGHT[1],tm)])};
const _dmap46=drawMap;drawMap=function(){_dmap46();if(!TWON)return;const c=document.getElementById('mpc');if(!c)return;const x=c.getContext('2d');
 x.fillStyle='#101010';x.fillRect(WX-2,WY-2,5,5);x.fillStyle='#78c8f8';x.fillRect(WX-1,WY-1,3,3);if(GRDEN){x.fillStyle='#101010';x.fillRect(GRDEN.x-1,GRDEN.y-1,3,3);x.fillStyle='#48e8a8';x.fillRect(GRDEN.x,GRDEN.y,1,1)}};
const _mh46=mapHTML;mapHTML=function(){const h=_mh46();return TWON?h.replace('</span>','</span><span><i style="background:#78c8f8"></i>Tidewatch</span><span><i style="background:#48e8a8"></i>Drowned Grotto</span>'):h};
SONGS.tide={bpm:92,lead:'G5 - E5 D5 - B4 - D5 E5 - G5 - A5 - G5 E5 - D5 - - - C5 - E5 G5 - A5 - G5 E5 D5 B4 - D5 - - -',
 bass:'G2 - D3 - G2 - D3 - C3 - G3 - C3 - G3 - E2 - B2 - E2 - B2 - C3 - G3 - D3 - - -'};
PARSED.tide={bpm:SONGS.tide.bpm,lead:parseTrack(SONGS.tide.lead),bass:parseTrack(SONGS.tide.bass)};
const _ws46=wantSong;wantSong=function(){const w=_ws46();if(!TWON)return w;if(!SCENE&&(w==='day'||w==='port')&&inTWBox(Math.floor(P.x/16),Math.floor(P.y/16)))return'tide';if(SCENE&&TWNAMES[SCENE.id])return'tide';return w};
const _ng46=newGame;newGame=function(){_ng46();for(const n of TWN){n.scene=n.work;if(n.work){n.x=n.wx;n.y=n.wy}else{n.x=n.hx0;n.y=n.hy0}}};
// --- Tidewatch's quest line ---
SIDE_QS.tidewatch.push(
 {n:'A Fisherman\'s Favor',d:'Bring Corin 5 trout.',type:'give',item:'trout',amt:5,r:{g:120,xp:[9,350]},giver:'corin',req:[9,10],start:'The fish haven\'t been biting lately.',finish:'Those are some fine-looking trout!'},
 {n:'Harbor Feast',d:'Bring Luma 5 cooked shrimp.',type:'give',item:'cshrimp',amt:5,r:{g:150,xp:[4,400]},giver:'luma',start:'We\'re preparing a feast for the harbor workers.',finish:'Wonderful! Everyone will eat well tonight.'},
 {n:'Light the Way',d:'Bring 2 lanterns to repair the lighthouse.',type:'give',item:'lantern',amt:2,r:{g:200,xp:[6,500]},giver:'ollo',start:'The lighthouse needs a little attention.',finish:'Now ships can find their way home.'},
 {n:'The Drowned Grotto',d:'Defeat the Tidekeeper beneath the western cliffs.',type:'dungeonboss',item:'tidekeeper',amt:1,r:{g:400,xp:[13,1000]},giver:'sera',need:{txt:'Own a sailboat',f:()=>!!TL.boat},start:'Something ancient has awakened beneath the sea.',finish:'The western waters are peaceful again.',note:'The Grotto is only reachable by boat.'});
