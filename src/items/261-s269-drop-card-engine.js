// ---- 269. Drop Card: the match engine (window.SQDCE) ----
// Nov 20 (Jace: "i'm happy with the current draft"): the rules from the "Drop Card: Rules Draft" doc, as plain functions on a match
// state, so the same moves give the same game everywhere (seeded random; matches against Ace now, player against player later).
// - Heroes 30 HP (Gold golem Companion: 33). Decks 20-60 cards (Nov 21, Jace; was 20 HP and 20 cards); first player draws 3, second 4 + a Sapling (1 Mana this turn).
// - A turn: draw (empty deck: 1, 2, 3... damage), stumps regrow, plant one tree, chop trees for Mana (`pool`, lost at end of turn),
//   play cards (monster cost = ceil((HP+ATK)/2), bosses +1, spells "Cost N"), attack once with each monster (new ones wait a turn;
//   Guard first), end turn. Board 6, hand 10, Grove 6 trees (Nov 21, Jace: was 10 Mana, which made big trees pointless).
// - Boss powers, potion/forage spells and Companion powers as in the doc (POW / SPELL / COMP below). The Demon (Jace's open
//   choice): "Last word: 3 damage to the enemy hero".
// - Moves: {t:'plant',h} {t:'chop',g} {t:'play',h,tg} {t:'atk',a,tg} {t:'end'}; targets are 'h0'/'h1' (heroes) or minion ids.
//   apply(s, side, move) checks and does one move; it returns '' or why it can't. Events go to s.log (and s.fx for the screen).
// - Nov 22 (Jace): pet cards are deck cards. "once you've drawn it, you can pay the mana cost and summon it to sit next to you. you
//   should be able to have multiple pets in your deck, and they should have stats as well and be targetable". A pet card costs 1-4
//   Mana (PSTAT, by how strong its power is; Dev Suite > Cards can change any pet's power, cost, HP and ATK: library
//   `petcards.<pet item>` {p,c,h,a}), sits in a row beside its hero (up to MAXP, not on the board's 6 slots), attacks and can be
//   attacked like a monster (it's in P.board with `pet:true`, so spells, Guard, poison... all work), and its power (`comp`) works
//   while it's out. Several pets' powers add up (`has(P,comp)` counts them). Powers that used to happen at the start of a match
//   happen when the pet arrives (Clever draws, Golden +3 HP, Stash draws a forage card).
// - Nov 22 (Jace): the Mithril golem's +2 HP also goes to a monster that gets Guard from Iron skin (cast while the golem is out, or
//   already guarding when the golem arrives); a monster that had Guard already doesn't get it twice.
// - Nov 22: wolf powers never worked: isWolf read `m.id`, which a monster on the table doesn't have (it's `id2`). Fixed; the Frostfang
//   Alpha is a wolf too.
(()=>{const D=window.SQDROPCARD;if(!D)return;
 const MAXB=6,MAXP=3,MAXH=10,MAXT=6,HERO=30;
 // ---- cards ----
 function card(key){const C=D.ITEM[key];if(C){const d=String(C.d||''),m=/(\d+)\s*HP\s*(\d+)\s*ATK/i.exec(d),mn=/(\d+)\s*Mana/i.exec(d),co=/Cost\s*(\d+)/i.exec(d);
   const boss=['world','dungeon','island','guild'].includes(C.g);
   if(C.g==='tree')return{key:C.key,id:C.k,n:short(C.n),kind:'tree',mana:mn?+mn[1]:1};
   if(C.g==='potion'||C.g==='forage')return{key:C.key,id:C.k,n:short(C.n),kind:'spell',cost:co?+co[1]:1,d};
   const hp=m?+m[1]:1,atk=m?+m[2]:1;return{key:C.key,id:C.k,n:short(C.n),kind:'mon',hp,atk,boss,cost:Math.ceil((hp+atk)/2)+(boss?1:0),g:C.g}}
  if(/^pc_[\w:-]+$/.test(key)){const pk=key.slice(3),id=pk.replace(/^pet_/,''),o=OV[pk]||{},comp=o.p&&PSTAT[o.p]?o.p:(COMP[id]||'friendly'),d=PSTAT[comp];
   return{key,id,pk,n:short(INAME[key]||id),kind:'pet',comp,cost:num(o.c,0,9,d[0]),hp:num(o.h,1,20,d[1]),atk:num(o.a,0,20,d[2])}}return null}
 const num=(v,a,b,d)=>typeof v==='number'&&isFinite(v)?Math.max(a,Math.min(b,Math.round(v))):d;
 const short=n=>String(n||'').replace(/^(Shiny )?(Drop|Pet) Card: /,'');
 const WOLFP=new Set(['pwolf','pbriar','psnow','pvoid']);
 const isWolf=m=>m.pet?WOLFP.has(m.comp):(/wolf/.test(m.id2||'')||m.id2==='alpha');
 // pets out on a side (alive, not silenced) with a power: has(P,'dog') = how many; mons(P) = the monsters (the board's 6 slots)
 const has=(P,c,ex)=>P.board.filter(m=>m.pet&&m.comp===c&&m.hp>0&&!m.mute&&m!==ex).length;
 const mons=P=>P.board.filter(m=>!m.pet),petsOut=P=>P.board.filter(m=>m.pet);
 // ---- random (mulberry32) ----
 const rnd=s=>{let t=(s.seed=(s.seed+0x6D2B79F5)|0);t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296};
 const pick=(s,a)=>a.length?a[Math.floor(rnd(s)*a.length)]:null;
 // ---- boss powers (by card id) ----
 const POW={'wb:wisp':'Charge','wb:giant':'Guard','wb:demon':'Last word: 3 damage to the enemy hero','wb:dragon':'Arrival: 2 damage to every enemy monster',
  boss:'Last word: summon two Slimes',bonelord:'Last word: summon a Skeleton',alpha:'Your other wolves get +1 ATK',matri:'Poisons what it damages',tidek:'End of your turn: heal your hero 2',
  emberl:'Arrival: 3 damage to the enemy hero',thorn:'Guard. Attackers take 1 damage','ib:briarwood':'Arrival: summon two 1HP 1ATK Spiderlings','ib:ashfall':'Takes 1 less damage',
  'ib:ironcrest':'Freezes what it hits','ib:shattered':'Arrival: remove an enemy boss\'s power','ib:nomans':'Arrival: steal a card from the enemy\'s hand',void_treant:'Grows +1/+1 at the end of your turn',
  turtle:'Guard. Your hero takes no damage while it\'s here'};
 const SPELL={pot_heal:{tg:'',txt:'Heal your hero 6 HP'},pot_str:{tg:'own',txt:'A monster gets +2 ATK'},pot_iron:{tg:'own',txt:'A monster gets +3 HP and Guard'},pot_swift:{tg:'own',txt:'A monster can attack again'},
  pot_poison:{tg:'foe',txt:'Poison an enemy monster'},pot_napalm:{tg:'',txt:'2 damage to every enemy monster'},pot_zap:{tg:'any',txt:'4 damage to one monster'},
  berry:{tg:'own',txt:'A monster gets +1 HP'},shroom:{tg:'',txt:'Draw a card'},nuts:{tg:'',txt:'Heal your hero 2 HP'},cfruit:{tg:'own',txt:'Heal a monster fully'}};
 // Companion power keys by pet (rules doc); anything else is Friendly
 const COMP={cat:'cat',dog:'dog',slime:'slime',fox:'fox',imp:'imp',pwolf:'pwolf',pbriar:'pbriar',psnow:'psnow',pvoid:'pvoid',ptree:'tl1',ptoak:'tl2',ptwil:'tl3',ptmap:'tl4',ptyew:'tl5',
  ptpine:'pine',ptdead:'dead',ptvoid:'tvoid',psquir:'squir',pgiron:'giron',pggold:'ggold',pgmith:'gmith',pgadam:'gadam',pweb:'web',pvoidl:'voidl',pmush:'mush',pglow:'glow'};
 // Nov 22 (Jace: "1 to 4 by strength"): each power's summon cost, HP and ATK
 const PSTAT={glow:[1,1,1],tl1:[1,1,1],dead:[1,1,1],dog:[2,2,2],slime:[2,3,1],fox:[2,2,1],pwolf:[2,2,2],pbriar:[2,3,1],psnow:[2,3,1],tl2:[2,2,1],tl3:[2,2,2],
  squir:[2,2,1],giron:[2,3,1],ggold:[2,3,1],gmith:[2,3,1],voidl:[2,2,1],mush:[2,2,1],friendly:[2,2,2],imp:[3,2,2],pvoid:[3,2,2],tl4:[3,3,2],pine:[3,2,1],
  tvoid:[3,2,2],web:[3,2,2],cat:[4,3,2],tl5:[4,3,3],gadam:[4,4,2]};
 const PTXT={cat:'Nine lives: once, when your hero would fall to 0 HP, it stays at 1.',dog:'Loyal: the first monster you play each turn gets +1 ATK.',
  slime:'Squish: at the start of your turn, one of your monsters gets +1 HP.',fox:'Clever: when it arrives, draw a card.',imp:'Pest: at the end of your turn, 1 damage to a random enemy monster.',
  pwolf:'Pack leader: your other wolves get +1 ATK.',pbriar:'Thorny pack: monsters that attack your wolves take 1 damage.',psnow:'Thick coat: your other wolves get +2 HP.',
  pvoid:'Void pack: your other wolves get +1 ATK and Charge.',tl1:'Once per turn, regrow a stump worth 1 Mana.',tl2:'Once per turn, regrow a stump worth 2 Mana or less.',
  tl3:'Once per turn, regrow a stump worth 3 Mana or less.',tl4:'Once per turn, regrow a stump worth 4 Mana or less.',tl5:'Once per turn, regrow any one stump.',
  pine:'Evergreen: when you plant a tree, draw a card.',dead:'Rot: when one of your monsters falls on your turn, gain 1 Mana.',tvoid:'Void sap: when you chop a tree, 1 damage to a random enemy monster.',
  squir:'Stash: when it arrives, draw a forage card from your deck. Your forage cards cost 1 less.',giron:'Iron skin: the first hit on your hero each turn does 1 less damage.',
  ggold:'Golden: when it arrives, your hero gets +3 HP.',gmith:'Mithril wall: your Guard monsters get +2 HP.',gadam:'Adamant skin: your hero takes 1 less damage from every monster hit.',
  web:'Web: every other turn, a random enemy monster can\'t attack on its next turn.',voidl:'Silence: when it arrives, it takes away an enemy boss\'s power (or the next boss they play).',
  mush:'Spores: every third turn, draw a card.',glow:'Glow: the first time each turn your hero takes damage, heal 1 HP.',friendly:'Friendly: once, when your hero is at half HP or less, heal it 3 HP.'};
 // the Dev Suite's changes (library `petcards`), read by card(); 254's pet card text follows them
 const OV={};
 function applyPets(L){const lib=(L&&L.petcards)||{};for(const k in OV)delete OV[k];for(const k in lib){const o=lib[k];if(o&&typeof o==='object'&&/^[\w:-]+$/.test(k))OV[k]=o}try{refreshText()}catch(e){self.SQERR&&SQERR(e,'261-1')}}
 const petText=pk=>{const c=card('pc_'+pk);return c?'Pet card · Cost '+c.cost+' · '+c.hp+' HP '+c.atk+' ATK. '+PTXT[c.comp]:''};
 function refreshText(){const B=window.SQBINDER;if(!B||!B.PET)return;for(const k in B.PET){const pk=B.PET[k].pk;IDESC[k]=petText(pk)}}
 window.SQPETDESC=petText;
 // ---- a new match ----
 // decks: arrays of item keys (20, base or shiny); pets: pet card keys or null; names: [string,string]
 function create(o){const s={seed:(o.seed|0)||1,turn:0,cur:0,over:false,win:-1,nid:1,log:[],fx:[],p:[]};
  for(let i=0;i<2;i++){const deck=(o.decks[i]||[]).map(k=>{const C=D.ITEM[k];return C?C.key:k}).filter(k=>card(k));
   // a Companion picked before Nov 22 (o.pets) is shuffled into the deck like any pet card
   const pet=o.pets&&o.pets[i]||null;if(pet&&card(pet)&&card(pet).kind==='pet')deck.push(pet);
   s.p.push({n:String(o.names&&o.names[i]||('Player '+(i+1))),hp:HERO,deck,hand:[],grove:[],board:[],pool:0,planted:false,fat:0,cf:{},played:0,mplayed:0,hurtT:false})}
  for(const P of s.p){for(let i=P.deck.length-1;i>0;i--){const j=Math.floor(rnd(s)*(i+1));[P.deck[i],P.deck[j]]=[P.deck[j],P.deck[i]]}}
  for(let i=0;i<3;i++){draw(s,0);draw(s,1)}draw(s,1);s.p[1].hand.push('_sapling');
  startTurn(s,0);return s}
 const L=(s,t)=>{s.log.push(t);if(s.log.length>60)s.log.shift()};
 function draw(s,i){const P=s.p[i];if(!P.deck.length){P.fat++;hurtHero(s,i,P.fat,'Out of cards');return}const k=P.deck.shift();if(P.hand.length>=MAXH){L(s,P.n+'\'s hand is full: '+(card(k)||{}).n+' is lost.');return}P.hand.push(k)}
 // ---- damage ----
 function hurtHero(s,i,n,why,fromMon){const P=s.p[i];if(n<=0||s.over)return;if(P.board.some(m=>m.id2==='turtle'&&!m.mute&&m.hp>0)){L(s,'The Giant Turtle protects '+P.n+'.');return}
  if(fromMon)n=Math.max(0,n-has(P,'gadam'));const ir=has(P,'giron');if(ir&&!P.cf.ironHit){P.cf.ironHit=1;n=Math.max(0,n-ir)}if(n<=0)return;
  P.hp-=n;s.fx.push({t:'dmg',to:'h'+i,n});
  const gl=has(P,'glow');if(gl&&!P.cf.glow&&P.hp>0){P.cf.glow=1;P.hp+=gl}
  if(P.hp<=0){const cat=P.board.find(m=>m.pet&&m.comp==='cat'&&m.hp>0&&!m.mute&&!(m.cf&&m.cf.used));if(cat){cat.cf.used=1;P.hp=1;L(s,P.n+'\'s '+cat.n+' has nine lives: '+P.n+' stays at 1 HP!')}}
  if(P.hp<=0&&!s.over){s.over=true;s.win=1-i;L(s,s.p[1-i].n+' wins!')}}
 const atkOf=(s,i,m)=>{let a=m.atk;const P=s.p[i];if(isWolf(m))a+=P.board.filter(o=>o!==m&&o.id2==='alpha'&&!o.mute&&o.hp>0).length+has(P,'pwolf',m)+has(P,'pvoid',m);return Math.max(0,a)};
 function hurtMon(s,i,m,n,src){if(n<=0||m.hp<=0)return;if(m.id2==='ib:ashfall'&&!m.mute)n=Math.max(0,n-1);if(n<=0)return;m.hp-=n;s.fx.push({t:'dmg',to:m.uid,n});
  if(src&&src.id2==='matri'&&!src.mute)m.poison=1;if(src&&src.id2==='ib:ironcrest'&&!src.mute)m.frozen=2}
 function sweep(s){for(const i of s.flip?[1,0]:[0,1]){/* both sides' falls in the same order on both players' screens (263 mirrors the state) */const P=s.p[i];const dead=P.board.filter(m=>m.hp<=0);if(!dead.length)continue;P.board=P.board.filter(m=>m.hp>0);
   for(const m of dead){L(s,m.n+' falls.');if(m.mute)continue;
    if(m.id2==='wb:demon')hurtHero(s,1-i,3,'Demon');
    if(m.id2==='boss'){summon(s,i,'slime');summon(s,i,'slime')}
    if(m.id2==='bonelord')summon(s,i,'skel');
    const rot=has(P,'dead');if(rot&&s.cur===i){P.pool+=rot;L(s,'Rot: +'+rot+' Mana.')}}}}
 function summon(s,i,id,stats){const P=s.p[i];if(mons(P).length>=MAXB)return null;let c;if(stats)c={n:stats.n,hp:stats.hp,atk:stats.atk,key:null};else{const C=D.CARDS[id];c=C&&card(C.key);if(!c)return null}
  const m={uid:'m'+(s.nid++),id2:id,key:c.key,n:c.n,hp:c.hp,max:c.hp,atk:c.atk,boss:!!c.boss,guard:false,sleep:true,done:false,poison:0,frozen:0,mute:false,side:i};
  if(isWolf(m)){const sn=has(P,'psnow');if(sn){m.hp+=2*sn;m.max+=2*sn}if(has(P,'pvoid'))m.sleep=false}
  P.board.push(m);return m}
 // a pet card coming out: its row beside the hero, then what it does when it arrives
 function summonPet(s,i,c){const P=s.p[i],O=s.p[1-i];if(petsOut(P).length>=MAXP)return null;
  const m={uid:'m'+(s.nid++),id2:'pet:'+c.comp,key:c.key,n:c.n,hp:c.hp,max:c.hp,atk:c.atk,boss:false,guard:false,sleep:true,done:false,poison:0,frozen:0,mute:false,side:i,pet:true,comp:c.comp,cf:{}};
  P.board.push(m);const others=P.board.filter(o=>o!==m&&o.hp>0);
  if(c.comp==='fox'){draw(s,i);L(s,'Clever: '+P.n+' draws a card.')}
  if(c.comp==='ggold'){P.hp+=3;L(s,c.n+' gives '+P.n+' +3 HP.')}
  if(c.comp==='squir'){const j=P.deck.findIndex(k=>{const C=D.ITEM[k];return C&&C.g==='forage'});if(j>=0){const k=P.deck.splice(j,1)[0];if(P.hand.length<MAXH)P.hand.push(k);L(s,'Stash: '+P.n+' draws a forage card.')}}
  if(c.comp==='psnow')for(const o of others)if(isWolf(o)){o.hp+=2;o.max+=2}
  if(c.comp==='pvoid')for(const o of others)if(isWolf(o))o.sleep=false;
  if(c.comp==='gmith')for(const o of others)if(isGuard(o)){o.hp+=2;o.max+=2}
  if(c.comp==='voidl'){const b=O.board.filter(o=>o.boss&&!o.mute&&o.hp>0);if(b.length){const t=pick(s,b);t.mute=true;m.cf.used=1;L(s,c.n+' silences '+t.n+'.')}}
  return m}
 // ---- turns ----
 function startTurn(s,i){s.cur=i;s.turn++;const P=s.p[i];P.planted=false;P.pool=0;P.played=0;P.mplayed=0;P.cf.ironHit=0;P.cf.glow=0;for(const m of P.board)if(m.pet&&m.cf)m.cf.tl=0;
  for(const g of P.grove)g.stump=false;
  for(const m of P.board){m.done=false;m.sleep=false;if(m.frozen>0)m.frozen--;if(m.poison){hurtMon(s,i,m,1);L(s,m.n+' takes 1 poison damage.')}}
  sweep(s);if(s.over)return;
  draw(s,i);if(s.over)return;
  const myTurns=Math.ceil(s.turn/2);
  if(myTurns%3===0)for(let k=has(P,'mush');k>0&&!s.over;k--){draw(s,i);L(s,'Spores: '+P.n+' draws a card.')}
  for(let k=has(P,'slime');k>0;k--){const L2=P.board.filter(m=>m.hp>0);if(!L2.length)break;const m=pick(s,L2);m.hp++;m.max++;L(s,'Squish: '+m.n+' gets +1 HP.')}
  if(myTurns%2===0)for(let k=has(P,'web');k>0;k--){const f=s.p[1-i].board.filter(m=>m.hp>0);if(!f.length)break;const m=pick(s,f);m.frozen=2;L(s,'Web: '+m.n+' can\'t attack next turn.')}
  for(const m of P.board)if(m.pet&&m.comp==='friendly'&&m.hp>0&&!m.mute&&!m.cf.used&&P.hp<=HERO/2){m.cf.used=1;P.hp+=3;L(s,P.n+'\'s '+m.n+' is Friendly: +3 HP.')}}
 function endTurn(s){const i=s.cur,P=s.p[i];
  for(const m of P.board){if(m.mute)continue;if(m.id2==='tidek'){P.hp+=2;L(s,'Tidekeeper heals '+P.n+' 2.')}if(m.id2==='void_treant'){m.atk++;m.hp++;m.max++}}
  for(let k=has(P,'imp');k>0&&!s.over;k--){const f=s.p[1-i].board.filter(m=>m.hp>0);if(!f.length)break;const m=pick(s,f);hurtMon(s,1-i,m,1);L(s,'The imp jabs '+m.n+'.');sweep(s)}
  if(!s.over)startTurn(s,1-i)}
 // ---- moves ----
 const costOf=(s,i,c)=>{if(!c)return 99;if(c.kind==='spell'){let k=c.cost;if(['berry','shroom','nuts','cfruit'].includes(c.id))k=Math.max(0,k-has(s.p[i],'squir'));return k}return c.kind==='mon'||c.kind==='pet'?c.cost:0};
 const groveMana=P=>P.grove.reduce((a,g)=>a+g.mana,0);
 const findM=(s,uid)=>{for(let i=0;i<2;i++){const m=s.p[i].board.find(m=>m.uid===uid);if(m)return[i,m]}return[-1,null]};
 // Guard: given by Iron skin (m.guard) or a boss's own power (Stone Giant, Thornheart, Giant Turtle) unless silenced
 const isGuard=m=>m.guard||((m.id2==='wb:giant'||m.id2==='thorn'||m.id2==='turtle')&&!m.mute);
 const guards=(s,i)=>s.p[i].board.filter(m=>isGuard(m)&&m.hp>0);
 function canAttack(s,i,m){return m&&!m.done&&!m.sleep&&!(m.frozen>0)&&atkOf(s,i,m)>0}
 function targets(s,i,uid){const[,m]=findM(s,uid);if(!m||!canAttack(s,i,m))return[];const g=guards(s,1-i);if(g.length)return g.map(x=>x.uid);return['h'+(1-i)].concat(s.p[1-i].board.map(x=>x.uid))}
 function spellTargets(s,i,c){const sp=SPELL[c.id];if(!sp||!sp.tg)return null;const own=s.p[i].board.map(m=>m.uid),foe=s.p[1-i].board.map(m=>m.uid);return sp.tg==='own'?own:sp.tg==='foe'?foe:own.concat(foe)}
 // pay a cost by chopping the smallest trees that cover it (least waste)
 function autoChop(s,i,need){const P=s.p[i];if(P.pool>=need)return true;const up=P.grove.map((g,j)=>[g,j]).filter(([g])=>!g.stump);
  let best=null;const n=up.length;for(let mask=1;mask<(1<<n);mask++){let sum=0,cnt=0;for(let b=0;b<n;b++)if(mask&(1<<b)){sum+=up[b][0].mana;cnt++}if(P.pool+sum>=need&&(!best||sum<best.sum||(sum===best.sum&&cnt<best.cnt)))best={mask,sum,cnt}}
  if(!best)return false;for(let b=0;b<n;b++)if(best.mask&(1<<b))chop(s,i,up[b][1]);return P.pool>=need}
 // which trees autoChop would chop for `need` (indices), or null: lets the screen light them up before you commit
 function chopPlan(s,i,need){const P=s.p[i];if(P.pool>=need)return[];const up=P.grove.map((g,j)=>[g,j]).filter(([g])=>!g.stump);let best=null;const n=up.length;
  for(let mask=1;mask<(1<<n);mask++){let sum=0,cnt=0;for(let b=0;b<n;b++)if(mask&(1<<b)){sum+=up[b][0].mana;cnt++}if(P.pool+sum>=need&&(!best||sum<best.sum||(sum===best.sum&&cnt<best.cnt)))best={mask,sum,cnt}}
  if(!best)return null;const out=[];for(let b=0;b<n;b++)if(best.mask&(1<<b))out.push(up[b][1]);return out}
 function chop(s,i,j){const P=s.p[i],g=P.grove[j];if(!g||g.stump)return'That tree is already a stump.';g.stump=true;P.pool+=g.mana;s.fx.push({t:'chop',side:i,g:j});
  const LIM={tl1:1,tl2:2,tl3:3,tl4:4,tl5:99},tr=P.board.filter(m=>m.pet&&LIM[m.comp]&&m.hp>0&&!m.mute&&!m.cf.tl&&g.mana<=LIM[m.comp]).sort((a,b)=>LIM[a.comp]-LIM[b.comp])[0];
  if(tr){tr.cf.tl=1;g.stump=false;L(s,'The '+tr.n+' regrows the '+g.n+'.')}
  for(let k=has(P,'tvoid');k>0;k--){const f=s.p[1-i].board.filter(m=>m.hp>0);if(!f.length)break;const m=pick(s,f);hurtMon(s,1-i,m,1);sweep(s)}return''}
 function apply(s,i,mv){if(s.over)return'The match is over.';if(s.cur!==i)return'It isn\'t your turn.';const P=s.p[i],O=s.p[1-i];s.fx=[];
  if(mv.t==='end'){L(s,P.n+' ends the turn.');endTurn(s);return''}
  if(mv.t==='chop')return chop(s,i,mv.g|0);
  if(mv.t==='plant'){const k=P.hand[mv.h|0],c=card(k);if(!c||c.kind!=='tree')return'That isn\'t a tree.';if(P.planted)return'You\'ve already planted a tree this turn.';if(P.grove.length>=MAXT)return'Your Grove is full ('+MAXT+' trees).';
   P.hand.splice(mv.h|0,1);P.grove.push({key:k,n:c.n,mana:c.mana,stump:false});P.planted=true;L(s,P.n+' plants '+c.n+'.');for(let k=has(P,'pine');k>0;k--){draw(s,i);L(s,'Evergreen: '+P.n+' draws a card.')}return''}
  if(mv.t==='play'){const h=mv.h|0,k=P.hand[h];if(k==='_sapling'){P.hand.splice(h,1);P.pool+=1;L(s,P.n+' uses the Sapling: +1 Mana.');return''}const c=card(k);if(!c)return'No card.';if(c.kind==='tree')return apply(s,i,{t:'plant',h});
   const cost=costOf(s,i,c);if(c.kind==='mon'&&mons(P).length>=MAXB)return'Your side of the board is full.';if(c.kind==='pet'&&petsOut(P).length>=MAXP)return'You already have '+MAXP+' pets out.';
   let tg=null;if(c.kind==='spell'){const ts=spellTargets(s,i,c);if(ts){if(!ts.length)return'There\'s nothing to use it on.';if(!ts.includes(mv.tg))return'Pick a target.';tg=findM(s,mv.tg)}}
   if(P.pool+P.grove.filter(g=>!g.stump).reduce((a,g)=>a+g.mana,0)<cost)return'Not enough Mana: chop more trees, or plant one.';
   if(!autoChop(s,i,cost))return'Not enough Mana.';P.pool-=cost;P.hand.splice(h,1);P.played++;
   if(c.kind==='pet'){const m=summonPet(s,i,c);if(!m)return'';L(s,P.n+' summons '+c.n+'.');s.fx.push({t:'play',side:i,uid:m.uid});sweep(s);return''}
   if(c.kind==='mon'){const m=summon(s,i,c.id);if(!m)return'';L(s,P.n+' plays '+c.n+'.');s.fx.push({t:'play',side:i,uid:m.uid});P.mplayed++;
    const dg=has(P,'dog');if(dg&&P.mplayed===1){m.atk+=dg;L(s,'Loyal: '+m.n+' gets +'+dg+' ATK.')}
    const mi=has(P,'gmith');if(mi&&isGuard(m)){m.hp+=2*mi;m.max+=2*mi}
    if(m.id2==='wb:wisp')m.sleep=false;
    if(m.id2==='wb:dragon'){for(const o of O.board.slice())hurtMon(s,1-i,o,2,m);L(s,'The Dragon breathes fire on every enemy monster!')}
    if(m.id2==='emberl')hurtHero(s,1-i,3,'Emberlord');
    if(m.id2==='ib:briarwood'){summon(s,i,'_sp',{n:'Spiderling',hp:1,atk:1});summon(s,i,'_sp',{n:'Spiderling',hp:1,atk:1})}
    if(m.id2==='ib:shattered'){const b=O.board.filter(o=>o.boss&&!o.mute);if(b.length){const t=pick(s,b);t.mute=true;L(s,'The Void Herald silences '+t.n+'.')}}
    if(m.id2==='ib:nomans'&&O.hand.length){const j=Math.floor(rnd(s)*O.hand.length),st=O.hand.splice(j,1)[0];if(P.hand.length<MAXH)P.hand.push(st);L(s,'Black Jack steals a card!')}
    const vl=m.boss&&O.board.find(o=>o.pet&&o.comp==='voidl'&&o.hp>0&&!o.mute&&!o.cf.used);if(vl){vl.cf.used=1;m.mute=true;L(s,O.n+'\'s '+vl.n+' silences '+m.n+'.')}
    sweep(s);return''}
   // spells
   const sp=c.id,[ti,tm]=tg||[-1,null];L(s,P.n+' uses '+c.n+'.');
   if(sp==='pot_heal')P.hp+=6;else if(sp==='nuts')P.hp+=2;else if(sp==='shroom')draw(s,i);
   else if(sp==='pot_str')tm.atk+=2;else if(sp==='pot_iron'){const had=isGuard(tm),mi=had?0:has(s.p[ti],'gmith');tm.hp+=3+2*mi;tm.max+=3+2*mi;tm.guard=true;if(mi)L(s,'Mithril wall: '+tm.n+' gets +'+2*mi+' HP.')}else if(sp==='pot_swift')tm.done=false;
   else if(sp==='pot_poison')tm.poison=1;else if(sp==='pot_napalm'){for(const o of O.board.slice())hurtMon(s,1-i,o,2)}else if(sp==='pot_zap')hurtMon(s,ti,tm,4);
   else if(sp==='berry'){tm.hp++;tm.max++}else if(sp==='cfruit')tm.hp=tm.max;
   sweep(s);return''}
  if(mv.t==='atk'){const[ai,a]=findM(s,mv.a);if(ai!==i||!a)return'Pick one of your monsters.';if(a.sleep)return a.n+' was just played: it can attack next turn.';if(a.done)return a.n+' has already attacked.';if(a.frozen>0)return a.n+' is frozen.';
   const ts=targets(s,i,a.uid);if(!ts.includes(mv.tg))return guards(s,1-i).length?'A monster with Guard is in the way: attack it first.':'Pick a target.';
   a.done=true;const av=atkOf(s,i,a);s.fx.push({t:'atk',a:a.uid,tg:mv.tg});
   if(mv.tg==='h'+(1-i)){L(s,a.n+' hits '+O.n+' for '+av+'.');hurtHero(s,1-i,av,a.n,true)}
   else{const[,d]=findM(s,mv.tg);const dv=atkOf(s,1-i,d);L(s,a.n+' fights '+d.n+'.');hurtMon(s,1-i,d,av,a);hurtMon(s,i,a,dv,d);
    if(d.id2==='thorn'&&!d.mute)hurtMon(s,i,a,1);if(isWolf(d)){const br=has(O,'pbriar');if(br)hurtMon(s,i,a,br)}}
   sweep(s);return''}
  return'Unknown move.'}
 // ---- what a side may do now (for the screen and Ace) ----
 function options(s,i){const P=s.p[i],out=[];if(s.over||s.cur!==i)return out;const avail=P.pool+P.grove.filter(g=>!g.stump).reduce((a,g)=>a+g.mana,0);
  P.hand.forEach((k,h)=>{if(k==='_sapling'){out.push({t:'play',h});return}const c=card(k);if(!c)return;
   if(c.kind==='tree'){if(!P.planted&&P.grove.length<MAXT)out.push({t:'plant',h});return}
   if(costOf(s,i,c)>avail)return;if(c.kind==='mon'){if(mons(P).length<MAXB)out.push({t:'play',h});return}if(c.kind==='pet'){if(petsOut(P).length<MAXP)out.push({t:'play',h});return}
   const ts=spellTargets(s,i,c);if(ts===null)out.push({t:'play',h});else for(const tg of ts)out.push({t:'play',h,tg})});
  for(const m of P.board)for(const tg of targets(s,i,m.uid))out.push({t:'atk',a:m.uid,tg});
  out.push({t:'end'});return out}
 const clone=s=>JSON.parse(JSON.stringify(s));
 // ---- player vs player (263): each player sees themself as side 0 ----
 // mirror(s) swaps the two sides in place (the second player's view); flipMv turns a move from the other player's view into yours.
 // Everything else that depends on a side is relative to the side acting, so both views stay the same match.
 function mirror(s){s.p.reverse();s.cur=1-s.cur;if(s.win>=0)s.win=1-s.win;s.flip=!s.flip;for(const P of s.p)for(const m of P.board)m.side=1-m.side;
  for(const f of s.fx||[]){if(typeof f.side==='number')f.side=1-f.side;if(f.to==='h0'||f.to==='h1')f.to=f.to==='h0'?'h1':'h0'}return s}
 const flipH=v=>v==='h0'?'h1':v==='h1'?'h0':v;
 function flipMv(mv){const o=Object.assign({},mv);if(o.tg!=null)o.tg=flipH(o.tg);return o}
 window.SQDCE={mirror,flipMv,chopPlan,card,create,apply,options,targets,spellTargets,costOf,atkOf,guards,findM,clone,POW,SPELL,COMP,PSTAT,PTXT,OV,petText,isWolf,has,mons,petsOut,MAXB,MAXP,MAXH,MAXT,HERO,short,groveMana:P=>groveMana(P)};
 try{SQA.onApply(applyPets)}catch(e){self.SQERR&&SQERR(e,'261-2')}try{refreshText()}catch(e){self.SQERR&&SQERR(e,'261-3')}})();
