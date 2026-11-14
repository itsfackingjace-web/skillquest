// ---------------------------------------------------------------- 95. More Foraging: nuts, mushrooms, cactus fruit; the squirrel and the ore golems
// - Mushroom patches grow by trees (Foraging 5) and hazel bushes carry nuts (Foraging 10). Cacti give real cactus
//   fruit now. Mushrooms and nuts can be eaten raw or cooked (roasted mushrooms, roasted nuts) at a campfire or stove.
// - Squirrel pet: 1 in 1,000 from berry bushes. It forages for you: every so often it brings berries, nuts, mushrooms,
//   cactus fruit, a few coins, or (rarely) a healing potion.
// - Ore golems: 1 in 2,000 from mining iron, gold, mithril or adamant ore. Each stands idle with a little bob, curls up and
//   rolls to keep up with you, and now and then digs up its own ore for you.
{const K='#181018',h95=(a,b)=>{const v=Math.sin(a*41.31+b*17.77+9.3)*43758.5453;return v-Math.floor(v)};
 // ---- the items ----
 const IT={cfruit:['Cactus fruit','Sweet, prickly fruit from a cactus. Eat it raw, or sell it.',4],nuts:['Nuts','Hazelnuts from a hazel bush. A handful fills you up; roast them at a campfire.',5],
  shroom:['Mushrooms','Wild mushrooms from the forest floor. Better cooked.',6],cshroom:['Roasted mushrooms','Mushrooms roasted over a fire. Heals 2 hearts.',14],rnuts:['Roasted nuts','Toasty and filling. Heals 1 heart.',11]};
 for(const k in IT){if(!INVK.includes(k))INVK.push(k);EXTRA_BAG.push(k);INAME[k]=IT[k][0];IDESC[k]=IT[k][1];SELLP[k]=IT[k][2];SN[k]=IT[k][0];SHORT[k]=IT[k][0].toLowerCase();inv[k]=inv[k]|0}
 COOKS.push({raw:'shroom',ck:'cshroom',n:'mushrooms',lv:5,xp:35},{raw:'nuts',ck:'rnuts',n:'nuts',lv:3,xp:25});
 FOODS.push({k:'cshroom',n:'roasted mushrooms',heal:2,hun:35},{k:'rnuts',n:'roasted nuts',heal:1,hun:35},{k:'cfruit',n:'cactus fruit',heal:1,hun:22},{k:'nuts',n:'nuts',heal:0,hun:16},{k:'shroom',n:'raw mushrooms',heal:0,hun:10});
 FOODS.sort((a,b)=>b.heal-a.heal||b.hun-a.hun);try{CKSET.add('cshroom');CKSET.add('rnuts')}catch(e){}
 {const ART={cfruit:[['..GG..','.GRRG.','GRRRRG','RRYRRR','RRRRYR','.RRRR.'],{G:'#58a838',R:'#e04870',Y:'#f8e070'}],nuts:[['.BB.BB','BLLBLL','BLLBLL','.BB.BB','..BB..','.BLLB.','.BLLB.','..BB..'],{B:'#6a4020',L:'#b07838'}],
   shroom:[['.RRRR.','RRWRRR','RRRRWR','..SS..','..SS..','.SSSS.'],{R:'#c83830',W:'#f8f0e0',S:'#e8dcc0'}],cshroom:[['.BBBB.','BBYBBB','BBBBYB','..SS..','..SS..','.SSSS.'],{B:'#8a4a28',Y:'#e0a060',S:'#c8a878'}],
   rnuts:[['.DD.DD','DLLDLL','DLLDLL','.DD.DD','..DD..','.DLLD.','.DLLD.','..DD..'],{D:'#4a2810',L:'#d0904a'}]};
  const _ic=iconURL;iconURL=function(k,col){const A=ART[k];if(!A)return _ic(k,col);const key='g95'+k;if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),[rows,P]=A,w=rows[0].length*2,hh=rows.length*2,ox=Math.floor((14-w)/2),oy=Math.floor((14-hh)/2);
   rows.forEach((row,j)=>{for(let i=0;i<row.length;i++){const cl=P[row[i]];if(cl){x.fillStyle=cl;x.fillRect(ox+i*2,oy+j*2,2,2)}}});
   const d=x.getImageData(0,0,14,14).data,o=document.createElement('canvas');o.width=14;o.height=14;const ox2=o.getContext('2d');ox2.fillStyle='#1e1820';for(let j=0;j<14;j++)for(let i=0;i<14;i++){if(d[(j*14+i)*4+3])continue;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=i+a,Y=j+b;if(X>=0&&Y>=0&&X<14&&Y<14&&d[(Y*14+X)*4+3]){ox2.fillRect(i,j,1,1);break}}}ox2.drawImage(c,0,0);return ICONC[key]=o.toDataURL()}}
 // ---- the plants: a mushroom patch and a hazel bush ----
 const FOR={shroom:{n:'mushroom patch',lv:5,xp:22,give:()=>[['shroom',1+(Math.random()<.4?1:0)]],hp:1},nutbush:{n:'hazel bush',lv:10,xp:32,give:()=>[['nuts',2+(Math.random()<.35?1:0)]],hp:2}};
 for(const k in FOR){OHP[k]=FOR[k].hp}
 Object.assign(RG_OBJCOL,{shroom:'#c84838',nutbush:'#7a6a38'});
 const SPC={};
 function plantSprite(k,v){const key=k+v;if(SPC[key])return SPC[key];const c=document.createElement('canvas');c.width=20;c.height=18;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
  if(k==='shroom'){const cap=v===2?['#8a50d8','#b888f8','#e0c8ff']:v===1?['#b06a2a','#d89048','#f0c890']:['#b82828','#e04a3a','#f8f0e0'];
   const one=(cx,by,s)=>{r(cx-1,by-3*s,2,3*s,'#e8dcc0');r(cx-1,by-3*s,1,3*s,'#c8bca0');const w=3+2*s;r(cx-w,by-3*s-3,w*2,3,cap[1]);r(cx-w+1,by-3*s-4,w*2-2,1,cap[1]);r(cx-w+1,by-3*s-3,w*2-2,1,cap[0]===cap[0]?cap[1]:cap[1]);r(cx-w,by-3*s-1,w*2,1,cap[0]);
    if(v===0){r(cx-w+2,by-3*s-3,1,1,cap[2]);r(cx+1,by-3*s-4,1,1,cap[2])}else r(cx-w+1,by-3*s-4,2,1,cap[2])};
   one(7,16,2);one(13,16,1);one(4,16,1)}
  else{const L=['#4a6a28','#6a8a38','#8aaa48'];for(const[cx,cy,rx,ry]of[[10,9,8,6],[6,11,5,4],[14,11,5,4]])for(let j=-ry;j<=ry;j++)for(let i=-rx;i<=rx;i++)if((i/rx)**2+(j/ry)**2<=1)r(cx+i,cy+j,1,1,j<-ry/3?L[2]:j<ry/3?L[1]:L[0]);
   for(const[a,b]of[[5,8],[9,6],[13,9],[8,11],[15,7],[11,12]]){r(a,b,2,2,'#8a5a28');r(a,b,1,1,'#c08848')}r(9,15,2,3,'#5a3a1e')}
  // outline
  const d=x.getImageData(0,0,20,18).data;const o=document.createElement('canvas');o.width=20;o.height=18;const ox=o.getContext('2d');ox.fillStyle=K;for(let j=0;j<18;j++)for(let i=0;i<20;i++){if(d[(j*20+i)*4+3])continue;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=i+a,Y=j+b;if(X>=0&&Y>=0&&X<20&&Y<18&&d[(Y*20+X)*4+3]){ox.fillRect(i,j,1,1);break}}}ox.drawImage(c,0,0);return SPC[key]=o}
 {const _o=OBJHD;OBJHD=(o,x,y,bx,by,s,tm)=>{if(o&&FOR[o.t]){const v=o.v==='void'?2:o.v==='brown'?1:0,sp=plantSprite(o.t,v);shd(bx,by-1,o.t==='shroom'?12:18);g.drawImage(sp,Math.round(bx-10+(s||0)),Math.round(by-17));
   if(v===2&&dark()>.15){g.fillStyle='rgba(170,110,255,.18)';g.beginPath();g.arc(bx,by-6,12,0,6.283);g.fill()}return true}return _o?_o(o,x,y,bx,by,s,tm):false}}
 // where they grow (same for every player): mushrooms in the shade of trees, hazel bushes in open meadows
 const isTree=t=>t==='tree'||t==='pine'||t==='oak'||t==='willow'||t==='maple'||t==='yew';
 const near8=(f)=>{for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)if((a||b)&&f(a,b))return true;return false};
 window.SQHOLLOWFORAGE=function(){let ns=0,nn=0;for(let y=4;y<N-4;y++)for(let x=4;x<N-4;x++){const i=y*N+x,t=tile[i];if(t!==2&&t!==4)continue;if(obj[i]||PROT.has(i)||BS.has(i)||STR.has(i)||TOWNZ.has(i)||(typeof BRIDGE!=='undefined'&&BRIDGE.has(i))||inVillage(x,y)||inTownTiles(x,y))continue;
   const r=h95(x,y);if(near8((a,b)=>{const o=obj[(y+b)*N+x+a];return o&&isTree(o.t)})){if(r<(t===4?.012:.03)){obj[i]={t:'shroom',hp:1,v:t===4?'brown':undefined};ns++}continue}
   if(t===2&&r>.994&&!near8((a,b)=>!!obj[(y+b)*N+x+a]||PROT.has((y+b)*N+x+a))){obj[i]={t:'nutbush',hp:2};nn++}}return[ns,nn]};
 try{SQHOLLOWFORAGE()}catch(e){console.warn('forage',e)}
 const RGF={briarwood:[.03,.006,null],ironcrest:[.008,.002,'brown'],shattered:[.015,0,'void'],ashfall:[.002,0,'brown']};
 function rgForage(R){if(!R||!R.region||R._for||!RGF[R.region])return;R._for=1;const[ps,pn,v]=RGF[R.region],W=R.w,H=R.h,seed=R.region.length*77.1+R.h;
  for(let y=3;y<H-3;y++)for(let x=3;x<W-3;x++){const i=y*W+x;if(!RG_WALK[R.tiles[i]]||R.tiles[i]===14||R.solid.has(i)||rgObjAt(R,x,y))continue;if(R.reach&&!R.reach[i])continue;
   const res=R.reserved||[];if(res.some(q=>x>=q.x-1&&y>=q.y-1&&x<q.x+q.w+1&&y<q.y+q.h+1))continue;try{if(typeof rfMap==='function'&&rfMap(R.region).has(x+','+y))continue}catch(e){}
   const r=h95(x+seed,y),byTree=near8((a,b)=>{const it=rgObjAt(R,x+a,y+b);return it&&isTree(it.o.t)});let k=null;
   if(byTree&&r<ps)k='shroom';else if(!byTree&&pn&&r>1-pn&&R.tiles[i]===2)k='nutbush';if(!k)continue;
   const it={t:'_obj',o:{t:k,hp:OHP[k],v:k==='shroom'?v||undefined:undefined},x,y,solid:true};R.items.push(it);R.solid.add(i);try{rgCellAdd(R,it)}catch(e){}}}
 {const _lr=loadRegion;loadRegion=function(id,want,ret){const ok=_lr(id,want,ret);try{const R=SCENE&&SCENE.room;if(ok&&R&&R.region)rgForage(R)}catch(e){console.warn(e)}return ok}}
 // picking them (HIT, like a berry bush)
 function forageHit(o,x,y,done){const F=FOR[o.t];if(!F)return false;if(lvOf(3)<F.lv){swing=.25;say('You need Foraging '+F.lv+' to pick from a '+F.n+'.');sfx('swish');return true}
  swing=.25;o.shake=.15;sfx('rustle');ACTW[3]=10;o.hp=(o.hp==null?F.hp:o.hp)-1;if(o.hp>0)return true;
  const got=F.give(),txt=[];for(const[k,n]of got){inv[k]=(inv[k]|0)+n;txt.push('+'+n+' '+INAME[k].toLowerCase())}addXp(3,F.xp);
  if(o.t==='shroom'&&o.v==='void'&&Math.random()<.08){inv.sapphire=(inv.sapphire|0)+1;txt.push('and a sapphire hidden in the moss!')}
  say(txt.join(' '));try{gTxt(x*16+8,y*16-20,txt[0],'#e060a0');setTimeout(()=>sfx('pickup'),90)}catch(e){}done();saveLocal();return true}
 {const _a=attack;attack=function(){if(dead||menuOpen||pnOpen||BUILD||FISH||swing>0||(window.SQDF&&SQDF.on))return _a();const[fx,fy]=front(13),tx=Math.floor(fx/16),ty=Math.floor(fy/16);
   if(en.some(n=>!n.dead&&!n._pet&&Math.hypot(n.x-fx,n.y-fy)<(n.big?24:16)))return _a();const R=SCENE&&SCENE.room;
   if(!SCENE){if(tx<0||ty<0||tx>=N||ty>=N)return _a();const i=ty*N+tx,o=obj[i];if(o&&FOR[o.t]&&forageHit(o,tx,ty,()=>{obj[i]=null;REM.push({i,t:o.t,at:CLK})}))return;return _a()}
   if(R&&R.region){const it=rgObjAt(R,tx,ty);if(it&&FOR[it.o.t]&&forageHit(it.o,tx,ty,()=>{it.gone=true;rgCellDel(R,it);R.solid.delete(ty*R.w+tx);R.gone.push({it,at:CLK})}))return}return _a()}}

 // ---- pets that bring you things ----
 const PETS={psquir:{n:'Squirrel',src:'picking berry bushes (1 in 1,000)',every:80,bring(){const r=Math.random();
    if(r<.03)return[['pot_heal',1]];if(r<.15)return[['$',5+Math.floor(Math.random()*21)]];if(r<.45)return[['berry',2+Math.floor(Math.random()*3)]];if(r<.65)return[['nuts',1+Math.floor(Math.random()*3)]];if(r<.82)return[['shroom',1+Math.floor(Math.random()*2)]];return[['cfruit',1+Math.floor(Math.random()*2)]]}},
  pgiron:{n:'Iron golem',src:'mining iron ore (1 in 2,000)',every:110,ore:'iron',bring:()=>[['iron',1+Math.floor(Math.random()*2)]]},
  pggold:{n:'Gold golem',src:'mining gold ore (1 in 2,000)',every:130,ore:'goldore',bring:()=>[['goldore',1+(Math.random()<.3?1:0)]]},
  pgmith:{n:'Mithril golem',src:'mining mithril ore (1 in 2,000)',every:150,ore:'mithore',bring:()=>[['mithore',1]]},
  pgadam:{n:'Adamant golem',src:'mining adamant ore (1 in 2,000)',every:170,ore:'adamore',bring:()=>[['adamore',1]]}};
 for(const k in PETS){window.SQNPET[k]={n:PETS[k].n,src:PETS[k].src};if(window.LUX&&LUX.PETS&&!LUX.PETS.some(p=>p.k===k))LUX.PETS.push({k,n:PETS[k].n,v:0,rare:1,c:['#888','#666','#aaa']})}
 window.SQFETCH=PETS;
 let fetchT=null,fetchK=null;
 {const _u=upd;upd=function(dt){_u(dt);const k=window.LUX&&LUX.COS&&LUX.COS.pet,P2=PETS[k];if(!P2||dead||menuOpen||pnOpen||(window.SQPETOFF&&SQPETOFF(k))){return}if(k!==fetchK){fetchK=k;fetchT=P2.every*.6}
   if(SCENE&&!(SCENE.room&&(SCENE.room.region||SCENE.room.cave)))return;fetchT-=dt;if(fetchT>0)return;fetchT=P2.every*(.8+Math.random()*.4);
   const got=P2.bring(),txt=[];for(const[it,n]of got){if(it==='$'){GLD+=n;try{svg()}catch(e){}txt.push(n+' gold')}else{inv[it]=(inv[it]|0)+n;txt.push(n+' '+(n>1?(SN[it]||INAME[it]):INAME[it]).toLowerCase())}}
   say('Your '+P2.n.toLowerCase()+' brings you '+txt.join(' and ')+'!');try{const s=PST&&PST.get&&PST.get('me');gTxt(s?s.x:P.x,(s?s.y:P.y)-18,'+'+txt[0],'#f8d048');sfx('pickup')}catch(e){}saveLocal()}}
 // the drops: berry bushes give the squirrel, ores give their golem
 {const _a=attack;attack=function(){let ft=null;try{const[fx,fy]=front(13),tx=Math.floor(fx/16),ty=Math.floor(fy/16),R=SCENE&&SCENE.room;if(R&&R.region){const it=rgObjAt(R,tx,ty);ft=it&&it.o.t}else if(!SCENE&&tx>=0&&ty>=0&&tx<N&&ty<N){const o=obj[ty*N+tx];ft=o&&o.t}}catch(e){}
   const b0=inv.berry|0,o0={};for(const k in PETS)if(PETS[k].ore)o0[k]=inv[PETS[k].ore]|0;_a();
   if(ft==='bush'&&(inv.berry|0)>b0&&(Math.random()<1/1000||window.SQSQUIRDROP))SQGIVEPET('psquir');
   for(const k in o0)if((inv[PETS[k].ore]|0)>o0[k]&&(Math.random()<1/2000||window.SQGOLEMDROP===k))SQGIVEPET(k)}}
 // ---- how they look ----
 // the squirrel: side view, big curled tail, two hopping frames
 const SQM=[["..........RR..","........RRrrR.","...K....RrrrR.","..KRK...RrrR..","..RRRK..RrR...",".RERRRK.RR....","RRRRRRRRR.....",".RCRRRRRR.....","..CCRRRRK.....","..RRK.RRK....."],["..........RR..","........RRrrR.","...K...RRrrrR.","..KRK..RrrrR..","..RRRK.RrrR...",".RERRRKRRR....","RRRRRRRRR.....",".RCRRRRRR.....","..CCRRRRK.....",".RRK...RRK...."]];
 const SQP={R:'#b8682a',r:'#e0904a',K:'#6a3a14',E:'#181018',C:'#f0d0a0'},SQC={};
 function squirSp(f){if(SQC[f])return SQC[f];const rows=SQM[f],w=rows[0].length,h=rows.length,c=document.createElement('canvas');c.width=w+2;c.height=h+2;const x=c.getContext('2d'),on=new Set();
  rows.forEach((row,j)=>{for(let i=0;i<w;i++){const cl=SQP[row[i]];if(cl){x.fillStyle=cl;x.fillRect(i+1,j+1,1,1);on.add((i+1)+','+(j+1))}}});x.fillStyle=K;
  for(let j=0;j<h+2;j++)for(let i=0;i<w+2;i++){if(on.has(i+','+j))continue;if(on.has((i+1)+','+j)||on.has((i-1)+','+j)||on.has(i+','+(j+1))||on.has(i+','+(j-1)))x.fillRect(i,j,1,1)}return SQC[f]=c}
 // the golems: a round stone body with ore glinting in it. Idle: standing on stubby legs, bobbing and blinking.
 // Walking: curled up into a ball, rolling (the ore spots turn with it).
 const GOL={pgiron:['#8a7e74','#6a5e56','#b0a498','#d8945a'],pggold:['#8a8478','#686258','#b0a898','#f8d048'],pgmith:['#7c8090','#5c6070','#a4a8b8','#6880f0'],pgadam:['#7c8a80','#5c6a60','#a4b0a6','#48c070']},GC2={};
 function golemSp(k,mode,f){const key=k+mode+f;if(GC2[key])return GC2[key];const[S,Sd,Sl,O]=GOL[k],c=document.createElement('canvas');c.width=20;c.height=18;const x=c.getContext('2d'),on=new Uint8Array(20*18),px=(i,j,cl)=>{if(i<0||j<0||i>19||j>17)return;x.fillStyle=cl;x.fillRect(i,j,1,1);on[j*20+i]=1};
  if(mode==='idle'){const by=f?0:1,blink=f===1&&(Math.floor(performance.now()/1700)%3===0);
   const M=['.......SSSSSS.......','.....SSLLLLSSSS.....','....SLLLLSSSSSSS....','...SLLSSSSSOOSSSS...','...SLSSSSSSOoSSSS...','...SSEESSSSEESSSd...','...SSKKSSSSKKSSdd...',
    '.AAKSSSSSSSSSSSdKAA.','.AAKSSOOSSSSSSddKAA.','.AAKSSOoSSSSSdddKAA.','.aa.dSSSSSSSdddd.aa.','.....dddddddddd.....'];
   const C={S,L:Sl,d:Sd,O,o:'#ffffff',A:S,a:Sd,E:blink?Sd:'#ffffff',K:blink&&false?Sd:K};M.forEach((row,j)=>{for(let i=0;i<20;i++){const cl=C[row[i]];if(cl)px(i,j+1+by,cl)}});
   for(const lx of[6,7,12,13])for(let j=13;j<=15;j++)px(lx,j,Sd);if(!by)for(const lx of[6,7,12,13])px(lx,12,Sd)}
  else{for(let j=0;j<12;j++)for(let i=0;i<12;i++){const nx=(i-5.5)/6,ny=(j-5.5)/6;if(nx*nx+ny*ny>1)continue;px(i+4,j+4,ny<-.3&&nx<.1?Sl:ny>.45?Sd:S)}
   const a=f*Math.PI/2;for(const[r0,a0]of[[3.5,0],[3.5,2.1],[2,4.2],[0,0]]){const ox=Math.round(Math.cos(a0+a)*r0),oy=Math.round(Math.sin(a0+a)*r0);px(9+ox,9+oy,O);px(10+ox,9+oy,O)}
   const cx=Math.round(Math.cos(a+1)*4),cy=Math.round(Math.sin(a+1)*4);px(9+cx,9+cy,Sd)}
  x.fillStyle=K;for(let j=0;j<18;j++)for(let i=0;i<20;i++){if(on[j*20+i])continue;if((i>0&&on[j*20+i-1])||(i<19&&on[j*20+i+1])||(j>0&&on[(j-1)*20+i])||(j<17&&on[(j+1)*20+i]))x.fillRect(i,j,1,1)}
  return GC2[key]=c}
 window.SQPETDRAW=window.SQPETDRAW||{};
 SQPETDRAW.psquir=(k,s,tm)=>{const x=Math.round(s.x),y=Math.round(s.y),mv=s.mv>0,f=mv?Math.floor(s.t)%2:0,hop=mv&&f?2:0,sp=squirSp(f);shd(x,y+6,10);g.save();g.imageSmoothingEnabled=false;
  if(!s.fl){g.translate(x*2,0);g.scale(-1,1)}g.drawImage(sp,x-8,y+7-sp.height-hop);g.restore();if(!mv&&Math.floor(tm*1.3+x)%4===0)Rg(x-4,y-4,1,1,'#ffffff')};
 for(const k in GOL)SQPETDRAW[k]=(k2,s,tm)=>{const x=Math.round(s.x),y=Math.round(s.y),mv=s.mv>0,f=mv?Math.floor(s.t*1.5)%4:Math.floor(tm*1.6)%2,sp=golemSp(k2,mv?'roll':'idle',f);shd(x,y+6,12);
  g.save();g.imageSmoothingEnabled=false;if(mv&&s.fl){g.translate(x*2,0);g.scale(-1,1)}g.drawImage(sp,x-10,y+7-17);g.restore()};
 // hook into the pet drawing (SQDRAWTL is asked first for every pet)
 {const _d=window.SQDRAWTL;window.SQDRAWTL=function(k,s,tm){const f=SQPETDRAW[k];if(f){f(k,s,tm);return true}return _d?_d(k,s,tm):false}}
 // the cactus gives cactus fruit (it used to say so and hand you berries)
 // ---- wiki ----
 try{WK_RARE.push(['Squirrel (pet)',null,'Berry bushes','A squirrel that forages for you: every so often it brings berries, nuts, mushrooms, cactus fruit, a few coins, or (rarely) a healing potion.','1 in 1,000 from picking berry bushes.']);
  for(const k of['pgiron','pggold','pgmith','pgadam'])WK_RARE.push([PETS[k].n+' (pet)',null,'Mining','A little rock golem that rolls along behind you and now and then digs up '+INAME[PETS[k].ore].toLowerCase()+' for you.','1 in 2,000 from '+PETS[k].src.replace(/ \(1 in 2,000\)/,'')+'.'])}catch(e){}
 try{WK_SKILL.Foraging='Pick berries from bushes, mushrooms from the patches that grow by trees (Foraging 5), nuts from hazel bushes (Foraging 10) and fruit from cacti. Roast mushrooms and nuts at a campfire.'}catch(e){}
}
