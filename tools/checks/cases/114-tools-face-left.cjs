// Nov 24 (Jace): "when chopping to the left, my tool is held backwards". The held item was the right-facing sprite turned ~150°, which
// puts an axe's blade on the trailing side; facing left is now the mirror image of facing right (123's put(..., flip)), and the
// game's own drawn tools (028's drawToolLine, when sprite swings are off) put the head on the mirrored side too.
module.exports={name:'facing left, the axe and pickaxe are the mirror image of facing right',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(300);const I=window.SQISW,o={};if(!I)return{err:'no SQISW'};
  for(const k of['eq_axe7','eq_pick7'])I.srcFor(k);await W(400);
  // the sprite: right-facing end of a chop vs left-facing, mirrored back
  const img=(k,type,fx)=>{const c=document.createElement('canvas');c.width=40;c.height=40;const x=c.getContext('2d');const a={type,t:.5,sd:.5,dur:1,face:[fx,0]};
   I.put(x,I.srcFor(k),'diag',I.toolAng(a),20,20,fx<0);return x.getImageData(0,0,40,40).data};
  const mirrorDiff=(A,B)=>{let n=0,on=0;for(let y=0;y<40;y++)for(let x=0;x<40;x++){const i=(y*40+x)*4,j=(y*40+(40-x))*4;if(40-x>=40)continue;if(A[i+3]>0)on++;if((A[i+3]>0)!==(B[j+3]>0)||A[i]!==B[j])n++}return[n,on]};
  o.axe=mirrorDiff(img('eq_axe7','chop',1),img('eq_axe7','chop',-1));o.pick=mirrorDiff(img('eq_pick7','mine',1),img('eq_pick7','mine',-1));
  // the game's own drawing: where the axe head sits against the handle, facing right and left
  const head=fx=>{g.save();g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,60,40);const a0=Math.atan2(0,fx),sg=fx<0?1:-1;drawToolLine('axe',a0-sg*.25,30,20,7,fx<0?-1:1);
   const d=g.getImageData(0,0,60,40).data,hc=TCOL[7]||'#c8d0d8',cr=parseInt(hc.slice(1,3),16),cg=parseInt(hc.slice(3,5),16),cb=parseInt(hc.slice(5,7),16);let sy=0,n=0;
   for(let y=0;y<40;y++)for(let x=0;x<60;x++){const i=(y*60+x)*4;if(d[i]===cr&&d[i+1]===cg&&d[i+2]===cb){sy+=y;n++}}g.restore();return n?Math.round(sy/n-20):null};
  o.own=[head(1),head(-1)];return o});
 if(r.err)return t(false,r.err);
 t(r.axe[1]>10&&r.axe[0]===0,'the adamant axe facing left is the mirror of facing right ('+r.axe[0]+' pixels differ of '+r.axe[1]+')');
 t(r.pick[1]>10&&r.pick[0]===0,'the adamant pickaxe too ('+r.pick[0]+' differ)');
 t(r.own[0]>0&&r.own[1]>0,'the game\'s own axe: the head below the handle at the end of the chop, both ways ('+r.own+')')}};
