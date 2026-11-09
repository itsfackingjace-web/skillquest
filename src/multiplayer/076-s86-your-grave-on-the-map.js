// ---------------------------------------------------------------- 86. Your grave on the map
// While one of your graves still has things in it, it shows on the HUD minimap, the map (HERE and WORLD) with how long
// it has left, and an arrow at the side of the screen points to it when it's in the same area as you.
// Graves inside buildings or dungeons show at the door you went in by.
{const grvWhere=gr=>{if(gr.ar&&WORLD_REGIONS[gr.ar]&&isFinite(gr.ax)&&isFinite(gr.ay))return{ar:gr.ar,x:+gr.ax,y:+gr.ay};
   if(gr.loc==='hollow')return{ar:'hollow',x:gr.x,y:gr.y};if(gr.loc&&gr.loc.startsWith('r:')&&WORLD_REGIONS[gr.loc.slice(2)])return{ar:gr.loc.slice(2),x:gr.x,y:gr.y};return null};
 const mine=()=>{try{return grvMine().map(g=>({g,w:grvWhere(g)})).filter(o=>o.w)}catch(e){return[]}};
 const areaSize=a=>a==='hollow'?[N,N]:[WORLD_REGIONS[a].width,WORLD_REGIONS[a].height];
 // a little tombstone, s screen pixels per texel, centred on (cx,cy)
 const tomb=(x,cx,cy,s,hi)=>{const X=Math.round(cx-3.5*s),Y=Math.round(cy-4*s),F=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(X+a*s,Y+b*s,w*s,h*s)};
  F(2,0,3,1,'#181018');F(1,1,5,1,'#181018');F(0,2,7,6,'#181018');F(2,1,3,1,hi?'#ffffff':'#d8d8e8');F(1,2,5,5,hi?'#ffffff':'#b8b8cc');F(3,2,1,4,'#585870');F(2,3,3,1,'#585870')};
 const blink=()=>(performance.now()/400|0)%2;
 window.SQGRVMAP={grvWhere,mine};
 // HUD minimap
 {const _dm=drawMini52;drawMini52=function(){_dm();const t=miniTarget();if(!t)return;const area=t.k==='region'?t.R.region:'hollow',M=mine().filter(o=>o.w.ar===area);if(!M.length)return;
   const L=hudLayout(),U=L.U,w=L.dw,hh=w*t.h/t.w,x0=L.dx,y0=L.top+L.dh+46*U;g.save();g.setTransform(1,0,0,1,0,0);
   for(const o of M)tomb(g,x0+(o.w.x/16)/t.w*w,y0+(o.w.y/16)/t.h*hh,Math.max(1,Math.round(U*.9)),blink());g.restore()}}
 // the map: HERE (1 pixel per tile) and WORLD
 {const _dm=drawMap;drawMap=function(){_dm();if(MAPVIEW==='world')return;const c=document.getElementById('mpc');if(!c)return;const R=SCENE&&SCENE.room,area=R&&R.region?R.region:'hollow',[aw]=areaSize(area);if(c.width!==aw)return;
   const x=c.getContext('2d'),s=Math.max(1,Math.round(aw/90));for(const o of mine())if(o.w.ar===area)tomb(x,o.w.x/16,o.w.y/16,s,blink())}}
 {const _dw=drawWorld52;drawWorld52=function(){_dw();const c=document.getElementById('wmc');if(!c)return;const x=c.getContext('2d');
   for(const o of mine()){const r=wmRect(o.w.ar),[aw,ah]=areaSize(o.w.ar);tomb(x,r.x+(o.w.x/16)/aw*r.w,r.y+(o.w.y/16)/ah*r.h,1,blink())}}}
 {const _mh=mapHTML;mapHTML=function(){let h=_mh();const M=mine();if(!M.length)return h;
   h=h.replace(/(<div class="lg">)/,'$1<span><i style="background:#c8c8dc;outline:1px solid #181018"></i>Your grave</span>');
   const rows=M.map(o=>{const left=Math.max(1,Math.ceil(grvLeft(o.g)/60000)),nm=o.w.ar==='hollow'?'Hollow Island':WORLD_REGIONS[o.w.ar].name,inside=o.g.loc&&(o.g.loc.startsWith('in:')||o.g.loc.startsWith('h:'));
    return '<br>'+esc(nm)+(inside?' (inside, by the door)':'')+' · crumbles in '+left+' min'}).join('');
   return h+'<div class="qc" style="margin-top:8px"><b>Your grave'+(M.length>1?'s':'')+'</b><small>'+rows+'</small></div>'}}
 // an arrow at the side of the screen pointing to your grave (same area, not on screen)
 {const _dh=drawHUD;drawHUD=function(){_dh();if(dead||menuOpen||pnOpen||window.SQTS&&SQTS.open)return;const R=SCENE&&SCENE.room;if(SCENE&&!(R&&R.region))return;const area=curRegion();
   for(const o of mine()){if(o.w.ar!==area)continue;const dx=o.w.x-P.x,dy=o.w.y-P.y;if(Math.abs(dx)*Z<W/2-20&&Math.abs(dy)*Z<H/2-20)continue;
    const a=Math.atan2(dy,dx),rx=Math.min(W,H)*.38,cx=W/2+Math.cos(a)*rx,cy=H/2+Math.sin(a)*rx*.85,u=Math.max(2,Math.round(Math.min(W,H)/200)),d=Math.hypot(dx,dy)/16;
    g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=.92;g.translate(Math.round(cx),Math.round(cy));
    g.save();g.rotate(a);g.fillStyle='#181018';g.beginPath();g.moveTo(14*u,0);g.lineTo(7*u,-5*u);g.lineTo(7*u,5*u);g.fill();g.fillStyle='#f8f8f8';g.beginPath();g.moveTo(12.5*u,0);g.lineTo(8*u,-3.5*u);g.lineTo(8*u,3.5*u);g.fill();g.restore();
    tomb(g,0,0,u,blink());g.font='700 '+(5*u)+'px '+PF;g.textAlign='center';g.textBaseline='top';g.lineWidth=u;g.strokeStyle='#181018';const txt=Math.round(d)+'m';g.strokeText(txt,0,5*u);g.fillStyle='#ffffff';g.fillText(txt,0,5*u);
    g.restore()}}}}
window.SQGRV2=GRV;
window.SQPADUSE=()=>{try{return rsCanLand()||rsCanBoard()||!!grvNear()}catch(e){return false}};   // ✕ on a controller: LAND / SAIL on every island, open a grave
