// ---------------------------------------------------------------- 56. Gen 3 overworld: terrain, nature, shadows
// Drawing only: nothing here changes what is solid, where anything is, or how anything plays.
// Replaces the HD (2 texels per pixel, dithered) overworld with true Gen 3 pixel art at 1 texel per world pixel:
// - Terrain chunks (Hollow and every region) are flat tile textures in 3-5 shade ramps. A higher ground type spills a
//   few pixels into a lower neighbour in Gen 3's bumpy pattern, gets a dark edge line, and casts a 1px shadow below.
//   Plateaus (rock) end in a striped 7px cliff face with a light lip. Water has a foam line, a light shore band and
//   little wave marks. Frosthollow's paving and pond and Dusthaven's paths are drawn here too.
// - Trees, pines, rocks, ore, berry bushes, cacti and the regions' dead trees, dark trees and crystals are outlined
//   sprites with clean shade bands (no dithering, no smoothing).
// - Shadows are crisp pixel ovals.
var G3=(()=>{
const C=hdC,H=hdH;
// ---------- terrain ----------
const PR=new Int16Array(32).fill(64);[[0,0],[1,2],[2,4],[3,7],[4,5],[5,3],[7,4],[8,2],[9,1],[10,2],[11,2],[12,2],[13,3],[14,2],[15,1],[16,2]].forEach(([t,p])=>PR[t]=p*32+t);
const WV=[0,0,1,1,1,0,0,0,1,1,0,0,0,1,1,1],FH=8;
const P=(a)=>a.map(C);
const T={
 grass:P(['#2c6e34','#3e9440','#5cb450','#80cc68','#a8e48c']),
 sand:P(['#a88c58','#c8aa70','#e4cc94','#f4e2b4']),
 snow:P(['#98a8c4','#c4d0e4','#e4ecf8','#ffffff']),
 dune:P(['#a87038','#d09850','#ecbc70','#f8d898']),
 rock:P(['#6e5a4a','#8e7a66','#a8967e','#c8b8a0']),
 cliff:P(['#3e2c22','#5e4432','#7e5e44','#9e7c5c','#c8ac88']),
 water:P(['#3068c8','#4888e0','#68a8f0','#98ccf8','#e0f4ff']),
 forest:P(['#1e4a26','#2e6634','#3f7f44','#5a9a54']),
 bsand:P(['#28242a','#3a3438','#4c4448','#665c60']),
 lava:P(['#4a1206','#a02408','#e05a10','#f89a20','#ffd050']),
 ash:P(['#3a3230','#4e4440','#62554e','#7a6c62']),
 pave:P(['#5a544a','#8a8478','#a49e90','#c2bcae']),
 ice:P(['#7eaed0','#a2cae6','#c4e0f4','#ffffff']),
 dark:P(['#262234','#34304a','#46405c','#5a5274']),
 dirt:P(['#5a3e26','#7a5a38','#98744c','#b4926a']),
 sulf:P(['#6a7a14','#98a824','#c0cc38','#e4ee80']),
 spave:P(['#987040','#c49a60','#e0bc80','#f4dcac'])};
const FLOW=[['#ffffff','#f8d030'],['#f8e048','#e86030'],['#f8a0c8','#f8f0a0'],['#a8c8ff','#ffffff']].map(P);
const VIOLET=C('#b080e0'),EMBER=C('#f06018'),MOSS=C('#7ab060');
const dk=(c,k)=>{const r=c&255,g2=(c>>>8)&255,b=(c>>>16)&255;return(0xff000000|((b*k)<<16)|((g2*k)<<8)|(r*k))>>>0};
const EDGE=[];const edgeOf=t=>EDGE[t]!==undefined?EDGE[t]:(EDGE[t]=({1:T.sand[0],2:T.grass[0],3:T.rock[0],4:T.snow[0],5:T.dune[0],7:T.forest[0],8:T.bsand[0],9:T.lava[0],10:T.ash[0],11:T.pave[0],12:T.ice[0],13:T.dark[0],14:T.dirt[0],15:T.sulf[0],16:T.spave[0]})[t]||C('#303030'));
// one 8x8-cell decoration per cell, placed by hash: returns the stamp's pixel at (X,Y) or -1
function stamp(X,Y,seed,shape){const cx=X>>3,cy=Y>>3,h=H(cx*13+seed,cy*7+seed*3);if(h>.55)return -1;const ox=1+((h*97|0)%4),oy=2+((h*313|0)%4),dx=(X&7)-ox,dy=(Y&7)-oy;
 for(const s of shape)if(s[0]===dx&&s[1]===dy)return s[2];return -1}
const TUFT=[[0,0,0],[1,-1,1],[2,0,0],[3,-1,1],[4,0,0]],PEB=[[0,0,0],[1,0,0],[0,-1,1]],WAVE=[[0,0,0],[1,-1,0],[2,-1,0],[3,0,0]],DRIFT=[[0,0,0],[1,0,0],[2,0,0],[1,-1,1],[2,-1,1],[3,0,0]];
function tex(t,X,Y){const r=H(X,Y);let s;
 switch(t){
 case 2:{s=stamp(X,Y,1,TUFT);if(s===0)return T.grass[1];if(s===1)return T.grass[4];
  const th=H(X>>4,(Y>>4)+500);if(th<.2){const fx=(X&15)-(4+((th*61|0)%8)),fy=(Y&15)-(4+((th*89|0)%8)),F=FLOW[(th*400|0)%4];
   if(fx===0&&fy===0)return F[1];if((Math.abs(fx)+Math.abs(fy))===1&&fy<1)return F[0];if(fx===0&&fy===1)return F[0];if(fx===0&&fy===2)return T.grass[1]}
  return r<.03?T.grass[2]:T.grass[3]}
 case 1:{s=stamp(X,Y,2,PEB);if(s===0)return T.sand[1];if(s===1)return T.sand[3];return r<.05?T.sand[1]:r>.97?T.sand[3]:T.sand[2]}
 case 4:{s=stamp(X,Y,3,DRIFT);if(s===0)return T.snow[1];if(s===1)return T.snow[3];return r<.03?T.snow[1]:T.snow[2]}
 case 5:{const v=(Y+Math.round(Math.sin(X*.18+(X>>5))*2))%7;if(v===0)return T.dune[1];if(v===1)return T.dune[3];return r<.03?T.dune[1]:T.dune[2]}
 case 3:{s=stamp(X,Y,4,PEB);if(s===0)return T.rock[0];if(s===1)return T.rock[3];const cr=Math.abs(hdVN(X/9,Y/9)-.5);if(cr<.02)return T.rock[1];return r<.04?T.rock[1]:T.rock[2]}
 case 0:{s=stamp(X,Y,5,WAVE);if(s===0)return T.water[2];return T.water[1]}
 case 7:{s=stamp(X,Y,6,TUFT);if(s===0)return T.forest[1];if(s===1)return T.forest[3];return r>.985?MOSS:r<.04?T.forest[1]:T.forest[2]}
 case 8:return r<.06?T.bsand[0]:r>.95?T.bsand[3]:T.bsand[2];
 case 9:{const k=hdVN(X/7,Y/7),cr=Math.abs(hdVN(X/11+5,Y/11+9)-.5);if(cr<.04)return T.lava[0];return k>.7?T.lava[4]:k>.5?T.lava[3]:T.lava[2]}
 case 10:{const cr=Math.abs(hdVN(X/8,Y/8)-.5);if(cr<.025)return r>.96?EMBER:T.ash[0];return r<.05?T.ash[1]:T.ash[2]}
 case 11:case 16:{const p=t===11?T.pave:T.spave,row=Y>>3,mx=(X+(row&1)*4)&7,my=Y&7;if(mx===7||my===7)return p[0];if(mx===0||my===0)return p[3];if(mx===6||my===6)return p[1];return H((X+(row&1)*4)>>3,row)<.3?p[1]:p[2]}
 case 12:{const cr=Math.abs(hdVN(X/10,Y/10)-.5);if(cr<.018)return T.ice[3];return r<.04?T.ice[1]:T.ice[2]}
 case 13:return r>.993?VIOLET:r<.06?T.dark[1]:T.dark[2];
 case 14:{s=stamp(X,Y,7,PEB);if(s===0)return T.dirt[1];if(s===1)return T.dirt[3];return r<.05?T.dirt[1]:T.dirt[2]}
 case 15:{const k=Math.sin(X*.5+Y*.3+hdVN(X/10,Y/10)*8);if(r>.985)return T.sulf[3];return k>.6?T.sulf[1]:T.sulf[2]}
 }return T.rock[2]}
function typeAt(TT,X,Y){const tx=X>>4,ty=Y>>4,lx=X&15,ly=Y&15,t=TT(tx,ty);let best=t,bp=PR[t],n;
 const tr=(n,d,along,seed)=>{if(PR[n]>bp&&d<2+WV[(along+seed)&15]){best=n;bp=PR[n]}};
 n=TT(tx,ty-1);if(n!==3)tr(n,ly,X,(H(tx,ty*3+1)*16)|0);
 n=TT(tx,ty+1);tr(n,15-ly,X,(H(tx,ty*3+2)*16)|0);
 n=TT(tx-1,ty);tr(n,lx,Y,(H(tx*3+1,ty)*16)|0);
 n=TT(tx+1,ty);tr(n,15-lx,Y,(H(tx*3+2,ty)*16)|0);
 for(const[dx,dy]of[[-1,-1],[1,-1],[-1,1],[1,1]]){n=TT(tx+dx,ty+dy);if(PR[n]<=bp||(n===3&&dy<0))continue;if(TT(tx+dx,ty)===n||TT(tx,ty+dy)===n)continue;
  const cx=dx>0?15-lx:lx,cy=dy>0?15-ly:ly;if(cx+cy<2){best=n;bp=PR[n]}}
 return best}
// bake one chunk (HDCS x HDCS tiles) at 1 texel per pixel; TT(x,y) gives the tile type
function bake(kx,ky,TT){const S=HDCS*16,M=12,B=S+2*M,ox=kx*S-M,oy=ky*S-M,typ=new Uint8Array(B*B),cl=new Int8Array(B*B).fill(-1);
 for(let v=0;v<B;v++)for(let u=0;u<B;u++)typ[v*B+u]=typeAt(TT,ox+u,oy+v);
 // cliff faces: rock with open ground within FH pixels straight below
 for(let u=0;u<B;u++){let run=99;for(let v=B-1;v>=0;v--){const i=v*B+u;if(typ[i]===3){run++;if(run<FH)cl[i]=run}else run=-1}}
 const d=new Uint32Array(S*S),W=T.water;
 const pr=i=>PR[typ[i]];
 for(let y=0;y<S;y++)for(let x=0;x<S;x++){const u=x+M,v=y+M,i=v*B+u,t=typ[i],X=ox+u,Y=oy+v;let c;
  if(cl[i]>=0){const k=FH-1-cl[i];   // 0 = top row of the face
   const rx=(X+((H(X>>3,7)*5)|0))%6;
   c=k===0?T.cliff[4]:k===1?T.cliff[3]:cl[i]===0?T.cliff[0]:rx===0?T.cliff[1]:rx===1?T.cliff[3]:k===FH-3&&rx>2?T.cliff[1]:T.cliff[2];
   if(typ[i-1]!==3||typ[i+1]!==3)c=T.cliff[0]}
  else if(t===0){let dist=9;for(let r=1;r<=3&&dist===9;r++)for(let a=-r;a<=r;a++){if(typ[i+a-r*B]||typ[i+a+r*B]||typ[i-r+a*B]||typ[i+r+a*B]){dist=r;break}}
   c=dist===1?W[4]:dist===2?W[3]:dist===3?(((X+Y)&1)?W[3]:W[2]):tex(0,X,Y)}
  else{c=tex(t,X,Y);const p=PR[t];
   const nN=typ[i-B],nS=typ[i+B],nW=typ[i-1],nE=typ[i+1];
   if(t===3&&cl[i+B]>=0)c=T.rock[0];                                               // rim above a cliff
   else if((PR[nN]<p&&cl[i-B]<0)||PR[nS]<p&&cl[i+B]<0||PR[nW]<p&&cl[i-1]<0||PR[nE]<p&&cl[i+1]<0)c=edgeOf(t);   // edge line on the high side
   else if(t!==9&&t!==15){                                                         // shadow cast down / right onto lower ground
    if(cl[i-B]===0||cl[i-2*B]===0)c=dk(c,.72);else if(PR[nN]>p&&nN!==0)c=dk(c,.84);else if(PR[nW]>p&&nW!==0&&((Y&1)===0))c=dk(c,.9)}}
  d[y*S+x]=c}
 const cv=document.createElement('canvas');cv.width=S;cv.height=S;const x2=cv.getContext('2d'),im=x2.createImageData(S,S);new Uint32Array(im.data.buffer).set(d);x2.putImageData(im,0,0);return cv}
// ---------- sprites ----------
function spr(w,h){return{w,h,d:new Uint32Array(w*h),id:new Uint8Array(w*h)}}
const put=(b,x,y,c,id)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=b.w||y>=b.h)return;b.d[y*b.w+x]=c;b.id[y*b.w+x]=id||1};
function outline(b,c){const add=[];for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++){const i=y*b.w+x;if(b.id[i])continue;if((x>0&&b.id[i-1]&&b.id[i-1]<200)||(x<b.w-1&&b.id[i+1]&&b.id[i+1]<200)||(y>0&&b.id[i-b.w]&&b.id[i-b.w]<200)||(y<b.h-1&&b.id[i+b.w]&&b.id[i+b.w]<200))add.push(i)}
 for(const i of add){b.d[i]=c;b.id[i]=200}}
