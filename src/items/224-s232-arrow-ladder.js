// ---- 232. The arrow ladder: mithril and adamant arrows ----
// Arrow damage over plain arrows: iron +1 (021), mithril +2, adamant +3, meteorite +4 (216's LEND, +3 over iron).
//   Mithril arrows (mitharrow): 15 from 1 mithril bar + 2 maple logs, Archery 40. Adamant arrows (adarrow): 15 from 1 adamant
//   bar + 2 yew logs, Archery 55. Fletched in the Craft tab (021's FREC), saved like 216 saves marrow.
// A bow shoots the best arrows you carry: meteorite, then adamant, then mithril, then iron, then plain. Like 216, the outermost
// shoot/shootAim lend the arrows to inv.iarrow for the call (021/023 only know arrow/iarrow), add BON to arrowDmg while lent,
// and take back what was used. With meteorite arrows in the bag this does nothing (216's own lend is inside).
(()=>{const FL=SKN.indexOf('Archery');
 const A=[{k:'adarrow',n:'Adamant arrows',sh:'adamant arrows',bar:'abar',log:'yewlog',lv:55,xp:420,b:2,v:22,hd:'#58c088',d:'Arrows with adamant heads: +2 damage over iron arrows (+3 over plain arrows).'},
  {k:'mitharrow',n:'Mithril arrows',sh:'mithril arrows',bar:'mbar',log:'maplelog',lv:40,xp:240,b:1,v:12,hd:'#70a8e0',d:'Arrows with mithril heads: +1 damage over iron arrows (+2 over plain arrows).'}];
 for(const a of A){const k=a.k;if(!INVK.includes(k))INVK.push(k);INAME[k]=a.n;SN[k]=a.n;SHORT[k]=a.sh;SELLP[k]=a.v;inv[k]=inv[k]|0;IDESC[k]=a.d+' Any bow shoots your best arrows first.';
  {const j=EXTRA_BAG.indexOf('iarrow');if(!EXTRA_BAG.includes(k))EXTRA_BAG.splice(j>=0?j+1:EXTRA_BAG.length,0,k)}}
 // recipes, in level order after iron arrows
 try{const at=FREC.findIndex(r=>r.k==='bow2');for(const a of A)if(!FREC.some(r=>r.k===a.k))FREC.splice(at>=0?at+1:FREC.length,0,{k:a.k,n:'15 '+a.sh,c:{[a.bar]:1,[a.log]:2},lv:a.lv,xp:a.xp,f:()=>{inv[a.k]=(inv[a.k]|0)+15;say('Made 15 '+a.sh+'.')}})}catch(e){}
 // saving
 {const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);for(const a of A)if((inv[a.k]|0)>0){s.inv=s.inv||{};s.inv[a.k]=inv[a.k]|0}return s}}
 {const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);for(const a of A)try{inv[a.k]=S&&S.inv&&S.inv[a.k]!=null?Math.max(0,+S.inv[a.k]|0):0}catch(e){}return out}}
 // lending
 let BON=0;
 {const _ad=arrowDmg;arrowDmg=function(){return _ad.apply(this,arguments)+BON}}
 const lend=f=>function(){if(BON||(inv.marrow|0)>0)return f.apply(this,arguments);const a=A.find(q=>(inv[q.k]|0)>0);if(!a)return f.apply(this,arguments);
  const m=inv[a.k]|0,iron=inv.iarrow|0,n0=PROJ.length;BON=a.b;inv.iarrow=iron+m;let out;
  try{out=f.apply(this,arguments)}finally{BON=0;const used=Math.max(0,iron+m-(inv.iarrow|0));inv[a.k]=Math.max(0,m-used);inv.iarrow=iron;
   for(let i=n0;i<PROJ.length;i++){const p=PROJ[i];if(p&&p.k==='arrow'&&!p.ghost)p.ah=a.hd}}return out};
 if(typeof shoot==='function')shoot=lend(shoot);if(typeof shootAim==='function')shootAim=lend(shootAim);
 // HIT's auto-shot (021's bowTarget) only counts arrow/iarrow: count these too
 {const _bt=bowTarget;bowTarget=function(){if(TL.bow&&((inv.arrow|0)+(inv.iarrow|0))<1){const x=(inv.marrow|0)+A.reduce((n,a)=>n+(inv[a.k]|0),0);if(x>0){const i0=inv.iarrow|0;inv.iarrow=i0+x;try{return _bt.apply(this,arguments)}finally{inv.iarrow=i0}}}return _bt.apply(this,arguments)}}
 // icons
 {const _ic=iconURL;iconURL=function(k,col){const a=A.find(q=>q.k===k);if(!a)return _ic.apply(this,arguments);const key='g232'+k;if(ICONC[key])return ICONC[key];
   const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(p,q,w,h,cl)=>{x.fillStyle=cl;x.fillRect(p,q,w,h)};
   for(const o of[-1,2]){for(let i=0;i<8;i++)r(2+i+o,11-i,1,1,'#7a5430');r(9+o,2,3,1,'#16121c');r(10+o,1,2,3,'#16121c');r(10+o,2,1,1,a.hd);r(11+o,1,1,1,a.hd);r(1+o,10,2,2,'#e8e0d0');r(2+o,12,1,1,'#b8b0a0')}
   return ICONC[key]=c.toDataURL()}}
 window.SQARROWS={A,bonus:()=>BON};
})();
