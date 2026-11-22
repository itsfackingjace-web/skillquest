// Nov 21 (Jace: "There's no amount left displayed over the player's head while smithing"): smithing from nearby chests, the "N left"
// count over your head (109, from SQDO.tot - done) dropped to 0 and vanished after the first bar, because 192's recount between steps
// only looked in the bag. It must keep counting down from what the chests hold.
module.exports={name:'make-all "N left" keeps counting when smithing from chests',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(300);
  const ri=SM.findIndex(x=>x.k==='ibar'),R=SM[ri];XPS[10]=XT[60];for(const k in R.c)inv[k]=0;inv.ibar=0;
  const i0=Math.floor(P.y/16)*N+Math.floor(P.x/16)+2,items={};for(const k in R.c)items[k]=R.c[k]*10;STR.set(i0,{t:'chest',hp:4,items});
  const st={t:'furnace',i:i0+1};STATION=st;shop='station';
  const _rnd=Math.random;Math.random=()=>.999;// no level luck (an extra bar) in the counts
  const m=stMerge(st);try{smithAct(ri,true)}finally{if(m)benchSplit()}
  const seen=[];for(let i=0;i<120;i++){await W(100);const D=window.SQDO;if(!D)break;if((D.done|0)>=1)seen.push([D.done|0,(D.tot|0)-(D.done|0)]);if((D.done|0)>=3)break}
  Math.random=_rnd;try{SQDO&&(SQDO.n=0)}catch(e){}
  return{seen:seen.filter((x,i,a)=>!i||x[0]!==a[i-1][0])}});
 t(r.seen.length>=2,'smithing from chests made fewer than 2 bars: '+JSON.stringify(r.seen));
 t(r.seen.every(([d,left])=>left===10-d),'"N left" after each bar (done, left): '+JSON.stringify(r.seen))}};
