// ---- 170. Dev Suite > History: search everything, publish only some changes, see what each version changed, roll back ----
// Works on the library as "units": one entry each (icons.<k>, islands.<id>, ...), one level deeper for stats.<table>.<k>,
// content.<section>.<id> and balance.<part>.<k>, and swings as a whole. Publishing some changes = the live version with only
// the ticked units copied from the draft (the draft keeps the rest). Each publish keeps the version it replaces in
// assets/hist/<v> (same as the Publish tab: newest 20 kept); "what changed" compares a version with the one before it.
(()=>{if(!window.SQSUITE||!SQSUITE.addTab||!window.SQA)return;const API=SQSUITE.api,{S,E,dget,dset,toast,fail,arm}=API,A=SQA;
 const DEEP={stats:1,content:1,balance:1},WHOLE={swings:1},META={v:1,at:1,by:1};
 const clone=o=>o==null?o:JSON.parse(JSON.stringify(o));const same=(a,b)=>JSON.stringify(a==null?null:a)===JSON.stringify(b==null?null:b);
 const body=L=>{const o=clone(L)||{};for(const k in META)delete o[k];return o};
 const isObj=o=>o&&typeof o==='object'&&!Array.isArray(o);
 function units(L){const out=[];for(const s in L){if(META[s])continue;const v=L[s];if(WHOLE[s]||!isObj(v)){out.push([s]);continue}
   for(const k in v){if(DEEP[s]&&isObj(v[k])){for(const k2 in v[k])out.push([s,k,k2])}else out.push([s,k])}}return out}
 const at=(L,p)=>{let o=L;for(const k of p){if(o==null)return undefined;o=o[k]}return o};
 const put=(L,p,v)=>{let o=L;for(const k of p.slice(0,-1)){if(!isObj(o[k]))o[k]={};o=o[k]}if(v==null)delete o[p[p.length-1]];else o[p[p.length-1]]=clone(v)};
 function diff(a,b){a=a||{};b=b||{};const keys=new Map();for(const p of units(a).concat(units(b)))keys.set(p.join('\u0001'),p);const out=[];
  for(const p of keys.values()){const x=at(a,p),y=at(b,p);if(!same(x,y))out.push({p,how:y==null?'removed':x==null?'new':'changed'})}return out.sort((u,v)=>u.p.join('/').localeCompare(v.p.join('/')))}
 const nm=k=>INAME[k]||k;
 function label(p,D){const[s,k,k2]=p,v=at(D,p)||{};const SEC=window.SQCONTENT&&SQCONTENT.SECS;
  switch(s){case'icons':return'🖼 Sprite: '+nm(k);case'worn':return'👕 Worn look: '+nm(k);case'pets':return'🐾 Pet look: '+k;case'newgear':return'🗡 New gear item: '+(v.n||k);
   case'gear':return'⚙️ Gear rules: '+nm(k);case'islands':return'🏝 Island: '+(v.n||k);case'props':return'🏠 Look: '+((D.pnames||{})[k]||k);case'pnames':return'🏷 Name label: '+k;
   case'mobs':return'👾 Monster rules: '+k;case'bosses':return'👑 Boss: '+(v.n||k);case'swings':return'⚔ Weapon swings';
   case'stats':return'📊 Stats ('+((A.TABLES[k]||{}).name||k)+'): '+(A.TABLES[k]?A.TABLES[k].label(k2):k2);
   case'content':return(SEC&&SEC[k]?SEC[k].l:k)+': '+(v.n||(k==='recipes'&&v.out?nm(v.out):'')||k2);
   case'balance':return'⚖️ '+(k==='xp'?(SKN[k2]||k2)+' XP %':k==='act'?'Action XP '+k2:'Perk '+k2);
   default:return s+(k?' / '+k:'')+(k2?' / '+k2:'')}}
 const T={q:'',pick:{},hist:null,open:null,busy:false};
 // ---- going live (same steps as the Publish tab) ----
 async function goLive(L,msg){T.busy=true;API.draw();try{const old=S.live;if(old&&old.v)await dset('hist/'+old.v,old);
   const next={...body(L),v:((old&&old.v)|0)+1,at:Date.now()};await dset('live',next);S.live=next;A.setLive(next);S.hist=null;T.hist=null;
   try{const H=await dget('hist');if(H){const ks=Object.keys(H).map(Number).sort((a,b)=>b-a);for(const k of ks.slice(20))await dset('hist/'+k,null)}}catch(e){}
   toast(msg+' Players get v'+next.v+' within about 30 seconds.')}catch(e){fail(e)}T.busy=false;S.arm=null;API.draw()}
 async function loadHist(){if(T.lh)return;T.lh=1;try{const H=await dget('hist');T.hist=H?Object.values(H).filter(x=>x&&x.v).sort((a,b)=>b.v-a.v):[]}catch(e){T.hist=[]}T.lh=0;API.draw()}
 // ---- search ----
 function search(q){q=q.trim().toLowerCase();if(q.length<2)return[];const R=[],D=S.draft||{},add=(ic,name,where,go)=>{if(R.length<60)R.push({ic,name,where,go})};const hit=s=>String(s||'').toLowerCase().includes(q);
  for(const k of A.itemKeys())if(hit(INAME[k])||hit(k))add('🎒',INAME[k],'Item · '+k,{tab:'sprites',sel:'.dv-it[data-k="'+k+'"]'});
  const MOBS=window.SQISLIFE&&SQISLIFE.MOBS||{};for(const k in MOBS)if(hit(MOBS[k].n)||hit(k))add('👾',MOBS[k].n,'Monster · '+k,{tab:'monsters',sel:'[data-k="m:'+k+'"]'});
  for(const id in D.islands||{}){const I=D.islands[id]||{};if(hit(I.n)||hit(id))add('🏝',I.n||id,'Island',{tab:'islands',sel:'[data-isl="'+id+'"]'});
   for(const Q of Object.values(I.npc||{}))if(Q&&(hit(Q.n)||(Q.s||[]).some(hit)))add('🧑',Q.n,'Person on '+(I.n||id),{tab:'islands',sel:'[data-isl="'+id+'"]'});
   for(const L of Object.values(I.lm||{}))if(L&&(hit(L.n)||hit(L.tx)))add('🪧',L.n||L.tx,'Sign or chest on '+(I.n||id),{tab:'islands',sel:'[data-isl="'+id+'"]'})}
  for(const id in D.bosses||{}){const b=D.bosses[id]||{};if(hit(b.n)||hit(id))add('👑',b.n||id,'Boss',{tab:'bosses',sel:'[data-cbs="'+id+'"]'})}
  const C=D.content||{},SEC=window.SQCONTENT&&SQCONTENT.SECS||{};for(const s in C)for(const id in C[s]||{}){const o=C[s][id]||{};if(hit(o.n)||hit(o.d)||hit(id)||(o.out&&hit(INAME[o.out])))add((SEC[s]||{l:'📦'}).l.split(' ')[0],o.n||(o.out&&INAME[o.out])||id,'Content · '+((SEC[s]||{}).l||s).replace(/^\S+ /,''),{content:[s,id]})}
  for(const k in D.pnames||{})if(hit(D.pnames[k]))add('🏠',D.pnames[k],'Look · '+k,{tab:k.startsWith('m:')?'monsters':'props',sel:'[data-k="'+k+'"]'});
  for(let i=0;i<SKN.length;i++)if(hit(SKN[i]))add('⚖️',SKN[i],'Skill · balance',{tab:'balance'});
  return R}
 function goTo(g){if(g.content&&window.SQCONTENT&&SQCONTENT.edit){SQCONTENT.edit(g.content[0],g.content[1]);return}S.tab=g.tab;S.sel=null;S.ed=null;API.draw();
  if(g.sel)setTimeout(()=>{const x=document.querySelector('#dvs '+g.sel);if(x){x.scrollIntoView({block:'center'});x.click()}else toast('Not found in that tab (it may need "Show unpublished edits in my game").')},250)}
 // ---- the tab ----
 function render(){let h='<div class="dv-card"><b>🔎 Search everything</b><input type="search" data-hq="1" placeholder="Item, monster, island, person, boss, quest, recipe…" value="'+E(T.q)+'" style="width:100%;margin-top:6px">';
  const R=search(T.q);if(T.q.trim().length>=2)h+=R.length?'<div style="margin-top:6px">'+R.map((r,i)=>'<button class="dv-it" data-hgo="'+i+'" style="flex-direction:row;justify-content:flex-start;gap:8px;padding:6px 10px;width:100%;margin:2px 0"><span>'+r.ic+'</span><span style="text-align:left"><b>'+E(r.name)+'</b> <small class="dv-mut">'+E(r.where)+'</small></span></button>').join('')+'</div>':'<p class="dv-mut">Nothing matches.</p>';
  T.R=R;h+='</div>';
  const D=S.draft||{},L=body(S.live),ch=diff(L,D);
  h+='<div class="dv-card" style="margin-top:10px"><b>Publish some changes</b>';
  if(!ch.length)h+='<p class="dv-mut">Your draft matches the live version.</p>';
  else{const n=ch.filter(c=>T.pick[c.p.join('/')]).length;h+='<p class="dv-mut">Tick the changes to send to players now. The rest stay in your draft.</p><div class="dv-row"><button class="dv-b" data-ha="all">Tick all</button><button class="dv-b" data-ha="none">Untick all</button></div>'+
   ch.map(c=>{const k=c.p.join('/');return'<label style="display:flex;gap:8px;align-items:center;padding:3px 0"><input type="checkbox" data-hp="'+E(k)+'"'+(T.pick[k]?' checked':'')+'> <span>'+E(label(c.p,c.how==='removed'?L:D))+' <small class="dv-mut">('+c.how+')</small></span></label>'}).join('')+
   '<div class="dv-row" style="margin-top:6px"><button class="dv-b '+(S.arm==='hpub'?'dv-arm':'dv-pri')+'" data-ha="pub"'+(n&&!T.busy?'':' disabled')+'>'+(S.arm==='hpub'?'Tap again to publish '+n:'Publish '+n+' change'+(n===1?'':'s'))+'</button></div>'+
   '<p class="dv-mut" style="font-size:12px">A new item\'s sprite, its rules and its entry belong together: tick all of them.</p>'}
  h+='</div><div class="dv-card" style="margin-top:10px"><b>Versions</b>';
  if(T.hist==null){loadHist();h+='<p class="dv-mut">Loading…</p>'}
  else{const V=[S.live&&S.live.v?S.live:null,...T.hist].filter(Boolean);if(!V.length)h+='<p class="dv-mut">Nothing published yet.</p>';
   if(T.hist.length)h+='<div class="dv-row"><button class="dv-b '+(S.arm==='hundo'?'dv-arm':'dv-bad')+'" data-ha="undo"'+(T.busy?' disabled':'')+'>'+(S.arm==='hundo'?'Tap again to go back to v'+T.hist[0].v:'Undo the last publish (back to v'+T.hist[0].v+')')+'</button></div>';
   V.forEach((x,i)=>{const prev=V[i+1],d=diff(prev?body(prev):{},body(x)),live=i===0&&S.live&&x.v===S.live.v,o=T.open===x.v;
    h+='<div class="dv-hl" style="flex-wrap:wrap"><span><b>v'+x.v+'</b>'+(live?' <span style="background:#2a8a3a;color:#fff;font-size:10px;font-weight:700;padding:1px 5px;border-radius:4px">LIVE</span>':'')+' · '+new Date(x.at).toLocaleString()+' · '+d.length+' change'+(d.length===1?'':'s')+(prev?'':' (first version)')+'</span><span class="dv-row"><button class="dv-b" data-hv="'+x.v+'">'+(o?'Hide':'What changed')+'</button>'+
     (live?'':'<button class="dv-b '+(S.arm==='hr'+x.v?'dv-arm':'')+'" data-hr="'+x.v+'"'+(T.busy?' disabled':'')+'>'+(S.arm==='hr'+x.v?'Tap again to make it live':'Make live again')+'</button>')+'</span>'+
     (o?'<ul class="dv-cl" style="width:100%">'+(d.map(c=>'<li>'+E(label(c.p,c.how==='removed'?body(prev):body(x)))+' <small class="dv-mut">('+c.how+')</small></li>').join('')||'<li class="dv-mut">Same as the version before.</li>')+'</ul>':'')+'</div>'})}
  return h+'</div>'}
 document.addEventListener('input',e=>{if(S.tab!=='history')return;const t=e.target;if(t.dataset&&t.dataset.hq){T.q=t.value;const pos=t.selectionStart;API.draw();const n=document.querySelector('#dvs [data-hq]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}}},true);
 document.addEventListener('change',e=>{if(S.tab!=='history')return;const t=e.target;if(t.dataset&&t.dataset.hp!=null){T.pick[t.dataset.hp]=t.checked;API.draw()}},true);
 document.addEventListener('click',e=>{if(S.tab!=='history')return;const t=e.target.closest('[data-ha],[data-hv],[data-hr],[data-hgo]');if(!t||!document.getElementById('dvs').contains(t))return;e.preventDefault();
  if(t.dataset.hgo!=null){const r=T.R&&T.R[+t.dataset.hgo];if(r)goTo(r.go);return}
  if(t.dataset.hv){const v=+t.dataset.hv;T.open=T.open===v?null:v;API.draw();return}
  if(t.dataset.hr){const v=+t.dataset.hr;return arm('hr'+v,()=>{const H=T.hist.find(x=>x.v===v);if(H)goLive(H,'v'+v+' is live again (as a new version).')})}
  const a=t.dataset.ha,D=S.draft||{},L=body(S.live),ch=diff(L,D);
  if(a==='all'){for(const c of ch)T.pick[c.p.join('/')]=true;API.draw();return}
  if(a==='none'){T.pick={};API.draw();return}
  if(a==='undo')return arm('hundo',()=>{const H=T.hist[0];if(H)goLive(H,'Back to v'+H.v+' (as a new version).')});
  if(a==='pub')return arm('hpub',()=>{const next=clone(L);let n=0;for(const c of ch)if(T.pick[c.p.join('/')]){put(next,c.p,at(D,c.p));n++}if(!n)return;T.pick={};goLive(next,'Published '+n+' change'+(n===1?'':'s')+'.')})},true);
 SQSUITE.addTab('history','History',{render});
 window.SQHIST={units,diff,search,label}})();
