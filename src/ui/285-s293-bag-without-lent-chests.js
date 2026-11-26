// ---- Section 293: screens drawn during a step never show lent chest items (Nov 26, sniffynose's report) ----
// "when i go bag in house when cooking an scroll down it shows all items in chest an not in my bag": a stove, furnace or anvil job
// (109) lends the house chests to the bag for each step (BMERGE), and the step's own rPn() (022's stationAct, 039's wrapper) drew the
// open bag with them, jumping its scroll every step. Like 230 does for saves, every screen draw now puts the lent items back first
// and lends them again afterwards; the workstation screens still count your chests (033/027 lend them for their own draw).
(()=>{if(typeof benchSplit!=='function')return;
 const merge=chests=>{const tot={};for(const c of chests)for(const k in c)if(c[k]>0)tot[k]=(tot[k]||0)+c[k];
  const bag={};for(const k in tot){bag[k]=inv[k]|0;inv[k]=bag[k]+tot[k]}BMERGE={chests,tot,bag}};
 SQRPN.wrap('293 no lent chest items on screens',next=>function(){const M=typeof BMERGE!=='undefined'?BMERGE:null;if(!M)return next.apply(this,arguments);
  benchSplit();try{return next.apply(this,arguments)}finally{try{if(!BMERGE)merge(M.chests)}catch(e){self.SQERR&&SQERR(e,'293-1')}}});
})();
