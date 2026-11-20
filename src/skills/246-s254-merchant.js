// ---- 254. Merchant: a skill trained by selling on the World Market (window.SQMERCH) ----
// #ideas (approved Nov 20): "what if every sale a player made on the market awarded Merchant XP?" A skill that only grows by taking
// part in the player economy. Added after Brewing (218) so no other skill's place in the save's XP list moves.
// XP per sale (079 calls sale(k, units, price)): units x min(price, 3 x the item's shop value) / 6, at least 1. The shop-value cap
// stops trading junk to a friend at a silly price from paying off. 079 gives it when you sell to a buyer's offer yourself, and when
// you COLLECT gold from your market box (gold deliveries now carry the item `i` and units `m`).
// Perks: one more market offer slot every 20 levels (8, up to 12 at 80+): slots().
(()=>{SKN.push('Merchant');AB.push('MERCH');SKC.push('#e8b830');while(XPS.length<SKN.length)XPS.push(0);try{SKICON.push('gbar')}catch(e){self.SQERR&&SQERR(e,'246-1')}
 const MI=SKN.length-1;
 const lv=()=>{try{return lvOf(MI)}catch(e){return 1}};
 function xpFor(k,m,price){const v=Math.max(1,+(SELLP&&SELLP[k])||1),p=Math.max(0,Math.min(+price||0,3*v));return Math.max(1,Math.round((m|0)*p/6))}
 function sale(k,m,price){if(!(m>0))return 0;const x=Math.min(50000,xpFor(k,m,price));try{addXp(MI,x)}catch(e){self.SQERR&&SQERR(e,'246-2')}return x}
 const slots=()=>8+Math.min(4,Math.floor(lv()/20));
 // the skills screen and wiki describe it like the others
 try{if(typeof SKDESC!=='undefined')SKDESC[MI]='Sell things on the World Market (Hollow Village) to other players. Every sale gives XP. Every 20 levels gives you one more market offer slot (up to 12).'}catch(e){self.SQERR&&SQERR(e,'246-3')}
 window.SQMERCH={MI,sale,slots,xpFor}})();
