// Nov 23 (Jace, smithing overhaul step 3): gear wears 1 point per use (a hit that lands, a shot, a hit taken, a log), only the piece you
// wear; a used piece taken off is its own bag item ('w<durability>_<key>') that keeps its number through saves, chests and trades; at
// 0 it comes off and can't be worn until it's repaired at the Blacksmith's bench (level that makes it + 5, half its main material, bars
// split into 10 shards that fuse back at a furnace). Bought gear can't be repaired; boss gear takes 10 sigil shards.
module.exports={name:'Durability: gear wears with use, used copies keep their number, worn-out gear comes off, repairs at the bench cost shards',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);try{if(pnOpen)closePanel()}catch(e){}const out={};const R=window.SQREPAIR;if(!R)return{err:'no SQREPAIR'};
  for(const i of[0,1,2,8,12,13])XPS[i]=XT[85];XPS[10]=XT[68];
  out.max=['eq_sword1','eq_helm1','eq_helm2','eq_sword7','u2_eq_sword7','eq_thelm','eq_bow6','eq_rod','eq_hoe'].map(R.maxD);
  const ws=k=>Object.keys(inv).filter(x=>/^w\d+_/.test(x)&&(inv[x]|0)>0&&(!k||x.endsWith('_'+k))).sort();
  // ---- a hit that lands wears the sword, a miss doesn't ----
  inv.eq_sword7=2;equipItem('eq_sword7');const[fx,fy]=front(13);const m={x:fx,y:fy,hp:500,kx:0,ky:0};en.push(m);swing=0;attack();const d1=R.WS.main.d;m.x=P.x+300;swing=0;attack();out.hit=[d1,R.WS.main.d,inv.eq_sword7];m.dead=1;
  // ---- a bow shot, a hit taken (each armour piece), a log ----
  inv.eq_bow5=1;inv.arrow=20;equipItem('eq_bow5');swing=0;shootAim(true);await W(50);out.shot=R.WS.off.d;
  inv.eq_helm2=1;inv.eq_body2=1;equipItem('eq_helm2');equipItem('eq_body2');hurt=0;await W(60);hurt=1;await W(60);out.taken=[R.WS.helm.d,R.WS.body.d];
  inv.eq_axe3=1;equipItem('eq_axe3');addXp(1,25);out.log=R.WS.axe.d;
  // ---- take a used sword off: it's its own item; the spare stays new; wearing it again brings its durability back ----
  R.wear('main',2799);unequipSlot('main');out.off=[ws('eq_sword7'),inv.eq_sword7|0,INAME.w1200_eq_sword7,SELLP.w1200_eq_sword7|0];
  equipItem('eq_sword7');equipItem('w1200_eq_sword7');out.on=[occ('main'),R.WS.main.d,inv.eq_sword7|0,inv.w1200_eq_sword7|0];
  // the equipment screen shows it
  EQSEL='main';pnOpen=true;ptab=3;pn.style.display='block';rPn();out.screen=/Durability 1,200 \/ 4,000 \(30%\)/.test(pbd.innerText);closePanel();EQSEL=null;
  // ---- saves keep the worn number and used copies, also in a chest ----
  const S=JSON.parse(JSON.stringify(snap()));S.zzTestChest={items:{w321_eq_sword3:1}};out.saved=[S.dur&&S.dur.main,S.inv.w1200_eq_sword7|0,Object.keys(S.inv).filter(k=>/^w\d+_/.test(k)&&!(S.inv[k]>0)).length];
  applySave(S);await W(100);out.loaded=[occ('main'),R.WS.main&&R.WS.main.d,INVK.includes('w321_eq_sword3')];
  // ---- 20% warning, then worn out: it comes off and can't be worn ----
  const said=[];const _s=say;say=q=>{said.push(q);_s(q)};R.wear('main',R.WS.main.d-801);R.wear('main',1);await W(50);out.warn=said.filter(q=>/wearing out/.test(q)).length;
  R.wear('main',9999);await W(200);out.broke=[occ('main'),ws('eq_sword7'),said.some(q=>/worn out!/.test(q))];said.length=0;equipItem('w0_eq_sword7');out.refused=[occ('main'),said.some(q=>/worn out/.test(q))];say=_s;
  // ---- repairs at the bench: Smithing 70 for an adamant sword (made at 65), half its 2 adamant bars = 10 shards from 0 ----
  inv.abar=2;inv.shd_abar=0;const i0=Math.floor(P.y/16)*N+Math.floor(P.x/16)+2;STR.set(i0,{t:'chest',hp:4,items:{}});
  const open=()=>{STATION={t:'smithbench',i:i0+1};shop='station';pnOpen=true;ptab=2;pn.style.display='block';rPn()};open();
  const row=pbd.querySelector('[data-a="smr|w0_eq_sword7"]');out.row=row?row.innerText.replace(/\s+/g,' '):null;
  out.low=[R.repair('w0_eq_sword7'),inv.w0_eq_sword7|0];XPS[10]=XT[69];let x0=XPS[10];
  out.full=[R.repair('w0_eq_sword7'),inv.w0_eq_sword7|0,inv.eq_sword7|0,inv.abar|0,inv.shd_abar|0,Math.round(XPS[10]-x0)];
  // a partial repair of the sword you wear: 30% worn = 3 shards, the rest of the bar stays as 7 shards; the next repair uses shards first
  equipItem('eq_sword7');R.wear('main',1200);x0=XPS[10];open();pbd.querySelector('[data-a="smr|@main"]').click();for(let k=0;k<60&&window.SQDO;k++){SQDO.d=.1;await W(100)}
  out.part=[R.WS.main.d,inv.abar|0,inv.shd_abar|0,Math.round(XPS[10]-x0)];R.wear('main',400);R.repair('@main');out.next=[inv.abar|0,inv.shd_abar|0];
  // bought gear can't be repaired; boss gear takes 10 sigil shards of its island
  R.addW('eq_helm1',100);out.bought=[R.repair('w100_eq_helm1'),inv.w100_eq_helm1|0];
  inv.ibs_ashfall=12;R.addW('eq_sword8',0);XPS[10]=XT[49];out.boss=[R.repair('w0_eq_sword8'),inv.ibs_ashfall|0,inv.eq_sword8|0];
  closePanel();STR.delete(i0);
  // ---- the furnace fuses shards back into bars ----
  inv.shd_abar=27;inv.abar=0;STATION={t:'furnace',i:0};shop='station';pnOpen=true;ptab=2;pn.style.display='block';rPn();out.fuseBtn=!!pbd.querySelector('[data-a="sdfa_abar"]');stationAct('sdfa_abar');out.fused=[inv.shd_abar|0,inv.abar|0];closePanel();shop=null;STATION=null;
  // ---- someone trades you a used copy: it's known right away (108's sqBookReg) ----
  sqBookReg('w2000_eq_sword6');out.trade=[INVK.includes('w2000_eq_sword6'),INAME.w2000_eq_sword6];
  // ---- falling keeps used copies, like other gear ----
  R.addW('eq_sword6',2000);inv.berry=2;dead=true;P.hp=0;reset();await W(600);out.fall=[inv.w2000_eq_sword6|0,inv.berry|0];
  return out});
 if(r.err)return t(false,r.err);
 t.eq(r.max,[250,500,1000,4000,4800,5000,6000,500,0],'durability by tier [wood, bought starter, iron, adamant, adamant +2 (+20%), turtle (boss), meteorite, rod, hoe never wears]');
 t.eq(r.hit,[3999,3999,1],'a hit that lands wears the sword by 1, a miss doesn\'t, the spare in the bag stays new');
 t.eq([r.shot,r.taken,r.log],[3999,[999,999],999],'a bow shot, a hit you take (each armour piece) and a log each wear 1');
 t.eq(r.off,[['w1200_eq_sword7'],1,'Adamant sword (30%)',0],'taking off a used sword: its own item, named with what\'s left, can\'t be sold; the spare is still new');
 t.eq(r.on,['eq_sword7',1200,1,0],'wearing the used copy again brings back its 1,200 (the new one goes back in the bag)');
 t.eq(r.screen,true,'the equipment screen shows the durability');
 t.eq(r.saved,[['eq_sword7',1200],0,0],'the save keeps the worn number and writes no empty used copies');
 t.eq(r.loaded,['eq_sword7',1200,true],'loading brings it back, and a used copy in a chest is known');
 t.eq(r.warn,1,'one warning at 20%');
 t.eq(r.broke,[null,['w0_eq_sword7'],true],'at 0 it comes off into the bag as a worn-out copy');
 t.eq(r.refused,[null,true],'a worn-out copy can\'t be worn');
 t(/10 adamant bar shards/.test(r.row||'')&&/needs Smithing 70/.test(r.row||''),'the bench lists the repair: '+r.row);
 t.eq(r.low,[false,1],'Smithing 69 is too low (adamant sword is made at 65)');
 t.eq(r.full,[true,0,2,1,0,190],'a full repair: 10 shards (1 of 2 bars), the sword is new again (2 in the bag), half its 380 craft XP');
 t.eq(r.part,[4000,0,7,57],'repairing the worn sword at 30%: 3 shards, a bar breaks into 10 and 7 stay in the bag, 57 XP');
 t.eq(r.next,[0,6],'the next repair (10%) uses a shard from the bag first');
 t.eq(r.bought,[false,1],'bought gear (leather helmet) can\'t be repaired');
 t.eq(r.boss,[true,2,1],'a worn-out Warlord\'s blade: 10 ember sigil shards at Smithing 50');
 t.eq([r.fuseBtn,r.fused],[true,[7,2]],'the furnace fuses 27 shards into 2 bars, 7 left');
 t.eq(r.trade,[true,'Mithril sword (80%)'],'a used copy from a trade is known right away');
 t.eq(r.fall,[1,0],'falling keeps used copies, berries go to the grave')}};
