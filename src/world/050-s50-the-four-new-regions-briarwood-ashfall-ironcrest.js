// ---------------------------------------------------------------- 50. The four new regions: Briarwood, Ashfall, Ironcrest, Shattered
// Each region is generated from its own seed with a deterministic RNG, in a fixed order: land -> biomes -> water,
// mountains and lava -> arrival pier -> landmarks and reserved sites (placed by searching the real terrain near a
// target spot) -> trails from the pier to every site (bridges over water, passes through rock) -> resources ->
// a final pass that links every pocket of open ground to the pier. Reserved sites are flattened and left empty
// for future towns, dungeons, hubs and boss arenas. Gathering uses the same rules and perks as on Hollow.
// --- extra ground types (regions only; Hollow never uses them) ---
// 7 forest floor, 8 black sand, 9 lava (blocked), 10 ash / cracked earth, 11 stone paving (ruins, bridges, stairs),
// 12 ice, 13 dark ground, 14 dirt trail, 15 sulfur spring (blocked)
const RG_WALK=new Uint8Array(16);for(const t of[1,2,4,5,7,8,10,11,12,13,14])RG_WALK[t]=1;
const HDELR=[0,1,2,3,2,1,3,2,1,1,1,2,2,2,2,1];
const RGP={7:hdP(['#1f4826','#265530','#2d6236','#35703c','#3f7f44']),8:hdP(['#262224','#302a2e','#3b3438','#474044','#5a5256']),
 9:hdP(['#5a1206','#8a1c06','#c0300a','#e85a12','#f8901c','#ffc040','#fff0a0']),10:hdP(['#3e3634','#4a403c','#564a44','#62554e','#706058']),
 11:hdP(['#6e685e','#7e786c','#8e887c','#9e988a','#b0aa9c']),12:hdP(['#9cc6e0','#acd2ea','#bcdcf2','#cce6f8','#e4f4fe']),
 13:hdP(['#2c2838','#353044','#3e3850','#48405c','#544a6a']),14:hdP(['#6a4c30','#7a5a38','#886640','#98744c']),15:hdP(['#7a8a18','#98a824','#b8c838','#d8e468'])};
const RGC={mortar:hdC('#4e4a42'),crust:hdC('#2a1a16'),crack:hdC('#221a18'),ember:hdC('#e05010'),ice:hdC('#ffffff'),moss1:hdC('#5a8a3a'),moss2:hdC('#7ab060'),violet:hdC('#b080e0'),root:hdC('#3a2a1a')};
function RGPAL(t,U,V,f,r,wx,wy){const P=RGP[t];if(!P)return HDT.rock[2];
 if(t===9){const k=hdVN(U/9,V/9),cr=Math.abs(hdVN(U/14+5,V/14+9)-.5);return cr<.05?RGC.crust:P[hdQ(k*.75+f*.25,7,U,V)]}
 if(t===10){const cr=Math.abs(hdVN(U/11,V/11)-.5);if(cr<.012)return r>.97?RGC.ember:RGC.crack;return P[hdQ(f*.8+.1+(r-.5)*.1,5,U,V)]}
 if(t===11){const gy=Math.floor(wy/8),ox=(gy&1)*4,mx=(wx+ox)%8,my=wy%8;if(mx<.6||my<.6)return RGC.mortar;return P[hdQ(hdH(Math.floor((wx+ox)/8),gy)*.6+f*.3+.05,5,U,V)]}
 if(t===12){const cr=Math.abs(hdVN(U/18,V/18)-.5);if(cr<.008)return RGC.ice;return P[hdQ(f*.7+.2+(r-.5)*.1,5,U,V)]}
 if(t===7){if(r>.986)return r>.995?RGC.moss2:RGC.moss1;if(r<.004)return RGC.root;return P[hdQ(f*.95+.03+(r-.5)*.16,5,U,V)]}
 if(t===13){if(r>.994)return RGC.violet;return P[hdQ(f*.9+.05+(r-.5)*.14,5,U,V)]}
 if(t===15){const k=Math.sin(wx*.5+wy*.3+hdVN(U/20,V/20)*8)*.5+.5;return P[hdQ(k*.6+f*.3,4,U,V)]}
 return P[hdQ(f*.85+.08+(r-.5)*.12,P.length,U,V)]}
const RG_MAPCOL=['#2a6cc2','#e2c47e','#56ac46','#8a7c6c','#eef2f8','#e8bc70','#6a5a48','#2f6a34','#3a3436','#f06a18','#5e524c','#a8a294','#bfe0f2','#4a4260','#8a6a44','#c0cc38'];
const RG_OBJCOL={tree:'#2c7c30',pine:'#1e5a38',rock:'#988a78',ore:'#d88038',bush:'#c84860',cactus:'#3c9a38',dead:'#2a2220',dark:'#3a2a50',crystal:'#b080f0',moss:'#6a7a58'};
const RG_LMCOUNT={briarwood:5,ashfall:3,ironcrest:8,shattered:6};

// --- generation toolkit ---
function rgCtx(D){const W=D.width,H=D.height,N2=W*H;const C={D,W,H,N2,T:new Uint8Array(N2),O:new Array(N2).fill(null),keep:new Uint8Array(N2),zone:new Uint8Array(N2),lmSolid:new Uint8Array(N2),
  rnd:rgRand(D.seed),so:(D.seed*7.31)%97,items:[],lms:[],res:[],rects:[],bridges:[],stairs:[],pier:[]};
 C.fbm=(x,y,s,o)=>{let a=0,w=.5,t=0;for(let k=0;k<4;k++){const m=1<<k;a+=w*hdVN(x*m/s+C.so*3+(o||0)*13.7+k*17.3,y*m/s+C.so*5+(o||0)*7.1+k*31.9);t+=w;w*=.5}return a/t};
 C.inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;return C}
const RG_D4=[[1,0],[-1,0],[0,1],[0,-1]];
function rgLand(C,blobs,amp,scale){const{W,H,T}=C;for(let y=0;y<H;y++)for(let x=0;x<W;x++){let v=-9;for(const[cx,cy,rx,ry]of blobs)v=Math.max(v,1-Math.hypot((x-cx)/rx,(y-cy)/ry));
  v+=(C.fbm(x,y,scale,1)-.5)*amp;const e=Math.min(x,y,W-1-x,H-1-y);if(e<16)v-=(16-e)*.05;if(v>0&&e>=4)T[y*W+x]=2}}
// label connected groups of tiles that pass ok(i)
function rgLabel(C,ok){const{W,H,N2}=C,lab=new Int32Array(N2).fill(-1),comps=[];
 for(let s=0;s<N2;s++){if(lab[s]>=0||!ok(s))continue;const id=comps.length,cells=[s];lab[s]=id;for(let k=0;k<cells.length;k++){const i=cells[k],x=i%W,y=(i/W)|0;
   for(const[a,b]of RG_D4){const X=x+a,Y=y+b;if(X<0||Y<0||X>=W||Y>=H)continue;const j=Y*W+X;if(lab[j]<0&&ok(j)){lab[j]=id;cells.push(j)}}}comps.push(cells)}return{lab,comps}}
function rgKeep(C,min){const{comps}=rgLabel(C,i=>C.T[i]!==0);let big=0;for(const c of comps)if(c.length>big)big=c.length;for(const c of comps)if(c.length<min&&c.length<big)for(const i of c)C.T[i]=0}
// distance (steps) from every tile to the nearest tile where src(i) holds
function rgDist(C,src){const{W,H,N2}=C,d=new Uint16Array(N2).fill(65535),q=[];for(let i=0;i<N2;i++)if(src(i)){d[i]=0;q.push(i)}
 for(let k=0;k<q.length;k++){const i=q[k],x=i%W,y=(i/W)|0;for(const[a,b]of RG_D4){const X=x+a,Y=y+b;if(X<0||Y<0||X>=W||Y>=H)continue;const j=Y*W+X;if(d[j]>d[i]+1){d[j]=d[i]+1;q.push(j)}}}return d}
function rgBlob(C,cx,cy,r,code,only){const{W,T}=C;for(let y=Math.floor(cy-r-2);y<=cy+r+2;y++)for(let x=Math.floor(cx-r-2);x<=cx+r+2;x++){if(!C.inb(x,y))continue;const i=y*W+x;
  if(C.keep[i]||only&&!only(T[i]))continue;if(Math.hypot(x-cx,y-cy)+(C.fbm(x,y,4,9)-.5)*2.2<r)T[i]=code}}
