// ---- 272. Items this game doesn't know are kept, never dropped (window.SQUNKNOWN) ----
// Nov 21 (Jace's cards and Card Binder vanished after playing on his phone): 006's loader reads only the keys in INVK, so a game
// that doesn't know an item (an older copy still open or cached on another device, or an item whose section hasn't registered it yet)
// dropped it on load, and its next save erased it from the account for every device. Now every unknown key in the save's bag is kept
// aside, written back into every save, and moved into the bag as soon as the item becomes known (a library update, a late section).
// Max, never add: 162 (it_), 234 (pet_np_) and 111a2 (new gear) keep their own items the same way, so a key in both is never doubled.
(()=>{const X={};
 SQLOAD.after('264 keep unknown items',(S)=>{for(const k in X)delete X[k];try{if(!S||!S.inv||typeof S.inv!=='object')return;
   for(const k in S.inv){const n=Math.min(1e9,Math.floor(+S.inv[k]||0));if(n>0&&!INVK.includes(k)&&/^[\w:.-]{1,80}$/.test(k))X[k]=n}}catch(e){self.SQERR&&SQERR(e,'264-1')}});
 SQSAVE.after('264:inv kept unknown items',s=>{if(!s||!s.inv)return;for(const k in X)if(!INVK.includes(k))s.inv[k]=Math.max(+s.inv[k]||0,X[k])});
 const adopt=()=>{for(const k in X)if(INVK.includes(k)){inv[k]=Math.max(inv[k]|0,X[k]);delete X[k]}};
 setInterval(()=>{try{adopt()}catch(e){self.SQERR&&SQERR(e,'264-2')}},3000);
 window.SQUNKNOWN={get kept(){return X},adopt}})();
