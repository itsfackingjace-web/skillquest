// ---------------------------------------------------------------- 57. Gen 3 towns: buildings, fences, props, tall grass, farm plots
// Drawing only: nothing here changes what is solid, where anything is, or how anything plays.
// Everything keeps the old footprint and anchor, drawn at 1 texel per world pixel with hard outlines and flat shade bands:
// - Buildings in every town (Hollow, Saltmere, Frosthollow, Dusthaven, Tidewatch) and the player's house: shingle roofs,
//   plank walls, white-framed two-tone windows with flower boxes, plank doors, stone footing; Frosthollow snow caps and
//   chimneys, Dusthaven sandstone with crenels, vigas, arched windows and awnings, Tidewatch blue stripe and shutters.
//   Shop signboards carry small pixel icons (coin, anvil, fish, mug, crate, pick, axe, hammer, star).
// - Wooden fences, stone walls and gates; lamps (lit at night), wells, signposts, bridges, rowboats, the shipwreck, the
//   hermit's hut; tall grass (2 sway frames); farm soil (dry / watered) and every crop stage.
var G3T=(()=>{
const C=hdC,mix=hdMix;
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return{c,x}}
// 1px outline around every fully opaque pixel (semi-transparent shadows are left alone)
function outline(c,col){const x=c.getContext('2d'),W=c.width,H=c.height,im=x.getImageData(0,0,W,H),d=new Uint32Array(im.data.buffer),o=new Uint32Array(d),oc=C(col),op=i=>(d[i]>>>24)===255;
 for(let y=0;y<H;y++)for(let X=0;X<W;X++){const i=y*W+X;if(d[i]>>>24)continue;if((X>0&&op(i-1))||(X<W-1&&op(i+1))||(y>0&&op(i-W))||(y<H-1&&op(i+W)))o[i]=oc}
 new Uint32Array(im.data.buffer).set(o);x.putImageData(im,0,0);return c}
const ramp4=c=>[mix(c,'#000000',.38),mix(c,'#000000',.2),c,mix(c,'#ffffff',.32)];
const ramp5=c=>[mix(c,'#000000',.5),mix(c,'#000000',.3),mix(c,'#000000',.13),c,mix(c,'#ffffff',.25)];
// a sprite with a world-space painter: canvas covers [ox,ox+ww) x [oy,oy+hh) around the anchor
function spr(ww,hh,ox,oy,paint,ol){const{c,x}=cv(ww,hh);const F=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a-ox,b-oy,w,h)};paint(F,x);if(ol)outline(c,ol);return{c,ox,oy,ww,hh}}
const SK=new Map();const cached=(k,f)=>{let v=SK.get(k);if(!v){v=f();SK.set(k,v)}return v};
// ---------- shop sign icons (8x5, drawn from the icon's top-left) ----------
function icon(F,x,y,ic){switch(ic){
 case'coin':F(x+1,y,5,5,'#c89020');F(x+2,y+1,3,3,'#f8d848');F(x+2,y+1,1,1,'#fff8c0');break;
 case'anvil':F(x,y+1,8,2,'#3a3a4a');F(x+1,y+1,6,1,'#7a7a90');F(x+3,y+3,2,1,'#3a3a4a');F(x+2,y+4,4,1,'#3a3a4a');break;
 case'fish':F(x,y+1,6,3,'#4890d0');F(x+1,y+1,4,1,'#88c0f0');F(x+6,y,2,2,'#4890d0');F(x+6,y+3,2,2,'#4890d0');F(x+1,y+2,1,1,'#181018');break;
 case'mug':F(x+1,y,5,5,'#f8f0e0');F(x+1,y,5,1,'#ffffff');F(x+2,y+2,3,3,'#d08830');F(x+6,y+1,2,3,'#a87850');break;
 case'crate':F(x+1,y,7,5,'#a87840');F(x+1,y+2,7,1,'#7a5228');F(x+4,y,1,5,'#7a5228');break;
 case'pick':F(x+3,y,1,5,'#7a4a20');F(x,y,7,1,'#9098a8');F(x,y+1,1,1,'#9098a8');F(x+6,y+1,1,1,'#9098a8');break;
 case'axe':F(x+2,y,1,5,'#7a4a20');F(x+3,y,3,3,'#a0a8b8');F(x+3,y,3,1,'#d8e0e8');break;
 case'hammer':F(x+4,y+1,1,4,'#7a4a20');F(x+1,y,7,2,'#6a7080');F(x+1,y,7,1,'#9aa0b0');break;
 case'star':F(x+3,y,1,5,'#f8d848');F(x+1,y+2,5,1,'#f8d848');F(x+2,y+1,3,3,'#f8d848');break;
 default:F(x+1,y,1,5,'#7a4a20');F(x+2,y+1,4,1,'#e8e0c8');F(x+2,y+3,4,1,'#e8e0c8')}}
