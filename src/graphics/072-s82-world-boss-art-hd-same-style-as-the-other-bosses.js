// ---------------------------------------------------------------- 82. World boss art (HD, same style as the other bosses)
// Each boss is painted once per animation frame into a 2x texel canvas with shaded shapes and a dark outline, then drawn
// from the cache. Flame Wisp: a living fireball with a face, flame tongues and orbiting embers. Stone Giant: a mossy rock
// golem with glowing eyes and a boulder club. Demon: a horned brute with bat wings and fistfuls of fire. Ancient Dragon:
// a red dragon with spread wings, a horned head, belly plates and a spiked tail.
{const clampI=(v,n)=>Math.max(0,Math.min(n-1,v));
 const inPoly=(x,y,pts)=>{let c=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c};
 // a polygon, lit from the top-left: v0 = brightness at the top-left, ky/kx = how much darker towards the bottom/right
 function poly(p,pts,pal,v0,ky,kx){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const[a,b]of pts){x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b);y1=Math.max(y1,b)}
  for(let y=Math.floor(y0);y<=Math.ceil(y1);y++)for(let x=Math.floor(x0);x<=Math.ceil(x1);x++){if(!inPoly(x+.5,y+.5,pts))continue;const v=v0-(ky||0)*((y-y0)/((y1-y0)||1))-(kx||0)*((x-x0)/((x1-x0)||1));p.put(x,y,pal[clampI(Math.round(v*(pal.length-1)),pal.length)])}}
 // a tapering limb made of shaded spheres
 function limb(p,x0,y0,x1,y1,r0,r1,pal,bias){const n=Math.max(2,Math.ceil(Math.hypot(x1-x0,y1-y0)/1.5));for(let i=0;i<=n;i++){const t=i/n;p.ell(x0+(x1-x0)*t,y0+(y1-y0)*t,r0+(r1-r0)*t,r0+(r1-r0)*t,pal,bias||0)}}
 const dot=(p,x,y,c,w,h)=>{c=typeof c==='number'?c:hdC(c);for(let j=0;j<(h||1);j++)for(let i=0;i<(w||1);i++)p.put(x+i,y+j,c)};
 const P5=a=>hdP(a);
 // ---------- Ancient Dragon ----------
 const DR={sk:P5(['#3c0a0a','#6a1210','#9a1c16','#c8301e','#ee5a30','#ff8a50']),mem:P5(['#3a0a10','#5e141c','#862224','#ae3a30']),memN:P5(['#4a0e14','#76202a','#a2322e','#cc5038']),bone:P5(['#3a0c0c','#6a1812','#9a2a1c']),
  bel:P5(['#7a4a14','#b07a24','#dca840','#f4d070','#fff0b0']),horn:P5(['#5a5040','#8e8268','#c4b898','#ece4cc']),claw:P5(['#3a3430','#6e665c','#b8b0a0'])};
 function wing(p,sx,sy,tips,pal,boneP,flap){const pts=[[sx,sy]];const T=tips.map(([a,c])=>[a,c+flap]);
  for(let k=0;k<T.length;k++){pts.push(T[k]);if(k<T.length-1){const m=[(T[k][0]+T[k+1][0])/2,(T[k][1]+T[k+1][1])/2];pts.push([m[0]+(sx-m[0])*.32,m[1]+(sy-m[1])*.32])}}
  pts.push([sx+(T[T.length-1][0]-sx)*.35,sy+6]);poly(p,pts,pal,.75,.45,.1);for(const t of T)limb(p,sx,sy,t[0],t[1],3.2,1.1,boneP,.1);p.ell(sx,sy,5,5,boneP,.2)}
 // front-facing and upright: a big horned head, angry eyes, cream belly, stubby claws, wings spread behind
 // chunky pixel art: a 48x52 sprite (2 world pixels per pixel), cel-shaded with bold black outlines. Three views:
 // 'w' side-on facing left (east is the same picture mirrored), 's' facing you, 'n' seen from behind
 function dragonSp(fr,dir){dir=dir||'w';const GW=48,GH=52,OY=3,G=new Array(GW*GH).fill(null),PT=new Array(GW*GH).fill(-1);let pid=0;
  const C={sk:['#7e1a14','#c0321e','#e85a3a'],wg:['#4e100c','#82201a','#ae3a28'],bl:['#b86a1c','#e8a038','#f8d070'],hn:['#8a7a60','#c8b898','#f4ecd8'],mo:['#3a0808','#3a0808','#3a0808'],K:'#1a0a0a'};
  const inPolyG=(x,y,pts)=>inPoly(x+.5,y+.5,pts),LN={sk:'#4a0c08',wg:'#300806',bl:'#7a4010',hn:'#5a4a38'};
  function part(test,pal,opts){const id=pid++,M=new Set(),ln=pal===C.sk?LN.sk:pal===C.wg?LN.wg:pal===C.bl?LN.bl:pal===C.hn?LN.hn:C.K;for(let y=0;y<GH;y++)for(let x=0;x<GW;x++)if(test(x,y-OY))M.add(y*GW+x);
   for(const i of M){const x=i%GW,y=(i/GW)|0;const up=!M.has(i-GW),dn=!M.has(i+GW)||!M.has(i+1);let c=up||(!M.has(i-1)&&!(opts&&opts.noL))?pal[2]:dn?pal[0]:pal[1];
    if(opts&&opts.seg!=null&&y%3===opts.seg&&!up)c=pal[0];G[i]=c;PT[i]=id}
   if(opts&&opts.noLine)return;
   // a dark line where this part meets something drawn earlier (behind it)
   for(const i of M){const x=i%GW;for(const d of[-1,1,-GW,GW]){const k=i+d;if(d===-1&&x===0||d===1&&x===GW-1)continue;if(k>=0&&k<G.length&&!M.has(k)&&PT[k]>=0&&PT[k]!==id){G[i]=ln;break}}}}
  const poly2=(pts,pal,o)=>part((x,y)=>inPolyG(x,y,pts),pal,o),ell2=(cx,cy,rx,ry,pal,o)=>part((x,y)=>((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2<=1,pal,o);
  const px=(x,y,c)=>{const Y=Math.round(y)+OY;if(x>=0&&x<GW&&Y>=0&&Y<GH)G[Y*GW+x]=c};
  const mir=pts=>pts.map(([x,y])=>[47-x,y]);   // left-right mirror for the symmetric front and back views
  const bone=(x0,y0,x1,y1)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let k=0;k<=n;k++){const X=Math.round(x0+(x1-x0)*k/n),Y=Math.round(y0+(y1-y0)*k/n)+OY,i=Y*GW+X;if(X>=0&&X<GW&&G[i]&&G[i]!==C.K&&G[i]!==LN.wg)G[i]=k<2?C.sk[1]:C.sk[k%5?1:2]}};
  const tail=(pts,spadeDir)=>{part((x,y)=>pts.some(([cx,cy,r])=>Math.hypot(x+.5-cx,y+.5-cy)<=r),C.sk);const[tx,ty]=pts[pts.length-1],s=spadeDir;poly2([[tx-2*s,ty+1],[tx+s,ty-4],[tx+3*s,ty+1],[tx,ty+2]],C.hn)};
  const wf=[0,-1,-2,-1][fr],hb=fr%2,tt=[0,1,1,0][fr],h=hb;
  if(dir==='w'){
   poly2([[24,19],[25,7+wf],[29,1+wf],[36,1+wf],[33,5+wf],[36,7+wf],[32,9+wf],[32,14],[29,19]],C.wg);
   {const cl=[];for(let k=0;k<=16;k++){const t=k/16;cl.push([27+t*17,41-Math.sin(t*2.8)*7-t*t*(3+tt),4.6*(1-t*.78)])}tail(cl,1)}
   ell2(23,31+hb*.3,9,10,C.sk);
   poly2([[13,22],[19,21],[21,37],[18,40],[14,36]],C.bl,{seg:0,noL:1});
   poly2([[13,14],[20,11],[25,22],[17,25]],C.sk);poly2([[12,15],[15,14],[18,25],[15,25]],C.bl,{seg:1,noL:1});
   for(const[x,y]of[[21,13],[24,17],[28,22]])poly2([[x,y],[x+2,y-3],[x+3,y+1]],C.hn);
   poly2([[26,22],[28,9+wf],[32,3+wf],[40,2+wf],[46,7+wf],[42,9+wf],[44,13+wf],[39,13+wf],[40,18],[35,17],[33,22]],C.wg);
   bone(29,20,32,4+wf);bone(29,20,40,3+wf);bone(30,20,45,8+wf);bone(30,20,43,13+wf);
   ell2(26,37,6.5,5,C.sk);poly2([[17,42],[31,41],[32,45],[16,46]],C.sk);for(const x of[16,20,24])poly2([[x,44],[x-2,47],[x+1,46]],C.hn);
   poly2([[16,24],[19,25],[14,30],[11,30],[11,28]],C.sk);for(const y of[29,31])poly2([[11,y-1],[8,y],[11,y+1]],C.hn);
   // head: horns, skull, a wide-open mouth (dark inside, fangs, tongue) between the snout and the lower jaw
   for(const[a,c,d,e]of[[17,6,26,0],[16,4,22,-1]])poly2([[a,c+h],[a+2,c-1+h],[d,e+h],[a+3,c+2+h]],C.hn);
   ell2(15,10+h*.3,7,6,C.sk);
   poly2([[4,12+h],[15,11+h],[15,16+h],[6,17+h]],C.mo,{noLine:1});
   poly2([[1,8+h],[11,6+h],[16,9+h],[15,12+h],[2,12+h]],C.sk);
   poly2([[5,17+h],[15,15+h],[17,18+h],[9,20+h]],C.sk);
   for(const[x,y]of[[9,16],[10,16],[11,15],[12,15],[13,15]])px(x,y+h,'#e8506a');px(10,15+h,'#f888a0');px(11,14+h,'#f888a0');
   for(const[x,y]of[[4,12],[4,13],[5,14],[8,12],[12,12]])px(x,y+h,'#f8f4e8');px(7,16+h,'#f8f4e8');px(7,15+h,'#f8f4e8');
   poly2([[19,8+h],[23,6+h],[21,11+h]],C.sk);poly2([[19,12+h],[23,12+h],[20,15+h]],C.sk);
   for(const[x,y,c]of[[10,8,'#ffffff'],[11,8,'#ffffff'],[10,9,'#f8d040'],[11,9,C.K],[9,7,C.K],[10,7,C.K],[11,7,C.K],[12,7,C.K],[3,9,C.K]])px(x,y+h,c)}
  else{const S=dir==='s';
   // wings out to both sides, behind the body
   const wing=[[19,22],[15,8+wf],[9,2+wf],[1,4+wf],[4,8+wf],[0,12+wf],[5,14+wf],[3,19+wf],[9,19],[13,25]];
   for(const w of[wing,mir(wing)])poly2(w,C.wg);
   for(const s of[0,1]){const f=s?x=>47-x:x=>x;bone(f(17),21,f(10),3+wf);bone(f(17),21,f(2),5+wf);bone(f(17),22,f(1),12+wf);bone(f(17),22,f(4),18+wf)}
   // tail: from the front it curls out behind to one side; from behind it trails down towards you
   if(S){const cl=[];for(let k=0;k<=14;k++){const t=k/14;cl.push([30+t*14,42-Math.sin(t*2.6)*5-t*t*(5+tt),4*(1-t*.75)])}tail(cl,1)}
   // legs and feet, body
   for(const s of[0,1]){const f=s?x=>47-x:x=>x;ell2(f(17)+(s?1:0),39,5.5,5,C.sk);
    poly2(s?mir([[10,44],[22,44],[22,47],[10,47]]):[[10,44],[22,44],[22,47],[10,47]],C.sk);
    if(S)for(const x of[11,15,19])poly2(s?mir([[x,46],[x+1,49],[x+2,46]]):[[x,46],[x+1,49],[x+2,46]],C.hn)}
   ell2(24,32+hb*.3,10.5,11,C.sk);
   if(S)poly2([[19,23],[29,23],[28,41],[20,41]],C.bl,{seg:0});
   // neck
   poly2([[19,14+h],[29,14+h],[30,25],[18,25]],C.sk);
   if(S)poly2([[21,16+h],[27,16+h],[27,24],[21,24]],C.bl,{seg:1});
   else for(const y of[18,23,28,33])poly2([[22,y+(y<25?h:0)],[24,y-4+(y<25?h:0)],[26,y+(y<25?h:0)]],C.hn,{noLine:1});
   // arms
   for(const s of[0,1]){const a=[[17,26],[20,27],[16,33],[12,33],[13,31]];poly2(s?mir(a):a,C.sk);
    if(S)for(const y of[33,35])poly2(s?mir([[12,y-1],[11,y+2],[14,y]]):[[12,y-1],[11,y+2],[14,y]],C.hn)}
   // head: horns, skull, frills
   for(const s of[0,1]){const hn=[[19,6+h],[17,4+h],[12,-2+h],[14,3+h],[18,8+h]];poly2(s?mir(hn):hn,C.hn);
    const fr2=[[17,10+h],[12,9+h],[16,13+h]];poly2(s?mir(fr2):fr2,C.sk)}
   ell2(24,10+h,9,7.5,C.sk);
   if(S){// snout with the mouth open towards you
    poly2([[20,18+h],[28,18+h],[27,21+h],[21,21+h]],C.sk);
    ell2(24,16.5+h,4.5,2.6,C.mo,{noLine:1});
    for(const x of[22,23,24,25,26])px(x,18+h,'#e8506a');px(23,17+h,'#f888a0');px(24,17+h,'#f888a0');
    for(const[x,y]of[[21,15],[21,16],[27,15],[27,16]])px(x,y+h,'#f8f4e8');
    px(22,13+h,C.K);px(26,13+h,C.K);
    for(const s of[0,1]){const f=s?x=>47-x:x=>x;for(const[x,y,c]of[[19,8,'#ffffff'],[20,8,'#ffffff'],[19,9,'#f8d040'],[20,9,C.K],[18,7,C.K],[19,7,C.K],[20,7,C.K],[21,8,C.K]])px(f(x),y+h,c)}}
   else{// back of the head: a ridge of spines down the middle
    for(const y of[5,10,14])poly2([[22,y+2+h],[24,y-3+h],[26,y+2+h]],C.hn,{noLine:1})}
   if(!S){const cl=[];for(let k=0;k<=14;k++){const t=k/14;cl.push([26+t*18,40+Math.sin(t*2.2)*5-t*t*(7+tt),4.4*(1-t*.75)])}tail(cl,1)}}
  // the outline around everything
  const out=G.slice();for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){const i=y*GW+x;if(G[i])continue;if((x>0&&G[i-1])||(x<GW-1&&G[i+1])||(y>0&&G[i-GW])||(y<GH-1&&G[i+GW]))out[i]=C.K}
  const c=document.createElement('canvas');c.width=GW;c.height=GH;const x=c.getContext('2d');for(let i=0;i<out.length;i++)if(out[i]){x.fillStyle=out[i];x.fillRect(i%GW,(i/GW)|0,1,1)}return c}
 // ---------- chunky pixel-art kit (shared by the demon, giant and wisp) ----------
 // Parts are painted back to front with flat 3-tone shading (light top/left, dark bottom/right), a darker seam where a
 // part overlaps one behind it, and a solid outline round the whole figure. 1 sprite pixel = 2 world pixels.
 function chunkKit(GW,GH,OY,outline){const G=new Array(GW*GH).fill(null),PT=new Array(GW*GH).fill(-1);let pid=0;
  const inPolyG=(x,y,pts)=>inPoly(x+.5,y+.5,pts);
  function part(test,pal,o){o=o||{};const id=pid++,M=new Set(),ln=o.ln||pal[3]||outline;for(let y=0;y<GH;y++)for(let x=0;x<GW;x++)if(test(x,y-OY))M.add(y*GW+x);
   for(const i of M){const x=i%GW,y=(i/GW)|0;const up=!M.has(i-GW),dn=!M.has(i+GW)||!M.has(i+1);let c=o.flat?pal[1]:up||(!M.has(i-1)&&!o.noL)?pal[2]:dn?pal[0]:pal[1];
    if(o.seg!=null&&y%3===o.seg&&!up)c=pal[0];G[i]=c;PT[i]=id}
   if(o.noLine)return;
   for(const i of M){const x=i%GW;for(const d of[-1,1,-GW,GW]){const k=i+d;if(d===-1&&x===0||d===1&&x===GW-1)continue;if(k>=0&&k<G.length&&!M.has(k)&&PT[k]>=0&&PT[k]!==id){G[i]=ln;break}}}}
  const K={G,
   poly:(pts,pal,o)=>part((x,y)=>inPolyG(x,y,pts),pal,o),
   ell:(cx,cy,rx,ry,pal,o)=>part((x,y)=>((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2<=1,pal,o),
   chain:(pts,pal,o)=>part((x,y)=>pts.some(([cx,cy,r])=>Math.hypot(x+.5-cx,y+.5-cy)<=r),pal,o),   // a tapering tube through [x,y,radius] points
   px:(x,y,c)=>{x=Math.round(x);const Y=Math.round(y)+OY;if(x>=0&&x<GW&&Y>=0&&Y<GH)G[Y*GW+x]=c},
   mir:pts=>pts.map(([x,y])=>[GW-1-x,y]),
   line:(x0,y0,x1,y1,c)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let k=0;k<=n;k++)K.px(x0+(x1-x0)*k/n,y0+(y1-y0)*k/n,c)},
   // wing ribs: only repaint pixels already covered (never the outline)
   rib:(x0,y0,x1,y1,c)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let k=0;k<=n;k++){const X=Math.round(x0+(x1-x0)*k/n),Y=Math.round(y0+(y1-y0)*k/n)+OY,i=Y*GW+X;if(X>=0&&X<GW&&Y>=0&&Y<GH&&G[i])G[i]=c}},
   curve:(x0,y0,x1,y1,bend,r0,r1,n)=>{const o=[];n=n||12;for(let k=0;k<=n;k++){const t=k/n,mx=(x0+x1)/2-(y1-y0)*bend,my=(y0+y1)/2+(x1-x0)*bend;o.push([(1-t)*(1-t)*x0+2*t*(1-t)*mx+t*t*x1,(1-t)*(1-t)*y0+2*t*(1-t)*my+t*t*y1,r0+(r1-r0)*t])}return o},
   done:()=>{const out=G.slice();for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){const i=y*GW+x;if(G[i])continue;if((x>0&&G[i-1])||(x<GW-1&&G[i+1])||(y>0&&G[i-GW])||(y<GH-1&&G[i+GW]))out[i]=outline}
    const c=document.createElement('canvas');c.width=GW;c.height=GH;const x=c.getContext('2d');for(let i=0;i<out.length;i++)if(out[i]){x.fillStyle=out[i];x.fillRect(i%GW,(i/GW)|0,1,1)}return c}};
  return K}
 window.SQKIT=chunkKit;
 const flipCan=src=>{const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const x=c.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(src,0,0);return c};

 // ---------- Demon: 48x50, crimson, curling horns, bat wings, fists wreathed in fire ----------
 function demonSp(fr,dir){dir=dir||'s';const k=chunkKit(48,52,2,'#140406'),{poly,ell,chain,px,mir,rib,curve}=k;
  const sk=['#5a1014','#982420','#cc4434','#3a080a'],dk=['#1e080a','#3a1216','#5a2026','#100406'],hn=['#7a7060','#b0a48a','#e8dec4','#4a4238'],hf=['#140c0a','#2e221e','#4a3a32','#0a0606'],wg=['#2a0a0e','#4a141a','#6a2028','#160406'];
  const w=[0,-1,-2,-1][fr],b=fr%2,EY='#fff060',EO='#ff9010',FA='#f8f0e0';
  const side=dir==='w',front=dir==='s',back=dir==='n';
  if(!side){
   const wing=[[18,16+b],[12,4+w],[5,0+w],[0,6+w],[3,9+w],[0,15+w],[5,15+w],[4,21+w],[9,19+w],[11,25],[16,22+b]];
   const tl=curve(26,36,6,40,-.5,3,1.2,14);
   if(front){for(const p of[wing,mir(wing)])poly(p,wg);for(const s of[0,1]){const f=s?x=>47-x:x=>x;for(const[a,c]of[[5,0],[0,6],[0,15],[4,21]])rib(f(16),18+b,f(a),c+w,wg[0])}
    chain(tl,sk);const[tx,ty]=tl[tl.length-1];poly([[tx-3,ty+1],[tx,ty-4],[tx+2,ty+1],[tx,ty+2]],sk)}
   // legs and hooves
   for(const s of[0,1]){const M=s?mir:p=>p;ell(s?29.5:18.5,37,5,5,sk);poly(M([[15,39],[21,39],[21,46],[16,46]]),sk);poly(M([[14,46],[22,46],[22,49],[14,49]]),hf)}
   poly([[17,32+b],[31,32+b],[30,40],[24,42],[18,40]],dk);
   // V-shaped torso, shoulders, abs
   poly([[12,15+b],[36,15+b],[33,23+b],[29,33+b],[19,33+b],[15,23+b]],sk);
   if(front){poly([[20,25+b],[28,25+b],[27,33+b],[21,33+b]],sk,{seg:1,noL:1});k.line(17,22+b,23,23+b,sk[0]);k.line(25,23+b,31,22+b,sk[0]);px(24,19+b,sk[0]);px(24,20+b,sk[0]);px(24,21+b,sk[0])}
   else{k.line(24,17+b,24,31+b,sk[0]);for(const s of[0,1]){const f=s?x=>47-x:x=>x;k.line(f(17),20+b,f(21),25+b,sk[0])}}
   for(const s of[0,1]){const M=s?mir:p=>p;ell(s?35:12,18+b,5.5,4.5,sk);poly(M([[7,19+b],[13,20+b],[13,28+b],[8,28+b]]),sk);poly(M([[8,27+b],[13,27+b],[13,33+b],[8,33+b]]),sk);
    ell(s?36.5:10.5,35+b,3.6,3,sk);if(front)for(const x of[8,10,12])px(s?47-x:x,38+b,hn[2])}
   // head
   for(const s of[0,1]){const f=s?x=>47-x:x=>x;chain(curve(f(20),6+b,f(12),-2+b,s?-.35:.35,2.3,1,10),hn,{noLine:1})}
   ell(24,10+b,6.5,7,sk);
   if(front){poly([[19,12+b],[29,12+b],[27,17+b],[21,17+b]],sk);k.line(19,8+b,22,9+b,dk[3]);k.line(25,9+b,28,8+b,dk[3]);
    for(const x of[20,21])px(x,10+b,EY),px(x,11+b,EO);for(const x of[26,27])px(x,10+b,EY),px(x,11+b,EO);
    k.line(21,14+b,27,14+b,'#200406');px(22,15+b,FA);px(26,15+b,FA);px(24,14+b,FA)}
   if(back){for(const s of[0,1]){poly(s?mir(wing):wing,wg)}for(const s of[0,1]){const f=s?x=>47-x:x=>x;for(const[a,c]of[[5,0],[0,6],[0,15],[4,21]])rib(f(16),18+b,f(a),c+w,wg[0])}
    const t2=curve(24,36,38,46,.45,3,1.2,14);chain(t2,sk);const[tx,ty]=t2[t2.length-1];poly([[tx-2,ty-1],[tx+4,ty-3],[tx+2,ty+2],[tx,ty+2]],sk)}}
  else{// side, facing left
   poly([[25,15+b],[30,3+w],[37,-1+w],[44,2+w],[41,6+w],[46,11+w],[40,12+w],[42,18+w],[36,17+w],[33,23]],wg);
   for(const[a,c]of[[37,-1],[44,2],[46,11],[42,18]])rib(28,16+b,a,c+w,wg[0]);
   {const tl=curve(26,34,44,38,.5,3,1.2,14);chain(tl,sk);const[tx,ty]=tl[tl.length-1];poly([[tx-1,ty-4],[tx+3,ty],[tx,ty+2],[tx-2,ty]],sk)}
   ell(30,34+b,3,2.6,dk);poly([[29,22+b],[33,22+b],[33,32+b],[29,32+b]],dk);   // far arm, in shadow
   ell(26,37,5.5,5,sk);poly([[24,39],[29,39],[30,46],[25,46]],sk);poly([[22,46],[31,46],[31,49],[22,49]],hf);
   ell(20,37,5.5,5,sk);poly([[17,39],[23,39],[22,46],[17,46]],sk);poly([[13,46],[22,46],[22,49],[13,49]],hf);
   poly([[18,32+b],[29,32+b],[28,40],[19,41]],dk);
   poly([[16,15+b],[29,14+b],[30,22+b],[27,33+b],[19,33+b],[16,24+b]],sk);k.line(17,23+b,22,24+b,sk[0]);for(const y of[26,29])k.line(18,y+b,21,y+b,sk[0]);
   ell(22,18+b,6,5,sk);poly([[17,19+b],[23,20+b],[21,28+b],[16,27+b]],sk);poly([[15,26+b],[20,27+b],[17,33+b],[12,32+b]],sk);ell(13.5,34+b,3.6,3,sk);for(const y of[33,35])px(9,y+b,hn[2]);
   chain(curve(24,5+b,33,-1+b,-.4,2.4,1,10),hn,{noLine:1});
   ell(21,10+b,6,6.5,sk);poly([[13,10+b],[21,10+b],[22,16+b],[16,16+b]],sk);
   k.line(14,7+b,19,8+b,dk[3]);px(16,9+b,EY);px(17,9+b,EY);px(16,10+b,EO);k.line(14,13+b,19,13+b,'#200406');px(15,14+b,FA);px(18,14+b,FA);px(13,10+b,'#200406')}
  return k.done()}

 // ---------- Stone Giant: 56x88 (tall to fit the raised club), grey stone with moss, glowing eyes, a boulder club ----------
 function giantSp(fr,dir){dir=dir||'s';const k=chunkKit(56,88,30,'#14100c'),{poly,ell,chain,px,mir,curve}=k;
  const st=['#4a443c','#7a7060','#a89c84','#2e2a24'],dk=['#2e2a24','#4a443c','#6a6254','#1a1612'],ms=['#2e6a28','#4a8a34','#72b048','#1e4a1e'],wd=['#4a2c12','#7a4c22','#a06a34','#2e1a0a'],rp=['#8a6c38','#c4a868','#e0cc90','#5a4422'];
  const b=fr%2,sw=[0,-1,-2,-1][fr],E1='#fff0a0',E2='#ffa818';
  const moss=(x,y,r)=>ell(x,y,r,r*.55,ms,{noLine:1});
  const club=(cx,cy)=>{poly([[cx-2,cy+16],[cx+1,cy+16],[cx+2,cy],[cx-1,cy]],wd);for(const y of[cy+3,cy+5])k.line(cx-2,y,cx+2,y,rp[1]);ell(cx+1,cy-5,8,7,st);moss(cx-2,cy-10,3);px(cx+4,cy-4,dk[1]);px(cx-2,cy-2,dk[1])};
  if(dir==='w'){
   // the far arm holds the club up behind; the near arm hangs in front
   ell(33,20+b,6,5.5,st);poly([[30,18+b],[37,18+b],[38,6+b+sw],[33,6+b+sw]],st);ell(35.5,6+b+sw,4.5,4,st);club(35,-10+sw*2);ell(35.5,6+b+sw,4.5,4,st);
   for(const x of[32,24]){ell(x,42,6,5,st);poly([[x-5,43],[x+5,43],[x+5,53],[x-5,53]],st);poly([[x-7,52],[x+5,52],[x+5,56],[x-7,56]],dk)}
   ell(28,30+b,15,14,st);ell(31,23+b,11,8,st);moss(30,16+b,6);moss(39,23+b,4);moss(34,34+b,3);k.line(36,28+b,40,33+b,dk[1]);
   ell(14,17+b,7.5,7,st);poly([[7,18+b],[15,17+b],[16,23+b],[9,23+b]],st);px(9,16+b,E1);px(10,16+b,E1);px(9,17+b,E2);k.line(7,14+b,12,14+b,dk[3]);k.line(9,21+b,13,21+b,dk[3]);moss(15,11+b,4);
   ell(22,25+b,7,6,st);poly([[16,26+b],[23,26+b],[21,37+b],[15,37+b]],st);ell(17.5,39+b,5,4.5,st);for(const x of[13,16,19])px(x,43+b,dk[1])}
  else{const front=dir==='s',CX=front?0:-40;   // seen from behind, the club is on the other side
   const clubArm=()=>{const X=v=>front?v:57-v;ell(X(44),18+b,7,6,st);poly([[X(43),14+b],[X(50),14+b],[X(50),4+b+sw],[X(45),4+b+sw]],st);ell(X(48)+(front?0:0),4+b+sw,4.5,4,st);club(X(48),-12+sw*2);ell(X(48),4+b+sw,4.5,4,st)};
   if(!front)clubArm();
   for(const s of[0,1]){const M=s?mir:p=>p,x=s?36:19;ell(x,42,6.5,5,st);poly(M([[14,43],[24,43],[24,53],[14,53]]),st);poly(M([[12,52],[25,52],[25,56],[12,56]]),dk)}
   ell(28,29+b,18,15,st);
   if(front){k.line(20,26+b,26,28+b,dk[1]);k.line(36,26+b,30,28+b,dk[1]);k.line(22,34+b,26,36+b,dk[1]);k.line(26,36+b,25,39+b,dk[1]);k.line(33,33+b,35,37+b,dk[1]);moss(16,20+b,5);moss(39,19+b,4);moss(24,38+b,3)}
   else{moss(22,22+b,7);moss(35,25+b,6);moss(28,34+b,4);k.line(28,18+b,28,30+b,dk[1]);px(20,30+b,dk[1]);px(37,31+b,dk[1])}
   // the free arm hangs down
   {const X=v=>front?v:55-v,M=front?p=>p:mir;ell(X(11),22+b,7,6,st);poly(M([[6,24+b],[13,24+b],[13,36+b],[7,36+b]]),st);ell(X(9.5),38+b,5,4.5,st);if(front)for(const x of[6,9,12])px(x,42+b,dk[1])}
   ell(28,13+b,8,7.5,st);
   if(front){poly([[22,15+b],[34,15+b],[32,20+b],[24,20+b]],st);k.line(22,11+b,26,12+b,dk[3]);k.line(30,12+b,34,11+b,dk[3]);for(const x of[24,25])px(x,13+b,E1),px(x,14+b,E2);for(const x of[31,32])px(x,13+b,E1),px(x,14+b,E2);k.line(25,18+b,31,18+b,dk[3]);moss(27,6+b,4)}
   else{moss(28,8+b,6);moss(24,14+b,3)}
   if(front)clubArm()}
  return k.done()}

 // ---------- Flame Wisp: 40x46, a living flame with a face ----------
 function wispSp(fr,dir){dir=dir||'s';const k=chunkKit(40,49,3,'#6a1404'),{poly,ell,px}=k;
  const f0=['#c02808','#e85010','#f88020','#8a1c06'],f1=['#f08020','#f8a830','#fcd060','#c84810'],f2=['#f8c840','#fce070','#fff4c0','#f09030'];
  const lean=dir==='w'?3:0,ex=dir==='w'?-4:0;   // side-on, the flame trails back and the face sits to the front
  const tongue=(cx,base,len,wid,pal,ph)=>{const sw=Math.round(Math.sin(fr*1.57+ph)*1.6)+lean;poly([[cx-wid,base],[cx-wid*.6+sw*.4,base-len*.5],[cx+sw,base-len],[cx+wid*.5+sw*.6,base-len*.45],[cx+wid,base]],pal,{noLine:1})};
  const L=[[8,13,4],[13,20,4],[20,26,4.5],[27,19,4],[32,12,3.5]],ph=[0,2,4,1,3];
  L.forEach(([x,l,w],i)=>tongue(x,26,l+((i+fr)%3),w,f0,ph[i]));
  ell(20,31,13.5,11.5,f0,{noLine:1});poly([[13,38],[20,45],[27,38]],f0,{noLine:1});
  [[12,13,3],[20,19,3.5],[27,13,3]].forEach(([x,l,w],i)=>tongue(x,24,l+((i+fr)%2),w,f1,ph[i]+1));
  ell(20+ex*.5,31,10.5,10,f1,{noLine:1});ell(19+ex*.7,33,6,6,f2,{noLine:1});
  if(dir!=='n'){const cx=20+ex;
   for(const s of dir==='w'?[-1]:[-1,1]){const x=cx+s*4;poly([[x-2,27],[x+2,27],[x+2,31],[x-2,31]],['#3a0602','#3a0602','#3a0602','#3a0602'],{noLine:1});px(x-(s<0?1:0)-(dir==='w'?1:0),28,'#fff8c0');k.line(x-3,26-(s<0?1:0),x+2,26-(s<0?0:1),'#3a0602')}
   if(dir==='w'){const x=cx+3;poly([[x-1,27],[x+2,27],[x+2,31],[x-1,31]],['#3a0602','#3a0602','#3a0602','#3a0602'],{noLine:1})}
   poly([[cx-5,34],[cx+5,34],[cx+3,38],[cx-3,38]],['#3a0602','#3a0602','#3a0602','#3a0602'],{noLine:1});for(let i=0;i<4;i++)px(cx-4+i*2.6,34,'#fff4c0')}
  return k.done()}
 function impSp(fr,dir,atk){dir=dir||'s';const k=chunkKit(24,28,3,'#1a0610'),{poly,ell,chain,px,mir,rib,curve,line}=k;
  const sk=['#7a1a1a','#b8302a','#e8604a','#4a0c0c'],wg=['#3a1040','#5a1a60','#7a2a80','#200828'],hn=['#8a7a60','#c8b898','#f4ecd8','#5a4a38'],ft=['#2a0c14','#4a1824','#6a2834','#1a0610'];
  const b=fr%2,w=[0,-1,-1,0][fr],EY='#ff2a1a',PO='#58e070',PO2='#b8ffa0',BL='#c8d8d0',HI='#6a4020';
  const dagger=(hx,hy,dx,dy,len)=>{line(hx,hy,hx-dx,hy-dy,HI);px(hx-dx*2,hy-dy*2,'#f0c040');const ox=dy?1:0,oy=dx&&!dy?1:0;px(hx+ox,hy+oy,'#f0c040');px(hx-ox,hy-oy,'#f0c040');for(let i=1;i<=len;i++){const x=hx+dx*i,y=hy+dy*i;px(x,y,PO);px(x+ox,y+oy,i<len?'#2a9a40':PO);if(i<len-1)px(x-ox,y-oy,PO2)}
   if(fr%2===0)px(hx+dx*3+(dy?1:0),hy+dy*3+2,PO)};   // a drop of poison
  if(dir!=='w'){const S=dir==='s';
   const wing=[[9,12+b],[5,5+w],[1,6+w],[3,9+w],[1,12+w],[4,12+w],[4,15+w],[8,15+b]];
   if(S){for(const p of[wing,mir(wing)])poly(p,wg);chain(curve(14,19,20,13,-.4,1.4,.7,10),sk);poly([[19,10],[21,13],[19,15],[18,13]],sk)}
   for(const s of[0,1]){const x=s?14:9;ell(x,20.5,2.2,2.5,sk);poly(s?[[12,22],[17,22],[17,24],[12,24]]:[[6,22],[11,22],[11,24],[6,24]],ft)}
   ell(11.5,16.5+b*.3,4.8,4.2,sk);if(S)ell(11.5,17.5+b*.3,2.6,2.4,['#c87050','#e8a070','#f8c898','#8a4030'],{noLine:1});
   // arms: the right one holds the dagger up
   poly([[7,14+b],[9,15+b],[7,19+b],[5,18+b]],sk);ell(5.5,19+b,1.6,1.4,sk);
   if(atk&&S){poly([[14,14+b],[16,15+b],[17,21],[15,21]],sk);ell(16,21.5,1.6,1.4,sk);dagger(16,21,0,1,4)}
   else{poly([[14,14+b],[16,15+b],[18,17+b],[16,18+b]],sk);ell(18,17+b,1.6,1.4,sk);dagger(18,16+b,1,-1,4)}
   // head: big, pointy ears, little horns
   for(const s of[0,1]){const M=s?mir:p=>p;poly(M([[6,8+b],[1,6+b],[6,11+b]]),sk);poly(M([[8,5+b],[6,0+b],[9,3+b],[10,5+b]]),hn,{noLine:1})}
   ell(11.5,8.5+b,5.8,5.2,sk);
   if(S){for(const[x,c]of[[8,EY],[9,EY],[14,EY],[15,EY]])px(x,8+b,c);px(9,9+b,'#ffd8c8');px(14,9+b,'#ffd8c8');px(8,9+b,EY);px(15,9+b,EY);line(7,7+b,9,7+b,'#2a0404');line(14,7+b,16,7+b,'#2a0404');
    line(9,11+b,14,11+b,'#2a0610');px(8,10+b,'#2a0610');px(15,10+b,'#2a0610');px(10,12+b,'#f8f4e8');px(13,12+b,'#f8f4e8')}
   else{for(const p of[wing,mir(wing)])poly(p,wg);chain(curve(11,20,17,24,.5,1.4,.7,10),sk);poly([[16,22],[19,23],[18,25],[16,25]],sk)}}
  else{// side-on, facing left
   poly([[12,12+b],[15,4+w],[20,4+w],[18,8+w],[21,11+w],[17,12+w],[17,15+w],[13,16]],wg);rib(14,13,16,5+w,wg[0]);rib(14,13,19,10+w,wg[0]);
   chain(curve(14,19,21,15,-.5,1.4,.7,10),sk);poly([[20,12],[22,15],[20,17],[19,15]],sk);
   ell(13,20.5,2.2,2.5,sk);poly([[9,22],[14,22],[14,24],[9,24]],ft);
   ell(11.5,16.5+b*.3,4.2,4.2,sk);ell(10,17.5+b*.3,2,2.2,['#c87050','#e8a070','#f8c898','#8a4030'],{noLine:1});
   ell(10,20.5,2.2,2.5,sk);poly([[6,22],[11,22],[11,24],[6,24]],ft);
   if(atk){poly([[9,14+b],[11,15+b],[6,17+b],[5,15+b]],sk);ell(4.5,16+b,1.6,1.4,sk);dagger(4,16+b,-1,0,5)}
   else{poly([[9,14+b],[11,15+b],[8,19+b],[6,18+b]],sk);ell(6.5,19+b,1.6,1.4,sk);dagger(6,18+b,-1,-1,4)}
   poly([[13,7+b],[19,5+b],[14,10+b]],sk);poly([[11,4+b],[13,0+b],[13,4+b],[14,6+b]],hn,{noLine:1});
   ell(11,8.5+b,5.2,5,sk);poly([[3,8+b],[8,7+b],[8,11+b],[5,11+b]],sk);
   px(7,8+b,EY);px(8,8+b,EY);px(7,9+b,'#ffd8c8');line(6,7+b,9,7+b,'#2a0404');line(5,11+b,9,11+b,'#2a0610');px(6,12+b,'#f8f4e8');px(4,9+b,'#2a0610')}
  return k.done()}
 window.SQIMPSP=(fr,d,a)=>d==='e'?flipCan(impSp(fr,'w',a)):impSp(fr,d,a);
 const MAKE={dragon:dragonSp,demon:demonSp,giant:giantSp,wisp:wispSp};
 // every boss is drawn at 2 world pixels per sprite pixel
 const SC={dragon:4,demon:4,giant:4,wisp:4};
 // their four facings: west is drawn, east is west mirrored, plus front (south) and back (north) views
 const BSC={};const bsSp=(t,fr,d)=>{const k=t+d+fr;if(BSC[k])return BSC[k];return BSC[k]=d==='e'?flipCan(bsSp(t,fr,'w')):MAKE[t](fr,d)};
 // where each picture's feet sit, in sprite pixels / 2
 const BOX={dragon:{w:11,e:13,s:12,n:12,y:26.5},demon:{w:11,e:13,s:12,n:12,y:26},giant:{w:13,e:15,s:14,n:14,y:43},wisp:{w:10,e:10,s:10,n:10,y:25}};
 // it turns to face the nearest player (you or anyone else here), with a little stickiness so it doesn't flicker
 function wbFace(n,x,y){let bx=P.x-x,by=P.y-y,bd=Math.hypot(bx,by);try{const l=mpLoc();if(l)for(const r of MP.players.values()){if(r.loc!==l||!live(r))continue;const d=Math.hypot(r.x-x,r.y-y);if(d<bd){bd=d;bx=r.x-x;by=r.y-y}}}catch(e){}
  let f=n._fd||'s';const ax=Math.abs(bx),ay=Math.abs(by),want=ax>ay?(bx<0?'w':'e'):(by<0?'n':'s');
  if(want!==f){const horiz=f==='w'||f==='e',wh=want==='w'||want==='e';if(horiz===wh||(wh?ax>ay*1.25:ay>ax*1.25))f=want}return n._fd=f}
 drawWB=function(n,tm){const x=Math.round(n.x),y=Math.round(n.y),t=n._wb,per={dragon:.18,demon:.16,giant:.22,wisp:.09}[t],fr=Math.floor(tm/per)%4,hit=WB.hitAt&&performance.now()-WB.hitAt<110,fd=wbFace(n,x,y),c=bsSp(t,fr,fd),K=SC[t];
  const w=c.width/2*K,hh=c.height/2*K,ox=BOX[t][fd]*K,oy=BOX[t].y*K;
  if(t==='wisp'){const gl=g.createRadialGradient(x,y-32,2,x,y-32,50);gl.addColorStop(0,'rgba(255,190,80,.45)');gl.addColorStop(1,'rgba(255,120,30,0)');g.fillStyle=gl;g.fillRect(x-54,y-86,108,108);shd(x,y+8,26)}
  else shd(x,y+6,t==='dragon'?70:t==='giant'?56:44);
  const bob=t==='wisp'?Math.round(Math.sin(tm*3)*2):0;g.drawImage(c,x-ox,y-oy+bob+2,w,hh);
  if(hit){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.35;g.drawImage(c,x-ox,y-oy+bob+2,w,hh);g.restore()}
  if(t==='wisp')for(let k=0;k<6;k++){const a=tm*1.8+k*1.047,ex=Math.round(x+Math.cos(a)*32),ey=Math.round(y-32+Math.sin(a)*14+bob);g.fillStyle='rgba(255,200,90,.35)';g.fillRect(ex-3,ey-3,6,6);Rg(ex-1,ey-1,3,3,k%2?'#fff0a0':'#f88830')}
  // the demon's fists burn (one fist in view side-on)
  if(t==='demon'){const fb=fr%2*2,F=fd==='w'?[[-17,-32]]:fd==='e'?[[17,-32]]:[[-27,-30],[27,-30]];for(const[fx,fy]of F){const hx=x+fx,hy=y+fy+fb;for(let k=0;k<5;k++){const fl=Math.sin(tm*12+k*2+fx)*1.5;Rg(Math.round(hx-2+k%3+fl),Math.round(hy-6-k*2),2,3,k%2?'#f8d040':'#f86020')}}}
  if(t==='dragon'&&Math.floor(tm*1.5)%4===0&&fd!=='n'){for(let k=0;k<8;k++){const d=4+Math.random()*22,q=(Math.random()-.5)*d*.5;Rg(Math.round(fd==='w'?x-36-d:fd==='e'?x+36+d:x+q),Math.round(fd==='s'?y-60+d*.7:y-63+q),2,2,k%2?'#f8e060':'#f86020')}}}
 window.SQWBART=MAKE}
