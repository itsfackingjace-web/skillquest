// ---- 243. The Song Studio: Patrons make music and send it to the developer (window.SQSTUDIO, ptab 51) ----
// For active Patrons who aren't under 13 (START > Patron > Song Studio), and for developers (Dev Suite > Patron songs > Open the
// Song Studio). Made for people who have never used a music program: pick a mood (key, speed, band and chords come with it), then
// tap notes on a grid. Rows are the notes of the song's key only, so nothing can sound "wrong"; the bright rows (the pentatonic
// scale) fit every chord. Each section is 4 bars with one chord a bar (the key's chords, named by feeling); "Make me a tune" and
// "Pick chords for me" write ideas made here (original). Sections A-D are strung together in an order ("A A B A").
// The song is kept in 155's format (SQSONGS.check validates it, SQMUSIC plays it as `__st`), so an approved song drops straight
// into the Dev Suite's Songs editor. None of the game's own songs are in here. Draft on the device: localStorage `sq_song_draft`.
// SEND writes `songsub/<uid>/<push id>` {n, s (the song as JSON), note, who, t}; rules like the Art Room's (create-only by active
// 13+ Patrons, st/re by devs). Dev Suite > Patron songs: play, approve / not this time (gift message, `artcred` credit), "Put it in
// the Songs editor" (draft songs.su_<id>).
(()=>{const M=window.SQMUSIC;if(!M)return;const TAB=51,NB=4,MAXS=4,SECN=['A','B','C','D'];
 const mp=()=>window.SQMP,F=()=>window.SQFB,uid=()=>{const m=mp();return m&&m.user?m.user.uid:''};
 const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const kid=()=>!!(window.SQAGE&&SQAGE.child());
 const dev=()=>!!(window.SQDEV&&SQDEV());
 const can=()=>!!(window.SQPATRON&&SQPATRON.active(uid())&&!kid());
 const myNm=()=>{try{return String((typeof PNAME!=='undefined'&&PNAME)||'Patron').replace(/[<>]/g,'').slice(0,12)}catch(e){return'Patron'}};
 // ---- music theory, kept small ----
 const SH=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],FL=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
 const KEYS=['C','D','E','F','G','A','Bb','Am','Bm','Cm','Dm','Em','Gm'],FLATK=['F','Bb','Cm','Dm','Gm'];
 const isMin=k=>/m$/.test(k),root=k=>FL.indexOf(k.replace(/m$/,''))>=0?FL.indexOf(k.replace(/m$/,'')):SH.indexOf(k.replace(/m$/,''));
 const nameOf=(pc,k)=>(FLATK.includes(k)?FL:SH)[((pc%12)+12)%12];
 const SCALE=k=>isMin(k)?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11],PENTA=k=>isMin(k)?[0,3,5,7,10]:[0,2,4,7,9];
 // the key's chords: [steps above the key note, quality, a word for how it feels]
 const CHD=k=>isMin(k)?[[0,'m','home'],[5,'m','deep'],[7,'m','quiet'],[7,'','ready'],[8,'','warm'],[10,'','bold'],[3,'','bright']]
  :[[0,'','home'],[5,'','lift'],[7,'','ready'],[9,'m','sad'],[2,'m','soft'],[4,'m','dreamy']];
 const chordName=(k,i)=>{const c=CHD(k)[i];return nameOf(root(k)+c[0],k)+c[1]};
 const chordIdx=(k,name)=>CHD(k).findIndex((_,i)=>chordName(k,i)===name);
 const noteName=(m,k)=>nameOf(m,k)+(Math.floor(m/12)-1);
 // grid rows: two octaves of the key's notes, low to high
 function rows(k){const r=root(k),base=60+r-(r>=7?12:0),sc=SCALE(k),pt=PENTA(k),out=[];for(let o=0;o<2;o++)for(const s of sc)out.push({m:base+12*o+s,p:pt.includes(s),t:s===0});out.push({m:base+24,p:true,t:true});return out}
 // ---- moods: a starting band, key, speed and chords ----
 const MOODS={village:['Calm village','Gentle, for walking around town',{key:'C',bpm:92,m:8,lead:'flute',harm:'clarinet',pad:'strings',arp:'guitar',arps:'strum',bass:'pizz',bs:'pizz',perc:'none'},[[0,1,2,0],[3,1,0,2]]],
  adventure:['Adventure','Brave and moving, for exploring',{key:'D',bpm:112,m:8,lead:'horn',harm:'strings',pad:'strings',arp:'harp',arps:'harp8',bass:'cello',bs:'drive',perc:'march'},[[0,1,2,0],[3,1,0,2]]],
  night:['Night','Quiet and starry',{key:'Am',bpm:72,m:6,lead:'celesta',pad:'choir',arp:'harp',arps:'sparkle',bass:'contrabass',bs:'held',perc:'none'},[[0,4,6,5],[4,5,0,0]]],
  cave:['Spooky cave','Dark and creeping',{key:'Dm',bpm:68,m:8,lead:'oboe',pad:'choir',arp:'pizz',arps:'ost8',bass:'contrabass',bs:'pedal',perc:'timp'},[[0,4,5,0],[1,0,3,0]]],
  sea:['Sea shanty','Rolling waves, sing along',{key:'G',bpm:120,m:6,lead:'accordion',arp:'guitar',arps:'strum',bass:'pizz',bs:'shanty',perc:'tamb'},[[0,1,2,0],[5,1,2,0]]],
  boss:['Boss fight','Fast and dangerous',{key:'Em',bpm:148,m:8,lead:'brass',harm:'horn',pad:'strings',arp:'violin',arps:'ost8',bass:'cello',bs:'drive',perc:'boss'},[[0,4,5,0],[1,0,3,0]]],
  desert:['Desert','Hot sun and sand',{key:'Am',bpm:100,m:8,lead:'shanai',pad:'strings',arp:'sitar',arps:'stab',bass:'cello',bs:'root5',perc:'taiko'},[[0,5,4,3],[1,0,5,3]]],
  waltz:['Waltz','One-two-three, for dancing',{key:'F',bpm:132,m:6,lead:'violin',harm:'cello',arp:'harp',arps:'harp8',bass:'pizz',bs:'waltz',perc:'none'},[[0,1,2,0],[3,1,2,0]]]};
 const LEADS=[['flute','Flute'],['panflute','Pan flute'],['clarinet','Clarinet'],['oboe','Oboe'],['violin','Violin'],['horn','Horn'],['brass','Trumpets'],['accordion','Accordion'],['celesta','Music box'],['harp','Harp'],['guitar','Guitar'],['shanai','Shehnai'],['sitar','Sitar'],['choir','Choir']].filter(q=>M.INST[q[0]]);
 // ---- the song being made ----
 let ST=null;
 function fresh(mood){const md=MOODS[mood]||MOODS.village,b=md[2];return{n:'',mood,...JSON.parse(JSON.stringify(b)),secs:[{c:md[3][0].map(i=>chordName(b.key,i)),n:[]},{c:md[3][1].map(i=>chordName(b.key,i)),n:[]}],order:['A','A','B','A'],
  cur:0,len:2,view:'make',pick:-1,note:'',sent:'',mine:null,drums:b.perc!=='none'}}
 function load(){if(ST)return;try{const d=JSON.parse(localStorage.getItem('sq_song_draft')||'null');if(d&&Array.isArray(d.secs)&&d.secs.length&&KEYS.includes(d.key)){ST=Object.assign(fresh(d.mood),d,{view:'make',pick:-1,sent:'',mine:null});return}}catch(e){self.SQERR&&SQERR(e,'235-1')}ST=null}
 let keepT=0;const keep=()=>{clearTimeout(keepT);keepT=setTimeout(()=>{if(!ST||ST.dev)return;try{const o={...ST};delete o.mine;delete o.view;delete o.sent;delete o.dev;localStorage.setItem('sq_song_draft',JSON.stringify(o))}catch(e){self.SQERR&&SQERR(e,'235-2')}},300)};
 const UNDO=[],REDO=[];const snapU=()=>{UNDO.push(JSON.stringify(ST.secs));if(UNDO.length>80)UNDO.shift();REDO.length=0};
 const m8=()=>ST.m===6?6:8,cols=()=>NB*m8(),sec=()=>ST.secs[Math.min(ST.cur,ST.secs.length-1)];
 // ---- to 155's format ----
 function melText(s){const N=cols(),tk=new Array(N).fill('.');for(const n of s.n.slice().sort((a,b)=>a.s-b.s)){if(n.s>=N)continue;tk[n.s]=noteName(n.m,ST.key);for(let i=1;i<n.d&&n.s+i<N;i++)tk[n.s+i]='-'}
  const out=[];for(let b=0;b<NB;b++)out.push(tk.slice(b*m8(),b*m8()+m8()).join(' '));return out.join(' | ')}
 function toDef(only){const parts={};ST.secs.forEach((s,i)=>{parts[SECN[i]]=[s.c.join(' '),melText(s)]});
  const d={n:String(ST.n||'My song').trim().slice(0,40)||'My song',bpm:Math.max(50,Math.min(200,ST.bpm|0)),m:m8(),key:ST.key,lead:ST.lead,bass:ST.bass,bs:ST.bs,perc:ST.drums?ST.perc&&ST.perc!=='none'?ST.perc:'march':'none',swing:0,parts,
   order:(only!=null?[SECN[only]]:ST.order.filter(o=>parts[o])).join(' ')||'A'};
  for(const k of['harm','pad','arp','arps'])if(ST[k])d[k]=ST[k];return d}
 const check=d=>window.SQSONGS&&SQSONGS.check?SQSONGS.check(d):{def:d,errs:[]};
 // ---- sound ----
 let playing=null;
 function stop(){if(playing){M.force=null;playing=null;delete M.S.__st;delete M.SONGS.__st}}
 async function play(which){stop();const c=check(toDef(which==='sec'?ST.cur:null));if(!c.def){say(c.errs[0]||'That can\'t play yet.');return}
  M.S.__st=c.def;M.SONGS.__st=M.build(c.def);M.VOL.__st=1.6;
  try{if(typeof ACX!=='undefined'&&ACX&&ACX.state!=='running')await ACX.resume()}catch(e){self.SQERR&&SQERR(e,'235-3')}if(typeof MUSIC!=='undefined'&&!MUSIC)say('Music is off in Options: turn it on to hear your song.');
  playing={w:which,sec:ST.cur};rPn();try{await M.loadSong('__st')}catch(e){say('Could not load the instruments yet: check your connection.')}if(playing)M.force='__st'}
 const ping=m=>{try{M.note(ST.lead,m,.35)}catch(e){self.SQERR&&SQERR(e,'235-4')}};
 // which eighth of the shown section is playing now (for the moving line)
 function playCol(){if(!playing||M.cur!=='__st'||!M.S.__st)return-1;const sp=60/M.S.__st.bpm/4,lag=Math.round(.35/sp);let st=Math.max(0,M.step-lag)%Math.max(1,M.len),e8=Math.floor(st/2),N=cols();
  if(playing.w==='sec')return playing.sec===ST.cur?e8:-1;const ord=ST.order.filter(o=>SECN.indexOf(o)<ST.secs.length);const i=Math.floor(e8/N);return SECN[ST.cur]===ord[i]?e8%N:-1}
 // ---- ideas (made here, so they're original) ----
 function tune(s){const N=m8(),R=rows(ST.key),out=[];let seed=(Date.now()&0xffff)+7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const RH=N===8?[[0,2,4,6],[0,1,2,4,6],[0,2,3,4,6],[0,3,4,6],[0,2,4,5,6],[0,4,6],[0,1,2,3,4,6]]:[[0,2,4],[0,1,2,4],[0,3],[0,2,3,4],[0,1,2,3,4,5]];
  let ri=Math.floor(R.length/2)-2;const tonesOf=c=>{const i=chordIdx(ST.key,c);const q=CHD(ST.key)[Math.max(0,i)];const r0=(root(ST.key)+q[0])%12,iv=q[1]==='m'?[0,3,7]:[0,4,7];return iv.map(v=>(r0+v)%12)};
  s.c.forEach((c,bi)=>{const r=RH[Math.floor(rnd()*RH.length)],tones=tonesOf(c),last=bi===s.c.length-1;
   r.forEach((st,j)=>{const end=j+1<r.length?r[j+1]:N;if(rnd()<.12&&j>0)return;
    if(st===0||last&&j===r.length-1){let best=ri,bd=99;for(let d=-3;d<=3;d++){const q=R[ri+d];if(q&&tones.includes(q.m%12)&&Math.abs(d)<bd){bd=Math.abs(d);best=ri+d}}ri=best}
    else{ri+=rnd()<.5?-1:1;if(rnd()<.2)ri+=rnd()<.5?-1:1}
    ri=Math.max(2,Math.min(R.length-3,ri));if(!R[ri].p&&rnd()<.6)ri+=ri<R.length/2?1:-1;out.push({s:bi*N+st,d:end-st,m:R[ri].m})})});
  return out}
 function chordsFor(){const P=isMin(ST.key)?[[0,4,6,5],[0,1,3,0],[0,5,4,3],[4,5,0,0],[0,6,5,3],[1,0,3,0]]:[[0,1,2,0],[0,3,1,2],[3,1,0,2],[0,2,3,1],[1,2,5,3],[0,4,1,2]];
  return P[Math.floor(Math.random()*P.length)].map(i=>chordName(ST.key,i))}
 // one note at a time: a new note replaces what it covers and shortens one it starts inside
 function place(s,n){s.n=s.n.filter(o=>!(o.s>=n.s&&o.s<n.s+n.d));for(const o of s.n)if(o.s<n.s&&o.s+o.d>n.s)o.d=n.s-o.s;s.n.push(n)}
 // change of beat (4/4 <-> 6/8): each bar's notes are spread over the new bar
 function remeter(nm,om){for(const sc of ST.secs){const out=[];for(const n of sc.n.slice().sort((a,b)=>a.s-b.s)){const b=Math.floor(n.s/om),o=n.s%om,s2=b*nm+Math.round(o*nm/om);if(out.some(q=>q.s===s2))continue;out.push({s:s2,d:Math.max(1,Math.round(n.d*nm/om)),m:n.m})}
   out.forEach((n,i)=>{const nx=out[i+1];if(nx&&n.s+n.d>nx.s)n.d=nx.s-n.s;n.d=Math.min(n.d,NB*nm-n.s)});sc.n=out}}
 // change of key: move notes and chords to the same places in the new key
 function setKey(k){if(k===ST.key)return;const R0=rows(ST.key),R1=rows(k);for(const s of ST.secs){for(const n of s.n){const i=R0.findIndex(r=>r.m===n.m);n.m=R1[Math.max(0,Math.min(R1.length-1,i<0?7:i))].m}
   s.c=s.c.map(c=>{const i=chordIdx(ST.key,c);return chordName(k,i<0?0:Math.min(i,CHD(k).length-1))})}ST.key=k}
 // ---- the screen ----
 {const st=document.createElement('style');st.textContent=`#pn.ssw .pc{max-width:980px}
#pn .ssx{font:500 14px ${PF};color:#303030}#pn .sshd{display:flex;align-items:center;gap:6px;margin:0 0 6px}#pn .sshd .tl{flex:1;margin:0;text-align:left}
#pn .ssb{font:700 13px ${PF};width:auto;flex:none;margin:0;min-height:38px;padding:4px 10px;border:3px solid #485870;background:#fff;color:#303030;cursor:pointer;border-radius:4px;touch-action:manipulation}
#pn .ssb.on{background:#ffe8b0;border-color:#c88010}#pn .ssb.pri{background:#3a8a4a;color:#fff;border-color:#1f5a2c}#pn .ssb:disabled{opacity:.4;cursor:default}
#pn .ssrow{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin:6px 0}#pn .sssm{font-size:12px;opacity:.75}
#pn .ssstep{font:700 13px ${PF};margin:12px 0 4px;color:#485870}
#pn .ssmood{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}
#pn .ssmood button{text-align:left;font:700 13px ${PF};color:#303030;min-height:0;height:auto;padding:8px;border:3px solid #485870;background:#fff;border-radius:4px;cursor:pointer}#pn .ssmood button.on{background:#ffe8b0;border-color:#c88010}
#pn .ssmood small{display:block;font-weight:500;opacity:.7;font-size:11px}
#pn .ssgw{overflow-x:auto;border:3px solid #485870;background:#fff;padding:0 0 4px}
#pn .ssg{display:grid;gap:1px;background:#d8dce4;width:max-content}
#pn .ssg .sc{display:block;height:24px;width:24px;min-width:0;background:#fff;cursor:pointer;margin:0;padding:0;border:0;box-sizing:border-box}#pn .ssg .sc.pa{background:#f4f6fa}#pn .ssg .sc.bl{box-shadow:inset 2px 0 0 #8890a0}
#pn .ssg .sc.pl{background:#fff4c8}#pn .ssg .lb{width:44px;font:700 11px ${PF};display:flex;align-items:center;justify-content:flex-end;padding-right:4px;background:#eef0f4;cursor:pointer}
#pn .ssg .lb.pa{opacity:.55}#pn .ssg .nt{border-radius:5px;margin:2px 1px;z-index:1;cursor:pointer;border:2px solid rgba(0,0,0,.35)}
#pn .ssg .ch{height:34px;font:700 12px ${PF};display:flex;flex-direction:column;align-items:center;justify-content:center;background:#e8eef8;cursor:pointer;border-left:2px solid #8890a0}
#pn .ssg .ch small{font-size:10px;font-weight:500;opacity:.7}#pn .ssg .ch.on{background:#ffe8b0}
#pn .sschp{display:flex;flex-wrap:wrap;gap:4px;padding:6px;background:#fff8e0;border:2px solid #c88010;border-radius:4px;margin:4px 0}
#pn .ssord{display:flex;flex-wrap:wrap;gap:4px;align-items:center}#pn .ssord b{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;border-radius:4px;color:#fff;cursor:pointer;font:700 15px ${PF}}
#pn .ssin{width:100%;box-sizing:border-box;font:500 16px ${PF};padding:8px;border:2px solid #485870;background:#fff;color:#303030;border-radius:4px}
#pn .sssub{display:flex;gap:10px;align-items:center;border-bottom:1px solid #c8c8c8;padding:8px 0}`;document.head.appendChild(st)}
 const SCOL=['#3a8ad8','#d8a020','#3a9a5a','#b0509a'],RCOL=['#e04848','#f08a28','#e8c020','#58b848','#2ab0b0','#4870e0','#9858d0'];
 const b=(a,l,on,x)=>'<button class="ssb'+(on?' on':'')+'" data-ss="'+a+'"'+(x||'')+'>'+l+'</button>';
 function html(){if(!ST.dev&&!can())return'<div class="tl">SONG STUDIO</div><p>The Song Studio is open to Patrons aged 13 and up.</p>'+b('back','Back');
  if(ST.view==='send')return sendHTML();if(ST.view==='mine')return mineHTML();
  const s=sec(),N=cols(),m=m8(),R=rows(ST.key),pc=playCol();
  let h='<div class="ssx"><div class="sshd"><div class="tl">SONG STUDIO</div>'+(ST.dev?'':b('mine','My songs'))+b('back',ST.dev?'Back to the Dev Suite':'Back')+'</div>';
  h+='<div class="ssstep">1. Pick a mood</div><div class="ssmood">'+Object.entries(MOODS).map(([k,v])=>'<button data-ss="mood:'+k+'" class="'+(ST.mood===k?'on':'')+'">'+v[0]+'<small>'+v[1]+'</small></button>').join('')+'</div>'+
   '<p class="sssm">Picking a mood sets the band, speed and chords. Your notes stay.</p>';
  h+='<div class="ssstep">2. Tap notes on the grid</div>';
  h+='<div class="ssrow">'+ST.secs.map((q,i)=>'<button class="ssb'+(i===ST.cur?' on':'')+'" data-ss="sec:'+i+'" style="border-color:'+SCOL[i]+'">Part '+SECN[i]+'</button>').join('')+(ST.secs.length<MAXS?b('addsec','＋ New part'):'')+(ST.secs.length>1?b('delsec','Delete part '+SECN[ST.cur]):'')+'</div>';
  h+='<div class="ssrow">'+b(playing&&playing.w==='sec'?'stop':'psec',playing&&playing.w==='sec'?'■ Stop':'▶ Play part '+SECN[ST.cur],playing&&playing.w==='sec')+b('tune','💡 Make me a tune')+b('chords','🎲 Pick chords for me')+b('clr','Clear notes')+
   b('undo','↶ Undo','',UNDO.length?'':' disabled')+b('redo','↷ Redo','',REDO.length?'':' disabled')+'</div>';
  h+='<div class="ssrow"><span class="sssm">Note length:</span>'+[[1,'Short'],[2,'Medium'],[4,'Long'],[8,'Very long']].map(([v,l])=>b('len:'+v,l,ST.len===v)).join('')+'</div>';
  // the grid: chord lane on top, then the rows (high notes at the top), notes drawn over the cells
  h+='<div class="ssgw"><div class="ssg" style="grid-template-columns:44px repeat('+N+',24px);grid-template-rows:34px repeat('+R.length+',24px)">';
  h+='<span class="lb" style="height:34px">Chord</span>';for(let bi=0;bi<NB;bi++){const ci=chordIdx(ST.key,s.c[bi]);h+='<span class="ch'+(ST.pick===bi?' on':'')+'" data-ss="pick:'+bi+'" style="grid-column:span '+m+'">'+E(s.c[bi])+'<small>'+(ci>=0?CHD(ST.key)[ci][2]:'')+'</small></span>'}
  const RR=R.slice().reverse();
  RR.forEach((r,ri)=>{const row=ri+2;h+='<span class="lb'+(r.p?'':' pa')+'" data-ss="row:'+r.m+'" style="grid-row:'+row+';grid-column:1'+(r.t?';color:#c03030':'')+'">'+noteName(r.m,ST.key)+(r.t?' ★':'')+'</span>';
   for(let c=0;c<N;c++)h+='<span data-sc="'+c+','+r.m+'" class="sc'+(r.p?'':' pa')+(c%m===0?' bl':'')+(c===pc?' pl':'')+'" style="grid-row:'+row+';grid-column:'+(c+2)+'"></span>'});
  for(const n of s.n){const ri=RR.findIndex(r=>r.m===n.m);if(ri<0)continue;const deg=SCALE(ST.key).indexOf(((n.m-root(ST.key))%12+12)%12);
   h+='<span class="nt" data-sn="'+n.s+'" title="'+noteName(n.m,ST.key)+'" style="grid-row:'+(ri+2)+';grid-column:'+(n.s+2)+' / span '+Math.min(n.d,N-n.s)+';background:'+RCOL[Math.max(0,deg)]+'"></span>'}
  h+='</div></div>';
  if(ST.pick>=0)h+='<div class="sschp"><span class="sssm" style="width:100%">Chord for bar '+(ST.pick+1)+' of part '+SECN[ST.cur]+' (tap one to hear it):</span>'+CHD(ST.key).map((q,i)=>{const nm=chordName(ST.key,i);return b('chord:'+nm,nm+' <small style="font-weight:500">'+q[2]+'</small>',s.c[ST.pick]===nm)}).join('')+b('pick:-1','Done')+'</div>';
  h+='<p class="sssm">Tap a square to put a note there, tap a note to take it away. Tap a note name on the left to hear it. The bright rows fit every chord; pale rows sound best between them. ★ = the home note: ending on it sounds finished.</p>';
  h+='<div class="ssstep">3. Put the parts in order</div><div class="ssord">'+ST.order.map((o,i)=>'<b data-ss="odel:'+i+'" title="Tap to take it out" style="background:'+SCOL[SECN.indexOf(o)]+'">'+o+'</b>').join('')+
   '<span class="sssm" style="margin:0 4px">add:</span>'+ST.secs.map((_,i)=>b('oadd:'+SECN[i],'＋'+SECN[i],'',ST.order.length>=16?' disabled':'')).join('')+'</div>'+
   '<div class="ssrow">'+b(playing&&playing.w==='song'?'stop':'psong',playing&&playing.w==='song'?'■ Stop':'▶ Play the whole song',playing&&playing.w==='song')+'</div>';
  h+='<div class="ssstep">4. Sound</div><div class="ssrow"><label class="sssm">Melody played by <select id="sslead" class="ssin" style="width:auto;padding:4px">'+LEADS.map(([k,l])=>'<option value="'+k+'"'+(ST.lead===k?' selected':'')+'>'+l+'</option>').join('')+'</select></label>'+
   '<label class="sssm">Key <select id="sskey" class="ssin" style="width:auto;padding:4px">'+KEYS.map(k=>'<option value="'+k+'"'+(ST.key===k?' selected':'')+'>'+k.replace(/m$/,' minor').replace(/^([A-G]b?)$/,'$1 major')+'</option>').join('')+'</select></label>'+
   b('drums',ST.drums?'🥁 Drums on':'🥁 Drums off',ST.drums)+'</div>'+
   '<label class="sssm" style="display:block">Speed: <span id="ssbpm">'+ST.bpm+'</span> beats a minute<input type="range" id="ssbp" min="50" max="200" step="2" value="'+ST.bpm+'" style="width:100%"></label>';
  h+='<button class="ssb pri" data-ss="next" style="width:100%;min-height:46px;font-size:15px;margin-top:10px">'+(ST.dev?'Done? Name it and save it':'Done? Name it and send it')+'</button></div>';return h}
 function sendHTML(){const c=check(toDef());
  return'<div class="ssx"><div class="sshd"><div class="tl">'+(ST.dev?'SAVE YOUR SONG':'SEND YOUR SONG')+'</div>'+b('make','Back to the song')+'</div>'+
   (c.errs.length?'<p style="color:#a83232">'+E(c.errs[0])+'</p>':'')+
   '<label class="sssm" style="display:block;margin-top:8px;font-weight:700">Name</label><input id="ssnm" class="ssin" maxlength="24" value="'+E(ST.n)+'" placeholder="Like: Sunny Meadow">'+
   (ST.dev?'':'<label class="sssm" style="display:block;margin-top:8px;font-weight:700">A note for the developer (optional)</label><textarea id="ssnt" class="ssin" maxlength="300" rows="3" placeholder="Where would it fit in the game?">'+E(ST.note)+'</textarea>')+
   '<div class="ssrow">'+b(playing?'stop':'psong',playing?'■ Stop':'▶ Listen once more',!!playing)+'</div>'+
   (ST.dev?'<button class="ssb pri" data-ss="tosuite" style="width:100%;min-height:46px">Put it in the Songs editor (draft)</button>':
    '<p class="sssm">Only write music you made up yourself. Approved songs can play in the game, with your name in the credits.</p><button class="ssb pri" data-ss="send" style="width:100%;min-height:46px"'+(c.errs.length?' disabled':'')+'>Send it</button>')+
   (ST.sent?'<p><b>'+E(ST.sent)+'</b></p>':'')+'</div>'}
 function mineHTML(){let h='<div class="ssx"><div class="sshd"><div class="tl">MY SONGS</div>'+b('make','Back to the song')+'</div>';
  if(!ST.mine)return h+'<p>Loading…</p></div>';if(!ST.mine.length)return h+'<p>Nothing sent yet.</p></div>';
  for(const x of ST.mine)h+='<div class="sssub"><div style="flex:1"><b>'+E(x.n)+'</b> <span class="sssm">'+(x.t?new Date(x.t).toLocaleDateString():'')+'</span><br><span style="font-weight:700;color:'+(x.st==='ok'?'#2a7a3a':x.st==='no'?'#a83232':'#606060')+'">'+(x.st==='ok'?'Approved!':x.st==='no'?'Not this time':'Waiting for the developer')+'</span>'+(x.re?' · '+E(x.re):'')+'</div>'+b('load:'+x.id,'Open a copy')+'</div>';
  return h+'</div>'}
 // ---- input ----
 function act(a,v,btn){
  if(a==='back'){stop();if(ST.dev){try{closePanel()}catch(e){self.SQERR&&SQERR(e,'235-5')}pnOpen=false;try{SQSUITE.open()}catch(e){self.SQERR&&SQERR(e,'235-6')}return}ptab=window.SQPATRON&&SQPATRON.PTAB||8;rPn();return}
  if(a==='stop'){stop();rPn();return}if(a==='psec'){play('sec');return}if(a==='psong'){play('song');return}
  if(a==='mood'){const md=MOODS[v];if(!md)return;stop();snapU();const keepKey=ST.key,om=m8();if((md[2].m===6?6:8)!==om)remeter(md[2].m===6?6:8,om);Object.assign(ST,JSON.parse(JSON.stringify(md[2])));ST.key=keepKey;ST.mood=v;ST.drums=md[2].perc!=='none';
   const k2=md[2].key;setKey(k2);ST.secs.forEach((s,i)=>{s.c=md[3][i%2].map(j=>chordName(ST.key,j))})}
  else if(a==='sec'){ST.cur=+v;ST.pick=-1}
  else if(a==='addsec'&&ST.secs.length<MAXS){snapU();ST.secs.push({c:chordsFor(),n:[]});ST.cur=ST.secs.length-1;if(ST.order.length<16)ST.order.push(SECN[ST.cur])}
  else if(a==='delsec'&&ST.secs.length>1){if(btn&&btn.dataset.sure!=='1'){btn.dataset.sure='1';btn.textContent='Sure? Tap again';return}snapU();const gone=SECN[ST.cur];ST.secs.splice(ST.cur,1);
   ST.order=ST.order.filter(o=>o!==gone).map(o=>{const i=SECN.indexOf(o);return i>ST.cur?SECN[i-1]:o});if(!ST.order.length)ST.order=['A'];ST.cur=Math.max(0,ST.cur-1)}
  else if(a==='tune'){snapU();sec().n=tune(sec())}else if(a==='chords'){snapU();sec().c=chordsFor()}else if(a==='clr'){snapU();sec().n=[]}
  else if(a==='undo'&&UNDO.length){REDO.push(JSON.stringify(ST.secs));ST.secs=JSON.parse(UNDO.pop())}else if(a==='redo'&&REDO.length){UNDO.push(JSON.stringify(ST.secs));ST.secs=JSON.parse(REDO.pop())}
  else if(a==='len')ST.len=+v||2;else if(a==='pick')ST.pick=+v;
  else if(a==='chord'&&ST.pick>=0){snapU();sec().c[ST.pick]=v;try{const r0=M.chord(v);for(const iv of r0.iv)M.note(ST.pad||'strings',48+r0.r+iv,.8)}catch(e){self.SQERR&&SQERR(e,'235-7')}}
  else if(a==='row')ping(+v);
  else if(a==='oadd'&&ST.order.length<16)ST.order.push(v);else if(a==='odel'){ST.order.splice(+v,1);if(!ST.order.length)ST.order=['A']}
  else if(a==='drums')ST.drums=!ST.drums;
  else if(a==='next'){if(!ST.secs.some(s=>s.n.length)){say('Put some notes on the grid first (or tap "Make me a tune").');return}stop();ST.view='send';ST.sent=''}
  else if(a==='make')ST.view='make';
  else if(a==='mine'){ST.view='mine';ST.mine=null;loadMine()}
  else if(a==='load'){const x=(ST.mine||[]).find(q=>q.id===v);if(x)fromDef(x);ST.view='make'}
  else if(a==='send'){send();return}else if(a==='tosuite'){toSuite();return}
  keep();rPn()}
 // a sent song back into the editor (only songs made here: 4-bar parts A-D)
 function fromDef(x){try{const d=typeof x.s==='string'?JSON.parse(x.s):x.s;const k=KEYS.includes(d.key)?d.key:'C';const o=fresh('village');Object.assign(o,{n:x.n||d.n,key:k,bpm:d.bpm,m:d.m===6?6:8,lead:d.lead,bass:d.bass,bs:d.bs,perc:d.perc,drums:d.perc!=='none',harm:d.harm,pad:d.pad,arp:d.arp,arps:d.arps});
  o.secs=[];for(const pn of SECN){const p=d.parts&&d.parts[pn];if(!p)break;const N=NB*o.m,tk=String(p[1]).replace(/\|/g,' ').trim().split(/\s+/),n=[];let last=null;
   tk.slice(0,N).forEach((t,i)=>{if(t==='-'){if(last)last.d++;return}if(t==='.'){last=null;return}const v=M.midi(t.split('/')[0]);last=v?{s:i,d:1,m:v}:null;if(last)n.push(last)});o.secs.push({c:String(p[0]).split(/\s+/).slice(0,NB),n})}
  if(!o.secs.length)return;o.order=String(d.order||'A').split(/\s+/).filter(q=>SECN.indexOf(q)>=0&&SECN.indexOf(q)<o.secs.length);o.dev=ST.dev;ST=o;keep()}catch(e){say('That song can\'t be opened here.')}}
 async function send(){const u=uid(),Fb=F();if(!u||!Fb){say('Sign in to send your song.');return}if(!can()){say('The Song Studio is for Patrons aged 13 and up.');return}
  const clean=t=>window.SQFILTER?SQFILTER.clean(t):t,name=clean(String(ST.n||'').trim()).slice(0,24);if(!name){ST.sent='Give your song a name first.';rPn();return}
  ST.n=name;const c=check(toDef());if(!c.def){ST.sent=c.errs[0];rPn();return}const d={n:name,s:JSON.stringify(c.def),who:myNm(),t:Fb.db.serverTimestamp()};const nt=clean(String(ST.note||'').trim()).slice(0,300);if(nt)d.note=nt;
  ST.sent='Sending...';rPn();try{await Fb.db.push(Fb.db.ref(Fb.D,'songsub/'+u),d);ST.sent='Sent! You\'ll get a message when the developer has listened to "'+name+'".';say('Your song was sent to the developer.')}catch(e){ST.sent='That didn\'t send. Check your connection and try again.'}rPn()}
 async function loadMine(){const u=uid(),Fb=F();if(!u||!Fb){ST.mine=[];rPn();return}try{const v=(await Fb.db.get(Fb.db.ref(Fb.D,'songsub/'+u))).val()||{};ST.mine=Object.entries(v).map(([id,x])=>({id,...x})).sort((a,b)=>(b.t||0)-(a.t||0))}catch(e){ST.mine=[]}rPn()}
 async function toSuite(){const c=check(toDef());if(!c.def){ST.sent=c.errs[0];rPn();return}const n=String(ST.n||'').trim().slice(0,24)||'New song';c.def.n=n;
  try{const k=await window.SQPSONGS.toDraft(c.def);ST.sent='Saved as '+k+' in the draft.';stop();try{closePanel()}catch(e){self.SQERR&&SQERR(e,'235-8')}pnOpen=false;window.SQPSONGS.openSongs(k)}catch(e){ST.sent='Could not save: '+(e&&e.message||e);rPn()}}
 // ---- panel hook ----
 pbd.addEventListener('click',e=>{if(ptab!==TAB||!pnOpen||!ST)return;const c=e.target.closest&&e.target.closest('[data-sc],[data-sn],[data-ss]');if(!c)return;e.stopPropagation();e.preventDefault();
  if(c.dataset.ss){const i=c.dataset.ss.indexOf(':');act(i<0?c.dataset.ss:c.dataset.ss.slice(0,i),i<0?'':c.dataset.ss.slice(i+1),c);return}
  const s=sec();snapU();if(c.dataset.sn!=null){const st=+c.dataset.sn;s.n=s.n.filter(n=>n.s!==st)}
  else{const[col,m]=c.dataset.sc.split(',').map(Number);place(s,{s:col,d:Math.min(ST.len,cols()-col),m});ping(m)}keep();rPn()},true);
 pbd.addEventListener('input',e=>{if(ptab!==TAB||!ST)return;const t=e.target;if(t.id==='ssnm')ST.n=t.value.slice(0,24);else if(t.id==='ssnt')ST.note=t.value.slice(0,300);
  else if(t.id==='ssbp'){ST.bpm=+t.value;const s=document.getElementById('ssbpm');if(s)s.textContent=ST.bpm;if(playing&&M.S.__st){M.S.__st.bpm=ST.bpm}}keep()},true);
 pbd.addEventListener('change',e=>{if(ptab!==TAB||!ST)return;const t=e.target;if(t.id==='sslead'){ST.lead=t.value;ping(rows(ST.key)[7].m)}else if(t.id==='sskey'){stop();snapU();setKey(t.value)}else return;keep();rPn()},true);
 {const _r=rPn;rPn=function(){try{if(!(ptab===TAB&&pnOpen))pn.classList.remove('ssw')}catch(e){self.SQERR&&SQERR(e,'235-9')}if(ptab===TAB&&pnOpen&&ST){try{panelChrome('')}catch(e){self.SQERR&&SQERR(e,'235-10')}const sx=(document.querySelector('#pn .ssgw')||{}).scrollLeft||0;pbd.innerHTML=html();try{pn.classList.add('ssw')}catch(e){self.SQERR&&SQERR(e,'235-11')}const g=document.querySelector('#pn .ssgw');if(g)g.scrollLeft=sx;return}if(!(ptab===TAB&&pnOpen))stop();return _r.apply(this,arguments)}}
 // the moving line while a song plays (only the grid cells' class changes)
 let lastPc=-2;setInterval(()=>{if(ptab!==TAB||!pnOpen||!ST||ST.view!=='make'){lastPc=-2;return}if(!playing&&lastPc===-2)return;const pc=playCol();if(pc===lastPc)return;lastPc=pc;
  document.querySelectorAll('#pn .ssg .sc.pl').forEach(x=>x.classList.remove('pl'));if(pc>=0)document.querySelectorAll('#pn .ssg [data-sc^="'+pc+',"]').forEach(x=>x.classList.add('pl'))},90);
 function open(asDev){if(!asDev&&!can()){say('The Song Studio is for Patrons aged 13 and up.');return}if(asDev){ST=fresh('village');ST.dev=true;UNDO.length=REDO.length=0}else{if(!ST||ST.dev){ST=null;load();if(!ST)ST=fresh('village')}}ST.view='make';
  try{if(!pnOpen&&typeof openPanel==='function')openPanel(TAB)}catch(e){self.SQERR&&SQERR(e,'235-12')}ptab=TAB;pnOpen=true;try{pn.style.display='block'}catch(e){self.SQERR&&SQERR(e,'235-13')}rPn()}
 window.SQSTUDIO={open,get state(){return ST},toDef:()=>toDef(),fromDef,rows,chordName,CHD,KEYS,MOODS,act:(a,v)=>act(a,v),stop,TAB};
})();
