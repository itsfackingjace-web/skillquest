// ---- 193. Dev Suite > Simulator: what monsters and loot tables really give, per kill and per hour ----
// Runs the game's own killEnemy() on monsters made with rgMake (so built-in drops, Monster rules, Content loot tables and event
// gold all count) inside a sandbox: the whole save (snap), localStorage sq_* keys and the kill counter are kept first and put back
// with applySave afterwards; say/sfx/saves/fx sends are muted while it runs. Bosses (cb:/ib/wb) are left out of the overview.
// Hours: seconds per kill = hits (health ÷ your melee damage now, at 2 swings a second) + `walk` seconds to reach the next one.
// "Use my draft" = what the Dev Suite preview applies (turn on "Show unpublished edits in my game" first).
(()=>{if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,E,toast}=API;
 const T={mob:'',n:500,walk:5,res:null,all:null,lt:'',ltn:1000,ltres:null,busy:false,sort:'gph'};
 const MOBS=()=>window.SQISLIFE&&SQISLIFE.MOBS||{};
 const mobList=()=>Object.entries(MOBS()).filter(([k])=>!/^(cb|ib|wb):/.test(k)).map(([k,m])=>[k,m.n,m.hp]).sort((a,b)=>a[1].localeCompare(b[1]));
 const dmg=()=>{try{return Math.max(1,1+(TL.sword|0)+lvOf(0)/15+(typeof meleeFlat==='function'?meleeFlat()||0:0))}catch(e){return 2}};
 const val=k=>k==='gold'?1:(SELLP[k]|0);
 function sandbox(fn){const s0=JSON.parse(JSON.stringify(snap())),k0=kills,ls={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^sq_/.test(k))ls[k]=localStorage.getItem(k)}
  const keep={say:window.say,sfx:window.sfx,sl:window.saveLocal,sc:window.saveCloud,pv:window.SQPVSEND},dl=drops.length,m0=msg,mt=msgT;
  say=()=>{};sfx=()=>{};saveLocal=()=>{};saveCloud=()=>{};window.SQPVSEND=()=>{};
  try{return fn()}finally{say=keep.say;sfx=keep.sfx;saveLocal=keep.sl;saveCloud=keep.sc;window.SQPVSEND=keep.pv;drops.length=dl;msg=m0;msgT=mt;
   try{applySave(s0)}catch(e){console.warn('sim restore',e)}kills=k0;for(const k in ls)localStorage.setItem(k,ls[k]);for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(/^sq_/.test(k)&&!(k in ls))localStorage.removeItem(k)}}}
 // kill `n` of monster `k`; totals of gold and every item
 function killMany(k,n){const M=MOBS()[k];if(!M)return null;const tot={gold:0},seen={};
  for(let i=0;i<n;i++){const m=rgMake(k,M.hp,P.x,P.y);if(!m)return null;m.mhp=m.mhp||M.hp;const g0=GLD,inv0={...inv};try{killEnemy(m,'melee')}catch(e){console.warn('sim',e);break}
   tot.gold+=GLD-g0;for(const x in inv){const d=(inv[x]|0)-(inv0[x]|0);if(d>0){tot[x]=(tot[x]|0)+d;seen[x]=(seen[x]|0)+1}}}
  return{k,n,hp:M.hp,tot,seen}}
 function perHour(r){const hits=Math.ceil(r.hp/dmg()),sec=hits*.5+T.walk,kph=3600/sec,v=Object.entries(r.tot).reduce((s,[x,c])=>s+c*val(x),0)/r.n;return{sec,kph,gpk:r.tot.gold/r.n,vpk:v,gph:kph*r.tot.gold/r.n,vph:kph*v}}
 function runOne(){if(!T.mob){toast('Pick a monster.');return}T.res=sandbox(()=>killMany(T.mob,T.n));if(!T.res)toast('Could not make that monster here.');API.draw()}
 function runAll(){T.busy=true;API.draw();setTimeout(()=>{const t0=performance.now();T.all=sandbox(()=>mobList().map(([k])=>killMany(k,150)).filter(Boolean));T.allMs=performance.now()-t0;T.busy=false;API.draw()},30)}
 function runLoot(){if(!window.SQCONTENT||!SQCONTENT.C.loot[T.lt]){toast('Pick a loot table (Content > Loot; save it with "Show unpublished edits" on).');return}
  const tot={},any={};for(let i=0;i<T.ltn;i++){const r=SQCONTENT.roll(T.lt);for(const x in r){tot[x]=(tot[x]|0)+r[x];any[x]=(any[x]|0)+1}}T.ltres={n:T.ltn,tot,any,id:T.lt};API.draw()}
 const nm=x=>x==='gold'?'Gold':INAME[x]||x,ico=x=>x==='gold'?'':'<img src="'+iconURL(x)+'" style="width:18px;height:18px;image-rendering:pixelated;vertical-align:middle;margin-right:4px" alt="">';
 const f1=v=>v>=100?Math.round(v).toLocaleString():v>=10?v.toFixed(1):v.toFixed(2);
 const pct=v=>(v*100>=10?Math.round(v*100):(v*100).toFixed(1))+'%';
 function bar(v,max,col){return'<span style="display:inline-block;height:8px;width:'+Math.max(2,Math.round(v/max*120))+'px;background:'+col+';border-radius:2px;vertical-align:middle"></span>'}
 function oneHTML(){const r=T.res;if(!r)return'';const h=perHour(r),rows=Object.entries(r.tot).filter(([x])=>x!=='gold').sort((a,b)=>b[1]*val(b[0])-a[1]*val(a[0]));
  let o='<div class="dv-card"><b>'+E(MOBS()[r.k].n)+' × '+r.n.toLocaleString()+'</b><p class="dv-mut" style="font-size:12px">'+r.hp+' health · '+Math.ceil(r.hp/dmg())+' hits at your damage ('+f1(dmg())+') · about '+f1(h.sec)+' s a kill → '+Math.round(h.kph)+' kills an hour</p>'+
   '<div class="dv-row" style="gap:18px;flex-wrap:wrap"><div><div class="dv-mut">Gold a kill</div><b style="font-size:20px">'+f1(h.gpk)+'</b></div><div><div class="dv-mut">Gold an hour</div><b style="font-size:20px">'+Math.round(h.gph).toLocaleString()+'</b></div><div><div class="dv-mut">Items sell for, an hour</div><b style="font-size:20px">'+Math.round(h.vph-h.gph).toLocaleString()+'</b></div></div>'+
   '<table style="border-collapse:collapse;margin-top:10px;width:100%"><tr class="dv-mut" style="font-size:12px;text-align:left"><th>Drop</th><th>Kills that dropped it</th><th>Each kill (avg)</th><th>An hour</th><th>Worth an hour</th></tr>';
  for(const[x,c]of rows){const ch=(r.seen[x]||0)/r.n;o+='<tr style="border-top:1px solid #ffffff14"><td style="padding:4px 2px">'+ico(x)+E(nm(x))+'</td><td>'+bar(ch,1,'#58a8f0')+' '+pct(ch)+'</td><td>'+f1(c/r.n)+'</td><td>'+f1(c/r.n*h.kph)+'</td><td>'+Math.round(c/r.n*h.kph*val(x)).toLocaleString()+' gold</td></tr>'}
  if(!rows.length)o+='<tr><td colspan="5" class="dv-mut">No item drops.</td></tr>';return o+'</table></div>'}
 function allHTML(){if(T.busy)return'<div class="dv-card"><b>Running every monster…</b></div>';if(!T.all)return'';const L=T.all.map(r=>({r,h:perHour(r)}));const key=T.sort;L.sort((a,b)=>key==='name'?MOBS()[a.r.k].n.localeCompare(MOBS()[b.r.k].n):b.h[key]-a.h[key]);
  const mx=Math.max(1,...L.map(x=>x.h.vph));const th=(k,l)=>'<th><a href="#" data-simsort="'+k+'" style="color:inherit'+(T.sort===k?';text-decoration:underline':'')+'">'+l+'</a></th>';
  let o='<div class="dv-card"><b>Every monster, 150 kills each</b> <span class="dv-mut" style="font-size:12px">('+Math.round(T.allMs)+' ms) · tap a heading to sort · tap a row for details</span><table style="border-collapse:collapse;margin-top:8px;width:100%;font-size:13px"><tr class="dv-mut" style="text-align:left">'+th('name','Monster')+th('sec','Seconds a kill')+th('gpk','Gold a kill')+th('gph','Gold an hour')+th('vph','Gold + items an hour')+'<th>Best drop</th></tr>';
  for(const{r,h}of L){const best=Object.entries(r.tot).filter(([x])=>x!=='gold').sort((a,b)=>b[1]*val(b[0])-a[1]*val(a[0]))[0];
   o+='<tr data-simrow="'+E(r.k)+'" style="border-top:1px solid #ffffff14;cursor:pointer"><td style="padding:4px 2px">'+E(MOBS()[r.k].n)+'</td><td>'+f1(h.sec)+'</td><td>'+f1(h.gpk)+'</td><td>'+Math.round(h.gph).toLocaleString()+'</td><td>'+bar(h.vph,mx,'#f8c048')+' '+Math.round(h.vph).toLocaleString()+'</td><td>'+(best?ico(best[0])+E(nm(best[0]))+' <span class="dv-mut">'+pct((r.seen[best[0]]||0)/r.n)+'</span>':'<span class="dv-mut">—</span>')+'</td></tr>'}
  o+='</table>';
  // what things cost, in hours of the best monster
  const top=L.slice().sort((a,b)=>b.h.vph-a.h.vph)[0];if(top){const sh=[];try{for(const L2 of[GEN,window.SHOPBW||[],window.SHOPAF||[]])for(const q of L2)if(q&&q.k&&q.c>0)sh.push(q)}catch(e){}
   const seen=new Set(),ex=sh.filter(q=>INAME[q.k]&&!seen.has(q.k)&&seen.add(q.k)).sort((a,b)=>b.c-a.c).slice(0,8);if(ex.length)o+='<p class="dv-mut" style="margin-top:12px">Priciest shop things, in time spent on the best monster ('+E(MOBS()[top.r.k].n)+', '+Math.round(top.h.vph).toLocaleString()+' gold an hour):</p><div class="dv-row" style="flex-wrap:wrap;gap:6px">'+
    ex.map(q=>{const m=q.c/top.h.vph*60;return'<span class="dv-b" style="cursor:default">'+ico(q.k)+E(INAME[q.k])+' · '+q.c.toLocaleString()+' gold · '+(m<1?'under a minute':m<90?Math.round(m)+' min':f1(m/60)+' h')+'</span>'}).join('')+'</div>'}
  return o+'</div>'}
 function ltHTML(){const r=T.ltres;if(!r)return'';const T2=SQCONTENT.C.loot[r.id];let o='<div class="dv-card"><b>'+E(T2?T2.n:r.id)+' × '+r.n.toLocaleString()+' rolls</b><table style="border-collapse:collapse;margin-top:8px;width:100%"><tr class="dv-mut" style="font-size:12px;text-align:left"><th>Gives</th><th>How often</th><th>Each roll (avg)</th><th>Worth each roll</th></tr>';
  const rows=Object.entries(r.tot).sort((a,b)=>b[1]*val(b[0])-a[1]*val(a[0]));for(const[x,c]of rows)o+='<tr style="border-top:1px solid #ffffff14"><td style="padding:4px 2px">'+ico(x)+E(nm(x))+'</td><td>'+bar(r.any[x]/r.n,1,'#58a8f0')+' '+pct(r.any[x]/r.n)+'</td><td>'+f1(c/r.n)+'</td><td>'+f1(c/r.n*val(x))+'</td></tr>';
  const tv=rows.reduce((s,[x,c])=>s+c*val(x),0)/r.n;return o+'</table><p class="dv-mut">On average a roll is worth <b>'+f1(tv)+' gold</b>.</p></div>'}
 function render(){const ml=mobList(),lts=window.SQCONTENT?SQCONTENT.tables():[];if(!T.mob&&ml.length)T.mob=(ml.find(m=>m[0]==='slime')||ml[0])[0];
  let h='<div class="dv-card"><b>📈 Simulator</b><p class="dv-mut">Runs the game\'s own code to see what players really get: every drop, Monster rules, loot tables and events count. Your character is put back exactly as it was afterwards. With "Show unpublished edits in my game" on, your draft is what gets tested.</p>'+
   '<div class="dv-row" style="flex-wrap:wrap;gap:8px"><select data-simi="mob">'+ml.map(([k,n,hp])=>'<option value="'+E(k)+'"'+(k===T.mob?' selected':'')+'>'+E(n)+' ('+hp+' hp)</option>').join('')+'</select>'+
   '<label class="dv-mut">kills <input type="number" data-simi="n" min="10" max="5000" value="'+T.n+'" style="width:80px"></label><label class="dv-mut">seconds to reach the next one <input type="number" data-simi="walk" min="0" max="60" value="'+T.walk+'" style="width:60px"></label>'+
   '<button class="dv-b dv-pri" data-simx="one">Simulate</button><button class="dv-b" data-simx="all"'+(T.busy?' disabled':'')+'>Compare every monster</button></div>'+
   '<div class="dv-row" style="flex-wrap:wrap;gap:8px;margin-top:6px"><select data-simi="lt"><option value="">(a loot table)</option>'+lts.map(([k,n])=>'<option value="'+E(k)+'"'+(k===T.lt?' selected':'')+'>'+E(n)+'</option>').join('')+'</select><label class="dv-mut">rolls <input type="number" data-simi="ltn" min="10" max="100000" value="'+T.ltn+'" style="width:90px"></label><button class="dv-b" data-simx="lt">Roll it</button></div></div>';
  return h+oneHTML()+ltHTML()+allHTML()}
 const inTab=t=>S.tab==='sim'&&t&&document.getElementById('dvs')&&document.getElementById('dvs').contains(t);
 document.addEventListener('change',e=>{const t=e.target;if(!inTab(t)||!t.dataset.simi)return;const f=t.dataset.simi;T[f]=t.type==='number'?Math.max(+t.min,Math.min(+t.max,+t.value||0)):t.value},true);
 document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-simx],[data-simsort],[data-simrow]');if(!inTab(t))return;e.preventDefault();
  if(t.dataset.simsort){T.sort=t.dataset.simsort;API.draw();return}if(t.dataset.simrow){T.mob=t.dataset.simrow;runOne();document.getElementById('dvs').scrollTo&&document.querySelector('#dvs .dv-card').scrollIntoView();return}
  const a=t.dataset.simx;if(a==='one')return runOne();if(a==='all')return runAll();if(a==='lt')return runLoot()},true);
 window.SQSIM={killMany,perHour,sandbox,runAll,get state(){return T}};
 SQSUITE.addTab('sim','Simulator',{render})})();
