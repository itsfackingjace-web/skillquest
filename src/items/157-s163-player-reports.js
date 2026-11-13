// ---- 163. Fixes from player reports (Nov 13) ----
// - Back doors (145) can't be built over: inside a house/castle the tiles in front of a back door (the two rows below
//   it) are kept free for furniture, furniture already standing there is moved to the nearest free spot, and if you
//   ever come through a door onto a blocked spot (a table placed before this fix) you're nudged to the nearest free one.
// - In an island boss's lair the world boss banner (071's #wbb) is hidden (body.sqibf); it covered the boss's bar.
// - Phones stay awake while you play (Screen Wake Lock), so the screen doesn't dim and lock while you fish or cook.
(()=>{const Y=()=>window.SQYARD;
 const inHouse=()=>!!(SCENE&&SCENE.id==='home'&&SCENE.house&&!SCENE.yardOf&&(SCENE.room===ROOMS.home||SCENE.room===ROOMS.castle));
 const doorTile=(R,x,y)=>{if(y>3)return false;const L=Y()?Y().HDOOR(R):[];return L.some(hx=>Math.abs(x*16+8-hx)<=8)};
 {const _cp=canPlaceIn;canPlaceIn=function(x,y){if(inHouse()&&doorTile(SCENE.room,x,y))return false;return _cp.apply(this,arguments)}}
 const blocked=(x,y)=>solid(x-5,y-3)||solid(x+5,y-3)||solid(x-5,y+6)||solid(x+5,y+6);
 function unstick(){if(!blocked(P.x,P.y))return false;const R=SCENE&&SCENE.room;
  for(let r=4;r<=96;r+=4)for(let a=0;a<16;a++){const x=P.x+Math.cos(a/16*6.283)*r,y=P.y+Math.sin(a/16*6.283)*r;if(R&&(x<4||y<4||x>R.w*16-4||y>R.h*16-4))continue;if(!blocked(x,y)){P.x=x;P.y=y;return true}}return false}
 const fixed=new WeakSet();
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{
   if(SCENE&&SCENE.id==='home'&&!dead)unstick();// you should never stand inside something; if a door put you there, step out
   if(inHouse()&&!SCENE.house._foreign&&!SCENE.house.ro&&!fixed.has(SCENE.house)){const h=SCENE.house,R=SCENE.room;fixed.add(h);let moved=0;
    if(h.furn&&typeof h.furn.forEach==='function')for(const [i,f] of [...h.furn]){const x=i%R.w,y=i/R.w|0;if(!doorTile(R,x,y))continue;h.furn.delete(i);
     let to=-1;for(let r=1;r<R.w&&to<0;r++)for(let dy=-r;dy<=r&&to<0;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<2||nx>=R.w||ny>=R.h)continue;if(canPlaceIn(nx,ny)&&!(Math.abs(nx*16+8-P.x)<12&&Math.abs(ny*16+8-P.y)<14)){to=ny*R.w+nx;break}}
     if(to>=0){h.furn.set(to,f);moved++}else h.furn.set(i,f)}
    if(moved){say('Some furniture was in front of your back door, so it was moved aside.');try{saveLocal(true)}catch(e){}}
    unstick()}}catch(e){console.warn('door fix',e)}return out}}
 // ---- in an island boss's lair the world boss banner steps aside (it covered the island boss's health bar) ----
 {const st=document.createElement('style');st.textContent='body.sqibf #wbb{display:none!important}';document.head.appendChild(st);
  const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{const on=!!(SCENE&&SCENE.room&&SCENE.room.ib);if(document.body.classList.contains('sqibf')!==on)document.body.classList.toggle('sqibf',on)}catch(e){}return out}}
 // ---- keep the screen awake while playing ----
 let lock=null,want=false;
 async function wake(){try{if(!('wakeLock' in navigator)||document.hidden||lock)return;lock=await navigator.wakeLock.request('screen');lock.addEventListener('release',()=>{lock=null})}catch(e){lock=null}}
 const playing=()=>{try{return!(typeof TS!=='undefined'&&TS&&TS.open)}catch(e){return true}};
 for(const ev of['pointerdown','keydown','touchend'])addEventListener(ev,()=>{want=true;if(playing())wake()},{capture:true,passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&want&&playing())wake()});
 setInterval(()=>{if(want&&playing()&&!lock&&!document.hidden)wake()},15000);
 window.SQREPORTS={unstick,doorTile,get wakeLock(){return lock}}})();
