// Turns bare top-level `{ ... }` blocks into `(()=>{ ... })();` in place in src/ (see blocks.cjs for why).
//   node tools/refactor/blocks-to-iife.cjs [--dry] [--only <file part>]
// Names the block leaks that other code really uses stay global:
//   function f(){}  -> `window.f=f;` is added right after the declaration
//   var v=...;      -> becomes `v=...;` and `var v;` goes just before the block (other code may assign to it)
// A block that spans several files (the multiplayer block, 061-080) is converted only with --multi (and then only those).
// Exact: in a bare block a function's global copy is set where its declaration stands (Annex B), and code in the block
// already uses the block's own binding, so `window.f=f;` right after the declaration behaves the same.
// A `;` is put in front when the statement before could otherwise run into the `(`.
const fs=require('fs'),path=require('path');const DRY=process.argv.includes('--dry');
const MULTI=process.argv.includes('--multi');const oi=process.argv.indexOf('--only'),ONLY=oi>0?process.argv[oi+1]:null;
process.argv=process.argv.slice(0,2);// blocks.cjs prints when run directly only
const {R,ast,js,fileAt}=require('./blocks.cjs');const ROOT=path.join(__dirname,'..','..','src');
const walk=require('/opt/node-tools/node_modules/acorn-walk');
const edits={};const ed=(pos,del,ins)=>{const at=fileAt(pos);(edits[at.f]=edits[at.f]||[]).push([at.off,del,ins])};
const body=ast.body;let n=0,exp=[];
for(const r of R){if((r.file!==r.endFile)!==MULTI)continue;if(ONLY&&!r.file.includes(ONLY))continue;
  const B=body.find(s=>s.start===r.start);const i=body.indexOf(B),prev=body[i-1];
  const usedNames=new Set(r.used.map(u=>u.replace(/\(.*$/,'')));
  let pre='';
  if(prev&&prev.type==='ExpressionStatement'&&js[prev.end-1]!==';')pre=';';
  if(prev&&prev.type==='VariableDeclaration'&&js[prev.end-1]!==';')pre=';';
  // exports
  const vars=[];
  (function go(x,inFn){if(!x||typeof x.type!=='string')return;
    if(x!==B&&/Function/.test(x.type)){if(x.type==='FunctionDeclaration'&&!inFn&&x.id&&usedNames.has(x.id.name)){ed(x.end,0,'window.'+x.id.name+'='+x.id.name+';');exp.push(x.id.name)}return}
    if(x.type==='VariableDeclaration'&&x.kind==='var'){const hit=x.declarations.filter(d=>d.id.type==='Identifier'&&usedNames.has(d.id.name));
      if(hit.length){if(hit.length!==x.declarations.length)throw new Error('mixed var declaration in '+r.file+': '+js.slice(x.start,x.end).slice(0,80));
        ed(x.start,4,'');for(const d of hit){vars.push(d.id.name);exp.push(d.id.name)}}}
    for(const k in x){if(k==='type'||k==='start'||k==='end'||k==='range')continue;const v=x[k];if(Array.isArray(v))v.forEach(c=>go(c,inFn));else if(v&&typeof v.type==='string')go(v,inFn)}})(B,false);
  ed(B.start,1,pre+(vars.length?'var '+vars.join(',')+';':'')+'(()=>{');ed(B.end-1,1,'})();');n++}
for(const f in edits){const p=path.join(ROOT,f);let s=fs.readFileSync(p,'utf8');
  for(const [off,del,ins] of edits[f].sort((x,y)=>y[0]-x[0]||y[1]-x[1]))s=s.slice(0,off)+ins+s.slice(off+del);
  if(!DRY)fs.writeFileSync(p,s)}
console.log((DRY?'(dry) ':'')+n+' blocks in '+Object.keys(edits).length+' files; kept global: '+exp.join(' '));
