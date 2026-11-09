window.SQPATCH=PATCH_NOTES;
const WK={open:false,tab:'start',q:''},wk$=id=>document.getElementById(id);
const wkSeen=()=>{try{return localStorage.getItem('sq_seenv')||''}catch(e){return''}},wkNew=()=>wkSeen()!==PATCH_NOTES[0].v;
function wkMarkSeen(){try{localStorage.setItem('sq_seenv',PATCH_NOTES[0].v)}catch(e){}const b=document.querySelector('#tsmn [data-a="wk"]');if(b)b.textContent='WIKI'}
const WK_TABS=[['patch','Patch notes'],['start','Start'],['guides','Guides'],['skills','Skills'],['xp','XP'],['items','Items'],['craft','Crafting'],['shops','Shops'],['mobs','Monsters'],['bosses','Bosses'],
 ['dungeons','Dungeons'],['quests','Quests'],['npcs','People'],['maps','Maps'],['world','Islands & Towns'],['pets','Pets & Rares']];
const WK_SKILL={Attack:'Fight with swords and fists. Higher levels hit harder and unlock better swords.',Woodcutting:'Chop trees for logs: plain, oak, maple and yew.',Mining:'Mine rocks for stone and ores: iron, gold, mithril, adamant and gems.',
 Foraging:'Pick berries, herbs and other wild things.',Cooking:'Cook meat and fish at a campfire or stove so they heal more and fill you up.',Firemaking:'Build campfires: they keep monsters away, cook food and light the night.',
 Crafting:'Make goods, building pieces, furniture, stations and gold jewelry.',Tactics:'Earned alongside combat. Unlocks tactical perks.',Defence:'Block hits and wear heavier armor.',Fishing:'Catch fish with a rod, from shrimp up to the rarest catches.',
 Smithing:'Smelt ore into bars at a furnace and forge weapons, armor, bows and wands at an anvil.',Farming:'Till soil, plant seeds, water and harvest crops.',Archery:'Shoot bows and make arrows (fletching).',Magic:'Cast fire, ice and storm spells with wands, and their ultimates.',
 Chess:'Play chess against the village club. Win to climb the ranks.'};
// monsters, by where you meet them (regional ones are listed from the islands' own spawn tables)
const WK_MOBS=[
 {n:'Slime',hp:3,w:'Hollow Island, at night',d:'Hops toward you in the dark. Campfires keep them away.',drop:'Gold, sometimes raw meat'},
 {n:'Wolf',hp:5,w:'The Sunken Tomb and the wilds',d:'Fast and comes in packs.',drop:'Wolf pelt (70%), gold'},
 {n:'Skeleton',hp:6,w:'The Sunken Tomb',d:'Throws bones from a distance. Block or dodge roll.',drop:'Gold'},
 {n:'Magma slime',hp:'9+',w:'Slime Caverns, floor 2 and deeper',d:'A tougher, burning slime from deep in the caverns.',drop:'Gold'},
 {n:'Snow wolf',hp:7,w:'Around Frosthollow and Frostfang Den',d:'A wolf of the snowy peaks.',drop:'Wolf pelt, gold'},
 {n:'Frost slime',hp:8,w:'Frostfang Den and the snow',d:'A chilly slime.',drop:'Gold'},
 {n:'Bat',hp:5,w:'Dungeons; islands at night',d:'Flutters in circles and swoops at you.',drop:'Gold'},
 {n:'Scorpion',hp:9,w:'Around Dusthaven and Scorpion Hollow',d:'Scuttles about, then lunges.',drop:'Gold'},
 {n:'Dust skeleton',hp:10,w:'The desert and Scorpion Hollow',d:'A sand-worn skeleton that throws bones.',drop:'Gold'},
 {n:'Beetle',hp:12,w:'The desert and Scorpion Hollow',d:'Armored and slow, but hits hard.',drop:'Gold'},
 {n:'Tide slime',hp:8,w:'Around Tidewatch and the Drowned Grotto',d:'Chases you in bursts.',drop:'Gold'},
 {n:'Crawler',hp:10,w:'The Drowned Grotto and the coast',d:'A crab that scuttles sideways.',drop:'Gold'},
 {n:'Guardian',hp:14,w:'Old ruins',d:'An ancient stone sentry.',drop:'Gold'}];
const WK_RGN={'wolf:briar':'Briar wolf','slime:moss':'Moss slime',bat:'Bat',scorp:'Scorpion','beetle:cinder':'Cinder beetle','skel:ember':'Ember skeleton','skel:dust':'Dust skeleton','wolf:snow':'Snow wolf','slime:frost':'Frost slime','skel:rime':'Rime skeleton',crab:'Crawler',guard:'Guardian','wolf:void':'Void wolf','slime:tide':'Tide slime'};
const WK_DUN=[
 {n:'Slime Caverns',w:'The northern mountains of Hollow Island',boss:'The Slime King',bhp:30,d:'Winding caves full of slimes, with magma slimes deeper down. The Slime King waits at the bottom.',loot:'120 gold and 3 iron ore (once a day)'},
 {n:'Sunken Tomb',w:'Buried in the southern desert of Hollow Island',boss:'The Bone Lord',bhp:45,d:'A tomb of skeletons. The Bone Lord throws bones and summons more skeletons. Bring arrows and dodge roll.',loot:'250 gold, 3 steel bars and 10 iron arrows (once a day)'},
 {n:'Frostfang Den',w:'Near Frosthollow in the snowy north',boss:'The Frostfang Alpha',bhp:38,d:'Three floors of snow wolves, frost slimes and bats. The Alpha circles you and calls its pack.',loot:'180 gold, 2 iron bars and a golden chest (once a day)'},
 {n:'Scorpion Hollow',w:'Near Dusthaven in the desert',boss:'The Sandclaw Matriarch',bhp:55,d:'Three floors of scorpions, dust skeletons and beetles. The Matriarch stalks you through the sand.',loot:'300 gold, 3 steel bars and a golden chest (once a day)'},
 {n:'Drowned Grotto',w:'Near Tidewatch on the coast',boss:'The Tidekeeper',bhp:48,d:'Three flooded floors of tide slimes and crawlers. The Tidekeeper rises from the water.',loot:'250 gold, 5 cooked salmon and a golden chest (once a day)'}];
const WK_RARE=[['Dragonsoul amulet','ja_dsoul','Ancient Dragon','Your ultimate becomes Dragon Form: turn into a small dragon for 2 minutes and hold attack to breathe fire. 1 minute cooldown.'],
 ['Imp (pet)',null,'Demon','A pet imp with a poison dagger. It attacks whatever hurts you and comes back a minute after it falls.'],
 ['Flame crown','eq_fcrown','Flame Wisp','A helmet. While you wear it, your campfires call a little flame wisp that roams the light and throws fireballs at monsters.'],
 ['Castle','castle','Stone Giant','Place it from your Bag like a house, on any island. Inside is a great hall to decorate. Two torches burn at the gate, and like a giant campfire it keeps monsters away and heals you in a wide circle.'],
 ['Pet wolf',null,'Wolf','A wolf with a red collar that follows you everywhere. Each kind of wolf drops its own: Wolf (Hollow), Briar wolf (Briarwood), Snow wolf (snow wolves) and Void wolf (Shattered Expanse).','1 in 1,000 from each wolf you defeat.'],
 ['Treeling (pet)',null,'Trees','A little walking tree that follows you around.','1 in 5,000 from every tree you chop down.']];