// ---- Dragon Form (Dragonsoul amulet): other players see you as the little dragon, breathing fire; in PvP it burns
{const _dp=mpDrawPeer;mpDrawPeer=function(r,tm){if(!r.dg||!window.SQDF)return _dp(r,tm);const x=Math.round(r.x),y=Math.round(r.y),d=r.d===2?(r.fl?'w':'e'):r.d===1?'n':'s';
  SQDF.draw(x,y,d,Math.floor(tm/(r.mv?.12:.2))%4);MP.T=g.getTransform();MP.Tat=performance.now();
  if(r.br&&!menuOpen&&!pnOpen){const n=performance.now();if(!r.brAt||n-r.brAt>45){r.brAt=n;SQDF.flames(r.x,r.y,d)}}}}
{const _u=upd;upd=function(dt){_u(dt);if(menuOpen||pnOpen||!window.SQDF||!SQDF.br||!PV.on)return;const d=SQDF.dir(),[mx,my,fx,fy]=SQDF.mouth(P.x,P.y,d);
  for(const r of MP.players.values()){if(!pvTarget(r))continue;const dx=r.x-mx,dy=r.y-6-my,al=dx*fx+dy*fy,pe=Math.abs(dx*fy-dy*fx);if(al>-4&&al<64&&pe<8+al*.45)pvHit(r,'sp','fire')}}}