// a river: flows downhill (away from the interior) until it meets the sea
function rgStream(C,sx,sy,dw,wide){const{W,T}=C;let x=Math.round(sx),y=Math.round(sy);const seen=new Set();
 for(let k=0;k<400;k++){const i=y*W+x;if(T[i]===0&&k>3)break;if(!C.keep[i]){T[i]=0;if(wide&&C.inb(x+1,y)&&!C.keep[i+1])T[i+1]=0}seen.add(i);let best=null,bv=1e9;
  for(const[a,b]of RG_D4){const X=x+a,Y=y+b;if(!C.inb(X,Y)||seen.has(Y*W+X))continue;const v=dw[Y*W+X]+C.rnd()*1.6;if(v<bv){bv=v;best=[X,Y]}}if(!best)break;[x,y]=best}}
// the arrival pier on the side of the island facing Hollow
function rgDock(C,side,coast){const{W,H,T}=C,hz=side==='e'||side==='w',mid=hz?H>>1:W>>1;
 for(let k=0;k<(hz?H:W)/2;k++)for(const sg of[1,-1]){const m=mid+sg*k;let x,y,dx=0,dy=0;
  if(side==='e'){y=m;dx=1;for(x=W-6;x>4&&!T[y*W+x];x--);}else if(side==='w'){y=m;dx=-1;for(x=5;x<W-5&&!T[y*W+x];x++);}
  else if(side==='s'){x=m;dy=1;for(y=H-6;y>4&&!T[y*W+x];y--);}else{x=m;dy=-1;for(y=5;y<H-5&&!T[y*W+x];y++);}
  if(!T[y*W+x])continue;let ok=true;for(let j=1;j<=5;j++)if(!C.inb(x+dx*j,y+dy*j)||T[(y+dy*j)*W+x+dx*j])ok=false;
  for(let j=1;j<=3;j++){const X=x-dx*j,Y=y-dy*j;if(!T[Y*W+X])ok=false}if(!ok)continue;
  for(let b=-2;b<=2;b++)for(let a=-2;a<=2;a++){const X=x+a,Y=y+b,i=Y*W+X;if(T[i]&&Math.abs(a)+Math.abs(b)<=3)T[i]=coast}
  for(let b=-6;b<=6;b++)for(let a=-6;a<=6;a++)if(C.inb(x+a,y+b))C.keep[(y+b)*W+x+a]=1;
  for(let j=1;j<=3;j++){const X=x+dx*j,Y=y+dy*j;T[Y*W+X]=coast;C.pier.push([X,Y])}
  const end=C.pier[2];C.items.push({t:'rgpost',x:end[0],y:end[1],use:'regdock'});C.spawn=C.pier[0].slice();C.dock=end.slice();C.pierH=hz;C.shore=[x,y];return}
 throw new Error('no place for a pier')}
// find a w x h site near a target spot that sits on solid land and away from other sites
function rgSite(C,fx,fy,w,h,opt){const{W,H,T}=C,cx=Math.round(fx*W-w/2),cy=Math.round(fy*H-h/2),mtn=opt&&opt.mtn;let best=null,bs=-9;
 const landAt=(x,y)=>{let n=0;for(let b=0;b<h;b++)for(let a=0;a<w;a++){const t=T[(y+b)*W+x+a];if(t&&t!==9&&t!==15&&(mtn||t!==3))n++}return n/(w*h)};
 for(let r=0;r<=44;r+=2){for(let dy=-r;dy<=r;dy+=2)for(let dx=-r;dx<=r;dx+=2){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=cx+dx,y=cy+dy;
   if(x<7||y<7||x+w>W-7||y+h>H-7)continue;if(C.rects.some(q=>x<q.x+q.w+3&&x+w+3>q.x&&y<q.y+q.h+3&&y+h+3>q.y))continue;
   const v=landAt(x,y),sc=v-r*.003;if(v>=.97){best={x,y};bs=9;break}if(sc>bs){bs=sc;best={x,y}}}if(bs===9)break}
 if(!best)throw new Error('no room for a '+w+'x'+h+' site');const q={x:best.x,y:best.y,w,h};C.rects.push(q);return q}
function rgFlat(C,q,code,keepOnly){const{W,T}=C;for(let y=q.y-1;y<=q.y+q.h;y++)for(let x=q.x-1;x<=q.x+q.w;x++){if(!C.inb(x,y))continue;const i=y*W+x,ins=x>=q.x&&y>=q.y&&x<q.x+q.w&&y<q.y+q.h;
  if(ins&&!keepOnly)T[i]=typeof code==='function'?code(x,y):code;C.keep[i]=1;C.O[i]=null}}
function rgLm(C,k,x,y,w,h,ex){const it=Object.assign({t:'lm',k,x,y,w,h,sh:h},ex||{});C.items.push(it);
 for(let b=0;b<h;b++)for(let a=0;a<w;a++){const i=(y+b)*C.W+x+a;C.keep[i]=1;C.O[i]=null;if(!it.walk){C.lmSolid[i]=1;if(!RG_WALK[C.T[i]])C.T[i]=11}}return it}
const rgMark=(C,id,name,x,y)=>C.lms.push({id,name,x:Math.round(x),y:Math.round(y)});
const rgRes=(C,id,kind,q)=>C.res.push({id,kind,x:q.x,y:q.y,w:q.w,h:q.h});
const rgSign=(C,x,y,name,text)=>rgLm(C,'sign',x,y,1,1,{use:'look',name,text});
// cheapest route from a set of tiles to any target tile (water becomes bridge, rock becomes a pass)
function rgRoute(C,from,isT,cost){const{W,H,N2}=C,dist=new Float64Array(N2).fill(1e9),prev=new Int32Array(N2).fill(-1),hp=[],hd=[];
 const push=(i,d)=>{hp.push(i);hd.push(d);let k=hp.length-1;while(k>0){const p=(k-1)>>1;if(hd[p]<=hd[k])break;[hp[p],hp[k]]=[hp[k],hp[p]];[hd[p],hd[k]]=[hd[k],hd[p]];k=p}};
 const pop=()=>{const i=hp[0],d=hd[0],li=hp.pop(),ld=hd.pop();if(hp.length){hp[0]=li;hd[0]=ld;let k=0;for(;;){const a=2*k+1,b=a+1;let m=k;if(a<hp.length&&hd[a]<hd[m])m=a;if(b<hp.length&&hd[b]<hd[m])m=b;if(m===k)break;[hp[m],hp[k]]=[hp[k],hp[m]];[hd[m],hd[k]]=[hd[k],hd[m]];k=m}}return[i,d]};
 for(const s of from){dist[s]=0;push(s,0)}
 while(hp.length){const[i,d]=pop();if(d>dist[i])continue;if(isT(i)){const path=[];for(let j=i;j>=0;j=prev[j])path.push(j);return path}
  const x=i%W,y=(i/W)|0;for(const[a,b]of RG_D4){const X=x+a,Y=y+b;if(X<3||Y<3||X>=W-3||Y>=H-3)continue;const j=Y*W+X,c=cost(j);if(!(c<1e8))continue;const nd=d+c;if(nd<dist[j]){dist[j]=nd;prev[j]=i;push(j,nd)}}}
 return null}
function rgCost(C,o){const w=o&&o.water||7,m=o&&o.mtn||5;return j=>{if(C.lmSolid[j])return 1e9;const t=C.T[j];let c=t===0?w:t===3?m:t===9||t===15?30:(t===14||t===11)?.55:1;if(C.O[j])c+=1.5;return c}}
function rgPave(C,path,st){const{W,T}=C;for(const i of path){const t=T[i];if(t===0){T[i]=11;C.bridges.push(i)}else if(t===3){T[i]=st.pass||14;if(st.wide){const j=i+1;if(T[j]===3&&!C.lmSolid[j])T[j]=st.pass||14}}
  else if(t===9||t===15)T[i]=10;else if(st.trail&&t!==11&&t!==12&&!C.keep[i])T[i]=st.trail;C.O[i]=null;C.keep[i]=1}}
function rgTrail(C,a,b,st){const ti=b[1]*C.W+b[0],path=rgRoute(C,[a[1]*C.W+a[0]],i=>i===ti,rgCost(C,st));if(path)rgPave(C,path,st)}
// place gathering resources: pick(t,x,y,zone,r) returns an object type (or a variant) or null
function rgScatter(C,pick){const{W,H,T}=C;for(let y=3;y<H-3;y++)for(let x=3;x<W-3;x++){const i=y*W+x;if(C.keep[i]||!RG_WALK[T[i]]||T[i]===11||T[i]===14)continue;const r=C.rnd(),o=pick(T[i],x,y,C.zone[i],r);
  if(o){const[t,v]=o.split(':');C.O[i]={t,hp:OHP[t]||3,v:v||undefined}}}}
