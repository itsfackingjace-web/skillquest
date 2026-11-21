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
  out.bagHidesCards=!/data-k="dc_slime"/.test(bh)&&/data-k="dc_binder"/.test(bh);out.openBtn=!!pbd.querySelector('[data-dcb="open"]');
  out.counts=[inv[D.CARDS.slime.key],inv[D.CARDS['wb:dragon'].key]];
  // OPEN shows the collection
  pbd.querySelector('[data-dcb="open"]').click();await W(200);out.ptab=ptab;out.cards=pbd.querySelectorAll('.dcb-c').length;out.found=(pbd.querySelector('.dcb-sub')||{}).textContent;
  // with a controller: the D-pad moves to "Decks", ✕ presses it
  const pad={id:'Xbox Wireless Controller (STANDARD GAMEPAD)',index:0,connected:true,mapping:'standard',timestamp:1,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0}))};
  window.__SQPADTEST=()=>[pad,null,null,null];window.dispatchEvent(Object.assign(new Event('gamepadconnected'),{gamepad:pad}));await W(200);
  const tap=async i=>{pad.buttons[i]={pressed:true,touched:true,value:1};pad.timestamp++;await W(90);pad.buttons[i]={pressed:false,touched:false,value:0};pad.timestamp++;await W(90)};
  const cur=()=>{const e=document.querySelector('#pn .gpf');return e&&(e.dataset.dcb||e.id||'?')};const seq=[];
  for(let i=0;i<12&&cur()!=='t:deck';i++){await tap(15);seq.push(cur())}out.padReach=cur();out.seq=seq.join('|');await tap(0);await W(150);out.padTab=B.V.tab;
  pad.connected=false;window.__SQPADTEST=()=>[null,null,null,null];
  // build a deck: ADD CARDS, pick cards, ADD
  const click=sel=>{const e=pbd.querySelector(sel);if(e)e.click();return!!e};
  click('[data-dcb="edit"]');await W(100);
  const add=async(k,n)=>{click('[data-dcb="s:'+k+'"]');await W(50);for(let i=0;i<n;i++){click('[data-dcb="add"]');await W(30)}click('[data-dcb="s:'+k+'"]');await W(30)};
  await add(D.CARDS.slime.key,3);await add(D.CARDS['wb:dragon'].key,2);await add(D.CARDS.tree.key,2);await add(D.CARDS.oak.key,2);
  click('[data-dcb="done"]');await W(100);const d=B.decks[B.V.deck];out.deck=JSON.parse(JSON.stringify(d.c));out.problems=B.problems(d);
  // saved and loaded
  const S=JSON.parse(JSON.stringify(SQSAVE.snap?SQSAVE.snap():snap()));out.savedDeck=S.dcd&&S.dcd.d[0].c;B.decks[0].c={};applySave(S);await W(100);out.loadedDeck=SQBINDER.decks[0].c;
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
  closePanel();await W(100);const bk=D.CARDS.berry.key,b0=inv[bk]|0;face=[1,0];const[fx,fy]=front(16),tx=Math.floor(fx/16),ty=Math.floor(fy/16),ti=ty*N+tx;obj[ti]={t:'bush',hp:1};STR.delete(ti);BS.delete(ti);
  const be0=inv.berry|0;for(let k=0;k<25&&(inv.berry|0)===be0;k++){swing=0;attack();await W(400)}out.berries=(inv.berry|0)-be0;out.forage=(inv[bk]|0)-b0;window.SQDROPCARDALWAYS=false;
  return out});
 t.eq(r.price,1,'guide price');t.eq([r.guide,r.binder],[1,1],'guide and binder from the shop');
 t(r.bagHidesCards,'the bag still lists cards (or no binder)');t(r.openBtn,'no OPEN button on the binder');t.eq(r.counts,[2,1],'card counts after showing the bag');
 t.eq(r.ptab,52,'binder panel');t(r.cards>=54,'collection shows '+r.cards+' cards');t(/found <?b?>?/.test('found ')&&/4 of/.test(r.found||'')||/found/.test(r.found||''),'collection header '+r.found);
 t.eq(r.padReach,'t:deck','the controller couldn\'t reach the Decks tab '+r.seq);t.eq(r.padTab,'deck','✕ on Decks');
 t.eq(r.deck,{[ 'dc_slime']:2,['dc_wb_dragon']:1,['dc_tree']:2,['dc_oak']:2},'deck (2 slimes max, 1 boss max)');
 t(r.problems.some(p=>/Add 13 more/.test(p)),'deck rules: '+JSON.stringify(r.problems));
 t.eq(r.savedDeck,r.deck,'deck in the save');t.eq(r.loadedDeck,r.deck,'deck after loading');
 t.eq(r.guideTab,'guide','READ opens the guide');t.eq(r.title,'Drop Card for Dummies','guide title');t.eq(r.page,2,'guide page after NEXT twice');t(r.pages>=8,'guide pages');
 t(r.overflow<=1,'the binder is wider than the panel by '+r.overflow+'px');
 t.eq(r.petCard,1,'pet card from releasing a pet');t(/^Pet Card: /.test(r.petName||''),'pet card name '+r.petName);t.eq(r.potion,1,'potion card from brewing');t(r.berries>0,'no berries from the bush');t.eq(r.forage,1,'forage card from picking berries')}};
