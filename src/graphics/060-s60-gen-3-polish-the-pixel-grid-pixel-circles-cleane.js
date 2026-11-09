// ---------------------------------------------------------------- 60. Gen 3 polish: the pixel grid, pixel circles, cleaner rooms, character fixes
// Drawing only.
// - In the world (zoomed) view every drawImage / fillRect lands on whole world pixels, so no sprite sits half a texel off.
// - Full circles drawn in the world (warning rings, regional glows, spell areas) become stepped pixel discs.
// - Room and dungeon backgrounds lose the single-pixel speckle the HD dithering left behind.
// - Character kit: clearer eyes on the two darkest skin tones (a light pixel under each pupil); the ranger hood's side view
//   no longer has a point at the back.
{const big=()=>{const t=g.getTransform();return t.a>1.5};
 const _di=g.drawImage.bind(g),_fr=g.fillRect.bind(g),_arc=g.arc.bind(g);
 g.drawImage=function(im,...a){if(big()){if(a.length===2||a.length===4){a[0]=Math.round(a[0]);a[1]=Math.round(a[1]);if(a.length===4){a[2]=Math.round(a[2]);a[3]=Math.round(a[3])}}
   else if(a.length===8){a[4]=Math.round(a[4]);a[5]=Math.round(a[5]);a[6]=Math.round(a[6]);a[7]=Math.round(a[7])}}return _di(im,...a)};
 g.fillRect=function(x,y,w,h){if(big()){const X=Math.round(x),Y=Math.round(y),Wd=w>0?Math.max(1,Math.round(x+w)-X):w,Hd=h>0?Math.max(1,Math.round(y+h)-Y):h;return _fr(X,Y,Wd,Hd)}return _fr(x,y,w,h)};
 const _ell=g.ellipse.bind(g);
 g.ellipse=function(x,y,rx,ry,rot,a0,a1,ccw){if(big()&&!rot&&rx>=2&&ry>=2&&Math.abs(a1-a0)>=6.28){x=Math.round(x);y=Math.round(y);const RY=Math.round(ry);for(let dy=-RY;dy<RY;dy++){const yc=(dy+.5)/ry,hw=Math.round(rx*Math.sqrt(Math.max(0,1-yc*yc)));if(hw>0)g.rect(x-hw,y+dy,hw*2,1)}return}return _ell(x,y,rx,ry,rot,a0,a1,ccw)};
 g.arc=function(x,y,r,a0,a1,ccw){if(big()&&r>=2&&Math.abs(a1-a0)>=6.28){x=Math.round(x);y=Math.round(y);const R=Math.round(r);for(let dy=-R;dy<R;dy++){const yc=dy+.5,hw=Math.round(Math.sqrt(Math.max(0,R*R-yc*yc)));if(hw>0)g.rect(x-hw,y+dy,hw*2,1)}return}return _arc(x,y,r,a0,a1,ccw)}}
// rooms and dungeons (anything bigger than any sprite): clean up the speckle and checkerboards left over from HD dithering
{const _px60=G3S.pixelate;G3S.pixelate=function(b){const o=_px60(b);if(b.w*b.h<30000)return o;const W=o.w,H=o.h,d=o.d;
  // work on the 1-texel grid (every other row/column of the doubled result): a pixel takes the colour that at least
  // three of its four neighbours share (one-pixel lines survive: a line pixel only ever has two matching neighbours)
  // updated in place (not from a snapshot), so a checkerboard collapses into one colour instead of flipping
  for(let pass=0;pass<2;pass++){const s=d;
   for(let y=2;y<H-2;y+=2)for(let x=2;x<W-2;x+=2){const i=y*W+x,v=s[i],n=[s[i-2],s[i+2],s[i-2*W],s[i+2*W]];
    for(let a=0;a<4;a++){const c=n[a];if(c===v||(c>>>24)!==255)continue;let k=0;for(let q=0;q<4;q++)if(n[q]===c)k++;if(k>=3){d[i]=d[i+1]=d[i+W]=d[i+W+1]=c;break}}}}
  return o};HDRM.clear()}
// character kit fixes
{const hs=KIT.head.hood.side;for(let k=hs.length-1;k>=0;k--)if(hs[k][0]===14&&hs[k][1]===12)hs.splice(k,1);
 const _kb60=kitBuild;kitBuild=function(ch,dir,st){const c=_kb60(ch,dir,st);if((ch.sk|0)<3||dir===1)return c;const x=c.getContext('2d');x.fillStyle='#e8e0d8';
  if(dir===2)x.fillRect(4,18,1,1);else{x.fillRect(5,18,1,1);x.fillRect(10,18,1,1)}return c};KITC.clear()}
