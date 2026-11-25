// Nov 25 (Jace): "can we make it so that players' total level is next to their name? both on their screens where their health and
// everything is, and above their heads? Like I want people who walk past me to see 'Jace Lv.987'". 061 sends the total level with
// presence (tl, only when it changes), draws "<name> [<total>]" over heads (the level in gold), and 010's status box shows "Lv.<total>" after your name.
module.exports={name:'total level after the name: over heads for others, and in your status box',players:2,async run([A,B],t){
 const W=ms=>A.waitForTimeout(ms);
 const pos=await A.evaluate(()=>({x:P.x,y:P.y}));await B.evaluate(p=>{P.x=p.x-56;P.y=p.y+2},pos);
 const ids=[await A.evaluate(()=>SQMP.user.uid),await B.evaluate(()=>SQMP.user.uid)];
 for(let i=0;i<40;i++){const ok=await A.evaluate(u=>!!SQMP.players.get(u),ids[1])&&await B.evaluate(u=>!!SQMP.players.get(u),ids[0]);if(ok)break;await W(300)}
 const tot=await A.evaluate(()=>{try{if(pnOpen)closePanel()}catch(e){}for(let i=0;i<XPS.length;i++)XPS[i]=XT[(i%3?60:90)-1];return lvTot()});
 let tl=0;for(let i=0;i<30;i++){tl=await B.evaluate(u=>{const r=SQMP.players.get(u);return r&&r.tl},ids[0]);if(tl===tot)break;await W(250)}
 t.eq(tl,tot,'Bob gets Ann\'s total level ('+tot+') with her presence');
 const drawn=P=>P.evaluate(async()=>{const seen=new Set(),C=CanvasRenderingContext2D.prototype,f=C.fillText;C.fillText=function(s){seen.add(String(s));return f.apply(this,arguments)};await new Promise(r=>setTimeout(r,500));C.fillText=f;return[...seen]});
 const nm=await B.evaluate(u=>SQMP.players.get(u).n,ids[0]),bs=await drawn(B);
 t(bs.includes(nm)&&bs.includes('['+tot+']'),'Bob sees "'+nm+' ['+tot+']" over Ann\'s head');
 const as=await drawn(A);t(as.includes('Lv.'+tot),'Ann\'s status box shows Lv.'+tot+' after her name');
 // a player on an older version sends no level: just the name
 await B.evaluate(u=>{const r=SQMP.players.get(u);r.tl=0;r._old=1},ids[0]);const bs2=await B.evaluate(async()=>{const seen=new Set(),C=CanvasRenderingContext2D.prototype,f=C.fillText;C.fillText=function(s){seen.add(String(s));return f.apply(this,arguments)};await new Promise(r=>setTimeout(r,300));C.fillText=f;return[...seen]});
 t(bs2.includes(nm)&&!bs2.some(s=>/^\[\d+\]$/.test(s)),'no level for a player whose game sends none')}};
