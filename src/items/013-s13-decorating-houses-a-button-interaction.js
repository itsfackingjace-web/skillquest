// ---------------------------------------------------------------- 13. Decorating houses, A-button interaction
// Houses are big and start empty. Craft furniture and place it inside however you like.
// HIT works like the A button: it talks to people you face and uses beds and chests.
ROOMS.home={w:14,h:10,ex:7,floor:['#dcbc8c','#ceae7e'],wall:'#f4e4cc',trim:'#8a6038',items:[{t:'window',x:2,y:0},{t:'window',x:5,y:0},{t:'window',x:8,y:0},{t:'window',x:11,y:0}],solid:new Set()};
const FURN=[{k:'chair',n:'Chair',c:{wood:3},req:2,xp:15,hp:1},{k:'table',n:'Table',c:{wood:6},req:3,xp:25,hp:1},{k:'plant',n:'Potted plant',c:{berry:3,stone:1},req:2,xp:15,hp:1},{k:'rug',n:'Rug',c:{berry:4,wood:2},req:4,xp:25,hp:1},{k:'shelf',n:'Bookshelf',c:{wood:8},req:6,xp:45,hp:1},{k:'lamp',n:'Lamp',c:{ibar:1,wood:2},req:12,xp:60,hp:1}];
const FURN_ONLY=new Set(FURN.map(f=>f.k));
for(const f of FURN){BREC.push(f);BK.push(f.k);BHP[f.k]=f.hp;INVK.push(f.k);INAME[f.k]=f.n}
Object.assign(IDESC,{chair:'A simple wooden chair. Furniture for your house.',table:'A sturdy table. Furniture for your house.',plant:'A leafy plant in a clay pot. Furniture for your house.',rug:'A soft blue rug. You can walk over it.',shelf:'A tall bookshelf full of books. Furniture for your house.',lamp:'A warm lamp that lights up your room.',house:'A big empty house. Walk in, then craft furniture and decorate it however you like.'});
let CHEST_IDX=-1,bedPick=null;
// reload saved houses now that every furniture type is known

// --- placing furniture inside your house ---
const inHome=()=>SCENE&&SCENE.id==='home'&&SCENE.house;
function canPlaceIn(x,y){if(!inHome())return false;const R=SCENE.room,h=SCENE.house;if(x<0||x>=R.w||y<2||y>=R.h)return false;if(x===R.ex&&y>=R.h-1)return false;if(h.furn.has(y*R.w+x))return false;
 const cx=x*16+8,cy=y*16+8;if(Math.abs(P.x-cx)<13&&Math.abs(P.y-cy)<13&&BUILD&&BUILD.k!=='rug')return false;return true}
const _cpl13=canPlace;canPlace=function(x,y){return SCENE?canPlaceIn(x,y):_cpl13(x,y)};
const _sb13=startBuild;startBuild=function(k){if((inv[k]|0)<1)return;
 if(SCENE){if(!inHome()){say('You can only decorate your own house.');closePanel();return}if(k==='house'){say('Houses go outside.');closePanel();return}BUILD={k};closePanel();setActionLabels();say('Decorate: face a spot and press PLACE. Press DONE when finished.');return}
 if(FURN_ONLY.has(k)){say('Furniture goes inside your house. Walk in through the door first.');closePanel();return}_sb13(k)};
const _pb13=placeBuild;placeBuild=function(){if(!SCENE)return _pb13();const k=BUILD.k,[x,y]=frontTile();if(!canPlaceIn(x,y)){say('You can\'t put that there.');sfx('swish');return}
 const R=SCENE.room;inv[k]--;SCENE.house.furn.set(y*R.w+x,k==='chest'?{t:k,items:{}}:{t:k});sfx(k==='swall'?'mine':'chop');saveLocal(true);saveCloud(true);if((inv[k]|0)<1)endBuild('Placed your last '+INAME[k].toLowerCase()+'.')};
