// ---------------------------------------------------------------- 11. Building, inventory grid, equipment
// Craft walls, doors, chests and beds, place them in the world, store items in chests and sleep in beds.
// The Bag is one inventory grid with pixel icons; the name option in the START menu shows your gear.
const BREC=[{k:'wwall',n:'Wooden wall',c:{wood:4},req:1,xp:20,hp:3},{k:'door',n:'Door',c:{wood:5},req:3,xp:30,hp:2},{k:'chest',n:'Chest',c:{wood:8},req:5,xp:50,hp:2},{k:'bed',n:'Bed',c:{wood:10,berry:4},req:8,xp:70,hp:2},{k:'swall',n:'Stone wall',c:{stone:6},req:10,xp:45,hp:6}];
const BK=BREC.map(r=>r.k),BHP=Object.fromEntries(BREC.map(r=>[r.k,r.hp]));INVK.push(...BK);
for(const r of BREC)INAME[r.k]=r.n;
Object.assign(IDESC,{wwall:'A sturdy wooden wall. Slimes can\'t get through.',swall:'A tough stone wall. Takes many hits to break.',door:'Opens when you walk up to it. Keeps slimes out.',chest:'Place it, then press TALK next to it to store items safely.',bed:'Sleep through the night and wake up here when you fall.'});
const STR=new Map();let BEDSP=-1,BUILD=null,CHEST_AT=-1;
const inVillage=(x,y)=>x>=VX-11&&x<=VX+11&&y>=VY-8&&y<=VY+8;
// --- saving ---
function strToSave(){return[...STR].map(([i,s])=>[i,s.t,s.items||null])}
function strFromSave(a){STR.clear();if(!Array.isArray(a))return;for(const e of a){if(!Array.isArray(e))continue;const i=e[0]|0,t=e[1];if(i<0||i>=N*N||!BK.includes(t)||tile[i]===0)continue;const s={t,hp:BHP[t]};
 if(t==='chest'){s.items={};if(e[2]&&typeof e[2]==='object')for(const k in e[2])if(INVK.includes(k))s.items[k]=Math.max(0,+e[2][k]||0)}STR.set(i,s);obj[i]=null}}
const _sn11=snap;snap=function(){const s=_sn11();s.str=strToSave();s.bsp=BEDSP;return s};
const _ap11=applySave;applySave=function(S){_ap11(S);strFromSave(S.str);BEDSP=STR.has(+S.bsp)?+S.bsp:-1;BUILD=null};

// --- collision: built pieces are solid; doors open when you are next to them ---
const doorOpen=i=>Math.hypot(P.x-((i%N)*16+8),P.y-(((i/N)|0)*16+8))<22;
const _sol11=solid;solid=function(px,py){if(_sol11(px,py))return true;const x=Math.floor(px/T),y=Math.floor(py/T),i=y*N+x,s=STR.get(i);if(!s)return false;return s.t==='door'?!doorOpen(i):true};
// --- placing and breaking ---
const frontTile=()=>{const[fx,fy]=front(16);return[Math.floor(fx/T),Math.floor(fy/T)]};
function canPlace(x,y){if(x<1||y<1||x>=N-1||y>=N-1)return false;const i=y*N+x;if(tile[i]===0||obj[i]||BS.has(i)||STR.has(i)||inVillage(x,y))return false;
 const cx=x*16+8,cy=y*16+8;if(Math.abs(P.x-cx)<13&&Math.abs(P.y-cy)<13)return false;if(NPCS.some(n=>Math.abs(n.x-cx)<12&&Math.abs(n.y-cy)<12))return false;if(fires.some(f=>Math.abs(f.x-cx)<12&&Math.abs(f.y-cy)<12))return false;return true}
function setActionLabels(){const a=document.getElementById('a'),e=document.getElementById('e');if(!a||!e)return;
 a.innerHTML=(BUILD?'PLACE':'HIT')+(isPC?'<small>Space</small>':'');e.innerHTML=(BUILD?'DONE':'EAT')+(isPC?'<small>'+(BUILD?'Esc':'E')+'</small>':'')}
function startBuild(k){if((inv[k]|0)<1)return;BUILD={k};closePanel();setActionLabels();say('Build mode: face an empty spot and press PLACE. Press DONE to stop.')}
function endBuild(m){BUILD=null;setActionLabels();if(m)say(m)}
function placeBuild(){const k=BUILD.k;if((inv[k]|0)<1){endBuild('You have no more '+INAME[k].toLowerCase()+'s.');return}const[x,y]=frontTile();
 if(!canPlace(x,y)){say(inVillage(x,y)?'You can\'t build inside the village.':'You can\'t build there.');sfx('swish');return}
 const i=y*N+x;inv[k]--;STR.set(i,k==='chest'?{t:k,hp:BHP[k],items:{}}:{t:k,hp:BHP[k]});sfx(k==='swall'?'mine':'chop');saveLocal(true);saveCloud();
 if((inv[k]|0)<1)endBuild('Placed your last '+INAME[k].toLowerCase()+'.')}
