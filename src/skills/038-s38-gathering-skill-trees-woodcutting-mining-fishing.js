// ---------------------------------------------------------------- 38. Gathering skill trees: Woodcutting, Mining, Fishing, Foraging, Farming
// Built from the gathering spec. Every level: +0.5% speed; every 5 levels: +1% extra-yield chance; every 15: +1% rare
// chance; one-off boosts at 25/35/55/65/75/85/95; a perk choice every 10 levels and at 99. Reworked to fit the game:
// "speed" = time between swings (chop/mine/gather), bite wait (fishing), growth rate (farming); "stamina" = FOOD;
// "more before depletion" = a chance the tree/rock/bush stays standing; invented tools/resources are replaced by
// the game's real unlocks. Rare finds: Heartwood (trees), gems (rocks), rainbow fish (any water), Wild honey
// (bushes/cacti), Golden produce (crops).
// --- new rare items ---
const GTH={heartwood:{n:'Heartwood',v:60,d:'Rare, deep-amber wood from the heart of an old tree. Sells for a good price.'},honey:{n:'Wild honey',v:30,d:'A rare forager\'s find. Eat it to heal 2 hearts and fill up.'},goldcrop:{n:'Golden produce',v:120,d:'A rare, gleaming crop. Sells for a lot of gold.'}};
for(const k in GTH){const e=GTH[k];INVK.push(k);EXTRA_BAG.push(k);INAME[k]=e.n;IDESC[k]=e.d;SELLP[k]=e.v;SN[k]=e.n;SHORT[k]=e.n.toLowerCase()}
FOODS.push({k:'honey',n:'wild honey',heal:2,hun:50});FOODS.sort((a,b)=>b.heal-a.heal||b.hun-a.hun);
const _ic38=iconURL;iconURL=function(k,col){if(!GTH[k])return _ic38(k,col);const key='g38'+k;if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
 if(k==='heartwood'){r(1,5,12,5,'#8a3a14');r(1,5,12,1,'#c8642a');r(2,6,2,3,'#f0a050');r(3,7,1,1,'#7a2a0a');r(11,6,1,3,'#5a1e08')}
 else if(k==='honey'){r(4,2,6,2,'#c89838');r(3,4,8,8,'#e8a020');r(4,5,6,6,'#f8c848');r(5,6,2,2,'#fff0a0');r(3,12,8,1,'#a87010')}
 else{r(5,2,4,2,'#3a8a3a');r(3,4,8,7,'#d8a018');r(4,5,6,5,'#f8d848');r(5,6,2,2,'#fff8c0');r(4,11,6,1,'#a07010')}
 return ICONC[key]=c.toDataURL()};
// --- tree data ---
const GSK={1:{sp:'chopping speed',ex:'extra-log chance',ra:'rare-wood chance (Heartwood)'},2:{sp:'mining speed',ex:'extra-ore chance',ra:'gem chance'},9:{sp:'fishing speed',ex:'extra-fish chance',ra:'rare-fish chance (rainbow fish, anywhere)'},
 3:{sp:'gathering speed',ex:'extra-item chance',ra:'rare-ingredient chance (Wild honey)'},11:{sp:'crop growth speed',ex:'extra-crop chance',ra:'rare-crop chance (Golden produce)'}};
function gTree(sk,unlocks,choices){const G=GSK[sk],fmt=v=>(Math.round(v*10)/10)+'%';
 // combined per-level numbers, e.g. level 25 = +4% extra (+1 every-5, +3 one-off), level 35 = +5.5% speed
 const sp=l=>l===1?0:.5+(l===35||l===75?5:0),ex=l=>(l%5===0?1:0)+(l===25||l===55?3:0)+(l===95?5:0),ra=l=>(l%15===0?1:0)+(l===65||l===85?2:0);
 return{every:()=>null,extra:{},step:l=>{const a=[];if(unlocks[l])a.push(unlocks[l]);if(l===1)a.push('Base '+G.sp+' 100%');else a.push('+'+fmt(sp(l))+' '+G.sp);if(ex(l))a.push('+'+fmt(ex(l))+' '+G.ex);if(ra(l))a.push('+'+fmt(ra(l))+' '+G.ra);return a},
  choices:Object.fromEntries(Object.entries(choices).map(([l,[A,B]])=>[l,[{id:A[0],n:A[1],d:A[2]},{id:B[0],n:B[1],d:B[2]}]]))}}
