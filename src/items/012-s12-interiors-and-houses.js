// ---------------------------------------------------------------- 12. Interiors and houses
// Walk through a door to enter a building, Pokemon-style. Shopkeepers work behind their counters,
// and a House (100 wood) can be placed in one go: it comes furnished with a bed and a chest.
const ROOMS={
 gen:{w:9,h:7,ex:4,floor:['#e8d8a8','#dccb98'],wall:'#f4ecd4',trim:'#a87850',items:[{t:'shelf',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'shelf',x:6,y:0,w:3},{t:'rug',x:3,y:5,w:3},{t:'counter',x:1,y:3,w:4,solid:1},{t:'plant',x:8,y:2,solid:1},{t:'table',x:6,y:4,w:2,solid:1,goods:1}]},
 smith:{w:9,h:7,ex:4,floor:['#b8b0a0','#aca494'],wall:'#d0c8bc',trim:'#686058',items:[{t:'rack',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'rug',x:3,y:5,w:3},{t:'counter',x:1,y:3,w:3,solid:1},{t:'furnace',x:7,y:2,solid:1},{t:'anvil',x:6,y:4,solid:1},{t:'barrel',x:8,y:5,solid:1}]},
 home:{w:8,h:6,ex:4,floor:['#dcbc8c','#ceae7e'],wall:'#f4e4cc',trim:'#8a6038',items:[{t:'window',x:2,y:0},{t:'window',x:5,y:0},{t:'rug',x:3,y:4,w:2},{t:'bed',x:1,y:2,sh:2,solid:1,use:'bed'},{t:'chest',x:6,y:2,solid:1,use:'chest'},{t:'table',x:3,y:3,w:2,solid:1},{t:'plant',x:7,y:2,solid:1}]}};
for(const id in ROOMS){const R=ROOMS[id];R.solid=new Set();for(const it of R.items)if(it.solid)for(let dy=0;dy<(it.sh||1);dy++)for(let dx=0;dx<(it.w||1);dx++)R.solid.add((it.y+dy)*R.w+it.x+dx)}
let SCENE=null,FADE_AT=-1e9,INDRAW=false,HOUSES=[],HOMESP=null,CHEST_H=null;
function curScene(){return SCENE?SCENE.id:null}
function worldPos(){return SCENE?{x:SCENE.ret.x,y:SCENE.ret.y}:{x:P.x,y:P.y}}
const HOUSE_STYLE={k:'home',w:5,wall:'#f0e0c0',roof:'#4870c0',sc:null};
// shopkeepers now stand behind their counters
for(const n of NPCS){if(n.kind==='gen'||n.kind==='smith'){n.scene=n.kind;n.x=n.kind==='gen'?3*16:2.5*16;n.y=2*16+10;n.dir=0;n.st=0}}
// village doors become walkable entrances
for(const b of BLD)BS.delete((b.ty+1)*N+b.tx+2);
// --- houses ---
BREC.push({k:'house',n:'House',c:{wood:100},req:5,xp:400,hp:20});BK.push('house');BHP.house=20;INVK.push('house');INAME.house='House';
IDESC.house='A whole furnished house in one go. Walk in through the door. Inside: a bed and a private chest.';
const houseTiles=h=>{const a=[],hw=((h.w||5)-1)/2;for(let dy=-1;dy<=0;dy++)for(let dx=-hw;dx<=hw;dx++)if(dx||dy)a.push((h.y+dy)*N+h.x+dx);return a};
const houseAt=(x,y)=>HOUSES.find(h=>{const hw=((h.w||5)-1)/2;return x>=h.x-hw&&x<=h.x+hw&&y>=h.y-1&&y<=h.y});
function houseAnchor(){return[Math.floor(P.x/16),Math.floor(P.y/16)-1]}
function houseFits(){const[x,y]=houseAnchor();for(let dy=-2;dy<=0;dy++)for(let dx=-3;dx<=3;dx++){const tx=x+dx,ty=y+dy;if(tx<1||ty<1||tx>=N-1||ty>=N-1)return false;const i=ty*N+tx;if(tile[i]===0||obj[i]||BS.has(i)||STR.has(i)||houseAt(tx,ty)||inVillage(tx,ty))return false}
 const fi=(y+1)*N+x;return tile[fi]!==0&&!fires.some(f=>Math.abs(f.x-(x*16+8))<20&&Math.abs(f.y-(y*16-8))<30)&&!NPCS.some(n=>!n.scene&&Math.abs(n.x-(x*16+8))<64&&n.y<(y+1)*16&&n.y>(y-2)*16)}
