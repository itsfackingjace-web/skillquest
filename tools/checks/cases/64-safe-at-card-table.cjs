// Nov 21 (Jace: "perhaps the player is somehow mistakenly taking starving damage"): 6 of the first 25 deaths in the death log were
// "Starving!" (one mid-match) and Stormie fell to a slime while at Ace's table: the table covers the screen but the game ran on behind it.
// While the Drop Card table is open your HP can't go down and your hunger stays put.
module.exports={name:'safe and fed at the Drop Card table',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(300);SQBINDER.giveStarter();
  P.hp=6;hunger=40;SQDCM.start('easy');await W(200);
  for(let i=0;i<60;i++){upd(.05);P.hp--}// hits while you play
  hunger=0;for(let i=0;i<200;i++)upd(.05);// and a long match
  const at=[P.hp,Math.round(hunger)];SQDCM.close();await W(200);upd(.05);P.hp--;return{at,after:P.hp}});
 t.eq(r.at,[6,40],'HP and hunger while at the table');t.eq(r.after,5,'damage counts again after leaving the table')}};
