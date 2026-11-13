// ---- 108. Skilling takes time: every cook, fire, smelt, forge, craft and catch is a short action you can see ----
// Lighting a fire, cooking, smelting, smithing, crafting and reeling in a fish each take about 2-3 seconds, with an
// animation and a progress bar over your head. "Make all" / "Cook all" do one at a time until you run out. Moving
// stops it. (Before, these happened instantly, so whole levels could be made in seconds.)
var SQDO=null;
// A station (stove, furnace, anvil, crafting bench) lends you the materials in nearby chests only while its button is
// being handled. A timed action runs its steps later, after the screen has closed, so it remembers the station it was
// started at and the chests that station was using, and borrows from them again for every step.
function sqMerge(chests){if(typeof BMERGE==='undefined'||BMERGE||!chests||!chests.length)return false;const tot={};for(const c of chests)for(const k in c)if(c[k]>0)tot[k]=(tot[k]||0)+c[k];
 const bag={};for(const k in tot){bag[k]=inv[k]|0;inv[k]=bag[k]+tot[k]}BMERGE={chests,tot,bag};return true}
function sqDo(kind,n,fn){if(window.SQDO_STEP)return false;if(dead)return true;// speed from the skill's level and perks (039's pSpeed) makes the action shorter
 const SKK={fire:5,cook:4,smelt:10,smith:10,craft:6}[kind],D=({fire:2.6,cook:2.4,smelt:2.4,smith:2.6,craft:2.4,reel:1.8}[kind]||2.4)/(1+(SKK!=null&&typeof pSpeed==='function'?Math.max(0,pSpeed(SKK)):0));
 const st=typeof STATION!=='undefined'?STATION:null,chests=typeof BMERGE!=='undefined'&&BMERGE?BMERGE.chests.slice():null;
 SQDO={kind,n:Math.max(1,n|0),fn,t:0,d:D,x:P.x,y:P.y,done:0,st,chests};try{if(pnOpen)closePanel()}catch(e){}jx=jy=0;
 say({fire:'Lighting a fire...',cook:'Cooking...',smelt:'Smelting...',smith:'Hammering at the anvil...',craft:'Crafting...',reel:'Reeling it in...'}[kind]||'Working...');return true}
{const _f=fire;fire=function(){if(sqDo('fire',1,()=>_f()))return;return _f()};
 const _e=eat;eat=function(){if(dead||menuOpen||pnOpen)return _e();// cooking at a fire takes time; eating doesn't
  if(nearFire(P.x,P.y,45)&&(typeof COOKS!=='undefined'&&COOKS.some(c=>(inv[c.raw]|0)>0&&lvOf(4)>=c.lv)||(inv.meat|0)>0&&nearFire(P.x,P.y,45))){let n=0;for(const c of COOKS)if(lvOf(4)>=c.lv)n+=inv[c.raw]|0;if(sqDo('cook',Math.max(1,n),()=>_e()))return}return _e()};
 const _cf=catchFish;catchFish=function(){if(window.SQDO_STEP||!FISH)return _cf();FISH.t=-999;FISH.bite=0;sqDo('reel',1,()=>{if(FISH)_cf()});};
 const xpSum=()=>XPS.reduce((a,v)=>a+v,0),invSum=()=>Object.values(inv).reduce((a,v)=>a+(+v||0),0);
 const _u=upd;upd=function(dt){_u(dt);const D=SQDO;if(!D)return;
  if(dead||Math.hypot(P.x-D.x,P.y-D.y)>3||(D.kind==='reel'&&!FISH)){SQDO=null;if(!dead&&D.kind!=='reel')say('Stopped'+(D.done?' after '+D.done:'')+'.');return}
  if(D.kind==='reel'&&FISH)FISH.t=-999;
  if((D.kind==='smith'||D.kind==='craft')&&!window.SQSKFX&&swing<=0&&(D.t%0.7)<dt)swing=.25;
  D.t+=dt;if(D.t<D.d)return;
  const x0=xpSum(),i0=invSum(),f0=fires.length,c0=JSON.stringify(D.chests||[]),st0=typeof STATION!=='undefined'?STATION:null;window.SQDO_STEP=true;
  if(D.st)STATION=D.st;const m=sqMerge(D.chests);
  try{D.fn()}catch(e){console.warn(e)}finally{if(m)benchSplit();if(D.st)STATION=st0;window.SQDO_STEP=false}
  const ok=xpSum()!==x0||invSum()!==i0||fires.length!==f0||JSON.stringify(D.chests||[])!==c0;if(ok)D.done++;D.n--;
  if(!ok||D.n<=0||SQDO!==D){if(SQDO===D)SQDO=null}else{D.t=0;D.x=P.x;D.y=P.y}};
 // the look of it: a progress bar over your head and something happening in front of you
 const _dh=drawHUD;drawHUD=function(){_dh();const D=SQDO;if(!D||menuOpen)return;const U=(HUDL&&HUDL.U)||1,sx=W/2,sy=H/2,tm=performance.now()/1000,[fx0,fy0]=front(14),fx=W/2+(fx0-P.x)*Z,fy=H/2+(fy0-P.y)*Z,z=Z,pr=Math.min(1,D.t/D.d);
  // no progress bar: the character's own animation shows the work (fire, cooking and fishing: section 116)
  g.save();g.setTransform(1,0,0,1,0,0);const by=sy-28*z+6*z;
  if(D.n>1&&D.n<900){g.font='700 '+Math.round(5*z)+'px '+PF;g.textAlign='center';g.textBaseline='bottom';g.lineWidth=2*U;g.strokeStyle='#302818';g.strokeText(D.n+' left',sx,by-z);g.fillStyle='#f8f0d8';g.fillText(D.n+' left',sx,by-z)}
  const P2=(x,y,s,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.max(1,s*z),Math.max(1,s*z))};
  if(window.SQSKFX){}// drawn on the character (section 116)
  else if(D.kind==='fire'){// kindling, flint sparks, then the first wisps of smoke
   for(let k=0;k<3;k++){g.fillStyle='#6a4020';g.fillRect(fx-6*z+k*3*z,fy+2*z-k%2*z,7*z,2*z)}
   if(Math.floor(tm*6)%2)for(let k=0;k<4;k++)P2(fx+(Math.random()-.5)*10*z,fy-(Math.random()*6)*z,1,Math.random()<.5?'#ffe080':'#ff9030');
   if(pr>.5)for(let k=0;k<3;k++){const ph=(tm*.8+k/3)%1;g.globalAlpha=(1-ph)*.6;P2(fx+Math.sin(ph*6+k)*3*z,fy-ph*16*z,2,'#c8c0b8')}g.globalAlpha=1;if(pr>.75){P2(fx-z,fy-2*z,2,'#f86020');P2(fx,fy-3*z,1,'#ffd040')}}
  else if(D.kind==='cook'){for(let k=0;k<4;k++){const ph=(tm*1.2+k/4)%1;g.globalAlpha=(1-ph)*.55;P2(fx-4*z+k*3*z+Math.sin(ph*8)*z,fy-4*z-ph*14*z,2,'#f0f0f0')}g.globalAlpha=1;
   if(Math.floor(tm*8)%3===0)P2(fx+(Math.random()-.5)*8*z,fy-2*z,1,'#ffd060');g.strokeStyle='#8a6a40';g.lineWidth=Math.max(1,z);g.beginPath();g.moveTo(sx+3*z,sy-4*z);g.lineTo(fx,fy-2*z);g.stroke()}
  else if(D.kind==='smith'||D.kind==='smelt'){if(D.kind==='smelt'){g.globalAlpha=.5+.3*Math.sin(tm*8);P2(fx-3*z,fy-3*z,6,'#f86020');g.globalAlpha=1}
   const hit=(D.t%0.7)<.12;if(hit)for(let k=0;k<6;k++){const a=Math.random()*6.283,r=(2+Math.random()*7)*z;P2(fx+Math.cos(a)*r,fy-3*z+Math.sin(a)*r*.6,1,Math.random()<.5?'#ffe080':'#ffb040')}}
  else if(D.kind==='craft'){if((D.t%0.7)<.15)for(let k=0;k<4;k++)P2(fx+(Math.random()-.5)*9*z,fy-2*z-(Math.random()*5)*z,1,'#c8a070')}
  else if(D.kind==='reel'&&FISH){const bx=W/2+(FISH.bx-P.x)*Z,by=H/2+(FISH.by-P.y)*Z,k=pr;const x=bx+(sx-bx)*k*.7,y=by+(sy-by)*k*.7;for(let j=0;j<3;j++){const ph=(tm*3+j/3)%1;g.globalAlpha=1-ph;g.strokeStyle='#e8f8ff';g.lineWidth=Math.max(1,z*.6);g.beginPath();g.ellipse(x,y+2*z,(2+ph*6)*z,(1+ph*3)*z,0,0,6.283);g.stroke()}g.globalAlpha=1;P2(x-z,y-z+Math.sin(tm*20)*z,2,'#e04040')}
  g.restore()};
}
