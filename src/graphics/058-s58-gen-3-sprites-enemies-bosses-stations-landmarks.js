// ---------------------------------------------------------------- 58. Gen 3 sprites: enemies, bosses, stations, landmarks, rooms, item icons
// Drawing only: nothing here changes what is solid, where anything is, or how anything plays.
// - Every sprite the HD sections still build (all enemies and bosses, stations, furniture, region landmarks, room and
//   dungeon backgrounds, campfire, dummy) passes through one filter as it is made: each 2x2 block of HD texels becomes
//   one Gen 3 pixel (its most common colour, so dithering and soft gradients collapse into flat bands; thin dark
//   lines are kept), the silhouette gets a hard dark edge, and the result is scaled back up, so sizes and anchors are
//   exactly what the drawing code expects.
// - Small slimes (blue, magma, frost, tide) are drawn on whole pixels with Gen 3 eyes; no soft glow rings.
// - Item icons are scaled up with hard pixels and a 1px outline instead of EPX smoothing and soft highlights.
// - Harbor posts get a pixel flag.
var G3S=(()=>{
const lum=v=>((v&255)*3+((v>>>8)&255)*6+((v>>>16)&255))/10;
const darken=(v,k)=>{const r=(v&255)*k,gg=((v>>>8)&255)*k,b=Math.min(255,((v>>>16)&255)*k+10);return(0xff000000|(b<<16)|(gg<<8)|r)>>>0};
// HD buffer (2 texels per pixel) -> Gen 3 pixels -> back to the same size
function pixelate(b){const W=b.w,H=b.h,d=b.d,w=(W+1)>>1,h=(H+1)>>1,s=new Uint32Array(w*h),q=[0,0,0,0];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let n=0,semi=0;
  for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){const X=2*x+dx,Y=2*y+dy;if(X>=W||Y>=H)continue;const v=d[Y*W+X];if((v>>>24)>=200)q[n++]=v;else if(v>>>24)semi=v}
  let out=0;
  if(n>=2){let best=q[0],bc=0;for(let i=0;i<n;i++){let c=0;for(let j=0;j<n;j++)if(q[j]===q[i])c++;if(c>bc||(c===bc&&lum(q[i])<lum(best))){best=q[i];bc=c}}
   // keep thin dark detail (eyes, outlines, seams) that a plain majority would erase
   for(let i=0;i<n;i++)if(lum(q[i])<60&&lum(best)>120){let c=0;for(let j=0;j<n;j++)if(q[j]===q[i])c++;if(c>=1&&n<4||c>=2){best=q[i];break}}
   out=best}
  else if(n===1){out=lum(q[0])<90?q[0]:semi}
  else out=semi;
  s[y*w+x]=out}
 // the silhouette gets a hard dark edge (only against transparency inside the canvas)
 const o=new Uint32Array(s),op=i=>(s[i]>>>24)>=200;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!op(i))continue;
  if((x>0&&!op(i-1))||(x<w-1&&!op(i+1))||(y>0&&!op(i-w))||(y<h-1&&!op(i+w))){if(lum(s[i])>70)o[i]=darken(s[i],.42)}}
 const D=new Uint32Array(W*H);for(let Y=0;Y<H;Y++){const r=(Y>>1)*w;for(let X=0;X<W;X++)D[Y*W+X]=o[r+(X>>1)]}
 return{w:W,h:H,d:D,id:b.id}}