const WK_PAT={rain:'Fire rain: burning circles fall around it',ring:'Shockwave: a ring that spreads out from it (jump through by rolling)',rocks:'Falling rocks',meteors:'Meteors crash down all around',beams:'Beams of dark fire sweep out',pools:'Pools of fire on the ground',breath:'Breathes a cone of fire'};
{const st=document.createElement('style');st.textContent=`#sqwk{position:fixed;inset:0;z-index:96;display:none;flex-direction:column;align-items:center;background:rgba(10,20,40,.86);padding:calc(env(safe-area-inset-top,0px) + 10px) 10px calc(env(safe-area-inset-bottom,0px) + 10px);box-sizing:border-box;font-family:${PF}}
#sqwk .ww{width:100%;max-width:820px;height:100%;display:flex;flex-direction:column;background:#f8f8f8;color:#404040;border:4px solid #485870;box-shadow:inset 0 0 0 3px #a8c0e0,0 6px 0 rgba(0,0,0,.35);box-sizing:border-box;overflow:hidden}
#sqwk .wh{display:flex;align-items:center;gap:10px;padding:10px 12px 8px;background:linear-gradient(#5878b8,#3c5898);color:#f8f8f8;border-bottom:4px solid #283c68;flex:none}
#sqwk .wh b{font-size:clamp(17px,4.4vw,23px);letter-spacing:.12em;text-shadow:2px 2px 0 #1c2848;white-space:nowrap}
#sqwk .wh input{flex:1;min-width:0;font:500 15px ${PF};padding:6px 8px;border:3px solid #283c68;border-radius:0;background:#fff;color:#303030}
#sqwk .wh button{font:700 14px ${PF};padding:6px 10px;border:3px solid #f8f8f8;background:#283c68;color:#f8f8f8;cursor:pointer}
#sqwk .wt{display:flex;gap:6px;overflow-x:auto;padding:8px 10px;border-bottom:3px solid #d8e0f0;flex:none;scrollbar-width:thin}
#sqwk .wt button{flex:none;font:700 13px ${PF};padding:6px 10px;border:3px solid #485870;background:#f8f8f8;color:#404040;cursor:pointer;white-space:nowrap}
#sqwk .wt button.on{background:#485870;color:#fff}#sqwk .wt button.gpf,#sqwk .wh button.gpf{box-shadow:inset 0 0 0 3px #f8a020}
#sqwk .wb{flex:1;overflow-y:auto;padding:10px 12px;line-height:1.45}
#sqwk h3{margin:14px 0 6px;font-size:16px;letter-spacing:.06em;color:#3c5898;border-bottom:2px solid #d8e0f0;padding-bottom:3px}#sqwk h3:first-child{margin-top:2px}
#sqwk .c{display:flex;gap:10px;align-items:flex-start;padding:8px;border:2px solid #e0e6f0;background:#fff;margin:6px 0}
#sqwk .c img,#sqwk .c canvas{width:32px;height:32px;image-rendering:pixelated;flex:none;background:#eef2f8;border:2px solid #d0d8e8}
#sqwk .c img.mob{width:52px;height:52px;object-fit:contain}#sqwk .c .big{width:64px;height:auto;min-height:64px;background:#2a3048}
#sqwk .c .tx{flex:1;min-width:0;font-size:14px}#sqwk .c .tx b{font-size:15px;color:#283c68}#sqwk .c .tx small{color:#707888}
#sqwk .tag{display:inline-block;font-size:11px;font-weight:700;padding:1px 6px;margin:2px 4px 0 0;border:2px solid #485870;color:#485870;background:#f0f4fa}
#sqwk table{width:100%;border-collapse:collapse;font-size:13px;margin:4px 0 8px}#sqwk td,#sqwk th{padding:4px 6px;border-bottom:1px solid #e2e6ee;text-align:left;vertical-align:top}#sqwk th{background:#eef2f8;color:#485870}
#sqwk .lk{color:#3c5898;text-decoration:underline;cursor:pointer}#sqwk .emp{text-align:center;color:#707888;padding:30px 10px}
#sqwk select,#sqwk input[type=number]{font:600 14px ${PF};padding:3px 4px;border:2px solid #485870;border-radius:0;background:#fff;color:#303030}#sqwk p{margin:6px 0}#sqwk .wf{padding:6px 12px;font-size:11px;color:#808898;border-top:3px solid #d8e0f0;flex:none}`;document.head.appendChild(st)}
const wkEl=document.createElement('div');wkEl.id='sqwk';wkEl.innerHTML='<div class="ww"><div class="wh"><b>WIKI</b><input id="wkq" type="search" placeholder="Search everything..." aria-label="Search the wiki" autocomplete="off"><button data-wk="x">CLOSE</button></div><div class="wt" id="wkt"></div><div class="wb" id="wkb"></div><div class="wf">Item, recipe, skill, quest and boss details are read from the game itself, so they stay up to date.</div></div>';
document.body.appendChild(wkEl);for(const ev of['touchstart','pointerdown','mousedown'])wkEl.addEventListener(ev,e=>e.stopPropagation());
wkEl.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();wkClose()}});wkEl.addEventListener('keyup',e=>e.stopPropagation());
const wkE=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const wkName=k=>INAME[k]||(typeof IN!=='undefined'&&IN[k])||k;
const wkIcon=k=>{try{return EQ[k]&&typeof eqIcon==='function'?eqIcon(k):iconURL(k)}catch(e){return''}};
const wkLink=k=>'<span class="lk" data-wki="'+wkE(k)+'">'+wkE(wkName(k))+'</span>';
const wkCost=c=>Object.entries(c||{}).map(([a,b])=>b+' × '+wkLink(a)).join(', ');
const sk=n=>SKN.indexOf(n);
// every recipe in the game, in one shape: {out, n, sk, lv, xp, c, at}
function wkRecipes(){const R=[];
 for(const r of SM){const out=r.k||(r.arm?'eq_'+r.arm[0]+r.arm[1]:null);R.push({out,n:r.n,sk:'Smithing',lv:r.lv,xp:r.xp,c:r.c,at:r.smelt?'Furnace':'Anvil'})}
 for(const r of GOODS)R.push({out:r.k,n:r.n,sk:'Crafting',lv:r.req,xp:r.xp,c:r.c,at:'Crafting bench / Craft menu'});
 for(const r of BREC)R.push({out:r.k,n:r.n,sk:'Crafting',lv:r.req,xp:r.xp,c:r.c,at:'Craft menu (Building)'});
 for(const r of FREC){if(r.hide&&r.hide())continue;R.push({out:r.k,n:r.n,sk:'Archery',lv:r.lv,xp:r.xp,c:r.c,at:'Craft menu (Fletching)'})}
 for(const r of COOKS)R.push({out:r.ck,n:'Cooked '+r.n,sk:'Cooking',lv:r.lv,xp:r.xp,c:{[r.raw]:1},at:'Campfire or stove'});
 if(window.SQJWL)for(const j of SQJWL)R.push({out:j.k,n:j.n,sk:'Crafting',lv:j.lv,xp:j.xp,c:Object.assign({gbar:j.b},j.g?{[j.g]:1}:{}),at:'Furnace (Jewelry)'});
 return R}
