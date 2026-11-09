// ---------------------------------------------------------------- 54. Terrain edges, cliffs and entrances (graphics polish)
// Drawing only: nothing here changes what is solid, where anything is, or how anything plays.
// - Cliff faces are 8px tall (were 5px) and follow the plateau's real outline at the lip, so a face no longer stops
//   in a square notch where the plateau's side wobbles; face ends get a dark end-cap and a dark base line.
// - Every height change (grass over sand, snow over sand, rock over anything, the regions' raised ground) gets the same
//   Gen 3 ledge treatment: a dark edge line on the high side with a light lip just inside it, and a soft shadow line on
//   the low side (below and to the east, light comes from the upper left). Inner corners where a plateau meets a cliff
//   face get the edge line too. Paths, paving, lava and sulfur are flat overlays and are left alone.
var ED_FY=8;
var ED_SKIP=new Uint8Array(16);for(const k of[0,9,11,14,15])ED_SKIP[k]=1;
// the texel type for the face band of a south-facing cliff, or -1 to use the normal (wobbly) rule
function edFace(T,U,V,wx,wy,tx,ty,real,ly){
 const f0=real===3&&T(tx,ty+1)!==3,fl=T(tx-1,ty)===3&&T(tx-1,ty+1)!==3,fr=T(tx+1,ty)===3&&T(tx+1,ty+1)!==3;if(!f0&&!fl&&!fr)return -1;
 const Vl=(ty*16+ED_FY)*2-1,wyl=Vl/2,px=(hdVN(U/13,Vl/13)-.5)*7+(hdVN(U/5,Vl/5)-.5)*2,py=(hdVN(U/13+40,Vl/13+9)-.5)*7+(hdVN(U/5+3,Vl/5+70)-.5)*2,
  sx=Math.floor((wx+px)/16),sy=Math.floor((wyl+py)/16);
 if(T(sx,sy)===3){const fs=sx===tx?f0:sx===tx-1?fl:sx===tx+1?fr:(T(sx,ty)===3&&T(sx,ty+1)!==3);return sy===ty&&fs?6:3}   // under the plateau's lip: cliff face (or plateau that carries on down: inner corner)
 if(f0)return T(tx,ty+1);                                       // the lip wobbles inward here: the ground below shows
 return -1}
function edK(c,k){const r=c&255,g2=(c>>>8)&255,b=(c>>>16)&255,kb=Math.min(1,k+.06);return(0xff000000|(Math.min(255,b*kb|0)<<16)|(Math.min(255,g2*k|0)<<8)|Math.min(255,r*k*.97|0))>>>0}
function edL(c,a){const r=c&255,g2=(c>>>8)&255,b=(c>>>16)&255,f=v=>Math.min(255,v+(255-v)*a|0);return(0xff000000|(f(b)<<16)|(f(g2)<<8)|f(r))>>>0}
function hdEdge(b,typ,B,M,S,EL){const d=b.d;
 const lo=(n,t)=>!ED_SKIP[n]&&n!==6&&EL[n]<EL[t],up=(n,t)=>n===6||(!ED_SKIP[n]&&EL[n]>EL[t]);
 const B2=2*B,B3=3*B,B4=4*B;
 for(let y=0;y<S;y++)for(let x=0;x<S;x++){const i=(y+M)*B+x+M,t=typ[i];if(ED_SKIP[t])continue;
  // most texels are nowhere near an edge: everything within reach is the same type
  if(typ[i-1]===t&&typ[i+1]===t&&typ[i-B]===t&&typ[i+B]===t&&typ[i-2]===t&&typ[i+2]===t&&typ[i-B2]===t&&typ[i+B2]===t&&typ[i-3]===t&&typ[i+3]===t&&typ[i-B3]===t&&typ[i+B3]===t&&typ[i-B4]===t&&typ[i+B4]===t&&typ[i-B-1]===t&&typ[i-B+1]===t&&typ[i+B-1]===t&&typ[i+B+1]===t)continue;
  const o=y*S+x;let c=d[o];
  if(t===6){if(typ[i+B]!==6)c=edK(c,.55);else if(typ[i-1]!==6||typ[i+1]!==6)c=edK(c,.62);else if(typ[i-2]!==6||typ[i+2]!==6)c=edK(c,.82);d[o]=c;continue}
  let k=1,a=0;
  if(lo(typ[i+B],t)||lo(typ[i+2*B],t))k=.56;                                            // ledge lip (drop to the south)
  else if(lo(typ[i-B],t)||lo(typ[i-2*B],t)||lo(typ[i-1],t)||lo(typ[i-2],t))k=.64;        // far and west sides
  else if(lo(typ[i+1],t)||lo(typ[i+2],t))k=.58;                                          // east side (in shade)
  else if(lo(typ[i+B+1],t)||lo(typ[i+B-1],t)||lo(typ[i-B+1],t)||lo(typ[i-B-1],t))k=.62;  // round the corners
  else if(typ[i-1]===6||typ[i+1]===6||typ[i-2]===6||typ[i+2]===6)k=.62;                 // inner corner beside a cliff face
  else if(lo(typ[i+3*B],t)||lo(typ[i+4*B],t))a=.26;                                      // the light lip above a ledge line
  else if(lo(typ[i-3*B],t)||lo(typ[i-3],t))a=.14;
  else if(lo(typ[i+3],t))k=.88;
  if(k===1&&!a){if(up(typ[i-B],t))k=.7;else if(up(typ[i-2*B],t))k=.76;else if(up(typ[i-3*B],t))k=.84;else if(up(typ[i-4*B],t))k=.92;// shadow line below
   else if(up(typ[i-1],t))k=.8;else if(up(typ[i-2],t))k=.9}                                                                          // and east of it
  if(k!==1)c=edK(c,k);if(a)c=edL(c,a);d[o]=c}}
