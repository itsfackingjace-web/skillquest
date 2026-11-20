// ---- 211. Other players see your arrows again ----
// 064 sends arrows to other players (fx 'ar') from its `shoot` wrapper, but since bows became off-hand weapons every shot goes
// through `shootAim` (X / right-click, controller R1, the touch BOW button), which pushes into PROJ itself and never calls `shoot`.
// So nobody saw you shoot, and arrows couldn't hit players in duels or PvP (receivers check 'ar' events against themselves).
// The outermost `shootAim` now sends the same event for every arrow it added (multishot extras from 037 included).
(()=>{const r2=v=>Math.round(v*100)/100;
 const _sa=shootAim;shootAim=function(first){const n0=PROJ.length,out=_sa.apply(this,arguments);
  try{const a=PROJ.slice(n0).filter(p=>p&&p.k==='arrow'&&!p.hostile).map(p=>[Math.round(p.x),Math.round(p.y),Math.round(p.vx),Math.round(p.vy),r2(p.life),p.iron?1:0]);
   if(a.length&&window.SQPVSEND)SQPVSEND({k:'ar',a})}catch(e){self.SQERR&&SQERR(e,'203-1')}
  return out};
})();