function wkCards(tab,srch){if(WK2[tab]&&!(srch&&tab==='skills'))return WK2[tab]();const out=[];const card=(t,ic,tx,big)=>out.push({t,h:'<div class="c">'+(ic?ic.startsWith('<')?ic:'<img alt="" src="'+ic+'"'+(big?' class="'+(big==='mob'?'mob':'big')+'"':'')+'>':'')+'<div class="tx">'+tx+'</div></div>'}),head=t=>out.push({t:'',h:'<h3>'+wkE(t)+'</h3>',head:1});
 if(tab==='patch'){for(const p of PATCH_NOTES)card(p.t+' '+p.v+' '+p.n.join(' '),'','<b>'+wkE(p.t)+'</b> <span class="tag">'+wkE(p.d)+'</span><small> version '+wkE(p.v)+'</small><ul style="margin:6px 0 0;padding-left:18px">'+p.n.map(x=>'<li style="margin:3px 0">'+wkE(x)+'</li>').join('')+'</ul>');wkMarkSeen()}
 else if(tab==='start'){
  out.push({t:'start',h:'<h3>Welcome to SkillQuest</h3><p>Explore Hollow Island and the islands beyond, train 15 skills, fight monsters and bosses, build a home and play with friends.</p>'+
   '<table><tr><th>Do this</th><th>PC</th><th>Phone</th><th>Controller</th></tr><tr><td>Move</td><td>WASD / arrows</td><td>Drag anywhere</td><td>Left stick</td></tr><tr><td>Hit, chop, mine, fish</td><td>Space / left-click</td><td>HIT</td><td>R2</td></tr>'+
   '<tr><td>Talk, use, read</td><td>T / Enter</td><td>TALK</td><td>✕</td></tr><tr><td>Bow or wand</td><td>Right-click</td><td>HIT (auto-aims)</td><td>R1</td></tr><tr><td>Ultimate</td><td>V</td><td>ULT</td><td>L1 + R1</td></tr><tr><td>Dodge roll</td><td>R</td><td>ROLL</td><td>○</td></tr>'+
   '<tr><td>Eat</td><td>E</td><td>EAT</td><td>□</td></tr><tr><td>Campfire</td><td>F</td><td>FIRE</td><td>△</td></tr><tr><td>Menu</td><td>Esc</td><td>MENU</td><td>Options</td></tr></table>'+
   '<h3>Tips</h3><p>• Night brings monsters. A campfire keeps them away and cooks your food.</p><p>• Food keeps your hunger up; cooked food heals more.</p><p>• Talk to Elder Rowan in Hollow Village for your first quests, and to townsfolk for daily jobs.</p><p>• Buy a boat to sail to the small islands; upgrade it to reach Briarwood, Ashfall, Ironcrest and the Shattered Expanse.</p><p>• Sign in to play online: chat, trade, visit friends\' houses, fight world bosses together and climb the leaderboards.</p>'})}
 else if(tab==='skills'){for(let i=0;i<SKN.length;i++){const n=SKN[i],T=typeof TREES!=='undefined'&&TREES[i];let h='<b>'+wkE(n)+'</b><br>'+wkE(WK_SKILL[n]||'');
   if(T&&T.choices){h+='<br><small>Perks (pick one at each level):</small><table>';for(const lv of Object.keys(T.choices).sort((a,b)=>a-b)){const ch=T.choices[lv];h+='<tr><td><b>'+lv+'</b></td><td>'+ch.map(p=>'<b>'+wkE(p.n)+'</b>: '+wkE(p.d)).join('<br>')+'</td></tr>'}h+='</table>'}
   if(T&&T.extra){const ex=Object.entries(T.extra);if(ex.length)h+='<small>Unlocks: '+ex.map(([l,t])=>'Lv '+l+' '+wkE(t)).join(' · ')+'</small>'}
   card(n,'',h)}}
 else if(tab==='items'){const R=wkRecipes(),made={},used={};for(const r of R){if(r.out)(made[r.out]=made[r.out]||[]).push(r);for(const k in r.c)(used[k]=used[k]||new Set()).add(r.out)}
  const keys=Object.keys(INAME).filter(k=>INAME[k]&&!/^_/.test(k)).sort((a,b)=>String(INAME[a]).localeCompare(String(INAME[b])));
  for(const k of keys){let d='';try{d=IDESC[k]||''}catch(e){}const sp=typeof SELLP!=='undefined'&&SELLP[k];
   let h='<b>'+wkE(INAME[k])+'</b>'+(sp?' <small>· sells for '+sp+' gold</small>':'')+'<br>'+wkE(d);
   if(made[k])h+='<br><small>Made: '+made[k].map(r=>r.at+' · '+r.sk+' '+r.lv+' · '+wkCost(r.c)).join(' | ')+'</small>';
   if(used[k]){const u=[...used[k]].filter(Boolean);if(u.length)h+='<br><small>Used to make: '+u.slice(0,12).map(wkLink).join(', ')+(u.length>12?' and more':'')+'</small>'}
   card(INAME[k]+' '+k+' '+d,wkIcon(k),h)}}
 else if(tab==='craft'){const R=wkRecipes(),by={};for(const r of R)(by[r.at]=by[r.at]||[]).push(r);
  for(const at in by){head(at);let h='<table><tr><th>Makes</th><th>Level</th><th>Needs</th><th>XP</th></tr>';for(const r of by[at].sort((a,b)=>a.lv-b.lv))h+='<tr><td>'+(r.out&&INAME[r.out]?wkLink(r.out):wkE(r.n))+'</td><td>'+wkE(r.sk)+' '+r.lv+'</td><td>'+wkCost(r.c)+'</td><td>'+r.xp+'</td></tr>';
   out.push({t:at+' '+by[at].map(r=>r.n).join(' '),h:h+'</table>'})}
  head('Farming');let h='<table><tr><th>Crop</th><th>Level</th><th>Seed</th><th>XP</th></tr>';for(const k in CROPS){const c=CROPS[k];h+='<tr><td>'+wkE(c.n)+'</td><td>Farming '+c.lv+'</td><td>'+(INAME[c.seed]?wkLink(c.seed):wkE(c.seed))+'</td><td>'+c.xp+'</td></tr>'}out.push({t:'farming crops '+Object.values(CROPS).map(c=>c.n).join(' '),h:h+'</table>'});
  head('Fishing');h='<table><tr><th>Fish</th><th>Level</th><th>XP</th><th>Cooked heals</th></tr>';for(const f of FISH_T)h+='<tr><td>'+(INAME[f.k]?wkLink(f.k):wkE(f.n))+'</td><td>Fishing '+f.lv+'</td><td>'+f.xp+'</td><td>'+(f.heal||0)+' heart'+(f.heal===1?'':'s')+'</td></tr>';out.push({t:'fishing fish '+FISH_T.map(f=>f.n).join(' '),h:h+'</table>'})}
 else if(tab==='mobs'){head('Hollow Island & its dungeons');for(const m of WK_MOBS)card(m.n+' '+m.w,WK_MK[m.n]?wkPic(m.n,WK_MK[m.n]):'','<b>'+wkE(m.n)+'</b> <span class="tag">'+m.hp+' HP</span><br>'+wkE(m.d)+'<br><small>Where: '+wkE(m.w)+' · Drops: '+wkE(m.drop)+'</small>','mob');
  if(typeof RG_FAUNA!=='undefined')for(const id in RG_FAUNA){const F=RG_FAUNA[id],R=WORLD_REGIONS[id];head((R?R.name:id)+(R&&R.lv?' (level '+R.lv+')':''));const seen={};
   for(const[when,L]of[['Day',F.day],['Night',F.night]])for(const e of L){const k=e[0];const s=seen[k]||(seen[k]={hp:e[1],when:[]});s.when.push(when)}
   for(const k in seen){const nm=WK_RGN[k]||k;card(nm+' '+(R?R.name:id),wkPic('rg_'+k,()=>rgMake(k,seen[k].hp,0,0)),'<b>'+wkE(nm)+'</b> <span class="tag">'+seen[k].hp+' HP</span>'+(F.pack&&F.pack[k]?' <span class="tag">packs of '+F.pack[k]+'</span>':'')+'<br><small>'+seen[k].when.join(' and ')+' · stronger than on Hollow; more gold and XP</small>','mob')}}}
 else if(tab==='bosses'){head('World bosses');out.push({t:'',h:'<p>A world boss appears every 30 minutes somewhere in the world and stays for 20. Everyone fights it together; the top three damage dealers get extra loot. Online only.</p>'});
  const T=window.SQWBT||{};for(const k in T){const b=T[k];let pic='';try{const c=SQWBART[k](0,'s'),u=c.toDataURL();pic=u}catch(e){}
   const rare=WK_RARE.filter(r=>r[2]===b.n||(k==='dragon'&&r[2]==='Ancient Dragon'));
   card(b.n+' '+k,pic,'<b>'+wkE(b.n)+'</b> <span class="tag">'+b.hp+' HP</span><br><small>Appears on: '+b.where.map(w=>w==='hollow'?'Hollow Island':(WORLD_REGIONS[w]?WORLD_REGIONS[w].name:w)).join(', ')+' · Gold: '+b.gold[0]+'–'+b.gold[1]+'</small><br>Attacks: '+[...new Set(b.pats)].map(p=>wkE(WK_PAT[p]||p)).join('; ')+'.'+
    (rare.length?'<br><span class="tag">RARE DROP'+(rare.length>1?'S':'')+'</span> '+rare.map(r=>r[1]?wkLink(r[1]):wkE(r[0])).join(', ')+' ('+(rare.length>1?'each ':'')+'5%, 8% for the top three)':''),true)}
  head('Dungeon bosses');for(const d of WK_DUN)card(d.boss+' '+d.n,WK_BOSSMK[d.boss]?wkPic(d.boss,WK_BOSSMK[d.boss],64):'','<b>'+wkE(d.boss)+'</b> <span class="tag">'+d.bhp+' HP</span><br><small>In '+wkE(d.n)+' · '+wkE(d.loot)+'</small>','mob')}
 else if(tab==='dungeons'){out.push({t:'',h:'<p>Dungeons are deep, dark places with treasure chests, tougher monsters and a boss at the bottom. Each boss can be beaten once a day. The last floor has an exit door that takes you back outside.</p>'});
  for(const d of WK_DUN)card(d.n+' '+d.w+' '+d.boss,WK_BOSSMK[d.boss]?wkPic(d.boss,WK_BOSSMK[d.boss],64):'','<b>'+wkE(d.n)+'</b><br>'+wkE(d.d)+'<br><small>Where: '+wkE(d.w)+(d.bhp?'<br>Boss: '+wkE(d.boss)+' ('+d.bhp+' HP) · Reward: ':'<br>No boss · Reward: ')+wkE(d.loot)+'</small>','mob')}
 else if(tab==='quests'){head('Elder Rowan (Hollow Village)');QS.forEach((q,i)=>card(q.n+' '+q.d,'','<b>'+(i+1)+'. '+wkE(q.n)+'</b><br>'+wkE(q.d)+'<br><small>Reward: '+wkE(typeof rewardTxt==='function'?rewardTxt(q):'')+'</small>'));
  if(typeof SIDE_QS!=='undefined')for(const t in SIDE_QS){const L=SIDE_QS[t];if(!L.length)continue;head((typeof SQTOWN!=='undefined'&&SQTOWN[t]||t)+' side quests');
   L.forEach((q,i)=>card(q.n+' '+q.d,'','<b>'+(i+1)+'. '+wkE(q.n)+'</b><br>'+wkE(q.d)+(q.note?' '+wkE(q.note):'')+'<br><small>Given by '+wkE(typeof sqGiverName==='function'?sqGiverName(q.giver):q.giver)+' · Reward: '+wkE(typeof sqReward==='function'?sqReward(q):'')+(q.req?' · Needs '+SKN[q.req[0]]+' '+q.req[1]:'')+'</small>'))}
  out.push({t:'daily jobs',h:'<h3>Daily jobs</h3><p>Townsfolk in Hollow Village and Saltmere ask for a small favor every day. Bring them what they need for gold and XP.</p>'})}
 else if(tab==='world'){head('Islands');for(const id in WORLD_REGIONS){const R=WORLD_REGIONS[id];card(R.name+' '+R.biome,'','<b>'+wkE(R.name)+'</b>'+(R.lv?' <span class="tag">level '+wkE(R.lv)+'</span>':'')+'<br>'+wkE(R.biome)+(R.hint?'<br><small>How to get there: '+wkE(R.hint)+'</small>':''))}
  if(typeof ISLES!=='undefined'){head('Small islands (by boat from Hollow)');card('small islands '+ISLES.map(i=>i.name).join(' '),'','<b>'+ISLES.map(i=>wkE(i.name)).join(' · ')+'</b><br><small>Sail out from the Hollow Island docks once you own a boat.</small>')}
  if(typeof TOWN_REG!=='undefined'){head('Towns');for(const t of TOWN_REG){const R=WORLD_REGIONS[t.regionId];card(t.name,'','<b>'+wkE(t.name)+'</b><br><small>'+wkE(R?R.name:'')+'</small>')}}}
 else if(tab==='pets'){head('Rare drops');for(const r of WK_RARE)card(r[0]+' '+r[2],r[1]?wkIcon(r[1]):'','<b>'+wkE(r[0])+'</b> <span class="tag">'+wkE(r[2])+'</span><br>'+wkE(r[3])+'<br><small>'+(r[4]||('5% from the '+wkE(r[2])+' (8% if you\'re in the top three).'))+'</small>');
  head('Pets from Marlo\'s Emporium');const P=window.LUX&&LUX.PETS||[];for(const p of P)if(!p.rare)card(p.n+' pet','','<b>'+wkE(p.n)+'</b> <span class="tag">'+p.v.toLocaleString('en-US')+' gold</span><br><small>Follows you everywhere. Other players see it too. It\'s an item: put it in your PET slot from your Bag or the equipment screen.</small>')}
 return out}
