// Nov 26 (auto reports from Kevin at Ashfall and Bowen at Briarwood, 2026.11.25-5): "Fell to an unseen monster" with a world boss right
// there. Bosses are drawn by their own code, not 002's pS, so 227 never had a SEEN time for them. A boss (or other exempt monster)
// within reach now counts as seen; a plain monster nobody could see still counts as unseen.
module.exports={name:'a hit next to a world boss is not reported as unseen',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(300);const G=SQGHOSTHIT;
  const hp0=P.hp;P.hp=6;hurt=0;ROLLT=0;const last=()=>{const h=G.hits[G.hits.length-1];return h?h.at:0},a0=last();
  // the boss walks into you: a touch hit inside the frame, logged by 227 with what was next to you
  const boss={x:P.x+4,y:P.y,hp:1e6,mhp:1e6,kx:0,ky:0,type:'wb',big:1,_wb:'giant',_slot:0,dropped:1};en.unshift(boss);
  for(let k=0;k<20&&last()===a0;k++){boss.x=P.x+4;boss.y=P.y;await W(50)}const h=last()!==a0?G.hits[G.hits.length-1]:null;
  const j=en.indexOf(boss);if(j>=0)en.splice(j,1);P.hp=hp0;
  return{logged:!!h,ex:h&&h.m.some(o=>o.type==='wb'&&o.ex===1),bossUnseen:h?G.unseen(h):null,
   plain:G.unseen({msg:'Ouch!',m:[{type:'slime',d:12,seen:-1}]}),plainSeen:G.unseen({msg:'Ouch!',m:[{type:'slime',d:12,seen:50}]})}});
 t(r.logged,'the hit was logged');t(r.ex,'the world boss is marked as drawn by its own code');
 t.eq(r.bossUnseen,false,'a hit next to the world boss counts as seen');
 t.eq([r.plain,r.plainSeen],[true,false],'plain monsters: never drawn = unseen, drawn = seen')}};
