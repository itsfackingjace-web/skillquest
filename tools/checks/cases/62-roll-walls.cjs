// Nov 20 (Kevin): "I was sprinting and dodge rolled into this location and cannot get out ... a couple frames allowed me to pass
// through the wall". A roll moves in steps of 3 px at most, so even a slow frame can't carry it past a wall's corner checks.
module.exports={name:'dodge rolls never pass into walls',async run(p,t){
 const r=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,400));const ok=(x,y)=>!(solid(x-5,y-3)||solid(x+5,y-3)||solid(x-5,y+6)||solid(x+5,y+6));
  let bad=0,tries=0;const dirs=[[1,0],[-1,0],[0,1],[0,-1],[.7,.7],[-.7,.7],[.7,-.7],[-.7,-.7]];
  // stand next to solid spots around Hollow and roll into them with big frames
  for(let ty=20;ty<N-20&&tries<300;ty+=7)for(let tx=20;tx<N-20&&tries<300;tx+=7){const x=tx*16+8,y=ty*16+8;if(!ok(x,y))continue;
   for(const d of dirs){if(!solid(x+d[0]*16,y+d[1]*16))continue;tries++;P.x=x;P.y=y;ROLLV=[d[0],d[1]];ROLLT=.28;for(let f=0;f<6;f++)upd(.1);ROLLT=0;if(!ok(P.x,P.y))bad++}}
  return{tries,bad}});
 t(r.tries>20,'found only '+r.tries+' walls to roll into');t.eq(r.bad,0,'rolls that ended inside something solid')}};