function wkRender(){const t=wk$('wkt'),b=wk$('wkb'),q=WK.q.trim().toLowerCase();
 t.innerHTML=WK_TABS.map(([k,n])=>'<button data-wkt="'+k+'" class="'+(k===WK.tab&&!q?'on':'')+'">'+wkE(n)+'</button>').join('');
 let h='';if(!q){const cs=wkCards(WK.tab);h=cs.map(c=>c.h).join('')}
 else{for(const[k,n]of WK_TABS){if(k==='start'||k==='patch')continue;const cs=wkCards(k,1).filter(c=>!c.head&&(c.t+' '+c.h.replace(/<[^>]+>/g,' ')).toLowerCase().includes(q));if(cs.length)h+='<h3>'+wkE(n)+' ('+cs.length+')</h3>'+cs.slice(0,40).map(c=>c.h).join('')}
  if(!h)h='<div class="emp">Nothing matches "'+wkE(WK.q)+'".</div>'}
 b.innerHTML=h||'<div class="emp">Nothing here yet.</div>';if(wk$('wkxr'))wkXpCalc()}
function wkOpen(tab,q){WK.open=true;if(tab)WK.tab=tab;else if(wkNew())WK.tab='patch';WK.q=q||'';wk$('wkq').value=WK.q;wkEl.style.display='flex';wkRender();wk$('wkb').scrollTop=0;try{sfx('talk')}catch(e){}
 setTimeout(()=>{const f=wkEl.querySelector('.wt button.on');if(f&&typeof GPON!=='undefined'&&(GPON||TS.kb))setFocus(f)},30)}
