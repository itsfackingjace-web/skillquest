// ---- 128. Weapons swing with their own item sprite ----
// Swords, the Stone Sledgehammer, axes, pickaxes, wands and bows are drawn in your hand using their item sprite (the bag
// icon, including any sprite redrawn in the Dev Suite), turned to the swing's angle on the pixel grid, instead of the
// game's own drawn blade / tool line / stick / bow. Other players' sword swings show the same way.
// Item icons point up-right (grip bottom-left), except bows, which face right; that's how they're turned.
// Dev Suite > Swings: one switch for all of them (on unless turned off) and a per-item choice (follow the switch,
// always the item sprite, always the game's own). Library: swings = {all: bool, k: {<item key>: 'icon'|'own'}}.
(()=>{const A=window.SQA;let CFG={all:true,k:{}};
 if(A&&A.onApply)A.onApply(lib=>{const s=lib&&lib.swings;CFG={all:!(s&&s.all===false),k:s&&s.k&&typeof s.k==='object'?Object.assign({},s.k):{}}});
 const isBow=k=>!!k&&(/^eq_bow/.test(k)||!!(EQ[k]&&(EQ[k].kind==='bow'||EQ[k].custom&&/^eq_bow/.test(EQ[k].base||''))));
 const use=k=>{if(!k)return false;let v=CFG.k[k];if(!v&&EQ[k]&&EQ[k].custom)v=CFG.k[EQ[k].base];return v==='icon'?true:v==='own'?false:CFG.all};
 // ---- the item sprite, read once per picture, then turned in 32 steps ----
 const SRC={};
 const urlOf=k=>{try{return EQ[k]&&typeof eqIcon==='function'?eqIcon(k):iconURL(k)}catch(e){return null}};
 function srcFor(k){const url=urlOf(k);if(!url)return null;let s=SRC[url];if(s)return s.ok?s:null;s=SRC[url]={ok:false,rot:{}};const im=new Image();
  im.onload=()=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data;
   let x0=1e9,y0=1e9,x1=-1,y1=-1;for(let y=0;y<c.height;y++)for(let xx=0;xx<c.width;xx++)if(d[(y*c.width+xx)*4+3]>40){if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(y<y0)y0=y;if(y>y1)y1=y}
   Object.assign(s,{w:c.width,h:c.height,d,bb:[x0,y0,x1,y1],ok:x1>=0})};im.src=url;return null}
 // kind 'diag': pivot at the grip (bottom-left), points up-right. kind 'bow': pivot in the middle, faces right.
 function turned(s,kind,ang){const st=((Math.round(ang/6.2832*32))%32+32)%32,key=kind+st;if(s.rot[key])return s.rot[key];
  const[x0,y0,x1,y1]=s.bb,sc=14/Math.max(s.w,s.h,1),px=kind==='bow'?(x0+x1+1)/2:x0+1.5,py=kind==='bow'?(y0+y1+1)/2:y1-.5,nat=kind==='bow'?0:-Math.PI/4;
  let R=0;for(const[cx,cy]of[[x0,y0],[x1+1,y0],[x0,y1+1],[x1+1,y1+1]])R=Math.max(R,Math.hypot(cx-px,cy-py)*sc);R=Math.ceil(R)+1;
  const W=2*R+1,c=document.createElement('canvas');c.width=W;c.height=W;const x=c.getContext('2d'),img=x.createImageData(W,W),o=img.data,t=st/32*6.2832-nat,co=Math.cos(t),si=Math.sin(t);
  for(let v=0;v<W;v++)for(let u=0;u<W;u++){const dx=u+.5-(R+.5),dy=v+.5-(R+.5),sx=Math.floor((dx*co+dy*si)/sc+px),sy=Math.floor((-dx*si+dy*co)/sc+py);
   if(sx<0||sy<0||sx>=s.w||sy>=s.h)continue;const i=(sy*s.w+sx)*4;if(s.d[i+3]<=40)continue;const j=(v*W+u)*4;o[j]=s.d[i];o[j+1]=s.d[i+1];o[j+2]=s.d[i+2];o[j+3]=255}
  x.putImageData(img,0,0);return s.rot[key]={c,R}}
 function put(ctx,s,kind,ang,hx,hy){const t=turned(s,kind,ang);ctx.drawImage(t.c,Math.round(hx)-t.R,Math.round(hy)-t.R)}
 // ---- where the weapon is during each action (same timing and hand spots as the game's own drawings) ----
 const swingAng=(fx,fy,pr)=>Math.atan2(fy,fx)+(Math.max(0,Math.min(1,pr))-.5)*2.3;
 function toolAng(a){const p=Math.min(1,a.t/a.dur),f=a.face,a0=Math.atan2(f[1],f[0]),sg=f[0]<0?1:-1,ch=a.type==='chop',st=a0+sg*(ch?1.9:2.7),en2=a0-sg*(ch?.25:.1),e=p<.6?Math.pow(p/.6,2):1;return st+(en2-st)*e}
 // ---- your own character ----
 let castUntil=0,bowUntil=0;
 const _pp=pP;pP=function(tm){const now=performance.now();
  if(dead||(window.SQDF&&SQDF.on)||(typeof SAILING!=='undefined'&&SAILING&&!SCENE)||(window.SQRSAIL&&SQRSAIL.on)||(typeof FISH!=='undefined'&&FISH))return _pp.apply(this,arguments);
  const cast=typeof CASTT!=='undefined'&&CASTT>0,bow=typeof BOWT!=='undefined'&&BOWT>0;if(cast)castUntil=now+swing*1000+30;if(bow)bowUntil=now+swing*1000+30;
  let mode=null,key=null;
  if(bow){mode='bow';key=occ('off')}else if(cast){mode='wand';key=occ('off')}
  else if(typeof ACTN!=='undefined'&&ACTN&&(ACTN.type==='chop'||ACTN.type==='mine')){mode='tool';key=occ(ACTN.type==='chop'?'axe':'pick')}
  else if(swing>0&&now>castUntil&&now>bowUntil){key=(window.SQSLEDGE&&SQSLEDGE())?'eq_sledge':occ('main');mode=key?'swing':null}
  const s=mode&&use(key)?srcFor(key):null;
  if(!s){// the moment right after a cast or a shot: no sword swing (this file hides CASTT/BOWT from the others while drawing)
   if(!mode&&swing>0&&(now<castUntil||now<bowUntil)){const sw=swing;swing=0;try{return _pp.apply(this,arguments)}finally{swing=sw}}return _pp.apply(this,arguments)}
  // where it goes; pointing up (away from the camera) it's drawn behind you
  const fx=face[0],fy=face[1];let kind='diag',ang,hx,hy;
  if(mode==='swing'){ang=swingAng(fx,fy,1-swing/.25);hx=P.x+fx*5;hy=P.y-4+fy*5}
  else if(mode==='tool'){const a=ACTN;ang=toolAng(a);hx=P.x+a.face[0]*3;hy=P.y-6+a.face[1]*2}
  else if(mode==='wand'){const[dx,dy]=CASTD;ang=Math.atan2(dy,dx);hx=P.x+dx*4;hy=P.y-5+dy*4}
  else{const[dx,dy]=BOWD;kind='bow';ang=Math.atan2(dy,dx);hx=P.x+dx*8;hy=P.y-5+dy*6}
  const behind=kind==='diag'&&Math.sin(ang)<-.5,flick=hurt>0&&Math.floor(tm*20)%2;
  if(behind&&!flick)put(g,s,kind,ang,hx,hy);
  const sv=[swing,typeof CASTT!=='undefined'?CASTT:0,typeof BOWT!=='undefined'?BOWT:0,ACTN];
  swing=0;if(mode==='wand')CASTT=0;if(mode==='bow')BOWT=0;if(mode==='tool')ACTN=null;
  try{_pp.apply(this,arguments)}finally{swing=sv[0];if(mode==='wand')CASTT=sv[1];if(mode==='bow')BOWT=sv[2];if(mode==='tool')ACTN=sv[3]}
  if(!behind&&!flick)put(g,s,kind,ang,hx,hy)};
 // ---- other players' swings (sword tier, 9 = sledgehammer) ----
 if(window.SQSWING){const _sw=SQSWING;window.SQSWING=function(x,y,fx,fy,pr,t,tm){const key=t===9?'eq_sledge':t?'eq_sword'+t:null,s=key&&use(key)?srcFor(key):null;
   if(!s)return _sw.apply(this,arguments);put(g,s,'diag',swingAng(fx,fy,pr),Math.round(x)+fx*5,Math.round(y)-4+fy*5)}}
 // have the pictures ready before the first swing
 {let t=0;const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);if((t-=dt)<=0){t=.5;try{for(const sl of['main','off','axe','pick'])srcFor(occ(sl));if(window.SQSLEDGE&&SQSLEDGE())srcFor('eq_sledge')}catch(e){}}return out}}
 window.SQISW={use,srcFor,turned,put,isBow,swingAng,toolAng,get cfg(){return CFG}};

 // ---- Dev Suite > Swings ----
 if(!window.SQSUITE)return;const api=SQSUITE.api,{E,toast,same}=api,root=document.getElementById('dvs');
 const UI={sel:null,raf:0};
 const weapons=()=>{const ks=Object.keys(EQ).filter(k=>{const e=EQ[k];return e&&['main','off','axe','pick'].includes(e.slot)});
  const grp=k=>k==='eq_sledge'?'Sledgehammer':/^eq_sword/.test(k)?'Swords':/^eq_axe/.test(k)?'Axes':/^eq_pick/.test(k)?'Pickaxes':isBow(k)?'Bows':/^eq_w/.test(k)?'Wands':EQ[k].custom?'New gear items':'Other';
  const out={};for(const k of ks){const n=grp(k);(out[n]||(out[n]={list:[]})).list.push(k)}return out};
 const cur=()=>{const D=api.S.draft||{},s=D.swings||{};return{all:s.all!==false,k:Object.assign({},s.k||{})}};
 const useD=(c,k)=>{let v=c.k[k];if(!v&&EQ[k]&&EQ[k].custom)v=c.k[EQ[k].base];return v==='icon'?true:v==='own'?false:c.all};
 const modeOf=k=>isBow(k)?'bow':/^eq_w/.test(k)||(EQ[k]&&EQ[k].kind==='wand')?'wand':/^eq_(axe|pick)/.test(k)?'tool':'swing';
 function render(){const c=cur();if(!UI.sel)UI.sel=occ('main')||'eq_sword1';
  let h='<div class="dv-card"><label style="display:flex;gap:8px;align-items:center;font-weight:700"><input type="checkbox" data-sw="all"'+(c.all?' checked':'')+'> Weapons swing with their item sprite</label>'+
   '<p class="dv-mut">Swords, the sledgehammer, axes, pickaxes, wands and bows are drawn in the hand with their bag sprite (and any sprite you redraw), turned to match the swing. Off: the game\'s own drawn swings. Pick a different choice per item below.</p></div>';
  h+='<div class="dv-card" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;position:sticky;top:0;z-index:2"><canvas id="swpv" width="96" height="96" style="width:128px;height:128px;image-rendering:pixelated;background:#5a9a48;border:2px solid #384870"></canvas>'+
   '<div><b>'+E(INAME[UI.sel]||UI.sel)+'</b><p class="dv-mut">'+(useD(c,UI.sel)?'Uses its item sprite':'Uses the game\'s own drawing')+' (preview shows the item sprite). Save goes to your draft; publish it from the Publish tab.</p></div></div>';
  const G=weapons();for(const gname in G){h+='<div class="dv-card"><b>'+E(gname)+'</b>';
   for(const k of G[gname].list){const v=c.k[k]||'';h+='<div class="dv-hl" style="'+(k===UI.sel?'background:#34466e;border-radius:6px':'')+'"><span data-swp="'+E(k)+'" style="cursor:pointer;flex:1"><img alt="" src="'+api.thumb(k)+'" style="width:22px;height:22px;image-rendering:pixelated;vertical-align:middle;margin-right:6px">'+E(INAME[k]||k)+'</span>'+
    '<select data-swk="'+E(k)+'"><option value=""'+(v?'':' selected')+'>Follow the switch ('+(c.all?'sprite':'game\'s own')+')</option><option value="icon"'+(v==='icon'?' selected':'')+'>Always the item sprite</option><option value="own"'+(v==='own'?' selected':'')+'>Always the game\'s own</option></select></div>'}h+='</div>'}
  return h}
 // the preview: a little figure doing the item's action on a loop
 function after(){cancelAnimationFrame(UI.raf);const cv=document.getElementById('swpv');if(!cv)return;const x=cv.getContext('2d');x.imageSmoothingEnabled=false;const t0=performance.now();
  const loop=()=>{if(!document.getElementById('swpv'))return;const k=UI.sel,s=srcFor(k),m=modeOf(k),t=((performance.now()-t0)/1000)%1.2,cx=48,cy=56;x.clearRect(0,0,96,96);
   x.fillStyle='rgba(0,0,0,.25)';x.fillRect(cx-7,cy+5,14,3);x.fillStyle='#f0c8a0';x.fillRect(cx-4,cy-14,8,8);x.fillStyle='#4878c8';x.fillRect(cx-5,cy-6,10,10);x.fillStyle='#384870';x.fillRect(cx-5,cy+4,10,3);
   if(s){const fx=1,fy=0;if(m==='swing'&&t<.25)put(x,s,'diag',swingAng(fx,fy,t/.25),cx+fx*5,cy-4);else if(m==='tool'&&t<.32){const a={t,dur:.32,face:[1,0],type:/^eq_axe/.test(k)?'chop':'mine'};put(x,s,'diag',toolAng(a),cx+3,cy-6)}
    else if(m==='wand'&&t<.35)put(x,s,'diag',0,cx+4,cy-5);else if(m==='bow'&&t<.35)put(x,s,'bow',0,cx+8,cy-5);else if(m==='bow')put(x,s,'bow',0,cx+6,cy-3);else put(x,s,'diag',-1.2,cx+4,cy-3)}
   UI.raf=requestAnimationFrame(loop)};loop()}
 async function save(c){const S=api.S;S.draft=S.draft||{};const v=c.all&&!Object.keys(c.k).length?null:{all:c.all,k:c.k};if(v)S.draft.swings=v;else delete S.draft.swings;
  try{await api.dset('draft/swings',v);toast('Saved to your draft.')}catch(e){api.fail(e)}if(A&&A.previewing)A.preview(S.draft);api.draw()}
 root.addEventListener('change',e=>{const t=e.target;if(!t.dataset)return;if(t.dataset.sw==='all'){const c=cur();c.all=t.checked;save(c);return}
  if(t.dataset.swk){const c=cur();if(t.value)c.k[t.dataset.swk]=t.value;else delete c.k[t.dataset.swk];save(c)}});
 root.addEventListener('click',e=>{const t=e.target.closest('[data-swp]');if(!t)return;UI.sel=t.dataset.swp;api.draw()});
 function changes(L,D){const a=L.swings||null,b=D.swings||null;return same(a,b)?[]:[{kind:'ext',html:'⚔ Weapon swings: '+(b&&b.all===false?'the game\'s own drawings':'item sprites')+(b&&b.k&&Object.keys(b.k).length?' ('+Object.keys(b.k).length+' item choice'+(Object.keys(b.k).length>1?'s':'')+')':'')}]}
 SQSUITE.addTab('swings','Swings',{render,after,changes,leave(){cancelAnimationFrame(UI.raf)}})})();
