// Nov 22 (a Patron's list for the Art Room): the zoomed view stays put when a button is pressed (it jumped to the top left); the mouse wheel
// zooms around the pointer; Select (box or free) grabs pixels, drags them somewhere else, crops and deletes; canvases go up to 96 x 96
// (with fewer frames, so a piece still fits the database); drafts keep several drawings going on one device.
module.exports={name:'Art Room: zoom stays put, wheel zoom, select/move/crop, big canvases, drafts',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);
  SQPATRON.active=()=>true;SQPATRON.rec=()=>({u:Date.now()+864e5});const AR=SQARTROOM;localStorage.removeItem('sq_art_proj');AR.open();await W(200);const A=()=>AR.state,q=s=>document.querySelector('#pn '+s);
  const out={};if(!pnOpen||ptab!==47)return{err:'the Art Room did not open'};
  // a 32 x 32 canvas, zoomed in, scrolled to the middle: pressing the grid button keeps the view
  const sz=q('#arsz');sz.value='32';sz.dispatchEvent(new Event('change',{bubbles:true}));await W(50);
  q('[data-ar="zin"]').click();await W(30);q('[data-ar="zin"]').click();await W(30);let box=q('#arbox');box.scrollLeft=120;box.scrollTop=90;const s0=[box.scrollLeft,box.scrollTop];
  q('[data-ar="grid"]').click();await W(30);box=q('#arbox');out.keep=[box.scrollLeft===s0[0],box.scrollTop===s0[1],s0[0]>0];
  // the wheel (one notch) zooms in around the pointer: the pixel under it stays under it
  let cv=q('#arcv'),cr=cv.getBoundingClientRect(),br=box.getBoundingClientRect();const mx=br.left+br.width*.3,my=br.top+br.height*.4;
  const pxAt=()=>{const c=q('#arcv').getBoundingClientRect();return[(mx-c.left)/c.width*A().w,(my-c.top)/c.height*A().h]};const before=pxAt(),z0=A().zoom;
  box.dispatchEvent(new WheelEvent('wheel',{deltaY:-100,deltaMode:0,clientX:mx,clientY:my,bubbles:true,cancelable:true}));await W(50);const after=pxAt();
  out.wheel=[A().zoom===z0+1,Math.abs(after[0]-before[0])<.6,Math.abs(after[1]-before[1])<.6];
  // a smooth trackpad scroll doesn't zoom
  const z1=A().zoom;box=q('#arbox');box.dispatchEvent(new WheelEvent('wheel',{deltaY:12.5,deltaMode:0,clientX:mx,clientY:my,bubbles:true,cancelable:true}));await W(90);out.trackpad=A().zoom===z1;
  // select a box around a red 4 x 4 square, drag it 6 pixels right and 2 down
  q('[data-ar="zout"]').click();q('[data-ar="zout"]').click();q('[data-ar="zout"]').click();await W(30);
  const st=A(),f=st.fr[st.cur];f.fill(0);for(let y=4;y<8;y++)for(let x=4;x<8;x++)f[y*32+x]=9;rPn();await W(30);
  q('[data-ar="tool:sel"]').click();await W(30);
  const pt=(x,y)=>{const c=q('#arcv').getBoundingClientRect();return{clientX:c.left+(x+.5)*c.width/32,clientY:c.top+(y+.5)*c.height/32}};
  const ev=(type,o)=>q('#arcv').dispatchEvent(new PointerEvent(type,Object.assign({bubbles:true,cancelable:true,pointerId:5,button:0},o)));
  ev('pointerdown',pt(3,3));ev('pointermove',pt(8,8));ev('pointerup',pt(8,8));await W(30);
  out.sel=!!(A().sel&&A().sel.m[5*32+5]&&!A().sel.m[2*32+2]);
  ev('pointerdown',pt(5,5));ev('pointermove',pt(11,7));ev('pointerup',pt(11,7));await W(30);
  const g=A().fr[A().cur];out.moved=[g[4*32+4],g[6*32+10],g[9*32+14],g[9*32+13]];// old spot clear, new spot red, just outside it clear, its far corner red
  // Delete clears the selection; undo brings it back
  q('[data-ar="sdel"]').click();await W(20);out.del=A().fr[A().cur].some(v=>v);q('[data-ar="undo"]').click();await W(20);out.undo=A().fr[A().cur][8*32+12];
  // free selection: a triangle-ish loop around the square, then Crop: the canvas becomes the square's box
  q('[data-ar="tool:sel"]').click();await W(20);q('[data-ar="selm:free"]').click();await W(20);
  ev('pointerdown',pt(9,5));for(const[x,y]of[[15,5],[15,11],[9,11],[9,6]])ev('pointermove',pt(x,y));ev('pointerup',pt(9,6));await W(30);
  q('[data-ar="scrop"]').click();await W(30);out.crop=[A().w,A().h,A().fr[0].filter(v=>v===9).length];
  // big canvases: 96 x 96 takes up to 6 frames; a 7th can't be added
  q('[data-ar="tool:pen"]').click();const s2=q('#arsz');s2.value='96';s2.dispatchEvent(new Event('change',{bubbles:true}));await W(30);
  for(let i=0;i<8;i++){const b=q('[data-ar="fadd"]');if(b&&!b.disabled)b.click();await W(10)}out.big=[A().w,A().fr.length];
  // drafts: save this drawing, start a new one, draw, open the first again
  A().name='Big one';q('[data-ar="drafts"]').click();await W(20);q('[data-ar="psave"]').click();await W(20);const id1=A().pid;q('[data-ar="pnew"]').click();await W(20);
  A().fr[0][0]=3;A().name='Small one';q('[data-ar="drafts"]').click();await W(20);
  const L0=JSON.parse(localStorage.getItem('sq_art_proj')||'[]');q('[data-ar="popen:'+id1+'"]').click();await W(30);
  const L1=JSON.parse(localStorage.getItem('sq_art_proj')||'[]');
  out.drafts=[!!id1,L0.length,A().w,A().fr.length,A().pid===id1,L1.length,L1.some(d=>d.nm==='Small one')];
  closePanel();return out});
 if(r.err){t(false,r.err);return}
 t.eq(r.keep,[true,true,true],'zoomed view after pressing the grid button [left kept, top kept, was scrolled]');
 t.eq(r.wheel,[true,true,true],'mouse wheel zoom [zoomed in, same pixel under the pointer x, y]');
 t(r.trackpad,'a smooth trackpad scroll zoomed');
 t(r.sel,'box selection');t.eq(r.moved,[0,9,0,9],'moved square [old spot, new spot, outside, corner]');
 t.eq([r.del,r.undo],[false,9],'Delete clears the selection, Undo brings it back');
 t.eq(r.crop,[7,7,16],'Crop to a free selection (7 x 7 around the square) [width, height, red pixels]');
 t.eq(r.big,[96,6],'96 x 96 canvas [width, frames allowed]');
 t.eq(r.drafts,[true,1,96,6,true,2,true],'drafts [saved, drafts before opening, opened width, frames, linked to it, drafts after, the new drawing filed away]')}};
