// ---- 104. Tap or click the minimap to open the map ----
{let MINIBOX=null;const R2=()=>W/innerWidth;
 const _dh=drawHUD;drawHUD=function(){MINIBOX=null;_dh()};
 const keep=(x,y,w,h)=>{const r=R2();MINIBOX={x:x/r,y:y/r,w:w/r,h:h/r}};
 const _m52=drawMini52;drawMini52=function(){_m52();const t=miniTarget();if(!t)return;const L=hudLayout(),U=L.U,w=L.dw,hh=w*t.h/t.w;keep(L.dx-3*U,L.top+L.dh+46*U-3*U,w+6*U,hh+6*U)};
 const _u=upd;upd=function(dt){_u(dt);const R=SCENE&&SCENE.room;if(R&&R.dun&&!menuOpen&&!dead){const L=HUDL||hudLayout(),U=L.U,w=L.dw,hh=w*R.h/R.w;keep(L.dx-3*U,L.top+L.dh+46*U-3*U,w+6*U,hh+16*U)}};
 window.SQMINIBOX=()=>MINIBOX;
 const hit=(x,y)=>{const b=MINIBOX;return b&&!pnOpen&&!menuOpen&&!dead&&x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h};
 const open=()=>{fromMenu=false;showScreen('map')};
 cv.addEventListener('touchstart',e=>{const t=e.changedTouches[0];if(t&&hit(t.clientX,t.clientY)){e.preventDefault();e.stopImmediatePropagation();open()}},{capture:true,passive:false});
 cv.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'&&hit(e.clientX,e.clientY)){e.stopImmediatePropagation();e.preventDefault();open()}},{capture:true});
 cv.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const h=hit(e.clientX,e.clientY);if(h!==(cv.style.cursor==='pointer'))cv.style.cursor=h?'pointer':''})}
