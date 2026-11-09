// ---------------------------------------------------------------- 83. The Flame Crown (a rare drop from the Flame Wisp)
// A helmet (same defence as a steel helmet, no level needed) shaped as a gold crown with flame-tipped points. While
// you wear it, lighting a campfire calls a little flame wisp to it: it roams around inside the fire's light and
// throws fireballs at monsters that come near (damage grows with Firemaking; they set monsters burning). One wisp
// at a time: a new campfire takes it over. It can't be hurt, and it fades when the fire burns out. Monsters only.
var CROWN=false;
{const add=(k,e,d)=>{EQ[k]=e;EQK.push(k);INVK.push(k);EXTRA_BAG.push(k);INAME[k]=e.n;SELLP[k]=e.v;SN[k]=e.n+'s';SHORT[k]=e.n.toLowerCase();IDESC[k]=d;inv[k]=inv[k]|0};
 add('eq_fcrown',{slot:'helm',n:'Flame crown',ic:'helm',col:'#f8c830',v:3000},'A rare crown from the Flame Wisp. Defence like a steel helmet. While you wear it, your campfires call a little flame wisp that guards the fire.');
 // the crown picture (also its icon)
 const CR=['....y..y..y.','...yry.yr.yr','...oy..oy..o','.G..G..G..G.','.GG.GG.GG.GG','GgGGGRRGGGgG','GGGGGrRGGGGG','DDDDDDDDDDDD'],PAL={y:'#fff070',r:'#ff9020',o:'#f05010',G:'#f8c830',g:'#fff4a0',R:'#e82838',D:'#a87010'};
 // front, side (facing right; mirrored for left) and back
 const CRS=['..y...y..y','.yr..yr.yr','..o...o..o','..G...G..G','.GG..GG.GG','GGgGGGGGRG','GGGGGGGGrG','DDDDDDDDDD'],CRB=CR.map(r=>r.replace(/[Rr]/g,'G'));
 const crownMake=(rows,flip)=>{const w=rows[0].length,c=document.createElement('canvas');c.width=w;c.height=8;const x=c.getContext('2d');rows.forEach((row,j)=>{for(let i=0;i<w;i++){const ch=row[flip?w-1-i:i];if(PAL[ch]){x.fillStyle=PAL[ch];x.fillRect(i,j,1,1)}}});
  const o=document.createElement('canvas');o.width=w+2;o.height=10;const ox=o.getContext('2d'),d=x.getImageData(0,0,w,8).data;ox.fillStyle='#3a1a08';for(let j=0;j<8;j++)for(let i=0;i<w;i++)if(d[(j*w+i)*4+3])for(const[a,b]of[[0,1],[2,1],[1,0],[1,2]])ox.fillRect(i+a,j+b,1,1);ox.drawImage(c,1,1);return o};
 const crownCan=crownMake(CR),crownBack=crownMake(CRB),crownR=crownMake(CRS),crownL=crownMake(CRS,true);
 let ICON=null;const _ic=iconURL;iconURL=function(k,col){if(k!=='eq_fcrown')return _ic(k,col);if(!ICON){const c=document.createElement('canvas');c.width=14;c.height=14;c.getContext('2d').drawImage(crownCan,0,2);ICON=c.toDataURL()}return ICON};
 if(typeof eqIcon==='function'){const _ei=eqIcon;eqIcon=function(k){return k==='eq_fcrown'?iconURL(k):_ei(k)}}
 // wearing it: a tier-3 helmet as far as the game's stats are concerned
 const _occ=occ;occ=function(slot){if(slot==='helm'&&CROWN)return'eq_fcrown';return _occ(slot)};
 const _ss=setSlot;setSlot=function(slot,k){_ss(slot,k);if(slot==='helm'){CROWN=k==='eq_fcrown';if(CROWN){ARM.helm=3;CLS.helm=null}}};
 const _wu=watchUpgrades;watchUpgrades=function(){const was=CROWN;_wu();if(was&&ARM.helm!==3){if((inv.eq_helm3|0)>0)inv.eq_helm3--;inv.eq_fcrown=(inv.eq_fcrown|0)+1;CROWN=false}};
 const _sn=snap;snap=function(){const s=_sn();if(CROWN)s.fcr=1;return s};
 const _ap=applySave;applySave=function(S){_ap(S);CROWN=!!(S&&S.fcr)&&ARM.helm===3};
 const _ng=newGame;newGame=function(){CROWN=false;_ng()};
 // how it looks: hair showing, the crown on top (for you and everyone who sees you)
 const _gc=gearCH;gearCH=function(){const c=_gc();if(CROWN&&!(typeof HIDEH!=='undefined'&&HIDEH)){c.ht=0;delete c.mh;delete c.dyh;c.fc=1}return c};
 const FCC=new Map();const _ks=kitSprite;kitSprite=function(ch,dir,st,fl){const c=_ks(ch,dir,st,fl);if(!ch||!ch.fc)return c;const key=JSON.stringify(ch)+'|'+dir+'|'+st+'|'+(fl?1:0);let o=FCC.get(key);if(o)return o;
  const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let top=0;find:for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>0){top=y;break find}
  // centre the crown on the head (the widest part of the top few rows)
  let mn=99,mx=-1;for(let y=top;y<Math.min(c.height,top+6);y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>0){if(x<mn)mn=x;if(x>mx)mx=x}
  const cw=dir===1?crownBack:dir===2?(fl?crownL:crownR):crownCan,cx=Math.round((mn+mx+1)/2-cw.width/2);
  o=document.createElement('canvas');o.width=c.width;o.height=c.height;const x=o.getContext('2d');x.drawImage(c,0,0);x.drawImage(cw,Math.max(0,Math.min(c.width-cw.width,cx)),Math.max(0,top-6));if(FCC.size>300)FCC.clear();FCC.set(key,o);return o};
 window.SQCROWN=()=>CROWN}
