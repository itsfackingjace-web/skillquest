// ---- 151. Editing the built-in islands (Dev Suite > Islands > "Built-in islands") ----
// islands.ed_<region> in the asset library = changes painted on top of a built-in island:
//   {bi: region id, n: its name, w, h, x: "i.t.o;..." changed cells (t = new ground or '' if unchanged, o = an object
//    letter as in custom islands, '.' = removed, '' = unchanged), lm: buildings/props/signs/chests, npc: people}
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
 function apply(C,E){const{W,H,T,O}=C;for(const[i,t,c]of E.cells||(E.cells=parse(E))){if(i<0||i>=W*H||C.keep[i]||C.lmSolid[i])continue;
   if(t>=0&&t!==6)T[i]=t;
   if(c==='.')O[i]=null;else if(c){const k=A.ISL_OBJ[PXC.indexOf(c)];if(k){const[ot,v]=k.split(':');O[i]=RG_WALK[T[i]]?{t:ot,hp:OHP[ot]||3,v:v||undefined}:null}}
   else if(t>=0&&!RG_WALK[T[i]])O[i]=null}
  const free=(x,y,w,h)=>{for(let b=0;b<h;b++)for(let a=0;a<w;a++){const j=(y+b)*W+x+a;if(x+a<0||y+b<0||x+a>=W||y+b>=H||C.keep[j]||C.lmSolid[j])return false}return true};
  arr(E.lm).forEach((L,ci)=>{if(!L||!A.ISL_LM[L.k])return;const[,w,h,v]=A.ISL_LM[L.k],x=L.x|0,y=L.y|0;if(!free(x,y,w,h))return;
   const ex={};if(v!==undefined)ex.v=v;if(L.k==='chest'){ex.use='loot';ex.ci=1000+ci;ex.loot=L.loot||{};ex.name=clean(L.n,40)||'Chest'}else if(L.k==='sign'||L.tx){ex.use='look';ex.name=clean(L.n,40)||A.ISL_LM[L.k][0];ex.text=clean(L.tx,300)||ex.name}
   for(let b=0;b<h;b++)for(let a=0;a<w;a++)O[(y+b)*W+x+a]=null;rgLm(C,L.k.split(':')[0],x,y,w,h,ex)});
  arr(E.npc).slice(0,40).forEach((Q,k)=>{if(!Q)return;const x=Q.x|0,y=Q.y|0;if(!free(x,y,1,1))return;O[y*W+x]=null;
   rgLm(C,'npc',x,y,1,1,{use:'npc',ni:k,name:clean(Q.n,24)||'Islander',look:look(Q.lk),lines:arr(Q.s).map(l=>clean(l,160)).filter(Boolean).slice(0,8)})})}
 {const _rf=rgFinish;rgFinish=function(C){try{const id=C&&C.D&&C.D.id,E=id&&id!==OFF&&PATCH[id];if(E)apply(C,E)}catch(e){console.warn(e)}return _rf.apply(this,arguments)}}
 {const _rp=rgPrepare;rgPrepare=function(id){const R=_rp.apply(this,arguments);if(R&&PATCH[id])R._t64=1;return R}}
 const here=()=>{try{return curRegion()}catch(e){return null}};
 function drop(id){if(here()===id)return;try{delete RG_CACHE[id];if(typeof RG_PRE!=='undefined')delete RG_PRE[id];if(typeof RG_THUMB!=='undefined')delete RG_THUMB[id];if(ROOMS['reg_'+id])delete ROOMS['reg_'+id];if(typeof HDRM!=='undefined'&&ROOMS['reg_'+id])HDRM.delete(ROOMS['reg_'+id])}catch(e){}}
 A.onApply(lib=>{const L=lib&&lib.islands||{},want={};for(const k in L){const E=L[k];if(!/^ed_[a-z0-9_]{1,30}$/.test(k)||!E||typeof E!=='object')continue;const id=k.slice(3);if(!WORLD_REGIONS[id]||WORLD_REGIONS[id].custom||E.bi!==id)continue;want[id]=E}
  for(const id in PATCH)if(!want[id]){delete PATCH[id];drop(id)}
  for(const id in want){const s=JSON.stringify(want[id]);if(PATCH[id]&&PATCH[id]._s===s)continue;PATCH[id]=Object.assign({},want[id],{_s:s,cells:null});drop(id)}});
 // the builder's starting point: the island exactly as the game generates it, without its patch
 function base(id){const D=WORLD_REGIONS[id];if(!D||!RG_GENS[id])throw new Error('unknown island');OFF=id;let keep=null;const rf=rgFinish;
  rgFinish=function(C){if(C&&C.D&&C.D.id===id){keep=new Uint8Array(C.N2);for(let i=0;i<C.N2;i++)keep[i]=C.keep[i]||C.lmSolid[i]?1:0}return rf.apply(this,arguments)};
  try{const G=rgRunSync(RG_GENS[id](D));G._keep=keep;return G}finally{OFF=null;rgFinish=rf}}
 A.islandEdits={PATCH,base,parse,apply}})();
