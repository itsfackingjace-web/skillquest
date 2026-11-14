// ---------------------------------------------------------------- 92. Ashfall's forge camp and Cinderdeep; the Stone Sledgehammer and boulders; treelings; fixes
// - Moss slimes are green (they were blue slimes with a moss hat, which read as blue, most of all in Thornroot Hollow).
// - Thornbrook's lodge and inn (and Emberwatch's forge and hall) can be entered: walk up to the door.
// - Treelings: one for every kind of tree (oak, willow, maple, yew, pine, void and dead), 1 in 5,000 from that tree.
// - The purple-leaved trees of the Shattered Expanse are Void Trees.
// - The Stone Sledgehammer (rare from the Stone Giant) is a main-hand weapon. With it in hand your ultimate is a Ground
//   Slam, and you can break boulders (35-50 stone) and ore boulders (lots of ore) found on every island and in caves.
// - Ashfall: the forge camp of Emberwatch on the old town site (Forgemaster Brann's shop, Warden Kesh and Old Pell give
//   the quests), and Cinderdeep: six floors of lava and ash ending at the Emberlord (rare: the Ember ring).
// - Quest progress counts on the right island (killing briar wolves on Briarwood now counts toward Wren's quest).
{
const h92=(a,b)=>{const v=Math.sin(a*12.9898+b*78.233+4.1)*43758.5453;return v-Math.floor(v)};
const K='#181018';
// ======== quests count on the island you're on (and in its caves) ========
SQ_REGION.briarwood='briarwood';
const effRegion=()=>{const R=SCENE&&SCENE.room;if(R&&R.region)return R.region;const pr=SCENE&&SCENE.prev&&SCENE.prev.room;return pr&&pr.region||'hollow'};
sqEvent=function(type,item,test){const r=effRegion();return _sqe49(type,item,t=>(SQ_REGION[t]||'hollow')===r&&(!test||test(t)))};

// ======== green moss slimes ========
let HDMS=null;
function hdMoss(f){if(!HDMS){HDMS=[];for(const fr of[0,1]){const ht=fr?20:23,b=hdBuf(34,26),cy=25,pal=hdP(['#1e4a1c','#2e6e2a','#48923a','#6cb850','#a8dc78']);
  hdSph(b,17,cy,fr?16.5:15.5,ht,pal,{cut:24,id:1,b:.06,fn:(v,x,y,nx,ny)=>v+(ny>.55?-.25:0)+(nx>.6&&ny>.1?.3:0)+(hdH(x>>1,y>>1)<.08?-.3:0)});
  for(const[a,c2]of[[9,cy-ht+6],[10,cy-ht+5],[11,cy-ht+5],[12,cy-ht+5]])hdSet(b,a,c2,hdC('#e8ffd0'));hdOutline(b,{1:hdC('#0e2410')});HDMS[fr]=hdCan(b)}}return HDMS[f]}
{const _sl=SLIMEHD;SLIMEHD=(n,tm)=>{if(n.rv!=='moss'||Math.abs(n.kx)+Math.abs(n.ky)>.8)return _sl(n,tm);const x=Math.round(n.x),y=Math.round(n.y),f=Math.floor(tm*3+n.x)%2;shd(x,y+5,15);
  const sp=hdMoss(f),w=sp.width/2,hh=sp.height/2,top=Math.round(y+6-hh);g.drawImage(sp,Math.round(x-w/2),top,w,hh);
  const e=top+Math.max(3,Math.round(hh*.32)),d=P.x>n.x?1:0;for(const ex of[x-5,x+2]){Rg(ex,e,3,4,'#ffffff');Rg(ex+d,e+1,2,3,'#10200c');Rg(ex+d,e+1,1,1,'#ffffff')}}}

// ======== rooms you can walk into from an island ========
const mkRoom=(R)=>{R.solid=new Set();for(const it of R.items)if(it.solid)for(let dy=0;dy<(it.sh||1);dy++)for(let dx=0;dx<(it.w||1);dx++)R.solid.add((it.y+dy)*R.w+it.x+dx);return R};
ROOMS.bwlodge=mkRoom({w:9,h:7,ex:4,floor:['#b89868','#ac8c5c'],wall:'#e4d4b4',trim:'#3e7a3a',items:[{t:'rack',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'shelf',x:6,y:0,w:3,use:'look',name:'Trail maps',text:'Ranger maps of Briarwood, covered in notes: "Wolves den north of Thornwater. Thornroot Hollow: south-west. Do NOT go alone."'},
 {t:'table',x:1,y:3,w:2,solid:1},{t:'bed',x:7,y:2,sh:2,solid:1},{t:'barrel',x:0,y:5,solid:1},{t:'plant',x:8,y:5,solid:1},{t:'rug',x:3,y:5,w:3}]});
ROOMS.bwinn=mkRoom({w:11,h:8,ex:5,floor:['#c8a070','#bc9464'],wall:'#ecdcbc',trim:'#7a4a2a',items:[{t:'shelf',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'window',x:7,y:0},{t:'counter',x:0,y:3,w:4,solid:1,use:'look',name:'The Sleepy Fern',text:'A note on the counter: "Beds upstairs are full. The one by the window is free - help yourself."'},
 {t:'barrel',x:0,y:2,solid:1},{t:'table',x:6,y:3,w:2,solid:1},{t:'table',x:2,y:6,w:2,solid:1},{t:'bed',x:10,y:2,sh:2,solid:1,use:'bwrest'},{t:'bed',x:8,y:5,sh:2,solid:1,use:'bwrest'},{t:'plant',x:10,y:6,solid:1},{t:'rug',x:4,y:6,w:3}]});
ROOMS.afforge=mkRoom({w:10,h:7,ex:5,floor:['#6a5a50','#625248'],wall:'#8a7464',trim:'#3a2420',items:[{t:'rack',x:0,y:0,w:3},{t:'window',x:4,y:0},{t:'rack',x:6,y:0,w:3},{t:'furnace',x:8,y:2,solid:1},{t:'furnace',x:9,y:2,solid:1},
 {t:'anvil',x:6,y:4,solid:1,use:'look',name:'Brann\'s anvil',text:'Forgemaster Brann\'s anvil. It rings like a bell. Brann is out front if you want to trade.'},{t:'counter',x:1,y:3,w:3,solid:1},{t:'barrel',x:0,y:5,solid:1},{t:'barrel',x:9,y:5,solid:1},{t:'rug',x:3,y:5,w:3}]});
ROOMS.afhall=mkRoom({w:9,h:7,ex:4,floor:['#7a6656','#705c4c'],wall:'#a08c78',trim:'#a83818',items:[{t:'window',x:2,y:0},{t:'shelf',x:4,y:0,w:3,use:'look',name:'The camp ledger',text:'The warden\'s ledger: "Cinderdeep - north-east. The Emberlord woke again. Two more smiths hurt. Need someone brave."'},{t:'window',x:7,y:0},
 {t:'table',x:3,y:3,w:3,solid:1},{t:'bed',x:0,y:2,sh:2,solid:1},{t:'bed',x:8,y:2,sh:2,solid:1},{t:'barrel',x:0,y:5,solid:1},{t:'plant',x:8,y:5,solid:1},{t:'rug',x:3,y:5,w:3}]});
const ROOMMSG={bwlodge:'The Ranger Lodge. Maps and bows line the walls.',bwinn:'The Sleepy Fern. A bed here heals you up.',afforge:'Emberwatch Forge. The heat hits you like a wall.',afhall:'The Warden\'s Hall. It smells of smoke and old maps.'};
{const _uf=useFurn;useFurn=function(it){if(it&&it.use==='bwrest'){if(P.hp>=6&&hunger>40){say('You\'re already well rested.');return}P.hp=6;hunger=Math.max(hunger,60);say('You rest a while in a soft bed. Fully healed!');try{sfx('quest')}catch(e){}saveLocal(true);return}
  if(it&&it.use==='look'&&SCENE&&ROOMMSG[SCENE.id]){rgLook(it);return}return _uf(it)}}
// doors: walk up into one (the same as a house)
function vDoors(R){if(!R._doors)R._doors=R.items.filter(it=>it.room&&it.b);return R._doors}
{const _u=upd;upd=function(dt){_u(dt);if(menuOpen||pnOpen||dead||TRAVEL49)return;const R=SCENE&&SCENE.room;if(!R||!R.region||face[1]>=0||(window.SQRSAIL&&SQRSAIL.on))return;
  for(const it of vDoors(R)){const b=it.b,cx=(b.tx+(b.w>>1))*16+8;if(Math.abs(P.x-cx)<9&&P.y<(b.ty+2)*16+6&&P.y>(b.ty+1)*16-4){enterScene(it.room,null,{x:cx,y:(b.ty+2)*16+8});if(ROOMMSG[it.room])say(ROOMMSG[it.room]);return}}}}
{const _lr=loadRegion;loadRegion=function(id,want,ret){const ok=_lr(id,want,ret);try{const R=SCENE&&SCENE.room;if(ok&&R&&R.region==='briarwood'&&!R._bwd){R._bwd=1;R._doors=null;for(const it of R.items)if(it.t==='bwbld'&&it.b)it.room=/Inn|Fern/.test(it.b.name)?'bwinn':'bwlodge'}}catch(e){console.warn(e)}return ok}}

// ======== treelings: one for each kind of tree ========
const TLV={ptree:{n:'Treeling',src:'trees (1 in 5,000)'},ptoak:{n:'Oak treeling',src:'oak trees (1 in 5,000)'},ptwil:{n:'Willow treeling',src:'willow trees (1 in 5,000)'},ptmap:{n:'Maple treeling',src:'maple trees (1 in 5,000)'},
 ptyew:{n:'Yew treeling',src:'yew trees (1 in 5,000)'},ptpine:{n:'Pine treeling',src:'pine trees (1 in 5,000)'},ptvoid:{n:'Void treeling',src:'Void Trees on the Shattered Expanse (1 in 5,000)'},ptdead:{n:'Deadwood treeling',src:'dead trees on Ashfall (1 in 5,000)'}};
for(const k in TLV){window.SQNPET[k]={n:TLV[k].n,src:'chopping '+TLV[k].src};if(window.LUX&&LUX.PETS&&!LUX.PETS.some(p=>p.k===k))LUX.PETS.push({k,n:TLV[k].n,v:0,rare:1,c:['#888','#666','#aaa']})}
window.SQTREEPET=(t,v)=>v==='dark'?'ptvoid':v==='dead'?'ptdead':t==='oak'?'ptoak':t==='willow'?'ptwil':t==='maple'?'ptmap':t==='yew'?'ptyew':t==='pine'?'ptpine':'ptree';
// leaves, dark leaves, light leaves, shadow; bark, bark shadow
const TLP={ptree:['#3c9030','#2c6e24','#6cc850','#5cb844','#9a6434','#7a4c24'],ptoak:['#3c8a34','#1c4a1c','#58a848','#2e6e2a','#7a4a24','#5a3418'],ptwil:['#b4d058','#6a8a28','#d8ec88','#98b840','#a89058','#7a6838'],
 ptmap:['#d0582a','#78281a','#f08a40','#a83a20','#8a4a28','#643018'],ptyew:['#2c6a50','#12302a','#3e8a68','#1e4a3a','#5a3a20','#3e2614'],ptpine:['#24603e','#123a24','#3a8456','#1e5034','#7a5030','#5a3418'],
 ptvoid:['#7a50b0','#3a2460','#b080f0','#5a3a8a','#4e3e5a','#342a40'],ptdead:['#6a5a50','#3a302c','#8a7a6e','#4e4440','#6a5a50','#3a302c']};
const TLC={};
function treelingSprite(k,f){const key=k+f;if(TLC[key])return TLC[key];const c=document.createElement('canvas');c.width=16;c.height=20;const x=c.getContext('2d'),r=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h)},[L,Ld,Ll,Lm,B,Bd]=TLP[k]||TLP.ptree;
 if(k==='ptpine'){for(let j=0;j<9;j++){const hw=1+Math.round(j*.75);r(8-hw-1,j,hw*2+2,1,K)}for(let j=0;j<9;j++){const hw=Math.round(j*.75);r(8-hw,j,hw*2,1,j%3===2?Ld:L);if(hw>1)r(8-hw,j,1,1,Ll)}r(2,8,12,1,K)}
 else if(k==='ptdead'){for(const[a,b,w,h]of[[7,1,2,8],[3,3,5,1],[3,1,1,3],[9,4,5,1],[13,2,1,3],[5,6,3,1],[10,6,2,1]]){r(a-1,b-1,w+2,h+2,K)}for(const[a,b,w,h]of[[7,1,2,8],[3,3,5,1],[3,1,1,3],[9,4,5,1],[13,2,1,3],[5,6,3,1],[10,6,2,1]])r(a,b,w,h,L)}
 else{r(3,0,10,1,K);r(2,1,12,1,K);r(1,2,14,6,K);r(2,8,12,1,K);r(3,1,10,1,Ll);r(2,2,12,5,L);r(3,2,5,2,Ll);r(9,3,3,1,Lm);r(2,7,12,1,Ld);r(5,5,2,1,Ld);r(10,6,2,1,Ld);
  if(k==='ptoak'){r(4,6,1,1,'#c08040');r(11,4,1,1,'#c08040');r(7,3,1,1,'#c08040')}
  if(k==='ptwil'){for(const a of[2,4,11,13]){r(a,8,1,f?3:2,K);r(a,8,1,f?2:1,Lm)}}
  if(k==='ptmap'){r(6,1,1,1,'#f8c060');r(12,5,1,1,'#f8c060')}
  if(k==='ptvoid'){r(4,3,1,1,'#e8c8ff');r(10,2,1,1,'#e8c8ff');r(12,6,1,1,'#e8c8ff')}}
 r(4,9,8,7,K);r(5,9,6,7,B);r(5,9,6,1,Bd);r(10,10,1,6,Bd);const eye=k==='ptvoid'?'#e0b0ff':k==='ptdead'?'#f8a040':K;r(6,11,1,2,eye);r(9,11,1,2,eye);r(7,14,2,1,Bd);
 r(2,10,3,1,K);r(2,9,1,1,K);r(11,10,3,1,K);r(13,9,1,1,K);r(1,9,1,1,L);r(14,9,1,1,L);
 if(f){r(4,16,3,2,K);r(5,16,1,1,Bd);r(9,16,3,3,K);r(10,16,1,2,Bd)}else{r(4,16,3,3,K);r(5,16,1,2,Bd);r(9,16,3,2,K);r(10,16,1,1,Bd)}
 return TLC[key]=c}
{window.SQDRAWTL=function(k,s,tm){if(!TLV[k])return false;const x=Math.round(s.x),y=Math.round(s.y),mv=s.mv>0,sp=treelingSprite(k,mv?Math.floor(s.t)%2:0),bob=mv?(Math.floor(s.t)%2):0;shd(x,y+6,10);
  if(k==='ptvoid'){g.fillStyle='rgba(170,110,240,'+(.14+.08*Math.sin(tm*3))+')';g.beginPath();g.arc(x,y-4,12,0,6.283);g.fill()}
  g.save();g.imageSmoothingEnabled=false;if(s.fl){g.translate(x*2,0);g.scale(-1,1)}g.drawImage(sp,x-8,y-13-bob);g.restore();return true}}

