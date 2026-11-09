// ---------------------------------------------------------------- 94. Your sword in your hand
// Every swing shows the sword you actually hold: wooden, stone, iron, steel, the Crystal blade, mithril or adamant
// (blade colour, length, width, guard and grip all differ). No sword: a quick punch. Other players see your sword too.
{const K='#181018';
 // blade light, blade dark, edge, guard, grip, pommel, length, width, glow
 const SW={1:['#d8b078','#9a6a38','#f0d8a8','#7a4a20','#5a3418','#7a4a20',10,2,null],2:['#b8b8c0','#7a7a84','#e0e0e8','#6a6a72','#5a3a20','#6a6a72',11,3,null],
  3:['#e0e6ec','#9aa2ac','#ffffff','#5a6068','#4a2c18','#5a6068',12,2,null],4:['#c8d8f0','#7a90b8','#f4f8ff','#e0b030','#3a2a5a','#e0b030',13,2,null],
  5:['#b8f4ff','#48b8e0','#ffffff','#68d8f8','#2a4a6a','#a8f0ff',14,2,'120,220,255'],6:['#b8c4ff','#5868d0','#e8ecff','#3a48a8','#2a2a4a','#8898f0',13,2,'130,150,255'],
  7:['#98e8b0','#38905a','#d8ffe0','#2a6a40','#3a2418','#48b060',14,3,'90,210,130'],8:['#ff9050','#c02810','#ffe0a0','#2a2a32','#3a1a10','#e0b030',16,3,'255,110,40']};
 // the sword is drawn upright once, then turned in 32 steps on the pixel grid (nearest pixel), then outlined
 const BC={};
 function bladeSprite(t,step){const key=t+'_'+step;if(BC[key])return BC[key];const S=SW[t]||SW[3],[L,D,E,G,H,Pm,len,wd]=S;
  const src=new Map(),put=(x,y,c)=>src.set(x+','+y,c);
  put(0,0,Pm);for(let x=1;x<=3;x++)put(x,0,H);for(let y=-2;y<=2;y++)put(4,y,G);
  for(let x=5;x<=len+1;x++){const tip=x>len-1;if(wd===3&&!tip){put(x,-1,E);put(x,0,L);put(x,1,D)}else if(!tip){put(x,0,E);put(x,1,D)}else put(x,0,x===len+1?E:L)}
  const R=len+4,W=2*R+1,c=document.createElement('canvas');c.width=W;c.height=W;const x=c.getContext('2d'),an=step/32*6.2832,co=Math.cos(an),si=Math.sin(an),on=new Uint8Array(W*W);
  for(let v=0;v<W;v++)for(let u=0;u<W;u++){const dx=u-R,dy=v-R,sx=Math.round(dx*co+dy*si),sy=Math.round(-dx*si+dy*co),col=src.get(sx+','+sy);if(col){x.fillStyle=col;x.fillRect(u,v,1,1);on[v*W+u]=1}}
  x.fillStyle=K;for(let v=0;v<W;v++)for(let u=0;u<W;u++){if(on[v*W+u])continue;if((u>0&&on[v*W+u-1])||(u<W-1&&on[v*W+u+1])||(v>0&&on[(v-1)*W+u])||(v<W-1&&on[(v+1)*W+u]))x.fillRect(u,v,1,1)}
  return BC[key]={c,R}}
 function blade(hx,hy,an,t){const st=((Math.round(an/6.2832*32))%32+32)%32,b=bladeSprite(t,st);g.drawImage(b.c,Math.round(hx)-b.R,Math.round(hy)-b.R)}
 function hammer(hx,hy,an){const c=Math.cos(an),s=Math.sin(an);for(let i=2;i<=11;i++)Rg(hx+c*i-1,hy+s*i-1,3,3,K);for(let i=2;i<=11;i++)Rg(hx+c*i,hy+s*i,1,1,'#a87038');
  const ex=Math.round(hx+c*13),ey=Math.round(hy+s*13);Rg(ex-5,ey-4,10,8,K);Rg(ex-4,ey-3,8,6,'#9a9284');Rg(ex-4,ey-3,8,1,'#c8c0b0');Rg(ex-4,ey+2,8,1,'#6a645c');Rg(ex-1,ey-1,2,1,'#5a8a3a')}
 // one swing: pr goes 0 -> 1. The blade sweeps from one side of where you face to the other.
 window.SQSWING=function(x,y,fx,fy,pr,t,tm){x=Math.round(x);y=Math.round(y);pr=Math.max(0,Math.min(1,pr));const a=Math.atan2(fy,fx),an=a+(pr-.5)*2.3,hx=x+fx*5,hy=y-4+fy*5;
  if(!t){// a punch: a fist and a little burst
   const d=3+Math.round(Math.sin(pr*Math.PI)*6),px=Math.round(hx+fx*d),py=Math.round(hy+fy*d);Rg(px-2,py-2,5,5,K);Rg(px-1,py-1,3,3,'#f0c8a0');if(pr>.3&&pr<.8)for(const[a2,b2]of[[3,0],[-3,0],[0,3],[0,-3]])Rg(px+fx*3+a2,py+fy*3+b2,1,1,'#ffffff');return}
  const S=SW[t];if(S&&S[8]&&dark()>.25){g.fillStyle='rgba('+S[8]+','+(.18+.12*Math.sin((tm||0)*8))+')';g.beginPath();g.arc(hx+Math.cos(an)*9,hy+Math.sin(an)*9,9,0,6.283);g.fill()}
  if(t===9)hammer(hx,hy,an);else blade(hx,hy,an,t);
  // the swoosh trail behind the blade
  const tc=S&&S[8]?'rgba('+S[8]+',.9)':'#ffffff',reach=(S?S[6]:12)+3;for(let k=1;k<=4;k++){const q=an-k*.22*(pr<.98?1:0);if(q<a-1.2)break;const tx=hx+Math.cos(q)*reach,ty=hy+Math.sin(q)*reach;Rg(Math.round(tx),Math.round(ty),k<3?2:1,k<3?2:1,k<2?tc:'#c8e8ff')}};
 {const _pp=pP;pP=function(tm){const tool=ACTN&&(ACTN.type==='chop'||ACTN.type==='mine'||ACTN.type==='till'||ACTN.type==='water');
   if(!(swing>0)||dead||tool||CASTT>0||BOWT>0||(window.SQDF&&SQDF.on)||(typeof SAILING!=='undefined'&&SAILING)||(window.SQRSAIL&&SQRSAIL.on))return _pp(tm);
   const sw=swing;if(!pP._d0)pP._d0=sw;swing=0;try{_pp(tm)}finally{swing=sw}if(hurt>0&&Math.floor(tm*20)%2)return;
   const t=(window.SQSLEDGE&&SQSLEDGE())?9:(TL.sword|0);SQSWING(P.x,P.y,face[0],face[1],1-sw/.25,t,tm)}}}
