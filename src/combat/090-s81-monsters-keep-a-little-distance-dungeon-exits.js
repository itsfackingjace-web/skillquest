// ---------------------------------------------------------------- 81. Monsters keep a little distance; dungeon exits
// Monsters no longer pile on top of you: they stop about half a tile away (still close enough to hurt you), and if
// one is right next to you when you swing, you turn to face it, so you can always hit what's hitting you.
{const MIND=9;
 const _u=upd;upd=function(dt){_u(dt);if(dead||menuOpen||pnOpen)return;for(const n of en){if(n.dead||n._rp||n._wb||n.big||n.type==='boss'||n.type==='bonelord')continue;
   const dx=n.x-P.x,dy=n.y-P.y,d=Math.hypot(dx,dy);if(d>=MIND)continue;const ux=d>.01?dx/d:-face[0]||1,uy=d>.01?dy/d:-face[1]||0,nx=P.x+ux*MIND,ny=P.y+uy*MIND;
   if(!solid(nx,ny+4)){n.x=nx;n.y=ny}}};
 const _a=attack;attack=function(){if(!dead&&!menuOpen&&!pnOpen&&swing<=0&&!BUILD&&!FISH){const[fx,fy]=front(13);if(!en.some(n=>!n.dead&&Math.hypot(n.x-fx,n.y-fy)<16)){let best=null,bd=18;
    for(const n of en){if(n.dead)continue;const d=Math.hypot(n.x-P.x,n.y-P.y);if(d<bd){bd=d;best=n}}if(best){const dx=best.x-P.x,dy=best.y-P.y;face=Math.abs(dx)>Math.abs(dy)?[Math.sign(dx)||1,0]:[0,Math.sign(dy)||1]}}}return _a()}}
// Every dungeon's last floor has an exit door near the boss's lair: step on it to climb straight back outside.
{const _da=dArrive;dArrive=function(R,from){_da(R,from);const D=R.dun;if(!D||R.items.some(it=>it.t==='stairs')||R.items.some(it=>it.t==='dexit'))return;
  const b=D.boss||[Math.floor(R.w/2),Math.floor(R.h/2)],W=R.w,ok=(x,y)=>x>0&&y>2&&x<W-1&&y<R.h-1&&!R.solid.has(y*W+x)&&!R.solid.has((y-1)*W+x)&&!R.items.some(it=>it.x===x&&it.y===y);
  for(let r=4;r<12;r++){let done=false;for(let a=0;a<16&&!done;a++){const x=Math.round(b[0]+Math.cos(-Math.PI/2+a*Math.PI/8)*r),y=Math.round(b[1]+Math.sin(-Math.PI/2+a*Math.PI/8)*r*.8);if(ok(x,y)){R.items.push({t:'dexit',x,y});done=true}}if(done)break}}
 const _df=drawFurn;drawFurn=function(it,tm){if(it&&it.t==='dexit'){const x0=it.x*16,y0=it.y*16,p=.5+.5*Math.sin(tm*3);
   g.fillStyle='rgba(255,230,150,'+(.18+.18*p)+')';g.beginPath();g.arc(x0+8,y0,16,0,6.283);g.fill();
   Rg(x0-1,y0-17,18,33,O);Rg(x0,y0-16,16,31,'#8a6a48');Rg(x0+2,y0-14,12,27,'#f8e8b0');Rg(x0+3,y0-13,10,25,'#fff8d8');Rg(x0+2,y0-14,12,3,'#c8a060');
   for(let k=0;k<3;k++)Rg(x0+4+k*3,y0+4+Math.round(Math.sin(tm*4+k)*2),2,2,'#ffffff');Rg(x0-2,y0+14,20,3,'#5a4630');return}return _df(it,tm)};
 const _u=upd;upd=function(dt){_u(dt);const R=SCENE&&SCENE.room;if(!R||!R.dun||dead||menuOpen||pnOpen)return;const ex=R.items.find(it=>it.t==='dexit');
  if(ex&&Math.hypot(P.x-(ex.x*16+8),P.y-(ex.y*16+4))<8){const f0=R.dun.f;R.dun.f=1;try{leaveScene()}finally{R.dun.f=f0}say('You climb out of the '+((DKIND[R.dun.kind]||{}).name||'dungeon')+' into the open air.')}}}
