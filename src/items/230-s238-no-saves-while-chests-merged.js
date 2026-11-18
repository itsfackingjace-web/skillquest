// ---- No saves of borrowed chest items (Nov 18) ----
// Crafting benches, furnaces, anvils and stoves (027/033) and timed jobs (109's sqMerge) add every chest's contents in the
// house to the bag while a step runs (BMERGE) and put back what wasn't used afterwards (benchSplit). Anything that saved
// during that time wrote the bag WITH the chest contents while the chests still held them: 007's smithAct calls
// saveLocal(true) on every anvil step, so smithing at home left a save holding every house chest twice. Loading it (the
// next session, or the account save picking up a newer device save) doubled the chests' contents into the bag.
// The outermost snap now splits the merge for the snapshot and merges again afterwards, so a save never holds borrowed items.
(()=>{if(typeof snap!=='function'||typeof benchSplit!=='function')return;
 const merge=chests=>{const tot={};for(const c of chests)for(const k in c)if(c[k]>0)tot[k]=(tot[k]||0)+c[k];
  const bag={};for(const k in tot){bag[k]=inv[k]|0;inv[k]=bag[k]+tot[k]}BMERGE={chests,tot,bag}};
 const _s=snap;snap=function(){const M=typeof BMERGE!=='undefined'?BMERGE:null;if(!M)return _s.apply(this,arguments);
  benchSplit();try{return _s.apply(this,arguments)}finally{merge(M.chests)}};
 window.SQMERGESAFE=true;
})();
