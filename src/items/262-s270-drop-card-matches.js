// ---- 270. Drop Card matches against Ace (window.SQDCM) ----
// Nov 20: play your binder's active deck against Ace the Card Sharp (258) on Easy, Normal or Hard, on a full-screen table (#sqdcm)
// that works with touch, mouse and controller (every control is a <button>; SQNAVROOT points the controller at the table).
// - The table (Nov 20, Jace's approved mock-up): wood and felt, the heroes drawn by 003's cP (you in your gear, Ace in his), Groves of
//   032/083's tree sprites (a drawn stump when chopped), mana gems, Ace's hand as card backs, your hand fanned, a round END TURN.
//   Cards show Jace's own card art. Tapping ANY card (hand, board, tree, your pet) opens a close-up: the big card with its cost,
//   ATK/HP, power, status, owner and where it drops, plus PLAY / PLANT / ATTACK / CHOP IT when you can; tapping anywhere else (or
//   BACK, Esc, the controller's ○) goes back to the table. ATTACK lights up the targets on the table; a spell that needs a target
//   does the same. While a card is open, the trees it would chop glow with an axe. Leaving a match counts as a loss.
// - Movement: attack lunges, damage numbers, a puff where a monster falls, new cards sliding in, chopped trees shaking, a turn
//   banner (all off with "reduce motion").
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
    if(c.id==='pot_heal')v=P.hp<=E.HERO-6?60:-1;else if(c.id==='nuts')v=P.hp<=E.HERO-2?15:-1;else if(c.id==='pot_napalm')v=O.board.length>=2?70:-1;
    else if(c.id==='pot_zap')v=tm&&tm.side!==i?(tm.hp<=4?50+E.atkOf(s,1-i,tm)*5:20):-1;else if(c.id==='pot_poison')v=tm&&tm.side!==i?20+tm.hp:-1;
    else if(c.id==='cfruit')v=tm&&tm.side===i&&tm.hp<tm.max?20:-1;else if(c.id==='pot_swift')v=tm&&tm.side===i&&tm.done&&!tm.sleep?25:-1;
    else if(tm)v=tm.side===i?15+E.atkOf(s,i,tm):-1;else v=20}
   if(lv==='easy')v=v>=0?rnd01(s)*10+1:-1;if(v>ps){ps=v;pickP=o}}
  if(pickP&&ps>=0&&!(lv==='easy'&&P.played>=1))return pickP;// Easy plays one card a turn
  if(sap&&plays.some(({c})=>E.costOf(s,i,c)===P.pool+P.grove.filter(t=>!t.stump).reduce((a,t)=>a+t.mana,0)+1))return sap;
  // attacks
  for(const m of ready){const ts=E.targets(s,i,m.uid);if(lv==='easy'){if(rnd01(s)<.4)return{t:'end'};return{t:'atk',a:m.uid,tg:ts[Math.floor(rnd01(s)*ts.length)]}}
   const av=E.atkOf(s,i,m);let best=null,bs=-1e9;
   for(const tg of ts){if(tg[0]==='h'){const v=av*4+(O.hp<=E.HERO/2?10:0);if(v>bs){bs=v;best=tg}continue}const d=E.findM(s,tg)[1],dv=E.atkOf(s,1-i,d),kill=av>=d.hp,die=dv>=m.hp;
    let v=(kill?10+dv*3+d.hp:0)-(die?8+av*2:0);if(kill&&!die)v+=20;if(v>bs){bs=v;best=tg}}
   if(best)return{t:'atk',a:m.uid,tg:best}}
  return{t:'end'}}
 // ---- the table (Nov 20, Jace's approved mock-up): wood and felt, his card art as drawn, real heroes and trees, a close-up on tap ----
 const el=document.createElement('div');el.id='sqdcm';el.style.display='none';el.setAttribute('role','dialog');el.setAttribute('aria-label','Drop Card match');document.body.appendChild(el);
 const fxl=document.createElement('div');fxl.className='dcm-fxl';fxl.setAttribute('aria-hidden','true');
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const pic=k=>{try{return iconURL(k)}catch(e){return''}};
 // pictures drawn by the game itself: hero busts (003's cP into a canvas, as 213's charLayer does), trees (032's hdSprites), a stump
 const PICS={};
 function bust(key,ch){if(PICS[key])return PICS[key];try{const c=document.createElement('canvas');c.width=80;c.height=80;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.setTransform(4,0,0,4,-24,-50);
   const sv=GC;GC=x;try{cP(ch,0,0,16,36,false)}finally{GC=sv}return PICS[key]=c.toDataURL()}catch(e){self.SQERR&&SQERR(e,'262-20');return''}}
 const TREEK={tree:'tree',oak:'oak',willow:'willow',maple:'maple',yew:'yew',pine:'pine'},RGV={deadtree:'dead',voidtree:'dark'};
 function treePic(id){const k='t:'+id;if(PICS[k])return PICS[k];try{if(RGV[id]&&typeof rgSprite==='function'){const o=rgSprite(RGV[id],0),c=o&&(o.c||o);if(c&&c.toDataURL)return PICS[k]=c.toDataURL()}}catch(e){self.SQERR&&SQERR(e,'262-22')}try{const H=hdSprites(),a=H[TREEK[id]||'tree']||H.tree,c=Array.isArray(a)?a[Math.min(2,a.length-1)]:a;return PICS[k]=c.toDataURL()}catch(e){self.SQERR&&SQERR(e,'262-21');return''}}
 function stumpPic(){if(PICS.stump)return PICS.stump;const c=document.createElement('canvas');c.width=16;c.height=12;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
  r(3,3,10,9,'#3a2410');r(4,4,8,7,'#8a5a30');r(3,1,10,4,'#3a2410');r(4,2,8,2,'#d8b078');r(7,2,1,1,'#a07040');r(9,3,1,1,'#a07040');r(1,10,14,2,'#3a2410');r(12,0,1,1,'#78c850');r(13,1,1,1,'#58a838');return PICS.stump=c.toDataURL()}
 const aceCh=()=>{const n=(window.NPCS||[]).find(n=>n.kind==='cardsharp');return n&&n.ch||{sk:1,hs:3,hc:2,sh:4,pn:2,ht:1,hcol:1,so:1}};
 const KIND={reg:'MONSTER',tree:'TREE',world:'WORLD BOSS',dungeon:'DUNGEON BOSS',island:'ISLAND BOSS',guild:'GUILD BOSS',potion:'POTION SPELL',forage:'FORAGE SPELL'};
 const KCOL={reg:'#7e4210',tree:'#3a7a2a',world:'#b83020',dungeon:'#7840b0',island:'#2878c8',guild:'#309058',potion:'#a83088',forage:'#8a7430'};
 const an=n=>(/^[aeiou]/.test(n)?'an ':'a ')+n,FROM={reg:n=>'Found by defeating '+an(n),tree:n=>'Found by chopping '+an(n),world:n=>'Found by defeating the '+n+' (world boss)',dungeon:n=>'Found by defeating the '+n+' (dungeon boss)',island:n=>'Found by defeating the '+n+' (island boss)',guild:n=>'Found by defeating the '+n+' (guild boss)',potion:n=>'Found by brewing '+an(n),forage:n=>'Found by picking '+an(n)};
 // against a player (263): M.pvp = {name, ch, send(mv), leave(), done(res), turnLeft()}; the foe is side 1 on this screen
 const FOE=()=>M&&M.pvp?M.pvp.name:'Ace',FOES=()=>FOE()+'\'s';
 const ACE_LINES=['Hah! Didn\'t see that coming?','Not bad, not bad...','My trees are bigger than yours.','You\'ll need more than that!','Careful now...','Is that your best card?'];
 // ---- drawing ----
 function cardBtn(k,data,cls,label,extra){return'<button class="dcm-card '+(cls||'')+'" data-dcm="'+data+'" aria-label="'+esc(label)+'"><img src="'+pic(k)+'" alt="">'+(extra||'')+'</button>'}
 function monHTML(m,side){const s=M.s,me=side===0,ready=me&&s.cur===0&&!s.over&&E.targets(s,0,m.uid).length>0,aim=M.aim&&M.aim.includes(m.uid),grd=E.guards(s,side).includes(m);
  const tags=[];if(grd)tags.push('GUARD');if(m.sleep&&me)tags.push('ZZZ');if(m.frozen>0)tags.push('FROZEN');if(m.poison)tags.push('POISON');if(m.mute)tags.push('SILENCED');
  const a=E.atkOf(s,side,m),pw=!m.mute&&E.POW[m.id2];
  return'<div class="dcm-slot" data-uid="'+m.uid+'">'+(m.key?cardBtn(m.key,'m:'+m.uid,(ready?'rdy ':'')+(aim?'aim ':'')+(grd?'grd ':'')+(M.att===m.uid?'att ':''),m.n+', '+a+' attack, '+m.hp+' health'+(pw?', '+pw:'')):'<button class="dcm-card dcm-spider'+(aim?' aim':'')+'" data-dcm="m:'+m.uid+'" aria-label="'+esc(m.n)+'">🕷</button>')+
   '<span class="dcm-atk">'+a+'</span><span class="dcm-hp'+(m.hp<m.max?' hurt':'')+'">'+m.hp+'</span>'+(tags.length?'<span class="dcm-tag">'+tags.join(' · ')+'</span>':'')+'</div>'}
 function groveHTML(side,plan){const P=M.s.p[side],me=side===0;if(!P.grove.length)return'<span class="dcm-empty">'+(me?'Plant a tree from your hand':'No trees yet')+'</span>';
  return P.grove.map((g,j)=>'<button class="dcm-tree'+(g.stump?' stump':'')+(plan&&plan.includes(j)?' plan':'')+'" data-dcm="'+(me?'g:'+j:'gx:'+j)+'" aria-label="'+esc(g.n+', '+g.mana+' Mana'+(g.stump?', chopped':me?', tap to chop':''))+'">'+
   '<img src="'+(g.stump?stumpPic():treePic(E.card(g.key).id))+'" alt=""><span class="dcm-tm'+(g.stump?' used':'')+'">'+g.mana+'</span></button>').join('')}
 function heroHTML(i){const s=M.s,P=s.p[i],aim=M.aim&&M.aim.includes('h'+i),me=i===0;
  const img=me?bust('me',(()=>{try{return gearCH()}catch(e){return CH}})()):(M.pvp?bust('pv:'+M.pvp.name+JSON.stringify(M.pvp.ch||{}).length,M.pvp.ch||aceCh()):bust('ace',aceCh()));
  return'<button class="dcm-hero'+(aim?' aim':'')+'" data-dcm="h:h'+i+'" aria-label="'+esc((me?'You':P.n)+', '+P.hp+' health')+'"><span class="dcm-face"><img src="'+img+'" alt=""></span>'+
   '<span class="dcm-hn"><b>'+esc(me?'You':P.n)+'</b><span class="dcm-heart">♥ '+P.hp+'</span></span></button>'}
 function render(){if(!M)return;const s=M.s,P=s.p[0],A=s.p[1],my=s.cur===0&&!s.over;
  const sel=M.zoom&&M.zoom.t==='hand'?P.hand[M.zoom.v]:M.sel&&M.sel.t==='hand'?P.hand[M.sel.v]:null,sc=sel&&sel!=='_sapling'?E.card(sel):null;
  const plan=sc&&sc.kind!=='tree'?E.chopPlan(s,0,E.costOf(s,0,sc)):null;
  const upM=P.grove.filter(g=>!g.stump).reduce((a,g)=>a+g.mana,0);
  let h='<div class="dcm-wood"><div class="dcm-felt">';
  // Ace
  h+='<div class="dcm-r1">'+heroHTML(1)+(M.say?'<div class="dcm-say">'+esc(M.say)+'</div>':'')+
   '<div class="dcm-ahand">'+A.hand.map((k,i)=>'<span class="dcm-back" style="--i:'+(i-(A.hand.length-1)/2)+'"></span>').join('')+'</div>'+
   '<div class="dcm-grove foe"><span class="dcm-gl">'+esc(FOES())+' Grove · '+E.groveMana(A)+'</span><div class="dcm-gt">'+groveHTML(1)+'</div></div>'+
   '<div class="dcm-log"><b>Last moves</b>'+s.log.slice(-4).map(l=>'<div>'+esc(l)+'</div>').join('')+'</div></div>';
  h+='<div class="dcm-board foe">'+(A.board.map(m=>monHTML(m,1)).join('')||'<span class="dcm-empty">'+esc(FOE())+' has no monsters out</span>')+'</div>';
  h+='<div class="dcm-mid"><span class="dcm-ribbon'+(s.over?' over':my?'':' ace')+'">'+(s.over?(s.win===0?'YOU WIN!':esc(FOE()).toUpperCase()+' WINS'):my?'YOUR TURN':esc(FOES()).toUpperCase()+' TURN')+'</span><span class="dcm-msg" role="status">'+esc(M.msg||'')+'</span>'+
   '<span class="dcm-lvn">'+esc(M.pvp?(M.pvp.turnLeft&&!s.over?M.pvp.turnLeft()+' left this turn':'vs '+FOE()):LV[M.lv].n)+' · tap any card for a close-up</span></div>';
  h+='<div class="dcm-board me">'+(P.board.map(m=>monHTML(m,0)).join('')||'<span class="dcm-empty">Your monsters go here</span>')+'</div>';
  // you
  h+='<div class="dcm-r5"><div class="dcm-me">'+heroHTML(0)+(P.pet?'<span class="dcm-pet" title="'+esc(E.short(INAME[P.pet]||''))+'"><img src="'+pic(P.pet.replace(/^pc_/,''))+'" alt=""><small>'+esc(E.short(INAME[P.pet]||''))+'</small></span>':'')+'</div>'+
   '<div class="dcm-grove me"><div class="dcm-gems">'+Array.from({length:Math.min(10,P.pool+upM)},(_,i)=>'<i class="'+(i<P.pool?'on':'')+'"></i>').join('')+'<span>'+P.pool+' Mana'+(upM?' · '+upM+' in trees':'')+'</span></div><div class="dcm-gt">'+groveHTML(0,plan)+'</div></div>'+
   '<div class="dcm-hand">'+P.hand.map((k,i)=>{const n=P.hand.length,rot=(i-(n-1)/2);
    if(k==='_sapling')return'<button class="dcm-card dcm-sap'+(my?' ok':'')+'" data-dcm="c:'+i+'" style="--r:'+rot+'" aria-label="Sapling: 1 Mana this turn">🌱<span class="dcm-cost">0</span></button>';
    const c=E.card(k),cost=E.costOf(s,0,c),ok=my&&(c.kind==='tree'?!P.planted:cost<=P.pool+upM);
    return'<button class="dcm-card'+(ok?' ok':' no')+(M.newCards&&M.newCards.includes(i)?' drawn':'')+'" data-dcm="c:'+i+'" style="--r:'+rot+'" aria-label="'+esc(c.n+(c.kind==='tree'?', '+c.mana+' Mana tree':', costs '+cost))+'"><img src="'+pic(k)+'" alt=""><span class="dcm-cost'+(c.kind==='tree'?' tree':'')+'">'+(c.kind==='tree'?'+'+c.mana:cost)+'</span></button>'}).join('')+'</div>'+
   '<div class="dcm-btns">'+(s.over&&!M.pvp?'<button class="dcm-end" data-dcm="again">PLAY<br>AGAIN</button>':s.over?'':'<button class="dcm-end" data-dcm="end"'+(my&&!M.aim?'':' disabled')+'>END<br>TURN</button>')+
   (M.aim?'<button class="dcm-b" data-dcm="cancel">CANCEL</button>':'')+'<button class="dcm-b small" data-dcm="leave">'+(s.over?'LEAVE':M.leaveArm?'LEAVE = LOSS?':'LEAVE')+'</button></div></div>';
  h+='</div></div>';
  // the close-up
  if(M.zoom)h+=zoomHTML();
  el.innerHTML=h;el.appendChild(fxl)}
 function zoomHTML(){const s=M.s,z=M.zoom,P=s.p[0];let key=null,c=null,m=null,side=-1,owner='',acts='',tags=[];
  if(z.t==='hand'){key=P.hand[z.v];if(key==='_sapling'){return'<div class="dcm-zoom" data-dcm="unzoom"><div class="dcm-zc"><div class="dcm-zbig dcm-sapbig">🌱</div><div class="dcm-zi"><div class="dcm-zn">Sapling</div><div class="dcm-zt">Gives 1 Mana this turn. Ace gives it to whoever goes second.</div><div class="dcm-zacts"><button class="dcm-b pri" data-dcm="play">USE IT</button><button class="dcm-b" data-dcm="unzoom">BACK</button></div></div></div><div class="dcm-zhint">Tap anywhere to go back to the table</div></div>'}
   c=E.card(key);owner='In your hand';const my=s.cur===0&&!s.over,up=P.pool+P.grove.filter(g=>!g.stump).reduce((a,g)=>a+g.mana,0);
   if(my){if(c.kind==='tree')acts=P.planted?'<span class="dcm-zw">You\'ve planted a tree this turn.</span>':'<button class="dcm-b pri" data-dcm="play">PLANT</button>';
    else acts=E.costOf(s,0,c)<=up?'<button class="dcm-b pri" data-dcm="play">PLAY</button>':'<span class="dcm-zw">Not enough Mana yet.</span>'}}
  else if(z.t==='mon'){[side,m]=E.findM(s,z.v);if(!m){M.zoom=null;return''}key=m.key;c=m.key?E.card(m.key):{n:m.n,kind:'mon',hp:m.max,atk:m.atk,id:m.id2,cost:0};owner=side===0?'Your monster':FOES()+' monster';
   if(E.guards(s,side).includes(m))tags.push('Guard: must be attacked first');if(m.sleep&&side===0)tags.push('Just played: attacks next turn');if(m.frozen>0)tags.push('Frozen: can\'t attack this turn');if(m.poison)tags.push('Poisoned: 1 damage each turn');if(m.mute)tags.push('Silenced: no power');
   if(side===0&&s.cur===0&&!s.over){acts=E.targets(s,0,m.uid).length?'<button class="dcm-b pri" data-dcm="attack">ATTACK</button>':''}}
  else if(z.t==='tree'){const g=s.p[z.side].grove[z.v];key=g.key;c=E.card(key);owner=(z.side===0?'Your':FOES())+' Grove'+(g.stump?' · chopped (grows back next turn)':'');if(z.side===0&&!g.stump&&s.cur===0&&!s.over)acts='<button class="dcm-b pri" data-dcm="chop:'+z.v+'">CHOP IT</button>'}
  else if(z.t==='pet'){key=P.pet;owner='Your Companion';c={n:E.short(INAME[key]||''),kind:'pet'}}
  const C=key&&D.ITEM[key],g=C?C.g:c.kind==='pet'?'pet':'reg';
  const gem=n=>'<span class="dcm-zcost"><i>'+n+'</i></span><small>Cost</small>';
  const stats=c.kind==='mon'?'<div class="dcm-zs">'+(m?'':gem(c.cost))+'<span class="dcm-atk big">'+(m?E.atkOf(s,side,m):c.atk)+'</span><small>ATK</small><span class="dcm-zhp">♥ '+(m?m.hp+'<small> / '+m.max+'</small>':c.hp)+'</span><small>HP</small></div>':
   c.kind==='tree'?'<div class="dcm-zs"><span class="dcm-zcost"><i>'+c.mana+'</i></span><small>Mana every time you chop it</small></div>':
   c.kind==='spell'?'<div class="dcm-zs">'+gem(E.costOf(s,0,c))+'</div>':'';
  const pw=c.kind==='mon'&&E.POW[c.id]&&!(m&&m.mute)?'<div class="dcm-zp"><b>Power</b><br>'+esc(E.POW[c.id])+'</div>':c.kind==='spell'&&E.SPELL[c.id]?'<div class="dcm-zp"><b>Spell</b><br>'+esc(E.SPELL[c.id].txt)+'</div>':c.kind==='pet'?'<div class="dcm-zp"><b>Companion power</b><br>'+esc(String(IDESC[key]||'').replace(/^Companion\. /,''))+'</div>':'';
  return'<div class="dcm-zoom" data-dcm="unzoom"><div class="dcm-zc"><div class="dcm-zbig"><img src="'+pic(c.kind==='pet'?key.replace(/^pc_/,''):key)+'" alt="'+esc(c.n)+'"></div>'+
   '<div class="dcm-zi"><div class="dcm-zn">'+esc(c.n)+'</div><span class="dcm-zk" style="background:'+(KCOL[g]||'#289890')+'">'+(KIND[g]||'COMPANION')+'</span>'+stats+pw+
   (tags.length?'<div class="dcm-zt">'+tags.map(esc).join('<br>')+'</div>':'')+'<div class="dcm-zt dim">'+esc(owner)+(FROM[g]?'<br>'+esc(FROM[g](String(c.n).toLowerCase())):'')+'</div>'+'<div class="dcm-zacts">'+acts+'<button class="dcm-b" data-dcm="unzoom">BACK</button></div>'+'</div></div>'+
   '<div class="dcm-zhint">Tap anywhere to go back to the table</div></div>'}
 // ---- movement: lunges, damage numbers, puffs, new cards ----
 const rectOf=sel=>{const e=el.querySelector(sel);return e?e.getBoundingClientRect():null};
 function snapshot(){const r={};el.querySelectorAll('[data-uid]').forEach(e=>{r[e.dataset.uid]=e.getBoundingClientRect()});const h0=rectOf('[data-dcm="h:h0"]'),h1=rectOf('[data-dcm="h:h1"]');if(h0)r.h0=h0;if(h1)r.h1=h1;return r}
 function pop(x,y,txt,cls){const d=document.createElement('span');d.className='dcm-pop '+(cls||'');d.textContent=txt;d.style.left=x+'px';d.style.top=y+'px';fxl.appendChild(d);setTimeout(()=>d.remove(),1100)}
 function playFx(fx,before){if(!fx||!fx.length)return;const now=snapshot();
  for(const f of fx){
   if(f.t==='atk'){const e=el.querySelector('[data-uid="'+f.a+'"]');if(e){const side=M.s.p[0].board.some(m=>m.uid===f.a)?0:1;e.classList.add(side?'lunge-dn':'lunge-up');setTimeout(()=>e.classList.remove('lunge-up','lunge-dn'),420)}}
   else if(f.t==='dmg'){const r=now[f.to]||before[f.to];if(r)pop(r.left+r.width/2,r.top+r.height*.35,'-'+f.n,'dmg');const e=el.querySelector('[data-uid="'+f.to+'"]')||el.querySelector('[data-dcm="h:'+f.to+'"]');if(e){e.classList.add('hit');setTimeout(()=>e.classList.remove('hit'),350)}}
   else if(f.t==='chop'){const e=el.querySelectorAll('.dcm-grove'+(f.side?'.foe':'.me')+' .dcm-tree')[f.g];if(e){e.classList.add('chopped');setTimeout(()=>e.classList.remove('chopped'),420)}}
   else if(f.t==='play'){const e=el.querySelector('[data-uid="'+f.uid+'"]');if(e){e.classList.add('arrive');setTimeout(()=>e.classList.remove('arrive'),500)}}}
  // monsters that fell: a puff where they stood
  for(const uid in before){if(uid[0]!=='m')continue;if(!now[uid]){const r=before[uid];pop(r.left+r.width/2,r.top+r.height/2,'','puff')}}}
 let lastTurn=-1;function banner(){if(!M)return;const s=M.s;if(s.cur===lastTurn||s.over)return;lastTurn=s.cur;const b=document.createElement('span');b.className='dcm-banner'+(s.cur?' ace':'');b.textContent=s.cur?FOES().toUpperCase()+' TURN':'YOUR TURN';fxl.appendChild(b);setTimeout(()=>b.remove(),1300)}
 function redraw(fx){const before=snapshot();render();playFx(fx,before);banner()}
 // ---- input ----
 function act(mv){if(M.pvp&&(M.s.cur!==0||M.s.over))return false;const r=E.apply(M.s,0,mv);if(!r&&M.pvp)try{M.pvp.send(mv)}catch(e){self.SQERR&&SQERR(e,'262-23')}M.msg=r||'';if(!r){M.sel=null;M.aim=null;M.zoom=null;M.att=null}
  try{sfx(r?'swish':mv.t==='atk'?'hit':mv.t==='chop'?'chop':'pickup')}catch(e){self.SQERR&&SQERR(e,'262-1')}after(r?[]:M.s.fx.slice());return!r}
 function after(fx){redraw(fx);const s=M.s;if(s.over){finish();return}if(s.cur===1&&!M.busy&&!M.pvp)aceRun()}
 function aceRun(){M.busy=true;const step=()=>{if(!M||M.s.over||M.s.cur!==1){if(M)M.busy=false;if(M)after([]);return}const n0=M.s.p[0].hand.length;const mv=aceMove(M.s,1,M.lv);const r=E.apply(M.s,1,mv);const fx=M.s.fx.slice();if(r){E.apply(M.s,1,{t:'end'})}
   M.msg='';
   if(mv.t==='end'||r){if(Math.random()<.3)M.say=ACE_LINES[Math.floor(Math.random()*ACE_LINES.length)];else M.say=''}
   if(M.s.cur===0){const n=M.s.p[0].hand.length;M.newCards=n>n0?[n-1]:null}
   try{sfx(mv.t==='atk'?'hit':mv.t==='chop'?'chop':'pickup')}catch(e){self.SQERR&&SQERR(e,'262-2')}redraw(fx);M.newCards=null;if(M.s.over){M.busy=false;finish();return}if(M.s.cur!==1){M.busy=false;redraw([]);return}setTimeout(step,window.SQDCMFAST?0:700)};setTimeout(step,window.SQDCMFAST?0:700)}
 function finish(){const s=M.s;if(M.done)return;M.done=true;M.zoom=null;M.aim=null;
  if(M.pvp){M.say='';M.msg=s.win===0?'You beat '+FOE()+'!':FOE()+' wins this one.';try{M.pvp.done(s.win===0?'w':'l')}catch(e){self.SQERR&&SQERR(e,'262-24')}render();return}
  if(s.win===0){const L=LV[M.lv],first=WINS[M.lv]!==today(),g=first?L.g:Math.round(L.g/10);GLD+=g;WINS[M.lv]=today();M.msg='You beat Ace on '+L.n+'! +'+g+' gold'+(first?'':' (full reward once a day)')+'.';M.say='Well played! Come back any time.';
   try{SQACH&&SQACH.add&&SQACH.add('dcwin',1);SQACH.check&&SQACH.check()}catch(e){self.SQERR&&SQERR(e,'262-3')}try{sfx('quest')}catch(e){self.SQERR&&SQERR(e,'262-4')}}
  else{M.msg='Ace wins this one. Tweak your deck in the Card Binder and try again!';M.say='Better luck next time!';try{sfx('swish')}catch(e){self.SQERR&&SQERR(e,'262-5')}}
  try{saveLocal(true)}catch(e){self.SQERR&&SQERR(e,'262-6')}render()}
 function zoomTo(z){M.zoom=z;M.msg='';render();try{sfx('talk')}catch(e){self.SQERR&&SQERR(e,'262-12')}}
 function unzoom(){M.zoom=null;render()}
 el.addEventListener('click',e=>{if(!M)return;const b=e.target.closest('[data-dcm]');if(!b)return;e.stopPropagation();const a=b.dataset.dcm,s=M.s,P=s.p[0];const[x,y]=[a.split(':')[0],a.slice(a.indexOf(':')+1)];
  // inside the close-up: its buttons act; anywhere else goes back to the table
  if(M.zoom){if(a==='play'){playSel(M.zoom.v);return}if(a==='attack'){const uid=M.zoom.v;M.zoom=null;M.sel={t:'mon',v:uid};M.att=uid;M.aim=E.targets(s,0,uid);M.msg='Pick what to attack.';render();return}
   if(x==='chop'){M.zoom=null;act({t:'chop',g:+y});return}unzoom();return}
  if(a!=='leave')M.leaveArm=false;
  if(a==='leave'){if(!s.over&&!M.leaveArm){M.leaveArm=true;M.msg='Tap LEAVE again to give up (it counts as a loss'+(M.pvp?' and '+FOE()+' takes the stakes':'')+').';render();return}if(M.pvp&&!s.over){try{M.pvp.leave()}catch(e){self.SQERR&&SQERR(e,'262-25')}return}close();return}
  if(a==='again'){start(M.lv);return}if(a==='cancel'){M.sel=null;M.aim=null;M.att=null;M.msg='';render();return}
  // picking a target
  if(M.aim&&(x==='m'||x==='h')){if(M.aim.includes(y)){if(M.sel.t==='hand')act({t:'play',h:M.sel.v,tg:y});else act({t:'atk',a:M.sel.v,tg:y});return}M.msg='That isn\'t a target. Pick a glowing one, or CANCEL.';render();return}
  if(a==='end'){if(!s.over&&s.cur===0&&!M.busy)act({t:'end'});return}
  if(x==='c'){zoomTo({t:'hand',v:+y});return}
  if(x==='m'){zoomTo({t:'mon',v:y});return}
  if(x==='g'||x==='gx'){zoomTo({t:'tree',v:+y,side:x==='g'?0:1});return}
  if(x==='h'&&y==='h0'&&P.pet){zoomTo({t:'pet'});return}});
 function playSel(i){const s=M.s,P=s.p[0];if(s.over||s.cur!==0||M.busy)return;const k=P.hand[i];M.zoom=null;if(k==='_sapling'){act({t:'play',h:i});return}const c=E.card(k);
  if(c.kind==='tree'){act({t:'plant',h:i});return}if(c.kind==='spell'){const ts=E.spellTargets(s,0,c);if(ts){if(!ts.length){M.msg='There\'s nothing to use it on.';render();return}M.sel={t:'hand',v:i};M.aim=ts;M.msg='Pick a target for '+c.n+'.';render();return}}act({t:'play',h:i})}
 // Esc, or the controller's ○, goes back: close-up first, then a target pick
 const back=()=>{if(!M)return false;if(M.zoom){unzoom();return true}if(M.aim){M.sel=null;M.aim=null;M.att=null;M.msg='';render();return true}return false};
 addEventListener('keydown',e=>{if(!M||el.style.display==='none')return;if(e.key==='Escape'){if(back()){e.preventDefault();e.stopPropagation()}}},true);
 let padO=true;(function tick(){requestAnimationFrame(tick);if(!M||el.style.display==='none')return;try{const ps=navigator.getGamepads?navigator.getGamepads():[];let o=false;for(const p of ps)if(p&&p.buttons&&p.buttons[1]&&p.buttons[1].pressed)o=true;if(o&&!padO)back();padO=o}catch(e){/*quiet*/}})();
 SQNAVROOT.wrap('262',_n=>function(){if(M&&el.style.display!=='none'){const z=el.querySelector('.dcm-zoom');return z||el}return _n.apply(this,arguments)});
 // ---- starting ----
 function deckOf(){const d=B.decks[B.active];return d?d:null}
 function start(lv){const d=deckOf();const P=d?B.problems(d).filter(p=>!/^Optional/.test(p)):['No deck.'];
  if(P.length){say('Your deck isn\'t ready: '+P[0]+' (Card Binder > Decks)');msgT=5;try{sfx('swish')}catch(e){self.SQERR&&SQERR(e,'262-7')}return false}
  const mine=[];for(const k in d.c)for(let i=0;i<d.c[k];i++)mine.push(k);
  const s=E.create({seed:(Math.random()*2147483647)|0,decks:[mine,aceDeck(lv)],pets:[d.pet,null],names:[(window.SQMP&&SQMP.user&&String(SQMP.user.displayName||'').split(' ')[0])||'You','Ace']});
  lastTurn=0;M={s,lv,sel:null,aim:null,zoom:null,att:null,say:'Let\'s see what you\'ve got!',msg:'Plant a tree, chop it for Mana, play your cards. Good luck!',busy:false,done:false,leaveArm:false};
  try{closePanel()}catch(e){self.SQERR&&SQERR(e,'262-8')}el.style.display='flex';render();try{sfx('talk')}catch(e){self.SQERR&&SQERR(e,'262-9')}return true}
 function close(){if(M&&!M.s.over&&!M.done){M.s.over=true;M.s.win=1}M=null;el.style.display='none'}
 // Ace's panel: pick a level (replaces 258's "coming soon" button)
 SQRPN.wrap('262 ace',_r=>function(){const out=_r.apply(this,arguments);try{if(ptab==2&&shop==='cardsharp'){const b=pbd.querySelector('[data-dcs2="match"]');if(b){
   const box=document.createElement('div');box.className='dcm-lv';box.innerHTML='<div class="dcm-lvt">Play a match against Ace (your deck: <b>'+esc((deckOf()||{}).n||'none')+'</b>)</div>'+Object.keys(LV).map(k=>'<button class="sb" data-dcmlv="'+k+'">'+LV[k].n+' · win '+(WINS[k]===today()?Math.round(LV[k].g/10)+' gold (again today)':LV[k].g+' gold')+'</button>').join('');b.replaceWith(box)}}}catch(e){self.SQERR&&SQERR(e,'262-10')}return out});
 pbd.addEventListener('click',e=>{const b=e.target.closest('[data-dcmlv]');if(!b)return;e.stopPropagation();e.preventDefault();start(b.dataset.dcmlv)},true);
 // achievement
 try{if(!SQACH.A.some(a=>a.id==='dc_win'))SQACH.A.push({g:'Drop Card',id:'dc_win',n:'Card shark',d:'Win a Drop Card match.',val:()=>(SQACH.counters&&SQACH.counters.dcwin)|0,goal:1,gold:500})}catch(e){self.SQERR&&SQERR(e,'262-11')}
 const st=document.createElement('style');st.textContent=
  '#sqdcm{position:fixed;inset:0;z-index:40;padding:calc(env(safe-area-inset-top,0px) + 8px) 8px calc(env(safe-area-inset-bottom,0px) + 8px);background:repeating-linear-gradient(0deg,#5a3418 0 22px,#4a2a12 22px 24px),#5a3418;color:#f4f0d8;font-family:var(--pf);box-sizing:border-box;overflow:hidden}'+
  '#sqdcm button{font-family:var(--pf);color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}#sqdcm img{image-rendering:pixelated}'+
  '.dcm-wood{position:relative;width:100%;height:100%;display:flex}'+
  '.dcm-felt{position:relative;flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;padding:8px 10px;border-radius:18px;border:4px solid #2a160a;box-shadow:inset 0 0 0 3px #8a5a30,inset 0 0 60px rgba(0,0,0,.45);background:radial-gradient(ellipse at center,#3a7a4a 0%,#2a5e38 60%,#1f4a2c 100%);overflow:auto}'+
  '.dcm-r1,.dcm-r5{display:flex;align-items:center;gap:10px;position:relative}.dcm-r5{align-items:flex-end}'+
  // heroes
  '.dcm-hero{display:flex;align-items:center;gap:8px;padding:0;background:none;border:0;border-radius:12px;flex:0 0 auto}'+
  '.dcm-face{width:64px;height:64px;border-radius:50%;background:radial-gradient(circle at 50% 35%,#d8e4f4,#8aa0c0);border:4px solid #e8c050;box-shadow:0 0 0 3px #4a2a12,0 4px 8px rgba(0,0,0,.5);overflow:hidden;display:flex;align-items:flex-end;justify-content:center}'+
  '.dcm-face img{width:100%;height:100%;display:block}'+
  '.dcm-hn{display:flex;flex-direction:column;align-items:flex-start;gap:2px;font-size:14px;text-shadow:0 2px 0 rgba(0,0,0,.5)}.dcm-heart{background:#c02838;color:#fff;font-weight:700;font-size:15px;padding:1px 8px;border:2px solid #601018;border-radius:10px}'+
  '.dcm-hero.aim .dcm-face{box-shadow:0 0 0 3px #f04040,0 0 18px 6px rgba(240,64,64,.75);animation:dcmPulse .8s infinite alternate}'+
  '.dcm-say{position:absolute;left:150px;top:4px;max-width:220px;background:#f8f0d8;color:#282028;font-size:13px;padding:5px 9px;border:3px solid #485870;border-radius:10px;z-index:3;animation:dcmIn .25s}'+
  '.dcm-pet{display:flex;flex-direction:column;align-items:center;font-size:10px;margin-left:-4px}.dcm-pet img{width:34px;height:34px;background:#f8f0d8;border:3px solid #289890;border-radius:50%}'+
  '.dcm-me{display:flex;align-items:flex-end;gap:6px;flex:0 0 auto}'+
  // groves
  '.dcm-grove{display:flex;flex-direction:column;gap:2px;min-width:0}.dcm-grove.foe{margin-left:auto}.dcm-gl{font-size:12px;opacity:.85;text-align:right}'+
  '.dcm-gt{display:flex;gap:4px;align-items:flex-end;min-height:52px;background:rgba(0,0,0,.18);border-radius:10px;padding:3px 6px}'+
  '.dcm-tree{position:relative;width:44px;height:52px;padding:0;background:none;border:0;display:flex;align-items:flex-end;justify-content:center}.dcm-tree img{width:44px;height:52px;object-fit:contain}'+
  '.dcm-tree.stump img{width:28px;height:21px}.dcm-tree.plan img{filter:drop-shadow(0 0 4px #f8d048) drop-shadow(0 0 2px #f8d048)}.dcm-tree.plan::after{content:"🪓";position:absolute;top:-6px;right:-4px;font-size:14px}'+
  '.dcm-tm{position:absolute;right:-3px;bottom:-3px;width:18px;height:18px;border-radius:50%;background:#3a6ad8;border:2px solid #102858;display:flex;align-items:center;justify-content:center;font:700 11px var(--pf);color:#fff}.dcm-tm.used{background:#58607a}'+
  '.dcm-gems{display:flex;align-items:center;gap:3px;font-size:12px}.dcm-gems i{width:12px;height:12px;transform:rotate(45deg);background:#28305a;border:2px solid #102858}.dcm-gems i.on{background:#5a8af8;box-shadow:0 0 6px #8ab0ff}.dcm-gems span{margin-left:6px;text-shadow:0 1px 0 #000}'+
  // Ace's hand and the log
  '.dcm-ahand{display:flex;justify-content:center;flex:1;min-width:60px;height:56px}.dcm-back{width:34px;height:48px;margin:0 -9px;border-radius:5px;border:3px solid #f8f0d8;background:repeating-linear-gradient(45deg,#3048a0 0 4px,#2a3c88 4px 8px);box-shadow:0 3px 6px rgba(0,0,0,.4);transform:rotate(calc(var(--i)*6deg)) translateY(calc(var(--i)*var(--i)*1px))}'+
  '.dcm-log{width:170px;flex:0 0 auto;font-size:11px;line-height:1.3;background:rgba(0,0,0,.28);border-radius:8px;padding:4px 8px;max-height:70px;overflow:hidden}.dcm-log b{font-size:11px;opacity:.75}.dcm-log div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
  // boards
  '.dcm-board{display:flex;justify-content:center;align-items:center;gap:26px;min-height:100px;flex:1;padding:8px 4px}.dcm-board.foe{border-bottom:2px dashed rgba(255,255,255,.12)}'+
  '.dcm-slot{position:relative;transition:transform .2s}.dcm-card{position:relative;display:block;width:68px;height:95px;padding:0;background:none;border:0;border-radius:8px}.dcm-card img{width:100%;height:100%;display:block;object-fit:cover;border-radius:6px;box-shadow:0 4px 8px rgba(0,0,0,.45)}'+
  '.dcm-spider{font-size:40px;background:#f8f0d8;border:3px solid #485870}'+
  '.dcm-card.rdy img{box-shadow:0 0 0 3px #78e070,0 0 14px 4px rgba(120,224,112,.6)}.dcm-card.att img{box-shadow:0 0 0 3px #f8d048,0 0 16px 6px rgba(248,208,72,.8)}.dcm-card.grd img{outline:3px solid #a8c0e0;outline-offset:2px}'+
  '.dcm-card.aim img,.dcm-spider.aim{box-shadow:0 0 0 3px #f04040,0 0 16px 6px rgba(240,64,64,.75);animation:dcmPulse .8s infinite alternate}'+
  '.dcm-atk,.dcm-hp{position:absolute;bottom:-8px;width:24px;height:24px;font:700 13px var(--pf);display:flex;align-items:center;justify-content:center;border:2px solid;border-radius:50%;pointer-events:none}.dcm-atk{left:-8px;background:#f0a020;color:#281808;border-color:#603808}.dcm-hp{right:-8px;background:#c02838;color:#fff;border-color:#601018;border-radius:6px}.dcm-hp.hurt{color:#ffc0c0}'+
  '.dcm-tag{position:absolute;top:-10px;left:50%;transform:translateX(-50%);white-space:nowrap;background:#485870;color:#fff;font:700 9px var(--pf);padding:1px 5px;border-radius:6px;pointer-events:none}'+
  '.dcm-empty{opacity:.55;font-size:13px}'+
  // middle strip
  '.dcm-mid{display:flex;align-items:center;gap:10px;justify-content:center;min-height:26px;flex-wrap:wrap}.dcm-ribbon{background:#f8d048;color:#3a2008;font-weight:700;font-size:14px;padding:3px 14px;border-radius:4px;box-shadow:0 2px 0 #8a6010}.dcm-ribbon.ace{background:#d8d8e8;color:#303048;box-shadow:0 2px 0 #606078}.dcm-ribbon.over{background:#78e070;color:#143a10;box-shadow:0 2px 0 #2a6a22}'+
  '.dcm-msg{font-size:13px;color:#fff6c8;text-shadow:0 1px 0 #000}.dcm-lvn{font-size:11px;opacity:.6}'+
  // your hand
  '.dcm-hand{flex:1;display:flex;justify-content:center;align-items:flex-end;min-width:0;padding:10px 0 8px}.dcm-hand .dcm-card{width:72px;height:100px;margin:0 -6px;transform:rotate(calc(var(--r)*4deg)) translateY(calc(var(--r)*var(--r)*1.5px));transition:transform .15s}'+
  '.dcm-hand .dcm-card:hover,.dcm-hand .dcm-card.gpf{transform:translateY(-14px) scale(1.06);z-index:2}.dcm-hand .dcm-card.ok img{box-shadow:0 0 0 3px #78e070,0 0 12px 3px rgba(120,224,112,.5)}.dcm-hand .dcm-card.no img{filter:saturate(.55) brightness(.75)}'+
  '.dcm-sap{font-size:38px;background:#f8f0d8;border:3px solid #3a7a2a!important;display:flex!important;align-items:center;justify-content:center}'+
  '.dcm-cost{position:absolute;left:-6px;top:-6px;width:24px;height:24px;transform:rotate(45deg);background:#3a6ad8;color:#fff;font:700 13px var(--pf);display:flex;align-items:center;justify-content:center;border:2px solid #102858;pointer-events:none}.dcm-cost.tree{background:#3a8a3a;border-color:#143a10}'+
  '.dcm-card.drawn{animation:dcmDraw .45s ease-out}'+
  // buttons
  '.dcm-btns{display:flex;flex-direction:column;align-items:center;gap:6px;flex:0 0 auto}.dcm-end{width:84px;height:84px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#ffe680,#f0b020);color:#3a2008!important;border:4px solid #6a4410;box-shadow:0 5px 0 #4a2a08,0 8px 14px rgba(0,0,0,.4);font-weight:700;font-size:15px;line-height:1.1}.dcm-end:disabled{filter:grayscale(.8) brightness(.8);box-shadow:0 3px 0 #4a2a08}'+
  '.dcm-b{min-height:44px;min-width:44px;padding:6px 14px;background:#f8f8f8;color:#282028!important;border:3px solid #485870;border-radius:8px;font-weight:700}.dcm-b.pri{background:#78e070;border-color:#2a6a22}.dcm-b.small{min-height:36px;font-size:12px;padding:4px 10px}.dcm-b:disabled{opacity:.45}'+
  // the close-up
  '.dcm-zoom{position:absolute;inset:0;z-index:5;background:rgba(10,8,16,.74);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;animation:dcmFade .15s;cursor:pointer}'+
  '.dcm-zc{display:flex;align-items:center;gap:30px;max-width:94%;animation:dcmZoom .2s ease-out}.dcm-zbig{flex:0 0 auto;filter:drop-shadow(0 14px 22px rgba(0,0,0,.6))}.dcm-zbig img{width:240px;height:336px;display:block;border-radius:10px}.dcm-sapbig{font-size:120px;width:240px;text-align:center}'+
  '.dcm-zi{width:340px;max-width:46vw;background:#f8f0d8;color:#282028;border:4px solid #485870;border-radius:10px;box-shadow:inset 0 0 0 3px #a8c0e0;padding:16px 18px;display:flex;flex-direction:column;gap:10px;cursor:default}'+
  '.dcm-zn{font-size:24px;font-weight:700}.dcm-zk{align-self:flex-start;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:8px}'+
  '.dcm-zs{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.dcm-zs small{font-size:13px;margin-right:10px}.dcm-zcost{margin:0 6px 0 3px;width:28px;height:28px;transform:rotate(45deg);background:#3a6ad8;border:3px solid #102858;display:inline-flex;align-items:center;justify-content:center}.dcm-zcost i{transform:rotate(-45deg);color:#fff;font-style:normal;font-weight:700}'+
  '.dcm-atk.big{position:static;width:32px;height:32px;font-size:16px}.dcm-zhp{color:#c02838;font-weight:700;font-size:20px}.dcm-zhp small{color:#282028;font-size:13px}'+
  '.dcm-zp{background:#fff;border:2px solid #c8d0e0;border-radius:8px;padding:8px 10px;font-size:14px;line-height:1.4}.dcm-zt{font-size:13px;line-height:1.45}.dcm-zt.dim{color:#505060}.dcm-zw{font-size:13px;color:#a03020;align-self:center}'+
  '.dcm-zacts{display:flex;gap:8px;flex-wrap:wrap}.dcm-zhint{color:#f8f0d8;font-size:14px;opacity:.85;pointer-events:none}'+
  // movement
  '.dcm-fxl{position:fixed;inset:0;pointer-events:none;z-index:6;overflow:hidden}.dcm-pop{position:fixed;transform:translate(-50%,-50%);font:700 26px var(--pf);color:#ff4848;text-shadow:0 2px 0 #300,0 0 6px #000;animation:dcmPop 1.05s ease-out forwards}'+
  '.dcm-pop.puff{width:70px;height:70px;border-radius:50%;background:radial-gradient(circle,rgba(240,240,240,.9),rgba(200,200,200,.35) 55%,transparent 70%);animation:dcmPuff .6s ease-out forwards}'+
  '.dcm-banner{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);font:700 40px var(--pf);color:#3a2008;background:#f8d048;padding:10px 40px;border:4px solid #6a4410;box-shadow:0 8px 20px rgba(0,0,0,.5);animation:dcmBan 1.25s ease-in-out forwards;white-space:nowrap}.dcm-banner.ace{background:#d8d8e8;color:#303048;border-color:#606078}'+
  '.lunge-up{transform:translateY(-34px) scale(1.08);z-index:3}.lunge-dn{transform:translateY(34px) scale(1.08);z-index:3}.hit{animation:dcmShake .3s}.chopped{animation:dcmShake .35s}.arrive{animation:dcmArrive .45s ease-out}'+
  '@keyframes dcmPulse{to{filter:brightness(1.25)}}@keyframes dcmIn{from{opacity:0;transform:translateY(6px)}}@keyframes dcmFade{from{opacity:0}}@keyframes dcmZoom{from{transform:scale(.85);opacity:.3}}'+
  '@keyframes dcmPop{0%{opacity:0;margin-top:6px}15%{opacity:1}100%{opacity:0;margin-top:-44px}}@keyframes dcmPuff{from{opacity:1;transform:translate(-50%,-50%) scale(.4)}to{opacity:0;transform:translate(-50%,-50%) scale(1.5)}}'+
  '@keyframes dcmBan{0%{opacity:0;transform:translate(-50%,-50%) scale(.7)}15%,75%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.05)}}'+
  '@keyframes dcmShake{25%{translate:-4px 0}50%{translate:4px 0}75%{translate:-2px 0}}@keyframes dcmArrive{from{transform:scale(1.35) translateY(-20px);opacity:.2}}@keyframes dcmDraw{from{transform:translate(120px,40px) rotate(20deg);opacity:0}}'+
  '@media (prefers-reduced-motion:reduce){#sqdcm *,.dcm-fxl *{animation:none!important;transition:none!important}}'+
  '.dcm-lv{margin-top:6px}.dcm-lvt{font-size:14px;margin:6px 0}'+
  // phones (landscape, short screens)
  '@media (max-height:500px){#sqdcm{padding:calc(env(safe-area-inset-top,0px) + 3px) calc(env(safe-area-inset-right,0px) + 4px) calc(env(safe-area-inset-bottom,0px) + 3px) calc(env(safe-area-inset-left,0px) + 4px)}.dcm-felt{gap:2px;padding:4px 8px;border-width:3px}'+
  '.dcm-face{width:42px;height:42px;border-width:3px}.dcm-hn{font-size:11px}.dcm-heart{font-size:12px;padding:0 6px}.dcm-say{left:110px;top:0;font-size:11px;max-width:170px}'+
  '.dcm-log{display:none}.dcm-ahand{height:34px}.dcm-back{width:22px;height:31px;border-width:2px;margin:0 -6px}.dcm-gt{min-height:36px;padding:2px 4px}.dcm-tree,.dcm-tree img{width:28px;height:34px}.dcm-tree.stump img{width:22px;height:16px}.dcm-gl{font-size:10px}'+
  '.dcm-board{min-height:64px;padding:4px 2px;gap:20px}.dcm-card{width:46px;height:64px}.dcm-hand .dcm-card{width:50px;height:70px;margin:0 -4px}.dcm-hand{padding:4px 0 9px}.dcm-atk,.dcm-hp{width:19px;height:19px;font-size:11px;bottom:-6px}.dcm-cost{width:19px;height:19px;font-size:11px}'+
  '.dcm-mid{min-height:18px;gap:6px}.dcm-ribbon{font-size:11px;padding:1px 8px}.dcm-msg{font-size:11px}.dcm-lvn{display:none}.dcm-end{width:60px;height:60px;font-size:12px;border-width:3px}.dcm-b{min-height:38px;padding:3px 10px}.dcm-b.small{min-height:30px;font-size:11px}.dcm-pet img{width:24px;height:24px}.dcm-pet small{display:none}'+
  '.dcm-zc{gap:16px}.dcm-zbig img{width:170px;height:238px}.dcm-sapbig{width:150px;font-size:80px}.dcm-zi{padding:10px 12px;gap:6px;max-height:78vh;overflow:auto}.dcm-zn{font-size:18px}.dcm-zp{font-size:12px;padding:6px 8px}.dcm-zt{font-size:11px}.dcm-zhint{font-size:11px}.dcm-zoom{gap:6px}.dcm-banner{font-size:26px}}'+
  // tall, narrow phones (portrait): stack the hand under the grove
  '@media (max-width:640px) and (min-height:501px){.dcm-r5{flex-wrap:wrap}.dcm-hand{order:5;flex-basis:100%}.dcm-log{display:none}.dcm-card{width:54px;height:76px}.dcm-hand .dcm-card{width:56px;height:78px}.dcm-zc{flex-direction:column;gap:10px}.dcm-zbig img{width:170px;height:238px}.dcm-zi{max-width:90vw}}';
 document.head.appendChild(st);
 // ---- against a player (263) ----
 function foeMove(mv){if(!M||!M.pvp||M.s.over)return'over';if(M.s.cur!==1)return'not their turn';const n0=M.s.p[0].hand.length;const r=E.apply(M.s,1,mv);if(r)return r;
  if(M.s.cur===0){const n=M.s.p[0].hand.length;M.newCards=n>n0?[n-1]:null;M.msg=''}try{sfx(mv.t==='atk'?'hit':mv.t==='chop'?'chop':'pickup')}catch(e){self.SQERR&&SQERR(e,'262-26')}
  redraw(M.s.fx.slice());M.newCards=null;if(M.s.over)finish();return''}
 function startPvp(o){lastTurn=-1;const s=E.create({seed:o.seed,decks:o.decks,pets:o.pets,names:o.names});if(!o.first)E.mirror(s);
  M={s,lv:'normal',pvp:o.pvp,sel:null,aim:null,zoom:null,att:null,say:'',msg:s.cur===0?'You go first. Plant a tree, chop it for Mana, play your cards!':o.pvp.name+' goes first. You get the Sapling.',busy:false,done:false,leaveArm:false};
  try{closePanel()}catch(e){self.SQERR&&SQERR(e,'262-27')}el.style.display='flex';render();banner();try{sfx('talk')}catch(e){self.SQERR&&SQERR(e,'262-28')}return M}
 function endPvp(t){if(!M||!M.pvp)return;if(!M.s.over){M.s.over=true;M.done=true;M.zoom=null;M.aim=null}if(t)M.msg=t;render()}
 // Nov 21: the table covers the whole screen but the game kept running behind it, so players starved (6 of the first 25 deaths in the
 // death log were "Starving!", one of them mid-match) or were hit by monsters they couldn't see. While the table is open your HP can't
 // go down and hunger stays where it was, like 134's chess boards.
 {let held=false,hv=0,h0=null;const open=()=>el.style.display!=='none'&&!!M;
  SQUPD.before('262 safe at the table',()=>{const w=open();
   if(w&&!held){const d=Object.getOwnPropertyDescriptor(P,'hp');if(!d||!d.get){hv=P.hp;Object.defineProperty(P,'hp',{configurable:true,enumerable:true,get(){return hv},set(v){if(v>hv)hv=v}});held=true}}
   else if(!w&&held){const d=Object.getOwnPropertyDescriptor(P,'hp');if(d&&d.get){const v=hv;delete P.hp;P.hp=v}held=false}
   if(w){if(h0===null&&typeof hunger==='number')h0=hunger}else h0=null});
  SQUPD.after('262 fed at the table',()=>{if(h0!==null&&open()&&typeof hunger==='number'&&hunger<h0)hunger=h0})}
 window.SQDCM={start,close,aceMove,get m(){return M},LV,el,render,act,startPvp,foeMove,endPvp,deckOf}})();
