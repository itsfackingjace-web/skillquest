// Nov 20: Drop Card matches against Ace. Starting from Ace's panel with the binder's deck, playing a turn with taps (plant, play,
// end turn), Ace answering, the controller moving between the table's buttons, a whole match to the end (gold + achievement), the
// engine's rules (Guard, costs, chop-to-pay) and leaving counting as a loss.
module.exports={name:'Drop Card matches against Ace',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);const out={},E=SQDCE,M=SQDCM,B=SQBINDER,D=SQDROPCARD;
  // a deck: the Starter Deck
  B.giveStarter();
  // from Ace's panel
  const n=NPCS.find(n=>n.kind==='cardsharp');P.x=n.x-18;P.y=n.y;face=[1,0];await W(100);talk();await W(200);
  out.levels=[...pbd.querySelectorAll('[data-dcmlv]')].map(b=>b.dataset.dcmlv);pbd.querySelector('[data-dcmlv="easy"]').click();await W(300);
  const el=M.el,q=s=>el.querySelector(s);out.open=el.style.display;
  const s=M.m.s;out.start=[s.p[0].hand.length,s.p[1].hand.length,s.p[1].hand.includes('_sapling'),s.cur];
  // the deal is random: make sure both hands hold a tree and yours a 1-cost monster (Nov 20: a deal without one failed the check)
  {const D2=SQDROPCARD.CARDS;s.p[0].hand[0]=D2.tree.key;s.p[0].hand[1]=D2.slime.key;s.p[1].hand[0]=D2.tree.key;M.render()}
  // tap a tree in hand, PLANT
  const ti=s.p[0].hand.findIndex(k=>k!=='_sapling'&&E.card(k).kind==='tree');q('[data-dcm="c:'+ti+'"]').click();await W(50);q('[data-dcm="play"]').click();await W(80);out.planted=s.p[0].grove.length;
  // tap a 1-cost monster if there is one, PLAY (pays by chopping)
  const mi=s.p[0].hand.findIndex(k=>k!=='_sapling'&&E.card(k).kind==='mon'&&E.card(k).cost<=1);if(mi>=0){q('[data-dcm="c:'+mi+'"]').click();await W(50);q('[data-dcm="play"]').click();await W(80)}out.board=s.p[0].board.length;out.stump=s.p[0].grove.some(g=>g.stump)||mi<0;
  // the controller: D-pad reaches END TURN, ✕ presses it
  const pad={id:'Xbox Wireless Controller (STANDARD GAMEPAD)',index:0,connected:true,mapping:'standard',timestamp:1,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0}))};
  window.__SQPADTEST=()=>[pad,null,null,null];window.dispatchEvent(Object.assign(new Event('gamepadconnected'),{gamepad:pad}));await W(200);
  const tap=async i=>{pad.buttons[i]={pressed:true,touched:true,value:1};pad.timestamp++;await W(90);pad.buttons[i]={pressed:false,touched:false,value:0};pad.timestamp++;await W(90)};
  const cur=()=>{const e=el.querySelector('.gpf');return e&&e.dataset.dcm};
  for(let i=0;i<30&&cur()!=='end';i++)await tap(15);out.padReach=cur();await tap(0);await W(200);out.afterEnd=s.cur;pad.connected=false;window.__SQPADTEST=()=>[null,null,null,null];
  // Ace plays its turn
  for(let i=0;i<60&&s.cur===1;i++)await W(200);out.aceDone=s.cur===0||s.over;out.aceGrove=s.p[1].grove.length;out.alog=s.log.slice(-8);
  // the rest of the match, played for you by Ace's own brain (normal)
  window.SQDCMFAST=true;const g0=GLD;for(let i=0;i<2000&&!s.over;i++){if(s.cur===0&&!M.m.busy){const mv=M.aceMove(s,0,'normal');if(!M.act(mv))M.act({t:'end'})}await W(30)}
  window.SQDCMFAST=false;out.over=s.over;out.win=s.win;out.gold=GLD-g0;out.msg=M.m.msg;try{SQACH.check()}catch(e){}out.ach=!!(SQACH.done||{}).dc_win;
  M.close();
  // rules: Guard, a cost, chopping
  const k=x=>D.CARDS[x].key;const st=E.create({seed:5,decks:[[k('tree')],[k('tree')]],pets:[null,null],names:['A','B']});
  st.p[0].hand=[k('wb:giant'),k('tree'),k('oak')];st.p[0].grove=[{key:k('willow'),n:'Willow',mana:3,stump:false},{key:k('maple'),n:'Maple',mana:4,stump:false}];
  out.cost=E.card(k('wb:giant')).cost;out.play=E.apply(st,0,{t:'play',h:0});out.chopped=st.p[0].grove.map(g=>g.stump);out.pool=st.p[0].pool;
  out.plant2=[E.apply(st,0,{t:'plant',h:0}),E.apply(st,0,{t:'plant',h:0})];
  E.apply(st,0,{t:'end'});st.p[1].board.push({uid:'zz',id2:'bat',n:'Bat',hp:1,max:1,atk:2,sleep:false,done:false,side:1});
  out.guard=E.apply(st,1,{t:'atk',a:'zz',tg:'h0'});out.guardOK=E.apply(st,1,{t:'atk',a:'zz',tg:st.p[0].board[0].uid});
  // Nov 21 (Jace): heroes have 30 HP, a Grove holds 6 trees (any Mana), decks are 20 to 60 cards
  {const s2=E.create({seed:9,decks:[Array(20).fill(k('tree')),Array(20).fill(k('tree'))],pets:[null,null],names:['A','B']});out.hp=[s2.p[0].hp,s2.p[1].hp];
   s2.p[0].grove=Array.from({length:5},()=>({key:k('yew'),n:'Yew',mana:5,stump:false}));s2.p[0].hand=[k('yew'),k('yew')];
   out.sixth=E.apply(s2,0,{t:'plant',h:0});s2.p[0].planted=false;out.seventh=E.apply(s2,0,{t:'plant',h:0});
   const own=n=>{const c={};c[k('tree')]=n;return SQBINDER.problems({n:'x',c,pet:null}).filter(p=>!/^Optional|^You only have/.test(p))};out.sizes=[own(19).length,own(20).length,own(45).length,own(60).length,own(61).length>0?1:0]}
  // leaving counts as a loss
  B.giveStarter();M.start('easy');await W(100);M.el.querySelector('[data-dcm="leave"]').click();await W(50);const armed=/again/.test(M.m.msg);M.el.querySelector('[data-dcm="leave"]').click();await W(50);out.left=[armed,M.m,M.el.style.display];
  return out});
 t.eq(r.levels,['easy','normal','hard'],'levels on Ace\'s panel');t.eq(r.open,'flex','the table didn\'t open');
 t.eq(r.start,[4,5,true,0],'opening hands (3 + your first draw; Ace 4 + the Sapling)');
 t.eq(r.planted,1,'planting a tree');t(r.stump,'playing a card didn\'t chop a tree');
 t.eq(r.padReach,'end','the controller couldn\'t reach END TURN');t.eq(r.afterEnd,1,'✕ on END TURN');t(r.aceDone,'Ace never finished its turn');t(r.aceGrove>=1,'Ace didn\'t plant '+JSON.stringify(r.alog));
 t(r.over,'the match never ended');t(r.win===0?r.gold===550&&r.ach:r.gold===0,'reward for result '+r.win+': '+r.gold+' gold, '+r.msg);
 t.eq(r.cost,7,'Stone Giant costs 7 (8 HP + 4 ATK, halved, +1 boss)');t.eq(r.play,'','playing it with 7 Mana of trees');t.eq(r.chopped,[true,true],'both trees chopped');t.eq(r.pool,0,'no Mana left');
 t.eq(r.plant2,['','You\'ve already planted a tree this turn.'],'one tree a turn');
 t.eq(r.guard,'A monster with Guard is in the way: attack it first.','Guard blocks hitting the hero');t.eq(r.guardOK,'','attacking the Guard monster');
 t.eq(r.hp,[30,30],'heroes start with 30 HP');t.eq([r.sixth,r.seventh],['','Your Grove is full (6 trees).'],'6 trees in a Grove, whatever their Mana');t.eq(r.sizes,[1,0,0,0,1],'decks of 20 to 60 cards');
 t.eq(r.left,[true,null,'none'],'leaving asks twice, then closes')}};
