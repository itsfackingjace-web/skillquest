// ---- 155. Chests: DEPOSIT BAG ----
// One button on the chest screen (011's chestHTML) puts everything in your bag into the chest (not other chests). Your own
// chests take it all at once and save once; a friend's shared chest (072, CHEST_H._sh) goes item by item through its
// database transaction (chestMove), like moving them one at a time.
(()=>{const chest=()=>{const s=CHEST_H||STR.get(CHEST_AT);return s&&s.t==='chest'&&s.items?s:null};
 const bagKeys=()=>BAG_ORDER().filter(k=>(inv[k]|0)>0&&k!=='chest');
 function depositBag(){const s=chest();if(!s)return;if(s._sh&&!s.ok){say('The chest is still opening...');return}const ks=bagKeys();if(!ks.length){say('Your bag is empty.');return}
  let n=0;for(const k of ks)n+=inv[k]|0;
  if(s._sh){for(const k of ks)chestMove(k,'d')}
  else{for(const k of ks){s.items[k]=(s.items[k]|0)+(inv[k]|0);inv[k]=0}try{sfx('pickup')}catch(e){}saveLocal(true);try{saveCloud(true)}catch(e){}}
  CHCARD=null;say('Put '+n+' item'+(n===1?'':'s')+' from your bag into the chest.');rPn()}
 {const _h=chestHTML;chestHTML=function(){const h=_h.apply(this,arguments),mark='<div class="tl" style="margin-top:12px">YOUR BAG</div>';if(!chest()||h.indexOf(mark)<0)return h;
   const btn='<div class="tl" style="margin-top:12px;display:flex;align-items:center;justify-content:space-between;gap:8px">YOUR BAG'+(bagKeys().length?'<button class="sb chdep" style="width:auto;margin:0;padding:6px 12px;font-size:13px">DEPOSIT BAG</button>':'')+'</div>';
   return h.replace(mark,btn)}}
 pbd.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.chdep');if(!b||ptab!==7)return;e.stopPropagation();e.preventDefault();depositBag()},true);
 window.SQDEPOSIT=depositBag})();
