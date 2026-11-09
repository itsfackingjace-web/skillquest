// ---------------------------------------------------------------- 59. Gen 3 UI: pixel frames for the HUD, text box, menus and buttons
// Drawing only. The HUD boxes, bars and text box (g3box / g3bar) become Gen 3 frames: square, stepped one "pixel" at
// each corner, dark navy outside, light blue inside, flat fill; the sailing crossing card is redrawn in flat bands with
// the pixel boat. A stylesheet squares off every menu, card, button, slot and bar (stepped corners on the big frames,
// pixel octagons for the touch buttons) and keeps images and canvases crisp.
{const px=U=>Math.max(2,Math.round(U));
 g3box=function(x,y,w,h,U,fill){const p=px(U);x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);
  g.fillStyle='#485870';g.fillRect(x+p,y,w-2*p,h);g.fillRect(x,y+p,w,h-2*p);
  g.fillStyle='#a8c0e0';g.fillRect(x+2*p,y+p,w-4*p,h-2*p);g.fillRect(x+p,y+2*p,w-2*p,h-4*p);
  g.fillStyle=fill||'#f8f8f8';g.fillRect(x+3*p,y+2*p,w-6*p,h-4*p);g.fillRect(x+2*p,y+3*p,w-4*p,h-6*p)};
 g3bar=function(lab,x,y,U,f,col,txt,tx){const p=px(U),X=Math.round(x),Y=Math.round(y-5*U),lw=Math.round(30*U),lh=Math.round(10*U);
  g.fillStyle='#485870';g.fillRect(X+p,Y,lw-2*p,lh);g.fillRect(X,Y+p,lw,lh-2*p);
  g.font='700 '+8*U+'px '+PF;g.textAlign='center';g.textBaseline='middle';g.fillStyle='#f8d048';g.fillText(lab,x+15*U,y+.5*U);
  const bx=Math.round(x+33*U),bw=Math.round(90*U),by=Math.round(y-4*U),bh=Math.round(8*U),iw=bw-2*p,fw=Math.round(iw*Math.max(0,Math.min(1,f)));
  g.fillStyle='#485870';g.fillRect(bx+p,by,bw-2*p,bh);g.fillRect(bx,by+p,bw,bh-2*p);
  g.fillStyle='#e8f0e8';g.fillRect(bx+p,by+p,iw,bh-2*p);
  if(fw>0){g.fillStyle=col;g.fillRect(bx+p,by+p,fw,bh-2*p);g.fillStyle='rgba(255,255,255,.4)';g.fillRect(bx+p,by+p,fw,p)}
  g3text(txt,tx,y,10,U,'#404040','right',600)};
 // the sailing crossing card, redrawn on top of the old one in flat bands
 const _dh59=drawHUD;drawHUD=function(){_dh59();if(typeof TRAVEL49==='undefined'||!TRAVEL49)return;const T=TRAVEL49,k=T.t/T.dur,a=k<.45?k/.45:k>.7?Math.max(0,(1-k)/.3):1,now=performance.now()/1000;
  const u=Math.max(2,Math.round(Math.min(W,H)/160));g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=a;g.imageSmoothingEnabled=false;
  const bands=['#183a78','#1e4a90','#2458a8','#2a68c0','#3478d0'];for(let i=0;i<5;i++){g.fillStyle=bands[i];g.fillRect(0,Math.round(H*i/5),W,Math.ceil(H/5)+1)}
  g.fillStyle='#78b0f0';for(let r=0;r<7;r++){const yy=Math.round(H*.42+r*H*.075),off=Math.round(((now*40*(r%2?1:-1))%(16*u)));for(let x=-16*u+off;x<W;x+=16*u){g.fillRect(x,yy,5*u,u);g.fillRect(x+u,yy-u,3*u,u)}}
  const bt=hdRowboat(true,false,false),s=u*2,bx=Math.round(W/2+Math.sin(now*1.3)*10),by=Math.round(H*.45+Math.round(Math.sin(now*3)*2)*u);
  g.drawImage(bt.c,bx+bt.ox*s,by+bt.oy*s,bt.ww*s,bt.hh*s);
  const tw=Math.min(W-8*u,140*u),tx=Math.round((W-tw)/2),ty=Math.round(H*.24);g3box(tx,ty,tw,22*u,u/2,'#f8f8f8');
  g.fillStyle='#404040';g.textAlign='center';g.textBaseline='middle';g.font='700 '+Math.round(8*u)+'px '+PF;g.fillText('Sailing to '+WORLD_REGIONS[T.to].name+'…',W/2,ty+11*u);g.restore()};
 const css=document.createElement('style');css.textContent=`
#cm *,#pn *,#sm *,#chs *,#hp,#hpc,#gpcur,.g3 *,.ig,.slot,.bl,.pk,.sk,.qc,.sb,.rc,.gr,.gc,.fg,.qb,.ng,.skc,.skd,.br,.xb,.sw,.ab,#cgo,#cb,#pb2,#mb{border-radius:0!important}
.g3,#sm,#pn .pc,#cm .cc,#chs .cw{border-radius:0!important;border:4px solid #485870!important;box-shadow:inset 0 0 0 3px #a8c0e0!important;
 clip-path:polygon(4px 0,calc(100% - 4px) 0,calc(100% - 4px) 4px,100% 4px,100% calc(100% - 4px),calc(100% - 4px) calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,4px calc(100% - 4px),0 calc(100% - 4px),0 4px,4px 4px)}
#hp,#hpc,.pk,#pn .pt button,#pn .qb,#pn .gc,#pn .fg,#pn .ng,#pn .sb,#pn .rc,#pn .gr,#pn .sk,#pn .qc,.bl,.ig,.slot,.skc,.skd,#cgo,.ab,#chs .bt button{
 clip-path:polygon(2px 0,calc(100% - 2px) 0,100% 2px,100% calc(100% - 2px),calc(100% - 2px) 100%,2px 100%,0 calc(100% - 2px),0 2px)}
.b{border-radius:0!important;border-width:3px!important;clip-path:polygon(30% 0,70% 0,70% 3px,85% 3px,85% 8%,92% 8%,92% 15%,97% 15%,97% 30%,100% 30%,100% 70%,97% 70%,97% 85%,92% 85%,92% 92%,85% 92%,85% 97%,70% 97%,70% 100%,30% 100%,30% 97%,15% 97%,15% 92%,8% 92%,8% 85%,3% 85%,3% 70%,0 70%,0 30%,3% 30%,3% 15%,8% 15%,8% 8%,15% 8%,15% 3%,30% 3%)}
img,canvas,.slot img,#pn img{image-rendering:pixelated;image-rendering:crisp-edges}
.gpf{box-shadow:none!important;outline:3px solid #f8a020!important}
#gpcur{border-radius:0!important}`;document.head.appendChild(css)}
