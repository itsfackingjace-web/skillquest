// ---------------------------------------------------------------- 39. Production skill trees: Cooking, Firemaking, Smithing, Crafting
// Built from the production spec, in the same shape as section 38: every level +0.5% speed, every 5 levels +1% to the
// second stat, every 15 levels +1% to the third, one-off boosts at 25/35/55/65/75/85/95, a perk choice every 10 levels
// and at 99. Reworked to fit the game:
//  - cooking, smithing, crafting and lighting fires are instant, so "speed" = bonus XP for that skill;
//  - "stamina" = FOOD (drains slower right after smithing / crafting, like the gathering perks);
//  - "X% fewer materials, rounded up" = each material used has an X% chance to come back (same saving on average,
//    and it still works on 1-ingredient recipes);
//  - there's no charcoal or fuel-adding, so those perks act on smelting and on building campfires;
//  - "warmth" = the healing ring around a fire, "firelight" = its glow and the ring that keeps monsters away;
//  - invented recipes and unlocks are replaced by the game's real ones (read from the recipe lists).
const P39=(sk,id)=>perk(sk,id),lv39=lvOf,pct39=v=>(Math.round(v*1000)/10)+'%';
const PSK={4:{sp:'cooking speed',ex:'burn prevention',ra:'FOOD from cooked meals',e:[3,3,5],r:2},5:{sp:'fire-starting speed',ex:'campfire burn time',ra:'fuel-saving chance',e:[5,5,5],r:3},
 10:{sp:'smithing speed',ex:'bar-saving chance',ra:'bonus-item chance',e:[3,3,5],r:2},6:{sp:'crafting speed',ex:'material-saving chance',ra:'bonus-item chance',e:[3,3,5],r:2}};
function pTree(sk,unlocks,choices){const G=PSK[sk],fmt=v=>(Math.round(v*10)/10)+'%';
 const sp=l=>l===1?0:.5+(l===35||l===75?5:0),ex=l=>(l%5===0?1:0)+(l===25?G.e[0]:l===55?G.e[1]:l===95?G.e[2]:0),ra=l=>(l%15===0?1:0)+(l===65||l===85?G.r:0);
 return{every:()=>null,extra:{},step:l=>{const a=[];if(unlocks[l])a.push(unlocks[l]);if(l===1)a.push('Base '+G.sp+' 100%');else a.push('+'+fmt(sp(l))+' '+G.sp);
   if(ex(l))a.push('+'+fmt(ex(l))+' '+G.ex);if(ra(l))a.push('+'+fmt(ra(l))+' '+G.ra);return a},
  choices:Object.fromEntries(Object.entries(choices).map(([l,[A,B]])=>[l,[{id:A[0],n:A[1],d:A[2]},{id:B[0],n:B[1],d:B[2]}]]))}}
