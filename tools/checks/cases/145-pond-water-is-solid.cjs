// Nov 28 (Applez, in-game report "can walk on water", expected "to not be able to walk on the koi fish pond"): a guild pond (222's
// SQPONDS.apply) turned its cells into water tiles, but rooms walk by R.solid, so you could walk across the pond. Its water is solid
// now, and the ground opens up again when the pond is dug up.
module.exports={name:'a guild pond can\'t be walked on, and its ground opens again when dug up',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);try{loadRegion('briarwood')}catch(e){return{err:String(e)}}await W(300);
  const R=SCENE&&SCENE.room;if(!R)return{err:'no room'};const sp=R.spawn;let c=-1;
  for(let d=3;d<40&&c<0;d++)for(let y=sp[1]-d;y<=sp[1]+d&&c<0;y++)for(let x=sp[0]-d;x<=sp[0]+d;x++){let ok=true;for(let b=-1;b<=1&&ok;b++)for(let a=-1;a<=1;a++){const i=(y+b)*R.w+x+a;if(R.tiles[i]===0||R.solid.has(i)){ok=false;break}}if(ok){c=y*R.w+x;break}}
  if(c<0)return{err:'no open ground'};const cells=(R2,k)=>{const x=k%R2.w,y=(k/R2.w)|0,o=[];for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)o.push((y+b)*R2.w+x+a);return o};
  const at=k=>[(k%R.w)*16+8,((k/R.w)|0)*16+8];const out={before:solid(...at(c))};
  SQPONDS.apply(R,{[c]:'gp_koi'},cells);out.pond=[R.tiles[c],solid(...at(c)),solid(...at(c+1))];
  SQPONDS.apply(R,{},cells);out.dug=[R.tiles[c]!==0,solid(...at(c)),solid(...at(c+1))];try{leaveScene()}catch(e){/*quiet*/}return out});
 if(r.err){t(false,r.err);return}
 t.eq(r.before,false,'open ground before the pond');
 t.eq(r.pond,[0,true,true],'the pond [water tile, its middle is solid, its edge is solid]');
 t.eq(r.dug,[true,false,false],'dug up [ground again, middle open, edge open]')}};
