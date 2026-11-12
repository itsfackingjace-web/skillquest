// ---------------------------------------------------------------- 72. Other players' ultimates; PvP targeting
// Your wand ultimate (Inferno, Frost Nova, Thunderstorm) shows on other players' screens, with its sound.
// With PvP on, attacks aim at PvP players as well as monsters: wand spells and auto-shots lock on to them, and your
// ultimate hits PvP players in range for 2 hearts (Frost Nova also freezes them for a moment).
const PVU={list:[],frozen:0};window.SQPVU=PVU;
const pvFront=(maxAl,minAl,wide)=>{let best=null,bd=1e9;for(const r of MP.players.values()){if(!pvTarget(r))continue;const dx=r.x-P.x,dy=r.y-P.y,al=dx*face[0]+dy*face[1],pe=Math.abs(dx*face[1]-dy*face[0]);if(al>minAl&&al<maxAl&&pe<wide&&al<bd){bd=al;best=r}}return best?{best,bd}:null};
{const _wt=wandTarget;wandTarget=function(){const t=_wt();if(!PV.on)return t;const p=pvFront(160,4,16);if(!p)return t;if(!t)return p.best;const al=(t.x-P.x)*face[0]+(t.y-P.y)*face[1];return p.bd<al?p.best:t}}
{const _bt=bowTarget;bowTarget=function(){const t=_bt();if(!PV.on||!TL.bow||((inv.arrow|0)+(inv.iarrow|0))<1)return t;const p=pvFront(bowRange(),17,15);if(!p)return t;if(!t)return p.best;const al=(t.x-P.x)*face[0]+(t.y-P.y)*face[1];return p.bd<al?p.best:t}}
// casting: hit PvP players too, then tell everyone what it looked like
{const _cu=castUlt;castUlt=function(){const cd0=ULTCD,el=WAND;_cu();if(!(ULTCD>cd0)||!el)return;
  const R0={fire:70,ice:80,storm:120}[el];let hits=[];if(PV.on)hits=[...MP.players.values()].filter(r=>pvTarget(r)&&Math.hypot(r.x-P.x,r.y-P.y)<R0).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y)).slice(0,5);
  for(const r of hits){r.pvHitAt=0;pvHit(r,'ul',el)}
  if(el==='storm'&&ULTFX&&hits.length){ULTFX.bolts=(ULTFX.bolts||[]).concat(hits.map(r=>[r.x,r.y])).slice(0,8)}
  pvSend({k:'ul',el,b:(ULTFX&&ULTFX.bolts||[]).map(q=>[Math.round(q[0]),Math.round(q[1])]),x:Math.round(P.x),y:Math.round(P.y)})}}
// pvDmg: an ultimate does 2
{const _pd=pvDmg;pvDmg=function(kind,p){return kind==='ul'?2:_pd(kind,p)}}
// seeing theirs
{const _fx=pvFx;pvFx=function(u,v){if(v&&v.k==='ul'){if(!MP.user||u===MP.user.uid)return;const s=+v.s||0;if(PV.seen[u]&&s<=PV.seen[u])return;PV.seen[u]=s;if(typeof v.t==='number'&&mpNow()-v.t>2500)return;if(v.loc!==mpLoc())return;
   const r=MP.players.get(u),el=v.el;if(!r||!WSP[el])return;const x=isFinite(+v.x)?+v.x:r.x,y=isFinite(+v.y)?+v.y:r.y,AR=q=>Array.isArray(q)?q:(q&&typeof q==='object'?Object.keys(q).sort((a,b)=>a-b).map(k=>q[k]):[]);
   const bolts=AR(v.b).map(AR).filter(q=>isFinite(+q[0])&&isFinite(+q[1])).map(q=>[+q[0],+q[1]]).slice(0,8);
   PVU.list.push({el,t:0,life:el==='fire'?.7:el==='ice'?.8:.6,x,y,bolts:el==='storm'?(bolts.length?bolts:[[x+30,y]]):null,flash:el==='storm'&&Math.hypot(x-P.x,y-P.y)<200?.2:0});r.castAt=performance.now();r.castEl=el;
   if(el==='fire')for(let k=0;k<40;k++){const a=k/40*6.283;part(x+Math.cos(a)*10,y-4+Math.sin(a)*8,Math.cos(a)*120,Math.sin(a)*90-20,.6,k%3?'#f88830':'#f8e060',-30,2)}
   else if(el==='ice')for(let k=0;k<36;k++){const a=k/36*6.283;part(x,y-4,Math.cos(a)*140,Math.sin(a)*110,.7,k%2?'#c8f0ff':'#ffffff',0,2)}
   try{sfx(el==='fire'?'cfire':el==='ice'?'cice':'cstorm')}catch(e){}return}return _fx(u,v)}}
{const _u=upd;upd=function(dt){const fz=PVU.frozen>performance.now()&&!menuOpen&&!pnOpen&&!dead,px=P.x,py=P.y;_u(dt);if(fz){P.x=px;P.y=py}
  if(menuOpen||pnOpen)return;for(const u of PVU.list)u.t+=dt;PVU.list=PVU.list.filter(u=>u.t<u.life)}}
{const _dh=drawHUD;drawHUD=function(){if(!menuOpen&&PVU.list.length){const cx=camX(),cy=camY(),tm=performance.now()/1000,f0=ULTFX,px=P.x,py=P.y;
   g.save();g.setTransform(Z,0,0,Z,-cx*Z,-cy*Z);try{for(const u of PVU.list){ULTFX=u;P.x=u.x;P.y=u.y;drawUlt(tm)}}finally{ULTFX=f0;P.x=px;P.y=py;g.restore()}
   for(const u of PVU.list)if(u.flash&&u.t<u.flash){g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(255,255,230,'+(.45*(1-u.t/u.flash))+')';g.fillRect(0,0,W,H);g.restore()}}
  _dh()}}
// a Frost Nova from a PvP player freezes you for a moment
{const _in=pvIncoming;pvIncoming=function(id,v){const h0=P.hp,hu=hurt;_in(id,v);if(v&&v.k==='ul'&&v.el==='ice'&&(P.hp<h0||hurt>hu)&&PV.on){PVU.frozen=performance.now()+1500;say('Frozen by '+String(v.n||'someone').slice(0,12)+'!')}}}
