// Nov 20: cursor choices in Options, and the controller's right stick moves a cursor in screens (✕ clicks under it).
module.exports={name:'cursor choices and the controller cursor',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);
  showScreen('options');await W(200);const b=document.querySelector('[data-cur="sword"]');b&&b.click();await W(100);
  const css=[...document.querySelectorAll('style')].some(s=>/cursor:url\(data:image\/png/.test(s.textContent));const saved=localStorage.getItem('sq_cur');
  const ib=document.querySelector('[data-cur="inv"]');ib&&ib.click();await W(100);const none=[...document.querySelectorAll('style')].some(s=>/cursor:none!important/.test(s.textContent));
  // the off-hand item: a fire wand, then a bow
  inv.eq_wfire=1;setSlot('off','eq_wfire');document.querySelector('[data-cur="off"]').click();await W(400);
  const offA=SQCURSOR.OFF.k,srcA=(SQCURSOR.current()||{}).src;inv.eq_bow3=1;setSlot('off','eq_bow3');await W(900);const offB=SQCURSOR.OFF.k,srcB=(SQCURSOR.current()||{}).src;
  const offCss=[...document.querySelectorAll('style')].some(s=>s.textContent.includes(srcB||'none'));
  document.querySelector('[data-cur="sword"]').click();await W(50);
  closePanel();
  // a controller
  const pad=window.__pad={id:'Xbox Wireless Controller (STANDARD GAMEPAD)',index:0,connected:true,mapping:'standard',timestamp:1,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0}))};
  const real=()=>[pad,null,null,null];
  // (the game wraps navigator.getGamepads at start-up; swap the pad source underneath)
  window.__SQPADTEST=real;window.dispatchEvent(Object.assign(new Event('gamepadconnected'),{gamepad:pad}));await W(200);
  inv.berry=3;inv.wood=4;showScreen('bag');await W(300);
  const sl=[...document.querySelectorAll('#pbd .slot')].find(x=>x.dataset.k==='berry'),rr=sl.getBoundingClientRect(),tx=rr.left+rr.width/2,ty=rr.top+rr.height/2;
  const V=SQCURSOR.VC;const st0=pn.scrollTop;
  for(let i=0;i<200&&Math.hypot(V.x-tx,V.y-ty)>6;i++){const dx=tx-V.x,dy=ty-V.y,m=Math.hypot(dx,dy);pad.axes[2]=dx/m*(m>60?1:.55);pad.axes[3]=dy/m*(m>60?1:.55);pad.timestamp++;await W(16)}
  pad.axes[2]=pad.axes[3]=0;await W(80);const on=V.on,shown=document.getElementById('sqvcur').style.display;
  pad.buttons[0]={pressed:true,touched:true,value:1};await W(80);pad.buttons[0]={pressed:false,touched:false,value:0};await W(200);
  const sel=[...document.querySelectorAll('#pbd .slot.on')].map(x=>x.dataset.k);
  pad.buttons[13]={pressed:true,touched:true,value:1};await W(80);pad.buttons[13]={pressed:false,touched:false,value:0};await W(80);
  closePanel();await W(100);AIM.v=[0,1];pad.axes[2]=1;pad.axes[3]=0;await W(150);const aim=AIM.v&&AIM.v[0];pad.axes[2]=0;
  return{offA,offB,changed:!!srcA&&!!srcB&&srcA!==srcB,offCss,none,aim,css,saved,on,shown,sel,clicks:V.clicks,scrolled:pn.scrollTop!==st0,off:!V.on,ring:SQGPRING.style.visibility}});
 t(r.css,'picking the sword didn\'t set a cursor');t(r.none,'the inverted crosshair didn\'t hide the real pointer');t.eq(r.saved,'sword','the saved cursor');
 t(r.on&&r.shown==='block','the controller cursor didn\'t show ('+JSON.stringify(r)+')');t.eq(r.sel,['berry'],'the item clicked with ✕ under the controller cursor');
 t(r.off,'the D-pad didn\'t hide the controller cursor');t(!r.scrolled,'the right stick scrolled the bag');t(r.aim>.9,'out in the world the right stick no longer aims')}};
