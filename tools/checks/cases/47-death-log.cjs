// Nov 20: every fall is logged with what did it (252's `deaths` records), the rules accept them, and Dev Suite > Admin > Deaths lists them.
module.exports={name:'falls are logged with what got you, and listed in Admin > Deaths',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);
  routeOpen=()=>true;const until=async(f,ms)=>{const e=Date.now()+ms;while(Date.now()<e){if(f())return true;await W(200)}return false};
  routeGo('briarwood');if(!await until(()=>curRegion()==='briarwood'&&!(typeof TRAVEL!=='undefined'&&TRAVEL),30000))return{err:'never arrived'};await W(600);
  const R=SCENE.room,px=P.x,py=P.y;for(const n of en)if(!n._pet&&Math.hypot(n.x-P.x,n.y-P.y)<260){n.dead=1;n.dropped=1}en=en.filter(n=>!n.dead||n._pet);
  const m=rgMake('slime:moss',40,px+60,py-4);m.rg=R.region;RG_OWN.add(m);en.push(m);
  P.hp=1;hurt=0;await until(()=>{P.x=px;P.y=py;return dead},8000);const fell=dead;await W(1200);
  const all=()=>Object.values((window.__db.T||{}).deaths||{});const recs=all();
  reset();await W(600);const after=all().length;
  // the Admin list
  await __dbForce({['devs/'+SQMP.user.uid]:true});window.SQDEV=()=>true;SQSUITE.open();await W(500);
  document.querySelector('#dvs [data-tab="admin"]').click();await W(200);document.querySelector('#dvs [data-adm="v:deaths"]').click();
  await until(()=>/slime:moss/.test(document.querySelector('#dvs').textContent),5000);const listed=document.querySelector('#dvs').textContent.includes('slime:moss');window.__dbg=document.querySelector('#dvs').textContent.slice(0,400);SQSUITE.close();
  const x=recs[0]||{};return{fell,n:recs.length,after,rec:{by:x.by,m:x.m,w:x.w,u:x.u===SQMP.user.uid,t:typeof x.t,seen:x.ms>=0},listed,dbg:window.__dbg}});
 if(r.err){t(false,r.err);return}
 t(r.fell,'the test fall never happened');t.eq(r.n,1,'death records for one fall');t.eq(r.after,1,'records after getting up (no second record)');
 t.eq(r.rec,{by:'Ouch!',m:'slime:moss',w:'briarwood',u:true,t:'number',seen:true},'the record');t(r.listed,'Admin > Deaths didn\'t list it '+r.dbg)}};
