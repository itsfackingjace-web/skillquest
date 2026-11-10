// ---------------------------------------------------------------- 115. The Stone Sledgehammer smashes ore
// - With the sledgehammer in your main hand, one hit breaks any small rock or ore (rock, iron, gold, mithril, adamant
//   veins) as long as you could mine it (Mining level and pickaxe tier still count).
// - GROUND SLAM also breaks every rock, ore vein, boulder and ore boulder in its radius that you could mine, with the
//   usual loot and XP. It goes through the game's own mining (as if you hit each one), so perks, quests and
//   multiplayer resource sync all work as normal.
// - Other players see your GROUND SLAM: its shockwave ring, dust and sound, sent as an fx event (k:'sl').
(()=>{const SLAM=window.SQSLAM;if(!SLAM||typeof castUlt!=='function'){console.warn('sledgehammer: slam not found');return}
 const TIER=window.SQTIER||{},BOUL=window.SQBOUL||{};
 const small=t=>!!t&&SKOF[t]===2&&!BOUL[t];
 const sledge=()=>!!(window.SQSLEDGE&&SQSLEDGE());
 // what's on a tile: {o} a world/island/dungeon object, or {cave} a cave boulder item
 function objAt(tx,ty){const R=SCENE&&SCENE.room;
  if(!SCENE){if(tx<0||ty<0||tx>=N||ty>=N)return null;const o=obj[ty*N+tx];return o?{o}:null}
  if(!R)return null;
  if(R.region){const it=rgObjAt(R,tx,ty);return it&&!it.gone&&it.o?{o:it.o}:null}
  const it=(R.items||[]).find(q=>q.x===tx&&q.y===ty&&!q.gone&&(q.t==='_obj'||q.t==='boulder'));if(!it)return null;return it.t==='boulder'?{cave:it}:it.o?{o:it.o}:null}
 const typeOf=t=>t.cave?(t.cave.ore||'boulder'):t.o.t;
 const canMine=typ=>{if(BOUL[typ])return lvOf(2)>=BOUL[typ].lv;const T=TIER[typ];return lvOf(2)>=(T?T.lv:1)&&(TL.pick|0)>=(T?T.pick:1)};
 const setHp=(t,v)=>{if(t.cave)t.cave.hp=v;else t.o.hp=v};
 const getHp=t=>t.cave?t.cave.hp:t.o.hp;
 // one hit breaks small ores
 const _a=attack;attack=function(){if(!sledge()||dead||menuOpen||pnOpen||BUILD||swing>0)return _a.apply(this,arguments);
  let t=null;try{const[tx,ty]=frontObjTile();t=objAt(tx,ty)}catch(e){}
  if(!t||!t.o||!small(t.o.t))return _a.apply(this,arguments);
  const h=t.o.hp;t.o.hp=1;try{return _a.apply(this,arguments)}finally{if(t.o.hp===1)t.o.hp=h}};
 // while the slam breaks ores, the hits it makes for you aren't sent as sword swings
 function smash(tx,ty){const t=objAt(tx,ty);if(!t)return false;const typ=typeOf(t);if(!small(typ)&&!BOUL[typ])return false;if(!canMine(typ))return false;
  const K={x:P.x,y:P.y,f:face,sw:swing},h=getHp(t);setHp(t,1);
  P.x=tx*16+8;P.y=ty*16+8-13;face=[0,1];swing=0;window.SQPVQUIET=true;
  try{attack()}catch(e){console.warn(e)}finally{window.SQPVQUIET=false;P.x=K.x;P.y=K.y;face=K.f;swing=K.sw}
  const now=objAt(tx,ty);if(now&&(now.o===t.o&&now.cave===t.cave)&&getHp(now)===1){setHp(now,h);return false}return true}
 const _cu=castUlt;castUlt=function(){const t0=SLAM.t,c0=SLAM.cd;const out=_cu.apply(this,arguments);
  if(!sledge()||!(SLAM.t>t0)||!(SLAM.cd>c0))return out;// the slam didn't happen
  let n=0;try{const cx=P.x,cy=P.y+4,R=SLAM.R,tx0=Math.floor((cx-R)/16),tx1=Math.floor((cx+R)/16),ty0=Math.floor((cy-R)/16),ty1=Math.floor((cy+R)/16);
   for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){if(Math.hypot(tx*16+8-cx,ty*16+8-cy)>R)continue;if(smash(tx,ty))n++}}catch(e){console.warn(e)}
  if(n){try{say('GROUND SLAM! '+n+' rock'+(n>1?'s':'')+' and ore'+(n>1?'s':'')+' smashed.')}catch(e){}}
  try{if(window.SQPVSEND)SQPVSEND({k:'sl',x:Math.round(P.x),y:Math.round(P.y+4)})}catch(e){}
  return out};
 // ---- other players' slams ----
 function slamFx(x,y){for(let k=0;k<40;k++){const an=k/40*6.283,sp=80+Math.random()*70;part(x,y,Math.cos(an)*sp,Math.sin(an)*sp*.6-20,.5+Math.random()*.2,k%3?'#9a8a78':'#c8b8a0',120,2)}
  try{sfx('mine');setTimeout(()=>sfx('mine'),70)}catch(e){}}
 (window.SQFXH=window.SQFXH||{}).sl=(r,v)=>{const x=+v.x,y=+v.y;if(!isFinite(x)||!isFinite(y))return;r.slam=r.lastSlam={x,y,at:performance.now()};slamFx(x,y)};
 (window.SQPEERFX=window.SQPEERFX||[]).push(r=>{const S=r&&r.slam;if(!S)return;const p=(performance.now()-S.at)/550;if(p>=1){r.slam=null;return}const rr=SLAM.R*Math.min(1,p*1.6);
   g.strokeStyle='rgba(232,208,160,'+(.75*(1-p))+')';g.lineWidth=3;g.beginPath();g.ellipse(S.x,S.y,rr,rr*.6,0,0,6.283);g.stroke();
   g.strokeStyle='rgba(90,70,50,'+(.5*(1-p))+')';g.lineWidth=1.5;g.beginPath();g.ellipse(S.x,S.y,rr*.7,rr*.42,0,0,6.283);g.stroke();
   for(let k=0;k<8;k++){const an=k/8*6.283+.3;Rg(S.x+Math.cos(an)*rr*.5,S.y+Math.sin(an)*rr*.3,2,1,'#3a2a1a')}});
 window.SQSLAMORE={objAt,smash}})();
