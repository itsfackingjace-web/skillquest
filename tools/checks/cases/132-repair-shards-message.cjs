// Nov 26 (Kevin, in-game report: "Blacksmith table says shards but is using the full item, is that intentional?"): yes, a bar breaks into
// 10 shards when you have too few, and the rest stay in the bag. The repair message now says so.
module.exports={name:'a repair that breaks a bar says how many shards are left',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(300);const R=SQREPAIR;
  for(const i of[0,1,2,8,12,13])XPS[i]=XT[85];XPS[10]=XT[69];inv.eq_sword7=1;equipItem('eq_sword7');R.sync();R.wear('main',1200);inv.abar=1;inv.shd_abar=0;
  const said=[],_s=say;say=function(m){said.push(String(m));return _s.apply(this,arguments)};let ok;try{ok=R.repair('@main')}finally{say=_s}
  return{ok,said:said.filter(m=>/repair/i.test(m)),bar:inv.abar|0,sh:inv.shd_abar|0}});
 t(r.ok,'the sword was repaired: '+JSON.stringify(r.said));
 t.eq([r.bar,r.sh],[0,7],'the bar broke into 10 shards and 3 were used [bars, shards]');
 t(r.said.some(m=>/Good as new! \(1 adamant bar broke into shards: 7 adamant .*shards left in your bag\)\./i.test(m)),'the message explains the shards: '+JSON.stringify(r.said))}};
