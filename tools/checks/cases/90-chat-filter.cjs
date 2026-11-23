// Nov 22 (Jace: "it censors some stupid stuff like the word "as" and random numbers. Also, add a censor toggle for adults"):
// the filter leaves ordinary words and numbers alone (squashed matches need as many letters as the word; digits are leetspeak only
// inside words with letters; a long word across words must start at a word and end with at most a short ending; amounts aren't
// phone numbers), still catches the disguised ones; adults can turn it off in Options, and then see other adults' messages as they
// typed them (sent as `r` next to the filtered `m`), while younger players' messages and everyone else's view stay filtered.
const path=require('path');const{RulesDB}=require('../rulesdb.cjs');
module.exports={name:'chat filter: no false alarms on "as" and numbers; adults can turn it off',players:2,async run([A,B],t){
 // ---- the filter itself ----
 const f=await A.evaluate(async()=>{await new Promise(r=>setTimeout(r,500));const c=SQFILTER.clean;
  const keep=['as','I have as much as you','pass the class','this hit hard','go diego','level 45','455 gold','7175','1000000 gold','sell 2500000','a hoe for farming','bobs','his hit','assess the assets','Scotland','grape'];
  const star=['ass','asss','f u c k','fu cking','sh1t','fuuuuck','what the fuck','call me 555 123 4567','mail me at bob@example.com','sh it','a55','phuck off'];
  return{kept:keep.filter(s=>c(s)!==s).map(s=>s+' => '+c(s)),missed:star.filter(s=>c(s)===s)}});
 t.eq(f.kept,[],'ordinary words and numbers that got starred');
 t.eq(f.missed.filter(s=>s!=='phuck off'),[],'swears and contact details that got through');
 // ---- the database rules: `r` only from adults ----
 const D=new RulesDB(path.join(__dirname,'..','..','..','database.rules.json'));const TS={'.sv':'timestamp'};
 D.data={age:{ad:{b:'a'},te:{b:'t'}},guilds:{g1abcd:{info:{n:'Owls',tag:'OWL',col:1,lead:'ad'},m:{ad:{r:'lead'},te:{r:'m'}}}}};
 const rr=[D.update('ad',{'chat/c1':{u:'ad',n:'A',m:'oh ****',r:'oh shit',t:TS}}).ok,D.update('te',{'chat/c2':{u:'te',n:'T',m:'oh ****',r:'oh shit',t:TS}}).ok,
  D.update('te',{'chat/c3':{u:'te',n:'T',m:'oh ****',t:TS}}).ok,D.update('ad',{'pm/te/p1':{f:'ad',n:'A',m:'****',r:'shit',t:TS}}).ok,D.update('te',{'pm/ad/p2':{f:'te',n:'T',m:'****',r:'shit',t:TS}}).ok,
  D.update('ad',{'gchat/g1abcd/x1':{u:'ad',n:'A',m:'****',r:'shit',t:TS}}).ok,D.update('te',{'gchat/g1abcd/x2':{u:'te',n:'T',m:'****',r:'shit',t:TS}}).ok];
 t.eq(rr,[true,false,true,true,false,true,false],'rules [adult chat with r, teen chat with r, teen chat without, adult pm with r, teen pm with r, adult guild with r, teen guild with r]');
 // ---- two players: Ann is an adult, Bob a teen ----
 await B.evaluate(()=>{Object.defineProperty(SQAGE,'band',{get:()=>'t',configurable:true})});
 for(const p of[A,B])await p.evaluate(async()=>{for(let i=0;i<40&&!(window.SQMP&&SQMP.on);i++)await new Promise(r=>setTimeout(r,150))});
 const opt=async p=>p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));showScreen('options');await W(150);const b=pbd.querySelector('.sqcfb');const txt=b&&b.textContent;if(b){b.click();await W(100)}const after=(pbd.querySelector('.sqcfb')||{}).textContent;closePanel();return[txt||null,after||null,SQFILTER.off()]});
 t.eq(await opt(B),[null,null,false],'a teen has no Chat filter switch');
 t.eq(await opt(A),['Chat filter: ON','Chat filter: OFF',true],'an adult turns the filter off');
 const lines=p=>p.evaluate(()=>SQMP.log.filter(e=>e.k==='pub').map(e=>e.m));
 await A.evaluate(()=>mpSend('well this is shit'));await A.waitForTimeout(1500);await B.evaluate(()=>mpSend('oh shit as well'));await B.waitForTimeout(1500);
 const la=await lines(A),lb=await lines(B);
 t(la.includes('well this is shit'),'Ann (filter off) sees her own message as typed: '+JSON.stringify(la));
 t(lb.includes('well this is ****'),'Bob (a teen) sees Ann\'s message filtered: '+JSON.stringify(lb));
 t(la.includes('oh **** as well')&&lb.includes('oh **** as well'),'Bob\'s message is filtered for everyone, "as" stays: '+JSON.stringify([la,lb]));
 // Ann turns the filter back on: the chat window follows
 await opt(A);const la2=await lines(A);t(la2.includes('well this is ****')&&!la2.includes('well this is shit'),'filter back on: '+JSON.stringify(la2));
 // a private message from Ann with the filter off again: Bob sees it filtered, Ann's own copy as typed
 await opt(A);await A.waitForTimeout(1300);await A.evaluate(()=>mpSend('/w BOB holy shit'));await A.waitForTimeout(1500);
 const pa=await A.evaluate(()=>SQMP.log.filter(e=>e.k==='pm').map(e=>e.m)),pb=await B.evaluate(()=>SQMP.log.filter(e=>e.k==='pm').map(e=>e.m));
 t(pa.includes('holy shit')&&pb.includes('holy ****'),'private message [Ann\'s copy, Bob\'s]: '+JSON.stringify([pa,pb]))}};