window.SQFWPEERS=()=>{const l=mpLoc();return[...MP.players.values()].filter(r=>r.fw&&r.loc===l&&live(r)&&isFinite(r.fw[0])).map(r=>r.fw)};
// ---- the Imp pet in PvP: it goes after a player who hits you ----
{const _in=pvIncoming;pvIncoming=function(id,v){const h0=P.hp,hu=hurt;_in(id,v);try{if(v&&PV.on&&(P.hp<h0||hurt>hu)&&window.SQIMP)SQIMP.aggro(String(v.f||''))}catch(e){}}}
window.SQIMPPVP={pos:u=>{const r=MP.players.get(u);return r&&pvTarget(r)?{x:r.x,y:r.y}:null},hit:u=>{const r=MP.players.get(u);if(r&&pvTarget(r))pvHit(r,'sp','fire')}};
// ---- One game per account at a time ----
// With SkillQuest open on two devices (or two tabs) on the same account, both used to post your position in turn,
// so other players saw you jump between two spots and blink in and out, and trades with you fell through (and the
// two copies saved over each other). Now the game you opened last is the live one; the other pauses with a
// PLAY HERE button (which reloads it with your latest save).
MP.sid=Math.random().toString(36).slice(2,10);MP.s0=Date.now();MP.passive=false;
const sessEl=el('div','sqsess','g3','');sessEl.style.cssText='position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;background:rgba(20,24,40,.82)';
sessEl.innerHTML='<div class="g3" style="max-width:320px;padding:18px;text-align:center;font:500 15px '+PF+';background:#f8f8f8;border:3px solid #485870"><b style="font-size:18px">Playing somewhere else</b><br><br>SkillQuest was opened on another device or tab with your account, so this one is paused.<br><br><button id="sqsessgo" style="font:700 16px '+PF+';padding:10px 18px;border:3px solid #485870;background:#485870;color:#fff;cursor:pointer">PLAY HERE</button></div>';
document.body.appendChild(sessEl);for(const ev of['touchstart','pointerdown','mousedown','keydown','keyup'])sessEl.addEventListener(ev,e=>e.stopPropagation());
$('sqsessgo').onclick=()=>{try{location.reload()}catch(e){}};
function sessPassive(){if(MP.passive)return;MP.passive=true;try{FB.db.onDisconnect(MP.pref).cancel().catch(()=>{})}catch(e){}sessEl.style.display='flex';try{if(TR&&TR.st!=='idle'&&typeof trCancel==='function')trCancel()}catch(e){}}
{const _ms=mpStart;mpStart=async function(u){await _ms(u);if(!MP.on||!MP.pref)return;MP.unsub.push(FB.db.onValue(MP.pref,s=>{const v=s.val();if(MP.passive)return;
   // the copy opened later wins (both sides compare the same numbers, so they always agree)
   if(v&&v.sid&&v.sid!==MP.sid&&(+v.s0>MP.s0||(+v.s0===MP.s0&&v.sid>MP.sid)))sessPassive();else if(!v)MP.last=''}))}}
