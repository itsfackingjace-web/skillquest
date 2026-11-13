// ---- 150. Backyards and courtyards ----
// Every house has a back door in the middle of its back wall that leads to a private backyard (16 x 12 tiles of lawn
// behind a fence and a hedge); a castle has two back gates (mirrored, beside the throne) into a courtyard (26 x 16: paved
// paths, lawns, flower beds, a fountain). It's a room of its own, not part of the island: nobody walks in from outside.
// In it you can place furniture like indoors (it is a "home" scene whose house object is the yard: yf = its furniture,
// keyed by tile like a house) and farm: HIT grass with the hoe in your off-hand to till, plant seeds from the Bag
// (PLANT), water with the watering can, HIT ripe crops to harvest (yp = plots, growing while watered like 016's).
// Visitors: a friend standing in your house can go out back only if you trust them (072's trust list); they see your
// yard as you left it (yards/<uid>/<house id> = {f:[[i,t]], p:[[i,crop,stage]]}, written when it changes) but can't
// change anything. Packing up a house packs its yard too (furniture + chests; crops are lost like on Hollow).
// Saves: houses[].yf/yp and rh[].yf/yp next to their f.
(()=>{const T=16,K='#181018';
 ROOMS.yard={w:16,h:12,ex:-10,yard:1,floor:['#5aa848','#52a040'],wall:'#3a7a2a',trim:'#2a5a1e',items:[],solid:new Set()};
 ROOMS.court={w:26,h:16,ex:-10,court:1,floor:['#5aa848','#52a040'],wall:'#8a8478',trim:'#4a443c',items:[],solid:new Set()};
 {const R=ROOMS.court;for(const[x,y]of[[12,7],[13,7],[12,8],[13,8]])R.solid.add(y*R.w+x)}// the fountain
 // doors: in the house (back wall, x in px) and in the yard (bottom edge), pairs by index
 const HDOOR=R=>R===ROOMS.castle?[120,232]:R===ROOMS.home?[112]:[];
 const YDOOR=R=>R.court?[152,264]:R.yard?[128]:[];
 const isYard=()=>!!(SCENE&&SCENE.room&&(SCENE.room.yard||SCENE.room.court)&&SCENE.yardOf);
 const inHouse=()=>!!(SCENE&&SCENE.id==='home'&&SCENE.house&&!SCENE.yardOf&&(SCENE.room===ROOMS.home||SCENE.room===ROOMS.castle));
 const nowS2=()=>{try{return nowS()}catch(e){return Math.floor(Date.now()/1000)}};
 // ---- the yard object for a house (kept on the house: h.yf furniture, h.yp plots) ----
 function yardOf(h,ro){if(!h.yf)h.yf=new Map();if(!h.yp)h.yp=new Map();
  if(!h._yd)h._yd={id:(h._oid||h.id)+'~y',_oid:(h._oid||h.id)+'~y',_owner:h._owner,_foreign:h._foreign,castle:h.castle,yard:1,furn:h.yf,plots:h.yp,base:h};
  h._yd.ro=!!ro;return h._yd}
 // ---- going out and coming back ----
 let busy=false;
 function goOut(i){const S=SCENE,h=S.house,R=h.castle||S.room===ROOMS.castle?ROOMS.court:ROOMS.yard;
  if(h._owner&&window.SQMP&&SQMP.user&&h._owner!==SQMP.user.uid){if(busy)return;
   if(typeof trustedBy==='function'&&!trustedBy(h._owner)){say('Only people its owner trusts can go out back.');msgT=4;try{sfx('swish')}catch(e){}P.y+=4;return}
   busy=true;const F=window.SQFB;F.db.get(F.db.ref(F.D,'yards/'+h._owner+'/'+(h._oid||h.id))).then(s=>{busy=false;readYard(h,s.val());enter(S,R,i,true)}).catch(()=>{busy=false;readYard(h,null);enter(S,R,i,true)});return}
  enter(S,R,i,false)}
 function enter(S,R,i,ro){if(SCENE!==S)return;const Y=yardOf(S.house,ro),dx=YDOOR(R)[Math.min(i,YDOOR(R).length-1)];
  SCENE={id:'home',room:R,house:Y,ret:S.ret,prev:S.prev,yardOf:S,door:i};P.x=dx;P.y=(R.h-1)*16+6;face=[0,-1];en=[];FISH=null;try{if(BUILD)endBuild()}catch(e){}FADE_AT=performance.now();try{sfx('door')}catch(e){}
  if(ro)say('You step into '+(S.house._owner&&window.SQMP?(SQMP.players.get(S.house._owner)||{}).n||'your friend':'your friend')+'\'s '+(R.court?'courtyard':'backyard')+'. Have a look around!');}
 function goBack(){const S=SCENE,B=S.yardOf,i=S.door|0,hx=HDOOR(B.room)[Math.min(i,HDOOR(B.room).length-1)];SCENE=B;P.x=hx;P.y=2*16+12;face=[0,1];FADE_AT=performance.now();try{if(BUILD)endBuild()}catch(e){}try{sfx('door')}catch(e){}}
 {const _ls=leaveScene;leaveScene=function(){if(isYard()){goBack();return}return _ls.apply(this,arguments)}}
 // ---- every frame: doors, growing ----
 const keyUp=()=>face[1]<0,keyDn=()=>face[1]>0;
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{if(dead||menuOpen||pnOpen||!SCENE)return out;
    if(inHouse()&&P.y<2*16+9&&keyUp()){const L=HDOOR(SCENE.room);for(let i=0;i<L.length;i++)if(Math.abs(P.x-L[i])<7){goOut(i);break}}
    else if(isYard()&&P.y>SCENE.room.h*16-10&&keyDn()){for(const dx of YDOOR(SCENE.room))if(Math.abs(P.x-dx)<9){goBack();break}}}catch(e){console.warn(e)}return out}}
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);if(menuOpen||pnOpen)return out;try{for(const h of mine())if(h.yp)for(const p of h.yp.values())if(p.c&&wet(p)&&!ripe(p))p.g+=dt}catch(e){}return out}}
 const mine=()=>HOUSES.concat(window.SQRH||[]);
 // ---- farming in the yard (HIT) ----
 const yi=(R,x,y)=>y*R.w+x;
 const onDoorTile=(R,x,y)=>y>=R.h-1&&YDOOR(R).some(dx=>Math.abs(x*16+8-dx)<16);
 function tillable(R,Y,x,y){if(x<0||y<2||x>=R.w||y>=R.h||onDoorTile(R,x,y))return false;const i=yi(R,x,y);return!R.solid.has(i)&&!Y.furn.has(i)&&!Y.plots.has(i)}
 {const _a=attack;attack=function(){if(!isYard()||dead||menuOpen||pnOpen||BUILD||swing>0||FISH)return _a.apply(this,arguments);const R=SCENE.room,Y=SCENE.house;
   const[x,y]=frontTile(),i=yi(R,x,y),p=Y.plots.get(i);
   if(Y.ro){if(p||Y.furn.has(i)){say('This is your friend\'s yard: you can look, but not touch.');msgT=3;swing=.2;return}return _a.apply(this,arguments)}
   // keyboard and mouse: Space / left-click is melee only, the hoe and can work from X (140); a tool in the bag is swapped in
   const melee=isPC&&!(typeof GPON!=='undefined'&&GPON)&&!(window.SQOFFVIA&&SQOFFVIA()),off=()=>!TL.bow&&!WAND;
   const want=k=>{if(melee)return false;const has=k==='eq_can'?TL.can:TL.hoe;if(has)return true;if((inv[k]|0)<1||!off()&&!(TL.hoe||TL.can))return false;try{equipItem(k)}catch(e){}return k==='eq_can'?!!TL.can:!!TL.hoe};
   if(p){swing=.25;if(ripe(p)){harvest(-1,p);saveLocal(true);pub();return}
    if(p.c&&!wet(p)){if(!want('eq_can')){say(melee?'Press X (or right-click) to water it with your watering can.':'Put your watering can in your off-hand to water it.');try{sfx('swish')}catch(e){}return}
     p.w=CLK+WATER_FOR;addXp(11,3);say('Watered the '+CROPS[p.c].n.toLowerCase()+'.');try{sfx('splash')}catch(e){}saveLocal();return}
    if(!p.c){say('This soil is ready. Choose seeds in your Bag and tap PLANT.');try{sfx('swish')}catch(e){}return}
    const C=CROPS[p.c],left=Math.max(0,C.max*C.st-p.g);say(C.n+' is growing. About '+Math.ceil(left/60)+' min of watered time left.');try{sfx('swish')}catch(e){}return}
   if(tillable(R,Y,x,y)&&!en.some(n=>!n.dead)&&(TL.hoe||TL.can||(inv.eq_hoe|0)>0)&&want('eq_hoe')){swing=.25;Y.plots.set(i,{c:null,g:0,w:0,e:nowS2()});addXp(11,4);try{sfx('chop')}catch(e){}saveLocal(true);pub();return}
   return _a.apply(this,arguments)}}
 // planting: PLANT mode with seeds from the Bag
 {const _sb=startBuild;startBuild=function(k){if(!isYard()||!SEED2CROP[k])return _sb.apply(this,arguments);if(SCENE.house.ro){say('You can\'t plant in a friend\'s yard.');closePanel();return}if((inv[k]|0)<1)return;
   BUILD={k};closePanel();setActionLabels();say('Plant mode: face tilled soil and press PLANT. Press DONE when finished.')}}
 {const _pb=placeBuild;placeBuild=function(){if(!isYard()||!BUILD||!SEED2CROP[BUILD.k])return _pb.apply(this,arguments);const k=BUILD.k,R=SCENE.room,Y=SCENE.house,[x,y]=frontTile(),p=Y.plots.get(yi(R,x,y));
   if(!p){say(TL.hoe?'Till the soil first: face grass and press HIT.':'Till the soil first with a hoe in your off-hand.');try{sfx('swish')}catch(e){}return}
   if(p.c){say('Something is already growing there.');try{sfx('swish')}catch(e){}return}const c=SEED2CROP[k],C=CROPS[c];if(C.lv&&lvOf(11)<C.lv){say('You need Farming '+C.lv+' to plant '+C.n.toLowerCase()+'.');return}
   inv[k]--;p.c=c;p.g=0;addXp(11,5);try{sfx('rustle')}catch(e){}saveLocal(true);pub();if((inv[k]|0)<1)endBuild('Planted your last '+INAME[k].toLowerCase()+'.')}}
 {const _cp=canPlace;canPlace=function(x,y){if(isYard()&&BUILD&&SEED2CROP[BUILD.k]){const p=SCENE.house.plots.get(yi(SCENE.room,x,y));return!!p&&!p.c}return _cp.apply(this,arguments)}}
 // furniture: not on plots, the gate or a friend's yard
 {const _cp=canPlaceIn;canPlaceIn=function(x,y){if(isYard()){const R=SCENE.room,Y=SCENE.house;if(Y.ro||Y.plots.has(yi(R,x,y))||onDoorTile(R,x,y))return false}return _cp.apply(this,arguments)}}
 {const _t=talk;talk=function(){if(isYard()&&SCENE.house.ro&&!dead&&!pnOpen){try{if(nearFurn()){say('This is your friend\'s yard: you can look, but not touch.');msgT=3;return}}catch(e){}}return _t.apply(this,arguments)}}
 // ---- drawing ----
 const hsh=(x,y)=>((x*73856093)^(y*19349663))>>>0;
 function grass(R,W2,H2){for(let y=0;y<R.h;y++)for(let x=0;x<R.w;x++){const h=hsh(x,y),c=(x+y)&1?'#5aa848':'#54a244';Rg(x*16,y*16,16,16,c);
   if(h%5===0){Rg(x*16+3+h%9,y*16+4+(h>>4)%8,1,2,'#3e8a32');Rg(x*16+5+h%9,y*16+3+(h>>4)%8,1,3,'#3e8a32')}if(h%17===0){const fx=x*16+4+h%8,fy=y*16+4+(h>>3)%8;Rg(fx,fy,2,2,['#f8f0f0','#f8d048','#e86890'][h%3]);Rg(fx,fy+2,1,2,'#3e8a32')}}}
 function hedgeTop(W2){Rg(0,0,W2,32,'#2e6a24');for(let x=0;x<W2;x+=8){const b=hsh(x,1)%3;g.fillStyle=b?'#3e8a32':'#4a9a3a';g.beginPath();g.arc(x+4,10+b,7,0,6.283);g.fill()}
  Rg(0,22,W2,10,'#2a5a1e');for(let x=0;x<W2;x+=8)Rg(x,22,1,10,'#1e4a16')}
 function fence(W2,y){Rg(0,y,W2,2,'#8a5a30');Rg(0,y+6,W2,2,'#8a5a30');for(let x=2;x<W2;x+=12){Rg(x,y-4,4,14,K);Rg(x+1,y-3,2,12,'#c08848')}}
 function backWall(R,W2,H2,stone){const D=YDOOR(R);if(stone){Rg(0,H2-6,W2,30,'#8a8274');for(let y=H2-6;y<H2+24;y+=8)for(let x=W2/2-((y/8|0)&1?12:0)-24*Math.ceil(W2/48);x<W2;x+=24){const a=Math.max(0,x),b=Math.min(W2,x+23);if(b>a){Rg(a,y,b-a,7,'#9a9284');Rg(a,y,b-a,1,'#b2aa9a')}}Rg(0,H2-6,W2,2,'#4a443c')}
  else{Rg(0,H2-4,W2,28,'#a0703c');for(let y=H2-4;y<H2+24;y+=5)Rg(0,y,W2,1,'#7a5028');Rg(0,H2-4,W2,2,'#5a3a1e')}
  for(const dx of D){Rg(dx-10,H2-8,20,30,K);Rg(dx-9,H2-7,18,30,stone?'#3a2a20':'#6a4424');Rg(dx-9,H2-7,18,2,stone?'#5a4430':'#8a5a30');Rg(dx+5,H2+4,2,2,'#f8d048')}}
 function fountain(cx,cy,tm){g.fillStyle=K;g.beginPath();g.ellipse(cx,cy+6,27,15,0,0,6.283);g.fill();g.fillStyle='#b8b2a4';g.beginPath();g.ellipse(cx,cy+6,26,14,0,0,6.283);g.fill();
  g.fillStyle='#4a9ad8';g.beginPath();g.ellipse(cx,cy+5,22,11,0,0,6.283);g.fill();g.fillStyle='#78c0f0';for(let k=0;k<6;k++){const a=tm*.8+k*1.05;g.fillRect(Math.round(cx+Math.cos(a)*14),Math.round(cy+5+Math.sin(a)*6),3,1)}
  Rg(cx-4,cy-14,8,20,K);Rg(cx-3,cy-13,6,18,'#c8c2b4');Rg(cx-3,cy-13,2,18,'#e0dace');Rg(cx-8,cy-16,16,4,K);Rg(cx-7,cy-15,14,2,'#c8c2b4');
  for(let k=0;k<4;k++){const ph=(tm*1.6+k*.25)%1;Rg(cx-1+(k%2?2:-2)*ph*3,cy-18-Math.sin(ph*3.1)*8+ph*10,2,2,'#a8e0ff')}}
 function bed(x,y,w,h,col){Rg(x,y,w,h,K);Rg(x+1,y+1,w-2,h-2,'#6a4a30');for(let k=0;k<w-6;k+=5){const c=[col,'#f8f0f0',col][((k/5)|0)%3];Rg(x+3+k,y+3,3,3,c);Rg(x+4+k,y+6,1,h-8,'#3e8a32')}}
 function drawYard(R,W2,H2){const tm=performance.now()/1000;Rg(-5,-5,W2+10,H2+40,'#1e3a16');grass(R,W2,H2);
  if(R.court){// stone paths: from each gate north to a ring around the fountain, a cross path, lawns with flower beds
   const P1='#b8b2a4',P2='#a49e90',cx=W2/2,cy=8*16;const path=(x,y,w,h)=>{Rg(x,y,w,h,P2);for(let yy=y;yy<y+h;yy+=8)for(let xx=x+((yy/8|0)&1)*4;xx<x+w;xx+=8)Rg(xx,yy,Math.min(7,x+w-xx),7,P1)};
   for(const dx of YDOOR(R))path(dx-12,cy,24,H2-cy);path(32,cy-12,W2-64,24);path(cx-12,40,24,cy-40);
   g.fillStyle=P2;g.beginPath();g.ellipse(cx,cy+4,46,30,0,0,6.283);g.fill();
   for(const[bx,by]of[[40,48],[W2-40-72,48],[40,cy+28],[W2-40-72,cy+28]])bed(bx,by,72,18,['#e04858','#f8d048','#e86890','#a870e0'][(bx>cx?1:0)+(by>cy?2:0)]);
   for(const sx of[24,W2-40])for(const sy of[60,cy+44]){Rg(sx,sy,16,16,K);g.fillStyle='#3e8a32';g.beginPath();g.arc(sx+8,sy+6,9,0,6.283);g.fill();Rg(sx+6,sy+12,4,6,'#7a5030')}
   fountain(cx,cy,tm);
   // a low hedge with roses along the top, lanterns
   hedgeTop(W2);for(let x=10;x<W2;x+=22)Rg(x,8+(x%3),3,3,'#e04858');for(const lx of[cx-70,cx+66]){Rg(lx,26,4,12,K);Rg(lx+1,27,2,10,'#5a5a66');Rg(lx-1,22,6,6,K);Rg(lx,23,4,4,'#f8d060')}
   Rg(0,32,4,H2-32,'#8a8274');Rg(W2-4,32,4,H2-32,'#8a8274');backWall(R,W2,H2,true)}
  else{hedgeTop(W2);fence(W2,26);Rg(0,32,3,H2-32,'#8a5a30');Rg(W2-3,32,3,H2-32,'#8a5a30');for(let y=36;y<H2;y+=14){Rg(0,y,4,4,K);Rg(W2-4,y,4,4,K)}
   // a path of stepping stones from the back door
   for(let k=0;k<4;k++){const y=H2-26-k*18;Rg(W2/2-6,y,12,8,K);Rg(W2/2-5,y+1,10,6,'#b8b2a4');Rg(W2/2-5,y+1,10,1,'#d8d2c4')}backWall(R,W2,H2,false)}
  // plots
  const Y=SCENE&&SCENE.house;if(Y&&Y.plots){const has=(x,y)=>(dx,dy)=>Y.plots.has((y+dy)*R.w+x+dx);for(const[i,p]of Y.plots){const x=i%R.w,y=(i/R.w)|0;try{GC=g;drawPlot(-1,p,tm,x,y,has(x,y))}catch(e){}}}}
 {const _rb=ROOMBG;ROOMBG=function(R,W2,H2){if(R&&(R.yard||R.court))return drawYard(R,W2,H2);const out=_rb?_rb.apply(this,arguments):undefined;
   // the back door(s) on a house's or castle's back wall
   try{if(SCENE&&SCENE.room===R&&!SCENE.yardOf){for(const dx of HDOOR(R)){const stone=R===ROOMS.castle;Rg(dx-9,4,18,28,K);Rg(dx-8,5,16,27,stone?'#3a2a20':'#7a5030');Rg(dx-8,5,16,2,stone?'#5a4430':'#9a6a3c');
     if(stone){Rg(dx-8,5,16,1,'#b2aa9a');Rg(dx-1,5,2,27,K)}else{Rg(dx-8,16,16,1,'#5a3a1e')}Rg(dx+(stone?3:4),19,2,2,'#f8d048')}}}catch(e){}return out}}
 // ---- saving (next to each house's own furniture) ----
 const items=o=>{const r={};if(o&&typeof o==='object')for(const k in o)if(INVK.includes(k))r[k]=Math.max(0,+o[k]||0);return r};
 const outF=h=>h.yf&&h.yf.size?[...h.yf].map(([i,f])=>[i,f.t,f.items||null]):null;
 const outP=h=>h.yp&&h.yp.size?[...h.yp].map(([i,p])=>[i,p.c||'',Math.round(p.g),Math.max(0,Math.round(p.w-CLK))]):null;
 function inF(h,a,R){h.yf=new Map();if(Array.isArray(a))for(const q of a){if(!Array.isArray(q))continue;const i=q[0]|0,t=q[1];if(i<2*R.w||i>=R.w*R.h||!BK.includes(t)||t==='house'||t==='castle')continue;h.yf.set(i,t==='chest'?{t,items:items(q[2])}:{t})}}
 function inP(h,a,R){h.yp=new Map();if(Array.isArray(a))for(const q of a){if(!Array.isArray(q))continue;const i=q[0]|0;if(i<2*R.w||i>=R.w*R.h)continue;const c=CROPS[q[1]]?q[1]:null;h.yp.set(i,{c,g:c?Math.max(0,+q[2]||0):0,w:CLK+Math.max(0,Math.min(WATER_FOR,+q[3]||0)),e:nowS2()})}}
 const RofH=h=>h.castle?ROOMS.court:ROOMS.yard;
 {const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);try{const put=(L,arr)=>{if(!Array.isArray(arr))return;for(const e of arr){const h=L.find(o=>o.id===e.id);if(!h)continue;const f=outF(h),p=outP(h);if(f)e.yf=f;if(p)e.yp=p}};
    put(HOUSES,s.houses);put(window.SQRH||[],s.rh);
    // standing in a yard saves you outside the house (its ret), like standing in the house does
    if(isYard()&&SCENE.ret&&s.p&&!SCENE.prev){s.p.x=Math.round(SCENE.ret.x);s.p.y=Math.round(SCENE.ret.y)}}catch(e){console.warn(e)}return s}}
 {const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);try{const get=(L,arr)=>{if(!Array.isArray(arr))return;for(const e of arr){const h=L.find(o=>o.id===e.id);if(!h)continue;h._yd=null;inF(h,e.yf,RofH(h));inP(h,e.yp,RofH(h))}};
    get(HOUSES,S&&S.houses);get(window.SQRH||[],S&&S.rh);for(const h of mine()){if(!h.yf)h.yf=new Map();if(!h.yp)h.yp=new Map()}KNOWN=new Set(mine());if(window.SQONEHOME)SQONEHOME.enforce()}catch(e){console.warn(e)}return out}}
 // packing a house packs its yard (furniture and what's in its chests); one-home (149) packs extra homes the same way
 let KNOWN=new Set();
 function packYard(h){if(h._ypk)return;h._ypk=1;for(const f of(h.yf||new Map()).values()){inv[f.t]=(inv[f.t]|0)+1;if(f.items)for(const k in f.items)inv[k]=(inv[k]|0)+(f.items[k]|0)}h.yf=new Map();h.yp=new Map()}
 setInterval(()=>{try{const now=new Set(mine());for(const h of KNOWN)if(!now.has(h)&&((h.yf&&h.yf.size)||(h.yp&&h.yp.size))){packYard(h);try{saveLocal(true)}catch(e){}}KNOWN=now}catch(e){}},400);
 if(window.SQONEHOME){const _e=SQONEHOME.enforce;SQONEHOME.enforce=function(){const before=new Set(mine());const n=_e.apply(this,arguments);for(const h of before)if(!mine().includes(h))packYard(h);KNOWN=new Set(mine());return n}}
 {const _ng=newGame;newGame=function(){const out=_ng.apply(this,arguments);KNOWN=new Set();return out}}
 // ---- what friends see: yards/<uid>/<house id> ----
 let pubKey='',pubAt=0;function pub(){pubAt=0}
 function yardsOut(){const o={};for(const h of mine()){const f=outF(h),p=h.yp&&h.yp.size?[...h.yp].map(([i,q])=>[i,q.c||'',q.c?Math.min(CROPS[q.c].max,Math.floor(q.g/CROPS[q.c].st)):0]):null;if(f||p)o[h.id]={f:f?f.map(e=>[e[0],e[1]]):[],p:p||[]}}return o}
 setInterval(()=>{try{const M=window.SQMP,F=window.SQFB;if(!M||!M.on||!M.user||!F)return;const t=performance.now();if(t-pubAt<8000)return;pubAt=t;const o=yardsOut(),k=JSON.stringify(o);if(k===pubKey)return;pubKey=k;
   F.db.set(F.db.ref(F.D,'yards/'+M.user.uid),Object.keys(o).length?o:null).catch(()=>{pubKey=''})}catch(e){}},2000);
 function readYard(h,v){const R=RofH(h),arr=x=>Array.isArray(x)?x:(x&&typeof x==='object'?Object.values(x):[]);h.yf=new Map();h.yp=new Map();
  for(const q0 of arr(v&&v.f)){const q=arr(q0);const i=q[0]|0,t=q[1];if(i>=2*R.w&&i<R.w*R.h&&BK.includes(t))h.yf.set(i,{t})}
  for(const q0 of arr(v&&v.p)){const q=arr(q0);const i=q[0]|0,c=CROPS[q[1]]?q[1]:null;if(i>=2*R.w&&i<R.w*R.h)h.yp.set(i,{c,g:c?Math.max(0,Math.min(CROPS[c].max,q[2]|0))*CROPS[c].st:0,w:0,e:0})}h._yd=null}
 window.SQYARD={isYard,goOut,goBack,yardOf,yardsOut,HDOOR,YDOOR}})();
