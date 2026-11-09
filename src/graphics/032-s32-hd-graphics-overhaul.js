// ---------------------------------------------------------------- 32. HD graphics overhaul
// Drawn at 2 texels per world pixel (Z is always even, so one texel is a whole number of screen pixels).
// - Terrain is baked into 8x8-tile chunks: wobbly natural borders, shaded/dithered ground, grass tufts and
//   flowers, cracked stone, dunes, cliff faces, wet sand, shore foam and water that deepens away from land.
// - Trees, pines, rocks, ore, bushes, cacti and slimes are shaded sprites (several variants each).
// - People are smoothed (EPX) and get thin outlines; soft round shadows.
// - Fences, stone walls and gates are redrawn; a gate in a north-south fence turns sideways.
const hdH=(x,y)=>{let n=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+421)|0;n=Math.imul(n^(n>>>13),1274126177);n^=n>>>16;return(n>>>0)/4294967296};
const hdVN=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return(hdH(xi,yi)*(1-u)+hdH(xi+1,yi)*u)*(1-v)+(hdH(xi,yi+1)*(1-u)+hdH(xi+1,yi+1)*u)*v};
const hdC=hex=>{const n=parseInt(hex.slice(1),16);return(0xff000000|((n&255)<<16)|(n&0xff00)|(n>>16))>>>0};
const HDBY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
const hdQ=(v,n,x,y)=>Math.max(0,Math.min(n-1,Math.floor(v*(n-1)+HDBY[(y&3)*4+(x&3)])));
const hdP=a=>a.map(hdC);
function hdBuf(w,h){return{w,h,d:new Uint32Array(w*h),id:new Uint8Array(w*h)}}
function hdCan(b){const c=document.createElement('canvas');c.width=b.w;c.height=b.h;c.hd=2;try{const x=c.getContext('2d'),im=x.createImageData(b.w,b.h);if(im.data.length===b.d.length*4){new Uint32Array(im.data.buffer).set(b.d);x.putImageData(im,0,0)}}catch(e){}return c}
const hdSet=(b,x,y,col,id)=>{x|=0;y|=0;if(x<0||y<0||x>=b.w||y>=b.h)return;b.d[y*b.w+x]=col;b.id[y*b.w+x]=id||1};
// a shaded dome / sphere (light from the upper left), dithered into the palette
function hdSph(b,cx,cy,rx,ry,pal,o){o=o||{};const P2=pal.length;
 for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const nx=(x+.5-cx)/rx,ny=(y+.5-cy)/ry,q=nx*nx+ny*ny;if(q>1)continue;
  if(o.cut!=null&&y>o.cut)continue;const nz=Math.sqrt(1-q);let v=(nx*-.55+ny*-.65+nz*.52)*.5+.5;v=v*(o.k||1)+(o.b||0);
  if(o.nz)v+=(hdH((x>>1)+(o.s||0),(y>>1)+7)-.5)*o.nz;if(o.fn)v=o.fn(v,x,y,nx,ny);hdSet(b,x,y,pal[hdQ(v,P2,x,y)],o.id)}}
function hdOutline(b,cols){const add=[];for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++){const i=y*b.w+x;if(b.id[i])continue;let n=0;
 if(x>0&&b.id[i-1])n=b.id[i-1];else if(x<b.w-1&&b.id[i+1])n=b.id[i+1];else if(y>0&&b.id[i-b.w])n=b.id[i-b.w];else if(y<b.h-1&&b.id[i+b.w])n=b.id[i+b.w];if(n)add.push(i,n)}
 for(let k=0;k<add.length;k+=2){b.d[add[k]]=cols[add[k+1]]||cols[1];b.id[add[k]]=200}}
let hdSeed=1;const hdR=()=>(hdSeed=(hdSeed*16807)%2147483647)/2147483647;

// ---------- flora and rocks ----------
const HDLEAF=hdP(['#1f5a2a','#2b7432','#3a9038','#52aa44','#74c656','#9ade6e']),HDBARK=hdP(['#4a2a14','#6a3e1e','#8a5428','#a86c36']);
function hdTree(seed,autumn){hdSeed=seed*977+13;const b=hdBuf(64,76),cx=32,cy=31;
 // trunk with roots and bark
 for(let y=44;y<72;y++){const flare=y>64?Math.round((y-64)*.75):0,x0=27-flare,x1=37+flare;for(let x=x0;x<x1;x++){const t=(x-x0)/(x1-x0);let v=1-t*1.1+(hdH(x,y>>2)-.5)*.25;if(y<54)v-=.35;hdSet(b,x,y,HDBARK[hdQ(v,4,x,y)],2)}}
 for(let k=0;k<4;k++){const x=29+Math.floor(hdR()*7),y0=54+Math.floor(hdR()*14);for(let y=y0;y<y0+4+hdR()*4;y++)hdSet(b,x,y,HDBARK[0],2)}
 const pal=autumn?hdP(['#6a2a14','#9a3e1a','#c85a22','#e07e2e','#f0a640','#f8c868']):HDLEAF;
 const cl=[[cx,cy,19,16]];const n=7+Math.floor(hdR()*3);for(let i=0;i<n;i++){const a=i/n*Math.PI*2+hdR()*.5,r=9+hdR()*4;cl.push([cx+Math.cos(a)*(26-r)*.95,cy+Math.sin(a)*(22-r)*.85+2,r,r*.9])}
 cl.sort((p,q)=>p[1]-q[1]);for(const[x,y,rx,ry]of cl)hdSph(b,x,y,rx,ry,pal,{nz:.32,s:seed,id:1,b:-.02,fn:(v,X,Y)=>v-(Y-cy)/48});
 for(let k=0;k<26;k++){const a=hdR()*Math.PI*2,r=hdR()*20,x=cx+Math.cos(a)*r-6,y=cy+Math.sin(a)*r*.8-9;const i=(y|0)*b.w+(x|0);if(b.id[i]===1)hdSet(b,x,y,pal[pal.length-1])}
 hdOutline(b,{1:hdC(autumn?'#3a160a':'#13361c'),2:hdC('#2a160a')});return hdCan(b)}
const HDPINE=hdP(['#0f3424','#18492f','#22603c','#2f784a','#45925a']),HDSNOW=hdP(['#9fb4d4','#c8d6ea','#e6eef8','#ffffff']);
function hdPine(seed){hdSeed=seed*131+7;const b=hdBuf(52,76),cx=26;
 for(let y=60;y<72;y++)for(let x=23;x<29;x++)hdSet(b,x,y,HDBARK[hdQ(1-(x-23)/6,4,x,y)],2);
 const tiers=[[4,24,9],[14,38,14],[26,52,19],[38,64,24]];
 for(const[yt,yb,wb]of tiers){const sn=hdR()*2;for(let y=yt;y<=yb;y++){const t=(y-yt)/(yb-yt),hw=1.5+wb*t,droop=(x)=>Math.abs(x-cx)/hw;for(let x=Math.floor(cx-hw);x<=Math.ceil(cx+hw);x++){const ax=(x+.5-cx)/hw;if(Math.abs(ax)>1)continue;
   if(y>yb-3*(1-Math.abs(ax))-1+(hdH(x,y)>.5?1:0)&&Math.abs(ax)<.9&&y>yb-2)continue;
   let v=.62-ax*.42-t*.25+(hdH(x>>1,y>>1)-.5)*.3;hdSet(b,x,y,HDPINE[hdQ(v,5,x,y)],1);
   const snowLine=yt+(yb-yt)*(.22+.12*Math.sin(x*.9+sn))+Math.abs(ax)*3;if(y<snowLine&&ax<.75)hdSet(b,x,y,HDSNOW[hdQ(.75-ax*.45-(y-yt)/(yb-yt),4,x,y)],1)}}}
 hdOutline(b,{1:hdC('#0b2418'),2:hdC('#2a160a')});return hdCan(b)}
const HDSTONE=hdP(['#3a3a48','#565666','#74748a','#9696aa','#babacc','#dcdce8']);
function hdRock(seed,ore){hdSeed=seed*311+5;const b=hdBuf(32,26),pal=ore?hdP(['#2c2c38','#44445a','#5c5c74','#7a7a92','#9c9cb4','#c0c0d4']):HDSTONE;
 const f=(v,x,y)=>v+(hdH((x/4|0)+seed*9,(y/3|0))-.5)*.22;
 hdSph(b,16,17,14,9.5,pal,{fn:f,id:1});hdSph(b,12+hdR()*4,12,9,7.5,pal,{fn:f,id:1,b:.06});if(hdR()<.6)hdSph(b,24,18,6,5,pal,{fn:f,id:1,b:-.04});
 for(let k=0;k<2;k++){let x=8+hdR()*14,y=12+hdR()*6;for(let j=0;j<5;j++){const i=(y|0)*b.w+(x|0);if(b.id[i])b.d[i]=pal[0];x+=hdR()<.5?1:-.4;y+=.8}}
 if(ore){for(let k=0;k<6;k++){const x=6+hdR()*20|0,y=9+hdR()*11|0;if(!b.id[y*b.w+x]||!b.id[(y+1)*b.w+x+2])continue;for(const[a,c,col]of[[0,0,'#f8b060'],[1,0,'#e88838'],[2,0,'#e88838'],[0,1,'#c86828'],[1,1,'#c86828'],[2,1,'#904018']])hdSet(b,x+a,y+c,hdC(col));if(k<2)hdSet(b,x,y-1,hdC('#fff4d0'))}}
 hdOutline(b,{1:hdC('#202028')});
 for(const x of[5,26])if(hdR()<.7){for(const[a,c]of[[0,0],[1,-1],[2,0],[1,-2],[-1,-1]])hdSet(b,x+a,23+c,hdC(c<-1?'#7ccf5e':'#3d8a36'),3)}
 return hdCan(b)}
