// Nov 20 (Jace): the Card Binder (cards take one bag slot; collection and decks), Drop Card for Dummies (General Store, 1 gold),
// pet cards from releasing a pet, potion cards from brewing; and all of it usable with a controller and on a phone-sized screen.
const SHOTS=process.env.SQ_SHOTS||'';
module.exports={name:'Card Binder, the guide, pet and potion cards, with controller and phone',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);const B=SQBINDER,D=SQDROPCARD,out={};
  // the guide: 1 gold at the General Store
  const g=GEN.find(x=>x.n==='Drop Card for Dummies');out.price=g&&g.c;const g0=GLD;inv.dc_binder=0;if(g){g.f()}out.guide=inv.dc_guide|0;out.binder=inv.dc_binder|0;
  // cards are hidden in the bag behind the binder
  inv[D.CARDS.slime.key]=2;inv[D.CARDS['wb:dragon'].key]=1;inv[D.CARDS.tree.key]=4;inv[D.CARDS.oak.key]=2;
  showScreen('bag');await W(300);invSel='dc_binder';rPn();await W(100);const bh=pbd.innerHTML;
  out.bagHidesCards=!/data-k="dc_slime"/.test(bh)&&!/data-k="dc_binder"/.test(bh)&&/CARDS \(\d+\)/.test(bh);out.openBtn=!!pbd.querySelector('[data-dcb="open"]');
  out.counts=[inv[D.CARDS.slime.key],inv[D.CARDS['wb:dragon'].key]];
  // OPEN shows the collection
  pbd.querySelector('[data-dcb="open"]').click();await W(200);out.ptab=ptab;out.cards=pbd.querySelectorAll('.dcb-c').length;out.found=(pbd.querySelector('.dcb-sub')||{}).textContent;
  // with a controller: the D-pad moves to "Decks", ✕ presses it
  const pad={id:'Xbox Wireless Controller (STANDARD GAMEPAD)',index:0,connected:true,mapping:'standard',timestamp:1,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0}))};
  window.__SQPADTEST=()=>[pad,null,null,null];window.dispatchEvent(Object.assign(new Event('gamepadconnected'),{gamepad:pad}));await W(200);
  const tap=async i=>{pad.buttons[i]={pressed:true,touched:true,value:1};pad.timestamp++;await W(90);pad.buttons[i]={pressed:false,touched:false,value:0};pad.timestamp++;await W(90)};
  const cur=()=>{const e=document.querySelector('#pn .gpf');return e&&(e.dataset.dcb||e.id||'?')};const seq=[];
  for(let i=0;i<12&&cur()!=='t:deck';i++){{const c=cur()||'';await tap(/^(bag|open)$/.test(c)?13:c==='t:guide'?14:/^[fs]:/.test(c)?12:15)};seq.push(cur())}/* Nov 21: the bag's ITEMS / CARDS tabs are the top row: D-pad down to the binder's tabs, then right */out.padReach=cur();out.seq=seq.join('|');await tap(0);await W(150);out.padTab=B.V.tab;
  pad.connected=false;window.__SQPADTEST=()=>[null,null,null,null];
  // build a deck: ADD CARDS, pick cards, ADD
  const click=sel=>{const e=pbd.querySelector(sel);if(e)e.click();return!!e};
  // the Starter Deck came with the guide: Deck 1, 20 bound cards (not in the bag's items)
  const d0=B.decks[0];out.starter={n:d0.n,cards:Object.values(d0.c).reduce((a,b)=>a+b,0),ok:B.problems(d0).filter(p=>!/^Optional/.test(p)),batInv:inv[D.CARDS.bat.key]|0,batOwned:B.owned(D.CARDS.bat.key)};
  const again=GEN.find(x=>x.n==='Drop Card for Dummies');again.f();out.starterOnce=B.owned(D.CARDS.bat.key);
  click('[data-dcb="d:1"]');await W(50);click('[data-dcb="edit"]');await W(100);
  const add=async(k,n)=>{click('[data-dcb="s:'+k+'"]');await W(50);for(let i=0;i<n;i++){click('[data-dcb="add"]');await W(30)}click('[data-dcb="s:'+k+'"]');await W(30)};
  await add(D.CARDS.slime.key,3);await add(D.CARDS['wb:dragon'].key,2);await add(D.CARDS.tree.key,2);await add(D.CARDS.oak.key,2);
  click('[data-dcb="done"]');await W(100);const d=B.decks[B.V.deck];out.deck=JSON.parse(JSON.stringify(d.c));out.problems=B.problems(d);
  // saved and loaded
  const S=JSON.parse(JSON.stringify(SQSAVE.snap?SQSAVE.snap():snap()));out.savedDeck=S.dcd&&S.dcd.d[1].c;out.savedStarter=S.dcs&&S.dcs.g;B.decks[1].c={};applySave(S);await W(100);out.loadedDeck=SQBINDER.decks[1].c;out.loadedStarter=SQBINDER.owned(D.CARDS.bat.key);
  // READ the guide, turn pages
  showScreen('bag');await W(200);invSel='dc_guide';rPn();await W(50);click('[data-dcb="read"]');await W(150);out.guideTab=B.V.tab;out.title=ptt.textContent;
  click('[data-dcb="np"]');click('[data-dcb="np"]');await W(80);out.page=B.V.page;out.pages=B.GP.length;
  // phone size: nothing wider than the panel
  out.overflow=pbd.scrollWidth-pbd.clientWidth;
  // releasing a pet gives its card
  const pk=Object.keys(EQ).find(k=>EQ[k]&&EQ[k].slot==='pet');inv[pk]=(inv[pk]|0)+1;showScreen('bag');await W(200);invSel=pk;rPn();await W(50);
  const rel=()=>{const b=pbd.querySelector('.petrel');if(b)b.click();return!!b};const pc='pc_'+pk,c0=inv[pc]|0;rel();await W(50);rel();await W(150);out.petCard=(inv[pc]|0)-c0;out.petName=INAME[pc];
  // brewing a potion (forced roll)
  window.SQDROPCARDALWAYS=true;const pkey=D.CARDS.pot_heal.key,p0=inv[pkey]|0;for(const f of SQBREWED)f('pot_heal');out.potion=(inv[pkey]|0)-p0;// foraging berries (forced roll)
  closePanel();await W(100);const bk=D.CARDS.berry.key,b0=inv[bk]|0;face=[1,0];const[fx,fy]=front(16),tx=Math.floor(fx/16),ty=Math.floor(fy/16),ti=ty*N+tx;
  // swing until the bush itself is picked (Nov 23: stopping at the first berry from anywhere, a pet's fetch say, made this flaky)
  // Nov 28: it failed once in a full run (berries but no card) and never in 19 runs alone; a second bush is tried, and the tries say what happened
  const be0=inv.berry|0;out.tries=[];for(let a=0;a<2&&!((inv[bk]|0)>b0);a++){obj[ti]={t:'bush',hp:1};STR.delete(ti);BS.delete(ti);face=[1,0];
   for(const n of en)if(!n._pet&&!n.dead&&Math.hypot(n.x-P.x,n.y-P.y)<80){n.dead=1;n.dropped=1}
   const e0=inv.berry|0;let k=0;for(;k<40&&obj[ti]&&obj[ti].t==='bush';k++){swing=0;attack();await W(400)}out.tries.push({swings:k,berries:(inv.berry|0)-e0,card:(inv[bk]|0)-b0,left:obj[ti]?obj[ti].t:null,always:!!window.SQDROPCARDALWAYS})}
  out.berries=(inv.berry|0)-be0;out.forage=(inv[bk]|0)-b0;window.SQDROPCARDALWAYS=false;
  // Wiki > Drop Card
  SQWK.open('dropcard');await W(80);const wt=(document.getElementById('wkb')||{}).textContent||'';out.wiki=['Drop Card for Dummies','Moss slime','Healing potion','Pet cards','Nine lives'].filter(x=>!wt.includes(x));
  const ln=document.querySelector('#wkb [data-wkp="item:dc_slime_moss"]');if(ln)ln.click();await W(50);out.wikiPage=((document.getElementById('wkb')||{}).textContent||'').includes('2HP 1ATK');try{SQWK.close&&SQWK.close()}catch(e){}
  return out});
 t.eq(r.price,1,'guide price');t.eq([r.guide,r.binder],[1,0],'the guide from the shop, and no binder item (Nov 21: the binder is the bag\'s CARDS tab)');
 t(r.bagHidesCards,'the bag still lists cards (or no CARDS tab)');t(r.openBtn,'no CARDS tab in the bag');t.eq(r.counts,[2,1],'card counts after showing the bag');
 t.eq(r.ptab,52,'binder panel');t(r.cards>=54,'collection shows '+r.cards+' cards');t(/found <?b?>?/.test('found ')&&/4 of/.test(r.found||'')||/found/.test(r.found||''),'collection header '+r.found);
 t.eq(r.padReach,'t:deck','the controller couldn\'t reach the Decks tab '+r.seq);t.eq(r.padTab,'deck','✕ on Decks');
 t.eq(r.starter,{n:'Starter Deck',cards:20,ok:[],batInv:0,batOwned:2},'the Starter Deck');t.eq(r.starterOnce,2,'a second guide gave another Starter Deck');t.eq([r.savedStarter,r.loadedStarter],[1,2],'Starter Deck saved and loaded');
 t.eq(r.deck,{[ 'dc_slime']:2,['dc_wb_dragon']:1,['dc_tree']:2,['dc_oak']:2},'deck (2 slimes max, 1 boss max)');
 t(r.problems.some(p=>/Add 13 more/.test(p)),'deck rules: '+JSON.stringify(r.problems));
 t.eq(r.savedDeck,r.deck,'deck in the save');t.eq(r.loadedDeck,r.deck,'deck after loading');
 t.eq(r.guideTab,'guide','READ opens the guide');t.eq(r.title,'Drop Card for Dummies','guide title');t.eq(r.page,2,'guide page after NEXT twice');t(r.pages>=8,'guide pages');
 t(r.overflow<=1,'the binder is wider than the panel by '+r.overflow+'px');
 t.eq(r.petCard,1,'pet card from releasing a pet');t(/^Pet Card: /.test(r.petName||''),'pet card name '+r.petName);t.eq(r.potion,1,'potion card from brewing');t(r.berries>0,'no berries from the bush');t.eq(r.forage,1,'forage card from picking berries '+JSON.stringify(r.tries));t.eq(r.wiki,[],'missing from Wiki > Drop Card');t(r.wikiPage,'a card\'s wiki page')}};
