// ---- 189. A tidier screen on phones ----
// The minimap is drawn by many sections (052, 049, 035, 061, 076, 132, 105) at hudLayout()'s dx/dw; they now use L.mw (the
// minimap's width, right-aligned to the day box) when set. On touch screens held sideways the minimap would run under the
// action buttons (HIT/TALK, FIRE): mw shrinks it to end above the highest button below its top (at least 56 units wide).
(()=>{let C=null,CT=0;
 function limit(){const t=performance.now();if(C&&t-CT<300)return C;CT=t;C=null;try{if(typeof isPC!=='undefined'&&isPC||innerWidth<=innerHeight)return C;const r=cv.getBoundingClientRect(),k=W/r.width;
   const B=[];for(const id of['a','tk','f','e','rl','aimb']){const e=document.getElementById(id);if(!e||!e.offsetWidth)continue;const b=e.getBoundingClientRect();if(b.width<4)continue;B.push({l:(b.left-r.left)*k,r:(b.right-r.left)*k,t:(b.top-r.top)*k})}
   C={B}}catch(e){}return C}
 {const _h=hudLayout;hudLayout=function(){const L=_h.apply(this,arguments);try{const c=limit();if(c){const U=L.U,y0=L.top+L.dh+46*U;let low=1e9;
    for(const b of c.B)if(b.r>L.dx&&b.l<L.dx+L.dw&&b.t>y0+20*U&&b.t<low)low=b.t;const room=low-y0-10*U;if(room<L.dw)L.mw=Math.max(56*U,room)}}catch(e){}return L}}
})();
