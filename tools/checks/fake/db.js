const T={};const L=[];const parts=p=>p.split('/').filter(Boolean);
const getAt=p=>{let o=T;for(const k of parts(p)){if(o==null)return null;o=o[k]}return o??null};
const setAt=(p,v)=>{const ks=parts(p);let o=T;for(const k of ks.slice(0,-1))o=o[k]=o[k]||{};if(v==null)delete o[ks.at(-1)];else o[ks.at(-1)]=v};
const snap=(key,v)=>({key,val:()=>v==null?null:JSON.parse(JSON.stringify(v)),exists:()=>v!=null});
const fill=v=>{if(v&&v.__ts)return Date.now();if(v&&typeof v==='object'){const o={};for(const k in v)o[k]=fill(v[k]);return o}return v};
function emit(path){for(const l of L){if(l.type==='value'&&(l.path===path||path.startsWith(l.path+'/')))l.f(snap(l.path,getAt(l.path)));
 if(l.type!=='value'){const ks=parts(path),lk=parts(l.path);if(ks.length===lk.length+1&&ks.slice(0,-1).join('/')===lk.join('/')){const k=ks.at(-1),v=getAt(l.path+'/'+k);
  if(v==null){if(l.type==='removed'&&l.known.has(k)){l.known.delete(k);l.f(snap(k,null))}}else if(!l.known.has(k)){l.known.add(k);if(l.type==='added')l.f(snap(k,v))}else if(l.type==='changed'||l.type==='added'&&false)l.f(snap(k,v))}}}}
