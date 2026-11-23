// ---- 281. Arrows and bows are smithed, the ranger set is crafted (smithing overhaul, step 1) ----
// Nov 23 (Jace): "all arrows and bows should be smithing items, not fletching items" and the ranger set "moves to Crafting".
//   - every arrow and bow in 021's FREC (arrow, bow1, iarrow, bow2, 224's mitharrow/adarrow, 216's marrow) moves to the anvil (SM)
//     with the same level, materials and XP, now Smithing. Arrows come 10/15/25 at a time (007's smithAct reads r.q / r.pl).
//     The bows are now items in your bag (eq_bow1/eq_bow2, equip them like the mithril bow) instead of being equipped straight away.
//   - the ranger hood/chaps/vest move from FREC to GOODS (Craft menu and crafting bench), same levels and XP, now Crafting.
//   - FREC ends up empty, so the Craft tab's "Arrows & bows" section only says where they went.
//   - the Archery tree no longer says "Make ..." (its 1/15/20 lines were about fletching).
// Iron axes and pickaxes leaving the Craft menu is in 004 (REC). window.SQRECMOVE = {Q, moved}.
(()=>{if(typeof FREC==='undefined'||typeof SM==='undefined')return;
 const Q={arrow:[10,'arrows'],iarrow:[10,'iron arrows'],mitharrow:[15,'mithril arrows'],adarrow:[15,'adamant arrows'],marrow:[25,'meteorite arrows']};
 const BOW={bow1:'eq_bow1',bow2:'eq_bow2'},RANGER=['eq_rhelm','eq_rlegs','eq_rbody'];
 const moved=[];
 // the anvil: bows, then arrows from wood to meteorite (the order FREC had them in)
 for(const r of FREC.slice()){const k=BOW[r.k]||r.k;if(!(BOW[r.k]||Q[r.k]))continue;
  const e={k,n:BOW[r.k]?(INAME[k]||r.n):r.n,c:Object.assign({},r.c),lv:r.lv,xp:r.xp};if(Q[r.k]){e.q=Q[r.k][0];e.pl=Q[r.k][1]}
  if(!SM.some(s=>s.k===k&&s.q===e.q))SM.push(e);moved.push(r.k)}
 // the Craft menu / crafting bench: the ranger set
 for(const r of FREC.slice()){if(!RANGER.includes(r.k))continue;if(!GOODS.some(g=>g.k===r.k))GOODS.push({k:r.k,n:r.n,c:Object.assign({},r.c),req:r.lv,xp:r.xp,v:SELLP[r.k]|0});moved.push(r.k)}
 for(let i=FREC.length-1;i>=0;i--)if(moved.includes(FREC[i].k))FREC.splice(i,1);
 try{if(typeof SQCRAFTPRICE==='function')SQCRAFTPRICE()}catch(e){self.SQERR&&SQERR(e,'273-1')}
 // the Craft tab: where arrows and bows went
 {const _fh=fletchHTML;fletchHTML=function(){if(FREC.some(r=>!(r.hide&&r.hide())))return _fh.apply(this,arguments);
   return'<div class="tl" style="margin-top:18px">Arrows &amp; bows</div><div class="tl" style="font-size:12px;font-weight:400;opacity:.7;margin-top:-6px">Arrows and bows are made at an anvil (Smithing). The ranger set is under Goods (Crafting).</div>'}}
 // the Archery tree: shooting, not making
 try{const X=TREES[FL]&&TREES[FL].extra;if(X){X[1]='Shoot with any bow (bows and arrows are made at an anvil with Smithing)';delete X[15];delete X[20]}}catch(e){self.SQERR&&SQERR(e,'273-2')}
 window.SQRECMOVE={Q,moved};
})();