// ======== Void Trees ========
// the purple-leaved trees of the Shattered Expanse: their name floats up when you chop one
{const _a=attack;attack=function(){let vt=null;try{const R=SCENE&&SCENE.room;if(R&&R.region&&!dead&&!menuOpen&&!pnOpen&&!BUILD&&swing<=0){const[fx,fy]=front(13),it=rgObjAt(R,Math.floor(fx/16),Math.floor(fy/16));if(it&&it.o.v==='dark'&&SKOF[it.o.t]===1)vt=it}}catch(e){}
  _a();if(vt&&(swing>0)){const now=performance.now();if(!vt._vtn||now-vt._vtn>2500){vt._vtn=now;try{gTxt(vt.x*16+8,vt.y*16-34,'Void Tree','#c8a0ff')}catch(e){}}}}}

// ======== the Stone Sledgehammer ========
var SLEDGE=false;const SLAM={cd:0,t:0,x:0,y:0,R:84};window.SQSLAM=SLAM;
{const k='eq_sledge',e={slot:'main',kind:'sword',tier:3,n:'Stone sledgehammer',ic:'sword',col:'#a8a090',v:2500};EQ[k]=e;EQK.push(k);INVK.push(k);EXTRA_BAG.push(k);INAME[k]=e.n;SELLP[k]=e.v;SN[k]=e.n+'s';SHORT[k]=e.n.toLowerCase();
 IDESC[k]='A rare hammer of living stone from the Stone Giant. Wield it in your main hand: it hits like an iron sword, your ultimate becomes a GROUND SLAM (big damage all around you, no wand needed, 18s cooldown), and it breaks boulders and ore boulders.';inv[k]=inv[k]|0}
{const _occ=occ;occ=function(slot){if(slot==='main'&&SLEDGE)return'eq_sledge';return _occ(slot)}}
{const _ss=setSlot;setSlot=function(slot,k){_ss(slot,k);if(slot==='main'){SLEDGE=k==='eq_sledge';if(SLEDGE)TL.sword=3}}}
{const _wu=watchUpgrades;watchUpgrades=function(){const was=SLEDGE;_wu();if(was&&TL.sword!==3){if((inv.eq_sword3|0)>0)inv.eq_sword3--;inv.eq_sledge=(inv.eq_sledge|0)+1;SLEDGE=false}}}
{const _sn=snap;snap=function(){const s=_sn();if(SLEDGE)s.sld=1;return s}}
{const _ap=applySave;applySave=function(S){_ap(S);SLEDGE=!!(S&&S.sld)&&TL.sword===3}}
{const _ng=newGame;newGame=function(){SLEDGE=false;_ng()}}
try{KNOWN49.add('sld');KNOWN49.add('emd')}catch(e){}
// its icon: a stone head on a wooden haft
{let IC=null;const pic=()=>{if(IC)return IC;const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
  for(let i=0;i<9;i++){r(3+i,12-i,2,2,'#302010')}for(let i=0;i<8;i++)r(4+i,11-i,1,1,'#a87038');r(5,1,8,6,'#302010');r(6,2,6,4,'#9a9284');r(6,2,6,1,'#c8c0b0');r(6,5,6,1,'#6a645c');r(8,3,1,1,'#5a8a3a');r(10,4,1,1,'#6a645c');return IC=c.toDataURL()};
 const _ic=iconURL;iconURL=function(k,col){if(k==='eq_sledge')return pic();return _ic(k,col)};if(typeof eqIcon==='function'){const _ei=eqIcon;eqIcon=function(k){return k==='eq_sledge'?pic():_ei(k)}}}
