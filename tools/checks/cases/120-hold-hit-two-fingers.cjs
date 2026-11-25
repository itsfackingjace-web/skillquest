// Nov 25 (errs 'uncaught', 6 times on 2026.11.24-11: "Cannot read properties of null (reading 'id')"): 248's touchmove cleared the held
// HIT when its finger slid off the button, then went on to the next moving finger (the joystick thumb) and read HOLD.id of null.
module.exports={name:'holding HIT: sliding off it while another finger moves stops the hold without an error',context:{viewport:{width:852,height:393},isMobile:true,hasTouch:true},async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);try{if(pnOpen)closePanel()}catch(e){}const a=document.getElementById('a');if(!a)return{err:'no HIT button'};
  const b=a.getBoundingClientRect(),T=(id,x,y)=>new Touch({identifier:id,target:a,clientX:x,clientY:y}),ev=(type,ch)=>a.dispatchEvent(new TouchEvent(type,{bubbles:true,cancelable:true,changedTouches:ch,touches:ch}));
  const errs=[];const on=e=>errs.push(String(e.message||e));addEventListener('error',on);
  ev('touchstart',[T(7,b.left+b.width/2,b.top+b.height/2)]);const held=SQHOLDHIT.held;
  // the HIT finger slides far off the button while the joystick finger moves too, in one event
  ev('touchmove',[T(7,5,5),T(3,60,300)]);await W(50);removeEventListener('error',on);
  return{held,after:SQHOLDHIT.held,errs}});
 if(r.err)return t(false,r.err);
 t(r.held,'touching HIT starts a hold');t(!r.after,'sliding off the button ends it');t.eq(r.errs,[],'no error with two fingers moving')}};
