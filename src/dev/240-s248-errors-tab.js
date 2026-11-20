// ---- 248. Dev Suite > Errors (window.SQERRTAB) ----
// Code errors players' games caught (core/000b's SQERR: `errs/<site>` {m, n, v, t}), most frequent first, with this device's own
// session log underneath. A site is '<file number>-<n>' = the n-th tagged catch in that source file (search the file for
// "SQERR(e,'<site>')"). "Fixed, clear it" removes the record so a new occurrence shows up as new.
(()=>{if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,toast,fail}=API;
 const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const F=()=>window.SQFB,T={list:null};
 const fileOf=site=>{const id=String(site).split('-')[0];return id};
 async function load(){try{const v=(await F().db.get(F().db.ref(F().D,'errs'))).val()||{};T.list=Object.entries(v).map(([k,x])=>({k,...x})).sort((a,b)=>(b.n||0)-(a.n||0))}catch(e){T.list=[];fail(e)}API.draw()}
 function render(){if(!T.list){load();return'<p class="dv-mut">Loading…</p>'}
  let h='<div class="dv-card"><b>⚠ Errors from players\' games</b><p class="dv-mut">Mistakes in the code that a try/catch quietly stopped (TypeError, ReferenceError, RangeError), sent once per place per session. '+
   'A place is "file-number": search that source file for <code>SQERR(e,\'place\')</code>. Clear one after fixing it.</p><button class="dv-b" data-erx="reload">↻ Reload</button></div>';
  if(!T.list.length)h+='<p class="dv-mut">None reported.</p>';
  for(const x of T.list)h+='<div class="dv-card" style="margin-top:6px"><b>'+E(x.k)+'</b> <span class="dv-mut">file '+E(fileOf(x.k))+' · '+(x.n||0).toLocaleString('en-US')+' time'+(x.n===1?'':'s')+' · version '+E(x.v||'?')+' · last '+(x.t?new Date(x.t).toLocaleString():'?')+'</span><br><code style="white-space:pre-wrap">'+E(x.m)+'</code>'+
   '<div class="dv-row" style="margin-top:6px"><button class="dv-b" data-erx="clr:'+E(x.k)+'">Fixed, clear it</button></div></div>';
  const mine=window.SQERR?SQERR.list():[];h+='<div class="dv-card" style="margin-top:10px"><b>This game, this session</b> <span class="dv-mut">(every caught error, sent or not)</span><pre style="white-space:pre-wrap;font-size:12px">'+E(mine.join('\n')||'Nothing caught.')+'</pre></div>';
  return h}
 document.addEventListener('click',async e=>{if(S.tab!=='errors')return;const t=e.target.closest&&e.target.closest('[data-erx]');if(!t||!document.getElementById('dvs').contains(t))return;e.preventDefault();e.stopPropagation();
  const a=t.dataset.erx;try{if(a==='reload'){T.list=null;API.draw()}else if(a.startsWith('clr:')){const k=a.slice(4);await F().db.remove(F().db.ref(F().D,'errs/'+k));T.list=T.list.filter(x=>x.k!==k);toast('Cleared.');API.draw()}}catch(err){fail(err)}},true);
 window.SQERRTAB={load};SQSUITE.addTab('errors','Errors',{render})})();
