// ---------------------------------------------------------------- 29. Wand ultimates (L1 + R1, or V on a keyboard)
// Fire: Inferno - a ring of fire around you, heavy damage and long burns. Ice: Frost Nova - freezes everything
// nearby solid for 4 seconds. Storm: Thunderstorm - lightning strikes up to 5 enemies at once. 10 mana, 20 s cooldown.
let ULTCD=0,ULTFX=null;const ULT_COST=10;
const ultReady=()=>ULTCD<=0&&MANA>=ULT_COST;
function castUlt(){if(dead||menuOpen||pnOpen||BUILD)return;if(!WAND){say('Equip a wand in your off-hand to use an ultimate.');sfx('swish');return}
 if(SCENE&&!SCENE.room.cave){say('Not indoors!');return}if(ULTCD>0){say('Your ultimate is recharging ('+Math.ceil(ULTCD)+'s).');sfx('nomana');return}
 if(MANA<ULT_COST){say('You need '+ULT_COST+' mana for an ultimate.');sfx('nomana');return}
 MANA-=ULT_COST;ULTCD=20;const dmg=spellDmg(WAND),sc=curScene(),near=r=>en.filter(n=>!n.dead&&Math.hypot(n.x-P.x,n.y-P.y)<r);
 if(WAND==='fire'){ULTFX={el:'fire',t:0,life:.7};for(let k=0;k<40;k++){const a=k/40*6.283;part(P.x+Math.cos(a)*10,P.y-4+Math.sin(a)*8,Math.cos(a)*120,Math.sin(a)*90-20,.6,k%3?'#f88830':'#f8e060',-30,2)}
  for(const n of near(70)){spellHit({el:'fire',sc},n,dmg*2);n.burn=6}say('INFERNO!');sfx('cfire');setTimeout(()=>sfx('cfire'),120);if(typeof rumble==='function')rumble(300,.8,.6)}
 else if(WAND==='ice'){ULTFX={el:'ice',t:0,life:.8};for(let k=0;k<36;k++){const a=k/36*6.283;part(P.x,P.y-4,Math.cos(a)*140,Math.sin(a)*110,.7,k%2?'#c8f0ff':'#ffffff',0,2)}
  for(const n of near(80)){spellHit({el:'ice',sc},n,dmg+1);n.frozen=4;n.slow=0}say('FROST NOVA!');sfx('cice');setTimeout(()=>sfx('cice'),100);if(typeof rumble==='function')rumble(250,.5,.8)}
 else{ULTFX={el:'storm',t:0,life:.6,flash:.25};const tg=near(120).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y)).slice(0,5);ULTFX.bolts=tg.map(n=>[n.x,n.y]);
  if(!tg.length){const a=Math.random()*6.283;ULTFX.bolts=[[P.x+Math.cos(a)*40,P.y+Math.sin(a)*30]]}for(const n of tg)spellHit({el:'storm',sc},n,dmg*2+2);say('THUNDERSTORM!');sfx('cstorm');setTimeout(()=>sfx('cstorm'),90);setTimeout(()=>sfx('cstorm'),200);if(typeof rumble==='function')rumble(400,1,1)}
 saveLocal()}
addEventListener('keydown',e=>{if((e.key||'').toLowerCase()==='v'&&!e.repeat){const tg=e.target;if(tg&&(tg.tagName==='INPUT'||tg.tagName==='TEXTAREA'))return;castUlt()}});
hp.innerHTML=hp.innerHTML.replace('P: equipment (equip tools, weapons, armor)','P: equipment (equip tools, weapons, armor)<br>V: wand ultimate (10 mana)');
const _u29=upd;upd=function(dt){const paused=menuOpen||pnOpen;const fz=paused?null:en.filter(n=>n.frozen>0).map(n=>[n,n.x,n.y]);_u29(dt);if(paused)return;
 ULTCD=Math.max(0,ULTCD-dt);for(const[n,x,y]of fz){n.x=x;n.y=y;n.frozen-=dt;n.kx=n.ky=0}if(ULTFX){ULTFX.t+=dt;if(ULTFX.t>ULTFX.life)ULTFX=null}};
function drawUlt(tm){const f=ULTFX;if(f&&!SCENE===!SCENE){const p=f.t/f.life,x=Math.round(P.x),y=Math.round(P.y-4);
  if(f.el==='fire'){const r=Math.round(10+p*60);g.globalAlpha=1-p;for(let k=0;k<28;k++){const a=k/28*6.283+tm,fx=Math.round(x+Math.cos(a)*r),fy=Math.round(y+Math.sin(a)*r*.75),fl=Math.floor(tm*12+k)%2;Rg(fx-1,fy-3-fl,3,4,'#f88830');Rg(fx,fy-2-fl,1,2,'#f8e060')}g.globalAlpha=1}
  else if(f.el==='ice'){const r=Math.round(8+p*70);g.globalAlpha=(1-p)*.9;for(let k=0;k<32;k++){const a=k/32*6.283,fx=Math.round(x+Math.cos(a)*r),fy=Math.round(y+Math.sin(a)*r*.75);Rg(fx-1,fy,3,1,'#e8f8ff');Rg(fx,fy-1,1,3,'#e8f8ff')}g.globalAlpha=1}
  else if(f.bolts&&p<.6){for(const[bx,by]of f.bolts){let cx=bx,cy=by-110;for(let s=0;s<10;s++){const nx=bx+(s<9?(Math.random()-.5)*12:0),ny=cy+11;for(let k=0;k<11;k++){const px2=Math.round(cx+(nx-cx)*k/11),py2=Math.round(cy+(ny-cy)*k/11);Rg(px2-1,py2,3,1,O);Rg(px2,py2,1,1,k%3?'#f8f048':'#ffffff')}cx=nx;cy=ny}
    g.globalAlpha=.5*(1-p/.6);g.fillStyle='#fffbd0';g.beginPath();g.arc(bx,by-4,12,0,6.283);g.fill();g.globalAlpha=1}}}
 for(const n of en){if(n.dead||!(n.frozen>0))continue;const big=n.type==='boss'||n.type==='bonelord'||n.big,w=big?30:16,hh=big?34:16,x0=Math.round(n.x-w/2),y0=Math.round(n.y+6-hh);
  g.globalAlpha=.55;Rg(x0,y0,w,hh,'#a8e0ff');g.globalAlpha=1;Rg(x0,y0,w,1,'#ffffff');Rg(x0,y0,1,hh,'#ffffff');Rg(x0+w-1,y0,1,hh,'#68b8e8');Rg(x0,y0+hh-1,w,1,'#68b8e8');Rg(x0+3,y0+3,2,1,'#ffffff')}}
const _dh29=drawHUD;drawHUD=function(){if(!menuOpen){const cx=camX(),cy=camY();g.save();g.setTransform(Z,0,0,Z,-cx*Z,-cy*Z);drawUlt(performance.now()/1000);g.restore()}if(ULTFX&&ULTFX.flash&&ULTFX.t<ULTFX.flash){g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(255,255,230,'+(.55*(1-ULTFX.t/ULTFX.flash))+')';g.fillRect(0,0,W,H);g.restore()}_dh29()};
