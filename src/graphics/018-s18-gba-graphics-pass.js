// ---------------------------------------------------------------- 18. GBA graphics pass
// Connected fences and stone walls, merged farm fields, Pokemon-style tall grass,
// and lit windows at night.
// --- fences, stone walls and gates (outdoors) join up with their neighbors ---
const WALLISH=new Set(['wwall','swall','door']);
for(const r of BREC){if(r.k==='wwall')r.n='Wooden fence';if(r.k==='door')r.n='Gate'}
INAME.wwall='Wooden fence';INAME.door='Gate';
IDESC.wwall='A wooden fence. Fences join up with the pieces next to them. Slimes can\'t get through.';
IDESC.door='Opens when you walk up to it and keeps slimes out. Works as a door indoors.';
function fenceNb(x,y){const s=STR.get(y*N+x);return!!s&&WALLISH.has(s.t)}
const WD={hi:'#d8a060',lt:'#c88848',md:'#a86830',dk:'#7a4a20'};
function drawFence(i,s,ghost){const x=i%N,y=(i/N)|0,px=x*16+(s.shake>0?Math.round(Math.sin(performance.now()/16)):0),py=y*16,nb=(dx,dy)=>!ghost&&fenceNb(x+dx,y+dy);
 const L=nb(-1,0),Rt=nb(1,0),U=nb(0,-1),Dn=nb(0,1);
 if(s.t==='swall'){const x0=L?px:px+2,x1=Rt?px+16:px+14,yt=py-3,yb=py+15;Rg(x0-(L?0:1),yt-1,x1-x0+(L?0:1)+(Rt?0:1),yb-yt+2,O);
  Rg(x0,yt,x1-x0,4,'#d0d0d8');Rg(x0,yt+4,x1-x0,1,'#787888');Rg(x0,yt+5,x1-x0,yb-yt-5,'#a0a0b0');
  for(const yy of[yt+9,yt+14])Rg(x0,yy,x1-x0,1,'#787888');const o=(x+y)%2?4:0;for(const xx of[px+4+o,px+12+o])if(xx>x0&&xx<x1)Rg(xx,yt+5,1,4,'#787888');for(const xx of[px+8-o,px+16-o])if(xx>x0&&xx<x1)Rg(xx,yt+10,1,4,'#787888');
  if(U){Rg(x0,py-4,x1-x0,2,'#d0d0d8')}return}
 const rail=(a,b,w)=>{Rg(a,b-1,w,5,O);Rg(a,b,w,3,WD.lt);Rg(a,b+2,w,1,WD.md)};
 if(s.t==='door'){const open=!ghost&&doorOpen(i);
  if(L)rail(px,py+1,3);if(Rt)rail(px+13,py+1,3);if(L)rail(px,py+7,3);if(Rt)rail(px+13,py+7,3);
  if(!open){Rg(px+3,py-1,10,14,O);Rg(px+4,py,8,12,WD.md);Rg(px+4,py,8,2,WD.lt);Rg(px+4,py+5,8,2,WD.lt);Rg(px+4,py+10,8,2,WD.lt);for(let k=0;k<6;k++)Rg(px+5+k,py+2+k,1,1,WD.dk);Rg(px+10,py+6,1,1,GD)}
  else{Rg(px+3,py+1,2,12,O);Rg(px+3,py+12,8,3,'rgba(0,0,0,.18)')}
  for(const xx of[px,px+13]){Rg(xx-1,py-4,5,19,O);Rg(xx,py-3,3,17,WD.md);Rg(xx,py-3,3,2,WD.hi);Rg(xx+2,py-1,1,15,WD.dk)}return}
 // wooden fence
 Rg(px+4,py+13,8,3,'rgba(0,0,0,.18)');
 if(L){rail(px,py+1,7);rail(px,py+7,7)}if(Rt){rail(px+9,py+1,7);rail(px+9,py+7,7)}
 if(U){Rg(px+6,py-2,4,8,O);Rg(px+7,py-2,2,8,WD.lt)}if(Dn){Rg(px+6,py+8,4,9,O);Rg(px+7,py+8,2,9,WD.lt)}
 Rg(px+5,py-4,6,19,O);Rg(px+6,py-3,4,17,WD.md);Rg(px+6,py-3,4,2,WD.hi);Rg(px+9,py-1,1,15,WD.dk);Rg(px+6,py+2,1,1,WD.dk)}