// ---------- dungeon entrances: shaded HD sprites that sit on the ground, same tiles and triggers as before ----------
// Each one is built once into a 2x canvas and drawn where the old flat rectangles were: a framed opening you can read
// at a glance (rock arch / ice arch / sea cave / tomb doorway / ruined arch with steps down), base rocks or sand drifts
// that run into the ground, and a soft shadow so nothing floats.
const E54={};
const E54PAL={rock:hdP(['#33281f','#4a3b2e','#625040','#7c6a56','#9c8a72','#bcae96']),ice:hdP(['#222e44','#33425c','#4a5e80','#6a84a8','#94acca','#cadcf0']),
 sea:hdP(['#121c22','#1e2c32','#2c4044','#3e5856','#56726a','#789484']),sand:hdP(['#7e5a30','#9c7440','#b88c52','#d0a668','#e4be82','#f4d8a4']),
 brick:hdP(['#8a6438','#a47c4a','#bc9460','#d2ac76','#e6c690'])};
function e54Shadow(b,x0,y0,x1,y1,a){for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){if(x<0||y<0||x>=b.w||y>=b.h)continue;const i=y*b.w+x;if(!b.id[i]){b.d[i]=((a|0)<<24)>>>0;b.id[i]=0}}}
// texel-space helpers (2 texels per world pixel)
function e54Box(b,x0,y0,x1,y1,pal,lt,id){for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const v=lt(x,y);if(v==null)continue;hdSet(b,x,y,pal[hdQ(v,pal.length,x,y)],id||1)}}
// a rock arch: boulders round a round-topped opening (cx, top, base, half width r all in texels)
function e54Arch(b,cx,top,base,r,pal,seed,inner){hdSeed=seed;const cy=top+r,pts=[];
 for(let k=0;k<=9;k++){const a=Math.PI+k/9*Math.PI;pts.push([cx+Math.cos(a)*(r+8),cy+Math.sin(a)*(r+7),8+hdR()*3])}
 for(let y=cy+6;y<base-6;y+=10){pts.push([cx-r-8,y,8+hdR()*2]);pts.push([cx+r+8,y,8+hdR()*2])}
 pts.push([cx-r-10,base-7,9],[cx+r+10,base-7,9],[cx-r-18,base-4,5.5],[cx+r+17,base-4,6]);
 pts.sort((p,q)=>p[1]-q[1]);for(const[x,y,rr]of pts)hdSph(b,x+hdR()*2-1,y,rr,rr*.82,pal,{nz:.38,s:seed,id:1,cut:base-1});
 // the opening
 for(let y=top;y<base;y++)for(let x=cx-r;x<=cx+r;x++){const dx=(x+.5-cx)/r,dy=(y+.5-cy)/r;if(y<cy&&dx*dx+dy*dy>1)continue;
  const jag=hdH(x>>1,7)<.3&&y<cy+2;let c=inner(x,y,(y-top)/(base-top),dx);if(jag&&(dx*dx+dy*dy)>.8)continue;hdSet(b,x,y,c,2)}
 return cy}
