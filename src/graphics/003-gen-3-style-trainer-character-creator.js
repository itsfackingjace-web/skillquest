// ===== Gen 3 style trainer + character creator =====
const OPT={skin:[['#f8d0a8','#d8a880'],['#f0b890','#d09068'],['#c88858','#a06838'],['#8c5a34','#6a4020'],['#5c3a22','#442814']],hair:['#2a1a10','#6a3a18','#c88830','#e8d060','#d83020','#4060d8','#f0f0f0','#e060a0'],shirt:['#d83830','#3868d8','#38a838','#f0d030','#f08830','#8040c0','#f0f0f0','#303040'],pants:['#3050a0','#303040','#785028','#38783a','#a03030','#e8e8e8'],hatc:['#f0f0f0','#d83830','#3868d8','#38a838','#303040','#f0d030'],shoe:['#e8e8e8','#d83830','#303040','#785028','#3868d8']};
const HNAME=['Short','Spiky','Long','Ponytail'],HATN=['None','Cap','Beanie'],LIM={sk:5,hs:4,hc:8,sh:8,pn:6,ht:3,hcol:6,so:5};
let CH={sk:0,hs:0,hc:1,sh:2,pn:1,ht:2,hcol:0,so:0};
try{const s=JSON.parse(localStorage.getItem('hw_ch'));if(s)Object.assign(CH,s)}catch(e){}
for(const k in LIM)if(!(CH[k]>=0&&CH[k]<LIM[k]))CH[k]=0;
const sh2=(c,f)=>{const n=parseInt(c.slice(1),16);return'#'+((1<<24)+(Math.round((n>>16)*f)<<16)+(Math.round(((n>>8)&255)*f)<<8)+Math.round((n&255)*f)).toString(16).slice(1)};
let GC=null;
const R3=(x,y,w,hh,c)=>{GC.fillStyle=c;GC.fillRect(Math.round(x),Math.round(y),w,hh)};
function pp3(list,ox,oy,fl){for(const[a,b,w,hh]of list)R3(ox+(fl?-a-w:a)-1,oy+b-1,w+2,hh+2,O);for(const[a,b,w,hh,c]of list)R3(ox+(fl?-a-w:a),oy+b,w,hh,c)}
function cP(ch,dir,st,ox,oy,fl){
 const[S,Sd]=OPT.skin[ch.sk],H=OPT.hair[ch.hc],T=OPT.shirt[ch.sh],Td=sh2(T,.75),Pn=OPT.pants[ch.pn],Pd=sh2(Pn,.7),Sh=OPT.shoe[ch.so],Hc=OPT.hatc[ch.hcol],Hb=sh2(Hc,.78),hs=ch.hs,ht=ch.ht;
 const by=st?-1:0,ld=st==1?1:st==2?-1:0,rd=-ld,lL=st==2?1:0,rL=st==1?1:0;
 const dt=(a,b,w,hh,c)=>R3(ox+(fl?-a-w:a),oy+b,w,hh,c);
 const SP=[[-4,-16+by,2,2,H],[-1,-17+by,2,3,H],[2,-16+by,2,2,H]];
 let L,legs;
 if(dir==2){const s=st==1?1:st==2?-1:0;
  legs=[[-2-s,0,3,4-lL,Pd],[-1+s,0,3,4-rL,Pn],[-2-s,4-lL,4,2,sh2(Sh,.82)],[-1+s,4-rL,4,2,Sh]];
  L=[[-3,-5+by,6,5-by,T],[-2-s,-5+by,3,3,T],[-2-s,-2+by,3,2,S],[-4,-14+by,9,8,S],[5,-10+by,1,2,S]];
  if(hs==2)L.push([-6,-12+by,5,10,H],[-4,-14+by,9,3,H]);else{L.push([-5,-12+by,4,5,H],[-4,-14+by,9,3,H]);if(hs==3)L.push([-8,-11+by,3,7,H]);if(hs==1&&!ht)L.push(...SP)}
  if(ht==1)L.push([-5,-15+by,10,4,Hc],[3,-12+by,6,2,Hb]);if(ht==2)L.push([-5,-15+by,10,4,Hc],[-8,-13+by,3,2,Hc]);
  pp3(legs.concat(L),ox,oy,fl);dt(2,-9+by,1,2,O);dt(-3,-11+by,6,1,Sd);dt(-3,-1,6,1,Td);if(ht==2)dt(-5,-12+by,10,1,Hb);
 }else if(dir==0){
  legs=[[-4,0,4,4-lL,Pn],[0,0,4,4-rL,Pn],[-4,4-lL,4,2,Sh],[0,4-rL,4,2,Sh]];
  L=[[-6,-5+by+ld,2,3,T],[4,-5+by+rd,2,3,T],[-6,-2+by+ld,2,2,S],[4,-2+by+rd,2,2,S],[-4,-5+by,8,5-by,T],[-5,-14+by,10,8,S]];
  if(hs==2)L.push([-5,-14+by,10,3,H],[-6,-12+by,3,8,H],[3,-12+by,3,8,H]);else{L.push([-5,-14+by,10,3,H],[-5,-11+by,2,3,H],[3,-11+by,2,3,H]);if(hs==1&&!ht)L.push(...SP)}
  if(ht==1)L.push([-5,-15+by,10,4,Hc],[-6,-12+by,12,2,Hb]);if(ht==2)L.push([-5,-15+by,10,4,Hc]);
  pp3(legs.concat(L),ox,oy,fl);dt(-2,-9+by,1,2,O);dt(1,-9+by,1,2,O);dt(-3,-11+by,6,1,Sd);dt(-2,-5+by,4,1,S);dt(-4,-1,8,1,Td);if(ht==2)dt(-5,-12+by,10,1,Hb);
 }else{
  legs=[[-4,0,4,4-lL,Pn],[0,0,4,4-rL,Pn],[-4,4-lL,4,2,Sh],[0,4-rL,4,2,Sh]];
  L=[[-6,-5+by+ld,2,3,T],[4,-5+by+rd,2,3,T],[-6,-2+by+ld,2,2,S],[4,-2+by+rd,2,2,S],[-4,-5+by,8,5-by,T]];
  if(hs==2)L.push([-6,-14+by,12,11,H]);else{L.push([-5,-14+by,10,8,H]);if(hs==3)L.push([-1,-7+by,3,7,H]);if(hs==1&&!ht)L.push(...SP)}
  if(ht)L.push([-5,-15+by,10,5,Hc]);
  pp3(legs.concat(L),ox,oy,fl);dt(-4,-1,8,1,Td);if(ht==2)dt(-5,-11+by,10,1,Hb);if(ht==1)dt(-3,-11+by,6,1,Hb);
 }
}
function pP(tm){
 if(hurt>0&&Math.floor(tm*20)%2)return;GC=g;
 const fx=face[0],fy=face[1],x=Math.round(P.x),y=Math.round(P.y),st=qm?[1,0,2,0][Math.floor(qW)%4]:0;
 shd(x,y+6,12);cP(CH,fx?2:fy<0?1:0,st,x,y,fx<0);
 if(swing>0){const a=Math.atan2(fy,fx),pr=1-swing/.25,f=Math.min(2,Math.floor(pr*3)),an=a+(f-1)*1.15,hx=x+fx*5,hy=y-4+fy*5;
  for(let i=2;i<=12;i++)Rg(hx+Math.cos(an)*i-1,hy+Math.sin(an)*i-1,4,4,O);
  for(let i=2;i<=12;i++)Rg(hx+Math.cos(an)*i,hy+Math.sin(an)*i,2,2,i<=3?GD:SV);
  for(let k=0;k<=f;k++){const q=a+(k-1)*1.15;for(let j=-2;j<=2;j++){const w2=q+j*.18*(f>=k?1:0);Rg(hx+Math.cos(w2)*15,hy+Math.sin(w2)*15,2,2,'#fff');Rg(hx+Math.cos(w2)*12,hy+Math.sin(w2)*12,1,1,'#c8e8ff')}}}
}
// --- creator UI ---
const stl=document.createElement('style');stl.textContent='#cm{position:fixed;inset:0;z-index:20;background:rgba(10,14,28,.96);overflow:auto;display:flex;justify-content:center;padding:calc(env(safe-area-inset-top,0px) + 16px) 16px calc(env(safe-area-inset-bottom,0px) + 24px);touch-action:pan-y;color:#f4f0d8;font-family:"SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace}.cc{width:100%;max-width:360px;display:flex;flex-direction:column;align-items:center;gap:10px;margin:auto}.ct{font-weight:700;letter-spacing:3px}#cpv{position:static;inset:auto;flex:none;width:192px;height:192px;image-rendering:pixelated;border:3px solid #f4f0d8;border-radius:6px}.cr{width:100%;display:flex;align-items:center;gap:8px}.cl{width:76px;font-size:12px;opacity:.8;flex:none}.bx{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.sw{width:30px;height:30px;border-radius:6px;border:3px solid #333;padding:0}.sw.on{border-color:#fff}.ab{width:40px;height:34px;border-radius:6px;border:2px solid #f4f0d8;background:#223;color:#f4f0d8;font-size:14px}#cgo{margin-top:6px;padding:12px 44px;font:700 16px "SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace;background:#38a828;color:#fff;border:3px solid #f4f0d8;border-radius:8px}#cb{position:fixed;z-index:10;right:14px;top:calc(env(safe-area-inset-top,0px) + 86px);width:44px;height:44px;border-radius:10px;border:2px solid rgba(244,240,216,.6);background:rgba(244,240,216,.18);font-size:20px;color:#fff}';document.head.appendChild(stl);
const cm=document.createElement('div');cm.id='cm';cm.innerHTML='<div class="cc"><div class="ct" style="font-size:28px;letter-spacing:4px;color:#f8d848">SKILLQUEST</div><div class="ct">CREATE YOUR CHARACTER</div><canvas id="cpv" width="48" height="48"></canvas><div style="font-size:11px;opacity:.6">tap preview to rotate</div><div id="crows" style="width:100%;display:flex;flex-direction:column;gap:10px"></div><button id="cgo">START</button></div>';document.body.appendChild(cm);
const cb=document.createElement('button');cb.id='cb';cb.textContent='👕';document.body.appendChild(cb);
const crows=document.getElementById('crows'),pc=document.getElementById('cpv'),px2=pc.getContext('2d');
let menuOpen=true,pt=0,pd=0;const PDIR=[[0,0],[2,0],[1,0],[2,1]];
const RD=[['Hair','hs','cy',HNAME],['Hair color','hc','sw',OPT.hair],['Skin','sk','sw',OPT.skin.map(s=>s[0])],['Shirt','sh','sw',OPT.shirt],['Pants','pn','sw',OPT.pants],['Hat','ht','cy',HATN],['Hat color','hcol','sw',OPT.hatc],['Shoes','so','sw',OPT.shoe]];
function rp(){GC=px2;px2.imageSmoothingEnabled=false;px2.clearRect(0,0,48,48);for(let i=0;i<3;i++)for(let j=0;j<3;j++)px2.drawImage(gT[(i*3+j)%4],i*16,j*16);R3(18,32,12,3,'rgba(0,0,0,.28)');const[d,f]=PDIR[pd];cP(CH,d,[1,0,2,0][pt%4],24,26,!!f)}
function build(){crows.innerHTML='';for(const[lb,k,ty,arr]of RD){const r=document.createElement('div');r.className='cr';const l=document.createElement('span');l.className='cl';l.textContent=lb;r.appendChild(l);const bx=document.createElement('div');bx.className='bx';r.appendChild(bx);
  if(ty=='sw')arr.forEach((c,i)=>{const b=document.createElement('button');b.className='sw'+(CH[k]==i?' on':'');b.style.background=c;b.onclick=()=>{CH[k]=i;build();rp()};bx.appendChild(b)});
  else{const ab=(t,d)=>{const b=document.createElement('button');b.className='ab';b.textContent=t;b.onclick=()=>{CH[k]=(CH[k]+d+arr.length)%arr.length;build();rp()};return b};bx.appendChild(ab('◀',-1));const s=document.createElement('span');s.textContent=arr[CH[k]];s.style.cssText='min-width:84px;text-align:center';bx.appendChild(s);bx.appendChild(ab('▶',1))}
  crows.appendChild(r)}}
pc.onclick=()=>{pd=(pd+1)%4;rp()};
setInterval(()=>{if(menuOpen){pt++;rp()}},280);
document.getElementById('cgo').onclick=()=>{menuOpen=false;cm.style.display='none';try{localStorage.setItem('hw_ch',JSON.stringify(CH))}catch(e){}};
cb.onclick=()=>{menuOpen=true;jx=jy=0;cm.style.display='flex';document.getElementById('cgo').textContent='DONE';build();rp()};
const _u=upd;upd=function(dt){if(!menuOpen)_u(dt)};
build();rp();
