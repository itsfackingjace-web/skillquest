// ---------------------------------------------------------------- 34. HD graphics, part 2
// Everything that was still in the old 1-pixel style: furniture and room floors/walls, stations, lamps, the well,
// signs, bridges, boats, the shipwreck, the hermit's hut, farm plots and crops, and item icons.
// Each object is painted once into a 2x texel canvas (cached by kind/size/state) and drawn from that cache.
const HDK=new Map();
// paint in texel coordinates relative to the object's tile corner; (ox,oy,ww,hh) is the world box the canvas covers
function hdK(key,ox,oy,ww,hh,paint,outl){let o=HDK.get(key);if(o)return o;const b=hdBuf(Math.round(ww*2),Math.round(hh*2)),p=hdPainter(b,-ox*2,-oy*2,true);
 p.F=(x0,y0,x1,y1,c)=>{c=typeof c==='number'?c:hdC(c);for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)p.put(x,y,c)};p.b=b;p.OX=-ox*2;p.OY=-oy*2;
 paint(p);if(outl!==false)hdOutline(b,{1:hdC(outl||'#22160e')});o={c:hdCan(b),ox,oy,ww,hh};HDK.set(key,o);return o}
const hdPut=(o,x0,y0,dx,dy)=>g.drawImage(o.c,x0+o.ox+(dx||0),y0+o.oy+(dy||0),o.ww,o.hh);
const WDP=hdP(['#3e2412','#5e3a1c','#80522a','#a46c38','#c88c4c']),WLP=hdP(['#7a5630','#9a7442','#b8925a','#d2ae74','#e8c890']),
 METP=hdP(['#2a2e3a','#454b5a','#666e80','#949cae','#c4cad6']),STP=hdP(['#4a4a58','#62627a','#80809a','#a2a2b8','#c4c4d4']),
 GOLDP=hdP(['#9a7010','#d0a020','#f8d848','#fff0a0']),LEAFP=hdP(['#1d5426','#2a6e30','#3a8a3a','#52a646','#72c256']),CLAYP=hdP(['#6a2c14','#8e4020','#b05a30','#cc7a48','#e09a68']);
const hdShadeOf=(c,n)=>hdP(n===5?[hdMix(c,'#000000',.45),hdMix(c,'#000000',.25),hdMix(c,'#000000',.1),c,hdMix(c,'#ffffff',.3)]:[hdMix(c,'#000000',.35),hdMix(c,'#000000',.15),c,hdMix(c,'#ffffff',.3)]);
const hrand=(a,b)=>hdH(a*7+3,b*13+5);
// --- reusable parts ---
function hdBooks(p,x0,x1,yb,seed){const BC=['#c03038','#3a7a3a','#d0a028','#3a5aa8','#8a3a8a','#c06828','#2a7a7a','#7a4a28'];let x=x0,k=0;
 while(x<x1-2){const w=3+Math.floor(hrand(seed,k)*3),hh=9+Math.floor(hrand(k,seed)*6),c=BC[Math.floor(hrand(seed+k,3)*BC.length)];if(x+w>x1)break;
  if(hrand(k,seed+9)<.12){p.ell(x+2,yb-3,2.5,3,hdP(['#5a8ab0','#8ab8d8','#c8e4f4']),.1);x+=6;k++;continue}
  const pal=hdShadeOf(c,4);p.box(x,yb-hh,x+w,yb,pal,0);p.F(x,yb-hh+2,x+w,yb-hh+3,pal[3]);p.F(x,yb-4,x+w,yb-3,GOLDP[2]);x+=w+(hrand(k*3,seed)<.2?1:0);k++}}
function hdSphere(p,cx,cy,rx,ry,pal,bias){p.ell(cx,cy,rx,ry,pal,bias)}
// --- furniture (rooms and placed in houses) ---
function hdTable(W,goods){return hdK('tb'+W+(goods?1:0),0,-3,W*16,19,p=>{const Wt=W*32;
 p.box(4,22,10,32,WDP,1);p.box(Wt-10,22,Wt-4,32,WDP,1,-.15);p.box(2,12,Wt-2,22,WDP,1,-.1);
 p.box(1,-4,Wt-1,13,WLP,2,.05);p.F(3,-4,Wt-3,-3,WLP[4]);for(const yy of[1,6])for(let x=5;x<Wt-6;x+=11)p.F(x,yy,x+6,yy+1,WLP[1]);p.F(2,12,Wt-2,13,WDP[0]);
 if(goods){let x=6;const it=['apple','bread','bottle','cheese','apple','jar'];for(let k=0;x<Wt-10;k++){const t=it[k%it.length];
   if(t==='apple'){p.ell(x+3,4,3,3,hdShadeOf('#d83030',4),.1);p.put(x+3,0,LEAFP[2]);x+=8}
   else if(t==='bread'){p.box(x,1,x+11,8,hdShadeOf('#c88838',4),3,.1);for(const s of[3,6,9])p.put(x+s,2,hdC('#e8b868'));x+=13}
   else if(t==='bottle'){p.box(x+1,-6,x+5,8,hdShadeOf('#3a8a5a',4),1,.2);p.F(x+2,-9,x+4,-6,hdC('#3a8a5a'));p.F(x+2,-10,x+4,-9,hdC('#a86830'));x+=8}
   else if(t==='cheese'){for(let r=0;r<6;r++)p.F(x,7-r,x+9-r,8-r,hdC(r===5?'#f8e898':'#f0c848'));p.put(x+3,5,hdC('#c89820'));x+=11}
   else{p.box(x,-2,x+7,8,hdShadeOf('#b07a48',4),2,.1);p.F(x,-3,x+7,-1,hdC('#e8e0d0'));x+=9}}}})}
function hdCounter(W){return hdK('ct'+W,0,-5,W*16,21,p=>{const Wt=W*32;p.box(0,2,Wt,32,WDP,0,-.05);
 for(let k=0;4+k*24+18<=Wt;k++){const x=4+k*24;p.F(x,7,x+20,8,WDP[0]);p.F(x,7,x+1,27,WDP[0]);p.box(x+2,9,x+19,26,WDP,1,.15)}
 p.F(0,28,Wt,32,WDP[0]);p.box(0,-9,Wt,3,WLP,1,.1);p.F(1,-9,Wt-1,-8,WLP[4]);p.F(0,2,Wt,3,WDP[0])})}