// swinging it: a stone hammer instead of a blade
{const _pp=pP;pP=function(tm){if(!SLEDGE||!(swing>0)||dead||(window.SQDF&&SQDF.on))return _pp(tm);const sw=swing;swing=0;try{_pp(tm)}finally{swing=sw}
  if(hurt>0&&Math.floor(tm*20)%2)return;const fx=face[0],fy=face[1],a=Math.atan2(fy,fx),pr=1-swing/.25,an=a+(pr-.5)*2.2,hx=Math.round(P.x+fx*4),hy=Math.round(P.y-4+fy*4);
  for(let i=2;i<=11;i++)Rg(hx+Math.cos(an)*i-1,hy+Math.sin(an)*i-1,3,3,K);for(let i=2;i<=11;i++)Rg(hx+Math.cos(an)*i,hy+Math.sin(an)*i,1,1,'#a87038');
  const ex=Math.round(hx+Math.cos(an)*13),ey=Math.round(hy+Math.sin(an)*13);Rg(ex-5,ey-4,10,8,K);Rg(ex-4,ey-3,8,6,'#9a9284');Rg(ex-4,ey-3,8,1,'#c8c0b0');Rg(ex-4,ey+2,8,1,'#6a645c');Rg(ex-1,ey-1,2,1,'#5a8a3a')}}
// GROUND SLAM (the ultimate while you hold it)
function slamDmg(){return 12+Math.floor(lvOf(0)/3)+Math.floor(lvOf(2)/10)+(typeof meleeBonus==='function'?meleeBonus():0)}
{const _cu=castUlt;castUlt=function(){if(!SLEDGE)return _cu();if(dead||menuOpen||pnOpen||BUILD)return;
  if(SCENE&&!SCENE.room.cave){say('Not indoors!');return}if(typeof SAILING!=='undefined'&&SAILING||window.SQRSAIL&&SQRSAIL.on){say('Not while sailing!');return}
  if(SLAM.cd>0){say('Ground Slam is recharging ('+Math.ceil(SLAM.cd)+'s).');try{sfx('nomana')}catch(e){}return}
  SLAM.cd=18;SLAM.t=.55;SLAM.x=P.x;SLAM.y=P.y+4;const dmg=slamDmg();let n0=0;
  for(const n of en){if(n.dead||n._pet)continue;const big=n.big||n.type==='boss'||n.type==='bonelord',dx=n.x-P.x,dy=n.y-P.y,d=Math.hypot(dx,dy)||1;if(d>SLAM.R+(big?20:0))continue;
   n0++;const k=d<34?1.4:1;hitE(n,Math.round(dmg*k),'#e8c890','slam');if(!big){n.kx=dx/d*3.2;n.ky=dy/d*3.2}}
  if(n0)addXp(0,n0*20);say(n0?'GROUND SLAM! '+n0+' hit.':'GROUND SLAM!');try{sfx('mine');setTimeout(()=>sfx('mine'),70);if(typeof rumble==='function')rumble(350,1,.7)}catch(e){}
  if(typeof FLASH!=='undefined')FLASH=.12;for(let k=0;k<40;k++){const an=k/40*6.283,sp=80+Math.random()*70;part(P.x,P.y+4,Math.cos(an)*sp,Math.sin(an)*sp*.6-20,.5+Math.random()*.2,k%3?'#9a8a78':'#c8b8a0',120,2)}}}
{const _u=upd;upd=function(dt){_u(dt);if(SLAM.cd>0&&!menuOpen&&!pnOpen)SLAM.cd=Math.max(0,SLAM.cd-dt);if(SLAM.t>0)SLAM.t=Math.max(0,SLAM.t-dt)}}
{const _pp=pP;pP=function(tm){if(SLAM.t>0){const p=1-SLAM.t/.55,r=SLAM.R*Math.min(1,p*1.6);g.strokeStyle='rgba(232,208,160,'+(.75*(1-p))+')';g.lineWidth=3;g.beginPath();g.ellipse(SLAM.x,SLAM.y,r,r*.6,0,0,6.283);g.stroke();
   g.strokeStyle='rgba(90,70,50,'+(.5*(1-p))+')';g.lineWidth=1.5;g.beginPath();g.ellipse(SLAM.x,SLAM.y,r*.7,r*.42,0,0,6.283);g.stroke();for(let k=0;k<8;k++){const an=k/8*6.283+.3;Rg(SLAM.x+Math.cos(an)*r*.5,SLAM.y+Math.sin(an)*r*.3,2,1,'#3a2a1a')}}return _pp(tm)}}
// the ULT chip / button show SLAM and its cooldown
{const _hl=hudLayout;hudLayout=function(){const L=_hl();if(!SLEDGE)return L;const t=SLAM.cd>0?'SLAM '+Math.ceil(SLAM.cd)+'s':'SLAM',i=L.chips.findIndex(c=>c[0]==='ult');if(i>=0)L.chips[i]=['ult',t];else{L.chips.push(['ult',t]);if(L.chips.length===1)L.stackBottom=L.cy+22*L.U}return L}}
{const _ub=ubUpdate;ubUpdate=function(){if(!SLEDGE)return _ub();const show=!isPC&&!GPON&&!menuOpen&&!dead,lab=!show?'':SLAM.cd>0?'SLAM<small>'+Math.ceil(SLAM.cd)+'s</small>':'SLAM';
  const k='sl'+show+'|'+lab;if(k===lastUb)return;lastUb=k;ubt.style.display=show?'flex':'none';ubt.innerHTML=lab;ubt.style.opacity=SLAM.cd>0?'.55':'1';ubt.style.color=SLAM.cd>0?'':'#c8a060'}}

// ======== boulders and ore boulders ========
// boulder: 35-50 stone. Ore boulders: iron (Mining 15), gold (30), mithril (45), adamant (60). All need the sledgehammer.
const BOUL={boulder:{n:'boulder',lv:1,xp:140,ore:null,give:()=>[['stone',35+Math.floor(Math.random()*16)]]},
 obi:{n:'iron ore boulder',lv:15,xp:260,ore:'#c88a58',give:()=>[['iron',10+Math.floor(Math.random()*7)],['stone',10+Math.floor(Math.random()*11)]]},
 obg:{n:'gold ore boulder',lv:30,xp:420,ore:'#f8d048',give:()=>[['goldore',6+Math.floor(Math.random()*5)],['stone',8+Math.floor(Math.random()*8)]]},
 obm:{n:'mithril ore boulder',lv:45,xp:600,ore:'#6880f0',give:()=>[['mithore',5+Math.floor(Math.random()*4)],['stone',8+Math.floor(Math.random()*8)]]},
 oba:{n:'adamant ore boulder',lv:60,xp:850,ore:'#48c070',give:()=>[['adamore',4+Math.floor(Math.random()*3)],['stone',8+Math.floor(Math.random()*8)]]}};
for(const k in BOUL)OHP[k]=24;
window.SQBOUL=BOUL;
Object.assign(RG_OBJCOL,{boulder:'#7a7068',obi:'#a07050',obg:'#c8a838',obm:'#6070c0',oba:'#40a060'});
// the picture: a big rounded rock (24x20) with cracks; ore boulders have glinting ore in them
const BSP={};
function boulderSprite(k,v){const key=k+v;if(BSP[key])return BSP[key];const W2=32,H2=27,c=document.createElement('canvas');c.width=W2;c.height=H2;const x=c.getContext('2d'),B=BOUL[k];
 const cols=['#4a443e','#625a52','#7a7068','#948a80','#b0a89c'],sh=(i,j)=>{const nx=(i-15.5)/14.5,ny=(j-14.5)/12.5;const d=nx*nx+ny*ny;if(d>1)return-1;const l=.55-nx*.35-ny*.45+(h92(i+v*7,j)-.5)*.25;return Math.max(0,Math.min(4,Math.round(l*4)))};
 for(let j=0;j<H2;j++)for(let i=0;i<W2;i++){const s=sh(i,j);if(s<0)continue;x.fillStyle=cols[s];x.fillRect(i,j,1,1)}
 // outline
 const im=x.getImageData(0,0,W2,H2),d=im.data,o=new Uint8ClampedArray(d);for(let j=0;j<H2;j++)for(let i=0;i<W2;i++){const p=(j*W2+i)*4;if(d[p+3])continue;let n=0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=i+a,Y=j+b;if(X>=0&&Y>=0&&X<W2&&Y<H2&&d[(Y*W2+X)*4+3])n=1}if(n){o[p]=24;o[p+1]=16;o[p+2]=24;o[p+3]=255}}
 x.putImageData(new ImageData(o,W2,H2),0,0);
 // cracks and a flat base
 x.fillStyle='#3a342e';for(const[a,b]of[[10,7],[11,8],[11,9],[12,10],[12,11],[20,13],[21,14],[21,15],[22,16],[7,16],[8,17],[9,17]])x.fillRect(a+(v?2:0),b,1,1);x.fillStyle='#4a443e';x.fillRect(5,24,22,1);
 if(B&&B.ore){x.fillStyle=K;const sp=[[8,11],[16,7],[20,17],[12,19],[23,11],[15,14]];for(const[a,b]of sp)x.fillRect(a-1,b-1,4,3);x.fillStyle=B.ore;for(const[a,b]of sp)x.fillRect(a,b,2,1);x.fillStyle='#ffffff';for(const[a,b]of sp.slice(0,3))x.fillRect(a,b,1,1)}
 else{x.fillStyle='#5a8a3a';x.fillRect(7,5,5,1);x.fillRect(8,4,3,1);x.fillStyle='#7ab060';x.fillRect(8,4,1,1)}
 return BSP[key]=c}
