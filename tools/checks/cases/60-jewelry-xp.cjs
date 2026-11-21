// Nov 21 (Kevin: "The xp boost from my gold amulet is not showing up in stats and I don't think I'm getting the boost either"): 086's
// bonus was a `before` step since the Nov 19 step lists, and a before step can't change the XP passed on, so it did nothing.
module.exports={name:'the gold amulet and emerald ring raise XP',async run(p,t){
 const r=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,300));const J=SQJW;J.neck=null;J.ring=null;
  const gain=i=>{const a=XPS[i];addXp(i,100);return Math.round(XPS[i]-a)};const plain=gain(6);J.neck='ja_gold';const gold=gain(6);
  J.ring='jr_emerald';const wc=gain(1);J.neck=null;J.ring=null;return{plain,gold,wc}});
 t.eq(r.plain,100,'no jewelry: 100 XP');t.eq(r.gold,105,'gold amulet: +5%');t.eq(r.wc,115,'gold amulet and emerald ring while woodcutting: +15%')}};
