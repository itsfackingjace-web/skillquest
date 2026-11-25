// Nov 24 (Jace): "people's movement speed immediately after chopping a tree is reduced". You walk at 35 instead of 55 while a swing runs
// (001), and since 287 a chop's swing lasts the whole chop (1 s at first), so walking away from a tree crawled for a second. Now a chop
// slows you only for its first 0.25 s (like a sword swing, and like chops before), while the next HIT still waits for the whole chop.
module.exports={name:'a chop slows your walk for 0.25 s, the next chop still waits for the whole chop',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);try{if(pnOpen)closePanel()}catch(e){}en=[];const o={};
  const walk=secs=>{const x0=P.x,y0=P.y;K.d=1;const n=Math.round(secs*60);for(let k=0;k<n;k++)upd(1/60);K.d=0;return Math.round(Math.hypot(P.x-x0,P.y-y0))};
  const sx=P.x,sy=P.y,home=()=>{P.x=sx;P.y=sy;face=[0,1]};
  home();swing=0;o.free=walk(1);
  // a plain tree, wooden axe, Woodcutting 1: a 1 s chop that doesn't fell it
  home();const[fx,fy]=front(13),i=Math.floor(fy/16)*N+Math.floor(fx/16);TL.axe=1;XPS[1]=0;PERKS[1]={};obj[i]={t:'tree',hp:OHP.tree};swing=0;attack();
  o.chop=Math.round(swing*100)/100;o.stand=!!(obj[i]&&obj[i].hp>0);o.half=walk(.5);o.left=Math.round(swing*100)/100;
  const hp=obj[i]&&obj[i].hp;home();attack();o.waits=obj[i]&&obj[i].hp===hp;
  // a sword swing still slows the same 0.25 s
  obj[i]=null;home();swing=0;attack();o.sword=Math.round(swing*100)/100;o.swordWalk=walk(1);
  return o});
 t.eq(r.free,55,'walking for 1 s with nothing going on: 55 px');
 t.eq([r.chop,r.stand],[1,true],'a 1 s chop that leaves the tree standing');
 t(Math.abs(r.half-(.25*35+.25*55))<=2,'the first half second after the chop: slowed for 0.25 s only ('+r.half+' px, was '+Math.round(.5*35)+')');
 t(r.left>.4&&r.left<.6,'the chop is still running ('+r.left+' s left)');t(r.waits,'and HIT does not chop again until it ends');
 t.eq(r.sword,.25,'a sword swing at nothing takes 0.25 s');t(Math.abs(r.swordWalk-(.25*35+.75*55))<=2,'and slows you for those 0.25 s ('+r.swordWalk+' px)')}};
