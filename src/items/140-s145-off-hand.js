// ---- 145. The off-hand: a key for it, and the hoe moves into it ----
// The hoe is an off-hand item now (like a bow or a wand): the equipment screen has no HOE slot any more, and holding
// the hoe means no bow or wand. TL.hoe still says "a hoe is in hand" for the farming code (016, 072). A save (or a craft
// or shop buy) that ends up with a hoe AND a bow or wand puts the hoe in the bag. The equipment screen loses its HOE row.
// X (bindable in Options > Controls, 124's KA 'off') uses the off-hand: with a bow or a wand it shoots / casts toward the
// mouse cursor (or straight ahead if the cursor isn't over the game), held = keep firing, through 082's own right-click
// code; with the hoe it tills the ground in front (the game's HIT). Right-click still works too.
// The watering can is an off-hand item too (TL.can = can in hand). Hoe and can swap by themselves while farming: HIT on
// ground that needs tilling with the can in hand (hoe in the bag) puts the hoe in your hand and tills, and the other way
// round for a dry crop (caught from the game's own "you need..." messages, then HIT runs again). Controller: R1 (the
// bow/wand button, 023's shootAim) uses the hoe or can when that's what's in the off-hand.
(()=>{
 EQ.eq_hoe.slot='off';EQ.eq_hoe.kind='hoe';
 IDESC.eq_hoe='An off-hand tool. Face grass and press HIT (or X on a keyboard) to till soil for planting. It takes the off-hand, so put your bow or wand away to farm.';
 EQ.eq_can.slot='off';EQ.eq_can.kind='can';
 IDESC.eq_can='An off-hand tool. Face a planted crop and press HIT (or X on a keyboard) to water it. It shares the off-hand with your hoe: farming swaps between them by itself.';
 IDESC.eq_hoe='An off-hand tool. Face grass and press HIT (or X on a keyboard) to till soil for planting. It takes the off-hand, so put your bow or wand away to farm. Farming swaps it with your watering can by itself.';
 for(const sl of['hoe','can']){const i=SLOTS.findIndex(s=>s[0]===sl);if(i>=0)SLOTS.splice(i,1)}
 const _occ=occ;occ=function(slot){if(slot==='hoe'||slot==='can')return null;const k=_occ.apply(this,arguments);if(slot==='off'&&!k&&!TL.bow&&!WAND){if(TL.hoe)return'eq_hoe';if(TL.can)return'eq_can'}return k};
 const _ss=setSlot;setSlot=function(slot,k){if(slot==='hoe'||slot==='can')slot='off';const out=_ss.call(this,slot,k);if(slot==='off'){const e=k?EQ[k]:null;TL.hoe=e&&e.kind==='hoe'?1:0;TL.can=e&&e.kind==='can'?1:0}return out};
 // a hoe together with a bow or wand: the hoe goes in the bag
 // (the same for the watering can, and a hoe together with a can: the can goes in the bag)
 let told=false;const fix=()=>{const fight=TL.bow||WAND;let moved=0;
  if(TL.hoe&&fight){TL.hoe=0;inv.eq_hoe=(inv.eq_hoe|0)+1;moved=1}
  if(TL.can&&(fight||TL.hoe)){TL.can=0;inv.eq_can=(inv.eq_can|0)+1;moved=1}
  if(!moved)return;try{snapEq()}catch(e){}if(!told){told=true;setTimeout(()=>{try{say('Your hoe and watering can are off-hand items now, so what didn\'t fit went in your bag. Farming swaps them for you.');msgT=7}catch(e){}},1200)}try{saveLocal(true)}catch(e){}};
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{fix()}catch(e){}return out}}
 // farming hints that told you to craft a hoe when it's just in your bag
 // ...and when the other farming tool is in the bag, swap to it and do the job instead
 let swapAt=0,VIA=false,HID=null;const viaOff=f=>{const v=VIA;VIA=true;try{return f()}finally{VIA=v}};const swapTo=k=>{const now=performance.now();if(now-swapAt<400||(inv[k]|0)<1||dead)return false;swapAt=now;
  try{const was=occ('off');equipItem(k);if(occ('off')!==k)return false;say('Swapped to your '+EQ[k].n.toLowerCase()+(was&&EQ[was]?' (your '+EQ[was].n.toLowerCase()+' is in your bag)':'')+'.');setTimeout(()=>{try{if(!dead&&!pnOpen)viaOff(()=>attack())}catch(e){}},0);return true}catch(e){return false}};
 {const _s=say;say=function(s){if(typeof s==='string'){
   if(!TL.hoe&&(inv.eq_hoe|0)>0&&/^You need tilled soil\. Craft a hoe/.test(s)){if(swapTo('eq_hoe'))return;s='Put your hoe in your off-hand to till soil (Bag > hoe > EQUIP).'}
   if(HID&&HID.c&&/^Buy a watering can/.test(s))s='Press X (or right-click) to water it with your watering can.';
   else if(!TL.can&&(inv.eq_can|0)>0&&/^Buy a watering can/.test(s)){if(swapTo('eq_can'))return;s='Put your watering can in your off-hand to water crops (Bag > watering can > EQUIP).'}}
  return _s.apply(this,arguments.length>1?[s,...[].slice.call(arguments,1)]:[s])}}
 // ---- X: use the off-hand ----
 let mx=null,my=null,inCv=false,held=false;
 cv.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;inCv=true});cv.addEventListener('mouseleave',()=>{inCv=false});
 const playing=()=>!dead&&!menuOpen&&!pnOpen&&!(typeof chessOpen!=='undefined'&&chessOpen)&&!(window.SQPVC&&SQPVC.open);
 function down(){if(!playing())return false;
  if((TL.hoe||TL.can)&&!TL.bow&&!WAND){try{viaOff(()=>attack())}catch(e){}return true}
  if(!TL.bow&&!WAND){say('Put a bow, a wand, a hoe or a watering can in your off-hand to use it with X.');try{sfx('swish')}catch(e){}return true}
  let x=mx,y=my;const r=cv.getBoundingClientRect();if(!inCv||x==null){x=r.left+r.width/2+face[0]*80;y=r.top+r.height/2+face[1]*80-6}
  cv.dispatchEvent(new MouseEvent('mousedown',{button:2,buttons:2,clientX:x,clientY:y,bubbles:true,cancelable:true}));held=true;return true}
 function up(){if(!held)return;held=false;window.dispatchEvent(new MouseEvent('mouseup',{button:2,bubbles:true}))}
 addEventListener('keydown',e=>{if(e.key!=='x'&&e.key!=='X')return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.repeat){if(held)e.preventDefault();return}if(down())e.preventDefault()});
 addEventListener('keyup',e=>{if(e.key==='x'||e.key==='X')up()});addEventListener('blur',up);
 // HIT on ground you could till, with the can in hand and the hoe in the bag: swap to the hoe (Hollow 016, islands 072)
 {const _a=attack;attack=function(){try{if(!TL.hoe&&TL.can&&!TL.bow&&!WAND&&(inv.eq_hoe|0)>0&&!dead&&!menuOpen&&!pnOpen&&!BUILD&&swing<=0&&!FISH&&!facingNpc()){
   const[fx,fy]=front(13),tx=Math.floor(fx/16),ty=Math.floor(fy/16);
   if(!en.some(n=>!n.dead&&Math.hypot(n.x-fx,n.y-fy)<18)){let ok=false;
    if(!SCENE)ok=!FARM.get(ty*N+tx)&&canTill(tx,ty);
    else{const R=typeof rbR==='function'?rbR():null;if(R){const k=rbK(tx,ty);ok=!(typeof rgObjAt==='function'&&rgObjAt(R,tx,ty))&&!rfMap(R.region).get(k)&&!rfForeign(R.region).get(k)&&!rbMap(R.region).has(k)&&rfCanTill(R,tx,ty)}}
    if(ok&&swapTo('eq_hoe'))return}}
   // a dry crop in front, with the hoe in hand and the can in the bag: swap to the can (019's dig-up would answer first)
   if(!TL.can&&TL.hoe&&(inv.eq_can|0)>0&&!dead&&!menuOpen&&!pnOpen&&!BUILD&&swing<=0&&!FISH&&!facingNpc()){const[fx,fy]=front(13),tx=Math.floor(fx/16),ty=Math.floor(fy/16);let pl=null;
    if(!SCENE)pl=FARM.get(ty*N+tx);else{const R=typeof rbR==='function'?rbR():null;if(R)pl=rfMap(R.region).get(rbK(tx,ty))}
    if(pl&&pl.c&&!ripe(pl)&&!wet(pl)&&swapTo('eq_can'))return}}catch(e){}return _a.apply(this,arguments)}}
 // controller R1 / anything else that "shoots": with the hoe or can in hand, use it
 {const _sa=shootAim;shootAim=function(first){if(!TL.bow&&!WAND&&(TL.hoe||TL.can)){if(first)try{viaOff(()=>attack())}catch(e){}return}return _sa.apply(this,arguments)}}
 // keyboard and mouse: HIT (Space, left click) is melee only. It doesn't shoot the bow (021 shot at monsters out of sword
 // reach), and the hoe / watering can don't till or water from it; X or right-click uses the off-hand. For that call the
 // off-hand tools are hidden (TL.hoe/TL.can 0, bowTarget null); 122 already keeps wands from casting on HIT. Touch screens
 // and controllers are unchanged.
 {const _a=attack;attack=function(){if(VIA||!isPC||(typeof GPON!=='undefined'&&GPON))return _a.apply(this,arguments);
   const h=TL.hoe,c=TL.can,bt=bowTarget;HID={h,c};TL.hoe=0;TL.can=0;bowTarget=()=>null;
   try{return _a.apply(this,arguments)}finally{TL.hoe=h;TL.can=c;bowTarget=bt;HID=null}}}
 window.SQOFFHAND={use:down,stop:up}})();