// item icons: 1px outline at icon scale, then hard 2x
function icon(src){const w=src.width,h=src.height,x=src.getContext('2d',{willReadFrequently:true}),s=new Uint32Array(x.getImageData(0,0,w,h).data.buffer),o=new Uint32Array(s),OL=hdC('#1e1820');
 for(let Y=0;Y<h;Y++)for(let X=0;X<w;X++){const i=Y*w+X;if(s[i]>>>24)continue;if((X>0&&s[i-1]>>>24)||(X<w-1&&s[i+1]>>>24)||(Y>0&&s[i-w]>>>24)||(Y<h-1&&s[i+w]>>>24))o[i]=OL}
 const c1=document.createElement('canvas');c1.width=w;c1.height=h;const x1=c1.getContext('2d'),im=x1.createImageData(w,h);new Uint32Array(im.data.buffer).set(o);x1.putImageData(im,0,0);
 const c=document.createElement('canvas');c.width=w*2;c.height=h*2;const cx=c.getContext('2d');cx.imageSmoothingEnabled=false;cx.drawImage(c1,0,0,w*2,h*2);return c}
// small slimes on whole pixels
function slime(n,tm){const x=Math.round(n.x),y=Math.round(n.y),hit=Math.abs(n.kx)+Math.abs(n.ky)>.8,vr=n.vr,f=Math.floor(tm*(vr==='frost'?2.5:3)+n.x)%2;shd(x,y+5,15);
 const sp=hit?hdSlimeSp(f,true):vr==='magma'?hdMagma(f):vr==='frost'?hdFrost(f):vr==='tide'?hdTide(f):hdSlimeSp(f,false);let w=sp.width/2,hh=sp.height/2;
 if(vr==='tide'&&!hit){const sq=n.ds==='squash'?.7:n.ds==='dash'?1.15:1;w=Math.round(w*(2-sq));hh=Math.round(hh*sq)}
 const top=Math.round(y+6-hh);g.drawImage(sp,Math.round(x-w/2),top,w,hh);
 if(vr==='tide'&&n.ds==='squash'&&Math.floor(tm*12)%2)Rg(x-w/2,top-2,w,1,'#ff5a3c');
 if(!hit){const e=top+Math.max(3,Math.round(hh*.32)),d=P.x>n.x?1:0,EC={magma:'#3a0804',frost:'#1a3050',tide:'#062424'}[vr]||'#181018',WH=vr==='magma'?'#fff4c0':'#ffffff';
  for(const ex of[x-5,x+2]){Rg(ex,e,3,4,WH);Rg(ex+d,e+1,2,3,EC);Rg(ex+d,e+1,1,1,WH)}}}
function post(x,y,tm){shd(x,y+5,10);Rg(x-2,y-20,4,26,'#2a1a10');Rg(x-1,y-19,2,24,'#8a6038');Rg(x-1,y-19,1,24,'#b08050');
 Rg(x-9,y-18,18,9,'#2a1a10');Rg(x-8,y-17,16,7,'#c89868');Rg(x-8,y-17,16,1,'#e8c090');Rg(x-6,y-15,12,1,'#7a5434');Rg(x-6,y-13,9,1,'#7a5434');
 Rg(x,y-29,2,10,'#2a1a10');const fr=Math.floor(tm*4)%2;for(let k=0;k<8;k++){const hgt=Math.max(1,6-Math.round(k*.7)),off=fr&&k>3?1:0;Rg(x+2+k,y-28+Math.round(k*.35)+off,1,hgt,k===0?'#2a68b8':'#3888d6');Rg(x+2+k,y-28+Math.round(k*.35)+off,1,1,'#78b8f0')}}
return{pixelate,icon,slime,post}})();
// ---------- hook it in ----------
{const _hdCan58=hdCan;hdCan=function(b){let p;try{p=G3S.pixelate(b)}catch(e){p=b}return _hdCan58(p)}}
// rebuild anything the HD sections already made, now through the filter
HDK.clear();HDEN.clear();HDRM.clear();HDSL=null;HDMG=null;HDFS=null;HDTS=null;HDBAT=null;HDBT=null;HDDUM=null;HDFIRE.base=null;HDFIRE.length=0;
SLIMEHD=(n,tm)=>G3S.slime(n,tm);
hdIconPost=function(src){return G3S.icon(src)};
drawPost49=function(x,y,tm){G3S.post(x,y,tm)};
