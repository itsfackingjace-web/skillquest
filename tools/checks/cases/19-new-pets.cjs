// New pets from the library (newpets.np_<id>): the pet and its item exist, it can sit in the PET slot, saves keep it, and a save
// loaded before the pet is known keeps it (bag and PET slot) until the library brings it back.
module.exports={name:'new pets made in the Dev Suite work and survive saves',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));
  const lib=o=>Object.assign({},window.SQA&&SQA.live||{},o);
  SQA.preview(lib({newpets:{np_bun:{n:'Bun',d:'A small round bunny.',v:0}}}));
  const reg=[!!EQ.pet_np_bun,LUX.PETS.some(q=>q.k==='np_bun'),INVK.includes('pet_np_bun'),IDESC.pet_np_bun.startsWith('A small round bunny.')];
  inv.pet_np_bun=2;equipItem('pet_np_bun');await W(600);const eq=[LUX.COS.pet,inv.pet_np_bun|0];
  const s1=snap();
  SQA.preview(lib({}));await W(50);const gone=[!EQ.pet_np_bun,LUX.COS.pet];
  applySave(JSON.parse(JSON.stringify(s1)));await W(600);const s2=snap();
  const kept=[s2.cos&&s2.cos.pet,s2.inv.pet_np_bun|0];
  SQA.preview(lib({newpets:{np_bun:{n:'Bun',v:0}}}));await W(600);const back=[LUX.COS.pet,inv.pet_np_bun|0];
  SQA.preview(null);return{reg,eq,gone,kept,back}});
 t.eq(r.reg,[true,true,true,true],'pet and item registered');t.eq(r.eq,['np_bun',1],'equipped from the bag');
 t.eq(r.gone,[true,null],'removed when the library drops it');t.eq(r.kept,['np_bun',1],'save keeps the unknown pet');
 t.eq(r.back,['np_bun',1],'pet back in the slot when the library has it again')}};
