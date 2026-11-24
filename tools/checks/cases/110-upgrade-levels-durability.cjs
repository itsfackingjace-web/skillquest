// Nov 24 (Jace): "The game doesn't tell you the level requirements of upgrades. Furthermore, each upgrade should grant 10x durability,
// until you get to +3 at which point the item should simply be indestructible" (274, 275). Saves from before keep the share of
// durability their used +1/+2 copies had, and used +3s become plain +3s.
module.exports={name:'upgrades say what level they need, last 10x longer a level, and a +3 never wears out',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);try{if(pnOpen)closePanel()}catch(e){}const o={},R=window.SQREPAIR,U=window.SQUPGRADE;if(!R||!U)return{err:'no SQREPAIR/SQUPGRADE'};
  o.max=['eq_sword7','u1_eq_sword7','u2_eq_sword7','u3_eq_sword7','u2_eq_bow6'].map(R.maxD);
  // descriptions
  const d=k=>String(IDESC[k]||'');o.desc=[/\(Smithing 75\).*\(85\).*\(95\)/.test(d('eq_sword7')),/Next: 10 of these make an adamant sword \+2 at Smithing 85/.test(d('u1_eq_sword7')),/lasts 10 times as long/.test(d('u1_eq_sword7')),
   /never wears out/.test(d('u3_eq_sword7')),/ember cores.*\(Smithing 70\)/.test(d('eq_sword8')),/\(Smithing 77\)/.test(d('eq_axe7')),(d('eq_sword7').match(/Upgrades at/g)||[]).length];
  // the bench lists the level, met or not
  inv.eq_sword7=12;XPS[10]=XT[59];const strip=h=>h.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');o.low=/needs Smithing 75 \(you're 60\)/.test(strip(U.html()));
  XPS[10]=XT[79];o.met=/10 adamant swords · Smithing 75 · 680 xp/.test(strip(U.html()));inv.eq_sword7=0;
  // the equipment screen: what a plain piece's upgrades need
  XPS[0]=XT[60];inv.eq_sword7=1;equipItem('eq_sword7');EQSEL='main';o.card=/Upgrades at a Blacksmith's bench: 10 of these make a \+1 \(Smithing 75\)/.test(strip(equipHTML()));
  // wear: a +1 loses 1 a hit from 40,000; a +3 has nothing to lose
  const hit=()=>{en=[{x:P.x,y:P.y+14,hp:999,mhp:999,t:'slime',dead:false,vx:0,vy:0,kb:0}];face=[0,1];swing=0;attack()};
  inv.u1_eq_sword7=1;equipItem('u1_eq_sword7');R.wear('main');/* one landed hit (check 99 covers HIT -> wear; here a villager or tree in front can take the swing) */o.w1=R.WS.main?R.WS.main.d:null;
  inv.u3_eq_sword7=1;equipItem('u3_eq_sword7');hit();R.wear('main');R.wear('main');o.w3=[R.WS.main||null,U.UPS.main&&U.UPS.main.l,occ('main')];
  // a used +3 that turns up in the bag becomes a plain +3
  const n3=inv.u3_eq_sword7|0;R.wreg('w4400_u3_eq_sword7');inv.w4400_u3_eq_sword7=1;await W(2600);o.plain=[inv.w4400_u3_eq_sword7|0,(inv.u3_eq_sword7|0)-n3];
  unequipSlot('main');en=[];
  // an old save: used upgraded copies keep their share, the worn +1 too, a worn +3 just stops wearing; a new save isn't scaled again
  const S=snap();S.inv=Object.assign({},S.inv,{w1100_u1_eq_sword7:2,w600_u2_eq_helm5:1,w300_u3_eq_body5:1,u3_eq_body5:1,w500_eq_sword7:1});
  S.dur={main:['u1_eq_sword7',550],helm:['u3_eq_helm5',20]};delete S.durv;applySave(S);await W(50);
  o.mig=[inv.w10000_u1_eq_sword7|0,inv.w50000_u2_eq_helm5|0,inv.u3_eq_body5|0,inv.w500_eq_sword7|0,inv.w1100_u1_eq_sword7|0,JSON.stringify(R.PWS)];
  const S2=snap();o.v=S2.durv;applySave(S2);await W(50);o.again=[inv.w10000_u1_eq_sword7|0,inv.w50000_u2_eq_helm5|0];
  // a 7-digit used copy (a +2 meteorite bow) survives a save and a load
  R.addW('u2_eq_bow6',1199999);const S3=snap();for(const k in inv)if(/^w\d/.test(k))inv[k]=0;applySave(S3);await W(50);o.big=inv.w1199999_u2_eq_bow6|0;
  // the wiki's gear card has the levels too
  SQWK.open('start');SQWK.go('item','eq_sword7');await W(50);const wk=document.getElementById('wkb').textContent;SQWK.close();
  o.wiki=[/\+1 \(Smithing 75\) hits 5% harder; lasts 10 times as long/.test(wk),/\+3 \(Smithing 95\) hits 15% harder; never wears out/.test(wk),(wk.match(/Upgrades at a Blacksmith/g)||[]).length];
  return o});
 if(r.err)return t(false,r.err);
 t.eq(r.max,[4000,40000,400000,0,1200000],'durability: adamant sword 4,000, +1 x10, +2 x100, +3 never wears (0), a +2 meteorite bow 1,200,000');
 t.eq(r.desc,[true,true,true,true,true,true,1],'descriptions: the plain sword lists +1/+2/+3 levels, a +1 says what the +2 needs and that it lasts 10x, a +3 never wears out, boss gear names its cores, the axe keeps its line, once');
 t(r.low,'the bench row says "needs Smithing 75 (you\'re 60)"');t(r.met,'and once you have the level it still says Smithing 75 next to the XP');
 t(r.card,'the equipment screen says what the worn sword\'s upgrades need');
 t.eq(r.w1,39999,'a hit takes 1 off a +1 sword\'s 40,000');t.eq(r.w3,[null,3,'eq_sword7'],'a +3 sword has no durability to lose');
 t.eq(r.plain,[0,1],'a used +3 in the bag becomes a plain +3');
 t.eq(r.mig,[2,1,2,1,0,'{"main":["u1_eq_sword7",5000]}'],'an old save: used +1 1,100 -> 10,000 (both 25%), used +2 600 -> 50,000, a used +3 joins the +3s, plain used gear unchanged, the worn +1 550 -> 5,000 and the worn +3 dropped');
 t.eq([r.v,...r.again],[2,2,1],'new saves are marked, so they aren\'t scaled again');
 t.eq(r.big,1,'a used +2 meteorite bow with 1,199,999 left survives a save and load');
 t.eq(r.wiki,[true,true,0],'the wiki gear card lists each upgrade\'s level and durability (and the description doesn\'t repeat it)')}};
