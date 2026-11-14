// ---- 192. Events on a schedule (Dev Suite > Events) ----
// Library `sched.ev_<id>` = {n name, msg (shown when it starts), from, to (ms, UTC), rep ''|'day'|'week' (the from..to window repeats
// every day/week; it must be shorter than that), xp multiplier 1-5, xs skill (-1 = every skill), gold % more from monsters,
// mob {k monster key (SQISLIFE.MOBS), n at once 1-8, r region id or 'any'}, shop cs_<id> (a Content shop sold from the event card),
// off 1 = paused}. Published with the library, so the game knows the whole schedule ahead and switches events on/off by the clock
// (no database writes). While one runs: a pill under the top-right corner (tap = the event card), XP ×xp in the outermost addXp,
// extra gold after each kill (outermost killEnemy: its 2-6 gold + the drop's), event monsters kept around you outdoors in that region (tagged `_ev`, kept alive
// through Hollow's daylight like 121's DEVM), and the shop. `SQEVENTS.force(id)` runs one now in your own game only (Dev Suite).
(()=>{if(!window.SQA)return;const TAB=43,DAY=864e5,WEEK=7*DAY;
 const num=(v,lo,hi,d)=>{v=+v;return isFinite(v)?Math.max(lo,Math.min(hi,v)):d};
 const clean=(v,n)=>String(v==null?'':v).replace(/[<>&"]/g,'').trim().slice(0,n);
 let EVS={};const FORCE={};// id -> until (ms), dev preview only
 function norm(L){const out={};for(const id in L||{}){const e=L[id];if(!/^ev_[a-z0-9_]{1,30}$/.test(id)||!e||typeof e!=='object')continue;const from=+e.from,to=+e.to;if(!(from>0&&to>from))continue;
   const rep=['day','week'].includes(e.rep)?e.rep:'';if(rep&&to-from>=(rep==='day'?DAY:WEEK))continue;const m=e.mob&&typeof e.mob==='object'&&typeof e.mob.k==='string'&&e.mob.k?{k:e.mob.k.slice(0,40),n:num(e.mob.n,1,8,3)|0,r:clean(e.mob.r,40)||'any'}:null;
   out[id]={n:clean(e.n,40)||'Event',msg:clean(e.msg,200),from,to,rep,xp:num(e.xp,1,5,1),xs:num(e.xs,-1,40,-1)|0,gold:num(e.gold,0,500,0)|0,mob:m,shop:/^cs_[a-z0-9_]{1,30}$/.test(e.shop)?e.shop:'',off:!!e.off}}return out}
 // the window (start, end) an event is in at time t, or null
 function win(e,t){if(e.off)return null;if(!e.rep)return t>=e.from&&t<e.to?[e.from,e.to]:null;const P=e.rep==='day'?DAY:WEEK;if(t<e.from)return null;const k=Math.floor((t-e.from)/P),s=e.from+k*P;return t<s+(e.to-e.from)?[s,s+(e.to-e.from)]:null}
 function next(e,t){if(e.off)return null;if(!e.rep)return t<e.from?e.from:null;const P=e.rep==='day'?DAY:WEEK;if(t<e.from)return e.from;return e.from+(Math.floor((t-e.from)/P)+1)*P}
 function active(t){t=t||Date.now();const out=[];for(const id in EVS){const e=EVS[id],f=FORCE[id]>t?[t,FORCE[id]]:null,w=f||win(e,t);if(w)out.push({id,e,end:w[1],start:w[0]})}return out}
 SQA.onApply(lib=>{EVS=norm(lib&&lib.sched)});
 const playing=()=>!(window.SQTITLE&&SQTITLE())&&typeof dead!=='undefined'&&!dead;
 // ---- XP and gold ----
 {const _ax=addXp;addXp=function(i,x){if(x>0){let m=1;for(const a of active())if(a.e.xp>1&&(a.e.xs<0||a.e.xs===i))m=Math.max(m,a.e.xp);if(m>1)x=Math.round(x*m)}return _ax.call(this,i,x)}}
 {const _ed=killEnemy;killEnemy=function(n){const g0=GLD,out=_ed.apply(this,arguments);try{if(n&&!n._rp){let p=0;for(const a of active())p=Math.max(p,a.e.gold);const got=GLD-g0;if(p>0&&got>0){const add=Math.max(1,Math.round(got*p/100));GLD+=add;try{drops.push({x:n.x,y:n.y-24,t:0,tx:'+'+add+' event gold',c:'#f8d848'})}catch(e){}}}}catch(e){}return out}}
 // ---- event monsters ----
 const EVM=new Set();let evScene=null;
 const outdoors=()=>!SCENE||SCENE.id==='region';
 const region=()=>{try{return typeof curRegion==='function'?curRegion():'hollow'}catch(e){return'hollow'}};
 function spawnOne(a){const M=window.SQISLIFE&&SQISLIFE.MOBS&&SQISLIFE.MOBS[a.e.mob.k];if(!M)return false;
  for(let t=0;t<24;t++){const ang=Math.random()*6.283,d=150+Math.random()*110,x=P.x+Math.cos(ang)*d,y=P.y+Math.sin(ang)*d;try{if(solid(x,y))continue}catch(e){continue}
   const m=rgMake(a.e.mob.k,M.hp,x,y);if(!m)return false;m.mhp=m.mhp||M.hp;if(M.rg)m.rg=M.rg;delete m.night;m._ev=a.id;try{RG_OWN.add(m)}catch(_){}en.push(m);EVM.add(m);evScene=SCENE?SCENE.id+(SCENE.room&&SCENE.room.region||''):'hollow';return true}return false}
 let spT=0;
 {const _u=upd;upd=function(dt){const r=_u.apply(this,arguments);try{
   const sc=SCENE?SCENE.id+(SCENE.room&&SCENE.room.region||''):'hollow';if(sc!==evScene&&EVM.size)EVM.clear();
   const melt=!SCENE&&typeof dark==='function'&&dark()<.05?(+dt||0)*.5:0;for(const m of EVM){if(m.dead||m.hp<=0){EVM.delete(m);continue}if(melt)m.hp=Math.min(m.mhp||m.hp+melt,m.hp+melt);if(!en.includes(m)&&Math.hypot(m.x-P.x,m.y-P.y)<420)en.push(m)}
   spT-=+dt||0;if(spT<=0){spT=4;if(playing()&&outdoors())for(const a of active()){if(!a.e.mob||(a.e.mob.r!=='any'&&a.e.mob.r!==region()))continue;let n=0;for(const m of EVM)if(m._ev===a.id&&Math.hypot(m.x-P.x,m.y-P.y)<500)n++;if(n<a.e.mob.n)spawnOne(a)}}
  }catch(e){}return r}}
 // ---- pill, start notice, event card ----
 const pill=document.createElement('button');pill.id='sqsev';pill.type='button';pill.style.cssText='position:fixed;right:10px;top:calc(env(safe-area-inset-top,0px) + 36px);z-index:25;display:none;background:#183028;color:#d8ffe8;border:2px solid #40b878;border-radius:0;padding:3px 9px;font:700 12px '+PF+';cursor:pointer;max-width:60vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';document.body.appendChild(pill);
 pill.addEventListener('click',e=>{e.stopPropagation();openCard()});
 const left=ms=>{const m=Math.max(0,Math.ceil(ms/60000));return m>=2880?Math.round(m/1440)+' days':m>90?Math.round(m/60)+' h':m+' min'};
 const what=e=>{const p=[];if(e.xp>1)p.push('×'+e.xp+' '+(e.xs>=0?(SKN[e.xs]||'')+' ':'')+'XP');if(e.gold)p.push('+'+e.gold+'% gold');if(e.mob){const M=window.SQISLIFE&&SQISLIFE.MOBS[e.mob.k];p.push((M?M.n:'Monsters')+(e.mob.r==='any'?' everywhere':' on '+((WORLD_REGIONS[e.mob.r]||{}).name||e.mob.r)))}if(e.shop)p.push('event shop');return p};
 let SEEN={};try{SEEN=JSON.parse(localStorage.getItem('sq_evseen')||'{}')||{}}catch(e){}
 setInterval(()=>{try{const A=active(),on=A.length&&playing()&&!pnOpen&&!menuOpen;pill.style.display=on?'block':'none';
   if(on){const a=A[0];pill.textContent='🎉 '+a.e.n+(A.length>1?' +'+(A.length-1):'')+' · '+left(a.end-Date.now())}
   // 161's XP pill sits at the very top; when it isn't showing, take its place
   const xp=document.getElementById('sqevp');pill.style.top='calc(env(safe-area-inset-top,0px) + '+(xp&&xp.style.display==='block'?36:8)+'px)';
   if(playing())for(const a of A){const k=a.id+'@'+a.start;if(SEEN[k])continue;SEEN[k]=1;try{const ks=Object.keys(SEEN);if(ks.length>40)for(const x of ks.slice(0,ks.length-40))delete SEEN[x];localStorage.setItem('sq_evseen',JSON.stringify(SEEN))}catch(e){}
    say('🎉 Event: '+a.e.n+(a.e.msg?' — '+a.e.msg:'')+' ('+what(a.e).join(', ')+'). Ends in '+left(a.end-Date.now())+'.');msgT=8;try{sfx('quest')}catch(e){}break}}catch(e){}},1000);
 function openCard(){if(!playing())return;pnOpen=true;ptab=TAB;jx=jy=0;pn.style.display='block';rPn();try{sfx('talk')}catch(e){}}
 function cardHTML(){const A=active(),t=Date.now();let h='<div class="tl">EVENTS</div>';if(!A.length)h+='<div class="qc">No event is running right now.</div>';
  for(const a of A){const e=a.e;h+='<div class="qc"><b style="color:#c83820">'+esc(e.n)+'</b> <small>· ends in '+left(a.end-t)+'</small>'+(e.msg?'<br>'+esc(e.msg):'')+'<br><small>'+what(e).map(esc).join(' · ')+'</small>'+
   (e.shop&&window.SQCONTENT&&SQCONTENT.C.shops[e.shop]?'<div style="margin-top:6px"><button class="sb" data-evshop="'+e.shop+'" style="min-width:0;padding:8px 12px">🛒 '+esc(SQCONTENT.C.shops[e.shop].n||'Event shop')+'</button></div>':'')+'</div>'}
  const up=Object.entries(EVS).map(([id,e])=>[id,e,next(e,t)]).filter(x=>x[2]&&!A.some(a=>a.id===x[0])).sort((a,b)=>a[2]-b[2]).slice(0,3);
  if(up.length)h+='<div class="qc" style="font-size:12px"><b>Coming up</b><br>'+up.map(([,e,s])=>esc(e.n)+' · in '+left(s-t)).join('<br>')+'</div>';
  return h+'<div class="pmb"><button class="sb no" data-evx="1">CLOSE</button></div>'}
 {const _r=rPn;rPn=function(){if(ptab!==TAB)return _r.apply(this,arguments);try{panelChrome('')}catch(e){}pbd.innerHTML=cardHTML()}}
 pbd.addEventListener('click',e=>{if(ptab!==TAB||!pnOpen)return;const b=e.target.closest('[data-evshop],[data-evx]');if(!b)return;e.stopPropagation();e.preventDefault();
  if(b.dataset.evshop){const id=b.dataset.evshop;if(!active().some(a=>a.e.shop===id)){closePanel();return}closePanel();SQCONTENT.openShop(id,'Event shop');return}closePanel()},true);
 window.SQEVENTS={active,win,next,norm,force(id,min){FORCE[id]=Date.now()+(min||10)*60000},unforce(id){delete FORCE[id]},open:openCard,get list(){return EVS},EVM};
 // ======================= Dev Suite > Events =======================
 if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,E,dset,toast,fail,arm}=API;
 const T={sel:null,w:null,dirty:false};
 const D0=()=>S.draft.sched||(S.draft.sched={});
 const pad=n=>String(n).padStart(2,'0');
 const toLocal=ms=>{const d=new Date(ms);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes())};
 const fromLocal=s=>{const t=new Date(s).getTime();return isFinite(t)?t:0};
 const opt=(L,v)=>L.map(([k,n])=>'<option value="'+E(k)+'"'+(String(v)===String(k)?' selected':'')+'>'+E(n)+'</option>').join('');
 const mobList=()=>Object.entries(window.SQISLIFE&&SQISLIFE.MOBS||{}).map(([k,m])=>[k,m.n]).sort((a,b)=>a[1].localeCompare(b[1]));
 const shopList=()=>{const L=(S.draft.content||{}).shops||{};return Object.keys(L).filter(k=>/^cs_/.test(k)).map(k=>[k,L[k].n||k])};
 const regList=()=>[['any','Anywhere outdoors'],...Object.values(WORLD_REGIONS).map(r=>[r.id,r.name])];
 const COL=['#40b878','#d08838','#a050d0','#3888d0','#d04868','#b8a830'];
 function blank(){const s=new Date();s.setMinutes(0,0,0);s.setHours(s.getHours()+1);return{n:'Weekend bonus',msg:'Double XP for everyone!',from:s.getTime(),to:s.getTime()+48*36e5,rep:'',xp:2,xs:-1,gold:0}}
 // two weeks ahead, one row per event, bars where it runs
 function calendar(){const L=norm(D0()),ids=Object.keys(L);const t0=new Date();t0.setHours(0,0,0,0);const start=t0.getTime(),days=14,end=start+days*DAY;
  let h='<div class="dv-card"><b>The next two weeks</b><p class="dv-mut" style="font-size:12px">Your local time. A bar is when the event runs; tap one to edit it.</p><div class="dv-evcal"><div class="dv-evh"><span></span>';
  for(let i=0;i<days;i++){const d=new Date(start+i*DAY);h+='<span'+(i===0?' class="dv-evt"':'')+'>'+['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()]+'<br>'+d.getDate()+'</span>'}h+='</div>';
  ids.forEach((id,j)=>{const e=L[id];let bars='';const add=(a,b)=>{a=Math.max(a,start);b=Math.min(b,end);if(b<=a)return;bars+='<i style="left:'+((a-start)/(end-start)*100)+'%;width:'+Math.max(.6,(b-a)/(end-start)*100)+'%;background:'+COL[j%COL.length]+'"></i>'};
   if(!e.rep)add(e.from,e.to);else{const P=e.rep==='day'?DAY:WEEK;let s=e.from;if(s<start)s=e.from+Math.floor((start-e.from)/P)*P;for(let k=0;k<40&&s<end;k++,s+=P)if(s+(e.to-e.from)>start)add(Math.max(s,e.from),s+(e.to-e.from))}
   h+='<div class="dv-evr" data-evs="'+E(id)+'"><span>'+E(e.n)+(e.off?' (paused)':'')+'</span><div>'+bars+'<b style="left:'+((Date.now()-start)/(end-start)*100)+'%"></b></div></div>'});
  if(!ids.length)h+='<p class="dv-mut">No events yet.</p>';return h+'</div></div>'}
 function render(){const L=D0(),Lv=S.live&&S.live.sched||{},ids=Object.keys(L).sort();
  let h='<div class="dv-spr'+(T.sel?' dv-has':'')+'"><div class="dv-ls"><button class="dv-b dv-pri" data-evx="new">+ New event</button><div class="dv-grid" style="grid-template-columns:1fr">';
  for(const id of ids){const e=L[id],same=JSON.stringify(e)===JSON.stringify(Lv[id]),n=norm({[id]:e})[id],on=n&&win(n,Date.now());
   h+='<button class="dv-it'+(T.sel===id?' dv-on':'')+'" data-evs="'+E(id)+'" style="flex-direction:row;justify-content:flex-start;padding:8px 10px"><i class="dv-bd dv-'+(same?'live':'draft')+'">'+(same?'LIVE':'DRAFT')+'</i><span style="font-size:13px;text-align:left">'+(on?'🟢 ':'')+E(e.n||id)+'<br><small class="dv-mut">'+(n?new Date(n.from).toLocaleString([], {dateStyle:'medium',timeStyle:'short'})+(n.rep?' · every '+n.rep:''):'dates not set')+'</small></span></button>'}
  if(!ids.length)h+='<p class="dv-mut">Nothing scheduled.</p>';h+='</div></div><div class="dv-ed">';
  if(!T.sel||!T.w)h+='<div class="dv-card"><b>🎉 Events</b><p class="dv-mut">Plan events ahead: bonus XP (for everyone or one skill), more gold from monsters, special monsters that roam an island, and a pop-up shop. They switch on and off by the clock for every player once published, can repeat every day or week, and show as a pill on the screen with a card that counts down.</p></div>'+calendar();
  else{const e=T.w,id=T.sel;const fld=(l,x)=>'<div style="margin:8px 0"><label class="dv-mut" style="display:block;margin-bottom:2px">'+l+'</label>'+x+'</div>';
   h+='<div class="dv-card"><div class="dv-row"><b style="font-size:16px">'+E(e.n||id)+'</b><span class="dv-mut">'+E(id)+'</span></div>'+
    fld('Name','<input type="text" data-ef="n" maxlength="40" value="'+E(e.n||'')+'">')+fld('Message when it starts','<input type="text" data-ef="msg" maxlength="200" value="'+E(e.msg||'')+'" style="width:100%">')+
    '<div class="dv-row" style="flex-wrap:wrap;gap:12px">'+fld('Starts (your time)','<input type="datetime-local" data-ef="from" value="'+(e.from?toLocal(e.from):'')+'">')+fld('Ends','<input type="datetime-local" data-ef="to" value="'+(e.to?toLocal(e.to):'')+'">')+
    fld('Repeats','<select data-ef="rep">'+opt([['','No, just once'],['day','Every day'],['week','Every week']],e.rep||'')+'</select>')+'</div>'+
    '<div class="dv-row" style="flex-wrap:wrap;gap:12px">'+fld('XP multiplier (1 = none, up to 5)','<input type="number" data-ef="xp" min="1" max="5" step="0.1" value="'+(e.xp||1)+'" style="width:90px">')+fld('…for','<select data-ef="xs">'+opt([['-1','Every skill'],...SKN.map((n,i)=>[String(i),n])],e.xs==null?-1:e.xs)+'</select>')+
    fld('More gold from monsters (%)','<input type="number" data-ef="gold" min="0" max="500" value="'+(e.gold||0)+'" style="width:90px">')+'</div>'+
    '<div class="dv-row" style="flex-wrap:wrap;gap:12px">'+fld('Special monsters','<select data-ef="mob.k"><option value="">(none)</option>'+opt(mobList(),e.mob&&e.mob.k||'')+'</select>')+
    (e.mob&&e.mob.k?fld('How many around you','<input type="number" data-ef="mob.n" min="1" max="8" value="'+(e.mob.n||3)+'" style="width:70px">')+fld('Where','<select data-ef="mob.r">'+opt(regList(),e.mob.r||'any')+'</select>'):'')+'</div>'+
    fld('Pop-up shop (a shop from Content > Shops, sold from the event card)','<select data-ef="shop"><option value="">(none)</option>'+opt(shopList(),e.shop||'')+'</select>')+
    '<label class="dv-chk"><input type="checkbox" data-ef="off"'+(e.off?' checked':'')+'> Paused (keeps it in the schedule without running)</label>'+
    '<p class="dv-mut" id="dvevmsg">'+E(problem(e)||'')+'</p>'+
    '<div class="dv-row" style="margin-top:10px;flex-wrap:wrap"><button class="dv-b dv-pri" data-evx="save">Save to draft</button><button class="dv-b" data-evx="try">Run it in my game for 10 minutes</button><button class="dv-b '+(S.arm==='evdel'?'dv-arm':'dv-bad')+'" data-evx="del">'+(S.arm==='evdel'?'Tap again to delete':'Delete')+'</button></div>'+
    '<p class="dv-mut" style="font-size:12px">Players see it at its time after you Publish. "Run it" only changes your own game, for testing.</p></div>'+calendar()}
  return h+'</div></div>'}
 function problem(e){if(!(e.from>0&&e.to>e.from))return'⚠️ The end must be after the start.';if(e.rep&&e.to-e.from>=(e.rep==='day'?DAY:WEEK))return'⚠️ A repeating event must be shorter than a '+e.rep+'.';if(!(e.xp>1)&&!e.gold&&!(e.mob&&e.mob.k)&&!e.shop)return'⚠️ It doesn\'t do anything yet: add XP, gold, monsters or a shop.';return''}
 const tidy=e=>{const o=JSON.parse(JSON.stringify(e));if(!o.mob||!o.mob.k)delete o.mob;for(const k of['msg','rep','shop'])if(!o[k])delete o[k];if(!o.off)delete o.off;if(!o.gold)delete o.gold;if(o.xs==null||o.xs<0)delete o.xs;if(!(o.xp>1))delete o.xp;return o};
 function setF(f,v){const e=T.w;if(f.startsWith('mob.')){e.mob=e.mob||{};e.mob[f.slice(4)]=v;if(f==='mob.k'&&!v)delete e.mob}else e[f]=v;T.dirty=true}
 const inTab=t=>S.tab==='sched'&&t&&document.getElementById('dvs')&&document.getElementById('dvs').contains(t);
 document.addEventListener('change',ev=>{const t=ev.target;if(!inTab(t)||!t.dataset.ef||!T.w)return;const f=t.dataset.ef;let v=t.type==='checkbox'?(t.checked?1:0):t.value;
  if(f==='from'||f==='to')v=fromLocal(v);else if(['xp','xs','gold','mob.n'].includes(f))v=+v;setF(f,v);API.draw()},true);
 document.addEventListener('input',ev=>{const t=ev.target;if(!inTab(t)||!t.dataset.ef||!T.w||t.tagName==='SELECT'||t.type==='checkbox'||t.type==='datetime-local')return;const f=t.dataset.ef;setF(f,t.type==='number'?+t.value:t.value);const m=document.getElementById('dvevmsg');if(m)m.textContent=problem(T.w)},true);
 document.addEventListener('click',ev=>{const t=ev.target.closest&&ev.target.closest('[data-evx],[data-evs]');if(!inTab(t))return;ev.preventDefault();
  if(t.dataset.evs){if(T.dirty&&T.sel!==t.dataset.evs&&!API.confirmLeave())return;T.sel=t.dataset.evs;T.w=JSON.parse(JSON.stringify(D0()[T.sel]||blank()));T.dirty=false;API.draw();return}
  const a=t.dataset.evx;
  if(a==='new'){let i=Object.keys(D0()).length+1,id;do id='ev_'+(i++);while(D0()[id]);T.sel=id;T.w=blank();T.dirty=true;API.draw();return}
  if(a==='save'){const p=problem(T.w);if(p&&/end|shorter/.test(p)){toast(p.replace('⚠️ ',''));return}const o=tidy(T.w);D0()[T.sel]=o;dset('draft/sched/'+T.sel,o).then(()=>{T.dirty=false;toast('Saved to draft. Publish it from the Publish tab.');if(SQA.previewing)SQA.preview(S.draft);API.draw()}).catch(fail);return}
  if(a==='try'){const n=norm({[T.sel]:tidy(T.w)})[T.sel];if(!n){toast('Set a start and an end first.');return}EVS[T.sel]=n;window.SQEVENTS.force(T.sel,10);toast('Running in your game for 10 minutes (only for you).');return}
  if(a==='del')return arm('evdel',async()=>{delete D0()[T.sel];try{await dset('draft/sched/'+T.sel,null);toast('Deleted from your draft.')}catch(e){fail(e)}window.SQEVENTS.unforce(T.sel);T.sel=T.w=null;T.dirty=false;if(SQA.previewing)SQA.preview(S.draft);API.draw()})},true);
 if(!document.getElementById('dvevcss')){const st=document.createElement('style');st.id='dvevcss';st.textContent='.dv-evcal{overflow-x:auto}.dv-evh,.dv-evr{display:grid;grid-template-columns:140px 1fr;align-items:center;min-width:560px}.dv-evh{grid-template-columns:140px repeat(14,1fr);font-size:11px;text-align:center;opacity:.8;margin-bottom:4px}.dv-evh .dv-evt{color:#f8d048;font-weight:700}.dv-evr{margin:4px 0;cursor:pointer}.dv-evr>span{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:6px}.dv-evr>div{position:relative;height:18px;background:repeating-linear-gradient(90deg,#ffffff10 0 1px,transparent 1px calc(100%/14));border-radius:4px}.dv-evr i{position:absolute;top:2px;bottom:2px;border-radius:3px}.dv-evr b{position:absolute;top:-2px;bottom:-2px;width:2px;background:#f8d048}';document.head.appendChild(st)}
 SQSUITE.addTab('sched','Events',{render,dirty:()=>T.dirty,leave(){T.sel=T.w=null;T.dirty=false},changes(L,Dr){const out=[],a=L&&L.sched||{},b=Dr&&Dr.sched||{};for(const id of new Set([...Object.keys(a),...Object.keys(b)]))if(JSON.stringify(a[id])!==JSON.stringify(b[id]))out.push({kind:'ext',html:'🎉 Event '+E((b[id]||a[id]).n||id)+': '+(b[id]?(a[id]?'changed':'new'):'removed')});return out}})})();
