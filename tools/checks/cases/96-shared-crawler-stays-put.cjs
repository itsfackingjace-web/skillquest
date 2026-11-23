// Nov 23 (Jace: "Derek is dying to invisible reef crawlers on shattered island"). Other players' monsters are copies pulled toward their
// owner's position, which 061 kept in tx/ty. A reef crawler's AI (also run on copies, so monsters fight everyone) puts its lunge target,
// you, in tx/ty too, so the copy was pulled onto your spot: hidden under you, nicking you every second, while its owner saw it elsewhere.
module.exports={name:'another player\'s reef crawler isn\'t pulled onto you when it winds up to lunge',players:2,async run([A,B],t){
 const go=p=>p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));routeOpen=()=>true;routeGo('shattered');const e=Date.now()+40000;while(Date.now()<e){if(curRegion()==='shattered'&&!(typeof TRAVEL!=='undefined'&&TRAVEL))return true;await W(250)}return false});
 const ok=await Promise.all([go(A),go(B)]);if(!ok[0]||!ok[1])return t(false,'never arrived on the Shattered Expanse');await A.waitForTimeout(1200);
 const pos=await A.evaluate(()=>{for(const n of en)if(!n._pet&&!n.dead&&n.type!=='boss'){n.dead=1;n.dropped=1}return{x:P.x,y:P.y}});
 await B.evaluate(p=>{for(const n of en)if(!n._pet&&!n._rp&&!n.dead&&n.type!=='boss'){n.dead=1;n.dropped=1}P.x=p.x;P.y=p.y+44;P.hp=P.mhp=99;MAXHP=99;hunger=100},pos);
 // Ann's crawler, held still (frozen) 44 px from Bob
 await A.evaluate(p=>{const m=rgMake('crab',24,p.x,p.y);m.rg='shattered';m.frozen=1e9;RG_OWN.add(m);en.push(m)},pos);
 let have=false;for(let i=0;i<40&&!have;i++){have=await B.evaluate(()=>en.some(n=>n._rp&&n.type==='crab'&&!n.dead));if(!have)await B.waitForTimeout(250)}
 if(!have)return t(false,'Bob never got a copy of Ann\'s crawler');
 const r=await B.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const c=en.find(n=>n._rp&&n.type==='crab'&&!n.dead);
  // Bob stands about 44 px from where Ann's game has the crawler, on open ground
  const ox=c._ox!=null?c._ox:c.tx,oy=c._oy!=null?c._oy:c.ty;let spot=null;
  for(const[dx,dy]of[[0,44],[0,-44],[44,0],[-44,0],[32,32],[-32,32],[32,-32],[-32,-32]]){const x=ox+dx,y=oy+dy;if(!solid(x-5,y+2)&&!solid(x+5,y+2)&&!solid(x-5,y+6)&&!solid(x+5,y+6)){spot=[x,y];break}}
  if(!spot)return{err:'no open ground near the crawler'};P.x=spot[0];P.y=spot[1];await W(200);const start=Math.round(Math.hypot(ox-P.x,oy-P.y)),hp0=P.hp;let min=1e9;
  // Bob's copy winds up to lunge over and over (its own AI, as on a real island)
  for(let i=0;i<20;i++){c.frozen=0;if(c.cs!=='lunge'){c.cs='side';c.ct=.01}P.x=spot[0];P.y=spot[1];await W(80);min=Math.min(min,Math.hypot(c.x-P.x,c.y-P.y))}
  return{start,min:Math.round(min),lost:hp0-P.hp}});
 if(r.err)return t(false,r.err);
 t(r.start>=36,'Bob starts '+r.start+' px from the crawler');
 t(r.min>=r.start-10,'the copy came within '+r.min+' px of Bob (its owner holds it '+r.start+' px away)');t.eq(r.lost,0,'health Bob lost to a crawler that wasn\'t there')}};