function addHouseBS(h){for(const i of houseTiles(h)){BS.add(i);obj[i]=null}obj[h.y*N+h.x]=null}
function placeHouse(){if(SCENE){say('You can only build outside.');return}if(!houseFits()){const[x,y]=houseAnchor();say(inVillage(x,y)?'You can\'t build inside the village.':'Not enough clear space for a house here.');sfx('swish');return}
 const[x,y]=houseAnchor();const h={id:Math.random().toString(36).slice(2,8),x,y,w:7,furn:new Map(),hp:12};HOUSES.push(h);addHouseBS(h);inv.house--;P.y=Math.max(P.y,(y+1)*16+5);
 sfx('chop');setTimeout(()=>sfx('quest'),150);endBuild('Your new house is ready! It\'s empty inside: craft furniture and decorate it.');saveLocal(true);saveCloud(true)}
const _pb12=placeBuild;placeBuild=function(){if(BUILD&&BUILD.k==='house'){placeHouse();return}if(SCENE){say('You can only build outside.');return}_pb12()};
const _cpl12=canPlace;canPlace=function(x,y){return BUILD&&BUILD.k==='house'?houseFits():_cpl12(x,y)};
const _sb12=startBuild;startBuild=function(k){if(SCENE){say('Go outside to build.');closePanel();return}_sb12(k)};
function hitHouse(h){h.hp=(h.hp||12)-(1+TL.axe);sfx('chop');if(h.hp>0){if(h.hp<=4)say('The house is about to come down...');return}
 HOUSES=HOUSES.filter(o=>o!==h);for(const i of houseTiles(h))BS.delete(i);inv.house=(inv.house|0)+1;for(const f of h.furn.values()){inv[f.t]=(inv[f.t]|0)+1;if(f.items)for(const k in f.items)inv[k]=(inv[k]|0)+f.items[k]}if(HOMESP===h.id)HOMESP=null;
 say('You packed up your house and everything inside it.');setTimeout(()=>sfx('pickup'),90);saveLocal(true);saveCloud(true)}
// --- saving ---
function housesFromSave(a){for(const h of HOUSES)for(const i of houseTiles(h))BS.delete(i);HOUSES=[];if(!Array.isArray(a))return;const RW=14,RH=10;
 for(const e of a){if(!e||!isFinite(e.x)||!isFinite(e.y))continue;const h={id:String(e.id||Math.random().toString(36).slice(2,8)).slice(0,12),x:e.x|0,y:e.y|0,w:e.w===7?7:5,furn:new Map(),hp:12};if(h.x<4||h.y<3||h.x>N-5||h.y>N-3)continue;
  const items=o=>{const r={};if(o&&typeof o==='object')for(const k in o)if(INVK.includes(k))r[k]=Math.max(0,+o[k]||0);return r};
  if(Array.isArray(e.f)){for(const q of e.f){if(!Array.isArray(q))continue;const i=q[0]|0,t=q[1];if(i<2*RW||i>=RW*RH||!BK.includes(t)||t==='house')continue;h.furn.set(i,t==='chest'?{t,items:items(q[2])}:{t})}}
  else{h.furn.set(2*RW+1,{t:'bed'});h.furn.set(2*RW+12,{t:'chest',items:items(e.items)})}
  HOUSES.push(h);addHouseBS(h)}}
const _sn12=snap;snap=function(){const s=_sn12();s.houses=HOUSES.map(h=>({id:h.id,x:h.x,y:h.y,w:h.w||5,f:[...h.furn].map(([i,f])=>[i,f.t,f.items||null])}));s.home=HOMESP;if(SCENE){s.p.x=Math.round(SCENE.ret.x);s.p.y=Math.round(SCENE.ret.y)}return s};
const _ap12=applySave;applySave=function(S){SCENE=null;_ap12(S);housesFromSave(S.houses);HOMESP=HOUSES.some(h=>h.id===S.home)?S.home:null};