// every pocket of open ground ends up linked to the pier (tiny ones become thicket)
function rgConnect(C,fill){const{W,N2,T}=C,open=i=>RG_WALK[T[i]]&&!C.O[i]&&!C.lmSolid[i],si=C.spawn[1]*W+C.spawn[0];
 for(let pass=0;pass<40;pass++){const{lab,comps}=rgLabel(C,open),main=lab[si];let left=0;
  for(let k=0;k<comps.length;k++){if(k===main)continue;const c=comps[k];if(c.length<10){for(const i of c){const f=fill(T[i]);if(f)C.O[i]={t:f,hp:OHP[f]||3};else T[i]=3}continue}left++}
  if(!left)return;const inMain=i=>lab[i]===main;
  for(let k=0;k<comps.length;k++){if(k===main||comps[k].length<10)continue;const path=rgRoute(C,comps[k],inMain,rgCost(C,{water:6,mtn:4}));if(path)rgPave(C,path,{})}}}
function rgFinish(C){const{W,H,T,O}=C,solid=new Set(),lava=[];
 for(let i=0;i<C.N2;i++){if(!RG_WALK[T[i]])solid.add(i);if(T[i]===9)lava.push(i);if(C.lmSolid[i])solid.add(i);const o=O[i];if(o){C.items.push({t:'_obj',x:i%W,y:(i/W)|0,o});solid.add(i)}}
 for(const[x,y]of C.pier)solid.delete(y*W+x);
 return{tiles:T,items:C.items,solid,spawn:C.spawn,dock:C.dock,pier:C.pier,pierH:C.pierH,lms:C.lms,reserved:C.res,bridges:C.bridges,stairs:C.stairs,lava}}
const rgCenter=q=>[q.x+(q.w>>1),q.y+(q.h>>1)];
const rgSouth=q=>[q.x+(q.w>>1),q.y+q.h];

// generators are written as steps (yield between stages) so a region can be built a little each frame
const RG_GENS={};
function rgRunSync(it){let r;while(!(r=it.next()).done);return r.value}
// --- Briarwood Isle: dense woods, lakes and streams, mossy ruins, ancient trees, old camps ---
RG_GENS.briarwood=function*(D){const C=rgCtx(D),{W,H,T}=C;
 rgLand(C,[[W*.5,H*.5,W*.42,H*.41],[W*.33,H*.3,W*.2,H*.17],[W*.63,H*.72,W*.22,H*.17]],.9,26);rgKeep(C,400);yield;
 let dw=rgDist(C,i=>T[i]===0);
 for(let i=0;i<C.N2;i++)if(T[i]){const x=i%W,y=(i/W)|0;T[i]=dw[i]<=2?1:C.fbm(x,y,14,3)>.6?2:7}
 for(let i=0;i<C.N2;i++)if(T[i]===7&&dw[i]>8&&C.fbm(i%W,(i/W)|0,9,7)>.7)T[i]=0;   // marsh pools
 rgDock(C,'e',1);yield;
 // landmarks
 const grove=rgSite(C,.27,.3,13,13);rgFlat(C,grove,7);const[gx,gy]=rgCenter(grove);
 rgLm(C,'elder',gx-1,gy-1,3,2,{use:'look',name:'The Elder Grove',text:'The Elder Grove: an ancient tree older than any map. Its roots run under the whole island. (A woodcutter\'s tale begins here one day.)'});rgMark(C,'elder_grove','The Elder Grove',gx,gy);
 for(let y=gy-12;y<=gy+12;y++)for(let x=gx-12;x<=gx+12;x++){if(!C.inb(x,y))continue;const d=Math.hypot(x-gx,y-gy);if(d>7&&d<12)C.zone[y*W+x]=1}
 const ru=rgSite(C,.66,.27,15,12);rgFlat(C,ru,(x,y)=>C.fbm(x,y,4,5)>.62?2:11);const[rx,ry]=rgCenter(ru);
 for(let x=ru.x+1;x<ru.x+ru.w-1;x++)for(const y of[ru.y+1,ru.y+ru.h-2])if(Math.abs(x-rx)>1&&C.rnd()>.35)rgLm(C,'ruinwall',x,y,1,1,{v:C.rnd()<.5?1:0});
 for(let y=ru.y+2;y<ru.y+ru.h-2;y++)for(const x of[ru.x+1,ru.x+ru.w-2])if(Math.abs(y-ry)>1&&C.rnd()>.35)rgLm(C,'ruinwall',x,y,1,1,{v:C.rnd()<.5?1:0});
 for(const[a,b]of[[-4,1],[4,1],[-4,3],[4,3]])rgLm(C,'pillar',rx+a,ry+b,1,1,{v:'moss'});
 rgLm(C,'vault',rx-1,ru.y+3,3,2,{use:'look',name:'Whispering Ruins',text:'A stone vault in the Whispering Ruins. The door is locked tight, and the wind hums through the cracks like voices.'});rgMark(C,'whispering_ruins','Whispering Ruins',rx,ry);
 const lk=rgSite(C,.3,.65,22,16);const[lx,ly]=rgCenter(lk);
 for(let y=lk.y;y<lk.y+lk.h;y++)for(let x=lk.x;x<lk.x+lk.w;x++){const i=y*W+x,d=Math.hypot((x-lx)/10,(y-ly)/7)+(C.fbm(x,y,5,6)-.5)*.35,di=Math.hypot((x-lx)/2.4,(y-ly)/2);C.keep[i]=1;
  T[i]=di<1?2:d<1?0:d<1.3?(T[i]===1?1:2):T[i]}
 rgLm(C,'shrine',lx,ly,1,1,{use:'look',name:'Thornwater Lake',text:'A moss-green shrine on the island in Thornwater Lake. The water is clear and full of fish.'});rgMark(C,'thornwater','Thornwater Lake',lx,ly);
 for(let k=0;k<2;k++){const cp=rgSite(C,k?.56:.2,k?.82:.5,7,5);rgFlat(C,cp,2);rgLm(C,'tent',cp.x+1,cp.y+1,2,1,{use:'look',name:'Abandoned camp',text:'An abandoned camp. The fire went cold long ago, and someone left in a hurry.'});
  rgLm(C,'firepit',cp.x+4,cp.y+2,1,1);rgLm(C,'crates',cp.x+1,cp.y+3,1,1);rgMark(C,'camp'+k,'Abandoned Camp',cp.x+3,cp.y+2)}
 // reserved for future content: kept flat, open and quiet
 const town=rgSite(C,.72,.6,18,13);rgFlat(C,town,2);rgRes(C,'briar_town','town',town);
 const d1=rgSite(C,.17,.75,8,8);rgFlat(C,d1,7);rgRes(C,'briar_dun1','dungeon',d1);
 const d2=rgSite(C,.5,.15,8,8);rgFlat(C,d2,7);rgRes(C,'briar_dun2','dungeon',d2);
 const hub=rgSite(C,.46,.47,11,9);rgFlat(C,hub,2);rgRes(C,'briar_hub','hub',hub);
 const boss=rgSite(C,.14,.36,13,13);rgFlat(C,boss,2);rgRes(C,'briar_boss','boss',boss);
 const wc=rgSite(C,.84,.36,12,10);rgFlat(C,wc,7);rgRes(C,'briar_wood','resource',wc);
 // streams from the interior to the sea, then trails from the pier to every site
 dw=rgDist(C,i=>T[i]===0);for(const[a,b]of[[.48,.4],[.4,.62]])rgStream(C,W*a,H*b,dw,false);
 const st={trail:14,pass:14};for(const q of[grove,ru,town,d1,d2,hub,boss,wc]){rgTrail(C,C.spawn,rgSouth(q),st);yield}
 rgTrail(C,C.spawn,[lx,lk.y+lk.h-1],st);rgTrail(C,[lx,ly+1],[lx,lk.y+lk.h-1],{water:1.2});
 yield;rgScatter(C,(t,x,y,z,r)=>z===1&&t===7?(r<.5?'tree':r<.56?'bush':null):t===7?(r<.27?(C.rnd()<.1?'pine':'tree'):r<.315?'bush':r<.327?'rock:moss':null):t===2?(r<.03?'tree':r<.065?'bush':r<.073?'rock':null):t===1?(r<.012?'rock':null):null);
 yield;rgConnect(C,t=>t===1?'rock':'bush');return rgFinish(C)};

