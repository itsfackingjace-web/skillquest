module.exports={name:'chopping a tree gives logs and eating heals',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);
  face=[1,0];const[fx,fy]=front(16),tx=Math.floor(fx/16),ty=Math.floor(fy/16),i=ty*N+tx;obj[i]={t:'tree',hp:3};STR.delete(i);BS.delete(i);
  const w0=inv.wood|0;for(let k=0;k<12&&(inv.wood|0)===w0;k++){swing=0;attack();await W(450)}
  inv.cooked=3;P.hp=2;const h0=P.hp;eat();await W(4000);
  return{wood:(inv.wood|0)-w0,hp:[h0,P.hp],dbg:[pnOpen,menuOpen,ptab,dead,String(msg).slice(0,80),window.SQDO&&SQDO.kind,SCENE&&SCENE.id,typeof TS!=='undefined'&&TS.open,document.querySelector('#sqage')&&getComputedStyle(document.querySelector('#sqage')).display]}});
 t(r.wood>0,'no logs from chopping a tree '+JSON.stringify(r.dbg));t(r.hp[1]>r.hp[0],'eating cooked meat did not heal ('+r.hp+')')}};
