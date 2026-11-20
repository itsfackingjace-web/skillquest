// ---- 233. Better maps: a minimap that follows you, map pins, names on the map, trackable guild quests ----
// Minimap: shows SPAN tiles across around you (not the whole area). Every older minimap hook (052's terrain and markers, 061
//   players, 076 graves, 132 houses, 136 party, 138 world boss, 215 meteors) maps tiles with x0 + u/t.w*w from hudLayout() and
//   miniTarget(), so the outermost drawMini52 hands them a "fake" view for the call: miniTarget() returns t with w/h = the
//   window in tiles (rw/rh = the real size, fake:1) and hudLayout() a layout whose box origin is where tile 0,0 lands, so the
//   same formula zooms. Everything is clipped to the box. 052 draws the terrain at the zoomed size when t.fake and leaves the
//   frame and the player to this file. 105's tap box (SQMINIBOX) is put back to the real box afterwards.
//   Drawn here on top: the quest target (102's SQTRACK) and your pin, as a dot or, when off the window, an arrow at the edge,
//   and you as an arrow facing your way.
// Pins: tap the map (HERE) to drop one, tap near it to remove it. PIN = {a: area ('hollow' or a region id), x, y (tile)} in
//   localStorage `sq_pin`. Drawn on the map and minimap, with an on-screen arrow + distance (like 102's quest arrow, pink).
//   Reaching it (1.5 tiles) clears it.
// Names on the map: a label layer over #mpc (towns, dungeons, harbor posts on Hollow; the pier and found landmarks on islands),
//   placed greedily so labels never overlap; legend entries that only named a labelled place are dropped.
// Guild quests: the guild's current quest is a quest-log entry (102's SQQEXTRA, id `gq:<guild>:<t>`, category Guild) with its
//   progress (no arrow: it counts anywhere). The guild
//   screen's quest card has a Track button (`data-gqtrk`, via SQGQTRKBTN, 197).
(()=>{const SPAN=48,PINK='#ff5a8a',GOLD='#f8d048',DARK='#302818';
 const areaNow=()=>{if(!SCENE)return'hollow';const R=SCENE.room;return R&&R.region?R.region:null};
 // ---------------- pins ----------------
 let PIN=null;try{const v=JSON.parse(localStorage.getItem('sq_pin')||'null');if(v&&typeof v.a==='string'&&isFinite(v.x)&&isFinite(v.y))PIN={a:v.a,x:+v.x,y:+v.y}}catch(e){self.SQERR&&SQERR(e,'225-1')}
 const savePin=()=>{try{if(PIN)localStorage.setItem('sq_pin',JSON.stringify(PIN));else localStorage.removeItem('sq_pin')}catch(e){self.SQERR&&SQERR(e,'225-2')}};
 function setPin(a,x,y){PIN={a,x,y};savePin();try{sfx('pickup')}catch(e){self.SQERR&&SQERR(e,'225-3')}}
 function clearPin(msg){PIN=null;savePin();if(msg)try{say(msg)}catch(e){self.SQERR&&SQERR(e,'225-4')}}
 window.SQPIN={get:()=>PIN,set:setPin,clear:()=>clearPin(),party:()=>PP};
 // ---------------- party pins: pings/<party id>/<uid> = {a,x,y,t} (rules: own uid only); members' pins show in green ----------------
 const PCOL='#58e070';let PP=[],subP='',unsub=null,RAW={},lastSent='',LOADED=false;const seenK={};
 function partyTick(){const PA=window.SQPARTY,pid=(PA&&PA.id)||'',F=window.SQFB,M=window.SQMP,u=M&&M.user?M.user.uid:'';if(!F||!u){PP=[];return}
  const ref=k=>F.db.ref(F.D,'pings/'+k+'/'+u);
  if(pid!==subP){if(unsub)try{unsub()}catch(e){self.SQERR&&SQERR(e,'225-5')}unsub=null;RAW={};LOADED=false;if(subP&&lastSent&&lastSent!=='-')try{F.db.set(ref(subP),null).catch(()=>{})}catch(e){self.SQERR&&SQERR(e,'225-6')}
   subP=pid;lastSent='';if(pid)try{unsub=F.db.onValue(F.db.ref(F.D,'pings/'+pid),q=>{RAW=q.val()||{};LOADED=true},()=>{})}catch(e){self.SQERR&&SQERR(e,'225-7')}}
  if(pid){const k=PIN?PIN.a+'|'+PIN.x+'|'+PIN.y:'-';if(k!==lastSent){const was=lastSent;lastSent=k;if(!(k==='-'&&was===''))try{F.db.set(ref(pid),PIN?{a:PIN.a,x:PIN.x|0,y:PIN.y|0,t:F.db.serverTimestamp()}:null).catch(()=>{lastSent='?'})}catch(e){lastSent='?'}}}
  const L=[],mem=PA&&PA.members?PA.members():[];for(const r of mem){const v=RAW[r.uid];if(!v||typeof v.a!=='string'||!isFinite(v.x)||!isFinite(v.y)||(typeof v.t==='number'&&Date.now()-v.t>3*3600000)){if(LOADED)seenK[r.uid]='';continue}
   const o={u:r.uid,n:String(r.n||'Party').slice(0,12),a:v.a,x:+v.x,y:+v.y};L.push(o);const key=o.a+'|'+o.x+'|'+o.y;if(seenK[o.u]!==undefined&&seenK[o.u]!==key)try{say('📍 '+o.n+' dropped a pin'+(o.a===areaNow()?'':' on '+(o.a==='hollow'?'Hollow Island':((window.WORLD_REGIONS||{})[o.a]||{}).name||o.a))+'. It\'s on your map.')}catch(e){self.SQERR&&SQERR(e,'225-8')}seenK[o.u]=key}
  for(const k in seenK)if(!mem.some(r=>r.uid===k))delete seenK[k];
  PP=L}
 setInterval(()=>{try{partyTick()}catch(e){self.SQERR&&SQERR(e,'225-9')}},700);
 // ---------------- the minimap ----------------
 const tri=(x,y,an,s,fill,stroke,lw)=>{g.save();g.translate(x,y);g.rotate(an);g.beginPath();g.moveTo(s,0);g.lineTo(-s*.7,-s*.75);g.lineTo(-s*.35,0);g.lineTo(-s*.7,s*.75);g.closePath();g.lineWidth=lw;g.strokeStyle=stroke;g.stroke();g.fillStyle=fill;g.fill();g.restore()};
 let BOX=null;
 const _dm=drawMini52;drawMini52=function(){const t=miniTarget();if(!t)return _dm.apply(this,arguments);
  const L=hudLayout(),U=L.U,w=(L.mw||L.dw),hh=Math.round(w*t.h/t.w),bx=L.dx+L.dw-w,by=L.top+L.dh+46*U,k=w/SPAN,cu=P.x/16,cv=P.y/16;
  BOX={x:bx,y:by,w,h:hh,U,k,cu,cv};
  const fx=bx+w/2-cu*k,fy=by+hh/2-cv*k;// where tile 0,0 lands
  const fake=Object.assign({},t,{w:SPAN,h:SPAN*hh/w,rw:t.w,rh:t.h,fake:1}),FL=Object.assign({},L,{dx:fx,dw:w,mw:undefined,top:fy-L.dh-46*U});
  g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(10,8,16,.72)';g.fillRect(bx-3*U,by-3*U,w+6*U,hh+6*U);
  g.fillStyle=t.k==='region'?'#1e2c48':'#3878d8';g.fillRect(bx,by,w,hh);g.beginPath();g.rect(bx,by,w,hh);g.clip();
  const mt=miniTarget,hl=hudLayout;miniTarget=()=>fake;hudLayout=()=>FL;let out;
  try{out=_dm.apply(this,arguments)}finally{miniTarget=mt;hudLayout=hl}
  try{overlay(t)}catch(e){self.SQERR&&SQERR(e,'225-10')}g.restore();
  try{const b=window.SQMINIBOX&&SQMINIBOX();if(b){const r=W/innerWidth;Object.assign(b,{x:(bx-3*U)/r,y:(by-3*U)/r,w:(w+6*U)/r,h:(hh+6*U)/r})}}catch(e){self.SQERR&&SQERR(e,'225-11')}
  return out};
 // a marker at tile (u,v): a dot inside the window, an arrow on the edge outside it
 function mark(u,v,col,size){const B=BOX,x=B.x+B.w/2+(u-B.cu)*B.k,y=B.y+B.h/2+(v-B.cv)*B.k,U=B.U,pad=5*U;
  if(x>=B.x+pad&&x<=B.x+B.w-pad&&y>=B.y+pad&&y<=B.y+B.h-pad){g.fillStyle=DARK;g.beginPath();g.arc(x,y,size*U+1.5*U,0,6.283);g.fill();g.fillStyle=col;g.beginPath();g.arc(x,y,size*U,0,6.283);g.fill();return}
  const cx=B.x+B.w/2,cy=B.y+B.h/2,an=Math.atan2(y-cy,x-cx),hx=B.w/2-pad,hy=B.h/2-pad,s=Math.min(hx/Math.max(1e-6,Math.abs(Math.cos(an))),hy/Math.max(1e-6,Math.abs(Math.sin(an))));
  tri(cx+Math.cos(an)*s,cy+Math.sin(an)*s,an,4.5*U,col,DARK,1.5*U)}
 function overlay(t){const a=t.k==='region'?t.R.region:'hollow',B=BOX,U=B.U;
  try{const tr=window.SQTRACK&&SQTRACK(),q=tr&&tr.t;if(q&&q.x!=null&&q.area===a)mark(q.x/16,q.y/16,GOLD,2.4)}catch(e){self.SQERR&&SQERR(e,'225-12')}
  for(const q of PP)if(q.a===a)mark(q.x+.5,q.y+.5,PCOL,2.1);
  if(PIN&&PIN.a===a)mark(PIN.x+.5,PIN.y+.5,PINK,2.4);
  // you, facing your way
  const an=Math.atan2(face[1]||0,face[0]||0);tri(B.x+B.w/2,B.y+B.h/2,an,4.2*U,'#ffffff',DARK,1.6*U)}
 // ---------------- the pin's on-screen arrow ----------------
 {SQHUD.wrap('225',_dh=>function(){const out=_dh.apply(this,arguments);try{const a=areaNow();if(a&&PP.length&&!dead&&!menuOpen&&!(typeof pnOpen!=='undefined'&&pnOpen)){const U=(typeof HUDL!=='undefined'&&HUDL&&HUDL.U)||1;g.save();g.setTransform(1,0,0,1,0,0);
    for(const q of PP){if(q.a!==a)continue;const sx=W/2+(q.x*16+8-P.x)*Z,sy=H/2+(q.y*16+8-P.y)*Z;if(sx<0||sx>W||sy<0||sy>H)continue;const r=4.5*U;
     g.fillStyle=DARK;g.beginPath();g.arc(sx,sy-13*U,r+2*U,0,6.283);g.fill();g.beginPath();g.moveTo(sx-4*U,sy-10*U);g.lineTo(sx+4*U,sy-10*U);g.lineTo(sx,sy);g.closePath();g.fill();
     g.fillStyle=PCOL;g.beginPath();g.arc(sx,sy-13*U,r,0,6.283);g.fill();g.beginPath();g.moveTo(sx-2.5*U,sy-10*U);g.lineTo(sx+2.5*U,sy-10*U);g.lineTo(sx,sy-2*U);g.closePath();g.fill();
     g.font='700 '+10*U+'px '+PF;g.textAlign='center';g.textBaseline='bottom';g.lineWidth=3*U;g.strokeStyle=DARK;g.strokeText(q.n,sx,sy-20*U);g.fillStyle='#e0ffe4';g.fillText(q.n,sx,sy-20*U)}g.restore()}}catch(e){self.SQERR&&SQERR(e,'225-13')}
   try{const a=areaNow();if(!PIN||!a||PIN.a!==a||dead||menuOpen||(typeof pnOpen!=='undefined'&&pnOpen))return out;
    const tx=PIN.x*16+8,ty=PIN.y*16+8,d=Math.hypot(tx-P.x,ty-P.y)/16;if(d<1.5){clearPin('📍 You reached your pin.');try{sfx('quest')}catch(e){self.SQERR&&SQERR(e,'225-14')}return out}
    const U=(typeof HUDL!=='undefined'&&HUDL&&HUDL.U)||1,tm=performance.now()/1000;g.save();g.setTransform(1,0,0,1,0,0);
    const sx=W/2+(tx-P.x)*Z,sy=H/2+(ty-P.y)*Z,m=44*U;
    if(sx>m&&sx<W-m&&sy>m&&sy<H-m){// a pin standing on the spot
     const py=sy-Math.abs(Math.sin(tm*3))*4*U,r=5*U;g.fillStyle=DARK;g.beginPath();g.arc(sx,py-14*U,r+2*U,0,6.283);g.fill();g.beginPath();g.moveTo(sx-4*U,py-11*U);g.lineTo(sx+4*U,py-11*U);g.lineTo(sx,py);g.closePath();g.fill();
     g.fillStyle=PINK;g.beginPath();g.arc(sx,py-14*U,r,0,6.283);g.fill();g.beginPath();g.moveTo(sx-2.5*U,py-11*U);g.lineTo(sx+2.5*U,py-11*U);g.lineTo(sx,py-2*U);g.closePath();g.fill();g.fillStyle='#fff';g.fillRect(sx-1.5*U,py-16*U,2*U,2*U)}
    if(d>3){const an=Math.atan2(ty-P.y,tx-P.x),cx=W/2,cy=H/2-6*Z,r=34*Z,ax=cx+Math.cos(an)*r,ay=cy+Math.sin(an)*r*.8;tri(ax,ay,an,Math.max(6*U,2.8*Z)+Math.sin(tm*5)*U,PINK,DARK,3*U);
     g.font='700 '+11*U+'px '+PF;g.textAlign='center';g.textBaseline='middle';const lx=cx+Math.cos(an)*(r+14*U+3*Z),ly=cy+Math.sin(an)*(r*.8+10*U+2*Z);g.lineWidth=3*U;g.strokeStyle=DARK;g.strokeText('📍'+Math.round(d)+'m',lx,ly);g.fillStyle='#ffe0ea';g.fillText('📍'+Math.round(d)+'m',lx,ly)}
    g.restore()}catch(e){self.SQERR&&SQERR(e,'225-15')}return out})}
 // ---------------- the map screen: pin, labels, legend ----------------
 const mapArea=()=>{const R=SCENE&&SCENE.room;return R&&R.region?R.region:'hollow'};
 const isHere=()=>typeof MAPVIEW==='undefined'||MAPVIEW!=='world';
 {SQDRAWMAP.wrap('225',_dmap=>function(){const out=_dmap.apply(this,arguments);try{if(!isHere())return out;const c=document.getElementById('mpc');if(!c)return out;
    const list=PP.filter(q=>q.a===mapArea()).map(q=>[q.x,q.y,PCOL]);if(PIN&&PIN.a===mapArea())list.push([PIN.x,PIN.y,PINK]);
    for(const[X,Y,COL]of list){const x=c.getContext('2d'),S2=c.width>=200?2:1,r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(X+.5+(a-.5)*S2,Y+1+(b-1)*S2,w*S2,h*S2)},bob=(performance.now()/400|0)%2;
    // a little pixel pin with its point on the tile
    const ART=['.ooo.','oppwo','opppo','opppo','.opo.','..o..'],CL={o:DARK,p:COL,w:'#fff'};ART.forEach((row,j)=>{for(let k=0;k<5;k++){const ch=row[k];if(ch!=='.')r(k-2,j-5-bob,1,1,CL[ch])}})}}catch(e){self.SQERR&&SQERR(e,'225-16')}return out})}
 pbd.addEventListener('click',e=>{const c=e.target;if(!c||c.id!=='mpc'||!isHere())return;const rc=c.getBoundingClientRect(),cw=c.clientWidth||rc.width,chh=c.clientHeight||rc.height;
  const tx=Math.floor((e.clientX-rc.left-(c.clientLeft||0))/cw*c.width),ty=Math.floor((e.clientY-rc.top-(c.clientTop||0))/chh*c.height);if(tx<0||ty<0||tx>=c.width||ty>=c.height)return;
  const a=mapArea(),near=Math.max(4,c.width/40);
  if(PIN&&PIN.a===a&&Math.hypot(PIN.x-tx,PIN.y-ty)<=near){clearPin('Pin removed.');try{sfx('swish')}catch(x){self.SQERR&&SQERR(x,'225-17')}}else{setPin(a,tx,ty);try{say('📍 Pin dropped. Follow the pink arrow.')}catch(x){self.SQERR&&SQERR(x,'225-18')}}
  try{drawMap()}catch(x){self.SQERR&&SQERR(x,'225-19')}});
 function labels(){const a=mapArea(),out=[];
  if(a==='hollow'){try{for(const t of TOWN_REG)if(t.on)out.push({n:t.name,x:t.x,y:t.y,c:'t'})}catch(e){self.SQERR&&SQERR(e,'225-20')}
   try{for(const d of DUNGEON_REG)if(d.on&&d.x>=0)out.push({n:d.name,x:d.x,y:d.y,c:'d'})}catch(e){self.SQERR&&SQERR(e,'225-21')}
   try{for(const p of HARBOR_POSTS)if(!out.some(o=>o.c==='t'&&o.n===p.name))out.push({n:p.name+' harbor',x:p.x,y:p.y,c:'h'})}catch(e){self.SQERR&&SQERR(e,'225-22')}}
  else{const R=SCENE.room;try{out.push({n:'Pier',x:R.dock[0],y:R.dock[1],c:'h'})}catch(e){self.SQERR&&SQERR(e,'225-23')}
   try{for(const l of R.lms)if(rgSeen(R.region,l.id))out.push({n:l.name||(typeof lmName==='function'?lmName(l.id):l.id),x:l.x,y:l.y,c:'l'})}catch(e){self.SQERR&&SQERR(e,'225-24')}}
  for(const q of PP)if(q.a===a)out.push({n:q.n+'\'s pin',x:q.x,y:q.y-2,c:'p'});
  return out}
 const ESC=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 {const st=document.createElement('style');st.textContent=`#pn .sqmpw{position:relative;width:min(84vw,52vh,380px);margin:8px auto}#pn .sqmpw #mpc{margin:0;cursor:crosshair}
#pn .sqmpl{position:absolute;inset:3px;pointer-events:none;overflow:hidden}#pn .sqmpl span{position:absolute;transform:translate(-50%,-125%);white-space:nowrap;font:700 10px var(--pf),monospace;color:#fff;letter-spacing:.2px;
text-shadow:1px 0 #1a1420,-1px 0 #1a1420,0 1px #1a1420,0 -1px #1a1420,1px 1px #1a1420,-1px -1px #1a1420,1px -1px #1a1420,-1px 1px #1a1420;line-height:1}
#pn .sqmpl span.d{color:#ffd8a0}#pn .sqmpl span.p{color:#a8ffb0;font-size:9px}#pn .sqmpl span.h{color:#a8e8ff;font-size:9px}#pn .sqmpl span.l{color:#f0f0f0;font-size:9px}#pn .sqmph{text-align:center;font:600 12px var(--pf);color:#485870;margin:-2px 0 4px}`;document.head.appendChild(st)}
 {SQMAPHTML.wrap('225',_mh=>function(){let h=_mh.apply(this,arguments);try{if(!isHere())return h;const i=h.indexOf('<canvas id="mpc"');if(i<0)return h;const j=h.indexOf('</canvas>',i)+9;
    const m=/width="(\d+)" height="(\d+)"/.exec(h.slice(i,j));const CW=m?+m[1]:N,CH=m?+m[2]:N;
    // greedy placement: bigger places first, skip a label that would overlap one already placed (sizes in % of the map)
    const L=labels().sort((p,q)=>'ptdhl'.indexOf(p.c)-'ptdhl'.indexOf(q.c)),placed=[],px=380;let sp='';
    for(const o of L){const lx=(o.x+.5)/CW*100,ly=o.y/CH*100,wd=(o.n.length*(o.c==='t'||o.c==='d'?6.2:5.6)+4)/px*100,ht=11/px*100*(CW/CH),bx={x0:lx-wd/2,x1:lx+wd/2,y0:ly-ht*1.35,y1:ly-ht*.2};
     if(bx.x0<-2||bx.x1>102)continue;if(placed.some(b=>b.x0<bx.x1&&bx.x0<b.x1&&b.y0<bx.y1&&bx.y0<b.y1))continue;placed.push(bx);o.on=1;
     sp+='<span class="'+o.c+'" style="left:'+lx.toFixed(2)+'%;top:'+ly.toFixed(2)+'%">'+ESC(o.n)+'</span>'}
    h=h.slice(0,i)+'<div class="sqmpw">'+h.slice(i,j)+'<div class="sqmpl">'+sp+'</div></div><div class="sqmph">Tap the map to drop a 📍 pin'+(PIN&&PIN.a===mapArea()?' · tap it again to remove it':'')+'</div>'+h.slice(j);
    // the legend: drop entries that only name labelled places
    const named=new Set(L.filter(o=>o.on).map(o=>o.n));
    h=h.replace(/<span><i style="background:[^"]*"><\/i>([^<]*)<\/span>/g,(all,txt)=>{const parts=txt.split(' · ').map(s=>s.trim()).filter(Boolean);return parts.length&&parts.every(p=>named.has(p))?'':all});
    h=h.replace('<div class="lg">','<div class="lg"><span><i style="background:'+PINK+'"></i>Pin</span><span><i style="background:'+GOLD+'"></i>Quest</span>'+(PP.length?'<span><i style="background:'+PCOL+'"></i>Party pin</span>':''))}catch(e){self.SQERR&&SQERR(e,'225-25')}return h})}
 // ---------------- guild quests in the quest log / tracker ----------------
 const GQ=()=>{try{const S=window.SQGUILD;if(!S||!S.id||!S.state)return null;const q=S.state.q;if(!q||!S.QK||!S.QK[q.k])return null;return{S,q,K:S.QK[q.k],id:'gq:'+S.id+':'+(q.t||0)}}catch(e){return null}};
 const kfmt=n=>n>=1e6?(n/1e6).toFixed(n%1e6?1:0)+'M':n>=1e4?(Math.floor(n/100)/10).toFixed(n%1000?1:0)+'k':n.toLocaleString();
 const VERB={wood:'Cut trees anywhere',mine:'Mine rocks and ores anywhere',forage:'Forage anywhere',fish:'Catch fish anywhere'};
 (window.SQQEXTRA=window.SQQEXTRA||[]).push(()=>{const G=GQ();if(!G)return[];const{q,K,S,id}=G,p=Math.min(q.goal,q.p|0);  const a=(window.SQCURAREA&&SQCURAREA())||'hollow',gn=(S.state.info&&S.state.info.n)||'your guild';
  return[{id,cat:'Guild',area:/^scene:/.test(a)?'hollow':a,name:K.n,desc:(K.vt?K.vt.replace('#',(q.goal|0).toLocaleString('en-US')):K.verb)+' together with '+gn+'. Everything every member gathers anywhere counts.',st:'active',
   step:q.done?'Done! The leader or an officer picks the reward (START > Guild)':VERB[q.k]||K.verb,prog:kfmt(p)+' / '+kfmt(q.goal),ready:!!q.done,
   rew:'One reward for the guild bank: '+K.rw.map(r=>Object.entries(r).map(([k,n])=>n.toLocaleString()+' '+((INAME[k]||k).toLowerCase())).join(', ')).join(' or '),at:null,kind:'guild'}]});
 window.SQGQTRKBTN=()=>{const G=GQ();if(!G)return'';const on=window.SQTRKID&&SQTRKID()===G.id;
  return'<button class="qb" data-gqtrk="'+(on?'off':'on')+'" style="margin-top:8px">'+(on?'★ Tracking · tap to stop':'Track in the quest tracker')+'</button>'};
 pbd.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-gqtrk]');if(!b)return;e.stopPropagation();e.preventDefault();const G=GQ();if(!G||!window.SQTRKSET)return;
  if(b.dataset.gqtrk==='on'){SQTRKSET(G.id);try{sfx('quest')}catch(x){self.SQERR&&SQERR(x,'225-26')}say('Tracking the guild quest.')}else{SQTRKSET('');try{sfx('swish')}catch(x){self.SQERR&&SQERR(x,'225-27')}}try{rPn()}catch(x){self.SQERR&&SQERR(x,'225-28')}},true);
})();
