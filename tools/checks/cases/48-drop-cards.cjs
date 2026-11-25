// Nov 20 (Jace): Drop Cards drop at 1% from every monster (its own card), trees (their kind) and world, dungeon, island and guild bosses.
// The check forces the roll (SQDROPCARDALWAYS) and goes through the real paths: enemyDrop, a chop, 071's and 100's reward hooks.
module.exports={name:'Drop Cards drop from monsters, trees and bosses',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);const D=SQDROPCARD,out={};
  // Nov 21: 1 card in 50 drops shiny (its own item <key>_sh): count both, or a shiny roll reads as "no card" (a third of runs failed somewhere)
  const cnt=key=>(inv[key]|0)+(inv[key+'_sh']|0),has=k=>cnt(D.CARDS[k].key);
  // the roll is 1%
  window.SQDROPCARDALWAYS=false;let n=0;for(let i=0;i<20000;i++)if(D.rawRoll())n++;out.rate=n/20000;window.SQDROPCARDALWAYS=true;
  // bad-luck protection: the 200th miss in a row gives a card; a save keeps the count
  window.SQDROPCARDALWAYS=false;D.pity=0;const _r=Math.random;Math.random=()=>.99;let first=0;for(let i=1;i<=200;i++)if(D.roll()){first=i;break}D.pity=57;const SP=JSON.parse(JSON.stringify(SQSAVE.snap?SQSAVE.snap():snap()));Math.random=_r;out.pity=[first,SP.dcp];
  window.SQDROPCARDALWAYS=true;
  // a monster: its own card, once per monster
  const m={x:P.x+40,y:P.y,hp:0,kx:0,ky:0,type:'slime',rv:'moss',rk:'slime:moss'};enemyDrop(m);enemyDrop(m);out.moss=has('slime:moss');
  // summons and world-boss copies don't drop through enemyDrop
  enemyDrop({x:0,y:0,hp:0,kx:0,ky:0,type:'wolf',summon:1});enemyDrop({x:0,y:0,hp:0,kx:0,ky:0,type:'giant',_wb:'giant'});out.wolf=has('wolf');
  // a dungeon boss
  enemyDrop({x:0,y:0,hp:0,kx:0,ky:0,type:'alpha',big:1});out.alpha=has('alpha');
  // world, island and guild bosses
  for(const f of SQWBWON)f({type:'dragon',slot:'x'});out.dragon=has('wb:dragon');
  for(const f of SQIBWON){f({ib:'briarwood'});f({ib:'gu_someguild'})}out.queen=has('ib:briarwood');out.turtle=has('turtle');
  // a tree: its kind's card
  const tk=D.CARDS.tree.key;const before=cnt(tk);
  face=[1,0];const[fx,fy]=front(16),tx=Math.floor(fx/16),ty=Math.floor(fy/16),i=ty*N+tx;obj[i]={t:'tree',hp:3};STR.delete(i);BS.delete(i);
  // Nov 21: a villager wandering into reach made HIT talk instead of chop (a shop screen opened and blocked every later swing)
  const clear=()=>{try{if(pnOpen)closePanel()}catch(e){}for(const n of NPCS)if(!n.scene&&Math.hypot(n.x-P.x,n.y-P.y)<90)n.x+=300};
  const w0=inv.wood|0;for(let k=0;k<25&&obj[i]&&obj[i].t==='tree';k++){clear();swing=0;attack();await W(450)}out.tree=cnt(tk)-before;out.w=[w0,inv.wood|0];/* Nov 24 evening (287): logs come every quarter, the card once a tree (when it falls) */
  // Nov 21 (Jace): a pine gives the Pine card, a cactus the Cactus fruit card (never the Tree card); yews, dead and void trees their own
  const chop=async(o,ck)=>{const c=D.CARDS[ck].key,tc=D.CARDS.tree.key,b0=cnt(c),t0=cnt(tc);obj[i]=o;STR.delete(i);BS.delete(i);const s0=JSON.stringify(inv);
   for(let k=0;k<40&&obj[i]&&obj[i].t===o.t;k++){clear();swing=0;attack();await W(450)}return[cnt(c)-b0,ck==='tree'?0:cnt(tc)-t0]};/* chop until it falls */
  out.pine=await chop({t:'pine',hp:3},'pine');out.cactus=await chop({t:'cactus',hp:3},'cfruit');
  out.kinds=[{t:'yew'},{t:'tree',v:'dead'},{t:'tree',v:'dark'},{t:'cactus'},{t:'oak'},{t:'tree'}].map(SQTREECARD);
  out.demon=[INAME[D.CARDS['wb:demon'].key],IDESC[D.CARDS['wb:demon'].key]];
  // shown in the bag with their own picture, and kept by a save
  const k=D.CARDS['slime:moss'].key;out.inBag=BAG_ORDER().includes(k);out.icon=String(iconURL(k)).slice(0,22);out.name=INAME[k];out.desc=IDESC[k];
  const S=JSON.parse(JSON.stringify(SQSAVE.snap?SQSAVE.snap():snap()));out.saved=JSON.stringify(S).includes('"'+k+'":1')||JSON.stringify(S).includes('"'+k+'_sh":1');
  window.SQDROPCARDALWAYS=false;return out});
 t(r.rate>.006&&r.rate<.014,'the drop rate is '+r.rate+', not about 1%');
 t.eq(r.pity,[200,57],'bad-luck protection (card on the 200th miss; count saved)');t.eq(r.moss,1,'Moss slime cards from one moss slime (killed twice)');t.eq(r.wolf,0,'cards from a summon');t.eq(r.alpha,1,'Frostfang Alpha card');
 t.eq(r.dragon,1,'Dragon card');t.eq(r.queen,1,'Briar Queen card');t.eq(r.turtle,1,'Giant Turtle card');
t.eq(r.tree,1,'Tree card from chopping a tree '+JSON.stringify(r.w));t.eq(r.pine,[1,0],'Pine card (and no Tree card) from a pine');t.eq(r.cactus,[1,0],'Cactus fruit card (and no Tree card) from a cactus');t.eq(r.kinds,['yew','deadtree','voidtree','cfruit','oak','tree'],'which card each tree gives');t.eq(r.demon,['Drop Card: Demon','7HP 7ATK'],'the redrawn Demon card');
 t(r.inBag,'the card isn\'t listed in the bag');t.eq(r.icon,'data:image/png;base64,','card picture');t.eq(r.name,'Drop Card: Moss slime','name');t.eq(r.desc,'2HP 1ATK','description');
 t(r.saved,'the card isn\'t in the save')}};
