// Nov 18: stations borrow every nearby chest's contents into the bag while a step runs; saves made then held them twice.
module.exports={name:'smelting from chests never saves borrowed items',async run(p,t){
 const r=await p.evaluate(async()=>{const read=()=>JSON.parse(localStorage.getItem(LS)).inv;
  const ri=SM.findIndex(x=>x.k==='ibar'),R=SM[ri];XPS[10]=XT[60];for(const k in R.c)inv[k]=0;inv.ibar=0;
  const i0=Math.floor(P.y/16)*N+Math.floor(P.x/16)+2,items={};for(const k in R.c)items[k]=10;STR.set(i0,{t:'chest',hp:4,items});
  const st={t:'furnace',i:i0+1};STATION=st;shop='station';
  // a save in the middle of a borrowed step
  BENCH=st;benchMerge();saveLocal(true);const mid=read();benchSplit();BENCH=null;
  const m=stMerge(st);try{smithAct(ri,true)}finally{if(m)benchSplit()}
  await new Promise(r=>setTimeout(r,9000));saveLocal(true);const end=read();
  const tot=k=>(end[k]|0)+(STR.get(i0).items[k]|0);
  return{mid:Object.keys(R.c).map(k=>mid[k]|0),made:end.ibar|0,used:Object.fromEntries(Object.keys(R.c).map(k=>[k,10-tot(k)]))}});
 t(r.mid.every(v=>v===0),'a save during a borrowed step had chest items in the bag: '+r.mid);
 t(r.made>=3,'smelting from chests made only '+r.made+' bars');
 for(const k in r.used)t(r.used[k]>=0&&r.used[k]<=r.made,'materials used of '+k+': '+r.used[k]+' for '+r.made+' bars')}};
