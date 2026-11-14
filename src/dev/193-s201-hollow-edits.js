// ---- 201. Editing Hollow Island (Dev Suite > Islands > Built-in islands > Hollow Island) ----
// islands.ed_hollow = the same format as 111g's built-in island edits ({bi:'hollow', n, w:220, h:220, x:"i.t.o;...", ul}),
// but Hollow isn't a generated region: it is 001's tile[]/obj[] (ground 0 water, 1 sand, 2 grass, 3 mountain, 4 snow,
// 5 desert). This file keeps the island as the game made it (ORIG, taken when the script has run, before any library is
// applied), applies the patch onto tile/obj on every library apply (cells of the previous patch are put back first), and
// throws away the baked ground (032's HDCK) and the map picture (052's HMAP). Only ground and objects: people, buildings,
// caves and zones are not used on Hollow (the builder hides them for it).
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
 function redraw(){try{HDCK.clear()}catch(e){}try{HMAPK='';HMAPT=-1e9}catch(e){}}
 A.onApply(lib=>{const E=lib&&lib.islands&&lib.islands.ed_hollow;const s=E&&typeof E==='object'&&E.bi==='hollow'?JSON.stringify(E):'';if(s===LAST)return;LAST=s;
  restore();if(s)try{apply(E)}catch(e){console.warn('hollow edits',e)}redraw();
  // standing inside something now (a painted tree or water): step to the nearest free land tile
  try{if(!SCENE&&P&&solid(P.x,P.y)){const tx=Math.floor(P.x/T),ty=Math.floor(P.y/T);out:for(let r=1;r<20;r++)for(let b=-r;b<=r;b++)for(let a=-r;a<=r;a++){if(Math.max(Math.abs(a),Math.abs(b))!==r)continue;const x=tx+a,y=ty+b;if(x<0||y<0||x>=N||y>=N)continue;if(!solid(x*T+8,y*T+8)){P.x=x*T+8;P.y=y*T+8;break out}}}}catch(e){}});
 // the builder's starting point: Hollow as the game made it
 const _b=X.base;X.base=function(id){if(id!=='hollow')return _b.apply(this,arguments);const items=[];
  for(let i=0;i<NN;i++){const o=OO[i];if(o)items.push({t:'_obj',o:{t:o.t,v:o.v},x:i%N,y:(i/N)|0})}
  const keep=new Uint8Array(NN);for(let i=0;i<NN;i++)keep[i]=HARD[i]||SOFT[i]?1:0;return{tiles:OT,items,_keep:keep}};
 X.hollowOK=true;X.hollowHard=HARD;X.HOLOBJ=OK;window.SQHOLLOWED={HARD,SOFT,OT,OO,get cur(){return CUR.length}}})();
