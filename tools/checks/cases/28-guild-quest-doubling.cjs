// Nov 20: each Guild Quest of a skill doubles the next one of that skill (the first stays 100,000 trees). The rules check the
// goal, so a leader can't start an easy one again, and spending ranks on a boss doesn't bring the goal back down.
module.exports={name:'guild quests double for each one finished in that skill',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const G=SQGUILD,A=G.api;
  const until=async(f,ms)=>{const e=Date.now()+ms;while(Date.now()<e){if(f())return true;await W(200)}return false};
  GLD=6e6;A.create('Check Guild','CHK',1);if(!await until(()=>G.id&&A.ready,8000))return{err:'guild was not founded'};
  const out={first:A.goalOf('wood')};const q=()=>G.state.q;
  const finish=async()=>{await A.DB().set(A.ref('guilds/'+G.id+'/q/p'),q().goal);await A.DB().set(A.ref('guilds/'+G.id+'/q/done'),1);await until(()=>q()&&q().done,4000);A.claim(0);return until(()=>!q(),6000)};
  A.pick('wood');await until(()=>q(),4000);out.g1=q()&&q().goal;out.c1=await finish();
  A.pick('wood');await until(()=>q(),4000);out.g2=q()&&q().goal;out.c2=await finish();
  A.pick('mine');await until(()=>q(),4000);out.mine=q()&&q().goal;
  // an easy wood quest written by hand is refused
  await A.DB().set(A.ref('guilds/'+G.id+'/q'),null);await until(()=>!q(),4000);
  try{await A.DB().set(A.ref('guilds/'+G.id+'/q'),{k:'wood',goal:100000,p:0,t:Date.now(),by:A.me()});out.easy='accepted'}catch(e){out.easy='refused'}
  A.pick('wood');await until(()=>q(),4000);out.g3=q()&&q().goal;out.prog=G.state.prog;return out});
 if(r.err){t(false,r.err);return}
 t.eq(r.first,100000,'first wood quest');t.eq(r.g1,100000,'first wood quest started');t(r.c1&&r.c2,'claiming a finished quest failed');
 t.eq(r.g2,200000,'second wood quest');t.eq(r.mine,100000,'first mining quest is unaffected');t.eq(r.easy,'refused','an easy wood quest by hand');
 t.eq(r.g3,400000,'third wood quest');t.eq((r.prog||{}).gwood,400000,'next wood goal stored')}};
