// Nov 20 report: with a Stone Sledgehammer and the Dragonsoul amulet worn and Dragon Form picked, the ULT button said SLAM but
// cast Dragon Form. The button's word follows the picked ultimate (159), and casting uses the same one.
module.exports={name:'ULT button word matches the picked ultimate',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const chip=()=>{const c=hudLayout().chips.find(c=>c[0]==='ult');return c?String(c[1]):''};
  inv.eq_sledge=1;setSlot('main','eq_sledge');SQJW.neck='ja_dsoul';await W(100);const o={};
  SQULT.pick='dragon';o.dragonChip=chip();castUlt();await W(100);o.slamCd=SQSLAM.cd>0;
  SQULT.pick='slam';o.slamChip=chip();return o});
 t(!/SLAM/.test(r.dragonChip),'Dragon Form picked but the button says '+r.dragonChip);t(!r.slamCd,'Dragon Form picked but GROUND SLAM was cast');t(/SLAM/.test(r.slamChip),'Ground Slam picked but the button says '+r.slamChip)}};