const _ds18=drawStruct;drawStruct=function(i,s,ghost){if(!SCENE&&WALLISH.has(s.t))return drawFence(i,s,ghost);return _ds18(i,s,ghost)};
// --- farm fields: neighboring plots merge into one field with a rim ---
function drawPlot(i,p,tm,X,Y,hasF){const x=X!=null?X:i%N,y=Y!=null?Y:(i/N)|0,px=x*16,py=y*16,w=wet(p),has=hasF||((dx,dy)=>FARM.has((y+dy)*N+x+dx));
 const base=w?'#6a4428':'#9a6a3c',fur=w?'#4e3018':'#7e5430',lt=w?'#7c5636':'#b8844e',rim='#3a2410';
 Rg(px,py,16,16,base);for(const yy of[3,8,13])Rg(px,py+yy,16,1,fur);for(let k=0;k<3;k++)Rg(px+((x*7+k*5)%14)+1,py+((y*3+k*7)%12)+1,1,1,lt);
 if(!has(-1,0)){Rg(px,py,1,16,rim);Rg(px+1,py,1,16,fur)}if(!has(1,0)){Rg(px+15,py,1,16,rim);Rg(px+14,py,1,16,lt)}
 if(!has(0,-1)){Rg(px,py,16,1,rim);Rg(px,py+1,16,1,lt)}if(!has(0,1)){Rg(px,py+15,16,1,rim);Rg(px,py+14,16,1,fur)}
 if(!p.c)return;const keep=FARM.get(i);
 // draw only the crop from the original routine (it paints its own small soil square first, so we skip that part)
 const s=stageOf(p),sp=Math.sin(tm*3+i)>.85;
 if(s===0){for(const[a,b]of[[4,5],[10,6],[7,10]])Rg(px+a,py+b,2,1,'#e0c080');return}
 if(s===1){for(const[a,b]of[[4,6],[10,6],[7,10]]){Rg(px+a-1,py+b-1,3,5,O);Rg(px+a,py+b,1,3,'#48a838');Rg(px+a+1,py+b,1,2,'#78d058')}return}
 if(!ripe(p)){for(const[a,b]of[[3,4],[9,4],[6,9]]){Rg(px+a,py+b-2,3,5,O);Rg(px+a+1,py+b-1,1,4,'#48a838');Rg(px+a,py+b,1,2,'#78d058');Rg(px+a+2,py+b,1,2,'#78d058')}return}
 if(p.c==='wheat'){for(const a of[2,6,10]){Rg(px+a,py-1,4,16,O);Rg(px+a+1,py+4,2,10,'#c8a038');Rg(px+a+1,py,2,5,'#f0c848');Rg(px+a+1,py+1,1,2,'#f8e8a0')}}
 else if(p.c==='carrot'){for(const a of[3,10]){Rg(px+a-1,py+7,5,6,O);Rg(px+a,py+8,3,4,'#f08830');Rg(px+a-1,py+2,5,6,O);Rg(px+a,py+3,3,5,'#48a838');Rg(px+a+1,py+3,1,2,'#78d058')}}
 else{Rg(px+1,py+3,14,12,O);Rg(px+2,py+4,12,10,'#e87820');Rg(px+5,py+4,1,10,'#c85810');Rg(px+10,py+4,1,10,'#c85810');Rg(px+3,py+5,2,3,'#f8a850');Rg(px+6,py+1,4,4,O);Rg(px+7,py+1,2,4,'#48a838')}
 if(sp){Rg(px+12,py+2,1,3,'#fff');Rg(px+11,py+3,3,1,'#fff')}};
// --- tall grass (walk through it; it hides your legs like in Pokemon) ---
const TG=new Set();for(let y=2;y<N-2;y++)for(let x=2;x<N-2;x++){const i=y*N+x;if(tile[i]===2&&!obj[i]&&!inVillage(x,y)&&vn(x/5+31,y/5+17)>.74)TG.add(i)}
const tgC=[0,1].map(f=>cvs(16,16,c=>{for(const[ox,oy]of[[0,4],[6,2],[11,5],[3,9],[9,10]]){const sx=ox+(f&&oy<8?1:0);
 const GO='#185818';R(c,sx,oy+2,6,5,GO);R(c,sx+1,oy+3,4,4,'#38a040');R(c,sx,oy+1,1,2,GO);R(c,sx+2,oy,1,3,GO);R(c,sx+4,oy+1,1,2,GO);R(c,sx+1,oy+6,4,1,'#287830');R(c,sx+2,oy+1,1,2,'#58b848');R(c,sx+1,oy+3,1,1,'#78d058');R(c,sx+3,oy+3,1,1,'#58b848');R(c,sx+4,oy+2,1,1,'#58b848')}}));