// --- real unlocks, read from the game's recipe lists ---
const UL39=(list,lvf,txt)=>{const o={};for(const r of list){const l=Math.max(1,lvf(r)|0);(o[l]=o[l]||[]).push(txt(r))}for(const l in o)o[l]=o[l].join(', ');return o};
const ckName=c=>c.raw==='meat'?'meat':c.raw==='wheat'?'bread (wheat)':c.raw==='carrot'?'roast carrots':c.raw==='pumpkin'?'pumpkin pie':c.n;
const ulCook=UL39(COOKS,c=>c.lv,ckName);for(const l in ulCook)ulCook[l]='Cook '+ulCook[l];
const ulSmith=UL39(SM,r=>r.lv,r=>(r.smelt?'Smelt ':'Forge ')+r.n.toLowerCase()+(r.def?' (wear at Defence '+r.def+')':''));
const ulCraft=UL39([...REC.map(r=>({n:r.name,l:r.req})),...GOODS.map(r=>({n:r.n,l:r.req})),...BREC.map(r=>({n:r.n,l:r.req}))],r=>r.l,r=>r.n);for(const l in ulCraft)ulCraft[l]='Make: '+ulCraft[l];
const X39='';
TREES[4]=pTree(4,ulCook,{
 10:[['co_steady','Steady Flame','+10% burn prevention.'],['co_quick','Quick Cook','Cook food 10% faster'+X39.replace('bonus','+10%')+'.']],
 20:[['co_hearty','Hearty Meals','Cooked food restores 5% more FOOD.'],['co_saver','Ingredient Saver','10% chance to refund one consumed ingredient.']],
 30:[['co_double','Double Serving','8% chance to produce two meals instead of one.'],['co_timing','Perfect Timing','Cook food 15% faster'+X39.replace('bonus','+15%')+'.']],
 40:[['co_safe','Safe Cooking','+15% burn prevention.'],['co_rich','Rich Flavor','Cooked meals restore 8% more FOOD.']],
 50:[['co_gold','Golden Recipes','Cooked meals sell for 20% more gold.'],['co_eff','Efficient Cooking','Recipes use 10% fewer ingredients: each ingredient has a 10% chance to come back.']],
 60:[['co_feastm','Feast Maker','12% chance to produce an extra cooked meal.'],['co_lasting','Lasting Meals','After you eat a cooked meal, your FOOD drains 10% slower for 60 seconds.']],
 70:[['co_master','Master Chef','Cook food 20% faster'+X39.replace('bonus','+20%')+'.'],['co_perfect','Perfect Meals','Cooked food restores 10% more FOOD.']],
 80:[['co_endless','Endless Kitchen','20% chance to refund one consumed ingredient.'],['co_portions','Double Portions','15% chance to produce two meals instead of one.']],
 90:[['co_flaw','Flawless Cooking','+25% burn prevention.'],['co_hfeast','Hearty Feast','Cooked food restores 15% more FOOD.']],
 99:[['co_sov','Culinary Legend','Every 5th successful recipe produces two meals.'],['co_eternal','Eternal Feast','Cooked meals restore 25% more FOOD and stop hunger draining for 30 seconds.']]});
TREES[5]=pTree(5,{1:'Build campfires (3 wood + 1 stone); they burn longer as you level'},{
 10:[['fi_long','Long Flames','Campfires burn 15% longer.'],['fi_quick','Quick Spark','Start fires 15% faster'+X39.replace('bonus','+15%')+'.']],
 20:[['fi_saver','Fuel Saver','+10% chance to save fuel: building a campfire may give 1 wood back.'],['fi_warm','Warm Shelter','Campfires heal and warm you from 20% farther away.']],
 30:[['fi_endure','Enduring Embers','Campfires burn 20% longer.'],['fi_kindle','Cheap Kindling','Campfires need one fewer wood (2 wood + 1 stone).']],
 40:[['fi_bright','Bright Flames','Firelight reaches 25% farther, and monsters keep 25% farther away from your fires.'],['fi_haven','Safe Haven','While you\'re near a campfire, monsters notice you 20% less easily.']],
 50:[['fi_gchar','Golden Charcoal','Your fires leave charcoal: 20% chance each smelt needs no wood.'],['fi_eff','Efficient Flames','Campfires use 15% fewer materials: each wood and stone has a 15% chance to come back.']],
 60:[['fi_dchar','Charcoal Bed','12% chance a new campfire burns twice as long.'],['fi_fuelm','Fuel Master','+20% chance to save fuel: building a campfire may give 1 wood back.']],
 70:[['fi_master','Master Firekeeper','Campfires burn 25% longer.'],['fi_rapid','Rapid Ignition','Start fires 30% faster'+X39.replace('bonus','+30%')+'.']],
 80:[['fi_embers','Endless Embers','When a campfire burns out, it flares back up once with 30% of its fuel.'],['fi_blaze','Blazing Light','Firelight reaches 40% farther, and monsters keep 40% farther away from your fires.']],
 90:[['fi_eternal','Eternal Warmth','Campfires burn 35% longer.'],['fi_sacred','Sacred Flames','Monsters within 5 tiles of a campfire move 15% slower.']],
 99:[['fi_sov','Flame Sovereign','Every 5th campfire costs no wood.'],['fi_guard','Eternal Guardian','Campfires burn 50% longer and drive monsters away from 6 tiles out (normally about 4).']]});
