// Finds every place the game's script wraps a global function (default: snap) and classifies it.
const acorn=require('/opt/node-tools/node_modules/acorn'),walk=require('/opt/node-tools/node_modules/acorn-walk');const fs=require('fs'),path=require('path');
const FN=process.argv[2]||'snap',ROOT='/home/claude/skillquest/src';
const files=fs.readFileSync(ROOT+'/manifest.txt','utf8').split('\n').map(s=>s.trim()).filter(s=>s&&!s.startsWith('#'));
let out='';const map=[];for(const f of files){map.push([out.length,f]);out+=fs.readFileSync(path.join(ROOT,f),'utf8')}
const a=out.indexOf('<script>\n')+9,b=out.lastIndexOf('</script>');const js=out.slice(a,b);
const fileAt=pos=>{let hit=map[0];for(const r of map)if(r[0]<=pos+a)hit=r;return{f:hit[1],off:pos+a-hit[0]}};
const ast=acorn.parse(js,{ecmaVersion:'latest',sourceType:'script',ranges:true});
const res=[];
walk.ancestor(ast,{AssignmentExpression(n,anc){if(n.left.type!=='Identifier'||n.left.name!==FN||n.operator!=='=')return;
  const fnode=n.right;if(!/Function/.test(fnode.type))return;
  // find a sibling declaration `const _X=FN` just before, in the same statement list
  const stmt=anc[anc.length-2];const list=anc[anc.length-3];
  let decl=null,body=list&&(list.body||list.consequent);if(Array.isArray(body)){const i=body.indexOf(stmt);for(let j=i-1;j>=0&&j>=i-3;j--){const d=body[j];if(d.type==='VariableDeclaration'&&d.declarations.length===1&&d.declarations[0].init&&d.declarations[0].init.type==='Identifier'&&d.declarations[0].init.name===FN){decl=d;break}}}
  res.push({at:fileAt(n.start),stmt,decl,fnode,inner:decl&&decl.declarations[0].id.name,blockList:list})}});
console.log(JSON.stringify(res.map(r=>[r.at.f,r.inner||'-',r.fnode.type,r.decl?'decl':'NODECL']),null,0).replace(/\],\[/g,'],\n['));
module.exports={res,js,a,map,fileAt};