// a paused game doesn't save (the live one has the newer progress)
{const _sc=saveCloud;saveCloud=function(f){if(MP.passive)return;return _sc(f)}}
{const _sl=saveLocal;saveLocal=function(f){if(MP.passive)return;return _sl(f)}}
// ---- Trusted friends ----
// Friends can walk into your houses and look around. Friends you mark TRUSTED (Chat > Friends > TRUST) can also use
// your crafting stations, open your chests and rest in your beds, in your houses on every island and at the things
// you've built outside. trust/<uid>/<friend> = true (only you can write your list).
// Chests are shared through chests/<owner>/<chest id> = {i: {item: count}, v}: while you have a trusted friend, your
// game keeps that copy in step with your real chests (changes either side are merged, never overwritten), and a
// trusted friend's take/put is a transaction, so the same items can't be taken twice.
const TRU={mine:{},of:{},subs:{},sub:null};
function trustSub(o){if(!MP.on||!MP.user||!o||o===MP.user.uid||TRU.subs[o])return;TRU.subs[o]=FB.db.onValue(FB.db.ref(FB.D,'trust/'+o),s=>{TRU.of[o]=s.val()||{}},()=>{TRU.of[o]=TRU.of[o]||{}})}
function trustedBy(o){if(!MP.on||!MP.user||!o||o===MP.user.uid)return false;trustSub(o);return!!(TRU.of[o]&&TRU.of[o][MP.user.uid]===true)}
// the first time you touch something of theirs their trust list may not have arrived yet: wait for it, then act
function trustThen(o,fn){if(!MP.on||!MP.user)return noTrust(o);trustSub(o);if(TRU.of[o]){if(TRU.of[o][MP.user.uid]===true)fn();else noTrust(o);return}
 swing=.25;FB.db.get(FB.db.ref(FB.D,'trust/'+o)).then(s=>{TRU.of[o]=s.val()||{};if(TRU.of[o][MP.user.uid]===true)fn();else noTrust(o)}).catch(()=>noTrust(o))}
