// ---- 154. Home comforts: campfires in yards, no hunger indoors at home, picking up a wardrobe ----
// - Campfires in backyards and courtyards (150): 012 (indoors) and 049 (too windy off Hollow) let yards through, so FIRE
//   runs the game's own campfire (perks, timed lighting, cooking at it). Each yard keeps its own fires (083's per-place
//   fire stash, keyed 'yard:<house>' by wrapping fireKey64), and they're drawn as room items so they sort with you.
// - Inside a house or castle (your own or a friend's; not the yard) hunger doesn't go down. Eating still fills it; sleeping
//   still costs the night's food (12/13's bed).
// - The wardrobe opens the character screen, which had no "pick it up" button like the other stations: it has one now.
(()=>{const yard=()=>!!(SCENE&&SCENE.room&&(SCENE.room.yard||SCENE.room.court)&&SCENE.yardOf);
 const indoors=()=>!!(SCENE&&SCENE.id==='home'&&SCENE.house&&!SCENE.yardOf);
 // ---- yard campfires ----
 {const _fk=window.fireKey64;window.fireKey64=function(){if(yard())return'yard:'+(SCENE.house.id||'?');return _fk?_fk():curRegion()}}
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{const R=SCENE&&SCENE.room;if(R&&(R.yard||R.court)){
    // the room's fire items follow the current fires (only in your yard scene; another yard has its own list)
    const want=yard()?fires.filter(f=>f.life>0&&!f._glow):[];/* 191: other players' fires (_rp, 061's shared fires) too */const have=R.items.filter(it=>it.t==='_fire');
    if(have.length!==want.length||have.some((it,k)=>it.f!==want[k])){R.items=R.items.filter(it=>it.t!=='_fire');for(const f of want)R.items.push({t:'_fire',f,x:f.x/16,y:(f.y+3)/16-1})}}}catch(e){}return out}}
 // ---- no hunger drain at home ----
 {const _u=upd;upd=function(dt){if(!indoors()||dead||menuOpen||pnOpen||typeof hunger!=='number')return _u.apply(this,arguments);
   // a little extra first, so the drain (walking or sprinting) never reaches the "starving" check, then take it back
   const h0=hunger,pc=3*dt*.9*(typeof FOOD_RATE==='number'?FOOD_RATE:1);hunger+=pc;const out=_u.apply(this,arguments);
   if(indoors()&&typeof hunger==='number')hunger=Math.max(h0,hunger-pc);else if(typeof hunger==='number')hunger=Math.max(0,hunger-pc);return out}}
 // ---- picking up a wardrobe ----
 let WR=null;const go=document.getElementById('cgo');
 const pb=document.createElement('button');pb.id='cwpk';pb.textContent='PICK UP WARDROBE';pb.style.cssText='display:none;margin:14px auto 0;padding:10px 18px;font:700 15px '+(typeof PF!=='undefined'?PF:'monospace')+';letter-spacing:.04em;background:#f8f8f8;color:#404040;border:3px solid #485870;box-shadow:inset 0 0 0 2px #a8c0e0;cursor:pointer';if(go)go.insertAdjacentElement('afterend',pb)
 {const _os=openStation;openStation=function(o){const r=_os.apply(this,arguments);if(o&&o.t==='wardrobe'){WR=o;pb.style.display='block'}return r}}
 if(go){const _c=go.onclick;go.onclick=function(){WR=null;pb.style.display='none';return _c&&_c.apply(this,arguments)}}
 pb.onclick=()=>{const o=WR;if(!o)return;WR=null;pb.style.display='none';try{go.onclick()}catch(e){}
  setTimeout(()=>{try{if(o.inside)pickFurn(o.i);else pickStruct(o.i);saveLocal(true)}catch(e){console.warn(e)}},0)};
 window.SQHOME={indoors,yard}})();
