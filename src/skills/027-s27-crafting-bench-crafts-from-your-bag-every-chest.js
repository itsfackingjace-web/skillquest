// ---------------------------------------------------------------- 27. Crafting bench (crafts from your bag + every chest in the house)
// Place it in your house and use it: the Craft list opens, and materials are taken from your bag first, then
// from the chests in that house. Outdoors it uses chests within a few steps instead.
const BENCH_REC={k:'bench',n:'Crafting bench',c:{wood:15,stone:4},req:2,xp:40,hp:3};
STNS.push({...BENCH_REC,d:'Craft anything in the Craft list using materials from your bag and every chest in the house.'});STN.add('bench');
BREC.push({k:'bench',n:'Crafting bench',c:BENCH_REC.c,req:BENCH_REC.req,xp:BENCH_REC.xp,hp:BENCH_REC.hp});BK.push('bench');BHP.bench=3;INVK.push('bench');INAME.bench='Crafting bench';
IDESC.bench='Place it in your house, face it and press HIT or USE: craft anything using materials from your bag AND every chest in the house. Outdoors it uses chests within a few steps.';
let BENCH=null,BMERGE=null;
function benchChests(o){const out=[];if(!o)return out;
 if(o.inside){const h=SCENE&&SCENE.house;if(h)for(const f of h.furn.values())if(f.t==='chest'){f.items=f.items||{};out.push(f.items)}}
 else{const bx=o.i%N,by=(o.i/N)|0;for(const[i,s]of STR)if(s.t==='chest'&&Math.abs(i%N-bx)<=6&&Math.abs(((i/N)|0)-by)<=6){s.items=s.items||{};out.push(s.items)}}return out}
// merge chest contents into the bag while crafting, then put back what wasn't used (bag is used first)
function benchMerge(){if(BMERGE||!BENCH)return false;const chests=benchChests(BENCH),tot={};for(const c of chests)for(const k in c)if(c[k]>0)tot[k]=(tot[k]||0)+c[k];
 const bag={};for(const k in tot){bag[k]=inv[k]|0;inv[k]=bag[k]+tot[k]}BMERGE={chests,tot,bag};return true}
function benchSplit(){const M=BMERGE;if(!M)return;BMERGE=null;
 for(const k in M.tot){const now=inv[k]|0,before=M.bag[k]+M.tot[k];
  if(now>=before){inv[k]=M.bag[k]+(now-before);continue}                // nothing used (maybe some was made)
  let used=before-now;const fromBag=Math.min(M.bag[k],used);inv[k]=M.bag[k]-fromBag;used-=fromBag;
  for(const c of M.chests){if(used<=0)break;const t=Math.min(c[k]|0,used);c[k]=(c[k]|0)-t;used-=t;if(!c[k])delete c[k]}}}
function withChests(fn){const m=benchMerge();try{fn()}finally{if(m)benchSplit()}}
const _os27=openStation;openStation=function(o){if(!o||o.t!=='bench')return _os27(o);BENCH=o;shop=null;fromMenu=false;pnOpen=true;ptab=1;jx=jy=0;pn.style.display='block';rPn();sfx('talk')};
const _r27=rPn;rPn=function(){if(!(BENCH&&ptab===1&&pn.style.display!=='none'))return _r27();
 const m=benchMerge();try{_r27()}finally{if(m)benchSplit()}
 document.getElementById('t0').style.display='none';document.getElementById('t1').style.display='none';ptt.textContent='CRAFTING BENCH';
 const n=benchChests(BENCH).length;pbd.insertAdjacentHTML('afterbegin','<div class="qc" style="margin-bottom:8px;font-size:13px"><b>Crafting bench</b><p>Using your bag'+(n?' and '+n+' chest'+(n>1?'s':'')+(BENCH.inside?' in this house':' nearby'):'. Put chests '+(BENCH.inside?'in this house':'next to the bench')+' to use their materials too')+'. Your bag is used first.</p></div>');
 pbd.insertAdjacentHTML('beforeend','<button class="ng stb2" data-a="pickup" style="margin-top:16px">Pick up this crafting bench</button>')};
const _oc27=pbd.onclick;pbd.onclick=e=>{
 if(BENCH){if(e.target.closest('.stb2')){const o=BENCH;BENCH=null;closePanel();if(o.inside)pickFurn(o.i);else pickStruct(o.i);return}
  if(e.target.closest('.rc,.gc,.fc')){withChests(()=>_oc27(e));saveLocal(true);rPn();return}}
 _oc27(e)};
const _cp27=closePanel;closePanel=function(){_cp27();BENCH=null};
const _bs27=backScreen;backScreen=function(){if(BENCH){closePanel();return}_bs27()};
// tabs: leaving the Craft list ends bench mode
document.getElementById('t0').addEventListener('click',()=>{BENCH=null},true);
document.getElementById('px').addEventListener('click',()=>{BENCH=null},true);
// art + icon
const _dst27=drawStation;drawStation=function(t,x,y,st,tm){if(t!=='bench')return _dst27(t,x,y,st,tm);const x0=x*16,y0=y*16;shd(x0+8,y0+14,16);
 Rg(x0,y0-2,16,9,O);Rg(x0+1,y0-1,14,5,'#c89858');Rg(x0+1,y0-1,14,1,'#e8c088');Rg(x0+1,y0+4,14,2,'#9a6c3c');Rg(x0+2,y0+6,2,9,O);Rg(x0+12,y0+6,2,9,O);Rg(x0+2,y0+11,12,2,O);
 Rg(x0+3,y0-4,6,2,'#a8b0b8');Rg(x0+3,y0-4,1,3,'#7a4a20');Rg(x0+10,y0-6,2,5,'#7a4a20');Rg(x0+9,y0-7,4,2,'#808890')};
const _icon27=iconURL;iconURL=function(k,col){if(k!=='bench')return _icon27(k,col);const key='g27bench';if(ICONC[key])return ICONC[key];const c=document.createElement('canvas');c.width=14;c.height=14;const x=c.getContext('2d'),r=(a,b,w,h,cl)=>{x.fillStyle=cl;x.fillRect(a,b,w,h)};
 r(1,5,12,3,'#c89858');r(1,8,12,1,'#9a6c3c');r(2,9,2,4,'#7a4a20');r(10,9,2,4,'#7a4a20');r(3,3,4,2,'#a8b0b8');r(9,1,2,4,'#7a4a20');r(8,1,4,1,'#808890');return ICONC[key]=c.toDataURL()};
