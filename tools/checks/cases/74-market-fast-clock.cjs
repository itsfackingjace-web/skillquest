// Nov 21 (JynxedEwok's screenshot: "The online server refused that ... The market couldn't take that offer. Try again."): an offer's
// time stamp came from the device's clock, and the rules refuse one more than 60 s ahead of the server's. On a device whose clock is
// 5 minutes fast (the database tells the game the difference, SQMP.off, as the real one does) an offer must still go up.
module.exports={name:'World Market offers go up on a device with a fast clock',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(600);
  const said=[];const _s=say;say=function(x){said.push(String(x));return _s.apply(this,arguments)};
  const _dn=Date.now;Date.now=()=>_dn()+300000;const off0=SQMP.off;SQMP.off=-300000;
  const p=Math.max(SQWMRULES.lo('ibar'),100);inv.ibar=5;
  try{await SQWMAPI.place('s','ibar',5,p);await W(1500)}finally{Date.now=_dn;SQMP.off=off0;say=_s}
  const F=SQFB,d=F.db,s=await d.get(d.ref(F.D,'market/offers')),v=s.val()||{},mine=Object.values(v).filter(o=>o&&o.u===SQMP.user.uid&&o.k==='ibar');
  return{said,offers:mine.length,left:inv.ibar|0,dt:mine[0]?Math.round((mine[0].t-_dn())/1000):null}});
 t.eq(r.offers,1,'offer in the market ('+r.said.join(' | ')+')');t.eq(r.left,0,'bars left in the bag');
 t(r.dt!==null&&Math.abs(r.dt)<60,'the offer\'s time is the server\'s ('+r.dt+' s off)');
 // Nov 21 (Jynx: "Unable to sell Spider Weaver Robes"): its key, eq_cu_spider_weaver_robe, is 24 letters and the rules took fewer than 24
 const L=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const k='eq_cu_spider_weaver_robe';INAME[k]='Spider Weaver Robe';SELLP[k]=1000;inv[k]=1;
  const said=[];const _s=say;say=function(x){said.push(String(x));return _s.apply(this,arguments)};try{await SQWMAPI.place('s',k,1,Math.max(SQWMRULES.lo(k),2000));await W(1500)}finally{say=_s}
  const F=SQFB,d=F.db,v=(await d.get(d.ref(F.D,'market/offers'))).val()||{};return{up:Object.values(v).some(o=>o&&o.k===k),said:said.join(' | ')}});
 t(L.up,'an item with a 24-letter key couldn\'t go on the market ('+L.said+')')}};