function signBoard(F,x,y,col,ic){F(x,y,20,8,'#2a1a10');F(x+1,y+1,18,6,col);F(x+1,y+1,18,1,mix(col,'#ffffff',.35));F(x+1,y+6,18,1,mix(col,'#000000',.25));icon(F,x+6,y+2,ic)}
// ---------- buildings ----------
function bldCan(b,w){const style=b.dh?'dh':b.fh?'fh':b.tw?'tw':'base',key=style+'|'+b.k+'|'+w+'|'+b.wall+'|'+b.roof+'|'+(b.aw?b.aw.join():'');
 return cached('B'+key,()=>{const ox=-5,oy=-55,{c,x}=cv(w+10,57),F=(a,bb,ww,hh,col)=>{x.fillStyle=col;x.fillRect(a-ox,bb-oy,ww,hh)};
 const WL=ramp4(b.wall||'#e8d0a0'),RF=ramp5(b.roof||'#c84830');
 if(style==='dh'){
  F(0,-32,w,32,WL[2]);for(let r=0;r<7;r++){const y=-30+r*4,off=r%2?4:0;F(0,y+3,w,1,WL[1]);for(let k=off;k<w;k+=8)F(k,y,1,3,WL[1])}
  for(let k=0;k<12;k++)F(((k*37+w)%(w-2))|0,-28+((k*13)%22),2,1,WL[3]);
  F(0,-4,w,4,WL[1]);F(0,-4,w,1,WL[3]);
  F(-2,-38,w+4,6,RF[3]);F(-2,-38,w+4,1,RF[4]);F(-2,-33,w+4,1,RF[1]);
  for(let k=-2;k<w+2;k+=8){F(k,-42,5,4,RF[3]);F(k,-42,5,1,RF[4]);F(k+4,-41,1,3,RF[1])}
  for(let k=5;k<w-3;k+=10){F(k,-31,3,2,'#6a4424');F(k,-31,3,1,'#9a6c40')}
  for(const wx of[7,w-18]){F(wx+1,-25,9,1,'#3a2818');F(wx,-24,11,11,'#3a2818');F(wx+1,-24,9,10,'#1e140c');F(wx+2,-23,2,2,'#3a2c20');
   F(wx-2,-24,2,11,'#2a8a7a');F(wx-2,-24,2,1,'#58c0b0');F(wx+11,-24,2,11,'#2a8a7a');F(wx+11,-24,2,1,'#58c0b0');F(wx-1,-13,13,1,WL[3])}
  const dx=(w>>1)-6;F(dx+1,-21,10,1,'#3a2418');F(dx,-20,12,20,'#3a2418');F(dx+1,-19,10,19,'#8a5428');F(dx+1,-19,10,1,'#b07840');for(const k of[4,7])F(dx+k,-19,1,19,'#6a3c1c');
  for(const yy of[-14,-6])for(let k=0;k<3;k++)F(dx+2+k*3,yy,1,1,'#e8c050');F(dx-2,-1,16,1,'#c8a070');
  if(b.aw){for(let k=0;k<8;k++){F(dx-8+k*4,-26,4,5,k%2?b.aw[1]:b.aw[0]);F(dx-8+k*4,-26,4,1,mix(k%2?b.aw[1]:b.aw[0],'#ffffff',.3))}for(let k=0;k<8;k++)F(dx-7+k*4,-21,2,1,k%2?b.aw[1]:b.aw[0]);F(dx-9,-27,34,1,'#5a3418');F(dx-9,-26,1,7,'#5a3418');F(dx+24,-26,1,7,'#5a3418')}
 }else{
  // walls: boards with a lit top edge, corner posts, shade under the eaves, stone footing
  F(0,-28,w,28,WL[2]);for(let y=-25;y<-4;y+=4){F(0,y,w,1,WL[1]);F(0,y+1,w,1,WL[3])}
  F(0,-28,2,24,WL[1]);F(w-2,-28,2,24,WL[0]);F(0,-27,w,2,WL[0]);
  F(0,-4,w,4,'#9898a8');F(0,-4,w,1,'#c4c4d0');for(let k=5;k<w;k+=7)F(k,-3,1,3,'#6c6c7c');
  if(style==='tw'){F(0,-7,w,2,'#3a7ac0');F(0,-7,w,1,'#78b0e8')}
  for(const wx of[8,w-20]){const fire=b.k==='smith'&&wx>20;
   if(style==='tw'){F(wx-4,-23,3,12,'#3a7ac0');F(wx-4,-23,1,12,'#78b0e8');F(wx+13,-23,3,12,'#3a7ac0');F(wx+13,-23,1,12,'#78b0e8')}
   F(wx-1,-23,14,12,'#3a2a24');F(wx,-22,12,10,'#f8f4e8');F(wx+1,-21,10,8,fire?'#f8b040':'#90d0f8');F(wx+1,-17,10,4,fire?'#e86018':'#5898d8');
   F(wx+6,-21,1,8,'#f8f4e8');F(wx+1,-17,10,1,'#f8f4e8');F(wx+2,-20,2,1,'#ffffff');F(wx+2,-19,1,1,'#ffffff');
   if(b.k!=='smith'){F(wx-1,-11,14,3,'#7a4a20');F(wx-1,-11,14,1,'#a86c36');const fl=['#f86080','#f8d040','#ffffff','#b080f8'];for(let k=0;k<5;k++){F(wx+k*3,-12,2,1,'#3c8836');F(wx+k*3+(k%2),-13,1,1,fl[(k+b.k.length)%4])}}}
  const dx=(w>>1)-6;F(dx-1,-18,14,18,'#3a2418');F(dx,-17,12,17,'#8a5428');F(dx,-17,12,1,'#b07840');for(const k of[3,6,9])F(dx+k,-16,1,16,'#6a3c1c');F(dx,-12,12,1,'#6a3c1c');F(dx+9,-9,2,2,'#f8d848');F(dx+9,-9,1,1,'#fff8c0');F(dx-2,-1,16,1,'#a8a8b8');
  // roof: staggered shingle rows, lighter towards the ridge, dark eave
  const rx=-4,rw=w+8;for(let r=0;r<6;r++){const y=-52+r*4,col=r<2?RF[4]:r<4?RF[3]:RF[2];F(rx,y,rw,4,col);F(rx,y+3,rw,1,RF[1]);for(let k=rx+(r%2?4:0);k<rx+rw;k+=8)F(k,y,1,3,RF[1])}
  F(rx,-52,rw,1,mix(RF[4],'#ffffff',.3));F(rx,-29,rw,2,RF[0]);
  if(style==='fh'){F(rx,-53,rw,5,'#f4f8fc');F(rx,-49,rw,1,'#c8d4e8');for(let k=rx+1;k<rx+rw-1;k+=5){const hh=1+((k*7+b.ty)%3);F(k,-48,2,hh,'#f4f8fc');F(k+1,-48+hh-1,1,1,'#c8d4e8')}F(rx,-30,rw,1,'#e4ecf6')}
 }
 outline(c,style==='dh'?mix(b.wall||'#e8bc70','#181018',.72):'#24181c');
 x.fillStyle='rgba(0,0,0,.22)';x.fillRect(3-ox,1-oy,w+4,1);return c})}
