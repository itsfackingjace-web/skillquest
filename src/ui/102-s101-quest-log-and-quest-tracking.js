// ---- 101. Quest log and quest tracking ----
// One quest log for everything (Elder Rowan's quests, every village's quests, the voyages), in three tabs: Active,
// Available and Done. Track one quest: the HUD shows its next step, an arrow points the way (to the person to talk to,
// the nearest tree, wolf or buoy you need, or the harbor post to report to), and the map marks the spot.
{const E=s=>typeof esc==='function'?esc(String(s)):String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const nm=(k,n)=>{const s=INAME[k]||k;return(n>1?(typeof SN!=='undefined'&&SN[k])||(/s$/.test(s)?s:s+'s'):s).toLowerCase()};
 const town=t=>(typeof SQTOWN!=='undefined'&&SQTOWN[t])||({briarwood:'Thornbrook',ashfall:'Emberwatch'})[t]||t;
 const isl=a=>a==='hollow'?'Hollow Island':(WORLD_REGIONS[a]&&WORLD_REGIONS[a].name)||a;
 let TRK=null;try{TRK=localStorage.getItem('sq_trk')}catch(e){}
 let QTAB='active',QOPEN=null;
 // ---------- every quest, from every source ----------
 function step(q,ready,giver){// the next thing to do, in a few words
  if(ready)return'Return to '+giver;const t=q.type;
  if(t==='give')return'Bring '+giver+' '+q.amt+' '+nm(q.item,q.amt);
  if(t==='kill')return'Defeat '+q.amt+' '+(q.item?nm(q.item==='skel'?'skeleton':q.item,q.amt).replace(/^briarwolfs?$/,'briar wolves').replace(/^wolfs$/,'wolves'):'slimes');
  if(t==='cook')return'Cook '+q.amt+' meals at a campfire';if(t==='day')return'Survive until day '+q.amt;if(t==='harvest')return'Harvest '+q.amt+' crops';
  if(t==='chess')return'Win a game of chess';if(t==='talk')return'Talk to the harbor master in Saltmere';if(t==='hermit')return'Find the Old Hermit';
  if(t==='jobs')return'Do '+q.amt+' jobs for villagers';if(t==='village')return'Finish the quests of all three villages';if(t==='total')return'Reach total level '+q.amt;
  if(t==='dungeonboss'||t==='boss'||t==='bonelord')return'Defeat '+q.n.replace(/^(The |Heart of |Beneath the )/,'the ');
  return(q.d||'').replace(/^"[^"]*"\s*/,'').slice(0,60)}
 function qAll(){const out=[];
  // Elder Rowan
  QS.forEach((q,i)=>{const done=i<Q.i||(typeof QDONE!=='undefined'&&QDONE.has(q.n));const id='m:'+q.n;
   if(done){out.push({id,cat:'Elder Rowan',area:'hollow',name:q.n,st:'done',rew:rewardTxt(q)});return}
   if(i!==Q.i)return;let ready=false,prog='';try{ready=Q.on&&qDone(q);prog=Q.on?qProg(q):''}catch(e){}
   out.push({id,cat:'Elder Rowan',area:'hollow',name:q.n,desc:q.d,st:Q.on?'active':'avail',step:Q.on?step(q,ready,'Elder Rowan'):'Talk to Elder Rowan in Hollow Village',prog,ready,rew:rewardTxt(q),q,kind:'main'})});
  // the villages and island towns
  if(typeof SIDE_QS!=='undefined')for(const t in SIDE_QS){const L=SIDE_QS[t],s=SQ_SIDE[t];if(!L||!L.length||!s)continue;if(t==='frosthollow'&&typeof FHON!=='undefined'&&!FHON)continue;
   const rg=(typeof SQ_REGION!=='undefined'&&SQ_REGION[t])||'hollow';if(rg!=='hollow'&&typeof routeOpen==='function'&&!routeOpen(rg))continue;
   L.forEach((q,i)=>{const id='s:'+t+':'+i,giver=sqGiverName(q.giver);let rew='';try{rew=sqReward(q)}catch(e){}
    if(s.completed||i<s.index){out.push({id,cat:town(t),area:rg,name:q.n,st:'done',rew});return}if(i!==s.index)return;
    const ready=sqReady(t);out.push({id,cat:town(t),area:rg,name:q.n,desc:q.d,st:s.on?'active':'avail',step:s.on?step(q,ready,giver):'Talk to '+giver+' in '+town(t),prog:s.on?sqProg(t)+'/'+q.amt:'',ready,rew,q,kind:'side',t,giver:q.giver})})}
  // voyages
  if(typeof VOYS!=='undefined'){const V=VQ();for(const q of VOYS){const id='v:'+q.id,post=HARBOR_POSTS.find(p=>p.id===q.post);
   if(V[q.id]===99)out.push({id,cat:'Voyage',area:'hollow',name:q.name,st:'done',rew:q.gold?q.gold+' gold':''});
   else if(V[q.id])out.push({id,cat:'Voyage',area:'hollow',name:q.name,desc:q.d,st:'active',step:q.steps[V[q.id]-1],prog:V[q.id]+'/'+q.steps.length,rew:q.gold?q.gold+' gold':'',q,kind:'voy',si:V[q.id]-1});
   else{let ok=true;try{ok=typeof vNeedsOK!=='function'||vNeedsOK(q)}catch(e){}if(ok)out.push({id,cat:'Voyage',area:'hollow',name:q.name,desc:q.d,st:'avail',step:'Ask at the '+(post?post.name:'')+' harbor post',rew:q.gold?q.gold+' gold':'',q,kind:'voyAvail'})}}}
  return out}
 window.SQQUESTS=qAll;
 function tracked(L){L=L||qAll();let e=TRK&&L.find(e=>e.id===TRK&&e.st!=='done');if(!e)e=L.find(e=>e.st==='active'&&e.kind==='main')||L.find(e=>e.st==='active')||L.find(e=>e.st==='avail');return e||null}
 // ---------- where to go ----------
 const curArea=()=>{if(!SCENE)return'hollow';const R=SCENE.room;if(R&&R.region)return R.region;return'scene:'+SCENE.id};
 const npcAt=id=>{const n=NPCS.find(o=>o.id===id||o.kind===id);if(!n)return null;if(n.scene){const base=n.scene.split('#')[0];if(SCENE&&SCENE.id===base)return{area:'scene:'+base,x:n.x,y:n.y};
   const d=entrances().find(d=>d.id===base);return d?{area:'hollow',x:d.x*16+8,y:d.y*16+14,lbl:'door'}:null}return{area:'hollow',x:n.x,y:n.y}};
 const SRC={wood:['tree','oak','pine','willow','maple','yew'],oaklog:['oak'],willowlog:['willow'],maplelog:['maple'],yewlog:['yew'],stone:['rock'],iron:['ore'],gold:['gold'],mith:['mith'],adam:['adam'],berry:['bush'],
  wolf:1,pelt:'wolf',bone:'skel'};
 function nearObj(types){const R=SCENE&&SCENE.room;let best=null,bd=1e9;const px=P.x/16,py=P.y/16,r=36;
  if(!SCENE){for(let y=Math.max(0,Math.floor(py-r));y<Math.min(N,py+r);y++)for(let x=Math.max(0,Math.floor(px-r));x<Math.min(N,px+r);x++){const o=obj[y*N+x];if(!o||!types.includes(o.t))continue;const d=(x+.5-px)**2+(y+.5-py)**2;if(d<bd){bd=d;best={area:'hollow',x:x*16+8,y:y*16+8}}}}
  else if(R&&R.region&&typeof rgNear==='function'){for(const it of rgNear(R,px-r,py-r,px+r,py+r)){if(it.t!=='_obj'||it.gone||!it.o||!types.includes(it.o.t))continue;const d=(it.x+.5-px)**2+(it.y+.5-py)**2;if(d<bd){bd=d;best={area:R.region,x:it.x*16+8,y:it.y*16+8}}}}
  return best}
 function nearMob(type){let best=null,bd=1e9;for(const m of en){if(m.dead||m.hp<=0||m.summon)continue;if(type&&m.type!==type&&!(type==='wolf'&&/wolf/.test(m.type)))continue;const d=(m.x-P.x)**2+(m.y-P.y)**2;if(d<bd){bd=d;best={area:curArea(),x:m.x,y:m.y,mob:1}}}return best}
 function regionGiver(rg,id){const R=SCENE&&SCENE.room;if(!R||R.region!==rg)return{area:rg};for(const it of R.items){const n=it.n;if(n&&(n.id===id||n.name===id))return{area:rg,x:n.x,y:n.y}}return{area:rg}}
 function target(e){if(!e)return null;
  if(e.kind==='main'||(!e.kind&&e.cat==='Elder Rowan')){const q=e.q;if(e.st==='avail'||e.ready)return npcAt('elder');
   if(q.type==='give'){const s=SRC[q.item];return Array.isArray(s)?nearObj(s):null}if(q.type==='kill')return nearMob(q.item||'slime');
   if(q.type==='hermit')return npcAt('hermit');if(q.type==='talk')return npcAt('harbor');return null}
  if(e.kind==='side'){const rg=e.area,gv=e.giver;const giverT=()=>rg==='hollow'?npcAt(gv):regionGiver(rg,gv);if(e.st==='avail'||e.ready)return giverT();
   const q=e.q;if(q.type==='give'){const s=SRC[q.item];return Array.isArray(s)?(nearObj(s)||null):null}if(q.type==='kill')return nearMob(q.item);return null}
  if(e.kind==='voyAvail'){const p=HARBOR_POSTS.find(p=>p.id===e.q.post);return p?{area:'hollow',x:p.x*16+8,y:p.y*16+8}:null}
  if(e.kind==='voy'){const q=e.q,s=e.step||'';if(/buoy/i.test(s)&&q.buoy&&BUOYS[q.buoy]){const b=BUOYS[q.buoy];return{area:'hollow',x:b.x*16+8,y:b.y*16+8}}
   if(/^Report/i.test(s)||/post/i.test(s)){let p=null;if(q.report==='any'||/any harbor/i.test(s)){let bd=1e9;for(const h of HARBOR_POSTS){const d=(h.x*16-P.x)**2+(h.y*16-P.y)**2;if(d<bd){bd=d;p=h}}}else p=HARBOR_POSTS.find(h=>s.includes(h.name))||HARBOR_POSTS.find(h=>h.id===q.post);
    return p?{area:'hollow',x:p.x*16+8,y:p.y*16+8}:null}return null}
  return null}
 let TGT=null,TGE=null,TGT_AT=0;
 function refresh(){const now=performance.now();if(now-TGT_AT<400)return;TGT_AT=now;try{TGE=tracked();TGT=target(TGE)}catch(e){TGT=null}}
 window.SQTRACK=()=>{refresh();return{e:TGE,t:TGT}};
 // the hint shown when the place is somewhere else
 function where(e,t){const a=curArea(),par=a.startsWith('scene:')?((SCENE.prev&&SCENE.prev.room&&SCENE.prev.room.region)||'hollow'):a;
  if(t&&t.area){if(t.area===a)return'';if(t.area.startsWith('scene:'))return'go inside';if(t.area===par)return'head outside';return'on '+isl(t.area)}
  return e&&e.area&&e.area!==par?'on '+isl(e.area):''}
 // ---------- the HUD line and the arrow ----------
 {const _hl=hudLayout;hudLayout=function(){const L=_hl();L.cy+=16*L.U;L.stackBottom+=16*L.U;return L}}
 const _dh=drawHUD;drawHUD=function(){_dh();if(menuOpen||typeof HUDL==='undefined'||!HUDL)return;refresh();const e=TGE,L=HUDL,{U,ins,qy,qw}=L;
  g.save();g.setTransform(1,0,0,1,0,0);g.shadowBlur=0;
  const t1=e?(e.st==='avail'?'! New: ':'')+e.name:'All quests complete!',wh=e?where(e,TGT):'',t2=e?(e.step||'')+(e.prog&&!e.ready?' ('+e.prog+')':'')+(wh?' · '+wh:''):'';
  g3box(ins,qy,qw,42*U,U,'#f8f0d8');g.font='700 '+11*U+'px '+PF;g3text(fitText(t1,qw-22*U),ins+11*U,qy+12*U,11,U,e&&e.st==='avail'?'#b06010':'#3058c8','left',700);
  g.font='600 '+11*U+'px '+PF;g3text(fitText(t2,qw-22*U),ins+11*U,qy+28*U,11,U,e&&e.ready?'#2f8a3a':'#404040','left',600);
  const t=TGT;if(t&&t.x!=null&&t.area===curArea()&&!dead&&!(typeof pnOpen!=='undefined'&&pnOpen)){const sx=W/2+(t.x-P.x)*Z,sy=H/2+(t.y-P.y)*Z,m=44*U,tm=performance.now()/1000,dist=Math.round(Math.hypot(t.x-P.x,t.y-P.y)/16);
   const col='#f8d048',drawTri=(x,y,an,s)=>{g.save();g.translate(x,y);g.rotate(an);g.beginPath();g.moveTo(s,0);g.lineTo(-s*.7,-s*.75);g.lineTo(-s*.35,0);g.lineTo(-s*.7,s*.75);g.closePath();g.lineWidth=3*U;g.strokeStyle='#302818';g.stroke();g.fillStyle=col;g.fill();g.restore()};
   if(sx>m&&sx<W-m&&sy>m+40*U&&sy<H-m&&dist>1){{const by=sy-(t.mob?26:22)*Z-Math.abs(Math.sin(tm*4))*5*U;drawTri(sx,by,Math.PI/2,9*U)}}
   if(dist>3){// an arrow circling you, pointing the way
    const an=Math.atan2(t.y-P.y,t.x-P.x),cx=W/2,cy=H/2-6*Z,r=26*Z,ax=cx+Math.cos(an)*r,ay=cy+Math.sin(an)*r*.8;drawTri(ax,ay,an,Math.max(7*U,3.2*Z)+Math.sin(tm*5)*U);
    g.font='700 '+11*U+'px '+PF;g.textAlign='center';g.textBaseline='middle';const lx=cx+Math.cos(an)*(r+14*U+3*Z),ly=cy+Math.sin(an)*(r*.8+10*U+2*Z);g.lineWidth=3*U;g.strokeStyle='#302818';g.strokeText(dist+'m',lx,ly);g.fillStyle='#f8f0d8';g.fillText(dist+'m',lx,ly)}}
  g.restore()};
 // ---------- the map marks the spot ----------
 {const _dm=drawMap;drawMap=function(){_dm();try{if(typeof MAPVIEW!=='undefined'&&MAPVIEW==='world')return;refresh();const t=TGT;if(!t||t.x==null)return;const c=document.getElementById('mpc');if(!c)return;
   const R=SCENE&&SCENE.room,area=R&&R.region?R.region:SCENE?null:'hollow';if(t.area!==area)return;const x=c.getContext('2d'),tx=t.x/16,ty=t.y/16,ph=(performance.now()/350)%2<1;
   x.save();x.strokeStyle='#302818';x.lineWidth=3;x.beginPath();x.arc(tx,ty,ph?5:6.5,0,6.283);x.stroke();x.strokeStyle='#f8d048';x.lineWidth=1.6;x.beginPath();x.arc(tx,ty,ph?5:6.5,0,6.283);x.stroke();x.fillStyle='#f8d048';x.fillRect(Math.round(tx)-1,Math.round(ty)-1,3,3);x.restore()}catch(e){}}}
 // ---------- the quest log ----------
 {const st=document.createElement('style');st.textContent=`#pn .qtabs{display:flex;gap:6px;margin:0 0 10px}#pn .qtabs button{flex:1;padding:9px 4px;border-radius:8px;border:2px solid #384870;background:#fff;color:#384870;font:700 15px var(--pf);cursor:pointer}
#pn .qtabs button.on{background:#5878b8;color:#fff}#pn .qe{background:#fff;border:2px solid #c8d0e0;border-radius:8px;margin:7px 0;color:#404040;font-family:var(--pf)}
#pn .qe.trk{border-color:#e0a020;box-shadow:inset 0 0 0 2px #f8d048}#pn .qh{display:flex;width:100%;align-items:flex-start;gap:8px;background:none;border:0;text-align:left;padding:10px 12px;cursor:pointer;color:#404040;font:600 16px var(--pf)}
#pn .qh .qt{flex:1;line-height:1.3}#pn .qh small{display:block;font-weight:400;font-size:13px;opacity:.8;margin-top:2px}#pn .qtag{flex:none;font:700 11px var(--pf);padding:3px 6px;border-radius:5px;background:#e4e8f0;color:#485870;margin-top:2px}
#pn .qtag.v{background:#d8ecff;color:#2858a0}#pn .qtag.s{background:#e4f2dc;color:#2f6a2a}#pn .qb2{padding:0 12px 10px;font-size:14px;line-height:1.4}#pn .qb2 p{margin:6px 0}#pn .qb2 .qr{color:#2f8a3a}
#pn .qtk{margin-top:4px;padding:8px 12px;border-radius:8px;border:2px solid #384870;background:#5878b8;color:#fff;font:700 14px var(--pf);cursor:pointer}#pn .qtk.on{background:#f8d048;color:#403010;border-color:#a07010}
#pn .qnone{padding:14px;text-align:center;opacity:.7;font-family:var(--pf);color:#404040}#pn .qsum{font:600 13px var(--pf);color:#485870;margin:0 0 8px;text-align:center}
#pn .qe.done .qh{font-weight:500;color:#6a7080;padding:8px 12px}#pn .qgrp{font:700 13px var(--pf);color:#485870;margin:12px 2px 2px;letter-spacing:.5px}`;document.head.appendChild(st)}
 questsHTML=function(){const L=qAll(),tk=tracked(L),act=L.filter(e=>e.st==='active'),av=L.filter(e=>e.st==='avail'),dn=L.filter(e=>e.st==='done');
  const tag=e=>'<span class="qtag'+(e.cat==='Voyage'?' v':e.cat!=='Elder Rowan'?' s':'')+'">'+E(e.cat)+'</span>';
  const card=e=>{const open=QOPEN===e.id||(QOPEN==null&&tk&&tk.id===e.id),isT=tk&&tk.id===e.id;
   let h='<div class="qe'+(isT?' trk':'')+(e.st==='done'?' done':'')+'"><button class="qh" data-qx="'+E(e.id)+'"><span class="qt">'+(e.st==='done'?'✓ ':isT?'▶ ':'')+E(e.name)+(e.st!=='done'?'<small>'+E(e.step||'')+(e.prog&&!e.ready?' · '+E(e.prog):'')+(e.ready?' · ready!':'')+(e.area&&e.area!=='hollow'?' · '+E(isl(e.area)):'')+'</small>':'')+'</span>'+tag(e)+'</button>';
   if(open&&e.st!=='done'){h+='<div class="qb2">'+(e.desc?'<p>'+E(e.desc)+'</p>':'')+(e.rew?'<p class="qr">Reward: '+E(e.rew)+'</p>':'')+'<button class="qtk'+(isT?' on':'')+'" data-qt="'+E(e.id)+'">'+(isT?'★ Tracking':'Track this quest')+'</button></div>'}
   return h+'</div>'};
  let h='<div class="qsum">Quest points: '+Q.qp+' / '+QS.length+' · '+dn.length+' quests done</div><div class="qtabs">'+[['active','Active',act.length],['avail','Available',av.length],['done','Done',dn.length]].map(([k,l,n])=>'<button data-qtab="'+k+'"'+(QTAB===k?' class="on"':'')+'>'+l+' ('+n+')</button>').join('')+'</div>';
  const list=QTAB==='active'?act:QTAB==='avail'?av:dn;
  if(!list.length)h+='<div class="qnone">'+(QTAB==='active'?'No quests in progress. Check the Available tab: talk to the person named there to start one.':QTAB==='avail'?'Nothing new right now. More quests open up as you finish others and explore new islands.':'No finished quests yet.')+'</div>';
  else if(QTAB==='done'){const grp={};for(const e of list)(grp[e.cat]||(grp[e.cat]=[])).push(e);for(const k in grp){h+='<div class="qgrp">'+E(k)+' ('+grp[k].length+')</div>';for(const e of grp[k])h+=card(e)}}
  else for(const e of list)h+=card(e);
  if(QTAB!=='done'){const more=QS.length-Q.i-1;if(more>0)h+='<div class="qnone" style="font-size:13px">Elder Rowan has '+more+' more quest'+(more>1?'s':'')+' for you after this one.</div>'}
  return h};
 pbd.addEventListener('click',ev=>{if(typeof ptab==='undefined'||ptab!==6)return;const t=ev.target;let b;
  if((b=t.closest('[data-qtab]'))){QTAB=b.dataset.qtab;QOPEN=null;sfx('talk');rPn();return}
  if((b=t.closest('[data-qt]'))){TRK=b.dataset.qt;try{localStorage.setItem('sq_trk',TRK)}catch(e){}TGT_AT=0;sfx('quest');rPn();return}
  if((b=t.closest('[data-qx]'))){const id=b.dataset.qx;QOPEN=QOPEN===id?'':id;sfx('talk');rPn();return}});
 // new quests jump to the front of the tracker when you start them
 let lastAct=null;setInterval(()=>{try{const ids=qAll().filter(e=>e.st==='active').map(e=>e.id);if(lastAct){const nw=ids.find(i=>!lastAct.includes(i));if(nw){TRK=nw;try{localStorage.setItem('sq_trk',TRK)}catch(e){}TGT_AT=0}}lastAct=ids}catch(e){}},1500)}
