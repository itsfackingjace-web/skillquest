// ---- 150. Backyards and courtyards ----
// Every house has a back door in the middle of its back wall that leads to a private backyard (22 x 16 tiles: lawn, a
// patio, a pond, trees); a castle has two back gates (mirrored, beside the throne) into a courtyard (40 x 28: a terrace,
// paved paths, a pond plaza, an orchard and an avenue of trees). Both sit in a clearing in a forest (ring trees outside).
// Older saves (yard 16 wide, court 26) are moved to the new size by width (yw); OLDW. It's a room of its own, not part of the island: nobody walks in from outside.
// In it you can place furniture like indoors (it is a "home" scene whose house object is the yard: yf = its furniture,
// keyed by tile like a house) and farm: HIT grass with the hoe in your off-hand to till, plant seeds from the Bag
// (PLANT), water with the watering can, HIT ripe crops to harvest (yp = plots, growing while watered like 016's).
// Visitors: a friend standing in your house can go out back only if you trust them (072's trust list); they see your
// yard as you left it (yards/<uid>/<house id> = {f:[[i,t]], p:[[i,crop,stage]]}, written when it changes) but can't
// change anything. Packing up a house packs its yard too (furniture + chests; crops are lost like on Hollow).
// Saves: houses[].yf/yp and rh[].yf/yp next to their f.
(()=>{const T=16,K='#181018';
 ROOMS.yard={w:22,h:16,ex:-10,yard:1,floor:['#5aa848','#52a040'],wall:'#3a7a2a',trim:'#2a5a1e',items:[],solid:new Set(),lay:(x,y)=>YARD_LAY(x,y)};
 ROOMS.court={w:40,h:28,ex:-10,court:1,floor:['#5aa848','#52a040'],wall:'#8a8478',trim:'#4a443c',items:[],solid:new Set(),lay:(x,y)=>COURT_LAY(x,y)};
 // doors: in the house (back wall, x in px) and in the yard (bottom edge), pairs by index
 const HDOOR=R=>R===ROOMS.castle?[120,232]:R===ROOMS.home?[112]:[];
 // in the yard the house (or castle) stands along the top, its door facing the lawn; you come out below the door and go
 // back in by walking up into it. Both of the castle hall's back gates lead to the courtyard's one gate.
 const YDOOR=R=>R.court?[R.w*8,R.w*8]:R.yard?[R.w*8]:[];
 const DOORY=3;// the row just below the door
 const isYard=()=>!!(SCENE&&SCENE.room&&(SCENE.room.yard||SCENE.room.court)&&SCENE.yardOf);
 const inHouse=()=>!!(SCENE&&SCENE.id==='home'&&SCENE.house&&!SCENE.yardOf&&(SCENE.room===ROOMS.home||SCENE.room===ROOMS.castle));
 const nowS2=()=>{try{return nowS()}catch(e){return Math.floor(Date.now()/1000)}};
 // ---- the yard object for a house (kept on the house: h.yf furniture, h.yp plots) ----
 function yardOf(h,ro){if(!h.yf)h.yf=new Map();if(!h.yp)h.yp=new Map();
  if(!h._yd)h._yd={id:(h._oid||h.id)+'~y',_oid:(h._oid||h.id)+'~y',_owner:h._owner,_foreign:h._foreign,castle:h.castle,yard:1,furn:h.yf,plots:h.yp,base:h};
  h._yd.ro=!!ro;return h._yd}
 // ---- going out and coming back ----
 let busy=false,LOCK=null;const lock=()=>{LOCK={x:P.x,y:P.y,s:SCENE}};
 function goOut(i){const S=SCENE,h=S.house,R=h.castle||S.room===ROOMS.castle?ROOMS.court:ROOMS.yard;
  if(h._owner&&window.SQMP&&SQMP.user&&h._owner!==SQMP.user.uid){if(busy)return;
   if(typeof trustedBy==='function'&&!trustedBy(h._owner)){say('Only people its owner trusts can go out back.');msgT=4;try{sfx('swish')}catch(e){}P.y+=4;return}
   busy=true;const F=window.SQFB;F.db.get(F.db.ref(F.D,'yards/'+h._owner+'/'+(h._oid||h.id))).then(s=>{busy=false;readYard(h,s.val());enter(S,R,i,true)}).catch(()=>{busy=false;readYard(h,null);enter(S,R,i,true)});return}
  enter(S,R,i,false)}
 function enter(S,R,i,ro){if(SCENE!==S)return;const Y=yardOf(S.house,ro),dx=YDOOR(R)[Math.min(i,YDOOR(R).length-1)];
  SCENE={id:'home',room:R,house:Y,ret:S.ret,prev:S.prev,yardOf:S,door:i};P.x=dx;P.y=DOORY*16+10;face=[0,1];lock();en=[];FISH=null;try{if(BUILD)endBuild()}catch(e){}FADE_AT=performance.now();try{sfx('door')}catch(e){}
  if(ro)say('You step into '+(S.house._owner&&window.SQMP?(SQMP.players.get(S.house._owner)||{}).n||'your friend':'your friend')+'\'s '+(R.court?'courtyard':'backyard')+'. Have a look around!');}
 function goBack(){const S=SCENE,B=S.yardOf,i=S.door|0,hx=HDOOR(B.room)[Math.min(i,HDOOR(B.room).length-1)];SCENE=B;P.x=hx;P.y=2*16+12;face=[0,1];lock();FADE_AT=performance.now();try{if(BUILD)endBuild()}catch(e){}try{sfx('door')}catch(e){}}
 {const _ls=leaveScene;leaveScene=function(){if(isYard()){goBack();return}return _ls.apply(this,arguments)}}
 // ---- every frame: doors, growing ----
 const keyUp=()=>face[1]<0,keyDn=()=>face[1]>0;
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{if(dead||menuOpen||pnOpen||!SCENE)return out;
    // after going through a door you have to step away from it (or turn round) before it takes you back
    if(LOCK&&(!keyUp()||P.y-LOCK.y>10||Math.abs(P.x-LOCK.x)>10||SCENE!==LOCK.s))LOCK=null;if(LOCK){if(isYard()&&P.y<DOORY*16+4)P.y=DOORY*16+4;return out}
    if(inHouse()&&P.y<2*16+9&&keyUp()){const L=HDOOR(SCENE.room);for(let i=0;i<L.length;i++)if(Math.abs(P.x-L[i])<7){goOut(i);break}}
    else if(isYard()&&P.y<DOORY*16+5&&keyUp()){for(const dx of YDOOR(SCENE.room))if(Math.abs(P.x-dx)<10){goBack();break}}}catch(e){console.warn(e)}return out}}
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);if(menuOpen||pnOpen)return out;try{for(const h of mine())if(h.yp)for(const p of h.yp.values())if(p.c&&wet(p)&&!ripe(p))p.g+=dt}catch(e){}return out}}
 // your own houses only: HOUSES also holds other players' houses while online (_foreign); a friend's yard you visited
 // must never be packed into your bag when their house unloads
 const mine=()=>HOUSES.concat(window.SQRH||[]).filter(h=>h&&!h._foreign);
 // ---- farming in the yard (HIT) ----
 const yi=(R,x,y)=>y*R.w+x;
 const onDoorTile=(R,x,y)=>y<=DOORY&&YDOOR(R).some(dx=>Math.abs(x*16+8-dx)<16);
 function tillable(R,Y,x,y){if(x<0||y<2||x>=R.w||y>=R.h||onDoorTile(R,x,y))return false;const i=yi(R,x,y);return R.lay(x,y)===2&&!R.solid.has(i)&&!regrowing(R,i)&&!Y.furn.has(i)&&!Y.plots.has(i)}
 {const _a=attack;attack=function(){if(!isYard()||dead||menuOpen||pnOpen||BUILD||swing>0||FISH)return _a.apply(this,arguments);const R=SCENE.room,Y=SCENE.house;
   const[x,y]=frontTile(),i=yi(R,x,y),p=Y.plots.get(i);
   if(Y.ro){if(p||Y.furn.has(i)){say('This is your friend\'s yard: you can look, but not touch.');msgT=3;swing=.2;return}return _a.apply(this,arguments)}
   // keyboard and mouse: Space / left-click is melee only, the hoe and can work from X (140); a tool in the bag is swapped in
   const melee=!(window.SQOFFVIA&&SQOFFVIA()),off=()=>!TL.bow&&!WAND;
   const want=k=>{if(melee)return false;const has=k==='eq_can'?TL.can:TL.hoe;if(has)return true;if((inv[k]|0)<1||!off()&&!(TL.hoe||TL.can))return false;try{equipItem(k)}catch(e){}return k==='eq_can'?!!TL.can:!!TL.hoe};
   if(p){swing=.25;if(ripe(p)){harvest(-1,p);saveLocal(true);pub();return}
    if(p.c&&!wet(p)){if(!want('eq_can')){say(melee?(window.SQOFFHINT?SQOFFHINT('water it with your watering can')+'.':'Use your off-hand to water it.'):'Put your watering can in your off-hand to water it.');try{sfx('swish')}catch(e){}return}
     p.w=CLK+WATER_FOR;addXp(11,3);say('Watered the '+CROPS[p.c].n.toLowerCase()+'.');try{sfx('splash')}catch(e){}saveLocal();return}
    if(!p.c){say('This soil is ready. Choose seeds in your Bag and tap PLANT.');try{sfx('swish')}catch(e){}return}
    const C=CROPS[p.c],left=Math.max(0,C.max*C.st-p.g);say(C.n+' is growing. About '+Math.ceil(left/60)+' min of watered time left.');try{sfx('swish')}catch(e){}return}
   if(tillable(R,Y,x,y)&&!en.some(n=>!n.dead)&&(TL.hoe||TL.can||(inv.eq_hoe|0)>0)&&want('eq_hoe')){swing=.25;Y.plots.set(i,{c:null,g:0,w:0,e:nowS2()});addXp(11,4);try{sfx('chop')}catch(e){}saveLocal(true);pub();return}
   if(R.lay(x,y)!==2&&!R.solid.has(i)&&!Y.furn.has(i)&&y>=2&&!onDoorTile(R,x,y)&&(TL.hoe||TL.can)&&!melee&&!en.some(n=>!n.dead)){swing=.2;say('You can only till grass.');try{sfx('swish')}catch(e){}return}
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
 {const _cp=canPlaceIn;canPlaceIn=function(x,y){if(isYard()){const R=SCENE.room,Y=SCENE.house;if(Y.ro||Y.plots.has(yi(R,x,y))||onDoorTile(R,x,y)||regrowing(R,yi(R,x,y)))return false}return _cp.apply(this,arguments)}}
 {const _t=talk;talk=function(){if(isYard()&&SCENE.house.ro&&!dead&&!pnOpen){try{if(nearFurn()){say('This is your friend\'s yard: you can look, but not touch.');msgT=3;return}}catch(e){}}return _t.apply(this,arguments)}}
 // ---- drawing: the game's own ground (hdBakeR, like the islands), its trees, bushes and buildings ----
 // The ground comes from a small map of tile types (0 water, 2 grass, 7 forest floor, 11 paving), baked once per room.
 // Trees and bushes are the islands' own objects (room items {t:'_obj'}, solid); the house or castle is drawn by drBld,
 // as a room item so it sorts with you. Everything is mirrored around the middle.
 const CK=new Map();
 function chunk(R,kx,ky){const k=(R.yard?'y':'c')+kx+','+ky;let c=CK.get(k);if(c!==undefined)return c;try{c=hdBakeR(kx,ky,(x,y)=>x<0||y<0||x>=R.w||y>=R.h?7:R.lay(x,y))}catch(e){c=null}CK.set(k,c);return c}
 function drawYard(R,W2,H2){const tm=performance.now()/1000,cx=camX(),cy=camY(),vw=W/Z,vh=H/Z;Rg(cx-32,cy-32,vw+64,vh+64,'#2e5a26');
  // the whole view is baked ground: the clearing, and forest floor all around it (no edge, no void)
  for(let ky=Math.floor((cy-16)/128);ky<=Math.floor((cy+vh+16)/128);ky++)for(let kx=Math.floor((cx-16)/128);kx<=Math.floor((cx+vw+16)/128);kx++){const c=chunk(R,kx,ky);if(c){g.drawImage(c,kx*128,ky*128,128,128);continue}if(kx<0||ky<0||kx*8>=R.w||ky*8>=R.h)continue;if(c)g.drawImage(c,kx*128,ky*128,128,128);for(let y=ky*8;y<Math.min(R.h,ky*8+8);y++)for(let x=kx*8;x<Math.min(R.w,kx*8+8);x++)Rg(x*16,y*16,16,16,R.lay(x,y)===11?'#b8b2a4':R.lay(x,y)===0?'#3a8ad8':'#5aa848')}
  // plots
  const Y=SCENE&&SCENE.house;if(Y&&Y.plots){const has=(x,y)=>(dx,dy)=>Y.plots.has((y+dy)*R.w+x+dx);for(const[i,p]of Y.plots){const x=i%R.w,y=(i/R.w)|0;try{GC=g;drawPlot(-1,p,tm,x,y,has(x,y))}catch(e){}}}}
 {const _df=drawFurn;drawFurn=function(it,tm){if(it&&it.t==='_ybld'){try{drBld(it.b,tm)}catch(e){}return}
   // the forest around the clearing: only the trees on screen
   if(it&&it.ring){const x=it.x*16,y=it.y*16,cx=camX(),cy=camY();if(x<cx-48||x>cx+W/Z+48||y<cy-16||y>cy+H/Z+64)return}return _df.apply(this,arguments)}}
 // the layouts
 // backyard 22 x 16: the house's door at x 10-11; a path down to a patio; a pond in the lower right
 function YARD_LAY(x,y){if(y<=1)return 7;{const dx=Math.abs(x-17),dy=Math.abs(y-12);if(dx<=3&&dy<=1||dx<=2&&dy<=2)return 0}
  if((x===10||x===11)&&y>=3&&y<=7)return 11;if(x>=8&&x<=13&&y>=8&&y<=10)return 11;return 2}
 // courtyard 40 x 28 (mirrored at x 19.5): a terrace below the castle, the main walk down the middle, a cross walk, a pond
 // in a paved plaza in the centre, an avenue of trees below it and orchards in the lower corners
 function COURT_LAY(x,y){const m=Math.min(x,39-x);if(y<=1)return 7;
  const dx=Math.abs(x-19.5),dy=Math.abs(y-13.5);if(dx<=3.6&&dy<=2.6&&!(dx>3&&dy>2))return 0;// the pond
  if(dx<=5.6&&dy<=4.6&&!(dx>5&&dy>4))return 11;// its plaza
  if(y>=3&&y<=4&&m>=10)return 11;if(m>=19&&y>=3)return 11;if((y===13||y===14)&&m>=3)return 11;
  if((m===3)&&y>=5&&y<=24||y===24&&m>=3&&m<=16)return 11;return 2}
 function decorate(R){const W=R.w,put=(x,y,t,v)=>{R.items.push({t:'_obj',x,y,o:{t,hp:OHP[t]||3,v}});R.solid.add(y*W+x)},both=(x,y,t,v)=>{put(x,y,t,v);put(W-1-x,y,t,v)};
  const bld=(w,castle)=>{const tx=W/2-w/2,b=Object.assign({},HOUSE_STYLE,{w,tx,ty:1},castle?{castle:1}:{});R.items.push({t:'_ybld',x:Math.floor(tx+(w-1)/2),y:2,b,sh:1});
   for(let y=1;y<=2;y++)for(let x=Math.floor(tx);x<=Math.ceil(tx+w-1);x++)R.solid.add(y*W+x);R.solid.delete(2*W+W/2-1);R.solid.delete(2*W+W/2)};
  for(let y=0;y<R.h;y++)for(let x=0;x<W;x++)if(R.lay(x,y)===0)R.solid.add(y*W+x);
  if(R.yard){bld(7,false);
   both(1,2,'oak');both(3,2,'maple');both(5,2,'tree');both(0,4,'bush');both(0,6,'bush');both(0,8,'bush');both(0,10,'bush');both(0,12,'bush');
   put(1,14,'oak');put(3,15,'tree');put(14,9,'nutbush');put(20,14,'bush');put(20,15,'tree');put(5,15,'bush');put(8,15,'bush');put(12,15,'bush');
   both(7,9,'bush')}
  else{bld(15,true);
   both(1,2,'maple');both(3,2,'oak');both(5,2,'tree');both(7,2,'maple');both(9,2,'oak');
   for(let y=5;y<=25;y+=2)both(0,y,'bush');for(let x=6;x<=16;x+=2)both(x,6,'bush');both(5,9,'nutbush');both(11,10,'bush');both(12,17,'bush');
   for(const y of[18,21,24,27])both(17,y,y===27?'oak':'maple');
   for(const y of[17,20])for(const x of[5,8,11,14])both(x,y,'tree');for(const x of[5,8,11])both(x,26,'tree');for(let x=1;x<=15;x+=2)both(x,27,'bush')}
  // the forest around the clearing (drawn only when on screen)
  const hs=(x,y)=>{let h=(x*73856093^y*19349663)>>>0;h=(h^h>>13)*1274126177>>>0;return h%1000/1000};
  for(let y=-9;y<R.h+9;y++)for(let x=-7;x<W+7;x++){const out=x<0||y<0||x>=W||y>R.h;if(!out||(x+y)&1)continue;const r=hs(x,y);if(r<.12)continue;
   R.items.push({t:'_obj',x,y,ring:1,o:{t:r<.5?'oak':r<.8?'tree':'maple',hp:99}})}}
 decorate(ROOMS.yard);decorate(ROOMS.court);
 // ---- the trees, bushes and ponds work like the islands' ----
 // HIT a tree or bush: the yard counts as an island for that one call, so the islands' own gathering runs (050's
 // rgGather, 083's tiered trees, 098's hazel bushes: same tools needed, same logs/berries/nuts, XP and perks). What you
 // take grows back after 4 minutes (R.gone, like rgTick); nothing can be planted or placed on its spot meanwhile.
 // The ponds are fishing water (fishWaterAt), with Hollow's fish. Friends can fish but not take anything.
 for(const R of[ROOMS.yard,ROOMS.court]){R.cells=new Map();R.gone=[];for(const it of R.items)if(it.t==='_obj'&&!it.ring)rgCellAdd(R,it)}
 const objAt=(R,x,y)=>R.items.find(it=>it.t==='_obj'&&!it.ring&&!it.gone&&it.x===x&&it.y===y);
 const regrowing=(R,i)=>R.gone&&R.gone.some(g2=>g2.it.y*R.w+g2.it.x===i);
 {const _df=drawFurn;drawFurn=function(it){if(it&&it.t==='_obj'&&it.gone&&SCENE&&SCENE.room&&(SCENE.room.yard||SCENE.room.court))return;return _df.apply(this,arguments)}}
 {const _a=attack;attack=function(){if(isYard()&&FISH&&!dead&&!menuOpen&&!pnOpen){FISH=null;say('You reel in your line');return}
   if(!isYard()||dead||menuOpen||pnOpen||BUILD||FISH||swing>0)return _a.apply(this,arguments);const R=SCENE.room,[x,y]=frontTile(),it=objAt(R,x,y);
   // casting (the house scene's own HIT, 012, would take it otherwise; this is 093's island cast)
   if(!it){const[fx,fy]=front(14);if(fishWaterAt(Math.floor(fx/16),Math.floor(fy/16))&&!facingNpc()){if(!TL.rod){say('You need a fishing rod - buy one at the general store');return}
     const[bx,by]=front(24);FISH={px:P.x,py:P.y,bx,by,t:0,wait:2+Math.random()*3,bite:0};sfx('cast');say('You cast your line...');return}}
   if(!it||en.some(n=>!n.dead))return _a.apply(this,arguments);
   if(SCENE.house.ro){say('This is your friend\'s yard: you can look, but not touch.');msgT=3;swing=.2;return}
   R.region='_yard';try{return _a.apply(this,arguments)}finally{delete R.region}}}
 {const _u=upd;upd=function(dt){const out=_u.apply(this,arguments);try{for(const R of[ROOMS.yard,ROOMS.court])for(let j=R.gone.length-1;j>=0;j--){const g2=R.gone[j];if(CLK-g2.at<=240)continue;
    const it=g2.it,here=SCENE&&SCENE.room===R;if(here&&Math.hypot(P.x-(it.x*16+8),P.y-(it.y*16+8))<40)continue;
    it.gone=false;it.o.hp=OHP[it.o.t]||3;rgCellAdd(R,it);R.solid.add(it.y*R.w+it.x);R.gone.splice(j,1)}}catch(e){}return out}}
 {const _fw=fishWaterAt;fishWaterAt=function(tx,ty){if(isYard()){const R=SCENE.room;return tx>=0&&ty>=2&&tx<R.w&&ty<R.h&&R.lay(tx,ty)===0}return _fw.apply(this,arguments)}}
 {const _rb=ROOMBG;ROOMBG=function(R,W2,H2){if(R&&(R.yard||R.court))return drawYard(R,W2,H2);const out=_rb?_rb.apply(this,arguments):undefined;
   // the back door(s) on a house's or castle's back wall
   try{if(SCENE&&SCENE.room===R&&!SCENE.yardOf){for(const dx of HDOOR(R)){const stone=R===ROOMS.castle;Rg(dx-9,4,18,28,K);Rg(dx-8,5,16,27,stone?'#3a2a20':'#7a5030');Rg(dx-8,5,16,2,stone?'#5a4430':'#9a6a3c');
     if(stone){Rg(dx-8,5,16,1,'#b2aa9a');Rg(dx-1,5,2,27,K)}else{Rg(dx-8,16,16,1,'#5a3a1e')}Rg(dx+(stone?3:4),19,2,2,'#f8d048')}}}catch(e){}return out}}
 // ---- saving (next to each house's own furniture) ----
 const items=o=>{const r={};if(o&&typeof o==='object')for(const k in o)if(INVK.includes(k))r[k]=Math.max(0,+o[k]||0);return r};
 const outF=h=>h.yf&&h.yf.size?[...h.yf].map(([i,f])=>[i,f.t,f.items||null]):null;
 const outP=h=>h.yp&&h.yp.size?[...h.yp].map(([i,p])=>[i,p.c||'',Math.round(p.g),Math.max(0,Math.round(p.w-CLK))]):null;
 function inF(h,a,R,ow){h.yf=new Map();if(Array.isArray(a))for(const q of a){if(!Array.isArray(q))continue;const i=mv(q[0]|0,ow,R),t=q[1];if(i<2*R.w||i>=R.w*R.h||!BK.includes(t)||t==='house'||t==='castle')continue;h.yf.set(i,t==='chest'?{t,items:items(q[2])}:{t})}}
 function inP(h,a,R,ow){h.yp=new Map();if(Array.isArray(a))for(const q of a){if(!Array.isArray(q))continue;const i=mv(q[0]|0,ow,R);if(i<2*R.w||i>=R.w*R.h)continue;const c=CROPS[q[1]]?q[1]:null;h.yp.set(i,{c,g:c?Math.max(0,+q[2]||0):0,w:CLK+Math.max(0,Math.min(WATER_FOR,+q[3]||0)),e:nowS2()})}}
 const RofH=h=>h.castle?ROOMS.court:ROOMS.yard;
 const OLDW=h=>h.castle?26:16;// widths before 2026.11.13-3
 const mv=(i,ow,R)=>ow===R.w||!ow?i:(Math.floor(i/ow))*R.w+i%ow+Math.floor((R.w-ow)/2);
 // yards saved before the trees/house/pond were added: anything now standing on one moves to the nearest free spot
 function settle(h,ro){const R=RofH(h),W=R.w,used=new Set([...h.yf.keys(),...h.yp.keys()]),free=i=>{const x=i%W,y=i/W|0;return y>=2&&!R.solid.has(i)&&!onDoorTile(R,x,y)&&!used.has(i)};
  for(const M of[h.yf,h.yp])for(const[i,v]of[...M]){const x=i%W,y=i/W|0,grass=j=>M!==h.yp||R.lay(j%W,j/W|0)===2;if(!R.solid.has(i)&&!onDoorTile(R,x,y)&&grass(i))continue;let best=-1,bd=1e9;
   for(let j=2*W;j<W*R.h;j++)if(free(j)&&grass(j)){const d=Math.hypot(j%W-x,(j/W|0)-y);if(d<bd){bd=d;best=j}}
   M.delete(i);used.delete(i);if(best>=0){M.set(best,v);used.add(best)}else if(M===h.yf&&!ro){inv[v.t]=(inv[v.t]|0)+1;if(v.items)for(const k in v.items)inv[k]=(inv[k]|0)+(v.items[k]|0)}}}
 {const _sn=snap;snap=function(){const s=_sn.apply(this,arguments);try{const put=(L,arr)=>{if(!Array.isArray(arr))return;for(const e of arr){const h=L.find(o=>o.id===e.id);if(!h)continue;const f=outF(h),p=outP(h);if(f)e.yf=f;if(p)e.yp=p;if(f||p)e.yw=RofH(h).w}};
    put(HOUSES,s.houses);put(window.SQRH||[],s.rh);
    // standing in a yard saves you outside the house (its ret), like standing in the house does
    if(isYard()&&SCENE.ret&&s.p&&!SCENE.prev){s.p.x=Math.round(SCENE.ret.x);s.p.y=Math.round(SCENE.ret.y)}}catch(e){console.warn(e)}return s}}
 {const _ap=applySave;applySave=function(S){const out=_ap.apply(this,arguments);try{const get=(L,arr)=>{if(!Array.isArray(arr))return;for(const e of arr){const h=L.find(o=>o.id===e.id);if(!h)continue;h._yd=null;const ow=+e.yw||OLDW(h);inF(h,e.yf,RofH(h),ow);inP(h,e.yp,RofH(h),ow);settle(h)}};
    get(HOUSES,S&&S.houses);get(window.SQRH||[],S&&S.rh);for(const h of mine()){if(!h.yf)h.yf=new Map();if(!h.yp)h.yp=new Map()}KNOWN=new Set(mine());if(window.SQONEHOME)SQONEHOME.enforce()}catch(e){console.warn(e)}return out}}
 // packing a house packs its yard (furniture and what's in its chests); one-home (149) packs extra homes the same way
 let KNOWN=new Set();
 function packYard(h){if(h._ypk)return;h._ypk=1;for(const f of(h.yf||new Map()).values()){inv[f.t]=(inv[f.t]|0)+1;if(f.items)for(const k in f.items)inv[k]=(inv[k]|0)+(f.items[k]|0)}h.yf=new Map();h.yp=new Map()}
 setInterval(()=>{try{const now=new Set(mine());for(const h of KNOWN)if(!now.has(h)&&((h.yf&&h.yf.size)||(h.yp&&h.yp.size))){packYard(h);try{saveLocal(true)}catch(e){}}KNOWN=now}catch(e){}},400);
 if(window.SQONEHOME){const _e=SQONEHOME.enforce;SQONEHOME.enforce=function(){const before=new Set(mine());const n=_e.apply(this,arguments);for(const h of before)if(!mine().includes(h))packYard(h);KNOWN=new Set(mine());return n}}
 {const _ng=newGame;newGame=function(){const out=_ng.apply(this,arguments);KNOWN=new Set();return out}}
 // ---- what friends see: yards/<uid>/<house id> ----
 let pubKey='',pubAt=0;function pub(){pubAt=0}
 function yardsOut(){const o={};for(const h of mine()){const f=outF(h),p=h.yp&&h.yp.size?[...h.yp].map(([i,q])=>[i,q.c||'',q.c?Math.min(CROPS[q.c].max,Math.floor(q.g/CROPS[q.c].st)):0]):null;if(f||p)o[h.id]={f:f?f.map(e=>[e[0],e[1]]):[],p:p||[],w:RofH(h).w}}return o}
 setInterval(()=>{try{const M=window.SQMP,F=window.SQFB;if(!M||!M.on||!M.user||!F)return;const t=performance.now();if(t-pubAt<8000)return;pubAt=t;const o=yardsOut(),k=JSON.stringify(o);if(k===pubKey)return;pubKey=k;
   F.db.set(F.db.ref(F.D,'yards/'+M.user.uid),Object.keys(o).length?o:null).catch(()=>{pubKey=''})}catch(e){}},2000);
 function readYard(h,v){const R=RofH(h),ow=+(v&&v.w)||OLDW(h),arr=x=>Array.isArray(x)?x:(x&&typeof x==='object'?Object.values(x):[]);h.yf=new Map();h.yp=new Map();
  for(const q0 of arr(v&&v.f)){const q=arr(q0);const i=mv(q[0]|0,ow,R),t=q[1];if(i>=2*R.w&&i<R.w*R.h&&BK.includes(t))h.yf.set(i,{t})}
  for(const q0 of arr(v&&v.p)){const q=arr(q0);const i=mv(q[0]|0,ow,R),c=CROPS[q[1]]?q[1]:null;if(i>=2*R.w&&i<R.w*R.h)h.yp.set(i,{c,g:c?Math.max(0,Math.min(CROPS[c].max,q[2]|0))*CROPS[c].st:0,w:0,e:0})}settle(h,true);h._yd=null}
 window.SQYARD={isYard,goOut,goBack,yardOf,yardsOut,HDOOR,YDOOR}})();
