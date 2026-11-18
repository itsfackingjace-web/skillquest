// Plays short scripted scenes and records what happened (bag, health, hunger, messages, open screens), for before/after comparisons.
// Usage: node compare-scenes.cjs <scenes file> out.json
const {world}=require('../checks/lib.cjs');const fs=require('fs'),path=require('path');
(async()=>{const scenes=require(path.resolve(process.argv[2]));const W=await world(1);const p=W.pages[0];
 await p.evaluate(()=>new Promise(r=>setTimeout(r,600)));
 const base=await p.evaluate(()=>{window.__said=[];const _s=say;say=function(m){__said.push(String(m).slice(0,80));return _s.apply(this,arguments)};return JSON.stringify(snap())});
 const out={};
 for(const [name,fn] of Object.entries(scenes)){
  out[name]=await p.evaluate(async([base,src])=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
   let seed=11;Math.random=()=>(seed=(seed*16807)%2147483647)/2147483647;
   try{if(typeof closePanel==='function'&&pnOpen)closePanel()}catch(e){}try{if(BUILD)endBuild()}catch(e){}window.SQDO=null;dead=false;
   applySave(JSON.parse(base));fires.length=0;EATCD=0;await w(300);__said.length=0;
   const f=eval('('+src+')');let err=null;try{await f(w)}catch(e){err=String(e)}await w(400);
   const keys=['cooked','bread','berry','salmon','csalmon','trout','ctrout','meat','pot_heal','wood','ibar'];
   return JSON.parse(JSON.stringify({err,hp:P.hp,hunger:Math.round(hunger),inv:Object.fromEntries(keys.map(k=>[k,inv[k]|0])),build:!!BUILD,
    job:window.SQDO?(SQDO.kind||'?'):null,pn:pnOpen?ptab:null,said:__said.filter(m=>!/Achievement|Synced|Saved to|Signed/.test(m)).slice(0,6),cd:(EATCD||0)>0}))},[base,fn.toString()])}
 fs.writeFileSync(process.argv[3],JSON.stringify(out,null,1));console.log(Object.keys(out).length,'scenes',W.errors);await W.close()})();