function can(b,scale){const c=document.createElement('canvas');c.width=b.w;c.height=b.h;const x=c.getContext('2d'),im=x.createImageData(b.w,b.h);new Uint32Array(im.data.buffer).set(b.d);x.putImageData(im,0,0);
 if(!scale)return c;const c2=document.createElement('canvas');c2.width=b.w*scale;c2.height=b.h*scale;const x2=c2.getContext('2d');x2.imageSmoothingEnabled=false;x2.drawImage(c,0,0,c2.width,c2.height);return c2}
// a lit ellipse in flat bands: pal[0] darkest .. pal[n-1] lightest
function ball(b,cx,cy,rx,ry,pal,id,mask){const n=pal.length;for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){
 const nx=(x+.5-cx)/rx,ny=(y+.5-cy)/ry,q=nx*nx+ny*ny;if(q>1)continue;if(mask&&!mask(x,y))continue;const nz=Math.sqrt(1-q),v=(-nx*.55-ny*.7+nz*.45)*.5+.5;
 put(b,x,y,pal[Math.max(0,Math.min(n-1,Math.floor(v*n*1.05)))],id)}}
// rim line inside a shape where its own pixel borders another of the same shape group further down-right (clump separation)
function clumps(b,list,pal,line,id){const own=new Int16Array(b.w*b.h).fill(-1);
 list.forEach((cc,k)=>{const[cx,cy,rx,ry]=cc;ball(b,cx,cy,rx,ry,pal,id);for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const nx=(x+.5-cx)/rx,ny=(y+.5-cy)/ry;if(nx*nx+ny*ny<=1&&x>=0&&y>=0&&x<b.w&&y<b.h)own[y*b.w+x]=k}});
 for(let y=1;y<b.h-1;y++)for(let x=1;x<b.w-1;x++){const i=y*b.w+x,k=own[i];if(k<0)continue;const a=own[i+b.w],c=own[i+1];if((a>=0&&a!==k&&a>k)||(c>=0&&c!==k&&c>k))continue;
  if((own[i-b.w]>=0&&own[i-b.w]<k&&list[own[i-b.w]][1]<list[k][1]))b.d[i]=line}}
