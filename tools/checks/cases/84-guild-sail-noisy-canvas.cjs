// Nov 22 (Aztu in #bugs: "Guild sail not displaying correctly", a speckled sail on Android/Brave): privacy browsers change some pixels
// a page reads back from a canvas by a step or two, and the sail recolouring matched colours exactly, so half the cloth kept its plain
// colour and the trim test found holes everywhere. With that noise copied here, every pixel of the sail still takes the guild colours.
module.exports={name:'guild sails recolour fully on browsers that add canvas noise',async run(p,t){
 const r=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,500));const S=SQSAILS,P2=CanvasRenderingContext2D.prototype,_g=P2.getImageData;
  let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  P2.getImageData=function(){const im=_g.apply(this,arguments),d=im.data;for(let i=0;i<d.length;i+=4)if(rnd()<.5){const k=i+(rnd()*3|0);d[k]=Math.max(0,Math.min(255,d[k]+(rnd()<.5?-1:1)))}return im};
  const out=[];try{const D=S.fromCh({slc:4,sls:15,slp:0,slt:1,sle:11,slx:15});
   for(const fc of[[1,0],[-1,0],[0,1],[0,-1]]){const b=BOAT85.back(fc,true,0),rc=S.recolor(b,D);out.push({b,rc})}}finally{P2.getImageData=_g}
  // read back without the noise: count the sail pixels (plain sail colours) left in each recoloured layer
  const SA=[[0xa8,0x9c,0x88],[0xcf,0xc3,0xaa],[0xec,0xe2,0xca],[0xff,0xfa,0xee]];
  return out.map(({b,rc})=>{const px=c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data,d0=px(b.c),d1=px(rc.c);let sail=0,left=0;
   for(let i=0;i<d0.length;i+=4){if(d0[i+3]<250)continue;const is=c=>SA.some(s=>Math.abs(s[0]-c[0])<=2&&Math.abs(s[1]-c[1])<=2&&Math.abs(s[2]-c[2])<=2);
    if(is([d0[i],d0[i+1],d0[i+2]])){sail++;if(is([d1[i],d1[i+1],d1[i+2]]))left++}}return[sail,left]})});
 for(const[k,[sail,left]]of r.entries())t(sail>50&&left===0,'view '+k+': '+left+' of '+sail+' sail pixels kept the plain sail colour')}};
