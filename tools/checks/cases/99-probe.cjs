module.exports={name:'probe',async run(p,t){
 const r=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,500));
  const M=window.SQISLIFE&&SQISLIFE.MOBS||{};const o={mobs:Object.fromEntries(Object.entries(M).map(([k,v])=>[k,v.n])),
   ib:Object.fromEntries(Object.entries(window.SQIB||{}).map(([k,v])=>[k,v.n])),props:Object.keys((window.SQPROPS&&SQPROPS.looks)||{}).filter(k=>/^m:/.test(k)),
   cats:window.SQPROPS&&SQPROPS.MOBCAT?Object.keys(SQPROPS.MOBCAT):null};
  try{o.devmobs=(SQPROPS.mobList?SQPROPS.mobList():null)}catch(e){}
  return o});
 t(false,JSON.stringify(r))}};
