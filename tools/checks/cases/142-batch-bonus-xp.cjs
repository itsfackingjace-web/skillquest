// Nov 28 (Kevin, Discord #bugs: "a regular craft gives 400ish and a double gives an extra 3300"; a doubled bow showed 1100 and 5-600):
// 244 gave a bonus batch of arrows (25 at a time) the XP of 25 makes, and its own "+N XP" text showed the XP before boosts next to
// addXp's real "+N SMITH". A bonus batch now gives one make's XP and only addXp's text shows.
module.exports={name:'a bonus batch of arrows gives one make\'s XP',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);try{if(pnOpen)closePanel()}catch(e){/*quiet*/}
  XPS[10]=XT[98];const C=PROD[10],keep={dbl:C.dbl,extra:C.extra,save:C.save,fewer:C.fewer};C.dbl=()=>1;C.extra=()=>0;C.save=()=>0;C.fewer=()=>0;
  const run=async(k)=>{const i=SM.findIndex(r=>r.k===k),r=SM[i];for(const m in r.c)inv[m]=(inv[m]|0)+r.c[m]*3;const b0=inv[k]|0,x0=XPS[10],d0=drops.length;
   smithAct(i,false);for(let q=0;q<100&&window.SQDO;q++){if(SQDO)SQDO.d=.1;await W(100)}await W(200);
   return{made:(inv[k]|0)-b0,xp:Math.round(XPS[10]-x0),rx:r.xp,q:r.q||1,tx:drops.slice(d0).map(d=>d.tx).filter(s=>/XP$/.test(s||''))}};
  const out={arrow:await run('marrow'),bow:await run('eq_bow2')};Object.assign(C,keep);return out});
 t.eq([r.arrow.made,r.arrow.xp],[r.arrow.q*2,r.arrow.rx*2],'a doubled make of '+r.arrow.q+' arrows [arrows made, XP = two makes]');
 t.eq([r.bow.made,r.bow.xp],[2,r.bow.rx*2],'a doubled bow [bows made, XP = two makes]');
 t.eq(r.arrow.tx.concat(r.bow.tx),[],'no second "+N XP" text beside the skill\'s own')}};
