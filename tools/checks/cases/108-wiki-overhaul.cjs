// Nov 24 (Jace: "the wiki is in need of some serious work"): sections instead of 22 tabs in a row, a new Home, Items in groups without
// the +1/+2/+3 copies, gear cards on item pages, axe descriptions that match 277, void trees and chop times on Woodcutting (075, 278).
module.exports={name:'wiki: sections, Home, item groups, gear cards and up-to-date tree facts',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms)),b=()=>document.getElementById('wkb'),txt=()=>b().textContent,q=s=>document.querySelector('#sqwk '+s);const out={};
  await W(300);SQWK.open('start');await W(50);
  out.sects=[...document.querySelectorAll('#wkt .wsec')].map(e=>e.textContent.slice((e.querySelector('i')||{textContent:''}).textContent.length).trim());
  out.home=['Coming up next','Not tried yet','Browse','Your next steps'].map(s=>txt().includes(s));
  q('[data-wkg="items"]').click();await W(50);out.itemsTab=[SQWK.state.tab,!!q('#wkt .wg.on [data-wkt="shops"]')];
  out.copies=[...b().querySelectorAll('[data-wki]')].some(e=>/^u[123]_|^w\d/.test(e.dataset.wki));out.pelt=!!b().querySelector('[data-wki="pelt"]');
  const chip=b().querySelector('[data-wkic="weapon"]');out.chip=!!chip;if(chip){chip.click();await W(50)}
  out.weapons=[!!b().querySelector('[data-wki="eq_sword7"]'),!!b().querySelector('[data-wki="wood"]')];
  // search still finds things outside the chosen group
  const s=document.getElementById('wkq');s.value='oak logs';s.dispatchEvent(new Event('input'));await W(80);out.search=/Oak logs/.test(txt());s.value='';s.dispatchEvent(new Event('input'));await W(30);
  SQWK.go('item','eq_axe7');await W(50);const ax=txt();out.axe=[/Chopping power/.test(ax),/Time per tree/.test(ax),/hits for 8/.test(ax),/\+1 (\(Smithing \d+\) )?\+1 extra log limit/.test(ax),/Lasts/.test(ax)];
  SQWK.go('item','eq_helm5');await W(50);out.helm=/Your block chance now/.test(txt());
  SQWK.state.sk=1;q('[data-wkt="skills"]').click();await W(50);const wc=txt();const yr=[...b().querySelectorAll('tr')].find(tr=>tr.cells[0]&&/^Yew tree/.test(tr.cells[0].textContent));out.wc=[/Void tree/.test(wc),!!yr&&yr.cells[3].textContent==='8.5 s'/* 287: 10 chops of 0.85 s (Woodcutting 60) with an adamant axe */,/Unlocks/.test(wc),/Chop void trees/.test(wc)];
  q('[data-wkt="controls"]').click();await W(30);out.controls=/Dodge roll/.test(txt());
  q('[data-wkt="guides"]').click();await W(30);out.guides=['Gear wears out','Upgrading gear','Trees and axes'].map(s=>txt().includes(s));
  SQWK.close();out.desc=[/hits for/.test(String(IDESC.eq_axe7)),/Chopping power 2\.5/.test(String(IDESC.eq_axe7))];return out});
 t.eq(r.sects,['Home','Getting started','Skills','Items','Making things','Monsters','World','Quests','Together',"What's new"],'ten sections on the left');
 t.eq(r.home,[true,true,true,true],'Home: coming up next, not tried yet, browse, next steps');
 t.eq(r.itemsTab,['items',true],'the Items section opens Items, with Shops under it');
 t.eq([r.copies,r.pelt],[false,true],'Items lists no +1/+2/+3 or worn copies (and still links pelts)');
 t.eq([r.chip,...r.weapons],[true,true,false],'the Weapons group shows the adamant sword and not wood');
 t(r.search,'search finds oak logs whatever group is picked');
 t.eq(r.axe,[true,true,false,true,true],'the adamant axe page: chopping power, time per tree, no old "hits for 8", its upgrades and how long it lasts');
 t.eq(r.helm,false,'"Your block chance now" is left out of wiki pages');
 t.eq(r.wc,[true,true,true,true],'Woodcutting lists void trees, chop times and unlocks');
 t(r.controls,'Getting started has Controls');t.eq(r.guides,[true,true,true],'new guides: gear wear, upgrades, trees');
 t.eq(r.desc,[false,true],'the adamant axe description matches its chopping power')}};