function hdBush(seed){hdSeed=seed*53+3;const b=hdBuf(32,26),pal=hdP(['#1d5426','#2a6e30','#3a8a3a','#52a646','#72c256']);
 const cl=[[16,15,10,8],[9,16,7,6.5],[23,16,7,6.5],[13,10,7,6],[20,10,7,6]].map(([x,y,a,c])=>[x+hdR()*2-1,y+hdR()*2-1,a,c]);cl.sort((p,q)=>p[1]-q[1]);
 for(const[x,y,rx,ry]of cl)hdSph(b,x,y,rx,ry,pal,{nz:.3,s:seed,id:1});
 for(let k=0;k<7;k++){const x=6+hdR()*20|0,y=7+hdR()*14|0;if(b.id[y*b.w+x]!==1)continue;for(const[a,c,col]of[[0,0,'#e83040'],[1,0,'#d82838'],[0,1,'#c01c2c'],[1,1,'#a01020'],[-1,1,'#c01c2c'],[0,2,'#801018']])hdSet(b,x+a,y+c,hdC(col));hdSet(b,x,y,hdC('#ffb0b8'))}
 hdOutline(b,{1:hdC('#13361c')});return hdCan(b)}
function hdCactus(seed){hdSeed=seed*71+11;const b=hdBuf(32,46),pal=hdP(['#1c4c20','#286a28','#3a8a34','#56a848','#7ac460']);
 const col=(x0,x1,y0,y1)=>{const cx=(x0+x1)/2,hw=(x1-x0)/2;for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const ax=(x+.5-cx)/hw,top=y-y0<hw?Math.sqrt(Math.max(0,1-((y0+hw-y-.5)/hw)**2)):1;if(Math.abs(ax)>top)continue;
  let v=.62-ax*.5+((x-x0)%3===0?-.18:0);hdSet(b,x,y,pal[hdQ(v,5,x,y)],1)}};
 const ah=hdR()<.5;col(10,22,3,44);col(2,9,ah?12:16,30);for(let x=7;x<12;x++)for(let y=26;y<31;y++)hdSet(b,x,y,pal[2],1);
 col(23,30,ah?8:4,ah?22:18);for(let x=20;x<25;x++)for(let y=ah?18:14;y<(ah?23:19);y++)hdSet(b,x,y,pal[2],1);
 for(let k=0;k<22;k++){const x=hdR()*32|0,y=hdR()*44|0;if(b.id[y*b.w+x]===1)hdSet(b,x,y,hdC('#f0f0d0'))}
 if(seed%3===0)for(const[a,c,col2]of[[16,2,'#f86898'],[15,3,'#f86898'],[17,3,'#f86898'],[16,3,'#f8e060']])hdSet(b,a,c,hdC(col2),1);
 hdOutline(b,{1:hdC('#123216')});return hdCan(b)}
let HDSP=null;
function hdSprites(){if(HDSP)return HDSP;HDSP={tree:[1,2,3,4,5].map(s=>hdTree(s,false)),pine:[1,2,3].map(hdPine),rock:[1,2,3].map(s=>hdRock(s,false)),ore:[1,2].map(s=>hdRock(s+7,true)),bush:[1,2,3].map(hdBush),cactus:[1,2,3].map(hdCactus)};return HDSP}
// soft round shadows
const HDSH={};
function hdShadow(w){const k=Math.round(w*2);if(HDSH[k])return HDSH[k];const W2=k+2,H2=10,b=hdBuf(W2,H2),c=hdC('#000000')&0x00ffffff,rx=k/2,ry=4;
 for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){const q=((x+.5-W2/2)/rx)**2+((y+.5-H2/2)/ry)**2;if(q>1)continue;b.d[y*W2+x]=(c|((q>.6?44:72)<<24))>>>0}
 return HDSH[k]=hdCan(b)}
// shadows sit right under the feet (centred 1px above the old shadow's top row) so nothing looks like it floats
SHDHD=(x,y,w)=>{const c=hdShadow(w);g.drawImage(c,Math.round(x)-c.width/4,Math.round(y)-3.5,c.width/2,c.height/2)};
OBJHD=(o,x,y,bx,by,s,tm)=>{const S=hdSprites(),v=hdH(x,y),L=S[o.t];if(!L)return false;const sp=L[Math.floor(v*L.length)%L.length],w=sp.width/2,hh=sp.height/2;
 const sw=o.t==='tree'||o.t==='pine'?Math.sin(tm*1.3+x*.7+y*.3)*.5:0;
 shd(bx,by-1,o.t==='tree'?24:o.t==='pine'?18:o.t==='cactus'?12:15);
 const base=o.t==='tree'||o.t==='pine'?by+(o.t==='tree'?.5:.5):by+2;
 if(sw&&!s){const c=sp,top=base-hh,cut=Math.round(c.height*.225)*2;g.drawImage(c,0,0,c.width,cut,bx-w/2+Math.round(sw*2)/2,top,w,cut/2);g.drawImage(c,0,cut,c.width,c.height-cut,bx-w/2,top+cut/2,w,(c.height-cut)/2)}
 else g.drawImage(sp,bx-w/2+s,base-hh,w,hh);return true};
// ---------- terrain: baked 8x8-tile chunks (256x256 texels) ----------
const HDCK=new Map(),HDCS=8,HDEL=[0,1,2,3,2,1,3];
const HDT={sand:hdP(['#d4b268','#e2c47e','#eed492','#f8e4ac']),wet:hdP(['#c09c58','#ccaa66','#d8b674']),grass:hdP(['#3c8836','#48993c','#56ac46','#66be50','#7ccd5e']),
 rock:hdP(['#867868','#988a78','#ab9c88','#beb09a','#d0c4ae']),snow:hdP(['#c4d0e4','#d6e0ee','#e6edf7','#f4f8fc']),dune:hdP(['#d29c52','#dcab60','#e6ba70','#f0ca84','#f8daa0']),
 cliff:hdP(['#4a3a2c','#5e4c3a','#73604a','#887460']),water:hdP(['#2358b0','#2662b8','#2a6cc2','#2f78cc','#3888d6','#45a0e2','#58b4ec','#86cef4','#bfe6fb','#eef8ff'])};
const hdTT=(x,y)=>x<0||y<0||x>=N||y>=N?0:tile[y*N+x];
function hdBake(kx,ky){const S=HDCS*32,M=14,B=S+2*M,typ=new Uint8Array(B*B),ox=kx*S-M,oy=ky*S-M;
 for(let v=0;v<B;v++)for(let u=0;u<B;u++){const U=ox+u,V=oy+v,wx=U/2,wy=V/2,tx=Math.floor(wx/16),ty=Math.floor(wy/16),real=hdTT(tx,ty),ly=wy-ty*16;
  let t=ly>=ED_FY?edFace(hdTT,U,V,wx,wy,tx,ty,real,ly):-1;if(t<0){const px=(hdVN(U/13,V/13)-.5)*7+(hdVN(U/5,V/5)-.5)*2,py=(hdVN(U/13+40,V/13+9)-.5)*7+(hdVN(U/5+3,V/5+70)-.5)*2;
   t=hdTT(Math.floor((wx+px)/16),Math.floor((wy+py)/16));if(t===3&&real!==3&&hdTT(tx,ty-1)===3)t=real}
  typ[v*B+u]=t}
 // distance (in texels, x3) to the nearest water / land texel
 const dw=new Uint16Array(B*B),dl=new Uint16Array(B*B),BIG=60000;
 for(let i=0;i<B*B;i++){const w=typ[i]===0;dw[i]=w?BIG:0;dl[i]=w?0:BIG}
 const cham=d=>{for(let y=0;y<B;y++)for(let x=0;x<B;x++){const i=y*B+x;let m=d[i];if(!m)continue;if(x>0)m=Math.min(m,d[i-1]+3);if(y>0){m=Math.min(m,d[i-B]+3);if(x>0)m=Math.min(m,d[i-B-1]+4);if(x<B-1)m=Math.min(m,d[i-B+1]+4)}d[i]=m}
  for(let y=B-1;y>=0;y--)for(let x=B-1;x>=0;x--){const i=y*B+x;let m=d[i];if(!m)continue;if(x<B-1)m=Math.min(m,d[i+1]+3);if(y<B-1){m=Math.min(m,d[i+B]+3);if(x<B-1)m=Math.min(m,d[i+B+1]+4);if(x>0)m=Math.min(m,d[i+B-1]+4)}d[i]=m}};
 cham(dw);cham(dl);
 const b=hdBuf(S,S),WT=HDT.water;
 for(let y=0;y<S;y++)for(let x=0;x<S;x++){const u=x+M,v=y+M,i=v*B+u,t=typ[i],U=ox+u,V=oy+v,wx=U/2,wy=V/2,f=hdVN(U/70,V/70)*.6+hdVN(U/22,V/22)*.4,r=hdH(U,V);let c;
  if(t===0){const d=dw[i]/3;if(d<1.7+hdVN(U/6,V/6)*1.6)c=WT[r<.12?8:9];else if(d<4.5)c=WT[hdQ(.75+(4.5-d)*.06,10,U,V)];else{const k=Math.min(1,d/34);c=WT[hdQ((1-k)*.62+f*.2+.04,10,U,V)]}}
  else if(t===1){const dd=dl[i]/3;if(dd<7+hdVN(U/8,V/8)*5)c=HDT.wet[hdQ(f*.8+.1+(dd/14),3,U,V)];else c=HDT.sand[hdQ(f*.85+.08+(r-.5)*.1,4,U,V)];if(r>.996)c=HDT.wet[0]}
  else if(t===2)c=HDT.grass[hdQ(f*.95+.03+(r-.5)*.14,5,U,V)];
  else if(t===3){const cr=Math.abs(hdVN(U/16,V/16)-.5);c=cr<.009?HDT.rock[0]:HDT.rock[hdQ(f*.8+.12+(r-.5)*.12,5,U,V)];if(cr>=.009&&cr<.02)c=HDT.rock[4]}
  else if(t===4){c=HDT.snow[hdQ(f*.9+.08+(r-.5)*.1,4,U,V)];if(r>.997)c=hdC('#ffffff')}
  else if(t===5){const rip=Math.sin(wx*.42+wy*.95+hdVN(U/40,V/40)*14)*.5+.5;c=HDT.dune[hdQ(f*.45+rip*.4+.06,5,U,V)]}
  else{const ly=(wy-Math.floor(wy/16)*16-ED_FY)*2;const col=hdH(U>>2,7)>.72;c=ly<1.2?hdC('#dccdb4'):ly<2.2?HDT.cliff[3]:HDT.cliff[hdQ(.8-ly/19+(col?-.3:0)+(r-.5)*.15,4,U,V)]}
  b.d[y*S+x]=c;b.id[y*S+x]=t+1}
 // stamps: grass tufts and flowers, snow drifts, desert pebbles
 const st=(x,y,pts,ok)=>{for(const[a,c,col]of pts){const X=x+a,Y=y+c;if(X<0||Y<0||X>=S||Y>=S)continue;if(ok&&b.id[Y*S+X]!==ok)continue;b.d[Y*S+X]=col}};
 const GT=[hdC('#2f7a2e'),hdC('#3c8836'),hdC('#8edb6a')],FL=[['#ffffff','#f8d030'],['#f8e048','#e86030'],['#f8a0c8','#f8e060'],['#a8c8ff','#ffffff']].map(p=>p.map(hdC));
 for(let ty=-1;ty<=HDCS;ty++)for(let tx=-1;tx<=HDCS;tx++){const TX=kx*HDCS+tx,TY=ky*HDCS+ty,t=hdTT(TX,TY),bx=tx*32,by=ty*32;
  if(t===2){const n=4+Math.floor(hdH(TX,TY)*5);for(let k=0;k<n;k++){const x=bx+2+Math.floor(hdH(TX*7+k,TY)*27),y=by+4+Math.floor(hdH(TX,TY*7+k)*26);st(x,y,[[0,0,GT[0]],[1,-1,GT[1]],[1,-2,GT[2]],[2,0,GT[0]],[3,-1,GT[1]],[3,-2,GT[2]],[4,0,GT[0]],[-1,-1,GT[1]]],3)}
   const fv=hdH(TX*3,TY*5);if(fv<.42){const p=FL[Math.floor(hdH(TX,TY*3)*4)],m=1+Math.floor(hdH(TX*5,TY)*3);for(let k=0;k<m;k++){const x=bx+4+Math.floor(hdH(TX+k*11,TY*2)*22),y=by+4+Math.floor(hdH(TX*2,TY+k*13)*22);
    st(x,y,[[0,2,GT[0]],[0,-1,p[0]],[-1,0,p[0]],[1,0,p[0]],[0,1,p[0]],[0,0,p[1]]],3)}}}
  else if(t===4){if(hdH(TX,TY*9)<.5){const x=bx+4+Math.floor(hdH(TX*9,TY)*20),y=by+6+Math.floor(hdH(TX,TY*11)*20);st(x,y,[[0,0,HDT.snow[0]],[1,0,HDT.snow[0]],[2,0,HDT.snow[0]],[3,0,HDT.snow[0]],[1,-1,hdC('#ffffff')],[2,-1,hdC('#ffffff')]],5)}}
  else if(t===5||t===1){if(hdH(TX*4,TY*9)<.35){const x=bx+4+Math.floor(hdH(TX*9,TY*2)*22),y=by+6+Math.floor(hdH(TX*2,TY*11)*20),dk=t===5?hdC('#a87a40'):hdC('#b89a60'),lt=hdC('#fff2cc');st(x,y,[[0,0,dk],[1,0,dk],[0,-1,lt],[1,-1,dk]],t+1)}}}
 hdEdge(b,typ,B,M,S,HDEL);
 return hdCan(b)}
