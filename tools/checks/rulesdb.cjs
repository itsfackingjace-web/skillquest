// A small Realtime Database stand-in that enforces database.rules.json (.read/.write/.validate, $wildcards),
// shared between several Playwright pages (each page = one signed-in player).
const fs=require('fs'),vm=require('vm');
const clone=v=>v==null?null:JSON.parse(JSON.stringify(v));
const parts=p=>String(p||'').split('/').filter(Boolean);
function getAt(t,ps){let o=t;for(const k of ps){if(o==null||typeof o!=='object')return null;o=o[k]}return o===undefined?null:o}
function prune(o){if(o==null||typeof o!=='object')return o;for(const k of Object.keys(o)){o[k]=prune(o[k]);if(o[k]==null||(typeof o[k]==='object'&&!Object.keys(o[k]).length))delete o[k]}return o}
function setAt(t,ps,v){if(!ps.length)return prune(clone(v))||{};let o=t;for(const k of ps.slice(0,-1)){if(o[k]==null||typeof o[k]!=='object')o[k]={};o=o[k]}const last=ps[ps.length-1];if(v==null)delete o[last];else o[last]=clone(v);return prune(t)||{}}
function sv(v,now){if(v&&typeof v==='object'){if(v['.sv']==='timestamp')return now;const o=Array.isArray(v)?[]:{};for(const k in v)o[k]=sv(v[k],now);return o}return v}
class Snap{constructor(t,ps){this.t=t;this.ps=ps}
 child(k){return new Snap(this.t,this.ps.concat(parts(k)))} parent(){return new Snap(this.t,this.ps.slice(0,-1))}
 val(){const v=getAt(this.t,this.ps);return v&&typeof v==='object'?clone(v):v} exists(){return getAt(this.t,this.ps)!=null}
 hasChildren(l){const v=getAt(this.t,this.ps);if(!v||typeof v!=='object')return false;return!l||l.every(k=>v[k]!=null)} hasChild(k){return this.child(k).exists()}
 isString(){return typeof getAt(this.t,this.ps)==='string'} isNumber(){return typeof getAt(this.t,this.ps)==='number'} isBoolean(){return typeof getAt(this.t,this.ps)==='boolean'}
}
class RulesDB{
 constructor(rulesPath){this.rules=JSON.parse(fs.readFileSync(rulesPath,'utf8')).rules;this.data={};this.subs=new Map();this.sid=0;this.log=[];
  this.ctx=vm.createContext({});vm.runInContext("String.prototype.matches=function(r){return r.test(this)};String.prototype.contains=function(s){return this.indexOf(s)>=0};String.prototype.beginsWith=function(s){return this.startsWith(s)}",this.ctx)}
 // walk the rules tree along ps, returning [{node, vars, depth}] for depth 0..ps.length (node may be null)
 walk(ps){const out=[];let n=this.rules,vars={};out.push({n,vars:{...vars},d:0});
  for(let i=0;i<ps.length;i++){const k=ps[i];let nx=null;if(n&&typeof n==='object'){if(n[k]!==undefined&&!k.startsWith('.'))nx=n[k];else{const w=Object.keys(n).find(x=>x[0]==='$');if(w){nx=n[w];vars={...vars,[w]:k}}}}n=nx;out.push({n,vars:{...vars},d:i+1})}return out}
 ev(expr,o){if(expr===true||expr===false)return expr;const c=this.ctx;c.root=o.root;c.data=o.data;c.newData=o.newData;c.auth=o.auth;c.now=o.now;for(const k in o.vars)c[k]=o.vars[k];
  try{return vm.runInContext('('+expr+')',c)===true}catch(e){return false}finally{for(const k in o.vars)delete c[k]}}
 canRead(uid,path){const ps=parts(path),auth=uid?{uid}:null,now=Date.now();for(const w of this.walk(ps)){if(w.n&&w.n['.read']!==undefined&&this.ev(w.n['.read'],{root:new Snap(this.data,[]),data:new Snap(this.data,ps.slice(0,w.d)),auth,now,vars:w.vars}))return true}return false}
 // multi-path update at root: {path: value}
 update(uid,ups){const now=Date.now(),auth=uid?{uid}:null;let nt=clone(this.data);const U={};for(const p in ups)U[p]=sv(ups[p],now);for(const p in U)nt=setAt(nt,parts(p),U[p]);
  const R=new Snap(this.data,[]);
  for(const p in U){const ps=parts(p),W=this.walk(ps);let ok=false;
   for(const w of W){if(w.n&&w.n['.write']!==undefined&&this.ev(w.n['.write'],{root:R,data:new Snap(this.data,ps.slice(0,w.d)),newData:new Snap(nt,ps.slice(0,w.d)),auth,now,vars:w.vars})){ok=true;break}}
   if(!ok)return{ok:false,why:'write denied: '+p};
   // validate: ancestors, the node, and every descendant of the new value
   const chk=(ps2)=>{const W2=this.walk(ps2);const w=W2[W2.length-1];const nd=new Snap(nt,ps2);if(!nd.exists())return'';if(w.n===null){/* no rule = allowed */return''}
     if(w.n&&w.n['.validate']!==undefined&&!this.ev(w.n['.validate'],{root:R,data:new Snap(this.data,ps2),newData:nd,auth,now,vars:w.vars}))return'validate failed: '+ps2.join('/');return''};
   for(let d=1;d<=ps.length;d++){const e=chk(ps.slice(0,d));if(e)return{ok:false,why:e}}
   const desc=(ps2,v)=>{if(v&&typeof v==='object')for(const k in v){const q=ps2.concat(k);const e=chk(q)||desc(q,v[k]);if(e)return e}return''};const e=desc(ps,getAt(nt,ps));if(e)return{ok:false,why:e}}
  const old=this.data;this.data=nt;this.log.push({uid,ups:Object.keys(U)});this.fire(old);return{ok:true}}
 get(uid,path){if(!this.canRead(uid,path))return{ok:false,why:'read denied: '+path};return{ok:true,v:clone(getAt(this.data,parts(path)))}}
 // compare-and-set for transactions
 // test set-up only: write without rules (data as it was before a rule change)
 force(ups){const old=this.data;let nt=clone(this.data);for(const p in ups)nt=setAt(nt,parts(p),ups[p]);this.data=nt;this.fire(old);return{ok:true}}
 cas(uid,path,oldJ,nv){const cur=getAt(this.data,parts(path));if(JSON.stringify(cur==null?null:cur)!==oldJ)return{ok:false,retry:true,cur:clone(cur)};return this.update(uid,{[path]:nv})}
 listen(page,uid,path,id){if(!this.canRead(uid,path))return{ok:false,why:'read denied: '+path};const key=(page.__k=page.__k||Math.random().toString(36).slice(2))+'|'+id;this.subs.set(key,{page,uid,path,last:undefined,id});this.push(key);return{ok:true}}
 unlisten(page,id){this.subs.delete((page.__k||'')+'|'+id)}
 push(key){const s=this.subs.get(key);if(!s)return;const id=s.id;const v=JSON.stringify(getAt(this.data,parts(s.path)));if(v===s.last)return;s.last=v;
  if(!this.canRead(s.uid,s.path)){this.subs.delete(key);s.page.evaluate(([id])=>window.__dbErr&&__dbErr(id),[id]).catch(()=>{});return}
  s.page.evaluate(([id,v])=>window.__dbFire&&__dbFire(id,v),[id,v]).catch(()=>{})}
 fire(){for(const id of this.subs.keys())this.push(id)}
 wipePage(page){for(const[id,s]of this.subs)if(s.page===page)this.subs.delete(id)}}
