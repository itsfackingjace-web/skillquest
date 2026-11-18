// World Market: Ann sells, Bob buys at the same price. Items and gold arrive once, the seller pays the 1% tax, nothing is left over.
module.exports={name:'World Market sale and purchase settle exactly once',players:2,async run([A,B],t){
 const W=ms=>A.waitForTimeout(ms);
 const fn=await A.evaluate(()=>window.SQWMAPI?[typeof SQWMAPI.place,typeof SQWMAPI.collect]:[]);t.eq(fn,['function','function'],'market functions reachable');if(fn[0]!=='function')return;
 const p=await A.evaluate(()=>Math.max(SQWMRULES.lo('ibar'),100));
 await A.evaluate(()=>{inv.ibar=10;GLD=0});await B.evaluate(p=>{inv.ibar=0;GLD=10*p},p);await W(1500);
 await A.evaluate(p=>SQWMAPI.place('s','ibar',10,p),p);await W(2500);
 await B.evaluate(p=>SQWMAPI.place('b','ibar',10,p),p);await W(4000);
 await A.evaluate(()=>SQWMAPI.collect());await W(2500);
 const tax=Math.floor(10*p*0.01);
 const a=await A.evaluate(()=>({ibar:inv.ibar|0,gold:GLD})),b=await B.evaluate(()=>({ibar:inv.ibar|0,gold:GLD}));
 t.eq(a,{ibar:0,gold:10*p-tax},'seller after collecting (price '+p+', tax '+tax+')');t.eq(b,{ibar:10,gold:0},'buyer');
 // collecting again gives nothing more
 await A.evaluate(()=>SQWMAPI.collect());await W(1500);t.eq(await A.evaluate(()=>GLD),10*p-tax,'seller gold after a second collect');
 const box=await A.evaluate(async()=>{const F=SQFB;return(await F.db.get(F.db.ref(F.D,'market/box'))).val()});t(!box||!Object.keys(box.ann||{}).length,'deliveries left in the box: '+JSON.stringify(box))}};