function e54Snow(b,x0,x1,yMax,deep){for(let x=x0;x<x1;x++){let y=0;while(y<yMax&&b.id[y*b.w+x]!==1)y++;if(y>=yMax)continue;const n=(deep||2)+(hdH(x>>1,3)<.5?1:0);
 for(let k=0;k<n;k++){const i=(y+k)*b.w+x;if(b.id[i]!==1)break;b.d[i]=HDSNOW[k===0?3:k===n-1?1:2]}}}
function e54Can(b,outline){hdOutline(b,outline);return hdCan(b)}
function e54Cave(kind){if(E54[kind])return E54[kind];
 // 48x40 world px; the entrance tile sits at world (16..32, 24..40)
 const b=hdBuf(96,80),cx=48,top=30,base=80,r=14;
 const pal=kind==='ice'?E54PAL.ice:kind==='sea'?E54PAL.sea:E54PAL.rock;
 const dark=kind==='ice'?['#060a14','#0c1424','#16223a']:kind==='sea'?['#04100e','#0a1c1c','#0e2a2a']:['#060406','#0e0a0a','#1a1210'];
 const D=dark.map(hdC),floor=kind==='sea'?hdP(['#0c3036','#12444a','#1a5a60']):kind==='ice'?hdP(['#1e2c44','#2c3e5c','#40587c']):hdP(['#22180f','#33261a','#4a3828']);
 e54Arch(b,cx,top,base,r,pal,kind==='ice'?17:kind==='sea'?23:11,(x,y,t,dx)=>{
  if(t>.78){const k=(t-.78)/.22;return floor[hdQ(k*.9+(hdH(x>>1,y>>1)-.5)*.2,3,x,y)]}   // ground running in
  const v=.15+t*.9-Math.abs(dx)*.25;return D[hdQ(v,3,x,y)]});
 if(kind!=='sea')e54Snow(b,0,96,40,kind==='ice'?3:2);
 if(kind==='ice'){hdSeed=5;for(let k=0;k<8;k++){const x=cx-r+2+Math.floor(k*(2*r-3)/7),L=4+Math.floor(hdR()*9);let y=0;while(y<70&&b.id[y*96+x]!==2)y++;
  for(let j=0;j<L;j++){const w=j<L*.5?1:0;for(let a=-w;a<=w;a++)hdSet(b,x+a,y+j,HDSNOW[j<2?3:j<L-2?2:1],3)}}}
 if(kind==='sea'){for(let x=8;x<88;x++)for(let y=50;y<74;y++){const i=y*96+x;if(b.id[i]===1&&hdH(x>>1,y>>1)<.12)b.d[i]=hdC(hdH(x,y)<.5?'#3e7a4a':'#5a9a58')}}  // weed and algae on wet rock
 return E54[kind]=e54Can(b,{1:hdC(kind==='ice'?'#141c2c':kind==='sea'?'#0a1214':'#1c140e'),3:hdC('#4a6a90')})}
