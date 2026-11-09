// ---------------------------------------------------------------- 78. Mithril and adamant bows and wands
// Ranged and magic catch up with melee. At the anvil (Smithing):
//   Mithril bow (3 mithril bars + 3 maple logs, Smithing 52; Archery 30 to use): arrows +2 damage over a longbow, range 195
//   Adamant bow (3 adamant bars + 3 yew logs, Smithing 67; Archery 40): arrows +4 over a longbow, range 220
//   Mithril fire / ice / storm wand (2 mithril bars + a ruby / sapphire / emerald, Smithing 54; Magic 30): +1 spell damage
//   Adamant fire / ice / storm wand (2 adamant bars + 2 of that gem, Smithing 69; Magic 40): +2 spell damage
{const MITH='#7888e0',ADAM='#48b060';let WT=0;   // the equipped wand's tier: 0 normal, 1 mithril, 2 adamant
 const add=(k,e,d)=>{EQ[k]=e;EQK.push(k);INVK.push(k);EXTRA_BAG.push(k);INAME[k]=e.n;SELLP[k]=e.v;SN[k]=e.n+'s';SHORT[k]=e.n.toLowerCase();IDESC[k]=d;inv[k]=inv[k]|0};
 add('eq_bow4',{slot:'off',kind:'bow',tier:4,n:'Mithril bow',ic:'bow',col:MITH,v:420,arch:30},'A mithril bow: arrows hit harder and fly further than a longbow. Needs Archery 30.');
 add('eq_bow5',{slot:'off',kind:'bow',tier:5,n:'Adamant bow',ic:'bow',col:ADAM,v:840,arch:40},'An adamant bow: the hardest-hitting, furthest-shooting bow you can make. Needs Archery 40.');
 const GEM={fire:'ruby',ice:'sapphire',storm:'emerald'},EL={fire:'fire',ice:'ice',storm:'storm'};
 for(const el in GEM){const N=el[0].toUpperCase()+el.slice(1);
  add('eq_w'+el+'_m',{slot:'off',kind:'wand',el,wt:1,n:'Mithril '+el+' wand',ic:'w'+el,col:MITH,v:450,lv:30},'Casts '+el+' spells, +1 damage over a normal '+el+' wand. Needs Magic 30.');
  add('eq_w'+el+'_a',{slot:'off',kind:'wand',el,wt:2,n:'Adamant '+el+' wand',ic:'w'+el,col:ADAM,v:900,lv:40},'Casts '+el+' spells, +2 damage over a normal '+el+' wand. Needs Magic 40.')}
 SM.push({k:'eq_bow4',n:'Mithril bow',c:{mbar:3,maplelog:3},lv:52,xp:300},{k:'eq_bow5',n:'Adamant bow',c:{abar:3,yewlog:3},lv:67,xp:480});
 for(const el in GEM){SM.push({k:'eq_w'+el+'_m',n:'Mithril '+el+' wand',c:{mbar:2,[GEM[el]]:1},lv:54,xp:320});SM.push({k:'eq_w'+el+'_a',n:'Adamant '+el+' wand',c:{abar:2,[GEM[el]]:2},lv:69,xp:520})}
 // what's in your off-hand
 const _occ=occ;occ=function(slot){const k=_occ(slot);if(slot==='off'&&WAND&&WT)return'eq_w'+WAND+(WT===2?'_a':'_m');return k};
 const _ss=setSlot;setSlot=function(slot,k){_ss(slot,k);if(slot==='off'){const e=k?EQ[k]:null;WT=e&&e.kind==='wand'?(e.wt|0):0}};
 const _eq=equipItem;equipItem=function(k){const e=EQ[k];if(e&&e.arch&&lvOf(FL)<e.arch){say('You need Archery '+e.arch+' to use the '+e.n.toLowerCase()+'.');sfx('swish');return}return _eq(k)};
 // a crafted bow that knocks your wand out of your hand gives back the right wand
 const _wu=watchUpgrades;watchUpgrades=function(){const wk=WAND&&WT?occ('off'):null;_wu();if(wk&&!WAND){const base='eq_w'+wk.slice(4).split('_')[0];if((inv[base]|0)>0){inv[base]--;inv[wk]=(inv[wk]|0)+1}WT=0}};
 // stats
 const _ad=arrowDmg;arrowDmg=function(){return _ad()+(TL.bow===4?-1:TL.bow===5?1:0)};
 const _br=bowRange;bowRange=function(){return _br()+(TL.bow===4?-10:TL.bow===5?15:0)};
 const _sd=spellDmg;spellDmg=function(el){return _sd(el)+WT};
 // saving
 const _sn=snap;snap=function(){const s=_sn();if(WT)s.wt=WT;if(TL.bow>=4){s.tl=s.tl||{};s.tl.bow=TL.bow}return s};
 const _ap=applySave;applySave=function(S){_ap(S);WT=WAND&&(S.wt===1||S.wt===2)?S.wt:0;const b=S&&S.tl&&+S.tl.bow;if(b===4||b===5){TL.bow=b;WAND=null;WT=0}if(typeof snapEq==='function')snapEq()};
 const _ng=newGame;newGame=function(){WT=0;_ng()};
 // stats on the item descriptions (with how they compare)
 for(const k of['eq_bow4','eq_bow5','eq_wfire_m','eq_wice_m','eq_wstorm_m','eq_wfire_a','eq_wice_a','eq_wstorm_a']){const base=IDESC[k];
  Object.defineProperty(IDESC,k,{configurable:true,enumerable:true,get(){const e=EQ[k];let s='';try{if(e.kind==='bow'){const t=TL.bow;TL.bow=e.tier;const d=arrowDmg(),r=bowRange();TL.bow=t;s='Arrow damage '+d+' · Range '+r+'. '}
     else{const w=WT;WT=e.wt;const d=spellDmg(e.el);WT=w;s='Damage '+d+' · Costs '+WSP[e.el].cost+' mana. '}}catch(err){}return s+base},set(v){}})}
 // icons: the usual bow / wand, recoloured mithril blue or adamant green (made once the plain icon has loaded)
 const _ic=iconURL;iconURL=function(k,col){const e=EQ[k];if(!e||!(e.tier>=4&&e.kind==='bow'||e.wt))return _ic(k,col);const key='g78'+k;if(ICONC[key])return ICONC[key];
  const src=_ic(e.kind==='bow'?'eq_bow2':'eq_w'+e.el);if(ICONC[key+'_p'])return src;ICONC[key+'_p']=1;const img=new Image();
  img.onload=()=>{try{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);const d=x.getImageData(0,0,c.width,c.height),p=d.data,tc=e.col.match(/\w\w/g).map(h=>parseInt(h,16));
    for(let i=0;i<p.length;i+=4){if(p[i+3]<10)continue;const r=p[i],g2=p[i+1],b=p[i+2];if(r>g2+15&&r>b+25){const l=Math.max(.35,(r+g2+b)/3/150);p[i]=Math.min(255,tc[0]*l);p[i+1]=Math.min(255,tc[1]*l);p[i+2]=Math.min(255,tc[2]*l)}}
    x.putImageData(d,0,0);ICONC[key]=c.toDataURL();if(typeof pnOpen!=='undefined'&&pnOpen)rPn()}catch(err){}};img.src=src;return src};
 window.SQWT=()=>WT}