function hdShelf(W,top,bot,key){return hdK(key+W,0,top,W*16,bot-top,p=>{const Wt=W*32,T=top*2,B=bot*2;
 p.box(0,T,Wt,T+5,WDP,0,.1);p.box(2,T+4,Wt-2,B,WDP,0);p.F(6,T+8,Wt-6,B-4,hdC('#2e1c10'));
 const rows=[];for(let y=T+8+(B-T-14)/3;y<B-3;y+=(B-T-14)/3)rows.push(Math.round(y));
 rows.forEach((yy,i)=>{hdBooks(p,7,Wt-7,yy,i*17+W);p.box(4,yy,Wt-4,yy+3,WLP,0,.1)})})}
function hdRackS(W){return hdK('rk'+W,0,4,W*16,24,p=>{const Wt=W*32;p.box(2,10,Wt-2,54,WDP,1);for(let y=14;y<52;y+=6)p.F(5,y,Wt-5,y+1,WDP[1]);
 for(let k=0;12+k*16<Wt-8;k++){const x=12+k*16;if(k%3===2){p.F(x+1,14,x+3,50,WDP[2]);p.box(x-5,14,x+5,24,METP,2,.1);continue}
  for(let y=14;y<40;y++)p.F(x,y,x+4,y+1,y<17?METP[4]:METP[3-(y%7===0?1:0)]);p.F(x+3,16,x+4,40,METP[1]);p.F(x-4,40,x+8,43,GOLDP[2]);p.F(x,43,x+4,50,hdC('#5a3418'));p.ell(x+2,51,2.2,2,GOLDP)}})}
function hdWindow(cur){return hdK('wn'+cur,0,4,16,20,p=>{const CU=hdShadeOf(cur,4);
 p.F(-1,9,33,11,METP[2]);p.box(0,11,7,44,CU,1);p.box(25,11,32,44,CU,1,-.1);for(const x of[2,4,27,29])p.F(x,13,x+1,43,CU[0]);
 p.box(5,12,27,42,WLP,1);for(let y=14;y<40;y++)p.F(7,y,25,y+1,hdC(hdMix('#d8f0ff','#78b0e8',(y-14)/26)));
 for(let k=0;k<5;k++)p.F(9+k,16+k*2,11+k,17+k*2,hdC('#ffffff'));p.F(15,14,17,40,WLP[2]);p.F(7,26,25,28,WLP[2]);p.box(3,40,29,44,WLP,1,.15)})}
function hdRugW(W){return hdK('rg'+W,0,2,W*16,12,p=>{const Wt=W*32;p.F(0,4,Wt,28,hdC('#e0b030'));p.F(3,7,Wt-3,25,hdC('#3c5aa0'));p.F(5,9,Wt-5,23,hdC('#5878b8'));
 for(let x=8;x<Wt-8;x+=10)for(const[a,b]of[[0,-3],[-3,0],[3,0],[0,3],[0,0]])p.put(x+a+2,16+b,hdC(b||a?'#f8d848':'#c84830'));
 for(let x=0;x<Wt;x+=2){p.put(x,3,hdC('#f0e0b0'));p.put(x,28,hdC('#f0e0b0'))}},false)}
function hdRugTile(m){return hdK('rgt'+m,0,0,16,16,p=>{const l=m&1,r=m&2,u=m&4,d=m&8;p.F(0,0,32,32,hdC('#e0b030'));p.F(l?0:4,u?0:4,r?32:28,d?32:28,hdC('#3c5aa0'));p.F(l?0:6,u?0:6,r?32:26,d?32:26,hdC('#5878b8'));
 for(const[a,b]of[[0,-3],[-3,0],[3,0],[0,3],[0,0]])p.put(16+a,16+b,hdC(a||b?'#f8d848':'#c84830'))},false)}
function hdPlant(){return hdK('pl',0,-6,16,22,p=>{p.box(9,16,23,31,CLAYP,2);p.box(7,13,25,18,CLAYP,1,.15);p.F(9,13,23,15,hdC('#3a2414'));
 for(const[x,y,rx,ry]of[[16,-4,6,5],[10,5,7,6],[22,4,7,6],[16,8,8,6]])p.ell(x,y,rx,ry,LEAFP,.05);for(const[x,y]of[[12,0],[19,-6],[22,2]])p.put(x,y,LEAFP[4])},'#13361c')}
function hdFurnaceS(){return hdK('fu',0,-18,16,34,p=>{p.box(6,-36,26,-26,STP,1,-.1);p.box(0,-28,32,32,STP,1);
 for(let r=0;r<10;r++){const y=-26+r*6;p.F(0,y,32,y+1,STP[0]);for(let x=(r%2?4:0);x<32;x+=10)p.F(x,y,x+1,y+6,STP[0])}
 for(let y=2;y<26;y++){const t=y<8?Math.sqrt(1-((8-y)/7)**2):1,hw=Math.round(8*t);p.F(16-hw,y,16+hw,y+1,hdC('#1a0e08'))}p.F(6,25,26,28,STP[3])})}