let seed=1;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const LEAF=P(['#1e5a2c','#2e7a34','#48a040','#70c058','#98dc78']),BARK=P(['#4a2c16','#6e4422','#94602e','#b07c40']);
function tree(s,pal,ol){seed=s*977+13;const b=spr(32,38),cx=16,cy=15,L=pal||LEAF;
 for(let y=24;y<37;y++){const fl=y>33?y-33:0;for(let x=13-fl;x<19+fl;x++){const t=(x-(13-fl))/(6+2*fl);put(b,x,y,BARK[t<.3?3:t<.7?2:1],2)}}
 for(let y=27;y<35;y+=3)put(b,15+((y*7+s)%3),y,BARK[0],2);
 const cl=[];const n=6+(s%2);for(let i=0;i<n;i++){const a=i/n*Math.PI*2+rnd()*.4+.3,r=5.5+rnd()*1.5;cl.push([cx+Math.cos(a)*(13-r)*.95,cy+Math.sin(a)*(11-r)*.9+1,r,r*.92])}
 cl.push([cx-1,cy-2,8,7]);cl.sort((p,q)=>p[1]-q[1]);clumps(b,cl,L,L[0],1);
 outline(b,ol||C('#123a1c'));return b}
function pine(s){seed=s*131+7;const b=spr(26,38),cx=13,PP=P(['#103a28','#1c5236','#2a6c44','#3e8a56']),SN=T.snow;
 for(let y=31;y<37;y++)for(let x=11;x<15;x++)put(b,x,y,BARK[x<12?3:x<14?2:1],2);
 for(const[yt,yb,wb]of[[2,12,5],[8,19,8],[14,26,10],[20,32,12]]){for(let y=yt;y<=yb;y++){const t=(y-yt)/(yb-yt),hw=Math.round(1+wb*t);for(let x=cx-hw;x<=cx+hw-1;x++){const ax=(x+.5-cx)/hw;
   let c=ax<-.35?PP[3]:ax<.25?PP[2]:PP[1];if(y===yb&&((x+y)&1))c=PP[0];if(y>=yb-1&&Math.abs(ax)>.8)c=PP[0];
   const snow=y<yt+2+Math.abs(ax)*2.5&&ax<.6;put(b,x,y,snow?(ax<-.2?SN[3]:SN[2]):c,1)}}}
 outline(b,C('#0c2a1c'));return b}
