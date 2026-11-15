// ---- 207. The Void Treant (a weekly guild boss), void logs and the Void wand ----
// Void trees (o.v 'dark') give Void logs instead of plain logs. A guild's leader or an officer spends 50,000 void logs from the
// guild bank (197's bankUpdate, with guilds/<g>/boss {w: week number (Monday 00:00 UTC, like 143), t, by, k: killed at}) to wake
// the Void Treant once a week; a void portal (197's applyBuildings, use 'gtreant') stays on the guild island until it falls.
// The fight is 100's island-boss arena under the id gt_<guild id>; every fighter gets a Void wand (eq_wvoid, element 'void',
// spellDmg +4, Magic 50, every 4th void hit heals a heart; the void ultimate is 029's storm branch turned into VOID RIFT).
// Melee hits on the Treant add 1 + axe tier + Woodcutting/10. Rules: guilds.$g.boss (publish them).
(()=>{
const TP={"a": "#0c0814", "b": "#7a64a0", "c": "#58447a", "d": "#a890d0", "e": "#3e2e5a", "f": "#1c1428", "g": "#9c6ad8", "h": "#e8d0ff", "i": "#56404e", "j": "#725a68", "k": "#3c2a3c", "l": "#c8a0ff", "m": "#ffffff", "n": "#7a40c8", "o": "#9a6ae0", "p": "#221626", "q": "#5c3a8a"},TR=".............aaaaaabbbbbbbbcccaaaaaa..............|...........aabbbbbbbbddbcccccccbbbbbaa............|.........aabbbbbbbbbbbccccccccccbbbbccaa..........|........abbbbbbbbbbbcccccccccceebbcccccca.........|........abbbddbccccccccccccceeeecccccccca.........|.......abbbbbcccccfccccccceeeefcccccccccca........|....aaacbbbccccccccffcceeeeeffcggcccccceecaaa.....|...accccbccccccccccccfffffffccchhcccceeeecccca....|..acccccccccccccccceeeeeecccccccccceeeeecccceea...|.acccccccggcccccceeeeeffeffcccccceeeeeffcceeeeea..|.cccccccchhffcbbbbbbbfbbbbbfbbbbbbbeffcceeggeeeea.|.ccccbbbbbeebbbbbbbbbbbbbbbccbbbbbccccebbbhheeeea.|.ccbbbbbbbcbbbbbbbbbbddbccccccbbbcccccbbbbbbcceea.|.cbbddbccccbbbdggcbbbbccccggccccccccccddbccccccea.|.bbbbcccccbbbbbhhcbbcccccchhcceccccccccccccccccca.|.bbcccccccbbbccccccccccccccceeecccccceeccccccccea.|.cccccccccbccccccccfccccceeeefccccceeeecccccceeea.|.afccccceeecccccccceffceeeeffcccceeeeecccceeeefa..|..affceeeeffcccccceeeefffffccccceeeeeffceeeeffa...|...aafffffaaffeceeeeeffaaaffcceeeeefeaafffffaa....|.....aaaaa..aacffefffaaiiiaaffffeffaca.aaaaa......|.............aeaacaaaiiiiiiiaaaacaaaea............|..............a.aeaaaiiiiiiiiaaaea..a.............|................acajjaaiiiiaakkaca................|.................akjaaaaiiaaaakaea.....a..........|.................akjlmliiiilmlkka.aaa.aca.........|.............a...akjanaijjianakkaaiiiacba.........|............aca.aaooiiiikjiiikkoiiiiiiaa..........|...........abcaaiiojiiiiiiiiikooiikkkiia..........|............aaiiiikjaaaaaaaaaakkkkaaakiia.........|............aiiikkkaajppjppjpakkaa...akiia........|...........aiikkaakjanjnnjnnjaaka.....akia........|..........aiikaaakjiaaaaaaaaaakka......akia.......|.........aiika..akjiooooooooookkka......aiia......|........aiika...akjiqqqqqqqqqqkkka......akia......|........aika...akjiiooooooooiokkka......aaia......|.......aika....akjiiiqqqqqiqiiikkka....akakka.....|......aiia.....akjiiioioooioiiikkka...akaakaka....|......aika....akjiiiiiiqiqiipiikkka...akaakaaka...|.....aiia.....akjiiiiipoiiiipiiikkka...a.aka.a....|.....aika.....akjiiiiipiiiiipiiikkka......a.......|....akkaka...akjiiiiiipiiiiipiiikkka..............|...akakaaka..akjiiiiiipiiiiiipiiikkka.............|..akaakaaka..akjiiijiiipiiiipiiiikkka.............|...a.aka.a..akjooippiipiiiiipiipikkka.............|......a.....akjiiipiiipiiiiipiipiikkka............|...........akjiiiiiiiipiipiiiiipiikkka............|...........akjiiiiiiiipiipiiiiipiiiooka...........|..........akjiiiiiiiiiiiipiiiiiipiikkka...........|..........akjiiiiiiiiiiiipiiiiipiiiikkka..........|.........akjiiiiiiiiiiiiiipiiiipiiiikkka..........|........akjiiiiiiiiiiiiiipiiiiiiiiiiikkka.........|......aakjiiiiiiiiiiiiiiipiiiiiiiiiiiikkkaa.......|.....akjiiiiikkkaaaakjiiiiikkkaaaakjiiiikkka......|....akjiiikkkaaa....akjiiikkka....aaakjiikkka.....|...akjkkkkaaa........akjkkkka........aakjkkkka....|..akkkkaaa............akkkka...........aakkkkka...|.akkkaa................aaaa..............akkkkka..|.kkaa.....................................aakkkka.|.aa.........................................aaaa..";
 // ---- void logs: void trees (o.v 'dark': the Shattered Expanse, guild void saplings) give these instead of plain logs ----
 const VL='voidlog';INVK.push(VL);INAME[VL]='Void logs';SN[VL]='Void logs';SHORT[VL]='void logs';SELLP[VL]=30;inv[VL]=inv[VL]|0;
 // the bag lists BAG_ORDER (011) = ... + EXTRA_BAG, which 086 filled with every item known then; later items must add themselves
 {const j=EXTRA_BAG.indexOf('yewlog');if(!EXTRA_BAG.includes(VL))EXTRA_BAG.splice(j>=0?j+1:EXTRA_BAG.length,0,VL)}
 IDESC[VL]='Dark wood that hums faintly, from void trees. A guild spends '+(50000).toLocaleString()+' of them from the guild bank to summon the Void Treant.';
 {const _ic=iconURL;iconURL=function(k,col){if(k!==VL)return _ic(k,col);const key='g207vlog';if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a+1,b+1,w,h)};
   r(1,4,10,5,'#3c2a3c');r(1,4,10,1,'#56404e');r(9,4,2,5,'#a890d0');r(10,5,1,3,'#7a40c8');r(3,6,1,1,'#9a6ae0');r(6,7,1,1,'#9a6ae0');return ICONC[key]=c.toDataURL()}}
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

 // ---- guild bosses (the Void Treant here; 200 adds the Giant Turtle through SQGBOSS.add) ----
 // The arena and the fight are 100's island-boss system (shared online, +60% health per extra fighter, every fighter in the
 // arena when it falls gets the whole reward). Each kind has its own weekly record guilds/<g>/<path> {w,t,by,k} and arena id
 // `<pre><guild id>`, added to SQIB hidden from for..in (111a's Stats table and 111d's monster list only know the five island bosses).
 const WEEK=()=>Math.floor((((window.SQGUILD&&SQGUILD.api)?SQGUILD.api.now():Date.now())-345600000)/604800000);
 const A=()=>window.SQGUILD&&SQGUILD.api,GID=()=>window.SQGUILD&&SQGUILD.id||'';
 const K={},ORDER=[];
 const kindOf=id=>{id=String(id||'');for(const k of ORDER)if(id.indexOf(K[k].pre)===0)return K[k];return null};
 const rec=k=>{const a=A();return a&&a.ready&&SQGUILD.state?SQGUILD.state[K[k].path]||null:null};
 const open=k=>{if(!k){return ORDER.some(x=>open(x))}const r=rec(k);return!!(r&&r.w===WEEK()&&!r.k)};
 const beaten=k=>{const r=rec(k);return!!(r&&r.w===WEEK()&&r.k)};
 function regBoss(k){const B=K[k],id=GID()?B.pre+GID():'';if(!id||!window.SQIB)return'';if(!Object.prototype.hasOwnProperty.call(SQIB,id))Object.defineProperty(SQIB,id,{value:Object.assign({},B.DEF),enumerable:false,configurable:true,writable:true});
  if(typeof DKIND!=='undefined'&&!DKIND['ib_'+id])DKIND['ib_'+id]={name:B.DEF.n,floor:B.DEF.floor,wall:B.DEF.wall,trim:B.DEF.trim,W:30,H:24,floors:1,cavey:1};return id}
 function enter(it){const k=it&&it.bk||'treant',B=K[k];if(!B)return;if(!open(k)){A()&&A().tell('The portal has closed.');return}const id=regBoss(k);if(!id)return;
  say(B.enterMsg||'You step through the portal...');try{sfx('roar')}catch(e){}SQIBENTER(id,it)}
 function summon(k){const a=A(),B=K[k];if(!a||!B||!a.on()||!a.ready)return;if(!a.boss()){a.tell('Only the leader and officers can summon '+B.DEF.n+'.');return}
  if(open(k)){a.tell(B.DEF.n+' is already awake. Its portal is on the guild island.');return}if(beaten(k)){a.tell('Your guild already beat '+B.DEF.n+' this week. It can be summoned again from Monday.');return}
  const bank=SQGUILD.state.bank.i||{},ch=B.pay(bank);if(!ch){a.tell('The guild bank needs '+B.costTxt+' (it has '+B.have(bank).toLocaleString()+').');try{sfx('swish')}catch(e){}return}
  const ex={};ex['guilds/'+GID()+'/'+B.path]={w:WEEK(),t:a.TS(),by:a.me()};
  a.bankUpdate(ch,{w:'boss',k:B.logK,d:B.costTxt},ex).then(()=>{a.tell(B.wakeMsg);msgT=7;try{sfx('roar')}catch(e){}}).catch(a.fail)}
 // when it falls: close its portal for the week (any fighter writes k; the first one wins)
 function kill(k){const a=A(),r=rec(k);if(!a||!a.on()||!r||r.k)return;try{a.DB().set(a.ref('guilds/'+GID()+'/'+K[k].path+'/k'),a.TS()).catch(()=>{})}catch(e){}}
 {const _se=sqEvent;sqEvent=function(type,item){const B=type==='islandboss'&&kindOf(item);if(B){try{kill(B.k);if(window.SQACH&&SQACH.add)SQACH.add('ibw')}catch(e){}return}return _se.apply(this,arguments)}}
 // each boss has a skill that fights it too: every melee hit that lands adds B.bonus() (the Treant: 1 + axe tier + Woodcutting/10)
 {const _a=attack;attack=function(){const S=window.SQIBST,b=S&&S.boss,B=b&&kindOf(b.ib);if(!B||b.dead||!B.bonus)return _a.apply(this,arguments);const h0=b.hp,out=_a.apply(this,arguments);
   try{if(b.hp<h0&&!b.dead){const ex=B.bonus();b.hp-=ex;addXp(B.sk,ex*4);DMGS.push({x:b.x+10,y:b.y-(B.tall||70),v:'+'+ex,t:0,c:B.bcol||'#a8e070',sc:curScene()});
     for(let k=0;k<5;k++)part(b.x+(Math.random()-.5)*20,b.y-30,(Math.random()-.5)*80,-30-Math.random()*50,.5,B.chip[k%2],160,2)}}catch(e){}return out}}
 // pixel sprites from palette rows ('.' = empty), plus an all-white copy for the hit flash
 function mkSprite(TPAL,ROWS){const rows=ROWS.split('|'),h=rows.length,w=Math.max(...rows.map(r=>r.length)),eyes=[];
  const mk=wh=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');rows.forEach((r,y)=>{for(let i=0;i<r.length;i++){const ch=r[i];if(ch==='.')continue;x.fillStyle=wh?'#ffffff':TPAL[ch];x.fillRect(i,y,1,1);if(!wh&&TPAL[ch]==='#ffffff')eyes.push([i,y])}});return c};
  const c=mk(0);return{c,w:mk(1),eyes}}
 {const _art=window.SQIBART;window.SQIBART=function(id,b,tm){const B=kindOf(id);if(B){try{B.draw(b,tm)}catch(e){}return true}return _art?_art.apply(this,arguments):false}}
 // the portals on the guild island (197's applyBuildings adds what this returns)
 function portals(R){const out=[],W=R.w,ok1=(x,y)=>{const i=y*W+x;return x>0&&y>0&&x<W-1&&y<R.h-1&&!R.solid.has(i)&&!rgObjAt(R,x,y)&&RG_WALK[R.tiles[i]]&&R.tiles[i]!==0},
  // the tile below is where you come back out (100's ibEnter), so it must be dry, open ground too
  free=(x,y)=>ok1(x,y)&&ok1(x,y+1)&&!out.some(o=>Math.abs(o.x-x)<2&&Math.abs(o.y-y)<2);
  for(const k of ORDER){if(!open(k))continue;const B=K[k];for(const[x,y]of B.spots(R))if(free(x,y)){out.push({t:'lm',k:'gportal',bk:k,x,y,w:1,h:1,use:'gtreant',name:B.portalName});break}}return out}
 function drawPortal(it,tm){const B=K[it.bk||'treant'];if(B&&B.drawPortal)B.drawPortal(it,tm)}
 const key=()=>ORDER.map(k=>open(k)?1:0).join('');
 // ---- the guild screen's Bosses tab (197) ----
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function card(k){const a=A(),B=K[k],bank=(SQGUILD.state.bank&&SQGUILD.state.bank.i)||{},have=B.have(bank);if(!B.pic)try{B.pic=B.spr().c.toDataURL()}catch(e){B.pic=''}
  let h='<div class="qc"><div style="display:flex;gap:12px;align-items:center"><img alt="" src="'+B.pic+'" style="width:'+B.picW+'px;image-rendering:pixelated;flex:none">'+
   '<div><b>'+esc(B.DEF.n.replace(/^The /,''))+'</b><p style="font-size:13px">'+B.about+'</p></div></div>';
  if(open(k))h+='<p><b style="color:#2a7a50">It\'s awake!</b> '+B.awakeTxt+' It stays until it falls (this week).</p>';
  else if(beaten(k))h+='<p><b>Beaten this week ✓</b> It can be summoned again from Monday.</p>';
  else{h+='<div class="gdgbar"><i style="width:'+Math.min(100,100*have/B.need)+'%;background:'+B.DEF.col+'"></i></div><small>'+have.toLocaleString()+' / '+B.need.toLocaleString()+' '+B.unit+' in the guild bank</small><br>';
   h+=a.boss()?'<button class="qb" data-g="gtb:sum:'+k+'"'+(have<B.need?' disabled style="opacity:.5"':'')+'>Summon it ('+B.costTxt+')</button>':'<p style="font-size:13px">The leader or an officer summons it once the bank has enough.</p>'}
  h+='<p style="font-size:13px"><b>Every fighter, every fight:</b> '+B.rewardTxt+'</p><p style="font-size:12px;opacity:.85">'+B.tip+'</p></div>';return h}
 function html(){return ORDER.map(card).join('')}
 function act(x,y){if(x==='sum')summon(y||'treant')}
 function add(k,B){B.k=k;K[k]=B;if(!ORDER.includes(k))ORDER.push(k)}
 // ---- the Void Treant ----
 const SUM=50000;
 add('treant',{path:'boss',pre:'gt_',logK:VL,need:SUM,unit:'void logs',costTxt:SUM.toLocaleString()+' void logs',have:b=>b[VL]|0,pay:b=>(b[VL]|0)>=SUM?{[VL]:-SUM}:null,
  DEF:{n:'The Void Treant',door:'',lm:'the void portal',hp:6000,col:'#9a5af0',shard:'',sc:['#c8a0ff','#5a3a8a'],
   floor:['#2a2236','#30283e'],wall:'#1c1626',trim:'#0a0810',gold:[1500,2500],loot:[[WV,1],[VL,150],['yewlog',25]],xp:6000,rare:['ptvoid','Void treeling (pet)'],
   atk:[['circles',3.4,{n:6,r:20,delay:1.1,k:'void'}],['fan',2.6,{n:5,spread:.3,sp:95,k:'void'}],['spiral',4.8,{n:14,sp:70,k:'void'}],['ring',6.5,{max:110}],['summon',13,{key:'wolf:void',n:2,cap:3,half:1}]]},
  sk:1,bonus:()=>1+(TL.axe|0)+Math.floor(lvOf(1)/10),chip:['#56404e','#9a6ae0'],
  enterMsg:'You step through the void portal...',portalName:'Void portal',wakeMsg:'The Void Treant awakens! A void portal has opened on the guild island. Everyone who fights it gets a Void wand.',
  about:'An ancient tree swallowed by the void. Once a week the guild can feed it '+SUM.toLocaleString()+' void logs from the guild bank to wake it. A void portal opens on your guild island: go through together.',
  awakeTxt:'The void portal is in the middle of your guild island.',picW:75,
  rewardTxt:'a <b>Void wand</b> (the strongest wand, Magic 50: its void bolts hit harder than any adamant wand and every fourth hit heals you a heart), 1,500-2,500 gold, 150 void logs, 25 yew logs. 5%: a Void treeling (pet).',
  tip:'Chop it! Your axe and Woodcutting level add damage to every melee hit. It gets 60% tougher for each extra fighter. Void logs come from void trees: on the Shattered Expanse, and void saplings planted on your guild island.',
  spots:R=>{const bx=Math.round(R.w/2)-1,by=Math.round(R.h/2)-5;return[[bx+3,by+3],[bx-3,by+3],[bx,by+6],[bx+3,by+6],[bx-3,by+6],[bx,by+8]]},
  spr:()=>K.treant._s||(K.treant._s=mkSprite(TP,TR)),
  draw(b,tm){const S=1.5,sp=K.treant.spr(),c=sp.c,w=c.width*S,h=c.height*S,x=Math.round(b.x),y=Math.round(b.y),pose=window.SQIBPOSE?SQIBPOSE(b):['idle',''],wind=pose[0]==='wind'||pose[0]==='strike',hit=Math.abs(b.kx||0)+Math.abs(b.ky||0)>.3;
   g.fillStyle='rgba(150,90,240,'+(.1+.06*Math.sin(tm*2)+(wind?.14:0))+')';g.beginPath();g.ellipse(x,y-h*.45,w*.62,h*.55,0,0,6.283);g.fill();shd(b.x,b.y+6,Math.min(w*.55,60));
   const sway=Math.round(Math.sin(tm*1.3)),bob=b.mv>0?-Math.round(Math.abs(Math.sin(tm*5))*2):0,left=Math.round(x-w/2+sway),top=Math.round(y+6-h+bob);
   g.save();g.imageSmoothingEnabled=false;g.drawImage(c,left,top,Math.round(w),Math.round(h));if(hit){g.globalAlpha=.55;g.drawImage(sp.w,left,top,Math.round(w),Math.round(h))}g.restore();
   if(wind)for(const[ex,ey]of sp.eyes){g.fillStyle='rgba(220,180,255,'+(.35+.25*Math.sin(tm*18))+')';g.beginPath();g.arc(left+(ex+.5)*S,top+(ey+.5)*S,4,0,6.283);g.fill()}
   for(let k=0;k<7;k++){const q=tm*(wind?3.2:1.1)+k/7*6.283;Rg(Math.round(x+Math.cos(q)*w*.5),Math.round(y-h*.5+Math.sin(q)*12),2,2,k%2?'#c8a0ff':'#7a40c8')}},
  drawPortal(it,tm){const x=it.x*16+8,y=it.y*16+12;shd(x,y+3,14);
   g.fillStyle='#0c0814';g.beginPath();g.ellipse(x,y-10,8,13,0,0,6.283);g.fill();g.fillStyle='rgba(122,64,200,'+(.55+.25*Math.sin(tm*3))+')';g.beginPath();g.ellipse(x,y-10,5,10,0,0,6.283);g.fill();
   g.strokeStyle='#b080f0';g.lineWidth=1.5;g.beginPath();g.ellipse(x,y-10,9,14,0,0,6.283);g.stroke();
   for(let k=0;k<10;k++){const q=tm*2+k/10*6.283;Rg(Math.round(x+Math.cos(q)*11),Math.round(y-10+Math.sin(q)*16),k%3?1:2,k%3?1:2,k%2?'#e8d0ff':'#9a5af0')}
   if(Math.random()<.2)try{part(x+(Math.random()-.5)*10,y-6,(Math.random()-.5)*10,-20-Math.random()*20,.8,'#c8a0ff',-10,1)}catch(e){}}});
 window.SQGBOSS=window.SQGTREANT={add,K,open,beaten,html,act,enter,drawPortal,portals,key,summon,kill,regBoss,WEEK,mkSprite,kindOf,SUM,DEF:K.treant.DEF,drawTreant:(b,tm)=>K.treant.draw(b,tm)};
 // keep the bosses registered, and the portals in step with the week (the database listener covers summons and kills)
 // (stamped on the island's room: a portal that closed while you were in the arena is gone when you come back)
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{if(GID())for(const k of ORDER)regBoss(k);const a=A();if(a&&a.onIsle()){const R=SCENE.room,o=key();if(R._bk!==o){R._bk=o;a.applyBuildings()}}}catch(e){}return out}}
})();