// --- entering and leaving ---
function entrances(){const a=BLD.map(b=>({x:b.tx+2,y:b.ty+1,id:b.k,house:null}));for(const h of HOUSES)a.push({x:h.x,y:h.y,id:'home',house:h});return a}
function enterScene(id,house,ret){const R=ROOMS[id];SCENE={id,room:R,house,ret};P.x=R.ex*16+8;P.y=(R.h-1)*16+4;face=[0,-1];en=[];FISH=null;if(BUILD)endBuild();FADE_AT=performance.now();sfx('door');
 if(id==='home')say('Welcome home!');else if(id==='gen')say('Welcome to the General Store!');else if(id==='smith')say('The forge is warm. The blacksmith is at the counter.')}
function leaveScene(){const r=SCENE.ret;SCENE=null;P.x=r.x;P.y=r.y;face=[0,1];FADE_AT=performance.now();sfx('door')}
SFX.door=()=>{noise(.12,.1,700);tone(260,.1,'square',.04,-60,.04)};
// --- collision inside rooms ---
const _sol12=solid;solid=function(px,py){if(!SCENE)return _sol12(px,py);const R=SCENE.room,x=Math.floor(px/16),y=Math.floor(py/16);
 if(x<0||x>=R.w)return true;if(y<2)return true;if(y>=R.h)return x!==R.ex&&!(R.ex%1&&(x===Math.floor(R.ex)||x===Math.ceil(R.ex)));/* a half-tile ex = a gate two tiles wide */return R.solid.has(y*R.w+x)};
// --- furniture use (bed + chest at home) ---
function nearFurn(){if(!SCENE)return null;let best=null,bd=26;for(const it of SCENE.room.items){if(!it.use)continue;const cx=it.x*16+8,cy=(it.y+(it.sh||1)/2)*16;const d=Math.hypot(P.x-cx,P.y-cy);if(d<bd){bd=d;best=it}}return best}
function useFurn(it){if(!SCENE||!it)return;const h=SCENE.house;if(!h)return;
 if(it.use==='chest'){CHEST_H=h.chest;fromMenu=false;pnOpen=true;ptab=7;jx=jy=0;pn.style.display='block';rPn();sfx('talk')}
 else if(it.use==='bed'){HOMESP=h.id;BEDSP=-1;if(dark()<.3){say('You\'ll wake up here from now on. Sleep at night to skip it.');sfx('talk')}
  else{time=(Math.floor(time/DAYLEN)+1)*DAYLEN+1;P.hp=Math.min(6,P.hp+2);hunger=Math.max(0,hunger-15*FOOD_RATE);say('You slept soundly at home. Good morning!');sfx('quest')}saveLocal(true);saveCloud(true)}}
const _ns12=nearStruct;nearStruct=function(){return SCENE?null:_ns12()};
const _us12=useStructure;useStructure=function(i){CHEST_H=null;_us12(i)};
const _sbd12=sleepBed;sleepBed=function(i){HOMESP=null;_sbd12(i)};
const _tk12=talk;talk=function(){if(SCENE&&!nearNpc()){const it=nearFurn();if(it&&!pnOpen&&!menuOpen)useFurn(it);return}_tk12()};
tk.addEventListener('touchstart',e=>{if(SCENE&&!nearNpc()&&!pnOpen){const it=nearFurn();if(it){e.preventDefault();useFurn(it)}}},{passive:false});
// actions that only make sense outdoors
const _atk12=attack;attack=function(){if(dead||menuOpen||pnOpen)return;if(SCENE){if(swing<=0){swing=.25;sfx('swish')}return}
 if(!BUILD&&swing<=0&&!FISH){const[x,y]=frontTile(),h=houseAt(x,y);if(h&&!(x===h.x&&y===h.y)){swing=.25;hitHouse(h);return}}_atk12()};
