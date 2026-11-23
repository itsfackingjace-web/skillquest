// Nov 22 (Jace: "we added some features to the art room that I should also have in the dev suite"): every Dev Suite picture editor gets
// Select (box or free; drag to move, arrows nudge, Delete, Crop / Keep only this, Copy copies just the selection), the mouse wheel zooms
// around the pointer (a trackpad's smooth scroll doesn't), sprites zoom too, and Move is there in every editor.
module.exports={name:'Dev Suite: select, move, crop and wheel zoom in the picture editors',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));window.SQDEV=()=>true;SQSUITE.open();await W(700);const S=SQSUITE.state,q=s=>document.querySelector('#dvs '+s);
  q('[data-tab="sprites"]').click();await W(200);q('[data-k="ibar"]').click();for(let k=0;k<20&&!S.ed;k++)await W(100);if(!S.ed)return{err:'sprite did not open'};
  const out={},ed=()=>S.ed;const W0=S.ed.w,H0=S.ed.h;if(W0<12||H0<12)return{err:'the iron bar sprite is '+W0+' x '+H0};
  // a clean 16 x 16 picture with a 3 x 3 block at 2,2
  ed().undo=[];ed().px.fill(255);ed().pal.push('#e03030');const red=ed().pal.length-1;for(let y=2;y<5;y++)for(let x=2;x<5;x++)ed().px[y*ed().w+x]=red;
  const cv=()=>document.getElementById('dvc');const pt=(x,y)=>{const c=cv().getBoundingClientRect();return{clientX:c.left+(x+.5)*c.width/ed().w,clientY:c.top+(y+.5)*c.height/ed().h}};
  const ev=(type,o)=>cv().dispatchEvent(new PointerEvent(type,Object.assign({bubbles:true,cancelable:true,pointerId:3,button:0,buttons:type==='pointerup'?0:1},o)));
  out.tools=['sel','pan'].map(k=>!!q('[data-tool="'+k+'"]'));out.zoomBtns=!!q('[data-a="zin"]');
  q('[data-tool="sel"]').click();await W(30);ev('pointerdown',pt(1,1));ev('pointermove',pt(5,5));ev('pointerup',pt(5,5));await W(30);
  out.sel=!!(ed().sel&&ed().sel.m[3*ed().w+3])&&!!q('[data-a="scrop"]');
  // drag it 6 right, then nudge it down one with the arrow key
  ev('pointerdown',pt(3,3));ev('pointermove',pt(9,3));ev('pointerup',pt(9,3));await W(30);
  document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));await W(20);const px=ed().px,w=ed().w;
  out.moved=[px[2*w+2]===255,px[3*w+8]===red,px[5*w+10]===red,px[2*w+8]===255];
  // Copy copies just the selection
  q('[data-a="pxcopy"]').click();await W(20);const clip=JSON.parse(localStorage.getItem('sq_dev_clip')||'{}');out.copy=[clip.w,clip.h];
  // Delete, then Undo brings it back
  document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'Delete',bubbles:true}));await W(20);out.del=ed().px.some(v=>v===red);q('[data-a="undo"]').click();await W(20);out.undo=ed().px.filter(v=>v===red).length;
  // Crop: the sprite becomes the selection's box
  ev('pointerdown',pt(7,2));ev('pointermove',pt(11,6));ev('pointerup',pt(11,6));await W(30);q('[data-a="scrop"]').click();await W(80);out.crop=[ed().w,ed().h,ed().px.filter(v=>v===red).length];
  q('[data-a="undo"]').click();await W(80);out.cropUndo=[ed().w===W0,ed().h===H0];
  // the wheel zooms in around the pointer; a trackpad's smooth scroll doesn't zoom
  q('[data-tool="pen"]').click();await W(20);for(let i=0;i<3;i++){q('[data-a="zin"]').click();await W(30)}const box=q('.dv-cvw');box.scrollLeft=40;box.scrollTop=30;await W(20);const b0=box.getBoundingClientRect(),mx=b0.left+b0.width*.35,my=b0.top+b0.height*.4;
  const pxAt=()=>{const c=cv().getBoundingClientRect();return[(mx-c.left)/c.width*ed().w,(my-c.top)/c.height*ed().h]};const before=pxAt(),z0=ed().zoom||1;
  box.dispatchEvent(new WheelEvent('wheel',{deltaY:-100,deltaMode:0,clientX:mx,clientY:my,bubbles:true,cancelable:true}));await W(40);const after=pxAt();
  out.wheel=[(ed().zoom||1)>z0,Math.abs(after[0]-before[0])<.6,Math.abs(after[1]-before[1])<.6,cv().getBoundingClientRect().width>box.clientWidth];
  await W(90);const z1=ed().zoom;box.dispatchEvent(new WheelEvent('wheel',{deltaY:7.5,deltaMode:0,clientX:mx,clientY:my,bubbles:true,cancelable:true}));await W(90);out.trackpad=ed().zoom===z1;
  // a pet: Keep only this clears around the selection on that frame and keeps the canvas
  S.ed.dirty=false;q('[data-tab="pets"]').click();await W(250);const pb=document.querySelector('#dvs .dv-it[data-k]');pb.click();for(let k=0;k<30&&!(S.ed&&S.ed.kind==='pet');k++)await W(100);
  if(!(S.ed&&S.ed.kind==='pet'))return Object.assign(out,{pet:'pet editor did not open'});
  const pw=ed().w,ph=ed().h,n0=ed().px.filter(v=>v!==255).length;q('[data-tool="sel"]').click();await W(30);
  const P=ed();let x0=P.w,y0=P.h,x1=-1,y1=-1;for(let i=0;i<P.px.length;i++)if(P.px[i]!==255){const X=i%P.w,Y=(i/P.w)|0;x0=Math.min(x0,X);x1=Math.max(x1,X);y0=Math.min(y0,Y);y1=Math.max(y1,Y)}
  const mxp=(x0+x1)>>1;ev('pointerdown',pt(x0,y0));ev('pointermove',pt(mxp,y1));ev('pointerup',pt(mxp,y1));await W(30);q('[data-a="scrop"]').click();await W(40);
  const n1=ed().px.filter(v=>v!==255).length;out.pet=[ed().w===pw&&ed().h===ph,n1>0&&n1<n0,(q('[data-a="scrop"]')||{textContent:''}).textContent];
  S.ed.dirty=false;SQSUITE.close();return out});
 if(r.err){t(false,r.err);return}
 t.eq(r.tools,[true,true],'Select and Move in the sprite editor');t(r.zoomBtns,'zoom buttons in the sprite editor');
 t(r.sel,'a box selection, with Crop');t.eq(r.moved,[true,true,true,true],'dragged 6 right, nudged 1 down [old spot clear, new spot, far corner, above it clear]');
 t.eq(r.copy,[3,3],'Copy with a selection copies just the selection');
 t.eq([r.del,r.undo],[false,9],'Delete clears the selection, Undo brings it back');
 t.eq(r.crop,[5,5,9],'Crop: the sprite becomes the selection\'s box [width, height, red pixels]');t.eq(r.cropUndo,[true,true],'Undo of Crop [width, height back]');
 t.eq(r.wheel,[true,true,true,true],'the mouse wheel zooms the sprite in [zoomed, same pixel under the pointer x, y, bigger than the view]');t(r.trackpad,'a trackpad scroll zoomed');
 if(typeof r.pet==='string')t(false,r.pet);else t.eq([r.pet[0],r.pet[1]],[true,true],'pet: Keep only this [same canvas, fewer pixels left]')}};
