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
 {const _s=snap;snap=function(){const o=_s.apply(this,arguments);try{o.gsw=ON?1:0}catch(e){}return o}}
 {const _a=applySave;applySave=function(S){const r=_a.apply(this,arguments);try{ON=!!(S&&S.gsw)}catch(e){}return r}}
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
  // the emblem, centred on the bulk of the sail cloth
  try{const E=GC().EM[D.e];if(E&&E.p&&E.p.length&&n>40){const big=E.p.length>=8,s=big?1:2,sz=E.p.length*s,ex=Math.round(cx/n-sz/2),ey=Math.round(cy/n-sz/2);
    E.p.forEach((row,j)=>{for(let k=0;k<row.length;k++){if(row[k]!=='X')continue;for(let a=0;a<s;a++)for(let bb=0;bb<s;bb++){const X=ex+k*s+a,Y=ey+j*s+bb,i=Y*w+X;if(X<0||Y<0||X>=w||Y>=h||kind[i]!==0)continue;const col=mix(CX,SHF[lev[i]]*.5+.5);d[i*4]=col[0];d[i*4+1]=col[1];d[i*4+2]=col[2]}}})}}catch(e){}
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
