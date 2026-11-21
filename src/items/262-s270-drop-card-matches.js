// ---- 270. Drop Card matches against Ace (window.SQDCM) ----
// Nov 20: play your binder's active deck against Ace the Card Sharp (258) on Easy, Normal or Hard, on a full-screen table (#sqdcm)
// that works with touch, mouse and controller (every control is a <button>; SQNAVROOT points the controller at the table).
// - Tap a card in your hand, then PLAY / PLANT (a spell that needs a target asks for one: the targets light up). Tap one of your
//   monsters, then what to attack (Guard is enforced). Tap a tree in your Grove to chop it for Mana; playing a card chops the
//   cheapest trees that cover it by itself. END TURN. Esc / CANCEL drops a selection. Leaving a match counts as a loss.
// - Ace (aceMove) plays a move every 0.7 s: plant the biggest tree, go for the win when it can, play its biggest card (spells on
//   sensible targets), trade monsters when it wins the trade, else hit your hero. Easy plays loosely and hits faces.
// - Gold for a win: Easy 50, Normal 150, Hard 400 (a tenth after the first win of the day at that level, saved as `dcw`), and the
//   achievement "First win". The rules engine is 261's SQDCE.
(()=>{const E=window.SQDCE,B=window.SQBINDER,D=window.SQDROPCARD;if(!E||!B||!D)return;
 const LV={easy:{n:'Easy',g:50,deck:[['tree',6],['oak',2],['slime',2],['slime:moss',2],['wolf',2],['skel',2],['bat',2],['pot_heal',2]]},
  normal:{n:'Normal',g:150,deck:[['tree',6],['oak',2],['slime',2],['slime:moss',2],['wolf:briar',2],['skel',2],['bat',2],['pot_heal',1],['shroom',1]]},
  hard:{n:'Hard',g:400,deck:[['tree',3],['oak',2],['willow',2],['maple',1],['wolf:snow',2],['skel:ember',2],['guard',2],['alpha',1],['wb:giant',1],['thorn',1],['pot_zap',1],['pot_napalm',1],['pot_heal',1]]}};
 const aceDeck=lv=>{const out=[];for(const[k,n]of LV[lv].deck){const C=D.CARDS[k];if(C)for(let i=0;i<n;i++)out.push(C.key)}return out};
 let M=null;// {s, lv, sel:{t:'hand'|'mon',v}, aim:[uids] , msg, busy, leaveArm}
 let WINS={};// {lv: day}
 SQSAVE.after('262:dcw',s=>{s.dcw=WINS});SQLOAD.after('262',(S)=>{WINS=S&&S.dcw&&typeof S.dcw==='object'?Object.assign({},S.dcw):{}});
 const today=()=>Math.floor(Date.now()/864e5);
 // ---- Ace ----
 const rnd01=s=>{s.ar=((s.ar|0)*1103515245+12345)&0x7fffffff;return s.ar/0x7fffffff};// Ace's own dice (kept in the match state)
 function aceMove(s,i,lv){const P=s.p[i],O=s.p[1-i],opts=E.options(s,i);const has=t=>opts.filter(o=>o.t===t);
  const plants=has('plant');if(plants.length){let best=plants[0];for(const o of plants)if(E.card(P.hand[o.h]).mana>E.card(P.hand[best.h]).mana)best=o;return best}
  // Easy Ace daydreams: some turns it stops early
  if(lv==='easy'&&rnd01(s)<.3)return{t:'end'};
  const sap=opts.find(o=>o.t==='play'&&P.hand[o.h]==='_sapling');
  const ready=P.board.filter(m=>E.targets(s,i,m.uid).length);const g=E.guards(s,1-i);
  // the win
  if(!g.length){const dmg=ready.reduce((a,m)=>a+E.atkOf(s,i,m),0);if(dmg>=O.hp&&ready.length)return{t:'atk',a:ready[0].uid,tg:'h'+(1-i)}}
  // cards
  const plays=has('play').filter(o=>P.hand[o.h]!=='_sapling').map(o=>({o,c:E.card(P.hand[o.h])}));
  let pickP=null,ps=-1;for(const{o,c}of plays){let v=E.costOf(s,i,c)*10+(c.kind==='mon'?c.atk+c.hp:0);
   if(c.kind==='spell'){const tm=o.tg&&E.findM(s,o.tg)[1];
    if(c.id==='pot_heal')v=P.hp<=14?60:-1;else if(c.id==='nuts')v=P.hp<=18?15:-1;else if(c.id==='pot_napalm')v=O.board.length>=2?70:-1;
    else if(c.id==='pot_zap')v=tm&&tm.side!==i?(tm.hp<=4?50+E.atkOf(s,1-i,tm)*5:20):-1;else if(c.id==='pot_poison')v=tm&&tm.side!==i?20+tm.hp:-1;
    else if(c.id==='cfruit')v=tm&&tm.side===i&&tm.hp<tm.max?20:-1;else if(c.id==='pot_swift')v=tm&&tm.side===i&&tm.done&&!tm.sleep?25:-1;
    else if(tm)v=tm.side===i?15+E.atkOf(s,i,tm):-1;else v=20}
   if(lv==='easy')v=v>=0?rnd01(s)*10+1:-1;if(v>ps){ps=v;pickP=o}}
  if(pickP&&ps>=0&&!(lv==='easy'&&P.played>=1))return pickP;// Easy plays one card a turn
  if(sap&&plays.some(({c})=>E.costOf(s,i,c)===P.pool+P.grove.filter(t=>!t.stump).reduce((a,t)=>a+t.mana,0)+1))return sap;
  // attacks
  for(const m of ready){const ts=E.targets(s,i,m.uid);if(lv==='easy'){if(rnd01(s)<.4)return{t:'end'};return{t:'atk',a:m.uid,tg:ts[Math.floor(rnd01(s)*ts.length)]}}
   const av=E.atkOf(s,i,m);let best=null,bs=-1e9;
   for(const tg of ts){if(tg[0]==='h'){const v=av*4+(O.hp<=10?10:0);if(v>bs){bs=v;best=tg}continue}const d=E.findM(s,tg)[1],dv=E.atkOf(s,1-i,d),kill=av>=d.hp,die=dv>=m.hp;
    let v=(kill?10+dv*3+d.hp:0)-(die?8+av*2:0);if(kill&&!die)v+=20;if(v>bs){bs=v;best=tg}}
   if(best)return{t:'atk',a:m.uid,tg:best}}
  return{t:'end'}}
 // ---- the table ----
 const el=document.createElement('div');el.id='sqdcm';el.style.display='none';el.setAttribute('role','dialog');el.setAttribute('aria-label','Drop Card match');document.body.appendChild(el);
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const pic=k=>{try{return iconURL(k)}catch(e){return''}};
 function monHTML(m,side){const s=M.s,me=side===0,ready=me&&s.cur===0&&E.targets(s,0,m.uid).length>0,aim=M.aim&&M.aim.includes(m.uid),sel=M.sel&&M.sel.t==='mon'&&M.sel.v===m.uid;
  const tags=[];if(E.guards(s,side).includes(m))tags.push('GUARD');if(m.sleep&&me)tags.push('ZZZ');if(m.frozen>0)tags.push('FROZEN');if(m.poison)tags.push('POISON');if(m.mute)tags.push('SILENCED');
  const pw=!m.mute&&E.POW[m.id2];
  return'<button class="dcm-m'+(ready?' rdy':'')+(aim?' aim':'')+(sel?' sel':'')+(E.guards(s,side).includes(m)?' grd':'')+'" data-dcm="m:'+m.uid+'" aria-label="'+esc(m.n+', '+E.atkOf(s,side,m)+' attack, '+m.hp+' health'+(pw?', '+pw:''))+'">'+
   (m.key?'<img src="'+pic(m.key)+'" alt="">':'<span class="dcm-sp">🕷</span>')+'<span class="dcm-a">'+E.atkOf(s,side,m)+'</span><span class="dcm-h'+(m.hp<m.max?' hurt':'')+'">'+m.hp+'</span>'+(tags.length?'<span class="dcm-tag">'+tags.join(' ')+'</span>':'')+'</button>'}
 function groveHTML(side){const P=M.s.p[side],me=side===0;return P.grove.map((g,j)=>'<button class="dcm-t'+(g.stump?' stump':'')+'" data-dcm="'+(me?'g:'+j:'x')+'" aria-label="'+esc(g.n+' '+g.mana+' Mana'+(g.stump?', chopped':''))+'"'+(me&&!g.stump&&M.s.cur===0?'':' tabindex="-1"')+'>'+(g.stump?'<span class="dcm-stump"></span>':'<img src="'+pic(g.key)+'" alt="">')+'<span class="dcm-tm">'+g.mana+'</span></button>').join('')||'<span class="dcm-empty">No trees yet</span>'}
 function render(){if(!M)return;const s=M.s,P=s.p[0],A=s.p[1],my=s.cur===0&&!s.over;
  const up=P.grove.filter(g=>!g.stump).reduce((a,g)=>a+g.mana,0);
  let h='<div class="dcm-top"><div class="dcm-hero'+(M.aim&&M.aim.includes('h1')?' aim':'')+'"><button class="dcm-hb" data-dcm="h:h1" aria-label="'+esc(A.n+', '+A.hp+' health')+'"><span class="dcm-face">A</span><b>'+esc(A.n)+'</b><span class="dcm-hp">'+A.hp+'</span></button><span class="dcm-sm">Hand '+A.hand.length+' · Deck '+A.deck.length+'</span></div>'+
   '<div class="dcm-grove">'+groveHTML(1)+'</div><div class="dcm-turn">'+(s.over?(s.win===0?'YOU WIN!':'ACE WINS'):my?'YOUR TURN':'ACE\'S TURN')+'<span class="dcm-sm">'+esc(LV[M.lv].n)+'</span></div></div>';
  h+='<div class="dcm-board foe">'+(A.board.map(m=>monHTML(m,1)).join('')||'<span class="dcm-empty">Ace has no monsters out</span>')+'</div>';
  h+='<div class="dcm-msg" role="status">'+esc(M.msg||s.log[s.log.length-1]||'')+'</div>';
  h+='<div class="dcm-board me">'+(P.board.map(m=>monHTML(m,0)).join('')||'<span class="dcm-empty">Play monsters here</span>')+'</div>';
  h+='<div class="dcm-low"><div class="dcm-bot"><div class="dcm-hero me'+(M.aim&&M.aim.includes('h0')?' aim':'')+'"><button class="dcm-hb" data-dcm="h:h0" aria-label="You, '+P.hp+' health"><span class="dcm-face">'+esc((P.n||'Y')[0].toUpperCase())+'</span><b>You</b><span class="dcm-hp">'+P.hp+'</span></button><span class="dcm-sm">Mana <b>'+P.pool+'</b> (+'+up+' in trees) · Deck '+P.deck.length+'</span></div>'+
   '<div class="dcm-grove me">'+groveHTML(0)+'</div></div>';
  h+='<div class="dcm-hand">'+P.hand.map((k,i)=>{if(k==='_sapling')return'<button class="dcm-c'+(M.sel&&M.sel.t==='hand'&&M.sel.v===i?' sel':'')+'" data-dcm="c:'+i+'" aria-label="Sapling: 1 Mana this turn"><span class="dcm-sap">🌱</span><span class="dcm-cost">0</span></button>';
   const c=E.card(k),cost=E.costOf(s,0,c),ok=my&&(c.kind==='tree'?!P.planted:cost<=P.pool+up);
   return'<button class="dcm-c'+(ok?'':' no')+(M.sel&&M.sel.t==='hand'&&M.sel.v===i?' sel':'')+'" data-dcm="c:'+i+'" aria-label="'+esc(c.n+(c.kind==='tree'?', '+c.mana+' Mana tree':', costs '+cost))+'"><img src="'+pic(k)+'" alt=""><span class="dcm-cost">'+(c.kind==='tree'?'+'+c.mana:cost)+'</span></button>'}).join('')+'</div></div>';
  // the detail strip
  let det='',acts='';const sel=M.sel;
  if(sel&&sel.t==='hand'){const k=P.hand[sel.v];if(k==='_sapling'){det='<b>Sapling</b> · +1 Mana this turn.';acts='<button class="dcm-b pri" data-dcm="play">USE IT</button>'}
   else{const c=E.card(k);det='<b>'+esc(c.n)+'</b> · '+(c.kind==='tree'?c.mana+' Mana tree: plant one a turn, chop it to pay.':c.kind==='spell'?esc(c.d):c.atk+' ATK · '+c.hp+' HP · costs '+E.costOf(s,0,c)+(E.POW[c.id]?' · '+esc(E.POW[c.id]):''));
    acts=c.kind==='tree'?'<button class="dcm-b pri" data-dcm="play">PLANT</button>':'<button class="dcm-b pri" data-dcm="play">'+(M.aim?'PICK A TARGET':'PLAY')+'</button>'}}
  else if(sel&&sel.t==='mon'){const m=E.findM(s,sel.v)[1];if(m)det='<b>'+esc(m.n)+'</b> · '+E.atkOf(s,0,m)+' ATK · '+m.hp+' HP'+(E.POW[m.id2]&&!m.mute?' · '+esc(E.POW[m.id2]):'')+' · <i>pick what to attack</i>'}
  else if(P.comp)det='Companion: <b>'+esc(E.short(INAME[P.pet]||''))+'</b>';
  h+='<div class="dcm-det"><span>'+det+'</span><span class="dcm-acts">'+acts+(sel?'<button class="dcm-b" data-dcm="cancel">CANCEL</button>':'')+
   (s.over?'<button class="dcm-b pri" data-dcm="again">PLAY AGAIN</button><button class="dcm-b" data-dcm="leave">LEAVE</button>':'<button class="dcm-b end" data-dcm="end"'+(my?'':' disabled')+'>END TURN</button><button class="dcm-b" data-dcm="leave">'+(M.leaveArm?'LEAVE = LOSS?':'LEAVE')+'</button>')+'</span></div>';
  el.innerHTML=h}
 // ---- input ----
 function act(mv){const r=E.apply(M.s,0,mv);M.msg=r||'';if(!r){M.sel=null;M.aim=null}try{sfx(r?'swish':mv.t==='atk'?'hit':mv.t==='chop'?'chop':'pickup')}catch(e){self.SQERR&&SQERR(e,'262-1')}after();return!r}
 function after(){render();const s=M.s;if(s.over){finish();return}if(s.cur===1&&!M.busy)aceRun()}
 function aceRun(){M.busy=true;const step=()=>{if(!M||M.s.over||M.s.cur!==1){if(M)M.busy=false;if(M)after();return}const mv=aceMove(M.s,1,M.lv);const r=E.apply(M.s,1,mv);if(r){E.apply(M.s,1,{t:'end'})}
   M.msg='';try{sfx(mv.t==='atk'?'hit':'pickup')}catch(e){self.SQERR&&SQERR(e,'262-2')}render();if(M.s.over){M.busy=false;finish();return}if(M.s.cur!==1){M.busy=false;render();return}setTimeout(step,window.SQDCMFAST?0:700)};setTimeout(step,window.SQDCMFAST?0:700)}
 function finish(){const s=M.s;if(M.done)return;M.done=true;
  if(s.win===0){const L=LV[M.lv],first=WINS[M.lv]!==today(),g=first?L.g:Math.round(L.g/10);GLD+=g;WINS[M.lv]=today();M.msg='You beat Ace on '+L.n+'! +'+g+' gold'+(first?'':' (full reward once a day)')+'.';
   try{SQACH&&SQACH.add&&SQACH.add('dcwin',1);SQACH.check&&SQACH.check()}catch(e){self.SQERR&&SQERR(e,'262-3')}try{sfx('quest')}catch(e){self.SQERR&&SQERR(e,'262-4')}}
  else{M.msg='Ace wins this one. Tweak your deck in the Card Binder and try again!';try{sfx('swish')}catch(e){self.SQERR&&SQERR(e,'262-5')}}
  try{saveLocal(true)}catch(e){self.SQERR&&SQERR(e,'262-6')}render()}
 el.addEventListener('click',e=>{const b=e.target.closest('[data-dcm]');if(!b||!M)return;e.stopPropagation();const a=b.dataset.dcm,s=M.s,P=s.p[0];const[x,y]=[a.split(':')[0],a.slice(a.indexOf(':')+1)];
  if(a!=='leave')M.leaveArm=false;
  if(a==='leave'){if(!s.over&&!M.leaveArm){M.leaveArm=true;M.msg='Tap LEAVE again to give up (it counts as a loss).';render();return}close();return}
  if(a==='again'){start(M.lv);return}if(a==='cancel'){M.sel=null;M.aim=null;M.msg='';render();return}
  if(s.over||s.cur!==0||M.busy)return;
  if(a==='end'){act({t:'end'});return}
  if(x==='g'){act({t:'chop',g:+y});return}
  if(x==='c'){const i=+y;if(M.sel&&M.sel.t==='hand'&&M.sel.v===i){playSel();return}M.sel={t:'hand',v:i};M.aim=null;M.msg='';const k=P.hand[i];const c=k!=='_sapling'&&E.card(k);if(c&&c.kind==='spell'){const ts=E.spellTargets(s,0,c);if(ts)M.aim=ts}render();return}
  if(a==='play'){playSel();return}
  if(x==='m'||x==='h'){const uid=y;
   if(M.aim&&M.aim.includes(uid)){if(M.sel.t==='hand')act({t:'play',h:M.sel.v,tg:uid});else act({t:'atk',a:M.sel.v,tg:uid});return}
   const[side]=x==='m'?E.findM(s,uid):[-1];if(side===0){const ts=E.targets(s,0,uid);M.sel={t:'mon',v:uid};M.aim=ts;M.msg=ts.length?'':(E.findM(s,uid)[1].sleep?'Just played: it can attack next turn.':'It can\'t attack right now.');render();return}
   if(M.aim)M.msg='That isn\'t a target.';render()}});
 function playSel(){const s=M.s,P=s.p[0],i=M.sel&&M.sel.v;if(!M.sel||M.sel.t!=='hand')return;const k=P.hand[i];if(k==='_sapling'){act({t:'play',h:i});return}const c=E.card(k);
  if(c.kind==='tree'){act({t:'plant',h:i});return}if(c.kind==='spell'){const ts=E.spellTargets(s,0,c);if(ts){M.aim=ts;M.msg=ts.length?'Pick a target.':'There\'s nothing to use it on.';render();return}}act({t:'play',h:i})}
 addEventListener('keydown',e=>{if(!M||el.style.display==='none')return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(M.sel){M.sel=null;M.aim=null;render()}}},true);
 SQNAVROOT.wrap('262',_n=>function(){if(M&&el.style.display!=='none')return el;return _n.apply(this,arguments)});
 // ---- starting ----
 function deckOf(){const d=B.decks[B.active];return d?d:null}
 function start(lv){const d=deckOf();const P=d?B.problems(d).filter(p=>!/^Optional/.test(p)):['No deck.'];
  if(P.length){say('Your deck isn\'t ready: '+P[0]+' (Card Binder > Decks)');msgT=5;try{sfx('swish')}catch(e){self.SQERR&&SQERR(e,'262-7')}return false}
  const mine=[];for(const k in d.c)for(let i=0;i<d.c[k];i++)mine.push(k);
  const s=E.create({seed:(Math.random()*2147483647)|0,decks:[mine,aceDeck(lv)],pets:[d.pet,null],names:[(window.SQMP&&SQMP.user&&String(SQMP.user.displayName||'').split(' ')[0])||'You','Ace']});
  M={s,lv,sel:null,aim:null,msg:'Plant a tree, chop it for Mana, play your cards. Good luck!',busy:false,done:false,leaveArm:false};
  try{closePanel()}catch(e){self.SQERR&&SQERR(e,'262-8')}el.style.display='flex';render();try{sfx('talk')}catch(e){self.SQERR&&SQERR(e,'262-9')}return true}
 function close(){if(M&&!M.s.over&&!M.done){M.s.over=true;M.s.win=1}M=null;el.style.display='none'}
 // Ace's panel: pick a level (replaces 258's "coming soon" button)
 SQRPN.wrap('262 ace',_r=>function(){const out=_r.apply(this,arguments);try{if(ptab==2&&shop==='cardsharp'){const b=pbd.querySelector('[data-dcs2="match"]');if(b){
   const box=document.createElement('div');box.className='dcm-lv';box.innerHTML='<div class="dcm-lvt">Play a match against Ace (your deck: <b>'+esc((deckOf()||{}).n||'none')+'</b>)</div>'+Object.keys(LV).map(k=>'<button class="sb" data-dcmlv="'+k+'">'+LV[k].n+' · win '+(WINS[k]===today()?Math.round(LV[k].g/10)+' gold (again today)':LV[k].g+' gold')+'</button>').join('');b.replaceWith(box)}}}catch(e){self.SQERR&&SQERR(e,'262-10')}return out});
 pbd.addEventListener('click',e=>{const b=e.target.closest('[data-dcmlv]');if(!b)return;e.stopPropagation();e.preventDefault();start(b.dataset.dcmlv)},true);
 // achievement
 try{if(!SQACH.A.some(a=>a.id==='dc_win'))SQACH.A.push({g:'Drop Card',id:'dc_win',n:'Card shark',d:'Win a Drop Card match.',val:()=>(SQACH.counters&&SQACH.counters.dcwin)|0,goal:1,gold:500})}catch(e){self.SQERR&&SQERR(e,'262-11')}
 const st=document.createElement('style');st.textContent=
  '#sqdcm{position:fixed;inset:0;z-index:40;flex-direction:column;justify-content:safe center;gap:4px;padding:calc(env(safe-area-inset-top,0px) + 6px) 8px calc(env(safe-area-inset-bottom,0px) + 6px);background:radial-gradient(ellipse at center,#2e6a40 0%,#1e4a2c 70%,#173a22 100%);color:#f4f0d8;font-family:var(--pf);overflow:auto;box-sizing:border-box}'+
  '#sqdcm button{font-family:var(--pf);color:inherit;cursor:pointer}'+
  '.dcm-top,.dcm-bot{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.dcm-grove{display:flex;gap:4px;flex-wrap:wrap;flex:1;min-width:0}.dcm-grove.me{justify-content:flex-start}'+
  '.dcm-hero{display:flex;flex-direction:column;gap:2px}.dcm-hb{display:flex;align-items:center;gap:6px;min-height:44px;padding:4px 10px;background:#f8f8f8;color:#282028!important;border:3px solid #485870;border-radius:8px}'+
  '.dcm-face{width:30px;height:30px;display:flex;align-items:center;justify-content:center;background:#c8d8f0;border:2px solid #485870;font-weight:700}.dcm-hp{background:#c02828;color:#fff;font-weight:700;padding:1px 7px;border:2px solid #601010}'+
  '.dcm-hero.aim .dcm-hb{box-shadow:0 0 0 3px #f04040,0 0 12px 4px rgba(240,64,64,.6)}.dcm-sm{font-size:12px;opacity:.85}'+
  '.dcm-turn{display:flex;flex-direction:column;align-items:flex-end;font-weight:700;font-size:16px;color:#f8d048;margin-left:auto}'+
  '.dcm-t{position:relative;width:40px;height:56px;padding:0;background:none;border:2px solid transparent;border-radius:6px}.dcm-t img{width:100%;height:100%;object-fit:cover;image-rendering:pixelated}.dcm-t.stump{opacity:.75}'+
  '.dcm-stump{display:block;width:26px;height:18px;margin:22px auto 0;background:#8a5a30;border:2px solid #3a2410;border-radius:4px 4px 2px 2px;box-shadow:inset 0 3px 0 #c8a070}'+
  '.dcm-tm{position:absolute;right:-4px;bottom:-4px;background:#3a6ad8;color:#fff;font:700 11px var(--pf);padding:0 4px;border:2px solid #102858;border-radius:4px}'+
  '.dcm-board{display:flex;justify-content:center;align-items:center;gap:8px;min-height:96px;flex-wrap:wrap;padding:4px;border-radius:10px;background:rgba(0,0,0,.12)}'+
  '.dcm-m{position:relative;width:62px;height:86px;padding:0;background:none;border:3px solid transparent;border-radius:8px}.dcm-m img{width:100%;height:100%;object-fit:cover;image-rendering:pixelated}.dcm-sp{font-size:36px}'+
  '.dcm-m.grd{border-color:#a8c0e0;box-shadow:0 0 0 2px #485870}.dcm-m.rdy{box-shadow:0 0 0 3px #78e070,0 0 10px 3px rgba(120,224,112,.55)}.dcm-m.sel{box-shadow:0 0 0 3px #f8d048,0 0 14px 4px rgba(248,208,72,.7)}.dcm-m.aim{box-shadow:0 0 0 3px #f04040,0 0 12px 4px rgba(240,64,64,.6)}'+
  '.dcm-a,.dcm-h{position:absolute;bottom:-6px;min-width:20px;height:20px;font:700 13px var(--pf);display:flex;align-items:center;justify-content:center;border:2px solid}.dcm-a{left:-6px;background:#f0a020;color:#281808;border-color:#603808}.dcm-h{right:-6px;background:#c02828;color:#fff;border-color:#601010}.dcm-h.hurt{color:#ffd0d0}'+
  '.dcm-tag{position:absolute;top:-9px;left:50%;transform:translateX(-50%);white-space:nowrap;background:#485870;color:#fff;font:700 9px var(--pf);padding:1px 4px;letter-spacing:.5px}'+
  '.dcm-msg{min-height:22px;text-align:center;font-size:14px;color:#fff6c8}.dcm-empty{opacity:.6;font-size:13px}'+
  '.dcm-hand{display:flex;justify-content:center;gap:6px;flex-wrap:wrap}.dcm-c{position:relative;width:58px;height:80px;padding:0;background:none;border:3px solid transparent;border-radius:8px;transition:transform .12s}.dcm-c img{width:100%;height:100%;object-fit:cover;image-rendering:pixelated}'+
  '.dcm-c.sel{transform:translateY(-10px);box-shadow:0 0 0 3px #f8d048,0 0 14px 4px rgba(248,208,72,.7)}.dcm-c.no{filter:saturate(.5) brightness(.75)}.dcm-sap{font-size:34px;line-height:80px}'+
  '.dcm-cost{position:absolute;left:-6px;top:-6px;min-width:22px;height:22px;background:#3a6ad8;color:#fff;font:700 13px var(--pf);display:flex;align-items:center;justify-content:center;border:2px solid #102858;border-radius:50%}'+
  '.dcm-det{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;background:rgba(0,0,0,.35);border-radius:8px;padding:6px 10px;font-size:14px;line-height:1.35}.dcm-acts{display:flex;gap:6px;flex-wrap:wrap;margin-left:auto}'+
  '.dcm-b{min-height:44px;min-width:44px;padding:6px 12px;background:#f8f8f8;color:#282028!important;border:3px solid #485870;border-radius:8px;font-weight:700}.dcm-b.pri{background:#78e070;border-color:#2a6a22}.dcm-b.end{background:#f8d048;border-color:#6a4410}.dcm-b:disabled{opacity:.45}'+
  '.dcm-lv{margin-top:6px}.dcm-lvt{font-size:14px;margin:6px 0}'+
  '.dcm-low{display:flex;flex-direction:column;gap:4px}'+
  '@media (max-height:500px){#sqdcm{gap:2px}.dcm-low{flex-direction:row;align-items:center;justify-content:space-between}.dcm-low .dcm-bot{flex:0 1 auto}.dcm-hand{flex:1;justify-content:flex-end}.dcm-sm{font-size:11px}.dcm-hb{min-height:36px;padding:2px 8px}.dcm-face{width:24px;height:24px}'+
  '.dcm-m{width:44px;height:62px}.dcm-c{width:42px;height:58px}.dcm-sap{line-height:58px;font-size:26px}.dcm-board{min-height:66px;padding:6px 2px 4px}.dcm-t{width:28px;height:39px}.dcm-stump{width:20px;height:14px;margin-top:14px}.dcm-msg{min-height:16px;font-size:12px}.dcm-det{padding:3px 8px;font-size:12px}.dcm-b{min-height:40px;padding:4px 10px}}';
 document.head.appendChild(st);
 window.SQDCM={start,close,aceMove,get m(){return M},LV,el,render,act}})();
