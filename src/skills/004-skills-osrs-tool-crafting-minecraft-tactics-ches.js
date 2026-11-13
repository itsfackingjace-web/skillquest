// ===== Skills (OSRS) + tool crafting (Minecraft) + Tactics (chess) =====
const SKN=['Attack','Woodcutting','Mining','Foraging','Cooking','Firemaking','Crafting','Tactics'],AB=['ATK','WC','MIN','FOR','COOK','FM','CRAFT','TAC'],SKC=['#e04040','#48c048','#90a8d0','#e060a0','#f0a840','#f87830','#a880e0','#f0e8d0'],TIT=['Hands','Wooden','Stone','Iron'];
let XPS=[0,0,0,0,0,0,0,0],TL={axe:0,pick:0,sword:0},drops=[],pnOpen=false;
try{const s=JSON.parse(localStorage.getItem('hw_sk'));if(s){if(Array.isArray(s.x)&&s.x.length==8)XPS=s.x.map(v=>+v||0);if(s.t)for(const k in TL)TL[k]=Math.max(0,Math.min(3,+s.t[k]||0))}}catch(e){}
const svs=()=>{try{localStorage.setItem('hw_sk',JSON.stringify({x:XPS,t:TL}))}catch(e){}};
const XT=[0];{let a=0;for(let l=1;l<99;l++){a+=Math.floor(l+300*Math.pow(2,l/7));XT.push(Math.floor(a/4))}}
const lvOf=i=>{let l=1;while(l<99&&XPS[i]>=XT[l])l++;return l};
function addXp(i,x){const b=lvOf(i);XPS[i]+=x;const a=lvOf(i);drops.push({x:P.x,y:P.y-16-(drops.length%3)*6,t:0,tx:'+'+x+' '+AB[i],c:SKC[i]});if(a>b){say('LEVEL UP! '+SKN[i]+' '+a);msgT=4}svs()}
function attack(){
 if(swing>0||dead)return;swing=.25;inv.iron=inv.iron||0;inv.cooked=inv.cooked||0;
 const[fx,fy]=front(13),gx=[0,0,0,0,0,0,0,0],dm=1+TL.sword+Math.floor(lvOf(0)/15)+(typeof meleeBonus==='function'?meleeBonus():0),tl=lvOf(7);let hits=0;
 for(const n of en)if(!n.dead&&Math.hypot(n.x-fx,n.y-fy)<16){let d=dm;if(Math.random()<(typeof critCh==='function'?critCh(n):tl*.006)){d*=(typeof critMul==='function'?critMul(n):2);say('Checkmate!');if(typeof onCrit==='function')onCrit(n,d)}
  n.hp-=d;n.kx=face[0]*5;n.ky=face[1]*5;hits++;gx[0]+=4*d;gx[7]+=3;
  if(n.hp<=0){n.dead=1;kills++;gx[0]+=12;gx[7]+=10;GLD+=2+Math.floor(Math.random()*5);if(Math.random()<.6){inv.meat++;say('+1 meat')}}}
 if(hits>1){say('Fork! x'+hits);gx[7]+=30*hits}
 const tx=Math.floor(fx/T),ty=Math.floor(fy/T);
 if(tx>=0&&ty>=0&&tx<N&&ty<N){const o=obj[ty*N+tx];if(o){
  if(o.t=='rock'&&TL.pick<1)say('Need a pickaxe - craft one!');
  else{o.hp-=o.t=='tree'?1+TL.axe:o.t=='rock'?1+TL.pick:1;o.shake=.15;
   if(o.hp<=0){obj[ty*N+tx]=null;
    if(o.t=='tree'){const n=2+(Math.random()<lvOf(1)*.01?1:0);inv.wood+=n;say('+'+n+' wood');gx[1]+=25}
    else if(o.t=='rock'){if(lvOf(2)>=15&&TL.pick>=2&&Math.random()<.3){inv.iron++;say('+1 iron ore');gx[2]+=35}else{const n=2+(Math.random()<lvOf(2)*.01?1:0);inv.stone+=n;say('+'+n+' stone');gx[2]+=18}}
    else{const n=2+(Math.random()<lvOf(3)*.01?1:0);inv.berry+=n;say('+'+n+' berries');gx[3]+=10}}}}}
 gx.forEach((v,i)=>{if(v>0)addXp(i,Math.round(v))});
}
function eat(){if(dead)return;inv.cooked=inv.cooked||0;
 if(inv.meat>0&&nearFire(P.x,P.y,45)){inv.meat--;if(Math.random()<Math.max(.05,.4-lvOf(4)*.007)){say('Burnt it!');addXp(4,5)}else{inv.cooked++;say('Cooked meat');addXp(4,30)}}
 else if(inv.cooked>0){inv.cooked--;hunger=Math.min(100,hunger+60);P.hp=Math.min(6,P.hp+2);say('Delicious! +2 hearts')}
 else if(inv.berry>0){inv.berry--;hunger=Math.min(100,hunger+18);say('Ate berries')}
 else if(inv.meat>0){inv.meat--;hunger=Math.min(100,hunger+20);say('Raw meat... cook it at a fire')}
 else say('Nothing to eat')}
