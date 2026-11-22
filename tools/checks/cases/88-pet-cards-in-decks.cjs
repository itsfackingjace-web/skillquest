// Nov 22 (Jace): pet cards go in the deck, cost 1-4 Mana to summon beside your hero, have HP and ATK, can be attacked and targeted,
// and their powers work while they're out; the other player's pets show and open a close-up; cards are dragged onto the table and
// onto targets; the Dev Suite sets a pet card's power, cost and stats. Also: wolf powers never worked (isWolf read m.id), and loading
// a save cut every deck's trees to 2 (the Starter Deck came back with 16 cards).
module.exports={name:'pet cards in decks, drag to play and attack, Dev Suite pet card settings',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);const E=SQDCE,M=SQDCM,B=SQBINDER,D=SQDROPCARD,out={};
  const k=x=>D.CARDS[x].key,tree=(n,m)=>({key:k(n),n,mana:m,stump:false});
  // ---- the rules ----
  out.cards=['pc_pet_dog','pc_pet_cat','pc_pet_pglow'].map(x=>{const c=E.card(x);return[c.kind,c.comp,c.cost,c.hp,c.atk]});
  const s=E.create({seed:3,decks:[Array(20).fill(k('tree')),Array(20).fill(k('tree'))],pets:[null,null],names:['A','B']});const A=s.p[0],O=s.p[1];
  A.grove=[tree('willow',3),tree('maple',4)];A.hand=['pc_pet_dog','pc_pet_dog',k('wolf'),'pc_pet_imp','pc_pet_fox'];
  out.summon=E.apply(s,0,{t:'play',h:0});const pet=A.board.find(m=>m.pet);out.pet=pet&&[pet.comp,pet.hp,pet.atk,pet.sleep,A.grove.filter(g=>g.stump).length];
  out.summon2=E.apply(s,0,{t:'play',h:0});out.dogs=E.has(A,'dog');
  // two dogs: the first monster this turn gets +2 ATK
  A.pool+=5;out.wolf=E.apply(s,0,{t:'play',h:0});const wolf=A.board.find(m=>!m.pet);out.wolfAtk=wolf&&wolf.atk;
  // a third pet fits, a fourth doesn't; pets don't take monster slots
  out.third=E.apply(s,0,{t:'play',h:0});A.hand.push('pc_pet_cat');A.pool+=9;out.fourth=E.apply(s,0,{t:'play',h:A.hand.length-1});out.mons=[E.mons(A).length,E.petsOut(A).length];
  // the imp jabs at the end of the turn; the enemy can attack a pet
  O.board.push({uid:'zz',id2:'bat',n:'Bat',hp:3,max:3,atk:2,sleep:false,done:false,side:1,poison:0,frozen:0});
  E.apply(s,0,{t:'end'});out.jab=O.board.find(m=>m.uid==='zz').hp;
  const dog=A.board.find(m=>m.pet&&m.comp==='dog');out.canHitPet=E.targets(s,1,'zz').includes(dog.uid);out.hitPet=E.apply(s,1,{t:'atk',a:'zz',tg:dog.uid});out.dogHp=dog.hp;
  // a spell can target a pet
  out.zapTargets=E.spellTargets(s,1,E.card(k('pot_zap'))).includes(A.board.find(m=>m.pet).uid);
  // wolves: the Frostfang Alpha gives the other wolves +1 ATK
  {const s2=E.create({seed:4,decks:[[k('tree')],[k('tree')]],pets:[null,null],names:['A','B']});s2.p[0].grove=[tree('yew',5),tree('yew',5),tree('yew',5)];s2.p[0].hand=[k('wolf'),k('alpha')];
   E.apply(s2,0,{t:'play',h:0});E.apply(s2,0,{t:'play',h:0});const w=s2.p[0].board.find(m=>m.id2==='wolf');out.alpha=E.atkOf(s2,0,w)}
  // the cat keeps its hero at 1 HP once
  {const s3=E.create({seed:5,decks:[[k('tree')],[k('tree')]],pets:[null,null],names:['A','B']});s3.p[0].grove=[tree('yew',5)];s3.p[0].hand=['pc_pet_cat'];E.apply(s3,0,{t:'play',h:0});
   s3.p[0].hp=2;E.apply(s3,0,{t:'end'});s3.p[1].board.push({uid:'yy',id2:'demo',n:'Ogre',hp:9,max:9,atk:5,sleep:false,done:false,side:1,poison:0,frozen:0});E.apply(s3,1,{t:'atk',a:'yy',tg:'h0'});out.cat=[s3.p[0].hp,s3.over]}
  // ---- the binder ----
  inv.pc_pet_dog=2;inv.pc_pet_cat=1;B.giveStarter();const d=B.decks[0];d.c.pc_pet_dog=2;
  const sv=snap();sv.dcd.d[0].pet='pc_pet_cat';applySave(JSON.parse(JSON.stringify(sv)));await W(400);const d2=SQBINDER.decks[0];
  out.reload=[d2.c[k('tree')],d2.c.pc_pet_dog,d2.c.pc_pet_cat,Object.values(d2.c).reduce((a,b)=>a+b,0),!!d2.pet,B.problems(d2).length];
  out.desc=IDESC.pc_pet_dog;
  // a Starter Deck that an older game saved with 2 Trees gets its 6 back
  {const sv2=JSON.parse(JSON.stringify(sv));sv2.dcd.d[1]={n:'Starter Deck',c:Object.assign({},sv2.dcs.c,{[k('tree')]:2}),pet:null};applySave(sv2);await W(300);out.starterFix=SQBINDER.decks[1].c[k('tree')]}
  // ---- the table: your pet and Ace's, close-ups ----
  window.SQDCMFAST=true;M.start('normal');await W(100);const st=M.m.s,P0=st.p[0];
  P0.grove=[tree('yew',5),tree('yew',5)];P0.hand=['pc_pet_dog',k('slime'),k('pot_zap'),k('tree')];st.p[1].board.push({uid:'ace1',id2:'pet:dog',key:'pc_pet_dog',n:'Dog',hp:2,max:2,atk:2,sleep:false,done:false,side:1,poison:0,frozen:0,mute:false,pet:true,comp:'dog',cf:{}});M.render();
  const el=M.el,q=x=>el.querySelector(x);out.foePets=el.querySelectorAll('.dcm-pets.foe .dcm-card').length;
  q('.dcm-pets.foe [data-dcm="m:ace1"]').click();await W(50);out.foeZoom=[!!q('.dcm-zoom'),/Pet power/.test((q('.dcm-zoom')||{}).textContent||''),/Loyal/.test((q('.dcm-zoom')||{}).textContent||'')];q('.dcm-zoom').click();await W(30);
  q('[data-dcm="c:0"]').click();await W(50);out.summonBtn=(q('.dcm-zoom [data-dcm="play"]')||{}).textContent;q('.dcm-zoom [data-dcm="play"]').click();await W(50);
  out.myPets=el.querySelectorAll('.dcm-pets.me .dcm-card').length;out.board=el.querySelectorAll('.dcm-board.me .dcm-card').length;
  // ---- dragging ----
  const ev=(node,type,x,y)=>node.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:7,pointerType:'mouse',button:0,buttons:type==='pointerup'?0:1,clientX:x,clientY:y}));
  const ctr=n=>{const b=n.getBoundingClientRect();return[b.left+b.width/2,b.top+b.height/2]};
  const drag=async(from,to)=>{const[a,b]=ctr(from),[c,d2]=Array.isArray(to)?to:ctr(to);ev(from,'pointerdown',a,b);ev(el,'pointermove',a+6,b-4);ev(el,'pointermove',(a+c)/2,(b+d2)/2);await W(30);const mid=[!!el.querySelector('.dcm-ghost,.dcm-arrow'),!!el.querySelector('.dcm-dragsrc')];ev(el,'pointermove',c,d2);await W(20);ev(el,'pointerup',c,d2);el.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:c,clientY:d2}));await W(60);return mid};
  // a tap (no movement) still opens the close-up
  {const b=q('[data-dcm="c:0"]');const[a,b2]=ctr(b);ev(b,'pointerdown',a,b2);ev(b,'pointerup',a,b2);b.click();await W(40);out.tap=!!q('.dcm-zoom');q('.dcm-zoom').click();await W(30)}
  // drag the slime onto the table: played
  const slimeAt=()=>P0.hand.indexOf(k('slime'));out.dragPlay=await drag(q('[data-dcm="c:'+slimeAt()+'"]'),q('.dcm-board.foe'));out.played=[P0.hand.includes(k('slime')),E.mons(P0).length];
  // drag the tree back onto your hand: nothing happens
  const ti=P0.hand.indexOf(k('tree'));await drag(q('[data-dcm="c:'+ti+'"]'),q('.dcm-hand'));out.backToHand=[P0.hand.includes(k('tree')),P0.grove.length];
  // drag the Zap potion onto Ace's dog
  out.dragZap=await drag(q('[data-dcm="c:'+P0.hand.indexOf(k('pot_zap'))+'"]'),q('[data-uid="ace1"]'));out.zapped=[P0.hand.includes(k('pot_zap')),st.p[1].board.some(m=>m.uid==='ace1')];
  // next turn: drag your dog onto Ace's hero to attack
  P0.board.forEach(m=>{m.sleep=false;m.done=false});const myDog=P0.board.find(m=>m.pet);const hp0=st.p[1].hp;M.render();
  out.dragAtk=await drag(q('[data-uid="'+myDog.uid+'"] .dcm-card'),q('[data-dcm="h:h1"]'));out.atk=[hp0-st.p[1].hp,myDog.done,!!M.m.zoom];
  M.close();window.SQDCMFAST=false;
  // ---- Dev Suite: a pet card's power, cost and stats ----
  SQA.preview(Object.assign({},SQA.live||{},{petcards:{pet_dog:{p:'imp',c:1,h:6,a:3}}}));await W(100);const c2=E.card('pc_pet_dog');out.lib=[c2.comp,c2.cost,c2.hp,c2.atk,/^Pet card · Cost 1 · 6 HP 3 ATK\. Pest/.test(IDESC.pc_pet_dog)];SQA.preview(null);await W(100);out.libBack=E.card('pc_pet_dog').comp;
  window.SQDEV=()=>true;SQSUITE.open();await W(700);const sq=x=>document.querySelector('#dvs '+x);sq('[data-tab="cards"]').click();await W(250);
  const pb=sq('[data-dcp="pet_dog"]');out.suiteList=!!pb;if(pb){pb.click();await W(100);const sel=sq('[data-dcpf="p"]'),cost=sq('[data-dcpf="c"]');out.suiteEd=[!!sel,sel&&sel.value,cost&&cost.value];
   cost.value='3';cost.dispatchEvent(new Event('change',{bubbles:true}));await W(50);sq('[data-dcx="psave"]').click();await W(300);out.suiteSaved=SQSUITE.state.draft.petcards&&SQSUITE.state.draft.petcards.pet_dog}
  SQSUITE.close();return out});
 t.eq(r.cards,[['pet','dog',2,2,2],['pet','cat',4,3,2],['pet','glow',1,1,1]],'pet cards [kind, power, cost, HP, ATK]');
 t.eq(r.summon,'','summoning a pet');t.eq(r.pet,['dog',2,2,true,1],'the pet [power, HP, ATK, waits a turn, trees chopped]');t.eq([r.summon2,r.dogs],['',2],'a second dog');
 t.eq([r.wolf,r.wolfAtk],['',4],'two dogs give the first monster +2 ATK (a 2 ATK wolf)');
 t.eq([r.third,r.fourth],['','You already have 3 pets out.'],'up to 3 pets');t.eq(r.mons,[1,3],'pets don\'t take monster slots [monsters, pets]');
 t.eq(r.jab,2,'the imp jabbed the enemy bat at the end of the turn');t.eq([r.canHitPet,r.hitPet,r.dogHp],[true,'',0],'a pet can be attacked');t(r.zapTargets,'a spell can target a pet');
 t.eq(r.alpha,3,'the Frostfang Alpha gives a 2 ATK wolf +1');t.eq(r.cat,[1,false],'the cat keeps its hero at 1 HP');
 t.eq(r.reload,[6,2,1,23,false,0],'a deck after reloading [trees, dogs, the old Companion moved in, cards, Companion slot used, problems]');
 t(/^Pet card · Cost 2 · 2 HP 2 ATK\. Loyal/.test(r.desc),'pet card text: '+r.desc);t.eq(r.starterFix,6,'a Starter Deck cut to 2 Trees gets its 6 back');
 t.eq(r.foePets,1,'Ace\'s pet shows beside Ace');t.eq(r.foeZoom,[true,true,true],'tapping Ace\'s pet [close-up, pet power, its text]');
 t.eq(r.summonBtn,'SUMMON','a pet card in hand says SUMMON');t.eq([r.myPets,r.board],[1,0],'your summoned pet sits beside you [pets, monsters on the board]');
 t(r.tap,'a tap without moving opens the close-up');
 t.eq(r.dragPlay,[true,true],'dragging a card [copy under the pointer, card dimmed]');t.eq(r.played,[false,1],'a monster dragged onto the table is played');
 t.eq(r.backToHand,[true,2],'a tree dropped back on the hand stays there');
 t.eq(r.zapped,[false,false],'Zap dragged onto Ace\'s dog [still in hand, dog still there]');
 t.eq(r.dragAtk,[true,true],'dragging an attacker [arrow, card dimmed]');t.eq(r.atk,[2,true,false],'your dog dragged onto Ace attacks him [damage, done, no close-up opened]');
 t.eq(r.lib,['imp',1,6,3,true],'library petcards changes a pet card [power, cost, HP, ATK, text]');t.eq(r.libBack,'dog','back to its own power without it');
 t(r.suiteList,'Dev Suite > Cards lists the pet cards');t.eq(r.suiteEd,[true,'dog','2'],'the pet card editor [power picker, power, cost]');
 t.eq(r.suiteSaved,{p:'dog',c:3,h:2,a:2},'saved to the draft')}};