function hdChunk(kx,ky){const k=kx+','+ky;let c=HDCK.get(k);if(c){HDCK.delete(k);HDCK.set(k,c);return c}c=hdBake(kx,ky);HDCK.set(k,c);if(HDCK.size>48)HDCK.delete(HDCK.keys().next().value);return c}
let hdPre=0;
TERRAINHD=(x0,y0,x1,y1,tm)=>{const C=HDCS,k0=Math.floor((x0-1)/C),k1=Math.floor((x1+1)/C),j0=Math.floor((y0-1)/C),j1=Math.floor((y1+1)/C);
 for(let ky=j0;ky<=j1;ky++)for(let kx=k0;kx<=k1;kx++)g.drawImage(hdChunk(kx,ky),kx*C*16,ky*C*16,C*16,C*16);
 // bake one chunk ahead per frame so walking never hitches
 hdPre++;outer:for(let ky=j0-1;ky<=j1+1;ky++)for(let kx=k0-1;kx<=k1+1;kx++){if(!HDCK.has(kx+','+ky)){hdChunk(kx,ky);break outer}}
 // water: drifting glints on open water
 g.fillStyle='rgba(214,238,255,.55)';for(let y=Math.max(0,y0-1);y<=Math.min(N-1,y1+1);y++)for(let x=Math.max(0,x0-1);x<=Math.min(N-1,x1+1);x++){if(tile[y*N+x]!==0)continue;
  if(hdTT(x-1,y)||hdTT(x+1,y)||hdTT(x,y-1)||hdTT(x,y+1))continue;const r=hdH(x,y);
  for(let k=0;k<2;k++){const ph=(tm*(.35+r*.3)+r*7+k*.5)%1,a=Math.sin(ph*Math.PI);if(a<.25)continue;const gx=x*16+((r*97+k*41)%12),gy=y*16+3+k*8+((r*13)%3);
   g.globalAlpha=a;g.fillRect(gx+ph*3,gy,2.5,.5);g.fillRect(gx+ph*3+1,gy-.5,1,.5)}}g.globalAlpha=1};
// ---------- people: EPX-smoothed, thin outlines (cached per look / pose) ----------
const HDO=hdC(O);
function hdSmooth(w,hh,paint){const c=document.createElement('canvas');c.width=w;c.height=hh;const x=c.getContext('2d',{willReadFrequently:true});paint(x);
 const s=new Uint32Array(x.getImageData(0,0,w,hh).data.buffer),W2=w*2,b=hdBuf(W2,hh*2),d=b.d,at=(X,Y)=>X<0||Y<0||X>=w||Y>=hh?0:s[Y*w+X];
 for(let Y=0;Y<hh;Y++)for(let X=0;X<w;X++){const p=s[Y*w+X],A=at(X,Y-1),Bv=at(X+1,Y),C=at(X-1,Y),Dv=at(X,Y+1);let p1=p,p2=p,p3=p,p4=p;
  if(C===A&&C!==Dv&&A!==Bv)p1=A;if(A===Bv&&A!==C&&Bv!==Dv)p2=Bv;if(Dv===C&&Dv!==Bv&&C!==A)p3=C;if(Bv===Dv&&Bv!==A&&Dv!==C)p4=Dv;
  const i=Y*2*W2+X*2;d[i]=p1;d[i+1]=p2;d[i+W2]=p3;d[i+W2+1]=p4}
 // thin the outline: drop outline texels that touch the outside
 const H2=hh*2,out=[];for(let Y=0;Y<H2;Y++)for(let X=0;X<W2;X++){const i=Y*W2+X;if(d[i]!==HDO)continue;const e=(X>0?d[i-1]:0)>>>24===0||(X<W2-1?d[i+1]:0)>>>24===0||(Y>0?d[i-W2]:0)>>>24===0||(Y<H2-1?d[i+W2]:0)>>>24===0;if(e)out.push(i)}
 for(const i of out)d[i]=0;
 // soften what is left of the outline a touch
 const OL=hdC('#2a1c24');for(let i=0;i<d.length;i++)if(d[i]===HDO){const X=i%W2;const nb=[i-1,i+1,i-W2,i+W2].some(j=>j>=0&&j<d.length&&d[j]===0&&Math.abs((j%W2)-X)<=1);if(nb)d[i]=OL}
 return hdCan(b)}
const HDCP=new Map();
const hdCache=(key,w,hh,ax,ay,paint)=>{let c=HDCP.get(key);if(!c){c=hdSmooth(w,hh,x=>{const g0=GC;GC=x;try{paint(ax,ay)}finally{GC=g0}});if(HDCP.size>500)HDCP.clear();HDCP.set(key,c)}return c};
const _cP32=cP;cP=function(ch,dir,st,ox,oy,fl){if(GC!==g)return _cP32(ch,dir,st,ox,oy,fl);
 const c=hdCache('p'+JSON.stringify(ch)+dir+st+(fl?1:0),48,56,24,44,(ax,ay)=>_cP32(ch,dir,st,ax,ay,fl));g.drawImage(c,Math.round(ox)-24,Math.round(oy)-44,48,56)};
const _wz32=wizOverlay;wizOverlay=function(ox,oy,dir,st,fl){if(GC!==g)return _wz32(ox,oy,dir,st,fl);
 const c=hdCache('w'+dir+st+(fl?1:0),48,56,24,44,(ax,ay)=>_wz32(ax,ay,dir,st,fl));g.drawImage(c,Math.round(ox)-24,Math.round(oy)-44,48,56)};
// ---------- slimes ----------
let HDSL=null;
function hdSlimeSp(f,white){if(!HDSL){HDSL={};for(const wh of[0,1])for(const fr of[0,1]){const ht=fr?20:23,b=hdBuf(34,26),cy=25,pal=wh?hdP(['#9898b0','#c8c8dc','#e4e4f0','#f4f4fa','#ffffff']):hdP(['#16246a','#2340a8','#3664d8','#5590f0','#8cc0ff']);
   hdSph(b,17,cy,fr?16.5:15.5,ht,pal,{cut:24,id:1,b:.05,fn:(v,x,y,nx,ny)=>v+(ny>.55?-.25:0)+(nx>.6&&ny>.1?.35:0)});
   if(!wh){for(const[a,c2]of[[9,cy-ht+6],[10,cy-ht+5],[11,cy-ht+5],[12,cy-ht+5],[9,cy-ht+7],[10,cy-ht+6],[11,cy-ht+6],[13,cy-ht+6]])hdSet(b,a,c2,hdC('#ffffff'));hdSet(b,15,cy-ht+5,hdC('#d8ecff'))}
   hdOutline(b,{1:hdC(wh?'#505068':'#0c1240')});HDSL[wh+''+fr]=hdCan(b)}}return HDSL[(white?1:0)+''+f]}