// ---- the little flame wisp ----
const FWP={f:null,x:0,y:0,tx:0,ty:0,rt:0,cd:0,balls:[],t:0};const FW_R=64;
const fwDmg=()=>2+Math.floor(lvOf(5)/20);
{const _f=fire;fire=function(){const before=new Set(fires),had=!!(FWP.f&&fires.includes(FWP.f)&&FWP.f.life>0);_f();const f=fires.find(x=>!before.has(x)&&!x._rp&&!x._glow);if(f&&CROWN){FWP.f=f;FWP.x=f.x+14;FWP.y=f.y-12;FWP.rt=0;FWP.balls.length=0;
   for(let k=0;k<16;k++){const a=k/16*6.283;part(f.x,f.y-6,Math.cos(a)*60,Math.sin(a)*40-30,.5,k%2?'#f8e060':'#f88830',-20,2)}say(had?'Your flame wisp moves to the new fire.':'A little flame wisp answers your crown!')}}}
const fwLive=()=>!!(FWP.f&&fires.includes(FWP.f)&&FWP.f.life>0);
{const _u=upd;upd=function(dt){_u(dt);if(menuOpen||pnOpen)return;if(!fwLive()){if(FWP.f&&!fires.includes(FWP.f)&&FWP.f.life<=0)FWP.f=null;FWP.balls.length=0;return}
  const f=FWP.f;FWP.t+=dt;
  // roam: drift to a new spot inside the fire's light every couple of seconds
  if((FWP.rt-=dt)<=0){FWP.rt=1.5+Math.random()*2;const a=Math.random()*6.283,r=10+Math.random()*(FW_R-18);FWP.tx=f.x+Math.cos(a)*r;FWP.ty=f.y-8+Math.sin(a)*r*.7}
  const dx=FWP.tx-FWP.x,dy=FWP.ty-FWP.y,d=Math.hypot(dx,dy);if(d>1){const sp=Math.min(d,28*dt);FWP.x+=dx/d*sp;FWP.y+=dy/d*sp}
  // shoot at the nearest monster inside the light
  if((FWP.cd-=dt)<=0){let best=null,bd=1e9;for(const n of en){if(n.dead||n._wb)continue;const df=Math.hypot(n.x-f.x,n.y-f.y);if(df>FW_R+16)continue;const dd=Math.hypot(n.x-FWP.x,n.y-FWP.y);if(dd<bd){bd=dd;best=n}}
   if(best){FWP.cd=1.2;FWP.balls.push({x:FWP.x,y:FWP.y-2,n:best,t:0});try{sfx('cfire')}catch(e){}}else FWP.cd=.3}
  for(let i=FWP.balls.length-1;i>=0;i--){const b=FWP.balls[i],n=b.n;b.t+=dt;if(!n||n.dead||b.t>2){FWP.balls.splice(i,1);continue}const ex=n.x-b.x,ey=n.y-6-b.y,el=Math.hypot(ex,ey);
   if(el<5){FWP.balls.splice(i,1);spellHit({el:'fire',sc:curScene()},n,fwDmg());continue}const sp=Math.min(el,150*dt);b.x+=ex/el*sp;b.y+=ey/el*sp;if(Math.random()<.5)part(b.x,b.y,(Math.random()-.5)*20,-10,.25,'#f8a030',-20,1)}}}
// drawing (above the world, like the ultimate effects)
const FWC={};const fwCan=fr=>FWC[fr]||(window.SQWBART&&(FWC[fr]=SQWBART.wisp(fr,'s')));
function fwDraw(x,y,tm,glow){const c=fwCan(Math.floor(tm/.09)%4);if(!c)return;const bob=Math.round(Math.sin(tm*3+x*.1)*1.5),wx=Math.round(x),wy=Math.round(y+bob);
 if(glow){const gl=g.createRadialGradient(wx,wy,1,wx,wy,16);gl.addColorStop(0,'rgba(255,190,80,.4)');gl.addColorStop(1,'rgba(255,120,30,0)');g.fillStyle=gl;g.fillRect(wx-16,wy-16,32,32)}
 g.save();g.imageSmoothingEnabled=false;g.drawImage(c,wx-8,wy-10,16,19.6);g.restore()}
// drawn on top of the world (so fences and trees don't hide it), using the exact camera the world was drawn with
let FWT=null,FWTat=0;
{const _pp=pP;pP=function(tm){FWT=g.getTransform();FWTat=performance.now();_pp(tm)}}
{const _dh=drawHUD;drawHUD=function(){if(!menuOpen&&FWT&&performance.now()-FWTat<200)try{const live=fwLive(),peers=window.SQFWPEERS?SQFWPEERS():[];if(live||peers.length){const t=performance.now()/1000;g.save();g.setTransform(FWT);
   if(live){fwDraw(FWP.x,FWP.y,t,true);for(const b of FWP.balls){Rg(Math.round(b.x)-2,Math.round(b.y)-2,4,4,'#f86020');Rg(Math.round(b.x)-1,Math.round(b.y)-1,2,2,'#fff0a0')}}
   for(const q of peers)fwDraw(q[0],q[1],t,true);g.restore()}}catch(e){}_dh()}}
window.SQFW={state:FWP,live:fwLive,pres:()=>fwLive()?[Math.round(FWP.x),Math.round(FWP.y)]:0};
