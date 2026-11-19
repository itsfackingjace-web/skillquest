// Turns every `const _X=FN;FN=function(args){...}` into REG.after/before/wrap steps, in place in src/.
//   node tools/refactor/convfn.cjs applySave SQLOAD [--dry]
// after  = the wrapper calls the inner function first (with its own arguments) and then only does its own work;
// before = it does its own work and then calls the inner function last, with its own arguments;
// wrap   = anything else (kept as a wrapper factory, inner renamed by the parameter).
// Steps that use `this`, `arguments` (other than in the inner call) or return a value stay as wrap.
const walk=require('/opt/node-tools/node_modules/acorn-walk');const fs=require('fs'),path=require('path');
const FN=process.argv[2],REG=process.argv[3],DRY=process.argv.includes('--dry');
process.argv[2]=FN;const {res,js,fileAt}=require('./find.cjs');const ROOT=path.join(__dirname,'..','..','src');
const src=n=>js.slice(n.start,n.end);const edits={};const cnt={after:0,before:0,wrap:0};const names=[];
// noRet: for `before`, any return (even a bare `return;`) means "stop, skip the inner function", which a before step can't do (Nov 18 bug).
const plain=(stmts,inner,noRet)=>{let ok=true;for(const st of stmts)walk.recursive(st,null,{Function(){},ArrowFunctionExpression(){},FunctionExpression(){},FunctionDeclaration(){},
  ReturnStatement(n){if(n.argument||noRet)ok=false},Identifier(n){if(n.name===inner||n.name==='arguments')ok=false},ThisExpression(){ok=false}},walk.base);return ok};
for(const r of res){if(!r.decl)continue;const inner=r.inner,f=r.fnode,S=f.body.body,params=f.params;
 const pn=params.every(p=>p.type==='Identifier')?params.map(p=>p.name):null;
 const isCall=e=>{if(!e)return false;if(e.type==='ExpressionStatement')e=e.expression;else if(e.type==='ReturnStatement')e=e.argument;if(!e||e.type!=='CallExpression')return false;
  const c=e.callee;if(c.type==='Identifier'&&c.name===inner)return pn&&e.arguments.length===pn.length&&e.arguments.every((a,i)=>a.type==='Identifier'&&a.name===pn[i]);
  return c.type==='MemberExpression'&&c.object.type==='Identifier'&&c.object.name===inner&&c.property.name==='apply'&&e.arguments.length===2&&e.arguments[0].type==='ThisExpression'&&e.arguments[1].type==='Identifier'&&e.arguments[1].name==='arguments'};
 let kind='wrap',body='';
 const isDeclCall=st=>st&&st.type==='VariableDeclaration'&&st.declarations.length===1&&st.declarations[0].id.type==='Identifier'&&isCall({type:'ReturnStatement',argument:st.declarations[0].init});
 const L=S[S.length-1];
 if(pn&&S.length>=2&&isDeclCall(S[0])&&L.type==='ReturnStatement'&&L.argument&&L.argument.type==='Identifier'&&L.argument.name===S[0].declarations[0].id.name&&plain(S.slice(1,-1),inner)){kind='after';body=S.slice(1,-1).map(src).join('')}else
 if(pn&&S.length>=1&&S[0].type==='ExpressionStatement'&&isCall(S[0])&&plain(S.slice(1),inner)){kind='after';body=S.slice(1).map(src).join('')}
 else if(pn&&S.length>=2&&isCall(S[S.length-1])&&(S[S.length-1].type==='ExpressionStatement'||S[S.length-1].type==='ReturnStatement')&&plain(S.slice(0,-1),inner,true)){kind='before';body=S.slice(0,-1).map(src).join('')}
 const file=r.at.f,num=file.split('/')[1].split('-')[0];cnt[kind]++;
 const name=num;names.push(kind+' '+name);
 const args='('+(pn||[]).join(',')+')';
 const rep=kind==='wrap'?REG+".wrap('"+name+"',"+inner+"=>"+src(f)+")":REG+"."+kind+"('"+name+"',"+args+"=>{"+body+"})";
 const d0=fileAt(r.decl.start),d1=fileAt(r.stmt.end);if(d0.f!==d1.f)throw new Error('spans files '+file);
 const between=js.slice(r.decl.end,r.stmt.start);if(between.trim()!=='')throw new Error('not adjacent in '+file+': '+between.slice(0,80));
 const tail=src(r.stmt).trimEnd().endsWith(';')?';':'';(edits[file]=edits[file]||[]).push([d0.off,d1.off,rep+tail])}
for(const file in edits){const p=path.join(ROOT,file);let s=fs.readFileSync(p,'utf8');for(const[x,y,t]of edits[file].sort((m,n)=>n[0]-m[0]))s=s.slice(0,x)+t+s.slice(y);if(!DRY)fs.writeFileSync(p,s)}
console.log(JSON.stringify(cnt));console.log(names.join('\n'));
