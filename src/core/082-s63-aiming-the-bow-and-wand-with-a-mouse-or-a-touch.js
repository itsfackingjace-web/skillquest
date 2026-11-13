// ---------------------------------------------------------------- 63. Aiming the bow and wand with a mouse or a touch screen
// Mouse: with a bow or a wand in your off-hand, the cursor aims (a crosshair shows where). Right-click shoots or casts
// (hold to keep firing). Left-click turns you toward the cursor and hits, like Space.
// Touch: a BOW / CAST button appears above HIT. Tap it to fire at the nearest enemy in range (any direction);
// press and drag it to aim yourself (a crosshair shows), release to fire; keep holding to keep firing.
// Keyboard and controller play are unchanged (Space / HIT still auto-shoots at an enemy in front of you).
{const AIMX={T:null,mouse:null,mIn:false,rHeld:false,rT:0,touch:null,tHeld:0,lastFire:0};
 const offhand=()=>!!(WAND||TL.bow);
 const _pP63=pP;pP=function(tm){AIMX.T=g.getTransform();return _pP63(tm)};
 const toWorld=(cx,cy)=>{if(!AIMX.T)return null;try{const p=AIMX.T.inverse().transformPoint({x:cx*D,y:cy*D});return p}catch(e){return null}};
 const canFire=()=>!dead&&!menuOpen&&!pnOpen&&!BUILD&&!FISH&&!(typeof GPON!=='undefined'&&GPON);
 function aimAt(wx,wy){const dx=wx-P.x,dy=(wy)-(P.y-4),l=Math.hypot(dx,dy);if(l<4)return false;AIM.v=[dx/l,dy/l];AIM.t=performance.now();return true}
 function nearestFoe(){const R=WAND?160:bowRange();let best=null,bd=1e9;for(const n of en){if(n.dead)continue;const dx=n.x-P.x,dy=(n.y-4)-(P.y-2),l=Math.hypot(dx,dy);if(l<8||l>R)continue;
  const fwd=(dx*face[0]+dy*face[1])/l,score=l*(1.35-fwd*.35);if(score<bd){bd=score;best=n}}return best}
 function aimFire(first){if(!canFire()||swing>0)return;AIMX.lastFire=performance.now();shootAim(first)}
 // --- mouse ---
 cv.addEventListener('mousemove',e=>{AIMX.mouse=[e.clientX,e.clientY];AIMX.mIn=true});
 cv.addEventListener('mouseleave',()=>{AIMX.mIn=false;AIMX.rHeld=false});
 cv.addEventListener('mousedown',e=>{if(!isPC||typeof GPON!=='undefined'&&GPON)return;AIMX.mouse=[e.clientX,e.clientY];AIMX.mIn=true;
  const w=toWorld(e.clientX,e.clientY);
  if(e.button===2){e.preventDefault();if(!offhand()){if(canFire()){say('Put a bow or a wand in your off-hand to shoot with right-click.');sfx('swish')}return}
   if(w)aimAt(w.x,w.y);AIMX.rHeld=true;AIMX.rT=0;aimFire(true);return}
  if(e.button===0&&w&&canFire()&&!dead){const dx=w.x-P.x,dy=w.y-(P.y-4);if(Math.hypot(dx,dy)>6)face=Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];
   if(offhand())aimAt(w.x,w.y);attack()}});
 addEventListener('mouseup',e=>{if(e.button===2)AIMX.rHeld=false});
 // --- touch: the BOW / CAST button ---
 const tb=document.createElement('div');tb.className='b';tb.id='aimb';tb.textContent='BOW';tb.style.cssText='position:fixed;display:none;touch-action:none;z-index:11';document.body.appendChild(tb);
 const st=document.createElement('style');st.textContent='#aimb{width:64px!important;height:64px!important;font-size:14px!important}#aimb.on{filter:brightness(.9)}'+
  // the touch cluster: FIRE no longer overlaps HIT, ROLL / ULT moved out a little to make room
  '#f{right:120px!important;bottom:calc(env(safe-area-inset-bottom,0px) + 130px)!important}#rl,#ub{right:190px!important}';document.head.appendChild(st);
 // find a free spot next to the other touch buttons (never on top of one): try above / beside each button, nearest to HIT first
 function placeBtn(){const hit=document.getElementById('a');const farm=()=>!WAND&&!TL.bow&&!!(TL.hoe||TL.can),yd=SCENE&&SCENE.room&&(SCENE.room.yard||SCENE.room.court);const show=!isPC&&(offhand()||farm())&&!(typeof GPON!=='undefined'&&GPON)&&!menuOpen&&!pnOpen&&!dead&&hit&&hit.getBoundingClientRect().width>0&&getComputedStyle(hit).display!=='none'&&(yd||!(SCENE&&!SCENE.room.cave&&!SCENE.room.region));
  tb.style.display=show?'flex':'none';if(!show)return;tb.textContent=WAND?'CAST':TL.bow?'BOW':TL.can?'WATER':'TILL';const S=64,G=8,vw=innerWidth,vh=innerHeight;
  const rects=[...document.querySelectorAll('.b,#mpb,#mpbug,#mb,#pb2,#cb')].filter(e=>e!==tb&&e.offsetWidth>0&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden').map(e=>e.getBoundingClientRect()).filter(r=>r.width>0);
  // the USE / TALK / SAIL button pops up above HIT now and then: keep its spot free even while it's hidden
  {const t=document.getElementById('tk');if(t){const cs=getComputedStyle(t),w=parseFloat(cs.width)+8,hh=parseFloat(cs.height)+8,r=parseFloat(cs.right),bt=parseFloat(cs.bottom);if(isFinite(w)&&isFinite(r)&&isFinite(bt))rects.push({left:vw-r-w,right:vw-r,top:vh-bt-hh,bottom:vh-bt})}}
  const minY=vh*.35;rects.push({left:vw-210,right:vw,top:0,bottom:Math.min(vh*.62,280)}); // stay in the button area, clear of the minimap and the boxes up top
  const free=(x,y)=>x>=G&&y>=minY&&x+S<=vw-G&&y+S<=vh-G&&!rects.some(r=>x<r.right+6&&x+S>r.left-6&&y<r.bottom+6&&y+S>r.top-6);
  const h=hit.getBoundingClientRect(),hx=h.left+h.width/2,hy=h.top+h.height/2,c=[];
  for(const r of rects){const cx=r.left+r.width/2,cy=r.top+r.height/2;c.push([cx-S/2,r.top-S-10],[r.left-S-10,cy-S/2],[cx-S/2,r.bottom+10],[r.right+10,cy-S/2])}
  c.sort((p,q)=>Math.hypot(p[0]+S/2-hx,p[1]+S/2-hy)-Math.hypot(q[0]+S/2-hx,q[1]+S/2-hy));
  const near=p=>Math.hypot(p[0]+S/2-hx,p[1]+S/2-hy)<260,k=tb.dataset.k,cur=k?k.split(',').map(Number):null;let pick=cur&&free(cur[0],cur[1])&&near(cur)?cur:(c.find(p=>near(p)&&free(p[0],p[1]))||c.find(p=>free(p[0],p[1])));
  if(!pick)pick=[h.left+h.width/2-S/2,Math.max(G,h.top-S-10)];pick=pick.map(Math.round);tb.dataset.k=pick.join(',');tb.style.left=pick[0]+'px';tb.style.top=pick[1]+'px'}
 setInterval(placeBtn,300);
 tb.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();
  // a hoe or watering can in the off-hand: one tap = till / water (140's off-hand use)
  if(!WAND&&!TL.bow&&(TL.hoe||TL.can)){tb.classList.add('on');setTimeout(()=>tb.classList.remove('on'),150);try{window.SQOFFHAND&&SQOFFHAND.use()}catch(_){}return}
 const t=e.changedTouches[0];AIMX.touch={id:t.identifier,x:t.clientX,y:t.clientY,drag:false};AIMX.tHeld=0;tb.classList.add('on')},{passive:false});
 tb.addEventListener('touchmove',e=>{e.preventDefault();e.stopPropagation();const T=AIMX.touch;if(!T)return;for(const t of e.changedTouches){if(t.identifier!==T.id)continue;
  const dx=t.clientX-T.x,dy=t.clientY-T.y;if(Math.hypot(dx,dy)>14){T.drag=true;const l=Math.hypot(dx,dy);AIM.v=[dx/l,dy/l];AIM.t=performance.now()}}},{passive:false});
 const tEnd=e=>{e.preventDefault();e.stopPropagation();const T=AIMX.touch;if(!T)return;tb.classList.remove('on');AIMX.touch=null;
  if(!T.drag){const n=nearestFoe();if(n)aimAt(n.x,n.y);else AIM.t=-1e9}aimFire(true)};
 tb.addEventListener('touchend',tEnd,{passive:false});tb.addEventListener('touchcancel',e=>{AIMX.touch=null;tb.classList.remove('on')});
 // --- every frame: keep the aim on the cursor, repeat while held ---
 const _u63=upd;upd=function(dt){_u63(dt);if(typeof GPON!=='undefined'&&GPON)return;
  if(isPC&&AIMX.mIn&&AIMX.mouse&&offhand()){const w=toWorld(AIMX.mouse[0],AIMX.mouse[1]);if(w)aimAt(w.x,w.y)}
  if(AIMX.rHeld){AIMX.rT+=dt;if(AIMX.rT>.35&&swing<=0)aimFire(false)}
  if(AIMX.touch){AIMX.tHeld+=dt;if(AIMX.touch.drag){AIM.t=performance.now();if(AIMX.tHeld>.5&&swing<=0&&performance.now()-AIMX.lastFire>420)aimFire(false)}}};
 // cursor: a crosshair over the game while a bow or wand is ready
 setInterval(()=>{cv.style.cursor=isPC&&offhand()&&!(typeof GPON!=='undefined'&&GPON)?'crosshair':''},500);
 // crosshair for mouse and touch aiming (the controller draws its own)
 function aimCross(tm){if(typeof GPON!=='undefined'&&GPON)return;if(!offhand()||!aimLive()||dead||ROLLT>0||menuOpen||pnOpen)return;if(SCENE&&!SCENE.room.cave&&!SCENE.room.region)return;
  if(!(AIMX.touch&&AIMX.touch.drag)&&!(isPC&&AIMX.mIn))return;
  let dx,dy,tgt;if(TL.bow&&!WAND){[dx,dy,tgt]=aimDir()}else{dx=AIM.v[0];dy=AIM.v[1];tgt=null}
  const r=34,x=Math.round(P.x+dx*r),y=Math.round(P.y-4+dy*r),pu=Math.floor(tm*4)%2,c=tgt?'#f84030':(WAND?'#c8a8ff':'#f8f8f8'),k=tgt?3:4+pu;
  for(const[a,b,w,hh]of[[-k-2,-1,3,3],[k,-1,3,3],[-1,-k-2,3,3],[-1,k,3,3]])Rg(x+a-1,y+b-1,w+2,hh+2,O);
  Rg(x-k-2,y,3,1,c);Rg(x+k,y,3,1,c);Rg(x,y-k-2,1,3,c);Rg(x,y+k,1,3,c);Rg(x,y,1,1,c)}
 const _dh63=drawHUD;drawHUD=function(){if(AIMX.T){g.save();g.setTransform(AIMX.T);try{aimCross(performance.now()/1000)}catch(e){}g.restore()}_dh63()};
 window.SQAIM=AIMX}
