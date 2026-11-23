// Nov 22 (Jace: Derek, on an iPhone, taps SLAM and nothing happens; a copy of his save slams fine here). The touch ULT button is
// handled before 030's listeners: one tap (pointerdown and touchstart both arriving) casts once; a tap inside the button's box that
// lands on an invisible layer still casts and reports what was on top; a tap that does nothing says so and sends one report.
module.exports={name:'the SLAM button: one cast per tap, works under an invisible layer, reports a tap that does nothing; the HUD box names V and can be clicked',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);for(let i=0;i<40&&!(window.SQMP&&SQMP.user);i++)await W(150);
  try{if(pnOpen)closePanel()}catch(e){}isPC=false;GPON=false;inv.eq_sledge=1;setSlot('main','eq_sledge');WAND='storm';SQULT.pick='slam';await W(400);
  const ub=document.getElementById('ub'),out={shown:[getComputedStyle(ub).display,ub.innerText.trim()]};
  let n=0;const _c=castUlt;castUlt=function(){n++;return _c.apply(this,arguments)};
  const b=()=>ub.getBoundingClientRect(),cx=()=>b().left+b().width/2,cy=()=>b().top+b().height/2;
  const touch=(el,x,y)=>{const e=new Event('touchstart',{bubbles:true,cancelable:true});const tt=[{identifier:3,clientX:x,clientY:y,target:el}];Object.defineProperty(e,'changedTouches',{value:tt});Object.defineProperty(e,'touches',{value:tt});el.dispatchEvent(e);return e.defaultPrevented};
  const pdown=(el,x,y)=>el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerId:3,pointerType:'touch',clientX:x,clientY:y}));
  const bugs=()=>Object.values((window.__db&&__db.T&&__db.T.bugs)||{}).map(v=>String(v.what||''));
  // a tap: pointerdown, then touchstart (as phones send them) = one slam
  SQSLAM.cd=0;pdown(ub,cx(),cy());const prevented=touch(ub,cx(),cy());await W(100);out.tap=[n,SQSLAM.cd>16,prevented];
  // an invisible layer over the button: the tap still slams, and says what was on top
  await W(400);SQSLAM.cd=0;n=0;const lay=document.createElement('div');lay.id='chk91lay';const R=b();lay.style.cssText='position:fixed;z-index:99;left:'+(R.left-10)+'px;top:'+(R.top-10)+'px;width:'+(R.width+20)+'px;height:'+(R.height+20)+'px';document.body.appendChild(lay);
  touch(lay,cx(),cy());await W(600);lay.remove();out.covered=[n,SQSLAM.cd>16,bugs().some(w=>/^\[auto\] ULT button covered .*#chk91lay/.test(w))];
  // a tap that starts nothing: a message, and one report with what the game saw
  await W(400);const real=castUlt;castUlt=function(){n++};n=0;touch(ub,cx(),cy());await W(300);const m1=msg;await W(400);touch(ub,cx(),cy());await W(300);castUlt=real;
  const did=bugs().filter(w=>/^\[auto\] ULT button did nothing/.test(w));let st=null;try{st=JSON.parse(did[0].replace(/^\[auto\] ULT button did nothing /,'')).st}catch(e){}
  out.nothing=[n,/didn't start/.test(m1),did.length,st&&st.pick,st&&st.sledge];
  // Nov 22 (Derek is on a laptop): the SLAM box under the quest tracker names its key, and clicking it casts
  castUlt=_c;isPC=true;SQSLAM.cd=0;await W(300);const L=()=>hudLayout().chips.map(c=>c[1]);const ready=L().find(x=>/SLAM/.test(x));
  const q=SQCHIPS.find(c=>c.k==='ult'),cr=cv.getBoundingClientRect(),px=cr.left+(q.x+q.w/2)*cr.width/cv.width,py=cr.top+(q.y+q.h/2)*cr.height/cv.height;
  SQSLAM.cd=0;await W(400);cv.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerId:1,pointerType:'mouse',isPrimary:true,clientX:px,clientY:py}));await W(100);
  out.pc=[ready,SQSLAM.cd>16,L().find(x=>/SLAM/.test(x))];
  SQSLAM.cd=0;SQKEYS.bindKey('ult','q');await W(50);out.custom=L().find(x=>/SLAM/.test(x));SQKEYS.bindKey('ult','v');return out});
 t.eq(r.shown,['flex','SLAM'],'the SLAM button shows');
 t.eq(r.tap,[1,true,true],'one tap (pointerdown + touchstart) [casts, slam cooldown, the touch kept from the page]');
 t.eq(r.covered,[1,true,true],'a tap on an invisible layer over the button [casts, cooldown, reported]');
 t.eq(r.pc,['SLAM (V)',true,'SLAM 18s'],'on a laptop [the box names V, clicking it slams, then shows the cooldown]');t.eq(r.custom,'SLAM (Q)','the box names a changed key');
 t.eq(r.nothing,[2,true,1,'slam',true],'a tap that does nothing [tries, says so, one report, picked ultimate, sledgehammer]')}};