function hitStructure(i){const s=STR.get(i);const wood=s.t!=='swall';s.hp-=1+(wood?TL.axe:TL.pick);s.shake=.15;sfx(wood?'chop':'mine');
 if(s.hp>0)return;STR.delete(i);inv[s.t]=(inv[s.t]|0)+1;let extra='';if(s.items){for(const k in s.items){inv[k]=(inv[k]|0)+s.items[k]}if(Object.values(s.items).some(v=>v>0))extra=' and everything inside'}
 if(BEDSP===i)BEDSP=-1;say('Picked up the '+INAME[s.t].toLowerCase()+extra+'.');setTimeout(()=>sfx('pickup'),90);saveLocal(true);saveCloud()}
const _atk11=attack;attack=function(){if(dead||menuOpen||pnOpen)return;if(BUILD){placeBuild();return}
 if(swing<=0&&!FISH){const[x,y]=frontTile(),i=y*N+x;if(STR.has(i)){swing=.25;hitStructure(i);return}}
 _atk11()};
const _eat11=eat;eat=function(){if(BUILD){endBuild('Stopped building.');return}_eat11()};
addEventListener('keydown',e=>{if(BUILD&&e.key==='Escape'){endBuild('Stopped building.');e.preventDefault();e.stopImmediatePropagation()}},true);
// respawn beside your bed; a new game also clears everything you built
const _rs11=reset;reset=function(){_rs11();const b=STR.get(BEDSP);if(b&&b.t==='bed'){const bx=BEDSP%N,by=(BEDSP/N)|0;for(const[dx,dy]of[[0,1],[0,-1],[1,0],[-1,0]]){const px=(bx+dx)*16+8,py=(by+dy)*16+8;if(!(solid(px-5,py-3)||solid(px+5,py-3)||solid(px-5,py+6)||solid(px+5,py+6))){P.x=px;P.y=py;break}}saveLocal(true)}};
const _ng11=newGame;newGame=function(){STR.clear();BEDSP=-1;BUILD=null;_ng11();setActionLabels()};
// --- beds and chests (TALK/USE next to them) ---
function nearStruct(){let best=null,bd=24;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=Math.floor(P.x/16)+dx,y=Math.floor(P.y/16)+dy,i=y*N+x,s=STR.get(i);if(!s||(s.t!=='chest'&&s.t!=='bed'))continue;const d=Math.hypot(P.x-(x*16+8),P.y-(y*16+8));if(d<bd){bd=d;best=i}}return best}
function sleepBed(i){BEDSP=i;if(dark()<.3){say('This bed is now where you wake up. Sleep here at night.');sfx('talk');saveLocal(true);saveCloud(true);return}
 time=(Math.floor(time/DAYLEN)+1)*DAYLEN+1;en=[];P.hp=Math.min(6,P.hp+2);hunger=Math.max(0,hunger-15*FOOD_RATE);say('You slept soundly. Good morning!');sfx('quest');saveLocal(true);saveCloud(true)}
function useStructure(i){const s=STR.get(i);if(!s)return;if(s.t==='bed')sleepBed(i);else if(s.t==='chest'){CHEST_AT=i;fromMenu=false;pnOpen=true;ptab=7;jx=jy=0;pn.style.display='block';rPn();sfx('talk')}}
const _talk11=talk;talk=function(){if(nearNpc())return _talk11();const i=nearStruct();if(i!==null&&!pnOpen&&!menuOpen&&!dead)useStructure(i)};
tk.addEventListener('touchstart',e=>{if(!nearNpc()&&!pnOpen){const i=nearStruct();if(i!==null){e.preventDefault();useStructure(i)}}},{passive:false});
let tkLab='';
const _u11=upd;upd=function(dt){_u11(dt);if(BUILD&&(dead||(inv[BUILD.k]|0)<1))endBuild();
 const npc=nearNpc(),si=(!npc&&!dead&&!pnOpen&&!menuOpen)?nearStruct():null;if(si!==null)tk.style.display='flex';
 const lab=npc||si===null?'TALK':'USE';if(lab!==tkLab){tkLab=lab;tk.innerHTML=lab+(isPC?'<small>T</small>':'')}
 for(const s of STR.values())if(s.shake>0)s.shake-=dt;
 if((CLK|0)%2===0)for(const i of STR.keys())if(obj[i])obj[i]=null};
