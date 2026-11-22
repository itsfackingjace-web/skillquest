// Nov 22 (#bugs, Kass and Jynx: Kass thought she bought spider hoods, a robe and a pet, and nothing arrived): her 8 offer slots were full,
// and the World Market said so only in the message box, which the market screen covers on a phone. The reason shows on the screen now.
module.exports={name:'the World Market screen says why an offer was refused',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(600);GLD=1e6;
  for(const k of['ibar','sbar','wood','stone','iron','oaklog','berry','bone']){inv[k]=5;await SQWMAPI.place('s',k,1,Math.max(SQWMRULES.lo(k),500));await W(250)}
  SQWMOPEN();await W(400);SQWMK.form={k:'ibar',s:'b',q:1,p:500};rPn();await W(200);
  for(let i=0;i<2;i++){const b=pbd.querySelector('[data-w="go"]');if(b)b.click();await W(500)}
  const w=document.getElementById('wmwarn');const txt=w?w.textContent:'(no form)';
  // any other tap clears it
  const plus=pbd.querySelector('[data-w="q:1"]');if(plus)plus.click();await W(200);const w2=document.getElementById('wmwarn');
  return{txt,after:w2?w2.textContent:'',gold:GLD}});
 t(/already have 8 offers/.test(r.txt),'the market screen didn\'t say why: "'+r.txt+'"');
 t(!/already have/.test(r.after),'the reason stayed after changing the amount: "'+r.after+'"');
 t.eq(r.gold,1e6,'gold after the refused buy')}};
