// node test.js : runs patreonAuth / patreonHook against an in-memory database and a fake Patreon.
const assert=require('assert');const Module=require('module');const crypto=require('crypto');
const T={};const get=p=>p.split('/').filter(Boolean).reduce((o,k)=>o==null?null:o[k],T)??null;
const set=(p,v)=>{const ks=p.split('/').filter(Boolean);let o=T;for(const k of ks.slice(0,-1))o=o[k]=o[k]||{};if(v==null)delete o[ks.at(-1)];else o[ks.at(-1)]=JSON.parse(JSON.stringify(v))};
const ref=p=>({get:async()=>({val:()=>JSON.parse(JSON.stringify(get(p||'')))}),set:async v=>set(p,v),remove:async()=>set(p,null),update:async o=>{for(const k in o)set((p?p+'/':'')+k,o[k])}});
const H={};const fakeFn={region:()=>fakeFn,https:{onRequest:f=>f},pubsub:{schedule:()=>({onRun:f=>f})},database:{ref:()=>({onWrite:f=>f})}};
const USERS={'heather@x.com':{uid:'uidHEATHR',emailVerified:true},'unver@x.com':{uid:'uidUNVERI',emailVerified:false},'kass@x.com':{uid:'uidKASSSS',emailVerified:true}};
const _load=Module._load;Module._load=function(r,...a){if(r==='firebase-admin')return{initializeApp(){},database:()=>({ref}),auth:()=>({getUserByEmail:async e=>{if(USERS[e])return USERS[e];throw new Error('no user')}})};if(r==='firebase-functions/v1')return fakeFn;return _load.call(this,r,...a)};
const fn=require('./index.js'),L=require('./lib.js');
let PAT={},MEM=[],CT='CT1',CALLS=[];global.fetch=async(url,o)=>{CALLS.push(url);
 if(url.includes('/campaigns')){if(o.headers.Authorization!=='Bearer '+CT)return{ok:false,status:401,text:async()=>'expired'};
  if(url.endsWith('/campaigns'))return{ok:true,json:async()=>({data:[{id:'777',type:'campaign'}]})};
  const pg=url.includes('cursor=2')?1:0,half=Math.ceil(MEM.length/2),list=pg?MEM.slice(half):MEM.slice(0,half);
  return{ok:true,json:async()=>({data:list.map(m=>({type:'member',id:'m'+m.pu,attributes:m.a,relationships:{user:{data:{id:m.pu}}}})),links:pg?{}:{next:'https://www.patreon.com/api/oauth2/v2/campaigns/777/members?cursor=2'}})}}
 if(url.includes('/token')&&new URLSearchParams(o.body).get('grant_type')==='refresh_token'){const b=new URLSearchParams(o.body);if(b.get('refresh_token')!=='RT1')return{ok:false,status:400,text:async()=>'no'};CT='CT2';return{ok:true,json:async()=>({access_token:'CT2',refresh_token:'RT2'})}}
 if(url.includes('/token')){const b=new URLSearchParams(o.body);if(b.get('code')!=='good'||b.get('client_secret')!=='sec')return{ok:false,status:401,text:async()=>'no'};return{ok:true,json:async()=>({access_token:'AT'})}}
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
 r=await hook(mem('pu404',{patron_status:'active_patron'}),'members:create');assert.match(r.body,/kept for linking/);
 // 11. relink moves the Patreon account to another player
 set('plink/uidCCCCCC',{n:'cccccccccccccccc1234',t:now});PAT={data:{id:'pu1'},included:[{type:'member',attributes:{patron_status:'active_patron',next_charge_date:iso(now+10*day)},relationships:{campaign:{data:{id:'777'}}}}]};
 r=resp();await fn.patreonAuth({query:{code:'good',state:'uidCCCCCC.cccccccccccccccc1234'}},r);assert.equal(get('pmap/pu1'),'uidCCCCCC');assert.equal(get('puser/uidAAAAAA'),null);
 // 12. stale link (older than 20 min)
 set('plink/uidDDDDDD',{n:'dddddddddddddddd1234',t:now-30*60e3});r=resp();await fn.patreonAuth({query:{code:'good',state:'uidDDDDDD.dddddddddddddddd1234'}},r);assert.equal(r.code,400);
 // 13. user said no on Patreon
 r=resp();await fn.patreonAuth({query:{error:'access_denied'}},r);assert.match(r.body,/didn't give access/);
 // 14. bad code from Patreon
 set('plink/uidEEEEEE',{n:'eeeeeeeeeeeeeeee1234',t:now});r=resp();await fn.patreonAuth({query:{code:'bad',state:'uidEEEEEE.eeeeeeeeeeeeeeee1234'}},r);assert.equal(r.code,502);
 // 15. a join notice that arrives before the player links is applied when they link (membership not active yet in identity)
 r=await hook(mem('pu9',{patron_status:'active_patron',next_charge_date:iso(now+30*day)}),'members:create');assert.match(r.body,/kept for linking/);assert.ok(get('ppend/pu9'));
 set('plink/uidFFFFFF',{n:'ffffffffffffffff1234',t:now});PAT={data:{id:'pu9'},included:[{type:'member',attributes:{patron_status:null},relationships:{campaign:{data:{id:'777'}}}}]};
 r=resp();await fn.patreonAuth({query:{code:'good',state:'uidFFFFFF.ffffffffffffffff1234'}},r);assert.match(r.body,/Linked! /);assert.ok(get('patron/uidFFFFFF').u>now+31*day);assert.equal(get('ppend/pu9'),null);
 // 16. an old pending notice (over 3 days) isn't used
 set('ppend/pu8',{a:{patron_status:'active_patron'},t:now-4*day});set('plink/uidGGGGGG',{n:'gggggggggggggggg1234',t:now});PAT={data:{id:'pu8'},included:[]};
 r=resp();await fn.patreonAuth({query:{code:'good',state:'uidGGGGGG.gggggggggggggggg1234'}},r);assert.match(r.body,/no active membership/);
 // 17. a Patreon account linked to the wrong player by mistake: relinking moves it and removes the new record from the first player
 set('pmap/pu7','uidWRONGG');set('puser/uidWRONGG','pu7');set('patron/uidWRONGG',{s:now-3600e3,u:now+30*day,c:true});
 set('plink/uidRIGHTT',{n:'rrrrrrrrrrrrrrrr1234',t:now});PAT={data:{id:'pu7'},included:[{type:'member',attributes:{patron_status:'active_patron',next_charge_date:iso(now+30*day)},relationships:{campaign:{data:{id:'777'}}}}]};
 r=resp();await fn.patreonAuth({query:{code:'good',state:'uidRIGHTT.rrrrrrrrrrrrrrrr1234'}},r);assert.match(r.body,/Linked! /);
 assert.equal(get('patron/uidWRONGG'),null);assert.ok(get('patron/uidRIGHTT').u>now+31*day);assert.equal(get('pmap/pu7'),'uidRIGHTT');assert.equal(get('puser/uidWRONGG'),null);
 // 18. an older patron record on the previous player just ends (not deleted)
 set('pmap/pu6','uidOLDOLD');set('patron/uidOLDOLD',{s:now-60*day,u:now+10*day,c:true});set('plink/uidNEWNEW',{n:'nnnnnnnnnnnnnnnn1234',t:now});PAT={data:{id:'pu6'},included:[]};
 r=resp();await fn.patreonAuth({query:{code:'good',state:'uidNEWNEW.nnnnnnnnnnnnnnnn1234'}},r);const oo=get('patron/uidOLDOLD');assert.ok(oo&&oo.u<=Date.now()&&oo.c===true);
 // 19. sync: no creator token -> reported, nothing else
 let R=await fn.patreonSyncNow();assert.equal(R.ok,false);assert.equal(get('cfgpub/psync').e,'no creator token');
 // 20. sync by email: Heather's game is linked to a Patreon account with no membership (a mix-up); her real membership is
 //     found by her email and replaces it. An unverified email and a free follower are never linked. Expired token renewed.
 set('cfg/patreon/ct','CT0');set('cfg/patreon/crt','RT1');set('cfg/patreon/camp',null);
 set('pmap/puWRONG','uidHEATHR');set('puser/uidHEATHR','puWRONG');
 MEM=[{pu:'puHEATHER',a:{email:'Heather@X.com ',patron_status:'active_patron',next_charge_date:iso(now+25*day)}},{pu:'puUNV',a:{email:'unver@x.com',patron_status:'active_patron'}},
  {pu:'puFREE',a:{email:'kass@x.com',patron_status:null}},{pu:'puNOBODY',a:{email:'who@x.com',patron_status:'active_patron'}},{pu:'pu1',a:{patron_status:'active_patron',next_charge_date:iso(now+40*day)}}];
 R=await fn.patreonSyncNow();assert.equal(R.ok,true,JSON.stringify(R));assert.deepEqual([R.n,R.act,R.lk,R.nw,R.um],[4,4,1,1,2]);
 assert.equal(get('pmap/puHEATHER'),'uidHEATHR');assert.equal(get('puser/uidHEATHR'),'puHEATHER');assert.equal(get('pmap/puWRONG'),null);
 p=get('patron/uidHEATHR');assert.ok(p.u>now+27*day&&p.c===true);assert.equal(get('patron/uidUNVERI'),null);assert.equal(get('pmap/puFREE'),null);
 assert.equal(get('cfg/patreon/ct'),'CT2');assert.equal(get('cfg/patreon/crt'),'RT2');assert.equal(get('cfg/patreon/camp'),'777');assert.ok(get('patron/uidCCCCCC').u>now+42*day,'linked members renewed');
 assert.ok(!JSON.stringify(T).toLowerCase().includes('heather@x.com'),'emails are never stored');
 // 21. a player already linked to another ACTIVE member isn't taken over by an email match
 set('pmap/puKASS1','uidKASSSS');set('puser/uidKASSSS','puKASS1');MEM=[{pu:'puKASS1',a:{patron_status:'active_patron'}},{pu:'puKASS2',a:{email:'kass@x.com',patron_status:'active_patron'}}];
 R=await fn.patreonSyncNow();assert.equal(get('puser/uidKASSSS'),'puKASS1');assert.equal(get('pmap/puKASS2'),null);assert.equal(R.um,1);
 // 22. a webhook for someone not linked yet links them by email
 set('patron/uidHEATHR',null);set('pmap/puHEATHER',null);set('puser/uidHEATHR',null);
 r=await hook(mem('puHEATHER',{email:'heather@x.com',patron_status:'active_patron',next_charge_date:iso(now+28*day)}),'members:pledge:create');assert.equal(r.body,'ok');
 assert.equal(get('pmap/puHEATHER'),'uidHEATHR');assert.ok(get('patron/uidHEATHR').u>now+30*day);
 // 23. a bad refresh token: sync reports the error
 set('cfg/patreon/ct','CTX');set('cfg/patreon/crt','RTX');CT='CT9';R=await fn.patreonSyncNow();assert.equal(R.ok,false);assert.match(R.e,/401/);
 // 24. the scheduled run is the same sync
 assert.equal(typeof fn.patreonSync,'function');
 console.log('all 24 checks passed')})().catch(e=>{console.error('FAIL',e);process.exit(1)});