const _fi12=fire;fire=function(){if(SCENE&&!(SCENE.room&&(SCENE.room.icv||SCENE.room.yard||SCENE.room.court))){say('Better not light a fire indoors.');return}_fi12()};
// respawn: home bed beats a field bed beats the village
const _rs12=reset;reset=function(){SCENE=null;_rs12();const h=HOUSES.find(o=>o.id===HOMESP);if(h){enterScene('home',h,{x:h.x*16+8,y:(h.y+1)*16+6});P.x=2*16+10;P.y=3*16+8;face=[0,1];say('You wake up at home, safe and sound.')}};
const _ng12=newGame;newGame=function(){for(const h of HOUSES)for(const i of houseTiles(h))BS.delete(i);HOUSES=[];HOMESP=null;SCENE=null;_ng12()};
// --- update: doors, indoor rules, USE label ---
const _u12=upd;upd=function(dt){_u12(dt);if(menuOpen||pnOpen||dead)return;
 if(SCENE){if(!SCENE.room.cave)en=[];const R=SCENE.room;if(P.y>R.h*16-5&&Math.abs(P.x-(R.ex*16+8))<9){leaveScene();return}
  const it=nearFurn();if(it||nearNpc()){tk.style.display='flex';const lab=nearNpc()?'TALK':'USE';if(tkLab!==lab){tkLab=lab;tk.innerHTML=lab+(isPC?'<small>T</small>':'')}}else tk.style.display='none';return}
 for(const d of entrances()){const cx=d.x*16+8;if(face[1]<0&&Math.abs(P.x-cx)<9&&P.y<(d.y+1)*16+6&&P.y>d.y*16-4){enterScene(d.id,d.house,{x:cx,y:(d.y+1)*16+7});return}}};