function chimney(X,Y,tm,seed,snow){Rg(X,Y,9,13,'#24181c');Rg(X+1,Y+1,7,12,'#8a8890');Rg(X+1,Y+1,7,1,'#b8b8c4');Rg(X+1,Y+5,7,1,'#6a6870');Rg(X+1,Y+9,7,1,'#6a6870');if(snow)Rg(X+1,Y+1,7,2,'#f4f8fc');
 for(let i=0;i<3;i++){const k=Math.floor((tm*10+i*7+seed)%21),s=2+(k>12?1:0);g.fillStyle=k>16?'#c8ccd8':'#e8ecf4';g.fillRect(Math.round(X+3+Math.sin(tm*1.6+i*2)*2),Math.round(Y-3-k),s,s)}}
function drawBld(b,tm){const X0=b.tx*16,w=b.w*16,base=(b.ty+2)*16;g.drawImage(bldCan(b,w),X0-5,base-55);
 const sc=b.sc||(b.k==='gen'&&!b.dh&&!b.fh&&!b.tw?'#f0d040':null),ic=b.ic||(b.k==='gen'?'coin':b.k==='smith'?'anvil':b.fh?'bow':'anvil');
 if(b.dh){if(b.sc){const F=(a,bb,ww,hh,col)=>Rg(a,bb,ww,hh,col);signBoard(F,X0+(w>>1)-10,base-49,b.sc,ic)}}
 else if(sc){const F=(a,bb,ww,hh,col)=>Rg(a,bb,ww,hh,col);signBoard(F,X0+(w>>1)-10,base-27,sc,ic)}
 if(b.fh)chimney(X0+w-16,base-62,tm,b.tx,true);else if(b.k==='smith'||b.smoke)chimney(X0+w-15,base-64,tm,b.tx,false)}