function wkClose(){WK.open=false;wkEl.style.display='none';try{setFocus(null)}catch(e){}try{sfx('talk')}catch(e){}if(TS.open&&TS.stage){const b=tsMn.querySelector('[data-a="wk"]');if(b&&(GPON||TS.kb))setFocus(b)}}
wkEl.addEventListener('click',e=>{const b=e.target.closest('[data-wk],[data-wkt],[data-wki],[data-wks]');if(!b)return;if(b.dataset.wk==='x'){wkClose();return}
 if(b.dataset.wks){WK.sk=+b.dataset.wks;wkRender();return}
 if(b.dataset.wkt){WK.tab=b.dataset.wkt;WK.q='';wk$('wkq').value='';wkRender();wk$('wkb').scrollTop=0;b.scrollIntoView({block:'nearest',inline:'center'});return}
 if(b.dataset.wki){const k=b.dataset.wki;WK.q=String(INAME[k]||k);wk$('wkq').value=WK.q;wkRender();wk$('wkb').scrollTop=0}});
wkEl.addEventListener('input',e=>{if(e.target&&/^wkx/.test(e.target.id))wkXpCalc()});wkEl.addEventListener('change',e=>{if(e.target&&/^wkx/.test(e.target.id))wkXpCalc()});
wk$('wkq').addEventListener('input',()=>{WK.q=wk$('wkq').value;wkRender();wk$('wkb').scrollTop=0});
{const _nr=navRoot;navRoot=function(){if(WK.open)return wkEl;return _nr()}}
// on the title menu (next to the leaderboards) and in the START menu
{const _m=tsMenu;tsMenu=function(){_m();if(tsMn.querySelector('[data-a="wk"]'))return;const o=tsMn.querySelector('[data-a="opt"]');if(!o)return;const b=document.createElement('button');b.dataset.a='wk';b.textContent=wkNew()?'WIKI · NEW!':'WIKI';o.before(b)}}
tsMn.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.dataset.a==='wk')wkOpen()});
SMI.splice(SMI.findIndex(x=>x.id==='options'),0,{id:'wiki',l:()=>wkNew()?'Wiki · NEW!':'Wiki'});
{const _ss=showScreen;showScreen=function(id){if(id==='wiki'){try{if(typeof releaseMenu==='function')releaseMenu()}catch(e){}wkOpen();return}return _ss(id)}}
// ---- Wiki, part 2: guides, an XP table and calculator, shops, NPCs, island maps, monster pictures, a skill picker ----
const WK2={};
// how to train each skill (what gives XP, and how much)
const WK_TRAIN={Attack:[['Defeat monsters','12 XP each'],['Hit a training dummy (up to level 30)','4 XP per hit']],
 Woodcutting:[['Tree','25 XP'],['Pine','28 XP']],Mining:[['Rock (stone)','18 XP'],['Iron rock','40 XP']],Foraging:[['Berry bush','10 XP'],['Cactus','14 XP']],
 Firemaking:[['Build a campfire (3 wood + 1 stone)','40 XP']],Defence:[['Block a hit','10 XP'],['Quest rewards','see Quests']],Tactics:[['Fighting: earned alongside Attack','']],
 Magic:[['Hit monsters with spells','4 XP per damage'],['Kill with a spell','14 XP']],Archery:[['Hit with arrows','3 XP per damage'],['Kill with an arrow','14 XP']],Chess:[['Play the chess club in Hollow Village','more for wins and harder opponents']]};
function wkActions(skill){const A=[];const add=(n,xp,lv,c)=>{if(xp>0)A.push({n,xp,lv:lv||1,c})};
 for(const[n,x]of(WK_TRAIN[skill]||[])){const m=/^(\d+) XP/.exec(x);if(m)add(n,+m[1],1)}
 const T=window.SQTIER||{};for(const k in T){const t=T[k];if(SKN[t.sk]===skill)add((INAME[t.item]||k).replace(/ (logs|ore)$/,'')+(t.base==='tree'?' tree':' rock'),t.xp,t.lv)}
 for(const r of wkRecipes())if(r.sk===skill)add(r.n,r.xp,r.lv,r.c);
 if(skill==='Fishing')for(const f of FISH_T)add(f.n,f.xp,f.lv);
 if(skill==='Farming')for(const k in CROPS){const c=CROPS[k];add(c.n,c.xp,c.lv)}
 return A.sort((a,b)=>a.lv-b.lv||a.xp-b.xp)}
const xpAt=l=>XT[Math.max(0,Math.min(98,l-1))]|0;
// a picture of a monster: drawn by the game's own code onto the screen for an instant, then copied
const WKPIC={};function wkPic(key,mk,box){if(WKPIC[key])return WKPIC[key];try{const n=mk();n.x=2000;n.y=2000;n.dead=0;const S=3,B=box||40,px=B*S;
  const o=document.createElement('canvas');o.width=px;o.height=px;g.save();g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,px,px);g.setTransform(S,0,0,S,-(n.x-B/2)*S,-(n.y-B*.62)*S);GC=g;
  pS(n,.4);g.restore();const ox=o.getContext('2d');ox.drawImage(cv,0,0,px,px,0,0,px,px);
  // crop to the monster itself (a square around it)
  const d=ox.getImageData(0,0,px,px).data;let x0=px,y0=px,x1=-1,y1=-1;for(let y=0;y<px;y++)for(let x=0;x<px;x++)if(d[(y*px+x)*4+3]>40){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<0)return WKPIC[key]='';const sz=Math.max(x1-x0,y1-y0)+8,c2=document.createElement('canvas');c2.width=c2.height=sz;c2.getContext('2d').drawImage(o,x0-Math.round((sz-(x1-x0))/2),y0-Math.round((sz-(y1-y0))/2),sz,sz,0,0,sz,sz);
  return WKPIC[key]=c2.toDataURL()}catch(e){g.restore&&g.restore();return WKPIC[key]=''}}
