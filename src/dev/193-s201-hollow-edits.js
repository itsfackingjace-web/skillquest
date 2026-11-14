// ---- 201. Editing Hollow Island (Dev Suite > Islands > Built-in islands > Hollow Island) ----
// islands.ed_hollow = the same format as 111g's built-in island edits ({bi:'hollow', n, w:220, h:220, x:"i.t.o;...", ul}),
// but Hollow isn't a generated region: it is 001's tile[]/obj[] (ground 0 water, 1 sand, 2 grass, 3 mountain, 4 snow,
// 5 desert). This file keeps the island as the game made it (ORIG, taken when the script has run, before any library is
// applied), applies the patch onto tile/obj on every library apply (cells of the previous patch are put back first), and
// throws away the baked ground (032's HDCK) and the map picture (052's HMAP).
// Since Nov 14 also everything the other islands can hold: lm (buildings/props/signs/loot chests), npc (people), cv (dungeon
// entrances, kinds cv_hollow_e<k> in SQICV/DKIND, `dg` = a Dungeons-tab design), zn (monster zones) and ct + c (own ground tiles).
// They live in ITEMS (room-style items: drawn by drawFurn through 002's LHOOK, solid through the outermost solid() via SOL,
// used by talk/TALK/✕ like on islands; npcs through 117's npcs()/talkTo, which ask window.SQHOLLOWP when outdoors on Hollow).
// Locked cells: HARD = where the game's own solid() disagrees with ground/objects (buildings, walls, bridges, piers) plus
// one tile around them, never changed; SOFT = special objects the builder can't place (gold/mithril/adamant veins,
// boulders, obsidian...), changed only with "Unlock".
(()=>{if(!window.SQA||!A0())return;function A0(){return window.SQA&&SQA.islandEdits}
 const A=SQA,X=A.islandEdits,PXC=A.PXC,HEX='0123456789abcdef',OK=new Set(['tree','pine','oak','willow','maple','yew','bush','nutbush','shroom','rock','ore','cactus']);
 const NN=N*N,OT=tile.slice(),OO=obj.map(o=>o?Object.assign({},o):null),HARD=new Uint8Array(NN),SOFT=new Uint8Array(NN);
 try{const hard0=new Uint8Array(NN);for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,b=tile[i]===0||!!obj[i];let s=b;try{s=!!solid(x*T+8,y*T+8)}catch(e){}if(s!==b)hard0[i]=1}
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let h=0;for(let b=-1;b<=1&&!h;b++)for(let a=-1;a<=1;a++){const xx=x+a,yy=y+b;if(xx>=0&&yy>=0&&xx<N&&yy<N&&hard0[yy*N+xx]){h=1;break}}HARD[y*N+x]=h}
  for(let i=0;i<NN;i++)if(OO[i]&&!OK.has(OO[i].t))SOFT[i]=1}catch(e){console.warn('hollow edits',e)}
 let CUR=[],LAST='';
 function restore(){for(const i of CUR){tile[i]=OT[i];obj[i]=OO[i]?Object.assign({},OO[i]):null}CUR=[]}
 function apply(E){const UL=!!(E&&E.ul);for(const[i,t,c]of X.parse(E||{})){if(i<0||i>=NN||HARD[i]||(SOFT[i]&&!UL))continue;let ch=false;
   if(t>=0&&t<=5&&tile[i]!==t){tile[i]=t;ch=true}
   if(c==='.'){if(obj[i])ch=true;obj[i]=null}
   else if(c){const k=A.ISL_OBJ[PXC.indexOf(c)];const ot=k&&k.split(':')[0];if(ot&&OK.has(ot)){obj[i]=tile[i]!==0?{t:ot,hp:OHP[ot]||3}:null;ch=true}}
   else if(t>=0&&tile[i]===0&&obj[i]){obj[i]=null;ch=true}
   if(ch||t>=0||c)CUR.push(i)}}
 // ---- places: buildings, props, signs, chests, people, dungeon entrances, zones, own tiles ----
 const ITEMS=[],SOL=new Set(),ZN=[];let LAY=null,CT=[];const MINE={};
 const clean=(v,n)=>String(v==null?'':v).replace(/[<>&"]/g,'').slice(0,n),arr=v=>Array.isArray(v)?v:(v&&typeof v==='object'?Object.values(v):[]);
 const NL={sk:5,hs:4,hc:8,sh:8,pn:6,ht:3,hcol:6,so:5},look=L=>{const o={};for(const k in NL){const v=L&&L[k]|0;o[k]=v>=0&&v<NL[k]?v:0}return o};
 function places(E){ITEMS.length=0;SOL.clear();ZN.length=0;LAY=null;CT=[];const IC=window.SQICV;
  for(const k in MINE){try{delete IC[k];delete DKIND[k]}catch(e){}delete MINE[k]}if(!E)return;const UL=!!E.ul;
  const okc=i=>i>=0&&i<NN&&!HARD[i]&&!(SOFT[i]&&!UL)&&!SOL.has(i);
  const free=(x,y,w,h)=>{for(let b=0;b<h;b++)for(let a=0;a<w;a++){const xx=x+a,yy=y+b;if(xx<0||yy<0||xx>=N||yy>=N||!okc(yy*N+xx))return false}return true};
  const clear=i=>{if(obj[i]){obj[i]=null}CUR.push(i)};
  arr(E.lm).slice(0,200).forEach((L,ci)=>{if(!L||!A.ISL_LM[L.k])return;const[,w,h,v]=A.ISL_LM[L.k],x=L.x|0,y=L.y|0;if(!free(x,y,w,h))return;
   const it={t:'lm',k:L.k.split(':')[0],x,y,w,h,sh:h};if(v!==undefined)it.v=v;
   if(L.k==='chest'){it.use='loot';it.ci=1000+ci;it.loot=L.loot||{};it.name=clean(L.n,40)||'Chest'}else if(L.k==='sign'||L.tx){it.use='look';it.name=clean(L.n,40)||A.ISL_LM[L.k][0];it.text=clean(L.tx,300)||it.name}
   for(let b=0;b<h;b++)for(let a=0;a<w;a++){const i=(y+b)*N+x+a;clear(i);SOL.add(i)}ITEMS.push(it)});
  arr(E.npc).slice(0,60).forEach((Q,k)=>{if(!Q)return;const x=Q.x|0,y=Q.y|0;if(!free(x,y,1,1))return;const i=y*N+x;clear(i);SOL.add(i);
   ITEMS.push({t:'lm',k:'npc',x,y,w:1,h:1,use:'npc',ni:k,name:clean(Q.n,24)||'Villager',look:look(Q.lk),lines:arr(Q.s).map(l=>clean(l,160)).filter(Boolean).slice(0,8),ro:clean(Q.ro,120)})});
  arr(E.cv).slice(0,6).forEach((V,k)=>{if(!V)return;const x=V.x|0,y=V.y|0;if(x<1||y<1||x>=N-1||y>=N-1||!free(x-1,y-1,3,2))return;
   for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const j=(y+b)*N+x+a;if(!okc(j))continue;clear(j);if(tile[j]===0){tile[j]=2}}
   for(const[a,b]of[[-1,0],[1,0],[-1,-1],[0,-1],[1,-1]])SOL.add((y+b)*N+x+a);const kind='cv_hollow_e'+k;
   ITEMS.push({t:'icvdoor',kind,x,y,name:clean(V.n,40)||'Hidden Cave',use:'icv',w:1,h:1});
   if(IC&&typeof DKIND!=='undefined'&&A.CAVE_ST){const st=A.CAVE_ST[V.st]||A.CAVE_ST.rock,keys=arr(V.m).filter(m=>typeof m==='string'&&/^[a-z]+(:[a-z0-9_]+)?$/.test(m)).slice(0,6);
    const mob=keys.length?keys.map((m,j)=>[m,(j+1)/keys.length]):[['bat',.5],['slime',1]];
    IC[kind]=DKIND[kind]=Object.assign({},st,{name:clean(V.n,40)||'Hidden Cave',rg:'hollow',floors:Math.max(1,Math.min(6,V.f|0||3)),noboss:1,mob,ore:V.st==='mine'?null:4});
    if(V.st!=='mine')delete IC[kind].mine;if(typeof V.dg==='string'&&/^dg_[a-z0-9_]{1,30}$/.test(V.dg))IC[kind].dgw=V.dg;MINE[kind]=1}});
  arr(E.zn).slice(0,24).forEach((Z,k)=>{if(Z)ZN.push({k:'h'+k,x:Z.x|0,y:Z.y|0,w:Math.max(1,Z.w|0),h:Math.max(1,Z.h|0),m:arr(Z.m).filter(m=>typeof m==='string').slice(0,6),n:Math.max(1,Math.min(12,Z.n|0||4)),hp:Z.hp|0})});
  CT=arr(E.ct).slice(0,8);if(CT.length&&typeof E.c==='string'){try{const s2=A.unpack(E.c);if(s2.length===NN)LAY=s2}catch(e){}}}
 const R0={region:'hollow',get items(){return ITEMS},get useItems(){return ITEMS.filter(it=>it.use)}};
 const onHollow=()=>!SCENE&&!(typeof TRAVEL49!=='undefined'&&TRAVEL49);
 function redraw(){try{HDCK.clear()}catch(e){}try{HMAPK='';HMAPT=-1e9}catch(e){}}
 A.onApply(lib=>{const E=lib&&lib.islands&&lib.islands.ed_hollow;const s=E&&typeof E==='object'&&E.bi==='hollow'?JSON.stringify(E):'';if(s===LAST)return;LAST=s;
  restore();if(s)try{apply(E)}catch(e){console.warn('hollow edits',e)}try{places(s?E:null)}catch(e){console.warn('hollow places',e)}redraw();
  // standing inside something now (a painted tree or water): step to the nearest free land tile
  try{if(!SCENE&&P&&solid(P.x,P.y)){const tx=Math.floor(P.x/T),ty=Math.floor(P.y/T);out:for(let r=1;r<20;r++)for(let b=-r;b<=r;b++)for(let a=-r;a<=r;a++){if(Math.max(Math.abs(a),Math.abs(b))!==r)continue;const x=tx+a,y=ty+b;if(x<0||y<0||x>=N||y>=N)continue;if(!solid(x*T+8,y*T+8)){P.x=x*T+8;P.y=y*T+8;break out}}}}catch(e){}});
 // the builder's starting point: Hollow as the game made it
 const _b=X.base;X.base=function(id){if(id!=='hollow')return _b.apply(this,arguments);const items=[];
  for(let i=0;i<NN;i++){const o=OO[i];if(o)items.push({t:'_obj',o:{t:o.t,v:o.v},x:i%N,y:(i/N)|0})}
  const keep=new Uint8Array(NN);for(let i=0;i<NN;i++)keep[i]=HARD[i]||SOFT[i]?1:0;return{tiles:OT,items,_keep:keep}};
 // drawing (y-sorted with the world's objects), walls, and the own tiles over the ground
 {const _lh=LHOOK;LHOOK=function(L,x0,y0,x1,y1,tm){if(_lh)_lh(L,x0,y0,x1,y1,tm);if(SCENE||!ITEMS.length)return;
   for(const it of ITEMS){if(it.x+(it.w||1)<x0-2||it.x>x1+2||it.y+(it.h||1)<y0-2||it.y>y1+6)continue;L.push([(it.y+(it.h||1))*T-(it.k==='npc'?6:2),4,t2=>{try{drawFurn(it,t2)}catch(e){}}])}}}
 {const _s=solid;solid=function(px,py){if(!SCENE&&SOL.size){const x=Math.floor(px/T),y=Math.floor(py/T);if(SOL.has(y*N+x))return true}return _s.apply(this,arguments)}}
 const IMG=new Map(),img=u=>{let m=IMG.get(u);if(!m){m=new Image();m.src=u;IMG.set(u,m)}return m.complete&&m.naturalWidth?m:null};
 {const _gh=GROUNDHOOK;GROUNDHOOK=function(x0,y0,x1,y1,tm){if(_gh)_gh(x0,y0,x1,y1,tm);if(SCENE||!LAY)return;const ok=window.SQISLIFE&&SQISLIFE.okUrl||(()=>true);g.imageSmoothingEnabled=false;
   for(let y=Math.max(0,y0-1);y<=Math.min(N-1,y1+1);y++)for(let x=Math.max(0,x0-1);x<=Math.min(N-1,x1+1);x++){const ch=LAY[y*N+x];if(!ch||ch==='.')continue;const T2=CT[HEX.indexOf(ch)];if(!T2||!ok(T2.p))continue;const m=img(T2.p);if(m)g.drawImage(m,x*T,y*T,T,T)}}}
 // using things: TALK / T / ✕ on the thing in front of you (signs, chests); walking up into a dungeon entrance goes in
 const front=()=>{const fx=P.x+face[0]*14,fy=P.y+face[1]*14,tx=Math.floor(fx/T),ty=Math.floor(fy/T);let best=null,bd=22;
  for(const it of ITEMS){if(!it.use||it.use==='npc'||it.use==='icv')continue;const inside=tx>=it.x&&ty>=it.y&&tx<it.x+(it.w||1)&&ty<it.y+(it.h||1);
   const d=Math.hypot(Math.max(it.x*T,Math.min(P.x,(it.x+(it.w||1))*T))-P.x,Math.max(it.y*T,Math.min(P.y,(it.y+(it.h||1))*T))-P.y);if(inside)return it;if(d<bd){bd=d;best=it}}return best};
 const useIt=()=>{const it=onHollow()&&!pnOpen&&!menuOpen&&!dead?front():null;if(!it)return false;try{useFurn(it)}catch(e){console.warn(e)}return true};
 {const _t=talk;talk=function(){if(useIt())return;return _t.apply(this,arguments)}}
 tk.addEventListener('touchstart',e=>{if(!onHollow()||pnOpen||menuOpen||dead)return;const it=front();if(it&&mineTk){e.preventDefault();e.stopImmediatePropagation();useIt()}},{passive:false,capture:true});
 {const _pu=window.SQPADUSE;window.SQPADUSE=()=>(onHollow()&&!!front())||!!(_pu&&_pu())}
 let mineTk=false,zt=0;const KEEP=new Set(),TOUGH=[1,1.6,2.4,3.5];
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{
   const it=onHollow()&&!pnOpen&&!menuOpen&&!dead&&ITEMS.length?front():null;
   if(it&&(tk.style.display==='none'||mineTk)){tk.style.display='flex';const lab=(it.use==='loot'?'OPEN':'READ')+(isPC?'<small>T</small>':(typeof GPON!=='undefined'&&GPON?'<small>✕</small>':''));if(tk.innerHTML!==lab)tk.innerHTML=lab;mineTk=true}
   else if(!it&&mineTk){mineTk=false;if(!pnOpen)tk.style.display='none'}
   if(onHollow()&&!dead&&!menuOpen&&!pnOpen&&face[1]<0)for(const d of ITEMS)if(d.use==='icv'&&Math.abs(P.x-(d.x*16+8))<8&&P.y<(d.y+1)*16+2&&P.y>d.y*16){try{icvEnter(d)}catch(e){console.warn(e)}break}
   // monster zones: topped up while you're within 30 tiles; daylight doesn't melt them, town clearing doesn't take them
   if(!onHollow()){if(KEEP.size)KEEP.clear()}else{
    for(const m of KEEP){if(m.dead||m.hp<=0){KEEP.delete(m);continue}if(!en.includes(m)&&Math.hypot(m.x-P.x,m.y-P.y)<420)en.push(m)}
    if(!dead&&!menuOpen&&!pnOpen&&ZN.length&&(zt-=dt)<=0){zt=1;const ML=window.SQISLIFE&&SQISLIFE.MOBS||{},ptx=P.x/16,pty=P.y/16;
     for(const Z of ZN){const ms=Z.m.filter(m=>ML[m]);if(!ms.length)continue;const mine=[...KEEP].filter(n=>n.zi===Z.k);
      if(ptx<Z.x-30||ptx>Z.x+Z.w+30||pty<Z.y-30||pty>Z.y+Z.h+30){for(const n of mine)if(Math.hypot(n.x-P.x,n.y-P.y)>420){n.dead=1;n.dropped=1;KEEP.delete(n)}continue}
      if(mine.length>=Z.n)continue;
      for(let t=0;t<12;t++){const x=Z.x+Math.floor(Math.random()*Z.w),y=Z.y+Math.floor(Math.random()*Z.h),px=x*16+8,py=y*16+8;if(solid(px,py)||Math.hypot(px-P.x,py-P.y)<120)continue;
       const m=ms[Math.floor(Math.random()*ms.length)],hp=Math.round(ML[m].hp*(TOUGH[Z.hp]||1)),n=rgMake(m,hp,px,py);if(!n)break;n.mhp=n.mhp||hp;if(ML[m].rg)n.rg=ML[m].rg;n.zc='hollow';n.zi=Z.k;delete n.night;try{RG_OWN.add(n)}catch(e){}en.push(n);KEEP.add(n);break}}}
    if(KEEP.size&&typeof dark==='function'&&dark()<.05)for(const m of KEEP)m.hp=Math.min(m.mhp||m.hp,m.hp+dt*.5)}
  }catch(e){console.warn('hollow places',e)}return out}}
 window.SQHOLLOWP={R:R0,get items(){return ITEMS},npcs:()=>ITEMS.filter(it=>it.k==='npc'),get zones(){return ZN},KEEP,front};
 X.hollowOK=true;X.hollowHard=HARD;X.HOLOBJ=OK;window.SQHOLLOWED={HARD,SOFT,OT,OO,get cur(){return CUR.length}}})();
