// ---- 178. A clear controller highlight ----
// The controller's highlight (023's .gpf, 081's inset ring) is drawn inside each button, because the Gen 3 pixel frames clip
// anything drawn outside; on the light menus a thin orange line inside a bordered button was hard to spot. This draws a
// separate ring on its own layer (fixed, on top of everything, never clipped) around whatever GPF is: a thick gold ring with a
// dark edge, so it shows on light and dark screens, gently pulsing. It follows the element every frame (scrolling, cards
// opening, screens redrawing) and hides when the controller isn't in use, nothing is highlighted, or the highlighted thing is covered
// (the Dev Suite or a popup over the menu).
(()=>{const st=document.createElement('style');st.textContent=`
#sqgpr{position:fixed;left:0;top:0;width:0;height:0;z-index:2147483000;pointer-events:none;display:none;box-sizing:border-box;
 border:4px solid #ffc020;border-radius:8px;box-shadow:0 0 0 2px #1c2440,inset 0 0 0 2px #1c2440,0 0 14px 4px rgba(255,190,30,.75);
 animation:sqgpr 1.1s ease-in-out infinite}
#sqgpr::before,#sqgpr::after{content:'';position:absolute;top:50%;width:0;height:0;margin-top:-7px;border:7px solid transparent}
#sqgpr::before{left:-17px;border-left-color:#ffc020;filter:drop-shadow(0 0 1px #1c2440) drop-shadow(0 0 1px #1c2440)}
#sqgpr::after{right:-17px;border-right-color:#ffc020;filter:drop-shadow(0 0 1px #1c2440) drop-shadow(0 0 1px #1c2440)}
#sqgpr.sm::before,#sqgpr.sm::after{display:none}
@keyframes sqgpr{0%,100%{border-color:#ffc020;box-shadow:0 0 0 2px #1c2440,inset 0 0 0 2px #1c2440,0 0 10px 3px rgba(255,190,30,.6)}
 50%{border-color:#fff27a;box-shadow:0 0 0 2px #1c2440,inset 0 0 0 2px #1c2440,0 0 20px 7px rgba(255,214,60,.9)}}
@media (prefers-reduced-motion:reduce){#sqgpr{animation:none}}
.gpf.gpf.gpf{filter:brightness(1.07)}`;document.head.appendChild(st);
 const R=document.createElement('div');R.id='sqgpr';document.body.appendChild(R);
 let last='';
 // hidden when something else (the Dev Suite, a popup) covers the highlighted button: test a few points inside it
 function covered(el,r){const pts=[[.5,.5],[.2,.5],[.8,.5],[.5,.25],[.5,.75]];for(const[fx,fy]of pts){const x=Math.min(innerWidth-1,Math.max(0,r.left+r.width*fx)),y=Math.min(innerHeight-1,Math.max(0,r.top+r.height*fy));
   const h=document.elementFromPoint(x,y);if(!h||h===el||el.contains(h)||h.contains(el))return false}return true}
 function tick(){try{const el=typeof GPF!=='undefined'?GPF:null,on=typeof GPON!=='undefined'&&GPON;
   let show=false;if(on&&el&&el.isConnected){const r=el.getBoundingClientRect();
    if(r.width>0&&r.height>0&&r.bottom>0&&r.right>0&&r.top<innerHeight&&r.left<innerWidth&&getComputedStyle(el).visibility!=='hidden'&&!covered(el,r)){
     const p=r.width<60||r.height<24?3:4,x=Math.round(r.left-p-1),y=Math.round(r.top-p-1),w=Math.round(r.width+2*p+2),h=Math.round(r.height+2*p+2),
      sm=r.width<300||r.left<24||innerWidth-r.right<24,k=x+','+y+','+w+','+h+','+sm;
     if(k!==last){last=k;R.style.transform='translate('+x+'px,'+y+'px)';R.style.width=w+'px';R.style.height=h+'px';R.classList.toggle('sm',sm)}show=true}}
   if(show!==(R.style.display==='block')){R.style.display=show?'block':'none';if(!show)last=''}}catch(e){}requestAnimationFrame(tick)}
 requestAnimationFrame(tick);window.SQGPRING=R})();
