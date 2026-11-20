// ---- 244. Dev Suite > Patron songs (window.SQPSONGS) ----
// Songs Patrons sent from the Song Studio (235): `songsub/<uid>/<id>` {n, s (a song in 155's format, JSON), note, who, t, st, re}.
// Listen, approve / not this time (st, re, a gift message to the Patron, and `artcred/<id>` for the credits on approval), and
// "Put it in the Songs editor" = draft songs.su_<name> (checked by 165's SQSONGS.check), opened in the Songs tab to finish and
// place (Songs > Island songs, or a song zone in the island builder). "Open the Song Studio" lets the developer use the simple
// composer too; its songs go to the draft the same way.
(()=>{if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,toast,fail}=API,M=window.SQMUSIC;
 const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const F=()=>window.SQFB,D=()=>F().db,ref=p=>D().ref(F().D,p);
 const T={list:null,lb:{},msg:{},play:null};
 async function inbox(){try{const[a,l]=await Promise.all([D().get(ref('songsub')),D().get(ref('lb'))]);const v=a.val()||{};T.lb=l.val()||{};T.list=[];
   for(const u in v)for(const id in v[u])T.list.push({u,id,...v[u][id]});T.list.sort((x,y)=>(x.st?1:0)-(y.st?1:0)||(y.t||0)-(x.t||0))}catch(e){fail(e);T.list=[]}API.draw()}
 const nm=u=>T.lb[u]&&T.lb[u].n||u.slice(0,8);
 const parse=x=>{try{return JSON.parse(x.s)}catch(e){return null}};
 function stop(){if(T.play){M.force=null;delete M.S.__ps;delete M.SONGS.__ps;T.play=null}}
 async function play(x){stop();const c=window.SQSONGS.check(parse(x));if(!c.def){toast(c.errs[0]||'This song doesn\'t build.');return}M.S.__ps=c.def;M.SONGS.__ps=M.build(c.def);M.VOL.__ps=1.6;T.play=x.u+'/'+x.id;API.draw();
  try{if(typeof ACX!=='undefined'&&ACX&&ACX.state!=='running')await ACX.resume()}catch(e){self.SQERR&&SQERR(e,'236-1')}try{await M.loadSong('__ps')}catch(e){toast('Could not load the instruments.')}if(T.play)M.force='__ps'}
 // into the draft as a new song su_<name>; returns its key
 async function toDraft(def){const c=window.SQSONGS.check(def);if(!c.def)throw new Error(c.errs[0]||'Not a song');S.draft.songs=S.draft.songs||{};
  const b=String(def.n||'song').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,16)||'song';let k='su_'+b,i=2;while(S.draft.songs[k]||(S.live&&S.live.songs||{})[k])k='su_'+b+(i++);
  const o={...c.def,vol:1.6};S.draft.songs[k]=o;await API.dset('draft/songs/'+k,o);return k}
 function openSongs(k){try{SQSUITE.open()}catch(e){self.SQERR&&SQERR(e,'236-2')}setTimeout(()=>{const tb=document.querySelector('#dvs [data-tab="songs"]');if(tb)tb.click();setTimeout(()=>{const it=document.querySelector('#dvs [data-sgs="'+k+'"]');if(it)it.click()},200)},300)}
 function render(){if(!T.list){inbox();return'<p class="dv-mut">Loading…</p>'}const waiting=T.list.filter(x=>!x.st);
  let h='<div class="dv-card"><b>🎵 Patron songs</b><p class="dv-mut">Songs Patrons made in the Song Studio. Listen, answer them, and put the ones you like into the Songs editor to finish and give them a place (an island\'s song, or a song zone in the island builder).</p>'+
   '<p>'+waiting.length+' waiting, '+(T.list.length-waiting.length)+' answered.</p><button class="dv-b dv-pri" data-psg="studio">Open the Song Studio (the simple composer)</button></div>';
  for(const x of T.list){const k=x.u+'/'+x.id,d=parse(x),pl=T.play===k;
   h+='<div class="dv-card" style="margin-top:10px"><b>'+E(x.n)+'</b> <span class="dv-mut">by '+E(x.who||nm(x.u))+(d?' · '+d.bpm+' bpm · '+Object.keys(d.parts||{}).length+' parts · order '+E(d.order):' · can\'t be read')+(x.t?' · '+new Date(x.t).toLocaleDateString():'')+'</span>'+
    (x.note?'<p>'+E(x.note)+'</p>':'')+(x.st?'<p><b>'+(x.st==='ok'?'Approved':'Not this time')+'</b>'+(x.re?': '+E(x.re):'')+'</p>':'')+
    '<div class="dv-row" style="gap:6px;flex-wrap:wrap;margin-top:6px"><button class="dv-b'+(pl?' dv-tl dv-on':'')+'" data-psg="'+(pl?'stop':'play')+':'+E(k)+'">'+(pl?'■ Stop':'▶ Play')+'</button>'+
    '<button class="dv-b" data-psg="draft:'+E(k)+'">Put it in the Songs editor</button></div>'+
    (x.st?'':'<input data-psq="'+E(k)+'" placeholder="Message to the Patron (optional)" value="'+E(T.msg[k]||'')+'" style="width:100%;margin-top:6px"><div class="dv-row" style="gap:6px;margin-top:6px"><button class="dv-b dv-pri" data-psg="ok:'+E(k)+'">Approve</button><button class="dv-b dv-bad" data-psg="no:'+E(k)+'">Not this time</button></div>')+'</div>'}
  if(!T.list.length)h+='<p class="dv-mut">No songs yet.</p>';return h}
 document.addEventListener('input',e=>{if(S.tab!=='psongs')return;const t=e.target;if(t.dataset&&t.dataset.psq)T.msg[t.dataset.psq]=t.value},true);
 document.addEventListener('click',async e=>{if(S.tab!=='psongs')return;const t=e.target.closest&&e.target.closest('[data-psg]');if(!t||!document.getElementById('dvs').contains(t))return;e.preventDefault();e.stopPropagation();
  const i=t.dataset.psg.indexOf(':'),a=i<0?t.dataset.psg:t.dataset.psg.slice(0,i),k=i<0?'':t.dataset.psg.slice(i+1),[u,id]=k.split('/'),x=T.list&&T.list.find(y=>y.u===u&&y.id===id);
  try{if(a==='studio'){stop();SQSUITE.close();window.SQSTUDIO.open(true)}
   else if(a==='play'&&x)await play(x);else if(a==='stop'){stop();API.draw()}
   else if(a==='draft'&&x){const d=parse(x);if(!d){toast('This song can\'t be read.');return}d.n=String(x.n||d.n).slice(0,40);const key=await toDraft(d);stop();toast('Saved as '+key+'. Opening it…');openSongs(key)}
   else if((a==='ok'||a==='no')&&x){const re=String(T.msg[k]||'').trim().slice(0,300);await D().set(ref('songsub/'+u+'/'+id+'/st'),a);if(re)await D().set(ref('songsub/'+u+'/'+id+'/re'),re);
    if(a==='ok')await D().set(ref('artcred/s'+id),{n:String(x.who||nm(u)).slice(0,12),w:('Song: '+String(x.n||'')).slice(0,40)});
    const m=(a==='ok'?'Your song "'+x.n+'" was approved! Thank you. It will play in the game, and your name is in the credits.':'About your song "'+x.n+'": not this time.')+(re?' '+re:'');
    try{await D().set(ref('gifts/'+u+'/s'+Date.now().toString(36)),{m:m.slice(0,300),t:D().serverTimestamp(),f:'dev'})}catch(_){self.SQERR&&SQERR(_,'236-3')}x.st=a;if(re)x.re=re;toast(a==='ok'?'Approved.':'Answered.');API.draw()}}catch(err){fail(err)}},true);
 window.SQPSONGS={toDraft,openSongs,inbox};
 SQSUITE.addTab('psongs','Patron songs',{render,leave(){stop()}})})();