const STONE=P(['#4a4a58','#6c6c80','#9090a4','#b8b8c8','#dcdce8']);
function rock(s,ore){seed=s*311+5;const b=spr(16,13),pal=ore?P(['#3c3a4a','#5a586c','#7c7a90','#a09eb2']):STONE.slice(0,4);
 ball(b,8,8,7,4.6,pal,1);ball(b,6+rnd()*2,6,4.6,3.8,pal,1);if(rnd()<.6)ball(b,12,8.5,3,2.6,pal,1);
 let x=5+rnd()*5|0,y=6;for(let j=0;j<4;j++){if(b.id[y*16+x])b.d[y*16+x]=pal[0];x+=rnd()<.5?1:0;y++}
 if(ore)for(let k=0;k<5;k++){const x2=3+rnd()*10|0,y2=4+rnd()*6|0;if(!b.id[y2*16+x2]||!b.id[y2*16+x2+1])continue;put(b,x2,y2,C('#f8b060'));put(b,x2+1,y2,C('#d07830'));put(b,x2,y2+1,C('#a05020'))}
 else put(b,5,5,STONE[4]);
 outline(b,C('#22222c'));return b}
function bush(s){seed=s*53+3;const b=spr(16,13),pal=P(['#1e5a2c','#2e7a34','#48a040','#70c058']);
 const cl=[[8,7,5,4.5],[4.5,8,3.5,3.4],[11.5,8,3.5,3.4],[6.5,4.6,3.6,3.2],[10,4.6,3.6,3.2]].map(([x,y,a,c])=>[x+rnd()-.5,y,a,c]);cl.sort((p,q)=>p[1]-q[1]);clumps(b,cl,pal,pal[0],1);
 for(let k=0;k<5;k++){const x=3+rnd()*10|0,y=3+rnd()*7|0;if(b.id[y*16+x]!==1||b.id[(y+1)*16+x]!==1)continue;put(b,x,y,C('#f04858'));put(b,x,y+1,C('#a01828'))}
 outline(b,C('#123a1c'));return b}
