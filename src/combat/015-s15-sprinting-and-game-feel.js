// ---------------------------------------------------------------- 15. Sprinting and game feel
// Hold Shift (or push the stick all the way) to sprint. Hits show damage numbers; getting hurt
// flashes the screen, shakes the camera and knocks you back. A Pokemon-style alarm beeps at low HP.
let sprintTip=false,dustT=0,lowT=0,FLASH=0;const DUST=[],DMGS=[];
function isSprint(){if(swing>0||hunger<=5||dead||pnOpen||menuOpen||FISH)return false;
 const kb=K.shift&&(K.w||K.a||K.s||K.d||K.arrowup||K.arrowdown||K.arrowleft||K.arrowright);return!!(kb||Math.hypot(jx,jy)>=.95)}
function dustColor(){if(SCENE)return'#c8b8a0';const t=tile[Math.floor(P.y/16)*N+Math.floor(P.x/16)];return t===4?'#ffffff':t===5||t===1?'#f0d898':'#d8c8a0'}
function shakeScreen(px){cv.style.transform='translate('+((Math.random()*2-1)*px).toFixed(1)+'px,'+((Math.random()*2-1)*px).toFixed(1)+'px)';clearTimeout(shakeScreen.t);shakeScreen.t=setTimeout(()=>{cv.style.transform=''},90)}
const _u15=upd;upd=function(dt){const hp0=P.hp,x0=P.x,y0=P.y;_u15(dt);if(menuOpen||pnOpen)return;
 const moving=Math.hypot(P.x-x0,P.y-y0)>.2,spr=moving&&isSprint();
 if(spr){hunger=Math.max(0,hunger-dt*.9*FOOD_RATE);if(!sprintTip){sprintTip=true;say('Sprinting! It uses up food faster.')}
  if((dustT-=dt)<=0){dustT=.07;DUST.push({x:P.x-face[0]*4+(Math.random()*6-3),y:P.y+6,t:0,c:dustColor(),sc:curScene()})}}
 for(const d of DUST)d.t+=dt;while(DUST.length&&DUST[0].t>.45)DUST.shift();for(const d of DMGS)d.t+=dt;while(DMGS.length&&DMGS[0].t>.9)DMGS.shift();
 if(!dead&&P.hp<hp0){FLASH=.35;shakeScreen(5);DMGS.push({x:P.x,y:P.y-18,v:'-'+(hp0-P.hp),t:0,c:'#f05030',sc:curScene()});
  let best=null,bd=40;for(const n of en){const d=Math.hypot(n.x-P.x,n.y-P.y);if(d<bd){bd=d;best=n}}
  if(best){const dx=P.x-best.x,dy=P.y-best.y,l=Math.hypot(dx,dy)||1;for(let k=0;k<6;k++){const nx=P.x+dx/l,ny=P.y+dy/l;if(!(solid(nx-5,ny-3)||solid(nx+5,ny-3)||solid(nx-5,ny+6)||solid(nx+5,ny+6))){P.x=nx;P.y=ny}}}}
 FLASH=Math.max(0,FLASH-dt);
 if(!dead&&P.hp===1){if((lowT-=dt)<=0){lowT=.9;tone(988,.07,'square',.035);tone(784,.07,'square',.035,0,.09)}}else lowT=0};
// damage numbers on the enemies you hit
const _atk15=attack;attack=function(){const before=en.map(n=>[n,n.hp]);_atk15();for(const[n,h]of before){const d=h-n.hp;if(d>0)DMGS.push({x:n.x,y:n.y-(n.type==='boss'?30:14),v:String(Math.round(d)),t:0,c:n.dead?'#f8d848':'#ffffff',sc:curScene()})}};
function drawFx(){const sc=curScene();for(const d of DUST){if(d.sc!==sc)continue;const a=1-d.t/.45;g.globalAlpha=a*.8;Rg(d.x-1,d.y-d.t*10,2+Math.round(d.t*4),2,d.c)}g.globalAlpha=1;
 g.save();g.font='700 9px '+PF;g.textAlign='center';g.textBaseline='middle';g.lineWidth=3;g.lineJoin='round';
 for(const d of DMGS){if(d.sc!==sc)continue;g.globalAlpha=Math.max(0,1-d.t/.9);const y=Math.round(d.y-d.t*16);g.strokeStyle='#181018';g.strokeText(d.v,Math.round(d.x),y);g.fillStyle=d.c;g.fillText(d.v,Math.round(d.x),y)}g.restore()}
const _nd15=NEWDRAW;NEWDRAW=function(...a){_nd15(...a);if(!SCENE)drawFx()};
const _dr15=drawRoom;drawRoom=function(tm){_dr15(tm);drawFx()};
const _dh15=drawHUD;drawHUD=function(){if(FLASH>0){g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(240,40,40,'+(FLASH*.5)+')';g.fillRect(0,0,W,H);g.restore()}_dh15()};
hp.innerHTML=hp.innerHTML.replace('WASD / arrows: move','WASD / arrows: move<br>Shift: sprint');
