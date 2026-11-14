// ---------------------------------------------------------------- 91. Briarwood: the village of Thornbrook and Thornroot Hollow
// Thornbrook stands on Briarwood's old town site: a ranger lodge, an inn, Hazel's market stall and a well. Ranger Wren,
// Hazel the trader and Old Moss give Briarwood's quests (in the Quests screen with the other villages), Hazel sells
// supplies and buys anything, and monsters keep out of the village. Thornroot Hollow, a six-floor root-choked cave in the
// south-west, ends at the lair of the Thornheart, a huge walking tree that wakes once a day. It throws roots up from the
// ground (watch the green rings) and calls briar wolves when it's hurt. Its rare drop is the Thorn amulet: anything that
// hits you gets hurt back.
{
const BW={town:null,npcs:[],sure:null,bossDay:-1};window.SQBW=BW;
// ---- quests (the village quest system) ----
SQ_SIDE.briarwood={index:0,on:false,k:0,completed:false};SQTOWN.briarwood='Thornbrook';
SIDE_QS.briarwood=[
 {n:'Oak for the Stalls',d:'Bring Hazel 10 oak logs for new market stalls.',type:'give',item:'oaklog',amt:10,r:{g:220,xp:[1,500]},giver:'Hazel',start:'My stall\'s falling apart and the oaks here are the best wood on the sea.',finish:'Beautiful grain. These will last for years!',req:[1,15]},
 {n:'Briar Wolves',d:'Defeat 8 briar wolves on Briarwood Isle.',type:'kill',item:'briarwolf',amt:8,r:{g:320,xp:[0,700]},giver:'Wren',start:'The briar wolves hunt in pairs and they\'re getting bold. Thin them out.',finish:'The trails are quieter already. Good work.'},
 {n:'Pike for Supper',d:'Bring Old Moss 5 raw pike from Briarwood\'s waters.',type:'give',item:'pike',amt:5,r:{g:260,xp:[9,600]},giver:'Old Moss',start:'Nothing like fresh pike from Thornwater. My old knees won\'t take me there any more.',finish:'Ahh, that smell! Just like when I was young.',req:[9,15]},
 {n:'The Thornheart',d:'Defeat the Thornheart at the bottom of Thornroot Hollow.',type:'dungeonboss',item:'thornheart',amt:1,r:{g:900,xp:[0,1600]},giver:'Wren',start:'Something old is stirring under the roots in the south-west. Six floors down. Be careful.',finish:'The forest breathes easier. Thornbrook owes you.',note:'Attack 25 recommended. Bring food.'}];
// ---- the village layout (on the reserved town site) ----
const LOOK={Wren:{sk:1,hs:2,hc:1,sh:3,pn:2,ht:2,hcol:3,so:3},Hazel:{sk:0,hs:4,hc:4,sh:5,pn:1,ht:0,hcol:1,so:2},'Old Moss':{sk:2,hs:1,hc:6,sh:1,pn:3,ht:1,hcol:2,so:1}};
const SAYS={Wren:['Keep your blade sharp out there.','The wolves come out more at night.','Thornroot Hollow is down in the south-west.'],
 Hazel:['Fresh supplies! Potions, arrows, seeds!','I\'ll buy whatever you drag out of the forest.','Oak, willow, pike... it all sells.'],
 'Old Moss':['This island was all forest once. Still mostly is.','The Thornheart is older than the village.','Sit a while. Rest your feet.']};
function bwSetup(R){if(R.region!=='briarwood'||R._bw)return;const site=R.reserved.find(q=>(q.kind||q.t||q.id)==='town');if(!site)return;R._bw=1;
 const x0=site.x,y0=site.y,W=R.w,set=(x,y,t)=>{if(x>0&&y>0&&x<W-1&&y<R.h-1&&R.tiles[y*W+x]!==0)R.tiles[y*W+x]=t};
 // clear the site, lay a dirt square and paths
 for(let y=y0;y<y0+site.h;y++)for(let x=x0;x<x0+site.w;x++){const it=rgObjAt(R,x,y);if(it){it.gone=true;rgCellDel(R,it);R.solid.delete(y*W+x)}if(R.tiles[y*W+x]!==0&&R.tiles[y*W+x]!==11)R.tiles[y*W+x]=y%3&&x%4?2:2}
 for(let x=x0+1;x<x0+site.w-1;x++){set(x,y0+6,14);set(x,y0+7,14)}for(let y=y0+3;y<y0+site.h;y++){set(x0+8,y,14);set(x0+9,y,14)}
 const items=[],solidAt=(x,y)=>R.solid.add(y*W+x),add=it=>{items.push(it);R.items.push(it);try{rgCellAdd(R,it)}catch(e){}};
 // buildings: the ranger lodge (left) and the Sleepy Fern inn (right); their doors are just painted on
 const blds=[{tx:x0+1,ty:y0+2,w:5,wall:'#c8a878',roof:'#3e7a3a',name:'Ranger Lodge'},{tx:x0+11,ty:y0+2,w:7,wall:'#d8c098',roof:'#7a4a2a',name:'The Sleepy Fern'}];
 for(const b of blds){add({t:'bwbld',b,x:b.tx+(b.w>>1),y:b.ty+1,w:b.w,h:2});for(let dy=0;dy<2;dy++)for(let dx=0;dx<b.w;dx++)solidAt(b.tx+dx,b.ty+dy)}
 // Hazel's stall, the well, two lamps, the village sign
 add({t:'bwstall',x:x0+3,y:y0+9,w:3,h:1});for(let dx=0;dx<3;dx++)solidAt(x0+3+dx,y0+9);
 add({t:'bwwell',x:x0+13,y:y0+9});solidAt(x0+13,y0+9);
 for(const[a,b]of[[x0+7,y0+5],[x0+10,y0+8]]){add({t:'bwlamp',x:a,y:b});solidAt(a,b)}
 add({t:'bwsign',x:x0+10,y:y0+11});solidAt(x0+10,y0+11);
 // the people
 BW.npcs=[{id:'Wren',x:(x0+3)*16+8,y:(y0+4)*16+10,role:'quests'},{id:'Hazel',x:(x0+4)*16+8,y:(y0+8)*16+10,role:'shop'},{id:'Old Moss',x:(x0+14)*16+8,y:(y0+4)*16+10,role:'elder'}];
 for(const n of BW.npcs){n.town='briarwood';n.hx=n.x;n.hy=n.y;const it={t:'bwnpc',n,x:n.x/16,y:n.y/16};add(it)}
 BW.town={x0,y0,w:site.w,h:site.h};
 // a landmark, so it shows on the maps and gets "discovered"
 if(!R.lms.some(l=>l.id==='thornbrook'))R.lms.push({id:'thornbrook',name:'Thornbrook',x:x0+9,y:y0+6});LM_NAMES.thornbrook='Thornbrook';LM_NAMES.thornroot='Thornroot Hollow'}
{const _lr=loadRegion;loadRegion=function(id,want,ret){const ok=_lr(id,want,ret);try{const R=SCENE&&SCENE.room;if(ok&&R&&R.region==='briarwood'){bwSetup(R);const d=R.useItems.find(u=>u.kind==='bwroot');if(d&&!R.lms.some(l=>l.id==='thornroot'))R.lms.push({id:'thornroot',name:'Thornroot Hollow',x:d.x,y:d.y})}}catch(e){console.warn(e)}return ok}}
const bwR=()=>{const R=SCENE&&SCENE.room;return R&&R.region==='briarwood'&&R._bw?R:null};
const inTown=(x,y)=>{const T=BW.town;return T&&x>=(T.x0-1)*16&&x<(T.x0+T.w+1)*16&&y>=(T.y0-1)*16&&y<(T.y0+T.h+1)*16};
const bwNear=()=>{if(!bwR())return null;let best=null,bd=26;for(const n of BW.npcs){const d=Math.hypot(n.x-P.x,n.y-P.y);if(d<bd){bd=d;best=n}}return best};
// ---- drawing ----
{const _df=drawFurn;drawFurn=function(it,tm){if(!it||typeof it.t!=='string'||it.t.slice(0,2)!=='bw')return _df(it,tm);const x=it.x*16,y=it.y*16;
  if(it.t==='bwbld'){const b=it.b;try{drBld({k:'home',w:b.w,wall:b.wall,roof:b.roof,sc:null,tx:b.tx,ty:b.ty},tm)}catch(e){}
   const X0=b.tx*16,w=b.w*16,base=(b.ty+2)*16,tw=b.name.length*4+8,sx=Math.round(X0+w/2-tw/2);g.save();g.font='700 6px '+PF;g.fillStyle='#3a2414';g.fillRect(sx-1,base-35,tw+2,10);g.fillStyle='#f4e8c8';g.fillRect(sx,base-34,tw,8);g.fillStyle='#3a2414';g.textAlign='center';g.textBaseline='middle';g.fillText(b.name,X0+w/2,base-29.5);g.restore();return}
  if(it.t==='bwstall'){const K='#181018';shd(x+24,y+15,46);Rg(x-1,y-2,50,18,K);Rg(x,y-1,48,16,'#8a5a30');Rg(x,y-1,48,3,'#a8743c');for(const[a,c]of[[4,'#e84850'],[12,'#f8c048'],[20,'#78c050'],[28,'#e88838'],[36,'#a878e0']])Rg(x+a,y+4,5,4,c);
   for(const a of[1,45])Rg(x+a,y-22,3,22,'#6a4224');Rg(x-3,y-27,54,8,K);for(let k=0;k<9;k++)Rg(x-2+k*6,y-26,6,6,k%2?'#f4f0e8':'#3e8a3a');for(let k=0;k<9;k++)Rg(x-2+k*6,y-20,6,2,k%2?'#d8d0c0':'#2e6a2a');return}
  if(it.t==='bwwell'){try{drawWell(it.x,it.y)}catch(e){}return}
  if(it.t==='bwlamp'){try{drawLamp(it.x,it.y,tm)}catch(e){}if(dark()>.15){g.fillStyle='rgba(255,210,120,.16)';g.beginPath();g.arc(x+8,y-14,26,0,6.283);g.fill()}return}
  if(it.t==='bwsign'){Rg(x+7,y-2,2,14,'#5a3a1e');Rg(x-2,y-12,20,11,'#181018');Rg(x-1,y-11,18,9,'#b8925a');Rg(x-1,y-11,18,1,'#e8c890');g.save();g.font='700 5px '+PF;g.fillStyle='#3a2414';g.textAlign='center';g.textBaseline='middle';g.fillText('THORNBROOK',x+8,y-6.5);g.restore();return}
  if(it.t==='bwnpc'){const n=it.n,near=Math.hypot(n.x-P.x,n.y-P.y)<60,dir=near?(Math.abs(P.x-n.x)>Math.abs(P.y-n.y)?2:P.y<n.y?1:0):0,fl=near&&P.x<n.x;shd(n.x,n.y+6,12);GC=g;
   try{cP(LOOK[n.id],dir,0,Math.round(n.x),Math.round(n.y),fl)}catch(e){}if(SQ_SIDE.briarwood&&(()=>{const q=sqCur('briarwood');return q&&q.giver===n.id&&(!SQ_SIDE.briarwood.on||sqReady('briarwood'))})()){const bob=Math.round(Math.sin(tm*4));Rg(n.x-2,n.y-34+bob,4,8,'#181018');Rg(n.x-1,n.y-33+bob,2,5,'#f8d048');Rg(n.x-1,n.y-27+bob,2,1,'#f8d048')}
   const nm=n.id;g.save();g.font='700 6px '+PF;g.textAlign='center';g.textBaseline='bottom';g.lineWidth=2;g.strokeStyle='#181018';g.strokeText(nm,n.x,n.y-22);g.fillStyle='#e8ffe0';g.fillText(nm,n.x,n.y-22);g.restore();return}
  return _df(it,tm)}}
// ---- talking: TALK / T / ✕ next to them ----
function bwOpen(n){BW.npc=n;BW.sure=null;shop='bwnpc';pnOpen=true;ptab=2;jx=jy=0;fromMenu=false;pn.style.display='block';rPn();sfx('talk')}
{const _t=talk;talk=function(){if(!pnOpen&&!menuOpen&&!dead){const n=bwNear();if(n){bwOpen(n);return}}return _t()}}
tk.addEventListener('touchstart',e=>{if(pnOpen||menuOpen||dead)return;const n=bwNear();if(n){e.preventDefault();e.stopImmediatePropagation();bwOpen(n)}},{passive:false,capture:true});
{const _pu=window.SQPADUSE;window.SQPADUSE=()=>!!bwNear()||!!(_pu&&_pu())}
let tkMine=false;{const _u=upd;upd=function(dt){_u(dt);const n=!pnOpen&&!menuOpen&&!dead?bwNear():null;
  if(n){tk.style.display='flex';const lab='TALK'+(isPC?'<small>T</small>':(typeof GPON!=='undefined'&&GPON?'<small>✕</small>':''));if(tk.innerHTML!==lab)tk.innerHTML=lab;tkMine=true}else if(tkMine){tkMine=false;if(!pnOpen)tk.style.display='none'}
  // monsters keep out of the village
  const R=bwR();if(R&&BW.town)for(const m of en)if(!m.dead&&!m.big&&!m._rp&&inTown(m.x,m.y)){m.dead=1;m.dropped=1}}}
const SHOPBW=[{n:'Healing potion',c:180,k:'pot_heal',m:1},{n:'20 arrows',c:30,k:'arrow',m:20},{n:'10 bait',c:15,k:'bait',m:10},{n:'5 wheat seeds',c:6,k:'wheatseed',m:5},{n:'5 carrot seeds',c:14,k:'carrotseed',m:5,lv:[11,5]},{n:'Fire kit (3 wood + 1 stone)',c:12,kit:1}];
window.SHOPBW=SHOPBW;// (161b/162 edit and add to it from the Dev Suite)
function bwHTML(){const n=BW.npc;if(!n)return'';const line=SAYS[n.id][Math.floor(performance.now()/7000)%SAYS[n.id].length];
 let h='<div class="tl">'+esc(n.id)+'</div><div class="qc"><p>"'+esc(n.role==='shop'?line:n.role==='quests'?line:line)+'"</p><small>'+(n.role==='shop'?'Trader of Thornbrook':n.role==='quests'?'Ranger of Thornbrook':'Village elder')+'</small></div>';
 try{h+=sideCard(n)}catch(e){}
 if(n.role==='elder'&&!(sqCur('briarwood')&&sqCur('briarwood').giver===n.id))h+='<div class="qc" style="margin-top:8px"><p>"Thornroot Hollow lies to the south-west. Six floors under the roots. At the bottom sleeps the Thornheart: it wakes every day, and it does not like visitors."</p></div>';
 if(n.role==='shop'){h+='<div class="tl" style="margin-top:12px">Buy</div><div class="qc"><small>Gold: '+GLD+'</small></div>';
  SHOPBW.forEach((it,i)=>{if(it.lv&&lvOf(it.lv[0])<it.lv[1])return;h+='<button class="sb" data-bw="b'+i+'" style="opacity:'+(GLD>=it.c?1:.45)+'">'+esc(it.n)+'<br><small>'+it.c+' gold</small></button>'});
  h+='<div class="tl" style="margin-top:12px">Sell</div>';let any=0;for(const k in SELLP){const c=inv[k]|0;if(c<=0)continue;any=1;h+='<button class="sb" data-bw="s'+k+'">Sell all '+esc(SN[k]||INAME[k]||k)+' ('+c+')<br><small>+'+c*SELLP[k]+' gold</small></button>'}
  if(!any)h+='<div class="tl" style="font-weight:400;opacity:.6">Nothing to sell</div>'}
 return h}
{const _r=rPn;rPn=function(){if(ptab===2&&shop==='bwnpc'&&BW.npc){try{panelChrome('')}catch(e){}pbd.innerHTML=bwHTML();return}_r()}}
{const _oc=pbd.onclick;pbd.onclick=e=>{if(shop==='bwnpc'&&BW.npc){const b=e.target.closest('[data-bw]');if(b){const a=b.dataset.bw;
    if(a[0]==='b'){const it=SHOPBW[+a.slice(1)];if(!it)return;if(GLD<it.c){say('Not enough gold');sfx('swish');return}GLD-=it.c;if(it.kit){inv.wood=(inv.wood|0)+3;inv.stone=(inv.stone|0)+1}else inv[it.k]=(inv[it.k]|0)+it.m;say('Bought '+it.n+'.');sfx('coin')}
    else{const k=a.slice(1),c=inv[k]|0;if(c>0){const v=c*SELLP[k];GLD+=v;inv[k]=0;say('Sold for '+v+' gold');sfx('coin')}}try{svg()}catch(_){}saveLocal(true);rPn();return}
   const q=e.target.closest('.xb');if(q&&/^sq_/.test(q.dataset.a||'')){sideAct(q.dataset.a.slice(3),BW.npc);saveLocal(true);rPn();return}}return _oc(e)}}
{const _cp=closePanel;closePanel=function(){if(shop==='bwnpc'){BW.npc=null;shop=null}return _cp()}}
// quest progress: briar wolves anywhere on Briarwood
{const _ed=enemyDrop;enemyDrop=function(n){_ed(n);if(n&&n.type==='wolf'&&n.rv==='briar'&&!n._bwq){n._bwq=1;sqEvent('kill','briarwolf');saveLocal(true)}}}
if(typeof killEnemy==='function'){const _ke=killEnemy;killEnemy=function(n,...a){const r=_ke(n,...a);try{if(n&&n.dead&&n.type==='wolf'&&n.rv==='briar'&&!n._bwq){n._bwq=1;sqEvent('kill','briarwolf')}}catch(e){}return r}}

// ---- the Thornheart (floor 6 of Thornroot Hollow) ----
const TH_HP=180;let THDAY=-1;
{const _da=dArrive;dArrive=function(R,from){_da(R,from);const D=R.dun;if(!D||D.kind!=='bwroot'||D.f!==6||!D.boss||D._th)return;D._th=1;if(THDAY===today()){say('Thornroot Hollow - the Thornheart\'s lair. It sleeps until tomorrow.');return}
  const[bx,by]=D.boss;const b={x:bx*16+8,y:by*16+8,hp:TH_HP,mhp:TH_HP,kx:0,ky:0,type:'thorn',big:1,rcd:3,scd:0,half:false,roots:[]};R.mobs.push(b);BW.boss=b;setTimeout(()=>{try{sfx('roar')}catch(e){}},300)}}
{const _u=upd;upd=function(dt){const pre=new Map();for(const n of en)if(n.type==='thorn'&&!n.dead)pre.set(n,[n.x,n.y]);const hp0=P.hp;_u(dt);
  for(const[n,[x,y]]of pre){if(n.dead)continue;n.x=x+(n.x-x)*.45;n.y=y+(n.y-y)*.45;n.kx*=.3;n.ky*=.3;n.t=(n.t||0)+dt;
   // roots: three green rings appear near you, then thorny roots burst up out of them
   if((n.rcd-=dt)<=0){n.rcd=n.half?2.6:3.6;for(let k=0;k<3;k++){const a=Math.random()*6.283,r=k?12+Math.random()*30:0;n.roots.push({x:P.x+Math.cos(a)*r,y:P.y+4+Math.sin(a)*r*.7,t:1.1,hit:false})}}
   for(const q of n.roots){q.t-=dt;if(q.t<=0&&!q.hit){q.hit=true;if(Math.hypot(P.x-q.x,P.y+4-q.y)<14&&hurt<=0&&!(typeof ROLLT!=='undefined'&&ROLLT>0)&&!dead){P.hp--;hurt=1.2;say('Roots burst from the ground!');try{sfx('hurt')}catch(e){}}}}
   n.roots=n.roots.filter(q=>q.t>-.5);
   // at half its life it calls the wolves of the wood
   if(!n.half&&n.hp<=n.mhp/2){n.half=true;n.scd=0;say('The Thornheart howls, and the wolves of the wood answer!');msgT=3}
   if(n.half&&(n.scd-=dt)<=0){n.scd=14;const alive=en.filter(o=>o.summon&&!o.dead).length;for(let k=alive;k<2;k++){const a=Math.random()*6.283,wx=n.x+Math.cos(a)*30,wy=n.y+Math.sin(a)*24;if(!solid(wx,wy)){const w=rgMake('wolf:briar',22,wx,wy);w.summon=1;w._prov=9;en.push(w)}}}}
  // its reward, once
  {const n=BW.boss;if(n&&n.hp<=0&&!n._rew){BW.boss=null;n._rew=1;n.dead=1;n.dropped=1;THDAY=today();try{saveLocal(true)}catch(e){}
   GLD+=450;inv.oaklog=(inv.oaklog|0)+6;inv.willowlog=(inv.willowlog|0)+4;inv.emerald=(inv.emerald|0)+1;addXp(0,600);addXp(7,300);
   let rare='';if(Math.random()<.1||window.SQTHORNDROP){inv.ja_thorn=(inv.ja_thorn|0)+1;rare=' and a THORN AMULET!'}
   sqEvent('dungeonboss','thornheart');say('The Thornheart crumbles into the earth. +450 gold, oak and willow logs, an emerald'+(rare||'.'));msgT=6;try{sfx('quest');if(rare)setTimeout(()=>sfx('level'),300)}catch(e){}}}
  // the Thorn amulet: whatever hurts you gets hurt back
  if(P.hp<hp0&&!dead&&window.SQJW&&SQJW.neck==='ja_thorn'){let best=null,bd=48;for(const m of en){if(m.dead)continue;const d=Math.hypot(m.x-P.x,m.y-P.y);if(d<bd){bd=d;best=m}}
   if(best){best.hp-=4;try{DMGS.push({x:best.x,y:best.y-16,v:'4',t:0,c:'#78e060',sc:curScene()})}catch(e){}if(best.hp<=0&&!best.dead){if(typeof killEnemy==='function'&&best.type!=='thorn')killEnemy(best,'thorn')}}}}}
// how it looks: a hulking tree with glowing eyes and thorny arms
function drawThorn(n,tm){const x=Math.round(n.x),y=Math.round(n.y),K='#181018',hit=Math.abs(n.kx)+Math.abs(n.ky)>.3,sw=Math.round(Math.sin((n.t||0)*3)*2),B=hit?'#ffffff':'#6a4424',Bd=hit?'#e0e0e0':'#4a2c14',L=hit?'#ffffff':'#3e8a32',Ld='#2a6424';
 for(const q of n.roots){if(q.t>0){const a=.4+.4*Math.sin(tm*14);g.strokeStyle='rgba(120,230,90,'+a+')';g.lineWidth=1.5;g.beginPath();g.ellipse(q.x,q.y,13,7,0,0,6.283);g.stroke()}else{const h=Math.round(14*Math.min(1,-q.t*5+1));for(const dx of[-6,0,6]){Rg(q.x+dx-1,q.y-h,3,h,K);Rg(q.x+dx,q.y-h+1,1,h-1,'#7a5030');Rg(q.x+dx-1,q.y-h-1,1,1,'#58a040')}}}
 shd(x,y+8,40);
 // legs (roots)
 for(const s of[-1,1]){Rg(x+s*8-4,y-4,8,12,K);Rg(x+s*8-3,y-3,6,10,Bd);Rg(x+s*8-6+(s>0?4:0),y+6,8,3,K)}
 // trunk
 Rg(x-13,y-38,26,36,K);Rg(x-12,y-37,24,34,B);for(const c of[-8,-2,5])Rg(x+c,y-36,1,32,Bd);Rg(x-12,y-37,3,34,Bd);
 // face
 Rg(x-8,y-30,6,4,K);Rg(x+2,y-30,6,4,K);const glow=hit?'#ffffff':'#a8ff78';Rg(x-7,y-29,4,2,glow);Rg(x+3,y-29,4,2,glow);Rg(x-5,y-20,10,3,K);for(let k=0;k<4;k++)Rg(x-4+k*3,y-20,1,2,'#d8f0a0');
 // thorny arms
 for(const s of[-1,1]){const ax=x+s*13,ay=y-30+sw*s;Rg(Math.min(ax,ax+s*14),ay,15,5,K);Rg(Math.min(ax,ax+s*14)+1,ay+1,13,3,B);for(let k=0;k<4;k++)Rg(ax+s*(3+k*3),ay-2,1,2,K);Rg(ax+s*14-(s>0?0:4),ay+3,4,8,K);Rg(ax+s*14-(s>0?-1:3),ay+4,2,6,B)}
 // crown of leaves
 for(const[cx,cy,r]of[[0,-44,15],[-12,-40,10],[12,-40,10],[-6,-50,9],[7,-50,9]]){g.fillStyle=K;g.beginPath();g.arc(x+cx,y+cy,r+1,0,6.283);g.fill()}
 for(const[cx,cy,r]of[[0,-44,15],[-12,-40,10],[12,-40,10],[-6,-50,9],[7,-50,9]]){g.fillStyle=L;g.beginPath();g.arc(x+cx,y+cy,r,0,6.283);g.fill();g.fillStyle=Ld;g.fillRect(x+cx-r+2,y+cy+r-4,r*2-4,2)}
 for(const[a,b]of[[-8,-50],[4,-46],[-14,-42],[10,-52]])Rg(x+a,y+b,3,2,'#78c858');for(const[a,b]of[[-3,-56],[9,-44],[-12,-36]])Rg(x+a,y+b,2,2,'#e84858');
 // health bar
 const w=40,f=Math.max(0,n.hp/n.mhp);Rg(x-w/2-1,y-66,w+2,5,K);Rg(x-w/2,y-65,w,3,'#3a1a1a');Rg(x-w/2,y-65,Math.round(w*f),3,'#78d050')}
{const _pS=pS;pS=function(n,tm){if(n&&n.type==='thorn')return drawThorn(n,tm);return _pS(n,tm)}}
// saving the boss day
{const _sn=snap;snap=function(){const s=_sn();s.thd=THDAY;return s}}
{const _ap=applySave;applySave=function(S){_ap(S);THDAY=isFinite(S&&S.thd)?+S.thd:-1}}
try{if(typeof KNOWN49!=='undefined'&&KNOWN49.add)KNOWN49.add('thd')}catch(e){}

// ---- the Thorn amulet (the Thornheart's rare drop) ----
if(window.SQJK){SQGEMC.thorn=['#78d050','#2a6a20'];const j={k:'ja_thorn',n:'Thorn amulet',s:'neck',g:'thorn',v:4000,d:'Anything that hurts you takes 4 damage back.'};SQJK[j.k]=j;
 INVK.push(j.k);if(typeof EXTRA_BAG!=='undefined')EXTRA_BAG.push(j.k);INAME[j.k]=j.n;IDESC[j.k]='Amulet (rare, from the Thornheart): '+j.d+' Wear it from the Bag.';SELLP[j.k]=1500;SN[j.k]=j.n+'s';if(typeof SHORT!=='undefined')SHORT[j.k]=j.n.toLowerCase()}

// ---- the wiki ----
try{WK_DUN.push({n:'Thornroot Hollow',w:'South-west Briarwood Isle',boss:'The Thornheart',bhp:TH_HP,d:'Six floors of roots and ruins: moss slimes, briar wolves, bats and skeletons. The Thornheart throws roots up out of the ground (watch the green rings) and calls briar wolves at half health.',loot:'450 gold, oak and willow logs, an emerald (once a day); rare: Thorn amulet (10%)'},
  {n:'Ironcrest mines and caves',w:'Ironcrest Highlands: two mines by the mining camps, two caves in the cliffs',boss:'None',bhp:0,d:'Six floors each, packed with ore veins (gold, mithril and adamant deeper down), chests, snow wolves, rime skeletons, frost slimes and bats. Campfires work inside.',loot:'Ore and chest loot'})}catch(e){}
try{WK_RARE.push(['Thorn amulet','ja_thorn','Thornheart','An amulet: anything that hurts you takes 4 damage back.','10% from the Thornheart (Thornroot Hollow, Briarwood).'])}catch(e){}
}