// ---------- fences, stone walls, gates ----------
const FW=['#3a2210','#86522a','#ad7036','#cc8e4c','#e8b474'],ST=['#2a2a36','#5e5e70','#7c7c90','#9a9aae','#c4c4d4'];
function post(x,y,hh){Rg(x,y,5,hh,FW[0]);Rg(x+1,y+1,3,hh-2,FW[2]);Rg(x+1,y+1,1,hh-2,FW[3]);Rg(x+3,y+1,1,hh-2,FW[1]);Rg(x+1,y+1,3,1,FW[4])}
function rail(x,y,w){Rg(x,y,w,4,FW[0]);Rg(x,y+1,w,2,FW[2]);Rg(x,y+1,w,1,FW[3])}
function vrail(x,y,hh){Rg(x,y,4,hh,FW[0]);Rg(x+1,y,2,hh,FW[2]);Rg(x+1,y,1,hh,FW[3])}
function fence(i,s,ghost){const x=i%N,y=(i/N)|0,px=x*16+(s.shake>0?Math.round(Math.sin(performance.now()/16)):0),py=y*16,nb=(dx,dy)=>!ghost&&fenceNb(x+dx,y+dy);
 const L=nb(-1,0),Rt=nb(1,0),U=nb(0,-1),Dn=nb(0,1);
 if(s.t==='swall'){const x0=L?px:px+1,x1=Rt?px+16:px+15,yt=py-4,yb=Dn?py+16:py+15,capB=Dn?py+16:py+1;
  if(!Dn){g.fillStyle='rgba(0,0,0,.22)';g.fillRect(x0,yb,x1-x0,2)}
  Rg(x0-(L?0:1),yt-(U?0:1),x1-x0+(L?0:1)+(Rt?0:1),yb-yt+(U?0:1)+(Dn?0:1),ST[0]);
  if(!Dn){for(let r=0;r<3;r++){const yy=py+2+r*4,off=(r+x+y)%2?3:0;Rg(x0,yy,x1-x0,4,ST[2]);Rg(x0,yy+3,x1-x0,1,ST[1]);for(let bx=px-6+off;bx<px+16;bx+=6)if(bx>x0&&bx<x1)Rg(bx,yy,1,3,ST[1])}}
  Rg(x0,yt,x1-x0,capB-yt,ST[3]);for(let yy=yt;yy<capB;yy+=4){Rg(x0,yy,x1-x0,1,ST[4]);Rg(x0,yy+3,x1-x0,1,ST[2]);const off=((yy-yt)/4+x)%2?3:0;for(let bx=x0+off;bx<x1;bx+=6)Rg(bx,yy+1,1,2,ST[2])}
  if(U)Rg(x0,py-8,x1-x0,4,ST[3]);return}
 if(s.t==='door'){const open=!ghost&&doorOpen(i),vert=(U||Dn)&&!(L||Rt);
  if(!vert){if(L){rail(px,py+1,3);rail(px,py+7,3)}if(Rt){rail(px+13,py+1,3);rail(px+13,py+7,3)}
   g.fillStyle='rgba(0,0,0,.2)';g.fillRect(px+1,py+14,4,2);g.fillRect(px+12,py+14,4,2);post(px,py-4,18);post(px+11,py-4,18);
   if(open){Rg(px+4,py-1,3,14,FW[0]);Rg(px+5,py,1,12,FW[3])}else{Rg(px+4,py,8,13,FW[0]);for(let k=0;k<2;k++){Rg(px+5+k*3,py+1,2,11,k?FW[2]:FW[3])}Rg(px+5,py+3,6,2,FW[1]);Rg(px+5,py+8,6,2,FW[1]);Rg(px+10,py+6,1,1,'#f8d848')}return}
  if(U){Rg(px+6,py-3,4,2,ST[1])}
  if(open){Rg(px+8,py-2,8,6,FW[0]);Rg(px+9,py-1,6,4,FW[2]);Rg(px+9,py-1,6,1,FW[3])}
  else{Rg(px+5,py-2,6,19,FW[0]);Rg(px+6,py-1,4,17,FW[2]);Rg(px+6,py-1,1,17,FW[3]);Rg(px+6,py+3,4,1,FW[1]);Rg(px+6,py+11,4,1,FW[1]);Rg(px+9,py+7,1,1,'#f8d848')}return}
 g.fillStyle='rgba(0,0,0,.18)';g.fillRect(px+5,py+14,6,2);
 if(L){rail(px,py+1,7);rail(px,py+7,7)}if(Rt){rail(px+9,py+1,7);rail(px+9,py+7,7)}
 if(U)vrail(px+6,py-4,8);if(Dn)vrail(px+6,py+8,9);post(px+5,py-4,18)}
