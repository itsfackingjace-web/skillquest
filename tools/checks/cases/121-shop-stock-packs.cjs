// Nov 26 (Spencer, in-game report: "i cant purchase all available seeds in the general store ... it shows it as purchase but it doesnt add
// into my bag"): 107's daily stock counts single items (20 seeds) but pumpkin seeds come 3 to a pack, so after six packs the 2 left could
// never be bought: the seventh pack was undone (gold back, no seeds). Now the last pack sells what's left for that share of the price.
module.exports={name:'shop stock: the last partial pack sells what is left (pumpkin seeds)',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);try{if(pnOpen)closePanel()}catch(e){}
  /* the stock is per game day: start early in a fresh day so it can't roll over mid-check (Nov 26: 23 seeds, a new day's stock) */time=(Math.floor(time/DAYLEN)+1)*DAYLEN+DAYLEN*.2;
  XPS[11]=XT[44];GLD=10000;inv.pumpkinseed=0;shop='gen';pnOpen=true;ptab=2;pn.style.display='block';rPn();await W(150);
  const buy=async()=>{const b=[...document.querySelectorAll('#pn [data-a]')].find(b=>/^b/.test(b.dataset.a)&&/pumpkin seeds/i.test(b.innerText));if(!b)return null;const g=GLD,n=inv.pumpkinseed|0,said=[],_s=say;say=function(m){said.push(String(m));return _s.apply(this,arguments)};try{b.click();await W(120)}finally{say=_s}
   /* the price from the message: a gold reward (an achievement) can land in the same moment (Nov 26 full run: -233) */const m=said.map(x=>/for (\d+) gold/.exec(x)).find(Boolean);const k=(inv.pumpkinseed|0)-n;return[k,m?+m[1]:k?g-GLD:0]};
  const got=[],paid=[];for(let i=0;i<8;i++){const x=await buy();got.push(x&&x[0]);paid.push(x&&x[1])}const out={seeds:inv.pumpkinseed|0,got,paid,left:SQSTOCK.left('pumpkinseed')};closePanel();return out});
 t.eq(r.got,[3,3,3,3,3,3,2,0],'six packs of 3, then the last 2, then sold out '+JSON.stringify(r));
 t.eq([r.seeds,r.left],[20,0],'all 20 of the day\'s seeds can be bought');
 t.eq(r.paid.slice(6),[17,0],'the last 2 cost 17 gold (2/3 of a pack), and nothing after')}};
