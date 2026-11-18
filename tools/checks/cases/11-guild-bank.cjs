// Found a guild, go to its island, put things in the bank and take some out: nothing appears or vanishes.
module.exports={name:'guild bank deposits and withdrawals add up',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const G=SQGUILD,A=G.api;
  const until=async(f,ms)=>{const e=Date.now()+ms;while(Date.now()<e){if(f())return true;await W(200)}return false};
  GLD=6e6;A.create('Check Guild','CHK',1);if(!await until(()=>G.id&&A.ready,8000))return{err:'guild was not founded'};
  routeOpen=()=>true;routeGo(G.isle());if(!await until(()=>A.onIsle()&&!(typeof TRAVEL!=='undefined'&&TRAVEL),30000))return{err:'never reached the guild island'};
  await W(800);const R=SCENE.room,bk=R.items.find(it=>it.use==='gbank');if(!bk)return{err:'no bank chest on the guild island'};
  P.x=bk.x*16+8;P.y=bk.y*16+8+20;
  inv.ibar=30;inv.oaklog=12;const bank=()=>({...(G.state.bank&&G.state.bank.i||{})});
  A.deposit('ibar',30);await W(1500);A.deposit('oaklog',12);await W(1500);const afterDep={bag:[inv.ibar|0,inv.oaklog|0],bank:bank()};
  A.withdraw('ibar',8);await W(1500);const afterWd={bag:[inv.ibar|0,inv.oaklog|0],bank:bank()};
  saveLocal(true);applySave(JSON.parse(localStorage.getItem(LS)));await W(1500);
  return{gold:GLD,afterDep,afterWd,reload:{bag:[inv.ibar|0,inv.oaklog|0],bank:bank()}}});
 if(r.err){t(false,r.err);return}
 t(r.gold>=1e6&&r.gold<1e6+1000,'gold after founding should be 1M (+ achievement gold), got '+r.gold);
 t.eq(r.afterDep.bag,[0,0],'bag after depositing');t.eq([r.afterDep.bank.ibar|0,r.afterDep.bank.oaklog|0],[30,12],'bank after depositing');
 t.eq(r.afterWd.bag,[8,0],'bag after taking 8 bars out');t.eq(r.afterWd.bank.ibar|0,22,'bars left in the bank');
 t.eq(r.reload.bag,[8,0],'bag after reloading');t.eq(r.reload.bank.ibar|0,22,'bank after reloading')}};
