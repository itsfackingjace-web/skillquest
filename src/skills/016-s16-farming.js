// ---------------------------------------------------------------- 16. Farming
// Buy a hoe and a watering can, till grass into soil, plant seeds from your Bag, water them,
// and harvest. Crops grow while you play (watering keeps them growing) and cook into hearty food.
SKN.push('Farming');AB.push('FARM');SKC.push('#88c840');while(XPS.length<SKN.length)XPS.push(0);
TL.hoe=0;TL.can=0;
const CROPS={wheat:{n:'Wheat',seed:'wheatseed',lv:1,st:40,max:3,yield:[2,3],xp:30},carrot:{n:'Carrot',seed:'carrotseed',lv:5,st:55,max:3,yield:[2,3],xp:45},pumpkin:{n:'Pumpkin',seed:'pumpkinseed',lv:15,st:70,max:4,yield:[1,2],xp:90}};
const SEED2CROP={wheatseed:'wheat',carrotseed:'carrot',pumpkinseed:'pumpkin'},WATER_FOR=150;
const FARMK=['wheatseed','carrotseed','pumpkinseed','wheat','carrot','pumpkin','bread','rcarrot','pie'];INVK.push(...FARMK);var EXTRA_BAG=FARMK;
Object.assign(INAME,{wheatseed:'Wheat seeds',carrotseed:'Carrot seeds',pumpkinseed:'Pumpkin seeds',wheat:'Wheat',carrot:'Carrot',pumpkin:'Pumpkin',bread:'Bread',rcarrot:'Roasted carrot',pie:'Pumpkin pie'});
Object.assign(IDESC,{wheatseed:'Plant on tilled soil, then water. Grows into wheat.',carrotseed:'Plant on tilled soil (Farming 5). Grows into carrots.',pumpkinseed:'Plant on tilled soil (Farming 15). Grows into a big pumpkin.',
 wheat:'Golden wheat. Bake it into bread at a campfire (Cooking 5).',carrot:'A crunchy carrot. Roast it at a campfire (Cooking 8), or eat it raw.',pumpkin:'A huge pumpkin. Bake it into a pie at a campfire (Cooking 15).',
 bread:'Fresh bread. Restores food and 2 hearts.',rcarrot:'A sweet roasted carrot. Restores food and 1 heart.',pie:'Pumpkin pie! Restores lots of food and 4 hearts.'});
Object.assign(SELLP,{wheatseed:1,carrotseed:2,pumpkinseed:5,wheat:4,carrot:6,pumpkin:18,bread:12,rcarrot:10,pie:40});
Object.assign(SN,{wheatseed:'Wheat seeds',carrotseed:'Carrot seeds',pumpkinseed:'Pumpkin seeds',wheat:'Wheat',carrot:'Carrots',pumpkin:'Pumpkins',bread:'Bread',rcarrot:'Roasted carrots',pie:'Pumpkin pies'});
COOKS.push({raw:'wheat',ck:'bread',n:'wheat',lv:5,xp:40},{raw:'carrot',ck:'rcarrot',n:'carrot',lv:8,xp:50},{raw:'pumpkin',ck:'pie',n:'pumpkin',lv:15,xp:110});
FOODS.push({k:'bread',n:'bread',heal:2,hun:55},{k:'rcarrot',n:'roasted carrot',heal:1,hun:40},{k:'pie',n:'pumpkin pie',heal:4,hun:90},{k:'carrot',n:'raw carrot',heal:0,hun:15});FOODS.sort((a,b)=>b.heal-a.heal||b.hun-a.hun);
GEN.push({n:'Hoe',c:12,f:()=>{TL.hoe=1;say('Got a hoe! Face grass and press HIT to till soil.')},hide:()=>!!TL.hoe},
 {n:'Watering can',c:15,f:()=>{TL.can=1;say('Got a watering can! HIT a planted crop to water it.')},hide:()=>!!TL.can},
 {n:'5 wheat seeds',c:5,f:()=>{inv.wheatseed=(inv.wheatseed|0)+5}},
 {n:'5 carrot seeds',c:12,f:()=>{inv.carrotseed=(inv.carrotseed|0)+5},hide:()=>lvOf(11)<5},
 {n:'3 pumpkin seeds',c:25,f:()=>{inv.pumpkinseed=(inv.pumpkinseed|0)+3},hide:()=>lvOf(11)<15});
