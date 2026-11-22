// Nov 21 (Kevin: "fires greater than 30 minutes of duration are not showing their timer properly. Mine should be at least 34
// minutes and it just says 29:57"): a fire burns 30 minutes at most, but the campfire picker promised the time before that cap.
// The picker must never promise more than a fire actually gets.
module.exports={name:'the campfire picker shows the burn time you really get',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));XPS[5]=XT[98];PERKS[5]={10:'a',30:'a',70:'a',90:'a',99:'b'};// every "burns longer" perk, as a high-level player has
  for(const k of['wood','oaklog','willowlog','maplelog','yewlog'])inv[k]=10;inv.stone=5;fires.length=0;face=[0,1];
  try{closePanel()}catch(e){}fire();await W(250);const txt=(pbd.textContent||'');
  const row=i=>{const b=pbd.querySelector('[data-fmb="'+i+'"]');const el=b&&b.closest('.qc,div');const m=el&&(el.textContent||'').match(/burns (\d+):(\d\d)/);return m?+m[1]*60+ +m[2]:null};
  const times=[...txt.matchAll(/burns (\d+):(\d\d)/g)].map(m=>+m[1]*60+ +m[2]),yew=row(4);
  const b=pbd.querySelector('[data-fmb="4"]');if(b)b.click();await W(4500);const f=fires.filter(f=>!f._rp)[0];
  return{times,yew,life:f?Math.round(f.life):null}});
 t(r.times.length>=3,'no burn times on the campfire picker: '+JSON.stringify(r.times));
 t(r.times.every(s=>s<=1800),'the picker promises more than 30 minutes: '+JSON.stringify(r.times));
 t(r.yew!==null&&r.life!==null&&Math.abs(r.yew-r.life)<=10,'a lit yew fire got '+r.life+' s; the picker said '+r.yew)}};