function e54Put(c,x,y){g.drawImage(c,Math.round(x*2)/2,Math.round(y*2)/2,c.width/2,c.height/2)}
// the three rock openings, drawn over their tile (x0,y0 = the entrance tile's top-left)
function e54DrawCave(kind,x0,y0){shd(x0+8,y0+15,34);e54Put(e54Cave(kind),x0-16,y0-24)}
// the Sunken Tomb: a stepped plinth half-buried in sand, battered walls, pillars and a doorway with steps going down
function e54Tomb(){if(E54.tomb)return E54.tomb;const W=64,H=60,b=hdBuf(W*2,H*2),S=E54PAL.sand,K=E54PAL.brick;
 for(let y=30;y<120;y++){const xa=y<96?Math.round(104+Math.max(0,(y-28)/68)*6):y<104?114:120;e54Shadow(b,xa,y,Math.min(128,xa+(y<96?9:7)),y+1,y<104?70:58)}
 const L=(a,c)=>a*2,R=(x0,y0,x1,y1,pal,fn,id)=>e54Box(b,x0*2,y0*2,x1*2,y1*2,pal,fn,id);
 // plinth (two steps)
 R(4,52,60,60,S,(x,y)=>y<105?.95:y<107?.7:.45+(hdH(x>>3,y>>2)-.5)*.15);R(7,48,57,52,S,(x,y)=>y<97?.95:.62+(hdH(x>>3,y)-.5)*.1);
 // battered walls with brick courses
 for(let y=28;y<96;y++){const t=(y-28)/68,xa=Math.round(24-t*6),xb=Math.round(104+t*6);for(let x=xa;x<xb;x++){const row=Math.floor((y-28)/12),off=row%2?10:0,mx=(x-xa+off)%20,my=(y-28)%12;
  let v=.62+(hdH((x-xa+off)/20|0,row)-.5)*.25-(x-xa)/(xb-xa)*.18;if(my===0)v=.08;else if(mx===0)v=.15;else if(my===1)v+=.18;else if(my===11)v-=.12;hdSet(b,x,y,K[hdQ(v,5,x,y)],1)}}
 // cornice and capstone
 R(9,8,55,14,S,(x,y)=>y<18?.98:y<20?.8:y<26?.6:.35);R(20,2,44,8,S,(x,y)=>y<6?.95:.6-(x-40)/120);
 // pillars
 for(const px of[17,41])R(px,15,px+6,48,S,(x,y)=>y<36?.9:.82-((x-px*2)/12)*.5+(hdH(x,y>>2)-.5)*.08);
 for(const px of[16,40])R(px,14,px+8,17,S,(x,y)=>y<30?.98:.55);
 // lintel with a carved eye
 R(23,18,41,22,S,(x,y)=>y<38?.92:.55);for(const[a,c2,col]of[[30,19,'#3a2410'],[31,19,'#f0ece0'],[32,19,'#f0ece0'],[33,19,'#3a2410'],[31,20,'#3a2410'],[32,20,'#3a2410']])R(a,c2,a+1,c2+1,[hdC(col)],()=>0);
 // doorway: dark at the top, steps descending at the bottom (they run down through the plinth)
 for(let y=44;y<120;y++){const t=(y-44)/76,ha=Math.round(13+t*3);for(let x=64-ha;x<64+ha;x++){let c;
  if(y>=84){const st=Math.floor((y-84)/6),f=(y-84)%6;c=f===0?hdC('#1a1008'):K[hdQ(.12+st*.13-(f>3?.06:0),5,x,y)]}else c=hdC(y<60?'#0c0804':'#140c06');hdSet(b,x,y,c,2)}}
 // sand drifts banked against the base
 hdSeed=9;for(const[x,y,rx,ry]of[[10,58,9,4],[58,58,8,3.5],[16,60,6,3],[49,60,5,2.5],[3,59,4,2.5]])hdSph(b,x*2,y*2,rx*2,ry*2,hdP(['#c8964e','#d8aa62','#e6bc76','#f2cc8a']),{id:4,cut:119,k:.6,b:.3});
 return E54.tomb=e54Can(b,{1:hdC('#3a2410'),2:hdC('#2a1808'),4:hdC('#b08040')})}