function hdAnvilS(){return hdK('an',0,1,16,15,p=>{p.box(9,18,23,31,WDP,2);p.ell(16,18,7,2.5,WLP,.1);p.box(4,6,28,12,METP,1,.15);p.ell(4,9,5,3,METP,.1);p.box(11,12,21,17,METP,0,-.1);p.box(7,15,25,19,METP,1,-.05);p.F(5,6,27,7,METP[4])})}
function hdBarrel(){return hdK('br',0,-1,16,17,p=>{p.box(4,1,28,31,WDP,4);for(let x=8;x<26;x+=4)p.F(x,3,x+1,30,WDP[1]);for(const y of[6,24])p.F(4,y,28,y+2,METP[2]);p.ell(16,2,12,3.2,WLP,.1);p.ell(16,2,8,1.6,hdP(['#6a4a28','#8a6438']))})}
function hdBedS(col){return hdK('bd'+col,0,-3,16,35,p=>{const BL=hdShadeOf(col,4),WH=hdP(['#b8c0d0','#dce2ec','#f2f4f8','#ffffff']);
 p.box(1,-6,31,64,WDP,2);p.box(1,-6,31,6,WDP,2,.1);for(const x of[3,27])p.ell(x+1,-6,2.5,2.5,WLP);p.box(4,4,28,16,WH,3,.1);p.box(3,15,29,60,BL,2);p.box(3,15,29,22,hdShadeOf(hdMix(col,'#ffffff',.25),4),2,.1);
 for(let y=28;y<58;y+=10)p.F(4,y,28,y+1,BL[0]);p.F(15,22,17,58,BL[0]);p.box(1,58,31,64,WDP,1)})}
function hdBedShort(col){return hdK('bs'+col,0,-3,16,19,p=>{const BL=hdShadeOf(col,4),WH=hdP(['#b8c0d0','#dce2ec','#f2f4f8','#ffffff']);
 p.box(1,-6,31,32,WDP,2);p.box(1,-6,31,4,WDP,2,.1);p.box(4,2,28,10,WH,3,.1);p.box(3,10,29,30,BL,2);p.box(3,10,29,15,hdShadeOf(hdMix(col,'#ffffff',.25),4),2,.1);p.F(15,15,17,29,BL[0])})}
function hdChestS(){return hdK('ch',0,1,16,15,p=>{p.box(2,12,30,30,WDP,1);p.box(2,3,30,13,hdShadeOf('#b07838',4),3,.1);for(const x of[6,24]){p.F(x,3,x+2,30,METP[2]);p.F(x,3,x+1,30,METP[3])}
 p.F(2,12,30,13,WDP[0]);p.box(13,9,19,16,GOLDP,1,.1);p.put(16,13,hdC('#3a2410'))})}
function hdChair(){return hdK('chr',0,-5,16,21,p=>{p.box(7,-8,25,8,WDP,1);for(const x of[11,15,19])p.F(x,-5,x+2,6,WDP[0]);p.box(5,8,27,15,WLP,1,.1);p.box(6,15,9,31,WDP,0);p.box(23,15,26,31,WDP,0,-.15)})}
function hdFloorLamp(){return hdK('fl',0,-12,16,28,p=>{p.ell(16,28,7,2.5,METP,.1);p.F(15,-6,17,27,METP[2]);p.F(15,-6,16,27,METP[3]);
 for(let y=-22;y<-6;y++){const hw=Math.round(6+(y+22)*.35);p.F(16-hw,y,16+hw,y+1,hdC(hdMix('#fff4c0','#e8b858',(y+22)/16)))}p.F(9,-23,23,-22,hdC('#c89838'))})}
function hdWardrobe(){return hdK('wd',0,-17,16,33,p=>{p.box(2,-28,30,30,WDP,1);p.box(0,-34,32,-27,WDP,1,.1);p.F(1,-34,31,-33,WDP[4]);
 for(const[a,b]of[[4,15],[17,28]]){p.box(a,-24,b,26,hdShadeOf('#a46c38',4),1,.08);p.F(a+2,-20,b-2,-19,WDP[1]);p.F(a+2,-19,a+3,22,WDP[1]);p.F(a+2,21,b-2,22,WDP[4])}
 p.put(14,2,GOLDP[2]);p.put(14,3,GOLDP[1]);p.put(18,2,GOLDP[2]);p.put(18,3,GOLDP[1]);p.F(3,30,7,32,WDP[0]);p.F(25,30,29,32,WDP[0])})}
function hdStove(){return hdK('sv',0,-14,16,30,p=>{const IR=hdP(['#22252e','#353a46','#4c5262','#6a7284']);
 p.F(22,-28,26,-6,IR[2]);p.F(22,-28,23,-6,IR[3]);p.box(4,-6,28,28,IR,2);p.F(2,-8,30,-4,METP[3]);p.F(2,-8,30,-7,METP[4]);
 p.box(8,6,24,22,IR,1,-.15);p.F(10,8,22,20,hdC('#1a0e08'));p.F(4,28,8,31,IR[0]);p.F(24,28,28,31,IR[0]);
 p.box(9,-16,21,-7,hdShadeOf('#c8743a',4),2,.1);p.F(8,-17,22,-15,hdC('#8a4a22'));p.F(14,-19,16,-17,hdC('#5a3418'))})}
function hdPlanter(ready){return hdK('pt'+(ready?1:0),0,-8,16,24,p=>{for(const[x,y,rx,ry]of[[16,-6,8,7],[9,1,7,6],[23,1,7,6],[16,4,9,6]])p.ell(x,y,rx,ry,LEAFP,.05);
 if(ready)for(const[x,y]of[[10,-2],[19,-8],[22,3],[13,5],[17,0]]){p.ell(x,y,1.8,1.8,hdShadeOf('#d82838',4),.2);p.put(x-1,y-1,hdC('#ffb0b8'))}
 p.box(2,10,30,31,WDP,1);for(const y of[16,23])p.F(3,y,29,y+1,WDP[0]);p.F(2,10,30,12,WDP[4])},'#1a2a12')}
function hdBenchS(){return hdK('bn',0,-8,16,24,p=>{p.box(3,6,7,31,WDP,0);p.box(25,6,29,31,WDP,0,-.15);p.F(5,22,27,25,WDP[1]);p.box(0,-2,32,7,WLP,1,.1);p.F(1,-2,31,-1,WLP[4]);
 p.box(26,-8,32,-1,METP,1);p.F(24,-6,26,-4,METP[1]);p.F(4,-6,12,-4,hdC('#7a4a20'));p.box(11,-9,15,-2,METP,1,.1);
 for(let k=0;k<8;k++)p.F(15+k,-4-(k>>2),16+k,-2,METP[3]);p.F(14,-4,16,-2,hdC('#7a4a20'))})}