SLIMEHD=(n,tm)=>{const x=Math.round(n.x),y=Math.round(n.y),f=Math.floor(tm*3+n.x)%2,fl=Math.abs(n.kx)+Math.abs(n.ky)>.8;shd(x,y+5,15);
 const sp=hdSlimeSp(f,fl),w=sp.width/2,hh=sp.height/2,top=y+6.5-hh;g.drawImage(sp,x-w/2,top,w,hh);
 if(!fl){const e=top+(f?4.5:5.5),d=P.x>n.x?.5:-.5,dy=P.y>n.y+8?.5:0;g.fillStyle='#ffffff';for(const ex of[x-4.5,x+1.5]){g.fillRect(ex,e,3,3.5);g.fillRect(ex+.5,e-.5,2,4.5)}
  g.fillStyle='#181018';for(const ex of[x-4.5,x+1.5]){g.fillRect(ex+1+d,e+1+dy,1.5,2);g.fillRect(ex+1.5+d,e+.5+dy,.5,3)}g.fillStyle='#ffffff';for(const ex of[x-4.5,x+1.5])g.fillRect(ex+1+d,e+1+dy,.5,.5)}};
// ---------- fences, stone walls and gates ----------
const Rh=(x,y,w,hh,col)=>{g.fillStyle=col;g.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,w,hh)};
const FW={o:'#3a2210',hi:'#e8b474',lt:'#cc8e4c',md:'#ad7036',dk:'#86522a',gr:'#6e4020'};
function hdPost(x,y,hh){Rh(x-.5,y-.5,4.5,hh+1,FW.o);Rh(x,y,3.5,hh,FW.md);Rh(x,y,1,hh,FW.lt);Rh(x+2.5,y,1,hh,FW.dk);Rh(x,y,3.5,1.5,FW.hi);Rh(x+.5,y+1.5,2.5,.5,FW.lt);Rh(x+1.5,y+4,.5,3,FW.gr);Rh(x+1,y+hh-4,.5,2.5,FW.gr)}
function hdRail(x,y,w){Rh(x,y-.5,w,3.5,FW.o);Rh(x,y,w,2.5,FW.lt);Rh(x,y,w,.5,FW.hi);Rh(x,y+2,w,.5,FW.dk);for(let k=x+2;k<x+w-1;k+=5)Rh(k,y+1,1.5,.5,FW.md)}
function hdVRail(x,y,hh){Rh(x-.5,y,3.5,hh,FW.o);Rh(x,y,2.5,hh,FW.md);Rh(x,y,.5,hh,FW.hi);Rh(x+2,y,.5,hh,FW.dk)}
function hdGate(px,py,open,vert){const sh='rgba(0,0,0,.2)';
 if(!vert){if(open){Rh(px+3,py+12,8,2.5,sh);Rh(px+3,py,2.5,13.5,FW.o);Rh(px+3.5,py+.5,1.5,12.5,FW.lt);Rh(px+4.5,py+.5,.5,12.5,FW.dk);return}
  Rh(px+3,py+12.5,10,2.5,sh);Rh(px+2.5,py-.5,11,14,FW.o);for(let k=0;k<3;k++){const x=px+3+k*3.5;Rh(x,py,3,13,k===1?FW.md:FW.lt);Rh(x,py,3,.5,FW.hi);Rh(x+2.5,py+.5,.5,12.5,FW.dk)}
  Rh(px+3,py+2,10,2,FW.dk);Rh(px+3,py+9,10,2,FW.dk);for(let k=0;k<9;k++)Rh(px+3.5+k,py+9-k*.75,1.5,1,FW.gr);
  Rh(px+3,py+2,1.5,2,'#58586a');Rh(px+3,py+9,1.5,2,'#58586a');Rh(px+10.5,py+6,1.5,1.5,'#f8d848');Rh(px+10.5,py+6,.5,.5,'#fff8c0');return}
 // north-south gate: the panel is seen at a slight angle (hinged on the top post), so its planks, brace and latch show;
 // it swings east when open
 if(open){Rh(px+8.5,py+4,8.5,2,sh);Rh(px+8,py-2,8.5,7,FW.o);for(let k=0;k<2;k++){const x=px+8.5+k*4;Rh(x,py-.5,3.5,6,k?FW.md:FW.lt);Rh(x,py-.5,3.5,.5,FW.hi);Rh(x+3,py,.5,5.5,FW.dk)}
  Rh(px+8.5,py+1,8,1.5,FW.dk);Rh(px+8.5,py+1,1.5,1.5,'#58586a');Rh(px+14.5,py+2.5,1,1,'#f8d848');return}
 g.drawImage(hdVGate(true),px+4.5,py,13,22);g.drawImage(hdVGate(false),px+3.5,py-1.5,13,22)}
let HDVG=null;
function hdVGate(shadow){if(HDVG)return HDVG[shadow?1:0];const Wt=18,Lt=27,SK=7,b=hdBuf(26,44),sb=hdBuf(26,44),C=k=>hdC(FW[k]);
 for(let Y=0;Y<44;Y++)for(let X=0;X<26;X++){const u=(X+.5)/Wt,t=(Y+.5-u*SK)/Lt;if(u<0||u>=1||t<0||t>=1)continue;sb.d[Y*26+X]=0x33000000;
  const ue=X,te=Y-Math.round(u*SK);let c;
  if(ue===0||ue===Wt-1||te===0||te===Lt-1)c=C('o');else if(te===1)c=C('hi');
  else if(t>.13&&t<.21||t>.77&&t<.85)c=t<.15||t>.77&&t<.79?C('lt'):C('dk');
  else if(Math.abs(t-(.21+(1-u)*.56))<.035)c=C('gr');
  else{const pl=Math.floor(u*3);c=(ue===6||ue===12)?C('dk'):pl===1?C('md'):C('lt');if(ue===1)c=C('hi')}
  if(u<.32&&(t>.13&&t<.21||t>.77&&t<.85))c=hdC(t<.15||t>.77&&t<.79?'#9a9aae':'#58586a');
  b.d[Y*26+X]=c}
 for(const[X,Y,c]of[[14,13,'#f8d848'],[15,13,'#c89820'],[14,14,'#c89820'],[15,14,'#a07010']])b.d[(Y+Math.round(X/Wt*SK))*26+X]=hdC(c);
 HDVG=[hdCan(b),hdCan(sb)];return HDVG[shadow?1:0]}
drawFence=function(i,s,ghost){const x=i%N,y=(i/N)|0,px=x*16+(s.shake>0?Math.round(Math.sin(performance.now()/16)):0),py=y*16,nb=(dx,dy)=>!ghost&&fenceNb(x+dx,y+dy);
 const L=nb(-1,0),Rt=nb(1,0),U=nb(0,-1),Dn=nb(0,1);
 if(s.t==='swall'){const x0=L?px:px+1.5,x1=Rt?px+16:px+14.5,yt=py-4,yb=Dn?py+12:py+15,capB=Dn?py+12:py,ST=['#5e5e70','#7c7c90','#9a9aae','#b8b8ca','#d4d4e2'];
  if(!Dn)Rh(x0-.5,yb-.5,x1-x0+1,2,'rgba(0,0,0,.22)');Rh(x0-.5,yt-(U?0:.5),x1-x0+1,yb-yt+(U?.5:1),'#2a2a36');
  if(!Dn){Rh(x0,yt+4,x1-x0,yb-yt-4,ST[0]);for(let r=0;r<3;r++){const yy=yt+4.5+r*3.5,off=(r+x+y)%2?3:0;for(let bx=px-8+off;bx<px+16;bx+=6){const a=Math.max(x0,bx+.5),b=Math.min(x1,bx+6);if(b-a<1)continue;const v=hdH(Math.round(bx*2),y*7+r);Rh(a,yy,b-a,3,ST[1+Math.floor(v*2)]);Rh(a,yy,b-a,.5,ST[3]);Rh(b-.5,yy,.5,3,ST[0])}}}
  // the walkable-looking top of the wall: flagstones, continuous along north-south runs
  Rh(x0,yt,x1-x0,capB-yt,ST[3]);for(let yy=yt;yy<capB;yy+=4){const off=((yy-yt)/4+x)%2?3:0;for(let bx=x0+off;bx<x1;bx+=6)Rh(bx,yy,.5,4,ST[2]);Rh(x0,yy+3.5,x1-x0,.5,ST[2]);Rh(x0,yy,x1-x0,.5,ST[4])}
  Rh(x0,capB-.5,x1-x0,.5,ST[1]);if(!L)Rh(x0,yt,.5,capB-yt,ST[4]);if(!Rt)Rh(x1-.5,yt,.5,capB-yt,ST[1]);
  if(U)Rh(x0,py-8,x1-x0,4,ST[3]);return}
 if(s.t==='door'){const open=!ghost&&doorOpen(i),vert=(U||Dn)&&!(L||Rt);
  if(!vert){if(L){hdRail(px,py+1,3);hdRail(px,py+7.5,3)}if(Rt){hdRail(px+13,py+1,3);hdRail(px+13,py+7.5,3)}
   for(const xx of[px,px+12.5]){Rh(xx+1,py+14,4,1.5,'rgba(0,0,0,.2)');hdPost(xx,py-4,18)}hdGate(px,py,open,false);return}
  // the gate replaces a fence section: it hangs in the gap between the posts above and below
  if(U){Rh(px+6.25,py-3,4,1.5,'#58586a');Rh(px+6.25,py-3,4,.5,'#9a9aae')}hdGate(px,py,open,true);return}
 // wooden fence
 Rh(px+5,py+13.5,6,2,'rgba(0,0,0,.18)');
 if(L){hdRail(px,py+1,7);hdRail(px,py+7.5,7)}if(Rt){hdRail(px+9,py+1,7);hdRail(px+9,py+7.5,7)}
 if(U)hdVRail(px+6.75,py-4,8);if(Dn)hdVRail(px+6.75,py+8,9);
 hdPost(px+6.25,py-4,18)};
