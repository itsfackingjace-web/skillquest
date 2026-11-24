// Nov 23 (Amethyst): after the World Market, the bag, equipping and the player screen stopped responding until a relog. The ✕
// hides the panel without closePanel, so shop stayed 'wmkt' and 079's click handler swallowed every click in the panel.
module.exports={name:'after closing the World Market with the X, the bag and EQUIP still work',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(1200);try{if(pnOpen)closePanel()}catch(e){}const out={};
  if(typeof SQWMOPEN!=='function')return{err:'no SQWMOPEN'};inv.eq_sword3=1;XPS[0]=XT[30];
  SQWMOPEN();await W(600);out.open=[pnOpen,ptab];document.getElementById('px').click();await W(200);out.closed=[pnOpen,shop];
  pnOpen=true;ptab=4;pn.style.display='block';rPn();await W(200);const s=[...pbd.querySelectorAll('[data-k],.slot,.bs')].find(e=>/eq_sword3/.test(e.outerHTML));if(s)s.click();await W(200);
  const b=pbd.querySelector('.eqi');out.btn=!!b;if(b)b.click();await W(200);out.main=occ('main');closePanel();return out});
 if(r.err)return t(false,r.err);
 t.eq(r.open,[true,2],'the market opened');t.eq(r.closed,[false,null],'the X closed it and forgot the market');
 t.eq([r.btn,r.main],[true,'eq_sword3'],'the bag still equips the iron sword')}};
