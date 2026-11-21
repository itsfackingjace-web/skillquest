// Nov 20 (Jace): Ace the Card Sharp in Hollow Village (sells the guide, opens the guide and the binder), looking at another player's
// cards from the player menu, your own collection published for others (and accepted by the database rules), Drop Cards on the
// leaderboard.
module.exports={name:'Card Sharp, viewing another player\'s cards, Drop Cards on the leaderboard',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);const out={},D=SQDROPCARD,B=SQBINDER;
  // Ace
  const n=NPCS.find(n=>n.kind==='cardsharp');P.x=n.x-18;P.y=n.y;face=[1,0];GLD=5;inv.dc_guide=0;inv.dc_binder=0;await W(100);talk();await W(200);
  out.talk=[shop,ptab,(pbd.textContent||'').includes('Ace the Card Sharp')];
  pbd.querySelector('[data-dcs2="buy"]').click();await W(150);out.buy=[GLD,inv.dc_guide|0,inv.dc_binder|0,B.decks[0].n];
  pbd.querySelector('[data-dcs2="how"]').click();await W(150);out.how=[ptab,B.V.tab];closePanel();await W(100);
  // my collection, published and on the leaderboard
  inv.dc_slime=2;inv.dc_wb_dragon_sh=1;const ok=await SQCARDSHARE.publish(true);await W(300);
  const mine=(window.__db.T.cards||{})[SQMP.user.uid];out.pub=[ok,mine&&mine.n,mine&&mine.v];
  const row={};for(const f of SQLBX)f(row);out.lb=row.dc;
  // another player's cards, from the player menu
  window.__remote('cards/other1',{v:'dc_bat:3:1,dc_oak:1:0',n:2,t:Date.now()});
  const h=SQPMX.map(f=>f('other1')).join('');out.btn=/DROP CARDS/.test(h);
  showScreen('bag');await W(100);pbd.insertAdjacentHTML('beforeend',h);pbd.querySelector('[data-dcpm="other1"]').click();await W(500);
  out.peek=[ptab,ptt.textContent,(pbd.querySelector('.dcb-sub')||{}).textContent,!!pbd.querySelector('[data-dcb="s:dc_bat"] .dcb-sh'),!pbd.querySelector('[data-dcb="t:deck"]')];
  pbd.querySelector('[data-dcb="unpeek"]').click();await W(100);out.back=(pbd.querySelector('.dcb-sub')||{}).textContent;closePanel();
  // Nov 21: a peek shut without closePanel (walking off) used to stay in your own binder until a restart
  SQBINDER.peek('Link',{dc_bat:1},{});await W(100);pnOpen=false;pn.style.display='none';SQBINDER.open('col');await W(100);out.own=[ptt.textContent,!!pbd.querySelector('[data-dcb="unpeek"]')];closePanel();
  // the Leaderboard category
  out.cat=!!(window.SQLB);return out});
 t.eq(r.talk,['cardsharp',2,true],'talking to Ace');t.eq(r.buy,[4,1,1,'Starter Deck'],'buying the guide from Ace (gold, guide, binder, starter deck)');
 t.eq(r.how,[52,'guide'],'"How do I play?" opens the guide');
 t.eq(r.pub,[true,2,'dc_slime:2:0,dc_wb_dragon:0:1'],'published collection');t.eq(r.lb,2,'leaderboard Drop Cards count');
 t(r.btn,'no DROP CARDS button in the player menu');
 t.eq(r.own,['Card Binder',false],'your own binder after looking at someone else\'s');t.eq(r.peek,[52,"Player's cards",'Player has found 2 of 57 cards.',true,true],'looking at another player\'s cards');
 t(/You.ve found/.test(r.back||''),'back to my binder: '+r.back)}};
