// ---- 277. The ULT / SLAM button on touch screens: one tap = one ultimate, and a tap that does nothing says why and reports it ----
// Nov 22 (Jace: Derek, on an iPhone, "is STILL not able to use the SLAM ability": the SLAM button shows, tapping it does nothing).
// A copy of his save works in the checks (the button slams on every iPhone size we tried), so whatever stops it is on his device.
// - The button is handled here, before 030's own listeners (window capture, which then stop): a tap on it fires on whichever comes
//   first, pointerdown or touchstart (some phones drop one of them), at most once per 350 ms.
// - A tap that lands inside the button's box but on something else (an invisible layer over it) still uses the button, unless it's
//   another control (a button, a screen, the menu).
// - If the ultimate didn't start (no cooldown, no message, no Dragon Form), the player is told why when we can tell, and once per
//   session an "[auto] ULT button did nothing" bug report goes to `bugs` with what the game saw (screens open, building, the picked
//   ultimate, the button's box and what was under the finger, the touch layout): no chat or personal data beyond the usual report.
(()=>{const ub=document.getElementById('ub');if(!ub)return;
 let last=0,sent={};
 const vis=()=>{try{return ub.offsetWidth>0&&getComputedStyle(ub).display!=='none'}catch(e){return false}};
 const inBox=(x,y)=>{const r=ub.getBoundingClientRect();return r.width>0&&x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom};
 const state=()=>{const g=k=>{try{return window[k]}catch(e){return undefined}};let ch=null,av=[];try{ch=SQULT.chosen();av=SQULT.avail().map(a=>a.k)}catch(e){/*quiet*/}
  const R=SCENE&&SCENE.room;return{pn:!!pnOpen,menu:!!menuOpen,dead:!!dead,build:!!BUILD,sledge:!!(window.SQSLEDGE&&SQSLEDGE()),wand:WAND||null,pick:ch&&ch.k,avail:av,
   room:R?{cave:!!R.cave,region:R.region||null,yard:!!R.yard,court:!!R.court,castle:!!R.castle,dun:!!R.dun}:null,sail:!!((typeof SAILING!=='undefined'&&SAILING)||(window.SQRSAIL&&SQRSAIL.on)),
   slamCd:window.SQSLAM?Math.round(SQSLAM.cd*10)/10:null,ultCd:typeof ULTCD!=='undefined'?Math.round(ULTCD*10)/10:null,mana:typeof MANA!=='undefined'?Math.round(MANA):null,isPC:!!isPC,gp:typeof GPON!=='undefined'&&!!GPON,df:!!(window.SQDF&&SQDF.on),swing:typeof swing!=='undefined'?Math.round(swing*100)/100:null}};
 const mark=()=>({cd:window.SQSLAM?SQSLAM.cd:0,u:typeof ULTCD!=='undefined'?ULTCD:0,m:typeof msg!=='undefined'?msg:'',mt:typeof msgT!=='undefined'?msgT:0,df:!!(window.SQDF&&SQDF.on),dc:window.SQDAGGER?JSON.stringify(SQDAGGER.cd||0):''});
 function report(kind,extra){if(sent[kind])return;sent[kind]=1;try{const MP=window.SQMP,F=window.SQFB;if(!MP||!MP.user||!F)return;const d=F.db,r=ub.getBoundingClientRect();
   let lay=null;try{lay=(JSON.parse(localStorage.getItem('sq_touch')||'null')||{})}catch(e){/*quiet*/}const lu=lay&&((lay.l&&lay.l.ub)||(lay.p&&lay.p.ub));
   const what=('[auto] '+kind+' '+JSON.stringify(Object.assign({ver:window.SQVER,scr:innerWidth+'x'+innerHeight+'@'+(window.devicePixelRatio||1),ub:{html:ub.innerText.replace(/\s+/g,' '),r:[r.left,r.top,r.width,r.height].map(Math.round),op:ub.style.opacity,pe:getComputedStyle(ub).pointerEvents,lay:lu||null},st:state()},extra||{}))).slice(0,1500);
   d.push(d.ref(F.D,'bugs'),{what,u:MP.user.uid,n:String(MP.user.displayName||'').split(' ')[0].slice(0,12),t:d.serverTimestamp()}).catch(()=>{})}catch(e){self.SQERR&&SQERR(e,'269-1')}}
 const why=()=>{if(pnOpen||menuOpen)return'Close the screen first.';if(BUILD)return'Finish building first (DONE).';if(dead)return'';return null};
 function fire(src,tgt){const now=performance.now();if(now-last<350)return;last=now;
  const w=why();if(w!==null){if(w)try{say(w);msgT=3}catch(e){self.SQERR&&SQERR(e,'269-2')}return}
  const a=mark();try{castUlt()}catch(e){self.SQERR&&SQERR(e,'269-3')}const b=mark();
  const moved=a.cd!==b.cd||a.u!==b.u||a.m!==b.m||b.mt>a.mt+.01||a.df!==b.df||a.dc!==b.dc;
  if(!moved){try{say('Your ultimate didn\'t start. A report was sent so we can fix it.');msgT=4}catch(e){self.SQERR&&SQERR(e,'269-4')}report('ULT button did nothing',{src,tgt})}}
 const desc=el=>el?((el.id?'#'+el.id:'')+(typeof el.className==='string'&&el.className?'.'+el.className.split(/\s+/).slice(0,2).join('.'):'')||el.tagName):'none';
 const control=el=>!!(el&&el.closest&&el.closest('button,a,input,select,textarea,.b,#pn,#sm,#mpchat,#sqdcm,#dvs,[data-a]'));
 function onDown(e,x,y,src){if(isPC||!vis()||pnOpen||menuOpen)return;/* a screen (or the touch layout editor) is open: leave the tap alone */const t=e.target,onBtn=t&&t.closest&&t.closest('#ub');
  if(onBtn){e.preventDefault();e.stopImmediatePropagation();fire(src,'ub');return}
  // inside the button's box, but something else is under the finger
  if(!inBox(x,y))return;report('ULT button covered',{src,tgt:desc(t)});if(control(t))return;// another control on top keeps the tap
  e.preventDefault();e.stopImmediatePropagation();fire(src,desc(t))}
 addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;onDown(e,e.clientX,e.clientY,'pointer')},{capture:true,passive:false});
 addEventListener('touchstart',e=>{const t=e.changedTouches&&e.changedTouches[0];if(!t)return;onDown(e,t.clientX,t.clientY,'touch')},{capture:true,passive:false});
 window.SQULTBTN={fire,state,report}})();
