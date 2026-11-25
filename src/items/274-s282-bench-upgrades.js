// ---- 282. Upgrades at the Blacksmith's bench (smithing overhaul, step 2) ----
// Nov 23 (Jace + Kevin, plan in the "SQ Blacksmith's Bench" sheet): gear goes up to +3.
//   copies: 10 of the same item make a +1, 10 of the +1 make a +2, 10 of the +2 make a +3, at the level that makes the item + 10/20/30
//     (in its skill: Smithing for anvil gear, Crafting for crafted gear), for 2x/10x/50x its craft XP. The piece you're wearing counts.
//   boss gear (no recipe): its island's cores (272) instead of copies: 1 / 10 / 100 cores, Smithing or Crafting 70/80/90.
//   not upgradable: starter gear (wood, stone, leather, shortbow, shop wands, wizard set), the Crystal blade, the Bone bow, jewelry, tools.
//   what a level gives: swords, bows and wands hit 5% harder (the fraction is a chance of +1), pickaxes swing 5% faster, axes +1 extra
//     log limit (287; they chopped 5% faster before Nov 24 evening),
//     daggers +1 damage at +2 and +3, armour +1% block and +1% block limit a piece, ranger pieces 5% more bow range. PvP ignores it.
//     Durability (275, Nov 24, Jace): a +1 lasts 10 times as long as the plain item, a +2 100 times, and a +3 never wears out.
//   the levels (Nov 24, Jace: "the game doesn't tell you the level requirements of upgrades"): every upgradable item's description
//     ends with what its upgrades need (upLine), an upgraded copy's says what the next one needs, the bench lists the level on every
//     row, and the equipment screen says what's next for the piece you wear.
// Upgraded copies are their own items in the bag: 'u<L>_<base>' (EQ entries are non-enumerable copies, so lists of gear don't grow;
// INAME stays enumerable so the market and the wiki know them). Worn, the game sees the base item (TL/ARM tiers, occ(), looks), and UPS
// remembers the level per slot; equipItem/unequipSlot/setSlot put the right copy back in the bag, and a per-frame check catches the
// rest (an item knocked out of a slot elsewhere). Saved as s.upe = {slot:[base,level]}. window.SQUPGRADE.
(()=>{const BEN=window.SQSMITHBENCH;if(!BEN)return;const SMI=10,CRI=6,MAXL=3,COPIES=10,XPM=[0,2,10,50],CORESN=[0,1,10,100];
 const KEY=(b,l)=>l?'u'+l+'_'+b:b,isVar=k=>typeof k==='string'&&/^u[123]_/.test(k),baseOf=k=>isVar(k)?k.slice(3):k,lvlOf=k=>isVar(k)?+k[1]:0;
 const NOUP=new Set(['eq_sword1','eq_sword2','eq_axe1','eq_axe2','eq_pick1','eq_pick2','eq_helm1','eq_body1','eq_legs1','eq_bow1','eq_wfire','eq_wice','eq_wstorm','eq_mhelm','eq_mbody','eq_mlegs','eq_sword5','eq_bow3']);
 const BOSS={eq_sword8:['core_ember',SMI],eq_sledge:['core_frost',SMI],eq_fcrown:['core_briar',SMI],eq_wvoid:['core_void',SMI],eq_ohat:['core_silver',CRI],eq_cu_spider_hood:['core_briar',CRI],eq_cu_spider_weaver_robe:['core_briar',CRI]};
 const SLOTOK=new Set(['helm','body','legs','main','off','axe','pick']),ARMS=['helm','body','legs'];
 let UP={};// base -> {sk, lv (to make), xp (to make), core?}
 function scan(){const U={};const add=(k,sk,lv,xp)=>{const e=k&&EQ[k];if(!e||U[k]||NOUP.has(k)||BOSS[k]||!SLOTOK.has(e.slot)||e.kind==='hoe'||e.kind==='can')return;U[k]={sk,lv:Math.max(1,lv|0),xp:Math.max(1,xp|0)}};
  try{for(const r of SM)add(r.k||(r.arm?'eq_'+r.arm[0]+r.arm[1]:null),SMI,r.lv,r.xp)}catch(e){self.SQERR&&SQERR(e,'274-1')}
  try{for(const r of GOODS)add(r.k,CRI,r.req,r.xp)}catch(e){self.SQERR&&SQERR(e,'274-2')}
  try{const rs=REC.find(r=>r.k==='sword'&&r.t===3);if(rs)add('eq_sword3',CRI,rs.req,rs.xp)}catch(e){self.SQERR&&SQERR(e,'274-3')}
  add('eq_sword4',SMI,25,300);// Brann's steel sword (Saltmere): no level of its own, steel-tier
  for(const k in BOSS){const e=EQ[k];if(e&&SLOTOK.has(e.slot))U[k]={sk:BOSS[k][1],lv:60,xp:1000,core:BOSS[k][0]}}
  return U}
 const need=(b,L)=>Math.min(99,UP[b].lv+10*L),xpFor=(b,L)=>UP[b].xp*XPM[L];
 // ---- the upgraded items ----
 const REG=new Set(),PENDV={},ICO={};
 const eff0=(b,L)=>{const e=EQ[b]||{};if(e.kind==='dagger')return L>=2?'+'+(L-1)+' damage':'no extra damage yet (+1 damage at +2)';
  if(ARMS.includes(e.slot))return'+'+L+'% block chance and +'+L+'% to your block limit'+(e.cls==='r'?', and '+5*L+'% more bow range':'');
  if(e.slot==='axe')return'+'+L+' extra log limit';// Nov 24 (287): was 5% faster chops a levelif(e.slot==='pick')return'mines '+5*L+'% faster';
  return(e.kind==='bow'?'arrows hit ':e.kind==='wand'?'spells hit ':'hits ')+5*L+'% harder'};
 // and how long it lasts (275): 10 times as long a level, and a +3 never wears out
 const durT=L=>L>=MAXL?'never wears out':'lasts '+Math.pow(10,L)+' times as long';
 const eff=(b,L)=>eff0(b,L)+'; '+durT(L);
 // what an upgrade needs: 10 of the level below (or the island's cores) and a level in the item's skill
 const needT=(b,L)=>{const U=UP[b];if(!U)return'';return SKN[U.sk]+' '+need(b,L)};
 const coreN=(c,n)=>n+' '+String(n>1?SN[c]||INAME[c]||c:INAME[c]||c).toLowerCase();
 function nextT(b,L){const U=UP[b];if(!U||L>=MAXL)return'';const nm=String(INAME[KEY(b,L+1)]||'').toLowerCase();
  return U.core?'Next: this and '+coreN(U.core,CORESN[L+1])+' make '+(/^[aeiou]/.test(nm)?'an ':'a ')+nm+' at '+needT(b,L+1)+'.':'Next: '+COPIES+' of these make '+(/^[aeiou]/.test(nm)?'an ':'a ')+nm+' at '+needT(b,L+1)+'.'}
 function upLine(b){const U=UP[b];if(!U)return'';const n=[1,2,3].map(L=>need(b,L));
  if(U.core)return'Upgrades at a Blacksmith\'s bench, with '+String(SN[U.core]||INAME[U.core]||'cores').toLowerCase()+': 1 makes a +1 ('+SKN[U.sk]+' '+n[0]+'), '+CORESN[2]+' a +2 ('+n[1]+') and '+CORESN[3]+' a +3 ('+n[2]+').';
  return'Upgrades at a Blacksmith\'s bench: '+COPIES+' of these make a +1 ('+SKN[U.sk]+' '+n[0]+'), '+COPIES+' of the +1 a +2 ('+n[1]+') and '+COPIES+' of the +2 a +3 ('+n[2]+').'}
 const UPRE=/ ?Upgrades at a Blacksmith's bench[,:][^.]*\./g;
 // the plain item's description ends with upLine; RAWD[b] reads it without (the upgraded copies use that)
 const RAWD={};
 function wrapD(b){if(RAWD[b])return;const d0=Object.getOwnPropertyDescriptor(IDESC,b);let val=d0&&!d0.get?String(d0.value==null?'':d0.value):'';
  const get0=d0&&d0.get?()=>String(d0.get.call(IDESC)||''):()=>val,set0=d0&&d0.set?v=>d0.set.call(IDESC,v):v=>{val=String(v==null?'':v)};
  RAWD[b]=()=>get0().replace(UPRE,'');
  try{Object.defineProperty(IDESC,b,{configurable:true,enumerable:true,get(){const r=RAWD[b]();let u='';try{u=upLine(b)}catch(e){self.SQERR&&SQERR(e,'274-21')}return u?(r?r.replace(/\s*$/,'')+(/[.!?]$/.test(r.trim())?' ':'. '):'')+u:r},set(v){set0(String(v==null?'':v).replace(UPRE,''))}})}catch(e){self.SQERR&&SQERR(e,'274-22')}}
 const rawD=b=>RAWD[b]?RAWD[b]():String(IDESC[b]||'');
 function reg(){UP=scan();for(const b in UP){const e=EQ[b];if(!e)continue;for(let L=1;L<=MAXL;L++){const v=KEY(b,L),nm=(INAME[b]||e.n)+' +'+L;
   Object.defineProperty(EQ,v,{value:Object.assign({},e,{n:e.n+' +'+L,upOf:b,upL:L}),enumerable:false,configurable:true,writable:true});
   INAME[v]=nm;SN[v]=(SN[b]||nm)+' +'+L;SHORT[v]=nm.toLowerCase();
   const U=UP[b];SELLP[v]=U.core?(SELLP[b]|0)+[0,1,11,111][L]*(SELLP[U.core]|0):(SELLP[b]|0)*Math.pow(COPIES,L);
   if(!REG.has(v)){REG.add(v);if(!INVK.includes(v))INVK.push(v);if(!EXTRA_BAG.includes(v))EXTRA_BAG.push(v);inv[v]=inv[v]|0;
    Object.defineProperty(IDESC,v,{configurable:true,enumerable:true,get(){const nx=nextT(b,L);return'Upgraded to +'+L+' at a Blacksmith\'s bench: '+eff(b,L)+'. '+(nx?nx+' ':'')+rawD(b)},set(){}})}
   if(PENDV[v]){inv[v]=(inv[v]|0)+PENDV[v];delete PENDV[v]}}
  wrapD(b)}}
 reg();try{if(window.SQA&&SQA.onApply)SQA.onApply(()=>setTimeout(()=>{try{reg()}catch(e){self.SQERR&&SQERR(e,'274-4')}},0))}catch(e){self.SQERR&&SQERR(e,'274-5')}
 // ---- worn upgrades: UPS[slot] = {b, l, n (plain copies of b in the bag, to see one come back)} ----
 const UPS={},PUPS={};let NOUPG=false,SETK=null;
 const lv=s=>!NOUPG&&UPS[s]?UPS[s].l:0;
 const back=(b,l)=>{if((inv[b]|0)>0){inv[b]--;const v=KEY(b,l);inv[v]=(inv[v]|0)+1;return true}return false};
 SQSETSLOT.wrap('274 upgraded items wear as their base',next=>function(slot,k){if(isVar(k)){const b=baseOf(k);SETK=b;const out=next.call(this,slot,b);UPS[slot]={b,l:lvlOf(k),n:inv[b]|0};return out}SETK=k;return next.apply(this,arguments)});
 // Nov 23 fix: 028's equipItem/unequipSlot save on the spot, and the save ran reconcile() halfway through a swap: it put the old
 // piece back as its +L, then the wrapper did it again and turned a plain copy in the bag into a +L. While a wrapper runs
 // (window.SQGEARBUSY, shared with 275's durability) reconcile waits, and the wrapper saves again once it's done.
 const busy=f=>{window.SQGEARBUSY=(window.SQGEARBUSY|0)+1;try{return f()}finally{window.SQGEARBUSY--}};
 const resave=()=>{if(!(window.SQGEARBUSY>0))try{saveLocal(true)}catch(e){self.SQERR&&SQERR(e,'274-20')}};
 {const _eq=equipItem;equipItem=function(k){const self_=this,args=arguments;
   if(isVar(k)){const b=baseOf(k),L=lvlOf(k),e=EQ[b];if(!e||(inv[k]|0)<1)return;const s=e.slot,prev=UPS[s]?Object.assign({},UPS[s]):null;
    inv[k]--;inv[b]=(inv[b]|0)+1;SETK=null;const _s=say;let said='';say=m=>{said=m};try{busy(()=>_eq.call(self_,b))}finally{say=_s}
    if(SETK===b){if(prev)back(prev.b,prev.l);UPS[s]={b,l:L,n:inv[b]|0};say(/^Equipped/.test(said)?'Equipped the '+INAME[k].toLowerCase()+'.':said)}else{inv[b]--;inv[k]++;if(said)say(said)}resave();return}
   const e=EQ[k],s=e&&e.slot,prev=s&&UPS[s]?Object.assign({},UPS[s]):null;SETK=null;const out=busy(()=>_eq.apply(self_,args));
   if(prev&&SETK===k){back(prev.b,prev.l);delete UPS[s];resave()}return out}}
 {const _ue=unequipSlot;unequipSlot=function(slot){const self_=this,args=arguments;const u=UPS[slot]?Object.assign({},UPS[slot]):null;const _s=say;let said='';if(u)say=m=>{said=m};let out;try{out=busy(()=>_ue.apply(self_,args))}finally{say=_s}
   if(u){if(occ(slot)!==u.b){back(u.b,u.l);delete UPS[slot];say('Put the '+(INAME[KEY(u.b,u.l)]||'item').toLowerCase()+' in your bag.');resave()}else if(said)say(said)}return out}}
 // anything else that takes an upgraded piece off you (a new bow knocking a dagger out, Brann's steel, ...) puts it in the bag as its base
 function reconcile(){if(typeof BMERGE!=='undefined'&&BMERGE||window.SQGEARBUSY>0)return;
  for(const s in PUPS){const[b,l]=PUPS[s];if(occ(s)===b){UPS[s]={b,l,n:inv[b]|0};delete PUPS[s]}}
  for(const s in UPS){const u=UPS[s];if(!u)continue;if(occ(s)===u.b){u.n=inv[u.b]|0;continue}if((inv[u.b]|0)>u.n)back(u.b,u.l);delete UPS[s]}}
 SQUPD.after('274 upgraded items keep their level',()=>{try{reconcile()}catch(e){self.SQERR&&SQERR(e,'274-6')}});
 // ---- saves ----
 try{KNOWN49.add('upe')}catch(e){self.SQERR&&SQERR(e,'274-7')}
 SQSAVE.wrap('274 settle worn upgrades first',next=>function(){try{reconcile()}catch(e){self.SQERR&&SQERR(e,'274-8')}return next.apply(this,arguments)});
 SQSAVE.after('274:upe',s=>{const o={};for(const k in UPS)if(UPS[k])o[k]=[UPS[k].b,UPS[k].l];for(const k in PUPS)if(!o[k])o[k]=PUPS[k];if(Object.keys(o).length)s.upe=o;
  if(s.inv)for(const k in PENDV)if(PENDV[k])s.inv[k]=(s.inv[k]|0)+PENDV[k]});
 SQLOAD.after('274',S=>{for(const k in UPS)delete UPS[k];for(const k in PUPS)delete PUPS[k];for(const k in PENDV)delete PENDV[k];
  if(S&&S.inv)for(const k in S.inv)if(isVar(k)&&!REG.has(k)&&+S.inv[k]>0)PENDV[k]=Math.min(1e6,+S.inv[k]|0);
  const U=S&&S.upe;if(U&&typeof U==='object')for(const s in U){const a=U[s];if(!Array.isArray(a)||typeof a[0]!=='string'||!(a[1]>=1&&a[1]<=MAXL))continue;const l=a[1]|0;if(occ(s)===a[0])UPS[s]={b:a[0],l,n:inv[a[0]]|0};else PUPS[s]=[a[0],l]}});
 SQNEWGAME.before('274',()=>{for(const o of[UPS,PUPS,PENDV])for(const k in o)delete o[k]});
 // Nov 23 fix: upgraded copies in the bag are gear, so they stay with you when you fall (063's grave takes what's in the bag except
 // EQK gear, and 028's reset keeps only EQK keys): SQKEEPFALL says keep while you're down, and the reset step keeps them.
 {const _kf=window.SQKEEPFALL;window.SQKEEPFALL=function(k){if(dead&&isVar(k))return true;return typeof _kf==='function'?_kf.apply(this,arguments):false}}
 {const _rs=reset;reset=function(){let keep=null;if(dead&&!(typeof NEWG!=='undefined'&&NEWG)){keep={};for(const k in inv)if((inv[k]|0)>0&&isVar(k))keep[k]=inv[k]|0}
   const out=_rs.apply(this,arguments);if(keep)for(const k in keep)inv[k]=keep[k];return out}}
 // ---- what a level does ----
 const bump=(v,L)=>{if(!L||!(v>0))return 0;const x=v*.05*L,f=Math.floor(x);return f+(Math.random()<x-f?1:0)};
 const offKind=()=>{const u=UPS.off;return u&&EQ[u.b]?EQ[u.b].kind:null};
 {const _mf=meleeFlat;meleeFlat=function(){const v=_mf.apply(this,arguments);let b=0;try{const Lm=lv('main');if(Lm)b+=bump(1+(TL.sword|0)+Math.floor(lvOf(0)/15)+v,Lm);
   const Lo=lv('off');if(Lo>=2&&offKind()==='dagger')b+=Lo-1}catch(e){self.SQERR&&SQERR(e,'274-9')}return v+b}}
 {const _ad=arrowDmg;arrowDmg=function(){const v=_ad.apply(this,arguments);try{const L=lv('off');if(L&&offKind()==='bow')return v+bump(v,L)}catch(e){self.SQERR&&SQERR(e,'274-10')}return v}}
 {const _sd=spellDmg;spellDmg=function(el){const v=_sd.apply(this,arguments);try{const L=lv('off');if(L&&offKind()==='wand')return v+bump(v,L)}catch(e){self.SQERR&&SQERR(e,'274-11')}return v}}
 {const _br=bowRange;bowRange=function(){const v=_br.apply(this,arguments);try{let r=0;for(const s of ARMS)if(UPS[s]&&EQ[UPS[s].b]&&EQ[UPS[s].b].cls==='r')r+=lv(s);if(r)return Math.round(v*(1+.05*r))}catch(e){self.SQERR&&SQERR(e,'274-12')}return v}}
 const armUp=()=>{let t=0;for(const s of ARMS)t+=lv(s);return t*.01};
 {const _bb=blockBonus;blockBonus=function(){return _bb.apply(this,arguments)+armUp()}}
 {const _bc=blockCap;blockCap=function(){return _bc.apply(this,arguments)+armUp()}}
 {const _gs=gSpeed;gSpeed=function(sk){const v=_gs.apply(this,arguments);if(sk===2)return v+.05*lv('pick');return v}}// axes: +1 extra log limit a level instead (287)
 {const _pd=window.SQPVDMG;if(typeof _pd==='function')window.SQPVDMG=function(){NOUPG=true;try{return _pd.apply(this,arguments)}finally{NOUPG=false}}}
 // ---- icons: the base item's picture with a gold level badge ----
 const DIG={1:['.#.','##.','.#.','.#.','###'],2:['##.','..#','.#.','#..','###'],3:['##.','..#','.#.','..#','##.']};
 function badged(v,url){if(ICO[v])return ICO[v]===1?url:ICO[v];ICO[v]=1;try{const im=new Image();im.onload=()=>{try{const w=im.naturalWidth||14,h=im.naturalHeight||14,c=document.createElement('canvas');c.width=w;c.height=h;
    const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(im,0,0);const z=Math.max(1,Math.round(w/14)),r=(a,b,ww,hh,cl)=>{x.fillStyle=cl;x.fillRect(w-(14-a)*z,h-(14-b)*z,ww*z,hh*z)};
    r(8,6,6,8,'#1c1410');r(9,7,4,6,'#f0c040');r(9,7,4,1,'#fff0a0');DIG[lvlOf(v)].forEach((row,j)=>{for(let i=0;i<3;i++)if(row[i]==='#')r(10+i,8+j,1,1,'#3a2410')});
    ICO[v]=c.toDataURL();try{if(pnOpen)rPn()}catch(e){self.SQERR&&SQERR(e,'274-13')}}catch(e){self.SQERR&&SQERR(e,'274-14')}};im.src=url}catch(e){self.SQERR&&SQERR(e,'274-15')}return url}
 {const _ei=eqIcon;eqIcon=function(k){if(isVar(k)&&EQ[baseOf(k)])return badged(k,_ei.call(this,baseOf(k)));return _ei.apply(this,arguments)}}
 SQICON.wrap('274',_ic=>function(k,col){if(isVar(k)&&REG.has(k))return badged(k,EQ[baseOf(k)]?eqIcon(baseOf(k)):_ic.call(this,baseOf(k),col));return _ic.apply(this,arguments)});
 // ---- the equipment screen: worn levels in the slot names, upgraded copies in the Equip list ----
 const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
 {const _eh=equipHTML;equipHTML=function(){let h=_eh.apply(this,arguments);try{
   for(const s in UPS){const u=UPS[s];if(!u||occ(s)!==u.b||!EQ[u.b])continue;const i=h.indexOf('data-s="'+s+'"');if(i<0)continue;const j=h.indexOf('</button>',i);if(j<0)continue;
    let seg=h.slice(i,j);const v=KEY(u.b,u.l);seg=seg.replace(esc(EQ[u.b].n),esc(EQ[u.b].n+' +'+u.l)).replace(/src="[^"]*"/,'src="'+eqIcon(v)+'"');h=h.slice(0,i)+seg+h.slice(j)}
   const sel=typeof EQSEL!=='undefined'&&EQSEL;
   // the tapped slot's card: say it's upgraded
   if(sel&&UPS[sel]&&occ(sel)===UPS[sel].b){const u=UPS[sel],a=h.indexOf('<div class="qc" style="margin-top:10px"><b>'),c=a<0?-1:h.indexOf('</b>',a);if(c>=0)h=h.slice(0,c+4)+'<p style="margin:4px 0 6px;font-size:12px;color:#8a5a10">You\'re wearing the '+esc((INAME[KEY(u.b,u.l)]||'').toLowerCase())+': '+esc(eff(u.b,u.l))+'.'+(u.l<MAXL?' '+esc(nextT(u.b,u.l)):'')+'</p>'+h.slice(c+4)}
   // a plain upgradable piece: what its upgrades need
   else if(sel){let b=null;try{b=occ(sel)}catch(e){self.SQERR&&SQERR(e,'274-23')}if(b&&UP[b]&&!UPS[sel]){const a=h.indexOf('<div class="qc" style="margin-top:10px"><b>'),c=a<0?-1:h.indexOf('</b>',a);if(c>=0)h=h.slice(0,c+4)+'<p style="margin:4px 0 6px;font-size:12px;color:#8a5a10">'+esc(upLine(b))+'</p>'+h.slice(c+4)}}
   if(sel){const vs=[...REG].filter(v=>(inv[v]|0)>0&&EQ[v]&&EQ[v].slot===sel);if(vs.length){
     const btn=vs.map(v=>'<button class="sb eqo" data-k="'+v+'" style="margin:6px 0">Equip '+esc(EQ[v].n)+((inv[v]|0)>1?' (×'+inv[v]+')':'')+'</button>').join('');
     h=h.replace('<p style="opacity:.7">Nothing in your bag for this slot.</p>','');const a=h.indexOf('<button class="sb equ"');h=a>=0?h.slice(0,a)+btn+h.slice(a):h.replace(/(<div class="qc" style="margin-top:10px"><b>[^<]*<\/b>)/,'$1'+btn)}}}catch(e){self.SQERR&&SQERR(e,'274-16')}return h}}
 // ---- the bench: the upgrade list ----
 const wornAt=(b,l)=>{for(const s of SLOTOK)if(occ(s)===b&&((UPS[s]?UPS[s].l:0)===l))return s;return null};
 function state(b,L){const U=UP[b];if(!U||L<1||L>MAXL)return null;const from=KEY(b,L-1),bag=inv[from]|0,worn=wornAt(b,L-1),have=bag+(worn?1:0);
  const o={U,L,from,to:KEY(b,L),bag,worn,have,lvl:need(b,L),xp:xpFor(b,L),sk:U.sk};
  if(U.core){o.cores=CORESN[L];o.coreHave=inv[U.core]|0;o.max=have>0&&o.coreHave>=o.cores?Math.min(have,Math.floor(o.coreHave/o.cores)):0}else o.max=Math.floor(have/COPIES);
  o.okL=lvOf(U.sk)>=o.lvl;o.ok=o.okL&&o.max>0;return o}
 function upgrade(b,L){const o=state(b,L);if(!o)return false;const nm=INAME[o.to]||o.to;
  if(!o.okL){say('You need '+SKN[o.sk]+' '+o.lvl+' to upgrade to '+nm.toLowerCase()+'.');return false}
  if(o.max<1){say(o.U.core?'You need '+(o.have?o.cores+' '+(o.cores>1?SN[o.U.core]:INAME[o.U.core]).toLowerCase():'the '+(INAME[o.from]||'item').toLowerCase())+'.':'You need '+COPIES+' '+(SN[o.from]||INAME[o.from]||'').toLowerCase()+'.');return false}
  let onYou=false;
  if(o.U.core){inv[o.U.core]-=o.cores;if(o.bag>0){inv[o.from]--;inv[o.to]=(inv[o.to]|0)+1}else{UPS[o.worn]={b,l:L,n:inv[b]|0};onYou=true}}
  else{const fromBag=Math.min(o.bag,COPIES);inv[o.from]-=fromBag;if(fromBag<COPIES){UPS[o.worn]={b,l:L,n:inv[b]|0};onYou=true}else inv[o.to]=(inv[o.to]|0)+1}
  addXp(o.sk,o.xp);say('You upgrade '+(o.U.core?'the '+(INAME[o.from]||'').toLowerCase():COPIES+' '+(SN[o.from]||'').toLowerCase())+' into '+(/^[aeiou]/i.test(nm)?'an ':'a ')+nm.toLowerCase()+(onYou?' (you\'re wearing it)':'')+'!');
  try{sfx('anvil')}catch(e){self.SQERR&&SQERR(e,'274-17')}return true}
 function rows(){const L0=[];for(const b in UP)for(let L=1;L<=MAXL;L++){const o=state(b,L);if(o&&o.have>0)L0.push([b,o])}
  L0.sort((a,c)=>(c[1].ok-a[1].ok)||(a[1].sk-c[1].sk)||(a[1].lvl-c[1].lvl));return L0}
 function html(o0){let h='<div class="tl" style="margin-top:14px">Upgrades</div><div class="tl" style="font-size:12px;font-weight:400;opacity:.75">'+COPIES+' of the same item make a +1, '+COPIES+' of the +1 make a +2, '+COPIES+' of the +2 make a +3, at the level that makes the item + 10, + 20 and + 30 (boss gear: 70, 80 and 90, with cores instead of copies). The piece you\'re wearing counts. Each level: weapons hit 5% harder, pickaxes mine 5% faster, axes give +1 extra log limit, armour blocks 1% more. A +1 lasts 10 times as long, a +2 100 times, and a +3 never wears out.</div>';
  const R=rows();if(!R.length)return h+'<div class="qc"><p>Bring 10 of the same weapon, armour piece, bow, wand, axe or pickaxe (or boss gear and its cores) to upgrade it.</p></div>';
  for(const[b,o]of R){const nmF=INAME[o.from]||b,nmT=INAME[o.to]||b,sk=SKN[o.sk];
   const cost=o.U.core?o.have+' / 1 '+esc(nmF.toLowerCase())+' + '+o.coreHave+' / '+o.cores+' '+esc((o.cores>1?SN[o.U.core]:INAME[o.U.core]||'').toLowerCase()):o.have+' / '+COPIES+' '+esc((SN[o.from]||nmF).toLowerCase())+(o.worn?' (1 worn)':'');
   const sub=cost+' · '+(o.okL?sk+' '+o.lvl+' · '+o.xp.toLocaleString('en-US')+' xp':'<b>needs '+sk+' '+o.lvl+'</b> (you\'re '+lvOf(o.sk)+')')+' · '+esc(eff(b,o.L));
   h+='<div style="display:flex;gap:6px;align-items:stretch"><button class="sb stb" data-a="smu|'+b+'|'+o.L+'" style="flex:1;opacity:'+(o.ok?1:.45)+'"><img alt="" src="'+eqIcon(o.to)+'" style="width:20px;height:20px;image-rendering:pixelated;vertical-align:middle;margin-right:6px">Upgrade to '+esc(nmT.toLowerCase())+'<br><small>'+sub+'</small></button>'+(o.ok&&o.max>1?'<button class="sb stb" data-a="smua|'+b+'|'+o.L+'" style="width:64px">ALL</button>':'')+'</div>'}
  return h}
 {const _sa=stationAct;stationAct=function(a){const st=STATION;if(!(st&&st.t==='smithbench'&&/^smua?\|/.test(a||'')))return _sa.apply(this,arguments);
   const[w,b,Ls]=a.split('|'),L=+Ls|0,o=state(b,L);if(!o)return;if(!o.okL||o.max<1){upgrade(b,L);return}
   const n=w==='smua'?o.max:1;if(sqDo('smith',n,()=>{upgrade(b,L)})){try{SQDO.d=4;SQDO.tot=n;BEN.markWork(o.U.core||'core_silver')}catch(e){self.SQERR&&SQERR(e,'274-18')}say('Upgrading...');return}
   upgrade(b,L);saveLocal(true);rPn()}}
 // ---- skill trees ----
 {const _tg=treeGains;treeGains=function(sk,l){const a=_tg.apply(this,arguments);try{if((sk===SMI||sk===CRI)&&l===11)return[...a,'Upgrade gear to +1 at a Blacksmith\'s bench (10 levels above the level that makes it; +2 at 20, +3 at 30)']}catch(e){self.SQERR&&SQERR(e,'274-19')}return a}}
 window.SQUPGRADE={UP:()=>UP,UPS,KEY,isVar,baseOf,lvlOf,state,upgrade,html,reg,reconcile,need,xpFor,eff,eff0,durT,upLine,nextT,rawD,MAXL,lv,rewrap:b=>{delete RAWD[b];if(UP[b])wrapD(b)}};/* rewrap: after something replaces IDESC[b] outright (278) */
})();
