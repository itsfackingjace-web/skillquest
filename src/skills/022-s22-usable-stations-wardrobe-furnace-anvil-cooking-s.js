// ---------------------------------------------------------------- 22. Usable stations: wardrobe, furnace, anvil, cooking stove, planter, training dummy
// Craft them in the Craft tab (Building) and place them inside your house or outside. Face one and press HIT
// (or USE) to work with it. Each station's screen also has a button to pick it back up.
const STNS=[
 {k:'wardrobe',n:'Wardrobe',c:{wood:12},req:6,xp:60,hp:2,d:'Change your hair, clothes and colors any time.'},
 {k:'furnace',n:'Furnace',c:{stone:14,wood:4},req:10,xp:80,hp:4,d:'Smelt iron ore into bars, like the blacksmith\'s furnace.'},
 {k:'anvil',n:'Anvil',c:{ibar:3,stone:4},req:12,xp:90,hp:4,d:'Forge daggers and armor from bars, like the blacksmith\'s anvil.'},
 {k:'stove',n:'Cooking stove',c:{stone:8,ibar:1},req:8,xp:70,hp:3,d:'Cook and bake indoors. Burns food less often than a campfire.'},
 {k:'planter',n:'Berry planter',c:{wood:6,berry:3,stone:2},req:4,xp:30,hp:2,d:'A berry bush in a box. Pick fresh berries from it every day.'},
 {k:'dummy',n:'Training dummy',c:{wood:8,berry:2},req:3,xp:25,hp:2,d:'Hit it to practice. Gives Attack XP up to level 30.'}];
const STN=new Set(STNS.map(s=>s.k));
for(const s of STNS){BREC.push({k:s.k,n:s.n,c:s.c,req:s.req,xp:s.xp,hp:s.hp});BK.push(s.k);BHP[s.k]=s.hp;INVK.push(s.k);INAME[s.k]=s.n;IDESC[s.k]=s.d+' Place it in your house or outside, then face it and press HIT.'}
// reload saved pieces now that these types exist (pieces moved off town land were already refunded)
let PLANTD={};

// --- art ---
function drawStation(t,x,y,st,tm){const x0=x*16,y0=y*16;
 if(t==='furnace'||t==='anvil')return drawFurn({t,x,y},tm);
 if(t==='wardrobe'){shd(x0+8,y0+14,16);Rg(x0+1,y0-14,14,30,O);Rg(x0+2,y0-13,12,28,'#a86830');Rg(x0+2,y0-13,12,2,'#c88848');Rg(x0+7,y0-10,2,24,'#7a4a20');Rg(x0+3,y0-10,4,22,'#b87838');Rg(x0+9,y0-10,4,22,'#b87838');
  Rg(x0+5,y0+1,1,2,GD);Rg(x0+10,y0+1,1,2,GD);Rg(x0,y0-16,16,3,O);Rg(x0+1,y0-15,14,1,'#c88848');Rg(x0+2,y0+13,2,3,O);Rg(x0+12,y0+13,2,3,O);return}
 if(t==='stove'){const fl=Math.floor(tm*8)%2;shd(x0+8,y0+14,16);Rg(x0+1,y0-3,14,18,O);Rg(x0+2,y0-2,12,16,'#585e68');Rg(x0+2,y0-2,12,2,'#7a828c');Rg(x0+4,y0+4,8,7,O);Rg(x0+5,y0+5,6,5,fl?'#f88830':'#f8a040');Rg(x0+6,y0+8,4,2,'#f8e060');
  Rg(x0+3,y0-8,10,6,O);Rg(x0+4,y0-7,8,4,'#9098a8');Rg(x0+4,y0-7,8,1,'#c0c8d0');for(let k=0;k<2;k++)Rg(x0+6+k*3+Math.round(Math.sin(tm*2+k*2)),y0-11-((tm*10+k*6)%8),1,2,'rgba(240,240,250,.75)');return}
 if(t==='planter'){const ready=st&&st.ready;shd(x0+8,y0+14,16);Rg(x0+1,y0+5,14,10,O);Rg(x0+2,y0+6,12,8,'#a86830');Rg(x0+2,y0+6,12,1,'#c88848');Rg(x0+2,y0+10,12,1,'#7a4a20');Rg(x0+2,y0+5,12,2,'#5a3820');
  Rg(x0+2,y0-6,12,12,O);Rg(x0+3,y0-5,10,10,'#3c9a38');Rg(x0+4,y0-4,4,3,'#58b848');Rg(x0+9,y0-2,3,3,'#2c7828');
  if(ready)for(const[a,b]of[[4,-3],[9,-4],[6,1],[10,1],[5,-1]]){Rg(x0+a,y0+b,2,2,'#d83040');Rg(x0+a,y0+b,1,1,'#f88090')}return}
 if(t==='dummy'){const w=st&&st.wob>0?Math.round(Math.sin(tm*40)*2):0;shd(x0+8,y0+14,12);Rg(x0+7,y0+2,3,13,O);Rg(x0+8,y0+3,1,12,'#7a4a20');
  Rg(x0+1+w,y0-6,14,4,O);Rg(x0+2+w,y0-5,12,2,'#a86830');Rg(x0+4+w,y0-4,8,10,O);Rg(x0+5+w,y0-3,6,8,'#d8b860');Rg(x0+5+w,y0+1,6,1,'#a88838');
  Rg(x0+5+w,y0-12,6,7,O);Rg(x0+6+w,y0-11,4,5,'#e8d090');Rg(x0+6+w,y0-9,1,1,O);Rg(x0+9+w,y0-9,1,1,O);Rg(x0+7+w,y0-7,2,1,'#a88838');return}}