// --- drawing ---
const isWall=i=>{const s=STR.get(i);return!!s&&(s.t==='wwall'||s.t==='swall'||s.t==='door')};
function drawStruct(i,s,ghost){const x=i%N,y=(i/N)|0,px=x*16+(s.shake>0?Math.round(Math.sin(performance.now()/16)):0),py=y*16;
 if(s.t==='wwall'||s.t==='swall'){const l=isWall(i-1)&&!ghost?0:1,r=isWall(i+1)&&!ghost?0:1,st=s.t==='swall',top=st?'#c8c8d0':'#c88840',fr=st?'#9898a8':'#a86830',ln=st?'#686878':'#7a4a20';
  Rg(px,py-6,16,22,O);Rg(px+l,py-5,16-l-r,4,top);Rg(px+l,py-1,16-l-r,1,ln);Rg(px+l,py,16-l-r,15,fr);
  if(st){for(const yy of[4,9])Rg(px+l,py+yy,16-l-r,1,ln);Rg(px+6,py,1,4,ln);Rg(px+11,py+5,1,4,ln);Rg(px+4,py+10,1,5,ln)}else{Rg(px+5,py,1,15,ln);Rg(px+10,py,1,15,ln);Rg(px+l,py,16-l-r,1,'#d89850')}}
 else if(s.t==='door'){const op=!ghost&&doorOpen(i);Rg(px,py-6,16,22,O);Rg(px+1,py-5,14,4,'#c88840');
  if(op){Rg(px+3,py-1,10,16,'#302018');Rg(px+1,py-1,2,16,'#a06030');Rg(px+13,py-1,2,16,'#a06030')}else{Rg(px+1,py-1,14,16,'#a06030');Rg(px+3,py+1,10,5,'#885020');Rg(px+3,py+8,10,5,'#885020');Rg(px+11,py+6,2,2,GD)}}
 else if(s.t==='bed'){shd(px+8,py+13,14);Rg(px+1,py,14,16,O);Rg(px+2,py+1,12,14,'#7a4a20');Rg(px+3,py+2,10,4,'#f8f8f8');Rg(px+3,py+6,10,8,'#58a858');Rg(px+3,py+6,10,2,'#78c878');Rg(px+3,py+2,10,1,'#fff')}
 else if(s.t==='chest'){shd(px+8,py+14,14);Rg(px+1,py+2,14,13,O);Rg(px+2,py+3,12,5,'#c88840');Rg(px+2,py+8,12,6,'#a86830');Rg(px+2,py+7,12,1,'#604020');Rg(px+7,py+6,2,4,GD);Rg(px+2,py+3,12,1,'#e0a860')}}
const _nd11=NEWDRAW;NEWDRAW=function(...a){_nd11(...a);const[,,x0,y0,x1,y1,,,tm]=a;const list=[];
 for(const[i,s]of STR){const x=i%N,y=(i/N)|0;if(x>=x0-1&&x<=x1+1&&y>=y0-1&&y<=y1+2)list.push([i,s])}
 list.sort((p,q)=>p[0]-q[0]);if(!SORTALL)for(const[i,s]of list)drawStruct(i,s,false);
 let front=false;for(const[i]of list){const x=i%N,y=(i/N)|0,b=(y+1)*16;if(Math.abs(P.x-(x*16+8))<15&&P.y+6>b&&P.y-16<b)front=true}if(front&&!dead&&!SORTALL)pP(tm);
 if(BUILD&&!dead){const[x,y]=frontTile(),ok=canPlace(x,y);g.globalAlpha=.6;drawStruct(y*N+x,{t:BUILD.k},true);g.globalAlpha=1;g.fillStyle=ok?'rgba(80,240,120,.35)':'rgba(240,60,60,.35)';g.fillRect(x*16,y*16,16,16)}};
