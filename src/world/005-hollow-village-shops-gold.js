// ===== Hollow Village: shops + gold =====
cb.remove();
let GLD=0,shop=null,gsv=0;try{GLD=+localStorage.getItem('hw_g')||0}catch(e){}
const svg=()=>{try{localStorage.setItem('hw_g',GLD)}catch(e){}};
const VX=Math.floor(P.x/T),VY=Math.floor(P.y/T),BS=new Set();
for(let y=VY-8;y<=VY+8;y++)for(let x=VX-11;x<=VX+11;x++)if(x>0&&y>0&&x<N-1&&y<N-1){tile[y*N+x]=2;obj[y*N+x]=undefined}
const pth=(x,y)=>{if(x>0&&y>0&&x<N-1&&y<N-1)tile[y*N+x]=1};
for(let x=VX-8;x<=VX+8;x++)pth(x,VY-2);for(let y=VY-3;y<=VY+4;y++)pth(VX,y);for(const d of[-6,5])for(let y=VY-3;y<=VY-2;y++)pth(VX+d,y);for(let y=VY-1;y<=VY+1;y++)for(let x=VX-1;x<=VX+1;x++)pth(x,y);
const BLD=[{k:'gen',tx:VX-8,ty:VY-5,w:5,wall:'#e8d0a0',roof:'#c84830',sc:'#f0d040'},{k:'smith',tx:VX+3,ty:VY-5,w:5,wall:'#a8a8b0',roof:'#585870',sc:'#707080'}];
for(const b of BLD)for(let y=b.ty;y<b.ty+2;y++)for(let x=b.tx;x<b.tx+b.w;x++)BS.add(y*N+x);
const NPCS=[{kind:'gen',x:(VX-6)*16+8,y:(VY-3)*16+8,ch:{sk:1,hs:0,hc:6,sh:3,pn:2,ht:0,hcol:0,so:3}},{kind:'smith',x:(VX+5)*16+8,y:(VY-3)*16+8,ch:{sk:2,hs:0,hc:0,sh:7,pn:1,ht:0,hcol:0,so:2}}];
solid=function(px,py){const x=Math.floor(px/T),y=Math.floor(py/T);if(x<0||y<0||x>=N||y>=N)return true;return tile[y*N+x]==0||!!obj[y*N+x]||BS.has(y*N+x)};
function drBld(b,tm){const X0=b.tx*16,w=b.w*16,base=(b.ty+2)*16,wd=sh2(b.wall,.8),rd=sh2(b.roof,.75),dx=X0+(w>>1)-6;
 if(!(typeof BLDHD==='function'&&BLDHD(b,X0,w,base))){Rg(X0-1,base-29,w+2,30,O);Rg(X0-4,base-52,w+8,25,O);
 Rg(X0,base-28,w,28,b.wall);Rg(X0,base-5,w,5,wd);for(let x=X0+5;x<X0+w-3;x+=8)Rg(x,base-27,1,20,wd);
 Rg(X0-3,base-51,w+6,23,b.roof);for(let y=base-47;y<base-29;y+=5)Rg(X0-3,y,w+6,1,rd);Rg(X0-3,base-29,w+6,2,rd);
 Rg(X0,base-27,w,2,'rgba(0,0,0,.25)');
 Rg(dx-1,base-18,14,19,O);Rg(dx,base-17,12,17,'#7a4a20');Rg(dx+1,base-16,4,15,'#8a5a2a');Rg(dx+9,base-9,2,2,GD);
 for(const wx of[X0+8,X0+w-20]){Rg(wx-1,base-23,14,12,O);Rg(wx,base-22,12,10,b.k=='smith'&&wx>X0+20?'#f89030':'#a8d8f8');Rg(wx+5,base-22,1,10,'rgba(255,255,255,.6)');Rg(wx,base-17,12,1,'rgba(255,255,255,.6)')}}
 if(b.sc){Rg(dx-4,base-27,20,8,O);Rg(dx-3,base-26,18,6,b.sc)}
 if(!b.sc){}else if(b.k=='gen'){Rg(dx+4,base-25,4,4,GD);Rg(dx+5,base-24,2,2,'#c8a020')}else{Rg(dx+1,base-24,10,2,'#303040');Rg(dx+4,base-22,4,2,'#303040');Rg(dx+3,base-25,2,1,'#f88830')}
 if(b.k=='smith'){Rg(X0+w-15,base-64,10,16,O);Rg(X0+w-14,base-63,8,15,'#887870');for(let i=0;i<3;i++)Rg(X0+w-11+Math.sin(tm*2+i*2)*2,base-67-((tm*12+i*7)%20),2,2,'rgba(220,220,230,.7)')}}
