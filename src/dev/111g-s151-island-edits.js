// ---- 151. Editing the built-in islands (Dev Suite > Islands > "Built-in islands") ----
// islands.ed_<region> in the asset library = changes painted on top of a built-in island:
//   {bi: region id, n: its name, w, h, x: "i.t.o;..." changed cells (t = new ground or '' if unchanged, o = an object
//    letter as in custom islands, '.' = removed, '' = unchanged), lm: buildings/props/signs/chests, npc: people,
//    cv: dungeon entrances (dungeon kinds cv_<region>_e<i>), zn: monster zones (spawned here, see zones()), ct + c: own
//    ground tiles, ul: 1 = the protected parts (villages, harbor, landmarks) may be painted too (buildings' own tiles never)}
// Applied while the island is generated: 050's rgFinish is wrapped, and for a patched region the changes go into the
// generator's grid before it's finished. Cells the generator keeps (villages, harbors, landmarks: C.keep) are never
// touched. A patched island skips the random tree thinning/tiering (083) so it looks exactly as painted. The cached
// island is thrown away when its patch changes (never the one the player is standing on; that one changes next visit).
(()=>{if(!window.SQA)return;const A=SQA,PXC='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-',HEX='0123456789abcdef';
 const PATCH={};let OFF=null;// OFF = a region generated without its patch (the builder's starting point)
 const clean=(v,n)=>String(v==null?'':v).replace(/[<>&"]/g,'').slice(0,n);
 const arr=v=>Array.isArray(v)?v:(v&&typeof v==='object'?Object.values(v):[]);
 function parse(E){const out=[];for(const s of String(E.x||'').split(';')){if(!s)continue;const[a,b,c]=s.split('.');const i=a|0,t=b===''||b==null?-1:HEX.indexOf(b);out.push([i,t,c==null?'':c])}return out}
 const NL={sk:5,hs:4,hc:8,sh:8,pn:6,ht:3,hcol:6,so:5};const look=L=>{const o={};for(const k in NL){const v=L&&L[k]|0;o[k]=v>=0&&v<NL[k]?v:0}return o};
 function apply(C,E){const{W,H,T,O}=C,UL=!!E.ul;for(const[i,t,c]of E.cells||(E.cells=parse(E))){if(i<0||i>=W*H||(C.keep[i]&&!UL)||C.lmSolid[i])continue;
   if(t>=0&&t!==6)T[i]=t;
   if(c==='.')O[i]=null;else if(c){const k=A.ISL_OBJ[PXC.indexOf(c)];if(k){const[ot,v]=k.split(':');O[i]=RG_WALK[T[i]]?{t:ot,hp:OHP[ot]||3,v:v||undefined}:null}}
   else if(t>=0&&!RG_WALK[T[i]])O[i]=null}
  const free=(x,y,w,h)=>{for(let b=0;b<h;b++)for(let a=0;a<w;a++){const j=(y+b)*W+x+a;if(x+a<0||y+b<0||x+a>=W||y+b>=H||C.keep[j]||C.lmSolid[j])return false}return true};
  arr(E.lm).forEach((L,ci)=>{if(!L||!A.ISL_LM[L.k])return;const[,w,h,v]=A.ISL_LM[L.k],x=L.x|0,y=L.y|0;if(!free(x,y,w,h))return;
   const ex={};if(v!==undefined)ex.v=v;if(L.k==='chest'){ex.use='loot';ex.ci=1000+ci;ex.loot=L.loot||{};ex.name=clean(L.n,40)||'Chest'}else if(L.k==='sign'||L.tx){ex.use='look';ex.name=clean(L.n,40)||A.ISL_LM[L.k][0];ex.text=clean(L.tx,300)||ex.name}
   for(let b=0;b<h;b++)for(let a=0;a<w;a++)O[(y+b)*W+x+a]=null;rgLm(C,L.k.split(':')[0],x,y,w,h,ex)});
  arr(E.npc).slice(0,40).forEach((Q,k)=>{if(!Q)return;const x=Q.x|0,y=Q.y|0;if(!free(x,y,1,1))return;O[y*W+x]=null;
   rgLm(C,'npc',x,y,1,1,{use:'npc',ni:k,name:clean(Q.n,24)||'Islander',look:look(Q.lk),lines:arr(Q.s).map(l=>clean(l,160)).filter(Boolean).slice(0,8)})});
  arr(E.cv).slice(0,6).forEach((V,k)=>{if(!V)return;const x=V.x|0,y=V.y|0;if(x<1||y<1||x>=W-1||y>=H-1||!free(x-1,y-1,3,2))return;
   for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const j=(y+b)*W+x+a;O[j]=null;if(!RG_WALK[T[j]])T[j]=11}for(const[a,b]of[[-1,0],[1,0],[-1,-1],[0,-1],[1,-1]])C.lmSolid[(y+b)*W+x+a]=1;
   C.items.push({t:'icvdoor',kind:caveKind(C.D.id,k),x,y,name:clean(V.n,40)||'Hidden Cave',use:'icv',w:1,h:1})})}
 const caveKind=(id,k)=>'cv_'+id+'_e'+k;
 // the dungeons behind those entrances (like 111a's regCaves for custom islands)
 const MINE={};function regCaves(id,E){const IC=window.SQICV;if(!IC||typeof DKIND==='undefined')return;for(const k in MINE)if(MINE[k]===id){delete IC[k];delete DKIND[k];delete MINE[k]}
  arr(E&&E.cv).slice(0,6).forEach((V,k)=>{if(!V)return;const st=A.CAVE_ST[V.st]||A.CAVE_ST.rock,kind=caveKind(id,k),keys=arr(V.m).filter(m=>typeof m==='string'&&/^[a-z]+(:[a-z]+)?$/.test(m)).slice(0,6);
   const mob=keys.length?keys.map((m,j)=>[m,(j+1)/keys.length]):[['bat',.5],['slime',1]];
   IC[kind]=DKIND[kind]=Object.assign({},st,{name:clean(V.n,40)||'Hidden Cave',rg:id,floors:Math.max(1,Math.min(6,V.f|0||3)),noboss:1,mob,ore:V.st==='mine'?null:4});if(V.st!=='mine')delete IC[kind].mine;MINE[kind]=id})}
 {const _rf=rgFinish;rgFinish=function(C){try{const id=C&&C.D&&C.D.id,E=id&&id!==OFF&&PATCH[id];if(E)apply(C,E)}catch(e){console.warn(e)}return _rf.apply(this,arguments)}}
 {const _rp=rgPrepare;rgPrepare=function(id){const R=_rp.apply(this,arguments);if(R&&PATCH[id])R._t64=1;return R}}
 const here=()=>{try{return curRegion()}catch(e){return null}};
 function drop(id,force){if(here()===id&&!force)return;try{delete RG_CACHE[id];if(typeof RG_PRE!=='undefined')delete RG_PRE[id];if(typeof RG_THUMB!=='undefined')delete RG_THUMB[id];if(ROOMS['reg_'+id])delete ROOMS['reg_'+id];if(typeof HDRM!=='undefined'&&ROOMS['reg_'+id])HDRM.delete(ROOMS['reg_'+id])}catch(e){}}
 // standing on the island while it changes: build it again around you (same spot, inside or outside)
 function refresh(id){if(here()!==id||SCENE&&SCENE.room&&!SCENE.room.region)return;setTimeout(()=>{try{if(here()!==id||!(SCENE&&SCENE.room&&SCENE.room.region===id))return;const px=P.x,py=P.y,f=face.slice();drop(id,true);
   loadRegion(id);if(SCENE&&SCENE.room&&SCENE.room.region===id&&!solid(px,py)){P.x=px;P.y=py;face=f}}catch(e){console.warn(e)}},50)}
 // monster zones on a built-in island: kept topped up while you're within 30 tiles; the island's own monsters go on as before
 const TOUGH=[1,1.6,2.4,3.5];let zt=0;
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{if(dead||menuOpen||pnOpen||(zt-=dt)>0)return out;zt=1;const R=SCENE&&SCENE.room,id=R&&R.region,E=id&&PATCH[id];if(!E||!E.zn)return out;
    const L=window.SQISLIFE&&SQISLIFE.MOBS||{},ptx=P.x/16,pty=P.y/16;arr(E.zn).slice(0,24).forEach((Z,k)=>{if(!Z)return;const zx=Z.x|0,zy=Z.y|0,zw=Math.max(1,Z.w|0),zh=Math.max(1,Z.h|0),ms=arr(Z.m).filter(m=>L[m]);if(!ms.length)return;
     if(ptx<zx-30||ptx>zx+zw+30||pty<zy-30||pty>zy+zh+30)return;const zi='e'+k,have=en.filter(n=>!n.dead&&n.zc===id&&n.zi===zi).length;if(have>=Math.max(1,Math.min(12,Z.n|0||4)))return;
     for(let t=0;t<12;t++){const x=zx+Math.floor(Math.random()*zw),y=zy+Math.floor(Math.random()*zh),px=x*16+8,py=y*16+8;if(solid(px,py)||Math.hypot(px-P.x,py-P.y)<120)continue;
      const m=ms[Math.floor(Math.random()*ms.length)],hp=Math.round(L[m].hp*(TOUGH[Z.hp|0]||1)),n=rgMake(m,hp,px,py);n.mhp=n.mhp||hp;n.zc=id;n.zi=zi;delete n.night;try{RG_OWN.add(n)}catch(e){}en.push(n);break}})}catch(e){console.warn(e)}return out}}
 // own ground tiles, drawn over the ground like 117 does for custom islands
 const IMG=new Map(),img=u=>{let m=IMG.get(u);if(!m){m=new Image();m.src=u;IMG.set(u,m)}return m.complete&&m.naturalWidth?m:null};
 {const _bg=ROOMBG;ROOMBG=function(R2){const out=_bg.apply(this,arguments);try{const E=R2&&R2.region&&PATCH[R2.region];if(!E||typeof E.c!=='string'||!arr(E.ct).length)return out;
   if(E.lay===undefined){E.lay=null;try{const s2=A.unpack(E.c);if(s2.length===R2.w*R2.h)E.lay=s2}catch(e){}}const L=E.lay;if(!L)return out;const ct=arr(E.ct),ok=window.SQISLIFE&&SQISLIFE.okUrl||(()=>false);
   const v=rgView(),x0=Math.max(0,Math.floor(v.x0/16)),x1=Math.min(R2.w-1,Math.ceil(v.x1/16)),y0=Math.max(0,Math.floor(v.y0/16)),y1=Math.min(R2.h-1,Math.ceil(v.y1/16));g.imageSmoothingEnabled=false;
   for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const ch=L[y*R2.w+x];if(!ch||ch==='.')continue;const T2=ct[HEX.indexOf(ch)];if(!T2||!ok(T2.p))continue;const m=img(T2.p);if(m)g.drawImage(m,x*16,y*16,16,16)}}catch(e){}return out}}
 A.onApply(lib=>{const L=lib&&lib.islands||{},want={};for(const k in L){const E=L[k];if(!/^ed_[a-z0-9_]{1,30}$/.test(k)||!E||typeof E!=='object')continue;const id=k.slice(3);if(!WORLD_REGIONS[id]||WORLD_REGIONS[id].custom||E.bi!==id)continue;want[id]=E}
  for(const id in PATCH)if(!want[id]){delete PATCH[id];try{regCaves(id,null)}catch(e){}drop(id);refresh(id)}
  for(const id in want){const s=JSON.stringify(want[id]);if(PATCH[id]&&PATCH[id]._s===s)continue;PATCH[id]=Object.assign({},want[id],{_s:s,cells:null,lay:undefined});try{regCaves(id,PATCH[id])}catch(e){}drop(id);refresh(id)}});
 // the builder's starting point: the island exactly as the game generates it, without its patch
 function base(id){const D=WORLD_REGIONS[id];if(!D||!RG_GENS[id])throw new Error('unknown island');OFF=id;let keep=null;const rf=rgFinish;
  rgFinish=function(C){if(C&&C.D&&C.D.id===id){keep=new Uint8Array(C.N2);for(let i=0;i<C.N2;i++)keep[i]=C.keep[i]||C.lmSolid[i]?1:0}return rf.apply(this,arguments)};
  try{const G=rgRunSync(RG_GENS[id](D));G._keep=keep;return G}finally{OFF=null;rgFinish=rf}}
 A.islandEdits={PATCH,base,parse,apply}})();
