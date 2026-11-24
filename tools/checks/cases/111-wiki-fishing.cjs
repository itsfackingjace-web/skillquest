// Nov 24 (Jace): "the fishing portion of the wiki doesn't have all of the fish and their requirements". Wiki > Skills > Fishing listed
// only shrimp, trout, salmon and swordfish; now every fish the game catches (the 16 the Giant Turtle takes), with its level, where it
// bites and its cooking level, and the Fishing tree names the island fish (278).
module.exports={name:'wiki Fishing lists every fish, where it bites and its levels',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await W(300);
  const RAW=['shrimp','trout','salmon','swordfish','rainbow','pike','gcarp','eeel','lsnap','icod','gchar','vray','cangl','moonfin','abeel','akoi'];
  SQWK.open('skills');await W(30);SQWK.state.sk=9;document.querySelector('#sqwk [data-wks="9"]').click();await W(50);const b=document.getElementById('wkb'),txt=b.textContent;
  const linked=new Set([...b.querySelectorAll('[data-wki]')].map(e=>e.dataset.wki));const rowOf=k=>{const a=b.querySelector('table [data-wki="'+k+'"]');return a?a.closest('tr').textContent:''};
  const o={missing:RAW.filter(k=>!linked.has(k)),pike:rowOf('pike'),moon:rowOf('moonfin'),koi:rowOf('akoi'),rain:rowOf('rainbow'),angl:rowOf('cangl'),
   rod:/fishing rod: make one in the Craft tab \(4 wood and 1 iron ore, Crafting 3\) or buy one for 10 gold/.test(txt),tree:(treeGains(9,15)||[]).some(x=>/pike in the waters of Briarwood Isle/.test(x))};SQWK.close();return o});
 t.eq(r.missing,[],'all 16 fish are in the Fishing table');
 t(/^Raw pike\s*15\s*55\s*Briarwood Isle only\s*15, heals 3/.test(r.pike),'pike: Fishing 15, 55 XP, Briarwood only, Cooking 15 ('+r.pike+')');
 t(/70.*At night, any water; guild ponds\s*70, heals 6/.test(r.moon),'moonfin: 70, at night, guild ponds ('+r.moon+')');
 t(/90.*Rarely, any water \(6% of bites\); guild ponds/.test(r.koi),'ancient koi: 90, rarely anywhere ('+r.koi+')');
 t(/Gull Rock/.test(r.rain)&&/25, heals 5/.test(r.rain),'rainbow fish: Gull Rock, Cooking 25');t(/Shattered Expanse only/.test(r.angl),'crystal angler: the Shattered Expanse');
 t(r.rod,'the Fishing text says where to get a rod');t(r.tree,'the Fishing tree lists the pike at 15')}};