function drawBoulder(o,x,y,bx,by,s){const sp=boulderSprite(o.t,(x*7+y*3)&1);shd(bx,by-1,30);g.drawImage(sp,Math.round(bx-16+s),Math.round(by-25));
 if(BOUL[o.t].ore){const tm=performance.now()/1000;if(Math.sin(tm*2.2+x*3)>.92){const gx=bx-6+((x*5)%12),gy=by-14+((y*3)%8);Rg(gx,gy-1,1,3,'#ffffff');Rg(gx-1,gy,3,1,'#ffffff')}}}
{const _o=OBJHD;OBJHD=(o,x,y,bx,by,s,tm)=>{if(o&&BOUL[o.t]){drawBoulder(o,x,y,bx,by,s||0);return true}return _o?_o(o,x,y,bx,by,s,tm):false}}
// the cave and dungeon boulders use the same picture
{const _df=drawFurn;drawFurn=function(it,tm){if(it&&it.t==='boulder'&&!it.o){const o={t:'boulder'},s=it.shake>0?(it.shake-=.016,Math.round(Math.sin(tm*60))):0;drawBoulder(o,it.x,it.y,it.x*16+8,it.y*16+14,s);return}return _df(it,tm)}}
// where they are: hills and far meadows on Hollow, all over the islands (same for every player)
{const near=(x,y,f)=>{for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)if(f(x+a,y+b))return true;return false};
 const oreFor=(r,far)=>r<.12*far?'oba':r<.3*far?'obm':r<.55?'obg':'obi';
 // Hollow Island
 window.SQHOLLOWBOUL=function(){let n=0;const VCX=typeof VX!=='undefined'?VX:N/2,VCY=typeof VY!=='undefined'?VY:N/2;
  for(let y=4;y<N-4;y++)for(let x=4;x<N-4;x++){const i=y*N+x,t=tile[i];if(t!==2&&t!==3)continue;if(obj[i]||PROT.has(i)||BS.has(i)||STR.has(i)||(typeof FARM!=='undefined'&&FARM.has(i))||(typeof BRIDGE!=='undefined'&&BRIDGE.has(i)))continue;
   if(typeof inVillage==='function'&&inVillage(x,y))continue;if(typeof inTownTiles==='function'&&inTownTiles(x,y))continue;if(near(x,y,(a,b)=>tile[b*N+a]===0||PROT.has(b*N+a))||obj[i-1]||obj[i+1])continue;
   const far=Math.min(1,Math.hypot(x-VCX,y-VCY)/(N*.55));if(far<.25)continue;const r=h92(x+.37,y+.91),p=t===3?.1:.03*far;if(r>=p)continue;
   const kind=t===3&&h92(y,x)<.4?oreFor(h92(x*3,y*5),far):'boulder';obj[i]={t:kind,hp:OHP[kind]};n++}return n};
 try{SQHOLLOWBOUL()}catch(e){console.warn('boulders',e)}
 // the islands
 const RGB={briarwood:[.004,.15],ashfall:[.006,.45],ironcrest:[.008,.55],shattered:[.005,.4]};
 function rgBoulders(R){if(!R||!R.region||R._boul||!RGB[R.region])return;R._boul=1;const[p,po]=RGB[R.region],W=R.w,H=R.h,seed=R.region.length*131.7+R.w;
  const res=(R.reserved||[]),inRes=(x,y)=>res.some(q=>x>=q.x-2&&y>=q.y-2&&x<q.x+q.w+2&&y<q.y+q.h+2);const far={briarwood:.2,ashfall:.6,ironcrest:.85,shattered:1}[R.region];
  for(let y=4;y<H-4;y++)for(let x=4;x<W-4;x++){const i=y*W+x;if(!RG_WALK[R.tiles[i]]||R.tiles[i]===14||R.solid.has(i))continue;const r=h92(x+seed,y-seed*.3);if(r>=p)continue;
   if(near(x,y,(a,b)=>!RG_WALK[R.tiles[b*W+a]]||R.tiles[b*W+a]===14||R.solid.has(b*W+a))||rgObjAt(R,x-1,y)||rgObjAt(R,x+1,y))continue;if(inRes(x,y))continue;if(R.reach&&!R.reach[i])continue;try{if(typeof rfMap==='function'&&rfMap(R.region).has(x+','+y))continue}catch(e){}
   if(Math.hypot(x-(R.spawn?R.spawn[0]:-99),y-(R.spawn?R.spawn[1]:-99))<6)continue;
   const kind=h92(y+seed,x)<po?oreFor(h92(x*3+seed,y*5),far):'boulder',it={t:'_obj',o:{t:kind,hp:OHP[kind]},x,y,solid:true};R.items.push(it);R.solid.add(i);try{rgCellAdd(R,it)}catch(e){}}}
 window.SQRGBOUL=rgBoulders;
 {const _lr=loadRegion;loadRegion=function(id,want,ret){const ok=_lr(id,want,ret);try{const R=SCENE&&SCENE.room;if(ok&&R&&R.region)rgBoulders(R)}catch(e){console.warn(e)}return ok}}
 // caves and dungeons: some boulders hold ore (deeper floors: better ore)
 const _bf=buildFloor;buildFloor=function(kind,f){const R=_bf(kind,f);try{const rnd=dRng(today()*313+f*71+kind.length*17);for(const it of R.items)if(it.t==='boulder'&&rnd()<.3){const r=rnd(),deep=Math.min(1,.25+f*.13);it.ore=r<.1*deep?'oba':r<.28*deep?'obm':r<.55?'obg':'obi'}}catch(e){}return R}}
// keep builds clear: a boulder never sits under a house, structure or farm plot on Hollow
{let chk=0;const _u=upd;upd=function(dt){_u(dt);if((chk-=dt)>0)return;chk=2;for(let i=0;i<obj.length;i++){const o=obj[i];if(!o||!BOUL[o.t])continue;const x=i%N,y=(i/N)|0;
   if(STR.has(i)||BS.has(i)||(typeof FARM!=='undefined'&&FARM.has(i))||(typeof houseAt==='function'&&houseAt(x,y)))obj[i]=null}}}
// breaking them
function boulderHit(o,x,y,done){const B=BOUL[o.t];if(!B)return false;
 if(!SLEDGE){swing=.25;say('This '+B.n+' is far too big for a pickaxe. It would take a sledgehammer...');sfx('swish');return true}
 if(lvOf(2)<B.lv){swing=.25;say('You need Mining '+B.lv+' to break the '+B.n+'.');sfx('swish');return true}
 swing=.3;o.hp=(o.hp==null?OHP[o.t]:o.hp)-(6+Math.floor(lvOf(2)/15)+Math.floor(lvOf(0)/30));o.shake=.2;sfx('mine');ACTW[2]=10;
 for(let k=0;k<5;k++)part(x*16+8,y*16+6,(Math.random()-.5)*90,-30-Math.random()*60,.4,k%2?'#9a8a78':'#6a645c',160,1);
 if(o.hp>0)return true;
 const got=B.give(),txt=[];for(const[k,n]of got){inv[k]=(inv[k]|0)+n;txt.push('+'+n+' '+(k==='stone'?'stone':INAME[k].toLowerCase()))}addXp(2,B.xp);
 say('The '+B.n+' cracks apart! '+txt.join(', '));try{gTxt(x*16+8,y*16-30,txt[0],'#e8d8b8');if(typeof rumble==='function')rumble(200,.7,.4);setTimeout(()=>sfx('pickup'),90)}catch(e){}
 for(let k=0;k<18;k++){const an=k/18*6.283;part(x*16+8,y*16+6,Math.cos(an)*90,Math.sin(an)*60-30,.55,k%2?'#948a80':'#5a524a',200,2)}done();saveLocal();return true}