function cactus(s){seed=s*71+11;const b=spr(16,23),pal=P(['#1e5a28','#2e7a34','#48a044','#70c060']);
 const col=(x0,x1,y0,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(y===y0&&(x===x0||x===x1))continue;const t=(x-x0)/(x1-x0);put(b,x,y,(x-x0)%2===1&&t>.2&&t<.8?pal[1]:t<.3?pal[3]:t<.75?pal[2]:pal[1],1)}};
 const ah=rnd()<.5;col(5,10,1,22);col(1,3,ah?6:8,14);for(let x=3;x<5;x++)for(let y=13;y<15;y++)put(b,x,y,pal[2],1);col(12,14,ah?4:2,ah?11:9);for(let x=11;x<12;x++)for(let y=ah?9:7;y<(ah?11:9);y++)put(b,x,y,pal[2],1);
 for(let k=0;k<8;k++){const x=rnd()*16|0,y=rnd()*22|0;if(b.id[y*16+x]===1)put(b,x,y,C('#f0f0c8'))}
 if(s%3===0){put(b,7,0,C('#f86898'));put(b,8,0,C('#f86898'));put(b,7,1,C('#f8e060'))}
 outline(b,C('#103418'));return b}
function deadTree(v){seed=v*41+3;const b=spr(40,50),PAL=P(["#2a2220","#3e3430","#5a4c46","#76665c"]),ox=16,oy=34;
 for(let y=oy-6;y<oy+15;y++)for(let x=ox+1;x<ox+7;x++){const t=(x-ox-1)/6;put(b,x,y,PAL[t<.3?3:t<.7?2:1],1)}
 const br=(x,y,dx,dy,n)=>{for(let k=0;k<n;k++){put(b,x+dx*k,y+dy*k,PAL[2],1);put(b,x+dx*k+1,y+dy*k,PAL[1],1)}};
 br(ox+3,oy-6,-1,-1,10);br(ox+4,oy-6,1,-1,9);br(ox+3,oy-14,-1,-.6,6);br(ox+5,oy-12,1,-1.4,5);br(ox+3,oy-2,1,-.5,8);br(ox+4,oy-10,0,-1,8);
 outline(b,C('#140e0c'));return b}
