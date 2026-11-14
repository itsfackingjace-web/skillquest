// ---- 136. Quality fixes: a steady TALK/USE button, small messages over your head, XP drops everywhere, no cooking on
// castles, boats stay off bridges and piers, saves on the new open sea ----
(()=>{
 // ---- the TALK/USE button: many sections each write their word on it every frame (one says USE, the next says ROUTES),
 // which rebuilt the button 60 times a second next to harbor posts, furnaces and the like (a visible flicker on phones,
 // and a tap could land on a label that had just been replaced). During a frame the writes are only remembered; the
 // last one is put on the button once, and only if it's different from what's there.
 // Showing and hiding it flipped every frame too (one section hid it, the next showed it again), which on iPhones cancels a
 // press that's under way. Browsers don't let a page catch those style writes, so the button's shown/hidden state is
 // held by a class set once at the end of each frame from where the writes ended up; in between, the inline flips don't
 // reach the screen. When the game isn't running frames (title screen), the classes come off and the button behaves as before.
 {const D=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');let buf=null,inUpd=0,last=0;
  {const st=document.createElement('style');st.textContent='#tk.sqtkon{display:flex!important}#tk.sqtkoff{display:none!important}';document.head.appendChild(st)}
  Object.defineProperty(tk,'innerHTML',{configurable:true,get(){return inUpd&&buf!==null?buf:D.get.call(this)},set(v){if(inUpd)buf=String(v);else D.set.call(this,v)}});
  const hold=()=>{const on=tk.style.display!=='none';tk.classList.toggle('sqtkon',on);tk.classList.toggle('sqtkoff',!on)};
  const _u=upd;upd=function(){inUpd++;if(inUpd===1)buf=null;try{return _u.apply(this,arguments)}finally{inUpd--;
   if(!inUpd){if(buf!==null){const v=buf;buf=null;if(D.get.call(tk)!==v)D.set.call(tk,v)}last=performance.now();hold()}}};
  setInterval(()=>{if(performance.now()-last>200&&(tk.classList.contains('sqtkon')||tk.classList.contains('sqtkoff')))tk.classList.remove('sqtkon','sqtkoff')},100);
  // something outside the frame (a panel closing, a menu) shows or hides it: follow at once
  for(const f of['closePanel','showScreen'])try{const o=window[f];if(typeof o==='function')window[f]=function(){const out=o.apply(this,arguments);try{hold()}catch(e){}return out}}catch(e){}
  window.SQTKBUF={get pending(){return buf}}}

 // ---- routine messages (casting a line, a catch, a cooked fish, +1 log...) float over your head instead of opening the
 // big text box; anything you need to read (people, signs, warnings, quests) still uses the box
 // "Reeling it in...", "Cooking..." and the like (109's progress words) aren't shown at all: your character already shows it.
 const QUIET=/^(You cast your line|You reel in your line|It got away|You stop fishing|Stopped|You catch |You burn the |Burnt it|Cooked |Picked up |Watered the |Tilled!|Blocked!|Campfire built|Made |Equipped the |You put on the |Still chewing|Ate |You eat |You drink |\+\d+ [a-z])/,
  SILENT=/^(Lighting a fire\.\.\.|Cooking\.\.\.|Smelting\.\.\.|Hammering at the anvil\.\.\.|Crafting\.\.\.|Reeling it in\.\.\.|Working\.\.\.)$/;
 const KEEP=/quest|level|unlock|learn|discover|achiev|welcome|collection|rare |RAINBOW|DRAGONSOUL|died|you fell|"|“|^[A-Z][a-z]+: /i;
 const QL=[];// small words over your head: {tx,t}
 {const _s=say;say=function(s){const t=typeof s==='string'?s:'';
   if(t&&SILENT.test(t)&&!pnOpen)return;
   // every short message floats; the box is kept for quests, levels, unlocks, rare finds, people talking and long explanations
   if(t&&!pnOpen&&!menuOpen&&!dead&&!(typeof TALKN!=='undefined'&&TALKN)&&(t.length<=46&&QUIET.test(t)||t.length<=56&&!KEEP.test(t))){
    if(!QL.some(q=>q.tx===t&&q.t<.5)){QL.push({tx:t,t:0});if(QL.length>3)QL.shift()}if(!(msgT>0))msg='';return}
   return _s.apply(this,arguments)};window.SQQUIET=QUIET;window.SQQL=QL}
 // drawn small (4.5 world px, a little smaller than XP numbers), following you, fading out over 1.8 s
 function drawQL(){if(!QL.length)return;g.save();g.font='700 4.5px "SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace';g.textAlign='center';g.lineWidth=1.3;g.lineJoin='round';
  const lines=t=>{if(t.length<=30)return[t];const w=t.split(' ');let a='',L=[];for(const x of w){if(a&&(a+' '+x).length>30){L.push(a);a=x}else a=a?a+' '+x:x}L.push(a);return L.slice(0,2)};
  let off=0,off2=0;// 189: while XP numbers rise over your head, the words go under your feet
  for(let i=QL.length-1;i>=0;i--){const q=QL[i];q.t+=.016;g.globalAlpha=Math.max(0,Math.min(1,(1.8-q.t)/.5));if(!q.hi&&drops.some(d=>d.t<1.1))q.hi=1;const L=lines(q.tx),x=Math.round(P.x);
   for(let j=L.length-1;j>=0;j--){const y=q.hi?Math.round(P.y+12+off2+q.t*2):Math.round(P.y-28-off-q.t*4);g.strokeStyle='rgba(0,0,0,.85)';g.strokeText(L[j],x,y);g.fillStyle='#fff';g.fillText(L[j],x,y);if(q.hi)off2+=5.5;else off+=5.5}if(q.hi)off2+=1;else off+=1}
  g.restore();for(let i=QL.length-1;i>=0;i--)if(QL[i].t>=1.8)QL.splice(i,1)}

 {const _nd=NEWDRAW;NEWDRAW=function(...a){const out=_nd(...a);if(SCENE)try{drawDrops()}catch(e){}try{drawQL()}catch(e){}return out}}

 // ---- a castle's warmth keeps monsters away and heals you, but cooking needs a real campfire
 {const _nf=nearFire;nearFire=function(x,y,r){const v=_nf(x,y,r);if(!v||r!==45||x!==P.x||y!==P.y)return v;
   if(SCENE&&!(SCENE.room&&SCENE.room.region))return v;return fires.some(f=>(f.life===undefined||f.life>0)&&Math.hypot(f.x-x,f.y-y)<45)}}

 // ---- a boat can't ride up onto a bridge or a pier (they're built over the water, so the boat used to slide onto them
 // and from there reach the land); a boat that starts on one can still sail off it
 {const onB=(x,y)=>[[-6,-1],[6,-1],[-6,6],[6,6]].some(([a,b])=>{const tx=Math.floor((x+a)/16),ty=Math.floor((y+b)/16);return tx>=0&&ty>=0&&tx<N&&ty<N&&BRIDGE.has(ty*N+tx)});
  const _u=upd;upd=function(dt){const s=SAILING&&!SCENE,ox=P.x,oy=P.y;const out=_u.apply(this,arguments);
   if(s&&SAILING&&!SCENE&&(P.x!==ox||P.y!==oy)&&!onB(ox,oy)&&onB(P.x,P.y)){if(!onB(P.x,oy))P.y=oy;else if(!onB(ox,P.y))P.x=ox;else{P.x=ox;P.y=oy}}return out}}

 // ---- Hollow Island now has open sea all around its edge: things built where the land became sea go back in your bag
 {const bad=i=>i<0||i>=N*N||tile[i]===0;const add=(S,k,n)=>{if(!S.inv||typeof S.inv!=='object')S.inv={};S.inv[k]=(+S.inv[k]||0)+n};
  const items=(S,o)=>{if(o&&typeof o==='object')for(const k in o){const n=Math.max(0,+o[k]||0);if(n)add(S,k,n)}};let PACKED=null;
  const _ap=applySave;applySave=function(S){PACKED=null;try{if(S&&typeof S==='object'){const inH=!S.region||!S.region.id||S.region.id==='hollow',pk=[];
     if(Array.isArray(S.str))S.str=S.str.filter(e=>{if(!Array.isArray(e)||!bad(e[0]|0))return true;if(BRIDGE.has(e[0]|0))return true;add(S,e[1],1);items(S,e[2]);pk.push(INAME[e[1]]||e[1]);if(+S.bsp===(e[0]|0))S.bsp=-1;return false});
     if(Array.isArray(S.houses))S.houses=S.houses.filter(h=>{if(!h||!isFinite(h.x)||!isFinite(h.y))return true;const w=h.w||5,hw=(w-1)/2;let ok=true;for(let dy=-1;dy<=0&&ok;dy++)for(let dx=-hw;dx<=hw;dx++)if(bad((h.y+dy)*N+h.x+dx)){ok=false;break}
       if(ok)return true;add(S,h.c?'castle':'house',1);pk.push(h.c?'Castle':'House');if(Array.isArray(h.f))for(const q of h.f)if(Array.isArray(q)&&q[1]){add(S,q[1],1);items(S,q[2])}if(S.home===h.id)S.home=null;return false});
     if(Array.isArray(S.farm))S.farm=S.farm.filter(e=>!Array.isArray(e)||!bad(e[0]|0));
     if(inH&&S.p&&typeof S.p==='object'&&isFinite(S.p.x)&&isFinite(S.p.y)&&!S.sail&&bad(Math.floor(S.p.y/16)*N+Math.floor(S.p.x/16)))PACKED=PACKED||[];
     if(pk.length)PACKED=pk}}catch(e){console.warn('sea edge',e)}
   const out=_ap.apply(this,arguments);
   try{if(PACKED&&!SCENE&&!SAILING){if(solid(P.x-5,P.y-3)||solid(P.x+5,P.y+6)){const tx=Math.floor(P.x/16),ty=Math.floor(P.y/16);let done=false;
      for(let r=1;r<40&&!done;r++)for(let dy=-r;dy<=r&&!done;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=(tx+dx)*16+8,y=(ty+dy)*16+8;if(!solid(x-5,y-3)&&!solid(x+5,y+6)&&!solid(x,y)){P.x=x;P.y=y;done=true;break}}}
     if(PACKED.length){const L=[...new Set(PACKED)];setTimeout(()=>{try{say('The sea has risen around the edge of Hollow Island. What you built out there is safe in your bag: '+L.join(', ')+'.');msgT=8;saveLocal(true)}catch(e){}},1500)}}}catch(e){}
   return out}}

})();