window.SQBOULDERHIT=boulderHit;
{const BROKE=[];
 const _a=attack;attack=function(){if(dead||menuOpen||pnOpen||BUILD||FISH||swing>0||(window.SQDF&&SQDF.on))return _a();
  const[fx,fy]=front(13),tx=Math.floor(fx/16),ty=Math.floor(fy/16);if(en.some(n=>!n.dead&&!n._pet&&Math.hypot(n.x-fx,n.y-fy)<(n.big?24:16)))return _a();const R=SCENE&&SCENE.room;
  if(!SCENE){if(tx<0||ty<0||tx>=N||ty>=N)return _a();const i=ty*N+tx,o=obj[i];if(o&&BOUL[o.t]&&boulderHit(o,tx,ty,()=>{obj[i]=null;REM.push({i,t:o.t,at:CLK})}))return;return _a()}
  if(R&&R.region){const it=rgObjAt(R,tx,ty);if(it&&BOUL[it.o.t]&&boulderHit(it.o,tx,ty,()=>{it.gone=true;rgCellDel(R,it);R.solid.delete(ty*R.w+tx);R.gone.push({it,at:CLK})}))return;return _a()}
  if(R&&R.cave){const it=R.items.find(q=>q.t==='boulder'&&q.x===tx&&q.y===ty&&!q.gone);if(it){const o={t:it.ore||'boulder',hp:it.hp==null?24:it.hp};
    const r=boulderHit(o,tx,ty,()=>{it.gone=true;const j=R.items.indexOf(it);if(j>=0)R.items.splice(j,1);R.solid.delete(ty*R.w+tx);BROKE.push({R,it,at:performance.now()})});it.hp=o.hp;it.shake=o.shake;if(r)return}}
  return _a()};
 // the Slime Caverns' boulders come back after five minutes (dungeon floors are rebuilt each day anyway)
 const _u=upd;upd=function(dt){_u(dt);if(!BROKE.length)return;const now=performance.now();for(let j=BROKE.length-1;j>=0;j--){const b=BROKE[j];if(now-b.at<3e5)continue;if(SCENE&&SCENE.room===b.R&&Math.hypot(P.x-(b.it.x*16+8),P.y-(b.it.y*16+8))<24)continue;
   b.it.gone=false;b.it.hp=null;if(!b.R.items.includes(b.it))b.R.items.push(b.it);b.R.solid.add(b.it.y*b.R.w+b.it.x);BROKE.splice(j,1)}}}
// ore boulders in caves look like ore boulders
{const _df=drawFurn;drawFurn=function(it,tm){if(it&&it.t==='boulder'&&it.ore&&!it.o){const s=it.shake>0?(it.shake-=.016,Math.round(Math.sin(tm*60))):0;drawBoulder({t:it.ore},it.x,it.y,it.x*16+8,it.y*16+14,s);return}return _df(it,tm)}}
window.SQSLEDGE=()=>SLEDGE;

// ======== Ashfall: Emberwatch and Cinderdeep ========
const AF={town:null,npcs:[],npc:null,boss:null};window.SQAF=AF;
SQ_SIDE.ashfall={index:0,on:false,k:0,completed:false};SQTOWN.ashfall='Emberwatch';SQ_REGION.ashfall='ashfall';
SIDE_QS.ashfall=[
 {n:'Iron for the Forge',d:'Bring Forgemaster Brann 15 iron ore.',type:'give',item:'iron',amt:15,r:{g:300,xp:[2,800]},giver:'Brann',start:'My furnaces are hungry and the beetles keep chewing through the supply carts. Bring me iron. Lots of it.',finish:'Now THAT is good ore. The hammers can sing again.',req:[2,15]},
 {n:'Cinder Beetles',d:'Defeat 10 cinder beetles on the Ashfall Coast.',type:'kill',item:'cinderbeetle',amt:10,r:{g:380,xp:[0,900]},giver:'Kesh',start:'Cinder beetles. They eat iron, they eat carts, and last week they ate a boot. With the foot still in it. Clear some out.',finish:'The carts made it through today. Well fought.'},
 {n:'Eels for the Camp',d:'Bring Old Pell 5 raw ember eels from Ashfall\'s waters.',type:'give',item:'eeel',amt:5,r:{g:340,xp:[9,800]},giver:'Old Pell',start:'Smiths eat like bears. Ember eels, grilled on a forge plate... that\'s the only thing that keeps them going.',finish:'Ha! They\'re still warm. The lads will be pleased.',req:[9,30]},
 {n:'The Emberlord',d:'Defeat the Emberlord at the bottom of Cinderdeep.',type:'dungeonboss',item:'emberlord',amt:1,r:{g:1200,xp:[0,2200]},giver:'Kesh',start:'Cinderdeep. Six floors of lava under the north-east hills, and at the bottom, the Emberlord. It wakes every day and burns anyone who gets close. End it, if only for a day.',finish:'The ground is cooler already. Emberwatch is in your debt.',note:'Attack 40 recommended. Bring food, and roll out of the fire.'}];
const AFLOOK={Brann:{sk:3,hs:0,hc:6,sh:7,pn:0,ht:2,hcol:2,so:2},Kesh:{sk:1,hs:3,hc:0,sh:4,pn:2,ht:1,hcol:0,so:3},'Old Pell':{sk:2,hs:1,hc:6,sh:1,pn:3,ht:0,hcol:0,so:1}};
const AFSAYS={Brann:['Iron, coal, fire. That\'s all a forge needs.','I\'ll buy anything that came out of the ground.','Mind the anvils.'],
 Kesh:['The beetles never sleep. Neither do I.','Cinderdeep is in the north-east hills.','Keep your water skin full out there.'],
 'Old Pell':['I\'ve cooked for this camp for thirty years.','The lava? You get used to it.','Sit by the fire. Warm your bones.']};