TREES[1]=gTree(1,{1:'Chop trees, pines and cacti with any axe'},{
 10:[['wc_rush','Timber Rush','Chop trees 10% faster.'],['wc_heavy','Heavy Harvest','10% chance to receive an extra log.']],
 20:[['wc_eye','Forest Eye','+5% chance to find rare wood.'],['wc_swift','Swift Swing','Chopping speed increases 15%.']],
 30:[['wc_double','Double Timber','8% chance to double a wood harvest.'],['wc_bark','Lucky Bark','10% chance to find bonus berries or a seed in the branches.']],
 40:[['wc_steady','Steady Hands','Your FOOD drains 20% slower while you\'re chopping.'],['wc_roots','Deep Roots','15% chance a felled tree stays standing, ready to chop again.']],
 50:[['wc_grain','Golden Grain','Rare wood (Heartwood) sells for 25% more gold.'],['wc_recover','Quick Recovery','20% less recovery time between chops.']],
 60:[['wc_fortune','Timber Fortune','12% chance to double a wood harvest.'],['wc_bounty','Forest Bounty','15% chance to find extra wood (+2 logs).']],
 70:[['wc_master','Master Lumberjack','Chop trees 20% faster.'],['wc_rare','Rare Timber','+10% chance to find rare wood.']],
 80:[['wc_endless','Endless Forest','25% chance a felled tree stays standing, ready to chop again.'],['wc_strike','Double Strike','15% chance to receive two harvests from one tree.']],
 90:[['wc_wisdom','Ancient Wisdom','+15% chance to find rare wood.'],['wc_relent','Relentless Swing','Chopping speed increases 25%.']],
 99:[['wc_sov','Forest Sovereign','Every 5th tree you fell grants double logs.'],['wc_legend','Timber Legend','Chop 35% faster; rare-wood chance increases 20%.']]});
TREES[2]=gTree(2,{1:'Mine rocks for stone',5:'Mine iron veins (stone pickaxe or better)',15:'Rocks can also give iron ore (stone pickaxe or better)'},{
 10:[['mn_strike','Heavy Strike','Mine rocks 10% faster.'],['mn_fortune','Ore Fortune','10% chance to receive an extra ore.']],
 20:[['mn_seeker','Gem Seeker','Gem discovery chance increases 5%.'],['mn_quick','Quick Pick','Mining speed increases 15%.']],
 30:[['mn_double','Double Ore','8% chance to double an ore harvest.'],['mn_breaker','Stone Breaker','Your FOOD drains 20% slower while you\'re mining.']],
 40:[['mn_veins','Deep Veins','15% chance a mined rock stays put, ready to mine again.'],['mn_crystal','Crystal Eye','Gem discovery chance increases 8%.']],
 50:[['mn_touch','Golden Touch','Stone, ores and gems sell for 20% more gold.'],['mn_rapid','Rapid Mining','Mining recovery time decreases 20%.']],
 60:[['mn_rich','Rich Deposits','12% chance to double an ore harvest.'],['mn_hidden','Hidden Treasure','10% chance to find bonus minerals (stone or iron ore).']],
 70:[['mn_master','Master Miner','Mining speed increases 20%.'],['mn_gemf','Gem Fortune','Gem discovery chance increases 10%.']],
 80:[['mn_endless','Endless Veins','25% chance a mined rock stays put, ready to mine again.'],['mn_dstrike','Double Strike','15% chance to receive two harvests from one rock.']],
 90:[['mn_cmaster','Crystal Master','Gem discovery chance increases 15%.'],['mn_relent','Relentless Pick','Mining speed increases 25%.']],
 99:[['mn_sov','Mountain Sovereign','Every 5th rock you break grants double ore.'],['mn_legend','Treasure Legend','Mine 35% faster; gem discovery chance increases 20%.']]});
