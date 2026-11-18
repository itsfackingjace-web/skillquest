// Automatic checks: plays short scripted scenes in the real game and fails if something breaks.
// Run after building, before every release:  node tools/checks/run.cjs            (all)
//                                            node tools/checks/run.cjs grave      (names containing "grave")
// Each file in cases/ exports {name, run(page, t)}; a fresh game is started for every case. A case fails on any
// failed expectation, any script error on the page, or if it throws. Exit code 1 when anything failed.
const fs=require('fs'),path=require('path');const {world,expect}=require('./lib.cjs');
(async()=>{const only=process.argv[2]||'';const dir=path.join(__dirname,'cases');
 const files=fs.readdirSync(dir).filter(f=>f.endsWith('.cjs')&&f.includes(only)).sort();let bad=0;const t0=Date.now();
 for(const f of files){const c=require(path.join(dir,f));const s=Date.now();let W=null,fails=[];
  try{W=await world(c.players||1);const t=expect();await c.run(W.pages.length>1?W.pages:W.pages[0],t);fails=t.fails.concat(W.errors.map(e=>'script error: '+e))}
  catch(e){fails=[String(e&&e.stack||e).split('\n').slice(0,3).join(' | ')].concat(W?W.errors.map(e=>'script error: '+e):[])}
  finally{if(W)await W.close().catch(()=>{})}
  const ms=((Date.now()-s)/1000).toFixed(1);if(fails.length){bad++;console.log('FAIL '+c.name+' ('+ms+'s)');for(const m of fails)console.log('     - '+m)}else console.log('ok   '+c.name+' ('+ms+'s)')}
 console.log((bad?bad+' of '+files.length+' checks failed':'all '+files.length+' checks passed')+' in '+((Date.now()-t0)/1000).toFixed(0)+'s');process.exit(bad?1:0)})();