// ---------- buildings: siding, shingles, framed windows with flower boxes, plank doors ----------
const hdMix=(a,b,t)=>{const p=parseInt(a.slice(1),16),q=parseInt(b.slice(1),16),m=(s)=>Math.round(((p>>s)&255)*(1-t)+((q>>s)&255)*t);return'#'+((1<<24)+(m(16)<<16)+(m(8)<<8)+m(0)).toString(16).slice(1)};
const HDBL=new Map();
function BLDHD(b,X0,w,base){const key=b.k+'|'+w+'|'+b.wall+'|'+b.roof;let c=HDBL.get(key);if(!c){c=hdBldCan(b,w);HDBL.set(key,c)}g.drawImage(c,X0-5,base-55,c.width/2,c.height/2);return true}
function hdBldCan(b,w){const W2=(w+10)*2,H2=57*2,B=hdBuf(W2,H2),ox=5,oy=55;// world (X0+ox', base-oy') -> texel
 const F=(x,y,ww,hh,col,id)=>{const c=typeof col==='number'?col:hdC(col);for(let v=Math.round((y+oy)*2);v<Math.round((y+hh+oy)*2);v++)for(let u=Math.round((x+ox)*2);u<Math.round((x+ww+ox)*2);u++)hdSet(B,u,v,c,id||1)};
 const T=(u,v,col,id)=>hdSet(B,u,v,typeof col==='number'?col:hdC(col),id||1);
 const wl=b.wall,rf=b.roof,WP=[hdMix(wl,'#000000',.32),hdMix(wl,'#000000',.18),hdMix(wl,'#000000',.07),wl,hdMix(wl,'#ffffff',.3)],
  RP=[hdMix(rf,'#000000',.5),hdMix(rf,'#000000',.32),hdMix(rf,'#000000',.15),rf,hdMix(rf,'#ffffff',.22),hdMix(rf,'#ffffff',.42)];
 // walls: horizontal boards, corner posts, stone footing
 for(let r=0;r<8;r++){const y=-28+r*3;F(0,y,w,3,WP[3],1);F(0,y,w,.5,WP[4],1);F(0,y+2.5,w,.5,WP[1],1);
  for(let k=0;k<3;k++){const x=((hdH(r*13+k,w)*w)|0);F(x,y+1,4,1,WP[2],1)}}
 F(0,-28,w,3.5,WP[0],1);F(0,-24.5,w,1,WP[1],1);// shade under the eaves
 for(const x of[0,w-2.5]){F(x,-28,2.5,24,hdMix(wl,'#5a3a1e',.65),1);F(x,-28,.5,24,hdMix(wl,'#ffffff',.1),1)}
 for(let k=0;k*6<w;k++){const x=k*6+(k%2?0:0),c=['#8a8a98','#9a9aa8','#7a7a88'][Math.floor(hdH(k,w*3)*3)];F(x,-4,Math.min(6,w-x),4,c,1);F(x,-4,Math.min(6,w-x),.5,'#b8b8c4',1);F(x+5.5,-4,.5,4,'#5a5a66',1)}
 F(0,-.5,w,.5,'#4a4a56',1);
 // windows: frame, glass with a shine, mullions, sill and a flower box
 for(const wx of[8,w-20]){const fire=b.k==='smith'&&wx>20;F(wx-1,-23,14,12,'#5a3418',3);F(wx-.5,-22.5,13,11,'#e8d4b0',3);
  for(let v=0;v<10;v++)F(wx,-22+v,12,1,fire?hdMix('#f8b040','#e86018',v/10):hdMix('#cdeeff','#6aa8e0',v/10),3);
  for(let k=0;k<4;k++)F(wx+1.5+k,-21+k*1.5,1.5,1,fire?'#fff0a0':'#ffffff',3);F(wx+8,-20,1,1,'#ffffff',3);
  F(wx+5.5,-22,1,10,'#e8d4b0',3);F(wx,-17.5,12,1,'#e8d4b0',3);F(wx-1.5,-11.5,15,1.5,'#f0e0c0',3);F(wx-1.5,-10,15,.5,'#8a6a48',3);
  if(b.k!=='smith'){F(wx-.5,-10,13,2.5,'#8a5428',3);F(wx-.5,-10,13,.5,'#a86c36',3);const fl=['#f86080','#f8d040','#ffffff','#b080f8'];
   for(let k=0;k<5;k++){const fx=wx+.5+k*2.5,cc=fl[(k+b.k.length)%4];F(fx,-12,1.5,1.5,cc,3);F(fx+.5,-11.5,.5,.5,'#fff8c0',3);F(fx-.5,-10.5,1,1,'#3c8836',3)}}}
 // door: planks, frame, knob and a stone step
 const dx=(w>>1)-6;F(dx-1.5,-18.5,15,18.5,'#4a2a14',2);F(dx-1,-18,14,18,'#c8a878',2);
 for(let k=0;k<4;k++){const x=dx+k*3;F(x,-17,3,17,['#7a4a20','#8a5428','#7e4c22','#86522a'][k],2);F(x,-17,.5,17,'#a86c36',2);F(x+2.5,-17,.5,17,'#5a3418',2)}
 F(dx,-17,12,.5,'#4a2a14',2);F(dx,-12,12,1,'#5a3418',2);F(dx,-5,12,1,'#5a3418',2);F(dx+9,-9,2,2,'#f8d848',2);F(dx+9,-9,1,1,'#fff8c0',2);
 F(dx-2,-.5,16,1.5,'#9a9aa8',2);F(dx-2,-.5,16,.5,'#c8c8d4',2);
 // roof: staggered shingle rows, light at the top, ridge cap and eave board
 const rx0=-4,rx1=w+4;for(let r=0;r<6;r++){const y=-51+r*4,shade=.95-r*.1;for(let k=-1;k*6<rx1-rx0+6;k++){const x=rx0+k*6+(r%2?3:0),x0=Math.max(rx0,x),x1=Math.min(rx1,x+6);if(x1-x0<.5)continue;
   const v=shade+(hdH(k*7+r,w)-.5)*.25;for(let vv=0;vv<8;vv++)for(let uu=Math.round((x0+ox)*2);uu<Math.round((x1+ox)*2);uu++){const yy=Math.round((y+oy)*2)+vv,t=vv/8;T(uu,yy,RP[hdQ(v-t*.38,6,uu,yy)],4)}
   F(x1-.5,y,.5,4,RP[0],4);F(x0,y+3.5,x1-x0,.5,RP[0],4);F(x0,y,x1-x0,.5,RP[5],4)}}
 F(rx0,-52,rx1-rx0,2.5,RP[1],4);F(rx0,-52,rx1-rx0,.5,RP[4],4);for(let k=rx0;k<rx1;k+=4)F(k+3.5,-52,.5,2.5,RP[0],4);
 F(rx0,-28.5,rx1-rx0,2,RP[0],4);F(rx0,-28.5,rx1-rx0,.5,RP[2],4);
 hdOutline(B,{1:hdC(hdMix(wl,'#181018',.75)),2:hdC('#2a1a10'),3:hdC('#2a1a10'),4:hdC(hdMix(rf,'#181018',.7))});
 // soft contact shadow on the ground
 for(let u=8;u<W2-8;u++)for(let v=H2-3;v<H2;v++){const i=v*W2+u;if(!B.d[i])B.d[i]=0x38000000}
 return hdCan(B)}
// ---------- tall grass: dense blades with dark tufts and light tips, three layouts x two sway frames; each patch spills
// a little past its tile so a field has ragged, natural edges instead of square ones ----------
const HDTG=[];
try{const GPAL=hdP(['#1f5e24','#2a7a2e','#3a9438','#56b04a','#7ccc5e','#a8e47c']);
 for(let v=0;v<3;v++)for(const fr of[0,1]){const b=hdBuf(40,40);hdSeed=77+v*131;
  const blades=[];for(let k=0;k<26;k++)blades.push([3+hdR()*34,18+hdR()*18,7+hdR()*10,hdR()<.5?-1:1]);blades.sort((p,q)=>p[1]-q[1]);
  for(const[bx,by,hh,lean]of blades){for(let j=0;j<hh;j++){const t=j/hh,sw=fr?t*t*2.2:0,x=bx+lean*t*t*2.5+sw,y=by-j,wid=t<.6?2:1;for(let q=0;q<wid;q++){const X=Math.round(x)+q,Y=Math.round(y);if(Y<0||X<0||X>39)continue;
    hdSet(b,X,Y,GPAL[hdQ(.08+t*.95-(q?.12:0),6,X,Y)],1)}}}
  hdOutline(b,{1:hdC('#123c18')});HDTG[v*2+fr]=hdCan(b)}
 tgC[0]=HDTG[0];tgC[1]=HDTG[1];
 TGDRAW=(x,y,tm)=>{const v=Math.floor(hdH(x*3,y*5)*3)%3;g.drawImage(HDTG[v*2+tgFrame(x,y,tm)],x*16-2,y*16-2,20,20)}}catch(e){}
