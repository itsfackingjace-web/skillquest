// Nov 22 (Jace: a pet's picture pasted into its item sprite came out tiny): Dev Suite pictures can change resolution. Paste to fit scales a
// copy from a picture of another size to fill this one; More pixels x2 / Fewer pixels 1/2 change a sprite's own size (and the scale it's
// shown at, so it keeps its size in the game); Bigger x2 / Smaller 1/2 scale a pet's drawing inside its canvas. All of them undo.
module.exports={name:'Dev Suite: paste to fit and change a picture\'s resolution',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));window.SQDEV=()=>true;SQSUITE.open();await W(700);const S=SQSUITE.state,q=s=>document.querySelector('#dvs '+s);
  q('[data-tab="sprites"]').click();await W(200);const it=q('[data-k="ibar"]');if(!it)return{err:'no iron bar sprite'};it.click();for(let k=0;k<20&&!S.ed;k++)await W(100);if(!S.ed)return{err:'sprite did not open'};
  const out={};const ed=()=>S.ed;out.start=[ed().w,ed().h,ed().s];
  // a small 6 x 4 copy (a green block with a dark outline), as if copied from a smaller picture
  const p6=[];for(let y=0;y<4;y++)for(let x=0;x<6;x++)p6.push(x===0||y===0||x===5||y===3?'#203018':'#48a848');
  localStorage.setItem('sq_dev_clip',JSON.stringify({w:10,h:8,p:Array.from({length:80},(_,i)=>{const x=i%10,y=(i/10)|0;return x>=2&&x<8&&y>=3&&y<7?p6[(y-3)*6+x-2]:''})}));
  q('[data-a="pxfit"]').click();await W(50);const drawn=()=>{let x0=99,y0=99,x1=-1,y1=-1;const e=ed();for(let i=0;i<e.px.length;i++)if(e.px[i]!==255){const X=i%e.w,Y=(i/e.w)|0;x0=Math.min(x0,X);x1=Math.max(x1,X);y0=Math.min(y0,Y);y1=Math.max(y1,Y)}return x1<0?null:[x1-x0+1,y1-y0+1,y1===e.h-1]};
  out.fit=drawn();
  // twice the pixels: the same drawing, twice as big in pixels, shown at half the scale when it can; undo puts it back
  const w0=ed().w,s0=ed().s,box0=drawn();q('[data-a="res2"]').click();await W(50);out.res2=[ed().w===w0*2,drawn()[0]===box0[0]*2,ed().s===(s0%2===0?s0/2:s0)];
  q('[data-a="resh"]').click();await W(50);out.resh=[ed().w===w0,drawn()[0]===box0[0]];
  q('[data-a="undo"]').click();await W(50);out.undo=ed().w===w0*2;
  // a pet: Smaller 1/2 halves its drawing inside the canvas, every frame; undo restores it
  S.ed.dirty=false;q('[data-tab="pets"]').click();await W(250);const pb=document.querySelector('#dvs .dv-it[data-k]');if(!pb)return Object.assign(out,{pet:'no pets listed'});pb.click();for(let k=0;k<30&&!(S.ed&&S.ed.kind==='pet');k++)await W(100);
  if(!(S.ed&&S.ed.kind==='pet'))return Object.assign(out,{pet:'pet editor did not open'});
  const filled=()=>ed().layers.map(L=>L.filter(v=>v!==255).length);const b0=filled();q('[data-a="layh"]').click();await W(50);const b1=filled();q('[data-a="undo"]').click();await W(50);const b2=filled();
  out.pet=[b0.some(n=>n>0),b1.every((n,i)=>!b0[i]||n<b0[i]*.5),b2.join()===b0.join()];
  SQSUITE.close();return out});
 if(r.err){t(false,r.err);return}
 t(r.fit&&r.fit[2]&&r.fit[0]>=r.start[0]-6&&r.fit[0]<=r.start[0]&&r.fit[0]%6===0,'Paste to fit: the 6 x 4 copy filled '+JSON.stringify(r.fit)+' of the '+r.start.slice(0,2).join(' x ')+' sprite, sitting on the bottom');
 t.eq(r.res2,[true,true,true],'More pixels x2 [width doubled, drawing doubled, shown-at halved when even]');
 t.eq(r.resh,[true,true],'Fewer pixels 1/2 back to the same size');t(r.undo,'Undo of Fewer pixels');
 if(typeof r.pet==='string')t(false,r.pet);else t.eq(r.pet,[true,true,true],'pet Smaller 1/2 [had a drawing, every frame halved, undo restored it]')}};