TREES[10]=pTree(10,ulSmith,{
 10:[['sm_quick','Quick Forge','Smith metal items 10% faster'+X39.replace('bonus','+10%')+'.'],['sm_saver','Metal Saver','10% chance to save one metal bar (or ore, when smelting).']],
 20:[['sm_heavy','Heavy Hammer','Smithing speed increases 15%'+X39.replace('bonus','+15%')+'.'],['sm_bonus','Bonus Metal','5% chance to produce an extra metal item.']],
 30:[['sm_double','Double Forge','8% chance to produce two metal items instead of one.'],['sm_smelt','Efficient Smelting','Smelting uses 10% less ore: each ore has a 10% chance to come back.']],
 40:[['sm_steady','Steady Hammer','Your FOOD drains 20% slower right after smithing.'],['sm_fortune','Metal Fortune','+8% chance to save one metal bar.']],
 50:[['sm_gold','Golden Forge','Everything you smelt or forge (bars, weapons, armour, tools) sells for 20% more gold.'],['sm_cheap','Cheap Forging','Forging uses 10% fewer bars: each bar has a 10% chance to come back.']],
 60:[['sm_smelter','Master Smelter','12% chance to smelt an extra metal bar.'],['sm_rapid','Rapid Forging','Smith and smelt 20% faster.']],
 70:[['sm_master','Master Smith','Smith metal items 20% faster'+X39.replace('bonus','+20%')+'.'],['sm_precious','Precious Metal','+15% chance to save one metal bar.']],
 80:[['sm_anvil','Double Anvil','15% chance to produce two metal items instead of one.'],['sm_eff','Efficient Forge','Forging uses 15% fewer bars: each bar has a 15% chance to come back.']],
 90:[['sm_relent','Relentless Hammer','Smithing speed increases 25%'+X39.replace('bonus','+25%')+'.'],['sm_mastery','Metal Mastery','20% chance to produce an extra metal item.']],
 99:[['sm_sov','Forge Sovereign','Every 5th successful smithing recipe produces two items.'],['sm_legend','Legendary Smith','Smith 35% faster; each bar has a 20% chance to come back.']]});
TREES[6]=pTree(6,ulCraft,{
 10:[['cr_quick','Quick Hands','Craft items 10% faster'+X39.replace('bonus','+10%')+'.'],['cr_saver','Material Saver','10% chance to save one crafting material.']],
 20:[['cr_double','Double Craft','5% chance to produce an extra crafted item.'],['cr_steady','Steady Hands','Your FOOD drains 20% slower right after crafting.']],
 30:[['cr_eff','Efficient Crafting','Recipes use 10% fewer materials: each material has a 10% chance to come back.'],['cr_rapid','Rapid Crafting','Craft items 15% faster'+X39.replace('bonus','+15%')+'.']],
 40:[['cr_bonus','Bonus Supplies','8% chance to produce an extra crafted item.'],['cr_careful','Careful Cutting','15% chance to save one wood or berry when crafting.']],
 50:[['cr_gold','Golden Goods','Crafted goods sell for 20% more gold.'],['cr_cheap','Cheap Recipes','Recipes use 15% fewer materials: each material has a 15% chance to come back.']],
 60:[['cr_prod','Double Production','12% chance to produce an extra crafted item.'],['cr_resource','Resource Master','20% chance to save one crafting material.']],
 70:[['cr_master','Master Crafter','Craft items 20% faster'+X39.replace('bonus','+20%')+'.'],['cr_hands','Efficient Hands','Recipes use 20% fewer materials: each material has a 20% chance to come back.']],
 80:[['cr_endless','Endless Supplies','25% chance to save one crafting material.'],['cr_creation','Double Creation','15% chance to produce two items instead of one.']],
 90:[['cr_relent','Relentless Crafting','Craft items 25% faster'+X39.replace('bonus','+25%')+'.'],['cr_fortune','Crafting Fortune','20% chance to produce an extra crafted item.']],
 99:[['cr_sov','Crafting Sovereign','Every 5th successful crafting recipe produces two items.'],['cr_legend','Artisan Legend','Craft 35% faster; each material has a 25% chance to come back.']]});
