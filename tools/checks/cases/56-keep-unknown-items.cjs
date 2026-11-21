// Nov 21 (Jace's Drop Cards and binder vanished after playing on his phone): a game that didn't know an item dropped it when it
// loaded the save, and its next save erased it for good. Unknown items are now kept through load and save, and join the bag once known.
module.exports={name:'items the game doesn\'t know survive loading and saving',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);
  saveLocal(true);const S=JSON.parse(localStorage.getItem(LS));S.inv.zz_future_card=3;S.inv.dc_slime=2;applySave(S);
  const known=inv.dc_slime|0,kept=SQUNKNOWN.kept.zz_future_card|0;
  saveLocal(true);const S2=JSON.parse(localStorage.getItem(LS));const inSave=S2.inv.zz_future_card|0;
  // the item becomes known (a library update): it joins the bag, once
  INVK.push('zz_future_card');INAME.zz_future_card='Future card';SQUNKNOWN.adopt();SQUNKNOWN.adopt();
  return{known,kept,inSave,bag:inv.zz_future_card|0}});
 t.eq(r,{known:2,kept:3,inSave:3,bag:3},'unknown item kept, saved and adopted once')}};
