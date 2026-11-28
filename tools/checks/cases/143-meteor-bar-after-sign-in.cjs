// Nov 28 (Kass, in-game report: "The meteor alert showed it was completely still full but it was gone a second later and they said
// they had finished it"): 215 subscribed to the strike's shared numbers once, when the strike began; a game that wasn't signed in
// yet at that moment (still loading, or reconnecting) never listened, so its bar stayed full. It listens as soon as it can now.
module.exports={name:'the meteor bar follows everyone\'s mining after a late sign-in',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(600);try{if(pnOpen)closePanel()}catch(e){/*quiet*/}
  const M=window.SQMETEOR,u=SQMP.user;if(!M||!u)return{err:'no meteor or not signed in'};
  SQMP.user=null;const s=M.test(-1000);await W(800);// the strike is on while this game isn't signed in
  SQMP.user=u;await W(800);
  await SQFB.db.set(SQFB.db.ref(SQFB.D,'wb/mtc'+s.id+'/d/someoneelse'),5000);await W(600);
  const out={left:M.coreLeft(),hp:M.CFG.hp};
  await SQFB.db.set(SQFB.db.ref(SQFB.D,'wb/mtc'+s.id+'/d/someoneelse'),8000);await W(600);out.left2=M.coreLeft();return out});
 if(r.err){t(false,r.err);return}
 t.eq([r.left,r.left2],[r.hp-5000,r.hp-8000],'the core\'s health counts another player\'s mining [after 5,000, after 8,000]')}};