// cave and tomb props
function hdCrystal(){return hdK('cr',0,-6,16,22,p=>{const CP=hdP(['#1e4a8a','#2e68b8','#4890e0','#7cc0f8','#c8ecff']);
 for(const[x,h,w]of[[10,20,4],[18,28,5],[24,14,3]]){const top=30-h;for(let y=top;y<30;y++){const t=(y-top)/h,hw=Math.max(1,Math.round(w*Math.min(1,t*3)));for(let xx=-hw;xx<hw;xx++)p.put(x+xx,y,CP[xx<-hw/3?4:xx<hw/3?3:1])}}})}
function hdPillar(){return hdK('pi',0,-15,16,31,p=>{const SP=hdP(['#8a6c40','#a8885a','#c8a874','#e0c894','#f2deb0']);p.box(2,26,30,32,SP,1);p.box(6,-22,26,26,SP,0);for(let x=9;x<24;x+=4)p.F(x,-20,x+1,25,SP[1]);p.box(2,-30,30,-22,SP,1,.1);p.F(2,-30,30,-29,SP[4])})}
function hdUrn(){return hdK('ur',0,-2,16,18,p=>{p.ell(16,18,10,11,CLAYP,.05);p.box(11,1,21,8,CLAYP,1);p.box(9,-2,23,2,CLAYP,1,.15);
 for(let x=7;x<26;x++)p.put(x,14+((x>>1)%2),hdC('#3a6ab0'));for(let x=7;x<26;x++)p.put(x,18,hdC('#3a6ab0'))})}
function hdBones(){return hdK('bo',0,0,16,16,p=>{const BN=hdP(['#a89c88','#d8d2c2','#f0ece0']);p.box(4,16,22,19,BN,1);for(const[x,y]of[[4,16],[4,19],[22,16],[22,19]])p.ell(x,y,1.8,1.8,BN);
 p.ell(20,9,5,4.5,BN,.1);p.put(18,9,hdC('#2a2018'));p.put(21,9,hdC('#2a2018'));p.box(6,24,14,26,BN,1)},'#3a3024')}
function hdCurtainFor(){const id=SCENE&&SCENE.id||'';return id==='home'?'#c84848':id==='gen'?'#3a8a5a':id==='smith'?'#6a6a80':'#4878c0'}
const _df34=drawFurn;drawFurn=function(it,tm){const x0=it.x*16,y0=it.y*16,W=it.w||1;
 switch(it.t){
  case'table':shd(x0+W*8,y0+15,W*14);return hdPut(hdTable(W,it.goods),x0,y0);
  case'counter':return hdPut(hdCounter(W),x0,y0);
  case'shelf':return hdPut(hdShelf(W,2,31,'sh'),x0,0);
  case'rack':return hdPut(hdRackS(W),x0,0);
  case'window':return hdPut(hdWindow(hdCurtainFor()),x0,0);
  case'rug':return hdPut(hdRugW(W),x0,y0);
  case'plant':shd(x0+8,y0+15,10);return hdPut(hdPlant(),x0,y0);
  case'furnace':{hdPut(hdFurnaceS(),x0,y0);const k=tm*9+x0,f1=Math.sin(k)*.5;g.fillStyle='#c8281a';g.fillRect(x0+4,y0+8,8,4.5);g.fillStyle='#f06818';g.fillRect(x0+4.5+f1*.5,y0+7+Math.sin(k*1.3),7,4);
   g.fillStyle='#f8a830';g.fillRect(x0+5.5,y0+8.5+Math.sin(k*1.7)*.5,5,3);g.fillStyle='#f8e070';g.fillRect(x0+6.5,y0+10,3,1.5);return}
  case'anvil':shd(x0+8,y0+15,14);return hdPut(hdAnvilS(),x0,y0);
  case'barrel':shd(x0+8,y0+15,12);return hdPut(hdBarrel(),x0,y0);
  case'bed':return hdPut(hdBedS('#4a6ab8'),x0,y0);
  case'chest':shd(x0+8,y0+15,14);return hdPut(hdChestS(),x0,y0);
  case'boulder':{shd(x0+8,y0+15,16);const S=hdSprites(),c=S.rock[(it.x+it.y)%S.rock.length];return g.drawImage(c,x0-2,y0+1,20,16)}
  case'crystal':{const pz=.6+.4*Math.sin(tm*2+x0);g.fillStyle='rgba(120,200,255,'+(.18*pz)+')';g.beginPath();g.arc(x0+8,y0+4,14,0,6.283);g.fill();return hdPut(hdCrystal(),x0,y0)}
  case'pillar':shd(x0+8,y0+15,16);return hdPut(hdPillar(),x0,y0);
  case'urn':shd(x0+8,y0+15,12);return hdPut(hdUrn(),x0,y0);
  case'bones':return hdPut(hdBones(),x0,y0)}
 _df34(it,tm)};
const _dp34=drawPiece;drawPiece=function(t,x,y,f,ghost,tm){const x0=x*16,y0=y*16;
 if(t==='chair'){shd(x0+8,y0+15,10);return hdPut(hdChair(),x0,y0)}
 if(t==='shelf'){shd(x0+8,y0+15,14);return hdPut(hdShelf(1,-10,16,'psh'),x0,y0)}
 if(t==='lamp'){g.fillStyle='rgba(255,230,140,.16)';g.beginPath();g.arc(x0+8,y0-4,18,0,6.283);g.fill();shd(x0+8,y0+15,10);return hdPut(hdFloorLamp(),x0,y0)}
 if(t==='rug'&&!ghost&&inHome()){const fu=SCENE.house.furn,w=SCENE.room.w,isR=(a,b)=>{const q=fu.get(b*w+a);return!!q&&q.t==='rug'};
  return hdPut(hdRugTile((isR(x-1,y)?1:0)|(isR(x+1,y)?2:0)|(isR(x,y-1)?4:0)|(isR(x,y+1)?8:0)),x0,y0)}
 return _dp34(t,x,y,f,ghost,tm)};
