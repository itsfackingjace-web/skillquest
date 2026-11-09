// ---------------------------------------------------------------- 65. Mithril and adamant gear; stats on every item
// - Anvil recipes from the new bars: Mithril sword / helmet / legs / chestplate (Smithing 50-56, wear at Defence 30,
//   wield at Attack 30) and Adamant (Smithing 65-72, Defence 40, Attack 40). Swords are tiers 6 and 7, armor tiers 4 and 5.
// - Every weapon, armor piece, tool and food shows its stats in its description (damage, block, range, mana, healing,
//   set bonuses, requirements) and how it compares with what you have equipped.
{const MITH=['#5868c8','#a8b8f8'],ADAM=['#3a8a50','#98e0a8'];
 TIER_N.push('Crystal','Mithril','Adamant');TCOL[5]=TCOL[5]||'#68d8f8';TCOL.push('#7888e0','#48b060');AT.push('Mithril','Adamant');AC3.push(MITH[0],ADAM[0]);
 const add=(k,e,d)=>{EQ[k]=e;EQK.push(k);INVK.push(k);EXTRA_BAG.push(k);INAME[k]=e.n;SELLP[k]=e.v;SN[k]=e.n+'s';SHORT[k]=e.n.toLowerCase();IDESC[k]=d};
 add('eq_sword6',{slot:'main',kind:'sword',tier:6,n:'Mithril sword',ic:'sword',col:'#7888e0',v:320,atk:30},'A light, razor-sharp blade.');
 add('eq_sword7',{slot:'main',kind:'sword',tier:7,n:'Adamant sword',ic:'sword',col:'#48b060',v:640,atk:40},'A heavy blade that cuts through anything.');
 for(const[s,nm]of[['helm','helmet'],['body','chestplate'],['legs','legs']]){
  add('eq_'+s+'4',{slot:s,arm:4,n:'Mithril '+nm,ic:s,col:MITH[0],v:{helm:180,body:360,legs:270}[s]},'Mithril armor.');
  add('eq_'+s+'5',{slot:s,arm:5,n:'Adamant '+nm,ic:s,col:ADAM[0],v:{helm:360,body:720,legs:540}[s]},'Adamant armor.')}
 SM.push({k:'eq_sword6',n:'Mithril sword',c:{mbar:2},lv:50,xp:240},{k:'eq_helm4',n:'Mithril helmet',c:{mbar:2},lv:50,xp:220,def:30},{k:'eq_legs4',n:'Mithril legs',c:{mbar:3},lv:53,xp:320,def:30},{k:'eq_body4',n:'Mithril chestplate',c:{mbar:4},lv:56,xp:420,def:30},
  {k:'eq_sword7',n:'Adamant sword',c:{abar:2},lv:65,xp:380},{k:'eq_helm5',n:'Adamant helmet',c:{abar:2},lv:65,xp:360,def:40},{k:'eq_legs5',n:'Adamant legs',c:{abar:3},lv:68,xp:500,def:40},{k:'eq_body5',n:'Adamant chestplate',c:{abar:4},lv:72,xp:640,def:40});
 // requirements to wear and wield
 const DEFREQ={4:30,5:40},needs=e=>e.arm>=4?['Defence',8,DEFREQ[e.arm]]:e.atk?['Attack',0,e.atk]:null;
 const _eq65=equipItem;equipItem=function(k){const e=EQ[k];const n=e&&needs(e);if(n&&lvOf(n[1])<n[2]){say('You need '+n[0]+' '+n[2]+' to use the '+e.n.toLowerCase()+'.');sfx('swish');return}return _eq65(k)};
 // how they look on you
 const _gc65=gearCH;gearCH=function(){const c=_gc65();if(ARM.helm>=4){c.ht=2;c.hcol=HB+5+ARM.helm-4}if(ARM.body>=4)c.sh=SB+5+ARM.body-4;if(ARM.legs>=4)c.pn=PB+5+ARM.legs-4;return c};
 const _kl65=kitLook;kitLook=function(ch){const o=_kl65(ch),tc=i=>i===0?MITH:ADAM,sh=ch.sh|0,pn=ch.pn|0,hc=ch.hcol|0;
  if(!ch.mr&&(sh===SB+5||sh===SB+6)){const t=tc(sh-SB-5);o.body='plate';o.bc=t[0];o.ba=t[1]}
  if(pn===PB+5||pn===PB+6){const t=tc(pn-PB-5);o.legs='greaves';o.lc=t[0];o.la=t[1]}
  if(!ch.mh&&ch.ht===2&&(hc===HB+5||hc===HB+6)){const t=tc(hc-HB-5);o.head='helm';o.hc=t[0];o.ha=t[1]}return o};
 if(typeof KITC!=='undefined')KITC.clear();
 // saves: keep tiers above the old caps
 const _ap65=applySave;applySave=function(S){_ap65(S);if(S.arm)for(const s of['helm','body','legs']){const v=+S.arm[s]|0;if(v>=4&&v<=5)ARM[s]=v}
  if(S.rare&&(+S.rare.sword===6||+S.rare.sword===7))TL.sword=+S.rare.sword;if(typeof snapEq==='function')snapEq()};
 // ---- stats ----
 const withTemp=(o,k,v,f)=>{const old=o[k];o[k]=v;try{return f()}finally{o[k]=old}};
 const meleeOf=t=>1+t+Math.floor(lvOf(0)/15)+(typeof meleeFlat==='function'?meleeFlat():0);
 const pct=x=>Math.round(x*100)+'%';
 function eqStats(k){const e=EQ[k];if(!e)return'';const L=[];const cur=occ(e.slot),same=cur===k;
  if(e.kind==='sword'){const d=meleeOf(e.tier),c=meleeOf(TL.sword);L.push('Damage '+d+' per hit');if(!same)L.push(cur?(d>c?'+'+(d-c)+' vs your '+EQ[cur].n.toLowerCase():d<c?(d-c)+' vs your '+EQ[cur].n.toLowerCase():'same as your '+EQ[cur].n.toLowerCase()):'+'+(d-meleeOf(0))+' vs bare hands')}
  else if(e.kind==='bow'){const d=withTemp(TL,'bow',e.tier,()=>arrowDmg()),r=withTemp(TL,'bow',e.tier,()=>bowRange());L.push('Arrow damage '+d,'Range '+r);
   if(!same&&TL.bow){const cd=arrowDmg();if(d!==cd)L.push((d>cd?'+':'')+(d-cd)+' damage vs your bow')}}
  else if(e.kind==='wand'){const W2=WSP[e.el];L.push((e.el[0].toUpperCase()+e.el.slice(1))+' spells','Damage '+spellDmg(e.el),'Costs '+W2.cost+' mana',e.el==='fire'?'Sets enemies on fire':e.el==='ice'?'Slows enemies':'Strikes hard');if(e.lv>1)L.push('Needs Magic '+e.lv)}
  else if(e.arm){const b=e.arm*.05,cb=ARM[e.slot]*.05;L.push('Block +'+pct(b));if(!same&&cur&&EQ[cur].arm!==undefined&&b!==cb)L.push((b>cb?'+':'')+pct(b-cb)+' vs your '+EQ[cur].n.toLowerCase());
   L.push('Your block chance now: '+pct(blockCh()));const req=e.arm>=4?DEFREQ[e.arm]:[0,0,10,20][e.arm];if(req)L.push('Needs Defence '+req)}
  else if(e.cls==='r')L.push('Ranger set: +range per piece','2 pieces: +1 arrow damage','3 pieces: +2 arrow damage');
  else if(e.cls==='m'){L.push('Mage set: faster mana per piece','2 pieces: +1 spell damage','3 pieces: +2 spell damage');if(e.lv)L.push('Needs Magic '+e.lv)}
  else if(e.slot==='axe'||e.slot==='pick'){L.push((e.slot==='axe'?'Chop':'Mine')+' power '+(e.slot==='axe'?1+e.tier:e.tier));const t=TL[e.slot];if(!same&&t&&t!==e.tier)L.push((e.tier>t?'Stronger':'Weaker')+' than yours')}
  if(e.kind==='sword'&&e.atk)L.push('Needs Attack '+e.atk);
  return L.join(' · ')}
 function foodStats(k){const f=FOODS.find(q=>q.k===k);if(!f)return'';const L=[];if(f.heal)L.push('Heals '+f.heal+' HP');if(f.hun)L.push('Food +'+f.hun);return L.join(' · ')}
 // every description shows its stats first
 const BASE={};for(const k in IDESC)BASE[k]=IDESC[k];
 const statsFor=k=>EQ[k]?eqStats(k):isFood(k)?foodStats(k):'';
 const wrapDesc=k=>{if(Object.getOwnPropertyDescriptor(IDESC,k)&&Object.getOwnPropertyDescriptor(IDESC,k).get)return;if(!(k in BASE))BASE[k]=IDESC[k];
  Object.defineProperty(IDESC,k,{configurable:true,enumerable:true,get(){let s='';try{s=statsFor(k)}catch(e){}return(s?s+'. ':'')+(BASE[k]||'')},set(v){BASE[k]=v}})};
 for(const k of new Set([...EQK,...FOODS.map(f=>f.k)]))wrapDesc(k);
 IDESC.eq_sword5='LEGENDARY. A blade of living crystal from the depths of the Slime Caverns.';
 window.SQSTATS=statsFor}