// ---------- tall grass: one tile, two sway frames ----------
const TG=[0,1].map(f=>{const{c,x}=cv(16,16),F=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h)};
 for(const[ox,oy]of[[0,1],[8,1],[4,8],[12,8],[-4,8]]){const s=f&&oy<4?1:0,X=ox+s;
  F(X,oy+3,8,5,'#1e5a24');F(X+1,oy+4,6,4,'#3a9438');F(X+1,oy+1,1,3,'#1e5a24');F(X+3,oy,1,4,'#1e5a24');F(X+5,oy+1,1,3,'#1e5a24');F(X+6,oy+2,1,2,'#1e5a24');
  F(X+2,oy+2,1,2,'#58b048');F(X+4,oy+1,1,3,'#7ccc5e');F(X+2,oy+4,1,1,'#7ccc5e');F(X+1,oy+7,6,1,'#2a7a2e')}
 return c});
// ---------- props (same footprints as the HD versions) ----------
const IR=['#1e222c','#2e3440','#454c5c','#626a7c'];
const lamp=lit=>cached('lp'+(lit?1:0),()=>spr(16,38,0,-22,F=>{F(6,-11,4,25,IR[1]);F(7,-11,1,25,IR[3]);F(5,12,6,3,IR[1]);F(5,12,6,1,IR[2]);
 F(3,-19,10,1,IR[1]);F(4,-21,8,2,IR[2]);F(7,-22,2,1,'#f8d848');F(4,-18,8,8,IR[1]);for(const a of[5,9])F(a,-17,2,6,lit?'#fff4a0':'#c8d8e8');F(5,-17,1,2,lit?'#ffffff':'#e8f0f8');F(9,-12,2,1,lit?'#f8c848':'#98a8b8');F(3,-10,10,1,IR[2])},'#14161c'));