const SELLP={wood:2,stone:3,berry:1,meat:4,cooked:8,iron:12},SN={wood:'Wood',stone:'Stone',berry:'Berries',meat:'Raw meat',cooked:'Cooked meat',iron:'Iron ore'};
const GEN=[{n:'3 Berries',c:6,f:()=>inv.berry+=3},{n:'Cooked meat',c:14,f:()=>inv.cooked=(inv.cooked||0)+1},{n:'Fire kit (3 wood + 1 stone)',c:12,f:()=>{inv.wood+=3;inv.stone+=1}}];
const smItems=()=>{const a=[];['axe','pick','sword'].forEach((k,i)=>{const t=TL[k]+1;if(t<=3)a.push({n:TIT[t]+' '+['axe','pickaxe','sword'][i],c:[8,30,90][t-1],f:()=>{TL[k]=t;svs()}})});['helm','body','legs'].forEach((k,i)=>{const t=ARM[k]+1;if(t<=3)a.push({n:['Leather','Iron','Steel'][t-1]+' '+['helmet','chestplate','legs'][i],c:[[15,25,20],[60,120,90],[200,400,300]][t-1][i],req:[1,10,20][t-1],f:()=>{ARM[k]=t}})});a.push({n:'Iron ore',c:20,f:()=>{inv.iron=(inv.iron|0)+1}});return a};
const sellP=k=>shop=='smith'?(k=='iron'?15:k=='stone'?4:Math.round(SELLP[k]*1.2)):(k=='iron'?10:SELLP[k]);
function rShop(){const sm=shop=='smith';let h='<div class="tl">'+(sm?'Blacksmith':'General Store')+'</div><div class="tl">Gold: '+GLD+'</div><div class="tl" style="font-size:12px">BUY</div>';
 (sm?smItems():genItems()).forEach((it,i)=>{h+='<button class="sb" data-a="b'+i+'" style="opacity:'+(GLD>=it.c&&!(it.req>lvOf(8))?1:.45)+'">'+it.n+'<br><small>'+it.c+' gold'+(it.req>1?' · Defence '+it.req:'')+'</small></button>'});
 if(sm&&!smItems().length)h+='<div class="tl" style="font-weight:400;opacity:.6">You own the best tools!</div>';
 h+='<div class="tl" style="font-size:12px;margin-top:12px">SELL</div>';let any=0;
 for(const k in SELLP){if(sm&&!SMB.has(k))continue;const n=inv[k]|0;if(n>0){any=1;h+='<button class="sb" data-a="s'+k+'">Sell all '+SN[k]+' ('+n+')<br><small>+'+n*sellP(k)+' gold</small></button>'}}
 if(!any)h+='<div class="tl" style="font-weight:400;opacity:.6">Nothing to sell</div>';pbd.innerHTML=h}
function shopAct(a){if(a[0]=='b'){const it=(shop=='smith'?smItems():genItems())[+a.slice(1)];if(!it)return;if(it.req>lvOf(8))say('Need Defence '+it.req);else if(GLD>=it.c){GLD-=it.c;it.f();say('Bought '+it.n)}else say('Not enough gold')}
 else{const k=a.slice(1),n=inv[k]|0;if(n>0){const v=n*sellP(k);GLD+=v;inv[k]=0;say('Sold for '+v+' gold');drops.push({x:P.x,y:P.y-16,t:0,tx:'+'+v+' gold',c:'#f8d848'})}}
 svg();rPn()}
const _r=rPn;rPn=function(){if(ptab==2){document.getElementById('t0').className='';document.getElementById('t1').className='';rShop()}else _r()};
const _oc=pbd.onclick;pbd.onclick=e=>{const s=e.target.closest('.sb');if(s)shopAct(s.dataset.a);else _oc(e)};
const st5=document.createElement('style');st5.textContent='.sb{display:block;width:100%;margin:8px 0;padding:12px;text-align:left;border-radius:8px;border:2px solid #f4f0d8;background:#2a6a22;color:#fff;font:700 14px "SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace}.sb small{font-weight:400;opacity:.85}';document.head.appendChild(st5);
const nearNpc=()=>NPCS.find(n=>(n.scene||null)===curScene()&&Math.hypot(n.x-P.x,n.y-P.y)<(n.scene?58:28));
const tk=document.createElement('div');tk.className='b';tk.id='tk';tk.textContent='TALK';tk.style.cssText='width:64px;height:64px;right:34px;bottom:calc(env(safe-area-inset-bottom,0px) + 140px);display:none;font-size:13px';document.body.appendChild(tk);
tk.addEventListener('touchstart',e=>{e.preventDefault();const n=nearNpc();if(n&&!pnOpen){shop=n.kind;pnOpen=true;ptab=2;jx=jy=0;pn.style.display='block';rPn()}},{passive:false});
const _u3=upd;upd=function(dt){_u3(dt);tk.style.display=(!dead&&!pnOpen&&!menuOpen&&nearNpc())?'flex':'none';
 en=en.filter(n=>!(n.x>(VX-11)*16&&n.x<(VX+12)*16&&n.y>(VY-8)*16&&n.y<(VY+9)*16));if((gsv+=dt)>3){gsv=0;svg()}};
const _nd2=NEWDRAW;NEWDRAW=function(a,b,x0,y0,x1,y1,vw,vh,tm){_nd2(a,b,x0,y0,x1,y1,vw,vh,tm);g.imageSmoothingEnabled=false;
 if(!SORTALL)for(const bl of BLD)drBld(bl,tm);GC=g;for(const n of NPCS){if(n.scene||NPCSORT)continue;shd(n.x,n.y+6,12);cP(n.ch,n.dir||0,n.st||0,Math.round(n.x),Math.round(n.y),!!n.fl)}
 let rd=false;for(const bl of BLD){const X0=bl.tx*16,base=(bl.ty+2)*16;if(P.x>X0-6&&P.x<X0+bl.w*16+6&&P.y+6>=base&&P.y-16<base)rd=true}
 for(const n of NPCS)if(!n.scene&&Math.abs(P.x-n.x)<12&&P.y>n.y&&P.y-n.y<22)rd=true;if(rd&&!dead)pP(tm)};
say('Welcome to Hollow Village! Shops are just north.');
