// Nov 21 (FUMP: a cape showing through Kass's hair): seen from behind, 201's cape cloth was painted over long hair (kit hair styles 2
// and 3 hang to row 24, the cape starts at 21). Long hair goes over the cape now, like a hood: the hair's own pixels there keep its colour.
module.exports={name:'long hair hangs over a cape from behind',async run(p,t){
 const r=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,400));const out=[];
  for(const hs of[2,3]){const ch=Object.assign({},gearCH(),{hs,hc:2,cape:3});delete ch.wr;delete ch.hd;
   const c=document.createElement('canvas');c.width=96;c.height=112;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.setTransform(2,0,0,2,0,0);
   const sv=GC;GC=x;try{cP(ch,1,0,24,44,false);SQCAPETOP(x,ch,1,0,24,44,false)}finally{GC=sv}
   const d=x.getImageData(0,0,96,112).data,o=kitLook(ch),hr=kRamp(o.hair).map(a=>a.join(','));let n=0,ok=0;
   for(const[row,c0,s]of(KIT.hair[hs].up||[]))for(let i=0;i<s.length;i++){if(!/[123]/.test(s[i])||row<21)continue;n++;const j=((2*(19+row)+1)*96+2*(16+c0+i)+1)*4;if(hr.includes(d[j]+','+d[j+1]+','+d[j+2]))ok++}
   out.push([hs,ok,n])}
  return out});
 for(const[hs,ok,n]of r)t(n>0&&ok===n,'hair style '+hs+': '+ok+' of '+n+' hair pixels below the collar still show over the cape')}};
