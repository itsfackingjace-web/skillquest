// Builds a rich character and prints its save (snap()) with volatile fields removed. Usage: node snapeq.cjs out.json
const {world}=require('../checks/lib.cjs');const fs=require('fs');
(async()=>{const W=await world(1);const p=W.pages[0];
 const out=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));await w(600);Math.random=(()=>{let s=7;return()=>(s=(s*16807)%2147483647)/2147483647})();
  for(const k of INVK.slice(0,80))inv[k]=(INVK.indexOf(k)%7)+1;GLD=123456;for(let i=0;i<XPS.length;i++)XPS[i]=XT[Math.min(XT.length-1,10+i*3)];
  try{inv.eq_sword4=1;equipItem('eq_sword4')}catch(e){}
  // a house with furniture and a chest
  let ok=false;const x0=P.x,y0=P.y;for(let rr=4;rr<60&&!ok;rr+=3)for(let a=0;a<16&&!ok;a++){P.x=x0+Math.cos(a/16*6.283)*rr*16;P.y=y0+Math.sin(a/16*6.283)*rr*16;if(houseFits())ok=true}
  inv.house=1;startBuild('house');placeBuild();if(BUILD)endBuild();const h=HOUSES.find(o=>!o._foreign);if(h){h.furn.set(3*14+5,{t:'chest',items:{ibar:25,berry:9},nm:'Stuff'});h.furn.set(3*14+8,{t:'bed'})}
  try{PERKS[1]={10:'a'}}catch(e){}try{CHS.w=3}catch(e){}
  await w(2500);const s=snap();
  // drop fields that change on their own (clocks, timers, positions of moving things)
  const drop=['savedAt','t','time','mp','fires','stk','dly','wev','ach','dl','p','hunger','bw','wid'];for(const k of drop)delete s[k];
  return JSON.stringify(s,Object.keys(s).sort().length?undefined:undefined)});
 fs.writeFileSync(process.argv[2],out);console.log(out.length,'chars',W.errors);await W.close()})();
