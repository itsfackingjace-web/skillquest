module.exports={name:'oak campfire: saves keep the logs while it is being lit',async run(p,t){
 const r=await p.evaluate(async()=>{XPS[5]=XT[40];inv.oaklog=10;inv.wood=0;inv.stone=5;fires.length=0;face=[0,1];
  fire();await new Promise(r=>setTimeout(r,200));const b=pbd.querySelector('[data-fmb="1"]');if(!b)return{err:'no oak option in the campfire picker'};b.click();
  await new Promise(r=>setTimeout(r,300));saveLocal(true);const s=JSON.parse(localStorage.getItem(LS)).inv;
  await new Promise(r=>setTimeout(r,4000));saveLocal(true);const s2=JSON.parse(localStorage.getItem(LS)).inv;
  return{mid:[s.oaklog,s.wood|0],end:[s2.oaklog,s2.wood|0],fires:fires.filter(f=>!f._rp).length}});
 if(r.err){t(false,r.err);return}
 t.eq(r.mid,[10,0],'save while lighting (oak, wood)');t.eq(r.end,[7,0],'save after the fire is lit (oak, wood)');t(r.fires===1,'fires lit: '+r.fires)}};