const WK_MK={Slime:()=>({hp:3,kx:0,ky:0,type:'slime'}),Wolf:()=>({hp:5,kx:0,ky:0,type:'wolf'}),Skeleton:()=>({hp:6,kx:0,ky:0,type:'skel',tcd:9}),'Magma slime':()=>({hp:9,kx:0,ky:0,type:'slime',vr:'magma'}),
 'Snow wolf':()=>mkSnowWolf(0,0),'Frost slime':()=>mkFrostSlime(0,0),Bat:()=>mkBat(0,0),Scorpion:()=>mkScorp(0,0),'Dust skeleton':()=>mkDustSkel(0,0),Beetle:()=>mkBeetle(0,0),'Tide slime':()=>mkTideSlime(0,0),Crawler:()=>mkCrawler(0,0),Guardian:()=>mkGuardian(0,0)};
const WK_BOSSMK={'The Slime King':()=>({hp:30,mhp:30,kx:0,ky:0,type:'boss'}),'The Bone Lord':()=>({hp:45,mhp:45,kx:0,ky:0,type:'bonelord',tcd:9,scd:9}),'The Frostfang Alpha':()=>({hp:38,mhp:38,kx:0,ky:0,type:'alpha',big:1,as:'circle',at:2,ang:0,combo:0,scd:9,rcd:9,dmg:2}),
 'The Sandclaw Matriarch':()=>({hp:55,mhp:55,kx:0,ky:0,type:'matri',big:1,ms:'stalk',mt:1.5,seq:[],bcd:9,dmg:2}),'The Tidekeeper':()=>({hp:48,mhp:48,kx:0,ky:0,type:'tidek',big:1,ks:'move',kt:1.5,ang:0,bcd:9,scd:9,dmg:2})};
// shops (prices as sold)
function wkShops(){const S=[];const L=(t,who,where,items,note)=>S.push({t,who,where,items,note});
 L('General Store','Shopkeeper','Hollow Village',GEN.map(x=>[x.n,x.c]),'Also buys almost anything you carry.');
 L('Blacksmith','Blacksmith','Hollow Village',[['Wooden axe / pickaxe / sword',8],['Stone axe / pickaxe / sword',30],['Iron axe / pickaxe / sword',90],['Leather helmet / chestplate / legs','15 / 25 / 20'],['Iron helmet / chestplate / legs','60 / 120 / 90 (Defence 10)'],['Steel helmet / chestplate / legs','200 / 400 / 300 (Defence 20)'],['Iron ore',20]],'Sells the next tier up of each tool and armor piece. Buys iron and stone at a better price. Also has a furnace and an anvil.');
 L('Saltmere Harbor','Captain Ida','Saltmere',[['Sailboat',250]],'Boat upgrades and sea-route quests start here (see Guides).');
 L('Saltmere Tackle','Gil','Saltmere',[['10 bait',15],['50 bait',65],['Fishing rod',10]],'Pays extra for fish.');
 L('The Gull\'s Rest','Rosa','Saltmere',[['Fish stew',12],['5 fish stews',55],['A bed for the night / a rest',15]]);
 L('Saltmere Forge','Brann','Saltmere',[['Steel axe / pickaxe / sword',STEELC.b+' steel bars + '+STEELC.g+' gold']],'Bring an iron tool to upgrade it.');
 if(typeof TRADER!=='undefined'&&TRADER)L('Desert Trader','Trader','The southern desert',[['Iron ore',18],['5 iron ore',85]],'Buys wolf pelts (24 gold) and bones (9 gold).');
 L('Hermit\'s wares','Old Hermit','Hermit\'s Isle',HSHOP.map(([k,c])=>[EQ[k]?EQ[k].n:k,c]),'Wands and wizard clothes.');
 for(const[T,town]of[[typeof FHSHOP!=='undefined'?FHSHOP:null,'Frosthollow'],[typeof DHSHOP!=='undefined'?DHSHOP:null,'Dusthaven'],[typeof TWSHOP!=='undefined'?TWSHOP:null,'Tidewatch']]){if(!T)continue;
  for(const id in T){const s=T[id];const nm=(NPCS.find(n=>n.id===s.who)||{}).name||s.who;L(s.title,nm,town,s.items.map(i=>[i[1],i[2]]))}}
 const E=window.LUX&&LUX.EMP;if(E){L('Marlo\'s Emporium','Marlo','Hollow Village',[].concat(E.PETS.filter(p=>!p.rare).map(p=>[p.n+' (pet)',p.v]),E.CAPES.map(c=>[c.n+' cape',c.v]),[['Dye (any of '+E.DYES.length+' colors)',E.DYEV]],E.FURN2.map(f=>[f.n,f.v]),E.POTS.map(p=>[p.n,p.v])),'Pets, capes and dyes are used from START > Style.')}
 return S}
const WK_ROLE={gen:'General Store',smith:'Blacksmith',elder:'Gives the main quests',chess:'Chess club',trader:'Desert Trader',harbor:'Harbor master: sells the sailboat, sea routes and boat upgrades',tackle:'Fishing shop',inn:'Inn: food and beds',forge:'Steel tools',emporium:'Marlo\'s Emporium: pets, capes, dyes, fine furniture, potions'};
function wkNpcs(){const out=[],seen=new Set();for(const n of NPCS){const nm=n.name||{gen:'Shopkeeper',smith:'Blacksmith',elder:'Elder Rowan',chess:'Chess club',trader:'Desert Trader'}[n.kind]||n.kind;if(seen.has(nm))continue;seen.add(nm);
  const shop=(typeof FHSHOP!=='undefined'&&FHSHOP[n.work])||(typeof DHSHOP!=='undefined'&&DHSHOP[n.work])||(typeof TWSHOP!=='undefined'&&TWSHOP[n.work]);
  let where=n.isle||(n.kind==='fhfolk'?'Frosthollow':n.kind==='dhfolk'?'Dusthaven':n.kind==='twfolk'?'Tidewatch':n.kind==='trader'?'The southern desert':(n.room&&n.room.startsWith('hv'))||['gen','smith','elder','chess','emporium'].includes(n.kind)?'Hollow Village':'Saltmere');
  let role=WK_ROLE[n.kind]||(shop?shop.title:'Townsfolk');if(n.id==='hermit')role='Sells wands and wizard clothes';
  const quests=[];for(const t in (typeof SIDE_QS!=='undefined'?SIDE_QS:{}))for(const q of SIDE_QS[t])if(q.giver===n.id)quests.push(q.n);
  const jobs=typeof JOBS!=='undefined'&&JOBS[n.id]&&JOBS[n.id].length;out.push({nm,where,role,quests,jobs})}return out}