// --- the numbers ---
const sum39=(sk,L)=>L.reduce((a,[id,v])=>a+(P39(sk,id)?v:0),0);
const PSPD={4:[['co_quick',.1],['co_timing',.15],['co_master',.2]],5:[['fi_quick',.15],['fi_rapid',.3]],10:[['sm_quick',.1],['sm_heavy',.15],['sm_rapid',.2],['sm_master',.2],['sm_relent',.25],['sm_legend',.35]],
 6:[['cr_quick',.1],['cr_rapid',.15],['cr_master',.2],['cr_relent',.25],['cr_legend',.35]]};
function pSpeed(sk){const l=lv39(sk);return .005*(l-1)+(l>=35?.05:0)+(l>=75?.05:0)+sum39(sk,PSPD[sk]||[])}
function pSecond(sk){const l=lv39(sk),G=PSK[sk];return .01*Math.floor(l/5)+((l>=25?G.e[0]:0)+(l>=55?G.e[1]:0)+(l>=95?G.e[2]:0))/100}
function pThird(sk){const l=lv39(sk),G=PSK[sk];return .01*Math.floor(l/15)+((l>=65?G.r:0)+(l>=85?G.r:0))/100}
// cooking
const cBurnSave=()=>Math.min(.95,pSecond(4)+sum39(4,[['co_steady',.1],['co_safe',.15],['co_flaw',.25]]));
const cFood=()=>pThird(4)+sum39(4,[['co_hearty',.05],['co_rich',.08],['co_perfect',.1],['co_hfeast',.15],['co_eternal',.25]]);
// per-skill production rolls: save-one, per-unit refund ("fewer"), extra item, double, sovereign
const PROD={4:{save:()=>sum39(4,[['co_saver',.1],['co_endless',.2]]),fewer:()=>sum39(4,[['co_eff',.1]]),extra:()=>sum39(4,[['co_feastm',.12]]),dbl:()=>sum39(4,[['co_double',.08],['co_portions',.15]]),sov:'co_sov'},
 10:{save:()=>pSecond(10)+sum39(10,[['sm_saver',.1],['sm_fortune',.08],['sm_precious',.15]]),fewer:()=>sum39(10,[['sm_cheap',.1],['sm_eff',.15],['sm_legend',.2]]),extra:()=>pThird(10)+sum39(10,[['sm_bonus',.05],['sm_mastery',.2]]),dbl:()=>sum39(10,[['sm_double',.08],['sm_anvil',.15]]),sov:'sm_sov'},
 6:{save:()=>pSecond(6)+sum39(6,[['cr_saver',.1],['cr_resource',.2],['cr_endless',.25]]),fewer:()=>sum39(6,[['cr_eff',.1],['cr_cheap',.15],['cr_hands',.2],['cr_legend',.25]]),extra:()=>pThird(6)+sum39(6,[['cr_double',.05],['cr_bonus',.08],['cr_prod',.12],['cr_fortune',.2]]),dbl:()=>sum39(6,[['cr_creation',.15]]),sov:'cr_sov'}};
const SOV39={4:0,10:0,6:0};
// o: {out: item key or null (tools, armour), n: units made, used: {key: amount consumed}, xp: base XP earned, prefer: keys to save first, fewerKeys: keys "fewer" applies to}
function prodBoost(sk,o){if(!o.n)return{};const C=PROD[sk],add=(k,v)=>{inv[k]=(inv[k]|0)+v},got={},back={};let j=0;const tag=t=>gTxt(P.x,P.y-24-(j++)*7,t,SKC[sk]);
  const usedK=Object.keys(o.used||{}).filter(k=>o.used[k]>0),pick=()=>{const pr=(o.prefer||[]).filter(k=>usedK.includes(k));const L=pr.length?pr:usedK;return L[Math.floor(Math.random()*L.length)]};
 const ps=C.save(),pf=C.fewer(),pe=C.extra(),pd=C.dbl();
 for(let u=0;u<o.n;u++){
  if(usedK.length&&Math.random()<ps){const k=pick();back[k]=(back[k]|0)+1}
  let more=0;if(Math.random()<pe)more++;if(Math.random()<pd)more++;if(P39(sk,C.sov)&&++SOV39[sk]>=5){SOV39[sk]=0;more++}
  if(more){if(o.out)got[o.out]=(got[o.out]|0)+more;else if(usedK.length){const k=pick();back[k]=(back[k]|0)+more}}}
 if(pf>0)for(const k of usedK){if(o.fewerKeys&&!o.fewerKeys.includes(k))continue;const base=o.used[k]-(back[k]|0);for(let u=0;u<base;u++)if(Math.random()<pf)back[k]=(back[k]|0)+1}
 for(const k in back){const v=Math.min(back[k],o.used[k]);if(v>0){add(k,v);tag('+'+v+' '+iname(k)+' saved')}}
 for(const k in got){add(k,got[k]);tag('Bonus: +'+got[k]+' '+iname(k))}return back}
