// ---- 283. Durability and repairs at the Blacksmith's bench (smithing overhaul, step 3) ----
// Nov 23 (Jace + Kevin, plan in the "SQ Blacksmith's Bench" sheet):
//   what wears: weapons, armour, bows, wands, daggers, axes, pickaxes and the fishing rod (never the hoe or watering can), 1 point per
//     use: the sword (and a dagger in the off-hand) per swing that lands, a bow or wand per shot, an axe or pickaxe per log or ore,
//     the rod per catch (woodcutting / mining / fishing XP); each armour piece loses 5 per hit you take (blocked or not).
//   durability by tier (TIER below): wood 250, starter 500, iron 1,000, steel 1,500, mithril 2,500, adamant 4,000, boss 5,000,
//     meteorite 6,000; bows x2 and wands x1.5; the rod 2,000. Upgrades (274, Nov 24, Jace): a +1 lasts 10 times as long, a +2 100
//     times, and a +3 never wears out (maxD 0, like the hoe). Saves from before that (no s.durv) have their used +1/+2 copies scaled
//     up so they keep the share they had, and used +3 copies become plain +3s (migrate() below); a used +3 that turns up later from a
//     trade or a chest becomes a plain +3 in the bag.
//   only the piece you wear wears down. Take a used piece off and it's a separate bag item, 'w<durability>_<item key>' (the key
//     carries the number, so chests, trades and saves keep it exactly; spares stay new). Equipping a used copy wears it with its
//     durability. At 0 it isn't destroyed: it comes off into your bag (no stats) and can't be worn until it's repaired.
//     Warnings at 20% and at 0.
//   repairs, at the Blacksmith's bench (272): at the level that makes the item + 5, in its skill (boss drops: 50). A full repair costs
//     half of the item's main material (bars, turtle fragments, pelts, mushrooms...; wood, logs and gems aren't needed) and gives half
//     its craft XP; a partial repair costs and gives that share. Bars and turtle fragments split into 10 shards (shd_<bar>), spare
//     shards stay in the bag and fuse back into a bar at a furnace. Boss gear: 10 sigil shards of its island for a full repair; the
//     Crystal blade 2 steel bars, the Bone bow 20 bones. Bought gear (leather set, wizard set, shop wands) can't be repaired.
//   worn copies can't be sold (repair them first); they can be traded, so a smith can repair someone else's gear through a trade.
//   gear (worn copies and 274's upgraded copies) stays with you when you fall, like the gear you wear.
// window.SQREPAIR.
(()=>{const BEN=window.SQSMITHBENCH,U=window.SQUPGRADE;if(!BEN||!U)return;const SMI=10,CRI=6;
 const WSLOTS=['main','off','helm','body','legs','axe','pick','rod'],WSL=new Set(WSLOTS),ARMS=['helm','body','legs'];
 // ---- durability ----
 const TV={wood:250,start:500,iron:1000,steel:1500,mith:2500,adam:4000,boss:5000,met:6000},TIER={};
 const put=(t,ks)=>{for(const k of ks.split(' '))TIER[k]=TV[t]};
 put('wood','eq_axe1 eq_pick1 eq_sword1');
 put('start','eq_axe2 eq_pick2 eq_sword2 eq_helm1 eq_body1 eq_legs1 eq_bow1 eq_wfire eq_wice eq_wstorm eq_mhelm eq_mbody eq_mlegs');
 TIER.eq_rod=2000;// the only rod there is: it lasts about 4 hours of fishing (tuning, Nov 23)
 put('iron','eq_helm2 eq_body2 eq_legs2 eq_sword3 eq_axe3 eq_pick3 idag eq_bow2 eq_rhelm eq_rbody eq_rlegs');
 put('steel','eq_helm3 eq_body3 eq_legs3 eq_sword4 eq_axe4 eq_pick4 sdag');
 put('mith','eq_sword6 eq_helm4 eq_body4 eq_legs4 eq_bow4 eq_wfire_m eq_wice_m eq_wstorm_m eq_axe6 eq_pick6 mdag eq_cu_dark_wizard_s_hat eq_cu_mushroom_leggings eq_cu_mushroom_robe');
 put('adam','eq_sword7 eq_helm5 eq_body5 eq_legs5 eq_bow5 eq_wfire_a eq_wice_a eq_wstorm_a eq_axe7 eq_pick7 adag stdag');
 put('boss','eq_thelm eq_tbody eq_tlegs eq_cu_ancient_helmet eq_sword5 eq_bow3 eq_sword8 eq_ohat eq_cu_spider_hood eq_cu_spider_weaver_robe eq_fcrown eq_sledge eq_wvoid');
 put('met','eq_axe9 eq_pick9 eq_mhelm9 eq_mbody9 eq_mlegs9 eq_bow6 eq_wmeteor metdag');
 // tuning (Nov 23, estimates in the sheet): bows fire about twice as many shots as a sword lands hits and wands 1.5 times, so they
 // get that much more durability; armour loses ARMW points per hit taken (monsters you fight land only 0.05-0.2 hits a second)
 const ARMW=5,KMUL={bow:2,wand:1.5};
 const baseD=b=>{const e=EQ[b];let v=TIER[b];if(!v){if(!e||!WSL.has(e.slot)||e.kind==='hoe'||e.kind==='can'||b==='eq_hoe'||b==='eq_can')return 0;
   v=e.base&&TIER[e.base]?TIER[e.base]:TV.iron}// library gear: its base item's tier
  const k=e&&(e.kind||(e.base&&EQ[e.base]&&EQ[e.base].kind));return Math.round(v*(KMUL[k]||1))};
 const UPX=L=>Math.pow(10,L),NEVER=k=>U.lvlOf(k)>=3;// 274's +1 x10, +2 x100, +3 never wears
 const maxD=k=>{if(!k||NEVER(k))return 0;return Math.round(baseD(U.baseOf(k))*UPX(U.lvlOf(k)))};
 const OLDX=L=>1+.1*L;// before Nov 24: +10% a level
 const pct=(d,mx)=>mx?Math.max(d>0?1:0,Math.floor(100*d/mx)):0;
 const nm=k=>String(INAME[k]||(EQ[k]&&EQ[k].n)||k).toLowerCase();
 const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
 // ---- worn copies: 'w<d>_<key>' ----
 const WRE=/^w(\d{1,7})_((?:u[123]_)?[a-z0-9_]{3,60})$/;// up to 7 digits: a +2 meteorite bow has 1,200,000
 const parseW=k=>{const m=typeof k==='string'&&k[0]==='w'?WRE.exec(k):null;return m?{d:+m[1],k:m[2]}:null};
 const WK=(k,d)=>'w'+Math.max(0,Math.round(d))+'_'+k;
 const WREG=new Set();
 // the word goes first so a cut-off bag label still tells it from the new ones (Aztu, Nov 23: "Iron axe (wo..." looked like the stack)
 function wname(k,d){const mx=maxD(k),n=String(INAME[k]||(EQ[k]&&EQ[k].n)||'Gear'),l=n.charAt(0).toLowerCase()+n.slice(1);if(NEVER(k))return n;return d<=0?'Worn-out '+l:'Used '+l+' ('+pct(d,mx)+'%)'}
 function wreg(w){if(WREG.has(w))return true;const p=parseW(w);if(!p)return false;const inner=p.k;
  if(!(EQ[inner]||/^(u[123]_)?(eq_[a-z0-9_]+|[a-z]{1,4}dag)$/.test(inner)))return false;WREG.add(w);
  const def=(o,v)=>{try{Object.defineProperty(o,w,Object.assign({configurable:true,enumerable:false},typeof v==='function'?{get:v,set(){}}:{value:v,writable:true}))}catch(e){self.SQERR&&SQERR(e,'275-1')}};
  def(INAME,()=>wname(inner,p.d));def(SN,()=>wname(inner,p.d));def(SHORT,()=>wname(inner,p.d).toLowerCase());def(SELLP,0);
  def(IDESC,()=>{const mx=maxD(inner),r=rinfo(inner);if(NEVER(inner))return String(IDESC[inner]||'');return(p.d>0?'A used '+nm(inner)+': '+p.d.toLocaleString('en-US')+' / '+mx.toLocaleString('en-US')+' durability left. Wear it again, or repair it':'A worn-out '+nm(inner)+'. It can\'t be worn until it\'s repaired')+
   (r&&r.no?'. Bought gear can\'t be repaired: buy a new one.':r?' at a Blacksmith\'s bench ('+SKN[r.sk]+' '+r.rl+').':'.')});
  let ce=null,co=null;def(EQ,()=>{const e=EQ[inner];if(!e)return undefined;if(ce!==e){ce=e;co=Object.assign({},e,{wornOf:inner,wd:p.d})}co.n=wname(inner,p.d);return co});
  if(!INVK.includes(w))INVK.push(w);if(!EXTRA_BAG.includes(w))EXTRA_BAG.push(w);if(!(w in inv))inv[w]=0;return true}
 const addW=(k,d)=>{const w=WK(k,d);wreg(w);inv[w]=(inv[w]|0)+1;return w};
 // trades, graves and the market look new keys up through 108's sqBookReg: worn copies register there too
 {const _br=sqBookReg;sqBookReg=function(k){if(typeof k==='string'&&k[0]==='w'&&WRE.test(k)){wreg(k);return}return _br.apply(this,arguments)}}
 // ---- shards ----
 const SHM=['ibar','sbar','mbar','abar','metbar','turtfrag'],SHK=m=>'shd_'+m;
 const SHC={ibar:['#f0f4f8','#b8c0c8','#8890a0'],sbar:['#d8e4f8','#8098c8','#5870a0'],mbar:['#c8d8f8','#6880e0','#3848a0'],abar:['#b8f0c0','#48b860','#287838'],metbar:['#a898c8','#5a4e6e','#2c2638'],turtfrag:['#9ae0c0','#3a9070','#1e5a44']};
 for(const m of SHM){const k=SHK(m),bn=INAME[m]||m,n=(m==='turtfrag'?'Turtle fragment':bn)+' shard';if(!INVK.includes(k))INVK.push(k);if(!EXTRA_BAG.includes(k))EXTRA_BAG.push(k);
  INAME[k]=n;SN[k]=n+'s';SHORT[k]=n.toLowerCase();SELLP[k]=Math.max(1,Math.round((SELLP[m]|0)/10));inv[k]=inv[k]|0;
  IDESC[k]='A tenth of '+(/^[aeiou]/i.test(bn)?'an ':'a ')+bn.toLowerCase()+', left over from a repair at the Blacksmith\'s bench. Repairs use shards first; 10 fuse back into '+(/^[aeiou]/i.test(bn)?'an ':'a ')+bn.toLowerCase()+' at a furnace.'}
 const shN=(m,n)=>SHORT[SHK(m)]+(n===1?'':'s');
 // ---- repairs: what they cost ----
 const NOREP=new Set(['eq_helm1','eq_body1','eq_legs1','eq_mhelm','eq_mbody','eq_mlegs','eq_wfire','eq_wice','eq_wstorm']);// bought gear
 const SPECIAL={eq_sword5:{sk:SMI,rl:50,c:{sbar:2},xp:200},eq_bow3:{sk:SMI,rl:50,c:{bone:20},xp:200}};// full-repair costs
 const FALLBACK={eq_cu_ancient_helmet:[SMI,75,360,{abar:2}],eq_cu_dark_wizard_s_hat:[CRI,50,400,{shroom:100}]};// when the library has no recipe for them
 const SKIPM=/log$|^wood$|^ruby$|^sapphire$|^emerald$|^diamond$|^amethyst$|^topaz$/;
 function mainMat(c){const ks=Object.keys(c||{}).filter(k=>+c[k]>0);if(!ks.length)return null;const sh=ks.find(k=>SHM.includes(k));if(sh)return[sh,+c[sh]];
  let L=ks.filter(k=>!SKIPM.test(k));if(!L.length)L=ks;L.sort((a,b)=>c[b]-c[a]);return[L[0],+c[L[0]]]}
 let RC=null;
 function recipes(){if(RC)return RC;const R={};const add=(k,sk,lv,xp,c)=>{if(!k||R[k]||!EQ[k]||!c)return;R[k]={sk,mk:Math.max(1,lv|0),xp:Math.max(2,xp|0),c}};
  try{for(const r of SM)add(r.k||(r.arm?'eq_'+r.arm[0]+r.arm[1]:null),SMI,r.lv,r.xp,r.c)}catch(e){self.SQERR&&SQERR(e,'275-2')}
  try{for(const r of GOODS)add(r.k,CRI,r.req,r.xp,r.c)}catch(e){self.SQERR&&SQERR(e,'275-3')}
  try{for(const r of REC)add('eq_'+r.k+(['rod','hoe','can'].includes(r.k)?'':r.t),CRI,r.req,r.xp,r.c)}catch(e){self.SQERR&&SQERR(e,'275-4')}
  add('eq_sword4',SMI,25,300,{sbar:3});// Brann's steel sword (Saltmere): steel-tier
  for(const k in FALLBACK){const f=FALLBACK[k];add(k,f[0],f[1],f[2],f[3])}
  return RC=R}
 try{if(window.SQA&&SQA.onApply)SQA.onApply(()=>{RC=null})}catch(e){self.SQERR&&SQERR(e,'275-5')}
 // {sk, rl (repair level), c (a full repair), xp (for a full repair)} | {no:1} (bought) | null
 function rinfo(k){const b=U.baseOf(k);if(NOREP.has(b))return{no:1};if(SPECIAL[b])return SPECIAL[b];
  const up=U.UP()[b];if(up&&up.core){const c=BEN.CORES.find(q=>q.k===up.core);return c?{sk:up.sk,rl:50,c:{['ibs_'+c.isl]:10},xp:200}:null}
  const r=recipes()[b];if(!r)return null;const m=mainMat(r.c);if(!m)return null;return{sk:r.sk,rl:Math.min(99,r.mk+5),c:{[m[0]]:m[1]/2},xp:Math.max(1,Math.round(r.xp/2))}}
 // what repairing k from d costs: {need:[[mat, units, shards?]], xp}
 function cost(k,d){const r=rinfo(k),mx=maxD(k);if(!r||r.no||!mx||d>=mx)return null;const f=(mx-d)/mx,need=[];
  for(const m in r.c){const a=r.c[m];if(SHM.includes(m))need.push([m,Math.max(1,Math.ceil(a*10*f-1e-9)),true]);else need.push([m,Math.max(1,Math.ceil(a*f-1e-9)),false])}
  return{r,need,xp:Math.max(1,Math.round(r.xp*f)),f}}
 const have=(m,sh)=>sh?(inv[SHK(m)]|0)+10*(inv[m]|0):inv[m]|0;
 const canPay=c=>c.need.every(([m,n,sh])=>have(m,sh)>=n);
 function pay(c){for(const[m,n,sh]of c.need){if(!sh){inv[m]-=n;continue}let left=n;const s=inv[SHK(m)]|0;if(s>=left){inv[SHK(m)]=s-left;continue}left-=s;const bars=Math.ceil(left/10);inv[m]-=bars;inv[SHK(m)]=bars*10-left}}
 const costTxt=c=>c.need.map(([m,n,sh])=>n+' '+esc(sh?shN(m,n):(n===1?INAME[m]||m:SN[m]||INAME[m]||m).toLowerCase())+' (have '+have(m,sh)+')').join(' + ');
 // ---- what you're wearing: WS[slot] = {k (full key, with its upgrade level), d, n (copies of k in the bag, to see it come back)} ----
 const WS={},PWS={},BROKE=new Set();let SETC=0;
 const fullKey=s=>{let b=null;try{b=occ(s)}catch(e){self.SQERR&&SQERR(e,'275-6')}if(!b)return null;const u=U.UPS[s];return u&&u.b===b?U.KEY(b,u.l):b};
 SQSETSLOT.after('275 count slot changes',()=>{SETC++});
 function said(m){try{say(m);msgT=4;if(window.mpLog)mpLog('game',m)}catch(e){self.SQERR&&SQERR(e,'275-7')}}
 function wear(s,n){const w=WS[s];if(!w||!(w.d>0))return;if(fullKey(s)!==w.k)return;const mx=maxD(w.k);if(!mx)return;const d0=w.d;w.d=Math.max(0,w.d-(n||1));
  if(d0>mx*.2&&w.d<=mx*.2&&w.d>0){const r=rinfo(w.k);said('Your '+nm(w.k)+' is wearing out ('+pct(w.d,mx)+'% left). '+(r&&r.no?'Bought gear can\'t be repaired: get a new one soon.':'Repair it at a Blacksmith\'s bench.'))}
  if(w.d<=0)BROKE.add(s)}
 // the per-frame check: a piece that left its slot some other way (a new bow knocking a dagger out, Brann's steel, an upgrade) goes
 // into the bag as its used copy; a new piece starts full (or with the durability it was saved / equipped with)
 function sync(){if(typeof BMERGE!=='undefined'&&BMERGE||window.SQGEARBUSY>0)return;
  for(const s of WSLOTS){const k=fullKey(s),w=WS[s];if(w&&w.k===k){w.n=inv[k]|0;continue}
   if(w&&w.k&&w.d<maxD(w.k)&&(inv[w.k]|0)>(w.n|0)){inv[w.k]--;addW(w.k,w.d)}
   if(!k||!maxD(k)){delete WS[s];continue}
   const p=PWS[s];if(p&&p[0]===k){WS[s]={k,d:Math.min(maxD(k),p[1]),n:inv[k]|0};delete PWS[s];continue}
   WS[s]={k,d:maxD(k),n:inv[k]|0}}}
 function takeOff(s){const w=WS[s];if(!w||w.d>0||fullKey(s)!==w.k)return;const k=w.k,r=rinfo(k);const _s=say;say=()=>{};try{unequipSlot(s)}catch(e){self.SQERR&&SQERR(e,'275-8')}finally{say=_s}
  if(fullKey(s)===k){w.stuck=1;return}
  said('Your '+nm(k)+' is worn out! It\'s in your bag now. '+(r&&r.no?'Bought gear can\'t be repaired: buy a new one.':'Repair it at a Blacksmith\'s bench.'));try{sfx('swish')}catch(e){self.SQERR&&SQERR(e,'275-9')}
  try{if(pnOpen&&(ptab===3||ptab===4))rPn()}catch(e){self.SQERR&&SQERR(e,'275-10')}}
 // equipping: a used copy goes on with its durability; whatever comes off goes in the bag as a used copy if it was worn.
 // While these run, 274's reconcile and sync() wait (window.SQGEARBUSY: 028 saves halfway through), and the game saves again after.
 const busy=f=>{window.SQGEARBUSY=(window.SQGEARBUSY|0)+1;try{return f()}finally{window.SQGEARBUSY--}};
 const resave=()=>{if(!(window.SQGEARBUSY>0))try{saveLocal(true)}catch(e){self.SQERR&&SQERR(e,'275-30')}};
 {const _eq=equipItem;
  function doEquip(self_,k,d){const e=EQ[k],s=e&&e.slot;if(!s||!WSL.has(s)){busy(()=>_eq.call(self_,k));return{ok:true}}
   const w=WS[s]?Object.assign({},WS[s]):null,n0=w&&w.k?inv[w.k]|0:0,dec=w&&w.k===k?1:0,c0=SETC;busy(()=>_eq.call(self_,k));
   if(SETC===c0||fullKey(s)!==k)return{ok:false};
   if(w&&w.k&&w.d<maxD(w.k)&&(inv[w.k]|0)>n0-dec){inv[w.k]--;addW(w.k,w.d)}
   if(maxD(k))WS[s]={k,d:d==null?maxD(k):Math.min(maxD(k),d),n:inv[k]|0};else delete WS[s];return{ok:true,s}}
  equipItem=function(k){const p=parseW(k);
   if(p){if((inv[k]|0)<1||!wreg(k))return;const e=EQ[p.k];if(!e)return;
    if(p.d<=0&&!NEVER(p.k)){const r=rinfo(p.k);say('That '+nm(p.k)+' is worn out. '+(r&&r.no?'Bought gear can\'t be repaired: buy a new one.':'Repair it at a Blacksmith\'s bench first.'));try{sfx('swish')}catch(e2){self.SQERR&&SQERR(e2,'275-11')}return}
    inv[k]--;inv[p.k]=(inv[p.k]|0)+1;let r={ok:false};try{r=doEquip(this,p.k,p.d)}finally{if(!r.ok){inv[p.k]--;inv[k]++}}
    if(r.ok)say('Equipped the '+nm(p.k)+(NEVER(p.k)?'.':' ('+pct(p.d,maxD(p.k))+'% left).'));resave();return}
   doEquip(this,k,null);resave()}}
 {const _ue=unequipSlot;unequipSlot=function(s){const self_=this,args=arguments,w=WS[s]?Object.assign({},WS[s]):null,n0=w&&w.k?inv[w.k]|0:0;const out=busy(()=>_ue.apply(self_,args));
   try{if(w&&fullKey(s)!==w.k){if(w.d<maxD(w.k)&&(inv[w.k]|0)>n0){inv[w.k]--;addW(w.k,w.d)}delete WS[s]}}catch(e){self.SQERR&&SQERR(e,'275-12')}resave();return out}}
 // ---- wear ----
 const offKind=()=>{const k=fullKey('off'),e=k&&EQ[k];return e?e.kind:null};
 SQHIT.wrap('275 weapons wear per hit that lands',next=>function(){const hp0=[];try{for(const n of en)if(n&&!n.dead)hp0.push([n,n.hp])}catch(e){self.SQERR&&SQERR(e,'275-13')}
  const d0=typeof DMGS!=='undefined'?DMGS.length:0,stab=!!window.SQSTABNOW;const out=next.apply(this,arguments);
  try{let hit=hp0.some(([n,h])=>n.hp<h);if(!hit&&typeof DMGS!=='undefined'&&DMGS.length>d0)hit=true;
   if(hit){if(stab)wear('off');else{wear('main');if(offKind()==='dagger')wear('off')}}}catch(e){self.SQERR&&SQERR(e,'275-14')}return out});
 {const _sa=shootAim;shootAim=function(){const n0=PROJ.length,s0=SPELLS.length;const out=_sa.apply(this,arguments);
   try{if(PROJ.slice(n0).some(p=>p&&p.k==='arrow'&&!p.hostile)||SPELLS.length>s0){const k=offKind();if(k==='bow'||k==='wand')wear('off')}}catch(e){self.SQERR&&SQERR(e,'275-15')}return out}}
 SQADDXP.after('275 tools wear per log, ore and catch',(i,x)=>{if(!(x>0&&x<=3000)||window.SQNOWEAR)return;/* SQNOWEAR: 287's quarter payouts (an axe wears once a felled tree) */if(i===1)wear('axe');else if(i===2)wear('pick');else if(i===9)wear('rod')});
 let LH=0,T2=0;
 // a used +3 (from before +3s stopped wearing) that reaches the bag becomes a plain +3
 function plain3(){if(typeof BMERGE!=='undefined'&&BMERGE||window.SQGEARBUSY>0)return;for(const k of WREG){const c=inv[k]|0;if(c<1)continue;const p=parseW(k);if(p&&NEVER(p.k)){inv[k]=0;inv[p.k]=(inv[p.k]|0)+c}}}
 // used copies in the guild bank (loaded from the database, 197) get known too, so the bank screen can show them
 const scanLive=()=>{try{const g=window.SQGUILD&&SQGUILD.state,b=g&&g.bank&&g.bank.i;if(b&&typeof b==='object')for(const k in b)if(k[0]==='w'&&!WREG.has(k))wreg(k)}catch(e){self.SQERR&&SQERR(e,'275-31')}};
 SQUPD.after('275 gear wears and comes off worn out',(dt)=>{try{if((T2+=(+dt||0))>2){T2=0;scanLive();plain3()}
   if(!dead){const h=+hurt||0;if(h>LH+1e-4&&h>=.3)for(const s of ARMS)wear(s,ARMW);LH=h}else LH=0;
   sync();if(BROKE.size&&!dead&&!(typeof BMERGE!=='undefined'&&BMERGE)){const L=[...BROKE];BROKE.clear();for(const s of L)takeOff(s)}}catch(e){self.SQERR&&SQERR(e,'275-16')}});
 // ---- saves ----
 try{KNOWN49.add('dur');KNOWN49.add('durv')}catch(e){self.SQERR&&SQERR(e,'275-17')}
 SQSAVE.wrap('275 settle durability first',next=>function(){try{U.reconcile();sync()}catch(e){self.SQERR&&SQERR(e,'275-18')}return next.apply(this,arguments)});
 SQSAVE.after('275:dur',s=>{if(s.inv)for(const k in s.inv)if(k[0]==='w'&&WREG.has(k)&&!(s.inv[k]>0))delete s.inv[k];
  const o={};for(const sl in WS){const w=WS[sl];if(w&&w.k&&w.d<maxD(w.k))o[sl]=[w.k,w.d]}for(const sl in PWS)if(!o[sl])o[sl]=PWS[sl];if(Object.keys(o).length)s.dur=o;s.durv=DURV});
 // register every worn copy in the save (bag, house chests, yards, island homes) before the loaders keep only known items
 const scanS=(o,dep)=>{if(!o||dep>10)return;if(typeof o==='string'){if(o.length<4e6&&o.indexOf('"w')>=0){const re=/"(w\d{1,7}_(?:u[123]_)?[a-z0-9_]{3,60})"/g;let m;while((m=re.exec(o)))wreg(m[1])}return}
  if(typeof o!=='object')return;if(Array.isArray(o)){for(const v of o)if(v&&(typeof v==='object'||typeof v==='string'))scanS(v,dep+1);return}
  for(const k in o){if(k[0]==='w'&&WRE.test(k))wreg(k);const v=o[k];if(v&&(typeof v==='object'||typeof v==='string'))scanS(v,dep+1)}};
 // saves from before Nov 24 (no durv): used +1/+2 copies keep the share they had (their number x 10 / 1.1 or x 100 / 1.2), used +3s
 // become plain +3s; in JSON strings (island homes) +3s stay as they are (a plain key could clash) and plain3() turns them over later
 const DURV=2;
 function migK(k,keep3){const p=parseW(k);if(!p)return null;const L=U.lvlOf(p.k);if(!L)return null;if(L>=3)return keep3?null:p.k;
  return WK(p.k,Math.round(p.d*UPX(L)/OLDX(L)))}
 function migrate(o,dep){if(!o||typeof o!=='object'||dep>10)return;const isA=Array.isArray(o);
  for(const k of isA?o.keys():Object.keys(o)){let v=o[k];
   if(typeof v==='string'){if(v.length<4e6&&v.indexOf('"w')>=0)o[k]=v.replace(/"(w\d{1,5}_u[123]_[a-z0-9_]{3,60})"/g,(m,w)=>'"'+(migK(w,true)||w)+'"');continue}
   if(v&&typeof v==='object')migrate(v,dep+1)}
  if(isA)return;// renames last, all at once, so a new key is never migrated twice
  const mv=[];for(const k of Object.keys(o))if(k[0]==='w'&&WRE.test(k)){const nk=migK(k,false);if(nk&&nk!==k)mv.push([k,nk,o[k]])}
  for(const[k]of mv)delete o[k];
  for(const[,nk,v]of mv){if(typeof v==='number'||typeof v==='string'&&/^\d+$/.test(v))o[nk]=(+o[nk]||0)+(+v||0);else if(!(nk in o))o[nk]=v}}
 SQLOAD.before('275 worn copies',S=>{try{if(S&&typeof S==='object'&&!(+S.durv>=DURV)){migrate(S,0);
    const D=S.dur;if(D&&typeof D==='object')for(const sl in D){const a=D[sl];if(!Array.isArray(a)||typeof a[0]!=='string')continue;const L=U.lvlOf(a[0]);if(L>=3)delete D[sl];else if(L>=1)a[1]=Math.round((+a[1]||0)*UPX(L)/OLDX(L))}}}catch(e){self.SQERR&&SQERR(e,'275-32')}
  try{scanS(S,0)}catch(e){self.SQERR&&SQERR(e,'275-19')}});
 SQLOAD.after('275',S=>{for(const k in WS)delete WS[k];for(const k in PWS)delete PWS[k];BROKE.clear();
  const D=S&&S.dur;if(D&&typeof D==='object')for(const s in D){const a=D[s];if(!WSL.has(s)||!Array.isArray(a)||typeof a[0]!=='string'||!(a[1]>=0&&a[1]<=1e7))continue;PWS[s]=[a[0],a[1]|0]}
  try{sync()}catch(e){self.SQERR&&SQERR(e,'275-20')}});
 SQNEWGAME.before('275',()=>{for(const o of[WS,PWS])for(const k in o)delete o[k];BROKE.clear()});
 // ---- falling: used copies in the bag are gear, so they stay with you like the gear you wear (274 does the same for upgraded copies) ----
 const gearK=k=>typeof k==='string'&&k[0]==='w'&&WREG.has(k);
 {const _kf=window.SQKEEPFALL;window.SQKEEPFALL=function(k){if(dead&&gearK(k))return true;return typeof _kf==='function'?_kf.apply(this,arguments):false}}
 {const _rs=reset;reset=function(){let keep=null;if(dead&&!(typeof NEWG!=='undefined'&&NEWG)){keep={};for(const k in inv)if((inv[k]|0)>0&&gearK(k))keep[k]=inv[k]|0}
   const out=_rs.apply(this,arguments);if(keep)for(const k in keep)inv[k]=keep[k];return out}}
 // ---- icons: a used copy has a durability bar along the bottom; shards are chips of their bar ----
 const ICO={};const barCol=f=>f>.5?'#58c058':f>.2?'#e0c040':'#e05040';
 function barred(w,url,f){const c0=ICO[w];if(c0&&c0.src===url)return c0.url||url;ICO[w]={src:url,url:null};
  try{const im=new Image();im.onload=()=>{try{const W0=im.naturalWidth||14,H0=im.naturalHeight||14,c=document.createElement('canvas');c.width=W0;c.height=H0;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(im,0,0);
     if(!(f>0)){x.globalCompositeOperation='source-atop';x.fillStyle='rgba(120,120,120,.55)';x.fillRect(0,0,W0,H0);x.globalCompositeOperation='source-over'}// worn out: greyed
     const z=Math.max(1,Math.round(W0/14));x.fillStyle=f>0?'#1c1410':'#e05040';x.fillRect(z,H0-3*z,W0-2*z,2*z);x.fillStyle=barCol(f);x.fillRect(z,H0-3*z,Math.max(f>0?z:0,Math.round((W0-2*z)*f)),2*z);
     if(ICO[w]&&ICO[w].src===url){ICO[w].url=c.toDataURL();try{if(pnOpen)rPn()}catch(e){self.SQERR&&SQERR(e,'275-21')}}}catch(e){self.SQERR&&SQERR(e,'275-22')}};im.src=url}catch(e){self.SQERR&&SQERR(e,'275-23')}return url}
 SQICON.wrap('275',_ic=>function(k,col){
  if(typeof k==='string'&&k[0]==='w'&&WREG.has(k)){const p=parseW(k),mx=maxD(p.k);if(NEVER(p.k))return EQ[p.k]?eqIcon(p.k):_ic.call(this,p.k,col);const base=EQ[p.k]?eqIcon(p.k):_ic.call(this,p.k,col);return barred(k,base,mx?p.d/mx:0)}
  if(typeof k==='string'&&k.slice(0,4)==='shd_'&&SHC[k.slice(4)]){const key='g283'+k;if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,ww,hh,cl)=>{x.fillStyle=cl;x.fillRect(a,b,ww,hh)};
   const[a,b,d]=SHC[k.slice(4)];r(6,3,2,1,a);r(5,4,4,1,a);r(4,5,3,1,a);r(7,5,3,1,b);r(4,6,6,1,b);r(3,7,7,1,b);r(3,8,8,1,d);r(4,9,6,1,d);r(5,10,4,1,d);r(6,4,1,1,'#ffffff');
   return ICONC[key]=c.toDataURL()}
  return _ic.apply(this,arguments)});
 // ---- the equipment screen: a durability bar on every slot, the numbers on the tapped one, used copies in the Equip list ----
 const barH=f=>'<i style="display:block;height:3px;margin-top:3px;background:rgba(0,0,0,.18);border-radius:2px"><i style="display:block;height:3px;width:'+Math.round(100*f)+'%;background:'+barCol(f)+';border-radius:2px"></i></i>';
 {const _eh=equipHTML;equipHTML=function(){let h=_eh.apply(this,arguments);try{
   for(const s in WS){const w=WS[s];if(!w||fullKey(s)!==w.k)continue;const mx=maxD(w.k);if(!mx)continue;const i=h.indexOf('data-s="'+s+'"');if(i<0)continue;const j=h.indexOf('</button>',i);if(j<0)continue;
    const seg=h.slice(i,j),q=seg.lastIndexOf('</div>');if(q<0)continue;h=h.slice(0,i)+seg.slice(0,q)+barH(w.d/mx)+seg.slice(q)+h.slice(j)}
   const sel=typeof EQSEL!=='undefined'&&EQSEL;if(sel&&WSL.has(sel)){const a=h.indexOf('<div class="qc" style="margin-top:10px"><b>'),c=a<0?-1:h.indexOf('</b>',a);
    const w=WS[sel],ok=w&&fullKey(sel)===w.k;let line='';
    if(ok){const mx=maxD(w.k),r=rinfo(w.k);line='<p style="margin:4px 0 6px;font-size:12px;color:#5a4a30">Durability '+w.d.toLocaleString('en-US')+' / '+mx.toLocaleString('en-US')+' ('+pct(w.d,mx)+'%). '+(r&&r.no?'Bought gear can\'t be repaired: buy a new one when it wears out.':r?'Repair it at a Blacksmith\'s bench ('+SKN[r.sk]+' '+r.rl+').':'')+'</p>'}
    const used=[...WREG].filter(k=>(inv[k]|0)>0&&EQ[k]&&EQ[k].slot===sel).sort((x,y)=>parseW(y).d-parseW(x).d);
    let btn='';for(const k of used){const p=parseW(k);if(p.d>0)btn+='<button class="sb eqo" data-k="'+k+'" style="margin:6px 0">Equip the '+esc(String(INAME[k]).toLowerCase())+((inv[k]|0)>1?' (×'+inv[k]+')':'')+'</button>';
     else btn+='<p style="margin:4px 0;font-size:12px;opacity:.75">'+esc(INAME[k])+((inv[k]|0)>1?' ×'+inv[k]:'')+': repair it at a Blacksmith\'s bench before you wear it.</p>'}
    if(c>=0&&line)h=h.slice(0,c+4)+line+h.slice(c+4);
    if(btn){if(used.some(k=>parseW(k).d>0))h=h.replace('<p style="opacity:.7">Nothing in your bag for this slot.</p>','');const b=h.indexOf('<button class="sb equ"');
     if(b>=0)h=h.slice(0,b)+btn+h.slice(b);else{const a2=h.indexOf('<div class="qc" style="margin-top:10px"><b>'),c2=a2<0?-1:h.indexOf('</b>',a2);if(c2>=0)h=h.slice(0,c2+4)+btn+h.slice(c2+4)}}}
  }catch(e){self.SQERR&&SQERR(e,'275-24')}return h}}
 // ---- the bench: repairs ----
 // everything that could be repaired: what you wear ('@slot') and used copies in the bag
 function items(){const L=[];for(const s of WSLOTS){const w=WS[s];if(w&&fullKey(s)===w.k&&w.d<maxD(w.k))L.push({id:'@'+s,k:w.k,d:w.d,n:1,on:true})}
  for(const k of WREG){const c=inv[k]|0;if(c<1)continue;const p=parseW(k);if(p.d<maxD(p.k))L.push({id:k,k:p.k,d:p.d,n:c,on:false})}return L}
 function state(it){const c=cost(it.k,it.d),r=rinfo(it.k);const o={it,c,r,no:!!(r&&r.no),none:!r};if(c){o.okL=lvOf(c.r.sk)>=c.r.rl;o.pay=canPay(c);o.ok=o.okL&&o.pay}return o}
 function find(id){return items().find(x=>x.id===id)||null}
 function repair(id){const it=find(id);if(!it){say('There\'s nothing to repair there.');return false}const o=state(it),n=nm(it.k);
  if(o.no){say('Bought gear can\'t be repaired: buy a new '+n+'.');return false}if(!o.c){say('That can\'t be repaired here.');return false}
  if(!o.okL){say('You need '+SKN[o.c.r.sk]+' '+o.c.r.rl+' to repair '+(/^[aeiou]/i.test(n)?'an ':'a ')+n+'.');return false}
  if(!o.pay){say('You need '+o.c.need.map(([m,q,sh])=>q+' '+(sh?shN(m,q):(q===1?INAME[m]||m:SN[m]||INAME[m]||m).toLowerCase())).join(' and ')+' to repair it.');return false}
  pay(o.c);if(it.on){const w=WS[it.id.slice(1)];if(w)w.d=maxD(w.k)}else{inv[it.id]--;inv[it.k]=(inv[it.k]|0)+1}
  addXp(o.c.r.sk,o.c.xp);say('You repair '+(it.on?'your ':'the ')+n+'. Good as new!');try{sfx('anvil')}catch(e){self.SQERR&&SQERR(e,'275-25')}return true}
 function html(){let h='<div class="tl" style="margin-top:14px">Repairs</div><div class="tl" style="font-size:12px;font-weight:400;opacity:.75">Gear wears down as you use it. A full repair costs half of the item\'s main material (bars split into 10 shards; spare shards fuse back into a bar at a furnace) at the level that makes it + 5. Bought gear can\'t be repaired.</div>';
  const L=items().map(state);if(!L.length)return h+'<div class="qc"><p>Nothing needs repairing. Weapons wear per hit, bows and wands per shot, armour per hit you take, and axes, pickaxes and rods per log, ore or fish.</p></div>';
  L.sort((a,b)=>(b.it.on-a.it.on)||((b.ok|0)-(a.ok|0))||(a.it.d/maxD(a.it.k)-b.it.d/maxD(b.it.k)));
  const okN=L.filter(o=>o.ok).reduce((a,o)=>a+(o.it.on?1:o.it.n),0);
  if(okN>1)h+='<button class="sb stb" data-a="smrall" style="margin:4px 0 6px">Repair everything you can ('+okN+')</button>';
  for(const o of L){const it=o.it,mx=maxD(it.k),p=pct(it.d,mx),ic=it.on?eqIcon(it.k):iconURL(it.id),lab=(it.on?'Repair your ':'Repair the ')+esc(nm(it.k))+' ('+(it.d>0?p+'%':'worn out')+')'+(!it.on&&it.n>1?' ×'+it.n:'');
   const img='<img alt="" src="'+ic+'" style="width:20px;height:20px;image-rendering:pixelated;vertical-align:middle;margin-right:6px">';
   if(o.no||o.none){h+='<div class="qc" style="margin:4px 0;opacity:.6">'+img+esc(INAME[it.id]||nm(it.k))+'<br><small>'+(o.no?'Bought gear can\'t be repaired: buy a new one.':'This can\'t be repaired at the bench.')+'</small></div>';continue}
   const sub=costTxt(o.c)+' · '+(o.okL?o.c.xp.toLocaleString('en-US')+' xp':'needs '+SKN[o.c.r.sk]+' '+o.c.r.rl)+(it.on?' · you\'re wearing it':'');
   h+='<div style="display:flex;gap:6px;align-items:stretch"><button class="sb stb" data-a="smr|'+it.id+'" style="flex:1;opacity:'+(o.ok?1:.45)+'">'+img+lab+'<br><small>'+sub+'</small></button>'+(o.ok&&!it.on&&it.n>1?'<button class="sb stb" data-a="smra|'+it.id+'" style="width:64px">ALL</button>':'')+'</div>'}
  return h}
 {const _sa=stationAct;stationAct=function(a){const st=STATION;if(!(st&&st.t==='smithbench'&&/^smr(a?\||all$)/.test(a||'')))return _sa.apply(this,arguments);
   let ids=[];if(a==='smrall'){for(const o of items().map(state))if(o.ok)for(let i=0;i<(o.it.on?1:o.it.n);i++)ids.push(o.it.id)}
   else{const id=a.slice(a.indexOf('|')+1),it=find(id);if(!it){rPn();return}const o=state(it);if(!o.ok){repair(id);rPn();return}ids=a.startsWith('smra|')?Array(it.n).fill(id):[id]}
   if(!ids.length){say('Nothing you can repair right now.');return}
   let i=0;if(sqDo('smith',ids.length,()=>{repair(ids[i++])})){try{SQDO.d=2.5;SQDO.tot=ids.length;BEN.markWork('core_silver')}catch(e){self.SQERR&&SQERR(e,'275-26')}say('Repairing...');return}
   for(const id of ids)repair(id);saveLocal(true);rPn()}}
 // ---- the furnace: shards fuse back into bars ----
 {const _sh=stationHTML;stationHTML=function(o){let h=_sh.apply(this,arguments);try{if(!o||o.t!=='furnace'||typeof h!=='string')return h;const L=SHM.filter(m=>(inv[SHK(m)]|0)>0);if(!L.length)return h;
   let s='<div class="tl" style="margin-top:14px">Shards</div><div class="tl" style="font-size:12px;font-weight:400;opacity:.75">Left over from repairs. 10 shards fuse back into a bar.</div>';
   for(const m of L){const n=inv[SHK(m)]|0,c=Math.floor(n/10),bn=(m==='turtfrag'?'turtle fragment':nm(m));
    s+='<div style="display:flex;gap:6px;align-items:stretch"><button class="sb stb" data-a="sdf_'+m+'" style="flex:1;opacity:'+(c?1:.45)+'"><img alt="" src="'+iconURL(SHK(m))+'" style="width:20px;height:20px;image-rendering:pixelated;vertical-align:middle;margin-right:6px">Fuse 10 '+esc(shN(m,10))+' into '+(/^[aeiou]/i.test(bn)?'an ':'a ')+esc(bn)+'<br><small>have '+n+'</small></button>'+(c>1?'<button class="sb stb" data-a="sdfa_'+m+'" style="width:64px">ALL</button>':'')+'</div>'}
   const i=h.indexOf('<button class="ng stb" data-a="pickup"');return i>=0?h.slice(0,i)+s+h.slice(i):h+s}catch(e){self.SQERR&&SQERR(e,'275-27')}return h}}
 {const _sa=stationAct;stationAct=function(a){const st=STATION;if(!(st&&st.t==='furnace'&&/^sdfa?_/.test(a||'')))return _sa.apply(this,arguments);
   const m=a.replace(/^sdfa?_/,'');if(!SHM.includes(m))return;const n=inv[SHK(m)]|0,c=a.startsWith('sdfa_')?Math.floor(n/10):Math.min(1,Math.floor(n/10));
   if(c<1){say('You need 10 '+shN(m,10)+'.');return}inv[SHK(m)]-=10*c;inv[m]=(inv[m]|0)+c;say('You fuse '+10*c+' '+shN(m,10*c)+' into '+c+' '+(c>1?SN[m]||INAME[m]:INAME[m]).toLowerCase()+'.');try{sfx('pickup')}catch(e){self.SQERR&&SQERR(e,'275-28')}saveLocal(true);rPn()}}
 // ---- skill trees ----
 {const _tg=treeGains;treeGains=function(sk,l){const a=_tg.apply(this,arguments);try{if((sk===SMI||sk===CRI)&&l===6)return[...a,'Repair worn gear at a Blacksmith\'s bench (5 levels above the level that makes it)']}catch(e){self.SQERR&&SQERR(e,'275-29')}return a}}
 window.SQREPAIR={TIER,WS,PWS,WREG,maxD,NEVER,migrate,plain3,DURV,parseW,WK,wreg,addW,wear,sync,rinfo,cost,items,state,repair,html,fullKey,recipes,mainMat,SHM,SHK};
})();
