// ---------------------------------------------------------------- 74. Two more Firemaking perks (a third choice at 20 and 40)
// Level 20, Lone Bonfire: your campfires burn for 30 minutes, but only one can be lit at a time (a new one puts the
// old one out, on any island). Level 40, Hearthkeeper: while you stand near a campfire, your FOOD doesn't drain.
{TREES[5].choices[20].push({id:'fi_lone',n:'Lone Bonfire',d:'Your campfires burn for 30 minutes, but only one can be lit at a time: building a new one puts out the old one.'});
 TREES[5].choices[40].push({id:'fi_hearth',n:'Hearthkeeper',d:'While you stand near a campfire, your FOOD doesn\'t drain.'});
 const LONE=30*60;
 const _f=fire;fire=function(){const mine=fires.filter(f=>!f._rp),n0=fires.length;_f();if(fires.length<=n0||!perk(5,'fi_lone'))return;const nf=fires[fires.length-1];
  nf.life=LONE;nf.mx=LONE;let out=0;for(const f of mine){const j=fires.indexOf(f);if(j>=0){fires.splice(j,1);out++}}
  const st=window.FIRESTASH;if(st)for(const k in st)if(Array.isArray(st[k])){const b=st[k].length;st[k]=st[k].filter(f=>f._rp);out+=b-st[k].length}
  if(out)say('Your old campfire goes out. The new one will burn for 30 minutes.');saveLocal(true)};
 const _u=upd;upd=function(dt){const h0=hunger;_u(dt);if(!dead&&hunger<h0&&perk(5,'fi_hearth')&&nearFire(P.x,P.y,50))hunger=h0;
  // campfires on other islands burn down too (the Hollow loop doesn't run there)
  const R=SCENE&&SCENE.room;if(R&&R.region&&!menuOpen&&!pnOpen){for(const f of fires)if(!f._rp)f.life-=dt;fires=fires.filter(f=>f._rp||f.life>0)}}
 // Level 30, Flame Aura: you glow and light up everything around you at night and in Hollow's dark caves
 // (light only: it doesn't keep monsters away, heal you, or stop hunger)
 TREES[5].choices[30].push({id:'fi_aura',n:'Flame Aura',d:'You glow with firelight: at night and in dark caves you light up everything around you, and other players see it too. Light only: no healing, warmth or monster repelling.'});
 // (it used to need one of your campfires burning somewhere, which made it look broken most of the time)
 window.SQAURA=()=>{try{return perk(5,'fi_aura')}catch(e){return false}};
 window.SQAURALIT=()=>{try{return!dead&&perk(5,'fi_aura')?150:0}catch(e){return 0}};
 const myFire=()=>{if(fires.some(f=>!f._rp&&f.life>0))return true;const st=window.FIRESTASH;if(st)for(const k in st)if(Array.isArray(st[k])&&st[k].some(f=>!f._rp&&f.life>0))return true;return false};
 const _dh=drawHUD;drawHUD=function(){try{const indoors=SCENE&&!(SCENE.room&&(SCENE.room.region||SCENE.room.cave));const dk=indoors?0:dark();
   if(dk>.05&&!dead&&perk(5,'fi_aura')){const cx=camX(),cy=camY(),sx=(P.x-cx)*Z,sy=(P.y-4-cy)*Z,r=120*Z,fl=1+Math.sin(performance.now()/180)*.03;
    g.save();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(sx,sy,0,sx,sy,r*fl);gr.addColorStop(0,'rgba(255,215,150,'+(.22*dk)+')');gr.addColorStop(.55,'rgba(255,180,90,'+(.1*dk)+')');gr.addColorStop(1,'rgba(255,160,60,0)');
    g.fillStyle=gr;g.fillRect(sx-r*1.1,sy-r*1.1,r*2.2,r*2.2);g.restore()}}catch(e){}_dh()}}
// the leaderboards take the controller / keyboard while they're open (title screen)
{const _n=navRoot;navRoot=function(){const lb=document.getElementById('sqlb');if(lb&&lb.style.display==='flex')return lb;return _n()}}
// a LOOT button when you stand at a grave (phones had no button to press)
{let on=false;const _u=upd;upd=function(dt){_u(dt);const n=window.SQGRVNEAR&&SQGRVNEAR()&&!(typeof nearNpc==='function'&&nearNpc());
  if(n){tk.style.display='flex';if(!tk.innerHTML.startsWith('LOOT'))tk.innerHTML='LOOT'+(isPC?'<small>T</small>':'');on=true}
  else if(on){on=false;if(tk.innerHTML.startsWith('LOOT')){tk.innerHTML='TALK'+(isPC?'<small>T</small>':'');tk.style.display='none';if(typeof tkLab!=='undefined')tkLab=''}}}}