function afSetup(R){if(R.region!=='ashfall'||R._af)return;const site=(R.reserved||[]).find(q=>(q.kind||q.t||q.id)==='town');if(!site)return;R._af=1;
 const x0=site.x,y0=site.y,W=R.w,set=(x,y,t)=>{if(x>0&&y>0&&x<W-1&&y<R.h-1&&R.tiles[y*W+x]!==0)R.tiles[y*W+x]=t};
 for(let y=y0;y<y0+site.h;y++)for(let x=x0;x<x0+site.w;x++){const it=rgObjAt(R,x,y);if(it){it.gone=true;rgCellDel(R,it);R.solid.delete(y*W+x)}if(R.tiles[y*W+x]!==0)R.tiles[y*W+x]=10}
 for(let x=x0+1;x<x0+site.w-1;x++){set(x,y0+6,14);set(x,y0+7,14)}for(let y=y0+3;y<y0+site.h;y++){set(x0+9,y,14);set(x0+10,y,14)}
 const solidAt=(x,y)=>R.solid.add(y*W+x),add=it=>{R.items.push(it);try{rgCellAdd(R,it)}catch(e){}};
 const blds=[{tx:x0+1,ty:y0+2,w:5,wall:'#8a7060',roof:'#a83818',name:'Warden\'s Hall',room:'afhall'},{tx:x0+12,ty:y0+2,w:7,wall:'#6a5a50',roof:'#3a3030',name:'The Forge',room:'afforge',smoke:1}];
 for(const b of blds){add({t:'afbld',b,room:b.room,x:b.tx+(b.w>>1),y:b.ty+1,w:b.w,h:2});for(let dy=0;dy<2;dy++)for(let dx=0;dx<b.w;dx++)solidAt(b.tx+dx,b.ty+dy)}
 for(const[k,x,y,w]of[['tent',x0+2,y0+9,2],['tent',x0+15,y0+10,2],['firepit',x0+6,y0+10,1],['crates',x0+17,y0+8,1],['cart',x0+12,y0+11,1],['crates',x0+1,y0+12,1]]){add({t:'lm',k,x,y,w,h:1,sh:1});for(let dx=0;dx<w;dx++)solidAt(x+dx,y)}
 for(const[x,y]of[[x0+11,y0+5],[x0+16,y0+5]]){add({t:'anvil',x,y});solidAt(x,y)}
 for(const[x,y]of[[x0+8,y0+5],[x0+11,y0+8],[x0+4,y0+12]]){add({t:'afbraz',x,y});solidAt(x,y)}
 add({t:'afsign',x:x0+8,y:y0+12});solidAt(x0+8,y0+12);
 AF.npcs=[{id:'Kesh',x:(x0+3)*16+8,y:(y0+5)*16+10,role:'quests'},{id:'Brann',x:(x0+14)*16+8,y:(y0+5)*16+10,role:'shop'},{id:'Old Pell',x:(x0+7)*16+8,y:(y0+11)*16+4,role:'elder'}];
 for(const n of AF.npcs){n.town='ashfall';n.hx=n.x;n.hy=n.y;add({t:'afnpc',n,x:n.x/16,y:n.y/16})}
 AF.town={x0,y0,w:site.w,h:site.h};R._doors=null;
 if(!R.lms.some(l=>l.id==='emberwatch'))R.lms.push({id:'emberwatch',name:'Emberwatch',x:x0+10,y:y0+6});LM_NAMES.emberwatch='Emberwatch';LM_NAMES.cinderdeep='Cinderdeep'}
{const _lr=loadRegion;loadRegion=function(id,want,ret){const ok=_lr(id,want,ret);try{const R=SCENE&&SCENE.room;if(ok&&R&&R.region==='ashfall'){afSetup(R);const d=R.useItems.find(u=>u.kind==='aflava');if(d&&!R.lms.some(l=>l.id==='cinderdeep'))R.lms.push({id:'cinderdeep',name:'Cinderdeep',x:d.x,y:d.y})}}catch(e){console.warn(e)}return ok}}
const afR=()=>{const R=SCENE&&SCENE.room;return R&&R.region==='ashfall'&&R._af?R:null};
const afIn=(x,y)=>{const T=AF.town;return T&&x>=(T.x0-1)*16&&x<(T.x0+T.w+1)*16&&y>=(T.y0-1)*16&&y<(T.y0+T.h+1)*16};
const afNear=()=>{if(!afR())return null;let best=null,bd=26;for(const n of AF.npcs){const d=Math.hypot(n.x-P.x,n.y-P.y);if(d<bd){bd=d;best=n}}return best};
window.SQAFNEAR=afNear;
{const _df=drawFurn;drawFurn=function(it,tm){if(!it||typeof it.t!=='string'||it.t.slice(0,2)!=='af')return _df(it,tm);const x=it.x*16,y=it.y*16;
  if(it.t==='afbld'){const b=it.b;try{drBld({k:'home',w:b.w,wall:b.wall,roof:b.roof,sc:null,tx:b.tx,ty:b.ty},tm)}catch(e){}const X0=b.tx*16,w=b.w*16,base=(b.ty+2)*16;
   if(b.smoke){Rg(X0+w-22,base-46,8,14,K);Rg(X0+w-21,base-45,6,13,'#4a4040');for(let k=0;k<3;k++){const ph=(tm*.5+k/3)%1;g.fillStyle='rgba(90,80,80,'+(.45*(1-ph))+')';g.beginPath();g.arc(X0+w-18+Math.sin(ph*5+k)*3,base-48-ph*24,3+ph*5,0,6.283);g.fill()}
    const gl=.25+.15*Math.sin(tm*6);g.fillStyle='rgba(255,120,40,'+gl+')';g.fillRect(X0+10,base-14,10,8)}
   const tw=b.name.length*4+8,sx=Math.round(X0+w/2-tw/2);g.save();g.font='700 6px '+PF;g.fillStyle='#2a1410';g.fillRect(sx-1,base-35,tw+2,10);g.fillStyle='#f0d8b0';g.fillRect(sx,base-34,tw,8);g.fillStyle='#2a1410';g.textAlign='center';g.textBaseline='middle';g.fillText(b.name,X0+w/2,base-29.5);g.restore();return}
  if(it.t==='afbraz'){shd(x+8,y+14,12);Rg(x+3,y+4,10,10,K);Rg(x+4,y+5,8,8,'#4a4040');Rg(x+4,y+5,8,2,'#6a5a50');Rg(x+5,y+13,2,3,K);Rg(x+9,y+13,2,3,K);
   for(let k=0;k<4;k++){const ph=(tm*1.6+k*.27)%1,fx=x+5+k*2+Math.round(Math.sin(tm*7+k)),fh=Math.round(6+4*(1-ph));Rg(fx,y+4-fh,2,fh,k%2?'#f86020':'#f8b030');Rg(fx,y+4-fh,1,2,'#fff0a0')}
   if(dark()>.12){g.fillStyle='rgba(255,150,60,.16)';g.beginPath();g.arc(x+8,y,28,0,6.283);g.fill()}return}
  if(it.t==='afsign'){Rg(x+7,y-2,2,14,'#3a2414');Rg(x-4,y-12,24,11,K);Rg(x-3,y-11,22,9,'#8a6a48');Rg(x-3,y-11,22,1,'#b08860');g.save();g.font='700 5px '+PF;g.fillStyle='#f8e0b0';g.textAlign='center';g.textBaseline='middle';g.fillText('EMBERWATCH',x+8,y-6.5);g.restore();return}
  if(it.t==='afnpc'){const n=it.n,near=Math.hypot(n.x-P.x,n.y-P.y)<60,dir=near?(Math.abs(P.x-n.x)>Math.abs(P.y-n.y)?2:P.y<n.y?1:0):0,fl=near&&P.x<n.x;shd(n.x,n.y+6,12);GC=g;
   try{cP(AFLOOK[n.id],dir,0,Math.round(n.x),Math.round(n.y),fl)}catch(e){}
   const q=sqCur('ashfall');if(q&&q.giver===n.id&&(!SQ_SIDE.ashfall.on||sqReady('ashfall'))){const bob=Math.round(Math.sin(tm*4));Rg(n.x-2,n.y-34+bob,4,8,K);Rg(n.x-1,n.y-33+bob,2,5,'#f8d048');Rg(n.x-1,n.y-27+bob,2,1,'#f8d048')}
   g.save();g.font='700 6px '+PF;g.textAlign='center';g.textBaseline='bottom';g.lineWidth=2;g.strokeStyle=K;g.strokeText(n.id,n.x,n.y-22);g.fillStyle='#ffe8d0';g.fillText(n.id,n.x,n.y-22);g.restore();return}
  return _df(it,tm)}}
// talking
function afOpen(n){AF.npc=n;shop='afnpc';pnOpen=true;ptab=2;jx=jy=0;fromMenu=false;pn.style.display='block';rPn();sfx('talk')}
{const _t=talk;talk=function(){if(!pnOpen&&!menuOpen&&!dead){const n=afNear();if(n){afOpen(n);return}}return _t()}}
tk.addEventListener('touchstart',e=>{if(pnOpen||menuOpen||dead)return;const n=afNear();if(n){e.preventDefault();e.stopImmediatePropagation();afOpen(n)}},{passive:false,capture:true});
{const _pu=window.SQPADUSE;window.SQPADUSE=()=>!!afNear()||!!(_pu&&_pu())}
{let mine=false;const _u=upd;upd=function(dt){_u(dt);const n=!pnOpen&&!menuOpen&&!dead?afNear():null;
  if(n){tk.style.display='flex';const lab='TALK'+(isPC?'<small>T</small>':(typeof GPON!=='undefined'&&GPON?'<small>✕</small>':''));if(tk.innerHTML!==lab)tk.innerHTML=lab;mine=true}else if(mine){mine=false;if(!pnOpen)tk.style.display='none'}
  if(afR()&&AF.town)for(const m of en)if(!m.dead&&!m.big&&!m._rp&&afIn(m.x,m.y)){m.dead=1;m.dropped=1}}}
const SHOPAF=[{n:'Healing potion',c:180,k:'pot_heal',m:1},{n:'20 iron arrows',c:70,k:'iarrow',m:20},{n:'10 bait',c:15,k:'bait',m:10},{n:'5 stone',c:10,k:'stone',m:5},{n:'Fire kit (3 wood + 1 stone)',c:12,kit:1},{n:'Iron bar',c:60,k:'ibar',m:1}];
window.SHOPAF=SHOPAF;// (161b/162 edit and add to it from the Dev Suite)
function afHTML(){const n=AF.npc;if(!n)return'';const L=AFSAYS[n.id],line=L[Math.floor(performance.now()/7000)%L.length];
 let h='<div class="tl">'+esc(n.id)+'</div><div class="qc"><p>"'+esc(line)+'"</p><small>'+(n.role==='shop'?'Forgemaster of Emberwatch':n.role==='quests'?'Warden of Emberwatch':'Camp cook')+'</small></div>';
 try{h+=sideCard(n)}catch(e){}
 if(n.role==='elder'&&!(sqCur('ashfall')&&sqCur('ashfall').giver===n.id))h+='<div class="qc" style="margin-top:8px"><p>"Cinderdeep is up in the north-east hills. Six floors down, and the last one is all lava. The Emberlord lives there. It wakes every day, and it does not like visitors."</p></div>';
 if(n.role==='shop'){h+='<div class="tl" style="margin-top:12px">Buy</div><div class="qc"><small>Gold: '+GLD+'</small></div>';
  SHOPAF.forEach((it,i)=>{if(it.k&&!INAME[it.k]&&!it.kit)return;h+='<button class="sb" data-af="b'+i+'" style="opacity:'+(GLD>=it.c?1:.45)+'">'+esc(it.n)+'<br><small>'+it.c+' gold</small></button>'});
  h+='<div class="tl" style="margin-top:12px">Sell</div>';let any=0;for(const k in SELLP){const c=inv[k]|0;if(c<=0)continue;any=1;h+='<button class="sb" data-af="s'+k+'">Sell all '+esc(SN[k]||INAME[k]||k)+' ('+c+')<br><small>+'+c*SELLP[k]+' gold</small></button>'}
  if(!any)h+='<div class="tl" style="font-weight:400;opacity:.6">Nothing to sell</div>'}
 return h}
{const _r=rPn;rPn=function(){if(ptab===2&&shop==='afnpc'&&AF.npc){try{panelChrome('')}catch(e){}pbd.innerHTML=afHTML();return}_r()}}
{const _oc=pbd.onclick;pbd.onclick=e=>{if(shop==='afnpc'&&AF.npc){const b=e.target.closest('[data-af]');if(b){const a=b.dataset.af;
    if(a[0]==='b'){const it=SHOPAF[+a.slice(1)];if(!it)return;if(GLD<it.c){say('Not enough gold');sfx('swish');return}GLD-=it.c;if(it.kit){inv.wood=(inv.wood|0)+3;inv.stone=(inv.stone|0)+1}else inv[it.k]=(inv[it.k]|0)+it.m;say('Bought '+it.n+'.');sfx('coin')}
    else{const k=a.slice(1),c=inv[k]|0;if(c>0){const v=c*SELLP[k];GLD+=v;inv[k]=0;say('Sold for '+v+' gold');sfx('coin')}}try{svg()}catch(_){}saveLocal(true);rPn();return}
   const q=e.target.closest('.xb');if(q&&/^sq_/.test(q.dataset.a||'')){sideAct(q.dataset.a.slice(3),AF.npc);saveLocal(true);rPn();return}}return _oc(e)}}
{const _cp=closePanel;closePanel=function(){if(shop==='afnpc'){AF.npc=null;shop=null}return _cp()}}
// quest progress: cinder beetles anywhere on Ashfall
{const _ed=enemyDrop;enemyDrop=function(n){_ed(n);if(n&&n.type==='beetle'&&n.rv==='cinder'&&!n._afq){n._afq=1;sqEvent('kill','cinderbeetle');saveLocal(true)}}}
if(typeof killEnemy==='function'){const _ke=killEnemy;killEnemy=function(n,...a){const r=_ke(n,...a);try{if(n&&n.dead&&n.type==='beetle'&&n.rv==='cinder'&&!n._afq){n._afq=1;sqEvent('kill','cinderbeetle')}}catch(e){}return r}}

