// Nov 18 fix: convfn.cjs turned wrappers whose own part had a bare `return;` (= stop, don't run the inner function) into
// REG.before steps, where a return only ends the step and the rest still runs. This rewrites every such before step back
// into REG.wrap(name, next=>function(args){<body>;return next.apply(this,arguments)}), which keeps the early exits.
//   node tools/refactor/fix-before-returns.cjs [--dry]
const acorn=require('/opt/node-tools/node_modules/acorn'),walk=require('/opt/node-tools/node_modules/acorn-walk'),fs=require('fs'),path=require('path');
const SRC=path.join(__dirname,'..','..','src'),DRY=process.argv.includes('--dry');
const files=fs.readFileSync(SRC+'/manifest.txt','utf8').split('\n').filter(l=>l&&!l.startsWith('#'));let n=0;
const bareReturn=body=>{let hit=false;(function scan(x,top){if(!x||typeof x!=='object'||hit)return;if(!top&&/Function/.test(x.type))return;if(x.type==='ReturnStatement')hit=true;
 for(const k in x){if(k==='type')continue;const v=x[k];if(Array.isArray(v))v.forEach(y=>y&&typeof y.type==='string'&&scan(y,false));else if(v&&typeof v.type==='string')scan(v,false)}})(body,true);return hit};
for(const f of files){const p=path.join(SRC,f);let code=fs.readFileSync(p,'utf8');let ast;try{ast=acorn.parse(code,{ecmaVersion:'latest'})}catch(e){continue}const ed=[];
 walk.simple(ast,{CallExpression(c){const m=c.callee;if(m.type!=='MemberExpression'||m.property.name!=='before'||!/^SQ/.test(m.object.name||''))return;const fn=c.arguments[1];
  if(!fn||fn.type!=='ArrowFunctionExpression'||fn.body.type!=='BlockStatement'||!bareReturn(fn.body))return;
  const args=fn.params.map(q=>code.slice(q.start,q.end)).join(','),body=code.slice(fn.body.start+1,fn.body.end-1);
  ed.push([c.start,c.end,m.object.name+'.wrap('+code.slice(c.arguments[0].start,c.arguments[0].end)+',next=>function('+args+'){'+body+'\n return next.apply(this,arguments)})']);console.log(f,m.object.name,code.slice(c.arguments[0].start,c.arguments[0].end))}});
 if(!ed.length)continue;n+=ed.length;ed.sort((a,b)=>b[0]-a[0]);for(const[s,e,r]of ed)code=code.slice(0,s)+r+code.slice(e);if(!DRY)fs.writeFileSync(p,code)}
console.log(n+' steps'+(DRY?' (dry run)':' rewritten'))
