// ---- 264. Drop Cards: the "you found a card!" moment, boss/shiny announcements, collecting achievements (window.SQCARDFOUND) ----
// Nov 20 (Jace picked these for before the Drop Card release):
// - A found card flips up in the middle of the screen (253's SQCARDGOT hook) for about 2 s while the game keeps running; boss and
//   shiny cards stay 3.5 s with a bigger glow and a second sound. Tap / click it, or press any key or controller button, to dismiss.
//   Several in a row queue up.
// - Boss cards and shiny cards are announced in chat to everyone online (your own chat line "★ found ..."; not for young players,
//   whose chat is phrases only).
// - Achievements (129's SQACH.A, group "Drop Card"): first card, 10 / 25 different, every monster card, every tree card, a boss card,
//   every boss card, a shiny. Only cards you earned count (Starter Deck cards don't: they're never in inv).
(()=>{const D=window.SQDROPCARD;if(!D)return;
 const BOSS=new Set(['world','dungeon','island','guild']);
 const box=document.createElement('div');box.id='sqdcf';box.setAttribute('role','status');box.style.display='none';document.body.appendChild(box);
 const Q=[];let cur=null,until=0,shownAt=0;
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function show(ev){const C=ev.card,big=ev.shiny||BOSS.has(C.g);cur=ev;shownAt=performance.now();until=shownAt+(big?3500:2200);
  box.className=(big?'big ':'')+(ev.shiny?'shiny':'');
  box.innerHTML='<button class="sqdcf-c" aria-label="Close"><span class="sqdcf-rays" aria-hidden="true"></span><img alt="" src="'+iconURL(ev.key)+'">'+
   '<span class="sqdcf-t">'+(ev.shiny?'SHINY! ':'')+(ev.first?'NEW CARD!':'DROP CARD!')+'</span><span class="sqdcf-n">'+esc(String(C.n).replace(/^Drop Card: /,''))+'</span><span class="sqdcf-d">'+esc(C.d||'')+'</span></button>';
  box.style.display='flex';if(big)setTimeout(()=>{try{sfx('quest')}catch(e){self.SQERR&&SQERR(e,'256-1')}},250)}
 function hide(){box.style.display='none';cur=null;if(Q.length)setTimeout(()=>{if(!cur&&Q.length)show(Q.shift())},150)}
 const dismiss=()=>{if(cur&&performance.now()-shownAt>250)hide()};
 box.addEventListener('click',e=>{e.stopPropagation();dismiss()});
 addEventListener('keydown',()=>{if(cur)dismiss()},true);
 // a controller button (polled while a card is up)
 let padHeld=true;
 (function tick(){requestAnimationFrame(tick);if(!cur)return;if(performance.now()>until){hide();return}
  try{const ps=navigator.getGamepads?navigator.getGamepads():[];let any=false;for(const p of ps)if(p&&p.buttons)for(const b of p.buttons)if(b&&b.pressed)any=true;
   if(any&&!padHeld)dismiss();padHeld=any}catch(e){/*quiet*/}})();
 // ---- announcements ----
 function announce(ev){const C=ev.card;if(!(ev.shiny||BOSS.has(C.g)))return;const M=window.SQMP;if(!M||!M.on||!M.user||typeof window.mpSend!=='function')return;
  if(window.SQAGE&&SQAGE.child&&SQAGE.child())return;const nm=String(C.n).replace(/^Drop Card: /,'');
  setTimeout(()=>{try{mpSend('★ found a '+(ev.shiny?'SHINY ':'')+'Drop Card: '+nm+'!')}catch(e){self.SQERR&&SQERR(e,'256-2')}},1400)}
 (window.SQCARDGOT=window.SQCARDGOT||[]).push(ev=>{if(cur)Q.push(ev);else show(ev);announce(ev);try{SQACH.check&&SQACH.check()}catch(e){self.SQERR&&SQERR(e,'256-3')}});
 // ---- achievements ----
 const earned=C=>((inv[C.key]|0)+(inv[C.sh]|0))>0;
 const cards=()=>Object.values(D.CARDS);
 const nEarned=f=>cards().filter(C=>(!f||f(C))&&earned(C)).length,nAll=f=>cards().filter(C=>!f||f(C)).length;
 const shinies=()=>cards().reduce((a,C)=>a+(inv[C.sh]|0),0);
 try{const A=SQACH.A,add=(id,n,d,val,goal,gold)=>{if(!A.some(a=>a.id===id))A.push({g:'Drop Card',id,n,d,val,goal,gold})};
  add('dc_first','First card','Find your first Drop Card.',()=>nEarned(),1,100);
  add('dc_10','Collector','Find 10 different Drop Cards.',()=>nEarned(),10,500);
  add('dc_25','Card hoarder','Find 25 different Drop Cards.',()=>nEarned(),25,1500);
  add('dc_mon','Monster binder','Find every monster card.',()=>nEarned(C=>C.g==='reg'),()=>nAll(C=>C.g==='reg'),5000);
  add('dc_tree','Grove keeper','Find every tree card.',()=>nEarned(C=>C.g==='tree'),()=>nAll(C=>C.g==='tree'),1000);
  add('dc_boss1','Trophy card','Find a boss card.',()=>nEarned(C=>BOSS.has(C.g)),1,2000);
  add('dc_boss','Boss collector','Find every boss card.',()=>nEarned(C=>BOSS.has(C.g)),()=>nAll(C=>BOSS.has(C.g)),25000);
  add('dc_shiny','Ooh, shiny','Find a shiny Drop Card.',()=>shinies(),1,1000)}catch(e){self.SQERR&&SQERR(e,'256-4')}
 const st=document.createElement('style');st.textContent=
  '#sqdcf{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;pointer-events:none}'+
  '.sqdcf-c{position:relative;pointer-events:auto;display:flex;flex-direction:column;align-items:center;gap:4px;padding:14px 22px 12px;background:rgba(24,20,32,.88);border:3px solid #f8d048;border-radius:12px;color:#fff;font-family:var(--pf);cursor:pointer;animation:sqdcfIn .55s cubic-bezier(.2,1.4,.4,1) both;box-shadow:0 0 24px rgba(248,208,72,.45)}'+
  '.sqdcf-c img{width:min(28vmin,168px);height:min(28vmin,168px);image-rendering:pixelated;animation:sqdcfFlip .7s ease-out both}'+
  '.sqdcf-t{font-weight:700;font-size:15px;letter-spacing:2px;color:#f8d048}.sqdcf-n{font-weight:700;font-size:20px}.sqdcf-d{font-size:14px;color:#e0d8c0}'+
  '.sqdcf-rays{position:absolute;left:50%;top:42%;width:0;height:0;pointer-events:none}'+
  '#sqdcf.big .sqdcf-c{border-color:#ff9040;box-shadow:0 0 40px 8px rgba(255,140,60,.6)}#sqdcf.big .sqdcf-rays::before{content:"";position:absolute;left:-150px;top:-150px;width:300px;height:300px;border-radius:50%;background:repeating-conic-gradient(rgba(255,220,120,.35) 0 10deg,transparent 10deg 25deg);animation:sqdcfSpin 6s linear infinite;z-index:-1}'+
  '#sqdcf.shiny .sqdcf-c{border-color:#fff6c8;box-shadow:0 0 44px 10px rgba(255,240,170,.7)}#sqdcf.shiny .sqdcf-t{color:#fff6c8;text-shadow:0 0 8px #f0c030}'+
  '@keyframes sqdcfIn{from{opacity:0;transform:scale(.6) translateY(30px)}to{opacity:1;transform:none}}'+
  '@keyframes sqdcfFlip{0%{transform:perspective(400px) rotateY(180deg);filter:brightness(3)}60%{transform:perspective(400px) rotateY(-12deg);filter:brightness(1.4)}100%{transform:none;filter:none}}'+
  '@keyframes sqdcfSpin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.sqdcf-c,.sqdcf-c img,#sqdcf.big .sqdcf-rays::before{animation:none}}';
 document.head.appendChild(st);
 window.SQCARDFOUND={show,hide,get showing(){return cur},Q,box}})();