const _ls13=leaveScene;leaveScene=function(){if(BUILD)endBuild();_ls13()};
function pickFurn(i){const h=SCENE&&SCENE.house;if(!h)return;const f=h.furn.get(i);if(!f)return;h.furn.delete(i);inv[f.t]=(inv[f.t]|0)+1;let extra='';
 if(f.items){for(const k in f.items)inv[k]=(inv[k]|0)+f.items[k];if(Object.values(f.items).some(v=>v>0))extra=' and everything inside'}
 say('Picked up the '+INAME[f.t].toLowerCase()+extra+'.');sfx('chop');setTimeout(()=>sfx('pickup'),90);saveLocal(true);saveCloud(true)}
function pickStruct(i){const s=STR.get(i);if(!s)return;STR.delete(i);inv[s.t]=(inv[s.t]|0)+1;let extra='';if(s.items){for(const k in s.items)inv[k]=(inv[k]|0)+s.items[k];if(Object.values(s.items).some(v=>v>0))extra=' and everything inside'}
 if(BEDSP===i)BEDSP=-1;say('Picked up the '+INAME[s.t].toLowerCase()+extra+'.');sfx('chop');setTimeout(()=>sfx('pickup'),90);saveLocal(true);saveCloud(true)}
// --- collision with furniture ---
const _sol13=solid;solid=function(px,py){if(_sol13(px,py))return true;if(!inHome())return false;const R=SCENE.room,x=Math.floor(px/16),y=Math.floor(py/16),f=SCENE.house.furn.get(y*R.w+x);
 if(!f||f.t==='rug')return false;return f.t==='door'?!doorOpen(y*N+x):true};
// --- beds and chests at home ---
nearFurn=function(){if(!inHome())return null;const R=SCENE.room;let best=null,bd=24;for(const[i,f]of SCENE.house.furn){if(f.t!=='bed'&&f.t!=='chest')continue;const cx=(i%R.w)*16+8,cy=((i/R.w)|0)*16+8,d=Math.hypot(P.x-cx,P.y-cy);if(d<bd){bd=d;best={i,f}}}return best};
useFurn=function(o){if(!o||!inHome())return;const h=SCENE.house;
 if(o.f.t==='chest'){CHEST_H=o.f;CHEST_IDX=o.i;fromMenu=false;pnOpen=true;ptab=7;jx=jy=0;pn.style.display='block';rPn();sfx('talk');return}
 HOMESP=h.id;BEDSP=-1;if(dark()<.3){bedPick={i:o.i,at:performance.now(),home:1};say('You\'ll wake up here now. Hit the bed again to pick it up.');sfx('talk')}
 else{time=(Math.floor(time/DAYLEN)+1)*DAYLEN+1;P.hp=Math.min(6,P.hp+2);hunger=Math.max(0,hunger-15*FOOD_RATE);say('You slept soundly at home. Good morning!');sfx('quest')}saveLocal(true);saveCloud(true)};
const _us13=useStructure;useStructure=function(i){CHEST_IDX=-1;_us13(i)};
// wake up beside your bed at home
const _rs13=reset;reset=function(){_rs13();if(!inHome())return;const R=SCENE.room;let bed=null;for(const[i,f]of SCENE.house.furn)if(f.t==='bed'){bed=i;break}
 const spots=[];if(bed!==null){const bx=bed%R.w,by=(bed/R.w)|0;spots.push([bx+1,by],[bx-1,by],[bx,by+1],[bx,by-1])}spots.push([R.ex,R.h-2]);
 for(const[x,y]of spots){const px=x*16+8,py=y*16+8;if(!(solid(px-5,py-3)||solid(px+5,py-3)||solid(px-5,py+6)||solid(px+5,py+6))){P.x=px;P.y=py;break}}};
