// ---- 195. Chat bubbles: speech bubbles instead of long yellow lines, kept apart and short on phones ----
// 061's drawHUD wrapper draws names and what players said (one yellow line of up to 42 characters for 5 s). The outermost drawHUD
// hides every `said` (other players' r.said and MP.selfSaid) for the inner call, so 061 draws only the names, then draws bubbles:
// white rounded boxes with a tail, wrapped to at most 3 lines (narrower on phones), shown 4 s + 70 ms a character (max 9 s), popping
// in and fading out. They are placed newest first; one that would cover another moves up above it, and all stay on screen with the
// tail still pointing at the speaker, never over the HUD corners (hudLayout keep-outs) or the touch buttons. At most 4 at once (5 on big screens);
// older speakers, and bubbles with no room, get a small "…" dot instead.
// SQBUBBLES.last = {n, overlap, dots} from the last frame (tests).
(()=>{const MAXL=3;window.SQBUBBLES={last:{n:0,overlap:false,dots:0}};
 const dur=m=>Math.min(9000,4000+70*m.length);
 function wrap(m,maxW){const words=String(m).split(' ');const L=[];let cur='';
  for(let w of words){while(g.measureText(w).width>maxW&&w.length>4){let k=w.length-1;while(k>1&&g.measureText(w.slice(0,k)+'-').width>maxW)k--;if(cur){L.push(cur);cur=''}L.push(w.slice(0,k)+'-');w=w.slice(k)}
   const t=cur?cur+' '+w:w;if(g.measureText(t).width<=maxW)cur=t;else{if(cur)L.push(cur);cur=w}}if(cur)L.push(cur);
  if(L.length>MAXL){L.length=MAXL;let s=L[MAXL-1];while(s.length>1&&g.measureText(s+'…').width>maxW)s=s.slice(0,-1);L[MAXL-1]=s+'…'}return L}
 function rr(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath()}
 const _dh=drawHUD;drawHUD=function(){const M=window.SQMP;if(!M||!M.on){return _dh.apply(this,arguments)}
  const hid=[];for(const r of M.players.values())if(r.said){hid.push([r,r.said]);r.said=null}const ss=M.selfSaid;M.selfSaid=null;
  let out;try{out=_dh.apply(this,arguments)}finally{for(const[r,s]of hid)r.said=s;M.selfSaid=ss}
  try{draw(M,ss)}catch(e){}return out};
 function draw(M,ss){const st=SQBUBBLES.last={n:0,overlap:false,dots:0};if(!M.T||performance.now()-M.Tat>120||pnOpen||menuOpen)return;const now=performance.now(),T=M.T;
  const u=Math.max(2,Math.round(Math.min(W,H)/160)),sz=Math.round(5*u),phone=!isPC||Math.min(W,H)<700*(window.devicePixelRatio||1);
  const list=[];const add=(x,y,said,named,who)=>{if(!said||!said.m)return;const age=now-said.at,d=dur(said.m);if(age<0||age>d)return;const p=T.transformPoint({x,y:y-27});
   list.push({p,said,age,d,top:p.y-(named?sz+u:0)-u,feet:T.transformPoint({x,y:y+9}).y,who})};
  const loc=typeof mpLoc==='function'?mpLoc():'hollow';
  for(const r of M.players.values()){if(!r.said||!r.loc||(loc&&r.loc!==loc)||performance.now()-r.seen>20000)continue;if(Math.abs(r.x-P.x)>W/Z+48||Math.abs(r.y-P.y)>H/Z+64)continue;add(r.x,r.y,r.said,!!r.n,r.uid)}
  if(ss&&(loc||SCENE)&&!dead)add(P.x,P.y,ss,!!M.selfName,'me');
  if(!list.length)return;list.sort((a,b)=>(b.who==='me')-(a.who==='me')||b.said.at-a.said.at);const cap=Math.min(W,H)<900?4:5,show=list.slice(0,cap),dots=list.slice(cap);// more dots are added by placement
  g.save();g.setTransform(1,0,0,1,0,0);const fs=Math.round(sz*(phone?.92:.95));g.font='700 '+fs+'px '+PF;g.textBaseline='alphabetic';g.textAlign='left';
  const maxW=Math.round(Math.min(W*(phone?.42:.28),fs*16)),pad=Math.round(fs*.45),lh=Math.round(fs*1.18),tail=Math.round(fs*.55),edge=u*3,placed=[];
  // the HUD in the top corners isn't covered: a bubble slides sideways off it, or becomes a dot when it can't
  const KO=[];try{const L=hudLayout(),U=L.U;KO.push({side:'l',x:0,y:0,w:L.ins+Math.max(L.bw,L.qw)+4*U,h:L.stackBottom+48*U},{side:'r',x:L.dx-6*U,y:0,w:W-L.dx+6*U,h:L.top+L.dh+(L.mw||L.dw)+70*U})}catch(e){}
  // touch buttons too (their screen boxes, in canvas pixels)
  try{const k=W/innerWidth;for(const id of['a','e','f','tk','rl','ub','aimb','mpb','mpbug','sqsev','sqevp']){const el=document.getElementById(id);if(!el||!el.offsetWidth||getComputedStyle(el).display==='none'||getComputedStyle(el).visibility==='hidden')continue;const r=el.getBoundingClientRect();KO.push({side:'b',x:r.left*k,y:r.top*k,w:r.width*k,h:r.height*k})}}catch(e){}
  for(const b of show){b.lines=wrap(b.said.m,maxW);const tw=Math.max(...b.lines.map(l=>g.measureText(l).width));b.w=Math.ceil(tw+pad*2);b.h=lh*b.lines.length+pad*1.4|0;
   let x=Math.round(b.p.x-b.w/2),y=Math.round(b.top-tail-b.h);x=Math.max(edge,Math.min(W-edge-b.w,x));let okp=false;
   const hitR=(q)=>x<q.x+q.w+u&&x+b.w+u>q.x&&y<q.y+q.h+u&&y+b.h+u>q.y;
   for(let k=0;k<16;k++){if(y<edge||x<edge-1||x+b.w>W-edge+1||b.top-(y+b.h)>H*.2)break;const hp=placed.find(hitR);if(hp){y=hp.y-b.h-u*2;continue}
    const hk=KO.find(hitR);if(hk){if(hk.side==='l'&&hk.x+hk.w+u+b.w<=W-edge&&b.p.x>hk.x+hk.w-b.w)x=hk.x+hk.w+u;else if(hk.side==='r'&&hk.x-u-b.w>=edge&&b.p.x<hk.x+b.w)x=hk.x-u-b.w;else break;continue}okp=true;break}
   // no room above: under their feet instead (tail pointing up)
   if(!okp){x=Math.max(edge,Math.min(W-edge-b.w,Math.round(b.p.x-b.w/2)));y=Math.round(b.feet+tail);for(let k=0;k<16;k++){if(y+b.h>H-edge||y-b.feet>H*.15)break;const hp=placed.find(hitR)||KO.find(hitR);if(hp){y=hp.y+hp.h+u*2;continue}okp=true;b.below=1;break}}
   if(!okp){dots.push(b);continue}b.x=x;b.y=y;placed.push(b)}
  for(let i=0;i<placed.length;i++)for(let j=i+1;j<placed.length;j++){const a=placed[i],c=placed[j];if(a.x<c.x+c.w&&a.x+a.w>c.x&&a.y<c.y+c.h&&a.y+a.h>c.y)st.overlap=true}
  // oldest first, so the newest is on top
  for(const b of placed.slice().reverse()){const fin=Math.min(1,b.age/140),fout=Math.min(1,(b.d-b.age)/600),a=Math.max(0,Math.min(fin,fout)),sc=.85+.15*Math.min(1,b.age/140);
   g.globalAlpha=a;const cx=b.x+b.w/2,cy=b.y+b.h;g.save();g.translate(cx,cy);g.scale(sc,sc);g.translate(-cx,-cy);
   const tx=Math.max(b.x+pad,Math.min(b.x+b.w-pad,b.p.x)),ty=b.below?Math.max(b.feet,b.y-tail*1.6):Math.min(b.top,b.y+b.h+tail*1.6),ey=b.below?b.y+g.lineWidth/2:b.y+b.h-g.lineWidth/2;
   g.fillStyle='rgba(0,0,0,.28)';rr(b.x+u*.6,b.y+u*.8,b.w,b.h,pad*.8);g.fill();
   g.fillStyle=b.who==='me'?'#fff8d8':'#ffffff';g.strokeStyle='#202028';g.lineWidth=Math.max(2,Math.round(u*.6));rr(b.x,b.y,b.w,b.h,pad*.8);g.fill();g.stroke();
   g.beginPath();g.moveTo(tx-tail*.6,ey);g.lineTo(b.p.x<b.x+pad||b.p.x>b.x+b.w-pad?tx:b.p.x,ty);g.lineTo(tx+tail*.6,ey);g.fill();g.stroke();
   g.fillRect(tx-tail*.6+g.lineWidth/2,b.below?b.y-g.lineWidth*.1:b.y+b.h-g.lineWidth*1.5,tail*1.2-g.lineWidth,g.lineWidth*1.6);
   g.fillStyle='#202028';b.lines.forEach((l,i)=>g.fillText(l,b.x+pad,b.y+pad*.7+lh*(i+.82)));g.restore()}
  g.globalAlpha=1;for(const b of dots){const x=b.p.x,y=b.top-tail;if(KO.some(k=>x>k.x&&x<k.x+k.w&&y>k.y&&y<k.y+k.h+fs))continue;g.fillStyle='#ffffff';g.strokeStyle='#202028';g.lineWidth=Math.max(2,u*.6);rr(x-fs*.9,y-fs*1.1,fs*1.8,fs*1.1,fs*.4);g.fill();g.stroke();g.fillStyle='#202028';g.textAlign='center';g.fillText('…',x,y-fs*.3);g.textAlign='left'}
  st.n=placed.length;st.dots=dots.length;g.restore()}})();