// --- drawing ---
const _dk12=dark;dark=function(){return SCENE&&INDRAW?0:_dk12()};
const _dh12=drawHUD;drawHUD=function(){INDRAW=false;_dh12();const a=1-(performance.now()-FADE_AT)/320;if(a>0){g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=Math.min(1,a);g.fillStyle='#000';g.fillRect(0,0,W,H);g.restore()}};
function drawFurn(it,tm){const x0=it.x*16,y0=it.y*16,w=(it.w||1)*16;
 switch(it.t){
  case'rug':Rg(x0+1,y0+2,w-2,12,'#f8d848');Rg(x0+2,y0+3,w-4,10,'#5878b8');Rg(x0+4,y0+5,w-8,6,'#6890d0');break;
  case'window':Rg(x0+1,6,14,15,O);Rg(x0+2,7,12,13,'#a8d8f8');Rg(x0+7,7,1,13,'#f8f8f8');Rg(x0+2,13,12,1,'#f8f8f8');Rg(x0+3,8,3,3,'#e0f4ff');break;
  case'shelf':Rg(x0+1,3,w-2,27,O);Rg(x0+2,4,w-4,25,'#a87850');for(const yy of[11,19,27])Rg(x0+2,yy,w-4,2,'#7a4a20');
   {const C=['#e03040','#48a838','#f8d848','#5878b8','#f08830','#b03070'];for(let i=0;i<(w-6)/5;i++)for(const[k,yy]of[[0,6],[1,14],[2,22]])Rg(x0+4+i*5,yy,3,5,C[(i+k*2)%C.length])}break;
  case'rack':Rg(x0+1,5,w-2,22,O);Rg(x0+2,6,w-4,20,'#7a5a3a');for(let i=0;i<(w-8)/8;i++){const xx=x0+6+i*8;Rg(xx,8,2,15,'#d0d8e0');Rg(xx-2,19,6,2,'#d8a22a');Rg(xx,21,2,3,'#7a4a20')}break;
  case'counter':Rg(x0,y0-4,w,20,O);Rg(x0+1,y0-3,w-2,6,'#d0a060');Rg(x0+1,y0+3,w-2,12,'#a87850');for(let xx=x0+8;xx<x0+w-2;xx+=12)Rg(xx,y0+4,1,10,'#7a4a20');Rg(x0+1,y0-3,w-2,1,'#e8c088');break;
  case'table':Rg(x0+1,y0-1,w-2,15,O);Rg(x0+2,y0,w-4,7,'#c89858');Rg(x0+2,y0+7,w-4,5,'#9a6c3c');Rg(x0+3,y0+12,2,3,O);Rg(x0+w-5,y0+12,2,3,O);
   if(it.goods){const C=['#e03040','#f8d848','#48a838','#a87850'];for(let i=0;i<4;i++)Rg(x0+4+i*6,y0+1,4,4,C[i])}break;
  case'plant':shd(x0+8,y0+13,10);Rg(x0+4,y0+7,8,8,O);Rg(x0+5,y0+8,6,6,'#b05030');Rg(x0+2,y0-4,12,12,O);Rg(x0+3,y0-3,10,10,'#48a838');Rg(x0+5,y0-2,4,3,'#78d058');Rg(x0+9,y0+2,3,3,'#2c7828');break;
  case'furnace':{const fl=Math.floor(tm*8)%2;Rg(x0,y0-14,16,30,O);Rg(x0+1,y0-13,14,28,'#8a7a6a');for(let yy=y0-9;yy<y0+14;yy+=5)Rg(x0+1,yy,14,1,'#6a5a4a');Rg(x0+4,y0+3,8,8,O);Rg(x0+5,y0+4,6,7,fl?'#f88830':'#f8a040');Rg(x0+6,y0+7,4,3,'#f8e060')}break;
  case'anvil':shd(x0+8,y0+13,14);Rg(x0+1,y0+3,14,5,O);Rg(x0+2,y0+4,12,3,'#606878');Rg(x0+2,y0+4,12,1,'#a0a8b8');Rg(x0+5,y0+8,6,4,O);Rg(x0+6,y0+8,4,4,'#4a505c');Rg(x0+2,y0+12,12,3,O);Rg(x0+3,y0+12,10,2,'#4a505c');break;
  case'barrel':shd(x0+8,y0+14,12);Rg(x0+2,y0,12,15,O);Rg(x0+3,y0+1,10,13,'#a86830');Rg(x0+3,y0+3,10,1,'#604020');Rg(x0+3,y0+10,10,1,'#604020');Rg(x0+3,y0+1,10,1,'#c88840');break;
  case'bed':Rg(x0+1,y0-2,14,33,O);Rg(x0+2,y0-1,12,31,'#7a4a20');Rg(x0+3,y0+1,10,6,'#f8f8f8');Rg(x0+3,y0+8,10,20,'#5878b8');Rg(x0+3,y0+8,10,2,'#88a8e0');Rg(x0+3,y0+1,10,1,'#fff');break;
  case'chest':shd(x0+8,y0+14,14);Rg(x0+1,y0+2,14,13,O);Rg(x0+2,y0+3,12,5,'#c88840');Rg(x0+2,y0+8,12,6,'#a86830');Rg(x0+2,y0+7,12,1,'#604020');Rg(x0+7,y0+6,2,4,GD);Rg(x0+2,y0+3,12,1,'#e0a860');break}}
const _nd12=NEWDRAW;NEWDRAW=function(...a){INDRAW=!!SCENE;if(SCENE){drawRoom(a[8]);return}_nd12(...a);const tm=a[8];
 const vis=HOUSES.filter(h=>Math.abs(h.x*16-P.x)<W/Z+120&&Math.abs(h.y*16-P.y)<H/Z+120);
 if(!SORTALL)for(const h of vis)drBld({...HOUSE_STYLE,w:h.w||5,tx:h.x-((h.w||5)-1)/2,ty:h.y-1,castle:!!h.castle},tm);
 let rd=false;for(const h of vis){const hw=((h.w||5)-1)/2,X0=(h.x-hw)*16,base=(h.y+1)*16;if(P.x>X0-6&&P.x<X0+(h.w||5)*16+6&&P.y+6>=base&&P.y-16<base)rd=true}if(rd&&!dead&&!SORTALL)pP(tm);
 if(BUILD&&BUILD.k==='house'&&!dead){const[x,y]=houseAnchor(),ok=houseFits();g.globalAlpha=.55;drBld({...HOUSE_STYLE,w:7,tx:x-3,ty:y-1},tm);g.globalAlpha=1;g.fillStyle=ok?'rgba(80,240,120,.3)':'rgba(240,60,60,.3)';g.fillRect((x-3)*16,(y-1)*16,112,32)}};
setActionLabels();
