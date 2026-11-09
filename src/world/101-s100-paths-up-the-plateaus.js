// ---- 100. Paths up the plateaus ----
// Big rock plateaus (Ironcrest's mountain spine, No Man's Land's mesas, Ashfall's ridges) used to be solid walls. Now
// the whole top of every big plateau is walkable, right up to its edges. A thin strip along each edge stops you
// walking off (the cliff face on the south side), and wide stone stairways climb the cliff faces from the ground.
// The ground is still rock, so the plateaus keep their look. The tops get some ore, rocks and the odd tree or cactus.
{const _rf=rgFinish;rgFinish=function(C){try{plateaus(C)}catch(e){console.warn('plateaus',e)}const G=_rf(C);
  if(C.plat)for(let i=0;i<C.N2;i++)if(C.plat[i]&&!C.O[i]&&!C.lmSolid[i])G.solid.delete(i);G.plat=C.plat||null;G.platSt=C.platSt||[];return G};
 const PICK={ironcrest:r=>r<.022?'ore':r<.032?'rock':r<.05?'pine':null,nomans:r=>r<.016?'rock':r<.028?'ore':r<.038?'cactus':r<.043?'tree:dead':null,
  ashfall:r=>r<.022?'ore':r<.032?'rock':null,briarwood:r=>r<.02?'ore':r<.03?'rock':r<.05?'pine':null,shattered:r=>r<.024?'ore':r<.034?'rock':null};
 const D4=[[0,1],[0,-1],[1,0],[-1,0]];
 function plateaus(C){const{W,H,T,O}=C,N=W*H,id=C.D&&C.D.id||'',rock=i=>T[i]===3&&!C.lmSolid[i]&&!O[i],open=i=>RG_WALK[T[i]]&&!O[i]&&!C.lmSolid[i];
  const plat=new Uint8Array(N),st=[],seen=new Uint8Array(N);
  for(let s=0;s<N;s++){if(!rock(s)||seen[s])continue;const x0=s%W,y0=(s/W)|0;if(x0<2||y0<3||x0>W-3||y0>H-3)continue;const grp=[s];seen[s]=1;
   for(let k=0;k<grp.length;k++){const j=grp[k],x=j%W,y=(j/W)|0;for(const[a,b]of D4){const n=j+b*W+a;if(x+a<2||x+a>W-3||y+b<3||y+b>H-3)continue;if(rock(n)&&!seen[n]){seen[n]=1;grp.push(n)}}}
   const inG=new Set(grp);let inner=0;for(const g of grp)if(D4.every(([a,b])=>inG.has(g+b*W+a)))inner++;if(grp.length<30||inner<10)continue;
   // stairways climb a cliff face (a rock tile with open ground right below it and plateau above it)
   const face=r=>inG.has(r)&&open(r+W)&&inG.has(r-W)&&inG.has(r-2*W);
   const cand=[];for(const r of grp){if(!face(r))continue;const o=r+W;let room=0;for(const[c,d]of D4)if(open(o+d*W+c))room++;if(room<3)continue;
    let two=face(r+1)?r+1:face(r-1)?r-1:null;
    // the top of the stairs needs open plateau on both sides (two rows up), or the edge would pinch the way up
    const roomy=(a,b)=>{for(let k=1;k<=2;k++)for(let x=a-1;x<=b+1;x++)if(!inG.has(x-k*W))return false;return true};
    if(two!=null&&!roomy(Math.min(r,two),Math.max(r,two)))two=null;if(two==null&&!roomy(r,r))continue;
    cand.push({r,two,sc:(two!=null?3:0)+(T[o]===14||T[o+W]===14?3:0)+(open(o+W)&&open(o+2*W)?1:0)+C.rnd()*2})}
   let side=[];if(!cand.length){// no cliff face to climb: a ramp up one of the other edges instead
    for(const r of grp)for(const[a,b]of[[1,0],[-1,0],[0,-1]]){const o=r+b*W+a;if(!open(o)||!inG.has(r-b*W-a))continue;side.push({r,a,b,sc:C.rnd()})}side.sort((p,q)=>q.sc-p.sc);side=side.slice(0,1)}
   cand.sort((p,q)=>q.sc-p.sc);const want=Math.min(9,1+Math.floor(grp.length/90)),got=[];
   for(const c of cand){if(got.length>=want)break;const cx=c.r%W,cy=(c.r/W)|0;if(got.some(q=>Math.abs(q.r%W-cx)+Math.abs(((q.r/W)|0)-cy)<13))continue;got.push(c)}
   if(!got.length&&!side.length)continue;
   for(const g of grp)plat[g]=1;
   for(const c of got)for(const r of c.two!=null?[c.r,c.two]:[c.r]){st.push([r,0,-1]);C.keep[r]=1;C.keep[r+W]=1;C.O[r+W]=null}
   for(const c of side){st.push([c.r,c.a,c.b<0?1:c.b]);C.keep[c.r]=1}// (a ramp up the back edge is stored as b=1: south stairways are b=-1)
   // scatter a little on the open tops, away from the edges and the stairways
   const near=(g,d)=>st.some(q=>Math.abs(q[0]%W-g%W)+Math.abs(((q[0]/W)|0)-((g/W)|0))<d);
   for(const g of grp){if(C.keep[g])continue;let all=1;for(let b=-1;b<=1&&all;b++)for(let a=-1;a<=1;a++)if(!inG.has(g+b*W+a)){all=0;break}if(!all||near(g,4))continue;
    const p=(PICK[id]||PICK.ashfall)(C.rnd());if(p){const[t,v]=p.split(':');O[g]={t,hp:OHP[t]||3,v:v||undefined}}}
   // nothing on top may wall off part of the plateau from its stairs
   const starts=st.filter(q=>inG.has(q[0])).map(q=>q[0]);for(let pass=0;pass<30;pass++){const re=new Set(starts),q=[...starts];
    for(let k=0;k<q.length;k++){const j=q[k];for(const[a,b]of D4){const n=j+b*W+a;if(inG.has(n)&&!O[n]&&!re.has(n)){re.add(n);q.push(n)}}}
    const cut=new Set();for(const g of grp){if(O[g]||re.has(g))continue;for(const[a,b]of D4){const n=g+b*W+a;if(O[n]&&inG.has(n)&&D4.some(([c,d])=>re.has(n+d*W+c))){cut.add(n)}}}
    if(!cut.size)break;for(const n of cut)O[n]=null}}
  C.plat=plat;C.platSt=st}
 window.SQPLAT=plateaus;
 // edges: which sides of each plateau tile drop to lower ground (1 N, 2 S, 4 W, 8 E). Stair tiles are open on the stair side.
 function edges(R){if(R._pe!==undefined)return R._pe;const P=R.plat;if(!P)return R._pe=null;const W=R.w,E=new Uint8Array(W*R.h),sd=new Map(R.platSt.map(q=>[q[0],q]));
  for(let i=0;i<W*R.h;i++){if(!P[i])continue;let m=0;if(!P[i-W])m|=1;if(!P[i+W])m|=2;if(!P[i-1])m|=4;if(!P[i+1])m|=8;const q=sd.get(i);if(q)m=0;E[i]=m}return R._pe=E}
 const _so=solid;solid=function(px,py){if(_so(px,py))return true;const R=SCENE&&SCENE.room;if(!R||!R.plat)return false;const x=Math.floor(px/16),y=Math.floor(py/16),i=y*R.w+x,E=edges(R);if(!E)return false;
  const P=R.plat;if(!P[i])return false;const m=E[i];if(!m)return false;const lx=px-x*16,ly=py-y*16;return(m&1&&ly<5)||(m&2&&ly>=7)||(m&4&&lx<5)||(m&8&&lx>=11)};
 // the stairways: stone steps from the plateau top down the cliff face to the ground
 const _ro=rgOverlay;rgOverlay=function(R,v){_ro(R,v);const S=R.platSt;if(!S||!S.length)return;const W=R.w,has=R._pss||(R._pss=new Set(S.map(q=>q[0])));
  const ST=R.region==='nomans'?['#5a4434','#7e6450','#a48a70','#c8ae90','#3a2a1e']:R.region==='ashfall'?['#3a3430','#56504a','#7a726a','#9a928a','#221e1a']:['#4e4a46','#6e6a64','#928c84','#b4aea4','#2e2a26'];
  for(const[i,a,b]of S){const X=(i%W)*16,Y=((i/W)|0)*16;if(X<v.x0-32||X>v.x1+16||Y<v.y0-32||Y>v.y1+32)continue;
   if(b<0){// down the face: from 2px into the top, past the cliff, onto the ground below
    const y0=Y+2,y1=Y+16+5,L=!has.has(i-1),Rt=!has.has(i+1);Rg(X,y0,16,y1-y0,ST[1]);
    for(let k=0;k<5;k++){const ty=y0+k*4;Rg(X,ty,16,1,ST[3]);Rg(X,ty+1,16,2,ST[2]);Rg(X,ty+3,16,1,ST[0])}
    Rg(X,y1,16,1,'rgba(0,0,0,.25)');Rg(X,y1+1,16,1,'rgba(0,0,0,.12)');
    if(L){Rg(X,y0,2,y1-y0,ST[4]);Rg(X+2,y0,1,y1-y0,ST[0])}if(Rt){Rg(X+14,y0,2,y1-y0,ST[4]);Rg(X+13,y0,1,y1-y0,ST[0])}}
   else{// a ramp over a side or the back edge
    const vert=b!==0;Rg(X,Y,16,16,ST[1]);for(let k=0;k<4;k++){if(vert){Rg(X,Y+k*4,16,1,ST[3]);Rg(X,Y+k*4+3,16,1,ST[0])}else{const tx=a>0?X+k*4:X+15-k*4;Rg(tx,Y,1,16,ST[3]);Rg(tx+(a>0?3:-3),Y,1,16,ST[0])}}}}}}