// --- cooking at a campfire (EAT next to a fire) and eating ---
const CKSET=new Set([...COOKS.map(c=>c.ck),'cooked']);
let LAST39=0,FEAST39=0;
const _eat39=eat;eat=function(){const raw0=COOKS.map(c=>inv[c.raw]|0),ck0=COOKS.map(c=>inv[c.ck]|0),h0=hunger,fd0={};for(const k of CKSET)fd0[k]=inv[k]|0;
 _eat39();const ci=COOKS.findIndex((c,i)=>(inv[c.raw]|0)<raw0[i]);
 if(ci>=0&&hunger===h0){const c=COOKS[ci],ok=(inv[c.ck]|0)>ck0[ci];
  if(!ok&&Math.random()<cBurnSave()){inv[c.ck]=(inv[c.ck]|0)+1;addXp(4,Math.max(0,c.xp-5));say('Saved it just in time! Cooked '+c.n);sfx('sizzle');if(Q.on&&QS[Q.i]&&QS[Q.i].type==='cook')Q.k++;prodBoost(4,{out:c.ck,n:1,used:{[c.raw]:1},xp:c.xp})}
  else if(ok)prodBoost(4,{out:c.ck,n:1,used:{[c.raw]:1},xp:c.xp});saveLocal(true);return}
 if(hunger>h0){const k=[...CKSET].find(k=>(inv[k]|0)<fd0[k]);if(!k)return;const f=FOODS.find(x=>x.k===k),b=cFood();
  if(f&&b>0){const add=Math.round(f.hun*b);if(add>0){hunger=Math.min(100,hunger+add);gTxt(P.x,P.y-30,'+'+add+' FOOD (perk)',SKC[4])}}
  if(P39(4,'co_lasting'))LAST39=60;if(P39(4,'co_eternal'))FEAST39=30}};
// --- cooking at a stove ("Cook all") ---
const _sa39=stationAct;stationAct=function(a){if(typeof a!=='string'||!a.startsWith('ck_'))return _sa39(a);const c=COOKS.find(q=>q.raw===a.slice(3));
 const m=typeof stUses==='function'&&stUses()?stMerge(STATION):false;
 try{if(!c)return _sa39(a);const r0=inv[c.raw]|0,k0=inv[c.ck]|0;_sa39(a);const used=r0-(inv[c.raw]|0);let ok=(inv[c.ck]|0)-k0;if(used<=0)return;
  let saved=0;for(let u=0;u<used-ok;u++)if(Math.random()<cBurnSave())saved++;
  if(saved){inv[c.ck]=(inv[c.ck]|0)+saved;addXp(4,saved*Math.max(0,c.xp-5));if(Q.on&&QS[Q.i]&&QS[Q.i].type==='cook')Q.k+=saved;gTxt(P.x,P.y-40,'Saved '+saved+' from burning',SKC[4]);ok+=saved}
  prodBoost(4,{out:c.ck,n:ok,used:{[c.raw]:used},xp:ok*c.xp});saveLocal(true);if(pnOpen)rPn()}finally{if(m)benchSplit()}};
