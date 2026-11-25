// ---- 288. Other players see you chop and mine (Nov 24, Jace: "players cant actually see other players chopping trees") ----
// 122 keeps a tool swing from being sent as a sword swing (SQPVQUIET), and nothing was sent instead, so others saw you stand still.
// Now the start of every chop or mine (the action 122/287 set up for this HIT, with its final swing time) goes out as one small
// fx event {k:'tl', m:'c'|'m', d:[face], i:<tool item>, u:<seconds>, sd:<strike seconds>}; the others draw that tool (its sprite through
// 123, or the game's own drawn tool) in the player's hands for the swing, the same strike and hold as yours, and hear it when close.
// One event a chop, like a sword swing, through the same fx/<uid> record 064 already sends (no new listener).
(()=>{
 const tier=k=>(EQ[k]&&EQ[k].tier)|0;
 // ---- sending: after everything else on HIT (287 sets a chop's real time) ----
 SQHIT.wrap('288 others see your tool swings',next=>function(){const s0=swing;const out=next.apply(this,arguments);
  try{const a=typeof ACTN!=='undefined'&&ACTN;if(s0<=0&&swing>0&&a&&a.t<.05&&(a.type==='chop'||a.type==='mine')&&window.SQPVSEND){const ch=a.type==='chop';
    SQPVSEND({k:'tl',m:ch?'c':'m',d:[Math.sign(a.face[0])|0,Math.sign(a.face[1])|0],i:String(occ(ch?'axe':'pick')||'').slice(0,40),u:Math.round(Math.min(3,a.dur||swing)*100)/100,sd:Math.round(Math.min(1,a.sd||a.dur||.32)*100)/100})}}
  catch(e){self.SQERR&&SQERR(e,'288-1')}return out});
 // ---- receiving ----
 const num=(v,lo,hi,d)=>{v=+v;return isFinite(v)?Math.max(lo,Math.min(hi,v)):d};
 (window.SQFXH=window.SQFXH||{}).tl=(r,v)=>{if(!r)return;const d=Array.isArray(v.d)?v.d:[1,0],type=v.m==='m'?'mine':'chop',k=typeof v.i==='string'&&EQ[v.i]?v.i:'';
  r.tool={type,face:[Math.sign(+d[0]||0),Math.sign(+d[1]||0)],key:k,at:performance.now(),dur:num(v.u,.1,3,.5),sd:num(v.sd,.05,1,.32)};
  if(!r.tool.face[0]&&!r.tool.face[1])r.tool.face=[0,1];
  try{if(Math.hypot((+r.x||0)-P.x,(+r.y||0)-P.y)<160)sfx(type==='chop'?'chop':'mine')}catch(e){self.SQERR&&SQERR(e,'288-2')}};
 // ---- drawing it in their hands ----
 (window.SQPEERFX=window.SQPEERFX||[]).push((r,tm)=>{const T=r&&r.tool;if(!T)return;const t=(performance.now()-T.at)/1000;if(t>=T.dur){r.tool=null;return}
  const a={type:T.type,t,sd:T.sd,dur:T.dur,face:T.face},f=T.face,hx=Math.round(r.x)+f[0]*3,hy=Math.round(r.y)-6+f[1]*2,I=window.SQISW;
  const s=I&&T.key&&I.use(T.key)?I.srcFor(T.key):null;
  if(s){I.put(g,s,'diag',I.toolAng(a),hx,hy,f[0]<0);return}
  // the game's own drawn tool (028), same angles as drawAct
  const p=Math.min(1,t/T.sd),a0=Math.atan2(f[1],f[0]),sg=f[0]<0?1:-1,ch=T.type==='chop',st=a0+sg*(ch?1.9:2.7),en2=a0-sg*(ch?.25:.1),e=p<.6?Math.pow(p/.6,2):1;
  if(typeof drawToolLine==='function')drawToolLine(ch?'axe':'pick',st+(en2-st)*e,hx,hy,tier(T.key)||3,f[0]<0?-1:1)});
 window.SQPEERTOOL={tier};
})();