// --- Ashfall Coast: black sand, cliffs, scorched woods, lava pools, sulfur springs, a fallen fortress ---
RG_GENS.ashfall=function*(D){const C=rgCtx(D),{W,H,T}=C;
 rgLand(C,[[W*.56,H*.5,W*.4,H*.4],[W*.76,H*.3,W*.17,H*.2],[W*.38,H*.73,W*.2,H*.15]],.9,28);rgKeep(C,400);yield;
 const dw=rgDist(C,i=>T[i]===0);
 for(let i=0;i<C.N2;i++)if(T[i]){const x=i%W,y=(i/W)|0;let t=dw[i]<=3?8:10;
  if(t===10&&x<W*.42&&C.fbm(x,y,16,4)>.62)t=2;
  if(dw[i]>=4&&dw[i]<=6&&(y<H*.35||y>H*.68)&&C.fbm(x,y,10,9)>.5)t=3;                        // coastal cliffs
  if(dw[i]>9&&1-Math.abs(2*C.fbm(x,y,20,11)-1)>.9)t=3;                                     // inland ridges
  T[i]=t;if(t===10&&C.fbm(x,y,20,5)>.55)C.zone[i]=1}                                       // scorched woods
 rgDock(C,'w',8);yield;
 const ef=rgSite(C,.72,.5,30,24,{mtn:true});const[ex,ey]=rgCenter(ef);
 for(let y=ef.y;y<ef.y+ef.h;y++)for(let x=ef.x;x<ef.x+ef.w;x++){const i=y*W+x;if(T[i]&&Math.hypot((x-ex)/15,(y-ey)/12)<1){T[i]=10;C.zone[i]=2}}
 for(let k=0;k<6;k++)rgBlob(C,ex+(C.rnd()-.5)*22,ey+(C.rnd()-.5)*16,1.6+C.rnd()*1.6,9,t=>t===10);
 rgSign(C,ef.x-1,ey,'Emberfield','Emberfield: cracked volcanic ground, still warm underfoot. Iron runs thick here, and so do the things that hunt it.');rgMark(C,'emberfield','Emberfield',ex,ey);
 for(let k=0;k<5;k++){const x=W*(.3+C.rnd()*.55),y=H*(.25+C.rnd()*.5),i=Math.round(y)*W+Math.round(x);if(dw[i]>9&&!C.keep[i])rgBlob(C,x,y,1.5+C.rnd()*1.5,9,t=>t===10||t===2)}
 for(let k=0;k<4;k++)rgBlob(C,W*.42+(C.rnd()-.5)*14,H*.3+(C.rnd()-.5)*10,1+C.rnd()*.9,15,t=>t===10||t===2);
 // the Black Lighthouse on the north-east headland
 let lh=null,lv=-9;for(let y=8;y<H*.42;y++)for(let x=Math.floor(W*.6);x<W-8;x++){const i=y*W+x;if(T[i]&&T[i]!==3&&dw[i]>=2&&dw[i]<=3){const v=x/W-y/H;if(v>lv){lv=v;lh=[x,y]}}}
 const lq={x:Math.min(W-12,Math.max(6,lh[0]-3)),y:Math.min(H-12,Math.max(6,lh[1]-3)),w:7,h:7};C.rects.push(lq);rgFlat(C,lq,(x,y)=>T[y*W+x]===0?8:11);
 rgLm(C,'lighthouse',lq.x+2,lq.y+2,2,2,{use:'look',name:'The Black Lighthouse',text:'The Black Lighthouse. Its lamp has been dark for years, but the stair inside still climbs toward the eastern sea.'});rgMark(C,'black_lighthouse','The Black Lighthouse',lq.x+3,lq.y+3);
 const fb=rgSite(C,.5,.78,20,14);rgFlat(C,fb,(x,y)=>C.fbm(x,y,4,8)>.62?10:11);const[bx,by]=rgCenter(fb);
 for(const[cx,cy]of[[fb.x,fb.y],[fb.x+fb.w-2,fb.y],[fb.x,fb.y+fb.h-2],[fb.x+fb.w-2,fb.y+fb.h-2]])rgLm(C,'btower',cx,cy,2,2);
 for(let x=fb.x+2;x<fb.x+fb.w-2;x++)for(const y of[fb.y,fb.y+fb.h-1])if(Math.abs(x-bx)>(y===fb.y?0:2)&&C.rnd()>.3)rgLm(C,'bwall',x,y,1,1);
 for(let y=fb.y+2;y<fb.y+fb.h-2;y++)for(const x of[fb.x,fb.x+fb.w-1])if(C.rnd()>.3)rgLm(C,'bwall',x,y,1,1);
 rgLm(C,'sealgate',bx-1,by-1,3,1,{use:'look',name:'The Fallen Bastion',text:'The Fallen Bastion. A great iron grate seals the way underground. Whatever was kept below is still there.'});rgMark(C,'fallen_bastion','The Fallen Bastion',bx,by);
 const town=rgSite(C,.33,.34,20,14);rgFlat(C,town,10);rgRes(C,'ash_town','town',town);
 const d1=rgSite(C,.84,.22,8,8);rgFlat(C,d1,10);rgRes(C,'ash_dun1','dungeon',d1);
 const d2=rgSite(C,.22,.72,8,8);rgFlat(C,d2,10);rgRes(C,'ash_dun2','dungeon',d2);
 const mine=rgSite(C,.82,.7,14,10);rgFlat(C,mine,10);rgRes(C,'ash_mine','resource',mine);
 const arena=rgSite(C,.9,.82,15,15);rgFlat(C,arena,10);rgRes(C,'ash_arena','boss',arena);
 const st={trail:14,pass:14,wide:1};rgTrail(C,C.spawn,[ex,ey+3],st);for(const q of[lq,fb,town,d1,d2,mine,arena]){rgTrail(C,C.spawn,rgSouth(q),st);yield}
 yield;rgScatter(C,(t,x,y,z,r)=>z===2?(r<.035?'ore':r<.065?'rock':r<.075?'tree:dead':null):t===10?(z===1?(r<.16?'tree:dead':r<.18?'rock':null):(r<.05?'tree:dead':r<.07?'rock':r<.074?'ore':null)):t===8?(r<.05?'rock':null):t===2?(r<.04?'tree':r<.07?'bush':null):null);
 yield;rgConnect(C,t=>t===2?'bush':'rock');return rgFinish(C)};

