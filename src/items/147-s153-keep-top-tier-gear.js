// ---- 153. Top-tier gear survives loading ----
// 020's applySave clamps the sword, axe and pickaxe tiers to 4 (steel, the best there was then). Later sections put
// back what they added (035: sword 5, 084: swords 6/7) but nothing put back the Warlord's blade (sword 8, 100) or the
// mithril/adamant axes and pickaxes (6/7, 141): loading a save with one of them in hand turned it into a steel one.
// This restores any tier the game has an item for (eq_<slot><tier>) from the save's tl, after all the clamps.
// Saves made before this (no `tfx`) get one-time help: an item from that list that is in the collection log (129's
// ach.col) but nowhere in the save (bag, chests, houses, yards, builds) and not in hand goes back into the bag.
(()=>{const SL=['sword','axe','pick'],LOST=['eq_sword8','eq_axe6','eq_axe7','eq_pick6','eq_pick7'];let back=[];
 {const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);back=[];try{
   for(const k of SL){const v=+(S&&S.tl&&S.tl[k])|0;if(v>4&&EQ['eq_'+k+v]&&TL[k]!==v&&!(k==='sword'&&window.SLEDGE))TL[k]=v}
   if(S&&!S.tfx&&S.ach&&Array.isArray(S.ach.col)){const js=JSON.stringify(Object.assign({},S,{ach:null,rare:null}));
    for(const key of LOST){if(!S.ach.col.includes(key))continue;const e=EQ[key];if(!e)continue;
     const sl=e.slot==='main'?'sword':e.slot,inHand=TL[sl]===e.tier,anywhere=new RegExp('"'+key+'"\\s*[:,]\\s*"?[1-9]').test(js)||(inv[key]|0)>0;
     if(!inHand&&!anywhere){inv[key]=(inv[key]|0)+1;back.push(key)}}}
   if(typeof snapEq==='function')snapEq()}catch(e){console.warn(e)}return out}}
 {const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);s.tfx=1;return s}}
 // tell the player once play is running (upd only runs in play)
 let wait=0;{const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);if(back.length&&!menuOpen&&!pnOpen&&!dead&&(wait+=dt)>1.5){wait=0;
   const n=back.map(k=>INAME[k]).join(', ');back=[];say('Sorry about that! A bug swapped your '+n+' for a steel one. It\'s back in your Bag.');msgT=8;try{saveLocal(true)}catch(e){}}return out}}
 window.SQTFX={LOST}})();
