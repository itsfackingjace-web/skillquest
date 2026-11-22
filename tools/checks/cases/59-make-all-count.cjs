// Nov 20 (Bear): "When smelting, if I get ores back, it doesn't update the '29 left' number so it keeps smelting after 0 left".
// The "N left" count is worked out again after each bar: done + what the ores allow now.
module.exports={name:'make-all "N left" counts ores given back; forged armour goes to the bag',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(300);
  const ri=SM.findIndex(x=>x.k==='ibar'),R=SM[ri];XPS[10]=XT[60];for(const k in R.c)inv[k]=R.c[k]*2;inv.ibar=0;
  const i0=Math.floor(P.y/16)*N+Math.floor(P.x/16)+2;const st={t:'furnace',i:i0+1};STATION=st;shop='station';
  /* Nov 21: Smithing 60 has level chances to save ore or make an extra bar (039's pSecond/pThird): no luck here, or 4 bars now and then */const _rnd=Math.random;Math.random=()=>.999;
  smithAct(ri,true);const seen=[];let gave=false;
  for(let i=0;i<200;i++){await W(100);const D=window.SQDO;if(!D)break;if(D.tot)seen.push(D.tot);
   if(!gave&&(D.done|0)>=1){gave=true;for(const k in R.c)inv[k]+=R.c[k]}}// ores given back once
  Math.random=_rnd;return{made:inv.ibar|0,tot:Math.max(...seen)}});
 const h=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));
  // Nov 20 (Kass): "If I forge an iron helmet, it automatically makes me wear it"
  const ri=SM.findIndex(x=>x.n==='Iron helmet');XPS[8]=XT[60];ARM.helm=0;inv.ibar=2;inv.eq_helm2=0;const i0=Math.floor(P.y/16)*N+Math.floor(P.x/16)+2;STATION={t:'anvil',i:i0};shop='station';
  smithAct(ri,false);for(let i=0;i<80&&window.SQDO;i++)await W(100);return[ARM.helm,inv.eq_helm2|0]});
 t.eq(h,[0,1],'the forged iron helmet is in the bag, not worn');
 t.eq(r.made,3,'bars made');t.eq(r.tot,3,'the count of bars to make (so "N left" never shows 0 while smelting goes on)')}};
