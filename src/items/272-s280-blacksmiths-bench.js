// ---- 280. The Blacksmith's bench and cores (smithing overhaul, step 1) ----
// Nov 23 (Jace, #ideas with Kevin; plan in the "SQ Blacksmith's Bench" sheet): a new piece of furniture where repairs, upgrades
// and cores happen. Step 1 brings the bench itself and the cores; upgrades (step 2) and durability/repairs (step 3) come later.
//   bench: a 022 station (STNS/BREC/BK, built at home like the anvil): Iron bar 3, Stone 4, Wood 10, Crafting 12, 90 Crafting XP.
//     It uses the chests in the house like the furnace, anvil, stove and cauldron (033's STCH).
//   cores: 100 sigil shards of one island (100's ibs_<island>) -> 1 core, 1,000 Smithing XP, timed like every craft (109's sqDo):
//     Briar (Smithing 40), Ember (50), Frost (60), Silver (60), Void (70). Sold for what the shards would sell for (100 x 40 gold),
//     so they add no gold. Boss gear will upgrade with them in step 2.
//   the look is drawn here unless the Dev Suite has a Props look 'p:smithbench'.
// window.SQSMITHBENCH = {CORES, make, html}.
(()=>{const BK2='smithbench',SMI=10,CRI=6;
 const CORES=[{k:'core_briar',isl:'briarwood',n:'Briar core',lv:40,c:['#68b048','#2e6a28','#c8f0a0'],d:'A knot of living thorn, smithed from 100 Briar sigil shards.'},
  {k:'core_ember',isl:'ashfall',n:'Ember core',lv:50,c:['#f07030','#802010','#ffd080'],d:'A coal that never goes out, smithed from 100 Ember sigil shards.'},
  {k:'core_frost',isl:'ironcrest',n:'Frost core',lv:60,c:['#b8e8ff','#4888c0','#ffffff'],d:'Ice that never melts, smithed from 100 Frost sigil shards.'},
  {k:'core_silver',isl:'nomans',n:'Silver core',lv:60,c:['#e8e8f0','#8a8a98','#ffffff'],d:'A heavy silver heart, smithed from 100 Silver sigil shards.'},
  {k:'core_void',isl:'shattered',n:'Void core',lv:70,c:['#c8a0ff','#5a3a8a','#f0e0ff'],d:'A shard of the dark between the stars, smithed from 100 Void sigil shards.'}];
 const NEED=100,XP=1000;const shardOf=c=>'ibs_'+c.isl;
 // ---- the bench: a station like the anvil ----
 const REC={k:BK2,n:'Blacksmith\'s bench',c:{ibar:3,stone:4,wood:10},req:12,xp:90,hp:4};
 STNS.push(Object.assign({},REC,{d:'Smith cores from sigil shards. Repairs and upgrades are coming here.'}));STN.add(BK2);
 BREC.push(Object.assign({},REC));BK.push(BK2);BHP[BK2]=4;if(!INVK.includes(BK2))INVK.push(BK2);
 INAME[BK2]=REC.n;SN[BK2]='Blacksmith\'s benches';SHORT[BK2]='blacksmith\'s bench';inv[BK2]=inv[BK2]|0;if(!EXTRA_BAG.includes(BK2))EXTRA_BAG.push(BK2);
 IDESC[BK2]='Smith cores from sigil shards (repairs and upgrades are coming here). Place it in your house or yard, then face it and press HIT.';
 try{STCH.add(BK2)}catch(e){self.SQERR&&SQERR(e,'272-1')}
 // ---- the cores: items ----
 for(const c of CORES){INVK.push(c.k);if(!EXTRA_BAG.includes(c.k))EXTRA_BAG.push(c.k);INAME[c.k]=c.n;SN[c.k]=c.n+'s';SHORT[c.k]=c.n.toLowerCase();
  SELLP[c.k]=NEED*((SELLP[shardOf(c)]|0)||40);inv[c.k]=inv[c.k]|0;IDESC[c.k]=c.d+' Boss gear from that island will be upgraded with cores at the Blacksmith\'s bench.'}
 const an=n=>(/^[aeiou]/i.test(n)?'an ':'a ')+n.toLowerCase();// 'an ember core'
 // (button actions don't start with b: 107 treats every b... button on a ptab-2 screen as a shop item)
 const shN=c=>(INAME[shardOf(c)]||'sigil shard').toLowerCase()+'s';
 const can=c=>Math.floor((inv[shardOf(c)]|0)/NEED);
 // one core (also one step of a timed job)
 function make(c){if(lvOf(SMI)<c.lv){say('You need Smithing '+c.lv+' to smith '+an(c.n)+'.');return false}
  if(can(c)<1){say('You need '+NEED+' '+shN(c)+'.');return false}
  inv[shardOf(c)]-=NEED;inv[c.k]=(inv[c.k]|0)+1;addXp(SMI,XP);say('You smith '+an(c.n)+'!');try{sfx('anvil')}catch(e){self.SQERR&&SQERR(e,'272-2')}return true}
 // ---- the bench's screen ----
 const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
 function html(o){let n=0;try{n=benchChests(o).length}catch(e){self.SQERR&&SQERR(e,'272-3')}
  let h='<div class="tl">Blacksmith\'s bench</div><div class="tl" style="font-size:12px;font-weight:400;opacity:.75">Smithing level '+lvOf(SMI)+' · '+(n?'Using your bag and '+n+' chest'+(n>1?'s':'')+(o.inside?' in this house':' nearby'):'Using your bag. Put chests '+(o.inside?'in this house':'nearby')+' and their shards count too.')+'</div>';
  h+='<div class="tl" style="margin-top:12px">Cores</div><div class="tl" style="font-size:12px;font-weight:400;opacity:.75">'+NEED+' sigil shards from one island make one core. Boss gear from that island will be upgraded with it.</div>';
  for(const c of CORES){const have=inv[shardOf(c)]|0,okL=lvOf(SMI)>=c.lv,m=can(c),ok=okL&&m>0;
   const sub=have+' / '+NEED+' '+esc(shN(c))+(okL?' · '+XP.toLocaleString('en-US')+' xp · have '+(inv[c.k]|0):' · needs Smithing '+c.lv);
   h+='<div style="display:flex;gap:6px;align-items:stretch"><button class="sb stb" data-a="smc_'+c.k+'" style="flex:1;opacity:'+(ok?1:.45)+'"><img alt="" src="'+iconURL(c.k)+'" style="width:20px;height:20px;image-rendering:pixelated;vertical-align:middle;margin-right:6px">Smith '+an(c.n)+'<br><small>'+sub+'</small></button>'+(ok&&m>1?'<button class="sb stb" data-a="smca_'+c.k+'" style="width:64px">ALL</button>':'')+'</div>'}
  h+='<div class="qc" style="margin-top:12px"><p>Coming to this bench: repairs and upgrades.</p></div>';
  return h+'<button class="ng stb" data-a="pickup" style="margin-top:16px">Pick up this bench</button>'}
 {const _sh=stationHTML;stationHTML=function(o){if(o&&o.t===BK2)return html(o);return _sh.apply(this,arguments)}}
 {const _sa=stationAct;stationAct=function(a){const o=STATION;if(!(o&&o.t===BK2&&/^smca?_/.test(a||'')))return _sa.apply(this,arguments);
   const all=a.startsWith('smca_'),c=CORES.find(q=>q.k===a.replace(/^smca?_/,''));if(!c)return;
   if(lvOf(SMI)<c.lv){say('You need Smithing '+c.lv+' to smith '+an(c.n)+'.');return}const m=can(c);if(m<1){say('You need '+NEED+' '+shN(c)+'.');return}
   const n=all?m:1;if(sqDo('smith',n,()=>{make(c)})){try{SQDO.d=5;SQDO.tot=n;SQDO.core=c.k;const[fx,fy]=front(16);WORKAT={tx:Math.floor(fx/16),ty:Math.floor(fy/16)}}catch(e){self.SQERR&&SQERR(e,'272-4')}say('Smithing '+an(c.n)+'...');return}
   make(c);saveLocal(true);rPn()}}
 // ---- skill tree and wiki ----
 {const _tg=treeGains;treeGains=function(sk,l){const a=_tg.apply(this,arguments);try{
   if(sk===SMI){const L=CORES.filter(c=>c.lv===l);if(L.length)return[...a,'Smith '+L.map(c=>c.n.toLowerCase()+'s').join(' and ')+' at a Blacksmith\'s bench']}}catch(e){self.SQERR&&SQERR(e,'272-5')}return a}}
 (window.SQWKREC=window.SQWKREC||[]).push(R=>{for(const c of CORES)R.push({out:c.k,n:c.n,sk:'Smithing',lv:c.lv,xp:XP,c:{[shardOf(c)]:NEED},at:'Blacksmith\'s bench'})});
 // ---- the look: a heavy oak bench with a vise and a grinding wheel; sparks fly while a core is being smithed on it ----
 let WORKAT=null;const working=(x,y)=>{const D=window.SQDO;return D&&D.core&&WORKAT&&WORKAT.tx===x&&WORKAT.ty===y?CORES.find(c=>c.k===D.core)||null:null};
 const BC={K:'#1c1410',w:'#6a4020',W:'#8c5a2c',L:'#b07a40',H:'#d0a060',i:'#3a3e48',I:'#5c626e',m:'#8a909c',M:'#c0c6d0',s:'#7a7268',S:'#a49a8c',T:'#cfc6b4'};
 function benchArt(cx,cy,tm,hot){const P=(x,y,c)=>{g.fillStyle=BC[c]||c;g.fillRect(cx+x,cy+y,1,1)},R=(x,y,w,h,c)=>{g.fillStyle=BC[c]||c;g.fillRect(cx+x,cy+y,w,h)};
  g.globalAlpha=.25;R(-12,0,24,2,'#000');R(-10,-1,20,1,'#000');g.globalAlpha=1;
  // legs and the lower shelf with bars on it
  for(const lx of[-11,7]){R(lx,-9,4,10,'K');R(lx+1,-9,2,9,'w');R(lx+1,-9,1,9,'W')}
  R(-8,-4,16,3,'K');R(-8,-3,16,1,'W');R(-8,-2,16,1,'w');
  for(const[bx,col]of[[-6,'m'],[-2,'S'],[2,'m']]){R(bx,-6,4,2,'K');R(bx,-6,3,1,col==='m'?'M':'T');R(bx,-5,3,1,col)}
  // the thick oak top
  R(-13,-12,26,4,'K');R(-12,-12,24,1,'H');R(-12,-11,24,1,'L');R(-12,-10,24,1,'W');R(-12,-9,24,1,'w');for(const gx of[-6,1,7])P(gx,-11,'W');
  // a hammer and tongs lying on the top
  R(-3,-13,6,1,'K');R(-3,-13,5,1,'w');R(-3,-13,4,1,'W');R(2,-15,3,3,'K');R(2,-14,2,1,'M');P(4,-14,'m');
  P(-2,-14,'K');P(-1,-14,'K');P(0,-14,'K');P(1,-15,'K');P(-2,-15,'i');
  // vise on the left: a heavy base, two jaws, the screw and its T-handle
  R(-12,-15,9,3,'K');R(-11,-14,7,1,'I');R(-11,-15,7,1,'m');
  R(-12,-21,4,7,'K');R(-11,-20,2,6,'I');R(-11,-20,2,1,'M');P(-10,-18,'m');
  R(-7,-21,4,7,'K');R(-6,-20,2,6,'I');R(-6,-20,2,1,'M');P(-5,-18,'m');
  R(-8,-17,1,2,hot?hot.c[0]:'K');R(-3,-18,4,1,'K');R(-3,-17,3,1,'m');R(0,-20,1,5,'K');P(0,-21,'K');P(0,-15,'K');P(0,-19,'M');
  // grinding wheel on a wooden frame on the right: uprights, axle, the stone wheel and a crank
  const wx=7,wy=-17;for(const ux of[1,13]){R(ux,-20,2,8,'K');R(ux,-20,1,8,'W');R(ux,-20,2,1,'L')}
  for(let y=-4;y<=4;y++)for(let x=-4;x<=4;x++){const d=x*x+y*y;if(d>20)continue;P(wx+x,wy+y,d>13?'K':(x+y<-2?'T':x+y<3?'S':'s'))}
  const a=tm*(hot?14:1.2);for(let k=0;k<3;k++){const an=a+k*2.094;P(wx+Math.round(Math.cos(an)*2.4),wy+Math.round(Math.sin(an)*2.4),'s')}
  R(3,wy,1,1,'K');R(11,wy,2,1,'K');P(wx,wy,'K');R(13,wy-1,3,1,'K');R(15,wy-1,1,3,'K');P(15,wy+2,'H');
  // a trough of water under the wheel
  R(3,-13,9,2,'K');R(4,-13,7,1,'#4a7ab0');
  if(hot){// sparks fly off the wheel, and the core glows in the vise
   for(let k=0;k<7;k++){const ph=(tm*2.6+k/7)%1,sx=wx-5-Math.round(ph*11+(k%3)*2),sy=wy+1-Math.round(Math.sin(ph*Math.PI)*6)+Math.round(ph*ph*8);g.globalAlpha=1-ph;P(sx,sy,ph<.4?'#fff3b0':'#ffb040');g.globalAlpha=1}
   const p=.5+.5*Math.sin(tm*6);g.globalAlpha=.35+.35*p;R(-9,-20,3,5,hot.c[2]);g.globalAlpha=1;P(-8,-18,'#ffffff')}}
 const hasLook=()=>{try{return!!(window.SQPROPS&&SQPROPS.looks&&SQPROPS.looks['p:'+BK2])}catch(e){return false}};
 {const _ds=drawStation;drawStation=function(t,x,y,st,tm){if(t!==BK2||hasLook())return _ds.apply(this,arguments);g.save();try{benchArt(x*16+8,y*16+15,(tm!=null&&tm>0?tm:performance.now()/1000),working(x,y))}catch(e){self.SQERR&&SQERR(e,'272-8')}g.restore()}}
 // ---- icons: the bench, and each core (an orb in its island's colours, held by an iron band) ----
 {SQICON.wrap('272',_ic=>function(k,col){const C=CORES.find(c=>c.k===k);if(k!==BK2&&!C)return _ic.apply(this,arguments);const key='g280'+k;if(ICONC[key])return ICONC[key];
   const cv=document.createElement('canvas');cv.width=14;cv.height=14;const x=cv.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
   if(k===BK2){// the bench: oak top and legs, a vise on the left, the grinding wheel on the right
    r(0,7,14,3,'#1c1410');r(1,7,12,1,'#d0a060');r(1,8,12,1,'#8c5a2c');r(1,10,2,4,'#1c1410');r(11,10,2,4,'#1c1410');r(3,11,8,2,'#1c1410');r(3,11,8,1,'#8c5a2c');
    r(1,2,2,5,'#1c1410');r(4,2,2,5,'#1c1410');r(1,5,5,2,'#1c1410');r(2,3,1,3,'#8a909c');r(5,3,1,3,'#8a909c');
    for(let y=-3;y<=3;y++)for(let xx=-3;xx<=3;xx++){const d=xx*xx+y*y;if(d<=12)r(10+xx,3+y,1,1,d>7?'#1c1410':(xx+y<0?'#cfc6b4':'#a49a8c'))}r(10,3,1,1,'#1c1410')}
   else{// a core: a glowing orb held by an iron band with rivets and a ring on top
    const[c0,c1,c2]=C.c;for(let y=-5;y<=5;y++)for(let xx=-5;xx<=5;xx++){const d=xx*xx+y*y;if(d>30)continue;r(7+xx,8+y,1,1,d>22?'#16121c':(xx+y>2?c1:c0))}
    r(4,5,2,2,c2);r(4,5,1,1,'#ffffff');r(8,11,1,1,c2);
    r(1,7,12,2,'#16121c');r(2,7,10,1,'#9aa0ac');r(2,8,10,1,'#5c626e');r(4,7,1,1,'#e0e4ec');r(9,7,1,1,'#e0e4ec');
    r(6,1,3,2,'#16121c');r(7,1,1,1,'#9aa0ac')}
   return ICONC[key]=cv.toDataURL()})}
 window.SQSMITHBENCH={CORES,make,html,NEED,XP};
})();