// page side: a modular-SDK-shaped SQFB that talks to the node DB
const PAGE=`(()=>{const L=new Map();let n=0;
 window.__dbFire=(id,v)=>{const f=L.get(id);if(f)f.cb({val:()=>v==null?null:JSON.parse(v),exists:()=>v!=null&&v!=='null',key:f.path.split('/').pop()})};
 window.__dbErr=id=>{const f=L.get(id);if(f){L.delete(id);f.err&&f.err(new Error('permission_denied'))}};
 const uid=()=>window.__UID||null;const snap=(p,v)=>({val:()=>v==null?null:v,exists:()=>v!=null,key:String(p).split('/').pop(),forEach:f=>{if(v&&typeof v==='object')for(const k in v)if(f({key:k,val:()=>v[k]}))break}});
 const err=r=>{const e=new Error('PERMISSION_DENIED: '+r.why);e.code='PERMISSION_DENIED';throw e};
 const P=p=>typeof p==='string'?p:(p&&p.path)||'';
 const db={ref:(D,p)=>({path:String(p||'')}),child:(r,p)=>({path:P(r)+'/'+p}),serverTimestamp:()=>({'.sv':'timestamp'}),
  get:async r=>{const x=await __dbGet(uid(),P(r));if(!x.ok)err(x);return snap(P(r),x.v)},
  set:async(r,v)=>{const x=await __dbUpdate(uid(),{[P(r)]:v});if(!x.ok)err(x)},
  remove:async r=>{const x=await __dbUpdate(uid(),{[P(r)]:null});if(!x.ok)err(x)},
  update:async(r,ups)=>{const b=P(r).replace(/\\/$/,''),o={};for(const k in ups)o[(b?b+'/':'')+k]=ups[k];const x=await __dbUpdate(uid(),o);if(!x.ok)err(x)},
  push:(r,v)=>{const k='-'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);const c={path:P(r)+'/'+k,key:k};const pr=v===undefined?Promise.resolve(c):db.set(c,v).then(()=>c);pr.key=k;pr.path=c.path;return pr},
  onValue:(r,cb,e)=>{const id='s'+(++n);L.set(id,{cb,err:e,path:P(r)});__dbListen(uid(),P(r),id).then(x=>{if(!x.ok){L.delete(id);e&&e(new Error('permission_denied'))}});return()=>{L.delete(id);__dbUnlisten(id)}},
  runTransaction:async(r,fn)=>{for(let i=0;i<25;i++){const x=await __dbGet(uid(),P(r));if(!x.ok)err(x);const cur=x.v,oj=JSON.stringify(cur==null?null:cur);const nv=fn(cur==null?null:JSON.parse(oj));
    if(nv===undefined)return{committed:false,snapshot:snap(P(r),cur)};const y=await __dbCas(uid(),P(r),oj,nv);if(y.ok)return{committed:true,snapshot:snap(P(r),nv)};if(!y.retry)err(y)}throw new Error('txn retries')},
  onDisconnect:()=>({set:async()=>{},remove:async()=>{},update:async()=>{},cancel:async()=>{}}),
  query:r=>r,orderByChild:()=>null,limitToLast:()=>null,startAt:()=>null,endAt:()=>null,equalTo:()=>null,orderByKey:()=>null,off:()=>{},onChildAdded:()=>()=>{},goOnline:()=>{},goOffline:()=>{}};
 window.SQFB={db,D:{},auth:{}};})()`;
async function attach(DB,page,uid){
 await page.exposeFunction('__dbGet',(u,p)=>DB.get(u,p));
 await page.exposeFunction('__dbUpdate',(u,ups)=>DB.update(u,ups));
 await page.exposeFunction('__dbCas',(u,p,o,v)=>DB.cas(u,p,o,v));
 await page.exposeFunction('__dbListen',(u,p,id)=>DB.listen(page,u,p,id));
 await page.exposeFunction('__dbUnlisten',id=>DB.unlisten(id));
 await page.evaluate(PAGE);await page.evaluate(u=>{window.__UID=u},uid)}
module.exports={RulesDB,attach,PAGE};
