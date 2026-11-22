// ---- 276. Drop Card: drag a card to play it, drag a monster onto what it attacks, drag a spell onto its target ----
// Nov 22 (Jace): "attacking is tedious, as is using spell cards etc. what if we made it where we could click-and-drag a card to
// whatever it is we want to attack? or click-and-drag a spell onto its target in the same way?"
// - Pointer events on 262's table (#sqdcm), so mouse, touch and pen all work: press a card and move it 10+ px to drag it. A tap
//   still opens 262's close-up, and the controller and the buttons work as before.
// - From your hand: a copy of the card follows the pointer. A spell with a target goes on the glowing card (or hero) you let go on;
//   a tree, monster, pet or spell without a target is played by letting go anywhere above your hand (your side lights up). Letting go
//   on your hand puts it back. While you drag, the trees the card would chop glow, as in the close-up.
// - From the table: one of your monsters or pets that can attack draws an arrow to the pointer; let go on a glowing enemy, enemy pet
//   or the enemy hero to attack it.
// - The pointer is captured by the table element itself (262 only redraws its inside), so a redraw can't break a drag. The targets
//   light up through 262's own aim/sel state; the rules (261) still decide, so an illegal drop says why, as the buttons do.
// - Styles for the ghost card, the arrow and the drop zone are in 262's stylesheet (dcm-ghost, dcm-arrow, dcm-dropme, dcm-hov, dcm-dragsrc).
(()=>{const T=window.SQDCM,E=window.SQDCE;if(!T||!T.el||!E)return;const el=T.el;
 let G=null,swallow=0;
 const SVGNS='http://www.w3.org/2000/svg';
 const layer=()=>el.querySelector('.dcm-fxl');
 const mid=r=>[r.left+r.width/2,r.top+r.height/2];
 // what's under the pointer: a monster or pet (its uid), a hero ('h0'/'h1'), or where on the table
 function under(x,y){const t=document.elementFromPoint(x,y);if(!t||!el.contains(t))return{out:true};
  const slot=t.closest('[data-uid]');if(slot)return{tg:slot.dataset.uid};const h=t.closest('[data-dcm^="h:"]');if(h)return{tg:h.dataset.dcm.slice(2)};
  return{hand:!!t.closest('.dcm-hand,.dcm-btns'),zoom:!!t.closest('.dcm-zoom')}}
 function srcEl(){if(!G)return null;return G.t==='hand'?el.querySelector('[data-dcm="c:'+G.h+'"]'):el.querySelector('[data-uid="'+G.uid+'"] .dcm-card')}
 // after every redraw while dragging: dim the card being dragged, light up your side for a card played onto the table
 function marks(){const s=srcEl();if(s)s.classList.add('dcm-dragsrc');if(G&&G.table){const b=el.querySelector('.dcm-board.me');if(b)b.classList.add('dcm-dropme')}}
 function begin(e){const M=T.m,s=M.s,P=s.p[0];G.on=true;
  try{el.setPointerCapture(G.id)}catch(x){/*quiet*/}
  M.zoom=null;M.msg='';M.sel=null;M.aim=null;M.att=null;
  const L=layer();
  if(G.t==='hand'){const k=P.hand[G.h],c=k==='_sapling'?null:E.card(k);G.k=k;G.c=c;
   const ts=c&&c.kind==='spell'?E.spellTargets(s,0,c):null;G.ts=ts;G.table=!ts;
   if(c&&c.kind!=='tree'){M.sel={t:'hand',v:G.h};if(ts)M.aim=ts}
   const g=document.createElement('div');g.className='dcm-ghost';const im=G.src&&G.src.querySelector('img');
   if(im){const i2=document.createElement('img');i2.src=im.src;i2.alt='';g.appendChild(i2)}else g.textContent='🌱';G.ghost=g}
  else{M.sel={t:'mon',v:G.uid};M.att=G.uid;M.aim=E.targets(s,0,G.uid);G.ts=M.aim;
   const r=G.src.getBoundingClientRect();G.from=mid(r);
   const sv=document.createElementNS(SVGNS,'svg');sv.setAttribute('class','dcm-arrow');sv.setAttribute('aria-hidden','true');
   const ln=document.createElementNS(SVGNS,'line'),ci=document.createElementNS(SVGNS,'circle');ln.setAttribute('x1',G.from[0]);ln.setAttribute('y1',G.from[1]);ci.setAttribute('r',16);
   sv.appendChild(ln);sv.appendChild(ci);G.arrow=sv;G.ln=ln;G.ci=ci}
  T.render();marks();const L2=layer()||L;if(L2){if(G.ghost)L2.appendChild(G.ghost);if(G.arrow)L2.appendChild(G.arrow)}
  try{sfx('swish')}catch(x){self.SQERR&&SQERR(x,'268-1')}}
 function move(x,y){if(G.ghost)G.ghost.style.transform='translate('+x+'px,'+y+'px) rotate(-4deg)';if(G.ln){G.ln.setAttribute('x2',x);G.ln.setAttribute('y2',y);G.ci.setAttribute('cx',x);G.ci.setAttribute('cy',y)}
  // the target under the pointer grows
  const u=under(x,y),hov=u.tg&&G.ts&&G.ts.includes(u.tg)?u.tg:null;if(hov!==G.hov){G.hov=hov;el.querySelectorAll('.dcm-hov').forEach(n=>n.classList.remove('dcm-hov'));
   if(hov){const n=hov[0]==='h'?el.querySelector('[data-dcm="h:'+hov+'"]'):el.querySelector('[data-uid="'+hov+'"]');if(n)n.classList.add('dcm-hov')}}
  if(!el.querySelector('.dcm-dragsrc'))marks()}
 function clear(){const g=G;G=null;if(!g)return g;if(g.ghost)g.ghost.remove();if(g.arrow)g.arrow.remove();try{if(el.hasPointerCapture&&el.hasPointerCapture(g.id))el.releasePointerCapture(g.id)}catch(x){/*quiet*/}return g}
 function cancel(msg){const g=clear(),M=T.m;if(!g||!M)return;M.sel=null;M.aim=null;M.att=null;if(msg)M.msg=msg;T.render()}
 function drop(x,y){const g=G,M=T.m;if(!g||!M){clear();return}const u=under(x,y);
  if(g.t==='mon'){if(!u.tg){cancel();return}clear();M.sel=null;M.aim=null;M.att=null;T.act({t:'atk',a:g.uid,tg:u.tg});return}
  if(g.ts){// a spell with a target
   if(u.tg&&g.ts.includes(u.tg)){clear();T.act({t:'play',h:g.h,tg:u.tg});return}
   cancel(u.out||u.hand?'':'Drop '+g.c.n+' on a glowing target.');return}
  if(u.out||u.hand||u.zoom){cancel();return}
  clear();M.sel=null;M.aim=null;M.att=null;T.act(g.c&&g.c.kind==='tree'?{t:'plant',h:g.h}:{t:'play',h:g.h})}
 el.addEventListener('pointerdown',e=>{swallow=0;const M=T.m;if(!M||G||e.button>0||M.zoom)return;const s=M.s;if(s.over||s.cur!==0||M.busy)return;
  const b=e.target.closest('[data-dcm]');if(!b||!el.contains(b))return;const a=b.dataset.dcm;
  if(/^c:\d+$/.test(a)&&b.closest('.dcm-hand'))G={t:'hand',h:+a.slice(2),src:b};
  else if(/^m:/.test(a)){const uid=a.slice(2);if(!E.targets(s,0,uid).length)return;G={t:'mon',uid,src:b}}
  else return;
  G.id=e.pointerId;G.x0=e.clientX;G.y0=e.clientY;G.on=false},true);
 el.addEventListener('pointermove',e=>{if(!G||e.pointerId!==G.id)return;
  if(!G.on){const dx=e.clientX-G.x0,dy=e.clientY-G.y0;if(dx*dx+dy*dy<100)return;const M=T.m;if(!M||M.s.cur!==0||M.s.over){G=null;return}begin(e)}
  e.preventDefault();move(e.clientX,e.clientY)});
 el.addEventListener('pointerup',e=>{if(!G||e.pointerId!==G.id)return;if(!G.on){G=null;return}// a tap: 262's click handler opens the close-up
  e.preventDefault();swallow=performance.now()+400;drop(e.clientX,e.clientY)});
 el.addEventListener('pointercancel',e=>{if(G&&e.pointerId===G.id){if(G.on)cancel();else G=null}});
 // the click that follows a drag must not also open a close-up or pick a target (the next press starts fresh)
 el.addEventListener('click',e=>{if(performance.now()<swallow){e.stopImmediatePropagation();e.preventDefault()}},true);
 // the browser's own image dragging would steal a mouse drag
 el.addEventListener('dragstart',e=>e.preventDefault());
 addEventListener('keydown',e=>{if(G&&G.on&&e.key==='Escape'){e.preventDefault();e.stopPropagation();cancel()}},true);
 window.SQDCDRAG={get g(){return G},under,cancel}})();
