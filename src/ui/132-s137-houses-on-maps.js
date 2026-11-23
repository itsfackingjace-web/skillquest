// ---- 137. Houses on the maps: your houses and castles (gold, a brighter roof for the one you live in) and other players'
// houses on Hollow (blue-grey) show on the map screen and on the HUD minimap; your island houses show on that island's map ----
(()=>{const mineH=()=>{try{return HOUSES.filter(h=>!h._foreign)}catch(e){return[]}},theirs=()=>{try{return HOUSES.filter(h=>h._foreign)}catch(e){return[]}};
 const isle=id=>{try{return(window.SQRH||[]).filter(h=>h.rg===id)}catch(e){return[]}};
 const home=h=>{try{return typeof HOMESP!=='undefined'&&HOMESP===h.id}catch(e){return false}};
 // a little house: roof and walls, s = size of one "pixel"
 // (drawn with the canvas's own fillRect: on Hollow, 113 doubles every 3-7 pixel square drawn on the map, which blew the outline up
 // to 12 pixels around a 4-pixel house)
 const FR=(x,a,b,w,h)=>CanvasRenderingContext2D.prototype.fillRect.call(x,a,b,w,h);
 function glyph(x,cx,cy,s,roof,wall){if(s===1){cx=Math.round(cx);cy=Math.round(cy)}x.fillStyle='#201810';FR(x,cx-3*s,cy-3*s,6*s,6*s);x.fillStyle=roof;FR(x,cx-2*s,cy-2*s,4*s,2*s);x.fillStyle=wall;FR(x,cx-2*s,cy,4*s,2*s);x.fillStyle='#201810';FR(x,s===1?cx-1:cx-s/2,cy+s,s,s)}
 // Nov 22 (Jace: "house icons are too big"): on the map screen a house was 2 map pixels per glyph pixel on every island (12 tiles
 // across, about 20 screen pixels on Hollow, so a town full of homes was a wall of icons). One map pixel each now: 6 tiles across.
 const mapS=aw=>Math.max(1,Math.round(aw/400));
 const draw=(x,list,aw,s,toX,toY)=>{for(const[h,own]of list){const hm=own&&home(h);glyph(x,toX(h.x+.5),toY(h.y),s,own?(hm?'#f8e050':'#d8a030'):'#7890b0',own?'#f8f0d8':'#c8d0e0')}};
 SQDRAWMAP.wrap('132',_dm=>function(){const out=_dm.apply(this,arguments);try{if(typeof MAPVIEW!=='undefined'&&MAPVIEW==='world')return out;const c=document.getElementById('mpc');if(!c)return out;
   const R=SCENE&&SCENE.room,area=R&&R.region?R.region:(SCENE?null:'hollow');if(!area)return out;const x=c.getContext('2d'),aw=c.width,s=mapS(aw);
   const L=area==='hollow'?theirs().map(h=>[h,false]).concat(mineH().map(h=>[h,true])):isle(area).map(h=>[h,true]);draw(x,L,aw,s,v=>v,v=>v)}catch(e){self.SQERR&&SQERR(e,'132-1')}return out});
 {SQMAPHTML.wrap('132',_mh=>function(){const h=_mh.apply(this,arguments);return h.replace('<div class="lg">','<div class="lg"><span><i style="background:#d8a030"></i>Your house</span>'+(theirs().length?'<span><i style="background:#7890b0"></i>Other players\' houses</span>':''))})}
 // the HUD minimap
 if(typeof drawMini52==='function'){const _dmm=drawMini52;drawMini52=function(){const out=_dmm.apply(this,arguments);try{const t=miniTarget();if(!t)return out;
   const L=hudLayout(),U=L.U,w=(L.mw||L.dw),hh=w*t.h/t.w,x0=L.dx+L.dw-w,y0=L.top+L.dh+46*U,s=Math.max(1,U*.7);g.save();g.setTransform(1,0,0,1,0,0);
   const list=t.k==='region'?isle(t.R.region).map(h=>[h,true]):mineH().map(h=>[h,true]);draw(g,list,t.w,s,v=>x0+v/t.w*w,v=>y0+v/t.h*hh);g.restore()}catch(e){self.SQERR&&SQERR(e,'132-2')}return out}}
 window.SQHOUSEMAP={glyph,mapS}})();
