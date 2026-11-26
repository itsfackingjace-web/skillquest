// ---- 253. Town names: on the minimap and a sign when you walk in (window.SQTOWNNAME) ----
// #ideas (approved Nov 20): players got lost and the centre-screen pop-ups were in the way. Now the town you're in is written in small
// yellow letters across the top of the minimap, and walking into a town shows its name on a wooden sign that slides down at the top
// of the screen for a few seconds (like a Gen 3 location sign), instead of a message in the middle.
// here(): the town around you: Hollow Village, Saltmere, Frosthollow, Dusthaven and Tidewatch on Hollow (their own box tests), Thornbrook
// (095's SQBW.town) and Emberwatch (096's SQAF.town) on their islands, Dustwater (No Man's Land's landmark), or null.
(()=>{const T=n=>{try{return typeof n==='function'?n:null}catch(e){return null}};
 const box=(o,tx,ty)=>o&&tx>=o.x0-1&&ty>=o.y0-1&&tx<o.x0+o.w+1&&ty<o.y0+o.h+1;
 function here(){try{if(dead)return null;let S=SCENE,px=P.x,py=P.y;
   // Nov 26: inside a building you're still in the town its door is in (going in and out of Dustwater's buildings, or a shop, showed the
   // town's sign again every time you came out)
   if(S&&!(S.room&&S.room.region)&&S.ret&&isFinite(S.ret.x)){px=S.ret.x;py=S.ret.y;S=S.prev||null}
   const tx=Math.floor(px/16),ty=Math.floor(py/16);
   if(!S){if(typeof SAILING!=='undefined'&&SAILING)return null;
    if(typeof VX!=='undefined'&&tx>VX-11&&tx<VX+12&&ty>VY-8&&ty<VY+9)return'Hollow Village';
    if(typeof inTownBox==='function'&&inTownBox(tx,ty))return'Saltmere';
    if(typeof FHON!=='undefined'&&FHON&&typeof inFHBox==='function'&&inFHBox(tx,ty))return'Frosthollow';
    if(typeof DHON!=='undefined'&&DHON&&typeof inDHBox==='function'&&inDHBox(tx,ty))return'Dusthaven';
    if(typeof TWON!=='undefined'&&TWON&&typeof inTWBox==='function'&&inTWBox(tx,ty))return'Tidewatch';
    return null}
   const R=S.room;if(!R||!R.region)return null;
   if(R.region==='briarwood'&&window.SQBW&&box(SQBW.town,tx,ty))return'Thornbrook';
   if(R.region==='ashfall'&&window.SQAF&&box(SQAF.town,tx,ty))return'Emberwatch';
   if(R.region==='nomans'&&R.lms){const l=R.lms.find(q=>q.id==='dustwater');if(l&&Math.hypot(tx-l.x,ty-l.y)<11)return'Dustwater'}
  }catch(e){self.SQERR&&SQERR(e,'245-1')}return null}
 // ---- the minimap label ----
 let NOW=null,tk=0,SIGN=null;// SIGN: {n, at}
 {SQUPD.after('245 town names',dt=>{if((tk-=dt)>0)return;tk=.3;const n=here();if(n!==NOW){if(n&&!menuOpen)SIGN={n,at:performance.now()};NOW=n}})}
 const lbl=(s,x,y,U)=>{g.font='700 '+Math.round(8*U)+'px '+PF;g.textAlign='center';g.textBaseline='top';g.lineWidth=3*U;g.lineJoin='round';g.strokeStyle='#181018';g.strokeText(s,x,y);g.fillStyle='#f8d848';g.fillText(s,x,y)};
 if(typeof drawMini52==='function'){const _dm=drawMini52;drawMini52=function(){const out=_dm.apply(this,arguments);
   try{if(NOW&&!menuOpen){const t=typeof miniTarget==='function'&&miniTarget();if(t){const L=hudLayout(),U=L.U,w=(L.mw||L.dw),hh=Math.round(w*t.h/t.w),bx=L.dx+L.dw-w,by=L.top+L.dh+46*U;
     g.save();g.setTransform(1,0,0,1,0,0);lbl(NOW,bx+w/2,by+3*U,U);g.restore()}}}catch(e){self.SQERR&&SQERR(e,'245-2')}return out}}
 // ---- the sign when you walk in ----
 {SQHUD.after('245 town sign',()=>{if(!SIGN||menuOpen||(typeof pnOpen!=='undefined'&&pnOpen))return;const age=(performance.now()-SIGN.at)/1000;if(age>3.2){SIGN=null;return}
   const L=typeof HUDL!=='undefined'&&HUDL;const U=L&&L.U||1,drop=age<.3?age/.3:age>2.8?Math.max(0,(3.2-age)/.4):1;g.save();g.setTransform(1,0,0,1,0,0);
   g.font='700 '+Math.round(12*U)+'px '+PF;const tw=g.measureText(SIGN.n).width,w=tw+28*U,h=24*U,x=Math.round(W/2-w/2),y0=Math.round(96*U),y=Math.round(y0-(h+8*U)*(1-drop));g.globalAlpha=drop;
   g.fillStyle='#181018';g.fillRect(x-2*U,y-2*U,w+4*U,h+4*U);g.fillStyle='#b8925a';g.fillRect(x,y,w,h);g.fillStyle='#e8c890';g.fillRect(x,y,w,2*U);g.fillStyle='#8a6a3a';g.fillRect(x,y+h-3*U,w,3*U);
   for(const px of[x+5*U,x+w-7*U]){g.fillStyle='#5a3a1e';g.fillRect(px,y+h/2-1*U,2*U,2*U)}
   g.textAlign='center';g.textBaseline='middle';g.fillStyle='#3a2414';g.fillText(SIGN.n,W/2,y+h/2+1*U);g.restore()})}
 window.SQTOWNNAME={here,get now(){return NOW}}})();
