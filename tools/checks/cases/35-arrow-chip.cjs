// Nov 20 report: "iron and adamant arrows hit the same". The bow always shoots your best arrows first, so with adamant ones in the
// bag both tests shot adamant. The HUD's arrow chip now shows the kind it shoots next and how many of those you have.
module.exports={name:'arrow chip shows the arrows your bow shoots next',async run(p,t){
 const r=await p.evaluate(()=>{TL.bow=2;inv.arrow=0;inv.iarrow=5;inv.adarrow=3;inv.mitharrow=0;inv.marrow=0;const a=hudLayout().chips.find(c=>/arrow/.test(c[0]));
  inv.adarrow=0;const b=hudLayout().chips.find(c=>/arrow/.test(c[0]));return{a,b,pe:typeof PST!=='undefined'&&PST instanceof Map}});
 t.eq(r.a,['adarrow','3'],'with adamant arrows');t.eq(r.b,['iarrow','5'],'with only iron arrows');t(r.pe,'the pets\' positions (PST) are not shared')}};
