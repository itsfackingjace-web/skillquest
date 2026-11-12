// ---- 143. The world boss on the maps ----
// While a world boss is up (071's WB.b, window.SQWB): the world map marks its island with a pulsing red ring, its icon,
// name and time left (at its lair when that's known: always on Hollow, on an island once you're there); the area map and
// the HUD minimap mark it where it is right now (071's wbPos, which every game works out from the shared clock); and the
// area map says where it is when it's on another island.
(()=>{const B=()=>{try{const b=window.SQWB&&SQWB.b;return b&&Date.now()<b.end+60000?b:null}catch(e){return null}};
 const left=b=>{const now=(window.SQMP&&SQMP.on&&typeof mpNow==='function')?mpNow():Date.now(),s=Math.max(0,Math.round((b.end-now)/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
 const where=b=>b.where==='hollow'?'Hollow Island':(WORLD_REGIONS[b.where]?WORLD_REGIONS[b.where].name:b.where);
 // its lair (world px in its own area) if this game knows it
 function lair(b){try{if(b.where==='hollow'&&!SCENE)return wbLair(b);if(b.where!=='hollow'&&SCENE&&SCENE.room&&SCENE.room.region===b.where)return wbLair(b);
   if(SQWB.lair&&SQWB.lairKey===b.slot+':'+b.where)return SQWB.lair}catch(e){}return null}
 function pos(b){const L=lair(b);if(!L)return null;try{return wbPos(b,L,(window.SQMP&&SQMP.on&&typeof mpNow==='function')?mpNow():Date.now())}catch(e){return L}}
 // the marker: a pulsing ring, a dark dot and the icon (s = size in canvas px)
 function mark(x,cx,cy,s,b,label){const t=performance.now()/1000,pr=s*(1.1+.35*Math.abs(Math.sin(t*3)));x.save();x.lineWidth=Math.max(1.5,s*.18);x.strokeStyle='rgba(240,48,48,.95)';x.beginPath();x.arc(cx,cy,pr,0,6.283);x.stroke();
  x.fillStyle='rgba(40,8,8,.85)';x.beginPath();x.arc(cx,cy,s*.8,0,6.283);x.fill();x.font=Math.round(s*1.15)+'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(b.T.ic,cx,cy+s*.05);
  if(label){x.font='bold '+Math.max(9,Math.round(s*.9))+'px "Pixelify Sans",monospace';x.textBaseline='alphabetic';x.lineWidth=3;x.strokeStyle='rgba(0,0,0,.8)';x.strokeText(label,cx,cy-s*1.6);x.fillStyle='#ffd8d0';x.fillText(label,cx,cy-s*1.6)}x.restore()}
 // world map
 {const _dw=drawWorld52;drawWorld52=function(){const out=_dw.apply(this,arguments);try{const b=B();if(!b)return out;const c=document.getElementById('wmc');if(!c)return out;const x=c.getContext('2d'),r=wmRect(b.where);
   let cx=r.x+r.w/2,cy=r.y+r.h/2;const p=pos(b);if(p){const W=b.where==='hollow'?N:WORLD_REGIONS[b.where].width,H=b.where==='hollow'?N:WORLD_REGIONS[b.where].height;cx=r.x+p.x/16/W*r.w;cy=r.y+p.y/16/H*r.h}
   mark(x,cx,cy,6,b,b.T.n+' '+left(b))}catch(e){}return out}}
 // area map (local view)
 {const _dm=drawMap;drawMap=function(){const out=_dm.apply(this,arguments);try{if(typeof MAPVIEW!=='undefined'&&MAPVIEW==='world')return out;const b=B();if(!b||b.where!==curRegion())return out;const p=pos(b);if(!p)return out;
   const c=document.getElementById('mpc');if(!c)return out;const x=c.getContext('2d');mark(x,p.x/16,p.y/16,Math.max(3,c.width/45),b,null)}catch(e){}return out}}
 {const _mh=mapHTML;mapHTML=function(){let h=_mh.apply(this,arguments);try{const b=B();if(b){const here=b.where===curRegion();
   const line='<div style="margin:4px 0;padding:5px 8px;background:#3a1818;color:#ffd8d0;border:2px solid #a83030;font-size:13px;text-align:center">'+esc(b.T.ic+' WORLD BOSS: '+b.T.n)+' · '+esc(here?'here on this island':'on '+where(b))+' · '+left(b)+' left</div>';
   const i=h.indexOf('<canvas');h=i>=0?h.slice(0,i)+line+h.slice(i):line+h}}catch(e){}return h}}
 // HUD minimap
 if(typeof drawMini52==='function'){const _dmm=drawMini52;drawMini52=function(){const out=_dmm.apply(this,arguments);try{const b=B();if(!b)return out;const t=miniTarget();if(!t)return out;const area=t.k==='region'?t.R.region:'hollow';if(area!==b.where)return out;
   const p=pos(b);if(!p)return out;const H=hudLayout(),U=H.U,w=H.dw,hh=w*t.h/t.w,x0=H.dx,y0=H.top+H.dh+46*U;g.save();g.setTransform(1,0,0,1,0,0);
   mark(g,x0+p.x/16/t.w*w,y0+p.y/16/t.h*hh,4*U,b,null);g.restore()}catch(e){}return out}}
 window.SQWBMAP={pos,lair}})();
