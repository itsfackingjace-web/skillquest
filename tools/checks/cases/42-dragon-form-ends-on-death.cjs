// Nov 20 (Derek): falling while in Dragon Form with a screen open kept the form going after you got up (086 skipped its
// update while a screen was open, and the "you fell" check was after that).
module.exports={name:'Dragon Form ends when you fall, even with a screen open',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);
  inv.ja_dsoul=1;SQJW.neck='ja_dsoul';castUlt();await W(150);const on=SQDF.on;
  pnOpen=true;dead=true;await W(400);const after=SQDF.on;pnOpen=false;dead=false;P.hp=6;return{on,after}});
 t(r.on,'Dragon Form didn\'t start');t(!r.after,'Dragon Form was still on after falling with a screen open')}};