const plantKey=(inside,i)=>inside?'h'+(SCENE&&SCENE.house?SCENE.house.id:'?')+':'+i:'o'+i;
const _dp22=drawPiece;drawPiece=function(t,x,y,f,ghost,tm){if(!STN.has(t))return _dp22(t,x,y,f,ghost,tm);
 const st=f||{};if(t==='planter'&&!ghost)st.ready=PLANTD[plantKey(true,y*SCENE.room.w+x)]!==today();drawStation(t,x,y,st,tm)};
const _ds22=drawStruct;drawStruct=function(i,s,ghost){if(SCENE||!STN.has(s.t))return _ds22(i,s,ghost);const x=i%N,y=(i/N)|0;if(s.t==='planter'&&!ghost)s.ready=PLANTD[plantKey(false,i)]!==today();drawStation(s.t,x,y,s,performance.now()/1000)};
// --- finding the station you face or stand next to ---
let STATION=null;
function frontStation(){const[x,y]=frontTile();if(SCENE){if(!inHome())return null;const R=SCENE.room;if(x<0||y<0||x>=R.w||y>=R.h)return null;const i=y*R.w+x,f=SCENE.house.furn.get(i);return f&&STN.has(f.t)?{t:f.t,inside:true,i,f}:null}
 const i=y*N+x,s=STR.get(i);return s&&STN.has(s.t)?{t:s.t,inside:false,i,f:s}:null}
function nearStation(){if(SCENE){if(!inHome())return null;const R=SCENE.room;let best=null,bd=24;for(const[i,f]of SCENE.house.furn){if(!STN.has(f.t))continue;const d=Math.hypot(P.x-((i%R.w)*16+8),P.y-(((i/R.w)|0)*16+8));if(d<bd){bd=d;best={t:f.t,inside:true,i,f}}}return best}
 let best=null,bd=24;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=Math.floor(P.x/16)+dx,y=Math.floor(P.y/16)+dy,i=y*N+x,s=STR.get(i);if(!s||!STN.has(s.t))continue;const d=Math.hypot(P.x-(x*16+8),P.y-(y*16+8));if(d<bd){bd=d;best={t:s.t,inside:false,i,f:s}}}return best}
function openStation(o){if(!o)return;if(o.t==='wardrobe'){const ci=document.getElementById('cni');if(ci&&PNAME)ci.value=PNAME;menuOpen=true;jx=jy=0;cm.style.display='flex';document.getElementById('cgo').textContent='DONE';build();rp();sfx('talk');return}
 STATION=o;shop='station';fromMenu=false;pnOpen=true;ptab=2;jx=jy=0;pn.style.display='block';rPn();sfx('talk')}
