// ---- Section 294: the PvP ON badge is a HUD chip (Nov 26, Amethyst's report) ----
// "PVP on covers whatever active quest you're doing": 064's badge was a fixed box at 236 px from the top, which landed on the quest box
// on some phones. It's now the last chip in 010's chip row under the quest box (arrows, bait, RUN, ULT), so it never covers the quest
// and whatever 010's stackBottom places below the stack (party list, boss bar) moves down with it. 064 keeps the words in SQPVBADGE.
(()=>{const _hl=hudLayout;hudLayout=function(){const L=_hl.apply(this,arguments);try{const t=window.SQPVBADGE;
  if(t&&L&&L.chips&&!L.chips.some(c=>c[0]==='pvp')){if(!L.chips.length)L.stackBottom=L.cy+22*L.U;L.chips.push(['pvp',t])}}catch(e){self.SQERR&&SQERR(e,'294-1')}return L}})();