export const getDatabase=()=>({});export const ref=(d,p)=>{if(p!==undefined&&(typeof p!=='string'||!p.length||/[.#$\[\]]/.test(p.replace(/^\/*\.info(\/|$)/,'/'))))throw new Error('child failed: path argument was an invalid path = "'+p+'"');return{path:p===undefined?'':p}};export const serverTimestamp=()=>({__ts:1});export const increment=n=>({__inc:n});
// queries: only get() applies them (orderByKey/endBefore/limitToLast, enough for the chat log); listeners ignore them as before
export const query=(r,...c)=>({...r,q:Object.assign({},r.q||{},...c.filter(x=>x&&typeof x==='object'))});export const limitToLast=n=>({lim:n});export const orderByKey=()=>({});export const limitToFirst=n=>({first:n});export const endBefore=k=>({end:k});
async function _get(r){const v=getAt(r.path);if(!r.q||!v||typeof v!=='object')return snap(r.path,v);let ks=Object.keys(v).sort();if(r.q.end!=null)ks=ks.filter(k=>k<r.q.end);if(r.q.lim)ks=ks.slice(-r.q.lim);if(r.q.first)ks=ks.slice(0,r.q.first);const o={};for(const k of ks)o[k]=v[k];return snap(r.path,ks.length?o:null)}
async function _set(r,v){abortAt(r.path);/* names rule */if(r.path.startsWith('names/')){const cur=getAt(r.path);if(v!=null&&cur!=null&&cur!==v){const e=new Error('PERMISSION_DENIED');e.code='PERMISSION_DENIED';throw e}}if((window.__deny||[]).some(p=>r.path.startsWith(p))){const e=new Error('PERMISSION_DENIED: Permission denied');e.code='PERMISSION_DENIED';throw e}const f=fill(v);setAt(r.path,f);emit(r.path);window.__relay&&window.__relay('set',r.path,f==null?null:JSON.parse(JSON.stringify(f)))}
async function _update(r,v){v=Object.assign({},v);for(const k in v)if(v[k]&&typeof v[k]==='object'&&v[k].__inc!=null){const c=getAt(r.path+'/'+k);v[k]=(typeof c==='number'?c:0)+v[k].__inc}/* increment(): resolved against what's there, like the server */const f=fill(v);if(Object.keys(f).some(k=>k.includes('/'))){for(const k in f)setAt(r.path+'/'+k,f[k]);if(getAt(r.path)==null)setAt(r.path,{})}else{const o=getAt(r.path)||{};setAt(r.path,Object.assign(o,f))}emit(r.path);window.__relay&&window.__relay('set',r.path,JSON.parse(JSON.stringify(getAt(r.path))))}
async function _remove(r){abortAt(r.path);setAt(r.path,null);emit(r.path);window.__relay&&window.__relay('set',r.path,null)}
let n=0;export async function push(r,v){const k='m'+Date.now().toString(36)+(++n).toString().padStart(4,'0')+Math.random().toString(36).slice(2,5);await set({path:r.path+'/'+k},v)}
export const onDisconnect=()=>({remove:async()=>{}});
function on(type,r,f){if((window.__deny||[]).some(p=>r.path.startsWith(p))){console.warn('listen denied',r.path);return()=>{}}const l={type,path:r.path,f,known:new Set()};L.push(l);
 if(type==='value'){if(r.path==='.info/connected')setTimeout(()=>f(snap('c',true)),10);else if(r.path==='.info/serverTimeOffset')f(snap('o',0));else f(snap(r.path,getAt(r.path)))}
 else{const o=getAt(r.path)||{};for(const k in o){l.known.add(k);if(type==='added')f(snap(k,o[k]))}}
 return()=>{const i=L.indexOf(l);if(i>=0)L.splice(i,1)}}
const _onValue=(r,f)=>on('value',r,f);export const onChildAdded=(r,f)=>on('added',r,f),onChildChanged=(r,f)=>on('changed',r,f),onChildRemoved=(r,f)=>on('removed',r,f);
window.__db={T,set:(p,v)=>set({path:p},v),update:(p,v)=>update({path:p},v),push:(p,v)=>push({path:p},v)};

window.__remote=(path,v)=>{setAt(path,v);emit(path)};

// like the real SDK: the new value is shown to listeners straight away (before the server confirms), and a set()/remove()
// at that spot (or above it) while the transaction is still pending aborts it with Error('set')
const PEND=new Map();const abortAt=p=>{for(const[q,t]of PEND)if(q===p||q.startsWith(p+'/'))t.aborted=true};
async function _runTransaction(r,f){const cur=getAt(r.path);/* a path the player can't read (window.__noRead): the real SDK never learns the stored value, so a transaction over one fails */if(cur!=null&&(window.__noRead||[]).some(p=>r.path.startsWith(p))){const e=new Error('maxretry');e.code='maxretry';throw e}const nv=f(cur==null?null:JSON.parse(JSON.stringify(cur)));if(nv===undefined)return{committed:false,snapshot:snap(r.path,cur)};
 const tok={aborted:false};PEND.set(r.path,tok);const fv=fill(nv);setAt(r.path,fv);emit(r.path);await new Promise(res=>setTimeout(res,5));PEND.delete(r.path);
 if(tok.aborted)throw new Error('set');window.__relay&&window.__relay('set',r.path,fv==null?null:JSON.parse(JSON.stringify(fv)));return{committed:true,snapshot:snap(r.path,nv)}}

const GP=/^(guilds|glog|gname|gmem|ginv|gchat|glb|market)(\/|$)/;// Nov 21: market too (an offer the rules refused passed here)
const uid=()=>window.__fakeUser&&window.__fakeUser.uid||null;
const sn=(p,v)=>({key:String(p).split('/').pop(),val:()=>v==null?null:JSON.parse(JSON.stringify(v)),exists:()=>v!=null});
const deny=x=>{const e=new Error('PERMISSION_DENIED: '+x.why);e.code='PERMISSION_DENIED';throw e};
const fix=x=>{if(x&&typeof x==='object'){if(x.__ts)return{'.sv':'timestamp'};const o2={};for(const k in x)o2[k]=fix(x[k]);return o2}return x};const LS=new Map();let ln=0;window.__dbFire=(id,v)=>{const f=LS.get(id);if(f)f.f(sn(f.p,v==null?null:JSON.parse(v)))};window.__dbErr=id=>{const f=LS.get(id);if(f){LS.delete(id);f.e&&f.e(new Error('permission_denied'))}};
export async function get(r){if(!GP.test(r.path))return _get(r);const x=await __dbGet(uid(),r.path);if(!x.ok)deny(x);return sn(r.path,x.v)}
export async function set(r,v){if(!GP.test(r.path))return _set(r,v);const x=await __dbUpdate(uid(),{[r.path]:fix(v)});if(!x.ok)deny(x)}
export async function remove(r){if(!GP.test(r.path))return _remove(r);const x=await __dbUpdate(uid(),{[r.path]:null});if(!x.ok)deny(x)}
export async function update(r,v){const b=String(r.path||'').replace(/\/$/,'');const keys=Object.keys(v);
 if(b===''&&keys.some(k=>GP.test(k))){const o={};for(const k of keys){if(!GP.test(k))throw new Error('test: mixed update '+k);o[k]=v[k]&&v[k].__ts?{'.sv':'timestamp'}:v[k]}
  for(const k in o)o[k]=fix(o[k]);const y=await __dbUpdate(uid(),o);if(!y.ok)deny(y);return}
 if(GP.test(b)){const o={};for(const k of keys)o[b+'/'+k]=fix(v[k]);const y=await __dbUpdate(uid(),o);if(!y.ok)deny(y);return}return _update(r,v)}
export async function runTransaction(r,f){if(!GP.test(r.path))return _runTransaction(r,f);for(let i=0;i<20;i++){const x=await __dbGet(uid(),r.path);if(!x.ok)deny(x);const oj=JSON.stringify(x.v==null?null:x.v);const nv=f(x.v==null?null:JSON.parse(oj));
  if(nv===undefined)return{committed:false,snapshot:sn(r.path,x.v)};const y=await __dbCas(uid(),r.path,oj,nv);if(y.ok)return{committed:true,snapshot:sn(r.path,nv)};if(!y.retry)deny(y)}throw new Error('txn')}
export function onValue(r,f,e){if(!GP.test(r.path))return _onValue(r,f);const id='g'+(++ln);LS.set(id,{f,e,p:r.path});__dbListen(uid(),r.path,id).then(x=>{if(!x.ok){LS.delete(id);e&&e(new Error('permission_denied'))}});return()=>{LS.delete(id);__dbUnlisten(id)}}
