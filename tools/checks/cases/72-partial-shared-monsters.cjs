// Nov 21 (Jynxedewok on the Shattered Expanse: "Taking 1 damage quickly on repeat an having to leave the island to get rid of it";
// Derek and Korey fell to it). A dropped connection let the server delete a player's shared monsters (onDisconnect), but their game
// went on sending only changed fields (m/<id>/x), which rebuilt monsters with an x and no y, type or health. Every other game made a
// copy without a position, which 001 counted as 1 px away: "Ouch!" every second or so, with nothing there.
module.exports={name:'a partial shared monster record never becomes an invisible monster',players:2,async run([A,B],t){
 const W=ms=>A.waitForTimeout(ms);
 const pos=await A.evaluate(()=>({x:P.x,y:P.y}));await B.evaluate(p=>{P.x=p.x+20;P.y=p.y},pos);
 const ids=[await A.evaluate(()=>SQMP.user.uid),await B.evaluate(()=>SQMP.user.uid)];
 for(let i=0;i<30;i++){const ok=await A.evaluate(u=>!!SQMP.players.get(u),ids[1])&&await B.evaluate(u=>!!SQMP.players.get(u),ids[0]);if(ok)break;await W(300)}
 // Ann has a monster far off so her game publishes (frozen, so it stays put)
 await A.evaluate(()=>{en.push({x:P.x+200,y:P.y+60,hp:50,kx:0,ky:0,frozen:1e9,type:'slime'})});
 for(let i=0;i<30&&!(await A.evaluate(()=>SQMOB.pubbed&&!!SQMOB.loc));i++)await W(300);
 const loc=await B.evaluate(()=>SQMOB.loc);t(!!loc,'Bob has no monster area');if(!loc)return;
 // what a dropped connection leaves in the database: a monster with an x and a timer only, right next to Bob
 await A.evaluate(([loc,bx])=>{const F=SQFB,d=F.db;return d.update(d.ref(F.D,'mobs/'+loc+'/'+SQMP.user.uid),{t:d.serverTimestamp(),'m/zz_part':{x:Math.round(bx),gcd:1.5}})},[loc,pos.x+20]);
 await B.evaluate(()=>{P.hp=Math.max(P.hp,6);window.__h0=P.hp;hunger=100});
 await W(4000);
 const b=await B.evaluate(()=>({made:SQMOB.prox.has('zz_part'),bad:en.filter(n=>!Number.isFinite(n.x)||!Number.isFinite(n.y)).length,
  ghost:(SQGHOSTHIT.hits||[]).filter(h=>h.msg==='Ouch!'&&!h.m.length).length,lost:window.__h0-P.hp}));
 t(!b.made,'Bob made a copy of a monster with no y');t.eq(b.bad,0,'monsters without a position in Bob\'s list');t.eq(b.ghost,0,'"Ouch!" hits with nothing near Bob');
 // the sender side: the server deletes Ann's monsters (as onDisconnect does); after the reconnect her game sends the whole set again
 const a=await A.evaluate(async(loc)=>{const F=SQFB,d=F.db,W=ms=>new Promise(r=>setTimeout(r,ms)),ref=d.ref(F.D,'mobs/'+loc+'/'+SQMP.user.uid);
  await d.remove(ref);if(SQMOB.resync)SQMOB.resync();const n=en.find(q=>q.type==='slime'&&!q._rp);if(n)n.x+=7;await W(1500);
  const s=await d.get(ref),v=s.val()||{},m=v.m||{};return Object.keys(m).map(id=>[id,Number.isFinite(m[id].x)&&Number.isFinite(m[id].y)&&Number.isFinite(m[id].hp)])},loc);
 t(a.length>0,'Ann\'s monsters were not sent again after the reconnect');t(a.every(x=>x[1]),'incomplete monsters sent after the reconnect: '+JSON.stringify(a))}};
