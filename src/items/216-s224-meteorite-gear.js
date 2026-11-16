// ---- 224. Meteorite gear ----
// Made at an anvil from meteorite bars (215). Everything needs level 75 in its skill (`rq2` = {s,l}, read by 214's skill trees).
//   Armor (eq_mhelm9/eq_mbody9/eq_mlegs9): held as armor tier 5 like 200's turtle armor, with `MT` flags (saved as `mta`,
//     KNOWN49): +5% block a piece, 2 pieces +5%, all 3 another +5% and blockCap +8%. Look: 084's plate pieces recoloured
//     (gearCH bit field `mtk`, which other players get through ch).
//   Pickaxe / axe (eq_pick9/eq_axe9): tool tier 9 (each swing hits for 10); 147 restores tiers above 4 from saves.
//   Bow (eq_bow6): bow tier 6, arrows +3 damage over an adamant bow, range +30. 147 restores tl.bow above 2.
//   Wand (eq_wmeteor): element 'meteor' (WSP.meteor), +6 spell damage. Casts mini meteorites (drawn by the outermost
//     drawSpells; 40% splash to monsters within 18 px). Ult METEOR FALL (outermost castUlt, only when 159's pick is the wand):
//     a meteor drops on the nearest monster ahead (or 70 px ahead) and explodes: spellDmg x3 to everything within 48 px.
//     Other players see it through fx 'mf'.
//   Meteorite arrows (marrow, fletched: 1 bar + 2 void logs = 25, Archery 75): used before iron/wood arrows by any bow,
//     +2 damage over iron arrows. 021/023's shoot code only knows arrow/iarrow, so the outermost shoot/shootAim lend the
//     meteorite arrows to inv.iarrow for the call and take back what was used.
(()=>{const COL='#6a48b8',LIT='#e0a8ff',DK='#3a2c60';
 TIER_N[9]=TIER_N[9]||'Meteorite';TCOL[9]=TCOL[9]||'#8a60e0';try{TIT[9]=TIT[9]||'Meteorite'}catch(e){}
 const add=(k,e,d)=>{EQ[k]=e;if(!EQK.includes(k))EQK.push(k);if(!INVK.includes(k))INVK.push(k);if(!EXTRA_BAG.includes(k))EXTRA_BAG.push(k);INAME[k]=e.n;SELLP[k]=e.v;SN[k]=e.n+'s';SHORT[k]=e.n.toLowerCase();IDESC[k]=d;inv[k]=inv[k]|0};
 const L75=75;
 // ---- tools ----
 add('eq_axe9',{slot:'axe',tier:9,n:'Meteorite axe',ic:'axe',col:'#8a60e0',v:9000,req:{s:1,l:L75},rq2:{s:1,l:L75}},'A meteorite axe: each chop hits for 10 (adamant: 8). Needs Woodcutting 75.');
 add('eq_pick9',{slot:'pick',tier:9,n:'Meteorite pickaxe',ic:'pick',col:'#8a60e0',v:9000,req:{s:2,l:L75},rq2:{s:2,l:L75}},'A meteorite pickaxe: each swing hits for 10 (adamant: 8). Needs Mining 75.');
 // ---- armor ----
 const KEY={helm:'eq_mhelm9',body:'eq_mbody9',legs:'eq_mlegs9'},NM={helm:'Meteorite helmet',body:'Meteorite chestplate',legs:'Meteorite legs'},MT={helm:false,body:false,legs:false};
 for(const s in KEY)add(KEY[s],{slot:s,arm:5,n:NM[s],ic:s,col:COL,v:{helm:12000,body:24000,legs:18000}[s],mt:1,rq2:{s:8,l:L75}},
  NM[s]+': adamant defence +5% block. Meteorite set: two pieces +5% block, all three another +5% and a higher block limit. Needs Defence 75.');
 const worn=()=>(MT.helm?1:0)+(MT.body?1:0)+(MT.legs?1:0);
 {const _occ=occ;occ=function(slot){if(MT[slot]&&ARM[slot]===5)return KEY[slot];return _occ.apply(this,arguments)}}
 {const _ss=setSlot;setSlot=function(slot,k){const out=_ss.apply(this,arguments);if(slot in MT)MT[slot]=!!k&&k===KEY[slot];return out}}
 {const _wu=watchUpgrades;watchUpgrades=function(){const was={...MT};const out=_wu.apply(this,arguments);for(const s in MT)if(was[s]&&ARM[s]!==5){if((inv['eq_'+s+'5']|0)>0)inv['eq_'+s+'5']--;inv[KEY[s]]=(inv[KEY[s]]|0)+1;MT[s]=false}return out}}
 {const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);const t=(MT.helm?'h':'')+(MT.body?'b':'')+(MT.legs?'l':'');if(t)s.mta=t;if((inv.marrow|0)>0){s.inv=s.inv||{};s.inv.marrow=inv.marrow|0}return s}}
 {const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);const t=String(S&&S.mta||'');MT.helm=t.includes('h')&&ARM.helm===5;MT.body=t.includes('b')&&ARM.body===5;MT.legs=t.includes('l')&&ARM.legs===5;
   try{if(S&&S.inv&&S.inv.marrow!=null)inv.marrow=Math.max(0,+S.inv.marrow|0)}catch(e){}try{snapEq()}catch(e){}return out}}
 {const _ng=newGame;newGame=function(){MT.helm=MT.body=MT.legs=false;return _ng.apply(this,arguments)}}
 try{KNOWN49.add('mta')}catch(e){}
 {const _bb=blockBonus;blockBonus=function(){const n=worn();return _bb.apply(this,arguments)+n*.05+(n>=2?.05:0)+(n>=3?.05:0)}}
 {const _bc=blockCap;blockCap=function(){return _bc.apply(this,arguments)+(worn()>=3?.08:0)}}
 {const _gc=gearCH;gearCH=function(){const c=_gc.apply(this,arguments);const b=(MT.helm&&ARM.helm===5?1:0)|(MT.body&&ARM.body===5?2:0)|(MT.legs&&ARM.legs===5?4:0);if(b)c.mtk=b;return c}}
 {const _kl=kitLook;kitLook=function(ch){const o=_kl.apply(this,arguments);const b=ch&&ch.mtk|0;if(!b)return o;
   if(b&2&&o.body==='plate'){o.bc=COL;o.ba=LIT}if(b&4&&o.legs==='greaves'){o.lc=COL;o.la=LIT}if(b&1&&o.head==='helm'){o.hc=COL;o.ha=LIT}return o};try{KITC.clear()}catch(e){}}
 // ---- bow ----
 add('eq_bow6',{slot:'off',kind:'bow',tier:6,n:'Meteorite bow',ic:'bow',col:'#8a60e0',v:16000,arch:L75,rq2:{s:FL,l:L75}},'A meteorite bow: the hardest-hitting, furthest-shooting bow there is. Needs Archery 75.');
 {const _ad=arrowDmg;arrowDmg=function(){return _ad.apply(this,arguments)+(TL.bow===6?3:0)+(LEND?2:0)}}
 {const _br=bowRange;bowRange=function(){return _br.apply(this,arguments)+(TL.bow===6?30:0)}}
 {const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);if(TL.bow===6){s.tl=s.tl||{};s.tl.bow=6}return s}}
 // ---- meteorite arrows ----
 const MA='marrow';INVK.includes(MA)||INVK.push(MA);INAME[MA]='Meteorite arrows';SN[MA]='Meteorite arrows';SHORT[MA]='meteorite arrows';SELLP[MA]=60;inv[MA]=inv[MA]|0;
 IDESC[MA]='Arrows tipped with meteorite: +2 damage over iron arrows. Any bow shoots these first.';
 {const j=EXTRA_BAG.indexOf('iarrow');if(!EXTRA_BAG.includes(MA))EXTRA_BAG.splice(j>=0?j+1:EXTRA_BAG.length,0,MA)}
 try{FREC.push({k:MA,n:'25 meteorite arrows',c:{metbar:1,voidlog:2},lv:L75,xp:900,f:()=>{inv[MA]=(inv[MA]|0)+25;say('Made 25 meteorite arrows.')}})}catch(e){}
 let LEND=false;
 const lend=f=>function(){const m=inv[MA]|0;if(m<=0||LEND)return f.apply(this,arguments);const iron=inv.iarrow|0,n0=PROJ.length;LEND=true;inv.iarrow=iron+m;let out;
  try{out=f.apply(this,arguments)}finally{LEND=false;const used=Math.max(0,iron+m-(inv.iarrow|0));inv[MA]=Math.max(0,m-used);inv.iarrow=iron;for(let i=n0;i<PROJ.length;i++){const p=PROJ[i];if(p&&p.k==='arrow'&&!p.ghost)p.met=1}}return out};
 if(typeof shoot==='function')shoot=lend(shoot);if(typeof shootAim==='function')shootAim=lend(shootAim);
 // ---- wand ----
 WSP.meteor={cost:2,col:'#ff70c0',c2:'#ffe0a0',sfx:'cfire'};
 add('eq_wmeteor',{slot:'off',kind:'wand',el:'meteor',n:'Meteorite wand',ic:'wmeteor',col:'#8a60e0',v:24000,lv:L75,rq2:{s:ML,l:L75}},'Casts mini meteorites that burst on whatever they hit. Its ultimate, METEOR FALL, calls a meteor down on your foes. Needs Magic 75.');
 {const base=IDESC.eq_wmeteor;Object.defineProperty(IDESC,'eq_wmeteor',{configurable:true,enumerable:true,get(){let s='';try{s='Damage '+spellDmg('meteor')+' · Costs '+WSP.meteor.cost+' mana. '}catch(e){}return s+base},set(v){}})}
 {const _sd=spellDmg;spellDmg=function(el){return _sd.apply(this,arguments)+(el==='meteor'?6:0)}}
 // splash: 40% to monsters close to the one hit
 {const _sh=spellHit;spellHit=function(s,n,dmg){const out=_sh.apply(this,arguments);try{if(s&&s.el==='meteor'&&!s.sub&&n){for(const m of en){if(m===n||m.dead||m.hp<=0||m._rp)continue;if(Math.hypot(m.x-n.x,m.y-n.y)<18)_sh.call(this,{el:'meteor',sc:s.sc,sub:1},m,Math.max(1,Math.ceil(dmg*.4)))}
   for(let k=0;k<6;k++)part(n.x,n.y-6,(Math.random()-.5)*90,(Math.random()-.9)*70,.45,k%2?'#8a60e0':'#ffb060',60)}}catch(e){}return out}}
 // mini meteorites in flight
 function rock(x,y,vx,vy,tm){const l=Math.hypot(vx,vy)||1,ux=vx/l,uy=vy/l;
  for(let i=4;i>=1;i--){const tx=Math.round(x-ux*i*3),ty=Math.round(y-uy*i*3);Rg(tx,ty,i>2?1:2,i>2?1:2,i>3?'#6a5a78':i>2?'#c04a28':'#ff8030')}
  Rg(Math.round(x)-2,Math.round(y)-2,4,4,'#120e14');Rg(Math.round(x)-1,Math.round(y)-2,3,3,'#4a4058');Rg(Math.round(x)-1,Math.round(y)-1,1,1,Math.floor(tm*10)%2?'#ff80d8':'#70e8ff');Rg(Math.round(x)+1,Math.round(y),1,1,'#ffb060')}
 if(typeof drawSpells==='function'){const _ds=drawSpells;drawSpells=function(tm){const sc=curScene(),mine=[];for(const s of SPELLS)if(s.el==='meteor'&&s.sc===sc){mine.push(s);s.sc='__m'}
   let out;try{out=_ds.apply(this,arguments)}finally{for(const s of mine)s.sc=sc}try{for(const s of mine)if(!s.dead)rock(s.x,s.y,s.vx,s.vy,tm)}catch(e){}return out}}
 // ---- ult: METEOR FALL ----
 const FALLS=[];// {x,y,t,life,sc,own}
 const dropAt=(x,y,own)=>FALLS.push({x,y,t:0,fall:.55,life:1.3,sc:curScene(),own,hit:false});
 {const _cu=castUlt;castUlt=function(){const pick=(()=>{try{const c=window.SQULT&&SQULT.chosen();return c?c.k:'wand'}catch(e){return'wand'}})();
   if(WAND!=='meteor'||pick!=='wand')return _cu.apply(this,arguments);
   if(dead||menuOpen||pnOpen||BUILD)return;if(SCENE&&!SCENE.room.cave){say('Not indoors!');return}
   if(ULTCD>0){say('Your ultimate is recharging ('+Math.ceil(ULTCD)+'s).');try{sfx('nomana')}catch(e){}return}
   if(MANA<ULT_COST){say('You need '+ULT_COST+' mana for an ultimate.');try{sfx('nomana')}catch(e){}return}
   MANA-=ULT_COST;ULTCD=20;let d=[face[0],face[1]];try{d=castDir()}catch(e){}
   let tx=P.x+d[0]*70,ty=P.y-4+d[1]*70,best=null,bd=1e9;for(const n of en){if(n.dead||n.hp<=0||n._rp)continue;const r=Math.hypot(n.x-P.x,n.y-P.y);if(r>150)continue;const k=Math.hypot(n.x-tx,n.y-ty);if(k<bd){bd=k;best=n}}
   if(best){tx=best.x;ty=best.y}dropAt(tx,ty,true);say('METEOR FALL!');try{sfx('cfire')}catch(e){}
   try{if(window.SQPVSEND)SQPVSEND({k:'mf',x:Math.round(tx),y:Math.round(ty)})}catch(e){}try{saveLocal()}catch(e){}}}
 try{window.SQFXH=window.SQFXH||{};SQFXH.mf=(pl,v)=>{const x=+v.x,y=+v.y;if(isFinite(x)&&isFinite(y))dropAt(x,y,false)}}catch(e){}
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);if(menuOpen||pnOpen)return out;const sc=curScene();
   for(const f of FALLS){f.t+=dt||0;if(!f.hit&&f.t>=f.fall){f.hit=true;if(f.sc===sc){try{shakeScreen(6)}catch(e){}try{sfx('cstorm');setTimeout(()=>{try{sfx('cfire')}catch(e){}},80)}catch(e){}
      for(let k=0;k<36;k++){const a=k/36*6.283;part(f.x,f.y-4,Math.cos(a)*(90+Math.random()*80),Math.sin(a)*(60+Math.random()*60)-30,.7,['#ff70c0','#ffb060','#8a60e0','#ffe0a0'][k%4],40,2)}
      if(f.own){const dmg=spellDmg('meteor')*3;for(const n of en.slice()){if(n.dead||n.hp<=0||n._rp)continue;if(Math.hypot(n.x-f.x,(n.y-f.y)*1.3)<48)spellHit({el:'meteor',sc,sub:1},n,dmg)}try{if(typeof rumble==='function')rumble(400,1,.8)}catch(e){}}}}}
   for(let i=FALLS.length-1;i>=0;i--)if(FALLS[i].t>FALLS[i].life)FALLS.splice(i,1);return out}}
 {const _dh=drawHUD;drawHUD=function(){if(FALLS.length&&!menuOpen){const cx=camX(),cy=camY(),sc=curScene();g.save();g.setTransform(Z,0,0,Z,-cx*Z,-cy*Z);try{const tm=performance.now()/1000;
   for(const f of FALLS){if(f.sc!==sc)continue;if(f.t<f.fall){const p=f.t/f.fall,hx=f.x+70*(1-p),hy=f.y-150*(1-p);
     // shadow growing on the ground
     g.globalAlpha=.25+.35*p;Rg(Math.round(f.x-6*p-2),Math.round(f.y-1),Math.round(12*p+4),2,'#000000');g.globalAlpha=1;
     for(let i=10;i>=1;i--){const tx=Math.round(hx+i*4.2),ty=Math.round(hy-i*9),w=i>6?1:i>3?2:3;Rg(tx,ty,w,w,i>7?'#6a5a78':i>4?'#c04a28':i>2?'#ff8030':'#ffe060')}
     Rg(Math.round(hx)-4,Math.round(hy)-4,8,8,'#120e14');Rg(Math.round(hx)-3,Math.round(hy)-4,6,6,'#4a4058');Rg(Math.round(hx)-1,Math.round(hy)-2,2,2,'#ff70c0');Rg(Math.round(hx)+1,Math.round(hy),2,1,'#ffb060');Rg(Math.round(hx)-3,Math.round(hy)+1,1,1,'#70e8ff')}
    else{const p=(f.t-f.fall)/(f.life-f.fall),r=8+p*44;g.globalAlpha=Math.max(0,1-p);
     for(let k=0;k<32;k++){const a=k/32*6.283;Rg(Math.round(f.x+Math.cos(a)*r)-1,Math.round(f.y-2+Math.sin(a)*r*.6)-1,2,2,k%2?'#ff70c0':'#ffe0a0')}
     if(p<.35){g.globalAlpha=(.35-p)*2;g.fillStyle='#fff4d8';g.beginPath();g.arc(f.x,f.y-4,10+p*40,0,6.283);g.fill()}g.globalAlpha=1}}}catch(e){}g.restore()}return _dh.apply(this,arguments)}}
 // ---- icons ----
 {const _ic=iconURL;iconURL=function(k,col){if(k!=='wmeteor'&&k!==MA)return _ic.apply(this,arguments);const key='g224'+k;if(ICONC[key])return ICONC[key];
   const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
   if(k==='wmeteor'){for(let i=0;i<8;i++)r(2+i,11-i,2,2,i<1?'#120e14':'#3a2c60');for(let i=1;i<7;i++)r(3+i,11-i,1,1,'#6a48b8');r(8,1,5,5,'#120e14');r(9,2,3,3,'#4a4058');r(10,2,1,1,'#ff80d8');r(11,3,1,1,'#ffb060');r(9,4,1,1,'#70e8ff');r(13,0,1,1,'#ffe0a0');r(7,0,1,1,'#ff70c0')}
   else{for(let i=0;i<9;i++)r(3+i,10-i,1,1,'#5a3a20');r(10,1,3,3,'#120e14');r(11,2,1,1,'#ff70c0');r(11,1,2,1,'#6a48b8');r(2,10,2,2,'#e0a8ff');r(3,11,1,2,'#8a60e0')}
   return ICONC[key]=c.toDataURL()}}
 // ---- recipes (anvil; arrows are fletched in the Craft tab) ----
 SM.push({k:'eq_pick9',n:'Meteorite pickaxe',c:{metbar:2,wood:1},lv:81,xp:900},{k:'eq_axe9',n:'Meteorite axe',c:{metbar:2,wood:1},lv:81,xp:900},
  {k:KEY.helm,n:'Meteorite helmet',c:{metbar:2},lv:82,xp:1000,def:L75},{k:KEY.legs,n:'Meteorite legs',c:{metbar:3},lv:84,xp:1500,def:L75},{k:KEY.body,n:'Meteorite chestplate',c:{metbar:4},lv:86,xp:2000,def:L75},
  {k:'eq_bow6',n:'Meteorite bow',c:{metbar:3,voidlog:3},lv:85,xp:1600},{k:'eq_wmeteor',n:'Meteorite wand',c:{metbar:2,stardust:5},lv:87,xp:1600});
 // requirements (the wand's Magic level and the bow's Archery level are checked by 028/088 from e.lv / e.arch)
 {const _eq=equipItem;equipItem=function(k){const e=EQ[k];if(e&&e.rq2&&(e.mt||e.tier===9)&&lvOf(e.rq2.s)<e.rq2.l){say('You need '+SKN[e.rq2.s]+' '+e.rq2.l+' to use the '+e.n.toLowerCase()+'.');try{sfx('swish')}catch(x){}return}return _eq.apply(this,arguments)}}
 window.SQMETGEAR={KEY,MT,worn,FALLS,dropAt}})();
