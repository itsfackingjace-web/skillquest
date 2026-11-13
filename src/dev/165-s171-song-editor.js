// ---- 171. Song editor (Dev Suite > Songs) ----
// Library songs.<key> = a song in 155's format {n, bpm, m (8ths per bar: 8 or 6), lead, harm, pad, arp, arps, bass, bs, perc,
// swing, vol, parts:{name:[chords, melody, {lead,harm}?]}, order}. A built-in key (day, night, briar, ...) replaces that song;
// su_<id> is a new song. songmap.<region> = song key: which song plays on that island (155's REGION_SONG; built-in islands
// and custom ones). Checked here before use (instruments must be in INST, every part must build); the originals come back
// when an entry is removed. The editor plays songs through SQMUSIC.force (155's scheduler, same instruments and mix).
// Melodies written here must be original.
(()=>{const M=window.SQMUSIC;if(!M||!window.SQA)return;
 const ORIG={},OVOL={},OMAP={...M.REGION_SONG};for(const k in M.S){ORIG[k]=M.S[k];OVOL[k]=M.VOL[k]}
 const ARPS=['harp8','strum','stab','ost8','sparkle'],BS=['held','pedal','pizz','drive','walk','root5','waltz','shanty'],PERC=['none','timp','march','timp8','taiko','tamb','boss'];
 const num=(v,lo,hi,d)=>{v=+v;return isFinite(v)?Math.max(lo,Math.min(hi,v)):d};const str=(v,n)=>String(v==null?'':v).slice(0,n);
 const inst=(v,opt)=>typeof v==='string'&&M.INST[v]?v:opt?null:'flute';
 const CH=/^[A-G](#|b)?(m|7|m7|maj7|sus4|dim|aug)?$/,NOTE=/^[A-G](#|b)?[1-7]$/;
 // checks a song; returns {def, errs}
 function check(o){const errs=[];if(!o||typeof o!=='object')return{def:null,errs:['Not a song.']};
  const m=+o.m===6?6:8,def={n:str(o.n,40)||'Untitled',bpm:num(o.bpm,40,220,100)|0,m,lead:inst(o.lead),harm:inst(o.harm,1),pad:inst(o.pad,1),arp:inst(o.arp,1),arps:ARPS.includes(o.arps)?o.arps:'harp8',
   bass:inst(o.bass)||'pizz',bs:BS.includes(o.bs)?o.bs:'pizz',perc:PERC.includes(o.perc)?o.perc:'none',swing:o.swing?1:0,parts:{},order:''};
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
 // ======================= Dev Suite > Songs =======================
 if(!window.SQSUITE||!SQSUITE.addTab)return;const API=SQSUITE.api,{S,E,dset,toast,fail,arm}=API;
 const ST={sel:null,w:null,errs:[],part:null,playing:false,dirty:false};
 const sec=()=>S.draft.songs||(S.draft.songs={}),map=()=>S.draft.songmap||(S.draft.songmap={});
 const clone=o=>JSON.parse(JSON.stringify(o));
 const toEd=d=>{const o=clone(d);o.parts=Object.entries(o.parts||{}).map(([n,a])=>({n,c:a[0],m:a[1],lead:(a[2]||{}).lead||'',harm:(a[2]||{}).harm||''}));o.vol=o.vol||M.VOL[ST.sel]||1.6;return o};
 const fromEd=w=>{const o={...w,parts:{}};for(const p of w.parts){const x={};if(p.lead)x.lead=p.lead;if(p.harm)x.harm=p.harm;o.parts[p.n]=Object.keys(x).length?[p.c,p.m,x]:[p.c,p.m]}for(const k of['harm','pad','arp'])if(!o[k])delete o[k];return o};
 const IO=(v,none)=>(none?'<option value="">'+none+'</option>':'')+Object.keys(M.INST).filter(k=>k!=='timpani'&&k!=='taiko').map(k=>'<option'+(k===v?' selected':'')+'>'+k+'</option>').join('');
 const SO=(L,v)=>L.map(k=>'<option'+(k===v?' selected':'')+'>'+k+'</option>').join('');
 const songName=k=>(sec()[k]&&sec()[k].n)||(M.S[k]&&M.S[k].n)||k;
 function stop(){if(ST.playing){M.force=null;ST.playing=false;delete M.S.__ed;delete M.SONGS.__ed}}
 async function play(){const c=check(fromEd(ST.w));ST.errs=c.errs;if(!c.def){API.draw();return}M.S.__ed=c.def;M.SONGS.__ed=M.build(c.def);M.VOL.__ed=c.vol;
  try{if(typeof ACX!=='undefined'&&ACX&&ACX.state!=='running')await ACX.resume()}catch(e){}if(typeof MUSIC!=='undefined'&&!MUSIC)toast('Music is off in Options: turn it on to hear it.');
  try{await M.loadSong('__ed')}catch(e){toast('Could not load the instruments.')}M.force='__ed';ST.playing=true;API.draw()}
 function roll(){const c=document.getElementById('dvsroll');if(!c||!ST.w)return;const p=ST.w.parts.find(q=>q.n===ST.part)||ST.w.parts[0];if(!p)return;let def;
  const m=+ST.w.m===6?6:8;try{def={...fromEd(ST.w),m,order:p.n,lead:ST.w.lead||'flute',bass:ST.w.bass||'pizz'};def.parts={[p.n]:[p.c,p.m]};var B=M.build(def)}catch(e){return}
  const L=B.ev.lead,H=B.ev.bass;if(!L.length)return;let lo=127,hi=0;for(const n of L){lo=Math.min(lo,n.m);hi=Math.max(hi,n.m)}lo-=2;hi+=2;const W=Math.max(300,B.len*6),Hh=(hi-lo+1)*5;c.width=W;c.height=Hh+16;
  const x=c.getContext('2d');x.fillStyle='#141820';x.fillRect(0,0,W,Hh+16);for(let s=0;s<B.len;s+=B.bar){x.fillStyle='#2a3040';x.fillRect(s*6,0,1,Hh)}
  for(let mm=lo;mm<=hi;mm++)if([1,3,6,8,10].includes(mm%12)){x.fillStyle='#181c26';x.fillRect(0,(hi-mm)*5,W,5)}
  for(const n of L){x.fillStyle='#f0c848';x.fillRect(n.s*6+1,(hi-n.m)*5,Math.max(3,n.d*6-2),4)}
  for(const n of H){x.fillStyle='#4878c8';x.fillRect(n.s*6+1,Hh+4+((n.m%12)/12)*10,Math.max(2,n.d*6-2),2)}
  if(ST.playing&&M.cur==='__ed'){const st=M.step%Math.max(1,M.len);x.fillStyle='rgba(255,255,255,.6)';x.fillRect((st%B.len)*6,0,2,Hh+16)}}
 setInterval(()=>{if(S.open&&S.tab==='songs'&&ST.playing)roll()},120);
 function render(){const L=sec(),keys=[...Object.keys(ORIG),...Object.keys(L).filter(k=>!ORIG[k]).sort()];
  let h='<div class="dv-spr'+(ST.sel?' dv-has':'')+'"><div class="dv-ls"><button class="dv-b dv-pri" data-sgx="new">+ New song</button><button class="dv-b" data-sgx="map" style="margin-top:4px">Island songs…</button><div class="dv-grid" style="grid-template-columns:1fr">';
  for(const k of keys){const d=L[k],live=S.live&&S.live.songs&&S.live.songs[k],st=d?(JSON.stringify(d)===JSON.stringify(live)?'live':'draft'):'';
   h+='<button class="dv-it'+(ST.sel===k?' dv-on':'')+'" data-sgs="'+E(k)+'" style="flex-direction:row;justify-content:flex-start;padding:7px 10px">'+(st?'<i class="dv-bd dv-'+st+'">'+st.toUpperCase()+'</i>':'')+'<span style="font-size:13px;text-align:left">🎵 '+E(songName(k))+' <small class="dv-mut">'+E(k)+'</small></span></button>'}
  h+='</div></div><div class="dv-ed">';
  if(ST.sel==='__map'){const M2=map(),R=typeof WORLD_REGIONS!=='undefined'?Object.values(WORLD_REGIONS):[],all=Object.keys(M.S).filter(k=>k!=='__ed');
   h+='<div class="dv-card"><b>Island songs</b><p class="dv-mut">The song that plays outdoors on each island (bosses and sailing still have their own).</p><table>'+R.filter(r=>r.id!=='hollow').map(r=>'<tr><td style="padding:3px 10px 3px 0">'+E(r.name||r.id)+'</td><td><select data-sgm="'+E(r.id)+'"><option value="">'+(OMAP[r.id]?'(the game\'s: '+E(songName(OMAP[r.id]))+')':'(Hollow\'s day song)')+'</option>'+all.map(k=>'<option value="'+E(k)+'"'+(M2[r.id]===k?' selected':'')+'>'+E(songName(k))+'</option>').join('')+'</select></td></tr>').join('')+'</table>'+
    '<div class="dv-row" style="margin-top:8px"><button class="dv-b dv-pri" data-sgx="savemap">Save to draft</button></div></div>';return h+'</div></div>'}
  if(!ST.sel||!ST.w){h+='<div class="dv-card"><b>Songs</b><p class="dv-mut">Write and change the game\'s music. A song is a few parts (chords + a melody) played in an order; the band (bass, harp or guitar figures, held strings, drums) follows the chords in the style you pick. Melodies are 8th notes: <code>C5</code> a note, <code>-</code> hold, <code>.</code> rest, <code>E5/F5</code> two 16ths, <code>|</code> between bars. Write your own tunes only.</p></div>';return h+'</div></div>'}
  const w=ST.w,ro=!!ORIG[ST.sel];
  h+='<div class="dv-card"><div class="dv-row" style="flex-wrap:wrap"><b style="font-size:16px">🎵 '+E(w.n)+'</b><span class="dv-mut">'+E(ST.sel)+(ro?' · replaces the game\'s song':'')+'</span></div>'+
   '<div class="dv-row" style="flex-wrap:wrap;margin-top:6px"><button class="dv-b dv-pri" data-sgx="'+(ST.playing?'stop':'play')+'">'+(ST.playing?'■ Stop':'▶ Play')+'</button><button class="dv-b" data-sgx="check">Check</button><button class="dv-b" data-sgx="save">Save to draft</button>'+
   (sec()[ST.sel]?'<button class="dv-b '+(S.arm==='sgdel'?'dv-arm':'dv-bad')+'" data-sgx="del">'+(S.arm==='sgdel'?'Tap again':(ro?'Back to the game\'s song':'Delete song'))+'</button>':'')+'</div>'+
   (ST.errs.length?'<div style="background:#3a1a1a;border:1px solid #a04040;padding:6px 8px;margin:8px 0;font-size:13px">'+ST.errs.slice(0,12).map(E).join('<br>')+'</div>':ST.ok?'<p style="color:#7c6">✓ Looks good.</p>':'')+
   '<div class="dv-row" style="flex-wrap:wrap"><label class="dv-mut">Name<br><input type="text" data-sgf="n" maxlength="40" value="'+E(w.n)+'"></label><label class="dv-mut">Speed (BPM)<br><input type="number" data-sgf="bpm" min="40" max="220" value="'+w.bpm+'" style="width:70px"></label>'+
   '<label class="dv-mut">Time<br><select data-sgf="m"><option value="8"'+(+w.m!==6?' selected':'')+'>4/4</option><option value="6"'+(+w.m===6?' selected':'')+'>3/4 or 6/8</option></select></label><label class="dv-mut">Swing<br><input type="checkbox" data-sgf="swing"'+(w.swing?' checked':'')+'></label>'+
   '<label class="dv-mut">Loudness<br><input type="number" data-sgf="vol" min="0.3" max="4" step="0.05" value="'+w.vol+'" style="width:70px"></label></div>'+
   '<div class="dv-row" style="flex-wrap:wrap"><label class="dv-mut">Melody<br><select data-sgf="lead">'+IO(w.lead)+'</select></label><label class="dv-mut">Second voice<br><select data-sgf="harm">'+IO(w.harm,'(none)')+'</select></label><label class="dv-mut">Held chord<br><select data-sgf="pad">'+IO(w.pad,'(none)')+'</select></label>'+
   '<label class="dv-mut">Figures<br><select data-sgf="arp">'+IO(w.arp,'(none)')+'</select></label><label class="dv-mut">Figure style<br><select data-sgf="arps">'+SO(ARPS,w.arps)+'</select></label>'+
   '<label class="dv-mut">Bass<br><select data-sgf="bass">'+IO(w.bass)+'</select></label><label class="dv-mut">Bass style<br><select data-sgf="bs">'+SO(BS,w.bs)+'</select></label><label class="dv-mut">Drums<br><select data-sgf="perc">'+SO(PERC,w.perc)+'</select></label></div>'+
   '<p><label class="dv-mut">Order <small>(parts to play, then it loops)</small><input type="text" data-sgf="order" value="'+E(w.order)+'" style="width:100%"></label></p>';
  w.parts.forEach((p,i)=>{h+='<div style="border:1px solid #2a3040;border-radius:6px;padding:8px;margin:6px 0'+(ST.part===p.n?';border-color:#e8b030':'')+'"><div class="dv-row" style="flex-wrap:wrap"><label class="dv-mut">Part<br><input type="text" data-sgp="'+i+'.n" maxlength="6" value="'+E(p.n)+'" style="width:60px"></label>'+
    '<label class="dv-mut">Melody instrument<br><select data-sgp="'+i+'.lead">'+IO(p.lead,'(song\'s)')+'</select></label><label class="dv-mut">Second voice<br><select data-sgp="'+i+'.harm">'+IO(p.harm,'(song\'s)')+'</select></label>'+
    '<button class="dv-b" data-sgx="see:'+i+'" style="align-self:flex-end">Show notes</button><button class="dv-b" data-sgx="pdel:'+i+'" style="align-self:flex-end">Remove</button></div>'+
    '<label class="dv-mut">Chords <small>(one per bar, "C,G" = half each)</small><input type="text" data-sgp="'+i+'.c" value="'+E(p.c)+'" style="width:100%;font-family:monospace"></label>'+
    '<label class="dv-mut">Melody<textarea data-sgp="'+i+'.m" rows="3" style="width:100%;font-family:monospace">'+E(p.m)+'</textarea></label></div>'});
  h+='<button class="dv-b" data-sgx="padd">+ Add a part</button><div style="overflow-x:auto;margin-top:8px"><canvas id="dvsroll" height="60" style="image-rendering:pixelated"></canvas></div><p class="dv-mut" style="font-size:12px">Yellow = melody, blue = bass (from the chords). The line shows where it is while playing.</p></div>';
  return h+'</div></div>'}
 const newSong=()=>({n:'New song',bpm:100,m:8,lead:'flute',pad:'strings',arp:'harp',arps:'harp8',bass:'pizz',bs:'pizz',perc:'timp',swing:0,vol:1.6,parts:[{n:'A',c:'C F G C',m:'. . . . . . . . | . . . . . . . . | . . . . . . . . | . . . . . . . .',lead:'',harm:''}],order:'A'});
 const markDirty=()=>{ST.dirty=true;ST.ok=false};
 document.addEventListener('change',e=>{if(S.tab!=='songs')return;const t=e.target;if(!document.getElementById('dvs').contains(t))return;
  if(t.dataset.sgm!=null){const M2=map();if(t.value)M2[t.dataset.sgm]=t.value;else delete M2[t.dataset.sgm];ST.dirty=true;return}
  if(!ST.w)return;if(t.dataset.sgf){const f=t.dataset.sgf;ST.w[f]=t.type==='checkbox'?(t.checked?1:0):t.type==='number'||f==='m'?+t.value:t.value;markDirty();if(t.tagName==='SELECT'||t.type==='checkbox')API.draw()}
  else if(t.dataset.sgp){const[i,f]=t.dataset.sgp.split('.');const p=ST.w.parts[+i];if(p){p[f]=t.value;markDirty();if(f==='n')ST.part=t.value;setTimeout(roll,0)}}},true);
 document.addEventListener('input',e=>{if(S.tab!=='songs'||!ST.w)return;const t=e.target;if(t.dataset&&t.dataset.sgp){const[i,f]=t.dataset.sgp.split('.');const p=ST.w.parts[+i];if(p&&(f==='c'||f==='m')){p[f]=t.value;markDirty();ST.part=p.n;roll()}}
  else if(t.dataset&&t.dataset.sgf&&t.type!=='checkbox'&&t.tagName!=='SELECT'){const f=t.dataset.sgf;ST.w[f]=t.type==='number'?+t.value:t.value;markDirty()}},true);
 async function save(){const c=check(fromEd(ST.w));ST.errs=c.errs;if(!c.def){toast('Fix the problems first.');API.draw();return}const o={...c.def,vol:c.vol};sec()[ST.sel]=o;
  try{await dset('draft/songs/'+ST.sel,o);ST.dirty=false;toast('Saved to draft. Publish it from the Publish tab.')}catch(e){fail(e)}if(SQA.previewing)SQA.preview(S.draft);API.draw()}
 document.addEventListener('click',e=>{if(S.tab!=='songs')return;const t=e.target.closest('[data-sgx],[data-sgs]');if(!t||!document.getElementById('dvs').contains(t))return;e.preventDefault();
  if(t.dataset.sgs){if(ST.dirty&&!API.confirmLeave())return;stop();ST.sel=t.dataset.sgs;const d=sec()[ST.sel]||M.S[ST.sel]||ORIG[ST.sel];ST.w=toEd(d);if(sec()[ST.sel]&&sec()[ST.sel].vol)ST.w.vol=sec()[ST.sel].vol;ST.errs=[];ST.ok=false;ST.part=ST.w.parts[0]&&ST.w.parts[0].n;ST.dirty=false;API.draw();setTimeout(roll,0);return}
  const[a,b]=t.dataset.sgx.split(':');
  if(a==='new'){stop();let i=1,id;do id='su_song_'+(i++);while(sec()[id]);ST.sel=id;ST.w=newSong();ST.errs=[];ST.part='A';ST.dirty=true;API.draw();setTimeout(roll,0);return}
  if(a==='map'){stop();ST.sel='__map';ST.w=null;API.draw();return}
  if(a==='savemap'){(async()=>{try{await dset('draft/songmap',map());ST.dirty=false;toast('Saved to draft.')}catch(e2){fail(e2)}if(SQA.previewing)SQA.preview(S.draft)})();return}
  if(a==='play'){play();return}if(a==='stop'){stop();API.draw();return}
  if(a==='check'){const c=check(fromEd(ST.w));ST.errs=c.errs;ST.ok=!c.errs.length;API.draw();setTimeout(roll,0);return}
  if(a==='save'){save();return}
  if(a==='see'){ST.part=ST.w.parts[+b].n;API.draw();setTimeout(roll,0);return}
  if(a==='padd'){const used=new Set(ST.w.parts.map(p=>p.n));let n='B',c=66;while(used.has(n))n=String.fromCharCode(++c);const L=ST.w.parts[ST.w.parts.length-1];ST.w.parts.push({n,c:L?L.c:'C F G C',m:L?L.m:'',lead:'',harm:''});markDirty();API.draw();return}
  if(a==='pdel'){ST.w.parts.splice(+b,1);markDirty();API.draw();return}
  if(a==='del')return arm('sgdel',async()=>{stop();const k=ST.sel;delete sec()[k];try{await dset('draft/songs/'+k,null);toast(ORIG[k]?'Back to the game\'s song in your draft.':'Deleted from your draft.')}catch(e2){fail(e2)}if(SQA.previewing)SQA.preview(S.draft);if(ORIG[k]){ST.w=toEd(ORIG[k])}else{ST.sel=null;ST.w=null}ST.dirty=false;API.draw()})},true);
 SQSUITE.addTab('songs','Songs',{render,after(){setTimeout(roll,0)},dirty:()=>ST.dirty,leave(){stop();ST.dirty=false},changes(L,D){const out=[],a=L&&L.songs||{},b=D&&D.songs||{};
   for(const k of new Set([...Object.keys(a),...Object.keys(b)]))if(JSON.stringify(a[k])!==JSON.stringify(b[k]))out.push({kind:'ext',html:'🎵 Song '+E((b[k]||a[k]).n||k)+': '+(b[k]?(a[k]?'changed':ORIG[k]?'replaced':'new'):(ORIG[k]?'back to the game\'s song':'removed'))});
   const x=L&&L.songmap||{},y=D&&D.songmap||{};for(const r of new Set([...Object.keys(x),...Object.keys(y)]))if(x[r]!==y[r])out.push({kind:'ext',html:'🎵 Song on '+E((typeof WORLD_REGIONS!=='undefined'&&WORLD_REGIONS[r]||{}).name||r)+': '+(y[r]?E(songName(y[r])):'the game\'s')});return out}})})();