// keep the trust lists of everyone whose houses or builds are here up to date
setInterval(()=>{if(!MP.on||!MP.user)return;try{for(const o of Object.keys(HS.data||{}).concat(Object.keys(BLDS.data||{})))trustSub(o);for(const o in (MP.friends||{}))trustSub(o)}catch(e){}},2000);
const iTrust=u=>!!TRU.mine[u];
function trustSet(u,on){if(!MP.user||!u)return;FB.db.set(FB.db.ref(FB.D,'trust/'+MP.user.uid+'/'+u),on?true:null).then(()=>{mpLog('game',on?fname(u)+' is now a trusted friend. They can use your stations, chests and beds.':fname(u)+' is no longer a trusted friend.')}).catch(mpErr)}
function noTrust(o){const n=performance.now();if(n-BLDS.msgAt>1500){BLDS.msgAt=n;const nm=fname(o);say('Only '+nm+'\'s trusted friends can use that. Ask '+nm+' to trust you (Friends list).');sfx('swish')}swing=.25}
{const _ms=mpStart;mpStart=async function(u){await _ms(u);if(!MP.on||TRU.sub)return;try{
  TRU.sub=FB.db.onValue(FB.db.ref(FB.D,'trust/'+MP.user.uid),s=>{TRU.mine=s.val()||{};if(MP.open&&MP.tab==='fr')mpRList()});
  CHS.sub=FB.db.onValue(FB.db.ref(FB.D,'chests/'+MP.user.uid),s=>{CHS.db=s.val()||{};CHS.got=true});
  MP.unsub.push(()=>{try{TRU.sub&&TRU.sub();CHS.sub&&CHS.sub()}catch(e){}TRU.sub=CHS.sub=null;CHS.got=false;for(const k in TRU.subs)try{TRU.subs[k]()}catch(e){}TRU.subs={};TRU.of={};TRU.mine={};CHS.db={}})}catch(e){mpErr(e)}}}
