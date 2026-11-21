// Nov 21 (Jace: "if you would find a copy of a pet you already have on you, the game doesn't let you pick it up"): an extra copy of a
// pet you already have goes into your bag (pets are items since 104) instead of being turned away.
module.exports={name:'a second copy of a pet goes into your bag',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);const c=LUX.COS;
  LUX.giveImp();await W(1300);const first=[c.pet,inv.pet_imp|0];LUX.giveImp();await W(1300);const second=[c.pet,inv.pet_imp|0];
  const k=Object.keys(SQNPET)[0];SQGIVEPET(k);await W(1300);const a=[c.pet,inv['pet_'+k]|0,inv.pet_imp|0];SQGIVEPET(k);await W(1300);const b=[c.pet,inv['pet_'+k]|0];
  return{first,second,k,a,b}});
 t.eq(r.first,['imp',0],'the first imp follows you');t.eq(r.second,['imp',1],'the second imp waits in your bag');
 t.eq(r.a,[r.k,0,2],'a new island pet follows you (the imp you had out joins the other in your bag)');t.eq(r.b,[r.k,1],'its second copy waits in your bag')}};
