// Caught code errors reach errs/<site> once per place per session; harmless ones (network, audio) and non-code errors stay local.
module.exports={name:'caught code errors are reported once',async run(p,t){
 const r=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));
  // Nov 22: a site already on record (from another session) still counts up and gets this version: no read needed (players can't read errs)
  {const F=SQFB,d=F.db;await d.set(d.ref(F.D,'errs/chk-4'),{m:'old',n:5,v:'2026.01.01-1',t:1})}window.__noRead=['errs/'];try{null.z}catch(e){SQERR(e,'chk-4')}
  try{null.x}catch(e){SQERR(e,'chk-1')}try{null.y}catch(e){SQERR(e,'chk-1')}SQERR(new TypeError('Failed to fetch'),'chk-2');SQERR(new Error('plain'),'chk-3');
  await W(800);const F=SQFB,d=F.db,v=(await d.get(d.ref(F.D,'errs'))).val()||{};
  return{four:v['chk-4']&&[v['chk-4'].n,v['chk-4'].v===self.SQVER,/null/.test(v['chk-4'].m)],one:v['chk-1']&&v['chk-1'].n,msg:v['chk-1']&&v['chk-1'].m,two:!!v['chk-2'],three:!!v['chk-3'],local:SQERR.log.get('chk-1').n}});
 t.eq([r.one,r.two,r.three,r.local],[1,false,false,2],'sent once, benign and plain errors kept local');t(/TypeError/.test(r.msg||''),'message kept: '+r.msg);t.eq(r.four,[6,true,true],'a site already on record [count, this version, new message]')}};