// --- pixel item icons ---
const ICONC={};
function iconURL(k,col){const key=k+(col||'');if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d');
 const r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a+1,b+1,w,h)},e=(cx,cy,rx,ry,cl)=>{x.fillStyle=cl;for(let j=0;j<12;j++)for(let i=0;i<12;i++)if(((i+.5-cx)/rx)**2+((j+.5-cy)/ry)**2<=1)x.fillRect(i+1,j+1,1,1)};
 const fishc={shrimp:'#f0a080',trout:'#88a870',salmon:'#f08868',swordfish:'#6888c8'},cfc={shrimp:'#e07840',trout:'#b08048',salmon:'#d06838',swordfish:'#a08060'};
 const fish=cl=>{e(5.5,6,4.5,2.6,cl);r(9,4,2,1,cl);r(10,5,1,2,cl);r(9,7,2,1,cl);r(2,5,1,1,'#202020');r(3,7,4,1,'#ffffff40')};
 const D={wood:()=>{r(1,4,10,5,'#a86830');r(1,4,10,1,'#c88840');r(9,4,2,5,'#e8c080');r(10,5,1,3,'#b07838')},
  stone:()=>{e(6,7,5,3.8,'#9898a8');e(4.8,5.6,2,1.4,'#d0d0e0')},iron:()=>{e(6,7,5,3.8,'#8888a0');r(3,6,2,1,'#e08848');r(7,8,2,1,'#e08848');r(6,4,1,1,'#e08848')},
  ibar:()=>{r(3,4,6,1,'#f0f4f8');r(2,5,8,2,'#b8c0c8');r(1,7,10,2,'#8890a0')},sbar:()=>{r(3,4,6,1,'#d8e4f8');r(2,5,8,2,'#8098c8');r(1,7,10,2,'#5870a0')},
  berry:()=>{e(4,7.5,2.3,2.3,'#e03040');e(8,7.5,2.3,2.3,'#e03040');e(6,4.5,2.3,2.3,'#e03040');r(6,1,2,1,'#48a838');r(3,6,1,1,'#ffb0b8');r(7,6,1,1,'#ffb0b8')},
  meat:()=>{r(8,1,2,4,'#f0f0e8');r(9,1,2,1,'#ffffff');e(5,7,4,3.4,'#e88888');r(3,6,2,1,'#f8c0c0')},cooked:()=>{r(8,1,2,4,'#f0f0e8');e(5,7,4,3.4,'#a85830');r(3,6,2,1,'#d08850')},
  bowl:()=>{r(1,5,10,1,'#c88840');r(2,6,8,2,'#a86830');r(3,8,6,1,'#804820');r(4,9,4,1,'#804820')},jam:()=>{r(3,2,6,1,'#c8a040');r(3,3,6,1,'#f0f0f0');r(2,4,8,6,'#b03070');r(3,5,1,3,'#f080b0')},
  brick:()=>{r(1,4,10,5,'#c05040');r(1,6,10,1,'#e8c8b0');r(5,4,1,2,'#e8c8b0');r(3,7,1,2,'#e8c8b0');r(8,7,1,2,'#e8c8b0')},
  statue:()=>{e(6,3,2,2,'#c0c0c8');r(4,5,4,4,'#a0a0a8');r(2,9,8,2,'#808088')},nails:()=>{for(const[a,b]of[[3,2],[6,3],[9,2]]){r(a,b,1,7,'#b0b8c8');r(a-1,b,3,1,'#e0e8f0')}},
  lantern:()=>{r(5,1,2,1,'#404048');r(3,2,6,1,'#404048');r(3,3,6,6,'#f8d848');r(5,4,2,4,'#fff8c0');r(3,3,1,6,'#404048');r(8,3,1,6,'#404048');r(3,9,6,1,'#404048')},
  dagger:()=>{for(let i=0;i<6;i++)r(4+i,7-i,2,1,col||'#d0d8e0');r(2,7,4,1,'#d8a22a');r(3,6,1,3,'#d8a22a');r(1,9,2,2,'#7a4a20')},
  sword:()=>{for(let i=0;i<8;i++)r(3+i,8-i,2,1,col||'#d0d8e0');r(1,7,5,1,'#d8a22a');r(3,5,1,5,'#d8a22a');r(1,9,2,2,'#7a4a20')},
  axe:()=>{for(let i=0;i<8;i++)r(2+i,10-i,1,1,'#7a4a20');r(6,1,4,4,col||'#d0d8e0');r(9,2,2,3,col||'#d0d8e0')},
  pick:()=>{for(let i=0;i<8;i++)r(2+i,10-i,1,1,'#7a4a20');r(3,2,8,1,col||'#d0d8e0');r(2,3,2,2,col||'#d0d8e0');r(10,3,1,2,col||'#d0d8e0')},
  rod:()=>{for(let i=0;i<9;i++)r(1+i,10-i,1,1,'#a86830');r(10,1,1,9,'#e0e0e8');r(9,10,2,1,'#e03030')},
  helm:()=>{e(6,6,4.5,4,col);r(2,7,8,2,col);r(3,7,6,1,'#303040');r(4,3,3,1,'#ffffff60')},
  body:()=>{r(2,2,8,8,col);r(1,2,2,4,col);r(9,2,2,4,col);r(5,2,2,2,'#303040');r(3,3,1,5,'#ffffff50')},
  legs:()=>{r(3,1,6,3,col);r(3,4,2,7,col);r(7,4,2,7,col);r(3,1,6,1,'#ffffff50')},
  hoe:()=>{for(let i=0;i<8;i++)r(2+i,10-i,1,1,'#a86830');r(7,1,4,2,'#b8c0c8');r(10,3,1,2,'#b8c0c8')},
  can:()=>{r(2,4,7,6,'#58a0d8');r(3,5,2,3,'#a8d8f8');r(9,5,2,1,'#58a0d8');r(10,4,1,1,'#58a0d8');r(3,2,4,2,'#404858');r(1,5,1,3,'#404858')},
  wheatseed:()=>{r(3,3,6,8,'#c8a878');r(4,2,4,1,'#a88858');r(5,6,2,2,'#f0c848')},carrotseed:()=>{r(3,3,6,8,'#c8a878');r(4,2,4,1,'#a88858');r(5,6,2,2,'#f08830')},pumpkinseed:()=>{r(3,3,6,8,'#c8a878');r(4,2,4,1,'#a88858');r(5,6,2,2,'#e87820')},
  wheat:()=>{for(const a of[3,6,9]){r(a,4,1,7,'#c8a038');r(a-1,1,3,4,'#f0c848')}r(2,8,9,1,'#a07820')},
  carrot:()=>{for(let i=0;i<6;i++)r(4+Math.floor(i/2),4+i,4-Math.floor(i/1.5),1,'#f08830');r(5,1,1,3,'#48a838');r(7,1,1,3,'#48a838');r(6,2,1,2,'#78d058')},
  pumpkin:()=>{e(6,7,5,4,'#e87820');r(4,4,1,7,'#c85810');r(8,4,1,7,'#c85810');r(5,1,2,3,'#48a838')},
  bread:()=>{e(6,7,5,3.5,'#d09048');r(3,5,6,1,'#f0c080');r(4,7,1,1,'#a06828');r(7,7,1,1,'#a06828')},
  rcarrot:()=>{for(let i=0;i<6;i++)r(4+Math.floor(i/2),4+i,4-Math.floor(i/1.5),1,'#c86020');r(5,2,3,2,'#806020')},
  pie:()=>{e(6,7,5.5,3.5,'#c08048');e(6,6.5,4,2.5,'#e87820');r(4,6,4,1,'#f0a050')},
  pelt:()=>{e(6,6.5,5,3.5,'#8890a0');r(1,4,2,2,'#8890a0');r(9,4,2,2,'#8890a0');r(2,9,2,2,'#8890a0');r(8,9,2,2,'#8890a0');e(6,6,3,1.5,'#c8d0dc')},
  bone:()=>{for(let i=0;i<7;i++)r(2+i,8-i,2,2,'#f0ece0');r(1,8,2,3,'#f0ece0');r(2,9,2,2,'#f0ece0');r(9,1,2,2,'#f0ece0');r(10,2,1,2,'#f0ece0')},
  table:()=>{r(1,4,10,3,'#c89858');r(1,7,10,1,'#9a6c3c');r(2,8,1,3,'#7a4a20');r(9,8,1,3,'#7a4a20')},
  chair:()=>{r(3,1,6,2,'#a86830');r(3,3,1,4,'#a86830');r(8,3,1,4,'#a86830');r(2,6,8,2,'#c88840');r(3,8,1,3,'#7a4a20');r(8,8,1,3,'#7a4a20')},
  rug:()=>{r(0,3,12,6,'#f8d848');r(1,4,10,4,'#5878b8');r(3,5,6,2,'#6890d0')},
  plant:()=>{r(4,7,4,4,'#b05030');e(6,4.5,4,3.5,'#48a838');r(5,2,2,2,'#78d058')},
  shelf:()=>{r(2,0,8,12,'#a87850');r(2,4,8,1,'#7a4a20');r(2,8,8,1,'#7a4a20');const C=['#e03040','#48a838','#f8d848','#5878b8'];for(let i=0;i<4;i++){r(3+i*2,1,1,3,C[i]);r(3+i*2,5,1,3,C[3-i]);r(3+i*2,9,1,2,C[(i+1)%4])}},
  lamp:()=>{r(3,1,6,3,'#f8e098');r(4,2,4,1,'#fff8c0');r(5,4,2,6,'#606878');r(3,10,6,1,'#404048')},
  house:()=>{r(1,5,10,6,'#f0e0c0');r(0,4,12,2,'#4870c0');r(2,2,8,2,'#4870c0');r(4,1,4,1,'#4870c0');r(5,7,2,4,'#7a4a20');r(2,7,2,2,'#a8d8f8');r(8,7,2,2,'#a8d8f8')},
  wwall:()=>{r(1,1,10,10,'#a86830');r(1,1,10,1,'#c88840');r(4,1,1,10,'#7a4a20');r(8,1,1,10,'#7a4a20')},
  swall:()=>{r(1,1,10,10,'#9898a8');for(const b of[4,8])r(1,b,10,1,'#686878');r(5,1,1,3,'#686878');r(8,5,1,3,'#686878');r(3,9,1,2,'#686878')},
  door:()=>{r(2,1,8,10,'#a06030');r(3,2,6,4,'#885020');r(3,7,6,3,'#885020');r(8,6,1,1,'#f8d848')},
  bed:()=>{r(1,2,10,9,'#7a4a20');r(2,3,8,2,'#f8f8f8');r(2,5,8,5,'#58a858');r(2,5,8,1,'#78c878')},
  chest:()=>{r(1,3,10,7,'#a86830');r(1,3,10,3,'#c88840');r(1,6,10,1,'#604020');r(5,5,2,3,'#f8d848')}};
 for(const f of FISH_T){D[f.k]=()=>fish(fishc[f.k]);D['c'+f.k]=()=>fish(cfc[f.k])}D.idag=()=>D.dagger.call(null);D.sdag=D.dagger;
 if(k==='sdag')col='#a8c0e8';(D[k]||D.stone)();
 const im=x.getImageData(0,0,14,14),d=im.data,on=(i,j)=>i>=0&&j>=0&&i<14&&j<14&&d[(j*14+i)*4+3]>40,out=[];
 for(let j=0;j<14;j++)for(let i=0;i<14;i++)if(!on(i,j)&&(on(i-1,j)||on(i+1,j)||on(i,j-1)||on(i,j+1)))out.push([i,j]);x.fillStyle='#181018';for(const[i,j]of out)x.fillRect(i,j,1,1);
 return ICONC[key]=c.toDataURL()}
