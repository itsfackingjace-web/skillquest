// Nov 19 chat: "Can't hold on mobile". Holding the touch HIT button keeps swinging (like holding Space or R2); letting go stops.
module.exports={name:'holding the touch HIT button keeps swinging',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);
  // Nov 22: away from the villagers (one wandering into reach made HIT talk: a shop screen opened and ended the hold, now and then)
  // Nov 24: and nothing in front either (since chops take 1 s, a tree there gave 2 swings in 1.6 s)
  {const x0=P.x,y0=P.y,free=(x,y)=>{const i=Math.floor(y/16)*N+Math.floor(x/16);return(tile[i]===2||tile[i]===1)&&!BS.has(i)&&!obj[i]},ok=(x,y)=>{face=[0,1];const[fx,fy]=[x,y+13];return free(x,y)&&free(fx,fy)&&free(x,y+29)&&!NPCS.some(n=>!n.scene&&Math.hypot(n.x-x,n.y-y)<220)};
   let done=false;for(let rr=14;rr<70&&!done;rr+=4)for(let a=0;a<16&&!done;a++){const x=x0+Math.cos(a/16*6.283)*rr*16,y=y0+Math.sin(a/16*6.283)*rr*16;if(ok(x,y)){P.x=x;P.y=y;face=[0,1];done=true}}
   try{if(pnOpen)closePanel()}catch(e){}await W(300)}
  const el=document.getElementById('a');el.style.visibility='visible';const b=el.getBoundingClientRect();
  const fire=(type)=>{const e=new Event(type,{bubbles:true,cancelable:true});const tt=[{identifier:7,clientX:b.left+b.width/2,clientY:b.top+b.height/2,target:el}];
   Object.defineProperty(e,'changedTouches',{value:tt});Object.defineProperty(e,'touches',{value:type==='touchend'?[]:tt});el.dispatchEvent(e)};
  let n=0;const dummy=SQHIT.wrap('chk37 count',next=>function(){n++;return next.apply(this,arguments)});
  fire('touchstart');await W(1600);const held=n,h1=SQHOLDHIT.held;fire('touchend');await W(100);const at=n;await W(800);
  return{held,h1,after:n-at,h2:SQHOLDHIT.held}});
 t(r.h1,'the hold was not noticed');t(r.held>=3,'only '+r.held+' swings in 1.6 s of holding');t.eq(r.after,0,'swings after letting go');t(!r.h2,'still holding after letting go')}};