TREES[9]=gTree(9,{1:'Catch shrimp',10:'Catch trout',20:'Catch salmon',35:'Catch swordfish'},{
 10:[['fs_hook','Quick Hook','Catch fish 10% faster.'],['fs_dcatch','Double Catch','10% chance to catch an extra fish.']],
 20:[['fs_lucky','Lucky Waters','Rare-fish chance increases 5%.'],['fs_patient','Patient Angler','Fish escape 20% less often.']],
 30:[['fs_net','Net Master','8% chance to double a fish harvest.'],['fs_swift','Swift Reel','Fishing speed increases 15%.']],
 40:[['fs_deep','Deep Waters','Rare-fish chance increases 8%.'],['fs_bait','Bait Saver','20% chance not to use up bait.']],
 50:[['fs_gold','Golden Catch','Fish sell for 25% more gold.'],['fs_rapid','Rapid Reel','After a catch, the next bite comes 20% sooner.']],
 60:[['fs_ocean','Ocean Bounty','12% chance to double a fish harvest.'],['fs_treasure','Treasure Hook','10% chance to hook bonus fishing materials (bait or an ancient coin).']],
 70:[['fs_master','Master Angler','Fishing speed increases 20%.'],['fs_rare','Rare Hunter','Rare-fish chance increases 10%.']],
 80:[['fs_endless','Endless Bait','35% chance not to use up bait.'],['fs_haul','Double Haul','15% chance to receive two catches at once.']],
 90:[['fs_legend_w','Legendary Waters','Rare-fish chance increases 15%.'],['fs_relent','Relentless Reel','Fishing speed increases 25%.']],
 99:[['fs_sov','Ocean Sovereign','Every 5th successful catch grants double fish.'],['fs_legend','Fishing Legend','Fish 35% faster; rare-fish chance increases 20%.']]});
TREES[3]=gTree(3,{1:'Pick berries from bushes and fruit from cacti'},{
 10:[['fg_quick','Quick Gather','Gather wild resources 10% faster.'],['fg_berry','Berry Bounty','10% chance to receive an extra berry.']],
 20:[['fg_eye','Herbal Eye','Rare-ingredient chance increases 5%.'],['fg_light','Light Feet','Your FOOD drains 20% slower while you\'re gathering.']],
 30:[['fg_double','Double Harvest','8% chance to double a foraging harvest.'],['fg_scout','Forest Scout','Gathering speed increases 15%.']],
 40:[['fg_abund','Wild Abundance','15% chance a picked plant grows straight back.'],['fg_finder','Rare Finder','Rare-ingredient chance increases 8%.']],
 50:[['fg_gold','Golden Harvest','Berries and wild honey sell for 25% more gold.'],['fg_hands','Swift Hands','Gathering recovery time decreases 20%.']],
 60:[['fg_nature','Nature Bounty','12% chance to double a foraging harvest.'],['fg_hidden','Hidden Ingredients','10% chance to find a bonus ingredient (a seed).']],
 70:[['fg_master','Master Forager','Gathering speed increases 20%.'],['fg_fortune','Herbal Fortune','Rare-ingredient chance increases 10%.']],
 80:[['fg_endless','Endless Growth','25% chance a picked plant grows straight back.'],['fg_dgather','Double Gather','15% chance to receive two harvests at once.']],
 90:[['fg_ancient','Ancient Knowledge','Rare-ingredient chance increases 15%.'],['fg_relent','Relentless Gather','Gathering speed increases 25%.']],
 99:[['fg_sov','Nature Sovereign','Every 5th plant you pick grants double items.'],['fg_legend','Foraging Legend','Gather 35% faster; rare-ingredient chance increases 20%.']]});
