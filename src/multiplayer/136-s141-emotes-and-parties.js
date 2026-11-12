// ---- 141. Emotes and parties ----
// Emotes: START > Emotes (or /wave, /bow, /dance, /cheer, /laugh, /love, /yes, /no in chat; G on a keyboard opens the list)
// show a bubble over your head for 3 s, with a little burst of hearts, notes or confetti. Other players see it too: the
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
 // ======== emotes ========
 const EM={wave:{n:'Wave',ic:'👋',fx:null},bow:{n:'Bow',ic:'🙇',fx:null},dance:{n:'Dance',ic:'💃',fx:'note'},cheer:{n:'Cheer',ic:'🎉',fx:'conf'},laugh:{n:'Laugh',ic:'😂',fx:null},love:{n:'Love',ic:'❤️',fx:'heart'},yes:{n:'Yes',ic:'👍',fx:null},no:{n:'No',ic:'👎',fx:null},think:{n:'Hmm',ic:'🤔',fx:null},sleep:{n:'Sleepy',ic:'💤',fx:null}};
 const DUR=3;let MINE=null,SEQ=0;// {k, at}
 function emote(k){if(!EM[k]||dead)return false;MINE={k,at:performance.now()};SEQ++;try{sfx('talk')}catch(e){}return true}
 // a bubble with the emote over someone's head; hop for dance and cheer
 function bubble(x,y,k,t){const E=EM[k];if(!E)return;const a=Math.min(1,(DUR-t)/.4,t/.15),bob=E.fx==='note'||E.fx==='conf'?Math.abs(Math.sin(t*9))*3:0;g.save();g.globalAlpha=Math.max(0,a);
  const bx=Math.round(x),by=Math.round(y-40-bob);g.fillStyle='#f8f8f8';g.strokeStyle='#283048';g.lineWidth=1.5;g.beginPath();g.roundRect(bx-9,by-9,18,16,4);g.fill();g.stroke();
  g.beginPath();g.moveTo(bx-2,by+7);g.lineTo(bx,by+11);g.lineTo(bx+2,by+7);g.fill();g.font='11px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(E.ic,bx,by);
  if(E.fx){const n=5;for(let i=0;i<n;i++){const u=((t*0.9+i/n)%1),px=bx+Math.sin(i*2.1+t*3)*12,py=by-4-u*22;g.globalAlpha=Math.max(0,a*(1-u));
    if(E.fx==='heart'){g.fillStyle='#f04870';g.fillRect(px-2,py,2,2);g.fillRect(px,py,2,2);g.fillRect(px-1,py+2,2,1)}else if(E.fx==='note'){g.fillStyle='#5868d8';g.fillRect(px,py-3,1,4);g.fillRect(px-2,py,2,2)}else{g.fillStyle=['#f8d048','#48c8f8','#f86878','#78e070'][i%4];g.fillRect(px,py,2,2)}}}
  g.restore()}
 window.SQEMOTE={emote,list:EM,pres(){return MINE&&performance.now()-MINE.at<DUR*1000?MINE.k+':'+SEQ:''},get mine(){return MINE}};
 // you: drawn with you (the outermost pP runs in world space at your feet)
 {const _pp=pP;pP=function(tm){const out=_pp.apply(this,arguments);try{if(MINE){const t=(performance.now()-MINE.at)/1000;if(t>DUR)MINE=null;else bubble(P.x,P.y,MINE.k,t)}}catch(e){}return out}}
 // the others
 (window.SQPEERFX=window.SQPEERFX||[]).push(r=>{if(!r)return;const em=r.em||'';if(em!==(r._em||'')){r._em=em;if(em){const k=em.split(':')[0];if(EM[k]){r._emK=k;r._emAt=performance.now()}}}
  if(r._emK){const t=(performance.now()-r._emAt)/1000;if(t>DUR)r._emK=null;else bubble(r.x,r.y,r._emK,t)}
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
 {const _dh=drawHUD;drawHUD=function(){const out=_dh.apply(this,arguments);try{if(menuOpen||!PT.id)return out;const L=others().slice(0,3);if(!L.length)return out;const H=hudLayout(),U=H.U,w=H.dw,x0=H.dx;
   let y=H.top+H.dh+46*U+w*.75+10*U;try{const t=miniTarget();if(t)y=H.top+H.dh+46*U+w*t.h/t.w+10*U}catch(e){}
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
