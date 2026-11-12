// ---- 145. The off-hand: a key for it, and the hoe moves into it ----
// The hoe is an off-hand item now (like a bow or a wand): the equipment screen has no HOE slot any more, and holding
// the hoe means no bow or wand. TL.hoe still says "a hoe is in hand" for the farming code (016, 072). A save (or a craft
// or shop buy) that ends up with a hoe AND a bow or wand puts the hoe in the bag. The equipment screen loses its HOE row.
// X (bindable in Options > Controls, 124's KA 'off') uses the off-hand: with a bow or a wand it shoots / casts toward the
// mouse cursor (or straight ahead if the cursor isn't over the game), held = keep firing, through 082's own right-click
// code; with the hoe it tills the ground in front (the game's HIT). Right-click still works too.
(()=>{
 EQ.eq_hoe.slot='off';EQ.eq_hoe.kind='hoe';
 IDESC.eq_hoe='An off-hand tool. Face grass and press HIT (or X on a keyboard) to till soil for planting. It takes the off-hand, so put your bow or wand away to farm.';
 {const i=SLOTS.findIndex(s=>s[0]==='hoe');if(i>=0)SLOTS.splice(i,1)}
 const _occ=occ;occ=function(slot){if(slot==='hoe')return null;const k=_occ.apply(this,arguments);if(slot==='off'&&!k&&TL.hoe&&!TL.bow&&!WAND)return'eq_hoe';return k};
 const _ss=setSlot;setSlot=function(slot,k){if(slot==='hoe')slot='off';const out=_ss.call(this,slot,k);if(slot==='off'){const e=k?EQ[k]:null;TL.hoe=e&&e.kind==='hoe'?1:0}return out};
 // a hoe together with a bow or wand: the hoe goes in the bag
 let told=false;const fix=()=>{if(TL.hoe&&(TL.bow||WAND)){TL.hoe=0;inv.eq_hoe=(inv.eq_hoe|0)+1;try{snapEq()}catch(e){}if(!told){told=true;setTimeout(()=>{try{say('Your hoe is an off-hand item now, so it went in your bag. Equip it in place of your bow or wand to farm.');msgT=7}catch(e){}},1200)}try{saveLocal(true)}catch(e){}}};
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{fix()}catch(e){}return out}}
 // farming hints that told you to craft a hoe when it's just in your bag
 {const _s=say;say=function(s){if(typeof s==='string'&&!TL.hoe&&(inv.eq_hoe|0)>0&&/^You need tilled soil\. Craft a hoe/.test(s))s='Put your hoe in your off-hand to till soil (Bag > hoe > EQUIP).';return _s.call(this,s)}}
 // ---- X: use the off-hand ----
 let mx=null,my=null,inCv=false,held=false;
 cv.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;inCv=true});cv.addEventListener('mouseleave',()=>{inCv=false});
 const playing=()=>!dead&&!menuOpen&&!pnOpen&&!(typeof chessOpen!=='undefined'&&chessOpen)&&!(window.SQPVC&&SQPVC.open);
 function down(){if(!playing())return false;
  if(TL.hoe&&!TL.bow&&!WAND){try{attack()}catch(e){}return true}
  if(!TL.bow&&!WAND){say('Put a bow, a wand or a hoe in your off-hand to use it with X.');try{sfx('swish')}catch(e){}return true}
  let x=mx,y=my;const r=cv.getBoundingClientRect();if(!inCv||x==null){x=r.left+r.width/2+face[0]*80;y=r.top+r.height/2+face[1]*80-6}
  cv.dispatchEvent(new MouseEvent('mousedown',{button:2,buttons:2,clientX:x,clientY:y,bubbles:true,cancelable:true}));held=true;return true}
 function up(){if(!held)return;held=false;window.dispatchEvent(new MouseEvent('mouseup',{button:2,bubbles:true}))}
 addEventListener('keydown',e=>{if(e.key!=='x'&&e.key!=='X')return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.repeat){if(held)e.preventDefault();return}if(down())e.preventDefault()});
 addEventListener('keyup',e=>{if(e.key==='x'||e.key==='X')up()});addEventListener('blur',up);
 window.SQOFFHAND={use:down,stop:up}})();
