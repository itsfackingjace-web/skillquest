// Lists the bare top-level `{ ... }` blocks of the game script and what each one leaks to the global scope.
//   node tools/refactor/blocks.cjs            summary per block
//   node tools/refactor/blocks.cjs --json     machine-readable (blocks-to-iife.cjs requires this file)
// In a bare block (sloppy script) a `function f(){}` and a `var v` also become globals (Annex B), so they can replace a
// global with the same name. Inside `(()=>{ ... })()` they stay private. For each block this reports the leaked names,
// which of them other code uses (outside the block), and which collide with another global of the same name.
const acorn=require('/opt/node-tools/node_modules/acorn'),walk=require('/opt/node-tools/node_modules/acorn-walk');const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..','src');
const files=fs.readFileSync(ROOT+'/manifest.txt','utf8').split('\n').map(s=>s.trim()).filter(s=>s&&!s.startsWith('#'));
let out='';const map=[];for(const f of files){map.push([out.length,f]);out+=fs.readFileSync(path.join(ROOT,f),'utf8')}
const a=out.indexOf('<script>\n')+9,b=out.lastIndexOf('</script>');const js=out.slice(a,b);
const fileAt=pos=>{let hit=map[0];for(const r of map)if(r[0]<=pos+a)hit=r;return{f:hit[1],off:pos+a-hit[0]}};
const ast=acorn.parse(js,{ecmaVersion:'latest',sourceType:'script',ranges:true});
const isFn=n=>/Function/.test(n.type);
// names a block leaks: function declarations and var declarations not inside a nested function
function leaks(block){const L=new Set();
  (function go(n){if(!n||typeof n.type!=='string')return;
    if(n.type==='FunctionDeclaration'&&n!==block){if(n.id)L.add(n.id.name);return}
    if(isFn(n))return;if(n.type==='ClassDeclaration'){return}
    if(n.type==='VariableDeclaration'&&n.kind==='var')for(const d of n.declarations)walk.full(d.id,x=>{if(x.type==='Identifier')L.add(x.name)});
    for(const k in n){if(k==='type'||k==='start'||k==='end')continue;const v=n[k];if(Array.isArray(v))v.forEach(go);else if(v&&typeof v.type==='string')go(v)}})(block);
  return L}
// every use of a global name (eslint-scope: references no inner scope resolves; a local `start` in a function is not a use)
const escope=require('/opt/node-tools/node_modules/eslint-scope');
const SM=escope.analyze(ast,{ecmaVersion:2022,sourceType:'script'});const uses=new Map();
// (a `var` in a block belongs to the global scope there, so its references resolve to it rather than going through)
const refs=[...SM.globalScope.through];for(const v of SM.globalScope.variables)refs.push(...v.references);
for(const r of refs){const nm=r.identifier.name;if(!uses.has(nm))uses.set(nm,[]);uses.get(nm).push(r.identifier.start)}
// top-level globals declared outside blocks
const topNames=new Map();const addTop=(nm,pos)=>{if(!topNames.has(nm))topNames.set(nm,[]);topNames.get(nm).push(pos)};
const blocks=[];
for(const st of ast.body){
  if(st.type==='BlockStatement')blocks.push(st);
  else if(st.type==='FunctionDeclaration')addTop(st.id.name,st.start);
  else if(st.type==='VariableDeclaration')for(const d of st.declarations)walk.full(d.id,x=>{if(x.type==='Identifier')addTop(x.name,st.start)});
  else if(st.type==='ClassDeclaration')addTop(st.id.name,st.start)}
const BROWSER=new Set(Object.getOwnPropertyNames(globalThis).concat(['open','close','print','find','stop','focus','blur','name','status','alert','confirm','prompt','scroll','event','length','top','parent','origin','screen','history','location','navigator','document','frames','self','opener','external','moveTo','resizeTo','postMessage','fetch','caches','crypto','performance','requestAnimationFrame','toolbar','menubar']));
const R=[];
for(const B of blocks){const L=[...leaks(B)];const at=fileAt(B.start),end=fileAt(B.end);
  const used=[],clash=[];
  for(const nm of L){const u=(uses.get(nm)||[]).filter(p=>p<B.start||p>=B.end);if(u.length)used.push(nm+'('+[...new Set(u.map(p=>fileAt(p).f.replace(/^.*\/(\d+[a-z0-9]*)-.*$/,'$1')))].slice(0,4).join(',')+')');
    const others=(topNames.get(nm)||[]).length+blocks.filter(o=>o!==B&&leaks(o).has(nm)).length;if(others||BROWSER.has(nm))clash.push(nm)}
  R.push({file:at.f,endFile:end.f,start:B.start,end:B.end,leaks:L,used,clash})}
if(require.main!==module){}else if(process.argv.includes('--json'))console.log(JSON.stringify(R));
else{let n0=0;for(const r of R){if(!r.leaks.length)n0++;console.log(r.file+(r.endFile!==r.file?' .. '+r.endFile:'')+'  leaks '+r.leaks.length+(r.used.length?'  USED: '+r.used.join(' '):'')+(r.clash.length?'  CLASH: '+r.clash.join(' '):''))}
  console.log(R.length+' bare blocks, '+n0+' leak nothing, '+R.filter(r=>r.leaks.length&&!r.used.length).length+' leak only unused names, '+R.filter(r=>r.used.length).length+' leak names used elsewhere')}
module.exports={R,ast,js,a,map,fileAt};