// --- bag: one inventory grid ---
const BAG_ORDER=()=>['wood','stone','iron','ibar','sbar','berry','meat','cooked',...FISH_T.map(f=>'c'+f.k),...FISH_T.map(f=>f.k),...GOODS.map(gd=>gd.k),'idag','sdag','pelt','bone',...BK,...(typeof EXTRA_BAG!=='undefined'?EXTRA_BAG:[])];
let invSel=null;
// every slot shows the item's name under its picture, so you can tell things apart at a glance
const slotName=k=>{let n=INAME[k]||k;n=n.replace(/ \(pet\)$/,'');return n.charAt(0).toUpperCase()+n.slice(1)};
function slotHTML(k,n,on,act){return'<button class="slot'+(on?' on':'')+'" data-k="'+k+'"'+(act?' data-a="'+act+'"':'')+' title="'+esc(INAME[k]||k)+'"><img alt="" src="'+iconURL(k)+'"><span class="q">'+n+'</span><span class="nm">'+esc(slotName(k))+'</span></button>'}
function gridHTML(keys,count,sel,act,minSlots){const cells=keys.map(k=>slotHTML(k,count(k),k===sel,act));const total=Math.max(minSlots,Math.ceil(cells.length/5)*5);while(cells.length<total)cells.push('<div class="slot empty"></div>');return'<div class="ig">'+cells.join('')+'</div>'}
function bagGridHTML(){const keys=BAG_ORDER().filter(k=>(inv[k]|0)>0);if(!keys.includes(invSel))invSel=keys[0]||null;const k=invSel;
 let d='Gather, craft and fish to fill your bag.';if(k){d='<b>'+esc(INAME[k]||k)+'</b> ×'+(inv[k]|0)+'<br>'+esc(IDESC[k]||'');if(isFood(k))d='<button class="use" data-k="'+k+'">USE</button>'+d;if(BK.includes(k))d='<button class="use plc" data-k="'+k+'">PLACE</button>'+d}
 return gridHTML(keys,x=>inv[x]|0,k,null,20)+'<div class="bd">'+d+'</div><div class="tl" style="margin-top:10px;font-size:15px">Gold: '+GLD+'</div>'}
