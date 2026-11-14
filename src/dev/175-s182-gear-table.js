// ---- 182. Dev Suite > Gear stats: every weapon and armour piece in one table ----
// The Gear tab edits one item at a time; this lists them all (filter by kind, search) with their numbers as players get them
// for the developer's character (SQGEAR.base + the draft's gear rule): damage, bow range, block %, a wand's mana cost, the
// requirement (skill + level) and the special effects. Typing a number saves the difference into the same draft rule
// (gear.<k>, cleaned by SQGEAR.clean), so the Gear tab and this table always agree.
(()=>{if(!window.SQSUITE||!SQSUITE.addTab||!window.SQGEAR)return;const API=SQSUITE.api,{S,E,dset,toast,fail}=API,G=window.SQGEAR,A=window.SQA;
 const T={kind:'all',q:'',base:null};
 const KN={melee:'Swords & melee',bow:'Bows',wand:'Wands',armour:'Armour'};
 function bases(){if(T.base)return T.base;const o={};for(const k of G.gearKeys()){try{o[k]=G.base(k)}catch(e){o[k]={kind:G.kindOf(k),rq:G.defReq(k),blk:0}}}return T.base=o}
 const rule=k=>(S.draft&&S.draft.gear&&S.draft.gear[k])||{};
 const inp=(k,f,v,w,ttl)=>'<input type="number" data-gt="'+k+'|'+f+'" value="'+(v==null?'':v)+'" style="width:'+(w||58)+'px" title="'+E(ttl||'')+'">';
 function render(){const B=bases(),q=T.q.toLowerCase();
  let h='<div class="dv-card"><b>Gear stats</b><p class="dv-mut">Every weapon and armour piece with the numbers players get (shown for your character, so damage that grows with your level shows your level\'s). Change a number and it saves to your draft as a change from the game\'s own. Effects are chances in % (move speed: % faster). For looks and icons use the Gear tab.</p>'+
   '<div class="dv-row" style="flex-wrap:wrap;gap:6px"><div class="dv-chips">'+[['all','All']].concat(Object.entries(KN)).map(([k,l])=>'<button class="dv-b'+(T.kind===k?' dv-tl dv-on':'')+'" data-gtk="'+k+'">'+l+'</button>').join('')+'</div>'+
   '<input type="search" data-gtq placeholder="Search gear" value="'+E(T.q)+'" style="max-width:220px"><button class="dv-b" data-gtk="refresh" title="Re-read the numbers (after changing your levels)">↻</button></div></div>';
  const rows=G.gearKeys().filter(k=>{const t=G.kindOf(k);if(!KN[t])return false;if(T.kind!=='all'&&t!==T.kind)return false;return!q||String(INAME[k]).toLowerCase().includes(q)||k.includes(q)});
  h+='<div style="overflow-x:auto"><table class="dv-gtab"><thead><tr><th>Item</th><th>Damage</th><th>Range</th><th>Block %</th><th>Mana</th><th>Needs</th>'+Object.values(G.FXN).map(n=>'<th title="%">'+E(n)+'</th>').join('')+'<th></th></tr></thead><tbody>';
  for(const k of rows){const t=G.kindOf(k),b=B[k]||{},r=rule(k),fx=r.fx||{},rq=r.rq||b.rq||{s:0,l:0};
   const dmg=b.dmg!=null?b.dmg+(r.dmg|0):null,rng=b.rng!=null?b.rng+(r.rng|0):null,blk=(b.blk|0)+(r.blk|0),mp=t==='wand'?(r.mp!=null?r.mp:b.mp):null,chg=Object.keys(r).length>0;
   h+='<tr'+(chg?' class="dv-chgrow"':'')+'><td class="dv-k"><img src="'+iconURL(k)+'" style="width:20px;height:20px;image-rendering:pixelated;vertical-align:middle"> '+E(INAME[k])+(EQ[k].custom?' <small>(new)</small>':'')+'<small>'+E(KN[t])+' · '+k+'</small></td>'+
    '<td>'+(dmg!=null?inp(k,'dmg',dmg):'')+'</td><td>'+(t==='bow'?inp(k,'rng',rng):'')+'</td><td>'+inp(k,'blk',blk)+'</td><td>'+(t==='wand'?inp(k,'mp',mp,50):'')+'</td>'+
    '<td style="white-space:nowrap"><select data-gt="'+k+'|rqs" style="max-width:110px">'+SKN.map((n,i)=>'<option value="'+i+'"'+(i===(rq.s|0)?' selected':'')+'>'+E(n)+'</option>').join('')+'</select>'+inp(k,'rql',rq.l|0,50,'Level (0 = nothing needed)')+'</td>'+
    Object.keys(G.FXN).map(x=>'<td>'+inp(k,'fx_'+x,fx[x]|0,50)+'</td>').join('')+
    '<td>'+(chg?'<button class="dv-b" data-gtr="'+k+'" title="Back to the game\'s own numbers">↺</button>':'')+'</td></tr>'}
  return h+'</tbody></table></div>'+(rows.length?'':'<p class="dv-mut">Nothing matches.</p>')}
 async function save(k,f,v){const b=bases()[k]||G.base(k),cur=JSON.parse(JSON.stringify(rule(k)));
  if(f==='dmg'||f==='rng'||f==='blk'){const n=Math.round(Number(v));if(v===''||!isFinite(n))return API.draw();const dl=n-(b[f]|0);if(dl)cur[f]=dl;else delete cur[f]}
  else if(f==='mp'){const n=Math.max(0,Math.round(Number(v))||0);if(n===b.mp)delete cur.mp;else cur.mp=n}
  else if(f.startsWith('fx_')){const x=f.slice(3);cur.fx={...(cur.fx||{}),[x]:Math.max(0,Math.round(Number(v))||0)}}
  else if(f==='rqs'||f==='rql'){const dq=b.rq||{s:0,l:0},q={...(cur.rq||dq)};if(f==='rqs')q.s=+v;else q.l=Math.max(0,Math.min(99,Math.round(Number(v))||0));
   if((q.s===dq.s&&q.l===dq.l)||(!q.l&&!dq.l))delete cur.rq;else cur.rq=q}
  const r=G.clean(cur,k);S.draft.gear=S.draft.gear||{};if(r)S.draft.gear[k]=r;else delete S.draft.gear[k];
  try{await dset('draft/gear/'+k,r||null);toast('Saved to draft.')}catch(e){fail(e)}try{if(A.previewing)A.preview(S.draft)}catch(e){}API.draw()}
 document.addEventListener('change',e=>{if(S.tab!=='gtable')return;const t=e.target.closest('[data-gt]');if(!t)return;const[k,f]=t.dataset.gt.split('|');save(k,f,t.value)},true);
 document.addEventListener('input',e=>{if(S.tab!=='gtable')return;const t=e.target;if(t.hasAttribute&&t.hasAttribute('data-gtq')){T.q=t.value;const pos=t.selectionStart;API.draw();const i=document.querySelector('#dvs [data-gtq]');if(i){i.focus();try{i.setSelectionRange(pos,pos)}catch(x){}}}},true);
 document.addEventListener('click',async e=>{if(S.tab!=='gtable')return;const t=e.target.closest('[data-gtk],[data-gtr]');if(!t)return;e.preventDefault();
  if(t.dataset.gtk){if(t.dataset.gtk==='refresh')T.base=null;else T.kind=t.dataset.gtk;API.draw();return}
  const k=t.dataset.gtr;delete S.draft.gear[k];try{await dset('draft/gear/'+k,null);toast('Back to the game\'s own numbers (in your draft).')}catch(e2){fail(e2)}try{if(A.previewing)A.preview(S.draft)}catch(x){}API.draw()},true);
 {const st=document.createElement('style');st.textContent='#dvs .dv-gtab td{padding:3px 4px;vertical-align:middle}#dvs .dv-gtab input{padding:3px 4px}#dvs .dv-chgrow td:first-child{box-shadow:inset 3px 0 #f8d848}';document.head.appendChild(st)}
 SQSUITE.addTab('gtable','Gear stats',{render})})();