TREES[11]=gTree(11,{1:'Grow wheat',5:'Grow carrots',15:'Grow pumpkins'},{
 10:[['fm_rapid','Rapid Growth','Crops grow 10% faster.'],['fm_double','Double Harvest','10% chance to receive an extra crop.']],
 20:[['fm_gseeds','Golden Seeds','Rare-crop chance increases 5%.'],['fm_soil','Healthy Soil','Crops need watering 20% less often.']],
 30:[['fm_rich','Rich Harvest','8% chance to double a crop harvest.'],['fm_swift','Swift Growth','Crops grow 15% faster.']],
 40:[['fm_roots','Deep Roots','Hardy crops: dry crops keep growing at a quarter of their speed.'],['fm_bloom','Rare Bloom','Rare-crop chance increases 8%.']],
 50:[['fm_gold','Golden Harvest','Crops sell for 25% more gold.'],['fm_water','Farmhand\'s Stamina','Your FOOD drains 25% slower while you\'re farming.']],
 60:[['fm_bounty','Farmer\'s Bounty','12% chance to double a crop harvest.'],['fm_seed','Seed Saver','20% chance to recover an extra seed when harvesting.']],
 70:[['fm_master','Master Farmer','Crops grow 20% faster.'],['fm_cult','Rare Cultivator','Rare-crop chance increases 10%.']],
 80:[['fm_endless','Endless Harvest','Crops produce 25% more.'],['fm_yield','Double Yield','15% chance to receive two harvests from one crop.']],
 90:[['fm_ancient','Ancient Growth','Rare-crop chance increases 15%.'],['fm_relent','Relentless Growth','Crops grow 25% faster.']],
 99:[['fm_sov','Harvest Sovereign','Every 5th crop you harvest grants double produce.'],['fm_legend','Farming Legend','Crops grow 35% faster; rare-crop chance increases 20%.']]});
// --- the numbers ---
const P_=(sk,id)=>perk(sk,id);
const GSPD={1:[['wc_rush',.1],['wc_swift',.15],['wc_master',.2],['wc_relent',.25],['wc_legend',.35]],2:[['mn_strike',.1],['mn_quick',.15],['mn_master',.2],['mn_relent',.25],['mn_legend',.35]],
 9:[['fs_hook',.1],['fs_swift',.15],['fs_master',.2],['fs_relent',.25],['fs_legend',.35]],3:[['fg_quick',.1],['fg_scout',.15],['fg_master',.2],['fg_relent',.25],['fg_legend',.35]],
 11:[['fm_rapid',.1],['fm_swift',.15],['fm_master',.2],['fm_relent',.25],['fm_legend',.35]]};
const GEXT={1:[['wc_heavy',.1]],2:[['mn_fortune',.1]],9:[['fs_dcatch',.1]],3:[['fg_berry',.1]],11:[['fm_double',.1]]};
const GRAR={1:[['wc_eye',.05],['wc_rare',.1],['wc_wisdom',.15],['wc_legend',.2]],2:[['mn_seeker',.05],['mn_crystal',.08],['mn_gemf',.1],['mn_cmaster',.15],['mn_legend',.2]],
 9:[['fs_lucky',.05],['fs_deep',.08],['fs_rare',.1],['fs_legend_w',.15],['fs_legend',.2]],3:[['fg_eye',.05],['fg_finder',.08],['fg_fortune',.1],['fg_ancient',.15],['fg_legend',.2]],
 11:[['fm_gseeds',.05],['fm_bloom',.08],['fm_cult',.1],['fm_ancient',.15],['fm_legend',.2]]};
