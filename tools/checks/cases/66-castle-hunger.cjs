// Nov 21 (Kevin's #ideas post, as Jace explained it): with Hearthkeeper you could stand OUTSIDE a castle (its aura counts as a campfire)
// by water and AFK fish forever without getting hungry. Hearthkeeper now needs a real campfire; inside houses and castles you still
// don't get hungry.
module.exports={name:'Hearthkeeper needs a real campfire; no hunger inside houses and castles',async run(p,t){
 const r=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,300));const S0=SCENE,out={};
  SCENE={id:'home',house:{id:'t1'},room:ROOMS.home};out.house=SQHOME.indoors();
  SCENE={id:'home',house:{id:'t2',castle:1},room:ROOMS.castle};out.castle=SQHOME.indoors();SCENE=S0;
  // Hearthkeeper (Firemaking 40, the third choice) next to a castle but no campfire
  XPS[5]=XT[45];const c40=TREES[5].choices[40],i=c40.findIndex(c=>c.id==='fi_hearth');PERKS[5]=PERKS[5]||{};PERKS[5][40]='abc'[i];
  fires.length=0;const tx=Math.floor(P.x/16),ty=Math.floor(P.y/16)-4;const C={id:'tcastle',x:tx,y:ty,castle:1,hp:24,furn:new Map(),owner:'me'};HOUSES.push(C);
  out.aura=nearFire(P.x,P.y,50);hunger=80;for(let k=0;k<40;k++)upd(.05);out.byCastle=+(80-hunger).toFixed(2);
  HOUSES.splice(HOUSES.indexOf(C),1);fires.push({x:P.x+10,y:P.y,life:200,mx:200});hunger=80;for(let k=0;k<40;k++)upd(.05);out.byFire=+(80-hunger).toFixed(2);fires.length=0;
  return out});
 t.eq([r.house,r.castle],[true,true],'no hunger inside a house and a castle');t(r.aura,'the castle aura test setup didn\'t work');
 t(r.byCastle>0,'Hearthkeeper kept you fed next to a castle with no campfire');t.eq(r.byFire,0,'Hearthkeeper next to a campfire')}};