// ---------- the trainer, redrawn at 2x: round head, shaded clothes, faces, hair styles, hats/helmets/hoods ----------
// texel space: 96x112, feet at (48,88); world size 48x56 anchored at (24,44) like the old sprite
const hdPal4=c=>hdP([hdMix(c,'#000000',.4),hdMix(c,'#000000',.2),c,hdMix(c,'#ffffff',.25)]);
function hdTrainer(ch,dir,st,fl){const b=hdBuf(96,112),OX=48,OY=88,isH=ch.ht===2&&ch.hcol>=HB&&ch.hcol<HB+3,isHood=ch.ht===2&&ch.hcol===HB+3;
 const[S]=OPT.skin[ch.sk],SKP=hdPal4(S),HP=hdPal4(OPT.hair[ch.hc]),TP=ch.mr?hdPal4('#6848b8'):hdPal4(OPT.shirt[ch.sh]),PP=hdPal4(OPT.pants[ch.pn]),SHP=hdPal4(OPT.shoe[ch.so]),HC=OPT.hatc[ch.hcol]||'#f0f0f0',HTP=hdPal4(HC);
 const MP=hdP(['#4a5060','#7a8496','#a8b2c4','#d8e0ec','#ffffff']);
 const put=(x,y,col)=>hdSet(b,OX+x,OY+y,col,1);
 const sh=(pal,v)=>pal[Math.max(0,Math.min(pal.length-1,Math.floor(v*(pal.length-1)+.5)))];
 // rounded box shaded left-light / top-light
 const box=(x0,y0,x1,y1,pal,r,lift)=>{for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const cx=x<x0+r?x0+r:x>=x1-r?x1-r-1:x,cy=y<y0+r?y0+r:y>=y1-r?y1-r-1:y;if((x-cx)**2+(y-cy)**2>r*r+.5)continue;
   const v=.66-((x-x0)/(x1-x0))*.42-((y-y0)/(y1-y0))*.12+(lift||0);put(x,y,sh(pal,v,x,y))}};
 const ell=(cx,cy,rx,ry,pal,test,bias)=>{for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const nx=(x+.5-cx)/rx,ny=(y+.5-cy)/ry,q=nx*nx+ny*ny;if(q>1)continue;if(test&&!test(x,y,nx,ny))continue;
   const nz=Math.sqrt(1-q),v=(nx*-.55+ny*-.6+nz*.55)*.5+.5+(bias||0);put(x,y,sh(pal,v,x,y))}};
 const bob=st?-1:0,sw=st===1?1:st===2?-1:0;
 const HY=-24+bob,HX=dir===2?1:0;// head centre
 // ---- hair / hats that sit BEHIND the body ----
 if(!isHood&&!isH){if(ch.hs===2){if(dir===2)box(-13,HY-6,-2,HY+15,HP,3);else box(-13,HY-4,13,HY+(dir===1?18:14),HP,4)}
  if(ch.hs===3){if(dir===0)ell(12,HY+3,4,7,HP);else if(dir===2)ell(-12,HY+2,4.5,7,HP)}}
 if(isHood&&dir!==0)box(-11,HY+2,11,HY+14,HTP,4);
 // ---- legs and shoes ----
 const legs=()=>{if(dir===2){const f=sw*4;
   if(!ch.mr)box(-4-f,-3+bob,3-f,8,PP,2,-.15);box(-5-f,6,5-f,11,SHP,2,-.15);// back leg
   if(!ch.mr)box(-4+f,-3+bob,3+f,8,PP,2);box(-4+f,6,7+f,11,SHP,2);put(5+f,7,SHP[3]);put(6+f,8,SHP[3])}
  else{const lL=st===2?2:0,rL=st===1?2:0;if(!ch.mr){box(-8,-3+bob,-1,8-lL,PP,2);box(1,-3+bob,8,8-rL,PP,2);for(let y=-3+bob;y<3+bob;y++){put(-1,y,PP[1]);put(0,y,PP[1])}}
   box(-9,6-lL,-1,11-lL,SHP,2);box(1,6-rL,9,11-rL,SHP,2);if(dir===0){put(-7,7-lL,SHP[3]);put(3,7-rL,SHP[3])}}};
 legs();
 // ---- arms behind (side view) ----
 if(dir===2){const a=-sw*3;box(-3+a,-12+bob,2+a,-4+bob,TP,2,-.2);ell(-.5+a,-3+bob,2.6,2.6,SKP,null,-.15)}
 // ---- torso (or the mage robe) ----
 const GOLD=hdP(['#b88a18','#f8d848','#fff0a0']);
 if(ch.mr){const top=-13+bob,bot=8,hw0=dir===2?6.5:9,hw1=dir===2?8.5:11.5,cx0=dir===2?.5:0;
  for(let y=top;y<=bot;y++){const t=(y-top)/(bot-top),hw=hw0+(hw1-hw0)*t,off=cx0+sw*t*t*2;for(let x=Math.floor(off-hw);x<Math.ceil(off+hw);x++){const u=(x-(off-hw))/(2*hw);let c=sh(TP,.7-u*.5-t*.1);
    if(y>=bot-1||y===top+8||y===top+9)c=GOLD[y===top+8||y===bot-1?2:1];else if(dir===0&&(x===-1||x===0))c=GOLD[x?1:2];put(x,y,c)}}
  if(dir===0)for(const[x,y]of[[-2,top],[-1,top],[0,top],[1,top],[-1,top+1],[0,top+1]])put(x,y,SKP[2])}
 else if(dir===2){box(-6,-13+bob,7,-1,TP,3)}else{box(-9,-13+bob,9,-1,TP,3);for(let x=-8;x<8;x++)put(x,-2,TP[0]);
  if(dir===0){for(const[x,y]of[[-2,-13],[-1,-13],[0,-13],[1,-13],[-1,-12],[0,-12]])put(x,y+bob,SKP[2]);put(-3,-13+bob,TP[3]);put(2,-13+bob,TP[3])}}
 // ---- arms in front ----
 if(dir!==2){const la=st===1?2:st===2?-1:0,ra=st===2?2:st===1?-1:0;
  box(-13,-12+bob+la,-8,-5+bob+la,TP,2);ell(-10.5,-4+bob+la,2.7,2.7,SKP);box(8,-12+bob+ra,13,-5+bob+ra,TP,2,-.1);ell(10.5,-4+bob+ra,2.7,2.7,SKP,null,-.1)}
 else{const a=sw*3;box(-3+a,-12+bob,3+a,-4+bob,TP,2);ell(0+a,-3+bob,2.8,2.8,SKP)}
 // ---- head ----
 ell(HX,HY,11.5,12,SKP,null,.05);
 for(let x=-6;x<6;x++)if(b.id[(OY+HY+12)*96+OX+x])put(x,HY+11,SKP[1]);// soft chin shadow
 // face
 const ink=hdC('#2a1c24'),wht=hdC('#ffffff'),blush=hdC(hdMix(S,'#f06070',.35));
 if(dir===0){for(const ex of[-6,3]){for(let y=0;y<4;y++)for(let x=0;x<3;x++)put(ex+x,HY+1+y,ink);put(ex,HY+1,wht);put(ex+2,HY+4,hdC('#5a4a5a'))}
  for(const bx of[-9,6])for(let x=0;x<3;x++)put(bx+x,HY+6,blush);put(-1,HY+8,hdC(hdMix(S,'#802030',.55)));put(0,HY+8,hdC(hdMix(S,'#802030',.55)))}
 else if(dir===2){for(let y=0;y<4;y++)for(let x=0;x<2;x++)put(6+x,HY+1+y,ink);put(6,HY+1,wht);for(let x=0;x<2;x++)put(6+x,HY+6,blush);
  put(13,HY+3,SKP[2]);put(13,HY+4,SKP[1]);put(9,HY+8,hdC(hdMix(S,'#802030',.55)));
  for(let y=0;y<4;y++)for(let x=0;x<3;x++)put(-3+x,HY+y,x===1&&y>0&&y<3?SKP[1]:SKP[2])}
 // ---- hair on top ----
 const hairTop=(test)=>ell(HX,HY-1,12.5,13,HP,test,.05);
 if(!isHood&&!isH){const fr=(x)=>((x+20)%4<2?0:1);
  if(dir===0)hairTop((x,y)=>y<HY-4+fr(x)-(Math.abs(x)<4?0:0)||(Math.abs(x)>9&&y<HY+5));
  else if(dir===1)hairTop((x,y)=>y<HY+8||Math.abs(x)>10&&y<HY+10);
  else hairTop((x,y)=>y<HY-4+fr(x)||x<-1&&y<HY+6||x<3&&y<HY-1);
  if(ch.hs===1&&ch.ht===0)for(const sx of(dir===2?[-7,-1,5]:[-8,-1,6])){for(let k=0;k<6;k++)for(let x=0;x<6-k;x++)put(sx+x+(k>>1),HY-13-k,sh(HP,.8-k*.08,sx+x,HY-13-k))}
  if(ch.hs===3&&dir===1)box(-3,HY+4,3,HY+18,HP,2);
  if(ch.hs===2&&dir===0){box(-13,HY-2,-8,HY+12,HP,2);box(8,HY-2,13,HY+12,HP,2,-.1)}}
 // ---- hats, helmets, hood ----
 if(isHood){const face=(x,y)=>dir===0?((x)/8)**2+((y-HY-1)/8.5)**2<1:dir===2?x>1&&((x-6)/7)**2+((y-HY-1)/8.5)**2<1:false;
  ell(HX,HY-1,13,13.5,HTP,(x,y)=>!face(x,y));
  if(dir===0)for(let x=-7;x<8;x++){put(x,HY+8,HTP[0])}}
 else if(isH){ell(HX,HY-2,12.5,11.5,MP,(x,y)=>y<HY+(dir===1?6:-3)||(dir!==0&&x<-3&&y<HY+4));for(let x=-12;x<13;x++){const y=HY+(dir===1?5:-3);put(x+HX,y,MP[1]);put(x+HX,y+1,MP[0])}
  if(dir===0){for(let y=HY-2;y<HY+4;y++){put(-1,y,MP[1]);put(0,y,MP[2])}}for(const rx of[-8,8])put(rx+HX,HY-4,MP[4]);put(HX-5,HY-9,MP[4]);put(HX-4,HY-10,MP[4])}
 else if(ch.ht===1){ell(HX,HY-3,12,10,HTP,(x,y)=>y<HY-3);if(dir===0)box(-13,HY-5,13,HY-1,HTP,2,-.25);else if(dir===2)box(2,HY-5,19,HY-2,HTP,1,-.25);
  ell(HX,HY-12,2,1.5,HTP,null,.3)}
 else if(ch.ht===2){ell(HX,HY-3,12.5,11,HTP,(x,y)=>y<HY-2);for(let x=-12;x<13;x++)for(let y=HY-4;y<HY;y++)if(b.id[(OY+y)*96+OX+x+HX]||Math.abs(x)<12)put(x+HX,y,(x+20)%3?HTP[1]:HTP[0]);
  ell(HX-(dir===2?2:0),HY-14,3.5,3.2,HTP,null,.25)}
 if(ch.mh){const HP2=hdPal4('#6848b8'),by2=HY-7;ell(HX,by2,16,4,HP2,null,-.1);
  for(let k=0;k<24;k++){const t=k/23,w=9*(1-t)+1,bend=dir===2?-(t*t)*8:dir===0?t*t*3:t*t*-2,cx=HX+bend;for(let x=Math.floor(cx-w);x<Math.ceil(cx+w);x++){const u=(x-(cx-w))/(2*w);put(x,by2-2-k,(k>=1&&k<=3)?GOLD[k===1?2:1]:sh(HP2,.72-u*.5+t*.08))}}
  const tip=HX+(dir===2?-8:dir===0?3:-2);put(tip,by2-26,GOLD[1]);put(tip+1,by2-26,GOLD[1]);put(tip,by2-27,GOLD[2]);
  if(dir===0)for(const[x,y]of[[-3,-12],[-4,-11],[-3,-11],[-2,-11],[-3,-10]])put(HX+x+1,by2+y,GOLD[2])}
 hdOutline(b,{1:hdC('#2a1c24')});
 if(fl){for(let y=0;y<112;y++){const r=y*96;for(let x=0;x<48;x++){const a=b.d[r+x];b.d[r+x]=b.d[r+95-x];b.d[r+95-x]=a}}}
 return hdCan(b)}
