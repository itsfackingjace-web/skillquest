// ---- 174. Test group: send the draft to a few accounts before everyone ----
// testers/<uid> = true (set by a developer in Dev Suite > Testers). A tester's game reads assets/beta after signing in
// (rules: testers and devs only) and uses it instead of the live library, as long as it was made from the live version
// that's out now (beta.base === live.v): once something newer is published, the test copy is ignored. A small
// "TEST VERSION" tag shows while it's in use. Developers keep using "Show unpublished edits in my game" for themselves.
(()=>{if(!window.SQA)return;const FBx=()=>window.SQFB,uid=()=>window.SQMP&&SQMP.user&&SQMP.user.uid;
 let ON=false,checked=null,BETA=null;
 const tag=document.createElement('div');tag.id='sqbeta';tag.textContent='🧪 TEST VERSION';tag.style.cssText='position:fixed;left:8px;bottom:calc(env(safe-area-inset-bottom,0px) + 6px);z-index:25;display:none;background:#203828;color:#c8f8c8;border:2px solid #48a058;padding:2px 7px;font:700 11px '+PF+';pointer-events:none;opacity:.85';document.body.appendChild(tag);
 async function check(){const F=FBx(),u=uid();if(!F||!u)return;const d=F.db;
  try{const t=(await d.get(d.ref(F.D,'testers/'+u))).val()===true;if(!t){if(ON){ON=false;BETA=null}return}
   const B=(await d.get(d.ref(F.D,'assets/beta'))).val(),L=SQA.live;
   if(B&&L&&B.base===L.v){if(JSON.stringify(B)!==JSON.stringify(BETA)){BETA=B;ON=true;if(!SQA.previewing)SQA.preview(B);/* preview = applied without touching the stored live copy */}}
   else if(ON){ON=false;BETA=null;if(!(window.SQSUITE&&SQSUITE.state&&SQSUITE.state.open))SQA.preview(null)}}catch(e){}}
 setInterval(()=>{const u=uid();if(u&&checked!==u){checked=u;check()}tag.style.display=ON&&!(window.SQTITLE&&SQTITLE())?'block':'none'},1000);
 setInterval(check,5*60000);
 window.SQBETA={check,get on(){return ON},get beta(){return BETA}};
 // ======================= Dev Suite > Testers =======================
 if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,E,dget,dset,toast,fail,arm}=API;
 const T={tst:null,lb:null,beta:undefined,q:''};
 const D=()=>FBx().db,ref=p=>D().ref(FBx().D,p),get=async p=>(await D().get(ref(p))).val();
 async function load(){try{const[t,l,b]=await Promise.all([get('testers'),get('lb'),dget('beta')]);T.tst=t||{};T.lb=l||{};T.beta=b||null}catch(e){fail(e);T.tst={};T.lb={};T.beta=null}API.draw()}
 const body=L=>{const o=JSON.parse(JSON.stringify(L||{}));delete o.v;delete o.at;delete o.by;delete o.base;return o};
 const nm=u=>T.lb&&T.lb[u]&&T.lb[u].n||u.slice(0,8);
 function render(){if(!T.tst){load();return'<p class="dv-mut">Loading…</p>'}
  const ids=Object.keys(T.tst).filter(u=>T.tst[u]),live=S.live||{},b=T.beta,fresh=b&&live.v&&b.base===live.v;
  const ch=window.SQHIST?SQHIST.diff(body(live),body(S.draft)):[],bch=b&&window.SQHIST?SQHIST.diff(body(live),body(b)):[];
  let h='<div class="dv-card"><b>🧪 Test group</b><p class="dv-mut">Send your draft to a few accounts first. Their game uses it instead of the live version (with a small TEST VERSION tag) until you publish something newer or stop the test. Everyone else keeps the live version.</p>'+
   '<p>'+(b?(fresh?'Testing now: sent '+new Date(b.at).toLocaleString()+', '+bch.length+' change'+(bch.length===1?'':'s')+' from the live version.':'The last test copy was made from an older live version, so testers are back on the live one.'):'No test running.')+'</p>'+
   (bch.length&&window.SQHIST?'<ul class="dv-cl">'+bch.slice(0,30).map(c=>'<li>'+E(SQHIST.label(c.p,c.how==='removed'?body(live):body(b)))+' <small class="dv-mut">('+c.how+')</small></li>').join('')+'</ul>':'')+
   '<div class="dv-row" style="flex-wrap:wrap"><button class="dv-b dv-pri" data-tsx="send"'+(ch.length&&live.v?'':' disabled')+'>Send my draft to testers ('+ch.length+' change'+(ch.length===1?'':'s')+')</button>'+(b?'<button class="dv-b dv-bad" data-tsx="stop">Stop the test</button>':'')+'</div>'+
   (live.v?'':'<p class="dv-mut">Publish once first: a test is made from the live version.</p>')+'</div>';
  h+='<div class="dv-card" style="margin-top:10px"><b>Testers ('+ids.length+')</b>'+(ids.length?ids.map(u=>'<div class="dv-hl"><span>'+E(nm(u))+'</span><button class="dv-b" data-tsx="rm:'+E(u)+'">Remove</button></div>').join(''):'<p class="dv-mut">Nobody yet.</p>')+
   '<p class="dv-mut" style="margin-top:8px">Add a player:</p><input type="search" data-tsq="1" placeholder="Search players" value="'+E(T.q)+'" style="width:100%">';
  const q=T.q.toLowerCase();if(q){const L=Object.entries(T.lb).filter(([u,r])=>r&&r.n&&!T.tst[u]&&String(r.n).toLowerCase().includes(q)).slice(0,12);
   h+=L.map(([u,r])=>'<div class="dv-hl"><span>'+E(r.n)+'</span><button class="dv-b" data-tsx="add:'+E(u)+'">Add</button></div>').join('')||'<p class="dv-mut">No match.</p>'}
  return h+'</div>'}
 document.addEventListener('input',e=>{if(S.tab!=='testers')return;const t=e.target;if(t.dataset&&t.dataset.tsq){T.q=t.value;const pos=t.selectionStart;API.draw();const n=document.querySelector('#dvs [data-tsq]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}}},true);
 document.addEventListener('click',async e=>{if(S.tab!=='testers')return;const t=e.target.closest('[data-tsx]');if(!t||!document.getElementById('dvs').contains(t))return;e.preventDefault();const[a,u]=t.dataset.tsx.split(':');
  try{if(a==='add'){await D().set(ref('testers/'+u),true);T.tst[u]=true;T.q='';toast(nm(u)+' is a tester.')}
   else if(a==='rm'){await D().set(ref('testers/'+u),null);delete T.tst[u];toast(nm(u)+' removed.')}
   else if(a==='send'){const b={...body(S.draft),base:S.live.v,at:Date.now()};await dset('beta',b);T.beta=b;toast('Sent to '+Object.keys(T.tst).filter(k=>T.tst[k]).length+' testers. They get it within 5 minutes, or when they next start the game.')}
   else if(a==='stop'){await dset('beta',null);T.beta=null;toast('Test stopped.')}}catch(e2){fail(e2)}API.draw()},true);
 SQSUITE.addTab('testers','Testers',{render})})();