const _nf22=nearFurn;nearFurn=function(){const r=_nf22();if(r)return r;const s=nearStation();return s&&s.inside?{i:s.i,f:s.f,stn:s}:null};
const _uf22=useFurn;useFurn=function(o){if(o&&o.f&&STN.has(o.f.t)){openStation(o.stn||{t:o.f.t,inside:true,i:o.i,f:o.f});return}_uf22(o)};
const _ns22=nearStruct;nearStruct=function(){const r=_ns22();if(r!==null)return r;const s=nearStation();return s&&!s.inside?s.i:null};
const _us22=useStructure;useStructure=function(i){const s=STR.get(i);if(s&&STN.has(s.t)){openStation({t:s.t,inside:false,i,f:s});return}_us22(i)};
// HIT: use the station you face (the dummy is for hitting)
const _atk22=attack;attack=function(){if(!dead&&!menuOpen&&!pnOpen&&!BUILD&&swing<=0&&!FISH&&!facingNpc()){const o=frontStation();if(o){swing=.25;
  if(o.t==='dummy'){o.f.wob=.3;setTimeout(()=>{o.f.wob=0},300);sfx('hit');if(lvOf(0)<30){addXp(0,4);addXp(7,1);if(!dummyTip){dummyTip=true;say('Practice! The dummy teaches Attack up to level 30. Press USE to pick it up.')}}else say('You\'ve learned all a dummy can teach. Try real enemies!');return}
  openStation(o);return}}_atk22()};
let dummyTip=false;
// --- station screens ---
const row22=(a,label,sub,ok)=>'<button class="sb stb" data-a="'+a+'" style="opacity:'+(ok?1:.45)+'">'+label+'<br><small>'+sub+'</small></button>';
function smithRows(filter){let h='';SM.forEach((r,i)=>{if(!filter(r))return;if(r.arm&&ARM[r.arm[0]]>=r.arm[1])return;const need=Object.entries(r.c),can=lvOf(10)>=r.lv&&!(r.def>lvOf(8))&&need.every(([a,b])=>(inv[a]|0)>=b);
  h+='<div class="gr" style="opacity:'+(can?1:.5)+'"><div class="gi"><b>'+r.n+'</b>'+(r.k?' <small>(have '+(inv[r.k]|0)+')</small>':'')+'<br><small>'+need.map(([a,b])=>b+' '+(IN[a]||a)).join(', ')+' · Smithing '+r.lv+(r.def?' · wear: Defence '+r.def:'')+' · '+r.xp+' xp</small></div><button class="fg" data-i="'+i+'" data-a="1">'+(r.arm?'Forge':'Make')+'</button>'+(r.arm?'':'<button class="fg" data-i="'+i+'" data-a="all">All</button>')+'</div>'});return h}
function stationHTML(o){const S=STNS.find(s=>s.k===o.t);let h='<div class="tl">'+S.n+'</div>';
 if(o.t==='furnace')h+='<div class="tl" style="font-size:12px;font-weight:400;opacity:.75">Smithing level '+lvOf(10)+' · Iron ore: '+(inv.iron|0)+' · Stone: '+(inv.stone|0)+'</div>'+smithRows(r=>!!r.smelt);
 else if(o.t==='anvil')h+='<div class="tl" style="font-size:12px;font-weight:400;opacity:.75">Smithing level '+lvOf(10)+' · Iron bars: '+(inv.ibar|0)+' · Steel bars: '+(inv.sbar|0)+'</div>'+smithRows(r=>!r.smelt);
 else if(o.t==='stove'){h+='<div class="tl" style="font-size:12px;font-weight:400;opacity:.75">Cooking level '+lvOf(4)+'. The stove burns food less often than a fire.</div>';let any=0;
  for(const c of COOKS){const n=inv[c.raw]|0;if(!n)continue;any=1;const ok=lvOf(4)>=c.lv;h+=row22('ck_'+c.raw,'Cook all '+esc(iname(c.raw))+' ('+n+')',ok?c.xp+' xp each':'Needs Cooking '+c.lv,ok)}
  if(!any)h+='<div class="tl" style="font-weight:400;opacity:.6">Nothing to cook. Bring raw meat, fish, wheat, carrots or pumpkins.</div>'}
 else if(o.t==='planter'){const k=plantKey(o.inside,o.i),ready=PLANTD[k]!==today(),n=3+Math.floor(lvOf(11)/10);
  h+=ready?row22('pick','Pick berries','+'+n+' berries · 15 Farming XP',true):'<div class="qc"><p>You picked it today. New berries grow overnight.</p></div>'}
 else if(o.t==='dummy')h+='<div class="qc"><p>Face the dummy and press HIT to practice. Attack level '+lvOf(0)+(lvOf(0)<30?' (it can teach you up to 30).':' (you\'ve outgrown it).')+'</p></div>';
 return h+'<button class="ng stb" data-a="pickup" style="margin-top:16px">Pick up this '+S.n.toLowerCase()+'</button>'}
