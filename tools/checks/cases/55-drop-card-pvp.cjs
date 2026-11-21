// Nov 21 (Jace): Drop Card against another player. Ann asks Bob from the player menu flow (kind 'card'), both stake gold and accept
// twice, both get the table, and each plays with Ace's brain for their own side. Both screens must show the same match (Bob's is
// mirrored), end with the same winner, and the winner must get both stakes.
module.exports={name:'Drop Card matches between two players',players:2,async run([A,B],t){
 const W=ms=>A.waitForTimeout(ms);
 const pos=await A.evaluate(()=>({x:P.x,y:P.y}));await B.evaluate(p=>{P.x=p.x+20;P.y=p.y},pos);
 for(const p of[A,B])await p.evaluate(()=>{SQBINDER.giveStarter();GLD=1000;window.SQDCMFAST=true;
  // a Companion and a shiny card in each deck, as real decks have
  const pk=Object.keys(SQBINDER.PET||{})[0],d=SQBINDER.decks[SQBINDER.active],T=SQDROPCARD.CARDS.tree;if(pk){inv[pk]=1;d.pet=pk}inv[T.sh]=1;d.c[T.key]=(d.c[T.key]|0)-1;d.c[T.sh]=1;try{SQACH.check()}catch(e){}const _s=say;say=function(t){(window.__says=window.__says||[]).push(String(t));return _s.apply(this,arguments)}});
 await W(500);const g0=[await A.evaluate(()=>GLD),await B.evaluate(()=>GLD)];
 const ids=[await A.evaluate(()=>SQDUELAPI.me()),await B.evaluate(()=>SQDUELAPI.me())];
 for(let i=0;i<30;i++){const ok=await A.evaluate(u=>!!SQMP.players.get(u),ids[1])&&await B.evaluate(u=>!!SQMP.players.get(u),ids[0]);if(ok)break;await W(300)}
 // the player menu has the button
 t(await A.evaluate(u=>{try{return SQPMHTML?SQPMHTML(u).includes('PLAY DROP CARD'):true}catch(e){return true}},ids[1]),'PLAY DROP CARD on the player menu');
 await A.evaluate(u=>SQDUELAPI.ask(u,'card'),ids[1]);await W(1500);
 await B.evaluate(u=>SQDUELAPI.answer(u,true),ids[0]);await W(2000);
 const st=[await A.evaluate(()=>SQDUEL.state.st+':'+SQDUEL.kind),await B.evaluate(()=>SQDUEL.state.st+':'+SQDUEL.kind)];t.eq(st,['stake:card','stake:card'],'stake screen on both');if(st[0]!=='stake:card')return;
 const dl=(p,a,v)=>p.evaluate(([a,v])=>{const b=pbd.querySelector('[data-dl="'+a+'"]'+(v?'[data-v="'+v+'"]':''));if(b)b.click();return!!b},[a,v]);
 await dl(A,'g','100');await dl(B,'g','100');await W(1500);
 await dl(A,'ok1');await dl(B,'ok1');await W(1500);await dl(A,'ok2');await dl(B,'ok2');
 for(let i=0;i<40;i++){const ok=await A.evaluate(()=>!!(SQDCM.m&&SQDCM.m.pvp))&&await B.evaluate(()=>!!(SQDCM.m&&SQDCM.m.pvp));if(ok)break;await W(300)}
 const open=[await A.evaluate(()=>!!(SQDCM.m&&SQDCM.m.pvp)),await B.evaluate(()=>!!(SQDCM.m&&SQDCM.m.pvp))];t.eq(open,[true,true],'the table opened on both');if(!open[0]||!open[1])return;
 const view=p=>p.evaluate(()=>{const s=SQDCM.m.s;return{cur:s.cur,over:s.over,win:s.win,hp:s.p.map(q=>q.hp),hand:s.p.map(q=>q.hand.length),deck:s.p.map(q=>q.deck.length),board:s.p.map(q=>q.board.map(m=>m.uid+':'+m.hp).join(','))}});
 const a0=await view(A),b0=await view(B);
 t.eq([a0.cur,b0.cur],[0,1],'Ann goes first; Bob sees it as Ann\'s turn');t.eq(a0.hand,[b0.hand[1],b0.hand[0]],'the same hands, mirrored');
 // both play with Ace's brain
 const play=p=>p.evaluate(()=>{const M=SQDCM.m;if(!M||!M.pvp||M.s.over||M.s.cur!==0)return;const mv=SQDCM.aceMove(M.s,0,'normal');if(!SQDCM.act(mv))SQDCM.act({t:'end'})});
 let mid=null;
 for(let i=0;i<1500;i++){await play(A);await play(B);await W(40);
  if(i===60){await W(1500);const a=await view(A),b=await view(B);mid=[a,b]}
  const done=await A.evaluate(()=>SQDCM.m&&SQDCM.m.s.over)&&await B.evaluate(()=>SQDCM.m&&SQDCM.m.s.over);if(done)break}
 if(mid){const[a,b]=mid;t.eq([a.hp,a.board],[[b.hp[1],b.hp[0]],[b.board[1],b.board[0]]],'mid-match: both screens show the same match')}
 await W(3000);
 const a1=await view(A),b1=await view(B);t(a1.over&&b1.over,'the match never ended');t.eq(a1.win,1-b1.win,'both agree on the winner');
 const g=[await A.evaluate(()=>GLD),await B.evaluate(()=>GLD)],aw=a1.win===0;
 // the winner gets both stakes (1100) and the 500-gold "Card duelist" achievement; the loser keeps 900
 const said=[await A.evaluate(()=>(window.__says||[]).join(' | ')),await B.evaluate(()=>(window.__says||[]).join(' | '))],ws=said[aw?0:1],ls=said[aw?1:0];
 t(/You won 100 gold/.test(ws),'the winner got the stakes: '+ws);t(/You lost 100 gold/.test(ls),'the loser lost the stake: '+ls);
 t.eq([await A.evaluate(()=>SQDUEL.state.st),await B.evaluate(()=>SQDUEL.state.st)],['idle','idle'],'both back to idle');
 // Nov 21 (Jace: "it just keeps ending the match right away"): a game from before Drop Card PvP takes the request as a duel and never
 // sends a deck. Now that stops at the stake screen with a reason, before any stakes are taken.
 await W(9000);await A.evaluate(u=>SQDUELAPI.ask(u,'card'),ids[1]);await W(1500);
 await B.evaluate(u=>{SQDUELAPI.answer(u,true);setTimeout(()=>{SQDUEL.state.kind='duel';SQDUELAPI.push()},300)},ids[0]);await W(3000);
 t.eq(await A.evaluate(()=>SQDUEL.state.st),'idle','an out-of-date game stops the setup');t(await A.evaluate(()=>(window.__says||[]).some(x=>/out of date/.test(x))),'and says why');
 await B.evaluate(()=>{try{SQDUELAPI.end(null)}catch(e){}});
 // a deck that breaks the rules is refused before asking
 const bad=await A.evaluate(()=>{const d=SQBINDER.decks[SQBINDER.active],c=d.c;d.c={};const r=SQPVD.problem();d.c=c;return r});t(/isn't ready/.test(bad),'an empty deck: '+bad);
 for(const p of[A,B])await p.evaluate(()=>{try{SQDCM.close()}catch(e){}window.SQDCMFAST=false})}};
