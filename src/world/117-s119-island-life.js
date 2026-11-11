// ---- 119. Island builder part 3, in the game: people, monster zones, dungeon entrances and custom ground tiles ----
// What a custom island (Dev Suite > Islands) can now hold, and how the game runs it:
// - People (npc): stand where they were placed, turn to face you, and say their lines one after another when you talk
//   to them (TALK button / T). A speech bubble shows the line over their head.
// - Monster zones (zn): an area with the monsters picked for it. Up to n of them live there while you're nearby; they
//   come back a little while after they're beaten and drift home if they wander far off. The older whole-island setting
//   ("monsters like Briarwood") now works too: it spawns that island's day and night creatures around you.
// - Dungeon entrances (cv): placed by 111a's generator (icvdoor items, one dungeon kind per entrance, see SQA.caveKind);
//   drawn here in the style picked for them.
// - Custom ground tiles (ct, painted as c): 32 x 32 pictures drawn over the ground on the tiles they were painted on.
(()=>{if(!window.SQA)return;const A=SQA,HEX='0123456789abcdef';
 const isl=id=>{const D=WORLD_REGIONS[id];return D&&D.custom?(A.islands||{})[id]:null};
 const here=()=>{const R=SCENE&&SCENE.room;return R&&R.region?R:null};
 // ---- the monsters a zone can hold: every creature the regions use, with its usual health ----
 const NAMES={'wolf':'Wolf','wolf:briar':'Briar wolf','wolf:snow':'Snow wolf','wolf:void':'Void wolf','slime':'Slime','slime:moss':'Moss slime','slime:frost':'Frost slime','slime:tide':'Tide slime',
  'bat':'Bat','skel':'Skeleton','skel:ember':'Ember skeleton','skel:dust':'Dust skeleton','skel:rime':'Rime skeleton','scorp':'Scorpion','beetle:cinder':'Cinder beetle','crab':'Reef crawler',
  'guard':'Drowned guardian','bandit':'Bandit','cacti':'Cacticus','gscorp':'Giant scorpion'};
 const MOBS={};for(const[k,n,hp,rg]of[['slime','Slime',3,null],['wolf','Wolf',5,null],['skel','Skeleton',6,null]])MOBS[k]={n,hp,rg};
 try{for(const rg in RG_FAUNA){const F=RG_FAUNA[rg];for(const e of(F.day||[]).concat(F.night||[]))if(!MOBS[e[0]])MOBS[e[0]]={n:NAMES[e[0]]||e[0],hp:e[1],rg}}}catch(e){}
 const TOUGH=[1,1.6,2.5,4];
 // ---- monster zones ----
 const zonesOf=(id,I)=>{const out=(Array.isArray(I.zn)?I.zn:[]).slice(0,24).map((Z,k)=>Z&&{k,x:(Z.x|0)+A.ISL_PAD,y:(Z.y|0)+A.ISL_PAD,w:Math.max(1,Z.w|0),h:Math.max(1,Z.h|0),
   m:(Array.isArray(Z.m)?Z.m:[]).filter(m=>MOBS[m]).slice(0,6),n:Math.max(1,Math.min(12,Z.n|0||4)),hp:TOUGH[Z.hp|0]||1}).filter(z=>z&&z.m.length);
  // the whole-island setting: that island's own creatures, by day and by night, around you
  if(I.mob&&RG_FAUNA[I.mob])out.push({k:'all',all:RG_FAUNA[I.mob],n:Math.max(0,Math.min(30,I.max==null?12:I.max|0))});return out};
 const ZT={};let leashT=0;
 function spot(R,z,far){for(let t=0;t<24;t++){const tx=z.x+Math.floor(Math.random()*z.w),ty=z.y+Math.floor(Math.random()*z.h);if(tx<2||ty<2||tx>=R.w-2||ty>=R.h-2)continue;const i=ty*R.w+tx;
   if(!R.reach[i]||R.solid.has(i))continue;const x=tx*16+8,y=ty*16+8;if(solid(x-6,y-4)||solid(x+6,y-4)||solid(x-6,y+6)||solid(x+6,y+6))continue;
   const d=Math.hypot(x-P.x,y-P.y);if(d<(far?150:56))continue;if(Math.hypot(x-(R.dock[0]+.5)*16,y-(R.dock[1]+.5)*16)<96)continue;return[x,y]}return null}
 function zoneTick(R,I,dt){const id=R.region,Z=zonesOf(id,I),night=dark()>.3,ptx=P.x/16,pty=P.y/16;
  for(const z of Z){const key=id+':'+z.k,mine=en.filter(n=>!n.dead&&n.zc===id&&n.zi===z.k);
   if(z.all){// like the islands the game made: a few by day, more at night, never on screen
    const F=z.all,cap=Math.min(z.n,night?F.cap.night:F.cap.day);if(mine.length>cap){for(const n of mine.slice(cap))if(!n._rp)n.dead=1,n.dropped=1;continue}
    if((ZT[key]=(ZT[key]||0)-dt)>0||mine.length>=cap)continue;ZT[key]=night?3.2:6;const L=night?F.night:F.day,r=Math.random(),e=L.find(q=>r<q[2])||L[L.length-1];
    for(let t=0;t<16;t++){const a=Math.random()*6.283,d=180+Math.random()*60,tx=Math.floor((P.x+Math.cos(a)*d)/16),ty=Math.floor((P.y+Math.sin(a)*d)/16),s=spot(R,{x:tx,y:ty,w:1,h:1},true);if(!s)continue;
     const n=rgMake(e[0],e[1],s[0],s[1]);n.rg=I.mob;n.zc=id;n.zi='all';delete n.night;RG_OWN.add(n);en.push(n);break}continue}
   const near=ptx>z.x-16&&ptx<z.x+z.w+16&&pty>z.y-12&&pty<z.y+z.h+12;
   // far away: the zone empties (it fills again when you come back)
   if(!near){for(const n of mine)if(!n._rp&&Math.hypot(n.x-P.x,n.y-P.y)>420)n.dead=1,n.dropped=1;continue}
   if((ZT[key]=(ZT[key]||1.5)-dt)>0||mine.length>=z.n)continue;ZT[key]=mine.length?3+Math.random()*2:1.2;
   const s=spot(R,z,true)||spot(R,z,false);if(!s)continue;const m=z.m[Math.floor(Math.random()*z.m.length)],M=MOBS[m],hp=Math.round(M.hp*z.hp);
   const n=rgMake(m,hp,s[0],s[1]);n.mhp=hp;if(M.rg)n.rg=M.rg;n.zc=id;n.zi=z.k;delete n.night;RG_OWN.add(n);en.push(n)}
  // monsters that wander far from their zone (and aren't chasing you) drift back
  if((leashT-=dt)>0)return;leashT=.5;for(const n of en){if(n.dead||n._rp||n.zc!==id||n.zi==='all')continue;const z=Z.find(q=>q.k===n.zi);if(!z){n.dead=1;continue}
   const cx=(z.x+z.w/2)*16,cy=(z.y+z.h/2)*16,out=n.x<(z.x-5)*16||n.x>(z.x+z.w+5)*16||n.y<(z.y-5)*16||n.y>(z.y+z.h+5)*16;
   if(out&&Math.hypot(n.x-P.x,n.y-P.y)>130){const d=Math.hypot(cx-n.x,cy-n.y)||1;try{stepTo(n,(cx-n.x)/d*20,(cy-n.y)/d*20)}catch(e){}}}}
 const _ru=rgUpd;rgUpd=function(R,dt){const I=R&&isl(R.region);if(!I)return _ru.apply(this,arguments);
  rgTick(R,dt);// regrowing, landmarks
  // anything we didn't place (Hollow's night spawner) doesn't belong here; shared monsters from other players stay
  for(const n of en)if(!RG_OWN.has(n)){RG_OWN.add(n);if(n.type!=='boss'&&!n._rp&&n.zc!==R.region)n.dead=1}
  const dkx=(R.dock[0]+.5)*16,dky=(R.dock[1]+.5)*16;for(const n of en){if(n.dead||n._rp)continue;const dd=Math.hypot(n.x-dkx,n.y-dky);if(dd<72&&!n.summon){const l=dd||1;try{stepTo(n,(n.x-dkx)/l*40*dt,(n.y-dky)/l*40*dt)}catch(e){}}}
  try{zoneTick(R,I,dt)}catch(e){console.warn('zones',e)}};
 // ---- people ----
 const SAID={};// "island:index" -> how many lines you've heard
 let bub=null;
 const npcs=()=>{const R=here();return R&&isl(R.region)?R.items.filter(it=>it.t==='lm'&&it.k==='npc'):[]};
 const near=()=>{let best=null,bd=26;for(const it of npcs()){const d=Math.hypot(it.x*16+8-P.x,it.y*16+10-P.y);if(d<bd){bd=d;best=it}}return best};
 function talkTo(it){const R=here();if(!R)return;const L=it.lines&&it.lines.length?it.lines:['...'],k=R.region+':'+it.ni,i=(SAID[k]|0)%L.length;SAID[k]=i+1;
  say(it.name+': "'+L[i]+'"');msgT=Math.max(4,Math.min(9,L[i].length/14));bub={it,tx:L[i],at:performance.now()};try{sfx('talk')}catch(e){}}
 const _uf=useFurn;useFurn=function(it){if(it&&it.use==='npc'){talkTo(it);return}return _uf.apply(this,arguments)};
 const _t=talk;talk=function(){if(!pnOpen&&!menuOpen&&!dead){const n=near();if(n){talkTo(n);return}}return _t.apply(this,arguments)};
 tk.addEventListener('touchstart',e=>{if(pnOpen||menuOpen||dead)return;const n=near();if(n){e.preventDefault();e.stopImmediatePropagation();talkTo(n)}},{passive:false,capture:true});
 {const _pu=window.SQPADUSE;window.SQPADUSE=()=>!!near()||!!(_pu&&_pu())}
 let tkMine=false;const _u=upd;upd=function(dt){_u.apply(this,arguments);const n=!pnOpen&&!menuOpen&&!dead?near():null;
  if(n){tk.style.display='flex';const lab='TALK'+(isPC?'<small>T</small>':(typeof GPON!=='undefined'&&GPON?'<small>✕</small>':''));if(tk.innerHTML!==lab)tk.innerHTML=lab;tkMine=true}else if(tkMine){tkMine=false;if(!pnOpen)tk.style.display='none'}};
 function wrap(t,n){const w=t.split(' '),out=[];let l='';for(const x of w){if((l+' '+x).trim().length>n&&l){out.push(l);l=x}else l=(l+' '+x).trim()}if(l)out.push(l);return out.slice(0,4)}
 const _df=drawFurn;drawFurn=function(it,tm){
  if(it&&it.t==='lm'&&it.k==='npc'){const x=it.x*16+8,y=it.y*16+10,cl=Math.hypot(x-P.x,y-P.y)<60,dir=cl?(Math.abs(P.x-x)>Math.abs(P.y-y)?2:P.y<y?1:0):0,fl=cl&&P.x<x;
   try{shd(x,y+6,12)}catch(e){}GC=g;try{cP(it.look||{},dir,0,x,y,fl)}catch(e){}
   g.save();g.font='700 6px '+PF;g.textAlign='center';g.textBaseline='bottom';g.lineWidth=2;g.lineJoin='round';g.strokeStyle='#181018';g.strokeText(it.name,x,y-22);g.fillStyle='#e8ffe0';g.fillText(it.name,x,y-22);
   if(bub&&bub.it===it&&performance.now()-bub.at<5000){const ls=wrap(bub.tx,26),w=Math.ceil(Math.max(...ls.map(l=>g.measureText(l).width)))+10,h=ls.length*8+6,bx=Math.round(x-w/2),by=y-35-h;
    g.fillStyle='#181018';g.fillRect(bx-1,by-1,w+2,h+2);g.fillStyle='#fffaf0';g.fillRect(bx,by,w,h);g.fillStyle='#181018';g.fillRect(x-2,by+h+1,4,2);g.fillStyle='#fffaf0';g.fillRect(x-1,by+h,2,2);
    g.fillStyle='#2a1a10';g.textBaseline='top';ls.forEach((l,j)=>g.fillText(l,x,by+3+j*8))}g.restore();return}
  // dungeon entrances on custom islands, in their own style
  if(it&&it.t==='icvdoor'&&/^cv_/.test(it.kind)){const D=window.SQICV&&SQICV[it.kind]||{},x=it.x*16,y=it.y*16,K='#181018',sand=D.floor&&D.floor[0]==='#c8a870';
   if(D.mine||(!D.vines&&!sand&&D.floor&&D.floor[0]==='#7c8ea0'))return _df.apply(this,arguments);// mines and ice caves look like Ironcrest's
   const rock=sand?['#c8a070','#e0c090','#a88050','#b89060']:D.vines?['#6a6a58','#868670','#545444','#5e5e4c']:['#8a8a96','#a8a8b4','#6a6a76','#76768a'];
   Rg(x-17,y-20,50,36,K);Rg(x-16,y-19,48,34,rock[0]);Rg(x-16,y-19,48,5,rock[1]);Rg(x-16,y+8,48,6,rock[2]);for(const[a,b]of[[-12,-12],[20,-8],[-8,4],[24,6],[2,-16]])Rg(x+a,y+b,6,3,rock[3]);
   Rg(x-1,y-10,18,26,K);Rg(x,y-9,16,25,'#0c0a10');
   if(D.vines){for(const[a,b,w2]of[[-2,-12,20],[0,-10,3],[13,-10,3],[4,-11,2],[9,-11,2]])Rg(x+a,y+b,w2,2,'#5a3a1e');Rg(x-6,y-18,28,4,'#3a7a2a');Rg(x-4,y-19,6,2,'#58a040');Rg(x+12,y-19,8,2,'#58a040')}
   else if(sand){Rg(x-3,y-12,22,3,'#a07040');Rg(x-3,y-12,22,1,'#d8b080');Rg(x+19,y-6,2,10,'#5a3a20');Rg(x+18,y-8,4,3,'#c84020')}
   else{Rg(x+2,y-12,12,2,'#5a5a66');Rg(x-14,y+12,4,3,'#6a6a76');Rg(x+28,y+11,3,3,'#6a6a76')}
   g.save();g.font='700 6px '+PF;g.textAlign='center';g.textBaseline='bottom';g.lineWidth=2;g.strokeStyle=K;g.strokeText(it.name,x+8,y-22);g.fillStyle='#f8e8c0';g.fillText(it.name,x+8,y-22);g.restore();return}
  return _df.apply(this,arguments)};
 // ---- custom ground tiles, drawn over the baked ground ----
 const IMG=new Map(),LAY=new WeakMap();
 const okUrl=u=>typeof u==='string'&&u.length<12000&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(u);
 function img(u){let m=IMG.get(u);if(!m){m=new Image();m.src=u;IMG.set(u,m)}return m.complete&&m.naturalWidth?m:null}
 function layer(I){let L=LAY.get(I);if(L)return L;L=null;if(typeof I.c==='string'&&Array.isArray(I.ct)&&I.ct.length){try{const s=A.unpack(I.c);if(s.length===I.w*I.h)L=s}catch(e){}}LAY.set(I,L);return L}
 const _bg=ROOMBG;ROOMBG=function(R2){const out=_bg.apply(this,arguments);try{const R=R2&&R2.region?R2:null,I=R&&isl(R.region);if(!I)return out;const L=layer(I);if(!L)return out;
   const v=rgView(),P0=A.ISL_PAD,x0=Math.max(0,Math.floor(v.x0/16)-P0),x1=Math.min(I.w-1,Math.ceil(v.x1/16)-P0),y0=Math.max(0,Math.floor(v.y0/16)-P0),y1=Math.min(I.h-1,Math.ceil(v.y1/16)-P0);
   g.imageSmoothingEnabled=false;for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const ch=L[y*I.w+x];if(!ch||ch==='.')continue;const T=I.ct[HEX.indexOf(ch)];if(!T||!okUrl(T.p))continue;const m=img(T.p);if(m)g.drawImage(m,(x+P0)*16,(y+P0)*16,16,16)}}catch(e){}return out};
 window.SQISLIFE={MOBS,TOUGH,zonesOf,okUrl,talkTo,near}})();
