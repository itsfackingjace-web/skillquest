// ---- 132. Smooth camera ----
// The camera follows you to the nearest screen pixel (camX/camY in 001), so the world glides instead of stepping a whole
// world pixel (8 screen pixels on a phone) at a time. You (and everything drawn with you in pP: gear, pets, your boat)
// are drawn at the same screen-pixel position, so you stay perfectly still in the middle of the screen while you walk.
(()=>{const _pp=pP;pP=function(tm){const dx=Math.round(P.x*Z)/Z-Math.round(P.x),dy=Math.round(P.y*Z)/Z-Math.round(P.y);
  if(!dx&&!dy)return _pp.apply(this,arguments);g.save();g.translate(dx,dy);try{return _pp.apply(this,arguments)}finally{g.restore()}}})();
