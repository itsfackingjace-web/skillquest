// Nov 20 (Jace): you can feed another player's campfire. It quietly becomes yours (shared with tk = the old owner), so it keeps
// burning when they log out; the old owner's game drops its own copy when it sees that.
module.exports={name:'feeding another player\'s fire takes it over',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);
  const M=window.SQMP,F=window.SQFB,l=mpLoc(),key=String(l).replace(/[.#$\[\]\/:]/g,'_'),me=M.user.uid;
  // another player (A) stands here with a fire right in front of us
  M.players.set('A',{n:'Ann',ch:{sk:2,hs:0,hc:0,sh:1,pn:1,ht:1,hcol:4,so:0},d:'s',fl:false,loc:l,x:P.x+40,y:P.y,tx:P.x+40,ty:P.y,seen:performance.now()+1e9});
  const[fx,fy]=front(14);window.__remote('fires/'+key+'/A',{t:Date.now(),f:[{x:Math.round(fx),y:Math.round(fy),life:200}]});
  await W(800);const prox=fires.filter(f=>f._rp).length;
  inv.oaklog=2;XPS[5]=Math.max(XPS[5]|0,20000);
  // F opens the campfire screen with this fire; feed one oak log
  fire();await W(200);const txt=pbd.innerText;const b=document.querySelector('[data-fmf="1"]');if(b)b.click();await W(300);closePanel();
  const mine=fires.filter(f=>!f._rp&&f.life>0),prox2=fires.filter(f=>f._rp).length;
  await W(2600);const pub=(await F.db.get(F.db.ref(F.D,'fires/'+key+'/'+me))).val();
  // the other way round: B takes over our fire
  const own=mine[0];window.__remote('fires/'+key+'/B',{t:Date.now(),f:[{x:Math.round(own.x),y:Math.round(own.y),life:900,tk:me}]});await W(600);
  const after=fires.filter(f=>!f._rp&&f.life>0).length,shown=fires.filter(f=>f._rp&&Math.abs(f.x-own.x)<10).length;
  return{prox,txt:/This fire has/.test(txt),mine:mine.length,life:own&&own.life,prox2,pub:pub&&pub.f,after,shown}});
 t.eq(r.prox,1,'the other player\'s fire shown');t(r.txt,'the campfire screen didn\'t offer to feed the other player\'s fire');
 t.eq(r.mine,1,'fires of ours after feeding');t(r.life>200,'the fed fire didn\'t burn longer ('+r.life+')');t.eq(r.prox2,0,'the old owner\'s copy still shown');
 t(r.pub&&r.pub[0]&&r.pub[0].tk==='A','the shared fire doesn\'t say whose it was: '+JSON.stringify(r.pub));
 t.eq(r.after,0,'our copy after someone else took the fire over');t.eq(r.shown,1,'their copy shown')}};
