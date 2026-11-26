// Nov 26 (Saphia, in-game report: "Made new account for daughter. somehow she has the glow cap pet from heathers account despite never
// playing the game"): signing out keeps the page; a new account with no save starts newGame(), which left 085's pets, capes and dyes.
module.exports={name:'a new character starts with no pets, capes or dyes from the last one',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);try{if(pnOpen)closePanel()}catch(e){}const C=LUX.COS;
  SQGIVEPET('pglow');C.capes=[1,2];C.cape=2;C.dyes=[3];C.db=3;await W(600);const had=[C.pet,C.capes.length];
  newGame();await W(700);const s=snap();return{had,cos:s.cos,glow:s.inv.pet_pglow|0,slot:occ('pet')}});
 t.eq(r.had,['pglow',2],'the first character has the glowcap and two capes');
 t.eq([r.cos.pet,r.cos.pets,r.cos.capes,r.cos.cape,r.cos.dyes],[null,[],[],0,[]],'the new character has none of them');t.eq([r.glow,r.slot],[0,null],'and no glowcap in the bag or PET slot')}};