const GDBL={1:[['wc_double',.08],['wc_fortune',.12],['wc_strike',.15]],2:[['mn_double',.08],['mn_rich',.12],['mn_dstrike',.15]],9:[['fs_net',.08],['fs_ocean',.12],['fs_haul',.15]],
 3:[['fg_double',.08],['fg_nature',.12],['fg_dgather',.15]],11:[['fm_rich',.08],['fm_bounty',.12],['fm_yield',.15]]};
const sumP=(sk,L)=>(L[sk]||[]).reduce((a,[id,v])=>a+(P_(sk,id)?v:0),0);
function gSpeed(sk){const l=lvOf(sk);return .005*(l-1)+(l>=35?.05:0)+(l>=75?.05:0)+sumP(sk,GSPD)}
function gExtra(sk){const l=lvOf(sk);return .01*Math.floor(l/5)+(l>=25?.03:0)+(l>=55?.03:0)+(l>=95?.05:0)+sumP(sk,GEXT)}
function gRare(sk){const l=lvOf(sk);return .01*Math.floor(l/15)+(l>=65?.02:0)+(l>=85?.02:0)+sumP(sk,GRAR)}
const gDouble=sk=>sumP(sk,GDBL);
const SOVN={1:0,2:0,9:0,3:0,11:0},SOVID={1:'wc_sov',2:'mn_sov',9:'fs_sov',3:'fg_sov',11:'fm_sov'};
const gTxt=(x,y,t,c)=>drops.push({x,y,t:0,tx:t,c:c||'#ffffff'});
// one harvest: extra / double / sovereign on the main item(s), then a rare roll. Returns a short list of what was added.
function gBoost(sk,gains,x,y){const add=(k,n)=>{inv[k]=(inv[k]|0)+n};let j=0;const tag=t=>gTxt(x,y-10-(j++)*7,t,SKC[sk]);
 const main=Object.entries(gains).filter(([,n])=>n>0);if(!main.length)return;
 if(Math.random()<gExtra(sk)){const[k]=main[0];add(k,1);tag('+1 '+iname(k))}
 let dbl=Math.random()<gDouble(sk);if(P_(sk,SOVID[sk])&&++SOVN[sk]>=5){SOVN[sk]=0;dbl=true}
 if(dbl){for(const[k,n]of main)add(k,n);tag('Double!')}
 if(Math.random()<gRare(sk)){const rk=sk===1?'heartwood':sk===3?'honey':sk===11?'goldcrop':sk===2?(r=>r<.45?'ruby':r<.8?'sapphire':r<.95?'emerald':'diamond')(Math.random()):null;
  if(rk){add(rk,1);gTxt(x,y-30,'RARE: '+iname(rk),'#58a8ff');say('Rare find: '+iname(rk)+'!');sfx('quest')}}}
// FOOD drains slower right after the matching activity
const ACTW={1:0,2:0,3:0,11:0},FOODP={1:['wc_steady',.2],2:['mn_breaker',.2],3:['fg_light',.2],11:['fm_water',.25]};
// --- chopping, mining and gathering (all go through HIT on the thing in front of you) ---
const SKOF={tree:1,pine:1,rock:2,ore:2,bush:3,cactus:3},STAYP={1:[['wc_roots',.15],['wc_endless',.25]],2:[['mn_veins',.15],['mn_endless',.25]],3:[['fg_abund',.15],['fg_endless',.25]]},
 RECP={1:'wc_recover',2:'mn_rapid',3:'fg_hands'};
