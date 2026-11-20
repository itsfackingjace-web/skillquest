// Wiki pages from the game's data: an item page says how to get it (drops with monster links, gathering, recipes) and what it makes,
// a monster page lists its drops, ◀ Back returns, the new tabs render, and search offers the pages.
module.exports={name:'wiki item and monster pages',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms)),b=()=>document.getElementById('wkb'),txt=()=>b().textContent;
  SQWK.open('items');await W(50);const link=b().querySelector('[data-wki="pelt"]');link.click();await W(50);const pelt=txt();
  const ml=b().querySelector('[data-wkp^="mob:"]');const mobOK=!!ml;if(ml)ml.click();await W(50);const mob=txt();
  b().querySelector('[data-wkb]').click();await W(30);const back=txt().includes('Dropped by');
  SQWK.go('item','oaklog');await W(30);const oak=txt();SQWK.go('item','meteorore');await W(30);const met=/Meteor strikes/.test(txt())&&/Mining 70/.test(txt());
  const tabs={};for(const k of['brew','social','patron','ach','start']){document.querySelector('#sqwk [data-wkt="'+k+'"]').click();await W(30);tabs[k]=txt().length}
  const q=document.getElementById('wkq');q.value='wolf';q.dispatchEvent(new Event('input'));await W(50);const srch=!!b().querySelector('.sqwkqp [data-wkp]');
  const home=(document.querySelector('#sqwk [data-wkt="start"]').click(),await W(30),txt());SQWK.close();
  return{pelt:[/Dropped by/.test(pelt),/Wolf/.test(pelt),/Used to make/.test(pelt)],mobOK,mob:[/Drops/.test(mob),/Wolf pelt/i.test(mob)],back,oak:/Woodcutting \(level 15\)/.test(oak),met,tabs,srch,home:/Not tried yet|Unlocked lately/.test(home)}});
 t.eq(r.pelt,[true,true,true],'pelt page: dropped by wolves, used to make');t(r.mobOK,'monster link on the item page');t.eq(r.mob,[true,true],'wolf page lists its pelt');
 t(r.back,'back returns to the pelt page');t(r.oak,'oak logs: gathered by Woodcutting 15');t(r.met,'meteorite ore: comes from meteor strikes');for(const k in r.tabs)t(r.tabs[k]>200,k+' tab has content ('+r.tabs[k]+')');
 t(r.srch,'search offers pages');t(r.home,'home has the new cards')}};
