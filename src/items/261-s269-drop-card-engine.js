// ---- 269. Drop Card: the match engine (window.SQDCE) ----
// Nov 20 (Jace: "i'm happy with the current draft"): the rules from the "Drop Card: Rules Draft" doc, as plain functions on a match
// state, so the same moves give the same game everywhere (seeded random; matches against Ace now, player against player later).
// - Heroes 20 HP (Gold golem Companion: 23). Decks 20 cards; first player draws 3, second 4 + a Sapling (1 Mana this turn).
// - A turn: draw (empty deck: 1, 2, 3... damage), stumps regrow, plant one tree, chop trees for Mana (`pool`, lost at end of turn),
//   play cards (monster cost = ceil((HP+ATK)/2), bosses +1, spells "Cost N"), attack once with each monster (new ones wait a turn;
//   Guard first), end turn. Board 6, hand 10, Grove 10 Mana.
// - Boss powers, potion/forage spells and Companion powers as in the doc (POW / SPELL / COMP below). The Demon (Jace's open
//   choice): "Last word: 3 damage to the enemy hero".
// - Moves: {t:'plant',h} {t:'chop',g} {t:'play',h,tg} {t:'atk',a,tg} {t:'end'}; targets are 'h0'/'h1' (heroes) or minion ids.
//   apply(s, side, move) checks and does one move; it returns '' or why it can't. Events go to s.log (and s.fx for the screen).
(()=>{const D=window.SQDROPCARD;if(!D)return;
 const MAXB=6,MAXH=10,MAXM=10,HERO=20;
 // ---- cards ----
 function card(key){const C=D.ITEM[key];if(C){const d=String(C.d||''),m=/(\d+)\s*HP\s*(\d+)\s*ATK/i.exec(d),mn=/(\d+)\s*Mana/i.exec(d),co=/Cost\s*(\d+)/i.exec(d);
   const boss=['world','dungeon','island','guild'].includes(C.g);
   if(C.g==='tree')return{key:C.key,id:C.k,n:short(C.n),kind:'tree',mana:mn?+mn[1]:1};
   if(C.g==='potion'||C.g==='forage')return{key:C.key,id:C.k,n:short(C.n),kind:'spell',cost:co?+co[1]:1,d};
   const hp=m?+m[1]:1,atk=m?+m[2]:1;return{key:C.key,id:C.k,n:short(C.n),kind:'mon',hp,atk,boss,cost:Math.ceil((hp+atk)/2)+(boss?1:0),g:C.g}}
  if(/^pc_/.test(key))return{key,id:key.slice(3).replace(/^pet_/,''),n:short(INAME[key]||key),kind:'pet'};return null}
 const short=n=>String(n||'').replace(/^(Shiny )?(Drop|Pet) Card: /,'');
 const isWolf=m=>/wolf/.test(m.id)||/^pwolf|^p(briar|snow|void)$/.test(m.id);
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
 // ---- a new match ----
 // decks: arrays of item keys (20, base or shiny); pets: pet card keys or null; names: [string,string]
 function create(o){const s={seed:(o.seed|0)||1,turn:0,cur:0,over:false,win:-1,nid:1,log:[],fx:[],p:[]};
  for(let i=0;i<2;i++){const pet=o.pets&&o.pets[i]||null,comp=pet?(COMP[pet.replace(/^pc_(pet_)?/,'')]||'friendly'):null;
   const deck=(o.decks[i]||[]).map(k=>{const C=D.ITEM[k];return C?C.key:k}).filter(k=>card(k)&&card(k).kind!=='pet');
   s.p.push({n:String(o.names&&o.names[i]||('Player '+(i+1))),hp:comp==='ggold'?23:HERO,deck,hand:[],grove:[],board:[],pool:0,planted:false,fat:0,comp,pet,cf:{},played:0,hurtT:false})}
  for(const P of s.p){for(let i=P.deck.length-1;i>0;i--){const j=Math.floor(rnd(s)*(i+1));[P.deck[i],P.deck[j]]=[P.deck[j],P.deck[i]]}}
  for(let i=0;i<3;i++){draw(s,0);draw(s,1)}draw(s,1);s.p[1].hand.push('_sapling');
  for(let i=0;i<2;i++)if(s.p[i].comp==='fox')draw(s,i);
  startTurn(s,0);return s}
 const L=(s,t)=>{s.log.push(t);if(s.log.length>60)s.log.shift()};
 function draw(s,i){const P=s.p[i];if(!P.deck.length){P.fat++;hurtHero(s,i,P.fat,'Out of cards');return}const k=P.deck.shift();if(P.hand.length>=MAXH){L(s,P.n+'\'s hand is full: '+(card(k)||{}).n+' is lost.');return}P.hand.push(k)}
 // ---- damage ----
 function hurtHero(s,i,n,why,fromMon){const P=s.p[i];if(n<=0||s.over)return;if(P.board.some(m=>m.id2==='turtle'&&!m.mute)){L(s,'The Giant Turtle protects '+P.n+'.');return}
  if(fromMon&&P.comp==='gadam')n=Math.max(0,n-1);if(P.comp==='giron'&&!P.cf.ironHit){P.cf.ironHit=1;n=Math.max(0,n-1)}if(n<=0)return;
  P.hp-=n;s.fx.push({t:'dmg',to:'h'+i,n});
  if(P.comp==='glow'&&!P.cf.glow&&P.hp>0){P.cf.glow=1;P.hp+=1}
  if(P.hp<=0&&P.comp==='cat'&&!P.cf.cat){P.cf.cat=1;P.hp=1;L(s,P.n+'\'s cat has nine lives: '+P.n+' stays at 1 HP!')}
  if(P.hp<=0&&!s.over){s.over=true;s.win=1-i;L(s,s.p[1-i].n+' wins!')}}
 const atkOf=(s,i,m)=>{let a=m.atk;const P=s.p[i];if(isWolf(m)){a+=P.board.filter(o=>o!==m&&o.id2==='alpha'&&!o.mute).length;if(P.comp==='pwolf'||P.comp==='pvoid')a+=1}return Math.max(0,a)};
 function hurtMon(s,i,m,n,src){if(n<=0||m.hp<=0)return;if(m.id2==='ib:ashfall'&&!m.mute)n=Math.max(0,n-1);if(n<=0)return;m.hp-=n;s.fx.push({t:'dmg',to:m.uid,n});
  if(src&&src.id2==='matri'&&!src.mute)m.poison=1;if(src&&src.id2==='ib:ironcrest'&&!src.mute)m.frozen=2}
 function sweep(s){for(const i of s.flip?[1,0]:[0,1]){/* both sides' falls in the same order on both players' screens (263 mirrors the state) */const P=s.p[i];const dead=P.board.filter(m=>m.hp<=0);if(!dead.length)continue;P.board=P.board.filter(m=>m.hp>0);
   for(const m of dead){L(s,m.n+' falls.');if(m.mute)continue;
    if(m.id2==='wb:demon')hurtHero(s,1-i,3,'Demon');
    if(m.id2==='boss'){summon(s,i,'slime');summon(s,i,'slime')}
    if(m.id2==='bonelord')summon(s,i,'skel');
    if(P.comp==='dead'&&s.cur===i){P.pool+=1;L(s,'Rot: +1 Mana.')}}}}
 function summon(s,i,id,stats){const P=s.p[i];if(P.board.length>=MAXB)return null;let c;if(stats)c={n:stats.n,hp:stats.hp,atk:stats.atk,key:null};else{const C=D.CARDS[id];c=C&&card(C.key);if(!c)return null}
  const m={uid:'m'+(s.nid++),id2:id,key:c.key,n:c.n,hp:c.hp,max:c.hp,atk:c.atk,boss:!!c.boss,guard:false,sleep:true,done:false,poison:0,frozen:0,mute:false,side:i};
  if(isWolf(m)){if(P.comp==='psnow'){m.hp+=2;m.max+=2}if(P.comp==='pvoid')m.sleep=false}
  P.board.push(m);return m}
 // ---- turns ----
 function startTurn(s,i){s.cur=i;s.turn++;const P=s.p[i];P.planted=false;P.pool=0;P.played=0;P.cf.ironHit=0;P.cf.glow=0;P.cf.tl=0;P.cf.squir=P.cf.squir||0;
  for(const g of P.grove)g.stump=false;
  for(const m of P.board){m.done=false;m.sleep=false;if(m.frozen>0)m.frozen--;if(m.poison){hurtMon(s,i,m,1);L(s,m.n+' takes 1 poison damage.')}}
  sweep(s);if(s.over)return;
  draw(s,i);if(s.over)return;
  const myTurns=Math.ceil(s.turn/2);
  if(P.comp==='mush'&&myTurns%3===0){draw(s,i);L(s,'Spores: '+P.n+' draws a card.')}
  if(P.comp==='slime'&&P.board.length){const m=pick(s,P.board);m.hp++;m.max++;L(s,'Squish: '+m.n+' gets +1 HP.')}
  if(P.comp==='web'&&myTurns%2===0){const f=s.p[1-i].board;if(f.length){const m=pick(s,f);m.frozen=2;L(s,'Web: '+m.n+' can\'t attack next turn.')}}
  if(P.comp==='friendly'&&!P.cf.fr&&P.hp<=10){P.cf.fr=1;P.hp+=3;L(s,P.n+'\'s pet is Friendly: +3 HP.')}}
 function endTurn(s){const i=s.cur,P=s.p[i];
  for(const m of P.board){if(m.mute)continue;if(m.id2==='tidek'){P.hp+=2;L(s,'Tidekeeper heals '+P.n+' 2.')}if(m.id2==='void_treant'){m.atk++;m.hp++;m.max++}}
  if(P.comp==='imp'){const f=s.p[1-i].board;if(f.length){const m=pick(s,f);hurtMon(s,1-i,m,1);L(s,'The imp jabs '+m.n+'.');sweep(s)}}
  if(!s.over)startTurn(s,1-i)}
 // ---- moves ----
 const costOf=(s,i,c)=>{if(!c)return 99;if(c.kind==='spell'){let k=c.cost;if(s.p[i].comp==='squir'&&['berry','shroom','nuts','cfruit'].includes(c.id))k=Math.max(0,k-1);return k}return c.kind==='mon'?c.cost:0};
 const groveMana=P=>P.grove.reduce((a,g)=>a+g.mana,0);
 const findM=(s,uid)=>{for(let i=0;i<2;i++){const m=s.p[i].board.find(m=>m.uid===uid);if(m)return[i,m]}return[-1,null]};
 const guards=(s,i)=>s.p[i].board.filter(m=>(m.guard||((m.id2==='wb:giant'||m.id2==='thorn'||m.id2==='turtle')&&!m.mute))&&m.hp>0);
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
  const lim={tl1:1,tl2:2,tl3:3,tl4:4,tl5:99}[P.comp];if(lim&&!P.cf.tl&&g.mana<=lim){P.cf.tl=1;g.stump=false;L(s,'The treeling regrows the '+g.n+'.')}
  if(P.comp==='tvoid'){const f=s.p[1-i].board;if(f.length){const m=pick(s,f);hurtMon(s,1-i,m,1);sweep(s)}}return''}
 function apply(s,i,mv){if(s.over)return'The match is over.';if(s.cur!==i)return'It isn\'t your turn.';const P=s.p[i],O=s.p[1-i];s.fx=[];
  if(mv.t==='end'){L(s,P.n+' ends the turn.');endTurn(s);return''}
  if(mv.t==='chop')return chop(s,i,mv.g|0);
  if(mv.t==='plant'){const k=P.hand[mv.h|0],c=card(k);if(!c||c.kind!=='tree')return'That isn\'t a tree.';if(P.planted)return'You\'ve already planted a tree this turn.';if(groveMana(P)+c.mana>MAXM)return'Your Grove is full (10 Mana).';
   P.hand.splice(mv.h|0,1);P.grove.push({key:k,n:c.n,mana:c.mana,stump:false});P.planted=true;L(s,P.n+' plants '+c.n+'.');if(P.comp==='pine'){draw(s,i);L(s,'Evergreen: '+P.n+' draws a card.')}return''}
  if(mv.t==='play'){const h=mv.h|0,k=P.hand[h];if(k==='_sapling'){P.hand.splice(h,1);P.pool+=1;L(s,P.n+' uses the Sapling: +1 Mana.');return''}const c=card(k);if(!c)return'No card.';if(c.kind==='tree')return apply(s,i,{t:'plant',h});
   const cost=costOf(s,i,c);if(c.kind==='mon'&&P.board.length>=MAXB)return'Your side of the board is full.';
   let tg=null;if(c.kind==='spell'){const ts=spellTargets(s,i,c);if(ts){if(!ts.length)return'There\'s nothing to use it on.';if(!ts.includes(mv.tg))return'Pick a target.';tg=findM(s,mv.tg)}}
   if(P.pool+P.grove.filter(g=>!g.stump).reduce((a,g)=>a+g.mana,0)<cost)return'Not enough Mana: chop more trees, or plant one.';
   if(!autoChop(s,i,cost))return'Not enough Mana.';P.pool-=cost;P.hand.splice(h,1);P.played++;
   if(c.kind==='mon'){const m=summon(s,i,c.id);if(!m)return'';L(s,P.n+' plays '+c.n+'.');s.fx.push({t:'play',side:i,uid:m.uid});
    if(P.comp==='dog'&&P.played===1){m.atk++;L(s,'Loyal: '+m.n+' gets +1 ATK.')}
    if(P.comp==='gmith'&&(m.id2==='wb:giant'||m.id2==='thorn'||m.id2==='turtle')){m.hp+=2;m.max+=2}
    if(m.id2==='wb:wisp')m.sleep=false;
    if(m.id2==='wb:dragon'){for(const o of O.board.slice())hurtMon(s,1-i,o,2,m);L(s,'The Dragon breathes fire on every enemy monster!')}
    if(m.id2==='emberl')hurtHero(s,1-i,3,'Emberlord');
    if(m.id2==='ib:briarwood'){summon(s,i,'_sp',{n:'Spiderling',hp:1,atk:1});summon(s,i,'_sp',{n:'Spiderling',hp:1,atk:1})}
    if(m.id2==='ib:shattered'){const b=O.board.filter(o=>o.boss&&!o.mute);if(b.length){const t=pick(s,b);t.mute=true;L(s,'The Void Herald silences '+t.n+'.')}}
    if(m.id2==='ib:nomans'&&O.hand.length){const j=Math.floor(rnd(s)*O.hand.length),st=O.hand.splice(j,1)[0];if(P.hand.length<MAXH)P.hand.push(st);L(s,'Black Jack steals a card!')}
    if(m.boss&&O.comp==='voidl'&&!O.cf.voidl){O.cf.voidl=1;m.mute=true;L(s,O.n+'\'s Voidling silences '+m.n+'.')}
    sweep(s);return''}
   // spells
   const sp=c.id,[ti,tm]=tg||[-1,null];L(s,P.n+' uses '+c.n+'.');
   if(sp==='pot_heal')P.hp+=6;else if(sp==='nuts')P.hp+=2;else if(sp==='shroom')draw(s,i);
   else if(sp==='pot_str')tm.atk+=2;else if(sp==='pot_iron'){tm.hp+=3;tm.max+=3;tm.guard=true}else if(sp==='pot_swift')tm.done=false;
   else if(sp==='pot_poison')tm.poison=1;else if(sp==='pot_napalm'){for(const o of O.board.slice())hurtMon(s,1-i,o,2)}else if(sp==='pot_zap')hurtMon(s,ti,tm,4);
   else if(sp==='berry'){tm.hp++;tm.max++}else if(sp==='cfruit')tm.hp=tm.max;
   sweep(s);return''}
  if(mv.t==='atk'){const[ai,a]=findM(s,mv.a);if(ai!==i||!a)return'Pick one of your monsters.';if(a.sleep)return a.n+' was just played: it can attack next turn.';if(a.done)return a.n+' has already attacked.';if(a.frozen>0)return a.n+' is frozen.';
   const ts=targets(s,i,a.uid);if(!ts.includes(mv.tg))return guards(s,1-i).length?'A monster with Guard is in the way: attack it first.':'Pick a target.';
   a.done=true;const av=atkOf(s,i,a);s.fx.push({t:'atk',a:a.uid,tg:mv.tg});
   if(mv.tg==='h'+(1-i)){L(s,a.n+' hits '+O.n+' for '+av+'.');hurtHero(s,1-i,av,a.n,true)}
   else{const[,d]=findM(s,mv.tg);const dv=atkOf(s,1-i,d);L(s,a.n+' fights '+d.n+'.');hurtMon(s,1-i,d,av,a);hurtMon(s,i,a,dv,d);
    if(d.id2==='thorn'&&!d.mute)hurtMon(s,i,a,1);if(isWolf(d)&&O.comp==='pbriar')hurtMon(s,i,a,1)}
   sweep(s);return''}
  return'Unknown move.'}
 // ---- what a side may do now (for the screen and Ace) ----
 function options(s,i){const P=s.p[i],out=[];if(s.over||s.cur!==i)return out;const avail=P.pool+P.grove.filter(g=>!g.stump).reduce((a,g)=>a+g.mana,0);
  P.hand.forEach((k,h)=>{if(k==='_sapling'){out.push({t:'play',h});return}const c=card(k);if(!c)return;
   if(c.kind==='tree'){if(!P.planted&&groveMana(P)+c.mana<=MAXM)out.push({t:'plant',h});return}
   if(costOf(s,i,c)>avail)return;if(c.kind==='mon'){if(P.board.length<MAXB)out.push({t:'play',h});return}
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
 window.SQDCE={mirror,flipMv,chopPlan,card,create,apply,options,targets,spellTargets,costOf,atkOf,guards,findM,clone,POW,SPELL,COMP,MAXB,MAXH,MAXM,HERO,short,groveMana:P=>groveMana(P)}})();