// --- Ironcrest Highlands: mountain walls and passes, snowfields, alpine woods, frozen lakes, old stonework ---
RG_GENS.ironcrest=function*(D){const C=rgCtx(D),{W,H,T}=C;
 rgLand(C,[[W*.5,H*.5,W*.44,H*.44]],.7,30);rgKeep(C,400);yield;
 let dw=rgDist(C,i=>T[i]===0);const snow=(x,y)=>y<H*.46+(C.fbm(x,y,20,2)-.5)*26;
 for(let i=0;i<C.N2;i++)if(T[i]){const x=i%W,y=(i/W)|0,s=snow(x,y),ridge=1-Math.abs(2*C.fbm(x,y,22,11)-1);
  T[i]=ridge>(s?.8:.86)&&dw[i]>3?3:dw[i]<=2?(s?4:1):(s?4:2)}
 rgDock(C,'s',1);yield;
 const ob=rgSite(C,.5,.14,12,10,{mtn:true});rgFlat(C,ob,11);const[ox,oy]=rgCenter(ob);
 rgLm(C,'observatory',ox-2,oy-2,4,3,{use:'look',name:'The Broken Observatory',text:'The Broken Observatory. Its dome is cracked open to the sky, and strange symbols ring the old telescope. A mage would want to see this.'});rgMark(C,'observatory','The Broken Observatory',ox,oy);
 const sv=rgSite(C,.24,.56,30,28,{mtn:true});const[vx,vy]=rgCenter(sv);
 for(let y=sv.y;y<sv.y+sv.h;y++)for(let x=sv.x;x<sv.x+sv.w;x++){const i=y*W+x,d=Math.hypot((x-vx)/11,(y-vy)/10)+(C.fbm(x,y,5,3)-.5)*.25;C.keep[i]=d<1.4?1:C.keep[i];
  if(d<1){T[i]=2;C.zone[i]=3;C.keep[i]=0}else if(d<1.32&&T[i])T[i]=3}
 for(let k=0;k<5;k++)T[(vy-10+k)*W+vx+2]=0;rgBlob(C,vx+2,vy-4,2,0,t=>t===2);
 rgSign(C,vx-1,vy+7,'Silverfall Valley','Silverfall Valley: a hidden valley under a silver waterfall. The rock walls are veined with iron.');rgMark(C,'silverfall','Silverfall Valley',vx,vy);
 const gs=rgSite(C,.74,.42,13,18,{mtn:true});const[sx]=rgCenter(gs);
 for(let y=gs.y;y<gs.y+gs.h;y++)for(let x=gs.x;x<gs.x+gs.w;x++){const i=y*W+x;C.keep[i]=1;C.O[i]=null;T[i]=3}
 for(let y=gs.y+1;y<gs.y+5;y++)for(let x=sx-3;x<=sx+3;x++)T[y*W+x]=11;
 for(let y=gs.y+5;y<gs.y+gs.h;y++)for(let x=sx-1;x<=sx+1;x++){T[y*W+x]=11;C.stairs.push(y*W+x)}
 for(let y=gs.y+gs.h;y<gs.y+gs.h+3;y++)for(let x=sx-2;x<=sx+2;x++){const i=y*W+x;if(C.inb(x,y)){T[i]=11;C.keep[i]=1}}
 rgLm(C,'sealdoor',sx-1,gs.y+1,3,1,{use:'look',name:'The Giant\'s Stair',text:'At the top of the Giant\'s Stair a stone door is carved into the mountain. It is sealed with runes that will not budge.'});
 rgSign(C,sx+2,gs.y+gs.h+1,'The Giant\'s Stair','The Giant\'s Stair: steps cut for feet far larger than yours, climbing to a sealed door.');rgMark(C,'giants_stair','The Giant\'s Stair',sx,gs.y+gs.h-2);
 for(let k=0;k<2;k++){const cp=rgSite(C,k?.62:.36,k?.66:.32,7,5);rgFlat(C,cp,(x,y)=>snow(x,y)?4:2);rgLm(C,'tent',cp.x+1,cp.y+1,2,1,{use:'look',name:'Abandoned mining camp',text:'An abandoned mining camp. The carts still hold ore nobody came back for.'});
  rgLm(C,'cart',cp.x+4,cp.y+1,1,1);rgLm(C,'cart',cp.x+5,cp.y+3,1,1);rgLm(C,'firepit',cp.x+2,cp.y+3,1,1);rgMark(C,'mcamp'+k,'Abandoned Mining Camp',cp.x+3,cp.y+2)}
 [[.15,.2,'North Watchtower'],[.86,.74,'East Watchtower'],[.2,.86,'South Watchtower']].forEach(([fx,fy,nm],k)=>{const q=rgSite(C,fx,fy,4,4,{mtn:true});rgFlat(C,q,11);
  rgLm(C,'wtower',q.x+1,q.y+1,2,2,{use:'look',name:nm,text:'The '+nm+', an ancient lookout. From the top you could once see every pass in the Highlands.'});rgMark(C,'tower'+k,nm,q.x+2,q.y+2)});
 const town=rgSite(C,.5,.74,20,14);rgFlat(C,town,(x,y)=>snow(x,y)?4:2);rgRes(C,'iron_town','town',town);
 const d1=rgSite(C,.12,.38,8,8,{mtn:true});rgFlat(C,d1,(x,y)=>snow(x,y)?4:2);rgRes(C,'iron_dun1','dungeon',d1);
 const d2=rgSite(C,.86,.16,8,8,{mtn:true});rgFlat(C,d2,4);rgRes(C,'iron_dun2','dungeon',d2);
 const mine=rgSite(C,.62,.3,14,10,{mtn:true});rgFlat(C,mine,(x,y)=>snow(x,y)?4:2);rgRes(C,'iron_mine','resource',mine);
 rgRes(C,'iron_magic','magic',ob);rgRes(C,'iron_stairdun','dungeon',{x:sx-1,y:gs.y,w:3,h:1});
 for(let k=0;k<3;k++){const x=W*(.25+C.rnd()*.5),y=H*(.12+C.rnd()*.28);rgBlob(C,x,y,3+C.rnd()*2.5,12,t=>t===4)}
 dw=rgDist(C,i=>T[i]===0);rgStream(C,W*.56,H*.3,dw,true);
 const st={trail:14,pass:14,wide:1};for(const q of[ob,town,d1,d2,mine]){rgTrail(C,C.spawn,rgSouth(q),st);yield}rgTrail(C,C.spawn,[vx,vy+4],st);rgTrail(C,C.spawn,[sx,gs.y+gs.h+2],st);
 yield;rgScatter(C,(t,x,y,z,r)=>z===3?(r<.05?'ore':r<.07?'rock':r<.1?'pine':null):t===4?(r<.09?'pine':r<.11?'rock':null):t===2?(r<.1?'pine':r<.14?'tree':r<.16?'bush':r<.172?'rock':null):t===1?(r<.012?'rock':null):null);
 for(let i=0;i<C.N2;i++){if(C.O[i]||C.keep[i]||!RG_WALK[T[i]]||T[i]===11||T[i]===14)continue;const x=i%W,y=(i/W)|0;if(RG_D4.some(([a,b])=>T[(y+b)*W+x+a]===3)&&C.rnd()<.012)C.O[i]={t:'ore',hp:OHP.ore||5}}
 yield;rgConnect(C,t=>t===4?'rock':'pine');return rgFinish(C)};

// --- Shattered Expanse: broken islands joined by narrow stone bridges, dark woods, temples, spires, crystal ---
RG_GENS.shattered=function*(D){const C=rgCtx(D),{W,H,T}=C,M=Math.min(W,H),J=()=>(C.rnd()-.5)*.05;
 const isl=[[.5,.5,.17],[.5,.17,.1],[.22,.28,.11],[.78,.28,.11],[.17,.63,.1],[.82,.63,.12],[.3,.85,.1],[.7,.85,.1],[.37,.38,.05],[.63,.4,.05]]
  .map(([x,y,r],k)=>[W*(x+(k?J():0)),H*(y+(k?J():0)),M*r*(1+C.rnd()*.12),M*r*(1+C.rnd()*.12)]);
 rgLand(C,isl,.75,16);yield;rgKeep(C,60);yield;
 // narrow stone bridges join every island to the rest
 for(let g=0;g<30;g++){const{lab,comps}=rgLabel(C,i=>T[i]!==0);if(comps.length<2)break;let main=0;for(let k=1;k<comps.length;k++)if(comps[k].length>comps[main].length)main=k;
  const path=rgRoute(C,comps[main],i=>T[i]!==0&&lab[i]!==main,j=>T[j]===0?1.3:1);if(!path)break;for(const i of path)if(T[i]===0){T[i]=11;C.bridges.push(i);C.keep[i]=1}yield}
 const dw=rgDist(C,i=>T[i]===0);
 for(let i=0;i<C.N2;i++)if(T[i]&&T[i]!==11){const x=i%W,y=(i/W)|0;T[i]=dw[i]<=1?1:C.fbm(x,y,14,5)>.56?7:13;if(dw[i]>4&&C.fbm(x,y,9,8)>.74)T[i]=3}
 rgDock(C,'n',1);yield;
 const tp=rgSite(C,.5,.5,17,13);rgFlat(C,tp,(x,y)=>C.fbm(x,y,4,6)>.64?13:11);const[tx,ty]=rgCenter(tp);
 rgLm(C,'temple',tx-3,tp.y+2,7,4,{use:'look',name:'The Fractured Temple',text:'The Fractured Temple. A crack runs through its heart, and a violet light leaks from the sealed doors.'});rgMark(C,'fractured_temple','The Fractured Temple',tx,ty);
 for(const[a,b]of[[-6,1],[6,1],[-6,4],[6,4]])rgLm(C,'pillar',tx+a,tp.y+2+b,1,1,{v:'dark'});
 [[.26,.24],[.74,.24],[.16,.6],[.63,.4]].forEach(([fx,fy],k)=>{const q=rgSite(C,fx,fy,5,5);rgFlat(C,q,11);
  rgLm(C,'spire',q.x+1,q.y+2,2,2,{use:'look',name:'A Silent Spire',text:'A Silent Spire. No sound reaches you here, not even the sea. Its twin towers watch from other islands.'});rgMark(C,'spire'+k,'A Silent Spire',q.x+2,q.y+3)});
 const cb=rgSite(C,.82,.63,16,14);const[cx,cy]=rgCenter(cb);
 for(let y=cb.y;y<cb.y+cb.h;y++)for(let x=cb.x;x<cb.x+cb.w;x++){const i=y*W+x,d=Math.hypot((x-cx)/7,(y-cy)/6);if(d<1){T[i]=13;C.zone[i]=4}else if(d<1.25&&T[i]&&C.rnd()<.5)C.O[i]={t:'rock',hp:OHP.rock||3}}
 rgSign(C,cx,cb.y+cb.h-1,'The Crystal Basin','The Crystal Basin: a hollow full of crystals that hum when you get close. Miners would pay a fortune for these.');rgMark(C,'crystal_basin','The Crystal Basin',cx,cy);
 const town=rgSite(C,.7,.86,20,14);rgFlat(C,town,13);rgRes(C,'shat_town','town',town);
 const ds=[[.2,.33],[.8,.33],[.3,.86]].map(([a,b],k)=>{const q=rgSite(C,a,b,8,8);rgFlat(C,q,13);rgRes(C,'shat_dun'+(k+1),'dungeon',q);return q});
 const hub=rgSite(C,.5,.64,12,9);rgFlat(C,hub,11);rgRes(C,'shat_hub','hub',hub);
 const arena=rgSite(C,.37,.5,14,14);rgFlat(C,arena,13);rgRes(C,'shat_arena','boss',arena);rgRes(C,'shat_crystal','resource',cb);
 const st={trail:11,pass:11,wide:1};for(const q of[tp,cb,town,hub,arena,...ds]){rgTrail(C,C.spawn,rgSouth(q),st);yield}
 for(const q of C.rects)if(q.w===5){rgTrail(C,C.spawn,[q.x+2,q.y+4],st);yield}
 yield;rgScatter(C,(t,x,y,z,r)=>z===4?(r<.12?'ore:crystal':null):t===7?(r<.28?'tree:dark':r<.3?'rock':null):t===13?(r<.06?'tree:dark':r<.08?'rock':r<.083?'ore:crystal':null):t===1?(r<.015?'rock':null):null);
 yield;rgConnect(C,t=>'rock');return rgFinish(C)};

