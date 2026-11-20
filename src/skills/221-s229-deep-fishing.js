// ---- 229. Fishing 70, 80 and 90 ----
// Three new catches through 093b's catch hook (window.SQFISHX: {k, n, lv, xp, p chance per bite, where [regions] | null, ok()}),
// so they get 109's reel like every other fish. Checked in this order, rarest first:
//   Ancient koi  (Fishing 90): anywhere, 6% of bites. Heals 8.
//   Abyssal eel  (Fishing 80): the Shattered Expanse and Ironcrest, 35% of bites. Heals 7.
//   Moonfin      (Fishing 70): any water, only at night (dark() > .25), 40% of bites. Heals 6.
// Each is raw `k` / cooked `c<k>` with a COOKS entry (Cooking = Fishing level, XP x1.3) and a FOODS entry, icons like 093's island
// fish, and lines on the Fishing skill tree. They count toward the Giant Turtle summon (200's RAW and the turt rule list them since Nov 16).
(()=>{const F=[
  {k:'akoi',n:'Ancient koi',lv:90,xp:420,p:.06,where:null,heal:8,hun:100,raw:160,ckv:260,c:'#f0c040',cc:'#c89830',d:'An ancient golden koi. Very rarely bites, anywhere, for master anglers (Fishing 90).',w:'rarely, in any water'},
  {k:'abeel',n:'Abyssal eel',lv:80,xp:280,p:.35,where:['shattered','ironcrest'],heal:7,hun:100,raw:80,ckv:130,c:'#304878',cc:'#806048',d:'A long eel from the deep, cold waters of the Shattered Expanse and Ironcrest (Fishing 80).',w:'in the Shattered Expanse and Ironcrest'},
  {k:'moonfin',n:'Moonfin',lv:70,xp:220,p:.4,where:null,heal:6,hun:95,raw:60,ckv:100,c:'#d0e0ff',cc:'#b09070',d:'A pale fish that only rises at night (Fishing 70).',w:'at night, in any water',ok:()=>typeof dark==='function'&&dark()>.25}];
 const FC={};
 for(const f of F){INVK.push(f.k,'c'+f.k);if(typeof EXTRA_BAG!=='undefined')EXTRA_BAG.push(f.k,'c'+f.k);inv[f.k]=inv[f.k]|0;inv['c'+f.k]=inv['c'+f.k]|0;
  INAME[f.k]='Raw '+f.n.toLowerCase();INAME['c'+f.k]='Cooked '+f.n.toLowerCase();IDESC[f.k]=f.d+' Cook it at a campfire (Cooking '+f.lv+').';
  IDESC['c'+f.k]='Restores food and '+f.heal+' hearts.';SELLP[f.k]=f.raw;SELLP['c'+f.k]=f.ckv;SN[f.k]=INAME[f.k];SN['c'+f.k]=INAME['c'+f.k];
  if(typeof SHORT!=='undefined'){SHORT[f.k]='raw '+f.n.toLowerCase();SHORT['c'+f.k]='cooked '+f.n.toLowerCase()}
  COOKS.push({raw:f.k,ck:'c'+f.k,n:f.n.toLowerCase(),lv:f.lv,xp:Math.round(f.xp*1.3)});FOODS.push({k:'c'+f.k,n:'cooked '+f.n.toLowerCase(),heal:f.heal,hun:f.hun});FC[f.k]=f.c;FC['c'+f.k]=f.cc}
 FOODS.sort((a,b)=>b.heal-a.heal||b.hun-a.hun);
 window.SQFISHX=F.map(f=>({k:f.k,n:f.n,lv:f.lv,xp:f.xp,p:f.p,where:f.where,ok:f.ok}));window.SQDEEPFISH=F;
 {const _ic=iconURL;iconURL=function(k,col){if(!FC[k])return _ic(k,col);const key='df_'+k;if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),cl=FC[k];
   const r=(a,b,w,h,q)=>{x.fillStyle=q;x.fillRect(a+1,b+1,w,h)},e=(cx,cy,rx,ry,q)=>{x.fillStyle=q;for(let j=0;j<12;j++)for(let i=0;i<12;i++)if(((i+.5-cx)/rx)**2+((j+.5-cy)/ry)**2<=1)x.fillRect(i+1,j+1,1,1)};
   const raw=k[0]!=='c',base=raw?k:k.slice(1);
   if(base==='abeel'){e(6,6,5.6,1.7,'#202838');e(6,6,5.2,1.3,cl);r(1,5,1,2,cl);r(9,5,1,1,'#e0e8ff');r(3,6,5,1,'#ffffff30')}
   else{e(5.5,6,4.7,2.8,'#202838');e(5.5,6,4.3,2.4,cl);r(9,4,2,1,cl);r(10,5,1,2,cl);r(9,7,2,1,cl);r(2,5,1,1,'#202020');r(3,7,4,1,'#ffffff40');
    if(base==='akoi'){r(4,4,1,1,'#ffffff');r(6,5,1,1,'#ffffff')}if(base==='moonfin'){r(3,4,3,1,'#ffffffa0')}}
   if(!raw)r(4,4,3,1,'#00000030');
   return ICONC[key]=c.toDataURL()}}
 if(typeof treeGains==='function'){const _tg=treeGains;treeGains=function(sk,l){const a=_tg.apply(this,arguments);try{if(sk===9){const f=F.find(q=>q.lv===l);if(f)a.push('Catch the '+f.n.toLowerCase()+' '+f.w+' ('+f.xp+' XP)')}}catch(e){self.SQERR&&SQERR(e,'221-1')}return a}}
})();
