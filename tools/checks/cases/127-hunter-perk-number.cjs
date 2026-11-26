// Nov 26 (Kevin, in-game report: "Wolf damage perk on bow does a separate 2 damage, it does not add to total bow damage"): Archery's Hunter
// perk (+2 arrow damage against wolves) showed its own "2" next to the arrow's number. The two now show as one number.
module.exports={name:'Hunter perk: an arrow into a wolf shows one number, the arrow damage + 2',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(500);try{if(pnOpen)closePanel()}catch(e){}en=[];{const x0=P.x,y0=P.y,free=(x,y)=>{const i=Math.floor(y/16)*N+Math.floor(x/16);return(tile[i]===2||tile[i]===1)&&!BS.has(i)&&!obj[i]},ok=(x,y)=>[0,16,32,48,64].every(d=>free(x+d,y))&&free(x,y+13)&&!NPCS.some(n=>!n.scene&&Math.hypot(n.x-x,n.y-y)<260);let done=false;for(let rr=18;rr<80&&!done;rr+=4)for(let a=0;a<16&&!done;a++){const x=x0+Math.cos(a/16*6.283)*rr*16,y=y0+Math.sin(a/16*6.283)*rr*16;if(ok(x,y)){P.x=x;P.y=y;done=true}}}
  XPS[FL]=XT[59];PERKS[FL]=Object.assign({},PERKS[FL]||{},{50:'b'});inv.eq_bow5=1;inv.arrow=50;equipItem('eq_bow5');swing=0;
  face=[1,0];const w={x:P.x+40,y:P.y,hp:200,mhp:200,kx:0,ky:0,type:'wolf',dmg:0};en.push(w);const hp0=w.hp,d0=DMGS.length;const dmg=arrowDmg();
  shootAim(true);for(let i=0;i<60&&w.hp===hp0;i++)upd(1/60);for(let i=0;i<3;i++)upd(1/60);
  const nums=DMGS.slice(d0).map(d=>d.v).filter(v=>/^\d+$/.test(v));return{dmg,lost:hp0-w.hp,nums,hunter:perk(FL,'hunter')}});
 t(r.hunter,'the Hunter perk is on');t.eq(r.lost,r.dmg+2,'the wolf lost the arrow damage + 2 ('+r.dmg+' + 2)');t.eq(r.nums,[String(r.dmg+2)],'and shows one number for it')}};