// --- chest storage ---
function chestHTML(){const s=CHEST_H||STR.get(CHEST_AT);if(!s||s.t!=='chest')return'<div class="be">The chest is gone.</div>';const ck=BAG_ORDER().filter(k=>(s.items[k]|0)>0),bk=BAG_ORDER().filter(k=>(inv[k]|0)>0&&k!=='chest');
 return'<div class="tl">CHEST</div>'+gridHTML(ck,k=>s.items[k]|0,null,'w',10)+'<div class="tl" style="margin-top:12px">YOUR BAG</div>'+gridHTML(bk,k=>inv[k]|0,null,'d',10)+'<div class="bd">Tap an item to move the whole stack. Items in a chest are safe if you fall.</div>'}
function chestMove(k,a){const s=CHEST_H||STR.get(CHEST_AT);if(!s||!s.items)return;if(a==='d'){const n=inv[k]|0;if(n<1)return;s.items[k]=(s.items[k]|0)+n;inv[k]=0}else{const n=s.items[k]|0;if(n<1)return;inv[k]=(inv[k]|0)+n;delete s.items[k]}sfx('pickup');saveLocal(true);saveCloud(true);rPn()}
// --- equipment (the player's name option in the START menu) ---
function eqSlot(lbl,k,col,name){return'<div class="eqs'+(name?'':' none')+'"><img alt="" src="'+iconURL(k,col)+'"><div class="ei"><small>'+lbl+'</small>'+(name||'None')+'</div></div>'}
function equipHTML(){const TC=['','#b07838','#a8a8b0','#d8e0e8','#88a8d8'],an=s=>ARM[s]?AT[ARM[s]-1]+' '+{helm:'helmet',body:'chestplate',legs:'legs'}[s]:'',tn=k=>TL[k]?TIT[TL[k]]+' '+{axe:'axe',pick:'pickaxe',sword:'sword'}[k]:'';
 const dmg=1+TL.sword+Math.floor(lvOf(0)/15)+(typeof meleeFlat==='function'?meleeFlat():0);
 return'<div class="eqh">'+esc(pname())+'</div><div class="eqw"><canvas id="tcs" width="32" height="40"></canvas></div><div class="eqg">'+eqSlot('HEAD','helm',AC3[Math.max(0,ARM.helm-1)],an('helm'))+eqSlot('BODY','body',AC3[Math.max(0,ARM.body-1)],an('body'))+eqSlot('LEGS','legs',AC3[Math.max(0,ARM.legs-1)],an('legs'))+eqSlot('WEAPON','sword',TC[TL.sword],tn('sword'))+eqSlot('AXE','axe',TC[TL.axe],tn('axe'))+eqSlot('PICKAXE','pick',TC[TL.pick],tn('pick'))+eqSlot('ROD','rod','',TL.rod?'Fishing rod':'')+'</div></div>'
 +'<div class="qc" style="margin-top:12px">'+[['Attack damage',dmg],['Block chance',Math.round(blockCh()*100)+'%'],['Defence',lvOf(8)],['Total level',lvTot()]].map(([a,b])=>'<div class="tc-r"><span>'+a+'</span><b>'+b+'</b></div>').join('')+'</div>'}
