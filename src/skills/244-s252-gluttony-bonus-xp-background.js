// ---- 252. Ideas from #ideas (approved Nov 20): Gluttony, XP for bonus items, keep playing in a background tab ----
// - Gluttony: at Cooking 99 you eat automatically when you're down to half health (3 hearts) and have food (181's SQEATPICK.eat,
//   so the eating cooldown and the food picker's choice apply). Options has an on/off button (localStorage sq_glut).
// - Bonus items give XP: an extra or doubled harvest (038's gBoost: XP of the harvest it doubles, per item) and a bonus item when
//   making things (039's prodBoost: its base XP per unit) now give the XP that item would have given.
// - Background tab: browsers stop drawing a hidden tab, so the game used to freeze when you switched tabs (or minimised the app).
//   A tiny worker keeps ticking (worker timers aren't slowed down like the page's), and while the tab is hidden the game keeps
//   running its update (no drawing), so a make-all, fishing or a fire keeps going.
(()=>{
 // ---------- Gluttony ----------
 const CK=4;// Cooking's index in SKN
 let glut=true;try{glut=localStorage.getItem('sq_glut')!=='0'}catch(e){self.SQERR&&SQERR(e,'244-1')}
 const has=()=>{try{return lvOf(CK)>=99}catch(e){return false}};
 let gT=0,told=false;
 SQUPD.after('244 gluttony',dt=>{if((gT-=dt)>0)return;gT=.4;if(!has())return;
  if(!glut||dead||menuOpen||P.hp>3)return;const E=window.SQEATPICK;if(!E||!E.pick())return;
  try{if(window.SQEATCD&&SQEATCD()>0)return}catch(e){self.SQERR&&SQERR(e,'244-2')}
  try{if(E.eat())drops.push({x:P.x,y:P.y-34,t:0,tx:'Gluttony!',c:'#f8b048'})}catch(e){self.SQERR&&SQERR(e,'244-3')}});
 SQADDXP.after('244 gluttony unlock',(i,x)=>{if(i===CK&&x>0&&has()&&!told){told=true;say('Cooking 99: you unlocked GLUTTONY! You eat on your own when you\'re down to half health (Options to turn it off).');msgT=6}});
 // told = already 99 when the game starts (no message then)
 SQLOAD.after('244',()=>{told=has()});
 SQOPTS.wrap('244',_o=>function(){const h=_o();if(!has())return h;const add='<button class="sb sqglut">Gluttony (auto-eat): '+(glut?'ON':'OFF')+'</button>';
  let k=h.indexOf('<div class="tl" style="margin-top:16px">CONTROLLER</div>');if(k<0)k=h.indexOf('<div class="tl" style="margin-top:22px');return k<0?h+add:h.slice(0,k)+add+h.slice(k)});
 pbd.addEventListener('click',e=>{if(!e.target.closest('.sqglut'))return;e.stopPropagation();glut=!glut;try{localStorage.setItem('sq_glut',glut?'1':'0')}catch(err){self.SQERR&&SQERR(err,'244-4')}try{sfx('talk');rPn()}catch(err){self.SQERR&&SQERR(err,'244-5')}},true);
 // ---------- XP for bonus items ----------
 let BONUS=0;const LAST={};SQADDXP.after('244 last xp',(i,x)=>{if(x>0&&!BONUS)LAST[i]={x,t:performance.now()}});
 const give=(sk,xp,x,y)=>{xp=Math.round(xp);if(xp<1)return;BONUS++;try{addXp(sk,xp)}finally{BONUS--}try{drops.push({x,y:y-48,t:0,tx:'+'+xp+' XP',c:SKC[sk]||'#fff'})}catch(e){self.SQERR&&SQERR(e,'244-6')}};
 if(typeof gBoost==='function'){const _g=gBoost;gBoost=function(sk,gains,x,y){const keys=Object.keys(gains||{}).filter(k=>gains[k]>0),b0=keys.map(k=>inv[k]|0);const out=_g.apply(this,arguments);
   try{const extra=keys.reduce((s,k,j)=>s+Math.max(0,(inv[k]|0)-b0[j]),0),base=keys.reduce((s,k)=>s+gains[k],0),L=LAST[sk];
    if(extra>0&&base>0&&L&&performance.now()-L.t<1500)give(sk,L.x*extra/base,x,y)}catch(e){self.SQERR&&SQERR(e,'244-7')}return out}}
 if(typeof prodBoost==='function'){const _p=prodBoost;prodBoost=function(sk,o){const k=o&&o.out,b0=k?inv[k]|0:0;const out=_p.apply(this,arguments);
   try{if(k&&o.n>0&&o.xp>0){const extra=(inv[k]|0)-b0;if(extra>0)give(sk,o.xp/o.n*extra,P.x,P.y)}}catch(e){self.SQERR&&SQERR(e,'244-8')}return out}}
 // ---------- keep playing in a background tab ----------
 let lastTick=performance.now(),W=null,TICKS=0;
 try{const src='let t=null;onmessage=e=>{if(e.data==="on"&&!t)t=setInterval(()=>postMessage(1),200);else if(e.data==="off"&&t){clearInterval(t);t=null}}';
  W=new Worker(URL.createObjectURL(new Blob([src],{type:'text/javascript'})))}catch(e){W=null}
 // Nov 21 (Jace: players "see a full hunger bar but the game sees them as starving"): while the tab was hidden the game kept running,
 // so hunger drained and monsters attacked with nothing on screen, and players came back starved or fallen. While hidden you're
 // safe now: your HP can't go down (a P.hp getter, like 134's chess boards). Hunger still drains (Kevin's approved idea: no endless
 // AFK skilling), and when your food runs out whatever you were doing stops, so you come back hungry but never fallen.
 let held=false,hv=0;
 SQUPD.after('244 hungry while hidden',()=>{if(!held||!document.hidden||typeof hunger!=='number'||hunger>0)return;let was=false;
  try{if(window.SQDO){SQDO=null;was=true}if(typeof FISH!=='undefined'&&FISH){FISH=null;was=true}}catch(e){self.SQERR&&SQERR(e,'244-12')}
  if(was)try{say('You were too hungry to keep going. Eat something!');msgT=8}catch(e){self.SQERR&&SQERR(e,'244-13')}});
 const hold=on=>{try{if(on&&!held){const d=Object.getOwnPropertyDescriptor(P,'hp');if(d&&d.get)return;hv=P.hp;Object.defineProperty(P,'hp',{configurable:true,enumerable:true,get(){return hv},set(v){if(v>hv)hv=v}});held=true}
   else if(!on&&held){const d=Object.getOwnPropertyDescriptor(P,'hp');if(d&&d.get){const v=hv;delete P.hp;P.hp=v}held=false}}catch(e){self.SQERR&&SQERR(e,'244-11')}};
 if(W){W.onmessage=()=>{if(!document.hidden)return;TICKS++;const now=performance.now();let left=Math.min(1,(now-lastTick)/1000);lastTick=now;
    hold(true);try{while(left>0){const d=Math.min(.05,left);left-=d;upd(d)}}catch(e){self.SQERR&&SQERR(e,'244-9')}};
  const sync=()=>{lastTick=performance.now();if(document.hidden)hold(true);else hold(false);try{W.postMessage(document.hidden?'on':'off')}catch(e){self.SQERR&&SQERR(e,'244-10')}};
  document.addEventListener('visibilitychange',sync);sync()}
 window.SQIDEAS252={get held(){return held},hold,get glut(){return glut},has,LAST,worker:!!W,get ticks(){return TICKS}}})();
