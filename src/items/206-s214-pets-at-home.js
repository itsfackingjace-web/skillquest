// ---- 214. Pets at home: place pets in your house, castle or backyard for visitors to see ----
// Every pet item (104's pet_<kind>) becomes a building kind (BK), so the bag shows PLACE for it and every home loader
// (012 houses, 067 island homes, 077 castles, 145 yards, 061/145 what visitors read) keeps it like any furniture row
// [i, 'pet_<kind>']. Placed pets are drawn by the outermost drawPiece through the game's own pet drawers (LUX.drawPeerPet:
// 085 shop pets, 093 rare pets, 111a Dev Suite looks; the Imp through SQIMPDRAW), walking around a little in their spot.
// HIT on a placed pet pets it (a hop and a heart; visitors can too); the owner's second HIT within 3 s picks it up.
(()=>{const isPet=t=>typeof t==='string'&&t.startsWith('pet_')&&EQ[t]&&EQ[t].slot==='pet';
 const TXT=' Tap PLACE in your bag while you\'re in your house, castle or backyard and it stays there for visitors to see.';
 function addKeys(){for(const k in EQ)if(isPet(k)&&!BK.includes(k)){BK.push(k);if(typeof IDESC[k]==='string'&&IDESC[k].indexOf(TXT)<0)IDESC[k]+=TXT}}
 addKeys();if(window.SQA&&SQA.onApply)SQA.onApply(addKeys);
 const home=()=>SCENE&&SCENE.id==='home'&&SCENE.house;
 const mine=h=>!!h&&!h._foreign&&!h.ro&&!(h.base&&h.base._foreign);
 const hid=h=>(h&&(h._oid||h.id))||'?';
 // ---- wandering ----
 const W=new Map(),JOY=new Map();
 function spot(key,cx,cy){const now=performance.now();let w=W.get(key);
  if(!w||w.cx!==cx||w.cy!==cy){w={cx,cy,tx:cx,ty:cy,next:now+800+Math.random()*2500};W.set(key,w)}
  if(now>=w.next){if(Math.random()<.35){w.tx=cx;w.ty=cy}else{w.tx=cx+Math.round((Math.random()*2-1)*12);w.ty=cy+Math.round((Math.random()*2-1)*5)}w.next=now+2000+Math.random()*3500}
  return w}
 function heart(x,y,a){g.save();g.globalAlpha=a;const R=(dx,dy,w,h,c)=>{g.fillStyle=c;g.fillRect(x+dx,y+dy,w,h)};
  R(-3,-1,2,1,'#3a1018');R(1,-1,2,1,'#3a1018');R(-4,0,8,2,'#3a1018');R(-3,2,6,1,'#3a1018');R(-2,3,4,1,'#3a1018');R(-1,4,2,1,'#3a1018');
  R(-3,0,2,2,'#f04868');R(1,0,2,2,'#f04868');R(-2,2,4,1,'#f04868');R(-1,3,2,1,'#f04868');R(-1,1,2,1,'#f04868');R(-3,0,1,1,'#ffb0c0');g.restore()}
 function drawPetAt(kind,key,px,py,tm,still){
  if(kind==='imp'){if(window.SQIMPDRAW)SQIMPDRAW(Math.round(px),Math.round(py));return}
  if(!(window.LUX&&LUX.drawPeerPet))return;
  // the drawers walk a pet toward a spot behind its "owner": side-facing, that spot is about (x-17, y+6)
  LUX.drawPeerPet({pet:kind,uid:key,x:px+17,y:py-6,d:2,fl:0,sl:0,loc:''},tm)}
 {const _dp=drawPiece;drawPiece=function(t,x,y,f,ghost,tm){if(!isPet(t))return _dp.apply(this,arguments);
   try{const kind=EQ[t].pet,cx=x*16+8,cy=y*16+6;
    if(ghost){drawPetAt(kind,'ypet:ghost',cx,cy,tm,true);return}
    const h=home(),key='ypet:'+hid(h)+':'+(y*(SCENE&&SCENE.room?SCENE.room.w:N)+x),w=spot(key,cx,cy),j=JOY.get(key),now=performance.now();
    let hop=0;if(j&&now-j<900){const p=(now-j)/900;hop=Math.round(Math.abs(Math.sin(p*Math.PI*3))*4*(1-p))}
    drawPetAt(kind,key,w.tx,w.ty-hop,tm,false);
    if(j&&now-j<1400){const p=(now-j)/1400;heart(Math.round(w.tx),Math.round(w.ty-14-p*8),1-p*p)}else if(j)JOY.delete(key)}catch(e){}}}
 // ---- HIT: pet it; the owner's second HIT picks it up ----
 let arm=null;
 function front(){const h=home();if(!h)return null;const R=SCENE.room,[x,y]=frontTile(),i=y*R.w+x,f=h.furn&&h.furn.get(i);return f&&isPet(f.t)?{h,i,f,R}:null}
 {const _a=attack;attack=function(){try{if(!dead&&!menuOpen&&!pnOpen&&!BUILD&&swing<=0){const o=front();if(o){swing=.25;const name=EQ[o.f.t].n,key='ypet:'+hid(o.h)+':'+o.i,now=performance.now();
     if(mine(o.h)&&arm&&arm.i===o.i&&arm.h===o.h&&now-arm.at<3000){arm=null;pickFurn(o.i);say('Your '+name.toLowerCase()+' hops back into your bag.');return}
     JOY.set(key,now);try{sfx('talk')}catch(e){}
     if(mine(o.h)){arm={i:o.i,h:o.h,at:now};say('You pet your '+name.toLowerCase()+'. Hit it again to pick it up.')}else say('You pet the '+name.toLowerCase()+'. It looks very pleased.');
     return}}}catch(e){console.warn(e)}return _a.apply(this,arguments)}}
 window.SQHOMEPETS={isPet,armed:()=>arm&&performance.now()-arm.at<3000?arm:null,front,addKeys}})();