const well=()=>cached('wl',()=>spr(22,39,-3,-23,F=>{const RP=ramp5('#a83838');
 F(0,0,16,15,ST[2]);for(let r=0;r<3;r++){F(0,2+r*5,16,1,ST[1]);for(let k=(r%2?2:5);k<16;k+=6)F(k,3+r*5,1,4,ST[1])}F(0,0,16,1,ST[4]);F(0,14,16,1,ST[1]);
 F(2,-2,12,3,'#1a4a90');F(3,-2,10,1,'#2a68b8');F(5,-1,2,1,'#8ac8f8');F(1,-2,1,3,ST[3]);F(14,-2,1,3,ST[3]);
 F(1,-16,2,16,'#80522a');F(1,-16,1,16,'#a46c38');F(13,-16,2,16,'#5e3a1c');F(2,-13,12,1,'#80522a');F(7,-12,1,7,'#c8a878');F(6,-6,3,3,'#80522a');F(6,-6,3,1,'#a46c38');
 for(let r=0;r<4;r++){const y=-22+r*2,in2=3-r;F(-2+in2,y,20-in2*2,2,RP[r%2?2:3]);F(-2+in2,y,20-in2*2,1,RP[4])}F(-2,-16,20,1,RP[0])},'#20140e'));
const sign=()=>cached('sg',()=>spr(16,23,0,-7,F=>{F(7,2,2,13,'#80522a');F(7,2,1,13,'#a46c38');F(1,-6,14,9,'#b8925a');F(1,-6,14,1,'#e8c890');F(1,2,14,1,'#9a7442');for(const[y,w]of[[-3,9],[-1,7],[1,8]])F(4,y,w,1,'#7a5630')},'#2a1a10'));
const bridge=(horiz,pst)=>cached('bg'+(horiz?1:0)+(pst?1:0),()=>spr(16,20,0,-2,F=>{const PL=ramp5('#b88850');
 if(horiz){for(let k=0;k<16;k+=4){F(k,3,3,11,PL[3]);F(k,3,3,1,PL[4]);F(k+3,3,1,11,PL[1]);F(k+1,5,1,1,PL[1]);F(k+1,11,1,1,PL[1])}F(0,1,16,2,'#80522a');F(0,1,16,1,'#a46c38');F(0,14,16,2,'#5e3a1c');if(pst)for(const k of[2,11]){F(k,-2,3,6,'#80522a');F(k,-2,1,6,'#a46c38');F(k,12,3,5,'#5e3a1c')}}
 else{for(let k=0;k<16;k+=4){F(3,k,10,3,PL[3]);F(3,k,10,1,PL[4]);F(3,k+3,10,1,PL[1]);F(5,k+1,1,1,PL[1]);F(11,k+1,1,1,PL[1])}F(0,0,3,16,'#80522a');F(0,0,1,16,'#a46c38');F(13,0,3,16,'#5e3a1c');if(pst)for(const k of[0,13])F(k,4,3,5,'#a46c38')}},'#2a180c'));
