// Nov 20: 013 replaced useFurn after its step list existed, so every later step was skipped: island harbor posts (SAIL), island
// NPCs, guild boards and loot chests did nothing, and players were stuck on islands. Uses the post on an island through talk
// (the A/SAIL button) and useFurn, then a chest in a house of your own (013's step, first on the list).
module.exports={name:'island harbor post opens the routes (SAIL), home chest opens',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);
  routeOpen=()=>true;routeGo('ashfall');const e=Date.now()+30000;while(Date.now()<e&&!(curRegion()==='ashfall'&&!TRAVEL49))await W(200);await W(300);
  const out={region:curRegion()};const R=SCENE&&SCENE.room,it=R&&R.items.find(i=>i.use==='regdock');out.post=!!it;
  if(it){P.x=it.x*16+8;P.y=(it.y+1)*16+8;face=[0,-1];await W(100);try{talk()}catch(x){out.err=String(x)}await W(150);out.talk=pnOpen&&shop==='routes49';
   try{closePanel()}catch(x){}await W(100);try{useFurn(it)}catch(x){out.err=String(x)}await W(150);out.use=pnOpen&&shop==='routes49';try{closePanel()}catch(x){}}
  routeGo('hollow');const e2=Date.now()+30000;while(Date.now()<e2&&!(curRegion()==='hollow'&&!TRAVEL49))await W(200);await W(300);
  let ok=false;const x0=P.x,y0=P.y;for(let rr=4;rr<60&&!ok;rr+=3)for(let a=0;a<16&&!ok;a++){P.x=x0+Math.cos(a/16*6.283)*rr*16;P.y=y0+Math.sin(a/16*6.283)*rr*16;if(houseFits())ok=true}
  if(ok){inv.house=1;startBuild('house');placeBuild();if(BUILD)endBuild();const h=HOUSES.find(o=>!o._foreign);
   if(h){const i=3*14+5,f={t:'chest',items:{berry:2}};h.furn.set(i,f);enterScene('home',h,{x:h.x*16+8,y:(h.y+1)*16+6});await W(200);
    try{useFurn({i,f})}catch(x){out.err=String(x)}await W(150);out.chest=pnOpen&&ptab===7;try{closePanel()}catch(x){}}}
  out.house=ok;
  out.steps=SQUSEFURN.list().length;out.first=SQUSEFURN.list()[0];return out});
 t.eq(r.region,'ashfall','never arrived on Ashfall');t(r.post,'no harbor post on Ashfall');t(!r.err,'error: '+r.err);
 t(r.talk,'talking at the harbor post did not open the routes');t(r.use,'using the harbor post did not open the routes');
 t(r.house,'no spot for a house');t(r.chest,'a chest at home did not open');t.eq(r.first,'wrap 013','013 (beds and chests at home) should be the first useFurn step')}};
