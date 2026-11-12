// ---- 141. Emotes and parties ----
// Emotes: START > Emotes (or /wave, /bow, /dance, /cheer, /laugh, /love, /yes, /no, /think, /sit, /sleep in chat; G on a
// keyboard opens the list): your character acts them out (see below). Other players see it too: the
// emote travels in your multiplayer position as em = "<kind>:<number>" (061 reads r.em).
// Parties: up to 4 players. Invite from the player menu (tap someone's name); they get a JOIN pop-up. The invite goes
// through dreq/<to>/<from> with k:'party' and s = the party id (section 135 hands those to SQPARTYINV). Each member
// shows their party id in their position (pt), so a party is everyone online with the same pt. Members see each other
// on the map and the minimap (green), get a party list on the HUD with health, a ★ over each other's heads, +10% XP
// while a party member is close by (same area, within 20 steps), and "/p message" sends a message to the party.
// START > Party lists the members and has LEAVE PARTY. The party id is kept on the device for 2 hours.
(()=>{const Mp=()=>window.SQMP,Fm=()=>window.SQFB,on=()=>!!(Mp()&&Mp().on&&Mp().user&&Fm()),me=()=>Mp().user.uid,ref=p=>Fm().db.ref(Fm().D,p);
 const live=r=>!!r&&performance.now()-r.seen<20000;
 const LSG=k=>{try{return localStorage.getItem(k)}catch(e){return null}},LSS=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}};
 // ======== emotes: your character acts them out ========
 // The character is drawn into a small canvas (anchor 24,44 like 114's crouch), changed there (an arm raised, the head
 // lowered or shaken, sitting) and put back with a hop or a sway; little pixel effects (hearts, notes, confetti, Z's,
 // "ha!", thinking dots) rise around it. Your own emote stops when you walk.
 const EM={wave:{n:'Wave',ic:'👋',d:3},bow:{n:'Bow',ic:'🙇',d:2.6},dance:{n:'Dance',ic:'💃',d:5},cheer:{n:'Cheer',ic:'🎉',d:3},laugh:{n:'Laugh',ic:'😂',d:3},
  love:{n:'Love',ic:'❤️',d:3},yes:{n:'Yes',ic:'👍',d:2.2},no:{n:'No',ic:'👎',d:2.2},think:{n:'Hmm',ic:'🤔',d:4},sit:{n:'Sit',ic:'🪑',d:30},sleep:{n:'Sleep',ic:'💤',d:30}};
 let MINE=null,SEQ=0,MX=0,MY=0;// {k, at}
 function emote(k){if(!EM[k]||dead||SAILING)return false;MINE={k,at:performance.now()};MX=P.x;MY=P.y;SEQ++;try{sfx('talk')}catch(e){}return true}
 const live1=(k,at)=>k&&EM[k]&&(performance.now()-at)/1000<EM[k].d;
 const OFF=document.createElement('canvas');OFF.width=48;OFF.height=56;OFF.hd2=true;const OX=OFF.getContext('2d');
 const INK='#282030';
 const shirtOf=ch=>{try{return OPT.shirt[ch.sh]}catch(e){return'#48a048'}},skinOf=ch=>{try{return OPT.skin[ch.sk][0]}catch(e){return'#f0c8a0'}};
 // a raised arm at column cx (the arm's own column), swaying by sw
 // a raised arm on the right (side 1) or left (side -1) of the body: the hanging hand is taken away, a 2-wide arm goes up
 // from the shoulder (sleeve, then the hand), outlined; sw sways the hand
 function armUp(ch,side,sw){const e=side>0?30:17,x0=side>0?31:15;OX.clearRect(side>0?30:16,41,2,6);OX.fillStyle=INK;OX.fillRect(e,41,1,5);
  OX.fillRect(x0-1+sw,32,4,6);OX.fillRect(x0-1,37,4,6);OX.fillStyle=shirtOf(ch);OX.fillRect(x0,38,2,4);OX.fillStyle=skinOf(ch);OX.fillRect(x0+sw,33,2,4)}
 const R=(C,x,y,w,h,c)=>{C.fillStyle=c;C.fillRect(Math.round(x),Math.round(y),w,h)};
 function act(ch,dir,st,ox,oy,fl,k,t,inner){const C=GC||g,X=Math.round(ox)-24,Y=Math.round(oy)-44;let d=dir,f=fl,s=0,dy=0,dx=0;
  if(k==='dance'){const ph=Math.floor(t*4)%4;d=[0,2,1,2][ph];f=ph===3;s=ph%2?1:2;dy=-Math.round(Math.abs(Math.sin(t*Math.PI*4))*2)}
  if(k==='cheer')dy=-Math.round(Math.abs(Math.sin(t*Math.PI*3))*4);
  if(k==='laugh')dy=Math.floor(t*10)%2?-1:0;
  if(k==='love')dx=Math.round(Math.sin(t*4));
  OX.setTransform(1,0,0,1,0,0);OX.clearRect(0,0,48,56);OX.imageSmoothingEnabled=false;GC=OX;try{inner(ch,d,s,24,44,f)}finally{GC=C}
  if(k==='wave')armUp(ch,1,Math.floor(t*5)%2?1:-1);
  if(k==='cheer'){armUp(ch,1,0);armUp(ch,-1,0)}
  const sm=C.imageSmoothingEnabled;C.imageSmoothingEnabled=false;
  if(k==='bow'||k==='yes'||k==='no'){// the head moves: rows above the shoulders
   const hy=k==='bow'?(t<2?Math.min(4,Math.round(t*8)):0):k==='yes'?(Math.floor(t*5)%2?2:0):0,hx=k==='no'?(Math.floor(t*6)%2?2:-1):0;
   C.drawImage(OFF,0,40,48,16,X+dx,Y+40+dy,48,16);C.drawImage(OFF,0,0,48,40,X+dx+hx,Y+dy+hy,48,40)}
  else if(k==='sit'||k==='sleep'){C.drawImage(OFF,0,0,48,41,X,Y+4,48,41);C.drawImage(OFF,0,41,48,11,X,Y+45,48,6)}
  else C.drawImage(OFF,X+dx,Y+dy);
  C.imageSmoothingEnabled=sm;
  // effects
  const hx0=Math.round(ox),hy0=Math.round(oy)-20,E=EM[k],fade=Math.min(1,(E.d-t)/.4);C.save();C.globalAlpha=Math.max(0,fade);
  const rise=(i,n,sp)=>((t*sp+i/n)%1);
  if(k==='love')for(let i=0;i<4;i++){const u=rise(i,4,.7),x=hx0+Math.sin(i*2.3+t*2)*9,y=hy0-u*16;C.globalAlpha=Math.max(0,fade*(1-u));R(C,x-2,y,2,2,'#f04870');R(C,x+1,y,2,2,'#f04870');R(C,x-1,y+2,3,1,'#f04870');R(C,x,y+3,1,1,'#f04870')}
  if(k==='dance')for(let i=0;i<3;i++){const u=rise(i,3,.8),x=hx0+(i-1)*9+Math.sin(t*5+i)*2,y=hy0-u*14;C.globalAlpha=Math.max(0,fade*(1-u));R(C,x,y-4,1,5,'#3848b8');R(C,x+1,y-4,2,1,'#3848b8');R(C,x-2,y,2,2,'#3848b8')}
  if(k==='cheer')for(let i=0;i<10;i++){const u=rise(i,10,.9),x=hx0+Math.sin(i*1.7)*14,y=hy0-14+u*18;C.globalAlpha=Math.max(0,fade*(1-u));R(C,x,y,2,1+(i%2),['#f8d048','#48c8f8','#f86878','#78e070'][i%4])}
  if(k==='sleep')for(let i=0;i<3;i++){const u=rise(i,3,.4),x=hx0+5+u*8,y=hy0+2-u*14,z=u<.4?2:3;C.globalAlpha=Math.max(0,fade*(1-u));C.fillStyle='#4858c0';C.fillRect(x,y,z+1,1);C.fillRect(x+z-1,y+1,1,1);C.fillRect(x,y+2,z+1,1)}
  if(k==='think'){const n=1+Math.floor(t*2)%3;for(let i=0;i<n;i++){R(C,hx0+6+i*4-1,hy0-2-i*3-1,4,4,INK);R(C,hx0+6+i*4,hy0-2-i*3,2,2,'#f8f8f8')}}
  if(k==='laugh'&&Math.floor(t*3)%2===0){C.font='700 5px "SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace';C.textAlign='center';C.lineWidth=1.2;C.strokeStyle=INK;C.strokeText('ha!',hx0+9,hy0);C.fillStyle='#f8e070';C.fillText('ha!',hx0+9,hy0)}
  C.restore()}
 let SELF=false;const pkey=(x,y)=>Math.round(x)+','+Math.round(y);
 {const _cP=cP;cP=function(ch,dir,st,ox,oy,fl){try{let k=null,at=0;
    if(SELF&&MINE){k=MINE.k;at=MINE.at}
    else if(!SELF&&window.SQMP&&SQMP.players&&SQMP.players.size){for(const r of SQMP.players.values()){if(Math.round(r.x)===Math.round(ox)&&Math.round(r.y)===Math.round(oy)&&r._emK){k=r._emK;at=r._emAt;break}}}
    if(k&&live1(k,at))return act(ch,dir,st,ox,oy,fl,k,(performance.now()-at)/1000,_cP)}catch(e){}
   return _cP.apply(this,arguments)}}
 window.SQEMOTE={emote,list:EM,pres(){return MINE&&live1(MINE.k,MINE.at)?MINE.k+':'+SEQ:''},get mine(){return MINE}};
 // you: walking (or anything that moves you) ends it
 {const _pp=pP;pP=function(tm){if(MINE&&(!live1(MINE.k,MINE.at)||Math.hypot(P.x-MX,P.y-MY)>1.5||dead||SAILING))MINE=null;SELF=true;try{return _pp.apply(this,arguments)}finally{SELF=false}}}
 // the others: their emote comes in their position (em); it stops when theirs does
 (window.SQPEERFX=window.SQPEERFX||[]).push(r=>{if(!r)return;const em=r.em||'';if(em!==(r._em||'')){r._em=em;const k=em.split(':')[0];if(em&&EM[k]){r._emK=k;r._emAt=performance.now()}else r._emK=null}
  if(PT.id&&r.pt===PT.id){g.save();g.fillStyle='#58e070';g.strokeStyle='#183818';g.lineWidth=1;g.font='700 7px '+PF;g.textAlign='center';g.strokeText('★',Math.round(r.x),Math.round(r.y-33));g.fillText('★',Math.round(r.x),Math.round(r.y-33));g.restore()}});
 // ======== parties ========
 const MAX=4;const PT={id:'',sent:{},inv:null};
 {const s=LSG('sq_party');if(s){try{const o=JSON.parse(s);if(o&&typeof o.id==='string'&&Date.now()-o.at<7200000)PT.id=o.id.slice(0,12)}catch(e){}}}
 const keep=()=>LSS('sq_party',PT.id?JSON.stringify({id:PT.id,at:Date.now()}):null);
 const others=()=>{const L=[];if(!PT.id||!on())return L;for(const r of Mp().players.values())if(live(r)&&r.pt===PT.id&&r.uid!==me())L.push(r);return L};
 const nameOf=u=>{const r=Mp()&&Mp().players.get(u);return(r&&r.n)||'Player'};
 function invite(u){if(!on()){say('Sign in to make a party.');return}if(others().some(r=>r.uid===u)){say(nameOf(u)+' is already in your party.');return}
  if(others().length>=MAX-1){say('Your party is full (4 players).');sfx('swish');return}if(PT.sent[u]&&performance.now()-PT.sent[u]<60000)return;
  if(!PT.id){PT.id=Math.random().toString(36).slice(2,12);keep()}PT.sent[u]=performance.now();const db=Fm().db;
  db.set(ref('dreq/'+u+'/'+me()),{n:String(pname()).slice(0,12),s:PT.id,k:'party',t:db.serverTimestamp()}).then(()=>{say('You invited '+nameOf(u)+' to your party.');try{mpLog('game','You invited '+nameOf(u)+' to your party.')}catch(e){}})
   .catch(e=>{delete PT.sent[u];say(/permission/i.test(String(e&&(e.code||e.message)))?'Parties need the latest database rules.':'Could not send the invite.')})}
 function join(id,from){const n=nameOf(from);const cnt=[...Mp().players.values()].filter(r=>live(r)&&r.pt===id&&r.uid!==me()).length;if(cnt>=MAX){say(n+'\'s party is full.');sfx('swish');return}
  PT.id=id;keep();say('You joined '+n+'\'s party!');try{mpLog('game','You joined '+n+'\'s party. Type /p to talk to your party.')}catch(e){}sfx('quest');if(pnOpen&&ptab===PTAB)rPn()}
 function leave(){if(!PT.id)return;PT.id='';PT.sent={};keep();say('You left the party.');try{mpLog('game','You left the party.')}catch(e){}if(pnOpen&&ptab===PTAB)rPn()}
 window.SQPARTY={get id(){return PT.id},members:others,invite,leave,join,has:u=>others().some(r=>r.uid===u),invited:u=>!!(PT.sent[u]&&performance.now()-PT.sent[u]<60000)&&!others().some(r=>r.uid===u)};
 // the invite pop-up
 {const st=document.createElement('style');st.textContent=`#ptpop{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 104px);z-index:31;display:none;align-items:center;gap:8px;padding:8px 10px;max-width:calc(100vw - 24px);box-sizing:border-box;font:600 14px ${PF};background:#f8f0d8;color:#404040;border:4px solid #485870;box-shadow:inset 0 0 0 2px #a8c0e0}
#ptpop span{flex:1;min-width:0}#ptpop button{font:700 13px ${PF};padding:7px 12px;border:3px solid #485870;background:#f8f8f8;color:#404040;cursor:pointer}#ptpop .ok{background:#38a050;border-color:#185828;color:#fff}
#pn .ptm{display:flex;gap:10px;align-items:center;padding:8px 6px;border-bottom:1px solid #d8e0f0;color:#404040}#pn .ptm b{display:block}#pn .ptm small{display:block;font-size:12px;opacity:.8}#pn .ptm .tx{flex:1;min-width:0}#pn .ptm .hb{width:70px;height:7px;background:#d0d8e8;border:2px solid #485870}#pn .ptm .hb i{display:block;height:100%;background:#48c878}
#pn .emg{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px;margin-top:8px}#pn .emg button{font:700 13px ${PF};padding:10px 6px;border:3px solid #485870;background:#f8f8f8;color:#404040;cursor:pointer}#pn .emg button span{display:block;font-size:22px;margin-bottom:2px}`;document.head.appendChild(st)}
 const pop=document.createElement('div');pop.id='ptpop';pop.innerHTML='<span></span><button class="ok">JOIN</button><button class="no">NO</button>';document.body.appendChild(pop);
 for(const ev of['touchstart','pointerdown','mousedown'])pop.addEventListener(ev,e=>e.stopPropagation());
 let popT=0;const hidePop=()=>{PT.inv=null;pop.style.display='none';clearTimeout(popT)};
 window.SQPARTYINV=(u,q)=>{try{Fm().db.remove(ref('dreq/'+me()+'/'+u)).catch(()=>{})}catch(e){}if(typeof q.t==='number'&&Date.now()+((Mp()&&Mp().off)||0)-q.t>60000)return;const id=typeof q.s==='string'?q.s.slice(0,12):'';if(!id)return;
  if(PT.id===id)return;PT.inv={u,id};pop.querySelector('span').textContent=nameOf(u)+' invites you to their party!';pop.style.display='flex';clearTimeout(popT);popT=setTimeout(hidePop,30000);try{sfx('talk')}catch(e){}
  try{mpLog('game',nameOf(u)+' invites you to their party. Tap JOIN.')}catch(e){}};
 pop.querySelector('.ok').onclick=()=>{const v=PT.inv;hidePop();if(v)join(v.id,v.u)};pop.querySelector('.no').onclick=hidePop;
 // +10% XP with a party member close by
 const near=()=>{let L=null;try{L=mpLoc()}catch(e){}return others().some(r=>r.loc===L&&Math.hypot(r.tx-P.x,r.ty-P.y)<=320)};
 {const _ax=addXp;addXp=function(i,x){if(x>0&&PT.id)try{if(near())x=Math.max(x+(x>=5?1:0),Math.round(x*1.1))}catch(e){}return _ax.call(this,i,x)}}
 // chat: /p to the party, emotes by name
 {const _ms=mpSend;mpSend=function(t){const s=String(t||'').trim(),m=/^\/(\w+)\s*(.*)$/.exec(s);
   if(m){const c=m[1].toLowerCase();if(EM[c]&&!m[2]){emote(c);return}
    if(c==='p'||c==='party'){const msg=m[2].replace(/\s+/g,' ').trim().slice(0,72);if(!PT.id||!others().length){try{mpLog('game','You\'re not in a party. Tap a player\'s name to invite them.')}catch(e){}return}if(!msg)return;
     const db=Fm().db;for(const r of others())db.push(ref('pm/'+r.uid),{f:me(),n:String(pname()).slice(0,12),m:'[Party] '+msg,t:db.serverTimestamp()}).catch(()=>{});try{mpLog('game','[Party] '+pname()+': '+msg)}catch(e){}return}}
   return _ms.apply(this,arguments)}}
 // ---- START > Party and START > Emotes ----
 const PTAB=38,ETAB=39;
 SMI.splice(SMI.findIndex(x=>x.id==='options'),0,{id:'party',l:()=>PT.id&&others().length?'Party ('+(others().length+1)+')':'Party'},{id:'emotes',l:()=>'Emotes'});
 {const _ss=showScreen;showScreen=function(id){if(id==='party'||id==='emotes'){pnOpen=true;ptab=id==='party'?PTAB:ETAB;jx=jy=0;pn.style.display='block';rPn();sfx('talk');return}return _ss.apply(this,arguments)}}
 const areaName=r=>{try{const a=r.ar||'';if(!a)return'';const D=WORLD_REGIONS[a];return D?D.name:a}catch(e){return''}};
 function partyHTML(){const L=others();let h='<div class="tl">PARTY</div>';
  if(!on())return h+'<div class="qc"><p>Sign in to play online and make a party with friends.</p></div>';
  if(!PT.id||!L.length)return h+'<div class="qc"><p>You\'re not in a party yet.</p><p>Walk up to a player, tap their name and choose <b>INVITE TO PARTY</b>. Up to 4 players.</p><p style="font-size:12px;opacity:.8">In a party you see each other on the map, get +10% XP when you\'re close together, and can talk with /p in chat.</p></div>'+(PT.id?'<button class="sb" data-pt="leave" style="width:100%;margin-top:8px">LEAVE PARTY</button>':'');
  h+='<div class="ptm"><div class="tx"><b>'+esc(pname())+' (you)</b><small>'+esc(areaName({ar:curRegion()}))+'</small></div><div class="hb"><i style="width:'+Math.max(0,Math.min(100,P.hp/6*100))+'%"></i></div></div>';
  for(const r of L)h+='<div class="ptm"><div class="tx"><b>'+esc(r.n)+'</b><small>'+esc(areaName(r)||'')+'</small></div><div class="hb"><i style="width:'+Math.max(0,Math.min(100,(r.hpv||0)/6*100))+'%"></i></div></div>';
  return h+'<div class="qc" style="margin-top:8px;font-size:12px"><p>+10% XP while a party member is close by. Type <b>/p</b> and a message to talk to your party.</p></div><button class="sb" data-pt="leave" style="width:100%;margin-top:8px">LEAVE PARTY</button>'}
 function emotesHTML(){let h='<div class="tl">EMOTES</div><div class="emg">';for(const k in EM)h+='<button data-em="'+k+'"><span>'+EM[k].ic+'</span>'+EM[k].n+'</button>';
  return h+'</div><div class="qc" style="margin-top:10px;font-size:12px"><p>Everyone nearby sees it. In chat you can also type /'+Object.keys(EM).slice(0,4).join(', /')+' and so on.</p></div>'}
 {const _r=rPn;rPn=function(){if(ptab===PTAB){try{panelChrome('')}catch(e){}pbd.innerHTML=partyHTML();return}if(ptab===ETAB){try{panelChrome('')}catch(e){}pbd.innerHTML=emotesHTML();return}return _r.apply(this,arguments)}}
 {const _oc=pbd.onclick;pbd.onclick=e=>{if(ptab===PTAB){const b=e.target.closest('[data-pt]');if(b&&b.dataset.pt==='leave')leave();return}
   if(ptab===ETAB){const b=e.target.closest('[data-em]');if(b){closePanel();emote(b.dataset.em)}return}return _oc(e)}}
 // G opens the emotes (keyboard)
 window.addEventListener('keydown',e=>{if(e.key!=='g'&&e.key!=='G')return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'))return;if(pnOpen||menuOpen||dead||e.ctrlKey||e.metaKey||e.altKey)return;showScreen('emotes');e.preventDefault()});
 // ---- the HUD: party members under the minimap ----
 {const _dh=drawHUD;drawHUD=function(){const out=_dh.apply(this,arguments);try{if(menuOpen||!PT.id)return out;const L=others().slice(0,3);if(!L.length)return out;const H=hudLayout(),U=H.U,w=100*U,x0=H.ins;
   // left column, under the quest box and its chips (the right side has the minimap, CHAT and BUG)
   let y=(H.stackBottom||H.qy+30*U)+6*U;try{const wb=document.getElementById('wbb');if(wb&&wb.style.display==='block'){const r=wb.getBoundingClientRect(),k=cv.width/(cv.clientWidth||innerWidth);if(r.left*k<x0+w&&r.bottom>0)y=Math.max(y,r.bottom*k+6*U)}}catch(e){}
   g.save();g.setTransform(1,0,0,1,0,0);for(const r of L){g3box(x0,y,w,26*U,U,'#eef8e8');g.font='700 '+9*U+'px '+PF;g.textAlign='left';g.textBaseline='middle';g.fillStyle='#284028';g.fillText(fitText('★ '+r.n,w-12*U),x0+6*U,y+9*U);
    const f=Math.max(0,Math.min(1,(r.hpv||0)/6));g.fillStyle='#485870';g.fillRect(x0+6*U,y+16*U,w-12*U,5*U);g.fillStyle=f>.5?'#48c878':f>.2?'#f8c030':'#f05030';g.fillRect(x0+7*U,y+17*U,(w-14*U)*f,3*U);y+=29*U}g.restore()}catch(e){}return out}}
 // ---- the map and the minimap: party members in green ----
 const inArea=(r,area)=>(r.ar||'')===area&&isFinite(r.ax)&&isFinite(r.ay);
 {const _dm=drawMap;drawMap=function(){const out=_dm.apply(this,arguments);try{if(!PT.id||(typeof MAPVIEW!=='undefined'&&MAPVIEW==='world'))return out;const c=document.getElementById('mpc');if(!c)return out;const area=curRegion(),x=c.getContext('2d'),s=Math.max(2,Math.round(c.width/70));
   for(const r of others())if(inArea(r,area)){const tx=r.ax/16,ty=r.ay/16;x.fillStyle='#183818';x.fillRect(tx-s/2-1,ty-s/2-1,s+2,s+2);x.fillStyle='#58e070';x.fillRect(tx-s/2,ty-s/2,s,s)}}catch(e){}return out}}
 if(typeof drawMini52==='function'){const _dmm=drawMini52;drawMini52=function(){const out=_dmm.apply(this,arguments);try{if(!PT.id)return out;const t=miniTarget();if(!t)return out;const area=t.k==='region'?t.R.region:'hollow';
   const H=hudLayout(),U=H.U,w=H.dw,hh=w*t.h/t.w,x0=H.dx,y0=H.top+H.dh+46*U;g.save();g.setTransform(1,0,0,1,0,0);
   for(const r of others())if(inArea(r,area)){const px=x0+(r.ax/16)/t.w*w,py=y0+(r.ay/16)/t.h*hh;g.fillStyle='#183818';g.fillRect(px-2.5*U,py-2.5*U,5*U,5*U);g.fillStyle='#58e070';g.fillRect(px-1.8*U,py-1.8*U,3.6*U,3.6*U)}g.restore()}catch(e){}return out}}
})();
