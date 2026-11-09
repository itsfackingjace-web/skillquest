// ---------------------------------------------------------------- 85. Better boats
// A sailboat drawn in two layers so you sit IN it: the back layer (far rail, deck, mast and sails) goes under you, the
// front layer (the near side of the hull) goes over your legs. Side view east/west, end-on views north/south.
// Moored boats at the docks have their sails furled. Drawing only: nothing here changes where a boat can go.
var BOAT85=(()=>{const K=new Map(),OL=hdC('#24140c');
 const WD=['#3a200e','#58321a','#7a4822','#9c6230','#c08448','#e0aa68'],DK=['#4e321a','#664224','#7c5430'],
  SA=['#a89c88','#cfc3aa','#ece2ca','#fffaee'],RD=['#8c2018','#c03828','#e85a40'];
 function mk(key,ox,oy,ww,hh,paint,noOl){let s=K.get(key);if(s)return s;const c=document.createElement('canvas');c.width=ww;c.height=hh;const x=c.getContext('2d');
  const F=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a-ox,b-oy,w,h)};paint(F);
  if(!noOl){const im=x.getImageData(0,0,ww,hh),d=new Uint32Array(im.data.buffer),o=new Uint32Array(d),op=i=>(d[i]>>>24)===255;
   for(let y=0;y<hh;y++)for(let X=0;X<ww;X++){const i=y*ww+X;if(d[i]>>>24)continue;if((X>0&&op(i-1))||(X<ww-1&&op(i+1))||(y>0&&op(i-ww))||(y<hh-1&&op(i+ww)))o[i]=OL}
   d.set(o);x.putImageData(im,0,0)}
  s={c,ox,oy,ww,hh};K.set(key,s);return s}
 function flip(s,key){let f=K.get(key);if(f)return f;const c=document.createElement('canvas');c.width=s.ww;c.height=s.hh;const x=c.getContext('2d');x.translate(s.ww,0);x.scale(-1,1);x.drawImage(s.c,0,0);
  f={c,ox:-(s.ox+s.ww)+1,oy:s.oy,ww:s.ww,hh:s.hh};K.set(key,f);return f}
 // ---- side view, bow to the east ----
 const sheerF=xx=>xx>12?-3-Math.round((xx-12)*.45):xx<-17?-4:-3;           // near rail
 const keel=xx=>xx>=0?9-Math.round(Math.pow(xx/24,2)*9):9-Math.round(Math.pow(-xx/21,2)*5);
 function sail(F,fr){// mainsail aft of the mast, jib forward, pennant on top
  for(let yy=-42;yy<=-13;yy++){const t=(yy+42)/29,le=Math.round(5-t*21-Math.sin(t*Math.PI)*3);for(let xx=le;xx<=6;xx++){
    let c=xx<=le+1?SA[1]:xx>=5?SA[3]:SA[2];if((yy+42)%7===6&&(xx&1))c=SA[1];if(yy>=-27&&yy<=-25)c=yy===-27?RD[2]:RD[1];F(xx,yy,1,1,c)}}
  for(let yy=-39;yy<=-10;yy++){const fx=9+Math.round((yy+40)/30*12);for(let xx=10;xx<=fx;xx++)F(xx,yy,1,1,xx>=fx-1?SA[1]:xx===10?SA[3]:SA[2])}
  F(-17,-12,25,2,WD[2]);F(-17,-12,25,1,WD[4]);                           // boom
  if(fr)F(0,-47,7,1,RD[2]),F(2,-46,5,1,RD[1]),F(4,-45,3,1,RD[1]);else F(1,-47,6,1,RD[2]),F(0,-46,7,1,RD[1]),F(3,-45,4,1,RD[0])}
 function furl(F){F(-17,-12,25,2,WD[2]);F(-17,-12,25,1,WD[4]);F(-15,-15,21,3,SA[2]);F(-15,-15,21,1,SA[3]);for(const k of[-12,-6,0])F(k,-15,1,3,RD[1])}
 const sideBack=(sl,fr)=>mk('sb'+sl+fr,-22,-48,48,48,F=>{
  for(let xx=-20;xx<=22;xx++){const top=sheerF(xx)-4-(xx>12?1:0),bot=sheerF(xx);if(bot-top<1)continue;F(xx,top,1,1,WD[5]);F(xx,top+1,1,bot-top-1,(xx+40)%5===0?DK[0]:DK[1+((xx+40)%5>2?1:0)])}
  F(-19,-5,4,2,DK[0]);F(-18,-6,2,1,WD[3]);                                  // stern seat
  F(7,-44,2,42,WD[1]);F(7,-44,1,42,WD[3]);F(6,-45,4,2,WD[0]);
  if(sl)sail(F,fr);else furl(F)});
 const sideFront=()=>mk('sf',-22,-9,48,20,F=>{
  for(let xx=-21;xx<=24;xx++){const top=sheerF(xx),bot=keel(Math.min(xx,24));if(bot<top)continue;
   for(let yy=top;yy<=bot;yy++){const r=yy-top;let c=r===0?WD[5]:r===1?WD[4]:r<=3?(r===2?RD[2]:RD[1]):r===4?'#f0e6d0':(r-5)%3===2?WD[1]:WD[3];
    if(yy>=bot-1&&r>4)c=yy===bot?WD[0]:WD[1];if(xx>=22&&r>1)c=WD[2];if(xx<=-20&&r>1)c=WD[2];F(xx,yy,1,1,c)}}
  F(-8,1,1,1,WD[0]);F(6,1,1,1,WD[0]);F(-15,5,10,1,WD[2])});
 // ---- end-on views: n = bow away from you (we see the stern), s = bow toward you ----
 const hwN=yy=>yy<-8?Math.max(1,Math.round(11*Math.sqrt((yy+21)/13))):11;  // bow at the top
 const hwS=yy=>yy<-16?Math.round(11-(-16-yy)*1.5):11;                      // rounded stern at the top
 const endBack=(dir,sl,fr)=>mk('eb'+dir+sl+fr,-14,-52,28,52,F=>{const hw=dir==='n'?hwN:hwS;
  for(let yy=-21;yy<=-2;yy++){const w=hw(yy);if(w<1)continue;F(-w,yy,w*2,1,WD[4]);if(w>2&&yy>-20)F(-w+2,yy,w*2-4,1,(yy+40)%4===0?DK[0]:DK[1])}
  for(let yy=-21;yy<=-2;yy++){const w=hw(yy);if(w>2){F(-w,yy,1,1,WD[5]);F(w-1,yy,1,1,WD[3])}}
  F(-1,-48,2,40,WD[1]);F(-1,-48,1,40,WD[3]);F(-2,-49,4,2,WD[0]);
  if(sl){const back=dir==='n';for(let yy=-44;yy<=-19;yy++){const t=(yy+44)/25,w=Math.round(6+t*4+Math.sin(t*Math.PI)*1.5);
    for(let xx=-w;xx<w;xx++){let c=back?(Math.abs(xx)>=w-1?SA[0]:SA[1]):(Math.abs(xx)>=w-1?SA[1]:xx<-2?SA[2]:SA[3]);if(yy>=-32&&yy<=-30)c=back?RD[0]:(yy===-32?RD[2]:RD[1]);if((yy+44)%7===6&&(xx&1))c=back?SA[0]:SA[1];F(xx,yy,1,1,c)}}
   F(-8,-45,16,2,WD[2]);F(-8,-45,16,1,WD[4]);F(-11,-19,22,1,WD[2]);
   if(fr)F(1,-52,6,1,RD[2]),F(1,-51,4,1,RD[1]);else F(1,-52,5,1,RD[1]),F(1,-51,6,1,RD[2])}
  else{F(-11,-17,22,3,SA[2]);F(-11,-17,22,1,SA[3])}});
 const endFront=dir=>mk('ef'+dir,-14,-4,28,18,F=>{
  for(let yy=-3;yy<=12;yy++){const r=yy+3;let w=dir==='s'?(r<5?12:Math.max(1,Math.round(12-(r-4)*1.25))):(r<9?12:Math.round(12-(r-8)*1.4));if(w<1)continue;
   for(let xx=-w;xx<w;xx++){let c=r===0?WD[5]:r===1?WD[4]:r<=3?(r===2?RD[2]:RD[1]):r===4?'#f0e6d0':(r-5)%3===2?WD[1]:WD[3];
    if(Math.abs(xx+.5)>=w-1.5&&r>1)c=WD[2];if(r>=13)c=WD[1];if(dir==='s'&&Math.abs(xx+.5)<1&&r>4)c=WD[2];F(xx,yy,1,1,c)}}});
 const DIRK=fc=>fc[0]>0?'e':fc[0]<0?'w':fc[1]<0?'n':'s';
 function back(fc,sl,tm){const d=DIRK(fc),fr=Math.floor(tm*4)&1;if(d==='e')return sideBack(sl?1:0,fr);if(d==='w')return flip(sideBack(sl?1:0,fr),'sbw'+(sl?1:0)+fr);return endBack(d,sl?1:0,fr)}
 function front(fc){const d=DIRK(fc);if(d==='e')return sideFront();if(d==='w')return flip(sideFront(),'sfw');return endFront(d)}
 function foam(x,y,fc,tm){const d=DIRK(fc),k=Math.floor(tm*5)%4;g.fillStyle='rgba(10,30,70,.28)';
  if(d==='e'||d==='w'){g.fillRect(x-20,y+8,42,2);g.fillStyle='#e8f8ff';const s=d==='e'?1:-1;for(let i=0;i<4;i++){const fx=x+s*(23-i*2)-(s<0?1:0);if((i+k)%4!==3)g.fillRect(fx,y+3+i*2,1,1)}g.fillRect(x-s*22-(s<0?0:2),y+7,3,1);if(k&1)g.fillRect(x-s*25-1,y+8,2,1)}
  else{g.fillRect(x-11,y+10,22,2);g.fillStyle='#e8f8ff';g.fillRect(x-13,y+8-(k&1),1,1);g.fillRect(x+12,y+8-((k>>1)&1),1,1);if(d==='s')g.fillRect(x-1,y+13,2,1);else g.fillRect(x-4+k,y-23,1,1)}}
 // a whole boat in one image (docks, the sailing card)
 function full(fc,sl){const b=back(fc,sl,0),f=front(fc),key='full'+DIRK(fc)+(sl?1:0);let s=K.get(key);if(s)return s;
  const ox=Math.min(b.ox,f.ox),oy=Math.min(b.oy,f.oy),ww=Math.max(b.ox+b.ww,f.ox+f.ww)-ox,hh=Math.max(b.oy+b.hh,f.oy+f.hh)-oy,c=document.createElement('canvas');c.width=ww;c.height=hh;const x=c.getContext('2d');
  x.drawImage(b.c,b.ox-ox,b.oy-oy);x.drawImage(f.c,f.ox-ox,f.oy-oy);s={c,ox,oy,ww,hh};K.set(key,s);return s}
 return{back,front,foam,full,dy:-6}})();
window.BOAT85=BOAT85;
// the boat under a sailor (you, or another player: P and face are swapped in for them)
drawBoat26=function(tm){const x=Math.round(P.x),y=Math.round(P.y)+Math.round(Math.sin(tm*2.6));BOAT85.foam(x,y,face,tm);hdPut(BOAT85.back(face,true,tm),x,y)};
function drawBoatFront26(x,y,fc,tm){hdPut(BOAT85.front(fc),x,y)}
// moored boats bob at the docks with their sails furled
drawBoat=function(x,y,tm){const px=x*16+8,py=y*16+6+Math.round(Math.sin(tm*1.6+x));BOAT85.foam(px,py,[1,0],tm*.5);hdPut(BOAT85.full([1,0],false),px,py)};
hdRowboat=function(sl,fl,vert){return BOAT85.full(vert?[0,1]:[fl?-1:1,0],sl)};