WK2.guides=()=>{const out=[];const G=(t,h)=>out.push({t:t+' '+h.replace(/<[^>]+>/g,' '),h:'<div class="c"><div class="tx"><b>'+wkE(t)+'</b>'+h+'</div></div>'});
 G('Your first day','<p>Chop trees (HIT) for wood and pick berries to eat. Before night, build a campfire (F: 3 wood + 1 stone): monsters stay away from it, and you can cook meat on it. Visit Elder Rowan in Hollow Village for your first quests.</p>');
 G('Getting a boat','<p>Walk to Saltmere (the harbor town) and talk to Captain Ida. She sells a sailboat for 250 gold. Face the water and press USE to set sail. Nearby: Gull Rock (north-east), a shipwreck (south-east) and Hermit\'s Isle.</p>');
 let h='<p>Each new island is unlocked by a sea-route quest from a harbor post, in this order:</p><table><tr><th>Route</th><th>Where</th><th>What to do</th><th>Reward</th></tr>';
 for(const v of (typeof VOYS!=='undefined'?VOYS:[]))h+='<tr><td><b>'+wkE(v.name)+'</b></td><td>'+wkE(v.post[0].toUpperCase()+v.post.slice(1))+'</td><td>'+wkE(v.d)+'<br><small>'+v.steps.map(wkE).join(' → ')+(v.needs.some(x=>x[0]==='@')?'<br>Needs the '+v.needs.filter(x=>x[0]==='@').map(x=>wkE((UPGRADES.find(u=>u.id===x.slice(1))||{}).name)).join(', '):'')+'</small></td><td>'+v.gold+' gold</td></tr>';
 h+='</table><p><b>Boat upgrades</b></p><table>';for(const u of (typeof UPGRADES!=='undefined'?UPGRADES:[]))h+='<tr><td><b>'+wkE(u.name)+'</b><br><small>'+wkE(u.d)+'</small></td><td>'+wkE(u.post[0].toUpperCase()+u.post.slice(1))+'</td><td>'+wkCost(u.cost)+'</td></tr>';
 G('Unlocking the islands',h+'</table>');
 G('Making gold','<p>• Daily jobs from townsfolk in Hollow Village and Saltmere.<br>• Sell logs, ore and bars: oak, maple and yew logs and mithril/adamant bars sell well.<br>• Gil in Saltmere pays extra for fish; the Desert Trader buys wolf pelts and bones.<br>• Dungeon bosses (once a day each) and world bosses pay hundreds of gold.<br>• Smith gear and sell it, or craft jewelry with gold bars and gems.</p>');
 G('World bosses','<p>Every 30 minutes a world boss appears for 20 minutes (the chat tells you where). Everyone who hits it shares the fight; watch the red warning circles, rings and beams, and dodge roll through them. When it falls, everyone who helped gets loot, more for the top three, plus a small chance at its rare drop.</p>');
 G('Building a home','<p>Make a house at the Craft menu (Building), stand where the door should go and place it. Walk in to decorate with furniture and stations (furnace, anvil, stove, wardrobe...). Sleep in your bed to wake up there. You can build houses on any island. Friends can visit; mark them TRUSTED (Chat > Friends) to let them use your stations, chests and beds.</p>');
 G('Playing with friends','<p>Sign in with Google from the title screen. Add friends from Chat > Friends, message them, trade (stand next to them), and team up on world bosses. PvP is opt-in from the START menu; towns are safe zones. If you fall, your items wait in a grave for 15 minutes.</p>');
 G('Rare drops','<p>Each world boss has a rare drop (5%, or 8% for the top three): the Dragonsoul amulet (Dragon), the Imp pet (Demon) and the Flame crown (Flame Wisp). See Pets & Rares.</p>');
 return out};
WK2.xp=()=>{const opt=SKN.map((n,i)=>'<option value="'+i+'"'+(i===(WK.xs|0)?' selected':'')+'>'+wkE(n)+'</option>').join(''),i=WK.xs|0,cur=lvOf(i);
 let h='<div class="c"><div class="tx"><b>XP calculator</b><p>Skill <select id="wkxs">'+opt+'</select> from level <input id="wkxa" type="number" min="1" max="98" value="'+(WK.xa||cur)+'" style="width:56px"> to <input id="wkxb" type="number" min="2" max="99" value="'+(WK.xb||Math.min(99,cur+1))+'" style="width:56px"></p><div id="wkxr"></div></div></div>';
 h+='<h3>XP table</h3><table><tr><th>Level</th><th>Total XP</th><th>Level</th><th>Total XP</th><th>Level</th><th>Total XP</th></tr>';for(let r=0;r<33;r++){h+='<tr>';for(let c=0;c<3;c++){const l=r+1+c*33;h+=l<=99?'<td><b>'+l+'</b></td><td>'+xpAt(l).toLocaleString('en-US')+'</td>':'<td></td><td></td>'}h+='</tr>'}
 return[{t:'xp calculator table level',h:h+'</table>'}]};
function wkXpCalc(){const r=wk$('wkxr');if(!r)return;const i=+wk$('wkxs').value,a=Math.max(1,Math.min(98,+wk$('wkxa').value|0)),b=Math.max(a+1,Math.min(99,+wk$('wkxb').value|0));WK.xs=i;WK.xa=a;WK.xb=b;
 const need=xpAt(b)-Math.max(xpAt(a),a===lvOf(i)?XPS[i]:0);let h='<p><b>'+need.toLocaleString('en-US')+' XP</b> to go from '+SKN[i]+' '+a+' to '+b+'.</p>';const A=wkActions(SKN[i]);
 if(A.length){h+='<table><tr><th>Doing</th><th>XP each</th><th>How many</th></tr>';for(const x of A)h+='<tr style="opacity:'+(x.lv<=b?1:.45)+'"><td>'+wkE(x.n)+(x.lv>1?' <small>(level '+x.lv+')</small>':'')+'</td><td>'+x.xp+'</td><td><b>'+Math.ceil(need/x.xp).toLocaleString('en-US')+'</b></td></tr>';h+='</table>'}
 r.innerHTML=h}
WK2.shops=()=>wkShops().map(s=>({t:s.t+' '+s.who+' '+s.where+' '+s.items.map(i=>i[0]).join(' '),h:'<div class="c"><div class="tx"><b>'+wkE(s.t)+'</b> <span class="tag">'+wkE(s.where)+'</span><br><small>'+wkE(s.who)+(s.note?' · '+wkE(s.note):'')+'</small><table>'+s.items.map(([n,c])=>'<tr><td>'+wkE(n)+'</td><td style="text-align:right;white-space:nowrap">'+wkE(typeof c==='number'?c.toLocaleString('en-US')+' gold':c+(/gold|\d$/.test(String(c))&&!/gold/.test(String(c))?' gold':''))+'</td></tr>').join('')+'</table></div></div>'}));
WK2.npcs=()=>{const L=wkNpcs(),by={};for(const n of L)(by[n.where]=by[n.where]||[]).push(n);const out=[];
 for(const w in by){out.push({t:'',h:'<h3>'+wkE(w)+'</h3>',head:1});for(const n of by[w])out.push({t:n.nm+' '+n.role+' '+w+' '+n.quests.join(' '),h:'<div class="c"><div class="tx"><b>'+wkE(n.nm)+'</b><br>'+wkE(n.role)+(n.jobs?' · daily jobs':'')+(n.quests.length?'<br><small>Quests: '+n.quests.map(wkE).join(', ')+'</small>':'')+'</div></div>'})}return out};
