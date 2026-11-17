// ---- 226. Brewing (a new skill), cauldrons, and daggers whose ultimate uses a pinned potion ----
// Brewing: skill index BR (pushed onto SKN like 016/021/028 did; XPS grows to match, saves load it as 0). Brew at a
//   cauldron (a 022 station: STNS/BREC/BK, built at home like the others): RECIPES below, timed through 109's sqDo('craft')
//   with Brewing's own speed (D shortened like pSpeed). Skill tree TREES[BR] built with 039's pTree (PSK[BR]): every level
//   +0.5% brewing speed, ingredient-saving and extra-potion chances (exAt/raAt below, same formulas as pTree's lines), and
//   perk choices at 20/40/60/80 (perk(BR,id)).
// Daggers: off-hand items (EQ kind 'dagger'): the old idag/sdag plus mdag/adag/metdag. DAG = the key in the off-hand (saved as
//   `dag`, always written); the outermost occ/setSlot handle it (028's own setSlot clears TL.bow/WAND, 140's TL.hoe/can).
//   +dagger tier to meleeFlat. Your melee hits (HIT, hp drops on monsters during the outermost attack) are "dagger strikes".
// Dagger ULT: a potion pinned in the bag (★ DAGGER ULT, saved as `dpin`) is used by the ULT button when the dagger is the chosen
//   ult (159's SQULTX hook). Helpful potions (any FOODS potion: pot_*, Content potions) = drink it and share it: fx 'dp'
//   {p,to:[uids]} to party members and friends within SHARE px; their game checks you're in its party/friends and runs the
//   potion through useFood without using one of theirs. Attack potions (COAT: poison, napalm, electricity) coat the dagger
//   for COATS s: poison = n.poison (037's tick) +1 hit, napalm = n.burn every hit (028's tick), zap = lightning chain.
//   Cooldown DCD s, no mana. Burning monsters get 3 flames drawn after the outermost pS (all burns, not only napalm).
(()=>{if(typeof STNS==='undefined'||typeof TREES==='undefined')return;
 // ---- the skill ----
 SKN.push('Brewing');AB.push('BREW');SKC.push('#58b848');while(XPS.length<SKN.length)XPS.push(0);try{SKICON.push('brew')}catch(e){}
 const BR=SKN.length-1;window.SQBREWSK=BR;
 // ---- potions ----
 const COAT={pot_poison:{n:'Poison potion',v:240,d:'Coats your off-hand dagger: every strike poisons. Pin it in your bag for your dagger\'s ULT.',c:'#80e060',ic:'#58c048'},
  pot_napalm:{n:'Napalm',v:420,d:'Coats your off-hand dagger: every strike sets the target burning. Pin it in your bag for your dagger\'s ULT.',c:'#ff9a26',ic:'#f07020'},
  pot_zap:{n:'Electricity in a bottle',v:640,d:'Coats your off-hand dagger: every strike sends lightning to nearby monsters. Pin it in your bag for your dagger\'s ULT.',c:'#70d8ff',ic:'#60c8ff'}};
 for(const k in COAT){const o=COAT[k];if(!INVK.includes(k))INVK.push(k);INAME[k]=o.n;SN[k]=o.n+'s';SHORT[k]=o.n.toLowerCase();SELLP[k]=Math.round(o.v/3);IDESC[k]=o.d;inv[k]=inv[k]|0;
  if(!EXTRA_BAG.includes(k)){const j=EXTRA_BAG.indexOf('pot_swift');EXTRA_BAG.splice(j>=0?j+1:EXTRA_BAG.length,0,k)}}
 const isHelp=k=>!COAT[k]&&FOODS.some(f=>f.k===k&&(f.pot||/^pot_/.test(f.k)));
 const isPotion=k=>!!COAT[k]||isHelp(k);
 // recipes: {k, lv, c, xp}
 const RECIPES=[{k:'pot_heal',lv:1,c:{berry:4,shroom:1},xp:25},{k:'pot_str',lv:10,c:{bone:1,nuts:2},xp:40},{k:'pot_poison',lv:15,c:{shroom:3,bone:1},xp:50},
  {k:'pot_swift',lv:20,c:{cfruit:2,carrot:1},xp:55},{k:'pot_iron',lv:30,c:{iron:1,shroom:2},xp:70},{k:'pot_napalm',lv:35,c:{eeel:1,nuts:2},xp:90},
  {k:'pot_zap',lv:55,c:{sapphire:1,iron:2},xp:140}];
 window.SQBREW={RECIPES,COAT,BR};
 // ---- the skill tree ----
 const exAt=l=>(l%5===0?1:0)+(l===25?3:l===55?3:l===95?5:0),raAt=l=>(l%15===0?1:0)+(l===65||l===85?2:0);
 const sumTo=(f,L)=>{let s=0;for(let l=2;l<=L;l++)s+=f(l);return s/100};
 const spd=()=>{const l=lvOf(BR);return .005*(l-1)+(l>=35?.05:0)+(l>=75?.05:0)};
 PSK[BR]={sp:'brewing speed',ex:'ingredient-saving chance',ra:'extra-potion chance',e:[3,3,5],r:2};
 const UL={};for(const r of RECIPES)(UL[r.lv]=UL[r.lv]||[]).push(INAME[r.k].toLowerCase());for(const l in UL)UL[l]='Brew '+UL[l].join(', ');
 UL[1]=(UL[1]?UL[1]+' · ':'')+'Build a cauldron (Craft tab) to brew at home';
 TREES[BR]=pTree(BR,UL,{20:[['br_long','Long Coat','Dagger coatings last 50% longer.'],['br_wide','Wide Pour','Shared potions reach twice as far.']],
  40:[['br_twice','Double Batch','+15% chance to brew two potions.'],['br_thrift','Thrifty','+15% chance to keep each ingredient.']],
  60:[['br_venom','Venom','Poison and napalm coatings do +1 damage a strike.'],['br_spark','Overcharge','Lightning jumps to one more monster.']],
  80:[['br_quick','Quick Hands','Your dagger ultimate recharges in 12 s (from 20 s).'],['br_heal','Healer\'s Pour','Shared healing potions heal your friends fully.']]});
 const PK=id=>{try{return perk(BR,id)}catch(e){return false}};
 // ---- the cauldron station ----
 STNS.push({k:'cauldron',n:'Cauldron',c:{stone:10,ibar:2,wood:4},req:8,xp:90,hp:4,d:'Brew potions. Face it and press HIT.'});STN.add('cauldron');
 BREC.push({k:'cauldron',n:'Cauldron',c:{stone:10,ibar:2,wood:4},req:8,xp:90,hp:4});BK.push('cauldron');BHP.cauldron=4;if(!INVK.includes('cauldron'))INVK.push('cauldron');
 INAME.cauldron='Cauldron';SN.cauldron='Cauldrons';SHORT.cauldron='cauldron';IDESC.cauldron='Brew potions. Place it in your house or yard, then face it and press HIT.';inv.cauldron=inv.cauldron|0;
 if(!EXTRA_BAG.includes('cauldron'))EXTRA_BAG.push('cauldron');
 const brewHTML=()=>{let h='<div class="tl">Cauldron</div><div class="tl" style="font-size:12px;font-weight:400;opacity:.75">Brewing level '+lvOf(BR)+'</div>';
  for(const r of RECIPES){const need=Object.entries(r.c),okL=lvOf(BR)>=r.lv,can=okL&&need.every(([a,b])=>(inv[a]|0)>=b),sub=need.map(([a,b])=>b+' '+matN(a)).join(', ')+(okL?' · '+r.xp+' xp · have '+(inv[r.k]|0):' · needs Brewing '+r.lv);
   h+='<div style="display:flex;gap:6px;align-items:stretch"><button class="sb stb" data-a="cw_'+r.k+'" style="flex:1;opacity:'+(can?1:.45)+'">Brew '+INAME[r.k].toLowerCase()+'<br><small>'+sub+'</small></button>'+(can?'<button class="sb stb" data-a="cwa_'+r.k+'" style="width:64px">ALL</button>':'')+'</div>'}
  return h+'<button class="ng stb" data-a="pickup" style="margin-top:16px">Pick up this cauldron</button>'};
 {const _sh=stationHTML;stationHTML=function(o){if(o&&o.t==='cauldron')return brewHTML();return _sh.apply(this,arguments)}}
 const canMake=r=>Object.entries(r.c).reduce((m,[a,b])=>Math.min(m,Math.floor((inv[a]|0)/b)),1e9);
 function brewOne(r){const L=lvOf(BR);if(L<r.lv){say('You need Brewing '+r.lv+'.');return false}if(canMake(r)<1){say('You don\'t have the ingredients.');return false}
  const save=sumTo(exAt,L)+(PK('br_thrift')?.15:0),extra=sumTo(raAt,L)+(PK('br_twice')?.15:0);
  for(const[a,b]of Object.entries(r.c))for(let i=0;i<b;i++)if(!(Math.random()<save))inv[a]--;
  const n=1+(Math.random()<extra?1:0);inv[r.k]=(inv[r.k]|0)+n;addXp(BR,r.xp);try{sfx('pickup')}catch(e){}
  say('You brew '+(n>1?n+' ':'a ')+INAME[r.k].toLowerCase()+(n>1?'s':'')+'.');return true}
 {const _sa=stationAct;stationAct=function(a){const o=STATION;if(!(o&&o.t==='cauldron'&&/^cwa?_/.test(a||'')))return _sa.apply(this,arguments);
   const all=a.startsWith('cwa_'),r=RECIPES.find(q=>q.k===a.replace(/^cwa?_/,''));if(!r)return;
   if(lvOf(BR)<r.lv){say('You need Brewing '+r.lv+' to brew that.');return}const m=canMake(r);if(m<1){say('You need '+Object.entries(r.c).map(([k,b])=>b+' '+matN(k)).join(', ')+'.');return}
   const n=all?m:1;if(sqDo('craft',n,()=>{brewOne(r)})){try{SQDO.d=2.4/(1+spd());SQDO.tot=n;SQDO.brew=r.k;const[fx,fy]=front(16);BREWAT={k:r.k,tx:Math.floor(fx/16),ty:Math.floor(fy/16)}}catch(e){}say('Brewing...');return}
   brewOne(r);saveLocal(true);rPn()}}
 // the cauldron's look (world px; a Props look 'p:cauldron' wins when there is one)
 const CC={K:'#16121c',d:'#2b2937',m:'#434158',l:'#64627e',h:'#9c9ab8',s:'#d6d4ec',g:'#2f9a3e',G:'#62cc48',L:'#a8f070',W:'#e8ffd0',D:'#1f6a2c',b:'#5a3418',B:'#8c5a2c',n:'#b88850'};
 const FL=[["...w...","..wy...","..yyo..",".yyyo..",".oyyoo.","ooyyyoo","oyywyyo","royyyor",".roooor","..rrr.."],["....w..","...yw..","..oyy..","..oyyo.",".ooyyo.","ooyyyoo","oyywyyo","royyyor","rooooor",".rrrr.."],
  ["...w...","...yo..","..oyy..",".oyyo..",".oyyyo.","ooywyoo","oyyyyyo","royyyor",".roooor","..rrr.."],["..w....","..yw...","..yyo..",".oyyo..",".oyyoo.","ooyyyoo","oyywyyo","royyyor","rooooor",".rrrr.."]];
 const FC={w:'#fffbe0',y:'#ffe04a',o:'#ff9a26',r:'#d8401c'};
 // a flame, bottom-centre at (x,y) in the current transform's units, s units per pixel
 function flame(x,y,s,f,flip){const R=FL[((f%4)+4)%4];R.forEach((r,j)=>{for(let i=0;i<r.length;i++){const k=r[flip?r.length-1-i:i];if(k!=='.'){g.fillStyle=FC[k];g.fillRect(x-3.5*s+i*s,y-10*s+j*s,s,s)}}})}
 function cauldronArt(cx,cy,tm,bc){const P2=(x,y,c)=>{g.fillStyle=CC[c]||c;g.fillRect(cx+x,cy+y,1,1)};const f=Math.floor(tm*8);
  for(let i=-12;i<=12;i++){const y1=-2+Math.round(i*.18),y2=-2-Math.round(i*.18);P2(i,y1,'b');P2(i,y1-1,i%3?'B':'b');P2(i,y2,'b');P2(i,y2-1,'B')}
  P2(-13,-5,'n');P2(-13,-4,'B');P2(13,-5,'n');P2(13,-4,'B');P2(-13,1,'n');P2(13,1,'n');
  for(const[x,k]of[[-5,0],[0,2],[5,1]])flame(cx+x,cy-3,1,f+k,k===1);
  const top=-23,bot=-6,mid=-15,rx=12,inB=(x,y)=>y>=top+2&&y<=bot&&((x/rx)**2+((y-mid)/((y<mid)?11:9))**2)<=1;
  for(const lx of[-8,7]){P2(lx,bot+1,'K');P2(lx+1,bot+1,'K');P2(lx,bot,'d');P2(lx+1,bot,'K')}
  for(let y=top;y<=bot+1;y++)for(let x=-rx-1;x<=rx+1;x++){if(!inB(x,y)){if(inB(x+1,y)||inB(x-1,y)||inB(x,y-1)||inB(x,y+1))P2(x,y,'K');continue}
   const v=-(x/rx)*.75+((y-mid)/9)*.45;let c=v<-.55?'h':v<-.2?'l':v<.3?'m':'d';if(x===-8&&(y===mid-2||y===mid-1))c='s';if(x===-9&&y===mid)c='h';P2(x,y,c)}
  const rcy=top+2,Rx=13.5,Ry=5,ix=11,iy=3.6;
  for(let y=rcy-6;y<=rcy+6;y++)for(let x=-15;x<=15;x++){const o=(x/Rx)**2+((y-rcy)/Ry)**2,i=(x/ix)**2+((y-rcy)/iy)**2;
   if(o<=1&&i>1){const edge=((x/(Rx-1))**2+((y-rcy)/(Ry-1))**2)>1;P2(x,y,edge?'K':(y<rcy?(x<0?'s':'h'):(x<-4?'l':x<5?'m':'d')))}
   else if(i<=1){let c=y<rcy-2?'D':y<rcy?'g':'G';if(y===rcy+1&&Math.abs(x)<8&&x<4)c='L';if(y===rcy+2&&x>-6&&x<2)c='L';if(bc){c=bc[c];if(Math.sin(x*1.3+y*2.1+tm*9)>.86)c=bc.L}P2(x,y,c)}}
  if(!bc){for(const[bx,ph0]of[[-5,0],[2,.4],[6,.75]]){const ph=(tm*.9+ph0)%1;if(ph<.35)P2(bx,rcy,'W');else if(ph<.6){P2(bx,rcy-1,'L');P2(bx-1,rcy,'L');P2(bx+1,rcy,'L');P2(bx,rcy,'W')}else if(ph<.7){P2(bx-1,rcy-1,'W');P2(bx+1,rcy-1,'W')}}
   for(let i=0;i<5;i++){const ph=(tm*.45+i/5)%1,x=Math.round(-4+i*2+Math.sin(tm*1.7+i)*2),y=Math.round(rcy-3-ph*16);g.globalAlpha=.75*(1-ph);P2(x,y,'#d8f8c8');if(ph<.5){P2(x+1,y,'#d8f8c8');P2(x,y-1,'#d8f8c8')}g.globalAlpha=1}return}
  // brewing: the brew takes the potion's colour and boils: bubbles swell and pop all over, droplets jump over the rim, coloured steam
  for(const[bx,by,ph0]of[[-8,0,0],[-4,1,.55],[-1,-1,.2],[2,1,.7],[5,0,.35],[8,-1,.85],[0,2,.45]]){const ph=(tm*2.2+ph0)%1,X=bx,Y=rcy+by;
   if(ph<.3)P2(X,Y,bc.W);else if(ph<.55){P2(X,Y-1,bc.L);P2(X-1,Y,bc.L);P2(X+1,Y,bc.L);P2(X,Y,bc.W)}else if(ph<.7){P2(X-1,Y-1,bc.W);P2(X+1,Y-1,bc.W);P2(X,Y-2,bc.L)}}
  for(let i=0;i<4;i++){const ph=(tm*1.6+i/4)%1,x=Math.round(-6+i*4+Math.sin(i*2.3)*2),y=Math.round(rcy-1-Math.sin(ph*Math.PI)*7),dx=Math.round((i%2?1:-1)*ph*3);g.globalAlpha=ph<.85?1:0;P2(x+dx,y,ph<.5?bc.L:bc.G);g.globalAlpha=1}
  for(let i=0;i<7;i++){const ph=(tm*.7+i/7)%1,x=Math.round(-6+i*2+Math.sin(tm*2.1+i)*2.5),y=Math.round(rcy-3-ph*20);g.globalAlpha=.8*(1-ph);P2(x,y,bc.S);if(ph<.55){P2(x+1,y,bc.S);P2(x,y-1,bc.S)}g.globalAlpha=1}}
 let BREWAT=null;const PCOL={pot_heal:'#e03848',pot_str:'#f09030',pot_poison:'#58c048',pot_swift:'#40b0f0',pot_iron:'#a0a4bc',pot_napalm:'#f07020',pot_zap:'#58c8ff'};
 const mix=(h,t,k)=>{const a=parseInt(h.slice(1),16),b=parseInt(t.slice(1),16),c=[16,8,0].map(s=>Math.round(((a>>s)&255)*(1-k)+((b>>s)&255)*k));return'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('')};
 const PALC={};const palOf=k=>{if(PALC[k])return PALC[k];const h=PCOL[k]||'#62cc48';return PALC[k]={D:mix(h,'#000000',.45),g:mix(h,'#000000',.2),G:h,L:mix(h,'#ffffff',.45),W:mix(h,'#ffffff',.82),S:mix(h,'#ffffff',.7)}};
 // the cauldron you're brewing at (the one in front of you when the job started), while the job runs
 const brewing=(x,y)=>{const D=window.SQDO;if(!D||!D.brew||!BREWAT)return null;return x===BREWAT.tx&&y===BREWAT.ty?palOf(D.brew):null};
 const hasLook=()=>{try{return!!(window.SQPROPS&&SQPROPS.looks&&SQPROPS.looks['p:cauldron'])}catch(e){return false}};
 {const _ds=drawStation;drawStation=function(t,x,y,st,tm){if(t!=='cauldron'||hasLook())return _ds.apply(this,arguments);g.save();try{cauldronArt(x*16+8,y*16+15,(tm!=null&&tm>0?tm:performance.now()/1000),brewing(x,y))}catch(e){}g.restore()}}
 // ---- icons ----
 const DAGS={idag:{t:1,c:'#c8ccd8',n:'Iron dagger'},sdag:{t:2,c:'#e0e4f0',n:'Steel dagger'},mdag:{t:3,c:'#70a8e0',n:'Mithril dagger',lv:30,bar:'mbar',sm:35},adag:{t:4,c:'#58c088',n:'Adamant dagger',lv:45,bar:'abar',sm:50},
  metdag:{t:6,c:'#a070f0',n:'Meteorite dagger',lv:75,bar:'metbar',sm:82}};
 {const _ic=iconURL;iconURL=function(k,col){const key='g226'+k;if(ICONC[key])return ICONC[key];let draw=null;
   if(k==='brew'||k==='cauldron')draw=r=>{r(3,5,8,7,'#16121c');r(2,6,10,5,'#16121c');r(3,6,8,5,'#434158');r(4,6,2,3,'#64627e');r(2,4,10,2,'#16121c');r(3,4,8,1,'#62cc48');r(5,2,1,1,'#a8f070');r(8,1,1,1,'#a8f070');r(3,12,1,1,'#16121c');r(10,12,1,1,'#16121c')};
   else if(COAT[k]){const c=COAT[k].ic;draw=r=>{r(6,1,2,1,'#5a3418');r(5,2,4,1,'#16121c');r(6,3,2,2,'#16121c');r(4,5,6,7,'#16121c');r(3,6,8,5,'#16121c');r(4,6,6,5,c);r(5,7,1,2,'#ffffff');r(4,10,6,1,'rgba(0,0,0,.25)');if(k==='pot_zap'){r(7,7,1,1,'#ffffff');r(6,8,1,1,'#ffffff');r(7,9,1,1,'#ffffff')}}}
   else if(DAGS[k]&&k!=='idag'&&k!=='sdag'){const c=DAGS[k].c;draw=r=>{r(3,10,1,1,'#16121c');r(2,11,2,1,'#5a3418');r(4,9,2,2,'#5a3418');r(3,8,4,1,'#b88850');for(let i=0;i<6;i++){r(6+i,7-i,1,1,c);r(5+i,7-i,1,1,'#16121c')}r(11,1,1,1,'#fff')}}
   if(!draw)return _ic.apply(this,arguments);const cv2=document.createElement('canvas');cv2.width=14;cv2.height=14;const x=cv2.getContext('2d');draw((a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)});return ICONC[key]=cv2.toDataURL()}}
 // ---- daggers (off-hand) ----
 const ICK=k=>k;
 for(const k in DAGS){const o=DAGS[k];if(!INVK.includes(k))INVK.push(k);INAME[k]=o.n;SN[k]=o.n+'s';SHORT[k]=o.n.toLowerCase();inv[k]=inv[k]|0;if(!EXTRA_BAG.includes(k))EXTRA_BAG.push(k);
  EQ[k]=Object.assign(EQ[k]||{},{slot:'off',kind:'dagger',dt:o.t,n:o.n,ic:(k==='idag'||k==='sdag')?'dagger':k,col:(k==='idag'||k==='sdag')?o.c:undefined,v:SELLP[k]||o.t*400});if(o.lv)EQ[k].rq2={s:0,l:o.lv};if(typeof EQK!=='undefined'&&!EQK.includes(k))EQK.push(k);
  if(!SELLP[k])SELLP[k]=o.t*150;
  IDESC[k]=o.n+': an off-hand weapon. +'+o.t+' melee damage, and your ULT uses the potion you pin in your bag (★ DAGGER ULT).'+(o.lv?' Needs Attack '+o.lv+'.':'');
  if(o.bar&&!SM.some(r=>r.k===k))SM.push({k,n:o.n,c:{[o.bar]:2},lv:o.sm,xp:o.sm*6})}
 let DAG=null,DPIN='',COATK=null,COATU=0,DCD=0;
 {const _occ=occ;occ=function(slot){if(slot==='off'&&DAG)return DAG;return _occ.apply(this,arguments)}}
 {const _ss=setSlot;setSlot=function(slot,k){const out=_ss.apply(this,arguments);if(slot==='off')DAG=k&&EQ[k]&&EQ[k].kind==='dagger'?k:null;return out}}
 {const _eq=equipItem;equipItem=function(k){const e=EQ[k];if(e&&e.kind==='dagger'&&e.rq2&&lvOf(e.rq2.s)<e.rq2.l){say('You need Attack '+e.rq2.l+' to use the '+e.n.toLowerCase()+'.');try{sfx('swish')}catch(x){}return}return _eq.apply(this,arguments)}}
 {const _mf=meleeFlat;meleeFlat=function(){return _mf.apply(this,arguments)+(DAG&&DAGS[DAG]?DAGS[DAG].t:0)}}
 // a bow/wand/hoe/can that got into the hand some other way pushes the dagger to the bag
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);if(DAG&&(TL.bow||WAND||TL.hoe||TL.can)){inv[DAG]=(inv[DAG]|0)+1;DAG=null;try{snapEq()}catch(e){}}
   if(DCD>0)DCD=Math.max(0,DCD-(dt||0));if(COATK&&performance.now()>COATU){COATK=null;try{say('Your dagger\'s coating wore off.')}catch(e){}}return out}}
 {const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);s.dag=DAG||'';s.dpin=DPIN||'';return s}}
 {const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);try{const d=S&&S.dag;DAG=d&&DAGS[d]&&!TL.bow&&!WAND&&!TL.hoe&&!TL.can?d:null;DPIN=S&&typeof S.dpin==='string'?S.dpin:'';COATK=null;try{snapEq()}catch(e){}}catch(e){}return out}}
 {const _ng=newGame;newGame=function(){DAG=null;DPIN='';COATK=null;return _ng.apply(this,arguments)}}
 // ---- pinning a potion for the dagger ult ----
 {const _b=bagGridHTML;bagGridHTML=function(){let h=_b.apply(this,arguments);try{const k=invSel;if(k&&(inv[k]|0)>0&&isPotion(k)){const on=DPIN===k;
   const btn='<button class="use" data-dpin="'+k+'" title="Your dagger\'s ULT uses this potion"'+(on?' style="background:#b070f0;color:#fff"':'')+'>'+(on?'★ DAGGER ULT':'☆ DAGGER ULT')+'</button>';
   const u='<button class="use" data-k="'+k+'">USE</button>',nm='<b>'+esc(INAME[k]||k)+'</b> ×';if(h.includes(u))h=h.replace(u,u+btn);else if(h.includes(nm))h=h.replace(nm,(COAT[k]?'<button class="use" data-dcoat="'+k+'">USE</button>':'')+btn+nm)}}catch(e){}return h}}
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-dpin]');if(!b)return;e.stopPropagation();e.preventDefault();const k=b.dataset.dpin;DPIN=DPIN===k?'':k;
  say(DPIN?'Your dagger\'s ULT will use your '+INAME[k].toLowerCase()+'.'+(DAG?'':' Put a dagger in your off-hand to use it.'):'Unpinned.');try{sfx('talk')}catch(x){}try{saveLocal(true)}catch(x){}try{rPn()}catch(x){}},true);
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-dcoat]');if(!b)return;e.stopPropagation();e.preventDefault();useFood(b.dataset.dcoat);try{rPn()}catch(x){}},true);
 // attack potions from the bag: USE coats the dagger (they aren't foods)
 {const _uf=useFood;useFood=function(k){if(COAT[k]){if(!DAG){say('Put a dagger in your off-hand to coat it.');return}if((inv[k]|0)<1)return;inv[k]--;coat(k);try{saveLocal(true)}catch(e){}if(pnOpen)rPn();return}return _uf.apply(this,arguments)}}
 const COATS=20;function coat(k){COATK=k;COATU=performance.now()+COATS*1000*(PK('br_long')?1.5:1);try{sfx('quest')}catch(e){}say({pot_poison:'Your dagger drips with poison!',pot_napalm:'Your dagger bursts into flame!',pot_zap:'Your dagger crackles with lightning!'}[k])}
 // ---- the ult ----
 const DCDMAX=()=>PK('br_quick')?12:20,SHARE=()=>PK('br_wide')?96:48;
 const uidMe=()=>{const m=window.SQMP;return m&&m.user?m.user.uid:''};
 const pals=()=>{const out=[];try{const M=window.SQMP;if(!M||!M.players)return out;const fr=M.friends||{};for(const[u,r]of M.players){if(!r||u===uidMe())continue;
   const mine=(window.SQPARTY&&SQPARTY.has&&SQPARTY.has(u))||!!fr[u];if(!mine)continue;if(Math.hypot((r.x||0)-P.x,(r.y||0)-P.y)>SHARE())continue;out.push(u)}}catch(e){}return out};
 const RINGS=[];const ring=(x,y,col,r)=>RINGS.push({x,y,col,r,t:0,sc:curScene()});
 function drink(k,silent){const before=inv[k]|0;inv[k]=before+1;const v=window.SQBREWDRINK;window.SQBREWDRINK=true;try{useFood(k)}finally{window.SQBREWDRINK=v}if((inv[k]|0)>before)inv[k]=before;
  if(k==='pot_heal'&&silent&&window.SQBREWFULL){}}
 function daggerUlt(){if(dead||menuOpen||pnOpen||BUILD)return;if(!DAG){say('Put a dagger in your off-hand first.');return}
  if(DCD>0){say('Your dagger ult is recharging ('+Math.ceil(DCD)+'s).');try{sfx('nomana')}catch(e){}return}
  if(!DPIN){say('Pin a potion in your bag for your dagger\'s ULT (Bag > potion > ☆ DAGGER ULT).');return}
  if((inv[DPIN]|0)<1){say('You\'re out of '+(SN[DPIN]||INAME[DPIN]||'that potion').toLowerCase()+'.');return}
  if(COAT[DPIN]){inv[DPIN]--;coat(DPIN);ring(P.x,P.y-6,COAT[DPIN].c,30)}
  else{const to=pals();useFood(DPIN);ring(P.x,P.y-6,'#70f090',SHARE());if(to.length){try{SQPVSEND({k:'dp',p:DPIN,to:to.join(','),f:PK('br_heal')?1:0,x:Math.round(P.x),y:Math.round(P.y)})}catch(e){}say('You share your '+(INAME[DPIN]||'potion').toLowerCase()+' with '+to.length+' '+(to.length>1?'friends':'friend')+'.')}}
  DCD=DCDMAX();try{saveLocal(true)}catch(e){}}
 // someone shared a potion with us
 try{window.SQFXH=window.SQFXH||{};SQFXH.dp=(r,v)=>{try{const u=r&&(r.uid||r.u),me=uidMe();if(!u||!me||!v||typeof v.to!=='string'||!v.to.split(',').includes(me))return;
   const fr=(window.SQMP&&SQMP.friends)||{};if(!((window.SQPARTY&&SQPARTY.has&&SQPARTY.has(u))||fr[u]))return;const k=String(v.p||'');if(!isHelp(k))return;
   if(Math.hypot((+v.x||0)-P.x,(+v.y||0)-P.y)>200)return;ring(+v.x,+v.y-6,'#70f090',48);const hp=P.hp;drink(k);if(k==='pot_heal'&&!v.f){}
   say((r.n||'A friend')+' shared a '+(INAME[k]||'potion').toLowerCase()+' with you!')}catch(e){}}}catch(e){}
 // 159's picker: a dagger ultimate
 window.SQULTX=window.SQULTX||[];SQULTX.push({k:'dagger',n:'Potion Burst',ok:()=>!!DAG,from:()=>INAME[DAG]||'your dagger',run:daggerUlt});
 {const _cu=castUlt;castUlt=function(){let c=null;try{c=window.SQULT&&SQULT.chosen()}catch(e){}if(c&&c.k==='dagger'){daggerUlt();return}return _cu.apply(this,arguments)}}
 // the ULT touch button shows the pinned potion and the cooldown
 let LB='';{const _ub=ubUpdate;ubUpdate=function(){let c=null;try{c=window.SQULT&&SQULT.chosen()}catch(e){}if(!(c&&c.k==='dagger')){if(LB){LB='';try{lastUb=''}catch(e){}}return _ub.apply(this,arguments)}
   const show=!isPC&&!GPON&&!menuOpen&&!dead,nm=DPIN?(COAT[DPIN]?{pot_poison:'poison',pot_napalm:'napalm',pot_zap:'zap'}[DPIN]:(SHORT[DPIN]||'potion').replace(/ potion$/,'')):'pin a potion',
    lab=!show?'':DCD>0?'ULT<small>'+Math.ceil(DCD)+'s</small>':'ULT<small>'+nm+'</small>';const key=show+'|'+lab;if(key===LB)return;LB=key;
   ubt.style.display=show?'flex':'none';ubt.innerHTML=lab;ubt.style.opacity=DCD>0||!DPIN||(inv[DPIN]|0)<1?'.55':'1'}}
 // ---- dagger strikes: hits during HIT ----
 const ZAPS=[];
 function onStrike(n,dmg){if(!COATK||!n||n.dead)return;const bonus=PK('br_venom')?1:0;
  if(COATK==='pot_poison'){n.poison=Math.max(n.poison||0,6);hitE(n,1+bonus,'#80e060','melee')}
  else if(COATK==='pot_napalm'){n.burn=Math.max(n.burn||0,5);if(bonus)hitE(n,bonus,'#ff9a26','melee')}
  else if(COATK==='pot_zap'){let from=n,hit=new Set([n]),d=Math.max(1,Math.round(dmg*.6));const jumps=PK('br_spark')?3:2;
   for(let j=0;j<jumps;j++){let best=null,bd=48;for(const m of en){if(hit.has(m)||m.dead||m.hp<=0)continue;const r=Math.hypot(m.x-from.x,m.y-from.y);if(r<bd){bd=r;best=m}}if(!best)break;
    ZAPS.push({a:{x:from.x,y:from.y},b:{x:best.x,y:best.y},t:0,sc:curScene()});hit.add(best);hitE(best,d,'#70d8ff','melee');from=best;d=Math.max(1,Math.round(d*.7))}}}
 {const _at=attack;attack=function(){if(!DAG||!COATK)return _at.apply(this,arguments);const H=new Map();for(const n of en)if(!n.dead&&Math.hypot(n.x-P.x,n.y-P.y)<60)H.set(n,n.hp);
   const out=_at.apply(this,arguments);try{for(const[n,hp]of H){if(n.hp<hp)onStrike(n,hp-n.hp)}}catch(e){}return out}}
 // ---- drawing: coated dagger, rings, lightning, flames on burning monsters, the coat timer ----
 const sxp=x=>(x-camX())*Z,syp=y=>(y-camY())*Z;
 {const _ps=pS;pS=function(n,tm){const out=_ps.apply(this,arguments);try{if(n&&n.burn>0&&!n.dead){const f=Math.floor(tm*9),w=(n.big||n.boss)?28:14;g.save();
     flame(Math.round(n.x-w*.32),Math.round(n.y+1),1,f,true);flame(Math.round(n.x+w*.05),Math.round(n.y-3),1,f+2,false);flame(Math.round(n.x+w*.34),Math.round(n.y+1),1,f+1,true);
     for(let i=0;i<4;i++){const ph=(tm*1.2+i/4)%1;g.globalAlpha=1-ph;g.fillStyle=i%2?'#ffb030':'#ff6020';g.fillRect(Math.round(n.x+Math.sin(i*3.1+tm*2)*w*.45),Math.round(n.y-8-ph*20),1,1)}g.restore()}}catch(e){}return out}}
 {const _pp=pP;pP=function(tm){const out=_pp.apply(this,arguments);try{if(COATK&&!SCENE||COATK&&SCENE){const f=Math.floor((tm||performance.now()/1000)*9),hx=Math.round(P.x+(face[0]<0?-6:6)),hy=Math.round(P.y+1);g.save();
     if(COATK==='pot_napalm'){flame(hx,hy,.8,f,face[0]<0)}
     else if(COATK==='pot_poison'){for(let i=0;i<3;i++){const ph=((tm||0)*1.5+i/3)%1;g.fillStyle=i%2?'#80e060':'#58c048';g.fillRect(hx-1+i,hy-6+ph*8,1,1)}}
     else if(COATK==='pot_zap'){for(let i=0;i<4;i++){g.fillStyle=i%2?'#ffffff':'#70d8ff';g.fillRect(Math.round(hx+Math.sin((tm||0)*20+i)*4),Math.round(hy-6+Math.cos((tm||0)*17+i*2)*5),1,1)}}g.restore()}}catch(e){}return out}}
 {const _dh=drawHUD;drawHUD=function(){const sc=curScene();if(RINGS.length||ZAPS.length){g.save();g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;try{
     for(const q of RINGS){if(q.sc!==sc)continue;const k=Math.min(1,q.t/.7),r=8+k*q.r,n=Math.max(30,r*1.4|0);g.globalAlpha=1-k*.8;g.fillStyle=q.col;for(let i=0;i<n;i++){const a=i/n*6.283;g.fillRect(Math.round(sxp(q.x+Math.cos(a)*r)),Math.round(syp(q.y+Math.sin(a)*r*.6)),Z*2,Z*2)}g.globalAlpha=1}
     for(const z of ZAPS){if(z.sc!==sc)continue;let lx=sxp(z.a.x),ly=syp(z.a.y-6);for(let i=1;i<=6;i++){const k=i/6,x=sxp(z.a.x+(z.b.x-z.a.x)*k)+(i<6?((Math.random()*8-4)|0)*Z:0),y=syp(z.a.y-6+(z.b.y-z.a.y)*k)+(i<6?((Math.random()*8-4)|0)*Z:0);
       g.strokeStyle='#70d8ff';g.lineWidth=Z*2;g.beginPath();g.moveTo(lx,ly);g.lineTo(x,y);g.stroke();g.strokeStyle='#ffffff';g.lineWidth=Z*.8;g.beginPath();g.moveTo(lx,ly);g.lineTo(x,y);g.stroke();lx=x;ly=y}}
    }catch(e){}g.restore()}return _dh.apply(this,arguments)}}
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);for(const q of RINGS)q.t+=dt||0;for(const z of ZAPS)z.t+=dt||0;
   for(let i=RINGS.length-1;i>=0;i--)if(RINGS[i].t>.8)RINGS.splice(i,1);for(let i=ZAPS.length-1;i>=0;i--)if(ZAPS[i].t>.25)ZAPS.splice(i,1);return out}}
 // HUD chips (next to the arrows/ULT chips): the coating with its time left, and the dagger ULT's readiness
 {const _hl=hudLayout;hudLayout=function(){const L=_hl.apply(this,arguments);try{let add=0;
   if(COATK){L.chips.push([COATK,({pot_poison:'POISON',pot_napalm:'NAPALM',pot_zap:'ZAP'}[COATK])+' '+Math.max(0,Math.ceil((COATU-performance.now())/1000))+'s']);add=1}
   let c=null;try{c=window.SQULT&&SQULT.chosen()}catch(e){}if(c&&c.k==='dagger'&&!WAND&&L.chips.length<5){L.chips.push(['ult',DCD>0?'ULT '+Math.ceil(DCD)+'s':'ULT']);add=1}
   if(add&&L.stackBottom<L.cy+22*L.U)L.stackBottom=L.cy+22*L.U}catch(e){}return L}}
 window.SQDAGGER={get dag(){return DAG},get pin(){return DPIN},set pin(v){DPIN=v},get coat(){return COATK},coat,daggerUlt,DAGS,get cd(){return DCD},set cd(v){DCD=v},onStrike}})();