// --- building recipes in the Craft tab ---
function buildHTML(){let h='<div class="tl" style="margin-top:18px">Building</div><div class="tl" style="font-size:12px;font-weight:400;opacity:.7;margin-top:-6px">Make pieces here, then place them from your Bag.</div>';
 BREC.forEach((r,i)=>{const can=lvOf(6)>=r.req&&Object.entries(r.c).every(([a,b])=>(inv[a]|0)>=b);h+='<div class="gr" style="opacity:'+(can?1:.5)+'"><img class="gimg" alt="" src="'+iconURL(r.k)+'"><div class="gi"><b>'+r.n+'</b> <small>(have '+(inv[r.k]|0)+')</small><br><small>'+Object.entries(r.c).map(([a,b])=>b+' '+a).join(', ')+' · Crafting '+r.req+' · '+r.xp+' xp</small></div><button class="gc bc" data-i="'+i+'" data-a="1">Make</button><button class="gc bc" data-i="'+i+'" data-a="all">All</button></div>'});return h}
function makeBuild(i,all){const r=BREC[i];if(!r)return;if(sqDo('craft',all?999:1,()=>makeBuild(i,false)))return;if(lvOf(6)<r.req){say('Need Crafting '+r.req);return}let n=0;const mx=all?999:1;
 while(n<mx&&Object.entries(r.c).every(([a,b])=>(inv[a]|0)>=b)){for(const a in r.c)inv[a]-=r.c[a];inv[r.k]=(inv[r.k]|0)+1;n++}if(!n){say('Missing materials');return}
 addXp(6,r.xp*n);say('Made '+n+' '+r.n.toLowerCase()+(n>1?'s':'')+'.');sfx('chop');saveLocal(true);rPn()}
