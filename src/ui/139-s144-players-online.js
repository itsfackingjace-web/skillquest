// ---- 144. Players online, at the top of the screen ----
// A small pill right above the day box: a green dot and how many players are online (you included),
// counted from the players the game hears from (seen in the last 20 s). Only while you're playing online.
(()=>{let N0=0,at=0;const count=()=>{const t=performance.now();if(t-at<1000)return N0;at=t;let n=1;try{for(const r of SQMP.players.values())if(t-r.seen<20000)n++}catch(e){}return N0=n};
 const _dh=drawHUD;drawHUD=function(){const out=_dh.apply(this,arguments);try{if(menuOpen||(MSGBOX&&MSGBOX.top)||!(window.SQMP&&SQMP.on&&SQMP.user))return out;const L=hudLayout(),U=L.U,n=count();
   const s=String(n);g.save();g.setTransform(1,0,0,1,0,0);g.font='700 '+11*U+'px '+PF;const tw=g.measureText(s).width,w=tw+20*U,h=16*U;
   const x=Math.round(L.dx+L.dw-w),y=Math.round(L.top-h-4*U);// right above the day box (dx, top, width dw)
   g.fillStyle='rgba(16,24,40,.72)';g.beginPath();g.roundRect(x,y,w,h,h/2);g.fill();
   g.fillStyle='#183818';g.beginPath();g.arc(x+9*U,y+h/2,4.2*U,0,6.283);g.fill();g.fillStyle='#48e060';g.beginPath();g.arc(x+9*U,y+h/2,3*U,0,6.283);g.fill();
   g.fillStyle='#f0f8f0';g.textAlign='left';g.textBaseline='middle';g.fillText(s,x+16*U,y+h/2+.5*U);g.restore()}catch(e){}return out};
 window.SQONLINE=count})();