function fire(){if(dead)return;if(inv.wood>=3&&inv.stone>=1){const[fx,fy]=front(16);if(solid(fx,fy)){say('No room there');return}inv.wood-=3;inv.stone--;fires.push({x:fx,y:fy,life:150+lvOf(5)*3});say('Campfire built');addXp(5,40)}else say('Need 3 wood + 1 stone')}
for(const id of['a','e','f']){const o=document.getElementById(id),n=o.cloneNode(true);o.replaceWith(n);n.addEventListener('touchstart',e=>{e.preventDefault();if(!dead&&!pnOpen&&!menuOpen)({a:attack,e:eat,f:fire})[id]()},{passive:false})}
// recipes
// a tool's tier name for the crafting header; tiers past the table (Crystal sword, custom items) use the item's own name
function tierName(k){const t=TL[k]|0;if(!t)return TIT[0]||'none';if(TIT[t])return TIT[t];try{const o=typeof occ==='function'?occ('main'):null;if(k==='sword'&&o&&INAME[o])return INAME[o].replace(/ sword$/i,'')}catch(e){}const e=EQ&&EQ['eq_'+k+t];return e&&e.n?e.n.split(' ')[0]:'Tier '+t}
const REC=[];for(let t=1;t<=3;t++)['axe','pick','sword'].forEach((k,i)=>REC.push({k,t,name:TIT[t]+' '+['axe','pickaxe','sword'][i],c:t==1?{wood:[3,4,3][i]}:t==2?{wood:[2,2,1][i],stone:[3,3,2][i]}:{wood:2,iron:[3,3,2][i]},req:[1,5,15][t-1],xp:[40,80,150][t-1]}));
// farming tools are craftable too (one of each; the general store still sells them)
REC.push({k:'hoe',t:1,name:'Hoe',c:{wood:3,stone:2},req:1,xp:40},{k:'can',t:1,name:'Watering can',c:{wood:2,stone:3},req:1,xp:40},{k:'rod',t:1,name:'Fishing rod',c:{wood:4,iron:1},req:3,xp:40});
const canC=r=>lvOf(6)>=r.req&&Object.entries(r.c).every(([a,b])=>(inv[a]||0)>=b);
function craft(r){if(!canC(r)){say(lvOf(6)<r.req?'Need Crafting '+r.req:'Missing materials');return}for(const a in r.c)inv[a]-=r.c[a];TL[r.k]=r.t;say('Crafted '+r.name);addXp(6,r.xp);rPn()}
// panel
const st4=document.createElement('style');st4.textContent='#pn{position:fixed;inset:0;z-index:20;display:none;background:rgba(10,14,28,.97);overflow:auto;padding:calc(env(safe-area-inset-top,0px) + 14px) 14px calc(env(safe-area-inset-bottom,0px) + 24px);touch-action:pan-y;color:#f4f0d8;font-family:"SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace}.pc{max-width:380px;margin:0 auto}.pt{display:flex;gap:8px;margin-bottom:12px}.pt button{flex:1;padding:10px;border-radius:8px;border:2px solid rgba(244,240,216,.5);background:#223;color:#f4f0d8;font:700 14px "SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace}.pt button.on{background:#38a828;border-color:#f4f0d8}.pt #px{flex:none;width:48px}.tl{text-align:center;margin:6px 0 10px;font-weight:700}.sg{display:grid;grid-template-columns:1fr 1fr;gap:10px}.sk{border:2px solid rgba(244,240,216,.35);border-radius:8px;padding:8px;background:#161d30}.sk b{display:block;font-size:26px;margin:2px 0}.sk small{opacity:.6;font-size:11px}.br{height:6px;background:#000;border-radius:3px;overflow:hidden;margin:4px 0}.br i{display:block;height:100%}.rc{display:block;width:100%;margin:8px 0;padding:12px;text-align:left;border-radius:8px;border:2px solid #f4f0d8;background:#2a6a22;color:#fff;font:700 14px "SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace}.rc small{font-weight:400;opacity:.85}#pb2{position:fixed;z-index:10;right:14px;top:calc(env(safe-area-inset-top,0px) + 138px);width:44px;height:44px;border-radius:10px;border:2px solid rgba(244,240,216,.6);background:rgba(244,240,216,.18);font-size:20px;color:#fff}';document.head.appendChild(st4);
const pn=document.createElement('div');pn.id='pn';pn.innerHTML='<div class="pc"><div class="pt"><button id="t0" class="on">Skills</button><button id="t1">Craft</button><button id="px">✕</button></div><div id="pbd"></div></div>';document.body.appendChild(pn);
const pb2=document.createElement('button');pb2.id='pb2';pb2.textContent='📊';document.body.appendChild(pb2);
let ptab=0;const pbd=document.getElementById('pbd');
function rPn(){document.getElementById('t0').className=ptab?'':'on';document.getElementById('t1').className=ptab?'on':'';let h='';
 if(!ptab){let tot=0,s='';for(let i=0;i<SKN.length;i++){const l=lvOf(i);tot+=l;const b=XT[l-1],n=l<99?XT[l]:b+1,p=l<99?Math.min(100,(XPS[i]-b)/(n-b)*100):100;s+='<div class="sk"><div style="color:'+SKC[i]+'">'+SKN[i]+'</div><b>'+l+'<small>/99</small></b><div class="br"><i style="width:'+p+'%;background:'+SKC[i]+'"></i></div><small>'+Math.floor(XPS[i])+' xp</small></div>'}h='<div class="tl">Total level: '+tot+'</div><div class="sg">'+s+'</div>'}
 else{h='<div class="tl">Wood '+inv.wood+' · Stone '+inv.stone+' · Iron '+(inv.iron||0)+'</div><div class="tl" style="font-size:12px;font-weight:400;opacity:.8">Axe: '+tierName('axe')+' · Pickaxe: '+tierName('pick')+' · Sword: '+tierName('sword')+'<br>Crafting level '+lvOf(6)+'</div>';
  for(const k of['axe','pick','sword']){const t=TL[k]+1;if(t>3)continue;const i=REC.findIndex(x=>x.k==k&&x.t==t),r=REC[i];h+='<button class="rc" data-i="'+i+'" style="opacity:'+(canC(r)?1:.45)+'">'+r.name+'<br><small>'+Object.entries(r.c).map(([a,b])=>b+' '+a).join(', ')+' · Crafting '+r.req+'</small></button>'}
  for(const k of['hoe','can','rod']){if(TL[k]||(inv['eq_'+k]|0)>0)continue;const i=REC.findIndex(x=>x.k==k),r=REC[i];h+='<button class="rc" data-i="'+i+'" style="opacity:'+(canC(r)?1:.45)+'">'+r.name+'<br><small>'+Object.entries(r.c).map(([a,b])=>b+' '+a).join(', ')+' · Crafting '+r.req+' · '+(k==='rod'?'for fishing':'for farming')+'</small></button>'}
  h+='<div class="tl" style="font-size:11px;font-weight:400;opacity:.65;margin-top:14px">Better tools hit harder. Rocks need a pickaxe; iron ore needs Mining 15 + a stone pickaxe.</div>'}
 pbd.innerHTML=h}