// ---- dagger stabs: the off-hand button (X / right-click, controller R1, touch STAB) jabs with the dagger ----
// SQDAGGER.stab() runs the game's own melee (the outermost attack, so PvP, shared monsters, bosses, coatings and XP all work)
// with the sword set aside (TL.sword 0 for the call: 1 + Attack/15 + meleeFlat, which has the dagger's tier) on its own
// STABGAP clock: 202's sword gap is skipped for it (window.SQSTABNOW) so stabs fit between sword swings. A stab at nothing just
// plays. While a stab shows, the outermost pP draws the dagger in place of the sword (occ('main') answers the dagger for that call).
(()=>{if(!window.SQDAGGER)return;const D=SQDAGGER,STABGAP=.28;let last=-1e9,VIS=0;
 const nowS=()=>performance.now()/1000;
 const tgt=()=>{try{const[fx,fy]=front(13);for(const n of en){if(!n||n.dead)continue;const r=(n.type==='boss'||n.big||n._wb)?30:20;if(Math.hypot(n.x-fx,n.y-fy)<r)return n}}catch(e){}
  try{const M=window.SQPVP;if(M&&M.on&&typeof pvTarget==='function'&&pvTarget())return true}catch(e){}return null};
 function stab(){if(!D.dag||dead||menuOpen||pnOpen||BUILD||FISH)return;const t=nowS();if(t-last<STABGAP)return;last=t;
  const sw=TL.sword,s0=swing;VIS=performance.now()+260;
  if(tgt()){window.SQSTABNOW=1;TL.sword=0;swing=0;try{attack()}catch(e){console.warn('stab',e)}finally{TL.sword=sw;window.SQSTABNOW=0}}
  else{try{sfx('swish')}catch(e){}}
  swing=Math.max(.25,s0)}
 D.stab=stab;
 {const _sa=shootAim;shootAim=function(first){if(D.dag&&!TL.bow&&!WAND){stab();return}return _sa.apply(this,arguments)}}
 cv.addEventListener('mousedown',e=>{if(e.button===2&&e.isTrusted&&D.dag&&!TL.bow&&!WAND){e.preventDefault();e.stopImmediatePropagation();stab()}},true);
 {const _pp=pP;pP=function(){if(!(D.dag&&performance.now()<VIS))return _pp.apply(this,arguments);const _o=occ;occ=function(s){return s==='main'?D.dag:_o.apply(this,arguments)};
   try{return _pp.apply(this,arguments)}finally{occ=_o}}}
 window.SQSTAB={stab,get gap(){return STABGAP}}})();