// trust goes when the friendship does
setInterval(()=>{if(!MP.on||!MP.user||!MP.friends)return;for(const u in TRU.mine)if(TRU.mine[u]&&!MP.friends[u])trustSet(u,false)},4000);
// Friends list: a TRUST button on each friend, and what it means
{const _fv=friendsView;friendsView=function(){_fv();if(!MP.user)return;let any=false;
  for(const row of lst.querySelectorAll('.fr')){const msg=[...row.querySelectorAll('button')].find(b=>b.textContent==='MESSAGE');if(!msg)continue;const nm=row.querySelector('.fn b');
   const u=Object.keys(MP.friends).find(k=>fname(k)===(nm&&nm.textContent));if(!u)continue;any=true;const on=iTrust(u),b=document.createElement('button');b.textContent=on?'TRUSTED ✓':'TRUST';
   b.title=on?'Tap to stop trusting':'Let them use your stations, chests and beds';if(on)b.style.cssText='background:#3a8a48;color:#fff;border-color:#2a6a38';b.onclick=()=>trustSet(u,!on);
   const rm=[...row.querySelectorAll('button')].find(x=>x.textContent==='REMOVE'||x.textContent==='SURE?');if(rm)rm.before(b);else row.append(b)}
  if(any){const h=document.createElement('div');h.className='fh';h.style.cssText='font-size:11px;font-weight:400;letter-spacing:0;text-transform:none';h.textContent='Friends can visit your houses. TRUSTED friends can also use your stations, chests and beds.';
   const first=lst.querySelector('.fr');if(first)first.before(h)}}}
// ---- shared chests ----
const CHS={db:{},base:{},busy:{},sub:null,got:false,open:null,ever:new Set()};
const chClean=o=>{const r={};if(o&&typeof o==='object')for(const k in o){const n=Math.floor(+o[k]||0);if(n>0&&INVK.includes(k))r[k]=n}return r};
const chEq=(a,b)=>{const ka=Object.keys(a),kb=Object.keys(b);return ka.length===kb.length&&ka.every(k=>a[k]===b[k])};
const chSet=(o,ni)=>{const it=o.items||(o.items={});for(const k of Object.keys(it))delete it[k];Object.assign(it,ni)};
function chOwn(){const out=[];for(const h of HOUSES.concat(typeof RH!=='undefined'?RH:[])){if(h._foreign)continue;for(const[i,f]of h.furn)if(f.t==='chest')out.push(['h_'+h.id+'_'+i,f])}
 for(const[i,s]of STR)if(s.t==='chest'&&!s._foreign)out.push(['s_'+i,s]);
 if(typeof RB!=='undefined')for(const id in RB)for(const[k,s]of RB[id])if(s.t==='chest')out.push(['r_'+id+'_'+k.replace(',','_'),s]);return out}
function chSync(){if(!MP.on||!MP.user||!CHS.got||!Object.values(TRU.mine).some(Boolean))return;const me=MP.user.uid,seen=new Set();let changed=false;
 for(const[cid,o]of chOwn()){seen.add(cid);if(CHS.busy[cid])continue;CHS.ever.add(cid);const db=CHS.db[cid],loc=chClean(o.items),base=db?(CHS.base[cid]||{}):{},delta={};let dz=true;
  for(const k of new Set([...Object.keys(loc),...Object.keys(base)])){const d=(loc[k]|0)-(base[k]|0);if(d){delta[k]=d;dz=false}}
  if(!dz){CHS.busy[cid]=1;FB.db.runTransaction(FB.db.ref(FB.D,'chests/'+me+'/'+cid),cur=>{const i=chClean(cur&&cur.i);for(const k in delta){const n=Math.max(0,(i[k]|0)+delta[k]);if(n)i[k]=n;else delete i[k]}return{i,v:((cur&&+cur.v)|0)+1}})
    .then(r=>{if(!r||!r.committed)return;const v=r.snapshot.val();CHS.db[cid]=v;const ni=chClean(v&&v.i),now=chClean(o.items);for(const k in now){const e=now[k]-(loc[k]|0);if(e)ni[k]=Math.max(0,(ni[k]|0)+e)}for(const k in loc)if(!(k in now)&&ni[k])ni[k]=Math.max(0,ni[k]-loc[k]);
     for(const k in ni)if(!ni[k])delete ni[k];CHS.base[cid]=chClean(v&&v.i);chSet(o,ni);if(pnOpen&&ptab===7)rPn()}).catch(mpErr).finally(()=>{delete CHS.busy[cid]});continue}
  const di=chClean(db.i);if(!chEq(di,base)){CHS.base[cid]=di;chSet(o,di);changed=true}}
 for(const cid in CHS.db)if(!seen.has(cid)&&CHS.ever.has(cid)&&!CHS.busy[cid]){FB.db.remove(FB.db.ref(FB.D,'chests/'+me+'/'+cid)).catch(()=>{});delete CHS.base[cid]}
 if(changed){if(pnOpen&&ptab===7)rPn();try{saveLocal(true)}catch(e){}}}
setInterval(()=>{try{chSync()}catch(e){console.warn(e)}},1000);
{const _sn=snap;snap=function(){const s=_sn();if(Object.keys(CHS.base).length)s.chb=CHS.base;return s}}
{const _ap=applySave;applySave=function(S){_ap(S);CHS.base={};if(S&&S.chb&&typeof S.chb==='object')for(const k in S.chb)CHS.base[String(k).slice(0,60)]=chClean(S.chb[k])}}
// a trusted friend opening one of your chests
function chOpenShared(owner,cid){if(CHS.open)try{CHS.open()}catch(e){}const box={t:'chest',items:{},_sh:{o:owner,cid}};CHEST_H=box;CHEST_AT=-1;CHEST_IDX=-1;
 CHS.open=FB.db.onValue(FB.db.ref(FB.D,'chests/'+owner+'/'+cid),s=>{const v=s.val();box.items=chClean(v&&v.i);box.ok=true;if(pnOpen&&ptab===7&&CHEST_H===box)rPn()},()=>{box.err=true;if(pnOpen&&ptab===7)rPn()});
 fromMenu=false;pnOpen=true;ptab=7;jx=jy=0;pn.style.display='block';rPn();sfx('talk')}
{const _cp=closePanel;closePanel=function(){_cp();if(CHS.open&&!(pnOpen&&ptab===7)){try{CHS.open()}catch(e){}CHS.open=null;if(CHEST_H&&CHEST_H._sh)CHEST_H=null}}}
{const _cm=chestMove;chestMove=function(k,a,q){const s=CHEST_H;if(!s||!s._sh)return _cm(k,a,q);const lim=q>0?q|0:1e9;const{o,cid}=s._sh,ref=FB.db.ref(FB.D,'chests/'+o+'/'+cid);
  if(a==='d'){const n=Math.min(inv[k]|0,lim);if(n<1)return;inv[k]-=n;s.items[k]=(s.items[k]|0)+n;sfx('pickup');rPn();
   FB.db.runTransaction(ref,cur=>{const i=chClean(cur&&cur.i);i[k]=(i[k]|0)+n;return{i,v:((cur&&+cur.v)|0)+1}}).then(r=>{if(!r||!r.committed)throw new Error('no')}).then(()=>{saveLocal(true);try{saveCloud(true)}catch(e){}})
    .catch(()=>{inv[k]=(inv[k]|0)+n;say('Could not put that in the chest. Try again.');rPn()})}
  else{let got=0;if(!(s.items[k]>0))return;FB.db.runTransaction(ref,cur=>{got=0;if(!cur)return cur;const i=chClean(cur.i);got=Math.min(i[k]|0,lim);if(!got)return;i[k]-=got;if(!(i[k]>0))delete i[k];return{i,v:(+cur.v|0)+1}})
    .then(r=>{if(r&&r.committed&&got>0){inv[k]=(inv[k]|0)+got;sfx('pickup');saveLocal(true);try{saveCloud(true)}catch(e){}}else say('Someone else got to that first.');rPn()}).catch(()=>{say('Could not take that. Try again.')})}}}
{const _r=rPn;rPn=function(){_r();if(!pnOpen)return;if(ptab===7&&CHEST_H&&CHEST_H._sh){const b=document.getElementById('chpk');if(b)b.remove();
   pbd.insertAdjacentHTML('afterbegin','<div class="tl" style="font-size:12px;font-weight:400;opacity:.8;margin-bottom:6px">'+esc(fname(CHEST_H._sh.o))+'\'s chest'+(CHEST_H.err?' · could not open it (are you still trusted?)':CHEST_H.ok?'':' · loading...')+'</div>')}
  if((ptab===2&&typeof STATION!=='undefined'&&STATION&&STATION._foreign)||(ptab===1&&typeof BENCH!=='undefined'&&BENCH&&BENCH._foreign))for(const b of pbd.querySelectorAll('[data-a="pickup"]'))b.remove()}}
// ---- what a visitor can do ----
const inForeignHouse=()=>SCENE&&SCENE.house&&SCENE.house._foreign?SCENE.house:null;
// furniture: never pick up someone else's (this used to hand out free copies)
{const _pf=pickFurn;pickFurn=function(i){const h=inForeignHouse();if(h){notYours(h._owner);return}return _pf(i)}}
{const _ps=pickStruct;pickStruct=function(i){const s=STR.get(i);if(s&&s._foreign){notYours(s._foreign);return}return _ps(i)}}
// chests and beds
{const _uf=useFurn;useFurn=function(o){const h=inForeignHouse();if(!h)return _uf(o);const t=o&&(o.f?o.f.t:o.use);if(t!=='chest'&&t!=='bed')return _uf(o);
  trustThen(h._owner,()=>{
  if(t==='chest'){if(!o.f||o.i==null){say('That chest belongs to '+fname(h._owner)+'.');return}chOpenShared(h._owner,'h_'+h._oid+'_'+o.i);return}
  if(dark()<.3){say('A comfy bed. Rest here at night to sleep through it.');sfx('talk');return}
  time=(Math.floor(time/DAYLEN)+1)*DAYLEN+1;P.hp=Math.min(6,P.hp+2);hunger=Math.max(0,hunger-15*FOOD_RATE);say('You slept at '+fname(h._owner)+'\'s. Good morning!');sfx('quest');saveLocal(true)})}}
