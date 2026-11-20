// Automatic checks: plays short scripted scenes in the real game and fails if something breaks.
// Run after building, before every release:  node tools/checks/run.cjs            (all)
//                                            node tools/checks/run.cjs grave      (names containing "grave")
// Each file in cases/ exports {name, run(page, t)}; a fresh game is started for every case. A case fails on any
// failed expectation, any script error on the page, or if it throws. Exit code 1 when anything failed.
const fs=require('fs'),path=require('path');const {world,expect}=require('./lib.cjs');
(async()=>{const only=process.argv[2]||'';const dir=path.join(__dirname,'cases');
 const files=fs.readdirSync(dir).filter(f=>f.endsWith('.cjs')&&f.includes(only)).sort();let bad=0;const t0=Date.now();const ERRS=new Map();
 for(const f of files){const c=require(path.join(dir,f));const s=Date.now();let W=null,fails=[];
  try{W=await world(c.players||1);const t=expect();await c.run(W.pages.length>1?W.pages:W.pages[0],t);fails=t.fails.concat(W.errors.map(e=>'script error: '+e))}
  catch(e){fails=[String(e&&e.stack||e).split('\n').slice(0,3).join(' | ')].concat(W?W.errors.map(e=>'script error: '+e):[])}
  finally{if(W){for(const p of W.pages){try{for(const l of await p.evaluate(()=>window.SQERR?SQERR.list():[])){const k=l.split(' ')[0];const o=ERRS.get(k)||{l,cases:new Set()};o.cases.add(c.name);ERRS.set(k,o)}}catch(_){}}await W.close().catch(()=>{})}}
  const ms=((Date.now()-s)/1000).toFixed(1);if(fails.length){bad++;console.log('FAIL '+c.name+' ('+ms+'s)');for(const m of fails)console.log('     - '+m)}else console.log('ok   '+c.name+' ('+ms+'s)')}
 // errors that tagged catches swallowed (core/000b): listed so they can be fixed, or marked /*quiet*/ when expected
 const code=[...ERRS.values()].filter(o=>/(TypeError|ReferenceError|RangeError)/.test(o.l)&&!/Failed to fetch|NetworkError/.test(o.l));
 fs.writeFileSync(path.join(__dirname,'caught-errors.txt'),[...ERRS.values()].map(o=>o.l+'   ['+[...o.cases].join('; ')+']').join('\n')+'\n');
 if(code.length)console.log(code.length+' caught code errors (TypeError/ReferenceError/RangeError), see tools/checks/caught-errors.txt');
 console.log((bad?bad+' of '+files.length+' checks failed':'all '+files.length+' checks passed')+' in '+((Date.now()-t0)/1000).toFixed(0)+'s');process.exit(bad?1:0)})();
