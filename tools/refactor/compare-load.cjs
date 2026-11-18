// Loads several saves (rich current, and older-format variants) into a fresh game and prints the save taken right after each load.
// Usage: node loadeq.cjs out.json   (first run also writes saves.json if missing)
const {world}=require('../checks/lib.cjs');const fs=require('fs');
(async()=>{const W=await world(1);const p=W.pages[0];
 let saves=fs.existsSync('saves.json')?JSON.parse(fs.readFileSync('saves.json','utf8')):null;
 if(!saves){saves=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));await w(600);
  for(const k of INVK.slice(0,90))inv[k]=(INVK.indexOf(k)%7)+1;GLD=123456;for(let i=0;i<XPS.length;i++)XPS[i]=XT[Math.min(XT.length-1,10+i*3)];
  try{inv.eq_sword4=1;equipItem('eq_sword4')}catch(e){}
  let ok=false;const x0=P.x,y0=P.y;for(let rr=4;rr<60&&!ok;rr+=3)for(let a=0;a<16&&!ok;a++){P.x=x0+Math.cos(a/16*6.283)*rr*16;P.y=y0+Math.sin(a/16*6.283)*rr*16;if(houseFits())ok=true}
  inv.house=1;startBuild('house');placeBuild();if(BUILD)endBuild();const h=HOUSES.find(o=>!o._foreign);if(h){h.furn.set(3*14+5,{t:'chest',items:{ibar:25,berry:9},nm:'Stuff'});h.furn.set(3*14+8,{t:'bed'})}
  await w(2000);const rich=JSON.parse(JSON.stringify(snap()));
  // older shapes: strip newer fields so the conversion code runs
  const old=JSON.parse(JSON.stringify(rich));for(const k of['tfx','ach','dly','wev','gd','ibk','cq','cus','mta','tta','dag','dpin','ultp','eatp','gcw','fcw','gsw','ptg','mtp','chr','hsc'])delete old[k];old.qv=9;
  const older=JSON.parse(JSON.stringify(old));older.qv=5;delete older.sideQuests;delete older.qdone;delete older.dun;delete older.xdun;delete older.perks;
  const mini={v:1,ch:rich.ch,xp:rich.xp,tl:{sword:6,axe:7,pick:3,bow:3},gold:50,arm:rich.arm,q:rich.q,inv:{wood:5,ibar:2},p:rich.p,hunger:50,time:100,kills:3,fires:[],rm:[],clk:0};
  return{rich,old,older,mini}})}
 fs.writeFileSync('saves.json',JSON.stringify(saves));
 const out={};for(const n in saves){out[n]=await p.evaluate(async S=>{const w=ms=>new Promise(r=>setTimeout(r,ms));applySave(JSON.parse(JSON.stringify(S)));const now=JSON.parse(JSON.stringify(snap()));for(const k of['savedAt','t','time','clk'])delete now[k];await w(1500);
   const s=snap();delete s.ach;delete s.gold;for(const k of['savedAt','t','time','mp','fires','stk','dly','wev','dl','hunger','bw','wid','clk','p'])delete s[k];
   return JSON.parse(JSON.stringify({now,save:s,tl:TL,houses:HOUSES.filter(h=>!h._foreign).length,scene:SCENE&&SCENE.id,px:Math.round(P.x),py:Math.round(P.y)}))},saves[n])}
 fs.writeFileSync(process.argv[2],JSON.stringify(out));console.log(Object.keys(out).map(n=>n+':'+JSON.stringify(out[n]).length).join(' '),W.errors);await W.close()})();
