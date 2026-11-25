// ---- 256. Hold HIT on a touch screen to keep swinging (window.SQHOLDHIT) ----
// Nov 19 chat: "Can't hold on mobile". Holding Space (key repeat) or R2 (023) keeps chopping, mining and fighting, but the touch HIT
// button (004) only swung once per tap. Now, like R2: after holding it 0.35 s, it swings again whenever the last swing is done
// (not while fishing, building, or with a screen open). Lifting the finger, or sliding it off the button, stops.
(()=>{let HOLD=null;// {id: touch identifier, t: seconds held}
 const onA=t=>{const el=document.getElementById('a');if(!el||!t)return false;const r=el.getBoundingClientRect();return r.width>0&&t.clientX>=r.left-8&&t.clientX<=r.right+8&&t.clientY>=r.top-8&&t.clientY<=r.bottom+8};
 addEventListener('touchstart',e=>{const el=e.target&&e.target.closest&&e.target.closest('#a');if(!el)return;const t=e.changedTouches&&e.changedTouches[0];if(t)HOLD={id:t.identifier,t:0}},{capture:true,passive:true});
 const end=e=>{if(!HOLD)return;for(const t of e.changedTouches||[])if(t.identifier===HOLD.id){HOLD=null;return}};
 addEventListener('touchend',end,{capture:true,passive:true});addEventListener('touchcancel',end,{capture:true,passive:true});
 addEventListener('touchmove',e=>{if(!HOLD)return;for(const t of e.changedTouches||[])if(t.identifier===HOLD.id&&!onA(t)){HOLD=null;break}},{capture:true,passive:true});/* Nov 25 (errs 'uncaught' "reading 'id'"): with two fingers moving, the loop went on to the next one after HOLD was cleared */
 let N=0;
 SQUPD.after('248 hold HIT on touch',dt=>{if(!HOLD)return;if(dead||pnOpen||menuOpen){HOLD=null;return}HOLD.t+=dt;
  if(HOLD.t>.35&&swing<=0&&!FISH&&!BUILD){N++;try{attack()}catch(e){self.SQERR&&SQERR(e,'248-1')}}});
 window.SQHOLDHIT={get held(){return!!HOLD},get swings(){return N}}})();
