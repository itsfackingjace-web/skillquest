// Nov 21 (Jace): "players on mobile should be able to hold Cast or Bow and keep shooting. Mana regen at my level is way faster than
// i can even deplete it". The touch BOW / CAST button (082) fired once when you let go, and only kept firing while you dragged to
// aim. Now holding it still keeps firing at the nearest enemy; a quick tap still fires once, and letting go stops.
module.exports={name:'holding the touch CAST / BOW button keeps firing',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);
  isPC=false;const el=document.getElementById('aimb');el.style.display='flex';const b=el.getBoundingClientRect();
  const fire=(type,id)=>{const e=new Event(type,{bubbles:true,cancelable:true});const tt=[{identifier:id,clientX:b.left+b.width/2,clientY:b.top+b.height/2,target:el}];
   Object.defineProperty(e,'changedTouches',{value:tt});Object.defineProperty(e,'touches',{value:type==='touchend'?[]:tt});el.dispatchEvent(e)};
  // count shots / casts that really went off (the swing timer starts)
  let n=0;const _sa=shootAim;shootAim=function(){const s0=swing;const out=_sa.apply(this,arguments);if(swing>s0)n++;return out};
  const out={};
  // a wand with plenty of mana
  WAND='fire';MANA=1e6;swing=0;await W(100);
  fire('touchstart',3);await W(80);fire('touchend',3);await W(600);out.tap=n;
  n=0;swing=0;await W(100);fire('touchstart',4);await W(2000);out.held=n;out.h1=!!(window.SQHOLDAIM&&SQHOLDAIM.held);fire('touchend',4);await W(60);const at=n;await W(900);out.after=n-at;out.h2=!!(window.SQHOLDAIM&&SQHOLDAIM.held);
  // a bow with arrows
  WAND=null;TL.bow=Math.max(1,TL.bow|0);inv.arrow=500;n=0;swing=0;await W(100);
  fire('touchstart',5);await W(2000);out.bow=n;fire('touchend',5);await W(300);
  shootAim=_sa;return out});
 t.eq(r.tap,1,'a quick tap fires once');
 t(r.h1,'the hold was not noticed');t(r.held>=3,'only '+r.held+' casts in 2 s of holding CAST');
 t.eq(r.after,0,'casts after letting go');t(!r.h2,'still holding after letting go');
 t(r.bow>=2,'only '+r.bow+' arrows in 2 s of holding BOW')}};
