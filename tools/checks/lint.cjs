// Source checks (no browser), run first by run.cjs and on their own:  node tools/checks/lint.cjs
// Each rule comes from a bug that happened (see CLAUDE.md > Pitfalls):
//   blocks   no bare top-level `{ }` blocks (the last ones, the multiplayer block included, went on Nov 19-20): a `function f(){}` or `var` in one becomes a
//            global and can replace another (it broke `draw`). Use `(()=>{ ... })()`. tools/refactor/blocks-to-iife.cjs converts them.
//   panels   every panel number (a `XTAB=N` / `GT=N` const compared with `ptab`) belongs to one file (34 was used twice on Nov 15),
//            and a number ptab is set to or compared with (9 and up) belongs to some file.
//   css      a class styled in two files (`.gr` from a station screen got restyled by the guild screen). The ones that were already
//            shared on Nov 19 are listed in css-shared.txt; add to it only when a later file restyles a class on purpose.
//   steps    a function with a step list (sqSteps) is never assigned again (`fn=function...`): add a step on its list.
//   prompt   no prompt(): the Windows app doesn't support it.
//   catches  no untagged empty `catch(e){}`: rerun tools/refactor/tag-catches.cjs (or write `/*quiet*/` inside).
// Returns a list of problems (module) / prints them and exits 1 (command line).
const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'..','..','src');
function lint(){const P=[];const files=fs.readFileSync(ROOT+'/manifest.txt','utf8').split('\n').map(s=>s.trim()).filter(s=>s&&!s.startsWith('#'));
  const SRC=files.map(f=>[f,fs.readFileSync(path.join(ROOT,f),'utf8')]);const no=f=>f.split('/')[1].replace(/-.*$/,'');
  // blocks
  try{process.argv=process.argv.slice(0,2);const {R}=require('../refactor/blocks.cjs');
    for(const r of R)P.push('blocks: bare { } block in src/'+r.file+(r.leaks.length?' (leaks '+r.leaks.slice(0,5).join(', ')+')':'')+': use (()=>{ ... })()')}
  catch(e){P.push('blocks: could not parse the game script: '+e.message)}
  // steps: a function with a step list (sqSteps) is never assigned again after its list exists: the assignment bypasses every
  // step added after it (Nov 20: 013's `useFurn=function` made harbor posts, island NPCs and guild boards stop answering)
  try{const {ast,js,fileAt}=require('../refactor/blocks.cjs');const walk=require('/opt/node-tools/node_modules/acorn-walk');const regs=[];
    walk.full(ast,n=>{if(n.type==='CallExpression'&&n.callee.type==='Identifier'&&n.callee.name==='sqSteps'&&n.arguments[1]&&n.arguments[1].type==='Identifier')regs.push({fn:n.arguments[1].name,pos:n.start,inst:n.arguments[2]})});
    walk.full(ast,n=>{if(n.type!=='AssignmentExpression'||n.left.type!=='Identifier')return;const r=regs.find(r=>r.fn===n.left.name);
      if(r&&n.start>r.pos&&!(r.inst&&n.start>=r.inst.start&&n.end<=r.inst.end))P.push('steps: '+r.fn+'= in src/'+fileAt(n.start).f+' after its step list (src/'+fileAt(r.pos).f+'): add a step instead ('+js.slice(n.start,n.start+60).replace(/\s+/g,' ')+'...)')})}
  catch(e){P.push('steps: could not parse the game script: '+e.message)}
  // panels
  const owner=new Map(),used=new Map();
  for(const[f,s]of SRC){const names=new Set();for(const m of s.matchAll(/\bptab\s*(?:===?|!==?)\s*([A-Za-z_$][\w$]*)/g))names.add(m[1]);
    for(const m of s.matchAll(/\b([A-Za-z_$][\w$]*)\s*(?:===?|!==?)\s*ptab\b/g))names.add(m[1]);
    for(const nm of names){if(nm==='undefined'||nm==='null')continue;const d=s.match(new RegExp('(?:const|let|var)\\s+(?:[^;]*?[,\\s])?'+nm.replace(/\$/g,'\\$')+'\\s*=\\s*(\\d+)\\b'));
      if(d){const n=+d[1];if(n<9)continue;if(!owner.has(n))owner.set(n,[]);owner.get(n).push(no(f)+' '+nm)}}
    for(const m of s.matchAll(/\bptab\s*(?:===?|=(?!=))\s*(\d+)\b/g)){const n=+m[1];if(n>=9){if(!used.has(n))used.set(n,new Set());used.get(n).add(no(f))}}}
  for(const[n,L]of owner)if(new Set(L.map(x=>x.split(' ')[0])).size>1||L.length>1&&new Set(L).size>1)P.push('panels: panel number '+n+' is claimed by '+[...new Set(L)].join(' and ')+': pick a free one');
  for(const[n,F]of used)if(!owner.has(n))P.push('panels: ptab '+n+' (in '+[...F].join(', ')+') belongs to no panel const: give it one (const XTAB='+n+')');
  // css
  const base=new Set((()=>{try{return fs.readFileSync(path.join(__dirname,'css-shared.txt'),'utf8').split('\n').map(l=>l.replace(/#.*/,'').trim()).filter(Boolean)}catch(e){return[]}})());
  // class selectors at the start of a rule in string literals that hold CSS (`#id .x` selectors are scoped and don't count)
  const css=new Map();try{const acorn=require('/opt/node-tools/node_modules/acorn');let out='',map=[];for(const[f,s]of SRC){map.push([out.length,f]);out+=s}
    const a0=out.indexOf('<script>\n')+9,js=out.slice(a0,out.lastIndexOf('</script>'));const fAt=p=>{let h=map[0];for(const r of map)if(r[0]<=p+a0)h=r;return h[1]};
    const add=(c,f)=>{if(!css.has(c))css.set(c,new Set());css.get(c).add(no(f))};
    const scan=(txt,f)=>{if(!/\{[^{}]*[a-z-]+\s*:/.test(txt))return;for(const m of txt.matchAll(/(?:^|\})\s*([^{}@]+?)\s*\{(?=[^{}]*[a-z-]+\s*:)/g))
      for(const part of m[1].split(',')){const c=part.trim().match(/^\.([a-zA-Z][\w-]*)/);if(c)add(c[1],f)}};
    for(const t of acorn.tokenizer(js,{ecmaVersion:'latest'})){if(t.type.label==='string'||t.type.label==='template')scan(String(t.value),fAt(t.start))}
    // the page's own <style> (000)
    const st=out.slice(0,a0).match(/<style>([\s\S]*?)<\/style>/g)||[];for(const x of st)scan(x.replace(/<\/?style>/g,''),SRC[0][0])}
  catch(e){P.push('css: could not read the script: '+e.message)}
  for(const[c,F0]of css){const F=[...F0];if(F.length>1&&!base.has(c))P.push('css: .'+c+' is styled in '+F.join(' and ')+': prefix the new panel\'s classes (or add "'+c+'" to tools/checks/css-shared.txt if the restyle is on purpose)')}
  // prompt, catches
  for(const[f,s]of SRC){if(/(?<![\w$.])prompt\s*\(/.test(s.replace(/\/\/.*$/gm,'').replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g,"''")))P.push('prompt: prompt() in src/'+f+': ask with an input on the page');
    const e=s.replace(/^\s*\/\/.*$/gm,'').match(/catch\s*\(\s*[\w$]*\s*\)\s*\{\s*\}|catch\s*\{\s*\}/g);if(e)P.push('catches: '+e.length+' untagged empty catch in src/'+f+': run node tools/refactor/tag-catches.cjs')}
  return P}
module.exports={lint};
if(require.main===module){const P=lint();for(const p of P)console.log(p);console.log(P.length?P.length+' problems':'lint: no problems');process.exit(P.length?1:0)}
