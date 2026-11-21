// Nov 20 (Heather, Briarwood): "Ouch!" hits with no monster around her, until she fell. 227 counted a monster as seen whenever it
// was passed to the monster drawer, even when it was drawn off the screen or see-through. Now only a monster drawn where you can see
// it can touch you, the last hits are logged with what was next to you, and falling to an unseen touch sends one [auto] report.
module.exports={name:'only monsters you can see can touch you; unseen falls are reported',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);
  routeOpen=()=>true;const until=async(f,ms)=>{const e=Date.now()+ms;while(Date.now()<e){if(f())return true;await W(200)}return false};
  routeGo('briarwood');if(!await until(()=>curRegion()==='briarwood'&&!(typeof TRAVEL!=='undefined'&&TRAVEL),30000))return{err:'never arrived'};await W(600);
  const R=SCENE.room,out={};const px=P.x,py=P.y;
  const clear=()=>{for(const n of en)if(!n._pet&&Math.hypot(n.x-P.x,n.y-P.y)<260){n.dead=1;n.dropped=1}en=en.filter(n=>!n.dead||n._pet)};
  const mob=()=>{const m=rgMake('slime:moss',40,px+60,py-4);m.rg=R.region;RG_OWN.add(m);en.push(m);return m};
  const hits=async(ms)=>{P.hp=6;hurt=0;let lost=0;const e=Date.now()+ms;while(Date.now()<e){const h=P.hp;P.x=px;P.y=py;await W(50);if(P.hp<h)lost+=h-P.hp;P.hp=6}return lost};
  // a test drawer that draws one monster far off the screen
  let away=null;SQPS.wrap('check 46',next=>function(n){if(n!==away)return next.apply(this,arguments);g.save();g.translate(5000,0);try{return next.apply(this,arguments)}finally{g.restore()}});
  clear();await W(300);const a=mob();out.control=await hits(4000);
  const h=SQGHOSTHIT.hits.slice(-1)[0];out.logged=h&&{msg:h.msg,type:h.m[0]&&h.m[0].type,unseen:SQGHOSTHIT.unseen(h)};out.raw=JSON.stringify(SQGHOSTHIT.hits.map(h=>[Math.round(h.at),h.msg,h.m.map(o=>o.type+":"+o.d+":"+o.seen)])).slice(0,900);a.dead=1;clear();
  await W(300);const b=mob();away=b;out.offscreen=await hits(4000);b.dead=1;away=null;clear();
  // falling right after a touch from nothing you could see sends one report
  const sent=()=>Object.values((window.__db.T||{}).bugs||{}).map(v=>v&&v.what||'').filter(w=>/^\[auto\] Fell/.test(w));
  const fall=async()=>{SQGHOSTHIT.hits.push({at:performance.now(),d:1,msg:'Ouch!',where:'briarwood',m:[]});hurt=0;P.hp=0;await until(()=>dead,3000);await W(300);dead=false;P.hp=6;await W(300)};
  await fall();out.fell=SQGHOSTHIT.fellReported;await fall();await W(500);
  out.sent=sent().length;return out});
 if(r.err){t(false,r.err);return}
 t(r.control>0,'the control monster never hurt you (the check proves nothing)');
 t.eq(r.logged,{msg:'Ouch!',type:'slime',unseen:false},'the logged touch hit');
 t.eq(r.offscreen,0,'hearts lost to a monster drawn off the screen');
 t(r.fell,'falling to an unseen touch wasn\'t noticed');t.eq(r.sent,1,'reports sent for falling to unseen touches (once a session)')}};