function darkTree(v){const L=P(['#1c1428','#2c2040','#3e2e5a','#58447a','#7a64a0']);const t=tree(20+v,L,C('#0c0814')),b=spr(44,56);
 for(let y=0;y<t.h;y++)for(let x=0;x<t.w;x++){const i=y*t.w+x;if(!t.id[i])continue;for(const[a,c]of[[0,0]]){const X=x+6,Y=y+18;b.d[Y*44+X]=t.d[i];b.id[Y*44+X]=t.id[i]}}
 return b}
function crystal(v){const b=spr(16,24),CP=P(['#4a2878','#7a48b8','#a878e8','#d8b8ff','#ffffff']);
 for(const[x,h,w]of[[5,14,2],[9,20,3],[12,10,2]]){const top=23-h;for(let y=top;y<23;y++){const t=(y-top)/h,hw=Math.max(1,Math.round(w*Math.min(1,t*2.5)));for(let xx=-hw;xx<hw;xx++)put(b,x+xx,y,CP[xx<-hw/2?3:xx<0?2:1],1)}put(b,x-1,top+2,CP[4],1)}
 outline(b,C('#20102e'));return b}
let SP=null;
function sprites(){if(SP)return SP;const D=b=>can(b,2);
 SP={tree:[1,2,3,4,5].map(s=>D(tree(s))),pine:[1,2,3].map(s=>D(pine(s))),rock:[1,2,3].map(s=>D(rock(s,false))),ore:[1,2].map(s=>D(rock(s+7,true))),bush:[1,2,3].map(s=>D(bush(s))),cactus:[1,2,3].map(s=>D(cactus(s)))};return SP}