// beds and chests outdoors (and placed in houses) go through drawStruct
const _ds34=drawStruct;drawStruct=function(i,s,ghost){if(s.t!=='chest'&&s.t!=='bed')return _ds34(i,s,ghost);const x0=(i%N)*16+(s.shake>0?Math.round(Math.sin(performance.now()/16)):0),y0=((i/N)|0)*16;
 if(s.t==='chest'){shd(x0+8,y0+15,14);hdPut(hdChestS(),x0,y0)}else{shd(x0+8,y0+15,14);hdPut(hdBedShort('#4a6ab8'),x0,y0)}};
// stations
const _dst34=drawStation;drawStation=function(t,x,y,st,tm){const x0=x*16,y0=y*16;
 if(t==='wardrobe'){shd(x0+8,y0+15,16);return hdPut(hdWardrobe(),x0,y0)}
 if(t==='stove'){shd(x0+8,y0+15,16);hdPut(hdStove(),x0,y0);const k=tm*9+x0;g.fillStyle='#e85818';g.fillRect(x0+5,y0+6+Math.sin(k)*.5,6,4);g.fillStyle='#f8a830';g.fillRect(x0+6,y0+7.5,4,2.5);g.fillStyle='#f8e070';g.fillRect(x0+7,y0+8.5,2,1.5);
  g.fillStyle='rgba(240,240,250,.7)';for(let k2=0;k2<2;k2++)g.fillRect(x0+7+k2*2.5+Math.sin(tm*2+k2*2),y0-11-((tm*10+k2*6)%8),1,1.5);return}
 if(t==='planter'){shd(x0+8,y0+15,16);return hdPut(hdPlanter(st&&st.ready),x0,y0)}
 if(t==='bench'){shd(x0+8,y0+15,16);return hdPut(hdBenchS(),x0,y0)}
 return _dst34(t,x,y,st,tm)};
// --- room floors and walls (baked once per room) ---
const HDRM=new Map();
function hdRoomBG(R){let c=HDRM.get(R);if(c)return c;const W2=R.w*16,H2=R.h*16,b=hdBuf(W2*2,H2*2+8),F=(x0,y0,x1,y1,col)=>{for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(x>=0&&y>=0&&x<b.w&&y<b.h)b.d[y*b.w+x]=col};
 const fc=R.floor[0],n=parseInt(fc.slice(1),16),r=n>>16,gg=(n>>8)&255,bb=n&255,sat=Math.max(r,gg,bb)-Math.min(r,gg,bb),stone=R.cave||sat<30,FP=hdShadeOf(fc,5),FPd=hdShadeOf(R.floor[1],5);
 // floor
 for(let y=64;y<H2*2;y++)for(let x=0;x<W2*2;x++){let col;
  if(R.cave&&!R.tomb){const v=hdVN(x/14,y/14)*.6+hdVN(x/5,y/5)*.3+hdH(x,y)*.1;col=FP[hdQ(v*.9+.05,5,x,y)];if(Math.abs(hdVN(x/22+9,y/22)-.5)<.006)col=FP[1]}
  else if(stone){const tx=Math.floor(x/32),ty=Math.floor(y/32),lx=x%32,ly=y%32,pal=(tx+ty)%2?FPd:FP,v=.55+(hrand(tx,ty)-.5)*.3+(hdH(x,y)-.5)*.08;col=pal[hdQ(v,5,x,y)];if(lx===0||ly===0)col=FP[0];else if(lx===1||ly===1)col=FP[4]}
  else{const row=Math.floor(y/8),ly=y%8,off=Math.floor(hrand(row,1)*40),seg=Math.floor((x+off)/(48+Math.floor(hrand(row,2)*30))),pal=(row+seg)%3===0?FPd:FP,v=.6+(hrand(row,seg)-.5)*.25+Math.sin(x*.15+row)*.04;
   col=pal[hdQ(v-(ly/8)*.12,5,x,y)];if(ly===7)col=FP[0];else if(ly===0)col=FP[4];const sx=(x+off)%(48+Math.floor(hrand(row,2)*30));if(sx===0)col=FP[0];if(sx===3&&(ly===2||ly===5))col=FP[1]}
  b.d[y*b.w+x]=col}
 // wall: plaster or rock, crown molding, wainscot panels, baseboard
 const WP=hdShadeOf(R.wall,5),TP=hdShadeOf(R.trim,5);
 for(let y=0;y<64;y++)for(let x=0;x<W2*2;x++){let col;
  if(R.cave){const v=hdVN(x/9,y/7)*.7+hdH(x,y)*.3;col=WP[hdQ(v*.9,5,x,y)]}else{col=WP[hdQ(.62+((x>>3)%2?.05:-.02)+(hdH(x,y)-.5)*.06,5,x,y)];if(x%16===8&&y>10&&y<34)col=WP[2]}
  b.d[y*b.w+x]=col}
 if(!R.cave){F(0,0,W2*2,8,TP[2]);F(0,0,W2*2,1,TP[4]);F(0,7,W2*2,8,TP[0]);
  F(0,45,W2*2,58,TP[3]);F(0,45,W2*2,46,TP[4]);for(let x=4;x<W2*2-20;x+=28){F(x,48,x+22,49,TP[1]);F(x,48,x+1,55,TP[1]);F(x+1,55,x+22,56,TP[4]);F(x+21,49,x+22,55,TP[4])}
  F(0,58,W2*2,64,TP[1]);F(0,58,W2*2,59,TP[3]);F(0,64,W2*2,67,0x30000000)}
 else{for(let x=0;x<W2*2;x++){const d=Math.floor(hdH(x>>2,7)*6);F(x,58,x+1,64+d,WP[0]);F(x,58+d,x+1,60+d,WP[1])}}
 // doormat
 const mx=R.ex*32;for(let y=H2*2-14;y<H2*2;y++)for(let x=mx+4;x<mx+28;x++)b.d[y*b.w+x]=hdC((x+y)%4<2?'#b83828':'#c84838');F(mx+4,H2*2-14,mx+28,H2*2-13,hdC('#e88868'));for(let x=mx+4;x<mx+28;x+=2)F(x,H2*2-15,x+1,H2*2-14,hdC('#e8c8a0'));
 c=hdCan(b);HDRM.set(R,c);return c}
