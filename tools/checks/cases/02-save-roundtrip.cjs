module.exports={name:'save and load keep bag, gold and skills',async run(p,t){
 const r=await p.evaluate(()=>{inv.wood=37;inv.ibar=12;inv.berry=5;GLD=4321;XPS[1]=XT[20];saveLocal(true);
  const before={inv:{wood:inv.wood,ibar:inv.ibar,berry:inv.berry},gold:GLD,xp:XPS[1]};
  inv.wood=0;inv.ibar=0;inv.berry=0;GLD=0;XPS[1]=0;applySave(JSON.parse(localStorage.getItem(LS)));
  return{before,after:{inv:{wood:inv.wood,ibar:inv.ibar,berry:inv.berry},gold:GLD,xp:XPS[1]}}});
 t.eq(r.after,r.before,'values after loading the save')}};
