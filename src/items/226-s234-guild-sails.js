// ---- 234. Guild sails ----
// Guild members can fly their guild's colours on their boat: START > Style > Boat (a section added after 085's Style screen).
// The sails take the guild cape's design (201's SQGCAPE.design(): main colour, second colour, pattern, trim, emblem + emblem
// colour) and keep the boat's own shading. Saved as `gsw` (always written). Other players see them: gearCH carries the design as
// slc (main+1), sls, slp, slt, sle, slx (061's cleanCh keeps numbers 0-99), only while worn and in a guild.
// Drawing: the outermost drawBoat26 (you, or another player with P/face swapped in by 061) works out whose boat it is (a sailing
// player standing exactly at P, else you) and sets CURD for the call; BOAT85.back is wrapped to return a recoloured copy of the
// sail layer (SA sail colours → main colour shades, RD band/pennant → second colour, the pattern by position in the sail's box,
// trim on the sail's edge, the emblem on the mainsail's centre), cached per canvas and design.
(()=>{if(!window.BOAT85)return;
 const SA=['#a89c88','#cfc3aa','#ece2ca','#fffaee'],RD=['#8c2018','#c03828','#e85a40'],SHF=[.66,.82,.93,1],RDF=[.72,.88,1];
 const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),key=c=>c.join(',');
 const SAK=new Map(SA.map((h,i)=>[key(hex(h)),i])),RDK=new Map(RD.map((h,i)=>[key(hex(h)),i]));
 const GC=()=>window.SQGCAPE,inGuild=()=>{const s=window.SQGUILD&&SQGUILD.state;return!!(s&&s.id&&s.info)};
 let ON=false;
 // ---- the design ----
 const fromCh=ch=>{const C=GC();if(!C||!ch||!(ch.slc>0))return null;const P=C.PAL;return{c:P[(ch.slc-1)%P.length],s:P[(ch.sls|0)%P.length],p:ch.slp|0,t:!!ch.slt,e:Math.min(C.EM.length-1,ch.sle|0),x:P[(ch.slx|0)%P.length]}};
 const mine=()=>{const C=GC();if(!ON||!C||!inGuild())return null;try{const d=C.design();return fromCh({slc:d.c+1,sls:d.s,slp:d.p,slt:d.t,sle:d.e,slx:d.x})}catch(e){return null}};
 {const _g=gearCH;gearCH=function(){const c=_g.apply(this,arguments);try{const C=GC();if(ON&&C&&inGuild()){const d=C.design();c.slc=d.c+1;c.sls=d.s;c.slp=d.p;if(d.t)c.slt=1;c.sle=d.e;c.slx=d.x}}catch(e){}return c}}
 {SQSAVE.after('226:gsw',o=>{try{o.gsw=ON?1:0}catch(e){}})}
 {SQLOAD.after('226',(S)=>{try{ON=!!(S&&S.gsw)}catch(e){}})}
 {const _n=newGame;newGame=function(){ON=false;return _n.apply(this,arguments)}}
 // ---- recolouring the sail layer ----
 let CURD=null;const CACHE=new WeakMap();
 const mix=(rgb,f)=>rgb.map(v=>Math.max(0,Math.min(255,Math.round(v*f))));
 function recolor(b,D){let M=CACHE.get(b.c);if(!M)CACHE.set(b.c,M=new Map());const dk=[D.c,D.s,D.p,D.t?1:0,D.e,D.x].join('|');let r=M.get(dk);if(r)return r;
  const w=b.ww,h=b.hh,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(b.c,0,0);const im=x.getImageData(0,0,w,h),d=im.data;
  const kind=new Int8Array(w*h).fill(-1),lev=new Int8Array(w*h);let x0=w,y0=h,x1=-1,y1=-1,cx=0,cy=0,n=0;
  for(let i=0;i<w*h;i++){if(d[i*4+3]<250)continue;const k=d[i*4]+','+d[i*4+1]+','+d[i*4+2];let v=SAK.get(k);if(v!=null){kind[i]=0;lev[i]=v}else{v=RDK.get(k);if(v!=null){kind[i]=1;lev[i]=v}else continue}
   const X=i%w,Y=(i/w)|0;if(X<x0)x0=X;if(X>x1)x1=X;if(Y<y0)y0=Y;if(Y>y1)y1=Y;if(kind[i]===0){cx+=X;cy+=Y;n++}}
  if(x1<0){M.set(dk,b);return b}
  const C1=hex(D.c),C2=hex(D.s),CX=hex(D.x),bw=Math.max(1,x1-x0+1),bh=Math.max(1,y1-y0+1);
  const pat=(X,Y)=>{const u=(X-x0+.5)/bw,v=(Y-y0+.5)/bh;if(D.p===1)return u>=.5;if(D.p===2)return Math.abs(u-.5)<.12;if(D.p===3)return Math.floor(v*6)%2===1;if(D.p===4)return(u<.5)!==(v>=.5);return false};
  const sail=i=>i>=0&&i<w*h&&kind[i]>=0;
  for(let i=0;i<w*h;i++){if(kind[i]<0)continue;const X=i%w,Y=(i/w)|0;let col;
   if(kind[i]===1)col=mix(C2,RDF[lev[i]]);
   else{const edge=D.t&&(!sail(i-1)||!sail(i+1)||!sail(i-w)||!sail(i+w)||X===0||X===w-1);col=mix(edge||pat(X,Y)?C2:C1,SHF[lev[i]])}
   d[i*4]=col[0];d[i*4+1]=col[1];d[i*4+2]=col[2]}
  // the emblem: as big as fits, on a patch of cloth the sailor doesn't cover (boat coords: x = X+ox, y = Y+oy), outlined so it
  // stands out whatever the colours
  try{const E=GC().EM[D.e];if(E&&E.p&&E.p.length){const pat=E.p,L=pat.length,ox=b.ox,oy=b.oy,onS=i=>kind[i]>=0;
    const inMe=(X,Y)=>{const bx=X+ox,by=Y+oy;return bx>=-9&&bx<=9&&by>=-38&&by<=2};
    let fx=0,fy=0,fn=0;for(let i=0;i<w*h;i++)if(kind[i]===0&&!inMe(i%w,(i/w)|0)){fx+=i%w;fy+=(i/w)|0;fn++}if(fn){fx/=fn;fy/=fn}else{fx=cx/n;fy=cy/n}
    // sails seen end-on are symmetric: the emblem goes on their centre line (only its height is searched)
    let sx0=w,sx1=-1;for(let i=0;i<w*h;i++)if(kind[i]===0){const X=i%w;if(X<sx0)sx0=X;if(X>sx1)sx1=X}const mid=(sx0+sx1+1)/2,sym=Math.abs(mid+ox)<=1.5;
    const fit=(s,avoid)=>{const sz=L*s+2;let best=null,bd=1e9;const xs=sym?[Math.round(mid-sz/2)]:null;for(let Y=0;Y+sz<=h;Y++)for(const X of(xs||Array.from({length:Math.max(0,w-sz+1)},(_,k)=>k))){if(X<0||X+sz>w)continue;let ok=true;
       for(let b2=0;b2<sz&&ok;b2++)for(let a=0;a<sz;a++){const i=(Y+b2)*w+X+a;if(!onS(i)||(avoid&&inMe(X+a,Y+b2))){ok=false;break}}
       if(!ok)continue;const d=(X+sz/2-fx)**2+(Y+sz/2-fy)**2;if(d<bd){bd=d;best={X,Y,s}}}return best};
    let at=null;for(const s of(L>=8?[2,1]:[3,2]))if((at=fit(s,true)))break;if(!at)at=fit(L>=8?1:2,false)||fit(L>=8?1:1,false);
    if(at){const s=at.s,lum=CX[0]*.3+CX[1]*.59+CX[2]*.11,OL=lum>110?mix(C1,.32):mix([240,236,224],1),em=new Uint8Array((L*s+2)**2),SZ=L*s+2;
     pat.forEach((row,jj)=>{for(let k=0;k<row.length;k++)if(row[k]==='X')for(let a=0;a<s;a++)for(let bb=0;bb<s;bb++)em[(1+jj*s+bb)*SZ+1+k*s+a]=1});
     for(let yy=0;yy<SZ;yy++)for(let xx=0;xx<SZ;xx++){const i=(at.Y+yy)*w+at.X+xx;let col=null;
      if(em[yy*SZ+xx])col=mix(CX,.88+.12*lev[i]/3);
      else{let nb=false;for(let dy=-1;dy<=1&&!nb;dy++)for(let dx=-1;dx<=1;dx++){const X2=xx+dx,Y2=yy+dy;if(X2>=0&&Y2>=0&&X2<SZ&&Y2<SZ&&em[Y2*SZ+X2]){nb=true;break}}if(nb)col=OL}
      if(col){d[i*4]=col[0];d[i*4+1]=col[1];d[i*4+2]=col[2]}}}}}catch(e){}
  x.putImageData(im,0,0);r={c,ox:b.ox,oy:b.oy,ww:w,hh:h};M.set(dk,r);return r}
 {const _b=BOAT85.back;BOAT85.back=function(fc,sl,tm){const b=_b.apply(this,arguments);if(!CURD||!sl||!b)return b;try{return recolor(b,CURD)}catch(e){return b}}}
 // ---- whose boat ----
 const _db=drawBoat26;drawBoat26=function(tm){let D=null;try{const M=window.SQMP;let peer=null;
   if(M&&M.players)for(const[u,r]of M.players){if(r&&r.sl&&r.x===P.x&&r.y===P.y&&(!M.user||u!==M.user.uid)){peer=r;break}}
   D=peer?fromCh(peer.ch):mine()}catch(e){}
  const was=CURD;CURD=D;try{return _db.apply(this,arguments)}finally{CURD=was}};
 // ---- START > Style > Boat ----
 function boatPic(D){try{const was=CURD;CURD=D;let b;try{b=BOAT85.back([1,0],true,0)}finally{CURD=was}const f=BOAT85.front([1,0]);
   const ox=Math.min(b.ox,f.ox),oy=Math.min(b.oy,f.oy),W2=Math.max(b.ox+b.ww,f.ox+f.ww)-ox,H2=Math.max(b.oy+b.hh,f.oy+f.hh)-oy,c=document.createElement('canvas');c.width=W2;c.height=H2;
   const x=c.getContext('2d');x.drawImage(b.c,b.ox-ox,b.oy-oy);x.drawImage(f.c,f.ox-ox,f.oy-oy);return'<img alt="" src="'+c.toDataURL()+'" style="width:'+W2*2+'px;height:'+H2*2+'px;image-rendering:pixelated">'}catch(e){return''}}
 function section(){const ok=inGuild()&&GC(),on=ON&&ok;let gd=null;try{if(ok){const d=GC().design();gd=fromCh({slc:d.c+1,sls:d.s,slp:d.p,slt:d.t,sle:d.e,slx:d.x})}}catch(e){}
  const pk=(lab,act,sel)=>'<button class="gc sqbs" data-bsail="'+act+'" aria-pressed="'+(sel?'true':'false')+'" style="margin:3px;'+(sel?'background:#f8d878;color:#303030;box-shadow:0 0 0 3px #c88010':'opacity:.85')+'">'+(sel?'✓ ':'')+lab+'</button>';
  let h='<div class="qc" id="sqboatsec"><b>Boat</b><div style="display:flex;justify-content:center;margin:4px 0 6px">'+boatPic(on?gd:null)+'</div><div>'+pk('Plain sails','plain',!on);
  if(ok){const c=GC().PAL[GC().design().c];h+=pk('<span style="color:'+c+'">&#9632;</span> Guild sails','guild',on)}
  h+='</div>'+(ok?'<small>Guild sails match your guild\'s cape. The leader changes the design in START &gt; Guild &gt; Settings.</small>':'<small>Join a guild to fly its colours on your sails.</small>')+'</div>';return h}
 {const _r=rPn;rPn=function(){const out=_r.apply(this,arguments);try{if(pnOpen&&ptab===31&&!document.getElementById('sqboatsec'))pbd.insertAdjacentHTML('beforeend',section())}catch(e){}return out}}
 pbd.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-bsail]');if(!b||ptab!==31)return;e.stopPropagation();e.preventDefault();
  ON=b.dataset.bsail==='guild'&&inGuild();try{say(ON?'Your boat now flies the guild\'s colours.':'Plain sails it is.')}catch(x){}try{sfx('talk')}catch(x){}try{saveLocal(true)}catch(x){}rPn()},true);
 window.SQSAILS={get on(){return ON},set on(v){ON=!!v},fromCh,mine,recolor,section};
})();
