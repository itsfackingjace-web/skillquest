// Nov 22 (Jace: "for every pixel editor in the dev suite and the art room, there should be some kind of transparency slider or something
// for the colors. I want to be able to make ghosts"): an Opacity slider for the chosen colour in the Dev Suite's picture editors and the
// Art Room. A see-through colour is #rrggbbaa; it goes into the saved picture and the game draws it see-through.
module.exports={name:'see-through colours: Opacity slider in the Dev Suite and the Art Room, kept in saves and drawn see-through',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);const out={};
  const alphaAt=(c,x,y)=>c.getContext('2d').getImageData(x,y,1,1).data[3];
  // ---- Dev Suite: a sprite ----
  window.SQDEV=()=>true;SQSUITE.open();await W(700);const S=SQSUITE.state,q=s=>document.querySelector('#dvs '+s);
  q('[data-tab="sprites"]').click();await W(200);q('[data-k="ibar"]').click();for(let k=0;k<20&&!S.ed;k++)await W(100);if(!S.ed)return{err:'sprite did not open'};
  const ed=S.ed;ed.px.fill(255);const ad=q('[data-in="addcol"]');ad.value='#ffffff';ad.dispatchEvent(new Event('change',{bubbles:true}));await W(50);for(let i=0;i<4;i++)ed.px[i]=ed.col;
  const sl=q('[data-in="alpha"]');out.suiteSlider=!!sl&&sl.value==='100';
  sl.value='40';sl.dispatchEvent(new Event('input',{bubbles:true}));sl.dispatchEvent(new Event('change',{bubbles:true}));await W(50);
  const c=S.ed.pal[S.ed.col];out.suiteCol=c;out.swatch=/gradient/.test(q('.dv-sw.dv-on').style.background);out.hex=q('[data-hex="cur"]').value;
  // the colour input keeps the opacity
  const rc=q('[data-in="recol"]');out.recolVal=rc.value;rc.value='#80c0ff';rc.dispatchEvent(new Event('input',{bubbles:true}));rc.dispatchEvent(new Event('change',{bubbles:true}));await W(30);out.recol=S.ed.pal[S.ed.col];
  // a typed #rrggbbaa code works too
  const hx=q('[data-hex="cur"]');hx.value='#c0c0c0b3';hx.dispatchEvent(new Event('change',{bubbles:true}));await W(30);out.typed=S.ed.pal[S.ed.col];
  // what the game draws from it
  const sp={w:2,h:1,s:1,p:'#ffffff66,#202020',d:SQA.PXC[0]+SQA.PXC[1]};const rd=SQA.render(sp);out.render=[alphaAt(rd,0,0),alphaAt(rd,1,0)];
  out.dye=SQA.dyeMap(['#c0c0c080'],'#ff0000')['#c0c0c080']||null;
  SQSUITE.close();await W(100);
  // ---- Art Room ----
  SQPATRON.active=()=>true;SQPATRON.rec=()=>({u:Date.now()+864e5});const AR=SQARTROOM;localStorage.removeItem('sq_art_proj');AR.open();await W(300);const A=AR.state,qa=s=>document.querySelector('#pn '+s);
  if(!pnOpen||ptab!==47)return Object.assign(out,{err:'the Art Room did not open'});
  qa('[data-ar="col:9"]').click();await W(50);const al=qa('#aral');out.artSlider=!!al&&al.value==='100';
  al.value='50';al.dispatchEvent(new Event('input',{bubbles:true}));await W(50);out.artCol=A.pal[9];out.artSw=/gradient/.test(qa('[data-ar="col:9"]').style.background);out.artPct=(qa('#aralv')||{}).textContent;
  A.fr[A.cur][0]=9;const pk=JSON.parse(AR.pack());out.packed=pk.p;
  const t2=document.createElement('canvas');t2.width=A.w;t2.height=A.h;const fr=AR.unpack({f:AR.pack()})[0];const x=t2.getContext('2d');x.fillStyle=fr.pal[fr.f[0]];x.fillRect(0,0,1,1);out.artA=alphaAt(t2,0,0);
  // the clear slot has no slider
  qa('[data-ar="col:0"]').click();await W(50);out.clearNoSlider=!qa('#aral');closePanel();return out});
 if(r.err)return t(false,r.err);
 t.eq(r.suiteSlider,true,'the Dev Suite editor has an Opacity slider at 100% for a solid colour');
 t.eq([r.suiteCol,r.swatch,r.hex],['#ffffff66',true,'#ffffff66'],'40% makes the colour #ffffff66 [colour, swatch shows it see-through, hex box]');
 t.eq([r.recolVal,r.recol],['#ffffff','#80c0ff66'],'changing the colour keeps its opacity [colour picker shows #rrggbb, new colour]');
 t.eq(r.typed,'#c0c0c0b3','a typed #rrggbbaa code sets a see-through colour');
 t.eq(r.render,[102,255],'the game draws a see-through colour see-through [#ffffff66, solid]');
 t(/^#[0-9a-f]{6}80$/.test(r.dye||''),'a dyed see-through colour stays see-through: '+r.dye);
 t.eq([r.artSlider,r.artCol,r.artSw,r.artPct],[true,'#ff004d80',true,'50%'],'the Art Room slider [shown at 100%, 50% = #ff004d80, swatch, label]');
 t(Array.isArray(r.packed)&&r.packed.includes('#ff004d80'),'the sent picture keeps the see-through colour: '+JSON.stringify(r.packed));
 t(Math.abs(r.artA-128)<=1,'and it draws half see-through: alpha '+r.artA);t.eq(r.clearNoSlider,true,'no slider for the clear slot')}};
