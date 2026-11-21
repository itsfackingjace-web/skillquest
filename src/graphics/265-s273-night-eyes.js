// ---- 273. Night eyes: monsters close to you glow in the dark (window.SQNIGHTEYES) ----
// Nov 21 (Stormie and Heather fell to "Ouch!" at night with nothing to see): at night a monster right next to you could be lost in the
// dark. Now any monster within a few steps shows two glowing eyes (and a faint glow around them) drawn over the darkness, brighter as
// it gets closer and as the night gets darker. They blink now and then. Daytime and lit places are unchanged.
(()=>{const R=72;// how close (world px) a monster has to be
 const EYEY={slime:-4,bat:-7,skel:-13,skeleton:-13,wolf:-8,bandit:-14,ghost:-10,spider:-4,crab:-4};
 const COL={slime:'190,255,120',bat:'255,90,90',skel:'255,70,60',skeleton:'255,70,60',wolf:'255,200,70',ghost:'150,220,255',spider:'255,90,200'};
 const SIDE=new Set(['wolf','bear','boar','fox']);// drawn side-on: the eyes sit at the head end, toward you
 const kind=n=>String(n.type||n.rk||'slime').split(':')[0];
 SQHUD.before('265 night eyes',()=>{if(window.SQNOEYES||menuOpen||typeof dark!=='function'||!Array.isArray(en))return;const dk=dark();if(dk<.15)return;
  const cx=camX(),cy=camY(),tm=performance.now()/1000;g.save();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';
  for(const n of en){if(!n||n.dead||!Number.isFinite(n.x)||!Number.isFinite(n.y))continue;const d=Math.hypot(n.x-P.x,n.y-P.y);if(d>R)continue;
   const k=kind(n),col=COL[k]||'255,230,110',a=Math.min(1,dk*1.4)*Math.min(1,(R-d)/28);if(a<=.02)continue;
   const blink=((tm*.37+n.x*.013)%3.2)<.12,side=SIDE.has(k)?Math.sign(P.x-n.x)*4:0;const sx=(n.x+side-cx)*Z,sy=(n.y+(EYEY[k]||-6)-cy)*Z,s=Math.max(1,Math.round(Z*.9)),gap=Math.round(1.6*Z);
   const gr=g.createRadialGradient(sx,sy,0,sx,sy,5*Z);gr.addColorStop(0,'rgba('+col+','+(.3*a)+')');gr.addColorStop(1,'rgba('+col+',0)');g.fillStyle=gr;g.fillRect(sx-5*Z,sy-5*Z,10*Z,10*Z);
   if(!blink){g.fillStyle='rgba('+col+','+a+')';g.fillRect(Math.round(sx-gap-s/2),Math.round(sy-s/2),s,s);g.fillRect(Math.round(sx+gap-s/2),Math.round(sy-s/2),s,s)}}
  g.restore()});
 window.SQNIGHTEYES={R}})();
