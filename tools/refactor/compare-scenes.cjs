// Plays short scripted scenes and records what happened (bag, health, hunger, messages, open screens), for before/after comparisons.
// Usage: node compare-scenes.cjs <scenes file> out.json
const {world}=require('../checks/lib.cjs');const fs=require('fs'),path=require('path');
(async()=>{const scenes=require(path.resolve(process.argv[2]));const fresh=process.argv.includes('--fresh');let W=await world(1),p=W.pages[0];const errs=[];
 const prep=async()=>{await p.evaluate(()=>new Promise(r=>setTimeout(r,600)));return p.evaluate(()=>{window.__said=[];const _s=say;say=function(m){__said.push(String(m).slice(0,80));return _s.apply(this,arguments)};return JSON.stringify(snap())})};
 let base=await prep();
 const out={};
 for(const [name,fn] of Object.entries(scenes)){
  if(fresh&&Object.keys(out).length){errs.push(...W.errors);await W.close();W=await world(1);p=W.pages[0];base=await prep()}
  out[name]=await p.evaluate(async([base,src])=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
   let seed=11;Math.random=()=>(seed=(seed*16807)%2147483647)/2147483647;
   try{if(typeof closePanel==='function'&&pnOpen)closePanel()}catch(e){}try{if(BUILD)endBuild()}catch(e){}window.SQDO=null;dead=false;
   applySave(JSON.parse(base));fires.length=0;EATCD=0;await w(300);__said.length=0;
   const inv0={...inv};const f=eval('('+src+')');let err=null,ret=null;try{ret=await f(w)}catch(e){err=String(e)}await w(400);
   const dinv={};for(const k of new Set([...Object.keys(inv0),...Object.keys(inv)]))if((inv[k]|0)!==(inv0[k]|0))dinv[k]=(inv[k]|0)-(inv0[k]|0);
   const keys=['cooked','bread','berry','salmon','csalmon','trout','ctrout','meat','pot_heal','wood','ibar'];
   return JSON.parse(JSON.stringify({err,ret,dinv,hp:P.hp,hunger:Math.round(hunger),inv:Object.fromEntries(keys.map(k=>[k,inv[k]|0])),build:!!BUILD,
    job:window.SQDO?(SQDO.kind||'?'):null,pn:pnOpen?ptab:null,said:__said.filter(m=>!/Achievement|Synced|Saved to|Signed/.test(m)).slice(0,6),cd:(EATCD||0)>0}))},[base,fn.toString()])}
 fs.writeFileSync(process.argv[3],JSON.stringify(out,null,1));console.log(Object.keys(out).length,'scenes',errs.concat(W.errors));await W.close()})();
