// Nov 23 (Jace: Davy, a ghost pirate pet, "make it a lot better"): a pet look with gh:1 floats like a ghost: a faint smaller shadow,
// drawn a little higher with a gentle hover, and at night outdoors a soft glow drawn after the night tint (so it lights up). The Dev
// Suite's Pets editor has a checkbox for it and keeps it in the saved look.
module.exports={name:'ghost pets: floating look, night glow, and the Pets editor keeps the setting',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);const out={};
  const fr={w:4,h:4,s:2,p:'#ffffff99',r:SQA.pack('0000000000000000')},look={w:4,h:4,s:2,ox:-2,oy:-4,a:fr,b:fr,c:fr,d:fr};
  // where a look is drawn, with and without gh
  const spy=()=>{const calls=[];const _d=g.drawImage;g.drawImage=function(...a){calls.push([a[0]&&a[0].width,a[2],g.globalAlpha]);return _d.apply(this,a)};return()=>{g.drawImage=_d;return calls}};
  let done=spy();SQA.drawPetLook('x',{x:100,y:100,mv:0},look);const plain=done();
  done=spy();SQA.drawPetLook('x',{x:100,y:100,mv:0},{...look,gh:1});const ghost=done();
  // the last picture drawn is the pet (8 px wide at s 2); anything before it is its shadow
  const spr=c=>c.filter(q=>q[0]===8).map(q=>q[1]),sh=c=>c.filter(q=>q[0]!==8).map(q=>q[2]);out.plainY=spr(plain);out.ghostY=spr(ghost);out.shd=[sh(plain),sh(ghost)];
  // at night outdoors the glow is drawn after the tint (the HUD step), only for gh looks
  try{SQMP.on=false}catch(e){}const T0=time;time=DAYLIGHT+(DAYLEN-DAYLIGHT)/2;let lit=0;const _cg=g.createRadialGradient;g.createRadialGradient=function(...a){const G=_cg.apply(this,a),_a=G.addColorStop;G.addColorStop=function(o,c){if(/140,255,220/.test(c)&&o===0)lit++;return _a.call(this,o,c)};return G};
  SQA.preview({pets:{dog:{...look,gh:1}}});inv.pet_dog=1;LUX.COS.pet='dog';await W(500);const n1=lit;SQA.preview({pets:{dog:look}});await W(400);const n2=lit;g.createRadialGradient=_cg;time=T0;
  out.glow=[n1>0,n2-n1<=1];out.lit=[n1,n2];
  // the Pets editor: the checkbox shows the setting and saving keeps it
  window.SQDEV=()=>true;SQSUITE.open();await W(700);const S=SQSUITE.state,q=s=>document.querySelector('#dvs '+s);S.draft.pets=S.draft.pets||{};S.draft.pets.dog={...look,gh:1};
  q('[data-tab="pets"]').click();await W(300);const it=q('[data-k="pet_dog"]');if(!it)return Object.assign(out,{err:'no dog in the Pets list'});it.click();for(let k=0;k<30&&!(S.ed&&S.ed.kind==='pet');k++)await W(100);
  const cb=()=>q('[data-a="pgh"]');out.box=!!cb()&&cb().checked;cb().click();await W(100);out.off=[S.ed.gh,cb().checked];
  q('[data-a="save"]').click();await W(300);out.savedOff=S.draft.pets.dog&&S.draft.pets.dog.gh;cb().click();await W(100);q('[data-a="save"]').click();await W(300);out.savedOn=S.draft.pets.dog&&S.draft.pets.dog.gh;
  SQSUITE.close();return out});
 if(r.err)return t(false,r.err);
 t.eq(r.plainY.length&&r.ghostY.length?r.ghostY[0]<r.plainY[0]:null,true,'a ghost is drawn higher than a plain pet: '+r.plainY+' / '+r.ghostY);
 t(r.shd[0].length===1&&r.shd[1].length===1&&r.shd[1][0]<.5&&r.shd[0][0]===1,'a ghost\'s shadow is faint: '+JSON.stringify(r.shd));
 t.eq(r.glow,[true,true],'at night a ghost pet glows, a plain one doesn\'t '+JSON.stringify(r.lit));
 t.eq([r.box,r.off[0],r.off[1]],[true,0,false],'the Pets editor shows "Floats like a ghost" ticked, and it can be turned off');
 t.eq([r.savedOff,r.savedOn],[undefined,1],'saving keeps the setting [off, on again]')}};
