// ---------------------------------------------------------------- 71. Jewelry: gold rings and amulets with gems
// Made at any furnace with gold bars (and a gem) using Crafting. Wear one ring and one amulet: from the Bag (WEAR),
// take them off on the equipment screen. Worn jewelry is safe when you fall, like the rest of your gear.
// Also: every item that exists now always shows in the bag (and chests), which fixes gold ore and bars, the new logs
// and the mithril/adamant ores and bars not showing up.
{const JWL=[
  {k:'jr_gold',n:'Gold ring',s:'ring',g:'',b:1,lv:8,xp:40,v:150,d:'+3% block chance.'},
  {k:'jr_sapphire',n:'Sapphire ring',s:'ring',g:'sapphire',b:1,lv:18,xp:70,v:400,d:'Mana comes back 50% faster.'},
  {k:'jr_emerald',n:'Emerald ring',s:'ring',g:'emerald',b:1,lv:28,xp:100,v:700,d:'+10% XP in Woodcutting, Mining, Foraging, Fishing and Farming.'},
  {k:'jr_ruby',n:'Ruby ring',s:'ring',g:'ruby',b:1,lv:38,xp:140,v:1100,d:'+1 melee damage.'},
  {k:'jr_diamond',n:'Diamond ring',s:'ring',g:'diamond',b:1,lv:52,xp:200,v:2000,d:'+1 melee damage and +5% block chance.'},
  {k:'ja_gold',n:'Gold amulet',s:'neck',g:'',b:2,lv:12,xp:60,v:300,d:'+5% XP in every skill.'},
  {k:'ja_sapphire',n:'Sapphire amulet',s:'neck',g:'sapphire',b:2,lv:22,xp:90,v:600,d:'+1 spell damage.'},
  {k:'ja_emerald',n:'Emerald amulet',s:'neck',g:'emerald',b:2,lv:32,xp:120,v:900,d:'+1 arrow damage.'},
  {k:'ja_ruby',n:'Ruby amulet',s:'neck',g:'ruby',b:2,lv:42,xp:160,v:1400,d:'+6% block chance.'},
  {k:'ja_diamond',n:'Diamond amulet',s:'neck',g:'diamond',b:2,lv:58,xp:240,v:2600,d:'+1 damage with sword, bow and wand.'}];
 window.SQJWL=JWL;const JK={},GEMC={'':['#f8d848','#a87818'],sapphire:['#5888f8','#2848a8'],emerald:['#58d878','#208840'],ruby:['#f85868','#a82030'],diamond:['#f0fcff','#98c8e0']};
 for(const j of JWL){JK[j.k]=j;INVK.push(j.k);EXTRA_BAG.push(j.k);INAME[j.k]=j.n;IDESC[j.k]=(j.s==='ring'?'Ring':'Amulet')+': '+j.d+' Wear it from the Bag.';SELLP[j.k]=Math.round(j.v/3);SN[j.k]=j.n+'s';if(typeof SHORT!=='undefined')SHORT[j.k]=j.n.toLowerCase();inv[j.k]=inv[j.k]|0}
 const JW={ring:null,neck:null};const has=k=>JW.ring===k||JW.neck===k;
 const GATHER=new Set(['Woodcutting','Mining','Foraging','Fishing','Farming'].map(n=>SKN.indexOf(n)).filter(i=>i>=0));
 // ---- effects ----
 const _bb=blockBonus;blockBonus=function(){return _bb()+(has('jr_gold')?.03:0)+(has('jr_diamond')?.05:0)+(has('ja_ruby')?.06:0)};
 const _mf=meleeFlat;meleeFlat=function(){return _mf()+(has('jr_ruby')?1:0)+(has('jr_diamond')?1:0)+(has('ja_diamond')?1:0)};
 const _ad=arrowDmg;arrowDmg=function(){return _ad()+(has('ja_emerald')?1:0)+(has('ja_diamond')?1:0)};
 const _sd=spellDmg;spellDmg=function(el){return _sd(el)+(has('ja_sapphire')?1:0)+(has('ja_diamond')?1:0)};
 const _ax=addXp;addXp=function(i,x){if(x>0){const m=1+(has('ja_gold')?.05:0)+(has('jr_emerald')&&GATHER.has(i)?.1:0);if(m>1)x=Math.max(x+1,Math.round(x*m))}return _ax(i,x)};
 const _u=upd;upd=function(dt){_u(dt);if(!menuOpen&&!pnOpen&&!dead&&has('jr_sapphire')&&typeof MANA!=='undefined')MANA=Math.min(maxMP(),MANA+dt*.25)};
 // ---- wearing ----
 function jwWear(k){const j=JK[k];if(!j||(inv[k]|0)<1)return;const old=JW[j.s];if(old)inv[old]=(inv[old]|0)+1;inv[k]--;JW[j.s]=k;say('You put on the '+j.n.toLowerCase()+'. '+j.d);sfx('pickup');saveLocal(true);try{saveCloud(true)}catch(e){}rPn()}
 function jwOff(s){const k=JW[s];if(!k)return;inv[k]=(inv[k]|0)+1;JW[s]=null;say('You take off the '+JK[k].n.toLowerCase()+'.');sfx('talk');saveLocal(true);rPn()}
 const _bg=bagGridHTML;bagGridHTML=function(){const h=_bg();const k=invSel;if(!k||!JK[k]||(inv[k]|0)<1)return h;return h.replace('<div class="bd">','<div class="bd"><button class="use" data-jw="wear" data-k="'+k+'">WEAR</button>')};
 const _eh=equipHTML;equipHTML=function(){const row=(s,lab)=>{const k=JW[s];return'<div class="tc-r"><span>'+lab+'</span><b>'+(k?esc(JK[k].n)+' <button class="gc" data-jw="off" data-s="'+s+'" style="margin-left:6px;padding:4px 8px">Take off</button>':'None')+'</b></div>'+(k?'<div style="font-size:11px;opacity:.75;margin:-2px 0 6px">'+esc(JK[k].d)+'</div>':'')};
  return _eh()+'<div class="qc" style="margin-top:10px"><b>Jewelry</b>'+row('ring','Ring')+row('neck','Amulet')+'</div>'};
 // ---- making it at a furnace ----
 function jwRows(){let h='<div class="tl" style="margin-top:14px">Jewelry</div><div class="tl" style="font-size:12px;font-weight:400;opacity:.75;margin-top:-6px">Crafting level '+lvOf(6)+' · Gold bars: '+(inv.gbar|0)+'</div>';
  for(const j of JWL){const need=[[ 'gbar',j.b]].concat(j.g?[[j.g,1]]:[]),can=lvOf(6)>=j.lv&&need.every(([a,b])=>(inv[a]|0)>=b);
   h+='<div class="gr" style="opacity:'+(can?1:.5)+'"><img class="gimg" alt="" src="'+iconURL(j.k)+'"><div class="gi"><b>'+j.n+'</b> <small>(have '+(inv[j.k]|0)+')</small><br><small>'+need.map(([a,b])=>b+' '+(INAME[a]||a).toLowerCase()).join(', ')+' · Crafting '+j.lv+' · '+j.xp+' xp<br>'+j.d+'</small></div><button class="fg" data-jw="make" data-k="'+j.k+'">Make</button></div>'}return h}
 function jwMake(k){const j=JK[k];if(!j)return;if(sqDo('craft',1,()=>jwMake(k)))return;if(lvOf(6)<j.lv){say('You need Crafting '+j.lv+' to make that.');sfx('swish');return}
  if((inv.gbar|0)<j.b||(j.g&&(inv[j.g]|0)<1)){say('You need '+j.b+' gold bar'+(j.b>1?'s':'')+(j.g?' and a '+INAME[j.g].toLowerCase():'')+'.');sfx('swish');return}
  inv.gbar-=j.b;if(j.g)inv[j.g]--;inv[k]=(inv[k]|0)+1;addXp(6,j.xp);say('You made a '+j.n.toLowerCase()+'!');try{sfx('smelt')}catch(e){}saveLocal(true);rPn()}
 const _sh=stationHTML;stationHTML=function(o){const h=_sh(o);if(!o||o.t!=='furnace')return h;const i=h.lastIndexOf('<button class="ng stb"');return i<0?h+jwRows():h.slice(0,i)+jwRows()+h.slice(i)};
 if(typeof forgeHTML==='function'){const _fh=forgeHTML;forgeHTML=function(...a){return _fh(...a)+jwRows()}}
 const _oc=pbd.onclick;pbd.onclick=e=>{const b=e.target.closest('[data-jw]');if(b){const a=b.dataset.jw;if(a==='wear')jwWear(b.dataset.k);else if(a==='off')jwOff(b.dataset.s);else if(a==='make')jwMake(b.dataset.k);return}_oc(e)};
 // ---- hide helmet: your helmet / hood / wizard hat still counts (defence, class bonuses), it just isn't drawn,
 // for you or for anyone else. A checkbox on the Equipment screen; remembered with your save.
 {const _g=gearCH;gearCH=function(){const c=_g();if(HIDEH){c.ht=CH.ht;c.hcol=CH.hcol;delete c.mh;delete c.dyh}return c};
  const _eh2=equipHTML;equipHTML=function(){const h=_eh2();const row='<button class="sb" data-hideh="1" style="margin:8px 0 2px">Hide helmet: '+(HIDEH?'ON':'OFF')+'</button>';
   const k='<div class="qc" style="margin-top:12px">',i=h.indexOf(k);return i<0?h+row:h.slice(0,i)+row+h.slice(i)};
  pbd.addEventListener('click',e=>{const b=e.target.closest('[data-hideh]');if(!b)return;e.stopPropagation();e.preventDefault();HIDEH=!HIDEH;say(HIDEH?'Your helmet is hidden. It still protects you.':'Your helmet is showing again.');
   try{saveLocal(true);saveCloud(true)}catch(err){}try{rPn()}catch(err){}},true);
  const _sn=snap;snap=function(){const o=_sn();o.hh=HIDEH?1:0;return o};
  const _ap=applySave;applySave=function(S){_ap(S);HIDEH=!!(S&&S.hh)};
  const _ng=newGame;newGame=function(){HIDEH=false;_ng()}}
 // ---- Dragonsoul amulet (a rare drop from the Dragon world boss) ----
 // While worn, your ultimate (V / L1+R1 / the ULT button) becomes Dragon Form: you turn into a small dragon for
 // 2 minutes. Hold attack to breathe a continuous cone of fire. Press the ultimate again to change back early.
 // 1 minute cooldown once the form ends. Other players see your dragon form and your fire.
 GEMC.dsoul=['#f84020','#801008'];
 {const j={k:'ja_dsoul',n:'Dragonsoul amulet',s:'neck',g:'dsoul',v:6000,d:'Your ultimate becomes Dragon Form: become a small dragon for 2 minutes and hold attack to breathe fire. 1 minute cooldown.'};
  JK[j.k]=j;INVK.push(j.k);EXTRA_BAG.push(j.k);INAME[j.k]=j.n;IDESC[j.k]='Amulet (rare, from the Dragon): '+j.d+' Wear it from the Bag.';SELLP[j.k]=2000;SN[j.k]=j.n+'s';if(typeof SHORT!=='undefined')SHORT[j.k]=j.n.toLowerCase();inv[j.k]=inv[j.k]|0}
 const DF={on:false,t:0,cd:0,tap:0,tick:0,held:{m:false,t:false},fr:0};const DF_LIFE=120,DF_CD=60,dsoul=()=>JW.neck==='ja_dsoul';
 const dfDir=()=>face[0]<0?'w':face[0]>0?'e':face[1]<0?'n':'s';
 const DFC={};const dfSp=(fr,d)=>{const k=d+fr;if(DFC[k])return DFC[k];const src=window.SQWBART&&SQWBART.dragon(fr,d==='e'?'w':d);if(!src)return null;
  if(d!=='e')return DFC[k]=src;const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const x=c.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(src,0,0);return DFC[k]=c};
 // the little dragon is the boss sprite at a quarter of the size (24x26 world pixels), feet at y+6
 const DFOX={w:11,e:13,s:12,n:12};
 function dfDraw(x,y,d,fr,alpha){const c=dfSp(fr,d);if(!c)return;GC=g;shd(x,y+6,14);if(alpha!=null)g.globalAlpha=alpha;g.drawImage(c,x-DFOX[d],y+7-26,24,26);g.globalAlpha=1}
 // where the fire comes out, and which way it goes
 function dfMouth(x,y,d){return d==='w'?[x-9,y-9,-1,0]:d==='e'?[x+9,y-9,1,0]:d==='s'?[x,y-8,0,1]:[x,y-15,0,-1]}
 function dfFlames(x,y,d,dt){const[mx,my,fx,fy]=dfMouth(x,y,d);for(let k=0;k<3;k++){const sp=110+Math.random()*80,q=(Math.random()-.5)*.7,a=Math.atan2(fy,fx)+q;
   part(mx,my,Math.cos(a)*sp,Math.sin(a)*sp*(fy?1:.8),.32+Math.random()*.12,k===0?'#fff0a0':k===1?'#f8a020':'#f05010',-20,k===2?2:1)}}
 window.SQDF={get on(){return DF.on},get br(){return DF.on&&DF.breath},dir:dfDir,draw:dfDraw,flames:dfFlames,mouth:dfMouth,state:DF};
 function dfStart(){DF.on=true;DF.t=DF_LIFE;DF.breath=false;say('DRAGON FORM! Hold attack to breathe fire.');try{sfx('cfire');setTimeout(()=>sfx('cfire'),140)}catch(e){}
  for(let k=0;k<36;k++){const a=k/36*6.283;part(P.x,P.y-6,Math.cos(a)*110,Math.sin(a)*80-20,.6,k%3?'#f88830':'#f8e060',-30,2)}if(typeof rumble==='function')rumble(300,.8,.6)}
 function dfEnd(why){if(!DF.on)return;DF.on=false;DF.breath=false;DF.cd=DF_CD;if(why)say(why);for(let k=0;k<20;k++){const a=k/20*6.283;part(P.x,P.y-6,Math.cos(a)*70,Math.sin(a)*50,.45,'#c0c0c0',-20,2)}try{sfx('swish')}catch(e){}}
 // the ultimate
 const _cu=castUlt;castUlt=function(){if(!dsoul())return _cu();if(dead||menuOpen||pnOpen||BUILD)return;
  if(DF.on){dfEnd('You change back.');return}
  if(SCENE&&!SCENE.room.cave){say('Not indoors!');return}if(typeof SAILING!=='undefined'&&SAILING||window.SQRSAIL&&SQRSAIL.on){say('Not while sailing!');return}
  if(DF.cd>0){say('Dragon Form is recharging ('+Math.ceil(DF.cd)+'s).');try{sfx('nomana')}catch(e){}return}dfStart()};
 // attacking (and shooting) breathes fire instead
 const _at=attack;attack=function(){if(DF.on){if(!dead&&!menuOpen&&!pnOpen)DF.tap=.3;return}return _at()};
 const _sa=shootAim;shootAim=function(f){if(DF.on){DF.tap=.3;return}return _sa(f)};
 cv.addEventListener('mousedown',e=>{if(e.button===0)DF.held.m=true});addEventListener('mouseup',e=>{if(e.button===0)DF.held.m=false});addEventListener('blur',()=>{DF.held.m=DF.held.t=false});
 {const ab=document.getElementById('a');if(ab){ab.addEventListener('touchstart',()=>{DF.held.t=true},{passive:true});for(const ev of['touchend','touchcancel'])ab.addEventListener(ev,()=>{DF.held.t=false},{passive:true})}}
 const _u2=upd;upd=function(dt){_u2(dt);if(menuOpen||pnOpen)return;DF.cd=Math.max(0,DF.cd-(DF.on?0:dt));if(!DF.on)return;
  if(dead){dfEnd();return}if(!dsoul()){dfEnd('The dragon spirit leaves you.');return}if(SCENE&&!SCENE.room.cave){dfEnd('You change back to fit inside.');return}
  if(typeof SAILING!=='undefined'&&SAILING||window.SQRSAIL&&SQRSAIL.on){dfEnd('You change back to sail.');return}
  DF.t-=dt;if(DF.t<=0){dfEnd('Your dragon form fades.');return}DF.fr+=dt;
  DF.tap=Math.max(0,DF.tap-dt);DF.breath=!!(K[' ']||DF.held.m||DF.held.t||DF.tap>0);if(!DF.breath)return;
  const d=dfDir();dfFlames(P.x,P.y,d,dt);if((DF.snd=(DF.snd||0)-dt)<=0){DF.snd=.45;try{sfx('cfire')}catch(e){}}
  if((DF.tick-=dt)>0)return;DF.tick=.25;const[mx,my,fx,fy]=dfMouth(P.x,P.y,d),sc=curScene(),dmg=Math.max(2,spellDmg('fire'));
  for(const n of en){if(n.dead)continue;const big=n.type==='boss'||n.type==='bonelord'||n.big,dx=n.x-mx,dy=(n.y-(big?14:6))-my,al=dx*fx+dy*fy,pe=Math.abs(dx*fy-dy*fx);
   if(al>-4&&al<64+(big?20:0)&&pe<8+al*.45+(big?14:0))spellHit({el:'fire',sc},n,dmg)}};
 // drawing you as the dragon
 const _pp=pP;pP=function(tm){if(!DF.on)return _pp(tm);if(hurt>0&&Math.floor(tm*20)%2)return;const fr=Math.floor(tm/(qm?.12:.2))%4;dfDraw(Math.round(P.x),Math.round(P.y),dfDir(),fr)};
 // HUD: the ULT chip shows the form's timer / cooldown
 const _hl=hudLayout;hudLayout=function(){const L=_hl();if(!dsoul())return L;const i=L.chips.findIndex(c=>c[0]==='ult'),t=DF.on?'DRAGON '+Math.floor(DF.t/60)+':'+String(Math.floor(DF.t%60)).padStart(2,'0'):DF.cd>0?'ULT '+Math.ceil(DF.cd)+'s':'ULT';
  if(i>=0)L.chips[i]=['ult',t];else{L.chips.push(['ult',t]);if(L.chips.length===1)L.stackBottom=L.cy+22*L.U}return L};
 const _ub=ubUpdate;ubUpdate=function(){if(!dsoul())return _ub();const show=!isPC&&!GPON&&!menuOpen&&!dead,lab=!show?'':DF.on?'BACK<small>'+Math.ceil(DF.t)+'s</small>':DF.cd>0?'ULT<small>'+Math.ceil(DF.cd)+'s</small>':'ULT';
  const k='ds'+show+'|'+lab;if(k===lastUb)return;lastUb=k;ubt.style.display=show?'flex':'none';ubt.innerHTML=lab;ubt.style.opacity=DF.cd>0&&!DF.on?'.55':'1';ubt.style.color=DF.cd>0&&!DF.on?'':'#e05020'};
 // ---- icons ----
 const _ic=iconURL;iconURL=function(k,col){const j=JK[k];if(!j)return _ic(k,col);const key='g71'+k;if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
  const G='#f8d848',GD2='#a87818',O2='#302010',[gc,gd]=GEMC[j.g];
  if(j.s==='ring'){for(let yy=0;yy<14;yy++)for(let xx=0;xx<14;xx++){const d=Math.hypot(xx+.5-7,yy+.5-8.5);if(d>2.2&&d<5)r(xx,yy,1,1,d>4.1||d<2.9?O2:(yy<8?G:GD2))}if(j.g){r(5,1,4,4,O2);r(6,2,2,2,gc);r(6,2,1,1,'#fff')}else{r(6,3,2,1,'#fff8c0')}}
  else{for(const[a,b]of[[2,1],[3,2],[3,3],[4,4],[5,5],[11,1],[10,2],[10,3],[9,4],[8,5]])r(a,b,1,1,GD2);r(4,6,6,7,O2);r(5,7,4,5,G);r(6,8,2,3,gc);r(6,8,1,1,'#fff');r(8,10,1,1,gd)}
  return ICONC[key]=c.toDataURL()};
 // ---- saving ----
 const _sn=snap;snap=function(){const s=_sn();if(JW.ring||JW.neck)s.jw={ring:JW.ring,neck:JW.neck};return s};
 const _ap=applySave;applySave=function(S){_ap(S);JW.ring=JW.neck=null;const w=S&&S.jw;if(w){if(JK[w.ring]&&JK[w.ring].s==='ring')JW.ring=w.ring;if(JK[w.neck]&&JK[w.neck].s==='neck')JW.neck=w.neck}};
 const _ng=newGame;newGame=function(){JW.ring=JW.neck=null;_ng()};
 window.SQJW=JW;window.SQJK=JK;window.SQGEMC=GEMC}
// every item shows in the bag and in chests
{const seen=new Set(BAG_ORDER());const order=['oaklog','willowlog','maplelog','yewlog','goldore','mithore','adamore','gbar','mbar','abar'];
 for(const k of order.concat([...INVK]))if(INAME[k]&&!seen.has(k)){seen.add(k);EXTRA_BAG.push(k)}}