const _r22=rPn;rPn=function(){if(ptab===2&&shop==='station'&&STATION){panelChrome('');pbd.innerHTML=stationHTML(STATION);return}_r22()};
function stationAct(a){const o=STATION;if(!o)return;
 if(a==='pickup'){const k=plantKey(o.inside,o.i);delete PLANTD[k];closePanel();STATION=null;if(o.inside)pickFurn(o.i);else pickStruct(o.i);return}
 if(a==='pick'){const k=plantKey(o.inside,o.i);if(PLANTD[k]===today())return;PLANTD[k]=today();const n=3+Math.floor(lvOf(11)/10);inv.berry=(inv.berry|0)+n;addXp(11,15);say('Picked '+n+' berries.');sfx('pickup')}
 else if(a.startsWith('ck_')){const c=COOKS.find(q=>q.raw===a.slice(3));if(!c||lvOf(4)<c.lv)return;if((inv[c.raw]|0)>0&&sqDo('cook',inv[c.raw]|0,()=>stationAct(a)))return;let ok=0,burnt=0;
  for(let n1=0;(inv[c.raw]|0)>0&&!(window.SQDO_STEP&&n1>=1);n1++){inv[c.raw]--;const cl=lvOf(4);if(Math.random()<Math.max(.02,(.4-(cl-c.lv)*.02-cl*.004)*.55)){burnt++;addXp(4,5)}else{ok++;inv[c.ck]=(inv[c.ck]|0)+1;addXp(4,c.xp);if(Q.on&&QS[Q.i]&&QS[Q.i].type==='cook')Q.k++}}
  say('Cooked '+ok+(burnt?', burnt '+burnt:'')+'.');sfx('sizzle')}
 saveLocal(true);rPn()}
const _oc22=pbd.onclick;pbd.onclick=e=>{const b=e.target.closest('.stb');if(b){stationAct(b.dataset.a);return}_oc22(e)};
const _cp22=closePanel;closePanel=function(){_cp22();if(shop==='station'){STATION=null;shop=null}};
// --- saving the planters ---
const _sn22=snap;snap=function(){const s=_sn22();s.plant={...PLANTD};return s};
const _ap22=applySave;applySave=function(S){_ap22(S);PLANTD={};if(S.plant&&typeof S.plant==='object')for(const k in S.plant)PLANTD[k]=+S.plant[k]||0};
const _ng22=newGame;newGame=function(){PLANTD={};_ng22()};
// icons
const _icon22=iconURL;iconURL=function(k,col){if(!STN.has(k))return _icon22(k,col);const key='g22'+k;if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
 if(k==='wardrobe'){r(2,0,10,14,'#7a4a20');r(3,1,8,12,'#b87838');r(6,1,2,12,'#7a4a20');r(5,6,1,2,GD);r(8,6,1,2,GD)}
 else if(k==='furnace'){r(2,1,10,12,'#8a7a6a');r(2,4,10,1,'#6a5a4a');r(2,8,10,1,'#6a5a4a');r(4,7,6,5,'#202020');r(5,8,4,4,'#f88830');r(6,10,2,2,'#f8e060')}
 else if(k==='anvil'){r(1,4,12,3,'#a0a8b8');r(1,4,12,1,'#d0d8e0');r(4,7,6,3,'#606878');r(2,10,10,3,'#4a505c')}
 else if(k==='stove'){r(2,4,10,9,'#585e68');r(4,7,6,4,'#f88830');r(3,1,8,3,'#9098a8');r(6,0,1,1,'#e8eef4')}
 else if(k==='planter'){r(1,8,12,5,'#a86830');r(2,2,10,7,'#3c9a38');r(3,3,2,2,'#d83040');r(8,4,2,2,'#d83040');r(5,6,2,2,'#d83040')}
 else{r(6,6,2,8,'#7a4a20');r(1,4,12,2,'#a86830');r(4,5,6,6,'#d8b860');r(5,0,4,4,'#e8d090')}
 return ICONC[key]=c.toDataURL()};
