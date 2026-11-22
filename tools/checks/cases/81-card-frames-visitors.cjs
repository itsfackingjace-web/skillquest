// Nov 21: visitors saw an empty stand on someone else's card frame (the shared furniture rows didn't carry the card). Ann frames the
// dragon card; Bob's copy of her house has it, and drawing the frame in her house on Bob's screen draws the card.
module.exports={name:'visitors see the card on someone\'s card frame',players:2,async run([A,B],t){
 const W=ms=>A.waitForTimeout(ms);
 const a=await A.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);
  let ok=false;const x0=P.x,y0=P.y;for(let rr=4;rr<60&&!ok;rr+=3)for(let k=0;k<16&&!ok;k++){P.x=x0+Math.cos(k/16*6.283)*rr*16;P.y=y0+Math.sin(k/16*6.283)*rr*16;if(houseFits())ok=true}
  if(!ok)return{err:'no room for a house'};inv.house=1;startBuild('house');placeBuild();if(typeof BUILD!=='undefined'&&BUILD)endBuild();const h=HOUSES.find(o=>!o._foreign);if(!h)return{err:'no house'};
  enterScene('home',h,{x:h.x*16+8,y:(h.y+1)*16+6});await W(300);const R=SCENE.room;face=[0,-1];const[fx,fy]=frontTile();const i=fy*R.w+fx;h.furn.set(i,{t:'cardframe'});
  inv.dc_wb_dragon=1;SQCARDFRAME.putUp(h,i,'dc_wb_dragon');try{leaveScene()}catch(e){}return{uid:SQMP.user.uid,i,x:fx,y:fy}});
 if(a.err){t(false,a.err);return}
 // Ann lets Bob in (her friends list: friends/<ann>/<bob>), as a visit needs
 const bu=await B.evaluate(()=>SQMP.user.uid);await A.evaluate(u=>{const F=SQFB,d=F.db;return d.set(d.ref(F.D,'friends/'+SQMP.user.uid+'/'+u),true)},bu);
 const b=await B.evaluate(async(a)=>{const W=ms=>new Promise(r=>setTimeout(r,ms));let fh=null;
  for(let k=0;k<60&&!fh;k++){await W(300);fh=HOUSES.find(h=>h._foreign&&h._owner===a.uid)}if(!fh)return{err:'Ann\'s house never reached Bob'};
  let fr=null;for(let k=0;k<40;k++){fr=fh.furn.get(a.i);if(fr&&fr.card)break;await W(300)}
  for(let k=0;k<20&&!(SCENE&&SCENE.house===fh);k++){enterScene('home',fh,{x:fh.x*16+8,y:(fh.y+1)*16+6});await W(300)}if(!(SCENE&&SCENE.house===fh))return{err:'Bob couldn\'t go into Ann\'s house'};
  let n=0;const _di=g.drawImage;g.drawImage=function(){if(arguments[3]===14&&arguments[4]===14)n++;return _di.apply(this,arguments)};try{for(let k=0;k<10&&!n;k++){drawPiece('cardframe',a.x,a.y,fh.furn.get(a.i),false,0);if(!n)await W(200)}}finally{g.drawImage=_di}// the card's picture loads on first use
  try{leaveScene()}catch(e){}return{card:fr&&fr.card||null,drawn:n}},a);
 if(b.err){t(false,b.err);return}
 t.eq(b.card,'dc_wb_dragon','the card on Ann\'s frame in Bob\'s copy of her house');t(b.drawn>0,'Bob\'s game drew an empty stand')}};
