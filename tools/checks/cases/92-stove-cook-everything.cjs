// Nov 22 (Jace: "add a cook everything button to the stove"). The stove shows "Cook everything" when two or more kinds of raw food
// can be cooked; pressing it cooks every one of them (bag and nearby chests), one at a time, and leaves food the Cooking level
// doesn't allow yet.
module.exports={name:'the stove\'s Cook everything cooks every raw food, chests too, and skips food above your level',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(300);try{if(pnOpen)closePanel()}catch(e){}
  XPS[4]=0;for(const c of COOKS){inv[c.raw]=0;inv[c.ck]=0}
  const i0=Math.floor(P.y/16)*N+Math.floor(P.x/16)+2;STR.set(i0,{t:'chest',hp:4,items:{meat:1}});const st={t:'stove',i:i0+1};
  const open=()=>{STATION=st;shop='station';pnOpen=true;ptab=2;pn.style.display='block';rPn()};
  // one kind only: no extra button (that kind's own Cook all does it)
  inv.meat=2;open();const one=!!pbd.querySelector('[data-a="ckall"]');closePanel();
  inv.shrimp=1;inv.trout=1;open();const b=pbd.querySelector('[data-a="ckall"]'),first=pbd.querySelector('.stb');
  const out={one,btn:b?b.innerText.replace(/\s+/g,' ').trim():null,first:first&&first.dataset.a};
  const x0=XPS[4];b.click();await W(50);out.job=window.SQDO?[SQDO.kind,SQDO.tot-SQDO.done,pnOpen]:null;if(window.SQDO)SQDO.d=.15;
  for(let k=0;k<80&&window.SQDO;k++)await W(100);
  const meat=(inv.cooked|0),shrimp=(inv.cshrimp|0);
  out.after=[inv.meat|0,STR.get(i0).items.meat|0,inv.shrimp|0,inv.trout|0,inv.ctrout|0,XPS[4]>x0];out.made=meat+shrimp;return out});
 t.eq(r.one,false,'no Cook everything with only one kind of raw food');
 t(/^Cook everything \(4\)/.test(r.btn||''),'the button counts 2 meat in the bag, 1 in a chest and 1 shrimp: '+r.btn);
 t.eq(r.first,'ckall','Cook everything comes before the single kinds');
 t.eq(r.job,['cook',4,false],'it starts one cooking job of 4 [kind, left, screen open]');
 t.eq(r.after,[0,0,0,1,0,true],'afterwards [raw meat in bag, in chest, shrimp, trout (needs Cooking 10), cooked trout, Cooking XP]');
 t(r.made>=1&&r.made<=4,'cooked food made: '+r.made)}};
