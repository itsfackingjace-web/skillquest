// ---- 225. Safe trips home, and /stuck ----
// 049's travelCommit takes the return point for an island trip from where you stand: SCENE.ret when you sail from another
// island, else P. A trip started inside a house, yard, dungeon or boss lair (the guild horn works from anywhere) took the
// room's own coordinates as the Hollow return point, so sailing home dropped you in the sea at the top-left of the map
// (and saves made on the island kept that point, since 049 saves the return point as `p`).
//   - the outermost travelCommit first steps out of any non-island scene (following `prev` up to an island or Hollow,
//     like 067's leaveScene does) so the return point is a real outdoor spot;
//   - the outermost leaveRegion checks where it put you on Hollow: in the sea = the Tidewatch harbor post; inside something or
//     boxed in = the nearest good land (within 30 tiles), else the harbor post.
//   - /stuck (chat; also /unstuck): out of any room to the outdoors, then the nearest good land; on an island its pier spot,
//     on Hollow: just out of the room if that was it, else the harbor post (or the nearest good land when the post is blocked). Not while dead, travelling, duelling or near a boss. 2 minute
//     cooldown (localStorage sq_stuck). `window.SQSTUCK` = {run, good, rescue}.
(()=>{const TP=16;
 const inMap=(x,y)=>x>=0&&y>=0&&x<N*TP&&y<N*TP;
 // a Hollow outdoor spot you can stand on and walk away from
 function good(px,py){if(!inMap(px,py))return false;const tx=Math.floor(px/TP),ty=Math.floor(py/TP);if(tile[ty*N+tx]===0||solid(px,py))return false;
  // not boxed in: at least 25 walkable tiles reachable within 8 tiles
  const seen=new Set([ty*N+tx]),q=[[tx,ty]];let n=0;while(q.length&&n<25){const[a,b]=q.shift();n++;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const x=a+dx,y=b+dy,i=y*N+x;if(seen.has(i)||Math.abs(x-tx)>8||Math.abs(y-ty)>8||x<0||y<0||x>=N||y>=N)continue;seen.add(i);if(tile[i]!==0&&!solid(x*TP+8,y*TP+8))q.push([x,y])}}
  return n>=25}
 function harbor(){try{if(RG_POST)return{x:RG_POST.x*TP+8,y:(RG_POST.y-1)*TP+8}}catch(e){self.SQERR&&SQERR(e,'217-1')}return{x:SPX,y:SPY}}
 function nearestGood(px,py,R){const cx=Math.floor(px/TP),cy=Math.floor(py/TP);for(let r=0;r<=R;r++)for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++){if(Math.max(Math.abs(x-cx),Math.abs(y-cy))!==r)continue;const X=x*TP+8,Y=y*TP+8;if(good(X,Y))return{x:X,y:Y}}return null}
 // after landing on Hollow: make sure it's somewhere you can stand
 function rescue(){if(SCENE)return false;if(good(P.x,P.y))return false;const wet=!inMap(P.x,P.y)||tile[Math.floor(P.y/TP)*N+Math.floor(P.x/TP)]===0;let s=wet?null:nearestGood(P.x,P.y,30);if(!s){const h=harbor();s=good(h.x,h.y)?h:nearestGood(h.x,h.y,12)||h}P.x=s.x;P.y=s.y;try{SAILING=false}catch(e){self.SQERR&&SQERR(e,'217-2')}return true}
 // out of houses, yards, dungeons and lairs to the island or Hollow they're on (returns true if anything changed)
 function stepOut(){let moved=false;for(let k=0;k<8&&SCENE&&!(SCENE.room&&SCENE.room.region);k++){const S=SCENE,r=S.ret;
   if(S.prev){SCENE=S.prev}else SCENE=null;if(r&&isFinite(r.x)&&isFinite(r.y)){P.x=r.x;P.y=r.y}moved=true}
  if(moved){try{en=SCENE?en:[]}catch(e){self.SQERR&&SQERR(e,'217-3')}try{if(BUILD)endBuild()}catch(e){self.SQERR&&SQERR(e,'217-4')}try{FISH=null}catch(e){self.SQERR&&SQERR(e,'217-5')}try{FADE_AT=performance.now()}catch(e){self.SQERR&&SQERR(e,'217-6')}}return moved}
 {const _tc=travelCommit;travelCommit=function(T2){try{if(SCENE&&!(SCENE.room&&SCENE.room.region))stepOut()}catch(e){console.warn('stepOut',e)}const out=_tc.apply(this,arguments);try{if(!SCENE)rescue()}catch(e){self.SQERR&&SQERR(e,'217-7')}return out}}
 {const _lr=leaveRegion;leaveRegion=function(){const ok=_lr.apply(this,arguments);try{if(ok&&!SCENE&&rescue())setTimeout(()=>{try{say('You were set down safely on dry land.')}catch(e){self.SQERR&&SQERR(e,'217-8')}},600)}catch(e){self.SQERR&&SQERR(e,'217-9')}return ok}}
 // ---- /stuck ----
 const CD=120000;
 function bossNear(){try{return en.some(n=>n&&!n.dead&&n.hp>0&&(n.boss||n.big||n.cb||n._wb||n.ib)&&Math.hypot(n.x-P.x,n.y-P.y)<320)}catch(e){return false}}
 function run(){let last=0;try{last=+localStorage.getItem('sq_stuck')||0}catch(e){self.SQERR&&SQERR(e,'217-10')}const left=CD-(Date.now()-last);
  if(dead){say('You can\'t do that right now.');return}if(TRAVEL49){say('Wait until you arrive.');return}
  try{if(window.SQDUEL&&(SQDUEL.fighting||SQDUEL.chess)){say('Not during a duel.');return}}catch(e){self.SQERR&&SQERR(e,'217-11')}
  if(bossNear()){say('Not during a boss fight.');return}
  if(left>0){say('You can use /stuck again in '+Math.ceil(left/1000)+' seconds.');return}
  try{if(pnOpen)closePanel()}catch(e){self.SQERR&&SQERR(e,'217-12')}
  const outd=stepOut();let where='';
  const R=SCENE&&SCENE.room;
  if(R&&R.region){const t=rgSpot(R,null);P.x=t[0]*TP+8;P.y=t[1]*TP+8;face=[0,-1];try{SAILING=false}catch(e){self.SQERR&&SQERR(e,'217-13')}where='the pier of '+((WORLD_REGIONS[R.region]||{}).name||'this island')}
  else if(!SCENE){try{SAILING=false}catch(e){self.SQERR&&SQERR(e,'217-14')}if(outd&&good(P.x,P.y))where='the outdoors';else if(good(P.x,P.y)){const h=harbor();P.x=h.x;P.y=h.y;if(!good(P.x,P.y))rescue();where='the Tidewatch harbor post'}else{rescue();where='solid ground'}}
  else{where='safety'}
  try{localStorage.setItem('sq_stuck',String(Date.now()))}catch(e){self.SQERR&&SQERR(e,'217-15')}
  try{FADE_AT=performance.now()}catch(e){self.SQERR&&SQERR(e,'217-16')}try{sfx('door')}catch(e){self.SQERR&&SQERR(e,'217-17')}say('You find your way back to '+where+'.');try{saveNow()}catch(e){self.SQERR&&SQERR(e,'217-18')}}
 if(typeof window.mpSend==='function'){const _ms=window.mpSend;window.mpSend=function(t){if(/^\/(un)?stuck\s*$/i.test(String(t||'').trim())){run();return}return _ms.apply(this,arguments)}}
 window.SQSTUCK={run,good,rescue,stepOut}})();