// crafting stations inside their houses
{const _os=openStation;openStation=function(o){const h=inForeignHouse();if(o&&h&&o.inside&&!o._ok){trustThen(h._owner,()=>{o._foreign=h._owner;o._ok=1;_os(o)});return}return _os(o)}}
// outside on Hollow: their chests and stations
function trUseForeignStr(i){const s=STR.get(i);if(!s||!s._foreign)return false;if(s.t!=='chest'&&!STN.has(s.t))return false;swing=.25;trustThen(s._foreign,()=>trUseForeignStr2(i,s));return true}
function trUseForeignStr2(i,s){if(s.t==='chest')chOpenShared(s._foreign,'s_'+i);else if(s.t==='dummy'){s.wob=.3;setTimeout(()=>{s.wob=0},300);sfx('hit');if(lvOf(0)<30){addXp(0,4);addXp(7,1)}}else openStation({t:s.t,inside:false,i,f:s,_foreign:s._foreign})}
{const _a=attack;attack=function(){if(!dead&&!menuOpen&&!pnOpen&&!BUILD&&swing<=0&&!FISH&&!(typeof facingNpc==='function'&&facingNpc())){
  if(!SCENE){const[x,y]=frontTile();if(x>=0&&y>=0&&x<N&&y<N&&trUseForeignStr(y*N+x))return}
  else{const R=rbR();if(R){const[x,y]=frontTile();const f=rbForeignAt(R.region,x,y);if(f&&(f.t==='chest'||STN.has(f.t))){swing=.25;
     trustThen(f.owner,()=>{if(f.t==='chest')chOpenShared(f.owner,'r_'+R.region+'_'+x+'_'+y);else if(f.t!=='dummy')openStation({t:f.t,inside:false,i:-1,f:{t:f.t},_foreign:f.owner})});return}}}}
  return _a()}}
{const _us=useStructure;useStructure=function(i){if(trUseForeignStr(i))return;return _us(i)}}
window.SQTRU={TRU,CHS,trustedBy,trustSet,chSync};window.SQTRUTHEN=trustThen;
// ---- Farming on every island ----
// Same as on Hollow: HIT grass with a hoe to till it, plant seeds from the Bag (PLANT), water with the watering can,
// HIT ripe crops to harvest. Plots on each island are kept per island (saved as rfarm) and grow while you play.
// Other players see your island plots (build/<uid>.r._f) and can't till over them.
const RF={};const rfMap=id=>RF[id]||(RF[id]=new Map());
const RF_OK=new Set([2,4,6,7,10,13,14,15]);   // grass, snow, dirt, forest floor, ash, crystal ground... (not sand, rock, lava, floors, ice or water)
function rfForeign(id){const out=new Map();for(const o in BLDS.data){if(MP.user&&o===MP.user.uid)continue;const r=BLDS.data[o]&&BLDS.data[o].r,f=r&&r._f&&r._f[id];if(!f)continue;
  for(const e0 of(Array.isArray(f)?f:Object.values(f))){const e=Array.isArray(e0)?e0:Object.values(e0||{});if(!e[2]&&+e[5]&&nowS()-e[5]>TILL_LIFE)continue;out.set(rbK(e[0]|0,e[1]|0),{c:CROPS[e[2]]?e[2]:null,s:e[3]|0,w:!!e[4],_foreign:o})}}return out}
function rfCanTill(R,x,y){if(x<1||y<1||x>=R.w-1||y>=R.h-1)return false;const i=y*R.w+x;if(!RF_OK.has(R.tiles[i])||R.solid.has(i)||rgObjAt(R,x,y))return false;const k=rbK(x,y);
 if(rfMap(R.region).has(k)||rfForeign(R.region).has(k)||rbMap(R.region).has(k)||rbForeignAt(R.region,x,y))return false;
 for(const p of[R.spawn,R.dock])if(p&&Math.hypot(x-p[0],y-p[1])<4)return false;
 if(typeof rhAt==='function'&&(rhAt(rhHere(),x,y)||rhAt(rhForeign(R.region),x,y)))return false;
 return!fires.some(f=>Math.abs(f.x-(x*16+8))<12&&Math.abs(f.y-(y*16+8))<12)}
// HIT: harvest, water, check, or till
{const _a=attack;attack=function(){const R=rbR();if(!R||dead||menuOpen||pnOpen||BUILD||swing>0||FISH||facingNpc())return _a();
  const[fx,fy]=front(13),tx=Math.floor(fx/16),ty=Math.floor(fy/16),k=rbK(tx,ty);if(en.some(n=>!n.dead&&Math.hypot(n.x-fx,n.y-fy)<18))return _a();
  // a tree, bush or rock standing on the soil (it grew back there): chop/mine it as normal
  if(typeof rgObjAt==='function'&&rgObjAt(R,tx,ty))return _a();
  const p=rfMap(R.region).get(k);
  if(p){swing=.25;if(ripe(p)){harvest(-1,p);return}
   if(p.c&&!wet(p)){if(!TL.can){say('Buy a watering can at the general store to water crops.');sfx('swish');return}p.w=CLK+WATER_FOR;addXp(11,3);say('Watered the '+CROPS[p.c].n.toLowerCase()+'.');sfx('splash');saveLocal();return}
   if(!p.c){say('This soil is ready. Choose seeds in your Bag and tap PLANT.');sfx('swish');return}
   const C=CROPS[p.c],left=Math.max(0,C.max*C.st-p.g);say(C.n+' is growing. About '+Math.ceil(left/60)+' min of watered time left.');sfx('swish');return}
  const fo=rfForeign(R.region).get(k);if(fo){notYours(fo._foreign);return}
  if(TL.hoe&&!rbMap(R.region).has(k)&&rfCanTill(R,tx,ty)){swing=.25;rfMap(R.region).set(k,{c:null,g:0,w:0,e:nowS()});addXp(11,4);sfx('chop');saveLocal(true);say('Tilled! Plant seeds from your Bag.');return}
  return _a()}}
// planting
{const _sb=startBuild;startBuild=function(k){const R=rbR();if(!R||!isSeed(k))return _sb(k);if((inv[k]|0)<1)return;const C=CROPS[SEED2CROP[k]];
  if(lvOf(11)<C.lv){say('You need Farming '+C.lv+' to plant '+C.n.toLowerCase()+'.');closePanel();return}BUILD={k};closePanel();setActionLabels();say('Plant mode: face tilled soil and press PLANT. Press DONE when finished.')}}
{const _pb=placeBuild;placeBuild=function(){const R=rbR();if(!R||!BUILD||!isSeed(BUILD.k))return _pb();const k=BUILD.k,[x,y]=frontTile(),p=rfMap(R.region).get(rbK(x,y));
  if(!p){say(TL.hoe?'Till the soil first: face grass and press HIT.':'You need tilled soil. Craft a hoe (Craft menu) or buy one at the general store.');sfx('swish');return}
  if(p.c){say('Something is already growing there.');sfx('swish');return}inv[k]--;p.c=SEED2CROP[k];p.g=0;addXp(11,5);sfx('rustle');saveLocal(true);if((inv[k]|0)<1)endBuild('Planted your last '+INAME[k].toLowerCase()+'.')}}
// growing (every island's plots grow while you play, like Hollow's)
{const _u=upd;upd=function(dt){_u(dt);if(menuOpen||pnOpen)return;for(const id in RF)for(const p of RF[id].values())if(p.c&&wet(p)&&!ripe(p))p.g+=dt}}
// empty tilled soil turns back into grass after a while (so nobody can cover the world in dirt)
setInterval(()=>{const t=nowS();let n=0;for(const[i,p]of[...FARM]){if(p._foreign||p.c)continue;if(!p.e){p.e=t;continue}if(t-p.e>TILL_LIFE){FARM.delete(i);n++}}
 for(const id in RF)for(const[k,p]of[...RF[id]]){if(p.c)continue;if(!p.e){p.e=t;continue}if(t-p.e>TILL_LIFE){RF[id].delete(k);n++}}if(n)try{saveLocal(true)}catch(e){}},5000);
