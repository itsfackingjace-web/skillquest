// ---- 187. Pet powers from the Dev Suite (Dev Suite > Pet powers) ----
// Library petab.<pet kind> = {own, at, ag, dmg, gr, cd, rng, fx, col, heal, fetch, ex, xp, gold, guard}:
//   own   1 = keep the pet's own ability (treeling logs, mushling, glowcap, squirrel/golem fetching, the imp's dagger),
//         0 = turn it off (window.SQPETOFF(kind), asked by 085, 098 and 116)
//   at    fighting: '' (doesn't fight) | melee (dashes at it) | ranged (arrows) | magic (homing orbs) | aoe (a burst around it)
//   ag    when it fights: hurt (something hurt you) | near (any monster near you) | yours (what you're fighting)
//   dmg   damage per hit; gr 1 = +1 per 25 levels of Attack (melee) / Archery (ranged) / Magic (magic, aoe); cd seconds
//         between attacks; rng reach (melee), range (ranged, magic) or burst radius (aoe) in px; col its colour
//   fx    on the monster: {slow, burn, poison, freeze: [chance %, seconds]} (the game's own n.slow/burn/poison/frozen)
//   heal  {h hearts, e every s} while you're hurt; fetch {k item, n, e every s}; ex {s skill index (-1 = any gathering), c %}
//         = a chance of +1 of what you just gathered (items arriving in a frame with that skill's XP, like 120)
//   xp    % more XP (outermost addXp); gold % more kill gold (outermost killEnemy); guard % chance to stop a hit
// The pet attacks from where it's drawn (093's PST 'me', the imp's own state); a melee pet dashes next to the monster and
// 093's petFollow walks it back. Pets can't be hurt (the imp keeps its own health). Other players see the attacks: fx
// event 'pa' {s,x,y,tx,ty,c,r} through SQPVSEND / SQFXH (looks only). Item descriptions (pet_<kind>) list the powers.
(()=>{if(!window.SQA||!window.LUX)return;const A=SQA;
 const STY=['','melee','ranged','magic','aoe'],AG=['hurt','near','yours'],FXK=['slow','burn','poison','freeze'];
 const DEFR={melee:40,ranged:140,magic:120,aoe:48},DEFC={melee:'#f8f0d0',ranged:'#c8a060',magic:'#a070f0',aoe:'#f87830'};
 const num=(v,a,b,d)=>{v=Number(v);return isFinite(v)?Math.max(a,Math.min(b,v)):d};
 const hex=v=>{v=String(v||'').trim().toLowerCase().replace(/^#?/,'#');return/^#[0-9a-f]{6}$/.test(v)?v:null};
 function clean(o){if(!o||typeof o!=='object')return null;const at=STY.includes(o.at)?o.at:'';const r={own:o.own===0?0:1};
  if(at){r.at=at;r.ag=AG.includes(o.ag)?o.ag:'hurt';r.dmg=Math.round(num(o.dmg,1,50,2));r.gr=o.gr===0?0:1;r.cd=Math.round(num(o.cd,.3,10,1.2)*10)/10;
   r.rng=Math.round(num(o.rng,16,200,DEFR[at]));r.col=hex(o.col)||DEFC[at];const fx={};for(const f of FXK){const e=o.fx&&o.fx[f];if(Array.isArray(e)){const c=Math.round(num(e[0],0,100,0)),t=num(e[1],.5,30,3);if(c>0)fx[f]=[c,t]}}if(Object.keys(fx).length)r.fx=fx}
  if(o.heal&&+o.heal.h>0)r.heal={h:Math.round(num(o.heal.h,1,6,1)),e:Math.round(num(o.heal.e,5,600,45))};
  if(o.fetch&&o.fetch.k&&typeof o.fetch.k==='string')r.fetch={k:o.fetch.k.slice(0,40),n:Math.round(num(o.fetch.n,1,99,1)),e:Math.round(num(o.fetch.e,10,3600,120))};
  if(o.ex&&+o.ex.c>0)r.ex={s:Math.round(num(o.ex.s,-1,40,-1)),c:Math.round(num(o.ex.c,1,100,10))};
  for(const[k,mx]of[['xp',100],['gold',200],['guard',50]]){const v=Math.round(num(o[k],0,mx,0));if(v)r[k]=v}
  return Object.keys(r).length>1||r.own===0?r:null}
 let RU={};const rule=()=>{const k=LUX.COS&&LUX.COS.pet;return k&&RU[k]||null};
 window.SQPETOFF=k=>!!(RU[k]&&RU[k].own===0);
 const SKI=n=>SKN.indexOf(n),GATHER=()=>['Woodcutting','Mining','Foraging','Fishing','Farming'].map(SKI).filter(i=>i>=0);
 const growSk=at=>at==='melee'?0:at==='ranged'?SKI('Archery'):SKI('Magic');
 const dmgOf=r=>r.dmg+(r.gr&&growSk(r.at)>=0?Math.floor(lvOf(growSk(r.at))/25):0);
 // ---- item descriptions ----
 const D0={};
 function describe(k,r){if(!r)return'';const t=[];if(r.at){const w={melee:'dashes in and bites',ranged:'shoots arrows',magic:'casts homing magic',aoe:'bursts, hitting everything around it'}[r.at],
   when={hurt:'when something hurts you',near:'at monsters near you',yours:'at what you\'re fighting'}[r.ag];t.push('Fights '+when+': it '+w+' for '+r.dmg+(r.gr?'+':'')+' damage');
   const fx=Object.entries(r.fx||{}).map(([f,[c]])=>c+'% '+({slow:'slow',burn:'burn',poison:'poison',freeze:'freeze'}[f]));if(fx.length)t.push('Its hits can '+fx.join(', '))}
  if(r.heal)t.push('Heals you '+r.heal.h+' heart'+(r.heal.h>1?'s':'')+' every '+r.heal.e+' s when you\'re hurt');if(r.fetch&&INAME[r.fetch.k])t.push('Brings you '+r.fetch.n+' '+INAME[r.fetch.k].toLowerCase()+' every '+r.fetch.e+' s');
  if(r.ex)t.push(r.ex.c+'% chance of an extra '+(r.ex.s<0?'item when you gather':(SKN[r.ex.s]||'').toLowerCase()+' item'));if(r.xp)t.push(r.xp+'% more XP');if(r.gold)t.push(r.gold+'% more gold from monsters');if(r.guard)t.push(r.guard+'% chance to stop a hit');
  return t.length?' Powers: '+t.join('. ')+'.':''}
 A.onApply(lib=>{const L=(lib&&lib.petab)||{};RU={};for(const k in L){if(!/^[a-z0-9_]{1,30}$/.test(k))continue;const r=clean(L[k]);if(r)RU[k]=r}
  for(const p of LUX.PETS||[]){const ik='pet_'+p.k;if(!(ik in IDESC))continue;if(!(ik in D0))D0[ik]=IDESC[ik];IDESC[ik]=D0[ik]+describe(p.k,RU[p.k])}});
 // ---- where the pet is ----
 function petPos(k){try{if(k==='imp'){const I=window.SQIMP&&SQIMP.state;if(I&&I.seen&&!(I.dead>0))return{x:I.x,y:I.y,s:I}}
   const s=typeof PST!=='undefined'&&PST.get('me');if(s&&performance.now()-(s.lt||0)<400)return{x:s.x,y:s.y,s}}catch(e){}return{x:P.x-12,y:P.y+4,s:null}}
 const pop=(x,y,t,c)=>{try{gTxt(x,y-18,t,c||'#f8d048')}catch(e){}};
 // ---- fighting ----
 const SH=[],FX=[];let TGT=null,cdT=0,hT=0,fT=null,fK=null;const HP=new WeakMap();
 const alive=n=>n&&!n.dead&&n.hp>0&&!n._pet;
 const mobs=()=>{const L=en.filter(alive);try{const W=window.SQWB;if(W&&W.ent&&alive(W.ent)&&!L.includes(W.ent))L.push(W.ent)}catch(e){}return L};
 function nearest(x,y,r){let b=null,bd=r;for(const n of mobs()){const d=Math.hypot(n.x-x,n.y-y)-(n.big?16:0);if(d<bd){bd=d;b=n}}return b}
 function hitMob(n,r,d){if(!alive(n))return;n.hp-=d;n._pethit=1;HP.set(n,n.hp);const big=n.type==='boss'||n.big;try{DMGS.push({x:n.x,y:n.y-(big?30:14),v:String(d),t:0,c:r.col,sc:curScene()})}catch(e){}
  for(const f in r.fx||{}){const[c,t]=r.fx[f];if(Math.random()*100>=c)continue;if(f==='freeze')n.frozen=Math.max(n.frozen||0,t);else n[f]=Math.max(n[f]||0,t)}
  for(let k=0;k<5;k++)try{part(n.x,n.y-6,(Math.random()-.5)*70,-Math.random()*60,.35,k%2?r.col:'#ffffff',120)}catch(e){}try{sfx('hit')}catch(e){}if(n.hp<=0&&!n._wb)try{killEnemy(n,'pet')}catch(e){}}
 const send=e=>{try{if(window.SQPVSEND)SQPVSEND({k:'pa',...e})}catch(x){}};
 function strike(r,p,t){const d=dmgOf(r),R2=Math.round;
  if(r.at==='melee'){if(p.s&&p.s!==(window.SQIMP&&SQIMP.state)){const fx=p.x,fy=p.y;p.s.x=t.x+(p.x<t.x?-9:9)*(t.big?2:1);p.s.y=t.y+2;p.s.fl=t.x<p.s.x;for(let k=0;k<6;k++)try{part(fx+(p.s.x-fx)*k/6,fy-4+(p.s.y-fy)*k/6,0,-10,.25,r.col,0,1)}catch(e){}}
   FX.push({s:'slash',x:t.x,y:t.y-6,t:.22,T:.22,c:r.col,f:p.x>t.x});hitMob(t,r,d);send({s:'melee',x:R2(p.x),y:R2(p.y),tx:R2(t.x),ty:R2(t.y),c:r.col})}
  else if(r.at==='aoe'){FX.push({s:'ring',x:p.x,y:p.y,t:.45,T:.45,c:r.col,r:r.rng});for(const n of mobs())if(Math.hypot(n.x-p.x,(n.y-p.y)*1.3)<r.rng+(n.big?16:0))hitMob(n,r,d);try{sfx('swish')}catch(e){}send({s:'aoe',x:R2(p.x),y:R2(p.y),r:r.rng,c:r.col})}
  else{SH.push({x:p.x,y:p.y-6,n:t,v:r.at==='magic'?150:230,s:r.at,c:r.col,life:2.5,r,d});try{sfx('swish')}catch(e){}send({s:r.at,x:R2(p.x),y:R2(p.y-6),tx:R2(t.x),ty:R2(t.y-6),c:r.col})}}
 // the extra-item power: items that arrive in a frame where a gathering skill got XP
 const XPF=new Set();let INV0=null;
 {const _ax=addXp;addXp=function(i,x){const r=rule();if(r&&r.xp&&x>0)x=Math.round(x*(1+r.xp/100));XPF.add(i);return _ax.call(this,i,x)}}
 {const _ke=killEnemy;killEnemy=function(){const r=rule(),g0=GLD,out=_ke.apply(this,arguments);try{if(r&&r.gold&&GLD>g0){GLD+=Math.round((GLD-g0)*r.gold/100);try{svg()}catch(e){}}}catch(e){}return out}}
 {const _u=upd;upd=function(dt){const hp0=P.hp,out=_u.apply(this,arguments);try{tick(dt,hp0)}catch(e){console.warn('pet powers',e)}return out}}
 function tick(dt,hp0){const k=LUX.COS&&LUX.COS.pet,r=k&&RU[k];
  for(let i=FX.length-1;i>=0;i--)if((FX[i].t-=dt)<=0)FX.splice(i,1);
  const paused=dead||menuOpen||pnOpen||(typeof SAILING!=='undefined'&&SAILING);
  if(!paused)for(let i=SH.length-1;i>=0;i--){const s=SH[i];s.life-=dt;const n=s.n;if(!n||!alive(n)&&!s.free||s.life<=0){SH.splice(i,1);continue}
   const tx=s.free?s.tx:n.x,ty=s.free?s.ty:n.y-6,dx=tx-s.x,dy=ty-s.y,d=Math.hypot(dx,dy)||1;s.a=Math.atan2(dy,dx);if(d<6||d<s.v*dt){if(!s.free)hitMob(n,s.r,s.d);SH.splice(i,1);continue}s.x+=dx/d*s.v*dt;s.y+=dy/d*s.v*dt;
   if(s.s==='magic'&&Math.random()<dt*20)try{part(s.x,s.y,(Math.random()-.5)*10,(Math.random()-.5)*10,.3,s.c,0,1)}catch(e){}}
  const inv1={};if(r&&r.ex){for(const q in inv)inv1[q]=inv[q]|0}
  if(!r||paused){INV0=r&&r.ex?inv1:null;XPF.clear();return}
  // guard: stop a hit
  if(r.guard&&P.hp<hp0&&!dead&&Math.random()*100<r.guard){P.hp=hp0;const p=petPos(k);pop(p.x,p.y,'Blocked!','#c8f0ff');FX.push({s:'ring',x:P.x,y:P.y,t:.3,T:.3,c:'#c8f0ff',r:14})}
  // heal
  if(r.heal){if(P.hp<6){hT-=dt;if(hT<=0){hT=r.heal.e;P.hp=Math.min(6,P.hp+r.heal.h);const p=petPos(k);pop(p.x,p.y,'+'+r.heal.h+' heart'+(r.heal.h>1?'s':''),'#f86868');for(let q=0;q<10;q++)try{part(P.x,P.y-6,(Math.random()-.5)*40,-20-Math.random()*30,.6,q%2?'#f8b0b0':'#fff0f0',30,1)}catch(e){}try{sfx('eat')}catch(e){}}}else hT=Math.min(hT,r.heal.e*.5)}
  // fetch
  if(r.fetch&&INAME[r.fetch.k]){if(fK!==k){fK=k;fT=r.fetch.e*.6}fT-=dt;if(fT<=0){fT=r.fetch.e*(.85+Math.random()*.3);const it=r.fetch.k,n=r.fetch.n;inv[it]=(inv[it]|0)+n;const p=petPos(k),nm=(n>1?(SN[it]||INAME[it]):INAME[it]).toLowerCase();
    say('Your '+((LUX.PETS.find(q=>q.k===k)||{}).n||'pet').toLowerCase()+' brings you '+n+' '+nm+'!');pop(p.x,p.y,'+'+n+' '+nm);try{sfx('pickup')}catch(e){}try{saveLocal()}catch(e){}inv1[it]=inv[it]|0}}
  // extra items while gathering
  if(r.ex&&INV0){const sk=r.ex.s<0?GATHER():[r.ex.s];if(sk.some(i=>XPF.has(i)))for(const q in inv1){if(inv1[q]>(INV0[q]|0)&&INAME[q]&&!/^pet_|^eq_/.test(q)){if(Math.random()*100<r.ex.c){inv[q]=(inv[q]|0)+1;inv1[q]++;const p=petPos(k);pop(p.x,p.y,'+1 '+INAME[q].toLowerCase(),'#7cd060');try{sfx('rustle')}catch(e){}}break}}}
  INV0=r.ex?inv1:null;XPF.clear();
  // fighting
  if(!r.at)return;const p=petPos(k);
  for(const n of mobs()){const h=HP.get(n);if(h!=null&&n.hp<h&&!n._pethit&&r.ag==='yours')TGT=n;n._pethit=0;HP.set(n,n.hp)}
  if(TGT&&(!alive(TGT)||Math.hypot(TGT.x-P.x,TGT.y-P.y)>200))TGT=null;
  if(r.ag==='hurt'&&P.hp<hp0)TGT=nearest(P.x,P.y,70)||TGT;
  if(r.ag==='near'&&!TGT)TGT=nearest(P.x,P.y,r.at==='melee'?90:Math.max(80,r.rng));
  cdT-=dt;if(cdT>0||!TGT)return;
  const reach=r.at==='aoe'?r.rng+(TGT.big?16:0):r.rng+(TGT.big?20:0);if(Math.hypot(TGT.x-p.x,TGT.y-p.y)>reach)return;cdT=r.cd;strike(r,p,TGT)}
 // ---- drawing ----
 function drawFx(){for(const s of SH){const x=Math.round(s.x),y=Math.round(s.y),a=s.a||0;
   if(s.s==='ranged'){const cx=Math.cos(a),cy=Math.sin(a);for(let i=0;i<7;i++)Rg(Math.round(x-cx*i),Math.round(y-cy*i),1,1,i<2?'#e8e8f0':i>4?'#f8f0e0':s.c)}
   else{g.save();g.globalAlpha=.35;g.fillStyle=s.c;g.beginPath();g.arc(x,y,5,0,6.283);g.fill();g.restore();Rg(x-2,y-2,4,4,s.c);Rg(x-1,y-1,2,2,'#ffffff')}}
  for(const f of FX){const p=1-f.t/f.T;g.save();g.strokeStyle=f.c;g.globalAlpha=Math.max(0,1-p);
   if(f.s==='ring'){g.lineWidth=2;g.beginPath();g.ellipse(f.x,f.y,Math.max(1,f.r*(.3+.7*p)),Math.max(1,f.r*(.3+.7*p)/1.3),0,0,6.283);g.stroke();g.globalAlpha*=.25;g.fillStyle=f.c;g.fill()}
   else{g.lineWidth=2;g.beginPath();const a0=f.f?0:Math.PI;g.arc(f.x,f.y,9,a0-1.1,a0-1.1+2.2*Math.min(1,p*2),false);g.stroke()}g.restore()}}
 {const _p=pP;pP=function(tm){const out=_p.apply(this,arguments);try{if(SH.length||FX.length)drawFx()}catch(e){}return out}}
 // other players' pets
 window.SQFXH=window.SQFXH||{};SQFXH.pa=(pl,v)=>{const c=hex(v.c)||'#ffffff',x=+v.x||0,y=+v.y||0;if(v.s==='aoe')FX.push({s:'ring',x,y,t:.45,T:.45,c,r:num(v.r,16,200,48)});
  else if(v.s==='melee')FX.push({s:'slash',x:+v.tx||x,y:(+v.ty||y)-6,t:.22,T:.22,c,f:x>(+v.tx||x)});
  else if(v.s==='ranged'||v.s==='magic')SH.push({x,y,tx:+v.tx||x,ty:+v.ty||y,n:{},free:1,v:v.s==='magic'?150:230,s:v.s,c,life:2})};
 window.SQPETPOW={clean,describe,dmgOf,get rules(){return RU},STY,AG,FXK,DEFR,DEFC,get target(){return TGT},shots:SH};
 // ======================= Dev Suite > Pet powers =======================
 if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,E,dset,toast,fail,arm}=API;
 const T={sel:null,w:null,dirty:false,q:''};
 const sec=()=>S.draft.petab||(S.draft.petab={});
 const petName=k=>((LUX.PETS||[]).find(p=>p.k===k)||{}).n||k;
 function own(k){const TR=window.SQPETAB&&SQPETAB.TREEL,F=window.SQFETCH,src=window.SQNPET&&SQNPET[k]&&SQNPET[k].src;
  if(k==='imp')return['🗡','Fights: when something hurts you it runs at it and stabs with a poison dagger (1 damage + 1 per 25 Attack levels, poison for 4 s). Monsters can beat it; it comes back after a minute.'];
  if(TR&&TR[k])return['🪵','When you chop trees it can shake loose an extra log ('+Math.round(TR[k].ch*100)+'%, twice as often on its own kind of tree).'];
  if(F&&F[k])return['🎁','Brings you things about every '+F[k].every+' s: '+(k==='psquir'?'berries, nuts, mushrooms, cactus fruit, a little gold or a healing potion.':(INAME[F[k].ore]||'ore').toLowerCase()+'.')];
  if(k==='pmush')return['💗','Heals you 1 heart every 45-65 s when you\'re hurt; otherwise brings you mushrooms now and then.'];
  if(k==='pglow')return['✨','When something hits you, 45% chance to burst into spores that slow every monster near you (once every 6 s). Glows in the dark.'];
  return['','No ability of its own: it just follows you'+(src?' (found from '+src+')':'')+'.']}
 const badges=k=>{const r=(S.draft.petab||{})[k]&&clean(S.draft.petab[k]),o=own(k)[0],b=[];if(o&&!(r&&r.own===0))b.push(o);if(r){if(r.at)b.push({melee:'⚔',ranged:'🏹',magic:'🔮',aoe:'💥'}[r.at]);if(r.heal)b.push('💗');if(r.fetch)b.push('🎁');if(r.ex)b.push('🍀');if(r.xp)b.push('📘');if(r.gold)b.push('🪙');if(r.guard)b.push('🛡')}return b.join('')};
 const fld=(l,h)=>'<label class="dv-gf"><span>'+l+'</span><span>'+h+'</span></label>';
 const n_=(f,v,a,b,st,w)=>'<input type="number" data-pw="'+f+'" value="'+v+'" min="'+a+'" max="'+b+'"'+(st?' step="'+st+'"':'')+' style="width:'+(w||70)+'px">';
 const items=()=>{const o=new Map();for(const k of INVK)if(INAME[k]&&!/^pet_|^eq_/.test(k))o.set(k,INAME[k]);const ci=(S.draft.content||{}).items||{};for(const k in ci)if(!o.has(k))o.set(k,(ci[k].n||k)+' (draft)');return[...o].sort((a,b)=>a[1].localeCompare(b[1]))};
 function render(){const L=sec(),P2=(LUX.PETS||[]).slice(),q=T.q.toLowerCase();
  let h='<div class="dv-card"><b>Pet powers</b><p class="dv-mut">What every pet does. Keep or turn off its own ability, and give it more: fighting (melee, ranged, magic or a burst), healing, bringing items, extra loot when you gather, more XP or gold, or blocking hits. Players see the powers in the pet\'s description. Draw how pets look in the Pets tab.</p>'+
   '<input type="search" data-pwq placeholder="Search pets" value="'+E(T.q)+'" style="max-width:240px"></div>';
  h+='<div class="dv-spr'+(T.sel?' dv-has':'')+'"><div class="dv-ls"><div class="dv-grid" style="grid-template-columns:1fr">';
  for(const p of P2){if(q&&!p.n.toLowerCase().includes(q)&&!p.k.includes(q))continue;const live=JSON.stringify((S.live&&S.live.petab||{})[p.k]||null)===JSON.stringify(L[p.k]||null);
   h+='<button class="dv-it'+(T.sel===p.k?' dv-on':'')+'" data-pws="'+p.k+'" style="flex-direction:row;justify-content:flex-start;gap:8px;padding:6px 8px">'+(L[p.k]?'<i class="dv-bd dv-'+(live?'live':'draft')+'">'+(live?'LIVE':'DRAFT')+'</i>':'')+
    '<img src="'+iconURL('pet_'+p.k)+'" style="width:28px;height:28px;image-rendering:pixelated"><span style="font-size:13px;text-align:left;flex:1">'+E(p.n)+'</span><span style="font-size:12px">'+badges(p.k)+'</span></button>'}
  h+='</div></div><div class="dv-ed">';if(!T.sel)return h+'<p class="dv-mut">Pick a pet.</p></div></div>';
  const k=T.sel,w=T.w||{},r=clean(w)||{own:1},[oi,ot]=own(k),at=r.at||'';
  h+='<div class="dv-card dv-rules"><div class="dv-row" style="gap:10px;align-items:center"><img src="'+iconURL('pet_'+k)+'" style="width:48px;height:48px;image-rendering:pixelated"><div><b>'+E(petName(k))+'</b><br><small class="dv-mut">'+k+' · item pet_'+k+'</small></div></div>'+
   '<p style="margin:8px 0 4px"><b>Its own ability</b></p><p class="dv-mut" style="margin:0 0 4px">'+(oi?oi+' ':'')+E(ot)+'</p>'+(oi?'<label class="dv-mut"><input type="checkbox" data-pwc="own"'+(r.own!==0?' checked':'')+'> Keep it</label>':'')+
   '<p style="margin:12px 0 4px"><b>Fighting</b></p><div class="dv-chips">'+[['','Doesn\'t fight'],['melee','⚔ Melee'],['ranged','🏹 Ranged'],['magic','🔮 Magic'],['aoe','💥 Burst (all around)']].map(([v,l])=>'<button class="dv-b'+(at===v?' dv-tl dv-on':'')+'" data-pwa="'+v+'">'+l+'</button>').join('')+'</div>';
  if(at){const sk=SKN[growSk(at)]||'';h+=fld('Fights','<select data-pw="ag">'+[['hurt','when something hurts you'],['near','any monster near you'],['yours','what you\'re fighting']].map(([v,l])=>'<option value="'+v+'"'+(r.ag===v?' selected':'')+'>'+l+'</option>').join('')+'</select>')+
   fld('Damage',n_('dmg',r.dmg,1,50)+' <label class="dv-mut"><input type="checkbox" data-pwc="gr"'+(r.gr?' checked':'')+'> +1 per 25 '+E(sk)+' levels</label> <span class="dv-mut">(you now: '+dmgOf(r)+')</span>')+
   fld('Every',n_('cd',r.cd,.3,10,.1)+' s')+
   fld(at==='aoe'?'Burst size':at==='melee'?'Reach':'Range',n_('rng',r.rng,16,200)+' px <span class="dv-mut">('+(at==='aoe'?'48 ≈ 3 tiles around it':at==='melee'?'40 ≈ next to you':'140 ≈ a bow')+')</span>')+
   fld('Colour','<span><input type="color" data-pw="col" value="'+r.col+'"> <input data-pw="col" value="'+r.col+'" maxlength="7" style="width:72px;font-family:monospace"></span>')+
   '<p class="dv-mut" style="margin:6px 0 2px">Effects on the monster (chance %, seconds):</p><div class="dv-row" style="flex-wrap:wrap;gap:6px 14px">'+FXK.map(f=>{const e=(r.fx||{})[f]||[0,3];return'<span>'+({slow:'Slow',burn:'Burn',poison:'Poison',freeze:'Freeze'}[f])+' '+n_('fx_'+f+'_c',e[0],0,100,1,52)+'% '+n_('fx_'+f+'_t',e[1],.5,30,.5,52)+'s</span>'}).join('')+'</div>'}
  const hl=r.heal||{h:0,e:45},ft=r.fetch||{k:'',n:1,e:120},ex=r.ex||{s:-1,c:0};
  h+='<p style="margin:12px 0 4px"><b>Helping</b></p>'+
   fld('💗 Heals you',n_('heal_h',hl.h,0,6,1,52)+' hearts every '+n_('heal_e',hl.e,5,600)+' s while you\'re hurt <span class="dv-mut">(0 = no)</span>')+
   fld('🎁 Brings you','<span>'+n_('fetch_n',ft.n,1,99,1,52)+' <select data-pw="fetch_k" style="max-width:200px"><option value="">— nothing —</option>'+items().map(([q,n])=>'<option value="'+E(q)+'"'+(q===ft.k?' selected':'')+'>'+E(n)+'</option>').join('')+'</select> every '+n_('fetch_e',ft.e,10,3600)+' s</span>')+
   fld('🍀 Extra loot',n_('ex_c',ex.c,0,100,1,52)+'% chance of +1 when you gather with <select data-pw="ex_s"><option value="-1"'+(ex.s<0?' selected':'')+'>any gathering skill</option>'+SKN.map((n,i)=>'<option value="'+i+'"'+(ex.s===i?' selected':'')+'>'+E(n)+'</option>').join('')+'</select>')+
   fld('📘 More XP',n_('xp',r.xp||0,0,100,1,52)+' %')+fld('🪙 More gold',n_('gold',r.gold||0,0,200,1,52)+' % from monsters')+fld('🛡 Blocks hits',n_('guard',r.guard||0,0,50,1,52)+' % chance to stop a hit');
  h+='<p class="dv-mut" style="margin-top:10px"><b>Players read:</b> '+E((D0['pet_'+k]||IDESC['pet_'+k]||'').trim())+E(describe(k,clean(w)))+'</p>'+
   '<div class="dv-row" style="gap:6px;flex-wrap:wrap"><button class="dv-b dv-pri" data-pwx="save">Save to draft</button><button class="dv-b" data-pwx="try" title="Puts the draft on your own game and gives you this pet">Try it (preview + give me the pet)</button><button class="dv-b dv-bad" data-pwx="reset">Back to the game\'s own</button></div></div>';
  return h+'</div></div>'}
 const setW=(f,v)=>{T.w=T.w||{own:1};const w=T.w;T.dirty=true;
  if(f.startsWith('fx_')){const[,x,p]=f.split('_');w.fx=w.fx||{};const e=w.fx[x]||[0,3];e[p==='c'?0:1]=+v;w.fx[x]=e;return}
  if(f.startsWith('heal_')){w.heal=w.heal||{h:0,e:45};w.heal[f.slice(5)]=+v;return}
  if(f.startsWith('fetch_')){w.fetch=w.fetch||{k:'',n:1,e:120};const q=f.slice(6);w.fetch[q]=q==='k'?v:+v;return}
  if(f.startsWith('ex_')){w.ex=w.ex||{s:-1,c:0};w.ex[f.slice(3)]=+v;return}
  if(f==='col'){const c=hex(v);if(!c){toast('That isn\'t a hex colour (try #a070f0).');return}w.col=c;return}
  w[f]=f==='ag'?v:+v};
 async function save(){const k=T.sel,r=clean(T.w);if(r)sec()[k]=r;else delete sec()[k];try{await dset('draft/petab/'+k,r||null);T.dirty=false;T.w=r?JSON.parse(JSON.stringify(r)):{own:1};toast('Saved to draft. Publish it from the Publish tab.')}catch(e){fail(e)}try{if(A.previewing)A.preview(S.draft)}catch(e){}API.draw()}
 document.addEventListener('click',async e=>{if(S.tab!=='petpow')return;const t=e.target.closest('[data-pws],[data-pwa],[data-pwx]');if(!t)return;e.preventDefault();
  if(t.dataset.pws!=null){if(T.dirty&&T.sel&&T.sel!==t.dataset.pws&&!confirmLeave())return;T.sel=t.dataset.pws;T.w=JSON.parse(JSON.stringify(sec()[T.sel]||{own:1}));T.dirty=false;API.draw();return}
  if(t.dataset.pwa!=null){T.w=T.w||{own:1};const v=t.dataset.pwa;if(v){T.w.at=v;T.w.rng=DEFR[v];T.w.col=T.w.col&&T.w.at===v?T.w.col:DEFC[v];T.w.ag=T.w.ag||'hurt'}else delete T.w.at;T.dirty=true;API.draw();return}
  const a=t.dataset.pwx;if(a==='save')return save();
  if(a==='reset')return arm('pwreset',async()=>{T.w={own:1};await save()});
  if(a==='try'){await save();try{A.preview(S.draft)}catch(x){}const ik='pet_'+T.sel;if(EQ[ik]){inv[ik]=(inv[ik]|0)+1;try{equipItem(ik)}catch(x){}}toast('Your draft is on (preview) and the '+petName(T.sel).toLowerCase()+' follows you. Spawn monsters in the Test tab.');API.draw()}},true);
 const confirmLeave=()=>{toast('Unsaved changes dropped.');return true};
 document.addEventListener('change',e=>{if(S.tab!=='petpow'||!T.sel)return;const t=e.target;if(t.dataset.pw){setW(t.dataset.pw,t.value);API.draw();return}if(t.dataset.pwc){T.w=T.w||{own:1};T.w[t.dataset.pwc]=t.checked?1:0;T.dirty=true;API.draw()}},true);
 document.addEventListener('input',e=>{if(S.tab!=='petpow')return;const t=e.target;if(t.hasAttribute&&t.hasAttribute('data-pwq')){T.q=t.value;const pos=t.selectionStart;API.draw();const i=document.querySelector('#dvs [data-pwq]');if(i){i.focus();try{i.setSelectionRange(pos,pos)}catch(x){}}}},true);
 const changes=(L,D)=>{const l=(L||{}).petab||{},d=(D||{}).petab||{},out=[];for(const k of new Set([...Object.keys(l),...Object.keys(d)]))if(JSON.stringify(l[k])!==JSON.stringify(d[k]))out.push({kind:'ext',html:'🐾 '+E(petName(k))+' powers'+(d[k]?(l[k]?' (changed)':' (new)'):' (back to the game\'s own)')});return out};
 SQSUITE.addTab('petpow','Pet powers',{render,changes,dirty:()=>!!(T.sel&&T.dirty),leave(){T.sel=null;T.w=null;T.dirty=false}})})();