const GITEMS=['wood','stone','iron','berry'];
const _atk38=attack;attack=function(){const sw0=swing,[ox,oy]=frontObjTile(),oi=oy*N+ox,o=ox>=0&&oy>=0&&ox<N&&oy<N?obj[oi]:null,oh=o?o.hp:0,inv0=GITEMS.map(k=>inv[k]|0);_atk38();
 if(!o||!SKOF[o.t]||!(swing>sw0))return;const now=obj[oi];if(now&&now.hp>=oh)return;const sk=SKOF[o.t];
 swing/=(1+gSpeed(sk));if(P_(sk,RECP[sk]))swing*=.8;ACTW[sk]=10;
 if(now)return;// still standing: just a hit
 const gains={};GITEMS.forEach((k,j)=>{const d=(inv[k]|0)-inv0[j];if(d>0)gains[k]=d});const x=ox*16+8,y=oy*16;
 gBoost(sk,gains,x,y);
 if(sk===1){if(P_(1,'wc_bark')&&Math.random()<.1){if(Math.random()<.5){inv.berry=(inv.berry|0)+2;gTxt(x,y-38,'+2 berries','#f05878')}else{inv.wheatseed=(inv.wheatseed|0)+1;gTxt(x,y-38,'+1 wheat seed','#c8a060')}}
  if(P_(1,'wc_bounty')&&Math.random()<.15){inv.wood=(inv.wood|0)+2;gTxt(x,y-38,'+2 wood','#48c048')}}
 if(sk===2&&P_(2,'mn_hidden')&&Math.random()<.1){if(Math.random()<.5){inv.stone=(inv.stone|0)+2;gTxt(x,y-38,'+2 stone','#90a8d0')}else{inv.iron=(inv.iron|0)+1;gTxt(x,y-38,'+1 iron ore','#90a8d0')}}
 if(sk===3&&P_(3,'fg_hidden')&&Math.random()<.1){const sd=['wheatseed','carrotseed','pumpkinseed'][Math.floor(Math.random()*3)];inv[sd]=(inv[sd]|0)+1;gTxt(x,y-38,'+1 '+iname(sd),'#e060a0')}
 if(Math.random()<sumP(sk,STAYP)){obj[oi]={t:o.t,hp:OHP[o.t]||3};for(let j=REM.length-1;j>=0;j--)if(REM[j].i===oi)REM.splice(j,1);gTxt(x,y-46,sk===3?'It grows straight back!':'Still standing!',SKC[sk])}};
// --- fishing ---
const FISHK=()=>[...FISH_T.map(f=>f.k),'rainbow'];
const fBaitSave=()=>(P_(9,'fs_bait')?.2:0)+(P_(9,'fs_endless')?.35:0);
const _cf38=catchFish;catchFish=function(){if(!FISH)return _cf38();const ks=FISHK(),b0=ks.map(k=>inv[k]|0),bait0=inv.bait|0;_cf38();if(!FISH)return;
 const gains={};ks.forEach((k,j)=>{const d=(inv[k]|0)-b0[j];if(d>0)gains[k]=d});
 if(!Object.keys(gains).length&&P_(9,'fs_patient')&&Math.random()<.2){const L=lvOf(9),open=FISH_T.filter(f=>L>=f.lv);let ix=open.length-1;while(ix>0&&Math.random()<.5)ix--;const f=open[ix];inv[f.k]=(inv[f.k]|0)+1;addXp(9,f.xp);gains[f.k]=1;say('Patience pays off: you land '+(f.k==='shrimp'?'some shrimp':'a '+f.n.toLowerCase())+'!')}
 if(Object.keys(gains).length){gBoost(9,gains,FISH.bx,FISH.by);
  if(Math.random()<gRare(9)){inv.rainbow=(inv.rainbow|0)+1;addXp(9,150);gTxt(FISH.bx,FISH.by-30,'RARE: Rainbow fish','#58a8ff');say('A RAINBOW FISH! It shimmers in every color.');sfx('quest')}
  if(P_(9,'fs_treasure')&&Math.random()<.1){if(Math.random()<.6){inv.bait=(inv.bait|0)+2;gTxt(FISH.bx,FISH.by-38,'+2 bait','#c8a060')}else{inv.coin=(inv.coin|0)+1;gTxt(FISH.bx,FISH.by-38,'+1 Ancient coin','#f8d848')}}
  if(P_(9,'fs_rapid'))FISH.wait*=.8}
 if((inv.bait|0)<bait0&&Math.random()<fBaitSave())inv.bait++;
 FISH.wait/=(1+gSpeed(9))};
