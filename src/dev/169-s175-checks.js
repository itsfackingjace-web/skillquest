// ---- 175. Checks before publishing (Dev Suite > Checks, and warnings at the top of the Publish list) ----
// Looks through the draft for things that would publish quietly and then not work: references to items, monsters,
// quests, shops, songs, loot tables or islands that don't exist (in the game or in the same draft), quests nobody gives,
// shops nobody runs, songs that don't build, new items without a sprite. `run(lib)` returns [{lvl:'bad'|'warn', where, msg, go}].
(()=>{if(!window.SQSUITE||!SQSUITE.addTab||!window.SQA)return;const API=SQSUITE.api,{S,E}=API;
 const arr=v=>Array.isArray(v)?v:v&&typeof v==='object'?Object.values(v):[];
 const kOf=(pre,id)=>pre+id.slice(3).replace(/_/g,'').replace(/[0-9]/g,d=>'abcdefghij'[d]);
 function run(D){D=D||{};const out=[],C=D.content||{},bad=(where,msg,go)=>out.push({lvl:'bad',where,msg,go}),warn=(where,msg,go)=>out.push({lvl:'warn',where,msg,go});
  // what exists: the game's own items/monsters plus what this draft adds
  const items=new Set(Object.keys(INAME).filter(k=>!/^(it_|eq_cu_)/.test(k)));for(const k in C.items||{})items.add(k);for(const k in D.newgear||{})items.add(k);
  const MOBS=window.SQISLIFE&&SQISLIFE.MOBS||{};const mobs=new Set(Object.keys(MOBS).filter(k=>!/^c[bm]:/.test(k)));
  for(const id in D.bosses||{})mobs.add(kOf('cb:',id));for(const id in C.mobs||{})mobs.add(kOf('cm:',id));
  const loot=new Set(Object.keys(C.loot||{})),quests=C.quests||{},shops=C.shops||{};
  const nmI=k=>INAME[k]||(C.items&&C.items[k]&&C.items[k].n)||k,item=k=>items.has(k);
  const go=(s,id)=>({content:[s,id]});
  // content
  for(const id in C.items||{}){const o=C.items[id]||{};if(!(D.icons||{})[id])warn('Item '+(o.n||id),'has no sprite yet (it shows as a blank square). Draw it in Sprites.',{tab:'sprites',sel:'.dv-it[data-k="'+id+'"]'});
   if(o.t==='food'&&!(o.heal>0)&&!(o.hun>0))warn('Item '+(o.n||id),'is food but heals nothing and fills nothing.',go('items',id))}
  for(const id in C.recipes||{}){const r=C.recipes[id]||{},w='Recipe '+(r.out?nmI(r.out):id);if(!item(r.out))bad(w,'makes "'+(r.out||'nothing')+'", which isn\'t an item.',go('recipes',id));
   const c=arr(r.c).filter(q=>q&&q.k);if(!c.length)bad(w,'has no materials.',go('recipes',id));for(const q of c)if(!item(q.k))bad(w,'needs "'+q.k+'", which isn\'t an item.',go('recipes',id))}
  const roles=new Set();for(const iid in D.islands||{})for(const Q of arr((D.islands[iid]||{}).npc))if(Q&&Q.ro)for(const p of String(Q.ro).replace(/^(shop|quest):/,m=>m).split(/[:,]/))roles.add(p);
  for(const id in shops){const o=shops[id]||{};const w=(/^cs_/.test(id)?'Shop '+(o.n||id):'Stock for '+id);for(const q of arr(o.add))if(q&&!item(q.k))bad(w,'sells "'+q.k+'", which isn\'t an item.',go('shops',id));
   if(/^cs_/.test(id)&&!roles.has(id))warn(w,'has no shopkeeper: give an island person the job "Shopkeeper".',go('shops',id))}
  for(const id in quests){const q=quests[id]||{},w='Quest '+(q.n||id);
   if(q.t==='gather'&&!item(q.k))bad(w,'asks for "'+q.k+'", which isn\'t an item.',go('quests',id));
   if(q.t==='kill'&&!mobs.has(q.k))bad(w,'asks to defeat "'+q.k+'", which isn\'t a monster.',go('quests',id));
   if(q.t==='visit'&&!(typeof WORLD_REGIONS!=='undefined'&&WORLD_REGIONS[q.k])&&!(D.islands||{})[q.k])bad(w,'sends you to "'+q.k+'", which isn\'t an island.',go('quests',id));
   if(q.rk&&!item(q.rk))bad(w,'rewards "'+q.rk+'", which isn\'t an item.',go('quests',id));
   if(q.after&&!quests[q.after])bad(w,'comes after a quest that doesn\'t exist.',go('quests',id));
   const root=(()=>{let x=id,n=0;while(quests[x]&&quests[x].after&&n++<20)x=quests[x].after;return x})();if(!roles.has(id)&&!roles.has(root))warn(w,'nobody gives it: give an island person the job "Quest giver".',go('quests',id))}
  for(const id in C.mobs||{}){const m=C.mobs[id]||{};if(!MOBS[m.base])bad('Monster '+(m.n||id),'moves like "'+m.base+'", which isn\'t a monster.',go('mobs',id))}
  for(const id in C.loot||{}){const T=C.loot[id]||{},w='Loot '+(T.n||id);const e=arr(T.e).filter(Boolean);if(!e.length&&!(arr(T.g)[1]>0))warn(w,'gives nothing.',go('loot',id));
   for(const q of e)if(!item(q.k))bad(w,'has "'+q.k+'", which isn\'t an item.',go('loot',id));for(const k of arr(T.on))if(!mobs.has(k))bad(w,'drops from "'+k+'", which isn\'t a monster.',go('loot',id))}
  // islands: people's jobs, zones, caves, chests
  for(const iid in D.islands||{}){const I=D.islands[iid]||{},w='Island '+(I.n||iid),g={tab:'islands',sel:'[data-isl="'+iid+'"]'};
   for(const Q of arr(I.npc)){if(!Q||!Q.ro)continue;const m=/^(shop|quest):(.+)$/.exec(Q.ro);if(!m){bad(w,(Q.n||'A person')+' has a job that isn\'t a shop or quest.',g);continue}
    for(const x of m[2].split(','))if(m[1]==='shop'?!shops[x]:!quests[x])bad(w,(Q.n||'A person')+' runs a '+m[1]+' that doesn\'t exist any more.',g)}
   for(const z of arr(I.zn))for(const k of arr(z&&z.m))if(!mobs.has(k))bad(w,'a monster zone has "'+k+'", which isn\'t a monster.',g);
   for(const c of arr(I.cv))for(const k of arr(c&&c.m))if(!mobs.has(k))bad(w,'a dungeon entrance has "'+k+'", which isn\'t a monster.',g);
   for(const L of arr(I.lm))if(L&&L.loot)for(const k in L.loot)if(k!=='gold'&&!item(k)&&!loot.has(k))bad(w,'a chest holds "'+k+'", which isn\'t an item or loot table.',g)}
  // Gathering: what trees/rocks/fish give
  {const Gd=D.gather||{};for(const id in Gd.crops||{}){const o=Gd.crops[id]||{},w='Crop '+(o.n||id),g={tab:'gather'};
    if(!o.item||!item(o.item))bad(w,'harvests "'+(o.item||'nothing')+'", which isn\'t an item. Use "Make seed + crop items".',g);
    if(!o.seed||!item(o.seed))bad(w,'grows from "'+(o.seed||'nothing')+'", which isn\'t an item.',g);
    if(o.ck&&!item(o.ck))bad(w,'cooks into "'+o.ck+'", which isn\'t an item.',g);
    if(o.item&&typeof CROPS!=='undefined'&&CROPS[o.item]&&!CROPS[o.item]._g)bad(w,'uses one of the game\'s own crops as its harvest.',g);}}
  {const Gd=D.gather||{};for(const k of['nodes','fish'])for(const id in Gd[k]||{}){const o=Gd[k][id]||{},w=(k==='fish'?'Fish ':'')+(o.n||id),g={tab:'gather'};
    if(!o.item||!item(o.item))bad(w,'gives "'+(o.item||'nothing')+'", which isn\'t an item. Pick one or use "Make its item".',g);
    if(k==='fish'&&o.ck&&!item(o.ck))bad(w,'cooks into "'+o.ck+'", which isn\'t an item.',g);
    if(k==='nodes'&&!(o.where||[]).length)warn(w,'isn\'t placed anywhere: tick at least one island.',g);
    if(k==='nodes'&&!(o.pct>0))warn(w,'replaces 0% of '+(o.rep==='tree'?'trees':'rocks')+', so it never appears.',g)}}
  // recipe edits in Stats > Recipes: materials that aren't items are skipped by the game
  if(window.SQDATA)for(const k in ((D.stats||{}).recipe||{})){const o=D.stats.recipe[k];if(!o||o.mats==null)continue;const p=SQDATA.parseMats(o.mats);const nm=(SQA.TABLES.recipe.orig(k)||{}).n||k;
   if(p.bad)bad('Recipe '+nm,'has materials the game doesn\'t know ("'+String(o.mats).slice(0,60)+'"). Use item names like "Wood 4, Stone 2".',{tab:'stats'});
   if(!Object.keys(p.c).length&&!/^COOKS:/.test(k))bad('Recipe '+nm,'has no materials left, so it keeps its old ones.',{tab:'stats'})}
  // monster drops, bosses, new gear, songs
  for(const k in D.mobs||{})for(const d of arr((D.mobs[k]||{}).dr))if(d&&d.k&&!item(d.k))bad('Monster rules '+k,'drops "'+d.k+'", which isn\'t an item.',{tab:'monsters',sel:'[data-k="'+k+'"]'});
  for(const id in D.bosses||{}){const b=D.bosses[id]||{};if(b.base&&!MOBS[b.base])bad('Boss '+(b.n||id),'is built on "'+b.base+'", which isn\'t a monster.',{tab:'bosses',sel:'[data-cbs="'+id+'"]'})}
  for(const k in D.newgear||{}){const o=D.newgear[k]||{};if(!INAME[o.b])bad('Gear '+(o.n||k),'works like "'+o.b+'", which isn\'t an item.',{tab:'worn'});if(!(D.icons||{})[k])warn('Gear '+(o.n||k),'has no sprite yet.',{tab:'sprites',sel:'.dv-it[data-k="'+k+'"]'})}
  if(window.SQSONGS){for(const k in D.songs||{}){const c=SQSONGS.check(D.songs[k]);if(c.errs.length)bad('Song '+((D.songs[k]||{}).n||k),c.errs[0],{tab:'songs',sel:'[data-sgs="'+k+'"]'})}
   const songs=new Set([...Object.keys(SQSONGS.ORIG),...Object.keys(D.songs||{})]);for(const r in D.songmap||{})if(!songs.has(D.songmap[r]))bad('Island songs',r+' plays a song that doesn\'t exist.',{tab:'songs'})}
  return out}
 const goTo=g=>{if(!g)return;if(g.content&&window.SQCONTENT&&SQCONTENT.edit){SQCONTENT.edit(g.content[0],g.content[1]);return}S.tab=g.tab;API.draw();if(g.sel)setTimeout(()=>{const x=document.querySelector('#dvs '+g.sel);if(x){x.scrollIntoView({block:'center'});x.click()}},250)};
 let LAST=[];
 function render(){const R=run(S.draft);LAST=R;const nb=R.filter(r=>r.lvl==='bad').length,nw=R.length-nb;
  let h='<div class="dv-card"><b>Checks</b><p class="dv-mut">Things in your draft that would publish but not work. Problems (red) should be fixed before publishing; notes (yellow) are worth a look.</p>'+
   (R.length?'<p>'+(nb?'<b style="color:#e66">'+nb+' problem'+(nb===1?'':'s')+'</b>':'No problems')+(nw?' · '+nw+' note'+(nw===1?'':'s'):'')+'</p>':'<p style="color:#7c6">✓ Everything checks out.</p>');
  R.forEach((r,i)=>{h+='<div class="dv-hl" style="flex-wrap:wrap"><span>'+(r.lvl==='bad'?'❌':'⚠️')+' <b>'+E(r.where)+'</b> '+E(r.msg)+'</span>'+(r.go?'<button class="dv-b" data-ckgo="'+i+'">Open</button>':'')+'</div>'});
  return h+'</div>'}
 document.addEventListener('click',e=>{if(S.tab!=='checks')return;const t=e.target.closest('[data-ckgo]');if(!t)return;e.preventDefault();goTo(LAST[+t.dataset.ckgo]&&LAST[+t.dataset.ckgo].go)},true);
 SQSUITE.addTab('checks','Checks',{render,changes(L,D){const R=run(D).filter(r=>r.lvl==='bad');if(!R.length)return[];
   const real=window.SQHIST?SQHIST.diff(JSON.parse(JSON.stringify(L||{})),JSON.parse(JSON.stringify(D||{}))).filter(c=>!['v','at','by'].includes(c.p[0])):[1];if(!real.length)return[];
   return[{kind:'ext',html:'<b style="color:#e66">❌ '+R.length+' problem'+(R.length===1?'':'s')+' in this draft</b> (see the Checks tab): '+R.slice(0,3).map(r=>E(r.where+' '+r.msg)).join(' · ')+(R.length>3?' …':'')}]}});
 window.SQCHECKS={run}})();
