// ---- 297. The guild hall, drawn like the game's town buildings ----
// Nov 28 (Jace, in-game report: "The guild hall looks completely like AI and doesn't fit the style of the rest of the game"): 197
// put the island ruins' stone vault (050's HD 'vault' landmark) on the guild island as the hall. It is its own building now, in
// the style of 057's town buildings (flat shade bands, 1px dark outline, shingle roof): a stone ground floor with an arched double
// door, a half-timbered upper floor with three windows, a roof in the guild's colour with a pennant on the ridge, two guild banners
// and a plaque with the guild's tag over the door. 197's applyBuildings adds it as {t:'ghall'} over the hall spot and the ring of
// free ground beside it (5 x 2 tiles; the spot's ring was always kept free of planting). Drawing only, plus that footprint.
// window.SQGHALL = {draw(it, tm), canvas(col)}.
(()=>{const COLS=['#d83a30','#e8862a','#e8c830','#48a848','#30a0a0','#3870d8','#8048c8','#d058a0','#e8e8e8','#404048'];// 197's guild colours
 const mix=hdMix,OL='#24181c',ST=['#2a2a36','#5e5e70','#7c7c90','#9a9aae','#c4c4d4'],WD=['#3a2210','#5a3418','#7a4a24','#9a6434','#b88048'];
 const ramp5=c=>[mix(c,'#000000',.5),mix(c,'#000000',.3),mix(c,'#000000',.13),c,mix(c,'#ffffff',.25)];
 const info=()=>{try{return(window.SQGUILD&&SQGUILD.state&&SQGUILD.state.info)||{}}catch(e){return{}}};
 const gcol=()=>COLS[(info().col|0)]||COLS[0];
 // the canvas covers x -8..88 and y -96..2 around the footprint's bottom-left corner (base = bottom of the 2 rows)
 const OX=-8,OY=-96,CW=96,CH=98,CACHE=new Map();
 function outline(c,col){const x=c.getContext('2d'),W=c.width,H=c.height,im=x.getImageData(0,0,W,H),d=new Uint32Array(im.data.buffer),o=new Uint32Array(d),oc=hdC(col),op=i=>(d[i]>>>24)===255;
  for(let y=0;y<H;y++)for(let X=0;X<W;X++){const i=y*W+X;if(d[i]>>>24)continue;if((X>0&&op(i-1))||(X<W-1&&op(i+1))||(y>0&&op(i-W))||(y<H-1&&op(i+W)))o[i]=oc}
  new Uint32Array(im.data.buffer).set(o);x.putImageData(im,0,0)}
 function canvas(col){let c=CACHE.get(col);if(c)return c;c=document.createElement('canvas');c.width=CW;c.height=CH;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
  const F=(a,b,w,h,k)=>{x.fillStyle=k;x.fillRect(a-OX,b-OY,w,h)},RF=ramp5(col),BN=ramp5(col),W=80;
  // ground floor: stone blocks in staggered courses, a darker plinth
  F(0,-36,W,36,ST[2]);for(let r=0;r<6;r++){const y=-36+r*6;F(0,y,W,1,ST[3]);F(0,y+5,W,1,ST[1]);for(let k=(r%2?6:0);k<W;k+=12)F(k,y+1,1,4,ST[1])}
  F(0,-3,W,3,ST[1]);F(0,-3,W,1,ST[3]);F(0,-36,2,33,ST[3]);F(W-2,-36,2,33,ST[1]);
  // upper floor: plaster between dark timbers
  F(0,-58,W,22,'#eadfc4');for(let y=-55;y<-38;y+=4)F(2,y,W-4,1,'#ddd0b0');
  F(0,-58,W,3,WD[1]);F(0,-58,W,1,WD[3]);F(0,-39,W,3,WD[1]);F(0,-39,W,1,WD[3]);
  for(const px of[0,26,52,W-3]){F(px,-58,3,22,WD[1]);F(px,-58,1,22,WD[2])}
  // three windows (like the town houses': white frames, two-tone glass)
  for(const wx of[8,34,60]){F(wx-1,-54,14,13,'#3a2a24');F(wx,-53,12,11,'#f8f4e8');F(wx+1,-52,10,9,'#90d0f8');F(wx+1,-47,10,4,'#5898d8');
   F(wx+6,-52,1,9,'#f8f4e8');F(wx+1,-47,10,1,'#f8f4e8');F(wx+2,-51,2,1,'#ffffff');F(wx+2,-50,1,1,'#ffffff')}
  // roof: shingle rows in the guild's colour, narrower towards the ridge, dark eave
  for(let r=0;r<7;r++){const y=-86+r*4,ins=(6-r)*2,rx=-6+ins,rw=W+12-ins*2,k0=r<2?RF[4]:r<5?RF[3]:RF[2];F(rx,y,rw,4,k0);F(rx,y+3,rw,1,RF[1]);for(let k=rx+(r%2?4:0);k<rx+rw;k+=8)F(k,y,1,3,RF[1])}
  F(6,-86,W-12,1,mix(RF[4],'#ffffff',.3));F(-6,-60,W+12,2,RF[0]);
  // ridge finials and the flagpole (the pennant flies, drawn every frame)
  F(5,-89,3,3,'#c89020');F(6,-89,1,1,'#f8d848');F(W-8,-89,3,3,'#c89020');F(W-7,-89,1,1,'#f8d848');F(39,-95,2,9,'#5a4a3a');F(39,-96,2,1,'#f8d848');
  // the door: a stone arch, two leaves with iron bands, ring handles, a step
  const dx=29,dw=22;F(dx-2,-27,dw+4,27,ST[3]);F(dx-1,-29,dw+2,2,ST[3]);F(dx+1,-30,dw-2,1,ST[3]);
  F(dx,-26,dw,26,WD[0]);F(dx+1,-25,dw-2,25,WD[2]);F(dx+2,-27,dw-4,2,WD[2]);F(dx+1,-25,dw-2,1,WD[3]);
  for(const k of[4,8,14,18])F(dx+k,-24,1,24,WD[1]);F(dx+10,-26,2,26,WD[0]);
  for(const y of[-19,-7]){F(dx+1,y,dw-2,2,'#3a3a4a');F(dx+1,y,dw-2,1,'#6a6a80');for(const k of[3,8,13,18])F(dx+k,y,1,1,'#9a9aae')}
  F(dx+7,-13,2,2,'#c89020');F(dx+13,-13,2,2,'#c89020');F(dx+7,-13,1,1,'#f8d848');F(dx+13,-13,1,1,'#f8d848');
  F(dx-4,-1,dw+8,1,ST[3]);
  // the plaque over the door (its tag is written every frame) and two wall lanterns
  F(dx-3,-37,dw+6,8,WD[0]);F(dx-2,-36,dw+4,6,BN[1]);F(dx-2,-36,dw+4,1,BN[3]);
  for(const lx of[dx-8,dx+dw+5]){F(lx,-22,3,1,'#3a3a4a');F(lx+1,-21,1,2,'#3a3a4a');F(lx-1,-19,5,6,'#3a3a4a');F(lx,-18,3,4,'#f8c848');F(lx,-18,3,1,'#fff0a0')}
  // banners in the guild's colour: a gold rod, gold edges, a swallowtail, a gold star
  for(const bx of[9,W-19]){F(bx-1,-34,12,2,'#c89020');F(bx-1,-34,12,1,'#f8d848');F(bx,-32,10,22,BN[3]);F(bx,-32,1,22,BN[4]);F(bx+9,-32,1,22,BN[1]);
   F(bx,-11,4,3,BN[3]);F(bx+6,-11,4,3,BN[3]);F(bx,-10,3,3,BN[3]);F(bx+7,-10,3,3,BN[3]);F(bx,-8,2,1,BN[2]);F(bx+8,-8,2,1,BN[2]);
   F(bx+1,-31,8,1,'#f8d848');F(bx+4,-26,2,7,'#f8d848');F(bx+2,-24,6,3,'#f8d848');F(bx+3,-25,4,5,'#f8d848');F(bx+4,-24,1,1,'#fff8c0')}
  outline(c,OL);x.fillStyle='rgba(0,0,0,.22)';x.fillRect(-4-OX,1-OY,W+8,1);
  CACHE.set(col,c);return c}
 function draw(it,tm){const X0=it.x*16,base=(it.y+(it.h||2))*16,col=gcol(),I=info();
  g.drawImage(canvas(col),X0+OX,base+OY);
  // the pennant
  const P5=ramp5(col),ph=(tm||0)*3;for(let k=0;k<12;k++){const h=Math.max(1,6-Math.floor(k/2)),y=Math.round(base-95+Math.sin(ph-k*.5)*1.2+(6-h)/2);Rg(X0+41+k,y,1,h,k<2?P5[2]:P5[3]);if(k%4===0)Rg(X0+41+k,y,1,1,P5[4])}
  // the tag on the plaque
  const tag=String(I.tag||'GUILD').slice(0,5);g.save();g.font='700 6px '+PF;g.textAlign='center';g.textBaseline='middle';g.fillStyle='#3a2210';g.fillText(tag,X0+41,base-32.5);g.fillStyle='#f8e8b0';g.fillText(tag,X0+40,base-33);g.restore()}
 // the hall's spot, as 197 lays it out, drawn as this building
 SQFURN.wrap('297 guild hall',next=>function(it,tm){if(it&&it.t==='ghall'){try{draw(it,tm)}catch(e){self.SQERR&&SQERR(e,'297-1')}return}return next.apply(this,arguments)});
 window.SQGHALL={draw,canvas};
})();
