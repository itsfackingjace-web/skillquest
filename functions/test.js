// node test.js : runs patreonAuth / patreonHook against an in-memory database and a fake Patreon.
const assert=require('assert');const Module=require('module');const crypto=require('crypto');
const T={};const get=p=>p.split('/').filter(Boolean).reduce((o,k)=>o==null?null:o[k],T)??null;
const set=(p,v)=>{const ks=p.split('/').filter(Boolean);let o=T;for(const k of ks.slice(0,-1))o=o[k]=o[k]||{};if(v==null)delete o[ks.at(-1)];else o[ks.at(-1)]=JSON.parse(JSON.stringify(v))};
const ref=p=>({get:async()=>({val:()=>JSON.parse(JSON.stringify(get(p||'')))}),set:async v=>set(p,v),remove:async()=>set(p,null),update:async o=>{for(const k in o)set((p?p+'/':'')+k,o[k])}});
const H={};const fakeFn={region:()=>fakeFn,https:{onRequest:f=>f}};
const _load=Module._load;Module._load=function(r,...a){if(r==='firebase-admin')return{initializeApp(){},database:()=>({ref})};if(r==='firebase-functions/v1')return fakeFn;return _load.call(this,r,...a)};
const fn=require('./index.js'),L=require('./lib.js');
let PAT={};global.fetch=async(url,o)=>{if(url.includes('/token')){const b=new URLSearchParams(o.body);if(b.get('code')!=='good'||b.get('client_secret')!=='sec')return{ok:false,status:401,text:async()=>'no'};return{ok:true,json:async()=>({access_token:'AT'})}}
 if(url.includes('/identity')){assert.equal(o.headers.Authorization,'Bearer AT');return{ok:true,json:async()=>PAT}}throw new Error('unexpected '+url)};
