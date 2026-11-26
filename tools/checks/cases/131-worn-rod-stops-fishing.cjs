// Nov 26 (Kevin, in-game report: "When fishing rod breaks, I've been able to keep fishing anyways"): 275 took the worn-out rod off,
// but the cast line (007's FISH) kept catching fish. Fishing ends when no rod is in hand.
module.exports={name:'a rod that wears out ends the fishing',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));en.length=0;
  const px=Math.floor(P.x/16),py=Math.floor(P.y/16);let spot=null;// land with water just below it
  for(let d=1;d<80&&!spot;d++)for(let y=py-d;y<=py+d&&!spot;y++)for(let x=px-d;x<=px+d;x++){if(!fishWaterAt(x,y+1)||fishWaterAt(x,y)||solid(x*16+8,y*16+8))continue;spot=[x,y];break}
  if(!spot)return{spot:null};P.x=spot[0]*16+8;P.y=spot[1]*16+8;face=[0,1];TL.rod=1;await W(400);
  const R=SQREPAIR;R.sync();const w=R.WS.rod;if(!w)return{spot,worn:null};
  swing=0;attack();await W(200);const cast=!!FISH;
  w.d=1;R.wear('rod',1);await W(600);// the last point goes (as a catch would)
  const after={fish:!!FISH,rod:TL.rod|0,said:String(msg||'')};await W(800);
  return{spot,worn:true,cast,after,still:!!FISH}});
 t(r.spot,'a fishing spot near the start');t(r.worn,'the rod has durability');t(r.cast,'the line was cast');
 t(r.after&&r.after.rod===0,'the worn-out rod came off');
 t(r.after&&!r.after.fish&&!r.still,'fishing ended with the rod ('+JSON.stringify(r.after)+')');
 t(r.after&&/worn out/i.test(r.after.said),'the message says the rod is worn out: '+(r.after&&r.after.said))}};
