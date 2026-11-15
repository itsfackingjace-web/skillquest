// ---- 208. The Giant Turtle (a weekly guild fishing boss), Turt fragments and Turtle armor ----
// The second guild boss on 199's SQGBOSS: guilds/<g>/turt {w,t,by,k}, arena id gu_<guild id>, a whirlpool portal by the guild island's
// pier. Summoned with 5,000 raw fish from the guild bank (RAW, cheapest first; the rules check the sum). Every fighter gets one Turt
// fragment (`turtfrag`). Melee hits on it add 1 + Fishing/10 + rod tier. Attacks use 100's `bubble` shots and `water` geysers.
// Turtle armor (eq_thelm/eq_tbody/eq_tlegs, anvil 1/2/2 fragments, Smithing 75/80/78, Defence 50) is held as armor tier 5 (ARM=5,
// like the Outlaw's hat / Flame crown) with `TT` flags (saved as `tta`): +3% block a piece, 2 pieces +5%, 3 pieces +5% more and
// blockCap +5%. Its look recolours 084's plate pieces (gearCH `ttk` bits → kitLook).
(()=>{
const TTP={"a": "#0c1418", "b": "#2c5a46", "c": "#16302a", "d": "#3c7658", "e": "#8cc890", "f": "#5a9a6c", "g": "#d8d4c4", "h": "#a8a494", "i": "#9a8848", "j": "#6a5a32", "k": "#3a2a14", "l": "#c4b070", "m": "#101010", "n": "#ffffff", "o": "#e0d098"},TTR=".......................aaaaaaaaaaaaaa.......................|....................aaabccbbbbbbbbbccaaa....................|..................aabbbbbbcccccccccbbbbbaa..................|.................abbbbddeceeeeffffdcddbbbba.................|...............aabbbddeeceeeeeeeffffcfddbbbaa...............|..............accccddeeeceeeeeeeefffcffdddccca..............|.............acbbddccccceeeeeeeeeffffccccghbbba.............|............abcbddffffeeceeeeeeeffffcfffffgdbbca............|...........abcbddfffffffceeeeeffffffcffffffddbbca...........|...........abcdddffffffffcfffffffffcfffffffdddbca...........|..........abcbddffffffffffcccccccccfffffffffddbbca..........|..........abbdddfffffffffcfffffffffcffffffffdddbba..........|..........abbdddffffffffcfffffffffffcfffffffdddbba..........|.........abbddddffffffffcfffffffffffcfffffffddddbba.........|.........abbdcccccccccccfffffffffffffcccccccccccbba.........|.........abbdddddfffffffcfffffffffffcffffffdddddbba.........|........aibbdddddfffffffcfffffffffffcffffffdgdddbbia........|.......aiibbddddddfffffffcfffffffffcffffffddddddbbiia.......|.......aiibbdddddddffffffcfffffffffcfffffdddddddbbija.......|......aiiijbbddddddddfffffcccccccccffffddddddddbcijiia......|.....aiiijibbddddddggdffcccfffffffcccfdddddddddbcjiiiia.....|....aiiijiibcbddddddhddcddcfffffffcddcddddddddbbbiiiijia....|....aiijiiiicbddddddddcdddcdddddddcdddcdddddddbbiiiijiia....|...aiijiiiijbbbdddddccdddcdddddddddcdddccddddbbbiiijiiiia...|..aiijiiiijiabbbcddcdddddcdddddddddcdddddcddcbbaiijiiiijia..|..aijiiiijaa.abbcbdddddddcdddddddddcddddddbbcba.aaiiiijiia..|.aijiiiija....abbbbddddddcdddddddddcddddcbbbba....aiijiiiia.|.ajiiiija...aaaaabbbcbddddddddddddddddbbcbbaaaaa...ajiiiija.|aiiiiiia...aiiiiiibbcbbbcdddcdddcddbcbbbbbiiiiiia...aiiiiiia|iiiiiia...aiiiiiiiiabbbbcbbbcbbbcbbbcbbbaiiiiiiiia...aiiiiii|iiiiia...aiiiiiiiiiiaaabbbkkljlllkkbbaaaiiiiiiiiiia...aiiiii|iiiia....aiiiiiiiiiia..aikllllljllika..aiiiiiiiiiia....aiiii|iiia......aiiiiiiiia...ailmnlllllnmia...aiiiiiiiia......aiii|iia........aiiiiiia....ailmmlllllmmia....aiiiiiia........aii|ia..........aaaaaa.....aillllllllllia.....aaaaaa..........ai|a......................aiijooooooljia......................a|.......................aiiooooooooiia.......................|........................aikooooooika........................|.........................akkkkkkkkka........................|..........................aaaakaaaa.........................|..............................a.............................";
 const FR='turtfrag',FI=SKN.indexOf('Fishing');
 // ---- Turt fragments ----
 INVK.push(FR);EXTRA_BAG.push(FR);INAME[FR]='Turt fragment';SN[FR]='Turt fragments';SHORT[FR]='turt fragment';SELLP[FR]=2500;inv[FR]=inv[FR]|0;
 IDESC[FR]='A piece of the Giant Turtle\'s shell, harder than adamant. Smith Turtle armor from it at an anvil: helm 1, legs 2, chestplate 2.';
 {const _ic=iconURL;iconURL=function(k,col){if(k!==FR)return _ic(k,col);const key='g208frag';if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
   r(4,1,6,1,'#0c1418');r(2,2,10,1,'#0c1418');r(1,3,12,8,'#0c1418');r(2,11,10,1,'#0c1418');r(4,12,6,1,'#0c1418');
   r(4,2,6,1,'#5a9a6c');r(2,3,10,8,'#3c7658');r(3,11,8,1,'#2c5a46');r(3,3,5,3,'#8cc890');r(4,4,2,1,'#c8f0c8');
   r(5,6,4,1,'#16302a');r(4,7,1,2,'#16302a');r(9,7,1,2,'#16302a');r(5,9,4,1,'#16302a');r(10,9,1,1,'#e0d098');return ICONC[key]=c.toDataURL()}}
 // ---- Turtle armor: adamant defence (armor tier 5) plus block per piece and a set bonus; Defence 50 ----
 const KEY={helm:'eq_thelm',body:'eq_tbody',legs:'eq_tlegs'},NM={helm:'Turtle helm',body:'Turtle chestplate',legs:'Turtle legs'},TT={helm:false,body:false,legs:false},DEF=50;
 const TCOL='#2c7a62',TLIT='#e0c878';
 for(const s in KEY){const k=KEY[s],e={slot:s,arm:5,n:NM[s],ic:s,col:TCOL,v:{helm:9000,body:18000,legs:14000}[s],tt:1};EQ[k]=e;EQK.push(k);INVK.push(k);EXTRA_BAG.push(k);INAME[k]=e.n;SELLP[k]=Math.round(e.v/2);SN[k]=e.n;SHORT[k]=e.n.toLowerCase();inv[k]=inv[k]|0;
  IDESC[k]=NM[s]+', smithed from the Giant Turtle\'s shell: adamant defence +3% block. Shell set: two pieces +5% block, all three another +5% and a higher block limit. Needs Defence '+DEF+'.'}
 SM.push({k:KEY.helm,n:'Turtle helm',c:{[FR]:1},lv:75,xp:900,def:DEF},{k:KEY.legs,n:'Turtle legs',c:{[FR]:2},lv:78,xp:1500,def:DEF},{k:KEY.body,n:'Turtle chestplate',c:{[FR]:2},lv:80,xp:1700,def:DEF});
 const worn=()=>(TT.helm?1:0)+(TT.body?1:0)+(TT.legs?1:0);
 {const _occ=occ;occ=function(slot){if(TT[slot]&&ARM[slot]===5)return KEY[slot];return _occ.apply(this,arguments)}}
 {const _ss=setSlot;setSlot=function(slot,k){const out=_ss.apply(this,arguments);if(slot in TT)TT[slot]=!!k&&k===KEY[slot];return out}}
 {const _eq=equipItem;equipItem=function(k){const e=EQ[k];if(e&&e.tt&&lvOf(8)<DEF){say('You need Defence '+DEF+' to wear the '+e.n.toLowerCase()+'.');try{sfx('swish')}catch(x){}return}return _eq.apply(this,arguments)}}
 {const _wu=watchUpgrades;watchUpgrades=function(){const was={...TT};const out=_wu.apply(this,arguments);for(const s in TT)if(was[s]&&ARM[s]!==5){if((inv['eq_'+s+'5']|0)>0)inv['eq_'+s+'5']--;inv[KEY[s]]=(inv[KEY[s]]|0)+1;TT[s]=false}return out}}
 {const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);const t=(TT.helm?'h':'')+(TT.body?'b':'')+(TT.legs?'l':'');if(t)s.tta=t;return s}}
 {const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);const t=String(S&&S.tta||'');TT.helm=t.includes('h')&&ARM.helm===5;TT.body=t.includes('b')&&ARM.body===5;TT.legs=t.includes('l')&&ARM.legs===5;try{snapEq()}catch(e){}return out}}
 {const _ng=newGame;newGame=function(){TT.helm=TT.body=TT.legs=false;return _ng.apply(this,arguments)}}
 try{KNOWN49.add('tta')}catch(e){}
 {const _bb=blockBonus;blockBonus=function(){const n=worn();return _bb.apply(this,arguments)+n*.03+(n>=2?.05:0)+(n>=3?.05:0)}}
 {const _bc=blockCap;blockCap=function(){return _bc.apply(this,arguments)+(worn()>=3?.05:0)}}
 // the look: the plate pieces in shell green with a sand trim
 {const _gc=gearCH;gearCH=function(){const c=_gc.apply(this,arguments);const b=(TT.helm&&ARM.helm===5?1:0)|(TT.body&&ARM.body===5?2:0)|(TT.legs&&ARM.legs===5?4:0);if(b)c.ttk=b;return c}}
 {const _kl=kitLook;kitLook=function(ch){const o=_kl.apply(this,arguments);const b=ch&&ch.ttk|0;if(!b)return o;
   if(b&2&&o.body==='plate'){o.bc=TCOL;o.ba=TLIT}if(b&4&&o.legs==='greaves'){o.lc=TCOL;o.la=TLIT}if(b&1&&o.head==='helm'){o.hc=TCOL;o.ha=TLIT}return o};if(typeof KITC!=='undefined')KITC.clear()}

 // ---- the Giant Turtle (guild fishing boss, 199's SQGBOSS) ----
 const RAW=['shrimp','trout','salmon','swordfish','rainbow','pike','gcarp','eeel','lsnap','icod','gchar','vray','cangl'],NEED=5000;
 const cheap=()=>RAW.slice().sort((a,b)=>(SELLP[a]||0)-(SELLP[b]||0));
 const have=b=>RAW.reduce((n,k)=>n+(b[k]|0),0);
 let SPR=null;const spr=()=>SPR||(SPR=SQGBOSS.mkSprite(TTP,TTR));
 SQGBOSS.add('turtle',{path:'turt',pre:'gu_',logK:'fish',need:NEED,unit:'raw fish',costTxt:NEED.toLocaleString()+' raw fish',have,
  pay:b=>{if(have(b)<NEED)return null;let left=NEED;const ch={};for(const k of cheap()){const t=Math.min(left,b[k]|0);if(t>0){ch[k]=-t;left-=t}if(!left)break}return left?null:ch},
  DEF:{n:'The Giant Turtle',door:'',lm:'the whirlpool',hp:7000,col:'#3c9a78',shard:'',sc:['#a8f0d0','#2c6a58'],
   floor:['#2a4a52','#30525a'],wall:'#1a3038',trim:'#0a1418',gold:[1500,2500],loot:[[FR,1],['swordfish',25]],xp:6000,rare:[FR,'an extra Turt fragment'],
   atk:[['fan',2.4,{n:5,spread:.3,sp:90,k:'bubble'}],['circles',3.8,{n:6,r:20,delay:1.1,k:'water'}],['charge',5.2,{}],['ring',6.6,{max:120}],['summon',12,{key:'crab',n:3,cap:4,half:1}]]},
  sk:FI,bonus:()=>1+Math.floor(lvOf(FI)/10)+(TL.rod|0),chip:['#2c5a46','#a8f0d0'],bcol:'#80d8ff',tall:60,
  enterMsg:'You dive into the whirlpool...',portalName:'Whirlpool',wakeMsg:'The Giant Turtle stirs! A whirlpool has opened by your guild island\'s pier. Everyone who fights it gets a Turt fragment.',
  about:'An ancient sea turtle the size of a house. Once a week the guild can lure it with '+NEED.toLocaleString()+' raw fish from the guild bank (any kinds, the cheapest are used first). A whirlpool opens by your guild island\'s pier: dive in together.',
  awakeTxt:'The whirlpool is by your guild island\'s pier.',picW:90,
  rewardTxt:'a <b>Turt fragment</b> (smith Turtle armor at an anvil: helm 1, legs 2, chestplate 2; the best armor there is, Defence 50), 1,500-2,500 gold, 25 swordfish. 5%: an extra Turt fragment.',
  tip:'Your Fishing level and fishing rod add damage to every melee hit. Watch for its shell charge (the red line) and the geysers. It gets 60% tougher for each extra fighter.',
  spots:R=>{const L=[];for(const[px,py]of R.pier||[])for(let r=1;r<=4;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(Math.max(Math.abs(dx),Math.abs(dy))===r)L.push([px+dx,py+dy]);
   const bx=Math.round(R.w/2)-1,by=Math.round(R.h/2)-5;return L.concat([[bx+5,by+6],[bx-5,by+6],[bx,by+9]])},
  spr,
  draw(b,tm){const S=1.5,sp=spr(),c=sp.c,w=c.width*S,h=c.height*S,x=Math.round(b.x),y=Math.round(b.y),pose=window.SQIBPOSE?SQIBPOSE(b):['idle',''],wind=pose[0]==='wind'||pose[0]==='strike',hit=Math.abs(b.kx||0)+Math.abs(b.ky||0)>.3;
   const spin=b.act&&b.act.k==='charge'&&b.act.t>b.act.d;
   shd(b.x,b.y+6,Math.min(w*.55,60));if(wind){g.fillStyle='rgba(120,210,255,'+(.12+.1*Math.sin(tm*10))+')';g.beginPath();g.ellipse(x,y-h*.4,w*.6,h*.5,0,0,6.283);g.fill()}
   const bob=b.mv>0?-Math.round(Math.abs(Math.sin(tm*3))*2):Math.round(Math.sin(tm*1.2)),jit=spin?Math.round(Math.sin(tm*60)*2):0,left=Math.round(x-w/2+jit),top=Math.round(y+6-h+bob);
   g.save();g.imageSmoothingEnabled=false;g.drawImage(c,left,top,Math.round(w),Math.round(h));if(hit){g.globalAlpha=.55;g.drawImage(sp.w,left,top,Math.round(w),Math.round(h))}g.restore();
   if(spin)for(let k=0;k<4;k++)try{part(b.x+(Math.random()-.5)*w*.8,b.y+4,(Math.random()-.5)*60,-20-Math.random()*30,.4,k%2?'#c8b878':'#e8e0c0',120,2)}catch(e){}
   if(wind)for(let k=0;k<5;k++){const ph=(tm*1.5+k/5)%1;Rg(Math.round(x-12+k*6),Math.round(top+h*.9-ph*30),2,2,'rgba(220,245,255,'+(1-ph)+')')}},
  drawPortal(it,tm){const x=it.x*16+8,y=it.y*16+10;
   for(let r=4;r>=0;r--){const a=tm*2.4+r*.9;g.strokeStyle=r%2?'#58b0e8':'#c8f0ff';g.lineWidth=1.5;g.beginPath();g.ellipse(x,y,4+r*2.6,2.4+r*1.5,0,a,a+4.4);g.stroke()}
   g.fillStyle='#0c2a3a';g.beginPath();g.ellipse(x,y,3,1.8,0,0,6.283);g.fill();
   if(Math.random()<.15)try{part(x+(Math.random()-.5)*20,y,(Math.random()-.5)*10,-15-Math.random()*15,.6,'#e8f8ff',40,1)}catch(e){}}});
 window.SQTURT={KEY,TT,worn,FR,RAW,have};
})();