const tgOK=i=>TG.has(i)&&!obj[i]&&!STR.has(i)&&!FARM.has(i)&&!BS.has(i);
function tgFrame(x,y,tm){const ptx=Math.floor(P.x/16),pty=Math.floor((P.y+5)/16);return x===ptx&&y===pty&&qm?Math.floor(tm*8)%2:Math.floor(tm*1.5+x*.7+y*.3)%2}
const _gh18=GROUNDHOOK;GROUNDHOOK=function(x0,y0,x1,y1,tm){if(_gh18)_gh18(x0,y0,x1,y1,tm);if(SCENE)return;for(let y=Math.max(0,y0-1);y<=Math.min(N-1,y1+1);y++)for(let x=Math.max(0,x0-1);x<=Math.min(N-1,x1+1);x++){const i=y*N+x;if(tgOK(i))(TGDRAW?TGDRAW(x,y,tm):g.drawImage(tgC[tgFrame(x,y,tm)],x*16,y*16,16,16))}};
// like Pokemon: only the grass around your feet is drawn over you, so it hides your legs and nothing else
function tgCover(cx,fy,hw,hh,tm){const tx=Math.floor(cx/16),ty=Math.floor(fy/16);if(!tgOK(ty*N+tx))return;
 g.save();g.beginPath();g.rect(Math.round(cx-hw),Math.round(fy-hh),hw*2,hh+3);g.clip();
 for(let y=ty-1;y<=ty+1;y++)for(let x=tx-1;x<=tx+1;x++){const i=y*N+x;if(x>=0&&y>=0&&x<N&&y<N&&tgOK(i))(TGDRAW?TGDRAW(x,y,tm):g.drawImage(tgC[tgFrame(x,y,tm)],x*16,y*16,16,16))}g.restore()}
const _nd18=NEWDRAW;NEWDRAW=function(...a){_nd18(...a);if(SCENE)return;const tm=a[8];
 if(!dead)tgCover(P.x,P.y+7,9,7,tm);for(const n of en)if(n.type!=='boss')tgCover(n.x,n.y+6,9,4,tm)};
// --- night: blue palette tint instead of a flat dark overlay, and lit windows ---
const _dh18=drawHUD;drawHUD=function(){const dk=SCENE?0:dark();if(dk>.25){const cx=Math.round(P.x-(W/Z)/2),cy=Math.round(P.y-(H/Z)/2);g.save();g.setTransform(Z,0,0,Z,-cx*Z,-cy*Z);g.globalCompositeOperation='lighter';
  const lit=(X0,w,base,k)=>{for(const wx of[X0+8,X0+w-20]){g.fillStyle='rgba(255,210,110,'+(.55*dk)+')';g.fillRect(wx,base-22,12,10);g.fillStyle='rgba(255,200,100,'+(.12*dk)+')';g.fillRect(wx-4,base-26,20,18)}};
  for(const b of BLD)lit(b.tx*16,b.w*16,(b.ty+2)*16);for(const h of HOUSES){const w=(h.w||5);lit((h.x-(w-1)/2)*16,w*16,(h.y+1)*16)}g.restore()}_dh18()};
// --- fence icon ---
const _icon18=iconURL;iconURL=function(k,col){if(k!=='wwall'&&k!=='door')return _icon18(k,col);const key='g18'+k;if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
 if(k==='wwall'){r(1,4,12,7,O);r(1,5,12,2,WD.lt);r(1,9,12,1,WD.lt);for(const a of[2,9]){r(a,1,4,12,O);r(a+1,2,2,10,WD.md);r(a+1,2,2,1,WD.hi)}}
 else{r(1,1,4,12,O);r(9,1,4,12,O);r(2,2,2,10,WD.md);r(10,2,2,10,WD.md);r(4,3,6,9,O);r(5,4,4,7,WD.md);r(5,4,4,1,WD.lt);r(5,8,4,1,WD.lt);r(8,7,1,1,GD)}
 return ICONC[key]=c.toDataURL()};