ROOMBG=(R,W2,H2)=>{Rg(-5,-5,W2+10,H2+10,'#181018');const c=hdRoomBG(R);g.drawImage(c,0,0,W2,H2+4)};
// --- outdoor props ---
function hdLampPost(lit){return hdK('lp'+(lit?1:0),0,-22,16,38,p=>{const IR=hdP(['#1e222c','#2e3440','#454c5c','#626a7c']);p.box(10,25,22,31,IR,1);p.box(13,-20,19,26,IR,0);p.F(12,-4,20,-2,IR[2]);
 p.F(6,-38,26,-35,IR[1]);for(let k=0;k<4;k++)p.F(9+k,-41-k,23-k,-40-k,IR[2]);p.ell(16,-46,2,2,GOLDP);p.box(8,-35,24,-19,IR,0);
 for(const[a,bb]of[[10,15],[17,22]])for(let y=-33;y<-21;y++)p.F(a,y,bb,y+1,hdC(lit?hdMix('#fff8c0','#f8c858',(y+33)/12):hdMix('#e8f0f8','#a8b8c8',(y+33)/12)));p.F(7,-20,25,-18,IR[2])},'#14161c')}
function hdWellS(){return hdK('wl',-3,-23,22,39,p=>{const RP=hdShadeOf('#a83838',5);
 p.box(0,0,32,30,STP,3);for(let r=0;r<5;r++){const y=4+r*5;p.F(1,y,31,y+1,STP[0]);for(let x=(r%2?3:8);x<31;x+=9)p.F(x,y,x+1,y+5,STP[0])}
 p.ell(16,1,15,5,STP,.1);p.ell(16,1,11,3.2,hdP(['#0e2a5a','#1a4a90','#2a68b8']));p.F(12,0,15,1,hdC('#8ac8f8'));
 p.box(1,-32,5,2,WDP,0);p.box(27,-32,31,2,WDP,0,-.1);p.F(3,-26,29,-24,WDP[2]);p.box(29,-28,34,-25,WDP,0);p.F(15,-24,17,-8,hdC('#c8a878'));p.box(12,-10,20,-2,WDP,1,.1);p.F(12,-8,20,-7,METP[2]);
 for(let r=0;r<4;r++){const y=-44+r*3,in2=3-r;p.F(-4+in2,y,36-in2,y+3,RP[r%2?2:3]);for(let x=-2+in2+(r%2)*3;x<34-in2;x+=6)p.F(x,y+2,x+1,y+3,RP[0])}p.F(-4,-32,36,-31,RP[0])},'#20140e')}
function hdSignS(){return hdK('sg',0,-7,16,23,p=>{p.box(14,4,18,31,WDP,0);p.box(1,-12,31,8,WLP,2,.05);p.F(2,-12,30,-11,WLP[4]);for(const[y,w]of[[-6,20],[-2,16],[2,18]])p.F(6,y,6+w,y+1,WDP[1]);for(const x of[4,27])p.put(x,-9,METP[3])})}
function hdBridgeT(horiz,post){return hdK('bg'+(horiz?1:0)+(post?1:0),0,-2,16,20,p=>{const PL=hdShadeOf('#b88850',5);
 if(horiz){for(let x=0;x<32;x+=8){p.box(x,6,x+7,28,PL,0,(hrand(x,1)-.5)*.2);p.F(x,6,x+7,7,PL[4]);p.put(x+2,10,PL[0]);p.put(x+2,24,PL[0])}p.box(0,2,32,7,WDP,0,.1);p.box(0,27,32,31,WDP,0);if(post){for(const x of[4,22]){p.box(x,-4,x+5,8,WDP,1,.1);p.box(x,24,x+5,33,WDP,1)}}}
 else{for(let y=0;y<32;y+=8){p.box(5,y,27,y+7,PL,0,(hrand(y,2)-.5)*.2);p.F(5,y,27,y+1,PL[4]);p.put(9,y+3,PL[0]);p.put(23,y+3,PL[0])}p.box(1,0,6,32,WDP,0,.1);p.box(26,0,31,32,WDP,0,-.1);if(post){for(const x of[0,26])p.box(x,8,x+6,18,WDP,1,.1)}}},'#2a180c')}
function hdRowboat(sail,flip,vert){return hdK('bt'+(sail?1:0)+(flip?1:0)+(vert?1:0),vert?-10:-16,-28,vert?20:32,42,p=>{const HU=hdShadeOf('#a86830',5);
 if(!vert){for(let y=10;y<26;y++){const t=(y-10)/16,hw=Math.round(30-t*t*16);for(let x=-hw;x<hw;x++)p.put(x,y,HU[hdQ(.75-t*.6-(x/hw)*.12,5,x,y)])}for(let x=-30;x<30;x++){p.put(x,10,HU[4]);p.put(x,11,HU[4])}for(const y of[15,20])for(let x=-27;x<27;x++)p.put(x,y,HU[1]);
  const mx=flip?12:-12;p.F(mx-1,-50,mx+1,11,WDP[1]);const sd=flip?-1:1;for(let k=0;k<30;k++){const w=Math.round(k*.75)+2;for(let q=0;q<w;q++)p.put(sd>0?mx+2+q:mx-2-q,-48+k,hdC(k%10===4?'#e05040':(q<2?'#d8d0c0':'#f4f0e4')))}}
 else{for(let y=-8;y<24;y++){const t=Math.abs(y-8)/16,hw=Math.round(18-t*t*8);for(let x=-hw;x<hw;x++)p.put(x,y,HU[hdQ(.7-(y+8)/40-(x/hw)*.15,5,x,y)])}for(let y=-6;y<22;y+=7)for(let x=-14;x<14;x++)p.put(x,y,HU[1]);p.box(-12,-4,12,18,HU,6,-.2);
  p.F(-1,-50,1,0,WDP[1]);for(let k=0;k<30;k++){const w=Math.round(k*.6)+2;for(let q=-w;q<w;q++)p.put(q,-48+k,hdC(k%10===4?'#e05040':'#f4f0e4'))}}},'#2a180c')}
