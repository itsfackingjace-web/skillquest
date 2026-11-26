// Nov 26 (Kevin, in-game report: "Put on fresh spider armor and took a hit of hunger damage, durability went down by 5 on everything"):
// 275 wore every armour piece (5) whenever 001's hurt timer jumped, and starving sets it too. Starving hits are marked and don't wear armour.
module.exports={name:'starving does not wear armour; a monster hit still does',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);try{if(pnOpen)closePanel()}catch(e){}en=[];const R=window.SQREPAIR;
  ARM.helm=2;ARM.body=2;ARM.legs=2;await W(400);R.sync&&R.sync();const d=()=>['helm','body','legs'].map(s=>R.WS[s]&&R.WS[s].d);const d0=d();
  // starve until a hit lands
  P.hp=6;hunger=0;let n=0;for(let i=0;i<60*30&&P.hp>=6;i++){upd(1/60);n++}hunger=100;for(let i=0;i<30;i++)upd(1/60);const d1=d(),hp1=P.hp;
  // a monster hit
  hurt=0;for(let i=0;i<5;i++)upd(1/60);hurt=1;P.hp--;for(let i=0;i<5;i++)upd(1/60);const d2=d();
  return{d0,d1,d2,hp1}});
 t(r.hp1<6,'starving took health');t.eq(r.d1,r.d0,'and left the armour as it was');t(r.d2.every((v,i)=>v===r.d1[i]-5),'a monster hit still wears each piece by 5 ('+r.d1+' → '+r.d2+')')}};
