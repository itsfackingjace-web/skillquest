// Nov 18: getting up before the grave timer ran wiped the bag with no grave.
module.exports={name:'falling puts your bag in a grave, even on a quick respawn',async run(p,t){
 const r=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,400));inv.ibar=3;inv.berry=4;const ck=SQDROPCARD.CARDS.slime.key,pk=Object.keys(SQBINDER.PET)[0];inv[ck]=2;if(pk)inv[pk]=1;dead=true;P.hp=0;reset();
  await new Promise(r=>setTimeout(r,600));const F=window.SQFB,gs=(await F.db.get(F.db.ref(F.D,'graves'))).val()||{};
  const g=Object.values(gs)[0]||{};return{bag:{ibar:inv.ibar|0,berry:inv.berry|0},grave:g.i||null,dead,cards:[inv[ck]|0,pk?inv[pk]|0:1]}});
 t.eq(r.grave,{ibar:3,berry:4},'grave contents');t.eq(r.bag,{ibar:0,berry:0},'bag after falling');t(!r.dead,'still dead after respawn');
 // Nov 21 (Jace): Drop Cards (and pet cards) stay with you when you fall
 t.eq(r.cards,[2,1],'cards kept through a fall')}};