// --- plots: tile index -> {c: crop or null, g: growth seconds, w: watered until (play clock)} ---
const FARM=new Map();
const TILL_LIFE=600,nowS=()=>Math.floor(Date.now()/1000);   // empty tilled soil turns back into grass after 10 minutes
function farmFromSave(a){FARM.clear();if(!Array.isArray(a))return;for(const e of a){if(!Array.isArray(e))continue;const i=e[0]|0;if(i<0||i>=N*N||tile[i]===0)continue;FARM.set(i,{c:CROPS[e[1]]?e[1]:null,g:Math.max(0,+e[2]||0),w:+e[3]||0,e:+e[4]||nowS()});obj[i]=null}}
const _sn16=snap;snap=function(){const s=_sn16();s.farm=[...FARM].map(([i,p])=>[i,p.c,Math.round(p.g),Math.round(p.w),p.e|0]);s.qv=5;return s};
const _ap16=applySave;applySave=function(S){_ap16(S);farmFromSave(S.farm);TL.hoe=S.tl&&S.tl.hoe?1:0;TL.can=S.tl&&S.tl.can?1:0;if((S.qv||0)<5&&S.q&&Q.i>=13)Q.i=Math.min(QS.length,Q.i+1)};
QS.splice(13,0,{n:'Green Thumb',d:'Get a hoe (craft one, or buy it at the general store) and seeds from the general store, then grow and harvest 5 crops.',type:'harvest',amt:5,r:{g:120,xp:[11,500]}});
const _qv16=qVal;qVal=function(q){return q.type==='harvest'?Q.k:_qv16(q)};

const stageOf=p=>p.c?Math.min(CROPS[p.c].max,Math.floor(p.g/CROPS[p.c].st)):0,ripe=p=>p.c&&stageOf(p)>=CROPS[p.c].max,wet=p=>CLK<p.w;
function canTill(x,y){if(x<1||y<1||x>=N-1||y>=N-1)return false;const i=y*N+x;return tile[i]===2&&!obj[i]&&!STR.has(i)&&!BS.has(i)&&!houseAt(x,y)&&!FARM.has(i)&&!inVillage(x,y)&&!fires.some(f=>Math.abs(f.x-(x*16+8))<12&&Math.abs(f.y-(y*16+8))<12)}
function harvest(i,p){const C=CROPS[p.c],L=lvOf(11);let n=C.yield[0]+(Math.random()<.35+L*.01?C.yield[1]-C.yield[0]:0);inv[p.c]=(inv[p.c]|0)+n;let extra='';
 {const ns=window.SQSEEDS?SQSEEDS(L):(Math.random()<.45+L*.005?1:0);if(ns>0){inv[C.seed]=(inv[C.seed]|0)+ns;extra=ns>1?' and '+ns+' seeds':' and a seed'}}addXp(11,C.xp);if(Q.on&&QS[Q.i]&&QS[Q.i].type==='harvest')Q.k++;
 say('Harvested '+n+' '+C.n.toLowerCase()+(n>1&&p.c!=='wheat'?'s':'')+extra+'!');p.c=null;p.g=0;p.e=nowS();sfx('pickup');setTimeout(()=>sfx('coin'),120);saveLocal(true)}
