// ---- 146. Mithril and adamant axes and pickaxes ----
// Tool tiers 6 (mithril) and 7 (adamant), the same tier numbers (and colours, TCOL) as the mithril and adamant swords.
// A tool's tier is how hard each chop or swing hits (1 + tier) and what trees / veins it can work (083's TIER), so these
// cut and mine faster than steel (tier 4). Forged at an anvil from mithril / adamant bars; they go in the bag and need
// Woodcutting / Mining 30 (mithril) or 45 (adamant) to equip.
(()=>{const T={6:{n:'Mithril',col:'#7888e0',v:320,bar:'mbar',sm:52,xp:260,lv:30},7:{n:'Adamant',col:'#48b060',v:640,bar:'abar',sm:67,xp:400,lv:45}};
 TIT[6]=TIT[6]||'Mithril';TIT[7]=TIT[7]||'Adamant';
 const add=(k,e,d)=>{EQ[k]=e;if(!EQK.includes(k))EQK.push(k);if(!INVK.includes(k))INVK.push(k);if(!EXTRA_BAG.includes(k))EXTRA_BAG.push(k);INAME[k]=e.n;SELLP[k]=e.v;SN[k]=e.n+'s';try{SHORT[k]=e.n.toLowerCase()}catch(x){}IDESC[k]=d};
 for(const t of[6,7]){const M=T[t];
  add('eq_axe'+t,{slot:'axe',tier:t,n:M.n+' axe',ic:'axe',col:M.col,v:M.v,req:{s:1,l:M.lv}},(t===7?'An ':'A ')+M.n.toLowerCase()+' axe: each chop hits for '+(1+t)+' (steel: 5), so trees come down fast. Needs Woodcutting '+M.lv+'.');
  add('eq_pick'+t,{slot:'pick',tier:t,n:M.n+' pickaxe',ic:'pick',col:M.col,v:M.v,req:{s:2,l:M.lv}},(t===7?'An ':'A ')+M.n.toLowerCase()+' pickaxe: each swing hits for '+(1+t)+' (steel: 5), so rocks and veins break fast. Needs Mining '+M.lv+'.');
  SM.push({k:'eq_axe'+t,n:M.n+' axe',c:{[M.bar]:2,wood:1},lv:M.sm,xp:M.xp},{k:'eq_pick'+t,n:M.n+' pickaxe',c:{[M.bar]:2,wood:1},lv:M.sm,xp:M.xp})}
 // the skill needed to use them
 const _eq=equipItem;equipItem=function(k){const e=EQ[k];if(e&&e.req&&(inv[k]|0)>0&&lvOf(e.req.s)<e.req.l){say('You need '+SKN[e.req.s]+' '+e.req.l+' to use the '+e.n.toLowerCase()+'.');try{sfx('swish')}catch(x){}return}return _eq.apply(this,arguments)};
 window.SQTOOLS67=T})();
