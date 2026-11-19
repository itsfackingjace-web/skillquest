// ---- 241. Chat log (Dev Suite > Chat log, window.SQCHATLOG) ----
// Players often mention bugs in public chat instead of using the bug report button or #bugs. Public chat is already kept in the
// database (`chat/<push id>` {u,n,m,t}, 90 days, devs/signed-in read; see privacy.html), so this tab only reads it: the newest
// 1000 messages first ("Load older" pages back by push key), a search box (text or name), a "Possible bugs" filter (BUGRX: words
// players use when something goes wrong), and Download .txt / Copy of what's shown. Private messages are never read here.
(()=>{if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,toast,fail}=API;
 const FBx=()=>window.SQFB,PAGE=1000;
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const BUGRX=/\b(bugs?|bugged|buggy|glitch\w*|broke\w*|stuck|lost|loses?|disappear\w*|vanish\w*|missing|gone|can'?t|cannot|won'?t|doesn'?t|didn'?t|isn'?t|not working|doesn.t work|crash\w*|freez\w*|frozen|lag\w*|error\w*|reset\w*|wiped|deleted|dupe\w*|duplicat\w*|invisible|phase\w*|walk through|fix\w*|wrong|weird|stopped|kicked|rollback|rolled back)\b/i;
 const L={msgs:[],oldest:null,busy:false,done:false,q:'',bugs:true,err:null};// newest last
 async function page(){const F=FBx();if(!F){L.err='Not connected to the database (sign in first).';API.draw();return}if(L.busy||L.done)return;L.busy=true;API.draw();
  try{const d=F.db;let q=d.query(d.ref(F.D,'chat'),d.orderByKey(),d.limitToLast(PAGE));if(L.oldest)q=d.query(d.ref(F.D,'chat'),d.orderByKey(),d.endBefore(L.oldest),d.limitToLast(PAGE));
   const s=await d.get(q),v=s.val()||{},ks=Object.keys(v).sort();if(ks.length<PAGE)L.done=true;if(ks.length)L.oldest=ks[0];
   L.msgs=ks.map(k=>({k,...v[k]})).concat(L.msgs)}catch(e){L.err=String(e&&e.message||e);fail(e)}L.busy=false;API.draw()}
 const shown=()=>{const q=L.q.trim().toLowerCase();return L.msgs.filter(m=>(!L.bugs||BUGRX.test(m.m||''))&&(!q||String(m.m||'').toLowerCase().includes(q)||String(m.n||'').toLowerCase().includes(q)))};
 const when=t=>{if(!t)return'?';const d=new Date(t);return d.toLocaleDateString(undefined,{month:'short',day:'numeric'})+' '+d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})};
 const txt=list=>list.map(m=>(m.t?new Date(m.t).toISOString().slice(0,16).replace('T',' '):'?')+'  '+(m.n||'?')+' ['+String(m.u||'').slice(0,8)+']: '+String(m.m||'').replace(/\n/g,' ')).join('\n');
 function render(){if(!L.msgs.length&&!L.busy&&!L.done&&!L.err)setTimeout(page,0);const list=shown();
  const first=L.msgs[0],last=L.msgs[L.msgs.length-1];
  let h='<div class="dv-card"><b>Public chat</b><p class="dv-mut">'+(L.msgs.length?L.msgs.length+' messages loaded, '+when(first.t)+' to '+when(last.t)+(L.done?' (the whole log: chat is kept 90 days)':''):L.busy?'Loading…':'')+'</p>'+
   (L.err?'<p class="dv-mut" style="color:#c44">'+esc(L.err)+'</p>':'')+
   '<div class="dv-row" style="flex-wrap:wrap;gap:6px"><input data-clq="1" placeholder="Search text or name" value="'+esc(L.q)+'" style="flex:1;min-width:160px">'+
   '<button class="dv-b'+(L.bugs?' dv-tl dv-on':'')+'" data-cl="bugs">Possible bugs</button><button class="dv-b'+(!L.bugs?' dv-tl dv-on':'')+'" data-cl="all">Everything</button>'+
   '<button class="dv-b" data-cl="more"'+(L.done||L.busy?' disabled':'')+'>Load older</button><button class="dv-b" data-cl="fresh">↻ Newest</button>'+
   '<button class="dv-b" data-cl="txt">Download .txt</button><button class="dv-b" data-cl="copy">Copy</button></div>'+
   '<p class="dv-mut">Showing '+list.length+(L.bugs?' that mention something going wrong':'')+'. Newest at the top.</p></div>';
  h+='<div style="display:flex;flex-direction:column;gap:2px">';
  for(const m of list.slice().reverse().slice(0,600))h+='<div class="dv-card" style="padding:6px 10px;margin:0"><span class="dv-mut" style="font-size:11px">'+esc(when(m.t))+'</span> <b>'+esc(m.n||'?')+'</b> '+
   '<span class="dv-mut" style="font-size:10px">'+esc(String(m.u||'').slice(0,8))+'</span><br>'+esc(m.m||'')+'</div>';
  if(list.length>600)h+='<p class="dv-mut">…and '+(list.length-600)+' more (search to narrow, or download the .txt).</p>';
  return h+'</div>'}
 document.addEventListener('input',e=>{if(S.tab!=='chatlog')return;const t=e.target;if(t&&t.dataset&&t.dataset.clq){L.q=t.value;const pos=t.selectionStart;API.draw();const n=document.querySelector('#dvs [data-clq]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}}},true);
 document.addEventListener('click',async e=>{if(S.tab!=='chatlog')return;const t=e.target.closest('[data-cl]');if(!t||!document.getElementById('dvs').contains(t))return;e.preventDefault();e.stopPropagation();
  const a=t.dataset.cl;try{
   if(a==='bugs'){L.bugs=true;API.draw()}else if(a==='all'){L.bugs=false;API.draw()}
   else if(a==='more')page();else if(a==='fresh'){L.msgs=[];L.oldest=null;L.done=false;L.err=null;page()}
   else if(a==='txt'){const b=new Blob([txt(shown())+'\n'],{type:'text/plain'}),u=URL.createObjectURL(b),el=document.createElement('a');el.href=u;el.download='skillquest-chat-'+new Date().toISOString().slice(0,10)+(L.bugs?'-bugs':'')+'.txt';document.body.appendChild(el);el.click();el.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)}
   else if(a==='copy'){await navigator.clipboard.writeText(txt(shown()));toast('Copied '+shown().length+' lines.')}}catch(e2){fail(e2)}},true);
 window.SQCHATLOG={BUGRX,load:page,get msgs(){return L.msgs},text:()=>txt(shown())};
 SQSUITE.addTab('chatlog','Chat log',{render})})();
