// ---- 255. No hits from monsters hidden under houses and castles (window.SQUNDER) ----
// Nov 19-20 chat: "I'm taking damage from nothing", "A crab was under fumps door", "we all died from the random damage bug".
// 227 stops monsters that aren't drawn at all; these ones ARE drawn, but behind an island house or castle (a player's home on
// an island, 067's RH and other players' houses): standing on the door tile or behind the roof, they were covered by the
// building and still touched anyone walking up to the door.
// Now:
//  - every half second, a monster under a building (its walls, door and roof: columns x-3..x+3, rows y-4..y of the house's
//    door tile) is moved to the nearest free open tile outside it (a shared monster that another
//    player's game runs is left to that game);
//  - a monster that is still covered can't touch you (it's left out of that update).
(()=>{const exempt=n=>!n||n.dead||n.big||n.boss||n.type==='boss'||n.type==='ib'||n._wb||n.cb||n.under||n._pet;
 const room=()=>{const R=SCENE&&SCENE.room;return R&&R.region&&R.w&&R.solid?R:null};
 // tiles covered by a building drawing on this island
 let CV=null,cvAt=0;
 function cover(R){const now=performance.now();if(CV&&CV.R===R&&now-cvAt<500)return CV.s;const s=new Set();
  try{const L=typeof window.rhList==='function'?window.rhList():[];for(const h of L){if(!h||!isFinite(h.x)||!isFinite(h.y))continue;
    for(let dy=-4;dy<=0;dy++)for(let dx=-3;dx<=3;dx++){const x=h.x+dx,y=h.y+dy;if(x>=0&&y>=0&&x<R.w&&y<R.h)s.add(y*R.w+x)}}}catch(e){self.SQERR&&SQERR(e,'247-1')}
  CV={R,s};cvAt=now;return s}
 const tileOf=(R,n)=>Math.floor(n.y/16)*R.w+Math.floor(n.x/16);
 const hidden=(R,n,cv)=>cv.has(tileOf(R,n))
 function free(R,i,cv,wet){if(cv.has(i)||R.solid.has(i))return false;const x=i%R.w,y=(i/R.w)|0;if(x<1||y<1||x>=R.w-1||y>=R.h-1)return false;
  if(R.tiles&&(R.tiles[i]===0)!==!!wet)return false;try{if(solid(x*16+8,y*16+8))return false}catch(e){self.SQERR&&SQERR(e,'247-2')}return true}
 // nearest free tile, a little away from you when it can be
 function moveOut(R,n,cv){const tx=Math.floor(n.x/16),ty=Math.floor(n.y/16),wet=R.tiles&&R.tiles[ty*R.w+tx]===0&&n.water;let best=null;
  for(let r=1;r<=8&&!best;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=tx+dx,y=ty+dy;
   if(x<0||y<0||x>=R.w||y>=R.h)continue;const i=y*R.w+x;if(!free(R,i,cv,wet))continue;const px=x*16+8,py=y*16+8,d=Math.hypot(px-P.x,py-P.y);
   const sc=r*16+(d<28?200:0);if(!best||sc<best.sc)best={px,py,sc}}
  if(!best)return false;n.x=best.px;n.y=best.py;if('tx'in n&&!n._rp){n.tx=best.px;n.ty=best.py}if('hx'in n){n.hx=best.px;n.hy=best.py}n.kx=n.ky=0;return true}
 let sw=0,MOVED=0,BLOCKED=0;
 SQUPD.wrap('247 no hits from under houses',_u=>function(dt){const R=room();if(!R||dead||menuOpen||pnOpen||!Array.isArray(en))return _u.apply(this,arguments);
  const cv=cover(R),away=[];
  sw-=Number.isFinite(dt)?dt:.016;if(!(sw>0)){sw=.5;for(const n of en){if(exempt(n)||n._rp||!Number.isFinite(n.x)||!Number.isFinite(n.y))continue;if(hidden(R,n,cv)&&moveOut(R,n,cv))MOVED++}}
  // (taken out of `en` for the update and put back after it: moving it far away instead, like 227, gets it dropped by 001's distance filter)
  for(let i=en.length-1;i>=0;i--){const n=en[i];if(exempt(n)||!Number.isFinite(n.x))continue;if(Math.hypot(n.x-P.x,n.y-P.y)>=24)continue;if(!hidden(R,n,cv))continue;
   away.push(n);en.splice(i,1);BLOCKED++}
  try{return _u.apply(this,arguments)}finally{if(away.length&&Array.isArray(en)&&SCENE&&SCENE.room===R)for(const n of away)if(!n.dead&&!en.includes(n))en.push(n)}});
 window.SQUNDER={cover,hidden,moveOut,free,get moved(){return MOVED},get blocked(){return BLOCKED}}})();
