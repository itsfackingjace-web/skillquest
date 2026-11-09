// ---------------------------------------------------------------- 76. Sailing around the other islands
// Your sailboat works on every island: face open water and press TALK / USE (SAIL) to set off, face land and press it
// again (LAND) to go ashore. Other players see you in your boat. (Sailing between islands is still done at the
// harbor and pier posts.)
const RSAIL={on:false,lx:0,ly:0,wake:0,lab:false};window.SQRSAIL=RSAIL;
const rsR=()=>{const R=SCENE&&SCENE.room;return R&&R.region?R:null};
const rsWater=(R,tx,ty)=>tx>=0&&ty>=0&&tx<R.w&&ty<R.h&&R.tiles[ty*R.w+tx]===0;
const rsBoatOK=(R,x,y)=>[[-6,-1],[6,-1],[-6,6],[6,6]].every(([a,b])=>rsWater(R,Math.floor((x+a)/16),Math.floor((y+b)/16)));
function rsCanBoard(){const R=rsR();if(!R||RSAIL.on||!TL.boat||dead||BUILD||FISH)return false;if(R.dock&&Math.hypot(P.x/16-R.dock[0]-.5,P.y/16-R.dock[1]-.5)<2.5)return false;const[tx,ty]=frontT();return rsWater(R,tx,ty)&&rsBoatOK(R,tx*16+8,ty*16+8)}
function rsCanLand(){const R=rsR();if(!R||!RSAIL.on||dead)return null;const sv=RSAIL.on;RSAIL.on=false;
 try{return landPick((tx,ty)=>{if(tx<0||ty<0||tx>=R.w||ty>=R.h||rsWater(R,tx,ty))return false;const cx=tx*16+8,cy=ty*16+8;return!(solid(cx-5,cy-3)||solid(cx+5,cy-3)||solid(cx-5,cy+6)||solid(cx+5,cy+6))})}finally{RSAIL.on=sv}}
function rsToggle(){const[tx,ty]=frontT();
 if(rsCanBoard()){RSAIL.on=true;RSAIL.lx=P.x;RSAIL.ly=P.y;P.x=tx*16+8;P.y=ty*16+6;FISH=null;sfx('splash');say('You set sail! Face land and press '+(isPC?'T':'USE')+' to go ashore.');return true}
 const L=rsCanLand();if(L){RSAIL.on=false;P.x=L[0]*16+8;P.y=L[1]*16+8;sfx('door');say('You go ashore.');saveLocal(true);return true}return false}
const rsStop=()=>{RSAIL.on=false};
{const _t=talk;talk=function(){if(!pnOpen&&!menuOpen&&!dead&&rsR()&&!nearNpc()){if(RSAIL.on?rsCanLand():rsCanBoard()){rsToggle();return}if(RSAIL.on)return}return _t()}}
tk.addEventListener('touchstart',e=>{if(pnOpen||!rsR()||nearNpc())return;if(rsCanBoard()||rsCanLand()){e.preventDefault();e.stopImmediatePropagation();rsToggle()}},{passive:false,capture:true});
// the boat glides over water; you can't walk off it
{const _u=upd;upd=function(dt){const paused=menuOpen||pnOpen;if(RSAIL.on&&(!rsR()||dead))RSAIL.on=false;
  if(RSAIL.on&&!paused){const R=rsR(),px=P.x,py=P.y;let ix=jx+(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0),iy=jy+(K.s||K.arrowdown?1:0)-(K.w||K.arrowup?1:0);const l=Math.hypot(ix,iy);
   _u(dt);if(RSAIL.on&&rsR()===R&&!(TRAVEL49&&TRAVEL49.done)){P.x=px;P.y=py}   // a controller ✕ can land you during the update: then keep the spot it put you on (but not across a sea crossing)
   if(RSAIL.on&&l>.05&&!dead){const nx=ix/Math.max(1,l),ny=iy/Math.max(1,l),sp=78*(K.shift?1.35:1)*dt;if(Math.abs(nx)>Math.abs(ny))face=[Math.sign(nx),0];else face=[0,Math.sign(ny)];
    if(FISH)FISH=null;if(rsBoatOK(R,P.x+nx*sp,P.y))P.x+=nx*sp;if(rsBoatOK(R,P.x,P.y+ny*sp))P.y+=ny*sp;
    if((RSAIL.wake-=dt)<=0){RSAIL.wake=.08;DUST.push({x:P.x-face[0]*12+(Math.random()*4-2),y:P.y+5-face[1]*8,t:0,c:'#e8f8ff',sc:curScene()})}}
   en=en.filter(n=>!rsWater(R,Math.floor(n.x/16),Math.floor(n.y/16)))}
  else _u(dt);
  // SAIL / LAND on the TALK button
  const want=!paused&&!dead&&rsR()&&!nearNpc()?(rsCanLand()?'LAND':rsCanBoard()?'SAIL':''):'';
  if(want){tk.style.display='flex';const lab=want+(isPC?'<small>T</small>':'');if(!tk.innerHTML.startsWith(want))tk.innerHTML=lab;RSAIL.lab=true}
  else if(RSAIL.lab){RSAIL.lab=false;tk.innerHTML='TALK'+(isPC?'<small>T</small>':'');if(typeof tkLab!=='undefined')tkLab=''}}}
// drawing: you in your boat
{const _p=pP;pP=function(tm){if(!RSAIL.on||!rsR())return _p(tm);const bob=Math.round(Math.sin(tm*2.6));drawBoat26(tm);
  g.save();g.translate(0,(window.BOAT85?BOAT85.dy:3)+bob);_p(tm);g.restore();drawBoatFront26(Math.round(P.x),Math.round(P.y)+bob,face,tm)}}
// no campfires, building or rolling from a boat
{const _f=fire;fire=function(){if(RSAIL.on){say('Not on a boat!');return}_f()}}
{const _sb=startBuild;startBuild=function(k){if(RSAIL.on){say('Go ashore to build.');closePanel();return}_sb(k)}}
{const _r=roll;roll=function(){if(RSAIL.on)return;_r()}}
// leaving the island, falling, travelling: back on foot
{const _lr=loadRegion;loadRegion=function(...a){rsStop();return _lr(...a)}}
{const _lv=leaveRegion;leaveRegion=function(){rsStop();return _lv()}}
{const _rs=reset;reset=function(){rsStop();_rs()}}
{const _es=enterScene;enterScene=function(...a){rsStop();return _es(...a)}}
// a save made at sea puts you back where you set sail
{const _sn=snap;snap=function(){const s=_sn();if(RSAIL.on&&s.region&&s.region.id!=='hollow'){s.region.x=Math.floor(RSAIL.lx/16);s.region.y=Math.floor(RSAIL.ly/16)}return s}}
