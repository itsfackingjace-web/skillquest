// ===== GBA-style pixel art (1 unit = 1 pixel, integer scaled, no smoothing) =====
const O='#181018',G='#38a828',Gd='#207818',Gl='#78d850',SK='#f8c898',HR='#e8b030',BO='#a86830',BL='#3860c0',SV='#e0e8f8',GD='#f8d848';
const cvs=(w,hh,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=hh;fn(c.getContext('2d'));return c};
const R=(c,x,y,w,hh,col)=>{c.fillStyle=col;c.fillRect(x,y,w,hh)};
let s2=11;const r2=()=>(s2=(s2*16807)%2147483647)/2147483647,ri=n=>Math.floor(r2()*n);
const ell=(cx,cy,rx,ry)=>(x,y)=>((x-cx)/rx)**2+((y-cy)/ry)**2<=1,orr=(...f)=>(x,y)=>f.some(q=>q(x,y));
function blob(w,hh,inside,pal){return cvs(w,hh,c=>{const m=(x,y)=>x>=0&&y>=0&&x<w&&y<hh&&inside(x,y);
 for(let y=0;y<hh;y++)for(let x=0;x<w;x++){if(!m(x,y))continue;const ed=!m(x-1,y)||!m(x+1,y)||!m(x,y-1)||!m(x,y+1),t=(x/w)*.45+(y/hh)*.75+(r2()-.5)*.25;R(c,x,y,1,1,ed?pal[0]:t<.4?pal[3]:t<.85?pal[2]:pal[1])}})}
const gT=[0,1,2,3].map(v=>cvs(16,16,c=>{R(c,0,0,16,16,'#58b848');for(let i=0;i<7;i++){const x=1+ri(12),y=2+ri(12);R(c,x,y+1,1,1,'#389038');R(c,x+1,y,1,1,'#389038');R(c,x+2,y+1,1,1,'#389038');R(c,x+1,y-1,1,1,'#88d868')}if(v>1){const x=3+ri(9),y=3+ri(9),pc=v==2?'#fff':'#f8e048';R(c,x,y-1,1,3,pc);R(c,x-1,y,3,1,pc);R(c,x,y,1,1,v==2?'#f8d030':'#e86030')}}));
const sT=[0,1].map(()=>cvs(16,16,c=>{R(c,0,0,16,16,'#f0d890');for(let i=0;i<9;i++)R(c,ri(15),ri(15),1,1,'#d8b868');for(let i=0;i<4;i++)R(c,ri(14),ri(15),2,1,'#fff0b8')}));
const rT=[0,1].map(()=>cvs(16,16,c=>{R(c,0,0,16,16,'#b0a090');for(let i=0;i<5;i++)R(c,ri(13),ri(15),3,1,'#988878');for(let i=0;i<3;i++){const x=2+ri(10),y=2+ri(10);R(c,x,y,1,2,'#706050');R(c,x+1,y+2,2,1,'#706050')}R(c,ri(12),ri(14),2,1,'#d0c0a8')}));
const snT=[0,1].map(()=>cvs(16,16,c=>{R(c,0,0,16,16,'#eef2f8');for(let i=0;i<8;i++)R(c,ri(15),ri(15),1,1,'#c8d4e4');for(let i=0;i<3;i++)R(c,ri(13),ri(15),3,1,'#ffffff');R(c,ri(14),ri(14),2,1,'#b8c8dc')}));
const dsT=[0,1].map(()=>cvs(16,16,c=>{R(c,0,0,16,16,'#e8bc70');for(let i=0;i<10;i++)R(c,ri(15),ri(15),1,1,'#d09850');for(let i=0;i<3;i++)R(c,ri(13),ri(15),3,1,'#f8d898');if(r2()<.5)R(c,ri(12),ri(12),2,2,'#b88040')}));
const GP=[O,'#2c7828','#48a838','#78d058'];
const tC=[blob(26,24,orr(ell(13,10,12,9),ell(6,14,6,6),ell(20,14,6,6),ell(13,5,8,5)),GP),blob(26,24,orr(ell(13,11,11,10),ell(13,5,9,5),ell(5,15,5,5),ell(21,15,5,5)),GP)];
const rC=blob(14,11,orr(ell(7,7,7,4.5),ell(6,5,5,4)),[ '#202028','#68687a','#9898a8','#d0d0e0']);R(rC.getContext('2d'),8,4,1,3,'#505060');
const bC=blob(14,11,orr(ell(4,6,4,4),ell(10,6,4,4),ell(7,4,5,4)),GP);{const x=bC.getContext('2d');for(const[a,b]of[[3,5],[9,3],[8,7],[5,8]]){R(x,a,b,2,2,'#e82838');R(x,a,b+1,1,1,'#a01020')}}
const slS=[blob(16,12,ell(8,11.5,8,10.5),['#101850','#2848c0','#4880f0','#98c8ff']),blob(16,11,ell(8,10.5,8,9.5),['#101850','#2848c0','#4880f0','#98c8ff'])];
const slW=[blob(16,12,ell(8,11.5,8,10.5),['#202030','#d0d0e0','#f0f0f8','#fff']),blob(16,11,ell(8,10.5,8,9.5),['#202030','#d0d0e0','#f0f0f8','#fff'])];
const Rg=(x,y,w,hh,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,hh)};
let TERRAINHD=null,OBJHD=null,SHDHD=null,SLIMEHD=null,LHOOK=null,NPCSORT=false,SORTALL=false,TGDRAW=null,ROOMBG=null;
const shd=(x,y,w)=>{if(SHDHD)return SHDHD(x,y,w);g.fillStyle='rgba(0,0,0,.28)';x=Math.round(x);y=Math.round(y);g.fillRect((x-w/2+1)|0,y,w-2,1);g.fillRect((x-w/2)|0,y+1,w,2);g.fillRect((x-w/2+1)|0,y+3,w-2,1)};
const qL={x:0,y:0};let qW=0,qm=false;
function pp(list,ox,oy,fl){for(const[a,b,w,hh]of list)Rg(ox+(fl?-a-w:a)-1,oy+b-1,w+2,hh+2,O);for(const[a,b,w,hh,c]of list)Rg(ox+(fl?-a-w:a),oy+b,w,hh,c)}
function pF(f,tm){const x=Math.round(f.x),y=Math.round(f.y),k=Math.floor(tm*9+f.x)%3,hh=[7,9,8][k],ox=[0,-1,1][k];shd(x,y+4,16);
 Rg(x-7,y+1,14,4,O);Rg(x-6,y+2,12,2,BO);Rg(x-6,y+2,12,1,'#c88840');
 Rg(x-3,y-hh,6,hh+1,'#d83818');Rg(x-2+ox,y-hh-2,4,3,'#d83818');Rg(x-2,y-hh+3,4,hh-2,'#f88820');Rg(x-1+ox,y-hh+1,2,3,'#f88820');Rg(x-1,y-3,2,4,'#f8e060');
 Rg(x+(k*5)%7-3,y-hh-4-k,1,1,'#f8c040')}