function e54DrawTomb(x0,y0){shd(x0+8,y0+15,60);e54Put(e54Tomb(),x0-24,y0-44)}
// Scorpion Hollow: a broken sandstone wall with a voussoir arch and a stair going down
function e54Ruin(){if(E54.ruin)return E54.ruin;const W=96,H=60,b=hdBuf(W*2,H*2),K=E54PAL.brick,S=E54PAL.sand;hdSeed=31;
 e54Shadow(b,2*88,2*22,2*94,2*58,64);e54Shadow(b,2*8,2*58,2*94,2*60,56);
 // ragged top line (whole bricks missing), lower in two places where the wall has fallen
 const topAt=x=>{const X=x>>1,c=Math.floor(X/10);let t=16+Math.floor(hdH(c,4)*3)*5;if(X>=16&&X<28)t+=10;if(X>=68&&X<78)t+=15;if(X>=38&&X<58)t=Math.min(t,18);return t*2};
 for(let x=16;x<176;x++){const t0=topAt(x);for(let y=t0;y<116;y++){const row=Math.floor((y-20)/10),off=row%2?10:0,mx=(x+off)%20,my=(y-20+100)%10;
  let v=.58+(hdH((x+off)/20|0,row)-.5)*.3-(x>150?.12:0);if(my===0)v=.06;else if(mx===0)v=.12;else if(my===1)v+=.2;else if(my===9)v-=.12;if(y<t0+2)v=Math.max(v,.9);hdSet(b,x,y,K[hdQ(v,5,x,y)],1)}}
 // base course, a little wider
 e54Box(b,12,110,180,120,S,(x,y)=>y<112?.92:.42+(hdH(x>>4,y)-.5)*.2);
 // the arch: voussoirs round the opening, keystone, stairs going down into the dark
 const cx=96,cy=60,ri=20,ro=28;
 for(let y=cy-ro;y<120;y++)for(let x=cx-ro;x<=cx+ro;x++){const dx=x+.5-cx,dy=y+.5-cy,d=Math.hypot(dx,Math.min(0,dy));
  if(dy<0&&d>ro)continue;if(Math.abs(dx)>ro)continue;
  if(d<=ri&&Math.abs(dx)<ri){let c;if(y>=84){const st=Math.floor((y-84)/6),f=(y-84)%6;c=f===0?hdC('#1a1008'):K[hdQ(.1+st*.14-(f>3?.06:0),5,x,y)]}else c=hdC(y<cy?'#0a0604':'#120a06');hdSet(b,x,y,c,2);continue}
  const ang=Math.atan2(dy,dx),seg=dy<0?Math.floor((ang+Math.PI)/(Math.PI/7)):-1,edge=dy<0?Math.abs(((ang+Math.PI)/(Math.PI/7))%1-.5)>.42:((y-cy)%12===0);
  let v=.82-(d-ri)/(ro-ri)*.25+(dx>0?-.12:0);if(edge)v=.2;if(seg===3||seg===4&&dy<-ri)v+=.08;hdSet(b,x,y,S[hdQ(v,6,x,y)],1)}
 // fallen blocks and sand at the foot
 for(const[x,y,w,h]of[[22,106,12,8],[150,108,14,8],[164,112,10,6],[40,112,8,6]])e54Box(b,x,y,x+w,y+h,S,(X,Y)=>Y<y+2?.95:.5-(X-x)/w*.2);
 for(const[x,y,rx,ry]of[[14,58,9,3.5],[86,58,10,4],[30,60,7,2.5],[66,60,6,2.5]])hdSph(b,x*2,y*2,rx*2,ry*2,hdP(['#c8964e','#d8aa62','#e6bc76','#f2cc8a']),{id:4,cut:119,k:.6,b:.3});
 return E54.ruin=e54Can(b,{1:hdC('#3a2410'),2:hdC('#2a1808'),4:hdC('#b08040')})}
// the Slime Caverns and the Sunken Tomb join the depth-sorted list (they used to be painted over everything)
const _lh54=LHOOK;LHOOK=(L,x0,y0,x1,y1,tm)=>{if(_lh54)_lh54(L,x0,y0,x1,y1,tm);const inV=(x,y)=>x>=x0-4&&x<=x1+4&&y>=y0-4&&y<=y1+5;
 if(CAVE&&inV(CAVE.x,CAVE.y))L.push([(CAVE.y+1)*16-6,4,()=>{const X=CAVE.x*16,Y=CAVE.y*16;e54DrawCave('rock',X,Y);if(Math.sin(tm*2)>.6){Rg(X+5,Y+4,1,1,'#f8d848');Rg(X+10,Y+4,1,1,'#f8d848')}}]);
 if(TOMB&&inV(TOMB.x,TOMB.y))L.push([(TOMB.y+1)*16-6,4,()=>e54DrawTomb(TOMB.x*16,TOMB.y*16)])};
// region landmarks that are buildings get a contact shadow along their base, so they sit on the paving instead of on top of it
const E54_BASE=new Set(['ruinwall','pillar','vault','shrine','lighthouse','bwall','btower','sealgate','observatory','sealdoor','wtower','temple','spire']);
const _lm54=rgDrawLm;rgDrawLm=function(it,tm){if(E54_BASE.has(it.k)){const sp=rgSprite(it.k,it.v);if(sp){const x=it.x*16+sp.ox,y=it.y*16+sp.oy+sp.hh;
 g.fillStyle='rgba(16,12,28,.28)';g.fillRect(x+1,y-1,sp.ww-2,3);g.fillStyle='rgba(16,12,28,.14)';g.fillRect(x+2,y+2,sp.ww-2,2)}}_lm54(it,tm)};