// --- smithing (furnace + anvil) ---
const SMMETAL=['sbar','ibar','iron'];
const _sm39=smithAct;smithAct=function(i,all){const r=SM[i];if(!r)return _sm39(i,all);const m=typeof stUses==='function'&&stUses()?stMerge(STATION):false;
 try{const keys=[...Object.keys(r.c),r.k].filter(Boolean),b0={};for(const k of keys)b0[k]=inv[k]|0;_sm39(i,all);
  const used={};for(const k in r.c){const d=b0[k]-(inv[k]|0);if(d>0)used[k]=d}if(!Object.keys(used).length)return;
  const n=r.k?(inv[r.k]|0)-b0[r.k]:Math.round((used[Object.keys(r.c)[0]]||0)/r.c[Object.keys(r.c)[0]]);
  // bonus items: bars and daggers stack; armour is worn straight away, so a bonus there gives a bar back instead
  const bk0=prodBoost(10,{out:r.k||null,n,used,xp:r.xp*n,prefer:SMMETAL,fewerKeys:r.smelt?[]:['ibar','sbar']});
  if(r.smelt){if(P39(10,'sm_smelt')){let bk=0;for(let u=0;u<(used.iron|0)-((bk0||{}).iron|0);u++)if(Math.random()<.1)bk++;if(bk){inv.iron=(inv.iron|0)+bk;gTxt(P.x,P.y-52,'+'+bk+' iron ore saved',SKC[10])}}
   if(P39(10,'sm_smelter')){let e=0;for(let u=0;u<n;u++)if(Math.random()<.12)e++;if(e){inv[r.k]=(inv[r.k]|0)+e;gTxt(P.x,P.y-58,'Master smelter: +'+e+' '+iname(r.k),SKC[10])}}
   if(P39(5,'fi_gchar')&&used.wood){let w=0;for(let u=0;u<n;u++)if(Math.random()<.2)w++;w=Math.min(w,used.wood-((bk0||{}).wood|0));if(w){inv.wood=(inv.wood|0)+w;gTxt(P.x,P.y-64,'Charcoal: +'+w+' wood saved',SKC[5])}}}
  ACTW[10]=10;saveLocal(true);if(pnOpen)rPn()}finally{if(m)benchSplit()}};
// --- crafting: tools, goods and buildables ---
const SOFT39=['wood','berry'];
function crPost(r,b0,n,out,xp){const used={};for(const k in r.c){const d=b0[k]-(inv[k]|0);if(d>0)used[k]=d}if(!n||!Object.keys(used).length)return;
 prodBoost(6,{out,n,used,xp});
 if(P39(6,'cr_careful')){const soft=Object.keys(used).filter(k=>SOFT39.includes(k));for(let u=0;u<n&&soft.length;u++)if(Math.random()<.15){const k=soft[Math.floor(Math.random()*soft.length)];inv[k]=(inv[k]|0)+1;gTxt(P.x,P.y-52,'Careful: +1 '+iname(k)+' saved',SKC[6])}}
 ACTW[6]=10}
const _mg39=makeGood;makeGood=function(i,all){const r=GOODS[i];if(!r)return _mg39(i,all);const b0={},o0=inv[r.k]|0;for(const k in r.c)b0[k]=inv[k]|0;_mg39(i,all);const n=(inv[r.k]|0)-o0;
 if(n>0){crPost(r,b0,n,r.k,r.xp*n);saveLocal(true);if(pnOpen)rPn()}};
const _mb39=makeBuild;makeBuild=function(i,all){const r=BREC[i];if(!r)return _mb39(i,all);const b0={},o0=inv[r.k]|0;for(const k in r.c)b0[k]=inv[k]|0;_mb39(i,all);const n=(inv[r.k]|0)-o0;
 if(n>0){crPost(r,b0,n,r.k,r.xp*n);saveLocal(true);if(pnOpen)rPn()}};