for(const id in RG_GENS)RG_GEN[id]=D=>rgRunSync(RG_GENS[id](D));
// a region built in slices of a few milliseconds, so the crossing never freezes the game
function rgJob(id){const D=WORLD_REGIONS[id];return{id,it:RG_GENS[id]?RG_GENS[id](D):null,done:false,err:null,G:null}}
function rgJobStep(J,budget){if(J.done)return true;const t0=performance.now();try{if(!J.it)throw new Error('no generator for '+J.id);
  while(performance.now()-t0<budget){const r=J.it.next();if(r.done){J.G=r.value;J.done=true;break}}}catch(e){J.err=e;J.done=true}return J.done}
// --- landmark and resource sprites ---
const RGPAL2={moss:hdShadeOf('#7c7c68',5),dark:hdShadeOf('#3e3a46',5),black:hdShadeOf('#2c282c',5),purp:hdShadeOf('#625478',5),canvas:hdShadeOf('#c8b48a',5),bark:hdShadeOf('#6a4428',5),
 leafd:hdShadeOf('#2c6232',5),leafv:hdShadeOf('#3e2e5a',5),char:hdShadeOf('#3a2e28',5),crys:hdP(['#4a2a8a','#6a44b8','#9070e0','#c0a8f8','#f0e8ff'])};
function rgSprite(k,v){const P2=RGPAL2;switch(k){
 case'elder':return hdK('lmE',-40,-100,176,132,p=>{p.ell(48,58,60,10,P2.bark,-.15);p.box(22,-70,74,62,P2.bark,10);for(const x of[32,46,60])p.F(x,-60,x+2,56,P2.bark[1]);
  for(const[x,y,rx,ry]of[[48,-120,84,50],[-14,-90,40,30],[112,-90,40,30],[16,-160,46,32],[82,-160,46,32],[48,-184,42,24]])p.ell(x,y,rx,ry,P2.leafd,.02);
  for(const[x,y,r]of[[20,-140,14],[70,-170,12],[96,-118,14],[0,-96,10],[52,-110,16]])p.ell(x,y,r,r*.7,LEAFP,.2)});
 case'ruinwall':return hdK('lmW'+v,0,-14,16,30,p=>{const t=v?-24:-12;p.box(0,t,32,32,P2.moss,2);for(let y=t+8;y<32;y+=8)p.F(0,y,32,y+1,P2.moss[0]);for(let y=t;y<32;y+=16)p.F(15,y,16,y+8,P2.moss[0]);p.ell(16,t+1,14,4,LEAFP,.1)});
 case'pillar':return v==='moss'?hdK('lmPm',0,-15,16,31,p=>{p.box(2,26,30,32,P2.moss,1);p.box(6,-14,26,26,P2.moss,0);for(let x=9;x<24;x+=4)p.F(x,-12,x+1,25,P2.moss[1]);p.ell(16,-14,10,4,LEAFP,.1)})
  :hdK('lmPd',0,-15,16,31,p=>{p.box(2,26,30,32,P2.dark,1);p.box(6,-22,26,26,P2.purp,0);for(let x=9;x<24;x+=4)p.F(x,-20,x+1,25,P2.purp[1]);p.box(2,-30,30,-22,P2.dark,1,.1)});
 case'vault':return hdK('lmV',-2,-30,52,62,p=>{p.box(0,-30,96,64,P2.moss,3);p.box(-4,-56,100,-26,P2.dark,4);p.box(34,8,62,64,hdShadeOf('#3a2a1a',4),2);
  for(let k=0;k<26;k++){p.put(36+k,18+k,METP[1]);p.put(60-k,18+k,METP[1])}p.box(42,30,54,42,GOLDP,2);for(const[x,y,r]of[[10,-30,9],[84,-28,8],[60,-56,10]])p.ell(x,y,r,r*.5,LEAFP,.1)});
 case'tent':return hdK('lmT',-2,-20,36,36,p=>{for(let y=-38;y<30;y++){const t=(y+38)/68,hw=Math.round(4+t*30);for(let x=-hw;x<hw;x++)p.put(32+x,y,P2.canvas[Math.max(0,Math.min(4,Math.round(3-t*1.5+(x<0?.5:-.5))))])}
  for(let y=-6;y<30;y++){const hw=Math.round((y+6)*.28);for(let x=-hw;x<hw;x++)p.put(32+x,y,hdC('#2a2018'))}p.F(31,-44,33,-34,WDP[1])});
 case'firepit':return hdK('lmF',0,0,16,16,p=>{for(let a=0;a<10;a++){const t=a/10*6.283;p.ell(16+Math.cos(t)*11,18+Math.sin(t)*6,3,2.4,STP,.1)}p.ell(16,18,7,3.6,hdShadeOf('#4a4040',4));p.F(10,17,22,19,WDP[0])});
 case'crates':return hdK('lmC',0,-6,16,22,p=>{p.box(2,4,30,30,WDP,1);p.box(6,-10,26,6,WDP,1,.1);p.F(2,16,30,17,WDP[0]);p.F(15,4,17,30,WDP[0])});
 case'shrine':return hdK('lmS',0,-16,16,32,p=>{p.box(4,22,28,32,P2.moss,1);p.box(9,-28,23,24,P2.moss,1,.05);p.F(14,-20,18,-8,hdC('#9ad0a0'));p.ell(16,-28,7,3,LEAFP,.1)});
 case'sign':return hdK('lmSg',0,-12,16,28,p=>{p.box(14,-6,18,30,WDP,0);p.box(2,-22,30,-4,WLP,1);for(const y of[-17,-12])p.F(6,y,26,y+1,WDP[1])});
 case'lighthouse':return hdK('lmL',-2,-104,36,136,p=>{for(let y=-176;y<64;y++){const hw=Math.round(18+(y+176)*.04);for(let x=-hw;x<hw;x++)p.put(32+x,y,P2.black[Math.max(0,Math.min(4,(x<-hw/3?3:x<hw/3?2:1)+((Math.floor((y+176)/40)&1)?0:-1)))])}
  p.box(6,-190,58,-176,P2.dark,1);p.box(14,-206,50,-190,hdShadeOf('#202830',4),1);p.F(30,-204,40,-192,hdC('#8aa0b0'));for(let y=-222,w=2;y<-206;y++,w+=1.2)p.F(Math.round(32-w),y,Math.round(32+w),y+1,P2.black[1]);p.box(26,30,38,64,hdShadeOf('#1a1418',4),1)});
 case'bwall':return hdK('lmB',0,-18,16,34,p=>{p.box(0,-30,32,32,P2.dark,1);for(const x of[0,20])p.F(x,-36,x+12,-30,P2.dark[2]);for(let y=-22;y<32;y+=9)p.F(0,y,32,y+1,P2.dark[0])});
 case'btower':return hdK('lmBt',-2,-46,36,78,p=>{p.box(-2,-80,66,64,P2.dark,3);for(let x=-2;x<66;x+=16)p.F(x,-92,x+10,-80,P2.dark[2]);p.F(29,-50,35,-26,hdC('#141014'));for(let y=-68;y<64;y+=10)p.F(-2,y,66,y+1,P2.dark[0])});
 case'sealgate':return hdK('lmG',0,-24,48,40,p=>{p.box(0,-46,96,32,P2.dark,3);p.box(18,-28,78,32,hdShadeOf('#120c10',4),6);for(let x=22;x<76;x+=8)p.F(x,-26,x+3,32,METP[2]);for(let y=-20;y<32;y+=12)p.F(20,y,76,y+2,METP[1]);p.box(42,-4,54,8,GOLDP,2)});
 case'observatory':return hdK('lmO',-4,-56,72,104,p=>{p.box(0,-12,128,96,STP,4);for(let x=10;x<128;x+=22)p.F(x,0,x+3,92,STP[1]);p.ell(64,-12,60,48,STP,.1,(x,y)=>y<-12&&!(x>74&&x<104&&y<-24));
  for(let k=0;k<44;k++)p.F(70+k,-30-Math.round(k*.8),74+k,-26-Math.round(k*.8),METP[2]);p.box(52,40,76,96,hdShadeOf('#20202a',4),2)});
 case'sealdoor':return hdK('lmD',0,-28,48,44,p=>{p.box(4,-52,92,32,P2.dark,4);p.box(24,-34,72,32,hdShadeOf('#4a3a5a',4),3);for(const[x,y]of[[34,-20],[48,-26],[62,-20],[40,4],[56,4],[48,16]])p.F(x,y,x+4,y+4,GOLDP[2])});
 case'cart':return hdK('lmK',0,-2,16,18,p=>{p.box(2,4,30,24,METP,2);p.ell(10,-0,6,4,hdShadeOf('#8a6a50',4));p.ell(20,0,6,4,hdShadeOf('#d88038',4));p.ell(8,28,4,4,METP);p.ell(24,28,4,4,METP)});
 case'wtower':return hdK('lmWt',-2,-62,36,94,p=>{p.box(4,-90,60,64,STP,2);for(let y=-80;y<64;y+=10)p.F(4,y,60,y+1,STP[0]);p.box(-2,-108,66,-88,WDP,2);for(let y=-130,w=2;y<-108;y++,w+=1.5)p.F(Math.round(32-w),y,Math.round(32+w),y+1,WDP[2]);p.F(28,-70,36,-56,hdC('#141414'))});
 case'temple':return hdK('lmTp',-8,-70,240,134,p=>{p.box(-12,44,236,64,P2.dark,2);p.box(0,-56,224,46,P2.purp,2);for(let x=12;x<224;x+=26)p.box(x,-50,x+10,44,P2.dark,1,.15);
  p.box(-8,-92,232,-54,P2.dark,2,(0));p.box(26,-122,198,-90,P2.dark,2);for(let k=0;k<30;k++)p.F(104+(k&3),-122+k*5,108+(k&3),-118+k*5,hdC('#0e0814'));p.box(92,-8,132,46,hdShadeOf('#140c1c',4),2)});
 case'spire':return hdK('lmSp',-4,-140,40,172,p=>{for(let y=-276;y<64;y++){const hw=Math.round(12+(y+276)*.05);for(let x=-hw;x<hw;x++)p.put(32+x,y,P2.purp[x<-hw/3?3:x<hw/3?2:1])}
  for(let k=0;k<6;k++)p.F(26+k*3,-290+(k%3)*8,29+k*3,-276,P2.purp[2]);for(const y of[-200,-140,-80,-20])p.F(30,y,34,y+12,hdC('#c090ff'))});
 case'dead':return hdK('obD'+v,-12,-34,40,50,p=>{p.box(26,-40,36,28,P2.char,2);for(const[sx,sy,dx,dy,n]of[[30,-20,-1,-1,14],[34,-28,1,-1,12],[30,-36,-1,-1.4,8],[32,-12,1,-.6,12]])for(let k=0;k<n;k++)p.F(Math.round(sx+dx*k),Math.round(sy+dy*k),Math.round(sx+dx*k)+3,Math.round(sy+dy*k)+2,P2.char[1]);p.ell(31,28,9,3,P2.char,-.2)});
 case'dark':return hdK('obK'+v,-14,-40,44,56,p=>{p.box(26,-4,38,30,P2.bark,2);for(const[x,y,rx,ry]of[[32,-30,24,20],[18,-14,14,11],[46,-14,14,11],[32,-48,15,11]])p.ell(x,y,rx,ry,P2.leafv,.05)});
 case'crystal':return hdK('obX'+v,0,-8,16,24,p=>{const CP=P2.crys;for(const[x,h,w]of[[10,22,4],[18,30,5],[25,16,3]]){const top=30-h;for(let y=top;y<30;y++){const t=(y-top)/h,hw=Math.max(1,Math.round(w*Math.min(1,t*3)));for(let xx=-hw;xx<hw;xx++)p.put(x+xx,y,CP[xx<-hw/3?4:xx<hw/3?3:1])}}})}
 return null}