// drawing: plots lie flat on the ground
{const _rn=rgNear;rgNear=function(R,x0,y0,x1,y1){const out=_rn(R,x0,y0,x1,y1);if(!R||!R.region||!(SCENE&&SCENE.room===R))return out;const M=rfMap(R.region),F=rfForeign(R.region);
  for(const[k,p]of M){const[x,y]=rbXY(k);if(x>=x0-2&&x<=x1+2&&y>=y0-2&&y<=y1+2)out.push({t:'_rf',p,M,F,tx:x,ty:y,x:x+.5,y:y-.95})}
  for(const[k,f]of F){const[x,y]=rbXY(k);if(x>=x0-2&&x<=x1+2&&y>=y0-2&&y<=y1+2){const p={c:f.c,g:f.c?f.s*CROPS[f.c].st:0,w:f.w?CLK+60:0};out.push({t:'_rf',p,M,F,tx:x,ty:y,x:x+.5,y:y-.95})}}return out}}
{const _df=drawFurn;drawFurn=function(it,tm){if(it&&it.t==='_rf'){const{M,F,tx,ty}=it;try{GC=g;drawPlot(-1,it.p,tm,tx,ty,(dx,dy)=>M.has(rbK(tx+dx,ty+dy))||F.has(rbK(tx+dx,ty+dy)))}catch(e){}return}return _df(it,tm)}}
// saving
{const _sn=snap;snap=function(){const s=_sn();const o={};for(const id in RF){const a=[];for(const[k,p]of RF[id]){const[x,y]=rbXY(k);a.push([x,y,p.c||'',Math.round(p.g),Math.round(p.w),p.e|0])}if(a.length)o[id]=a}if(Object.keys(o).length)s.rfarm=o;return s}}
{const _ap=applySave;applySave=function(S){_ap(S);for(const id in RF)delete RF[id];const o=S&&S.rfarm;if(o&&typeof o==='object')for(const id in o){if(!WORLD_REGIONS[id]||!Array.isArray(o[id]))continue;const M=rfMap(id);
   for(const e of o[id])if(Array.isArray(e)&&isFinite(e[0])&&isFinite(e[1]))M.set(rbK(e[0]|0,e[1]|0),{c:CROPS[e[2]]?e[2]:null,g:Math.max(0,+e[3]||0),w:+e[4]||0,e:+e[5]||nowS()})}}}
{const _ng=newGame;newGame=function(){for(const id in RF)delete RF[id];_ng()}}
// others see them
{const _rp=rbPub;rbPub=function(){const o=_rp()||{};const f={};for(const id in RF){const a=[];for(const[k,p]of RF[id]){const[x,y]=rbXY(k);a.push([x,y,p.c||'',p.c?stageOf(p):0,wet(p)?1:0,p.e|0])}if(a.length)f[id]=a}if(Object.keys(f).length)o._f=f;return Object.keys(o).length?o:null}}
// region builds can't go on a plot
{const _ro=rbOpen;rbOpen=function(R,x,y){if(rfMap(R.region).has(rbK(x,y))||rfForeign(R.region).has(rbK(x,y)))return false;return _ro(R,x,y)}}
window.SQRF={RF,rbR,rfCanTill,rfMap,rbK};
// ---- Developer commands (only for the game's owner account; checked by a hash of the signed-in email) ----
// Type in chat: /dev for the list. /give <item> [n], /find <text>, /gold <n>, /xp <skill> <n>, /heal,
// /boss <dragon|demon|giant|wisp> [hp] spawns a private world boss right next to you (only you see it; full loot),
// /boss off removes it.
{const DEVH='aff058455fade890eb657f9ab77ae1fcb2aa28ff218bb6c17bb37427a999d121';let devOK=false,devFor='';
 async function devCheck(){const u=MP.user;if(!u||!u.email){devOK=false;return}if(devFor===u.uid+u.email)return;devFor=u.uid+u.email;try{devOK=sha256hex(u.email.toLowerCase())===DEVH}catch(e){devOK=false}}
 // a small SHA-256 (works on any page, secure or not)
 function sha256hex(str){const b=new TextEncoder().encode(str),K=[],H=[];let n=2,c=0;const fr=x=>(x-Math.floor(x))*4294967296|0;
  while(c<64){let p=true;for(let f=2;f*f<=n;f++)if(n%f===0){p=false;break}if(p){if(c<8)H[c]=fr(Math.pow(n,1/2));K[c++]=fr(Math.pow(n,1/3))}n++}
  const L=b.length,m=new Uint8Array(((L+9+63)>>6)<<6);m.set(b);m[L]=0x80;const bits=L*8;for(let i=0;i<4;i++)m[m.length-1-i]=bits>>>(8*i)&255;
  const w=new Int32Array(64),r=(x,k)=>x>>>k|x<<(32-k);
  for(let o=0;o<m.length;o+=64){for(let i=0;i<16;i++)w[i]=m[o+4*i]<<24|m[o+4*i+1]<<16|m[o+4*i+2]<<8|m[o+4*i+3];
   for(let i=16;i<64;i++){const a=w[i-15],d=w[i-2];w[i]=(r(a,7)^r(a,18)^a>>>3)+w[i-7]+(r(d,17)^r(d,19)^d>>>10)+w[i-16]|0}
   let[a,bb,cc,d,e,f,g,h]=H;for(let i=0;i<64;i++){const t1=h+(r(e,6)^r(e,11)^r(e,25))+(e&f^~e&g)+K[i]+w[i]|0,t2=(r(a,2)^r(a,13)^r(a,22))+(a&bb^a&cc^bb&cc)|0;h=g;g=f;f=e;e=d+t1|0;d=cc;cc=bb;bb=a;a=t1+t2|0}
   H[0]=H[0]+a|0;H[1]=H[1]+bb|0;H[2]=H[2]+cc|0;H[3]=H[3]+d|0;H[4]=H[4]+e|0;H[5]=H[5]+f|0;H[6]=H[6]+g|0;H[7]=H[7]+h|0}
  return H.map(x=>(x>>>0).toString(16).padStart(8,'0')).join('')}
 setInterval(devCheck,2000);
 const out=t=>mpLog('game',t);
 const norm=t=>String(t).toLowerCase().replace(/[^a-z0-9]/g,'');
 function findItems(q){const nq=norm(q),keys=Object.keys(INAME).filter(k=>INAME[k]);const ex=keys.find(k=>k.toLowerCase()===q.toLowerCase())||keys.find(k=>norm(INAME[k])===nq);if(ex)return[ex];
  return keys.filter(k=>norm(INAME[k]).includes(nq)||norm(k).includes(nq))}
 const skillIdx=q=>{const nq=norm(q);let i=SKN.findIndex(n=>norm(n)===nq);if(i<0)i=SKN.findIndex(n=>norm(n).startsWith(nq));return i};
 function dev(cmd,args){
  if(cmd==='dev'||cmd==='devhelp'){out('Dev: /give item [n] · /give skill xp [books] (XP book, e.g. /give fishing 1000) · /find text · /gold n · /xp skill n · /heal · /boss dragon|demon|giant|wisp [hp] · /boss off · /castle · /pet wolf|briar|snow|void|tree|oak|willow|maple|yew|pine|voidtree|dead|imp · /give sledgehammer');return}
  if(cmd==='castle'){inv.castle=(inv.castle|0)+1;out('Gave you a Castle. Open your Bag, pick it and press PLACE.');saveLocal(true);if(pnOpen)rPn();return}
  if(cmd==='pet'){const PK={wolf:'pwolf',briar:'pbriar',snow:'psnow',void:'pvoid',tree:'ptree',treeling:'ptree',oak:'ptoak',willow:'ptwil',maple:'ptmap',yew:'ptyew',pine:'ptpine',voidtree:'ptvoid',dead:'ptdead',imp:'imp'},k=PK[(args[0]||'').toLowerCase()];
   if(!k){out('Usage: /pet wolf|briar|snow|void|tree|oak|willow|maple|yew|pine|voidtree|dead|imp');return}if(k==='imp'){if(window.LUX&&LUX.giveImp)LUX.giveImp();out('Gave you the Imp pet.');return}
   if(window.SQGIVEPET)SQGIVEPET(k);out('Gave you a pet '+((window.SQNPET&&SQNPET[k].n)||k).toLowerCase()+'.');return}
  if(cmd==='find'){const q=args.join(' ');if(!q){out('Usage: /find text');return}const r=findItems(q);out(r.length?r.slice(0,12).map(k=>k+' = '+INAME[k]).join(' · ')+(r.length>12?' · (+'+(r.length-12)+' more)':''):'No items match "'+q+'".');return}
  if(cmd==='give'&&args.length>=2&&/^\d+$/.test(args[1])){const si=SKN.findIndex(x=>norm(x)===norm(args[0]));if(si>=0){const xp=Math.min(5e7,Math.max(1,+args[1])),c=Math.min(1000,Math.max(1,parseInt(args[2])||1)),k='xpb_'+si+'_'+xp;sqBookReg(k);inv[k]=(inv[k]|0)+c;out('Gave you '+c+' × '+INAME[k]+'. Read it from your Bag. It can be traded and sold at the World Market.');saveLocal(true);if(pnOpen)rPn();return}}
  if(cmd==='give'){let n=1;if(args.length>1&&/^\d+$/.test(args[args.length-1]))n=Math.min(100000,+args.pop());const q=args.join(' ');if(!q){out('Usage: /give item [n]');return}
   const r=findItems(q);if(r.length!==1){out(r.length?'Which one? '+r.slice(0,10).map(k=>k+' = '+INAME[k]).join(' · '):'No items match "'+q+'". Try /find.');return}
   const k=r[0];inv[k]=(inv[k]|0)+n;out('Gave you '+n+' × '+INAME[k]+'.');saveLocal(true);if(pnOpen)rPn();return}
  if(cmd==='gold'){const n=Math.min(1e7,Math.max(0,parseInt(args[0])||0));GLD+=n;out('Gave you '+n+' gold.');saveLocal(true);return}
  if(cmd==='xp'){const n=parseInt(args[args.length-1]);const i=skillIdx(args.slice(0,-1).join(' '));if(i<0||!(n>0)){out('Usage: /xp skill amount   (skills: '+SKN.join(', ')+')');return}addXp(i,Math.min(5e7,n));out('Gave '+n+' '+SKN[i]+' XP.');return}
  if(cmd==='heal'){P.hp=6;hunger=100;try{MANA=maxMP()}catch(e){}out('Healed.');return}
  if(cmd==='boss'){const t=(args[0]||'').toLowerCase();
   if(t==='off'||t==='end'||t==='stop'){if(window.SQWBFORCE&&SQWBFORCE.dev){window.SQWBFORCE=null;out('Dev boss removed.')}else out('No dev boss is up.');return}
   if(!WBT[t]){out('Usage: /boss dragon|demon|giant|wisp [hp]  ·  /boss off');return}if(SCENE&&!SCENE.room.region){out('Go outside first.');return}
   const hp=Math.max(1,Math.min(200000,parseInt(args[1])||WBT[t].hp));
   window.SQWBFORCE={dev:1,type:t,where:curRegion(),slot:900000000+Math.floor(Math.random()*90000000),start:wbNow()-1,hp,at:{x:Math.round(P.x+face[0]*70),y:Math.round(P.y+face[1]*70+(face[0]?0:10))}};
   WB.told=-1;out('Spawned a '+WBT[t].n+' ('+hp+' HP) just in front of you. Only you can see it. /boss off to remove it.');return}
  return false}
 const _s=mpSend;mpSend=function(t){const m=String(t||'').trim().match(/^\/(\w+)\s*(.*)$/);if(m&&devOK){const c=m[1].toLowerCase(),a=m[2].trim()?m[2].trim().split(/\s+/):[];
   if(['dev','devhelp','give','find','gold','xp','heal','boss','castle','pet'].includes(c)){try{dev(c,a)}catch(e){out('Dev command failed: '+e.message)}return}}return _s(t)};
 window.SQDEV=()=>devOK}