function pS(n,tm){if(SLIMEHD)return SLIMEHD(n,tm);const x=Math.round(n.x),y=Math.round(n.y),f=Math.floor(tm*3+n.x)%2,fl=Math.abs(n.kx)+Math.abs(n.ky)>.8;shd(x,y+5,14);
 const sp=(fl?slW:slS)[f],top=y+6-sp.height;g.drawImage(sp,x-8,top);
 if(!fl){const e=top+4,d=P.x>n.x?1:0;Rg(x-5,e,3,4,'#fff');Rg(x+2,e,3,4,'#fff');Rg(x-5+d,e+1,2,3,O);Rg(x+2+d,e+1,2,3,O)}}
let GROUNDHOOK=null;
function NEWDRAW(cx,cy,x0,y0,x1,y1,vw,vh,tm){
 g.imageSmoothingEnabled=false;
 const tt=(x,y)=>x<0||y<0||x>=N||y>=N?0:tile[y*N+x],col=['','#f0d890','#58b848','#b0a090','#eef2f8','#e8bc70'],D4=[[1,0],[-1,0],[0,1],[0,-1]],fr=Math.floor(tm*2)%2;
 if(TERRAINHD)TERRAINHD(x0,y0,x1,y1,tm);else{for(let y=y0-1;y<=y1+1;y++)for(let x=x0-1;x<=x1+1;x++){const t=tt(x,y),r=h(x,y),px=x*T,py=y*T;
  if(t==0){Rg(px,py,16,16,'#2860c0');for(let k=0;k<2;k++)Rg(px+((Math.floor(r*10)+k*4+fr*2)%12),py+3+k*8+(k?Math.floor(r*3):0),3,1,'#5898f0')}
  else{const s=t==1?sT:t==2?gT:t==3?rT:t==4?snT:dsT;g.drawImage(s[Math.floor(r*s.length)%s.length],px,py);
   if(t==3&&tt(x,y+1)!=3){Rg(px,py+11,16,5,'#786858');Rg(px,py+11,16,1,'#d8c8b0');for(const a of[3,8,13])Rg(px+(a+Math.floor(r*3))%15,py+12,1,3,'#504030');Rg(px,py+15,16,1,'#403020')}}}
 for(let y=y0-1;y<=y1+1;y++)for(let x=x0-1;x<=x1+1;x++){const t=tt(x,y),px=x*T,py=y*T;
  for(const[dx,dy]of D4){const nb=tt(x+dx,y+dy);
   if(t==0&&nb>0){const bx=dx>0?px+13:px,bY=dy>0?py+13:py;Rg(bx,bY,dx?3:16,dy?3:16,'#58a8e8');for(let i=0;i<16;i+=8){const j=(i+fr*4)%16;Rg(dx?(dx>0?px+13:px+2):px+Math.min(j,13),dy?(dy>0?py+13:py+2):py+Math.min(j,13),dx?1:3,dy?1:3,'#e8f8ff')}}
   else if(t>0&&nb==0&&t!=1&&t!=5){const ec=t==2?'#307828':t==4?'#a8b8cc':'#706050';if(dx>0)Rg(px+15,py,1,16,ec);else if(dx<0)Rg(px,py,1,16,ec);else if(dy>0)Rg(px,py+15,16,1,ec);else Rg(px,py,16,1,ec)}
   else if(t>0&&nb>0&&nb<t&&!(t==3&&dy==1)){for(let i=0;i<16;i++){const d=1+(h(x*16+i,y*5+dx*3+dy*2+t)>.5?1:0);if(dx>0)Rg(px+16,py+i,d,1,col[t]);else if(dx<0)Rg(px-d,py+i,d,1,col[t]);else if(dy>0)Rg(px+i,py+16,1,d,col[t]);else Rg(px+i,py-d,1,d,col[t])}}}}}
 if(GROUNDHOOK)GROUNDHOOK(x0,y0,x1,y1,tm);
 qm=Math.hypot(P.x-qL.x,P.y-qL.y)>.01;qL.x=P.x;qL.y=P.y;if(qm)qW+=isSprint()?.42:.25;
 const L=[];
 for(let y=Math.max(0,y0);y<=Math.min(N-1,y1+3);y++)for(let x=Math.max(0,x0-1);x<=Math.min(N-1,x1+1);x++){const o=obj[y*N+x];if(o)L.push([y*T+14,0,o,x,y])}
 for(const f of fires)L.push([f.y+3,1,f]);for(const n of en)L.push([n.y+5,2,n]);if(!dead)L.push([P.y+6,3]);
 if(LHOOK)LHOOK(L,x0,y0,x1,y1,tm);L.sort((a,b)=>a[0]-b[0]);
 for(const e of L){
  if(e[1]==0){const o=e[2],x=e[3],y=e[4],bx=x*T+8,by=y*T+14,s=o.shake>0?(o.shake-=.016,Math.round(Math.sin(tm*60))):0;
   if(OBJHD&&OBJHD(o,x,y,bx,by,s,tm)){}else if(o.t=='tree'){shd(bx,by-1,18);Rg(bx-3+s,by-9,6,9,O);Rg(bx-2+s,by-9,4,8,BO);Rg(bx+1+s,by-9,1,8,'#704820');g.drawImage(tC[(x*7+y*3)&1],bx-13+s,by-27)}
   else if(o.t=='rock'){shd(bx,by-1,14);g.drawImage(rC,bx-7+s,by-10)}else if(o.t=='ore'){shd(bx,by-1,14);g.drawImage(oreC,bx-7+s,by-10)}else if(o.t=='pine'){shd(bx,by-1,16);Rg(bx-2+s,by-7,4,7,O);Rg(bx-1+s,by-7,2,6,BO);g.drawImage(pineC,bx-12+s,by-34)}else if(o.t=='cactus'){shd(bx,by-1,12);g.drawImage(cacC,bx-8+s,by-22)}else{shd(bx,by-1,14);g.drawImage(bC,bx-7+s,by-10)}}
  else if(e[1]==1)pF(e[2],tm);else if(e[1]==2)pS(e[2],tm);else if(e[1]==4)e[2](tm);else pP(tm);
 }
 if(dark()>.25)for(let i=0;i<18;i++){if(Math.sin(tm*2.5+i*3)<0)continue;Rg(cx+h(i,3)*vw+Math.sin(tm*.7+i)*8,cy+h(i,4)*vh+Math.cos(tm*.9+i*2)*8,2,2,'#e8f870')}
}
