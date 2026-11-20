// Nov 19 chat: "Can't hold on mobile". Holding the touch HIT button keeps swinging (like holding Space or R2); letting go stops.
module.exports={name:'holding the touch HIT button keeps swinging',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);
  const el=document.getElementById('a');el.style.visibility='visible';const b=el.getBoundingClientRect();
  const fire=(type)=>{const e=new Event(type,{bubbles:true,cancelable:true});const tt=[{identifier:7,clientX:b.left+b.width/2,clientY:b.top+b.height/2,target:el}];
   Object.defineProperty(e,'changedTouches',{value:tt});Object.defineProperty(e,'touches',{value:type==='touchend'?[]:tt});el.dispatchEvent(e)};
  let n=0;const dummy=SQHIT.wrap('chk37 count',next=>function(){n++;return next.apply(this,arguments)});
  fire('touchstart');await W(1600);const held=n,h1=SQHOLDHIT.held;fire('touchend');await W(100);const at=n;await W(800);
  return{held,h1,after:n-at,h2:SQHOLDHIT.held}});
 t(r.h1,'the hold was not noticed');t(r.held>=3,'only '+r.held+' swings in 1.6 s of holding');t.eq(r.after,0,'swings after letting go');t(!r.h2,'still holding after letting go')}};