// --- routing ---
function panelChrome(title){document.getElementById('t0').style.display=ptab<=1?'':'none';document.getElementById('t1').style.display=ptab<=1?'':'none';ptt.textContent=title;if(mapT&&ptab!==5){clearInterval(mapT);mapT=null}}
const _r11=rPn;rPn=function(){if(ptab===3){panelChrome('');pbd.innerHTML=equipHTML();drawCardSprite();return}if(ptab===4){panelChrome('BAG');pbd.innerHTML=bagGridHTML();return}
 if(ptab===7){panelChrome('');pbd.innerHTML=chestHTML();return}_r11();if(ptab===1)pbd.insertAdjacentHTML('beforeend',buildHTML())};
const _oc11=pbd.onclick;pbd.onclick=e=>{const t=e.target;let b;
 if((b=t.closest('.plc'))){startBuild(b.dataset.k);return}
 if((b=t.closest('.bc'))){makeBuild(+b.dataset.i,b.dataset.a==='all');return}
 if((b=t.closest('.slot[data-k]'))){if(b.dataset.a)chestMove(b.dataset.k,b.dataset.a);else{invSel=b.dataset.k;rPn()}return}
 _oc11(e)};
const st11=document.createElement('style');st11.textContent=`
.ig{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;background:#e4e9f2;border:2px solid #c8d0e0;border-radius:8px;padding:8px;max-height:44vh;overflow:auto}
.slot{position:relative;aspect-ratio:1;background:#fff;border:2px solid #c8d0e0;border-radius:6px;padding:0;cursor:pointer;min-width:0}
.slot.on{border-color:#5878b8;box-shadow:0 0 0 2px #a8c0e0}.slot.empty{background:#f2f5fa;cursor:default}
.slot img{position:absolute;left:14%;top:10%;width:72%;height:72%;image-rendering:pixelated}
.ig .slot{aspect-ratio:auto;height:auto;min-height:0;padding-top:58%}.ig .slot img{left:24%;top:5%;width:52%;height:auto;aspect-ratio:1}.ig .slot .q{top:1px;bottom:auto;right:4px;font-size:12px}.ig .slot.empty{padding-top:calc(58% + 24px);aspect-ratio:auto}
.slot .nm{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font:600 9.5px/1.15 var(--pf);color:#404040;text-align:center;padding:0 2px 4px;word-break:break-word;min-height:22px}@media(min-width:700px){.slot .nm{font-size:11px;min-height:25px}}
.slot .q{position:absolute;right:4px;bottom:0;font:700 14px var(--pf);color:#404040;text-shadow:1px 1px 0 #fff,-1px -1px 0 #fff}
.bd b{color:#d05030}.bd .plc{background:#48a058;border-color:#2f7040}
.gimg{width:30px;height:30px;image-rendering:pixelated;flex:none}
.eqh{text-align:center;font:700 22px var(--pf);letter-spacing:1px;margin-bottom:8px}
.eqw{display:flex;justify-content:center;margin-bottom:10px}
.eqg{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.eqs{display:flex;align-items:center;gap:6px;background:#fff;border:2px solid #c8d0e0;border-radius:8px;padding:4px 6px;min-height:42px}
.eqs img{width:30px;height:30px;image-rendering:pixelated;flex:none}.eqs.none img{opacity:.25}
.eqs .ei{font-size:14px;line-height:1.2;min-width:0}.eqs small{display:block;opacity:.6;font-size:11px;letter-spacing:1px}
.eqs.none .ei{color:#909090}`;document.head.appendChild(st11);
// --- name is chosen in the character creator ---
{const ci=document.getElementById('cni'),go=document.getElementById('cgo'),prev=go.onclick;
 go.onclick=()=>{if(!PNAME){ci.style.borderColor='#d05030';ci.placeholder='Enter a name first';ci.focus();sfx('swish');return}ci.style.borderColor='';prev();saveLocal(true);saveCloud(true)};
 setTimeout(()=>{if(!PNAME&&!menuOpen&&!dead){menuOpen=true;cm.style.display='flex';go.textContent='DONE';build();rp();ci.value='';ci.placeholder='Choose your name'}},2500)}
SMI[0].l=()=>pname();
hp.innerHTML=hp.innerHTML.replace('P: trainer card','P: equipment');
setActionLabels();
