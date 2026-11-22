// Nov 21 (Jace vs Bear): "the games kept ending after the first turn", after the first match played out fine. The duel record is the
// same path for every match between two players, and each game kept sending the last match's moves while the next one was set up; the
// other game replayed them on the first turn, saw the two games disagree and stopped the match as a draw. Two matches in a row here,
// with Bob changing his deck (a Webling Companion) in between: the second one must play out to a winner on both screens.
module.exports={name:'Drop Card: a second match against the same player plays out',players:2,async run([A,B],t){
 const W=ms=>A.waitForTimeout(ms);
 const pos=await A.evaluate(()=>({x:P.x,y:P.y}));await B.evaluate(p=>{P.x=p.x+20;P.y=p.y},pos);
 for(const p of[A,B])await p.evaluate(()=>{SQBINDER.giveStarter();GLD=5000;window.SQDCMFAST=true;const _s=say;say=function(t){(window.__says=window.__says||[]).push(String(t));return _s.apply(this,arguments)}});
 const ids=[await A.evaluate(()=>SQDUELAPI.me()),await B.evaluate(()=>SQDUELAPI.me())];
 for(let i=0;i<30;i++){const ok=await A.evaluate(u=>!!SQMP.players.get(u),ids[1])&&await B.evaluate(u=>!!SQMP.players.get(u),ids[0]);if(ok)break;await W(300)}
 const dl=(p,a,v)=>p.evaluate(([a,v])=>{const b=pbd.querySelector('[data-dl="'+a+'"]'+(v?'[data-v="'+v+'"]':''));if(b)b.click();return!!b},[a,v]);
 const view=p=>p.evaluate(()=>{const M=SQDCM.m;if(!M)return null;const s=M.s;return{turn:s.turn,over:s.over,win:s.win,end:(SQDCM.el.textContent||'').slice(0,0)}});
 const play=p=>p.evaluate(()=>{const M=SQDCM.m;if(!M||!M.pvp||M.s.over||M.s.cur!==0)return;const mv=SQDCM.aceMove(M.s,0,'normal');if(!SQDCM.act(mv))SQDCM.act({t:'end'})});
 async function match(n){
  await A.evaluate(u=>SQDUELAPI.ask(u,'card'),ids[1]);await W(1500);await B.evaluate(u=>SQDUELAPI.answer(u,true),ids[0]);await W(2000);
  const st=[await A.evaluate(()=>SQDUEL.state.st),await B.evaluate(()=>SQDUEL.state.st)];if(st[0]!=='stake'||st[1]!=='stake')return{err:'match '+n+': no stake screen '+st};
  await dl(A,'g','100');await dl(B,'g','100');await W(1500);await dl(A,'ok1');await dl(B,'ok1');await W(1500);await dl(A,'ok2');await dl(B,'ok2');
  for(let i=0;i<40;i++){if(await A.evaluate(()=>!!(SQDCM.m&&SQDCM.m.pvp))&&await B.evaluate(()=>!!(SQDCM.m&&SQDCM.m.pvp)))break;await W(300)}
  let maxTurn=0;for(let i=0;i<1500;i++){await play(A);await play(B);await W(40);const a=await view(A),b=await view(B);if(a)maxTurn=Math.max(maxTurn,a.turn);if(a&&b&&a.over&&b.over)break}
  await W(2500);const a=await view(A),b=await view(B);
  const said=[await A.evaluate(()=>(window.__says||[]).join(' | ')),await B.evaluate(()=>(window.__says||[]).join(' | '))];
  for(const p of[A,B])await p.evaluate(()=>{window.__says=[];try{SQDCM.close()}catch(e){}});
  for(let i=0;i<20;i++){if(await A.evaluate(()=>SQDUEL.state.st==='idle')&&await B.evaluate(()=>SQDUEL.state.st==='idle'))break;await W(300)}
  return{a,b,maxTurn,said}}
 const m1=await match(1);t(!m1.err,m1.err||'');if(m1.err)return;
 t(m1.a&&m1.a.over&&m1.a.win>=0,'the first match had no winner: '+m1.said[0].slice(-200));
 // Bob changes his deck: a Webling Companion
 await B.evaluate(()=>{const k='pc_pet_pweb';SQBINDER.regPet('pet_pweb');inv[k]=1;SQBINDER.decks[SQBINDER.active].pet=k});
 await W(9000);
 const m2=await match(2);t(!m2.err,m2.err||'');if(m2.err)return;
 t(m2.maxTurn>4,'the second match stopped at turn '+m2.maxTurn+': '+m2.said[0].slice(-240));
 t(m2.a&&m2.b&&m2.a.over&&m2.b.over&&m2.a.win>=0&&m2.a.win===1-m2.b.win,'the second match had no winner both screens agree on: '+JSON.stringify([m2.a,m2.b])+' '+m2.said[0].slice(-240));
 t(!/out of step/.test(m2.said.join(' ')),'"out of step" in the second match');
 for(const p of[A,B])await p.evaluate(()=>{window.SQDCMFAST=false})}};
