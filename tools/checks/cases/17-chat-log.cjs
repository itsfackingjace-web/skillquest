// Dev Suite > Chat log reads public chat: newest page first, older pages by key, and the "possible bugs" filter.
module.exports={name:'chat log reads chat and finds messages about bugs',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const F=window.SQFB,d=F.db;
  for(let i=0;i<12;i++)await d.set(d.ref(F.D,'chat/m'+String(i).padStart(3,'0')),{u:'zed',n:'Zed',m:i===3?'my chest items disappeared after reload':i===7?'the stairs are bugged lol':'hello '+i,t:Date.now()-60000+i});
  await SQCHATLOG.load();await W(100);const n=SQCHATLOG.msgs.length,txt=SQCHATLOG.text();
  return{n,lines:txt.split('\n').length,has3:txt.includes('disappeared'),has7:txt.includes('bugged'),hello:txt.includes('hello 1')}});
 t(r.n>=12,'loaded '+r.n+' messages');t.eq([r.has3,r.has7,r.hello,r.lines],[true,true,false,2],'possible-bug lines')}};
