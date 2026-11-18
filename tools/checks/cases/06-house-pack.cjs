// A house with a chest: reloading keeps the chest's items in the chest (once), and packing the house puts them in the bag once.
module.exports={name:'house chests survive a reload and pack up once',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);
  // find a spot where a house fits, then build one the normal way
  let ok=false;const x0=P.x,y0=P.y;for(let rr=4;rr<60&&!ok;rr+=3)for(let a=0;a<16&&!ok;a++){P.x=x0+Math.cos(a/16*6.283)*rr*16;P.y=y0+Math.sin(a/16*6.283)*rr*16;if(houseFits())ok=true}
  if(!ok)return{err:'no spot for a house near the start'};
  inv.house=1;startBuild('house');placeBuild();if(BUILD)endBuild();const h=HOUSES.find(o=>!o._foreign);if(!h)return{err:'house was not built'};
  h.furn.set(3*14+5,{t:'chest',items:{ibar:25,berry:9}});inv.ibar=0;inv.berry=0;inv.chest=0;
  saveLocal(true);applySave(JSON.parse(localStorage.getItem(LS)));await W(600);
  const h2=HOUSES.find(o=>!o._foreign);const ch=h2&&[...h2.furn.values()].find(f=>f.t==='chest');
  const afterLoad={houses:HOUSES.filter(o=>!o._foreign).length,chest:ch?ch.items:null,bag:[inv.ibar|0,inv.berry|0]};
  // pack it up (HIT its walls until it comes down)
  for(let i=0;i<40&&HOUSES.includes(h2);i++){swing=0;hitHouse(h2)}await W(900);
  const packed={houses:HOUSES.filter(o=>!o._foreign).length,bag:[inv.ibar|0,inv.berry|0,inv.chest|0,inv.house|0]};
  saveLocal(true);applySave(JSON.parse(localStorage.getItem(LS)));await W(900);
  return{afterLoad,packed,reloaded:{houses:HOUSES.filter(o=>!o._foreign).length,bag:[inv.ibar|0,inv.berry|0,inv.chest|0,inv.house|0]}}});
 if(r.err){t(false,r.err);return}
 t.eq(r.afterLoad,{houses:1,chest:{ibar:25,berry:9},bag:[0,0]},'after reloading with the house standing');
 t.eq(r.packed,{houses:0,bag:[25,9,1,1]},'after packing the house');
 t.eq(r.reloaded,{houses:0,bag:[25,9,1,1]},'after reloading the packed house')}};
