// ---- 171. Song editor (Dev Suite > Songs) ----
// Library songs.<key> = a song in 155's format {n, bpm, m (8ths per bar: 8 or 6), lead, harm, pad, arp, arps, bass, bs, perc,
// swing, vol, parts:{name:[chords, melody, {lead,harm}?]}, order}. A built-in key (day, night, briar, ...) replaces that song;
// su_<id> is a new song. songmap.<region> = song key: which song plays on that island (155's REGION_SONG; built-in islands
// and custom ones). Checked here before use (instruments must be in INST, every part must build); the originals come back
// when an entry is removed. The editor plays songs through SQMUSIC.force (155's scheduler, same instruments and mix).
// Melodies written here must be original. Since 190 the tab is a composer (piano roll, chord lane, keys); songs may carry key.
(()=>{const M=window.SQMUSIC;if(!M||!window.SQA)return;
 const ORIG={},OVOL={},OMAP={...M.REGION_SONG};for(const k in M.S){ORIG[k]=M.S[k];OVOL[k]=M.VOL[k]}
 const ARPS=['harp8','strum','stab','ost8','sparkle'],BS=['held','pedal','pizz','drive','walk','root5','waltz','shanty'],PERC=['none','timp','march','timp8','taiko','tamb','boss'];
 const num=(v,lo,hi,d)=>{v=+v;return isFinite(v)?Math.max(lo,Math.min(hi,v)):d};const str=(v,n)=>String(v==null?'':v).slice(0,n);
 const inst=(v,opt)=>typeof v==='string'&&M.INST[v]?v:opt?null:'flute';
 const CH=/^[A-G](#|b)?(m|7|m7|maj7|sus4|dim|aug)?$/,NOTE=/^[A-G](#|b)?[1-7]$/;
 // checks a song; returns {def, errs}
 function check(o){const errs=[];if(!o||typeof o!=='object')return{def:null,errs:['Not a song.']};
  const m=+o.m===6?6:8,def={n:str(o.n,40)||'Untitled',bpm:num(o.bpm,40,220,100)|0,m,lead:inst(o.lead),harm:inst(o.harm,1),pad:inst(o.pad,1),arp:inst(o.arp,1),arps:ARPS.includes(o.arps)?o.arps:'harp8',
   bass:inst(o.bass)||'pizz',bs:BS.includes(o.bs)?o.bs:'pizz',perc:PERC.includes(o.perc)?o.perc:'none',swing:o.swing?1:0,parts:{},order:''};if(/^[A-G]#?m?$/.test(o.key||''))def.key=o.key;
  if(!M.INST[o.bass])def.bass='pizz';if(!def.harm)delete def.harm;if(!def.pad)delete def.pad;if(!def.arp){delete def.arp;delete def.arps}
  const P=o.parts&&typeof o.parts==='object'?o.parts:{};
  for(const pn of Object.keys(P).slice(0,12)){if(!/^[A-Za-z0-9]{1,6}$/.test(pn)){errs.push('Part name "'+pn+'": letters and numbers only.');continue}
   const a=Array.isArray(P[pn])?P[pn]:Object.values(P[pn]||{}),chs=str(a[0],400).trim().replace(/\s+/g,' '),mel=str(a[1],4000).trim().replace(/\s+/g,' '),op=a[2]&&typeof a[2]==='object'?a[2]:{};
   const bars=chs?chs.split(' '):[];if(!bars.length)errs.push('Part '+pn+': no chords.');
   bars.forEach((b,i)=>{for(const c of b.split(','))if(!CH.test(c))errs.push('Part '+pn+', bar '+(i+1)+': "'+c+'" isn\'t a chord (like C, Am, G7, F#m, Bbmaj7).')});
   const BB=mel.split('|').map(x=>x.trim()).filter(Boolean);let tot=0;
   BB.forEach((b,i)=>{const tk=b.split(/\s+/);tot+=tk.length;for(const t of tk){if(t==='-'||t==='.')continue;for(const q of t.split('/'))if(!NOTE.test(q)){errs.push('Part '+pn+', bar '+(i+1)+': "'+t+'" isn\'t a note (like C5, F#4, Bb5), "-" or ".".');break}}
    if(mel.includes('|')&&tk.length!==m)errs.push('Part '+pn+', bar '+(i+1)+': '+tk.length+' eighth'+(tk.length===1?'':'s')+', a bar has '+m+'.')});
   if(!mel.includes('|')&&tot!==bars.length*m)errs.push('Part '+pn+': '+tot+' eighths for '+bars.length+' bars (needs '+bars.length*m+').');
   if(mel.includes('|')&&BB.length!==bars.length)errs.push('Part '+pn+': '+BB.length+' bars of melody, '+bars.length+' bars of chords.');
   const x={};if(inst(op.lead,1))x.lead=op.lead;if(inst(op.harm,1))x.harm=op.harm;def.parts[pn]=Object.keys(x).length?[chs,mel,x]:[chs,mel]}
  const ord=str(o.order,200).trim().split(/\s+/).filter(Boolean).slice(0,32);for(const p of ord)if(!def.parts[p])errs.push('Order: there\'s no part "'+p+'".');
  def.order=ord.filter(p=>def.parts[p]).join(' ');if(!def.order)errs.push('Order: list the parts to play, like "A A B A".');
  if(!errs.length){try{M.build(def)}catch(e){errs.push('Could not build it: '+e.message)}}
  return{def:errs.length?null:def,errs,vol:num(o.vol,.3,4,1.6)}}
 // ---- applying the library ----
 let MINE=new Set();
 SQA.onApply(lib=>{const L=lib&&lib.songs||{};for(const k of MINE){if(ORIG[k]){M.S[k]=ORIG[k];M.SONGS[k]=M.build(ORIG[k]);M.VOL[k]=OVOL[k]}else{delete M.S[k];delete M.SONGS[k];delete M.VOL[k]}}MINE=new Set();
  for(const k in L){if(!(ORIG[k]||/^su_[a-z0-9_]{1,30}$/.test(k)))continue;const c=check(L[k]);if(!c.def)continue;try{M.SONGS[k]=M.build(c.def);M.S[k]=c.def;M.VOL[k]=c.vol;MINE.add(k)}catch(e){}}
  for(const r in M.REGION_SONG)if(!(r in OMAP))delete M.REGION_SONG[r];Object.assign(M.REGION_SONG,OMAP);
  const SM=lib&&lib.songmap||{};for(const r in SM)if(typeof SM[r]==='string'&&M.S[SM[r]])M.REGION_SONG[r]=SM[r];
  try{if(M.cur&&MINE.has(M.cur))M.restart()}catch(e){}});
 window.SQSONGS={check,ORIG};
 // ======================= Dev Suite > Songs: a composer =======================
 // The song is still stored as text (155's format), but you write it on a piano roll: each part has a chord lane (tap a bar to
 // pick its chord, two per bar allowed) and a melody grid in 16ths (one note at a time, like the game's lead). Grid edits are
 // turned back into the text format (melText) and read back (parseMel), so what you see is exactly what plays. Keys colour the
 // scale's rows and offer that key's chords; chord tones of each bar are tinted. "Idea" writes a new melody over the chords
 // (generated here, so it's original). The text view stays under "Notes as text" for anyone who prefers typing.
 if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,E,dset,toast,fail,arm}=API;
 const NN=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],FL={'C#':'Db','D#':'Eb','F#':'Gb','G#':'Ab','A#':'Bb'};
 const FLATK=new Set(['F','A#','D#','G#','C#','Dm','Gm','Cm','Fm','A#m','D#m']),nm=m=>{const n=NN[((m%12)+12)%12];return(ST&&ST.w&&FLATK.has(ST.w.key)&&FL[n]?FL[n]:n)+(Math.floor(m/12)-1)},pc=n=>{const i=NN.indexOf(n);return i>=0?i:NN.indexOf(Object.keys(FL).find(k=>FL[k]===n)||'C')};
 const KEYS=[];for(const r of NN)KEYS.push(r,r+'m');
 const scaleOf=k=>{const mnr=/m$/.test(k),r=pc(k.replace(/m$/,''));return(mnr?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11]).map(v=>(r+v)%12)};
 const keyChords=k=>{const mnr=/m$/.test(k),r=pc(k.replace(/m$/,'')),sc=scaleOf(k),q=mnr?['m','dim','','m','m','','']:['','m','m','','','m','dim'];
  const out=sc.map((p,i)=>NN[p]+q[i]);if(mnr)out.push(NN[(r+7)%12]+'7');else out.push(NN[(r+7)%12]+'7');return out};
 const ROMAN={maj:['I','ii','iii','IV','V','vi','vii°','V7'],min:['i','ii°','III','iv','v','VI','VII','V7']};
 const QS=['','m','7','m7','maj7','sus4','dim','aug'];
 const redraw=()=>{API.draw();try{drawRoll()}catch(e){}setTimeout(()=>{try{drawRoll()}catch(e){}},0)};
 const ST={sel:null,w:null,errs:[],pi:0,playing:null,dirty:false,tool:'draw',fine:false,undo:[],redo:[],lo:60,drag:null,pick:null,sel1:null,text:false};
 const sec=()=>S.draft.songs||(S.draft.songs={}),map=()=>S.draft.songmap||(S.draft.songmap={});
 const clone=o=>JSON.parse(JSON.stringify(o));
 const toEd=d=>{const o=clone(d);o.parts=Object.entries(o.parts||{}).map(([n,a])=>({n,c:a[0],m:a[1],lead:(a[2]||{}).lead||'',harm:(a[2]||{}).harm||''}));o.vol=o.vol||M.VOL[ST.sel]||1.6;if(!o.key)o.key=guessKey(o);return o};
 const fromEd=w=>{const o={...w,parts:{}};for(const p of w.parts){const x={};if(p.lead)x.lead=p.lead;if(p.harm)x.harm=p.harm;o.parts[p.n]=Object.keys(x).length?[p.c,p.m,x]:[p.c,p.m]}for(const k of['harm','pad','arp'])if(!o[k])delete o[k];return o};
 const IO=(v,none)=>(none?'<option value="">'+none+'</option>':'')+Object.keys(M.INST).filter(k=>k!=='timpani'&&k!=='taiko').map(k=>'<option'+(k===v?' selected':'')+'>'+k+'</option>').join('');
 const SO=(L,v,lab)=>L.map(k=>'<option value="'+k+'"'+(k===v?' selected':'')+'>'+((lab&&lab[k])||k)+'</option>').join('');
 const songName=k=>(sec()[k]&&sec()[k].n)||(M.S[k]&&M.S[k].n)||k;
 const m8=()=>+ST.w.m===6?6:8,part=()=>ST.w&&ST.w.parts[Math.min(ST.pi,ST.w.parts.length-1)];
 const bars=p=>p.c.trim()?p.c.trim().split(/\s+/):[];
 // ---- melody text <-> notes (16th steps) ----
 function parseMel(txt,nb){const out=[],steps=nb*m8()*2;let st=0,last=null;
  for(const tk of String(txt||'').replace(/\|/g,' ').trim().split(/\s+/).filter(Boolean)){if(st>=steps)break;
   if(tk==='-'){if(last)last.d+=2;st+=2;continue}if(tk==='.'){last=null;st+=2;continue}
   const ps=tk.split('/');if(ps.length===2){const a=M.midi(ps[0]),b=M.midi(ps[1]);if(a)out.push({s:st,d:1,m:a});last=b?{s:st+1,d:1,m:b}:null;if(last)out.push(last);st+=2;continue}
   const v=M.midi(tk);last=v?{s:st,d:2,m:v}:null;if(last)out.push(last);st+=2}
  for(const n of out)n.d=Math.min(n.d,steps-n.s);return out}
 function melText(notes,nb){const m=m8(),steps=nb*m*2,occ=new Array(steps).fill(null);
  for(const n of notes.slice().sort((a,b)=>a.s-b.s))for(let k=0;k<n.d&&n.s+k<steps;k++)occ[n.s+k]=k?{c:n}:{n};
  const tk=[];for(let i=0;i<steps/2;i++){const a=occ[2*i],b=occ[2*i+1];
   if(a&&a.n){tk.push(b&&b.n?nm(a.n.m)+'/'+nm(b.n.m):nm(a.n.m))}else if(a&&a.c)tk.push('-');else tk.push(b&&b.n?nm(b.n.m):'.')}
  const out=[];for(let b=0;b<nb;b++)out.push(tk.slice(b*m,b*m+m).join(' '));return out.join(' | ')}
 const notesOf=p=>parseMel(p.m,bars(p).length);
 function setNotes(p,notes){p.m=melText(notes,bars(p).length);ST.dirty=true;ST.ok=false}
 // one note at a time: a new note cuts or replaces what it overlaps
 function place(notes,n){const out=[];for(const o of notes){if(o===n)continue;if(o.s>=n.s&&o.s<n.s+n.d)continue;if(o.s<n.s&&o.s+o.d>n.s){o.d=n.s-o.s;if(o.d<=0)continue}out.push(o)}out.push(n);return out}
 // ---- undo ----
 const snap=()=>{ST.undo.push(JSON.stringify(ST.w));if(ST.undo.length>100)ST.undo.shift();ST.redo=[]};
 function undo(r){const a=r?ST.redo:ST.undo,b=r?ST.undo:ST.redo,x=a.pop();if(!x)return;b.push(JSON.stringify(ST.w));ST.w=JSON.parse(x);ST.dirty=true;redraw()}
 // ---- sound ----
 const leadOf=()=>{const p=part();return(p&&p.lead)||ST.w.lead||'flute'};
 const ping=m=>{try{if(M.note)M.note(leadOf(),m,.35)}catch(e){}};
 function stop(){if(ST.playing){M.force=null;ST.playing=null;delete M.S.__ed;delete M.SONGS.__ed}}
 async function play(which){const w=fromEd(ST.w);if(which==='part'){const p=part();w.order=p.n}const c=check(w);ST.errs=c.errs;if(!c.def){redraw();return}
  M.S.__ed=c.def;M.SONGS.__ed=M.build(c.def);M.VOL.__ed=c.vol;
  try{if(typeof ACX!=='undefined'&&ACX&&ACX.state!=='running')await ACX.resume()}catch(e){}if(typeof MUSIC!=='undefined'&&!MUSIC)toast('Music is off in Options: turn it on to hear it.');
  try{await M.loadSong('__ed')}catch(e){toast('Could not load the instruments.')}M.force=null;M.force='__ed';ST.playing=which;redraw()}
 function guessKey(o){const cnt=new Array(12).fill(0);for(const pn in o.parts||{}){const a=o.parts[pn];const t=Array.isArray(a)?a:[a.c,a.m];for(const c of String(t[0]||'').split(/[\s,]+/).filter(Boolean)){try{const C=M.chord(c);for(const v of C.iv)cnt[(C.r+v)%12]+=2}catch(e){}}
   for(const tk of String(t[1]||'').replace(/\|/g,' ').split(/\s+/))for(const q of tk.split('/')){const v=M.midi(q);if(v)cnt[v%12]++}}
  let best='C',bs=-1;for(const k of KEYS){const sc=scaleOf(k);let sv=sc.reduce((a,p)=>a+cnt[p],0)+cnt[sc[0]]*.5;if(sv>bs){bs=sv;best=k}}return best}
 // ---- an idea: a melody over this part's chords (made here, so it's original) ----
 function idea(p){const B=bars(p),m=m8(),sc=scaleOf(ST.w.key||'C'),out=[];let seed=(Date.now()&0xffff)+1;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const RH=m===8?[[0,4,8,12],[0,2,4,8,12],[0,4,6,8,12],[0,6,8,10,12],[0,4,8,10,14],[0,8,12],[0,2,4,6,8,12]]:[[0,4,8],[0,2,4,8],[0,4,6,8],[0,6,8],[0,2,4,6,8,10]];
  let cur=(ST.lo+12)|0;const inSc=v=>sc.includes(((v%12)+12)%12);while(!inSc(cur))cur++;
  B.forEach((b,bi)=>{const C=M.chord(b.split(',')[0]),tones=C.iv.map(v=>(C.r+v)%12),r=RH[Math.floor(rnd()*RH.length)],last=bi===B.length-1;
   r.forEach((st,j)=>{const end=j+1<r.length?r[j+1]:m*2,strong=st%8===0;let v=cur;
    if(strong||last&&j===r.length-1){let bd=99;for(let d=-5;d<=5;d++){const t=cur+d;if(tones.includes(((t%12)+12)%12)&&Math.abs(d)<bd){bd=Math.abs(d);v=t}}}
    else{const dir=rnd()<.5?-1:1;v=cur+dir;let g=0;while(!inSc(v)&&g++<3)v+=dir;if(rnd()<.25){v+=dir;while(!inSc(v))v+=dir}}
    v=Math.max(ST.lo+2,Math.min(ST.lo+22,v));while(!inSc(v))v++;cur=v;if(last&&j===r.length-1){let bd=99;for(let d=-7;d<=7;d++){const t=cur+d;if(((t%12)+12)%12===C.r&&Math.abs(d)<bd){bd=Math.abs(d);v=t}}}
    out.push({s:bi*m*2+st,d:end-st,m:v})})});
  return out}
 // ---- presets for the band ----
 const PRE={adventure:['Adventure',{bpm:112,m:8,lead:'horn',harm:'strings',pad:'strings',arp:'harp',arps:'harp8',bass:'cello',bs:'drive',perc:'march'}],
  village:['Calm village',{bpm:92,m:8,lead:'flute',harm:'clarinet',pad:'strings',arp:'guitar',arps:'strum',bass:'pizz',bs:'pizz',perc:'none'}],
  night:['Night',{bpm:72,m:6,lead:'celesta',harm:'',pad:'choir',arp:'harp',arps:'sparkle',bass:'contrabass',bs:'held',perc:'none'}],
  cave:['Spooky cave',{bpm:68,m:8,lead:'oboe',harm:'',pad:'choir',arp:'pizz',arps:'ost8',bass:'contrabass',bs:'pedal',perc:'timp'}],
  boss:['Boss fight',{bpm:148,m:8,lead:'brass',harm:'horn',pad:'strings',arp:'violin',arps:'ost8',bass:'cello',bs:'drive',perc:'boss'}],
  sea:['Sea shanty',{bpm:120,m:6,lead:'accordion',harm:'',pad:'',arp:'guitar',arps:'strum',bass:'pizz',bs:'shanty',perc:'tamb'}],
  desert:['Desert',{bpm:100,m:8,lead:'shanai',harm:'',pad:'strings',arp:'sitar',arps:'stab',bass:'cello',bs:'root5',perc:'taiko'}],
  waltz:['Waltz',{bpm:132,m:6,lead:'violin',harm:'cello',pad:'',arp:'harp',arps:'harp8',bass:'pizz',bs:'waltz',perc:'none'}]};
 // ---- the roll ----
 const CW=14,RH=13,LANE=24,KW=44,ROWS=25;
 const geo=()=>{const p=part(),nb=bars(p).length,steps=nb*m8()*2;return{p,nb,steps,W:steps*CW+1,H:LANE+ROWS*RH+1,hi:ST.lo+ROWS-1}};
 function drawRoll(){const cv=document.getElementById('sgroll'),kc=document.getElementById('sgkeys');if(!cv||!ST.w||!part())return;const G=geo(),{p,nb,steps,hi}=G;
  if(cv.width!==G.W)cv.width=G.W;if(cv.height!==G.H)cv.height=G.H;kc.width=KW;kc.height=G.H;const x=cv.getContext('2d'),k=kc.getContext('2d'),sc=scaleOf(ST.w.key||'C'),B=bars(p),m=m8();
  x.fillStyle='#10131a';x.fillRect(0,0,G.W,G.H);
  // rows: scale rows lighter, black keys darker; chord tones of each bar tinted
  for(let r=0;r<ROWS;r++){const mm=hi-r,y=LANE+r*RH,inS=sc.includes(((mm%12)+12)%12),blk=[1,3,6,8,10].includes(((mm%12)+12)%12);x.fillStyle=inS?'#1d2330':blk?'#12151c':'#171b24';x.fillRect(0,y,G.W,RH);
   if(((mm%12)+12)%12===0){x.fillStyle='#2c3448';x.fillRect(0,y+RH-1,G.W,1)}}
  B.forEach((b,bi)=>{const hs=b.split(','),hw=m*2/hs.length;hs.forEach((c,hi2)=>{let C;try{C=M.chord(c)}catch(e){return}const tones=C.iv.map(v=>(C.r+v)%12),x0=(bi*m*2+hi2*hw)*CW;
    for(let r=0;r<ROWS;r++){const mm=hi-r;if(tones.includes(((mm%12)+12)%12)){x.fillStyle=((mm%12)+12)%12===C.r?'rgba(240,200,72,.13)':'rgba(240,200,72,.07)';x.fillRect(x0,LANE+r*RH,hw*CW,RH)}}})});
  for(let s=0;s<=steps;s++){x.fillStyle=s%(m*2)===0?'#5a6a8a':s%(m===6?6:4)===0?'#2e374a':s%2===0?'#202634':'#181c26';x.fillRect(s*CW,LANE,1,G.H-LANE)}
  // chord lane
  x.fillStyle='#1a2030';x.fillRect(0,0,G.W,LANE);B.forEach((b,bi)=>{const hs=b.split(','),hw=m*2/hs.length;hs.forEach((c,hi2)=>{const x0=(bi*m*2+hi2*hw)*CW,on=ST.pick&&ST.pick.b===bi&&ST.pick.h===hi2;
    x.fillStyle=on?'#f0c848':'#2a3550';x.fillRect(x0+2,3,hw*CW-4,LANE-6);x.fillStyle=on?'#181018':'#e8ecf8';x.font='700 12px system-ui,sans-serif';x.textBaseline='middle';x.fillText(c,x0+7,LANE/2)})});
  // notes
  for(const n of notesOf(p)){const r=hi-n.m;if(r<0||r>=ROWS){x.fillStyle='#f0c848';x.fillRect(n.s*CW+1,r<0?LANE:G.H-3,n.d*CW-2,2);continue}const y=LANE+r*RH,sel=ST.sel1&&ST.sel1.s===n.s;
   x.fillStyle=sel?'#fff2b0':'#f0c848';x.fillRect(n.s*CW+1,y+1,n.d*CW-2,RH-2);x.fillStyle='#8a6a10';x.fillRect(n.s*CW+n.d*CW-4,y+3,2,RH-6);
   if(n.d*CW>26){x.fillStyle='#3a2a00';x.font='600 9px system-ui,sans-serif';x.textBaseline='middle';x.fillText(nm(n.m),n.s*CW+4,y+RH/2+.5)}}
  if(ST.playing&&M.cur==='__ed'){let st=M.step%Math.max(1,M.len);if(ST.playing==='song'){let at=0;for(const pn of ST.w.order.split(/\s+/)){const q=ST.w.parts.find(z=>z.n===pn);if(!q)continue;const L=bars(q).length*m*2;if(st<at+L){st=q===p?st-at:-1;break}at+=L}if(st>=at)st=-1}
   if(st>=0&&st<steps){x.fillStyle='rgba(255,255,255,.75)';x.fillRect(st*CW,0,2,G.H)}}
  // keyboard
  k.fillStyle='#10131a';k.fillRect(0,0,KW,G.H);for(let r=0;r<ROWS;r++){const mm=hi-r,y=LANE+r*RH,blk=[1,3,6,8,10].includes(((mm%12)+12)%12);k.fillStyle=blk?'#22252c':'#e8e8ee';k.fillRect(blk?0:0,y,blk?KW-14:KW-1,RH-1);
   if(((mm%12)+12)%12===0||!blk&&sc[0]===((mm%12)+12)%12){k.fillStyle='#303448';k.font='700 9px system-ui,sans-serif';k.textBaseline='middle';k.fillText(nm(mm),3,y+RH/2)}}
  k.fillStyle='#8890a8';k.font='600 9px system-ui,sans-serif';k.fillText('chords',2,LANE/2)}
 setInterval(()=>{if(S.open&&S.tab==='songs'&&ST.playing)drawRoll()},90);
 // pointer on the roll
 function cell(e){const cv=document.getElementById('sgroll'),r=cv.getBoundingClientRect(),X=(e.clientX-r.left)*cv.width/r.width,Y=(e.clientY-r.top)*cv.height/r.height;return{X,Y,s:Math.floor(X/CW),row:Math.floor((Y-LANE)/RH),lane:Y<LANE}}
 function down(e){const G=geo(),c=cell(e),p=G.p,m=m8();if(c.s<0||c.s>=G.steps)return;e.preventDefault();
  if(c.lane){const B=bars(p),bi=Math.floor(c.s/(m*2)),hs=B[bi].split(','),h=Math.min(hs.length-1,Math.floor((c.s%(m*2))/(m*2/hs.length)));ST.pick={b:bi,h};redraw();return}
  if(c.row<0||c.row>=ROWS)return;const mm=G.hi-c.row;let notes=notesOf(p);const hit=notes.find(n=>n.m===mm&&c.s>=n.s&&c.s<n.s+n.d);
  if(e.button===2||ST.tool==='erase'){if(hit){snap();setNotes(p,notes.filter(n=>n!==hit));drawRoll()}return}
  snap();if(hit){const resize=c.s>=hit.s+hit.d-1&&hit.d>1;ST.drag={mode:resize?'size':'move',n:hit,s0:hit.s,m0:hit.m,c0:c,notes};ST.sel1=hit;ping(hit.m);return}
  let s0=ST.fine?c.s:c.s&~1;if(s0%2===1&&!notes.some(n=>n.s===s0-1))s0--;/* a 16th on the off-beat pairs with the note just before it (which becomes a 16th) */const n={s:s0,d:ST.fine?1:2,m:mm};notes=place(notes,n);ST.drag={mode:'size',n,s0,m0:mm,c0:c,notes,fresh:1};ST.sel1=n;ping(mm);setNotes(p,notes);drawRoll()}
 function move(e){const D=ST.drag;if(!D)return;const G=geo(),c=cell(e),n=D.n;
  if(D.mode==='size'){let d=Math.max(1,c.s-n.s+1);if(!ST.fine)d=Math.max(2,d+(d&1));n.d=Math.min(d,G.steps-n.s)}
  else{let s=D.s0+(c.s-D.c0.s);if(!ST.fine)s&=~1;s=Math.max(0,Math.min(G.steps-n.d,s));const mm=Math.max(G.hi-ROWS+1,Math.min(G.hi,D.m0+(D.c0.row-c.row)));if(mm!==n.m)ping(mm);n.s=s;n.m=mm}
  setNotes(G.p,place(D.notes.filter(o=>o!==n).map(o=>({...o})),n));drawRoll()}
 function up(){if(!ST.drag)return;ST.drag=null;const p=part();setNotes(p,notesOf(p));redraw()}
 document.addEventListener('pointerdown',e=>{if(S.tab!=='songs'||!e.target||e.target.id!=='sgroll')return;try{e.target.setPointerCapture(e.pointerId)}catch(x){}down(e)},true);
 document.addEventListener('pointermove',e=>{if(S.tab==='songs'&&ST.drag)move(e)},true);
 document.addEventListener('pointerup',e=>{if(S.tab==='songs'&&ST.drag)up()},true);
 document.addEventListener('contextmenu',e=>{if(e.target&&e.target.id==='sgroll')e.preventDefault()},true);
 document.addEventListener('pointerdown',e=>{if(S.tab!=='songs'||!e.target||e.target.id!=='sgkeys')return;const r=e.target.getBoundingClientRect(),Y=(e.clientY-r.top)*e.target.height/r.height,row=Math.floor((Y-LANE)/RH);if(row>=0&&row<ROWS)ping(geo().hi-row)},true);
 // ---- the page ----
 const chip=(a,l,on,t)=>'<button class="dv-b'+(on?' dv-tl dv-on':'')+'" data-sgx="'+a+'"'+(t?' title="'+E(t)+'"':'')+'>'+l+'</button>';
 function render(){const L=sec(),keys=[...Object.keys(ORIG),...Object.keys(L).filter(k=>!ORIG[k]).sort()];
  let h='<div class="dv-spr'+(ST.sel?' dv-has':'')+'"><div class="dv-ls"><button class="dv-b dv-pri" data-sgx="new">+ New song</button><button class="dv-b" data-sgx="map" style="margin-top:4px">Island songs…</button><div class="dv-grid" style="grid-template-columns:1fr">';
  for(const k of keys){const d=L[k],live=S.live&&S.live.songs&&S.live.songs[k],st=d?(JSON.stringify(d)===JSON.stringify(live)?'live':'draft'):'';
   h+='<button class="dv-it'+(ST.sel===k?' dv-on':'')+'" data-sgs="'+E(k)+'" style="flex-direction:row;justify-content:flex-start;padding:7px 10px">'+(st?'<i class="dv-bd dv-'+st+'">'+st.toUpperCase()+'</i>':'')+'<span style="font-size:13px;text-align:left">🎵 '+E(songName(k))+' <small class="dv-mut">'+E(k)+'</small></span></button>'}
  h+='</div></div><div class="dv-ed">';
  if(ST.sel==='__map'){const M2=map(),R=typeof WORLD_REGIONS!=='undefined'?Object.values(WORLD_REGIONS):[],all=Object.keys(M.S).filter(k=>k!=='__ed');
   h+='<div class="dv-card"><b>Island songs</b><p class="dv-mut">The song that plays outdoors on each island (bosses and sailing still have their own).</p><table>'+R.filter(r=>r.id!=='hollow').map(r=>'<tr><td style="padding:3px 10px 3px 0">'+E(r.name||r.id)+'</td><td><select data-sgm="'+E(r.id)+'"><option value="">'+(OMAP[r.id]?'(the game\'s: '+E(songName(OMAP[r.id]))+')':'(Hollow\'s day song)')+'</option>'+all.map(k=>'<option value="'+E(k)+'"'+(M2[r.id]===k?' selected':'')+'>'+E(songName(k))+'</option>').join('')+'</select></td></tr>').join('')+'</table>'+
    '<div class="dv-row" style="margin-top:8px"><button class="dv-b dv-pri" data-sgx="savemap">Save to draft</button></div></div>';return h+'</div></div>'}
  if(!ST.sel||!ST.w){h+='<div class="dv-card"><b>Songs</b><p class="dv-mut">Write your own music for the game. Pick a song to change it, or start a new one: choose a key and a band, set the chords for each bar, then tap notes onto the grid (or press 💡 Idea for a melody to start from). Play it, save it, publish it, and choose which island it plays on under "Island songs".</p></div>';return h+'</div></div>'}
  const w=ST.w,ro=!!ORIG[ST.sel],p=part(),m=m8(),mnr=/m$/.test(w.key||'C'),kc=keyChords(w.key||'C'),rom=mnr?ROMAN.min:ROMAN.maj;
  h+='<div class="dv-card"><div class="dv-row" style="flex-wrap:wrap;align-items:center"><b style="font-size:16px">🎵 '+E(w.n)+'</b><span class="dv-mut">'+E(ST.sel)+(ro?' · replaces the game\'s song':'')+'</span></div>'+
   '<div class="dv-row" style="flex-wrap:wrap;margin-top:6px;gap:6px">'+(ST.playing?chip('stop','■ Stop',1):chip('play:song','▶ Play song')+chip('play:part','▶ Play part '+E(p?p.n:''),0,'Loops just this part'))+chip('save','💾 Save to draft')+
   (sec()[ST.sel]?'<button class="dv-b '+(S.arm==='sgdel'?'dv-arm':'dv-bad')+'" data-sgx="del">'+(S.arm==='sgdel'?'Tap again':(ro?'Back to the game\'s song':'Delete song'))+'</button>':'')+'</div>'+
   (ST.errs.length?'<div style="background:#3a1a1a;border:1px solid #a04040;padding:6px 8px;margin:8px 0;font-size:13px">'+ST.errs.slice(0,12).map(E).join('<br>')+'</div>':ST.ok?'<p style="color:#7c6">✓ Looks good.</p>':'')+
   '<div class="dv-row" style="flex-wrap:wrap;gap:10px;margin-top:8px"><label class="dv-mut">Name<br><input type="text" data-sgf="n" maxlength="40" value="'+E(w.n)+'"></label>'+
   '<label class="dv-mut">Key<br><select data-sgf="key">'+KEYS.map(k=>'<option value="'+k+'"'+(k===w.key?' selected':'')+'>'+k.replace(/m$/,'')+(/m$/.test(k)?' minor':' major')+'</option>').join('')+'</select></label>'+
   '<label class="dv-mut">Speed <b>'+w.bpm+'</b> BPM<br><input type="range" data-sgf="bpm" min="40" max="220" value="'+w.bpm+'" style="width:140px"></label>'+
   '<label class="dv-mut">Time<br><select data-sgf="m"><option value="8"'+(m!==6?' selected':'')+'>4/4</option><option value="6"'+(m===6?' selected':'')+'>3/4 · 6/8</option></select></label><label class="dv-mut">Swing<br><input type="checkbox" data-sgf="swing"'+(w.swing?' checked':'')+'></label>'+
   '<label class="dv-mut">Loudness<br><input type="number" data-sgf="vol" min="0.3" max="4" step="0.05" value="'+w.vol+'" style="width:70px"></label></div>'+
   '<details style="margin-top:8px"'+(ST.band?' open':'')+' data-sgd="band"><summary class="dv-mut" style="cursor:pointer"><b>The band</b>: '+E([w.lead,w.pad,w.arp,w.bass].filter(Boolean).join(', '))+(w.perc&&w.perc!=='none'?', drums':'')+'</summary>'+
   '<div class="dv-row" style="flex-wrap:wrap;gap:6px;margin:6px 0"><span class="dv-mut">Start from:</span>'+Object.entries(PRE).map(([k,[l]])=>chip('pre:'+k,l)).join('')+'</div>'+
   '<div class="dv-row" style="flex-wrap:wrap"><label class="dv-mut">Melody<br><select data-sgf="lead">'+IO(w.lead)+'</select></label><label class="dv-mut">Second voice<br><select data-sgf="harm">'+IO(w.harm,'(none)')+'</select></label><label class="dv-mut">Held chord<br><select data-sgf="pad">'+IO(w.pad,'(none)')+'</select></label>'+
   '<label class="dv-mut">Figures<br><select data-sgf="arp">'+IO(w.arp,'(none)')+'</select></label><label class="dv-mut">Figure style<br><select data-sgf="arps">'+SO(ARPS,w.arps,{harp8:'flowing 8ths',strum:'strummed',stab:'short chords',ost8:'driving 8ths',sparkle:'sparkles'})+'</select></label>'+
   '<label class="dv-mut">Bass<br><select data-sgf="bass">'+IO(w.bass)+'</select></label><label class="dv-mut">Bass style<br><select data-sgf="bs">'+SO(BS,w.bs,{held:'long notes',pedal:'one low note',pizz:'plucked',drive:'driving',walk:'walking',root5:'root and fifth',waltz:'waltz',shanty:'shanty'})+'</select></label>'+
   '<label class="dv-mut">Drums<br><select data-sgf="perc">'+SO(PERC,w.perc,{none:'none',timp:'timpani',march:'march',timp8:'timpani 8ths',taiko:'taiko',tamb:'tambourine',boss:'boss fight'})+'</select></label></div></details>';
  // parts + order
  h+='<div style="margin-top:10px"><span class="dv-mut">Parts: </span>'+w.parts.map((q,i)=>chip('part:'+i,E(q.n)+' <small>'+bars(q).length+' bars</small>',i===ST.pi)).join(' ')+' '+chip('padd','+ New part')+chip('pdup','⧉ Copy this part')+(w.parts.length>1?chip('pdel','✕ Remove this part'):'')+'</div>'+
   '<div style="margin-top:6px"><span class="dv-mut">Plays in this order (then loops): </span>'+w.order.split(/\s+/).filter(Boolean).map((q,i)=>'<button class="dv-b" data-sgx="ordx:'+i+'" title="Take out">'+E(q)+' ✕</button>').join(' ')+' <span class="dv-mut">add:</span> '+w.parts.map(q=>chip('orda:'+q.n,'+'+E(q.n))).join('')+'</div>';
  if(p){h+='<div class="dv-row" style="flex-wrap:wrap;gap:6px;margin-top:10px;align-items:center"><b>Part '+E(p.n)+'</b>'+chip('tool:draw','✏ Draw',ST.tool==='draw','Tap to add a note, drag to make it longer or move it')+chip('tool:erase','🧽 Erase',ST.tool==='erase','Tap a note to remove it (or right-click)')+
    chip('fine',ST.fine?'16ths ✓':'16ths',ST.fine,'Place notes on 16ths')+chip('undo','↶')+chip('redo','↷')+chip('up','▲',0,'Show higher notes')+chip('down','▼',0,'Show lower notes')+
    chip('tr:1','+1')+chip('tr:-1','−1')+chip('tr:12','+8va')+chip('tr:-12','−8va')+chip('bar+','+ Bar')+(bars(p).length>1?chip('bar-','− Bar'):'')+chip('idea','💡 Idea',0,'Writes a new melody over these chords, in the key')+chip('clear','Clear notes')+'</div>';
   if(ST.pick){const B=bars(p),cur=(B[ST.pick.b]||'C').split(','),c=cur[ST.pick.h]||cur[0];
    h+='<div style="background:#1a2030;border:1px solid #f0c848;border-radius:6px;padding:8px;margin-top:6px"><b>Bar '+(ST.pick.b+1)+(cur.length>1?(ST.pick.h?' (second half)':' (first half)'):'')+': '+E(c)+'</b> '+chip('pickx','Done')+
     '<div class="dv-row" style="flex-wrap:wrap;gap:4px;margin-top:6px"><span class="dv-mut">In '+E((w.key||'C').replace(/m$/,'')+(mnr?' minor':' major'))+':</span>'+kc.map((q,i)=>'<button class="dv-b'+(q===c?' dv-tl dv-on':'')+'" data-sgc="'+E(q)+'">'+E(q)+' <small>'+rom[i]+'</small></button>').join('')+'</div>'+
     '<div class="dv-row" style="flex-wrap:wrap;gap:4px;margin-top:4px"><span class="dv-mut">Root:</span>'+NN.map(r=>'<button class="dv-b'+(c.replace(/(m7|maj7|sus4|dim|aug|m|7)$/,'')===r?' dv-tl dv-on':'')+'" data-sgr="'+r+'">'+r+'</button>').join('')+'</div>'+
     '<div class="dv-row" style="flex-wrap:wrap;gap:4px;margin-top:4px"><span class="dv-mut">Kind:</span>'+QS.map(q=>'<button class="dv-b" data-sgq="'+q+'">'+({'':'major',m:'minor','7':'7',m7:'m7',maj7:'maj7',sus4:'sus4',dim:'dim',aug:'aug'}[q])+'</button>').join('')+
     ' '+chip(cur.length>1?'join':'split',cur.length>1?'One chord this bar':'Two chords this bar')+'</div></div>'}
   h+='<div style="display:flex;margin-top:8px;border:1px solid #2a3040;border-radius:6px;overflow:hidden"><canvas id="sgkeys" style="flex:none;cursor:pointer"></canvas><div style="overflow-x:auto;flex:1"><canvas id="sgroll" style="display:block;touch-action:none;cursor:crosshair"></canvas></div></div>'+
    '<p class="dv-mut" style="font-size:12px;margin:4px 0">Tap the top row to change a bar\'s chord. Gold rows = notes of that bar\'s chord (they always sound right), lighter rows = the key\'s scale. Tap the keyboard to hear a note. The game plays one melody note at a time.</p>'+
    '<div class="dv-row" style="flex-wrap:wrap;gap:10px"><label class="dv-mut">This part\'s melody instrument<br><select data-sgp="lead">'+IO(p.lead,'(the song\'s)')+'</select></label><label class="dv-mut">Second voice<br><select data-sgp="harm">'+IO(p.harm,'(the song\'s)')+'</select></label><label class="dv-mut">Part name<br><input type="text" data-sgp="n" maxlength="6" value="'+E(p.n)+'" style="width:70px"></label></div>'+
    '<details'+(ST.text?' open':'')+' data-sgd="text" style="margin-top:8px"><summary class="dv-mut" style="cursor:pointer">Notes as text</summary><p class="dv-mut" style="font-size:12px">8th notes: <code>C5</code> a note, <code>-</code> hold, <code>.</code> rest, <code>E5/F5</code> two 16ths, <code>|</code> between bars. Chords: one per bar, <code>C,G</code> = half each.</p>'+
    '<label class="dv-mut">Chords<input type="text" data-sgp="c" value="'+E(p.c)+'" style="width:100%;font-family:monospace"></label><label class="dv-mut">Melody<textarea data-sgp="m" rows="3" style="width:100%;font-family:monospace">'+E(p.m)+'</textarea></label></details>'}
  return h+'</div></div></div>'}
 const newSong=()=>({n:'New song',bpm:100,m:8,key:'C',lead:'flute',pad:'strings',arp:'harp',arps:'harp8',bass:'pizz',bs:'pizz',perc:'timp',swing:0,vol:1.6,parts:[{n:'A',c:'C Am F G',m:'',lead:'',harm:''}],order:'A A'});
 const markDirty=()=>{ST.dirty=true;ST.ok=false};
 const fixMel=p=>{p.m=melText(parseMel(p.m,bars(p).length),bars(p).length)};
 document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.dataset&&d.dataset.sgd){ST[d.dataset.sgd]=d.open}},true);
 document.addEventListener('change',e=>{if(S.tab!=='songs')return;const t=e.target;if(!document.getElementById('dvs').contains(t))return;
  if(t.dataset.sgm!=null){const M2=map();if(t.value)M2[t.dataset.sgm]=t.value;else delete M2[t.dataset.sgm];ST.dirty=true;return}
  if(!ST.w)return;if(t.dataset.sgf){const f=t.dataset.sgf;snap();ST.w[f]=t.type==='checkbox'?(t.checked?1:0):t.type==='number'||t.type==='range'||f==='m'?+t.value:t.value;if(f==='m')for(const q of ST.w.parts)fixMel(q);markDirty();redraw()}
  else if(t.dataset.sgp){const p=part(),f=t.dataset.sgp;if(!p)return;snap();if(f==='n'){const v=t.value.replace(/[^A-Za-z0-9]/g,'').slice(0,6);if(v&&!ST.w.parts.some(q=>q!==p&&q.n===v)){ST.w.order=ST.w.order.split(/\s+/).map(x=>x===p.n?v:x).join(' ');p.n=v}}else p[f]=t.value;markDirty();redraw()}},true);
 document.addEventListener('input',e=>{if(S.tab!=='songs'||!ST.w)return;const t=e.target;if(t.dataset&&t.dataset.sgp&&(t.dataset.sgp==='c'||t.dataset.sgp==='m')){const p=part();if(p){p[t.dataset.sgp]=t.value;markDirty();drawRoll()}}
  else if(t.dataset&&t.dataset.sgf==='bpm'){ST.w.bpm=+t.value;const b=t.parentElement&&t.parentElement.querySelector('b');if(b)b.textContent=t.value;markDirty()}},true);
 async function save(){const c=check(fromEd(ST.w));ST.errs=c.errs;if(!c.def){toast('Fix the problems first.');redraw();return}const o={...c.def,vol:c.vol};sec()[ST.sel]=o;
  try{await dset('draft/songs/'+ST.sel,o);ST.dirty=false;toast('Saved to draft. Publish it from the Publish tab.')}catch(e){fail(e)}if(SQA.previewing)SQA.preview(S.draft);redraw()}
 function setChord(c){const p=part(),B=bars(p),pk=ST.pick;if(!pk||!B[pk.b])return;snap();const hs=B[pk.b].split(',');hs[pk.h]=c;B[pk.b]=hs.join(',');p.c=B.join(' ');markDirty();try{const C=M.chord(c);for(const v of C.iv)setTimeout(()=>ping(ST.lo+12+((C.r+v-ST.lo)%12+12)%12),0)}catch(e){}redraw()}
 document.addEventListener('click',e=>{if(S.tab!=='songs')return;const t=e.target.closest('[data-sgx],[data-sgs],[data-sgc],[data-sgr],[data-sgq]');if(!t||!document.getElementById('dvs').contains(t))return;e.preventDefault();
  if(t.dataset.sgc){setChord(t.dataset.sgc);return}
  if(t.dataset.sgr||t.dataset.sgq!=null){const p=part(),B=bars(p),pk=ST.pick;if(!pk)return;const c=(B[pk.b]||'C').split(',')[pk.h]||'C',root=c.replace(/(m7|maj7|sus4|dim|aug|m|7)$/,''),q=c.slice(root.length);setChord(t.dataset.sgr?t.dataset.sgr+q:root+t.dataset.sgq);return}
  if(t.dataset.sgs){if(ST.dirty&&!API.confirmLeave())return;stop();ST.sel=t.dataset.sgs;const d=sec()[ST.sel]||M.S[ST.sel]||ORIG[ST.sel];ST.w=toEd(d);if(sec()[ST.sel]&&sec()[ST.sel].vol)ST.w.vol=sec()[ST.sel].vol;ST.errs=[];ST.ok=false;ST.pi=0;ST.pick=null;ST.undo=[];ST.redo=[];ST.dirty=false;
   const ns=notesOf(ST.w.parts[0]);if(ns.length){const av=ns.reduce((a,n)=>a+n.m,0)/ns.length;ST.lo=Math.round(av-12)}else ST.lo=60;redraw();return}
  const[a,b]=t.dataset.sgx.split(':');const p=part();
  if(a==='new'){stop();let i=1,id;do id='su_song_'+(i++);while(sec()[id]);ST.sel=id;ST.w=newSong();ST.errs=[];ST.pi=0;ST.lo=60;ST.pick=null;ST.undo=[];ST.dirty=true;redraw();return}
  if(a==='map'){stop();ST.sel='__map';ST.w=null;redraw();return}
  if(a==='savemap'){(async()=>{try{await dset('draft/songmap',map());ST.dirty=false;toast('Saved to draft.')}catch(e2){fail(e2)}if(SQA.previewing)SQA.preview(S.draft)})();return}
  if(a==='play'){play(b);return}if(a==='stop'){stop();redraw();return}
  if(a==='save'){save();return}
  if(a==='pre'){snap();Object.assign(ST.w,PRE[b][1]);for(const q of ST.w.parts)fixMel(q);markDirty();redraw();if(ST.playing)play(ST.playing);return}
  if(a==='part'){ST.pi=+b;ST.pick=null;const ns=notesOf(part());if(ns.length){const av=ns.reduce((x,n)=>x+n.m,0)/ns.length;ST.lo=Math.round(av-12)}redraw();return}
  if(a==='padd'||a==='pdup'){snap();const used=new Set(ST.w.parts.map(q=>q.n));let n='A',c=65;while(used.has(n))n=String.fromCharCode(++c);ST.w.parts.push(a==='pdup'?{...clone(p),n}:{n,c:p?p.c:'C F G C',m:'',lead:'',harm:''});ST.w.order+=' '+n;ST.pi=ST.w.parts.length-1;markDirty();redraw();return}
  if(a==='pdel'){snap();const n=p.n;ST.w.parts.splice(ST.pi,1);ST.w.order=ST.w.order.split(/\s+/).filter(x=>x!==n).join(' ');ST.pi=0;markDirty();redraw();return}
  if(a==='ordx'){snap();const o=ST.w.order.split(/\s+/).filter(Boolean);o.splice(+b,1);ST.w.order=o.join(' ');markDirty();redraw();return}
  if(a==='orda'){snap();ST.w.order=(ST.w.order+' '+b).trim();markDirty();redraw();return}
  if(a==='tool'){ST.tool=b;redraw();return}if(a==='fine'){ST.fine=!ST.fine;redraw();return}
  if(a==='undo'){undo(false);return}if(a==='redo'){undo(true);return}
  if(a==='up'){ST.lo=Math.min(96-ROWS+1,ST.lo+6);redraw();return}if(a==='down'){ST.lo=Math.max(24,ST.lo-6);redraw();return}
  if(a==='tr'){snap();const d=+b,ns=notesOf(p);for(const n of ns)n.m=Math.max(24,Math.min(107,n.m+d));setNotes(p,ns);if(Math.abs(d)===12)ST.lo=Math.max(24,Math.min(96-ROWS+1,ST.lo+d));redraw();return}
  if(a==='bar+'){snap();const B=bars(p),ns=notesOf(p);B.push(B[B.length-1]||'C');p.c=B.join(' ');setNotes(p,ns);redraw();return}
  if(a==='bar-'){snap();const B=bars(p),ns=notesOf(p);B.pop();p.c=B.join(' ');setNotes(p,ns.filter(n=>n.s<B.length*m8()*2));if(ST.pick&&ST.pick.b>=B.length)ST.pick=null;redraw();return}
  if(a==='idea'){snap();setNotes(p,idea(p));redraw();toast('A new melody idea. Press ▶ Play part to hear it, change any note you like, or press 💡 again.');return}
  if(a==='clear'){snap();setNotes(p,[]);redraw();return}
  if(a==='pickx'){ST.pick=null;redraw();return}
  if(a==='split'||a==='join'){const B=bars(p),pk=ST.pick;if(!pk)return;snap();const hs=B[pk.b].split(',');B[pk.b]=a==='split'?hs[0]+','+hs[0]:hs[0];p.c=B.join(' ');ST.pick={b:pk.b,h:a==='split'?1:0};markDirty();redraw();return}
  if(a==='del')return arm('sgdel',async()=>{stop();const k=ST.sel;delete sec()[k];try{await dset('draft/songs/'+k,null);toast(ORIG[k]?'Back to the game\'s song in your draft.':'Deleted from your draft.')}catch(e2){fail(e2)}if(SQA.previewing)SQA.preview(S.draft);if(ORIG[k]){ST.w=toEd(ORIG[k])}else{ST.sel=null;ST.w=null}ST.dirty=false;redraw()})},true);
 document.addEventListener('keydown',e=>{if(S.tab!=='songs'||!ST.w||!S.open)return;const tg=e.target;if(tg&&/INPUT|TEXTAREA|SELECT/.test(tg.tagName))return;const k=e.key.toLowerCase(),m=e.ctrlKey||e.metaKey;
  if(m&&k==='z'){e.preventDefault();undo(e.shiftKey);return}if(m&&k==='y'){e.preventDefault();undo(true);return}if(m&&k==='s'){e.preventDefault();save();return}
  if(k===' '){e.preventDefault();if(ST.playing){stop();redraw()}else play('part');return}
  if((k==='delete'||k==='backspace')&&ST.sel1){const p=part();snap();setNotes(p,notesOf(p).filter(n=>n.s!==ST.sel1.s));ST.sel1=null;redraw()}},true);
 SQSUITE.addTab('songs','Songs',{render,after(){setTimeout(drawRoll,0)},dirty:()=>ST.dirty,leave(){stop();ST.dirty=false},changes(L,D){const out=[],a=L&&L.songs||{},b=D&&D.songs||{};
   for(const k of new Set([...Object.keys(a),...Object.keys(b)]))if(JSON.stringify(a[k])!==JSON.stringify(b[k]))out.push({kind:'ext',html:'🎵 Song '+E((b[k]||a[k]).n||k)+': '+(b[k]?(a[k]?'changed':ORIG[k]?'replaced':'new'):(ORIG[k]?'back to the game\'s song':'removed'))});
   const x=L&&L.songmap||{},y=D&&D.songmap||{};for(const r of new Set([...Object.keys(x),...Object.keys(y)]))if(x[r]!==y[r])out.push({kind:'ext',html:'🎵 Song on '+E((typeof WORLD_REGIONS!=='undefined'&&WORLD_REGIONS[r]||{}).name||r)+': '+(y[r]?E(songName(y[r])):'the game\'s')});return out}});
 window.SQCOMPOSER={parseMel,melText,place,idea,keyChords,scaleOf,state:ST,drawRoll}})();