const boat=(sail,flip,vert)=>cached('bt'+(sail?1:0)+(flip?1:0)+(vert?1:0),()=>vert?spr(20,42,-10,-28,F=>{const HU=ramp5('#a86830');
 for(let y=-4;y<12;y++){const t=Math.abs(y-4)/8,hw=Math.round(9-t*t*4);F(-hw,y,hw*2,1,y<0?HU[4]:HU[3]);F(hw-2,y,2,1,HU[1])}for(const y of[-1,5])F(-6,y,12,1,HU[1]);F(-5,0,10,9,HU[2]);
 F(0,-25,1,25,'#5e3a1c');for(let k=0;k<15;k++){const w=Math.round(k*.6)+1;F(-w,-24+k,w*2,1,k===5?'#e05040':'#f4f0e4')}},'#2a180c'):spr(32,42,-16,-28,F=>{const HU=ramp5('#a86830');
 for(let y=5;y<13;y++){const t=(y-5)/8,hw=Math.round(15-t*t*8);F(-hw,y,hw*2,1,y===5?HU[4]:y<9?HU[3]:HU[2])}F(-14,7,28,1,HU[1]);F(-13,10,26,1,HU[1]);
 const mx=flip?6:-6;F(mx,-25,1,31,'#5e3a1c');const sd=flip?-1:1;for(let k=0;k<15;k++){const w=Math.round(k*.75)+1;F(sd>0?mx+1:mx-w,-24+k,w,1,k===5?'#e05040':'#f4f0e4');if(k>2)F(sd>0?mx+1:mx-1,-24+k,1,1,'#d8d0c0')}},'#2a180c'));
const wreck=()=>cached('wk',()=>spr(52,48,-1,-22,F=>{const HU=ramp5('#8a6038');
 for(let k=0;k<48;k++){const t=k/48,top=Math.round(7-Math.sin(t*Math.PI)*5+(k>17&&k<28?3:0)),bot=Math.round(22-Math.sin(t*Math.PI)*2);F(k,top,1,bot-top,HU[3]);F(k,top,1,1,HU[4]);for(let y=top+3;y<bot;y+=4)F(k,y,1,1,HU[1]);F(k,bot-2,1,2,HU[1]);if(k>18&&k<28&&k%3)F(k,top+1,1,7,'#1a1008')}
 F(30,-13,2,21,'#5e3a1c');F(32,-15,2,6,'#5e3a1c');for(let k=0;k<9;k++)for(let q=0;q<8-(k>>1);q++)if(hrand(k,q)>.15)F(33+q,-10+k,1,1,q<1?'#d8d0c0':'#f4f0e4');
 F(4,15,7,6,'#80522a');F(4,14,7,2,'#b07838');F(6,16,2,2,'#f8d848')},'#20140c'));
const hut=()=>cached('ht',()=>spr(58,42,-5,-40,F=>{const PL=ramp5('#b89868'),TH=['#7a5a20','#a08030','#c8a848','#e0c868'];
 F(0,-21,48,21,PL[3]);for(let k=4;k<48;k+=5)F(k,-21,1,21,PL[2]);F(0,-2,48,2,PL[1]);
 F(18,-14,11,14,'#5e3a1c');F(19,-13,9,13,'#80522a');F(19,-13,9,1,'#a46c38');F(26,-7,1,1,'#f8d848');F(4,-16,8,6,'#2a1a10');F(5,-15,6,4,'#a8d8f8');F(5,-13,6,1,'#88b8e0');F(7,-15,1,4,'#b8925a');
 for(let y=-40;y<-18;y++){const t=(y+40)/22,hw=Math.round(15+t*14);F(24-hw,y,hw*2,1,t<.3?TH[3]:t<.65?TH[2]:TH[1]);for(let k=24-hw+((y*3)&3);k<24+hw;k+=4)F(k,y,1,1,TH[t<.5?2:0])}
 for(let k=-5;k<53;k+=2)F(k,-19,1,1+((k*7)&1),TH[0])},'#2a1a0c'));