const _cr39=craft;craft=function(r){if(!r||!r.c)return _cr39(r);const b0={},x0=XPS[6];for(const k in r.c)b0[k]=inv[k]|0;_cr39(r);if(XPS[6]>x0){crPost(r,b0,1,null,r.xp);saveLocal(true);if(pnOpen)rPn()}};
// --- firemaking ---
const fDur=()=>pSecond(5)+sum39(5,[['fi_long',.15],['fi_endure',.2],['fi_master',.25],['fi_eternal',.35],['fi_guard',.5]]);
const fFuel=()=>pThird(5)+sum39(5,[['fi_saver',.1],['fi_fuelm',.2]]);
let FSOV39=0;
const _fire39=fire;fire=function(){const n0=fires.length,kin=P39(5,'fi_kindle')&&(inv.wood|0)>=2&&(inv.wood|0)<3;if(kin)inv.wood=(inv.wood|0)+1;const w0=inv.wood|0,s0=inv.stone|0;
 _fire39();if(fires.length<=n0){if(kin)inv.wood--;return}
 const f=fires[fires.length-1];let mult=1+fDur();if(P39(5,'fi_dchar')&&Math.random()<.12){mult*=2;gTxt(P.x,P.y-40,'Charcoal bed: burns twice as long!',SKC[5])}f.life*=mult;f.mx=f.life;
 let wUsed=w0-(inv.wood|0),sUsed=s0-(inv.stone|0);
 if(P39(5,'fi_kindle')&&!kin&&wUsed>=3){inv.wood++;wUsed--}
 if(kin){wUsed--}// the borrowed wood was the "one fewer"
 let wb=0,sb=0;
 if(P39(5,'fi_sov')&&++FSOV39>=5){FSOV39=0;wb=wUsed;gTxt(P.x,P.y-46,'Flame sovereign: no wood used!',SKC[5])}
 else{if(Math.random()<fFuel())wb++;if(P39(5,'fi_eff')){for(let u=wb;u<wUsed;u++)if(Math.random()<.15)wb++;for(let u=0;u<sUsed;u++)if(Math.random()<.15)sb++}}
 wb=Math.min(wb,wUsed);sb=Math.min(sb,sUsed);if(wb){inv.wood=(inv.wood|0)+wb;gTxt(P.x,P.y-30,'+'+wb+' wood saved',SKC[5])}if(sb){inv.stone=(inv.stone|0)+sb;gTxt(P.x,P.y-36,'+'+sb+' stone saved',SKC[5])}
 saveLocal(true)};
// warmth ring (50), the "monsters keep away" ring (70) and the glow scale with the light perks; cached once per frame
let NF50=50,NF70=70;
function fireLR(){return NF70/70}
const _nf39=nearFire;nearFire=function(x,y,r){return _nf39(x,y,r===50?NF50:r===70?NF70:r)};
const isSlime39=n=>!n.type||n.type==='slime'||n.type==='magma';
const _u39=upd;upd=function(dt){
 NF50=P39(5,'fi_warm')?60:50;let m=1;if(P39(5,'fi_bright'))m=1.25;if(P39(5,'fi_blaze'))m=Math.max(m,1.4);NF70=70*m;if(P39(5,'fi_guard'))NF70=Math.max(NF70,96);
 const paused=menuOpen||pnOpen;
 if(P39(5,'fi_embers'))for(const f of fires)if(f.life-dt<=0&&!f.re){f.re=1;f.life+=(f.mx||150)*.3}
 const haven=!paused&&P39(5,'fi_haven')&&fires.length&&_nf39(P.x,P.y,80),sacred=!paused&&P39(5,'fi_sacred')&&fires.length;
 const pos=(haven||sacred)?en.map(n=>[n,n.x,n.y]):null;
 _u39(dt);
 if(pos)for(const[n,x0,y0]of pos){if(n.dead||n.boss||n._wb||n.type==='ib'||n._rp)continue;/* every monster except bosses (other players\' monsters move on their own games) */let s=1;const d=Math.hypot(P.x-x0,P.y-y0);
  if(haven&&d>=104&&d<130)s=.25;// beyond 80% of a slime's notice range: it doesn't spot you, so it just drifts
  if(sacred&&_nf39(x0,y0,80))s*=.85;if(s<1){n.x=x0+(n.x-x0)*s;n.y=y0+(n.y-y0)*s}}
 if(paused||dead)return;if(LAST39>0)LAST39-=dt;if(FEAST39>0)FEAST39-=dt;
 const back=FEAST39>0?1:LAST39>0?.1:0;if(back&&hunger>0)hunger=Math.min(100,hunger+dt*.9*FOOD_RATE*back)};
// FOOD perks for smithing and crafting ride on section 38's activity timers
ACTW[10]=0;FOODP[10]=['sm_steady',.2];ACTW[6]=0;FOODP[6]=['cr_steady',.2];
// --- selling perks ---
SELLB.push([4,'co_gold',.2,()=>[...CKSET]],[10,'sm_gold',.2,()=>SM.map(r=>r.k).filter(Boolean)],[6,'cr_gold',.2,()=>[...GOODS,...BREC].map(g=>g.k).filter(Boolean)]);
