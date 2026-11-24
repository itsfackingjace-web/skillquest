// Nov 23 (Kevin): the Smithing perks that give bars back ("save one metal bar", "uses fewer bars") only knew iron and steel bars, so
// on mithril, adamant and meteorite recipes they could save a gem or a log instead, and "fewer bars" never gave those bars back.
module.exports={name:'Smithing perks save and give back mithril bars (not the gem) when forging a mithril wand',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(400);try{if(pnOpen)closePanel()}catch(e){}const out={};
  XPS[10]=XT[85];XPS[13]=XT[60];PERKS[10]={10:'b',80:'b'};out.perks=[perk(10,'sm_saver'),perk(10,'sm_eff')];
  const ri=SM.findIndex(q=>q.k==='eq_wfire_m');if(ri<0)return{err:'no mithril fire wand recipe'};out.c=JSON.stringify(SM[ri].c);
  inv.mbar=2;inv.ruby=1;inv.eq_wfire_m=0;const rnd=Math.random;
  // every chance hits; the bar is listed second so a plain random pick would land on the ruby
  SM[ri].c={ruby:1,mbar:2};Math.random=()=>0;
  try{smithAct(ri,false);for(let k=0;k<60&&window.SQDO;k++){SQDO.d=.1;await W(100)}}finally{Math.random=rnd}
  out.after=[inv.eq_wfire_m|0,inv.mbar|0,inv.ruby|0];return out});
 if(r.err)return t(false,r.err);
 t.eq(r.perks,[true,true],'Metal Saver and Efficient Forge picked');
 t(r.after[0]>=1,'the wand was made: '+r.after[0]);
 t.eq([r.after[1],r.after[2]],[2,0],'both mithril bars come back (one saved, one from "fewer bars"), the ruby is used')}};
