// ---- 162. Loading never throws you back to spawn for a blocked spot ----
// 006's applySave puts you at the spawn point when the saved position is blocked. That happens when you saved standing
// where a rock or tree had been (mined/chopped), and it has grown back by the time you load, or the shared world hasn't
// told this device yet that it's gone: on Gull Rock, a tiny islet, that sent players all the way back to spawn.
// Now, on Hollow outdoors (not sailing), you're put on the nearest free spot to where you saved instead.
(()=>{const blocked=(x,y)=>solid(x-5,y-3)||solid(x+5,y-3)||solid(x-5,y+6)||solid(x+5,y+6);
 function nearest(x,y){const tx=Math.floor(x/16),ty=Math.floor(y/16);
  for(let r=0;r<=30;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
   const cx=tx+dx,cy=ty+dy;if(cx<1||cy<1||cx>=N-1||cy>=N-1)continue;const px=cx*16+8,py=cy*16+8;if(tile[cy*N+cx]===0)continue;if(!blocked(px,py))return[px,py]}
  return null}
 const _ap=applySave;applySave=function(S){const p=S&&S.p&&typeof S.p==='object'?{x:+S.p.x,y:+S.p.y}:null;const out=_ap.apply(this,arguments);
  try{const inH=!S.region||!S.region.id||S.region.id==='hollow';
   if(p&&inH&&isFinite(p.x)&&isFinite(p.y)&&p.x>=0&&p.y>=0&&p.x<N*16&&p.y<N*16&&!SCENE&&!SAILING&&!dead&&P.x===SPX&&P.y===SPY&&Math.hypot(p.x-SPX,p.y-SPY)>24){
    if(!blocked(p.x,p.y)){P.x=p.x;P.y=p.y}else{const q=nearest(p.x,p.y);if(q){P.x=q[0];P.y=q[1]}}}}catch(e){console.warn('keep spot',e)}
  return out};
 window.SQKEEPSPOT={nearest}})();
