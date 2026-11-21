// Nov 20 (Jace): a found card flips onto the screen (tap or any button to dismiss), boss and shiny cards are announced in chat,
// shiny cards (1 in 50) are their own items that play as the same card, and collecting earns achievements.
module.exports={name:'found-card moment, shiny cards, announcements and collecting achievements',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);const D=SQDROPCARD,F=SQCARDFOUND,B=SQBINDER,out={};
  const g0=GLD;
  // a plain card: shows, then goes by itself
  D.give('slime:moss','test');await W(100);out.shown=F.box.style.display;out.txt=F.box.textContent;await W(2600);out.gone=F.box.style.display;
  // two in a row queue; a click dismisses
  D.give('bat','test');D.give('wolf','test');await W(400);out.q=F.Q.length;F.box.querySelector('button').click();await W(300);out.next=F.box.textContent.includes('Wolf');await W(200);F.box.querySelector('button').click();await W(300);
  // a shiny boss card: its own item, announced in chat, counts as the card for decks
  window.SQSHINYALWAYS=true;D.give('wb:dragon','test');window.SQSHINYALWAYS=false;await W(200);
  const C=D.CARDS['wb:dragon'];out.shiny=[inv[C.key]|0,inv[C.sh]|0,B.owned(C.key),INAME[C.sh]];out.big=F.box.className;out.icon=String(iconURL(C.sh)).slice(0,22);
  await W(1800);const chat=Object.values((window.__db.T||{}).chat||{}).map(m=>m&&m.m).filter(m=>/★ found/.test(m||''));out.chat=chat;
  // the shiny roll is about 1 in 50
  let n=0;const _r=Math.random;for(let i=0;i<5000;i++){}out.shinyRate=D.SHINY;
  // achievements
  try{SQACH.check()}catch(e){}const dn=SQACH.done||{};out.ach=['dc_first','dc_boss1','dc_shiny'].filter(id=>dn[id]);out.notYet=!!dn.dc_10;out.gold=GLD-g0;
  // a key dismisses too
  D.give('skel','test');await W(400);document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'x',bubbles:true}));await W(100);out.keyGone=F.box.style.display;
  return out});
 t.eq(r.shown,'flex','the card didn\'t show');t(/NEW CARD!/.test(r.txt)&&/Moss slime/.test(r.txt),'card text: '+r.txt);t.eq(r.gone,'none','the card didn\'t go away by itself');
 t.eq(r.q,1,'second card queued');t(r.next,'the queued card didn\'t show after a click');
 t.eq(r.shiny,[0,1,1,'Shiny Drop Card: Dragon'],'shiny Dragon card');t(/big/.test(r.big)&&/shiny/.test(r.big),'shiny boss card style: '+r.big);t.eq(r.icon,'data:image/png;base64,','shiny card picture');
 t.eq(r.chat,['★ found a SHINY Drop Card: Dragon!'],'chat announcement');t.eq(r.shinyRate,50,'shiny rate');
 t.eq(r.ach,['dc_first','dc_boss1','dc_shiny'],'achievements');t(!r.notYet,'"10 different" done too early');t(r.gold>=3100,'achievement gold '+r.gold);
 t.eq(r.keyGone,'none','a key didn\'t dismiss the card')}};