// --- HIT works like the A button ---
function facingNpc(){const n=nearNpc();if(!n)return null;const dx=n.x-P.x,dy=n.y-P.y;return(dx*face[0]+dy*face[1])>-4||n.scene?n:null}
const _atk13=attack;attack=function(){if(dead||menuOpen||pnOpen)return;
 if(BUILD){if(SCENE){placeBuild();return}return _atk13()}
 if(facingNpc()){talk();return}
 if(SCENE){if(inHome()&&swing<=0){const R=SCENE.room,[x,y]=frontTile(),i=y*R.w+x,f=SCENE.house.furn.get(i);
   if(f){swing=.25;if(f.t==='bed'){if(bedPick&&bedPick.home&&bedPick.i===i&&performance.now()-bedPick.at<3000){bedPick=null;pickFurn(i)}else useFurn({i,f})}else if(f.t==='chest')useFurn({i,f});else pickFurn(i);return}}
  return _atk13()}
 if(swing<=0&&!FISH){const[x,y]=frontTile(),i=y*N+x,s=STR.get(i);if(s&&(s.t==='bed'||s.t==='chest')){swing=.25;
   if(s.t==='chest'){useStructure(i);return}if(bedPick&&!bedPick.home&&bedPick.i===i&&performance.now()-bedPick.at<3000){bedPick=null;pickStruct(i);return}
   useStructure(i);if(dark()<.3){bedPick={i,at:performance.now(),home:0};say('This bed is where you wake up now. Hit it again to pick it up.')}return}}
 _atk13()};
// chest screen: pick the chest itself up
const _r13=rPn;rPn=function(){_r13();if(ptab===7&&(CHEST_H||STR.get(CHEST_AT)))pbd.insertAdjacentHTML('beforeend','<button class="ng" id="chpk">Pick up this chest (contents go to your bag)</button>')};
const _oc13=pbd.onclick;pbd.onclick=e=>{if(e.target.closest('#chpk')){const inside=!!CHEST_H&&CHEST_IDX>=0;closePanel();if(inside)pickFurn(CHEST_IDX);else pickStruct(CHEST_AT);CHEST_H=null;return}_oc13(e)};
// --- drawing rooms: furniture, depth sorting, the walk cycle and the placement preview ---
function drawPiece(t,x,y,f,ghost,tm){const x0=x*16,y0=y*16;
 if(t==='wwall'||t==='swall'||t==='door'||t==='bed'||t==='chest')return drawStruct(y*N+x,f||{t},ghost);
 if(t==='rug'&&!ghost&&inHome()){const fu=SCENE.house.furn,w=SCENE.room.w,isR=(a,b)=>{const q=fu.get(b*w+a);return!!q&&q.t==='rug'},l=isR(x-1,y),r=isR(x+1,y),u=isR(x,y-1),d=isR(x,y+1);
  Rg(x0,y0,16,16,'#f8d848');Rg(x0+(l?0:2),y0+(u?0:2),16-(l?0:2)-(r?0:2),16-(u?0:2)-(d?0:2),'#5878b8');if((x+y)%2)Rg(x0+5,y0+5,6,6,'#6890d0');return}
 if(t==='table'||t==='plant'||t==='rug')return drawFurn({t,x,y,w:1},tm);
 if(t==='chair'){shd(x0+8,y0+13,10);Rg(x0+3,y0-3,10,6,O);Rg(x0+4,y0-2,8,3,'#a86830');Rg(x0+4,y0+1,1,5,O);Rg(x0+11,y0+1,1,5,O);Rg(x0+2,y0+5,12,6,O);Rg(x0+3,y0+6,10,4,'#c88840');Rg(x0+3,y0+11,2,4,O);Rg(x0+11,y0+11,2,4,O)}
 else if(t==='shelf'){Rg(x0+1,y0-10,14,26,O);Rg(x0+2,y0-9,12,24,'#a87850');for(const yy of[-2,6])Rg(x0+2,y0+yy,12,2,'#7a4a20');const C=['#e03040','#48a838','#f8d848','#5878b8','#b03070','#f08830'];
  for(let i=0;i<5;i++){Rg(x0+3+i*2,y0-8,2,6,C[i%6]);Rg(x0+3+i*2,y0,2,6,C[(i+2)%6]);Rg(x0+3+i*2,y0+8,2,6,C[(i+4)%6])}}
 else if(t==='lamp'){g.fillStyle='rgba(255,230,140,.16)';g.beginPath();g.arc(x0+8,y0-4,18,0,6.283);g.fill();shd(x0+8,y0+13,10);Rg(x0+7,y0-3,2,15,'#606878');Rg(x0+4,y0+11,8,4,O);Rg(x0+5,y0+12,6,2,'#606878');Rg(x0+3,y0-11,10,9,O);Rg(x0+4,y0-10,8,7,'#f8e098');Rg(x0+5,y0-9,6,2,'#fff8c0')}}
