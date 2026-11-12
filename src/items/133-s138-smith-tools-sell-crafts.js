// ---- 138. Smith your own tools, and sell anything you craft ----
// The anvil now forges iron and steel axes and pickaxes (they go in your bag; equip them like any tool). The fishing rod
// is in the Craft menu (section 4). Everything you can build or craft has a price at the general store: pieces with no
// price of their own are worth a share of what went into them.
(()=>{
 SM.push({k:'eq_axe3',n:'Iron axe',c:{ibar:2,wood:1},lv:5,xp:60},{k:'eq_pick3',n:'Iron pickaxe',c:{ibar:2,wood:1},lv:5,xp:60},
  {k:'eq_axe4',n:'Steel axe',c:{sbar:2,wood:1},lv:25,xp:140},{k:'eq_pick4',n:'Steel pickaxe',c:{sbar:2,wood:1},lv:25,xp:140});
 const worth=c=>{let v=0;for(const k in c)v+=(SELLP[k]|0)*c[k];return Math.max(1,Math.round(v*.6))};
 const price=()=>{for(const r of[...BREC,...GOODS,...SM])try{const k=r.k;if(k&&INAME[k]&&!(SELLP[k]>0))SELLP[k]=worth(r.c||{})}catch(e){}};
 price();setTimeout(price,0);window.SQCRAFTPRICE=price})();
