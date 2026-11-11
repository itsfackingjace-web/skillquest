// ---------------------------------------------------------------- 116. Fishing, firemaking and cooking you can see (yours and other players')
// No progress bar: the character shows the work.
// - Lighting a fire: you crouch at the kindling and strike flint and steel; sparks fly, smoke builds, an ember catches.
// - Cooking: you crouch at the fire turning your food on a stick; it browns, drips and steams.
// - Fishing: a real cast (rod swings back over your head and whips forward, the float flies out and lands with a ring),
//   the float bobs with ripples, dips under with a splash on a bite, the rod bends while you reel the fish in through
//   the water, and a catch flies out of the water to you.
// What you're doing travels with your position as `ak` (1 fire, 2 cook, 3 fishing, 4 bite, 5 reeling, 6 caught), so other
// players see the same animation (their game times it from when the state changed).
(()=>{window.SQSKFX=true;
 const ACT={c:0,prev:0,at:0},CATCH={at:-9};
 const now=()=>performance.now()/1000;
 function localAct(){if(dead)return 0;if(now()-CATCH.at<.7&&FISH)return 6;const D=SQDO;
  if(D){if(D.kind==='fire')return 1;if(D.kind==='cook')return 2;if(D.kind==='reel')return FISH?5:0;if(D.kind==='smelt')return 7;if(D.kind==='smith')return 8;if(D.kind==='craft')return 9}
  if(FISH)return FISH.bite>0?4:3;return 0}
 window.SQACT=()=>ACT.c;
 let FN=-1;const _u=upd;upd=function(dt){_u.apply(this,arguments);if(FISH){const n=fishN();if(FN>=0&&n>FN&&SQDO&&SQDO.kind==='reel'||FN>=0&&n>FN&&ACT.c===5)CATCH.at=now();FN=n}else FN=-1;const c=localAct();if(c>=7){const n=beat(c,now()-ACT.at);if(n!==MYB){MYB=n;if(n>=0&&c===ACT.c)try{sfx(BEATS[c])}catch(e){}}}else MYB=-9;if(c!==ACT.c){ACT.prev=ACT.c;ACT.c=c;ACT.at=now()}};
 // a fish you actually catch flies out of the water to you
 function fishN(){let n=inv.rainbow|0;for(const f of FISH_T)n+=inv[f.k]|0;return n}
 // ---- crouching (fire and cooking): the whole character, gear included, drawn shorter at the knees ----
 const OFF=document.createElement('canvas');OFF.width=48;OFF.height=56;OFF.hd2=true;const OX=OFF.getContext('2d');
 let POSE=0;// the pose for the local player while pP draws it
 const _cP=cP;cP=function(ch,dir,st,ox,oy,fl){const ak=(ch&&ch.ak)|0||POSE;if(ak!==1&&ak!==2)return _cP.apply(this,arguments);
  const C=GC||g;OX.setTransform(1,0,0,1,0,0);OX.clearRect(0,0,48,56);OX.imageSmoothingEnabled=false;GC=OX;
  try{_cP(ch,dir,0,24,44,fl)}finally{GC=C}
  const dip=ak===1&&(performance.now()/380)%1<.2?1:0,X=Math.round(ox)-24,Y=Math.round(oy)-44,sm=C.imageSmoothingEnabled;C.imageSmoothingEnabled=false;
  // waist at row 41 (y-3): the top half drops 4px (plus a dip on each strike), the legs fold into 6 rows
  C.drawImage(OFF,0,0,48,41,X,Y+4+dip,48,41);C.drawImage(OFF,0,41,48,11,X,Y+45,48,6);C.imageSmoothingEnabled=sm};
 // ---- drawing helpers (world pixels) ----
 const px=(x,y,c)=>Rg(Math.round(x),Math.round(y),1,1,c);
 function line(x0,y0,x1,y1,c){const n=Math.max(1,Math.round(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));for(let i=0;i<=n;i++)px(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,c)}
 function curve(x0,y0,cx,cy,x1,y1,c){const n=Math.max(2,Math.round(Math.hypot(x1-x0,y1-y0)*1.3));for(let i=0;i<=n;i++){const t=i/n,a=(1-t)*(1-t),b=2*(1-t)*t,d=t*t;px(a*x0+b*cx+d*x1,a*y0+b*cy+d*y1,c)}}
 function ring(x,y,r,c,al){if(r<1)return;g.globalAlpha=al;const n=Math.max(8,Math.round(r*4));for(let k=0;k<n;k++){const a=k/n*6.283;px(x+Math.cos(a)*r,y+Math.sin(a)*r*.45,c)}g.globalAlpha=1}
 const lerp=(a,b,k)=>a+(b-a)*k;
 const skinOf=ch=>{try{return OPT.skin[(ch&&ch.sk)|0][0]}catch(e){return'#f0c8a0'}};let SKN0='#f0c8a0';
 const fist=(x,y)=>{Rg(Math.round(x)-2,Math.round(y)-2,4,4,O);Rg(Math.round(x)-1,Math.round(y)-1,2,2,SKN0)};
 // ---- fishing ----
 function drawFishing(x,y,fx,fy,code,prev,t,tm,B,seed){
  const side=!!fx,sd=side?0:(fy>0?-1:1),hx=x+(side?fx*4:sd*6),hy=y-5,L=13;
  const cast=code===3&&prev===0&&t<.6;let a;// rod angle up from flat-forward
  if(cast)a=t<.2?lerp(.9,2.5,t/.2):t<.34?lerp(2.5,.3,(t-.2)/.14):lerp(.3,.6,(t-.34)/.26);
  else if(code===4)a=.25+Math.sin(tm*40)*.05;else if(code===5)a=1.05+Math.sin(tm*26)*.05;else if(code===6)a=1.35;else a=.6+Math.sin(tm*2)*.04;
  // side view: the rod points ahead; facing toward or away from you it leans out to one side so you can see it
  const ca=Math.cos(a),sa=Math.sin(a),tx=side?hx+fx*L*ca:hx+sd*L*(.35+.35*ca),ty=side?hy-L*sa:hy+fy*L*ca*.85-L*sa*.85;
  // where the float is
  let bx=B[0],by=B[1]+(code===3?Math.round(Math.sin(tm*3+seed)):code===4?2:0),inAir=false;
  if(cast){if(t<.34){bx=tx;by=ty+3;inAir=true}else{const k=Math.min(1,(t-.34)/.22);bx=lerp(tx,B[0],k);by=lerp(ty,B[1],k)-Math.sin(k*Math.PI)*12;inAir=k<1}}
  let rp=0;if(code===5){rp=Math.min(1,t/1.8);bx=lerp(B[0],x+fx*8,rp*.75);by=lerp(B[1],y+fy*8+2,rp*.75)}
  if(code===6){bx=tx;by=ty+3;inAir=true}
  // ripples first (on the water, under the line)
  if(!inAir&&code===3){const ph=((tm+seed)%1.6)/1.6;ring(bx,by+1,1+ph*7,'#e8f8ff',.8*(1-ph))}
  if(code===4){const ph=Math.min(1,t/.45);ring(bx,by+1,2+ph*9,'#ffffff',1-ph);ring(bx,by+1,1+ph*5,'#e8f8ff',.8*(1-ph))}
  if(code===5){g.globalAlpha=.55;for(let k=-3;k<=3;k++)px(bx+k+Math.round(Math.sin(tm*14)*1.5),by+2+(Math.abs(k)>2?0:1),'#1a3050');g.globalAlpha=1;
   const ph=(tm*2.2)%1;ring(bx,by+1,1+ph*5,'#e8f8ff',.9*(1-ph))}
  // the rod: dark outline, wood, a light tip; bent while reeling
  const rod=(c,o)=>{if(code===5){const mx=(hx+tx)/2+fx*2,my=(hy+ty)/2-1;curve(hx+o,hy,mx+o,my-2,tx+o,ty+3,c)}else line(hx+o,hy,tx+o,ty,c)};
  rod(O,1);rod('#7a4a20',0);px(tx,ty,'#e8d8b8');fist(hx,hy+1);
  // the line: slack (sagging) or taut
  const lc='rgba(240,240,255,.85)',taut=code===4||code===5;
  if(code!==6){if(taut||inAir)line(tx,ty,bx,by-1,lc);else curve(tx,ty,(tx+bx)/2,Math.max(ty,by)+5,bx,by-1,lc)}
  // the float
  if(code===4){Rg(Math.round(bx)-1,Math.round(by),3,2,O);px(bx,by,'#e83030')}
  else if(code!==6&&code!==5){Rg(Math.round(bx)-2,Math.round(by)-3,4,5,O);Rg(Math.round(bx)-1,Math.round(by)-2,2,2,'#e83030');Rg(Math.round(bx)-1,Math.round(by),2,1,'#fff')}
  else if(code===5&&rp<1){Rg(Math.round(bx)-1,Math.round(by)-2,3,3,O);px(bx,by-1,'#e83030')}
  // the catch flies to you
  if(code===6){const k=Math.min(1,t/.5),fx0=B[0]*.25+(x+fx*8)*.75,fy0=B[1]*.25+(y+fy*8)*.75,cx=lerp(fx0,hx,k),cy=lerp(fy0,hy-2,k)-Math.sin(k*Math.PI)*16,fl=Math.floor(tm*12)%2;
   const X=Math.round(cx),Y=Math.round(cy);Rg(X-4,Y-2,9,5,O);Rg(X-3,Y-1,6,3,'#8ab8d8');Rg(X-3,Y+1,6,1,'#e8f0f8');Rg(X+3,Y-2+fl,2,(fl?2:3),'#8ab8d8');px(X-2,Y-1,'#102030');
   if(k<.6)for(let j=0;j<2;j++)px(X+(Math.random()-.5)*8,Y+3+Math.random()*4,'#e8f8ff');line(tx,ty,X,Y-2,lc)}}
 // ---- lighting a fire ----
 function drawFire(x,y,fx,fy,t,tm){const kx=Math.round(x+fx*16+(fx?0:3)),ky=Math.round(y+fy*16)+4;
  // kindling: a little teepee of sticks over a tuft of tinder
  line(kx-4,ky+1,kx,ky-4,O);line(kx+4,ky+1,kx,ky-4,O);line(kx-3,ky+1,kx,ky-3,'#8a5a2a');line(kx+3,ky+1,kx,ky-3,'#7a4a20');
  Rg(kx-5,ky+1,11,2,O);Rg(kx-4,ky+1,9,1,'#6a4020');Rg(kx-1,ky-1,3,2,'#d8b860');px(kx,ky-2,'#f0d888');
  const ph=(performance.now()/380)%1,glow=Math.min(1,Math.max(0,(t-1.1)/1.2));
  // smoke builds, then an ember and a first flame
  for(let k=0;k<1+Math.floor(glow*4);k++){const p=((tm*.7+k/4))%1;g.globalAlpha=(1-p)*(.25+glow*.45);Rg(Math.round(kx+Math.sin(p*6+k)*2),Math.round(ky-4-p*14),2,2,'#c8c0b8')}g.globalAlpha=1;
  if(glow>0){g.globalAlpha=.5+.5*Math.sin(tm*10);px(kx,ky-1,'#f86020');if(glow>.5)px(kx+1,ky-1,'#ffb040');g.globalAlpha=1}
  if(glow>.8){const f=Math.floor(tm*8)%2;Rg(kx-1,ky-3-f,2,2+f,'#f87830');px(kx,ky-4-f,'#ffe080')}
  // in your hands, just in front of you: the flint held low, the steel striking down across it
  const hx=Math.round(x+(fx?fx*8:-5)),hy=Math.round(y+(fy>0?4:2));Rg(hx-2,hy-2,5,4,O);Rg(hx-1,hy-1,3,2,'#9a9aa4');px(hx,hy-1,'#d0d0d8');fist(hx-(fx||1),hy+1);
  const sy=Math.round(hy-9+ph*ph*8),sx=hx+(fx?-fx*2:2);Rg(sx-3,sy-1,7,3,O);Rg(sx-2,sy,5,1,'#4a4048');px(sx+2,sy,'#b8b0a0');fist(sx-(fx||1)*2,sy+1);
  // each strike throws sparks from the flint onto the kindling
  if(ph<.22){const n=4+Math.floor(Math.random()*3);for(let k=0;k<n;k++){const q=Math.random();px(lerp(hx,kx,q)+(Math.random()-.5)*3,lerp(hy-1,ky-2,q)-Math.sin(q*Math.PI)*4,Math.random()<.5?'#ffe080':'#ff9030')}px(hx,hy-2,'#ffffff')}}
 // ---- cooking ----
 function drawCook(x,y,fx,fy,t,tm){const hx=Math.round(x+(fx?fx*4:3)),hy=Math.round(y-2),ex=Math.round(x+fx*15+(fx?0:2)),ey=Math.round(y+fy*13-5);
  line(hx+1,hy+1,ex+1,ey+1,O);line(hx,hy,ex,ey,'#8a6a40');fist(hx,hy+1);
  const k=Math.min(1,t/2.4),turn=Math.floor(tm*4)%2,c1=k<.5?'#e09080':'#b0683a',c2=k<.5?'#c06858':'#7a4020';
  Rg(ex-3,ey-2,6,5,O);Rg(ex-2,ey-1,4,3,turn?c1:c2);Rg(ex-2+(turn?2:0),ey-1,2,1,turn?c2:c1);
  for(let j=0;j<3;j++){const p=((tm*1.1+j/3))%1;g.globalAlpha=(1-p)*.5;Rg(Math.round(ex-2+j*2+Math.sin(p*7)),Math.round(ey-3-p*12),1,2,'#f0f0f0')}g.globalAlpha=1;
  if(Math.floor(tm*9)%4===0)px(ex+(Math.random()-.5)*4,ey+3+Math.random()*3,'#ffd060')}
 // the sound of each blow, pour or saw stroke (the same timing as the drawing)
 const BEATS={7:'sizzle',8:'mine',9:'rustle'},beat=(c,t)=>c===8?Math.floor((t-.504)/.7):c===7?Math.floor((t-1.21)/2.2):c===9?Math.floor(t/1.4):-1;let MYB=-9;
 // ---- smithing: the hammer rises and rings down on the glowing metal ----
 // a tool held at the hand: angle a (radians, 0 = pointing ahead, PI/2 = straight up), length L; in front/back views it moves up and down
 const tool=(hx,hy,fx,fy,a,L)=>fx?[hx+fx*Math.cos(a)*L,hy-Math.sin(a)*L]:[hx+(fy>0?-1:1)*Math.cos(a)*L*.35,hy-Math.sin(a)*L*.9+(fy>0?Math.cos(a)*L*.5:0)];
 function drawSmith(x,y,fx,fy,t,tm){const ax=Math.round(x+fx*14+(fx?0:5)),ay=Math.round(y+fy*12+(fx?0:2)),p=(t%.7)/.7;
  // the work on the anvil: a red-hot bar that cools between blows
  const heat=.6+.4*Math.max(0,1-((t%.7)/.7));Rg(ax-4,ay-6,8,3,O);Rg(ax-3,ay-5,6,1,heat>.85?'#ffd060':'#f87830');px(ax+1,ay-5,'#fff0b0');
  // the hammer: raised slowly, brought down fast, rests on the bar
  const a=p<.6?lerp(-.35,1.9,p/.6):p<.72?lerp(1.9,-.35,(p-.6)/.12):-.35,hx=x+(fx?fx*5:(fy>0?-5:5)),hy=y-5;
  const [ex,ey]=tool(hx,hy,fx,fy,a,9);line(hx+1,hy+1,ex+1,ey+1,O);line(hx,hy,ex,ey,'#8a5a2a');
  const hd=fx?[Math.round(ex)-2,Math.round(ey)-2]:[Math.round(ex)-2,Math.round(ey)-2];Rg(hd[0]-1,hd[1]-1,6,5,O);Rg(hd[0],hd[1],4,3,'#7a8494');Rg(hd[0],hd[1],4,1,'#b8c0cc');fist(hx,hy+1);
  // the blow: sparks fly off the anvil
  if(p>=.72&&p<.86){for(let k=0;k<7;k++){const an=-Math.random()*Math.PI,r=2+Math.random()*9;px(ax+Math.cos(an)*r,ay-5+Math.sin(an)*r*.7,Math.random()<.5?'#ffe080':'#ffb040')}px(ax,ay-6,'#ffffff')}}
 // ---- smelting: tongs hold a crucible to the furnace, then it tips and pours glowing metal into a mould ----
 function drawSmelt(x,y,fx,fy,t,tm){const fxp=Math.round(x+fx*15+(fx?0:4)),fyp=Math.round(y+fy*12),cyc=(t%2.2)/2.2;
  // the furnace's light on the ground and embers rising from its mouth
  g.globalAlpha=.18+.08*Math.sin(tm*9);g.fillStyle='#f87830';g.beginPath();g.ellipse(fxp,fyp-2,16,9,0,0,6.283);g.fill();g.globalAlpha=1;
  for(let k=0;k<4;k++){const ph=(tm*.9+k/4)%1;g.globalAlpha=1-ph;px(fxp+Math.sin(ph*9+k)*3,fyp-8-ph*16,k%2?'#ffb040':'#f86020')}g.globalAlpha=1;
  // a mould on the ground beside you, filling up
  const mx=Math.round(x+(fx?fx*7:(fy>0?-7:7))),my=Math.round(y+(fx?6:fy*6+5));Rg(mx-3,my-1,7,4,O);Rg(mx-2,my,5,2,'#5a5048');
  const fill=Math.min(1,t/2.2);if(fill>.05){Rg(mx-2,my,Math.max(1,Math.round(5*fill)),2,cyc>.55?'#f87830':'#ffb040')}
  // the crucible on its tongs: held to the fire, then tipped over the mould
  const tip=cyc>.55&&cyc<.9,hx=x+(fx?fx*5:(fy>0?-4:4)),hy=y-4,cx=tip?mx+1:Math.round(lerp(hx,fxp,.55)),cy=tip?my-6:Math.round(fx?hy-1:fy>0?y+3:hy-1);
  line(hx,hy,cx,cy+1,O);line(hx,hy-1,cx,cy,'#505860');Rg(cx-3,cy-3,6,5,O);Rg(cx-2,cy-2,4,3,'#7a6a5a');Rg(cx-2,cy-2,4,1,'#ffb040');fist(hx,hy);
  if(tip){for(let k=0;k<4;k++)px(cx+(fx||1)*0,cy+2+k*(my-cy-3)/4,k%2?'#ffd060':'#f87830')}}
 // ---- crafting: a saw (or knife) works the piece in front of you; shavings fall ----
 function drawCraft(x,y,fx,fy,t,tm){const wx=Math.round(x+fx*11+(fx?0:4)),wy=Math.round(y+fy*7+(fx?2:0));
  Rg(wx-5,wy-2,11,4,O);Rg(wx-4,wy-1,9,2,'#c8945a');Rg(wx-4,wy-1,9,1,'#e0b07a');// the piece being made
  const s=Math.sin(tm*14)*3,hx=wx+Math.round(s),hy=wy-4;line(hx-3,hy+2,hx+4,hy-1,O);line(hx-2,hy+1,hx+4,hy-2,'#c8d0dc');fist(hx-3,hy+2);
  if(Math.floor(tm*20)%2===0)for(let k=0;k<2;k++)px(wx+(Math.random()-.5)*6,wy+2+Math.random()*4,'#e8c890');
  // a little dust puff every few strokes
  if((t%1.4)<.1)for(let k=0;k<5;k++)part(wx,wy,(Math.random()-.5)*40,-20-Math.random()*20,.4,'#e8d8b8',60,1)}
 // ---- draw for a player ----
 function drawFor(code,prev,t,x,y,fx,fy,B,tm,seed,sk){SKN0=sk||'#f0c8a0';if(code===1)drawFire(x,y,fx,fy,t,tm);else if(code===2)drawCook(x,y,fx,fy,t,tm);else if(code===7)drawSmelt(x,y,fx,fy,t,tm);else if(code===8)drawSmith(x,y,fx,fy,t,tm);else if(code===9)drawCraft(x,y,fx,fy,t,tm);else if(code>=3&&code<=6)drawFishing(x,y,fx,fy,code,prev,t,tm,B,seed)}
 // you: behind you when you face away, in front otherwise
 const _pp=pP;pP=function(tm){const c=ACT.c,t=now()-ACT.at,x=Math.round(P.x),y=Math.round(P.y),fx=face[0],fy=fx?0:face[1];
  const B=FISH?[FISH.bx,FISH.by]:[x+fx*24,y+fy*24];const sk=c&&!dead&&!(hurt>0&&Math.floor(tm*20)%2);
  const skc=skinOf(CH);if(sk&&fy<0)try{drawFor(c,ACT.prev,t,x,y,fx,fy,B,tm,0,skc)}catch(e){}
  POSE=c===1||c===2?c:0;try{_pp.apply(this,arguments)}finally{POSE=0}
  if(sk&&fy>=0)try{drawFor(c,ACT.prev,t,x,y,fx,fy,B,tm,0,skc)}catch(e){}};
 // other players
 (window.SQPEERFX=window.SQPEERFX||[]).push((r,tm)=>{const c=r.ak|0;if(c!==(r._ak|0)){r._akPrev=r._ak|0;r._ak=c;r._akAt=now();
   if(c===4&&Math.hypot(r.x-P.x,r.y-P.y)<160)try{sfx('splash')}catch(e){}if(c===3&&!r._akPrev&&Math.hypot(r.x-P.x,r.y-P.y)<160)try{sfx('cast')}catch(e){}}
  if(!c||r.sl){r._fb=null;return}const x=Math.round(r.x),y=Math.round(r.y),fx=r.d===2?(r.fl?-1:1):0,fy=r.d===2?0:r.d===1?-1:1;
  if(c<3||c>6)r._fb=null;else if(!r._fb)r._fb=[x+fx*24,y+fy*24];
  // a hammer blow you can hear when you're close
  if(c>=7&&Math.hypot(r.x-P.x,r.y-P.y)<130){const n=beat(c,now()-r._akAt);if(n!==r._clang){r._clang=n;if(n>=0)try{sfx(BEATS[c])}catch(e){}}}
  drawFor(c,r._akPrev|0,now()-r._akAt,x,y,fx,fy,r._fb||[x+fx*24,y+fy*24],tm,(r.uid||'').length,skinOf(r.ch))});
})();