function drawRoom(tm){qm=Math.hypot(P.x-qL.x,P.y-qL.y)>.01;qL.x=P.x;qL.y=P.y;if(qm)qW+=isSprint()?.42:.25;
 const R=SCENE.room,W2=R.w*16,H2=R.h*16,h=inHome()?SCENE.house:null;g.imageSmoothingEnabled=false;
 if(ROOMBG)ROOMBG(R,W2,H2);else{Rg(-5,-5,W2+10,H2+10,'#181018');for(let y=2;y<R.h;y++)for(let x=0;x<R.w;x++){Rg(x*16,y*16,16,16,R.floor[(x+y)&1]);Rg(x*16,y*16+15,16,1,'rgba(0,0,0,.07)')}
 Rg(0,0,W2,32,R.wall);for(let x=8;x<W2;x+=16)Rg(x,5,1,23,'rgba(0,0,0,.05)');Rg(0,0,W2,4,R.trim);Rg(0,29,W2,3,R.trim);Rg(0,32,W2,2,'rgba(0,0,0,.12)');
 Rg(R.ex*16,H2-1,16,6,R.floor[0]);Rg(R.ex*16+2,H2-7,12,7,'#c04030');Rg(R.ex*16+3,H2-5,10,1,'#e8a090');Rg(R.ex*16+3,H2-3,10,1,'#e8a090')}
 const flat=['rug','window','shelf','rack'];for(const it of R.items)if(flat.includes(it.t))drawFurn(it,tm);
 if(h)for(const[i,f]of h.furn)if(f.t==='rug')drawPiece('rug',i%R.w,(i/R.w)|0,f,false,tm);
 const L=[];for(const it of R.items)if(!flat.includes(it.t))L.push([(it.y+(it.sh||1))*16-1,0,it]);
 if(h)for(const[i,f]of h.furn)if(f.t!=='rug')L.push([(((i/R.w)|0)+1)*16-1,3,f,i]);
 for(const n of NPCS)if(n.scene===SCENE.id)L.push([n.y+6,1,n]);L.push([P.y+6,2]);L.sort((a,b)=>a[0]-b[0]);
 for(const e of L){if(e[1]===0)drawFurn(e[2],tm);else if(e[1]===3)drawPiece(e[2].t,e[3]%R.w,(e[3]/R.w)|0,e[2],false,tm);else if(e[1]===1){const n=e[2];shd(n.x,n.y+6,12);GC=g;cP(n.ch,0,0,Math.round(n.x),Math.round(n.y),false)}else if(!dead)pP(tm)}
 if(BUILD&&h){const[x,y]=frontTile(),ok=canPlaceIn(x,y);g.globalAlpha=.6;drawPiece(BUILD.k,x,y,{t:BUILD.k},true,tm);g.globalAlpha=1;g.fillStyle=ok?'rgba(80,240,120,.35)':'rgba(240,60,60,.35)';g.fillRect(x*16,y*16,16,16)}};