// HIT on the farm: till, water, harvest
const _atk16=attack;attack=function(){if(dead||menuOpen||pnOpen||BUILD||SCENE||swing>0||FISH)return _atk16();if(facingNpc())return _atk16();
 const[fx,fy]=front(13),tx=Math.floor(fx/T),ty=Math.floor(fy/T),i=ty*N+tx;if(en.some(n=>!n.dead&&Math.hypot(n.x-fx,n.y-fy)<18))return _atk16();
 const p=FARM.get(i);
 if(p){swing=.25;if(ripe(p))return harvest(i,p);
  if(p.c&&!wet(p)){if(!TL.can){say('Buy a watering can at the general store to water crops.');sfx('swish');return}p.w=CLK+WATER_FOR;addXp(11,3);say('Watered the '+CROPS[p.c].n.toLowerCase()+'.');sfx('splash');saveLocal();return}
  if(!p.c){say('This soil is ready. Choose seeds in your Bag and tap PLANT.');sfx('swish');return}
  const C=CROPS[p.c],left=Math.max(0,C.max*C.st-p.g);say(C.n+' is growing. About '+Math.ceil(left/60)+' min of watered time left.');sfx('swish');return}
 if(TL.hoe&&canTill(tx,ty)){swing=.25;FARM.set(i,{c:null,g:0,w:0,e:nowS()});addXp(11,4);sfx('chop');saveLocal(true);if(!farmTip){farmTip=true;say('Tilled! Plant seeds from your Bag.')}return}
 _atk16()};
let farmTip=false;
// planting uses the Bag's PLANT button (plant mode works like build mode)
const isSeed=k=>!!SEED2CROP[k];
const _cpl16=canPlace;canPlace=function(x,y){if(BUILD&&isSeed(BUILD.k)){const p=FARM.get(y*N+x);return!!p&&!p.c}return _cpl16(x,y)};
const _sb16=startBuild;startBuild=function(k){if(!isSeed(k))return _sb16(k);if((inv[k]|0)<1)return;if(SCENE){say('Plant seeds outside on tilled soil.');closePanel();return}
 const C=CROPS[SEED2CROP[k]];if(lvOf(11)<C.lv){say('You need Farming '+C.lv+' to plant '+C.n.toLowerCase()+'.');closePanel();return}BUILD={k};closePanel();setActionLabels();say('Plant mode: face tilled soil and press PLANT. Press DONE when finished.')};
const _pb16=placeBuild;placeBuild=function(){if(!BUILD||!isSeed(BUILD.k))return _pb16();const k=BUILD.k,[x,y]=frontTile(),p=FARM.get(y*N+x);
 if(!p){say(TL.hoe?'Till the soil first: face grass and press HIT.':'You need tilled soil. Craft a hoe (Craft menu) or buy one at the general store.');sfx('swish');return}
 if(p.c){say('Something is already growing there.');sfx('swish');return}inv[k]--;p.c=SEED2CROP[k];p.g=0;addXp(11,5);sfx('rustle');saveLocal(true);if((inv[k]|0)<1)endBuild('Planted your last '+INAME[k].toLowerCase()+'.')};
const _sal16=setActionLabels;setActionLabels=function(){_sal16();if(BUILD&&isSeed(BUILD.k)){const a=document.getElementById('a');if(a)a.innerHTML='PLANT'+(isPC?'<small>Space</small>':'')}};
const _bag16=bagGridHTML;bagGridHTML=function(){let h=_bag16();if(invSel&&isSeed(invSel)&&(inv[invSel]|0)>0)h=h.replace('<div class="bd">','<div class="bd"><button class="use plc" data-k="'+invSel+'">PLANT</button>');return h};
// growth while you play
const _u16=upd;upd=function(dt){_u16(dt);if(menuOpen||pnOpen)return;for(const[i,p]of FARM){if(obj[i])obj[i]=null;if(p.c&&wet(p)&&!ripe(p))p.g+=dt}};
// equipment: hoe and watering can
const _eq16=equipHTML;equipHTML=function(){return _eq16().replace('<div class="qc" style="margin-top:12px">','<div class="eqg" style="margin-top:6px">'+eqSlot('HOE','hoe','',TL.hoe?'Hoe':'')+eqSlot('WATER','can','',TL.can?'Watering can':'')+'</div><div class="qc" style="margin-top:12px">')};
const _dmap16=drawMap;drawMap=function(){_dmap16();const c=document.getElementById('mpc');if(!c||!FARM.size)return;const x=c.getContext('2d');for(const[i,p]of FARM){x.fillStyle=ripe(p)?'#f0c848':'#8a5a30';x.fillRect(i%N,(i/N)|0,1,1)}};
const _ng16=newGame;newGame=function(){FARM.clear();TL.hoe=0;TL.can=0;_ng16()};
