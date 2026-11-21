// ---- 262. Drop Cards, part 2: the Card Binder, Drop Card for Dummies, pet / potion / forage cards (window.SQBINDER) ----
// Nov 20 (Jace): "how will players organize their decks? where will they carry their cards?", pet cards from releasing a pet
// ("Every pet can become a card"), potion and forage cards, and "an item called Drop Card for Dummies ... a guide on all things Drop
// Card ... sold at Hollow Village's General Store for 1 gold". Works with touch, mouse and controller (every control is a <button>,
// which 023's navItems walks).
// - Card Binder (`dc_binder`, given with your first card or the guide): the bag shows it instead of the cards (bagGridHTML shows
//   the bag with card counts hidden for that one call), so 43+ card kinds take one bag slot. The cards stay ordinary items, so
//   trades, the World Market and chests still list them. OPEN shows panel BTAB: Collection (every card, owned or not, filters),
//   Decks (3 decks: 20 cards, at most 2 of a card (trees: no limit), 1 of each boss, at least 4 trees, plus 1 pet card as the Companion) and the guide.
// - Drop Card for Dummies (`dc_guide`, General Store, 1 gold): READ opens the binder's guide pages.
// - Pet cards `pc_<pet item>`: releasing a pet (104, window.SQPETREL) always gives its card. Registered for every pet item now and
//   after library changes (SQA.onApply), and for any `pc_` key in a save before it loads (a pet added later still keeps its card).
//   Picture: the pet's own bag icon on a teal card.
// - Potion cards: 1% per brew (218's brewOne, window.SQBREWED). Forage cards: 1% per HIT that raised berries, mushrooms, nuts or
//   cactus fruit. Both are 253's CARDS rows (groups potion / forage).
// - Save: `dcd` {a: active deck, d: [{n, c:{key:count}, pet}]}, always written.
(()=>{const D=window.SQDROPCARD;if(!D)return;const BTAB=52,GUIDE='dc_guide',BIND='dc_binder';
 const IC={"guide":{"w":14,"h":14,"s":2,"p":"#202020,#f8d838,#a07818,#2050c0,#303030","d":"................0000000000....01111111102...01222222102...01233332102...01222222102...01111111102...01444444102...01111111102...01444441102...01111111102...00000000002....2222222222..............."},"binder":{"w":14,"h":14,"s":2,"p":"#3a1c0c,#8a4a20,#d0c658,#c0a060,#7e4210,#3175b4","d":"................0000000000...301111111102..301222221102..301245421102..301222221102..301111111102..301222221102..301245421102..301222221102..301111111102...00000000002....2222222222..............."}};
 // ---- the two items ----
 const item=(k,n,d,v)=>{if(!INVK.includes(k))INVK.push(k);INAME[k]=n;SN[k]=n;SHORT[k]=n.toLowerCase();SELLP[k]=v;IDESC[k]=d;inv[k]=inv[k]|0;if(!EXTRA_BAG.includes(k))EXTRA_BAG.push(k)};
 item(GUIDE,'Drop Card for Dummies','A guide to all things Drop Card: the cards, your binder, building a deck and how a match is played. Tap READ.',1);
 item(BIND,'Card Binder','Holds all your Drop Cards and your decks. Tap OPEN.',0);
 GEN.push({n:'Drop Card for Dummies',c:1,f:()=>{inv[GUIDE]=(inv[GUIDE]|0)+1;giveBinder();const st=giveStarter();say('Drop Card for Dummies!'+(st?' It came with a free Starter Deck, already in your Card Binder.':'')+' Find it in your bag and tap READ.');msgT=6}});
 // ---- the Starter Deck (Nov 20): 20 bound cards, given once with the first guide; they live only in the binder (never in inv, so
 // they can't be traded, sold or stored) and fill Deck 1 if it's empty. Saved as `dcs` {g: given, c: {key: count}}.
 let STARTER={},SG=0;
 const SDECK=[['tree',6],['oak',2],['slime',2],['slime:moss',2],['wolf',2],['skel',2],['bat',2],['pot_heal',2]];
 const shOf=k=>{const C=D.ITEM[k];return C&&C.key===k?C.sh:null},shiny=k=>{const h=shOf(k);return h?inv[h]|0:0};
 const owned=k=>(inv[k]|0)+shiny(k)+(STARTER[k]|0);
 function giveStarter(){if(SG)return false;SG=1;STARTER={};for(const[ck,n]of SDECK){const C=D.CARDS[ck];if(C)STARTER[C.key]=(STARTER[C.key]|0)+n}
  if(!Object.keys(DECKS[0].c).length){DECKS[0].c=Object.assign({},STARTER);DECKS[0].n='Starter Deck'}try{saveLocal(true)}catch(e){self.SQERR&&SQERR(e,'254-12')}return true}
 SQSAVE.after('254:dcs',s=>{s.dcs={g:SG,c:STARTER}});
 SQLOAD.after('254 starter',(S)=>{const v=S&&S.dcs;SG=v&&v.g?1:0;STARTER={};if(v&&v.c)for(const k in v.c){const n=Math.max(0,Math.min(20,v.c[k]|0));if(n)STARTER[k]=n}});
 const ICC={};
 SQICON.wrap('254 binder',_ic=>function(k,col){
  if((k===GUIDE||k===BIND)&&!(window.SQA&&SQA.hasIcon&&SQA.hasIcon(k))){if(!ICC[k])try{ICC[k]=SQA.render(k===GUIDE?IC.guide:IC.binder).toDataURL()}catch(e){self.SQERR&&SQERR(e,'254-1')}if(ICC[k])return ICC[k]}
  if(PET[k]&&!(window.SQA&&SQA.hasIcon&&SQA.hasIcon(k)))return petIcon(k)||_ic(k,col);
  return _ic(k,col)});
 function giveBinder(){if((inv[BIND]|0)<1){inv[BIND]=1;return true}return false}
 // ---- pet cards ----
 const PET={};// card key -> {pet item key, n}
 // Companion powers (rules draft); pets made later get Friendly until the Dev Suite picks one
 const POW={"pet_cat": "Nine lives: once per match, when your hero would fall to 0 HP, it stays at 1.", "pet_dog": "Loyal: the first monster you play each turn gets +1 ATK.", "pet_slime": "Squish: once per turn, give one of your monsters +1 HP.", "pet_fox": "Clever: start the match with 1 extra card in your hand.", "pet_imp": "Pest: at the end of your turn, 1 damage to a random enemy monster.", "pet_pwolf": "Pack leader: your wolf cards get +1 ATK.", "pet_pbriar": "Thorny pack: monsters that attack your wolves take 1 damage.", "pet_psnow": "Thick coat: your wolf cards get +2 HP.", "pet_pvoid": "Void pack: your wolf cards get +1 ATK and Charge.", "pet_ptree": "Once per turn, regrow one Tree stump.", "pet_ptoak": "Once per turn, regrow one stump worth 2 Mana or less.", "pet_ptwil": "Once per turn, regrow one stump worth 3 Mana or less.", "pet_ptmap": "Once per turn, regrow one stump worth 4 Mana or less.", "pet_ptyew": "Once per turn, regrow any one stump.", "pet_ptpine": "Evergreen: when you plant a tree, draw a card.", "pet_ptdead": "Rot: when one of your monsters dies, gain 1 Mana this turn.", "pet_ptvoid": "Void sap: when you chop a tree, 1 damage to a random enemy monster.", "pet_psquir": "Stash: your forage cards cost 1 less, and once per match draw a forage card from your deck.", "pet_pgiron": "Iron skin: your hero takes 1 less damage from the first hit each turn.", "pet_pggold": "Golden: your hero starts the match with 23 HP.", "pet_pgmith": "Mithril wall: your Guard monsters get +2 HP.", "pet_pgadam": "Adamant skin: your hero takes 1 less damage from every monster hit.", "pet_pweb": "Web: every other turn, a random enemy monster can't attack on its next turn.", "pet_pvoidl": "Silence: once per match, remove the power of one enemy boss.", "pet_pmush": "Spores: every third turn, draw a card.", "pet_pglow": "Glow: the first time each turn your hero takes damage, heal 1 HP."};
 const PFR={w:14,h:14,s:2,p:'#104848,#b0e8e0,#289890',d:'...02020202.....2111111110....0111111112....2111111110....0111111112....2111111110....0111111112....2111111110....0111111112....2111111110....0111111112....2111111110....0111111112.....20202020...'};
 function regPet(pk,name){const k='pc_'+pk;const raw=String(name||(window.EQ&&EQ[pk]&&EQ[pk].n)||pk.replace(/^pet_/,'')),n='Pet Card: '+raw.charAt(0).toUpperCase()+raw.slice(1);
  PET[k]={pk,n};if(!INVK.includes(k))INVK.push(k);INAME[k]=n;SN[k]=n+' cards';SHORT[k]=n.toLowerCase();SELLP[k]=5;inv[k]=inv[k]|0;
  IDESC[k]='Companion. '+(POW[pk]||'Friendly: once per match, heal your hero 3 HP.');if(!EXTRA_BAG.includes(k))EXTRA_BAG.push(k);return k}
 const petKeys=()=>Object.keys(window.EQ||{}).filter(k=>EQ[k]&&EQ[k].slot==='pet');
 const regAll=()=>{for(const k of petKeys())regPet(k)};regAll();
 try{SQA.onApply(()=>{try{regAll()}catch(e){self.SQERR&&SQERR(e,'254-2')}})}catch(e){self.SQERR&&SQERR(e,'254-3')}
 SQLOAD.before('254 pet cards',(S)=>{try{regAll();if(S&&S.inv)for(const k in S.inv)if(/^pc_[\w:-]+$/.test(k)&&!PET[k])regPet(k.slice(3))}catch(e){self.SQERR&&SQERR(e,'254-4')}});
 const PIC={};
 function petIcon(k){if(PIC[k]&&PIC[k].url)return PIC[k].url;if(PIC[k])return PIC[k].base;
  const c=SQA.render(PFR),base=c.toDataURL();PIC[k]={base};const P=PET[k],src=iconURL(P.pk);
  const im=new Image();im.onload=()=>{try{const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(im,7,6,14,14);PIC[k].url=c.toDataURL();if(pnOpen)rPn()}catch(e){self.SQERR&&SQERR(e,'254-5')}};im.src=src;return base}
 (window.SQPETREL=window.SQPETREL||[]).push(pk=>{const k=regPet(pk);inv[k]=(inv[k]|0)+1;giveBinder();setTimeout(()=>{try{say('A Drop Card! '+INAME[k]+'. It\'s in your Card Binder.');msgT=5;sfx('level')}catch(e){self.SQERR&&SQERR(e,'254-6')}},50)});
 // ---- potion and forage cards ----
 (window.SQBREWED=window.SQBREWED||[]).push(pk=>{if(D.CARDS[pk]&&D.roll(pk))D.give(pk,'brew')});
 const FOR=['berry','shroom','nuts','cfruit'];
 SQHIT.wrap('254 forage cards',_a=>function(){const b=FOR.map(k=>inv[k]|0);const out=_a.apply(this,arguments);
  try{for(let i=0;i<FOR.length;i++)if((inv[FOR[i]]|0)>b[i]){if(D.CARDS[FOR[i]]&&D.roll(FOR[i]))D.give(FOR[i],'forage');break}}catch(e){self.SQERR&&SQERR(e,'254-7')}return out});
 // every card you get comes with a binder
 {const _g=D.give;D.give=function(){const r=_g.apply(this,arguments);if(r)giveBinder();return r}}
 // ---- which keys are cards ----
 const ORDER=()=>Object.values(D.CARDS).map(c=>c.key).concat(Object.keys(PET).sort((a,b)=>INAME[a]<INAME[b]?-1:1));
 const info=k=>{const C=D.ITEM[k];if(C)return{k,n:C.n,d:C.d,g:C.g};const P=PET[k];if(P)return{k,n:P.n,d:IDESC[k],g:'pet'};return null};
 const isCard=k=>!!(D.ITEM[k]||PET[k]);
 const BOSSG=new Set(['world','dungeon','island','guild']);
 // ---- bag: one binder instead of every card ----
 {const _bg=bagGridHTML;bagGridHTML=function(){const hid=[];for(const k of ORDER().concat(Object.values(D.CARDS).map(c=>c.sh)))if((inv[k]|0)>0){hid.push([k,inv[k]]);inv[k]=0}
  if(hid.length)giveBinder();let h;try{h=_bg.apply(this,arguments)}finally{for(const[k,n]of hid)inv[k]=n}
  const k=invSel;if(k===BIND)h=h.replace('<div class="bd">','<div class="bd"><button class="use dcb-open" data-dcb="open">OPEN</button>');
  else if(k===GUIDE)h=h.replace('<div class="bd">','<div class="bd"><button class="use dcb-open" data-dcb="read">READ</button>');return h}}
 // ---- decks ----
 let DECKS=[0,1,2].map(i=>({n:'Deck '+(i+1),c:{},pet:null})),ACTIVE=0;
 const deckN=d=>Object.values(d.c).reduce((a,b)=>a+b,0);
 const maxOf=k=>{const i=info(k);return!i?2:BOSSG.has(i.g)?1:i.g==='tree'?20:2};// trees: as many as you like (they're your Mana)
 function problems(d){const out=[],n=deckN(d);if(n!==20)out.push(n<20?'Add '+(20-n)+' more card'+(20-n>1?'s':'')+' (a deck is 20).':'Take out '+(n-20)+' card'+(n-20>1?'s':'')+' (a deck is 20).');
  let trees=0;for(const k in d.c){const i=info(k);if(!i)continue;if(i.g==='tree')trees+=d.c[k];if(d.c[k]>maxOf(k))out.push('Only '+maxOf(k)+' '+i.n.replace(/^Drop Card: /,'')+' allowed.');if(d.c[k]>owned(k))out.push('You only have '+owned(k)+' '+i.n.replace(/^Drop Card: /,'')+'.')}
  if(trees<4)out.push('Add at least '+(4-trees)+' more tree card'+(4-trees>1?'s':'')+' (at least 4).');if(!d.pet)out.push('Optional: pick a pet card as your Companion.');return out}
 SQSAVE.after('254:dcd',s=>{s.dcd={a:ACTIVE,d:DECKS}});
 SQLOAD.after('254',(S)=>{DECKS=[0,1,2].map(i=>({n:'Deck '+(i+1),c:{},pet:null}));ACTIVE=0;const v=S&&S.dcd;if(!v||!Array.isArray(v.d))return;
  v.d.slice(0,3).forEach((d,i)=>{if(!d)return;DECKS[i]={n:String(d.n||'Deck '+(i+1)).slice(0,20),c:{},pet:typeof d.pet==='string'?d.pet:null};if(d.c)for(const k in d.c){const n=Math.max(0,Math.min(2,d.c[k]|0));if(n)DECKS[i].c[k]=n}});ACTIVE=Math.max(0,Math.min(2,v.a|0))});
 // ---- the guide ----
 const GP=[
  ['What is Drop Card?','<p>Drop Card is a card game played with cards you find in SkillQuest. Two players each bring a deck of 20 cards and try to bring the other hero from 20 HP down to 0.</p><p>Every monster, tree, boss, potion, forage plant and pet has its own card. Collect them, build a deck in your <b>Card Binder</b>, and play.</p><p><b>Play now:</b> talk to Ace the Card Sharp at his card table next to the chess table in Hollow Village and play your deck against him on Easy, Normal or Hard. Matches against other players are coming next.</p>'],
  ['Getting cards','<p><b>Monsters:</b> 1% chance to drop their own card when you beat them. Every kind has its own card (a Moss slime drops a Moss slime card).</p><p><b>Trees:</b> 1% chance per chop. Better trees give more Mana.</p><p><b>Bosses:</b> world, dungeon, island and guild bosses each have a rare card (1% for everyone who fought).</p><p><b>Potions:</b> 1% when you brew one. <b>Forage:</b> 1% when you pick berries, mushrooms, nuts or cactus fruit.</p><p><b>Pets:</b> release a pet from your bag and you always get its card.</p><p><b>Starter Deck:</b> your first copy of this book comes with a free 20-card deck, so you can build and play right away. Starter cards stay in your binder (they can\'t be traded or sold). Swap in the cards you find to make it yours.</p><p><b>Unlucky?</b> If you go a long time without finding a card, the next one is guaranteed.</p>'],
  ['Your Card Binder','<p>All your cards live in the Card Binder, so they only take one bag slot. Tap the binder in your bag, then OPEN.</p><p><b>Collection</b> shows every card in the game. Dark ones are cards you haven\'t found yet.</p><p><b>Decks</b> holds 3 decks. Pick one to play with. Cards are still items, so you can trade them, sell them on the World Market or keep spares in a chest.</p>'],
  ['Building a deck','<p>A deck has exactly <b>20 cards</b>:</p><p>- At most <b>2</b> of any monster, potion or forage card.<br>- Only <b>1</b> of each boss card.<br>- At least <b>4 tree cards</b>, or you won\'t have Mana to play anything. Trees have no limit.</p><p>You can also pick one <b>pet card</b> as your Companion. It doesn\'t count toward the 20.</p>'],
  ['The cards','<p><b>Trees</b> (gold): give Mana. Tree, Pine and Dead tree 1, Oak 2, Willow 3, Maple 4, Yew 5, Void tree 6. A cactus gives the Cactus fruit card, not a tree card.</p><p><b>Monsters</b> (gold): fight on the board. ATK is the damage they deal, HP is how much they can take.</p><p><b>Bosses</b>: strong monsters with a power. Red = world, purple = dungeon, blue = island, green = guild.</p><p><b>Potions</b> (pink) and <b>forage</b> (parchment): one-use spells. Each says its cost and what it does.</p><p><b>Pets</b> (teal): your Companion.</p>'],
  ['How to play a turn','<p>1. <b>Draw</b> a card.</p><p>2. <b>Plant</b> one tree from your hand into your Grove. Trees stay all game.</p><p>3. <b>Chop</b> trees to pay for cards: a chopped tree gives its Mana and turns into a stump. Stumps grow back at the start of your next turn.</p><p>4. <b>Play</b> monsters, bosses and spells. A monster costs half its HP + ATK (rounded up). Bosses cost 1 more.</p><p>5. <b>Attack</b> with each monster once: an enemy monster or the enemy hero. New monsters wait a turn.</p><p>6. <b>End turn.</b></p>'],
  ['Fighting','<p>When two monsters fight, each deals its ATK to the other at the same time. A monster at 0 HP is gone.</p><p><b>Guard:</b> a monster with Guard must be attacked first.</p><p><b>Charge:</b> can attack the turn it\'s played.</p><p><b>Arrival:</b> does something when played. <b>Last word:</b> does something when it falls.</p><p>Each boss card has one of these powers.</p>'],
  ['Companions','<p>Your Companion is the pet card you picked for your deck. It sits beside your hero all match and gives a small bonus based on what that pet does in the world: a Dog gives your first monster each turn +1 ATK, an Imp pings an enemy, a treeling regrows a stump. Tap a pet card in your binder to see its power.</p><p>Release a pet from your bag (tap RELEASE twice) to get its card. Releasing is permanent, so choose carefully!</p>'],
  ['Playing with a controller or touch','<p><b>Touch:</b> tap a card to see it, tap again to play it, then tap a target.</p><p><b>Controller:</b> the D-pad or left stick moves between cards, ✕ picks, ○ goes back. The right stick moves a cursor if you prefer pointing.</p><p><b>Mouse:</b> click, or drag a card onto the board.</p>']];
 // ---- the panel ----
 const V={tab:'col',f:'all',sel:null,page:0,deck:0,edit:false,peek:null};// peek: {n, c:{key:n}, s:{key:n}} another player's collection (259)
 const FILT=[['all','All'],['mon','Monsters'],['tree','Trees'],['boss','Bosses'],['spell','Spells'],['pet','Pets'],['shiny','★ Shiny']];// Nov 21: shiny copies stacked under the plain card, with no way to see them: the Shiny filter shows them, the card's details show both
 const inF=(i,f)=>f==='all'||(f==='mon'&&i.g==='reg')||(f==='tree'&&i.g==='tree')||(f==='boss'&&BOSSG.has(i.g))||(f==='spell'&&(i.g==='potion'||i.g==='forage'))||(f==='pet'&&i.g==='pet');
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const short=n=>String(n).replace(/^(Drop|Pet) Card: /,'');
 // Nov 21: opening your own binder always shows your own cards. A peek used to end only on 008's closePanel; a panel shut another
 // way (walking off, another screen opening) left the other player's cards in your binder until a restart.
 function openBinder(tab,keep){if(!keep){V.peek=null;V.sel=null}V.tab=tab||'col';if(tab==='guide')V.page=0;pnOpen=true;ptab=BTAB;pn.style.display='block';rPn();try{sfx('talk')}catch(e){self.SQERR&&SQERR(e,'254-8')}}
 function colHTML(){const pk=V.peek,cnt=k=>pk?(pk.c[k]|0)+(pk.s[k]|0):owned(k),shn=k=>pk?pk.s[k]|0:shiny(k);const face=k=>{const plain=pk?pk.c[k]|0:(inv[k]|0)+(STARTER[k]|0);return(!plain||V.f==='shiny')&&shn(k)&&shOf(k)?shOf(k):k};/* only shiny copies: show the shiny picture */const all=ORDER().map(info).filter(Boolean),L=all.filter(i=>V.f==='shiny'?shn(i.k)>0:inF(i,V.f)),own=all.filter(i=>cnt(i.k)>0).length;const d=DECKS[V.deck];
  let h='<div class="dcb-f">'+FILT.map(([k,n])=>'<button class="dcb-fb'+(V.f===k?' on':'')+'" data-dcb="f:'+k+'">'+n+'</button>').join('')+'</div>';
  h+='<div class="dcb-sub">'+(pk?'<b>'+esc(pk.n)+'</b> has found <b>'+own+'</b> of '+all.length+' cards.':V.edit?'Editing <b>'+esc(d.n)+'</b> ('+deckN(d)+'/20): tap a card, then ADD. <button class="dcb-mini" data-dcb="done">DONE</button>':'You\'ve found <b>'+own+'</b> of '+all.length+' cards.')+'</div><div class="dcb-g">';
  for(const i of L){const n=cnt(i.k),inD=(d.c[i.k]|0)+(d.pet===i.k?1:0);h+='<button class="dcb-c'+(n?'':' no')+(V.sel===i.k?' sel':'')+'" data-dcb="s:'+i.k+'" aria-label="'+esc(n?short(i.n):'Not found yet')+'"><img src="'+iconURL(face(i.k))+'" alt="">'+(n?'<span class="dcb-n">'+n+'</span>':'')+(shn(i.k)?'<span class="dcb-sh" aria-label="Shiny">★</span>':'')+(V.edit&&inD?'<span class="dcb-d">'+inD+'</span>':'')+'</button>'}
  h+='</div>';const s=V.sel&&info(V.sel);
  if(s){const n=cnt(s.k),sn=pk?0:STARTER[s.k]|0;const both=(pk?pk.c[s.k]|0:(inv[s.k]|0)+(STARTER[s.k]|0))&&shn(s.k)&&shOf(s.k);
   h+='<div class="dcb-det">'+(both?'<span class="dcb-pics"><img src="'+iconURL(s.k)+'" alt=""><img src="'+iconURL(shOf(s.k))+'" alt="Shiny"><small>Normal · ★ Shiny</small></span>':'<img src="'+iconURL(face(s.k))+'" alt="">')+'<div><b>'+esc(n?short(s.n):'???')+'</b><br>'+esc(n?s.d:'Not found yet.')+'<br><small>'+(pk?esc(pk.n)+' has ':'You have ')+n+(shn(s.k)?', '+shn(s.k)+' shiny':'')+(sn?' ('+sn+' from the Starter Deck: these stay in your binder)':'')+'.</small>';
   if(V.edit&&!pk&&n){const inD=s.g==='pet'?(d.pet===s.k?1:0):(d.c[s.k]|0),max=s.g==='pet'?1:Math.min(maxOf(s.k),n);
    h+='<div class="dcb-row"><button class="sb dcb-act" data-dcb="add" '+(inD>=max?'disabled':'')+'>ADD ('+inD+'/'+max+')</button><button class="sb dcb-act" data-dcb="rem" '+(inD?'':'disabled')+'>REMOVE</button></div>'}
   h+='</div></div>'}
  return h}
 function deckHTML(){let h='<div class="dcb-f">'+DECKS.map((d,i)=>'<button class="dcb-fb'+(V.deck===i?' on':'')+'" data-dcb="d:'+i+'">'+esc(d.n)+(ACTIVE===i?' ★':'')+'</button>').join('')+'</div>';
  const d=DECKS[V.deck],P=problems(d),ok=P.filter(p=>!/^Optional/.test(p)).length===0;
  h+='<div class="dcb-sub"><b>'+deckN(d)+'/20 cards</b>'+(ok?' · ready to play':'')+'</div>';
  const rows=Object.keys(d.c).map(info).filter(Boolean).sort((a,b)=>ORDER().indexOf(a.k)-ORDER().indexOf(b.k));
  h+='<div class="dcb-list">'+(rows.length?rows.map(i=>'<div class="dcb-li"><img src="'+iconURL(i.k)+'" alt=""><span>'+esc(short(i.n))+' ×'+d.c[i.k]+'</span><button class="dcb-mini" data-dcb="r:'+i.k+'" aria-label="Take one out">-1</button></div>').join(''):'<p>No cards yet. Tap ADD CARDS.</p>')+'</div>';
  h+='<div class="dcb-sub">Companion: '+(d.pet?'<b>'+esc(short(INAME[d.pet]||d.pet))+'</b> <button class="dcb-mini" data-dcb="nopet" aria-label="No companion">X</button>':'none')+'</div>';
  if(P.length)h+='<div class="qc dcb-warn">'+P.map(esc).join('<br>')+'</div>';
  h+='<div class="dcb-row"><button class="sb dcb-act" data-dcb="edit">ADD CARDS</button><button class="sb dcb-act" data-dcb="use" '+(ACTIVE===V.deck?'disabled':'')+'>'+(ACTIVE===V.deck?'PLAYING THIS DECK':'PLAY THIS DECK')+'</button></div>';return h}
 function guideHTML(){const[t,b]=GP[V.page];return'<div class="dcb-book"><div class="dcb-pt">'+esc(t)+'</div>'+b+'</div><div class="dcb-row"><button class="sb dcb-act" data-dcb="pp" '+(V.page?'':'disabled')+'>◀ BACK</button><span class="dcb-pg">'+(V.page+1)+' / '+GP.length+'</span><button class="sb dcb-act" data-dcb="np" '+(V.page<GP.length-1?'':'disabled')+'>NEXT ▶</button></div>'}
 function html(){if(V.peek)return'<div class="dcb"><div class="dcb-t"><button class="dcb-tb" data-dcb="unpeek">◀ My binder</button></div>'+colHTML()+'</div>';const tabs=[['col','Collection'],['deck','Decks'],['guide','Guide']];
  return'<div class="dcb"><div class="dcb-t">'+tabs.map(([k,n])=>'<button class="dcb-tb'+(V.tab===k?' on':'')+'" data-dcb="t:'+k+'">'+n+'</button>').join('')+'</div>'+(V.tab==='col'?colHTML():V.tab==='deck'?deckHTML():guideHTML())+'</div>'}
 SQCLOSEPN.before('254',()=>{if(ptab===BTAB)V.peek=null});
 SQRPN.wrap('254',_r=>function(){if(ptab!==BTAB){V.peek=null;return _r.apply(this,arguments)}try{panelChrome(V.peek?V.peek.n+'\'s cards':V.tab==='guide'?'Drop Card for Dummies':'Card Binder')}catch(e){self.SQERR&&SQERR(e,'254-9')}pbd.innerHTML=html()});
 pbd.addEventListener('click',e=>{const b=e.target.closest('[data-dcb]');if(!b)return;const a=b.dataset.dcb;
  if(a==='open'||a==='read'){e.stopPropagation();e.preventDefault();openBinder(a==='read'?'guide':'col');return}
  if(ptab!==BTAB||!pnOpen)return;e.stopPropagation();e.preventDefault();if(b.disabled)return;const[x,y]=[a.split(':')[0],a.slice(a.indexOf(':')+1)];const d=DECKS[V.deck];
  if(a==='unpeek'){V.peek=null;V.sel=null;V.tab='col'}else if(x==='t'){V.tab=y;V.edit=false;if(y==='guide')V.page=V.page||0}else if(x==='f')V.f=y;else if(x==='s')V.sel=V.sel===y?null:y;
  else if(x==='d')V.deck=+y|0;else if(a==='edit'){V.edit=true;V.tab='col';V.sel=null}else if(a==='done'){V.edit=false;V.tab='deck'}
  else if(a==='use')ACTIVE=V.deck;else if(a==='pp')V.page=Math.max(0,V.page-1);else if(a==='np')V.page=Math.min(GP.length-1,V.page+1);
  else if(a==='nopet')d.pet=null;else if(x==='r'){if(d.c[y]>1)d.c[y]--;else delete d.c[y]}
  else if(a==='add'&&V.sel){const i=info(V.sel);if(i){if(i.g==='pet')d.pet=V.sel;else if((d.c[V.sel]|0)<Math.min(maxOf(V.sel),owned(V.sel)))d.c[V.sel]=(d.c[V.sel]|0)+1}}
  else if(a==='rem'&&V.sel){const i=info(V.sel);if(i&&i.g==='pet'){if(d.pet===V.sel)d.pet=null}else if(d.c[V.sel]>1)d.c[V.sel]--;else delete d.c[V.sel]}
  try{sfx('swish')}catch(err){self.SQERR&&SQERR(err,'254-10')}if(x==='r'||['add','rem','use','nopet'].includes(a))try{saveLocal(true)}catch(err){self.SQERR&&SQERR(err,'254-11')}rPn()},true);
 const st=document.createElement('style');st.textContent=
  '.dcb{font-family:var(--pf);color:#303030}.dcb-t,.dcb-f{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px}'+
  '.dcb-tb,.dcb-fb{min-height:40px;padding:6px 12px;border:2px solid #485870;background:#f8f8f8;color:#303040;font:700 14px var(--pf);border-radius:6px}.dcb-fb{min-height:36px;font-size:13px;padding:4px 10px}'+
  '.dcb-tb.on,.dcb-fb.on{background:#485870;color:#fff}.dcb-sub{margin:6px 0;font-size:14px}'+
  '.dcb-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(56px,1fr));gap:6px}'+
  '.dcb-c{position:relative;min-height:60px;padding:4px;border:2px solid #c8d0e0;background:#fff;border-radius:6px}.dcb-c img{width:42px;height:42px;image-rendering:pixelated}'+
  '.dcb-sh{position:absolute;left:3px;top:1px;color:#e0a010;font-size:15px;text-shadow:0 0 3px #fff6c8}.dcb-c.no img{filter:brightness(0);opacity:.25}.dcb-c.sel{border-color:#3058c8;box-shadow:0 0 0 2px #a8c0f0}'+
  '.dcb-n,.dcb-d{position:absolute;right:2px;bottom:2px;min-width:16px;padding:0 3px;background:#485870;color:#fff;font:700 11px var(--pf);border-radius:4px}.dcb-d{left:2px;right:auto;background:#2a8a3a}'+
  '.dcb-det{display:flex;gap:10px;align-items:flex-start;margin:10px 0;padding:10px;background:#fff;border:2px solid #c8d0e0;border-radius:8px;font-size:14px;line-height:1.4}.dcb-det img{width:70px;height:70px;image-rendering:pixelated;flex-shrink:0}.dcb-pics{display:flex;flex-wrap:wrap;gap:4px;width:144px;flex-shrink:0}.dcb-pics small{width:100%;text-align:center;font-size:11px}'+
  '.dcb-row{display:flex;gap:8px;align-items:center;margin-top:8px}.dcb-row .sb{margin:0;flex:1;min-height:44px;text-align:center}.dcb-pg{font-weight:700;white-space:nowrap}'+
  '.dcb-mini{min-width:44px;min-height:34px;margin-left:6px;border:2px solid #485870;background:#f8f8f8;color:#303040;font:700 14px var(--pf);border-radius:6px}'+
  '.dcb-list{display:flex;flex-direction:column;gap:4px}.dcb-li{display:flex;align-items:center;gap:8px;padding:2px 6px;background:#fff;border:1px solid #d8e0ec;border-radius:6px;font-size:14px}.dcb-li img{width:28px;height:28px;image-rendering:pixelated}.dcb-li span{flex:1}'+
  '.dcb-warn{font-size:13px;line-height:1.45;margin:8px 0}.dcb-book{background:#fffbea;border:2px solid #d8c890;border-radius:8px;padding:12px 14px;font-size:15px;line-height:1.5}.dcb-book p{margin:0 0 8px}.dcb-pt{font-weight:700;font-size:18px;margin-bottom:8px;color:#5a3a10}';
 document.head.appendChild(st);
 window.SQBINDER={peek(n,c,s){V.peek={n:String(n||'?').slice(0,16),c:c||{},s:s||{}};V.sel=null;V.f='all';openBinder('col',true)},ORDER,info,giveStarter,owned,get starter(){return STARTER},open:openBinder,BTAB,GUIDE,BIND,PET,regPet,isCard,problems,get decks(){return DECKS},get active(){return ACTIVE},V,GP}})();
