// ---- 286. The wiki, Nov 24 (Jace: "the wiki is in need of some serious work") ----
// 075 now groups the tabs into sections (WK_SECT), draws them as a list on the left (a row on phones, with the section's pages under
// it), puts a title over each tab and has the new look. This section adds:
//  - Home: what's new, your next steps, what you unlock next, what you unlocked lately, skills you haven't tried, every section.
//  - Getting started > Controls: the controls table and tips that used to sit on Home.
//  - Items: groups (weapons, armour, tools, ...) with counts; +1/+2/+3 and worn copies are no longer listed on their own (an item's
//    page lists its upgrades). Search still finds every item.
//  - Item pages: a Gear card (slot, stats, what it needs, how long it lasts, the upgrades), and for axes the time each tree takes.
//  - Skills: Woodcutting's training list has void trees and the seconds each tree takes (277's axe power and toughness).
//  - Descriptions fixed where the game changed: axes (277), the furnace and anvil, iron ore, cores (274 upgrades boss gear now);
//    "Your block chance now" (084, right for tooltips) is left out of wiki pages.
(()=>{const W=window.SQWK;if(!W||!W.h)return;const H=W.h,E=H.E,WK2=H.WK2,TABS=H.tabs,PG=W.pages;
 const st=()=>W.state;
 const nm=k=>H.name(k),ico=k=>{try{return H.icon(k)}catch(e){return''}},lnk=k=>H.link(k);
 const card=(t,h,cls)=>'<div class="c'+(cls?' '+cls:'')+'"><div class="tx">'+(t?'<b>'+t+'</b><br>':'')+h+'</div></div>';
 const fmt=v=>(Math.round((+v||0)*10)/10).toLocaleString('en-US');
 const css=document.createElement('style');css.textContent=`
#sqwk .wkhome{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:1000px){#sqwk .wkhome{grid-template-columns:1.25fr 1fr}#sqwk .wkhome .wide{grid-column:1/-1}}
#sqwk .wkhome .c{margin:0}#sqwk .wkhome>div:not(.wide):not(.wkhero){display:flex;flex-direction:column;gap:12px}#sqwk .wkhome .nx{margin:0}
#sqwk .wkhero{display:flex;flex-wrap:wrap;gap:12px;align-items:stretch;justify-content:space-between;background:#26324e;color:#fff;padding:14px 16px;border:2px solid #141c32;box-shadow:0 3px 0 #141c32}
#sqwk .wkhero h2{margin:0;color:#ffd86a;font-size:24px;letter-spacing:.04em;text-shadow:2px 2px 0 #10182c}#sqwk .wkhero p{margin:6px 0 0;color:#d8e2f6;font-size:14px;max-width:560px}
#sqwk .wkhero button{text-align:left;font-family:inherit;font-weight:600;font-size:12px;padding:8px 12px;border:2px solid #ffd86a;background:#33426a;color:#ffd86a;cursor:pointer;max-width:340px}
#sqwk .wkhero button b{display:block;color:#fff;font-size:14px;margin-top:2px}#sqwk .wkhero button:hover{background:#3c4e7c}
#sqwk .wkup td{padding:6px 8px}#sqwk .wkup .lv{white-space:nowrap;font-weight:700;color:#1c2848}
#sqwk .wkpbar{height:8px;background:#e3e9f3;border:1px solid #c9d3e4;margin-top:3px}#sqwk .wkpbar i{display:block;height:100%;background:#5878b8}
#sqwk .wkchips{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
#sqwk .wkchips button{font-family:inherit;font-weight:700;font-size:12px;padding:5px 9px;border:2px solid #b8c4da;background:#fff;color:#2c3a5c;cursor:pointer}#sqwk .wkchips button:hover{border-color:#3c5898}
#sqwk .wkchips button.on{background:#26324e;color:#fff;border-color:#26324e}#sqwk .wkchips button small{opacity:.7;margin-left:4px}
#sqwk .wkil{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px;margin-top:6px}
#sqwk .wkil .c{margin:0;padding:8px 10px;align-items:center}#sqwk .wkil .c small{display:block;line-height:1.35;margin-top:2px}
#sqwk .wkgear td:first-child{width:120px;color:#5a6680;font-weight:700}`;document.head.appendChild(css);
 const addTab=(k,n,after)=>{if(TABS.some(t=>t[0]===k))return;const i=TABS.findIndex(t=>t[0]===after);TABS.splice(i<0?TABS.length:i+1,0,[k,n])};
 // ---------------- descriptions that no longer match the game ----------------
 const setDesc=(k,v)=>{try{Object.defineProperty(IDESC,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){self.SQERR&&SQERR(e,'278-2')}};
 function fixDescs(){try{const C=window.SQCHOP;if(C){const AX={eq_axe1:1,eq_axe2:2,eq_axe3:3,eq_axe4:4,eq_axe6:6,eq_axe7:7,eq_axe9:9};
    for(const k in AX){if(!EQ[k])continue;const p=C.POW[AX[k]]||1,yew=Math.ceil(C.TOUGH.yew/p),tree=Math.ceil(C.TOUGH.tree/p);const q=EQ[k].rq2||EQ[k].req;
     setDesc(k,'Chopping power '+p+': every chop takes '+p+' off a tree\'s toughness, so a plain tree falls in '+tree+' chop'+(tree>1?'s':'')+' and a yew in '+yew+'. '+(q&&q.l?'Needs '+SKN[q.s]+' '+q.l+'. ':'')+'A tool for your tool belt: equip it from your Bag or the equipment screen.')}}
   const IR={furnace:'Smelt ore into bars (iron, steel, gold, mithril, adamant and meteorite), like the blacksmith\'s furnace. Place it in your house, castle or backyard, then face it and press HIT.',
    anvil:'Forge weapons, armour, tools, bows, arrows and wands from bars, like the blacksmith\'s anvil. Place it in your house, castle or backyard, then face it and press HIT.',
    iron:'From iron veins (Mining 5) and sometimes plain rocks (Mining 15), with a stone pickaxe or better. Smelt it into iron bars at a furnace.',
    ibar:'Smelted iron. Forge it into daggers, armour, tools, arrows and bows at an anvil.'};
   for(const k in IR)if(INAME[k])setDesc(k,IR[k]);
   const CO={core_briar:'the Flame crown and the Spider hood and robe',core_ember:'the Warlord\'s blade',core_frost:'the Stone sledgehammer',core_silver:'the Outlaw\'s hat',core_void:'the Void wand'};
   for(const k in CO)if(INAME[k]){const d=String(IDESC[k]||'');setDesc(k,d.replace(/ Boss gear from that island will be upgraded with cores at the Blacksmith's bench\.?/,'')+' Upgrade '+CO[k]+' with these at a Blacksmith\'s bench: 1 core makes a +1, 10 a +2 and 100 a +3.')}
  }catch(e){self.SQERR&&SQERR(e,'278-3')}}
 fixDescs();
 const clean=d=>String(d||'').replace(/ · Your block chance now: [\d.]+%?/g,'').replace(/Your block chance now: [\d.]+%?( · )?/g,'');
 // ---------------- Getting started > Controls ----------------
 addTab('controls','Controls','guides');
 WK2.controls=()=>[{t:'controls keys touch controller',h:'<table><tr><th>Do this</th><th>PC</th><th>Phone</th><th>Controller</th></tr>'+
   [['Move','WASD / arrows','Drag anywhere','Left stick'],['Hit, chop, mine, fish','Space / left-click','HIT','R2'],['Talk, use, read','T / Enter','TALK','✕'],['Bow or wand','Right-click','BOW / CAST','R1'],
    ['Ultimate','V','ULT','L1 + R1'],['Dodge roll','R','ROLL','○'],['Eat','E','EAT','□'],['Campfire','F','FIRE','△'],['Emotes','G','MENU → Emotes',''],['Menu','Esc','MENU','Options']]
   .map(r=>'<tr>'+r.map((x,i)=>i?'<td>'+E(x)+'</td>':'<td><b>'+E(x)+'</b></td>').join('')+'</tr>').join('')+'</table><p><small>Keys and controller buttons can be changed in Options → Controls.</small></p>'},
  {t:'tips',h:'<h3>Tips</h3>'},
  ...[['Night','Night brings monsters. A campfire keeps them away and cooks your food.'],['Food','Food keeps your hunger up; cooked food heals more.'],['Quests','Talk to Elder Rowan in Hollow Village for your first quests, and to townsfolk for daily jobs.'],
   ['Boats','Buy a sailboat from Captain Ida in Saltmere. Sera, the Navigator in Tidewatch, gives the voyages that chart routes to new islands and fits your boat upgrades. Harbor posts then sail you anywhere you\'ve charted.'],
   ['Online','Sign in to play online: chat, trade, visit friends\' houses, fight world bosses together and climb the leaderboards.']].map(([t,h])=>({t:t+' '+h,h:card(E(t),E(h))}))];
 // ---------------- Getting started: guides for what changed lately (gear wear, the Blacksmith's bench, trees) ----------------
 {const _g=WK2.guides;if(_g)WK2.guides=srch=>{const out=_g(srch)||[];const G=(t,h)=>out.push({t:t+' '+h.replace(/<[^>]+>/g,' '),h:card(E(t),h)});
   G('Gear wears out','Swords, daggers, bows, wands, armour, axes, pickaxes and fishing rods wear a little with every use: a hit, an arrow, a spell, a hit you take, a log, an ore or a fish. '+
    'Better gear lasts longer (an item\'s page says how long). When it runs out the piece comes off and is <b>worn out</b>; worn and used pieces show a bar on their icon. '+
    'Repair them at a <b>Blacksmith\'s bench</b> (Craft menu, then place it at home): it costs about half the bars it was made from for a full repair, gives Smithing or Crafting XP, and leaves bar shards you can use next time or fuse back into a bar at a furnace.');
   G('Upgrading gear','At a Blacksmith\'s bench, 10 of the same item make a +1, 10 of those a +2 and 10 of those a +3. Swords, bows and wands hit 5% harder for each level, axes and pickaxes work 5% faster, armour blocks more, and upgraded gear lasts longer. '+
    'Boss gear (the Warlord\'s blade, the Stone sledgehammer, the Flame crown, the Void wand, the Outlaw\'s hat) is upgraded with its island\'s <b>cores</b> instead: 1, 10 and 100. Cores are smithed at the bench from 100 sigil shards.');
   G('Trees and axes','Every tree has a toughness and every axe a chopping power, so higher trees take longer and a better axe is quicker: a plain tree takes 3 chops with a wooden axe, a yew 17 with an adamant axe. '+
    'Oak needs Woodcutting 15, willow 30, maple 45 and yew 60. <b>Void trees</b> (the purple-leaved trees of the Shattered Expanse and guild void saplings) need Woodcutting 75 and an adamant axe or better. '+
    'Skills → Woodcutting lists how long each tree takes.');
   G('Smithing XP and time','Every material has its own XP and time, and a furnace or anvil recipe gives the XP and takes the time of everything that goes into it. So bigger gear takes longer and gives more. '+
    'Each recipe at the furnace and anvil shows its time at your level and its XP; Skills → Smithing lists them all.');
   return out}}
 // ---------------- what each skill unlocks next ----------------
 const xpFor=l=>XT[Math.max(0,Math.min(98,l-1))]|0;
 function unlockLines(i,l){let a=[];try{a=treeGains(i,l)||[]}catch(e){self.SQERR&&SQERR(e,'278-4')}return a.map(String).filter(s=>!/^\+[\d.]+% /.test(s)&&!/^Base /.test(s)&&!/^\+\d+% chance/.test(s))}
 function nextUnlocks(){const out=[];for(let i=0;i<SKN.length;i++){const L=lvOf(i);if(L>=99)continue;
   for(let l=L+1;l<=Math.min(99,L+15);l++){const a=unlockLines(i,l);if(a.length){const pref=a.find(s=>!/^(Forge|Smelt|Make:|Cook) /.test(s))||a[0];out.push({i,L,l,t:pref,more:a.length-1,xp:Math.max(0,xpFor(l)-(XPS[i]||0)),tried:XPS[i]>0});break}}}
  return out.sort((a,b)=>(b.tried-a.tried)||(a.l-a.L)-(b.l-b.L)||a.xp-b.xp)}
 // ---------------- Home ----------------
 WK2.start=()=>{const pn=(window.SQPATCH||[{t:"",d:"",n:[]}])[0],tot=SKN.reduce((s,_,i)=>s+lvOf(i),0);let h='<div class="wkhome">';
  h+='<div class="wkhero wide"><div><h2>SkillQuest Wiki</h2><p>Everything about the game, read from the game itself, so it\'s always up to date. Search at the top, or pick a section.</p></div>'+
   '<button data-wkt="patch"><small>WHAT\'S NEW · '+E(pn.d)+'</small><b>'+E(pn.t)+'</b></button></div>';
  // your next steps: the main quest, the voyage you're on or can start next, a boat upgrade
  let nx='';try{const q=QS[Q.i];if(q)nx+='<p><b>Elder Rowan:</b> '+E(q.n)+(q.d?' · '+E(q.d):'')+'</p>'}catch(e){self.SQERR&&SQERR(e,'278-5')}
  try{const V=VQ(),act=VOYS.find(v=>V[v.id]&&V[v.id]!==99),nxt=VOYS.find(v=>!V[v.id]&&vNeedsOK(v));
   if(act)nx+='<p><b>Voyage:</b> '+E(act.name)+' · '+E(act.steps[V[act.id]-1])+'</p>';else if(nxt)nx+='<p><b>Voyage:</b> Sera, the Navigator in Tidewatch, has a new voyage for you: '+E(nxt.name)+'</p>';
   else{const up=UPGRADES.find(u=>!TRAVEL_UNLOCKS[u.id]&&u.needs.every(vDone));if(up)nx+='<p><b>Boat:</b> Sera can fit the '+E(up.name)+' ('+H.cost(up.cost)+')</p>'}}catch(e){self.SQERR&&SQERR(e,'278-6')}
  h+='<div>';
  if(nx)h+='<div class="nx"><b>Your next steps</b>'+nx+'</div>';
  if(tot<45)h+=card('New here? Start like this','<ol style="margin:4px 0 0;padding-left:20px"><li>Chop trees (HIT) for wood and pick berries to eat.</li><li>Before night, build a campfire (F: 3 wood + 1 stone): monsters keep away from it and you can cook on it.</li>'+
   '<li>Talk to Elder Rowan in Hollow Village for your first quests.</li><li>Craft better tools, then save up 250 gold for a sailboat from Captain Ida in Saltmere.</li></ol><p><span class="lk" data-wkt="guides">More in Getting started →</span> · <span class="lk" data-wkt="controls">Controls</span></p>');
  // what you unlock next
  const U=nextUnlocks().slice(0,7);
  if(U.length)h+=card('Coming up next','<table class="wkup">'+U.map(u=>{const need=Math.max(1,xpFor(u.l)-xpFor(u.L)),done=Math.max(0,Math.min(1,1-(u.xp/need)));
    return'<tr><td><span class="lk" data-wksk="'+u.i+'">'+E(SKN[u.i])+'</span> <span class="lv">'+u.l+'</span><div class="wkpbar"><i style="width:'+Math.round(done*100)+'%"></i></div></td><td>'+E(u.t)+(u.more>0?' <small>+'+u.more+' more</small>':'')+'<br><small>'+u.xp.toLocaleString('en-US')+' XP to go</small></td></tr>'}).join('')+'</table>');
  h+='</div><div>';
  // what you unlocked lately (recipes in the last few levels)
  try{const R=window.SQWKPAGES?SQWKPAGES.recipes():H.recipes(),lv=n=>{const i=SKN.indexOf(n);return i<0?0:lvOf(i)};
   const fresh=R.filter(r=>{const L=lv(r.sk);return L&&r.lv<=L&&r.lv>L-6&&r.lv>1}).sort((a,b)=>b.lv-a.lv).slice(0,8);
   if(fresh.length)h+=card('Unlocked lately',fresh.map(r=>(r.out&&INAME[r.out]?lnk(r.out):E(r.n))+' <small>('+E(r.sk)+' '+r.lv+', '+E(r.at)+')</small>').join('<br>'))}catch(e){self.SQERR&&SQERR(e,'278-7')}
  // the latest update, in short
  h+=card('Latest update: '+E(pn.t),'<ul style="margin:4px 0 0;padding-left:18px">'+pn.n.slice(0,3).map(x=>'<li style="margin:3px 0">'+E(x.length>180?x.slice(0,177).replace(/\s+\S*$/,'')+'…':x)+'</li>').join('')+'</ul><p><span class="lk" data-wkt="patch">All updates →</span></p>');
  const no=SKN.map((n,i)=>[n,i]).filter(([,i])=>!(XPS[i]>0));
  if(no.length)h+=card('Not tried yet','<div class="wkchips">'+no.map(([n,i])=>'<button data-wksk="'+i+'">'+E(n)+'</button>').join('')+'</div><small>Tap a skill to see how to start it.</small>');
  h+='</div>';
  // every section
  let S=[];try{S=W.sections?W.sections():[]}catch(e){self.SQERR&&SQERR(e,'278-8')}
  const SD={begin:'Your first day, boats, voyages, controls',skills:'Every skill: training, perks, unlocks, XP',items:'Every item and every shop',make:'Recipes: furnace, anvil, crafting, cooking, brewing',
   fight:'Monsters, bosses, dungeons, rare drops',world:'Islands, towns, maps, people',quests:'Quests and achievements',together:'Chat, trading, guilds, Drop Card, Patrons',news:'Every update'};
  h+='<div class="wide"><h3>Browse</h3><div class="hub">'+S.filter(g=>g.k!=='home').map(g=>'<button '+(g.t.length===1?'data-wkt="'+g.t[0]+'"':'data-wkg="'+g.k+'"')+'><b><i>'+g.i+'</i>'+E(g.n)+'</b>'+E(SD[g.k]||g.t.map(k=>(TABS.find(x=>x[0]===k)||[0,k])[1]).join(', '))+'</button>').join('')+'</div></div>';
  return[{t:'start',h:h+'</div>'}]};
 // ---------------- Items: groups ----------------
 const CATS=[['all','All'],['weapon','Weapons'],['armour','Armour'],['tool','Tools'],['jewel','Jewelry'],['ammo','Arrows'],['mat','Materials'],['food','Food & fish'],['potion','Potions'],['farm','Farming'],['home','Home & building'],['pet','Pets'],['card','Cards'],['other','Other']];
 const isCopy=k=>/^u[123]_|^w\d{1,5}_/.test(k);
 const set=a=>new Set(a);
 function catOf(k){const e=EQ[k];
  if(/^(dc_|pc_)/.test(k))return'card';
  if(/^pet_/.test(k)||e&&e.slot==='pet')return'pet';
  if(e){if(e.slot==='main'||(e.slot==='off'&&/^(sword|dagger|bow|wand)$/.test(e.kind||'')))return'weapon';if(/^(helm|body|legs|cape|feet|hands)$/.test(e.slot))return'armour';
   if(/^(axe|pick|rod)$/.test(e.slot)||/^(hoe|can)$/.test(e.kind||''))return'tool';if(/^(neck|ring)$/.test(e.slot))return'jewel';return'other'}
  if(/^j[ra]_/.test(k))return'jewel';if(/arrow$/.test(k))return'ammo';if(/^pot_/.test(k)||k==='elixir')return'potion';
  try{if(FOODS.some(f=>f.k===k&&!f.pot))return'food'}catch(e){/*quiet*/}
  try{if(COOKS.some(c=>c.raw===k||c.ck===k))return'food'}catch(e){/*quiet*/}
  try{if(FISH_T.some(f=>f.k===k)||(window.SQFISHX||[]).some(f=>f.k===k))return'food'}catch(e){/*quiet*/}
  if(set(['berry','meat','nuts','shroom','cfruit','honey','carrot','pumpkin','wheat']).has(k))return k==='wheat'||k==='pumpkin'?'farm':'food';
  if(/seed$/.test(k)||(typeof CROPS!=='undefined'&&CROPS[k])||k==='goldcrop')return'farm';
  try{if(BREC.some(r=>r.k===k))return'home'}catch(e){/*quiet*/}
  if(/^f[a-z]+$/.test(k)&&/Furniture/.test(String(IDESC[k]||'')))return'home';if(set(['house','castle','statue','lantern']).has(k))return'home';
  if(/log$|ore$|bar$/.test(k)||/^(wood|stone|iron|stardust|turtfrag|pelt|bone|heartwood|nails|brick|coin|ruby|sapphire|emerald|diamond|bowl|jam)$/.test(k)||/^(shd_|ibs_|core_)/.test(k))return'mat';
  return'other'}
 function listed(){const keys=Object.keys(INAME).filter(k=>INAME[k]&&!/^_/.test(k)&&!isCopy(k)&&(EQ[k]||(typeof INVK!=='undefined'&&INVK.includes(k))||IDESC[k]));
  return keys.sort((a,b)=>String(INAME[a]).localeCompare(String(INAME[b])))}
 function sub(k){const d=clean(IDESC[k]||''),sp=typeof SELLP!=='undefined'&&SELLP[k];let s=d.split(/(?<=[.!])\s/)[0]||'';if(s.length>110)s=s.slice(0,107).replace(/\s+\S*$/,'')+'…';
  return E(s)+(sp?' <span style="white-space:nowrap">· '+Number(sp).toLocaleString('en-US')+' gold</span>':'')}
 const row=k=>'<div class="c"><img alt="" src="'+ico(k)+'"><div class="tx"><b><span class="lk" data-wki="'+E(k)+'">'+E(INAME[k])+'</span></b><small>'+sub(k)+'</small></div></div>';
 WK2.items=srch=>{const L=listed();
  if(srch)return L.map(k=>({t:INAME[k]+' '+k+' '+clean(IDESC[k]||''),h:row(k)}));
  const S=st(),cat=S.icat||'all',cnt={all:0};for(const k of L){const c=catOf(k);cnt[c]=(cnt[c]||0)+1;if(c!=='card')cnt.all++}
  const sel=L.filter(k=>{const c=catOf(k);return cat==='all'?c!=='card':c===cat});
  return[{t:'',head:1,h:'<div class="wkchips" style="margin:0 0 10px">'+CATS.filter(([c])=>cnt[c]).map(([c,n])=>'<button data-wkic="'+c+'" class="'+(c===cat?'on':'')+'">'+E(n)+'<small>'+cnt[c]+'</small></button>').join('')+'</div>'+
   (cat==='all'?'<p><small>Cards are under <span class="lk" data-wkic="card">Cards</span> (and in Together → Drop Card). Upgraded +1/+2/+3 gear is on each item\'s page.</small></p>':'')+
   '<div class="wkil">'+sel.map(row).join('')+'</div>'}]};
 // ---------------- item pages: the gear card ----------------
 const SLOTN={main:'Main hand',off:'Off hand',helm:'Head',body:'Body',legs:'Legs',axe:'Tool belt (axe)',pick:'Tool belt (pickaxe)',rod:'Tool belt (fishing rod)',neck:'Neck',ring:'Ring',cape:'Cape',pet:'Pet slot'};
 function reqOf(k){const e=EQ[k];if(!e)return null;try{if(e.rq2&&e.rq2.l>0)return e.rq2;if(e.tt)return{s:8,l:50};const q=window.SQGEAR&&SQGEAR.defReq?SQGEAR.defReq(k):null;if(q&&q.l>0)return q;if(e.req&&e.req.l>0)return e.req}catch(e2){self.SQERR&&SQERR(e2,'278-9')}return null}
 function gearCard(k){const e=EQ[k];if(!e||e.slot==='pet')return'';const rows=[];
  rows.push(['Slot',E(SLOTN[e.slot]||e.slot)+(e.kind&&e.slot!=='main'?' · '+E(e.kind):'')]);
  try{const s=window.SQGEAR&&SQGEAR.statLine?SQGEAR.statLine(k):'';if(s)rows.push(['Stats',E(s.replace(/ · Needs [A-Za-z]+ \d+/,''))])}catch(e2){self.SQERR&&SQERR(e2,'278-10')}
  const q=reqOf(k);rows.push(['Needs',q?E(SKN[q.s]+' '+q.l):'Nothing: anyone can use it']);
  try{const d=window.SQREPAIR?SQREPAIR.maxD(k):0;if(d>0)rows.push(['Lasts',d.toLocaleString('en-US')+' uses, then it wears out. Repair it at a Blacksmith\'s bench.'])}catch(e2){self.SQERR&&SQERR(e2,'278-11')}
  if(e.slot==='axe'&&window.SQCHOP){const C=SQCHOP,a=e.tier|0,p=C.POW[a]||1,L=[['tree','Tree',1],['oak','Oak',15],['willow','Willow',30],['maple','Maple',45],['yew','Yew',60]];
   const gs=l=>.005*(l-1)+(l>=35?.05:0)+(l>=75?.05:0),secs=(t,l)=>Math.ceil(t/p)*C.CHOPSW/(1+gs(l));
   const q2=reqOf(k),lmin=q2?q2.l:1;
   rows.push(['Chopping power',p+' <small>(wooden 1 · iron 1.5 · adamant 2.5 · meteorite 3)</small>']);
   rows.push(['Time per tree',L.map(([t,n,l])=>{const lv=Math.max(l,lmin);return n+' '+fmt(secs(C.TOUGH[t],lv))+' s'}).join(' · ')+(a>=C.VOID.axe?' · Void '+fmt(secs(C.VOID.t,Math.max(75,lmin)))+' s':'')+' <small>(at each tree\'s level, before perks)</small>'])}
  // the upgrades made from it (274)
  const ups=[1,2,3].map(L=>'u'+L+'_'+k).filter(u=>INAME[u]);
  if(ups.length)rows.push(['Upgrades',ups.map(u=>{const L=+u[1];let d='';try{d=String(IDESC[u]||'').match(/^Upgraded to \+\d at a Blacksmith's bench: ([^.]*)\./);d=d?d[1]:''}catch(e2){self.SQERR&&SQERR(e2,'278-12')}
    return'<b>+'+L+'</b> '+E(d)+(SELLP[u]?' <small>(sells for '+Number(SELLP[u]).toLocaleString('en-US')+')</small>':'')}).join('<br>')+'<br><small>At a Blacksmith\'s bench: 10 of the same make a +1, 10 of those a +2 (boss gear uses cores instead).</small>']);
  return'<div class="c"><div class="tx"><b>Gear</b><table class="wkgear" style="margin:6px 0 0">'+rows.map(([a,b])=>'<tr><td>'+a+'</td><td>'+b+'</td></tr>').join('')+'</table></div></div>'}
 {const _it=PG.item;PG.item=k=>{let h=_it(k);try{h=h.replace(/ · Your block chance now: \d+%/g,'').replace(/Your block chance now: \d+%( · )?/g,'');
   const base=String(k).replace(/^u[123]_/,'').replace(/^w\d{1,5}_/,''),g=gearCard(EQ[k]?k:base);
   if(g){const i=h.indexOf('<div class="c"><div class="tx"><b>How to get it');h=i>0?h.slice(0,i)+g+h.slice(i):h+g}}catch(e){self.SQERR&&SQERR(e,'278-13')}return h}}
 // ---------------- training lists: void trees, and how long each tree takes ----------------
 (window.SQWKACT=window.SQWKACT||[]).push((skill,A)=>{if(skill!=='Woodcutting'||!window.SQCHOP)return;const C=SQCHOP;
  const HAVE={tree:1,pine:1,oak:3,willow:4,maple:6,yew:7,void:7}/* the axe you'd have by then (void trees: the adamant axe they need) */,gs=l=>.005*(l-1)+(l>=35?.05:0)+(l>=75?.05:0),secs=(t,ax,l)=>Math.ceil(t/(C.POW[ax]||1))*C.CHOPSW/(1+gs(l));
  const KN={Tree:'tree',Pine:'pine','Oak tree':'oak','Willow tree':'willow','Maple tree':'maple','Yew tree':'yew'};
  for(const a of A){const t=KN[a.n];if(t&&C.TOUGH[t]!=null)a.t=secs(C.TOUGH[t],HAVE[t],a.lv);else{const T=window.SQTIER&&Object.values(SQTIER).find(q=>q.sk===1&&q.xp===a.xp&&q.lv===a.lv);if(T&&T.hp)a.t=secs(T.hp,Math.max(1,T.axe|0),a.lv)}}
  A.push({n:'Void tree (Shattered Expanse, guild void saplings; adamant axe or better)',xp:C.VOID.xp,lv:C.VOID.lv,t:secs(C.VOID.t,HAVE.void,C.VOID.lv)})});
 // ---------------- clicks: item groups, a skill from Home ----------------
 {const el=document.getElementById('sqwk');if(el)el.addEventListener('click',e=>{const b=e.target.closest('[data-wkic],[data-wksk]');if(!b)return;const S=st();
   if(b.dataset.wkic){S.icat=b.dataset.wkic;if(S.tab!=='items'){S.tab='items';S.pg=null;S.q='';const q=document.getElementById('wkq');if(q)q.value=''}W.render();const bd=document.getElementById('wkb');if(bd)bd.scrollTop=0;return}
   if(b.dataset.wksk!=null){S.sk=+b.dataset.wksk;S.tab='skills';S.pg=null;S.q='';const q=document.getElementById('wkq');if(q)q.value='';W.render();const bd=document.getElementById('wkb');if(bd)bd.scrollTop=0}},true)}
 window.SQWIKI2={catOf,listed,nextUnlocks,gearCard,fixDescs};
})();
