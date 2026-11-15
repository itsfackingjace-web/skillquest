// ---- 207. The Void Treant (a weekly guild boss), void logs and the Void wand ----
// Void trees (o.v 'dark') give Void logs instead of plain logs. A guild's leader or an officer spends 5,000 void logs from the
// guild bank (197's bankUpdate, with guilds/<g>/boss {w: week number (Monday 00:00 UTC, like 143), t, by, k: killed at}) to wake
// the Void Treant once a week; a void portal (197's applyBuildings, use 'gtreant') stays on the guild island until it falls.
// The fight is 100's island-boss arena under the id gt_<guild id>; every fighter gets a Void wand (eq_wvoid, element 'void',
// spellDmg +4, Magic 50, every 4th void hit heals a heart; the void ultimate is 029's storm branch turned into VOID RIFT).
// Melee hits on the Treant add 1 + axe tier + Woodcutting/10. Rules: guilds.$g.boss (publish them).
(()=>{
const TP={"a": "#0c0814", "b": "#7a64a0", "c": "#58447a", "d": "#a890d0", "e": "#3e2e5a", "f": "#1c1428", "g": "#9c6ad8", "h": "#e8d0ff", "i": "#56404e", "j": "#725a68", "k": "#3c2a3c", "l": "#c8a0ff", "m": "#ffffff", "n": "#7a40c8", "o": "#9a6ae0", "p": "#221626", "q": "#5c3a8a"},TR=".............aaaaaabbbbbbbbcccaaaaaa..............|...........aabbbbbbbbddbcccccccbbbbbaa............|.........aabbbbbbbbbbbccccccccccbbbbccaa..........|........abbbbbbbbbbbcccccccccceebbcccccca.........|........abbbddbccccccccccccceeeecccccccca.........|.......abbbbbcccccfccccccceeeefcccccccccca........|....aaacbbbccccccccffcceeeeeffcggcccccceecaaa.....|...accccbccccccccccccfffffffccchhcccceeeecccca....|..acccccccccccccccceeeeeecccccccccceeeeecccceea...|.acccccccggcccccceeeeeffeffcccccceeeeeffcceeeeea..|.cccccccchhffcbbbbbbbfbbbbbfbbbbbbbeffcceeggeeeea.|.ccccbbbbbeebbbbbbbbbbbbbbbccbbbbbccccebbbhheeeea.|.ccbbbbbbbcbbbbbbbbbbddbccccccbbbcccccbbbbbbcceea.|.cbbddbccccbbbdggcbbbbccccggccccccccccddbccccccea.|.bbbbcccccbbbbbhhcbbcccccchhcceccccccccccccccccca.|.bbcccccccbbbccccccccccccccceeecccccceeccccccccea.|.cccccccccbccccccccfccccceeeefccccceeeecccccceeea.|.afccccceeecccccccceffceeeeffcccceeeeecccceeeefa..|..affceeeeffcccccceeeefffffccccceeeeeffceeeeffa...|...aafffffaaffeceeeeeffaaaffcceeeeefeaafffffaa....|.....aaaaa..aacffefffaaiiiaaffffeffaca.aaaaa......|.............aeaacaaaiiiiiiiaaaacaaaea............|..............a.aeaaaiiiiiiiiaaaea..a.............|................acajjaaiiiiaakkaca................|.................akjaaaaiiaaaakaea.....a..........|.................akjlmliiiilmlkka.aaa.aca.........|.............a...akjanaijjianakkaaiiiacba.........|............aca.aaooiiiikjiiikkoiiiiiiaa..........|...........abcaaiiojiiiiiiiiikooiikkkiia..........|............aaiiiikjaaaaaaaaaakkkkaaakiia.........|............aiiikkkaajppjppjpakkaa...akiia........|...........aiikkaakjanjnnjnnjaaka.....akia........|..........aiikaaakjiaaaaaaaaaakka......akia.......|.........aiika..akjiooooooooookkka......aiia......|........aiika...akjiqqqqqqqqqqkkka......akia......|........aika...akjiiooooooooiokkka......aaia......|.......aika....akjiiiqqqqqiqiiikkka....akakka.....|......aiia.....akjiiioioooioiiikkka...akaakaka....|......aika....akjiiiiiiqiqiipiikkka...akaakaaka...|.....aiia.....akjiiiiipoiiiipiiikkka...a.aka.a....|.....aika.....akjiiiiipiiiiipiiikkka......a.......|....akkaka...akjiiiiiipiiiiipiiikkka..............|...akakaaka..akjiiiiiipiiiiiipiiikkka.............|..akaakaaka..akjiiijiiipiiiipiiiikkka.............|...a.aka.a..akjooippiipiiiiipiipikkka.............|......a.....akjiiipiiipiiiiipiipiikkka............|...........akjiiiiiiiipiipiiiiipiikkka............|...........akjiiiiiiiipiipiiiiipiiiooka...........|..........akjiiiiiiiiiiiipiiiiiipiikkka...........|..........akjiiiiiiiiiiiipiiiiipiiiikkka..........|.........akjiiiiiiiiiiiiiipiiiipiiiikkka..........|........akjiiiiiiiiiiiiiipiiiiiiiiiiikkka.........|......aakjiiiiiiiiiiiiiiipiiiiiiiiiiiikkkaa.......|.....akjiiiiikkkaaaakjiiiiikkkaaaakjiiiikkka......|....akjiiikkkaaa....akjiiikkka....aaakjiikkka.....|...akjkkkkaaa........akjkkkka........aakjkkkka....|..akkkkaaa............akkkka...........aakkkkka...|.akkkaa................aaaa..............akkkkka..|.kkaa.....................................aakkkka.|.aa.........................................aaaa..";
 // ---- void logs: void trees (o.v 'dark': the Shattered Expanse, guild void saplings) give these instead of plain logs ----
 const VL='voidlog';INVK.push(VL);INAME[VL]='Void logs';SN[VL]='Void logs';SHORT[VL]='void logs';SELLP[VL]=30;inv[VL]=inv[VL]|0;
 IDESC[VL]='Dark wood that hums faintly, from void trees. A guild spends '+(5000).toLocaleString()+' of them from the guild bank to summon the Void Treant.';
 const isLog=k=>k==='wood'||/log$/.test(k);
 const treeAt=()=>{try{const[fx,fy]=front(13),tx=Math.floor(fx/16),ty=Math.floor(fy/16),R=SCENE&&SCENE.room;if(R&&R.region){const it=rgObjAt(R,tx,ty);return it&&it.o}}catch(e){}return null};
 {const _a=attack;attack=function(){let o=null;try{o=treeAt()}catch(e){}if(!o||o.v!=='dark'||SKOF[o.t]!==1)return _a.apply(this,arguments);
   const b={};for(const k in inv)if(isLog(k))b[k]=inv[k]|0;const out=_a.apply(this,arguments);
   try{let n=0;for(const k in inv){if(!isLog(k)||k===VL)continue;const d=(inv[k]|0)-(b[k]|0);if(d>0){inv[k]-=d;n+=d}}
    if(n>0){inv[VL]=(inv[VL]|0)+n;addXp(1,15*n);say('+'+n+' void log'+(n>1?'s':''));try{gTxt(P.x,P.y-30,'+'+n+' void log'+(n>1?'s':''),'#c8a0ff')}catch(e){}}}catch(e){console.warn('voidlog',e)}return out}}
 // ---- the Void wand: element 'void', the strongest wand; every 4th hit heals you one heart ----
 const WV='eq_wvoid',VB=4;
 WSP.void={cost:3,col:'#9a5af0',c2:'#e8d0ff',sfx:'cvoid'};
 SFX.cvoid=()=>{noise(.14,.07,500);tone(170,.24,'sine',.045,-90);tone(340,.12,'triangle',.02,-200,.04)};
 {const e={slot:'off',kind:'wand',el:'void',n:'Void wand',ic:'wvoid',col:'#7a40c8',v:20000,lv:50};EQ[WV]=e;EQK.push(WV);INVK.push(WV);EXTRA_BAG.push(WV);INAME[WV]=e.n;SELLP[WV]=8000;SN[WV]=e.n+'s';SHORT[WV]=e.n.toLowerCase();inv[WV]=inv[WV]|0;
  const base='From the Void Treant. Casts void bolts that hit harder than any other wand, and every fourth hit drains life back to you (+1 heart). Needs Magic 50.';
  Object.defineProperty(IDESC,WV,{configurable:true,enumerable:true,get(){let s='';try{s='Damage '+spellDmg('void')+' · Costs '+WSP.void.cost+' mana. '}catch(e){}return s+base},set(v){}})}
 {const _sd=spellDmg;spellDmg=function(el){return _sd.apply(this,arguments)+(el==='void'?VB:0)}}
 {const _ic=iconURL;iconURL=function(k,col){if(k!=='wvoid')return _ic(k,col);const key='g207wvoid';if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
   for(let i=0;i<8;i++)r(2+i,11-i,2,2,i%3?'#3c2a3c':'#56404e');r(1,12,2,1,'#221626');r(8,0,6,6,'#0c0814');r(9,1,4,4,'#7a40c8');r(10,2,2,2,'#e8d0ff');r(13,3,1,1,'#c8a0ff');r(8,5,1,1,'#c8a0ff');return ICONC[key]=c.toDataURL()}}
 let VD=0,VU=0;
 {const _sh=spellHit;spellHit=function(s,n,dmg){if(VU&&s&&s.el==='storm')s=Object.assign({},s,{el:'void'});const out=_sh.call(this,s,n,dmg);
   try{if(s&&s.el==='void'&&!s.sub&&!dead){for(let k=0;k<4;k++)part(n.x,n.y-8,(P.x-n.x)*(.8+Math.random()*.6),(P.y-8-n.y)*(.8+Math.random()*.6),.5,k%2?'#c8a0ff':'#7a40c8',0,1);
     VD+=VU?1:.25;if(VD>=1){VD-=1;if(P.hp<6){P.hp=Math.min(6,P.hp+1);try{gTxt(P.x,P.y-26,'+1 heart','#d8b0ff')}catch(e){}}}}}catch(e){}return out}}
 // the void ultimate: 029 has no case for 'void' and runs its storm branch; here that becomes VOID RIFT (purple, and it drains)
 let VRF=null;
 {const _cu=castUlt;castUlt=function(){const v=WAND==='void',cd=ULTCD;if(!v)return _cu.apply(this,arguments);VU=1;let out;try{out=_cu.apply(this,arguments)}finally{VU=0}
   if(ULTCD>cd&&typeof ULTFX!=='undefined'&&ULTFX&&ULTFX.el==='storm'){VRF={t:0,pts:(ULTFX.bolts||[]).slice()};ULTFX=null;say('VOID RIFT!');try{sfx('cvoid');setTimeout(()=>sfx('cvoid'),120)}catch(e){}}return out}}
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);if(VRF){VRF.t+=dt;if(VRF.t>.8)VRF=null}return out}}
 {const _dh=drawHUD;drawHUD=function(){if(VRF&&!menuOpen)try{const cx=camX(),cy=camY(),p=VRF.t/.8;g.save();g.setTransform(Z,0,0,Z,-cx*Z,-cy*Z);
    for(const[bx,by]of VRF.pts){g.globalAlpha=Math.max(0,1-p);const r=6+p*18;g.fillStyle='#0c0814';g.beginPath();g.ellipse(bx,by-4,r,r*.6,0,0,6.283);g.fill();g.strokeStyle='#b080f0';g.lineWidth=1.5;g.beginPath();g.ellipse(bx,by-4,r+2,r*.6+2,0,0,6.283);g.stroke();
     for(let k=0;k<8;k++){const q=k/8*6.283+p*6;Rg(Math.round(bx+Math.cos(q)*(r+5)),Math.round(by-4+Math.sin(q)*(r*.6+3)),2,2,k%2?'#e8d0ff':'#9a5af0')}}
    g.globalAlpha=1;g.restore()}catch(e){}return _dh.apply(this,arguments)}}

 // ---- the Void Treant (a guild boss) ----
 // The arena and the fight are 100's island-boss system (shared online, +60% health per extra fighter, every fighter in the
 // arena when it falls gets the whole reward). Its id is per guild (`gt_<guild id>`), added to SQIB hidden from for..in
 // (111a's Stats table and 111d's monster list only know the five island bosses).
 const SUM=5000,WEEK=()=>Math.floor((((window.SQGUILD&&SQGUILD.api)?SQGUILD.api.now():Date.now())-345600000)/604800000);
 const A=()=>window.SQGUILD&&SQGUILD.api,GID=()=>window.SQGUILD&&SQGUILD.id||'',TID=()=>GID()?'gt_'+GID():'';
 const isT=id=>/^gt_/.test(String(id||''));
 const DEF={n:'The Void Treant',door:'',lm:'the void portal',hp:6000,col:'#9a5af0',shard:'',sc:['#c8a0ff','#5a3a8a'],
  floor:['#2a2236','#30283e'],wall:'#1c1626',trim:'#0a0810',gold:[1500,2500],loot:[[WV,1],[VL,150],['yewlog',25]],xp:6000,rare:['ptvoid','Void treeling (pet)'],
  atk:[['circles',3.4,{n:6,r:20,delay:1.1,k:'void'}],['fan',2.6,{n:5,spread:.3,sp:95,k:'void'}],['spiral',4.8,{n:14,sp:70,k:'void'}],['ring',6.5,{max:110}],['summon',13,{key:'wolf:void',n:2,cap:3,half:1}]]};
 function regBoss(){const id=TID();if(!id||!window.SQIB)return'';if(!Object.prototype.hasOwnProperty.call(SQIB,id))Object.defineProperty(SQIB,id,{value:Object.assign({},DEF),enumerable:false,configurable:true,writable:true});
  if(typeof DKIND!=='undefined'&&!DKIND['ib_'+id])DKIND['ib_'+id]={name:DEF.n,floor:DEF.floor,wall:DEF.wall,trim:DEF.trim,W:30,H:24,floors:1,cavey:1};return id}
 const rec=()=>{const a=A();return a&&a.ready?a.rec:null};
 const open=()=>{const r=rec();return!!(r&&r.w===WEEK()&&!r.k)};
 const beaten=()=>{const r=rec();return!!(r&&r.w===WEEK()&&r.k)};
 function enter(it){if(!open()){A()&&A().tell('The portal has closed.');return}const id=regBoss();if(!id)return;
  say('You step through the void portal...');try{sfx('roar')}catch(e){}SQIBENTER(id,it)}
 function summon(){const a=A();if(!a||!a.on()||!a.ready)return;if(!a.boss()){a.tell('Only the leader and officers can summon the Void Treant.');return}
  if(open()){a.tell('The Void Treant is already awake. Its portal is on the guild island.');return}if(beaten()){a.tell('Your guild already beat the Void Treant this week. It can be summoned again from Monday.');return}
  const have=(SQGUILD.state.bank.i[VL]|0);if(have<SUM){a.tell('The guild bank needs '+SUM.toLocaleString()+' void logs (it has '+have.toLocaleString()+').');try{sfx('swish')}catch(e){}return}
  const ex={};ex['guilds/'+GID()+'/boss']={w:WEEK(),t:a.TS(),by:a.me()};
  a.bankUpdate({[VL]:-SUM},{w:'boss',k:VL,d:SUM},ex).then(()=>{a.tell('The Void Treant awakens! A void portal has opened on the guild island. Everyone who fights it gets a Void wand.');msgT=7;try{sfx('roar')}catch(e){}}).catch(a.fail)}
 // when it falls: close the portal for the week (any fighter writes k; the first one wins)
 function kill(){const a=A(),r=rec();if(!a||!a.on()||!r||r.k)return;try{a.DB().set(a.ref('guilds/'+GID()+'/boss/k'),a.TS()).catch(()=>{})}catch(e){}}
 {const _se=sqEvent;sqEvent=function(type,item){if(type==='islandboss'&&isT(item)){try{kill();if(window.SQACH&&SQACH.add)SQACH.add('ibw')}catch(e){}return}return _se.apply(this,arguments)}}
 // Woodcutting fights it too: every melee hit that lands on the Treant chops in extra damage (axe tier + Woodcutting/10)
 {const _a=attack;attack=function(){const S=window.SQIBST,b=S&&S.boss;if(!b||!isT(b.ib)||b.dead)return _a.apply(this,arguments);const h0=b.hp,out=_a.apply(this,arguments);
   try{if(b.hp<h0&&!b.dead){const ex=1+(TL.axe|0)+Math.floor(lvOf(1)/10);b.hp-=ex;addXp(1,ex*4);DMGS.push({x:b.x+10,y:b.y-70,v:'+'+ex,t:0,c:'#a8e070',sc:curScene()});
     for(let k=0;k<5;k++)part(b.x+(Math.random()-.5)*20,b.y-30,(Math.random()-.5)*80,-30-Math.random()*50,.5,k%2?'#56404e':'#9a6ae0',160,2)}}catch(e){}return out}}
 // ---- its look: the pixel sprite (TP palette, TR rows) at 1.5x, swaying; eyes flare on a wind-up, motes orbit it ----
 let SPR=null,SPRW=null,EYE=[];
 function sprite(white){if(SPR)return white?SPRW:SPR;const rows=TR.split('|'),h=rows.length,w=Math.max(...rows.map(r=>r.length));
  const mk=wh=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');rows.forEach((r,y)=>{for(let i=0;i<r.length;i++){const ch=r[i];if(ch==='.')continue;x.fillStyle=wh?'#ffffff':TP[ch];x.fillRect(i,y,1,1);if(!wh&&TP[ch]==='#ffffff')EYE.push([i,y])}});return c};
  SPR=mk(0);SPRW=mk(1);return white?SPRW:SPR}
 function drawTreant(b,tm){const S=1.5,c=sprite(),w=c.width*S,h=c.height*S,x=Math.round(b.x),y=Math.round(b.y),pose=window.SQIBPOSE?SQIBPOSE(b):['idle',''],wind=pose[0]==='wind'||pose[0]==='strike',hit=Math.abs(b.kx||0)+Math.abs(b.ky||0)>.3;
  g.fillStyle='rgba(150,90,240,'+(.1+.06*Math.sin(tm*2)+(wind?.14:0))+')';g.beginPath();g.ellipse(x,y-h*.45,w*.62,h*.55,0,0,6.283);g.fill();shd(b.x,b.y+6,Math.min(w*.55,60));
  const sway=Math.round(Math.sin(tm*1.3)),bob=b.mv>0?-Math.round(Math.abs(Math.sin(tm*5))*2):0,left=Math.round(x-w/2+sway),top=Math.round(y+6-h+bob);
  g.save();g.imageSmoothingEnabled=false;g.drawImage(c,left,top,Math.round(w),Math.round(h));if(hit){g.globalAlpha=.55;g.drawImage(sprite(1),left,top,Math.round(w),Math.round(h))}g.restore();
  if(wind)for(const[ex,ey]of EYE){g.fillStyle='rgba(220,180,255,'+(.35+.25*Math.sin(tm*18))+')';g.beginPath();g.arc(left+(ex+.5)*S,top+(ey+.5)*S,4,0,6.283);g.fill()}
  for(let k=0;k<7;k++){const q=tm*(wind?3.2:1.1)+k/7*6.283;Rg(Math.round(x+Math.cos(q)*w*.5),Math.round(y-h*.5+Math.sin(q)*12),2,2,k%2?'#c8a0ff':'#7a40c8')}}
 {const _art=window.SQIBART;window.SQIBART=function(id,b,tm){if(isT(id)){try{drawTreant(b,tm)}catch(e){}return true}return _art?_art.apply(this,arguments):false}}
 // the portal on the guild island
 function drawPortal(it,tm){const x=it.x*16+8,y=it.y*16+12;shd(x,y+3,14);
  g.fillStyle='#0c0814';g.beginPath();g.ellipse(x,y-10,8,13,0,0,6.283);g.fill();g.fillStyle='rgba(122,64,200,'+(.55+.25*Math.sin(tm*3))+')';g.beginPath();g.ellipse(x,y-10,5,10,0,0,6.283);g.fill();
  g.strokeStyle='#b080f0';g.lineWidth=1.5;g.beginPath();g.ellipse(x,y-10,9,14,0,0,6.283);g.stroke();
  for(let k=0;k<10;k++){const q=tm*2+k/10*6.283;Rg(Math.round(x+Math.cos(q)*11),Math.round(y-10+Math.sin(q)*16),k%3?1:2,k%3?1:2,k%2?'#e8d0ff':'#9a5af0')}
  if(Math.random()<.2)try{part(x+(Math.random()-.5)*10,y-6,(Math.random()-.5)*10,-20-Math.random()*20,.8,'#c8a0ff',-10,1)}catch(e){}}
 // ---- the guild screen's Void Treant tab (197) ----
 let PIC='';const pic=()=>{if(!PIC)try{PIC=sprite().toDataURL()}catch(e){}return PIC};
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function html(){const a=A(),G=SQGUILD.state,have=(G.bank&&G.bank.i&&G.bank.i[VL])|0;let h='<div class="qc"><div style="display:flex;gap:12px;align-items:center"><img alt="" src="'+pic()+'" style="width:75px;height:90px;image-rendering:pixelated;flex:none">'+
   '<div><b>The Void Treant</b><p style="font-size:13px">An ancient tree swallowed by the void. Once a week the guild can feed it '+SUM.toLocaleString()+' void logs from the guild bank to wake it. A void portal opens on your guild island: go through together.</p></div></div>';
  if(open())h+='<p><b style="color:#6a30b0">It\'s awake!</b> The void portal is on your guild island. It stays open until the Treant falls (this week).</p>';
  else if(beaten())h+='<p><b>Beaten this week ✓</b> It can be summoned again from Monday.</p>';
  else{h+='<div class="gdgbar"><i style="width:'+Math.min(100,100*have/SUM)+'%;background:#8050c0"></i></div><small>'+have.toLocaleString()+' / '+SUM.toLocaleString()+' void logs in the guild bank</small><br>';
   h+=a.boss()?'<button class="qb" data-g="gtb:sum"'+(have<SUM?' disabled style="opacity:.5"':'')+'>Summon it ('+SUM.toLocaleString()+' void logs)</button>':'<p style="font-size:13px">The leader or an officer summons it once the bank has enough.</p>'}
  h+='</div><div class="qc"><b>Rewards (every fighter, every fight)</b><p style="font-size:13px">A <b>Void wand</b>: the strongest wand, Magic 50. Its void bolts hit harder than any adamant wand and every fourth hit heals you a heart.<br>'+
   DEF.gold[0].toLocaleString()+'-'+DEF.gold[1].toLocaleString()+' gold, '+DEF.loot[1][1]+' void logs, '+DEF.loot[2][1]+' yew logs, Attack and Defence XP. 5%: a Void treeling (pet).</p></div>'+
   '<div class="qc"><b>Tips</b><p style="font-size:13px">Chop it! Your axe and Woodcutting level add damage to every melee hit. It gets 60% tougher for each extra fighter. Void logs come from void trees: on the Shattered Expanse, and void saplings planted on your guild island. Put them in the guild bank chest.</p></div>';
  return h}
 function act(x){if(x==='sum')summon()}
 window.SQGTREANT={open,beaten,html,act,enter,drawPortal,summon,kill,regBoss,WEEK,DEF,SUM,sprite,drawTreant};
 // keep the boss registered, and the portal in step with the week (the database listener covers summons and kills)
 let WAS=null;{const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{if(GID())regBoss();const o=open();if(o!==WAS){WAS=o;const a=A();if(a)a.applyBuildings()}}catch(e){}return out}}
})();
