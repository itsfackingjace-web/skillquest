// Used Nov 18 to turn the 74 snap wrappers into SQSAVE steps (node tools/refactor/conv.cjs snap SQSAVE [--dry]).
// Needs acorn/acorn-walk (here from /opt/node-tools). Reusable for other wrapped globals once a registry like SQSAVE exists for them.
// Converts every `const _X=FN;FN=function(){...}` into SQ<FN>.after/wrap steps, in place in src/. Prints a summary.
const walk=require('/opt/node-tools/node_modules/acorn-walk');const fs=require('fs'),path=require('path');
const FN=process.argv[2]||'snap',REG=process.argv[3]||'SQSAVE',DRY=process.argv.includes('--dry');
process.argv[2]=FN;const {res,js,a,map,fileAt}=require('./find.cjs');const ROOT='/home/claude/skillquest/src';
const src=(n)=>js.slice(n.start,n.end);
const edits={};let nAfter=0,nWrap=0;const names=[];
for(const r of res){const inner=r.inner,f=r.fnode,S=f.body.body;let post=false,V=null;
 const isInnerCall=c=>c&&c.type==='CallExpression'&&((c.callee.type==='Identifier'&&c.callee.name===inner)||(c.callee.type==='MemberExpression'&&c.callee.object.type==='Identifier'&&c.callee.object.name===inner&&c.callee.property.name==='apply'));
 if(f.params.length===0&&S.length>=2&&S[0].type==='VariableDeclaration'&&S[0].declarations.length===1&&S[0].declarations[0].id.type==='Identifier'&&isInnerCall(S[0].declarations[0].init)){
  V=S[0].declarations[0].id.name;const L=S[S.length-1];
  if(L.type==='ReturnStatement'&&L.argument&&L.argument.type==='Identifier'&&L.argument.name===V){post=true;
   for(const st of S.slice(1,-1)){walk.recursive(st,null,{Function(){},ArrowFunctionExpression(){},FunctionExpression(){},FunctionDeclaration(){},
     ReturnStatement(){post=false},Identifier(n){if(n.name===inner||n.name==='arguments')post=false},ThisExpression(){post=false}},walk.base)}}}
 const file=r.at.f,num=file.split('/')[1].split('-')[0];
 const mid=post?S.slice(1,-1).map(src).join(''):'';
 const keys=[...new Set([...(post?mid:src(f)).matchAll(new RegExp('\\b(?:'+(V||'s|o')+')\\.([a-zA-Z0-9_]+)\\s*=(?!=)','g'))].map(m=>m[1]))].slice(0,3);
 const name=num+(keys.length?':'+keys.join(','):'');names.push([name,post?'after':'wrap']);
 const rep=post?REG+".after('"+name+"',"+V+"=>{"+mid+"})":REG+".wrap('"+name+"',"+inner+"=>"+src(f)+")";
 if(post)nAfter++;else nWrap++;
 // the declaration and the assignment statement must be next to each other in the same file
 const d0=fileAt(r.decl.start),d1=fileAt(r.stmt.end);if(d0.f!==d1.f)throw new Error('spans files '+file);
 const between=js.slice(r.decl.end,r.stmt.start);if(between.trim()!=='')throw new Error('not adjacent in '+file+': '+between);
 // keep the statement's own trailing semicolon if the statement had one
 const stmtText=src(r.stmt);const tail=stmtText.trimEnd().endsWith(';')?';':'';
 (edits[file]=edits[file]||[]).push([d0.off,d1.off,rep+tail])}
for(const file in edits){const p=path.join(ROOT,file);let s=fs.readFileSync(p,'utf8');for(const[x,y,t]of edits[file].sort((m,n)=>n[0]-m[0]))s=s.slice(0,x)+t+s.slice(y);if(!DRY)fs.writeFileSync(p,s)}
console.log('after:',nAfter,'wrap:',nWrap);console.log(names.map(n=>n.join(' ')).join('\n'));
