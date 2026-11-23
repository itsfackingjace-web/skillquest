// Nov 23 (Jace, smithing overhaul step 1): the Blacksmith's bench smiths cores (100 sigil shards of one island -> 1 core, 1,000
// Smithing XP), using the house's chests too; arrows and bows moved to the anvil (Smithing), the ranger set to Crafting, and iron
// axes and pickaxes left the Craft menu (anvil only).
module.exports={name:'Blacksmith\'s bench smiths cores; arrows and bows are smithed; iron axes only from the anvil',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);try{if(pnOpen)closePanel()}catch(e){}const out={};
  const B=window.SQSMITHBENCH;if(!B)return{err:'no SQSMITHBENCH'};
  out.rec=(BREC.find(r=>r.k==='smithbench')||{});out.icons=B.CORES.map(c=>/^data:image/.test(iconURL(c.k))).concat(/^data:image/.test(iconURL('smithbench')));
  // the bench, with a chest beside it holding most of the shards
  XPS[10]=XT[44];const i0=Math.floor(P.y/16)*N+Math.floor(P.x/16)+2;STR.set(i0,{t:'chest',hp:4,items:{ibs_briarwood:150}});const st={t:'smithbench',i:i0+1};
  for(const c of B.CORES)inv['ibs_'+c.isl]=0;inv.ibs_briarwood=60;inv.ibs_ashfall=100;inv.core_briar=0;inv.core_ember=0;
  const open=()=>{STATION=st;shop='station';pnOpen=true;ptab=2;pn.style.display='block';rPn()};open();
  const txt=pbd.innerText.replace(/\s+/g,' ');out.screen=[/Blacksmith's bench/.test(txt),/Using your bag and 1 chest/.test(txt),B.CORES.every(c=>txt.includes('Smith '+(/^[aeiou]/i.test(c.n)?'an ':'a ')+c.n.toLowerCase())),/210 \/ 100 briar sigil shards/.test(txt),/needs Smithing 50/.test(txt)];
  out.allBtn=!!pbd.querySelector('[data-a="smca_core_briar"]');
  // Ember needs Smithing 50: refused
  let said='';const _s=say;say=m=>{said=m;_s(m)};pbd.querySelector('[data-a="smc_core_ember"]').click();await W(50);out.lowLevel=[said,inv.core_ember|0,inv.ibs_ashfall|0];say=_s;
  // ALL briar cores: 210 shards in bag + chest = 2 cores, 1,000 XP each
  open();const x0=XPS[10];pbd.querySelector('[data-a="smca_core_briar"]').click();await W(50);out.job=window.SQDO?[SQDO.kind,SQDO.tot]:null;
  for(let k=0;k<100&&window.SQDO;k++){if(SQDO)SQDO.d=.1;await W(100)}
  out.after=[inv.core_briar|0,(inv.ibs_briarwood|0)+(STR.get(i0).items.ibs_briarwood|0),Math.round(XPS[10]-x0)];STR.delete(i0);
  // tree and wiki
  out.tree=treeGains(10,40).join(' · ');out.wiki=window.SQWK&&SQWK.h&&SQWK.h.recipes?SQWK.h.recipes().filter(q=>/^core_/.test(q.out)).map(q=>q.at+':'+q.lv):null;out.wikiArrow=SQWK.h.recipes().filter(q=>q.out==='arrow').map(q=>q.at+':'+q.sk);
  // ---- recipe moves ----
  out.frec=FREC.map(r=>r.k);const ri=SM.findIndex(r=>r.k==='arrow');out.smArrow=ri>=0?[SM[ri].q,SM[ri].lv,SM[ri].xp]:null;
  out.smKeys=['eq_bow1','eq_bow2','iarrow','mitharrow','adarrow','marrow'].map(k=>SM.some(r=>r.k===k));
  out.goods=['eq_rhelm','eq_rlegs','eq_rbody'].map(k=>{const g=GOODS.find(q=>q.k===k);return g?g.req:0});
  inv.wood=5;inv.stone=5;inv.arrow=0;const xa=XPS[12],xs=XPS[10];smithAct(ri,false);for(let k=0;k<60&&window.SQDO;k++){if(SQDO)SQDO.d=.1;await W(100)}
  out.forged=[inv.arrow|0,XPS[10]>xs,XPS[12]===xa];out.forgedOK=(inv.arrow|0)%10===0;
  // the Craft tab: no iron axe or pickaxe, the iron sword is still there
  TL.axe=2;TL.pick=2;TL.sword=2;closePanel();shop=null;STATION=null;pnOpen=true;ptab=1;pn.style.display='block';rPn();const ct=pbd.innerText;
  out.craft=[/Iron axe/.test(ct),/Iron pickaxe/.test(ct),/Iron sword/.test(ct),/made at an anvil \(Smithing\)/.test(ct)];closePanel();
  out.archTree=(typeof FL!=='undefined'?[15,20].map(l=>treeGains(FL,l).join(' ')):[]).join(' | ');
  return out});
 if(r.err)return t(false,r.err);
 t.eq([r.rec.req,r.rec.c],[12,{ibar:3,stone:4,wood:10}],'the bench is built at Crafting 12 from 3 iron bars, 4 stone, 10 wood');
 t.eq(r.icons,[true,true,true,true,true,true],'every core and the bench have an icon');
 t.eq(r.screen,[true,true,true,true,true],'the bench screen [title, counts the chest, all five cores, shards in bag + chest, level shown]');
 t.eq(r.allBtn,true,'ALL shows when you can make more than one core');
 t.eq(r.lowLevel.slice(1),[0,100],'a core above your level isn\'t made: '+r.lowLevel[0]);
 t.eq(r.job,['smith',2],'ALL starts one smithing job for 2 cores');
 t.eq(r.after,[2,10,2000],'afterwards [2 briar cores, 10 shards left (bag + chest), 2,000 Smithing XP]');
 t(/briar cores/.test(r.tree),'the Smithing tree lists briar cores at 40: '+r.tree);
 t.eq(r.wiki,['Blacksmith\'s bench:40','Blacksmith\'s bench:50','Blacksmith\'s bench:60','Blacksmith\'s bench:60','Blacksmith\'s bench:70'],'the wiki lists the core recipes');
 t.eq(r.frec,[],'nothing is left in fletching');t.eq(r.wikiArrow,['Anvil:Smithing'],'the wiki says arrows are made at the anvil with Smithing');
 t.eq([r.smArrow,r.smKeys],[[10,1,12],[true,true,true,true,true,true]],'arrows and bows are anvil recipes [10 arrows at level 1 for 12 xp; both bows and every arrow]');
 t.eq(r.goods,[10,12,15],'the ranger set is crafted at Crafting 10, 12, 15');
 t.eq([r.forged[0]>=10,r.forgedOK,r.forged[1],r.forged[2]],[true,true,true,true],'forging arrows gives a batch of 10 (a bonus is another whole batch) and Smithing XP, not Archery XP: '+r.forged[0]);
 t.eq(r.craft,[false,false,true,true],'the Craft tab [no iron axe, no iron pickaxe, iron sword still there, says where bows went]');
 t(!/Make/.test(r.archTree),'the Archery tree no longer says "Make" at 15 and 20: '+r.archTree)}};