function hdWreckS(){return hdK('wk',-1,-22,52,48,p=>{const HU=hdShadeOf('#8a6038',5),SL=hdShadeOf('#d8d0c0',4);
 for(let x=0;x<96;x++){const t=x/96,top=Math.round(14-Math.sin(t*Math.PI)*10+(x>34&&x<56?6:0)),bot=Math.round(44-Math.sin(t*Math.PI)*4);for(let y=top;y<bot;y++){const u=(y-top)/(bot-top);let c=HU[hdQ(.8-u*.7,5,x,y)];if((y-top)%7===0)c=HU[0];if(x>36&&x<56&&y<top+16)c=(x%6===0)?HU[3]:hdC('#1a1008');p.put(x,y,c)}p.put(x,top,HU[4])}
 p.F(60,-26,64,16,WDP[1]);p.F(64,-30,68,-18,WDP[1]);for(let k=0;k<18;k++)for(let q=0;q<16-(k>>1);q++)if(hrand(k,q)>.12)p.put(66+q,-20+k,SL[k===4?1:(q<2?2:3)]);
 p.box(8,30,22,42,WDP,1);p.box(8,28,22,33,hdShadeOf('#b07838',4),2,.1);p.F(13,32,17,36,GOLDP[2])},'#20140c')}
function hdHutS(){return hdK('ht',-5,-40,58,42,p=>{const TH=hdP(['#7a5a20','#a08030','#c8a848','#e0c868','#f0dc90']),PL=hdShadeOf('#b89868',5);
 p.box(0,-42,96,0,PL,0);for(let x=8;x<96;x+=10)p.F(x,-42,x+1,0,PL[1]);p.F(0,-4,96,0,PL[0]);
 p.box(36,-28,58,0,WDP,1);p.F(54,-15,56,-13,GOLDP[2]);p.box(8,-32,24,-20,WLP,1);p.F(10,-30,22,-22,hdC('#a8d8f8'));p.F(15,-30,17,-22,WLP[2]);
 for(let y=-80;y<-36;y++){const t=(y+80)/44,hw=Math.round(30+t*28);for(let x=48-hw;x<48+hw;x++){const strand=hrand(x>>1,1);p.put(x,y,TH[hdQ(.85-t*.5+(strand-.5)*.3-((x-48)/hw)*.15,5,x,y)])}}
 for(let x=-10;x<106;x++){const d=Math.floor(hrand(x,3)*4);for(let y=-38;y<-34+d;y++)p.put(x,y,TH[1+(x%3===0?1:0)])}},'#2a1a0c')}
drawLamp=function(x,y,tm){const px=x*16,py=y*16;shd(px+8,py+15,10);hdPut(hdLampPost(dark()>.15),px,py)};
drawWell=function(x,y){const px=x*16,py=y*16;shd(px+8,py+15,20);hdPut(hdWellS(),px,py)};
drawSign=function(i){const px=(i%N)*16,py=((i/N)|0)*16;shd(px+8,py+15,10);hdPut(hdSignS(),px,py)};
drawBridge=function(i,tm){const x=i%N,y=(i/N)|0,horiz=ROADS.has(i-1)||ROADS.has(i+1)||(tile[i-1]>0&&!BRIDGE.has(i-1)&&tile[i-1]!==undefined&&!BRIDGE.has(i+N)&&!BRIDGE.has(i-N));
 hdPut(hdBridgeT(horiz,horiz?(x+y)%2===0:y%2===0),x*16,y*16)};
drawBoat=function(x,y,tm){const px=x*16+8,py=y*16+4+Math.round(Math.sin(tm*1.6+x)*2)/2;g.fillStyle='rgba(10,30,70,.25)';g.fillRect(px-15,py+3,30,2);hdPut(hdRowboat(true,false,false),px,py)};
drawBoat26=function(tm){const x=Math.round(P.x),bob=Math.round(Math.sin(tm*2.6)*2)/2,y=Math.round(P.y)+bob,hz=face[0]!==0;
 g.fillStyle='rgba(10,30,70,.25)';if(hz)g.fillRect(x-15,y+3,30,2);else g.fillRect(x-9,y+11,18,2);hdPut(hdRowboat(true,hz&&face[0]<0,!hz),x,y-(hz?2:0))};
drawWreck=function(tm){const x0=(WRK.x-1)*16,y0=(WRK.y-1)*16+6;shd(x0+24,y0+22,48);hdPut(hdWreckS(),x0,y0);if(Math.sin(tm*3)>.6){g.fillStyle='#fff8c0';g.fillRect(x0+6.5,y0+15,1,1)}};
drawHut=function(){const x0=(HRM.x-1)*16,base=HRM.y*16-2;shd(x0+24,base,52);hdPut(hdHutS(),x0,base)};
// --- farm plots and crops ---
function hdSoil(m,w){return hdK('so'+m+(w?1:0),0,0,16,16,p=>{const SP=w?hdP(['#3a2412','#4e3018','#64401f','#7a5230','#8e6440']):hdP(['#5a3a1e','#7a5030','#9a6a3c','#b4844e','#cc9c62']);
 const l=m&1,r=m&2,u=m&4,d=m&8;for(let y=0;y<32;y++)for(let x=0;x<32;x++){const ry=y%8,v=(ry<3?.75:ry<5?.55:ry<7?.3:.15)+(hdH(x,y+m*5)-.5)*.18;p.put(x,y,SP[hdQ(v,5,x,y)])}
 if(!u){p.F(0,0,32,2,SP[0]);p.F(0,2,32,3,SP[4])}if(!d){p.F(0,29,32,30,SP[1]);p.F(0,30,32,32,SP[0])}if(!l){p.F(0,0,2,32,SP[0]);p.F(2,0,3,32,SP[3])}if(!r){p.F(30,0,32,32,SP[0]);p.F(29,0,30,32,SP[1])}},false)}
