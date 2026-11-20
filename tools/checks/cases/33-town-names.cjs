// Nov 20 (#ideas): the town you're in shows on the minimap, and a sign slides down when you walk into one.
module.exports={name:'town names on the minimap and a sign when you walk in',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const o={};
  P.x=(VX+20)*16;P.y=(VY+20)*16;await W(600);o.out=SQTOWNNAME.now;P.x=VX*16+8;P.y=(VY+2)*16+8;await W(600);o.vil=SQTOWNNAME.now;
  o.errs=SQERR.list().filter(x=>/^245/.test(x));return o});
 t.eq(r.out,null,'a town outside the village');t.eq(r.vil,'Hollow Village','no town name in Hollow Village');t.eq(r.errs,[],'caught errors')}};
