// Nov 26 (Spencer, in-game report: "i cant purchase all available seeds in the general store ... it shows it as purchase but it doesnt add
// into my bag"): 107's daily stock counts single items (20 seeds) but pumpkin seeds come 3 to a pack, so after six packs the 2 left could
// never be bought: the seventh pack was undone (gold back, no seeds). Now the last pack sells what's left for that share of the price.
module.exports={name:'shop stock: the last partial pack sells what is left (pumpkin seeds)',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);try{if(pnOpen)closePanel()}catch(e){}
  XPS[11]=XT[44];GLD=10000;inv.pumpkinseed=0;shop='gen';pnOpen=true;ptab=2;pn.style.display='block';rPn();await W(150);
  const buy=async()=>{const b=[...document.querySelectorAll('#pn [data-a]')].find(b=>/^b/.test(b.dataset.a)&&/pumpkin seeds/i.test(b.innerText));if(!b)return null;const g=GLD,n=inv.pumpkinseed|0;b.click();await W(120);return[(inv.pumpkinseed|0)-n,g-GLD]};
  const got=[],paid=[];for(let i=0;i<8;i++){const x=await buy();got.push(x&&x[0]);paid.push(x&&x[1])}const out={seeds:inv.pumpkinseed|0,got,paid,left:SQSTOCK.left('pumpkinseed')};closePanel();return out});
 t.eq(r.got,[3,3,3,3,3,3,2,0],'six packs of 3, then the last 2, then sold out');
 t.eq([r.seeds,r.left],[20,0],'all 20 of the day\'s seeds can be bought');
 t.eq(r.paid.slice(6),[17,0],'the last 2 cost 17 gold (2/3 of a pack), and nothing after')}};