function hdCropS(c,s,ripe){return hdK('cp'+c+s+(ripe?1:0),0,-8,16,24,p=>{const G=LEAFP;
 if(s===0){for(const[x,y]of[[8,10],[20,12],[14,22],[24,24]]){p.put(x,y,hdC('#e8c888'));p.put(x+1,y,hdC('#c8a060'))}return}
 if(s===1){for(const[x,y]of[[8,12],[20,12],[14,24]]){p.F(x,y-4,x+1,y+1,G[2]);p.ell(x-2,y-5,2,1.2,G,.1);p.ell(x+3,y-6,2,1.2,G,.2)}return}
 if(!ripe){for(const[x,y]of[[7,12],[21,12],[14,26]])for(let k=0;k<5;k++){const a=-1.2+k*.6;for(let j=0;j<7;j++)p.put(Math.round(x+Math.sin(a)*j*.9),Math.round(y-Math.cos(a)*j),G[1+(j>>1)>4?4:1+(j>>1)])}return}
 if(c==='wheat'){const WP=hdP(['#9a7418','#c8a038','#e8c450','#f8e490']);for(let k=0;k<7;k++){const x=4+k*4,h=20+Math.floor(hrand(k,s)*6),top=30-h;
   p.F(x,top+6,x+1,30,WP[1]);for(let j=0;j<7;j++){p.put(x-1+(j%2),top+j,WP[j<2?3:2]);p.put(x+(j%2),top+j,WP[1])}p.put(x,top-1,WP[3])}}
 else if(c==='carrot'){for(const x of[8,22]){p.box(x-4,14,x+4,22,hdShadeOf('#f08830',4),3,.1);for(let k=0;k<3;k++)p.F(x-3,16+k*2,x-1,17+k*2,hdC('#c86018'));
   for(let k=0;k<4;k++){const a=-.9+k*.6;for(let j=0;j<10;j++)p.put(Math.round(x+Math.sin(a)*j*.8),14-j,LEAFP[2+(j>5?1:0)])}}}
 else{p.ell(16,18,14,11,hdShadeOf('#e87820',5),.08);for(const x of[9,16,23])for(let y=9;y<28;y++)if(((x-16)/14)**2+((y-18)/11)**2<.85)p.put(x,y,hdC('#c85810'));p.box(14,3,18,9,hdShadeOf('#5a8a28',4),1);p.ell(24,6,4,3,LEAFP,.1)}},ripe?'#2a1a08':'#14301a')}
drawPlot=function(i,p,tm,X,Y,hasF){const x=X!=null?X:i%N,y=Y!=null?Y:(i/N)|0,px=x*16,py=y*16,has=hasF||((dx,dy)=>FARM.has((y+dy)*N+x+dx)),m=(has(-1,0)?1:0)|(has(1,0)?2:0)|(has(0,-1)?4:0)|(has(0,1)?8:0);
 hdPut(hdSoil(m,wet(p)),px,py);if(!p.c)return;const s=stageOf(p),rp=ripe(p);hdPut(hdCropS(p.c,rp?9:Math.min(s,2),rp),px,py,rp&&p.c==='wheat'?Math.round(Math.sin(tm*1.5+x)*1)/2:0);
 if(rp&&Math.sin(tm*3+i)>.9){g.fillStyle='#fff8c0';g.fillRect(px+3+(i%9),py+1+(i%5),1,1)}};
// --- item icons: every icon is smoothed (EPX) to 2x, given a thin dark outline and a soft top-left highlight ---
function hdIconPost(src){const w=src.width,h=src.height,x=src.getContext('2d',{willReadFrequently:true}),s=new Uint32Array(x.getImageData(0,0,w,h).data.buffer),W2=w*2,H2=h*2,d=new Uint32Array(W2*H2),at=(X,Y)=>X<0||Y<0||X>=w||Y>=h?0:s[Y*w+X];
 for(let Y=0;Y<h;Y++)for(let X=0;X<w;X++){const pp=s[Y*w+X],A=at(X,Y-1),B=at(X+1,Y),C=at(X-1,Y),D=at(X,Y+1);let a=pp,b=pp,c=pp,e=pp;if(C===A&&C!==D&&A!==B)a=A;if(A===B&&A!==C&&B!==D)b=B;if(D===C&&D!==B&&C!==A)c=C;if(B===D&&B!==A&&D!==C)e=D;
  const i=Y*2*W2+X*2;d[i]=a;d[i+1]=b;d[i+W2]=c;d[i+W2+1]=e}
 const out=new Uint32Array(d),OL=hdC('#1e1820');for(let Y=0;Y<H2;Y++)for(let X=0;X<W2;X++){const i=Y*W2+X;if(d[i]>>>24)continue;const n=(X>0&&d[i-1]>>>24)||(X<W2-1&&d[i+1]>>>24)||(Y>0&&d[i-W2]>>>24)||(Y<H2-1&&d[i+W2]>>>24);if(n)out[i]=OL}
 for(let Y=1;Y<H2;Y++)for(let X=1;X<W2;X++){const i=Y*W2+X;if(!(d[i]>>>24))continue;if(!(d[i-W2]>>>24)||!(d[i-1]>>>24)){const v=d[i],r=v&255,gg=(v>>8)&255,bb=(v>>16)&255,L=t=>Math.min(255,t+Math.round((255-t)*.35));out[i]=(v&0xff000000)|(L(bb)<<16)|(L(gg)<<8)|L(r)}}
 const c=document.createElement('canvas');c.width=W2;c.height=H2;const cx=c.getContext('2d'),im=cx.createImageData(W2,H2);new Uint32Array(im.data.buffer).set(out);cx.putImageData(im,0,0);return c}
if(typeof HTMLCanvasElement!=='undefined'){const _tdu=HTMLCanvasElement.prototype.toDataURL;let inIcon=0;
 const _ic34=iconURL;iconURL=function(k,col){if(inIcon)return _ic34(k,col);inIcon=1;const P0=HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL=function(...a){if(this.width<=24&&this.height<=24){try{return _tdu.apply(hdIconPost(this),a)}catch(e){}}return _tdu.apply(this,a)};
  try{return _ic34(k,col)}finally{HTMLCanvasElement.prototype.toDataURL=P0;inIcon=0}};
 for(const k in ICONC)delete ICONC[k]}