// island maps with numbered landmarks
const WKMAP={};function wkMapImg(id){if(WKMAP[id]&&(id!=='hollow'||performance.now()-WKMAP[id].at<60000))return WKMAP[id];const r=wkMapImg2(id);if(r){r.at=performance.now();WKMAP[id]=r}return r}
function wkMapImg2(id){const D=WORLD_REGIONS[id];let src=null,marks=[];
 if(id==='hollow'){src=typeof hollowMapCanvas==='function'?hollowMapCanvas():null;
  for(const t of (typeof TOWN_REG!=='undefined'?TOWN_REG:[]))if(t.regionId==='hollow'&&t.x>=0)marks.push([t.x,t.y,t.name,'#f8d848']);
  for(const t of (typeof EXTRA_TOWNS!=='undefined'?EXTRA_TOWNS:[]))if(!marks.some(m=>m[2]===t.name))marks.push([t.x,t.y,t.name,'#f8d848']);
  for(const d of (typeof DUNGEON_REG!=='undefined'?DUNGEON_REG:[]))if(d.regionId==='hollow'&&d.x>=0)marks.push([d.x,d.y,d.name,'#f05050']);
  for(const s of (typeof ISLES!=='undefined'?ISLES:[]))marks.push([s.x,s.y,s.name,'#58d8ff'])}
 else{const th=typeof rgThumb==='function'?rgThumb(id):null;if(!th)return null;const c=document.createElement('canvas');c.width=th.w;c.height=th.h;const x=c.getContext('2d'),im=x.createImageData(th.w,th.h);new Uint32Array(im.data.buffer).set(th.T);x.putImageData(im,0,0);src=c;
  for(const l of th.lms||[])marks.push([l.x,l.y,l.name,'#f8f8f8']);if(th.dock)marks.push([th.dock[0],th.dock[1],'Dock','#58d8ff']);
  for(const t of (typeof TOWN_REG!=='undefined'?TOWN_REG:[]))if(t.regionId===id&&t.x>=0)marks.push([t.x,t.y,t.name,'#f8d848'])}
 if(!src)return null;const S=Math.max(2,Math.floor(440/Math.max(src.width,src.height))),o=document.createElement('canvas');o.width=src.width*S;o.height=src.height*S;const x=o.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(src,0,0,o.width,o.height);
 x.font='700 11px '+PF;x.textAlign='center';x.textBaseline='middle';marks.forEach((m,i)=>{const px=m[0]*S,py=m[1]*S;x.fillStyle='#101828';x.beginPath();x.arc(px,py,8,0,6.283);x.fill();x.fillStyle=m[3];x.beginPath();x.arc(px,py,6.5,0,6.283);x.fill();x.fillStyle='#101828';x.fillText(String(i+1),px,py+.5)});
 return{url:o.toDataURL(),marks}}
WK2.maps=()=>{const out=[];let pending=false;for(const id in WORLD_REGIONS){const R=WORLD_REGIONS[id],m=wkMapImg(id);
  if(!m){pending=true;out.push({t:R.name,h:'<h3>'+wkE(R.name)+'</h3><div class="emp">Drawing the map...</div>'});continue}
  out.push({t:R.name+' '+m.marks.map(k=>k[2]).join(' '),h:'<h3>'+wkE(R.name)+'</h3><img alt="Map of '+wkE(R.name)+'" src="'+m.url+'" style="display:block;width:100%;max-width:440px;margin:6px auto;image-rendering:pixelated;border:3px solid #485870;background:#1d3f7a"><p style="font-size:13px">'+m.marks.map((k,i)=>'<b>'+(i+1)+'</b> '+wkE(k[2])).join(' · ')+'</p>'})}
 if(pending)setTimeout(()=>{if(WK.open&&WK.tab==='maps'&&!WK.q.trim())wkRender()},400);
 return[{t:'',h:'<p style="font-size:13px"><span style="color:#c8a020">●</span> towns · <span style="color:#d03838">●</span> dungeons · <span style="color:#3898c8">●</span> islands and docks · <span style="color:#888">●</span> landmarks</p>'}].concat(out)};
// skills: pick one at a time
WK2.skills=()=>{const i=Math.min(SKN.length-1,WK.sk|0),n=SKN[i],T=typeof TREES!=='undefined'&&TREES[i],col=(typeof SKC!=='undefined'&&SKC[i])||'#485870';
 let h='<div class="wt" style="flex-wrap:wrap;border:0;padding:0 0 8px">'+SKN.map((s,j)=>'<button data-wks="'+j+'" class="'+(j===i?'on':'')+'" style="'+(j===i?'background:'+(SKC[j]||'#485870')+';border-color:#202838':'')+'">'+wkE(s)+'</button>').join('')+'</div>';
 h+='<div class="c" style="border-color:'+col+'"><div class="tx"><b style="font-size:18px">'+wkE(n)+'</b> <span class="tag">your level '+lvOf(i)+'</span><p>'+wkE(WK_SKILL[n]||'')+'</p>';
 const A=wkActions(n);if(A.length)h+='<b>Training</b><table><tr><th>Do</th><th>Level</th><th>XP</th></tr>'+A.slice(0,40).map(x=>'<tr><td>'+wkE(x.n)+'</td><td>'+x.lv+'</td><td>'+x.xp+'</td></tr>').join('')+'</table>';
 else if(WK_TRAIN[n])h+='<b>Training</b><table>'+WK_TRAIN[n].map(([a,b])=>'<tr><td>'+wkE(a)+'</td><td>'+wkE(b)+'</td></tr>').join('')+'</table>';
 if(T&&T.choices){h+='<b>Perks</b> <small>(at each level you pick one; change them in the Skills screen)</small><table>';for(const lv of Object.keys(T.choices).sort((a,b)=>a-b))h+='<tr><td><b>'+lv+'</b></td><td>'+T.choices[lv].map(p=>'<b>'+wkE(p.n)+'</b>: '+wkE(p.d)).join('<br>')+'</td></tr>';h+='</table>'}
 if(T&&T.extra){const ex=Object.entries(T.extra);if(ex.length)h+='<b>Unlocks</b><table>'+ex.map(([l,t])=>'<tr><td><b>'+l+'</b></td><td>'+wkE(t)+'</td></tr>').join('')+'</table>'}
 return[{t:SKN.join(' '),h:h+'</div></div>'}]};
window.SQWK={open:wkOpen,close:wkClose,cards:wkCards};
addEventListener('keydown',e=>{if(WK.open&&e.key==='Escape'&&!TS.open){e.preventDefault();e.stopImmediatePropagation();wkClose()}},true);
