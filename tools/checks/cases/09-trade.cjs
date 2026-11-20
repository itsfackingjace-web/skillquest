// Two players trade: items and gold move exactly once each way, and both games still agree after reloading.
module.exports={name:'trading between two players moves items and gold exactly once',players:2,async run([A,B],t){
 const W=ms=>A.waitForTimeout(ms);
 const pos=await A.evaluate(()=>({x:P.x,y:P.y}));await B.evaluate(p=>{P.x=p.x+20;P.y=p.y},pos);
 await A.evaluate(()=>{inv.ibar=10;inv.berry=0;GLD=1000});await B.evaluate(()=>{inv.ibar=0;inv.berry=20;GLD=500});
 // wait until each sees the other close by
 for(let i=0;i<30;i++){const ok=await A.evaluate(()=>SQTRNEAR().includes('bob'))&&await B.evaluate(()=>SQTRNEAR().includes('ann'));if(ok)break;await W(300)}
 const click=(p,tr,k,v)=>p.evaluate(([tr,k,v])=>SQTRCLICK({dataset:{tr,k,v},disabled:false}),[tr,k,v]);
 await A.evaluate(()=>SQTRREQ('bob'));await W(1500);await B.evaluate(()=>SQTRREQ('ann'));await W(1500);
 const st=[await A.evaluate(()=>SQTRADE.st),await B.evaluate(()=>SQTRADE.st)];t.eq(st,['offer','offer'],'trade window open on both');if(st[0]!=='offer')return;
 await click(A,'add','ibar','5');await click(A,'g',undefined,'100');await click(B,'add','berry','all');await W(1500);
 await click(A,'ok1');await click(B,'ok1');await W(1500);await click(A,'ok2');await click(B,'ok2');await W(4000);
 await W(1500);const get=p=>p.evaluate(()=>({ibar:inv.ibar|0,berry:inv.berry|0,gold:GLD,st:SQTRADE.st}));
 const a=await get(A),b=await get(B);
 // the first finished trade also unlocks the Trader achievement: +100 gold each
 t.eq(a,{ibar:5,berry:20,gold:1000,st:'idle'},'Ann after the trade (900 + 100 achievement)');t.eq(b,{ibar:5,berry:0,gold:700,st:'idle'},'Bob after the trade (600 + 100 achievement)');
 const re=p=>p.evaluate(()=>{saveLocal(true);applySave(JSON.parse(localStorage.getItem(LS)));return{ibar:inv.ibar|0,berry:inv.berry|0,gold:GLD}});
 t.eq(await re(A),{ibar:5,berry:20,gold:1000},'Ann after reloading');t.eq(await re(B),{ibar:5,berry:0,gold:700},'Bob after reloading')}};