pbd.onclick=e=>{const b=e.target.closest('.rc');if(b)craft(REC[+b.dataset.i])};
document.getElementById('t0').onclick=()=>{ptab=0;rPn()};document.getElementById('t1').onclick=()=>{ptab=1;rPn()};
document.getElementById('px').onclick=()=>{pnOpen=false;pn.style.display='none'};
pb2.onclick=()=>{pnOpen=true;jx=jy=0;pn.style.display='block';rPn()};
const _u2=upd;upd=function(dt){if(!pnOpen)_u2(dt)};
function drawDrops(){g.save();g.font='700 4.5px "SQ Digits","Pixelify Sans",ui-monospace,Menlo,monospace';g.textAlign='center';g.lineWidth=1.3;g.lineJoin='round';
 for(const d of drops){d.t+=.016;g.globalAlpha=Math.max(0,1-d.t/1.6);const y=Math.round(P.y-16-d.t*14-(d.y-P.y+16)*0),x=Math.round(d.x);g.strokeStyle='#000';g.strokeText(d.tx,x,Math.round(d.y-d.t*14));g.fillStyle=d.c;g.fillText(d.tx,x,Math.round(d.y-d.t*14))}
 g.restore();drops=drops.filter(d=>d.t<1.6)}
const _nd=NEWDRAW;NEWDRAW=function(...a){_nd(...a);drawDrops()};