const resp=()=>{const r={code:0,body:'',h:{}};r.status=c=>{r.code=c;return r};r.set=(k,v)=>{r.h[k]=v;return r};r.send=b=>{r.body=String(b);return r};return r};
const now=Date.now(),day=864e5,iso=t=>new Date(t).toISOString();
(async()=>{
 set('cfg/patreon',{cid:'CID',cs:'sec',ws:'whsec',camp:'777'});
 // 1. no plink -> expired
 let r=resp();await fn.patreonAuth({query:{code:'good',state:'uidAAAAAA.abcdefghijklmnop1234'}},r);assert.equal(r.code,400);
 // 2. active patron links
 set('plink/uidAAAAAA',{n:'abcdefghijklmnop1234',t:now});
 PAT={data:{id:'pu1'},included:[{type:'member',id:'m1',attributes:{patron_status:'active_patron',next_charge_date:iso(now+20*day)},relationships:{campaign:{data:{id:'777'}}}}]};
 r=resp();await fn.patreonAuth({query:{code:'good',state:'uidAAAAAA.abcdefghijklmnop1234'}},r);assert.equal(r.code,200);assert.match(r.body,/Linked! /);
 let p=get('patron/uidAAAAAA');assert.ok(p.u>now+22*day&&p.u<now+24*day&&p.c===true&&p.s);assert.equal(get('pmap/pu1'),'uidAAAAAA');assert.equal(get('plink/uidAAAAAA'),null);
 // 3. the same link can't be used twice
 r=resp();await fn.patreonAuth({query:{code:'good',state:'uidAAAAAA.abcdefghijklmnop1234'}},r);assert.equal(r.code,400);
 // 4. member of another campaign only -> linked, no perks
 set('plink/uidBBBBBB',{n:'zzzzzzzzzzzzzzzz1234',t:now});PAT={data:{id:'pu2'},included:[{type:'member',attributes:{patron_status:'active_patron'},relationships:{campaign:{data:{id:'999'}}}}]};
 r=resp();await fn.patreonAuth({query:{code:'good',state:'uidBBBBBB.zzzzzzzzzzzzzzzz1234'}},r);assert.match(r.body,/no active membership/);assert.equal(get('patron/uidBBBBBB'),null);
 // 5. webhook: bad signature refused
 const hook=async(body,ev,sec='whsec')=>{const raw=Buffer.from(JSON.stringify(body));const sig=crypto.createHmac('md5',sec).update(raw).digest('hex');const rr=resp();
  await fn.patreonHook({method:'POST',rawBody:raw,body,get:k=>({'X-Patreon-Signature':sig,'X-Patreon-Event':ev})[k]},rr);return rr};
 const mem=(pu,attrs)=>({data:{type:'member',id:'m',attributes:attrs,relationships:{user:{data:{id:pu}},campaign:{data:{id:'777'}}}}});
 r=await hook(mem('pu1',{patron_status:'active_patron',next_charge_date:iso(now+50*day)}),'members:update','wrong');assert.equal(r.code,401);
 // 6. renewal extends
 r=await hook(mem('pu1',{patron_status:'active_patron',next_charge_date:iso(now+50*day)}),'members:update');assert.equal(r.code,200);p=get('patron/uidAAAAAA');assert.ok(p.u>now+52*day);
 // 7. a developer's hand-added months aren't cut by an active renewal with an earlier date
 const handU=now+200*day;set('patron/uidAAAAAA',Object.assign({},p,{u:handU}));r=await hook(mem('pu1',{patron_status:'active_patron',next_charge_date:iso(now+30*day)}),'members:update');assert.equal(get('patron/uidAAAAAA').u,handU);
 // 8. cancel: perks run to a month after the last paid charge, cape kept
 set('patron/uidAAAAAA',Object.assign({},p,{u:now+40*day}));r=await hook(mem('pu1',{patron_status:'former_patron',last_charge_date:iso(now-10*day),last_charge_status:'Paid'}),'members:delete');
 p=get('patron/uidAAAAAA');assert.ok(Math.abs(p.u-(now+21*day))<2000,'cancel keeps the paid month');assert.equal(p.c,true);
 // 9. declined payment: perks end now-ish
 r=await hook(mem('pu1',{patron_status:'declined_patron',last_charge_date:iso(now-40*day),last_charge_status:'Declined'}),'members:update');assert.ok(get('patron/uidAAAAAA').u<=now+1000);assert.equal(get('patron/uidAAAAAA').c,true);
 // 10. unknown Patreon user: ignored
 r=await hook(mem('pu404',{patron_status:'active_patron'}),'members:create');assert.match(r.body,/not linked/);
 // 11. relink moves the Patreon account to another player
 set('plink/uidCCCCCC',{n:'cccccccccccccccc1234',t:now});PAT={data:{id:'pu1'},included:[{type:'member',attributes:{patron_status:'active_patron',next_charge_date:iso(now+10*day)},relationships:{campaign:{data:{id:'777'}}}}]};
 r=resp();await fn.patreonAuth({query:{code:'good',state:'uidCCCCCC.cccccccccccccccc1234'}},r);assert.equal(get('pmap/pu1'),'uidCCCCCC');assert.equal(get('puser/uidAAAAAA'),null);
 // 12. stale link (older than 20 min)
 set('plink/uidDDDDDD',{n:'dddddddddddddddd1234',t:now-30*60e3});r=resp();await fn.patreonAuth({query:{code:'good',state:'uidDDDDDD.dddddddddddddddd1234'}},r);assert.equal(r.code,400);
 // 13. user said no on Patreon
 r=resp();await fn.patreonAuth({query:{error:'access_denied'}},r);assert.match(r.body,/didn't give access/);
 // 14. bad code from Patreon
 set('plink/uidEEEEEE',{n:'eeeeeeeeeeeeeeee1234',t:now});r=resp();await fn.patreonAuth({query:{code:'bad',state:'uidEEEEEE.eeeeeeeeeeeeeeee1234'}},r);assert.equal(r.code,502);
 console.log('all 14 checks passed')})().catch(e=>{console.error('FAIL',e);process.exit(1)});
