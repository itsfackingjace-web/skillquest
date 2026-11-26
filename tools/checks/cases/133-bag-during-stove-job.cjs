// Nov 26 (sniffynose, in-game report: "when i go bag in house when cooking ... it shows all items in chest an not in my bag"): each step
// of a stove job lends the nearby chests to the bag, and the step redrew the open bag with them. 293 draws screens without lent items.
module.exports={name:'the bag shows only the bag while a stove job cooks from chests',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(300);try{if(pnOpen)closePanel()}catch(e){}
  XPS[4]=XT[60];for(const c of COOKS){inv[c.raw]=0;inv[c.ck]=0}inv.ruby=0;
  const i0=Math.floor(P.y/16)*N+Math.floor(P.x/16)+2;STR.set(i0,{t:'chest',hp:4,items:{meat:6,ruby:5}});
  STATION={t:'stove',i:i0+1};shop='station';pnOpen=true;ptab=2;pn.style.display='block';rPn();
  const b=pbd.querySelector('[data-a="ck_meat"]');if(!b)return{btn:false};b.click();await W(50);const job=!!window.SQDO;
  showScreen('bag');await W(50);if(window.SQDO)SQDO.d=.3;
  const seen=[];for(let k=0;k<30&&window.SQDO;k++){await W(100);seen.push(/ruby/i.test(pbd.innerText)||!!pbd.querySelector('[data-k="ruby"],[data-i="ruby"]'))}
  const rubyNow=inv.ruby|0,chest=STR.get(i0).items.ruby|0;try{closePanel()}catch(e){}STR.delete(i0);
  return{btn:true,job,steps:seen.length,rubyShown:seen.filter(Boolean).length,rubyNow,chest}});
 t(r.btn,'the stove offers to cook the chest\'s meat');t(r.job,'a cooking job started');t(r.steps>=3,'the job ran a few steps behind the bag ('+r.steps+')');
 t.eq(r.rubyShown,0,'the open bag never listed the chest\'s rubies');
 t.eq([r.rubyNow,r.chest],[0,5],'the rubies stayed in the chest [bag, chest]')}};