const RS={};
function rgSp(k,v){const key=k+v;if(RS[key])return RS[key];const m={dead:[deadTree,-12,-34,40,50],dark:[darkTree,-14,-40,44,56],crystal:[crystal,0,-8,16,24]}[k];
 return RS[key]={c:can(m[0](v|0),0),ox:m[1],oy:m[2],ww:m[3],hh:m[4]}}
// ---------- shadows ----------
const SHC={};
function shadow(w){w=Math.max(6,Math.round(w*.8));if(SHC[w])return SHC[w];const b=spr(w,4),c=0x50000000;
 for(let y=0;y<4;y++){const inset=y===0||y===3?Math.ceil(w*.18):0;for(let x=inset;x<w-inset;x++){b.d[y*w+x]=c}}return SHC[w]=can(b,0)}
return{bake,sprites,rgSp,shadow,T}})();
// ---------- hook it in ----------
// Hollow: the island's tiles, with Frosthollow's paving + frozen pond and Dusthaven's paths drawn as their own ground
const g3HollowTT=(x,y)=>{if(x<0||y<0||x>=N||y>=N)return 0;const i=y*N+x;
 if(typeof FHON!=='undefined'&&FHON){if(FHPATH.has(i))return 11;if(FHPOND.has(i))return 12}
 if(typeof DHON!=='undefined'&&DHON&&DHPATH.has(i)&&!BRIDGE.has(i))return 16;
 return tile[i]};
hdBake=function(kx,ky){return G3.bake(kx,ky,g3HollowTT)};
hdBakeR=function(kx,ky,TT){return G3.bake(kx,ky,TT)};
HDCK.clear();RGCK.clear();
HDSP=G3.sprites();
const _rgs56=rgSprite;rgSprite=function(k,v){if(k==='dead'||k==='dark'||k==='crystal')return G3.rgSp(k,v);return _rgs56(k,v)};
SHDHD=(x,y,w)=>{const c=G3.shadow(w);g.drawImage(c,Math.round(x-c.width/2),Math.round(y)-2)};
// open water: little wave marks that come and go (whole pixels, no soft glints)
TERRAINHD=(x0,y0,x1,y1,tm)=>{
 // the sea runs on past the map's edges: work out what the camera really sees instead of the clamped tile range
 {const m=g.getTransform();if(m.a>0){const ax=-m.e/m.a,ay=-m.f/m.d;x0=Math.floor(ax/16);y0=Math.floor(ay/16);x1=Math.ceil((ax+W/m.a)/16);y1=Math.ceil((ay+H/m.d)/16)}}
 const Cs=HDCS,k0=Math.floor((x0-1)/Cs),k1=Math.floor((x1+1)/Cs),j0=Math.floor((y0-1)/Cs),j1=Math.floor((y1+1)/Cs);
 for(let ky=j0;ky<=j1;ky++)for(let kx=k0;kx<=k1;kx++)g.drawImage(hdChunk(kx,ky),kx*Cs*16,ky*Cs*16,Cs*16,Cs*16);
 outer:for(let ky=j0-1;ky<=j1+1;ky++)for(let kx=k0-1;kx<=k1+1;kx++){if(!HDCK.has(kx+','+ky)){hdChunk(kx,ky);break outer}}
 g.fillStyle='#98ccf8';for(let y=y0-1;y<=y1+1;y++)for(let x=x0-1;x<=x1+1;x++){if(hdTT(x,y)!==0)continue;
  if(hdTT(x-1,y)||hdTT(x+1,y)||hdTT(x,y-1)||hdTT(x,y+1))continue;const r=hdH(x,y),ph=Math.floor(tm*1.6+r*8)%4;if(ph===3)continue;
  const gx=x*16+2+((r*97|0)%9),gy=y*16+4+((r*13|0)%8)+(ph===1?-1:0);g.fillRect(gx,gy,ph===1?4:3,1);if(ph===1)g.fillRect(gx+1,gy-1,2,1)}};
