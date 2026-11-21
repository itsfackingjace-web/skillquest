// Nov 21 (Kevin's #ideas post, approved): no more free food inside castles (endless AFK fishing there). Houses keep it.
module.exports={name:'hunger drains in castles, not in houses',async run(p,t){
 const r=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,300));const S0=SCENE,out={};
  SCENE={id:'home',house:{id:'t1'},room:ROOMS.home};out.house=SQHOME.indoors();
  SCENE={id:'home',house:{id:'t2',castle:1},room:ROOMS.castle};out.castle=SQHOME.indoors();SCENE=S0;return out});
 t.eq(r,{house:true,castle:false},'where hunger is paused')}};