// ---- Cinderdeep: six floors of lava ----
const AFMOB=[['beetle:cinder',.3],['skel:ember',.55],['slime:magma',.8],['bat',.9],['scorp',1]];
window.SQICV.aflava={name:'Cinderdeep',floor:['#4a3430','#42302c'],wall:'#2e2220',trim:'#140c0a',W:60,H:44,at:'dungeon0',rg:'ashfall',floors:6,cavey:1,mob:AFMOB,ore:5,lava:1};DKIND.aflava=window.SQICV.aflava;
// lava pools on every floor (more the deeper you go); standing in one burns
{const _bf=buildFloor;buildFloor=function(kind,f){const R=_bf(kind,f);if(kind!=='aflava')return R;try{const D=R.dun,G=D&&D.G,W=R.w,H=R.h,rnd=dRng(today()*577+f*131);
  for(const m of R.mobs)if(m.rk==='slime:magma'){m.vr='magma';delete m.rv}
  const used=new Set();for(const it of R.items)for(let dy=0;dy<(it.sh||1);dy++)for(let dx=0;dx<(it.w||1);dx++)used.add((it.y+dy)*W+it.x+dx);
  const ok=(x,y)=>{if(x<3||y<4||x>W-5||y>H-6)return false;if(Math.abs(x-R.ex)<5&&y>H-9)return false;if(D.boss&&Math.hypot(x-D.boss[0],y-D.boss[1])<5)return false;for(let b=-1;b<=1;b++)for(let a=-1;a<=2;a++){const j=(y+b)*W+x+a;if(G[j]||used.has(j)||R.solid.has(j))return false}return true};
  let n=0;const want=5+f*2;for(let t=0;t<900&&n<want;t++){const x=3+Math.floor(rnd()*(W-6)),y=4+Math.floor(rnd()*(H-8));if(!ok(x,y))continue;const w=rnd()<.5?2:1;R.items.push({t:'aflavap',x,y,w,h:1,floor:1});for(let a=0;a<w;a++)used.add(y*W+x+a);n++}}catch(e){console.warn(e)}return R}}
{const _df=drawFurn;drawFurn=function(it,tm){if(it&&it.t==='aflavap'){const x=it.x*16,y=it.y*16,w=(it.w||1)*16,p=.5+.5*Math.sin(tm*2+it.x);Rg(x-1,y+1,w+2,14,'#2a1410');Rg(x,y+2,w,12,'#c83810');Rg(x+1,y+3,w-2,10,'#f06018');
   for(let k=0;k<w/4;k++){const ph=(tm*.7+k*.31+it.x*.1)%1;Rg(x+2+k*4,y+4+Math.round(ph*6),2,2,ph<.5?'#ffd060':'#f8a030')}g.fillStyle='rgba(255,120,30,'+(.12+.1*p)+')';g.beginPath();g.arc(x+w/2,y+8,w*.7+6,0,6.283);g.fill();return}return _df(it,tm)}}
// the floor tiles of the lava pools draw under you (they're floor, not furniture)
{const _u=upd;let burnT=0;upd=function(dt){_u(dt);const R=SCENE&&SCENE.room;if(!R||!R.dun||R.dun.kind!=='aflava'||dead||menuOpen||pnOpen)return;burnT-=dt;const tx=Math.floor(P.x/16),ty=Math.floor((P.y+4)/16);
  const on=R.items.some(it=>it.t==='aflavap'&&ty===it.y&&tx>=it.x&&tx<it.x+(it.w||1));if(on&&burnT<=0&&hurt<=0&&!(typeof ROLLT!=='undefined'&&ROLLT>0)){burnT=1.2;P.hp--;hurt=1;say('Ow! Lava!');try{sfx('hurt')}catch(e){}}}}
{const _uf=useFurn;useFurn=function(it){return _uf(it)}}

// ---- the Emberlord (floor 6 of Cinderdeep) ----
const EL_HP=320;let EMDAY=-1;
{const _da=dArrive;dArrive=function(R,from){_da(R,from);const D=R.dun;if(!D||D.kind!=='aflava'||D.f!==6||!D.boss||D._el)return;D._el=1;if(EMDAY===today()){say('Cinderdeep - the Emberlord\'s lair. The lava is cooling. It sleeps until tomorrow.');return}
  const[bx,by]=D.boss;const b={x:bx*16+8,y:by*16+8,hp:EL_HP,mhp:EL_HP,kx:0,ky:0,type:'emberl',big:1,pcd:2.5,fcd:4,scd:0,half:false,pools:[],balls:[]};R.mobs.push(b);AF.boss=b;setTimeout(()=>{try{sfx('roar')}catch(e){}},300);say('The ground shakes. THE EMBERLORD rises from the lava!');msgT=4}}
{const _u=upd;upd=function(dt){const pre=new Map();for(const n of en)if(n.type==='emberl'&&!n.dead)pre.set(n,[n.x,n.y]);_u(dt);
  for(const[n,[x,y]]of pre){if(n.dead)continue;n.x=x+(n.x-x)*.4;n.y=y+(n.y-y)*.4;n.kx*=.3;n.ky*=.3;n.t=(n.t||0)+dt;const roll=typeof ROLLT!=='undefined'&&ROLLT>0;
   // fire pools: orange rings under you, then they burst into flame for a few seconds
   if((n.pcd-=dt)<=0){n.pcd=n.half?2.4:3.4;for(let k=0;k<(n.half?3:2);k++){const a=Math.random()*6.283,r=k?14+Math.random()*28:0;n.pools.push({x:P.x+Math.cos(a)*r,y:P.y+4+Math.sin(a)*r*.7,t:1.2,life:3})}}
   for(const q of n.pools){q.t-=dt;if(q.t<=0){q.life-=dt;q.hc=(q.hc||0)-dt;if(q.hc<=0&&Math.hypot(P.x-q.x,(P.y+4-q.y)*1.4)<15&&hurt<=0&&!roll&&!dead){q.hc=1;P.hp--;hurt=1.1;say('The ground erupts in flame!');try{sfx('hurt')}catch(e){}}}}
   n.pools=n.pools.filter(q=>q.t>0||q.life>0);
   // fireballs: a fan of five aimed at you
   if((n.fcd-=dt)<=0){n.fcd=n.half?2.8:4.2;const a0=Math.atan2(P.y-(n.y-20),P.x-n.x);for(let k=-2;k<=2;k++){const a=a0+k*.28;n.balls.push({x:n.x,y:n.y-20,vx:Math.cos(a)*85,vy:Math.sin(a)*85,t:3.2})}try{sfx('cfire')}catch(e){}}
   for(const b of n.balls){b.t-=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(solid(b.x,b.y))b.t=0;else if(Math.hypot(P.x-b.x,P.y-6-b.y)<9&&hurt<=0&&!roll&&!dead){b.t=0;P.hp--;hurt=1.1;say('A fireball hits you!');try{sfx('hurt')}catch(e){}}}
   n.balls=n.balls.filter(b=>b.t>0);
   // at half its life it calls magma slimes up out of the lava
   if(!n.half&&n.hp<=n.mhp/2){n.half=true;n.scd=0;say('The Emberlord roars, and the lava boils with slimes!');msgT=3}
   if(n.half&&(n.scd-=dt)<=0){n.scd=13;const alive=en.filter(o=>o.summon&&!o.dead).length;for(let k=alive;k<3;k++){const a=Math.random()*6.283,wx=n.x+Math.cos(a)*34,wy=n.y+Math.sin(a)*26;if(!solid(wx,wy))en.push({x:wx,y:wy,hp:30,mhp:30,kx:0,ky:0,type:'slime',vr:'magma',summon:1,_prov:9})}}}
  {const n=AF.boss;if(n&&n.hp<=0&&!n._rew){AF.boss=null;n._rew=1;n.dead=1;n.dropped=1;n.pools=[];n.balls=[];EMDAY=today();try{saveLocal(true)}catch(e){}
   GLD+=600;inv.gbar=(inv.gbar|0)+3;inv.iron=(inv.iron|0)+10;inv.ruby=(inv.ruby|0)+1;addXp(0,900);addXp(7,400);
   let rare='';if(Math.random()<.1||window.SQEMBERDROP){inv.ja_ember=(inv.ja_ember|0)+1;rare=' and an EMBER RING!'}
   sqEvent('dungeonboss','emberlord');say('The Emberlord cracks and sinks into the lava. +600 gold, gold bars, iron ore, a ruby'+(rare||'.'));msgT=6;try{sfx('quest');if(rare)setTimeout(()=>sfx('level'),300)}catch(e){}}}}}
