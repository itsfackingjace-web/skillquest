// Nov 26 (Kass, in-game report, Shattered Expanse: "The other ones that pop up saying I got, don't show up in the bag"): under 287's
// quarters the inner chop code (083's tier trees) still said what it paid ("+1 oak logs and +1 wood"), and 287 took those back and paid by
// quarters, so messages promised logs and wood that never came. Every "+N ..." message now adds up to what reaches the bag.
module.exports={name:'chopping: the log and wood messages add up to what reaches the bag',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);try{if(pnOpen)closePanel()}catch(e){}en=[];const o={};
  face=[0,1];const[fx,fy]=front(13),i=Math.floor(fy/16)*N+Math.floor(fx/16);TL.axe=5;XPS[1]=XT[79];
  const msgs=[];const s0=say;say=function(m){msgs.push(String(m));return s0.apply(this,arguments)};
  for(const tt of['oak','willow','yew','maple']){obj[i]={t:tt,hp:OHP[tt]||40};const b0={...inv};let k=0;while(obj[i]&&obj[i].hp>0&&k<300){swing=0;attack();k++}
   const got={};for(const key in inv){const d=(inv[key]|0)-(b0[key]|0);if(d>0&&key!=='heartwood')got[key]=d}
   let said=0,wood=0;for(const m of msgs.splice(0)){for(const x of m.matchAll(/\+(\d+) ([a-z ]*?)(logs?|wood)\b/gi)){if(/^wood$/i.test(x[3])&&!x[2].trim())wood+=+x[1];else said+=+x[1]}}
   o[tt]={said,wood,logs:got[tt+'log']|0,gotWood:got.wood|0}}
  say=s0;return o});
 for(const k in r)t.eq([r[k].said,r[k].wood],[r[k].logs,r[k].gotWood],k+': the messages say '+r[k].said+' logs and '+r[k].wood+' wood; the bag got '+r[k].logs+' and '+r[k].gotWood)}};