function rgDrawLm(it,tm){const x0=it.x*16,y0=it.y*16,w=(it.w||1)*16;if(it.k!=='firepit'&&it.k!=='sign')shd(x0+w/2,y0+(it.h||1)*16-2,w*.9);
 const sp=rgSprite(it.k,it.v);if(sp)hdPut(sp,x0,y0);
 if(it.k==='temple'||it.k==='spire'||it.k==='sealdoor'){const p=.5+.5*Math.sin(tm*2+it.x),cx=it.k==='temple'?x0+56:x0+16,cy=it.k==='temple'?y0+8:it.k==='spire'?y0-70:y0-4;
  g.fillStyle='rgba(176,128,255,'+(.12+.12*p)+')';g.beginPath();g.arc(cx,cy,it.k==='spire'?20:26,0,6.283);g.fill()}}
const _df50=drawFurn;drawFurn=function(it,tm){
 if(it.t==='lm'){rgDrawLm(it,tm);return}
 if(it.t==='_obj'){const o=it.o,bx=it.x*16+8,by=it.y*16+14,s=o.shake>0?(o.shake-=.016,Math.round(Math.sin(tm*60))):0;
  if(o.v==='dead'||o.v==='dark'||o.v==='crystal'){shd(bx,by-1,o.v==='crystal'?12:18);hdPut(rgSprite(o.v,(it.x*7+it.y*3)&1),it.x*16+s,it.y*16);
   if(o.v==='crystal'){g.fillStyle='rgba(190,150,255,'+(.1+.08*Math.sin(tm*2+it.x))+')';g.beginPath();g.arc(bx,by-8,12,0,6.283);g.fill()}return}
  if(OBJHD&&OBJHD(o,it.x,it.y,bx+s,by,0,tm)){if(o.v==='moss'){Rg(bx-5+s,by-9,4,2,'#5a8a3a');Rg(bx+1+s,by-8,3,1,'#7ab060')}return}}
 _df50(it,tm)};

// --- drawing extras: bridges, stairs, lava shimmer, water glints; lava glows at night ---
function rgOverlay(R,v){const W=R.w,x0=Math.floor(v.x0/16)-1,x1=Math.ceil(v.x1/16)+1,y0=Math.floor(v.y0/16)-1,y1=Math.ceil(v.y1/16)+1,T=R.tiles,inV=i=>{const x=i%W,y=(i/W)|0;return x>=x0&&x<=x1&&y>=y0&&y<=y1};
 for(const i of R.bridges){if(!inV(i))continue;const x=i%W,y=(i/W)|0,X=x*16,Y=y*16;
  if(!T[i-1])Rg(X,Y,2,16,'#4e4a42');if(!T[i+1])Rg(X+14,Y,2,16,'#4e4a42');if(!T[i-W])Rg(X,Y,16,2,'#4e4a42');if(!T[i+W]){Rg(X,Y+14,16,2,'#4e4a42');Rg(X,Y+16,16,3,'rgba(0,0,0,.25)')}}
 const SS=R.stairSet||(R.stairSet=new Set(R.stairs));
 for(const i of R.stairs){if(!inV(i))continue;const X=(i%W)*16,Y=((i/W)|0)*16;for(let k=0;k<4;k++){Rg(X,Y+k*4,16,1,'rgba(255,255,255,.25)');Rg(X,Y+k*4+3,16,1,'rgba(0,0,0,.3)')}
  if(!SS.has(i-1)){Rg(X,Y,3,16,'#6a6258');Rg(X,Y,1,16,'#3e3830');Rg(X+3,Y,1,16,'rgba(0,0,0,.25)')}
  if(!SS.has(i+1)){Rg(X+13,Y,3,16,'#5a5248');Rg(X+15,Y,1,16,'#3e3830');Rg(X+12,Y,1,16,'rgba(0,0,0,.18)')}
  if(!SS.has(i+W)&&!SS.has(i+W-1)&&!SS.has(i+W+1))Rg(X,Y+16,16,2,'rgba(0,0,0,.22)')}
 const tm=performance.now()/1000;
 for(const i of R.lava){if(!inV(i))continue;const x=i%W,y=(i/W)|0,a=.07+.07*Math.sin(tm*2.2+x*.9+y*.7);g.fillStyle='rgba(255,210,90,'+a.toFixed(3)+')';g.fillRect(x*16,y*16,16,16)}
 g.fillStyle='rgba(214,238,255,.55)';for(let y=Math.max(1,y0);y<=Math.min(R.h-2,y1);y++)for(let x=Math.max(1,x0);x<=Math.min(W-2,x1);x++){const i=y*W+x;if(T[i]!==0||T[i-1]||T[i+1]||T[i-W]||T[i+W])continue;const r=hdH(x,y+R.w);
  for(let k=0;k<2;k++){const ph=(tm*(.35+r*.3)+r*7+k*.5)%1,a=Math.sin(ph*Math.PI);if(a<.25)continue;g.globalAlpha=a;g.fillRect(x*16+((r*97+k*41)%12)+ph*3,y*16+3+k*8+((r*13)%3),2.5,.5)}}g.globalAlpha=1}
