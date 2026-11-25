// Nov 24 evening (Jace's "all chop, no recovery" model, 287): every chop takes the Dev Suite's base chop time (1 s), less 0.05 s a Quick
// Chop perk; each quarter of a tree gives 1 log and a quarter of its XP, the fall 1 up to the extra log limit (1 + Bigger Haul perks + the
// axe's upgrade level). The perks replace all the old Woodcutting ones (old picks are given back on load); the axe wears once a tree.
module.exports={name:'woodcutting: logs and XP every quarter of a tree, Quick Chop or Bigger Haul every 10 levels',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);try{if(pnOpen)closePanel()}catch(e){}const o={},X=window.SQWC;if(!X)return{err:'no SQWC'};en=[];
  const tile=()=>{face=[0,1];const[fx,fy]=front(13);return Math.floor(fy/16)*N+Math.floor(fx/16)};
  // chops a fresh tree in front; [swing, logs, xp] for each chop
  const chop=(t,axe,lvl)=>{TL.axe=axe;XPS[1]=lvl>1?XT[lvl-1]:0;const i=tile();obj[i]={t,hp:OHP[t]};const log=t==='tree'||t==='pine'?'wood':SQTIER[t].item,rows=[];
   for(let n=0;n<60&&obj[i]&&obj[i].t===t&&obj[i].hp>0;n++){swing=0;const a=inv[log]|0,b=XPS[1];attack();rows.push([Math.round(swing*100)/100,(inv[log]|0)-a,Math.round(XPS[1]-b)])}return rows};
  PERKS[1]={};o.tree=chop('tree',1,1);const w0=inv.wood|0;o.oak=chop('oak',3,15);o.oakWood=(inv.wood|0)-w0;
  // two Quick Chops: 0.9 s; three Bigger Hauls and a +2 axe: up to 6 logs from a fall
  PERKS[1]={10:'a',20:'a',30:'b',40:'b',50:'b'};XPS[1]=XT[59];inv.u2_eq_axe7=1;equipItem('u2_eq_axe7');/* needs Woodcutting 60 */o.lim=[X.picks().s,X.picks().y,X.limit()];
  const falls=[];for(let k=0;k<40;k++){const rows=chop('yew',7,60);falls.push(rows[rows.length-1][1])}/* the last chop pays only the fall (the 75% quarter came at chop 8 of 10) */
  o.yew=chop('yew',7,60).map(r=>r[0]);o.falls=[Math.min(...falls),Math.max(...falls)];
  // the axe wears once a tree, not once a quarter (a +2 adamant axe has 400,000)
  const d0=SQREPAIR.WS.axe&&SQREPAIR.WS.axe.d;chop('yew',7,60);o.wear=d0-(SQREPAIR.WS.axe&&SQREPAIR.WS.axe.d);unequipSlot('axe');
  // a treeling rolls on every payout
  let rolls=0;const R0=SQTREELING.roll;SQTREELING.roll=function(){rolls++;return R0.apply(this,arguments)};PERKS[1]={};chop('oak',3,15);SQTREELING.roll=R0;o.rolls=rolls;
  // the Dev Suite's base chop time
  X.apply({base:.8});o.dev=chop('tree',1,1)[0][0];X.apply({});o.back=chop('tree',1,1)[0][0];
  // the perks and the tree's lines
  const C10=TREES[1].choices[10];o.choices=[C10.map(c=>c.n).join('/'),!!TREES[1].choices[90],!!TREES[1].choices[99],treeGains(1,10).some(x=>/chopping speed|extra-log/.test(x))];
  o.axe=SQUPGRADE.eff('eq_axe7',1);
  // an old save's Woodcutting perks are given back to choose again (other skills keep theirs)
  const S=snap();S.perks={1:{10:'a',20:'b'},2:{10:'a'}};delete S.wcv;applySave(S);await W(50);o.mig=[Object.keys(PERKS[1]||{}).length,JSON.stringify(PERKS[2]),snap().wcv];
  const S2=snap();S2.perks={1:{10:'b'}};applySave(S2);await W(50);o.kept=JSON.stringify(PERKS[1]);
  return o});
 if(r.err)return t(false,r.err);
 t.eq(r.tree,[[1,2,12],[1,2,13]],'a plain tree, wooden axe: 2 chops of 1 s; the first takes half (2 logs, 12 xp), the second a quarter and the fall (1 log + 1)');
 t.eq(r.oak,[[.96,1,15],[.96,1,15],[.96,1,15],[.96,1,15]],'an oak at Woodcutting 15, iron axe: 4 chops of 0.9625 s, 1 oak log and 15 xp each');t.eq(r.oakWood,0,'an oak gives no plain wood on top of its logs');
 t.eq(r.lim,[2,3,6],'2 Quick Chops, 3 Bigger Hauls, and a +2 axe: an extra log limit of 6');
 t.eq(r.yew,[.75,.75,.75,.75,.75,.75,.75,.75,.75,.75],'at Woodcutting 60 with 2 Quick Chops every chop takes 0.75 s (1 - 0.1 - 0.15; a yew, adamant axe: 10 chops)');
 t(r.falls[0]>=1&&r.falls[1]<=6&&r.falls[1]>r.falls[0],'a fall gives 1 to 6 logs ('+r.falls+')');
 t.eq(r.wear,1,'the axe wears once for the whole tree');t.eq(r.rolls,4,'a treeling rolls once for each payout (4 for an oak)');
 t.eq([r.dev,r.back],[.8,1],'the Dev Suite\'s base chop time sets the chop (0.8 s), and back to 1 s');
 t.eq(r.choices,['Quick Chop/Bigger Haul',true,false,false],'every 10 levels (to 90): Quick Chop or Bigger Haul, none at 99, no old speed/extra-log lines');
 t.eq(r.axe,'+1 extra log limit; lasts 10 times as long','a +1 axe gives +1 extra log limit');
 t.eq(r.mig,[0,'{"10":"a"}',2],'an old save\'s Woodcutting perks are cleared to choose again; Mining\'s stay');t.eq(r.kept,'{"10":"b"}','a new save keeps its Woodcutting picks')}};