const _atk38b=attack;attack=function(){const had=!!FISH,bait0=inv.bait|0;_atk38b();if(!had&&FISH){FISH.wait/=(1+gSpeed(9));if((inv.bait|0)<bait0&&Math.random()<fBaitSave())inv.bait++}};
// --- farming ---
const _hv38=harvest;harvest=function(i,p){const c=p.c,C=CROPS[c],n0=inv[c]|0,s0=inv[C.seed]|0;_hv38(i,p);const d=(inv[c]|0)-n0,x=(i%N)*16+8,y=((i/N)|0)*16;ACTW[11]=10;if(d<=0)return;
 if(P_(11,'fm_endless')){const more=Math.floor(d*.25)+(Math.random()<(d*.25)%1?1:0);if(more){inv[c]+=more;gTxt(x,y-38,'+'+more+' '+iname(c),SKC[11])}}
 gBoost(11,{[c]:d},x,y);if(P_(11,'fm_seed')&&Math.random()<.2){inv[C.seed]=(inv[C.seed]|0)+1;gTxt(x,y-46,'+1 '+iname(C.seed),'#c8a060')}};
const _atk38c=attack;attack=function(){const[fx,fy]=front(13),i=Math.floor(fy/16)*N+Math.floor(fx/16),p=FARM.get(i),w0=p?p.w:0;_atk38c();const q=FARM.get(i);
 if(q&&q.w>w0&&P_(11,'fm_soil'))q.w=CLK+Math.round(WATER_FOR*1.2);if(q&&(q.w>w0||(!p&&q)))ACTW[11]=10};
// growth speed, hardy crops, and the FOOD perks
const _u38=upd;upd=function(dt){_u38(dt);if(menuOpen||pnOpen)return;const gs=gSpeed(11),hardy=P_(11,'fm_roots');
 for(const[,p]of FARM){if(!p.c||ripe(p))continue;if(wet(p))p.g+=dt*gs;else if(hardy)p.g+=dt*.25*(1+gs)}
 let save=0;for(const sk in ACTW){if(ACTW[sk]>0){ACTW[sk]-=dt;const f=FOODP[sk];if(f&&P_(+sk,f[0]))save=Math.max(save,f[1])}}if(save&&!dead&&hunger>0)hunger=Math.min(100,hunger+dt*.9*FOOD_RATE*save)};
// --- selling perks: a bonus on top of any shop's price ---
const SELLB=[[1,'wc_grain',.25,['heartwood']],[2,'mn_touch',.2,['stone','iron','goldore','mithore','adamore','ruby','sapphire','emerald','diamond']],[9,'fs_gold',.25,()=>[...FISHK(),...FISH_T.map(f=>'c'+f.k),'crainbow']],
 [3,'fg_gold',.25,['berry','honey']],[11,'fm_gold',.25,['wheat','carrot','pumpkin','goldcrop']]];
let SELL0=null;
pbd.addEventListener('click',()=>{SELL0={g:GLD,inv:{...inv}};setTimeout(()=>{const S0=SELL0;SELL0=null;if(!S0||GLD<=S0.g)return;const dg=GLD-S0.g;let bonus=0;
 for(const[sk,id,pct,keys]of SELLB){if(!P_(sk,id))continue;const ks=typeof keys==='function'?keys():keys;for(const k of ks)if((S0.inv[k]|0)>0&&(inv[k]|0)===0){bonus+=Math.round(dg*pct)}}
 if(bonus>0){GLD+=bonus;drops.push({x:P.x,y:P.y-26,t:0,tx:'+'+bonus+' gold (perk)',c:'#f8d848'});saveLocal(true);if(pnOpen)rPn()}},0)},true);
