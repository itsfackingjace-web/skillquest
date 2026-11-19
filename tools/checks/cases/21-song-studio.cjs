// The Song Studio: tapping the grid places notes, ideas and chords work, every mood builds a valid song in 155's format, a sent song
// opens again, and the developer's "Put it in the Songs editor" makes a draft song.
module.exports={name:'Song Studio makes valid songs',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));window.SQDEV=()=>true;const SS=window.SQSTUDIO;SS.open(true);await W(50);
  const open=pnOpen&&ptab===SS.TAB&&!!document.querySelector('#pn .ssg');
  const cell=document.querySelector('#pn .ssg [data-sc^="0,"]');cell.click();await W(20);const placed=SS.state.secs[0].n.length;
  document.querySelector('#pn .ssg .nt').click();await W(20);const removed=SS.state.secs[0].n.length;
  SS.act('tune');SS.act('sec','1');SS.act('tune');SS.act('chords');const errs=[];
  for(const m of Object.keys(SS.MOODS)){SS.act('mood',m);SS.act('sec','0');SS.act('tune');const c=SQSONGS.check(SS.toDef());if(!c.def||c.errs.length)errs.push(m+': '+c.errs.join('; '))}
  for(const k of SS.KEYS){SS.state.key='C';document.getElementById('sskey').value=k;document.getElementById('sskey').dispatchEvent(new Event('change',{bubbles:true}));await W(5);const c=SQSONGS.check(SS.toDef());if(c.errs.length)errs.push(k+': '+c.errs.join('; '))}
  const d=SS.toDef(),notes=SS.state.secs.map(s=>s.n.length).join();SS.fromDef({n:'Copy',s:JSON.stringify(d)});const back=SS.state.secs.map(s=>s.n.length).join();
  SS.act('psec');for(let i=0;i<40&&SQMUSIC.force!=='__st';i++)await W(100);const forced=SQMUSIC.force;SS.act('stop');
  SQSUITE.open();await W(800);SQSUITE.close();const key=await SQPSONGS.toDraft(Object.assign(d,{n:'Sunny Meadow'}));const inDraft=!!SQSUITE.state.draft.songs[key];
  return{open,placed,removed,errs,notes,back,forced,key,inDraft}});
 t(r.open,'studio opened');t.eq([r.placed,r.removed],[1,0],'tap adds, tap on a note removes');t.eq(r.errs,[],'every mood and key builds');
 t.eq(r.back,r.notes,'a sent song opens again with the same notes');t.eq(r.forced,'__st','plays through SQMUSIC');t.eq([r.key,r.inDraft],['su_sunnymeadow',true],'saved into the draft')}};