function drawEmberl(n,tm){const x=Math.round(n.x),y=Math.round(n.y),hit=Math.abs(n.kx)+Math.abs(n.ky)>.3,t=n.t||0,sw=Math.round(Math.sin(t*2.5)*2),R=hit?'#ffffff':'#3a2c2a',Rd=hit?'#e0e0e0':'#241a18',Rl=hit?'#ffffff':'#54443e',C=hit?'#ffffff':'#f87020',Cl='#ffd060';
 for(const q of n.pools){if(q.t>0){const a=.4+.4*Math.sin(tm*14);g.strokeStyle='rgba(255,140,40,'+a+')';g.lineWidth=1.5;g.beginPath();g.ellipse(q.x,q.y,15,8,0,0,6.283);g.stroke()}
  else{g.fillStyle='rgba(255,100,20,.35)';g.beginPath();g.ellipse(q.x,q.y,15,8,0,0,6.283);g.fill();for(let k=0;k<5;k++){const ph=(tm*1.8+k*.21)%1,fx=q.x-10+k*5,fh=Math.round(4+8*(1-ph));Rg(fx,q.y-fh,2,fh,k%2?'#f86020':'#f8b030');Rg(fx,q.y-fh,1,2,'#fff0a0')}}}
 shd(x,y+8,44);
 // legs
 for(const s of[-1,1]){Rg(x+s*9-5,y-6,10,14,K);Rg(x+s*9-4,y-5,8,12,R);Rg(x+s*9-4,y-5,8,2,Rl);Rg(x+s*9-1,y-2,2,6,C)}
 // body: a hunched mass of basalt with glowing cracks
 Rg(x-17,y-40,34,36,K);Rg(x-16,y-39,32,34,R);Rg(x-16,y-39,32,4,Rl);Rg(x-16,y-10,32,5,Rd);
 for(const[a,b,w,h]of[[-10,-34,2,10],[-10,-25,6,2],[6,-30,2,12],[2,-19,6,2],[-4,-14,2,6],[10,-16,2,5]])Rg(x+a,y+b,w,h,C);for(const[a,b]of[[-10,-33],[6,-29],[2,-19]])Rg(x+a,y+b,1,1,Cl);
 // head and eyes
 Rg(x-9,y-50,18,12,K);Rg(x-8,y-49,16,10,R);Rg(x-8,y-49,16,2,Rl);const e=hit?'#ffffff':(Math.floor(tm*3)%5?'#ffd040':'#ffffff');Rg(x-6,y-45,4,3,K);Rg(x+2,y-45,4,3,K);Rg(x-5,y-45,2,2,e);Rg(x+3,y-45,2,2,e);Rg(x-4,y-41,8,2,K);Rg(x-3,y-41,6,1,C);
 // arms with molten fists
 for(const s of[-1,1]){const ax=x+s*17,ay=y-36+sw*s;Rg(Math.min(ax,ax+s*8)-1,ay-1,10,18,K);Rg(Math.min(ax,ax+s*8),ay,8,16,R);Rg(Math.min(ax,ax+s*8),ay,8,2,Rl);const fx=ax+s*4-5,fy=ay+14;Rg(fx-1,fy-1,12,10,K);Rg(fx,fy,10,8,C);Rg(fx+2,fy+1,6,3,Cl)}
 // flames on its shoulders
 for(const s of[-1,1])for(let k=0;k<3;k++){const ph=(tm*1.5+k*.33)%1,fx=x+s*11-2+k*2,fh=Math.round(5+6*(1-ph));Rg(fx,y-40-fh,2,fh,k%2?'#f86020':'#f8b030');Rg(fx,y-40-fh,1,2,'#fff0a0')}
 g.fillStyle='rgba(255,120,30,'+(.12+.08*Math.sin(tm*4))+')';g.beginPath();g.arc(x,y-24,34,0,6.283);g.fill();
 // fireballs
 for(const b of n.balls){g.fillStyle='rgba(255,140,40,.35)';g.beginPath();g.arc(b.x,b.y,6,0,6.283);g.fill();Rg(b.x-3,b.y-3,6,6,K);Rg(b.x-2,b.y-2,4,4,'#f87020');Rg(b.x-1,b.y-2,2,2,'#fff0a0')}
 const w=44,f=Math.max(0,n.hp/n.mhp);Rg(x-w/2-1,y-62,w+2,5,K);Rg(x-w/2,y-61,w,3,'#3a1a1a');Rg(x-w/2,y-61,Math.round(w*f),3,'#f87020')}
{const _pS=pS;pS=function(n,tm){if(n&&n.type==='emberl')return drawEmberl(n,tm);return _pS(n,tm)}}
{const _sn=snap;snap=function(){const s=_sn();s.emd=EMDAY;return s}}
{const _ap=applySave;applySave=function(S){_ap(S);EMDAY=isFinite(S&&S.emd)?+S.emd:-1}}
// the Ember ring: your sword sets monsters burning
if(window.SQJK){SQGEMC.ember=['#f87020','#802008'];const j={k:'ja_ember',n:'Ember ring',s:'ring',g:'ember',v:4500,d:'Your melee hits set monsters on fire.'};SQJK[j.k]=j;
 INVK.push(j.k);if(typeof EXTRA_BAG!=='undefined')EXTRA_BAG.push(j.k);INAME[j.k]=j.n;IDESC[j.k]='Ring (rare, from the Emberlord): '+j.d+' Wear it from the Bag.';SELLP[j.k]=1800;SN[j.k]=j.n+'s';if(typeof SHORT!=='undefined')SHORT[j.k]=j.n.toLowerCase()}
{const _a=attack;attack=function(){const on=window.SQJW&&SQJW.ring==='ja_ember';if(!on)return _a();const hp0=new Map();for(const n of en)if(!n.dead)hp0.set(n,n.hp);_a();
  for(const[n,h]of hp0)if(!n.dead&&n.hp<h&&n.type!=='emberl'){n.burn=Math.max(n.burn||0,3);for(let k=0;k<4;k++)part(n.x,n.y-8,(Math.random()-.5)*60,-40-Math.random()*40,.4,k%2?'#f86020':'#f8b030',-30,1)}}}

// ======== the wiki ========
try{WK_DUN.push({n:'Cinderdeep',w:'North-east hills of the Ashfall Coast',boss:'The Emberlord',bhp:EL_HP,d:'Six floors of ash and lava pools (don\'t stand in them): cinder beetles, ember skeletons, magma slimes, bats and scorpions. The Emberlord sets the ground under you on fire (watch the orange rings), throws fans of fireballs and calls magma slimes at half health.',loot:'600 gold, 3 gold bars, iron ore, a ruby (once a day); rare: Ember ring (10%)'})}catch(e){}
try{WK_RARE.push(['Ember ring','ja_ember','Emberlord','A ring: your melee hits set monsters on fire.','10% from the Emberlord (Cinderdeep, Ashfall).'],
  ['Stone sledgehammer','eq_sledge','Stone Giant','A main-hand hammer: your ultimate becomes Ground Slam (big damage all around you), and it breaks boulders (35-50 stone) and ore boulders.','5% for everyone who fought the Stone Giant, 8% for the top three.']);
 for(const k of['ptoak','ptwil','ptmap','ptyew','ptpine','ptvoid','ptdead'])WK_RARE.push([TLV[k].n+' (pet)',null,'Trees','A little walking tree that follows you around.','1 in 5,000 from '+TLV[k].src.replace(/ \(1 in 5,000\)/,'')+' you chop down.']);
 const tr=WK_RARE.find(r=>r[0]==='Treeling (pet)');if(tr)tr[4]='1 in 5,000 from plain trees you chop down. Every other kind of tree has its own treeling.'}catch(e){}
try{WK_SKILL.Woodcutting+=' On the Shattered Expanse, the purple-leaved trees are Void Trees.';WK_SKILL.Mining+=' With the Stone sledgehammer (from the Stone Giant) you can break boulders and ore boulders.'}catch(e){}
try{WK_RGN['slime:magma']='Magma slime'}catch(e){}
}
