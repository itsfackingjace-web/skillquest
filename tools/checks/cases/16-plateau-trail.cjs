// Ironcrest: where a trail meets a rock plateau on its east or west side (no cliff drawn there), you can walk from the trail onto
// the plateau and back. The south cliff face still stops you.
module.exports={name:'trails lead onto plateaus from the side on Ironcrest',async run(p,t){
 const spot=await p.evaluate(async()=>{const W2=ms=>new Promise(r=>setTimeout(r,ms));routeOpen=()=>true;routeGo('ironcrest');
  const e=Date.now()+30000;while(Date.now()<e&&!(curRegion()==='ironcrest'&&!(typeof TRAVEL!=='undefined'&&TRAVEL)))await W2(200);await W2(800);
  const R=SCENE.room,W=R.w,T=R.tiles,Pl=R.plat;if(!Pl)return null;const st=new Set(R.platSt.map(q=>q[0]));
  const free=(x,y)=>{const cx=x*16+8,cy=y*16+8;return!(solid(cx-5,cy-3)||solid(cx+5,cy-3)||solid(cx-5,cy+6)||solid(cx+5,cy+6))};
  const side=[],south=[];
  for(let i=W;i<T.length-W;i++){if(!Pl[i]||st.has(i)||R.solid.has(i))continue;const x=i%W,y=(i/W)|0;
   for(const d of[1,-1]){const n=i+d;if(T[n]===14&&!Pl[n]&&!R.solid.has(n)&&Pl[i-W]&&Pl[i+W]&&free(x+d,y))side.push([x+d,y,-d])}
   if(T[i+W]===14&&!Pl[i+W]&&Pl[i-W]&&free(x,y+1))south.push([x,y+1])}
  en.length=0;return{side:side[0]||null,south:south[0]||null,n:side.length}});
 t(spot&&spot.side,'no trail beside a plateau found on Ironcrest');if(!spot||!spot.side)return;
 const walk=async(k,ms)=>{await p.keyboard.down(k);await p.waitForTimeout(ms);await p.keyboard.up(k);await p.waitForTimeout(100);return p.evaluate(()=>[Math.floor(P.x/16),Math.floor(P.y/16)])};
 const [x,y,dir]=spot.side;await p.evaluate(([x,y])=>{P.x=x*16+8;P.y=y*16+8;en.length=0},[x,y]);
 const on=await walk(dir>0?'ArrowRight':'ArrowLeft',350);
 t(on[0]===x+dir,'could not walk from the trail at '+x+','+y+' onto the plateau (ended at '+on+')');
 if(spot.south){const [sx,sy]=spot.south;await p.evaluate(([x,y])=>{P.x=x*16+8;P.y=y*16+8;en.length=0},[sx,sy]);const up=await walk('ArrowUp',350);
  t(up[1]===sy,'walked up the south cliff face at '+sx+','+sy+' without stairs')}}};