const HDTR=new Map();
const _cP32b=cP;cP=function(ch,dir,st,ox,oy,fl){const C=GC;if(!(C===g||C&&C.canvas&&C.canvas.hd2))return _cP32b(ch,dir,st,ox,oy,fl);
 const key=JSON.stringify(ch)+dir+st+(fl?1:0);let c=HDTR.get(key);if(!c){try{c=hdTrainer(ch,dir,st,fl)}catch(e){return _cP32b(ch,dir,st,ox,oy,fl)}if(HDTR.size>400)HDTR.clear();HDTR.set(key,c)}
 C.drawImage(c,Math.round(ox)-24,Math.round(oy)-44,48,56)};
// the character creator preview and the equipment card show the new sprite at full detail
{const pc2=document.getElementById('cpv');if(pc2&&pc2.getContext){pc2.width=96;pc2.height=96;pc2.hd2=true}}
const _rp32=rp;rp=function(){if(px2&&px2.canvas.hd2){px2.setTransform(2,0,0,2,0,0)}_rp32()};
const _dcs32=drawCardSprite;drawCardSprite=function(){const c=document.getElementById('tcs');if(c&&c.width!==64){c.width=64;c.height=80;c.hd2=true}if(c){const x=c.getContext('2d');x.setTransform(2,0,0,2,0,0);x.imageSmoothingEnabled=false}_dcs32()};
const _wz32b=wizOverlay;wizOverlay=function(ox,oy,dir,st,fl){if(GC&&GC.canvas&&GC.canvas.hd2&&GC!==g){const g0=GC;const c=hdCache('w'+dir+st+(fl?1:0),48,56,24,44,(ax,ay)=>_wz32(ax,ay,dir,st,fl));g0.drawImage(c,Math.round(ox)-24,Math.round(oy)-44,48,56);return}_wz32b(ox,oy,dir,st,fl)};
// mage gear is part of the sprite now, so it moves with every walking frame
const _gc32=gearCH;gearCH=function(){const c=_gc32();if(CLS.body==='m')c.mr=1;if(CLS.helm==='m')c.mh=1;return c};
const _wz32c=wizOverlay;wizOverlay=function(ox,oy,dir,st,fl){if(GC===g||GC&&GC.canvas&&GC.canvas.hd2)return;_wz32c(ox,oy,dir,st,fl)};
// ---------- one depth-sorted list: people, trees and rocks, buildings, houses, fences and stations, lamps, the well,
// signs, the shipwreck and the hermit's hut are all drawn back-to-front by where they touch the ground ----------
NPCSORT=true;SORTALL=true;
const hdNpcDraw=n=>{GC=g;shd(n.x,n.y+6,12);cP(n.ch,n.dir||0,n.st||0,Math.round(n.x),Math.round(n.y),!!n.fl)};
LHOOK=(L,x0,y0,x1,y1,tm)=>{const inV=(x,y,m)=>x>=x0-(m||2)&&x<=x1+(m||2)&&y>=y0-2&&y<=y1+(m||3)+2;
 for(const n of NPCS){if(n.scene)continue;const tx=n.x/16,ty=n.y/16;if(tx<x0-2||tx>x1+2||ty<y0-2||ty>y1+3)continue;L.push([n.y+6,4,()=>hdNpcDraw(n)])}
 for(const b of BLD)if(inV(b.tx+b.w/2,b.ty+1,b.w))L.push([(b.ty+2)*16,4,()=>drBld(b,tm)]);
 for(const h of HOUSES){const w=h.w||5;if(!inV(h.x,h.y,w))continue;const o={...HOUSE_STYLE,w,tx:h.x-(w-1)/2,ty:h.y-1,castle:!!h.castle};L.push([(h.y+1)*16,4,()=>drBld(o,tm)])}
 for(const[i,st]of STR){const x=i%N,y=(i/N)|0;if(x<x0-1||x>x1+1||y<y0-1||y>y1+2)continue;L.push([y*16+13,4,()=>drawStruct(i,st,false)])}
 for(const[x,y]of LAMPS)if(inV(x,y))L.push([(y+1)*16-2,4,()=>drawLamp(x,y,tm)]);
 if(inV(WELL[0],WELL[1]))L.push([(WELL[1]+1)*16-2,4,()=>drawWell(...WELL)]);
 for(const i of SIGNS.keys()){const x=i%N,y=(i/N)|0;if(inV(x,y))L.push([(y+1)*16-2,4,()=>drawSign(i)])}
 if(inV(WRK.x,WRK.y,4))L.push([WRK.y*16+16,4,()=>drawWreck(tm)]);if(inV(HRM.x,HRM.y,4))L.push([HRM.y*16+2,4,()=>drawHut()])};
// ---------- wolves, skeletons, the Slime King, the Bone Lord and campfires ----------
const HDEN=new Map();
const hdEn=(key,make)=>{let c=HDEN.get(key);if(!c){c=make();HDEN.set(key,c)}return c};
const hdDraw=(c,x,y,flip)=>{const w=c.width/2,hh=c.height/2;if(!flip){g.drawImage(c,x,y,w,hh);return}g.save();g.translate(x+w,y);g.scale(-1,1);g.drawImage(c,0,0,w,hh);g.restore()};
// box / ellipse painters on a texel buffer with an origin
function hdPainter(b,OX,OY,flat){const put=(x,y,c)=>hdSet(b,OX+x,OY+y,c,1),sh=(pal,v,x,y)=>flat?pal[Math.max(0,Math.min(pal.length-1,Math.floor(v*(pal.length-1)+.5)))]:pal[hdQ(v,pal.length,OX+x,OY+y)];
 return{put,
  box:(x0,y0,x1,y1,pal,r,lift)=>{for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const cx=x<x0+r?x0+r:x>=x1-r?x1-r-1:x,cy=y<y0+r?y0+r:y>=y1-r?y1-r-1:y;if((x-cx)**2+(y-cy)**2>r*r+.5)continue;put(x,y,sh(pal,.66-((x-x0)/(x1-x0))*.42-((y-y0)/(y1-y0))*.14+(lift||0),x,y))}},
  ell:(cx,cy,rx,ry,pal,bias,test)=>{for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const nx=(x+.5-cx)/rx,ny=(y+.5-cy)/ry,q=nx*nx+ny*ny;if(q>1||test&&!test(x,y))continue;const nz=Math.sqrt(1-q);put(x,y,sh(pal,(nx*-.55+ny*-.6+nz*.55)*.5+.5+(bias||0),x,y))}}}}
function hdWolfSp(st,hit,prep){const b=hdBuf(56,40),p=hdPainter(b,26,34,true),F=hit?hdP(['#c8c8d0','#e0e0e8','#f0f0f6','#ffffff']):hdP(['#3a4050','#596273','#7a8496','#a2abbd','#c8d0dc']),PAW=hit?F:hdP(['#2c303c','#4a5060','#6a7282']);
 const s=st?2:-2,ly=prep?2:0;
 p.box(-14-s,-10+ly,-10-s,0,PAW,1,-.1);p.box(6+s,-10+ly,10+s,0,PAW,1,-.1);// far legs
 for(let k=0;k<7;k++)p.ell(-17-k*1.2,-15-k*1.4+ly,4-k*.3,3.4-k*.25,F,.1);// bushy tail
 p.ell(-2,-14+ly,14,8,F,.05);for(let x=-12;x<10;x++){p.put(x,-8+ly,F[hit?3:4]);p.put(x,-7+ly,F[hit?3:4])}// light belly
 p.box(-11+s,-10+ly,-7+s,0,PAW,1);p.box(9-s,-10+ly,13-s,0,PAW,1);// near legs
 p.ell(13,-20+ly*1.5,7.5,6.5,F,.08);p.box(17,-20+ly*1.5,25,-14+ly*1.5,F,2,.05);p.put(24,-19+ly*1.5,hdC('#181018'));p.put(24,-18+ly*1.5,hdC('#181018'));p.put(23,-19+ly*1.5,hdC('#181018'));
 for(const ex of[9,14]){for(let k=0;k<6;k++)for(let x=0;x<4-(k>>1);x++)p.put(ex+x+(k>>1)*.5|0,-25-k+ly*1.5,F[k>3?1:2]);p.put(ex+1,-26+ly*1.5,hdC(hit?'#ffffff':'#d88890'))}
 const eye=hdC(prep&&!hit?'#f84030':'#181018');p.put(15,-22+ly*1.5,eye);p.put(16,-22+ly*1.5,eye);p.put(15,-21+ly*1.5,eye);p.put(16,-21+ly*1.5,eye);if(!hit)p.put(15,-22+ly*1.5,hdC('#ffffff'));
 for(let x=18;x<24;x++)p.put(x,-14+ly*1.5,F[0]);
 hdOutline(b,{1:hdC(hit?'#8888a0':'#181820')});return hdCan(b)}
drawWolf=function(n,tm){const x=Math.round(n.x),y=Math.round(n.y),f=P.x<n.x,hit=Math.abs(n.kx)+Math.abs(n.ky)>.8,st=Math.floor(tm*8+n.x)%2,prep=n.ls==='prep';shd(x,y+5,18);
 const c=hdEn('w'+st+hit+prep,()=>hdWolfSp(st,hit,prep));hdDraw(c,f?x-(c.width/2-13):x-13,y+6-17,f)};