function rgGlows(R){if(!R.lava.length||dark()<.08)return[];const v=rgView(),cells=new Map();   // one glow per 4x4-tile patch of lava, at most 8: cheap on phones
 for(const i of R.lava){const x=i%R.w,y=(i/R.w)|0;if(x*16<v.x0-48||x*16>v.x1+48||y*16<v.y0-48||y*16>v.y1+48)continue;const k=(x>>2)+','+(y>>2),c=cells.get(k);if(c){c.x+=x;c.y+=y;c.n++}else cells.set(k,{x,y,n:1})}
 const out=[];for(const c of cells.values()){if(c.n<3)continue;out.push({x:c.x/c.n*16+8,y:c.y/c.n*16+8,life:99});if(out.length>=8)break}return out}

// --- gathering: HIT a tree, rock, vein or bush in front of you (same yields, XP and perks as Hollow) ---
function rgObjAt(R,tx,ty){for(const it of rgNear(R,tx,ty,tx,ty))if(it.t==='_obj'&&!it.gone&&it.x===tx&&it.y===ty)return it;return null}
function rgGather(R,it){const o=it.o,t=o.t,sk=SKOF[t];if(!sk){swing=.25;return}
 if(t==='rock'&&TL.pick<1){say('Need a pickaxe - craft one!');swing=.25;sfx('swish');return}
 if(t==='ore'){if(TL.pick<2){say('This vein needs a stone pickaxe or better.');swing=.25;sfx('swish');return}if(lvOf(2)<5){say('You need Mining 5 to mine iron.');swing=.25;sfx('swish');return}}
 swing=.25/(1+gSpeed(sk));if(P_(sk,RECP[sk]))swing*=.8;ACTW[sk]=10;
 o.hp-=t==='tree'||t==='pine'?1+TL.axe:t==='rock'?1+TL.pick:t==='ore'?TL.pick:1;o.shake=.15;sfx(sk===1?'chop':sk===2?'mine':'rustle');if(o.hp>0)return;
 const gains={},add=(k,n)=>{inv[k]=(inv[k]|0)+n;gains[k]=(gains[k]||0)+n};
 if(t==='tree'||t==='pine'){const n=2+(Math.random()<lvOf(1)*.01?1:0);add('wood',n);say('+'+n+' wood');addXp(1,t==='pine'?28:25)}
 else if(t==='rock'){if(lvOf(2)>=15&&TL.pick>=2&&Math.random()<.3){add('iron',1);say('+1 iron ore');addXp(2,35)}else{const n=2+(Math.random()<lvOf(2)*.01?1:0);add('stone',n);say('+'+n+' stone');addXp(2,18)}}
 else if(t==='ore'){const n=1+(Math.random()<lvOf(2)*.008?1:0);add('iron',n);addXp(2,40);if(o.v==='crystal'&&Math.random()<.12){const gk=Math.random()<.5?'sapphire':'emerald';inv[gk]=(inv[gk]|0)+1;say('+'+n+' iron ore and a '+iname(gk)+'!')}else say('+'+n+' iron ore')}
 else if(t==='cactus'){add('cfruit',2);add('wood',1);say('+2 cactus fruit and +1 wood');addXp(3,14)}
 else{const n=2+(Math.random()<lvOf(3)*.01?1:0);add('berry',n);say('+'+n+' berries');addXp(3,10)}
 const x=it.x*16+8,y=it.y*16;gBoost(sk,gains,x,y);
 if(sk===1){if(P_(1,'wc_bark')&&Math.random()<.1){if(Math.random()<.5){inv.berry=(inv.berry|0)+2;gTxt(x,y-38,'+2 berries','#f05878')}else{inv.wheatseed=(inv.wheatseed|0)+1;gTxt(x,y-38,'+1 wheat seed','#c8a060')}}
  if(P_(1,'wc_bounty')&&Math.random()<.15){inv.wood=(inv.wood|0)+2;gTxt(x,y-38,'+2 wood','#48c048')}}
 if(sk===2&&P_(2,'mn_hidden')&&Math.random()<.1){if(Math.random()<.5){inv.stone=(inv.stone|0)+2;gTxt(x,y-38,'+2 stone','#90a8d0')}else{inv.iron=(inv.iron|0)+1;gTxt(x,y-38,'+1 iron ore','#90a8d0')}}
 if(sk===3&&P_(3,'fg_hidden')&&Math.random()<.1){const sd=['wheatseed','carrotseed','pumpkinseed'][Math.floor(Math.random()*3)];inv[sd]=(inv[sd]|0)+1;gTxt(x,y-38,'+1 '+iname(sd),'#e060a0')}
 if(Math.random()<sumP(sk,STAYP)){o.hp=OHP[t]||3;gTxt(x,y-46,sk===3?'It grows straight back!':'Still standing!',SKC[sk])}
 else{it.gone=true;rgCellDel(R,it);R.solid.delete(it.y*R.w+it.x);R.gone.push({it,at:CLK})}
 setTimeout(()=>sfx('pickup'),90);saveLocal()}
const _atk50=attack;attack=function(){const R=SCENE&&SCENE.room;
 if(R&&R.region&&!dead&&!menuOpen&&!pnOpen&&!BUILD&&!FISH&&swing<=0){const[fx,fy]=front(13);
  if(!en.some(n=>!n.dead&&Math.hypot(n.x-fx,n.y-fy)<(n.big?24:16))){const tx=Math.floor(fx/16),ty=Math.floor(fy/16),it=rgObjAt(R,tx,ty);if(it){rgGather(R,it);return}
   for(const l of R.useItems)if(l.use==='look'&&tx>=l.x&&ty>=l.y&&tx<l.x+(l.w||1)&&ty<l.y+(l.h||1)){swing=.25;rgLook(l);return}}}
 _atk50()};

// --- region life: resources grow back, landmarks are discovered, spawns stay away from quiet places ---
function rgSeen(reg,id){const s=WORLD_STATE[reg];return!!(s&&s.seen&&s.seen.includes(id))}
function rgTick(R,dt){for(let j=R.gone.length-1;j>=0;j--){const g2=R.gone[j];if(CLK-g2.at>240){const it=g2.it,i=it.y*R.w+it.x;if(Math.hypot(P.x-(it.x*16+8),P.y-(it.y*16+8))>40&&!en.some(n=>Math.floor(n.x/16)===it.x&&Math.floor(n.y/16)===it.y)){
  it.gone=false;it.o.hp=OHP[it.o.t]||3;rgCellAdd(R,it);R.solid.add(i);R.gone.splice(j,1)}}}
 const tx=P.x/16,ty=P.y/16;for(const l of R.lms){if(Math.abs(l.x-tx)>7||Math.abs(l.y-ty)>7||rgSeen(R.region,l.id))continue;
  const s=WORLD_STATE[R.region]||(WORLD_STATE[R.region]={});(s.seen||(s.seen=[])).push(l.id);say('Discovered: '+l.name);msgT=4;sfx('quest');drops.push({x:P.x,y:P.y-34,t:0,tx:l.name,c:'#f8e070'});saveLocal(true)}}
function rgQuiet(R,tx,ty){for(const q of R.reserved)if(tx>=q.x-2&&ty>=q.y-2&&tx<q.x+q.w+2&&ty<q.y+q.h+2)return true;for(const l of R.lms)if(Math.abs(l.x-tx)<6&&Math.abs(l.y-ty)<6)return true;return false}
const RG_MOBS={briarwood:{hp:1.6,t:[['wolf',.5],['slime',1]]},ashfall:{hp:2.2,t:[['skel',.6],['slime',1]]},ironcrest:{hp:2.8,t:[['wolf',.55],['skel',1]]},shattered:{hp:3.4,t:[['skel',.4],['wolf',.7],['slime',1]]}};
function rgMob(reg,x,y){const M=RG_MOBS[reg]||{hp:1,t:[['slime',1]]},r=Math.random(),type=(M.t.find(([,p])=>r<p)||M.t[M.t.length-1])[0],base=type==='skel'?6:type==='wolf'?5:3;
 const n={x,y,hp:Math.round(base*M.hp),kx:0,ky:0,type};if(type==='skel')n.tcd=1+Math.random()*2;if(type==='wolf'&&reg==='ironcrest'){n.vr='snow';n.dmg=1}return n}
function rgLook(it){say(it.text||it.name||'');msgT=6;sfx('talk')}
function rgLmList(R){const s=WORLD_STATE[R.region]&&WORLD_STATE[R.region].seen||[],f=R.lms.filter(l=>s.includes(l.id));
 return'<div class="qc" style="font-size:12px"><b>Landmarks found: '+f.length+' / '+R.lms.length+'</b>'+(f.length?'<br>'+[...new Set(f.map(l=>l.name))].join(' · '):'<br><small>Explore to find them.</small>')+'</div>'}
