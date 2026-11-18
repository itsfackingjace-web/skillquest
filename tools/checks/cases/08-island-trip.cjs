// Sail to an island, reload there, sail home: the bag is unchanged and you land on dry, walkable ground.
module.exports={name:'island trip and back keeps your bag and lands you on land',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);
  inv.ibar=11;inv.berry=6;const bag=()=>[inv.ibar|0,inv.berry|0];
  routeOpen=()=>true;const go=id=>routeGo(id);// as if every route were charted
  const until=async(f,ms)=>{const e=Date.now()+ms;while(Date.now()<e){if(f())return true;await W(200)}return false};
  go('ashfall');const there=await until(()=>curRegion()==='ashfall'&&!(typeof TRAVEL!=='undefined'&&TRAVEL),30000);
  const onIsland={region:curRegion(),bag:bag(),solid:solid(P.x,P.y)};
  saveLocal(true);applySave(JSON.parse(localStorage.getItem(LS)));await W(800);
  const reloaded={region:curRegion(),bag:bag()};
  go('hollow');const home=await until(()=>curRegion()==='hollow'&&!(typeof TRAVEL!=='undefined'&&TRAVEL),30000);await W(500);
  const tx=Math.floor(P.x/16),ty=Math.floor(P.y/16);
  return{there,onIsland,reloaded,home,back:{region:curRegion(),bag:bag(),solid:solid(P.x,P.y),water:tile[ty*N+tx]===0,scene:!!SCENE}}});
 t(r.there,'never arrived on Ashfall');t.eq(r.onIsland.bag,[11,6],'bag on the island');t(!r.onIsland.solid,'arrived inside something on the island');
 t.eq(r.reloaded,{region:'ashfall',bag:[11,6]},'after reloading on the island');
 t(r.home,'never got back to Hollow');t.eq(r.back.bag,[11,6],'bag back home');t(!r.back.solid&&!r.back.water,'landed on Hollow '+(r.back.water?'in the sea':'inside something'))}};
