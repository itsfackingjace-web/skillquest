// ---- 200. "N left" for Smith all / Make all ----
// 109 shows "N left" over your head while a timed action repeats, but "all" buttons (anvil/furnace, crafting goods and
// building pieces) asked sqDo for 999 and the count was hidden. The outermost smithAct/makeGood/makeBuild work out how
// many the materials allow, counted when sqDo is called (039's station wrapper has merged the nearby chests into inv by then) and sqDo keeps it as
// SQDO.tot; 109 shows tot - done (display only, the loop still runs until the materials run out).
(()=>{let ALLN=null;
 {const _s=sqDo;sqDo=function(kind,n,fn){const r=_s.apply(this,arguments);try{if(r&&n>=900&&ALLN&&SQDO&&SQDO.fn===fn){const c=can(ALLN);if(c>0){SQDO.tot=c;SQDO.allR=ALLN;SQDO.allD=SQDO.done|0}}}catch(e){self.SQERR&&SQERR(e,'192-1')}return r}}
 const can=r=>{if(!r||!r.c)return 0;let m=Infinity;for(const[a,b]of Object.entries(r.c))if(b>0)m=Math.min(m,Math.floor((inv[a]|0)/b));return m===Infinity?0:m};
 const wrap=(name,list)=>{const f=window[name];if(typeof f!=='function')return;window[name]=function(i,all){if(!all||window.SQDO_STEP)return f.apply(this,arguments);
   const L=list();ALLN=L&&L[i]||null;try{return f.apply(this,arguments)}finally{ALLN=null}}};
 // Nov 20 (Bear): ores given back while smelting made more than the count said, so it went on smelting at "0 left". The count is
 // worked out again after each one made: done + what the materials allow now.
 SQUPD.after('192 make-all count',()=>{const D=window.SQDO;if(!D||!D.allR||(D.done|0)===D.allD)return;D.allD=D.done|0;try{D.tot=D.allD+can(D.allR)}catch(e){self.SQERR&&SQERR(e,'192-2')}});
 wrap('smithAct',()=>SM);wrap('makeGood',()=>GOODS);wrap('makeBuild',()=>BREC)})();