function hdSkelSp(st,hit,boss,cast){const W2=boss?72:44,H2=boss?100:56,b=hdBuf(W2,H2),OX=W2/2,OY=boss?92:52,p=hdPainter(b,OX,OY,true),k=boss?1.6:1,
  BN=hit?hdP(['#c8a0a0','#e8c0c0','#ffd8d8','#ffecec']):hdP(['#8a8272','#b4ac9a','#d8d2c2','#f0ece0','#ffffff']),INK=hdC('#1a1418');
 const s=st?1:0,R=(v)=>Math.round(v*k);
 // legs and feet
 p.box(R(-5),R(-9),R(-2),-2+(s?-1:0),BN,1);p.box(R(2),R(-9),R(5),-2+(s?0:-1),BN,1);p.box(R(-7),-3+(s?-1:0),R(-1),1+(s?-1:0),BN,1);p.box(R(1),-3+(s?0:-1),R(7),1+(s?0:-1),BN,1);
 if(boss){const RB=cast?hdP(['#5a2080','#8a38c0','#b058e8','#d090ff']):hdP(['#38184e','#56287a','#7838a8','#9a58c8']);
  for(let y=R(-22);y<R(-2);y++){const t=(y-R(-22))/(R(-2)-R(-22)),hw=Math.round(9*k+t*5*k);for(let x=-hw;x<hw;x++)p.put(x,y,RB[Math.max(0,Math.min(3,Math.floor((.75-(x+hw)/(2*hw)*.55-t*.15)*3+.5)))])}
  for(let x=R(-9);x<R(9);x++){p.put(x,R(-13),hdC('#f8d848'));p.put(x,R(-13)+1,hdC('#c89820'))}for(let y=R(-22);y<R(-2);y++)p.put(0,y,hdC('#f8d848'))}
 else{// pelvis, spine and ribs
  p.box(R(-5),R(-11),R(5),R(-8),BN,1);for(let y=R(-22);y<R(-11);y++){p.put(-1,y,BN[1]);p.put(0,y,BN[2])}
  for(const ry of[-21,-18,-15])for(let x=R(-6);x<R(6);x++){if(x===-1||x===0)continue;const yy=R(ry)+(Math.abs(x)>4?1:0);p.put(x,yy,BN[x<0?3:2]);p.put(x,yy+1,BN[0])}}
 // arms
 const ax=boss?R(-14):R(-9),ax2=boss?R(11):R(7);p.box(ax,R(-21),ax+R(2),R(-10),BN,1);p.ell(ax+R(1),R(-9),R(1.6),R(1.6),BN);p.box(ax2,R(-21),ax2+R(2),R(-10),BN,1,-.1);p.ell(ax2+R(1),R(-9),R(1.6),R(1.6),BN,-.1);
 if(boss)p.box(ax2+R(2)-2,R(-30),ax2+R(2),R(-6),hdP(['#4a2a14','#7a4a20','#a86c36']),1);
 // skull and jaw
 p.ell(0,R(-32),R(8),R(7.5),BN,.08);p.box(R(-5),R(-27),R(5),R(-22),BN,2,-.05);
 for(const ex of[R(-5),R(1.5)]){p.ell(ex+R(1.6),R(-32),R(2),R(2.2),[INK,INK])}
 p.put(0,R(-28),INK);p.put(-1,R(-28),INK);for(let x=R(-4);x<R(4);x+=2)p.put(x,R(-24),BN[0]);for(let x=R(-4);x<R(4);x++)p.put(x,R(-25),INK);
 if(boss){const GDp=hdP(['#a07010','#d0a020','#f8d848','#fff0a0']);for(let x=R(-8);x<R(8);x++)for(let y=R(-41);y<R(-38);y++)p.put(x,y,GDp[y===R(-41)?3:2]);
  for(const cx of[R(-7),R(-1),R(5)])for(let k2=0;k2<5;k2++)for(let x=0;x<3-(k2>>1);x++)p.put(cx+x+(k2>>1),R(-41)-k2,GDp[2]);p.put(0,R(-40),hdC('#e03030'));p.put(1,R(-40),hdC('#e03030'))}
 hdOutline(b,{1:hdC('#2a2420')});return hdCan(b)}
drawSkel=function(n,tm){const x=Math.round(n.x),y=Math.round(n.y),hit=Math.abs(n.kx)+Math.abs(n.ky)>.8,st=Math.floor(tm*6+n.x)%2;shd(x,y+6,13);
 const c=hdEn('s'+st+hit,()=>hdSkelSp(st,hit,false,false));hdDraw(c,x-11,y+6.5-26,P.x<n.x);
 if(!hit&&Math.sin(tm*5+n.x)>.3){g.fillStyle='#f04030';const f=P.x<n.x;g.fillRect(x+(f?1:-2.5),y-10,1,1);g.fillRect(x+(f?-2.5:1),y-10,1,1)}};
drawBoneLord=function(n,tm){const x=Math.round(n.x),y=Math.round(n.y),hit=Math.abs(n.kx)+Math.abs(n.ky)>.6,st=Math.floor(tm*4)%2,cast=n.cast>0;shd(x,y+8,28);
 const c=hdEn('L'+st+hit+cast,()=>hdSkelSp(st,hit,true,cast));hdDraw(c,x-18,y+8.5-46,P.x<n.x);
 if(Math.sin(tm*6)>0){g.fillStyle='#f04030';const f=P.x<n.x;for(const ex of[-3.5,1.5])g.fillRect(x+(f?-ex-1.5:ex),y-18,1.5,1.5)}
 if(cast){g.globalAlpha=.35+.25*Math.sin(tm*30);g.fillStyle='#d090ff';g.fillRect(x-14,y-30,28,1);g.fillRect(x-12,y-34,24,.5);g.globalAlpha=1}
 Rg(x-16,y-46,32,4,O);Rg(x-15,y-45,Math.max(0,30*n.hp/45),2,'#a050e0')};
// slimes of any size share one painter
function hdSlimeBig(f,white){return hdEn('K'+f+white,()=>{const fr=f,ht=fr?40:46,b=hdBuf(68,52),cy=50,pal=white?hdP(['#9898b0','#c8c8dc','#e4e4f0','#f4f4fa','#ffffff']):hdP(['#16246a','#2340a8','#3664d8','#5590f0','#8cc0ff']);
  hdSph(b,34,cy,fr?33:31,ht,pal,{cut:49,id:1,b:.05,fn:(v,x,y,nx,ny)=>v+(ny>.55?-.25:0)+(nx>.6&&ny>.1?.35:0)});
  if(!white){for(let y=0;y<4;y++)for(let x=0;x<6-y;x++)hdSet(b,18+x+y,cy-ht+10+y,hdC('#ffffff'));hdSet(b,28,cy-ht+9,hdC('#d8ecff'));hdSet(b,29,cy-ht+9,hdC('#d8ecff'))}
  hdOutline(b,{1:hdC(white?'#505068':'#0c1240')});return hdCan(b)})}
drawBoss=function(n,tm){const x=Math.round(n.x),y=Math.round(n.y),fr=Math.floor(tm*3)%2,hit=Math.abs(n.kx)+Math.abs(n.ky)>.5,sp=hdSlimeBig(fr,hit),hh=sp.height/2,top=y+8.5-hh;shd(x,y+8,32);g.drawImage(sp,x-17,top,34,hh);
 const ct=top+(fr?6:3);g.fillStyle='#181018';g.fillRect(x-7.5,ct-2.5,15,4.5);for(const a of[-7,-1.5,4])g.fillRect(x+a-.5,ct-6,4,4);
 g.fillStyle='#f8d848';g.fillRect(x-7,ct-2,14,3.5);for(const a of[-7,-1.5,4])g.fillRect(x+a,ct-5.5,3,3.5);g.fillStyle='#fff0a0';g.fillRect(x-7,ct-2,14,.5);g.fillStyle='#c89820';g.fillRect(x-7,ct+1,14,.5);g.fillStyle='#e03030';g.fillRect(x-1,ct-1.5,2,2);g.fillStyle='#ff9090';g.fillRect(x-1,ct-1.5,.5,.5);
 if(!hit){const e=ct+6,d=P.x>n.x?1:-1;g.fillStyle='#ffffff';for(const ex of[x-9,x+3]){g.fillRect(ex,e,6,7);g.fillRect(ex+.5,e-.5,5,8)}g.fillStyle='#181018';for(const ex of[x-9,x+3]){g.fillRect(ex+1.5+d,e+2,3,4);g.fillRect(ex+2+d,e+1.5,2,5)}g.fillStyle='#ffffff';for(const ex of[x-9,x+3])g.fillRect(ex+2+d,e+2,1,1)}
 Rg(x-16,top-10,32,4,O);Rg(x-15,top-9,Math.max(0,30*n.hp/30),2,'#e03030')};
// campfire: stone ring, crossed logs, layered flame and embers
const HDFIRE=[];
function hdFireBase(){if(HDFIRE.base)return HDFIRE.base;const b=hdBuf(36,16),p=hdPainter(b,18,10,true),ST=hdP(['#4a4a58','#6c6c7c','#9090a0','#b8b8c8']),LG=hdP(['#4a2a14','#6e4220','#94602e','#b8824a']);
 for(let k=0;k<8;k++){const a=k/8*Math.PI*2,sx=Math.round(Math.cos(a)*13),sy=Math.round(Math.sin(a)*4.5);p.ell(sx,sy,3.2,2.5,ST)}
 p.box(-11,-3,11,1,LG,1);p.box(-9,-1,9,3,LG,1,-.1);for(const ex of[-11,10])for(let y=-3;y<1;y++)p.put(ex,y,hdC('#d8b080'));
 hdOutline(b,{1:hdC('#221816')});return HDFIRE.base=hdCan(b)}
pF=function(f,tm){const x=Math.round(f.x),y=Math.round(f.y);shd(x,y+4,18);const bs=hdFireBase();g.drawImage(bs,x-9,y-2,18,8);
 const fl=(cx,by2,w,hh,col)=>{g.fillStyle=col;for(let k=0;k<hh*2;k++){const t=k/(hh*2),ww=w*Math.sin(Math.PI*(1-t)*.5+.15)*(1-t*.55);g.fillRect(Math.round((cx-ww/2)*2)/2,by2-k*.5,Math.max(.5,Math.round(ww*2)/2),.5)}};
 const k=tm*9+f.x,a=Math.sin(k)*.6,bq=Math.sin(k*1.7)*.5;
 fl(x+a*.5,y+1,9,9+bq,'#c8281a');fl(x-2+a,y+1,5,7+Math.sin(k*1.3),'#e84818');fl(x+2-a,y+1,5,7.5+Math.cos(k*1.1),'#e84818');fl(x+a*.3,y+1,6,6+bq,'#f88820');fl(x,y+1,3.5,3.5,'#f8e060');
 g.fillStyle='#fff4c0';g.fillRect(x-.5,y-1,1,1.5);
 for(let i=0;i<3;i++){const ph=(tm*.8+i*.33+f.x*.01)%1;g.globalAlpha=1-ph;g.fillStyle=i%2?'#f8c040':'#f88820';g.fillRect(x+Math.sin(ph*9+i*2)*3,y-8-ph*12,.5+(i===1?.5:0),.5+(i===1?.5:0))}g.globalAlpha=1};
