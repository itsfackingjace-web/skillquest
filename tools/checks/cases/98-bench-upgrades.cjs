// Nov 23 (Jace, smithing overhaul step 2): upgrades at the Blacksmith's bench. 10 of an item make a +1 (10 of the +1 a +2, ...), the
// worn piece counts, boss gear takes its island's cores; upgraded copies are bag items that wear as their base; each level adds a little.
module.exports={name:'Blacksmith\'s bench upgrades: 10 copies (worn one counts) or cores make a +1, worn levels survive equip/unequip/saves, swaps don\'t make copies, falls keep them',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);try{if(pnOpen)closePanel()}catch(e){}const out={};const U=window.SQUPGRADE;if(!U)return{err:'no SQUPGRADE'};
  const UP=U.UP();out.which=[['eq_sword7','eq_rhelm','eq_sword8','eq_axe7','mdag','eq_bow2'].map(k=>!!UP[k]),['eq_sword1','eq_helm1','eq_bow1','eq_sword5','eq_bow3','eq_wfire','eq_mhelm'].map(k=>!!UP[k])];
  out.reqs=[UP.eq_sword7.sk,U.need('eq_sword7',1),U.need('eq_sword7',3),UP.eq_rhelm.sk,U.need('eq_rhelm',1),UP.eq_sword8.core,U.need('eq_sword8',1)];
  out.item=[!!EQ.u1_eq_sword7,Object.keys(EQ).includes('u1_eq_sword7'),INAME.u1_eq_sword7,SELLP.u1_eq_sword7===SELLP.eq_sword7*10,INVK.includes('u2_eq_sword7')];
  // ---- the bench: 12 adamant swords -> 1 adamant sword +1 ----
  XPS[10]=XT[74];XPS[0]=XT[50];XPS[8]=XT[1];inv.eq_sword7=12;for(const L of[1,2,3])inv['u'+L+'_eq_sword7']=0;const i0=Math.floor(P.y/16)*N+Math.floor(P.x/16)+2;STR.set(i0,{t:'chest',hp:4,items:{}});
  const st={t:'smithbench',i:i0+1};const open=()=>{STATION=st;shop='station';pnOpen=true;ptab=2;pn.style.display='block';rPn()};open();
  const btn=pbd.querySelector('[data-a="smu|eq_sword7|1"]');out.row=btn?btn.innerText.replace(/\s+/g,' '):null;
  let x0=XPS[10];btn.click();for(let k=0;k<60&&window.SQDO;k++){SQDO.d=.1;await W(100)}
  out.made=[inv.eq_sword7|0,inv.u1_eq_sword7|0,Math.round(XPS[10]-x0)];
  // ---- the worn sword counts: wear 1, 9 in the bag -> the +1 is on you ----
  inv.eq_sword7=10;inv.u1_eq_sword7=0;equipItem('eq_sword7');out.worn0=[occ('main'),inv.eq_sword7];
  x0=XPS[10];U.upgrade('eq_sword7',1);out.wornUp=[occ('main'),U.UPS.main?U.UPS.main.l:0,inv.eq_sword7|0,inv.u1_eq_sword7|0,Math.round(XPS[10]-x0)];
  // the equipment screen names it
  EQSEL=null;pnOpen=true;ptab=3;pn.style.display='block';rPn();out.slotName=/Adamant sword \+1/.test(pbd.innerText);closePanel();
  unequipSlot('main');out.unequip=[occ('main'),inv.u1_eq_sword7|0,inv.eq_sword7|0,!U.UPS.main];
  equipItem('u1_eq_sword7');out.reequip=[occ('main'),U.UPS.main&&U.UPS.main.l,inv.u1_eq_sword7|0];
  inv.eq_sword7=1;equipItem('eq_sword7');out.swap=[occ('main'),!U.UPS.main,inv.u1_eq_sword7|0,inv.eq_sword7|0];
  // Equip list shows upgraded copies
  EQSEL='main';pnOpen=true;ptab=3;pn.style.display='block';rPn();out.eqList=!!pbd.querySelector('[data-k="u1_eq_sword7"]');EQSEL=null;closePanel();
  // ---- what a level does: +3 sword hits about 15% harder, iron armour +1 blocks 3% more ----
  inv.u3_eq_sword7=1;equipItem('u3_eq_sword7');const keep=U.UPS.main;delete U.UPS.main;const v0=meleeFlat();U.UPS.main=keep;const base=1+(TL.sword|0)+Math.floor(lvOf(0)/15)+v0;let s=0;for(let i=0;i<4000;i++)s+=meleeFlat()-v0;out.melee=+(s/4000/base).toFixed(3);
  XPS[8]=XT[9];for(const sl of['helm','body','legs']){inv['eq_'+sl+'2']=1;equipItem('eq_'+sl+'2')}const b0=blockCh(),c0=blockCap();
  for(const sl of['helm','body','legs']){inv['u1_eq_'+sl+'2']=1;equipItem('u1_eq_'+sl+'2')}out.block=[+(blockCh()-b0).toFixed(3),+(blockCap()-c0).toFixed(3)];
  // ---- saves keep worn levels and upgraded copies ----
  inv.u2_eq_sword7=4;const S=JSON.parse(JSON.stringify(snap()));out.saved=[S.upe&&S.upe.main,S.inv.u2_eq_sword7];
  inv.u2_eq_sword7=0;applySave(S);await W(100);out.loaded=[U.UPS.main&&U.UPS.main.l,U.UPS.helm&&U.UPS.helm.l,inv.u2_eq_sword7|0,occ('main')];
  // ---- boss gear takes cores: Warlord's blade + 1 ember core -> +1 at Smithing 70 ----
  inv.eq_sword8=1;inv.core_ember=1;XPS[10]=XT[68];const nope=U.state('eq_sword8',1).okL;XPS[10]=XT[69];U.upgrade('eq_sword8',1);out.boss=[nope,inv.u1_eq_sword8|0,inv.eq_sword8|0,inv.core_ember|0];
  // ---- the collection log and the gear list don't count copies; the icon gets a badge ----
  const u0=eqIcon('u1_eq_sword7');await W(400);out.badge=eqIcon('u1_eq_sword7')!==eqIcon('eq_sword7');
  // ---- axes swing faster ----
  XPS[1]=XT[98];XPS[2]=XT[98];inv.eq_axe7=1;equipItem('eq_axe7');out.axeOn=occ('axe');const g0=gSpeed(1);inv.u2_eq_axe7=1;equipItem('u2_eq_axe7');out.axe=+(gSpeed(1)-g0).toFixed(2);
  // ---- Nov 23 fix: swapping an upgraded piece off with plain copies in the bag doesn't turn a plain copy into an upgraded one ----
  unequipSlot('axe');unequipSlot('main');for(const k of['u1_eq_sword7','u2_eq_sword7','u3_eq_sword7'])inv[k]=0;inv.u1_eq_sword7=1;inv.eq_sword7=3;inv.eq_sword6=1;XPS[0]=XT[80];
  equipItem('u1_eq_sword7');equipItem('eq_sword6');out.swapOff=[occ('main'),inv.u1_eq_sword7|0,inv.eq_sword7|0];
  equipItem('u1_eq_sword7');unequipSlot('main');out.putAway=[occ('main'),inv.u1_eq_sword7|0,inv.eq_sword7|0];
  const S2=JSON.parse(JSON.stringify(snap()));out.savedSwap=[S2.inv.u1_eq_sword7|0,S2.inv.eq_sword7|0,!S2.upe||!S2.upe.main];
  // ---- Nov 23 fix: upgraded copies in the bag stay with you when you fall, like other gear ----
  inv.u2_eq_sword7=2;inv.berry=3;dead=true;P.hp=0;reset();await W(600);out.fall=[inv.u2_eq_sword7|0,inv.u1_eq_sword7|0,inv.berry|0];
  STR.delete(i0);return out});
 if(r.err)return t(false,r.err);
 t.eq(r.which,[[true,true,true,true,true,true],[false,false,false,false,false,false,false]],'what can be upgraded [adamant sword, ranger hood, Warlord\'s blade, adamant axe, mithril dagger, longbow] and not [starter gear, crystal blade, bone bow, shop wand, wizard hat]');
 t.eq(r.reqs,[10,75,95,6,20,'core_ember',70],'levels [Smithing; adamant sword +1 at 75, +3 at 95; ranger hood with Crafting at 20; Warlord\'s blade takes ember cores at 70]');
 t.eq(r.item,[true,false,'Adamant sword +1',true,true],'an upgraded copy is an item [EQ entry, not in the gear list, name, sells for 10 swords, saved]');
 t(/Upgrade to adamant sword \+1/.test(r.row||'')&&/12 \/ 10/.test(r.row||''),'the bench lists it: '+r.row);
 t.eq(r.made,[2,1,680],'upgrading uses 10 of 12 swords and gives 680 Smithing XP (2x the sword\'s 340: 2 adamant bars, 284)');
 t.eq(r.worn0,['eq_sword7',9],'wearing one, 9 in the bag');
 t.eq(r.wornUp,['eq_sword7',1,0,0,680],'the worn sword counts: 9 + the one you wear make a +1 you\'re wearing');
 t.eq(r.slotName,true,'the equipment screen says Adamant sword +1');
 t.eq(r.unequip,[null,1,0,true],'putting it away puts the +1 (not a plain sword) in the bag');
 t.eq(r.reequip,['eq_sword7',1,0],'equipping the +1 wears it as a +1');
 t.eq(r.swap,['eq_sword7',true,1,0],'equipping a plain sword over it puts the +1 back in the bag');
 t.eq(r.eqList,true,'the Equip list offers the +1');
 t(r.melee>=.135&&r.melee<=.165,'a +3 sword hits about 15% harder on average: '+(r.melee*100).toFixed(1)+'%');
 t.eq(r.block,[0.03,0.03],'three iron pieces at +1: +3% block and +3% block limit');
 t.eq(r.saved,[['eq_sword7',3],4],'the save keeps the worn +3 and 4 adamant swords +2');
 t.eq(r.loaded,[3,1,4,'eq_sword7'],'loading puts them back [worn sword +3, worn helmet +1, bag copies, wearing the sword]');
 t.eq(r.boss,[false,1,0,0],'boss gear: needs Smithing 70, then the blade + 1 ember core make a Warlord\'s blade +1');
 t.eq(r.badge,true,'an upgraded copy\'s icon has a level badge');
 t.eq([r.axeOn,r.axe],['eq_axe7',0.1],'an adamant axe +2 swings 10% faster');
 t.eq(r.swapOff,['eq_sword6',1,3],'swapping a +1 off for another sword keeps 1 +1 and 3 plain swords (no plain one turned into a +1)');
 t.eq(r.putAway,[null,1,3],'putting the +1 away again: still 1 +1 and 3 plain');
 t.eq(r.savedSwap,[1,3,true],'the save agrees [1 +1, 3 plain, no worn +1]');
 t.eq(r.fall,[2,1,0],'falling keeps upgraded copies in the bag (2 +2, 1 +1), the berries go to the grave')}};
