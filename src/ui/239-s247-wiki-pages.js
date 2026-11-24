// ---- 247. Wiki pages made from the game's own data (window.SQWKPAGES) ----
// 075 now has pages (SQWK.pages[kind](id) → HTML, opened with data-wkp="kind:id" or any item link data-wki, ◀ Back through WK.hist).
// This section registers:
//  item:<key>  picture, description/stats, value (shop + 079's market price), how to get it (recipes incl. brewing/stove/jewelry,
//              shops, monsters that drop it, fishing/gathering/farming), what it's used for (recipes, food), and a link per thing.
//  mob:<key>   picture, health, where it lives (RG_FAUNA / 075's WK_MOBS text), gold and drops with chances.
//  Drops: data/239a-wiki-drops.js (SQWKDROPS, measured by tools/wiki/drops.cjs: rerun it when monster drops change in code)
//  + Dev Suite monster rules (SQMOBRULES) + Content loot tables (SQCONTENT.C.loot), both read live.
// New tabs (WK2 + WK_TABS): Brewing, Playing together, Patrons, Achievements (progress from 129's SQACH). Home gets "Unlocked lately"
// and "Not tried yet". Search also finds item and monster pages by name (top of the results).
(()=>{const W=window.SQWK;if(!W||!W.pages)return;const H=W.h,E=H.E,WK2=H.WK2,PG=W.pages;
 const nm=k=>H.name(k),ico=k=>{try{return H.icon(k)}catch(e){return''}};
 const lnk=k=>H.link(k),mlnk=(k,n)=>'<span class="lk" data-wkp="mob:'+E(k)+'">'+E(n||mobName(k))+'</span>';
 const pct=v=>(v>=.995?'always':v>=.1?Math.round(v*100)+'%':v>=.01?(v*100).toFixed(1)+'%':'rare');
 const card=(t,h)=>'<div class="c"><div class="tx">'+(t?'<b>'+t+'</b><br>':'')+h+'</div></div>';
 const lvOfS=n=>{const i=SKN.indexOf(n);return i<0?0:lvOf(i)};
 // ---- every way to make something ----
 function recipes(){const R=H.recipes();
  try{if(window.SQBREW)for(const r of SQBREW.RECIPES)R.push({out:r.k,n:nm(r.k),sk:'Brewing',lv:r.lv,xp:r.xp,c:r.c,at:'Cauldron'})}catch(e){self.SQERR&&SQERR(e,'239-1')}
  try{if(window.SQSTOVE)for(const r of SQSTOVE)if(r&&r.k)R.push({out:r.k,n:nm(r.k),sk:'Cooking',lv:r.lv||1,xp:r.xp||0,c:r.c||{},at:'Stove (meals)'})}catch(e){self.SQERR&&SQERR(e,'239-2')}
  return R}
 // ---- monsters ----
 const MOBS=()=>window.SQISLIFE&&SQISLIFE.MOBS||{};
 function mobName(k){if(k.startsWith('h:'))return k.slice(2);const M=MOBS()[k.replace(/^rg:/,'')];return M&&M.n||(window.WK_RGN||{})[k.replace(/^rg:/,'')]||k}
 // drops of one monster: {item:{c chance, a amount, src}} + gold
 function dropsOf(key){const out={},D=(window.SQWKDROPS||{})[key];if(D)for(const x in D.d)out[x]={c:D.d[x][0],a:D.d[x][1]};
  const rk=key.replace(/^rg:/,'').replace(/^h:/,'');
  try{const MR=window.SQMOBRULES&&SQMOBRULES.rules;const r=MR&&MR['m:'+rk];if(r){if(r.rep)for(const x in out)delete out[x];for(const d of r.dr)out[d.k]={c:d.c/100,a:d.n===d.x?d.n:d.n+'-'+d.x}}}catch(e){self.SQERR&&SQERR(e,'239-3')}
  try{const L=window.SQCONTENT&&SQCONTENT.C.loot;for(const id in L||{}){const T=L[id];if(!(T.on||[]).includes(rk))continue;const tw=T.e.reduce((s,q)=>s+q.w,0)||1;
   for(const q of T.e){const one=q.w/tw,c=(T.p/100)*(1-Math.pow(1-one,T.r));if(!out[q.k]||out[q.k].c<c)out[q.k]={c,a:q.a===q.b?q.a:q.a+'-'+q.b}}}}catch(e){self.SQERR&&SQERR(e,'239-4')}
  return{d:out,g:D?D.g:null}}
 // one entry per monster name (Hollow's own `h:` entry first: it has 075's description)
 function allMobKeys(){const s=new Set(Object.keys(window.SQWKDROPS||{}));for(const k in MOBS())if(!/^cb:|^ib|^wb/.test(k))s.add('rg:'+k);
  const L=[...s].sort((a,b)=>(a.startsWith('h:')?0:1)-(b.startsWith('h:')?0:1)),seen=new Set();return L.filter(k=>{const n=mobName(k).toLowerCase();if(seen.has(n))return false;seen.add(n);return true})}
 const twin=key=>{const n=mobName(key).toLowerCase();return Object.keys(MOBS()).filter(k=>String(MOBS()[k].n||'').toLowerCase()===n).map(k=>'rg:'+k)};
 function whereMob(key){const rk=key.replace(/^rg:/,'');const out=[];
  if(key.startsWith('h:')){const m=(window.WK_MOBS||[]).find(q=>q.n===key.slice(2));if(m)out.push(E(m.w));for(const t of twin(key))for(const w of whereMob(t))if(!out.includes(w))out.push(w);return out}
  try{for(const id in RG_FAUNA){const F=RG_FAUNA[id],R=WORLD_REGIONS[id];const when=[];if((F.day||[]).some(e=>e[0]===rk))when.push('day');if((F.night||[]).some(e=>e[0]===rk))when.push('night');
   if(when.length)out.push('<span class="lk" data-wkp="place:'+E(id)+'">'+E(R?R.name:id)+'</span> ('+when.join(' and ')+')')}}catch(e){self.SQERR&&SQERR(e,'239-5')}
  const m=(window.WK_MOBS||[]).find(q=>q.n===mobName(key));if(m&&!out.length)out.push(E(m.w));return out}
 function mobPic(key){try{const rk=key.replace(/^rg:/,'');if(key.startsWith('h:')){const mk=(window.WK_MK||{})[key.slice(2)];return mk?img(H.pic(key.slice(2),mk)):''}
   const M=MOBS()[rk];return M?img(H.pic('rg_'+rk,()=>rgMake(rk,M.hp,0,0))):''}catch(e){return''}}
 const img=u=>u?(String(u).startsWith('<')?u:'<img alt="" class="mob" src="'+u+'">'):'';
 PG.mob=key=>{const n=mobName(key),M=MOBS()[key.replace(/^rg:/,'')],wm=(window.WK_MOBS||[]).find(q=>q.n===n),{d,g}=dropsOf(key);
  const hp=M?M.hp:wm?wm.hp:null;let h='<div class="c" style="max-width:none">'+mobPic(key)+'<div class="tx"><h2 style="margin:0 0 4px">'+E(n)+'</h2>'+
   (hp?'<span class="tag">'+(H.hp?H.hp(hp,M?{rk:key.replace(/^rg:/,'')}:null):hp)+' health</span> ':'')+(g!=null?'<span class="tag">about '+g+' gold a kill</span>':'')+
   (wm&&wm.d?'<p>'+E(wm.d)+'</p>':'')+'</div></div>';
  const wh=whereMob(key);h+=card('Where to find it',wh.length?wh.join('<br>'):'Not in a fixed place.');
  const rows=Object.entries(d).sort((a,b)=>b[1].c-a[1].c);
  h+=card('Drops',rows.length?'<table><tr><th></th><th>Item</th><th>Chance</th><th>Amount</th></tr>'+rows.map(([x,v])=>'<tr><td><img alt="" src="'+ico(x)+'" style="width:20px;height:20px;image-rendering:pixelated"></td><td>'+lnk(x)+'</td><td>'+pct(v.c)+'</td><td>'+E(v.a)+'</td></tr>').join('')+'</table>':'Only gold.');
  return h};
 // ---- items ----
 function shopsSelling(k){const n=String(nm(k)).toLowerCase(),out=[];try{for(const s of H.shops())for(const[it,c]of s.items){const t=String(it).toLowerCase();if(t===n||t.replace(/^\d+ /,'')===n||t===n+'s')out.push(E(s.t)+' ('+E(s.who)+', '+E(s.where)+'): '+E(it)+' for '+E(c)+' gold')}}catch(e){self.SQERR&&SQERR(e,'239-6')}
  try{if(window.SQPOTAF)for(const q of SQPOTAF)if(q.k===k)out.push('Vessa\'s potion stall (Emberwatch): '+q.v+' gold')}catch(e){self.SQERR&&SQERR(e,'239-7')}return out}
 function gathered(k){const out=[];
  try{for(const f of FISH_T)if(f.k===k)out.push('Fishing (level '+f.lv+'): caught with a rod'+(f.w?' · '+E(f.w):''))}catch(e){self.SQERR&&SQERR(e,'239-8')}
  try{for(const f of window.SQFISHX||[])if(f.k===k)out.push('Fishing (level '+f.lv+')'+(f.where?' · '+f.where.map(id=>(WORLD_REGIONS[id]||{}).name||id).join(', '):' · anywhere'))}catch(e){self.SQERR&&SQERR(e,'239-9')}
  try{for(const t in window.SQTIER||{}){const T=SQTIER[t];if(T.item===k)out.push((T.sk===1?'Woodcutting':'Mining')+' (level '+T.lv+'): '+E(t.replace(/^g_/,''))+' '+(T.base==='tree'?'trees':'rocks'))}}catch(e){self.SQERR&&SQERR(e,'239-10')}
  try{for(const c in CROPS)if(c===k&&CROPS[c])out.push('Farming (level '+CROPS[c].lv+'): grown from '+lnk(CROPS[c].seed))}catch(e){self.SQERR&&SQERR(e,'239-11')}
  const basic={wood:'Woodcutting: chop any tree',stone:'Mining: any rock',ore:'Mining: iron rocks',coal:'Mining: coal rocks',berry:'Foraging: berry bushes',shroom:'Foraging: mushroom patches',sand:'Digging on beaches',meat:'Most monsters drop raw meat',bone:'Skeletons'};
  if(basic[k]&&!out.length)out.push(basic[k]);return out}
 function foodLine(k){try{const f=FOODS.find(q=>q.k===k);if(f)return'Eat it: heals '+f.heal+' heart'+(f.heal===1?'':'s')+(f.hun?', fills '+f.hun+' food':'')}catch(e){self.SQERR&&SQERR(e,'239-12')}return''}
 PG.item=k=>{if(!INAME[k])return'<div class="emp">No item called that.</div>';const R=recipes();let d='';try{d=IDESC[k]||''}catch(e){self.SQERR&&SQERR(e,'239-13')}
  const sp=typeof SELLP!=='undefined'&&SELLP[k];let mk='';try{const M=window.SQMKT&&SQMKT.info(k);if(M)mk='Market price: '+Math.round(M.p).toLocaleString('en-US')+' gold ('+M.n+' recent trade'+(M.n>1?'s':'')+')'}catch(e){self.SQERR&&SQERR(e,'239-14')}
  let h='<div class="c" style="max-width:none"><img alt="" src="'+ico(k)+'" class="big"><div class="tx"><h2 style="margin:0 0 4px">'+E(nm(k))+'</h2>'+E(d)+
   '<p><small>'+[sp?'Shops pay '+sp+' gold':'',mk,(inv[k]|0)?'You have '+(inv[k]|0):''].filter(Boolean).join(' · ')+'</small></p>'+(foodLine(k)?'<p>'+foodLine(k)+'</p>':'')+'</div></div>';
  const get=[];
  for(const r of R)if(r.out===k)get.push('<b>Make it</b> at the '+E(r.at)+' · '+E(r.sk)+' level '+r.lv+(r.xp?' · '+r.xp+' XP':'')+'<br><small>Needs '+H.cost(r.c)+'</small>');
  for(const s of shopsSelling(k))get.push('<b>Buy it</b>: '+s);
  const dk=allMobKeys().map(key=>[key,dropsOf(key).d[k]]).filter(x=>x[1]).sort((a,b)=>b[1].c-a[1].c);
  if(dk.length)get.push('<b>Dropped by</b>: '+dk.slice(0,14).map(([key,v])=>mlnk(key)+' ('+pct(v.c)+')').join(', ')+(dk.length>14?' and more':''));
  for(const g of gathered(k))get.push('<b>Gather it</b>: '+g);
  // events and other places a section registers (window.SQWIKIGET[item] = list of HTML lines, e.g. 215's meteor strikes)
  try{for(const g of(window.SQWIKIGET&&SQWIKIGET[k])||[])get.push(g)}catch(e){self.SQERR&&SQERR(e,'239-23')}
  try{for(const c of COOKS)if(c.ck===k)get.push('<b>Cook it</b>: '+lnk(c.raw)+' on a campfire (Cooking '+c.lv+')')}catch(e){self.SQERR&&SQERR(e,'239-15')}
  try{const rare=(window.WK_RARE||[]).filter(r=>String(r.n||'').toLowerCase()===String(nm(k)).toLowerCase());for(const r of rare)get.push('<b>Rare find</b>: '+E(r.w||r.d||''))}catch(e){self.SQERR&&SQERR(e,'239-16')}
  h+=card('How to get it',get.length?get.join('<hr style="border:0;border-top:1px solid #d8dce4;margin:6px 0">'):'Not found anywhere yet: it may come from a boss, a quest, an event or another player.');
  const use=[];const seen=new Set();for(const r of R)if(r.c&&r.c[k]&&!seen.has(r.out+r.at)){seen.add(r.out+r.at);use.push((r.out&&INAME[r.out]?lnk(r.out):E(r.n))+' <small>('+r.c[k]+' · '+E(r.at)+', '+E(r.sk)+' '+r.lv+')</small>')}
  try{for(const c of COOKS)if(c.raw===k)use.push('Cook it into '+lnk(c.ck)+' <small>(Cooking '+c.lv+')</small>')}catch(e){self.SQERR&&SQERR(e,'239-17')}
  try{const f=window.SQFIRELOGS&&SQFIRELOGS.T.find(q=>q.k===k);if(f)use.push('Burn it on a campfire (Firemaking '+f.lv+'): '+f.pl+' XP a log'+(f.m>1?', the fire lasts '+f.m+'× as long':'')+'; feeding one to a fire adds '+f.fs+' s')}catch(e){self.SQERR&&SQERR(e,'239-18')}
  if(use.length)h+=card('Used to make',use.slice(0,40).join('<br>')+(use.length>40?'<br>…and '+(use.length-40)+' more':''));
  return h};
 // ---- islands and towns: who/what is there ----
 PG.place=id=>{const R=(typeof WORLD_REGIONS!=='undefined'&&WORLD_REGIONS[id])||{};let h='<h2>'+E(R.name||id)+'</h2>'+(R.lv?'<p>Monsters here are about level '+R.lv+'.</p>':'');
  const m=allMobKeys().filter(k=>whereMob(k).some(w=>w.includes('place:'+id+'"')));if(m.length)h+=card('Monsters',m.map(k=>mlnk(k)).join(', '));
  h+='<p><span class="lk" data-wkt="world">Islands & Towns</span> · <span class="lk" data-wkt="maps">Maps</span></p>';return h};
 // ---- search: item and monster pages first ----
 {const t=document.getElementById('wkq');if(t)t.addEventListener('input',()=>setTimeout(()=>{const q=t.value.trim().toLowerCase();if(q.length<2)return;const b=document.getElementById('wkb');if(!b)return;
   const its=Object.keys(INAME).filter(k=>INAME[k]&&String(INAME[k]).toLowerCase().includes(q)).slice(0,12),mbs=allMobKeys().filter(k=>mobName(k).toLowerCase().includes(q)).slice(0,8);
   if(!its.length&&!mbs.length)return;const em=b.querySelector('.emp');if(em)em.remove();
   const d=document.createElement('div');d.className='sqwkqp';d.innerHTML='<h3>Pages</h3><p>'+its.map(k=>'<span class="lk" data-wkp="item:'+E(k)+'" style="margin-right:12px;white-space:nowrap"><img alt="" src="'+ico(k)+'" style="width:18px;height:18px;vertical-align:middle;image-rendering:pixelated"> '+E(nm(k))+'</span>').join('')+
    mbs.map(k=>'<span class="lk" data-wkp="mob:'+E(k)+'" style="margin-right:12px;white-space:nowrap">👾 '+E(mobName(k))+'</span>').join('')+'</p>';const ph=b.querySelector('.wph');if(ph)ph.after(d);else b.prepend(d)},0))}
 // ---- new tabs ----
 const TABS=H.tabs,addTab=(k,n,after)=>{if(TABS.some(t=>t[0]===k))return;const i=TABS.findIndex(t=>t[0]===after);TABS.splice(i<0?TABS.length:i+1,0,[k,n])};
 const C=(t,h)=>({t:t+' '+h.replace(/<[^>]+>/g,' '),h:card(E(t),h)}),HD=t=>({t:'',h:'<h3>'+E(t)+'</h3>',head:1});
 addTab('brew','Brewing','craft');
 WK2.brew=()=>{const out=[C('Brewing','Brewing is a skill. Build a <b>cauldron</b> at home (Craft menu), stand in front of it and press USE to brew potions from things you gather. Brewing is faster and gives more with its perks (Skills tab).')];
  out.push(HD('Potions'));try{for(const r of SQBREW.RECIPES){const ct=SQBREW.COAT[r.k];out.push({t:nm(r.k)+' brewing potion',h:'<div class="c"><img alt="" src="'+ico(r.k)+'"><div class="tx"><b>'+lnk(r.k)+'</b> <span class="tag">Brewing '+r.lv+'</span><br>'+E(IDESC[r.k]||'')+'<br><small>Needs '+H.cost(r.c)+' · '+r.xp+' XP'+(ct?' · coats your dagger':'')+'</small></div></div>'})}}catch(e){self.SQERR&&SQERR(e,'239-19')}
  out.push(HD('Daggers and coatings'));out.push(C('Daggers','A dagger goes in your off-hand. Press X (or the STAB button) to stab between sword swings. USE a poison, napalm or lightning potion to coat it: every stab poisons, burns or shocks for a while. Pin a potion in your bag to use it with the dagger\'s ULT.'));
  out.push(C('Sharing potions','Helpful potions you drink are shared with party members and friends standing near you.'));return out};
 addTab('social','Playing together','guild');
 WK2.social=()=>[HD('Meeting people'),C('Talking','Open chat with the chat button. Tap a name in chat (or walk up to a player and tap their name button) to message them, add them as a friend, trade, invite them to a party, duel, play chess, ignore or report them. Players under 13 chat with ready-made phrases.'),
  C('Parties','START > Party. Party members see each other on the map, share pins you drop on the map, and get half the gold of monsters you beat near them. /p sends a party message.'),
  C('Emotes','START > Emotes or press G: wave, dance, sit, sleep and more. Other players see them.'),
  HD('Trading and the market'),C('Trading','Walk up to a player and choose TRADE. Both sides must accept twice before anything moves.'),
  C('World Market','Buy and sell with everyone, even when they\'re offline. Each item shows its market price from recent trades. A 1% tax is taken from sales worth 100 gold or more.'),
  HD('Fighting each other'),C('Duels','Choose DUEL on another player. Agree on a stake; the winner takes both. No one dies in a duel. After 60 seconds healing stops (sudden death).'),
  C('Chess','Play Orla at the chess club, or another player from their menu. Games against players count for the chess ladder.'),
  HD('Guilds'),{t:'guild',h:card('','<span class="lk" data-wkt="guild">Everything about guilds →</span>')}];
 addTab('patron','Patrons','social');
 WK2.patron=()=>[C('Becoming a Patron','Patrons support the game on Patreon (START > Patron). You must be 13 or older.'),
  C('Fire cape and flame','Patrons get a burning cape (START > Style) and a small flame next to their name.'),
  C('Art Room','Draw pictures, things to wear and pets, and send them in. Approved art can hang in homes, in the Patron Art Gallery, or become part of the game.'),
  C('Song Studio','Make your own music: pick a mood, tap notes on a grid and send your song in. No music experience needed. Approved songs can play in the game.'),
  C('Patron Art Gallery','A building in Hollow Village where Iris shows and sells approved paintings. Anyone can visit.'),
  C('Credits','Options > ABOUT > Credits lists Patrons (you can leave yourself out) and everyone whose art or music is in the game.')];
 addTab('ach','Achievements','quests');
 WK2.ach=()=>{const out=[C('Achievements','START > Achievements shows these with your progress, and the collection log of every item you have found. Each gives gold the first time.')];
  try{const A=SQACH.A,D=SQACH.done||{},by={};for(const a of A)(by[a.g]=by[a.g]||[]).push(a);
   for(const g in by){out.push(HD(g));for(const a of by[g]){let v=0;try{v=a.val()}catch(e){self.SQERR&&SQERR(e,'239-20')}const done=!!D[a.id];
    out.push({t:a.n+' '+a.d+' '+g,h:card((done?'✔ ':'')+E(a.n),E(a.d)+'<br><small>'+(done?'Done':Math.min(v,a.goal).toLocaleString('en-US')+' / '+a.goal.toLocaleString('en-US'))+(a.gold?' · '+a.gold.toLocaleString('en-US')+' gold':'')+'</small>')})}}}catch(e){self.SQERR&&SQERR(e,'239-21')}
  return out};
 // ---- Home: unlocked lately and not tried yet ----
 {const start=()=>{const keep=WK2.start;delete WK2.start;let base=[];try{base=W.cards('start')}catch(e){self.SQERR&&SQERR(e,'239-22')}WK2.start=keep;
   const extra=[];try{const R=recipes(),fresh=R.filter(r=>{const L=lvOfS(r.sk);return L&&r.lv<=L&&r.lv>L-6&&r.lv>1}).sort((a,b)=>b.lv-a.lv).slice(0,10);
    if(fresh.length)extra.push({t:'unlocked',h:card('Unlocked lately',fresh.map(r=>(r.out&&INAME[r.out]?lnk(r.out):E(r.n))+' <small>('+E(r.sk)+' '+r.lv+', '+E(r.at)+')</small>').join('<br>'))})}catch(e){self.SQERR&&SQERR(e,'239-23')}
   try{const no=SKN.map((n,i)=>[n,i]).filter(([n,i])=>!(XPS[i]>0));if(no.length)extra.push({t:'not tried',h:card('Not tried yet',no.map(([n])=>E(n)).join(', ')+'<br><small>The Skills tab says how to start each one.</small>')})}catch(e){self.SQERR&&SQERR(e,'239-24')}
   const i=base.findIndex(c=>c.head);return i<0?extra.concat(base):base.slice(0,i).concat(extra,base.slice(i))};WK2.start=start}
 // item cards in the Items tab and monster names in the Monsters tab open their pages
 window.SQWKPAGES={recipes,dropsOf,mobName,allMobKeys,whereMob}})();
