// Shared helpers for the automatic checks (node tools/checks/run.cjs).
// Starts real game pages in Chromium (Playwright) from the freshly built index.html, with a fake Firebase:
// fake/app.js + fake/auth.js (sign-in as test players ann/bob/cat) and fake/db.js (an in-browser database that
// asks rulesdb.cjs, which applies database.rules.json, before writes on guild paths). Nothing reaches the real database.
const {chromium}=require('playwright');const path=require('path');
const ROOT=path.join(__dirname,'..','..'),F=path.join(__dirname,'fake')+'/';const {RulesDB}=require('./rulesdb.cjs');
async function world(n=1,co){const b=await chromium.launch();const pages=[],errors=[];const DB=new RulesDB(path.join(ROOT,'database.rules.json'));
 const relay=(src,op,p,v)=>{for(const q of pages)if(q!==src)q.evaluate(([p,v])=>window.__remote&&window.__remote(p,v),[p,v]).catch(()=>{})};
 for(let i=0;i<n;i++){const uid=['ann','bob','cat'][i];const ctx=await b.newContext(co||{viewport:{width:1280,height:720}});
  await ctx.route('**/*',r=>{const u=r.request().url();if(u.startsWith('http://sq.test/'))return r.fulfill({path:path.join(ROOT,'index.html'),contentType:'text/html'});
   for(const [k,f] of [['firebase-app.js','app.js'],['firebase-auth.js','auth.js'],['firebase-database.js','db.js']])if(u.includes(k))return r.fulfill({path:F+f,contentType:'text/javascript'});return r.abort()});
  await ctx.addInitScript(u=>{window.__uid=u;try{if(!localStorage.getItem('sq_age_'+u))localStorage.setItem('sq_age_'+u,'a')}catch(e){}},uid);
  const p=await ctx.newPage();p.uid=uid;p.on('pageerror',e=>errors.push(uid+': '+e.message));
  await p.exposeBinding('__relay',(src,op,pp,v)=>relay(p,op,pp,v));await p.exposeFunction('__dbGet',(u,q)=>DB.get(u,q));await p.exposeFunction('__dbUpdate',(u,q)=>DB.update(u,q));
  await p.exposeFunction('__dbCas',(u,q,o,v)=>DB.cas(u,q,o,v));await p.exposeFunction('__dbListen',(u,q,id)=>DB.listen(p,u,q,id));await p.exposeFunction('__dbUnlisten',id=>DB.unlisten(p,id));pages.push(p)}
 for(const p of pages)await p.goto('http://sq.test/');
 await pages[0].waitForTimeout(1300);
 for(const p of pages){await p.click('#tsps');await p.click('#tsmn [data-a="in"]')}
 await pages[0].waitForTimeout(900);
 for(const p of pages){await p.click('#tsmn [data-a="go"]');await p.fill('#cni',p.uid.toUpperCase());await p.evaluate(()=>document.getElementById('cgo').click())}
 await pages[0].waitForTimeout(600);
 const tree=await pages[0].evaluate(()=>JSON.parse(JSON.stringify(window.__db.T)));
 for(const p of pages.slice(1))for(const k in tree)await p.evaluate(([k,v])=>window.__remote(k,v),[k,tree[k]]);
 return {b,pages,errors,close:()=>b.close()}}
// assertion helper: collects failures instead of throwing on the first one
const canon=v=>Array.isArray(v)?v.map(canon):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canon(v[k])])):v;// key order doesn't matter
function expect(){const fails=[];const t=(ok,msg)=>{if(!ok)fails.push(msg)};t.eq=(a,b,msg)=>{if(JSON.stringify(canon(a))!==JSON.stringify(canon(b)))fails.push(msg+': expected '+JSON.stringify(b)+', got '+JSON.stringify(a))};t.fails=fails;return t}
module.exports={world,expect};