const soil=(m,w)=>cached('so'+m+(w?1:0),()=>spr(16,16,0,0,F=>{const SP=w?['#3a2412','#4e3018','#64401f','#7a5230']:['#5a3a1e','#7a5030','#9a6a3c','#b4844e'];
 F(0,0,16,16,SP[2]);for(let y=0;y<16;y+=4){F(0,y,16,1,SP[3]);F(0,y+2,16,1,SP[1]);F(0,y+3,16,1,SP[1])}
 const l=m&1,r=m&2,u=m&4,d=m&8;if(!u){F(0,0,16,1,SP[0])}if(!d){F(0,15,16,1,SP[0])}if(!l)F(0,0,1,16,SP[0]);if(!r)F(15,0,1,16,SP[0])},null));
const LF=['#1e5a2c','#2e7a34','#48a040','#70c058'];
const crop=(c,s,ripe)=>cached('cp'+c+s+(ripe?1:0),()=>spr(16,24,0,-8,F=>{
 if(s===0){for(const[x,y]of[[4,5],[10,6],[7,11],[12,12]]){F(x,y,1,1,'#e8c888');F(x+1,y,1,1,'#a07840')}return}
 if(s===1){for(const[x,y]of[[4,6],[10,6],[7,12]]){F(x,y-2,1,3,LF[2]);F(x-2,y-3,2,1,LF[3]);F(x+1,y-4,2,1,LF[2])}return}
 if(!ripe){for(const[x,y]of[[4,6],[11,6],[7,13]]){F(x,y-5,1,6,LF[2]);F(x-2,y-4,2,1,LF[3]);F(x+1,y-5,2,1,LF[3]);F(x-1,y-2,1,1,LF[1]);F(x+1,y-1,1,1,LF[1])}return}
 if(c==='wheat'){for(let k=0;k<7;k++){const x=2+k*2,top=15-10-((k*5)%3);F(x,top+3,1,15-top-3,'#c8a038');F(x,top,1,3,'#f8e490');F(x-(k%2),top+1,1,2,'#e8c450')}}
 else if(c==='carrot'){for(const x of[4,11]){F(x-2,7,4,4,'#f08830');F(x-2,7,4,1,'#f8b060');F(x-1,11,2,1,'#c86018');F(x-1,3,1,4,LF[2]);F(x+1,2,1,5,LF[3]);F(x-2,4,1,2,LF[1])}}
 else{F(2,4,12,10,'#e87820');F(3,3,10,12,'#e87820');F(3,4,4,2,'#f8a848');for(const x of[5,8,11])F(x,4,1,10,'#c85810');F(7,0,2,4,'#5a8a28');F(9,1,3,2,LF[2])}},ripe?'#2a1a08':'#14301a'));
return{drawBld,fence,TG,lamp,well,sign,bridge,boat,wreck,hut,soil,crop}})();
// ---------- hook it in (the outermost wrappers, so every town uses them) ----------
drBld=function(b,tm){G3T.drawBld(b,tm)};
drawFence=function(i,s,ghost){G3T.fence(i,s,ghost)};
TGDRAW=(x,y,tm)=>{g.drawImage(G3T.TG[tgFrame(x,y,tm)],x*16,y*16)};tgC[0]=G3T.TG[0];tgC[1]=G3T.TG[1];
hdLampPost=G3T.lamp;hdWellS=G3T.well;hdSignS=G3T.sign;hdBridgeT=G3T.bridge;hdRowboat=G3T.boat;hdWreckS=G3T.wreck;hdHutS=G3T.hut;hdSoil=G3T.soil;hdCropS=G3T.crop;
