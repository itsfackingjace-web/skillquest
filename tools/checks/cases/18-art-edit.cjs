// Dev Suite > Art Room > Edit it: a submitted painting with a stray blank frame opens in the Art Room editor, the blank frame is
// deleted, Save changes writes the fixed piece back (the artist's first version kept as fo/fw/fh/fms) and the device's own drafts stay.
module.exports={name:'patron art can be edited before approving',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const F=window.SQFB,d=F.db,AR=window.SQARTROOM;
  localStorage.setItem('sq_art_draft',JSON.stringify({w:8,h:8,fr:[Array(64).fill(1)],name:'mine'}));
  const f=JSON.stringify({p:['#ff0000'],fr:['0'.repeat(64),'.'.repeat(64)]});
  const x={u:'artist1',id:'a1',n:'Sun',k:'item',w:8,h:8,f,ms:300,who:'Sis',t:Date.now()};await d.set(d.ref(F.D,'art/artist1/a1'),x);
  let saved=null;const ok=AR.edit(Object.assign({},x),s=>{saved=s});await W(50);
  const st=AR.state;const before=[st.fr.length,!!st.edit,ptab];
  st.cur=1;rPn();await W(30);document.querySelector('#pn [data-ar="fdel"]').click();await W(30);
  document.querySelector('#pn [data-ar="esave"]').click();await W(300);
  const v=(await d.get(d.ref(F.D,'art/artist1/a1'))).val();const fr=JSON.parse(v.f).fr;
  const draft=JSON.parse(localStorage.getItem('sq_art_draft')).name;
  return{ok,before,frames:fr.length,first:fr[0]===('0'.repeat(64)),fo:v.fo===f,fw:v.fw,ms:v.ms,saved:!!saved,draft,open:pnOpen&&ptab===47}});
 t(r.ok,'edit() opened the piece');t.eq(r.before,[2,true,47],'editor opened with both frames');
 t.eq([r.frames,r.first,r.fo,r.fw,r.ms,r.saved],[1,true,true,8,300,true],'blank frame removed and saved, original kept');
 t.eq(r.draft,'mine','own Art Room draft untouched');t(!r.open,'editor closed after saving')}};
